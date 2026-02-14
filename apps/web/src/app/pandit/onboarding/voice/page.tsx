"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VoiceProfileSetupPage() {
    const router = useRouter();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");

    const handleMicClick = () => {
        setIsListening(true);
        // Simulate listening delay
        setTimeout(() => {
            setTranscript("Mera naam Rajesh Sharma hai, aur mera number 9876543210 hai.");
            setIsListening(false);
        }, 3000);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f6f6] dark:bg-[#211114] text-[#181112] dark:text-[#f8f6f6] font-sans">
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-[#e5dcdd] dark:border-[#3d2a2d] px-10 py-3 bg-white dark:bg-[#211114] sticky top-0 z-50">
                <div className="flex items-center gap-4 text-[#cf1736]">
                    <div className="size-6">
                        <span className="material-symbols-outlined text-2xl">temple_hindu</span>
                    </div>
                    <h2 className="text-[#181112] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                        HmarePanditJi
                    </h2>
                </div>
                <div className="hidden md:flex flex-1 justify-end gap-8">
                    <div className="flex items-center gap-9">
                        <a href="#" className="text-[#181112] dark:text-white text-sm font-medium">Services</a>
                        <a href="#" className="text-[#181112] dark:text-white text-sm font-medium">Travel</a>
                        <a href="#" className="text-[#181112] dark:text-white text-sm font-medium">Support</a>
                    </div>
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#cf1736]"
                        style={{
                            backgroundImage:
                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAfxAuLcTLqtjpAYgR9tfdHEykLJGIcfH0X8jGMWm_ePeipk7zot1aRnSpH05GqMHFLqc9NiyfNpPcXOYxyV6S0Zfw7PmXXPy4o3INzKHf0se5oIUZtWQcGNneUEJgV2ueyKTzt_T7PN5KaNicofwmxi8dy5jDoXibmgIzpj13N6yin5hnRPuP9lObOJTIp-FvlHSMvoAkvjg0CBH-qJYhp80YixLSkMe5_cIcr5l8CD9vZbPyHILYFC4r6MoVwcLG9_jXEfTqxsPM")',
                        }}
                    ></div>
                </div>
            </header>

            <main className="flex flex-1 justify-center py-10 px-4">
                <div className="flex flex-col max-w-[600px] flex-1">
                    {/* Progress Header */}
                    <div className="flex flex-col gap-4 mb-8">
                        <div className="flex gap-6 justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[#cf1736] text-xs font-bold uppercase tracking-wider">
                                    Registration
                                </span>
                                <p className="text-[#181112] dark:text-white text-lg font-bold leading-normal">
                                    Profile Setup
                                </p>
                            </div>
                            <p className="text-[#181112] dark:text-white text-sm font-bold leading-normal">
                                Step 1 of 4
                            </p>
                        </div>
                        <div className="h-3 rounded-full bg-[#e5dcdd] dark:bg-[#3d2a2d] overflow-hidden">
                            <div
                                className="h-full rounded-full bg-[#cf1736]"
                                style={{ width: "25%" }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-[#886369] dark:text-[#b09498] uppercase tracking-tighter">
                            <span className="text-[#cf1736]">Personal</span>
                            <span>Verification</span>
                            <span>Specialization</span>
                            <span>Travel</span>
                        </div>
                    </div>

                    {/* Voice Interaction Card */}
                    <div className="bg-white dark:bg-[#2d1a1d] rounded-xl shadow-sm border border-[#e5dcdd] dark:border-[#3d2a2d] p-8 flex flex-col items-center text-center transition-all duration-300">
                        <h1 className="text-[#cf1736] tracking-tight text-3xl font-bold leading-tight mb-2">
                            Namaste Pandit Ji!
                        </h1>
                        <p className="text-[#181112] dark:text-white text-xl font-medium mb-12">
                            Apna pura naam aur mobile number bolein.
                        </p>

                        <div className="relative flex items-center justify-center mb-8">
                            {isListening && (
                                <div className="absolute size-40 bg-[#cf1736]/10 rounded-full animate-pulse"></div>
                            )}
                            <div className={`absolute size-32 bg-[#cf1736]/20 rounded-full transition-all ${isListening ? 'scale-110' : 'scale-100'}`}></div>
                            <button
                                onClick={handleMicClick}
                                className="relative flex shrink-0 items-center justify-center rounded-full size-24 bg-[#cf1736] text-white shadow-lg hover:bg-[#cf1736]/90 transition-all z-10"
                            >
                                <span className="material-symbols-outlined !text-4xl">mic</span>
                            </button>
                        </div>

                        {isListening ? (
                            <div className="flex items-center gap-2 mb-12 animate-in fade-in zoom-in duration-300">
                                <div className="flex gap-1">
                                    <div className="size-1.5 bg-[#cf1736] rounded-full animate-bounce"></div>
                                    <div className="size-1.5 bg-[#cf1736] rounded-full animate-bounce delay-75"></div>
                                    <div className="size-1.5 bg-[#cf1736] rounded-full animate-bounce delay-150"></div>
                                </div>
                                <span className="text-[#cf1736] font-bold text-lg">Listening...</span>
                            </div>
                        ) : transcript ? (
                            <div className="w-full bg-[#f8f6f6] dark:bg-[#211114] p-6 rounded-lg border border-dashed border-[#e5dcdd] dark:border-[#3d2a2d] mb-8 animate-in slide-in-from-bottom-4">
                                <p className="text-[#886369] dark:text-[#b09498] italic text-lg">"{transcript}"</p>
                            </div>
                        ) : (
                            <div className="h-12 mb-8"></div> // Spacer
                        )}
                    </div>

                    {/* Aadhaar Upload Section */}
                    <div className="mt-8">
                        <h3 className="text-[#181112] dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#cf1736]">
                                badge
                            </span>
                            Aadhaar Photo Upload
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#e5dcdd] dark:border-[#3d2a2d] bg-white dark:bg-[#2d1a1d] rounded-xl p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#362124] transition-colors group">
                                <span className="material-symbols-outlined !text-4xl text-[#cf1736] mb-2 group-hover:scale-110 transition-transform">
                                    add_a_photo
                                </span>
                                <span className="text-sm font-bold text-[#181112] dark:text-white">
                                    Front Side
                                </span>
                                <span className="text-xs text-[#886369] dark:text-[#b09498]">
                                    Aadhaar card front photo
                                </span>
                            </div>
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#e5dcdd] dark:border-[#3d2a2d] bg-white dark:bg-[#2d1a1d] rounded-xl p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#362124] transition-colors group">
                                <span className="material-symbols-outlined !text-4xl text-[#cf1736] mb-2 group-hover:scale-110 transition-transform">
                                    add_a_photo
                                </span>
                                <span className="text-sm font-bold text-[#181112] dark:text-white">
                                    Back Side
                                </span>
                                <span className="text-xs text-[#886369] dark:text-[#b09498]">
                                    Aadhaar card back photo
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-10 flex gap-4">
                        <button className="flex-1 py-4 px-6 border border-[#e5dcdd] dark:border-[#3d2a2d] rounded-xl font-bold text-[#181112] dark:text-white hover:bg-gray-100 dark:hover:bg-[#362124] transition-colors">
                            Skip for now
                        </button>
                        <button
                            onClick={() => router.push('/pandit/onboarding/kyc')}
                            className="flex-[2] py-4 px-6 bg-[#cf1736] text-white rounded-xl font-bold shadow-md hover:bg-[#cf1736]/90 transition-all transform hover:-translate-y-0.5"
                        >
                            Save and Continue
                        </button>
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-sm text-[#886369] dark:text-[#b09498]">
                            Need help? Call our support at{" "}
                            <a className="text-[#cf1736] font-bold hover:underline" href="#">
                                1800-PANDIT
                            </a>
                        </p>
                    </div>
                </div>
            </main>

            <footer className="mt-auto py-6 px-10 border-t border-[#e5dcdd] dark:border-[#3d2a2d] text-center bg-white dark:bg-[#211114]">
                <p className="text-xs text-[#886369] dark:text-[#b09498]">
                    © 2024 HmarePanditJi Spiritual Services. Accessible Design for
                    Everyone.
                </p>
            </footer>
        </div>
    );
}
