"use client";

// ─────────────────────────────────────────────────────────────
// V1a EVIDENCE ROUTE (dev QA only, no nav links point here):
// "हमारे पंडित जी" at 40px across display-font candidates so the
// ंड (anusvara-on-ड) cluster can be compared eye-to-eye. The founder
// sees पण्डित in the heading while production HTML carries पंडित —
// the culprit is glyph rendering, and this page is the lineup.
// ─────────────────────────────────────────────────────────────

import React from "react";
import { Yatra_One, Baloo_2 } from "next/font/google";

const yatra = Yatra_One({ subsets: ["devanagari"], weight: "400" });
const baloo = Baloo_2({ subsets: ["devanagari"], weight: "700" });

const SAMPLE = "हमारे पंडित जी";
const CLUSTER = "पंडित ंड ण्ड";
const MONEY = "₹11,000 · ₹63,000";

export default function FontComparePage() {
  const rows: Array<{ name: string; style: React.CSSProperties; cls?: string }> = [
    { name: "Yatra One (current display)", style: {}, cls: yatra.className },
    { name: "Noto Sans Devanagari 700 (candidate)", style: { fontFamily: "var(--font-noto)", fontWeight: 700 } },
    { name: "Tiro Devanagari Hindi (body face)", style: { fontFamily: "var(--font-tiro)", fontWeight: 400 } },
    { name: "Baloo 2 700 (candidate)", style: {}, cls: baloo.className },
  ];
  return (
    <main className="min-h-screen bg-cream text-ink p-4 flex flex-col gap-5">
      {rows.map((r) => (
        <section key={r.name} className="bg-white rounded-xl border border-saffron-100 p-3">
          <p className="text-[12px] text-softgrey mb-1">{r.name}</p>
          <p className={r.cls} style={{ fontSize: 40, lineHeight: 1.3, ...r.style }}>{SAMPLE}</p>
          <p className={r.cls} style={{ fontSize: 56, lineHeight: 1.2, ...r.style }}>{CLUSTER}</p>
          <p className={r.cls} style={{ fontSize: 28, ...r.style }}>{MONEY}</p>
        </section>
      ))}
    </main>
  );
}
