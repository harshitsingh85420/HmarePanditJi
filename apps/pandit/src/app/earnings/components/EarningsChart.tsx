"use client";

import React, { useEffect, useState } from "react";

interface EarningsChartProps {
    data: { month: string; total: number }[];
}

export default function EarningsChart({ data }: EarningsChartProps) {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        // trigger animation shortly after mount
        const t = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(t);
    }, []);

    if (!data || data.length === 0) return null;

    // sort data since the array might be oldest to newest or newest to oldest.
    // Assuming the array is provided oldest first for chart flow:
    // e.g., ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

    const maxVal = Math.max(...data.map(d => d.total), 1000); // ensure at least some Y axis height
    const avgEarnings = data.reduce((sum, d) => sum + d.total, 0) / (data.length || 1);

    // Y axis gridlines: 5 levels (0 to maxVal)
    const gridLines = [];
    for (let i = 0; i <= 4; i++) {
        gridLines.push((maxVal / 4) * i);
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 font-hindi">पिछले 6 महीने की कमाई</h2>

            <div className="relative h-64 w-full flex items-end">
                {/* Y Axis Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pt-2 pb-8">
                    {[...gridLines].reverse().map((val, idx) => (
                        <div key={idx} className="relative w-full border-t border-gray-100 flex items-center h-0">
                            <span className="absolute -left-1 transform -translate-x-full text-[10px] text-gray-400 font-medium">
                                {val >= 1000 ? `₹${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k` : `₹${Math.round(val)}`}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Bars Container */}
                <div className="relative w-full h-full flex justify-between items-end pl-8 pr-2 pb-8 z-10 gap-2 sm:gap-4 md:gap-8">
                    {data.map((item, idx) => {
                        const heightPercent = maxVal === 0 ? 0 : (item.total / maxVal) * 100;
                        const isCurrentMonth = idx === data.length - 1; // last item is current month

                        return (
                            <div key={idx} className="relative flex flex-col items-center justify-end h-full flex-1 group">
                                <div
                                    style={{ height: animated ? `${heightPercent}%` : '0%' }}
                                    className={`w-full max-w-16 rounded-t-md transition-all duration-700 ease-out cursor-pointer relative
                    ${isCurrentMonth ? 'bg-amber-500 border-2 border-amber-600' : 'bg-amber-400 hover:bg-amber-500'}
                  `}
                                >
                                    {/* Tooltip on hover */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                                        ₹{item.total.toLocaleString()}
                                    </div>
                                </div>

                                {/* X Axis Label */}
                                <div className="absolute -bottom-6 text-xs text-gray-500 font-medium whitespace-nowrap font-hindi">
                                    {item.month}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="text-center mt-8 text-sm text-gray-600 font-medium font-hindi bg-gray-50 py-3 rounded-lg">
                पिछले {data.length} महीनों की औसत कमाई: <span className="font-bold text-amber-700">₹{Math.round(avgEarnings).toLocaleString('en-IN')} / महीना</span>
            </div>
        </div>
    );
}
