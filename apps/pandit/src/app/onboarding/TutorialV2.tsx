"use client";

// ─────────────────────────────────────────────────────────────
// Tutorial v2 — the 14-slide script, rendered on the existing
// TutorialShell. Narrations come VERBATIM from strings.tutorial.
// Interactive slides: 3 (SpeakerFab mute→unmute gate), 5 (mic
// permission + practice listen), 6 (temple bell once on mount).
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import TutorialShell from "./screens/tutorial/TutorialShell";
import { hi } from "@/lib/strings";
import { useScreenVoice } from "@/hooks/useScreenVoice";
import { voiceController } from "@/lib/voiceController";
import { playBell } from "@/lib/sounds";
import { Button } from "@/components/ui/Button";

export const TUTORIAL_TOTAL = 14;

interface SlideDef {
  title: string;
  narration: string;
  visual: React.ReactNode;
}

// ── Visuals (pure presentation per the spec's one-liners) ────
const V = {
  s1: (
    <div className="flex flex-col items-center gap-3 py-6">
      <span className="text-[88px] leading-none" aria-hidden="true">🕉</span>
      <div className="w-full h-[14px]" style={{
        background: "radial-gradient(circle at 50% 0, #F2A02C 55%, transparent 56%)",
        backgroundSize: "24px 14px",
        backgroundRepeat: "repeat-x",
      }} />
    </div>
  ),
  s2: (
    <div className="w-full bg-white rounded-card border border-saffron-100 p-5 flex items-center justify-center gap-4">
      <div className="text-center">
        <p className="t-hint text-softgrey font-hindi">पहले</p>
        <p className="text-[26px] font-bold text-softgrey line-through">₹18,000</p>
      </div>
      <span className="text-[32px]" aria-hidden="true">→</span>
      <div className="text-center">
        <p className="t-hint text-leaf-700 font-hindi">अब</p>
        <p className="text-[32px] font-bold text-leaf-700">₹63,000</p>
      </div>
    </div>
  ),
  s3: (
    <div className="flex flex-col items-end w-full pr-2 pt-2">
      <span className="text-[64px] leading-none animate-bounce" aria-hidden="true">↗️</span>
      <span className="t-hint text-softgrey font-hindi self-center mt-4">ऊपर दाईं ओर स्पीकर बटन</span>
    </div>
  ),
  s4: (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="flex items-center gap-4">
        <span className="text-[48px]" aria-hidden="true">🗣️</span>
        <span className="text-[28px] text-softgrey" aria-hidden="true">+</span>
        <span className="text-[48px]" aria-hidden="true">⌨️</span>
      </div>
      <span className="text-[28px]" aria-hidden="true">↓</span>
      <div className="w-full max-w-[260px] min-h-[56px] border-2 border-saffron-200 rounded-btn bg-white flex items-center px-4 text-softgrey text-[18px]">
        एक ही खाना…
      </div>
    </div>
  ),
  s6: (
    <div className="w-full max-w-[280px] mx-auto bg-white rounded-card border border-saffron-100 p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[28px] animate-bounce" aria-hidden="true">🔔</span>
        <span className="t-body font-bold text-ink font-hindi">{hi.booking.newRequest}</span>
      </div>
      <div className="bg-saffron-50 rounded-btn px-3 py-2 t-hint text-softgrey font-hindi">
        दक्षिणा ₹11,000 · यात्रा ₹800 · भोजन ₹500
      </div>
    </div>
  ),
  s7: (
    <div className="flex flex-col gap-2 w-full max-w-[280px] mx-auto">
      {["स्वीकार करें", "घर से निकले", "पहुँच गया", "🙏 पूजा संपन्न"].map((step, i) => (
        <div key={step} className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-saffron-500 text-white text-[16px] font-bold flex items-center justify-center">{i + 1}</span>
          <span className="t-body font-semibold text-ink font-hindi">{step}</span>
        </div>
      ))}
    </div>
  ),
  s8: (
    <div className="flex items-center justify-center gap-3 py-4">
      <span className="text-[40px]" aria-hidden="true">🙏</span>
      <span className="text-[24px]" aria-hidden="true">→</span>
      <div className="text-center">
        <span className="text-[28px]" aria-hidden="true">⏱️</span>
        <p className="t-hint text-softgrey font-hindi">24 घंटे</p>
      </div>
      <span className="text-[24px]" aria-hidden="true">→</span>
      <span className="text-[40px]" aria-hidden="true">🏦</span>
    </div>
  ),
  s9: (
    <div className="flex items-center justify-center gap-4 py-4">
      <span className="text-[64px]" aria-hidden="true">🛍️</span>
      <div className="bg-leaf-100 border border-gold rounded-card px-4 py-2 text-[22px] font-bold text-leaf-700">₹2,100</div>
    </div>
  ),
  s10: (
    <div className="grid grid-cols-7 gap-1 w-full max-w-[260px] mx-auto py-2">
      {Array.from({ length: 21 }, (_, i) => (
        <span key={i} className={`h-8 rounded flex items-center justify-center text-[14px] ${i === 9 ? "bg-red-100 text-danger font-bold" : "bg-white border border-saffron-100 text-softgrey"}`}>
          {i === 9 ? "✖" : i + 1}
        </span>
      ))}
    </div>
  ),
  s11: (
    <div className="grid grid-cols-2 gap-3 w-full max-w-[300px] mx-auto">
      {["🪙 दक्षिणा आपकी", "⏱️ पैसा 24 घंटे", "🚆 यात्रा हमारी", "📞 मदद एक फ़ोन पर"].map((b) => (
        <div key={b} className="bg-white border border-gold rounded-card px-3 py-3 text-center t-hint font-bold text-temple-600 font-hindi">
          {b}
        </div>
      ))}
    </div>
  ),
  s12: (
    <div className="flex items-center justify-center gap-4 py-4">
      <span className="text-[56px]" aria-hidden="true">🪪</span>
      <div className="bg-leaf-100 border border-leaf-500 rounded-full px-4 py-2 text-[18px] font-bold text-leaf-700 font-hindi">✓ प्रमाणित</div>
    </div>
  ),
  s13: (
    <div className="w-full max-w-[280px] mx-auto bg-white rounded-card border border-saffron-100 p-5 flex items-center gap-4">
      <span className="text-[48px]" aria-hidden="true">📞</span>
      <span className="t-body font-bold text-ink font-hindi">सीधे बात कीजिए — टीम आपके साथ है</span>
    </div>
  ),
  s14: (
    <div className="text-center py-4">
      <span className="text-[88px] leading-none" aria-hidden="true">🎉</span>
    </div>
  ),
};

function slideDefs(): SlideDef[] {
  const t = hi.tutorial;
  return [
    { title: t.slide1Title, narration: t.slide1, visual: V.s1 },
    { title: t.slide2Title, narration: t.slide2, visual: V.s2 },
    { title: t.slide3Title, narration: t.slide3, visual: V.s3 },
    { title: t.slide4Title, narration: t.slide4, visual: V.s4 },
    { title: t.slide5Title, narration: t.slide5, visual: null },
    { title: t.slide6Title, narration: t.slide6, visual: V.s6 },
    { title: t.slide7Title, narration: t.slide7, visual: V.s7 },
    { title: t.slide8Title, narration: t.slide8, visual: V.s8 },
    { title: t.slide9Title, narration: t.slide9, visual: V.s9 },
    { title: t.slide10Title, narration: t.slide10, visual: V.s10 },
    { title: t.slide11Title, narration: t.slide11, visual: V.s11 },
    { title: t.slide12Title, narration: t.slide12, visual: V.s12 },
    { title: t.slide13Title, narration: t.slide13, visual: V.s13 },
    { title: t.slide14Title, narration: t.slide14, visual: V.s14 },
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

  useScreenVoice(def.narration);

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
    const t = setTimeout(() => setGateOpen(true), 10000);
    return () => clearTimeout(t);
  }, [idx]);
  useEffect(() => {
    if (idx !== 2) return;
    if (muted) setSawMute(true);
    else if (sawMute) setGateOpen(true); // completed mute → unmute cycle
  }, [muted, sawMute, idx]);

  // ── Slide 5: mic permission + practice ─────────────────────
  const [micState, setMicState] = useState<"idle" | "asking" | "listening" | "done" | "denied">("idle");
  const recRef = useRef<{ stop: () => void } | null>(null);
  const askMic = async () => {
    voiceController.stopSpeech();
    setMicState("asking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      localStorage.setItem("mic_permission_granted", "true");
      onMicGranted();
      setMicState("listening");
      // one practice listen window via the browser recognizer
      const { startListening } = await import("@/lib/voice-engine");
      const cleanup = startListening({
        language: "hi-IN",
        onResult: () => {
          setMicState("done");
          voiceController.speak(hi.tutorial.slide5Practice);
        },
        onError: () => {
          setMicState("done");
          voiceController.speak(hi.tutorial.slide5Practice);
        },
      });
      recRef.current = { stop: cleanup };
    } catch {
      localStorage.setItem("mic_permission_granted", "false");
      setMicState("denied");
      onMicDenied();
      voiceController.speak(hi.tutorial.slide5Denied);
    }
  };
  useEffect(() => () => recRef.current?.stop(), []);

  // ── Slide 6: temple bell once on mount ─────────────────────
  const rangRef = useRef(false);
  useEffect(() => {
    if (idx === 5 && !rangRef.current) {
      rangRef.current = true;
      playBell();
    }
    if (idx !== 5) rangRef.current = false;
  }, [idx]);

  // ── Slide 14 (CTA) ──────────────────────────────────────────
  const [stay, setStay] = useState(false);

  const goNext = () => onSlideChange(Math.min(TUTORIAL_TOTAL, slide + 1));
  const goBack = () => onSlideChange(Math.max(1, slide - 1));
  const skipToCta = () => onSlideChange(TUTORIAL_TOTAL);

  const nextDisabled = idx === 2 && !gateOpen;

  if (idx === TUTORIAL_TOTAL - 1) {
    return (
      <TutorialShell
        currentDot={TUTORIAL_TOTAL}
        totalDots={TUTORIAL_TOTAL}
        onSkip={skipToCta}
        onBack={goBack}
        onNext={onRegister}
        nextLabel={hi.tutorial.registerNow}
      >
        <div className="flex flex-col items-center gap-4 px-4 text-center">
          {def.visual}
          <h2 className="t-title font-bold text-temple-600 font-hindi">{def.title}</h2>
          <p className="t-body text-ink font-hindi leading-relaxed">{def.narration}</p>
          {stay ? (
            <p className="t-body text-softgrey font-hindi">{hi.tutorial.laterLine}</p>
          ) : (
            <Button variant="ghost" size="md" onClick={() => { setStay(true); onLater(); }}>
              {hi.tutorial.later}
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
      nextLabel={nextDisabled ? "⏳ आज़मा कर देखिए…" : hi.tutorial.next}
    >
      <div className="flex flex-col items-center gap-4 px-4 text-center">
        {def.visual}
        <h2 className="t-title font-bold text-temple-600 font-hindi">{def.title}</h2>
        <p className="t-body text-ink font-hindi leading-relaxed">{def.narration}</p>

        {/* Slide 5 interactive card */}
        {idx === 4 && (
          <div className="w-full max-w-[300px] flex flex-col items-center gap-3 bg-white rounded-card border border-saffron-100 p-5">
            <span className="text-[56px]" aria-hidden="true">🎤</span>
            {micState === "idle" || micState === "asking" ? (
              <Button variant="primary" size="md" fullWidth onClick={askMic} loading={micState === "asking"}>
                {hi.tutorial.slide5Button}
              </Button>
            ) : micState === "listening" ? (
              <span className="bg-gold/15 border border-gold text-temple-600 text-[18px] font-semibold font-hindi rounded-full px-4 py-2">
                सुन रहा हूँ… बोलिए — नमस्ते
              </span>
            ) : micState === "done" ? (
              <span className="text-[20px] font-bold text-leaf-700 font-hindi">✓ {hi.tutorial.slide5Practice}</span>
            ) : (
              <span className="t-body text-softgrey font-hindi">{hi.tutorial.slide5Denied}</span>
            )}
          </div>
        )}
      </div>
    </TutorialShell>
  );
}
