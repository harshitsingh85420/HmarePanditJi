"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { estimateSampleBooking, type MeterPrefs, type DemandLevel } from "@/lib/priceEstimate";

// PRICE-HONESTY METER — skinned to the Claude Design mockup (chip-toggle
// "अपनी माँग चुनिए — घटाकर देखिए") but the NUMBERS stay computed from the real
// costing rules (lib/priceEstimate, guard-tested). Where the mockup faked a
// figure (hotel — no code rule) we show "बुकिंग पर तय", never an invented ₹.
// Transform/opacity-only motion; reduced-motion → no animation.

type LeverKey = "travel" | "food" | "hotel";
const LEVERS: { key: LeverKey; icon: string; label: string; known: boolean }[] = [
  { key: "travel", icon: "🚗", label: "आने-जाने का किराया", known: true }, // self-drive ₹12/km
  { key: "food", icon: "🍲", label: "ज़्यादा भोजन भत्ता", known: true }, // above ₹1000/day
  { key: "hotel", icon: "🏨", label: "होटल में ठहरना", known: false }, // no rule → बुकिंग पर तय
];
const DEMAND_IDX: Record<DemandLevel, number> = { "कम": 0, "मध्यम": 1, "ज़्यादा": 2 };
const BARS = [
  { label: "कम माँग", h: 18 },
  { label: "मध्यम", h: 28 },
  { label: "ज़्यादा माँग", h: 38 },
];

function prefsFor(on: Record<LeverKey, boolean>): MeterPrefs {
  return {
    selfDrive: on.travel,
    train: false,
    flight: false,
    dailyFoodAllowance: on.food ? 2000 : null, // null = the ₹1000/day default
    stayAtHome: on.hotel ? false : true,
  };
}

export function PriceHonestyMeter({
  dakshina,
  initialPrefs,
}: {
  dakshina: number;
  initialPrefs?: Partial<Record<LeverKey, boolean>>;
}) {
  const reduce = useReducedMotion();
  const [on, setOn] = useState<Record<LeverKey, boolean>>({
    travel: initialPrefs?.travel ?? false,
    food: initialPrefs?.food ?? false,
    hotel: initialPrefs?.hotel ?? false,
  });

  const base = estimateSampleBooking(prefsFor({ travel: false, food: false, hotel: false }), dakshina).total;
  const { total, demandLevel } = estimateSampleBooking(prefsFor(on), dakshina);
  const activeIdx = DEMAND_IDX[demandLevel];

  const leverTag = (key: LeverKey, known: boolean): string => {
    if (!on[key]) return "— माफ़";
    if (!known) return "बुकिंग पर तय"; // honest: no code rule → never a fake ₹
    const withOnly = estimateSampleBooking(prefsFor({ travel: false, food: false, hotel: false, [key]: true } as Record<LeverKey, boolean>), dakshina).total;
    return "+₹" + (withOnly - base).toLocaleString("en-IN");
  };

  return (
    <div className="rounded-card border-2 border-saffron-200 bg-saffron-50 p-4 flex flex-col gap-3.5 font-hindi">
      <div className="text-[16px] font-extrabold text-temple-700">अपनी माँग चुनिए — घटाकर देखिए</div>

      <div className="flex flex-col gap-2.5">
        {LEVERS.map((l) => {
          const active = on[l.key];
          return (
            <button
              key={l.key}
              onClick={() => setOn((s) => ({ ...s, [l.key]: !s[l.key] }))}
              className={`flex items-center justify-between gap-2.5 w-full min-h-[54px] px-3.5 py-2.5 rounded-btn border-2 font-bold text-[15px] active:scale-[0.98] transition-transform ${
                active ? "bg-saffron-500 border-saffron-500 text-chandan" : "bg-white border-saffron-200 text-saffron-700"
              }`}
              aria-pressed={active}
            >
              <span className="flex items-center gap-2.5 text-left">
                <span className="text-[21px]">{l.icon}</span>
                {l.label}
              </span>
              <span className="text-[14px] font-extrabold whitespace-nowrap">{leverTag(l.key, l.known)}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center border-t-2 border-dashed border-saffron-200 pt-3">
        <span className="text-[16px] font-extrabold text-temple-700">एक बुकिंग का अनुमान</span>
        <motion.span
          key={total}
          initial={reduce ? false : { scale: 1 }}
          animate={reduce ? {} : { scale: [1, 1.14, 1] }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="text-[31px] font-extrabold text-leaf-700 tracking-tight"
        >
          ₹{total.toLocaleString("en-IN")}
        </motion.span>
      </div>

      {/* 3-bar demand position (height/opacity only — A12-safe) */}
      <div className="flex gap-2.5 items-end" aria-label={`माँग स्तर: ${demandLevel}`}>
        {BARS.map((b, i) => (
          <div key={b.label} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className={`w-full rounded-t-[7px] transition-colors ${i === activeIdx ? "bg-leaf-500" : "bg-saffron-200"}`}
              style={{ height: `${b.h}px` }}
            />
            <span className={`text-[12px] ${i === activeIdx ? "text-leaf-700 font-extrabold" : "text-softgrey font-medium"}`}>{b.label}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2.5 items-start bg-leaf-100 rounded-[13px] px-3.5 py-2.5">
        <span className="text-[19px] leading-tight">🙏</span>
        <span className="text-[13px] font-semibold text-leaf-700 leading-snug">
          कम माँग = ज़्यादा बुकिंग। इस दाम पर ज़्यादा परिवार आपको बुला सकते हैं।
        </span>
      </div>
    </div>
  );
}
