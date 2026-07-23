import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isStaticOtpAllowed, generateOtp, hashOtp } from "./otp";

// ─────────────────────────────────────────────────────────────
// BUILD-FAILING GUARD — STATIC BYPASS DEAD + REDIS LEGACY PATH (v2, items A+B).
// The live incident this kills: verify-otp accepted "123456" for ANYONE in
// production (confirmed by probe, 2026-07-23), and the legacy path kept OTPs in
// an in-memory Map that a Render cold-start emptied — the pandit's code
// vanished between "send" and "verify".
// Pins:
//   1. isStaticOtpAllowed() is HARD-false in production, flags be damned.
//   2. The static literal exists ONLY inside lib/otp.ts behind that gate —
//      nowhere in the controller, especially not in any verify compare.
//   3. No in-memory Map in the auth controller (item B).
//   4. Both send paths store "<hash>.<role>" with the single-source TTL and
//      call the REAL sender (sendOtpSms).
//   5. Admin login refuses the repo-default hash in production.
// ─────────────────────────────────────────────────────────────

console.log("Running otp-static-kill guard (bypass dead + Redis + admin refuse)…");

// 1) the gate is hard-false in prod — parameter-injected, no env mutation
assert.strictEqual(isStaticOtpAllowed("production", "true"), false, "prod + OTP_DEV_MODE=true must STILL refuse the static OTP");
assert.strictEqual(isStaticOtpAllowed("production", "false"), false, "prod must refuse the static OTP");
assert.strictEqual(isStaticOtpAllowed("development", "true"), true, "dev + flag = the ONLY static window");
assert.strictEqual(isStaticOtpAllowed("development", "false"), false, "dev without the flag = real OTPs");

// hashOtp sanity (the compare primitive)
assert.strictEqual(hashOtp("482913").length, 64, "sha256 hex");
assert.notStrictEqual(hashOtp("482913"), hashOtp("482914"), "distinct OTPs hash differently");
// generateOtp shape (runs in dev/test — may be static here, that's the allowed window)
assert.ok(/^\d{6}$/.test(generateOtp()), "OTP is 6 digits");

// 2) the static literal lives ONLY in lib/otp.ts, adjacent to its gate
const controller = readFileSync(join(__dirname, "..", "controllers", "auth.controller.ts"), "utf8");
assert.ok(!controller.includes('"123456"'), "the static OTP literal must NOT exist in the auth controller (any occurrence = a bypass path)");
const otpLib = readFileSync(join(__dirname, "otp.ts"), "utf8");
const staticCount = (otpLib.match(/"123456"/g) || []).length;
assert.strictEqual(staticCount, 1, "exactly ONE static-OTP literal, in lib/otp.ts");
const staticIdx = otpLib.indexOf('"123456"');
const gateIdx = otpLib.lastIndexOf("isStaticOtpAllowed()", staticIdx);
assert.ok(gateIdx > -1 && staticIdx - gateIdx < 120, "the static literal must sit immediately behind its isStaticOtpAllowed() gate");

// 3) no in-memory OTP Map in the controller
assert.ok(!/new Map<[^>]*OTPRecord/.test(controller) && !/OTPStore/.test(controller.replace(/\/\/[^\n]*/g, "")), "the in-memory OTP Map must never return (cold-start = vanished OTPs)");

// 4) both send paths: hash.role storage with the single-source TTL + real sender
const legacyIdx = controller.indexOf("export const sendOtp ");
const newIdx = controller.indexOf("export const sendOtpNew ");
const legacyBlock = controller.slice(legacyIdx, controller.indexOf("export const", legacyIdx + 10));
const newBlock = controller.slice(newIdx, controller.indexOf("export const verifyOtpNew"));
for (const [name, block] of [["sendOtp", legacyBlock], ["sendOtpNew", newBlock]] as const) {
  assert.ok(/storeOtpHash\(phone, `\$\{hashOtp\(otp\)\}\.\$?\{?(role|PANDIT)\}?`?, OTP_TTL_SECONDS\)/.test(block.replace(/\.PANDIT`/, ".${PANDIT}`")) || /storeOtpHash\(phone, `\$\{hashOtp\(otp\)\}\./.test(block), `${name} must store "<hash>.<role>" via storeOtpHash`);
  assert.ok(block.includes("OTP_TTL_SECONDS"), `${name} must use the single-source TTL`);
  assert.ok(block.includes("sendOtpSms("), `${name} must call the REAL sender`);
  assert.ok(block.includes("generateOtp()"), `${name} must generate via the gated core`);
}
// verify paths compare hashes, never plaintext static
const verifyLegacy = controller.slice(controller.indexOf("export const verifyOtp "), controller.indexOf("export const getMe"));
assert.ok(/hashOtp\(otp\) !== storedHash/.test(verifyLegacy), "legacy verify must hash-compare against Redis");

// 5) admin refuse-login in prod on the default hash
assert.ok(/isDefaultAdminHash\(env\.ADMIN_PASSWORD_HASH\)/.test(controller), "adminLogin must refuse the repo-default hash in production");

console.log("otp-static-kill guard: gate hard-false in prod, one gated literal, Map gone, Redis both paths, admin refuses default hash ✅");
