import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { panditView, dbStatusesForView, withPanditView } from "./bookingStatus";

console.log("Running bookingStatus + accept/reject handler guards (BB1)...");

// ── the mapping law (DB Machine-B <-> pandit-UI Machine-A) ────────────────────
assert.strictEqual(panditView("PANDIT_REQUESTED"), "REQUESTED", "born status shows as REQUESTED");
// SUPERSEDED 2026-07-29 — this asserted panditView("CREATED") === "REQUESTED".
// It was right when written: the point of BB1 was that the pandit's tabs were
// empty because nothing mapped DB vocabulary to his. Mapping CREATED into the
// same bucket made the rows appear.
//
// It also made an UNPAID booking appear as an actionable request, and
// स्वीकार करें answered 409 — the accept handler can only transition from
// PANDIT_REQUESTED, which only processPaymentSuccess produces. The first real
// booking this product took (HPJ-2026-19028) hit exactly that.
//
// Inverted and kept, not deleted: the two states must stay separately
// nameable. lib/deadControlState.test.ts pins the whole law.
assert.strictEqual(panditView("CREATED"), "AWAITING_PAYMENT");
assert.notStrictEqual(panditView("CREATED"), panditView("PANDIT_REQUESTED"));
assert.strictEqual(panditView("CONFIRMED"), "ACCEPTED", "confirmed shows as ACCEPTED to the pandit");
assert.strictEqual(panditView("PANDIT_EN_ROUTE"), "ACCEPTED");
assert.strictEqual(panditView("PUJA_IN_PROGRESS"), "IN_PROGRESS");
assert.strictEqual(panditView("COMPLETED"), "COMPLETED");
assert.strictEqual(panditView("CANCELLED"), "CANCELLED");
assert.strictEqual(panditView("CANCELLATION_REQUESTED"), "CANCELLED");
assert.strictEqual(panditView("REJECTED"), "REJECTED");
// Machine-A legacy/seed rows pass through unchanged.
assert.strictEqual(panditView("ACCEPTED"), "ACCEPTED");
assert.strictEqual(panditView("REQUESTED"), "REQUESTED");

// The New-booking poll (?status=REQUESTED) MUST hit real PANDIT_REQUESTED rows.
assert.ok(dbStatusesForView("REQUESTED").includes("PANDIT_REQUESTED"), "REQUESTED filter covers PANDIT_REQUESTED");
// SUPERSEDED 2026-07-29, same ruling as the panditView("CREATED") line above.
// This asserted the New-booking poll (?status=REQUESTED, home/page.tsx runs it
// every 30s) ALSO covered CREATED. That is precisely what must not happen: the
// poll drives the "नई विनती" alert, so an unpaid booking announced itself as a
// new request the pandit could answer — and answering it 409'd.
// Inverted and kept; the unpaid rows are reachable under their own filter.
assert.ok(
  !dbStatusesForView("REQUESTED").includes("CREATED"),
  "the REQUESTED filter covers CREATED again — the 30-second New-booking poll will announce " +
    "unpaid bookings as answerable requests, and स्वीकार करें will 409 on them",
);
assert.ok(
  dbStatusesForView("AWAITING_PAYMENT").includes("CREATED"),
  "no filter reaches CREATED any more — the unpaid rows would be invisible rather than merely " +
    "unactionable, and the pandit could not plan around a booking he already has",
);
assert.ok(dbStatusesForView("ACCEPTED").includes("CONFIRMED"), "ACCEPTED filter covers CONFIRMED");

// withPanditView copies + maps without mutating the source.
{
  const row = { id: "b1", status: "PANDIT_REQUESTED", other: 1 };
  const view = withPanditView(row);
  assert.strictEqual(view.status, "REQUESTED");
  assert.strictEqual(row.status, "PANDIT_REQUESTED", "source not mutated");
  assert.strictEqual(view.other, 1, "other fields preserved");
}

// ── handler guards: accept/reject must work on the REAL status, atomically,
//    and notify the customer (grep the compiled-source intent) ────────────────
const controller = readFileSync(join(__dirname, "..", "controllers", "auth.controller.ts"), "utf-8");

// The dead REQUESTED-only precondition that 409'd every real booking is gone.
assert.ok(
  !/Only bookings in REQUESTED state can be (accepted|rejected)/.test(controller),
  "old REQUESTED-only guard removed from accept/reject",
);
// Accept/reject transition atomically from the real pending set.
const pendingUpdates = controller.match(/updateMany\(\{\s*where:\s*\{[^}]*status:\s*\{\s*in:\s*PENDING/g) || [];
assert.ok(pendingUpdates.length >= 2, "accept AND reject use an atomic conditional updateMany over PENDING");
// Accept lands on CONFIRMED (customer app's canonical), reject on CANCELLED.
assert.ok(/data:\s*\{\s*status:\s*"CONFIRMED"/.test(controller), "accept transitions to CONFIRMED");
assert.ok(/data:\s*\{\s*status:\s*"CANCELLED"\s*\}/.test(controller), "reject transitions to CANCELLED");
// The customer is notified on BOTH.
assert.ok(/type:\s*"BOOKING_CONFIRMED"[\s\S]*userId:\s*booking\.customerId|booking\.customerId[\s\S]*BOOKING_CONFIRMED/.test(controller), "accept notifies the customer");
assert.ok(/type:\s*"BOOKING_CANCELLED"/.test(controller), "reject notifies the customer (booking released)");

// ── G2 (2026-07-31): hybrid — the mapping section is behavioural (real
// invocations, values asserted; counted by re-invocation below). The
// controller regexes are proven here; the dead precondition that 409'd
// HPJ-2026-19028 is its own tainted specimen.
import { proveMatchers, proveSaw } from "./g2";
proveSaw("bookingStatus", "controller source read (chars)", controller.length);
proveSaw("bookingStatus", "mapping invocations whose values were asserted",
  [panditView("CREATED"), panditView("PANDIT_REQUESTED"), panditView("CONFIRMED"),
   dbStatusesForView("REQUESTED").length, dbStatusesForView("AWAITING_PAYMENT").length,
   withPanditView({ id: "g2", status: "CONFIRMED" }).status].length);
proveMatchers("bookingStatus", [
  ["the dead REQUESTED-only precondition (409'd the first real booking)",
    /Only bookings in REQUESTED state can be (accepted|rejected)/,
    'throw new AppError("Only bookings in REQUESTED state can be accepted", 409);'],
  ["the atomic conditional updateMany", /updateMany\(\{\s*where:\s*\{[^}]*status:\s*\{\s*in:\s*PENDING/,
    'await prisma.booking.updateMany({ where: { id, panditId, status: { in: PENDING_STATUSES } },'],
  ["accept lands on CONFIRMED", /data:\s*\{\s*status:\s*"CONFIRMED"/,
    'data: { status: "CONFIRMED", acceptedAt: new Date() },'],
  ["reject notifies the customer", /type:\s*"BOOKING_CANCELLED"/,
    'type: "BOOKING_CANCELLED",'],
]);

console.log("bookingStatus + handler guards: ALL ASSERTIONS PASSED ✅");
