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
  | "AWAITING_PAYMENT"
  | "REQUESTED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

// DB status -> the status the pandit app expects to see.
const DB_TO_VIEW: Record<string, PanditView> = {
  // ── THE SPLIT (2026-07-29) ────────────────────────────────────
  // CREATED used to map to "REQUESTED" alongside PANDIT_REQUESTED. Both
  // landed in the same bucket, so the pandit's नई विनती tab showed an UNPAID
  // booking as an actionable request — and स्वीकार करें returned
  //     409 invalid_state · "Only a pending booking can be accepted."
  // because accept requires PANDIT_REQUESTED, which only processPaymentSuccess
  // produces. The first real booking this product ever took (HPJ-2026-19028)
  // hit exactly that, on the pandit's first ever request.
  //
  // Two states collapsed into one bucket hid the difference that decides
  // whether the button works. They are now separate views: the booking stays
  // VISIBLE so he can plan his day, but carries no accept affordance until it
  // is actually acceptable. See ACCEPTABLE_DB_STATUSES below — the dead-control
  // law applied to state.
  CREATED: "AWAITING_PAYMENT",
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

// ─────────────────────────────────────────────────────────────
// THE DEAD-CONTROL LAW, APPLIED TO STATE.
//
// "No state that cannot be accepted may render an accept control."
//
// A control the user can press that always fails is worse than no control:
// it teaches him the app is broken, and he learns it on the one booking he
// cares most about. The only way to keep the UI and the handler from drifting
// is for both to read acceptability from HERE — the same place that owns the
// state machine — instead of each hand-listing statuses.
//
// The pandit view from which स्वीकार करें is a LIVE control. Exactly one.
export const ACCEPTABLE_VIEW: PanditView = "REQUESTED";

/** DB statuses the accept handler may transition FROM. Derived, never hand-listed. */
export const ACCEPTABLE_DB_STATUSES: readonly string[] =
  dbStatusesForView(ACCEPTABLE_VIEW);

/** May the pandit UI render an accept affordance on a row in this view state? */
export function canAcceptFromView(view: string): boolean {
  return view.toUpperCase() === ACCEPTABLE_VIEW;
}

/**
 * Which DB statuses an ops operator may cancel from.
 *
 * THIS LIVES HERE, not in admin.routes.ts, and the move is the point. It was
 * derived in admin.routes.ts and derived AGAIN — with its own copy of the
 * expression — in adminStatusSets.test.ts. Two derivations is the same disease
 * as two literals, only harder to see: when CREATED was split out of
 * "REQUESTED" (2026-07-29) the route was updated and the guard was not, so the
 * guard failed against correct code and its message accused ops of losing
 * cancel. One definition, imported by both, cannot drift.
 *
 * AWAITING_PAYMENT is first deliberately: an unpaid booking is the single most
 * likely thing a customer telephones to cancel.
 */
export const CANCELLABLE_DB_STATUSES: ReadonlySet<string> = new Set<string>([
  ...dbStatusesForView("AWAITING_PAYMENT"),
  ...dbStatusesForView(ACCEPTABLE_VIEW),
  ...dbStatusesForView("ACCEPTED"),
]);
