"use client";

// ─────────────────────────────────────────────────────────────
// PARICHAY — Meet-style AUTO-PROMPT. The mic permission popup appears
// BY ITSELF the moment this screen mounts, while शिष्य simultaneously
// asks for it (like Google Meet's join screen).
//
// TECHNICAL BASIS: in a secure context, a top-level
// navigator.mediaDevices.getUserMedia({audio:true}) does NOT require a
// user gesture — only audio PLAYBACK does, and playback is normally
// unlocked by the splash tap that precedes this screen. (If the splash
// auto-advanced with NO tap, speak() parks pre-unlock — the loud
// 'UNLOCK MISSING AT PARICHAY' debug line below is the tell.)
//
// MOUNT (once — StrictMode ref guard): INTRODUCE FIRST, THEN PROMPT.
//   permissions.query says 'granted' → no popup will appear: shorter
//     greeting (alreadyGranted) → silent getUserMedia → practice listen.
//   otherwise (prompt/denied/unsupported — NEVER pre-block on these):
//     speak introOnly TO COMPLETION (speakAndWait) → then SAME TICK:
//     getUserMedia + PopupPointer + speak pressAllow (after invoking
//     gUM — narration never delays the prompt).
// SETTLE (ladder from b1c58ef unchanged):
//   granted           → thanks → practice listen on the SAME stream.
//   NotAllowedError   → permissions.query NOW:
//     'denied'        → settings-recovery card; ONLY this sets micDenied.
//     'prompt'/unsup  → DISMISSED: dismissed line + "फिर से पूछें" CTA
//                       (62px, canon's 64) — a real tap re-prompts, which also
//                       covers Androids that throttle gestureless
//                       re-prompts.
//   NotFoundError     → no mic hardware: micDenied, gentle line, on.
// The primary CTA is HIDDEN on the happy path — it exists only as the
// dismissed-fallback. Settings-recovery is unreachable pre-attempt.
// The hero orb IS the screen's voice control (one-orb law).
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from "react";
import { t } from "@/lib/i18n";
import { voiceController } from "@/lib/voiceController";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useSafeOnboardingStore } from "@/lib/stores/ssr-safe-stores";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { Button } from "@/components/ui/Button";
import { PopupPointer } from "@/components/moments/PopupPointer";

// CANON frame 4 (परिचय · Parichay + माइक अनुमति) — the page field is a warm
// radial, NOT the flat cream used elsewhere, and the frame carries no header
// band and no toran: शिष्य is centred in open space with the mic card resting
// at the foot. Literal from the artboard, inline because Tailwind has no token
// for this one-off radial.
const CANON_FIELD = "radial-gradient(120% 70% at 50% 22%,#FFF4E0,#FFF9EE 60%)";

type Stage = "auto" | "needstart" | "asking" | "granted" | "practice" | "dismissed" | "leaving";

export default function ParichayScreen({ onDone }: { onDone: () => void }) {
  const store = useSafeOnboardingStore();
  const voiceInput = useVoiceInput();
  const [stage, setStage] = useState<Stage>("auto");
  const stageRef = useRef<Stage>("auto");
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);
  const [recovery, setRecovery] = useState(false);
  const [pointerUp, setPointerUp] = useState(false);
  const doneRef = useRef(false);
  const firedRef = useRef(false);
  // S3: highlight target for the dismissed-fallback "फिर से पूछें" CTA
  const askAgainRef = useRef<HTMLDivElement | null>(null);

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

  const runGrantedPath = (stream: MediaStream, greeting: string) => {
    try {
      localStorage.setItem("mic_permission_granted", "true");
    } catch { /* noop */ }
    store.setMicDenied(false);
    setRecovery(false);
    setStage("granted");
    voiceController.speak(greeting, {
      onOutcome: (status) => {
        // parked = a human has NOT touched the app (deep-link/refresh
        // straight into a pre-granted Parichay) — never advance on a
        // timerless park either; offer the tappable start instead.
        if (status === "parked") {
          setStage("needstart");
          return;
        }
        // muted/interrupted/failed: the line never played — practicing
        // into silence would strand the pandit on a UI-less stage. Mic
        // is granted: just advance.
        if (status !== "ended") {
          advance();
          return;
        }
        voiceController.speak(t("parichay.tryIt"), {
          onEnd: (completed2) => {
            if (!completed2) {
              advance();
              return;
            }
            setStage("practice");
            // one practice listen on the SAME granted stream —
            // never a second getUserMedia for this attempt
            void voiceInput.start({ stream });
          },
        });
      },
    });
  };

  /** The prompt attempt — auto-fired on mount, re-fired by the
   *  dismissed-fallback tap. speak and getUserMedia go out the SAME
   *  tick; neither waits for the other. */
  const askMic = (line: string) => {
    const streamPromise = navigator.mediaDevices.getUserMedia({ audio: true });
    voiceController.debug("perm: getUserMedia invoked (parichay)");
    setPointerUp(true);
    setStage("asking");
    voiceController.speak(line);
    void streamPromise
      .then((stream) => {
        setPointerUp(false);
        voiceController.debug("perm: settled(granted) (parichay)");
        voiceController.stopSpeech("parichay:grant-settle");
        runGrantedPath(stream, t("parichay.granted"));
      })
      .catch(async (e: unknown) => {
        setPointerUp(false);
        const name = (e as Error)?.name || "";
        if (name === "NotFoundError") {
          voiceController.debug("perm: settled(denied - no mic hardware) (parichay)");
          voiceController.debug("parichay: no-mic → continue");
          finishDeny();
          return;
        }
        // NotAllowedError (or unknown): only a CONFIRMED browser-level
        // deny shows the settings recovery. 'prompt' or an unsupported
        // query means the popup was dismissed - keep a tap path alive.
        let state: string = "unsupported";
        try {
          const st = await navigator.permissions.query({ name: "microphone" as PermissionName });
          state = st.state;
        } catch { /* query unsupported -> treat as dismissed */ }
        if (state === "denied") {
          voiceController.debug("perm: settled(denied) (parichay)");
          setRecovery(true);
          setStage("dismissed");
        } else {
          voiceController.debug("perm: settled(dismissed) (parichay)");
          setRecovery(false); // the latest attempt was a dismissal, not a deny
          setStage("dismissed");
          // S3: the line says "फिर बटन दबाइए" — glow the fallback CTA
          voiceController.speak(t("parichay.dismissed"), { highlightRef: askAgainRef });
        }
      });
  };

  // ── AUTO-FIRE on mount — exactly once. StrictMode simulates an
  // unmount/remount of the SAME instance, so the guard is the ref and
  // the fire routine must NOT be cancelled by the first (simulated)
  // cleanup; real departure is tracked by doneRef (set in advance()).
  useEffect(() => {
    const unregister = voiceController.registerReplay(() => {
      // stage-aware: never re-instruct a popup that is no longer up
      const st = stageRef.current;
      if (st === "dismissed") voiceController.speak(t("parichay.dismissed"));
      else if (st === "granted" || st === "practice") voiceController.speak(t("parichay.tryIt"));
      else if (st === "asking") voiceController.speak(t("parichay.pressAllow"));
      else if (st !== "leaving") voiceController.speak(t("parichay.introOnly"));
    });

    if (!firedRef.current) {
      firedRef.current = true;

      // Task-2 instrumentation: the tell for a silent phone.
      voiceController.debug("parichay mount → speak(introOnly) queued");
      // D3c: warm the tutorial's opening narration while शिष्य introduces
      // (N2 order: TUTORIAL follows Parichay). The TTS cache is keyed on
      // the EXACT spoken text — TutorialV2 narrates slide1+advanceAsk as
      // one utterance, so warm precisely that string.
      voiceController.prefetch([
        t("parichay.tryIt"),
        `${t("tutorial.slide1")} ${t("tutorial.advanceAsk")}`,
      ]);
      voiceController.debug(`parichay: unlocked=${voiceController.unlocked} ${voiceController.audioElState()}`);
      if (!voiceController.unlocked) {
        voiceController.debug("⚠ UNLOCK MISSING AT PARICHAY — splash advanced without a tap; speech will park");
      }

      const fire = async () => {
        // E2E traversal (?e2e=1): getUserMedia is NEVER invoked — let the
        // intro settle (parked counts as settled), then bypass to LOCATION.
        if (voiceController.e2e) {
          await voiceController.speakAndWait(t("parichay.introOnly"));
          if (doneRef.current) return;
          voiceController.debug("e2e: parichay bypassed");
          // P3: countable stand-in for the real prompt — e2e assertions
          // check "exactly one gUM, at Parichay" off this line.
          voiceController.debug("gUM invoked (e2e-bypassed)");
          // K1: e2e defaults to SIMULATED-GRANTED — the whole point of
          // the e2e walk is exercising the real voice loop (listens
          // resolve instantly, transcripts come from the injector). Only
          // an EXPLICIT perm-sim deny (denied/nomic/dismiss) walks the
          // touch-only denied path.
          let sim: string | null = null;
          try {
            sim = sessionStorage.getItem("hpj_perm_sim");
          } catch { /* noop */ }
          if (sim === "denied" || sim === "nomic" || sim === "dismiss") {
            store.setMicDenied(true);
          } else {
            try {
              localStorage.setItem("mic_permission_granted", "true");
            } catch { /* noop */ }
            store.setMicDenied(false);
          }
          advance();
          return;
        }
        // Pre-check ONLY for the granted shortcut (no popup will appear).
        // 'denied'/'prompt' never pre-block — attempt-first ladder stays.
        let state: string = "unknown";
        try {
          const st = await navigator.permissions.query({ name: "microphone" as PermissionName });
          state = st.state;
        } catch { /* unsupported → attempt */ }
        if (doneRef.current) return;
        if (state === "granted") {
          voiceController.debug("perm: pre-granted → silent getUserMedia (parichay)");
          navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
              if (doneRef.current) return;
              voiceController.debug("perm: settled(granted) (parichay)");
              runGrantedPath(stream, t("parichay.alreadyGranted"));
            })
            .catch(() => {
              // granted state but stream failed (hardware busy?) — gentle on
              if (!doneRef.current) finishDeny();
            });
          return;
        }
        // D2: शिष्य introduces himself COMPLETELY before any popup —
        // the prompt + pointer + short ask fire only when the intro ends.
        voiceController.debug("parichay: intro → (onEnd) → prompt");
        const { status } = await voiceController.speakAndWait(t("parichay.introOnly"));
        if (doneRef.current) return;
        if (status === "parked") {
          // deep-link/refresh straight into PARICHAY with no gesture yet:
          // a timer must not fire the prompt — offer THE tappable start.
          voiceController.debug("parichay: intro parked → start CTA");
          setStage("needstart");
          return;
        }
        askMic(t("parichay.pressAllow"));
      };
      void fire();
    }

    return () => {
      unregister();
      voiceController.stopSpeech("unmount:parichay");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Practice watchdog: if the listen never arms or is aborted (muted,
  // tab hidden), nothing would ever resolve — advance gently instead of
  // stranding the pandit on a stage with no UI.
  useEffect(() => {
    if (stage !== "practice") return;
    const watchdog = setTimeout(() => {
      voiceController.debug("parichay practice watchdog → advancing");
      advance();
    }, 15000);
    return () => clearTimeout(watchdog);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

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
    <div
      className="h-[100dvh] flex flex-col max-w-[430px] mx-auto text-ink"
      style={{ background: CANON_FIELD }}
    >
      {/* CANON frame 4 padding: 20px top / 24px sides / 22px bottom */}
      <main className="flex-1 overflow-y-auto px-6 pt-5 pb-[22px] flex flex-col items-center">
        {/* Canon centres शिष्य + his greeting in the free space above the
            card (flex:1, justify-center, gap:16). */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-4 text-center">
          {/* शिष्य himself — canon frame 4: size 118, speaking ribbon
              "मैं शिष्य हूँ — आपका सहायक 🙏", name shown (the orb carries its
              OWN label — never add a second one; that double-printed it). */}
          <ShishyaOrb size={118} say={t("parichay.say")} />

          {/* Canon: greeting block sits 6px under the orb; 24/900 #7A250E
              with a 600-weight #8A6F5C sub-line 4px below it. */}
          <div className="mt-[6px]">
            <h2 className="text-[24px] font-black text-saffron-700 font-hindi leading-snug">
              {t("parichay.title")}
            </h2>
            <p className="mt-1 text-[18px] font-semibold text-softgrey font-hindi leading-relaxed">
              {t("parichay.body")}
            </p>
          </div>
        </div>

        {/* CANON mic-ask card — the visual twin of the auto-prompt (never
            interactive; the ladder owns behavior). Literals: #FFFDF8 fill,
            2px #F0DFC4 hairline, r22, p20, gap 15, and THE lifted shadow
            0 8px 22px rgba(90,46,32,.1) that was missing entirely. */}
        <div className="shrink-0 mt-4 w-full bg-card border-2 border-sand rounded-surface p-5 flex flex-col items-center gap-[15px] shadow-[0_8px_22px_rgba(90,46,32,0.1)]">
          {/* 66px peach disc, 2px #F4B096 ring, 36px sindoor mic glyph */}
          <span
            className="w-[66px] h-[66px] rounded-full bg-saffron-50 border-2 border-saffron-200 flex items-center justify-center select-none"
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-[36px] leading-none text-saffron-500">
              mic
            </span>
          </span>
          <p className="text-[18px] font-bold text-temple-700 font-hindi leading-[1.35] text-center">
            {t("parichay.micCardLine")}
          </p>
          {/* Canon draws this at 14/600 — held at the 18sp floor (law) with
              canon's 7px gap and its #1E7A46 lock glyph. */}
          <p className="text-[18px] font-semibold text-softgrey font-hindi flex items-center gap-[7px]">
            <span className="material-symbols-outlined text-[18px] leading-none text-leaf-500" aria-hidden="true">
              lock
            </span>
            {t("parichay.safeLine")}
          </p>
        </div>

        {stage === "practice" && (
          <p className="shrink-0 mt-3 t-body font-bold text-temple-600 font-hindi text-center">
            {t("parichay.tryIt")}
          </p>
        )}
      </main>

      {/* Footer: ABSENT on the happy path (the popup asks by itself) — canon
          frame 4 has no bottom band, so it must not draw a cream slab and a
          hairline over the radial field when it has nothing to say.
          "फिर से पूछिए" appears only after a dismissal; the recovery set
          only after a CONFIRMED browser-level deny. */}
      {(stage === "dismissed" || stage === "needstart") && (
      <footer className="shrink-0 px-6 pb-[22px] pt-1 flex flex-col gap-2">
        {recovery && stage === "dismissed" ? (
          <>
            <p className="t-body font-bold text-temple-600 font-hindi text-center">
              {t("tutorial.slide5Blocked")}
            </p>
            <Button variant="secondary" size="md" fullWidth onClick={() => askMic(t("parichay.pressAllow"))}>
              {t("tutorial.slide5Retry")}
            </Button>
            <Button variant="ghost" size="md" fullWidth onClick={finishDeny}>
              {t("common.next")}
            </Button>
          </>
        ) : stage === "dismissed" ? (
          /* S3: wrapper ref — the dismissed narration highlights THIS */
          <div ref={askAgainRef}>
            {/* canon's ask CTA: 64px sindoor, 21/800 — Button `md` (62px/21px) */}
            <Button variant="primary" size="md" fullWidth onClick={() => askMic(t("parichay.pressAllow"))}>
              {t("parichay.askAgainBtn")}
            </Button>
          </div>
        ) : stage === "needstart" ? (
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => {
              // this tap IS the unlock gesture; speak the intro, then the
              // existing gUM ladder
              void voiceController.speakAndWait(t("parichay.introOnly")).then(() => {
                if (!doneRef.current) askMic(t("parichay.pressAllow"));
              });
              setStage("auto");
            }}
          >
            {t("parichay.startBtn")}
          </Button>
        ) : null}
      </footer>
      )}

      {/* F2 DEAD-END FIX (founder P0, 2026-07-23): a PERSISTENT forward path,
          rendered on EVERY stage — voice is optional and must never gate
          onboarding. The पP0 walk found परिचय (onboarding screen 5) strandable
          for the popup-refusing persona: a dismissed mic popup left only
          "फिर से पूछिए", no way forward. This skip is unconditional (never
          disappears) and calls advance() (marks parichayDone, proceeds voice-
          less; mic stays re-offerable downstream — a skip is not a deny).
          parichayForwardPath.test.ts fails the build if this becomes
          stage-conditional or is removed. */}
      <div className="shrink-0 px-6 pb-[22px] pt-1 flex justify-center">
        <button
          onClick={advance}
          className="min-h-[52px] px-4 text-[16px] font-semibold text-softgrey font-hindi underline underline-offset-4 active:opacity-70"
        >
          {t("parichay.skipVoice")}
        </button>
      </div>

      {/* Arrow + chip pointing at the NATIVE permission popup */}
      {pointerUp && <PopupPointer />}
    </div>
  );
}
