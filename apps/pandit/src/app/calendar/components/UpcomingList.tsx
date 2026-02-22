"use client";

import { Booking, BlockedDate } from "../page";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";

interface UpcomingListProps {
    bookings: Booking[];
    blockedDates: BlockedDate[];
    onEventClick: (date: string) => void;
}

export default function UpcomingList({ bookings, blockedDates, onEventClick }: UpcomingListProps) {
    const allEvents = [
        ...bookings.filter(b => b.status === "CONFIRMED" || b.status === "TRAVEL_BOOKED" || b.status === "PANDIT_EN_ROUTE" || b.status === "PANDIT_ARRIVED" || b.status === "PUJA_IN_PROGRESS" || b.status === "CREATED").map(b => ({
            type: "booking" as const,
            date: b.eventDate.split("T")[0],
            item: b
        })),
        ...blockedDates.map(b => ({
            type: "blocked" as const,
            date: b.startDate.split("T")[0],
            item: b
        }))
    ];

    // sort by date asc
    allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // take next 10
    const upcomingEvents = allEvents.filter(e => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0))).slice(0, 10);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                <h3 className="font-semibold text-lg text-slate-800 flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2 text-indigo-500" />
                    आगामी कार्यक्रम
                </h3>
            </div>
            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {upcomingEvents.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">कोई आगामी कार्यक्रम नहीं</p>
                ) : (
                    upcomingEvents.map((e, idx) => {
                        if (e.type === "booking") {
                            const b = e.item as Booking;
                            return (
                                <div
                                    key={`b-${b.id}-${idx}`}
                                    onClick={() => onEventClick(e.date)}
                                    className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg border-l-4 border-l-amber-500 cursor-pointer hover:bg-amber-50 transition-colors"
                                >
                                    <p className="font-medium text-amber-900 line-clamp-1">{b.eventType}</p>
                                    <p className="text-sm text-amber-700/80 mt-1 flex items-center">
                                        <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                                        {format(parseISO(e.date), "dd MMM yyyy")}
                                    </p>
                                    <p className="text-sm text-slate-600 mt-1 flex items-center justify-between">
                                        <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> {b.customerCity}</span>
                                        <span className="flex items-center text-amber-700 font-medium"><Clock className="w-3.5 h-3.5 mr-1" /> {b.eventTimeSlot}</span>
                                    </p>
                                </div>
                            );
                        } else {
                            const b = e.item as BlockedDate;
                            return (
                                <div
                                    key={`blk-${b.id}-${idx}`}
                                    onClick={() => onEventClick(e.date)}
                                    className="p-3 bg-red-50 border border-red-100 rounded-lg border-l-4 border-l-red-500 cursor-pointer hover:bg-red-100/50 transition-colors"
                                >
                                    <p className="font-medium text-red-900 flex items-center">
                                        <span className="mr-1">🔴</span> छुट्टी ({b.reason || "ब्लॉक किया गया"})
                                    </p>
                                    <p className="text-sm text-red-700 mt-1">
                                        {format(parseISO(b.startDate), "dd MMM yyyy")}
                                        {b.startDate !== b.endDate && ` - ${format(parseISO(b.endDate), "dd MMM yy")}`}
                                    </p>
                                </div>
                            );
                        }
                    })
                )}
            </div>
        </div>
    );
}
