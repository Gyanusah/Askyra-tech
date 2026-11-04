import { z } from "zod";
import { Enrollment, Payment, ServiceRequest, User } from "../models/index.js";
import { invoiceNumber } from "./payments.routes.js";
import { requireRole } from "../middleware/auth.js";
import { asyncRoute } from "../middleware/asyncRoute.js";

const progressInput = z.object({
  progress: z.number().int().min(0).max(100),
  nextLesson: z.string().trim().min(2).max(240).optional(),
});

const serviceUpdateInput = z.object({
  status: z.enum(["submitted", "reviewing", "in_progress", "completed", "rejected"]).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  milestone: z.string().trim().min(2).max(240).optional(),
  update: z.string().trim().min(2).max(500).optional(),
  priceNPR: z.number().int().positive().max(100000000).optional(),
}).refine((value) => Object.keys(value).length > 0);

const bankTransferInput = z.object({
  status: z.enum(["paid", "failed"]),
  note: z.string().trim().min(4).max(500),
});

const serviceInvoiceInput = z.object({
  amountNPR: z.number().int().positive().max(100000000),
});

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    companyName: user.companyName,
    email: user.email,
    role: user.role,
    phone: user.phone,
    createdAt: user.createdAt,
    isActive: user.isActive,
  };
}

export function createDashboardRouter(express) {
  const router = express.Router();

  router.get("/dashboard/student", requireRole("student"), asyncRoute(async (req, res) => {
    const [enrollments, payments] = await Promise.all([
      Enrollment.find({ user: req.user.id }).sort({ createdAt: -1 }).lean(),
      Payment.find({ user: req.user.id }).sort({ createdAt: -1 }).lean(),
    ]);
    return res.json({ user: publicUser(req.user), enrollments, payments });
  }));

  router.get("/dashboard/company", requireRole("company"), asyncRoute(async (req, res) => {
    const [serviceRequests, payments] = await Promise.all([
      ServiceRequest.find({ user: req.user.id }).sort({ createdAt: -1 }).lean(),
      Payment.find({ user: req.user.id }).sort({ createdAt: -1 }).lean(),
    ]);
    return res.json({ user: publicUser(req.user), serviceRequests, payments });
  }));

  router.get("/dashboard/admin", requireRole("admin"), asyncRoute(async (_req, res) => {
    const [users, enrollments, serviceRequests, payments, counts] = await Promise.all([
      User.find({ role: { $in: ["student", "company"] } }).sort({ createdAt: -1 }).lean(),
      Enrollment.find().sort({ updatedAt: -1 }).lean(),
      ServiceRequest.find().sort({ updatedAt: -1 }).lean(),
      Payment.find().sort({ createdAt: -1 }).limit(200).lean(),
      Promise.all([
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "company" }),
        Enrollment.countDocuments({ status: { $in: ["active", "completed"] } }),
        ServiceRequest.countDocuments({ status: { $in: ["reviewing", "in_progress"] } }),
        Payment.countDocuments({ status: "paid" }),
        Payment.countDocuments({ status: "pending" }),
      ]),
    ]);

    const [students, companies, activeEnrollments, activeServices, paidPayments, pendingPayments] = counts;
    return res.json({
      counts: { students, companies, activeEnrollments, activeServices, paidPayments, pendingPayments },
      users: users.map(publicUser),
      enrollments,
      serviceRequests,
      payments,
    });
  }));

  router.patch("/admin/enrollments/:id/progress", requireRole("admin"), asyncRoute(async (req, res) => {
    const input = progressInput.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: "Progress must be a whole number between 0 and 100." });
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ error: "Enrollment not found." });
    if (input.data.progress > 0 && !["active", "completed"].includes(enrollment.status)) {
      return res.status(409).json({ error: "An enrollment must be active before progress can be recorded." });
    }
    enrollment.progress = input.data.progress;
    if (input.data.nextLesson) enrollment.nextLesson = input.data.nextLesson;
    if (input.data.progress === 100) enrollment.status = "completed";
    if (input.data.progress < 100 && enrollment.status === "completed") enrollment.status = "active";
    await enrollment.save();
    return res.json({ enrollment });
  }));

  router.patch("/admin/service-requests/:id", requireRole("admin"), asyncRoute(async (req, res) => {
    const input = serviceUpdateInput.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: "Provide a valid service update." });
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Service request not found." });
    const { update, ...fields } = input.data;
    Object.assign(request, fields);
    if (update) request.updates.push({ message: update });
    if (request.updates.length > 25) request.updates.splice(0, request.updates.length - 25);
    await request.save();
    return res.json({ serviceRequest: request });
  }));

  router.post("/admin/service-requests/:id/invoice", requireRole("admin"), asyncRoute(async (req, res) => {
    const input = serviceInvoiceInput.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: "Provide a valid invoice amount in NPR." });
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Service request not found." });
    const payment = await Payment.create({
      user: request.user,
      serviceRequest: request.id,
      description: request.service,
      amountNPR: input.data.amountNPR,
      provider: "bank_transfer",
      invoiceNumber: invoiceNumber(),
    });
    request.priceNPR = input.data.amountNPR;
    request.status = "reviewing";
    await request.save();
    return res.status(201).json({ payment });
  }));

  router.patch("/admin/payments/:id/bank-transfer", requireRole("admin"), asyncRoute(async (req, res) => {
    const input = bankTransferInput.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: "Provide a valid payment decision and note." });
    const payment = await Payment.findOne({
      _id: req.params.id,
      provider: "bank_transfer",
      status: "pending",
    });
    if (!payment) return res.status(404).json({ error: "Pending bank transfer not found." });

    payment.status = input.data.status;
    payment.adminNote = input.data.note;
    payment.paidAt = input.data.status === "paid" ? new Date() : null;
    await payment.save();
    if (payment.status === "paid" && payment.enrollment) {
      await Enrollment.updateOne({ _id: payment.enrollment }, { $set: { status: "active" } });
    }
    if (payment.status === "paid" && payment.serviceRequest) {
      await ServiceRequest.updateOne(
        { _id: payment.serviceRequest },
        { $set: { status: "in_progress" } },
      );
    }
    return res.json({ payment });
  }));

  return router;
}
