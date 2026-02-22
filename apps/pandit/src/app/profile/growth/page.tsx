"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";

export default function GrowthPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem("panditToken");
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/pandits/me/growth`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) setData(json.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="py-8 flex justify-center mt-20">
                <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) {
        return <div className="p-8 text-center text-red-500">Failed to load data</div>;
    }

    const { tier, nextTier, badges, performance, recentReviews } = data;
    const progressPercent = nextTier ? Math.min(100, Math.round((data.completedBookings / (data.completedBookings + nextTier.bookingsNeeded)) * 100)) : 100;

    return (
        <div className="py-8 space-y-6 max-w-4xl mx-auto px-4 sm:px-0">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">उपलब्धियां और ग्रोथ</h1>
                    <p className="text-slate-500 text-sm mt-1">जितनी ज़्यादा पूजाएं, उतनी ज़्यादा बैज</p>
                </div>
                <Link href="/profile" className="text-primary text-sm font-semibold hover:underline">
                    &larr; प्रोफाइल पर वापस
                </Link>
            </div>

            {/* SECTION A: Tier */}
            <div className="bg-white rounded-2xl border border-primary/10 shadow-sm p-6 text-center">
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-amber-400 bg-amber-50 flex items-center justify-center text-4xl sm:text-6xl shadow-inner">
                        {tier.icon}
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mt-4">{tier.name}</h2>

                    <ul className="text-sm text-slate-600 mt-3 space-y-1">
                        <li>• प्राथमिकता सर्च में दिखाई देते हैं</li>
                        <li>• प्रोफाइल पर {tier.name} बैज दिखता है</li>
                    </ul>

                    {nextTier && (
                        <div className="mt-6 w-full max-w-md mx-auto text-left">
                            <div className="flex justify-between text-sm font-semibold mb-2">
                                <span className="text-slate-600">अगले स्तर: <span className="text-slate-900">{nextTier.name}</span></span>
                                <span className="text-primary">{nextTier.bookingsNeeded} बुकिंग और चाहिए</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SECTION B: Badges */}
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">बैज संग्रह</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((b: any) => (
                    <div key={b.id} className={`p-5 rounded-xl border text-center relative ${b.earned ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                        <div className="text-4xl mb-2">{b.icon}</div>
                        <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{b.description}</p>
                        {b.earned ? (
                            <span className="absolute top-2 right-2 text-green-600 material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        ) : (
                            <span className="absolute top-2 right-2 text-slate-400 material-symbols-outlined text-sm">lock</span>
                        )}
                    </div>
                ))}
            </div>

            {/* SECTION C: Performance Report */}
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">परफॉर्मेंस रिपोर्ट</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">स्वीकृति दर</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-slate-900">{performance.acceptanceRate}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${performance.acceptanceRate}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">अच्छे पंडितों का औसत: 80%+</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">पूर्णता दर</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-slate-900">{performance.completionRate}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${performance.completionRate}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">औसत रेटिंग</p>
                    <div className="flex items-center gap-1">
                        <span className="text-2xl font-black text-slate-900">{performance.averageRating}</span>
                        <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                    <div className="mt-2 text-xs space-y-0.5">
                        {[5, 4, 3, 2, 1].map(s => {
                            const maxCount = Math.max(...Object.values(performance.ratingDistribution as Record<number, number>));
                            const w = maxCount ? ((performance.ratingDistribution[s] || 0) / maxCount) * 100 : 0;
                            return (
                                <div key={s} className="flex items-center gap-1 text-[10px] text-slate-500">
                                    <span className="w-2">{s}</span>
                                    <div className="flex-1 h-1 bg-slate-100 rounded-full"><div className="h-full bg-amber-400 rounded-full" style={{ width: `${w}%` }}></div></div>
                                    <span className="w-3 text-right">{performance.ratingDistribution[s] || 0}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">जवाब का समय</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-slate-900">{performance.avgResponseTimeMinutes}</span>
                        <span className="text-sm font-medium text-slate-500 mb-1">मिनट</span>
                    </div>
                    <p className="text-[10px] text-green-600 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span> लक्ष्य: 2 घंटे से कम
                    </p>
                </div>
            </div>

            {/* SECTION D: Reviews */}
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">हाल की समीक्षाएं</h2>
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                {recentReviews.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">अभी कोई समीक्षा नहीं है</div>
                ) : recentReviews.map((r: any, idx: number) => (
                    <div key={idx} className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="font-bold text-slate-900">{r.customerNameMasked}</span>
                                <span className="text-slate-400 text-xs ml-2">{format(new Date(r.reviewDate), "dd MMM yyyy")}</span>
                            </div>
                            <div className="flex text-amber-500 text-sm">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: i < r.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                                ))}
                            </div>
                        </div>
                        {r.eventType && <div className="text-xs font-semibold text-primary bg-primary/10 inline-block px-2 py-0.5 rounded mb-2">{r.eventType}</div>}
                        {r.comment && <p className="text-sm text-slate-600 italic">"{r.comment}"</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}
