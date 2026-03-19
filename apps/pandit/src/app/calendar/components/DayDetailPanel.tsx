"use client";

import { Booking, BlockedDate } from "../page";
import { format, parseISO } from "date-fns";
import { X, Trash2, CalendarPlus, ChevronRight } from "lucide-react";
import { Button } from "@hmarepanditji/ui";
import Link from "next/link";
import { isBefore, startOfDay } from "date-fns";

interface DayDetailPanelProps {
    date: string; // ISO string 2026-03-12
    bookings: Booking[];
    blockedDates: BlockedDate[];
    onClose: () => void;
    onBlock: () => void;
    onDataChange: () => void;
}

export default function DayDetailPanel({ date, bookings, blockedDates, onClose, onBlock, onDataChange }: DayDetailPanelProps) {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    const parsedDate = parseISO(date);
    const formattedDate = format(parsedDate, "EEEE, dd MMMM yyyy");
    const isPast = isBefore(parsedDate, startOfDay(new Date()));

    const handleUnblock = async (id: string) => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/api/v1/pandits/blackout-dates/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                onDataChange();
                onClose();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={onClose} />

            <div className="fixed inset-x-0 bottom-0 md:inset-auto md:top-20 md:right-8 md:w-[400px] bg-white md:rounded-2xl rounded-t-2xl shadow-2xl z-50 overflow-hidden flex flex-col h-[85vh] md:h-[calc(100vh-120px)] border border-slate-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-semibold text-lg text-slate-800">{formattedDate}</h3>
                    <Button variant="ghost" className="rounded-full hover:bg-slate-200 px-2" onClick={onClose}>
                        <X className="w-5 h-5 text-slate-500" />
                    </Button>
                </div>

                <div className="p-5 flex-1 overflow-y-auto space-y-6">
                    {bookings.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">बुकिंग</h4>
                            {bookings.map(b => (
                                <div key={b.id} className="border border-amber-200 bg-amber-50/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-semibold text-amber-900">{b.eventType}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                                            b.status === "COMPLETED" ? "bg-blue-100 text-blue-700" :
                                                "bg-amber-100 text-amber-700"
                                            }`}>{b.status}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-1">पंडित जी: {b.customerName}</p>
                                    <p className="text-sm font-medium text-amber-700 bg-amber-100/50 inline-block px-2 py-1 rounded">
                                        {b.eventTimeSlot}
                                    </p>
                                    <Link href={`/bookings/${b.id}`} className="mt-4 flex items-center justify-between w-full text-indigo-600 text-sm font-medium hover:text-indigo-700">
                                        विवरण देखें
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    {blockedDates.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">छुट्टी</h4>
                            {blockedDates.map(b => (
                                <div key={b.id} className="border border-red-200 bg-red-50 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-red-400" />
                                    <div>
                                        <p className="font-semibold text-red-900 flex items-center">
                                            <span className="mr-2">🔴</span> यह दिन ब्लॉक है
                                        </p>
                                        <p className="text-sm text-red-700/80 mt-1 pl-6">
                                            कारण: {b.reason || "व्यक्तिगत कारण"}
                                        </p>
                                    </div>
                                    {!isPast && (
                                        <Button
                                            variant="danger"
                                            className="mt-4 w-full bg-red-100 text-red-700 hover:bg-red-200"
                                            onClick={() => handleUnblock(b.id)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> ब्लॉक हटाएं
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {bookings.length === 0 && blockedDates.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <CalendarPlus className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-lg font-medium text-slate-700">यह दिन उपलब्ध है</p>
                            <p className="text-slate-500 mt-1 mb-6 text-sm">आपकी इस दिन कोई बुकिंग नहीं है</p>
                            {!isPast && (
                                <Button variant="outline" onClick={onBlock} className="text-amber-700 border-amber-300 hover:bg-amber-50">
                                    <Plus className="w-4 h-4 mr-2" /> इस दिन को ब्लॉक करें
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// Just an inline import for Plus
import { Plus } from "lucide-react";
