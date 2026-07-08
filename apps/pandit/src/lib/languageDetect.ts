// Static city/state → UI-language detection for the entry flow.
// A confirmed pick activates REAL translation (lib/i18n.ts + POST
// /voice/translate); Hindi remains the source language and fallback.

export type LangCode =
  | "hi" | "mr" | "bn" | "ta" | "te" | "kn" | "gu" | "pa" | "ml" | "or" | "en";

const STATE_TO_LANG: Record<string, LangCode> = {
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

const CITY_TO_LANG: Record<string, LangCode> = {
  delhi: "hi", "new delhi": "hi", noida: "hi", gurugram: "hi", gurgaon: "hi",
  ghaziabad: "hi", faridabad: "hi", lucknow: "hi", varanasi: "hi", patna: "hi",
  jaipur: "hi", bhopal: "hi", indore: "hi", kanpur: "hi", agra: "hi",
  mumbai: "mr", pune: "mr", nagpur: "mr", nashik: "mr",
  kolkata: "bn", howrah: "bn",
  chennai: "ta", madurai: "ta", coimbatore: "ta",
  hyderabad: "te", vijayawada: "te", visakhapatnam: "te",
  bengaluru: "kn", bangalore: "kn", mysuru: "kn",
  ahmedabad: "gu", surat: "gu", vadodara: "gu", rajkot: "gu",
  amritsar: "pa", ludhiana: "pa", chandigarh: "pa",
  kochi: "ml", thiruvananthapuram: "ml", kozhikode: "ml",
  bhubaneswar: "or", cuttack: "or",
};

export function detectLanguage(city?: string, state?: string): LangCode {
  const c = (city || "").toLowerCase().trim();
  if (c && CITY_TO_LANG[c]) return CITY_TO_LANG[c];
  const s = (state || "").toLowerCase().trim();
  if (s && STATE_TO_LANG[s]) return STATE_TO_LANG[s];
  return "hi";
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
