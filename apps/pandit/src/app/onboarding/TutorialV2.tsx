"use client";

// ─────────────────────────────────────────────────────────────
// Tutorial — the 6-scene deck, drawn to CANON artboards 4-9
// (design/canon/हमारे पंडित जी.dc.html · "ट्यूटोरियल · …"):
//   4 कमाई · 5 नई बुकिंग · 6 शिष्य जगाएँ · 7 आवाज़ · 8 सत्यापन · 9 स्वागत
//
// EXACT-UI NOTE. Canon never draws these scenes with emoji — it draws
// real objects out of gradients and shadow layers: brass coins falling
// into a thali (bg-orb-brass over bg-orb-bell + shadow-orb-brass), a
// request card with an 8px sindoor spine, five sindoor→genda voice bars,
// a night-gradient video frame with a leaf verification stamp, and the
// real Diya. Every scene below is that composition, at canon's literal
// sizes/colours; the shell (dots, CTA, page field) is TutorialShell.
//
// A12: all motion is transform/opacity only, via framer-motion so
// prefers-reduced-motion collapses each scene to its composed still.
// Canon's own g-wave (height) and g-glowring (box-shadow) animate
// layout/paint properties — reproduced here as scaleY and a scaling
// ring so the animation law holds. See lawConflicts in the batch report.
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
import { PetalBurst } from "@/components/moments/SlideCanvas";
import { PopupPointer } from "@/components/moments/PopupPointer";
import { MoneyCount } from "@/components/moments/MoneyCount";
import { Diya } from "@/components/ui/Diya";
import { Button } from "@/components/ui/Button";
import { CoachSpotlight } from "@/components/moments/CoachSpotlight";
import { useReduced, still, cardSlideIn, stampIn, breathe } from "@/lib/motion";

// Slide count lives in lib/onboarding-store so light pages (login back
// law) can target the CTA slide without bundling the tutorial chunk.
import { TUTORIAL_TOTAL } from "@/lib/onboarding-store";
export { TUTORIAL_TOTAL };

type VisualFn = () => React.ReactNode;

interface SlideDef {
  title: string;
  narration: string;
  visual: VisualFn | null;
  // IDENTITY markers — interactive behavior/one-shots follow the slide,
  // never its position. See IDENTITY LAW above.
  interactive?: "mic" | "mute";
  role?: "bell" | "cta";
}

// ── canon type ramp for the caption pair under every scene ───
// canon: caption 23-24px/900 #7A250E (30px on स्वागत), sub 16-17px/600
// #8A6F5C. The sub is raised to the 18sp body floor (lawConflicts).
const CAPTION = "text-[24px] font-black text-saffron-700 font-hindi leading-tight";
const CAPTION_HERO = "text-[30px] font-black text-saffron-700 font-hindi leading-tight";
const SUBCAPTION = "text-[18px] font-semibold text-softgrey font-hindi leading-relaxed";

// The scene stage — canon composes the illustration straight onto the
// page field (no tinted canvas box anywhere in frames 4-9).
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="pa-canvas-enter w-full flex flex-col items-center justify-center">
      {children}
    </div>
  );
}

// ── The 6 animated scenes ────────────────────────────────────

// कमाई — canon 4. Brass ₹ coins fall past the rim into a lit thali.
// Coin geometry is canon's literal set (left/size/glyph-size/duration).
const CANON_COINS = [
  { left: "20%", size: 32, glyph: 17, dur: 1.9, delay: 0.0 },
  { left: "44%", size: 36, glyph: 19, dur: 1.7, delay: 0.45 },
  { left: "66%", size: 30, glyph: 16, dur: 2.1, delay: 0.9 },
  { left: "33%", size: 26, glyph: 14, dur: 1.6, delay: 1.35 },
] as const;

function SceneKamai() {
  const reduced = useReduced();
  return (
    <div className="flex flex-col items-center gap-3">
      {/* canon: CountUp 48px #155C34, 1800ms */}
      <MoneyCount target={52400} durationMs={1800} className="text-[48px] font-black text-leaf-700" />
      {/* canon stage: 230×170, coins behind the thali rim */}
      <div className="relative w-[230px] h-[170px] mt-1.5" aria-hidden="true">
        {CANON_COINS.map((c, i) => (
          <motion.span
            key={i}
            className="absolute top-0 rounded-full bg-orb-brass text-saffron-700 font-black flex items-center justify-center"
            style={{
              left: c.left,
              width: c.size,
              height: c.size,
              fontSize: c.glyph,
              boxShadow: "0 2px 4px rgba(0,0,0,.22)",
            }}
            initial={reduced ? { y: 30, opacity: 1 } : { y: -90, opacity: 0 }}
            animate={
              reduced
                ? { y: 30, opacity: 1 }
                : { y: [-90, 64], rotate: [0, 200], opacity: [0, 1, 1, 0] }
            }
            transition={
              reduced
                ? undefined
                : {
                    duration: c.dur,
                    delay: c.delay,
                    repeat: Infinity,
                    ease: "easeIn",
                    opacity: { duration: c.dur, delay: c.delay, repeat: Infinity, times: [0, 0.15, 0.7, 1] },
                  }
            }
          >
            ₹
          </motion.span>
        ))}
        {/* thali: canon's brass ellipse — inset top-light + grounded drop */}
        <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[180px] h-[50px] rounded-full bg-orb-bell shadow-orb-brass" />
        {/* the darker inner well, canon opacity .55 */}
        <div
          className="absolute bottom-[34px] left-1/2 -translate-x-1/2 w-[150px] h-[26px] rounded-full opacity-55"
          style={{ background: "linear-gradient(#8a6a12,#c99a2a)" }}
        />
      </div>
    </div>
  );
}

// नई बुकिंग — canon 5. The temple bell (rung once via role:"bell") over
// the request card: 2px peach border, 8px sindoor spine, shadow-lift.
function SceneBooking() {
  const reduced = useReduced();
  return (
    <div className="flex flex-col items-center gap-[18px] w-full">
      <span className="pa-bell-swing text-[52px] leading-none select-none" aria-hidden="true">🔔</span>
      <motion.div
        className="w-full bg-card border-2 border-saffron-200 border-l-8 border-l-saffron-500 rounded-cta py-4 px-[18px] flex flex-col gap-1.5 shadow-lift"
        variants={reduced ? still(cardSlideIn) : cardSlideIn}
        initial="hidden"
        animate="show"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[20px] font-black text-saffron-700 font-hindi">गृह प्रवेश पूजा</span>
          {/* canon badge is 12px — raised to the label floor (lawConflicts) */}
          <span className="text-[15px] font-extrabold text-saffron-500 bg-saffron-50 px-2.5 py-1 rounded-chip font-hindi shrink-0">नई</span>
        </div>
        <div className="flex items-center gap-2 text-[18px] font-semibold text-temple-700 font-hindi">
          <span className="text-[20px] leading-none" aria-hidden="true">📅</span>
          कल · सुबह 9:00
        </div>
        <div className="flex items-center justify-between mt-1 gap-2">
          <span className="text-[18px] font-semibold text-softgrey font-hindi">दक्षिणा</span>
          <span className="text-[22px] font-black text-leaf-700 font-hindi">₹5,600</span>
        </div>
      </motion.div>
    </div>
  );
}

// आवाज़ — canon 7's five voice bars: sindoor → genda → sindoor, 7px wide,
// 4px radius, 40px stage. Canon animates height; we animate scaleY from
// the same 10px↔34px ratio so the animation law holds and nothing reflows.
const BAR_COLORS = ["#B23A1A", "#D95F38", "#F2A02C", "#D95F38", "#B23A1A"] as const;
const BAR_MIN = 10 / 34;

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

// canon's Shishya illustration is a component the app does not have yet
// (see sharedNeeded). Until it lands, the orb is drawn from the same
// genda radial canon uses for every lit object, at canon's sizes.
function ShishyaGlyph({ size, asleep = false }: { size: number; asleep?: boolean }) {
  return (
    <span
      className={`relative rounded-full bg-orb-diya flex items-center justify-center shrink-0 ${asleep ? "grayscale opacity-60" : "shadow-glow-genda"}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="leading-none select-none" style={{ fontSize: Math.round(size * 0.5) }}>🙏</span>
      {asleep && (
        <span className="absolute -top-1 -right-1 text-[22px] leading-none">💤</span>
      )}
    </span>
  );
}

// शिष्य जगाएँ — canon 6: asleep orb → floating tap hint → awake orb.
function SceneSleep() {
  const reduced = useReduced();
  return (
    <div className="flex items-center gap-3.5">
      <ShishyaGlyph size={76} asleep />
      <motion.div
        className="flex flex-col items-center gap-1"
        animate={reduced ? undefined : { y: [0, -9, 0] }}
        transition={reduced ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <span className="text-[30px] leading-none text-saffron-500">👆</span>
        <span className="text-[26px] leading-none text-gold">→</span>
      </motion.div>
      <ShishyaGlyph size={76} />
    </div>
  );
}

// सत्यापन — canon 8: the night-gradient video frame, gold bezel, REC dot,
// the silhouette, and the leaf ✓ stamp landing over it.
function SceneVerify() {
  const reduced = useReduced();
  return (
    <div
      className="relative w-[220px] h-[164px] rounded-cta bg-night overflow-hidden border-3 border-gold flex items-end justify-center"
      style={{ boxShadow: "0 10px 24px rgba(42,27,61,.35)" }}
      aria-hidden="true"
    >
      {/* silhouette: head + shoulders, canon's translucent chandan */}
      <div
        className="absolute top-[26px] left-1/2 -translate-x-1/2 w-[52px] h-[52px] rounded-full"
        style={{ background: "rgba(255,246,233,.28)" }}
      />
      <div
        className="w-[118px] h-[66px]"
        style={{ borderRadius: "60px 60px 0 0", background: "rgba(255,246,233,.28)" }}
      />
      {/* REC */}
      <span className="absolute top-2.5 left-3 text-[15px] font-extrabold flex items-center gap-1" style={{ color: "#FF7B6B" }}>
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FF3B30" }} />
        REC
      </span>
      {/* the stamp */}
      <motion.span
        className="absolute top-1/2 left-1/2 w-[78px] h-[78px] rounded-full bg-leaf-500 border-4 border-chandan flex items-center justify-center"
        style={{ x: "-50%", y: "-50%", boxShadow: "0 8px 20px rgba(0,0,0,.4)" }}
        variants={reduced ? still(stampIn) : stampIn}
        initial="hidden"
        animate="show"
      >
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4.5 12.5l5 5 10-11" stroke="#FFF6E9" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.span>
    </div>
  );
}

// स्वागत — canon 9: the real Diya at 96, with the marigold burst behind.
const CANON_BURST = [
  { x: -90, y: -60, size: 20, dur: 1.8, delay: 0.0, glyph: "🌼" },
  { x: 90, y: -55, size: 18, dur: 1.8, delay: 0.3, glyph: "🌸" },
  { x: -110, y: 30, size: 16, dur: 2.0, delay: 0.6, glyph: "🌼" },
  { x: 110, y: 40, size: 20, dur: 2.0, delay: 0.9, glyph: "🌸" },
  { x: 0, y: -90, size: 18, dur: 1.9, delay: 1.2, glyph: "🌼" },
  { x: -60, y: 70, size: 15, dur: 2.1, delay: 1.5, glyph: "🌸" },
] as const;

function SceneWelcome() {
  const reduced = useReduced();
  return (
    <div className="relative flex items-center justify-center" aria-hidden="true">
      {!reduced && (
        <span className="absolute left-1/2 top-1/2 w-0 h-0">
          {CANON_BURST.map((p, i) => (
            <motion.span
              key={i}
              className="absolute leading-none select-none"
              style={{ fontSize: p.size }}
              initial={{ x: 0, y: 0, scale: 0.4, rotate: 0, opacity: 1 }}
              animate={{ x: p.x, y: p.y, scale: 1.1, rotate: 180, opacity: 0 }}
              transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeOut" }}
            >
              {p.glyph}
            </motion.span>
          ))}
        </span>
      )}
      <motion.span
        className="relative z-[2]"
        variants={reduced ? still(breathe) : breathe}
        initial={false}
        animate="show"
      >
        <Diya size={96} lit />
      </motion.span>
    </div>
  );
}

// ── The deck — canon 4→9 order. Narrations VERBATIM from
// strings.tutorial (spoken explanation); on-screen text stays ≤10 words.
function slideDefs(): SlideDef[] {
  return [
    { title: t("tutorial.slide2Title"), narration: t("tutorial.slide2"), visual: () => <SceneKamai /> },
    { title: t("tutorial.slide6Title"), narration: t("tutorial.slide6"), visual: () => <SceneBooking />, role: "bell" },
    { title: t("tutorial.slide3Title"), narration: t("tutorial.slide3"), visual: () => <SceneSleep />, interactive: "mute" },
    { title: t("tutorial.slide5Title"), narration: t("tutorial.slide5"), visual: null, interactive: "mic" },
    { title: t("tutorial.slide12Title"), narration: t("tutorial.slide12"), visual: () => <SceneVerify /> },
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
        hero
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <Stage>{def.visual?.()}</Stage>
          <h2 className={CAPTION_HERO}>{def.title}</h2>
          <p className={SUBCAPTION}>{def.narration}</p>
          {stay ? (
            <p className={SUBCAPTION}>{t("tutorial.laterLine")}</p>
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
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Visual zone: canon composes straight onto the page field */}
        <div className="relative w-full shrink-0 flex justify-center">
          <Stage>
            {isMic ? (
              // आवाज़ — canon 7: शिष्य orb, the five voice bars, and the
              // 78px sindoor mic disc. The disc IS the tap target for the
              // permission ladder / practice (78px ≫ the 52px floor).
              <div className="w-full flex flex-col items-center gap-4">
                <ShishyaGlyph size={82} />
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
                  <>
                    <SoundWaves />
                    <button
                      onClick={askMic}
                      disabled={micState === "asking"}
                      aria-label={micPerm === "granted" ? t("tutorial.slide5Again") : t("tutorial.slide5Button")}
                      className="relative w-[78px] h-[78px] rounded-full bg-saffron-500 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-70"
                      style={{ boxShadow: "0 8px 20px rgba(178,58,26,.35)" }}
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
                    <span className="text-[18px] font-semibold text-softgrey font-hindi">
                      {micPerm === "granted" ? t("tutorial.slide5Again") : t("tutorial.slide5Button")}
                    </span>
                  </>
                )}
              </div>
            ) : (
              def.visual?.()
            )}
          </Stage>
          {burst && <PetalBurst onEnd={() => setBurst(false)} />}
        </div>
        <h2 className={CAPTION}>{def.title}</h2>
        <p className={SUBCAPTION}>{def.narration}</p>

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
