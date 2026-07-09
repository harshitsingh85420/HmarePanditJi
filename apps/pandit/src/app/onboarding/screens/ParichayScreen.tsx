"use client";

// ─────────────────────────────────────────────────────────────
// PARICHAY — शिष्य introduces himself and earns the mic BEFORE
// location (trust first, permission second). D1 LAW: getUserMedia is
// the FIRST statement inside the tap handler — the native prompt only
// fires from the user-gesture call stack.
//   grant  → thank-you → one practice listen on the SAME stream →
//            "मैंने सुन लिया" (transcript OR local speech detection) →
//            advance. Silence → gentle line, advance anyway.
//   deny   → warm reassurance, micDenied=true, touch-only continues.
//   pre-denied (browser setting) → recovery copy + retry + ghost
//            "आगे बढ़ें" — never a dead end.
// The hero orb IS the screen's voice control (no footer orb — one-orb law).
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from "react";
import { t } from "@/lib/i18n";
import { voiceController } from "@/lib/voiceController";
import { useScreenVoice } from "@/hooks/useScreenVoice";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useSafeOnboardingStore } from "@/lib/stores/ssr-safe-stores";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { Button } from "@/components/ui/Button";
import { CoachSpotlight } from "@/components/moments/CoachSpotlight";
import { Toran } from "@/components/ui/Toran";

type Stage = "intro" | "asking" | "granted" | "practice" | "leaving";

export default function ParichayScreen({ onDone }: { onDone: () => void }) {
  const store = useSafeOnboardingStore();
  const voiceInput = useVoiceInput();
  const [stage, setStage] = useState<Stage>("intro");
  const [narrationEnded, setNarrationEnded] = useState(false);
  const [spotDismissed, setSpotDismissed] = useState(false);
  const [micPerm, setMicPerm] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown");
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const doneRef = useRef(false);

  useScreenVoice(t("parichay.voice"), { onNarrationEnd: () => setNarrationEnded(true) });

  // Browser-level pre-state: a sticky DENY means no prompt can appear —
  // show the settings recovery instead of a button that silently fails.
  useEffect(() => {
    if (!navigator.permissions?.query) return;
    let status: PermissionStatus | null = null;
    let disposed = false;
    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((s) => {
        if (disposed) return;
        status = s;
        setMicPerm(s.state);
        s.onchange = () => setMicPerm(s.state);
      })
      .catch(() => setMicPerm("unknown"));
    return () => {
      disposed = true;
      if (status) status.onchange = null;
    };
  }, []);

  const advance = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    store.setParichayDone(true);
    onDone();
  };

  const speakThenAdvance = (line: string) => {
    setStage("leaving");
    voiceController.speak(line, { onEnd: () => advance() });
  };

  const finishDeny = () => {
    try {
      localStorage.setItem("mic_permission_granted", "false");
    } catch { /* noop */ }
    store.setMicDenied(true);
    speakThenAdvance(t("parichay.denied"));
  };

  const askMic = () => {
    // D1 LAW: the getUserMedia promise is created as the FIRST statement
    // of the tap stack — everything else happens while the prompt is up.
    const streamPromise = navigator.mediaDevices.getUserMedia({ audio: true });
    voiceController.stopSpeech();
    setSpotDismissed(true);
    setStage("asking");
    void streamPromise
      .then((stream) => {
        try {
          localStorage.setItem("mic_permission_granted", "true");
        } catch { /* noop */ }
        store.setMicDenied(false);
        setStage("granted");
        voiceController.speak(t("parichay.granted"), {
          onEnd: () => {
            voiceController.speak(t("parichay.tryIt"), {
              onEnd: () => {
                setStage("practice");
                // one practice listen on the SAME granted stream —
                // never a second getUserMedia for this gesture
                void voiceInput.start({ stream });
              },
            });
          },
        });
      })
      .catch(() => {
        finishDeny();
      });
  };

  // Practice resolution: a transcript OR locally-detected speech counts
  // as "heard"; pure silence moves on gently — no nagging, no dead end.
  useEffect(() => {
    if (stage !== "practice") return;
    if (voiceInput.state === "idle" && voiceInput.transcript !== null) {
      voiceController.debug(`parichay practice heard: "${voiceInput.transcript.slice(0, 30)}"`);
      speakThenAdvance(t("parichay.heard"));
    } else if (voiceInput.state === "error") {
      speakThenAdvance(voiceInput.heardSpeech ? t("parichay.heard") : t("parichay.moveOn"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, voiceInput.state, voiceInput.transcript, voiceInput.heardSpeech]);

  const preDenied = micPerm === "denied" && (stage === "intro" || stage === "asking");

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      {/* Festive header band (entry grammar) */}
      <header className="shrink-0">
        <div className="h-[60px] bg-gradient-to-r from-genda to-saffron-500 px-4 flex items-center">
          <h1 className="font-display text-[22px] text-white flex-1 text-center">
            {t("welcome.titleShort")}
          </h1>
        </div>
        <Toran tone="onSindoor" className="bg-saffron-500" />
      </header>

      <main className="flex-1 overflow-y-auto px-6 pt-8 pb-6 flex flex-col items-center gap-5 text-center">
        {/* शिष्य himself — LARGE, rippling while he speaks */}
        <ShishyaOrb size="lg" className="mt-4" />

        <h2 className="text-[28px] font-bold text-temple-600 font-hindi leading-snug">
          {t("parichay.title")}
        </h2>
        <p className="t-body text-softgrey font-hindi leading-relaxed">{t("parichay.body")}</p>

        {stage === "practice" && (
          <p className="t-body font-bold text-temple-600 font-hindi">{t("parichay.tryIt")}</p>
        )}
      </main>

      {/* Footer: THE one primary CTA (72px) — or the recovery set */}
      <footer className="shrink-0 px-4 py-3 bg-cream/95 backdrop-blur border-t border-saffron-100 flex flex-col gap-2">
        {preDenied ? (
          <>
            <p className="t-body font-bold text-temple-600 font-hindi text-center">
              {t("tutorial.slide5Blocked")}
            </p>
            <Button variant="secondary" size="md" fullWidth onClick={askMic}>
              {t("tutorial.slide5Retry")}
            </Button>
            <Button variant="ghost" size="md" fullWidth onClick={finishDeny}>
              {t("common.next")}
            </Button>
          </>
        ) : stage === "intro" || stage === "asking" ? (
          <div ref={ctaRef}>
            <Button
              variant="primary"
              size="xl"
              fullWidth
              onClick={askMic}
              loading={stage === "asking"}
            >
              {t("parichay.allowBtn")}
            </Button>
          </div>
        ) : null}
      </footer>

      {/* Voice explained it — the spotlight only points (no tooltip card) */}
      {narrationEnded && !spotDismissed && (stage === "intro") && !preDenied && (
        <CoachSpotlight
          targetRef={ctaRef}
          title=""
          line=""
          hideCard
          requireInteraction
          onDone={() => setSpotDismissed(true)}
        />
      )}
    </div>
  );
}
