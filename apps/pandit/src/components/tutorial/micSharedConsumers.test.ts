import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getArtboard, PlaceholderArtboard } from "./tutorial-artboards";
import { MicPracticeArtboard } from "./MicPracticeArtboard";

// ─────────────────────────────────────────────────────────────
// TWO CONSUMERS, ONE COPY (Ruling #8 / approach C, Isj). The आवाज़ mic machinery
// exists EXACTLY ONCE — in MicPracticeArtboard — and BOTH tutorials consume that
// SAME component:
//   • consumer 1: TutorialV2 (the live 6-slide tutorial) renders it in its isMic
//     slot;
//   • consumer 2: ARTBOARDS['A4'] (the 9-slide DeckPlayer) resolves to it.
//
// If either consumer forks its own copy of the mic machinery — or ARTBOARDS['A4']
// is overwritten with the static Design artboard (the exact A4-collision the
// merge-gate warns about, docs/review/tutorial-merge-gate.md) — this build turns
// red.
//
// PROVEN-TO-FAIL (checked by temporarily breaking each, then reverting):
//   · point ARTBOARDS['A4'] at any other component  → consumer-2 assertion fails;
//   · delete the <MicPracticeArtboard/> render in TutorialV2 → consumer-1 fails.
// The consumer-2 check is by REFERENCE identity (.toBe), so a look-alike copy
// with the same source still fails — it must be the very same module export.
// ─────────────────────────────────────────────────────────────

const tutorialV2 = readFileSync(
  join(__dirname, "..", "..", "app", "onboarding", "TutorialV2.tsx"),
  "utf-8",
);

describe("आवाज़ mic — one shared component, two consumers", () => {
  it("consumer 1: TutorialV2 imports AND renders MicPracticeArtboard", () => {
    expect(tutorialV2).toMatch(
      /import\s*\{\s*MicPracticeArtboard\s*\}\s*from\s*["']@\/components\/tutorial\/MicPracticeArtboard["']/,
    );
    // rendered as an element in the isMic slot (not merely imported)
    expect(tutorialV2).toMatch(/<MicPracticeArtboard\b/);
  });

  it("consumer 2: ARTBOARDS['A4'] resolves to the SAME MicPracticeArtboard", () => {
    const a4 = getArtboard("A4");
    expect(a4).toBe(MicPracticeArtboard);
    // and it is NOT the neutral placeholder (the collision the merge-gate forbids)
    expect(a4).not.toBe(PlaceholderArtboard);
  });
});
