"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface PayoutBooking {
  id: string;
  bookingNumber: string;
  eventType: string;
  eventDate: string;
  completedAt: string | null;
  dakshinaAmount: number;
  travelCost: number;
  foodAllowanceAmount: number;
  panditPayout: number;
  payoutStatus: string;
  payoutReference: string | null;
  payoutCompletedAt: string | null;
  grandTotal: number;
  pandit: {
    id: string;
    displayName: string;
    city: string;
    bankDetails: Record<string, string> | null;
  } | null;
}

const MOCK_BOOKINGS: PayoutBooking[] = [
  {
    id: "pay1", bookingNumber: "BK-240125-001", eventType: "Griha Pravesh", eventDate: "2025-02-10T10:00:00Z",
    completedAt: "2025-02-10T14:00:00Z", dakshinaAmount: 11000, travelCost: 2500, foodAllowanceAmount: 500,
    panditPayout: 12600, payoutStatus: "PENDING", payoutReference: null, payoutCompletedAt: null, grandTotal: 16400,
    pandit: { id: "p1", displayName: "Pandit Ramesh Sharma", city: "Old Delhi", bankDetails: { bankName: "SBI", accountNumber: "****5678", ifscCode: "SBIN0001234" } },
  },
  {
    id: "pay2", bookingNumber: "BK-240122-003", eventType: "Satyanarayan Katha", eventDate: "2025-02-08T09:00:00Z",
    completedAt: "2025-02-08T12:00:00Z", dakshinaAmount: 5100, travelCost: 0, foodAllowanceAmount: 0,
    panditPayout: 5100, payoutStatus: "COMPLETED", payoutReference: "NEFT-2025020812345", payoutCompletedAt: "2025-02-09T11:00:00Z", grandTotal: 7000,
    pandit: { id: "p2", displayName: "Acharya Suresh Tiwari", city: "Varanasi", bankDetails: { bankName: "PNB", accountNumber: "****9012", ifscCode: "PUNB0002345" } },
  },
  {
    id: "pay3", bookingNumber: "BK-240120-002", eventType: "Mundan Ceremony", eventDate: "2025-02-05T08:00:00Z",
    completedAt: "2025-02-05T10:00:00Z", dakshinaAmount: 7500, travelCost: 1200, foodAllowanceAmount: 500,
    panditPayout: 8500, payoutStatus: "PENDING", payoutReference: null, payoutCompletedAt: null, grandTotal: 11200,
    pandit: { id: "p3", displayName: "Pandit Hari Shastri", city: "Mathura", bankDetails: { bankName: "HDFC", accountNumber: "****3456", ifscCode: "HDFC0003456" } },
  },
  {
    id: "pay4", bookingNumber: "BK-240118-004", eventType: "Wedding Ceremony", eventDate: "2025-02-01T06:00:00Z",
    completedAt: "2025-02-01T12:00:00Z", dakshinaAmount: 21000, travelCost: 6500, foodAllowanceAmount: 1000,
    panditPayout: 25500, payoutStatus: "COMPLETED", payoutReference: "NEFT-2025020298765", payoutCompletedAt: "2025-02-03T10:00:00Z", grandTotal: 34000,
    pandit: { id: "p4", displayName: "Pandit Mohan Dubey", city: "South Delhi", bankDetails: { bankName: "ICICI", accountNumber: "****7890", ifscCode: "ICIC0004567" } },
  },
  {
    id: "pay5", bookingNumber: "BK-240115-005", eventType: "Vastu Shanti", eventDate: "2025-01-28T10:00:00Z",
    completedAt: "2025-01-28T13:00:00Z", dakshinaAmount: 9000, travelCost: 1800, foodAllowanceAmount: 500,
    panditPayout: 10200, payoutStatus: "PROCESSING", payoutReference: "NEFT-2025012999001", payoutCompletedAt: null, grandTotal: 13600,
    pandit: { id: "p5", displayName: "Pandit Deepak Mishra", city: "Ghaziabad", bankDetails: { bankName: "Axis", accountNumber: "****1234", ifscCode: "UTIB0005678" } },
  },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  COMPLETED: "bg-green-500/10 text-green-400 border-green-500/20",
  FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function PayoutsPage() {
  const [bookings, setBookings] = useState<PayoutBooking[]>(MOCK_BOOKINGS);
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<PayoutBooking | null>(null);
  const [refInput, setRefInput] = useState("");
  const [toast, setToast] = useState("");
  const [stats, setStats] = useState({
    totalPayouts: 61900,
    totalRevenue: 82200,
    completedBookings: 5,
    pendingPayouts: 2,
  });

  useEffect(() => {
    fetchPayouts();
  }, [filter]);

  async function fetchPayouts() {
    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams({ limit: "50" });
      if (filter !== "ALL") params.set("status", filter);

      const res = await fetch(`${API}/admin/payouts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.bookings?.length) {
          setBookings(json.data.bookings);
          setStats(json.data.stats);
        }
      }
    } catch {
      /* use mock data */
    }
  }

  async function markPaid(id: string) {
    if (!refInput.trim()) {
      showToast("Enter a payout reference (e.g. NEFT ID)");
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API}/admin/payouts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ payoutReference: refInput }),
      });

      if (res.ok) {
        showToast("Payout marked as completed");
        fetchPayouts();
        setSelected(null);
        setRefInput("");
      }
    } catch {
      showToast("Failed to process payout");
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.payoutStatus === filter);

  return (
    <main className="min-h-screen bg-slate-950 p-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Payouts</h1>
        <p className="text-sm text-slate-400">Track and manage pandit payout settlements</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-400">Total Pandit Payouts</p>
          <p className="mt-1 text-2xl font-bold text-white">{"\u20B9"}{stats.totalPayouts.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-400">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold text-green-400">{"\u20B9"}{stats.totalRevenue.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-400">Completed Bookings</p>
          <p className="mt-1 text-2xl font-bold text-white">{stats.completedBookings}</p>
        </div>
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <p className="text-xs text-yellow-400">Pending Payouts</p>
          <p className="mt-1 text-2xl font-bold text-yellow-400">{stats.pendingPayouts}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-2">
        {["ALL", "PENDING", "PROCESSING", "COMPLETED", "FAILED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === s
                ? "bg-primary text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs text-slate-400">
                <th className="pb-3 pr-4">Booking</th>
                <th className="pb-3 pr-4">Pandit</th>
                <th className="pb-3 pr-4">Completed</th>
                <th className="pb-3 pr-4 text-right">Dakshina</th>
                <th className="pb-3 pr-4 text-right">Travel</th>
                <th className="pb-3 pr-4 text-right">Payout</th>
                <th className="pb-3 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => { setSelected(b); setRefInput(b.payoutReference ?? ""); }}
                  className={`cursor-pointer border-b border-slate-800/50 transition-colors hover:bg-slate-900 ${
                    selected?.id === b.id ? "bg-slate-800/60" : ""
                  }`}
                >
                  <td className="py-3 pr-4">
                    <p className="font-medium text-white">{b.bookingNumber}</p>
                    <p className="text-xs text-slate-400">{b.eventType}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-slate-300">{b.pandit?.displayName ?? "—"}</p>
                    <p className="text-xs text-slate-500">{b.pandit?.city}</p>
                  </td>
                  <td className="py-3 pr-4 text-slate-400 text-xs">
                    {b.completedAt
                      ? new Date(b.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-300">
                    {"\u20B9"}{b.dakshinaAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-400">
                    {b.travelCost > 0 ? `\u20B9${b.travelCost.toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold text-white">
                    {"\u20B9"}{b.panditPayout.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[b.payoutStatus] ?? "bg-slate-600 text-slate-300"}`}>
                      {b.payoutStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">No payouts in this category</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-96 flex-shrink-0 rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Payout Details</h3>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Booking Info */}
            <div className="mb-4 rounded-lg bg-slate-800 p-3">
              <p className="text-xs text-slate-400 mb-1">Booking</p>
              <p className="text-sm font-medium text-white">{selected.bookingNumber}</p>
              <p className="text-xs text-slate-400">{selected.eventType} &mdash; {new Date(selected.eventDate).toLocaleDateString("en-IN")}</p>
            </div>

            {/* Pandit */}
            <div className="mb-4 rounded-lg bg-slate-800 p-3">
              <p className="text-xs text-slate-400 mb-1">Pandit</p>
              <p className="text-sm font-medium text-white">{selected.pandit?.displayName}</p>
              <p className="text-xs text-slate-400">{selected.pandit?.city}</p>
            </div>

            {/* Bank Details */}
            {selected.pandit?.bankDetails && (
              <div className="mb-4 rounded-lg bg-slate-800 p-3">
                <p className="text-xs text-slate-400 mb-2">Bank Details</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bank</span>
                    <span className="text-white">{selected.pandit.bankDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account</span>
                    <span className="text-white">{selected.pandit.bankDetails.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IFSC</span>
                    <span className="text-white font-mono">{selected.pandit.bankDetails.ifscCode}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Breakdown */}
            <div className="mb-4 rounded-lg bg-slate-800 p-3">
              <p className="text-xs text-slate-400 mb-2">Payout Breakdown</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Dakshina</span>
                  <span className="text-white">{"\u20B9"}{selected.dakshinaAmount.toLocaleString("en-IN")}</span>
                </div>
                {selected.travelCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Travel Reimbursement</span>
                    <span className="text-white">{"\u20B9"}{selected.travelCost.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {selected.foodAllowanceAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Food Allowance</span>
                    <span className="text-white">{"\u20B9"}{selected.foodAllowanceAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="border-t border-slate-700 pt-1.5 flex justify-between font-semibold">
                  <span className="text-slate-300">Total Payout</span>
                  <span className="text-green-400">{"\u20B9"}{selected.panditPayout.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Paid</span>
                  <span className="text-slate-400">{"\u20B9"}{selected.grandTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Platform Revenue</span>
                  <span className="text-primary">{"\u20B9"}{(selected.grandTotal - selected.panditPayout).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Payout Reference */}
            {selected.payoutStatus !== "COMPLETED" ? (
              <>
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium text-slate-400">Payout Reference (NEFT/UPI ID)</label>
                  <input
                    value={refInput}
                    onChange={(e) => setRefInput(e.target.value)}
                    placeholder="e.g. NEFT-2025021012345"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => markPaid(selected.id)}
                  className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-500"
                >
                  <span className="material-symbols-outlined mr-1 text-base align-middle">payments</span>
                  Mark Payout Complete
                </button>
              </>
            ) : (
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-center">
                <span className="material-symbols-outlined text-green-400 text-2xl">check_circle</span>
                <p className="mt-1 text-sm font-semibold text-green-400">Payout Completed</p>
                <p className="text-xs text-slate-400 mt-0.5">Ref: {selected.payoutReference}</p>
                {selected.payoutCompletedAt && (
                  <p className="text-xs text-slate-500">{new Date(selected.payoutCompletedAt).toLocaleString("en-IN")}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
