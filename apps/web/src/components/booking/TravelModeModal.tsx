"use client";

import React, { useState } from "react";

interface TravelModeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (mode: string) => void;
    panditName?: string;
}

const TRAVEL_MODES = [
    {
        id: "SELF-DRIVE",
        label: "SELF-DRIVE",
        subLabel: "Pandit's Own Car",
        icon: "directions_car",
        features: ["Maximum flexibility", "Easy Samagri transport"],
        price: "₹15/km + Tolls",
        estTotal: 4250,
    },
    {
        id: "TRAIN",
        label: "TRAIN",
        subLabel: "3AC Comfort",
        icon: "train",
        features: ["Highly economical", "Reliable & comfortable"],
        price: "Fixed: ₹1,200",
        estTotal: 1200,
    },
    {
        id: "FLIGHT",
        label: "FLIGHT",
        subLabel: "Economy Class",
        icon: "flight",
        features: ["Fastest travel time", "Airport transfers included"],
        price: "Fixed: ₹4,500",
        estTotal: 4500,
    },
];

export function TravelModeModal({
    isOpen,
    onClose,
    onConfirm,
    panditName = "Pandit Ji",
}: TravelModeModalProps) {
    const [selectedMode, setSelectedMode] = useState("SELF-DRIVE");

    if (!isOpen) return null;

    const activeMode = TRAVEL_MODES.find((m) => m.id === selectedMode);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="max-w-4xl w-full bg-white dark:bg-[#2d2116] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-[#f49d25]/10 max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#2d2116] sticky top-0 z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#f49d25]">
                                directions_car
                            </span>
                            Choose Travel Mode for {panditName}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Select the most convenient travel option. All expenses are verified.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-400">
                            close
                        </span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {/* Mode Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {TRAVEL_MODES.map((mode) => {
                            const isActive = selectedMode === mode.id;
                            return (
                                <div
                                    key={mode.id}
                                    onClick={() => setSelectedMode(mode.id)}
                                    className={`relative group cursor-pointer border-2 rounded-xl p-5 flex flex-col h-full transition-all hover:shadow-md ${isActive
                                            ? "border-[#f49d25] bg-[#f49d25]/5"
                                            : "border-gray-100 dark:border-gray-800 bg-white dark:bg-[#362a1e] hover:border-[#f49d25]/50"
                                        }`}
                                >
                                    {isActive && (
                                        <div className="absolute top-3 right-3">
                                            <span className="material-symbols-outlined text-[#f49d25] fill-1">
                                                check_circle
                                            </span>
                                        </div>
                                    )}
                                    <div
                                        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${isActive
                                                ? "bg-[#f49d25]/20"
                                                : "bg-gray-100 dark:bg-gray-800 group-hover:bg-[#f49d25]/10"
                                            }`}
                                    >
                                        <span
                                            className={`material-symbols-outlined text-3xl ${isActive
                                                    ? "text-[#f49d25]"
                                                    : "text-gray-500 dark:text-gray-400 group-hover:text-[#f49d25]"
                                                }`}
                                        >
                                            {mode.icon}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                        {mode.label}
                                    </h3>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        {mode.subLabel}
                                    </p>
                                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-6 flex-grow">
                                        {mode.features.map((feat, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="material-symbols-outlined text-xs mt-1 text-green-600">
                                                    done
                                                </span>
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-auto">
                                        <p className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                            {mode.price}
                                        </p>
                                        <button
                                            className={`w-full py-2 font-bold rounded-lg text-sm transition-transform active:scale-95 ${isActive
                                                    ? "bg-[#f49d25] text-white"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white group-hover:bg-[#f49d25]/20 group-hover:text-[#f49d25]"
                                                }`}
                                        >
                                            {isActive ? "Selected" : `Select ${mode.label}`}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Detailed Breakdown */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#f49d25]">
                                    receipt_long
                                </span>
                                Detailed Breakdown ({activeMode?.label})
                            </h2>
                            <div className="bg-gray-50 dark:bg-[#362a1e] rounded-lg p-5 border border-gray-100 dark:border-gray-800">
                                <div className="space-y-3">
                                    {activeMode?.id === "SELF-DRIVE" ? (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Distance (220km) x Rate (₹15/km)
                                                </span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    ₹3,300
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Estimated Tolls & Parking
                                                </span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    ₹450
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Driver Allowance (Per Day)
                                                </span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    ₹500
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Fare Ticket Price
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                ₹{activeMode?.estTotal}
                                            </span>
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            Total Travel Expense
                                        </span>
                                        <span className="font-bold text-xl text-[#f49d25]">
                                            ₹{activeMode?.estTotal}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-400 uppercase tracking-widest bg-white dark:bg-black/20 p-2 rounded border border-dashed border-gray-200 dark:border-gray-700">
                                    <span className="material-symbols-outlined text-sm">
                                        verified_user
                                    </span>
                                    Verified transparent pricing
                                </div>
                            </div>
                        </div>

                        {/* Food Preferences */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#f49d25]">
                                    restaurant
                                </span>
                                Food & Accommodation
                            </h2>
                            <div className="space-y-4">
                                <label className="flex items-center p-4 border border-gray-100 dark:border-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-[#362a1e] transition-colors group">
                                    <input
                                        type="radio"
                                        name="food_pref"
                                        defaultChecked
                                        className="w-5 h-5 text-[#f49d25] border-gray-300 focus:ring-[#f49d25]"
                                    />
                                    <div className="ml-4">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            I will provide meals & stay
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Host takes care of Satvik meals and lodging
                                        </p>
                                    </div>
                                </label>
                                <label className="flex items-center p-4 border border-gray-100 dark:border-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-[#362a1e] transition-colors group">
                                    <input
                                        type="radio"
                                        name="food_pref"
                                        className="w-5 h-5 text-[#f49d25] border-gray-300 focus:ring-[#f49d25]"
                                    />
                                    <div className="ml-4">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            Add Food Allowance
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            ₹500/day will be added to the final billing
                                        </p>
                                    </div>
                                </label>
                            </div>
                            <div className="mt-6 p-4 bg-[#f49d25]/5 rounded-lg border border-[#f49d25]/20 flex items-start gap-3">
                                <span className="material-symbols-outlined text-[#f49d25]">
                                    info
                                </span>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Pandit Ji usually arrives 30 minutes before the Muhurat.
                                    Please ensure the travel route is accessible.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#2d2116] flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 text-sm font-semibold hover:text-gray-700 flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">
                            arrow_back
                        </span>
                        Back to Dakshina Details
                    </button>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => onConfirm(selectedMode)}
                            className="flex-1 sm:flex-none px-8 py-3 bg-[#f49d25] hover:bg-[#e0761d] text-white font-bold rounded-lg shadow-lg shadow-[#f49d25]/20 transition-all active:scale-95"
                        >
                            Confirm & Proceed
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
