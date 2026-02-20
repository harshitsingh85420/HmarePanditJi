/**
 * HmarePanditJi — Search Service (Port 3005)
 *
 * Elasticsearch-powered pandit search + Muhurat Explorer microservice.
 *
 * Search Endpoints:
 *   POST /api/v1/search/pandits             — Full filtered search
 *   GET  /api/v1/search/pandits/autocomplete — Name autocomplete
 *   GET  /api/v1/search/pandits/nearby       — Nearby pandits
 *   GET  /api/v1/search/pandits/:id/sync     — Admin: force re-index
 *   POST /api/v1/search/reindex              — Admin: full re-index
 *
 * Muhurat Endpoints:
 *   GET  /api/v1/muhurat/monthly             — Monthly calendar data
 *   GET  /api/v1/muhurat/date/:date          — Date detail
 *   POST /api/v1/muhurat/suggest-dates       — Suggest auspicious dates
 *
 *   GET  /health                             — Health check
 *
 * Depends on: Elasticsearch (9200), PostgreSQL (5432), Redis (6379)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const { ping } = require('./elasticsearch/client');
const { ensureIndices } = require('./elasticsearch/setup');
const { startReindexCron } = require('./jobs/reindex.cron');
const searchRoutes = require('./routes/search.routes');
const muhuratRoutes = require('./routes/muhurat.routes');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('short'));

// ─── Health endpoint ──────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
    try {
        const health = await ping();
        res.json({
            success: true,
            service: 'search-service',
            elasticsearch: health.status,
            uptime: process.uptime(),
        });
    } catch (err) {
        res.status(503).json({
            success: false,
            service: 'search-service',
            elasticsearch: 'unavailable',
            error: err.message,
        });
    }
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/muhurat', muhuratRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: `Route ${req.method} ${req.path} not found`,
    });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
    console.error('[Server] Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message:
            config.nodeEnv === 'development'
                ? err.message
                : 'An unexpected error occurred',
    });
});

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function startServer() {
    try {
        // 1. Check Elasticsearch connectivity
        console.log('[Boot] Checking Elasticsearch connection...');
        await ping();

        // 2. Ensure indices exist
        console.log('[Boot] Ensuring Elasticsearch indices...');
        await ensureIndices();

        // 3. Start cron jobs
        startReindexCron();

        // 4. Start HTTP server
        app.listen(config.port, () => {
            console.log(`\n🔍 Search Service running on port ${config.port}`);
            console.log(`   Health:  http://localhost:${config.port}/health`);
            console.log(`   Search:  POST http://localhost:${config.port}/api/v1/search/pandits`);
            console.log(`   Muhurat: GET  http://localhost:${config.port}/api/v1/muhurat/monthly?year=2024&month=6`);
            console.log(`   Env: ${config.nodeEnv}\n`);
        });
    } catch (err) {
        console.error('[Boot] Failed to start search service:', err.message);
        console.error('       Make sure Elasticsearch is running on', config.elasticsearch.node);
        process.exit(1);
    }
}

// Start unless in test mode (supertest manages the server)
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = { app, startServer };
