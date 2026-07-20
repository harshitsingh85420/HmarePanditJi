#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// CANON STYLE EXTRACTOR
//
// The screenshot path is dead in this environment, so "render both and
// compare images" is not available. It turns out not to matter: canon is
// authored with INLINE styles, so every design value is a literal in the
// markup. Parsing it statically gives exact declared values — which is a
// stricter instrument than eyeballing a screenshot, because it reads the
// number rather than a rasterisation of it.
//
// Per artboard it reports the design vocabulary actually used: colours,
// gradients, shadows, radii, font sizes/weights, and spacing. That is the
// checklist a screen must satisfy to be "indistinguishable".
//
// Usage:
//   node scripts/canon-extract.mjs                 # inventory, all frames
//   node scripts/canon-extract.mjs 0 1 2           # detail for frames 0,1,2
//   node scripts/canon-extract.mjs --tokens        # global token census
// ─────────────────────────────────────────────────────────────
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CANON = join(ROOT, "design", "canon", "हमारे पंडित जी.dc.html");

const src = readFileSync(CANON, "utf-8");

// ── split into artboards ─────────────────────────────────────
// Each frame is <dc-import name="PhoneFrame" … title="…"> … </dc-import>,
// and they nest other dc-imports, so track depth rather than regexing to
// the first close tag (which would truncate every frame at its first
// nested component).
function splitFrames(text) {
  const frames = [];
  const open = /<dc-import\s+([^>]*)>/g;
  let m;
  const stack = [];
  const tokens = [];
  const tagRe = /<dc-import\b[^>]*>|<\/dc-import>/g;
  let t;
  while ((t = tagRe.exec(text)) !== null) {
    tokens.push({ text: t[0], index: t.index, end: tagRe.lastIndex, close: t[0] === "</dc-import>" });
  }
  for (const tok of tokens) {
    if (!tok.close) {
      const isFrame = /name="PhoneFrame"/.test(tok.text);
      const title = (tok.text.match(/title="([^"]*)"/) || [])[1] || "";
      stack.push({ isFrame, title, start: tok.end, depth: stack.length });
    } else {
      const openTok = stack.pop();
      if (openTok && openTok.isFrame) {
        frames.push({ title: openTok.title, html: text.slice(openTok.start, tok.index) });
      }
    }
  }
  return frames;
}

// ── design-value harvesters ──────────────────────────────────
const styleAttrs = (html) => [...html.matchAll(/style="([^"]*)"/g)].map((m) => m[1]);

function harvest(html) {
  const decls = styleAttrs(html).join(";");
  const grab = (re) => [...decls.matchAll(re)].map((m) => m[0].trim());

  const hexes = grab(/#[0-9A-Fa-f]{3,8}\b/g);
  const rgbas = grab(/rgba?\([^)]*\)/g);
  const gradients = [...decls.matchAll(/(linear|radial)-gradient\([^;]*?\)(?=\s*(;|$|,\s*(linear|radial)-gradient))/g)].map((m) => m[0].trim());
  const shadows = [...decls.matchAll(/box-shadow\s*:\s*([^;]+)/g)].map((m) => m[1].trim());
  const radii = [...decls.matchAll(/border-radius\s*:\s*([^;]+)/g)].map((m) => m[1].trim());
  const fontSizes = [...decls.matchAll(/font-size\s*:\s*([^;]+)/g)].map((m) => m[1].trim());
  const fontWeights = [...decls.matchAll(/font-weight\s*:\s*([^;]+)/g)].map((m) => m[1].trim());
  const letterSpacing = [...decls.matchAll(/letter-spacing\s*:\s*([^;]+)/g)].map((m) => m[1].trim());

  return { hexes, rgbas, gradients, shadows, radii, fontSizes, fontWeights, letterSpacing };
}

const census = (arr) => {
  const c = {};
  for (const v of arr) c[v] = (c[v] || 0) + 1;
  return Object.entries(c).sort((a, b) => b[1] - a[1]);
};

// ── run ──────────────────────────────────────────────────────
const frames = splitFrames(src);
const args = process.argv.slice(2);

if (args.includes("--tokens")) {
  const all = harvest(src);
  console.log("CANON GLOBAL TOKEN CENSUS\n" + "═".repeat(60));
  for (const [k, v] of Object.entries(all)) {
    const c = census(v);
    console.log(`\n${k.toUpperCase()}  (${c.length} distinct, ${v.length} uses)`);
    for (const [val, n] of c.slice(0, 18)) console.log(`  ${String(n).padStart(4)}×  ${val}`);
  }
  process.exit(0);
}

const wanted = args.filter((a) => /^\d+$/.test(a)).map(Number);

if (wanted.length === 0) {
  console.log(`CANON ARTBOARD INVENTORY — ${frames.length} frames\n` + "═".repeat(72));
  frames.forEach((f, i) => {
    const h = harvest(f.html);
    console.log(
      `${String(i).padStart(2)}  ${f.title.padEnd(38).slice(0, 38)}  ` +
        `grad ${String(h.gradients.length).padStart(2)} · shadow ${String(h.shadows.length).padStart(2)} · ` +
        `radius ${String(new Set(h.radii).size).padStart(2)} · type ${String(new Set(h.fontSizes).size).padStart(2)}`
    );
  });
  console.log(
    "\nHigher gradient/shadow counts = more visual depth to reproduce.\n" +
      "Run with frame numbers for the full value list, e.g.:  node scripts/canon-extract.mjs 0 12"
  );
  process.exit(0);
}

for (const i of wanted) {
  const f = frames[i];
  if (!f) {
    console.log(`\n frame ${i} does not exist (0..${frames.length - 1})`);
    continue;
  }
  const h = harvest(f.html);
  console.log("\n" + "═".repeat(72));
  console.log(`FRAME ${i} — ${f.title}`);
  console.log("═".repeat(72));
  for (const [k, v] of Object.entries(h)) {
    if (!v.length) continue;
    const c = census(v);
    console.log(`\n  ${k} (${c.length} distinct):`);
    for (const [val, n] of c) console.log(`    ${String(n).padStart(3)}×  ${val}`);
  }
}
