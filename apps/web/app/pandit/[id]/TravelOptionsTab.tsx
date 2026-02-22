"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function TravelOptionsTab({
    panditId,
    panditLocation,
    travelPreferences
}: {
    panditId: string;
    panditLocation: string;
    travelPreferences: any;
}) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initCity = searchParams.get("city") || "Delhi";

    const [customerCity, setCustomerCity] = useState(initCity);
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<any[]>([]);

    useEffect(() => {
        async function calculateTravel() {
            if (panditLocation.toLowerCase() === customerCity.toLowerCase()) {
                setOptions([]);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch("/api/travel/calculate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fromCity: panditLocation,
                        toCity: customerCity,
                        eventDays: 1,
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    setOptions(data.data || []);
                } else {
                    // fallback / mock if route not fully ready
                    setOptions([
                        {
                            mode: "TRAIN",
                            totalCost: 4300,
                            distanceKm: 845,
                            estimatedDriveHours: 11,
                            breakdown: { baseFare: 2500, localCab: 1600, foodAllowance: 1000 }
                        }
                    ]);
                }
            } catch (err) {
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }

        calculateTravel();
    }, [panditLocation, customerCity]);

    // Support typical cities for demo
    const supportedCities = ["Delhi", "Varanasi", "Mumbai", "Bangalore", "Ayodhya", "Haridwar", "Chennai"];

    return (
        <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">Travel Options</h3>

            <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Event City:</label>
                <select
                    className="w-full md:w-1/2 p-3 bg-white border border-gray-300 rounded-xl shadow-sm font-medium text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                    value={customerCity}
                    onChange={(e) => {
                        setCustomerCity(e.target.value);
                        const params = new URLSearchParams(searchParams.toString());
                        params.set("city", e.target.value);
                        router.replace(`?${params.toString()}`, { scroll: false });
                    }}
                >
                    {supportedCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
            </div>

            {panditLocation.toLowerCase() === customerCity.toLowerCase() ? (
                <div className="bg-green-50 border border-green-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                        <h4 className="text-lg font-bold text-green-800 flex items-center gap-2">
                            <span className="text-2xl pt-1">✅</span> No travel needed
                        </h4>
                        <p className="text-green-700 font-medium mt-1">Pandit Ji is located in your city!</p>
                    </div>
                    <Link
                        href={`/booking/new?panditId=${panditId}`}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition"
                    >
                        Book Directly →
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {loading ? (
                        <div className="animate-pulse flex flex-col gap-4">
                            {[1, 2].map(i => (
                                <div key={i} className="h-40 bg-gray-100 rounded-2xl border border-gray-200"></div>
                            ))}
                        </div>
                    ) : options.length > 0 ? (
                        options.map((opt, idx) => (
                            <div key={idx} className="border border-gray-200 p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition">
                                <div className="flex flex-col md:flex-row justify-between mb-6">
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                            {opt.mode === "TRAIN" ? "🚂 Train (3AC)" : opt.mode === "FLIGHT" ? "✈️ Flight" : "🚗 Cab / Self-Drive"}
                                        </h4>
                                        <p className="text-gray-600 font-medium flex items-center gap-2">
                                            <span className="text-lg font-bold text-orange-600">₹{opt.totalCost} total</span>
                                            <span className="text-gray-300">|</span>
                                            ~{opt.estimatedDriveHours} hours travel time
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                            <span className="font-semibold text-gray-700">{panditLocation}</span>
                                            <span className="text-gray-400">→</span>
                                            <span className="font-semibold text-gray-700">{customerCity}</span>
                                            <span className="bg-gray-100 px-2 py-0.5 rounded ml-2">{opt.distanceKm} km</span>
                                        </p>
                                    </div>
                                    <div className="mt-4 md:mt-0 items-end flex flex-col space-y-3">
                                        <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 text-xs rounded-full border border-blue-200">
                                            Best for: {opt.mode === "TRAIN" ? "Budget friendly" : opt.mode === "FLIGHT" ? "Fastest arrival" : "Convenience"}
                                        </span>
                                        <Link
                                            href={`/booking/new?panditId=${panditId}&travelMode=${opt.mode}&fromCity=${panditLocation}&toCity=${customerCity}`}
                                            className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-bold px-6 py-2.5 rounded-xl transition"
                                        >
                                            Select This Option
                                        </Link>
                                    </div>
                                </div>

                                <details className="mt-4 group border-t border-gray-100 pt-4">
                                    <summary className="cursor-pointer text-sm font-semibold text-orange-600 hover:text-orange-700 list-none flex items-center gap-1">
                                        <span className="transform group-open:rotate-180 transition-transform">▾</span> View Fare Breakdown
                                    </summary>
                                    <div className="pl-5 mt-4 space-y-2 text-sm text-gray-600 bg-orange-50/50 p-4 rounded-xl border border-orange-100/50">
                                        {opt.breakdown && Object.entries(opt.breakdown).map(([k, v]) => (
                                            <div key={k} className="flex justify-between items-center border-b border-orange-100/50 pb-2 last:border-0 last:pb-0">
                                                <span className="capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                <span className="font-semibold text-gray-900">₹{v as number}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-orange-200">
                                            <span className="font-bold text-gray-900">Total Travel Cost</span>
                                            <span className="font-black text-orange-600 text-lg">₹{opt.totalCost}</span>
                                        </div>
                                    </div>
                                </details>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 py-8 bg-gray-50 rounded-2xl text-center border border-gray-100">
                            <div className="text-4xl mb-3 opacity-50">🛤️</div>
                            <h4 className="font-semibold text-gray-900 mb-1">No automated travel paths found</h4>
                            <p className="text-sm">Please select a different city or contact support for manual booking.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
