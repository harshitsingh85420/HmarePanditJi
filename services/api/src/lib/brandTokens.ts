// L3: DO-NOT-TRANSLATE brand list. These tokens must pass through
// /voice/translate untouched in EVERY target language — शिष्य stays
// शिष्य (Devanagari) even in the English UI. Implemented as a pre/post
// placeholder swap around the Sarvam call: शिष्य → ⟦S3⟧ → शिष्य.
// Longest token first so "हमारे पंडित जी" is claimed as one unit before
// any shorter token could bite into it.
export const BRAND_TOKENS = ["हमारे पंडित जी", "HmarePanditJi", "शिष्य"] as const;

/** Replace every brand token with its numbered placeholder. */
export function maskBrandTokens(text: string): string {
  let out = text;
  BRAND_TOKENS.forEach((token, i) => {
    out = out.split(token).join(`⟦S${i + 1}⟧`);
  });
  return out;
}

/** Restore placeholders to the original brand tokens. Tolerates the
 *  whitespace a translation engine may inject inside the brackets; a
 *  placeholder the engine dropped entirely simply stays absent — the
 *  sentence survives, minus the brand word (never a stray ⟦S1⟧). */
export function unmaskBrandTokens(text: string): string {
  let out = text;
  BRAND_TOKENS.forEach((token, i) => {
    out = out.replace(new RegExp(`⟦\\s*S${i + 1}\\s*⟧`, "g"), token);
  });
  // strip any bracket artifacts of dropped/mangled placeholders
  return out.replace(/⟦\s*S?\d*\s*⟧/g, "").replace(/ {2,}/g, " ").trim();
}
