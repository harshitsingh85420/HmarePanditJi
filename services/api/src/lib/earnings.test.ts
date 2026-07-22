import assert from "node:assert";
import { computeEarnings } from "./earnings";

console.log("Running computeEarnings unit tests...");

// Founder decision 2026-07-21 (CONFLICT_RULINGS #7): the pandit keeps 100% of
// the dakshina — कोई कटौती. `platformFee` is still computed (customer-side,
// informational) but is NEVER subtracted from what the pandit receives.

// Test case 1 matching the user's checklist
const res1 = computeEarnings({
  dakshina: 35000,
  travel: 2000,
  food: 1000,
  samagri: 2100,
});

// platformFee reference value unchanged (10% of 35000 = 3500) but NOT deducted
assert.strictEqual(res1.platformFee, 3500);
assert.strictEqual(res1.dakshinaNet, 35000); // FULL dakshina — 100% to pandit
// totalToPandit = 35000 (full dakshina) + 2000 + 1000 + 2100 = 40100
assert.strictEqual(res1.totalToPandit, 40100);

// Test case 2 with schema fields
const res2 = computeEarnings({
  dakshinaAmount: 20000,
  travelAmount: 1500,
  foodAllowance: 500,
  samagriAmount: 0,
});

assert.strictEqual(res2.platformFee, 2000); // 10% of 20000 (reference only)
assert.strictEqual(res2.dakshinaNet, 20000); // FULL dakshina — no deduction
// totalToPandit = 20000 (full) + 1500 + 500 = 22000
assert.strictEqual(res2.totalToPandit, 22000);

console.log("✅ computeEarnings tests passed!");
