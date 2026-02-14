"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CertificatePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const certificateRef = useRef(null);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f7f6] dark:bg-[#221910] text-[#332c26] dark:text-gray-100 font-serif">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#2d241b]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back
                        </button>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                                Order #HPJ-{params.id}
                            </span>
                            <button
                                onClick={handlePrint}
                                className="bg-[#ec7f13] hover:bg-[#d16d0c] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-[#ec7f13]/30 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">download</span>
                                <span className="hidden sm:inline">Download PDF</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-pattern-mandala">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Certificate Preview */}
                    <div className="lg:col-span-8 flex justify-center">
                        {/* Certificate Container */}
                        <div
                            ref={certificateRef}
                            className="relative bg-white text-gray-900 w-full max-w-[800px] aspect-[1/1.414] sm:aspect-[1.414/1] shadow-2xl rounded-sm overflow-hidden flex flex-col"
                            id="printable-certificate"
                        >
                            {/* Decorative Background Layer */}
                            <div
                                className="absolute inset-0 opacity-5 pointer-events-none bg-cover bg-center"
                                style={{
                                    backgroundImage:
                                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBrSi67UAHj157DAtzx-OlLttpvVtmRnRhUl7zTcEsGPeO9_zBAQ6BoNIhAAi31u8Opm63vOxfj9xLmKjA9Tu-NShfJfwdwhYVpZYJFdZ-5pUvKXncl-ag9y9ZMOMInMMLDG5j_ImA5seDjH-lu82EHvePLDm8oOEfXfZmE4IleNGwaoOG2waC6vEbS5PuX46HAOBxqzmm0Vi15hWKZwQWCggMP69Se2O698h_H-z2CjLmOy9Wz1XGxHGJk-ilRnlV9BvV80IzetNw")',
                                }}
                            ></div>
                            {/* Inner Border Container */}
                            <div className="absolute inset-4 sm:inset-6 border-[3px] border-[#ec7f13] border-double flex flex-col items-center justify-between p-6 sm:p-10 z-10">
                                {/* Corner Ornaments */}
                                <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-[#ec7f13] rounded-tl-xl opacity-80"></div>
                                <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-[#ec7f13] rounded-tr-xl opacity-80"></div>
                                <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-[#ec7f13] rounded-bl-xl opacity-80"></div>
                                <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-[#ec7f13] rounded-br-xl opacity-80"></div>

                                {/* Certificate Header */}
                                <div className="text-center w-full">
                                    <div className="text-[#ec7f13] text-4xl sm:text-5xl mb-2 font-serif opacity-90">
                                        ॐ
                                    </div>
                                    <h1
                                        className="text-3xl sm:text-4xl font-bold text-[#ec7f13] uppercase tracking-widest mb-1"
                                        style={{ fontVariant: "small-caps" }}
                                    >
                                        Shubh Muhurat Patrika
                                    </h1>
                                    <div className="h-px w-32 bg-[#ec7f13]/40 mx-auto my-3"></div>
                                    <p className="text-lg sm:text-xl text-gray-600 italic">
                                        Auspicious Timing for Vivah Sanskar
                                    </p>
                                </div>

                                {/* Main Content Body */}
                                <div className="flex-grow flex flex-col justify-center w-full my-4">
                                    {/* Names */}
                                    <div className="text-center mb-8">
                                        <p className="text-gray-500 mb-2 uppercase text-xs tracking-widest">
                                            Blessed Union Of
                                        </p>
                                        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                                            Vikram Sharma{" "}
                                            <span className="text-[#ec7f13] mx-2">&amp;</span> Anjali
                                            Gupta
                                        </h2>
                                    </div>
                                    {/* Grid Details */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
                                        <div className="border border-[#ec7f13]/20 bg-[#ec7f13]/5 p-4 rounded text-center">
                                            <span className="material-symbols-outlined text-[#ec7f13] mb-1 text-xl">
                                                event
                                            </span>
                                            <p className="text-sm text-gray-500 uppercase tracking-wide">
                                                Date
                                            </p>
                                            <p className="text-xl font-bold text-gray-800">
                                                16 December 2024
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Monday, Margashirsha Shukla Paksha
                                            </p>
                                        </div>
                                        <div className="border border-[#ec7f13]/20 bg-[#ec7f13]/5 p-4 rounded text-center">
                                            <span className="material-symbols-outlined text-[#ec7f13] mb-1 text-xl">
                                                schedule
                                            </span>
                                            <p className="text-sm text-gray-500 uppercase tracking-wide">
                                                Muhurat Time
                                            </p>
                                            <p className="text-xl font-bold text-gray-800">
                                                10:00 AM - 12:45 PM
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Abhijit Muhurat Included
                                            </p>
                                        </div>
                                    </div>
                                    {/* Planetary Details */}
                                    <div className="mt-8 text-center max-w-2xl mx-auto">
                                        <h3 className="text-[#ec7f13] font-bold text-sm uppercase tracking-wider mb-2">
                                            Planetary Alignment
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            Sun in Sagittarius, Moon in Rohini Nakshatra. Jupiter
                                            (Guru) aspecting the 7th house ensures long-term
                                            prosperity. Venus is exalted, signifying strong affection
                                            and harmony.
                                        </p>
                                    </div>
                                </div>

                                {/* Footer / Verification */}
                                <div className="w-full flex flex-col sm:flex-row justify-between items-end border-t border-[#ec7f13]/20 pt-6 mt-4">
                                    <div className="text-center sm:text-left mb-4 sm:mb-0">
                                        <p className="text-xs text-gray-400 mb-1">Prepared by</p>
                                        <div
                                            className="font-serif text-2xl text-[#ec7f13] font-bold italic"
                                            style={{ fontFamily: "cursive" }}
                                        >
                                            Pandit R.K. Shastri
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Certified Astrologer, Varanasi
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white p-2 rounded border border-gray-100 shadow-sm">
                                        <div className="bg-gray-900 p-1 rounded-sm">
                                            <div className="w-16 h-16 bg-white flex items-center justify-center overflow-hidden relative">
                                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HmarePanditJi-Cert-88" alt="QR" className="opacity-90" />
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                                                Scan to Verify
                                            </p>
                                            <p className="text-xs font-bold text-gray-800">
                                                ID: HPJ-88
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {/* Watermark Logo */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-[10px] text-[#ec7f13]/40 uppercase tracking-[0.3em]">
                                    HmarePanditJi Official Document
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Actions & Details (Hidden in print) */}
                    <div className="lg:col-span-4 space-y-6 print:hidden">
                        {/* Status Card */}
                        <div className="bg-white dark:bg-[#2d241b] rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                    Certificate Status
                                </h3>
                                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-full uppercase tracking-wide">
                                    Ready
                                </span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Generated On
                                    </span>
                                    <span className="text-gray-900 dark:text-gray-200 font-medium">
                                        14 Oct 2024
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Validity
                                    </span>
                                    <span className="text-gray-900 dark:text-gray-200 font-medium">
                                        Lifetime Digital
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Astrologer
                                    </span>
                                    <span className="text-[#ec7f13] font-medium cursor-pointer hover:underline">
                                        Pt. R.K. Shastri
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white dark:bg-[#2d241b] rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                                Actions
                            </h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-center gap-2 bg-[#ec7f13] hover:bg-[#d16d0c] text-white p-3 rounded-lg transition-colors font-medium">
                                    <span className="material-symbols-outlined text-sm">share</span>
                                    Share via WhatsApp
                                </button>
                                <button className="w-full flex items-center justify-center gap-2 bg-white dark:bg-[#2d241b] border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 p-3 rounded-lg transition-colors font-medium">
                                    <span className="material-symbols-outlined text-sm">email</span>
                                    Email to Client
                                </button>
                            </div>
                        </div>
                        {/* Additional Info */}
                        <div className="bg-[#ec7f13]/5 dark:bg-[#ec7f13]/10 rounded-xl p-6 border border-[#ec7f13]/20">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-[#ec7f13] mt-1">
                                    info
                                </span>
                                <div>
                                    <h4 className="font-bold text-[#ec7f13] mb-1">Did you know?</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        This Muhurat includes the{" "}
                                        <span className="font-semibold">Abhijit Muhurat</span>, which
                                        is considered highly auspicious for removing all obstacles
                                        (doshas).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
