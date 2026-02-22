"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PackagesPage() {
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string>("STANDARD");
    const [saving, setSaving] = useState<string | null>(null);

    const pcTypes = [
        { type: "BASIC", label: "बेसिक पैकेज" },
        { type: "STANDARD", label: "स्टैंडर्ड पैकेज" },
        { type: "PREMIUM", label: "प्रीमियम पैकेज" }
    ];

    useEffect(() => {
        async function fetchPackages() {
            try {
                const token = localStorage.getItem("panditToken");
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/pandits/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) {
                    const fetchedPkgs = json.data.samagriPackages || [];
                    // Initialize missing packages locally for the UI
                    const fullPkgs = pcTypes.map(pt => {
                        const existing = fetchedPkgs.find((p: any) => p.packageType === pt.type);
                        if (existing) {
                            return {
                                ...existing,
                                items: typeof existing.items === 'string' ? JSON.parse(existing.items) : existing.items
                            };
                        }
                        return {
                            id: `new-${pt.type}`,
                            isNew: true,
                            packageType: pt.type,
                            packageName: pt.label,
                            fixedPrice: 0,
                            description: "",
                            durationHours: 2,
                            isActive: false,
                            pujaType: "All Puja",
                            items: []
                        };
                    });
                    setPackages(fullPkgs);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchPackages();
    }, []);

    const handleUpdateField = (type: string, field: string, value: any) => {
        setPackages(pkgs => pkgs.map(p => p.packageType === type ? { ...p, [field]: value } : p));
    };

    const handleAddItem = (type: string, itemName: string) => {
        if (!itemName.trim()) return;
        setPackages(pkgs => pkgs.map(p => {
            if (p.packageType === type) {
                return { ...p, items: [...(p.items || []), { itemName: itemName.trim(), quantity: "1" }] };
            }
            return p;
        }));
    };

    const handleRemoveItem = (type: string, index: number) => {
        setPackages(pkgs => pkgs.map(p => {
            if (p.packageType === type) {
                const newItems = [...p.items];
                newItems.splice(index, 1);
                if (newItems.length < 3 && p.isActive) {
                    return { ...p, items: newItems, isActive: false };
                }
                return { ...p, items: newItems };
            }
            return p;
        }));
    };

    const handleDragEnd = (type: string, fromIndex: number, toIndex: number) => {
        setPackages(pkgs => pkgs.map(p => {
            if (p.packageType === type) {
                const newItems = [...p.items];
                const [moved] = newItems.splice(fromIndex, 1);
                newItems.splice(toIndex, 0, moved);
                return { ...p, items: newItems };
            }
            return p;
        }));
    };

    const handleSave = async (pkg: any) => {
        if (pkg.isActive && pkg.items.length < 3) {
            alert("पैकेज चालू करने के लिए कम से कम 3 सामग्री आइटम होने चाहिए।");
            return;
        }

        setSaving(pkg.packageType);
        try {
            const token = localStorage.getItem("panditToken");
            const url = pkg.isNew
                ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/pandits/me/samagri-packages`
                : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/pandits/me/samagri-packages/${pkg.id}`;

            const method = pkg.isNew ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    pujaType: pkg.pujaType,
                    packageName: pkg.packageName,
                    packageType: pkg.packageType,
                    fixedPrice: pkg.fixedPrice,
                    isActive: pkg.isActive,
                    items: pkg.items
                })
            });

            const json = await res.json();
            if (json.success) {
                setPackages(pkgs => pkgs.map(p => p.packageType === pkg.packageType ? { ...json.data, items: typeof json.data.items === 'string' ? JSON.parse(json.data.items) : json.data.items } : p));
                alert("बदलाव सहेजे गए!");
            } else {
                alert(json.message || "Something went wrong");
            }
        } catch (err) {
            console.error(err);
            alert("Error saving package");
        } finally {
            setSaving(null);
        }
    };

    if (loading) {
        return (
            <div className="py-8 flex justify-center mt-20">
                <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="py-8 space-y-6 max-w-4xl mx-auto px-4 sm:px-0">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">पूजा पैकेज संपादित करें</h1>
                    <p className="text-slate-500 text-sm mt-1">ये पैकेज ग्राहकों को बुकिंग के समय दिखेंगे</p>
                </div>
                <Link href="/profile" className="text-primary text-sm font-semibold hover:underline">
                    &larr; प्रोफाइल पर वापस
                </Link>
            </div>

            <div className="space-y-4">
                {packages.map(pkg => (
                    <div key={pkg.packageType} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Header / Trigger */}
                        <div
                            className={`p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${expanded === pkg.packageType ? 'border-b border-slate-100' : ''}`}
                            onClick={() => setExpanded(expanded === pkg.packageType ? "" : pkg.packageType)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${pkg.packageType === 'PREMIUM' ? 'bg-amber-100 text-amber-600' : pkg.packageType === 'STANDARD' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                    <span className="material-symbols-outlined text-xl">loyalty</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{pkg.packageName}</h2>
                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                        <span className="font-semibold text-primary">₹{pkg.fixedPrice}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        {pkg.items?.length || 0} आइटम
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <span className="text-xs font-semibold text-slate-500">यह पैकेज चालू है</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={pkg.isActive} onChange={(e) => {
                                            if (e.target.checked && pkg.items.length < 3) {
                                                alert("कम से कम 3 सामग्री आइटम होने चाहिए।");
                                                return;
                                            }
                                            handleUpdateField(pkg.packageType, "isActive", e.target.checked);
                                        }} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                                <span className="material-symbols-outlined text-slate-400">
                                    {expanded === pkg.packageType ? 'expand_less' : 'expand_more'}
                                </span>
                            </div>
                        </div>

                        {/* Expanded Content */}
                        {expanded === pkg.packageType && (
                            <div className="p-6 bg-slate-50/50 space-y-6">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">पैकेज का नाम (Name)</label>
                                        <input
                                            type="text"
                                            value={pkg.packageName}
                                            onChange={(e) => handleUpdateField(pkg.packageType, "packageName", e.target.value)}
                                            maxLength={50}
                                            className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">कीमत (Price)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-2 text-slate-400">₹</span>
                                            <input
                                                type="number"
                                                value={pkg.fixedPrice}
                                                min={100} max={100000}
                                                onChange={(e) => handleUpdateField(pkg.packageType, "fixedPrice", Number(e.target.value))}
                                                className="w-full pl-8 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">विवरण (Description)</label>
                                    <textarea
                                        value={pkg.description || ""}
                                        onChange={(e) => handleUpdateField(pkg.packageType, "description", e.target.value)}
                                        maxLength={200}
                                        rows={2}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="इस पैकेज में क्या खास है..."
                                    />
                                    <div className="text-right text-xs text-slate-400 mt-1">{(pkg.description || "").length}/200</div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">सामग्री सूची (What's included)</label>
                                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {pkg.items.map((item: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 transition-colors rounded-full px-3 py-1 cursor-grab active:cursor-grabbing"
                                                    draggable
                                                    onDragStart={(e) => e.dataTransfer.setData("text/plain", idx.toString())}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        const from = parseInt(e.dataTransfer.getData("text/plain"));
                                                        handleDragEnd(pkg.packageType, from, idx);
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined text-[14px] text-slate-400 leading-none">drag_indicator</span>
                                                    <span className="text-sm font-medium text-slate-700">{item.itemName}</span>
                                                    <button onClick={() => handleRemoveItem(pkg.packageType, idx)} className="ml-1 text-slate-400 hover:text-red-500 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-[14px] leading-none">close</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                            <input
                                                type="text"
                                                id={`add-item-${pkg.packageType}`}
                                                placeholder="+ नया आइटम का नाम"
                                                className="flex-1 px-3 py-2 text-sm focus:outline-none"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleAddItem(pkg.packageType, e.currentTarget.value);
                                                        e.currentTarget.value = "";
                                                    }
                                                }}
                                            />
                                            <button
                                                className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2"
                                                onClick={() => {
                                                    const input = document.getElementById(`add-item-${pkg.packageType}`) as HTMLInputElement;
                                                    if (input) {
                                                        handleAddItem(pkg.packageType, input.value);
                                                        input.value = "";
                                                    }
                                                }}
                                            >जोड़ें
                                            </button>
                                        </div>
                                        {pkg.items.length < 3 && (
                                            <p className="text-xs text-amber-600 font-medium mt-2">कम से कम 3 आइटम होने चाहिए (अभी {pkg.items.length} हैं)</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-4 border-t border-slate-200">
                                    <button className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                        ग्राहक इसे कैसे देखेंगे?
                                    </button>
                                    <button
                                        onClick={() => handleSave(pkg)}
                                        disabled={saving === pkg.packageType}
                                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 py-2.5 flex items-center justify-center gap-2"
                                    >
                                        {saving === pkg.packageType ? (
                                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            "बदलाव सहेजें"
                                        )}
                                    </button>
                                </div>

                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
