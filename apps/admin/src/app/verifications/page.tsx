"use client";

import React, { useEffect, useState } from "react";
import { ADMIN_TOKEN_KEY } from "@hmarepanditji/utils";
import { usePresignedUrl } from "@/hooks/usePresignedUrl";
// NEXT_PUBLIC_API_URL is an ORIGIN on Vercel. Reading it raw and appending a
// route 404s. The 308 shim covers only /auth/* /pandit/* /pandits/* /voice/* —
// never /admin/*, /bookings, /customers, /muhurat, /reviews, or bare /pandits.
import { resolveApiBase } from "@hmarepanditji/utils";
import PoojaQueue from "./PoojaQueue";
import { IDENTITY_REJECTION_REASONS, OTHER_CODE } from "@hmarepanditji/types";

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

// THE LOCAL LIST IS GONE. These three were Devanagari, which was better than
// most — but they were POSTed as free text, and the modal's custom field beside
// them accepted anything. A runtime-typed reason is invisible to every register
// guard in this repo. The set now lives in packages/types with the pandit-facing
// Hindi attached to each code.

export default function VerificationsPage() {
  const [pandits, setPandits] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  // Rejection modal state
  const [rejectingPanditId, setRejectingPanditId] = useState<string | null>(null);
  const [reasonCode, setReasonCode] = useState(IDENTITY_REJECTION_REASONS[0].code);
  const [otherText, setOtherText] = useState("");
  const [tab, setTab] = useState<"identity" | "pooja">("identity");
  const [submittingReject, setSubmittingReject] = useState(false);
  // In-page confirmation + status. See the comment on handleApprove: native
  // dialogs are suppressible without a trace, so neither the confirmation nor
  // the outcome may live in one.
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
      const baseUrl = resolveApiBase(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NODE_ENV === "development",
).base;
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

  // NO NATIVE DIALOGS ON THE ACTION PATH (2026-07-31).
  //
  // THE DEFECT THIS FIXES: approve was gated on `confirm()` and reject was
  // not. A browser that suppresses dialogs — Chrome's "prevent this page
  // from creating additional dialogs" checkbox, and several embedded/
  // automation contexts — makes `confirm()` return FALSE with no prompt and
  // no error. The handler then returns before the fetch: no network request,
  // no message, a button that does nothing. Reject, having no dialog, kept
  // working — which is exactly the symptom reported from production.
  //
  // A native dialog is an out-of-page control whose suppression is invisible
  // to the page: the dead-control class, one layer up. Confirmation now lives
  // in the page, like the rejection modal beside it, so it cannot be
  // suppressed by anything the page cannot see.
  const handleApprove = async (id: string) => {
    setApprovingId(null);
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
      const baseUrl = resolveApiBase(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NODE_ENV === "development",
).base;
      const res = await fetch(`${baseUrl}/admin/pandits/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotice({ kind: "ok", text: "Identity VERIFIED — the pandit is now live in customer search." });
        fetchQueue();
      } else {
        // The server's own words, verbatim and ON SCREEN. `alert()` here was
        // the same suppression hazard as the confirm above: a failure the
        // operator never sees is indistinguishable from a button that does
        // nothing, which is how this took a live walk to find.
        setNotice({ kind: "err", text: data.error?.message || data.message || `Approve failed (HTTP ${res.status})` });
      }
    } catch (err) {
      console.error(err);
      setNotice({ kind: "err", text: "Approve failed — the request did not complete. Check the network tab." });
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingPanditId) return;
    setSubmittingReject(true);

    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
      const baseUrl = resolveApiBase(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NODE_ENV === "development",
).base;
      const res = await fetch(`${baseUrl}/admin/pandits/${rejectingPanditId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reasonCode, otherText: reasonCode === OTHER_CODE ? otherText : undefined })
      });
      const data = await res.json();
      if (data.success) {
        setNotice({ kind: "ok", text: "Rejected — the pandit has been told, in Hindi, why." });
        setRejectingPanditId(null);
        setOtherText("");
        setReasonCode(IDENTITY_REJECTION_REASONS[0].code);
        fetchQueue();
      } else {
        setNotice({ kind: "err", text: data.error?.message || data.message || `Reject failed (HTTP ${res.status})` });
      }
    } catch (err) {
      console.error(err);
      setNotice({ kind: "err", text: "Reject failed — the request did not complete." });
    } finally {
      setSubmittingReject(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ── TWO QUEUES, TWO CLAIMS ────────────────────────────────────────────
          Kept visually and verbally distinct on purpose. Identity is OUR claim
          about a person, made after a human reads an Aadhaar; the sample video
          is the FAMILY'S judgement about one recording. One tab must never
          read as a stronger or weaker version of the other, and the word
          "verified" appears only on the identity side. */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setTab("identity")}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition ${tab === "identity" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          Identity &middot; Aadhaar
        </button>
        <button
          onClick={() => setTab("pooja")}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition ${tab === "pooja" ? "border-amber-600 text-amber-700" : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          Ceremony videos
        </button>
      </div>

      {tab === "pooja" ? (
        <PoojaQueue />
      ) : (
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Identity checks &mdash; Aadhaar ({pandits.length})</h2>
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

      {notice && (
        <div
          className={`p-4 rounded-lg border flex items-start justify-between gap-4 ${notice.kind === "ok" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-700"}`}
        >
          <span className="font-semibold text-sm">{notice.text}</span>
          <button onClick={() => setNotice(null)} className="text-xs font-bold opacity-60 hover:opacity-100">
            DISMISS
          </button>
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
                          onClick={() => setApprovingId(p.panditId)}
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
      </div>
      )}

      {approvingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-xl p-6 max-w-md w-full flex flex-col shadow-2xl gap-4">
            <h3 className="text-lg font-bold text-slate-800">Mark this identity VERIFIED?</h3>
            {/* THE SENTENCE THE PLATFORM IS ABOUT TO SAY, IN ITS OWN VOICE.
                VERIFIED is an ops action: it records WHO pressed this and
                WHEN, and it puts the pandit in front of customers. The
                operator should read what he is asserting before he asserts
                it — that is what a confirmation is FOR, and it is why this
                one cannot be allowed to live in a suppressible dialog. */}
            <p className="text-sm text-slate-600 leading-relaxed">
              You are stating that <strong>you have looked at this person&rsquo;s Aadhaar
              documents</strong> and that they belong to him. Your admin id and the time are
              recorded on the row. He becomes visible in customer search immediately.
            </p>
            <div className="flex gap-3 justify-end mt-2">
              <button
                onClick={() => setApprovingId(null)}
                className="px-4 py-2 hover:bg-slate-100 font-bold text-sm rounded-lg text-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(approvingId)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg shadow-lg shadow-green-600/20 transition"
              >
                Yes — mark VERIFIED
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectingPanditId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-xl p-6 max-w-md w-full flex flex-col shadow-2xl gap-4">
            <h3 className="text-lg font-bold text-slate-800">Select Rejection Reason</h3>

            <div className="flex flex-col gap-2">
              {IDENTITY_REJECTION_REASONS.map((r) => (
                <label
                  key={r.code}
                  className={`flex flex-col gap-1 p-3 border rounded-lg cursor-pointer transition ${reasonCode === r.code ? "border-red-500 bg-red-50/50" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="rejection_reason"
                      value={r.code}
                      checked={reasonCode === r.code}
                      onChange={() => setReasonCode(r.code)}
                      className="accent-red-500"
                    />
                    <span className="font-semibold text-slate-700">{r.adminLabel}</span>
                  </span>
                  {/* HE READS THIS, NOT YOUR LABEL. Ops must see the exact Hindi
                      that lands on his phone before sending it — otherwise the
                      label and the message can drift apart unnoticed. */}
                  {r.panditText && (
                    <span className="pl-7 text-[13px] text-slate-500">{r.panditText}</span>
                  )}
                </label>
              ))}
            </div>

            {reasonCode === OTHER_CODE && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Write it in Hindi — he reads this exactly as typed
                </label>
                <textarea
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="कागज़ की तस्वीर में …"
                  rows={3}
                  className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {!otherText.trim() && (
                  <span className="text-xs text-slate-500">Type the Hindi reason first — then you can send.</span>
                )}
              </div>
            )}

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
