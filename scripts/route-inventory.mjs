#!/usr/bin/env node
/**
 * route-inventory — enumerate EVERY route the API actually serves, from the
 * registration table, and flag every pair that serves one resource twice.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS.
 *
 * On 2026-07-29 a public-read audit cleared `GET /pandits/:id/reviews` by
 * checking it against `PUBLIC_PANDIT_READS` — a hand-maintained constant in
 * app.ts. It passed. Meanwhile `GET /reviews/pandit/:panditId` — a second route
 * over the same resource, under a different prefix, therefore outside the
 * constant — was public, ignored the reviewer's `isAnonymous` flag, and shipped
 * real names plus entire customerProfiles to anyone with the URL.
 *
 *     AN AUDIT OF A ROUTE LIST PROVES NOTHING ABOUT THE ROUTE THAT ISN'T ON IT.
 *
 * The same shape produced two wrong findings the same day: `/pandit/bookings/:id`
 * omits the customer while `/pandits/bookings/:id` returns the entire User row,
 * and only the first was walked.
 *
 * So: stop auditing a curated set. Enumerate what the router serves.
 *
 *     node scripts/route-inventory.mjs              # the full table
 *     node scripts/route-inventory.mjs --twins      # only the duplicate pairs
 *     node scripts/route-inventory.mjs --json       # machine-readable
 * ─────────────────────────────────────────────────────────────────────────
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve, basename } from "node:path";

const here = dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const REPO = resolve(here, "..");
const API = join(REPO, "services/api/src");

const args = process.argv.slice(2);
const ONLY_TWINS = args.includes("--twins");
const AS_JSON = args.includes("--json");

/** Strip comments so a commented-out route is never counted as served. */
function codeOnly(src) {
  let out = "", i = 0, n = src.length;
  let inS = null, inTpl = false, inLine = false, inBlk = false;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (inLine) { if (c === "\n") { inLine = false; out += c; } else out += " "; i++; continue; }
    if (inBlk) { if (c === "*" && d === "/") { inBlk = false; out += "  "; i += 2; } else { out += c === "\n" ? c : " "; i++; } continue; }
    if (inS) { out += c; if (c === "\\") { out += src[i + 1] ?? ""; i += 2; continue; } if (c === inS) inS = null; i++; continue; }
    if (inTpl) { out += c; if (c === "\\") { out += src[i + 1] ?? ""; i += 2; continue; } if (c === "`") inTpl = false; i++; continue; }
    if (c === "/" && d === "/") { inLine = true; out += "  "; i += 2; continue; }
    if (c === "/" && d === "*") { inBlk = true; out += "  "; i += 2; continue; }
    if (c === '"' || c === "'") { inS = c; out += c; i++; continue; }
    if (c === "`") { inTpl = true; out += c; i++; continue; }
    out += c; i++;
  }
  return out;
}

const read = (p) => codeOnly(readFileSync(p, "utf8"));
const APP = read(join(API, "app.ts"));

// ── 1. the API prefix ────────────────────────────────────────
const prefixMatch = APP.match(/API_PREFIX\s*=\s*[`"']([^`"']+)/);
const API_PREFIX = prefixMatch ? prefixMatch[1] : "/api/v1";

// ── 2. plugin registrations: which file serves which prefix ──
// app.register(xRoutes, { prefix: `${API_PREFIX}/foo` })
const plugins = [];
for (const m of APP.matchAll(/app\.register\(\s*(\w+)\s*,\s*\{[^}]*prefix:\s*[`"']([^`"']*)[`"']/g)) {
  plugins.push({ ident: m[1], prefix: m[2].replace(/\$\{API_PREFIX\}/, API_PREFIX) });
}
// import xRoutes from "./routes/foo.routes"
const importMap = new Map();
for (const m of APP.matchAll(/import\s+(\w+)\s+from\s+["']\.\/(routes\/[\w.-]+)["']/g)) {
  importMap.set(m[1], m[2]);
}

const ROUTES = [];

/**
 * Detect a PLUGIN-LEVEL guard hook.
 *
 * FIRST VERSION OF THIS MATCHED ONLY `addHook("preHandler", authenticate)` — and
 * admin.routes.ts:56 registers an INLINE ARROW instead:
 *     fastify.addHook('preHandler', async (request, reply) => { … })
 * so every admin route was reported PUBLIC. That is law G2 inside the very tool
 * written to stop that class, and it would have put "the entire admin panel is
 * unauthenticated" into a report.
 *
 * So: match the hook by NAME ONLY, never by the shape of its handler, and say
 * which hook it was rather than inferring what it does.
 */
function pluginGuardOf(src) {
  const m = src.match(/addHook\(\s*["'](preHandler|onRequest)["']/);
  return m ? m[1] : null;
}

/**
 * Resolve `preHandler: someIdentifier` back to its declaration.
 *
 * upload.routes.ts writes:
 *     const preHandlers = [authenticate, roleGuard("PANDIT")];
 *     fastify.post("/", { preHandler: preHandlers }, handleUpload);
 * The opts blob then contains NEITHER `authenticate` NOR `roleGuard`, so a
 * token-matching reader called both upload routes PUBLIC. Live they return 401.
 * Third false-positive class this tool produced about itself — inline arrow
 * hooks, the app-level hook, and now guards behind an identifier.
 */
function expandPreHandlerIdents(optsBlob, fileSrc) {
  let out = optsBlob;
  for (const m of optsBlob.matchAll(/preHandler:\s*\[?\s*([A-Za-z_$][\w$]*)\s*\]?/g)) {
    const ident = m[1];
    const decl = fileSrc.match(new RegExp(`const\\s+${ident}\\s*=\\s*([\\s\\S]{0,200}?);`));
    if (decl) out += " " + decl[1];
  }
  return out;
}

function authOf(optsBlob, pluginGuard, fileSrc = "") {
  const blob = expandPreHandlerIdents(optsBlob, fileSrc);
  const bits = [];
  if (pluginGuard) bits.push(`plugin:${pluginGuard}`);
  if (/\bauthenticate\b/.test(blob)) bits.push("authenticate");
  const rg = [...blob.matchAll(/roleGuard\(\s*["'](\w+)["']/g)].map((x) => x[1]);
  if (rg.length) bits.push(`role:${rg.join("|")}`);
  if (/optionalAuth/.test(blob)) bits.push("optionalAuth");
  if (bits.length) return bits.join(" + ");
  // A preHandler that is NOT an auth check still leaves the route public — but
  // "public + rate-limited" and "public + wide open" are different risks, and a
  // reader deciding what to harden needs them distinguished. Name what is there.
  if (/preHandler:/.test(blob)) {
    const nonAuth = [];
    if (/Limiter|rateLimit/i.test(blob)) nonAuth.push("rate-limited");
    if (/\bvalidate\(/.test(blob)) nonAuth.push("schema-validated");
    // FAIL SAFE: a preHandler we could not name at all is NOT reported public.
    // Saying "unknown" costs a manual check; saying "PUBLIC" puts a false leak
    // into a report — which this tool did, about upload.routes.ts, before the
    // identifier expansion above existed.
    return nonAuth.length ? `PUBLIC (${nonAuth.join(", ")})` : "UNKNOWN (undecoded preHandler)";
  }
  return "PUBLIC";
}

// ── 3. routes declared inside each plugin file ───────────────
for (const { ident, prefix } of plugins) {
  const rel = importMap.get(ident);
  if (!rel) continue;
  const file = join(API, rel + ".ts");
  if (!existsSync(file)) continue;
  const src = read(file);
  const pluginAuth = pluginGuardOf(src);

  for (const m of src.matchAll(/fastify\.(get|post|put|patch|delete)\(\s*["'`]([^"'`]*)["'`]\s*(,\s*\{[\s\S]{0,400}?\}\s*)?,/g)) {
    const [, method, path, opts] = m;
    const full = (prefix + path).replace(/\/+$/, "") || prefix;
    ROUTES.push({
      method: method.toUpperCase(),
      path: full,
      auth: authOf(opts ?? "", pluginAuth, src),
      source: `${rel}.ts`,
      line: src.slice(0, m.index).split("\n").length,
    });
  }
}

// ── 4. routes registered DIRECTLY on the app ─────────────────
// These are the ones a plugin-shaped audit never sees: app.get(`${API_PREFIX}/pandit/bookings`, …)
for (const m of APP.matchAll(/app\.(get|post|put|patch|delete)\(\s*[`"']([^`"']+)[`"']\s*(,\s*\{[\s\S]{0,300}?\}\s*)?,\s*(\w+)/g)) {
  const [, method, rawPath, opts, handler] = m;
  if (!/\$\{API_PREFIX\}|^\/api/.test(rawPath)) continue;
  ROUTES.push({
    method: method.toUpperCase(),
    path: rawPath.replace(/\$\{API_PREFIX\}/, API_PREFIX),
    auth: authOf(opts ?? "", null, APP),
    source: "app.ts",
    line: APP.slice(0, m.index).split("\n").length,
    handler,
  });
}

// ── 4b. THE APP-LEVEL ROLE HOOK ──────────────────────────────
// app.ts:286 enforces role PANDIT on every URL under /pandit or /pandits,
// EXCEPT the paths in PUBLIC_PANDIT_READS. A per-route reading of the source
// cannot see this — every /pandits/* route declared with no preHandler looks
// public and is not. Model it, or the inventory reports the opposite of the
// truth on ~30 routes.
const publicReads = new Set();
{
  const block = APP.slice(APP.indexOf("PUBLIC_PANDIT_READS"), APP.indexOf("];", APP.indexOf("PUBLIC_PANDIT_READS")));
  for (const m of block.matchAll(/[`"']([^`"']*\/pandits[^`"']*)[`"']/g)) {
    publicReads.add(m[1].replace(/\$\{API_PREFIX\}/, API_PREFIX));
  }
}
const roleHook = /app\.addHook\(\s*["']preHandler["'][\s\S]{0,400}?roleGuard\(\s*["']PANDIT["']/.test(APP);
if (roleHook) {
  for (const r of ROUTES) {
    const underPandit = r.path.startsWith(`${API_PREFIX}/pandits`) || r.path.startsWith(`${API_PREFIX}/pandit`);
    if (!underPandit) continue;
    // Only ever RELAX a route that had no guard of its own. Overwriting an
    // explicit `preHandler: [authenticate, roleGuard("PANDIT")]` with
    // "allow-listed public" reported /pandits/onboarding and
    // /pandits/samagri-packages as public when both are explicitly gated —
    // the tool inventing a leak is as bad as the tool missing one.
    if (r.auth !== "PUBLIC") continue;
    r.auth = publicReads.has(r.path)
      ? "PUBLIC (allow-listed in PUBLIC_PANDIT_READS)"
      : "app-hook: authenticate + role:PANDIT";
  }
}

// ── 5. TWIN DETECTION ────────────────────────────────────────
// Two routes are twins when they address the same RESOURCE by a different path.
// Normalise: drop the API prefix, collapse every :param to :p, and fold the
// singular/plural noun split that this codebase actually has (/pandit vs
// /pandits). Then sort the remaining segments — /reviews/pandit/:p and
// /pandits/:p/reviews are the same resource said two ways, and an
// order-sensitive key would miss exactly that pair.
function resourceKey(r) {
  const segs = r.path
    .replace(API_PREFIX, "")
    .split("/")
    .filter(Boolean)
    .map((s) => (s.startsWith(":") ? ":p" : s.replace(/s$/, "")));
  return r.method + " " + segs.slice().sort().join("/");
}

const byResource = new Map();
for (const r of ROUTES) {
  const k = resourceKey(r);
  if (!byResource.has(k)) byResource.set(k, []);
  byResource.get(k).push(r);
}

const twins = [...byResource.entries()]
  .filter(([, rs]) => rs.length > 1)
  .map(([key, rs]) => ({
    key,
    routes: rs,
    authDiverges: new Set(rs.map((r) => r.auth)).size > 1,
  }));

// ── 6. output ────────────────────────────────────────────────
if (AS_JSON) {
  console.log(JSON.stringify({ total: ROUTES.length, routes: ROUTES, twins }, null, 2));
  process.exit(0);
}

if (!ONLY_TWINS) {
  console.log(`\n=== ROUTES THE API ACTUALLY SERVES (${ROUTES.length}) ===\n`);
  const pub = ROUTES.filter((r) => r.auth === "PUBLIC");
  for (const r of [...ROUTES].sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method))) {
    const flag = r.auth === "PUBLIC" ? " 🔓" : "";
    console.log(`  ${r.method.padEnd(6)} ${r.path.padEnd(52)} ${r.auth}${flag}   (${r.source}:${r.line})`);
  }
  console.log(`\n  ${pub.length} route(s) reachable with NO token.`);
}

console.log(`\n=== TWIN ROUTES — one resource, more than one path (${twins.length}) ===\n`);
if (!twins.length) console.log("  none");
for (const t of twins) {
  console.log(`  ▸ ${t.key}${t.authDiverges ? "   🔴 AUTH DIVERGES" : ""}`);
  for (const r of t.routes) console.log(`      ${r.method} ${r.path.padEnd(46)} ${r.auth}   (${r.source}:${r.line})`);
  console.log("");
}
const divergent = twins.filter((t) => t.authDiverges).length;
console.log(`  ${twins.length} twin group(s); ${divergent} with DIVERGENT AUTH.`);
console.log(
  `\n  Twins are not automatically bugs — but each one is two projections that must be checked\n` +
    `  to agree, and every case found so far did not. Auth divergence is the strongest signal.\n`,
);
