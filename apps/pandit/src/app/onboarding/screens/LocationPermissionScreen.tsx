"use client";

// ─────────────────────────────────────────────────────────────
// प्रथम आरती D1 — Location permission. Layout grammar: 100dvh column,
// one scrollable main, fixed footer with THE primary [अनुमति दें] +
// शिष्य orb. Header = festive band (genda→sindoor) with toran.
// Illustration = neel-tint canvas: 🛕 + 📍 (one soft bounce).
// Geolocation grant → reverse geocode → onGranted(city, state);
// deny/error → onDenied() (manual city).
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import type { SupportedLanguage } from "@/lib/onboarding-store";
import { hi } from "@/lib/strings";
import { Toran } from "@/components/ui/Toran";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { useScreenVoice } from "@/hooks/useScreenVoice";

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

  useScreenVoice(hi.pratham.locationVoice);

  const handleAllowClick = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError(hi.pratham.locationError);
      setTimeout(() => onDenied(), 1500);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          if (!res.ok) throw new Error("Reverse geocode failed");
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || "Unknown";
          const stateStr = data.address.state || "Unknown";
          onGranted(city, stateStr);
        } catch {
          setError(hi.pratham.locationError);
          setTimeout(() => onDenied(), 1500);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError(hi.pratham.locationError);
        setTimeout(() => onDenied(), 1500);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      {/* Festive header band: genda → sindoor, toran under it */}
      <header className="shrink-0">
        <div className="h-[60px] bg-gradient-to-r from-genda to-saffron-500 px-4 flex items-center gap-3">
          {showBack && (
            <button
              onClick={onBack}
              aria-label={hi.common.back}
              className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-white/90 shadow-card active:scale-90 flex items-center justify-center text-[18px] transition-all"
            >
              ←
            </button>
          )}
          <h1 className="font-display text-[22px] text-white flex-1 text-center pr-14">
            {hi.welcome.titleShort}
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

        <h2 className="text-[24px] font-bold text-temple-600 font-hindi text-center leading-snug">
          {hi.pratham.locationTitle}
        </h2>
        <p className="t-body text-softgrey font-hindi text-center">{hi.pratham.locationWhy}</p>

        {error && (
          <div className="w-full px-4 py-3 bg-red-50 rounded-card border border-danger/20">
            <p className="text-danger text-[18px] font-semibold text-center font-hindi">{error}</p>
          </div>
        )}

        <button
          onClick={onDenied}
          disabled={loading}
          className="min-h-[56px] px-6 text-saffron-600 text-[18px] font-bold font-hindi underline underline-offset-4 active:scale-[0.97] transition-transform disabled:opacity-50"
        >
          {hi.pratham.locationManual}
        </button>
      </main>

      {/* Footer: ONE primary + orb slot */}
      <footer className="shrink-0 px-4 py-3 bg-cream/95 backdrop-blur border-t border-saffron-100 flex items-end gap-3">
        <button
          onClick={handleAllowClick}
          disabled={loading}
          className="flex-1 min-h-[64px] bg-saffron-500 text-[#FFF3EA] rounded-btn text-[20px] font-bold shadow-btn active:scale-[0.97] transition-transform font-hindi disabled:opacity-60"
        >
          {loading ? hi.pratham.locationChecking : hi.pratham.locationAllow}
        </button>
        <ShishyaOrb />
      </footer>
    </div>
  );
}
