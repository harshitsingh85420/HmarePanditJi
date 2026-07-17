import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// FEE-LABEL TRUTH GUARD. The platform's ONE commission is
// PLATFORM_FEE_PERCENT = 10 (services/api/src/config/constants.ts,
// single-sided, GST-inclusive). A display label claiming any other rate
// next to a correct 10% deduction is a money lie — the live request
// screen shipped "(15%)" beside a ₹150-on-₹1,500 cut until 2026-07-17.
// If the rate ever changes, change the constant AND these labels together.
// ─────────────────────────────────────────────────────────────
const strings = readFileSync(join(__dirname, "strings.ts"), "utf-8");

describe("platform-fee labels state the real 10% rate", () => {
  it("booking.platformFee label says (10%)", () => {
    expect(strings).toMatch(/platformFee: "प्लेटफ़ॉर्म शुल्क \(10%\)"/);
  });

  it("no pandit string claims a 15% fee", () => {
    expect(strings).not.toMatch(/15%/);
    expect(strings).not.toMatch(/पंद्रह प्रतिशत/);
  });
});
