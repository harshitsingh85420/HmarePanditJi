import assert from "node:assert";
import { computeNewMilestones } from "./milestones";

console.log("Running milestones unit tests...");

// Crossing 5 bookings awards FIRST_BOOKING + BOOKINGS_5 when nothing awarded yet
{
  const res = computeNewMilestones(5, 0, new Set());
  assert.deepStrictEqual(res, ["FIRST_BOOKING", "BOOKINGS_5"]);
}

// Awards BOOKINGS_5 exactly once — re-run with it already awarded yields nothing
{
  const res = computeNewMilestones(5, 0, new Set(["FIRST_BOOKING", "BOOKINGS_5"]));
  assert.deepStrictEqual(res, []);
}

// Idempotent on repeated invocation: simulate award then re-check
{
  const awarded = new Set<string>();
  const first = computeNewMilestones(5, 0, awarded);
  first.forEach((k) => awarded.add(k));
  const second = computeNewMilestones(5, 0, awarded);
  assert.deepStrictEqual(second, []);
}

// 4 bookings does NOT award BOOKINGS_5
{
  const res = computeNewMilestones(4, 0, new Set(["FIRST_BOOKING"]));
  assert.deepStrictEqual(res, []);
}

// Earnings thresholds (shubh sankhya): 11k, 51k, 1L
{
  assert.deepStrictEqual(computeNewMilestones(0, 10_999, new Set()), []);
  assert.deepStrictEqual(computeNewMilestones(0, 11_000, new Set()), ["EARNED_11K"]);
  assert.deepStrictEqual(
    computeNewMilestones(0, 150_000, new Set(["EARNED_11K"])),
    ["EARNED_51K", "EARNED_1L"],
  );
}

// Combined: 21 bookings + 51k earned, some already awarded
{
  const res = computeNewMilestones(
    21,
    51_000,
    new Set(["FIRST_BOOKING", "BOOKINGS_5", "EARNED_11K"]),
  );
  assert.deepStrictEqual(res, ["BOOKINGS_11", "BOOKINGS_21", "EARNED_51K"]);
}

console.log("✅ milestones tests passed!");
