import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { migrateStep, migrateStepV5 } from "../app/(dashboard-group)/my-poojas/add/stepModel";

// ─────────────────────────────────────────────────────────────
// ADD-WIZARD DRAFT LAWS (PAGE 14 walk, 2026-07-25; RULED EDIT 2026-08-03).
//
// SUPERSESSION: this guard pinned the v5 (5-step) shape — clamp ≤3,
// persist v:5, go(4). Isj's samagri-tiers build order moved सामग्री +
// आपूर्ति into their own post-listing chapter, so the wizard is 4 steps
// and the draft is v6. The LAWS survive unchanged, one version deeper:
//   1. F5-REGRESSION: a wizard's OWN drafts are clamped, never remapped;
//      remap functions exist only for OLDER formats (7→5→4 now chains).
//   2. SUBMIT-CLEAR: submittedRef stops the persist before removeItem,
//      and the done step is go(3) now.
// ─────────────────────────────────────────────────────────────

const src = readFileSync(
  join(__dirname, "..", "app/(dashboard-group)/my-poojas/add/page.tsx"),
  "utf8",
);

describe("draft v6 format marker", () => {
  it("a v6 draft's step is clamped to ≤2, never remapped", () => {
    // max 2: step 3 is post-submit only — a draft can never resume to the
    // done card for a pooja that was never sent
    expect(src).toMatch(/parsed\?\.v === 6\s*\n?\s*\? Math\.max\(0, Math\.min\(2/);
    // v5 drafts REMAP (their सामग्री step is gone); older chain 7→5→4
    expect(src).toMatch(/\? migrateStepV5\(parsed\?\.step\)/);
    expect(src).toMatch(/: migrateStepV5\(migrateStep\(parsed\?\.step\)\)/);
  });
  it("the persist writes the marker", () => {
    expect(src).toMatch(/JSON\.stringify\(\{ \.\.\.d, v: 6 \}\)/);
    // negative polarity: the old marker must be GONE — a v5 persist beside
    // a v6 reader would fork the format
    expect(src).not.toMatch(/JSON\.stringify\(\{ \.\.\.d, v: 5 \}\)/);
  });
  it("the old maps themselves are untouched (they serve OLD drafts)", () => {
    expect(migrateStep(3)).toBe(2);
    expect(migrateStep(5)).toBe(3);
    expect(migrateStep(99)).toBe(4);
    expect(migrateStep(-1)).toBe(0);
    // v5→v4: सामग्री (1) lands on बातें (1); वीडियो (3) → 2; done (4) → 3
    // but capped at 2 (the resume-past-submit law)
    expect(migrateStepV5(0)).toBe(0);
    expect(migrateStepV5(1)).toBe(1);
    expect(migrateStepV5(2)).toBe(1);
    expect(migrateStepV5(3)).toBe(2);
    expect(migrateStepV5(4)).toBe(2);
    expect(migrateStepV5(99)).toBe(2);
    expect(migrateStepV5(-1)).toBe(0);
  });
});

describe("submit-clear survives the persist effect", () => {
  it("submittedRef gates the persist and is set BEFORE removeItem + go(3)", () => {
    expect(src).toMatch(/if \(submittedRef\.current\) return;\s*\n\s*try \{ localStorage\.setItem\(DRAFT_KEY/);
    expect(src).toMatch(/submittedRef\.current = true;[^]*?localStorage\.removeItem\(DRAFT_KEY\)[^]*?go\(3\)/);
  });
});
