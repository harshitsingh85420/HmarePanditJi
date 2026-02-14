"use client";

import React, { useState } from "react";

interface PayoutRecord {
  id: string;
  bookingId: string;
  panditName: string;
  panditInitial: string;
  dakshina: number;
  travel: number;
  food: number;
  platformFee: number;
  netPayout: number;
  status: "Verified" | "Discrepancy" | "Processing";
  discrepancyStart?: number;
  discrepancyClaim?: number;
}

const MOCK_PAYOUTS: PayoutRecord[] = [
  {
    id: "1", bookingId: "#HPJ-9921", panditName: "Pt. Sharma", panditInitial: "S",
    dakshina: 2100, travel: 500, food: 200, platformFee: 200, netPayout: 2600, status: "Verified"
  },
  {
    id: "2", bookingId: "#HPJ-9945", panditName: "Pt. Verma", panditInitial: "V",
    dakshina: 5100, travel: 800, food: 200, platformFee: 500, netPayout: 5600, status: "Discrepancy",
    discrepancyStart: 800, discrepancyClaim: 1200
  },
  {
    id: "3", bookingId: "#HPJ-9952", panditName: "Pt. Tiwari", panditInitial: "T",
    dakshina: 1100, travel: 150, food: 100, platformFee: 100, netPayout: 1250, status: "Verified"
  },
  {
    id: "4", bookingId: "#HPJ-9960", panditName: "Pt. Joshi", panditInitial: "J",
    dakshina: 3500, travel: 800, food: 250, platformFee: 350, netPayout: 4200, status: "Verified"
  },
  {
    id: "5", bookingId: "#HPJ-9968", panditName: "Pt. Mishra", panditInitial: "M",
    dakshina: 2100, travel: 300, food: 200, platformFee: 200, netPayout: 2400, status: "Verified"
  },
  {
    id: "6", bookingId: "#HPJ-9975", panditName: "Pt. Gupta", panditInitial: "G",
    dakshina: 1500, travel: 0, food: 0, platformFee: 150, netPayout: 1350, status: "Processing"
  }
];

export default function PayoutReconciliationPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [showDiscrepancies, setShowDiscrepancies] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredPayouts = MOCK_PAYOUTS.filter(p => {
    if (showDiscrepancies && p.status !== "Discrepancy") return false;
    if (searchTerm && !p.panditName.toLowerCase().includes(searchTerm.toLowerCase()) && !p.bookingId.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredPayouts.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredPayouts.map(p => p.id)));
  };

  const totalSelected = Array.from(selectedIds).reduce((sum, id) => {
    const p = MOCK_PAYOUTS.find(x => x.id === id);
    return sum + (p?.netPayout || 0);
  }, 0);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#f6f6f8] dark:bg-[#101622] text-slate-800 dark:text-slate-100 font-sans">

      {/* ── Header & KPI Section ─────────────────────────────────────────── */}
      <div className="p-6 pb-2 space-y-6 shrink-0">
        {/* Title & Batch Date */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payout Reconciliation</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review pending claims and approve batch payments.</p>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="material-symbols-outlined text-[#0f49bd] text-xl">event</span>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Next Scheduled Batch</p>
              <p className="text-sm font-bold text-slate-800 dark:text-white">Tue, 24 Oct 2023</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between group hover:border-[#0f49bd]/30 transition-colors">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Payable</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹1,24,500</h3>
              <p className="text-xs text-slate-500 mt-1">45 Bookings Pending</p>
            </div>
            <div className="p-2 bg-[#0f49bd]/10 rounded-lg text-[#0f49bd]">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border-l-4 border-l-red-500 border-y border-r border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between group">
            <div>
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Discrepancies</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">3 <span className="text-sm font-normal text-slate-500">Bookings</span></h3>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">Action Required</p>
            </div>
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-500">
              <span className="material-symbols-outlined">priority_high</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between group hover:border-[#0f49bd]/30 transition-colors">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Processed (Oct)</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹4,50,000</h3>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                +12% vs Sep
              </p>
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center gap-3">
            <button className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-600">
              <span className="material-symbols-outlined text-lg">file_download</span>
              Export for Tally
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
          {/* Tabs */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-1.5 rounded-md shadow-sm font-semibold text-sm transition-all ${activeTab === 'pending' ? 'bg-white dark:bg-slate-700 text-[#0f49bd]' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              Pending Reconciliation
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-1.5 rounded-md font-medium text-sm transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-[#0f49bd]' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              Payout History
            </button>
          </div>
          {/* Filters */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              <input
                checked={showDiscrepancies}
                onChange={(e) => setShowDiscrepancies(e.target.checked)}
                className="form-checkbox rounded text-red-500 border-slate-300 focus:ring-red-500 w-4 h-4"
                type="checkbox"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Show Discrepancies Only</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-[#0f49bd] focus:border-[#0f49bd] w-64 dark:text-white"
                placeholder="Search ID or Pandit..."
                type="text"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium">
              <span className="material-symbols-outlined text-lg">filter_list</span>
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* ── Table Container ──────────────────────────────────────────────── */}
      <div className="flex-1 px-6 pb-6 overflow-hidden flex flex-col">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full overflow-hidden relative">

          {/* Table Header */}
          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4 w-12">
                    <input
                      onChange={toggleAll}
                      checked={selectedIds.size === filteredPayouts.length && filteredPayouts.length > 0}
                      className="form-checkbox rounded text-[#0f49bd] border-slate-300 focus:ring-[#0f49bd] w-4 h-4"
                      type="checkbox"
                    />
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-32">Status</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Booking ID</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pandit Name</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Dakshina</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Travel Reimb.</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Food Allw.</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right text-red-500">Plat. Fee</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#0f49bd] dark:text-blue-400 uppercase tracking-wider text-right bg-[#0f49bd]/5 dark:bg-[#0f49bd]/10 border-l border-[#0f49bd]/10">Net Payout</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredPayouts.map((row) => (
                  <tr key={row.id} className={`group transition-colors ${row.status === 'Discrepancy' ? 'bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                    <td className="py-3 px-4">
                      <input
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleSelection(row.id)}
                        disabled={row.status === 'Processing'}
                        className="form-checkbox rounded text-[#0f49bd] border-slate-300 focus:ring-[#0f49bd] w-4 h-4"
                        type="checkbox"
                      />
                    </td>
                    <td className="py-3 px-4">
                      {row.status === 'Verified' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Verified
                        </span>
                      )}
                      {row.status === 'Discrepancy' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800 animate-pulse">
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          Discrepancy
                        </span>
                      )}
                      {row.status === 'Processing' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                          Processing
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 font-mono">{row.bookingId}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-200">{row.panditInitial}</div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{row.panditName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 text-right font-mono">₹{row.dakshina.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-sm text-slate-600 dark:text-slate-400">
                      {row.status === 'Discrepancy' && row.discrepancyStart ? (
                        <div className="flex flex-col items-end">
                          <span className="text-sm text-red-600 font-bold">₹{row.discrepancyStart}</span>
                          <span className="text-[10px] text-slate-400 line-through">Claim: ₹{row.discrepancyClaim}</span>
                        </div>
                      ) : (
                        `₹${row.travel}`
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 text-right font-mono">{row.food > 0 ? `₹${row.food}` : '--'}</td>
                    <td className="py-3 px-4 text-sm text-red-500 text-right font-mono">-₹{row.platformFee}</td>
                    <td className={`py-3 px-4 text-sm font-bold text-right font-mono bg-[#0f49bd]/5 dark:bg-[#0f49bd]/10 border-l border-[#0f49bd]/10 group-hover:bg-[#0f49bd]/10 dark:group-hover:bg-[#0f49bd]/20 ${row.status === 'Processing' ? 'text-slate-400 opacity-50' : 'text-[#0f49bd] dark:text-blue-400'}`}>
                      ₹{row.netPayout.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <button className="p-1 text-slate-400 hover:text-[#0f49bd] transition-colors" title="View Details">
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination & Action */}
          <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex items-center justify-between shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing {filteredPayouts.length} items
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right flex flex-col justify-center">
                <span className="text-xs text-slate-500 dark:text-slate-400">Selected for Payment</span>
                <span className="text-lg font-bold text-[#0f49bd] dark:text-blue-400">₹{totalSelected.toLocaleString()}</span>
              </div>
              <button
                disabled={selectedIds.size === 0}
                className="bg-[#0f49bd] hover:bg-[#0a3690] text-white px-6 py-2.5 rounded-lg shadow-md shadow-[#0f49bd]/20 flex items-center gap-2 font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">payments</span>
                Approve Batch ({selectedIds.size})
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
