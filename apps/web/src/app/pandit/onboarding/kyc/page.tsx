"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function VideoKYCPage() {
    const router = useRouter();
    const [isRecording, setIsRecording] = useState(false);
    const [recordingComplete, setRecordingComplete] = useState(false);

    const startRecording = () => {
        setIsRecording(true);
        setTimeout(() => {
            setIsRecording(false);
            setRecordingComplete(true);
        }, 3000);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f6f7f8] dark:bg-[#101922] text-slate-900 dark:text-slate-100 font-sans">
            {/* Header */}
            <header className="flex items-center p-4 justify-between bg-white/5 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
                <button
                    onClick={() => router.back()}
                    className="text-slate-900 dark:text-white flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
                    Verification - Step 2
                </h2>
            </header>

            <main className="flex-1 overflow-y-auto px-4 pb-24">
                {/* Greeting & Intro */}
                <div className="text-center pt-6 pb-4">
                    <h1 className="text-[#137fec] tracking-tight text-[32px] font-bold leading-tight">
                        Namaste Pandit Ji!
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-normal leading-normal mt-2">
                        Please record a short video reciting your name and Aadhaar number.
                    </p>
                </div>

                {/* Video Preview Section */}
                <div className="flex flex-col items-center justify-center py-6">
                    <div className={`relative size-56 rounded-full border-4 border-[#137fec] bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center transition-all duration-500 ${isRecording ? 'shadow-[0_0_0_15px_rgba(19,127,236,0.2)]' : ''}`}>
                        {/* Placeholder for Camera Stream */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"></div>
                        <div
                            className="w-full h-full bg-cover bg-center opacity-80"
                            style={{
                                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBweWytbGdKjhvwlFbBsHWGOqjW3nAKhc_quSzLy4wBGD9plKpkwFSL3mXJtw7ZiH-vKv2MjGGdSFpAwUSpuOJpnwYlw-h-c7fWSt0nxIvoNoA_F2tWe5r09Hvh0KVmpmigkhtqMj1XJ2yu1D-atg6K3eTk_lvbLYjFC1qIXDTfVMPFfPBSCbg8PiCP6-YO73YsdynaPuamXpZ-hY81pCa_p9wE5Gzygb14BJ9f3E445lQ2NQh5fvNbZVGnrwjsUs8sBwTS_uKR9UQ")'
                            }}
                        ></div>

                        {/* REC Indicator */}
                        {isRecording && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider animate-pulse">
                                <span className="size-2 rounded-full bg-white"></span> REC
                            </div>
                        )}

                        {!isRecording && !recordingComplete && (
                            <button
                                onClick={startRecording}
                                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
                            >
                                <span className="material-symbols-outlined text-white text-5xl opacity-80 group-hover:scale-110 transition-transform">videocam</span>
                            </button>
                        )}

                        {recordingComplete && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <span className="material-symbols-outlined text-green-500 text-6xl drop-shadow-lg">check_circle</span>
                            </div>
                        )}
                    </div>

                    {/* Listening Status */}
                    <div className="mt-6 flex flex-col items-center gap-2">
                        <div className={`flex items-center justify-center size-12 rounded-full bg-[#137fec]/20 text-[#137fec] transition-all ${isRecording ? 'scale-110' : ''}`}>
                            <span className="material-symbols-outlined fill-1">mic</span>
                        </div>
                        <p className="text-[#137fec] text-sm font-medium animate-pulse">
                            {isRecording ? "Listening..." : recordingComplete ? "Recorded Successfully" : "Ready to Record"}
                        </p>
                    </div>
                </div>

                {/* Transcription Box */}
                {recordingComplete && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Live Transcription
                            </span>
                            <span className="material-symbols-outlined text-[#137fec] text-sm cursor-pointer hover:underline">
                                edit
                            </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 italic font-medium leading-relaxed">
                            "Mera naam Rajesh Sharma hai, aur mera number..."
                        </p>
                    </div>
                )}

                {/* Aadhaar Upload Section */}
                <div className="mt-8">
                    <h3 className="text-slate-900 dark:text-white font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#137fec]">
                            badge
                        </span>
                        Aadhaar Photo Upload
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Front Side */}
                        <div className="flex flex-col gap-2">
                            <div className="aspect-[3/2] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-slate-400 hover:border-[#137fec] hover:bg-[#137fec]/5 transition-all cursor-pointer group">
                                <span className="material-symbols-outlined text-3xl group-hover:text-[#137fec] mb-1 transition-colors">
                                    add_a_photo
                                </span>
                                <span className="text-[11px] font-semibold group-hover:text-[#137fec] transition-colors">Upload Front</span>
                            </div>
                            <p className="text-[11px] text-center text-slate-500 font-medium">
                                Aadhaar Card - Front
                            </p>
                        </div>
                        {/* Back Side */}
                        <div className="flex flex-col gap-2">
                            <div className="aspect-[3/2] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-slate-400 hover:border-[#137fec] hover:bg-[#137fec]/5 transition-all cursor-pointer group">
                                <span className="material-symbols-outlined text-3xl group-hover:text-[#137fec] mb-1 transition-colors">
                                    add_a_photo
                                </span>
                                <span className="text-[11px] font-semibold group-hover:text-[#137fec] transition-colors">Upload Back</span>
                            </div>
                            <p className="text-[11px] text-center text-slate-500 font-medium">
                                Aadhaar Card - Back
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Sticky Footer Actions */}
            <footer className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#101922]/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <button
                    onClick={() => router.push('/pandit/dashboard')}
                    className="w-full bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[#137fec]/20 flex items-center justify-center gap-2 transform active:scale-95"
                >
                    Save and Continue
                    <span className="material-symbols-outlined text-lg">
                        arrow_forward
                    </span>
                </button>
                <button
                    onClick={() => router.push('/pandit/dashboard')}
                    className="w-full text-slate-500 dark:text-slate-400 font-semibold py-2 text-sm hover:text-[#137fec] transition-colors"
                >
                    Skip for now
                </button>
            </footer>
        </div>
    );
}
