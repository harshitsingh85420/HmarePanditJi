import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { migrateStep } from "../app/(dashboard-group)/my-poojas/add/stepModel";

// ─────────────────────────────────────────────────────────────
// ADD-WIZARD DRAFT LAWS (PAGE 14 walk, 2026-07-25).
//   1. F5-REGRESSION: migrateStep is for OLD 7-step drafts ONLY — it
//      mapped the 5-step wizard's own step 3 (वीडियो) back to 2. The
//      draft now carries v:5; a v5 step is CLAMPED, never remapped.
//   2. SUBMIT-CLEAR: removeItem was defeated by the persist effect
//      re-writing the draft after go(4) — the next add opened
//      mid-wizard pre-filled with the previous pooja. submittedRef
//      stops the persist before the removal.
// ─────────────────────────────────────────────────────────────

const src = readFileSync(
  join(__dirname, "..", "app/(dashboard-group)/my-poojas/add/page.tsx"),
  "utf8",
);

describe("draft v5 format marker", () => {
  it("a v5 draft's step is clamped to ≤3, never migrateStep-remapped", () => {
    // max 3: step 4 is post-submit only — a draft can never resume to the
    // done card for a pooja that was never sent
    expect(src).toMatch(/parsed\?\.v === 5\s*\n?\s*\? Math\.max\(0, Math\.min\(3/);
    expect(src).toMatch(/: migrateStep\(parsed\?\.step\)/);
  });
  it("the persist writes the marker", () => {
    expect(src).toMatch(/JSON\.stringify\(\{ \.\.\.d, v: 5 \}\)/);
  });
  it("the old 7-step map itself is untouched (3→2 is CORRECT for old drafts)", () => {
    expect(migrateStep(3)).toBe(2);
    expect(migrateStep(5)).toBe(3);
    expect(migrateStep(99)).toBe(4);
    expect(migrateStep(-1)).toBe(0);
  });
});

describe("submit-clear survives the persist effect", () => {
  it("submittedRef gates the persist and is set BEFORE removeItem + go(4)", () => {
    expect(src).toMatch(/if \(submittedRef\.current\) return;\s*\n\s*try \{ localStorage\.setItem\(DRAFT_KEY/);
    expect(src).toMatch(/submittedRef\.current = true;[^]*?localStorage\.removeItem\(DRAFT_KEY\)[^]*?go\(4\)/);
  });
});
