"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import TextToSpeechButton from "@/components/TextToSpeechButton";

export default function EarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(""); // YYYY-MM
  const token = typeof window !== 'undefined' ? (
    localStorage.getItem("hpj_pandit_token") ||
    localStorage.getItem("hpj_pandit_access_token") ||
    localStorage.getItem("token")
  ) : null;

  useEffect(() => {
    fetchEarningsData(selectedMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  const fetchEarningsData = async (month: string) => {
    try {
      setLoading(true);
      if (!token) return;

      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/pandits/earnings/summary`);
      if (month) url.searchParams.append("month", month);

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || "Failed to load earnings data");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#f4a825]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg max-w-[960px] mx-auto mt-10">
        <p>{error}</p>
        <button className="mt-2 text-sm underline" onClick={() => fetchEarningsData(selectedMonth)}>Retry</button>
      </div>
    );
  }

  if (!data) return null;

  const totalEarned = data.totalEarned || 0;
  const totalPaid = data.totalPaid || 0;
  const totalPending = data.totalPending || 0;
  const bookings = data.bookingEarnings || [];

  const voiceText = `इस महीने आपने ${data.bookingsCount || 0} पूजाओं से कुल ₹${totalEarned} कमाए। ₹${totalPaid} आपके खाते में आ चुके हैं। ₹${totalPending} बाकी हैं।`;

  return (
    <div className="flex flex-1 justify-center py-6 md:py-10 px-4 md:px-8 text-[#181511] font-display">
      <div className="flex flex-col max-w-[960px] w-full flex-1 gap-6">

        {/* Page Title & Subtitle */}
        <div className="flex flex-col gap-2 relative">
          <div className="flex items-start">
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-[#181511]">
              Earnings & Wallet
            </h1>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-[#8a7b60] text-sm md:text-base font-normal">
              Manage your professional dakshina, reimbursements and tax compliance.
            </p>
            <div className="shrink-0 bg-white/50 backdrop-blur rounded-full px-2 py-1 shadow-sm border border-orange-100">
              <TextToSpeechButton text={voiceText} />
            </div>
          </div>
        </div>

        {/* Balance Card Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 flex flex-col justify-between gap-6 rounded-xl p-6 md:p-8 bg-white border border-[#e6e2db] shadow-sm">
            <div className="flex flex-col gap-2">
              <p className="text-[#8a7b60] text-sm font-semibold uppercase tracking-wider">Available Balance</p>
              <p className="text-4xl md:text-5xl font-black text-[#181511]">₹{totalPending.toLocaleString('en-IN')}</p>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap gap-4">
              <button
                className="flex-1 w-full sm:w-auto min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-14 px-6 bg-[#f4a825] text-[#181511] text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#f4a825]/20 disabled:opacity-50 disabled:cursor-not-allowed group flex gap-2"
                disabled={totalPending === 0}
              >
                <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1 duration-300">account_balance_wallet</span>
                <span>Withdraw to Bank</span>
              </button>
              <button className="flex shrink-0 items-center justify-center rounded-lg w-14 h-14 bg-[#f4a825]/10 text-[#f4a825] border border-[#f4a825]/20 hover:bg-[#f4a825]/20 transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
          </div>

          {/* Tax Summary Mini Card */}
          <div className="flex flex-col gap-4 rounded-xl p-6 bg-[#fef7e7] border border-[#f4a825]/20 justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -m-4 text-[#f4a825]/5 opacity-30 transform -rotate-12 scale-150 p-0 pointer-events-none text-9xl">
              <span className="material-symbols-outlined block" style={{ fontSize: '160px', fontVariationSettings: "'FILL' 1" }}>description</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[#f4a825] mb-2">
                <span className="material-symbols-outlined font-bold">description</span>
                <p className="font-bold text-lg">Tax Summary</p>
              </div>
              <p className="text-[#8a7b60] text-sm leading-relaxed max-w-[90%]">
                View your TDS certificates and annual tax statements for the current financial year.
              </p>
            </div>
            <button className="relative z-10 mt-auto flex items-center gap-1.5 text-sm font-bold text-[#181511] hover:underline underline-offset-4 decoration-2">
              View Documents
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Breakdown & Analytics */}
        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-col gap-6 rounded-xl border border-[#e6e2db] p-6 md:p-8 bg-white shadow-sm overflow-hidden z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6e2db] pb-4">
              <p className="text-[#181511] text-xl font-bold">Earnings Breakdown</p>
              <div className="flex items-center bg-[#f8f7f5] rounded-lg px-2 shadow-inner border border-[#e6e2db] focus-within:ring-2 focus-within:ring-[#f4a825] transition-shadow">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold focus:ring-0 text-[#181511] py-1.5 cursor-pointer outline-none w-[130px]"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-16 pt-2">
              {/* Chart Area */}
              <div className="relative w-[210px] h-[210px] flex items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full border-[18px] border-[#f5f3f0]"></div>
                {totalEarned > 0 && (
                  <div className="absolute inset-0 rounded-full border-[18px] border-[#f4a825] border-r-transparent border-b-transparent rotate-[30deg]"></div>
                )}
                {totalEarned > 0 && (
                  <div className="absolute inset-0 rounded-full border-[18px] border-[#fcd581] border-l-transparent border-t-transparent border-r-transparent -rotate-[60deg] z-10"></div>
                )}
                <div className="flex flex-col items-center">
                  <p className="text-3xl font-black text-[#181511]">{totalEarned > 0 ? "81%" : "0%"}</p>
                  <p className="text-[10px] text-[#8a7b60] font-bold uppercase tracking-widest mt-0.5">Dakshina</p>
                </div>
              </div>

              {/* Legends & Bars */}
              <div className="flex-1 w-full flex flex-col gap-7 justify-center">
                <div className="flex flex-col gap-2 relative">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-bold flex items-center gap-2.5 text-[#181511]">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#f4a825] shadow-sm border border-black/5"></span> Dakshina
                    </span>
                    <span className="text-sm font-black text-[#181511]">{totalEarned > 0 ? "81%" : "0%"} <span className="mx-1.5 text-slate-300 font-normal">|</span> ₹{(totalEarned * 0.81).toFixed(0).toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-[#f5f3f0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#f4a825] rounded-full transition-all duration-1000 ease-out" style={{ width: totalEarned > 0 ? "81%" : "0%" }}></div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 relative">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-bold flex items-center gap-2.5 text-[#181511]">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#fcd581] shadow-sm border border-black/5"></span> Travel Reimbursement
                    </span>
                    <span className="text-sm font-black text-[#181511]">{totalEarned > 0 ? "15%" : "0%"} <span className="mx-1.5 text-slate-300 font-normal">|</span> ₹{(totalEarned * 0.15).toFixed(0).toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-[#f5f3f0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#fcd581] rounded-full transition-all duration-1000 ease-out delay-100" style={{ width: totalEarned > 0 ? "15%" : "0%" }}></div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 relative">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-bold flex items-center gap-2.5 text-[#181511]">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#e6e2db] shadow-sm border border-black/5"></span> Food Allowance
                    </span>
                    <span className="text-sm font-black text-[#181511]">{totalEarned > 0 ? "4%" : "0%"} <span className="mx-1.5 text-slate-300 font-normal">|</span> ₹{(totalEarned * 0.04).toFixed(0).toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-[#f5f3f0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#e6e2db] rounded-full transition-all duration-1000 ease-out delay-200" style={{ width: totalEarned > 0 ? "4%" : "0%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-[#f8f7f5] -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 md:p-8 mt-6">
              <span className="font-bold text-[#8a7b60] text-lg uppercase tracking-wider text-[11px]">Total Earned</span>
              <span className="text-2xl md:text-3xl font-black text-[#181511]">₹{totalEarned.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="flex flex-col gap-4 mt-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[22px] font-bold tracking-tight">Recent Transactions</h3>
            {bookings.length > 5 && (
              <button className="text-[#f4a825] text-sm font-bold hover:underline underline-offset-4 decoration-2 cursor-pointer">View All →</button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {bookings.length === 0 ? (
              <div className="p-10 text-center text-slate-500 bg-white border border-[#e6e2db] rounded-xl shadow-sm">
                <span className="material-symbols-outlined text-5xl mb-3 text-slate-300">receipt_long</span>
                <p className="font-bold text-lg text-[#181511]">No transactions yet</p>
                <p className="text-sm text-[#8a7b60] mt-1">You haven't completed any paid bookings in this period.</p>
              </div>
            ) : (
              bookings.slice(0, 5).map((txn: any) => {
                const isPaid = txn.status === 'PAID';
                return (
                  <div key={txn.id} className="flex items-center justify-between p-4 px-5 rounded-xl bg-white border border-[#e6e2db] hover:border-[#f4a825] hover:shadow-md transition-all shadow-sm cursor-pointer group">
                    <div className="flex items-center gap-5">
                      <div className={`w-[52px] h-[52px] rounded-xl flex items-center justify-center shrink-0 ${isPaid ? 'bg-[#f4a825]/10 text-[#f4a825]' : 'bg-blue-50 text-blue-500'}`}>
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {txn.pujaType?.toLowerCase().includes('vivah') ? 'celebration' : (txn.pujaType?.toLowerCase().includes('griha') ? 'home' : 'festival')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#181511] text-base truncate pb-0.5">
                          {txn.pujaType || 'Puja Service'}
                        </p>
                        <p className="text-[13px] text-[#8a7b60] font-medium truncate flex items-center gap-1">
                          {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} <span className="opacity-50">•</span> {txn.bookingId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5 shrink-0 pl-4 border-l border-slate-100 ml-4 py-1">
                      <p className="font-black text-lg text-[#181511] group-hover:text-[#f4a825] transition-colors tabular-nums">
                        ₹{txn.amount?.toLocaleString('en-IN') || 0}
                      </p>
                      <span className={`inline-flex items-center px-2 py-[3px] rounded-md text-[10px] font-bold uppercase tracking-widest ${isPaid ? 'bg-[#078810]/10 text-[#078810]' : 'bg-blue-50 text-blue-600'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isPaid ? 'bg-[#078810]' : 'bg-blue-600'}`}></span>
                        {txn.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
