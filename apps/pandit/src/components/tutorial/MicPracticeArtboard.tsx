"use client";

// ─────────────────────────────────────────────────────────────
// MicPracticeArtboard — the आवाज़ voice-practice artboard. This is the ONE copy
// of the mic-permission + practice machinery, EXTRACTED from TutorialV2's isMic
// slide (Ruling #8 / approach C). It has TWO consumers, exactly one copy:
//   • TutorialV2 (the live 6-slide tutorial) renders it in its isMic slot;
//   • ARTBOARDS['A4'] (the 9-slide DeckPlayer) resolves to it.
// micSharedConsumers.test.ts turns the build red if either consumer stops using
// it. The migrated mic guards — tutorialIdentity (askMic/getUserMedia/e2e) and
// micPrompt (sync-seed + granted-short-circuit) — now read THIS file, with
// their assertions UNCHANGED.
//
// The A4 design artboard (आवाज़ visuals from the Claude-Design bundle) is merged
// INTO this component as its visual shell — it NEVER replaces it (see
// docs/review/tutorial-merge-gate.md).
//
// MOUNT MODEL — the ONE structural change from the lift. In TutorialV2 the mic
// machinery lived at the top level, mounted for all slides, gated by
// `if (isMic) return` and keyed on [idx]. Here it MOUNTS only while the आवाज़
// slide is shown and UNMOUNTS on leave, so (these are the listed semantic diffs
// in the byte-for-byte proof, each behaviour-preserving because the old effects
// only ever acted on the mic slide):
//   • the `if (isMic) / if (!isMic)` guards are dropped (unconditionally mic);
//   • effect deps [idx] → [] / [micState] (mounts fresh per visit);
//   • the old "leave-slide reset" effect becomes an UNMOUNT cleanup.
//
// PARENT SIGNALS (the artboard is otherwise self-contained):
//   • onGranted / onDenied — permission outcome (progress / recovery copy);
//   • onBusy(boolean)      — true while asking|listening; the parent gates its
//     manual Next so the pandit can't race past the permission prompt. Derived
//     from micState (fires on EVERY transition) and released on unmount, so it
//     can never be left stuck true (micIsBusy.test.tsx).
//   • onDone               — practice complete. The DeckPlayer advances (so A4
//     is never a dead end); TutorialV2 opens its own Next gate.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { DeckSlide } from "@/lib/tutorial-decks";
import { t } from "@/lib/i18n";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { voiceController } from "@/lib/voiceController";
import { playChime } from "@/lib/sounds";
import { PetalBurst } from "@/components/moments/SlideCanvas";
import { PopupPointer } from "@/components/moments/PopupPointer";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { Button } from "@/components/ui/Button";
import { CoachSpotlight } from "@/components/moments/CoachSpotlight";
import { useReduced } from "@/lib/motion";

// ── mic-only visuals, lifted with the machinery ──────────────
// (SoundWaves + its BAR_* consts were SoundWaves-only in TutorialV2; SUBCAPTION
//  is a shared className string — it stays in TutorialV2 and is duplicated here,
//  since a className constant cannot be "shared" across a module boundary
//  without an import that would couple the two files for a bare string.)
const BAR_COLORS = ["#B23A1A", "#D95F38", "#F2A02C", "#D95F38", "#B23A1A"] as const;
const BAR_MIN = 10 / 34;
const SUBCAPTION = "text-[18px] font-semibold text-softgrey font-hindi leading-relaxed";

function SoundWaves() {
  const reduced = useReduced();
  return (
    <span className="flex items-end gap-1.5 h-10" aria-hidden="true">
      {BAR_COLORS.map((hex, i) => (
        <motion.span
          key={i}
          className="w-[7px] rounded-[4px] origin-bottom"
          style={{ height: 34, backgroundColor: hex }}
          initial={{ scaleY: reduced ? 0.7 : BAR_MIN }}
          animate={reduced ? { scaleY: 0.7 } : { scaleY: [BAR_MIN, 1, BAR_MIN] }}
          transition={reduced ? undefined : { duration: 1, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

export interface MicPracticeArtboardProps {
  /** registry shape (getArtboard passes it); the mic logic ignores it */
  slide?: DeckSlide;
  /** registry shape; the component reads prefers-reduced-motion via useReduced() */
  reduced?: boolean;
  /** permission granted (localStorage flag already written) — parent may record progress */
  onGranted?: () => void;
  /** permission denied at the browser level — parent may record / branch */
  onDenied?: () => void;
  /** true while asking|listening — parent gates its manual Next; released on unmount */
  onBusy?: (busy: boolean) => void;
  /** practice complete — DeckPlayer advances; TutorialV2 opens its Next gate */
  onDone?: () => void;
}

export function MicPracticeArtboard({ onGranted, onDenied, onBusy, onDone }: MicPracticeArtboardProps) {
  // Ruling #6: the आवाज़ demo respects reduced-motion like the scenes do.
  const reduced = useReduced();
  // आवाज़ slide: spotlight the listening pill when it appears.
  const pillRef = useRef<HTMLDivElement | null>(null);

  // ── आवाज़ slide: mic permission + practice ─────────────────
  const [micState, setMicState] = useState<"idle" | "asking" | "listening" | "done" | "denied">("idle");
  // Browser-level permission state (permissions.query where available):
  // 'granted' → no prompt will show, straight to practice; 'denied' →
  // recovery copy + retry; 'prompt'/'unknown' → the tap fires the prompt.
  // Z2 U4 LAW: परिचय is the ONE mic-prompt moment. Seed micPerm
  // SYNCHRONOUSLY from the stored grant so the आवाज़ slide never flashes
  // the ask-button (and never re-prompts) for a pandit who already
  // granted; the async permissions.query below only corrects a genuine
  // mismatch.
  const [micPerm, setMicPerm] = useState<"granted" | "denied" | "prompt" | "unknown">(() => {
    try {
      return localStorage.getItem("mic_permission_granted") === "true" ? "granted" : "unknown";
    } catch {
      return "unknown";
    }
  });
  const voiceInput = useVoiceInput();
  useEffect(() => {
    // परिचय already earned the mic for most users — the stored flag is an
    // instant hint (the query corrects it if the browser disagrees).
    try {
      if (localStorage.getItem("mic_permission_granted") === "true") setMicPerm("granted");
    } catch { /* noop */ }
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
      .catch(() => { /* keep the flag hint */ });
    return () => {
      disposed = true;
      if (status) status.onchange = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [pointerUp, setPointerUp] = useState(false);
  const askMic = () => {
    // Z2 U4 LAW: if permission is already granted (store flag OR live
    // query state), NEVER invoke a prompt again — go straight to practice
    // on the existing grant. This makes the tutorial physically incapable
    // of re-asking, even if the button is somehow shown.
    if (micPerm === "granted") {
      setMicState("listening");
      void voiceInput.start();
      return;
    }
    if (voiceController.e2e) {
      // E2E traversal: no native prompts; practice resolves immediately
      voiceController.debug("e2e: tutorial-mic bypassed");
      setMicState("done");
      return;
    }
    // LADDER LAW (same as परिचय): getUserMedia is ALWAYS attempted first,
    // created synchronously inside the user-gesture call stack — never
    // pre-blocked on permissions.query alone. Recovery copy appears only
    // after a rejection that the query CONFIRMS as browser-level denied.
    const streamPromise = navigator.mediaDevices.getUserMedia({ audio: true });
    voiceController.debug("perm: getUserMedia invoked (tutorial mic)");
    setPointerUp(true);
    setMicState("asking");
    voiceController.speak(t("perm.pressAllowVoice"));
    void streamPromise
      .then(async (stream) => {
        setPointerUp(false);
        voiceController.debug("perm: settled(granted) (tutorial mic)");
        voiceController.stopSpeech("tutorial-mic:grant-settle");
        localStorage.setItem("mic_permission_granted", "true");
        setMicPerm("granted");
        onGranted?.();
        setMicState("listening");
        // one practice listen on the SAME granted stream — never a second
        // getUserMedia for this gesture
        await voiceInput.start({ stream });
      })
      .catch(async (e: unknown) => {
        setPointerUp(false);
        const name = (e as Error)?.name || "";
        let state: string = "unsupported";
        if (name !== "NotFoundError") {
          try {
            const st = await navigator.permissions.query({ name: "microphone" as PermissionName });
            state = st.state;
          } catch { /* query unsupported -> treat as dismissed */ }
        }
        if (name === "NotFoundError" || state === "denied") {
          voiceController.debug("perm: settled(denied) (tutorial mic)");
          localStorage.setItem("mic_permission_granted", "false");
          setMicPerm("denied");
          setMicState("denied");
          onDenied?.();
          voiceController.speak(t("tutorial.slide5Denied"));
        } else {
          // popup dismissed — keep the button alive, no deny flags
          voiceController.debug("perm: settled(dismissed) (tutorial mic)");
          setMicState("idle");
          voiceController.speak(t("parichay.dismissed"));
        }
      });
  };

  // Practice resolution: the listen machinery finishing (with or without
  // a transcript — the point is that the mic worked) completes the drill.
  useEffect(() => {
    if (micState !== "listening") return;
    if (voiceInput.state === "idle" && voiceInput.transcript !== null) {
      setMicState("done");
      voiceController.speak(t("tutorial.slide5Practice"));
    } else if (voiceInput.state === "error") {
      setMicState("done");
      voiceController.speak(t("tutorial.slide5Practice"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micState, voiceInput.state, voiceInput.transcript]);

  // Unmount (leaving the आवाज़ slide mid-practice): stop the recorder so a
  // late result can't speak or celebrate over a later slide. In TutorialV2
  // this was the `if (isMic) return; voiceInput.reset()` leave-effect; the
  // component now unmounts on leave, so it is an unmount cleanup.
  useEffect(() => {
    return () => {
      voiceInput.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Celebration + onDone on completion. (TutorialV2's `micState === "done" &&
  // isMic` — the `&& isMic` is dropped: this component is unconditionally mic.)
  const [burst, setBurst] = useState(false);
  useEffect(() => {
    if (micState === "done") {
      setBurst(true);
      playChime();
      onDone?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micState]);

  // onBusy — derived from micState so it fires on EVERY transition; the parent
  // gates its manual Next while the mic is mid-flight (asking|listening).
  useEffect(() => {
    onBusy?.(micState === "asking" || micState === "listening");
  }, [micState, onBusy]);
  // …and ALWAYS release the gate on unmount, so no path can leave it stuck true.
  useEffect(() => {
    return () => onBusy?.(false);
  }, [onBusy]);

  return (
    // आवाज़ — canon 7: शिष्य orb, the five voice bars, and the 78px sindoor mic
    // disc. The disc IS the tap target for the permission ladder / practice
    // (78px ≫ the 52px floor).
    <div className="w-full flex flex-col items-center gap-4">
      {/* canon 5d: the REAL Shishya, listening, size 82 */}
      <ShishyaOrb size={82} showLabel={false} demoState="listening" />
      {micState === "denied" ? (
        <div className="w-full max-w-[300px] flex flex-col items-center gap-3">
          <span className={SUBCAPTION}>{t("tutorial.slide5Denied")}</span>
          <span className="text-[18px] font-bold text-saffron-700 font-hindi">{t("tutorial.slide5Blocked")}</span>
          <Button variant="secondary" size="md" fullWidth onClick={askMic}>
            {t("tutorial.slide5Retry")}
          </Button>
        </div>
      ) : micState === "listening" ? (
        <>
          <SoundWaves />
          <div ref={pillRef}>
            <span className="bg-gold/15 border border-gold text-saffron-700 text-[18px] font-semibold font-hindi rounded-chip px-4 py-2">
              {t("pratham.practiceListening")}
            </span>
          </div>
          <CoachSpotlight
            targetRef={pillRef}
            title={t("tutorial.slide5Title")}
            line={t("pratham.practiceSay")}
            requireInteraction
            onDone={() => { /* resolves when the listen completes */ }}
          />
        </>
      ) : micState === "done" ? (
        <span className="text-[20px] font-bold text-leaf-700 font-hindi">✓ {t("tutorial.slide5Practice")}</span>
      ) : (
        // Ruling #6 DEMONSTRATION over the REAL mic button: sound
        // arcs rise from the mic → the spoken word "नमस्ते" lands in
        // the field → a tick confirms it was understood. Teaches
        // "बोलिए, app सुनता है" with zero written explanation. The
        // button still fires the real getUserMedia ladder on tap.
        <>
          <div className="relative flex flex-col items-center">
            {/* sound arcs travelling up from the mic toward शिष्य */}
            {!reduced && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[30px] h-[46px] pointer-events-none" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="pa-a-wave absolute left-1/2 bottom-0 -ml-[4px] w-[8px] h-[8px] rounded-full bg-saffron-400"
                    style={{ animationDelay: `${i * 0.5}s` }}
                  />
                ))}
              </div>
            )}
            <button
              onClick={askMic}
              disabled={micState === "asking"}
              aria-label={micPerm === "granted" ? t("tutorial.slide5Again") : t("tutorial.slide5Button")}
              className="relative w-[78px] h-[78px] rounded-full bg-saffron-500 shadow-btn-hero flex items-center justify-center active:scale-95 transition-transform disabled:opacity-70"
            >
              {/* canon's g-glowring, as a transform/opacity ring */}
              <motion.span
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ border: "2px solid rgba(231,181,74,.55)" }}
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: [1, 1.36], opacity: [0.55, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden="true"
              />
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="9" y="2.5" width="6" height="11" rx="3" fill="#FFF6E9" />
                <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" stroke="#FFF6E9" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <span className="text-[18px] font-semibold text-softgrey font-hindi">
            {micPerm === "granted" ? t("tutorial.slide5Again") : t("tutorial.slide5Button")}
          </span>
          {/* the spoken word lands in the field → tick (the teaching) */}
          <div className="relative w-[190px] h-[46px] rounded-field border-2 border-saffron-200 bg-card flex items-center justify-center" aria-hidden="true">
            <span className="pa-a-chip text-[19px] font-bold text-temple-700 font-hindi">नमस्ते</span>
            <span className="pa-a-tick absolute right-2.5 material-symbols-outlined material-symbols-filled text-[22px] text-leaf-500 leading-none">
              check_circle
            </span>
          </div>
        </>
      )}
      {/* celebration on practice-complete (moved in with the machinery) */}
      {burst && <PetalBurst onEnd={() => setBurst(false)} />}
      {/* arrow + chip pointing at the NATIVE permission popup (fixed inset-0,
          so its DOM location here is cosmetically identical to TutorialV2) */}
      {pointerUp && <PopupPointer />}
    </div>
  );
}

export default MicPracticeArtboard;
