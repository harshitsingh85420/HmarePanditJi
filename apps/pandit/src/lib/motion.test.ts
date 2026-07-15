import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// STEP 0 guard — the motion primitives must be A12-safe by construction:
// transform/opacity only (no layout-thrash props animated), and a
// reduced-motion path every screen can inherit. Fails the build if a primitive
// starts animating width/height/top/left/margin/padding (layout thrash on a
// budget Galaxy A12).
const src = readFileSync(join(__dirname, "motion.ts"), "utf-8");

describe("STEP 0 motion primitives — A12-safe + reduced-motion", () => {
  it("animates transform/opacity ONLY (no layout-thrashing props as keys)", () => {
    // a layout prop used as an object key (e.g. `width:`) is the violation;
    // comment mentions like "width/height/top/left" have no colon → not matched.
    expect(src).not.toMatch(/\b(width|height|top|left|right|bottom|margin|padding)\s*:/);
    // and it DOES use the safe transform/opacity primitives
    expect(src).toMatch(/opacity:/);
    expect(src).toMatch(/\b(scale|y|x):/);
  });

  it("exposes a reduced-motion path everything inherits", () => {
    expect(src).toMatch(/export function useReduced/);
    expect(src).toMatch(/export function still/);
    expect(src).toMatch(/useReducedMotion/);
  });

  it("entrance durations are short enough for a budget A12", () => {
    expect(src).toMatch(/base:\s*0\.[0-4]\d?/); // base entrance <= ~0.4s
  });
});
