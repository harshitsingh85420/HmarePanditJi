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
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, relative, basename } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const API_ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const SRC = join(API_ROOT, "src");
const MIN_EXPECTED = 39; // floor — bump when guards are added; never let it silently hit 0

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
const executionGap = []; // pattern-proven files that never EMITTED a control
let g2Emissions = 0;

// G2 EXECUTION VERIFICATION (2026-07-31). guardOfGuards' classifier is
// pattern-based — a comment containing "proveDetects(" would classify a file
// as proven without any control running. Each guard runs in its OWN process,
// so the only cross-process evidence of execution is stdout: every g2.ts
// prove* call prints a `G2-EXECUTED guard=…` line. This runner captures each
// guard's output (and re-prints it verbatim), then requires that every file
// carrying the proven PATTERN actually EMITTED — membership in the proven
// column is execution-verified, not asserted. The legacy in-file mustMatch
// loops were converted to proveMatchers the same day, so one emission format
// covers the whole suite.
const PROVEN_PATTERN = /proveMatchers\(|proveDetects\(|proveSaw\(/;

for (const file of tests) {
  const rel = relative(API_ROOT, file);
  // `node --import tsx <file>` resolves tsx via node module resolution
  // (a devDep of this package) — robust regardless of PATH / invoker,
  // unlike spawning a bare `tsx` shim.
  const res = spawnSync(process.execPath, ["--import", "tsx", file], {
    stdio: ["ignore", "pipe", "pipe"],
    cwd: API_ROOT,
    encoding: "utf8",
  });
  if (res.stdout) process.stdout.write(res.stdout);
  if (res.stderr) process.stderr.write(res.stderr);
  if (res.status !== 0) failed.push(rel);

  const emitted = (res.stdout?.match(/^G2-(?:EXECUTED|SAW) guard=/gm) || []).length;
  g2Emissions += emitted;
  if (PROVEN_PATTERN.test(readFileSync(file, "utf8")) && emitted === 0 && res.status === 0) {
    executionGap.push(basename(file));
  }
}

if (failed.length) {
  console.error(`\n✗ ${failed.length} guard test(s) FAILED:`);
  for (const f of failed) console.error("   " + f);
  process.exit(1);
}
if (executionGap.length) {
  console.error(
    `\n✗ G2 EXECUTION GAP: ${executionGap.length} guard(s) carry the proven pattern but ` +
      `EMITTED no control execution:\n   ${executionGap.join("\n   ")}\n` +
      `  The marker is prose — the control never ran. Asserted-proven is not proven.`,
  );
  process.exit(1);
}
console.log(
  `\n✓ all ${tests.length} api guard tests passed (glob-discovered); ` +
    `${g2Emissions} G2 control executions verified on stdout`,
);
