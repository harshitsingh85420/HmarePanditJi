"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface VoiceSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function VoiceSearchModal({ isOpen, onClose }: VoiceSearchModalProps) {
    const router = useRouter();
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [waveformHeight, setWaveformHeight] = useState<number[]>([]);

    // Simulation of listening
    useEffect(() => {
        if (isOpen) {
            setListening(true);
            setTranscript("");
            // Simulate speaking after 1s
            const t1 = setTimeout(() => {
                setTranscript("Main December mein Delhi mein wedding ke liye Maithil Brahmin Pandit chahiye");
                setListening(false);
            }, 3000);

            // Simulate waveform
            const interval = setInterval(() => {
                setWaveformHeight(Array.from({ length: 10 }, () => Math.random() * 24 + 8));
            }, 100);

            return () => {
                clearTimeout(t1);
                clearInterval(interval);
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#f8f7f5] dark:bg-[#181511] text-slate-900 dark:text-white overflow-hidden font-display animate-in fade-in duration-200">
            {/* Navigation Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-[#393328] px-6 lg:px-10 py-5">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 text-[#f29e0d]">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                                    fill="currentColor"
                                ></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">
                            HmarePanditJi
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-2 bg-slate-200 dark:bg-[#393328] rounded-full px-4 py-1.5 text-xs text-slate-600 dark:text-[#baaf9c]">
                        <span className="material-symbols-outlined text-sm">language</span>
                        <span>Hindi, English, Maithili</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-900 dark:text-white/70 dark:hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                </div>
            </header>

            {/* Voice Search Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto w-full">
                <div className="text-center mb-12">
                    <p className="text-[#f29e0d] text-lg font-medium tracking-widest uppercase mb-8">
                        {listening ? "Listening..." : "Processing complete"}
                    </p>
                    {/* Large Pulsating Microphone Area */}
                    <div className="relative flex items-center justify-center">
                        {listening && (
                            <>
                                <div className="absolute w-40 h-40 rounded-full border border-[#f29e0d]/20 animate-ping"></div>
                                <div className="absolute w-56 h-56 rounded-full border border-[#f29e0d]/10"></div>
                            </>
                        )}
                        <button className="relative z-10 w-28 h-28 bg-[#f29e0d] text-[#181511] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(242,158,13,0.3)] transition-transform hover:scale-105 active:scale-95">
                            <span className="material-symbols-outlined text-5xl">mic</span>
                        </button>
                    </div>
                </div>

                {/* Waveform Visualization */}
                <div className="flex items-end justify-center h-16 gap-1.5 mb-16">
                    {waveformHeight.map((h, i) => (
                        <div
                            key={i}
                            className="w-1.5 bg-[#f29e0d] rounded-full transition-all duration-100"
                            style={{ height: listening ? `${h}px` : "4px" }}
                        ></div>
                    ))}
                </div>

                {/* Speech Output Transcript */}
                <div className="text-center max-w-2xl min-h-[120px]">
                    {transcript ? (
                        <h1 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-4">
                            "Main <span className="text-[#f29e0d]">December</span> mein{" "}
                            <span className="text-[#f29e0d]">Delhi</span> mein{" "}
                            <span className="text-[#f29e0d]">wedding</span> ke liye{" "}
                            <span className="text-[#f29e0d]">Maithil Brahmin Pandit</span>{" "}
                            chahiye"
                        </h1>
                    ) : (
                        <h1 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight text-slate-300 dark:text-white/20 mb-8">
                            Speak now...
                        </h1>
                    )}
                </div>

                {/* Footer Suggestions & Settings */}
                <div className="mt-auto w-full pb-12">
                    {!transcript && (
                        <div className="flex flex-col items-center gap-6 animate-in fade-in delay-200">
                            <p className="text-slate-500 dark:text-[#baaf9c] text-sm font-bold leading-normal tracking-wider uppercase">
                                Try saying
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {[
                                    "Kal subah Satyanarayan puja ke liye",
                                    "Grah Pravesh muhurat in November",
                                    "Top rated Pandits in South Delhi",
                                ].map((s) => (
                                    <button
                                        key={s}
                                        className="bg-white dark:bg-[#393328] hover:bg-slate-50 dark:hover:bg-[#4a4336] text-slate-700 dark:text-white px-5 py-3 rounded-xl text-sm transition-all border border-slate-200 dark:border-[#4a4336] shadow-sm"
                                    >
                                        "{s}"
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {transcript && !listening && (
                        <div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 rounded-xl border border-slate-300 dark:border-white/20 font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => router.push("/search?q=" + encodeURIComponent(transcript))}
                                className="px-8 py-3 rounded-xl bg-[#f29e0d] text-[#181511] font-bold shadow-lg shadow-[#f29e0d]/20 hover:bg-[#f29e0d]/90 transition-colors"
                            >
                                Search Pandits
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Decorative Background elements */}
            <div className="absolute top-1/4 -left-24 w-64 h-64 bg-[#f29e0d]/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-24 w-64 h-64 bg-[#f29e0d]/5 rounded-full blur-[100px] pointer-events-none"></div>
        </div>
    );
}
