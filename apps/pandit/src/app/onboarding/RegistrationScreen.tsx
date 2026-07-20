"use client";

// ─────────────────────────────────────────────────────────────
// FLOW C — MINIMAL REGISTRATION. Registration creates an ACCOUNT
// only: name (empty, voice-first) + city (prefilled ONLY from the
// detected location, editable). Never asks pujas/dakshina/bank/
// aadhaar — those are earned later in the booking-readiness flow.
// [खाता बनाएँ] → celebration-lite → /home.
// X5: a returning-but-incomplete account sees "प्रोफ़ाइल पूरी करें"
// (login stamps sessionStorage hpj_returning_incomplete after OTP).
// Back returns to the Tutorial CTA slide (universal-back law) via
// the orchestrator's onBack.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { mutateOnce } from "@/lib/mutate";
import { api } from "@/lib/api";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { Narrate } from "@/hooks/useScreenVoice";
import { useVoiceCommands } from "@/hooks/useVoiceScreen";
import { YES, NEXT, BACK } from "@/lib/voiceGrammar";
import { VoiceField } from "@/components/voice/VoiceField";
import { useVoice } from "@/hooks/useVoice";
import { voiceController } from "@/lib/voiceController";
import { useSafeOnboardingStore } from "@/lib/stores/ssr-safe-stores";

export default function RegistrationScreen({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { speak } = useVoice();
  const { detectedCity } = useSafeOnboardingStore();

  const [returning, setReturning] = useState(false);
  const [name, setName] = useState(""); // ALWAYS empty — never prefilled (X3)
  const [city, setCity] = useState(""); // ONLY city-from-detection may prefill
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const cityPrefilled = useRef(false);
  // S3: the narration's "खाता बनाएँ" target
  const submitRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      setReturning(sessionStorage.getItem("hpj_returning_incomplete") === "1");
    } catch {
      /* noop */
    }
  }, []);

  // City prefill happens exactly once, from the location phase's detection
  useEffect(() => {
    if (!cityPrefilled.current && detectedCity) {
      cityPrefilled.current = true;
      setCity((prev) => prev || detectedCity);
    }
  }, [detectedCity]);

  // Q6 SPOKEN-ERROR LAW: whatever renders as the error IS what शिष्य
  // says — never a generic "कुछ गड़बड़" beside a specific on-screen line.
  const sayError = (msg: string) => {
    setErrorMsg(msg);
    speak(msg);
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!name || name.trim().length < 3) {
      sayError(t("onboarding.nameError"));
      return;
    }
    if (!city || city.trim().length === 0) {
      sayError(t("onboarding.cityError"));
      return;
    }
    setSubmitting(true);
    const res = await mutateOnce("pandit-onboarding", "/pandit/onboarding", {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), city: city.trim() }),
    });
    setSubmitting(false);
    if (!res.success) {
      sayError(res.error?.message || t("common.error"));
      return;
    }
    try {
      sessionStorage.removeItem("hpj_returning_incomplete");
    } catch {
      /* noop */
    }
    // Q7: the submit's own navigation — कहानी carries the tap's intent
    voiceController.stopSpeech("user-flow:register-submit");
    setShowDone(true);
  };

  // J2: both fields fill by voice (each FILLED field yields the mic to
  // the next); हाँ/आगे submits — validation speaks if something's
  // missing — and पीछे returns to the tutorial CTA.
  useVoiceCommands(
    [
      { keywords: [...YES, ...NEXT, "खाता", "बनाओ"], action: () => void handleSubmit() },
      { keywords: BACK, action: onBack },
    ],
    t("help.registration"),
    !showDone,
  );

  // ── celebration-lite → /home ───────────────────────────────
  if (showDone) {
    return <CelebrationLite onDone={() => router.push("/home")} />;
  }

  const title = returning ? t("registration.titleComplete") : t("registration.titleNew");
  const cta = returning ? t("registration.completeBtn") : t("registration.createBtn");
  const narration = returning ? t("registration.voiceComplete") : t("registration.voiceNew");

  return (
    <div className="h-[100dvh] bg-cream text-ink flex flex-col max-w-[430px] mx-auto w-full">
      <Header title={title} festive showBack onBack={onBack} />
      {/* S3: the narration ends on the create-account instruction */}
      <Narrate text={narration} highlightRef={submitRef} />

      {/* CANON frame 6 column: padding 16px 22px 18px, gap 18px */}
      <main className="flex-1 min-h-0 overflow-y-auto px-[22px] pt-4 pb-[18px] flex flex-col gap-[18px]">
        {/* CANON hero: 28/900 #341A13 + 16/600 #8A6F5C, 4px apart */}
        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-[28px] font-black text-temple-700 font-hindi leading-snug">
            {t("registration.heroTitle")}
          </h2>
          <p className="text-[16px] font-semibold text-softgrey font-hindi">
            {t("registration.heroSub")}
          </p>
        </div>

        {/* CANON field stack: its own column, gap 14px.
            Each field card in frame 6 is deliberately NOT the raised
            surface Card default — canon draws it FLAT #FFFDF8, radius 20,
            padding 15/16, and lays it with the SOFT shadow
            (0 4px 12px rgba(90,46,32,.08)) rather than the 6px/16px lift.
            The leading glyph is a bare 30px emoji: canon gives it no tile,
            no fill, no radius — the tile the app had drawn was inventing
            a chip that does not exist on the artboard, and it also pushed
            the row off centre (canon centres the row, not its top edge). */}
        <div className="flex flex-col gap-[14px] flex-1">
          <Card className="bg-none bg-card shadow-soft py-[15px] px-4 rounded-[20px] border-2 border-sand flex flex-row items-center gap-[14px]">
            <span className="text-[30px] leading-none shrink-0 select-none" aria-hidden="true">
              🙏
            </span>
            <div className="flex-1 min-w-0">
              <VoiceField
                label={t("onboarding.step1Title")}
                promptText={t("onboarding.step1Voice")}
                value={name}
                onChange={setName}
                mode="text"
                required
                placeholder="पंडित जी का नाम लिखें"
              />
            </div>
          </Card>
          <Card className="bg-none bg-card shadow-soft py-[15px] px-4 rounded-[20px] border-2 border-sand flex flex-row items-center gap-[14px]">
            <span className="text-[30px] leading-none shrink-0 select-none" aria-hidden="true">
              🏙️
            </span>
            <div className="flex-1 min-w-0">
              <VoiceField
                label={t("registration.cityLabel")}
                promptText={t("onboarding.step2Voice")}
                value={city}
                onChange={setCity}
                mode="text"
                required
                placeholder={t("registration.cityPlaceholder")}
              />
            </div>
          </Card>
        </div>

        {errorMsg && (
          <div className="px-4 py-3 bg-red-50 rounded-card border-2 border-danger/30">
            <p className="text-danger text-[18px] font-bold text-center leading-snug font-hindi">
              {errorMsg}
            </p>
          </div>
        )}
      </main>

      <footer className="shrink-0 bg-white border-t border-saffron-100 flex items-end p-3 gap-3">
        <div className="flex-1" ref={submitRef}>
          <Button variant="primary" size="lg" fullWidth className="text-[22px] font-extrabold" onClick={handleSubmit} loading={submitting}>
            {cta}
          </Button>
        </div>
        <ShishyaOrb />
      </footer>
    </div>
  );
}

// Lite celebration — a quiet 🎉 beat, narrated, then home. The FULL
// CelebrationScreen (marigold rain) is reserved for readiness completion.
function CelebrationLite({ onDone }: { onDone: () => void }) {
  // K3-adjacent: a flat 2.6s auto-advance used to behead its own
  // narration mid-air (a real MID-UTTERANCE cut, not a labeling bug).
  // Keep the 2.6s minimum display, then leave when the line has ENDED —
  // capped at 8s total so a stalled TTS can never trap the pandit here.
  useEffect(() => {
    let finished = false;
    let poll: ReturnType<typeof setInterval> | null = null;
    let cap: ReturnType<typeof setTimeout> | null = null;
    const go = () => {
      if (finished) return;
      finished = true;
      if (poll) clearInterval(poll);
      if (cap) clearTimeout(cap);
      onDone();
    };
    const min = setTimeout(() => {
      if (!voiceController.speaking) {
        go();
        return;
      }
      poll = setInterval(() => {
        if (!voiceController.speaking) go();
      }, 250);
      cap = setTimeout(go, 5400);
    }, 2600);
    return () => {
      finished = true;
      clearTimeout(min);
      if (poll) clearInterval(poll);
      if (cap) clearTimeout(cap);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-cream text-ink flex flex-col justify-between p-6 z-50">
      <Narrate text={t("registration.celebrationVoice")} />
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 max-w-[430px] mx-auto">
        <span className="text-[100px] select-none leading-none" aria-hidden="true">🎉</span>
        <h1 className="text-[36px] font-bold text-temple-700 font-hindi">
          {t("registration.celebrationTitle")}
        </h1>
      </div>
      <div className="max-w-[430px] mx-auto w-full pb-4">
        <Button variant="primary" size="lg" fullWidth onClick={onDone}>
          {t("onboarding.homeBtn")}
        </Button>
      </div>
    </div>
  );
}
