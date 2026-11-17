import bcrypt from "bcryptjs";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { z } from "zod";
import { asyncRoute } from "./asyncRoute.js";
import { User } from "../models/index.js";

const passwordSchema = z
  .string()
  .min(12)
  .max(72)
  .refine((password) => Buffer.byteLength(password, "utf8") <= 72)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/);
const signupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  password: passwordSchema,
  role: z.enum(["student", "company"]),
});

const verifyEmailSchema = z.object({
  email: z.string().trim().email().max(254),
  code: z.string().regex(/^\d{6}$/),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
  role: z.enum(["student", "company", "admin"]).optional(),
});

function publicUser(user) {
  return {
    id: String(user._id ?? user.id),
    name: user.name,
    companyName: user.companyName,
    email: user.email,
    role: user.role,
    phone: user.phone,
  };
}

export function createAuthRouter(express, config, rateLimit) {
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
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many authentication attempts. Try again later." },
  });

  function setSessionCookie(res, user) {
    const token = jwt.sign(
      { sub: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: "12h", issuer: "askyra-api", audience: "askyra-web" },
    );
    res.cookie(config.cookieName, token, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: config.cookieSameSite,
      maxAge: 12 * 60 * 60 * 1000,
      path: "/",
    });
  }

  router.post(
    "/signup",
    authLimiter,
    asyncRoute(async (req, res) => {
      const input = signupSchema.safeParse(req.body);
      if (!input.success) {
        return res.status(400).json({
          error:
            "Enter a valid name, email, and account type. Passwords must be at least 12 characters and include uppercase and lowercase letters, a number, and a symbol.",
        });
      }
      if (!emailTransport) {
        return res.status(503).json({
          error: "Email verification is unavailable. Please try again later.",
        });
      }

      const email = input.data.email.toLowerCase();
      const existing = await User.findOne({ email }).select("_id");
      if (existing)
        return res
          .status(409)
          .json({ error: "An account with this email already exists." });

      const passwordHash = await bcrypt.hash(input.data.password, 12);
      const role = input.data.role;
      const code = String(randomInt(100000, 1000000));
      const user = await User.create({
        email,
        passwordHash,
        role,
        name: input.data.name,
        companyName: role === "company" ? input.data.name : "",
        isEmailVerified: false,
        emailVerificationCodeHash: hashVerificationCode(code, config.jwtSecret),
        emailVerificationExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        emailVerificationAttempts: 0,
      });
      try {
        await emailTransport.sendMail({
          from: config.gmailUser,
          to: email,
          subject: "Verify your AskYRA Tech account",
          text: `Your AskYRA Tech verification code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
        });
      } catch (error) {
        await User.deleteOne({ _id: user._id, isEmailVerified: false });
        throw error;
      }
      return res.status(201).json({ verificationRequired: true });
    }),
  );

  router.post(
    "/resend-verification",
    authLimiter,
    asyncRoute(async (req, res) => {
      const input = z.object({
        email: z.string().trim().email().max(254),
      }).safeParse(req.body);
      if (!input.success) {
        return res.status(400).json({ error: "Enter a valid email address." });
      }
      if (!emailTransport) {
        return res.status(503).json({
          error: "Email verification is unavailable. Please try again later.",
        });
      }

      const user = await User.findOne({
        email: input.data.email.toLowerCase(),
        isEmailVerified: false,
      }).select("+emailVerificationCodeHash +emailVerificationExpiresAt +emailVerificationAttempts");
      if (user) {
        const code = String(randomInt(100000, 1000000));
        user.emailVerificationCodeHash = hashVerificationCode(code, config.jwtSecret);
        user.emailVerificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        user.emailVerificationAttempts = 0;
        await user.save();
        await emailTransport.sendMail({
          from: config.gmailUser,
          to: user.email,
          subject: "Your AskYRA Tech verification code",
          text: `Your new AskYRA Tech verification code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
        });
      }
      return res.json({
        message: "If email verification is pending, a new code has been sent.",
      });
    }),
  );

  router.post(
    "/verify-email",
    authLimiter,
    asyncRoute(async (req, res) => {
      const input = verifyEmailSchema.safeParse(req.body);
      if (!input.success) {
        return res.status(400).json({ error: "Enter a valid email and six-digit verification code." });
      }

      const user = await User.findOne({
        email: input.data.email.toLowerCase(),
        isEmailVerified: false,
      }).select("+emailVerificationCodeHash +emailVerificationExpiresAt +emailVerificationAttempts");
      if (!user || !user.emailVerificationCodeHash || !user.emailVerificationExpiresAt) {
        return res.status(400).json({ error: "The verification code is invalid or expired. Please register again." });
      }
      if (user.emailVerificationExpiresAt <= new Date()) {
        await User.deleteOne({ _id: user._id, isEmailVerified: false });
        return res.status(400).json({ error: "The verification code has expired. Please register again." });
      }
      if (user.emailVerificationAttempts >= 5) {
        await User.deleteOne({ _id: user._id, isEmailVerified: false });
        return res.status(429).json({ error: "Too many incorrect codes. Please register again." });
      }

      const suppliedHash = hashVerificationCode(input.data.code, config.jwtSecret);
      const matches = timingSafeEqual(
        Buffer.from(suppliedHash, "hex"),
        Buffer.from(user.emailVerificationCodeHash, "hex"),
      );
      if (!matches) {
        user.emailVerificationAttempts += 1;
        if (user.emailVerificationAttempts >= 5) {
          await User.deleteOne({ _id: user._id, isEmailVerified: false });
        } else {
          await user.save();
        }
        return res.status(400).json({ error: "The verification code is incorrect." });
      }

      user.isEmailVerified = true;
      user.emailVerificationCodeHash = undefined;
      user.emailVerificationExpiresAt = undefined;
      user.emailVerificationAttempts = 0;
      await user.save();
      setSessionCookie(res, user);
      return res.json({ user: publicUser(user) });
    }),
  );

  router.post(
    "/login",
    authLimiter,
    asyncRoute(async (req, res) => {
      const input = loginSchema.safeParse(req.body);
      if (!input.success)
        return res
          .status(400)
          .json({ error: "Enter a valid email and password." });

      const user = await User.findOne({
        email: input.data.email.toLowerCase(),
      }).select("+passwordHash");
      const passwordMatches = user
        ? await bcrypt.compare(input.data.password, user.passwordHash)
        : false;
      if (!user || !passwordMatches || !user.isActive) {
        return res
          .status(401)
          .json({ error: "Email or password is incorrect." });
      }
      if (!user.isEmailVerified) {
        return res.status(403).json({ error: "Verify your email before signing in." });
      }
      if (input.data.role && input.data.role !== user.role) {
        return res
          .status(403)
          .json({ error: "This account does not have the selected role." });
      }

      setSessionCookie(res, user);
      return res.json({ user: publicUser(user) });
    }),
  );

  router.post("/logout", (req, res) => {
    res.clearCookie(config.cookieName, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: config.cookieSameSite,
      path: "/",
    });
    return res.json({ message: "Signed out." });
  });

  router.get("/me", requireAuth(config, { optional: true }), (req, res) =>
    res.json({ user: req.user ? publicUser(req.user) : null }),
  );
  return router;
}

function hashVerificationCode(code, secret) {
  return createHmac("sha256", secret).update(code).digest("hex");
}

export function requireAuth(config, { optional = false } = {}) {
  return (req, res, next) => {
    const token = req.cookies?.[config.cookieName];
    if (!token) {
      return optional
        ? next()
        : res.status(401).json({ error: "Sign in to continue." });
    }
    try {
      const payload = jwt.verify(token, config.jwtSecret, {
        issuer: "askyra-api",
        audience: "askyra-web",
      });
      req.auth = payload;
      User.findById(payload.sub)
        .then((user) => {
          if (!user || !user.isActive || user.role !== payload.role) {
            if (optional) return next();
            return res
              .status(401)
              .json({ error: "Your session is no longer valid." });
          }
          req.user = user;
          return next();
        })
        .catch(next);
    } catch {
      if (optional) return next();
      return res
        .status(401)
        .json({ error: "Your session has expired. Sign in again." });
    }
  };
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "You are not allowed to perform this action." });
    }
    return next();
  };
}
