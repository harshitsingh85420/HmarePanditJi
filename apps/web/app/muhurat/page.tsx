import React from "react";
import Link from "next/link";

// -- API fetch helpers --
async function getDatesData(month: number, year: number, pujaType: string) {
    const url = new URL(`http://localhost:3001/api/v1/muhurat/dates`);
    url.searchParams.set("month", month.toString());
    url.searchParams.set("year", year.toString());
    if (pujaType && pujaType !== "All Pujas") {
        url.searchParams.set("pujaType", pujaType);
    }
    try {
        const res = await fetch(url.toString(), { cache: "no-store", headers: { "Content-Type": "application/json" } });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data?.dates || [];
    } catch (e) {
        console.error("Failed to fetch dates", e);
        return [];
    }
}

async function getPujasForDate(dateParam: string, pujaType: string) {
    const url = new URL(`http://localhost:3001/api/v1/muhurat/pujas-for-date`);
    url.searchParams.set("date", dateParam);
    if (pujaType && pujaType !== "All Pujas") {
        url.searchParams.set("pujaType", pujaType);
    }
    try {
        const res = await fetch(url.toString(), { cache: "no-store", headers: { "Content-Type": "application/json" } });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data?.muhurats || [];
    } catch (e) {
        console.error("Failed to fetch detail", e);
        return [];
    }
}

async function getUpcoming(limit = 10, pujaType = "") {
    const url = new URL(`http://localhost:3001/api/v1/muhurat/upcoming`);
    url.searchParams.set("limit", limit.toString());
    if (pujaType && pujaType !== "All Pujas") {
        url.searchParams.set("pujaType", pujaType);
    }
    try {
        const res = await fetch(url.toString(), { cache: "no-store", headers: { "Content-Type": "application/json" } });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data?.dates || [];
    } catch (e) {
        console.error("Failed to fetch upcoming", e);
        return [];
    }
}

// -- Utility helpers --
const PUJA_TYPES = [
    "All Pujas", "Vivah", "Griha Pravesh", "Satyanarayan",
    "Mundan", "Namkaran", "Havan", "Annaprashan", "Upanayana"
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];

function formatNiceDate(yyyyMmDd: string) {
    const parts = yyyyMmDd.split("-");
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return `${MONTHS[m]} ${d}, ${y}`;
}

const EMOJI_MAP: Record<string, string> = {
    "Vivah": "💍",
    "Griha Pravesh": "🏠",
    "Satyanarayan": "🙏",
    "Mundan": "✂️",
    "Namkaran": "👶",
    "Havan": "🔥",
    "Annaprashan": "🍚",
    "Upanayana": "📿",
};

export default async function MuhuratPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) {
    const dateParam = searchParams.date;
    const paramPujaType = searchParams.pujaType || "All Pujas";

    let targetYear: number;
    let targetMonth: number;

    if (searchParams.month && searchParams.year) {
        targetMonth = parseInt(searchParams.month, 10);
        targetYear = parseInt(searchParams.year, 10);
    } else if (dateParam) {
        const parts = dateParam.split("-");
        targetYear = parseInt(parts[0], 10);
        targetMonth = parseInt(parts[1], 10);
    } else {
        // Current local month/year
        const now = new Date();
        targetYear = now.getFullYear();
        targetMonth = now.getMonth() + 1;
    }

    const [datesData, detailData, upcomingData] = await Promise.all([
        getDatesData(targetMonth, targetYear, paramPujaType),
        dateParam ? getPujasForDate(dateParam, paramPujaType) : Promise.resolve([]),
        getUpcoming(10, paramPujaType),
    ]);

    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const firstDayOfWeek = new Date(targetYear, targetMonth - 1, 1).getDay(); // 0 = Sunday

    const now = new Date();
    const todayY = now.getFullYear();
    const todayM = now.getMonth() + 1;
    const todayD = now.getDate();
    const tsToday = `${todayY}-${todayM < 10 ? "0" + todayM : todayM}-${todayD < 10 ? "0" + todayD : todayD}`;

    const calendarDays = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const mo = targetMonth < 10 ? `0${targetMonth}` : `${targetMonth}`;
        const da = i < 10 ? `0${i}` : `${i}`;
        calendarDays.push(`${targetYear}-${mo}-${da}`);
    }

    let prevMonth = targetMonth - 1;
    let prevYear = targetYear;
    if (prevMonth < 1) {
        prevMonth = 12;
        prevYear--;
    }

    let nextMonth = targetMonth + 1;
    let nextYear = targetYear;
    if (nextMonth > 12) {
        nextMonth = 1;
        nextYear++;
    }

    const prevUrl = `?month=${prevMonth}&year=${prevYear}&pujaType=${encodeURIComponent(paramPujaType)}`;
    const nextUrl = `?month=${nextMonth}&year=${nextYear}&pujaType=${encodeURIComponent(paramPujaType)}`;

    return (
        <div className="min-h-screen bg-orange-50/30">
            {/* Header Section */}
            <section className="bg-white border-b border-orange-100 py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">📅 Muhurat Explorer</h1>
                    <p className="text-gray-600 mb-6">Discover auspicious dates for your upcoming ceremony</p>

                    <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                        {PUJA_TYPES.map((pt) => {
                            const isSelected = pt === paramPujaType;
                            // Keep same month/year or date context when changing filters
                            let href = `?pujaType=${encodeURIComponent(pt)}`;
                            if (dateParam) href += `&date=${dateParam}`;
                            else href += `&month=${targetMonth}&year=${targetYear}`;

                            return (
                                <Link
                                    key={pt}
                                    href={href}
                                    className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm font-medium transition-colors ${isSelected
                                        ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                                        }`}
                                >
                                    {pt}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Main Calendar Area */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">

                            {/* Month Navigation */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-orange-50/50">
                                <Link href={prevUrl} className="p-2 hover:bg-orange-100 rounded-full transition-colors text-orange-600">
                                    <span className="sr-only">Previous Month</span>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                                <h2 className="text-lg font-bold text-gray-800">
                                    {MONTHS[targetMonth - 1]} {targetYear}
                                </h2>
                                <Link href={nextUrl} className="p-2 hover:bg-orange-100 rounded-full transition-colors text-orange-600">
                                    <span className="sr-only">Next Month</span>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                                {DAYS_OF_WEEK.map((d, i) => (
                                    <div key={i} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 border-b border-l border-gray-200 bg-gray-200 gap-[1px]">
                                {calendarDays.map((dayString, index) => {
                                    if (!dayString) {
                                        return <div key={`empty-${index}`} className="bg-white min-h-[60px] md:min-h-[90px]" />;
                                    }

                                    const dParts = dayString.split("-");
                                    const dayNum = parseInt(dParts[2], 10);

                                    const isPast = dayString < tsToday;
                                    const isToday = dayString === tsToday;
                                    const isSelected = dayString === dateParam;

                                    const muhuratData = datesData.find((d: any) => d.date === dayString);
                                    const count = muhuratData?.count || 0;
                                    const hasMuhurat = count > 0;

                                    const isClickable = !isPast && hasMuhurat;

                                    let bgClass = "bg-white";
                                    if (isSelected) bgClass = "bg-orange-100";
                                    else if (isPast) bgClass = "bg-gray-50";

                                    let borderClass = "";
                                    if (hasMuhurat) borderClass = "border-l-4 border-l-amber-500";

                                    const Content = (
                                        <div
                                            className={`min-h-[60px] md:min-h-[90px] relative p-1.5 md:p-2 ${bgClass} ${borderClass} transition-colors ${isClickable ? "hover:bg-orange-50 cursor-pointer" : "cursor-default"
                                                } h-full w-full`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <span
                                                    className={`inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 text-xs md:text-sm font-medium rounded-full ${isToday
                                                        ? "ring-2 ring-blue-500 text-blue-700 font-bold bg-blue-50"
                                                        : isPast
                                                            ? "text-gray-400"
                                                            : "text-gray-700"
                                                        }`}
                                                >
                                                    {dayNum}
                                                </span>
                                            </div>

                                            {hasMuhurat && (
                                                <div className="mt-1 md:mt-2">
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] md:text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                                        <span className="mr-0.5">🔶</span> {count} <span className="hidden md:inline ml-1">Pujas</span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );

                                    return (
                                        <div key={dayString} className="bg-white h-full w-full">
                                            {isClickable ? (
                                                <Link href={`?date=${dayString}&pujaType=${encodeURIComponent(paramPujaType)}`} className="block w-full h-full outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500">
                                                    {Content}
                                                </Link>
                                            ) : (
                                                Content
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Detail Panel */}
                        {dateParam && (
                            <div className="mt-8 bg-white border border-orange-100 rounded-xl shadow-sm overflow-hidden">
                                <div className="bg-orange-500 text-white px-6 py-4">
                                    <h3 className="font-bold text-lg">Muhurats for {formatNiceDate(dateParam)}</h3>
                                </div>
                                <div className="p-6">
                                    {detailData.length === 0 ? (
                                        <p className="text-gray-500 italic text-center py-8">No auspicious timings found for this date.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {detailData.map((m: any, idx: number) => {
                                                const emoji = EMOJI_MAP[m.pujaType] || "✨";
                                                const href = `/search?pujaType=${encodeURIComponent(m.pujaType)}&date=${dateParam}&muhuratTime=${encodeURIComponent(m.timeWindow)}`;

                                                return (
                                                    <div key={idx} className="border border-gray-100 rounded-lg p-5 hover:border-orange-200 transition-colors bg-orange-50/20">
                                                        <h4 className="font-bold text-lg text-gray-900 mb-2">
                                                            {emoji} {m.pujaType} {m.pujaType === "Vivah" && "(Wedding)"}
                                                            {m.pujaType === "Griha Pravesh" && "(Housewarming)"}
                                                        </h4>
                                                        <div className="flex items-center text-gray-700 mb-1">
                                                            <span className="w-5">🕐</span> <span className="font-medium text-amber-800">{m.timeWindow}</span>
                                                        </div>
                                                        {m.significance && (
                                                            <div className="flex items-start text-gray-600 text-sm mb-4">
                                                                <span className="w-5">✨</span> <span>{m.significance}</span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <Link
                                                                href={href}
                                                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 text-sm"
                                                            >
                                                                Find Pandits for This Date →
                                                            </Link>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Bottom CTA (for guests) */}
                        <div className="mt-12 bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">🙏 Ready to book?</h3>
                            <p className="text-gray-600 mb-6">Create a free account to proceed.</p>
                            <Link
                                href="/login?redirect=customer"
                                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                Login / Register
                            </Link>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-80 flex-shrink-0">
                        <div className="sticky top-24">
                            <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
                                <div className="bg-amber-100 border-b border-amber-200 px-5 py-4">
                                    <h3 className="font-bold text-amber-900 flex items-center">
                                        <span className="mr-2">🔮</span> Upcoming Auspicious Dates
                                    </h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {upcomingData.length === 0 ? (
                                        <p className="text-gray-500 italic text-sm p-5 text-center">No upcoming dates found.</p>
                                    ) : (
                                        upcomingData.map((d: any, idx: number) => {
                                            const emoji = EMOJI_MAP[d.pujaType] || "✨";
                                            return (
                                                <div key={idx} className="p-4 hover:bg-orange-50 transition-colors">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-semibold text-gray-900 text-sm">{formatNiceDate(d.date)}</span>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                                                            {emoji} {d.pujaType}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mb-2">🕐 {d.timeWindow}</p>
                                                    <Link
                                                        href={`?date=${d.date}&pujaType=${encodeURIComponent(paramPujaType)}`}
                                                        className="text-xs font-medium text-orange-600 hover:text-orange-700"
                                                    >
                                                        View on Calendar
                                                    </Link>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
