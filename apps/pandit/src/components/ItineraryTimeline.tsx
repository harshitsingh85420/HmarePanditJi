"use client";

/**
 * ItineraryTimeline (Prompt 11, Section 2)
 * Vertical day-by-day cards for active bookings showing activities, 
 * food allowance per day, and total summary.
 */

interface Activity {
    time: string;
    description: string;
    type: "travel" | "puja" | "rest" | "meal" | "checkin";
}

interface ItineraryDay {
    dayNumber: number;
    date: string;
    label: string; // e.g. "Travel Day", "Puja Day", "Return Day"
    activities: Activity[];
    foodAllowance: number; // ₹ per day
}

const ACTIVITY_META: Record<string, { icon: string; color: string }> = {
    travel: { icon: "directions_bus", color: "text-blue-600" },
    puja: { icon: "temple_hindu", color: "text-amber-600" },
    rest: { icon: "hotel", color: "text-purple-600" },
    meal: { icon: "restaurant", color: "text-green-600" },
    checkin: { icon: "check_circle", color: "text-emerald-600" },
};

function fmtRupees(n: number) {
    return "₹" + n.toLocaleString("en-IN");
}

export default function ItineraryTimeline({
    days,
}: {
    days: ItineraryDay[];
}) {
    if (!days || days.length === 0) {
        return (
            <div className="text-center text-gray-400 py-6">
                <span className="material-symbols-outlined text-4xl">event_note</span>
                <p className="mt-2">कोई itinerary उपलब्ध नहीं है।</p>
            </div>
        );
    }

    const totalFoodAllowance = days.reduce((sum, d) => sum + d.foodAllowance, 0);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600">timeline</span>
                दिन-ब-दिन यात्रा विवरण
            </h3>

            {/* Day cards */}
            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-amber-200" />

                <div className="space-y-4">
                    {days.map((day) => {
                        const dateFormatted = new Date(day.date).toLocaleDateString("hi-IN", {
                            day: "numeric",
                            month: "long",
                            weekday: "short",
                        });

                        return (
                            <div key={day.dayNumber} className="relative pl-14">
                                {/* Day marker */}
                                <div className="absolute left-3 top-3 w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
                                    {day.dayNumber}
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    {/* Day header */}
                                    <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-100">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-gray-800">
                                                Day {day.dayNumber} — {dateFormatted}
                                            </span>
                                            <span className="bg-amber-200 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                {day.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Activities */}
                                    <div className="p-4 space-y-3">
                                        {day.activities.map((act, i) => {
                                            const meta = ACTIVITY_META[act.type] || ACTIVITY_META.travel;
                                            return (
                                                <div key={i} className="flex items-start gap-3">
                                                    <span className={`material-symbols-outlined text-lg ${meta.color}`}>
                                                        {meta.icon}
                                                    </span>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                {act.time}
                                                            </span>
                                                            <span className="text-sm text-gray-700">
                                                                {act.description}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Food allowance per day */}
                                        {day.foodAllowance > 0 && (
                                            <div className="flex items-center gap-2 text-green-700 text-sm font-medium mt-2 pt-2 border-t border-gray-100">
                                                <span className="text-lg">🍽️</span>
                                                Food Allowance: {fmtRupees(day.foodAllowance)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Total food allowance */}
            {totalFoodAllowance > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                    <span className="font-semibold text-green-800">
                        कुल Food Allowance ({days.length} दिन)
                    </span>
                    <span className="text-lg font-bold text-green-700">
                        {fmtRupees(totalFoodAllowance)}
                    </span>
                </div>
            )}
        </div>
    );
}
