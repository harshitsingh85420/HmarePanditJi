"use client";

import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday, isBefore, startOfDay } from "date-fns";
import { Booking, BlockedDate } from "../page";
import LegendBar from "./LegendBar";

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

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    if (isLoading) {
        return <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading calendar...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {weekDays.map(day => (
                    <div key={day} className="py-2 text-center text-sm font-medium text-slate-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 border-l border-t border-slate-200">
                {days.map((day, i) => {
                    const dateStr = format(day, dateFormat);
                    const dayBookings = bookings.filter(b => b.eventDate.startsWith(dateStr));
                    const isBlocked = blockedDates.some(b => dateStr >= b.startDate && dateStr <= b.endDate);
                    const past = isBefore(day, startOfDay(new Date()));
                    const today = isToday(day);
                    const current = isSameMonth(day, monthStart);

                    let bgColor = "bg-white";
                    if (!current) bgColor = "bg-slate-50 text-slate-400";
                    else if (past) bgColor = "bg-slate-100/50";
                    else if (isBlocked) bgColor = "bg-red-50";
                    else if (dayBookings.length > 0) bgColor = "bg-amber-50";

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => onDayClick(dateStr)}
                            className={`min-h-[70px] md:min-h-[100px] border-r border-b border-slate-200 p-1 md:p-2 cursor-pointer transition-colors hover:border-amber-400
                ${bgColor}
                ${today ? "ring-2 ring-inset ring-amber-500 z-10" : ""}
              `}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`text-xs md:text-sm font-medium ${today ? "text-amber-700 font-bold" : "text-slate-700"}`}>
                                    {format(day, "d")}
                                </span>
                            </div>

                            <div className="mt-1 space-y-1">
                                {isBlocked ? (
                                    <div className="text-[10px] md:text-xs font-semibold text-red-600 flex items-center">
                                        <span className="mr-1">🔴</span> छुट्टी
                                    </div>
                                ) : dayBookings.length > 0 ? (
                                    <>
                                        <div className="text-[10px] md:text-xs bg-amber-100 text-amber-800 rounded px-1.5 py-0.5 truncate border border-amber-200">
                                            {dayBookings[0].eventType.split(" ").slice(0, 2).join(" ")}
                                            <span className="block text-amber-600/80 font-medium">
                                                {dayBookings[0].eventTimeSlot}
                                            </span>
                                        </div>
                                        {dayBookings.length > 1 && (
                                            <div className="text-[10px] text-slate-500 font-medium pl-1">
                                                +{dayBookings.length - 1} और
                                            </div>
                                        )}
                                    </>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* LegendBar */}
            <LegendBar />
        </div>
    );
}
