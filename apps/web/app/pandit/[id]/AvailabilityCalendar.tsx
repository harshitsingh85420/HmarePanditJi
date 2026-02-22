"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AvailabilityCalendar({ panditId }: { panditId: string }) {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());
    const [dates, setDates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    useEffect(() => {
        async function fetchCalendar() {
            setLoading(true);
            try {
                const res = await fetch(`/api/pandits/${panditId}/availability?month=${month}&year=${year}`);
                if (res.ok) {
                    const json = await res.json();
                    setDates(json.data || []);
                } else {
                    setDates([]);
                }
            } catch (err) {
                setDates([]);
            } finally {
                setLoading(false);
            }
        }
        fetchCalendar();
    }, [panditId, month, year]);

    const handlePrevMonth = () => {
        if (month === 1) {
            setMonth(12);
            setYear(y => y - 1);
        } else {
            setMonth(m => m - 1);
        }
    };

    const handleNextMonth = () => {
        if (month === 12) {
            setMonth(1);
            setYear(y => y + 1);
        } else {
            setMonth(m => m + 1);
        }
    };

    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
    const isPastMonth = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth() + 1);

    return (
        <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">Availability Calendar</h3>

            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm mb-8">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <button
                        onClick={handlePrevMonth}
                        disabled={isPastMonth}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        ←
                    </button>
                    <h4 className="text-xl font-black text-gray-900">{monthName} <span className="text-orange-600 ml-1">{year}</span></h4>
                    <button
                        onClick={handleNextMonth}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 hover:bg-orange-50 hover:text-orange-600 shadow-sm transition"
                    >
                        →
                    </button>
                </div>

                {loading ? (
                    <div className="animate-pulse grid grid-cols-7 gap-3 mt-4">
                        {Array.from({ length: 31 }).map((_, i) => (
                            <div key={i} className="aspect-square bg-gray-100 rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-7 gap-3">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                            <div key={d} className="text-center text-xs font-bold uppercase text-gray-400 pb-2">{d}</div>
                        ))}

                        {/* Pad start days if needed */}
                        {Array.from({ length: new Date(year, month - 1, 1).getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} className="opacity-0" />
                        ))}

                        {dates.map((dObj) => {
                            const dayNum = parseInt(dObj.date.split('-')[2], 10);
                            const { status, reason } = dObj;

                            let bgClass = "bg-gray-50 text-gray-400 border border-gray-100";
                            let ringClass = "";

                            if (status === "available") {
                                bgClass = "bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer border border-green-200 font-bold shadow-sm";
                                ringClass = "hover:ring-2 hover:ring-green-400 hover:ring-offset-2";
                            } else if (status === "booked") {
                                bgClass = "bg-orange-100 text-orange-800 border-none opacity-80 cursor-not-allowed";
                                ringClass = "border border-orange-200";
                            } else if (status === "blocked") {
                                bgClass = "bg-red-50 text-red-800 border-none opacity-80 cursor-not-allowed text-xs flex flex-col items-center justify-center p-0 line-through decoration-red-300";
                            } else if (status === "past") {
                                bgClass = "bg-gray-100 text-gray-400 border border-gray-100 cursor-not-allowed opacity-50";
                            }

                            return (
                                <div
                                    key={dObj.date}
                                    title={status === "available" ? "Available" : status === "booked" ? "1 booking" : reason || status}
                                    onClick={() => {
                                        if (status === "available") {
                                            router.push(`/booking/new?panditId=${panditId}&date=${dObj.date}`);
                                        }
                                    }}
                                    className={`aspect-square flex items-center justify-center rounded-2xl transition transform active:scale-95 ${bgClass} ${ringClass}`}
                                >
                                    {dayNum}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-4 border-t border-gray-100 text-sm font-medium">
                    <div className="flex items-center gap-2 text-gray-700"><span className="w-4 h-4 rounded-full bg-green-50 border border-green-200 inline-block shadow-sm" /> Available</div>
                    <div className="flex items-center gap-2 text-gray-700"><span className="w-4 h-4 rounded-full bg-orange-100 inline-block shadow-sm border border-orange-200 opacity-80" /> Booked</div>
                    <div className="flex items-center gap-2 text-gray-700"><span className="w-4 h-4 rounded-full bg-red-50 inline-block shadow-sm border border-red-100 opacity-80" /> Blocked</div>
                </div>
            </div>
        </div>
    );
}
