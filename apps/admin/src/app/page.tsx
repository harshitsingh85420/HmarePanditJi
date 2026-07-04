"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_TOKEN_KEY } from "@hmarepanditji/utils";

interface DashboardStats {
  todaysBookings: number;
  pendingVerifications: number;
  pendingPayouts: {
    count: number;
    amount: number;
  };
  onlinePandits: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${baseUrl}/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error?.message || "Failed to load dashboard statistics");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">System Dashboard</h2>
        <p className="text-slate-500 mt-1">Overview of platform activities and queues</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center font-medium text-slate-500">Loading dashboard stats...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Pending Verifications */}
          <div 
            onClick={() => router.push("/verifications")}
            className="p-6 bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md rounded-xl transition cursor-pointer flex flex-col justify-between h-40"
          >
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block">Pending Verifications</span>
              <p className="text-4xl font-black text-slate-800 mt-2">{stats?.pendingVerifications || 0}</p>
            </div>
            <div className="text-xs text-blue-600 font-semibold flex items-center gap-1">
              View queue &rarr;
            </div>
          </div>

          {/* Card 2: Pending Payouts */}
          <div 
            onClick={() => router.push("/payouts")}
            className="p-6 bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md rounded-xl transition cursor-pointer flex flex-col justify-between h-40"
          >
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block">Pending Payouts</span>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-4xl font-black text-slate-800">{stats?.pendingPayouts?.count || 0}</p>
                <p className="text-sm font-bold text-leaf-600">₹{(stats?.pendingPayouts?.amount || 0).toLocaleString("en-IN")}</p>
              </div>
            </div>
            <div className="text-xs text-blue-600 font-semibold flex items-center gap-1">
              Process payouts &rarr;
            </div>
          </div>

          {/* Card 3: Today's Bookings */}
          <div 
            onClick={() => router.push("/bookings")}
            className="p-6 bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md rounded-xl transition cursor-pointer flex flex-col justify-between h-40"
          >
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block">Today's Bookings</span>
              <p className="text-4xl font-black text-slate-800 mt-2">{stats?.todaysBookings || 0}</p>
            </div>
            <div className="text-xs text-blue-600 font-semibold flex items-center gap-1">
              Monitor bookings &rarr;
            </div>
          </div>

          {/* Card 4: Online Pandits */}
          <div 
            onClick={() => router.push("/pandits")}
            className="p-6 bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md rounded-xl transition cursor-pointer flex flex-col justify-between h-40"
          >
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block">Online Pandits</span>
              <p className="text-4xl font-black text-green-600 mt-2">{stats?.onlinePandits || 0}</p>
            </div>
            <div className="text-xs text-blue-600 font-semibold flex items-center gap-1">
              View directory &rarr;
            </div>
          </div>

        </div>
      )}

      {/* Helpful Quick Links */}
      <div className="bg-slate-50 border rounded-xl p-6">
        <h3 className="font-bold text-slate-800 mb-4">Quick Operations Guide</h3>
        <ul className="text-sm text-slate-600 space-y-2">
          <li>• To verify new Pandits, go to <span className="font-semibold text-blue-600 hover:underline cursor-pointer" onClick={() => router.push("/verifications")}>Verifications</span>. Approval is instant, and rejection sends a selected Hindi reason to their app.</li>
          <li>• Review completed pujas and complete pending bank payouts under the <span className="font-semibold text-blue-600 hover:underline cursor-pointer" onClick={() => router.push("/payouts")}>Payouts</span> queue.</li>
          <li>• Monitor all customer bookings, assign transit details, or cancel active requests inside the <span className="font-semibold text-blue-600 hover:underline cursor-pointer" onClick={() => router.push("/bookings")}>Booking Monitor</span>.</li>
          <li>• Toggle or force online/offline states for any system Pandit inside the <span className="font-semibold text-blue-600 hover:underline cursor-pointer" onClick={() => router.push("/pandits")}>Pandit Directory</span>.</li>
        </ul>
      </div>
    </div>
  );
}
