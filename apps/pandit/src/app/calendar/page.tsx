"use client";

import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth } from "date-fns";
import MonthCalendar from "./components/MonthCalendar";
import UpcomingList from "./components/UpcomingList";
import BlockDateModal from "./components/BlockDateModal";
import DayDetailPanel from "./components/DayDetailPanel";
import { Button } from "@hmarepanditji/ui";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

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
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
                    <p className="text-muted-foreground">Manage your availability and view bookings.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" className="px-2" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-medium text-lg min-w-[140px] text-center">
                        {format(currentMonth, "MMMM yyyy")}
                    </span>
                    <Button variant="outline" className="px-2" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={handleToday} className="ml-2">
                        आज (Today)
                    </Button>
                    <Button onClick={() => openBlockModal()} className="ml-2 bg-amber-600 hover:bg-amber-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> छुट्टी जोड़ें
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-[65%] shrink-0">
                    <MonthCalendar
                        currentMonth={currentMonth}
                        bookings={bookings}
                        blockedDates={blockedDates}
                        onDayClick={handleDayClick}
                        isLoading={isLoading}
                    />
                </div>
                <div className="w-full lg:w-[35%] shrink-0">
                    <UpcomingList bookings={bookings} blockedDates={blockedDates} onEventClick={handleDayClick} />
                </div>
            </div>

            {selectedDate && (
                <DayDetailPanel
                    date={selectedDate}
                    bookings={bookings.filter(b => b.eventDate.startsWith(selectedDate))}
                    blockedDates={blockedDates.filter(b => b.startDate <= selectedDate && b.endDate >= selectedDate)}
                    onClose={closeDetailPanel}
                    onBlock={() => openBlockModal(selectedDate)}
                    onDataChange={() => fetchCalendarData(currentMonth)}
                />
            )}

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
