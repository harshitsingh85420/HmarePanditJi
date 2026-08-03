// ─────────────────────────────────────────────────────────────
// THE DIETARY VOCABULARY — promoted to packages/types 2026-08-03, with
// NO_ONION_GARLIC born by ruling the same day.
//
// Isj's ruling, verbatim intent: NO_ONION_GARLIC is its OWN value beside
// JAIN — NEVER a mapping. Jain भोजन excludes root vegetables entirely
// (आलू, गाजर, मूली…); a सात्विक pandit who avoids only प्याज़-लहसुन eats
// all of those. Coercing one onto the other would lie in BOTH directions:
// it would promise a Jain pandit food he cannot take, and deny a सात्विक
// pandit food he happily takes.
//
// Lives beside its siblings (PUJA_LABELS, SAMAGRI_TIER_LABELS, cityVocab)
// because types is the runtime-shared package with a real dist build.
// The readiness R4 whitelist and the post-reg S2 flow both read THIS list;
// the S2 tile's exact Devanagari wording is Isj's word (voice-check
// pending) — the HI label below is the drafted default.
// ─────────────────────────────────────────────────────────────

export const DIETARY_PREFS = ["ANY", "PURE_VEG", "NO_ONION_GARLIC", "JAIN", "VEGAN"] as const;

export type DietaryPref = (typeof DIETARY_PREFS)[number];

/** Pandit app — Devanagari. The interface he acts in. */
export const DIETARY_LABELS_HI: Record<DietaryPref, string> = {
  ANY: "कुछ भी",
  PURE_VEG: "शुद्ध शाकाहारी",
  NO_ONION_GARLIC: "प्याज़-लहसुन नहीं",
  JAIN: "जैन भोजन",
  VEGAN: "वीगन",
};

export function isDietaryPref(v: unknown): v is DietaryPref {
  return typeof v === "string" && (DIETARY_PREFS as readonly string[]).includes(v);
}
