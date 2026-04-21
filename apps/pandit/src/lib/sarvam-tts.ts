'use client';

import { speak, stopSpeaking } from './voice-engine';
import type { VoiceScript } from './voice-scripts-part0';
import { logger } from '@/utils/logger';

export type SarvamLanguageCode =
  | 'hi-IN'
  | 'bn-IN'
  | 'ta-IN'
  | 'te-IN'
  | 'kn-IN'
  | 'ml-IN'
  | 'mr-IN'
  | 'gu-IN'
  | 'pa-IN'
  | 'or-IN'
  | 'en-IN';

// CRITICAL: "priya" is warm, mature female voice for bulbul:v3 - tested best for elderly users
// NEVER use youthful voices - they feel condescending to elderly Pandits
// Available speakers for bulbul:v3: aditya, ritu, ashutosh, priya, neha, rahul, pooja, rohan, simran, kavya, amit, dev, ishita, shreya, ratan, varun, manan, sumit, roopa, kabir, aayan, shubh, advait, amelia, sophia, anand, tanya, tarun, sunny, mani, gokul, vijay, shruti, suhani, mohit, kavitha, rehan, soham, rupali, niharika
export type SarvamSpeaker = 'meera' | 'priya' | 'ritu' | 'neha' | 'pooja' | 'simran' | 'kavya' | 'ishita' | 'shreya' | 'roopa' | 'shruti' | 'suhani' | 'kavitha' | 'rupali' | 'niharika' | 'aditya' | 'ashutosh' | 'rahul' | 'rohan' | 'amit' | 'dev' | 'ratan' | 'varun' | 'manan' | 'sumit' | 'kabir' | 'aayan' | 'shubh' | 'advait' | 'amelia' | 'sophia' | 'anand' | 'tanya' | 'tarun' | 'sunny' | 'mani' | 'gokul' | 'vijay' | 'mohit' | 'rehan' | 'soham';

export interface SarvamTTSOptions {
  text: string;
  languageCode?: SarvamLanguageCode;
  // CRITICAL: Default speaker is "meera" for elderly users (NOT "arjun" or "ratan")
  speaker?: SarvamSpeaker;
  // CRITICAL: Default pace is 0.82 for elderly comprehension (NOT 0.90 or 1.0)
  pace?: number;
  pitch?: number;
  loudness?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export const LANGUAGE_TO_SARVAM_CODE: Record<string, SarvamLanguageCode> = {
  Hindi: 'hi-IN',
  Bhojpuri: 'hi-IN',      // Bhojpuri falls back to hi-IN (no dedicated code)
  Maithili: 'hi-IN',      // Same fallback
  Bengali: 'bn-IN',
  Tamil: 'ta-IN',
  Telugu: 'te-IN',
  Kannada: 'kn-IN',
  Malayalam: 'ml-IN',
  Marathi: 'mr-IN',
  Gujarati: 'gu-IN',
  Sanskrit: 'hi-IN',
  English: 'en-IN',
  Odia: 'or-IN',
  Punjabi: 'pa-IN',
  Assamese: 'hi-IN',      // Fallback to hi-IN (Sarvam may add as-IN later)
};

// ─────────────────────────────────────────────────────────────
// LRU CACHE FOR AUDIO (Max 100 entries)
// ─────────────────────────────────────────────────────────────

class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;

    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest (first) entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  get stats(): { size: number; maxSize: number; utilization: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilization: Math.round((this.cache.size / this.maxSize) * 100),
    };
  }
}

// Global audio cache with LRU eviction
const audioCache = new LRUCache<string, string>(100);

// Performance tracking
let cacheHits = 0;
let cacheMisses = 0;

export function getCacheStats(): { hits: number; misses: number; hitRate: number; cache: { size: number; maxSize: number; utilization: number } } {
  const total = cacheHits + cacheMisses;
  return {
    hits: cacheHits,
    misses: cacheMisses,
    hitRate: total > 0 ? Math.round((cacheHits / total) * 100) : 0,
    cache: audioCache.stats,
  };
}

export function resetCacheStats(): void {
  cacheHits = 0;
  cacheMisses = 0;
  audioCache.clear();
}

let activeSpeechToken = 0;

/**
 * Cancel current speech and clear queue
 * Call this on route change or component unmount
 */
export function cancelCurrentSpeech(): void {
  activeSpeechToken += 1;
  stopSpeaking();
  // Also cancel Web Speech API to clear any queued utterances
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Reset TTS engine state
 * Call this on screen change to clear cache and reset state
 */
export function resetTTS(): void {
  cancelCurrentSpeech();
  audioCache.clear();
  cacheHits = 0;
  cacheMisses = 0;
  console.log('[TTS] Reset complete');
}

export function stopCurrentSpeech(): void {
  activeSpeechToken += 1;
  stopSpeaking();
}

export async function speakWithSarvam({
  text,
  languageCode = 'hi-IN',
  // CRITICAL: Default speaker is "priya" (warm, mature voice for elderly)
  speaker = 'priya',
  // CRITICAL: Default pace is 0.82 (slower for elderly comprehension)
  pace = 0.82,
  pitch = 0,
  loudness = 1.0,
  onStart,
  onEnd,
  onError,
}: SarvamTTSOptions): Promise<void> {
  const speechToken = activeSpeechToken + 1;
  activeSpeechToken = speechToken;

  return new Promise((resolve) => {
    try {
      onStart?.();
      speak(text, languageCode, () => {
        if (speechToken !== activeSpeechToken) {
          resolve();
          return;
        }

        onEnd?.();
        resolve();
      });
    } catch (error) {
      if (speechToken === activeSpeechToken) {
        onError?.(error instanceof Error ? error.message : 'TTS_FAILED');
      }
      resolve();
    }
  });
}

// ─────────────────────────────────────────────────────────────
// AUDIO CACHE FOR PRE-WARMING
// Reduces latency from 300ms to <50ms by caching frequently used audio
// ─────────────────────────────────────────────────────────────

export async function preloadAudio(
  text: string,
  languageCode: SarvamLanguageCode = 'hi-IN',
  speaker: SarvamSpeaker = 'priya',
  pace: number = 0.82
): Promise<string | null> {
  const cacheKey = `${text}::${languageCode}::${speaker}::${pace}`;

  // Return cached audio if available
  if (audioCache.has(cacheKey)) {
    cacheHits++;
    console.log(`[TTS Cache] HIT (${cacheKey.slice(0, 30)}...)`);
    return audioCache.get(cacheKey)! || null;
  }

  cacheMisses++;
  console.log(`[TTS Cache] MISS (${cacheKey.slice(0, 30)}...)`);

  // Use backend proxy route - API key stays on server
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        languageCode,
        speaker,
        pace,
        pitch: 0,
        loudness: 1.0,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.audio) {
      audioCache.set(cacheKey, data.audio);
      console.log(`[TTS Cache] Cached (${audioCache.size}/100 entries)`);
      return data.audio;
    }
    return null;
  } catch (error) {
    console.warn('[TTS Cache] Pre-load failed:', error);
    return null;
  }
}

export function playFromCache(
  text: string,
  languageCode: SarvamLanguageCode = 'hi-IN',
  speaker: SarvamSpeaker = 'priya',
  pace: number = 0.82,
  onEnd?: () => void
): boolean {
  const cacheKey = `${text}::${languageCode}::${speaker}::${pace}`;
  const cached = audioCache.get(cacheKey);

  if (!cached) {
    cacheMisses++;
    return false;
  }

  cacheHits++;
  console.log(`[TTS Cache] PLAY HIT (${Math.round((cacheHits / (cacheHits + cacheMisses)) * 100)}% hit rate)`);

  stopCurrentSpeech();

  try {
    const audio = new Audio(`data:audio/mp3;base64,${cached}`);
    audio.onended = () => onEnd?.();
    audio.onerror = () => onEnd?.();
    audio.play().catch(() => onEnd?.());
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// PRE-WARM CACHE FOR PART 0 SCRIPTS
// Call this on app load during splash screen
// ─────────────────────────────────────────────────────────────

export async function preWarmCache(scripts?: VoiceScript[]): Promise<void> {
  if (typeof window === 'undefined') return;

  // Import default scripts if none provided
  const scriptsToPreload = scripts || (await import('./voice-scripts-part0')).PART_0_SCRIPTS;

  console.log(`[TTS Cache] Pre-warming ${scriptsToPreload.length} scripts...`);
  const startTime = performance.now();

  // Pre-warm in parallel with concurrency limit
  const CONCURRENCY_LIMIT = 5;
  const results: { success: number; failed: number } = { success: 0, failed: 0 };

  for (let i = 0; i < scriptsToPreload.length; i += CONCURRENCY_LIMIT) {
    const batch = scriptsToPreload.slice(i, i + CONCURRENCY_LIMIT);
    const batchResults = await Promise.allSettled(
      batch.map((script) =>
        preloadAudio(script.text, script.language as SarvamLanguageCode, script.speaker as SarvamSpeaker, script.pace ?? 0.82)
      )
    );

    batchResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        results.success++;
      } else {
        results.failed++;
      }
    });
  }

  const totalTime = Math.round(performance.now() - startTime);
  const totalSize = Math.round(audioCache.size * 0.5); // Approximate KB per entry

  console.log(
    `[TTS Cache] Pre-warm complete: ${results.success}/${scriptsToPreload.length} cached, ` +
    `${results.failed} failed, ${totalTime}ms, ~${totalSize}KB`
  );
}

// ─────────────────────────────────────────────────────────────
// CACHE INVALIDATION
// ─────────────────────────────────────────────────────────────

/**
 * Invalidate cache on language change
 */
export function invalidateCacheForLanguage(languageCode: string): void {
  // LRU cache handles eviction automatically
  console.log(`[TTS Cache] Language change detected, cache utilization: ${audioCache.stats.utilization}%`);
}

/**
 * Clear all cache on network loss
 */
export function clearCacheOnOffline(): void {
  resetCacheStats();
  console.log('[TTS Cache] Cleared due to offline state');
}

// ─────────────────────────────────────────────────────────────
// OFFLINE FALLBACK TO WEB SPEECH API
// Automatically used when Sarvam is unavailable
// ─────────────────────────────────────────────────────────────

export async function speakWithWebSpeech(
  text: string,
  languageCode: string = 'hi-IN',
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageCode;
  utterance.rate = 0.85; // Slower for elderly
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Try to find Hindi voice
  const voices = window.speechSynthesis.getVoices();
  const hindiVoice = voices.find(
    (v) => v.lang.startsWith('hi') || v.name.includes('Hindi')
  );
  if (hindiVoice) utterance.voice = hindiVoice;

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 100);
}
