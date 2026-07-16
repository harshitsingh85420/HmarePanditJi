"use client";

// ─────────────────────────────────────────────────────────────
// Tutorial — the 6-scene "boring fix" deck on the existing
// TutorialShell. Emotional-hook order (founder): कमाई → नई बुकिंग →
// आवाज़ → सो जाओ/जागो → सत्यापन → स्वागत/शुरू करें. Each scene shows AT
// MOST a short phrase (≤10 words); शिष्य's spoken narration carries the
// explanation. Motion is transform/opacity only via lib/motion (A12 /
// 6×-throttle safe, prefers-reduced-motion static fallbacks).
//
// IDENTITY LAW (Option A): the interactive behavior — आवाज़ mic practice,
// सो जाओ/जागो mute gate, नई बुकिंग temple bell, स्वागत register CTA — is
// keyed by an IDENTITY MARKER on the slide (SlideDef.interactive / .role),
// NEVER by the slide's index. Position-keyed behavior silently breaks on
// any reorder; identity markers let the deck be resequenced freely. Guard
// tutorialIdentity.test.ts fails the build if an interactive check ever
// regresses to a slide index.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import TutorialShell from "./screens/tutorial/TutorialShell";
import { t } from "@/lib/i18n";
import { useScreenVoice } from "@/hooks/useScreenVoice";
import { useVoiceCommands } from "@/hooks/useVoiceScreen";
import { YES, NEXT, BACK, SKIP } from "@/lib/voiceGrammar";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { voiceController } from "@/lib/voiceController";
import { playBell, playChime } from "@/lib/sounds";
import { SlideCanvas, accentFor, PetalBurst } from "@/components/moments/SlideCanvas";
import { PopupPointer } from "@/components/moments/PopupPointer";
import { MoneyCount } from "@/components/moments/MoneyCount";
import { Button } from "@/components/ui/Button";
import { CoachSpotlight } from "@/components/moments/CoachSpotlight";
import { useReduced, still, cardSlideIn, stampIn, breathe, DURATION, EASE } from "@/lib/motion";

// Slide count lives in lib/onboarding-store so light pages (login back
// law) can target the CTA slide without bundling the tutorial chunk.
import { TUTORIAL_TOTAL } from "@/lib/onboarding-store";
export { TUTORIAL_TOTAL };

type Accent = { hex: string; textHex: string };
type VisualFn = (accent: Accent) => React.ReactNode;

interface SlideDef {
  title: string;
  narration: string;
  visual: VisualFn | null;
  // IDENTITY markers — interactive behavior/one-shots follow the slide,
  // never its position. See IDENTITY LAW above.
  interactive?: "mic" | "mute";
  role?: "bell" | "cta";
}

// ── The 6 animated scenes ────────────────────────────────────
// Each is a real component (so useReduced()/motion hooks work); the
// VisualFn wrapper just instantiates it with the slide's accent.

// कमाई — mockup 5(1/6): coins settle into the thali, ONE count-up, ONE label.
function SceneKamai() {
  const reduced = useReduced();
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-end gap-1 h-8" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="text-[24px] leading-none"
            initial={reduced ? false : { opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.base, ease: EASE.out, delay: reduced ? 0 : 0.12 * i }}
          >
            🪙
          </motion.span>
        ))}
      </div>
      <span className="text-[40px] leading-none select-none" aria-hidden="true">🪔</span>
      {/* the money moment — MoneyCount handles reduced-motion internally */}
      <MoneyCount target={63000} durationMs={1400} className="text-[44px] font-black text-leaf-700" />
      <span className="text-[18px] font-extrabold text-temple-600 font-hindi">आपकी कमाई</span>
    </div>
  );
}

// नई बुकिंग — the temple bell (rung once via role:"bell") + the request
// card sliding in with the full, honest money breakdown.
function SceneBooking({ accent }: { accent: Accent }) {
  const reduced = useReduced();
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="pa-bell-swing text-[56px] leading-none select-none" aria-hidden="true">🔔</span>
      <motion.div
        className="w-full max-w-[280px] bg-white rounded-card border border-saffron-100 p-4 flex flex-col gap-1.5"
        variants={reduced ? still(cardSlideIn) : cardSlideIn}
        initial="hidden"
        animate="show"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="t-body font-black text-ink font-hindi">गृह प्रवेश पूजा</span>
          <span className="text-[12px] font-extrabold text-leaf-700 bg-[#D6EEDE] px-2.5 py-1 rounded-full font-hindi">नई</span>
        </div>
        <span className="text-[20px] font-bold font-hindi" style={{ color: accent.textHex }}>दक्षिणा ₹5,600</span>
      </motion.div>
    </div>
  );
}

// आवाज़ — the listening indicator: five bars breathing (scaleY only).
// Interactive mic wiring lives in the render's `isMic` branch, not here.
function SoundWaves() {
  const reduced = useReduced();
  if (reduced) {
    return (
      <span className="flex gap-1 h-6 items-center" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="w-1.5 h-3 rounded-full bg-gold" />
        ))}
      </span>
    );
  }
  const peaks = [0.4, 0.7, 1, 0.7, 0.4];
  return (
    <span className="flex gap-1 h-6 items-center" aria-hidden="true">
      {peaks.map((p, i) => (
        <motion.span
          key={i}
          className="w-1.5 rounded-full bg-gold origin-center"
          style={{ height: 22 }}
          animate={{ scaleY: [p, 1, p] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
        />
      ))}
    </span>
  );
}

// सो जाओ/जागो — शिष्य's orb dims to sleep (💤) and wakes, on a gentle
// loop. The REAL interaction (tap the footer orb to mute/unmute) is the
// CoachSpotlight gate in the render; this is the illustration of it.
function SceneSleep({ accent }: { accent: Accent }) {
  const reduced = useReduced();
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[96px] h-[96px] flex items-center justify-center">
        <motion.span
          className="text-[72px] leading-none select-none"
          aria-hidden="true"
          animate={reduced ? undefined : { opacity: [1, 0.35, 1], scale: [1, 0.94, 1] }}
          transition={reduced ? undefined : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🙏
        </motion.span>
        {!reduced && (
          <motion.span
            className="absolute -top-1 right-0 text-[26px]"
            aria-hidden="true"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            💤
          </motion.span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full px-3 py-1 text-[15px] font-bold font-hindi bg-white border border-saffron-100 text-softgrey">😴 सो जाओ</span>
        <span className="rounded-full px-3 py-1 text-[15px] font-bold font-hindi text-white" style={{ backgroundColor: accent.hex }}>☀️ जागो</span>
      </div>
    </div>
  );
}

// सत्यापन — the ✓ badge lands like a stamp (scale overshoot + fade).
function SceneVerify({ accent }: { accent: Accent }) {
  const reduced = useReduced();
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[56px] leading-none" aria-hidden="true">🪪</span>
      <motion.span
        className="rounded-full px-5 py-2 text-[18px] font-bold text-white font-hindi"
        style={{ backgroundColor: accent.hex }}
        variants={reduced ? still(stampIn) : stampIn}
        initial="hidden"
        animate="show"
      >
        ✓ प्रमाणित
      </motion.span>
    </div>
  );
}

// स्वागत — शिष्य's orb breathing, a warm close before the register CTA.
function SceneWelcome() {
  const reduced = useReduced();
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.span
        className="text-[84px] leading-none select-none"
        aria-hidden="true"
        variants={reduced ? still(breathe) : breathe}
        initial={false}
        animate="show"
      >
        🙏
      </motion.span>
      {/* mockup 5(6/6): the closing phrase */}
      <span className="text-[20px] font-black text-temple-600 font-hindi">अब आपकी बारी! 🎉</span>
    </div>
  );
}

// ── The deck — कमाई-first emotional order. Narrations VERBATIM from
// strings.tutorial (spoken explanation); on-screen text stays ≤10 words.
function slideDefs(): SlideDef[] {
  return [
    { title: t("tutorial.slide2Title"), narration: t("tutorial.slide2"), visual: () => <SceneKamai /> },
    { title: t("tutorial.slide6Title"), narration: t("tutorial.slide6"), visual: (a) => <SceneBooking accent={a} />, role: "bell" },
    { title: t("tutorial.slide5Title"), narration: t("tutorial.slide5"), visual: null, interactive: "mic" },
    { title: t("tutorial.slide3Title"), narration: t("tutorial.slide3"), visual: (a) => <SceneSleep accent={a} />, interactive: "mute" },
    { title: t("tutorial.slide12Title"), narration: t("tutorial.slide12"), visual: (a) => <SceneVerify accent={a} /> },
    { title: t("tutorial.slide14Title"), narration: `${t("tutorial.slide14")} ${t("tutorial.rewatchNote")}`, visual: () => <SceneWelcome />, role: "cta" },
  ];
}

export interface TutorialV2Props {
  slide: number; // 1-based
  onSlideChange: (n: number) => void;
  onRegister: () => void;
  onLater: () => void;
  onMicDenied: () => void;
  onMicGranted: () => void;
}

export default function TutorialV2({
  slide,
  onSlideChange,
  onRegister,
  onLater,
  onMicDenied,
  onMicGranted,
}: TutorialV2Props) {
  const defs = slideDefs();
  const idx = Math.min(TUTORIAL_TOTAL, Math.max(1, slide)) - 1;
  const def = defs[idx];

  // IDENTITY markers (never positions) — every interactive check keys off
  // these, so the deck can be reordered without touching a line below.
  const isMic = def.interactive === "mic";
  const isMute = def.interactive === "mute";
  const isBell = def.role === "bell";
  const isCta = def.role === "cta";

  // सो जाओ slide: spotlight target = the REAL शिष्य orb in the footer.
  // Held in state (not just a ref) so finding it triggers the render that
  // actually mounts the spotlight.
  const fabRef = useRef<HTMLElement | null>(null);
  const [fabEl, setFabEl] = useState<HTMLElement | null>(null);
  // आवाज़ slide: spotlight the listening pill when it appears.
  const pillRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = document.querySelector('[aria-label*="शिष्य"]') as HTMLElement | null;
    fabRef.current = el;
    setFabEl(el);
  }, [idx]);

  // J2: every slide ends by INVITING the voice answer. सो जाओ/जागो is the
  // exception — asking "हाँ बोलिए" while Next is gate-locked would be a
  // lie, so its ask is spoken the moment the gate opens instead.
  const advanceAsk = t("tutorial.advanceAsk");
  const narrationFor = (i: number) =>
    defs[i]?.interactive === "mute" ? defs[i].narration : `${defs[i].narration} ${advanceAsk}`;

  // S3: on the CTA slide the narration asks "शुरू करें?" — the primary
  // registration button glows for the line.
  const ctaBtnRef = useRef<HTMLDivElement | null>(null);
  useScreenVoice(narrationFor(idx), {
    highlightRef: isCta ? ctaBtnRef : undefined,
  });

  // D3c: warm the NEXT slide's narration while this one plays
  useEffect(() => {
    if (idx + 1 < defs.length) voiceController.prefetch([narrationFor(idx + 1)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // ── सो जाओ/जागो gate: one mute→unmute cycle OR 10s timeout ─────
  const muted = useSyncExternalStore(
    voiceController.subscribe,
    () => voiceController.muted,
    () => false,
  );
  const [sawMute, setSawMute] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  useEffect(() => {
    if (!isMute) return;
    setSawMute(false);
    setGateOpen(false);
    const timer = setTimeout(() => {
      setGateOpen(true);
      // gate opened by timeout — NOW the voice invitation is honest
      voiceController.speak(advanceAsk);
    }, 10000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);
  const [burst, setBurst] = useState(false);
  useEffect(() => {
    if (!isMute) return;
    if (muted) setSawMute(true);
    else if (sawMute && !gateOpen) {
      // completed mute → unmute cycle — celebrate!
      setGateOpen(true);
      setBurst(true);
      playChime();
      voiceController.speak(advanceAsk);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted, sawMute, gateOpen, idx]);

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
    if (!isMic) return;
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
  }, [idx]);

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
        onMicGranted();
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
          onMicDenied();
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
    if (!isMic || micState !== "listening") return;
    if (voiceInput.state === "idle" && voiceInput.transcript !== null) {
      setMicState("done");
      voiceController.speak(t("tutorial.slide5Practice"));
    } else if (voiceInput.state === "error") {
      setMicState("done");
      voiceController.speak(t("tutorial.slide5Practice"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, micState, voiceInput.state, voiceInput.transcript]);

  // Leaving the आवाज़ slide mid-practice: stop the recorder so a late
  // result can't speak or celebrate over a later slide.
  useEffect(() => {
    if (isMic) return;
    voiceInput.reset();
    setMicState((m) => (m === "listening" || m === "asking" ? "idle" : m));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);
  useEffect(() => {
    if (micState === "done" && isMic) {
      setBurst(true);
      playChime();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micState, idx]);
  useEffect(() => {
    setBurst(false);
  }, [idx]);

  // ── नई बुकिंग slide: temple bell once on mount ─────────────
  const rangRef = useRef(false);
  useEffect(() => {
    if (isBell && !rangRef.current) {
      rangRef.current = true;
      playBell();
    }
    if (!isBell) rangRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // ── CTA slide ───────────────────────────────────────────────
  const [stay, setStay] = useState(false);

  const goNext = () => onSlideChange(Math.min(TUTORIAL_TOTAL, slide + 1));
  const goBack = () => onSlideChange(Math.max(1, slide - 1));
  const skipToCta = () => onSlideChange(TUTORIAL_TOTAL);

  const nextDisabled = isMute && !gateOpen;

  // J2: the whole tutorial answers by voice. हाँ/आगे advance (the सो जाओ
  // gate refuses politely; the आवाज़ popup/practice moment stays quiet —
  // a spoken हाँ there is aimed at the mic, not the slide). छोड़ो jumps to
  // the CTA, पीछे retreats. On the CTA slide हाँ/शुरू/रजिस्ट्रेशन register
  // and बाद-में/छोड़ो defer. फिर-से/मदद/सो-जाओ come from the global grammar.
  useVoiceCommands([
    {
      keywords: [...YES, ...NEXT, "रजिस्ट्रेशन", "रजिस्टर", "registration", "शुरू", "start"],
      action: () => {
        if (isCta) return onRegister();
        if (isMic && (micState === "asking" || micState === "listening")) return;
        if (nextDisabled) {
          voiceController.speak(t("coach.tryIt"));
          return;
        }
        goNext();
      },
    },
    {
      keywords: [...SKIP, "बाद में", "baad mein", "later"],
      action: () => {
        if (isCta) {
          setStay(true);
          onLater();
        } else {
          skipToCta();
        }
      },
    },
    {
      keywords: BACK,
      action: () => {
        if (slide <= 1) voiceController.speakUnmatchedGently();
        else goBack();
      },
    },
  ], t("help.tutorial"));

  if (isCta) {
    return (
      <TutorialShell
        currentDot={TUTORIAL_TOTAL}
        totalDots={TUTORIAL_TOTAL}
        onSkip={skipToCta}
        onBack={goBack}
        onNext={onRegister}
        nextLabel={t("tutorial.registerNow")}
        nextBtnRef={ctaBtnRef}
        accentHex={accentFor(idx).hex}
      >
        <div className="flex flex-col items-center gap-4 px-2 text-center">
          <SlideCanvas accentIndex={idx}>{def.visual?.(accentFor(idx))}</SlideCanvas>
          <h2 className="t-title font-bold text-temple-600 font-hindi">{def.title}</h2>
          <p className="t-body text-ink font-hindi leading-relaxed">{def.narration}</p>
          {stay ? (
            <p className="t-body text-softgrey font-hindi">{t("tutorial.laterLine")}</p>
          ) : (
            <Button variant="ghost" size="md" onClick={() => { setStay(true); onLater(); }}>
              {t("tutorial.later")}
            </Button>
          )}
        </div>
      </TutorialShell>
    );
  }

  return (
    <TutorialShell
      currentDot={slide}
      totalDots={TUTORIAL_TOTAL}
      onSkip={skipToCta}
      onBack={idx === 0 ? undefined : goBack}
      onNext={nextDisabled ? () => { } : goNext}
      nextLabel={nextDisabled ? `⏳ ${t("coach.tryIt")}` : t("tutorial.next")}
      nextDisabled={nextDisabled}
      accentHex={accentFor(idx).hex}
    >
      <div className="flex flex-col items-center gap-3 px-2 text-center">
        {/* Visual zone: the festive slide canvas (accent rotates idx % 5) */}
        <div className="relative w-full shrink-0">
          <SlideCanvas accentIndex={idx}>
            {isMic ? (
              <div className="w-full max-w-[300px] flex flex-col items-center gap-3 bg-white rounded-card border border-saffron-100 p-5">
                <span className="text-[64px]" aria-hidden="true">🗣️</span>
                {micState === "denied" ? (
                  // Browser-level DENY (confirmed AFTER an attempt): show
                  // the site-settings recovery copy and a retry that goes
                  // straight to getUserMedia inside the tap.
                  <>
                    <span className="t-body text-softgrey font-hindi text-center">{t("tutorial.slide5Denied")}</span>
                    <span className="t-body font-bold text-temple-600 font-hindi text-center">{t("tutorial.slide5Blocked")}</span>
                    <Button variant="secondary" size="md" fullWidth onClick={askMic}>
                      {t("tutorial.slide5Retry")}
                    </Button>
                  </>
                ) : micState === "idle" || micState === "asking" ? (
                  micPerm === "granted" ? (
                    // Permission already earned at परिचय — pure practice,
                    // no duplicate prompt anywhere.
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={() => {
                        setMicState("listening");
                        void voiceInput.start();
                      }}
                    >
                      {t("tutorial.slide5Again")}
                    </Button>
                  ) : (
                    <Button variant="primary" size="md" fullWidth onClick={askMic} loading={micState === "asking"}>
                      {t("tutorial.slide5Button")}
                    </Button>
                  )
                ) : micState === "listening" ? (
                  <>
                    <SoundWaves />
                    <div ref={pillRef}>
                      <span className="bg-gold/15 border border-gold text-temple-600 text-[18px] font-semibold font-hindi rounded-full px-4 py-2">
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
                ) : (
                  <span className="text-[20px] font-bold text-leaf-700 font-hindi">✓ {t("tutorial.slide5Practice")}</span>
                )}
              </div>
            ) : (
              def.visual?.(accentFor(idx))
            )}
          </SlideCanvas>
          {burst && <PetalBurst onEnd={() => setBurst(false)} />}
        </div>
        <h2 className="t-title font-bold text-temple-600 font-hindi">{def.title}</h2>
        <p className="t-body text-ink font-hindi leading-relaxed">{def.narration}</p>

        {/* Arrow + chip pointing at the NATIVE permission popup (आवाज़) */}
        {pointerUp && <PopupPointer />}

        {/* सो जाओ/जागो: spotlight the REAL शिष्य orb; gate opens on the cycle */}
        {isMute && !gateOpen && fabEl && (
          <CoachSpotlight
            targetRef={fabRef}
            title={t("tutorial.slide3Title")}
            line={t("tutorial.slide3")}
            requireInteraction
            onDone={() => { /* gate opens via the mute→unmute subscription */ }}
          />
        )}
      </div>
    </TutorialShell>
  );
}
