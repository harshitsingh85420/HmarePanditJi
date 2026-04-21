"use client";

import { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

interface TravelBooking {
  id: string;
  tripId: string;
  serviceName: string;
  panditName: string;
  panditCity: string;
  status: "ON_TRACK" | "DELAYED" | "EMERGENCY" | "COMPLETED";
  currentLocation: string;
  etaOffset: string; // e.g. "On Time", "+45 min"
  venueCity: string;

  // Detail Panel Data
  miniMapUrl: string;
  trainStatus?: string; // e.g. "45 min delay"
  nextStop?: string;
  customerName: string;
  customerRole: string; // e.g. "Wedding Host"

  // Backup / Logistics
  backupAvailable?: boolean;
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_DATA: TravelBooking[] = [
  {
    id: "1",
    tripId: "HPJ-1257",
    serviceName: "Mumbai Wedding",
    panditName: "Pandit G. Sharma",
    panditCity: "Pune",
    status: "DELAYED",
    currentLocation: "Kalyan Junction",
    etaOffset: "+45 min",
    venueCity: "Mumbai",
    miniMapUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtxAn63IIMsNgCkzhXfOSNigmmQhQHUI0HNUjGVAwDvwKWiLiSkBr1eBTN77tMnDLHcLn0xn2alJNzMTytqUYRu7zBVEKuj8NvV_I5H1iGOGQ0CJWK9lovF7ISDtWtHT17bX2WflBB_qUd7p58_eOsabiyYtXQVpzu1bVIKkEGRJR4U7kufmiT2Gfc3yydCTNteJs51ZOR9kc-aVFlW63qxdwOg3frP4jIa2JOLqrR34vCr1_CzZHhdpddyn9SCgbN3ePtlBSdCRQ",
    trainStatus: "45 min delay",
    nextStop: "Thane Jn.",
    customerName: "Rahul Malhotra",
    customerRole: "Customer (Wedding Host)",
    backupAvailable: true
  },
  {
    id: "2",
    tripId: "HPJ-1302",
    serviceName: "Varanasi Puja",
    panditName: "Pandit R. Mishra",
    panditCity: "Varanasi",
    status: "ON_TRACK",
    currentLocation: "Varanasi Cantt",
    etaOffset: "On Time",
    venueCity: "Varanasi",
    miniMapUrl: "",
    trainStatus: "On Time",
    nextStop: "Destination",
    customerName: "Anjali Gupta",
    customerRole: "Customer",
    backupAvailable: true
  },
  {
    id: "3",
    tripId: "HPJ-1188",
    serviceName: "Delhi Havan",
    panditName: "Pandit A. Tiwari",
    panditCity: "Mathura",
    status: "EMERGENCY",
    currentLocation: "New Delhi",
    etaOffset: "Stopped",
    venueCity: "Delhi",
    miniMapUrl: "",
    trainStatus: "Cancelled",
    nextStop: "N/A",
    customerName: "Sohan Lal",
    customerRole: "Host",
    backupAvailable: false
  }
];

// ── Helper Components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === "ON_TRACK") return <span className="bg-green-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded">On Track</span>;
  if (status === "DELAYED") return <span className="bg-[#f49d25] text-white text-[10px] font-black uppercase px-2 py-1 rounded">Delayed</span>;
  if (status === "EMERGENCY") return <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded">Emergency</span>;
  return <span className="bg-slate-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded">{status}</span>;
}

function ETAText({ status, text }: { status: string, text: string }) {
  if (status === "ON_TRACK") return <span className="text-green-500 font-bold text-sm">{text}</span>;
  if (status === "DELAYED") return <span className="text-[#f49d25] font-bold text-sm">{text}</span>;
  if (status === "EMERGENCY") return <span className="text-red-500 font-bold text-sm">{text}</span>;
  return <span className="text-slate-500 font-bold text-sm">{text}</span>;
}

// ── Main Page Component ──────────────────────────────────────────────────────

export default function TravelOperationsPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedTrip, setSelectedTrip] = useState<TravelBooking | null>(MOCK_DATA[0]);

  const filtered = activeTab === "ALL" ? MOCK_DATA : MOCK_DATA.filter(d => d.status === activeTab);

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#221a10] font-sans text-slate-900 dark:text-slate-100 flex flex-col">

      {/* Header taken from layout generally, but implementing specific page header here */}

      <main className="flex-1 flex flex-col max-w-[1440px] mx-auto w-full p-6 gap-6">

        {/* Hero Title */}
        <div className="flex flex-wrap justify-between items-end gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="flex w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-[#f49d25] text-sm font-bold uppercase tracking-wider">Live Monitoring</p>
            </div>
            <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Travel Operations Center</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base font-normal">Real-time monitoring and logistics management for all ongoing priest travels.</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-[#f49d25] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#d8891c]">
              <span className="material-symbols-outlined">add</span> New Manual Trip
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1a140d] p-4 rounded-xl border border-slate-200 dark:border-white/10">
            <p className="text-slate-500 text-xs font-bold uppercase">Total Active Travels</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">124</p>
          </div>
          <div className="bg-white dark:bg-[#1a140d] p-4 rounded-xl border border-slate-200 dark:border-white/10 border-l-4 border-l-green-500">
            <p className="text-slate-500 text-xs font-bold uppercase">On Track</p>
            <p className="text-2xl font-black text-green-500">112</p>
          </div>
          <div className="bg-white dark:bg-[#1a140d] p-4 rounded-xl border border-slate-200 dark:border-white/10 border-l-4 border-l-[#f49d25]">
            <p className="text-slate-500 text-xs font-bold uppercase">Delayed</p>
            <p className="text-2xl font-black text-[#f49d25]">9</p>
          </div>
          <div className="bg-white dark:bg-[#1a140d] p-4 rounded-xl border border-slate-200 dark:border-white/10 border-l-4 border-l-red-500">
            <p className="text-slate-500 text-xs font-bold uppercase">Emergency / Blocked</p>
            <p className="text-2xl font-black text-red-500">3</p>
          </div>
        </div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left: List View */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-bold transition-all ${activeTab === "ALL" ? "bg-[#f49d25] text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"}`}
              >
                All Travels <span className="bg-white/20 px-1.5 rounded">124</span>
              </button>
              <button
                onClick={() => setActiveTab("DELAYED")}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-medium transition-all ${activeTab === "DELAYED" ? "bg-[#f49d25] text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"}`}
              >
                Delayed <span className="bg-[#f49d25]/20 text-[#f49d25] px-1.5 rounded">9</span>
              </button>
              <button
                onClick={() => setActiveTab("EMERGENCY")}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-medium transition-all ${activeTab === "EMERGENCY" ? "bg-[#f49d25] text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"}`}
              >
                Emergency <span className="bg-red-500/20 text-red-500 px-1.5 rounded">3</span>
              </button>
            </div>

            <div className="bg-white dark:bg-[#1a140d] rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Trip ID</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Service</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Current Location</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">ETA Offset</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                  {filtered.map(trip => (
                    <tr
                      key={trip.id}
                      onClick={() => setSelectedTrip(trip)}
                      className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${selectedTrip?.id === trip.id ? "bg-slate-50 dark:bg-white/5" : ""} ${trip.status === "DELAYED" ? "border-l-4 border-l-[#f49d25] bg-[#f49d25]/5" : ""} ${trip.status === "EMERGENCY" ? "border-l-4 border-l-red-500 bg-red-500/5" : ""}`}
                    >
                      <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">{trip.tripId}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold dark:text-white">{trip.serviceName}</span>
                          <span className="text-xs text-slate-400">{trip.panditName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={trip.status} />
                      </td>
                      <td className="px-4 py-4 text-sm dark:text-slate-300">{trip.currentLocation}</td>
                      <td className="px-4 py-4">
                        <ETAText status={trip.status} text={trip.etaOffset} />
                      </td>
                      <td className="px-4 py-4">
                        <button className="text-[#f49d25] text-xs font-black hover:underline uppercase">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Detailed Card & Action Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {selectedTrip ? (
              <div className="bg-white dark:bg-[#1a140d] rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col sticky top-24">
                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                  <h3 className="font-bold text-slate-900 dark:text-white">{selectedTrip.tripId} | {selectedTrip.serviceName}</h3>
                  <span className="material-symbols-outlined text-slate-400 cursor-pointer">open_in_full</span>
                </div>
                <div className="p-4 flex flex-col gap-4">
                  {/* Mini Map */}
                  <div className="w-full h-40 rounded-lg bg-slate-200 dark:bg-white/5 relative overflow-hidden">
                    {selectedTrip.miniMapUrl ? (
                      <img className="w-full h-full object-cover" src={selectedTrip.miniMapUrl} alt="Mini map" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Map Unavailable</div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative">
                        <span className="material-symbols-outlined text-[#f49d25] text-4xl">person_pin_circle</span>
                        <div className="absolute top-0 right-0 size-2 bg-red-500 rounded-full animate-ping"></div>
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded">
                      GPS: 19.2344° N, 73.1298° E
                    </div>
                  </div>

                  {/* Logistics Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Train Status</span>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[#f49d25] text-sm">train</span>
                        <span className="text-sm font-bold text-[#f49d25]">{selectedTrip.trainStatus || "N/A"}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Next Stop</span>
                      <span className="text-sm font-bold dark:text-white">{selectedTrip.nextStop || "N/A"}</span>
                    </div>
                  </div>
                  <hr className="border-slate-100 dark:border-white/10" />

                  {/* Customer Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400">person</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold dark:text-white">{selectedTrip.customerName}</span>
                        <span className="text-xs text-slate-400">{selectedTrip.customerRole}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="size-8 rounded-lg bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors">
                        <span className="material-symbols-outlined text-sm">call</span>
                      </button>
                      <button className="size-8 rounded-lg bg-[#f49d25] text-white flex items-center justify-center hover:bg-[#d8891c] transition-colors">
                        <span className="material-symbols-outlined text-sm">chat</span>
                      </button>
                    </div>
                  </div>

                  {/* Action Panel */}
                  <div className="flex flex-col gap-2 pt-2">
                    <button className="w-full py-2 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined text-sm">campaign</span> Alert Customer
                    </button>
                    <button className="w-full py-2 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined text-sm">local_taxi</span> Arrange Cab from Kalyan
                    </button>

                    <div className="mt-4 p-4 border-2 border-dashed border-red-500/50 rounded-xl bg-red-500/5 flex flex-col gap-4">
                      <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]">
                        <span className="material-symbols-outlined">verified_user</span> ACTIVATE BACKUP PANDIT
                      </button>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-red-500 mb-2">Available Local Backups</p>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between bg-white dark:bg-[#1a140d] p-2 rounded border border-red-500/20">
                            <span className="text-xs font-medium dark:text-white">Pandit V. Kulkarni</span>
                            <span className="text-[10px] bg-green-500/10 text-green-500 px-1 rounded">5km away</span>
                          </div>
                          <div className="flex items-center justify-between bg-white dark:bg-[#1a140d] p-2 rounded border border-red-500/20 opacity-60">
                            <span className="text-xs font-medium dark:text-white">Pandit M. Joshi</span>
                            <span className="text-[10px] bg-slate-500/10 text-slate-500 px-1 rounded">12km away</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Select a trip to view details</div>
            )}
          </div>
        </div>
      </main>

      {/* API Footer */}
      <footer className="bg-white dark:bg-[#1a140d] border-t border-slate-200 dark:border-white/10 px-10 py-4 mt-auto">
        <div className="max-w-[1440px] mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <span className="size-2 bg-green-500 rounded-full"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IRCTC API: CONNECTED</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 bg-green-500 rounded-full"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MMT API: LIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 bg-yellow-500 rounded-full"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UBER API: LATENCY</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            © 2024 HmarePanditJi Operations - Internal Use Only
          </div>
        </div>
      </footer>

    </div>
  );
}
