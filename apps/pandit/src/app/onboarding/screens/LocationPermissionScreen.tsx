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
  /** Dev-harness only: seed the confirm state so /design/harness/location
      can render it without a real geolocation grant. Never set in the app. */
  initialDetected?: { city: string; state: string } | null;
}

export default function LocationPermissionScreen({
  onGranted,
  onDenied,
  onBack,
  showBack = true,
  initialDetected = null,
}: LocationPermissionScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Conversational YES: voice confirms intent, the TAP executes — the
  // geolocation prompt needs its own user gesture on some browsers, so
  // a voice-YES only pulses the button and asks for one tap.
  const [pulse, setPulse] = useState(false);
  const [pointerUp, setPointerUp] = useState(false);
  // WAVE 2 CANDIDATE — canon frame 2 detected-city confirm
  const [detected, setDetected] = useState<{ city: string; state: string } | null>(initialDetected);
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
        {/* canon frame 2: the 58px garland is the ONLY top chrome */}
        <div className="shrink-0">
          <Toran variant="garland" count={11} />
        </div>

        {/* canon column: padding 14px 22px 18px, gap 16 */}
        <main className="flex-1 min-h-0 overflow-y-auto px-[22px] pt-[14px] pb-[18px] flex flex-col gap-4">
          {/* canon: 29/900 #341A13, lh 1.25, forced two-line break */}
          <h2 className="text-[29px] font-black text-temple-700 font-hindi text-center leading-[1.25] whitespace-pre-line">
            {t("pratham.locationTitle")}
          </h2>

          {/* canon frame 2: the drawn bounded map */}
          <CanonMapCanvas className="flex-1 min-h-[180px]" />

          {/* canon city card: #FDEEE7 / 2px #F4B096 / r18 / 15px 18px */}
          <div className="w-full bg-saffron-50 border-2 border-saffron-200 rounded-tile py-[15px] px-[18px] flex items-center gap-[13px]">
            <span className="text-[26px] leading-none select-none" aria-hidden="true">🏙️</span>
            <span className="flex flex-col">
              <span className="text-[22px] font-black text-saffron-700 font-hindi leading-tight">
                {detected.city}
              </span>
              {/* canon 15/600 #8A6F5C — at the label floor already */}
              <span className="text-[18px] font-semibold text-softgrey font-hindi">
                {detected.state}
              </span>
            </span>
          </div>

          {/* canon CTA: min-h 62 / r18 / #B23A1A / #FFF6E9 / 21/800 /
              check_circle 24 / shadow 0 6px 16px rgba(178,58,26,.3) */}
          <button
            onClick={() => {
              voiceController.stopSpeech("user-flow:city-confirm");
              onGranted(detected.city, detected.state);
            }}
            className="w-full min-h-[62px] bg-saffron-500 text-chandan rounded-cta text-[21px] font-extrabold shadow-[0_6px_16px_rgba(178,58,26,0.3)] active:scale-[0.97] transition-transform font-hindi flex items-center justify-center gap-[10px]"
          >
            <span className="material-symbols-outlined text-[24px] leading-none" aria-hidden="true">
              check_circle
            </span>
            यही सही है
          </button>

          {/* canon link: 17/700 #8A6F5C underline, centered */}
          <button
            onClick={() => {
              voiceController.stopSpeech("user-flow:city-change");
              onDenied();
            }}
            className="self-center min-h-[52px] px-6 text-softgrey text-[17px] font-bold font-hindi underline underline-offset-4 active:scale-[0.97] transition-transform"
          >
            जगह बदलिए
          </button>
        </main>

        {/* canon: शिष्य bottom-center, size 62, speaking ribbon (6px 0 16px) */}
        <div className="shrink-0 flex justify-center pt-[6px] pb-4">
          <ShishyaOrb size={62} say={t("pratham.locationSay")} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink relative">
      {/* canon frame 2: the 58px garland is the ONLY top chrome. Canon draws
          no back control; the floating circle keeps the escape when the
          parent provides one (no-dead-ends law) — flagged deviation. */}
      <div className="shrink-0">
        <Toran variant="garland" count={11} />
      </div>
      {showBack && onBack && (
        <button
          onClick={onBack}
          aria-label={t("common.back")}
          className="absolute left-3 top-[64px] z-20 w-[52px] h-[52px] min-h-[52px] min-w-[52px] rounded-full bg-card shadow-card flex items-center justify-center active:scale-90 transition-all focus:outline-none focus:ring-2 focus:ring-saffron-200"
        >
          <span className="material-symbols-outlined text-[24px] leading-none text-saffron-700" aria-hidden="true">
            arrow_back
          </span>
        </button>
      )}

      {/* canon column: padding 14px 22px 18px, gap 16 */}
      <main className="flex-1 min-h-0 overflow-y-auto px-[22px] pt-[14px] pb-[18px] flex flex-col gap-4">
        {/* canon: 29/900 #341A13, lh 1.25, forced two-line break */}
        <h2 className="text-[29px] font-black text-temple-700 font-hindi text-center leading-[1.25] whitespace-pre-line">
          {t("pratham.locationTitle")}
        </h2>

        {/* canon frame 2 illustration: the drawn bounded map */}
        <CanonMapCanvas className="flex-1 min-h-[180px]" />

        <p className="t-body text-softgrey font-hindi text-center">{t("pratham.locationWhy")}</p>

        {error && (
          <div className="w-full px-4 py-3 bg-saffron-50 rounded-tile border-2 border-danger/25">
            <p className="text-danger text-[18px] font-semibold text-center font-hindi">{error}</p>
          </div>
        )}

        {/* THE primary — canon CTA grammar (62px sindoor, r18, lifted) in the
            column, not a footer bar. S3: wrapper ref = narration highlight. */}
        <div ref={allowBtnRef} className="w-full">
          <button
            onClick={handleAllowClick}
            disabled={loading}
            className={`w-full min-h-[62px] bg-saffron-500 text-chandan rounded-cta text-[21px] font-extrabold shadow-[0_6px_16px_rgba(178,58,26,0.3)] active:scale-[0.97] transition-transform font-hindi disabled:opacity-60 ${
              pulse ? "saffron-glow-active animate-pulse" : ""
            }`}
          >
            {loading ? t("pratham.locationChecking") : t("pratham.locationAllow")}
          </button>
        </div>

        <button
          onClick={onDenied}
          disabled={loading}
          className="self-center min-h-[52px] px-6 text-softgrey text-[17px] font-bold font-hindi underline underline-offset-4 active:scale-[0.97] transition-transform disabled:opacity-50"
        >
          {t("pratham.locationManual")}
        </button>
      </main>

      {/* Arrow + chip pointing at the NATIVE permission popup */}
      {pointerUp && <PopupPointer />}

      {/* canon: शिष्य bottom-center, size 62, speaking ribbon (6px 0 16px) */}
      <div className="shrink-0 flex justify-center pt-[6px] pb-4">
        <ShishyaOrb size={62} say={t("pratham.locationSay")} />
      </div>
    </div>
  );
}
