"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../src/context/auth-context";
import { Button } from "@hmarepanditji/ui";
import { CheckCircle2, Copy, Share2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Header } from "@hmarepanditji/ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export default function BookingConfirmedPage() {
    const params = useParams();
    const { accessToken } = useAuth();

    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchBooking = useCallback(async () => {
        if (!accessToken) return;
        try {
            const res = await fetch(`${API_URL}/bookings/${params.bookingId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const data = await res.json();
            if (data.success) {
                setBooking(data.data.booking);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [params.bookingId, accessToken]);

    useEffect(() => {
        if (accessToken) fetchBooking();
    }, [fetchBooking, accessToken]);

    const copyDetails = () => {
        if (!booking) return;
        const txt = `🙏 Puja booked via HmarePanditJi!\nBooking ID: ${booking.bookingNumber}\nEvent: ${booking.eventType}\nDate: ${new Date(booking.eventDate).toLocaleDateString("hi-IN")}\nPandit: Pt. ${booking.pandit?.name || 'TBA'}`;
        navigator.clipboard.writeText(txt);
        alert("Copied to clipboard!");
    };

    const shareWhatsApp = () => {
        if (!booking) return;
        const txt = encodeURIComponent(`🙏 Puja booked via HmarePanditJi!\n\nEvent: ${booking.eventType} on ${new Date(booking.eventDate).toLocaleDateString("hi-IN")}\nPandit: Pt. ${booking.pandit?.name || "TBA"} (Verified)\nBooking: ${booking.bookingNumber}\n\nTrack booking: https://hmarepanditji.com`);
        window.open(`https://wa.me/?text=${txt}`, "_blank");
    };

    if (loading) return <div className="min-h-screen pt-32 text-center">Loading booking confirmation...</div>;
    if (!booking) return <div className="min-h-screen pt-32 text-center text-red-500">Booking not found.</div>;

    const d = new Date(booking.eventDate);
    const formattedDate = d.toLocaleDateString("hi-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header appType="web" />

            <main className="flex-1 flex items-center justify-center p-4 py-12 mt-16 relative">
                {/* Background confetti emulation */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center opacity-40">
                    <div className="w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-200 via-white to-transparent blur-3xl rounded-full absolute -top-40"></div>
                    <div className="w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-200 via-transparent to-transparent blur-3xl rounded-full absolute -bottom-20 -left-20"></div>
                    <div className="w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-200 via-transparent to-transparent blur-3xl rounded-full absolute top-1/2 -right-20"></div>
                </div>

                <div className="max-w-2xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden relative z-10 border border-gray-100/50">
                    {/* Header Block */}
                    <div className="bg-gradient-to-b from-green-500 to-green-600 text-white p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl mix-blend-overlay transform -translate-x-1/2 translate-y-1/2"></div>
                        <CheckCircle2 size={72} className="mx-auto text-white drop-shadow-md mb-4" />
                        <h1 className="text-4xl font-black mb-2 tracking-tight drop-shadow-sm">🙏 बुकिंग सफल!</h1>
                        <p className="text-green-50 font-medium text-lg tracking-wide opacity-90">Booking Successful</p>
                    </div>

                    <div className="p-6 md:p-10">
                        {/* Booking Card */}
                        <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 mb-8 shadow-sm">
                            <div className="flex justify-between items-start border-b border-orange-200/50 pb-4 mb-4">
                                <div>
                                    <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">Booking ID</p>
                                    <p className="text-2xl font-black text-orange-900 tracking-tight">{booking.bookingNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">Amount Paid</p>
                                    <p className="text-2xl font-black text-gray-900">₹{booking.grandTotal?.toLocaleString("en-IN")}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Event</p>
                                    <p className="font-bold text-gray-900 text-lg">{booking.eventType}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Date</p>
                                    <p className="font-bold text-gray-900">{formattedDate}</p>
                                </div>
                                <div className="md:col-span-2 flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white rounded-full border-2 border-orange-200 flex items-center justify-center font-bold text-orange-600 text-lg shadow-sm">
                                        {booking.pandit?.name?.charAt(0) || "P"}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium leading-tight">Assigned Pandit</p>
                                        <p className="font-bold text-gray-900">Pt. {booking.pandit?.name || "Pending Assignment"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What Happens Next */}
                        <h3 className="text-lg font-bold text-gray-900 mb-4 px-2">What Happens Next</h3>
                        <div className="space-y-4 px-2 mb-10">
                            <div className="flex gap-4">
                                <div className="mt-1"><CheckCircle2 size={20} className="text-green-500" /></div>
                                <div>
                                    <p className="font-bold text-gray-900">Payment Received</p>
                                    <p className="text-sm text-gray-500">Your payment has been successfully processed.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1 opacity-40">⏳</div>
                                <div>
                                    <p className="font-bold text-gray-900">Pandit Confirmation</p>
                                    <p className="text-sm text-gray-500">The assigned pandit will confirm the booking within 6 hours.</p>
                                </div>
                            </div>
                            {booking.travelRequired && (
                                <div className="flex gap-4">
                                    <div className="mt-1 opacity-40">⏳</div>
                                    <div>
                                        <p className="font-bold text-gray-900">Travel Arrangement</p>
                                        <p className="text-sm text-gray-500">Our team will book relevant travel tickets and update the dashboard.</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-4">
                                <div className="mt-1 opacity-40">⏳</div>
                                <div>
                                    <p className="font-bold text-gray-900">Track Journey</p>
                                    <p className="text-sm text-gray-500">You can track the pandit's real-time location on the day of the event.</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onClick={shareWhatsApp} className="flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#128C7E] font-bold py-4 rounded-xl hover:bg-[#25D366]/20 transition-colors border border-[#25D366]/20 shadow-sm">
                                <Share2 size={18} /> Share on WhatsApp
                            </button>
                            <button onClick={copyDetails} className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm">
                                <Copy size={18} /> Copy Details
                            </button>

                            <Link href={`/dashboard/bookings/${booking.id}`} className="md:col-span-2 flex items-center justify-center gap-2 bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-600/30 transition-all">
                                View Dashboard <ArrowRight size={18} />
                            </Link>
                        </div>

                        <div className="text-center mt-6">
                            <p className="text-xs text-gray-400 font-medium">SMS confirmation has been sent to your mobile number.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
