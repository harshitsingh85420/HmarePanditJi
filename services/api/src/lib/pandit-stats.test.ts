import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// BUILD-FAILING GUARD — /pandit/stats (the home 3-stat row). Three laws:
//  1. TRUTHFUL-NULL: no reviews → rating null; no finished bookings →
//     completionPct null. Never a fabricated 0★/0%.
//  2. USER-ID SOURCING: Review.revieweeId is a USER id (Review.reviewee →
//     User) — the same profile-id trap the notify-user-id guard exists for.
//     The aggregate must key on the USER id, never profile.id.
//  3. REGISTERED + GUARDED: the route exists in app.ts behind
//     authenticate + roleGuard(PANDIT) (BB1: on the path the client calls).
// ─────────────────────────────────────────────────────────────
const controller = readFileSync(join(__dirname, "..", "controllers", "auth.controller.ts"), "utf8");
const appTs = readFileSync(join(__dirname, "..", "app.ts"), "utf8");

console.log("Running pandit-stats guard (truthful-null + user-id sourcing)…");

// handler exists
const fnIdx = controller.indexOf("export const getPanditStats");
assert.ok(fnIdx >= 0, "getPanditStats handler must exist in auth.controller");
const fnBody = controller.slice(fnIdx, controller.indexOf("export const", fnIdx + 10));

// 1) truthful nulls on BOTH derived stats
assert.ok(/rating:\s*reviewCount > 0 \?[\s\S]{0,120}?:\s*null/.test(fnBody), "rating must be null when there are no reviews");
assert.ok(/completionPct:\s*finished > 0 \?[\s\S]{0,120}?:\s*null/.test(fnBody), "completionPct must be null when nothing has finished");

// 2) review aggregate keyed on the USER id, and never on a profile id
assert.ok(/revieweeId:\s*userId/.test(fnBody), "review aggregate must key on revieweeId: userId (USER id)");
assert.ok(!/revieweeId:\s*(?:profile|panditProfile)\.id/.test(fnBody), "revieweeId must NEVER be a profile id");

// bookings, by contrast, key on the PanditProfile FK
assert.ok(/panditId:\s*profile\.id/.test(fnBody), "booking counts key on panditId: profile.id (the profile FK)");

// 3) route registered with auth + role guard
assert.ok(
  /app\.get\(`\$\{API_PREFIX\}\/pandit\/stats`,\s*\{\s*preHandler:\s*\[authenticate,\s*roleGuard\("PANDIT"\)\]\s*\},\s*getPanditStats\)/.test(appTs),
  "/pandit/stats must be registered behind authenticate + roleGuard(PANDIT)",
);

console.log("pandit-stats guard: truthful nulls, user-id sourcing, guarded route ✅");
