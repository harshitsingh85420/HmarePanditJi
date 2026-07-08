"use client";

import React from "react";
import { getPanchang } from "@/lib/panchang";

export interface PanchangStripProps {
  tithi?: string;
}

export function PanchangStrip({ tithi = "" }: PanchangStripProps) {
  const p = getPanchang(new Date(), tithi);
  return (
    <div className="flex items-center justify-between bg-card border border-[#E3C990] rounded-card px-4 py-2">
      <span className="t-hint text-softgrey font-hindi">
        🗓️ {p.hindiWeekday}, {p.hindiDate}
      </span>
      {p.tithi && <span className="t-hint text-saffron-500 font-semibold font-hindi">{p.tithi}</span>}
    </div>
  );
}

export default PanchangStrip;
