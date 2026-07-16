import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// KM-PRESETS GUARD (founder-ratified data-shape): the यात्रा max-distance is
// chosen from FOUR preset chips (10/25/50/100+ कि.मी.; 999 = the 100+ sentinel)
// stored as ownVehicle.maxKm — and a legacy saved value outside the presets
// must stay visible (never silently lost). Fails the build if the presets
// drift, the sentinel changes meaning, or the passthrough disappears.
// ─────────────────────────────────────────────────────────────
const src = readFileSync(join(__dirname, "page.tsx"), "utf-8");

describe("यात्रा distance presets — four chips, sentinel, legacy passthrough", () => {
  it("presets are exactly 10/25/50/999(=100+)", () => {
    const block = src.match(/const KM_PRESETS[\s\S]*?\];/)?.[0] ?? "";
    for (const km of [10, 25, 50, 999]) {
      expect(block, `preset ${km} missing`).toMatch(new RegExp(`km:\\s*${km}\\b`));
    }
    expect(block).toMatch(/100\+ कि\.मी\./); // the sentinel's honest label
    expect((block.match(/km:\s*\d+/g) || []).length).toBe(4);
  });

  it("chips store the preset into ownVehicle.maxKm", () => {
    expect(src).toMatch(/KM_PRESETS\.map[\s\S]{0,400}maxKm:\s*km/);
  });

  it("a legacy saved value outside the presets stays visible", () => {
    expect(src).toMatch(/!KM_PRESETS\.some[\s\S]{0,300}selected/);
  });
});
