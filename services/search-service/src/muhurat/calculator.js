/**
 * HmarePanditJi — Muhurat Calculator
 *
 * Phase 1 algorithmic Panchang engine.
 * Computes approximate Tithi and Vara for any given date, then maps
 * them to auspicious muhurat windows for 10 supported puja types.
 *
 * This module is designed to be swappable — when a paid Panchang API
 * (DrikPanchang, AstroSage etc.) is integrated in Phase 2, only this
 * file needs to change; the routes and cache layer stay the same.
 *
 * Reference: Known new moon on Jan 11, 2024.
 * Lunar month ≈ 29.5306 days (synodic period).
 */

// ─── Vara (weekday) names in Hindi ──────────────────────────────────────────

const VARA_NAMES = [
    'Ravivar',    // 0 = Sunday
    'Somvar',     // 1 = Monday
    'Mangalvar',  // 2 = Tuesday
    'Budhvar',    // 3 = Wednesday
    'Guruvar',    // 4 = Thursday
    'Shukravar',  // 5 = Friday
    'Shanivar',   // 6 = Saturday
];

// ─── Tithi names (1-30) ─────────────────────────────────────────────────────

const TITHI_NAMES = [
    'Pratipada', 'Dwitiya', 'Tritiya',
    'Chaturthi', 'Panchami', 'Shashthi',
    'Saptami', 'Ashtami', 'Navami',
    'Dashami', 'Ekadashi', 'Dwadashi',
    'Trayodashi', 'Chaturdashi', 'Purnima',
    'Pratipada (Krishna)', 'Dwitiya (Krishna)', 'Tritiya (Krishna)',
    'Chaturthi (Krishna)', 'Panchami (Krishna)', 'Shashthi (Krishna)',
    'Saptami (Krishna)', 'Ashtami (Krishna)', 'Navami (Krishna)',
    'Dashami (Krishna)', 'Ekadashi (Krishna)', 'Dwadashi (Krishna)',
    'Trayodashi (Krishna)', 'Chaturdashi (Krishna)', 'Amavasya',
];

// ─── Puja display names (for API responses) ────────────────────────────────

const PUJA_DISPLAY_NAMES = {
    vivah: 'Vivah (विवाह)',
    griha_pravesh: 'Griha Pravesh (गृह प्रवेश)',
    satyanarayan: 'Satyanarayan Katha (सत्यनारायण कथा)',
    mundan: 'Mundan (मुंडन)',
    annaprashan: 'Annaprashan (अन्नप्राशन)',
    namkaran: 'Naamkaran (नामकरण)',
    havan: 'Havan (हवन)',
    ganesh_puja: 'Ganesh Puja (गणेश पूजा)',
    lakshmi_puja: 'Lakshmi Puja (लक्ष्मी पूजा)',
    vastu_puja: 'Vastu Shanti (वास्तु शांति)',
};

// ─── Muhurat rules per puja type ────────────────────────────────────────────

const PUJA_MUHURAT_RULES = {
    vivah: {
        goodVaras: [1, 4, 5],                // Monday, Thursday, Friday
        goodTithis: [2, 3, 5, 7, 10, 11, 13],
        blockedMonths: [6, 7, 8],             // Shravan and surrounding
        preferredMonths: [1, 2, 4, 5, 10, 11, 12],
        typicalDurationHours: 6,
        morningWindow: { start: '07:00', end: '09:00', quality: 'Good' },
        mainWindow: { start: '11:00', end: '12:30', quality: 'Excellent' },
        eveningWindow: { start: '16:00', end: '18:00', quality: 'Good' },
    },
    griha_pravesh: {
        goodVaras: [0, 3, 4, 5],             // Sun, Wed, Thu, Fri
        goodTithis: [2, 3, 5, 10, 11, 13],
        morningWindow: { start: '08:00', end: '10:00', quality: 'Excellent' },
        mainWindow: { start: '11:30', end: '13:00', quality: 'Good' },
    },
    satyanarayan: {
        goodVaras: [0, 1, 2, 3, 4, 5, 6],    // Any day
        goodTithis: [2, 5, 10, 11, 15],       // Ekadashi + Purnima especially good
        morningWindow: { start: '08:00', end: '11:00', quality: 'Good' },
        mainWindow: { start: '11:00', end: '13:00', quality: 'Excellent' },
        eveningWindow: { start: '17:00', end: '19:00', quality: 'Good' },
    },
    mundan: {
        goodVaras: [0, 3, 4],
        goodTithis: [2, 3, 5, 7, 10, 13],
        morningWindow: { start: '07:00', end: '10:00', quality: 'Excellent' },
    },
    annaprashan: {
        goodVaras: [1, 3, 4, 5],
        goodTithis: [2, 3, 5, 7, 10, 11],
        morningWindow: { start: '09:00', end: '11:00', quality: 'Excellent' },
    },
    namkaran: {
        goodVaras: [0, 1, 3, 4, 5],
        goodTithis: [2, 3, 7, 10, 11, 12],
        morningWindow: { start: '07:00', end: '09:00', quality: 'Good' },
        mainWindow: { start: '10:00', end: '12:00', quality: 'Excellent' },
    },
    havan: {
        goodVaras: [0, 1, 3, 4, 5, 6],
        goodTithis: [1, 2, 3, 5, 7, 10, 11, 13],
        morningWindow: { start: '06:30', end: '09:00', quality: 'Excellent' },
        mainWindow: { start: '10:00', end: '12:00', quality: 'Good' },
    },
    ganesh_puja: {
        goodVaras: [0, 1, 2, 3, 4, 5, 6],    // Any day
        goodTithis: [4],                       // Chaturthi especially good
        morningWindow: { start: '08:00', end: '11:00', quality: 'Excellent' },
        eveningWindow: { start: '17:00', end: '19:00', quality: 'Good' },
    },
    lakshmi_puja: {
        goodVaras: [5],                        // Friday especially good
        goodTithis: [2, 5, 8, 10, 11, 13, 15],
        eveningWindow: { start: '17:00', end: '19:30', quality: 'Excellent' },
    },
    vastu_puja: {
        goodVaras: [3, 4, 5],
        goodTithis: [2, 3, 5, 10, 13],
        morningWindow: { start: '08:00', end: '10:00', quality: 'Excellent' },
    },
};

// ─── Tithi calculation ──────────────────────────────────────────────────────

/** Known reference new moon: January 11, 2024 00:00 UTC */
const REFERENCE_NEW_MOON = new Date('2024-01-11T00:00:00Z');
const LUNAR_MONTH_DAYS = 29.5306;

/**
 * Calculate approximate tithi (1-30) for a given date.
 *
 * Uses synodic month from a known new-moon epoch.
 * Tithi 1 = Pratipada (first day after new moon)
 * Tithi 15 = Purnima (full moon)
 * Tithi 30 = Amavasya (new moon)
 *
 * @param {Date} date
 * @returns {number} tithi (1-30)
 */
function calculateApproximateTithi(date) {
    const daysSinceRef = (date.getTime() - REFERENCE_NEW_MOON.getTime()) / (1000 * 60 * 60 * 24);
    // Handle negative daysSinceRef (dates before reference)
    let lunarDayFraction = daysSinceRef % LUNAR_MONTH_DAYS;
    if (lunarDayFraction < 0) lunarDayFraction += LUNAR_MONTH_DAYS;
    const tithi = Math.floor((lunarDayFraction / LUNAR_MONTH_DAYS) * 30) + 1;
    return Math.min(Math.max(tithi, 1), 30);
}

// ─── Core muhurat computation ───────────────────────────────────────────────

/**
 * Get muhurat windows for a specific puja on a specific date.
 *
 * Returns null if the date is inauspicious for the puja.
 *
 * @param {string} pujaType — Key from PUJA_MUHURAT_RULES
 * @param {string} dateString — ISO date string e.g. "2024-06-15"
 * @returns {object|null} muhurat result or null if unavailable
 */
function getMuhuratForPujaOnDate(pujaType, dateString) {
    const date = new Date(dateString + 'T00:00:00Z');
    const vara = date.getUTCDay();        // 0=Sunday, 6=Saturday
    const month = date.getUTCMonth() + 1;  // 1-12
    const tithi = calculateApproximateTithi(date);

    const rules = PUJA_MUHURAT_RULES[pujaType];
    if (!rules) return null;

    // ─── Amavasya (tithi=30) → inauspicious for ALL pujas ─────────
    if (tithi === 30) return null;

    // ─── Blocked months (e.g. Vivah in Shravan) ───────────────────
    if (rules.blockedMonths && rules.blockedMonths.includes(month)) {
        return null;
    }

    // ─── Check tithi auspiciousness ───────────────────────────────
    if (!rules.goodTithis.includes(tithi)) {
        return null;
    }

    // ─── Check vara (weekday) auspiciousness ──────────────────────
    if (!rules.goodVaras.includes(vara)) {
        return null;
    }

    // ─── Build muhurat windows ────────────────────────────────────
    const windows = [];
    if (rules.morningWindow) {
        windows.push({
            startTime: rules.morningWindow.start,
            endTime: rules.morningWindow.end,
            quality: rules.morningWindow.quality,
            label: 'Pratah Muhurat',
        });
    }
    if (rules.mainWindow) {
        windows.push({
            startTime: rules.mainWindow.start,
            endTime: rules.mainWindow.end,
            quality: rules.mainWindow.quality,
            label: 'Madhyanha Muhurat',
        });
    }
    if (rules.eveningWindow) {
        windows.push({
            startTime: rules.eveningWindow.start,
            endTime: rules.eveningWindow.end,
            quality: rules.eveningWindow.quality,
            label: 'Sayanha Muhurat',
        });
    }

    return {
        pujaType,
        pujaName: PUJA_DISPLAY_NAMES[pujaType] || pujaType,
        date: dateString,
        tithi,
        tithiName: TITHI_NAMES[tithi - 1] || `Tithi ${tithi}`,
        vara,
        varaName: VARA_NAMES[vara],
        muhuratWindows: windows,
        bestWindow: windows.find((w) => w.quality === 'Excellent') || windows[0] || null,
    };
}

// ─── Monthly calendar builder ───────────────────────────────────────────────

/**
 * Generate muhurat calendar data for an entire month.
 *
 * @param {number} year  — e.g. 2024
 * @param {number} month — 1-12
 * @returns {object[]} array of { date, pujaCount, hasExcellent }
 */
function generateMonthlyCalendar(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-based, Date ctor is 0-based
    const pujaTypes = Object.keys(PUJA_MUHURAT_RULES);
    const calendarData = [];

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        let pujaCount = 0;
        let hasExcellent = false;

        for (const pujaType of pujaTypes) {
            const result = getMuhuratForPujaOnDate(pujaType, dateStr);
            if (result) {
                pujaCount++;
                if (result.bestWindow && result.bestWindow.quality === 'Excellent') {
                    hasExcellent = true;
                }
            }
        }

        calendarData.push({ date: dateStr, pujaCount, hasExcellent });
    }

    return calendarData;
}

// ─── Date detail builder ────────────────────────────────────────────────────

/**
 * Get all muhurat details for a specific date.
 *
 * @param {string} dateString — "YYYY-MM-DD"
 * @param {string|null} pujaTypeFilter — optional, filter to single puja
 * @returns {object} full muhurat report for the date
 */
function getDateDetails(dateString, pujaTypeFilter) {
    const date = new Date(dateString + 'T00:00:00Z');
    const vara = date.getUTCDay();
    const tithi = calculateApproximateTithi(date);

    const pujaTypes = pujaTypeFilter
        ? [pujaTypeFilter]
        : Object.keys(PUJA_MUHURAT_RULES);

    const availablePujas = [];
    const unavailablePujas = [];

    for (const pujaType of pujaTypes) {
        const result = getMuhuratForPujaOnDate(pujaType, dateString);
        if (result) {
            availablePujas.push(result);
        } else if (!pujaTypeFilter) {
            unavailablePujas.push(pujaType);
        }
    }

    // Build summary
    let summary = '';
    if (availablePujas.length === 0) {
        summary = 'No auspicious muhurat today.';
    } else {
        const bestOverall = availablePujas
            .flatMap((p) => p.muhuratWindows)
            .find((w) => w.quality === 'Excellent');

        if (bestOverall) {
            summary = `${availablePujas.length} puja${availablePujas.length > 1 ? 's' : ''} available today. Best window: ${bestOverall.startTime} – ${bestOverall.endTime}`;
        } else {
            const firstWindow = availablePujas[0]?.muhuratWindows[0];
            summary = `${availablePujas.length} puja${availablePujas.length > 1 ? 's' : ''} available today.${firstWindow ? ` Window: ${firstWindow.startTime} – ${firstWindow.endTime}` : ''}`;
        }
    }

    return {
        date: dateString,
        tithi,
        tithiName: TITHI_NAMES[tithi - 1] || `Tithi ${tithi}`,
        vara,
        varaName: VARA_NAMES[vara],
        availablePujas,
        unavailablePujas,
        summary,
    };
}

// ─── Date suggestion engine ─────────────────────────────────────────────────

/**
 * Suggest best dates for a specific puja within a range.
 *
 * @param {object} params
 * @param {string} params.pujaType
 * @param {string} params.from — "YYYY-MM-DD"
 * @param {string} params.to   — "YYYY-MM-DD"
 * @param {string} params.preferredTimeOfDay — morning|afternoon|evening|any
 * @param {number} params.maxSuggestions — max results
 * @returns {object[]} sorted auspicious dates
 */
function suggestDates({ pujaType, from, to, preferredTimeOfDay = 'any', maxSuggestions = 5 }) {
    const startDate = new Date(from + 'T00:00:00Z');
    const endDate = new Date(to + 'T00:00:00Z');
    const results = [];

    // Loop each day in range (max 365 days)
    const maxDays = 365;
    let daysProcessed = 0;

    for (let d = new Date(startDate); d <= endDate && daysProcessed < maxDays; d.setUTCDate(d.getUTCDate() + 1)) {
        daysProcessed++;
        const dateStr = d.toISOString().split('T')[0];
        const result = getMuhuratForPujaOnDate(pujaType, dateStr);
        if (!result) continue;

        // Filter by preferred time of day
        let filteredWindows = result.muhuratWindows;
        if (preferredTimeOfDay !== 'any') {
            filteredWindows = result.muhuratWindows.filter((w) => {
                const startHour = parseInt(w.startTime.split(':')[0], 10);
                switch (preferredTimeOfDay) {
                    case 'morning': return startHour < 12;
                    case 'afternoon': return startHour >= 12 && startHour < 16;
                    case 'evening': return startHour >= 16;
                    default: return true;
                }
            });
        }

        if (filteredWindows.length === 0) continue;

        const bestWindow = filteredWindows.find((w) => w.quality === 'Excellent') || filteredWindows[0];
        const quality = bestWindow.quality;

        results.push({
            date: dateStr,
            quality,
            bestWindow,
            allWindows: filteredWindows,
            tithi: result.tithi,
            tithiName: result.tithiName,
            vara: result.vara,
            varaName: result.varaName,
            reason: _buildReason(pujaType, result),
        });
    }

    // Sort: Excellent first, then Good, then by number of windows desc
    results.sort((a, b) => {
        const qualityOrder = { Excellent: 0, Good: 1 };
        const aq = qualityOrder[a.quality] ?? 2;
        const bq = qualityOrder[b.quality] ?? 2;
        if (aq !== bq) return aq - bq;
        return b.allWindows.length - a.allWindows.length;
    });

    return results.slice(0, maxSuggestions);
}

/**
 * Build a human-readable reason string for why a date is auspicious.
 * @private
 */
function _buildReason(pujaType, result) {
    const pujaName = PUJA_DISPLAY_NAMES[pujaType] || pujaType;
    const quality = result.bestWindow?.quality || 'Good';
    const parts = [`${result.tithiName} Tithi on ${result.varaName}`];

    if (quality === 'Excellent') {
        parts.push(`— highly auspicious for ${pujaName}`);
    } else {
        parts.push(`— auspicious for ${pujaName}`);
    }

    return parts.join(' ');
}

module.exports = {
    calculateApproximateTithi,
    getMuhuratForPujaOnDate,
    generateMonthlyCalendar,
    getDateDetails,
    suggestDates,
    PUJA_MUHURAT_RULES,
    PUJA_DISPLAY_NAMES,
    VARA_NAMES,
    TITHI_NAMES,
};
