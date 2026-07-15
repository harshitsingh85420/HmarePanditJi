import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// BUILD-FAILING GUARD (BB1-shaped): ठहराव (stay/accommodation) data must be
// written to the accommodationPrefs column, NEVER into foodPrefs. The readiness
// step-4 handler once wrote stayAtCustomerHome + hotelTier INTO foodPrefs while
// the dedicated accommodationPrefs Json column sat unused — the exact
// wrong-column bug BB1 taught us to guard. This fails the build if stay fields
// leak back into the foodPrefs write, or if accommodationPrefs stops being
// written with its four fields.
// ─────────────────────────────────────────────────────────────
const src = readFileSync(
  join(__dirname, "..", "controllers", "readiness.controller.ts"),
  "utf8",
);

console.log("Running accommodation-column guard (stay → accommodationPrefs, never foodPrefs)…");

// 1) stay is written to its OWN column, with all four fields.
const accBlock = src.match(/update\.accommodationPrefs\s*=\s*\{([\s\S]*?)\};/);
assert.ok(accBlock, "readiness.controller must write update.accommodationPrefs = { … }");
for (const field of ["customerHomeOk", "hotelTier", "sharedRoomOk", "advanceNoticeDays"]) {
  assert.ok(new RegExp(`\\b${field}\\b`).test(accBlock[1]), `accommodationPrefs must include ${field}`);
}

// 2) foodPrefs write must NOT contain any stay field (no leakage back).
const foodBlock = src.match(/update\.foodPrefs\s*=\s*\{([\s\S]*?)\};/);
assert.ok(foodBlock, "readiness.controller must write update.foodPrefs = { … }");
assert.ok(
  !/stayAtCustomerHome/.test(foodBlock[1]),
  "foodPrefs must NOT contain stayAtCustomerHome — stay belongs in accommodationPrefs",
);
assert.ok(
  !/hotelTier/.test(foodBlock[1]),
  "foodPrefs must NOT contain hotelTier — stay belongs in accommodationPrefs",
);

// self-checks: the patterns behave
assert.ok(/\bcustomerHomeOk\b/.test("customerHomeOk,"), "self-check field match");
assert.ok(!/stayAtCustomerHome/.test("dietary: null, hotelFoodOk: null"), "self-check food-only");

console.log("accommodation-column guard: stay lives in accommodationPrefs, foodPrefs is food-only ✅");
