"use client";

// ─────────────────────────────────────────────────────────────
// MOCKUP-MATCH HARNESS — /design/harness/home (DEV ONLY; 404 in prod).
// Renders the REAL HomeView with the mockup's data (screen 8: Ramesh,
// online, ₹52,400 month / ₹8,200 pending, कल सुबह 9:00 सत्यनारायण कथा)
// and NO voice wiring: no VoiceActionListener, no FirstUseTip, no Narrate,
// no voiceController mount, no getUserMedia — screenshot-safe by
// construction. Never linked from the app; adds no new prod code (HomeView
// ships with /home regardless; this route hard-404s in production).
// ─────────────────────────────────────────────────────────────

import React from "react";
import { notFound } from "next/navigation";
import { HomeView, HomeBooking } from "../../../(dashboard-group)/home/HomeView";

export default function HomeHarnessPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const tomorrow9am = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  })();

  const nextBooking: HomeBooking = {
    id: "mock-satyanarayan",
    bookingNumber: "HMJ-MOCK-1",
    pujaType: "सत्यनारायण कथा",
    eventType: "सत्यनारायण कथा",
    eventDate: tomorrow9am,
    venueAddress: "राजाजीपुरम, लखनऊ",
    venueCity: "लखनऊ",
    status: "ACCEPTED",
  };

  return (
    <HomeView
      firstName="रमेश"
      festivalDay={false}
      isPending={false}
      isRejected={false}
      rejectionReason={null}
      isApproved={true}
      isBookingReady={true}
      readinessStep={5}
      isOnline={true}
      todayBookings={[]}
      tomorrowBookings={[nextBooking]}
      earnings={{ today: 0, month: 52400, pendingPayout: 8200 }}
      milestoneKinds={[]}
      newRequestBooking={null}
      celebratingMilestone={null}
      errorMsg=""
      toastMsg=""
      onToggleStatus={() => {}}
      onNavigate={() => {}}
      onCloseToast={() => {}}
      onMilestoneCta={() => {}}
    />
  );
}
