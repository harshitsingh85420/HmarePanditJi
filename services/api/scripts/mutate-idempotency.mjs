// L1 — EXACTLY-ONCE MUTATION AUDIT.
// Every state-changing pandit-app call (POST/PATCH/PUT/DELETE via the
// api() backend helper) must route through mutateOnce() so a double-tap,
// voice-command-plus-tap, or retry can never fire two writes. This scans
// apps/pandit/src and flags any mutating api() call that is NOT
// mutateOnce() and NOT on the EXEMPT allowlist. Same spirit + machinery
// as route-audit.mjs (BB1d). The guard test (mutate-idempotency.test.ts)
// gates on 0 violations, so a FUTURE screen adding a raw money-write
// fails the build.
//
// EXEMPT = calls that are genuinely not a repeatable-danger pandit
// state mutation:
//   /auth/*      one-shot OTP flow (OTP consumed server-side; a repeat
//                is naturally idempotent / harmless)
//   /shishya/*   conversational LLM turns (not a state write)
//   /feedback/*  fire-and-forget telemetry
// Backend multipart/streaming fetch()s (upload, stt) can't use api()
// (JSON content-type); the upload is wrapped in once() instead — this
// audit covers the api() surface, which is where every money/identity/
// config write lives (/pandit/*).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const PANDIT_SRC = join(HERE, "..", "..", "..", "apps", "pandit", "src");
const MUT = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const EXEMPT = [/^\/auth\//, /^\/shishya\//, /^\/feedback\//];

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    if (name === "node_modules" || name === ".next" || name === "dist") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.(test|spec|d)\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}
const norm = (p) => p.split("\\").join("/");
const lineOf = (src, i) => src.slice(0, i).split("\n").length;
const methodNear = (src, at) => (src.slice(at, at + 300).match(/method:\s*["'](\w+)["']/)?.[1] || "GET").toUpperCase();

export function audit() {
  const violations = [];
  let wrapped = 0;
  for (const file of walk(PANDIT_SRC)) {
    if (norm(file).endsWith("/lib/mutate.ts")) continue; // the wrapper itself
    const src = readFileSync(file, "utf8");
    const rel = norm(relative(PANDIT_SRC, file));
    // count mutateOnce mutations (sanity)
    for (const m of src.matchAll(/\bmutateOnce\(\s*[`"'][^`"']*[`"']\s*,\s*[`"']([^`"']+)[`"']/g)) {
      if (MUT.has(methodNear(src, m.index))) wrapped++;
    }
    // flag raw api() mutations that aren't exempt
    for (const m of src.matchAll(/\bapi\(\s*[`"']([^`"']+)[`"']/g)) {
      const path = m[1];
      const method = methodNear(src, m.index);
      if (!MUT.has(method)) continue;
      if (EXEMPT.some((re) => re.test(path))) continue;
      violations.push({ method, path, file: rel, line: lineOf(src, m.index) });
    }
  }
  return { violations, wrapped };
}

if (process.argv[1] && norm(process.argv[1]).endsWith("mutate-idempotency.mjs")) {
  const { violations, wrapped } = audit();
  console.log(`mutate-idempotency: ${wrapped} mutateOnce writes, ${violations.length} raw-api mutation(s)`);
  for (const v of violations) console.log(`  ${v.method} ${v.path}  [${v.file}:${v.line}]`);
  process.exit(Math.min(violations.length, 255));
}
