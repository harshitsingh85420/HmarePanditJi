"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

interface Applicant {
  id: string;
  appId: string;
  name: string;
  location: string;
  time: string;
  riskScore: number;
  expertiseScore: number;
  phone: string;
  status: "PENDING" | "REVIEW";
}

const APPLICANTS: Applicant[] = [
  { id: "1", appId: "APID-00241", name: "Ramesh Kumar Sharma", location: "Varanasi, UP", time: "2h ago", riskScore: 12, expertiseScore: 94, phone: "+91 98765 43210", status: "PENDING" },
  { id: "2", appId: "APID-00240", name: "Suresh Mishra", location: "Delhi, NCR", time: "4h ago", riskScore: 28, expertiseScore: 87, phone: "+91 87654 32109", status: "PENDING" },
  { id: "3", appId: "APID-00239", name: "Dinesh Tiwari", location: "Noida, UP", time: "6h ago", riskScore: 45, expertiseScore: 72, phone: "+91 76543 21098", status: "PENDING" },
  { id: "4", appId: "APID-00238", name: "Mahesh Pandey", location: "Gurgaon, HR", time: "8h ago", riskScore: 65, expertiseScore: 61, phone: "+91 65432 10987", status: "PENDING" },
  { id: "5", appId: "APID-00237", name: "Ganesh Dubey", location: "Lucknow, UP", time: "10h ago", riskScore: 8, expertiseScore: 91, phone: "+91 54321 09876", status: "REVIEW" },
  { id: "6", appId: "APID-00236", name: "Rajesh Shastri", location: "Prayagraj, UP", time: "12h ago", riskScore: 33, expertiseScore: 78, phone: "+91 43210 98765", status: "REVIEW" },
];

function riskColor(score: number) {
  if (score < 30) return "text-green-600";
  if (score < 60) return "text-orange-500";
  return "text-red-500";
}

function riskBarColor(score: number) {
  if (score < 30) return "bg-green-500";
  if (score < 60) return "bg-orange-500";
  return "bg-red-500";
}

export default function VerificationPage() {
  const [activeTab, setActiveTab] = useState<"PENDING" | "REVIEW">("PENDING");
  const [selectedId, setSelectedId] = useState("1");
  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const filteredApplicants = APPLICANTS.filter(
    (a) =>
      a.status === activeTab &&
      (a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.appId.toLowerCase().includes(search.toLowerCase()))
  );

  const selected = APPLICANTS.find((a) => a.id === selectedId) ?? APPLICANTS[0];

  const pendingCount = APPLICANTS.filter((a) => a.status === "PENDING").length;
  const reviewCount = APPLICANTS.filter((a) => a.status === "REVIEW").length;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleDecision = async (decision: "APPROVE" | "REJECT" | "REQUEST_INFO") => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/admin/pandits/${selected.id}/verify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, note }),
      });
    } catch {
      // dev mode
    } finally {
      setLoading(false);
      const msgs = {
        APPROVE: `✓ ${selected.name} approved successfully`,
        REJECT: `✗ ${selected.name} rejected`,
        REQUEST_INFO: `📋 Info requested from ${selected.name}`,
      };
      showToast(msgs[decision]);
      setNote("");
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      {/* ── Left Sidebar ──────────────────────────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">

        {/* Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
            <span className="material-symbols-outlined text-slate-400 text-lg leading-none">search</span>
            <input
              type="text"
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "PENDING"
                ? "bg-primary text-white"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            PENDING ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("REVIEW")}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "REVIEW"
                ? "bg-primary text-white"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            REVIEWS ({reviewCount})
          </button>
        </div>

        {/* Applicant List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {filteredApplicants.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">No applications</div>
          ) : (
            filteredApplicants.map((applicant) => {
              const isSelected = applicant.id === selectedId;
              return (
                <button
                  key={applicant.id}
                  onClick={() => setSelectedId(applicant.id)}
                  className={`w-full text-left p-4 transition-colors ${
                    isSelected
                      ? "bg-primary/5 border-l-4 border-primary"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800 border-l-4 border-transparent"
                  }`}
                >
                  {/* App ID + Time */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-primary" : "text-slate-400"}`}>
                      {applicant.appId}
                    </span>
                    <span className="text-[10px] text-slate-400">{applicant.time}</span>
                  </div>

                  {/* Avatar + Name + Location */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {applicant.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{applicant.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{applicant.location}</p>
                    </div>
                  </div>

                  {/* Risk Score */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Risk Score:</span>
                    <span className={`text-[11px] font-bold ${riskColor(applicant.riskScore)}`}>
                      {applicant.riskScore}/100
                    </span>
                    <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${riskBarColor(applicant.riskScore)} rounded-full`}
                        style={{ width: `${applicant.riskScore}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Right Detail Panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-background-dark">

        {/* Detail Header */}
        <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-slate-600 dark:text-slate-300">verified_user</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{selected.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[14px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Application Complete
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <span className="material-symbols-outlined text-[14px] leading-none">location_on</span>
                  {selected.location}
                </span>
                <span className="text-xs text-slate-400">{selected.phone}</span>
              </div>
            </div>
          </div>

          {/* Expertise Score */}
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Expertise Score</p>
            <p className="text-4xl font-black text-primary leading-tight">{selected.expertiseScore}/100</p>
          </div>
        </div>

        {/* Verification Panels — scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">

            {/* 1. Aadhaar Verification */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500 text-xl leading-none">badge</span>
                  <h2 className="font-semibold text-slate-900 dark:text-white">Aadhaar Verification</h2>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 rounded-full">MATCH FOUND</span>
              </div>

              <div className="space-y-3 mb-4">
                {[
                  { label: "ID Number", value: "XXXX XXXX 8291" },
                  { label: "Name Match", value: "98% ✓", green: true },
                  { label: "DOB Verification", value: "Verified ✓", green: true },
                  { label: "Address", value: `${selected.location}` },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{row.label}</span>
                    <span className={`font-semibold ${row.green ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-white"}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Document preview */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="w-10 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-slate-400 text-base leading-none">description</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">aadhaar_front.jpg</p>
                  <p className="text-[10px] text-slate-400">OCR Confidence: 96.4%</p>
                </div>
                <button className="text-xs font-bold text-primary hover:text-primary/80 border border-primary/20 px-2.5 py-1 rounded-lg">
                  VIEW
                </button>
              </div>
            </div>

            {/* 2. Video KYC */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500 text-xl leading-none">videocam</span>
                  <h2 className="font-semibold text-slate-900 dark:text-white">Video KYC &amp; Phonetics</h2>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">AI Score: 78/100</span>
              </div>

              {/* Video player placeholder */}
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden mb-3 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <button className="relative z-10 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-slate-800 text-2xl leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                </button>
                <div className="absolute bottom-2 left-2 right-2 h-1 bg-white/20 rounded-full">
                  <div className="h-full bg-primary rounded-full w-1/3" />
                </div>
              </div>

              {/* AI assessment */}
              <p className="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800 rounded-lg p-3 leading-relaxed">
                &ldquo;Mantra pronunciation clarity is high. Pandit demonstrates strong knowledge of Vedic rituals. Voice confidence score: 82/100. Recommended for approval.&rdquo;
              </p>
            </div>
          </div>

          {/* 3. Academic Credentials — full width */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500 text-xl leading-none">workspace_premium</span>
                <h2 className="font-semibold text-slate-900 dark:text-white">Academic Credentials</h2>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined text-slate-500 text-base leading-none">zoom_in</span>
                </button>
                <button className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined text-slate-500 text-base leading-none">download</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* Certificate preview */}
              <div className="relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 h-40">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-5xl">description</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-white text-xs font-semibold">Kashi Vishwavidyalaya</p>
                  <p className="text-white/70 text-[10px]">Jyotish Shastra — 2014</p>
                </div>
              </div>

              {/* Verification details */}
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20">
                  <p className="text-xs font-semibold text-primary mb-1">Institution Verified</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Kashi Vishwavidyalaya, Varanasi — UGC Recognized</p>
                </div>

                <div className="space-y-2">
                  {[
                    { label: "Certificate Authenticity", done: true },
                    { label: "Institution Database Match", done: true },
                    { label: "Graduate Registry Check", done: true },
                    { label: "Anti-forgery Scan", done: false },
                  ].map((check) => (
                    <div key={check.label} className="flex items-center gap-2">
                      <span
                        className={`material-symbols-outlined text-base leading-none ${check.done ? "text-green-500" : "text-slate-300"}`}
                        style={check.done ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        {check.done ? "check_circle" : "radio_button_unchecked"}
                      </span>
                      <span className={`text-xs ${check.done ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}`}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Background Check */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-purple-500 text-xl leading-none">gavel</span>
              <h2 className="font-semibold text-slate-900 dark:text-white">Background Check</h2>
            </div>

            <div className="flex flex-col items-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-green-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <p className="text-base font-bold text-green-600 dark:text-green-400">NO RECORDS FOUND</p>
              <p className="text-xs text-slate-400 mt-1 text-center max-w-xs">
                Checked against NCRB database, state police records, and court registry
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-slate-400">
                {["NCRB", "State Police", "Court Registry", "Interpol"].map((db) => (
                  <span key={db} className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-green-500 text-[12px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {db}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                LAST SYNC: {new Date().toLocaleDateString("en-IN")} 09:42 IST
              </span>
            </div>
          </div>
        </div>

        {/* ── Decision Footer ───────────────────────────────────────────────── */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          {/* Internal Note */}
          <div className="flex items-center gap-3 flex-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex-shrink-0">
              Internal Note:
            </label>
            <input
              type="text"
              placeholder="Add a note for this decision..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1 max-w-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDecision("REJECT")}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-500/20 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              REJECT
            </button>
            <button
              onClick={() => handleDecision("REQUEST_INFO")}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              REQUEST INFO
            </button>
            <button
              onClick={() => handleDecision("APPROVE")}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-base leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              )}
              APPROVE PANDIT
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold px-5 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  );
}
