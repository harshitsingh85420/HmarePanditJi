import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildOtpSms, OTP_TTL_MIN } from "../config/constants";

// ─────────────────────────────────────────────────────────────
// BUILD-FAILING GUARD — DLT TEMPLATE DRIFT (OTP hardening v2, item K).
// The SMS body is DLT-APPROVED TEXT: Isj pastes exactly this into the MSG91
// portal, and the carrier delivers ONLY messages matching the approved
// template. ANY copy change (a word, a space, the danda) silently kills
// delivery until a fresh approval cycle — so the exact string is pinned HERE.
// Also pins: ONE WebOTP binding line (Chrome parses only the LAST @origin
// line; a second line is dead weight that risks template mismatch), and the
// TTL interpolated from the single source (never a bare digit).
// PROVEN-TO-FAIL: changing any character of the template turns this red.
// ─────────────────────────────────────────────────────────────

console.log("Running otp-template guard (DLT byte-exact + one binding line + TTL interpolation)…");

// K: the byte-exact approved template, one per app origin
const PANDIT_ORIGIN = "hmarepanditji-pandit.vercel.app";
const WEB_ORIGIN = "hmarepanditji-web.vercel.app";

assert.strictEqual(
  buildOtpSms("{#var#}", PANDIT_ORIGIN),
  "हमारे पंडित जी: आपका OTP {#var#} है। 5 मिनट तक मान्य। इसे किसी से साझा न करें।\n@hmarepanditji-pandit.vercel.app #{#var#}",
  "DLT template (pandit) drifted from the approved text — this needs a NEW DLT approval cycle; revert unless that is intended",
);
assert.strictEqual(
  buildOtpSms("{#var#}", WEB_ORIGIN),
  "हमारे पंडित जी: आपका OTP {#var#} है। 5 मिनट तक मान्य। इसे किसी से साझा न करें।\n@hmarepanditji-web.vercel.app #{#var#}",
  "DLT template (web) drifted from the approved text",
);

// C: exactly ONE binding line, and it is the LAST line
const sms = buildOtpSms("482913", PANDIT_ORIGIN);
const lines = sms.split("\n");
const bindingLines = lines.filter((l) => l.startsWith("@"));
assert.strictEqual(bindingLines.length, 1, "exactly ONE @origin binding line (Chrome parses only the last)");
assert.ok(lines[lines.length - 1].startsWith("@"), "the binding line must be the LAST line");
assert.strictEqual(lines[lines.length - 1], `@${PANDIT_ORIGIN} #482913`, "binding line format must be '@origin #code'");

// both {#var#} slots present in the portal form (MSG91 names them 'otp')
const varCount = (buildOtpSms("{#var#}", PANDIT_ORIGIN).match(/\{#var#\}/g) || []).length;
assert.strictEqual(varCount, 2, "the template must carry BOTH {#var#} OTP slots (body + binding line)");

// D: the TTL in the SMS is INTERPOLATED from the single source, never a bare digit
assert.ok(sms.includes(`${OTP_TTL_MIN} मिनट`), "SMS must promise the SINGLE-SOURCE TTL");
const constantsSrc = readFileSync(join(__dirname, "..", "config", "constants.ts"), "utf8");
assert.ok(/\$\{OTP_TTL_MIN\} मिनट/.test(constantsSrc), "the template SOURCE must interpolate ${OTP_TTL_MIN} — no hardcoded minutes digit");
const templateLine = constantsSrc.split("\n").find((l) => l.includes("मिनट तक मान्य")) ?? "";
assert.ok(!/\d+ मिनट/.test(templateLine), "no literal digit before मिनट in the template source (must be the interpolation)");

console.log("otp-template guard: byte-exact DLT text pinned, one binding line, TTL interpolated ✅");
