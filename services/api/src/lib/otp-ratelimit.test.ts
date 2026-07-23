import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { otpLimitDecision, OTP_LIMITS, otpLimitMessage } from "./otpRateLimit";

// ─────────────────────────────────────────────────────────────
// BUILD-FAILING GUARD — OTP SEND RATE LIMIT (hardening v2, item E).
// Pins each limit via the PURE decision function, the fail-closed direction in
// the Redis wrapper source, and that BOTH send paths call the limiter and emit
// Retry-After. Thresholds live in otpLimitDecision so they are unit-testable
// without Redis.
// ─────────────────────────────────────────────────────────────

console.log("Running otp-ratelimit guard (thresholds + fail-closed + both paths)…");

const ok = { secondsSinceLastSend: null as number | null, sends15min: 0, sends24h: 0, ipSendsHour: 0 };

// baseline: a fresh phone/ip is allowed
assert.strictEqual(otpLimitDecision(ok).allowed, true, "a first send must be allowed");

// 60s minimum interval — and the retryAfter is the remaining seconds
const cd = otpLimitDecision({ ...ok, secondsSinceLastSend: 10 });
assert.strictEqual(cd.allowed, false, "a resend within 60s must be blocked");
assert.strictEqual(cd.reason, "cooldown");
assert.strictEqual(cd.retryAfterSec, 50, "cooldown retryAfter = remaining seconds");
assert.strictEqual(otpLimitDecision({ ...ok, secondsSinceLastSend: 60 }).allowed, true, "exactly 60s later is allowed");

// per-phone 3 / 15 min
assert.strictEqual(otpLimitDecision({ ...ok, sends15min: 2 }).allowed, true, "3rd send (count=2) allowed");
assert.strictEqual(otpLimitDecision({ ...ok, sends15min: 3 }).reason, "per_phone_15min", "4th within 15min blocked");
// per-phone 10 / 24h
assert.strictEqual(otpLimitDecision({ ...ok, sends24h: 10 }).reason, "per_phone_24h", "11th within 24h blocked");
// per-IP 20 / hour
assert.strictEqual(otpLimitDecision({ ...ok, ipSendsHour: 20 }).reason, "per_ip_hour", "21st from one IP blocked");

// the constants match the spec
assert.strictEqual(OTP_LIMITS.MIN_INTERVAL_SEC, 60);
assert.strictEqual(OTP_LIMITS.PER_PHONE_15MIN, 3);
assert.strictEqual(OTP_LIMITS.PER_PHONE_24H, 10);
assert.strictEqual(OTP_LIMITS.PER_IP_HOUR, 20);

// blocked messages are Devanagari (register-clean), never a raw English error
for (const reason of ["cooldown", "per_phone_15min", "per_ip_hour", "backend_unavailable"] as const) {
  const m = otpLimitMessage(reason, 42);
  assert.ok(/[ऀ-ॿ]/.test(m), `message for ${reason} must be Devanagari`);
  assert.ok(!/[a-zA-Z]/.test(m), `message for ${reason} must be roman-free (UI string, register law)`);
}

// FAIL-CLOSED in prod — pinned in the wrapper source (the exits can't run here)
const rlSrc = readFileSync(join(__dirname, "otpRateLimit.ts"), "utf8");
assert.ok(/env\.NODE_ENV === "production"[\s\S]{0,180}allowed: false/.test(rlSrc), "prod Redis-unavailable path must FAIL CLOSED (allowed:false)");
assert.ok(/catch[\s\S]{0,220}env\.NODE_ENV === "production"[\s\S]{0,60}allowed: false/.test(rlSrc), "prod Redis-ERROR path must FAIL CLOSED");

// both send paths call the limiter and emit Retry-After
const controller = readFileSync(join(__dirname, "..", "controllers", "auth.controller.ts"), "utf8");
const sendOtpBlock = controller.slice(controller.indexOf("export const sendOtp "), controller.indexOf("export const verifyOtp "));
const sendOtpNewBlock = controller.slice(controller.indexOf("export const sendOtpNew "), controller.indexOf("export const verifyOtpNew "));
for (const [name, block] of [["sendOtp", sendOtpBlock], ["sendOtpNew", sendOtpNewBlock]] as const) {
  assert.ok(block.includes("checkOtpSendRateLimit("), `${name} must call checkOtpSendRateLimit`);
  assert.ok(/reply\.header\("Retry-After"/.test(block), `${name} must set the Retry-After header on a block`);
  assert.ok(block.includes("retryAfterSec:"), `${name} must return retryAfterSec in the body`);
}
// the old fail-OPEN limiter is gone from the OTP paths
assert.ok(!controller.includes("checkRateLimit("), "the old fail-OPEN checkRateLimit must not remain in the OTP controller");

console.log("otp-ratelimit guard: thresholds pinned, Devanagari messages, fail-closed in prod, both paths + Retry-After ✅");
