"use client";

import { Booking, BlockedDate } from "../page";
import { format, parseISO } from "date-fns";

interface DayDetailPanelProps {
    date: string; // ISO string 2026-03-12
    bookings: Booking[];
    blockedDates: BlockedDate[];
    onClose: () => void;
    onBlock: () => void;
    onDataChange: () => void;
}

export default function DayDetailPanel({ date, bookings, blockedDates, onBlock }: DayDetailPanelProps) {
    const parsedDate = parseISO(date);
    const formattedDate = format(parsedDate, "EEEE, MMM d");

    // Sort events (Assuming bookings and blockedDates are what we have, we might map them to a unified timeline)
    const totalEvents = bookings.length + blockedDates.length;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex-1 flex flex-col min-h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold">{formattedDate}</h3>
                <p className="text-sm text-slate-500">{totalEvents} events scheduled</p>
            </div>

            <div className="flex-1 p-6 space-y-6">

                {blockedDates.map((b, i) => (
                    <div key={b.id || i} className="relative pl-8">
                        <div className="absolute left-0 top-1.5 w-3 h-3 bg-red-400 rounded-full border-2 border-white dark:border-slate-900 z-10"></div>
                        {i < totalEvents - 1 && <div className="absolute left-[5px] top-4 w-[2px] h-[calc(100%+24px)] bg-slate-100 dark:bg-slate-800"></div>}
                        <div className="flex flex-col bg-red-50/50 dark:bg-red-900/10 p-3 rounded-lg border border-red-200/50 dark:border-red-800/50">
                            <span className="text-xs font-bold text-red-500 uppercase">Blocked</span>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{b.reason || "Unavailable"}</span>
                        </div>
                    </div>
                ))}

                {bookings.map((b, i) => (
                    <div key={b.id || i} className="relative pl-8">
                        <div className="absolute left-0 top-1.5 w-3 h-3 bg-[#f29e0d] rounded-full border-2 border-white dark:border-slate-900 z-10"></div>
                        {(i < bookings.length - 1 || blockedDates.length > 0) && (
                            <div className="absolute left-[5px] top-4 w-[2px] h-[calc(100%+24px)] bg-slate-100 dark:bg-slate-800"></div>
                        )}
                        <div className="flex flex-col bg-[#f29e0d]/5 p-3 rounded-lg border border-[#f29e0d]/10">
                            <span className="text-xs font-bold text-[#f29e0d] uppercase">{b.eventTimeSlot}</span>
                            <span className="text-base font-bold text-slate-900 dark:text-slate-100">{b.eventType}</span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Client: {b.customerName}</span>

                            <div className="mt-2 flex gap-2">
                                <button className="px-2 py-1 text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm">View Details</button>
                                <button className="px-2 py-1 text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm">Contact Host</button>
                            </div>
                        </div>
                    </div>
                ))}

                {totalEvents === 0 && (
                    <div className="flex flex-col items-center justify-center pt-8 text-center opacity-50">
                        <p className="text-sm text-slate-500">No events scheduled.</p>
                    </div>
                )}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 mt-auto rounded-b-xl">
                <button onClick={onBlock} className="w-full py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:shadow-sm transition-all focus:ring-2 focus:ring-[#f29e0d]/50 outline-none">
                    Add Custom Event
                </button>
            </div>
        </div>
    );
}
