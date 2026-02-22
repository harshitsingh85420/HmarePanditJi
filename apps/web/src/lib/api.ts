const API_BASE = process.env.API_URL || 'http://localhost:3001';

export async function getFeaturedPandits() {
    try {
        const res = await fetch(
            `${API_BASE}/api/pandits?sort=rating_desc&limit=6&verificationStatus=VERIFIED`,
            { next: { revalidate: 300 } } // ISR: revalidate every 5 minutes
        );
        if (!res.ok) return [];
        const data = await res.json();
        return data.data?.pandits || data.data || [];
    } catch (err) {
        console.error("Failed to fetch featured pandits:", err);
        return [];
    }
}

export async function getMuhuratDates(month: number, year: number) {
    try {
        const res = await fetch(
            `${API_BASE}/api/muhurat/dates?month=${month}&year=${year}`,
            { next: { revalidate: 3600 } } // revalidate hourly
        );
        if (!res.ok) return [];
        const data = await res.json();
        return data.data?.dates || [];
    } catch (err) {
        console.error("Failed to fetch muhurat dates:", err);
        return [];
    }
}

export async function getUpcomingMuhurat(limit: number = 3) {
    try {
        const res = await fetch(
            `${API_BASE}/api/muhurat/upcoming?limit=${limit}`,
            { next: { revalidate: 3600 } }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return data.data?.dates || [];
    } catch (err) {
        console.error("Failed to fetch upcoming muhurat:", err);
        return [];
    }
}
