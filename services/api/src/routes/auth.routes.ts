import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { otpLimiter, authLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validator";
import {
  sendOtp,
  verifyOtp,
  getMe,
  updateMe,
  adminLogin,
} from "../controllers/auth.controller";

// ── Schemas ───────────────────────────────────────────────────────────────────

const requestOtpSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number required")
    .regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid Indian mobile number"),
  role: z.enum(["CUSTOMER", "PANDIT"]).optional(),
});

const verifyOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid Indian mobile number"),
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must be numeric"),
  role: z.enum(["CUSTOMER", "PANDIT", "ADMIN"]).optional(),
  name: z.string().optional(),
});

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .optional(),
  email: z.string().email("Invalid email").optional().nullable(),
  preferredLanguages: z.array(z.string()).optional(),
  gotra: z.string().optional(),
});

// ── Routes ────────────────────────────────────────────────────────────────────

export default async function authRoutes(fastify: FastifyInstance, _opts: any) {
  /**
   * POST /auth/request-otp
   * Send OTP to a phone number.
   */
  fastify.post(
    "/request-otp",
    { preHandler: [otpLimiter, validate(requestOtpSchema)] },
    sendOtp
  );

  /**
   * POST /auth/send-otp
   * Alias for /request-otp (spec compatibility).
   */
  fastify.post(
    "/send-otp",
    { preHandler: [otpLimiter, validate(requestOtpSchema)] },
    sendOtp
  );

  /**
   * POST /auth/verify-otp
   * Verify OTP and return access + refresh tokens.
   */
  fastify.post(
    "/verify-otp",
    { preHandler: [authLimiter, validate(verifyOtpSchema)] },
    verifyOtp
  );

  /**
   * POST /auth/admin-login
   * Login for Admin panel
   */
  fastify.post("/admin-login", {}, adminLogin);

  /**
   * POST /auth/logout
   * Invalidate the current session.
   */
  fastify.post("/logout", { preHandler: [authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    // JWT-only auth: client clears tokens from localStorage.
    return reply.send({ success: true, message: "Logged out successfully" });
  });

  /**
   * GET /auth/me
   * Return the currently authenticated user's full profile.
   */
  fastify.get("/me", { preHandler: [authenticate] }, getMe);

  /**
   * PATCH /auth/me
   * Update profile.
   */
  fastify.patch(
    "/me",
    { preHandler: [authenticate, validate(updateProfileSchema)] },
    updateMe
  );
}
