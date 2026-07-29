#!/usr/bin/env node
/**
 * cgrep — grep that only sees CODE. Comments are stripped first, always.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS: the tool was not the shortest path to type.
 *
 * `codeOnly()` was built after the SIXTH sighting of one bug — a search that
 * matched its own explanatory prose. Eleven guards adopted it. Then, on the
 * SEVENTH sighting, an ad-hoc re-sweep ran `grep -rn` anyway and reported three
 * "surviving phantom fields" that were all COMMENTS recording their own fix.
 *
 * That is the second failure caused by NON-ADOPTION rather than absence. The
 * lesson is not "remember to use codeOnly" — that was already the rule, and it
 * was already written down. `grep -rn` is nine characters and codeOnly is an
 * import; the mistake was cheaper than the tool.
 *
 *     A TOOL THAT IS HARDER TO USE THAN THE MISTAKE IS NOT A TOOL YET.
 *
 * So this is a drop-in that is SHORTER than the thing it replaces:
 *
 *     node scripts/cgrep.mjs "getItem" apps/web          # code only
 *     node scripts/cgrep.mjs "token" apps --strings      # ignore string bodies too
 *     node scripts/cgrep.mjs "Public" services --raw     # opt OUT, and say why
 *
 * `--raw` exists for the one documented exception (an artifact that IS a
 * comment — see RAW_SOURCE_REQUIRED in packages/utils/src/code-only.ts). It
 * prints a banner so a raw search can never be mistaken for a normal one.
 * ─────────────────────────────────────────────────────────────────────────
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const here = dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const REPO = resolve(here, "..");
const { codeOnly } = await import(pathToFileURL(join(REPO, "packages/utils/dist/code-only.js")).href)
  .catch(async () => {
    // packages/utils has no build; fall back to a local strip with the same
    // semantics rather than silently doing nothing.
    const mod = await import(pathToFileURL(join(REPO, "packages/utils/src/code-only.ts")).href).catch(() => null);
    if (mod) return mod;
    return {
      codeOnly: (s) =>
        s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
         .split("\n").map((l) => (/^\s*(\/\/|\*)/.test(l) ? "" : l)).join("\n"),
    };
  });

const args = process.argv.slice(2);
const raw = args.includes("--raw");
const blankStrings = args.includes("--strings");
const rest = args.filter((a) => !a.startsWith("--"));
const [pattern, ...roots] = rest;

if (!pattern) {
  console.error("usage: node scripts/cgrep.mjs <regex> [paths…] [--strings] [--raw]");
  process.exit(2);
}

const SKIP = new Set(["node_modules", ".next", "dist", "build", ".git", "coverage", ".turbo"]);
const EXT = /\.(ts|tsx|js|jsx|mjs|cjs|prisma|json|md|ya?ml)$/;

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  if (statSync(dir).isFile()) return [dir];
  for (const e of readdirSync(dir)) {
    if (SKIP.has(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (EXT.test(e)) out.push(p);
  }
  return out;
}

if (raw) {
  console.error(
    "⚠️  --raw: searching WITH comments. Only valid when the artifact you are asserting on\n" +
      "    IS a comment (see RAW_SOURCE_REQUIRED). Any other raw search is the bug that\n" +
      "    codeOnly exists to prevent — it has now cost seven sightings.\n",
  );
}

const re = new RegExp(pattern, "g");
const files = (roots.length ? roots : ["."]).flatMap((r) => walk(join(REPO, r)));
let hits = 0;

for (const f of files) {
  let text;
  try { text = readFileSync(f, "utf8"); } catch { continue; }
  const hay = raw ? text : codeOnly(text, { hash: /\.(env|ya?ml)/.test(f), strings: blankStrings ? "blank" : "keep" });
  hay.split("\n").forEach((line, i) => {
    re.lastIndex = 0;
    if (re.test(line)) {
      // print the ORIGINAL line so the output is readable, but the MATCH was
      // made against code only — the point is what matched, not what is shown.
      console.log(`${f.replace(REPO, "").replace(/\\/g, "/").replace(/^\//, "")}:${i + 1}:${text.split("\n")[i]?.trim() ?? ""}`);
      hits++;
    }
  });
}

console.error(`\n# ${hits} match(es) in ${files.length} file(s) — ${raw ? "RAW (comments included)" : "code only, comments stripped"}`);
process.exit(hits ? 0 : 1);
