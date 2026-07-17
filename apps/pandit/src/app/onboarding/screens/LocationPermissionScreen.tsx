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
          onGranted(city, stateStr);
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

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-6 flex flex-col items-center gap-5">
        {/* Illustration canvas — neel tint, radius 24 */}
        <div className="w-full rounded-3xl bg-neel/10 py-10 flex items-center justify-center gap-3">
          <span className="text-[64px] leading-none select-none" aria-hidden="true">🛕</span>
          <span className="pa-bounce-once text-[44px] leading-none select-none" style={{ animationDelay: "0.4s" }} aria-hidden="true">📍</span>
        </div>

        {/* Mockup frame 2: heading 29/900 ink */}
        <h2 className="text-[28px] font-black text-temple-700 font-hindi text-center leading-snug">
          {t("pratham.locationTitle")}
        </h2>
        <p className="t-body text-softgrey font-hindi text-center">{t("pratham.locationWhy")}</p>

        {error && (
          <div className="w-full px-4 py-3 bg-red-50 rounded-card border border-danger/20">
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
            className={`w-full min-h-[64px] bg-saffron-500 text-[#FFF3EA] rounded-btn text-[21px] font-extrabold shadow-btn active:scale-[0.97] transition-transform font-hindi disabled:opacity-60 ${
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
