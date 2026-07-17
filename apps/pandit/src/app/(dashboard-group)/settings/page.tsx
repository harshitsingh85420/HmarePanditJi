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

// Mockup frame 22 row grammar: #FFFDF8 card, 1px sand border r16, emoji
// in a saffron-50 r13 tile, 18/800 label, sand chevron; logout wears the
// red tint. Pure presentation — each row keeps its own handler/href.
function SettingsRow({
  emoji,
  label,
  danger = false,
  onClick,
  href,
}: {
  emoji: string;
  label: string;
  danger?: boolean;
  onClick?: () => void;
  href?: string;
}) {
  const cls = `rounded-[16px] px-4 min-h-[64px] flex items-center gap-3 shadow-card active:scale-[0.97] transition-transform focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none ${
    danger ? "bg-[#FBE7E3] border border-[#E7B8AF]" : "bg-card border border-sand"
  }`;
  const inner = (
    <>
      <span
        className={`w-11 h-11 rounded-[13px] flex items-center justify-center text-[22px] shrink-0 select-none ${
          danger ? "bg-white" : "bg-saffron-50"
        }`}
        aria-hidden="true"
      >
        {emoji}
      </span>
      <span className={`flex-1 text-left text-[18px] font-extrabold font-hindi ${danger ? "text-danger" : "text-ink"}`}>
        {label}
      </span>
      <span className="text-[#C9BBA6] text-[22px]" aria-hidden="true">›</span>
    </>
  );
  if (href) {
    return (
      <a href={href} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

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
        <SettingsRow emoji="👤" label={t("settingsRows.viewProfile")} onClick={() => router.push("/profile-view")} />

        {/* Row: my poojas */}
        <SettingsRow emoji="🛕" label={t("myPoojas.title")} onClick={() => router.push("/my-poojas")} />

        {/* Row: language */}
        <SettingsRow
          emoji="🌐"
          label={t("settingsRows.language")}
          onClick={() => {
            // bare list only — no confirm ceremony, and return here after
            sessionStorage.setItem("hpj_lang_return", "/settings");
            setPhase("LANGUAGE_LIST");
            router.push("/onboarding");
          }}
        />

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
                soundEnabled ? "bg-saffron-500" : "bg-sand-400"
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
        <SettingsRow
          emoji="🙏"
          label={t("shishya.aboutTitle")}
          onClick={() => {
            setAboutShishya(true);
            speak(`${t("shishya.aboutLine1")} ${t("shishya.aboutLine2")}`);
          }}
        />

        {/* Row: call support */}
        <SettingsRow emoji="📞" label={t("support.callLabel")} href={`tel:${t("support.phone")}`} />

        {/* Row: help */}
        <SettingsRow emoji="❓" label={t("settingsRows.helpRow")} onClick={() => router.push("/help")} />

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
          <SettingsRow danger emoji="🚪" label={t("settingsRows.logout")} onClick={() => setConfirmLogout(true)} />
        )}
      </main>

      {/* शिष्य के बारे में — small sheet */}
      {aboutShishya && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setAboutShishya(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white rounded-t-[28px] p-6 z-50 flex flex-col items-center gap-4 shadow-card">
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
