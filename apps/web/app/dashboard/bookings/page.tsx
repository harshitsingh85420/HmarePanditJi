"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../src/context/auth-context";
import { Tabs } from "@hmarepanditji/ui";
import { BookingCard } from "../components/BookingCard";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export default function MyBookingsPage() {
    const { accessToken, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState("All");
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = useCallback(async (statusFilter: string) => {
        if (!accessToken) return;
        setLoading(true);
        try {
            let url = `${API_URL}/bookings/customer/my?page=1&limit=50`;
            if (statusFilter !== "All") {
                url += `&status=${statusFilter.toUpperCase()}`;
            }

            const res = await fetch(url, {
                headers: { "Authorization": `Bearer ${accessToken}` }
            });
            const data = await res.json();
            if (data.success) {
                setBookings(data.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        if (!authLoading) {
            if (!accessToken) {
                setLoading(false); // could redirect
            } else {
                fetchBookings(activeTab);
            }
        }
    }, [activeTab, fetchBookings, authLoading, accessToken]);

    const tabs = [
        { key: "All", label: "All" },
        { key: "Upcoming", label: "Upcoming" },
        { key: "Completed", label: "Completed" },
        { key: "Cancelled", label: "Cancelled" },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 w-full text-center md:text-left">My Bookings</h1>

            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            <div className="mt-6 flex flex-col gap-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-500 animate-pulse">Loading bookings...</div>
                ) : bookings.length > 0 ? (
                    bookings.map((b: any) => <BookingCard key={b.id} booking={b} />)
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-100 flex flex-col items-center">
                        <div className="text-5xl mb-4">🪔</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">अभी तक कोई बुकिंग नहीं है</h3>
                        <p className="text-gray-500 mb-6 max-w-sm">You haven&apos;t made any bookings yet.</p>
                        <Link href="/search" className="bg-orange-600 text-white px-8 py-3 rounded-full font-medium inline-block hover:bg-orange-700 transition">
                            Explore Pandits →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
