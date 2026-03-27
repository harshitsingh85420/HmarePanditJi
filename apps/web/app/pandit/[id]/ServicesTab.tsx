"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SamagriModal } from "../../../components/SamagriModal";
import { LoginModal } from "@/components/LoginModal";

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
    const token = typeof window !== &quot;undefined&quot; ? localStorage.getItem(&quot;token&quot;) : null;
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState(&quot;&quot;);

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
                            ? Math.min(...relevantSamagri.map(p => p.fixedPrice))
                            : 0;

                        return (
                            <div key={service.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition bg-white flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            💍 {service.pujaType}
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
                                                Samagri: {samagriStartPrice > 0 ? `₹${samagriStartPrice}+` : &quot;Platform / Pandit&quot;}
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
