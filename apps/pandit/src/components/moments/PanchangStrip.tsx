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
    // CANON frame 12: bg #FFF3E2 (peach), 1.5px #F0DFC4 (sand) hairline,
    // 14px radius, 9px/13px padding, 9px gap, 🕉️ one step larger than the
    // label, and the शुभ chip in leaf on #E4F3E9 at a 999px pill radius.
    // LAW > CANON: canon sets the label at 13px; the 18sp floor keeps it at 18.
    <div className="flex items-center gap-[9px] bg-peach border-[1.5px] border-sand rounded-[14px] px-[13px] py-[9px]">
      <span className="text-[20px] leading-none" role="img" aria-hidden="true">
        🕉️
      </span>
      <span className="text-[18px] font-bold text-saffron-700 font-hindi leading-tight">
        {p.hindiWeekday} · {p.tithi || p.hindiDate}
      </span>
      {shubh && (
        <span className="ml-auto text-[18px] font-bold text-leaf-700 bg-leaf-100 rounded-chip px-[10px] py-[3px] font-hindi leading-tight">
          शुभ मुहूर्त
        </span>
      )}
    </div>
  );
}

export default PanchangStrip;
