/**
 * HmarePanditJi — Search Service Tests
 *
 * Tests cover all 8 required scenarios from the spec:
 *   1. Only verified pandits appear in search results
 *   2. Puja type filter
 *   3. Date availability filter
 *   4. Distance filter (non-SearchAllIndia)
 *   5. SearchAllIndia bypasses distance
 *   6. Sort by distance
 *   7. Budget filter (rupees → paise conversion)
 *   8. Autocomplete returns max 5 results
 *
 * All money in PAISE internally (Master Rule #2).
 */

// ─── Mock Elasticsearch client ────────────────────────────────────────────────

const mockSearch = jest.fn();
const mockIndex = jest.fn();
const mockDelete = jest.fn();
const mockIndicesExists = jest.fn();
const mockIndicesCreate = jest.fn();
const mockIndicesRefresh = jest.fn();
const mockClusterHealth = jest.fn();

jest.mock('@elastic/elasticsearch', () => ({
    Client: jest.fn().mockImplementation(() => ({
        search: mockSearch,
        index: mockIndex,
        delete: mockDelete,
        indices: {
            exists: mockIndicesExists,
            create: mockIndicesCreate,
            refresh: mockIndicesRefresh,
        },
        cluster: {
            health: mockClusterHealth,
        },
    })),
}));

// ─── Mock PostgreSQL ──────────────────────────────────────────────────────────

const mockQuery = jest.fn();
jest.mock('../src/db', () => ({
    query: mockQuery,
    pool: { end: jest.fn() },
}));

// ─── Mock node-cron ───────────────────────────────────────────────────────────

jest.mock('node-cron', () => ({ schedule: jest.fn() }));

// ─── Imports ──────────────────────────────────────────────────────────────────

const request = require('supertest');
const { app } = require('../src/index');
const {
    searchPandits,
    autocompletePandits,
    nearbyPandits,
    calculateDistance,
} = require('../src/services/search.service');
const {
    indexSinglePandit,
    removeFromIndex,
    buildEsDocument,
} = require('../src/elasticsearch/pandit.indexer');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a fake ES hit for a pandit */
function makePanditHit(overrides = {}) {
    const defaults = {
        pandit_id: 'p1',
        full_name: 'Ram Sharma',
        verification_status: 'verified',
        is_online: true,
        home_location: { lat: 28.6139, lon: 77.209 },
        home_city: 'Delhi',
        home_state: 'Delhi',
        rating: 4.8,
        total_reviews: 120,
        completed_bookings: 95,
        years_experience: 15,
        specializations: ['vivah', 'griha_pravesh', 'satyanarayan'],
        languages_spoken: ['hi', 'sa', 'en'],
        verified_badges: ['aadhaar', 'video_kyc'],
        max_distance_km: 500,
        available_travel_modes: ['self_drive', 'cab', 'train'],
        self_drive_enabled: true,
        self_drive_max_km: 200,
        dakshina_min_paise: 500000, // ₹5,000
        has_samagri_packages: true,
        samagri_puja_types: ['vivah', 'satyanarayan'],
        bio_text: 'Experienced Maithil Brahmin pandit',
        profile_photo_url: 'https://cdn.example.com/photo.jpg',
        unavailable_dates: ['2024-06-15', '2024-06-16'],
        advance_notice_days: 3,
        updated_at: '2024-01-01T00:00:00.000Z',
    };

    const source = { ...defaults, ...overrides };

    return {
        _id: source.pandit_id,
        _score: 5.0,
        _source: source,
    };
}

/** Standard ES response wrapper */
function makeEsResponse(hits, total) {
    return {
        hits: {
            total: { value: total ?? hits.length, relation: 'eq' },
            hits,
        },
    };
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
    mockClusterHealth.mockResolvedValue({ cluster_name: 'test', status: 'green' });
    mockIndicesExists.mockResolvedValue(true);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 1: Only verified pandits appear in search results
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('TEST 1: Verified-only filter', () => {
    test('search query always includes verification_status=verified filter', async () => {
        mockSearch.mockResolvedValue(makeEsResponse([]));

        await searchPandits({ query: 'test' });

        const calledWith = mockSearch.mock.calls[0][0];
        const filters = calledWith.query.bool.filter;

        const verifiedFilter = filters.find(
            (f) => f.term && f.term.verification_status === 'verified'
        );

        expect(verifiedFilter).toBeTruthy();
    });

    test('indexSinglePandit removes unverified pandit from index', async () => {
        mockQuery.mockResolvedValue({
            rows: [
                {
                    pandit_id: 'u-pending',
                    full_name: 'Pending Pandit',
                    verification_status: 'pending',
                    is_deleted: false,
                },
            ],
        });
        mockDelete.mockResolvedValue({});

        await indexSinglePandit('u-pending');

        expect(mockDelete).toHaveBeenCalledWith(
            expect.objectContaining({
                index: 'pandits',
                id: 'u-pending',
            })
        );
        expect(mockIndex).not.toHaveBeenCalled();
    });

    test('indexSinglePandit indexes verified pandit', async () => {
        mockQuery.mockResolvedValue({
            rows: [
                {
                    pandit_id: 'u-verified',
                    full_name: 'Verified Pandit',
                    verification_status: 'verified',
                    is_online: true,
                    years_experience: 10,
                    specializations: ['vivah'],
                    languages_spoken: ['hi'],
                    rating: 4.5,
                    total_reviews: 50,
                    completed_bookings: 40,
                    home_lat: 28.6,
                    home_lng: 77.2,
                    home_city: 'Delhi',
                    home_state: 'Delhi',
                },
            ],
        });
        mockIndex.mockResolvedValue({});

        await indexSinglePandit('u-verified');

        expect(mockIndex).toHaveBeenCalledWith(
            expect.objectContaining({
                index: 'pandits',
                id: 'u-verified',
            })
        );
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 2: Puja type filter
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('TEST 2: Puja type filter', () => {
    test('pujaType adds term filter on specializations', async () => {
        mockSearch.mockResolvedValue(
            makeEsResponse([
                makePanditHit({ specializations: ['vivah', 'griha_pravesh'] }),
            ])
        );

        const result = await searchPandits({ pujaType: 'vivah' });

        const calledWith = mockSearch.mock.calls[0][0];
        const filters = calledWith.query.bool.filter;

        const pujaFilter = filters.find(
            (f) => f.term && f.term.specializations === 'vivah'
        );
        expect(pujaFilter).toBeTruthy();

        // All results should have vivah in specializations
        expect(result.pandits[0].specializations).toContain('vivah');
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 3: Date availability filter
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('TEST 3: Date availability filter', () => {
    test('blocked date is excluded via must_not', async () => {
        mockSearch.mockResolvedValue(makeEsResponse([]));

        await searchPandits({ eventDate: '2024-06-15' });

        const calledWith = mockSearch.mock.calls[0][0];
        const filters = calledWith.query.bool.filter;

        // Must include must_not for unavailable_dates
        const dateFilter = filters.find(
            (f) => f.bool && f.bool.must_not
        );
        expect(dateFilter).toBeTruthy();
        expect(dateFilter.bool.must_not).toEqual(
            expect.arrayContaining([
                { term: { unavailable_dates: '2024-06-15' } },
            ])
        );
    });

    test('advance_notice_days filter is applied', async () => {
        mockSearch.mockResolvedValue(makeEsResponse([]));

        // Event date far in the future — should allow pandits needing up to that many days
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const dateStr = futureDate.toISOString().split('T')[0];

        await searchPandits({ eventDate: dateStr });

        const calledWith = mockSearch.mock.calls[0][0];
        const filters = calledWith.query.bool.filter;

        const noticeFilter = filters.find(
            (f) => f.range && f.range.advance_notice_days
        );
        expect(noticeFilter).toBeTruthy();
        expect(noticeFilter.range.advance_notice_days.lte).toBeGreaterThanOrEqual(29);
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 4: Distance filter (non-SearchAllIndia)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('TEST 4: Distance filter', () => {
    test('applies geo_distance filter when customerLocation provided', async () => {
        mockSearch.mockResolvedValue(makeEsResponse([]));

        await searchPandits({
            customerLocation: { lat: 28.6139, lng: 77.209, city: 'Delhi' },
            maxDistanceKm: 100,
            searchAllIndia: false,
        });

        const calledWith = mockSearch.mock.calls[0][0];
        const filters = calledWith.query.bool.filter;

        // Should have geo_distance filter
        const geoFilter = filters.find((f) => f.geo_distance);
        expect(geoFilter).toBeTruthy();
        expect(geoFilter.geo_distance.distance).toBe('100km');

        // Should have max_distance_km range filter
        const rangeFilter = filters.find(
            (f) => f.range && f.range.max_distance_km
        );
        expect(rangeFilter).toBeTruthy();
    });

    test('nearby Varanasi pandit excluded within 100km of Delhi', () => {
        // Delhi: 28.6139, 77.2090
        // Varanasi: 25.3176, 82.9739
        const dist = calculateDistance(28.6139, 77.209, 25.3176, 82.9739);
        expect(dist).toBeGreaterThan(600); // ~680km, way beyond 100km
    });

    test('nearby Gurgaon pandit included within 100km of Delhi', () => {
        // Delhi: 28.6139, 77.2090
        // Gurgaon: 28.4595, 77.0266
        const dist = calculateDistance(28.6139, 77.209, 28.4595, 77.0266);
        expect(dist).toBeLessThan(100); // ~25km
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 5: SearchAllIndia bypasses distance
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('TEST 5: SearchAllIndia', () => {
    test('searchAllIndia=true removes geo_distance and max_distance_km filters', async () => {
        mockSearch.mockResolvedValue(makeEsResponse([]));

        await searchPandits({
            customerLocation: { lat: 28.6139, lng: 77.209 },
            maxDistanceKm: 100,
            searchAllIndia: true,
        });

        const calledWith = mockSearch.mock.calls[0][0];
        const filters = calledWith.query.bool.filter;

        // Should NOT have geo_distance filter
        const geoFilter = filters.find((f) => f.geo_distance);
        expect(geoFilter).toBeUndefined();

        // Should NOT have max_distance_km range filter
        const rangeFilter = filters.find(
            (f) => f.range && f.range.max_distance_km
        );
        expect(rangeFilter).toBeUndefined();
    });

    test('searchMetadata reflects searchAllIndia=true', async () => {
        mockSearch.mockResolvedValue(makeEsResponse([]));

        const result = await searchPandits({ searchAllIndia: true });

        expect(result.searchMetadata.searchAllIndiaActive).toBe(true);
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 6: Sort by distance
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('TEST 6: Sort by distance', () => {
    test('sortBy=distance uses _geo_distance sort', async () => {
        const nearPandit = makePanditHit({
            pandit_id: 'near',
            home_location: { lat: 28.4595, lon: 77.0266 }, // Gurgaon ~25km
        });
        const farPandit = makePanditHit({
            pandit_id: 'far',
            home_location: { lat: 25.3176, lon: 82.9739 }, // Varanasi ~680km
        });

        mockSearch.mockResolvedValue(makeEsResponse([nearPandit, farPandit]));

        const result = await searchPandits({
            sortBy: 'distance',
            customerLocation: { lat: 28.6139, lng: 77.209 },
        });

        // Verify ES was called with _geo_distance sort
        const calledWith = mockSearch.mock.calls[0][0];
        expect(calledWith.sort[0]._geo_distance).toBeTruthy();
        expect(calledWith.sort[0]._geo_distance.order).toBe('asc');

        // First result should be nearer
        expect(result.pandits[0].panditId).toBe('near');
        expect(result.pandits[0].distanceKm).toBeLessThan(result.pandits[1].distanceKm);
    });

    test('sortBy=distance without location falls back to rating sort', async () => {
        mockSearch.mockResolvedValue(makeEsResponse([]));

        await searchPandits({ sortBy: 'distance' });

        const calledWith = mockSearch.mock.calls[0][0];
        expect(calledWith.sort).toEqual([{ rating: 'desc' }]);
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 7: Budget filter (rupees → paise)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('TEST 7: Budget filter', () => {
    test('maxDakshinaRupees converts to paise and applies range filter', async () => {
        mockSearch.mockResolvedValue(makeEsResponse([]));

        await searchPandits({ maxDakshinaRupees: 10000 });

        const calledWith = mockSearch.mock.calls[0][0];
        const filters = calledWith.query.bool.filter;

        const budgetFilter = filters.find(
            (f) => f.range && f.range.dakshina_min_paise
        );
        expect(budgetFilter).toBeTruthy();
        // ₹10,000 = 1,000,000 paise
        expect(budgetFilter.range.dakshina_min_paise.lte).toBe(1000000);
    });

    test('pandit with ₹15,000 dakshina excluded by ₹10,000 max filter', async () => {
        // In real ES query this would be filtered — we verify the query is built correctly
        mockSearch.mockResolvedValue(makeEsResponse([]));

        await searchPandits({ maxDakshinaRupees: 10000 });

        const calledWith = mockSearch.mock.calls[0][0];
        const budgetFilter = calledWith.query.bool.filter.find(
            (f) => f.range && f.range.dakshina_min_paise
        );
        // ₹15,000 = 1,500,000 paise > 1,000,000 limit → would be filtered out by ES
        expect(1500000).toBeGreaterThan(budgetFilter.range.dakshina_min_paise.lte);
    });

    test('response converts paise back to rupees', async () => {
        const hit = makePanditHit({ dakshina_min_paise: 800000 }); // ₹8,000
        mockSearch.mockResolvedValue(makeEsResponse([hit]));

        const result = await searchPandits({});

        // dakshinaMinRupees should be 8000 (₹8,000)
        expect(result.pandits[0].dakshinaMinRupees).toBe(8000);
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 8: Autocomplete returns max 5 results
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('TEST 8: Autocomplete', () => {
    test('autocomplete returns max 5 results', async () => {
        const hits = Array.from({ length: 5 }, (_, i) =>
            makePanditHit({ pandit_id: `p${i}`, full_name: `Ramesh ${i}` })
        );
        mockSearch.mockResolvedValue(makeEsResponse(hits, 100));

        const result = await autocompletePandits('Ra', 5);

        expect(result.length).toBeLessThanOrEqual(5);
        // Verify ES was called with size=5
        const calledWith = mockSearch.mock.calls[0][0];
        expect(calledWith.size).toBe(5);
    });

    test('autocomplete only returns verified pandits', async () => {
        mockSearch.mockResolvedValue(makeEsResponse([]));

        await autocompletePandits('Ra');

        const calledWith = mockSearch.mock.calls[0][0];
        const filters = calledWith.query.bool.filter;
        const verifiedFilter = filters.find(
            (f) => f.term && f.term.verification_status === 'verified'
        );
        expect(verifiedFilter).toBeTruthy();
    });

    test('autocomplete uses phrase_prefix for partial matching', async () => {
        mockSearch.mockResolvedValue(makeEsResponse([]));

        await autocompletePandits('Ram');

        const calledWith = mockSearch.mock.calls[0][0];
        const mustClause = calledWith.query.bool.must[0];
        expect(mustClause.multi_match.type).toBe('phrase_prefix');
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADDITIONAL: API Integration Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('API Integration', () => {
    test('POST /api/v1/search/pandits returns 200 with results', async () => {
        mockSearch.mockResolvedValue(
            makeEsResponse([makePanditHit()])
        );

        const res = await request(app)
            .post('/api/v1/search/pandits')
            .send({ pujaType: 'vivah' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.pandits).toHaveLength(1);
        expect(res.body.data.pagination).toBeDefined();
    });

    test('POST /api/v1/search/pandits with invalid body returns 400', async () => {
        const res = await request(app)
            .post('/api/v1/search/pandits')
            .send({ eventDate: 'not-a-date' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    test('GET /api/v1/search/pandits/autocomplete without q returns 400', async () => {
        const res = await request(app)
            .get('/api/v1/search/pandits/autocomplete');

        expect(res.status).toBe(400);
    });

    test('GET /api/v1/search/pandits/autocomplete with q returns suggestions', async () => {
        mockSearch.mockResolvedValue(
            makeEsResponse([
                makePanditHit({ pandit_id: 'p1', full_name: 'Ramesh Sharma' }),
            ])
        );

        const res = await request(app)
            .get('/api/v1/search/pandits/autocomplete?q=Ram');

        expect(res.status).toBe(200);
        expect(res.body.data.suggestions).toHaveLength(1);
        expect(res.body.data.suggestions[0].fullName).toBe('Ramesh Sharma');
    });

    test('GET /api/v1/search/pandits/nearby without lat/lng returns 400', async () => {
        const res = await request(app)
            .get('/api/v1/search/pandits/nearby');

        expect(res.status).toBe(400);
    });

    test('GET /api/v1/search/pandits/nearby with valid coords returns results', async () => {
        mockSearch.mockResolvedValue(
            makeEsResponse([
                makePanditHit({
                    home_location: { lat: 28.5, lon: 77.1 },
                }),
            ])
        );

        const res = await request(app)
            .get('/api/v1/search/pandits/nearby?lat=28.6&lng=77.2');

        expect(res.status).toBe(200);
        expect(res.body.data.pandits).toHaveLength(1);
    });

    test('GET /health returns 200', async () => {
        const res = await request(app).get('/health');

        expect(res.status).toBe(200);
        expect(res.body.service).toBe('search-service');
    });

    test('admin sync requires authentication', async () => {
        const res = await request(app)
            .get('/api/v1/search/pandits/some-id/sync');

        expect(res.status).toBe(401);
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADDITIONAL: buildEsDocument utility tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('buildEsDocument', () => {
    test('builds correct geo_point from lat/lng', () => {
        const doc = buildEsDocument({
            pandit_id: 'p1',
            full_name: 'Test',
            verification_status: 'verified',
            home_lat: '28.6139',
            home_lng: '77.2090',
            home_city: 'Delhi',
            home_state: 'Delhi',
        });

        expect(doc.home_location).toEqual({ lat: 28.6139, lon: 77.209 });
    });

    test('sets home_location to null when no coordinates', () => {
        const doc = buildEsDocument({
            pandit_id: 'p1',
            verification_status: 'verified',
        });

        expect(doc.home_location).toBeNull();
    });

    test('dakshina_min_paise defaults to 0', () => {
        const doc = buildEsDocument({
            pandit_id: 'p1',
            verification_status: 'verified',
        });

        expect(doc.dakshina_min_paise).toBe(0);
    });

    test('merges blackout_dates and prisma blocked_dates', () => {
        const doc = buildEsDocument({
            pandit_id: 'p1',
            verification_status: 'verified',
            blackout_dates: ['2024-06-15'],
            blocked_dates_from_prisma: [new Date('2024-06-20')],
        });

        expect(doc.unavailable_dates).toContain('2024-06-15');
        expect(doc.unavailable_dates).toContain('2024-06-20');
    });
});
