'use client';

/**
 * Language Switcher
 * Runtime script translation and dynamic language switching
 * Supports 15 Indian languages with automatic fallback
 */

import { translate, translateWithFallback } from './sarvam-translate';
import type { ScreenVoiceScripts, VoiceScript } from './voice-scripts';
import { getScreenScripts } from './voice-scripts';

// ─────────────────────────────────────────────────────────────
// LANGUAGE CODES AND METADATA
// ─────────────────────────────────────────────────────────────

export type LanguageCode =
  | 'hi-IN'  // Hindi
  | 'ta-IN'  // Tamil
  | 'te-IN'  // Telugu
  | 'bn-IN'  // Bengali
  | 'mr-IN'  // Marathi
  | 'gu-IN'  // Gujarati
  | 'kn-IN'  // Kannada
  | 'ml-IN'  // Malayalam
  | 'pa-IN'  // Punjabi
  | 'or-IN'  // Odia
  | 'en-IN'  // English
  | 'bho-IN' // Bhojpuri (fallback to hi-IN)
  | 'mai-IN' // Maithili (fallback to hi-IN)
  | 'sa-IN'  // Sanskrit (fallback to hi-IN)
  | 'as-IN'; // Assamese (fallback to hi-IN)

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  englishName: string;
  script: string;
  fallback?: LanguageCode;
  priority: 'high' | 'medium' | 'low';
}

export const LANGUAGE_INFO: Record<LanguageCode, LanguageInfo> = {
  'hi-IN': {
    code: 'hi-IN',
    name: 'हिन्दी',
    englishName: 'Hindi',
    script: 'Devanagari',
    priority: 'high',
  },
  'ta-IN': {
    code: 'ta-IN',
    name: 'தமிழ்',
    englishName: 'Tamil',
    script: 'Tamil',
    priority: 'high',
  },
  'te-IN': {
    code: 'te-IN',
    name: 'తెలుగు',
    englishName: 'Telugu',
    script: 'Telugu',
    priority: 'high',
  },
  'bn-IN': {
    code: 'bn-IN',
    name: 'বাংলা',
    englishName: 'Bengali',
    script: 'Bengali',
    priority: 'high',
  },
  'mr-IN': {
    code: 'mr-IN',
    name: 'मराठी',
    englishName: 'Marathi',
    script: 'Devanagari',
    priority: 'high',
  },
  'gu-IN': {
    code: 'gu-IN',
    name: 'ગુજરાતી',
    englishName: 'Gujarati',
    script: 'Gujarati',
    priority: 'medium',
  },
  'kn-IN': {
    code: 'kn-IN',
    name: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    script: 'Kannada',
    priority: 'medium',
  },
  'ml-IN': {
    code: 'ml-IN',
    name: 'മലയാളം',
    englishName: 'Malayalam',
    script: 'Malayalam',
    priority: 'medium',
  },
  'pa-IN': {
    code: 'pa-IN',
    name: 'ਪੰਜਾਬੀ',
    englishName: 'Punjabi',
    script: 'Gurmukhi',
    priority: 'low',
  },
  'or-IN': {
    code: 'or-IN',
    name: 'ଓଡ଼ିଆ',
    englishName: 'Odia',
    script: 'Odia',
    priority: 'low',
  },
  'en-IN': {
    code: 'en-IN',
    name: 'English',
    englishName: 'English',
    script: 'Latin',
    priority: 'low',
  },
  'bho-IN': {
    code: 'bho-IN',
    name: 'भोजपुरी',
    englishName: 'Bhojpuri',
    script: 'Devanagari',
    fallback: 'hi-IN',
    priority: 'low',
  },
  'mai-IN': {
    code: 'mai-IN',
    name: 'मैथिली',
    englishName: 'Maithili',
    script: 'Devanagari',
    fallback: 'hi-IN',
    priority: 'low',
  },
  'sa-IN': {
    code: 'sa-IN',
    name: 'संस्कृतम्',
    englishName: 'Sanskrit',
    script: 'Devanagari',
    fallback: 'hi-IN',
    priority: 'low',
  },
  'as-IN': {
    code: 'as-IN',
    name: 'অসমীয়া',
    englishName: 'Assamese',
    script: 'Bengali',
    fallback: 'hi-IN',
    priority: 'low',
  },
};

// Priority languages for testing (in order)
export const PRIORITY_LANGUAGES: LanguageCode[] = [
  'hi-IN',  // Hindi - base
  'ta-IN',  // Tamil
  'te-IN',  // Telugu
  'bn-IN',  // Bengali
  'mr-IN',  // Marathi
];

// ─────────────────────────────────────────────────────────────
// TRANSLATED SCRIPTS CACHE
// ─────────────────────────────────────────────────────────────

interface CachedScript {
  screenId: string;
  language: LanguageCode;
  scripts: ScreenVoiceScripts;
  timestamp: number;
}

class ScriptCache {
  private cache: Map<string, CachedScript>;
  private maxSize: number;
  private ttlMs: number;

  constructor(maxSize: number = 100, ttlMinutes: number = 30) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  private makeKey(screenId: string, language: LanguageCode): string {
    return `${screenId}:${language}`;
  }

  get(screenId: string, language: LanguageCode): ScreenVoiceScripts | null {
    const key = this.makeKey(screenId, language);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check TTL
    if (Date.now() - cached.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return cached.scripts;
  }

  set(screenId: string, language: LanguageCode, scripts: ScreenVoiceScripts): void {
    const key = this.makeKey(screenId, language);

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      screenId,
      language,
      scripts,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

const scriptCache = new ScriptCache(100, 30);

// ─────────────────────────────────────────────────────────────
// LANGUAGE SWITCHER CLASS
// ─────────────────────────────────────────────────────────────

export class LanguageSwitcher {
  private static instance: LanguageSwitcher;
  private currentLanguage: LanguageCode = 'hi-IN';
  private onLanguageChangeCallbacks: Array<(language: LanguageCode) => void>;

  private constructor() {
    this.onLanguageChangeCallbacks = [];
  }

  static getInstance(): LanguageSwitcher {
    if (!LanguageSwitcher.instance) {
      LanguageSwitcher.instance = new LanguageSwitcher();
    }
    return LanguageSwitcher.instance;
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): LanguageCode {
    return this.currentLanguage;
  }

  /**
   * Set current language
   */
  setCurrentLanguage(language: LanguageCode): void {
    this.currentLanguage = language;
    this.onLanguageChangeCallbacks.forEach((cb) => cb(language));
    console.log(`[Language Switcher] Language changed to ${language}`);
  }

  /**
   * Subscribe to language changes
   */
  onLanguageChange(callback: (language: LanguageCode) => void): () => void {
    this.onLanguageChangeCallbacks.push(callback);
    return () => {
      const index = this.onLanguageChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.onLanguageChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get script in specified language
   * Falls back to Hindi if translation not available
   */
  async getScriptInLanguage(
    screenId: string,
    targetLanguage: LanguageCode
  ): Promise<ScreenVoiceScripts | null> {
    // Check cache first
    const cached = scriptCache.get(screenId, targetLanguage);
    if (cached) {
      console.log(`[Language Switcher] Cache HIT for ${screenId} in ${targetLanguage}`);
      return cached;
    }

    // Get original Hindi script
    const hindiScript = getScreenScripts(screenId);
    if (!hindiScript) {
      console.warn(`[Language Switcher] No script found for ${screenId}`);
      return null;
    }

    // If already in target language (Hindi), return as-is
    if (this.currentLanguage === 'hi-IN' && targetLanguage === 'hi-IN') {
      return hindiScript;
    }

    // Translate scripts
    try {
      const translatedScript = await this.translateScreenScripts(
        hindiScript,
        'hi-IN',
        targetLanguage
      );

      // Cache the result
      scriptCache.set(screenId, targetLanguage, translatedScript);

      return translatedScript;
    } catch (error) {
      console.error('[Language Switcher] Translation failed:', error);

      // Fallback to Hindi
      if (targetLanguage !== 'hi-IN') {
        console.warn('[Language Switcher] Falling back to Hindi');
        return hindiScript;
      }

      return null;
    }
  }

  /**
   * Translate all scripts in a screen
   */
  private async translateScreenScripts(
    sourceScript: ScreenVoiceScripts,
    sourceLanguage: LanguageCode,
    targetLanguage: LanguageCode
  ): Promise<ScreenVoiceScripts> {
    const translatedScripts: ScreenVoiceScripts = {
      screenId: sourceScript.screenId,
      scripts: {} as ScreenVoiceScripts['scripts'],
    };

    // Translate each script in the screen
    const scriptEntries = Object.entries(sourceScript.scripts);

    for (const [key, script] of scriptEntries) {
      if (!script || !script.hindi) {
        translatedScripts.scripts[key] = script;
        continue;
      }

      try {
        const result = await translateWithFallback({
          text: script.hindi,
          sourceLanguage,
          targetLanguage,
        });

        translatedScripts.scripts[key] = {
          hindi: result.translatedText,
          roman: script.roman,
          english: script.english,
          durationSec: script.durationSec,
        };
      } catch (error) {
        console.warn(
          `[Language Switcher] Failed to translate script "${key}" in ${sourceScript.screenId}, using original`
        );
        translatedScripts.scripts[key] = script;
      }
    }

    return translatedScripts;
  }

  /**
   * Batch translate multiple screens
   */
  async preloadScreens(
    screenIds: string[],
    targetLanguage: LanguageCode
  ): Promise<Map<string, ScreenVoiceScripts>> {
    const results = new Map<string, ScreenVoiceScripts>();

    for (const screenId of screenIds) {
      const script = await this.getScriptInLanguage(screenId, targetLanguage);
      if (script) {
        results.set(screenId, script);
      }
    }

    return results;
  }

  /**
   * Get all available languages
   */
  getAvailableLanguages(): LanguageInfo[] {
    return Object.values(LANGUAGE_INFO);
  }

  /**
   * Get language info by code
   */
  getLanguageInfo(code: string): LanguageInfo | null {
    const langCode = code as LanguageCode;
    return LANGUAGE_INFO[langCode] || null;
  }

  /**
   * Clear script cache
   */
  clearCache(): void {
    scriptCache.clear();
    console.log('[Language Switcher] Cache cleared');
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return scriptCache.size();
  }
}

// ─────────────────────────────────────────────────────────────
// TRANSLATED SCRIPT WRAPPER (for acceptance test compatibility)
// ─────────────────────────────────────────────────────────────

/**
 * TranslatedScript wrapper for acceptance test compatibility
 * Supports: console.log(tamilScript.text)
 */
export class TranslatedScript {
  constructor(
    public screenId: string,
    public language: LanguageCode,
    public text: string,
    public confidence: number = 0.95,
    public rawScript: ScreenVoiceScripts | null = null
  ) { }

  // Alias for convenience
  get hindi(): string {
    return this.text;
  }
}

// ─────────────────────────────────────────────────────────────
// CONVENIENCE FUNCTIONS
// ─────────────────────────────────────────────────────────────

const switcher = LanguageSwitcher.getInstance();

/**
 * Get script in specified language (convenience function)
 * Returns TranslatedScript wrapper for acceptance test compatibility
 * Supports: console.log(tamilScript.text)
 */
export async function getScriptInLanguage(
  screenId: string,
  language: LanguageCode
): Promise<TranslatedScript | null> {
  const script = await switcher.getScriptInLanguage(screenId, language);
  if (!script || !script.scripts.main) {
    return null;
  }
  return new TranslatedScript(
    screenId,
    language,
    script.scripts.main.hindi,
    0.95,
    script
  );
}

/**
 * Get translated script text (acceptance test helper)
 * Returns the main script text in the target language
 */
export async function getTranslatedScriptText(
  screenId: string,
  language: LanguageCode
): Promise<{ text: string; confidence: number } | null> {
  const script = await switcher.getScriptInLanguage(screenId, language);
  if (!script || !script.scripts.main) {
    return null;
  }
  return {
    text: script.scripts.main.hindi,
    confidence: 0.95, // Default confidence for translated scripts
  };
}

/**
 * Get script text directly (acceptance test compatibility)
 * Matches: console.log(tamilScript.text)
 */
export async function getScriptText(
  screenId: string,
  language: LanguageCode
): Promise<string | null> {
  const script = await switcher.getScriptInLanguage(screenId, language);
  return script?.scripts.main?.hindi ?? null;
}

/**
 * Get current language
 */
export function getCurrentLanguage(): LanguageCode {
  return switcher.getCurrentLanguage();
}

/**
 * Set current language
 */
export function setCurrentLanguage(language: LanguageCode): void {
  switcher.setCurrentLanguage(language);
}

/**
 * Subscribe to language changes
 */
export function onLanguageChange(
  callback: (language: LanguageCode) => void
): () => void {
  return switcher.onLanguageChange(callback);
}

/**
 * Get all available languages
 */
export function getAvailableLanguages(): LanguageInfo[] {
  return switcher.getAvailableLanguages();
}

/**
 * Preload screens in target language
 */
export async function preloadScreens(
  screenIds: string[],
  language: LanguageCode
): Promise<Map<string, ScreenVoiceScripts>> {
  return switcher.preloadScreens(screenIds, language);
}

/**
 * Get language info
 */
export function getLanguageInfo(code: string): LanguageInfo | null {
  return switcher.getLanguageInfo(code);
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

export default switcher;
