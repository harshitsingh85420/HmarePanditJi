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

// card label + the transcript spellings Deepgram actually produces
const POPULAR_CITIES = ["दिल्ली", "नोएडा", "गुरुग्राम", "गाज़ियाबाद", "फ़रीदाबाद"];
const CITY_SPOKEN: Record<string, string[]> = {
  "दिल्ली": ["दिल्ली", "delhi", "दिली"],
  "नोएडा": ["नोएडा", "नोयडा", "noida"],
  "गुरुग्राम": ["गुरुग्राम", "गुड़गांव", "गुड़गाँव", "गुरगांव", "gurgaon", "gurugram"],
  "गाज़ियाबाद": ["गाज़ियाबाद", "गाजियाबाद", "ghaziabad"],
  "फ़रीदाबाद": ["फ़रीदाबाद", "फरीदाबाद", "faridabad"],
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
      {/* canon frame 2 chrome (this is स्थान's जगह-बदलिए branch): the garland
          + a plain dark centered title. Back stays as the canon circle. */}
      <header className="shrink-0">
        <Toran variant="garland" count={11} />
      </header>
      <div className="shrink-0 relative min-h-[52px] flex items-center justify-center px-[22px] mt-1">
        <button
          onClick={onBack}
          aria-label={t("common.back")}
          className="absolute left-3 w-[52px] h-[52px] min-h-[52px] min-w-[52px] rounded-full bg-card shadow-card flex items-center justify-center active:scale-90 transition-all focus:outline-none focus:ring-2 focus:ring-saffron-200"
        >
          <span className="material-symbols-outlined text-[24px] leading-none text-saffron-700" aria-hidden="true">
            arrow_back
          </span>
        </button>
        <h1 className="text-[29px] font-black text-temple-700 font-hindi text-center leading-[1.25] px-[58px]">
          {t("pratham.cityTitle")}
        </h1>
      </div>

      <main className="flex-1 overflow-y-auto px-[22px] pt-[14px] pb-[18px] flex flex-col gap-4">
        {/* Free-text field — always visible */}
        <div className="flex gap-[10px]">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitTyped();
            }}
            placeholder={t("pratham.cityInputLabel")}
            className="flex-1 min-w-0 h-[56px] min-h-[56px] px-[18px] border-[1.5px] border-sand-100 rounded-field text-[18px] font-semibold text-ink bg-card shadow-soft focus:outline-none focus:border-saffron-500 font-hindi"
          />
          {cityInput.trim() && (
            <button
              onClick={submitTyped}
              className="shrink-0 whitespace-nowrap min-h-[56px] px-5 bg-saffron-500 text-chandan rounded-cta text-[18px] font-extrabold font-hindi shadow-btn active:scale-[0.97] transition-transform"
            >
              {t("pratham.cityGo")}
            </button>
          )}
        </div>

        {/* 5 city cards — festive accent left borders, one per accent */}
        <div className="flex flex-col gap-[13px] mt-1">
          {POPULAR_CITIES.map((city, i) => {
            const accent = FESTIVE_ACCENTS[i % FESTIVE_ACCENTS.length];
            return (
              <button
                key={city}
                onClick={() => onCitySelected(city)}
                className="w-full min-h-[64px] bg-cardsurface border-2 border-sand-200 rounded-tile shadow-surface px-[18px] text-left text-[22px] font-extrabold text-ink font-hindi active:scale-[0.98] transition-transform"
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
