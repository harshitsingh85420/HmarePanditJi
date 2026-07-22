import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// FEE-LABEL TRUTH GUARD. The platform's ONE fee rate is
// PLATFORM_FEE_PERCENT = 10 (services/api/src/config/constants.ts). Founder
// decision 2026-07-21 (CONFLICT_RULINGS #7): this fee is charged to the
// CUSTOMER (यजमान) on top of the dakshina — it is NOT a deduction from the
// pandit. So the fee label must (a) still state the real 10% rate, and
// (b) make clear the यजमान pays it, never the pandit. A label claiming any
// other rate, or one that reads as a cut from the pandit, is a money lie.
// If the rate ever changes, change the constant AND these labels together.
// ─────────────────────────────────────────────────────────────
const strings = readFileSync(join(__dirname, "strings.ts"), "utf-8");

describe("platform-fee labels state the real 10% customer-paid rate", () => {
  it("booking.platformFee label says (10%) AND names the यजमान as payer", () => {
    const m = strings.match(/platformFee: "([^"]*)"/);
    expect(m, "the platformFee label must exist").toBeTruthy();
    expect(m![1], "must state the real 10% rate").toMatch(/10%/);
    expect(m![1], "must show the यजमान pays it (not a pandit deduction)").toMatch(/यजमान/);
  });

  it("no pandit string claims a 15% fee", () => {
    expect(strings).not.toMatch(/15%/);
    expect(strings).not.toMatch(/पंद्रह प्रतिशत/);
  });
});
