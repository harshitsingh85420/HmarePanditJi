"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface MuhuratDateData {
    date: string;
    count: number;
    pujaTypes: string[];
}

export function MuhuratCalendar({ muhuratDates }: { muhuratDates: MuhuratDateData[] }) {
    const router = useRouter();

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const muhuratMap = new Map(muhuratDates.map(d => [d.date.split("T")[0], d]));

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="h-10 w-full"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const muhurat = muhuratMap.get(dateStr);
        const isToday = today.getDate() === d && today.getMonth() === currentMonth;
        const isPast = new Date(currentYear, currentMonth, d) < new Date(today.setHours(0, 0, 0, 0));

        let cellClass = "relative flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors ";

        if (muhurat && !isPast) {
            cellClass += "cursor-pointer hover:bg-amber-100 text-gray-900 ";
            if (isToday) cellClass += "ring-2 ring-blue-500 ";
        } else if (isPast) {
            cellClass += "opacity-50 cursor-not-allowed text-gray-400 ";
        } else {
            cellClass += "text-gray-600 ";
            if (isToday) cellClass += "ring-2 ring-blue-500 ";
        }

        days.push(
            <div
                key={d}
                className={cellClass}
                title={muhurat ? muhurat.pujaTypes.join(", ") : undefined}
                onClick={() => {
                    if (muhurat && !isPast) {
                        router.push(`/muhurat?date=${dateStr}`);
                    }
                }}
            >
                <span>{d}</span>
                {muhurat && !isPast && (
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                )}
            </div>
        );
    }

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="w-full bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="mb-4 text-center font-semibold text-gray-800">
                {today.toLocaleString("default", { month: "long" })} {currentYear}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days}
            </div>
        </div>
    );
}
