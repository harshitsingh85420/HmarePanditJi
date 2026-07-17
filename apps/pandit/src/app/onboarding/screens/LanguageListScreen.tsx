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
import { useVoiceScreen } from "@/hooks/useVoiceScreen";
import { BACK } from "@/lib/voiceGrammar";
import { PetalBurst } from "@/components/moments/SlideCanvas";
import { LANG_TO_BCP47, LANG_NATIVE_NAME, type LangCode } from "@/lib/languageDetect";
import { speakWithSarvam } from "@/lib/sarvam-tts";
import { voiceController } from "@/lib/voiceController";

interface LanguageListScreenProps {
  language: SupportedLanguage | null;
  scriptPreference?: ScriptPreference | null;
  onSelect: (lang: SupportedLanguage) => void;
  onBack: () => void;
  onLanguageChange: () => void;
}

// The 11 selectable languages (matches the orchestrator's mapping).
// spoken = how the name arrives in a HINDI Deepgram transcript (the
// pandit says "मराठी", not "मराठी" in Marathi script — native-script
// names never appear in a hi-language STT result).
const TILES: Array<{ lang: SupportedLanguage; code: LangCode; spoken: string[]; subtitle?: string }> = [
  { lang: "Hindi", code: "hi", spoken: ["हिंदी", "हिन्दी", "hindi"] },
  { lang: "Marathi", code: "mr", spoken: ["मराठी", "marathi"] },
  { lang: "Bengali", code: "bn", spoken: ["बंगाली", "बांग्ला", "bangla", "bengali"] },
  { lang: "Tamil", code: "ta", spoken: ["तमिल", "तामिल", "tamil"] },
  { lang: "Telugu", code: "te", spoken: ["तेलुगु", "telugu"] },
  { lang: "Kannada", code: "kn", spoken: ["कन्नड़", "कन्नड", "kannada"] },
  { lang: "Gujarati", code: "gu", spoken: ["गुजराती", "gujarati"] },
  { lang: "Punjabi", code: "pa", spoken: ["पंजाबी", "punjabi"] },
  { lang: "Malayalam", code: "ml", spoken: ["मलयालम", "malayalam"] },
  { lang: "Odia", code: "or", spoken: ["उड़िया", "ओड़िया", "odia", "oriya"] },
  // L1: English is a full language option — Hindi-script subtitle so a
  // Devanagari-only reader can still find it; "angrezi" covers the
  // romanized Deepgram transcript of अंग्रेज़ी.
  { lang: "English", code: "en", spoken: ["english", "अंग्रेजी", "अंग्रेज़ी", "इंग्लिश", "angrezi"], subtitle: "अंग्रेज़ी" },
];

export default function LanguageListScreen({ onSelect, onBack }: LanguageListScreenProps) {
  // First tap arms a tile (speaks its name); second tap selects it.
  const [pending, setPending] = useState<LangCode | null>(null);
  const [burstOn, setBurstOn] = useState<LangCode | null>(null);

  // P1: THE single activation path — the row's second tap and a voice
  // match call this SAME function; it logs before invoking so the live
  // panel shows exactly when activation started.
  const selectTile = (tile: { lang: SupportedLanguage; code: LangCode }) => {
    voiceController.debug(`lang-list: select ${tile.code} → activating`);
    onSelect(tile.lang);
  };

  // J2: SPEAKING a language's name selects it directly (one utterance —
  // the two-tap ceremony is a touch affordance, not a voice one); पीछे
  // returns. The narration hook arms the perpetual listen.
  useVoiceScreen({
    narration: t("pratham.langListVoice"),
    helpText: t("help.languageList"),
    commands: [
      ...TILES.map((tile) => ({
        keywords: tile.spoken,
        action: () => selectTile(tile),
      })),
      { keywords: BACK, action: onBack },
    ],
  });

  const tapTile = (tile: { lang: SupportedLanguage; code: LangCode }) => {
    if (pending === tile.code) {
      selectTile(tile);
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
        {/* Mockup frame 3 tile grammar: white #FFFDF8 cards, 2px sand
            border, r18; native name 26/800 + latin subtitle; the armed
            (pending) tile turns saffron-tinted with a sindoor border and
            a ✓ badge — replaces the old festive-accent tiles/gold ring. */}
        <div className="grid grid-cols-2 gap-3">
          {TILES.map((tile) => {
            const native = LANG_NATIVE_NAME[tile.code];
            const isPending = pending === tile.code;
            return (
              <button
                key={tile.code}
                onClick={() => tapTile(tile)}
                className={`relative min-h-[104px] rounded-[18px] border-2 p-3 flex flex-col items-center justify-center gap-1 active:scale-[0.97] transition-transform ${
                  isPending
                    ? "bg-saffron-50 border-saffron-500"
                    : "bg-card border-sand-200"
                }`}
                aria-label={isPending ? `${native} — ${t("pratham.langTapAgain")}` : native}
                aria-pressed={isPending}
              >
                {isPending && (
                  <span
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-saffron-500 text-white text-[14px] font-bold flex items-center justify-center"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                )}
                <span className={`text-[26px] font-extrabold font-hindi leading-tight ${isPending ? "text-saffron-700" : "text-ink"}`}>
                  {native}
                </span>
                <span className="text-[14px] font-semibold text-softgrey leading-tight">
                  {tile.subtitle ?? tile.lang}
                </span>
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
