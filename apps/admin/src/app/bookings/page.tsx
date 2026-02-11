"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type BookingStatus = "CONFIRMED" | "COMPLETED" | "CANCELLED" | "PENDING";

interface Booking {
  id: string;
  bookingNo: string;
  ceremony: string;
  customer: string;
  pandit: string;
  city: string;
  date: string;
  amount: number;
  status: BookingStatus;
  travelNeeded: boolean;
}

const MOCK_BOOKINGS: Booking[] = [
  { id: "1", bookingNo: "BK-8821", ceremony: "Vivah Puja", customer: "Aryan Gupta", pandit: "Ramesh Sharma", city: "Delhi", date: "15 Feb 2024", amount: 21000, status: "CONFIRMED", travelNeeded: false },
  { id: "2", bookingNo: "BK-8820", ceremony: "Griha Pravesh", customer: "Priya Mehta", pandit: "Suresh Mishra", city: "Noida", date: "14 Feb 2024", amount: 8500, status: "COMPLETED", travelNeeded: false },
  { id: "3", bookingNo: "BK-8819", ceremony: "Satyanarayan Katha", customer: "Ravi Verma", pandit: "Dinesh Tiwari", city: "Gurgaon", date: "13 Feb 2024", amount: 6000, status: "CONFIRMED", travelNeeded: true },
  { id: "4", bookingNo: "BK-8818", ceremony: "Mundan Ceremony", customer: "Sunita Singh", pandit: "Mahesh Pandey", city: "Delhi", date: "12 Feb 2024", amount: 5500, status: "CANCELLED", travelNeeded: false },
  { id: "5", bookingNo: "BK-8817", ceremony: "Navgraha Puja", customer: "Amit Sharma", pandit: "Ganesh Dubey", city: "Faridabad", date: "16 Feb 2024", amount: 12000, status: "CONFIRMED", travelNeeded: true },
  { id: "6", bookingNo: "BK-8816", ceremony: "Rudrabhishek", customer: "Kavita Joshi", pandit: "Rajesh Shastri", city: "Noida", date: "17 Feb 2024", amount: 15000, status: "PENDING", travelNeeded: false },
  { id: "7", bookingNo: "BK-8815", ceremony: "Vivah Puja", customer: "Deepak Kumar", pandit: "Ramesh Sharma", city: "Delhi", date: "10 Feb 2024", amount: 22000, status: "COMPLETED", travelNeeded: false },
  { id: "8", bookingNo: "BK-8814", ceremony: "Griha Pravesh", customer: "Meena Agrawal", pandit: "Suresh Mishra", city: "Gurgaon", date: "9 Feb 2024", amount: 9500, status: "CANCELLED", travelNeeded: true },
];

const STATUS_STYLES: Record<BookingStatus, string> = {
  CONFIRMED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function BookingsPage() {
  const [filter, setFilter] = useState<BookingStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailNote, setDetailNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const filtered = MOCK_BOOKINGS.filter((b) => {
    const matchesFilter = filter === "ALL" || b.status === filter;
    const matchesSearch =
      b.bookingNo.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.toLowerCase().includes(search.toLowerCase()) ||
      b.pandit.toLowerCase().includes(search.toLowerCase()) ||
      b.ceremony.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const selected = selectedId ? MOCK_BOOKINGS.find((b) => b.id === selectedId) : null;

  const handleAction = async (action: string) => {
    if (!selected) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/admin/bookings/${selected.id}/action`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: detailNote }),
      });
    } catch { /* dev mode */ } finally {
      setLoading(false);
      showToast(`Action "${action}" applied to ${selected.bookingNo}`);
      setDetailNote("");
    }
  };

  const counts = {
    ALL: MOCK_BOOKINGS.length,
    CONFIRMED: MOCK_BOOKINGS.filter((b) => b.status === "CONFIRMED").length,
    PENDING: MOCK_BOOKINGS.filter((b) => b.status === "PENDING").length,
    COMPLETED: MOCK_BOOKINGS.filter((b) => b.status === "COMPLETED").length,
    CANCELLED: MOCK_BOOKINGS.filter((b) => b.status === "CANCELLED").length,
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bookings Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{MOCK_BOOKINGS.length} total bookings</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">
          <span className="material-symbols-outlined text-base leading-none">download</span>
          Export CSV
        </button>
      </div>

      <div className={`grid gap-6 ${selected ? "grid-cols-[1fr_360px]" : "grid-cols-1"}`}>

        {/* Main Table */}
        <div>
          {/* Filters */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {(["ALL", "CONFIRMED", "PENDING", "COMPLETED", "CANCELLED"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/40"
                }`}
              >
                {f} ({counts[f]})
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
              <span className="material-symbols-outlined text-slate-400 text-base leading-none">search</span>
              <input
                type="text"
                placeholder="Search bookings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-40"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_auto_auto] gap-4 px-5 py-3 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Booking #</span>
              <span>Ceremony / Customer</span>
              <span>Pandit</span>
              <span>Date / City</span>
              <span>Amount</span>
              <span>Status</span>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-400">No bookings match your filters</div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {filtered.map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => setSelectedId(selectedId === booking.id ? null : booking.id)}
                    className={`w-full grid grid-cols-[1fr_1.5fr_1fr_1fr_auto_auto] gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      selectedId === booking.id ? "bg-primary/5 dark:bg-primary/10" : ""
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-primary">{booking.bookingNo}</p>
                      {booking.travelNeeded && (
                        <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5 mt-0.5">
                          <span className="material-symbols-outlined text-[12px] leading-none">local_shipping</span>
                          Travel needed
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{booking.ceremony}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{booking.customer}</p>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 self-center">{booking.pandit}</p>
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{booking.date}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{booking.city}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white self-center">
                      ₹{booking.amount.toLocaleString("en-IN")}
                    </p>
                    <span className={`self-center text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[booking.status]}`}>
                      {booking.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden h-fit sticky top-20">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-primary">{selected.bookingNo}</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{selected.ceremony}</p>
              </div>
              <button onClick={() => setSelectedId(null)} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700">
                <span className="material-symbols-outlined text-slate-500 text-base leading-none">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {[
                { label: "Customer", value: selected.customer },
                { label: "Pandit", value: selected.pandit },
                { label: "Date", value: selected.date },
                { label: "City", value: selected.city },
                { label: "Amount", value: `₹${selected.amount.toLocaleString("en-IN")}` },
                { label: "Status", value: selected.status },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{row.label}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{row.value}</span>
                </div>
              ))}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Note</label>
                <textarea
                  value={detailNote}
                  onChange={(e) => setDetailNote(e.target.value)}
                  placeholder="Add internal note..."
                  rows={2}
                  className="w-full mt-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleAction("UPDATE_STATUS")} disabled={loading} className="py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
                  Update Status
                </button>
                <button onClick={() => handleAction("REASSIGN")} disabled={loading} className="py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
                  Reassign Pandit
                </button>
                <button onClick={() => handleAction("REFUND")} disabled={loading} className="py-2.5 rounded-xl text-xs font-bold text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
                  Initiate Refund
                </button>
                <button onClick={() => handleAction("SEND_SMS")} disabled={loading} className="py-2.5 rounded-xl text-xs font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors disabled:opacity-50">
                  Send SMS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
