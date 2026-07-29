import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { codeOnly } from "@hmarepanditji/utils/code-only";

// ─────────────────────────────────────────────────────────────
// WHICH PANDIT ROUTES ARE PUBLIC — pinned in BOTH directions.
//
// ACTIVE since 2026-07-29, shipped with the ruling that widened the allow-list
// to all four documented-public routes.
//
// ⚠️ ACCEPTED FRAGILITY: this guard treats a JSDoc COMMENT as a contract surface
// ("documented Public ⇒ allow-listed"). That coupling is DELIBERATE — the intent
// belongs where the route is defined, and prose is what a reviewer actually
// reads. But prose is editable: deleting the word "Public" above a route
// silently changes this guard's verdict, and nothing would fail. The trade is
// accepted because the alternative — a second hand-maintained list — is the
// duplication this campaign spent five sightings removing. If you edit a route's
// doc comment, you are editing a contract.
//
// WHAT HAPPENED. `89d7eab` (2026-07-20) scoped public reads down to exactly
// `/pandits/:id`. Three sibling routes documented "Public" at their own
// definition — the LIST, reviews, availability — fell under the blanket
// `authenticate + roleGuard("PANDIT")` hook and began returning 401. Because
// roleGuard demands the PANDIT role, a logged-in CUSTOMER was refused too:
// nobody could browse pandits, which is the customer app's entire front door.
//
// It went unnoticed for NINE DAYS because DRIFT-A was 404ing those URLs before
// they could 401, and the empty-state copy ("No verified pandits yet / Run
// database seed") reads identically for both causes.
//
// TWO DIRECTIONS, and the second matters as much as the first:
//   →  a route documented Public MUST be allow-listed  — the front door cannot
//      be silently re-closed by the next scoping change;
//   ←  an allow-listed route MUST be documented Public AND its projection must
//      not name a sensitive field — the list cannot be silently widened, which
//      is the mistake that costs more.
// ─────────────────────────────────────────────────────────────

console.log("Running public-pandit-reads boundary guard...");

const REPO = join(__dirname, "..", "..", "..", "..");
const read = (p: string) => codeOnly(readFileSync(join(REPO, p), "utf8"));
const APP = read("services/api/src/app.ts");
const ROUTES_RAW = readFileSync(join(REPO, "services/api/src/routes/pandit.routes.ts"), "utf8");
const CONTROLLER = read("services/api/src/controllers/pandit.controller.ts");

// ── the allow-list, as the server actually holds it ────────────
const block = /PUBLIC_PANDIT_READS = new Set<string>\(\[([\s\S]*?)\]\)/.exec(APP);
assert.ok(block, "PUBLIC_PANDIT_READS not found in app.ts — the reader has rotted");
const allowed = new Set(
  [...block[1].matchAll(/\$\{API_PREFIX\}([^`'"]*)/g)].map((m) => m[1].trim()).filter(Boolean),
);
assert.ok(allowed.size >= 1, "no routes parsed out of PUBLIC_PANDIT_READS");

// ── routes DOCUMENTED public, read from the JSDoc above each registration ──
// RAW source deliberately: the subject under test IS the comment (see
// RAW_SOURCE_REQUIRED in packages/utils/src/code-only.ts).
const documentedPublic = new Set<string>();
const routeLines = ROUTES_RAW.split(/\r?\n/);
for (let i = 0; i < routeLines.length; i++) {
  const m = /fastify\.get\(\s*["'`]([^"'`]+)["'`]/.exec(routeLines[i]);
  if (!m) continue;
  // Read ONLY the JSDoc block immediately above this registration.
  //
  // A fixed lookback window is WRONG and this guard proved it on its first
  // run: a 12-line window reached back past `/:id/reviews` ("Public list of
  // reviews") and attributed that word to `/:id/services`, whose own doc says
  // only "Get pandit's puja services with pricing". It would have admitted an
  // unreviewed route to a PUBLIC allow-list — a false positive with security
  // consequences. Walk up to the nearest `*/` and stop at its `/**`.
  let end = -1;
  for (let j = i - 1; j >= 0 && j > i - 30; j--) {
    const s = routeLines[j].trim();
    if (s === "") continue;
    if (s.endsWith("*/")) { end = j; }
    break;
  }
  if (end < 0) continue;
  let begin = end;
  while (begin > 0 && !routeLines[begin].trim().startsWith("/**")) begin--;
  const doc = routeLines.slice(begin, end + 1).join("\n");
  if (/^\s*\*\s*Public/im.test(doc)) {
    const path = m[1] === "/" ? "/pandits" : `/pandits${m[1]}`;
    documentedPublic.add(path);
  }
}
assert.ok(documentedPublic.size >= 3, `only ${documentedPublic.size} documented-public routes parsed`);

// ── DIRECTION 1: documented Public ⇒ allow-listed ──────────────
const closed = [...documentedPublic].filter((r) => !allowed.has(r)).sort();
assert.deepStrictEqual(
  closed,
  [],
  `these routes are documented "Public" at their own definition but are NOT in\n` +
    `PUBLIC_PANDIT_READS, so the blanket roleGuard("PANDIT") hook returns 401 to\n` +
    `guests AND to logged-in customers:\n  ${closed.join("\n  ")}\n` +
    `That is how the customer front door closed for nine days.`,
);

// ── DIRECTION 2: allow-listed ⇒ documented Public, and clean ───
const SENSITIVE = [
  "bankAccountNumber", "bankIfsc", "bankAccountName",
  "aadhaarNumber", "aadhaarUrl", "panNumber", "upiId",
];
for (const route of allowed) {
  assert.ok(
    documentedPublic.has(route),
    `"${route}" is in PUBLIC_PANDIT_READS but is not documented "Public" at its definition. ` +
      `Admitting a route here is a security decision — document the intent where the route lives.`,
  );
}
// The two projections that serve those routes must not name a sensitive field.
for (const fn of ["getPandits", "getPanditReviewsHandler"]) {
  const at = CONTROLLER.indexOf(`function ${fn}`);
  assert.ok(at > -1, `${fn} not found — the projection reader has rotted`);
  const body = CONTROLLER.slice(at, at + 4000);
  for (const f of SENSITIVE) {
    assert.ok(
      !body.includes(f),
      `${fn} names "${f}" and serves a PUBLIC route. The whole point of the allow-listed ` +
        `select is that a new column is not public by default.`,
    );
  }
}

// ── NO JSON BLOB may sit in the public LIST projection ─────────
// THE CLASS, not the instance. `travelPreferences` was removed from this
// projection on 2026-07-29, but naming that one field would only pin the
// instance. A JSON column is not an allow-list: every key added to it later
// becomes public with nobody deciding so, which is precisely the hazard the
// explicit `select:` exists to close. PanditProfile carries five JSON columns
// today — travelPreferences, deviceInfo, travelPrefs, foodPrefs,
// accommodationPrefs — and `deviceInfo` alone would be a real privacy incident.
// The list response is built with `...p`, so its select IS the public contract.
const SCHEMA = readFileSync(join(REPO, "packages/db/prisma/schema.prisma"), "utf8");
// Comments stripped through the ONE shared implementation, so a commented-out
// Json column cannot be mistaken for a live one.
const schemaCode = codeOnly(SCHEMA);
const panditModel = /model\s+PanditProfile\s*\{([\s\S]*?)\n\}/.exec(schemaCode);
assert.ok(panditModel, "PanditProfile model not found - the schema reader has rotted");
const jsonColumns = panditModel![1]
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => /^\w+\s+Json\b/.test(l))
  .map((l) => l.split(/\s+/)[0]);
assert.ok(jsonColumns.length >= 3, `only ${jsonColumns.length} JSON columns parsed — the reader has rotted`);

{
  const at = CONTROLLER.indexOf("function getPandits");
  const selectStart = CONTROLLER.indexOf("select:", CONTROLLER.indexOf("panditProfile.findMany", at));
  const listSelect = CONTROLLER.slice(selectStart, selectStart + 1600);
  const leaked = jsonColumns.filter((c) => new RegExp("\\b" + c + "\\s*:\\s*true").test(listSelect));
  assert.deepStrictEqual(
    leaked,
    [],
    `the PUBLIC pandit LIST selects JSON column(s): ${leaked.join(", ")}.
` +
      `A JSON blob is not an allow-list — any key added to it later becomes public with
` +
      `nobody deciding so, on the most-fetched anonymous surface in the product.
` +
      `If a value inside it needs to surface, give it an explicit scalar field.
` +
      `JSON columns on PanditProfile: ${jsonColumns.join(", ")}`,
  );
}

// ── anonymity is not optional on a public reviews route ────────
const rev = CONTROLLER.slice(CONTROLLER.indexOf("function getPanditReviewsHandler"));
assert.ok(
  /isAnonymous\s*\?/.test(rev),
  "the public reviews route must honour isAnonymous — publishing the name of a reviewer who " +
    "chose anonymity is a privacy break, not a display bug",
);
assert.ok(
  /reviewer:\s*\{\s*select:\s*\{\s*name:\s*true\s*\}\s*\}/.test(rev),
  "the reviewer include must stay narrowed to { name } — never the whole User",
);

console.log(
  `✓ public-pandit-reads guard passed (${allowed.size} public routes, all documented and clean; ` +
    `${documentedPublic.size} documented-public routes, all reachable)`,
);
