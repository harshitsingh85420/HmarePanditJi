import assert from "node:assert";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// NEXT_PUBLIC_API_URL — ONE CONTRACT GUARD
// Isj order, 2026-07-28: "one contract, one place, all three apps. Guard so a
// fourth value can't appear."
//
// The repo carried FOUR values and TWO incompatible meanings for one variable,
// which is the root cause under three separate breaks (the homepage appending
// a second /api/v1, eleven customer calls hardcoding /api/customers/..., and
// twenty-eight raw concatenations in admin).
//
// THE CONTRACT: the env var is an ORIGIN. The client owns the /api/v1 prefix.
// resolveApiBase() in packages/utils accepts both shapes and resolves them
// identically, so a value WITH the prefix is tolerated — what is forbidden is
// client code that assumes one shape and concatenates blindly.
// ─────────────────────────────────────────────────────────────

console.log("Running API-base one-contract guard...");

const REPO = join(__dirname, "..", "..", "..", "..");
const stripComments = (s: string) =>
  s
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((l) => !/^\s*(\/\/|\*|#)/.test(l))
    .join("\n");

// ── the single source exists and states the contract ──────────
const SRC = readFileSync(join(REPO, "packages/utils/src/api-base.ts"), "utf8");
assert.ok(/export function resolveApiBase/.test(SRC), "resolveApiBase must be the one resolver");
assert.ok(/API_PREFIX\s*=\s*["']\/api\/v1["']/.test(SRC), "API_PREFIX must be /api/v1");
assert.ok(/missing/.test(SRC), "an empty base must be reportable, not silently localhost");

// ── nobody hardcodes the WRONG prefix ─────────────────────────
// `/api/<something>` where something is not `v1` means the caller invented a
// prefix. Every route lives under /api/v1.
function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e === ".next" || e === "dist") continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e) && !/\.test\.tsx?$/.test(e)) out.push(p);
  }
  return out;
}

const badPrefix: string[] = [];
for (const app of ["apps/web/app", "apps/web/components", "apps/admin/src"]) {
  for (const f of walk(join(REPO, app))) {
    const src = stripComments(readFileSync(f, "utf8"));
    // an API_URL interpolation immediately followed by /api/<not v1>
    const re = /NEXT_PUBLIC_API_URL[^`'"]*\}?\/api\/(?!v1)[a-z-]+/g;
    if (re.test(src)) badPrefix.push(f.replace(REPO, "").replace(/\\/g, "/"));
  }
}
assert.deepStrictEqual(
  badPrefix,
  [],
  `these files invent an API prefix — every route lives under /api/v1. Use resolveApiBase() from @hmarepanditji/utils:\n  ${badPrefix.join("\n  ")}`,
);

// ── the env FILES agree on one shape ──────────────────────────
// Both shapes resolve identically through resolveApiBase, but the DOCUMENTED
// contract must be stated the same way everywhere, because the prose is what
// the next person copies.
const envFiles = [".env.example", ".env.vercel", "apps/web/.env.local.example", "apps/admin/.env.local.example"];
const declared: Record<string, string> = {};
for (const rel of envFiles) {
  const p = join(REPO, rel);
  if (!existsSync(p)) continue;
  const m = /^NEXT_PUBLIC_API_URL\s*=\s*"?([^"\n\r]*)"?/m.exec(readFileSync(p, "utf8"));
  if (m) declared[rel] = m[1].trim();
}
// Not an equality assertion: a localhost example and a prod URL legitimately
// differ. What must hold is that every declared value is a well-formed base
// that resolveApiBase can normalise — i.e. no trailing slash, no double
// prefix, no path beyond /api/v1.
for (const [file, val] of Object.entries(declared)) {
  assert.ok(!/\/$/.test(val), `${file}: NEXT_PUBLIC_API_URL must not end in a slash (got "${val}")`);
  assert.ok(
    !/\/api\/v1\/.+/.test(val),
    `${file}: NEXT_PUBLIC_API_URL must be an origin (optionally + /api/v1), not a deeper path (got "${val}")`,
  );
  assert.ok(
    !/\/api\/(?!v1)/.test(val),
    `${file}: NEXT_PUBLIC_API_URL carries a prefix that is not /api/v1 (got "${val}")`,
  );
}

console.log(
  `✓ API-base one-contract guard passed (${Object.keys(declared).length} env declarations checked)`,
);
