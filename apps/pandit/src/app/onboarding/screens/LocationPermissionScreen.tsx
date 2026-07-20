"use client";

// ─────────────────────────────────────────────────────────────
// प्रथम आरती D1 — Location permission. Layout grammar: 100dvh column,
// one scrollable main, fixed footer with THE primary [अनुमति दें] +
// शिष्य orb. Header = festive band (genda→sindoor) with toran.
// Illustration = neel-tint canvas: 🛕 + 📍 (one soft bounce).
// Geolocation grant → reverse geocode → onGranted(city, state);
// deny/error → onDenied() (manual city).
// ─────────────────────────────────────────────────────────────

import React, { useRef, useState } from "react";
import type { SupportedLanguage } from "@/lib/onboarding-store";
import { t } from "@/lib/i18n";
import { Toran } from "@/components/ui/Toran";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { useScreenVoice } from "@/hooks/useScreenVoice";
import { useVoiceCommands } from "@/hooks/useVoiceScreen";
import { YES, NO } from "@/lib/voiceGrammar";
import { voiceController } from "@/lib/voiceController";
import { PopupPointer } from "@/components/moments/PopupPointer";

// ── CANON frame 1 map canvas ────────────────────────────────────────
// Canon draws a real map, it does not tint a box: sage 135° gradient
// field, two crossing street hatches, two clay-coloured roads (one
// carrying a 1px lift), a sindoor halo, ONE pulsing ring and the pin
// with its drop-shadow. Every literal below is read from
// design/canon/हमारे पंडित जी.dc.html frame 1.
function CanonMapCanvas({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-surface border-2 border-sand-200 bg-tile-sage ${className}`}
      aria-hidden="true"
    >
      {/* street hatching — two repeating gradients at 38° / -52° */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(38deg,transparent 0 34px,rgba(255,255,255,.5) 34px 37px),repeating-linear-gradient(-52deg,transparent 0 46px,rgba(160,130,90,.14) 46px 48px)",
        }}
      />
      {/* two clay roads */}
      <div className="absolute top-[44%] left-[22%] h-[7px] w-[56%] -rotate-[8deg] rounded-[4px] bg-[#F4E4C4] shadow-[0_1px_2px_rgba(0,0,0,.1)]" />
      <div className="absolute top-[62%] left-[8%] h-[6px] w-[60%] rotate-[6deg] rounded-[4px] bg-[#F4E4C4]" />
      {/* sindoor halo under the pin */}
      <div className="absolute top-1/2 left-1/2 -ml-[60px] -mt-[60px] h-[120px] w-[120px] rounded-full bg-halo-sindoor" />
      {/* one pulsing ring (transform is owned by the animation, so the
          ring is centred with margins, not with a translate) */}
      <div className="absolute top-1/2 left-1/2 -ml-[35px] -mt-[35px] h-[70px] w-[70px] animate-pulse-ring rounded-full border-[3px] border-[rgba(178,58,26,.4)] motion-reduce:animate-none" />
      {/* the pin: wrapper holds the position, span holds the motion */}
      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
        <span className="pa-bounce-once select-none text-[52px] leading-none drop-shadow-[0_4px_6px_rgba(0,0,0,.3)]">
          📍
        </span>
      </div>
    </div>
  );
}

interface LocationPermissionScreenProps {
  language: SupportedLanguage;
  onLanguageChange: () => void;
  onGranted: (city: string, state: string) => void;
  onDenied: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

export default function LocationPermissionScreen({
  onGranted,
  onDenied,
  onBack,
  showBack = true,
}: LocationPermissionScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Conversational YES: voice confirms intent, the TAP executes — the
  // geolocation prompt needs its own user gesture on some browsers, so
  // a voice-YES only pulses the button and asks for one tap.
  const [pulse, setPulse] = useState(false);
  const [pointerUp, setPointerUp] = useState(false);
  // WAVE 2 CANDIDATE — canon frame 2 detected-city confirm
  const [detected, setDetected] = useState<{ city: string; state: string } | null>(null);
  // S3: the narration says "नीचे 'अनुमति दें' दबाइए" — THAT button glows
  const allowBtnRef = useRef<HTMLDivElement | null>(null);

  // D2: the phase announces itself BEFORE any browser popup — the
  // geolocation request fires ONLY from the अनुमति दें button below.
  // (useScreenVoice = VoiceLoop v2: this also arms the perpetual listen.)
  useScreenVoice(t("entry.locationVoice"), { highlightRef: allowBtnRef });

  // J2: हाँ pulses the button and asks for the ONE constitutional tap
  // (the geolocation popup needs a real gesture); नहीं goes to the
  // city picker. K1 LAW: the registry is ALWAYS populated — micDenied/
  // mute gate only hardware arming, never the grammar. Injected
  // transcripts (and any future input source) must always resolve.
  useVoiceCommands(
    [
      {
        keywords: [...YES, "अनुमति", "allow"],
        action: () => {
          setPulse(true);
          voiceController.speak(t("entry.locationTapHint"), { highlightRef: allowBtnRef });
        },
      },
      { keywords: NO, action: () => onDenied() },
    ],
    t("help.location"),
  );

  const handleAllowClick = () => {
    if (!navigator.geolocation) {
      setError(t("pratham.locationError"));
      setTimeout(() => onDenied(), 1500);
      return;
    }

    // LADDER LAW: the geolocation request fires FIRST in the tap stack —
    // the pointer + spoken guidance follow, never delaying it.
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setPointerUp(false);
        voiceController.debug("perm: settled(granted) (location)");
        voiceController.stopSpeech("location:grant-settle");
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          if (!res.ok) throw new Error("Reverse geocode failed");
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || "Unknown";
          const stateStr = data.address.state || "Unknown";
          // Q7: the grant's async settle navigates seconds after the tap —
          // carry the tap's intent so the phase change isn't a ⚠ tell
          voiceController.stopSpeech("user-flow:location-grant");
          // WAVE 2 CANDIDATE (canon frame 2): don't silently accept a
          // reverse-geocoded city — SHOW it and let the pandit confirm.
          // A wrong city silently chosen is very hard to notice later.
          setDetected({ city: city, state: stateStr });
          voiceController.speak(`क्या आप ${city} में हैं?`);
        } catch {
          setError(t("pratham.locationError"));
          setTimeout(() => onDenied(), 1500);
        } finally {
          setLoading(false);
        }
      },
      () => {
        // deny/dismiss/timeout → the existing city-picker path (its
        // narration unchanged); settings copy stays recovery-only
        setPointerUp(false);
        voiceController.debug("perm: settled(denied|dismissed) (location)");
        setLoading(false);
        setError(t("pratham.locationError"));
        setTimeout(() => onDenied(), 1500);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
    voiceController.debug("perm: geolocation invoked (location)");
    setPointerUp(true);
    setLoading(true);
    setError(null);
    // spoken guidance WHILE the native popup is up
    voiceController.speak(t("perm.pressAllowVoice"));
  };

  // WAVE 2 CANDIDATE — canon frame 2: confirm the detected city before
  // committing it. "यही सही है" proceeds exactly as the old auto-path did;
  // "जगह बदलें" falls through to the manual picker (onDenied), which is
  // the same escape the screen already offered.
  if (detected) {
    return (
      <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
        <header className="shrink-0">
          <div className="h-[60px] bg-gradient-to-r from-genda to-saffron-500 px-4 flex items-center">
            <h1 className="font-display text-[22px] text-white flex-1 text-center">
              {t("welcome.titleShort")}
            </h1>
          </div>
          <Toran tone="onSindoor" className="bg-saffron-500" />
        </header>

        <main className="flex-1 overflow-y-auto px-[22px] pt-[14px] pb-[18px] flex flex-col items-center gap-4">
          <h2 className="text-[29px] font-black text-temple-700 font-hindi text-center leading-[1.25]">
            {t("pratham.locationTitle")}
          </h2>

          {/* canon frame 1: the drawn map, then the detected place */}
          <CanonMapCanvas className="flex-1 min-h-[220px]" />

          <div className="w-full bg-saffron-50 border-2 border-saffron-200 rounded-tile py-[15px] px-[18px] flex items-center gap-[13px]">
            <span className="text-[26px] leading-none select-none" aria-hidden="true">🏙️</span>
            <span className="flex flex-col">
              <span className="text-[22px] font-black text-saffron-700 font-hindi leading-tight">
                {detected.city}
              </span>
              <span className="text-[18px] font-semibold text-softgrey font-hindi">
                {detected.state}
              </span>
            </span>
          </div>

          <button
            onClick={() => {
              voiceController.stopSpeech("user-flow:city-change");
              onDenied();
            }}
            className="min-h-[56px] px-6 text-softgrey text-[17px] font-bold font-hindi underline underline-offset-4 active:scale-[0.97] transition-transform"
          >
            जगह बदलें
          </button>
        </main>

        <footer className="shrink-0 px-4 py-3 bg-cream/95 backdrop-blur border-t border-saffron-100 flex items-end gap-3">
          <div className="flex-1">
            <button
              onClick={() => {
                voiceController.stopSpeech("user-flow:city-confirm");
                onGranted(detected.city, detected.state);
              }}
              className="w-full min-h-[64px] bg-saffron-500 text-chandan rounded-cta text-[21px] font-extrabold shadow-btn active:scale-[0.97] transition-transform font-hindi flex items-center justify-center gap-[10px]"
            >
              ✓ यही सही है
            </button>
          </div>
          <ShishyaOrb />
        </footer>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      {/* Festive header band: genda → sindoor, toran under it */}
      <header className="shrink-0">
        <div className="h-[60px] bg-gradient-to-r from-genda to-saffron-500 px-4 flex items-center gap-3">
          {showBack && (
            <button
              onClick={onBack}
              aria-label={t("common.back")}
              className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-white/90 shadow-card active:scale-90 flex items-center justify-center text-[18px] transition-all"
            >
              ←
            </button>
          )}
          <h1 className="font-display text-[22px] text-white flex-1 text-center pr-14">
            {t("welcome.titleShort")}
          </h1>
        </div>
        <Toran tone="onSindoor" className="bg-saffron-500" />
      </header>

      <main className="flex-1 overflow-y-auto px-[22px] pt-[14px] pb-[18px] flex flex-col items-center gap-4">
        {/* Canon frame 1: heading 29/900 #341A13, line-height 1.25 */}
        <h2 className="text-[29px] font-black text-temple-700 font-hindi text-center leading-[1.25]">
          {t("pratham.locationTitle")}
        </h2>

        {/* Canon frame 1 illustration: the drawn map, not a tinted box */}
        <CanonMapCanvas className="flex-1 min-h-[220px]" />

        <p className="t-body text-softgrey font-hindi text-center">{t("pratham.locationWhy")}</p>

        {error && (
          <div className="w-full px-4 py-3 bg-saffron-50 rounded-tile border-2 border-danger/25">
            <p className="text-danger text-[18px] font-semibold text-center font-hindi">{error}</p>
          </div>
        )}

        <button
          onClick={onDenied}
          disabled={loading}
          className="min-h-[56px] px-6 text-softgrey text-[17px] font-bold font-hindi underline underline-offset-4 active:scale-[0.97] transition-transform disabled:opacity-50"
        >
          {t("pratham.locationManual")}
        </button>
      </main>

      {/* Arrow + chip pointing at the NATIVE permission popup */}
      {pointerUp && <PopupPointer />}

      {/* Footer: ONE primary + orb slot */}
      <footer className="shrink-0 px-4 py-3 bg-cream/95 backdrop-blur border-t border-saffron-100 flex items-end gap-3">
        {/* S3: wrapper ref = the narration highlight target */}
        <div ref={allowBtnRef} className="flex-1">
          <button
            onClick={handleAllowClick}
            disabled={loading}
            className={`w-full min-h-[64px] bg-saffron-500 text-chandan rounded-cta text-[21px] font-extrabold shadow-btn active:scale-[0.97] transition-transform font-hindi disabled:opacity-60 ${
              pulse ? "saffron-glow-active animate-pulse" : ""
            }`}
          >
            {loading ? t("pratham.locationChecking") : t("pratham.locationAllow")}
          </button>
        </div>
        <ShishyaOrb />
      </footer>
    </div>
  );
}
