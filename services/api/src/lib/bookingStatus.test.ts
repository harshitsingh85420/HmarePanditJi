import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { panditView, dbStatusesForView, withPanditView } from "./bookingStatus";

console.log("Running bookingStatus + accept/reject handler guards (BB1)...");

// ── the mapping law (DB Machine-B <-> pandit-UI Machine-A) ────────────────────
assert.strictEqual(panditView("PANDIT_REQUESTED"), "REQUESTED", "born status shows as REQUESTED");
assert.strictEqual(panditView("CREATED"), "REQUESTED");
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
assert.ok(dbStatusesForView("REQUESTED").includes("CREATED"), "REQUESTED filter covers CREATED");
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
const pendingUpdates = controller.match(/updateMany\(\{\s*where:\s*\{\s*id,\s*panditId:[^}]*status:\s*\{\s*in:\s*PENDING\s*\}/g) || [];
assert.ok(pendingUpdates.length >= 2, "accept AND reject use an atomic conditional updateMany over PENDING");
// Accept lands on CONFIRMED (customer app's canonical), reject on CANCELLED.
assert.ok(/data:\s*\{\s*status:\s*"CONFIRMED"/.test(controller), "accept transitions to CONFIRMED");
assert.ok(/data:\s*\{\s*status:\s*"CANCELLED"\s*\}/.test(controller), "reject transitions to CANCELLED");
// The customer is notified on BOTH.
assert.ok(/type:\s*"BOOKING_CONFIRMED"[\s\S]*userId:\s*booking\.customerId|booking\.customerId[\s\S]*BOOKING_CONFIRMED/.test(controller), "accept notifies the customer");
assert.ok(/type:\s*"BOOKING_CANCELLED"/.test(controller), "reject notifies the customer (booking released)");

console.log("bookingStatus + handler guards: ALL ASSERTIONS PASSED ✅");
