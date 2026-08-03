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
                        // TRACK 2A KILL-LIST 4/4 — the same defect, second
                        // commodity. A zero samagri price is as invented as a
                        // zero dakshina: it says "this costs nothing" where the
                        // truth is "he has not priced it".
                        const samagriStartPrice: number | null = relevantSamagri.length > 0
                            ? Math.min(...relevantSamagri.map(p => (p.fixedPrice ?? p.price)))
                            : null;

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

                                        {/* Samagri, three honest states (S4, ruled 2026-08-03).
                                            THE DEFAULT NEVER SPEAKS: supplyMode's schema default
                                            is PANDIT_BRINGS, so that value alone proves nothing —
                                            only priced tiers give it a voice. LIST_ONLY is always
                                            an ANSWER (never a default), so it speaks the ruled
                                            copy. Everything else stays the honest absence. */}
                                        {service.supplyMode === "LIST_ONLY" ? (
                                            <div className="mt-2 pt-2 border-t border-gray-200 text-gray-700 font-medium">
                                                Yajman arranges the samagri — Pandit ji shares the list
                                            </div>
                                        ) : (
                                            <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                                                <div className="text-gray-700 font-medium">
                                                    Samagri: {samagriStartPrice !== null ? `₹${samagriStartPrice.toLocaleString("en-IN")}+` : "Not priced yet"}
                                                </div>
                                                <button
                                                    onClick={() => handleOpenSamagri(service.pujaType)}
                                                    className="text-orange-600 font-bold hover:underline text-xs flex items-center"
                                                >
                                                    [View & Choose →]
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* सत्यापन INFORMS, IT DOES NOT BLOCK (Isj ruling,
                                    2026-07-29). This CTA was disabled for an unverified puja.
                                    That took the choice away from the person whose money it is —
                                    and it shut the shop: six of six combinations were unbookable
                                    because no pandit had completed a verification.
                                    The badge above still says which pujas ops have watched. The
                                    customer decides. */}
                                {/* THE VIDEO RENDERS ONLY AFTER REVIEW (Isj's सही,
                                    2026-08-03 — superseding "listenable in both states").
                                    Three honest states, bookable in all three: APPROVED —
                                    the player renders; PENDING — named, no player;
                                    NONE/REJECTED — silence about video, the pooja stands
                                    on its own. sampleViewable is approved-gated upstream
                                    (sampleFor), so the link below can only ever hold a
                                    reviewed video. */}
                                {service.sampleViewable ? (
                                    <a
                                        href={`https://www.youtube.com/watch?v=${service.sampleVideoId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mb-3 flex items-center gap-2 text-sm font-bold text-orange-700 hover:underline"
                                    >
                                        ▶ Hear him perform this puja
                                    </a>
                                ) : service.videoStatus === "PENDING" ? (
                                    <p className="mb-3 text-xs text-gray-600 leading-snug bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                        Video under review — you can still book.
                                    </p>
                                ) : null}
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
