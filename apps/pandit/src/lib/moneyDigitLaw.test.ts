import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { normalizeMoneyInput, moneyHadMinus, normalizePhoneInput } from "./voiceParse";

// ─────────────────────────────────────────────────────────────
// DIGIT LAW guards (PAGE 14 walk, Isj order 2026-07-25).
// The dakshina field was input[type=number], so the BROWSER refused
// Devanagari digits (५१०० → empty box) and silently swallowed a typed
// minus. Money now runs type=text + inputMode=numeric through the SAME
// digit source as the phone path, and a minus is answered with a line.
// ─────────────────────────────────────────────────────────────

describe("normalizeMoneyInput — the shared digit law", () => {
  it("Devanagari digits convert (the exact case the browser used to refuse)", () => {
    expect(normalizeMoneyInput("५१००")).toBe("5100");
    expect(normalizeMoneyInput("२१०१")).toBe("2101");
  });
  it("mixed scripts and formatting normalize to plain digits", () => {
    expect(normalizeMoneyInput("₹5,100")).toBe("5100");
    expect(normalizeMoneyInput("५,१०० रुपये")).toBe("5100");
    expect(normalizeMoneyInput("5 100")).toBe("5100");
  });
  it("leading zeros are trimmed but a lone zero survives", () => {
    expect(normalizeMoneyInput("000501")).toBe("501");
    expect(normalizeMoneyInput("0")).toBe("0");
    expect(normalizeMoneyInput("")).toBe("");
  });
  it("a minus never becomes a positive number silently — it is REPORTED", () => {
    expect(normalizeMoneyInput("-500")).toBe("500"); // digits only…
    expect(moneyHadMinus("-500")).toBe(true); // …and the caller is told
    expect(moneyHadMinus("−500")).toBe(true); // unicode minus
    expect(moneyHadMinus("500")).toBe(false);
  });
  it("shares its digit source with the phone path (one law, two callers)", () => {
    expect(normalizePhoneInput("९८७६५४३२१०")).toBe("9876543210");
    expect(normalizeMoneyInput("९८७६")).toBe("9876");
  });
});

describe("the field is text+numeric, never a native number input", () => {
  const vf = readFileSync(join(__dirname, "..", "components/voice/VoiceField.tsx"), "utf8");
  it("money/number modes render tel+numeric (browser is not the gatekeeper)", () => {
    expect(vf).toMatch(/mode === "phone" \|\| mode === "otp" \|\| mode === "number" \|\| mode === "money" \? "tel" : "text"/);
    expect(vf).not.toMatch(/mode === "number" \|\| mode === "money" \? "number"/);
    expect(vf).toMatch(/inputMode=\{[^}]*mode === "money"[^}]*"numeric"/);
  });
  it("the wizard routes dakshina through the shared normalizer + refuses a minus out loud", () => {
    const add = readFileSync(
      join(__dirname, "..", "app/(dashboard-group)/my-poojas/add/page.tsx"),
      "utf8",
    );
    expect(add).toMatch(/const digits = normalizeMoneyInput\(v\)/);
    expect(add).not.toMatch(/parseInt\(v\.replace\(\/\\D\/g, ""\)/);
    expect(add).toMatch(/setMinusNote\(moneyHadMinus\(v\)\)/);
    expect(add).toMatch(/voiceController\.speakAndWait\(MINUS_LINE, \{ interrupt: false \}\)/);
    // register: no तुम/करो in the refusal line
    expect(add).toMatch(/MINUS_LINE = "दक्षिणा ऋण में नहीं हो सकती — कृपया सीधी राशि भरिए।"/);
  });
});
