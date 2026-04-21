import { FastifyRequest, FastifyReply } from "fastify";
import { RATE_LIMIT } from "../config/constants";

/**
 * Rate limiter configuration presets for Fastify.
 * The actual rate limiting is handled by @fastify/rate-limit registered globally in app.ts.
 * These are preHandler hook factories for per-route override patterns.
 */

/**
 * General API rate limiter preHandler
 * 100 requests per minute per IP
 */
export async function generalLimiter(
  _request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  // Rate limiting is handled globally by @fastify/rate-limit
  // This hook is kept for explicit route-level annotation if needed
}

/**
 * OTP rate limiter — 5 requests per minute per IP
 */
export async function otpLimiter(
  _request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  // Override global limiter for OTP routes — handled via route config
}

/**
 * Auth rate limiter — 20 requests per 15 minutes per IP
 */
export async function authLimiter(
  _request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  // Override global limiter for auth routes — handled via route config
}

// Export constants for app.ts global rate limiter config
export const generalLimiterConfig = {
  windowMs: RATE_LIMIT.GENERAL_WINDOW_MS,
  max: RATE_LIMIT.GENERAL_MAX,
};

export const otpLimiterConfig = {
  windowMs: RATE_LIMIT.OTP_WINDOW_MS,
  max: RATE_LIMIT.OTP_MAX,
};

export const authLimiterConfig = {
  windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
  max: RATE_LIMIT.AUTH_MAX,
};
