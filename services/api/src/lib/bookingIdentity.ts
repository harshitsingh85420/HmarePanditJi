import { dbStatusesForView } from "./bookingStatus";

// ─────────────────────────────────────────────────────────────
// THE SYMMETRIC CONTACT RULE — Isj ruling, 2026-07-29.
//
//   Each side sees the other's NAME and PHONE once the booking is CONFIRMED.
//   Neither sees it before.
//
// THIS IS A NARROWING, NOT A FEATURE. Before this file, the pandit side
// over-saw and the customer side under-saw:
//   · /pandits/bookings/:id returned the customer's ENTIRE User row — phone,
//     email, id, role, isActive, timestamps — plus the whole CustomerProfile,
//     on an UNPAID booking. Proven live against production, 2026-07-29.
//   · /bookings/pandit/my did the same thing in BULK, one full User per row.
//   · /pandits/pending-requests shipped the full street address AND lat/long
//     of a family that had not paid and might never book — pre-accept by
//     definition.
// Access control was never the problem: every one of those is correctly
// ownership-gated. The problem was scope, and that scope did not depend on
// state. NO pandit-facing handler in this codebase read `booking.status`
// before choosing fields. This is the first thing that does.
//
// WHY A MEDIATOR AND NOT EIGHT EDITS. The same class was solved once already
// for the state machine (lib/bookingStatus.ts): eight call sites each doing
// their own version of one rule is how the rule ends up with eight versions.
// There is also nothing else that could catch a miss — this API has no
// `onSend`, no `preSerialization`, no `setReplySerializer`, no response schema,
// and no Prisma `$extends`/`$use`/`omit` anywhere in services/api/src. What a
// query selects is what ships. So the redaction has to be a deliberate call,
// and a guard has to assert every pandit-facing send makes it.
// ─────────────────────────────────────────────────────────────

/**
 * The statuses at or past CONFIRMED — DERIVED from the one state machine, never
 * hand-listed.
 *
 * "Once CONFIRMED" cannot mean the single literal status `CONFIRMED`: the
 * booking moves to TRAVEL_BOOKED, PANDIT_EN_ROUTE, PANDIT_ARRIVED and beyond,
 * and the pandit must not lose the yajman's phone number the moment he sets off
 * to the house. In pandit-view vocabulary that is ACCEPTED + IN_PROGRESS +
 * COMPLETED, which is exactly what these three lookups expand to.
 *
 * CANCELLED / REFUNDED / REJECTED are deliberately EXCLUDED — see the note on
 * contactVisible().
 */
export const CONTACT_VISIBLE_DB_STATUSES: ReadonlySet<string> = new Set<string>([
  ...dbStatusesForView("ACCEPTED"),
  ...dbStatusesForView("IN_PROGRESS"),
  ...dbStatusesForView("COMPLETED"),
]);

/**
 * May the two parties see each other's name and phone on a booking in this
 * state?
 *
 * JUDGEMENT CALL, FLAGGED FOR VETO: a booking that was CONFIRMED and is now
 * CANCELLED returns false here, so contact disappears. The argument for that is
 * that the relationship ended; the argument against is that the pandit may
 * still need to reach the yajman about a cancellation he is in the middle of.
 * I chose the narrower reading because ops holds both numbers and can connect
 * them, and because a contact detail that quietly survives a cancellation is
 * the harder thing to explain to whoever's number it is.
 */
export function contactVisible(dbStatus: string | null | undefined): boolean {
  return !!dbStatus && CONTACT_VISIBLE_DB_STATUSES.has(dbStatus);
}

/** What either side may ever learn about the other. Nothing outside this list. */
type Contact = { name: string | null; phone: string | null };

function contactOf(u: unknown): Contact {
  const o = (u ?? {}) as Record<string, unknown>;
  return {
    name: typeof o.name === "string" ? o.name : null,
    phone: typeof o.phone === "string" ? o.phone : null,
  };
}

const HIDDEN: Contact = { name: null, phone: null };

/**
 * Redact a booking row for a PANDIT-facing response.
 *
 * Applies BOTH halves of the ruling in one place:
 *   · contact — `customer` is reduced to { name, phone } and nothing else, ever.
 *     Pre-CONFIRMED both are null. The legacy `customerName`/`customerPhone`
 *     scalars are blanked to match (they are write-dead today, but a future
 *     backfill must not reopen the hole behind this function's back).
 *   · venue — pre-CONFIRMED the pandit gets CITY + PINCODE only. He needs to
 *     judge whether the journey is worth taking; he does not need the house
 *     number and GPS coordinates of a family that has not paid. On CONFIRMED
 *     the full address returns, alongside the name and phone.
 *
 * NOTE ON "city + area": the ruling says city + area, and the schema has no
 * area/landmark column — only venueAddress (full street address), venueCity,
 * venuePincode, and lat/long. venuePincode IS the locality and is what a travel
 * judgement actually needs, so it stands in for "area". If a real area/landmark
 * field is added later it belongs in the pre-CONFIRMED set too.
 */
export function redactBookingForPandit<T extends Record<string, any>>(booking: T): T {
  if (!booking || typeof booking !== "object") return booking;
  const visible = contactVisible(booking.status);
  const out: Record<string, any> = { ...booking };

  // Contact — narrowed ALWAYS, hidden until CONFIRMED.
  if ("customer" in out) out.customer = visible ? contactOf(out.customer) : { ...HIDDEN };
  if ("customerName" in out) out.customerName = visible ? (out.customerName ?? "") : "";
  if ("customerPhone" in out) out.customerPhone = visible ? (out.customerPhone ?? "") : "";

  // Venue — precise location only once he is actually going there.
  if (!visible) {
    if ("venueAddress" in out) out.venueAddress = null;
    if ("eventAddress" in out) out.eventAddress = "";
    if ("venueLatitude" in out) out.venueLatitude = null;
    if ("venueLongitude" in out) out.venueLongitude = null;
  }
  return out as T;
}

/**
 * Redact a booking row for a CUSTOMER-facing response — the mirror.
 *
 * The customer's app has the same promise made to it, and the pandit's name and
 * phone are equally his to withhold until the booking is real. The pandit
 * relation is a PanditProfile whose identity hangs off `.user`, so the contact
 * is lifted from there and the profile's other columns are left alone (they are
 * the public professional listing — rates, experience, languages — not identity).
 */
export function redactBookingForCustomer<T extends Record<string, any>>(booking: T): T {
  if (!booking || typeof booking !== "object") return booking;
  const visible = contactVisible(booking.status);
  const out: Record<string, any> = { ...booking };

  if (out.pandit && typeof out.pandit === "object") {
    const p: Record<string, any> = { ...out.pandit };
    if ("user" in p) p.user = visible ? contactOf(p.user) : { ...HIDDEN };
    out.pandit = p;
  }
  return out as T;
}

/**
 * Dispatch on the REQUESTER's role.
 *
 * `GET /bookings/:id` and `GET /bookings/my` serve customer, pandit and admin
 * from one handler — so the redaction cannot be chosen at the route, only at the
 * request. ADMIN is deliberately unredacted: ops must see both sides and both
 * numbers to run the pilot by hand (the manual-ops runbook is built on exactly
 * that), and ops is not a party whose contact the other party is owed.
 *
 * The default branch is CUSTOMER, not "no redaction" — an unrecognised role must
 * fail CLOSED, or adding a fourth role silently opens both sides.
 */
export function redactBookingForRole<T extends Record<string, any>>(booking: T, role: string): T {
  if (role === "ADMIN") return booking;
  if (role === "PANDIT") return redactBookingForPandit(booking);
  return redactBookingForCustomer(booking);
}

export const redactManyForRole = <T extends Record<string, any>>(rows: T[], role: string): T[] =>
  (rows ?? []).map((r) => redactBookingForRole(r, role));

/** Map helpers — the list paths are where a single missed call site leaks in bulk. */
export const redactManyForPandit = <T extends Record<string, any>>(rows: T[]): T[] =>
  (rows ?? []).map(redactBookingForPandit);
export const redactManyForCustomer = <T extends Record<string, any>>(rows: T[]): T[] =>
  (rows ?? []).map(redactBookingForCustomer);
