"use client";

// ─────────────────────────────────────────────────────────────
// PARICHAY — शिष्य introduces himself and earns the mic BEFORE
// location (trust first, permission second). PERMISSION LADDER LAW:
// getUserMedia is ALWAYS attempted first, as the FIRST statement of
// the tap stack — never pre-blocked on permissions.query alone
// ('prompt' misreports on some Androids, and Chrome's "ask every
// time" re-prompts even after past denials).
//   resolves            → thank-you → practice listen on the SAME
//                         stream → advance (silence advances gently).
//   NotAllowedError     → permissions.query NOW:
//     state 'denied'    → settings-recovery card (retry + ghost next);
//                         ONLY this explicit state sets micDenied.
//     'prompt'/unsupported → the popup was DISMISSED: speak the
//                         dismissed line, CTA stays active, no flags.
//   NotFoundError       → no mic hardware: micDenied, gentle line, on.
// The settings-recovery copy is UNREACHABLE on a first-ever attempt.
// While the native popup is up: PopupPointer arrow + spoken guidance.
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
import { PopupPointer } from "@/components/moments/PopupPointer";

type Stage = "intro" | "asking" | "granted" | "practice" | "leaving";

export default function ParichayScreen({ onDone }: { onDone: () => void }) {
  const store = useSafeOnboardingStore();
  const voiceInput = useVoiceInput();
  const [stage, setStage] = useState<Stage>("intro");
  const [narrationEnded, setNarrationEnded] = useState(false);
  const [spotDismissed, setSpotDismissed] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [pointerUp, setPointerUp] = useState(false);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const doneRef = useRef(false);

  useScreenVoice(t("parichay.voice"), { onNarrationEnd: () => setNarrationEnded(true) });

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
    // LADDER LAW: the getUserMedia promise is created as the FIRST
    // statement of the tap stack — narration must never delay it.
    const streamPromise = navigator.mediaDevices.getUserMedia({ audio: true });
    voiceController.debug("perm: getUserMedia invoked (parichay)");
    setPointerUp(true);
    setSpotDismissed(true);
    setStage("asking");
    // spoken guidance WHILE the native popup is up (audio already
    // unlocked by this same gesture)
    voiceController.speak(t("perm.pressAllowVoice"));
    void streamPromise
      .then((stream) => {
        setPointerUp(false);
        voiceController.debug("perm: settled(granted) (parichay)");
        voiceController.stopSpeech();
        try {
          localStorage.setItem("mic_permission_granted", "true");
        } catch { /* noop */ }
        store.setMicDenied(false);
        setRecovery(false);
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
      .catch(async (e: unknown) => {
        setPointerUp(false);
        const name = (e as Error)?.name || "";
        if (name === "NotFoundError") {
          // no microphone hardware — nothing to recover
          voiceController.debug("perm: settled(denied - no mic hardware) (parichay)");
          finishDeny();
          return;
        }
        // NotAllowedError (or unknown): only a CONFIRMED browser-level
        // deny shows the settings recovery. 'prompt' or an unsupported
        // query means the popup was dismissed - keep the CTA alive.
        let state: string = "unsupported";
        try {
          const st = await navigator.permissions.query({ name: "microphone" as PermissionName });
          state = st.state;
        } catch { /* query unsupported -> treat as dismissed */ }
        if (state === "denied") {
          voiceController.debug("perm: settled(denied) (parichay)");
          setRecovery(true);
          setStage("intro");
        } else {
          voiceController.debug("perm: settled(dismissed) (parichay)");
          setStage("intro");
          voiceController.speak(t("parichay.dismissed"));
        }
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
        {recovery && (stage === "intro" || stage === "asking") ? (
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

      {/* Arrow + chip pointing at the NATIVE permission popup */}
      {pointerUp && <PopupPointer />}

      {/* Voice explained it — the spotlight only points (no tooltip card) */}
      {narrationEnded && !spotDismissed && (stage === "intro") && !recovery && (
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
