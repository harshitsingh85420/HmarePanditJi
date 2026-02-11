import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { otpLimiter, authLimiter } from "../middleware/rateLimiter";
import { sendSuccess } from "../utils/response";

const router = Router();

/**
 * POST /auth/request-otp
 * Send OTP to a phone number. Requires body: { phone: "+91XXXXXXXXXX" }
 */
router.post("/request-otp", otpLimiter, (_req, res) => {
  sendSuccess(res, null, "OTP sent (stub — sprint 2)");
});

/**
 * POST /auth/verify-otp
 * Verify OTP and return access + refresh tokens.
 * Body: { phone: "+91XXXXXXXXXX", otp: "123456" }
 */
router.post("/verify-otp", authLimiter, (_req, res) => {
  sendSuccess(
    res,
    { accessToken: "jwt-stub", refreshToken: "refresh-stub", user: null },
    "OTP verified (stub — sprint 2)",
  );
});

/**
 * POST /auth/refresh
 * Exchange a valid refresh token for a new access token.
 * Body: { refreshToken: "..." }
 */
router.post("/refresh", authLimiter, (_req, res) => {
  sendSuccess(res, { accessToken: "jwt-stub" }, "Token refreshed (stub)");
});

/**
 * POST /auth/logout
 * Invalidate the current session. Requires Authorization header.
 */
router.post("/logout", authenticate, (_req, res) => {
  sendSuccess(res, null, "Logged out successfully (stub)");
});

/**
 * GET /auth/me
 * Return the currently authenticated user's profile.
 */
router.get("/me", authenticate, (req, res) => {
  sendSuccess(res, { user: req.user }, "Current user (stub)");
});

export default router;
