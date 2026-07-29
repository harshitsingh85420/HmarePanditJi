"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SamagriModal } from "../../../components/SamagriModal";
import { LoginModal } from "../../../src/components/LoginModal";
import { CUSTOMER_TOKEN_KEY } from "@hmarepanditji/utils";

export function ServicesTab({
    panditId,
    pujaServices,
    samagriPackages,
}: {
    panditId: string;
    pujaServices: any[];
    samagriPackages: any[];
}) {
    const [isSamagriModalOpen, setIsSamagriModalOpen] = useState(false);
    const [selectedPujaService, setSelectedPujaService] = useState<string | null>(null);
    const router = useRouter();
    const token = typeof window !== "undefined" ? localStorage.getItem(CUSTOMER_TOKEN_KEY) : null;
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState("");

    const handleOpenSamagri = (pujaType: string) => {
        setSelectedPujaService(pujaType);
        setIsSamagriModalOpen(true);
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Services & Pricing</h3>
            <div className="grid md:grid-cols-2 gap-6">
                {pujaServices?.length > 0 ? (
                    pujaServices.map((service: any) => {
                        // Find matching samagri packages for this pujaType
                        const relevantSamagri = samagriPackages?.filter(
                            (pkg) => pkg.pujaType === service.pujaType
                        ) || [];
                        const samagriStartPrice = relevantSamagri.length > 0
                            ? Math.min(...relevantSamagri.map(p => (p.fixedPrice ?? p.price)))
                            : 0;

                        return (
                            <div key={service.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition bg-white flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            💍 {service.pujaType}
                                            {/* PAGE 16: identity ✓ and पूजा ✓ must read DIFFERENTLY and never
                                                collapse into one tick. The pandit-level VERIFIED badge is
                                                IDENTITY. This one is the per-puja video सत्यापन — the thing
                                                booking.service.ts:116-125 actually gates on. Naming which
                                                verification is the whole point. */}
                                            {service.poojaVerified ? (
                                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    पूजा सत्यापित
                                                </span>
                                            ) : (
                                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                                    पूजा सत्यापन बाकी
                                                </span>
                                            )}
                                        </h4>
                                        <span className="bg-green-50 text-green-700 font-bold px-3 py-1 rounded-full text-sm border border-green-200">
                                            ₹{service.dakshinaAmount}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                        {service.description || `Complete ${service.pujaType} ceremony with full vedic rituals.`}
                                    </p>
                                    <div className="flex flex-col gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl mb-6 border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            ⏱️ Duration: <span className="font-medium text-gray-900">~{service.durationHours} hours</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            ⓘ Standard charges applied (+ samagri + travel if applicable)
                                        </div>

                                        {/* Samagri integration view */}
                                        <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                                            <div className="text-gray-700 font-medium">
                                                Samagri: {samagriStartPrice > 0 ? `₹${samagriStartPrice}+` : "Platform / Pandit"}
                                            </div>
                                            <button
                                                onClick={() => handleOpenSamagri(service.pujaType)}
                                                className="text-orange-600 font-bold hover:underline text-xs flex items-center"
                                            >
                                                [View & Choose →]
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* THE REFUSAL MOVED TO THE FRONT. The server gate is correct and
                                    unchanged — an unverified puja is not bookable. What was wrong was
                                    WHERE the customer met it: after a 7-step wizard with 9 required
                                    fields, as a 400. A control that starts a journey it cannot finish
                                    is a dead control. Disabled here, with the reason in plain words. */}
                                {service.poojaVerified ? (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const url = `/booking/new?panditId=${panditId}&pujaType=${encodeURIComponent(service.pujaType)}`;
                                            if (!token) {
                                                setRedirectUrl(url);
                                                setLoginModalOpen(true);
                                            } else {
                                                router.push(url);
                                            }
                                        }}
                                        className="w-full block text-center py-3 bg-white border-2 border-orange-600 text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition"
                                    >
                                        Book This Puja →
                                    </button>
                                ) : (
                                    <div>
                                        <button
                                            disabled
                                            aria-disabled="true"
                                            className="w-full block text-center py-3 bg-gray-100 border-2 border-gray-200 text-gray-400 font-bold rounded-xl cursor-not-allowed"
                                        >
                                            अभी बुक नहीं कर सकते
                                        </button>
                                        <p className="mt-2 text-xs text-gray-500 text-center leading-snug">
                                            पंडित जी ने इस पूजा का वीडियो सत्यापन अभी पूरा नहीं किया है।
                                            उनकी पहचान सत्यापित है — यह अलग है।
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p className="text-gray-500 py-8 col-span-2 text-center">No services listed yet.</p>
                )}
            </div>

            {selectedPujaService && (
                <SamagriModal
                    isOpen={isSamagriModalOpen}
                    onClose={() => setIsSamagriModalOpen(false)}
                    panditId={panditId}
                    pujaType={selectedPujaService}
                    packages={samagriPackages?.filter(pkg => pkg.pujaType === selectedPujaService) || []}
                />
            )}

            {loginModalOpen && (
                <LoginModal
                    isOpen={loginModalOpen}
                    onClose={() => setLoginModalOpen(false)}
                    redirectAfterLogin={redirectUrl}
                />
            )}
        </div>
    );
}
