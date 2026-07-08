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

export default function SettingsPage() {
  const router = useRouter();
  const { speak } = useVoice();
  const [soundEnabled, setSoundEnabled] = useState(true);

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
