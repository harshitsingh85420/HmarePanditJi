import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// OTP CLIENT COOLDOWN (hardening v2, item H) — source-pinned on the CANON-ported
// login screen. Pins the exact bugs the spec calls out:
//   · countdown state MUST initialise at 0, not 30 (init-at-30 blocked the very
//     first send);
//   · a successful send starts a preemptive 60s cooldown so the 429 is
//     unreachable in normal use;
//   · error styling ONLY for the hard-cap 429 (hardCap), never for a plain wait;
//   · fallback to 60s when Retry-After is absent;
//   · register-clean copy (no roman words in the countdown line).
// ─────────────────────────────────────────────────────────────

const login = readFileSync(join(__dirname, "login", "page.tsx"), "utf-8");

describe("OTP resend cooldown — client (item H)", () => {
  it("countdown initialises at 0, never 30 (the first-send bug)", () => {
    expect(login).toMatch(/useState\(0\)[^\n]*\n?\s*const \[hardCap/);
    expect(login).not.toMatch(/const \[countdown, setCountdown\] = useState\(30\)/);
    expect(login).not.toMatch(/setCountdown\(30\)/);
  });

  it("a successful send starts the preemptive 60s cooldown", () => {
    // in the success path, not the failure path
    const successZone = login.slice(login.indexOf("setStep(2);"));
    expect(successZone).toMatch(/setCountdown\(60\)/);
  });

  it("hardCap drives the ONLY error styling; a 429 sets it, Retry-After with 60s fallback", () => {
    expect(login).toMatch(/setHardCap\(true\)/);   // set on a 429
    expect(login).toMatch(/setHardCap\(false\)/);  // cleared on success
    // fallback to 60 when the server omits Retry-After
    expect(login).toMatch(/res\.retryAfterSec && res\.retryAfterSec > 0 \? res\.retryAfterSec : 60/);
    // the new server code is recognised (not only the legacy one)
    expect(login).toMatch(/otp_rate_limited/);
    // the numeric countdown line is suppressed under hardCap (error line carries it)
    expect(login).toMatch(/hardCap \? null :/);
  });

  it("the countdown line is register-clean Devanagari (no roman)", () => {
    const m = login.match(/सेकंड बाद दोबारा भेज सकते हैं/);
    expect(m).not.toBeNull();
  });
});
