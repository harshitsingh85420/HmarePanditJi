// BB1 — THE ONE PLACE the booking state machine is translated between the two
// vocabularies that coexist in this codebase:
//   • DB / customer app / payments / admin  →  Machine B
//       CREATED → PANDIT_REQUESTED → CONFIRMED → … → COMPLETED / CANCELLED
//   • pandit app UI (reads raw `status`)     →  Machine A
//       REQUESTED → ACCEPTED → IN_PROGRESS → COMPLETED / CANCELLED / REJECTED
//
// Bookings are BORN "PANDIT_REQUESTED" (payment.service, admin). The pandit
// client, however, filters and renders "REQUESTED"/"ACCEPTED". Left untranslated
// the pandit's New/Active tabs are always empty and accept/reject 409 on every
// real booking. Rather than fork the data or rewrite three apps, every pandit
// READ maps DB→view here and every pandit `?status=` filter maps view→DB here.
// Keep this the single source of the mapping — that is the law that kills the
// "two divergent booking state machines" class.

export type PanditView =
  | "REQUESTED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

// DB status -> the status the pandit app expects to see.
const DB_TO_VIEW: Record<string, PanditView> = {
  CREATED: "REQUESTED",
  PANDIT_REQUESTED: "REQUESTED",
  REQUESTED: "REQUESTED", // legacy/seed rows already in Machine-A vocabulary
  CONFIRMED: "ACCEPTED",
  ACCEPTED: "ACCEPTED",
  TRAVEL_BOOKED: "ACCEPTED",
  PANDIT_EN_ROUTE: "ACCEPTED",
  PANDIT_ARRIVED: "ACCEPTED",
  PUJA_IN_PROGRESS: "IN_PROGRESS",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLATION_REQUESTED: "CANCELLED",
  CANCELLED: "CANCELLED",
  REFUNDED: "CANCELLED",
  REJECTED: "REJECTED",
};

/** DB status → pandit-UI status. Unknown values pass through unchanged. */
export function panditView(dbStatus: string): string {
  return DB_TO_VIEW[dbStatus] ?? dbStatus;
}

/** Return a shallow copy of a booking-like row with `status` mapped to the view. */
export function withPanditView<T extends { status: string }>(booking: T): T {
  return { ...booking, status: panditView(booking.status) };
}

/**
 * A pandit-UI status filter (e.g. ?status=REQUESTED) → the set of DB statuses it
 * covers, so the DB query hits the real rows. An unmapped value is returned
 * as-is (a caller may still filter by a raw DB status directly).
 */
export function dbStatusesForView(view: string): string[] {
  const v = view.toUpperCase();
  const matches = Object.entries(DB_TO_VIEW)
    .filter(([, mapped]) => mapped === v)
    .map(([db]) => db);
  return matches.length ? matches : [view];
}
