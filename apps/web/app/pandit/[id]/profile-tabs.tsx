"use client";

import { useState } from "react";
import { Tabs } from "@hmarepanditji/ui";

/* F-J4-5 — the TRAVEL OPTIONS tab is gone with the fabricated quote it
   existed to display. Travel is cut from v1; the tab is not repointed at a
   live endpoint to serve a cut feature. See page.tsx for the full record. */
export function ProfileTabs({
    aboutContent,
    servicesContent,
    reviewsContent,
    availabilityContent
}: {
    aboutContent: React.ReactNode;
    servicesContent: React.ReactNode;
    reviewsContent: React.ReactNode;
    availabilityContent: React.ReactNode;
}) {
    const [activeTab, setActiveTab] = useState("about");

    const tabs = [
        { key: "about", label: "ABOUT" },
        { key: "services", label: "SERVICES & PRICING" },
        { key: "reviews", label: "REVIEWS" },
        { key: "availability", label: "AVAILABILITY" }
    ];

    return (
        <>
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            <div className="mt-8 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                {activeTab === "about" && aboutContent}
                {activeTab === "services" && servicesContent}
                {activeTab === "reviews" && reviewsContent}
                {activeTab === "availability" && availabilityContent}
            </div>
        </>
    );
}
