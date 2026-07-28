import { describe, it, expect } from "vitest";
import { hi } from "./strings";

// ─────────────────────────────────────────────────────────────
// PAYMENT-SOURCE LABELLING LAW — Isj, 2026-07-28.
//
// EVERY rupee figure shown to the pandit must declare WHO PAYS IT.
// A true number with an unstated source is a false promise about his bank
// balance. Two sightings produced this law:
//   · his booking card showed ₹5,610 — the CUSTOMER's total, not his payout;
//   · samagri sat inside his earnings block as "सामग्री कमाई" with a green +,
//     although the platform never collects or transfers it.
//
// The two sources:
//   प्लेटफ़ॉर्म से   — we collect from the customer and transfer to him.
//                   dakshina · travel · food · accommodation
//                   (all inside grandTotal AND platformTransfersToPandit)
//   यजमान से सीधे  — he collects it himself; we never touch it.
//                   samagri
//
// THE CHECKLIST SHAPE: every money label the pandit sees is enumerated below
// with its source. A NEW label added without a source marker fails this test,
// which is the point — the guard is a checklist that grows with the app.
//
// PROVEN IN BOTH DIRECTIONS (standing law): the positive case pins the real
// labels; the negative case below proves an unlabelled figure is rejected.
// ─────────────────────────────────────────────────────────────

const PLATFORM = "प्लेटफ़ॉर्म से";
const DIRECT = "यजमान से सीधे";

/** Every money line the pandit can see, and who actually pays it. */
const MONEY_LABELS: Array<{ key: keyof typeof hi.booking; source: "platform" | "direct" | "informational" }> = [
  { key: "dakshina", source: "platform" },
  { key: "travel", source: "platform" },
  { key: "food", source: "platform" },
  { key: "samagri", source: "direct" },
  // The platform fee is the CUSTOMER's cost, never his — it already says so.
  { key: "platformFee", source: "informational" },
];

const hasSource = (s: string) => s.includes(PLATFORM) || s.includes(DIRECT) || s.includes("यजमान देता है");

describe("every rupee figure shown to the pandit declares who pays it", () => {
  for (const { key, source } of MONEY_LABELS) {
    it(`${String(key)} names its source (${source})`, () => {
      const label = (hi.booking as Record<string, string>)[String(key)];
      expect(label, `booking.${String(key)} is missing`).toBeTruthy();
      expect(
        hasSource(label),
        `booking.${String(key)} = "${label}" shows the pandit a figure without saying who pays it. ` +
          `Append "— ${PLATFORM}" or "— ${DIRECT}".`,
      ).toBe(true);
    });
  }

  it("platform-paid and customer-direct lines are not labelled the same", () => {
    const dakshina = (hi.booking as Record<string, string>).dakshina;
    const samagri = (hi.booking as Record<string, string>).samagri;
    expect(dakshina).toContain(PLATFORM);
    expect(samagri).toContain(DIRECT);
    expect(dakshina).not.toContain(DIRECT);
    expect(samagri).not.toContain(PLATFORM);
  });

  it("the mixed total says it is mixed", () => {
    const note = (hi.booking as Record<string, string>).totalNote;
    expect(note, "booking.totalNote is missing").toBeTruthy();
    expect(note).toContain("प्लेटफ़ॉर्म");
    expect(note).toContain("सीधे");
  });

  it("samagri carries its own standalone explanation", () => {
    const note = (hi.booking as Record<string, string>).samagriDirectNote;
    expect(note).toBeTruthy();
    expect(note).toMatch(/सीधे/);
    expect(note).toMatch(/भुगतान में नहीं/);
  });

  // ── proven-to-fail: an unlabelled figure must be rejected ──
  it("REJECTS a money label with no source (the negative case)", () => {
    for (const unlabelled of ["दक्षिणा", "यात्रा भत्ता", "सामग्री कमाई", "कुल"]) {
      expect(
        hasSource(unlabelled),
        `"${unlabelled}" has no source marker and the checker accepted it — the guard is asleep`,
      ).toBe(false);
    }
  });
});
