/**
 * Simple cache/store utility for HmarePanditJi
 * Provides localStorage-based caching with TTL support
 */

const CACHE_PREFIX = "hpj_cache_";
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const cache = {
  /**
   * Get cached data if it exists and is not expired
   */
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;

    try {
      const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!item) return null;

      const entry = JSON.parse(item) as CacheEntry<T>;
      const now = Date.now();

      // Check if entry has expired
      if (now - entry.timestamp > entry.ttl) {
        cache.delete(key);
        return null;
      }

      return entry.data;
    } catch {
      return null;
    }
  },

  /**
   * Set cache data with optional TTL
   */
  set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    if (typeof window === "undefined") return;

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
    } catch {
      // Silently fail if localStorage is full or unavailable
    }
  },

  /**
   * Delete cached data
   */
  delete(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  },

  /**
   * Clear all cache entries
   */
  clear(): void {
    if (typeof window === "undefined") return;
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  },

  /**
   * Check if cache has valid (non-expired) data for a key
   */
  has(key: string): boolean {
    return cache.get(key) !== null;
  },
};
