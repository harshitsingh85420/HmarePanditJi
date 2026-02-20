/**
 * HmarePanditJi — Muhurat Explorer API Routes
 *
 * GET   /api/v1/muhurat/monthly          — Calendar data (guestAllowed)
 * GET   /api/v1/muhurat/date/:date       — Date detail (guestAllowed)
 * POST  /api/v1/muhurat/suggest-dates    — Date suggestions (guestAllowed)
 *
 * Master Rule #6: Guests can browse muhurat calendar.
 */

const { Router } = require('express');
const { z } = require('zod');
const { guestAllowed } = require('../middleware/auth');
const {
    generateMonthlyCalendar,
    getDateDetails,
    suggestDates,
    PUJA_MUHURAT_RULES,
} = require('../muhurat/calculator');
const { getCachedMuhurat, cacheMuhurat } = require('../muhurat/cache');

const router = Router();

// ─── Validation schemas ─────────────────────────────────────────────────────

const suggestDatesSchema = z.object({
    pujaType: z.string().min(1).max(50),
    customerCity: z.string().max(100).optional(),
    dateRange: z.object({
        from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'from must be YYYY-MM-DD'),
        to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'to must be YYYY-MM-DD'),
    }),
    preferredTimeOfDay: z.enum(['morning', 'afternoon', 'evening', 'any']).optional().default('any'),
    maxSuggestions: z.number().int().min(1).max(20).optional().default(5),
});

// ─── GET /api/v1/muhurat/monthly ────────────────────────────────────────────

router.get('/monthly', guestAllowed, async (req, res) => {
    try {
        const year = parseInt(req.query.year, 10);
        const month = parseInt(req.query.month, 10);

        // Validate
        if (!year || !month || year < 2020 || year > 2100 || month < 1 || month > 12) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'Valid year (2020-2100) and month (1-12) query params required',
            });
        }

        // ─── Check cache ──────────────────────────────────────────────
        const cacheKey = `muhurat:monthly:${year}:${month}`;
        const cached = await getCachedMuhurat(cacheKey);

        if (cached) {
            return res.json({
                success: true,
                data: cached,
                cached: true,
            });
        }

        // ─── Compute ──────────────────────────────────────────────────
        const calendarData = generateMonthlyCalendar(year, month);

        const responseData = {
            year,
            month,
            calendarData,
        };

        // ─── Cache (async, best-effort) ───────────────────────────────
        const firstDate = `${year}-${String(month).padStart(2, '0')}-01`;
        await cacheMuhurat(cacheKey, responseData, firstDate, null);

        return res.json({
            success: true,
            data: responseData,
            cached: false,
        });
    } catch (err) {
        console.error('[Muhurat/Monthly] Error:', err.message);
        return res.status(500).json({
            success: false,
            error: 'MUHURAT_ERROR',
            message: 'Failed to generate monthly muhurat data',
        });
    }
});

// ─── GET /api/v1/muhurat/date/:date ─────────────────────────────────────────

router.get('/date/:date', guestAllowed, async (req, res) => {
    try {
        const dateStr = req.params.date;
        const pujaType = req.query.pujaType || null;

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'Date must be in YYYY-MM-DD format',
            });
        }

        // Validate date is real
        const parsed = new Date(dateStr + 'T00:00:00Z');
        if (isNaN(parsed.getTime())) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'Invalid date',
            });
        }

        // Validate pujaType if provided
        if (pujaType && !PUJA_MUHURAT_RULES[pujaType]) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: `Unknown puja type: ${pujaType}. Supported: ${Object.keys(PUJA_MUHURAT_RULES).join(', ')}`,
            });
        }

        // ─── Check cache (only for full-date without pujaType filter) ─
        const cacheKey = pujaType ? `muhurat:date:${dateStr}:${pujaType}` : `muhurat:date:${dateStr}`;
        const cached = await getCachedMuhurat(cacheKey);

        if (cached) {
            return res.json({
                success: true,
                data: cached,
                cached: true,
            });
        }

        // ─── Compute ──────────────────────────────────────────────────
        const details = getDateDetails(dateStr, pujaType);

        // ─── Cache ────────────────────────────────────────────────────
        await cacheMuhurat(cacheKey, details, dateStr, pujaType);

        return res.json({
            success: true,
            data: details,
            cached: false,
        });
    } catch (err) {
        console.error('[Muhurat/Date] Error:', err.message);
        return res.status(500).json({
            success: false,
            error: 'MUHURAT_ERROR',
            message: 'Failed to get muhurat details for date',
        });
    }
});

// ─── POST /api/v1/muhurat/suggest-dates ─────────────────────────────────────

router.post('/suggest-dates', guestAllowed, async (req, res) => {
    try {
        const parsed = suggestDatesSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'Invalid request body',
                details: parsed.error.flatten().fieldErrors,
            });
        }

        const { pujaType, dateRange, preferredTimeOfDay, maxSuggestions } = parsed.data;

        // Validate pujaType
        if (!PUJA_MUHURAT_RULES[pujaType]) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: `Unknown puja type: ${pujaType}. Supported: ${Object.keys(PUJA_MUHURAT_RULES).join(', ')}`,
            });
        }

        // Validate date range
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        if (fromDate > toDate) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'dateRange.from must be before dateRange.to',
            });
        }

        // Max 365 days range
        const daysDiff = (toDate - fromDate) / (1000 * 60 * 60 * 24);
        if (daysDiff > 365) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'Date range cannot exceed 365 days',
            });
        }

        // ─── Compute suggestions ──────────────────────────────────────
        const suggestions = suggestDates({
            pujaType,
            from: dateRange.from,
            to: dateRange.to,
            preferredTimeOfDay,
            maxSuggestions,
        });

        return res.json({
            success: true,
            data: {
                pujaType,
                dateRange,
                preferredTimeOfDay,
                suggestions,
            },
        });
    } catch (err) {
        console.error('[Muhurat/Suggest] Error:', err.message);
        return res.status(500).json({
            success: false,
            error: 'MUHURAT_ERROR',
            message: 'Failed to suggest dates',
        });
    }
});

module.exports = router;
