const Redis = require("ioredis");

// ── Configuration ──────────────────────────────────────────────────────────────

const CACHE_TTL_SECONDS = 86400; // 24 hours
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// ── Lazy Redis Connection ──────────────────────────────────────────────────────

let redisClient = null;

async function getRedis() {
    if (redisClient) return redisClient;

    try {
        redisClient = new Redis(REDIS_URL, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                if (times > 3) return null; // Stop retrying after 3 attempts
                return Math.min(times * 100, 3000);
            },
        });

        redisClient.on("error", (err) => {
            console.error("Redis connection error:", err.message);
        });

        return redisClient;
    } catch (error) {
        console.error("Failed to initialize Redis:", error.message);
        return null;
    }
}

// ── Cache Operations ───────────────────────────────────────────────────────────

/**
 * Get cached muhurat data from Redis
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached data or null
 */
async function getCachedMuhurat(key) {
    try {
        const redis = await getRedis();
        if (!redis) return null;

        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Redis GET failed:", error.message);
        return null;
    }
}

/**
 * Cache muhurat data in Redis (MIGRATION 6: Removed PostgreSQL persistence)
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {string} date - Date string
 * @param {string} pujaType - Puja type
 */
async function cacheMuhurat(key, data, date, pujaType) {
    try {
        const redis = await getRedis();
        if (!redis) return;

        const payload = {
            data,
            date,
            pujaType,
            cachedAt: Date.now(),
        };

        await redis.set(key, JSON.stringify(payload), "EX", CACHE_TTL_SECONDS);
    } catch (error) {
        console.error("Redis SET failed:", error.message);
    }
}

// ── Raw Redis Operations ───────────────────────────────────────────────────────

async function getFromRedis(key) {
    try {
        const redis = await getRedis();
        if (!redis) return null;
        return await redis.get(key);
    } catch (error) {
        console.error("Redis GET failed:", error.message);
        return null;
    }
}

async function setInRedis(key, value) {
    try {
        const redis = await getRedis();
        if (!redis) return;
        await redis.set(key, value);
    } catch (error) {
        console.error("Redis SET failed:", error.message);
    }
}

// ── Cleanup ────────────────────────────────────────────────────────────────────

async function disconnectRedis() {
    if (redisClient) {
        await redisClient.disconnect();
        redisClient = null;
    }
}

// ── Exports ────────────────────────────────────────────────────────────────────

module.exports = {
    getCachedMuhurat,
    cacheMuhurat,
    getFromRedis,
    setInRedis,
    disconnectRedis,
};
