"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, PanditCard, Skeleton, GuestBanner } from "@hmarepanditji/ui";

const SUPPORTED_PUJA_TYPES = [
    "Vivah",
    "Griha Pravesh",
    "Satyanarayan Puja",
    "Mundan",
    "Namkaran",
];

const SUPPORTED_LANGUAGES = ["Hindi", "Sanskrit", "English", "Marathi", "Gujarati", "Bengali", "Tamil", "Telugu"];
const TRAVEL_MODES = [
    { label: "🚗 Self-Drive", value: "SELF_DRIVE" },
    { label: "🚂 Train", value: "TRAIN" },
    { label: "✈️ Flight", value: "FLIGHT" },
    { label: "🚕 Cab", value: "CAB" },
    { label: "Any", value: "ANY" }
];

interface Pandit {
    id: string;
    name: string;
    profilePhotoUrl?: string;
    rating: number;
    totalReviews: number;
    completedBookings: number;
    experienceYears: number;
    location: string;
    specializations: string[];
    languages: string[];
    verificationStatus: string;
    travelPreferences: Record<string, unknown>;
    isOnline: boolean;
    pujaServices: { pujaType: string; dakshinaAmount: number; durationHours: number }[];
}

function SearchPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [pandits, setPandits] = useState<Pandit[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [travelOptions, setTravelOptions] = useState<Record<string, unknown[]>>({});
    const [favorites, setFavorites] = useState<string[]>([]);
    const [showMobileFilter, setShowMobileFilter] = useState(false);

    // Filters from URL
    const pujaType = searchParams.get("pujaType") || "";
    const city = searchParams.get("city") || "";
    const date = searchParams.get("date") || "";
    const budget = searchParams.get("budget") || "";
    const minRating = searchParams.get("rating") || "";
    const lang = searchParams.get("lang") || "";
    const travelMode = searchParams.get("travelMode") || "";
    const distance = searchParams.get("distance") || "";
    const sort = searchParams.get("sort") || "rating";
    const pageParam = parseInt(searchParams.get("page") || "1", 10);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Local state for UI inputs (to avoid spamming URL updates on every keystroke)
    const [localCity, setLocalCity] = useState(city);
    const [localDate, setLocalDate] = useState(date);
    const [localBudget, setLocalBudget] = useState(budget ? parseInt(budget, 10) : 50000);
    const [localDistance, setLocalDistance] = useState(distance ? parseInt(distance, 10) : 500);
    const [muhuratCount, setMuhuratCount] = useState<number | null>(null);

    const updateFilters = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        // reset page to 1 when filters change
        if (key !== "page") params.set("page", "1");
        router.push(`/search?${params.toString()}`);
    };

    const removeFilter = (key: string) => updateFilters(key, null);

    const fetchPandits = useCallback(async () => {
        setLoading(true);
        try {
            const q = new URLSearchParams();
            if (pujaType) q.append("pujaType", pujaType);
            if (city) q.append("city", city);
            if (date) q.append("date", date);
            if (minRating) q.append("minRating", minRating);
            if (lang) q.append("language", lang);
            if (travelMode && travelMode !== "ANY") q.append("travelMode", travelMode);
            if (budget) q.append("maxDakshina", budget);
            if (distance) q.append("maxDistance", distance);
            q.append("sort", sort);
            q.append("page", pageParam.toString());
            q.append("limit", "12");

            const res = await fetch(`http://localhost:3001/api/v1/pandits?${q.toString()}`);
            if (!res.ok) throw new Error("Failed to load pandits");
            const data = await res.json();

            if (pageParam === 1) {
                setPandits(data.data.pandits);
            } else {
                setPandits(prev => [...prev, ...data.data.pandits]);
            }
            setTotal(data.data.pagination.total);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [pujaType, city, date, minRating, lang, travelMode, budget, distance, sort, pageParam]);

    const checkMuhurats = async () => {
        if (!localDate) return;
        try {
            const res = await fetch(`http://localhost:3001/api/v1/muhurat/pujas-for-date?date=${localDate}`);
            if (res.ok) {
                const data = await res.json();
                // just count how many muhurats available a given day
                if (data.data?.muhurats) {
                    setMuhuratCount(data.data.muhurats.length);
                } else {
                    setMuhuratCount(0);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const calculateTravel = useCallback(async (currentPandits: Pandit[]) => {
        if (!city) return;
        const requests = currentPandits
            .filter((p) => p.location.toLowerCase() !== city.toLowerCase())
            .map((p) => ({
                fromCity: p.location.split(",")[0].trim(),
                toCity: city,
                panditId: p.id,
            }));

        if (requests.length === 0) return;

        try {
            const res = await fetch("http://localhost:3001/api/v1/travel/batch-calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requests: requests.slice(0, 20), // batch-limit 20
                    eventDays: 1,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setTravelOptions((prev) => ({ ...prev, ...data.data.results }));
            }
        } catch (err) {
            console.error("Travel calc failed", err);
        }
    }, [city]);

    const fetchFavorites = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch("http://localhost:3001/api/v1/customers/me/favorites", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setFavorites(data.data || []);
            }
        } catch (err) {
            console.error(err);
        }
    }, [token]);

    useEffect(() => {
        fetchPandits();
    }, [fetchPandits]);

    useEffect(() => {
        if (pandits.length > 0 && city) {
            calculateTravel(pandits);
        }
    }, [pandits, city, calculateTravel]);

    useEffect(() => {
        if (token) fetchFavorites();
    }, [fetchFavorites, token]);

    const toggleFavorite = async (panditId: string) => {
        if (!token) {
            router.push(`/login?next=/search?${searchParams.toString()}`);
            return;
        }
        const isFav = favorites.includes(panditId);
        setFavorites(prev => isFav ? prev.filter(id => id !== panditId) : [...prev, panditId]);
        try {
            await fetch(`http://localhost:3001/api/v1/customers/me/favorites/${panditId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Toggle fav failed", err);
            // Revert optimism
            setFavorites(prev => isFav ? [...prev, panditId] : prev.filter(id => id !== panditId));
        }
    };

    const numFiltersApplied = [pujaType, city, date, minRating, lang, travelMode, budget, distance].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Top Bar (Sticky) */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex gap-2 text-sm text-gray-700 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                        <select
                            className="px-3 py-2 border rounded-md"
                            value={pujaType}
                            onChange={(e) => updateFilters("pujaType", e.target.value)}
                        >
                            <option value="">Puja Type ▾</option>
                            {SUPPORTED_PUJA_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <input
                            type="text"
                            placeholder="City"
                            className="px-3 py-2 border rounded-md w-32"
                            value={localCity}
                            onChange={(e) => setLocalCity(e.target.value)}
                            onBlur={() => updateFilters("city", localCity)}
                            onKeyDown={(e) => e.key === "Enter" && updateFilters("city", localCity)}
                        />
                        <input
                            type="date"
                            className="px-3 py-2 border rounded-md"
                            value={localDate}
                            onChange={(e) => { setLocalDate(e.target.value); updateFilters("date", e.target.value); }}
                        />
                    </div>

                    <div className="flex gap-2 items-center w-full sm:w-auto justify-between sm:justify-end">
                        <span className="text-gray-500 text-sm hidden sm:inline">Sort by:</span>
                        <select
                            className="text-sm px-2 py-1 border rounded"
                            value={sort}
                            onChange={(e) => updateFilters("sort", e.target.value)}
                        >
                            <option value="rating">Best Match</option>
                            <option value="price_asc">Price: Low - High</option>
                            <option value="price_desc">Price: High - Low</option>
                            <option value="distance">Distance</option>
                        </select>
                        <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowMobileFilter(true)}>
                            Filters {numFiltersApplied > 0 && `(${numFiltersApplied})`}
                        </Button>
                    </div>
                </div>

                {/* Active Filters Pills */}
                {numFiltersApplied > 0 && (
                    <div className="max-w-7xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto bg-gray-50 border-t border-gray-100">
                        {pujaType && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs flex items-center">{pujaType} <button onClick={() => removeFilter("pujaType")} className="ml-1 text-orange-500 font-bold hover:text-orange-900">×</button></span>}
                        {city && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs flex items-center">{city} <button onClick={() => removeFilter("city")} className="ml-1 text-orange-500 font-bold hover:text-orange-900">×</button></span>}
                        {date && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs flex items-center">{date} <button onClick={() => removeFilter("date")} className="ml-1 text-orange-500 font-bold hover:text-orange-900">×</button></span>}
                        {minRating && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs flex items-center">{minRating}★+ <button onClick={() => removeFilter("rating")} className="ml-1 text-orange-500 font-bold hover:text-orange-900">×</button></span>}
                        {lang && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs flex items-center">{lang} <button onClick={() => removeFilter("lang")} className="ml-1 text-orange-500 font-bold hover:text-orange-900">×</button></span>}
                        {travelMode && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs flex items-center">Mode: {travelMode} <button onClick={() => removeFilter("travelMode")} className="ml-1 text-orange-500 font-bold hover:text-orange-900">×</button></span>}
                        <button className="text-sm text-gray-500 underline ml-2" onClick={() => router.push("/search")}>Clear All</button>
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 flex w-full gap-6 flex-1">
                {/* Sidebar Filters */}
                <aside className={`w-full lg:w-64 bg-white p-4 rounded-md shadow-sm border border-gray-200 lg:block flex-shrink-0
          ${showMobileFilter ? 'fixed inset-0 z-50 overflow-y-auto block' : 'hidden'}
        `}>
                    <div className="flex justify-between items-center mb-6 lg:hidden">
                        <h2 className="text-lg font-bold">Filters</h2>
                        <button onClick={() => setShowMobileFilter(false)} className="text-gray-500 text-2xl">×</button>
                    </div>

                    {/* Puja Type */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">Puja Type</h3>
                        <div className="flex flex-col gap-2">
                            {SUPPORTED_PUJA_TYPES.map(p => (
                                <label key={p} className="flex items-center gap-2 text-sm text-gray-600">
                                    <input type="radio" name="pujaType" checked={pujaType === p} onChange={() => updateFilters("pujaType", p)} className="accent-orange-500" /> {p}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Date & Muhurat */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">Date</h3>
                        <input
                            type="date"
                            className="px-3 py-2 border rounded-md w-full mb-2 text-sm"
                            value={localDate}
                            onChange={(e) => setLocalDate(e.target.value)}
                            onBlur={() => updateFilters("date", localDate)}
                        />
                        <Button size="sm" variant="outline" className="w-full text-xs" onClick={checkMuhurats}>Check Muhurat</Button>
                        {muhuratCount !== null && (
                            <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                                🔶 {muhuratCount} auspicious muhurat{muhuratCount !== 1 && 's'} on this date
                            </div>
                        )}
                    </div>

                    {/* Budget */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">Max Dakshina (₹)</h3>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>₹5,000</span>
                            <span>₹{localBudget.toLocaleString()}</span>
                            <span>₹1,00,000</span>
                        </div>
                        <input
                            type="range" min="5000" max="100000" step="5000"
                            className="w-full accent-orange-500"
                            value={localBudget}
                            onChange={(e) => setLocalBudget(parseInt(e.target.value, 10))}
                            onMouseUp={() => updateFilters("budget", localBudget.toString())}
                            onTouchEnd={() => updateFilters("budget", localBudget.toString())}
                        />
                        <div className="flex flex-wrap gap-1 mt-2">
                            <button onClick={() => { setLocalBudget(15000); updateFilters("budget", "15000"); }} className="text-[10px] px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-gray-700">Under 15k</button>
                            <button onClick={() => { setLocalBudget(40000); updateFilters("budget", "40000"); }} className="text-[10px] px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-gray-700">Under 40k</button>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">Minimum Rating</h3>
                        <div className="flex gap-2">
                            {["4.5", "4", "3", "Any"].map(r => (
                                <button
                                    key={r}
                                    onClick={() => updateFilters("rating", r === "Any" ? null : r)}
                                    className={`text-xs px-2 py-1 border rounded ${minRating === r || (r === "Any" && !minRating) ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {r === "Any" ? r : `${r}★+`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Languages */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">Languages</h3>
                        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                            {SUPPORTED_LANGUAGES.map(l => (
                                <label key={l} className="flex items-center gap-2 text-sm text-gray-600">
                                    <input type="radio" name="languageRadio" checked={lang === l} onChange={() => updateFilters("lang", l)} className="accent-orange-500" /> {l}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Travel Mode */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">Travel Mode</h3>
                        <div className="flex flex-wrap gap-2">
                            {TRAVEL_MODES.map(tm => (
                                <button
                                    key={tm.value}
                                    onClick={() => updateFilters("travelMode", tm.value)}
                                    className={`text-xs px-2 py-1 rounded-full border ${travelMode === tm.value ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                                >
                                    {tm.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Distance */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">Max Distance (km)</h3>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>0</span>
                            <span>{localDistance} km</span>
                            <span>2000</span>
                        </div>
                        <input
                            type="range" min="10" max="2000" step="10"
                            className="w-full accent-orange-500"
                            value={localDistance}
                            onChange={(e) => setLocalDistance(parseInt(e.target.value, 10))}
                            onMouseUp={() => updateFilters("distance", localDistance.toString())}
                            onTouchEnd={() => updateFilters("distance", localDistance.toString())}
                        />
                        <div className="flex flex-wrap gap-1 mt-2">
                            <button onClick={() => { setLocalDistance(50); updateFilters("distance", "50") }} className="text-[10px] px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-gray-700">Local (&lt;50)</button>
                            <button onClick={() => { setLocalDistance(500); updateFilters("distance", "500") }} className="text-[10px] px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-gray-700">Regional (&lt;500)</button>
                        </div>
                    </div>

                    {showMobileFilter && (
                        <div className="sticky bottom-4">
                            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={() => setShowMobileFilter(false)}>Show Results</Button>
                        </div>
                    )}
                </aside>

                {/* Results Grid */}
                <main className="flex-1 w-full flex flex-col">
                    {!token && <GuestBanner onLoginClick={() => router.push("/login")} />}

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-medium text-gray-800">
                            Showing {pandits.length} verified Pandit{pandits.length !== 1 ? 's' : ''}
                        </h2>
                    </div>

                    {loading && pageParam === 1 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} variant="card" />
                            ))}
                        </div>
                    ) : pandits.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 text-center">
                            <div className="text-5xl mb-4 text-gray-300">🔍</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No pandits found</h3>
                            <p className="text-gray-500 max-w-sm mb-6">
                                Try expanding your distance filter, removing some filters, or checking a different date.
                            </p>
                            <Button variant="outline" onClick={() => router.push("/search")}>Clear All Filters</Button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch w-full">
                                {pandits.map(p => {
                                    const rawOptions = travelOptions[p.id] || [];
                                    const options = Array.isArray(rawOptions) ? rawOptions.map((o: unknown) => {
                                        const opt = o as { mode?: string; totalCost?: number; description?: string };
                                        return {
                                            mode: (opt.mode?.toUpperCase() || 'SELF_DRIVE') as any,
                                            label: opt.mode || 'Self Drive',
                                            price: opt.totalCost || 0,
                                            description: opt.description
                                        };
                                    }) : [];

                                    return (
                                        <div key={p.id} className="relative">
                                            <button
                                                onClick={() => toggleFavorite(p.id)}
                                                className={`absolute top-4 right-4 z-10 p-2 rounded-full shadow-sm hover:scale-110 transition-transform ${favorites.includes(p.id) ? 'bg-red-50 text-red-500' : 'bg-white border border-slate-200 text-slate-400 hover:text-red-500'}`}
                                            >
                                                {favorites.includes(p.id) ? '♥' : '♡'}
                                            </button>
                                            <PanditCard
                                                id={p.id}
                                                name={p.name}
                                                photoUrl={p.profilePhotoUrl}
                                                rating={p.rating}
                                                totalReviews={p.totalReviews}
                                                experienceYears={p.experienceYears}
                                                location={p.location}
                                                specializations={p.specializations}
                                                isVerified={p.verificationStatus === 'VERIFIED'}
                                                travelModes={options.length > 0 ? options : undefined}
                                                onBook={(id, mode) => router.push(`/booking/new?panditId=${id}&pujaType=${pujaType || ''}&travelMode=${mode}`)}
                                                onViewProfile={(id) => router.push(`/pandit/${id}`)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {total > pandits.length && (
                                <div className="mt-10 flex flex-col items-center">
                                    <p className="text-sm text-gray-500 mb-4">Showing {pandits.length} of {total} results</p>
                                    <Button
                                        variant="outline"
                                        onClick={() => updateFilters("page", (pageParam + 1).toString())}
                                        disabled={loading}
                                    >
                                        {loading ? "Loading..." : "Load More"}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen bg-gray-50 p-10"><Skeleton variant="card" /></div>}>
            <SearchPageContent />
        </React.Suspense>
    );
}
