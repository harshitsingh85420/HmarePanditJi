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
// Boundary semantics (founder ruling 2026-07-23 — CUSTOMER-FAVOURABLE:
// "ambiguity in a refund rule resolves against whoever wrote it"):
//   daysUntilEvent = ceil((event − now) / 24h), floored at 0.
//   ≥ 7  → 100%   (7 दिन या उससे पहले — EXACTLY 7 days out is 100%)
//   ≥ 3  → 50%    (days 3–6)
//   < 3  → 0%
// The day arithmetic is EPOCH-INSTANT math (no timezone conversion happens in
// it), and ceil() rounds partial days UP — both err in the customer's favour.
// ─────────────────────────────────────────────────────────────

export const REFUND_PROCESSING_DAYS = "5-7 business days";

export const REFUND_TIERS = [
  { when: "7 days or more before event (7 दिन या उससे पहले)", percent: 100, note: "100% of the refundable amount (total minus platform fee)" },
  { when: "3 - 6 days before event", percent: 50, note: "50% of the refundable amount (total minus platform fee)" },
  { when: "< 3 days before event", percent: 0, note: "No refund" },
] as const;

/** The percent of the REFUNDABLE amount (grandTotal − platformFee) returned
 *  for a CUSTOMER cancellation `daysUntilEvent` days before the event. */
export function refundPercent(daysUntilEvent: number): number {
  if (daysUntilEvent >= 7) return 100;
  if (daysUntilEvent >= 3) return 50;
  return 0;
}

// ─────────────────────────────────────────────────────────────
// WHO INITIATED matters (founder ruling 2026-07-23). Two NAMED cases:
//
//   CUSTOMER_CANCELLATION — the customer changed plans. The tiers above
//   apply, and the platform fee is NON-refundable (disclosed before payment).
//
//   PANDIT_NO_SHOW — the PLATFORM failed to deliver what it charged for.
//   100% of the WHOLE charge is refunded, INCLUDING the platform fee —
//   keeping the fee would be charging for a failure. At pilot this refund is
//   executed MANUALLY from the Razorpay dashboard (pilot-ops-runbook.md §1);
//   no automated no-show detection exists — the customer complaint is the
//   trigger, and the operator declares the no-show.
// ─────────────────────────────────────────────────────────────
export const REFUND_CASES = {
  CUSTOMER_CANCELLATION: { feeRefunded: false, usesTiers: true },
  PANDIT_NO_SHOW: { feeRefunded: true, usesTiers: false, percentOfWholeCharge: 100 },
} as const;
