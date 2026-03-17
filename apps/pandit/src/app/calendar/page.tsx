"use client";

import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth } from "date-fns";
import MonthCalendar from "./components/MonthCalendar";
import BlockDateModal from "./components/BlockDateModal";
import DayDetailPanel from "./components/DayDetailPanel";
import { Button } from "@hmarepanditji/ui";

export type Booking = {
    id: string;
    eventType: string;
    eventDate: string;
    eventTimeSlot: string;
    customerCity: string;
    status: string;
    customerName: string;
};

export type BlockedDate = {
    id: string;
    startDate: string;
    endDate: string;
    reason: string;
    type: string;
};

export default function CalendarPage() {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [prefillDate, setPrefillDate] = useState<string | undefined>();

    const fetchCalendarData = async (month: Date) => {
        if (!token) return;
        setIsLoading(true);
        try {
            const monthStr = format(month, "yyyy-MM");
            const res = await fetch(`${API_URL}/api/v1/pandits/calendar?month=${monthStr}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                setBookings(json.data.bookings || []);
                setBlockedDates(json.data.blockedDates || []);
            }
        } catch (err) {
            console.error("Failed to fetch calendar", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCalendarData(currentMonth);
    }, [currentMonth, token]);

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleToday = () => setCurrentMonth(startOfMonth(new Date()));

    const handleDayClick = (dateStr: string) => {
        setSelectedDate(dateStr);
    };

    const closeDetailPanel = () => {
        setSelectedDate(null);
    };

    const openBlockModal = (date?: string) => {
        setPrefillDate(date);
        setIsBlockModalOpen(true);
    };

    return (
        <div className="flex-1 max-w-[1200px] mx-auto w-full p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">

                {/* Left Sidebar: Controls & Stats */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <h1 className="text-xl font-bold mb-1">Work Calendar</h1>
                        <p className="text-slate-500 text-sm mb-6">High-stakes schedule management</p>

                        <div className="space-y-4">
                            <button onClick={() => openBlockModal()} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#f29e0d]/10 text-[#f29e0d] font-semibold hover:bg-[#f29e0d]/20 transition-all">
                                <span className="material-symbols-outlined">event_busy</span>
                                <span className="text-sm">Block Festival Period</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                <span className="material-symbols-outlined">repeat_on</span>
                                <span className="text-sm">Set Repeat Off</span>
                            </button>
                        </div>
                    </div>

                    {/* Notification Card */}
                    <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-xl border border-[#f29e0d]/20">
                        <div className="flex gap-3">
                            <span className="material-symbols-outlined text-[#f29e0d]">info</span>
                            <div>
                                <p className="text-sm font-bold text-orange-900 dark:text-orange-200">Travel Days Auto-blocked</p>
                                <p className="text-xs text-orange-800/80 dark:text-orange-300/80 mt-1">Calendar intelligently blocks buffer time for venue travel based on location distance.</p>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="px-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Legend</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-3 h-3 rounded-full bg-[#f29e0d]"></span>
                                <span>Wedding / Muhurat</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-3 h-3 rounded-full bg-slate-400 text-slate-500"></span>
                                <span className="text-slate-500">Travel Buffer</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center: Calendar View */}
                <div className="lg:col-span-5">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 w-full justify-between">
                            <Button variant="outline" className="px-2" onClick={handlePrevMonth}>
                                <span className="material-symbols-outlined">chevron_left</span>
                            </Button>
                            <Button variant="outline" onClick={handleToday} className="px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                Today
                            </Button>
                            <Button variant="outline" className="px-2" onClick={handleNextMonth}>
                                <span className="material-symbols-outlined">chevron_right</span>
                            </Button>
                        </div>
                    </div>
                    <MonthCalendar
                        currentMonth={currentMonth}
                        bookings={bookings}
                        blockedDates={blockedDates}
                        onDayClick={handleDayClick}
                        isLoading={isLoading}
                    />
                </div>

                {/* Right Sidebar: Selected Day Details */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {selectedDate ? (
                        <DayDetailPanel
                            date={selectedDate}
                            bookings={bookings.filter(b => b.eventDate.startsWith(selectedDate))}
                            blockedDates={blockedDates.filter(b => b.startDate <= selectedDate && b.endDate >= selectedDate)}
                            onClose={closeDetailPanel}
                            onBlock={() => openBlockModal(selectedDate)}
                            onDataChange={() => fetchCalendarData(currentMonth)}
                        />
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 min-h-[400px]">
                            <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">calendar_month</span>
                            <p className="text-sm">Select a date from the calendar to view its details</p>
                        </div>
                    )}
                </div>

            </div>

            {isBlockModalOpen && (
                <BlockDateModal
                    isOpen={isBlockModalOpen}
                    onClose={() => setIsBlockModalOpen(false)}
                    onSuccess={() => fetchCalendarData(currentMonth)}
                    prefillDate={prefillDate}
                />
            )}
        </div>
    );
}
