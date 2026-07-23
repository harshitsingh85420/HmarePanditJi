import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// FLAG ⇔ MOUNT (adversarial-review finding, 2026-07-23). The flag-property
// guard (tutorial-artboards-ready.test.ts) makes the FLIP safe artboard-wise,
// but a flip whose TUTORIAL mount still renders the 6-slide TutorialV2 would
// serve a 6-slide deck driven by TUTORIAL_TOTAL=9 (swallowed hardware-back on
// the CTA, mis-scaled progress). So the mount itself is flag-CONDITIONAL in
// onboarding/page.tsx — the flip alone swaps TutorialV2 → DeckPlayer(DECK_A),
// with no second wiring step to forget — and this guard greps the source so
// the conditional can never be silently removed.
//
// PROVEN-TO-FAIL: deleting the `if (TUTORIAL_DECKS_ENABLED)` branch (or the
// <DeckPlayer mount inside it, or the TutorialV2 else-path) turns this red.
// ─────────────────────────────────────────────────────────────

const src = readFileSync(join(__dirname, "page.tsx"), "utf-8");

describe("onboarding page — TUTORIAL mount is flag-conditional", () => {
  it("imports the deck machinery (DeckPlayer, DECK_A, TUTORIAL_DECKS_ENABLED)", () => {
    expect(src).toMatch(/import\s+DeckPlayer\s+from\s+["']@\/components\/tutorial\/DeckPlayer["']/);
    expect(src).toMatch(/import\s*\{[^}]*DECK_A[^}]*\}\s*from\s*["']@\/lib\/tutorial-decks["']/);
    expect(src).toMatch(/import\s*\{[^}]*TUTORIAL_DECKS_ENABLED[^}]*\}\s*from\s*["']@\/lib\/tutorial-decks["']/);
  });

  it("flag ON path mounts DeckPlayer with DECK_A", () => {
    // the conditional exists…
    expect(src).toMatch(/if\s*\(\s*TUTORIAL_DECKS_ENABLED\s*\)/);
    // …and inside the TUTORIAL phase the deck path renders DeckPlayer on DECK_A
    const flagIdx = src.indexOf("if (TUTORIAL_DECKS_ENABLED)");
    const deckIdx = src.indexOf("<DeckPlayer", flagIdx);
    expect(flagIdx).toBeGreaterThan(0);
    expect(deckIdx).toBeGreaterThan(flagIdx);
    expect(src.slice(deckIdx, src.indexOf("/>", deckIdx))).toContain("deck={DECK_A}");
  });

  it("flag OFF path keeps the live TutorialV2 mount (prod unchanged while OFF)", () => {
    expect(src).toMatch(/<TutorialV2\b/);
  });

  it("both mounts share ONE resolved slide + one slide-change handler (no fork)", () => {
    // the cross-deck-safe resolution feeds BOTH mounts — a fork here would let
    // the two paths disagree on resume behavior.
    expect(src).toMatch(/const tutorialSlide = resolveTutorialResume\(/);
    const deckBlock = src.slice(src.indexOf("if (TUTORIAL_DECKS_ENABLED)"), src.indexOf("<TutorialV2"));
    expect(deckBlock).toContain("slide={tutorialSlide}");
    expect(src.slice(src.indexOf("<TutorialV2"))).toContain("slide={tutorialSlide}");
  });
});
