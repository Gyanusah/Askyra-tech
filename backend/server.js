import "dotenv/config";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
//import dns from "node:dns";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import { isIP } from "node:net";
import { z } from "zod";
import { createAuthRouter, requireAuth } from "./middleware/auth.js";
import { createCommerceRouter } from "./routes/commerce.routes.js";
import { createDashboardRouter } from "./routes/dashboard.routes.js";
import { createPaymentsRouter } from "./routes/payments.routes.js";
import { User } from "./models/index.js";
import path from "path";
import { fileURLToPath } from "url";

import dns from "dns";
dns.setDefaultResultOrder("ipv6first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_ORIGIN: z.string().url(),
  MONGODB_URI: z.string().min(1),
  MONGODB_DNS_SERVERS: z
    .string()
    .optional()
    .transform((value) =>
      value ? value.split(",").map((server) => server.trim()) : undefined,
    )
    .refine(
      (servers) =>
        !servers ||
        (servers.length > 0 && servers.every((server) => isIP(server) > 0)),
      "Use comma-separated IPv4 or IPv6 addresses for MONGODB_DNS_SERVERS.",
    ),
  JWT_SECRET: z.string().min(32),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(12),
  PAYMENT_MODE: z.enum(["test", "live"]).default("test"),
  PAYMENT_CURRENCY: z.literal("NPR").default("NPR"),
  API_PUBLIC_URL: z.string().url(),
  KHALTI_SECRET_KEY: z.string().default(""),
  KHALTI_BASE_URL: z.string().url().default("https://dev.khalti.com/api/v2"),
  ESEWA_MERCHANT_CODE: z.string().default(""),
  ESEWA_SECRET_KEY: z.string().default(""),
  ESEWA_FORM_URL: z
    .string()
    .url()
    .default("https://rc-epay.esewa.com.np/api/epay/main/v2/form"),
  ESEWA_STATUS_URL: z
    .string()
    .url()
    .default("https://rc.esewa.com.np/api/epay/transaction/status/"),
});

const parsedConfig = configSchema.safeParse(process.env);
if (!parsedConfig.success) {
  console.error(
    "Invalid backend environment configuration:",
    parsedConfig.error.flatten().fieldErrors,
  );
  process.exit(1);
}
const env = parsedConfig.data;
if (env.MONGODB_DNS_SERVERS) {
  dns.setServers(env.MONGODB_DNS_SERVERS);
}
if (
  env.JWT_SECRET.includes("replace-this") ||
  env.ADMIN_PASSWORD.includes("replace-with")
) {
  console.error(
    "Set unique JWT_SECRET and ADMIN_PASSWORD values in backend/.env before starting the API.",
  );
  process.exit(1);
}

const config = {
  jwtSecret: env.JWT_SECRET,
  clientOrigin: env.CLIENT_ORIGIN,
  apiPublicUrl: env.API_PUBLIC_URL.replace(/\/$/, ""),
  cookieName: "askyra_session",
  cookieSecure: env.NODE_ENV === "production",
  cookieSameSite: env.NODE_ENV === "production" ? "none" : "lax",
  paymentMode: env.PAYMENT_MODE,
  khaltiSecretKey: env.KHALTI_SECRET_KEY,
  khaltiBaseUrl: env.KHALTI_BASE_URL.replace(/\/$/, ""),
  esewaMerchantCode: env.ESEWA_MERCHANT_CODE,
  esewaSecretKey: env.ESEWA_SECRET_KEY,
  esewaFormUrl: env.ESEWA_FORM_URL,
  esewaStatusUrl: env.ESEWA_STATUS_URL,
};

const app = express();
app.disable("x-powered-by");
app.use(helmet());
// app.use(
//   cors({
//     origin: env.CLIENT_ORIGIN,
//     credentials: true,
//     methods: ["GET", "POST", "PATCH", "OPTIONS"],
//     allowedHeaders: ["Content-Type"],
//   }),
// );

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());

app.use("/api", (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (origin && origin !== env.CLIENT_ORIGIN) {
    return res.status(403).json({ error: "Request origin is not allowed." });
  }
  return next();
});

app.get("/", (_req, res) => {
  res.json({
    status: mongoose.connection.readyState === 1 ? "ok" : "starting",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    paymentMode: env.PAYMENT_MODE,
  });
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
app.use("/api", apiLimiter);
app.use("/api/auth", createAuthRouter(express, config, rateLimit));
app.use("/api/payments", createPaymentsRouter(express, config));
app.use("/api", createCommerceRouter(express, config));
app.use("/api", requireAuth(config), createDashboardRouter(express));

app.use("/api", (_req, res) =>
  res.status(404).json({ error: "API endpoint not found." }),
);
app.use((error, _req, res, _next) => {
  if (error?.code === 11000) {
    return res
      .status(409)
      .json({ error: "A record with those details already exists." });
  }
  console.error("API request failed:", error);
  const status = Number.isInteger(error?.status) ? error.status : 500;
  return res.status(status).json({
    error:
      status === 500 ? "An unexpected server error occurred." : error.message,
  });
});

async function bootstrapAdmin() {
  const email = env.ADMIN_EMAIL.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      throw new Error("ADMIN_EMAIL is already used by a non-admin account.");
    }
    return;
  }
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  await User.create({
    email,
    passwordHash,
    role: "admin",
    name: "Platform Administrator",
  });
  // console.info(`Bootstrapped administrator account for ${email}.`);
}

// let server;
// async function start() {
//   await mongoose.connect(env.MONGODB_URI);
//   await bootstrapAdmin();
//   server = app.listen(env.PORT, () => {
//     console.info(
//       `AskYRA API listening on port ${env.PORT} (${env.NODE_ENV}, payments: ${env.PAYMENT_MODE}).`,
//     );
//   });
// }

async function shutdown(signal) {
  console.info(`${signal} received; closing API and database connections.`);
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

// start().catch((error) => {
//   console.error("API startup failed:", error);
//   process.exit(1);
// });
