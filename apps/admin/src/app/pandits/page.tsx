"use client";

import React, { useEffect, useState } from "react";
import { ADMIN_TOKEN_KEY } from "@hmarepanditji/utils";

interface User {
  name: string;
  phone: string;
}

interface PanditProfile {
  id: string;
  fullName: string;
  city: string;
  location: string;
  specializations: string[];
  verificationStatus: string;
  isOnline: boolean;
  baseDakshina: number;
  hasSamagriConfig: boolean;
  createdAt: string;
  user: User;
}

export default function PanditsDirectoryPage() {
  const [pandits, setPandits] = useState<PanditProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchPandits = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      
      const queryParams = new URLSearchParams();
      if (statusFilter !== "ALL") queryParams.append("status", statusFilter);
      if (search) queryParams.append("search", search);

      const res = await fetch(`${baseUrl}/admin/pandits?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPandits(data.data?.data || data.data || []);
      } else {
        setError(data.error?.message || "Failed to load pandits directory");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load pandits directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPandits();
  }, [statusFilter]);

  const handleForceOffline = async (id: string) => {
    if (!confirm("Are you sure you want to force this Pandit offline?")) return;
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${baseUrl}/admin/pandits/${id}/force-offline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert("Pandit forced offline successfully");
        fetchPandits();
      } else {
        alert(data.error?.message || "Action failed");
      }
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-xl font-bold text-slate-800">Pandit Directory ({pandits.length})</h2>
        <button
          onClick={fetchPandits}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition"
        >
          Refresh Directory
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase">Search by Name/Phone</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button 
              onClick={fetchPandits}
              className="px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
            >
              Go
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase">Verification Status</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="VERIFIED">Verified</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center font-medium text-slate-500">Loading pandits...</div>
      ) : pandits.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-slate-500 font-medium">
          No pandits found in directory.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Pandit Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">City</th>
                  <th className="px-6 py-4">Specializations</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4">Online Status</th>
                  <th className="px-6 py-4">Dakshina Config</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pandits.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 text-sm text-slate-700">
                    <td className="px-6 py-4 font-bold text-slate-900">{p.fullName || p.user?.name || "N/A"}</td>
                    <td className="px-6 py-4 font-mono">{p.user?.phone || "N/A"}</td>
                    <td className="px-6 py-4">{p.city || p.location || "N/A"}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {p.specializations?.map((s) => (
                          <span key={s} className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        p.verificationStatus === "APPROVED" || p.verificationStatus === "VERIFIED" ? "bg-green-100 text-green-700" :
                        p.verificationStatus === "REJECTED" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {p.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                        p.isOnline ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {p.isOnline ? "Online 🟢" : "Offline 🔴"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium text-slate-600">
                        Base: ₹{p.baseDakshina || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.isOnline ? (
                        <button
                          onClick={() => handleForceOffline(p.id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-3 py-1.5 rounded transition"
                        >
                          FORCE OFFLINE
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
