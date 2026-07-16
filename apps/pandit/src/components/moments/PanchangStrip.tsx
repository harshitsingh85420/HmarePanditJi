"use client";

import React from "react";
import { getPanchang } from "@/lib/panchang";

export interface PanchangStripProps {
  tithi?: string;
  /** True when TODAY has MuhuratDate rows (fed by the home container from
      GET /muhurat/pujas-for-date) — gates the शुभ-मुहूर्त chip. Truthful by
      construction: no data, no chip. */
  shubh?: boolean;
}

export function PanchangStrip({ tithi = "", shubh = false }: PanchangStripProps) {
  const p = getPanchang(new Date(), tithi);
  return (
    // Mockup screen 8: warm chandan strip (#FFF3E2), sand border, 🕉️ + weekday
    // in saffron-700. Tithi replaces the date when a source provides it
    // (still none in v1 — MuhuratDate carries windows, not tithis).
    <div className="flex items-center justify-between bg-[#FFF3E2] border border-sand rounded-[14px] px-[13px] py-[9px]">
      <span className="text-[13px] font-bold text-saffron-700 font-hindi">
        🕉️ {p.hindiWeekday} · {p.tithi || p.hindiDate}
      </span>
      {shubh && (
        <span className="text-[13px] font-bold text-leaf-700 bg-leaf-100 rounded-full px-[10px] py-[3px] font-hindi">
          शुभ मुहूर्त
        </span>
      )}
    </div>
  );
}

export default PanchangStrip;
