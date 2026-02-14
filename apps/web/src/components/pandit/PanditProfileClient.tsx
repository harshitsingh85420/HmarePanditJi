"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TravelModeModal } from "../booking/TravelModeModal";
import { useRouter } from "next/navigation";

interface PanditProfileClientProps {
    panditId: string;
}

export function PanditProfileClient({ panditId }: PanditProfileClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("bio");
    const [samagriType, setSamagriType] = useState<"fixed" | "custom">("fixed");
    const [selectedPackage, setSelectedPackage] = useState("Standard");
    const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
    const [travelMode, setTravelMode] = useState("SELF-DRIVE");

    const packages = [
        {
            name: "Basic",
            price: 1200,
            features: [
                "Essential Flowers & Bel-patra",
                "Roli, Akshat, Chandan",
                "Basic Diya & Bati",
            ],
        },
        {
            name: "Standard",
            price: 2500,
            isPopular: true,
            features: [
                "Everything in Basic",
                "Fruits (5 types)",
                "Gangajal & Honey (Pure)",
                "Havan Samagri (500g)",
            ],
        },
        {
            name: "Premium",
            price: 5000,
            features: [
                "Everything in Standard",
                "Pure Ghee (1kg)",
                "Brass Puja Thali Gift",
                "Complete Havan Setup",
            ],
        },
    ];

    const handleTravelConfirm = (mode: string) => {
        setTravelMode(mode);
        setIsTravelModalOpen(false);
    };

    const getSamagriPrice = () => {
        if (samagriType === "custom") return 1214; // Mock custom price from design
        const pkg = packages.find((p) => p.name === selectedPackage);
        return pkg ? pkg.price : 0;
    };

    const dakshina = 5100;
    const foodAllowance = 500;
    const travelCost = travelMode === "SELF-DRIVE" ? 348 : 1200; // Mock logic
    const samagriPrice = getSamagriPrice();
    const total = dakshina + foodAllowance + travelCost + samagriPrice;

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Section: Profile Content */}
            <div className="flex-1 space-y-8">
                {/* Hero Component */}
                <section className="bg-white dark:bg-[#1c2127] rounded-xl p-6 shadow-sm border border-[#f49d25]/10">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl min-h-[160px] w-[160px] border-4 border-[#f49d25]/20 shadow-lg"
                            style={{
                                backgroundImage:
                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCNu3SH90jgVaepDm06CTi_DCGhnZ8B3f2AUpGv9LgsapxieZLg5B1j50sI8tUSKD7elbyCtVyQCRjsAZO8C5g_azx-GNH2tId2m9RnYOIoezZ3YvRDS9SGbWtcNVa4pVF7jsgj-wNM1rsd8uL7DWICQlufhDQtPC9ubNimNSNsTCxGAA6RCWHGIN7Q_Sx-tKcB7QuOJIfny9h6nMaQfrX1ow1awsGVx_GHjP9dpOdDJ6R9ekwjDYdnPRgk77-iPJbhkgbaLRfI0io")',
                            }}
                        ></div>
                        <div className="flex flex-col flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-[#181511] dark:text-white text-3xl font-bold leading-tight">
                                        Pandit Sharma Ji
                                    </h1>
                                    <p className="text-[#f49d25] font-semibold text-lg">
                                        Expert in Vedic Rituals & Vivah Sanskar
                                    </p>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f49d25]/10 text-[#f49d25] border border-[#f49d25]/20 hover:bg-[#f49d25]/20 transition-all">
                                    <span className="material-symbols-outlined">play_circle</span>
                                    <span className="font-bold text-sm">Watch Intro</span>
                                </button>
                            </div>
                            <p className="text-[#8a7960] dark:text-[#b0a08a] mt-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">
                                    location_on
                                </span>
                                Varanasi, UP | 15+ Years Experience | 500+ Ceremonies
                            </p>
                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1 text-[#f49d25]">
                                        <span className="material-symbols-outlined text-lg fill-1">
                                            star
                                        </span>
                                        <span className="text-xl font-bold">4.9</span>
                                    </div>
                                    <span className="text-[#8a7960] text-xs">128 Reviews</span>
                                </div>
                                <div className="h-8 w-px bg-[#f49d25]/20"></div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-[#181511] dark:text-white">
                                        500+
                                    </span>
                                    <span className="text-[#8a7960] text-xs">Ceremonies</span>
                                </div>
                                <div className="h-8 w-px bg-[#f49d25]/20"></div>
                                <div className="flex flex-col items-center">
                                    <span className="material-symbols-outlined text-green-600">
                                        verified
                                    </span>
                                    <span className="text-[#8a7960] text-xs">Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tabs Menu */}
                <div className="border-b border-[#f49d25]/10">
                    <div className="flex gap-8 overflow-x-auto no-scrollbar">
                        {["Bio & Experience", "Gallery", "Certificates", "Reviews"].map(
                            (tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase())}
                                    className={`pb-3 font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.toLowerCase()
                                            ? "border-[#f49d25] text-[#f49d25] font-bold"
                                            : "border-transparent text-[#8a7960] hover:text-[#f49d25]"
                                        }`}
                                >
                                    {tab}
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* Samagri Selection Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-[#181511] dark:text-white">
                            Choose Pūjā Samagri
                        </h2>
                        <span className="px-3 py-1 rounded-full bg-[#f49d25]/10 text-[#f49d25] text-xs font-bold uppercase tracking-wider">
                            Customizable
                        </span>
                    </div>
                    {/* Samagri Tabs */}
                    <div className="bg-[#f49d25]/5 p-1 rounded-lg flex w-fit">
                        <button
                            onClick={() => setSamagriType("fixed")}
                            className={`px-6 py-2 rounded-md font-bold shadow-sm transition-all ${samagriType === "fixed"
                                    ? "bg-white dark:bg-[#2d2116] text-[#f49d25]"
                                    : "text-[#8a7960] hover:text-[#f49d25]"
                                }`}
                        >
                            Pandit&apos;s Fixed Packages
                        </button>
                        <button
                            onClick={() => {
                                setSamagriType("custom");
                                // In a real app, this might navigate or open modal
                            }}
                            className={`px-6 py-2 rounded-md font-bold transition-all ${samagriType === "custom"
                                    ? "bg-white dark:bg-[#2d2116] text-[#f49d25] shadow-sm"
                                    : "text-[#8a7960] hover:text-[#f49d25]"
                                }`}
                        >
                            Build Custom List
                        </button>
                    </div>

                    {samagriType === "fixed" ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {packages.map((pkg) => {
                                const isSelected = selectedPackage === pkg.name;
                                return (
                                    <div
                                        key={pkg.name}
                                        className={`relative rounded-xl p-5 cursor-pointer transition-all ${isSelected
                                                ? "bg-white dark:bg-[#1c2127] border-2 border-[#f49d25] shadow-lg"
                                                : "bg-white dark:bg-[#1c2127] border border-[#f49d25]/10 hover:shadow-md"
                                            }`}
                                        onClick={() => setSelectedPackage(pkg.name)}
                                    >
                                        {pkg.isPopular && (
                                            <div className="absolute top-0 right-0 bg-[#f49d25] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                                                POPULAR
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                                {pkg.name}
                                            </h3>
                                            <span className="text-[#f49d25] font-bold">
                                                ₹{pkg.price.toLocaleString()}
                                            </span>
                                        </div>
                                        <ul className="space-y-2 text-sm text-[#8a7960] mb-6 min-h-[100px]">
                                            {pkg.features.map((feat, i) => (
                                                <li
                                                    key={i}
                                                    className="flex gap-2 items-center font-medium text-[#181511] dark:text-slate-300"
                                                >
                                                    <span className="material-symbols-outlined text-[#f49d25] text-sm">
                                                        check_circle
                                                    </span>{" "}
                                                    {feat}
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            className={`w-full py-2 rounded-lg font-bold transition-all ${isSelected
                                                    ? "bg-[#f49d25] text-white shadow-md"
                                                    : "border border-[#f49d25] text-[#f49d25] hover:bg-[#f49d25]/5"
                                                }`}
                                        >
                                            {isSelected ? "Selected" : "Select"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#1c2127] border border-[#f49d25]/10 rounded-xl p-6">
                            <h3 className="font-bold mb-4 text-[#181511] dark:text-white">
                                Custom List Comparison
                            </h3>
                            <p className="text-sm text-[#8a7960] mb-4">
                                You have selected a custom list of items.
                            </p>
                            <Link
                                href="/samagri/compare"
                                className="text-[#f49d25] font-bold hover:underline flex items-center gap-1"
                            >
                                Launch Comparison Tool <span className="material-symbols-outlined text-sm">open_in_new</span>
                            </Link>
                        </div>
                    )}
                </section>
            </div>

            {/* Right Section: Sticky Pricing Widget */}
            <aside className="w-full lg:w-[380px]">
                <div className="sticky top-24 space-y-4">
                    <div className="bg-white dark:bg-[#1c2127] rounded-2xl shadow-xl border border-[#f49d25]/20 overflow-hidden">
                        <div className="bg-[#f49d25] p-4 text-white">
                            <h3 className="font-bold text-lg flex items-center justify-between">
                                Booking Summary
                                <span className="material-symbols-outlined">receipt_long</span>
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="font-bold text-[#181511] dark:text-white">
                                        Dakshina
                                    </span>
                                    <span className="text-xs text-[#8a7960]">
                                        Ritual service fee
                                    </span>
                                </div>
                                <span className="text-xl font-bold dark:text-white">
                                    ₹{dakshina.toLocaleString()}
                                </span>
                            </div>

                            {/* Travel Section */}
                            <div className="space-y-3 p-4 bg-[#f8f7f5] dark:bg-[#2d2116] rounded-xl border border-[#f49d25]/10">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-[#181511] dark:text-white">
                                            Travel: {travelMode}
                                        </span>
                                        <span className="text-xs text-[#8a7960]">
                                            12.4 km distance
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setIsTravelModalOpen(true)}
                                        className="text-[#f49d25] text-xs font-bold underline"
                                    >
                                        Change
                                    </button>
                                </div>
                                <div className="space-y-1 pt-2 border-t border-[#f49d25]/5">
                                    <div className="flex justify-between font-bold text-sm mt-1 text-slate-800 dark:text-slate-200">
                                        <span>Travel Subtotal</span>
                                        <span>₹{travelCost}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Food Allowance */}
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-[#181511] dark:text-white">
                                        Food Allowance
                                    </span>
                                    <span className="text-xs text-[#8a7960]">
                                        Hygienic Sattvik meal
                                    </span>
                                </div>
                                <span className="font-bold text-sm dark:text-white">
                                    ₹{foodAllowance}
                                </span>
                            </div>

                            {/* Samagri */}
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-[#181511] dark:text-white">
                                        Samagri: {samagriType === 'fixed' ? selectedPackage : 'Custom'}
                                    </span>
                                </div>
                                <span className="font-bold text-sm dark:text-white">
                                    ₹{samagriPrice.toLocaleString()}
                                </span>
                            </div>

                            <div className="pt-4 border-t-2 border-dashed border-[#f49d25]/20">
                                <div className="flex justify-between items-end mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold uppercase text-[#8a7960]">
                                            Grand Total
                                        </span>
                                        <span className="text-xs text-[#f49d25]">
                                            GST (18%) included
                                        </span>
                                    </div>
                                    <span className="text-3xl font-black text-[#f49d25]">
                                        ₹{total.toLocaleString()}
                                    </span>
                                </div>
                                <button
                                    onClick={() => router.push('/booking/new')}
                                    className="w-full bg-[#f49d25] hover:bg-[#f49d25]/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-[#f49d25]/20 transition-all flex items-center justify-center gap-2"
                                >
                                    Proceed to Booking
                                    <span className="material-symbols-outlined">
                                        arrow_forward
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#f49d25]/5 border border-[#f49d25]/10 rounded-xl p-4 flex gap-4 items-center">
                        <span className="material-symbols-outlined text-[#f49d25] text-3xl">
                            verified_user
                        </span>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                                HmarePanditJi Guarantee
                            </span>
                            <span className="text-xs text-[#8a7960]">
                                100% Refund if Pandit doesn't arrive on time.
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            <TravelModeModal
                isOpen={isTravelModalOpen}
                onClose={() => setIsTravelModalOpen(false)}
                onConfirm={handleTravelConfirm}
                panditName="Pandit Sharma Ji"
            />
        </div>
    );
}
