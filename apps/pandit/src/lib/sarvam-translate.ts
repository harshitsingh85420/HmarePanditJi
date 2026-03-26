'use client';

/**
 * Sarvam Translate Engine
 * Translation client for Sarvam Mayura API via /api/translate route
 * Features: LRU cache (500 entries), error handling, fallback to Hindi
 */

export interface TranslationRequest {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;
}

export interface TranslationResult {
    translatedText: string;
    confidence: number;
    cached?: boolean;
}

export interface TranslationOptions {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;
    onResult?: (text: string, confidence: number) => void;
    onError?: (error: string) => void;
}

// ─────────────────────────────────────────────────────────────
// LRU CACHE (500 entries max)
// ─────────────────────────────────────────────────────────────

class LRUCache<K, V> {
    private cache: Map<K, V>;
    private maxSize: number;

    constructor(maxSize: number = 500) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    get(key: K): V | undefined {
        if (!this.cache.has(key)) {
            return undefined;
        }
        // Re-insert to move to end (most recently used)
        const value = this.cache.get(key)!;
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }

    set(key: K, value: V): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // Delete least recently used (first item)
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

    size(): number {
        return this.cache.size;
    }

    clear(): void {
        this.cache.clear();
    }

    stats(): { size: number; maxSize: number; utilization: number } {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            utilization: Math.round((this.cache.size / this.maxSize) * 100),
        };
    }
}

// Global translation cache
const translationCache = new LRUCache<string, TranslationResult>(500);

// Performance tracking
let cacheHits = 0;
let cacheMisses = 0;

export function getCacheStats(): {
    hits: number;
    misses: number;
    hitRate: number;
    cache: { size: number; maxSize: number; utilization: number };
} {
    const total = cacheHits + cacheMisses;
    return {
        hits: cacheHits,
        misses: cacheMisses,
        hitRate: total > 0 ? Math.round((cacheHits / total) * 100) : 0,
        cache: translationCache.stats(),
    };
}

export function resetCacheStats(): void {
    cacheHits = 0;
    cacheMisses = 0;
    translationCache.clear();
}

// ─────────────────────────────────────────────────────────────
// TRANSLATION ENGINE
// ─────────────────────────────────────────────────────────────

export class SarvamTranslateEngine {
    private static instance: SarvamTranslateEngine;
    private pendingRequests: Map<string, Promise<TranslationResult>>;

    private constructor() {
        this.pendingRequests = new Map();
    }

    static getInstance(): SarvamTranslateEngine {
        if (!SarvamTranslateEngine.instance) {
            SarvamTranslateEngine.instance = new SarvamTranslateEngine();
        }
        return SarvamTranslateEngine.instance;
    }

    /**
     * Translate text with caching and error handling
     */
    async translate(options: TranslationOptions): Promise<TranslationResult> {
        const { text, sourceLanguage, targetLanguage, onResult, onError } = options;

        // Validate input
        if (!text || text.trim().length === 0) {
            const error = 'Text is required for translation';
            onError?.(error);
            throw new Error(error);
        }

        if (text.length > 5000) {
            const error = 'Text too long (max 5000 characters)';
            onError?.(error);
            throw new Error(error);
        }

        if (!sourceLanguage || !targetLanguage) {
            const error = 'Source and target languages are required';
            onError?.(error);
            throw new Error(error);
        }

        // Check cache first
        const cacheKey = `${sourceLanguage}:${targetLanguage}:${text.trim()}`;
        const cached = translationCache.get(cacheKey);

        if (cached) {
            cacheHits++;
            console.log(`[Translate Engine] Cache HIT (${cacheKey.slice(0, 40)}...)`);
            onResult?.(cached.translatedText, cached.confidence);
            return cached;
        }

        // Check for pending request (deduplicate)
        const pending = this.pendingRequests.get(cacheKey);
        if (pending) {
            console.log(`[Translate Engine] Deduplicating pending request`);
            return pending;
        }

        // Create new translation request
        cacheMisses++;
        console.log(`[Translate Engine] Cache MISS (${cacheKey.slice(0, 40)}...)`);

        const translationPromise = this.performTranslation(
            text,
            sourceLanguage,
            targetLanguage
        ).then((result) => {
            // Cache the result
            translationCache.set(cacheKey, result);
            this.pendingRequests.delete(cacheKey);
            onResult?.(result.translatedText, result.confidence);
            return result;
        });

        this.pendingRequests.set(cacheKey, translationPromise);

        try {
            return await translationPromise;
        } catch (error) {
            this.pendingRequests.delete(cacheKey);
            onError?.(error instanceof Error ? error.message : 'Translation failed');
            throw error;
        }
    }

    /**
     * Perform actual translation via API
     */
    private async performTranslation(
        text: string,
        sourceLanguage: string,
        targetLanguage: string
    ): Promise<TranslationResult> {
        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text.trim(),
                    sourceLanguage,
                    targetLanguage,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Translation failed with status ${response.status}`);
            }

            const data = await response.json();
            return {
                translatedText: data.translatedText,
                confidence: data.confidence ?? 0.92,
                cached: data.cached ?? false,
            };
        } catch (error) {
            console.error('[Translate Engine] API error:', error);
            throw error;
        }
    }

    /**
     * Translate with fallback to Hindi
     */
    async translateWithFallback(
        options: TranslationOptions,
        fallbackLanguage: string = 'hi-IN'
    ): Promise<TranslationResult> {
        try {
            return await this.translate(options);
        } catch (error) {
            console.warn('[Translate Engine] Primary translation failed, attempting fallback:', error);

            // Try fallback to Hindi
            if (options.targetLanguage !== fallbackLanguage) {
                try {
                    return await this.translate({
                        ...options,
                        targetLanguage: fallbackLanguage,
                    });
                } catch (fallbackError) {
                    console.error('[Translate Engine] Fallback translation also failed:', fallbackError);
                }
            }

            // Return original text with low confidence
            return {
                translatedText: options.text,
                confidence: 0.0,
            };
        }
    }

    /**
     * Batch translate multiple texts
     */
    async batchTranslate(
        texts: string[],
        sourceLanguage: string,
        targetLanguage: string,
        concurrencyLimit: number = 5
    ): Promise<TranslationResult[]> {
        const results: TranslationResult[] = [];

        for (let i = 0; i < texts.length; i += concurrencyLimit) {
            const batch = texts.slice(i, i + concurrencyLimit);
            const batchResults = await Promise.allSettled(
                batch.map((text) =>
                    this.translate({
                        text,
                        sourceLanguage,
                        targetLanguage,
                    })
                )
            );

            batchResults.forEach((result) => {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                } else {
                    // Failed translation
                    results.push({
                        translatedText: '',
                        confidence: 0.0,
                    });
                }
            });
        }

        return results;
    }

    /**
     * Clear translation cache
     */
    clearCache(): void {
        resetCacheStats();
        console.log('[Translate Engine] Cache cleared');
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        hits: number;
        misses: number;
        hitRate: number;
        cache: { size: number; maxSize: number; utilization: number };
    } {
        return getCacheStats();
    }
}

// ─────────────────────────────────────────────────────────────
// CONVENIENCE FUNCTIONS
// ─────────────────────────────────────────────────────────────

const engine = SarvamTranslateEngine.getInstance();

/**
 * Translate text with callback-based result handling
 */
export function translate(
    options: TranslationOptions
): Promise<TranslationResult> {
    return engine.translate(options);
}

/**
 * Translate with automatic fallback to Hindi
 */
export function translateWithFallback(
    options: TranslationOptions,
    fallbackLanguage?: string
): Promise<TranslationResult> {
    return engine.translateWithFallback(options, fallbackLanguage);
}

/**
 * Batch translate multiple texts
 */
export function batchTranslate(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string,
    concurrencyLimit?: number
): Promise<TranslationResult[]> {
    return engine.batchTranslate(texts, sourceLanguage, targetLanguage, concurrencyLimit);
}

/**
 * Get cache statistics
 */
export function getTranslateCacheStats(): {
    hits: number;
    misses: number;
    hitRate: number;
    cache: { size: number; maxSize: number; utilization: number };
} {
    return getCacheStats();
}

/**
 * Clear translation cache
 */
export function clearTranslateCache(): void {
    engine.clearCache();
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

export { SarvamTranslateEngine };
export default engine;

/**
 * TranslateEngine instance for acceptance test compatibility
 * Usage: translateEngine.translate({ ... })
 */
export const translateEngine = engine;
