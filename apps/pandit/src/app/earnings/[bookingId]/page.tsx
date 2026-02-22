"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
// removed auth
import { Loader2, ArrowLeft } from "lucide-react";
import PostPujaBreakdown from "../components/PostPujaBreakdown";

export default function BookingEarningsPage() {
    const { bookingId } = useParams();
    const router = useRouter();
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchBreakdown();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookingId]);

    const fetchBreakdown = async () => {
        try {
            setLoading(true);
            if (!token) return;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/pandits/earnings/${bookingId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const result = await res.json();

            if (result.success) {
                setData(result.data);
            } else {
                setError(result.message || "Failed to load breakdown");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto p-4 md:p-6 mt-8">
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                    <p>{error}</p>
                </div>
                <button onClick={() => router.back()} className="mt-4 text-amber-600 font-medium hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> वापस जाएँ
                </button>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20 fade-in animate-in slide-in-from-bottom-4 duration-500">
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                कमाई की सूची पर लौटें
            </button>

            <PostPujaBreakdown data={data} />
        </div>
    );
}
