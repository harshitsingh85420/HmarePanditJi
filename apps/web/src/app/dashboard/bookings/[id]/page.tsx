"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, API_BASE } from "../../../../context/auth-context";

interface BookingDetail {
    id: string;
    bookingNumber: string;
    eventDate: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    customer: {
        id: string;
        userId: string;
    };
    pandit?: {
        id: string;
        displayName: string;
        userId: string;
        user: {
            phone: string;
            avatarUrl?: string;
        };
    };
    ritual: {
        name: string;
        duration: number;
    };
    venueAddress: string;
    venueCity: string;
    specialInstructions?: string;
    hasTravel?: boolean;
}

export default function BookingDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user, accessToken, loading: authLoading } = useAuth();
    const router = useRouter();

    const [booking, setBooking] = useState<BookingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
            return;
        }

        if (authLoading || !accessToken || !id) return;

        async function fetchBooking() {
            try {
                const res = await fetch(`${API_BASE}/bookings/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (!res.ok) {
                    if (res.status === 404) throw new Error("Booking not found");
                    if (res.status === 403) throw new Error("Access denied");
                    throw new Error("Failed to fetch booking");
                }

                const json = await res.json();
                if (json.success && json.data?.booking) {
                    setBooking(json.data.booking);
                } else {
                    throw new Error("Invalid response format");
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                setLoading(false);
            }
        }

        fetchBooking();
    }, [id, user, accessToken, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#f49d25] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-rose-500">error</span>
                    </div>
                    <h2 className="text-slate-700 font-semibold text-lg mb-2">Error Loading Booking</h2>
                    <p className="text-slate-400 text-sm mb-6">{error || "Booking not found"}</p>
                    <button
                        onClick={() => router.push("/dashboard/bookings")}
                        className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold"
                    >
                        Back to Bookings
                    </button>
                </div>
            </div>
        );
    }

    // Derived state for UI
    const isPanditAssigned = !!booking.pandit;
    const isConfirmed = booking.status === "CONFIRMED" || booking.status === "PANDIT_EN_ROUTE" || booking.status === "PANDIT_ARRIVED" || booking.status === "PUJA_IN_PROGRESS" || booking.status === "COMPLETED";
    const panditName = booking.pandit?.displayName || "Pending Assignment";
    const panditAvatar = booking.pandit?.user?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCWGErik0iadlnlp_8yBDqC-V3kyRE-UqjHKiW5SPBm4DG_GLDpXEY3Ce0VimJgZf3ZktjJ2JeNpH04TZUjMQ5OYcWLABUMn4WLj4sRiQwChWMvCKImwesPjObgzXjWUggU7uni_5ZLz1hKsqaR73KIh-_HLMyImDgxVxBbTsNE9Z9zQ3eFSJziwR73r4tIcR7wmZgBHElgwQ8fxXJnJ_Y9_M_G6q3LEinusfwPwdN9VHaktGktcmqi5uhJIKGBWuKLYDssPahW9Hg"; // Fallback URL from HTML

    return (
        <div className="min-h-screen bg-[#f8f7f5] pb-20">
            <div className="flex flex-col lg:flex-row max-w-[1440px] mx-auto w-full gap-6 p-6">
                {/* Sidebar: Navigation & Documents */}
                <aside className="w-full lg:w-72 flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-slate-900 font-bold text-lg mb-4">Booking Details</h3>
                        <p className="text-[#f49d25] font-bold text-sm mb-1 uppercase tracking-wider">Booking ID</p>
                        <p className="text-slate-500 text-lg font-mono mb-6">{booking.bookingNumber}</p>
                        <nav className="flex flex-col gap-1">
                            <a className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#f49d25]/10 text-[#f49d25] font-bold" href="#">
                                <span className="material-symbols-outlined">dashboard</span> Overview
                            </a>
                            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors font-medium" href="#">
                                <span className="material-symbols-outlined">chat</span> Messages
                            </a>
                            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors font-medium" href="#">
                                <span className="material-symbols-outlined">payments</span> Payments
                            </a>
                            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors font-medium" href="#">
                                <span className="material-symbols-outlined">settings</span> Settings
                            </a>
                        </nav>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-slate-900 font-bold text-lg mb-4">Documents</h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 group cursor-pointer hover:bg-[#f49d25]/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-900">Itinerary</span>
                                        <span className="text-xs text-slate-500">1.2 MB</span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-[#f49d25] transition-colors">download</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 group cursor-pointer hover:bg-[#f49d25]/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-900">Muhurat Patrika</span>
                                        <span className="text-xs text-slate-500">2.4 MB</span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-[#f49d25] transition-colors">download</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col gap-6">
                    {/* Main Header & Status */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Booking {booking.status}</h1>
                            <p className="text-slate-600 text-lg mt-1">{booking.ritual.name} Ceremony</p>
                        </div>
                        {booking.paymentStatus === 'CAPTURED' && (
                            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 w-fit">
                                <span className="material-symbols-outlined text-base">check_circle</span>
                                Payment Verified
                            </div>
                        )}
                        {booking.paymentStatus === 'PENDING' && (
                            <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 w-fit">
                                <span className="material-symbols-outlined text-base">pending</span>
                                Payment Pending
                            </div>
                        )}
                    </div>

                    {/* Pandit Status Banner - Only show if confirmed and pandit assigned */}
                    {isConfirmed && isPanditAssigned && (
                        <div className="bg-gradient-to-r from-[#f49d25] to-orange-500 rounded-xl p-6 shadow-lg relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <div
                                            className="size-16 rounded-full border-4 border-white/30 bg-center bg-no-repeat bg-cover"
                                            style={{ backgroundImage: `url('${panditAvatar}')` }}
                                        />
                                        <div className="absolute bottom-0 right-0 size-5 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="text-white">
                                        <h2 className="text-xl font-bold">{panditName} is assigned</h2>
                                        <p className="text-white/80">Live tracking enabled for your peace of mind.</p>
                                    </div>
                                </div>
                                <Link href={`/dashboard/bookings/${id}/track`} className="bg-white text-[#f49d25] hover:bg-slate-50 px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-sm inline-block text-center">
                                    Track Now
                                </Link>
                            </div>
                            {/* Abstract Background Pattern */}
                            <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 pointer-events-none">
                                <svg className="h-full w-full fill-white" viewBox="0 0 100 100">
                                    <circle cx="80" cy="50" r="40"></circle>
                                    <circle cx="100" cy="20" r="30"></circle>
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Not Assigned Banner - If pending */}
                    {!isPanditAssigned && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 relative overflow-hidden">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                    <span className="material-symbols-outlined">person_search</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-blue-900">Looking for the perfect Pandit Ji...</h3>
                                    <p className="text-blue-700 text-sm">We made a request to top rated pandits in your area. You will be notified once assigned.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Central Timeline */}
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-slate-900 font-bold text-xl mb-8 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#f49d25]">route</span> Status Timeline
                        </h3>
                        <div className="relative flex flex-col gap-0">
                            {/* Connecting Line */}
                            <div className="absolute left-[27px] top-6 bottom-6 w-1 bg-slate-100"></div>

                            {/* Timeline Item 1: Booking Created */}
                            <div className="flex items-start gap-6 pb-10 relative">
                                <div className="z-10 size-14 flex items-center justify-center rounded-full bg-[#f49d25]/20 text-[#f49d25] border-4 border-white">
                                    <span className="material-symbols-outlined">event_available</span>
                                </div>
                                <div className="flex flex-col pt-1">
                                    <p className="text-slate-900 font-bold text-lg leading-none">Booking Confirmed</p>
                                    <p className="text-slate-500 mt-2 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">calendar_today</span> {new Date(booking.eventDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Timeline Item 2: Pandit En Route (Conditional) */}
                            {(booking.status === "PANDIT_EN_ROUTE" || booking.status === "PANDIT_ARRIVED" || booking.status === "COMPLETED") && (
                                <div className="flex items-start gap-6 pb-10 relative">
                                    <div className="z-10 size-14 flex items-center justify-center rounded-full bg-[#f49d25]/20 text-[#f49d25] border-4 border-white">
                                        <span className="material-symbols-outlined">directions_car</span>
                                    </div>
                                    <div className="flex flex-col pt-1">
                                        <p className="text-slate-900 font-bold text-lg leading-none">Pandit En Route</p>
                                        <p className="text-slate-500 mt-2 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">schedule</span> On the way
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Timeline Item 3: Ceremony Start */}
                            <div className="flex items-start gap-6 relative">
                                <div className={`z-10 size-14 flex items-center justify-center rounded-full border-4 border-white ${isConfirmed ? 'bg-[#f49d25] text-white ring-4 ring-[#f49d25]/20' : 'bg-slate-100 text-slate-400'}`}>
                                    <span className="material-symbols-outlined">temple_hindu</span>
                                </div>
                                <div className="flex flex-col pt-1">
                                    <p className={`font-bold text-lg leading-none ${isConfirmed ? 'text-[#f49d25]' : 'text-slate-400'}`}>{booking.ritual.name} Muhurat</p>
                                    <p className="text-slate-500 mt-2 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">calendar_today</span> {new Date(booking.eventDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                    <p className="text-slate-400 text-sm mt-1">Location: {booking.venueCity}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Track Pandit */}
                        <Link href={`/dashboard/bookings/${id}/track`} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer block">
                            <div className="size-12 rounded-lg bg-[#f49d25]/10 flex items-center justify-center text-[#f49d25] mb-4 group-hover:bg-[#f49d25] group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">my_location</span>
                            </div>
                            <h4 className="text-slate-900 font-bold mb-1">Track Pandit</h4>
                            <p className="text-slate-500 text-sm">Real-time GPS tracking</p>
                        </Link>
                        {/* Chat with Pandit */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                            <div className="size-12 rounded-lg bg-[#f49d25]/10 flex items-center justify-center text-[#f49d25] mb-4 group-hover:bg-[#f49d25] group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">forum</span>
                            </div>
                            <h4 className="text-slate-900 font-bold mb-1">Chat with Pandit</h4>
                            <p className="text-slate-500 text-sm">Discuss ritual details</p>
                        </div>
                        {/* View Samagri List */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                            <div className="size-12 rounded-lg bg-[#f49d25]/10 flex items-center justify-center text-[#f49d25] mb-4 group-hover:bg-[#f49d25] group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">inventory_2</span>
                            </div>
                            <h4 className="text-slate-900 font-bold mb-1">View Samagri List</h4>
                            <p className="text-slate-500 text-sm">Required items checklist</p>
                        </div>
                        {/* Support */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                            <div className="size-12 rounded-lg bg-[#f49d25]/10 flex items-center justify-center text-[#f49d25] mb-4 group-hover:bg-[#f49d25] group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">support_agent</span>
                            </div>
                            <h4 className="text-slate-900 font-bold mb-1">Support</h4>
                            <p className="text-slate-500 text-sm">24/7 Concierge help</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
