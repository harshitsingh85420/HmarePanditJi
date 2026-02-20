/**
 * HmarePanditJi — Elasticsearch Client
 *
 * Singleton ES 8.x client. All secrets from .env (Master Rule #1).
 */

const { Client } = require('@elastic/elasticsearch');
const config = require('../config');

let _client = null;

function getClient() {
    if (!_client) {
        _client = new Client({
            node: config.elasticsearch.node,
            maxRetries: config.elasticsearch.maxRetries,
            requestTimeout: config.elasticsearch.requestTimeout,
        });
    }
    return _client;
}

/**
 * Check ES cluster health.
 */
async function ping() {
    const client = getClient();
    try {
        const health = await client.cluster.health();
        console.log(`[ES] Cluster: ${health.cluster_name}, Status: ${health.status}`);
        return health;
    } catch (err) {
        console.error('[ES] Ping failed:', err.message);
        throw err;
    }
}

module.exports = { getClient, ping };
