"use client";

import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday, isBefore, startOfDay } from "date-fns";
import { Booking, BlockedDate } from "../page";

interface MonthCalendarProps {
    currentMonth: Date;
    bookings: Booking[];
    blockedDates: BlockedDate[];
    onDayClick: (date: string) => void;
    isLoading: boolean;
}

export default function MonthCalendar({ currentMonth, bookings, blockedDates, onDayClick, isLoading }: MonthCalendarProps) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "yyyy-MM-dd";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    if (isLoading) {
        return <div className="h-[400px] flex items-center justify-center text-slate-400 animate-pulse">Loading calendar...</div>;
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
                <div className="flex gap-2">
                    {/* The arrows are now controlled from outside but keeping this space aligned with the specific HTML design if needed */}
                </div>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-7 mb-2">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-xs font-bold text-slate-400 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {days.map((day) => {
                        const dateStr = format(day, dateFormat);
                        const dayBookings = bookings.filter(b => b.eventDate.startsWith(dateStr));
                        const isBlocked = blockedDates.some(b => dateStr >= b.startDate && dateStr <= b.endDate);
                        const today = isToday(day);
                        const current = isSameMonth(day, monthStart);

                        // If not current month, render as empty grey text
                        if (!current) {
                            return (
                                <div key={day.toString()} className="aspect-square flex flex-col items-center justify-center text-sm text-slate-300 dark:text-slate-600">
                                    {format(day, "d")}
                                </div>
                            );
                        }

                        // Base classes for a day
                        let baseClasses = "aspect-square flex flex-col items-center justify-center text-sm relative rounded-lg transition-all focus:outline-none ";

                        if (today) {
                            baseClasses += "bg-[#f29e0d] text-white font-bold shadow-md ring-4 ring-[#f29e0d]/20";
                        } else {
                            baseClasses += "hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer";
                        }

                        // Determine markers
                        const renderMarkers = () => {
                            if (isBlocked) {
                                return (
                                    <div className="flex gap-1 mt-1">
                                        <div className={`w-1 h-1 rounded-full ${today ? 'bg-white' : 'bg-red-500'}`}></div>
                                    </div>
                                );
                            }

                            if (dayBookings.length > 0) {
                                return (
                                    <div className="flex gap-1 mt-1 flex-wrap justify-center max-w-[20px]">
                                        {dayBookings.slice(0, 3).map((_, i) => (
                                            <div key={i} className={`w-1 h-1 rounded-full ${today ? 'bg-white' : 'bg-[#f29e0d]'}`}></div>
                                        ))}
                                    </div>
                                );
                            }
                            return null;
                        };

                        return (
                            <button
                                key={day.toString()}
                                onClick={() => onDayClick(dateStr)}
                                className={baseClasses}
                            >
                                {format(day, "d")}
                                {renderMarkers()}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
