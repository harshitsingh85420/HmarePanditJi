// F29 rules for "मेरी पूजाएँ" — pure, unit-testable core.

// ─────────────────────────────────────────────────────────────
// P1 (harsh-QA 2026-07-25): the removal guard was DEAD TWO WAYS. It
// looked for REQUESTED/ACCEPTED/IN_PROGRESS — statuses `createBooking`
// never sets (it writes CREATED) — on `Booking.pujaType`, a @default("")
// column `createBooking` never writes (it writes eventType). Either
// mistake alone would have surfaced as a false 409; together they made
// the 409 unreachable, so a pandit could remove a pooja that had a live
// booking on it.
//
// The law now: blocking is DERIVED as (every status − the terminal
// ones). A status added to the enum therefore blocks removal until
// someone declares it terminal — the safe direction, and the guard test
// pins the enum size so that decision cannot be skipped.
// ─────────────────────────────────────────────────────────────

/** Every BookingStatus in packages/db/prisma/schema.prisma. */
export const ALL_BOOKING_STATUSES = [
  "CREATED", "PANDIT_REQUESTED", "CONFIRMED", "TRAVEL_BOOKED",
  "PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS", "COMPLETED",
  "CANCELLATION_REQUESTED", "CANCELLED", "REFUNDED", "REQUESTED",
  "ACCEPTED", "REJECTED", "IN_PROGRESS",
] as const;

/** Ended, one way or another — these can never block a removal. */
export const TERMINAL_BOOKING_STATUSES = [
  "COMPLETED", "CANCELLED", "REJECTED", "REFUNDED",
] as const;

/** Booking statuses that block removing a pooja from the pandit's list. */
export const REMOVE_BLOCKING_STATUSES = ALL_BOOKING_STATUSES.filter(
  (s) => !(TERMINAL_BOOKING_STATUSES as readonly string[]).includes(s),
);

/**
 * The prisma `where` for "does this pandit have a live booking for this
 * pooja?". Matches BOTH columns: `eventType` is what createBooking
 * actually writes; `pujaType` is the legacy/spec column kept for older
 * rows. VOCABULARY CAVEAT (feeds the open canonicalization ruling): a
 * booking's eventType is the ritual display name while a specialization
 * may be a canonical id, so a match still depends on those agreeing —
 * this fixes the guard's mechanics, not the key vocabularies.
 */
export function poojaBookingWhere(panditId: string, poojaType: string) {
  return {
    panditId,
    status: { in: REMOVE_BLOCKING_STATUSES },
    OR: [{ eventType: poojaType }, { pujaType: poojaType }],
  };
}

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
