"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../src/context/auth-context";
import { Tabs, StatusTimeline, PriceBreakdown, Badge, Button } from "@hmarepanditji/ui";
import { ItineraryTimeline } from "../../components/ItineraryTimeline";
import { DocumentCard } from "../../components/DocumentCard";
import { MuhuratPatrika } from "../../components/MuhuratPatrika";
import { PujaCompletionModal } from "../../components/PujaCompletionModal";
import Link from "next/link";
import { Phone, MessageCircle, MapPin } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { accessToken, loading: authLoading } = useAuth();

    const [booking, setBooking] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("Overview");
    const [loading, setLoading] = useState(true);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    const fetchBookingInfo = useCallback(async () => {
        if (!accessToken) return;
        try {
            const [bRes, hRes] = await Promise.all([
                fetch(`${API_URL}/bookings/${params.bookingId}`, { headers: { Authorization: `Bearer ${accessToken}` } }),
                fetch(`${API_URL}/bookings/${params.bookingId}/status-history`, { headers: { Authorization: `Bearer ${accessToken}` } })
            ]);
            const [bData, hData] = await Promise.all([bRes.json(), hRes.json()]);

            if (bData.success) {
                setBooking(bData.data.booking);
                if (bData.data.booking.status === "COMPLETED") {
                    setShowCompletionModal(true);
                }
            }
            if (hData.success) setHistory(hData.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [params.bookingId, accessToken]);

    useEffect(() => {
        if (!authLoading) {
            if (!accessToken) router.push("/login");
            else fetchBookingInfo();

            // Setup polling every 60s
            const interval = setInterval(() => {
                fetchBookingInfo();
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [fetchBookingInfo, authLoading, router, accessToken]);

    if (loading) return <div className="text-center py-20 text-gray-500 animate-pulse">Loading booking details...</div>;
    if (!booking) return <div className="text-center py-20 text-gray-500">Booking not found.</div>;

    const tabs = [
        { key: "Overview", label: "Overview", icon: "assignment" },
        { key: "Itinerary", label: "Itinerary", icon: "map" },
        { key: "Documents", label: "Documents", icon: "description" },
    ];

    // Map history to StatusTimeline steps
    const timelineSteps: any[] = history.map((h: any) => ({
        label: h.toStatus.replace(/_/g, " "),
        description: h.note,
        timestamp: new Date(h.createdAt),
        isCompleted: true
    }));

    // Add pending steps based on current status
    const allStatuses = ["CREATED", "CONFIRMED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS", "COMPLETED"];
    const currentStatusIndex = allStatuses.indexOf(booking.status);

    if (currentStatusIndex >= 0 && booking.status !== "COMPLETED" && booking.status !== "CANCELLED") {
        for (let i = currentStatusIndex; i < allStatuses.length; i++) {
            if (i === currentStatusIndex) {
                timelineSteps.push({ label: allStatuses[i].replace(/_/g, " "), isActive: true, timestamp: new Date() });
            } else {
                timelineSteps.push({ label: allStatuses[i].replace(/_/g, " "), isActive: false, isCompleted: false });
            }
        }
    }

    // Determine Banner
    let bannerClass = "bg-gray-100 text-gray-700";
    let bannerText = `Status: ${booking.status}`;
    switch (booking.status) {
        case "CONFIRMED": bannerClass = "bg-blue-50 text-blue-700 border-blue-200"; bannerText = "✅ Booking Confirmed — Pandit will arrive on schedule"; break;
        case "TRAVEL_BOOKED": bannerClass = "bg-blue-50 text-blue-700 border-blue-200"; bannerText = "✈️ Travel Arranged — All set for your puja"; break;
        case "PANDIT_EN_ROUTE": bannerClass = "bg-amber-50 text-amber-700 border-amber-200"; bannerText = "🚗 Pandit is on the way!"; break;
        case "PANDIT_ARRIVED": bannerClass = "bg-green-50 text-green-700 border-green-200"; bannerText = "🙏 Pandit has arrived!"; break;
        case "PUJA_IN_PROGRESS": bannerClass = "bg-green-50 text-green-700 border-green-200"; bannerText = "🕉️ Puja is happening..."; break;
        case "COMPLETED": bannerClass = "bg-green-50 text-green-700 border-green-200"; bannerText = "✅ Puja Completed — Share your experience!"; break;
        case "CANCELLED": bannerClass = "bg-red-50 text-red-700 border-red-200"; bannerText = "❌ Booking Cancelled"; break;
    }

    const d = new Date(booking.eventDate);
    const formattedDate = d.toLocaleDateString("hi-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    const showContact = ["CONFIRMED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED"].includes(booking.status);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {showCompletionModal && <PujaCompletionModal booking={booking} onClose={() => setShowCompletionModal(false)} />}

            {/* Header */}
            <div>
                <Link href="/dashboard/bookings" className="text-orange-600 hover:underline text-sm font-medium mb-4 inline-block flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Back to My Bookings
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{booking.eventType}</h1>
                        <p className="text-gray-500 font-medium">Booking ID: {booking.bookingNumber}</p>
                    </div>
                    <Badge variant={booking.status === "COMPLETED" ? "success" : booking.status === "CANCELLED" ? "error" : "info"} className="w-fit text-sm px-3 py-1">
                        {booking.status.replace(/_/g, " ")}
                    </Badge>
                </div>
            </div>

            <div className={`w-full p-4 rounded-xl border font-medium flex items-center gap-2 ${bannerClass}`}>
                {bannerText}
            </div>

            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            {/* OVERVIEW TAB */}
            {activeTab === "Overview" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        {/* Details Card */}
                        <div className="bg-white border text-left border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 text-lg mb-4">Event Details</h3>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-8 flex justify-center text-xl">📅</div>
                                    <div>
                                        <p className="text-sm text-gray-500">Date & Time</p>
                                        <p className="font-medium text-gray-900">{formattedDate}</p>
                                        {booking.muhuratTime && <p className="text-orange-600 font-medium text-sm mt-0.5">शुभ मुहूर्त: {booking.muhuratTime}</p>}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 flex justify-center text-xl">📍</div>
                                    <div>
                                        <p className="text-sm text-gray-500">Venue</p>
                                        <p className="font-medium text-gray-900">{booking.venueAddress}</p>
                                        <p className="font-medium text-gray-900">{booking.venueCity}, {booking.venuePincode}</p>
                                        <a href={`https://maps.google.com/?q=${booking.venueAddress}, ${booking.venueCity}`} target="_blank" className="text-orange-600 text-sm font-medium hover:underline inline-flex items-center gap-1 mt-1">
                                            <MapPin size={14} /> Open in Maps
                                        </a>
                                    </div>
                                </div>
                                {booking.specialInstructions && (
                                    <div className="flex gap-4">
                                        <div className="w-8 flex justify-center text-xl">📝</div>
                                        <div>
                                            <p className="text-sm text-gray-500">Special Instructions</p>
                                            <p className="font-medium text-gray-900">{booking.specialInstructions}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pandit Card */}
                        {booking.pandit ? (
                            <div className="bg-white border text-left border-gray-200 rounded-xl p-6 shadow-sm">
                                <h3 className="font-bold text-gray-900 text-lg mb-4">Assigned Pandit</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-2xl border-2 border-orange-200">
                                        {booking.pandit.name?.charAt(0) || "P"}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Pt. {booking.pandit.name}</h4>
                                        <Link href={`/pandit/${booking.pandit.id}`} className="text-orange-600 text-sm font-medium hover:underline">View Profile →</Link>
                                    </div>
                                </div>

                                {showContact ? (
                                    <div className="flex gap-3 mt-4">
                                        <a href={`tel:${booking.pandit.phone}`} className="flex-1 flex justify-center items-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                                            <Phone size={18} /> Call
                                        </a>
                                        <a href={`https://wa.me/${booking.pandit.phone?.replace('+', '')}`} className="flex-1 flex justify-center items-center gap-2 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 py-2.5 rounded-lg font-bold hover:bg-[#25D366]/20 transition-colors">
                                            <MessageCircle size={18} /> WhatsApp
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        Phone number will be visible closer to event date after travel is confirmed.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white border text-left border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center py-10">
                                <div className="text-4xl mb-3">🕒</div>
                                <h3 className="font-bold text-gray-900 mb-1">Pandit Assignment Pending</h3>
                                <p className="text-gray-500 text-center text-sm">We are matching you with the best pandit for your puja.</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Timeline */}
                        <div className="bg-white border text-left border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 text-lg mb-4">Status Tracker</h3>
                            <StatusTimeline steps={timelineSteps} />
                        </div>

                        {/* Price */}
                        <PriceBreakdown breakdown={booking} />

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            {booking.status === "COMPLETED" && !booking.review && (
                                <Button size="lg" className="w-full text-lg" onClick={() => router.push(`/dashboard/bookings/${booking.id}/review`)}>
                                    ⭐ Write Review
                                </Button>
                            )}
                            {["CREATED", "PANDIT_REQUESTED", "CONFIRMED", "TRAVEL_BOOKED"].includes(booking.status) && (
                                <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300" onClick={() => router.push(`/dashboard/bookings/${booking.id}/cancel`)}>
                                    Cancel Booking
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ITINERARY TAB */}
            {activeTab === "Itinerary" && (
                <ItineraryTimeline booking={booking} />
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === "Documents" && (
                <div className="space-y-4">
                    <DocumentCard
                        title="Booking Confirmation Receipt"
                        icon="📄"
                        actionText="Download PDF"
                        description="Auto-generated formal receipt for your booking"
                        onAction={() => alert("Downloading receipt...")}
                    />

                    {["CONFIRMED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS", "COMPLETED"].includes(booking.status) && (
                        <DocumentCard
                            title="Muhurat Patrika"
                            icon="🕉️"
                            actionText="View Certificate"
                            description="Auspicious Timing Certificate"
                            onAction={() => setActiveTab("Muhurat")}
                        />
                    )}

                    {booking.status === "COMPLETED" && (
                        <DocumentCard
                            title="Puja Completion Certificate"
                            icon="📜"
                            actionText="View & Share"
                            onAction={() => setShowCompletionModal(true)}
                        />
                    )}

                    {booking.travelRequired && ["TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS", "COMPLETED"].includes(booking.status) && (
                        <DocumentCard
                            title="Travel Tickets & Voucher"
                            icon="🎫"
                            actionText="View Documents"
                            description="Tickets arranged by platform"
                            onAction={() => alert("Viewing travel docs...")}
                        />
                    )}
                </div>
            )}

            {activeTab === "Muhurat" && (
                <div className="pt-4">
                    <button onClick={() => setActiveTab("Documents")} className="text-orange-600 hover:underline text-sm font-medium mb-4 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Documents
                    </button>
                    <MuhuratPatrika booking={booking} />
                </div>
            )}
        </div>
    );
}
