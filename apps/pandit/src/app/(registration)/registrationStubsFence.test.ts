import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// (registration) ROUTE-GROUP FENCE (Isj order, 2026-07-25 — PAGE 7 item).
// The group is dead UI: every page is a redirect stub to the canonical
// /login + /onboarding flow. PAGE 7 §8 settled the direction — canon
// frame 6 IS the shipped single-screen form (no wizard exists to revive) —
// but the stubs STAY as redirect safety for legacy links/resume states.
// FENCED, not deleted: this guard pins every page in the group as a
// redirect-only stub, so UI can never silently regrow behind dead routes.
// Reviving a real screen here requires deleting the fence consciously.
// ─────────────────────────────────────────────────────────────

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return walk(p);
    return f === "page.tsx" ? [p] : [];
  });

describe("(registration) stubs — redirect-only, fenced", () => {
  const pages = walk(__dirname);

  it("the group still exists and holds the known stubs", () => {
    expect(pages.length).toBeGreaterThanOrEqual(8);
  });

  for (const p of walk(__dirname)) {
    const rel = p.slice(__dirname.length + 1) || p;
    it(`${rel} stays a redirect stub (no UI may regrow here)`, () => {
      const src = readFileSync(p, "utf8");
      expect(src, "a stub must redirect").toMatch(/router\.replace\(|redirect\(/);
      expect(src, "renders nothing").toMatch(/return null/);
      for (const banned of ["<input", "<form", "<VoiceField", "<Button", "onSubmit", "useState("]) {
        expect(src, `${rel} grew UI (${banned}) behind a dead route — the flow lives at /login + /onboarding`).not.toContain(banned);
      }
    });
  }
});
