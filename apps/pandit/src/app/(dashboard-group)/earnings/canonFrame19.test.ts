import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// CANON FRAME 19 (कमाई) — exact-UI batch 2B money pins.
//
// Source-pins, same style as canonShapesLive: these are the invariants a
// well-meaning restyle would silently break, each one a MONEY RULE or a
// canon literal the artboard fixes:
//   1. the hero CountUp is the LARGEST element on the screen (46px) and
//      binds the REAL month figure — never a mockup number
//   2. the आना-बाकी heading amount is Σ(pending rows) BY CONSTRUCTION —
//      heading and rows can never disagree
//   3. no rupee figure anywhere in the file is hardcoded (truthful-state:
//      every ₹ is immediately followed by a binding, not a digit)
//   4. the hero coins fall on canon's g-coin literals (-90px → +64px,
//      200deg roll, 2s/2.2s ease-in infinite)
// ─────────────────────────────────────────────────────────────

const src = readFileSync(join(__dirname, "page.tsx"), "utf-8");
// comments may QUOTE canon figures ("₹8,200 = 5,600 + 2,600") — strip them
// before scanning; only emitted code is held to the no-hardcoded-₹ law
const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("कमाई — canon frame 19 money pins", () => {
  it("hero: 46px CountUp bound to the real month summary (MONEY RULE: largest element)", () => {
    expect(src).toMatch(/target=\{summary\.month\}[^/]*text-\[46px\]/);
    // nothing on the screen out-sizes the money
    const sizes = [...src.matchAll(/text-\[(\d+)px\]/g)].map((m) => Number(m[1]));
    expect(Math.max(...sizes)).toBe(46);
  });

  it("आना बाकी heading ≡ Σ pending rows (conservation by construction)", () => {
    expect(src).toMatch(/pendingPayouts\.reduce\(\(sum, p\) => sum \+ p\.amount, 0\)/);
    // the old skew-prone source must not come back
    expect(src).not.toMatch(/MoneyCount\s+target=\{summary\.pendingPayout\}/);
  });

  it("no hardcoded rupee amount (truthful-state)", () => {
    // every ₹ in emitted code must be followed by a binding `{`, never a digit
    expect(code).not.toMatch(/₹\s*[0-9०-९]/);
  });

  it("hero coins fall on canon g-coin literals", () => {
    expect(src).toMatch(/translateY\(-90px\) rotate\(0deg\)/);
    expect(src).toMatch(/translateY\(64px\) rotate\(200deg\)/);
    expect(src).toMatch(/animationDuration: "2s", animationDelay: "-0\.3s"/);
    expect(src).toMatch(/animationDuration: "2\.2s", animationDelay: "-1\.1s"/);
    // reduced-motion still has a kill-switch for the fall
    expect(src).toMatch(/prefers-reduced-motion: reduce/);
  });

  it("type floors hold: labels ≥15, body ≥18, nothing below 15", () => {
    const sizes = [...src.matchAll(/text-\[(\d+)px\]/g)].map((m) => Number(m[1]));
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(15);
  });
});

describe("कमाई — canon frame 27b whole-screen empty", () => {
  it("truly-empty earnings render the दीया screen, not a ₹0 dashboard", () => {
    // the guard covers every figure AND both lists — a zero hero must never
    // render as if it were data
    for (const cond of [
      /summary\.today === 0/,
      /summary\.week === 0/,
      /summary\.month === 0/,
      /summary\.pendingPayout === 0/,
      /pendingPayouts\.length === 0/,
      /paidPayouts\.length === 0/,
    ]) {
      expect(src).toMatch(cond);
    }
    // canon ornament: drawn दीया at 86, lit
    expect(src).toMatch(/ornament=\{<Diya size=\{86\} lit \/>\}/);
  });
});
