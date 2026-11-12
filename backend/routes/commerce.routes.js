import { z } from "zod";
import nodemailer from "nodemailer";
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
  companyName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(5).max(32),
  service: z.string().min(1).max(120),
  contactPerson: z.string().trim().min(2).max(120),
  contactEmail: z.string().trim().email().max(254),
  position: z.string().trim().min(2).max(120),
});

export function createCommerceRouter(express, config) {
  const router = express.Router();
  const emailTransport = config.gmailUser && config.gmailAppPassword
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.gmailUser,
          pass: config.gmailAppPassword,
        },
      })
    : null;

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

  router.post("/service-requests", requireAuth(config, { optional: true }), asyncRoute(async (req, res) => {
    const input = serviceInput.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: "Provide valid company and service contact details." });
    if (!services.includes(input.data.service)) {
      return res.status(400).json({ error: "Choose a service from the service catalog." });
    }
    if (!emailTransport) {
      return res.status(503).json({ error: "Service request email delivery is not configured. Please contact AskYRA Tech." });
    }

    const serviceRequest = await ServiceRequest.create({
      user: req.user?.role === "company" ? req.user.id : null,
      ...input.data,
    });
    const reference = String(serviceRequest._id);
    try {
      await emailTransport.sendMail({
        from: `AskYRA Tech <${config.gmailUser}>`,
        to: serviceRequest.email,
        subject: "AskYRA Tech service request reference",
        text: `Hello ${serviceRequest.companyName},\n\nWe received your request for ${serviceRequest.service}.\nYour reference number is ${reference}.\n\nOur team will follow up with you soon.\n\nAskYRA Tech`,
      });
    } catch (error) {
      console.error("Service request confirmation email failed:", error);
      return res.status(502).json({
        error: "Your request was saved, but the reference email could not be sent. Please contact AskYRA Tech and do not submit the request again.",
      });
    }
    return res.status(201).json({
      message: "Service request submitted. The reference number was emailed.",
      email: serviceRequest.email,
    });
  }));

  return router;
}
