"use client";

import { estimateSampleBooking, type MeterPrefs, type DemandLevel } from "@/lib/priceEstimate";

const LEVELS: DemandLevel[] = ["कम", "मध्यम", "ज़्यादा"];

/**
 * PRICE-HONESTY METER — the founder's "missing note", COMPUTED (never a slogan).
 * Recomputes live as `prefs` change. Costs with a real code rule show a number;
 * rule-less costs (hotel/flight) show "बुकिंग पर तय" — never an invented figure.
 * The 3-bar position + the nudge carry the "कम माँग = ज़्यादा बुकिंग" truth.
 */
export function PriceHonestyMeter({ prefs, dakshina }: { prefs: MeterPrefs; dakshina: number }) {
  const { total, lines, demandLevel } = estimateSampleBooking(prefs, dakshina);
  const activeIdx = LEVELS.indexOf(demandLevel);

  return (
    <div className="rounded-card border-2 border-saffron-200 bg-saffron-50 p-4 flex flex-col gap-3">
      <div className="text-[15px] font-bold text-temple-700 font-hindi">
        एक नमूना बुकिंग पर अनुमानित कुल
      </div>

      <div className="flex flex-col gap-1.5">
        {lines.map((l, i) => (
          <div key={i} className="flex justify-between items-baseline text-[15px] font-hindi">
            <span className="text-softgrey">{l.label}</span>
            {l.amount !== null ? (
              <span className="font-bold text-ink">₹{l.amount.toLocaleString("en-IN")}</span>
            ) : (
              <span className="text-saffron-700 text-[13px]">{l.note}</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center border-t-2 border-dashed border-saffron-300 pt-2">
        <span className="text-[17px] font-bold text-ink font-hindi">कुल (ज्ञात)</span>
        <span className="text-[22px] font-bold text-leaf-700">₹{total.toLocaleString("en-IN")}</span>
      </div>

      {/* 3-bar demand position */}
      <div className="flex gap-2 items-end pt-1" aria-label={`माँग स्तर: ${demandLevel}`}>
        {LEVELS.map((lvl, i) => (
          <div key={lvl} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-t transition-colors ${i === activeIdx ? "bg-leaf-600" : "bg-saffron-200"}`}
              style={{ height: `${14 + i * 12}px` }}
            />
            <span className={`text-[12px] font-hindi ${i === activeIdx ? "text-leaf-700 font-bold" : "text-softgrey"}`}>
              {lvl} माँग
            </span>
          </div>
        ))}
      </div>

      <p className="text-[14px] font-hindi text-temple-600 leading-snug">
        आपकी माँग जितनी कम, आपका दाम उतना कम — इस दाम पर ज़्यादा परिवार आपको बुला सकते हैं। 🙏
      </p>
    </div>
  );
}
