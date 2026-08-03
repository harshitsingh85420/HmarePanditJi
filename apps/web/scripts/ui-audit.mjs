#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// CUSTOMER UI AUDIT — the static instrument (finishing campaign Phase 0).
//
//   node scripts/ui-audit.mjs app/booking/new/booking-wizard-client.tsx [...]
//   node scripts/ui-audit.mjs --all        (every page.tsx + live components)
//
// Judges source classnames against the BLESSED vocabulary
// (components/design-system/tokens.css + tailwind.config.ts — the turn-4
// canon; see docs/review/customer-ui-finishing.md §2). Five families:
// DEAD-HEX, STRAY-HEX, DEFAULT-PALETTE, TAP-RISK, OFF-SCALE-TYPE.
// Static half only — the runtime half (computed styles + bgOf contrast at
// 360×740) runs per-page in Phase 1. A clean scorecard here is necessary,
// not sufficient.
// ─────────────────────────────────────────────────────────────
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), "..");

// the blessed hex set (tokens.css + tailwind.config.ts, which agree)
const BLESSED = new Set(
  [
    "#904d00", "#6e3a00", "#f6ede0", "#dbc3a4", // brand
    "#241a12", "#6b5b48",                         // text
    "#fbf6ee", "#efe7da", "#fff7ec", "#efe4d4",  // creams
    "#2e6b4e", "#e7f0ea",                         // tulsi (identity only)
    "#b0432e", "#e0b9ae",                         // terracotta (outlined)
    "#2a2018", "#e8ddcb", "#f0e7d8", "#b9a88f",  // chrome
  ].map((h) => h.toLowerCase()),
);

// declared-dead or never-canon (finishing doc §2)
const DEAD = ["#f49d25", "#e08c14", "#e8540a", "#22c55e", "#181511", "#8a7960", "#ec7f13", "#137fec", "#f29e0d", "#f2a20d", "#c47c0e", "#f8f7f5"];

// tailwind default palettes that should not appear on a finished page
const DEFAULT_PALETTE = /\b(?:bg|text|border|ring|divide|accent|placeholder|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g;

// tap-risk: paddings/sizes that compute under the 52px floor on interactive lines
const TAP_RISK = /\b(?:py-(?:1|1\.5|2|2\.5|3)|h-(?:4|5|6|7|8|9|10)|w-8 h-8|min-h-\[(?:1|2|3|4)\dpx\])\b/g;
const INTERACTIVE_LINE = /<(?:button|input|select|textarea|a )|onClick=|role="button"/;

// off-scale type where the token scale should speak
const OFF_SCALE = /\btext-(?:xs|sm|base|lg|2xl)\b/g;

function auditFile(path) {
  const src = readFileSync(path, "utf8");
  const lines = src.split("\n");
  const out = { dead: [], stray: [], palette: [], tap: [], type: [] };
  lines.forEach((line, i) => {
    const n = i + 1;
    for (const d of DEAD) {
      let idx = line.toLowerCase().indexOf(d);
      while (idx !== -1) {
        out.dead.push(`${n}: ${d}`);
        idx = line.toLowerCase().indexOf(d, idx + 1);
      }
    }
    for (const m of line.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
      const hex = m[0].toLowerCase();
      if (!BLESSED.has(hex) && !DEAD.includes(hex)) out.stray.push(`${n}: ${hex}`);
    }
    for (const m of line.matchAll(DEFAULT_PALETTE)) out.palette.push(`${n}: ${m[0]}`);
    if (INTERACTIVE_LINE.test(line)) for (const m of line.matchAll(TAP_RISK)) out.tap.push(`${n}: ${m[0]}`);
    for (const m of line.matchAll(OFF_SCALE)) out.type.push(`${n}: ${m[0]}`);
  });
  return out;
}

function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (["node_modules", ".next", "public"].includes(e)) continue;
      walk(p, acc);
    } else if (/\.(tsx|ts|css)$/.test(e) && !/\.test\./.test(e)) acc.push(p);
  }
  return acc;
}

const args = process.argv.slice(2);
const targets = args.includes("--all")
  ? [...walk(join(ROOT, "app")), ...walk(join(ROOT, "components"))]
  : args.map((a) => join(ROOT, a));

let dirty = 0;
for (const t of targets) {
  const r = auditFile(t);
  const total = r.dead.length + r.stray.length + r.palette.length + r.tap.length + r.type.length;
  if (total === 0) continue;
  dirty++;
  console.log(`\n■ ${relative(ROOT, t)} — ${total} hits`);
  const show = (name, arr) => {
    if (!arr.length) return;
    console.log(`  ${name} (${arr.length}): ${arr.slice(0, 8).join("  ")}${arr.length > 8 ? ` … +${arr.length - 8}` : ""}`);
  };
  show("DEAD-HEX", r.dead);
  show("STRAY-HEX", r.stray);
  show("DEFAULT-PALETTE", r.palette);
  show("TAP-RISK", r.tap);
  show("OFF-SCALE-TYPE", r.type);
}
console.log(`\n${dirty === 0 ? "✅ clean against the static vocabulary" : `✗ ${dirty} file(s) carry violations`} (${targets.length} scanned)`);
process.exitCode = dirty === 0 ? 0 : 1;
