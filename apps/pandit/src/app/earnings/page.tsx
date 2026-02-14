"use client";

import { useState } from "react";

export default function EarningsPage() {
  const [filter, setFilter] = useState("This Month");

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#181511] dark:text-[#f8f7f5]">Earnings & Wallet</h1>
        <p className="text-[#8a7b60] dark:text-[#a89980] text-base font-normal">Manage your professional dakshina, reimbursements and tax compliance.</p>
      </div>

      {/* Balance Card Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col justify-between gap-6 rounded-xl p-8 bg-white dark:bg-[#2d2418] border border-[#e6e2db] dark:border-[#3d3428] shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-[#8a7b60] dark:text-[#a89980] text-sm font-semibold uppercase tracking-wider">Available Balance</p>
            <p className="text-5xl font-black text-[#181511] dark:text-[#f4a825]">₹52,000</p>
          </div>
          <div className="flex gap-4">
            <button className="flex-1 min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-14 px-6 bg-[#f4a825] text-[#181511] text-lg font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#f4a825]/20">
              <span className="flex items-center gap-2 justify-center">
                <span className="material-symbols-outlined">account_balance_wallet</span>
                Withdraw to Bank
              </span>
            </button>
            <button className="flex items-center justify-center rounded-lg w-14 h-14 bg-[#f4a825]/10 text-[#f4a825] border border-[#f4a825]/20 hover:bg-[#f4a825]/20 transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>

        {/* Tax Summary Mini Card */}
        <div className="flex flex-col gap-4 rounded-xl p-6 bg-[#fef7e7] dark:bg-[#342a1a] border border-[#f4a825]/20">
          <div className="flex items-center gap-3 text-[#f4a825]">
            <span className="material-symbols-outlined">description</span>
            <p className="font-bold">Tax Summary</p>
          </div>
          <p className="text-sm text-[#8a7b60] dark:text-[#a89980]">View your TDS certificates and annual tax statements for the current financial year.</p>
          <a className="mt-auto flex items-center gap-2 text-sm font-bold text-[#181511] dark:text-[#f8f7f5] hover:underline underline-offset-4" href="#">
            View Documents
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
      </div>

      {/* Breakdown & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="flex flex-col gap-6 rounded-xl border border-[#e6e2db] dark:border-[#3d3428] p-8 bg-white dark:bg-[#181511]">
          <div className="flex items-center justify-between">
            <p className="text-[#181511] dark:text-[#f8f7f5] text-xl font-bold">Earnings Breakdown</p>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#f8f7f5] dark:bg-[#2d2418] border-none rounded-lg text-sm font-medium py-1 px-3 text-[#181511] dark:text-white focus:ring-0"
            >
              <option>This Month</option>
              <option>Last 3 Months</option>
              <option>Yearly</option>
            </select>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Chart Area */}
            <div className="relative size-48 flex items-center justify-center shrink-0">
              {/* Simple CSS-based Donut placeholder */}
              <div className="absolute inset-0 rounded-full border-[16px] border-[#f5f3f0] dark:border-[#2d2418]"></div>
              <div className="absolute inset-0 rounded-full border-[16px] border-[#f4a825] border-r-transparent border-b-transparent rotate-[30deg]"></div>
              <div className="flex flex-col items-center">
                <p className="text-3xl font-black text-[#181511] dark:text-[#f8f7f5]">100%</p>
                <p className="text-[10px] text-[#8a7b60] font-bold uppercase">Total</p>
              </div>
            </div>

            {/* Legends & Bars */}
            <div className="flex-1 w-full flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold flex items-center gap-2 text-[#181511] dark:text-white">
                    <span className="size-3 rounded-full bg-[#f4a825]"></span> Dakshina
                  </span>
                  <span className="text-sm font-black text-[#181511] dark:text-white">81%</span>
                </div>
                <div className="h-2 w-full bg-[#f5f3f0] dark:bg-[#2d2418] rounded-full overflow-hidden">
                  <div className="h-full bg-[#f4a825] rounded-full" style={{ width: "81%" }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold flex items-center gap-2 text-[#181511] dark:text-white">
                    <span className="size-3 rounded-full bg-[#fcd581]"></span> Travel Reimbursement
                  </span>
                  <span className="text-sm font-black text-[#181511] dark:text-white">15%</span>
                </div>
                <div className="h-2 w-full bg-[#f5f3f0] dark:bg-[#2d2418] rounded-full overflow-hidden">
                  <div className="h-full bg-[#fcd581] rounded-full" style={{ width: "15%" }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold flex items-center gap-2 text-[#181511] dark:text-white">
                    <span className="size-3 rounded-full bg-[#e6e2db]"></span> Food Allowance
                  </span>
                  <span className="text-sm font-black text-[#181511] dark:text-white">4%</span>
                </div>
                <div className="h-2 w-full bg-[#f5f3f0] dark:bg-[#2d2418] rounded-full overflow-hidden">
                  <div className="h-full bg-[#e6e2db] rounded-full" style={{ width: "4%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold text-[#181511] dark:text-white">Recent Transactions</h3>
          <a className="text-[#f4a825] text-sm font-bold" href="#">View All</a>
        </div>

        <div className="flex flex-col gap-3">
          {/* Transaction Item 1 */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#2d2418] border border-[#e6e2db] dark:border-[#3d3428] hover:border-[#f4a825]/50 transition-colors cursor-pointer shadow-sm">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-lg bg-[#f4a825]/10 text-[#f4a825] flex items-center justify-center">
                <span className="material-symbols-outlined">celebration</span>
              </div>
              <div>
                <p className="font-bold text-[#181511] dark:text-[#f8f7f5]">Delhi Wedding - Grand Hyatt</p>
                <p className="text-xs text-[#8a7b60] dark:text-[#a89980]">Oct 24, 2023 • Vivah Sanskar</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <p className="font-black text-[#181511] dark:text-[#f8f7f5]">₹52,750</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#078810]/10 text-[#078810] uppercase">
                <span className="size-1.5 rounded-full bg-[#078810] mr-1.5"></span> Paid
              </span>
            </div>
          </div>

          {/* Transaction Item 2 */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#2d2418] border border-[#e6e2db] dark:border-[#3d3428] hover:border-[#f4a825]/50 transition-colors cursor-pointer shadow-sm">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-lg bg-[#f4a825]/10 text-[#f4a825] flex items-center justify-center">
                <span className="material-symbols-outlined">home</span>
              </div>
              <div>
                <p className="font-bold text-[#181511] dark:text-[#f8f7f5]">Griha Pravesh - Noida Sec 150</p>
                <p className="text-xs text-[#8a7b60] dark:text-[#a89980]">Oct 22, 2023 • Puja Services</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <p className="font-black text-[#181511] dark:text-[#f8f7f5]">₹12,500</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#078810]/10 text-[#078810] uppercase">
                <span className="size-1.5 rounded-full bg-[#078810] mr-1.5"></span> Paid
              </span>
            </div>
          </div>

          {/* Transaction Item 3 */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#2d2418] border border-[#e6e2db] dark:border-[#3d3428] hover:border-[#f4a825]/50 transition-colors cursor-pointer shadow-sm">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-lg bg-[#f4a825]/10 text-[#f4a825] flex items-center justify-center">
                <span className="material-symbols-outlined">flight</span>
              </div>
              <div>
                <p className="font-bold text-[#181511] dark:text-[#f8f7f5]">Travel Reimbursement - Mumbai</p>
                <p className="text-xs text-[#8a7b60] dark:text-[#a89980]">Oct 20, 2023 • Airfare & Taxi</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <p className="font-black text-[#181511] dark:text-[#f8f7f5]">₹8,400</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#078810]/10 text-[#078810] uppercase">
                <span className="size-1.5 rounded-full bg-[#078810] mr-1.5"></span> Paid
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
