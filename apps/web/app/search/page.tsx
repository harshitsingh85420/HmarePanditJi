"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, PanditCard, Skeleton, GuestBanner } from "@hmarepanditji/ui";
import { LoginModal } from "@/components/LoginModal";

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

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1`;

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

    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState("");

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

            const res = await fetch(`${API_BASE}/pandits?${q.toString()}`);
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
            const res = await fetch(`${API_BASE}/muhurat/pujas-for-date?date=${localDate}`);
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
            const res = await fetch(`${API_BASE}/travel/batch-calculate`, {
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
            const res = await fetch(`${API_BASE}/customers/me/favorites`, {
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
            await fetch(`${API_BASE}/customers/me/favorites/${panditId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Toggle fav failed", err);
            // Revert optimism
            setFavorites(prev => isFav ? [...prev, panditId] : prev.filter(id => id !== panditId));
        }
    };

    const handleBookClick = (id: string, mode: string) => {
        const url = `/booking/new?panditId=${id}&pujaType=${pujaType || ''}&travelMode=${mode}`;
        if (!token) {
            setRedirectUrl(url);
            setLoginModalOpen(true);
        } else {
            router.push(url);
        }
    };

    const numFiltersApplied = [pujaType, city, date, minRating, lang, travelMode, budget, distance].filter(Boolean).length;

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-[calc(100vh-64px)]">
            <main className="max-w-[1440px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-64px)] relative">

                {/* Mobile Filter Toggle */}
                <div className="lg:hidden p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-background-dark">
                    <h2 className="text-lg font-bold">Search Filters</h2>
                    <Button variant="outline" size="sm" onClick={() => setShowMobileFilter(!showMobileFilter)}>
                        {showMobileFilter ? 'Hide Filters' : `Filters ${numFiltersApplied > 0 ? `(${numFiltersApplied})` : ''}`}
                    </Button>
                </div>

                {/* Sidebar Filters */}
                <aside className={`w-full lg:w-[320px] lg:sticky lg:top-16 h-fit p-6 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 overflow-y-auto z-10 
                    ${showMobileFilter ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900 block' : 'hidden lg:block'}
                `}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold">Advanced Filters</h2>
                        <div className="flex items-center gap-2">
                            {numFiltersApplied > 0 && (
                                <button onClick={() => router.push("/search")} className="text-primary text-xs font-semibold uppercase tracking-wider hover:underline">Reset</button>
                            )}
                            <button className="lg:hidden text-slate-500 font-bold ml-4" onClick={() => setShowMobileFilter(false)}>✕</button>
                        </div>
                    </div>

                    <div className="space-y-8 pb-20 lg:pb-0">
                        {/* Puja Type */}
                        <div>
                            <label className="block text-sm font-semibold mb-3">Service Type</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">festival</span>
                                <select
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-primary outline-none focus:border-primary"
                                    value={pujaType}
                                    onChange={(e) => updateFilters("pujaType", e.target.value)}
                                >
                                    <option value="">Any Service</option>
                                    {SUPPORTED_PUJA_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-semibold mb-3">Location</label>
                            <div className="relative flex flex-col gap-2">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">location_on</span>
                                    <input
                                        type="text"
                                        placeholder="City Name"
                                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-primary focus:border-primary outline-none"
                                        value={localCity}
                                        onChange={(e) => setLocalCity(e.target.value)}
                                        onBlur={() => updateFilters("city", localCity)}
                                        onKeyDown={(e) => e.key === "Enter" && updateFilters("city", localCity)}
                                    />
                                </div>

                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-slate-500">Max Distance:</span>
                                        <span className="text-xs font-bold text-orange-500">{localDistance} km</span>
                                    </div>
                                    <input
                                        type="range" min="10" max="2000" step="10"
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                        value={localDistance}
                                        onChange={(e) => setLocalDistance(parseInt(e.target.value, 10))}
                                        onMouseUp={() => updateFilters("distance", localDistance.toString())}
                                        onTouchEnd={() => updateFilters("distance", localDistance.toString())}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Date/Muhurat */}
                        <div>
                            <label className="block text-sm font-semibold mb-3">Muhurat Date</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">calendar_month</span>
                                <input
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-primary focus:border-primary outline-none"
                                    type="date"
                                    value={localDate}
                                    onChange={(e) => { setLocalDate(e.target.value); updateFilters("date", e.target.value); }}
                                />
                            </div>
                            {muhuratCount !== null && (
                                <div className="mt-2 text-xs text-orange-600 bg-orange-50/50 p-2 rounded-lg border border-orange-200 flex flex-col gap-1">
                                    <span className="font-bold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                        {muhuratCount} auspicious muhurat{muhuratCount !== 1 ? 's' : ''} on this date!
                                    </span>
                                </div>
                            )}
                            <button onClick={checkMuhurats} className="mt-2 text-xs font-bold text-primary hover:underline">Check daily muhurats →</button>
                        </div>

                        {/* Budget */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-semibold">Max Dakshina</label>
                                <span className="text-xs text-slate-500 font-medium line-clamp-1">₹5k - ₹{localBudget >= 1000 ? `${(localBudget / 1000).toFixed(0)}k` : localBudget}</span>
                            </div>
                            <input
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                type="range"
                                min="5000" max="100000" step="5000"
                                value={localBudget}
                                onChange={(e) => setLocalBudget(parseInt(e.target.value, 10))}
                                onMouseUp={() => updateFilters("budget", localBudget.toString())}
                                onTouchEnd={() => updateFilters("budget", localBudget.toString())}
                            />
                        </div>

                        {/* Minimum Rating */}
                        <div>
                            <label className="block text-sm font-semibold mb-3">Minimum Rating</label>
                            <div className="grid grid-cols-4 gap-2">
                                {["Any", "3", "4", "4.5"].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => updateFilters("rating", r === "Any" ? null : r)}
                                        className={`flex items-center justify-center gap-1 py-2 text-xs font-bold rounded-xl transition-colors ${minRating === r || (r === "Any" && !minRating) ? 'bg-primary/10 text-primary border border-primary shadow-sm shadow-primary/10' : 'bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
                                    >
                                        {r !== "Any" && <span className="material-symbols-outlined text-[10px] fill-1">star</span>}
                                        {r === "Any" ? "Any" : `${r}+`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Travel Preferences */}
                        <div>
                            <label className="block text-sm font-semibold mb-3">Modes allowed</label>
                            <div className="flex flex-wrap gap-2">
                                {TRAVEL_MODES.map(tm => (
                                    <button
                                        key={tm.value}
                                        onClick={() => updateFilters("travelMode", tm.value)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${travelMode === tm.value
                                            ? 'border border-primary bg-primary text-white shadow-md'
                                            : 'bg-white border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary dark:bg-slate-800'
                                            }`}
                                    >
                                        {tm.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Apply Filters (Mobile) */}
                        {showMobileFilter && (
                            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 shadow-xl">
                                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl shadow-lg font-bold" onClick={() => setShowMobileFilter(false)}>Show Results</Button>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content Area */}
                <section className="flex-1 p-4 lg:p-10 spiritual-pattern relative min-h-screen">
                    {!token && <div className="mb-6"><GuestBanner onLoginClick={() => router.push("/login")} /></div>}

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            {loading && pageParam === 1 ? (
                                <h2 className="text-2xl font-bold">Searching Pandits...</h2>
                            ) : (
                                <h2 className="text-2xl font-bold">{total} Pandits match your search</h2>
                            )}
                            <p className="text-slate-500 text-sm mt-1">
                                {city || pujaType ? `Found in ${city || 'all regions'} ${pujaType ? `for ${pujaType}` : ''}` : 'Showing all verified Pandits'}
                            </p>

                            {/* Active Filters Pills inline */}
                            {numFiltersApplied > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {pujaType && <span className="bg-white border border-slate-200 shadow-sm text-slate-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center">{pujaType} <button onClick={() => removeFilter("pujaType")} className="ml-1 hover:text-red-500 font-black text-xs">×</button></span>}
                                    {city && <span className="bg-white border border-slate-200 shadow-sm text-slate-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center">{city} <button onClick={() => removeFilter("city")} className="ml-1 hover:text-red-500 font-black text-xs">×</button></span>}
                                    {date && <span className="bg-white border border-slate-200 shadow-sm text-slate-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center">{date} <button onClick={() => removeFilter("date")} className="ml-1 hover:text-red-500 font-black text-xs">×</button></span>}
                                    {travelMode && travelMode !== "ANY" && <span className="bg-white border border-slate-200 shadow-sm text-slate-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center">Travel: {travelMode.replace('_', ' ')} <button onClick={() => removeFilter("travelMode")} className="ml-1 hover:text-red-500 font-black text-xs">×</button></span>}
                                    {budget && <span className="bg-white border border-slate-200 shadow-sm text-slate-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center">&lt;₹{parseInt(budget, 10) / 1000}k <button onClick={() => removeFilter("budget")} className="ml-1 hover:text-red-500 font-black text-xs">×</button></span>}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <span className="material-symbols-outlined text-slate-400 text-sm">sort</span>
                            <span className="text-sm font-semibold text-slate-500">Sort:</span>
                            <select
                                className="bg-transparent border-none text-sm font-bold text-slate-800 dark:text-slate-200 focus:ring-0 cursor-pointer p-0"
                                value={sort}
                                onChange={(e) => updateFilters("sort", e.target.value)}
                            >
                                <option value="rating">Best Match</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="distance">Distance Nearby</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Grid */}
                    {loading && pageParam === 1 ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} variant="card" />
                            ))}
                        </div>
                    ) : pandits.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">search_off</span>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No pandits found matching criteria</h3>
                            <p className="text-slate-500 max-w-sm mb-6">
                                Try expanding your budget, adjusting the distance filter, changing travel modes, or selecting a different date.
                            </p>
                            <button className="bg-primary hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all" onClick={() => router.push("/search")}>Clear All Filters</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {pandits.map(p => {
                                const rawOptions = travelOptions[p.id] || [];
                                const options = Array.isArray(rawOptions) ? rawOptions.map((o: unknown) => {
                                    const opt = o as { mode?: string; totalCost?: number; description?: string };
                                    return {
                                        mode: (opt.mode?.toLowerCase() || 'self_drive') as any,
                                        label: opt.mode || 'Self Drive',
                                        totalCost: opt.totalCost || 0,
                                        price: opt.totalCost || 0,
                                        description: opt.description
                                    };
                                }) : [];

                                return (
                                    <div key={p.id} className="relative group min-w-0">
                                        <button
                                            onClick={() => toggleFavorite(p.id)}
                                            className={`absolute top-4 right-4 z-10 w-9 h-9 flex justify-center items-center rounded-full shadow-md bg-white border border-slate-100 transition-all ${favorites.includes(p.id) ? 'text-red-500 hover:scale-110' : 'text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100'}`}
                                        >
                                            <span className={`material-symbols-outlined ${favorites.includes(p.id) ? 'fill-1' : ''} text-lg block leading-none`}>favorite</span>
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
                                            isVerified={p.verificationStatus === "VERIFIED"}
                                            travelModes={options.length > 0 ? options.map(o => ({
                                                mode: (o.mode?.toUpperCase() || "SELF_DRIVE") as any,
                                                label: o.label || "Self Drive",
                                                price: o.price || 0,
                                                description: o.description
                                            })) : undefined}
                                            onBook={(id, mode) => handleBookClick(id, mode as string)}
                                            onViewProfile={(id) => router.push(`/pandit/${id}`)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination or Load More */}
                    {total > pandits.length && !loading && (
                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={() => updateFilters("page", (pageParam + 1).toString())}
                                className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-8 py-4 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            >
                                Load More Results
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                            </button>
                        </div>
                    )}
                    {loading && pageParam > 1 && (
                        <div className="mt-12 flex justify-center">
                            <button disabled className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 px-8 py-4 rounded-xl font-bold text-sm shadow-sm">
                                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                Loading...
                            </button>
                        </div>
                    )}
                </section>
            </main>

            {loginModalOpen && (
                <LoginModal
                    isOpen={loginModalOpen}
                    onClose={() => setLoginModalOpen(false)}
                    redirectAfterLogin={redirectUrl}
                />
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen bg-background-light p-10"><Skeleton variant="card" /></div>}>
            <SearchPageContent />
        </React.Suspense>
    );
}
