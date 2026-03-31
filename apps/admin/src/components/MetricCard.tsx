import React from "react";

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    colorPreset: "green" | "blue" | "amber";
    onClick?: () => void;
}

export default function MetricCard({ title, value, subtitle, colorPreset, onClick }: MetricCardProps) {
    const colors = {
        green: "bg-green-50 text-green-700 border-green-200",
        blue: "bg-blue-50 text-blue-700 border-blue-200",
        amber: "bg-amber-50 text-amber-700 border-amber-200",
    };

    const bgColors = {
        green: "bg-green-600",
        blue: "bg-blue-600",
        amber: "bg-amber-500",
    };

    return (
        <div
            onClick={onClick}
            className={`p-5 rounded-2xl border bg-white shadow-sm flex flex-col justify-between ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
                }`}
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-600 font-medium">{title}</h3>
                <div className={`w-2 h-2 rounded-full ${bgColors[colorPreset]}`} />
            </div>
            <div>
                <div className="text-3xl font-black text-slate-800 tracking-tight mb-1">{value}</div>
                <div className={`text-sm py-1 px-2 rounded-md inline-block font-medium ${colors[colorPreset]}`}>
                    {subtitle}
                </div>
            </div>
        </div>
    );
}
