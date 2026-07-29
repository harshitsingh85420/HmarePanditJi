import assert from "node:assert";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
// Comments are stripped by the ONE shared implementation. See
// packages/utils/src/code-only.ts for why this is a scanner and not a
// regex, and for the single documented raw-source exception.
import { codeOnly } from "@hmarepanditji/utils/code-only";
// (the /code-only SUBPATH, not the barrel: the barrel re-exports
//  auth-context.tsx, which requires React — unresolvable in bare node+tsx.)

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
    const src = codeOnly(readFileSync(f, "utf8"));
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

// ═════════════════════════════════════════════════════════════
// THE BOUNDARY — added after DRIFT-A survived this very guard.
//
// The check above forbids inventing a WRONG prefix (`/api/customers`). It
// could never catch DRIFT-A, because its regex is `\/api\/(?!v1)` — the
// negative lookahead makes hand-appending the CORRECT prefix invisible by
// construction. apps/web/app/page.tsx:43 did exactly that for months.
//
// A guard on the client alone cannot see this break. Whether appending
// `/api/v1` is right or wrong depends on THE COMMITTED ENV VALUE — so this
// section sits on the boundary between the two and compares them.
// ═════════════════════════════════════════════════════════════

import { resolveApiBase, API_PREFIX } from "@hmarepanditji/utils/api-base";

// ── (a) NO file may hand-append a version prefix ───────────────
// Correct or not, the client must not decide this itself: resolveApiBase owns
// it, and only it can accept both env shapes and resolve them identically.
const handAppended: string[] = [];
for (const app of ["apps/web/app", "apps/web/components", "apps/web/src", "apps/admin/src", "apps/pandit/src"]) {
  for (const f of walk(join(REPO, app))) {
    const src = codeOnly(readFileSync(f, "utf8"));
    // NEXT_PUBLIC_API_URL … } /api/v1  — the DRIFT-A shape, in a template
    // literal or a string concatenation.
    // The char class must NOT exclude quotes: the real line reads
    //   `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1`
    // so the span between the variable and the prefix contains a quoted
    // fallback. An earlier version of this pattern used [^`'"\n]* and could
    // not match it — the guard passed on the very line it was written for.
    if (/NEXT_PUBLIC_API_URL[^\n]*?(\}\s*\/api\/v1|\+\s*["'`]\/api\/v1)/.test(src)) {
      handAppended.push(f.replace(REPO, "").replace(/\\/g, "/"));
    }
  }
}
assert.deepStrictEqual(
  handAppended,
  [],
  `these files hand-append "${API_PREFIX}" to NEXT_PUBLIC_API_URL. Six of the seven committed\n` +
    `values ALREADY end in it, so this doubles the prefix and every request 404s — silently,\n` +
    `because the call sites are all \`res.ok ? … : null\`. Use resolveApiBase() instead:\n  ` +
    handAppended.join("\n  "),
);

// ── (b) every COMMITTED env value reconciles with the resolver ──
// Round-trip each real committed value through resolveApiBase and assert the
// result carries EXACTLY ONE /api/v1. This is what makes the two shapes
// genuinely interchangeable rather than merely tolerated in prose.
const committed: Array<[string, string]> = [];
for (const rel of [
  ".env",
  ".env.example",
  ".env.vercel",
  "apps/web/.env.local",
  "apps/web/.env.local.example",
  "apps/admin/.env.local.example",
  "apps/pandit/.env.local",
]) {
  const p = join(REPO, rel);
  if (!existsSync(p)) continue;
  const m = /^NEXT_PUBLIC_API_URL\s*=\s*"?([^"\n\r#]*)"?/m.exec(readFileSync(p, "utf8"));
  if (m && m[1].trim()) committed.push([rel, m[1].trim()]);
}
assert.ok(committed.length >= 4, `only ${committed.length} committed values found — the reader has rotted`);

for (const [file, raw] of committed) {
  const { base, origin } = resolveApiBase(raw, false);
  const occurrences = base.split(API_PREFIX).length - 1;
  assert.strictEqual(
    occurrences,
    1,
    `${file}: "${raw}" resolves to "${base}", which carries ${occurrences} copies of ` +
      `${API_PREFIX}. The resolver must normalise every committed shape to exactly one.`,
  );
  assert.ok(!origin.includes(API_PREFIX), `${file}: origin "${origin}" still carries the prefix`);
  // idempotence: feeding the resolved base back in must not grow it
  assert.strictEqual(resolveApiBase(base, false).base, base, `${file}: resolveApiBase is not idempotent for "${raw}"`);
}

// -- (c) the THIRD variant: trusting the env AS-IS -----------
// DRIFT-A appended when the env already had the prefix (doubled). DRIFT-B
// hardcoded the wrong prefix. This one does NEITHER: it takes the env value
// unchanged and appends a route, so a bare-origin value produces
//   https://<api-host>/pandits  -> 404
// It shipped on the LIVE SEARCH SCREEN and survived every earlier sweep,
// because the file lives under apps/web/src -- not routed, but IMPORTED by
// apps/web/app/search/page.tsx and therefore in the bundle.
const trustsEnvRaw: string[] = [];
for (const app of ["apps/web/app", "apps/web/src", "apps/web/components", "apps/admin/src"]) {
  for (const f of walk(join(REPO, app))) {
    const src = codeOnly(readFileSync(f, "utf8"));
    // `const X = process.env.NEXT_PUBLIC_API_URL ?? "..."` with no resolver
    // FILE-SCOPED EXCLUSION WAS A HOLE: an earlier version added
      // `&& !/resolveApiBase/.test(src)`, so a file that IMPORTS the resolver
      // and ALSO reads the env raw somewhere else passed. Proven when reverting
      // login/page.tsx to the raw read did NOT trip the guard — the leftover
      // import excused the violation. Anchor on the DECLARATION instead: a
      // legitimate use passes the env as an ARGUMENT (no `=` before it).
      if (/=\s*process\.env\.NEXT_PUBLIC_API_URL\s*(\?\?|\|\|)/.test(src)) {
      trustsEnvRaw.push(f.replace(REPO, "").replace(/\\/g, "/"));
    }
  }
}
assert.deepStrictEqual(
  trustsEnvRaw,
  [],
  `these files take NEXT_PUBLIC_API_URL as-is and append a route. The deployed value is a
` +
    `bare ORIGIN, so every call 404s -- and the 308 shim covers "/pandits/*" but NOT bare
` +
    `"/pandits", so nothing rescues it. Use resolveApiBase():
  ` +
    trustsEnvRaw.join("\n  "),
);


// -- (d) the un-prefixed 308 shim STAYS REMOVED ---------------
// It rescued /auth/* /pandit/* /pandits/* /voice/* and nothing else, so one
// root cause produced opposite symptoms across four prefixes: customer login
// worked by accident while search 404d. Re-adding it would restore that.
const APP_TS = codeOnly(readFileSync(join(REPO, "services/api/src/app.ts"), "utf8"));
const shim = [...APP_TS.matchAll(/app\.all\(\s*["'`]\/(auth|pandit|pandits|voice)\/\*/g)].map((m) => m[1]);
assert.deepStrictEqual(
  shim,
  [],
  `the un-prefixed 308 shim is back for: ${shim.join(", ")}. It rescues four prefixes and
` +
    `leaves every other un-prefixed call 404ing, which is how customer login worked by
` +
    `accident while the search screen was dead. Fix the caller, not the router.`,
);

console.log(
  `✓ API-base one-contract guard passed (${Object.keys(declared).length} env declarations checked; ` +
    `${committed.length} committed values round-tripped; no file hand-appends ${API_PREFIX})`,
);
