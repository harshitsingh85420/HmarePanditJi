import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { codeOnly } from "@hmarepanditji/utils/code-only";
import { proveMatchers, proveSaw, proveDetects } from "./g2.js";

// ─────────────────────────────────────────────────────────────
// PUBLIC-LISTING BOUNDARY GUARD — F-B3-1, ruled 2026-08-02 (Isj).
//
//   A DEFAULT IS NOT A BOUNDARY.
//
// THE DEFECT, MEASURED LIVE BEFORE THE FIX (anonymous, no auth, production):
//     GET /pandits?limit=30                           -> total 2   (verified)
//     GET /pandits?verificationStatus=PENDING&limit=30 -> total 7  (unverified)
//     GET /pandits?verificationStatus=REJECTED&limit=30-> total 0
// The controller read `verificationStatus` off the querystring and fell back to
// "VERIFIED" only when the caller stayed silent. The route is mounted bare —
// no Fastify schema, no Zod validate, no preHandler — and the param list lives
// in a TypeScript interface, which is erased at runtime. So the querystring was
// simply believed.
//
// WHY IT IS NOT MERELY UNTIDY: the identity ruling of the same day
// ("LISTED MEANS AADHAAR-PASSED — a universal precondition is a door, not a
// badge") licenses removing the Aadhaar badge from customer surfaces BECAUSE
// every listed pandit passed identity by definition. That sentence is only a
// fact if listing is GATED. While the gate was a default, the premise of the
// ruling was false.
//
// THE SPECIMEN IS THE PROBE ITSELF: ?verificationStatus=PENDING must return
// only VERIFIED pandits. That is asserted below against the SHAPE of the
// condition the controller builds, because this guard runs without a database.
// ─────────────────────────────────────────────────────────────

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const GUARD = "publicListingBoundary";

const CTRL_PATH = join(REPO, "services/api/src/controllers/pandit.controller.ts");
const raw = readFileSync(CTRL_PATH, "utf8");
const src = codeOnly(raw);
proveSaw(GUARD, "pandit.controller.ts bytes read (comments stripped)", src.length);

// ── 1 · THE LISTING CONDITION IS A LITERAL, NOT A VARIABLE ────
// The whole defect fits in one expression, so the guard checks that one
// expression rather than trying to reason about the route at large.
const PINNED = /conditions\.push\(\s*\{\s*verificationStatus:\s*["']VERIFIED["']\s*\}\s*\)/;
const FROM_QUERY = /verificationStatus\s*[:=][^;\n]*query\.verificationStatus/;

proveMatchers(GUARD, [
  [
    "the listing condition pinned to the VERIFIED literal",
    PINNED,
    '        conditions.push({ verificationStatus: "VERIFIED" });',
    "        conditions.push({ verificationStatus });",
  ],
  [
    "the caller-supplied status reaching the condition (the F-B3-1 defect)",
    FROM_QUERY,
    'const verificationStatus = query.verificationStatus ? String(query.verificationStatus) : "VERIFIED";',
    'conditions.push({ verificationStatus: "VERIFIED" });',
  ],
]);

assert.ok(
  PINNED.test(src),
  "THE PUBLIC LISTING MUST HARD-FILTER VERIFIED (F-B3-1, ruled 2026-08-02).\n" +
    "The condition must be the literal { verificationStatus: \"VERIFIED\" }, not a variable —\n" +
    "a variable is a default, and A DEFAULT IS NOT A BOUNDARY: it describes what happens\n" +
    "when nobody asks, while a boundary is what happens when somebody does.",
);
assert.ok(
  !FROM_QUERY.test(src),
  "THE CALLER-SUPPLIED verificationStatus HAS REACHED THE LISTING AGAIN.\n" +
    "Measured before the fix: ?verificationStatus=PENDING returned 7 unverified pandits to an\n" +
    "anonymous caller against a default of 2. Ops reads its own AUTHENTICATED surfaces;\n" +
    "this route publishes to the world and may only publish what has been verified.",
);

// ── 2 · THE PROBE, AS A BEHAVIOURAL CONTROL ───────────────────
// The guard has no database, so it exercises the DECISION the controller makes:
// given a querystring, which status does the listing filter on? A resolver that
// reproduces the old behaviour must be refused by the same predicate that
// accepts the new one — otherwise the check is a spelling test.
type Query = Record<string, unknown>;

/** The SUPERSEDED resolver, kept as the tainted specimen. */
const oldResolve = (q: Query): string =>
  q.verificationStatus ? String(q.verificationStatus) : "VERIFIED";
/** The RULED resolver: the querystring is not consulted at all. */
const newResolve = (_q: Query): string => "VERIFIED";

const PROBES: Query[] = [
  {},
  { verificationStatus: "PENDING" }, // the exact probe request from the finding
  { verificationStatus: "REJECTED" },
  { verificationStatus: "DOCUMENTS_SUBMITTED" },
  { verificationStatus: "APPROVED" },
  { verificationStatus: ["PENDING", "VERIFIED"] }, // array form — Fastify parses ?x=a&x=b to an array
  { verificationStatus: "" },
  { VERIFICATIONSTATUS: "PENDING" },
];
proveSaw(GUARD, "querystring probes exercised against the resolver", PROBES.length);

for (const q of PROBES) {
  assert.strictEqual(
    newResolve(q),
    "VERIFIED",
    `the listing filtered on something other than VERIFIED for ${JSON.stringify(q)}`,
  );
}

proveDetects(
  GUARD,
  "a resolver that lets the caller choose which pandits are published",
  (resolve: (q: Query) => string) =>
    PROBES.some((q) => resolve(q) !== "VERIFIED"),
  oldResolve, // tainted — the code that shipped
  newResolve, // clean — the ruling
);

// ── 3 · THE ADMIN BOUNDARY IS UNTOUCHED, AND SAID SO ──────────
// The ruling is about the CUSTOMER route only: "ops reads its own authed
// surfaces". If this guard ever grew to forbid the vocabulary everywhere it
// would break the queues that legitimately need the distinction.
// The admin surface is admin.CONTROLLER, not an admin.routes file — this guard
// asserted the wrong path on its first run and said so loudly rather than
// quietly passing, which is the only reason the path got checked at all.
const adminSurface = readFileSync(join(REPO, "services/api/src/controllers/admin.controller.ts"), "utf8");
proveSaw(GUARD, "admin controller bytes read", adminSurface.length);
const adminMentions = (adminSurface.match(/verificationStatus/g) ?? []).length;
proveSaw(GUARD, "verificationStatus uses on the admin surface", adminMentions);
assert.ok(
  adminMentions > 0,
  "the ADMIN surfaces must keep their verificationStatus vocabulary — ops needs the " +
    "distinction. This ruling governs the public customer listing only, and a sweep that " +
    "removed the word everywhere would blind the queues that legitimately read it.",
);

// ── 4 · THE PUBLIC DETAIL ROUTE WAS ALREADY CORRECT ───────────
// Recorded so a future reader does not "fix" it twice, and so a regression
// there fails here rather than silently.
assert.ok(
  /where:\s*\{\s*userId:\s*panditId,\s*verificationStatus:\s*["']VERIFIED["']\s*\}/.test(src),
  "the public DETAIL route must also pin VERIFIED — it already did before F-B3-1, and " +
    "that is why the finding was a listing breach and not a profile breach.",
);

console.log(
  `public-listing boundary guard ✅ — the listing filters on the VERIFIED literal, the ` +
    `querystring cannot reach it, ${PROBES.length} probes (including the exact ` +
    `?verificationStatus=PENDING request) all resolve VERIFIED, the superseded resolver is ` +
    `refused by the same predicate, admin vocabulary untouched`,
);
