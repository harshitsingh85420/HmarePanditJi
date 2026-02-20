/**
 * HmarePanditJi — Search Service Configuration
 *
 * All secrets via .env, never hardcoded (Master Rule #1).
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const config = {
    port: parseInt(process.env.SEARCH_SERVICE_PORT || '3005', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    // PostgreSQL — reads from same DB as API service
    database: {
        connectionString: process.env.DATABASE_URL || 'postgresql://hpj_user:hpj_password_dev@localhost:5432/hmarepanditji',
    },

    // Elasticsearch
    elasticsearch: {
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
        maxRetries: 3,
        requestTimeout: 30000,
    },

    // JWT — same secret as API service for token validation
    jwt: {
        secret: process.env.JWT_SECRET || 'dev_jwt_secret_min_32_characters_long_placeholder',
    },

    // Redis — for muhurat caching (24h TTL)
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },

    // Search defaults
    search: {
        defaultLimit: 20,
        maxLimit: 100,
        defaultMaxDistanceKm: 500,
        nearbyRadiusKm: 100,
        nearbyLimit: 10,
        autocompleteLimit: 5,
    },
};

module.exports = config;
