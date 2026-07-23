import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isValidWebOtpOrigin, isDefaultAdminHash, DEFAULT_ADMIN_PASSWORD_HASH } from "../config/env";

// ─────────────────────────────────────────────────────────────
// BUILD-FAILING GUARD — OTP env hardening (v2, items A/C/G).
// Pins: (1) the WebOTP origin validator's right/wrong table (a malformed
// origin baked into an approved DLT template is unfixable without a fresh
// approval); (2) the default-admin-hash refusal predicate; (3) the prod
// FATAL-BOOT blocks exist in env.ts for OTP_DEV_MODE/MOCK_OTP, missing MSG91
// config, unset/malformed origins, and a non-6-char sender ID — the
// ENCRYPTION_KEY discipline applied to auth.
// ─────────────────────────────────────────────────────────────

console.log("Running otp-env guard (origin validator + admin-hash + fatal-boot blocks)…");

// (1) origin validator — RIGHT
for (const good of ["hmarepanditji-pandit.vercel.app", "hmarepanditji-web.vercel.app", "pandit.hmarepanditji.com"]) {
  assert.ok(isValidWebOtpOrigin(good), `valid bare host rejected: ${good}`);
}
// WRONG: scheme / slash / path / port / whitespace / single-label / empty
for (const bad of [
  "https://hmarepanditji-pandit.vercel.app",
  "hmarepanditji-pandit.vercel.app/",
  "hmarepanditji-pandit.vercel.app/login",
  "hmarepanditji-pandit.vercel.app:443",
  " hmarepanditji-pandit.vercel.app",
  "hmarepanditji-pandit.vercel.app ",
  "vercel",
  "",
  undefined,
  "-bad.vercel.app",
  "bad-.vercel.app",
]) {
  assert.ok(!isValidWebOtpOrigin(bad as string | undefined), `malformed origin accepted: "${bad}"`);
}

// (2) default admin hash refused
assert.ok(isDefaultAdminHash(DEFAULT_ADMIN_PASSWORD_HASH), "the repo-public default hash must be flagged");
assert.ok(isDefaultAdminHash(undefined), "a missing hash must be flagged");
assert.ok(!isDefaultAdminHash("$2a$10$somethingRealSetByIsj0000000000000000000000000000000"), "a real hash must pass");

// (3) the fatal-boot blocks exist (source-pinned; the exits themselves can't
//     run in-process without killing the guard runner)
const envSrc = readFileSync(join(__dirname, "..", "config", "env.ts"), "utf8");
const prodBlock = envSrc.slice(envSrc.indexOf('if (env.NODE_ENV === "production") {'));
assert.ok(/OTP_DEV_MODE === "true" \|\| env\.MOCK_OTP === "true"/.test(prodBlock), "prod must FATAL on OTP_DEV_MODE/MOCK_OTP true");
assert.ok(/MSG91_AUTH_KEY \|\| !env\.MSG91_OTP_TEMPLATE_ID_PANDIT \|\| !env\.MSG91_OTP_TEMPLATE_ID_WEB/.test(prodBlock), "prod must FATAL on missing MSG91 config (flags-off + delivery ship together)");
assert.ok(/isValidWebOtpOrigin\(val\)/.test(prodBlock), "prod must FATAL on unset/malformed WebOTP origins");
assert.ok(/\^\[A-Za-z0-9\]\{6\}\$/.test(prodBlock), "prod must FATAL on a non-6-char DLT sender ID");
for (const block of ["OTP_DEV_MODE", "MSG91_AUTH_KEY", "isValidWebOtpOrigin", "{6}"]) {
  const idx = prodBlock.indexOf(block);
  assert.ok(idx > -1 && prodBlock.slice(idx, prodBlock.indexOf("process.exit(1)", idx) + 1).length > 0, `fatal block for ${block} must actually exit`);
}
// the DLT-invalid 8-char default is gone
assert.ok(!/HMPANDIT/.test(envSrc), 'the DLT-invalid 8-char sender default "HMPANDIT" must never return');
assert.ok(/MSG91_SENDER_ID: z\.string\(\)\.default\("HMPNDT"\)/.test(envSrc), "sender default must be the approved 6-char HMPNDT");

console.log("otp-env guard: origin table, admin-hash predicate, fatal-boot blocks, HMPNDT ✅");
