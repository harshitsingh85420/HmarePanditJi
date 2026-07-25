// Static city/state → UI-language detection for the entry flow.
// A confirmed pick activates REAL translation (lib/i18n.ts + POST
// /voice/translate); Hindi remains the source language and fallback.

export type LangCode =
  | "hi" | "mr" | "bn" | "ta" | "te" | "kn" | "gu" | "pa" | "ml" | "or" | "en";

// FOUNDER LAW (N1): fresh install = हिंदी, ALWAYS. This is THE single
// source for the default; every fallback below and in i18n refers here.
// Detection may PROPOSE a regional language (LangConfirm asks), but a
// switch happens only on the pandit's explicit हाँ or a list selection.
// English is deliberately absent from both detect maps — list-only.
export const DEFAULT_LANG: LangCode = "hi";

// exported for the N1 founder-law unit test (asserts no 'en' entries)
export const STATE_TO_LANG: Record<string, LangCode> = {
  // Hindi belt
  delhi: "hi", "uttar pradesh": "hi", bihar: "hi", "madhya pradesh": "hi",
  rajasthan: "hi", haryana: "hi", jharkhand: "hi", chhattisgarh: "hi",
  uttarakhand: "hi", "himachal pradesh": "hi",
  maharashtra: "mr",
  "west bengal": "bn",
  "tamil nadu": "ta",
  telangana: "te", "andhra pradesh": "te",
  karnataka: "kn",
  gujarat: "gu",
  punjab: "pa",
  kerala: "ml",
  odisha: "or", orissa: "or",
};

// SINGLE-SOURCE LAW (Isj ruling, 2026-07-25): THE one city→language detect
// map. onboarding-store's CITY_LANGUAGE_MAP is DERIVED from this — two
// hand-maintained maps had already diverged (the store's carried
// guwahati→Assamese, a language the app cannot speak; this one didn't).
// Every value here is one of the 11 speakable LangCodes BY TYPE — a map
// entry can never point at a voiceless language (Bhojpuri/Maithili/
// Sanskrit/Assamese have no LangCode). detectMapSingleSource.test.ts
// enforces derivation + the speakable-values law.
export const CITY_TO_LANG: Record<string, LangCode> = {
  delhi: "hi", "new delhi": "hi", noida: "hi", "greater noida": "hi",
  gurugram: "hi", gurgaon: "hi", ghaziabad: "hi", faridabad: "hi",
  lucknow: "hi", varanasi: "hi", patna: "hi", kanpur: "hi", agra: "hi",
  prayagraj: "hi", allahabad: "hi", mathura: "hi", haridwar: "hi",
  rishikesh: "hi", dehradun: "hi", gorakhpur: "hi",
  jaipur: "hi", udaipur: "hi", jodhpur: "hi", ajmer: "hi",
  bhopal: "hi", indore: "hi", ujjain: "hi", gwalior: "hi",
  mumbai: "mr", pune: "mr", nagpur: "mr", nashik: "mr", aurangabad: "mr",
  kolkata: "bn", howrah: "bn", siliguri: "bn", durgapur: "bn",
  chennai: "ta", madurai: "ta", coimbatore: "ta", trichy: "ta",
  hyderabad: "te", vijayawada: "te", visakhapatnam: "te", warangal: "te",
  bengaluru: "kn", bangalore: "kn", mysuru: "kn", mysore: "kn", hubli: "kn",
  ahmedabad: "gu", surat: "gu", vadodara: "gu", rajkot: "gu",
  amritsar: "pa", ludhiana: "pa", chandigarh: "pa",
  kochi: "ml", thiruvananthapuram: "ml", kozhikode: "ml", thrissur: "ml",
  bhubaneswar: "or", cuttack: "or",
};

export function detectLanguage(city?: string, state?: string): LangCode {
  const c = (city || "").toLowerCase().trim();
  if (c && CITY_TO_LANG[c]) return CITY_TO_LANG[c];
  const s = (state || "").toLowerCase().trim();
  if (s && STATE_TO_LANG[s]) return STATE_TO_LANG[s];
  return DEFAULT_LANG;
}

/** BCP-47 code for the same-origin /api/tts route + Web Speech. */
export const LANG_TO_BCP47: Record<LangCode, string> = {
  hi: "hi-IN", mr: "mr-IN", bn: "bn-IN", ta: "ta-IN", te: "te-IN",
  kn: "kn-IN", gu: "gu-IN", pa: "pa-IN", ml: "ml-IN", or: "or-IN", en: "en-IN",
};

/** Native display name for list rows and buttons. */
export const LANG_NATIVE_NAME: Record<LangCode, string> = {
  hi: "हिन्दी", mr: "मराठी", bn: "বাংলা", ta: "தமிழ்", te: "తెలుగు",
  kn: "ಕನ್ನಡ", gu: "ગુજરાતી", pa: "ਪੰਜਾਬੀ", ml: "മലയാളം", or: "ଓଡ଼ିଆ", en: "English",
};
