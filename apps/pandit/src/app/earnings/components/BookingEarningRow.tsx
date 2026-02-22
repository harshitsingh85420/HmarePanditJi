"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { hi } from "date-fns/locale";

interface BookingEarningRowProps {
    booking: {
        bookingId: string;
        bookingNumber: string;
        eventType: string;
        eventDate: string;
        customerCity: string;
        grossAmount: number;
        panditPayout: number;
        payoutStatus: string;
        payoutDate: string | null;
    };
}

export default function BookingEarningRow({ booking }: BookingEarningRowProps) {
    // mapping status to colors
    const statusColorMap: Record<string, string> = {
        PENDING: "bg-amber-100 text-amber-700",
        PROCESSING: "bg-blue-100 text-blue-700",
        COMPLETED: "bg-green-100 text-green-700",
    };

    const statusLabelMap: Record<string, string> = {
        PENDING: "PENDING",
        PROCESSING: "PROCESSING",
        COMPLETED: "COMPLETED",
    };

    return (
        <div className="bg-white border hover:border-amber-200 hover:shadow-md transition-all rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                    <p className="font-bold text-gray-900 text-lg">{booking.eventType}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${statusColorMap[booking.payoutStatus] || "bg-gray-100 text-gray-600"}`}>
                        {statusLabelMap[booking.payoutStatus] || booking.payoutStatus}
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 font-medium">
                    <p className="font-mono text-xs">{booking.bookingNumber}</p>
                    <p>{format(new Date(booking.eventDate), "dd MMMM yyyy", { locale: hi })}</p>
                    <p>{booking.customerCity}</p>
                </div>
            </div>

            <div className="w-full md:w-auto flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                <div>
                    <p className="font-bold text-xl text-gray-900 md:text-right">₹{booking.panditPayout.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-400 md:text-right">कुल: ₹{booking.grossAmount.toLocaleString('en-IN')}</p>
                </div>

                <Link
                    href={`/earnings/${booking.bookingId}`}
                    className="text-amber-600 font-bold text-sm bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                    विवरण <span aria-hidden="true">&rarr;</span>
                </Link>
            </div>
        </div>
    );
}
