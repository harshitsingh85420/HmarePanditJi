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
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { Toran } from "@/components/ui/Toran";
import { Button } from "@/components/ui/Button";
import { CoachSpotlight } from "@/components/moments/CoachSpotlight";
import { useReduced } from "@/lib/motion";

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
  // canon on-screen text: a short CAPTION (+ optional sub) — canon frames
  // never print the narration paragraph; explanation is voice-only.
  // caption=null → the scene draws its own heading (5a कमाई).
  caption?: string | null;
  sub?: string | null;
  captionClass?: string;
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

// कमाई — Ruling #6 DEMONSTRATION (canon 5a world). A booking card slides
// in → a thumb presses स्वीकार (ripple) → a green tick resolves it → three
// brass coins arc down into the purse → the earnings total (canon's 52,400)
// glows as it lands. 7s loop, CSS keyframes; reduced-motion rests on the
// RESULT (tick + purse + total). Written words: "आपकी कमाई" + the in-mock
// card labels only.
const KAMAI_COINS = [
  { x: -42, delay: "0s" },
  { x: 0, delay: ".18s" },
  { x: 42, delay: ".36s" },
] as const;

function SceneKamai() {
  const reduced = useReduced();
  return (
    <div className="flex flex-col items-center gap-2" aria-hidden="true">
      {/* the earnings total — rolls up once on view (canon 48px leaf), then
          brightens each time coins land (pa-k-amount) */}
      <MoneyCount
        target={52400}
        durationMs={1500}
        className={`text-[44px] font-black text-leaf-700 leading-none ${reduced ? "" : "pa-k-amount"}`}
      />
      <div className="text-[22px] font-extrabold text-saffron-700 font-hindi">{t("tutorial.capKamai")}</div>

      <div className="relative w-[250px] h-[200px] mt-1">
        {/* the booking request card drops in from the top */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[210px] bg-card border-2 border-saffron-200 border-l-[6px] border-l-saffron-500 rounded-cta px-3.5 py-2.5 flex flex-col gap-1 shadow-lift ${
            reduced ? "hidden" : "pa-k-card"
          }`}
        >
          <span className="text-[17px] font-black text-saffron-700 font-hindi leading-tight">गृह प्रवेश पूजा</span>
          <span className="text-[13px] font-semibold text-softgrey font-hindi">कल · सुबह 9:00 · ₹5,600</span>
          <div className="relative self-stretch mt-1">
            <span className="block text-center text-[14px] font-extrabold text-chandan bg-leaf-500 rounded-chip py-1 font-hindi">
              स्वीकार
            </span>
            <span className="pa-k-ripple absolute left-1/2 top-1/2 -ml-5 -mt-5 w-10 h-10 rounded-full bg-white" />
          </div>
        </div>

        {/* the pressing thumb (canon touch_app glyph) */}
        <span
          className="pa-k-thumb absolute left-[118px] top-[92px] material-symbols-outlined text-[30px] text-saffron-700"
          style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,.28))" }}
        >
          touch_app
        </span>

        {/* the green accept-tick that resolves the card */}
        <span
          className={`absolute left-1/2 top-[42px] -translate-x-1/2 w-[64px] h-[64px] rounded-full bg-leaf-500 border-4 border-chandan flex items-center justify-center shadow-[0_6px_16px_rgba(30,122,70,.4)] ${
            reduced ? "" : "pa-k-tick"
          }`}
        >
          <span className="material-symbols-outlined material-symbols-filled text-[36px] text-white leading-none">check</span>
        </span>

        {/* three brass coins arc from the card into the purse */}
        {!reduced &&
          KAMAI_COINS.map((c, i) => (
            <span
              key={i}
              className="pa-k-coin absolute left-1/2 top-[92px] w-[26px] h-[26px] -ml-[13px] rounded-full bg-orb-brass text-saffron-700 text-[15px] font-black flex items-center justify-center"
              style={{ ["--kx" as string]: `${c.x}px`, animationDelay: c.delay, boxShadow: "0 2px 4px rgba(0,0,0,.22)" }}
            >
              ₹
            </span>
          ))}

        {/* the purse at the foot — catches a little bounce as coins land */}
        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${reduced ? "" : "pa-k-purse"}`}
          style={{ transformOrigin: "50% 100%" }}
        >
          <div className="w-[92px] h-[56px] rounded-b-[46px] rounded-t-[14px] border-2 border-[#7d4a12] shadow-[0_6px_14px_rgba(90,46,32,.3)] bg-[linear-gradient(150deg,#C77E2A,#9A5A16)]" />
          <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-[52px] h-[13px] rounded-full bg-[#7d4a12]" />
        </div>
      </div>
    </div>
  );
}

// नई बुकिंग — Ruling #6 DEMONSTRATION (canon 5b world). The temple bell
// rings (swing + a sound ring radiates) → the request card rises in → the
// नई badge welcomes with a pulse. 6s loop, CSS keyframes; reduced-motion
// rests on the card fully in. 🔔 is canon's own emoji here.
function SceneBooking() {
  const reduced = useReduced();
  return (
    <div className="flex flex-col items-center gap-[18px] w-full" aria-hidden="true">
      {/* the temple bell rings; a sound ring radiates from it */}
      <div className="relative flex items-center justify-center w-[56px] h-[56px]">
        {!reduced && (
          <span className="pa-b-ring absolute left-1/2 top-1/2 -ml-[28px] -mt-[28px] w-[56px] h-[56px] rounded-full border-2 border-saffron-300" />
        )}
        <span className={`${reduced ? "" : "pa-b-bell"} text-[52px] leading-none select-none`}>🔔</span>
      </div>
      {/* the request card rises in and holds */}
      <div
        className={`w-full bg-card border-2 border-saffron-200 border-l-8 border-l-saffron-500 rounded-cta py-4 px-[18px] flex flex-col gap-1.5 shadow-lift ${
          reduced ? "" : "pa-b-card"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[20px] font-black text-saffron-700 font-hindi">गृह प्रवेश पूजा</span>
          {/* canon badge is 12px — raised to the label floor (lawConflicts) */}
          <span className={`text-[15px] font-extrabold text-saffron-500 bg-saffron-50 px-2.5 py-1 rounded-chip font-hindi shrink-0 ${reduced ? "" : "pa-b-badge"}`}>
            नई
          </span>
        </div>
        <div className="flex items-center gap-2 text-[18px] font-semibold text-temple-700 font-hindi">
          {/* canon draws Material 'event', not the 📅 emoji */}
          <span className="material-symbols-outlined text-[20px] leading-none text-softgrey">event</span>
          कल · सुबह 9:00
        </div>
        <div className="flex items-center justify-between mt-1 gap-2">
          <span className="text-[18px] font-semibold text-softgrey font-hindi">दक्षिणा</span>
          <span className="text-[22px] font-black text-leaf-700 font-hindi">₹5,600</span>
        </div>
      </div>
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

// शिष्य जगाएँ — Ruling #6 DEMONSTRATION. One orb (canon's orb look) sleeps
// dim → wakes (halo blooms) → the ribbon "जी, पंडित जी 🙏" pops → a small
// bow → back to sleep. 6.5s loop; reduced-motion rests awake + greeting.
// (The mute-GATE — tap the REAL footer orb to advance — is untouched; this
//  is the teaching illustration beside it.)
function SceneSleep() {
  const reduced = useReduced();
  const size = 96;
  return (
    <div className="relative flex flex-col items-center justify-center w-[180px] h-[190px]" aria-hidden="true">
      {/* the greeting ribbon pops after the orb wakes */}
      <div className={`absolute left-1/2 -translate-x-1/2 top-0 ${reduced ? "" : "pa-w-ribbon"}`}>
        <span className="inline-block bg-saffron-500 text-chandan text-[15px] font-semibold font-hindi rounded-2xl px-[15px] py-[9px] shadow-[0_6px_16px_rgba(178,58,26,.3)] whitespace-nowrap">
          जी, पंडित जी 🙏
        </span>
      </div>
      {/* gold halo blooms only while awake */}
      {!reduced && (
        <span
          className="pa-w-halo absolute left-1/2 top-[112px] -mt-[60px] w-[120px] h-[120px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(242,160,44,.5), transparent 70%)" }}
        />
      )}
      {/* the orb: dim-asleep → lit-awake → bow → asleep (wrapper keeps it
          centred while the animation owns translateY/scale/filter) */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[62px]">
        <div className={reduced ? "" : "pa-w-orb"}>
          <span
            className={`relative flex items-center justify-center rounded-full bg-saffron-500 border-4 border-gold shadow-orb-brass ${
              reduced ? "" : ""
            }`}
            style={{ width: size, height: size }}
          >
            <span className="text-[44px] leading-none select-none">🙏</span>
            <span className={`absolute -top-1 -right-1 text-[22px] leading-none ${reduced ? "hidden" : "pa-w-zzz"}`}>💤</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// सत्यापन — Ruling #6 DEMONSTRATION (canon 8 world). The video records (REC
// pulse + a 2-min bar fills) → an upload arrow floats up → the admin tick
// stamps → a trust shield grows with a golden shimmer. 7s loop; reduced-
// motion rests on the shield (verified).
function SceneVerify() {
  const reduced = useReduced();
  return (
    <div className="relative flex flex-col items-center" aria-hidden="true">
      <div
        className="relative w-[220px] h-[164px] rounded-cta bg-night overflow-hidden border-3 border-gold flex items-end justify-center"
        style={{ boxShadow: "0 10px 24px rgba(42,27,61,.35)" }}
      >
        {/* silhouette: head + shoulders, canon's translucent chandan */}
        <div className="absolute top-[26px] left-1/2 -translate-x-1/2 w-[52px] h-[52px] rounded-full" style={{ background: "rgba(255,246,233,.28)" }} />
        <div className="w-[118px] h-[66px]" style={{ borderRadius: "60px 60px 0 0", background: "rgba(255,246,233,.28)" }} />

        {/* REC — the dot pulses while recording */}
        <span className="absolute top-2.5 left-3 text-[15px] font-extrabold flex items-center gap-1" style={{ color: "#FF7B6B" }}>
          <span className={`w-2 h-2 rounded-full ${reduced ? "" : "pa-v-rec"}`} style={{ backgroundColor: "#FF3B30" }} />
          REC
        </span>

        {/* the 2-minute recording bar fills along the foot of the frame */}
        {!reduced && (
          <span className="absolute bottom-0 left-0 h-[4px] w-full bg-leaf-500 pa-v-fill" />
        )}

        {/* an upload arrow floats up out of the frame once recorded */}
        {!reduced && (
          <span className="pa-v-upload absolute left-1/2 -ml-3 top-[54px] material-symbols-outlined text-[26px] text-chandan">
            upload
          </span>
        )}

        {/* the admin verification tick stamps down over the frame */}
        <span className="absolute top-1/2 left-1/2 -translate-y-1/2">
          <span
            className={`block w-[78px] h-[78px] rounded-full bg-leaf-500 border-4 border-chandan flex items-center justify-center ${
              reduced ? "-translate-x-1/2" : "pa-v-stamp"
            }`}
            style={{ boxShadow: "0 8px 20px rgba(0,0,0,.4)" }}
          >
            <span className="material-symbols-outlined material-symbols-filled text-[42px] text-white leading-none">check</span>
          </span>
        </span>
      </div>

      {/* the trust shield grows over the profile with a golden shimmer */}
      <span
        className={`material-symbols-outlined material-symbols-filled text-[46px] text-leaf-500 -mt-6 relative z-[2] ${
          reduced ? "" : "pa-v-shield"
        }`}
      >
        verified
      </span>
    </div>
  );
}

// स्वागत — Ruling #6 DEMONSTRATION (canon 9 celebration grammar): a canon
// Toran sways above, marigold petals drift down, and the real Diya glows
// over a breathing halo. The big CTA glows via the shell (pa-glowring), the
// footer orb speaks the welcome. reduced-motion rests on the lit still.
const WELCOME_PETALS = [
  { left: "12%", g: "🌼", size: 18, delay: "-0.4s", dur: "3.6s" },
  { left: "32%", g: "🌸", size: 15, delay: "-1.6s", dur: "4.2s" },
  { left: "58%", g: "🌼", size: 20, delay: "-0.9s", dur: "3.2s" },
  { left: "74%", g: "🌸", size: 16, delay: "-2.2s", dur: "4.5s" },
  { left: "88%", g: "🌼", size: 14, delay: "-1.2s", dur: "3.9s" },
] as const;

function SceneWelcome() {
  const reduced = useReduced();
  return (
    <div className="relative flex flex-col items-center" aria-hidden="true">
      {/* canon Toran sways above the welcome */}
      <div className="w-[220px]">
        <Toran variant="garland" count={9} />
      </div>
      {/* petals drift down while the Diya glows over a breathing halo */}
      <div className="relative flex items-center justify-center w-[220px] h-[150px] overflow-hidden">
        {!reduced &&
          WELCOME_PETALS.map((p, i) => (
            <span
              key={i}
              className="pa-petal absolute top-0 leading-none select-none"
              style={{ left: p.left, fontSize: p.size, animationDelay: p.delay, animationDuration: p.dur }}
            >
              {p.g}
            </span>
          ))}
        {!reduced && (
          <span
            className="pa-s-glow absolute left-1/2 top-1/2 w-[150px] h-[150px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(242,160,44,.45), transparent 70%)" }}
          />
        )}
        <span className="relative z-[2]">
          <Diya size={96} lit />
        </span>
      </div>
    </div>
  );
}

// ── The deck — canon 4→9 order. Narrations VERBATIM from
// strings.tutorial (spoken explanation); on-screen text stays ≤10 words.
function slideDefs(): SlideDef[] {
  return [
    // 5a कमाई — the heading lives INSIDE the scene (between count and stage)
    { title: t("tutorial.slide2Title"), narration: t("tutorial.slide2"), visual: () => <SceneKamai />, caption: null },
    // 5b नई बुकिंग — caption below the card; 🔔 is canon's own emoji
    { title: t("tutorial.slide6Title"), narration: t("tutorial.slide6"), visual: () => <SceneBooking />, role: "bell",
      caption: t("tutorial.capBooking"), captionClass: "text-[22px] font-extrabold text-saffron-700 font-hindi leading-tight" },
    // 5c शिष्य जगाएँ
    { title: t("tutorial.slide3Title"), narration: t("tutorial.slide3"), visual: () => <SceneSleep />, interactive: "mute",
      caption: t("tutorial.capSleep"), sub: t("tutorial.subSleep"), captionClass: "text-[23px] font-black text-saffron-700 font-hindi leading-tight" },
    // 5d आवाज़ (the mic frame)
    { title: t("tutorial.slide5Title"), narration: t("tutorial.slide5"), visual: null, interactive: "mic",
      caption: t("tutorial.capMic") },
    // 5e सत्यापन — the ONE green caption
    { title: t("tutorial.slide12Title"), narration: t("tutorial.slide12"), visual: () => <SceneVerify />,
      caption: t("tutorial.capVerify"), sub: t("tutorial.subVerify"), captionClass: "text-[24px] font-black text-leaf-700 font-hindi leading-tight" },
    // 5f स्वागत
    { title: t("tutorial.slide14Title"), narration: `${t("tutorial.slide14")} ${t("tutorial.rewatchNote")}`, visual: () => <SceneWelcome />, role: "cta",
      caption: t("tutorial.capWelcome"), sub: t("tutorial.subWelcome") },
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
  // Ruling #6: the आवाज़ demo respects reduced-motion like the scenes do.
  const reduced = useReduced();

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
          {/* canon 5f: caption + one-line sub — narration is voice-only */}
          <h2 className={CAPTION_HERO}>{def.caption ?? def.title}</h2>
          {def.sub && <p className={SUBCAPTION}>{def.sub}</p>}
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
              </div>
            ) : (
              def.visual?.()
            )}
          </Stage>
          {burst && <PetalBurst onEnd={() => setBurst(false)} />}
        </div>
        {/* canon 5a-5e: a short caption (+ optional sub) — never the
            narration paragraph; the explanation is voice-only (TTS). A
            null caption means the scene draws its own heading (5a). */}
        {def.caption !== null && (
          <h2 className={def.captionClass ?? CAPTION}>{def.caption ?? def.title}</h2>
        )}
        {def.sub && <p className={SUBCAPTION}>{def.sub}</p>}

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
