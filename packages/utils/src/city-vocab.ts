// ─────────────────────────────────────────────────────────────
// THE CITY VOCABULARY — F-J4-8 Level 2, born in batch 3.
//
// Level 1 (cityKey) shipped inside the booking wizard, applied "at the
// comparison site only". The ledger's own note: reusing it for the search
// filter means either extracting it to a shared module or duplicating it —
// "and duplication is the exact class F-J4-8 L2 was meant to retire."
// This file is the extraction.
//
// WHAT THE DEFECT LOOKED LIKE, measured: the DB holds "गाज़ियाबाद" (with
// nukta). ?city=Ghaziabad returned 0. ?city=गाज़ियाबाद returned 2. A filter
// that answers only when the caller guesses the stored spelling is a dead
// control with extra steps.
//
// THE DESIGN RULE, carried over from L1: NUKTA IS NORMALISED, NOT ENUMERATED.
// NFD decomposes ज़/फ़/ड़ into base + U+093C, which is stripped — so
// गाज़ियाबाद and गाजियाबाद collapse to one key without anyone listing
// spellings. Each city is stored ONCE, in its standard forms; every variant
// is derived, never hand-listed.
// ─────────────────────────────────────────────────────────────

export interface ServedCity {
  /** canonical key — lowercase english, the identity every comparison uses */
  key: string;
  /** Roman display form */
  en: string;
  /** Devanagari display form (standard spelling, WITH nukta where standard) */
  hi: string;
}

/** The cities this platform actually serves — the wizard's venue list plus
 *  the travel matrix's endpoints. ONE list; the search filter and the wizard
 *  both read it, which is what makes F-J4-2's cure a wiring and not a fork. */
export const SERVED_CITIES: readonly ServedCity[] = [
  { key: "delhi", en: "Delhi", hi: "दिल्ली" },
  { key: "dwarka", en: "Dwarka", hi: "द्वारका" },
  { key: "rohini", en: "Rohini", hi: "रोहिणी" },
  { key: "south delhi", en: "South Delhi", hi: "दक्षिण दिल्ली" },
  { key: "east delhi", en: "East Delhi", hi: "पूर्वी दिल्ली" },
  { key: "west delhi", en: "West Delhi", hi: "पश्चिमी दिल्ली" },
  { key: "north delhi", en: "North Delhi", hi: "उत्तरी दिल्ली" },
  { key: "noida", en: "Noida", hi: "नोएडा" },
  { key: "greater noida", en: "Greater Noida", hi: "ग्रेटर नोएडा" },
  { key: "ghaziabad", en: "Ghaziabad", hi: "गाज़ियाबाद" },
  { key: "gurgaon", en: "Gurgaon", hi: "गुड़गांव" },
  { key: "faridabad", en: "Faridabad", hi: "फ़रीदाबाद" },
  // served by the travel matrix though not offered as venue cities
  { key: "haridwar", en: "Haridwar", hi: "हरिद्वार" },
  { key: "jaipur", en: "Jaipur", hi: "जयपुर" },
  { key: "varanasi", en: "Varanasi", hi: "वाराणसी" },
] as const;

/** Aliases whose NORMALISED form differs from any stored form's key —
 *  synonyms and alternate names, not spelling variants (those are derived). */
const ALIASES: Record<string, string> = {
  "गुरुग्राम": "gurgaon",
  gurugram: "gurgaon",
  "काशी": "varanasi",
  kashi: "varanasi",
};

/** NFD → strip nukta (U+093C) → NFC → trim → lowercase. The L1 normaliser,
 *  unchanged in semantics — extraction, not revision. */
function normalise(raw: string | null | undefined): string {
  return String(raw ?? "")
    .normalize("NFD")
    .replace(/़/g, "")
    .normalize("NFC")
    .trim()
    .toLowerCase();
}

const KEY_BY_NORMALISED: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const c of SERVED_CITIES) {
    m[normalise(c.en)] = c.key;
    m[normalise(c.hi)] = c.key;
  }
  for (const [alias, key] of Object.entries(ALIASES)) m[normalise(alias)] = key;
  return m;
})();

/** Canonical key for a city name in either script. Unknown names fall through
 *  to their own normalised form, so two unknown-but-identical names still
 *  compare equal and nothing is silently mis-matched. */
export function cityKey(raw: string | null | undefined): string {
  const n = normalise(raw);
  return KEY_BY_NORMALISED[n] ?? n;
}

/**
 * Every WRITTEN form a stored row might carry for this city — for a database
 * whose column holds free text in either script. The nukta-stripped Devanagari
 * variant is DERIVED (normalise-and-recompose), never hand-listed.
 *
 * Unknown cities return just the input: the filter then matches exactly what
 * was asked, rather than nothing — an unknown city is not an error, it is a
 * city we have no synonyms for.
 */
export function cityForms(rawOrKey: string): string[] {
  const key = cityKey(rawOrKey);
  const entry = SERVED_CITIES.find((c) => c.key === key);
  if (!entry) return [rawOrKey.trim()].filter(Boolean);
  const stripped = entry.hi.normalize("NFD").replace(/़/g, "").normalize("NFC");
  return [...new Set([entry.en, entry.hi, stripped])];
}
