import { z } from "zod";
import { courses, services } from "../data/catalog.js";
import { Enrollment, Payment, ServiceRequest } from "../models/index.js";
import { invoiceNumber } from "./payments.routes.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncRoute } from "../middleware/asyncRoute.js";

const enrollmentInput = z.object({
  courseId: z.string().min(1).max(20),
  paymentMethod: z.enum(["khalti", "esewa", "bank_transfer"]),
});

const serviceInput = z.object({
  service: z.string().min(1).max(120),
  contactPerson: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(5).max(32),
  details: z.string().trim().min(10).max(5000),
});

export function createCommerceRouter(express, config) {
  const router = express.Router();

  router.get("/courses", (_req, res) => res.json({ courses }));
  router.get("/services", (_req, res) => res.json({ services }));

  router.post("/enrollments", requireAuth(config), requireRole("student"), asyncRoute(async (req, res) => {
    const input = enrollmentInput.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: "Select a valid course and payment method." });

    const course = courses.find((item) => item.id === input.data.courseId);
    if (!course) return res.status(404).json({ error: "Course not found." });

    const existing = await Enrollment.findOne({ user: req.user.id, courseId: course.id });
    if (existing) return res.status(409).json({ error: "You already have an enrollment for this course." });

    const enrollment = await Enrollment.create({
      user: req.user.id,
      courseId: course.id,
      courseTitle: course.title,
      category: course.category,
      amountNPR: course.priceNPR,
    });

    try {
      const payment = await Payment.create({
        user: req.user.id,
        enrollment: enrollment.id,
        description: course.title,
        amountNPR: course.priceNPR,
        provider: input.data.paymentMethod,
        invoiceNumber: invoiceNumber(),
      });
      return res.status(201).json({
        enrollment,
        payment,
        checkoutPath: `/api/payments/${payment.id}/checkout`,
      });
    } catch (error) {
      await Enrollment.deleteOne({ _id: enrollment.id, status: "pending_payment" });
      throw error;
    }
  }));

  router.post("/service-requests", requireAuth(config), requireRole("company"), asyncRoute(async (req, res) => {
    const input = serviceInput.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: "Provide a service, contact name, phone, and project details." });
    if (!services.includes(input.data.service)) {
      return res.status(400).json({ error: "Choose a service from the service catalog." });
    }

    const serviceRequest = await ServiceRequest.create({
      user: req.user.id,
      companyName: req.user.companyName || req.user.name,
      contactPerson: input.data.contactPerson,
      email: req.user.email,
      phone: input.data.phone,
      service: input.data.service,
      details: input.data.details,
    });
    return res.status(201).json({ serviceRequest });
  }));

  return router;
}
