import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { proveMatchers, proveSaw, proveDetects } from "./g2";
import { effectiveOnline, PRESENCE_TTL_MS } from "./presence";

// ─────────────────────────────────────────────────────────────
// PRESENCE GUARD — AN ASSERTION BECOMES A COMPUTATION OVER FACTS
// (Isj's isOnline law, ruled 2026-08-03).
//
// Before this law the flag had FOUR writers and zero honesty: no
// heartbeat, no lastSeen column, logout never went offline — a pandit
// who uninstalled the app stayed "online" forever and the profile's
// green dot could lie for weeks. This guard pins the cure:
//   1 · the claim is DERIVED — effectiveOnline(intent, evidence, 90s) —
//       and the detail wire ships the computation, never the raw flag;
//   2 · the heartbeat rides the existing 30s poll + the toggle;
//   3 · presence has exactly TWO writers (toggle + admin force-offline):
//       the uncalled duplicate route and the /me side-door stay dead.
// ─────────────────────────────────────────────────────────────

const GUARD = "presence";
const SRC = join(__dirname, "..");
const authCtrl = readFileSync(join(SRC, "controllers", "auth.controller.ts"), "utf8");
const panditCtrl = readFileSync(join(SRC, "controllers", "pandit.controller.ts"), "utf8");
const panditRoutes = readFileSync(join(SRC, "routes", "pandit.routes.ts"), "utf8");

proveSaw(GUARD, "presence sources read (non-empty)", [authCtrl, panditCtrl, panditRoutes].filter((s) => s.length > 2000).length);

// ── 1 · the pure predicate, both polarities, all four gates ──
const NOW = new Date("2026-08-03T12:00:00Z");
const FRESH = new Date(NOW.getTime() - 30_000);   // one beat ago
const STALE = new Date(NOW.getTime() - PRESENCE_TTL_MS - 1);

proveDetects(
  GUARD,
  "a stale heartbeat computes OFFLINE even with intent on",
  (last: Date | null) => !effectiveOnline(true, last, NOW),
  STALE,   // fired: stale evidence → offline
  FRESH,   // quiet: fresh evidence → online
);
proveDetects(
  GUARD,
  "missing evidence computes OFFLINE (fail-stale, never fail-online)",
  (last: Date | null) => !effectiveOnline(true, last, NOW),
  null,
  FRESH,
);
proveDetects(
  GUARD,
  "intent off computes OFFLINE regardless of a fresh heartbeat",
  (intent: boolean) => !effectiveOnline(intent, FRESH, NOW),
  false,
  true,
);
assert.strictEqual(effectiveOnline(true, FRESH, NOW), true, "the happy path must still exist");
assert.strictEqual(PRESENCE_TTL_MS, 90_000, "the ruled window is 90s — three missed 30s beats");

// ── 2 · the heartbeat rides the poll AND the toggle ──
proveMatchers(GUARD, [
  [
    "the poll route beats the heart",
    /getPanditBookings[\s\S]{0,900}touchLastSeen\(/,
    `export const getPanditBookings = async () => {\n  const profile = x;\n  void touchLastSeen(profile.id);`,
    `export const getPanditBookings = async () => {\n  const profile = x;\n  return rows;`,
  ],
  [
    "the toggle beats the heart on going online",
    /if \(isOnline\) void touchLastSeen\(/,
    `if (isOnline) void touchLastSeen(profile.id);`,
    `return reply.send({ success: true });`,
  ],
  [
    "the detail wire ships the COMPUTATION, not the raw flag",
    /isOnline:\s*effectiveOnline\(/,
    `isOnline: effectiveOnline(pandit.isOnline === true, lastSeen),`,
    `isOnline: pandit.isOnline,`,
  ],
]);
assert.ok(/getPanditBookings[\s\S]{0,900}touchLastSeen\(/.test(authCtrl), "the 30s poll must beat the heart — it IS the heartbeat");
assert.ok(/if \(isOnline\) void touchLastSeen\(/.test(authCtrl), "going online is evidence — the toggle must beat too");
assert.ok(/isOnline:\s*effectiveOnline\(/.test(panditCtrl), "the detail response must derive the claim");

// ── 3 · exactly two writers — the corpses stay dead ──
proveMatchers(GUARD, [
  [
    "a resurrected duplicate toggle route",
    /fastify\.patch\("\/online-status"/,
    `fastify.patch("/online-status", {}, h);`,
    `// PATCH /pandits/online-status IS DEAD`,
  ],
  [
    "the /me side-door reopening",
    /isOnline:\s*z\.boolean\(\)/,
    `isOnline: z.boolean().optional(),`,
    `// isOnline REMOVED`,
  ],
]);
assert.ok(!/fastify\.patch\("\/online-status"/.test(panditRoutes), "the duplicate toggle route must stay dead — two writers only");
assert.ok(!/isOnline:\s*z\.boolean\(\)/.test(panditRoutes), "the /me schema must not carry isOnline — a profile edit never flips presence");

console.log(
  "presence guard ✅ — the claim is computed (intent AND evidence, 90s), the poll+toggle beat the heart, two writers only, fail-stale",
);
