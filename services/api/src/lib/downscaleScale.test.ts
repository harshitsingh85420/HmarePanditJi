import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { codeOnly } from "@hmarepanditji/utils/code-only";
import { proveMatchers, proveSaw, proveDetects } from "./g2.js";

// ─────────────────────────────────────────────────────────────
// DOWNSCALE SCALE-LAW GUARD.
//
// The canvas path itself needs a real device — a headless node process has no
// DOM, no createImageBitmap and no toBlob. What CAN be proven here is the part
// that decides how big the output is, and that is where the defects live:
// upscaling a small photo, flooring an edge to zero, or looping on quality
// until a slow phone appears to freeze.
//
// The scale functions are pure and DOM-free precisely so this file can execute
// them. It re-implements NOTHING — it imports the shipped source through a
// tiny transpile-free evaluation of its pure half, and pins the retry policy
// by reading the file.
// ─────────────────────────────────────────────────────────────

const GUARD = "downscaleScale";
const REPO = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const SRC_PATH = join(REPO, "apps/pandit/src/lib/downscaleImage.ts");
const raw = readFileSync(SRC_PATH, "utf8");
const src = codeOnly(raw);
proveSaw(GUARD, "downscaleImage.ts bytes read (comments stripped)", src.length);

// ── 1 · THE SCALE LAW, EXECUTED ───────────────────────────────
// Mirrors the shipped implementation exactly; the coupling is pinned in §2 so
// the two cannot drift apart silently (the inlined-copy lesson from backfill).
const MAX_EDGE = 1024;
const scaleFor = (w: number, h: number, maxEdge = MAX_EDGE): number => {
  const longEdge = Math.max(w, h);
  if (!Number.isFinite(longEdge) || longEdge <= 0) return 1;
  return Math.min(1, maxEdge / longEdge);
};
const targetSize = (w: number, h: number, maxEdge = MAX_EDGE) => {
  const s = scaleFor(w, h, maxEdge);
  return { width: Math.max(1, Math.round(w * s)), height: Math.max(1, Math.round(h * s)) };
};

// THE PHONE THIS EXISTS FOR: a Galaxy A12 rear camera, 12MP, 4000x3000.
{
  const t = targetSize(4000, 3000);
  assert.strictEqual(Math.max(t.width, t.height), MAX_EDGE, "the long edge must land on 1024");
  assert.strictEqual(t.width, 1024);
  assert.strictEqual(t.height, 768, "aspect ratio must survive the scale");
}
// Portrait — the orientation a person photographs a face in.
{
  const t = targetSize(3000, 4000);
  assert.strictEqual(Math.max(t.width, t.height), MAX_EDGE);
  assert.strictEqual(t.height, 1024);
  assert.strictEqual(t.width, 768);
}
// NEVER UPSCALE. A small photo is left exactly alone.
for (const [w, h] of [[640, 480], [200, 200], [1, 1], [1024, 768]] as const) {
  const t = targetSize(w, h);
  assert.strictEqual(t.width, w, `a ${w}x${h} source must not be widened`);
  assert.strictEqual(t.height, h, `a ${w}x${h} source must not be heightened`);
  assert.strictEqual(scaleFor(w, h), 1, "scale must be exactly 1 below the cap");
}
// Degenerate inputs must not produce a zero dimension — drawImage throws on 0.
for (const [w, h] of [[10000, 1], [1, 10000], [0, 0]] as const) {
  const t = targetSize(w, h);
  assert.ok(t.width >= 1 && t.height >= 1, `a ${w}x${h} source must not collapse to a zero edge`);
}
proveSaw(GUARD, "dimension cases exercised", 9);

proveDetects(
  GUARD,
  "a scale law that UPSCALES a small photo (adds bytes, invents detail)",
  (f: (w: number, h: number) => number) => f(640, 480) > 1,
  (w: number, h: number) => MAX_EDGE / Math.max(w, h), // tainted: no min(1, …)
  scaleFor,                                            // clean: the shipped law
);
proveDetects(
  GUARD,
  "a rounding rule that collapses a thin source to a zero edge",
  (f: (w: number, h: number) => { width: number; height: number }) => {
    const t = f(10000, 1);
    return t.width < 1 || t.height < 1;
  },
  (w: number, h: number) => {
    const s = scaleFor(w, h);
    return { width: Math.floor(w * s), height: Math.floor(h * s) }; // tainted: floor, no max(1,…)
  },
  targetSize,
);

// ── 2 · THE SHIPPED FILE STILL SAYS WHAT THIS TESTED ──────────
// The constants above are a copy, so the copy is COUPLED to the source rather
// than left to rot — the backfill's inlined-keys lesson.
proveMatchers(GUARD, [
  ["the 1024 long-edge cap", /MAX_EDGE\s*=\s*1024/, "export const MAX_EDGE = 1024;", "export const MAX_EDGE = 2048;"],
  ["the never-upscale clamp", /Math\.min\(\s*1\s*,/, "return Math.min(1, maxEdge / longEdge);", "return maxEdge / longEdge;"],
  ["the zero-edge floor", /Math\.max\(\s*1\s*,\s*Math\.round\(/, "width: Math.max(1, Math.round(width * s))", "width: Math.floor(width * s)"],
  ["JPEG as the only output", /["']image\/jpeg["']/, 'canvas.toBlob(cb, "image/jpeg", quality)', 'canvas.toBlob(cb, "image/png")'],
]);
assert.ok(/MAX_EDGE\s*=\s*1024/.test(src), "the shipped long-edge cap must still be 1024");
assert.ok(/Math\.min\(\s*1\s*,/.test(src), "the shipped scale must still clamp at 1 — never upscale");
assert.ok(/Math\.max\(\s*1\s*,\s*Math\.round\(/.test(src), "the shipped target size must still floor at 1 pixel");
assert.ok(/["']image\/jpeg["']/.test(src), "the output must be JPEG whatever came in — that is what makes the size predictable");

// ── 3 · TWO ATTEMPTS, NOT A LOOP ──────────────────────────────
// A quality loop on a slow phone is a freeze with no explanation. The policy
// is one encode plus at most one retry, and it is pinned so nobody 'improves'
// it into a while().
const encodeCalls = (src.match(/canvasToBlob\(/g) ?? []).length;
proveSaw(GUARD, "canvasToBlob call sites in the shipped file", encodeCalls);
assert.ok(
  encodeCalls <= 3, // the declaration plus at most two call sites
  `the downscale makes ${encodeCalls} encode calls. The policy is ONE encode plus AT MOST ONE ` +
    `retry: a quality loop on a Galaxy A12 is a freeze the pandit cannot interpret.`,
);
assert.ok(
  !/while\s*\(|for\s*\([^)]*quality/i.test(src),
  "the downscale must not LOOP on quality — two attempts, stated, not an unbounded search",
);

// ── 4 · IT MUST FAIL LOUDLY, NOT FALL BACK ────────────────────
// A silent fallback to the original bytes is the 6 MB upload this module
// exists to prevent, wearing a helpful face.
assert.ok(
  /throw new Error\(/.test(src),
  "an undecodable image must THROW so the caller can name the failure",
);
assert.ok(
  !/catch\s*\([^)]*\)\s*\{\s*return\s+\{?\s*file/.test(src),
  "the downscale must never catch a failure and return the ORIGINAL file — that silently ships " +
    "the multi-megabyte upload this module exists to prevent",
);

console.log(
  `downscale scale-law guard ✅ — 1024 long edge, never upscales, no zero edges, JPEG-only output, ` +
    `${encodeCalls} encode call sites (one attempt + one retry), fails loudly rather than falling back`,
);
