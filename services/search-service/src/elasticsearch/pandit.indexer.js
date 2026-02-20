/**
 * HmarePanditJi — Pandit Indexer
 *
 * Syncs pandit data from PostgreSQL → Elasticsearch.
 *
 * indexSinglePandit(panditUserId) — called on KYC approval / profile update
 * reindexAllPandits()             — called by daily cron job
 *
 * BUSINESS RULE: NEVER index unverified pandits. Only verification_status='verified'.
 * MONEY RULE:    dakshina_min_paise is INTEGER in paise (Master Rule #2).
 */

const db = require('../db');
const { getClient } = require('./client');
const { PANDITS_INDEX } = require('./indices/pandits.mapping');

/**
 * SQL query to pull full pandit data across joined tables.
 * Maps to the Elasticsearch document structure in pandits.mapping.js.
 */
const PANDIT_QUERY = `
  SELECT
    u.id AS pandit_id,
    u.full_name,
    u.preferred_language,
    u.profile_photo_url,
    u.is_deleted,
    pp.verification_status,
    pp.is_online,
    pp.years_experience,
    pp.specializations,
    pp.languages_spoken,
    pp.gotra_expertise,
    pp.sect,
    pp.verified_badges,
    pp.rating,
    pp.total_reviews,
    pp.completed_bookings,
    pp.bio_text,
    pp.home_lat,
    pp.home_lng,
    pp.home_city,
    pp.home_state,
    tp.max_distance_km,
    tp.self_drive_enabled,
    tp.self_drive_max_km,
    tp.available_modes AS available_travel_modes,
    tp.blackout_dates,
    tp.advance_notice_days,
    -- Compute minimum dakshina across all active puja services
    (
      SELECT MIN(ps.dakshina_amount)
      FROM puja_services ps
      WHERE ps.pandit_id = (
        SELECT p2.id FROM pandits p2 WHERE p2.user_id = u.id LIMIT 1
      ) AND ps.is_active = true
    ) AS dakshina_min_paise,
    -- Samagri puja types from packages
    (
      SELECT ARRAY_AGG(DISTINCT sp.puja_type)
      FROM samagri_packages sp
      WHERE sp.pandit_id = (
        SELECT p3.id FROM pandits p3 WHERE p3.user_id = u.id LIMIT 1
      ) AND sp.is_active = true
    ) AS samagri_puja_types,
    -- Blocked dates
    (
      SELECT ARRAY_AGG(pbd.date::date)
      FROM pandit_blocked_dates pbd
      WHERE pbd.pandit_id = (
        SELECT p4.id FROM pandits p4 WHERE p4.user_id = u.id LIMIT 1
      ) AND pbd.date >= CURRENT_DATE
    ) AS blocked_dates_from_prisma
  FROM users u
  JOIN pandit_profiles pp ON pp.user_id = u.id
  LEFT JOIN pandit_travel_preferences tp ON tp.pandit_id = u.id
  WHERE u.is_deleted = false
`;

/**
 * Index a single pandit into Elasticsearch.
 * Called on: KYC approval, profile update, availability change.
 *
 * @param {string} panditUserId — The user.id (UUID) of the pandit
 */
async function indexSinglePandit(panditUserId) {
    const { rows } = await db.query(
        `${PANDIT_QUERY} AND u.id = $1`,
        [panditUserId]
    );

    if (!rows.length) {
        console.warn(`[Indexer] Pandit user ${panditUserId} not found in DB`);
        return;
    }

    const pandit = rows[0];

    // BUSINESS RULE: NEVER index unverified pandits
    if (pandit.verification_status !== 'verified') {
        await removeFromIndex(panditUserId);
        return;
    }

    const esDoc = buildEsDocument(pandit);
    const client = getClient();

    await client.index({
        index: PANDITS_INDEX,
        id: panditUserId,
        document: esDoc,
        refresh: 'wait_for', // ensure immediate searchability after index
    });

    console.log(`[Indexer] Indexed pandit ${panditUserId} (${pandit.full_name})`);
}

/**
 * Remove a pandit from the search index.
 * Called when: pandit is suspended, KYC rejected, account deleted.
 */
async function removeFromIndex(panditUserId) {
    const client = getClient();
    try {
        await client.delete({
            index: PANDITS_INDEX,
            id: panditUserId,
            refresh: 'wait_for',
        });
        console.log(`[Indexer] Removed pandit ${panditUserId} from index`);
    } catch (err) {
        if (err.meta?.statusCode !== 404) throw err;
        // 404 — pandit wasn't in index, that's fine
    }
}

/**
 * Re-index all verified pandits. Used by the daily cron job.
 * Returns { success, failed } counts.
 */
async function reindexAllPandits() {
    const { rows } = await db.query(
        `${PANDIT_QUERY} AND pp.verification_status = 'verified'`
    );

    let success = 0;
    let failed = 0;

    for (const pandit of rows) {
        try {
            const esDoc = buildEsDocument(pandit);
            const client = getClient();

            await client.index({
                index: PANDITS_INDEX,
                id: pandit.pandit_id,
                document: esDoc,
            });
            success++;
        } catch (err) {
            failed++;
            console.error(`[Indexer] Failed pandit ${pandit.pandit_id}:`, err.message);
        }

        // Small delay to avoid overloading Elasticsearch
        await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Refresh index after bulk insert for searchability
    const client = getClient();
    await client.indices.refresh({ index: PANDITS_INDEX });

    return { success, failed, total: rows.length };
}

/**
 * Build an Elasticsearch document from a PostgreSQL pandit row.
 *
 * @param {object} pandit — Row from PANDIT_QUERY
 * @returns {object} ES document matching pandits.mapping.js
 */
function buildEsDocument(pandit) {
    // Merge blocked dates from travel preferences and from pandit_blocked_dates
    const blackoutDates = pandit.blackout_dates || [];
    const prismaBlockedDates = (pandit.blocked_dates_from_prisma || []).map(
        (d) => (d instanceof Date ? d.toISOString().split('T')[0] : String(d))
    );
    const allUnavailable = [...new Set([...blackoutDates, ...prismaBlockedDates])];

    return {
        pandit_id: pandit.pandit_id,
        full_name: pandit.full_name || '',
        verification_status: pandit.verification_status,
        is_online: pandit.is_online || false,

        // Geo point — null if no coordinates
        home_location:
            pandit.home_lat && pandit.home_lng
                ? { lat: parseFloat(pandit.home_lat), lon: parseFloat(pandit.home_lng) }
                : null,
        home_city: pandit.home_city || null,
        home_state: pandit.home_state || null,

        // Stats
        rating: parseFloat(pandit.rating) || 0,
        total_reviews: pandit.total_reviews || 0,
        completed_bookings: pandit.completed_bookings || 0,
        years_experience: pandit.years_experience || 0,

        // Arrays
        specializations: pandit.specializations || [],
        languages_spoken: pandit.languages_spoken || ['hi'],
        gotra_expertise: pandit.gotra_expertise || [],
        verified_badges: pandit.verified_badges || [],
        sect: pandit.sect || null,

        // Travel
        max_distance_km: pandit.max_distance_km || 50,
        available_travel_modes: pandit.available_travel_modes || ['cab'],
        self_drive_enabled: pandit.self_drive_enabled || false,
        self_drive_max_km: pandit.self_drive_max_km || 0,

        // Pricing — INTEGER in PAISE (Master Rule #2)
        dakshina_min_paise: pandit.dakshina_min_paise || 0,

        // Samagri
        has_samagri_packages: (pandit.samagri_puja_types || []).length > 0,
        samagri_puja_types: pandit.samagri_puja_types || [],

        // Display
        bio_text: pandit.bio_text || '',
        profile_photo_url: pandit.profile_photo_url || '',

        // Availability
        unavailable_dates: allUnavailable,
        advance_notice_days: pandit.advance_notice_days || 3,

        updated_at: new Date().toISOString(),
    };
}

module.exports = {
    indexSinglePandit,
    removeFromIndex,
    reindexAllPandits,
    buildEsDocument,
};
