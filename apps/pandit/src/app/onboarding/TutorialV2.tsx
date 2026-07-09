"use client";

// ─────────────────────────────────────────────────────────────
// Tutorial v3 — the 16-slide script on the existing TutorialShell.
// Narrations VERBATIM from strings.tutorial. Interactive: slide 3
// (CoachSpotlight on the REAL शिष्य orb, requires a sleep→wake
// cycle), slide 5 (mic permission + practice; spotlight on the
// listening pill), slide 6 (temple bell once), slide 9 (home-tour demo
// frame with 3 spotlight steps), slide 14 (मेरी पूजाएँ demo frame).
// Demo frames reuse REAL components in a scaled pointer-events-none
// container — no screenshots. Layout grammar: visual zone flex-1
// min-h-0, narration max-h-[30%] overflow-y-auto, controls in footer.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
import { Card } from "@/components/ui/Card";

// Slide count lives in lib/onboarding-store so light pages (login back
// law) can target the CTA slide without bundling the tutorial chunk.
import { TUTORIAL_TOTAL } from "@/lib/onboarding-store";
export { TUTORIAL_TOTAL };

interface SlideDef {
  title: string;
  narration: string;
  visual: VisualFn | null;
}

// ── Visuals — BIG flat emoji compositions (≥64px) on the slide's
// festive canvas; ONE key number/label per slide at full accent
// strength (slide 2's money stays on tulsi per spec). ────────────
type VisualFn = (accent: { hex: string; textHex: string }) => React.ReactNode;

const V: Record<string, VisualFn> = {
  s1: () => (
    <>
      <span className="text-[88px] leading-none select-none" aria-hidden="true">🙏</span>
      <span className="text-[22px] font-bold text-temple-600 font-hindi">{t("shishya.name")}</span>
    </>
  ),
  s2: () => (
    <>
      <div className="flex flex-col items-center">
        <span className="t-hint text-softgrey font-hindi">पहले</span>
        <span className="text-[24px] font-bold text-softgrey line-through">₹18,000</span>
      </div>
      <span className="text-[36px] leading-none" aria-hidden="true">⬇️</span>
      <div className="flex flex-col items-center">
        <span className="t-hint text-leaf-700 font-hindi font-bold">अब</span>
        {/* the money moment — animated count-up on tulsi */}
        <MoneyCount target={63000} durationMs={1400} className="text-[44px] font-bold text-leaf-700" />
      </div>
    </>
  ),
  s3: (a) => (
    <>
      <span className="text-[64px] leading-none animate-bounce select-none" aria-hidden="true">⬇️</span>
      <span className="text-[20px] font-bold font-hindi" style={{ color: a.textHex }}>नीचे — शिष्य</span>
    </>
  ),
  s4: () => (
    <>
      <div className="flex items-center gap-4">
        <span className="text-[64px]" aria-hidden="true">🗣️</span>
        <span className="text-[28px] text-softgrey" aria-hidden="true">+</span>
        <span className="text-[64px]" aria-hidden="true">⌨️</span>
      </div>
      <span className="text-[28px]" aria-hidden="true">↓</span>
      <div className="w-full max-w-[260px] min-h-[56px] border-2 border-saffron-200 rounded-btn bg-white flex items-center px-4 text-softgrey text-[18px]">
        एक ही खाना…
      </div>
    </>
  ),
  s6: (a) => (
    <>
      <span className="pa-bell-swing text-[64px] leading-none select-none" aria-hidden="true">🔔</span>
      <div className="w-full max-w-[280px] bg-white rounded-card border border-saffron-100 p-4 flex flex-col gap-2">
        <span className="t-body font-bold text-ink font-hindi">{t("booking.newRequest")}</span>
        <span className="text-[20px] font-bold font-hindi" style={{ color: a.textHex }}>दक्षिणा ₹11,000</span>
        <span className="t-hint text-softgrey font-hindi">यात्रा ₹800 · भोजन ₹500</span>
      </div>
    </>
  ),
  s7: (a) => (
    <div className="flex flex-col gap-2 w-full max-w-[280px]">
      {["स्वीकार करें", "घर से निकले", "पहुँच गया", "🙏 पूजा संपन्न"].map((step, i) => (
        <div key={step} className="flex items-center gap-3">
          <span
            className="w-9 h-9 rounded-full text-white text-[17px] font-bold flex items-center justify-center"
            style={{ backgroundColor: a.hex }}
          >
            {i + 1}
          </span>
          <span className="t-body font-semibold text-ink font-hindi">{step}</span>
        </div>
      ))}
    </div>
  ),
  s8: (a) => (
    <>
      <div className="flex items-center gap-3">
        <span className="text-[64px]" aria-hidden="true">🙏</span>
        <span className="text-[24px]" aria-hidden="true">→</span>
        <span className="text-[64px]" aria-hidden="true">⏱️</span>
        <span className="text-[24px]" aria-hidden="true">→</span>
        <span className="text-[64px]" aria-hidden="true">🏦</span>
      </div>
      <span className="text-[26px] font-bold font-hindi" style={{ color: a.textHex }}>24 घंटे</span>
    </>
  ),
  s9: (a) => (
    <>
      <span className="text-[72px]" aria-hidden="true">🛍️</span>
      <span className="text-[30px] font-bold" style={{ color: a.textHex }}>₹2,100</span>
    </>
  ),
  s10: () => (
    <div className="grid grid-cols-7 gap-1 w-full max-w-[260px] py-2">
      {Array.from({ length: 21 }, (_, i) => (
        <span key={i} className={`h-8 rounded flex items-center justify-center text-[14px] ${i === 9 ? "bg-red-100 text-danger font-bold" : "bg-white border border-saffron-100 text-softgrey"}`}>
          {i === 9 ? "✖" : i + 1}
        </span>
      ))}
    </div>
  ),
  s11: () => (
    <div className="grid grid-cols-2 gap-3 w-full max-w-[300px]">
      {["🪙 दक्षिणा आपकी", "⏱️ पैसा 24 घंटे", "🚆 यात्रा हमारी", "📞 मदद एक फ़ोन पर"].map((b) => (
        <div key={b} className="bg-white border border-gold rounded-card px-3 py-3 text-center t-hint font-bold text-temple-600 font-hindi">
          {b}
        </div>
      ))}
    </div>
  ),
  s12: (a) => (
    <>
      <span className="text-[64px]" aria-hidden="true">🪪</span>
      <span
        className="rounded-full px-4 py-2 text-[18px] font-bold text-white font-hindi"
        style={{ backgroundColor: a.hex }}
      >
        ✓ प्रमाणित
      </span>
    </>
  ),
  s13: () => (
    <>
      <span className="text-[64px]" aria-hidden="true">📞</span>
      <span className="t-body font-bold text-ink font-hindi text-center">सीधे बात कीजिए — टीम आपके साथ है</span>
    </>
  ),
  s14: () => (
    <span className="text-[88px] leading-none select-none" aria-hidden="true">🎉</span>
  ),
};

function slideDefs(): SlideDef[] {
  return [
    { title: t("tutorial.slide1Title"), narration: t("tutorial.slide1"), visual: V.s1 },
    { title: t("tutorial.slide2Title"), narration: t("tutorial.slide2"), visual: V.s2 },
    { title: t("tutorial.slide3Title"), narration: t("tutorial.slide3"), visual: V.s3 },
    { title: t("tutorial.slide4Title"), narration: t("tutorial.slide4"), visual: V.s4 },
    { title: t("tutorial.slide5Title"), narration: t("tutorial.slide5"), visual: null },
    { title: t("tutorial.slide6Title"), narration: t("tutorial.slide6"), visual: V.s6 },
    { title: t("tutorial.slide7Title"), narration: t("tutorial.slide7"), visual: V.s7 },
    { title: t("tutorial.slide8Title"), narration: t("tutorial.slide8"), visual: V.s8 },
    { title: t("tutorial.slideHomeTourTitle"), narration: t("tutorial.slideHomeTour"), visual: null }, // 9: demo frame
    { title: t("tutorial.slide9Title"), narration: t("tutorial.slide9"), visual: V.s9 },
    { title: t("tutorial.slide10Title"), narration: t("tutorial.slide10"), visual: V.s10 },
    { title: t("tutorial.slide11Title"), narration: t("tutorial.slide11"), visual: V.s11 },
    { title: t("tutorial.slide12Title"), narration: t("tutorial.slide12"), visual: V.s12 },
    { title: t("tutorial.slidePoojasTitle"), narration: t("tutorial.slidePoojas"), visual: null }, // 14: demo frame
    { title: t("tutorial.slide13Title"), narration: t("tutorial.slide13"), visual: V.s13 },
    { title: t("tutorial.slide14Title"), narration: `${t("tutorial.slide14")} ${t("tutorial.rewatchNote")}`, visual: V.s14 },
  ];
}


// ── Demo frames: REAL components, scaled, pointer-events-none ─
function MiniHomeDemo({
  step,
  refs,
}: {
  step: number;
  refs: [React.MutableRefObject<HTMLDivElement | null>, React.MutableRefObject<HTMLDivElement | null>, React.MutableRefObject<HTMLDivElement | null>];
}) {
  void step;
  return (
    <div aria-hidden="true" className="pointer-events-none select-none origin-top scale-[0.82] w-full max-w-[360px] mx-auto flex flex-col gap-3 bg-cream rounded-card border border-saffron-100 p-3">
      <div ref={refs[0]}>
        <div className="w-full h-16 rounded-btn bg-leaf-700 text-white flex items-center justify-center font-bold text-[20px] font-hindi online-glow">
          {t("home.goOffline")}
        </div>
      </div>
      <div ref={refs[1]}>
        <Card className="p-4 bg-white border border-saffron-100 flex flex-col gap-1">
          <span className="text-[16px] font-bold text-temple-600 font-hindi">{t("home.todayBookings")}</span>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[22px] font-bold text-ink font-mono">03:00 PM</span>
              <span className="text-[16px] font-bold text-temple-700 font-hindi">सत्यनारायण कथा</span>
            </div>
            <span className="text-[16px] font-bold text-leaf-700 font-hindi">मिलेगा ₹11,000</span>
          </div>
        </Card>
      </div>
      <div ref={refs[2]}>
        {/* static replica of the thali nav — no live buttons, no second orb */}
        <div className="relative w-full bg-[#FFF9EE] border-t-2 border-gold h-[72px] flex items-center justify-between px-2">
          {[t("nav.home"), t("nav.bookings")].map((label, i) => (
            <span key={label} className={`flex-1 text-center text-[13px] font-bold font-hindi ${i === 0 ? "text-saffron-600" : "text-softgrey"}`}>
              {i === 0 ? "🏠" : "📿"} {label}
            </span>
          ))}
          <span className="w-[66px] h-[66px] -mt-8 rounded-full bg-saffron-500 border-4 border-gold flex items-center justify-center text-[28px] shrink-0">🙏</span>
          {[t("nav.earnings"), t("nav.calendar")].map((label, i) => (
            <span key={label} className="flex-1 text-center text-[13px] font-bold text-softgrey font-hindi">
              {i === 0 ? "💰" : "📅"} {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniPoojasDemo({ addRef }: { addRef: React.MutableRefObject<HTMLDivElement | null> }) {
  return (
    <div aria-hidden="true" className="pointer-events-none select-none origin-top scale-[0.82] w-full max-w-[360px] mx-auto flex flex-col gap-3 bg-cream rounded-card border border-saffron-100 p-3">
      {["सत्यनारायण कथा", "गृह प्रवेश"].map((pj) => (
        <Card key={pj} className="p-4 bg-white border border-saffron-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[20px] font-bold text-ink font-hindi">{pj}</span>
            <span className="t-money text-[18px]">₹11,000</span>
          </div>
          <span className="bg-leaf-100 text-leaf-700 rounded-full px-3 py-1 text-[14px] font-bold font-hindi">✓ प्रमाणित</span>
        </Card>
      ))}
      <div ref={addRef}>
        <div className="w-full min-h-[56px] bg-saffron-500 text-[#FFF3EA] rounded-btn text-[18px] font-bold flex items-center justify-center font-hindi">
          + नई पूजा जोड़ें
        </div>
      </div>
    </div>
  );
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

  // Slide 3: spotlight target = the REAL शिष्य orb in the footer.
  // Held in state (not just a ref) so finding it triggers the render
  // that actually mounts the spotlight.
  const fabRef = useRef<HTMLElement | null>(null);
  const [fabEl, setFabEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const el = document.querySelector('[aria-label*="शिष्य"]') as HTMLElement | null;
    fabRef.current = el;
    setFabEl(el);
  }, [idx]);

  // Slide 9 home-tour stepping + demo refs
  const [tourStep, setTourStep] = useState(0);
  const tourRef1 = useRef<HTMLDivElement | null>(null);
  const tourRef2 = useRef<HTMLDivElement | null>(null);
  const tourRef3 = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (idx !== 8) setTourStep(0);
  }, [idx]);
  // Spotlight targets must be IN view before the cutout is meaningful
  useEffect(() => {
    if (idx !== 8) return;
    const refs = [tourRef1, tourRef2, tourRef3];
    const t = setTimeout(() => {
      refs[Math.min(tourStep, 2)]?.current?.scrollIntoView({ block: "center" });
    }, 350);
    return () => clearTimeout(t);
  }, [idx, tourStep]);

  // Slide 14 poojas demo ref + one-shot spotlight
  const poojasAddRef = useRef<HTMLDivElement | null>(null);
  const [poojasSpotDone, setPoojasSpotDone] = useState(false);
  useEffect(() => {
    if (idx !== 13) setPoojasSpotDone(false);
    if (idx === 13) {
      const t = setTimeout(() => poojasAddRef.current?.scrollIntoView({ block: "center" }), 350);
      return () => clearTimeout(t);
    }
  }, [idx]);

  // Slide 5: spotlight the listening pill when it appears
  const pillRef = useRef<HTMLDivElement | null>(null);

  // J2: every slide ends by INVITING the voice answer. Slide 3 is the
  // exception — asking "हाँ बोलिए" while Next is gate-locked would be a
  // lie, so its ask is spoken the moment the gate opens instead.
  const advanceAsk = t("tutorial.advanceAsk");
  const narrationFor = (i: number) =>
    i === 2 ? defs[i].narration : `${defs[i].narration} ${advanceAsk}`;

  useScreenVoice(narrationFor(idx));

  // D3c: warm the NEXT slide's narration while this one plays
  useEffect(() => {
    if (idx + 1 < defs.length) voiceController.prefetch([narrationFor(idx + 1)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // ── Slide 3 gate: one mute→unmute cycle OR 10s timeout ─────
  const muted = useSyncExternalStore(
    voiceController.subscribe,
    () => voiceController.muted,
    () => false,
  );
  const [sawMute, setSawMute] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  useEffect(() => {
    if (idx !== 2) return;
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
    if (idx !== 2) return;
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

  // ── Slide 5: mic permission + practice ─────────────────────
  const [micState, setMicState] = useState<"idle" | "asking" | "listening" | "done" | "denied">("idle");
  // Browser-level permission state (permissions.query where available):
  // 'granted' → no prompt will show, straight to practice; 'denied' →
  // recovery copy + retry; 'prompt'/'unknown' → the tap fires the prompt.
  const [micPerm, setMicPerm] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown");
  const voiceInput = useVoiceInput();
  useEffect(() => {
    if (idx !== 4) return;
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
  }, [idx]);

  const [pointerUp, setPointerUp] = useState(false);
  const askMic = () => {
    if (voiceController.e2e) {
      // E2E traversal: no native prompts; practice resolves immediately
      voiceController.debug("e2e: tutorial-s5 bypassed");
      setMicState("done");
      return;
    }
    // LADDER LAW (same as परिचय): getUserMedia is ALWAYS attempted first,
    // created synchronously inside the user-gesture call stack — never
    // pre-blocked on permissions.query alone. Recovery copy appears only
    // after a rejection that the query CONFIRMS as browser-level denied.
    const streamPromise = navigator.mediaDevices.getUserMedia({ audio: true });
    voiceController.debug("perm: getUserMedia invoked (tutorial s5)");
    setPointerUp(true);
    setMicState("asking");
    voiceController.speak(t("perm.pressAllowVoice"));
    void streamPromise
      .then(async (stream) => {
        setPointerUp(false);
        voiceController.debug("perm: settled(granted) (tutorial s5)");
        voiceController.stopSpeech("tutorial-s5:grant-settle");
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
          voiceController.debug("perm: settled(denied) (tutorial s5)");
          localStorage.setItem("mic_permission_granted", "false");
          setMicPerm("denied");
          setMicState("denied");
          onMicDenied();
          voiceController.speak(t("tutorial.slide5Denied"));
        } else {
          // popup dismissed — keep the button alive, no deny flags
          voiceController.debug("perm: settled(dismissed) (tutorial s5)");
          setMicState("idle");
          voiceController.speak(t("parichay.dismissed"));
        }
      });
  };

  // Practice resolution: the listen machinery finishing (with or without
  // a transcript — the point is that the mic worked) completes the drill.
  useEffect(() => {
    if (idx !== 4 || micState !== "listening") return;
    if (voiceInput.state === "idle" && voiceInput.transcript !== null) {
      setMicState("done");
      voiceController.speak(t("tutorial.slide5Practice"));
    } else if (voiceInput.state === "error") {
      setMicState("done");
      voiceController.speak(t("tutorial.slide5Practice"));
    }
  }, [idx, micState, voiceInput.state, voiceInput.transcript]);

  // Leaving slide 5 mid-practice: stop the recorder so a late result
  // can't speak or celebrate over a later slide.
  useEffect(() => {
    if (idx === 4) return;
    voiceInput.reset();
    setMicState((m) => (m === "listening" || m === "asking" ? "idle" : m));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);
  useEffect(() => {
    if (micState === "done" && idx === 4) {
      setBurst(true);
      playChime();
    }
  }, [micState, idx]);
  useEffect(() => {
    setBurst(false);
  }, [idx]);

  // ── Slide 6: temple bell once on mount ─────────────────────
  const rangRef = useRef(false);
  useEffect(() => {
    if (idx === 5 && !rangRef.current) {
      rangRef.current = true;
      playBell();
    }
    if (idx !== 5) rangRef.current = false;
  }, [idx]);

  const tourStrings = [
    { title: t("tutorial.tourStep1Title"), line: t("tutorial.tourStep1"), ref: tourRef1 },
    { title: t("tutorial.tourStep2Title"), line: t("tutorial.tourStep2"), ref: tourRef2 },
    { title: t("tutorial.tourStep3Title"), line: t("tutorial.tourStep3"), ref: tourRef3 },
  ];

  // ── Slide 14 (CTA) ──────────────────────────────────────────
  const [stay, setStay] = useState(false);

  const goNext = () => onSlideChange(Math.min(TUTORIAL_TOTAL, slide + 1));
  const goBack = () => onSlideChange(Math.max(1, slide - 1));
  const skipToCta = () => onSlideChange(TUTORIAL_TOTAL);

  const nextDisabled = idx === 2 && !gateOpen;
  const isCta = idx === TUTORIAL_TOTAL - 1;

  // J2: the whole tutorial answers by voice. हाँ/आगे advance (the slide-3
  // gate refuses politely; the slide-5 popup/practice moment stays quiet —
  // a spoken हाँ there is aimed at the mic, not the slide). छोड़ो jumps to
  // the CTA, पीछे retreats. On the CTA slide हाँ/शुरू/रजिस्ट्रेशन register
  // and बाद-में/छोड़ो defer. फिर-से/मदद/सो-जाओ come from the global grammar.
  useVoiceCommands([
    {
      keywords: [...YES, ...NEXT, "रजिस्ट्रेशन", "रजिस्टर", "registration", "शुरू", "start"],
      action: () => {
        if (isCta) return onRegister();
        if (idx === 4 && (micState === "asking" || micState === "listening")) return;
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
  ]);

  if (idx === TUTORIAL_TOTAL - 1) {
    return (
      <TutorialShell
        currentDot={TUTORIAL_TOTAL}
        totalDots={TUTORIAL_TOTAL}
        onSkip={skipToCta}
        onBack={goBack}
        onNext={onRegister}
        nextLabel={t("tutorial.registerNow")}
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
            {idx === 8 ? (
              <MiniHomeDemo step={tourStep} refs={[tourRef1, tourRef2, tourRef3]} />
            ) : idx === 13 ? (
              <MiniPoojasDemo addRef={poojasAddRef} />
            ) : idx === 4 ? (
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

        {/* Arrow + chip pointing at the NATIVE permission popup (slide 5) */}
        {pointerUp && <PopupPointer />}

        {/* Slide 3: spotlight the REAL शिष्य orb; gate opens on the cycle */}
        {idx === 2 && !gateOpen && fabEl && (
          <CoachSpotlight
            targetRef={fabRef}
            title={t("tutorial.slide3Title")}
            line={t("tutorial.slide3")}
            requireInteraction
            onDone={() => { /* gate opens via the mute→unmute subscription */ }}
          />
        )}

        {/* Slide 9: home tour — spotlight steps INSIDE the demo frame */}
        {idx === 8 && tourStep < 3 && (
          <CoachSpotlight
            targetRef={tourStrings[tourStep].ref}
            title={tourStrings[tourStep].title}
            line={tourStrings[tourStep].line}
            onDone={() => setTourStep((t) => t + 1)}
          />
        )}

        {/* Slide 14: spotlight the + नई पूजा जोड़ें demo button */}
        {idx === 13 && !poojasSpotDone && (
          <CoachSpotlight
            targetRef={poojasAddRef}
            title={t("tutorial.slidePoojasTitle")}
            line={t("tutorial.slidePoojas")}
            onDone={() => setPoojasSpotDone(true)}
          />
        )}

      </div>
    </TutorialShell>
  );
}
