"use client";

// ─────────────────────────────────────────────────────────────
// प्रथम आरती D3 — Language list. 11 tiles in a 2-col grid; each tile
// tinted by a rotating festive accent (12% bg, native initial letter
// at 100% accent), native name 22px. First tap SPEAKS the name in its
// own language; second tap on the same tile SELECTS it — the pending
// tile wears a gold ring and fires a tiny 4-petal 🌼 burst. No mic
// icons (the always-listening loop owns voice). Layout grammar:
// 100dvh column, one scroller, footer = orb slot.
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { type SupportedLanguage, type ScriptPreference } from "@/lib/onboarding-store";
import { t } from "@/lib/i18n";
import { Toran } from "@/components/ui/Toran";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { useScreenVoice } from "@/hooks/useScreenVoice";
import { FESTIVE_ACCENTS, PetalBurst } from "@/components/moments/SlideCanvas";
import { LANG_TO_BCP47, LANG_NATIVE_NAME, type LangCode } from "@/lib/languageDetect";
import { speakWithSarvam } from "@/lib/sarvam-tts";

interface LanguageListScreenProps {
  language: SupportedLanguage | null;
  scriptPreference?: ScriptPreference | null;
  onSelect: (lang: SupportedLanguage) => void;
  onBack: () => void;
  onLanguageChange: () => void;
}

// The 11 selectable languages (matches the orchestrator's mapping)
const TILES: Array<{ lang: SupportedLanguage; code: LangCode }> = [
  { lang: "Hindi", code: "hi" },
  { lang: "Marathi", code: "mr" },
  { lang: "Bengali", code: "bn" },
  { lang: "Tamil", code: "ta" },
  { lang: "Telugu", code: "te" },
  { lang: "Kannada", code: "kn" },
  { lang: "Gujarati", code: "gu" },
  { lang: "Punjabi", code: "pa" },
  { lang: "Malayalam", code: "ml" },
  { lang: "Odia", code: "or" },
  { lang: "English", code: "en" },
];

export default function LanguageListScreen({ onSelect, onBack }: LanguageListScreenProps) {
  // First tap arms a tile (speaks its name); second tap selects it.
  const [pending, setPending] = useState<LangCode | null>(null);
  const [burstOn, setBurstOn] = useState<LangCode | null>(null);

  useScreenVoice(t("pratham.langListVoice"));

  const tapTile = (tile: { lang: SupportedLanguage; code: LangCode }) => {
    if (pending === tile.code) {
      onSelect(tile.lang);
      return;
    }
    setPending(tile.code);
    setBurstOn(tile.code);
    void speakWithSarvam({
      text: LANG_NATIVE_NAME[tile.code],
      languageCode: LANG_TO_BCP47[tile.code] as never,
    });
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
            {t("pratham.langListTitle")}
          </h1>
        </div>
        <Toran tone="onSindoor" className="bg-saffron-500" />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {TILES.map((tile, i) => {
            const accent = FESTIVE_ACCENTS[i % FESTIVE_ACCENTS.length];
            const native = LANG_NATIVE_NAME[tile.code];
            const isPending = pending === tile.code;
            return (
              <button
                key={tile.code}
                onClick={() => tapTile(tile)}
                className={`relative min-h-[104px] rounded-card p-3 flex flex-col items-center justify-center gap-1 active:scale-[0.97] transition-transform ${
                  isPending ? "ring-4 ring-gold" : ""
                }`}
                style={{ backgroundColor: `${accent.hex}1F` }}
                aria-label={isPending ? `${native} — ${t("pratham.langTapAgain")}` : native}
                aria-pressed={isPending}
              >
                <span
                  className="text-[34px] leading-none font-bold font-hindi"
                  style={{ color: accent.textHex }}
                  aria-hidden="true"
                >
                  {native.slice(0, 2)}
                </span>
                <span className="text-[22px] font-bold text-ink font-hindi leading-tight">{native}</span>
                {isPending && (
                  <span className="text-[13px] font-semibold text-temple-600 font-hindi">
                    {t("pratham.langTapAgain")}
                  </span>
                )}
                {burstOn === tile.code && (
                  <PetalBurst count={4} onEnd={() => setBurstOn(null)} />
                )}
              </button>
            );
          })}
        </div>
      </main>

      {/* Footer: orb slot */}
      <footer className="shrink-0 px-4 py-2 bg-cream/95 backdrop-blur border-t border-saffron-100 flex justify-center">
        <ShishyaOrb />
      </footer>
    </div>
  );
}
