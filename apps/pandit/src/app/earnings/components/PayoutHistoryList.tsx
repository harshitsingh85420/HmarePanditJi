"use client";

import React, { useState } from "react";
import BookingEarningRow from "./BookingEarningRow";

interface PayoutHistoryListProps {
    bookings: any[];
}

export default function PayoutHistoryList({ bookings }: PayoutHistoryListProps) {
    const [page, setPage] = useState(1);
    const limit = 10;

    if (!bookings || bookings.length === 0) {
        return (
            <div className="mt-8 border rounded-xl p-8 text-center text-gray-500 bg-gray-50">
                <p className="font-hindi text-lg">अभी तक कोई बुकिंग नहीं हुई है।</p>
            </div>
        );
    }

    const totalPages = Math.ceil(bookings.length / limit);
    const paginatedBookings = bookings.slice((page - 1) * limit, page * limit);

    return (
        <div className="mt-10 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-3 font-hindi">बुकिंग वार कमाई</h2>

            <div className="space-y-4">
                {paginatedBookings.map((b) => (
                    <BookingEarningRow key={b.bookingId} booking={b} />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white border p-3 rounded-lg shadow-sm">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 border rounded text-sm disabled:opacity-50 text-gray-700 bg-gray-50 hover:bg-gray-100 font-hindi"
                    >
                        पिछला
                    </button>
                    <span className="text-sm font-medium text-gray-600 font-hindi">
                        {page} / {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 border rounded text-sm disabled:opacity-50 text-gray-700 bg-gray-50 hover:bg-gray-100 font-hindi"
                    >
                        अगला
                    </button>
                </div>
            )}
        </div>
    );
}
