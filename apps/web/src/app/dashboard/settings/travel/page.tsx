"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TravelPreferencesPage() {
    const router = useRouter();
    const [distance, setDistance] = useState(2500);

    return (
        <main className="max-w-[960px] mx-auto w-full px-4 md:px-10 py-10 min-h-screen bg-[#f8f7f5] dark:bg-[#221b10]">
            <div className="mb-8">
                <h1 className="text-[#181511] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                    Travel Preferences Matrix
                </h1>
                <p className="text-[#8a7b60] dark:text-gray-400 text-base font-normal leading-normal mt-2">
                    Manage your travel limits and accommodation requirements for spiritual
                    services across different regions.
                </p>
            </div>

            {/* Section 1: Distance Limits */}
            <section className="bg-white dark:bg-[#2d2416] p-6 rounded-xl border border-[#e6e2db] dark:border-[#3d3220] shadow-sm mb-6">
                <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-[#f29e0d]">
                        distance
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Section 1: Distance Limits</h2>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-base font-semibold text-slate-900 dark:text-white">
                            Maximum Travel Distance (km)
                        </label>
                        <span className="text-[#f29e0d] font-bold text-lg">
                            {distance} km
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="5000"
                        value={distance}
                        onChange={(e) => setDistance(Number(e.target.value))}
                        className="w-full h-2 bg-[#e6e2db] dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#f29e0d]"
                    />
                    <div className="flex justify-between text-sm text-[#8a7b60] dark:text-gray-400">
                        <span>0 km</span>
                        <span>5000 km</span>
                    </div>
                </div>
            </section>

            {/* Section 2: Travel Mode Matrix */}
            <section className="bg-white dark:bg-[#2d2416] p-6 rounded-xl border border-[#e6e2db] dark:border-[#3d3220] shadow-sm mb-6">
                <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-[#f29e0d]">
                        commute
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Section 2: Travel Mode Matrix</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-[#e6e2db] dark:border-[#3d3220] bg-[#f8f7f5] dark:bg-[#342a1b]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-900 dark:text-white">directions_car</span>
                                <span className="font-bold text-slate-900 dark:text-white">Self-Drive</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f29e0d]"></div>
                            </label>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-[#8a7b60] dark:text-gray-400">
                                <span>Fuel Rate</span>
                                <span className="font-medium text-[#181511] dark:text-white">
                                    ₹12/km
                                </span>
                            </div>
                            <div className="flex justify-between text-[#8a7b60] dark:text-gray-400">
                                <span>Car Type</span>
                                <span className="font-medium text-[#181511] dark:text-white">
                                    SUV / Sedan
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 rounded-lg border border-[#e6e2db] dark:border-[#3d3220] bg-[#f8f7f5] dark:bg-[#342a1b]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-900 dark:text-white">train</span>
                                <span className="font-bold text-slate-900 dark:text-white">Train</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f29e0d]"></div>
                            </label>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-[#8a7b60] dark:text-gray-400">
                                <span>Preference</span>
                                <span className="font-medium text-[#181511] dark:text-white">
                                    3AC Class
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 rounded-lg border border-[#e6e2db] dark:border-[#3d3220] bg-[#f8f7f5] dark:bg-[#342a1b]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-900 dark:text-white">flight</span>
                                <span className="font-bold text-slate-900 dark:text-white">Flight</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f29e0d]"></div>
                            </label>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-[#8a7b60] dark:text-gray-400">
                                <span>Preference</span>
                                <span className="font-medium text-[#181511] dark:text-white">
                                    Economy
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 rounded-lg border border-[#e6e2db] dark:border-[#3d3220] bg-[#f8f7f5] dark:bg-[#342a1b]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-900 dark:text-white">local_taxi</span>
                                <span className="font-bold text-slate-900 dark:text-white">Cab</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f29e0d]"></div>
                            </label>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-[#8a7b60] dark:text-gray-400">
                                <span>Type</span>
                                <span className="font-medium text-[#181511] dark:text-white">
                                    Intercity / Prime
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Accommodation */}
            <section className="bg-white dark:bg-[#2d2416] p-6 rounded-xl border border-[#e6e2db] dark:border-[#3d3220] shadow-sm mb-6">
                <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-[#f29e0d]">
                        hotel
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Section 3: Accommodation Preferences</h2>
                </div>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">Minimum Rating</p>
                            <p className="text-sm text-[#8a7b60] dark:text-gray-400">
                                Minimum standard for overnight stays
                            </p>
                        </div>
                        <div className="flex gap-1 text-[#f29e0d]">
                            {[1, 2, 3].map((s) => (
                                <span key={s} className="material-symbols-outlined fill-1">star</span>
                            ))}
                            {[4, 5].map((s) => (
                                <span key={s} className="material-symbols-outlined text-gray-300">star</span>
                            ))}
                        </div>
                    </div>
                    <hr className="border-[#e6e2db] dark:border-[#3d3220]" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">No Shared Room</p>
                            <p className="text-sm text-[#8a7b60] dark:text-gray-400">
                                Private accommodation only
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f29e0d]"></div>
                        </label>
                    </div>
                </div>
            </section>

            {/* Section 4: Special Requirements */}
            <section className="bg-white dark:bg-[#2d2416] p-6 rounded-xl border border-[#e6e2db] dark:border-[#3d3220] shadow-sm mb-10">
                <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-[#f29e0d]">
                        assignment_ind
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Section 4: Special Requirements</h2>
                </div>
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="pt-1">
                            <input
                                type="checkbox"
                                defaultChecked
                                className="w-5 h-5 text-[#f29e0d] border-gray-300 rounded focus:ring-[#f29e0d] dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">Need Assistant for Large Ceremonies</p>
                            <p className="text-sm text-[#8a7b60] dark:text-gray-400">
                                Require one additional Sahayak for events with 50+ attendees.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-semibold mb-2 text-slate-900 dark:text-white">
                            Additional Notes
                        </label>
                        <textarea
                            className="w-full p-4 rounded-lg border border-[#e6e2db] dark:border-[#3d3220] bg-[#f8f7f5] dark:bg-[#342a1b] text-sm focus:border-[#f29e0d] focus:ring-[#f29e0d] outline-none min-h-[100px] text-slate-900 dark:text-white"
                            placeholder="Add any other specific travel or stay requirements..."
                        ></textarea>
                    </div>
                </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-4 mb-20">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 py-3 px-6 rounded-lg bg-[#f29e0d] text-white font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg shadow-[#f29e0d]/20"
                >
                    Save Preferences
                </button>
                <button
                    onClick={() => router.back()}
                    className="flex-1 py-3 px-6 rounded-lg border-2 border-[#e6e2db] dark:border-[#3d3220] font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-slate-900 dark:text-white"
                >
                    Discard Changes
                </button>
            </div>
        </main>
    );
}
