"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PanditCard, TravelMode } from "@hmarepanditji/ui";
import { useAuth } from "../context/auth-context";

export function FeaturedPanditsList({ pandits }: { pandits: any[] }) {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();

    const handleBook = (id: string, mode: TravelMode) => {
        if (loading) return;
        if (!isAuthenticated) {
            router.push("/login?next=" + encodeURIComponent(`/booking/new?panditId=${id}`));
        } else {
            router.push(`/booking/new?panditId=${id}`);
        }
    };

    const handleViewProfile = (id: string) => {
        router.push(`/pandit/${id}`);
    };

    if (!pandits || pandits.length === 0) {
        return <p className="text-center text-gray-500 col-span-3">More pandits arriving soon.</p>;
    }

    return (
        <>
            {pandits.map((pandit: any) => (
                <PanditCard
                    key={pandit.id}
                    id={pandit.id}
                    name={pandit.displayName || pandit.user?.name || "Pandit Ji"}
                    avatarUrl={pandit.profilePhotoUrl || pandit.user?.avatarUrl}
                    rating={pandit.averageRating || 5}
                    totalReviews={pandit.totalReviews || 0}
                    specializations={pandit.pujaServices?.slice(0, 3).map((s: any) => s.pujaType) || []}
                    location={`${pandit.city}${pandit.state ? `, ${pandit.state}` : ""}`}
                    isVerified={pandit.isVerified}
                    onBook={handleBook}
                    onViewProfile={handleViewProfile}
                    className="shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                />
            ))}
        </>
    );
}
