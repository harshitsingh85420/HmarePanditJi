import rateLimit from "express-rate-limit";
import { RATE_LIMIT } from "../config/constants";

/**
 * General API rate limiter — 100 requests per minute per IP
 */
export const generalLimiter = rateLimit({
  windowMs: RATE_LIMIT.GENERAL_WINDOW_MS,
  max: RATE_LIMIT.GENERAL_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
    error: { code: "RATE_LIMIT_EXCEEDED" },
  },
});

/**
 * OTP rate limiter — 5 requests per minute per IP (prevents OTP abuse)
 */
export const otpLimiter = rateLimit({
  windowMs: RATE_LIMIT.OTP_WINDOW_MS,
  max: RATE_LIMIT.OTP_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests. Please wait 1 minute before retrying.",
    error: { code: "OTP_RATE_LIMIT_EXCEEDED" },
  },
});

/**
 * Auth rate limiter — 20 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
  max: RATE_LIMIT.AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please wait before retrying.",
    error: { code: "AUTH_RATE_LIMIT_EXCEEDED" },
  },
});
