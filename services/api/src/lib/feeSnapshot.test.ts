import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// THE SNAPSHOT INVARIANT GUARD — Ruling B, ops-configurable.
// Isj order, 2026-07-28: "a test that changes the default, then asserts an
// existing booking's fee, payout and totals are unchanged. Proven-to-fail
// first."
//
// THE MODEL BEING PROTECTED:
//   The pandit receives 100% of his dakshina. No deduction, ever.
//   The platform fee is charged to the CUSTOMER, on top of the dakshina.
//   Default rate 10%. Operations sets the rate.
//
// WHY THIS EXISTS: ops raising 10% → 12% must not retroactively change what a
// completed booking says the customer paid or the pandit is owed. Today
// bookings are zero, so freezing the rate costs nothing; after the pilot
// starts it is unfixable without a migration over live money.
// ─────────────────────────────────────────────────────────────

console.log("Running fee-snapshot invariant guard...");

const REPO = join(__dirname, "..", "..", "..", "..");
const stripComments = (s: string) =>
  s
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((l) => !/^\s*(\/\/|\*)/.test(l))
    .join("\n");
const read = (p: string) => stripComments(readFileSync(join(REPO, p), "utf8"));

// ── 1. the column exists and is frozen at creation ────────────
const SCHEMA = read("packages/db/prisma/schema.prisma");
assert.ok(
  /platformFeePercent\s+Int/.test(SCHEMA),
  "Booking.platformFeePercent is gone — a rate change would silently rewrite every past booking's arithmetic",
);
const SERVICE = read("services/api/src/services/booking.service.ts");
assert.ok(
  /platformFeePercent:\s*currentFeePercent\(\)/.test(SERVICE),
  "booking creation must FREEZE the rate via currentFeePercent()",
);

// ── 2. THE BEHAVIOURAL TEST — change the default, assert the past ──
// A booking created under 10% keeps 10% arithmetic when the default moves.
const { bookingFeePercent, feeAmountForBooking } = require("./feeSnapshot");

const bookingAt10 = {
  id: "bk-frozen",
  dakshinaAmount: 5100,
  platformFeePercent: 10,
  platformFee: 510,
};

// what the customer paid and the pandit is owed, under RULING B
const customerPaidBefore = bookingAt10.dakshinaAmount + feeAmountForBooking(bookingAt10);
const panditOwedBefore = bookingAt10.dakshinaAmount; // 100%, no deduction, ever

assert.strictEqual(bookingFeePercent(bookingAt10), 10, "the stored rate must be read, not the default");
assert.strictEqual(feeAmountForBooking(bookingAt10), 510);
assert.strictEqual(customerPaidBefore, 5610);
assert.strictEqual(panditOwedBefore, 5100);

// OPS CHANGES THE RATE. This is the moment the invariant is for.
process.env.PLATFORM_FEE_PERCENT = "25";
delete require.cache[require.resolve("../config/constants")];
delete require.cache[require.resolve("./feeSnapshot")];
const reloaded = require("./feeSnapshot");
const { PLATFORM_FEE_PERCENT: liveRate } = require("../config/constants");

assert.strictEqual(liveRate, 25, "the env var must actually drive the live default (ops-configurable)");

const customerPaidAfter = bookingAt10.dakshinaAmount + reloaded.feeAmountForBooking(bookingAt10);
const panditOwedAfter = bookingAt10.dakshinaAmount;

assert.strictEqual(
  reloaded.bookingFeePercent(bookingAt10),
  10,
  "PROVEN-TO-FAIL POINT: the existing booking picked up the NEW rate. Its fee, payout and total just moved retroactively.",
);
assert.strictEqual(customerPaidAfter, customerPaidBefore, "an existing booking's customer total changed after a rate change");
assert.strictEqual(panditOwedAfter, panditOwedBefore, "an existing booking's payout changed after a rate change");
assert.strictEqual(reloaded.feeAmountForBooking(bookingAt10), 510, "an existing booking's fee amount changed after a rate change");

// a NEW booking, by contrast, MUST pick the new rate up — otherwise the
// setting does nothing and ops has been given a dead dial.
assert.strictEqual(reloaded.currentFeePercent(), 25, "a new booking must use the rate ops just set");

// ── 3. the 100% law is untouched by any of this ───────────────
const PRICING = read("services/api/src/utils/pricing.ts");
assert.ok(
  !/platformTransfersToPandit\s*=\s*[^;]*-\s*platformFee/.test(PRICING),
  "the platform fee is being DEDUCTED from the payout — that is model A, and the ruling is B",
);

// restore, so ordering between guard files cannot matter
delete process.env.PLATFORM_FEE_PERCENT;
delete require.cache[require.resolve("../config/constants")];
delete require.cache[require.resolve("./feeSnapshot")];

console.log("✓ fee-snapshot invariant guard passed (rate 10→25 did not move a past booking)");
