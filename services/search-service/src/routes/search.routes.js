/**
 * HmarePanditJi — Search API Routes
 *
 * PORT 3005 — Pandit search endpoints
 *
 * POST   /api/v1/search/pandits           — Full filtered search (guestAllowed)
 * GET    /api/v1/search/pandits/autocomplete — Name autocomplete (guestAllowed)
 * GET    /api/v1/search/pandits/nearby     — Nearby pandits carousel (guestAllowed)
 * GET    /api/v1/search/pandits/:panditId/sync — Force re-index (admin only)
 *
 * Master Rule #5: JWT validated on all except public.
 * Master Rule #6: Guests can search/browse but cannot book.
 */

const { Router } = require('express');
const { z } = require('zod');
const { guestAllowed, authenticate, authorize } = require('../middleware/auth');
const {
    searchPandits,
    autocompletePandits,
    nearbyPandits,
} = require('../services/search.service');
const { indexSinglePandit, reindexAllPandits } = require('../elasticsearch/pandit.indexer');
const config = require('../config');

const router = Router();

// ─── Validation schemas (Zod) ─────────────────────────────────────────────────

const searchSchema = z.object({
    query: z.string().max(200).optional(),
    pujaType: z.string().max(100).optional(),
    eventDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'eventDate must be YYYY-MM-DD')
        .optional(),
    customerLocation: z
        .object({
            lat: z.number().min(-90).max(90),
            lng: z.number().min(-180).max(180),
            city: z.string().max(100).optional(),
        })
        .optional(),
    searchAllIndia: z.boolean().optional().default(false),
    maxDistanceKm: z.number().int().min(1).max(5000).optional(),
    minDakshinaRupees: z.number().int().min(0).optional(),
    maxDakshinaRupees: z.number().int().min(0).optional(),
    travelModePreference: z
        .enum(['self_drive', 'cab', 'train', 'flight', 'bus', 'any'])
        .optional(),
    languages: z.array(z.string().max(10)).max(10).optional(),
    minRating: z.number().min(0).max(5).optional(),
    minExperienceYears: z.number().int().min(0).optional(),
    sortBy: z
        .enum(['relevance', 'rating', 'price_low', 'price_high', 'distance', 'experience'])
        .optional()
        .default('relevance'),
    page: z.number().int().min(1).optional().default(1),
    limit: z
        .number()
        .int()
        .min(1)
        .max(config.search.maxLimit)
        .optional()
        .default(config.search.defaultLimit),
});

// ─── POST /api/v1/search/pandits ──────────────────────────────────────────────

router.post('/pandits', guestAllowed, async (req, res) => {
    try {
        const parsed = searchSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'Invalid search parameters',
                details: parsed.error.flatten().fieldErrors,
            });
        }

        const result = await searchPandits(parsed.data);

        return res.json({
            success: true,
            data: result,
        });
    } catch (err) {
        console.error('[Search] Error:', err.message);
        return res.status(500).json({
            success: false,
            error: 'SEARCH_FAILED',
            message: 'Search service encountered an error',
        });
    }
});

// ─── GET /api/v1/search/pandits/autocomplete ──────────────────────────────────

router.get('/pandits/autocomplete', guestAllowed, async (req, res) => {
    try {
        const q = req.query.q;
        const limit = Math.min(
            parseInt(req.query.limit || '5', 10),
            config.search.autocompleteLimit
        );

        if (!q || typeof q !== 'string' || q.trim().length < 1) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'Query parameter "q" is required',
            });
        }

        const suggestions = await autocompletePandits(q.trim(), limit);

        return res.json({
            success: true,
            data: { suggestions },
        });
    } catch (err) {
        console.error('[Autocomplete] Error:', err.message);
        return res.status(500).json({
            success: false,
            error: 'AUTOCOMPLETE_FAILED',
            message: 'Autocomplete service encountered an error',
        });
    }
});

// ─── GET /api/v1/search/pandits/nearby ────────────────────────────────────────

router.get('/pandits/nearby', guestAllowed, async (req, res) => {
    try {
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        const pujaType = req.query.pujaType || undefined;
        const limit = Math.min(
            parseInt(req.query.limit || '10', 10),
            config.search.nearbyLimit
        );

        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'lat and lng query parameters are required',
            });
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'Invalid latitude or longitude values',
            });
        }

        const pandits = await nearbyPandits({ lat, lng, pujaType, limit });

        return res.json({
            success: true,
            data: { pandits },
        });
    } catch (err) {
        console.error('[Nearby] Error:', err.message);
        return res.status(500).json({
            success: false,
            error: 'NEARBY_FAILED',
            message: 'Nearby search encountered an error',
        });
    }
});

// ─── GET /api/v1/search/pandits/:panditId/sync ───────────────────────────────

router.get(
    '/pandits/:panditId/sync',
    authenticate,
    authorize('admin'),
    async (req, res) => {
        try {
            await indexSinglePandit(req.params.panditId);

            return res.json({
                success: true,
                message: `Pandit ${req.params.panditId} re-indexed`,
            });
        } catch (err) {
            console.error('[Sync] Error:', err.message);
            return res.status(500).json({
                success: false,
                error: 'SYNC_FAILED',
                message: 'Failed to re-index pandit',
            });
        }
    }
);

// ─── POST /api/v1/search/reindex ──────────────────────────────────────────────

router.post(
    '/reindex',
    authenticate,
    authorize('admin'),
    async (req, res) => {
        try {
            const result = await reindexAllPandits();

            return res.json({
                success: true,
                data: result,
                message: `Re-index complete. ${result.success}/${result.total} succeeded.`,
            });
        } catch (err) {
            console.error('[Reindex] Error:', err.message);
            return res.status(500).json({
                success: false,
                error: 'REINDEX_FAILED',
                message: 'Full re-index failed',
            });
        }
    }
);

module.exports = router;
