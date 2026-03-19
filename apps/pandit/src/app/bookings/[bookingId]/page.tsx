"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format, differenceInHours, differenceInMinutes } from "date-fns";
import { hi } from "date-fns/locale";
import {
    Button,
    Card,
    Badge,
    StatusTimeline,
    PriceBreakdown,
    VoiceButton
} from "@hmarepanditji/ui";

type BookingData = any;

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<BookingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRatingSheet, setShowRatingSheet] = useState(false);
    const [ratingData, setRatingData] = useState({ punctuality: 5, hospitality: 5, foodArrangement: 5, comment: "" });
    const [submittingRating, setSubmittingRating] = useState(false);

    useEffect(() => {
        if (params.bookingId) {
            loadBooking(params.bookingId as string);
        }
    }, [params.bookingId]);

    const loadBooking = async (id: string) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

            const res = await fetch(`/api/pandit/bookings/${id}`, { headers });
            if (res.ok) {
                const json = await res.json();
                setBooking(json.data);
            } else {
                router.push("/bookings");
            }
        } catch (err) {
            const [submittingRating, setSubmittingRating] = useState(false);

            useEffect(() => {
                if (params.bookingId) {
                    loadBooking(params.bookingId as string);
                }
            }, [params.bookingId]);

            const loadBooking = async (id: string) => {
                try {
                    setLoading(true);
                    const token = localStorage.getItem("token");
                    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

                    const res = await fetch(`/api/pandit/bookings/${id}`, { headers });
                    if (res.ok) {
                        const json = await res.json();
                        setBooking(json.data);
                    } else {
                        router.push("/bookings");
                    }
                } catch (err) {
                    console.error("Failed to load booking", err);
                } finally {
                    setLoading(false);
                }
            };

            const handleAction = async (action: string) => {
                try {
                    const token = localStorage.getItem("token");
                    const res = await fetch(`/api/pandit/bookings/${booking?.id}/${action}`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ reason: "Other" }) // only used if decline
                    });
                    if (res.ok) {
                        loadBooking(booking!.id);
                        if (action === "complete") {
                            setShowRatingSheet(true);
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            };


            const submitRating = async () => {
                try {
                    setSubmittingRating(true);
                    const token = localStorage.getItem("token");
                    const res = await fetch(`/api/pandit/bookings/${booking?.id}/rate-customer`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(ratingData)
                    });
                    if (res.ok) {
                        setShowRatingSheet(false);
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setSubmittingRating(false);
                }
            };

            if (loading) {
                return (
                    <div className="flex justify-center items-center h-screen">
                        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
                    </div>
                );
            }

            if (!booking) return <div className="p-4 text-center">बुकिंग नहीं मिली</div>;

            const isConfirmedOrLater = ["CONFIRMED", "TRAVEL_BOOKED", "PANDIT_EN_ROUTE", "PANDIT_ARRIVED", "PUJA_IN_PROGRESS", "COMPLETED"].includes(booking.status);
            const customerName = isConfirmedOrLater ? booking.customer.name : booking.customer.name?.split(" ")[0];
            const customerPhone = booking.customer.phone;

            const hoursToEvent = differenceInHours(new Date(booking.eventDate), new Date());
            const showMaskedPhone = !isConfirmedOrLater || hoursToEvent > 0; // Or specific logic like < 30m

            const voiceSummary = `यह बुकिंग ${customerName} के घर ${booking.venueCity} में ${format(new Date(booking.eventDate), "d MMMM", { locale: hi })} को ${booking.eventType} के लिए है। कुल आमदनी ${booking.panditPayout} रुपये होगी।`;

            return (
                <div className="container mx-auto px-4 py-6 max-w-2xl mb-24 animate-in fade-in duration-500">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/bookings" className="text-gray-500 p-2 -ml-2 hover:bg-gray-100 rounded-full">
                            ←
                        </Link>
                        <h1 className="text-xl font-bold flex-1">बुकिंग का विवरण</h1>
                        <Badge className={booking.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                            {booking.status.replace(/_/g, " ")}
                        </Badge>
                    </div>

                    <VoiceButton textToSpeak={voiceSummary} className="w-full mb-6 py-3" />

                    <div className="space-y-6">
                        {/* Section 1: Event Details */}
                        <Card padding="md" className="shadow-sm">
                            <h2 className="text-lg font-bold mb-4 border-b pb-2 border-gray-100 font-sans text-brand-900 border-l-4 border-l-amber-500 pl-3">पूजा की जानकारी</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">पूजा का नाम:</span>
                                    <span className="font-semibold text-right">{booking.eventType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">तारीख:</span>
                                    <span className="font-semibold text-right">{format(new Date(booking.eventDate), "EEEE, d MMMM yyyy", { locale: hi })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">समय:</span>
                                    <span className="font-semibold text-right">{booking.muhuratTime || format(new Date(booking.eventDate), "h:mm a")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">पता:</span>
                                    <span className="font-semibold text-right max-w-[200px]">
                                        {isConfirmedOrLater ? booking.venueAddress : booking.venueCity}
                                    </span>
                                </div>
                                {booking.specialInstructions && (
                                    <div className="bg-amber-50 p-3 rounded-lg mt-2 text-amber-800 text-sm">
                                        <strong>विशेष निर्देश:</strong> {booking.specialInstructions}
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Section 2: Customer Information */}
                        <Card padding="md" className="shadow-sm">
                            <h2 className="text-lg font-bold mb-4 border-b pb-2 border-gray-100 font-sans text-brand-900 border-l-4 border-l-blue-500 pl-3">ग्राहक की जानकारी</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">नाम:</span>
                                    <span className="font-semibold text-right">{customerName} जी</span>
                                </div>
                                {booking.customer.customerProfile?.gotra && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">गोत्र:</span>
                                        <span className="font-semibold text-right">{booking.customer.customerProfile.gotra}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-500">ग्राहक की भाषा:</span>
                                    <span className="font-semibold text-right">
                                        {booking.customer.customerProfile?.preferredLanguages?.join(", ") || "Hindi"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">फोन नंबर:</span>
                                    {showMaskedPhone ? (
                                        <span className="font-semibold text-right text-gray-400">
                                            +91 •••••••{customerPhone?.slice(-3)}
                                            {hoursToEvent < 24 && hoursToEvent > 0 && (
                                                <div className="text-xs font-normal text-amber-600 mt-1">
                                                    नंबर {hoursToEvent} घंटे में दिखेगा
                                                </div>
                                            )}
                                        </span>
                                    ) : (
                                        <a href={`tel:${customerPhone}`} className="text-brand-600 font-semibold underline">
                                            {customerPhone}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Section 3: Samagri / Requirements */}
                        <Card padding="md" className="shadow-sm">
                            <h2 className="text-lg font-bold mb-4 border-b pb-2 border-gray-100 font-sans text-brand-900 border-l-4 border-l-green-500 pl-3">सामग्री की जानकारी</h2>
                            <div className="text-sm">
                                {booking.samagriPreference === "PANDIT_BRINGS" && (
                                    <>
                                        <p className="font-semibold text-green-700 bg-green-50 p-3 rounded mb-2">✅ आप सामग्री लेकर आएंगे</p>
                                        {booking.samagriAmount > 0 && <p className="text-gray-600">पैकेज: ₹{booking.samagriAmount}</p>}
                                        {booking.samagriCustomList && <pre className="text-xs bg-gray-50 p-2 mt-2 rounded overflow-auto">{JSON.stringify(booking.samagriCustomList, null, 2)}</pre>}
                                    </>
                                )}
                                {booking.samagriPreference === "CUSTOMER_ARRANGES" && (
                                    <p className="font-semibold text-blue-700 bg-blue-50 p-3 rounded">🧑 ग्राहक खुद व्यवस्था करेगा</p>
                                )}
                                {booking.samagriPreference === "NEED_HELP" && (
                                    <p className="font-semibold text-amber-700 bg-amber-50 p-3 rounded">🤝 हमारी टीम सामग्री व्यवस्था में मदद करेगी</p>
                                )}
                            </div>
                        </Card>

                        {/* Section 4: Travel Info */}
                        {booking.travelRequired && (
                            <Card padding="md" className="shadow-sm">
                                <h2 className="text-lg font-bold mb-4 border-b pb-2 border-gray-100 font-sans text-brand-900 border-l-4 border-l-purple-500 pl-3">यात्रा की जानकारी</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">चुना गया तरीका:</span>
                                        <span className="font-semibold text-right">{booking.travelMode || 'Admin Arranging'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">दूरी:</span>
                                        <span className="font-semibold text-right">~{booking.travelDistanceKm} km</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">यात्रा लागत:</span>
                                        <span className="font-semibold text-right">₹{booking.travelCost} (Reimbursed)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">खाने का भत्ता:</span>
                                        <span className="font-semibold text-right">₹{booking.foodAllowanceAmount} ({booking.foodAllowanceDays} दिन)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">ठहरने की व्यवस्था:</span>
                                        <span className="font-semibold text-right">
                                            {booking.accommodationArrangement === "CUSTOMER_ARRANGES" ? 'ग्राहक करेंगे' : (booking.accommodationArrangement === "PLATFORM_BOOKS" ? 'Platform booked' : 'NOT NEEDED')}
                                        </span>
                                    </div>

                                    {booking.travelStatus === "BOOKED" && (
                                        <Link href={`/bookings/${booking.id}/itinerary`}>
                                            <Button variant="outline" className="w-full mt-4 flex items-center justify-center gap-2 border-purple-500 text-purple-700 hover:bg-purple-50">
                                                🗺️ यात्रा प्लान देखें →
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Section 5: Earnings Breakdown */}
                        <Card padding="md" className="shadow-sm">
                            <h2 className="text-lg font-bold mb-4 border-b pb-2 border-gray-100 font-sans text-brand-900 border-l-4 border-l-emerald-500 pl-3">आपकी कमाई</h2>
                            <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">दक्षिणा:</span>
                                    <span className="font-medium">₹{booking.dakshinaAmount - booking.platformFee}</span>
                                </div>
                                {booking.travelCost > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">यात्रा खर्च (Reimbursement):</span>
                                        <span className="font-medium">₹{booking.travelCost}</span>
                                    </div>
                                )}
                                {booking.foodAllowanceAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">खाना भत्ता:</span>
                                        <span className="font-medium">₹{booking.foodAllowanceAmount}</span>
                                    </div>
                                )}
                                {booking.samagriAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">सामग्री:</span>
                                        <span className="font-medium">₹{booking.samagriAmount}</span>
                                    </div>
                                )}
                                <hr className="my-2" />
                                <div className="flex justify-between font-bold text-lg text-emerald-700">
                                    <span>कुल आमदनी:</span>
                                    <span>₹{booking.panditPayout}</span>
                                </div>
                                <p className="text-xs text-gray-500 text-center mt-3 bg-white p-2 border rounded">
                                    (प्लेटफॉर्म की 15% सेवा शुल्क काटकर)<br />
                                    भुगतान पूजा पूरी होने के 24 घंटे में होगा
                                </p>
                            </div>
                        </Card>

                        {/* Section 6: Status Timeline */}
                        <Card padding="md" className="shadow-sm mb-20 overflow-hidden">
                            <h2 className="text-lg font-bold mb-6 font-sans text-brand-900">स्टेटस हिस्ट्री</h2>
                            <StatusTimeline
                                steps={booking.statusUpdates?.map((su: any, index: number) => ({
                                    label: su.toStatus.replace(/_/g, " "),
                                    description: su.note,
                                    timestamp: new Date(su.createdAt),
                                    status: index === booking.statusUpdates.length - 1 ? 'active' : 'completed'
                                })) || [
                                        { label: booking.status.replace(/_/g, " "), status: 'active', timestamp: new Date() }
                                    ]}
                            />
                        </Card>
                    </div>

                    {/* Section 7: Action Buttons Overlay */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex gap-3 z-50">
                        {booking.status === "PANDIT_REQUESTED" && (
                            <>
                                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-lg" onClick={() => handleAction("accept")}>✅ स्वीकार करें</Button>
                                <Button variant="outline" className="flex-1 border-red-500 text-red-500 hover:bg-red-50 py-3 text-lg" onClick={() => handleAction("decline")}>❌ मना करें</Button>
                            </>
                        )}

                        {booking.status === "CONFIRMED" && (
                            <>
                                <Button variant="outline" className="flex-1 border-brand-500 text-brand-600 font-semibold py-3">📅 कैलेंडर में जोड़ें</Button>
                                <Button variant="outline" className="flex-1 border-gray-300 font-semibold py-3 text-gray-700" onClick={() => window.open('tel:1800123456')}>💬 सहायता</Button>
                            </>
                        )}

                        {["TRAVEL_BOOKED", "PANDIT_EN_ROUTE"].includes(booking.status) && (
                            <>
                                <Link href={`/bookings/${booking.id}/itinerary`} className="flex-1">
                                    <Button variant="outline" className="w-full flex-1 border-purple-500 text-purple-600 font-semibold py-3">🗺️ यात्रा प्लान</Button>
                                </Link>
                                <Link href={`/bookings/${booking.id}/live-tracking`} className="flex-1">
                                    <Button className="w-full flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 shadow-md">📍 लाइव मोड</Button>
                                </Link>
                            </>
                        )}

                        {booking.status === "PANDIT_ARRIVED" && (
                            <>
                                <Link href={`/bookings/${booking.id}/live-tracking`} className="flex-1">
                                    <Button variant="outline" className="w-full border-blue-500 text-blue-600 font-semibold py-3">📍 लाइव मोड</Button>
                                </Link>
                                <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold flex items-center justify-center py-3" onClick={() => handleAction("start-puja")}>🙏 पूजा शुरू करें</Button>
                            </>
                        )}

                        {booking.status === "PUJA_IN_PROGRESS" && (
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-bold shadow-lg py-4" onClick={() => handleAction("complete")}>✅ पूजा पूरी हुई</Button>
                        )}

                        {booking.status === "COMPLETED" && (
                            <>
                                {booking.review && <Button variant="outline" className="flex-1 border-brand-500 text-brand-600 font-semibold py-3">⭐ रेटिंग देखें</Button>}
                                <Button className="flex-1 bg-green-600 text-white font-semibold py-3" onClick={() => router.push('/earnings')}>💰 भुगतान देखें</Button>
                            </>
                        )}
                    </div>

                    {/* Rating Bottom Sheet */}
                    {showRatingSheet && (
                        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-4 sm:p-0">
                            <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                                <div className="flex justify-between items-center mb-4 border-b pb-2 border-gray-100">
                                    <h2 className="text-xl font-bold font-sans text-brand-900">ग्राहक को रेटिंग दें</h2>
                                    <button onClick={() => setShowRatingSheet(false)} className="text-gray-400 hover:text-gray-700">✕</button>
                                </div>
                                <p className="text-sm text-gray-500 mb-6">आपके अनुभव के आधार पर ग्राहक (Customer) को रेट करें। यह रेटिंग केवल आपके और अन्य पंडितों के लिए है।</p>

                                <div className="space-y-4 mb-6">
                                    {(['punctuality', 'hospitality', 'foodArrangement'] as const).map((key) => (
                                        <div key={key} className="flex justify-between items-center">
                                            <span className="font-medium text-gray-700 w-1/2">
                                                {key === 'punctuality' ? 'समय की पाबंदी' : key === 'hospitality' ? 'आतिथ्य सत्कार' : 'भोजन व्यवस्था'}
                                            </span>
                                            <div className="flex gap-1 w-1/2 justify-end">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setRatingData(prev => ({ ...prev, [key]: star }))}
                                                        className={`text-2xl ${ratingData[key] >= star ? 'text-amber-400' : 'text-gray-200'}`}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">टिप्पणी (कमेंट) - वैकल्पिक</label>
                                        <textarea
                                            value={ratingData.comment}
                                            onChange={(e) => setRatingData(prev => ({ ...prev, comment: e.target.value }))}
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-amber-500 focus:border-amber-500"
                                            rows={3}
                                            placeholder="अपना अनुभव बताएं (हिंदी में लिखें)..."
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 py-3 text-gray-600 border-gray-300"
                                        onClick={() => setShowRatingSheet(false)}
                                    >
                                        छोड़ें (Skip)
                                    </Button>
                                    <Button
                                        className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white"
                                        onClick={submitRating}
                                        disabled={submittingRating}
                                    >
                                        {submittingRating ? 'सबमिट हो रहा है...' : 'सबमिट करें'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }
