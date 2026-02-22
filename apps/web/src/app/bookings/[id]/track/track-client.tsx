"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/auth-context";

// ── Types ─────────────────────────────────────────────────────────────────────

// Similar to booking-detail-client.tsx, but simplified for tracking
interface BookingDetail {
    id: string;
    bookingNumber: string;
    category: string;
    status: string;
    date: string;
    pandit: {
        id: string;
        displayName: string;
        profilePhotoUrl?: string;
        phone?: string;
        averageRating?: number;
        totalBookings?: number;
    };
    venueAddress: {
        city: string;
    };
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

// ── Time & Date Helpers ───────────────────────────────────────────────────────

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function TrackClient({ bookingId }: { bookingId: string }) {
    const { user, accessToken, openLoginModal, loading: authLoading } = useAuth();
    const router = useRouter();

    const [booking, setBooking] = useState<BookingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchBooking = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API}/bookings/${bookingId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.status === 404) {
                setError("Booking not found.");
                return;
            }
            if (!res.ok) throw new Error();
            const json = await res.json();
            setBooking(json.data ?? json);
        } catch {
            setError("Could not load tracking details.");
        } finally {
            setLoading(false);
        }
    }, [bookingId, accessToken]);

    useEffect(() => {
        if (!authLoading && !user) openLoginModal();
    }, [authLoading, user, openLoginModal]);

    useEffect(() => {
        if (user && accessToken) fetchBooking();
    }, [user, accessToken, fetchBooking]);

    // Loading skeleton
    if (authLoading || loading) {
        return (
            <div className="flex bg-slate-100 min-h-screen">
                <div className="flex-1 bg-white animate-pulse" />
                <div className="w-96 bg-white border-l border-slate-200 p-6 space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/2" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="space-y-6 mt-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-6 h-6 bg-slate-200 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl">error</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 mb-2">{error || "Tracking unavailable"}</h2>
                    <button
                        onClick={() => router.back()}
                        className="text-primary hover:underline font-medium text-sm"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex h-[calc(100vh-64px)] w-full flex-col lg:flex-row overflow-hidden bg-slate-100 dark:bg-[#101922]">

            {/* Map Area (Main) */}
            <main className="flex-1 relative overflow-hidden bg-[#e5e7eb] dark:bg-[#1c2127]">

                {/* Full Screen Map Background */}
                <div className="absolute inset-0 z-0">
                    <div
                        className="w-full h-full bg-cover bg-center opacity-80"
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAeaLCohXycqVnLLQCTXApvQRdXJYpA30yRcbha2X7bxeVG-JsEMqhdy3HKZMdmD-eok8AxQtRnuxu6KUNXgBGsTX1ooHAPzMntMBlLlzIfT0xR-iKfQZGWfRZR_bGGdB_sR_e8byDQun_HJ2x7fRZZ4zT7pJjVpsp_ndC9Fc3LLVhQR9ipEIaYoyBrMfumZaXp47unp6GQW5vn17qji73OFGOfkzwb2TKOnDjQ-A1BgVZrDE-Rk9LnPsOIUEcyL0735fsYp6Ngfiw')" }}
                    />

                    {/* Map Controls (Zoom) */}
                    <div className="absolute bottom-10 right-10 z-10 flex flex-col gap-2">
                        <button className="size-10 flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg shadow-lg text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">add</span>
                        </button>
                        <button className="size-10 flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg shadow-lg text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">remove</span>
                        </button>
                        <button className="size-10 flex items-center justify-center bg-primary text-white rounded-lg shadow-lg mt-2">
                            <span className="material-symbols-outlined">my_location</span>
                        </button>
                    </div>

                    {/* Simulated Route Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="relative w-1/2 h-1/2">
                            {/* Route Line */}
                            <div className="absolute top-1/2 left-1/4 w-[60%] h-1 bg-primary/40 rounded-full rotate-[-15deg]"></div>
                            {/* Current Position Marker */}
                            <div className="absolute top-[48%] left-[60%] flex flex-col items-center animate-bounce">
                                <div className="bg-primary text-white p-2 rounded-full shadow-xl">
                                    <span className="material-symbols-outlined">directions_car</span>
                                </div>
                                <div className="mt-2 bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-lg text-xs font-bold border border-primary text-slate-900 dark:text-white whitespace-nowrap">
                                    {booking.pandit.displayName}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Status Card (Bottom Left) */}
                <div className="absolute bottom-10 left-10 z-20 max-w-md w-full hidden md:block">
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold dark:text-white text-slate-900 line-clamp-1">
                                        {booking.pandit.displayName} is near Agra
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">Current Status: On Time</p>
                                    </div>
                                </div>
                                <div className="bg-primary/10 p-3 rounded-xl text-primary">
                                    <span className="material-symbols-outlined">schedule</span>
                                </div>
                            </div>

                            <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl mb-6">
                                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Estimated Arrival</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">
                                    4h 20m <span className="text-slate-400 text-base font-normal">at 02:20 AM</span>
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
                                        <span className="material-symbols-outlined text-sm">call</span>
                                        Call Pandit
                                    </button>
                                    <button className="flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold py-3 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all">
                                        <span className="material-symbols-outlined text-sm">chat</span>
                                        Message
                                    </button>
                                </div>
                                <button className="flex items-center justify-center gap-2 text-slate-500 hover:text-primary text-sm font-medium py-2 transition-colors">
                                    <span className="material-symbols-outlined text-sm">contact_support</span>
                                    Contact Backup Support
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            {/* Right Sidebar: Timeline */}
            <aside className="w-full lg:w-96 bg-white dark:bg-[#101922] border-l border-slate-200 dark:border-slate-800 z-30 flex flex-col h-full overflow-hidden shadow-2xl lg:shadow-none">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <h2 className="text-xl font-bold dark:text-white text-slate-900">Journey Timeline</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Varanasi → {booking.venueAddress.city || "Delhi"} Route</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                    <div className="relative space-y-8">
                        {/* Vertical Connector Line */}
                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800"></div>

                        {/* Timeline Item 1 */}
                        <div className="relative flex gap-4">
                            <div className="mt-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white dark:ring-[#101922]">
                                <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-bold dark:text-white text-slate-800">Journey Started</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Varanasi HQ</p>
                                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">4:00 PM ✓</p>
                            </div>
                        </div>

                        {/* Timeline Item 2 */}
                        <div className="relative flex gap-4">
                            <div className="mt-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white dark:ring-[#101922]">
                                <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-bold dark:text-white text-slate-800">Crossed Kanpur</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Highway Checkpoint 4</p>
                                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">8:45 PM ✓</p>
                            </div>
                        </div>

                        {/* Timeline Item 3 (Current) */}
                        <div className="relative flex gap-4">
                            <div className="mt-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-900/30">
                                <span className="material-symbols-outlined text-[16px] font-bold">more_horiz</span>
                            </div>
                            <div className="flex flex-col w-full">
                                <h4 className="font-bold dark:text-white text-lg text-slate-900">Approaching Agra</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Distance: 42km left</p>
                                <p className="text-sm font-bold text-amber-500 mt-1">10:00 PM 🟡 (In Transit)</p>

                                {/* Alert Box */}
                                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-cover shrink-0 bg-slate-200" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAD2hXxB9Oz9hMQZgbqOe75bUcWr3UIM-1PBVTnxPs065tEh4FFk-DDIW5F8XbNepxAe1cWUY_8JYxNlF5F0QWIa8IjG5Jm4rr3dwNwELv4uHFj_EpdKkHfSE82h9NQyBPlGYjfMPtQeVBO4mSV-zmJZFccR_bsriTXat4CBU4t_h-9D3H9jqU1BnqL-gbmTYt-EmNCbzAmXK9ecYRO9GcOm4FCPCt4hz8KdBifqOoyBvRhycRGkTFNsmec1cr_5d7m_rZOu82dGNg')" }}></div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 italic">"Traffic reported near Yamuna Expressway. Minor delay possible."</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Item 4 (Future) */}
                        <div className="relative flex gap-4 opacity-50">
                            <div className="mt-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 ring-4 ring-white dark:ring-[#101922]">
                                <span className="material-symbols-outlined text-[16px]">radio_button_unchecked</span>
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-bold dark:text-white text-slate-800">Mathura Transit</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Scheduled Stop</p>
                                <p className="text-sm font-medium mt-1 text-slate-400">Est. 12:15 AM</p>
                            </div>
                        </div>

                        {/* Timeline Item 5 (Destination) */}
                        <div className="relative flex gap-4 opacity-50">
                            <div className="mt-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 ring-4 ring-white dark:ring-[#101922]">
                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-bold dark:text-white text-slate-800">{booking.venueAddress.city || "Delhi"} (Destination)</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Pooja Venue</p>
                                <p className="text-sm font-medium mt-1 text-slate-400">Est. 02:20 AM</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pandit Profile Quick View (Bottom of Sidebar) */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="relative size-14 rounded-full overflow-hidden border-2 border-primary bg-slate-200">
                            {booking.pandit.profilePhotoUrl ? (
                                <Image src={booking.pandit.profilePhotoUrl} alt="Pandit" fill className="object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-3xl text-slate-400 w-full h-full flex items-center justify-center">person</span>
                            )}
                        </div>
                        <div>
                            <p className="font-bold dark:text-white text-slate-900">{booking.pandit.displayName}</p>
                            <div className="flex items-center text-amber-500 text-xs">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <span key={i} className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    ))}
                                </div>
                                <span className="ml-1 font-semibold">{booking.pandit.averageRating ? booking.pandit.averageRating.toFixed(1) : "New"} ({booking.pandit.totalBookings || 0} bookings)</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Expert in {booking.category || "Vedic Rituals"}</p>
                        </div>
                    </div>
                </div>

            </aside>

        </div>
    );
}
