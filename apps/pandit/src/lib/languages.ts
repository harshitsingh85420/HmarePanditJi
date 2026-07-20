// ─────────────────────────────────────────────────────────────
// LANGUAGE REGISTRY — the single source of truth for what languages
// this app can be, what they are called, and how शिष्य speaks them.
//
// THE CEILING IS VOICE. This app is voice-first: a pandit who cannot
// read is expected to be able to USE it. So a language may only be
// enabled if Sarvam TTS has a real voice for it. The verified ceiling
// below is taken from the SarvamLanguageCode union in lib/sarvam-tts.ts
// (11 codes, all -IN):
//     hi bn ta te kn ml mr gu pa or en
//
// Languages WITHOUT a Sarvam voice must stay `enabled: false`, however
// much we want them. lib/sarvam-tts.ts currently maps Bhojpuri,
// Maithili, Sanskrit and Assamese onto hi-IN as a silent fallback —
// that is a Hindi voice reading a non-Hindi UI, which we will not ship
// as if it were support. They are listed here, disabled, with the
// reason, so the gap is visible instead of forgotten.
//
// TO ENABLE A LANGUAGE see docs/ADDING_A_LANGUAGE.md — a registry row
// alone is NOT enough; the locale file must be complete (the
// per-locale completeness guard fails the build otherwise).
// ─────────────────────────────────────────────────────────────

import type { SarvamLanguageCode } from "./sarvam-tts";

export interface LanguageEntry {
  /** BCP-47-ish short code, and the locale filename: locales/<code>.ts */
  code: string;
  /** the language's name IN ITS OWN SCRIPT — never a transliteration */
  nativeName: string;
  /** English name, for admin/debug surfaces only */
  englishName: string;
  /** Sarvam TTS id. null = no real voice ⇒ can never be enabled. */
  ttsCode: SarvamLanguageCode | null;
  /** shipped to pandits. Requires ttsCode AND a complete locale file. */
  enabled: boolean;
  /** why a language is not enabled — kept so the gap stays visible */
  note?: string;
}

export const LANGUAGES: readonly LanguageEntry[] = [
  // ── enabled ──────────────────────────────────────────────
  { code: "hi", nativeName: "हिन्दी", englishName: "Hindi", ttsCode: "hi-IN", enabled: true },
  // English has its Sarvam voice and its registry row; the flag flips to
  // true in the SAME commit as a complete locales/en.ts. Enabling it
  // early would ship a half-English app — and the completeness guard
  // (correctly) fails the build the moment it is enabled without the file.
  { code: "en", nativeName: "English", englishName: "English", ttsCode: "en-IN", enabled: false, note: "translation in progress — flip with locales/en.ts in one commit" },

  // ── has a real Sarvam voice; awaiting a complete locale file ──
  { code: "mr", nativeName: "मराठी", englishName: "Marathi", ttsCode: "mr-IN", enabled: false, note: "locale file not written yet" },
  { code: "bn", nativeName: "বাংলা", englishName: "Bengali", ttsCode: "bn-IN", enabled: false, note: "locale file not written yet" },
  { code: "ta", nativeName: "தமிழ்", englishName: "Tamil", ttsCode: "ta-IN", enabled: false, note: "locale file not written yet" },
  { code: "te", nativeName: "తెలుగు", englishName: "Telugu", ttsCode: "te-IN", enabled: false, note: "locale file not written yet" },
  { code: "kn", nativeName: "ಕನ್ನಡ", englishName: "Kannada", ttsCode: "kn-IN", enabled: false, note: "locale file not written yet" },
  { code: "ml", nativeName: "മലയാളം", englishName: "Malayalam", ttsCode: "ml-IN", enabled: false, note: "locale file not written yet" },
  { code: "gu", nativeName: "ગુજરાતી", englishName: "Gujarati", ttsCode: "gu-IN", enabled: false, note: "locale file not written yet" },
  { code: "pa", nativeName: "ਪੰਜਾਬੀ", englishName: "Punjabi", ttsCode: "pa-IN", enabled: false, note: "locale file not written yet" },
  { code: "or", nativeName: "ଓଡ଼ିଆ", englishName: "Odia", ttsCode: "or-IN", enabled: false, note: "locale file not written yet" },

  // ── NO Sarvam voice — cannot be enabled under the voice-first law ──
  { code: "bho", nativeName: "भोजपुरी", englishName: "Bhojpuri", ttsCode: null, enabled: false, note: "no Sarvam voice; today it silently falls back to a hi-IN voice" },
  { code: "mai", nativeName: "मैथिली", englishName: "Maithili", ttsCode: null, enabled: false, note: "no Sarvam voice; falls back to hi-IN" },
  { code: "as", nativeName: "অসমীয়া", englishName: "Assamese", ttsCode: null, enabled: false, note: "no Sarvam voice; falls back to hi-IN" },
  { code: "sa", nativeName: "संस्कृत", englishName: "Sanskrit", ttsCode: null, enabled: false, note: "no Sarvam voice; falls back to hi-IN" },
] as const;

/** THE default. Never changes: a pandit with no signal of any kind gets Hindi. */
export const DEFAULT_LANGUAGE = "hi";

export const getLanguage = (code: string): LanguageEntry | undefined =>
  LANGUAGES.find((l) => l.code === code);

/** the only languages a pandit may be given or may choose */
export const enabledLanguages = (): LanguageEntry[] => LANGUAGES.filter((l) => l.enabled);

export const isEnabled = (code: string): boolean => !!getLanguage(code)?.enabled;

/** Sarvam id for the active language; falls back to Hindi's voice rather
 *  than going silent — losing the UI language is survivable, losing the
 *  VOICE is not (voice-first law). */
export const ttsCodeFor = (code: string): SarvamLanguageCode =>
  getLanguage(code)?.ttsCode ?? "hi-IN";

// ─────────────────────────────────────────────────────────────
// STATE → DEFAULT LANGUAGE. Detection only ever supplies a DEFAULT;
// an explicit choice always wins and is never overridden (see
// lib/languagePreference.ts).
//
// Keys are the state/UT strings as returned by the reverse geocoder
// (Nominatim, English names) that the location step already calls.
// A state whose language has no Sarvam voice maps to the nearest
// ENABLED language rather than to an unspeakable one.
// ─────────────────────────────────────────────────────────────
export const STATE_TO_LANGUAGE: Record<string, string> = {
  // Hindi belt
  "Uttar Pradesh": "hi",
  "Uttarakhand": "hi",
  "Madhya Pradesh": "hi",
  "Bihar": "hi",           // Bhojpuri/Maithili have no voice → Hindi
  "Jharkhand": "hi",
  "Rajasthan": "hi",
  "Haryana": "hi",
  "Himachal Pradesh": "hi",
  "Chhattisgarh": "hi",
  "Delhi": "hi",
  "National Capital Territory of Delhi": "hi",
  "Chandigarh": "hi",
  // Regional-language states (all have Sarvam voices)
  "Maharashtra": "mr",
  "Goa": "mr",
  "West Bengal": "bn",
  "Tripura": "bn",
  "Tamil Nadu": "ta",
  "Puducherry": "ta",
  "Andhra Pradesh": "te",
  "Telangana": "te",
  "Karnataka": "kn",
  "Kerala": "ml",
  "Lakshadweep": "ml",
  "Gujarat": "gu",
  "Dadra and Nagar Haveli and Daman and Diu": "gu",
  "Punjab": "pa",
  "Odisha": "or",
  // No Sarvam voice for the local language → Hindi, honestly
  "Assam": "hi",
  "Manipur": "hi",
  "Meghalaya": "hi",
  "Mizoram": "hi",
  "Nagaland": "hi",
  "Sikkim": "hi",
  "Arunachal Pradesh": "hi",
  "Jammu and Kashmir": "hi",
  "Ladakh": "hi",
  "Andaman and Nicobar Islands": "hi",
};

/**
 * Default language for a detected state.
 * Falls back to Hindi for an unknown state, and DOWNGRADES to Hindi if the
 * mapped language is not enabled yet — detection must never hand a pandit
 * a language the app cannot actually speak or render.
 */
export function languageForState(state: string | null | undefined): string {
  if (!state) return DEFAULT_LANGUAGE;
  const mapped = STATE_TO_LANGUAGE[state.trim()];
  if (!mapped) return DEFAULT_LANGUAGE;
  return isEnabled(mapped) ? mapped : DEFAULT_LANGUAGE;
}
