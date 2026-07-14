#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// META-LAW: EVERY api guard test runs in CI — by construction.
// The api `test` script used to be a hand-maintained chain
// (`tsx a && tsx b && …`). A new guard test (bookingStatus, route-audit,
// noAwaitedReplyChainable, and the ones still to come) ran ONLY if
// someone remembered to append it — so a guard could ship and silently
// never execute, which is worse than no guard (it looks done).
// This runner GLOBS src/**/*.test.ts, runs each in its OWN process
// (isolation, matching the old behavior), and fails the build if ANY
// fails OR if the discovered count drops below the floor (catches a
// glob/path regression that would silently run nothing).
// ─────────────────────────────────────────────────────────────
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const API_ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const SRC = join(API_ROOT, "src");
const MIN_EXPECTED = 11; // floor — bump when guards are added; never let it silently hit 0

function findTests(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === "dist") continue;
      findTests(p, out);
    } else if (/\.test\.ts$/.test(entry)) {
      out.push(p);
    }
  }
  return out;
}

const tests = findTests(SRC).sort();

if (tests.length < MIN_EXPECTED) {
  console.error(
    `\n✗ META-LAW: discovered only ${tests.length} guard test(s), expected >= ${MIN_EXPECTED}.\n` +
      `  The glob is not finding tests — CI would run nothing. Fix the runner/paths.`,
  );
  process.exit(1);
}

console.log(`Running ${tests.length} api guard tests (auto-discovered via glob)…\n`);
const failed = [];
for (const file of tests) {
  const rel = relative(API_ROOT, file);
  // `node --import tsx <file>` resolves tsx via node module resolution
  // (a devDep of this package) — robust regardless of PATH / invoker,
  // unlike spawning a bare `tsx` shim.
  const res = spawnSync(process.execPath, ["--import", "tsx", file], {
    stdio: "inherit",
    cwd: API_ROOT,
  });
  if (res.status !== 0) failed.push(rel);
}

if (failed.length) {
  console.error(`\n✗ ${failed.length} guard test(s) FAILED:`);
  for (const f of failed) console.error("   " + f);
  process.exit(1);
}
console.log(`\n✓ all ${tests.length} api guard tests passed (glob-discovered)`);
