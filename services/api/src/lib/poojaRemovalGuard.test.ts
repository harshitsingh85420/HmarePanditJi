import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  REMOVE_BLOCKING_STATUSES,
  TERMINAL_BOOKING_STATUSES,
  canRemovePooja,
  poojaBookingWhere,
} from "./poojaRules";

// ─────────────────────────────────────────────────────────────
// P1 GUARD (harsh-QA PAGE 13/14, Isj order 2026-07-25): the ✖'s
// active-booking guard was DEAD TWO WAYS —
//   (1) it matched Booking.pujaType, a @default("") column that
//       createBooking NEVER writes (it writes eventType), and
//   (2) it looked for REQUESTED/ACCEPTED/IN_PROGRESS, statuses
//       createBooking never sets (it sets CREATED).
// Both had to be wrong for the bug to hide: either alone would have
// shown up as a false 409. A pandit could remove a pooja that had a
// live booking on it. The law now: block on EVERY non-terminal
// status, matched on the column bookings actually carry.
// ─────────────────────────────────────────────────────────────

console.log("Running pooja-removal guard tests...");

// the blocking set is DERIVED from what is terminal
{
  assert.deepStrictEqual(
    [...TERMINAL_BOOKING_STATUSES].sort(),
    ["CANCELLED", "COMPLETED", "REFUNDED", "REJECTED"],
  );

  // the status createBooking ACTUALLY sets — the old set missed it
  assert.ok(REMOVE_BLOCKING_STATUSES.includes("CREATED" as never), "CREATED must block removal");

  // every live journey state a real booking moves through
  for (const s of [
    "PANDIT_REQUESTED",
    "CONFIRMED",
    "TRAVEL_BOOKED",
    "PANDIT_EN_ROUTE",
    "PANDIT_ARRIVED",
    "PUJA_IN_PROGRESS",
    "CANCELLATION_REQUESTED",
  ]) {
    assert.ok(REMOVE_BLOCKING_STATUSES.includes(s as never), `${s} must block removal`);
  }

  // the legacy pandit-side states keep blocking
  for (const s of ["REQUESTED", "ACCEPTED", "IN_PROGRESS"]) {
    assert.ok(REMOVE_BLOCKING_STATUSES.includes(s as never), `${s} must block removal`);
  }

  // a finished booking never blocks
  for (const s of TERMINAL_BOOKING_STATUSES) {
    assert.ok(!REMOVE_BLOCKING_STATUSES.includes(s as never), `${s} must NOT block removal`);
  }

  // a NEW status defaults to BLOCKING (the safe direction): the set is
  // (all statuses − terminal), so the enum size is pinned — bump it
  // WITH a decision about the new status, never silently.
  assert.strictEqual(
    REMOVE_BLOCKING_STATUSES.length + TERMINAL_BOOKING_STATUSES.length,
    15,
    "BookingStatus enum changed — decide whether the new status blocks removal",
  );
}

// the where-clause matches the column bookings actually carry
{
  const where = poojaBookingWhere("profile-1", "सत्यनारायण कथा") as any;
  const cols = (where.OR as Array<Record<string, unknown>>).map((o) => Object.keys(o)[0]);
  assert.ok(cols.includes("eventType"), "must match eventType (what createBooking writes)");
  assert.ok(cols.includes("pujaType"), "must still match the legacy pujaType column");
  assert.strictEqual(where.panditId, "profile-1");
  assert.strictEqual(where.status.in, REMOVE_BLOCKING_STATUSES);
}

// canRemovePooja itself is unchanged
{
  assert.strictEqual(canRemovePooja(0), true);
  assert.strictEqual(canRemovePooja(1), false);
}

// the controller must use the shared where-clause, not a hand-rolled query
{
  const src = readFileSync(join(__dirname, "..", "controllers", "auth.controller.ts"), "utf8");
  const start = src.indexOf("export const removeSpecialization");
  assert.ok(start > 0, "removeSpecialization not found");
  const fn = src.slice(start, start + 1800);
  assert.ok(
    /prisma\.booking\.count\(\{\s*where: poojaBookingWhere\(/.test(fn),
    "removeSpecialization must count through poojaBookingWhere",
  );
  assert.ok(!/pujaType: poojaType,/.test(fn), "the dead single-column match must be gone");
}

console.log("✓ pooja-removal guard tests passed");
