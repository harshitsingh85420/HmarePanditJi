/**
 * HmarePanditJi — Pandit Search Service
 *
 * The heart of the customer experience. Builds Elasticsearch queries
 * from customer filter inputs and returns ranked pandit results.
 *
 * BUSINESS RULES:
 *   - Only verification_status='verified' pandits appear (ALWAYS filtered)
 *   - Prices stored in PAISE internally, returned as RUPEES in API (Master Rule #2)
 *   - SearchAllIndia=true bypasses distance filter entirely
 *   - Online pandits get a slight relevance boost
 *
 * SUPPORTED FILTERS:
 *   pujaType, eventDate, customerLocation, searchAllIndia, maxDistanceKm,
 *   minDakshinaRupees, maxDakshinaRupees, travelModePreference, languages,
 *   minRating, minExperienceYears
 *
 * SORT OPTIONS:
 *   relevance (default), rating, price_low, price_high, distance, experience
 */

const { getClient } = require('../elasticsearch/client');
const { PANDITS_INDEX } = require('../elasticsearch/indices/pandits.mapping');

// ─── Haversine distance ──────────────────────────────────────────────────────

/**
 * Calculate distance in km between two lat/lng points (Haversine formula).
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Sort builder ────────────────────────────────────────────────────────────

function buildSort(sortBy, customerLocation) {
    switch (sortBy) {
        case 'rating':
            return [{ rating: 'desc' }, { total_reviews: 'desc' }];

        case 'price_low':
            return [{ dakshina_min_paise: 'asc' }];

        case 'price_high':
            return [{ dakshina_min_paise: 'desc' }];

        case 'experience':
            return [{ years_experience: 'desc' }];

        case 'distance':
            if (!customerLocation) return [{ rating: 'desc' }];
            return [
                {
                    _geo_distance: {
                        home_location: {
                            lat: customerLocation.lat,
                            lon: customerLocation.lng,
                        },
                        order: 'asc',
                        unit: 'km',
                        mode: 'min',
                    },
                },
            ];

        case 'relevance':
        default:
            // Compound: ES score → rating → completed bookings
            return ['_score', { rating: 'desc' }, { completed_bookings: 'desc' }];
    }
}

// ─── Applied filters list ────────────────────────────────────────────────────

function buildAppliedFiltersList(params) {
    const applied = [];
    if (params.query) applied.push('text_search');
    if (params.pujaType) applied.push('puja_type');
    if (params.eventDate) applied.push('date_availability');
    if (params.customerLocation && !params.searchAllIndia) applied.push('location');
    if (params.minDakshinaRupees || params.maxDakshinaRupees) applied.push('budget');
    if (params.travelModePreference) applied.push('travel_mode');
    if (params.languages && params.languages.length) applied.push('languages');
    if (params.minRating) applied.push('min_rating');
    if (params.minExperienceYears) applied.push('min_experience');
    return applied;
}

// ─── Main search function ────────────────────────────────────────────────────

/**
 * Search pandits with full filter, sort, and pagination support.
 *
 * @param {object} params — Search parameters from the API request body
 * @returns {{ pandits, pagination, searchMetadata }}
 */
async function searchPandits(params) {
    const {
        query,
        pujaType,
        eventDate,
        customerLocation,
        searchAllIndia,
        maxDistanceKm,
        minDakshinaRupees,
        maxDakshinaRupees,
        travelModePreference,
        languages,
        minRating,
        minExperienceYears,
        sortBy = 'relevance',
        page = 1,
        limit = 20,
    } = params;

    const mustClauses = [];
    const filterClauses = [];
    const shouldClauses = [];

    // ───────────────────────────────────────────
    // ALWAYS: Only show verified pandits
    // ───────────────────────────────────────────
    filterClauses.push({ term: { verification_status: 'verified' } });

    // ─── Free text search ────────────────────────────────────────
    if (query) {
        mustClauses.push({
            multi_match: {
                query,
                fields: ['full_name^3', 'bio_text', 'full_name.hindi'],
                type: 'best_fields',
                fuzziness: 'AUTO',
            },
        });
    }

    // ─── Puja type filter ────────────────────────────────────────
    if (pujaType) {
        filterClauses.push({ term: { specializations: pujaType } });
    }

    // ─── Date availability filter ────────────────────────────────
    if (eventDate) {
        // Exclude pandits who have this date blocked
        filterClauses.push({
            bool: {
                must_not: [{ term: { unavailable_dates: eventDate } }],
            },
        });

        // Exclude pandits who need more advance notice than available
        const daysUntilEvent = Math.floor(
            (new Date(eventDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilEvent >= 0) {
            filterClauses.push({
                range: { advance_notice_days: { lte: daysUntilEvent } },
            });
        }
    }

    // ─── Location / Distance filter ──────────────────────────────
    if (!searchAllIndia && customerLocation) {
        const distanceKm = maxDistanceKm || 500;

        // Pandit must be willing to travel this far
        filterClauses.push({
            range: { max_distance_km: { gte: Math.min(distanceKm, 5000) } },
        });

        // Geo-distance: only pandits within the customer's selected radius
        if (distanceKm < 5000) {
            filterClauses.push({
                geo_distance: {
                    distance: `${distanceKm}km`,
                    home_location: {
                        lat: customerLocation.lat,
                        lon: customerLocation.lng,
                    },
                },
            });
        }
    }

    // ─── Dakshina range filter ───────────────────────────────────
    // Customer enters RUPEES → convert to PAISE for ES query (Master Rule #2)
    if (minDakshinaRupees || maxDakshinaRupees) {
        const rangeFilter = {};
        if (minDakshinaRupees) rangeFilter.gte = minDakshinaRupees * 100;
        if (maxDakshinaRupees) rangeFilter.lte = maxDakshinaRupees * 100;
        filterClauses.push({ range: { dakshina_min_paise: rangeFilter } });
    }

    // ─── Travel mode preference ──────────────────────────────────
    if (travelModePreference && travelModePreference !== 'any') {
        filterClauses.push({
            term: { available_travel_modes: travelModePreference },
        });
    }

    // ─── Language filter ─────────────────────────────────────────
    if (languages && languages.length > 0) {
        filterClauses.push({ terms: { languages_spoken: languages } });
    }

    // ─── Min rating filter ───────────────────────────────────────
    if (minRating) {
        filterClauses.push({ range: { rating: { gte: minRating } } });
    }

    // ─── Min experience filter ───────────────────────────────────
    if (minExperienceYears) {
        filterClauses.push({
            range: { years_experience: { gte: minExperienceYears } },
        });
    }

    // ─── Boost online pandits slightly (faster response) ─────────
    shouldClauses.push({
        term: { is_online: { value: true, boost: 1.2 } },
    });

    // ─── Build sort ──────────────────────────────────────────────
    const sort = buildSort(sortBy, customerLocation);

    // ─── Build final ES query ────────────────────────────────────
    const esQuery = {
        index: PANDITS_INDEX,
        from: (page - 1) * limit,
        size: limit,
        query: {
            bool: {
                must: mustClauses.length > 0 ? mustClauses : [{ match_all: {} }],
                filter: filterClauses,
                should: shouldClauses,
                minimum_should_match: 0,
            },
        },
        sort,
        // Only return fields needed for search result cards
        _source: [
            'pandit_id',
            'full_name',
            'home_city',
            'home_state',
            'home_location',
            'rating',
            'total_reviews',
            'completed_bookings',
            'years_experience',
            'specializations',
            'languages_spoken',
            'verified_badges',
            'profile_photo_url',
            'dakshina_min_paise',
            'available_travel_modes',
            'self_drive_enabled',
            'is_online',
            'has_samagri_packages',
        ],
    };

    const client = getClient();
    const response = await client.search(esQuery);

    const hits = response.hits.hits;
    const total =
        typeof response.hits.total === 'number'
            ? response.hits.total
            : response.hits.total.value;

    // ─── Transform results ───────────────────────────────────────
    const pandits = hits.map((hit) => {
        const src = hit._source;

        // Calculate distance from customer if location provided
        let distanceKm = null;
        if (customerLocation && src.home_location) {
            distanceKm = calculateDistance(
                customerLocation.lat,
                customerLocation.lng,
                src.home_location.lat,
                src.home_location.lon
            );
        }

        return {
            panditId: src.pandit_id,
            fullName: src.full_name,
            homeCity: src.home_city,
            homeState: src.home_state,
            distanceKm: distanceKm !== null ? Math.round(distanceKm) : null,
            rating: src.rating,
            totalReviews: src.total_reviews,
            completedBookings: src.completed_bookings,
            yearsExperience: src.years_experience,
            specializations: src.specializations,
            languagesSpoken: src.languages_spoken,
            verifiedBadges: src.verified_badges,
            profilePhotoUrl: src.profile_photo_url,
            // Convert PAISE → RUPEES for display (Master Rule #2)
            dakshinaMinRupees: Math.round((src.dakshina_min_paise || 0) / 100),
            availableTravelModes: src.available_travel_modes,
            selfDriveEnabled: src.self_drive_enabled,
            isOnline: src.is_online,
            hasSamagriPackages: src.has_samagri_packages,
            relevanceScore: hit._score,
        };
    });

    return {
        pandits,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
        searchMetadata: {
            filtersApplied: buildAppliedFiltersList(params),
            searchAllIndiaActive: !!searchAllIndia,
        },
    };
}

// ─── Autocomplete ────────────────────────────────────────────────────────────

/**
 * Name autocomplete for the search bar.
 * Returns max 5 suggestions using phrase_prefix match.
 */
async function autocompletePandits(queryText, limit = 5) {
    const client = getClient();

    const response = await client.search({
        index: PANDITS_INDEX,
        size: limit,
        query: {
            bool: {
                must: [
                    {
                        multi_match: {
                            query: queryText,
                            fields: ['full_name', 'full_name.keyword'],
                            type: 'phrase_prefix',
                        },
                    },
                ],
                filter: [{ term: { verification_status: 'verified' } }],
            },
        },
        _source: ['pandit_id', 'full_name', 'home_city', 'profile_photo_url'],
    });

    return response.hits.hits.map((hit) => ({
        panditId: hit._source.pandit_id,
        fullName: hit._source.full_name,
        homeCity: hit._source.home_city,
        profilePhotoUrl: hit._source.profile_photo_url,
    }));
}

// ─── Nearby pandits ──────────────────────────────────────────────────────────

/**
 * Quick "Pandits near me" for homepage carousel.
 * Always sorted by distance, only verified + online within 100km.
 */
async function nearbyPandits({ lat, lng, pujaType, limit = 10 }) {
    const filterClauses = [
        { term: { verification_status: 'verified' } },
        { term: { is_online: true } },
        {
            geo_distance: {
                distance: '100km',
                home_location: { lat, lon: lng },
            },
        },
    ];

    if (pujaType) {
        filterClauses.push({ term: { specializations: pujaType } });
    }

    const client = getClient();
    const response = await client.search({
        index: PANDITS_INDEX,
        size: limit,
        query: { bool: { filter: filterClauses } },
        sort: [
            {
                _geo_distance: {
                    home_location: { lat, lon: lng },
                    order: 'asc',
                    unit: 'km',
                    mode: 'min',
                },
            },
        ],
        _source: [
            'pandit_id',
            'full_name',
            'home_city',
            'home_location',
            'rating',
            'total_reviews',
            'specializations',
            'profile_photo_url',
            'dakshina_min_paise',
            'is_online',
        ],
    });

    return response.hits.hits.map((hit) => {
        const src = hit._source;
        const distanceKm = calculateDistance(lat, lng, src.home_location.lat, src.home_location.lon);

        return {
            panditId: src.pandit_id,
            fullName: src.full_name,
            homeCity: src.home_city,
            distanceKm: Math.round(distanceKm),
            rating: src.rating,
            totalReviews: src.total_reviews,
            specializations: src.specializations,
            profilePhotoUrl: src.profile_photo_url,
            dakshinaMinRupees: Math.round((src.dakshina_min_paise || 0) / 100),
            isOnline: src.is_online,
        };
    });
}

module.exports = {
    searchPandits,
    autocompletePandits,
    nearbyPandits,
    calculateDistance,
    buildSort,
    buildAppliedFiltersList,
};
