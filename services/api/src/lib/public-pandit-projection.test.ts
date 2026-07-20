// ─────────────────────────────────────────────────────────────
// PANDIT-PROJECTION GUARD  (register: F04-05, security-grade)
//
// GET /pandits/:id and GET /pandits/ are reachable by ANY authenticated
// pandit, for ANY other pandit id. app.ts:215-221 applies authenticate +
// roleGuard("PANDIT") to every /pandit* url, so these are NOT world-
// readable — but every pandit on the platform is a peer, and bank and
// identity data must not cross between peers.
//
// The detail handler used `include:`, which returns every scalar on
// PanditProfile, and then spread the row into the response. That
// published bankAccountNumber, bankIfscCode, upiId, aadhaarFrontUrl,
// aadhaarBackUrl, aadhaarDocUrl, aadhaarEncrypted, fullAddress,
// latitude and longitude to anyone who knew a pandit's id.
//
// Two things are pinned here, and the second is the one that matters
// long-term:
//   1. no banned field is named in a public projection
//   2. public queries use an ALLOW-list (`select`), never `include`
// With `include`, every column added to the model in future is public
// by default and silently so — the vulnerability regenerates itself on
// the next schema change. `select` inverts that: new columns are
// private until someone deliberately publishes them.
// ─────────────────────────────────────────────────────────────
import { readFileSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert";

const CONTROLLER = join(__dirname, "..", "controllers", "pandit.controller.ts");
const ROUTES = join(__dirname, "..", "routes", "pandit.routes.ts");

const src = readFileSync(CONTROLLER, "utf-8");
const routes = readFileSync(ROUTES, "utf-8");

/** Fields that must never reach an unauthenticated caller. */
const BANNED = [
  "bankAccountNumber",
  "bankAccountName",
  "bankIfscCode",
  "bankIfsc",
  "bankName",
  "upiId",
  "aadhaarFrontUrl",
  "aadhaarBackUrl",
  "aadhaarDocUrl",
  "aadhaarEncrypted",
  "aadhaarLastFour",
  "aadhaarConsentAt",
  "fullAddress",
  "latitude",
  "longitude",
  "deviceInfo",
  "adminNotes",
];

/** Extract the balanced { … } body of a prisma call starting at `from`. */
function blockAfter(text: string, from: number): string {
  const open = text.indexOf("{", from);
  if (open < 0) return "";
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) return text.slice(open, i + 1);
    }
  }
  return "";
}

let failures = 0;
const fail = (msg: string) => {
  console.error(`  ✗ ${msg}`);
  failures++;
};

// ── 1. the pandit-readable detail query ───────────────────────────────
// bound to `fastify.get("/:id", getPanditProfileById)` under the
// /pandits prefix, behind the global authenticate + roleGuard("PANDIT")
const detailIdx = src.indexOf("export async function getPanditProfileById");
assert.ok(detailIdx > 0, "getPanditProfileById not found — did the handler get renamed?");

const findUniqueIdx = src.indexOf("panditProfile.findUnique", detailIdx);
assert.ok(findUniqueIdx > 0, "pandit-readable detail query not found");
const detailQuery = blockAfter(src, findUniqueIdx);
assert.ok(detailQuery.length > 0, "could not parse the detail query block");

if (/^\s*include\s*:/m.test(detailQuery)) {
  fail("pandit-readable detail query uses `include:` — every model scalar becomes public. Use `select:`.");
}
if (!/\bselect\s*:/.test(detailQuery)) {
  fail("pandit-readable detail query has no `select:` allow-list");
}
for (const field of BANNED) {
  if (new RegExp(`\\b${field}\\s*:\\s*true`).test(detailQuery)) {
    fail(`pandit-readable detail query selects banned field \`${field}\``);
  }
}

// ── 2. the pandit-readable search query ───────────────────────────────
const searchIdx = src.indexOf("panditProfile.findMany");
if (searchIdx > 0) {
  const searchQuery = blockAfter(src, searchIdx);
  if (/^\s*include\s*:/m.test(searchQuery)) {
    fail("pandit-readable search query uses `include:` — use `select:`");
  }
  for (const field of BANNED) {
    if (new RegExp(`\\b${field}\\s*:\\s*true`).test(searchQuery)) {
      fail(`pandit-readable search query selects banned field \`${field}\``);
    }
  }
}

// ── 3. the route still exists in the shape this guard assumes ──
// If the route is renamed or re-prefixed, the reasoning above stops
// applying and this guard would pass while protecting nothing.
const detailRoute = /get\(\s*"\/:id"/.test(routes);
if (!detailRoute) {
  fail('GET "/:id" route not found — route shape changed, re-check this guard');
}

if (failures > 0) {
  console.error(`\n✗ public-pandit-projection: ${failures} violation(s)\n`);
  process.exit(1);
}
console.log("✓ pandit-projection: pandit-readable endpoints leak no bank/Aadhaar/geo fields");
