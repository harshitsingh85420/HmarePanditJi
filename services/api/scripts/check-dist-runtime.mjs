#!/usr/bin/env node
/**
 * POST-BUILD RUNTIME-RESOLUTION GUARD.
 *
 * WHY THIS EXISTS — it cost a production outage.
 *
 * `packages/types` shipped `"main": "./src/index.ts"`. Every app that consumes
 * it is Next.js, which transpiles workspace packages, so nothing ever
 * complained. Then services/api — which is COMPILED and run as plain Node —
 * gained its first runtime (value, not type) import from it:
 *
 *     import { KYC_REVIEW_QUEUE_STATUSES } from "@hmarepanditji/types";
 *
 * `dist/index.js` then did `require("@hmarepanditji/types")`, Node resolved
 * that to a `.ts` file, and the process died on boot. The API was down until
 * someone read the Render log.
 *
 * TSC CANNOT SEE THIS. Typechecking resolves `@hmarepanditji/types` happily —
 * a `.ts` entry point is a perfectly good source of types. The build is green,
 * the tests are green, every guard is green, and the artifact cannot start.
 * Only a check that inspects the BUILT OUTPUT catches it.
 *
 * Two rules, both about the emitted artifact rather than the source:
 *   1. nothing under dist/ may require a path ending in `.ts`
 *   2. every workspace package dist/ requires must resolve to built JS —
 *      its `main` must end in `.js` and that file must exist
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const API = join(HERE, "..");
const REPO = join(API, "..", "..");
const DIST = join(API, "dist");

console.log("Running dist runtime-resolution guard…");

if (!existsSync(DIST)) {
  console.error("✗ services/api/dist does not exist — build before running this guard");
  process.exit(1);
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith(".js")) out.push(p);
  }
  return out;
}

const files = walk(DIST);
if (files.length < 10) {
  console.error(`✗ only ${files.length} .js files in dist — the build looks incomplete`);
  process.exit(1);
}

const rel = (p) => p.replace(REPO, "").replace(/\\/g, "/");
const problems = [];
const workspaceImports = new Set();

for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/require\(["']([^"']+)["']\)/g)) {
    const spec = m[1];

    // RULE 1 — a compiled artifact must never require TypeScript.
    if (spec.endsWith(".ts") || spec.endsWith(".tsx")) {
      problems.push(`${rel(f)} requires "${spec}" — a compiled artifact must not require TypeScript`);
    }
    if (spec.startsWith("@hmarepanditji/")) workspaceImports.add(spec);
  }
}

// RULE 2 — every workspace package on the runtime path must ship built JS.
for (const spec of [...workspaceImports].sort()) {
  const [scope, name, ...sub] = spec.split("/");
  const pkgDir = join(REPO, "packages", name);
  const pkgJson = join(pkgDir, "package.json");

  if (!existsSync(pkgJson)) {
    problems.push(`dist requires "${spec}" but ${rel(pkgDir)}/package.json does not exist`);
    continue;
  }
  const pkg = JSON.parse(readFileSync(pkgJson, "utf8"));

  // A subpath import (e.g. @hmarepanditji/utils/code-only) resolves to a file
  // at the package root, not through `main`.
  if (sub.length) {
    const candidates = [`${sub.join("/")}.js`, `${sub.join("/")}/index.js`];
    const found = candidates.find((c) => existsSync(join(pkgDir, c)));
    if (!found) {
      const ts = [`${sub.join("/")}.ts`, `${sub.join("/")}/index.ts`].find((c) => existsSync(join(pkgDir, c)));
      problems.push(
        `dist requires the subpath "${spec}" but ${rel(pkgDir)} has no built ${candidates[0]}` +
          (ts ? ` — only ${ts}, which Node cannot require` : ""),
      );
    }
    continue;
  }

  const main = pkg.main || "index.js";
  if (!main.endsWith(".js")) {
    problems.push(
      `"${spec}" has main "${main}" — services/api is COMPILED and run as plain Node, so it can only ` +
        `require built JS. Give the package a build with dist entry points (see packages/db).`,
    );
    continue;
  }
  if (!existsSync(join(pkgDir, main))) {
    problems.push(
      `"${spec}" declares main "${main}" but that file does not exist — the package was not built ` +
        `before services/api. Add it to the build command.`,
    );
  }
}

if (problems.length) {
  console.error("\n✗ dist runtime-resolution guard FAILED\n");
  for (const p of problems) console.error("   · " + p);
  console.error(
    "\n  This class is invisible to tsc: typechecking is happy to read types from a .ts entry\n" +
      "  point, so the build passes and the artifact still cannot boot. It took the API down\n" +
      "  once already.\n",
  );
  process.exit(1);
}

console.log(
  `✓ dist runtime-resolution guard passed (${files.length} emitted files; ` +
    `workspace deps on the runtime path: ${[...workspaceImports].sort().join(", ") || "none"} — all resolve to built JS)`,
);
