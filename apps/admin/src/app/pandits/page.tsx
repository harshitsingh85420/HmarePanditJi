"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

type VerificationStatus = "VERIFIED" | "PENDING" | "REJECTED" | "SUSPENDED";

interface Pandit {
  id: string;
  name: string;
  phone: string;
  city: string;
  experience: string;
  specializations: string[];
  rating: number;
  bookings: number;
  status: VerificationStatus;
  joinedDate: string;
  earnings: string;
}

const MOCK_PANDITS: Pandit[] = [
  { id: "1", name: "Ramesh Kumar Sharma", phone: "+91 98765 43210", city: "Delhi", experience: "18 yrs", specializations: ["Vivah", "Griha Pravesh"], rating: 4.9, bookings: 142, status: "VERIFIED", joinedDate: "Jan 2024", earnings: "₹2.4L" },
  { id: "2", name: "Suresh Mishra", phone: "+91 87654 32109", city: "Noida", experience: "12 yrs", specializations: ["Satyanarayan", "Rudrabhishek"], rating: 4.7, bookings: 98, status: "VERIFIED", joinedDate: "Feb 2024", earnings: "₹1.8L" },
  { id: "3", name: "Dinesh Tiwari", phone: "+91 76543 21098", city: "Gurgaon", experience: "25 yrs", specializations: ["Vivah", "Mundan"], rating: 4.8, bookings: 201, status: "VERIFIED", joinedDate: "Dec 2023", earnings: "₹3.1L" },
  { id: "4", name: "Mahesh Pandey", phone: "+91 65432 10987", city: "Faridabad", experience: "8 yrs", specializations: ["Puja"], rating: 0, bookings: 0, status: "PENDING", joinedDate: "Feb 2024", earnings: "₹0" },
  { id: "5", name: "Ganesh Dubey", phone: "+91 54321 09876", city: "Lucknow", experience: "15 yrs", specializations: ["Rudrabhishek", "Yagya"], rating: 4.6, bookings: 87, status: "VERIFIED", joinedDate: "Nov 2023", earnings: "₹1.2L" },
  { id: "6", name: "Rajesh Shastri", phone: "+91 43210 98765", city: "Delhi", experience: "10 yrs", specializations: ["Griha Pravesh"], rating: 0, bookings: 0, status: "REJECTED", joinedDate: "Jan 2024", earnings: "₹0" },
  { id: "7", name: "Vinod Upadhyay", phone: "+91 32109 87654", city: "Noida", experience: "20 yrs", specializations: ["All Pujas"], rating: 4.5, bookings: 56, status: "SUSPENDED", joinedDate: "Oct 2023", earnings: "₹0.8L" },
];

const STATUS_STYLES: Record<VerificationStatus, string> = {
  VERIFIED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  REJECTED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  SUSPENDED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export default function PanditsPage() {
  const [filter, setFilter] = useState<VerificationStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const filtered = MOCK_PANDITS.filter((p) => {
    const matchesFilter = filter === "ALL" || p.status === filter;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  const selected = selectedId ? MOCK_PANDITS.find((p) => p.id === selectedId) : null;

  const counts = {
    ALL: MOCK_PANDITS.length,
    VERIFIED: MOCK_PANDITS.filter((p) => p.status === "VERIFIED").length,
    PENDING: MOCK_PANDITS.filter((p) => p.status === "PENDING").length,
    REJECTED: MOCK_PANDITS.filter((p) => p.status === "REJECTED").length,
    SUSPENDED: MOCK_PANDITS.filter((p) => p.status === "SUSPENDED").length,
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pandit Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{MOCK_PANDITS.length} registered pandits</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/verification" className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
            <span className="material-symbols-outlined text-base leading-none">verified_user</span>
            Verification Queue ({counts.PENDING})
          </a>
          <button className="flex items-center gap-2 bg-primary text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined text-base leading-none">person_add</span>
            Add Pandit
          </button>
        </div>
      </div>

      <div className={`grid gap-6 ${selected ? "grid-cols-[1fr_380px]" : "grid-cols-1"}`}>
        <div>
          {/* Filters */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {(["ALL", "VERIFIED", "PENDING", "REJECTED", "SUSPENDED"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f ? "bg-primary text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/40"
                }`}
              >
                {f} ({counts[f]})
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
              <span className="material-symbols-outlined text-slate-400 text-base leading-none">search</span>
              <input type="text" placeholder="Search pandits..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-40" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Pandit</span><span>City / Exp.</span><span>Rating</span><span>Bookings</span><span>Earnings</span><span>Status</span>
            </div>
            {filtered.map((pandit) => (
              <button
                key={pandit.id}
                onClick={() => setSelectedId(selectedId === pandit.id ? null : pandit.id)}
                className={`w-full grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 text-left border-b border-slate-50 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedId === pandit.id ? "bg-primary/5 dark:bg-primary/10" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {pandit.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{pandit.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{pandit.phone}</p>
                  </div>
                </div>
                <div className="self-center">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{pandit.city}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{pandit.experience}</p>
                </div>
                <div className="self-center">
                  {pandit.rating > 0 ? (
                    <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                      <span className="material-symbols-outlined text-[14px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      {pandit.rating}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white self-center">{pandit.bookings}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white self-center">{pandit.earnings}</p>
                <span className={`self-center text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[pandit.status]}`}>{pandit.status}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden h-fit sticky top-20">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
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
                { label: "Experience", value: selected.experience },
                { label: "Joined", value: selected.joinedDate },
                { label: "Total Bookings", value: String(selected.bookings) },
                { label: "Total Earnings", value: selected.earnings },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{row.label}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{row.value}</span>
                </div>
              ))}

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Specializations</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.specializations.map((s) => (
                    <span key={s} className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Note</label>
                <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Add note..." rows={2} className="w-full mt-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {selected.status === "PENDING" && (
                  <>
                    <a href="/verification" className="py-2.5 rounded-xl text-xs font-bold text-center bg-primary text-white hover:bg-primary/90 transition-colors">Review KYC</a>
                    <button onClick={() => showToast("Info requested")} className="py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Request Info</button>
                  </>
                )}
                {selected.status === "VERIFIED" && (
                  <>
                    <button onClick={() => showToast("Profile edit opened")} className="py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors">Edit Profile</button>
                    <button onClick={() => showToast("Pandit suspended")} className="py-2.5 rounded-xl text-xs font-bold text-amber-600 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">Suspend</button>
                  </>
                )}
                {(selected.status === "REJECTED" || selected.status === "SUSPENDED") && (
                  <button onClick={() => showToast("Pandit reactivated")} className="col-span-2 py-2.5 rounded-xl text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">Reactivate</button>
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
