"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hi } from "@/lib/strings";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { SpeakOnMount } from "@/components/VoiceBar";
import { useVoice } from "@/hooks/useVoice";
import { playBell } from "@/lib/sounds";
import { useSafeOnboardingStore } from "@/lib/stores/ssr-safe-stores";

export default function SettingsPage() {
  const router = useRouter();
  const { setPhase } = useSafeOnboardingStore();
  const { speak } = useVoice();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    setSoundEnabled(localStorage.getItem("sound_enabled") !== "false");
  }, []);

  const handleSoundToggle = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    localStorage.setItem("sound_enabled", String(nextVal));
    if (nextVal) playBell();
    speak(nextVal ? hi.settingsScreen.soundOn : hi.settingsScreen.soundOff);
  };

  return (
    <div className="min-h-screen bg-cream text-ink pb-28">
      <Header
        title={hi.settings.title}
        showBack
        onBack={() => router.push("/home")}
      />

      <main className="max-w-[430px] mx-auto px-4 pt-6 flex flex-col gap-6 page-enter">
        <SpeakOnMount text={hi.settingsScreen.intro} />

        {/* Row: profile view */}
        <Card
          className="px-5 bg-white border border-saffron-100 min-h-[64px] flex items-center justify-between cursor-pointer active:scale-[0.97] transition-transform"
          onClick={() => router.push("/profile-view")}
        >
          <span className="text-[18px] font-bold text-ink font-hindi">👤 {hi.settingsRows.viewProfile}</span>
          <span className="text-softgrey text-[20px]" aria-hidden="true">›</span>
        </Card>

        {/* Row: language */}
        <Card
          className="px-5 bg-white border border-saffron-100 min-h-[64px] flex items-center justify-between cursor-pointer active:scale-[0.97] transition-transform"
          onClick={() => {
            setPhase("LANGUAGE_LIST");
            router.push("/onboarding");
          }}
        >
          <span className="text-[18px] font-bold text-ink font-hindi">🌐 {hi.settingsRows.language}</span>
          <span className="text-softgrey text-[20px]" aria-hidden="true">›</span>
        </Card>

        <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-4">
          {/* घंटी की आवाज़ toggle */}
          <div className="flex items-center justify-between min-h-[56px] py-2 gap-4">
            <div className="flex flex-col gap-1 flex-grow">
              <span className="text-[18px] font-bold text-ink leading-tight font-hindi">
                {hi.settingsScreen.soundLabel}
              </span>
              <span className="text-[14px] text-softgrey font-hindi leading-snug">
                {hi.settingsScreen.soundDesc}
              </span>
            </div>
            <button
              onClick={handleSoundToggle}
              className={`relative inline-flex h-9 w-[72px] min-h-[56px] min-w-[72px] items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-saffron-200 ${
                soundEnabled ? "bg-saffron-500" : "bg-slate-300"
              }`}
              style={{ minHeight: "56px" }}
              aria-label="Toggle bell sounds"
            >
              <span
                className={`inline-block h-10 w-10 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  soundEnabled ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </Card>

        {/* Row: call support */}
        <a
          href={`tel:${hi.support.phone}`}
          className="bg-white border border-saffron-100 rounded-card px-5 min-h-[64px] flex items-center justify-between shadow-card active:scale-[0.97] transition-transform"
        >
          <span className="text-[18px] font-bold text-ink font-hindi">{hi.support.callLabel}</span>
          <span className="text-softgrey text-[20px]" aria-hidden="true">›</span>
        </a>

        {/* Row: help */}
        <Card
          className="px-5 bg-white border border-saffron-100 min-h-[64px] flex items-center justify-between cursor-pointer active:scale-[0.97] transition-transform"
          onClick={() => router.push("/help")}
        >
          <span className="text-[18px] font-bold text-ink font-hindi">❓ {hi.settingsRows.helpRow}</span>
          <span className="text-softgrey text-[20px]" aria-hidden="true">›</span>
        </Card>

        {/* Row: logout (confirm) */}
        {confirmLogout ? (
          <Card className="p-5 bg-white border border-danger/30 flex flex-col gap-3">
            <span className="text-[18px] font-bold text-ink font-hindi">{hi.settingsRows.logoutConfirm}</span>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  localStorage.removeItem("pandit_token");
                  router.push("/login");
                }}
                className="flex-1 min-h-[56px] bg-danger text-white rounded-btn text-[18px] font-bold active:scale-[0.97] transition-transform"
              >
                {hi.common.yes}
              </button>
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 min-h-[56px] bg-white border border-saffron-200 text-ink rounded-btn text-[18px] font-bold active:scale-[0.97] transition-transform"
              >
                {hi.common.no}
              </button>
            </div>
          </Card>
        ) : (
          <Card
            className="px-5 bg-white border border-saffron-100 min-h-[64px] flex items-center justify-between cursor-pointer active:scale-[0.97] transition-transform"
            onClick={() => setConfirmLogout(true)}
          >
            <span className="text-[18px] font-bold text-danger font-hindi">🚪 {hi.settingsRows.logout}</span>
            <span className="text-softgrey text-[20px]" aria-hidden="true">›</span>
          </Card>
        )}
      </main>

      <BottomNav activeTab={-1} onChange={(idx) => {
        if (idx === 0) router.push("/home");
        if (idx === 1) router.push("/bookings");
        if (idx === 2) router.push("/earnings");
        if (idx === 3) router.push("/calendar");
      }} />
    </div>
  );
}
