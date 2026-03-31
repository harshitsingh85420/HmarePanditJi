"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mic, X, Globe } from "lucide-react";

export default function VoiceSearchPage() {
    const [activeLang, setActiveLang] = useState("Hindi");

    return (
        <div className="bg-[#181511] font-display text-white min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-hidden">

                {/* Navigation Header */}
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#393328] px-10 py-5 z-20">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-4 text-white">
                            <div className="size-6 text-[#f29e0d]">
                                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor"></path>
                                </svg>
                            </div>
                            <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>HmarePanditJi</h2>
                        </Link>

                        <nav className="hidden md:flex items-center gap-9">
                            <Link href="/" className="text-white/70 hover:text-white text-sm font-medium transition-colors">Home</Link>
                            <Link href="/search" className="text-white/70 hover:text-white text-sm font-medium transition-colors">Pandits</Link>
                            <Link href="/search" className="text-white/70 hover:text-white text-sm font-medium transition-colors">Pooja</Link>
                            <Link href="/muhurat" className="text-white/70 hover:text-white text-sm font-medium transition-colors">Muhurat</Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-[#393328] rounded-full px-4 py-1.5 text-xs text-[#baaf9c]">
                            <Globe size={16} />
                            <span>Hindi, English, Maithili</span>
                        </div>
                        <Link href="/" className="text-white/70 hover:text-white">
                            <X size={24} />
                        </Link>
                    </div>
                </header>

                {/* Voice Search Main Content */}
                <main className="flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto w-full z-20">
                    <div className="text-center mb-12">
                        <p className="text-[#f29e0d] text-lg font-medium tracking-widest uppercase mb-4" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Listening...</p>

                        {/* Large Pulsating Microphone Area */}
                        <div className="relative flex items-center justify-center">
                            <div className="absolute w-40 h-40 rounded-full border border-[#f29e0d]/20 animate-ping"></div>
                            <div className="absolute w-56 h-56 rounded-full border border-[#f29e0d]/10"></div>
                            <button className="relative z-10 h-28 w-28 bg-[#f29e0d] text-[#181511] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(242,158,13,0.3)] hover:scale-105 transition-transform">
                                <Mic size={54} fill="currentColor" />
                            </button>
                        </div>
                    </div>

                    {/* Waveform Visualization */}
                    <div className="flex items-end justify-center h-12 gap-1.5 mb-16">
                        {[4, 8, 12, 6, 10, 4, 8, 6, 12, 4].map((h, i) => (
                            <div
                                key={i}
                                className="w-1 bg-[#f29e0d] rounded-sm transform origin-bottom animate-[pulse_1s_ease-in-out_infinite]"
                                style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}
                            ></div>
                        ))}
                    </div>

                    {/* Speech Output Transcript */}
                    <div className="text-center max-w-2xl px-6">
                        <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-8" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                            "Main <span className="text-[#f29e0d]">December</span> mein <span className="text-[#f29e0d]">Delhi</span> mein <span className="text-[#f29e0d]">wedding</span> ke liye <span className="text-[#f29e0d]">Maithil Brahmin Pandit</span> chahiye"
                        </h1>
                    </div>

                    {/* Footer Suggestions & Settings */}
                    <div className="mt-auto w-full pb-12">
                        <div className="flex flex-col items-center gap-6 text-center">
                            <p className="text-[#baaf9c] text-sm font-bold leading-normal tracking-wider uppercase">Try saying</p>

                            <div className="flex flex-wrap justify-center gap-3">
                                <button className="bg-[#393328] hover:bg-[#4a4336] text-white px-5 py-3 rounded-xl text-sm transition-all border border-[#4a4336]">
                                    "Kal subah Satyanarayan puja ke liye"
                                </button>
                                <button className="bg-[#393328] hover:bg-[#4a4336] text-white px-5 py-3 rounded-xl text-sm transition-all border border-[#4a4336]">
                                    "Grah Pravesh muhurat in November"
                                </button>
                                <button className="bg-[#393328] hover:bg-[#4a4336] text-white px-5 py-3 rounded-xl text-sm transition-all border border-[#4a4336]">
                                    "Top rated Pandits in South Delhi"
                                </button>
                            </div>

                            {/* Language Selection Sub-bar */}
                            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 text-[#baaf9c] text-sm">
                                <span className="text-xs uppercase font-bold tracking-widest">Voice Settings:</span>
                                <div className="flex gap-6">
                                    {["Hindi", "English", "Maithili"].map((lang) => (
                                        <label key={lang} className={`flex items-center gap-2 cursor-pointer transition-colors ${activeLang === lang ? "text-[#f29e0d]" : "hover:text-white"}`} onClick={() => setActiveLang(lang)}>
                                            <span className={`w-2 h-2 rounded-full ${activeLang === lang ? "bg-[#f29e0d]" : "bg-[#393328]"}`}></span>
                                            {lang}
                                        </label>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </main>

                {/* Decorative Background elements */}
                <div className="absolute top-1/4 -left-24 w-64 h-64 bg-[#f29e0d]/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-1/4 -right-24 w-64 h-64 bg-[#f29e0d]/5 rounded-full blur-[100px] pointer-events-none"></div>

            </div>
        </div>
    );
}
