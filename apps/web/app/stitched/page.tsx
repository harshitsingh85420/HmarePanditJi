import React from "react";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
    title: "Stitched Screens Library - HmarePanditJi",
};

const screens = [
    "24_7_support_&_helpline_chat",
    "admin_helpline_agent_dashboard",
    "admin_operations_overview",
    "admin_payout_reconciliation_dashboard",
    "admin_travel_operations_center",
    "b2b_bulk_booking_dashboard",
    "b2b_corporate_gst_invoice",
    "booking_request_alert",
    "booking_summary_&_add-ons",
    "cancellation_&_liability_policy",
    "customer_home_dashboard",
    "customer_live_pandit_tracking",
    "customer_post-booking_dashboard",
    "customer_profile_&_settings",
    "detailed_booking_request_(pandit)",
    "digital_muhurat_patrika_certificate",
    "earnings_detail_breakdown",
    "emergency_backup_trigger_flow",
    "family_gotra_&_lineage_setup",
    "guest-to-user_transition_flow",
    "hmarepanditji_landing_page",
    "muhurat_explorer_calendar",
    "nirmalya_visarjan_eco-flow",
    "nri_&_international_booking_flow",
    "nri_4k_live-streaming_ritual_view",
    "pandit_blackout_dates_management",
    "pandit_earnings_&_wallet",
    "pandit_growth_&_badges",
    "pandit_home_dashboard",
    "pandit_inventory_&_surge_alerts",
    "pandit_live_journey_tracking",
    "pandit_multi-modal_itinerary_view",
    "pandit_package_editor",
    "pandit_post-puja_earnings_breakdown",
    "pandit_profile_&_samagri_selection",
    "pandit_samagri_management",
    "pandit_search_results_&_filters",
    "pandit_verification_&_vetting_queue",
    "pandit_verification_detail",
    "pandit_video_kyc_&_verification",
    "pandit_work_calendar",
    "puja_completion_&_digital_blessings",
    "regional_ritual_variation_toggle",
    "samagri_custom_comparison",
    "samagri_dual-path_comparison_detail",
    "screens_documentation.md_4",
    "screens_documentation.md_5",
    "screens_documentation.md_6",
    "search_all_india_toggle_view",
    "secure_payment_interface",
    "travel_itinerary_&_roadmap",
    "travel_mode_selection_modal",
    "travel_preferences_matrix",
    "user_registration_&_setup",
    "voice-first_profile_setup",
    "voice_search_interface",
    "wedding_planner_b2b_dashboard"
];

function formatName(name: string) {
    return name
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
}

export default function StitchedScreensPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
                        Stitched Screens Library
                    </h1>
                    <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto">
                        A complete visual directory of all precisely generated screens for the HmarePanditJi platform (Customer Web, Pandit App, and Admin Panel). Click any card to view the fully interactive HTML prototype.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {screens.map((screen) => (
                        <a
                            key={screen}
                            href={`/screens/${screen}.html`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-orange-500 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="aspect-[4/3] relative w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                                {/* Use an img tag to avoid Next.js external hostname restrictions if any, or just local path */}
                                <img
                                    src={`/screens/${screen}.png`}
                                    alt={formatName(screen)}
                                    className="object-cover w-full h-full object-top group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <span className="text-white font-semibold flex items-center gap-2">
                                        View Live Prototype
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-orange-600 transition-colors">
                                    {formatName(screen)}
                                </h3>
                                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-400">
                                    <span className="bg-slate-100 px-2 py-1 rounded-md">HTML</span>
                                    <span className="bg-slate-100 px-2 py-1 rounded-md">100% Stitched</span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
