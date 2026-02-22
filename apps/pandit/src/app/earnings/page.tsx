"use client";

import React, { useEffect, useState } from "react";
// removed auth
import { Loader2 } from "lucide-react";
import TextToSpeechButton from "@/components/TextToSpeechButton";
import EarningsHeader from "./components/EarningsHeader";
import EarningsChart from "./components/EarningsChart";
import PendingPayoutCard from "./components/PendingPayoutCard";
import PayoutHistoryList from "./components/PayoutHistoryList";

export default function EarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(""); // YYYY-MM
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  useEffect(() => {
    fetchEarningsData(selectedMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  const fetchEarningsData = async (month: string) => {
    try {
      setLoading(true);
      if (!token) return;

      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/pandits/earnings/summary`);
      if (month) url.searchParams.append("month", month);

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || "Failed to load earnings data");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const voiceText = `इस महीने आपने ${data.bookingsCount} पूजाओं से कुल ₹${data.totalEarned} कमाए। ₹${data.totalPaid} आपके खाते में आ चुके हैं। ₹${data.totalPending} बाकी हैं।`;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-500 font-medium">डैशबोर्ड <span className="mx-2">/</span> कमाई</p>
        <TextToSpeechButton text={voiceText} />
      </div>

      <EarningsHeader
        summary={data}
        onMonthChange={setSelectedMonth}
        selectedMonth={selectedMonth}
      />

      <EarningsChart data={data.monthlyTotals} />

      <PendingPayoutCard payouts={data.pendingPayouts} />

      <PayoutHistoryList bookings={data.bookingEarnings} />
    </div>
  );
}
