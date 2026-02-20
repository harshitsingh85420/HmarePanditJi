/**
 * HmarePanditJi — Elasticsearch Pandit Index Mapping
 *
 * Created on service startup. Uses geo_point for distance search,
 * Hindi analyzer for name search, keyword arrays for filters.
 *
 * BUSINESS RULE: Only verification_status='verified' will be indexed.
 */

const PANDITS_INDEX = 'pandits';

const PANDITS_MAPPING = {
    settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
        analysis: {
            analyzer: {
                hindi_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'hindi_normalization'],
                },
            },
        },
    },
    mappings: {
        properties: {
            // Identity
            pandit_id: { type: 'keyword' },
            full_name: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                    keyword: { type: 'keyword' },
                    hindi: { type: 'text', analyzer: 'hindi_analyzer' },
                },
            },
            verification_status: { type: 'keyword' },
            is_online: { type: 'boolean' },

            // Location — CRITICAL for "nearby" search
            home_location: { type: 'geo_point' },
            home_city: { type: 'keyword' },
            home_state: { type: 'keyword' },

            // Ratings & stats
            rating: { type: 'float' },
            total_reviews: { type: 'integer' },
            completed_bookings: { type: 'integer' },
            years_experience: { type: 'integer' },

            // Puja types — keyword array for term/terms filter
            specializations: { type: 'keyword' },

            // Languages — keyword array: ["hi", "sa", "bn", "en"]
            languages_spoken: { type: 'keyword' },

            // Religious metadata
            sect: { type: 'keyword' },
            gotra_expertise: { type: 'keyword' },
            verified_badges: { type: 'keyword' },

            // Travel capabilities
            max_distance_km: { type: 'integer' },
            available_travel_modes: { type: 'keyword' },
            self_drive_enabled: { type: 'boolean' },
            self_drive_max_km: { type: 'integer' },

            // Pricing — ALL in PAISE (Master Rule #2)
            dakshina_min_paise: { type: 'integer' },

            // Samagri
            has_samagri_packages: { type: 'boolean' },
            samagri_puja_types: { type: 'keyword' },

            // Display fields (not indexed for search)
            bio_text: { type: 'text', analyzer: 'standard' },
            profile_photo_url: { type: 'keyword', index: false },

            // Availability — ISO date strings for unavailable dates
            unavailable_dates: { type: 'keyword' },
            advance_notice_days: { type: 'integer' },

            updated_at: { type: 'date' },
        },
    },
};

module.exports = { PANDITS_INDEX, PANDITS_MAPPING };
