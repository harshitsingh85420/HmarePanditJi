"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface BookingRequest {
    id: string;
    bookingNumber: string;
    eventType: string;
    eventDate: string;
    venueCity: string;
    venueArea?: string;
    createdAt: string;
    estimatedEarning?: number;
    customer?: { name?: string; rating?: number };
}

const REQUEST_WINDOW = 6 * 60 * 60; // 6 hours in seconds

function fmtRupees(n: number) {
    return "₹" + n.toLocaleString("en-IN");
}

/**
 * NewBookingAlert (Prompt 9, Section 5)
 * Pulsing amber card with countdown timer for each pending booking request.
 * Shows max 2 requests, then "और देखें" link.
 */
export default function NewBookingAlert({
    requests,
    onAccept,
    onDecline,
}: {
    requests: BookingRequest[];
    onAccept?: (id: string) => void;
    onDecline?: (id: string) => void;
}) {
    if (!requests || requests.length === 0) return null;

    const displayRequests = requests.slice(0, 2);
    const remainingCount = requests.length - 2;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 animate-pulse">
                    notification_important
                </span>
                <h3 className="text-lg font-bold text-gray-800">
                    नई बुकिंग अनुरोध ({requests.length})
                </h3>
            </div>

            {displayRequests.map((req) => (
                <AlertCard
                    key={req.id}
                    request={req}
                    onAccept={onAccept}
                    onDecline={onDecline}
                />
            ))}

            {remainingCount > 0 && (
                <Link
                    href="/bookings?tab=pending"
                    className="block text-center text-amber-600 font-semibold hover:underline py-2"
                >
                    और {remainingCount} देखें →
                </Link>
            )}
        </div>
    );
}

function AlertCard({
    request,
    onAccept,
    onDecline,
}: {
    request: BookingRequest;
    onAccept?: (id: string) => void;
    onDecline?: (id: string) => void;
}) {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [expired, setExpired] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval>>();

    useEffect(() => {
        const tick = () => {
            const createdMs = new Date(request.createdAt).getTime();
            const expiresMs = createdMs + REQUEST_WINDOW * 1000;
            const remaining = Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining <= 0) {
                setExpired(true);
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        };
        tick();
        intervalRef.current = setInterval(tick, 1000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [request.createdAt]);

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    const isUrgent = timeLeft < 3600; // less than 1 hour

    const eventDate = new Date(request.eventDate).toLocaleDateString("hi-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    if (expired) {
        return (
            <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 opacity-60">
                <div className="flex items-center gap-2 text-gray-500">
                    <span className="material-symbols-outlined">timer_off</span>
                    <span className="font-bold">⏰ Expired</span>
                    <span className="text-sm">— {request.eventType}</span>
                </div>
            </div>
        );
    }

    return (
        <div
            className="bg-white border-l-4 border-amber-500 rounded-xl p-4 shadow-md animate-pulse-amber"
            id="alert-zone"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                    {/* Event type & booking number */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            {request.bookingNumber}
                        </span>
                        <span className="text-base font-bold text-gray-800">
                            {request.eventType}
                        </span>
                    </div>

                    {/* Date, location */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                            {eventDate}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {request.venueCity}
                            {request.venueArea && `, ${request.venueArea}`}
                        </span>
                    </div>

                    {/* Customer info */}
                    {request.customer && (
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-gray-600">
                                {request.customer.name || "Customer"}
                            </span>
                            {request.customer.rating && request.customer.rating > 0 && (
                                <span className="flex items-center gap-0.5 text-amber-600">
                                    <span className="material-symbols-outlined text-sm">star</span>
                                    {request.customer.rating.toFixed(1)}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Est. earning */}
                    {request.estimatedEarning && request.estimatedEarning > 0 && (
                        <div className="text-green-700 font-semibold text-sm">
                            अनुमानित कमाई: {fmtRupees(request.estimatedEarning)}
                        </div>
                    )}
                </div>

                {/* Countdown timer */}
                <div className="text-center flex-shrink-0">
                    <div
                        className={`text-2xl font-mono font-bold tabular-nums ${isUrgent ? "text-red-600" : "text-amber-700"
                            }`}
                    >
                        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
                        {String(seconds).padStart(2, "0")}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">शेष समय</div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
                <Link
                    href={`/bookings/${request.id}`}
                    className="flex-1 text-center bg-amber-500 text-white font-semibold py-2.5 rounded-lg hover:bg-amber-600 transition-colors"
                    style={{ minHeight: "44px" }}
                >
                    ✅ स्वीकार करें
                </Link>
                <Link
                    href={`/bookings/${request.id}`}
                    className="flex-1 text-center border-2 border-red-400 text-red-600 font-semibold py-2.5 rounded-lg hover:bg-red-50 transition-colors"
                    style={{ minHeight: "44px" }}
                >
                    ❌ अस्वीकार करें
                </Link>
            </div>
        </div>
    );
}
