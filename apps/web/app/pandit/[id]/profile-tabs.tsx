"use client";

import { useState } from "react";
import { Tabs } from "@hmarepanditji/ui";

export function ProfileTabs({
    aboutContent,
    servicesContent,
    travelContent,
    reviewsContent,
    availabilityContent
}: {
    aboutContent: React.ReactNode;
    servicesContent: React.ReactNode;
    travelContent: React.ReactNode;
    reviewsContent: React.ReactNode;
    availabilityContent: React.ReactNode;
}) {
    const [activeTab, setActiveTab] = useState("about");

    const tabs = [
        { key: "about", label: "ABOUT" },
        { key: "services", label: "SERVICES & PRICING" },
        { key: "travel", label: "TRAVEL OPTIONS" },
        { key: "reviews", label: "REVIEWS" },
        { key: "availability", label: "AVAILABILITY" }
    ];

    return (
        <>
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            <div className="mt-8 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                {activeTab === "about" && aboutContent}
                {activeTab === "services" && servicesContent}
                {activeTab === "travel" && travelContent}
                {activeTab === "reviews" && reviewsContent}
                {activeTab === "availability" && availabilityContent}
            </div>
        </>
    );
}
