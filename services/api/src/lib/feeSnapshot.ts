import { PLATFORM_FEE_PERCENT } from "../config/constants";

/**
 * THE SNAPSHOT INVARIANT — Ruling B, ops-configurable (Isj, 2026-07-28).
 *
 * THE MODEL:
 *   The pandit receives 100% of his dakshina. No deduction, ever.
 *   The platform fee is charged to the CUSTOMER, on top of the dakshina.
 *   Default rate 10%. Operations sets the rate.
 *
 * THE INVARIANT: a booking freezes the fee rate in force at the moment it was
 * created. Ops raising the default from 10% to 12% must NOT change what a
 * booking taken last week says the customer paid, or what the pandit is owed,
 * or what a receipt shows. Money already agreed is not re-derived.
 *
 * So there are exactly two legitimate readings of "the rate":
 *
 *   currentFeePercent()      — for a booking being CREATED right now, and for
 *                              quotes/estimates of a hypothetical booking.
 *   bookingFeePercent(row)   — for anything about an EXISTING booking.
 *
 * Every downstream figure (payout, receipt, admin total, earnings, the
 * conservation check) must use the second. feeSnapshot.test.ts fails the build
 * if the live default leaks into a stored booking's arithmetic.
 */

/** The rate ops has configured today. Only valid for a NEW booking. */
export function currentFeePercent(): number {
  return PLATFORM_FEE_PERCENT;
}

/**
 * The rate THIS booking was created under.
 *
 * Falls back to the live default only for rows written before the column
 * existed — and says so, rather than silently pretending the current rate was
 * always in force.
 */
export function bookingFeePercent(booking: { platformFeePercent?: number | null; id?: string }): number {
  const stored = booking?.platformFeePercent;
  if (typeof stored === "number" && Number.isFinite(stored) && stored >= 0) return stored;
  // eslint-disable-next-line no-console
  console.warn(
    `[fee] booking ${booking?.id ?? "?"} has no stored platformFeePercent — falling back to the live ${PLATFORM_FEE_PERCENT}%. ` +
      `This row predates the snapshot column; its arithmetic is NOT protected from a rate change.`,
  );
  return PLATFORM_FEE_PERCENT;
}

/**
 * The fee amount for a booking, from ITS OWN frozen rate.
 *
 * Prefer the stored `platformFee` when present — it is the number the customer
 * was actually charged. This recomputation exists for verification and for
 * rows that predate the amount being stored.
 */
export function feeAmountForBooking(booking: {
  platformFee?: number | null;
  platformFeePercent?: number | null;
  dakshinaAmount?: number | null;
  id?: string;
}): number {
  if (typeof booking?.platformFee === "number" && booking.platformFee > 0) return booking.platformFee;
  const dakshina = Number(booking?.dakshinaAmount ?? 0);
  return Math.round(dakshina * (bookingFeePercent(booking) / 100));
}
