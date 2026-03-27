"use client";

import React, { useState } from "react";

interface RitualVariationSelectionProps {
    onSelect: (variation: string) => void;
    selectedVariation?: string;
}

const REGIONS = [
    { id: &quot;north&quot;, label: &quot;North Indian&quot; },
    { id: &quot;south&quot;, label: &quot;South Indian&quot; },
    { id: &quot;east&quot;, label: &quot;East Indian&quot; },
    { id: &quot;west&quot;, label: &quot;West Indian&quot; },
];

const VARIATIONS: Record<string, Array<{ id: string; label: string; desc: string; icon: string }>> = {
    north: [
        { id: &quot;delhi_vedic&quot;, label: &quot;Delhi Vedic&quot;, desc: &quot;Standard Vedic rituals as per Shukla Yajurveda&quot;, icon: &quot;menu_book&quot; },
        { id: &quot;punjabi&quot;, label: &quot;Punjabi&quot;, desc: &quot;Sikh & Hindu Sanatan Dharma rituals&quot;, icon: &quot;self_improvement&quot; },
        { id: &quot;bihari&quot;, label: &quot;Bihari / Maithil&quot;, desc: &quot;Includes vivah geet and specific Maithil paddhati&quot;, icon: &quot;music_note&quot; },
        { id: &quot;up_brahmin&quot;, label: &quot;UP Brahmin&quot;, desc: &quot;Kashi / Banaras style detailed karmakand&quot;, icon: &quot;temple_hindu&quot; },
    ],
    south: [
        { id: &quot;tamil_iyer&quot;, label: &quot;Tamil Iyer&quot;, desc: &quot;Rigorous Vedic chanting in Krishna Yajurveda style&quot;, icon: &quot;om&quot; },
        { id: &quot;telugu_smarta&quot;, label: &quot;Telugu Smarta&quot;, desc: &quot;Follows Smarta tradition with focus on homams&quot;, icon: &quot;fire_hydrant&quot; }, // fire icon approx
        { id: &quot;kannada_madhva&quot;, label: &quot;Kannada Madhva&quot;, desc: &quot;Dvaita philosophy based rituals&quot;, icon: &quot;history_edu&quot; },
        { id: &quot;kerala_namboodiri&quot;, label: &quot;Kerala Namboodiri&quot;, desc: &quot;Tantric and Vedic blended unique style&quot;, icon: &quot;spa&quot; },
    ],
    east: [
        { id: &quot;bengali&quot;, label: &quot;Bengali&quot;, desc: &quot;Includes Ululudhvani and specific samagri usage&quot;, icon: &quot;celebration&quot; },
        { id: &quot;odiya&quot;, label: &quot;Odiya&quot;, desc: &quot;Jagannath temple tradition style&quot;, icon: &quot;temple_buddhist&quot; },
        { id: &quot;assamese&quot;, label: &quot;Assamese&quot;, desc: &quot;Kamakhya tradition influences&quot;, icon: &quot;nature&quot; },
    ],
    west: [
        { id: &quot;marathi&quot;, label: &quot;Marathi&quot;, desc: &quot;Rigorous and disciplined Ganesh/bhatji style&quot;, icon: &quot;festival&quot; },
        { id: &quot;gujarati&quot;, label: &quot;Gujarati&quot;, desc: &quot;Focus on shanti path and bhakti&quot;, icon: &quot;volunteer_activism&quot; },
        { id: &quot;rajasthani&quot;, label: &quot;Rajasthani&quot;, desc: &quot;Marwari tradition with specific geet&quot;, icon: &quot;wb_sunny&quot; },
    ],
};

export function RitualVariationSelection({ onSelect, selectedVariation }: RitualVariationSelectionProps) {
    const [activeTab, setActiveTab] = useState(&quot;north&quot;);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#f49d25]">location_on</span>
                Regional Variation
            </h2>
            <p className="text-lg text-slate-500 mb-6">
                Select your community style to ensure Pandit Ji follows the correct vidhi.
            </p>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                {REGIONS.map((region) => (
                    <button
                        key={region.id}
                        onClick={() => setActiveTab(region.id)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-lg font-semibold transition-all ${activeTab === region.id
                                ? &quot;bg-[#f49d25] text-white shadow-md shadow-[#f49d25]/20&quot;
                                : &quot;bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200&quot;
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
                                    ? &quot;border-[#f49d25] bg-[#f49d25]/5 shadow-md&quot;
                                    : &quot;border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm&quot;
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${isSelected ? "bg-[#f49d25] text-white" : "bg-slate-100 text-slate-500 group-hover:bg-[#f49d25]/10 group-hover:text-[#f49d25]"
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-xl">{v.icon}</span>
                                </div>
                                <div>
                                    <h3 className={`font-bold mb-1 ${isSelected ? "text-[#f49d25]" : "text-slate-800"}`}>
                                        {v.label}
                                    </h3>
                                    <p className="text-base text-slate-500 leading-relaxed">{v.desc}</p>
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
            <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-base rounded-lg flex items-start gap-2">
                <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">info</span>
                <p>Don&apos;t see your community? Select &quot;Standard Vedic&quot; or describe in &quot;Special Instructions&quot; later.</p>
            </div>
        </div>
    );
}
