"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Card } from "@hmarepanditji/ui";
import { AlertTriangle, ArrowLeft, XCircle } from "lucide-react";
import Link from "next/link";

interface BookingInfo {
    id: string;
    bookingNumber: string;
    eventType: string;
    eventDate: string;
    grandTotal: number;
    platformFee: number;
    panditName: string;
}

export default function CancellationRequestPage() {
    const router = useRouter();
    const params = useParams();
    const bookingId = params.bookingId as string;

    const [booking, setBooking] = useState<BookingInfo | null>(null);
    const [reason, setReason] = useState("");
    const [otherReason, setOtherReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/bookings/${bookingId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Failed to load booking");
                const data = await res.json();

                if (data.data && data.data.booking) {
                    const b = data.data.booking;
                    setBooking({
                        id: b.id,
                        bookingNumber: b.bookingNumber,
                        eventType: b.eventType,
                        eventDate: b.eventDate,
                        grandTotal: b.grandTotal,
                        platformFee: b.platformFee,
                        panditName: b.pandit?.name || "Pandit Ji"
                    });
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchBooking();
    }, [bookingId]);

    const calculateRefund = () => {
        if (!booking) return { days: 0, percent: 0, refundableAmount: 0, estimate: 0 };

        // Platform fee is non-refundable 
        const refundableAmount = booking.grandTotal - booking.platformFee;

        const eventTime = new Date(booking.eventDate).getTime();
        const now = Date.now();
        const daysUntilEvent = Math.max(0, Math.ceil((eventTime - now) / (1000 * 60 * 60 * 24)));

        let percent = 0;
        if (daysUntilEvent > 7) percent = 100;
        else if (daysUntilEvent >= 3) percent = 50;
        else percent = 0;

        const estimate = Math.floor(refundableAmount * (percent / 100));

        return { days: daysUntilEvent, percent, refundableAmount, estimate };
    };

    const refundData = calculateRefund();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!reason) {
            setError("Please select a reason for cancellation");
            return;
        }

        const finalReason = reason === "Other" ? otherReason : reason;
        if (reason === "Other" && !finalReason.trim()) {
            setError("Please specify your reason");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/bookings/${bookingId}/cancel-request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ reason: finalReason }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to submit cancellation");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push(`/dashboard/bookings/${bookingId}`);
            }, 3000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 max-w-lg mx-auto">
                <div className="bg-amber-100 text-amber-700 p-4 rounded-full mb-4">
                    <AlertTriangle className="w-12 h-12" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Cancellation request submitted</h1>
                <p className="text-gray-600 mb-6">Our team will review and process your refund within 24 hours.</p>
                <div className="animate-pulse flex space-x-2 items-center text-sm text-gray-500">
                    <span>Redirecting back to booking...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto py-8 px-4">
            <Link href={`/dashboard/bookings/${bookingId}`} className="inline-flex items-center text-gray-600 hover:text-black mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
            </Link>

            <div className="border border-red-200 bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-4 mb-6">
                <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                    <h2 className="font-bold text-lg">Are you sure you want to cancel this booking?</h2>
                    <p className="text-sm mt-1 opacity-90">This action cannot be fully undone. Please check the refund policy below.</p>
                </div>
            </div>

            {booking && (
                <Card className="p-6 mb-6">
                    <h3 className="font-bold border-b pb-3 mb-4 text-gray-800">Booking Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500 text-xs">Booking ID</p>
                            <p className="font-semibold">{booking.bookingNumber}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">Event</p>
                            <p className="font-semibold">{booking.eventType}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">Date</p>
                            <p className="font-semibold">{new Date(booking.eventDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">Pandit</p>
                            <p className="font-semibold">{booking.panditName}</p>
                        </div>
                    </div>
                </Card>
            )}

            {booking && (
                <Card className="p-6 mb-6">
                    <h3 className="font-bold pb-2 text-gray-800">Refund Estimate</h3>
                    <p className="text-sm text-gray-600 mb-4 border-b pb-4">
                        Days until event: <strong className="text-black">{refundData.days}</strong>
                        <br />
                        Policy: {refundData.days > 7 ? "> 7 days → 100% refund" : refundData.days >= 3 ? "3-7 days → 50% refund" : "< 3 days → No refund"}
                    </p>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Grand Total Paid:</span>
                            <span>₹{booking.grandTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Platform Fee (non-refundable):</span>
                            <span className="text-red-500">-₹{booking.platformFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Refundable Amount:</span>
                            <span>₹{refundData.refundableAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                            <span className="text-gray-600">Refund Percentage:</span>
                            <span>{refundData.percent}%</span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg text-green-700">
                            <span>Estimated Refund:</span>
                            <span>₹{refundData.estimate.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg">
                        Note: Refund will be credited within 5-7 business days after approval.
                    </div>
                </Card>
            )}

            <Card className="p-6">
                <form onSubmit={handleSubmit}>
                    <h3 className="font-bold mb-4 text-gray-800">Reason for Cancellation <span className="text-red-500">*</span></h3>

                    <div className="space-y-3 mb-6">
                        {["Date/time change needed", "Found a different pandit", "Personal/family reasons", "Financial reasons", "Event postponed", "Other"].map(option => (
                            <label key={option} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="reason"
                                    value={option}
                                    checked={reason === option}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-700">{option}</span>
                            </label>
                        ))}
                    </div>

                    {reason === "Other" && (
                        <div className="mb-6">
                            <textarea
                                placeholder="Please specify..."
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                value={otherReason}
                                onChange={(e) => setOtherReason(e.target.value)}
                            />
                        </div>
                    )}

                    {error && <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg mb-4">{error}</div>}

                    <Button type="submit" disabled={isLoading} variant="danger" className="w-full py-3 text-base flex items-center justify-center gap-2">
                        <XCircle className="w-5 h-5" />
                        {isLoading ? "Processing..." : "Confirm Cancellation"}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
