"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginModal } from "../../../src/components/LoginModal";

interface BookingCTAProps {
    panditId: string;
    lowestPrice: number;
    isMobile?: boolean;
}

export function BookingCTA({ panditId, lowestPrice, isMobile }: BookingCTAProps) {
    const router = useRouter();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const redirectUrl = `/booking/new?panditId=${panditId}`;

    const handleBookClick = () => {
        if (!token) {
            setLoginModalOpen(true);
        } else {
            router.push(redirectUrl);
        }
    };

    return (
        <>
            {isMobile ? (
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Starting from</p>
                        <p className="text-xl font-bold text-gray-900">₹{lowestPrice}</p>
                    </div>
                    <button
                        onClick={handleBookClick}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md"
                    >
                        Book Now
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Starting from</p>
                        <p className="text-2xl font-bold text-gray-900">₹{lowestPrice}</p>
                    </div>
                    <button
                        onClick={handleBookClick}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-orange-500/30 transition transform hover:-translate-y-0.5"
                    >
                        Check Availability & Book
                    </button>
                </div>
            )}

            {loginModalOpen && (
                <LoginModal
                    isOpen={loginModalOpen}
                    onClose={() => setLoginModalOpen(false)}
                    redirectAfterLogin={redirectUrl}
                />
            )}
        </>
    );
}
