"use client";

// ─────────────────────────────────────────────────────────────
// प्रथम आरती D1 — Manual city picker. 5 big city cards, each with a
// different festive-accent left border (rani/neel/genda/kesar/gulal),
// plus an always-visible free-text field. No mic UI (the always-
// listening loop owns voice; mic arrives with tutorial slide 5).
// Layout grammar: 100dvh column, one scroller, footer = orb slot.
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { t } from "@/lib/i18n";
import { Toran } from "@/components/ui/Toran";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { useScreenVoice } from "@/hooks/useScreenVoice";
import { useVoiceCommands } from "@/hooks/useVoiceScreen";
import { BACK } from "@/lib/voiceGrammar";
import { FESTIVE_ACCENTS } from "@/components/moments/SlideCanvas";

interface ManualCityScreenProps {
  onCitySelected: (city: string) => void;
  onBack: () => void;
  onLanguageChange?: () => void;
}

// Walk पP0 #4: the list was Delhi-NCR only — a काशी pandit's city was
// absent, "वाराणसी" matched no keyword, and the fallback demanded typing.
// Now the cards are the pandits' own pilgrimage centres (वाराणसी first),
// each speakable by its common names (बनारस/काशी, इलाहाबाद, गुड़गांव …).
// card label + the transcript spellings Deepgram actually produces
const POPULAR_CITIES = ["वाराणसी", "प्रयागराज", "अयोध्या", "मथुरा", "हरिद्वार", "उज्जैन", "दिल्ली", "गुरुग्राम"];
const CITY_SPOKEN: Record<string, string[]> = {
  "वाराणसी": ["वाराणसी", "बनारस", "काशी", "varanasi", "banaras", "kashi"],
  "प्रयागराज": ["प्रयागराज", "इलाहाबाद", "prayagraj", "allahabad"],
  "अयोध्या": ["अयोध्या", "ayodhya"],
  "मथुरा": ["मथुरा", "वृंदावन", "mathura", "vrindavan"],
  "हरिद्वार": ["हरिद्वार", "हरद्वार", "haridwar"],
  "उज्जैन": ["उज्जैन", "ujjain"],
  "दिल्ली": ["दिल्ली", "delhi", "दिली"],
  "गुरुग्राम": ["गुरुग्राम", "गुड़गांव", "गुड़गाँव", "गुरगांव", "gurgaon", "gurugram"],
};

export default function ManualCityScreen({ onCitySelected, onBack }: ManualCityScreenProps) {
  const [cityInput, setCityInput] = useState("");

  useScreenVoice(t("pratham.cityVoice"));

  // J2: speaking a card's city selects it; पीछे returns to the
  // location screen. Other cities stay type-to-enter for now.
  useVoiceCommands(
    [
      ...POPULAR_CITIES.map((city) => ({
        keywords: CITY_SPOKEN[city] ?? [city],
        action: () => onCitySelected(city),
      })),
      { keywords: BACK, action: onBack },
    ],
    t("help.manualCity"),
  );

  const submitTyped = () => {
    const v = cityInput.trim();
    if (v) onCitySelected(v);
  };

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      {/* Festive header band */}
      <header className="shrink-0">
        <div className="h-[60px] bg-gradient-to-r from-genda to-saffron-500 px-4 flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label={t("common.back")}
            className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-white/90 shadow-card active:scale-90 flex items-center justify-center text-[18px] transition-all"
          >
            ←
          </button>
          <h1 className="font-display text-[22px] text-white flex-1 text-center pr-14">
            {t("pratham.cityTitle")}
          </h1>
        </div>
        <Toran tone="onSindoor" className="bg-saffron-500" />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-6 flex flex-col gap-3">
        {/* Free-text field — always visible */}
        <div className="flex gap-2">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitTyped();
            }}
            placeholder={t("pratham.cityInputLabel")}
            className="flex-1 min-w-0 h-[56px] min-h-[56px] px-4 border-2 border-saffron-300 rounded-btn text-[18px] text-ink bg-white focus:outline-none focus:border-saffron-500 font-hindi"
          />
          {cityInput.trim() && (
            <button
              onClick={submitTyped}
              className="shrink-0 whitespace-nowrap min-h-[56px] px-4 bg-saffron-500 text-[#FFF3EA] rounded-btn text-[18px] font-bold font-hindi active:scale-[0.97] transition-transform"
            >
              {t("pratham.cityGo")}
            </button>
          )}
        </div>

        {/* 5 city cards — festive accent left borders, one per accent */}
        <div className="flex flex-col gap-3 mt-1">
          {POPULAR_CITIES.map((city, i) => {
            const accent = FESTIVE_ACCENTS[i % FESTIVE_ACCENTS.length];
            return (
              <button
                key={city}
                onClick={() => onCitySelected(city)}
                className="w-full min-h-[64px] bg-white rounded-card shadow-card px-5 text-left text-[22px] font-bold text-ink font-hindi active:scale-[0.98] transition-transform"
                style={{ borderLeft: `6px solid ${accent.hex}` }}
              >
                {city}
              </button>
            );
          })}
        </div>
      </main>

      {/* Footer: orb slot (the cards themselves are the primary action) */}
      <footer className="shrink-0 px-4 py-2 bg-cream/95 backdrop-blur border-t border-saffron-100 flex justify-center">
        <ShishyaOrb />
      </footer>
    </div>
  );
}
