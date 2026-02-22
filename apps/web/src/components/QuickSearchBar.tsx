"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@hmarepanditji/ui";

const SUPPORTED_PUJA_TYPES = [
    "Vivah",
    "Griha Pravesh",
    "Satyanarayan Puja",
    "Mundan",
    "Namkaran",
    "Havan",
];

const SUPPORTED_CITIES = [
    "Delhi NCR",
    "Mumbai",
    "Bangalore",
    "Pune",
    "Varanasi",
    "Haridwar",
    "Ujjain",
];

export function QuickSearchBar() {
    const router = useRouter();
    const [pujaType, setPujaType] = useState("");
    const [city, setCity] = useState("");
    const [date, setDate] = useState("");

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (pujaType) params.set("pujaType", pujaType);
        if (city) params.set("city", city);
        if (date) params.set("date", date);

        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-4 shadow-xl md:p-2 border border-amber-100">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <div className="flex-1 px-2">
                    <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wide">Puja Type</label>
                    <select
                        value={pujaType}
                        onChange={e => setPujaType(e.target.value)}
                        className="w-full rounded-lg border-none py-2 outline-none focus:ring-0 sm:text-sm text-gray-900 bg-transparent font-medium"
                    >
                        <option value="">Any Ceremony</option>
                        {SUPPORTED_PUJA_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="hidden h-10 w-px bg-gray-200 md:block"></div>

                <div className="flex-1 px-2">
                    <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wide">City</label>
                    <select
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="w-full rounded-lg border-none py-2 outline-none focus:ring-0 sm:text-sm text-gray-900 bg-transparent font-medium"
                    >
                        <option value="">Any City</option>
                        {SUPPORTED_CITIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className="hidden h-10 w-px bg-gray-200 md:block"></div>

                <div className="flex-1 px-2">
                    <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full rounded-lg border-none py-2 outline-none focus:ring-0 sm:text-sm text-gray-900 bg-transparent font-medium"
                    />
                </div>

                <div className="px-2 pt-2 md:pt-0 pb-1">
                    <Button onClick={handleSearch} className="h-10 w-full md:w-auto px-6 font-semibold bg-amber-600 hover:bg-amber-700 rounded-lg">
                        Search
                    </Button>
                </div>
            </div>
        </div>
    );
}
