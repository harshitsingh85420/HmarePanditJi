"use client";

import { useState } from "react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  city: string;
  bookings: number;
  totalSpent: string;
  lastBooking: string;
  joinedDate: string;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
}

const MOCK_CUSTOMERS: Customer[] = [
  { id: "1", name: "Aryan Gupta", phone: "+91 99887 76655", city: "Delhi", bookings: 8, totalSpent: "₹1,12,000", lastBooking: "15 Feb 2024", joinedDate: "Mar 2023", status: "ACTIVE" },
  { id: "2", name: "Priya Mehta", phone: "+91 88776 65544", city: "Noida", bookings: 3, totalSpent: "₹24,500", lastBooking: "14 Feb 2024", joinedDate: "Aug 2023", status: "ACTIVE" },
  { id: "3", name: "Ravi Verma", phone: "+91 77665 54433", city: "Gurgaon", bookings: 5, totalSpent: "₹58,000", lastBooking: "13 Feb 2024", joinedDate: "Jun 2023", status: "ACTIVE" },
  { id: "4", name: "Sunita Singh", phone: "+91 66554 43322", city: "Delhi", bookings: 1, totalSpent: "₹5,500", lastBooking: "12 Feb 2024", joinedDate: "Jan 2024", status: "INACTIVE" },
  { id: "5", name: "Amit Sharma", phone: "+91 55443 32211", city: "Faridabad", bookings: 12, totalSpent: "₹1,80,000", lastBooking: "16 Feb 2024", joinedDate: "Feb 2023", status: "ACTIVE" },
  { id: "6", name: "Kavita Joshi", phone: "+91 44332 21100", city: "Noida", bookings: 2, totalSpent: "₹27,000", lastBooking: "17 Feb 2024", joinedDate: "Nov 2023", status: "ACTIVE" },
  { id: "7", name: "Deepak Kumar", phone: "+91 33221 10099", city: "Delhi", bookings: 0, totalSpent: "₹0", lastBooking: "—", joinedDate: "Feb 2024", status: "BLOCKED" },
];

const MOCK_HISTORY = [
  { no: "BK-8821", ceremony: "Vivah Puja", pandit: "Ramesh Sharma", date: "15 Feb 2024", amount: "₹21,000", status: "CONFIRMED" },
  { no: "BK-8810", ceremony: "Griha Pravesh", pandit: "Suresh Mishra", date: "5 Jan 2024", amount: "₹8,500", status: "COMPLETED" },
  { no: "BK-8800", ceremony: "Satyanarayan", pandit: "Dinesh Tiwari", date: "12 Dec 2023", amount: "₹6,000", status: "COMPLETED" },
];

const STATUS_STYLES = {
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  INACTIVE: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  BLOCKED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const filtered = MOCK_CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  const selected = selectedId ? MOCK_CUSTOMERS.find((c) => c.id === selectedId) : null;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{MOCK_CUSTOMERS.length} registered customers</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">
          <span className="material-symbols-outlined text-base leading-none">download</span>
          Export CSV
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Customers", value: "1,842", icon: "people", color: "text-primary", bg: "bg-primary/10" },
          { label: "Active (30d)", value: "1,124", icon: "person_check", color: "text-green-500", bg: "bg-green-500/10" },
          { label: "New This Week", value: "68", icon: "person_add", color: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Avg Lifetime Value", value: "₹24,800", icon: "currency_rupee", color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <span className={`material-symbols-outlined text-xl leading-none ${stat.color}`}>{stat.icon}</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className={`grid gap-6 ${selected ? "grid-cols-[1fr_380px]" : "grid-cols-1"}`}>
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
              <span className="material-symbols-outlined text-slate-400 text-base leading-none">search</span>
              <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-48" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Customer</span><span>City</span><span>Bookings</span><span>Total Spent</span><span>Last Booking</span><span>Status</span>
            </div>
            {filtered.map((customer) => (
              <button
                key={customer.id}
                onClick={() => setSelectedId(selectedId === customer.id ? null : customer.id)}
                className={`w-full grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 text-left border-b border-slate-50 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedId === customer.id ? "bg-primary/5 dark:bg-primary/10" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-sm flex-shrink-0">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{customer.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{customer.phone}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 self-center">{customer.city}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white self-center">{customer.bookings}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white self-center">{customer.totalSpent}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 self-center">{customer.lastBooking}</p>
                <span className={`self-center text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[customer.status]}`}>{customer.status}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden h-fit sticky top-20">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{selected.name}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[selected.status]}`}>{selected.status}</span>
                </div>
              </div>
              <button onClick={() => setSelectedId(null)} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-500 text-base leading-none">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {[
                { label: "Phone", value: selected.phone },
                { label: "City", value: selected.city },
                { label: "Total Bookings", value: String(selected.bookings) },
                { label: "Total Spent", value: selected.totalSpent },
                { label: "Joined", value: selected.joinedDate },
                { label: "Last Booking", value: selected.lastBooking },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{row.label}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{row.value}</span>
                </div>
              ))}

              {/* Booking History */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Booking History</p>
                <div className="space-y-2">
                  {MOCK_HISTORY.map((h) => (
                    <div key={h.no} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                      <div>
                        <p className="text-xs font-bold text-primary">{h.no}</p>
                        <p className="text-xs text-slate-500">{h.ceremony} · {h.date}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{h.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button onClick={() => showToast("SMS sent")} className="py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors">Send SMS</button>
                {selected.status === "BLOCKED" ? (
                  <button onClick={() => showToast("Customer unblocked")} className="py-2.5 rounded-xl text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 transition-colors">Unblock</button>
                ) : (
                  <button onClick={() => showToast("Customer blocked")} className="py-2.5 rounded-xl text-xs font-bold text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Block</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold px-5 py-3 rounded-xl shadow-xl">{toast}</div>
      )}
    </div>
  );
}
