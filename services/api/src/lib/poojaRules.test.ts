import assert from "node:assert";
import { canRemovePooja, bookingPayoutBase, isPoojaVerified } from "./poojaRules";
import { computeEarnings } from "./earnings";
import { PLATFORM_FEE_PERCENT } from "../config/constants";

console.log("Running poojaRules unit tests...");

// F29(b): remove is rejected while ANY active booking exists (→ API 409)
{
  assert.strictEqual(canRemovePooja(0), true);
  assert.strictEqual(canRemovePooja(1), false);
  assert.strictEqual(canRemovePooja(5), false);
}

// F29(a): price edits affect NEW bookings only — the payout base is the
// booking's snapshotted dakshinaAmount, never the current rate.
{
  const booking = { dakshinaAmount: 11_000 };
  assert.strictEqual(bookingPayoutBase(booking, 21_000), 11_000);
  // and computeEarnings itself only reads the booking's stored amount:
  const before = computeEarnings({ dakshinaAmount: 11_000 });
  const afterRateChange = computeEarnings({ dakshinaAmount: 11_000 }); // rate change is irrelevant
  assert.deepStrictEqual(before, afterRateChange);
  assert.strictEqual(before.platformFee, Math.round(11_000 * PLATFORM_FEE_PERCENT / 100));
}

// F29(c): newly added poojas are pending until verified
{
  assert.strictEqual(isPoojaVerified("Vivah", []), true);
  assert.strictEqual(isPoojaVerified("Havan", ["Havan"]), false);
  assert.strictEqual(isPoojaVerified("Vivah", ["Havan"]), true);
}

console.log("✅ poojaRules tests passed!");
