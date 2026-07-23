import assert from "node:assert";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { OTP_TTL_MIN, OTP_TTL_SECONDS, buildOtpSms } from "../config/constants";

// ─────────────────────────────────────────────────────────────
// BUILD-FAILING GUARD — OTP TTL SINGLE SOURCE (hardening v2, item D).
// The historical bugs this pins against:
//   · one flow stored a 600s TTL while the SMS promised 5 मिनट;
//   · a dead Twilio notifyOtp told the pandit "10 min".
// Pins: the arithmetic, the interpolated SMS value, NO TTL literal at any
// storeOtpHash call site, and an ANYWHERE-SCAN over services/api/src that
// fails the build on any OTP-context minutes value != OTP_TTL_MIN.
// ─────────────────────────────────────────────────────────────

console.log("Running otp-ttl guard (single source + anywhere-scan)…");

// 1) the arithmetic
assert.strictEqual(OTP_TTL_MIN, 5, "OTP_TTL_MIN is the business number (changing it = founder decision + NEW DLT template)");
assert.strictEqual(OTP_TTL_SECONDS, OTP_TTL_MIN * 60, "OTP_TTL_SECONDS must be derived, never independent");

// 2) the SMS promises the same number
assert.ok(buildOtpSms("000000", "x.y.z").includes(`${OTP_TTL_MIN} मिनट`), "SMS promise must equal the single source");

// 3) no TTL literal at any send site — storeOtpHash must be passed the constant
const SRC = join(__dirname, "..");
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return p.endsWith(".ts") && !p.endsWith(".test.ts") ? [p] : [];
  });
}
const files = walk(SRC);
for (const f of files) {
  const src = readFileSync(f, "utf8");
  const m = src.match(/storeOtpHash\([^)]*,\s*(\d+)\s*\)/);
  assert.ok(!m, `TTL literal ${m?.[1]} at a storeOtpHash call in ${f} — pass OTP_TTL_SECONDS`);
}

// 4) ANYWHERE-SCAN: any line mentioning OTP with an N-minutes value must say
//    OTP_TTL_MIN minutes. (This is the scan that would have caught the dead
//    Twilio "10 min" — it must never return.)
const offenders: string[] = [];
for (const f of files) {
  const src = readFileSync(f, "utf8");
  src.split("\n").forEach((line, i) => {
    if (!/otp/i.test(line)) return;
    const m = [...line.matchAll(/(\d+)\s*(?:min\b|मिनट|minutes?\b)/gi)];
    for (const hit of m) {
      if (Number(hit[1]) !== OTP_TTL_MIN) {
        offenders.push(`${f}:${i + 1} says "${hit[0]}" (OTP context, != ${OTP_TTL_MIN})`);
      }
    }
  });
}
assert.deepStrictEqual(offenders, [], `divergent OTP-minutes values found:\n${offenders.join("\n")}`);

console.log("otp-ttl guard: one source, interpolated promise, no literals, anywhere-scan clean ✅");
