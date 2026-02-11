"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

interface TravelRequest {
  id: string;
  bookingNo: string;
  ceremony: string;
  pandit: string;
  from: string;
  to: string;
  date: string;
  mode: "Train" | "Bus" | "Flight" | "Car";
  status: "PENDING" | "ARRANGED" | "CONFIRMED";
  estimatedCost: number;
}

const MOCK_TRAVEL: TravelRequest[] = [
  { id: "1", bookingNo: "BK-8819", ceremony: "Satyanarayan Katha", pandit: "Dinesh Tiwari", from: "Delhi", to: "Gurgaon", date: "13 Feb 2024", mode: "Car", status: "PENDING", estimatedCost: 800 },
  { id: "2", bookingNo: "BK-8817", ceremony: "Navgraha Puja", pandit: "Ganesh Dubey", from: "Lucknow", to: "Faridabad", date: "16 Feb 2024", mode: "Train", status: "PENDING", estimatedCost: 1200 },
  { id: "3", bookingNo: "BK-8812", ceremony: "Vivah Puja", pandit: "Ramesh Sharma", from: "Varanasi", to: "Delhi", date: "20 Feb 2024", mode: "Train", status: "ARRANGED", estimatedCost: 1800 },
  { id: "4", bookingNo: "BK-8808", ceremony: "Rudrabhishek", pandit: "Suresh Mishra", from: "Delhi", to: "Haridwar", date: "22 Feb 2024", mode: "Bus", status: "CONFIRMED", estimatedCost: 600 },
  { id: "5", bookingNo: "BK-8805", ceremony: "Maha Yagya", pandit: "Dinesh Tiwari", from: "Delhi", to: "Jaipur", date: "25 Feb 2024", mode: "Train", status: "PENDING", estimatedCost: 1400 },
];

const MODES = ["Car", "Train", "Bus", "Flight"] as const;

const STATUS_STYLES: Record<TravelRequest["status"], string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  ARRANGED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CONFIRMED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export default function OperationsPage() {
  const [selectedTravel, setSelectedTravel] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  // Pricing Calculator State
  const [calcFrom, setCalcFrom] = useState("");
  const [calcTo, setCalcTo] = useState("");
  const [calcDistance, setCalcDistance] = useState("");
  const [calcMode, setCalcMode] = useState<typeof MODES[number]>("Train");
  const [calcFood, setCalcFood] = useState(true);
  const [calcStay, setCalcStay] = useState(false);
  const [calcNights, setCalcNights] = useState("1");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const TRAVEL_RATES: Record<typeof MODES[number], number> = {
    Car: 12, Train: 3.5, Bus: 2, Flight: 8,
  };
  const FOOD_RATE = 500;
  const STAY_RATE = 1500;

  const distance = parseFloat(calcDistance) || 0;
  const nights = parseInt(calcNights) || 1;
  const travelCost = Math.round(distance * TRAVEL_RATES[calcMode]);
  const foodCost = calcFood ? FOOD_RATE : 0;
  const stayCost = calcStay ? STAY_RATE * nights : 0;
  const totalCost = travelCost + foodCost + stayCost;

  const handleExportCSV = () => {
    const headers = ["Booking#", "Ceremony", "Pandit", "From", "To", "Date", "Mode", "Est. Cost", "Status"];
    const rows = MOCK_TRAVEL.map((t) => [t.bookingNo, t.ceremony, t.pandit, t.from, t.to, t.date, t.mode, `₹${t.estimatedCost}`, t.status]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `travel_ops_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV downloaded");
  };

  const pendingCount = MOCK_TRAVEL.filter((t) => t.status === "PENDING").length;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Operations Center</h1>
          <p className="text-sm text-slate-500 mt-0.5">Travel management, pricing calculator, and data export</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-primary text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <span className="material-symbols-outlined text-base leading-none">table_view</span>
          Export Google Sheets CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Travel Management Queue ─────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900 dark:text-white">Travel Management Queue</h2>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded-full">
              {pendingCount} need action
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1fr_1.5fr_1fr_auto_auto] gap-4 px-5 py-3 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Booking</span><span>Route</span><span>Mode / Date</span><span>Est. Cost</span><span>Status</span>
            </div>

            {MOCK_TRAVEL.map((travel) => (
              <button
                key={travel.id}
                onClick={() => setSelectedTravel(selectedTravel === travel.id ? null : travel.id)}
                className={`w-full grid grid-cols-[1fr_1.5fr_1fr_auto_auto] gap-4 px-5 py-4 text-left border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  selectedTravel === travel.id ? "bg-primary/5 dark:bg-primary/10" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-primary">{travel.bookingNo}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{travel.ceremony}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {travel.from} → {travel.to}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{travel.pandit}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">
                    {travel.mode}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">{travel.date}</p>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white self-center">₹{travel.estimatedCost}</p>
                <span className={`self-center text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[travel.status]}`}>
                  {travel.status}
                </span>
              </button>
            ))}
          </div>

          {/* Expanded action for selected */}
          {selectedTravel && (
            <div className="mt-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-primary/20 shadow-sm">
              {(() => {
                const t = MOCK_TRAVEL.find((x) => x.id === selectedTravel)!;
                return (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{t.bookingNo} — {t.from} → {t.to}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t.pandit} · {t.date} · {t.mode}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => showToast(`${t.bookingNo}: Travel arranged`)} className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors">
                        Mark Arranged
                      </button>
                      <button onClick={() => showToast(`${t.bookingNo}: SMS sent to pandit`)} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        Notify Pandit
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* ── Pricing Calculator ─────────────────────────────────────────── */}
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Manual Pricing Calculator</h2>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm space-y-4">

            {[
              { label: "From City", value: calcFrom, setter: setCalcFrom, placeholder: "e.g. Delhi" },
              { label: "To City", value: calcTo, setter: setCalcTo, placeholder: "e.g. Jaipur" },
              { label: "Distance (km)", value: calcDistance, setter: setCalcDistance, placeholder: "e.g. 280", type: "number" },
            ].map(({ label, value, setter, placeholder, type }) => (
              <div key={label}>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
                <input
                  type={type ?? "text"}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="w-full mt-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            ))}

            {/* Travel Mode */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Travel Mode</label>
              <div className="grid grid-cols-4 gap-2 mt-1.5">
                {MODES.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCalcMode(mode)}
                    className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                      calcMode === mode ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Rate: ₹{TRAVEL_RATES[calcMode]}/km</p>
            </div>

            {/* Extras */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Extras</label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={calcFood} onChange={(e) => setCalcFood(e.target.checked)} className="w-4 h-4 rounded accent-primary" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Food allowance (₹500/day)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={calcStay} onChange={(e) => setCalcStay(e.target.checked)} className="w-4 h-4 rounded accent-primary" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Accommodation (₹1,500/night)</span>
              </label>
              {calcStay && (
                <div className="pl-7">
                  <input type="number" min="1" max="30" value={calcNights} onChange={(e) => setCalcNights(e.target.value)} className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <span className="text-xs text-slate-400 ml-2">nights</span>
                </div>
              )}
            </div>

            {/* Result */}
            {distance > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {[
                  { label: "Travel Cost", value: `₹${travelCost.toLocaleString("en-IN")}` },
                  ...(calcFood ? [{ label: "Food Allowance", value: `₹${foodCost}` }] : []),
                  ...(calcStay ? [{ label: `Accommodation (${nights}n)`, value: `₹${stayCost.toLocaleString("en-IN")}` }] : []),
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{row.label}</span>
                    <span className="text-slate-700 dark:text-slate-300">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white">Total Reimbursement</span>
                  <span className="text-xl font-black text-primary">₹{totalCost.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => showToast("Pricing saved to booking")}
              disabled={!calcFrom || !calcTo || !calcDistance}
              className="w-full py-3 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40 shadow-sm shadow-primary/20"
            >
              Apply to Booking
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold px-5 py-3 rounded-xl shadow-xl">{toast}</div>
      )}
    </div>
  );
}
