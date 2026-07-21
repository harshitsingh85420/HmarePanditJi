"use client";

import { Narrate } from "@/hooks/useScreenVoice";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { Header } from "@/components/ui/Header";
import { BottomNav } from "@/components/ui/BottomNav";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { useVoice } from "@/hooks/useVoice";
import { playBell } from "@/lib/sounds";
import { useSafeOnboardingStore } from "@/lib/stores/ssr-safe-stores";
import { purgeUserData } from "@/lib/purgeUserData";

// CANON frame 30 (artboard 22 · सेटिंग) row grammar, read literal-for-literal
// off design/canon: #FFFDF8 fill, 1.5px #F0DFC4 hairline, r16, padding
// 15px/16px, gap 14px; a 46px r13 #FDEEE7 tile holding a 26px sindoor glyph;
// an 18/800 #341A13 label; a 24px #C9BBA6 chevron. Canon draws NO shadow on
// these rows — the hairline alone separates them from the cream page.
// The logout row wears the red tint (#FBE7E3 / #E7B8AF / #fff tile) with a
// 6px top gap, and canon gives it NO chevron — it is a terminal action, not
// a drill-in. Pure presentation; each row keeps its own handler/href.
export const SETTINGS_ROW_BASE =
  "rounded-[16px] px-4 py-[15px] min-h-[76px] flex items-center gap-[14px] active:scale-[0.97] transition-transform focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none";

/** Canon's 46px r13 tile: #FDEEE7 with a 26px sindoor glyph — #fff with a
 *  #C2321E glyph on the terminal row. The Material Symbols face is already
 *  loaded app-wide in app/layout.tsx, so these are the canon glyphs, not
 *  emoji stand-ins. */
function RowTile({ icon, danger = false }: { icon: string; danger?: boolean }) {
  return (
    <span
      className={`w-[46px] h-[46px] rounded-[13px] flex items-center justify-center shrink-0 ${
        danger ? "bg-white" : "bg-saffron-50"
      }`}
      aria-hidden="true"
    >
      <span
        className={`material-symbols-outlined text-[26px] leading-none ${
          danger ? "text-danger" : "text-saffron-500"
        }`}
      >
        {icon}
      </span>
    </span>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  danger = false,
  onClick,
  href,
}: {
  icon: string;
  label: string;
  /** Canon frame 30 shows the row's CURRENT setting beside the chevron
   *  (e.g. भाषा → हिन्दी). Only pass a value that is actually true. */
  value?: string;
  danger?: boolean;
  onClick?: () => void;
  href?: string;
}) {
  const cls = `${SETTINGS_ROW_BASE} ${
    danger
      ? "bg-[#FBE7E3] border-[1.5px] border-[#E7B8AF] mt-[6px]"
      : "bg-card border-[1.5px] border-sand"
  }`;
  const inner = (
    <>
      <RowTile icon={icon} danger={danger} />
      <span
        className={`flex-1 text-left text-[18px] font-extrabold font-hindi ${
          danger ? "text-danger" : "text-temple-700"
        }`}
      >
        {label}
      </span>
      {value && (
        // CANON 15px — raised to the 18sp floor (standing law outranks canon).
        <span className="text-[18px] font-extrabold text-softgrey font-hindi shrink-0">{value}</span>
      )}
      {/* canon gives the terminal (danger) row no chevron; the chevron is
          canon's Material chevron_right 24px #C9BBA6, not a › text char */}
      {!danger && (
        <span className="material-symbols-outlined text-sand-400 text-[24px] leading-none shrink-0" aria-hidden="true">
          chevron_right
        </span>
      )}
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
      {/* canon frame 22: plain title block "⚙️ सेटिंग", no back (home's gear
          leads here; BottomNav below is the escape). */}
      <Header variant="title" title={`⚙️ ${t("settings.title")}`} />

      {/* canon list well: padding 10px 16px 16px, gap 11px (pb keeps BottomNav clear) */}
      <main className="flex-1 overflow-y-auto px-4 pt-[10px] pb-24 flex flex-col gap-[11px] page-enter">
        <Narrate text={t("settingsScreen.intro")} />

        {/* Row: profile view */}
        <SettingsRow icon="person" label={t("settingsRows.viewProfile")} onClick={() => router.push("/profile-view")} />

        {/* Row: my poojas */}
        <SettingsRow icon="temple_hindu" label={t("myPoojas.title")} onClick={() => router.push("/my-poojas")} />

        {/* Row: language */}
        <SettingsRow
          icon="translate"
          label={t("settingsRows.language")}
          // Canon frame 22 shows the active language beside the chevron.
          // हिंदी is the only shipped app language (the picker changes
          // शिष्य's SPOKEN language, not this UI) — so this is true, not
          // a placeholder. Canon spelling हिंदी (anusvara). Wire it to the
          // store when the UI is localised.
          value="हिंदी"
          onClick={() => {
            // bare list only — no confirm ceremony, and return here after
            sessionStorage.setItem("hpj_lang_return", "/settings");
            setPhase("LANGUAGE_LIST");
            router.push("/onboarding");
          }}
        />

        {/* घंटी की आवाज़ — canon frame 30 carries its toggle INSIDE the row
            grammar (icon tile · label · 52×30 r999 track, #1E7A46 when on,
            24px white knob inset 3px). Same chrome as every other row. */}
        <div className={`${SETTINGS_ROW_BASE} bg-card border-[1.5px] border-sand`}>
          <RowTile icon="notifications" />
          <span className="flex-1 flex flex-col gap-[2px] text-left">
            <span className="text-[18px] font-extrabold text-temple-700 leading-tight font-hindi">
              {t("settingsScreen.soundLabel")}
            </span>
            {/* canon sub-lines are 14px; held at the 18sp floor by standing law */}
            <span className="text-[18px] text-softgrey font-hindi leading-snug">
              {t("settingsScreen.soundDesc")}
            </span>
          </span>
          <button
            type="button"
            onClick={handleSoundToggle}
            role="switch"
            aria-checked={soundEnabled}
            className="shrink-0 min-h-[52px] min-w-[52px] flex items-center justify-center rounded-[13px] focus:outline-none focus-visible:ring-4 focus-visible:ring-saffron-200"
            aria-label="Toggle bell sounds"
          >
            <span
              className={`relative block h-[30px] w-[52px] rounded-[999px] transition-colors duration-300 ${
                soundEnabled ? "bg-leaf-500" : "bg-sand-400"
              }`}
            >
              <span
                className={`absolute top-[3px] left-[3px] h-[24px] w-[24px] rounded-full bg-white transition-transform duration-300 motion-reduce:transition-none ${
                  soundEnabled ? "translate-x-[22px]" : "translate-x-0"
                }`}
              />
            </span>
          </button>
        </div>

        {/* Row: about शिष्य */}
        <SettingsRow
          icon="self_improvement"
          label={t("shishya.aboutTitle")}
          onClick={() => {
            setAboutShishya(true);
            speak(`${t("shishya.aboutLine1")} ${t("shishya.aboutLine2")}`);
          }}
        />

        {/* Row: call support */}
        <SettingsRow icon="call" label={t("support.callLabel")} href={`tel:${t("support.phone")}`} />

        {/* Row: help */}
        <SettingsRow icon="help" label={t("settingsRows.helpRow")} onClick={() => router.push("/help")} />

        {/* Row: logout (confirm) */}
        {confirmLogout ? (
          <div className="mt-[6px] rounded-[16px] p-4 bg-[#FBE7E3] border-[1.5px] border-[#E7B8AF] flex flex-col gap-3">
            <span className="text-[18px] font-extrabold text-danger font-hindi">
              {t("settingsRows.logoutConfirm")}
            </span>
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
                className="flex-1 min-h-[56px] bg-danger text-white rounded-cta text-[18px] font-extrabold font-hindi active:scale-[0.97] transition-transform"
              >
                {t("common.yes")}
              </button>
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 min-h-[56px] bg-white border-[1.5px] border-[#E7B8AF] text-temple-700 rounded-cta text-[18px] font-extrabold font-hindi active:scale-[0.97] transition-transform"
              >
                {t("common.no")}
              </button>
            </div>
          </div>
        ) : (
          <SettingsRow danger icon="logout" label={t("settingsRows.logout")} onClick={() => setConfirmLogout(true)} />
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
            <h2 className="text-[24px] font-extrabold text-temple-700 font-hindi text-center">
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
              className="w-full min-h-[56px] bg-sindoor text-white rounded-cta text-[18px] font-extrabold font-hindi shadow-btn active:scale-[0.97] transition-transform"
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
