"use client";

import { useState } from "react";

/**
 * StatusButtons (Prompt 11, Section 3)
 * Sequential "I'm Here" buttons with 6 steps.
 * Each button is active only when the previous step is completed.
 * On click, calls the corresponding API endpoint.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

interface StatusStep {
    id: string;
    label: string;
    icon: string;
    apiAction: string;
    isOutstationOnly?: boolean;
}

const STEPS: StatusStep[] = [
    { id: "start-journey", label: "यात्रा शुरू करें", icon: "🚌", apiAction: "start-journey" },
    { id: "hotel-arrived", label: "होटल पहुंचा", icon: "🏨", apiAction: "arrived" },
    { id: "venue-arrived", label: "Venue पहुंचा", icon: "📍", apiAction: "arrived" },
    { id: "puja-started", label: "पूजा शुरू", icon: "🔥", apiAction: "start-puja" },
    { id: "puja-completed", label: "पूजा संपन्न", icon: "🙏", apiAction: "complete" },
    { id: "return", label: "वापसी", icon: "🔙", apiAction: "start-journey", isOutstationOnly: true },
];

function getToken() {
    if (typeof window === "undefined") return null;
    return (
        localStorage.getItem("hpj_pandit_token") ||
        localStorage.getItem("hpj_pandit_access_token") ||
        localStorage.getItem("token")
    );
}

export default function StatusButtons({
    bookingId,
    currentStepIndex = 0,
    isOutstation = false,
    onStatusUpdate,
}: {
    bookingId: string;
    currentStepIndex?: number;
    isOutstation?: boolean;
    onStatusUpdate?: (stepId: string, success: boolean) => void;
}) {
    const [completedIndex, setCompletedIndex] = useState(currentStepIndex);
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const visibleSteps = isOutstation ? STEPS : STEPS.filter((s) => !s.isOutstationOnly);

    const handleClick = async (step: StatusStep, index: number) => {
        if (index !== completedIndex || loading) return;

        setLoading(step.id);
        setError(null);

        const token = getToken();

        try {
            const res = await fetch(
                `${API_BASE}/pandits/bookings/${bookingId}/${step.apiAction}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.ok) {
                setCompletedIndex(index + 1);
                onStatusUpdate?.(step.id, true);
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.message || "कुछ गड़बड़ हो गई। फिर से कोशिश करें।");
                onStatusUpdate?.(step.id, false);
            }
        } catch {
            setError("Network error. Internet connection check करें।");
            onStatusUpdate?.(step.id, false);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-3" id="status-buttons">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600">pin_drop</span>
                Status Updates
            </h3>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {error}
                </div>
            )}

            <div className="space-y-2">
                {visibleSteps.map((step, index) => {
                    const isCompleted = index < completedIndex;
                    const isActive = index === completedIndex;
                    const isFuture = index > completedIndex;
                    const isLoading = loading === step.id;

                    return (
                        <button
                            key={step.id}
                            onClick={() => handleClick(step, index)}
                            disabled={!isActive || isLoading}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${isCompleted
                                ? "bg-green-50 border-2 border-green-300 text-green-800"
                                : isActive
                                    ? "bg-amber-50 border-2 border-amber-400 text-amber-800 hover:bg-amber-100 cursor-pointer shadow-sm"
                                    : "bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                            style={{ minHeight: "52px" }}
                        >
                            {/* Step number / icon */}
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${isCompleted
                                    ? "bg-green-500 text-white"
                                    : isActive
                                        ? "bg-amber-500 text-white animate-pulse-amber"
                                        : "bg-gray-200 text-gray-400"
                                    }`}
                            >
                                {isCompleted ? "✓" : isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    step.icon
                                )}
                            </div>

                            {/* Label */}
                            <div className="flex-1">
                                <span className={`font-semibold ${isCompleted ? "line-through" : ""}`}>
                                    {step.label}
                                </span>
                                {isActive && (
                                    <span className="block text-xs text-amber-600 mt-0.5">
                                        Tap to confirm
                                    </span>
                                )}
                            </div>

                            {/* Status indicator */}
                            {isCompleted && (
                                <span className="material-symbols-outlined text-green-600 text-lg">
                                    check_circle
                                </span>
                            )}
                            {isActive && !isLoading && (
                                <span className="material-symbols-outlined text-amber-500 text-lg">
                                    arrow_forward
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
