/**
 * HmarePanditJi — Elasticsearch Index Setup
 *
 * Called on service startup. Creates the pandits index if it doesn't exist.
 * Idempotent — safe to run on every boot.
 */

const { getClient } = require('./client');
const { PANDITS_INDEX, PANDITS_MAPPING } = require('./indices/pandits.mapping');

/**
 * Ensure the pandits index exists with correct mapping.
 * If the index already exists, this is a no-op.
 */
async function ensureIndices() {
    const client = getClient();

    const exists = await client.indices.exists({ index: PANDITS_INDEX });

    if (!exists) {
        console.log(`[ES] Creating index: ${PANDITS_INDEX}`);
        await client.indices.create({
            index: PANDITS_INDEX,
            ...PANDITS_MAPPING,
        });
        console.log(`[ES] Index "${PANDITS_INDEX}" created successfully`);
    } else {
        console.log(`[ES] Index "${PANDITS_INDEX}" already exists`);
    }
}

module.exports = { ensureIndices };
