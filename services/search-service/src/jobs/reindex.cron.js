/**
 * HmarePanditJi — Nightly Re-index Cron Job
 *
 * Runs daily at 2:00 AM IST (UTC+5:30 = 20:30 UTC) to sync
 * all verified pandits from PostgreSQL → Elasticsearch.
 *
 * Catches profile edits, rating updates, new reviews, etc.
 * that may have slipped through real-time indexing.
 */

const cron = require('node-cron');
const { reindexAllPandits } = require('../elasticsearch/pandit.indexer');

/**
 * Start the nightly re-index cron job.
 * Schedule: '30 20 * * *' = 8:30 PM UTC = 2:00 AM IST (UTC+5:30)
 */
function startReindexCron() {
    cron.schedule('30 20 * * *', async () => {
        const startTime = Date.now();
        console.log('[CRON] Starting nightly pandit re-index...');

        try {
            const result = await reindexAllPandits();
            const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

            console.log(
                `[CRON] Re-index complete in ${durationSec}s. ` +
                `Success: ${result.success}, Failed: ${result.failed}, Total: ${result.total}`
            );
        } catch (err) {
            console.error('[CRON] Re-index failed:', err.message);
        }
    });

    console.log('[CRON] Nightly re-index scheduled (2:00 AM IST / 20:30 UTC)');
}

module.exports = { startReindexCron };
