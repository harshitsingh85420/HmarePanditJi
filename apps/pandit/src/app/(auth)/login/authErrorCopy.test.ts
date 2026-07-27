import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { normalizePhoneInput, parsePhoneNumber } from "@/lib/voiceParse";
import { hi } from "@/lib/strings";

// ─────────────────────────────────────────────────────────────
// AUTH ERROR COPY + TYPED-PATH NORMALIZATION (Isj order, 2026-07-25).
// PAGE 6 found ONE generic line covering every failure, a placeholder the
// validator rejected as typed, a raw typed path (voice normalized, typing
// didn't), and wrong-OTP boxes that never cleared. Pinned here:
//   1. the three error paths → three distinct strings (bad phone / wrong
//      OTP / network-generic), register-clean;
//   2. the normalizer's acceptance set (single-sourced with the voice
//      path in voiceParse.ts — same module, shared digit law);
//   3. placeholder is an input the validator accepts; numeric inputmode;
//   4. wrong-OTP failure clears the boxes so auto-verify can re-fire.
// COPY-LEVEL ONLY: the same 10 digits reach the API; attempt caps stay
// hold-branch (merge day). Strings mirrored into the merge-day diff list.
// ─────────────────────────────────────────────────────────────

const login = readFileSync(join(__dirname, "page.tsx"), "utf8");

describe("auth typed-path normalizer (single-source with voice)", () => {
  it("accepts what a pandit actually types", () => {
    expect(normalizePhoneInput("98765 43210")).toBe("9876543210"); // the old placeholder trap
    expect(normalizePhoneInput("+919876543210")).toBe("9876543210");
    expect(normalizePhoneInput("+91 98765-43210")).toBe("9876543210");
    expect(normalizePhoneInput("०९८७६५४३२१०")).toBe("9876543210"); // Devanagari + leading 0 (11→strip)
    expect(normalizePhoneInput("919876543210")).toBe("9876543210");
  });
  it("passes garbage through as too-short/invalid, never as a fake-valid number", () => {
    expect(normalizePhoneInput("abcdefghij")).toBe(""); // letters vanish → the invalid-copy path
    expect(normalizePhoneInput("12345")).toBe("12345");
    expect(normalizePhoneInput("0555555555")).toBe("0555555555"); // 10 digits, bad first digit → [6-9] gate
  });
  it("the VOICE path gained Devanagari digits through the same module", () => {
    expect(parsePhoneNumber("९८७६५ ४३२१०")).toBe("9876543210");
  });
});

describe("auth error copy — three paths, three strings", () => {
  it("the strings exist and hold the register bar", () => {
    expect(hi.auth.phoneInvalid).toBe("कृपया 10 अंकों का मोबाइल नंबर डालिए।");
    expect(hi.auth.otpWrong).toBe("OTP सही नहीं है। कृपया फिर से देखकर डालिए।");
    for (const s of [hi.auth.phoneInvalid, hi.auth.otpWrong]) {
      expect(s).not.toMatch(/करो|तुम/);
    }
  });
  it("bad phone speaks phoneInvalid — the client gate mirrors the server's [6-9] law", () => {
    expect(login).toMatch(/\^\[6-9\]\\d\{9\}\$\/\.test\(phone\)/);
    const gate = login.slice(login.indexOf("const handleSendOtp"), login.indexOf("const fullPhone"));
    expect(gate).toMatch(/auth\.phoneInvalid/);
    expect(gate, "the generic line may not answer a bad phone").not.toMatch(/common\.error/);
  });
  it("wrong OTP speaks otpWrong AND clears the boxes; network keeps the generic line", () => {
    const verify = login.slice(login.indexOf("const handleVerifyOtp"), login.indexOf("const { token"));
    expect(verify).toMatch(/invalid_otp|otp_not_found/);
    expect(verify).toMatch(/auth\.otpWrong/);
    expect(verify).toMatch(/setOtpValue\(""\)/); // auto-verify can re-fire without six backspaces
    expect(verify).toMatch(/common\.error/); // the one case where "कुछ गड़बड़" is true
  });
  it("send failure: invalid_phone_number → phoneInvalid; rate-limit keeps its line; else generic", () => {
    const send = login.slice(login.indexOf("if (!res.success)"), login.indexOf("accountExists ==") === -1 ? login.indexOf("setStep(2)") : login.indexOf("setStep(2)"));
    expect(send).toMatch(/invalid_phone_number/);
  });
  it("the placeholder is an input the validator ACCEPTS; phone field is numeric-mode", () => {
    expect(login).toMatch(/placeholder="9876543210"/);
    expect(login, "the space-formatted placeholder trap must not return").not.toMatch(/placeholder="98765 43210"/);
    const vf = readFileSync(join(__dirname, "..", "..", "..", "components", "voice", "VoiceField.tsx"), "utf8");
    // widened by the DIGIT LAW (PAGE 14): money/number joined phone/otp on
    // numeric inputMode when they left type=number behind. The property this
    // guard protects — the PHONE field is numeric-mode — is unchanged.
    expect(vf).toMatch(/inputMode=\{[^}]*mode === "phone"[^}]*"numeric"/);
    expect(vf).toMatch(/maxLength=\{mode === "phone" \? 18 : undefined\}/);
  });
  it("typed input routes through the normalizer (single-source law)", () => {
    expect(login).toMatch(/onChange=\{\(v\) => setPhone\(normalizePhoneInput\(v\)\)\}/);
  });
  it("cleared boxes refocus box 1 (OtpBoxes empty-value effect)", () => {
    expect(login).toMatch(/if \(value === ""\) refs\.current\[0\]\?\.focus\(\)/);
  });
});
