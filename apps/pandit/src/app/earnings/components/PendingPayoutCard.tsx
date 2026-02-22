"use client";

import React from "react";
import { format } from "date-fns";
import { hi } from "date-fns/locale";

interface PendingPayout {
    bookingId: string;
    bookingNumber: string;
    eventType: string;
    eventDate: string;
    amount: number;
    expectedDate: string;
    status: string;
}

interface PendingPayoutCardProps {
    payouts: PendingPayout[];
}

export default function PendingPayoutCard({ payouts }: PendingPayoutCardProps) {
    if (!payouts || payouts.length === 0) return null;

    return (
        <div className="bg-orange-50 rounded-xl p-5 border border-orange-200 shadow-sm mt-8">
            <h2 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
                <span>⏳</span> भुगतान आने वाले हैं
            </h2>
            <div className="space-y-4">
                {payouts.map((p, idx) => {
                    const expectedTitle = p.status === "PROCESSING" ? "प्रोसेस हो रहा है" : "तय समय";
                    const eDate = new Date(p.expectedDate);
                    return (
                        <div key={idx} className="bg-white rounded-lg p-4 border border-orange-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                            <div>
                                <p className="font-semibold text-gray-900 mb-1">{p.eventType} <span className="font-normal text-sm text-gray-500">({format(new Date(p.eventDate), "do MMM yy", { locale: hi })})</span></p>
                                <div className="flex gap-2 items-center text-xs">
                                    <span className="text-gray-500">{p.bookingNumber}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${p.status === "PROCESSING" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                                        }`}>
                                        {p.status}
                                    </span>
                                </div>
                            </div>
                            <div className="text-left md:text-right border-t md:border-none pt-3 md:pt-0">
                                <p className="font-bold text-lg text-gray-900">₹{p.amount.toLocaleString('en-IN')}</p>
                                <p className="text-xs text-orange-700">{expectedTitle}: {format(eDate, "do MMM, h:mm a", { locale: hi })}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
