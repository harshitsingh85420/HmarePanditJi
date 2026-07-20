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
import { Button } from "@/components/ui/Button";
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
      {/* CANON frame 3: the garland hangs straight off the top of the frame —
          there is NO sindoor header band and no white-on-gradient title. The
          screen's title is a plain centred 29/900 line on the cream field. */}
      <header className="shrink-0">
        <Toran tone="onSindoor" />
      </header>

      {/* Canon column: padding 14px 22px 16px, gap 16px. */}
      <div className="flex-1 min-h-0 flex flex-col px-[22px] pt-[14px] pb-4 gap-4">
        <div className="relative shrink-0 min-h-[52px] flex items-center justify-center">
          {/* Canon draws no back control on this frame; the screen really can
              go back (voice "पीछे" does), so the affordance stays — rendered
              in canon's own card idiom instead of the old white/90 disc. */}
          <button
            onClick={onBack}
            aria-label={t("common.back")}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-full bg-card border-2 border-sand-200 text-temple-700 text-[22px] flex items-center justify-center active:scale-90 transition-transform"
          >
            ←
          </button>
          <h1 className="font-display text-[29px] font-black text-temple-700 text-center leading-tight px-[58px]">
            {t("pratham.langListTitle")}
          </h1>
        </div>

        {/* Canon tile grammar: flat #FFFDF8 fill, 2px #E7DCC9 hairline, r18,
            padding 18/14, LEFT-aligned stack with a 3px gap — native name
            26/800 #341A13 over the latin label. The armed tile swaps to the
            peach fill, a 2.5px sindoor border, a 26px ✓ disc at 10/10, a 900
            #7A250E name and canon's soft sindoor lift. */}
        <main className="flex-1 min-h-0 overflow-y-auto -mx-1 px-1">
          <div className="grid grid-cols-2 gap-[13px] content-start">
            {TILES.map((tile) => {
              const native = LANG_NATIVE_NAME[tile.code];
              const isPending = pending === tile.code;
              return (
                <button
                  key={tile.code}
                  onClick={() => tapTile(tile)}
                  className={`relative rounded-tile py-[18px] px-[14px] flex flex-col items-start text-left gap-[3px] active:scale-[0.97] transition-transform ${
                    isPending
                      ? "bg-saffron-50 border-[2.5px] border-saffron-500 shadow-sindoor-soft"
                      : "bg-card border-2 border-sand-200"
                  }`}
                  aria-label={isPending ? `${native} — ${t("pratham.langTapAgain")}` : native}
                  aria-pressed={isPending}
                >
                  {isPending && (
                    <span
                      className="absolute top-[10px] right-[10px] w-[26px] h-[26px] rounded-full bg-saffron-500 text-white text-[18px] font-bold flex items-center justify-center leading-none"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  )}
                  <span
                    className={`text-[26px] font-hindi leading-tight ${
                      isPending ? "text-saffron-700 font-black" : "text-temple-700 font-extrabold"
                    }`}
                  >
                    {native}
                  </span>
                  {/* LAW > CANON: canon sets this latin label at 14px. The
                      18sp body floor wins; 18/600 in the same #8A6F5C. */}
                  <span className="text-[18px] font-semibold text-softgrey leading-tight">
                    {tile.subtitle ?? tile.lang}
                  </span>
                  {burstOn === tile.code && (
                    <PetalBurst count={4} onEnd={() => setBurstOn(null)} />
                  )}
                </button>
              );
            })}
          </div>
        </main>

        {/* Canon's explicit commit step. It does not replace either existing
            path: arm a tile (first tap), then tap it again / say the name /
            press आगे बढ़ें. Disabled until something is armed, so it can never
            select nothing. size="md" is canon's exact CTA (62px / 21px / 800). */}
        <Button
          variant="primary"
          size="md"
          fullWidth
          disabled={!pending}
          onClick={() => {
            const tile = TILES.find((x) => x.code === pending);
            if (tile) selectTile(tile);
          }}
        >
          {t("common.next")}
        </Button>
      </div>

      {/* Canon puts शिष्य centred under the CTA (padding 2px 0 16px), not
          docked beside it. */}
      <footer className="shrink-0 flex justify-center pt-[2px] pb-4">
        <ShishyaOrb />
      </footer>
    </div>
  );
}
