"use client";
import React, { useState } from "react";

export interface PriceBreakdownData {
  dakshinaAmount: number;
  travelCost?: number;
  foodAllowanceAmount?: number;
  accommodationCost?: number;
  platformFee: number;
  travelServiceFee?: number;
  platformFeeGst: number;
  travelServiceFeeGst?: number;
  grandTotal: number;
  panditPayout?: number;
}

export interface PriceBreakdownProps {
  breakdown: PriceBreakdownData;
  showPanditPayout?: boolean;
  className?: string;
}

function fmt(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function PriceBreakdown({
  breakdown,
  showPanditPayout = false,
  className = "",
}: PriceBreakdownProps) {
  const [gstOpen, setGstOpen] = useState(false);

  const totalGst = (breakdown.platformFeeGst ?? 0) + (breakdown.travelServiceFeeGst ?? 0);

  return (
    <div className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden ${className}`}>
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Price Breakdown</h3>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {/* Dakshina */}
        <Row label="Pandit Dakshina" amount={breakdown.dakshinaAmount} note="(GST exempt)" />

        {/* Travel */}
        {breakdown.travelCost != null && breakdown.travelCost > 0 && (
          <Row label="Travel Cost" amount={breakdown.travelCost} />
        )}

        {/* Food allowance */}
        {breakdown.foodAllowanceAmount != null && breakdown.foodAllowanceAmount > 0 && (
          <Row label="Food Allowance" amount={breakdown.foodAllowanceAmount} />
        )}

        {/* Accommodation */}
        {breakdown.accommodationCost != null && breakdown.accommodationCost > 0 && (
          <Row label="Accommodation" amount={breakdown.accommodationCost} />
        )}

        {/* Platform fee */}
        <Row label="Platform Fee (15%)" amount={breakdown.platformFee} muted />

        {/* Travel service fee */}
        {breakdown.travelServiceFee != null && breakdown.travelServiceFee > 0 && (
          <Row label="Travel Service Fee (5%)" amount={breakdown.travelServiceFee} muted />
        )}

        {/* GST section — collapsible */}
        <div>
          <button
            type="button"
            onClick={() => setGstOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-orange-600 dark:text-orange-400">GST</span>
              GST on Platform Fees (18%)
            </span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{fmt(totalGst)}</span>
              <span className="material-symbols-outlined text-sm">
                {gstOpen ? "expand_less" : "expand_more"}
              </span>
            </div>
          </button>

          {gstOpen && (
            <div className="bg-slate-50/60 dark:bg-slate-800/40 px-6 py-2 space-y-1">
              <SubRow label="GST on Platform Fee" amount={breakdown.platformFeeGst} />
              {breakdown.travelServiceFeeGst != null && breakdown.travelServiceFeeGst > 0 && (
                <SubRow label="GST on Travel Service Fee" amount={breakdown.travelServiceFeeGst} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grand total */}
      <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-t-2 border-amber-200 dark:border-amber-700 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Grand Total</span>
        <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
          {fmt(breakdown.grandTotal)}
        </span>
      </div>

      {/* Pandit payout (admin / pandit view) */}
      {showPanditPayout && breakdown.panditPayout != null && (
        <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800 flex items-center justify-between">
          <span className="text-xs text-green-700 dark:text-green-400 font-medium">Pandit Payout</span>
          <span className="text-sm font-semibold text-green-700 dark:text-green-400">
            {fmt(breakdown.panditPayout)}
          </span>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  amount,
  note,
  muted,
}: {
  label: string;
  amount: number;
  note?: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className={`text-sm ${muted ? "text-slate-500 dark:text-slate-400" : "text-slate-700 dark:text-slate-300"}`}>
        {label}
        {note && <span className="ml-1 text-xs text-slate-400">{note}</span>}
      </span>
      <span className={`text-sm font-semibold ${muted ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>
        {fmt(amount)}
      </span>
    </div>
  );
}

function SubRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
      <span>{label}</span>
      <span>{fmt(amount)}</span>
    </div>
  );
}
