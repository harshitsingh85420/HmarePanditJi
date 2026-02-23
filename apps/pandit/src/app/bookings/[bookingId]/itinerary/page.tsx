"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { hi } from "date-fns/locale";
import {
    Button,
    Card,
    VoiceButton
} from "@hmarepanditji/ui";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

type ItineraryData = any;

export default function ItineraryPage() {
    const params = useParams();
    const router = useRouter();
    const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
    const [booking, setBooking] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.bookingId) {
            loadItinerary(params.bookingId as string);
        }
    }, [params.bookingId]);

    const loadItinerary = async (id: string) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("hpj_pandit_token") || localStorage.getItem("hpj_pandit_access_token") || localStorage.getItem("token");
            const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

            const [itineraryRes, bookingRes] = await Promise.all([
                fetch(`${API_BASE}/pandits/bookings/${id}/itinerary`, { headers }),
                fetch(`${API_BASE}/pandits/bookings/${id}`, { headers })
            ]);

            if (itineraryRes.ok && bookingRes.ok) {
                const itineraryJson = await itineraryRes.json();
                const bookingJson = await bookingRes.json();
                setItinerary(itineraryJson.data);
                setBooking(bookingJson.data);
            } else {
                router.push(`/bookings/${id}`);
            }
        } catch (err) {
            console.error("Failed to load itinerary", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!itinerary || !booking) return <div className="p-4 text-center">यात्रा प्लान नहीं मिला</div>;

    const voiceSummary = `आपकी यात्रा का प्लान: ${format(new Date(booking.eventDate), "d MMMM", { locale: hi })} को ${booking.pandit?.location || "हरिद्वार"} से ${booking.venueCity || "नई दिल्ली"} जाना है। ${booking.travelMode === 'TRAIN' ? 'ट्रेन' : 'कैब'} से यात्रा करनी है।`;

    return (
        <div className="container mx-auto px-4 py-6 max-w-2xl animate-in fade-in duration-500 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href={`/bookings/${booking.id}`} className="text-gray-500 p-2 -ml-2 hover:bg-gray-100 rounded-full bg-white shadow-sm">
                    ←
                </Link>
                <h1 className="text-xl font-bold flex-1">यात्रा का प्लान</h1>
                <Button variant="outline" className="text-xs border-brand-500 text-brand-600 px-3 py-1">⬇️ PDF डाउनलोड</Button>
            </div>

            <VoiceButton textToSpeak={voiceSummary} className="w-full mb-6 bg-white py-3 shadow-sm border border-brand-100" />

            {/* Journey Header */}
            <div className="text-center mb-8 px-4 py-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white opacity-10"></div>

                <div className="flex justify-between items-center relative z-10 font-bold text-xl mb-2">
                    <span>{booking.pandit?.location || "Haridwar"}</span>
                    <div className="flex-1 px-4 flex flex-col items-center">
                        <span className="text-xs opacity-75 mb-1">{booking.travelMode || "Transport"}</span>
                        <div className="w-full h-1 bg-white/30 rounded-full relative">
                            <div className="absolute right-0 -mt-1 w-3 h-3 border-r-2 border-t-2 border-white transform translate-x-1/2 rotate-45"></div>
                        </div>
                        <span className="text-[10px] mt-1 opacity-75">~{booking.travelDistanceKm} km</span>
                    </div>
                    <span>{booking.venueCity || "New Delhi"}</span>
                </div>
            </div>

            <div className="space-y-6 pb-20">
                {/* Outbound Journey Card */}
                <Card padding="md" className="shadow-md border border-gray-100 overflow-hidden">
                    <div className="bg-blue-50 -mx-4 -mt-4 p-3 mb-4 border-b border-blue-100">
                        <h2 className="font-bold text-blue-900 flex items-center gap-2">
                            <span>🛫 जाते समय</span>
                            <span className="text-sm font-normal text-blue-700 ml-auto">{format(new Date(itinerary.outboundDate || Date.now()), "dd MMMM yyyy", { locale: hi })}</span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {(itinerary.outboundLegs || [
                            {
                                mode: booking.travelMode || "TRAIN",
                                from: booking.pandit?.location || "Haridwar",
                                to: booking.venueCity || "New Delhi",
                                departure: "07:15 AM",
                                arrival: "11:30 AM",
                                refNumber: booking.travelBookingRef || "PNR 4521839203",
                                note: "Platform 3 — arrive 20 min early"
                            }
                        ]).map((leg: any, idx: number) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative">
                                <div className="absolute top-4 right-4 text-2xl opacity-20">
                                    {leg.mode === 'TRAIN' ? '🚂' : leg.mode === 'FLIGHT' ? '✈️' : leg.mode === 'CAB' ? '🚕' : '🚗'}
                                </div>
                                <div className="font-semibold text-gray-900 mb-3 border-b pb-2 flex items-center justify-between">
                                    <span>{leg.mode}</span>
                                    {leg.refNumber && <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono">{leg.refNumber}</span>}
                                </div>
                                <div className="flex justify-between items-center text-sm mb-4">
                                    <div>
                                        <p className="font-bold text-gray-800">{leg.from}</p>
                                        <p className="text-gray-500 font-medium">{leg.departure}</p>
                                    </div>
                                    <div className="flex-1 flex justify-center text-gray-300">
                                        →
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-800">{leg.to}</p>
                                        <p className="text-gray-500 font-medium">{leg.arrival}</p>
                                    </div>
                                </div>
                                {leg.note && <p className="text-xs bg-amber-50 text-amber-800 p-2 rounded mb-3">📍 {leg.note}</p>}
                                <Button variant="outline" className="w-full text-sm py-2">📍 Google Maps से निर्देश लें</Button>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Accommodation Card */}
                {booking.accommodationArrangement === "PLATFORM_BOOKS" && (
                    <Card padding="md" className="shadow-md border border-gray-100 overflow-hidden">
                        <div className="bg-purple-50 -mx-4 -mt-4 p-3 mb-4 border-b border-purple-100">
                            <h2 className="font-bold text-purple-900 flex items-center gap-2">🏨 ठहरने की व्यवस्था</h2>
                        </div>
                        <div className="text-sm space-y-2">
                            <p className="font-bold text-gray-900 text-lg">{itinerary.hotel?.name || "Hotel Regency"}</p>
                            <p className="text-gray-600">{itinerary.hotel?.address || booking.venueCity}</p>
                            <div className="flex gap-4 mt-2">
                                <p className="text-gray-600"><span className="font-semibold">Check-in:</span> {itinerary.hotel?.checkIn || "14 Mar, 02:00 PM"}</p>
                                <p className="text-gray-600"><span className="font-semibold">Check-out:</span> {itinerary.hotel?.checkOut || "16 Mar, 11:00 AM"}</p>
                            </div>
                            <Button variant="outline" className="w-full mt-4 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">📍 Maps में देखें</Button>
                        </div>
                    </Card>
                )}

                {/* Return Journey Card */}
                {itinerary.returnLegs !== false && (
                    <Card padding="md" className="shadow-md border border-gray-100 overflow-hidden">
                        <div className="bg-orange-50 -mx-4 -mt-4 p-3 mb-4 border-b border-orange-100">
                            <h2 className="font-bold text-orange-900 flex items-center gap-2">
                                <span>🛬 वापसी</span>
                                <span className="text-sm font-normal text-orange-700 ml-auto">{format(new Date(itinerary.returnDate || Date.now() + 86400000), "dd MMMM yyyy", { locale: hi })}</span>
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {(itinerary.returnLegs || [
                                {
                                    mode: booking.travelMode || "TRAIN",
                                    from: booking.venueCity || "New Delhi",
                                    to: booking.pandit?.location || "Haridwar",
                                    departure: "04:30 PM",
                                    arrival: "09:00 PM",
                                    refNumber: "PNR 8921839211"
                                }
                            ]).map((leg: any, idx: number) => (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative">
                                    <div className="absolute top-4 right-4 text-2xl opacity-20">
                                        {leg.mode === 'TRAIN' ? '🚂' : leg.mode === 'FLIGHT' ? '✈️' : leg.mode === 'CAB' ? '🚕' : '🚗'}
                                    </div>
                                    <div className="font-semibold text-gray-900 mb-3 border-b pb-2 flex items-center justify-between">
                                        <span>{leg.mode}</span>
                                        {leg.refNumber && <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono">{leg.refNumber}</span>}
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <div>
                                            <p className="font-bold text-gray-800">{leg.from}</p>
                                            <p className="text-gray-500 font-medium">{leg.departure}</p>
                                        </div>
                                        <div className="flex-1 flex justify-center text-gray-300">
                                            →
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-800">{leg.to}</p>
                                            <p className="text-gray-500 font-medium">{leg.arrival}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Expense Summary */}
                <Card padding="md" className="shadow-md bg-emerald-50 border-emerald-100">
                    <h2 className="font-bold text-emerald-900 mb-4 border-b border-emerald-200 pb-2">आपके सभी खर्चे वापस मिलेंगे:</h2>
                    <div className="space-y-2 text-sm text-emerald-800 mb-4">
                        <div className="flex justify-between">
                            <span>Train (जाते समय)</span>
                            <span className="font-semibold">₹{(booking.travelCost / 2) || 850}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Train (वापसी)</span>
                            <span className="font-semibold">₹{(booking.travelCost / 2) || 850}</span>
                        </div>
                        {booking.foodAllowanceAmount > 0 && (
                            <div className="flex justify-between">
                                <span>खाना भत्ता</span>
                                <span className="font-semibold">₹{booking.foodAllowanceAmount}</span>
                            </div>
                        )}
                        <hr className="border-emerald-200 my-2" />
                        <div className="flex justify-between text-lg font-bold">
                            <span>कुल किराया:</span>
                            <span>₹{booking.travelCost + booking.foodAllowanceAmount}</span>
                        </div>
                    </div>
                    <div className="text-xs bg-white text-emerald-700 p-2 rounded text-center font-medium shadow-sm">
                        नोट: पूजा पूरी होने के 24 घंटे में आपके खाते में
                    </div>
                </Card>
            </div>
        </div>
    );
}
