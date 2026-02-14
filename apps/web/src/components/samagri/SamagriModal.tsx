"use client";

import { useState } from "react";
import Image from "next/image";

export interface SamagriSelection {
    type: "package" | "custom";
    totalCost: number;
    items?: any[];
}

export interface SamagriModalProps {
    panditId: string;
    pujaType: string;
    onSelect: (selection: SamagriSelection) => void;
    onClose: () => void;
}

// Mock Data matching the UI design perfectly
const COMPARISON_ITEMS = [
    {
        id: "ghee",
        name: "Desi Ghee",
        quantity: "1 KG",
        premium: {
            brand: "Amul Pure (1kg)",
            price: 650,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuADMDvKfUZd31jnD2lZtBn5_nhOFPic93Y2TSccOXWGKH5bkYXdR6ZxxASRMkFA2CH2cAZtP86vKMYHSLcLVx2aqlnZb4Ou8mdaNFfU7DcpQH2uSh5iNM4bGQPsaBc8zFwrMqehunLbZzX0cETSOUZXaHHJzCkUBLTqx_ctHa4w3-eIfxtQ39sDFRYD4dikBq36cOnAxLayBPyfLfNfaadtyba5VBwYULeLHhlndixXSEle8RmrdXKdgNyWB0YbvBhyy3Rclp2n96o",
        },
        market: {
            label: "Local Dairy",
            price: 530,
            savings: "18% less",
            defaultQty: 1,
        },
    },
    {
        id: "camphor",
        name: "Camphor",
        quantity: "200g",
        premium: {
            brand: "Mangal Deep (200g)",
            price: 240,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAq9nSiPkQ-kp4eUi7TN1teueP16CWvKxxHuLKrLeu24-Ue1WTT2RnqG6xMmOeuBmSTRZLXq1w6nBTyG3cuW8CYBsLGG6fFOZd0Eu18flaCkrSstZSIy4t1b1xl1LrVnquhvbeCph-ZLCMCknSX2VQgY39MlBQCmbW06C-VcTuNXIKvf4vhhf0tbQdKpRdp3E3M88xDJbpO1RXR6uAVYux5ScUEB2ztbWexuD6ukrXacX66KtvA7I8zV_friFsdZa4Tj-zNc7dbh0o",
        },
        market: {
            label: "Loose Camphor",
            price: 145,
            savings: "40% less",
            defaultQty: 1,
        },
    },
    {
        id: "coconut",
        name: "Whole Coconut",
        quantity: "2 Pcs",
        premium: {
            brand: "Large, With Water",
            price: 50,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1yAa3CetZwkeyCKUqesqKZPcp89TOSFJX9uvzjKwrErR35I2k2eL4Yo9rpuTadJRqp3WUleOVf-cSL2B4K5IdvMe7rZNYS9HlWKOVvC2Kuox6C7LhPlJLStG1zYKLUpnYdybBzV2SZxawB5V8c2uRre6BirjkKecYbyguzFwgEfdcemw2ZehrhfaCXsx4hoICtHxNU_UkFQe21ZXvVjz4gBPMLINNMNlGAG-XpFphuHetV4h_KqfH97_Niln4BAnnkSqp77dwvzw",
        },
        market: {
            label: "Standard Size",
            price: 40,
            savings: "20% less",
            defaultQty: 2,
        },
    },
    {
        id: "kumkum",
        name: "Kumkum",
        quantity: "50g",
        premium: {
            brand: "Organic (50g)",
            price: 80,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuApiCSiz9pqLYv7omSJu5WXKrDqjUDIC0-jzrmHIi41kt2pT6iludUq0ttFwx-fIyajfMyCyba0hJJpo9PGwx3kl8Btp7BBUdX21TXUnCaliWotQjWzYpWsTpQ2Yz7yNhINjT2swUe1ngD3PfwfKv__VC1CVw_rnjvupz4l2okSKSZ3i9KmrB7Q9z5Jf3nT9NcPVD0jAegreWMw8_HPEfu243jfeam0ugsMqzm_skk11HfdKvOqJPIkf3NyC1iOmmkvqGRgEb_DeOk",
        },
        market: {
            label: "Local Pack",
            price: 40,
            savings: "50% less",
            defaultQty: 1,
        },
    },
    {
        id: "supari",
        name: "Supari",
        quantity: "100g",
        premium: {
            brand: "Whole Premium (100g)",
            price: 120,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcfdjXgSUgv8gsdb0-CZlouCFT-VF_Q7bw_AZQQ1-JKo-5gnayZSRZtqW59pQ72uQVDMsS7IoTIFA3EQ-au6gStnsU9sKrTWTlx-yjNNYSaJ-RFC7p3krS6xdq851JnvMvRT57DNHIJ27lHY9skkCvBssge9PNEgxn_70dsyLtbUxMTtxyF7b_4t09StSGRVIWg1LXsO2BJg_c25-KgL9nJjsnHYP3T8YJ-tMm_9aVdQESEdE-xjsqXrDVPCqovEe1S84aK6FEkfg",
        },
        market: {
            label: "Loose Market",
            price: 90,
            savings: "25% less",
            defaultQty: 1,
        },
    },
];

export function SamagriModal({ panditId, pujaType, onSelect, onClose }: SamagriModalProps) {
    // Compute initial totals for display
    const panditTotal = 8000;
    const marketTotal = 5200;
    const savings = panditTotal - marketTotal;

    // Track custom list items. Initially all "market" items are selected in custom list logic
    const [customCounts, setCustomCounts] = useState<Record<string, number>>(
        COMPARISON_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: item.market.defaultQty }), {})
    );

    const [includeFlowers, setIncludeFlowers] = useState(false);

    const handleIncrement = (id: string) => {
        setCustomCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const handleDecrement = (id: string) => {
        setCustomCounts(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
    };

    // Calculate dynamic custom total based on counts
    const currentCustomTotal = COMPARISON_ITEMS.reduce((total, item) => {
        return total + (item.market.price * (customCounts[item.id] || 0));
    }, 0);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-hidden">
            {/* Main Modal Container */}
            <div className="relative z-10 w-full max-w-5xl bg-white dark:bg-[#2a2018] rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100 dark:border-slate-700">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-[#2a2018] shrink-0">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Compare & Choose Your Samagri Kit</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review the sourcing options for your {pujaType || "Ceremony"}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Sticky Comparison Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#f8f7f6] dark:bg-[#221910] border-b border-slate-200 dark:border-slate-700 shrink-0">
                    {/* Left Column Header: Pandit's Package */}
                    <div className="col-span-5 flex flex-col justify-between h-full pr-4 border-r border-slate-200 dark:border-slate-700 border-dashed">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-slate-500 text-lg">verified</span>
                                    <h2 className="font-semibold text-slate-700 dark:text-slate-200">Pandit's Fixed Package</h2>
                                </div>
                                <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">Premium Brands</span>
                            </div>
                        </div>
                        <div className="mt-auto">
                            <span className="text-2xl font-bold text-slate-800 dark:text-white">₹{panditTotal.toLocaleString()}</span>
                            <span className="text-xs text-slate-500 block">Total estimated cost</span>
                        </div>
                    </div>

                    {/* Middle Spacer / Item Label Header */}
                    <div className="col-span-2 flex items-end justify-center pb-1">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Item Details</span>
                    </div>

                    {/* Right Column Header: Custom List */}
                    <div className="col-span-5 flex flex-col justify-between h-full pl-4 relative">
                        {/* Floating Savings Badge */}
                        <div className="absolute top-0 right-0 -mt-2 bg-[#ec7f13] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                            <span className="material-symbols-outlined text-[14px]">savings</span>
                            You Save ₹{(panditTotal - currentCustomTotal).toLocaleString()}
                        </div>
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-[#ec7f13] text-lg">storefront</span>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Build Custom List</h2>
                                </div>
                                <span className="text-xs font-medium bg-[#fdf2e7] dark:bg-[#ec7f13]/20 text-[#b05e0e] dark:text-[#ec7f13] px-2 py-0.5 rounded-full">Live Market Prices</span>
                            </div>
                        </div>
                        <div className="mt-auto">
                            <span className="text-2xl font-bold text-[#ec7f13]">₹{currentCustomTotal.toLocaleString()}</span>
                            <span className="text-xs text-[#ec7f13]/80 block">Current market total</span>
                        </div>
                    </div>
                </div>

                {/* Scrollable Item List */}
                <div className="overflow-y-auto flex-grow bg-white dark:bg-[#2a2018]">
                    {/* List Header Row */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-2 bg-slate-50 dark:bg-[#32281e] text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 sticky top-0 z-10">
                        <div className="col-span-5">Premium Brand</div>
                        <div className="col-span-2 text-center">Item</div>
                        <div className="col-span-5 text-right pr-4">Market Rate</div>
                    </div>

                    {/* Items */}
                    {COMPARISON_ITEMS.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#32281e] transition-colors group items-center">
                            {/* Left: Premium */}
                            <div className="col-span-5 flex items-center justify-between pr-4 border-r border-slate-100 dark:border-slate-700 border-dashed">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                        <Image src={item.premium.image} alt={item.premium.brand} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}</p>
                                        <p className="text-xs text-slate-400">{item.premium.brand}</p>
                                    </div>
                                </div>
                                <span className="font-medium text-slate-500 dark:text-slate-400">₹{item.premium.price}</span>
                            </div>

                            {/* Center: Item Name */}
                            <div className="col-span-2 text-center">
                                <span className="text-xs font-bold text-slate-400 group-hover:text-[#ec7f13] transition-colors">{item.quantity}</span>
                            </div>

                            {/* Right: Market */}
                            <div className="col-span-5 flex items-center justify-between pl-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-[#ec7f13]/10 flex items-center justify-center text-[#ec7f13] shrink-0">
                                        <span className="material-symbols-outlined text-lg">local_mall</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{item.market.label}</p>
                                        <p className="text-xs text-green-600 flex items-center">
                                            <span className="material-symbols-outlined text-[10px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>trending_down</span> {item.market.savings}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-[#ec7f13]">₹{item.market.price * (customCounts[item.id] || 0)}</span>
                                    <div className="flex items-center justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDecrement(item.id)} className="text-slate-400 hover:text-[#ec7f13]">
                                            <span className="material-symbols-outlined text-sm">remove_circle_outline</span>
                                        </button>
                                        <span className="text-xs px-2 w-6 text-center">{customCounts[item.id] || 0}</span>
                                        <button onClick={() => handleIncrement(item.id)} className="text-slate-400 hover:text-[#ec7f13]">
                                            <span className="material-symbols-outlined text-sm">add_circle_outline</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add-on Toggle Section */}
                <div className="bg-[#fdf2e7]/30 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm">
                            <span className="material-symbols-outlined text-rose-500">local_florist</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Include Fresh Flowers & Fruits</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Sourced via Blinkit/Zepto integration</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            className="sr-only peer"
                            type="checkbox"
                            checked={includeFlowers}
                            onChange={() => setIncludeFlowers(!includeFlowers)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#ec7f13]/30 dark:peer-focus:ring-[#ec7f13]/20 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#ec7f13]"></div>
                    </label>
                </div>

                {/* Sticky Footer Actions */}
                <div className="bg-white dark:bg-[#2a2018] p-6 border-t border-slate-100 dark:border-slate-700 shrink-0 grid grid-cols-2 gap-4">
                    <button
                        onClick={() => onSelect({ type: "package", totalCost: panditTotal, items: [] })}
                        className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-[#32281e] transition-all group"
                    >
                        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Pandit&apos;s Choice</span>
                        <span className="text-slate-800 dark:text-white font-bold text-lg">Select Fixed Package</span>
                        <span className="text-xs text-slate-400 mt-1 group-hover:text-slate-600 dark:group-hover:text-slate-300">Pay ₹{panditTotal.toLocaleString()}</span>
                    </button>
                    <button
                        onClick={() => onSelect({ type: "custom", totalCost: currentCustomTotal, items: customCounts as any })}
                        className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#ec7f13] hover:bg-[#b05e0e] transition-all text-white shadow-lg shadow-[#ec7f13]/30 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                        <span className="text-[#fdf2e7] text-sm font-medium mb-1 flex items-center gap-1">
                            Recommended <span className="material-symbols-outlined text-xs">thumb_up</span>
                        </span>
                        <span className="font-bold text-lg">Use Custom List</span>
                        <span className="text-xs text-white/90 mt-1 bg-black/10 px-2 py-0.5 rounded-full">Pay ₹{currentCustomTotal.toLocaleString()} (Save ₹{(panditTotal - currentCustomTotal).toLocaleString()})</span>
                    </button>
                </div>

            </div>
        </div>
    );
}

