"use client";

import React, { useEffect, useState } from "react";
import { ADMIN_TOKEN_KEY } from "@hmarepanditji/utils";
import { usePresignedUrl } from "@/hooks/usePresignedUrl";

// ─────────────────────────────────────────────────────────────
// IDENTITY REVIEW QUEUE
//
// This screen used to call GET /admin/pandits?status=PENDING. PENDING is the
// schema DEFAULT — nothing uploaded — while a real Aadhaar submission writes
// DOCUMENTS_SUBMITTED. So submitting REMOVED the pandit from this queue and
// the only people listed were those with nothing to review.
//
// It now calls GET /admin/kyc/queue, whose membership is the single-source
// KYC_REVIEW_QUEUE_STATUSES set in @hmarepanditji/types.
// ─────────────────────────────────────────────────────────────

interface QueueRow {
  panditId: string;
  userId: string;
  displayName: string;
  phone: string;
  city: string;
  specializations: string[];
  verificationStatus: string;
  aadhaarFrontUrl: string | null;
  aadhaarBackUrl: string | null;
  videoKycUrl: string | null;
  aadhaarLastFour: string | null;
  aadhaarConsentAt: string | null;
  videoKycCompleted: boolean;
  hasBankAccount: boolean;
  hasUpi: boolean;
  submittedAt: string;
}

const REJECTION_REASONS = [
  "आधार फोटो साफ़ नहीं है",
  "जानकारी अधूरी है",
  "दस्तावेज़ मेल नहीं खाते"
];

export default function VerificationsPage() {
  const [pandits, setPandits] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  // Rejection modal state
  const [rejectingPanditId, setRejectingPanditId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${baseUrl}/admin/kyc/queue`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPandits(data.data?.queue || []);
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
    fetchQueue();
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
        fetchQueue();
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
        fetchQueue();
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
          onClick={fetchQueue}
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
          No submitted documents awaiting review.
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
                  <th className="px-6 py-4">Video KYC</th>
                  <th className="px-6 py-4">Payment Methods</th>
                  <th className="px-6 py-4">Submitted At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pandits.map((p) => (
                  <tr key={p.panditId} className="hover:bg-slate-50/80 text-sm text-slate-700">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {p.displayName || "N/A"}
                      <div className="text-[11px] font-medium text-amber-600 mt-0.5">{p.verificationStatus}</div>
                    </td>
                    <td className="px-6 py-4 font-mono">{p.phone || "N/A"}</td>
                    <td className="px-6 py-4">{p.city || "N/A"}</td>
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
                      <div className="flex items-center gap-2">
                        <DocThumb label="Front" keyOrUrl={p.aadhaarFrontUrl} onOpen={setSelectedDoc} />
                        <DocThumb label="Back" keyOrUrl={p.aadhaarBackUrl} onOpen={setSelectedDoc} />
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 font-mono">
                        {p.aadhaarLastFour ? `XXXX XXXX ${p.aadhaarLastFour}` : "no number"}
                      </div>
                      <div className={`text-[11px] font-semibold ${p.aadhaarConsentAt ? "text-green-600" : "text-red-500"}`}>
                        {p.aadhaarConsentAt ? "consent recorded" : "NO CONSENT"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {p.videoKycUrl ? (
                        <button
                          onClick={() => setSelectedDoc(p.videoKycUrl)}
                          className="px-2 py-1 bg-slate-800 text-white text-[11px] font-bold rounded"
                        >
                          Play
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">none</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${p.hasBankAccount ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                          Bank {p.hasBankAccount ? "✓" : "✗"}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${p.hasUpi ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                          UPI {p.hasUpi ? "✓" : "✗"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{p.submittedAt ? new Date(p.submittedAt).toLocaleString() : "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleApprove(p.panditId)}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3 py-1.5 rounded transition"
                        >
                          APPROVE
                        </button>
                        <button
                          onClick={() => setRejectingPanditId(p.panditId)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-3 py-1.5 rounded transition"
                        >
                          REJECT
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Document Full View Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-xl overflow-hidden max-w-3xl w-full flex flex-col shadow-2xl relative">
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute top-4 right-4 bg-slate-900/60 hover:bg-slate-900/80 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition"
            >
              ✕
            </button>
            <div className="p-2 flex items-center justify-center max-h-[80vh] overflow-auto bg-slate-100">
              <PresignedFullImage keyOrUrl={selectedDoc} />
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

function DocThumb({ label, keyOrUrl, onOpen }: { label: string; keyOrUrl: string | null; onOpen: (u: string) => void }) {
  if (!keyOrUrl) {
    return (
      <span className="text-red-500 font-medium text-[11px] w-12 h-12 border border-dashed border-red-200 rounded flex items-center justify-center text-center leading-tight">
        {label}<br />missing
      </span>
    );
  }
  return <LoadedThumb label={label} keyOrUrl={keyOrUrl} onOpen={onOpen} />;
}

function LoadedThumb({ label, keyOrUrl, onOpen }: { label: string; keyOrUrl: string; onOpen: (u: string) => void }) {
  const { url, refresh } = usePresignedUrl(keyOrUrl);
  if (!url) return <span className="text-slate-400 text-xs w-12 h-12 flex items-center justify-center">…</span>;
  return (
    <button
      onClick={() => onOpen(keyOrUrl)}
      title={label}
      className="w-12 h-12 border rounded hover:scale-105 transition-transform overflow-hidden relative"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={`Aadhaar ${label}`} className="w-full h-full object-cover" onError={() => refresh()} />
    </button>
  );
}

function PresignedFullImage({ keyOrUrl }: { keyOrUrl: string }) {
  const { url, refresh } = usePresignedUrl(keyOrUrl);
  if (!url) return <span className="text-slate-400">Loading…</span>;
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) {
    return <video src={url} controls className="max-w-full max-h-[75vh] rounded bg-black" />;
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={url} alt="Identity document" className="max-w-full max-h-[75vh] object-contain rounded" onError={() => refresh()} />
  );
}
