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
  /** City-centre coordinates — PUBLIC GEOGRAPHY, not user data. Used for one
   *  purpose only: resolving a customer's own browser coordinates to the
   *  NEAREST SERVED CITY (the honesty-ladder's source). Distances between
   *  cities come from the CityDistance matrix, never from these. */
  lat: number;
  lng: number;
}

/** The cities this platform actually serves — the wizard's venue list plus
 *  the travel matrix's endpoints. ONE list; the search filter and the wizard
 *  both read it, which is what makes F-J4-2's cure a wiring and not a fork. */
export const SERVED_CITIES: readonly ServedCity[] = [
  { key: "delhi", en: "Delhi", hi: "दिल्ली", lat: 28.6139, lng: 77.209 },
  { key: "dwarka", en: "Dwarka", hi: "द्वारका", lat: 28.5921, lng: 77.046 },
  { key: "rohini", en: "Rohini", hi: "रोहिणी", lat: 28.7383, lng: 77.0822 },
  { key: "south delhi", en: "South Delhi", hi: "दक्षिण दिल्ली", lat: 28.5245, lng: 77.2066 },
  { key: "east delhi", en: "East Delhi", hi: "पूर्वी दिल्ली", lat: 28.628, lng: 77.2952 },
  { key: "west delhi", en: "West Delhi", hi: "पश्चिमी दिल्ली", lat: 28.6663, lng: 77.067 },
  { key: "north delhi", en: "North Delhi", hi: "उत्तरी दिल्ली", lat: 28.7183, lng: 77.2007 },
  { key: "noida", en: "Noida", hi: "नोएडा", lat: 28.5355, lng: 77.391 },
  { key: "greater noida", en: "Greater Noida", hi: "ग्रेटर नोएडा", lat: 28.4744, lng: 77.504 },
  { key: "ghaziabad", en: "Ghaziabad", hi: "गाज़ियाबाद", lat: 28.6692, lng: 77.4538 },
  { key: "gurgaon", en: "Gurgaon", hi: "गुड़गांव", lat: 28.4595, lng: 77.0266 },
  { key: "faridabad", en: "Faridabad", hi: "फ़रीदाबाद", lat: 28.4089, lng: 77.3178 },
  // served by the travel matrix though not offered as venue cities
  { key: "haridwar", en: "Haridwar", hi: "हरिद्वार", lat: 29.9457, lng: 78.1642 },
  { key: "jaipur", en: "Jaipur", hi: "जयपुर", lat: 26.9124, lng: 75.7873 },
  { key: "varanasi", en: "Varanasi", hi: "वाराणसी", lat: 25.3176, lng: 82.9739 },
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
 * THE NUKTA HAS TWO ENCODINGS AND ONLY ONE OF THEM RECOMPOSES — measured the
 * hard way, 2026-08-02. ज़ can be U+095B (precomposed) or U+091C U+093C
 * (base + nukta), and 095B sits on Unicode's COMPOSITION-EXCLUSION list, so
 * NFC leaves the decomposed pair decomposed forever. The production DB stores
 * the DECOMPOSED form; this file's own source literal carried the PRECOMPOSED
 * one; and the first cityForms returned the literal raw — so a Devanagari
 * search matched NOTHING while the Roman one worked. Byte-identical to the
 * eye, disjoint to the database.
 *
 * The cure stays inside the design rule (derive, never enumerate): every
 * variant below is COMPUTED from one stored form. The pair map is Unicode's
 * own nukta table, not a city list.
 */
// Codepoints, not literals: a source literal for the nukta letters is itself
// ambiguous between the two encodings — which is exactly how the original
// defect got written. Numbers cannot be re-encoded by an editor.
const PRECOMPOSED_BY_BASE: Record<number, number> = {
  0x915: 0x958, 0x916: 0x959, 0x917: 0x95a, 0x91c: 0x95b,
  0x921: 0x95c, 0x922: 0x95d, 0x92b: 0x95e, 0x92f: 0x95f,
};

/**
 * Every WRITTEN form a stored row might carry for this city — for a database
 * whose column holds free text in either script and either nukta encoding.
 *
 * Unknown cities return just the input: the filter then matches exactly what
 * was asked, rather than nothing — an unknown city is not an error, it is a
 * city we have no synonyms for.
 */
export function cityForms(rawOrKey: string): string[] {
  const key = cityKey(rawOrKey);
  const entry = SERVED_CITIES.find((c) => c.key === key);
  if (!entry) return [rawOrKey.trim()].filter(Boolean);
  /** decomposed: every nukta letter as base + U+093C — what the DB holds */
  const decomposed = entry.hi.normalize("NFD").normalize("NFC");
  /** precomposed: each base+nukta pair folded to its single codepoint */
  const precomposed = decomposed.replace(/([क-य])़/g, (m, base) => {
    const pre = PRECOMPOSED_BY_BASE[base.codePointAt(0) as number];
    return pre ? String.fromCodePoint(pre) : m;
  });
  /** stripped: no nukta at all — the common typed form */
  const stripped = decomposed.replace(/़/g, "");
  return [...new Set([entry.en, decomposed, precomposed, stripped])];
}

/**
 * Resolve browser coordinates to the NEAREST SERVED CITY, or null when the
 * customer is too far from every city we serve (beyond ~60 km the claim
 * "nearest" stops meaning anything a booking can use).
 *
 * ONE haversine pass over fifteen public centroids — this is city RESOLUTION,
 * not distance display. Displayed kilometres come from the CityDistance
 * matrix only; printing raw-coordinate maths as a distance would be the
 * fabricated-km defect wearing a formula.
 */
export function nearestServedCity(lat: number, lng: number): ServedCity | null {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  let best: ServedCity | null = null;
  let bestKm = Infinity;
  for (const c of SERVED_CITIES) {
    const dLat = rad(c.lat - lat);
    const dLng = rad(c.lng - lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat)) * Math.cos(rad(c.lat)) * Math.sin(dLng / 2) ** 2;
    const km = 2 * R * Math.asin(Math.sqrt(a));
    if (km < bestKm) { bestKm = km; best = c; }
  }
  return bestKm <= 60 ? best : null;
}
