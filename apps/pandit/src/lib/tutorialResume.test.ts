import { describe, it, expect } from "vitest";
import {
  resolveTutorialResume,
  ACTIVE_TUTORIAL_DECK,
  TUTORIAL_DECKS_ENABLED,
  TUTORIAL_TOTAL,
  TUTORIAL_V2_TOTAL,
  DECK_A_TOTAL,
} from "./tutorial-flag";
import { DECK_A } from "./tutorial-decks";

// ─────────────────────────────────────────────────────────────
// CROSS-DECK RESUME (Isj, 2026-07-22). A saved tutorial index means a DIFFERENT
// slide in each deck — index 4 of the 6-slide TutorialV2 ≠ index 4 of the 9-slide
// Deck A. Clamping a stale index into range would land the pandit mid-tutorial at
// a MISMAPPED slide, worse than restarting. So resolveTutorialResume RESTARTS on
// deck mismatch (never clamps); the clamp survives only for same-deck out-of-range.
// Tested in BOTH directions with the active deck passed explicitly, so neither the
// flag flip (6→9) nor the rollback (9→6) can regress silently.
// ─────────────────────────────────────────────────────────────

describe("resolveTutorialResume — cross-deck safety", () => {
  it("DIRECTION 1 — 6-era progress + flag ON (active deckA): restart, do NOT clamp", () => {
    // a v2 index of 4 is IN RANGE for Deck A (≤9) — the exact mismap a plain
    // clamp would miss. Marker mismatch → fresh.
    expect(resolveTutorialResume(4, "v2", "deckA", 9)).toBe(1);
    // legacy/pre-marker install (null) is read as v2 → also a mismatch vs deckA
    expect(resolveTutorialResume(4, null, "deckA", 9)).toBe(1);
    expect(resolveTutorialResume(6, undefined, "deckA", 9)).toBe(1);
  });

  it("DIRECTION 2 — 9-era progress + flag OFF (active v2, ROLLBACK): restart", () => {
    // a deckA index of 8 is OUT of v2 range anyway, but even an in-range one (3)
    // is a mismap — marker mismatch → fresh regardless of range.
    expect(resolveTutorialResume(8, "deckA", "v2", 6)).toBe(1);
    expect(resolveTutorialResume(3, "deckA", "v2", 6)).toBe(1);
  });

  it("SAME DECK, in range → resume exactly there (v2 and deckA)", () => {
    expect(resolveTutorialResume(4, "v2", "v2", 6)).toBe(4);
    expect(resolveTutorialResume(1, "v2", "v2", 6)).toBe(1);
    expect(resolveTutorialResume(6, "v2", "v2", 6)).toBe(6); // boundary = total
    expect(resolveTutorialResume(8, "deckA", "deckA", 9)).toBe(8);
    expect(resolveTutorialResume(9, "deckA", "deckA", 9)).toBe(9);
    // legacy null marker on the v2 build = same deck → a valid index survives
    expect(resolveTutorialResume(4, null, "v2", 6)).toBe(4);
  });

  it("SAME DECK, out of range → CLAMPS into range (the ruling: clamp survives ONLY here)", () => {
    // Isj, verbatim: "The clamp stays only for same-deck out-of-range values."
    // This is also flag-OFF parity: the pre-decks live mount did
    // Math.min(TOTAL, Math.max(1, n)) — a legacy 14/16-slide-era save at
    // slide 10 (no marker → 'v2') lands on the CTA (6), exactly as before.
    expect(resolveTutorialResume(7, "v2", "v2", 6)).toBe(6); // > total → clamp
    expect(resolveTutorialResume(99, "v2", "v2", 6)).toBe(6);
    expect(resolveTutorialResume(10, undefined, "v2", 6)).toBe(6); // legacy-era, marker absent
    expect(resolveTutorialResume(10, "deckA", "deckA", 9)).toBe(9);
  });

  it("SAME DECK, invalid/absent → fresh (never a crash-capable index)", () => {
    expect(resolveTutorialResume(0, "v2", "v2", 6)).toBe(1); // < 1
    expect(resolveTutorialResume(-3, "v2", "v2", 6)).toBe(1);
    expect(resolveTutorialResume("4", "v2", "v2", 6)).toBe(1); // not a number
    expect(resolveTutorialResume(undefined, "v2", "v2", 6)).toBe(1);
    expect(resolveTutorialResume(NaN, "v2", "v2", 6)).toBe(1);
    expect(resolveTutorialResume(4.9, "v2", "v2", 6)).toBe(4); // non-integer floors
  });
});

describe("tutorial-flag constants — consistent with the real decks + flag", () => {
  it("ACTIVE_TUTORIAL_DECK + TUTORIAL_TOTAL track the flag", () => {
    expect(ACTIVE_TUTORIAL_DECK).toBe(TUTORIAL_DECKS_ENABLED ? "deckA" : "v2");
    expect(TUTORIAL_TOTAL).toBe(TUTORIAL_DECKS_ENABLED ? DECK_A_TOTAL : TUTORIAL_V2_TOTAL);
  });
  it("the DECK_A_TOTAL literal never drifts from the real DECK_A length", () => {
    // tutorial-flag hard-codes 9 (data-free); this pins it to reality.
    expect(DECK_A_TOTAL).toBe(DECK_A.length);
  });
});
