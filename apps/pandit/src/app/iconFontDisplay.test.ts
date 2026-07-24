import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// ICON-FONT FOUC GUARD (QA harsh-pass, 2026-07-24). Material Symbols is a
// LIGATURE font: while it loads, fallback rendering shows the raw English
// ligature names — "touch_app", "bedtime" — inside the UI, which is both a
// visual glitch and a register violation (roman words on screen). The fix is
// `display=block` on the Google Fonts css2 import: the glyph area stays blank
// until the font is ready. This guard pins the param so a future font-tuning
// edit can't silently reintroduce the leak.
// PROVEN-TO-FAIL: dropping `&display=block` from the import turns this red.
// ─────────────────────────────────────────────────────────────

const css = readFileSync(join(__dirname, "globals.css"), "utf-8");

describe("Material Symbols — FOUC-safe loading", () => {
  it("the css2 import carries display=block", () => {
    const importLine = css.split("\n").find((l) => l.includes("Material+Symbols"));
    expect(importLine, "the Material Symbols @import must exist in globals.css").toBeTruthy();
    expect(importLine!, "ligature icon fonts must load with display=block (fallback text leaks raw English ligature names)").toContain("display=block");
  });
});
