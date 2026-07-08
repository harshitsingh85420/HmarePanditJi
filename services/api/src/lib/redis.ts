import Redis from "ioredis";
import { env } from "../config/env";

let redisClient: Redis | null = null;
let useFallbackStore = false;

// Fallback in-memory stores (in case Redis is down or not configured locally)
const fallbackOtpStore = new Map<string, { hash: string; expiresAt: number }>();
const fallbackRateLimitStore = new Map<string, { count: number; expiresAt: number }>();
const fallbackCacheStore = new Map<string, { value: string; expiresAt: number }>();
const FALLBACK_CACHE_MAX = 5000;

export async function getRedis(): Promise<Redis | null> {
  if (useFallbackStore) return null;
  if (redisClient) return redisClient;

  try {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 1) {
          useFallbackStore = true;
          return null;
        }
        return 100;
      },
    });

    redisClient.on("error", (err) => {
      console.warn("Redis connection error, falling back to memory:", err.message);
      useFallbackStore = true;
    });

    return redisClient;
  } catch (error: any) {
    console.warn("Failed to initialize Redis, falling back to memory:", error.message);
    useFallbackStore = true;
    return null;
  }
}

export async function storeOtpHash(phone: string, hash: string, ttlSeconds: number): Promise<void> {
  const redis = await getRedis();
  if (redis && !useFallbackStore) {
    try {
      await redis.set(`otp:${phone}`, hash, "EX", ttlSeconds);
      return;
    } catch (err) {
      console.warn("Redis set failed, falling back to memory:", err);
      useFallbackStore = true;
    }
  }
  fallbackOtpStore.set(phone, { hash, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export async function getOtpHash(phone: string): Promise<string | null> {
  const redis = await getRedis();
  if (redis && !useFallbackStore) {
    try {
      return await redis.get(`otp:${phone}`);
    } catch (err) {
      console.warn("Redis get failed, falling back to memory:", err);
      useFallbackStore = true;
    }
  }
  const record = fallbackOtpStore.get(phone);
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    fallbackOtpStore.delete(phone);
    return null;
  }
  return record.hash;
}

export async function deleteOtpHash(phone: string): Promise<void> {
  const redis = await getRedis();
  if (redis && !useFallbackStore) {
    try {
      await redis.del(`otp:${phone}`);
      return;
    } catch (err) {
      console.warn("Redis del failed, falling back to memory:", err);
      useFallbackStore = true;
    }
  }
  fallbackOtpStore.delete(phone);
}

// ── Generic string cache (Redis with in-memory fallback) ────────────────────

export async function cacheGet(key: string): Promise<string | null> {
  const redis = await getRedis();
  if (redis && !useFallbackStore) {
    try {
      return await redis.get(key);
    } catch (err) {
      console.warn("Redis cache get failed, falling back to memory:", err);
      useFallbackStore = true;
    }
  }
  const record = fallbackCacheStore.get(key);
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    fallbackCacheStore.delete(key);
    return null;
  }
  return record.value;
}

/** Batched lookup — one MGET round-trip on Redis; positional nulls on miss. */
export async function cacheGetMany(keys: string[]): Promise<Array<string | null>> {
  if (keys.length === 0) return [];
  const redis = await getRedis();
  if (redis && !useFallbackStore) {
    try {
      return await redis.mget(...keys);
    } catch (err) {
      console.warn("Redis cache mget failed, falling back to memory:", err);
      useFallbackStore = true;
    }
  }
  return keys.map((key) => {
    const record = fallbackCacheStore.get(key);
    if (!record || Date.now() > record.expiresAt) return null;
    return record.value;
  });
}

export async function cacheSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  const redis = await getRedis();
  if (redis && !useFallbackStore) {
    try {
      await redis.set(key, value, "EX", ttlSeconds);
      return;
    } catch (err) {
      console.warn("Redis cache set failed, falling back to memory:", err);
      useFallbackStore = true;
    }
  }
  if (fallbackCacheStore.size >= FALLBACK_CACHE_MAX) {
    const firstKey = fallbackCacheStore.keys().next().value;
    if (firstKey !== undefined) fallbackCacheStore.delete(firstKey);
  }
  fallbackCacheStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

/** Fixed-window rate limit on an arbitrary bucket:id key (rl:<bucket>:<id>). */
export async function checkKeyedRateLimit(
  bucket: string,
  id: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const key = `rl:${bucket}:${id}`;
  const redis = await getRedis();
  if (redis && !useFallbackStore) {
    try {
      const current = await redis.get(key);
      const count = current ? parseInt(current, 10) : 0;
      if (count >= limit) return false;
      const multi = redis.multi();
      multi.incr(key);
      if (count === 0) multi.expire(key, windowSeconds);
      await multi.exec();
      return true;
    } catch (err) {
      console.warn("Redis keyed rate limit failed, falling back to memory:", err);
      useFallbackStore = true;
    }
  }
  const now = Date.now();
  const record = fallbackRateLimitStore.get(key);
  if (!record || now > record.expiresAt) {
    fallbackRateLimitStore.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
    return true;
  }
  if (record.count >= limit) return false;
  record.count++;
  return true;
}

export async function checkRateLimit(phone: string, limit: number, windowSeconds: number): Promise<boolean> {
  const key = `otp:sends:${phone}`;
  const redis = await getRedis();
  if (redis && !useFallbackStore) {
    try {
      const current = await redis.get(key);
      const count = current ? parseInt(current, 10) : 0;
      if (count >= limit) {
        return false;
      }
      
      const multi = redis.multi();
      multi.incr(key);
      if (count === 0) {
        multi.expire(key, windowSeconds);
      }
      await multi.exec();
      return true;
    } catch (err) {
      console.warn("Redis rate limit failed, falling back to memory:", err);
      useFallbackStore = true;
    }
  }

  // Fallback rate limiting
  const now = Date.now();
  const record = fallbackRateLimitStore.get(phone);
  if (!record || now > record.expiresAt) {
    fallbackRateLimitStore.set(phone, { count: 1, expiresAt: now + windowSeconds * 1000 });
    return true;
  }
  if (record.count >= limit) {
    return false;
  }
  record.count++;
  return true;
}
