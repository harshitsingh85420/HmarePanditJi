"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PujaCompletionPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const router = useRouter();

    return (
        <div className="flex-1 flex flex-col items-center bg-[#f8f7f5] dark:bg-[#221a10] min-h-screen">
            <div className="max-w-[1000px] w-full px-4 py-8 flex flex-col gap-8">
                {/* Celebration Banner */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#f49d25] to-orange-600 p-8 min-h-[300px] flex flex-col justify-center items-center text-center shadow-xl">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_2px_2px,#f49d25_1px,transparent_0)] bg-[length:24px_24px]"></div>
                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm mb-2">
                            <span className="material-symbols-outlined text-white text-6xl">
                                verified_user
                            </span>
                        </div>
                        <h1 className="text-white text-3xl md:text-5xl font-extrabold tracking-tight">
                            Rituals Completed Successfully!
                        </h1>
                        <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl">
                            May the divine blessings of this sacred ceremony bring peace,
                            prosperity, and joy to your home.
                        </p>
                    </div>
                </div>

                {/* Pandit Profile Section */}
                <div className="bg-white dark:bg-[#221a10]/50 border border-[#f49d25]/10 rounded-xl p-8 flex flex-col items-center gap-6 shadow-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 border-4 border-[#f49d25] ring-4 ring-[#f49d25]/20"
                                style={{
                                    backgroundImage:
                                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCsUG36YqK0JOj07zvKa3oX5JBIE5F8h1skmMBfwWI_z6AjKBd1BFjZ-NrHjNplwKHvdxlv-r5K7LW0m2uxSsmnbeZUB35Ob6KVVSPMLyuYv3gdK9HMDR0L9JOCZvoJN_NRiT5MXDgjyOvkXS_NneLWv0LlDWHMMTb-t2lgRrwFtWT_rG6iK0zPtyij7vQIx6tL9R_6GUCWH68zXuNdPvKoUU-AI9QCcCkBjhREx7wU5d1-1UeE564nBeXlDaNdUoPBPYnh167a8JQ")',
                                }}
                            ></div>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                                <span className="material-symbols-outlined text-sm block">
                                    check
                                </span>
                            </div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-[#181511] dark:text-white text-2xl font-bold">
                                Pandit Vishnu Shastri
                            </h2>
                            <p className="text-[#f49d25] font-semibold">
                                Vedic Scholar &amp; Chief Priest
                            </p>
                            <p className="text-[#8a7960] dark:text-gray-400 text-sm mt-1">
                                Ganesh Puja completed on 25th Oct, 2023 • 10:30 AM
                            </p>
                        </div>
                    </div>
                    <div className="bg-[#f49d25]/5 dark:bg-[#f49d25]/10 p-4 rounded-lg border border-[#f49d25]/20 max-w-lg text-center">
                        <p className="text-[#181511] dark:text-gray-200 italic">
                            "Pandit Vishnu Shastri has shared Digital Blessings with you. These
                            sacred assets are now available in your vault."
                        </p>
                    </div>
                </div>

                {/* Digital Assets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Certificate */}
                    <div className="bg-white dark:bg-[#221a10]/50 p-6 rounded-xl border border-[#f49d25]/10 flex flex-col gap-4 hover:shadow-md transition-shadow">
                        <div className="w-full bg-[#f49d25]/5 rounded-lg flex items-center justify-center aspect-video mb-2 border border-dashed border-[#f49d25]/30">
                            <span className="material-symbols-outlined text-[#f49d25] text-5xl">
                                workspace_premium
                            </span>
                        </div>
                        <div>
                            <h3 className="text-[#181511] dark:text-white font-bold text-lg">
                                Completion Certificate
                            </h3>
                            <p className="text-[#8a7960] dark:text-gray-400 text-sm">
                                Official Muhurat Document verified by HmarePanditJi
                            </p>
                        </div>
                        <button
                            onClick={() => router.push(`/bookings/${id}/certificate`)}
                            className="w-full mt-2 flex items-center justify-center gap-2 bg-[#f49d25]/10 text-[#f49d25] py-3 rounded-lg font-bold hover:bg-[#f49d25] hover:text-white transition-all"
                        >
                            <span className="material-symbols-outlined">download</span>{" "}
                            Download PDF
                        </button>
                    </div>

                    {/* Audio Blessing */}
                    <div className="bg-white dark:bg-[#221a10]/50 p-6 rounded-xl border border-[#f49d25]/10 flex flex-col gap-4 hover:shadow-md transition-shadow">
                        <div className="w-full bg-[#f49d25]/5 rounded-lg flex items-center justify-center aspect-video mb-2 border border-dashed border-[#f49d25]/30">
                            <span className="material-symbols-outlined text-[#f49d25] text-5xl">
                                graphic_eq
                            </span>
                        </div>
                        <div>
                            <h3 className="text-[#181511] dark:text-white font-bold text-lg">
                                Mantra Recording
                            </h3>
                            <p className="text-[#8a7960] dark:text-gray-400 text-sm">
                                Personalized digital audio blessing &amp; chanting
                            </p>
                        </div>
                        <button className="w-full mt-2 flex items-center justify-center gap-2 bg-[#f49d25] text-white py-3 rounded-lg font-bold hover:bg-[#f49d25]/90 transition-all shadow-lg shadow-[#f49d25]/20">
                            <span className="material-symbols-outlined">play_circle</span> Play
                            Audio
                        </button>
                    </div>

                    {/* Receipt */}
                    <div className="bg-white dark:bg-[#221a10]/50 p-6 rounded-xl border border-[#f49d25]/10 flex flex-col gap-4 hover:shadow-md transition-shadow">
                        <div className="w-full bg-[#f49d25]/5 rounded-lg flex items-center justify-center aspect-video mb-2 border border-dashed border-[#f49d25]/30">
                            <span className="material-symbols-outlined text-[#f49d25] text-5xl">
                                receipt_long
                            </span>
                        </div>
                        <div>
                            <h3 className="text-[#181511] dark:text-white font-bold text-lg">
                                E-Receipt
                            </h3>
                            <p className="text-[#8a7960] dark:text-gray-400 text-sm">
                                Complete transaction &amp; samagri summary
                            </p>
                        </div>
                        <button className="w-full mt-2 flex items-center justify-center gap-2 bg-[#f49d25]/10 text-[#f49d25] py-3 rounded-lg font-bold hover:bg-[#f49d25] hover:text-white transition-all">
                            <span className="material-symbols-outlined">download</span>{" "}
                            Download Receipt
                        </button>
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="bg-white dark:bg-[#221a10]/50 border border-[#f49d25]/10 rounded-xl p-8 flex flex-col gap-8 shadow-sm">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-[#181511] dark:text-white">
                            Rate your Experience
                        </h2>
                        <p className="text-[#8a7960] dark:text-gray-400">
                            Your feedback helps us maintain the quality of our spiritual
                            services
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Pandit Rating */}
                        <div className="flex flex-col items-center gap-3">
                            <p className="font-semibold text-sm uppercase tracking-wider text-[#8a7960]">
                                The Pandit
                            </p>
                            <div className="flex gap-1 text-[#f49d25]">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <span
                                        key={i}
                                        className="material-symbols-outlined fill-current"
                                    >
                                        star
                                    </span>
                                ))}
                            </div>
                        </div>
                        {/* Samagri Rating */}
                        <div className="flex flex-col items-center gap-3">
                            <p className="font-semibold text-sm uppercase tracking-wider text-[#8a7960]">
                                Samagri Quality
                            </p>
                            <div className="flex gap-1 text-[#f49d25]">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <span
                                        key={i}
                                        className="material-symbols-outlined fill-current"
                                    >
                                        star
                                    </span>
                                ))}
                            </div>
                        </div>
                        {/* Punctuality Rating */}
                        <div className="flex flex-col items-center gap-3">
                            <p className="font-semibold text-sm uppercase tracking-wider text-[#8a7960]">
                                Punctuality
                            </p>
                            <div className="flex gap-1 text-[#f49d25]">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <span
                                        key={i}
                                        className="material-symbols-outlined fill-current"
                                    >
                                        star
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="w-full">
                        <textarea
                            className="w-full bg-[#f49d25]/5 border-[#f49d25]/10 rounded-xl p-4 focus:ring-[#f49d25] focus:border-[#f49d25] dark:bg-[#221a10]/30 dark:text-white"
                            placeholder="Share more about your experience (optional)"
                            rows={3}
                        ></textarea>
                    </div>
                    <button className="bg-[#f49d25] text-white font-bold py-4 px-8 rounded-xl hover:bg-orange-600 transition-colors self-center min-w-[200px]">
                        Submit Feedback
                    </button>
                </div>
            </div>
        </div>
    );
}
