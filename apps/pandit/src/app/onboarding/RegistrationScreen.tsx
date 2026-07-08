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
import { hi } from "@/lib/strings";
import { api } from "@/lib/api";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { Narrate } from "@/hooks/useScreenVoice";
import { VoiceField } from "@/components/voice/VoiceField";
import { useVoice } from "@/hooks/useVoice";
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

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!name || name.trim().length < 3) {
      setErrorMsg(hi.onboarding.nameError);
      speak(hi.common.error);
      return;
    }
    if (!city || city.trim().length === 0) {
      setErrorMsg(hi.onboarding.cityError);
      speak(hi.common.error);
      return;
    }
    setSubmitting(true);
    const res = await api("/pandit/onboarding", {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), city: city.trim() }),
    });
    setSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.error?.message || hi.common.error);
      speak(hi.common.error);
      return;
    }
    try {
      sessionStorage.removeItem("hpj_returning_incomplete");
    } catch {
      /* noop */
    }
    setShowDone(true);
  };

  // ── celebration-lite → /home ───────────────────────────────
  if (showDone) {
    return <CelebrationLite onDone={() => router.push("/home")} />;
  }

  const title = returning ? hi.registration.titleComplete : hi.registration.titleNew;
  const cta = returning ? hi.registration.completeBtn : hi.registration.createBtn;
  const narration = returning ? hi.registration.voiceComplete : hi.registration.voiceNew;

  return (
    <div className="h-[100dvh] bg-cream text-ink flex flex-col max-w-[430px] mx-auto w-full">
      <Header title={title} festive showBack onBack={onBack} />
      <Narrate text={narration} />

      <main className="flex-1 min-h-0 overflow-y-auto px-4 pt-6 flex flex-col gap-4">
        <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-5">
          <VoiceField
            label={hi.onboarding.step1Title}
            promptText={hi.onboarding.step1Voice}
            value={name}
            onChange={setName}
            mode="text"
            required
            placeholder="पंडित जी का नाम लिखें"
          />
          <VoiceField
            label={hi.registration.cityLabel}
            promptText={hi.onboarding.step2Voice}
            value={city}
            onChange={setCity}
            mode="text"
            required
            placeholder={hi.registration.cityPlaceholder}
          />
        </Card>

        {errorMsg && (
          <div className="px-4 py-3 bg-red-50 rounded-card border-2 border-danger/30">
            <p className="text-danger text-[18px] font-bold text-center leading-snug font-hindi">
              {errorMsg}
            </p>
          </div>
        )}
      </main>

      <footer className="shrink-0 bg-white border-t border-saffron-100 flex items-end p-3 gap-3">
        <div className="flex-1">
          <Button variant="primary" size="lg" fullWidth onClick={handleSubmit} loading={submitting}>
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
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-cream text-ink flex flex-col justify-between p-6 z-50">
      <Narrate text={hi.registration.celebrationVoice} />
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 max-w-[430px] mx-auto">
        <span className="text-[100px] select-none leading-none" aria-hidden="true">🎉</span>
        <h1 className="text-[36px] font-bold text-temple-700 font-hindi">
          {hi.registration.celebrationTitle}
        </h1>
      </div>
      <div className="max-w-[430px] mx-auto w-full pb-4">
        <Button variant="primary" size="lg" fullWidth onClick={onDone}>
          {hi.onboarding.homeBtn}
        </Button>
      </div>
    </div>
  );
}
