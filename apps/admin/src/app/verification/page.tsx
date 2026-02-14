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
  aadhaar: {
    number: string;
    match: number;
    dobVerified: boolean;
    addressMatch: boolean;
  };
  kyc: {
    score: number;
    comments: string;
    phonetics: { time: string; label: string; note: string }[];
  };
  academic: {
    qualification: string;
    institution: string;
    year: string;
    verified: boolean;
    checks: { label: string; done: boolean }[];
  };
  background: {
    recordsFound: boolean;
    checks: string[];
  };
}

const APPLICANTS: Applicant[] = [
  {
    id: "1", appId: "APID-00241", name: "Ramesh Kumar Sharma", location: "Varanasi, UP", time: "2h ago", riskScore: 12, expertiseScore: 94, phone: "+91 98765 43210", status: "PENDING",
    aadhaar: { number: "XXXX XXXX 8291", match: 98, dobVerified: true, addressMatch: true },
    kyc: {
      score: 78,
      comments: "Mantra pronunciation clarity is high. Minor dialect variations noted.",
      phonetics: [
        { time: "00:45", label: "High Confidence", note: "Gayatri Mantra recital clarity is exceptionally high." },
        { time: "01:22", label: "Standard", note: "Sanskrit diction flow is consistent with traditional Varanasi school." },
        { time: "02:15", label: "Note", note: "Visual presence: Calm and professional." }
      ]
    },
    academic: {
      qualification: "Acharya (Masters in Vedic Studies)", institution: "Sampurnanand Sanskrit Vishwavidyalaya", year: "June 2022", verified: true,
      checks: [
        { label: "Certificate Authenticity", done: true },
        { label: "Institution Database Match", done: true },
        { label: "Graduate Registry Check", done: true },
        { label: "Anti-forgery Scan", done: false },
      ]
    },
    background: { recordsFound: false, checks: ["NCRB", "State Police", "Court Registry", "Interpol"] }
  },
  {
    id: "2", appId: "APID-00240", name: "Suresh Mishra", location: "Delhi, NCR", time: "4h ago", riskScore: 28, expertiseScore: 87, phone: "+91 87654 32109", status: "PENDING",
    aadhaar: { number: "XXXX XXXX 1122", match: 92, dobVerified: true, addressMatch: true },
    kyc: {
      score: 65,
      comments: "Good knowledge but slight hesitation in complex shlokas.",
      phonetics: []
    },
    academic: {
      qualification: "Shastri", institution: "BHU", year: "2018", verified: true,
      checks: [
        { label: "Certificate Authenticity", done: true },
        { label: "Institution Database Match", done: true }
      ]
    },
    background: { recordsFound: false, checks: ["NCRB", "State Police"] }
  },
  { id: "3", appId: "APID-00239", name: "Dinesh Tiwari", location: "Noida, UP", time: "6h ago", riskScore: 45, expertiseScore: 72, phone: "+91 76543 21098", status: "PENDING", aadhaar: {} as any, kyc: {} as any, academic: {} as any, background: {} as any },
  { id: "4", appId: "APID-00238", name: "Mahesh Pandey", location: "Gurgaon, HR", time: "8h ago", riskScore: 65, expertiseScore: 61, phone: "+91 65432 10987", status: "PENDING", aadhaar: {} as any, kyc: {} as any, academic: {} as any, background: {} as any },
  { id: "5", appId: "APID-00237", name: "Ganesh Dubey", location: "Lucknow, UP", time: "10h ago", riskScore: 8, expertiseScore: 91, phone: "+91 54321 09876", status: "REVIEW", aadhaar: {} as any, kyc: {} as any, academic: {} as any, background: {} as any },
  { id: "6", appId: "APID-00236", name: "Rajesh Shastri", location: "Prayagraj, UP", time: "12h ago", riskScore: 33, expertiseScore: 78, phone: "+91 43210 98765", status: "REVIEW", aadhaar: {} as any, kyc: {} as any, academic: {} as any, background: {} as any },
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
    // Simulating API call
    setTimeout(() => {
      setLoading(false);
      const msgs = {
        APPROVE: `✓ ${selected.name} approved successfully`,
        REJECT: `✗ ${selected.name} rejected`,
        REQUEST_INFO: `📋 Info requested from ${selected.name}`,
      };
      showToast(msgs[decision]);
      setNote("");
    }, 1000);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden font-display bg-[#f6f7f8] dark:bg-[#101922]">

      {/* ── Left Sidebar (Queue) ────────────────────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-10">

        {/* Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
            <input
              type="text"
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#137fec] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0">
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`flex-1 py-1.5 rounded text-xs font-semibold transition-colors ${activeTab === "PENDING"
                ? "bg-[#137fec] text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            PENDING ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("REVIEW")}
            className={`flex-1 py-1.5 rounded text-xs font-semibold transition-colors ${activeTab === "REVIEW"
                ? "bg-[#137fec] text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
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
                  className={`w-full text-left p-4 transition-colors ${isSelected
                      ? "bg-[#137fec]/5 border-l-4 border-[#137fec]"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent"
                    }`}
                >
                  {/* App ID + Time */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-[#137fec]" : "text-slate-400"}`}>
                      {applicant.appId}
                    </span>
                    <span className="text-xs text-slate-500">{applicant.time}</span>
                  </div>

                  {/* Avatar + Name + Location */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold text-sm flex-shrink-0">
                      {applicant.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{applicant.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{applicant.location}</p>
                    </div>
                  </div>

                  {/* Risk Score */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-slate-500">Risk Score:</span>
                      <span className={`text-xs font-bold ${riskColor(applicant.riskScore)}`}>
                        {applicant.riskScore}/100
                      </span>
                    </div>
                    <div className="w-16 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
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

      {/* ── Right Detail Panel (Deep Dive) ────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f6f7f8] dark:bg-[#101922]">

        {/* Breadcrumb & Header Profile */}
        <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <span className="material-symbols-outlined text-[#137fec] text-2xl">verified_user</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selected.name}</h2>
              <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-green-500">check_circle</span> Application Complete</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">location_on</span> {selected.location}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-400 uppercase">Expertise Score</p>
            <p className="text-2xl font-black text-[#137fec]">{selected.expertiseScore}/100</p>
          </div>
        </div>

        {/* Verification Panels — scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

            {/* Left Column (8/12) */}
            <div className="xl:col-span-8 space-y-6">

              {/* 1. Aadhaar Verification */}
              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <span className="material-symbols-outlined text-blue-500 text-xl">fingerprint</span> Aadhaar Verification
                  </h3>
                  <span className="px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-full">98% Match</span>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Doc Preview */}
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 h-40 flex items-center justify-center">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300">badge</span>
                        <p className="text-xs text-slate-400 mt-2">Aadhaar Preview</p>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-[#137fec]/10 text-[#137fec] text-sm font-bold rounded-lg hover:bg-[#137fec]/20 transition-all">View Full Scan</button>
                  </div>
                  {/* Data */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm py-2 border-b border-dashed border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 font-medium">ID Number</span>
                      <span className="font-mono font-semibold dark:text-white">{selected.aadhaar?.number ?? "XXXX XXXX XXXX"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-2 border-b border-dashed border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 font-medium">Name Match</span>
                      <span className="font-bold text-green-500">98% Verified</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-2">
                      <span className="text-slate-500 font-medium">Address Match</span>
                      <span className="font-bold text-green-500 flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Verified</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Video KYC */}
              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40">
                  <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <span className="material-symbols-outlined text-red-500 text-xl">videocam</span> Video KYC &amp; Phonetics
                  </h3>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase rounded">Speed: 1.2x</span>
                    <span className="px-2 py-1 bg-[#137fec]/10 text-[#137fec] text-[10px] font-bold uppercase rounded">AI Verified</span>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row h-[350px]">
                  {/* Video Player Placeholder */}
                  <div className="flex-1 bg-black relative group flex items-center justify-center">
                    <button className="h-16 w-16 bg-[#137fec] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-4xl fill-1">play_arrow</span>
                    </button>
                    <div className="absolute bottom-4 left-4 right-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-[#137fec] w-1/3"></div>
                    </div>
                  </div>
                  {/* Notes */}
                  <div className="w-full md:w-72 bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col">
                    <div className="p-3 border-b border-slate-200 dark:border-slate-700 font-bold text-xs uppercase text-slate-500">AI Phonetic Notes</div>
                    <div className="p-4 space-y-4 overflow-y-auto">
                      {selected.kyc?.phonetics?.length ? selected.kyc.phonetics.map((note, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-[#137fec]">
                            <span>{note.time}</span>
                            <span>{note.label}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">"{note.note}"</p>
                        </div>
                      )) : (
                        <p className="text-xs text-slate-400 italic">No specific phonetic notes generated.</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column (4/12) */}
            <div className="xl:col-span-4 space-y-6">

              {/* 3. Academic Credentials */}
              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <span className="material-symbols-outlined text-orange-500 text-xl">school</span> Academic Credentials
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500">Qualification</p>
                      <p className="text-sm font-semibold dark:text-white">{selected.academic?.qualification}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500">Institution</p>
                      <p className="text-sm font-semibold dark:text-white">{selected.academic?.institution}</p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-500/5 rounded-lg border border-green-500/10">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500 text-sm">verified</span>
                        <span className="text-xs font-bold text-green-600 dark:text-green-500 uppercase">Verified</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{selected.academic?.year}</span>
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    {selected.academic?.checks?.map(check => (
                      <div key={check.label} className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-base ${check.done ? 'text-green-500' : 'text-slate-300'}`}>
                          {check.done ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className={`text-xs ${check.done ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>{check.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 4. Background Check */}
              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                  <h3 className="font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-500 text-xl">gavel</span> Background Check
                  </h3>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-green-500 text-3xl">verified</span>
                  </div>
                  <p className="font-bold text-green-500">NO RECORDS FOUND</p>
                  <p className="text-[11px] text-slate-500 mt-2">Searched across national criminal database, civil court records, and sex offender registry.</p>
                </div>
                <div className="mt-auto border-t border-slate-100 dark:border-slate-800 p-3">
                  <p className="text-[10px] text-slate-400 text-center">LAST SYNC: {new Date().toLocaleDateString()} 10:45 AM</p>
                </div>
              </section>

            </div>
          </div>
        </div>

        {/* ── Decision Footer Sticky ────────────────────────────────────────── */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-20">
          <div className="flex items-center gap-3 flex-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex-shrink-0">Internal Note:</label>
            <input
              type="text"
              placeholder="Add a comment for the team..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1 max-w-md bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm px-4 py-2 focus:ring-1 focus:ring-[#137fec] text-slate-900 dark:text-white placeholder-slate-400 outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDecision("REJECT")}
              disabled={loading}
              className="px-4 py-2 text-red-500 border border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            >
              REJECT
            </button>
            <button
              onClick={() => handleDecision("REQUEST_INFO")}
              disabled={loading}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            >
              REQUEST INFO
            </button>
            <button
              onClick={() => handleDecision("APPROVE")}
              disabled={loading}
              className="px-8 py-2 bg-[#137fec] hover:bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-[#137fec]/20 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
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
