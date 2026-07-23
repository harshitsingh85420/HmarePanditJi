"use client";

import React, { useState, useEffect } from "react";
import { ADMIN_TOKEN_KEY } from "@hmarepanditji/utils";

interface Pandit {
  name: string;
  phone: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  upiId?: string;
}

interface PayoutBooking {
  id: string;
  bookingNumber: string;
  eventType: string;
  eventDate: string;
  completedAt: string;
  panditPayout: number;
  payoutStatus: "PENDING" | "COMPLETED" | "PAID";
  payoutCompletedAt: string;
  storedPayoutMissing?: boolean;
  pandit: Pandit;
}

export default function PayoutsPage() {
  const [bookings, setBookings] = useState<PayoutBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"PENDING" | "PAID">("PENDING");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const fetchPayouts = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      
      // Query database for payouts. 
      // Note: We use booking status query parameter if needed, but since our custom endpoint filters by payout status:
      // We will fetch payouts and filter client-side or check the query param status.
      const res = await fetch(`${baseUrl}/admin/payouts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.data.bookings || []);
      } else {
        setError(data.error?.message || "Failed to load payouts queue");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load payouts queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleMarkPaid = async (bookingId: string) => {
    if (!confirm("Are you sure you want to mark this payout as PAID?")) return;
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${baseUrl}/admin/payouts/${bookingId}/mark-paid`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert("Marked as paid successfully");
        fetchPayouts();
      } else {
        alert(data.error?.message || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  };

  // Filter payouts based on tab
  // PENDING = not COMPLETED / PAID
  const filteredBookings = bookings.filter(b => {
    const isPaid = b.payoutStatus === "COMPLETED" || b.payoutStatus === "PAID";
    return activeTab === "PAID" ? isPaid : !isPaid;
  });

  const pendingCount = bookings.filter(b => b.payoutStatus !== "COMPLETED" && b.payoutStatus !== "PAID").length;
  // Do NOT sum rows whose stored payout is missing — a confident total built on
  // an unverified figure is exactly what we're avoiding (founder 2026-07-22).
  const pendingTotalAmount = bookings
    .filter(b => b.payoutStatus !== "COMPLETED" && b.payoutStatus !== "PAID" && !b.storedPayoutMissing)
    .reduce((sum, b) => sum + (b.panditPayout || 0), 0);
  const checkingCount = bookings.filter(b => b.storedPayoutMissing).length;

  const getAgeInDays = (completedAtStr: string) => {
    if (!completedAtStr) return 0;
    const completedDate = new Date(completedAtStr);
    const diffTime = Math.abs(new Date().getTime() - completedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border rounded-xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Payout Queue</h2>
          <p className="text-sm text-slate-500 mt-1">Review completed booking payouts and record transactions</p>
        </div>
        <div className="flex gap-6 items-center">
          <div className="text-center md:text-right">
            <span className="text-xs font-bold text-slate-400 uppercase">Pending Payouts</span>
            <p className="text-2xl font-black text-slate-800">{pendingCount}</p>
          </div>
          <div className="text-center md:text-right border-l pl-6">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Pending</span>
            <p className="text-2xl font-black text-leaf-600">₹{pendingTotalAmount.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition ${activeTab === "PENDING" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          PENDING ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab("PAID")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition ${activeTab === "PAID" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          PAID ({bookings.length - pendingCount})
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center font-medium text-slate-500">Loading payouts...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-slate-500 font-medium">
          No payouts found in this tab.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Pandit Name & Phone</th>
                  <th className="px-6 py-4">Puja & Event Date</th>
                  <th className="px-6 py-4">Payout Amount</th>
                  <th className="px-6 py-4">Bank/UPI Account Details</th>
                  <th className="px-6 py-4">Puja Completed At</th>
                  <th className="px-6 py-4">Age (Days)</th>
                  {activeTab === "PENDING" && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => {
                  const age = getAgeInDays(b.completedAt);
                  const isOld = age > 2;
                  
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 text-sm text-slate-700">
                      <td className="px-6 py-4 font-bold text-slate-900">{b.bookingNumber}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{b.pandit?.name || "N/A"}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{b.pandit?.phone || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{b.eventType}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{new Date(b.eventDate).toLocaleDateString()}</div>
                        {/* runbook PROCEDURE 4: call the CUSTOMER before every
                            mark-paid — the number lives ON this row, not a
                            screen away (founder, 2026-07-23). */}
                        {b.customer?.phone && (
                          <div className="text-xs mt-1.5 bg-emerald-50 border border-emerald-200 rounded px-2 py-1 inline-block">
                            <span className="font-bold text-emerald-800">Confirm with customer:</span>{" "}
                            <span className="text-emerald-900">{b.customer.name || ""}</span>{" "}
                            <span className="font-mono font-semibold text-emerald-900">{b.customer.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {b.storedPayoutMissing ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 text-xs font-semibold" title="Stored payout missing — figure is being verified, do not pay yet">
                            हिसाब जाँचा जा रहा है
                          </span>
                        ) : (
                          <>₹{b.panditPayout?.toLocaleString("en-IN")}</>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {b.pandit?.upiId ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-400 uppercase">UPI Method</span>
                            {revealed[b.id] ? (
                              <span className="font-mono font-semibold text-slate-800 bg-slate-50 px-2 py-1 rounded">{b.pandit.upiId}</span>
                            ) : (
                              <button 
                                onClick={() => setRevealed(prev => ({ ...prev, [b.id]: true }))}
                                className="text-xs text-blue-600 hover:underline text-left"
                              >
                                Click to reveal UPI
                              </button>
                            )}
                          </div>
                        ) : b.pandit?.bankAccountNumber ? (
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 uppercase block">Bank Method</span>
                            <div className="text-xs text-slate-700 font-medium">Last 4: ••••{b.pandit.bankAccountNumber.slice(-4)}</div>
                            {revealed[b.id] ? (
                              <div className="bg-slate-50 p-2 rounded border border-slate-100 text-xs font-mono space-y-0.5">
                                <div>Acc Name: {b.pandit.bankAccountName || "N/A"}</div>
                                <div>IFSC: {b.pandit.bankIfscCode || "N/A"}</div>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setRevealed(prev => ({ ...prev, [b.id]: true }))}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Click to reveal details
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-red-500 text-xs font-bold uppercase">No Bank details</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {b.completedAt ? new Date(b.completedAt).toLocaleString() : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${isOld && activeTab === "PENDING" ? "bg-red-100 text-red-700 animate-pulse" : "bg-slate-100 text-slate-600"}`}>
                          {age} Days
                        </span>
                      </td>
                      {activeTab === "PENDING" && (
                        <td className="px-6 py-4 text-right">
                          {b.storedPayoutMissing ? (
                            <span className="text-amber-700 text-xs font-semibold" title="Amount is being verified — cannot pay until resolved">Verifying…</span>
                          ) : (
                            <button
                              onClick={() => handleMarkPaid(b.id)}
                              title="Runbook §4: call the customer FIRST — क्या पूजा ठीक से संपन्न हुई? Number is on this row."
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded transition"
                            >
                              MARK PAID
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
