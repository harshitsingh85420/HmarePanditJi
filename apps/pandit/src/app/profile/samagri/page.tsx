"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SamagriPage() {
    const [profile, setProfile] = useState<any>(null);
    const [requests, setRequests] = useState<any[]>([]);
    const [insights, setInsights] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [savingToggle, setSavingToggle] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem("panditToken");
                const headers = { Authorization: `Bearer ${token}` };

                const [profRes, reqRes, insRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/pandits/me`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/pandits/me/samagri/customer-requests`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/pandits/me/samagri/demand-insights`, { headers })
                ]);

                const [prof, reqs, ins] = await Promise.all([
                    profRes.json(), reqRes.json(), insRes.json()
                ]);

                if (prof.success) setProfile(prof.data);
                if (reqs.success) setRequests(reqs.data);
                if (ins.success) setInsights(ins.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleToggleSamagri = async () => {
        if (!profile) return;
        const newVal = !profile.canBringSamagri;

        if (!newVal) {
            if (!confirm("क्या आप सामग्री लाना बंद करना चाहते हैं?\nग्राहकों को खुद व्यवस्था करनी होगी।")) {
                return;
            }
        }

        setSavingToggle(true);
        try {
            const token = localStorage.getItem("panditToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/pandits/me/samagri/toggle`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ canBringSamagri: newVal })
            });
            if (res.ok) {
                setProfile({ ...profile, canBringSamagri: newVal });
            }
        } finally {
            setSavingToggle(false);
        }
    };

    if (loading) {
        return (
            <div className="py-8 flex justify-center mt-20">
                <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const packages = profile?.samagriPackages || [];
    const pacTypes = ["BASIC", "STANDARD", "PREMIUM"];

    return (
        <div className="py-8 space-y-6 max-w-4xl mx-auto px-4 sm:px-0">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">सामग्री प्रबंधन</h1>
                    <p className="text-slate-500 text-sm mt-1">यहाँ आप देख सकते हैं कि ग्राहकों ने कौन-सी सामग्री मांगी है</p>
                </div>
                <Link href="/profile" className="text-primary text-sm font-semibold hover:underline">
                    &larr; प्रोफाइल पर वापस
                </Link>
            </div>

            {/* SECTION A: Toggle */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">क्या आप सामग्री लाते हैं?</h2>
                    <p className="text-sm text-slate-500 mt-1">अगर बंद करेंगे, तो ग्राहकों को अपनी सामग्री खुद लानी होगी</p>
                </div>
                <button
                    onClick={handleToggleSamagri}
                    disabled={savingToggle}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${profile?.canBringSamagri ? 'bg-primary' : 'bg-slate-300'}`}
                >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${profile?.canBringSamagri ? 'translate-x-9' : 'translate-x-1'}`} />
                </button>
            </div>

            {/* SECTION B: Packages */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-900">मेरे पैकेज की पूरी सूची</h2>
                    <Link href="/profile/packages" className="text-primary text-sm font-semibold hover:underline">
                        पैकेज संपादित करें &rarr;
                    </Link>
                </div>

                {packages.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4">आपने अभी कोई पैकेज नहीं बनाया है।</p>
                ) : (
                    <div className="space-y-6">
                        {pacTypes.map(pt => {
                            const pkg = packages.find((p: any) => p.packageType === pt);
                            if (!pkg) return null;

                            const items = typeof pkg.items === 'string' ? JSON.parse(pkg.items) : (Array.isArray(pkg.items) ? pkg.items : []);

                            return (
                                <div key={pt} className="border border-slate-200 rounded-xl overflow-hidden">
                                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                                        <span className="font-bold text-slate-900">{pt === 'BASIC' ? 'बेसिक' : pt === 'STANDARD' ? 'स्टैंडर्ड' : 'प्रीमियम'} पैकेज — {items.length} आइटम</span>
                                        <span className="font-bold text-primary">₹{pkg.fixedPrice}</span>
                                    </div>
                                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                        {items.map((item: any, i: number) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                                                <span className="material-symbols-outlined text-green-500 text-base">check_circle</span>
                                                {item.itemName} {item.quantity && <span className="text-slate-400">({item.quantity})</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* SECTION C: Customer Requests */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">ग्राहकों की खास मांगें</h2>
                {requests.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4">अभी कोई खास मांग नहीं है।</p>
                ) : (
                    <div className="space-y-4">
                        {requests.map((r: any) => (
                            <div key={r.id} className="p-4 border border-slate-100 bg-slate-50 rounded-xl">
                                <div className="font-semibold text-slate-800 mb-1">{r.eventType}</div>
                                <div className="text-xs font-medium text-slate-500 mb-2">ग्राहक ने मांगा:</div>
                                <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                                    {r.samagriCustomList && (Array.isArray(r.samagriCustomList) ? r.samagriCustomList : []).map((item: any, i: number) => (
                                        <span key={i} className="bg-white border rounded px-2 py-1">{item.itemName || item}</span>
                                    ))}
                                </div>
                                <p className="text-xs text-amber-600 mt-2 font-medium">इन आइटम को आप भविष्य में अपने पैकेज में जोड़ सकते हैं</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SECTION D: Demand Insights */}
            {insights && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">बाज़ार में क्या चल रहा है</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <h3 className="text-sm font-bold text-slate-800 mb-2">इस हफ्ते ज़्यादा मांग:</h3>
                            <ul className="text-sm space-y-2 text-slate-600">
                                {insights.trending.map((t: any, i: number) => (
                                    <li key={i}>• {t.pujaName} — {t.bookingsCount} बुकिंग {t.region} में</li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                            <h3 className="text-sm font-bold text-slate-800 mb-2">आपके पैकेज की तुलना:</h3>
                            <p className="text-sm text-slate-600">
                                आपके स्टैंडर्ड पैकेज में <span className="font-bold text-slate-900">{insights.packageComparison.yourItemCount} आइटम</span> हैं।<br />
                                समान पंडितों का औसत: <span className="font-bold text-slate-900">{insights.packageComparison.averageItemCount} आइटम</span>
                            </p>
                        </div>

                        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                            <h3 className="text-sm font-bold text-slate-800 mb-2">कमाई बढ़ाने का सुझाव:</h3>
                            <ul className="text-sm space-y-2 text-slate-600">
                                {insights.tips.map((tip: string, i: number) => (
                                    <li key={i}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
