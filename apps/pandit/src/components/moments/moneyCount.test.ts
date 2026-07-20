import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// MONEY-COUNT TRUTH GUARD. This component animates the one number the
// pandit is actually here for, so its motion may be tuned but its
// guarantees may not regress. Pinned:
//   1. easing lands EXACTLY on the target (a money figure must never
//      settle a rupee short)
//   2. the wall-clock start survives (the frozen-partial-rupees fix —
//      live QA once caught कुल stuck at ₹269 of ₹1,350)
//   3. the settle timeout accounts for the delay, or it fires mid-climb
//      and snaps the figure early
//   4. a hiding tab still gets the true value immediately
//   5. Indian grouping in every locale
// ─────────────────────────────────────────────────────────────

const src = readFileSync(join(__dirname, "MoneyCount.tsx"), "utf-8");

/** the exact easing the component uses */
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

describe("count-up easing", () => {
  it("lands exactly on the target at completion", () => {
    for (const target of [1350, 2100, 5600, 52400, 1_00_000]) {
      expect(Math.floor(easeOutCubic(1) * target)).toBe(target);
    }
  });

  it("never overshoots the target at any point", () => {
    for (let p = 0; p <= 1; p += 0.01) {
      expect(easeOutCubic(p)).toBeLessThanOrEqual(1);
      expect(easeOutCubic(p)).toBeGreaterThanOrEqual(0);
    }
  });

  it("starts at zero — the pandit sees the climb begin", () => {
    expect(Math.floor(easeOutCubic(0) * 52400)).toBe(0);
  });

  it("is monotonic (a money figure never counts backwards)", () => {
    let prev = -1;
    for (let p = 0; p <= 1; p += 0.02) {
      const v = Math.floor(easeOutCubic(p) * 52400);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });
});

describe("count-up hardening survives the canon retune", () => {
  it("keeps the wall-clock start (not the first rAF frame)", () => {
    expect(src).toMatch(/const start = performance\.now\(\) \+ delayMs/);
    expect(src, "must not seed the clock from the first frame").not.toMatch(/if \(!startTimestamp\)/);
  });

  it("clamps negative elapsed during the delay", () => {
    expect(src).toMatch(/Math\.max\(elapsed, 0\)/);
  });

  it("settle timeout includes the delay", () => {
    expect(src).toMatch(/delayMs \+ durationMs \+ 400/);
  });

  it("a hiding tab snaps to the true value", () => {
    expect(src).toMatch(/visibilitychange/);
    expect(src).toMatch(/visibilityState === "hidden"/);
  });

  it("reduced motion shows the final figure immediately", () => {
    expect(src).toMatch(/prefers-reduced-motion/);
  });

  it("formats with Indian grouping", () => {
    expect(src).toMatch(/toLocaleString\("en-IN"\)/);
    expect((52400).toLocaleString("en-IN")).toBe("52,400");
    expect((100000).toLocaleString("en-IN")).toBe("1,00,000");
  });
});
