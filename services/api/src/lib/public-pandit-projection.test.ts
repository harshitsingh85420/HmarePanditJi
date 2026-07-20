// ─────────────────────────────────────────────────────────────
// PUBLIC-PROJECTION GUARD  (register: F04-05, security-grade)
//
// GET /pandits/:id is served with NO authentication — the customer
// pandit-detail page is a logged-out SSR render. Everything this handler
// selects is world-readable, so the select IS a publication decision.
//
// THIS GUARD IS WHAT MAKES THE PUBLIC EXEMPTION SAFE. The route was
// opened only because the projection is pinned here; if this file is
// weakened, the exemption in app.ts must be reverted in the same commit.
//
// What is pinned:
//   1. no banned field is named anywhere in the projection
//   2. the projection is `select:` ONLY — never `include:`
//   3. nested relations are allow-listed too, so the "new column is
//      public by default" hazard cannot just move one level down
//   4. the route still exists in the shape this reasoning assumes
//
// (2) and (3) matter more than (1) over time. A banned-name check only
// catches today's sensitive columns; requiring an allow-list means a
// column added to PanditProfile, PujaService or SamagriPackage tomorrow
// is private until someone deliberately publishes it.
// ─────────────────────────────────────────────────────────────
import { readFileSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert";

const CONTROLLER = join(__dirname, "..", "controllers", "pandit.controller.ts");
const ROUTES = join(__dirname, "..", "routes", "pandit.routes.ts");
const APP = join(__dirname, "..", "app.ts");

const rawSrc = readFileSync(CONTROLLER, "utf-8");
const routes = readFileSync(ROUTES, "utf-8");
const app = readFileSync(APP, "utf-8");

/**
 * Strip comments before analysing code.
 * Without this the guard matches the word `include:` inside its own
 * explanatory comment — and, worse, a real `include:` could be smuggled
 * past a naive check by a reviewer assuming any hit is "just the comment".
 */
function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
}

const src = stripComments(rawSrc);

/** Fields that must never reach an unauthenticated caller. */
const BANNED = [
  "bankAccountNumber",
  "bankAccountName",
  "bankIfscCode",
  "bankIfsc",
  "bankName",
  "bankVerified",
  "bankAccountAdded",
  "upiId",
  "aadhaarFrontUrl",
  "aadhaarBackUrl",
  "aadhaarDocUrl",
  "aadhaarEncrypted",
  "aadhaarLastFour",
  "aadhaarConsentAt",
  "aadhaarVerified",
  "fullAddress",
  "latitude",
  "longitude",
  "deviceInfo",
  "deviceOs",
  "deviceModel",
  "adminNotes",
  "rejectionReason",
  "verifiedById",
  "phone",
];

/** Balanced-brace body of the named exported function. */
function functionBody(text: string, name: string): string {
  const start = text.indexOf(`export async function ${name}`);
  assert.ok(start > 0, `${name} not found — did the handler get renamed?`);
  const open = text.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return text.slice(start);
}

let failures = 0;
const fail = (msg: string) => {
  console.error(`  ✗ ${msg}`);
  failures++;
};

// ── the public detail handler ────────────────────────────────
const detail = functionBody(src, "getPanditProfileById");

// 1 — select-only, never include
if (/\binclude\s*:/.test(detail)) {
  fail(
    "getPanditProfileById uses `include:` — that returns every model scalar, " +
      "which on a PUBLIC route publishes bank and Aadhaar columns. Use `select:`."
  );
}
if (!/\bselect\s*:/.test(detail)) {
  fail("getPanditProfileById has no `select:` allow-list");
}

// 2 — no banned field anywhere in the handler's projection
for (const field of BANNED) {
  if (new RegExp(`\\b${field}\\s*:\\s*true`).test(detail)) {
    fail(`public projection selects banned field \`${field}\``);
  }
}

// 3 — every relation in the projection is itself allow-listed.
// A relation given only a `where` returns all of ITS scalars.
for (const rel of ["pujaServices", "samagriPackages", "user"]) {
  const at = detail.indexOf(`${rel}:`);
  if (at < 0) continue; // relation not projected at all — fine
  const open = detail.indexOf("{", at);
  let depth = 0;
  let body = "";
  for (let i = open; i < detail.length; i++) {
    if (detail[i] === "{") depth++;
    else if (detail[i] === "}") {
      depth--;
      if (depth === 0) {
        body = detail.slice(open, i + 1);
        break;
      }
    }
  }
  if (!/\bselect\s*:/.test(body)) {
    fail(
      `relation \`${rel}\` is projected without a \`select:\` — it returns every ` +
        `scalar of its own model, so a sensitive column added there becomes public silently`
    );
  }
  for (const field of BANNED) {
    if (new RegExp(`\\b${field}\\s*:\\s*true`).test(body)) {
      fail(`relation \`${rel}\` selects banned field \`${field}\``);
    }
  }
}

// ── the sibling search endpoint, same rules ──────────────────
const search = functionBody(src, "getPandits");
if (/\binclude\s*:/.test(search)) {
  fail("getPandits uses `include:` — use `select:`");
}
for (const field of BANNED) {
  if (new RegExp(`\\b${field}\\s*:\\s*true`).test(search)) {
    fail(`public search projection selects banned field \`${field}\``);
  }
}

// ── the premise: this route really is public ─────────────────
// The guard's whole justification is that the route is unauthenticated.
// If the public exemption is removed, this file's reasoning changes and
// someone should revisit it deliberately rather than silently.
if (!/get\(\s*"\/:id"/.test(routes)) {
  fail('GET "/:id" not found in pandit.routes.ts — route shape changed, re-check this guard');
}
if (!/isPublicPanditRead/.test(app)) {
  fail(
    "the scoped public-read exemption is missing from app.ts — either it was reverted " +
      "(then this guard's public-surface premise is stale) or it was renamed"
  );
}

if (failures > 0) {
  console.error(`\n✗ public-pandit-projection: ${failures} violation(s)\n`);
  process.exit(1);
}
console.log(
  "✓ public-pandit-projection: select-only, relations allow-listed, no bank/Aadhaar/geo/phone fields"
);
