#!/usr/bin/env node
/**
 * bundle-scope — resolve what a Next app ACTUALLY SHIPS, from the import graph.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS. Every sweep in this campaign scoped itself by DIRECTORY
 * CONVENTION — "apps/web/app is the live tree, apps/web/src is shelved" — and
 * that convention is false in one direction:
 *
 *     src/ is dead for ROUTING and live for IMPORTING.
 *
 * `apps/web/src/app/search/search-client.tsx` is not a route. It is also the
 * customer's entire search screen, because `apps/web/app/search/page.tsx`
 * imports it. It carried an api-base bug that 404'd every search, and it
 * survived the contract table, the phantom purge, the dead-control census and
 * three api-base sweeps — every one of which walked `apps/web/app` and stopped.
 *
 * The sweeps were not wrong about the code. They were pointed at the wrong
 * artifact. Same shape as CAPABILITY ≠ PATH (we tested a function's capability,
 * not its call path) and BUILD GREEN ≠ ARTIFACT LOADABLE (we measured the
 * source, not the thing that ships).
 *
 *     A DIRECTORY IS NOT A SCOPE. THE IMPORT GRAPH IS.
 *
 * USAGE
 *   node scripts/bundle-scope.mjs apps/web            # list every shipped file
 *   node scripts/bundle-scope.mjs apps/web --orphans  # list files NOT shipped
 *   node scripts/bundle-scope.mjs apps/web --json
 * ─────────────────────────────────────────────────────────────────────────
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";

const REPO = resolve(dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const app = process.argv[2] || "apps/web";
const APP_DIR = join(REPO, app);
const wantOrphans = process.argv.includes("--orphans");
const wantJson = process.argv.includes("--json");

const EXTS = [".tsx", ".ts", ".jsx", ".js"];
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "build", "coverage", ".turbo"]);

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    if (SKIP_DIRS.has(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (EXTS.some((x) => e.endsWith(x)) && !/\.(test|spec)\./.test(e)) out.push(p);
  }
  return out;
}

/** Next's ROUTE entry points — the only things the router itself pulls in. */
function routeEntries() {
  // Next prioritises ./app over ./src/app (see find-pages-dir.js). Only the
  // winner's route files are entries; the loser's are reachable ONLY by import.
  const appDir = existsSync(join(APP_DIR, "app")) ? join(APP_DIR, "app") : join(APP_DIR, "src", "app");
  return walk(appDir).filter((f) =>
    /[\\/](page|layout|route|template|loading|error|not-found|global-error|default|sitemap|robots|middleware)\.(tsx|ts|jsx|js)$/.test(f),
  );
}

/** Resolve one import specifier to a real file, or null if external. */
function resolveSpec(spec, fromFile) {
  let base;
  if (spec.startsWith(".")) base = resolve(dirname(fromFile), spec);
  else if (spec.startsWith("@/")) base = join(APP_DIR, "src", spec.slice(2)); // tsconfig "@/*" -> ./src/*
  else return null; // node_modules or workspace package — outside this app's tree
  for (const e of ["", ...EXTS, ...EXTS.map((x) => `/index${x}`)]) {
    const cand = base + e;
    if (existsSync(cand) && statSync(cand).isFile()) return cand;
  }
  return null;
}

const IMPORT_RE = /(?:^|\n)\s*(?:import|export)[\s\S]{0,400}?from\s*["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|require\(\s*["']([^"']+)["']\s*\)/g;

const shipped = new Set();
const queue = routeEntries();
for (const e of queue) shipped.add(e);

while (queue.length) {
  const f = queue.pop();
  let src;
  try { src = readFileSync(f, "utf8"); } catch { continue; }
  for (const m of src.matchAll(IMPORT_RE)) {
    const spec = m[1] || m[2] || m[3];
    if (!spec) continue;
    const target = resolveSpec(spec, f);
    if (target && !shipped.has(target)) {
      shipped.add(target);
      queue.push(target);
    }
  }
}

const all = walk(APP_DIR);
const rel = (p) => relative(REPO, p).replace(/\\/g, "/");
const shippedList = [...shipped].map(rel).sort();
const orphanList = all.map(rel).filter((p) => !shippedList.includes(p)).sort();

if (wantJson) {
  console.log(JSON.stringify({ app, shipped: shippedList, orphans: orphanList }, null, 2));
} else if (wantOrphans) {
  console.log(`# ${orphanList.length} file(s) in ${app} are NOT reachable from any route entry:`);
  for (const p of orphanList) console.log(p);
} else {
  console.log(`# ${shippedList.length} file(s) SHIPPED by ${app} (reachable from ${routeEntries().length} route entries)`);
  for (const p of shippedList) console.log(p);
  const fromSrc = shippedList.filter((p) => p.includes("/src/"));
  if (fromSrc.length) {
    console.error(
      `\n# ${fromSrc.length} of them live under src/ — NOT routed, but IMPORTED and therefore shipped.\n` +
        `# Any sweep scoped to ${app}/app alone is blind to these:\n` +
        fromSrc.map((p) => `#   ${p}`).join("\n"),
    );
  }
}
