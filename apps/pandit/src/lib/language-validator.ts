'use client';

/**
 * Language Validator
 * Normalize language codes and validate all 15 supported languages
 * Fallback mappings for unsupported languages
 */

import type { LanguageCode } from './language-switcher';

// ─────────────────────────────────────────────────────────────
// LANGUAGE CODE MAPPINGS
// ─────────────────────────────────────────────────────────────

/**
 * All 15 supported languages with their codes
 */
export const SUPPORTED_LANGUAGES: readonly LanguageCode[] = [
  'hi-IN',  // Hindi
  'ta-IN',  // Tamil
  'te-IN',  // Telugu
  'bn-IN',  // Bengali
  'mr-IN',  // Marathi
  'gu-IN',  // Gujarati
  'kn-IN',  // Kannada
  'ml-IN',  // Malayalam
  'pa-IN',  // Punjabi
  'or-IN',  // Odia
  'en-IN',  // English
  'bho-IN', // Bhojpuri
  'mai-IN', // Maithili
  'sa-IN',  // Sanskrit
  'as-IN',  // Assamese
] as const;

/**
 * Fallback mappings for languages that need to fall back to supported ones
 */
export const FALLBACK_MAPPINGS: Record<LanguageCode, LanguageCode> = {
  'hi-IN': 'hi-IN',   // Hindi (base)
  'ta-IN': 'ta-IN',   // Tamil
  'te-IN': 'te-IN',   // Telugu
  'bn-IN': 'bn-IN',   // Bengali
  'mr-IN': 'mr-IN',   // Marathi
  'gu-IN': 'gu-IN',   // Gujarati
  'kn-IN': 'kn-IN',   // Kannada
  'ml-IN': 'ml-IN',   // Malayalam
  'pa-IN': 'pa-IN',   // Punjabi
  'or-IN': 'or-IN',   // Odia
  'en-IN': 'en-IN',   // English
  'bho-IN': 'hi-IN',  // Bhojpuri → Hindi
  'mai-IN': 'hi-IN',  // Maithili → Hindi
  'sa-IN': 'hi-IN',   // Sanskrit → Hindi
  'as-IN': 'hi-IN',   // Assamese → Hindi
};

/**
 * Alternative language code formats (ISO 639-1, BCP 47 variations)
 */
export const LANGUAGE_CODE_ALIASES: Record<string, LanguageCode> = {
  // Hindi
  'hi': 'hi-IN',
  'hin': 'hi-IN',
  'hindi': 'hi-IN',
  'hi_IN': 'hi-IN',
  'hi-in': 'hi-IN',

  // Tamil
  'ta': 'ta-IN',
  'tam': 'ta-IN',
  'tamil': 'ta-IN',
  'ta_IN': 'ta-IN',
  'ta-in': 'ta-IN',

  // Telugu
  'te': 'te-IN',
  'tel': 'te-IN',
  'telugu': 'te-IN',
  'te_IN': 'te-IN',
  'te-in': 'te-IN',

  // Bengali
  'bn': 'bn-IN',
  'ben': 'bn-IN',
  'bangla': 'bn-IN',
  'bengali': 'bn-IN',
  'bn_IN': 'bn-IN',
  'bn-in': 'bn-IN',

  // Marathi
  'mr': 'mr-IN',
  'mar': 'mr-IN',
  'marathi': 'mr-IN',
  'mr_IN': 'mr-IN',
  'mr-in': 'mr-IN',

  // Gujarati
  'gu': 'gu-IN',
  'guj': 'gu-IN',
  'gujarati': 'gu-IN',
  'gu_IN': 'gu-IN',
  'gu-in': 'gu-IN',

  // Kannada
  'kn': 'kn-IN',
  'kan': 'kn-IN',
  'kannada': 'kn-IN',
  'kn_IN': 'kn-IN',
  'kn-in': 'kn-IN',

  // Malayalam
  'ml': 'ml-IN',
  'mal': 'ml-IN',
  'malayalam': 'ml-IN',
  'ml_IN': 'ml-IN',
  'ml-in': 'ml-IN',

  // Punjabi
  'pa': 'pa-IN',
  'pan': 'pa-IN',
  'punjabi': 'pa-IN',
  'pa_IN': 'pa-IN',
  'pa-in': 'pa-IN',

  // Odia
  'or': 'or-IN',
  'ori': 'or-IN',
  'odia': 'or-IN',
  'oriya': 'or-IN',
  'or_IN': 'or-IN',
  'or-in': 'or-IN',

  // English
  'en': 'en-IN',
  'eng': 'en-IN',
  'english': 'en-IN',
  'en_IN': 'en-IN',
  'en-in': 'en-IN',

  // Bhojpuri
  'bho': 'bho-IN',
  'bhojpuri': 'bho-IN',
  'bho_IN': 'bho-IN',
  'bho-in': 'bho-IN',

  // Maithili
  'mai': 'mai-IN',
  'maithili': 'mai-IN',
  'mai_IN': 'mai-IN',
  'mai-in': 'mai-IN',

  // Sanskrit
  'sa': 'sa-IN',
  'san': 'sa-IN',
  'sanskrit': 'sa-IN',
  'sa_IN': 'sa-IN',
  'sa-in': 'sa-IN',

  // Assamese
  'as': 'as-IN',
  'asm': 'as-IN',
  'assamese': 'as-IN',
  'as_IN': 'as-IN',
  'as-in': 'as-IN',
};

/**
 * Language names in their native script and English
 */
export const LANGUAGE_NAMES: Record<LanguageCode, { native: string; english: string }> = {
  'hi-IN': { native: 'हिन्दी', english: 'Hindi' },
  'ta-IN': { native: 'தமிழ்', english: 'Tamil' },
  'te-IN': { native: 'తెలుగు', english: 'Telugu' },
  'bn-IN': { native: 'বাংলা', english: 'Bengali' },
  'mr-IN': { native: 'मराठी', english: 'Marathi' },
  'gu-IN': { native: 'ગુજરાતી', english: 'Gujarati' },
  'kn-IN': { native: 'ಕನ್ನಡ', english: 'Kannada' },
  'ml-IN': { native: 'മലയാളം', english: 'Malayalam' },
  'pa-IN': { native: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
  'or-IN': { native: 'ଓଡ଼ିଆ', english: 'Odia' },
  'en-IN': { native: 'English', english: 'English' },
  'bho-IN': { native: 'भोजपुरी', english: 'Bhojpuri' },
  'mai-IN': { native: 'मैथिली', english: 'Maithili' },
  'sa-IN': { native: 'संस्कृतम्', english: 'Sanskrit' },
  'as-IN': { native: 'অসমীয়া', english: 'Assamese' },
};

/**
 * Language priority for testing and onboarding
 */
export const LANGUAGE_PRIORITY: Record<LanguageCode, 'high' | 'medium' | 'low'> = {
  'hi-IN': 'high',   // Base language
  'ta-IN': 'high',
  'te-IN': 'high',
  'bn-IN': 'high',
  'mr-IN': 'high',
  'gu-IN': 'medium',
  'kn-IN': 'medium',
  'ml-IN': 'medium',
  'pa-IN': 'low',
  'or-IN': 'low',
  'en-IN': 'low',
  'bho-IN': 'low',
  'mai-IN': 'low',
  'sa-IN': 'low',
  'as-IN': 'low',
};

// ─────────────────────────────────────────────────────────────
// VALIDATION FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Check if a language code is supported
 */
export function isSupportedLanguage(code: string): code is LanguageCode {
  return SUPPORTED_LANGUAGES.includes(code as LanguageCode);
}

/**
 * Normalize language code from various formats to standard BCP 47 format
 * Examples:
 * - "hi" → "hi-IN"
 * - "ta_IN" → "ta-IN"
 * - "tamil" → "ta-IN"
 * - "HI-in" → "hi-IN"
 */
export function normalizeLanguageCode(code: string): LanguageCode | null {
  if (!code || typeof code !== 'string') {
    return null;
  }

  // Normalize input (lowercase, trim)
  const normalized = code.toLowerCase().trim();

  // Check direct alias mapping
  if (normalized in LANGUAGE_CODE_ALIASES) {
    return LANGUAGE_CODE_ALIASES[normalized];
  }

  // Check if already a valid LanguageCode
  if (isSupportedLanguage(normalized)) {
    return normalized;
  }

  // Try to parse BCP 47 format (e.g., "hi-IN", "hi_IN")
  const parts = normalized.split(/[-_]/);
  if (parts.length === 2) {
    const [lang, region] = parts;
    const combined = `${lang}-${region}`;

    if (isSupportedLanguage(combined)) {
      return combined;
    }

    // Try with just language code
    if (lang in LANGUAGE_CODE_ALIASES) {
      return LANGUAGE_CODE_ALIASES[lang];
    }
  }

  // Unknown language code
  return null;
}

/**
 * Get fallback language for a given language code
 * Returns the language code to use when the requested language is unavailable
 */
export function getFallbackLanguage(code: string): LanguageCode {
  const normalized = normalizeLanguageCode(code);

  if (!normalized) {
    return 'hi-IN'; // Default fallback
  }

  return FALLBACK_MAPPINGS[normalized] || 'hi-IN';
}

/**
 * Check if a language requires fallback
 */
export function requiresFallback(code: string): boolean {
  const normalized = normalizeLanguageCode(code);

  if (!normalized) {
    return true;
  }

  return FALLBACK_MAPPINGS[normalized] !== normalized;
}

/**
 * Validate language code and return validation result
 */
export interface ValidationResult {
  isValid: boolean;
  normalizedCode: LanguageCode | null;
  fallbackCode: LanguageCode;
  requiresFallback: boolean;
  error?: string;
}

export function validateLanguage(code: string): ValidationResult {
  // Check for empty/null
  if (!code || typeof code !== 'string') {
    return {
      isValid: false,
      normalizedCode: null,
      fallbackCode: 'hi-IN',
      requiresFallback: true,
      error: 'Language code is required',
    };
  }

  const normalized = normalizeLanguageCode(code);

  if (!normalized) {
    return {
      isValid: false,
      normalizedCode: null,
      fallbackCode: 'hi-IN',
      requiresFallback: true,
      error: `Unsupported language code: ${code}`,
    };
  }

  const fallback = FALLBACK_MAPPINGS[normalized];

  return {
    isValid: true,
    normalizedCode: normalized,
    fallbackCode: fallback,
    requiresFallback: fallback !== normalized,
  };
}

/**
 * Validate all 15 supported languages
 * Returns validation results for each language
 */
export function validateAllLanguages(): Map<LanguageCode, ValidationResult> {
  const results = new Map<LanguageCode, ValidationResult>();

  for (const langCode of SUPPORTED_LANGUAGES) {
    results.set(langCode, validateLanguage(langCode));
  }

  return results;
}

// ─────────────────────────────────────────────────────────────
// LANGUAGE DETECTION
// ─────────────────────────────────────────────────────────────

/**
 * Detect language from user input (transcript)
 * Looks for language names in the transcript
 */
export function detectLanguageFromTranscript(transcript: string): LanguageCode | null {
  const normalized = transcript.toLowerCase().trim();

  // Language name mappings
  const languageKeywords: Record<string, LanguageCode> = {
    'hindi': 'hi-IN',
    'hindī': 'hi-IN',
    'हिन्दी': 'hi-IN',

    'tamil': 'ta-IN',
    'tamiḻ': 'ta-IN',
    'தமிழ்': 'ta-IN',

    'telugu': 'te-IN',
    'teluɡu': 'te-IN',
    'తెలుగు': 'te-IN',

    'bengali': 'bn-IN',
    'bangla': 'bn-IN',
    'বাংলা': 'bn-IN',

    'marathi': 'mr-IN',
    'marāṭhī': 'mr-IN',
    'मराठी': 'mr-IN',

    'gujarati': 'gu-IN',
    'gujarātī': 'gu-IN',
    'ગુજરાતી': 'gu-IN',

    'kannada': 'kn-IN',
    'kannaḍa': 'kn-IN',
    'ಕನ್ನಡ': 'kn-IN',

    'malayalam': 'ml-IN',
    'malayāḷaṁ': 'ml-IN',
    'മലയാളം': 'ml-IN',

    'punjabi': 'pa-IN',
    'pañjābī': 'pa-IN',
    'ਪੰਜਾਬੀ': 'pa-IN',

    'odia': 'or-IN',
    'oriya': 'or-IN',
    'ଓଡ଼ିଆ': 'or-IN',

    'english': 'en-IN',
    'अंग्रेजी': 'en-IN',

    'bhojpuri': 'bho-IN',
    'भोजपुरी': 'bho-IN',

    'maithili': 'mai-IN',
    'मैथिली': 'mai-IN',

    'sanskrit': 'sa-IN',
    'संस्कृत': 'sa-IN',

    'assamese': 'as-IN',
    'অসমীয়া': 'as-IN',
  };

  for (const [keyword, langCode] of Object.entries(languageKeywords)) {
    if (normalized.includes(keyword.toLowerCase())) {
      return langCode;
    }
  }

  return null;
}

/**
 * Detect language from browser locale
 */
export function detectLanguageFromBrowser(): LanguageCode | null {
  if (typeof window === 'undefined' || !navigator.language) {
    return null;
  }

  const browserLang = navigator.language;
  return normalizeLanguageCode(browserLang);
}

/**
 * Get best language match from user preferences
 */
export function getBestLanguage(
  preferredLanguages: string[],
  availableLanguages: LanguageCode[] = SUPPORTED_LANGUAGES as readonly LanguageCode[]
): LanguageCode {
  for (const pref of preferredLanguages) {
    const normalized = normalizeLanguageCode(pref);

    if (normalized && availableLanguages.includes(normalized)) {
      return normalized;
    }

    // Check fallback
    const fallback = getFallbackLanguage(pref);
    if (availableLanguages.includes(fallback)) {
      return fallback;
    }
  }

  // Default to Hindi
  return 'hi-IN';
}

// ─────────────────────────────────────────────────────────────
// LANGUAGE UTILITIES
// ─────────────────────────────────────────────────────────────

/**
 * Get language name in native script
 */
export function getNativeLanguageName(code: string): string {
  const normalized = normalizeLanguageCode(code);
  if (!normalized) return 'Unknown';

  return LANGUAGE_NAMES[normalized]?.native || 'Unknown';
}

/**
 * Get language name in English
 */
export function getEnglishLanguageName(code: string): string {
  const normalized = normalizeLanguageCode(code);
  if (!normalized) return 'Unknown';

  return LANGUAGE_NAMES[normalized]?.english || 'Unknown';
}

/**
 * Get all languages with fallback to Hindi
 */
export function getLanguagesWithFallbacks(): Array<{
  code: LanguageCode;
  native: string;
  english: string;
  fallback?: LanguageCode;
  priority: 'high' | 'medium' | 'low';
}> {
  return SUPPORTED_LANGUAGES.map((code) => ({
    code,
    native: LANGUAGE_NAMES[code].native,
    english: LANGUAGE_NAMES[code].english,
    fallback: FALLBACK_MAPPINGS[code] !== code ? FALLBACK_MAPPINGS[code] : undefined,
    priority: LANGUAGE_PRIORITY[code],
  }));
}

/**
 * Get high priority languages
 */
export function getHighPriorityLanguages(): LanguageCode[] {
  return SUPPORTED_LANGUAGES.filter((code) => LANGUAGE_PRIORITY[code] === 'high');
}

/**
 * Get languages grouped by priority
 */
export function getLanguagesByPriority(): {
  high: LanguageCode[];
  medium: LanguageCode[];
  low: LanguageCode[];
} {
  const high: LanguageCode[] = [];
  const medium: LanguageCode[] = [];
  const low: LanguageCode[] = [];

  for (const code of SUPPORTED_LANGUAGES) {
    const priority = LANGUAGE_PRIORITY[code];
    if (priority === 'high') {
      high.push(code);
    } else if (priority === 'medium') {
      medium.push(code);
    } else {
      low.push(code);
    }
  }

  return { high, medium, low };
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

export default {
  normalizeLanguageCode,
  validateLanguage,
  validateAllLanguages,
  isSupportedLanguage,
  getFallbackLanguage,
  requiresFallback,
  detectLanguageFromTranscript,
  detectLanguageFromBrowser,
  getBestLanguage,
  getNativeLanguageName,
  getEnglishLanguageName,
  getLanguagesWithFallbacks,
  getHighPriorityLanguages,
  getLanguagesByPriority,
  SUPPORTED_LANGUAGES,
  FALLBACK_MAPPINGS,
  LANGUAGE_CODE_ALIASES,
  LANGUAGE_NAMES,
  LANGUAGE_PRIORITY,
};
