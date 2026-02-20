/**
 * HmarePanditJi — PostgreSQL connection pool
 *
 * Reads from same database as the API service.
 * Master Rule #1: connection string from .env only.
 */

const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({
    connectionString: config.database.connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err.message);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
