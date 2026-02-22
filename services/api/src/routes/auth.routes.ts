import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { otpLimiter, authLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validator";
import {
  sendOtp,
  verifyOtp,
  getMe,
  updateMe,
} from "../controllers/auth.controller";

const router: Router = Router();

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

/**
 * POST /auth/request-otp
 * Send OTP to a phone number.
 */
router.post(
  "/request-otp",
  otpLimiter,
  validate(requestOtpSchema),
  sendOtp
);

/**
 * POST /auth/send-otp
 * Alias for /request-otp (spec compatibility).
 */
router.post(
  "/send-otp",
  otpLimiter,
  validate(requestOtpSchema),
  sendOtp
);

/**
 * POST /auth/verify-otp
 * Verify OTP and return access + refresh tokens.
 */
router.post(
  "/verify-otp",
  authLimiter,
  validate(verifyOtpSchema),
  verifyOtp
);

/**
 * POST /auth/logout
 * Invalidate the current session.
 */
router.post("/logout", authenticate, (req, res) => {
  // JWT-only auth: client clears tokens from localStorage.
  res.json({ success: true, message: "Logged out successfully" });
});

/**
 * GET /auth/me
 * Return the currently authenticated user's full profile.
 */
router.get("/me", authenticate, getMe);

/**
 * PATCH /auth/me
 * Update profile.
 */
router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  updateMe
);

export default router;
