// ─────────────────────────────────────────────────────────────
// OTP SEND RATE LIMITING — FAIL-CLOSED (hardening v2, item E).
// Every threshold lives in the pure otpLimitDecision() so it is unit-testable
// without Redis. The Redis-backed wrapper reads the windows, decides, and — on
// a PROD Redis error — FAILS CLOSED (blocks): a login outage beats draining the
// SMS balance to an attacker. (This makes a Redis outage a login outage BY
// DESIGN — the accepted trade recorded in OTP_LAUNCH_NOTES.md.) In dev, a
// Redis miss is permissive so local work isn't blocked.
//
// Limits: 60s minimum between sends to the same phone; per-phone 3/15min and
// 10/24h; per-IP 20/hour. On a block: 429 + Devanagari message + Retry-After
// header + retryAfterSec in the body (wired in the controller).
// ─────────────────────────────────────────────────────────────
import { env } from "../config/env";
import { getRedis } from "./redis";
import { logger } from "../utils/logger";

export const OTP_LIMITS = {
  MIN_INTERVAL_SEC: 60,
  PER_PHONE_15MIN: 3,
  PER_PHONE_15MIN_WINDOW_SEC: 15 * 60,
  PER_PHONE_24H: 10,
  PER_PHONE_24H_WINDOW_SEC: 24 * 60 * 60,
  PER_IP_HOUR: 20,
  PER_IP_WINDOW_SEC: 60 * 60,
} as const;

export type OtpLimitReason =
  | "cooldown" | "per_phone_15min" | "per_phone_24h" | "per_ip_hour" | "backend_unavailable";

export interface OtpLimitCounts {
  /** seconds since this phone's last send, or null if none recorded */
  secondsSinceLastSend: number | null;
  sends15min: number;
  sends24h: number;
  ipSendsHour: number;
}

export interface OtpLimitDecision {
  allowed: boolean;
  retryAfterSec: number;
  reason?: OtpLimitReason;
}

/** PURE — the whole policy, testable without Redis. First failing rule wins;
 *  the cooldown yields the exact remaining seconds, the window rules yield the
 *  window length (a safe upper bound the client shows as "try later"). */
export function otpLimitDecision(c: OtpLimitCounts): OtpLimitDecision {
  if (c.secondsSinceLastSend !== null && c.secondsSinceLastSend < OTP_LIMITS.MIN_INTERVAL_SEC) {
    return { allowed: false, retryAfterSec: OTP_LIMITS.MIN_INTERVAL_SEC - c.secondsSinceLastSend, reason: "cooldown" };
  }
  if (c.sends15min >= OTP_LIMITS.PER_PHONE_15MIN) {
    return { allowed: false, retryAfterSec: OTP_LIMITS.PER_PHONE_15MIN_WINDOW_SEC, reason: "per_phone_15min" };
  }
  if (c.sends24h >= OTP_LIMITS.PER_PHONE_24H) {
    return { allowed: false, retryAfterSec: OTP_LIMITS.PER_PHONE_24H_WINDOW_SEC, reason: "per_phone_24h" };
  }
  if (c.ipSendsHour >= OTP_LIMITS.PER_IP_HOUR) {
    return { allowed: false, retryAfterSec: OTP_LIMITS.PER_IP_WINDOW_SEC, reason: "per_ip_hour" };
  }
  return { allowed: true, retryAfterSec: 0 };
}

/** Devanagari message per reason — spoken/shown to the pandit (register-clean). */
export function otpLimitMessage(reason: OtpLimitReason | undefined, retryAfterSec: number): string {
  switch (reason) {
    case "cooldown":
      return `कृपया ${retryAfterSec} सेकंड बाद दोबारा भेजिए।`;
    case "per_phone_15min":
    case "per_phone_24h":
      return "बहुत बार ओटीपी भेजा जा चुका है। कृपया थोड़ी देर बाद फिर कोशिश कीजिए।";
    case "per_ip_hour":
      return "इस डिवाइस से बहुत बार कोशिश हुई है। कृपया कुछ समय बाद फिर कोशिश कीजिए।";
    case "backend_unavailable":
    default:
      return "अभी ओटीपी सेवा उपलब्ध नहीं है। कृपया थोड़ी देर बाद फिर कोशिश कीजिए।";
  }
}

/**
 * Read the windows from Redis, decide, and record the send if allowed.
 * FAIL-CLOSED in production on any Redis error. Returns the decision; the
 * caller emits 429 + Retry-After when !allowed.
 */
export async function checkOtpSendRateLimit(phone: string, ip: string): Promise<OtpLimitDecision> {
  const redis = await getRedis();
  if (!redis) {
    if (env.NODE_ENV === "production") {
      logger.error("[OTP-RL] Redis unavailable in production — FAILING CLOSED for OTP send.");
      return { allowed: false, retryAfterSec: 60, reason: "backend_unavailable" };
    }
    return { allowed: true, retryAfterSec: 0 }; // dev grace
  }

  const kLast = `otp:last:${phone}`;
  const k15 = `otp:c15:${phone}`;
  const k24 = `otp:c24:${phone}`;
  const kIp = `otp:ip:${ip}`;
  const nowSec = Math.floor(Date.now() / 1000);

  try {
    const [lastRaw, c15Raw, c24Raw, ipRaw] = await redis.mget(kLast, k15, k24, kIp);
    const counts: OtpLimitCounts = {
      secondsSinceLastSend: lastRaw ? nowSec - parseInt(lastRaw, 10) : null,
      sends15min: c15Raw ? parseInt(c15Raw, 10) : 0,
      sends24h: c24Raw ? parseInt(c24Raw, 10) : 0,
      ipSendsHour: ipRaw ? parseInt(ipRaw, 10) : 0,
    };
    const decision = otpLimitDecision(counts);
    if (!decision.allowed) return decision;

    // record the send atomically
    const multi = redis.multi();
    multi.set(kLast, String(nowSec), "EX", OTP_LIMITS.MIN_INTERVAL_SEC);
    multi.incr(k15);
    if (counts.sends15min === 0) multi.expire(k15, OTP_LIMITS.PER_PHONE_15MIN_WINDOW_SEC);
    multi.incr(k24);
    if (counts.sends24h === 0) multi.expire(k24, OTP_LIMITS.PER_PHONE_24H_WINDOW_SEC);
    multi.incr(kIp);
    if (counts.ipSendsHour === 0) multi.expire(kIp, OTP_LIMITS.PER_IP_WINDOW_SEC);
    await multi.exec();
    return decision;
  } catch (err) {
    // FAIL CLOSED in prod — do NOT drain the SMS balance on a Redis hiccup.
    logger.error(`[OTP-RL] Redis error during OTP rate-limit: ${(err as Error).message}`);
    if (env.NODE_ENV === "production") {
      return { allowed: false, retryAfterSec: 60, reason: "backend_unavailable" };
    }
    return { allowed: true, retryAfterSec: 0 };
  }
}
