import assert from "node:assert";
import { computeEarnings } from "./earnings";

console.log("Running computeEarnings unit tests...");

// Test case 1 matching the user's checklist
const res1 = computeEarnings({
  dakshina: 35000,
  travel: 2000,
  food: 1000,
  samagri: 2100,
});

// PLATFORM_FEE_PERCENT = 10 (single source): 10% of 35000 = 3500
assert.strictEqual(res1.platformFee, 3500);
assert.strictEqual(res1.totalToPandit, 36600);

// Test case 2 with schema fields
const res2 = computeEarnings({
  dakshinaAmount: 20000,
  travelAmount: 1500,
  foodAllowance: 500,
  samagriAmount: 0,
});

assert.strictEqual(res2.platformFee, 2000); // 10% of 20000
assert.strictEqual(res2.totalToPandit, 20000);

console.log("✅ computeEarnings tests passed!");
