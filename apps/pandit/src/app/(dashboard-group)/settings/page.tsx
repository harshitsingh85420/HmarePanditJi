"use client";

import { Narrate } from "@/hooks/useScreenVoice";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { useVoice } from "@/hooks/useVoice";
import { playBell } from "@/lib/sounds";
import { useSafeOnboardingStore } from "@/lib/stores/ssr-safe-stores";
import { purgeUserData } from "@/lib/purgeUserData";

export default function SettingsPage() {
  const router = useRouter();
  const { setPhase } = useSafeOnboardingStore();
  const { speak } = useVoice();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [aboutShishya, setAboutShishya] = useState(false);

  useEffect(() => {
    setSoundEnabled(localStorage.getItem("sound_enabled") !== "false");
    // returning from (or abandoning) a भाषा visit — clear the flag
    sessionStorage.removeItem("hpj_lang_return");
  }, []);

  const handleSoundToggle = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    localStorage.setItem("sound_enabled", String(nextVal));
    if (nextVal) playBell();
    speak(nextVal ? t("settingsScreen.soundOn") : t("settingsScreen.soundOff"));
  };

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      <Header
        title={t("settings.title")}
        showBack
        onBack={() => router.push("/home")}
      />

      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24 flex flex-col gap-3 page-enter">
        <Narrate text={t("settingsScreen.intro")} />

        {/* Row: profile view */}
        <Card
          className="px-5 bg-white border border-saffron-100 min-h-[64px] flex items-center justify-between cursor-pointer active:scale-[0.97] transition-transform"
          onClick={() => router.push("/profile-view")}
        >
          <span className="text-[18px] font-bold text-ink font-hindi">👤 {t("settingsRows.viewProfile")}</span>
          <span className="text-softgrey text-[20px]" aria-hidden="true">›</span>
        </Card>

        {/* Row: my poojas */}
        <Card
          className="px-5 bg-white border border-saffron-100 min-h-[64px] flex items-center justify-between cursor-pointer active:scale-[0.97] transition-transform"
          onClick={() => router.push("/my-poojas")}
        >
          <span className="text-[18px] font-bold text-ink font-hindi">🛕 {t("myPoojas.title")}</span>
          <span className="text-softgrey text-[20px]" aria-hidden="true">›</span>
        </Card>

        {/* Row: language */}
        <Card
          className="px-5 bg-white border border-saffron-100 min-h-[64px] flex items-center justify-between cursor-pointer active:scale-[0.97] transition-transform"
          onClick={() => {
            // bare list only — no confirm ceremony, and return here after
            sessionStorage.setItem("hpj_lang_return", "/settings");
            setPhase("LANGUAGE_LIST");
            router.push("/onboarding");
          }}
        >
          <span className="text-[18px] font-bold text-ink font-hindi">🌐 {t("settingsRows.language")}</span>
          <span className="text-softgrey text-[20px]" aria-hidden="true">›</span>
        </Card>

        <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-4">
          {/* घंटी की आवाज़ toggle */}
          <div className="flex items-center justify-between min-h-[56px] py-2 gap-4">
            <div className="flex flex-col gap-1 flex-grow">
              <span className="text-[18px] font-bold text-ink leading-tight font-hindi">
                {t("settingsScreen.soundLabel")}
              </span>
              <span className="text-[14px] text-softgrey font-hindi leading-snug">
                {t("settingsScreen.soundDesc")}
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

        {/* Row: about शिष्य */}
        <Card
          className="px-5 bg-white border border-saffron-100 min-h-[64px] flex items-center justify-between cursor-pointer active:scale-[0.97] transition-transform"
          onClick={() => {
            setAboutShishya(true);
            speak(`${t("shishya.aboutLine1")} ${t("shishya.aboutLine2")}`);
          }}
        >
          <span className="text-[18px] font-bold text-ink font-hindi">🙏 {t("shishya.aboutTitle")}</span>
          <span className="text-softgrey text-[20px]" aria-hidden="true">›</span>
        </Card>

        {/* Row: call support */}
        <a
          href={`tel:${t("support.phone")}`}
          className="bg-white border border-saffron-100 rounded-card px-5 min-h-[64px] flex items-center justify-between shadow-card active:scale-[0.97] transition-transform"
        >
          <span className="text-[18px] font-bold text-ink font-hindi">{t("support.callLabel")}</span>
          <span className="text-softgrey text-[20px]" aria-hidden="true">›</span>
        </a>

        {/* Row: help */}
        <Card
          className="px-5 bg-white border border-saffron-100 min-h-[64px] flex items-center justify-between cursor-pointer active:scale-[0.97] transition-transform"
          onClick={() => router.push("/help")}
        >
          <span className="text-[18px] font-bold text-ink font-hindi">❓ {t("settingsRows.helpRow")}</span>
          <span className="text-softgrey text-[20px]" aria-hidden="true">›</span>
        </Card>

        {/* Row: logout (confirm) */}
        {confirmLogout ? (
          <Card className="p-5 bg-white border border-danger/30 flex flex-col gap-3">
            <span className="text-[18px] font-bold text-ink font-hindi">{t("settingsRows.logoutConfirm")}</span>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // X3: wipe EVERY trace of this account — drafts, stores,
                  // watermarks, tips — so the next login starts clean.
                  // Install-level entry flags (language/tutorial) survive.
                  const cleared = purgeUserData();
                  console.info("[logout] cleared keys:", cleared.join(", "));
                  router.push("/login");
                }}
                className="flex-1 min-h-[56px] bg-danger text-white rounded-btn text-[18px] font-bold active:scale-[0.97] transition-transform"
              >
                {t("common.yes")}
              </button>
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 min-h-[56px] bg-white border border-saffron-200 text-ink rounded-btn text-[18px] font-bold active:scale-[0.97] transition-transform"
              >
                {t("common.no")}
              </button>
            </div>
          </Card>
        ) : (
          <Card
            className="px-5 bg-white border border-saffron-100 min-h-[64px] flex items-center justify-between cursor-pointer active:scale-[0.97] transition-transform"
            onClick={() => setConfirmLogout(true)}
          >
            <span className="text-[18px] font-bold text-danger font-hindi">🚪 {t("settingsRows.logout")}</span>
            <span className="text-softgrey text-[20px]" aria-hidden="true">›</span>
          </Card>
        )}
      </main>

      {/* शिष्य के बारे में — small sheet */}
      {aboutShishya && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setAboutShishya(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white rounded-t-3xl p-6 z-50 flex flex-col items-center gap-4 shadow-card">
            <ShishyaOrb />
            <h2 className="text-[22px] font-bold text-temple-600 font-hindi text-center">
              {t("shishya.aboutTitle")}
            </h2>
            <p className="text-[18px] text-ink font-hindi text-center leading-relaxed">
              {t("shishya.aboutLine1")}
            </p>
            <p className="text-[18px] text-ink font-hindi text-center leading-relaxed">
              {t("shishya.aboutLine2")}
            </p>
            <button
              onClick={() => setAboutShishya(false)}
              className="w-full min-h-[56px] bg-saffron-500 text-white rounded-btn text-[18px] font-bold font-hindi active:scale-[0.97] transition-transform"
            >
              {t("coach.gotIt")}
            </button>
          </div>
        </>
      )}

      <BottomNav activeTab={-1} onChange={(idx) => {
        if (idx === 0) router.push("/home");
        if (idx === 1) router.push("/bookings");
        if (idx === 2) router.push("/earnings");
        if (idx === 3) router.push("/calendar");
      }} />
    </div>
  );
}
