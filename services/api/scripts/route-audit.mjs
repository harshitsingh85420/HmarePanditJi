// BB1c — ROUTE-MISMATCH AUDIT.
// Extracts every BACKEND API call in apps/{pandit,admin,web} and cross-checks
// it against the Fastify API's REGISTERED route table (app.ts direct routes +
// every routes/*.ts plugin resolved through its register() prefix). Prints
// every mismatch as method + logical-path + file:line so a silent 404 can
// never hide. Exit code = count of BLOCKING backend mismatches (0 = clean) so
// the guard test (route-audit.test.mjs) and CI can gate on it.
//
// A call is a BACKEND call when it targets the API origin:
//   • pandit  api("/x") / mutateOnce(key,"/x")     — base = <origin>/api/v1
//   • fetch(`${BASE}/x`)                            — BASE var carries the origin
//   • fetch("http://<apihost>/x")                   — hardcoded API origin
// Same-origin Next routes  fetch("/api/tts")  and third-party URLs
// (nominatim, puter…) are NOT backend calls and are reported separately, never
// counted as mismatches.
//
// "Logical path" = the server path with the /api/v1 prefix stripped and params
// normalised to :x — the canonical shape both sides reduce to.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..", ".."); // services/api/scripts -> repo root
const API_PREFIX = "/api/v1";
const API_HOSTS = [/localhost:3001/, /onrender\.com/, /hmarepanditji-api/];

// ── helpers ──────────────────────────────────────────────────────────────────
function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    if (name === "node_modules" || name === ".next" || name === "dist") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.d\.ts$/.test(name)) out.push(full);
  }
  return out;
}
const rel = (f) => relative(REPO, f).replace(/\\/g, "/");
const lineOf = (src, idx) => src.slice(0, idx).split("\n").length;

// Normalise a path to a logical shape: drop query/hash, collapse params, cut at
// any dynamic ${…} segment (keep the static prefix), trim trailing slash.
function logical(p) {
  let s = p.split("?")[0].split("#")[0];
  s = s.replace(/\$\{[^}]*\}/g, "\x00"); // template expr -> placeholder (kept in place)
  s = s
    .split("/")
    .map((seg) => {
      if (seg === "\x00") return ":x"; // whole-segment dynamic param
      if (seg.includes("\x00")) return seg.split("\x00")[0]; // glued tail (query builder like /stt${qs}) -> static part
      return seg;
    })
    .join("/");
  s = s.split("${")[0]; // drop any leftover unbalanced template tail (nested backticks / query builders)
  s = s.replace(/:[A-Za-z0-9_]+/g, ":x"); // :bookingId -> :x
  s = s.replace(/\*/g, ":x");
  s = s.replace(/\/+$/, "");
  return s || "/";
}

// ── 1. SERVER ROUTE TABLE ────────────────────────────────────────────────────
const appTs = readFileSync(join(REPO, "services/api/src/app.ts"), "utf8");

const importFile = {}; // ident -> absolute route-file path
for (const m of appTs.matchAll(/import\s+(?:(\w+)|\{([^}]+)\})\s+from\s+["'](\.\/routes\/[\w.]+)["']/g)) {
  const file = join(REPO, "services/api/src", m[3].replace(/^\.\//, "") + ".ts");
  if (m[1]) importFile[m[1]] = file;
  if (m[2]) for (const n of m[2].split(",")) importFile[n.trim().split(/\s+as\s+/)[0]] = file;
}

// app.register(<ident>, { prefix: `${API_PREFIX}/x` | API_PREFIX | "/x" })
const pluginPrefix = {};
for (const m of appTs.matchAll(/\bregister\(\s*(\w+)\s*,\s*\{[^{}]*prefix:\s*(`[^`]*`|"[^"]*"|'[^']*'|\w+)/g)) {
  let px = m[2].trim();
  if (px === "API_PREFIX") px = API_PREFIX;
  else px = px.replace(/[`"']/g, "").replace(/\$\{API_PREFIX\}/g, API_PREFIX);
  pluginPrefix[m[1]] = px;
}

const routes = []; // { method, full, logical, src }
function addRoute(method, full, src) {
  const lp = full.startsWith(API_PREFIX) ? (full.slice(API_PREFIX.length) || "/") : full;
  routes.push({ method: method.toUpperCase(), full, logical: logical(lp), src });
}

// 1a. app.ts direct routes
for (const m of appTs.matchAll(/\bapp\.(get|post|put|patch|delete|all)\(\s*[`"']([^`"']+)[`"']/g)) {
  addRoute(m[1], m[2].replace(/\$\{API_PREFIX\}/g, API_PREFIX), "services/api/src/app.ts");
}

// 1b. plugin route files, resolved through their register() prefix
for (const [ident, prefix] of Object.entries(pluginPrefix)) {
  const file = importFile[ident];
  if (!file) continue;
  let src;
  try { src = readFileSync(file, "utf8"); } catch { continue; }
  for (const m of src.matchAll(/\b(?:fastify|app|server|router|instance|f)\.(get|post|put|patch|delete|all)\(\s*[`"']([^`"']+)[`"']/g)) {
    addRoute(m[1], (prefix + m[2]).replace(/([^:])\/{2,}/g, "$1/"), rel(file));
  }
}

const routeIndex = new Map(); // logical -> Set(methods)
for (const r of routes) {
  if (!routeIndex.has(r.logical)) routeIndex.set(r.logical, new Set());
  routeIndex.get(r.logical).add(r.method);
}
const serverHas = (method, lp) => {
  const set = routeIndex.get(lp);
  return !!set && (set.has(method) || set.has("ALL"));
};

// ── 2. CLIENT CALLS ──────────────────────────────────────────────────────────
const APPS = [
  { name: "pandit", dir: join(REPO, "apps/pandit/src") },
  { name: "admin", dir: join(REPO, "apps/admin/src") },
  { name: "web", dir: join(REPO, "apps/web/src") },
];
const methodNear = (src, at) => (src.slice(at, at + 260).match(/method:\s*["'](\w+)["']/)?.[1] || "GET").toUpperCase();

const backend = []; // { app, method, rawPath, logical, malformed, file, line }
const nextLocal = []; // same-origin Next routes (reported, not audited vs backend)
const external = []; // third-party URLs (reported, not audited)

function classifyBackendPath(rawPath) {
  // returns { logical, malformed }
  if (rawPath.startsWith(`${API_PREFIX}/`) || rawPath === API_PREFIX) {
    return { logical: logical(rawPath.slice(API_PREFIX.length) || "/"), malformed: null };
  }
  if (/^\/api\//.test(rawPath)) {
    return { logical: logical(rawPath.replace(/^\/api/, "")), malformed: `path carries "/api/…" (missing /v1) — base already supplies ${API_PREFIX}` };
  }
  return { logical: logical(rawPath), malformed: null }; // clean relative route
}

function addBackend(app, method, rawPath, origin, file, idx, src) {
  let path = rawPath;
  if (origin) path = rawPath.replace(/^https?:\/\/[^/]+/, ""); // strip hardcoded origin
  const { logical: lp, malformed } = classifyBackendPath(path);
  backend.push({ app, method, rawPath, logical: lp, malformed: malformed || (origin ? `hardcoded origin "${origin}" — not env-driven, breaks in prod` : null), file: rel(file), line: lineOf(src, idx) });
}

function handleFetchArg(app, arg, file, idx, src) {
  const method = methodNear(src, idx);
  if (arg.startsWith("${")) {
    // based backend call — drop the leading ${BASE}
    const path = arg.slice(arg.indexOf("}") + 1);
    addBackend(app, method, path, null, file, idx, src);
  } else if (/^https?:\/\//.test(arg)) {
    const host = arg.match(/^https?:\/\/([^/]+)/)?.[1] || "";
    if (API_HOSTS.some((re) => re.test(host))) addBackend(app, method, arg, `http://${host}`, file, idx, src);
    else external.push({ app, url: logical(arg), file: rel(file), line: lineOf(src, idx) });
  } else if (arg.startsWith("/")) {
    nextLocal.push({ app, method, path: logical(arg), file: rel(file), line: lineOf(src, idx) });
  }
}

for (const app of APPS) {
  for (const file of walk(app.dir)) {
    if (/\.(test|spec)\.(ts|tsx)$/.test(file)) continue;
    const src = readFileSync(file, "utf8");
    // 2a. pandit helper: api("<path>") / mutateOnce(key,"<path>") — always backend
    for (const m of src.matchAll(/\bapi\(\s*[`"']([^`"']+)[`"']/g))
      addBackend(app.name, methodNear(src, m.index), m[1], null, file, m.index, src);
    for (const m of src.matchAll(/\bmutateOnce\(\s*[`"'][^`"']*[`"']\s*,\s*[`"']([^`"']+)[`"']/g))
      addBackend(app.name, methodNear(src, m.index), m[1], null, file, m.index, src);
    // 2b. fetch(<arg>) — classify arg
    for (const m of src.matchAll(/\bfetch\(\s*(`[^`]*`|"[^"]*"|'[^']*')/g))
      handleFetchArg(app.name, m[1].slice(1, -1), file, m.index, src);
  }
}

// ── 3. COMPARE + REPORT ──────────────────────────────────────────────────────
const mismatches = [];
for (const c of backend) {
  if (c.malformed) { mismatches.push({ ...c, reason: c.malformed }); continue; }
  if (!serverHas(c.method, c.logical)) {
    const set = routeIndex.get(c.logical);
    mismatches.push({ ...c, reason: set ? `route exists but only for [${[...set].join(", ")}], not ${c.method}` : `no server route for ${c.method} ${c.logical}` });
  }
}

console.log(`\n=== ROUTE AUDIT (backend = Fastify API) ===`);
console.log(`server routes discovered: ${routes.length}`);
console.log(`backend calls:            ${backend.length}  (pandit ${backend.filter(c=>c.app==="pandit").length}, admin ${backend.filter(c=>c.app==="admin").length}, web ${backend.filter(c=>c.app==="web").length})`);
console.log(`next-local fetches:       ${nextLocal.length}  (same-origin /api/* Next routes — not audited vs backend)`);
console.log(`external fetches:         ${external.length}  (third-party hosts — not audited)`);
console.log(`BACKEND MISMATCHES:       ${mismatches.length}\n`);

if (mismatches.length) {
  const byApp = {};
  for (const m of mismatches) (byApp[m.app] ||= []).push(m);
  for (const [app, list] of Object.entries(byApp)) {
    console.log(`── ${app} (${list.length}) ──`);
    for (const m of list) {
      console.log(`  ${m.method.padEnd(6)} ${m.logical}   [${m.file}:${m.line}]`);
      console.log(`         raw "${m.rawPath}"  —  ${m.reason}`);
    }
    console.log("");
  }
}

export function audit() { return { routes, backend, nextLocal, external, mismatches }; }

if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("route-audit.mjs")) {
  console.log(`RESULT: ${mismatches.length} backend mismatch(es).`);
  process.exit(Math.min(mismatches.length, 255));
}
