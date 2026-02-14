"use client";

import React, { useState } from "react";

interface RitualVariationSelectionProps {
    onSelect: (variation: string) => void;
    selectedVariation?: string;
}

const REGIONS = [
    { id: "north", label: "North Indian" },
    { id: "south", label: "South Indian" },
    { id: "east", label: "East Indian" },
    { id: "west", label: "West Indian" },
];

const VARIATIONS: Record<string, Array<{ id: string; label: string; desc: string; icon: string }>> = {
    north: [
        { id: "delhi_vedic", label: "Delhi Vedic", desc: "Standard Vedic rituals as per Shukla Yajurveda", icon: "menu_book" },
        { id: "punjabi", label: "Punjabi", desc: "Sikh & Hindu Sanatan Dharma rituals", icon: "self_improvement" },
        { id: "bihari", label: "Bihari / Maithil", desc: "Includes vivah geet and specific Maithil paddhati", icon: "music_note" },
        { id: "up_brahmin", label: "UP Brahmin", desc: "Kashi / Banaras style detailed karmakand", icon: "temple_hindu" },
    ],
    south: [
        { id: "tamil_iyer", label: "Tamil Iyer", desc: "Rigorous Vedic chanting in Krishna Yajurveda style", icon: "om" },
        { id: "telugu_smarta", label: "Telugu Smarta", desc: "Follows Smarta tradition with focus on homams", icon: "fire_hydrant" }, // fire icon approx
        { id: "kannada_madhva", label: "Kannada Madhva", desc: "Dvaita philosophy based rituals", icon: "history_edu" },
        { id: "kerala_namboodiri", label: "Kerala Namboodiri", desc: "Tantric and Vedic blended unique style", icon: "spa" },
    ],
    east: [
        { id: "bengali", label: "Bengali", desc: "Includes Ululudhvani and specific samagri usage", icon: "celebration" },
        { id: "odiya", label: "Odiya", desc: "Jagannath temple tradition style", icon: "temple_buddhist" },
        { id: "assamese", label: "Assamese", desc: "Kamakhya tradition influences", icon: "nature" },
    ],
    west: [
        { id: "marathi", label: "Marathi", desc: "Rigorous and disciplined Ganesh/bhatji style", icon: "festival" },
        { id: "gujarati", label: "Gujarati", desc: "Focus on shanti path and bhakti", icon: "volunteer_activism" },
        { id: "rajasthani", label: "Rajasthani", desc: "Marwari tradition with specific geet", icon: "wb_sunny" },
    ],
};

export function RitualVariationSelection({ onSelect, selectedVariation }: RitualVariationSelectionProps) {
    const [activeTab, setActiveTab] = useState("north");

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#f49d25]">location_on</span>
                Regional Variation
            </h2>
            <p className="text-sm text-slate-500 mb-6">
                Select your community style to ensure Pandit Ji follows the correct vidhi.
            </p>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                {REGIONS.map((region) => (
                    <button
                        key={region.id}
                        onClick={() => setActiveTab(region.id)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === region.id
                                ? "bg-[#f49d25] text-white shadow-md shadow-[#f49d25]/20"
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                            }`}
                    >
                        {region.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {VARIATIONS[activeTab]?.map((v) => {
                    const isSelected = selectedVariation === v.id;
                    return (
                        <button
                            key={v.id}
                            onClick={() => onSelect(v.id)}
                            className={`text-left p-4 rounded-xl border-2 transition-all relative group ${isSelected
                                    ? "border-[#f49d25] bg-[#f49d25]/5 shadow-md"
                                    : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isSelected ? "bg-[#f49d25] text-white" : "bg-slate-100 text-slate-500 group-hover:bg-[#f49d25]/10 group-hover:text-[#f49d25]"
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-xl">{v.icon}</span>
                                </div>
                                <div>
                                    <h3 className={`font-bold mb-1 ${isSelected ? "text-[#f49d25]" : "text-slate-800"}`}>
                                        {v.label}
                                    </h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
                                </div>
                            </div>
                            {isSelected && (
                                <div className="absolute top-3 right-3">
                                    <span className="material-symbols-outlined text-[#f49d25]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        check_circle
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
            <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg flex items-start gap-2">
                <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">info</span>
                <p>Don't see your community? Select "Standard Vedic" or describe in "Special Instructions" later.</p>
            </div>
        </div>
    );
}
