// ─────────────────────────────────────────────────────────────
// REFUND POLICY — the ONE source of truth (founder ruling, 2026-07-23).
// The legal /cancellation-policy page and the dashboard cancel screen BOTH
// render from this module, so the two can never disagree again (the live
// incident: the legal page said 90/50/20/0 while the cancel screen computed
// 100/50/0 — in a dispute the customer-favourable number wins).
// RULE: the CODE is the source of truth; the legal page conforms to it,
// never the reverse. payment-money.test.ts §7 pins both pages to this module
// and pins these exact numbers — changing them is a business decision that
// needs founder sign-off.
//
// Boundary semantics (deliberate, matches the live calculator):
//   daysUntilEvent = ceil((event − now) / 24h), floored at 0.
//   > 7  → 100%   (day 8 and beyond)
//   ≥ 3  → 50%    (days 3–7 inclusive — note: EXACTLY 7 days out is 50%)
//   < 3  → 0%
// The platform fee is ALWAYS excluded first — it is never refundable
// (disclosed before payment since the 2026-07-23 fee-disclosure fix).
// ─────────────────────────────────────────────────────────────

export const PLATFORM_FEE_REFUNDABLE = false;

export const REFUND_PROCESSING_DAYS = "5-7 business days";

export const REFUND_TIERS = [
  { when: "> 7 days before event", percent: 100, note: "100% of the refundable amount (total minus platform fee)" },
  { when: "3 - 7 days before event", percent: 50, note: "50% of the refundable amount (total minus platform fee)" },
  { when: "< 3 days before event", percent: 0, note: "No refund" },
] as const;

/** The percent of the REFUNDABLE amount (grandTotal − platformFee) returned
 *  for a cancellation `daysUntilEvent` days before the event. */
export function refundPercent(daysUntilEvent: number): number {
  if (daysUntilEvent > 7) return 100;
  if (daysUntilEvent >= 3) return 50;
  return 0;
}
