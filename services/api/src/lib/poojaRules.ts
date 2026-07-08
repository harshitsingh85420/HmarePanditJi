// F29 rules for "मेरी पूजाएँ" — pure, unit-testable core.

/** Booking statuses that block removing a pooja from the pandit's list. */
export const REMOVE_BLOCKING_STATUSES = ["REQUESTED", "ACCEPTED", "IN_PROGRESS"] as const;

/** A pooja can be removed only when it has no active bookings. */
export function canRemovePooja(activeBookingCount: number): boolean {
  return activeBookingCount === 0;
}

/**
 * F29(a) price-lock: bookings snapshot dakshinaAmount at creation, so a
 * later rate change must never alter an existing booking's payout. This
 * mirrors how computeEarnings works — it reads the BOOKING's stored
 * amount, never the current DakshinaRate.
 */
export function bookingPayoutBase(booking: { dakshinaAmount: number }, _currentRate: number): number {
  return booking.dakshinaAmount;
}

/** Newly added poojas await verification until P12 video-verify ships. */
export function isPoojaVerified(pooja: string, pendingList: string[]): boolean {
  return !pendingList.includes(pooja);
}
