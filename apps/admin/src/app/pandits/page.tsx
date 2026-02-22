"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function PanditVerificationQueue() {
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [pandits, setPandits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPending, setTotalPending] = useState(0);
  const [stats, setStats] = useState({ avgWaitHours: 0, oldestPendingDays: 0 });

  const fetchPandits = () => {
    setLoading(true);
    let query = `?status=${activeTab}&limit=20`;
    if (search.trim()) query += `&search=${encodeURIComponent(search)}`;

    fetch(`http://localhost:3001/api/admin/pandits${query}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPandits(data.data);
          if (data.meta?.totalPending !== undefined) {
            setTotalPending(data.meta.totalPending);
            setStats({
              avgWaitHours: data.meta.avgWaitHours || 0,
              oldestPendingDays: data.meta.oldestPendingDays || 0
            });
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPandits();
    }, 400); // debounce search
    return () => clearTimeout(timer);
  }, [activeTab, search]);

  const tabs = [
    { id: "pending", label: "📝 Pending Review", count: activeTab === "pending" ? totalPending : undefined },
    { id: "verified", label: "✅ Verified" },
    { id: "rejected", label: "❌ Rejected" },
    { id: "all", label: "All Pandits" },
  ];

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 mb-2">Pandit Verification Queue</h1>
          <p className="text-slate-500 font-medium">
            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{totalPending} pandits</span> awaiting review
            {totalPending > 0 && activeTab === "pending" && (
              <span className="ml-2 hidden sm:inline">| Average wait: {stats.avgWaitHours} hours | Oldest pending: {stats.oldestPendingDays} days</span>
            )}
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            type="text"
            placeholder="Search by name, phone or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-xl pl-10 pr-4 py-2.5 font-medium transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl inline-flex w-full overflow-x-auto no-scrollbar">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === t.id
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-100 ${activeTab === t.id && t.count > 0 ? "bg-red-100 text-red-700" : ""}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Pandit Name</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4 text-center">Documents</th>
                <th className="px-6 py-4 text-center">Video KYC</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 align-middle">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">Loading pandits...</td>
                </tr>
              ) : pandits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-4xl mb-3">📭</div>
                    <div className="text-slate-500 font-medium">No pandits found in this queue.</div>
                  </td>
                </tr>
              ) : (
                pandits.map((p, i) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{p.user?.name}</div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5 tracking-wider">
                        {p.user?.phone?.replace(/(\d{4})$/, 'XXXX')}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{p.location || "Unknown"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-xs">
                        {formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.documentUrls?.length >= 3 ? (
                        <span className="material-symbols-outlined text-green-500" title="All submitted">check_circle</span>
                      ) : p.documentUrls?.length > 0 ? (
                        <span className="material-symbols-outlined text-amber-500" title="Partial">warning</span>
                      ) : (
                        <span className="material-symbols-outlined text-slate-300" title="None">cancel</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.kycVideoUrl ? (
                        <span className="material-symbols-outlined text-green-500" title="Uploaded">verified</span>
                      ) : (
                        <span className="material-symbols-outlined text-slate-300" title="Pending">pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 pr-6">
                      <Link
                        href={`/pandits/${p.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-700 text-slate-700 font-bold rounded-lg shadow-sm w-full justify-center transition-all group-hover:bg-blue-50"
                      >
                        {activeTab === 'pending' ? 'Review' : 'View'}
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
