import Redis from "ioredis";
import { env } from "../config/env";

let redisClient: Redis | null = null;
let useFallbackStore = false;

// Fallback in-memory stores (in case Redis is down or not configured locally)
const fallbackOtpStore = new Map<string, { hash: string; expiresAt: number }>();
const fallbackRateLimitStore = new Map<string, { count: number; expiresAt: number }>();

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
