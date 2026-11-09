import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { asyncRoute } from "./asyncRoute.js";
import { User } from "../models/index.js";

const signupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  role: z.enum(["student", "company"]),
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
            "Enter a valid name, email, password (8+ characters), and account type.",
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
      const user = await User.create({
        email,
        passwordHash,
        role,
        name: input.data.name,
        companyName: role === "company" ? input.data.name : "",
      });
      setSessionCookie(res, user);
      return res.status(201).json({ user: publicUser(user) });
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

  router.get("/me", requireAuth(config), (req, res) =>
    res.json({ user: publicUser(req.user) }),
  );
  return router;
}

export function requireAuth(config) {
  return (req, res, next) => {
    const token = req.cookies?.[config.cookieName];
    if (!token) return res.status(401).json({ error: "Sign in to continue." });
    try {
      const payload = jwt.verify(token, config.jwtSecret, {
        issuer: "askyra-api",
        audience: "askyra-web",
      });
      req.auth = payload;
      User.findById(payload.sub)
        .then((user) => {
          if (!user || !user.isActive || user.role !== payload.role) {
            return res
              .status(401)
              .json({ error: "Your session is no longer valid." });
          }
          req.user = user;
          return next();
        })
        .catch(next);
    } catch {
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
