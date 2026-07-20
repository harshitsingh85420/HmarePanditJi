// ─────────────────────────────────────────────────────────────
// 5-STEP MODEL for the merged पूजा जोड़ें candidate (canon 18: "5 चरण").
//
// Kept as a PURE module, separate from the component, so the two risky
// parts — the draft.step remap and the merged step's voice grammar —
// can be tested without mounting React or the voice loop.
//
// THE MERGE: canon folds आपूर्ति + टीम + दक्षिणा into one "और थोड़ी बातें".
//   old 0 नाम      -> new 0 नाम
//   old 1 सामग्री   -> new 1 सामग्री
//   old 2 आपूर्ति   ┐
//   old 3 टीम      ├-> new 2 और थोड़ी बातें
//   old 4 दक्षिणा   ┘
//   old 5 वीडियो    -> new 3 वीडियो
//   old 6 done     -> new 4 done
// ─────────────────────────────────────────────────────────────

export const STEPS_5 = ["नाम", "सामग्री", "और थोड़ी बातें", "वीडियो", "भेजें"] as const;

/** the old 7-step wizard's labels, for the side-by-side and the remap */
export const STEPS_7 = ["नाम", "सामग्री", "आपूर्ति", "टीम", "दक्षिणा", "वीडियो", "भेजें"] as const;

/** old step index (0..6) -> new step index (0..4) */
export const STEP_7_TO_5: readonly number[] = [0, 1, 2, 2, 2, 3, 4];

/**
 * Migrate a persisted draft.step written by the 7-step wizard.
 * Out-of-range and non-integer values collapse to 0 — a corrupt draft must
 * never strand a pandit on a step that does not exist.
 */
export function migrateStep(oldStep: unknown): number {
  if (typeof oldStep !== "number" || !Number.isInteger(oldStep)) return 0;
  if (oldStep < 0) return 0;
  if (oldStep >= STEP_7_TO_5.length) return STEPS_5.length - 1;
  return STEP_7_TO_5[oldStep];
}

/**
 * TEAM-SIZE OPTION LABELS — the reason the merge is safe.
 *
 * The 7-step wizard labelled these "1".."5". That was harmless while टीम
 * was alone on its own step. Merged with the दक्षिणा money field it is
 * NOT: voiceController.matchVisibleOption does
 *     if (clean.includes(label)) return opt
 * so a bare label "5" matches ANY transcript containing "5" — including
 * "5000". A pandit RE-speaking an amount to correct it (VoiceField.tsx
 * defers to the command registry once the field holds a value) would set
 * teamSize instead of the amount.
 *
 * Labelling them "N पंडित" removes the collision in both directions:
 *   clean.includes("5 पंडित")  is false for "5000"
 *   "5 पंडित".includes("5000") is false
 * and it reads better aloud than a naked digit.
 */
export const teamOptionLabel = (n: number): string => `${n} पंडित`;

/** digits alone are NOT registered as keywords, for the same reason */
export const teamOptionKeywords = (n: number): string[] => [`${n} पंडित`, `${n} पण्डित`];
