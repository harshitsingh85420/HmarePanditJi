import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { otpLimiter, authLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validator";
import { sendSuccess } from "../utils/response";
import {
  requestOtp,
  verifyOtp,
  refreshAccessToken,
  updateUserProfile,
  getFullUser,
} from "../services/auth.service";

const router: Router = Router();

// ── Schemas ───────────────────────────────────────────────────────────────────

const requestOtpSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number required")
    .regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid Indian mobile number"),
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
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token required"),
});

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .optional(),
  email: z.string().email("Invalid email").optional().nullable(),
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
  async (req, res, next) => {
    try {
      const { phone } = req.body as z.infer<typeof requestOtpSchema>;
      const result = await requestOtp(phone);
      sendSuccess(res, result.devOtp ? { devOtp: result.devOtp } : null, "OTP sent successfully");
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /auth/verify-otp
 * Verify OTP and return access + refresh tokens.
 */
router.post(
  "/verify-otp",
  authLimiter,
  validate(verifyOtpSchema),
  async (req, res, next) => {
    try {
      const { phone, otp, role } = req.body as z.infer<typeof verifyOtpSchema>;
      const result = await verifyOtp(phone, otp, role);
      sendSuccess(res, result, "OTP verified successfully");
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /auth/refresh
 * Exchange a valid refresh token for a new access token.
 */
router.post(
  "/refresh",
  authLimiter,
  validate(refreshSchema),
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body as z.infer<typeof refreshSchema>;
      const result = await refreshAccessToken(refreshToken);
      sendSuccess(res, result, "Token refreshed");
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /auth/logout
 * Invalidate the current session.
 */
router.post("/logout", authenticate, (_req, res) => {
  // JWT-only auth: client clears tokens from localStorage.
  sendSuccess(res, null, "Logged out successfully");
});

/**
 * GET /auth/me
 * Return the currently authenticated user's full profile.
 */
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await getFullUser(req.user!.id);
    sendSuccess(res, { user }, "Current user");
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /auth/me
 * Update profile (name + email) — used after new user registration.
 */
router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  async (req, res, next) => {
    try {
      const data = req.body as z.infer<typeof updateProfileSchema>;
      const user = await updateUserProfile(req.user!.id, data);
      sendSuccess(res, { user }, "Profile updated");
    } catch (err) {
      next(err);
    }
  },
);

export default router;
