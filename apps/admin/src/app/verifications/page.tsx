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
  createdAt: string;
  aadhaarDocUrl: string;
  aadhaarFrontUrl: string;
  bankAccountNumber: string;
  upiId: string;
  user: User;
}

const REJECTION_REASONS = [
  "आधार फोटो साफ़ नहीं है",
  "जानकारी अधूरी है",
  "दस्तावेज़ मेल नहीं खाते"
];

export default function VerificationsPage() {
  const [pandits, setPandits] = useState<PanditProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAadhaar, setSelectedAadhaar] = useState<string | null>(null);
  
  // Rejection modal state
  const [rejectingPanditId, setRejectingPanditId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);

  const fetchPendingQueue = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${baseUrl}/admin/pandits?status=PENDING`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPandits(data.data || []);
      } else {
        setError(data.error?.message || "Failed to load verifications queue");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load verifications queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingQueue();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this Pandit?")) return;
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${baseUrl}/admin/pandits/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert("Approved successfully");
        fetchPendingQueue();
      } else {
        alert(data.error?.message || "Approve failed");
      }
    } catch (err) {
      console.error(err);
      alert("Approve failed");
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingPanditId) return;
    setSubmittingReject(true);
    const finalReason = customReason.trim() ? `${selectedReason} - ${customReason.trim()}` : selectedReason;
    
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${baseUrl}/admin/pandits/${rejectingPanditId}/reject`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ reason: finalReason })
      });
      const data = await res.json();
      if (data.success) {
        alert("Rejected successfully");
        setRejectingPanditId(null);
        setCustomReason("");
        fetchPendingQueue();
      } else {
        alert(data.error?.message || "Reject failed");
      }
    } catch (err) {
      console.error(err);
      alert("Reject failed");
    } finally {
      setSubmittingReject(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Verification Requests ({pandits.length})</h2>
        <button 
          onClick={fetchPendingQueue} 
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition"
        >
          Refresh Queue
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center font-medium text-slate-500">Loading queue...</div>
      ) : pandits.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-slate-500 font-medium">
          No pending verifications in queue.
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
                  <th className="px-6 py-4">Aadhaar</th>
                  <th className="px-6 py-4">Payment Methods</th>
                  <th className="px-6 py-4">Submitted At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pandits.map((p) => {
                  const hasBank = !!p.bankAccountNumber;
                  const hasUpi = !!p.upiId;
                  const aadhaarUrl = p.aadhaarDocUrl || p.aadhaarFrontUrl;
                  
                  return (
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
                        {aadhaarUrl ? (
                          <button 
                            onClick={() => setSelectedAadhaar(aadhaarUrl)}
                            className="w-12 h-12 border rounded hover:scale-105 transition-transform overflow-hidden relative"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={aadhaarUrl} alt="Aadhaar doc" className="w-full h-full object-cover" />
                          </button>
                        ) : (
                          <span className="text-red-500 font-medium">Missing</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${hasBank ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                            Bank {hasBank ? "✓" : "✗"}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${hasUpi ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                            UPI {hasUpi ? "✓" : "✗"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => handleApprove(p.id)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3 py-1.5 rounded transition"
                          >
                            APPROVE
                          </button>
                          <button 
                            onClick={() => setRejectingPanditId(p.id)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-3 py-1.5 rounded transition"
                          >
                            REJECT
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Aadhaar Full Image Modal */}
      {selectedAadhaar && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-xl overflow-hidden max-w-3xl w-full flex flex-col shadow-2xl relative">
            <button 
              onClick={() => setSelectedAadhaar(null)}
              className="absolute top-4 right-4 bg-slate-900/60 hover:bg-slate-900/80 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition"
            >
              ✕
            </button>
            <div className="p-2 flex items-center justify-center max-h-[80vh] overflow-auto bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedAadhaar} alt="Full Aadhaar" className="max-w-full max-h-[75vh] object-contain rounded" />
            </div>
          </div>
        </div>
      )}

      {/* Rejection reasoning modal */}
      {rejectingPanditId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-xl p-6 max-w-md w-full flex flex-col shadow-2xl gap-4">
            <h3 className="text-lg font-bold text-slate-800">Select Rejection Reason</h3>
            
            <div className="flex flex-col gap-2">
              {REJECTION_REASONS.map((reason) => (
                <label 
                  key={reason} 
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${selectedReason === reason ? "border-red-500 bg-red-50/50" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <input 
                    type="radio" 
                    name="rejection_reason" 
                    value={reason} 
                    checked={selectedReason === reason} 
                    onChange={() => setSelectedReason(reason)}
                    className="accent-red-500"
                  />
                  <span className="font-semibold text-slate-700">{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Additional / Custom Reason</label>
              <textarea 
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Optional extra comments..."
                rows={3}
                className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3 justify-end mt-2">
              <button 
                onClick={() => setRejectingPanditId(null)}
                className="px-4 py-2 hover:bg-slate-100 font-bold text-sm rounded-lg text-slate-600 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleRejectSubmit}
                disabled={submittingReject}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded-lg shadow-lg shadow-red-500/20 transition disabled:opacity-50"
              >
                {submittingReject ? "Submitting..." : "Submit Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
