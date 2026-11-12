import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "company", "admin"], required: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 32, default: "" },
    companyName: { type: String, trim: true, maxlength: 160, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const enrollmentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: String, required: true },
    courseTitle: { type: String, required: true },
    category: { type: String, required: true },
    amountNPR: { type: Number, required: true, min: 0 },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    status: { type: String, enum: ["pending_payment", "active", "completed", "cancelled"], default: "pending_payment" },
    nextLesson: { type: String, default: "Course materials will be available after payment." },
  },
  { timestamps: true },
);
enrollmentSchema.index({ user: 1, courseId: 1 }, { unique: true });

const serviceRequestSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    companyName: { type: String, required: true, trim: true, maxlength: 160 },
    contactPerson: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true },
    contactEmail: { type: String, lowercase: true, trim: true, default: "" },
    position: { type: String, trim: true, maxlength: 120, default: "" },
    phone: { type: String, required: true, trim: true, maxlength: 32 },
    service: { type: String, required: true, maxlength: 120 },
    details: { type: String, default: "", maxlength: 5000 },
    status: { type: String, enum: ["submitted", "reviewing", "in_progress", "completed", "rejected"], default: "submitted" },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    milestone: { type: String, default: "Request received", maxlength: 240 },
    priceNPR: { type: Number, min: 0, default: null },
    updates: {
      type: [{ message: { type: String, maxlength: 500 }, createdAt: { type: Date, default: Date.now } }],
      default: [],
    },
  },
  { timestamps: true },
);

const paymentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    enrollment: { type: Schema.Types.ObjectId, ref: "Enrollment", default: null, index: true },
    serviceRequest: { type: Schema.Types.ObjectId, ref: "ServiceRequest", default: null, index: true },
    description: { type: String, required: true, maxlength: 240 },
    amountNPR: { type: Number, required: true, min: 1 },
    currency: { type: String, enum: ["NPR"], default: "NPR" },
    provider: { type: String, enum: ["khalti", "esewa", "bank_transfer"], required: true },
    status: { type: String, enum: ["pending", "paid", "failed", "cancelled"], default: "pending", index: true },
    providerRef: { type: String, default: "" },
    invoiceNumber: { type: String, required: true, unique: true },
    paidAt: { type: Date, default: null },
    adminNote: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true },
);
paymentSchema.index({ provider: 1, providerRef: 1 });

export const User = mongoose.model("User", userSchema);
export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
export const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);
export const Payment = mongoose.model("Payment", paymentSchema);
