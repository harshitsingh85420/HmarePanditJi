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
import { useSafeOnboardingStore, useSafeRegistrationStore } from "@/lib/stores/ssr-safe-stores";

export default function RegistrationScreen({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { speak } = useVoice();
  const { detectedCity } = useSafeOnboardingStore();
  // F02-09 BACK-SAFETY: पीछे unmounts this screen (the orchestrator flips
  // the phase to TUTORIAL), so anything held in plain useState is gone the
  // moment the pandit steps back — on the app's FIRST data-entry screen.
  // Every keystroke is mirrored into the registration store, which already
  // owns name/city, already persists to localStorage, and — critically —
  // is already on X3's purge list ('hpj-registration' in purgeUserData),
  // so a draft can never survive a logout into the NEXT pandit's screen.
  // The onboarding store would have been the wrong home: it is deliberately
  // PRESERVED across accounts as install-scoped, so a name parked there
  // would prefill for someone else and break X3.
  const { data: regDraft, setName: persistName, setCity: persistCity } = useSafeRegistrationStore();

  const [returning, setReturning] = useState(false);
  const [name, setName] = useState(""); // never prefilled from ANOTHER account (X3)
  const [city, setCity] = useState(""); // detection, or this session's own draft
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const cityPrefilled = useRef(false);
  const restored = useRef(false);
  // S3: the narration's "खाता बनाएँ" target
  const submitRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      setReturning(sessionStorage.getItem("hpj_returning_incomplete") === "1");
    } catch {
      /* noop */
    }
  }, []);

  // F02-09: restore this session's own draft on (re)mount. Runs once, in an
  // effect rather than a useState initialiser, so SSR and the first client
  // render still agree (the store hydrates from localStorage on the client).
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    if (regDraft.name) setName(regDraft.name);
    if (regDraft.city) {
      setCity(regDraft.city);
      // a restored city is the pandit's own typing — detection must not
      // overwrite it on the way back in
      cityPrefilled.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Write-through: state and store move together, so the value is already
  // durable before onBack can unmount us.
  const changeName = (v: string) => {
    setName(v);
    persistName(v);
  };
  const changeCity = (v: string) => {
    setCity(v);
    persistCity(v, regDraft.state || "");
  };

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

  const cta = returning ? t("registration.completeBtn") : t("registration.createBtn");
  const narration = returning ? t("registration.voiceComplete") : t("registration.voiceNew");

  return (
    <div className="h-[100dvh] bg-cream text-ink flex flex-col max-w-[430px] mx-auto w-full relative">
      {/* canon frame 6: the garland is the ONLY chrome — the 28/900 hero
          heading below is the title. Canon omits the back control; kept as a
          floating canon back-circle (no-dead-ends law) — flagged deviation. */}
      <Header variant="garland" />
      <button
        onClick={onBack}
        aria-label={t("common.back")}
        className="absolute left-3 top-[64px] z-20 w-[52px] h-[52px] min-h-[52px] min-w-[52px] rounded-full bg-card shadow-card flex items-center justify-center active:scale-90 transition-all focus:outline-none focus:ring-2 focus:ring-saffron-200"
      >
        <span className="material-symbols-outlined text-[24px] leading-none text-saffron-700" aria-hidden="true">
          arrow_back
        </span>
      </button>
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
                onChange={changeName}
                mode="text"
                required
                placeholder="पंडित जी का नाम लिखिए"
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
                onChange={changeCity}
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

      <footer className="shrink-0 px-3 pt-3 pb-0">
        <div ref={submitRef}>
          <Button variant="primary" size="lg" fullWidth className="text-[22px] font-extrabold" onClick={handleSubmit} loading={submitting}>
            {cta}
          </Button>
        </div>
      </footer>
      {/* canon frame 6: शिष्य in his own centered strip BELOW the CTA
          (padding 0 0 14px), size 60, ribbon "बाकी सब मैं देख लूँगा 🙏" */}
      <div className="shrink-0 flex justify-center pb-[14px] pt-2">
        <ShishyaOrb size={60} say={t("registration.say")} />
      </div>
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
