"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hi } from "@/lib/strings";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

// UI Components
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { BottomNav } from "@/components/ui/BottomNav";
import { DiyaLoader } from "@/components/moments/DiyaLoader";

interface BookingItem {
  id: string;
  bookingNumber: string;
  pujaType: string;
  eventType: string;
  eventDate: string;
  venueAddress: string;
  venueCity: string;
  grandTotal: number;
  status: string;
}

const bookingLabels = {
  tabNew: "नई",
  tabUpcoming: "आने वाली",
  tabCompleted: "पूरी हुई",
  noBookings: "कोई बुकिंग नहीं है",
};

export default function BookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [activeTab, setActiveTab] = useState<"NEW" | "UPCOMING" | "COMPLETED">("NEW");

  // Fetch all bookings for this pandit
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const res = await api("/pandit/bookings");
      setLoading(false);

      if (res.success && res.data) {
        setBookings(res.data);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return <DiyaLoader />;
  }

  // Filter bookings based on activeTab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "NEW") {
      return b.status === "REQUESTED";
    }
    if (activeTab === "UPCOMING") {
      return b.status === "ACCEPTED" || b.status === "IN_PROGRESS" || b.status === "PUJA_IN_PROGRESS";
    }
    if (activeTab === "COMPLETED") {
      return b.status === "COMPLETED";
    }
    return false;
  });

  const handleCardClick = (b: BookingItem) => {
    if (b.status === "REQUESTED") {
      router.push(`/bookings/${b.id}/request`);
    } else {
      router.push(`/bookings/${b.id}`);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-cream text-ink pb-28">
      <Header title={hi.home.todayBookings} showBack={false} />

      {/* Tabs bar */}
      <div className="flex bg-white border-b border-saffron-100 sticky top-[56px] z-20">
        <button
          onClick={() => setActiveTab("NEW")}
          className={`flex-1 text-center py-4 font-bold text-[18px] transition-all border-b-4 ${
            activeTab === "NEW" ? "border-saffron-500 text-saffron-700" : "border-transparent text-softgrey"
          }`}
          style={{ minHeight: "56px" }}
        >
          {bookingLabels.tabNew}
        </button>
        <button
          onClick={() => setActiveTab("UPCOMING")}
          className={`flex-1 text-center py-4 font-bold text-[18px] transition-all border-b-4 ${
            activeTab === "UPCOMING" ? "border-saffron-500 text-saffron-700" : "border-transparent text-softgrey"
          }`}
          style={{ minHeight: "56px" }}
        >
          {bookingLabels.tabUpcoming}
        </button>
        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`flex-1 text-center py-4 font-bold text-[18px] transition-all border-b-4 ${
            activeTab === "COMPLETED" ? "border-saffron-500 text-saffron-700" : "border-transparent text-softgrey"
          }`}
          style={{ minHeight: "56px" }}
        >
          {bookingLabels.tabCompleted}
        </button>
      </div>

      {/* Bookings List */}
      <main className="max-w-[430px] mx-auto px-4 pt-4 flex flex-col gap-4">
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
            <span className="text-[64px]">🌤️</span>
            <span className="text-[20px] font-bold text-softgrey font-hindi">
              {bookingLabels.noBookings}
            </span>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <motion.div
              key={b.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick(b)}
              className="cursor-pointer"
            >
              <Card className="p-5 flex flex-col gap-3 hover:shadow-md transition-all border-l-4 border-saffron-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[20px] font-bold text-temple-700 font-hindi">
                      {b.pujaType || b.eventType}
                    </h3>
                    <span className="t-hint text-softgrey font-mono block mt-0.5">
                      {b.bookingNumber}
                    </span>
                  </div>
                  <span className="text-[18px] font-bold text-leaf-700">
                    ₹{b.grandTotal ? b.grandTotal.toLocaleString("en-IN") : "0"}
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-[16px] text-softgrey border-t border-saffron-100/50 pt-2">
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span className="font-hindi">{formatDate(b.eventDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>⏰</span>
                    <span className="font-bold text-[18px] text-ink">{formatTime(b.eventDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span className="truncate font-hindi">{b.venueAddress}, {b.venueCity}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNav activeTab={1} onChange={(idx) => {
        if (idx === 0) router.push("/home");
        else if (idx === 2) router.push("/earnings");
        else if (idx === 3) router.push("/calendar");
      }} />
    </div>
  );
}
