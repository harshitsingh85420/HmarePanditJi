"use client";

// Q10 — DASHBOARD WARMTH. The first dashboard narration used to be a
// 5-11s TTS MISS; warming the top lines at login (and on /home mount for
// returning sessions) turns them into ~10ms cache HITs. Texts must be
// the EXACT spoken strings — the TTS cache is keyed on them.

import { voiceController } from "@/lib/voiceController";
import { t } from "@/lib/i18n";

export function prefetchDashboardNarrations(): void {
  voiceController.prefetch([
    // home status narrations (template-free variants)
    t("home.pendingVerification"),
    // tab intros
    t("earnings.introVoice"),
    t("calendar.blockVoice"),
    t("myPoojas.intro"),
    t("settingsScreen.intro"),
    // readiness step narrations (exact composed utterances)
    `${t("readiness.r1Voice")} ${t("tutorial.advanceAsk")}`,
    t("readiness.r2Question"),
    `${t("readiness.r3Voice")} ${t("tutorial.advanceAsk")}`,
    `${t("readiness.r4Voice")} ${t("tutorial.advanceAsk")}`,
    `${t("readiness.r5Voice")} ${t("tutorial.advanceAsk")}`,
  ]);
}
