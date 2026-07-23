// ─────────────────────────────────────────────────────────────
// REFUND POLICY — the API-side canonical module (founder rulings 2026-07-23).
// EXACT mirror of apps/web/src/lib/refund-policy.ts — payment-money.test.ts §7
// pins the two in lockstep (tiers, ceil, fee-exclusion), the same discipline as
// display=charge. The SERVER is where the number that gets PAID is computed and
// PERSISTED (booking.refundAmount at cancel-request); the web module only
// discloses. Discovered divergences this module retires:
//   · cancel-request had placeholder math: >7 (not ≥7), NO ceil, fee INCLUDED,
//     and never persisted — refundAmount stayed 0, so the operator had nothing
//     to read;
//   · the admin cancellations page ran a THIRD policy (90/50/20/0 with a 15%
//     "approx" fee) and cancel-approve wrote that client-computed number.
//
// Boundary semantics (customer-favourable, Isj: "ambiguity in a refund rule
// resolves against whoever wrote it"):
//   daysUntilEvent = max(0, ceil((event − now) / 24h))   — partial days round UP
//   ≥ 7 → 100%   (7 दिन या उससे पहले)
//   ≥ 3 → 50%
//   < 3 → 0%
// ─────────────────────────────────────────────────────────────

export const REFUND_PROCESSING_DAYS = "5-7 business days";

/** Whole days until the event — ceil so partial days round UP (customer-favourable). */
export function refundDaysUntil(eventDate: Date, now: Date = new Date()): number {
  return Math.max(0, Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

/** The percent of the REFUNDABLE amount (grandTotal − platformFee) returned
 *  for a CUSTOMER cancellation `daysUntilEvent` days before the event. */
export function refundPercent(daysUntilEvent: number): number {
  if (daysUntilEvent >= 7) return 100;
  if (daysUntilEvent >= 3) return 50;
  return 0;
}

/** The full customer-cancellation refund computation — the ONE place the paid
 *  number comes from. Persist `estimate` on the booking at cancel-request. */
export function computeCustomerCancellationRefund(
  booking: { eventDate: Date; grandTotal: number; platformFee: number },
  now: Date = new Date(),
): { daysUntilEvent: number; percent: number; refundableAmount: number; estimate: number } {
  const daysUntilEvent = refundDaysUntil(booking.eventDate, now);
  const percent = refundPercent(daysUntilEvent);
  // fee excluded FIRST — non-refundable on customer cancellation (disclosed pre-payment)
  const refundableAmount = Math.max(0, booking.grandTotal - booking.platformFee);
  const estimate = Math.floor(refundableAmount * (percent / 100));
  return { daysUntilEvent, percent, refundableAmount, estimate };
}

/** WHO initiated matters (founder ruling 2026-07-23):
 *  CUSTOMER_CANCELLATION → tiers above, fee non-refundable.
 *  PANDIT_NO_SHOW → 100% of the WHOLE charge INCLUDING the fee (a platform
 *  failure — keeping the fee would be charging for a failure). Manual Razorpay
 *  refund by the operator; see pilot-ops-runbook.md §1. */
export const REFUND_CASES = {
  CUSTOMER_CANCELLATION: { feeRefunded: false, usesTiers: true },
  PANDIT_NO_SHOW: { feeRefunded: true, usesTiers: false, percentOfWholeCharge: 100 },
} as const;
