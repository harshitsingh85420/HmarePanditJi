// ─────────────────────────────────────────────────────────────
// PUBLIC-READ SCOPE GUARD  (register: F04-05, security-grade)
//
// Exactly ONE route under /pandit* is unauthenticated: GET /pandits/:id.
// This asserts the exemption is that narrow and stays that narrow.
//
// The danger being guarded against is specific. The obvious way to open
// one route is a path test like `url.startsWith("/api/v1/pandits/")` or
// a single-segment regex — and both would ALSO open /pandits/me,
// /pandits/bookings, /pandits/calendar, /pandits/dashboard-summary,
// /pandits/pending-requests and /pandits/samagri-packages, every one of
// which is private pandit data sitting exactly one segment deep, shaped
// indistinguishably from an id.
//
// So the exemption keys off Fastify's resolved route template rather
// than the raw URL, and this guard pins that choice: it fails if the
// matcher goes back to raw-URL matching, and it fails if any second
// route joins the public set without a deliberate edit here.
// ─────────────────────────────────────────────────────────────
import { readFileSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert";

const APP = join(__dirname, "..", "app.ts");
const raw = readFileSync(APP, "utf-8");
const src = raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");

let failures = 0;
const fail = (msg: string) => {
  console.error(`  ✗ ${msg}`);
  failures++;
};

// ── 1. the public set contains exactly the detail route ──────
const setMatch = src.match(/PUBLIC_PANDIT_READS\s*=\s*new Set<string>\(\[([\s\S]*?)\]\)/);
assert.ok(setMatch, "PUBLIC_PANDIT_READS not found — the public-read exemption was removed or renamed");

const entries = [...setMatch[1].matchAll(/`([^`]+)`|"([^"]+)"|'([^']+)'/g)].map(
  (m) => m[1] || m[2] || m[3]
);
if (entries.length !== 1) {
  fail(`PUBLIC_PANDIT_READS has ${entries.length} entries — expected exactly 1. Found: ${entries.join(", ")}`);
}
if (entries[0] && !/\/pandits\/:id$/.test(entries[0])) {
  fail(`the single public read is \`${entries[0]}\`, expected the detail route \`\${API_PREFIX}/pandits/:id\``);
}

// ── 2. it matches on the ROUTE TEMPLATE, not the raw url ─────
// This is the property that keeps sibling one-segment routes private.
if (!/routeOptions\?\.\s*url|routeOptions\.url/.test(src)) {
  fail(
    "the exemption does not read request.routeOptions.url — if it matches on the raw URL, " +
      "/pandits/me, /pandits/bookings and /pandits/samagri-packages become public too"
  );
}
// ── 3. GET only ──────────────────────────────────────────────
const fnMatch = src.match(/export function isPublicPanditRead[\s\S]*?\n}/);
assert.ok(fnMatch, "isPublicPanditRead not found");

// scoped to the function BODY — an earlier version of this check used a
// character window after the identifier and tripped on an unrelated
// `request.url` elsewhere in the file
if (/request\.url/.test(fnMatch[0])) {
  fail("isPublicPanditRead tests request.url — must use the resolved route template");
}
if (!/method\s*===\s*"GET"/.test(fnMatch[0])) {
  fail("isPublicPanditRead does not restrict to GET — a public write would be far worse than a public read");
}

// ── 4. the gate still runs for everything else ───────────────
const hook = src.match(/app\.addHook\("preHandler"[\s\S]*?\n}\);/);
assert.ok(hook, "the /pandit* preHandler gate was removed entirely");
if (!/authenticate\(request, reply\)/.test(hook[0]) || !/roleGuard\("PANDIT"\)/.test(hook[0])) {
  fail("the /pandit* gate no longer applies authenticate + roleGuard(PANDIT)");
}
// the early return must be INSIDE the /pandit* branch, i.e. after the prefix
// test — otherwise the exemption would be evaluated for every route in the app
const branchIdx = hook[0].indexOf("API_PREFIX}/pandit");
const exemptIdx = hook[0].indexOf("isPublicPanditRead");
if (exemptIdx > 0 && branchIdx > 0 && exemptIdx < branchIdx) {
  fail("the public-read exemption is evaluated before the /pandit* prefix test — widen-by-accident risk");
}

// ── 5. routes that MUST stay private are not in the public set ──
const MUST_STAY_PRIVATE = [
  "/pandits/me",
  "/pandits/bookings",
  "/pandits/calendar",
  "/pandits/dashboard-summary",
  "/pandits/pending-requests",
  "/pandits/samagri-packages",
  "/pandit/readiness",
  "/pandit/status",
];
for (const p of MUST_STAY_PRIVATE) {
  if (entries.some((e) => e.includes(p))) {
    fail(`private route ${p} appears in the public-read set`);
  }
}

if (failures > 0) {
  console.error(`\n✗ public-pandit-access: ${failures} violation(s)\n`);
  process.exit(1);
}
console.log(
  "✓ public-pandit-access: exactly one public read (GET /pandits/:id), matched by route template; all other /pandit* routes stay authenticated + role-gated"
);
