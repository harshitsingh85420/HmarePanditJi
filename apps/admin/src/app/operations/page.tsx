"use client";

import React, { useState } from "react";

interface Trip {
  id: string;
  service: string;
  pandit: string;
  status: "On Track" | "Delayed" | "Emergency";
  location: string;
  etaOffset: string;
  customer: string;
  customerType: string;
  gpsCoordinates?: string;
  logistics: {
    trainStatus: string;
    nextStop: string;
  };
  backupOptions?: { name: string; distance: string }[];
}

const MOCK_TRIPS: Trip[] = [
  {
    id: "HPJ-1257", service: "Mumbai Wedding", pandit: "Pandit G. Sharma",
    status: "Delayed", location: "Kalyan Junction", etaOffset: "+45 min",
    customer: "Rahul Malhotra", customerType: "Customer (Wedding Host)",
    gpsCoordinates: "19.2344° N, 73.1298° E",
    logistics: { trainStatus: "45 min delay", nextStop: "Thane Jn." },
    backupOptions: [
      { name: "Pandit V. Kulkarni", distance: "5km away" },
      { name: "Pandit M. Joshi", distance: "12km away" }
    ]
  },
  {
    id: "HPJ-1302", service: "Varanasi Puja", pandit: "Pandit R. Mishra",
    status: "On Track", location: "Varanasi Cantt", etaOffset: "On Time",
    customer: "Amit Verma", customerType: "Customer",
    logistics: { trainStatus: "On Time", nextStop: "Varanasi City" }
  },
  {
    id: "HPJ-1188", service: "Delhi Havan", pandit: "Pandit A. Tiwari",
    status: "Emergency", location: "New Delhi", etaOffset: "Stopped",
    customer: "Suresh Raina", customerType: "Host",
    logistics: { trainStatus: "Cancelled", nextStop: "N/A" }
  }
];

export default function TravelOperationsPage() {
  const [filter, setFilter] = useState<"All" | "Delayed" | "Emergency">("All");
  const [selectedTripId, setSelectedTripId] = useState<string>("HPJ-1257");

  const filteredTrips = MOCK_TRIPS.filter(t => {
    if (filter === "All") return true;
    return t.status === filter;
  });

  const selectedTrip = MOCK_TRIPS.find(t => t.id === selectedTripId) || MOCK_TRIPS[0];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#f8f7f5] dark:bg-[#221a10] text-slate-900 dark:text-slate-100 font-sans overflow-hidden">

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col max-w-[1440px] mx-auto w-full p-6 gap-6 overflow-y-auto">

        {/* Hero Title */}
        <div className="flex flex-wrap justify-between items-end gap-3 shrink-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="flex w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-[#f49d25] text-sm font-bold uppercase tracking-wider">Live Monitoring</p>
            </div>
            <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Travel Operations Center</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base font-normal">Real-time monitoring and logistics management for all ongoing priest travels.</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-[#f49d25] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#f49d25]/90 transition-colors">
              <span className="material-symbols-outlined">add</span> New Manual Trip
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
            <p className="text-slate-500 text-xs font-bold uppercase">Total Active Travels</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">124</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 border-l-4 border-l-green-500">
            <p className="text-slate-500 text-xs font-bold uppercase">On Track</p>
            <p className="text-2xl font-black text-green-500">112</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 border-l-4 border-l-[#f49d25]">
            <p className="text-slate-500 text-xs font-bold uppercase">Delayed</p>
            <p className="text-2xl font-black text-[#f49d25]">9</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 border-l-4 border-l-red-500">
            <p className="text-slate-500 text-xs font-bold uppercase">Emergency / Blocked</p>
            <p className="text-2xl font-black text-red-500">3</p>
          </div>
        </div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 min-h-0">

          {/* Left: List View */}
          <div className="lg:col-span-8 flex flex-col gap-4 h-full">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide shrink-0">
              <button
                onClick={() => setFilter("All")}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-bold transition-colors ${filter === 'All' ? 'bg-[#f49d25] text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300'}`}
              >
                All Travels <span className="bg-white/20 px-1.5 rounded">124</span>
              </button>
              <button
                onClick={() => setFilter("Delayed")}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-medium transition-colors ${filter === 'Delayed' ? 'bg-[#f49d25] text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300'}`}
              >
                Delayed <span className={`${filter === 'Delayed' ? 'bg-white/20 text-white' : 'bg-[#f49d25]/20 text-[#f49d25]'} px-1.5 rounded`}>9</span>
              </button>
              <button
                onClick={() => setFilter("Emergency")}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-medium transition-colors ${filter === 'Emergency' ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300'}`}
              >
                Emergency <span className={`${filter === 'Emergency' ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-500'} px-1.5 rounded`}>3</span>
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Trip ID</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Service</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Current Location</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">ETA Offset</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {filteredTrips.map((trip) => (
                    <tr
                      key={trip.id}
                      onClick={() => setSelectedTripId(trip.id)}
                      className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/50 ${selectedTripId === trip.id ? 'bg-[#f49d25]/5 dark:bg-[#f49d25]/10' : ''} ${trip.status === 'Delayed' ? 'border-l-4 border-l-[#f49d25]' : trip.status === 'Emergency' ? 'border-l-4 border-l-red-500' : ''}`}
                    >
                      <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">{trip.id}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{trip.service}</span>
                          <span className="text-xs text-slate-400">{trip.pandit}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${trip.status === 'Delayed' ? 'bg-[#f49d25] text-white' :
                            trip.status === 'Emergency' ? 'bg-red-500 text-white' :
                              'bg-green-500 text-white'
                          }`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">{trip.location}</td>
                      <td className={`px-4 py-4 font-bold text-sm ${trip.status === 'Delayed' ? 'text-[#f49d25]' :
                          trip.status === 'Emergency' ? 'text-red-500' :
                            'text-green-500'
                        }`}>
                        {trip.etaOffset}
                      </td>
                      <td className="px-4 py-4">
                        <button className={`text-xs font-black hover:underline uppercase ${trip.status === 'Emergency' ? 'text-red-500 animate-pulse' : 'text-[#f49d25]'}`}>
                          {trip.status === 'Emergency' ? 'Alert Admin' : 'Manage'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Detailed Card & Action Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto">
            {selectedTrip && (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-800/50">
                  <h3 className="font-bold text-slate-900 dark:text-white">{selectedTrip.id} | {selectedTrip.service}</h3>
                  <span className="material-symbols-outlined text-slate-400">open_in_full</span>
                </div>
                <div className="p-4 flex flex-col gap-4">
                  {/* Mini Map */}
                  <div className="w-full h-40 rounded-lg bg-slate-200 dark:bg-zinc-800 relative overflow-hiddenGroup group">
                    <img
                      className="w-full h-full object-cover opacity-80"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtxAn63IIMsNgCkzhXfOSNigmmQhQHUI0HNUjGVAwDvwKWiLiSkBr1eBTN77tMnDLHcLn0xn2alJNzMTytqUYRu7zBVEKuj8NvV_I5H1iGOGQ0CJWK9lovF7ISDtWtHT17bX2WflBB_qUd7p58_eOsabiyYtXQVpzu1bVIKkEGRJR4U7kufmiT2Gfc3yydCTNteJs51ZOR9kc-aVFlW63qxdwOg3frP4jIa2JOLqrR34vCr1_CzZHhdpddyn9SCgbN3ePtlBSdCRQ"
                      alt="Mini map"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <span className="material-symbols-outlined text-[#f49d25] text-4xl drop-shadow-md">person_pin_circle</span>
                        <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                      </div>
                    </div>
                    {selectedTrip.gpsCoordinates && (
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded">
                        GPS: {selectedTrip.gpsCoordinates}
                      </div>
                    )}
                  </div>

                  {/* Logistics Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Train Status</span>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[#f49d25] text-sm">train</span>
                        <span className="text-sm font-bold text-[#f49d25]">{selectedTrip.logistics.trainStatus}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Next Stop</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedTrip.logistics.nextStop}</span>
                    </div>
                  </div>
                  <hr className="border-slate-100 dark:border-zinc-800" />

                  {/* Customer Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400">person</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedTrip.customer}</span>
                        <span className="text-xs text-slate-400">{selectedTrip.customerType}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors">
                        <span className="material-symbols-outlined text-sm">call</span>
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-[#f49d25] text-white flex items-center justify-center hover:bg-[#f49d25]/90 transition-colors">
                        <span className="material-symbols-outlined text-sm">chat</span>
                      </button>
                    </div>
                  </div>

                  {/* Action Panel */}
                  <div className="flex flex-col gap-2 pt-2">
                    <button className="w-full py-2 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                      <span className="material-symbols-outlined text-sm">campaign</span> Alert Customer
                    </button>
                    <button className="w-full py-2 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                      <span className="material-symbols-outlined text-sm">local_taxi</span> Arrange Cab from {selectedTrip.location.split(' ')[0]}
                    </button>

                    {selectedTrip.status !== 'On Track' && (
                      <div className="mt-4 p-4 border-2 border-dashed border-red-500/50 rounded-xl bg-red-500/5 flex flex-col gap-4">
                        <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-colors">
                          <span className="material-symbols-outlined">verified_user</span> ACTIVATE BACKUP PANDIT
                        </button>
                        {selectedTrip.backupOptions && (
                          <div>
                            <p className="text-[10px] uppercase font-bold text-red-500 mb-2">Available Local Backups</p>
                            <div className="flex flex-col gap-2">
                              {selectedTrip.backupOptions.map((backup, idx) => (
                                <div key={idx} className={`flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded border border-red-500/20 ${idx > 0 ? 'opacity-60' : ''}`}>
                                  <span className="text-xs font-medium text-slate-900 dark:text-white">{backup.name}</span>
                                  <span className={`text-[10px] px-1 rounded ${idx === 0 ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                    {backup.distance}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* ── API Footer ───────────────────────────────────────────────────── */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 px-6 py-4 shrink-0">
        <div className="max-w-[1440px] mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IRCTC API: CONNECTED</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MMT API: LIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
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
