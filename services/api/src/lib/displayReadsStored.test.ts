import assert from "node:assert";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { earningsFromStored, computeEarnings } from "./earnings";

// BUILD-FAILING GUARD — DISPLAY/PAYOUT READS STORED, NEVER RECOMPUTES.
// Founder decision 2026-07-22 (follows CONFLICT_RULINGS #7): the numbers a
// pandit or admin SEES, and the payout that gets CREATED, must come from the
// booking's frozen columns (panditPayout/platformFee/grandTotal) — not a
// re-run of computeEarnings. Recomputing an old 90/10 booking would show/pay
// 100% on money already settled — a lie about history, and (at the payout) a
// real loss of the platform's historical fee. This guard fails the build if
// computeEarnings leaks back into a controller/route (read path), and pins the
// property that displayed payout === the stored panditPayout.
console.log("Running displayReadsStored guard…");

const SRC = join(__dirname, "..");

// 1. computeEarnings must NOT appear in any controller or route (read/display
//    path). It is a CREATION-time helper only (booking.service uses the pricing
//    delegate, not this). Scan the two read-path dirs.
const READ_DIRS = ["controllers", "routes"];
const offenders: string[] = [];
for (const d of READ_DIRS) {
  const dir = join(SRC, d);
  const walk = (p: string) => {
    for (const name of readdirSync(p)) {
      const fp = join(p, name);
      if (statSync(fp).isDirectory()) walk(fp);
      else if (/\.ts$/.test(fp) && !/\.test\.ts$/.test(fp)) {
        const src = readFileSync(fp, "utf8");
        // a call or import of computeEarnings in a read/display path
        if (/\bcomputeEarnings\s*\(/.test(src) || /import[^\n]*\bcomputeEarnings\b/.test(src)) {
          offenders.push(fp.slice(SRC.length + 1));
        }
      }
    }
  };
  walk(dir);
}
assert.deepStrictEqual(
  offenders,
  [],
  `computeEarnings must not be used in a read/display path (recompute rewrites history) — found in: ${offenders.join(", ")}. Use earningsFromStored.`,
);

// 2. PROPERTY: displayed payout === the STORED panditPayout, for BOTH eras.
//    Old 90/10 row (HPJ-2026-19502 real values): dakshina 2100, stored payout 1890.
{
  const old = earningsFromStored({ dakshinaAmount: 2100, platformFee: 210, panditPayout: 1890 });
  assert.strictEqual(old.totalToPandit, 1890, "old booking must display its STORED payout (1890), not a recompute (2100)");
  assert.strictEqual(old.dakshinaNet, 1890, "old booking net dakshina = stored payout − pass-throughs");
  assert.strictEqual(old.platformFee, 210, "platformFee is the STORED historical fee");
  assert.strictEqual(old.storedPayoutMissing, false);
}
// New 100% row: dakshina 5000, stored payout 5000.
{
  const neu = earningsFromStored({ dakshinaAmount: 5000, platformFee: 500, panditPayout: 5000 });
  assert.strictEqual(neu.totalToPandit, 5000, "new booking displays its stored 100% payout");
  assert.strictEqual(neu.dakshinaNet, 5000);
}
// Pass-throughs are honored from stored columns.
{
  const withPass = earningsFromStored({ dakshinaAmount: 11000, travelCost: 1200, panditPayout: 12200, platformFee: 1100 });
  assert.strictEqual(withPass.totalToPandit, 12200, "payout = stored (dakshina + travel)");
  assert.strictEqual(withPass.dakshinaNet, 11000, "net dakshina = payout − travel");
}

// 3. NULL/ZERO SAFETY: a missing stored payout falls back to the current model
//    AND flags it (never silently recomputes to a wrong historical number).
{
  const missing = earningsFromStored({ dakshinaAmount: 5000, panditPayout: null });
  assert.strictEqual(missing.storedPayoutMissing, true, "null stored payout must be FLAGGED");
  assert.strictEqual(missing.totalToPandit, 5000, "fallback = dakshina + pass-throughs (current model)");
  const zero = earningsFromStored({ dakshinaAmount: 3000, panditPayout: 0 });
  assert.strictEqual(zero.storedPayoutMissing, true, "zero stored payout is treated as missing + flagged");
}

// computeEarnings still exists for CREATION-time use (and its own unit test) —
// this guard only forbids it in read/display paths.
assert.strictEqual(typeof computeEarnings, "function", "computeEarnings remains available for creation-time use");

console.log("displayReadsStored guard: read/display paths use stored columns; displayed payout === stored panditPayout ✅");
