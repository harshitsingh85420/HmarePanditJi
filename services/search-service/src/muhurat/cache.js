/**
 * HmarePanditJi — Muhurat Cache Layer
 *
 * Two-tier caching:
 *   1. Redis (fast, volatile, 24h TTL) — primary cache
 *   2. PostgreSQL muhurat_cache table (persistent, admin-reviewable)
 *
 * Cache keys:
 *   "muhurat:monthly:{year}:{month}"   — monthly calendar data
 *   "muhurat:date:{date}"              — date detail data
 *
 * All secrets from .env (Master Rule #1).
 */

const config = require('../config');
const db = require('../db');

// ─── Redis client (lazy init) ───────────────────────────────────────────────

let _redisClient = null;
let _redisAvailable = false;

/**
 * Get or create Redis client. Returns null if Redis is unavailable.
 */
function getRedis() {
    if (_redisClient) return _redisAvailable ? _redisClient : null;

    try {
        const Redis = require('ioredis');
        _redisClient = new Redis(config.redis.url, {
            maxRetriesPerRequest: 1,
            retryStrategy: (times) => {
                if (times > 3) return null; // stop retrying
                return Math.min(times * 200, 1000);
            },
            lazyConnect: true,
            enableOfflineQueue: false,
        });

        _redisClient.on('connect', () => {
            _redisAvailable = true;
            console.log('[Redis] Connected for muhurat cache');
        });

        _redisClient.on('error', (err) => {
            _redisAvailable = false;
            // Swallow connection errors gracefully — muhurat works without caching
            if (!err.message.includes('ECONNREFUSED')) {
                console.warn('[Redis] Error:', err.message);
            }
        });

        _redisClient.connect().catch(() => {
            _redisAvailable = false;
        });

        return _redisAvailable ? _redisClient : null;
    } catch {
        _redisAvailable = false;
        return null;
    }
}

const CACHE_TTL_SECONDS = 86400; // 24 hours

// ─── Redis cache operations ─────────────────────────────────────────────────

/**
 * Get a value from Redis cache.
 * @param {string} key
 * @returns {object|null} parsed JSON or null
 */
async function getFromRedis(key) {
    const redis = getRedis();
    if (!redis) return null;

    try {
        const raw = await redis.get(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * Set a value in Redis cache with 24h TTL.
 * @param {string} key
 * @param {object} value
 */
async function setInRedis(key, value) {
    const redis = getRedis();
    if (!redis) return;

    try {
        await redis.set(key, JSON.stringify(value), 'EX', CACHE_TTL_SECONDS);
    } catch {
        // Swallow — caching is best-effort
    }
}

// ─── PostgreSQL muhurat_cache operations ────────────────────────────────────

/**
 * Store muhurat result in the muhurat_cache table for admin review.
 *
 * @param {object} params
 * @param {string} params.cacheKey — unique key
 * @param {string|null} params.pujaType
 * @param {string} params.date — YYYY-MM-DD
 * @param {object} params.muhurats — the computed data
 */
async function storeInDb({ cacheKey, pujaType, date, muhurats }) {
    try {
        await db.query(
            `INSERT INTO muhurat_cache (cache_key, puja_type, date, muhurats, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '24 hours')
       ON CONFLICT (cache_key) DO UPDATE
       SET muhurats = $4,
           cached_at = NOW(),
           expires_at = NOW() + INTERVAL '24 hours'`,
            [cacheKey, pujaType || null, date, JSON.stringify(muhurats)]
        );
    } catch (err) {
        // Best-effort DB caching — log but don't crash
        console.warn('[MuhuratCache] DB store failed:', err.message);
    }
}

// ─── Combined cache helpers ─────────────────────────────────────────────────

/**
 * Get cached muhurat data — tries Redis first, falls back to null.
 * @param {string} key
 */
async function getCachedMuhurat(key) {
    return getFromRedis(key);
}

/**
 * Cache muhurat data in both Redis and PostgreSQL.
 * @param {string} key
 * @param {object} data
 * @param {string} date — for DB storage
 * @param {string|null} pujaType — for DB storage
 */
async function cacheMuhurat(key, data, date, pujaType) {
    // Fire both in parallel, don't await DB write
    await setInRedis(key, data);
    storeInDb({ cacheKey: key, pujaType, date, muhurats: data }).catch(() => { });
}

/**
 * Disconnect Redis client cleanly. Called on process shutdown.
 */
async function disconnectRedis() {
    if (_redisClient) {
        try {
            await _redisClient.quit();
        } catch {
            // ignore
        }
        _redisClient = null;
        _redisAvailable = false;
    }
}

module.exports = {
    getCachedMuhurat,
    cacheMuhurat,
    getFromRedis,
    setInRedis,
    storeInDb,
    disconnectRedis,
    CACHE_TTL_SECONDS,
};
