"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, API_BASE } from "../../../context/auth-context";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FavoritePandit {
    id: string;
    panditId: string;
    displayName: string;
    profilePhotoUrl?: string;
    city: string;
    averageRating: number;
    totalReviews: number;
    specializations: string[];
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_FAVORITES: FavoritePandit[] = [
    { id: "f1", panditId: "p1", displayName: "Pt. Ramesh Sharma Shastri", city: "Dwarka", averageRating: 4.9, totalReviews: 312, specializations: ["Vivah Sanskar", "Griha Pravesh"] },
    { id: "f2", panditId: "p2", displayName: "Pt. Suresh Mishra Vedacharya", city: "Rohini", averageRating: 4.8, totalReviews: 187, specializations: ["Satyanarayan Katha", "Rudrabhishek"] },
    { id: "f3", panditId: "p3", displayName: "Pt. Dinesh Kumar Joshi", city: "Noida", averageRating: 4.7, totalReviews: 243, specializations: ["Namkaran Sanskar", "Mundan Sanskar"] },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function FavoritesPage() {
    const { user, accessToken, openLoginModal, loading: authLoading } = useAuth();
    const router = useRouter();
    const [favorites, setFavorites] = useState<FavoritePandit[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);
    const [toast, setToast] = useState("");

    useEffect(() => {
        if (!authLoading && !user) openLoginModal();
    }, [authLoading, user, openLoginModal]);

    const fetchFavorites = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/customers/favorites`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                signal: AbortSignal.timeout(5000),
            });
            if (!res.ok) throw new Error();
            const j = await res.json();
            const data = j.data ?? j;
            if (Array.isArray(data)) setFavorites(data);
            else setFavorites(MOCK_FAVORITES);
        } catch {
            setFavorites(MOCK_FAVORITES);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        if (user && accessToken) fetchFavorites();
    }, [user, accessToken, fetchFavorites]);

    const removeFavorite = async (fav: FavoritePandit) => {
        setRemoving(fav.id);
        try {
            await fetch(`${API_BASE}/customers/favorites/${fav.panditId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
            setToast(`${fav.displayName} removed from favorites`);
            setTimeout(() => setToast(""), 3000);
        } catch {
            setToast("Could not remove. Try again.");
            setTimeout(() => setToast(""), 3000);
        } finally {
            setRemoving(null);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#f49d25] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-rose-500" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    </div>
                    <h2 className="text-slate-700 font-semibold text-lg mb-2">Sign in to view favorites</h2>
                    <p className="text-slate-400 text-sm mb-6">Save your favorite pandits for quick booking.</p>
                    <button onClick={openLoginModal} className="px-6 py-2.5 bg-[#f49d25] hover:bg-[#e08c14] text-white rounded-xl font-semibold text-sm transition-colors">
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f7f5]">
            {/* Header */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-2xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-3 mb-1">
                        <button onClick={() => router.push("/dashboard")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors" aria-label="Back">
                            <span className="material-symbols-outlined text-slate-500">arrow_back</span>
                        </button>
                        <h1 className="text-xl font-bold text-slate-800">My Favorites</h1>
                    </div>
                    <p className="text-sm text-slate-400 ml-11">Pandits you&apos;ve saved for quick access</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-40 bg-slate-200 rounded" />
                                        <div className="h-3 w-24 bg-slate-200 rounded" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : favorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-3xl text-rose-400">favorite_border</span>
                        </div>
                        <h3 className="text-slate-700 font-semibold text-lg mb-1">No favorites yet</h3>
                        <p className="text-slate-400 text-sm mb-6">Browse pandits and tap the ❤️ to save them here.</p>
                        <Link href="/search" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f49d25] hover:bg-[#e08c14] text-white rounded-xl font-medium text-sm transition-colors">
                            <span className="material-symbols-outlined text-sm">search</span>
                            Find a Pandit
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {favorites.map((fav) => (
                            <div key={fav.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                    <Link href={`/pandit/${fav.panditId}`} className="shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-[#f49d25]/10 border border-[#f49d25]/20 flex items-center justify-center overflow-hidden">
                                            {fav.profilePhotoUrl ? (
                                                <img src={fav.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-[#f49d25]">person</span>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/pandit/${fav.panditId}`} className="hover:text-[#f49d25] transition-colors">
                                            <h3 className="font-semibold text-slate-800 truncate">{fav.displayName}</h3>
                                        </Link>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                            <span className="flex items-center gap-0.5">
                                                <span className="material-symbols-outlined text-[#f49d25] text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                {fav.averageRating}
                                            </span>
                                            <span>·</span>
                                            <span>{fav.totalReviews} reviews</span>
                                            <span>·</span>
                                            <span>{fav.city}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {fav.specializations.slice(0, 3).map((s) => (
                                                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <button
                                            onClick={() => removeFavorite(fav)}
                                            disabled={removing === fav.id}
                                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-50 transition-colors group"
                                            title="Remove from favorites"
                                        >
                                            {removing === fav.id ? (
                                                <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <span className="material-symbols-outlined text-rose-400 group-hover:text-rose-600 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                    favorite
                                                </span>
                                            )}
                                        </button>
                                        <Link
                                            href={`/booking/new?panditId=${fav.panditId}`}
                                            className="text-xs px-3 py-1.5 bg-[#f49d25]/10 text-[#c47c0e] rounded-lg hover:bg-[#f49d25]/20 transition-colors font-medium"
                                        >
                                            Book
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-[slideUp_0.3s_ease-out]">
                    {toast}
                </div>
            )}
        </div>
    );
}
