// ─────────────────────────────────────────────────────────────
// TUTORIAL FLAG + SIZES — the ONE tiny, DATA-FREE module that both the light
// onboarding-store (login/registration back-law) and the heavy tutorial-decks
// import, WITHOUT pulling the deck-data chunk. Keep this module free of the
// DECK_A/DECK_B arrays so importing TUTORIAL_TOTAL into a light page never
// bundles the tutorial. (tutorial-decks.ts re-exports TUTORIAL_DECKS_ENABLED
// from here, and its test asserts DECK_A.length === DECK_A_TOTAL so these
// literals can never silently drift from the real decks.)
// ─────────────────────────────────────────────────────────────

/**
 * MERGE-GATE FLAG (Isj, docs/review/tutorial-merge-gate.md). Default OFF:
 * production serves the live 6-slide TutorialV2 until the Claude-Design artboards
 * are ported. Flip to `true` ONLY at STEP: FLIP THE FLAG (that step also retires
 * the mute/bell assertions — Ruling #8 amended). tutorial-artboards-ready.test.ts
 * enforces both directions of the flip.
 */
export const TUTORIAL_DECKS_ENABLED = false;

/** slide counts (literals, data-free). TutorialV2 = 6, Deck A = 9. */
export const TUTORIAL_V2_TOTAL = 6;
export const DECK_A_TOTAL = 9;

/**
 * Which tutorial is LIVE — the IDENTITY a persisted resume index belongs to.
 * A resume index means a DIFFERENT slide in each deck (index 4 of the 6-slide v2
 * ≠ index 4 of the 9-slide Deck A), so resume must know which one it came from.
 */
export type TutorialDeckId = "v2" | "deckA";
export const ACTIVE_TUTORIAL_DECK: TutorialDeckId = TUTORIAL_DECKS_ENABLED ? "deckA" : "v2";

/** slide count of the LIVE tutorial (flag-derived). Used by the page back-law,
 *  the resume clamp, and the store validation. */
export const TUTORIAL_TOTAL = TUTORIAL_DECKS_ENABLED ? DECK_A_TOTAL : TUTORIAL_V2_TOTAL;

/**
 * CROSS-DECK-SAFE resume resolution (Isj, 2026-07-22). A stale index from a
 * DIFFERENT tutorial than the one now live must NOT be clamped into range —
 * clamping lands the pandit at a random mid-tutorial point, worse than
 * restarting. So (the ruling, verbatim: "The clamp stays only for same-deck
 * out-of-range values"):
 *   • deck MISMATCH  → start FRESH (slide 1), never clamp;
 *   • deck MATCH     → in-range resumes there; out-of-range CLAMPS into range
 *     (identical to the pre-decks live behavior Math.min(total, max(1, n)),
 *     so flag-OFF resume is byte-for-byte unchanged — a legacy 14/16-slide-era
 *     save at slide 10 still lands on the CTA, exactly as before).
 * A missing/legacy marker is treated as "v2" (the only tutorial before decks
 * existed), so every pre-marker install is correctly read as v2 progress.
 * Pure + param-driven so BOTH directions (6-era + flag ON; 9-era + flag OFF
 * rollback) are testable without touching the build-time flag.
 */
export function resolveTutorialResume(
  savedScreen: unknown,
  savedDeck: unknown,
  activeDeck: TutorialDeckId,
  activeTotal: number,
): number {
  const deck: TutorialDeckId = savedDeck === "deckA" ? "deckA" : "v2"; // legacy/missing = v2
  if (deck !== activeDeck) return 1; // cross-deck → fresh, do NOT clamp
  if (typeof savedScreen !== "number" || !Number.isFinite(savedScreen) || savedScreen < 1) {
    return 1; // absent/invalid → fresh
  }
  // same deck: in-range passes through; out-of-range clamps (the ruling's clamp)
  return Math.min(Math.floor(savedScreen), activeTotal);
}
