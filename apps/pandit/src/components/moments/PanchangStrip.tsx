"use client";

import React from "react";
import { getPanchang } from "@/lib/panchang";

export interface PanchangStripProps {
  tithi?: string;
}

export function PanchangStrip({ tithi = "" }: PanchangStripProps) {
  const p = getPanchang(new Date(), tithi);
  return (
    // Mockup screen 8: warm chandan strip (#FFF3E2), sand border, 🕉️ + weekday
    // in saffron-700. Tithi replaces the date when a source provides it; the
    // शुभ-मुहूर्त chip needs muhurat data (flagged, not built).
    <div className="flex items-center justify-between bg-[#FFF3E2] border border-sand rounded-[14px] px-[13px] py-[9px]">
      <span className="text-[13px] font-bold text-saffron-700 font-hindi">
        🕉️ {p.hindiWeekday} · {p.tithi || p.hindiDate}
      </span>
      {p.tithi && (
        <span className="text-[13px] font-bold text-leaf-700 bg-leaf-100 rounded-full px-[10px] py-[3px] font-hindi">
          शुभ मुहूर्त
        </span>
      )}
    </div>
  );
}

export default PanchangStrip;
