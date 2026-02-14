"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BookingRequestPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    return (
        <div className="flex flex-col h-screen bg-[#f8f7f5] dark:bg-[#221810] text-[#181411] dark:text-[#f8f7f5] antialiased overflow-hidden">
            {/* Mobile centered container */}
            <div className="relative mx-auto max-w-md w-full h-full flex flex-col bg-white dark:bg-[#1a130d] shadow-xl">
                {/* Header / Navigation */}
                <div className="sticky top-0 z-20 bg-white dark:bg-[#1a130d] border-b border-[#f48525]/10">
                    <div className="flex items-center px-4 py-4 justify-between">
                        <button
                            onClick={() => router.back()}
                            className="text-[#181411] dark:text-white flex size-10 items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
                            Booking Request
                        </h2>
                    </div>
                    {/* Urgent Banner */}
                    <div className="bg-[#f48525]/10 border-y border-[#f48525]/20 px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[#f48525] text-xs font-bold uppercase tracking-wider">
                                New Booking Request
                            </p>
                            <div className="flex items-center gap-1.5 bg-white dark:bg-[#f48525] px-2 py-1 rounded shadow-sm">
                                <span className="material-symbols-outlined text-sm text-[#f48525] dark:text-white">
                                    timer
                                </span>
                                <p className="text-[#f48525] dark:text-white text-sm font-bold font-mono leading-none">
                                    04:59
                                </p>
                            </div>
                        </div>
                        <div className="w-full bg-white/50 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div
                                className="bg-[#f48525] h-full transition-all duration-500 rounded-full"
                                style={{ width: "80%" }}
                            ></div>
                        </div>
                        <p className="text-[#8a7460] dark:text-[#c7b8a9] text-[11px] mt-1.5 font-medium italic">
                            Expiring soon. Please respond quickly.
                        </p>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pb-32">
                    {/* Map View */}
                    <div className="p-4">
                        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-[#e6e0db] dark:border-[#3d2c1d]">
                            <div
                                className="absolute inset-0 bg-center bg-no-repeat bg-cover"
                                style={{
                                    backgroundImage:
                                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDIoxx_fhxfS9zQ8hb-WiDUk8S2Bu7tuATruzjqo0aHkheQGkNg7zCqYykAyrRa4UM-qFBV5QylIu4z5hxPzWnDwgtiqU72Atodh7HGXonBwg14y3itCP9mJB6uq_moon4eCQQ1VFpUAfaXK0TXgqKI-xb9CJQTbesdRH1mTyaT8DQ_jcyxw4wSmS0YjQLwNTbytJSaOcfJCONUMYlioIPakjofZl8GIUqasC-XIIHG7AQhICjNAtTub-ULRO8I9v7e1RwSa4XDHrU")',
                                }}
                            ></div>
                            {/* Map Overlays */}
                            <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-[#221810]/90 backdrop-blur-sm p-2 rounded-lg text-[10px] font-semibold border border-[#f48525]/20">
                                <div className="flex items-center gap-1 text-[#181411] dark:text-white">
                                    <span className="material-symbols-outlined text-xs text-[#f48525]">
                                        navigation
                                    </span>
                                    12.4 km (45 mins)
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Event Details Card */}
                    <div className="px-4 py-2">
                        <div className="bg-[#f8f7f5] dark:bg-[#221810]/30 rounded-xl p-4 border border-[#e6e0db] dark:border-[#3d2c1d]">
                            <h3 className="text-sm font-bold text-[#f48525] mb-3 uppercase tracking-wide">
                                Event Overview
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="bg-[#f48525]/10 p-2 rounded-lg">
                                        <span className="material-symbols-outlined text-[#f48525]">
                                            celebration
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[13px] text-[#8a7460] dark:text-[#c7b8a9]">
                                            Occasion
                                        </p>
                                        <p className="text-base font-bold leading-tight">
                                            Delhi Grand Wedding
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-[#f48525]/10 p-2 rounded-lg">
                                            <span className="material-symbols-outlined text-[#f48525]">
                                                calendar_month
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[13px] text-[#8a7460] dark:text-[#c7b8a9]">
                                                Dates
                                            </p>
                                            <p className="text-sm font-semibold">Dec 15 - 17</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-[#f48525]/10 p-2 rounded-lg">
                                            <span className="material-symbols-outlined text-[#f48525]">
                                                directions_car
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[13px] text-[#8a7460] dark:text-[#c7b8a9]">
                                                Travel
                                            </p>
                                            <p className="text-sm font-semibold">Self-Drive</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 pt-2 border-t border-[#e6e0db] dark:border-[#3d2c1d]">
                                    <div className="bg-[#f48525]/10 p-2 rounded-lg">
                                        <span className="material-symbols-outlined text-[#f48525]">
                                            inventory_2
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[13px] text-[#8a7460] dark:text-[#c7b8a9]">
                                            Samagri
                                        </p>
                                        <p className="text-sm font-semibold">
                                            Premium Package (Full Kit)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Earnings Breakdown */}
                    <div className="px-4 py-4">
                        <h3 className="text-sm font-bold text-[#181411] dark:text-white mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#f48525]">
                                payments
                            </span>
                            Earnings Breakdown
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[#8a7460] dark:text-[#c7b8a9]">
                                    Dakshina (Service Fee)
                                </span>
                                <span className="font-medium">₹40,000</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[#8a7460] dark:text-[#c7b8a9]">
                                    Travel Allowance
                                </span>
                                <span className="font-medium">₹2,500</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[#8a7460] dark:text-[#c7b8a9]">
                                    Food &amp; Stay Allowance
                                </span>
                                <span className="font-medium">₹3,250</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[#8a7460] dark:text-[#c7b8a9]">
                                    Samagri Reimbursement
                                </span>
                                <span className="font-medium">₹7,000</span>
                            </div>
                            <div className="pt-3 border-t-2 border-dashed border-[#e6e0db] dark:border-[#3d2c1d]">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-base font-bold text-[#181411] dark:text-white">
                                            Guaranteed Total
                                        </p>
                                        <p className="text-[11px] text-[#8a7460] dark:text-[#c7b8a9]">
                                            Credited within 24hrs of completion
                                        </p>
                                    </div>
                                    <span className="text-xl font-extrabold text-[#f48525]">
                                        ₹52,750
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Footer Actions */}
                <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 dark:bg-[#1a130d]/80 backdrop-blur-md border-t border-[#e6e0db] dark:border-[#3d2c1d] px-4 pb-8 pt-4 z-30">
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => router.push(`/pandit/bookings/${params.id}/itinerary`)}
                            className="w-full bg-[#f48525] hover:bg-[#d6731e] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#f48525]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">check_circle</span>
                            ACCEPT BOOKING
                        </button>
                        <button className="w-full bg-transparent hover:bg-red-50 text-red-500 dark:text-red-400 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">cancel</span>
                            REJECT REQUEST
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
