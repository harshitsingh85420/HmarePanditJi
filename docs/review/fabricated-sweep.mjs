// FABRICATED-NOT-EMPTY SWEEP — apps/web (the LIVE tree: apps/web/app).
//
// The class: a surface renders hardcoded domain data as if it were live,
// while a real API for that data sits unasked. Phase 0 missed muhurat
// because it measured the API and not the RENDERED SURFACE.
//
// WHAT THIS INSTRUMENT CLAIMS, precisely:
//   For each page, it resolves the page's LOCAL import subtree (a page is
//   often a shell whose child does the fetching — scoring the page file
//   alone would be fail-plausible), asks whether ANYTHING in that subtree
//   calls the server, and separately extracts domain-shaped literals.
// WHAT IT DOES NOT CLAIM: that a literal is a lie. It enumerates
//   candidates with evidence. The classification is a human reading.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname, resolve } from "node:path";

const REPO = process.argv[2];
const WEB = join(REPO, "apps/web");
const APP_DIR = join(WEB, "app"); // the LIVE tree

const walk = (d, out = []) => {
  let es; try { es = readdirSync(d); } catch { return out; }
  for (const e of es) {
    if (["node_modules", ".next", "dist", ".turbo"].includes(e)) continue;
    const p = join(d, e);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};
const rel = (f) => relative(REPO, f).replace(/\\/g, "/");
const read = (f) => { try { return readFileSync(f, "utf8"); } catch { return ""; } };

// ── does this source ASK THE SERVER? ────────────────────────────────
// Widened deliberately: a page that reaches the API through a hook, a
// context, or a generated client still asks. Narrow matching here would
// manufacture false members of the class.
const ASKS_RE = /\bfetch\s*\(|useSWR|useQuery|axios|resolveApiBase|API_URL|NEXT_PUBLIC_API_URL|\bapi\.[a-z]\w*\(|createServerClient/;
const asks = (src) => ASKS_RE.test(src);

// ── domain-shaped literals ──────────────────────────────────────────
// An array of >=2 object literals, or a keyed Record. Keys are reported
// verbatim so UI chrome ({key,label}) is separable from domain claims
// ({title,time}, {rating,reviews}, {price}) BY READING, not by my guess.
// TWO FORMS. The first control run passed on form 1 (`const pujas =
// {3:{count:4},…}`) while being BLIND to form 2 — the inline
// `{[{title:"Wedding",time:"7:00 AM - 12:00 PM"},…].map(…)}` that was the
// SHARPEST fabrication on the very page I used as the positive control.
// A control that passes for the wrong reason is a fail-open. Form 2 is
// now matched and separately controlled below.
function harvest(body, name, out) {
  const objs = body.match(/\{[^{}]*\}/g) || [];
  if (objs.length < 2) return;
  const keys = new Set();
  for (const o of objs) for (const k of o.matchAll(/(?:^|[{,\s])["']?([A-Za-z_]\w*)["']?\s*:/g)) keys.add(k[1]);
  if (keys.size === 0) return;
  out.push({ name, count: objs.length, keys: [...keys].sort(), sample: objs[0].replace(/\s+/g, " ").slice(0, 110) });
}
function literals(src) {
  const found = [];
  // form 1 — named binding
  for (const m of src.matchAll(/(?:const|let)\s+(\w+)\s*(?::[^=]{0,120})?=\s*(\[[\s\S]{0,2600}?\]|\{[\s\S]{0,2600}?\})\s*;/g))
    harvest(m[2], m[1], found);
  // form 2 — anonymous array literal rendered straight into JSX
  for (const m of src.matchAll(/\{\s*(\[[\s\S]{0,2600}?\])\s*\.map\s*\(/g))
    harvest(m[1], "<inline JSX array>", found);
  return found;
}

// ── local import subtree ────────────────────────────────────────────
function resolveImport(fromFile, spec) {
  if (!spec.startsWith(".") && !spec.startsWith("@/")) return null;
  const base = spec.startsWith("@/") ? join(WEB, spec.slice(2)) : resolve(dirname(fromFile), spec);
  for (const c of [base + ".tsx", base + ".ts", join(base, "index.tsx"), join(base, "index.ts")])
    if (existsSync(c)) return c;
  return null;
}
function subtree(entry, seen = new Set()) {
  if (seen.has(entry)) return seen;
  seen.add(entry);
  const src = read(entry);
  for (const m of src.matchAll(/(?:^|\n)\s*import[^"']*["']([^"']+)["']/g)) {
    const r = resolveImport(entry, m[1]);
    if (r) subtree(r, seen);
  }
  return seen;
}

// ═══ CONTROLS ═══════════════════════════════════════════════════════
// The known member is the PRE-FIX muhurat page, pulled from git — the
// real production shape, not a specimen I wrote to match my own matcher.
console.log("── CONTROLS ──");
const PRE_FIX = process.argv[3] ? read(process.argv[3]) : "";
let ok = true;
function ctl(label, got, want) {
  const pass = got === want;
  ok = ok && pass;
  console.log(`  ${pass ? "✓" : "✗"} ${label.padEnd(58)} ${String(got).padEnd(6)}${pass ? "" : " EXPECTED " + want}`);
}
if (!PRE_FIX) { console.log("  ✗ pre-fix specimen not supplied — refusing to report."); process.exit(1); }
ctl("POSITIVE · pre-fix muhurat: asks the server?", asks(PRE_FIX), false);
ctl("POSITIVE · pre-fix muhurat: domain literals found?", literals(PRE_FIX).length > 0, true);
// The form-2 control, planted on the exact shape the first run missed.
// It names the subject: the four invented ceremonies with invented times.
const inlineHit = literals(PRE_FIX).find((l) => l.name === "<inline JSX array>" && l.keys.includes("time") && l.keys.includes("title"));
ctl("POSITIVE · form 2 · the inline 'Wedding 7:00 AM' array seen", Boolean(inlineHit), true);
ctl("POSITIVE · form 2 · it carries all four ceremonies", inlineHit?.count, 4);
const FIXED = read(join(APP_DIR, "muhurat/page.tsx"));
ctl("NEGATIVE · fixed muhurat now asks the server?", asks(FIXED), true);
const BOOKINGS = read(join(APP_DIR, "dashboard/bookings/page.tsx"));
ctl("NEGATIVE · bookings (real fetcher) asks?", asks(BOOKINGS), true);
ctl("SENSITIVITY · bookings still shows its UI literal", literals(BOOKINGS).length > 0, true);
if (!ok) { console.log("\nINSTRUMENT NOT READY — refusing to report."); process.exit(1); }
console.log("  (last control: the matcher does NOT distinguish UI chrome from a");
console.log("   domain claim — keys are printed so the reading is done by eye.)\n");

// ═══ SWEEP ══════════════════════════════════════════════════════════
// SCOPE IS ITSELF A CLAIM. The first run scanned only page/layout files —
// a fabricated CHILD component rendered by a fetching page would have been
// invisible. Every .tsx render unit in the live tree is scanned now, plus
// every local file any page pulls in (which reaches apps/web/src/components).
const pages = walk(APP_DIR).filter((f) => /[\\/](page|layout)\.tsx$/.test(f));
const units = new Set(walk(APP_DIR).filter((f) => /\.tsx$/.test(f) && !/\.test\./.test(f)));
for (const p of pages) for (const f of subtree(p)) if (/\.tsx$/.test(f)) units.add(f);

const urlOf = (f) => "/" + relative(APP_DIR, f).replace(/\\/g, "/").replace(/(^|\/)(page|layout)\.tsx$/, "")
  .split("/").filter((s) => s && !/^\(.*\)$/.test(s)).join("/");

const silent = [], mixed = [];
for (const p of [...units]) {
  const lits = literals(read(p));
  if (!lits.length) continue;
  const tree = [...subtree(p)];
  const treeAsks = tree.some((f) => asks(read(f)));
  const isPage = /[\\/](page|layout)\.tsx$/.test(p);
  const row = { url: isPage ? urlOf(p) : "(component)", file: rel(p), lits, treeSize: tree.length };
  (treeAsks ? mixed : silent).push(row);
}

const show = (rows, head, note) => {
  console.log(`── ${head}: ${rows.length} ──`);
  console.log(`   ${note}`);
  for (const r of rows.sort((a, b) => a.url.localeCompare(b.url))) {
    console.log(`\n   ${r.url}   (${r.file}, subtree ${r.treeSize} files)`);
    for (const l of r.lits) console.log(`      ${l.name} ×${l.count}  keys: ${l.keys.join(",")}`);
  }
  console.log("");
};
console.log(`SCOPE — ${units.size} .tsx render units (${pages.length} page/layout + children) under the LIVE tree\n`);
show(silent, "BUCKET A · literals AND the whole subtree never asks the server", "the muhurat shape exactly");
show(mixed, "BUCKET B · subtree DOES ask, but the file also carries literals", "partial fabrication lives here; read the keys");
