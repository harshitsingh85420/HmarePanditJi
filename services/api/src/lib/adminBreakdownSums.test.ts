import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { calculateGrandTotal } from "../utils/pricing";

// ─────────────────────────────────────────────────────────────
// THE ADMIN BREAKDOWN MUST RECONCILE.
// Isj order, 2026-07-28.
//
// The admin drawer used to print ₹0 / ₹0 / ₹0 / ₹0 beneath a CORRECT grand
// total, because the controller's select carried grandTotal alone while the
// local interface declared the components. To an operator that reads as
// "this booking had no dakshina" — worse than showing nothing.
//
// The components are now projected. This guard proves the set is COMPLETE:
// the fields the drawer renders must add up to the charged total, computed by
// the server's own single money source. A breakdown that does not reconcile
// invites an operator to trust numbers that do not describe the money.
//
// PROVEN IN BOTH DIRECTIONS (standing law):
//  · proven-to-pass — real compositions reconcile exactly;
//  · proven-to-fail — drop any one component and the sum diverges, which is
//    what makes the completeness claim meaningful rather than decorative.
// ─────────────────────────────────────────────────────────────

console.log("Running admin-breakdown reconciliation guard...");

/**
 * The fields that COMPOSE grandTotal, in render order.
 *
 * `samagriAmount` is deliberately NOT here: calculateGrandTotal neither
 * returns it nor includes it in grandTotal, and platformTransfersToPandit excludes it too.
 * Samagri is a separate customer transaction (the samagri cart), so listing it
 * as a component of the charged total would make every samagri booking report
 * a false mismatch. It is shown in the drawer OUTSIDE the total, labelled.
 */
const DRAWER_FIELDS = [
  "dakshinaAmount",
  "travelCost",
  "foodAllowanceAmount",
  "accommodationCost",
  "platformFee",
  "platformFeeGst",
  "travelServiceFee",
  "travelServiceFeeGst",
] as const;

const CASES = [
  { label: "local booking, no travel", dakshinaAmount: 5100, travelCost: 0, foodAllowanceDays: 0, accommodationCost: 0, samagriAmount: 0 },
  { label: "with samagri", dakshinaAmount: 11000, travelCost: 0, foodAllowanceDays: 0, accommodationCost: 0, samagriAmount: 3200 },
  { label: "outstation with food + stay", dakshinaAmount: 21000, travelCost: 4300, foodAllowanceDays: 2, accommodationCost: 2500, samagriAmount: 1800 },
  { label: "floor-priced booking", dakshinaAmount: 501, travelCost: 0, foodAllowanceDays: 0, accommodationCost: 0, samagriAmount: 0 },
];

for (const c of CASES) {
  const fin: Record<string, number> = calculateGrandTotal({
    dakshinaAmount: c.dakshinaAmount,
    travelCost: c.travelCost,
    foodAllowanceDays: c.foodAllowanceDays,
    accommodationCost: c.accommodationCost,
    samagriAmount: c.samagriAmount,
  } as never) as never;

  const sum = DRAWER_FIELDS.reduce((n, f) => n + (Number(fin[f]) || 0), 0);
  assert.strictEqual(
    sum,
    fin.grandTotal,
    `${c.label}: the drawer's components sum to ₹${sum} but the charged total is ₹${fin.grandTotal}. ` +
      `A field the customer is charged for is missing from the admin projection.`,
  );

  // RULING B stays visible here too: the pandit keeps 100% of dakshina.
  assert.ok(
    fin.platformTransfersToPandit >= c.dakshinaAmount,
    `${c.label}: payout ₹${fin.platformTransfersToPandit} is below the dakshina ₹${c.dakshinaAmount} — the fee was deducted`,
  );
}

// ── proven-to-fail: dropping any single component must break the sum ──
{
  const fin: Record<string, number> = calculateGrandTotal({
    dakshinaAmount: 21000, travelCost: 4300, foodAllowanceDays: 2, accommodationCost: 2500, samagriAmount: 1800,
  } as never) as never;
  let brokenAtLeastOnce = false;
  for (const dropped of DRAWER_FIELDS) {
    if (!Number(fin[dropped])) continue; // a zero component cannot prove anything
    const partial = DRAWER_FIELDS.filter((f) => f !== dropped).reduce((n, f) => n + (Number(fin[f]) || 0), 0);
    assert.notStrictEqual(partial, fin.grandTotal, `dropping ${dropped} still reconciled — the check is decorative`);
    brokenAtLeastOnce = true;
  }
  assert.ok(brokenAtLeastOnce, "no non-zero component was exercised; the negative case proved nothing");
}

// ── the projection actually ships the fields the drawer reads ──
const CONTROLLER = readFileSync(join(__dirname, "..", "controllers", "admin.controller.ts"), "utf8");
// `mappedBookings` appears in more than one handler, so slice from the
// function we care about to the NEXT occurrence after it — not the first in
// the file, which sits in an earlier function and yields a backwards window.
const fnAt = CONTROLLER.indexOf("export const getAllBookingsAdmin");
assert.ok(fnAt > -1, "getAllBookingsAdmin not found");
const selectBlock = CONTROLLER.slice(fnAt, CONTROLLER.indexOf("mappedBookings", fnAt));
for (const f of DRAWER_FIELDS) {
  assert.ok(
    new RegExp(`${f}:\\s*true`).test(selectBlock),
    `admin booking-list select is missing ${f} — the drawer would render a fabricated 0 for it`,
  );
}

console.log(`✓ admin-breakdown guard passed (${CASES.length} compositions reconcile; all ${DRAWER_FIELDS.length} fields projected)`);
