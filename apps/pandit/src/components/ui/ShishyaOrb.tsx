"use client";

// ─────────────────────────────────────────────────────────────
// शिष्य — Pandit ji's devoted disciple, the ONE voice control.
// Ported to canon (design/canon/Shishya.dc.html):
//   · States: AWAKE (breathing gold halo) · SPEAKING (gold ripples) ·
//     LISTENING (gold ring) · ASLEEP (grayscale + 💤). All driven by
//     voiceController.
//   · THE RIBBON: canon's say="…" is a VISIBLE sindoor speech bubble above
//     the orb — written word and spoken word travel together. One ribbon,
//     canon's own precedence: say wins; otherwise the listening/processing
//     fallback ("सुन रहा हूँ…" / "समझ रहा हूँ…") uses the SAME bubble.
//     Asleep suppresses the ribbon entirely (canon showRibbon logic).
//     - say present  → bubble renders IN-FLOW (mb 9px) — canon's centered-
//       strip frames budget this height.
//     - say absent   → the ephemeral fallback FLOATS above the orb
//       (absolute), so footer docks never reflow when a listen starts.
//   · Sizes are canon-numeric (56/60/62/66/72/76/82/96/118); glyph is
//     round(size × .46). Back-compat aliases: "md"→66, "lg"→118.
// Floors (Ruling #2): name label & asleep hint ≥15px (canon 11-12px).
// ─────────────────────────────────────────────────────────────

import React, { useRef, useSyncExternalStore } from "react";
import { voiceController } from "@/lib/voiceController";
import { t } from "@/lib/i18n";

export function ShishyaOrb({
  className = "",
  size = "md",
  showLabel = true,
  say,
  demoState,
  muteControl = "below",
}: {
  className?: string;
  /** Canon-numeric px (56…118). Aliases: "md"→66 (footer dock), "lg"→118 (hero). */
  size?: number | "md" | "lg";
  /** Canon `name` prop — frames with name="{{ false }}" (splash) hide it. */
  showLabel?: boolean;
  /** Ruling #9 — where the 'सुला दें' mute control renders. "below" (default):
   *  the orb draws it beneath the label. "relocated": the orb draws NOTHING and
   *  the LAYOUT must render <ShishyaMuteControl/> itself somewhere away from the
   *  primary CTA (MOVE-never-REMOVE, enforced by shishyaMuteRelocated.test.ts). */
  muteControl?: "below" | "relocated";
  /** Canon `say` — the visible speech ribbon above the orb. When set it
      renders in-flow; when absent the ribbon appears only as the floated
      listening/processing fallback. */
  say?: string;
  /** PRESENTATIONAL demo orb (canon tutorial frames 5c/5d draw Shishya in
      forced states). When set: the live voiceController state is ignored,
      the tap-to-sleep control is disabled, and no fallback ribbon renders —
      it is an illustration, never the ONE voice control. */
  demoState?: "awake" | "asleep" | "speaking" | "listening";
}) {
  const muted = useSyncExternalStore(
    voiceController.subscribe,
    () => voiceController.muted,
    () => false,
  );
  const speaking = useSyncExternalStore(
    voiceController.subscribe,
    () => voiceController.speaking,
    () => false,
  );
  const listening = useSyncExternalStore(
    voiceController.subscribe,
    () => voiceController.listening,
    () => false,
  );
  // J3d: speech ended, STT in flight — 'समझ रहा हूँ' beats dead air
  const processing = useSyncExternalStore(
    voiceController.subscribe,
    () => voiceController.processing,
    () => false,
  );
  const lastTapRef = useRef(0);

  // demoState short-circuits the live wiring (illustration, not control)
  const demo = demoState != null;
  const asleep = demo ? demoState === "asleep" : muted;
  const isSpeaking = demo ? demoState === "speaking" : speaking;
  const isListening = demo ? demoState === "listening" : listening;
  const isProcessing = demo ? false : processing;
  // Boring-pass E: gently breathe only when awake and quiet — never over a
  // speaking/listening/processing state (those own their own motion).
  const idle = !asleep && !isSpeaking && !isListening && !isProcessing;

  // Ruling #9: a TAP never silences. Asleep → wake (speaks greeting). Awake →
  // REPEAT (re-narrate the current screen), the single most useful action for a
  // confused elder — matching "the orb IS the shishya". Silencing is a separate
  // explicit 'सुला दें' control below. Rapid taps are debounced so REPEAT
  // restarts at most ~once/600ms rather than spam-restarting.
  const handleTap = () => {
    if (demo) return; // a demo orb is an illustration, not the control
    if (asleep) {
      voiceController.setMuted(false);
      return;
    }
    // Ruling #9 SECOND AMENDMENT (Isj, 2026-07-24): ONE control — the orb.
    // Awake tap = PERSISTENT sleep (parks audio across screens — the full
    // muted state, not an interrupt-current-line), ANNOUNCED first
    // (speak-then-mute survives via muteWithFarewell). Tap-repeat is retired;
    // "फिर से" by VOICE remains the hear-again path. Debounce guards a
    // double-tap from re-triggering the farewell.
    const now = Date.now();
    if (now - lastTapRef.current < 600) return;
    lastTapRef.current = now;
    voiceController.muteWithFarewell();
  };

  const px = typeof size === "number" ? size : size === "lg" ? 118 : 66;
  const large = px >= 100;
  const glyphPx = Math.round(px * 0.46);

  // Canon ribbon precedence (Shishya.dc.html renderVals):
  //   ribbonText = say || (listening ? 'सुन रहा हूँ…' : '') — processing is
  //   the app's J3d extension slotted into the same fallback chain.
  const fallbackText =
    !demo && !asleep && (isProcessing || isListening)
      ? isProcessing
        ? t("voiceLoop.understanding")
        : t("voiceLoop.listening")
      : "";
  const ribbonText = say || fallbackText;
  const showRibbon = !asleep && !!ribbonText;
  const ribbonFloats = !say; // ephemeral fallback must never reflow a dock

  // Canon bubble, verbatim (14px→15px label floor): sindoor fill, cream ink,
  // r16, lifted shadow, rotated-square tail. Keyed by text so a phrase
  // change replays the .4s entrance.
  const ribbon = showRibbon ? (
    <div
      key={ribbonText}
      className="pa-sh-ribbon relative font-hindi font-semibold text-center"
      style={{
        width: "max-content",
        maxWidth: 250,
        background: "#B23A1A",
        color: "#FFF6E9",
        fontSize: "15px",
        lineHeight: 1.35,
        padding: "9px 15px",
        borderRadius: 16,
        boxShadow: "0 6px 16px rgba(178,58,26,.3)",
        ...(ribbonFloats
          ? {
              position: "absolute" as const,
              bottom: "calc(100% + 9px)",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 60,
              whiteSpace: "nowrap" as const,
            }
          : { marginBottom: 9 }),
      }}
    >
      {ribbonText}
      <span
        className="absolute left-1/2"
        style={{
          bottom: -5,
          transform: "translateX(-50%) rotate(45deg)",
          width: 12,
          height: 12,
          background: "#B23A1A",
          borderRadius: 2,
        }}
        aria-hidden="true"
      />
    </div>
  ) : null;

  return (
    // ── ORB COLUMN CONTRACT (2026-07-24, QA harsh-pass finding) ─────────────
    // This column is a FIXED (px+12) ANCHOR footprint — deliberately narrow so
    // footers and docks centre the orb consistently — with overflow:visible.
    // THEREFORE: any child WIDER than ~84px must SELF-ESCAPE with
    // `w-max` + `whitespace-nowrap` (or style width:max-content, as the say-
    // ribbon does), or it will be squeezed and wrap — two children (the सुला-दें
    // pill and the asleep wake-hint) already broke this before it was written
    // down. orbColumnContract.test.ts enforces it: every text-bearing child
    // must carry the escape or be registered there as provably narrow.
    <div
      className={`relative flex flex-col items-center ${className}`}
      style={{ width: px + 12, overflow: "visible" }}
    >
      {ribbon}

      <button
        onClick={handleTap}
        disabled={demo}
        tabIndex={demo ? -1 : undefined}
        aria-hidden={demo || undefined}
        aria-label={demo ? undefined : asleep ? t("shishya.a11ySleep") : t("shishya.a11yMute")}
        className={`relative rounded-full flex items-center justify-center transition-all ${demo ? "" : "active:scale-95"} ${
          asleep
            ? // asleep keeps the grounding shadow but never glows
              "shishya-asleep shishya-orb-ground"
            : isListening
            ? // the listen ring animation carries the grounding shadow itself
              "bg-saffron-500 border-4 border-gold shishya-listen-ring"
            : idle
            ? // CANON: idle breathes a GOLD HALO on the orb (this animation
              // includes the grounding shadow in both keyframes)
              "bg-saffron-500 border-4 border-gold shishya-breathe-halo"
            : "bg-saffron-500 border-4 border-gold shishya-orb-ground"
        }`}
        style={{ width: px, height: px, minWidth: px, minHeight: px }}
      >
        {/* SPEAKING ripples */}
        {isSpeaking && !asleep && (
          <>
            <span className="shishya-ripple" aria-hidden="true" />
            <span className="shishya-ripple shishya-ripple-2" aria-hidden="true" />
          </>
        )}
        {/* CANON: the glyph carries its own drop-shadow so it reads as
            resting IN the orb rather than printed on it. Size = round(px·.46). */}
        <span
          className="leading-none select-none"
          style={{ fontSize: glyphPx, filter: "drop-shadow(0 1px 1px rgba(0,0,0,.15))" }}
          aria-hidden="true"
        >
          🙏
        </span>
        {asleep && (
          <span
            className="absolute -top-1 -right-1 text-[17px] leading-none select-none"
            aria-hidden="true"
          >
            💤
          </span>
        )}
      </button>

      {showLabel && (
        <span
          className={`font-hindi ${
            large
              ? // canon Shishya.dc.html: 18px / 800 / +.3px / mt 5px at size≥100
                "mt-[5px] text-[18px] font-extrabold tracking-[0.3px]"
              : // canon 12px → held at the 15px label floor (Ruling #2)
                "mt-[5px] text-[15px] font-extrabold tracking-[0.3px]"
          } ${asleep ? "text-softgrey" : "text-saffron-500"}`}
        >
          {t("shishya.name")}
        </span>
      )}

      {/* Wake-hint REMOVED (Isj ruling, 2026-07-24): redundant — the toggle
          pill ("जगाइए") is the SINGLE wake affordance, same one-gesture pattern
          as the splash. The orb tap still wakes as a harmless second path
          (Ruling #9 amendment). */}

      {/* Ruling #9: the deliberate mute is a VISIBLE, LABELLED control. Default
          "below" draws it here; layouts that would sit it beside a primary CTA
          pass muteControl="relocated" and render <ShishyaMuteControl/> elsewhere
          (MOVE-never-REMOVE). ShishyaMuteControl self-hides while asleep (the
          orb then shows the wake hint). */}
      {muteControl === "below" && !demo && showLabel && <ShishyaMuteControl className="mt-1.5" />}
    </div>
  );
}

/**
 * Ruling #9 — the deliberate mute control ('सुला दें'). A VISIBLE, ≥52px,
 * Devanagari-labelled button (never a hidden gesture — long-press failed the
 * SOS persona test, and mute is often urgent). It routes through
 * voiceController.muteWithFarewell (speak the farewell, THEN silence + release
 * mic). Self-hides while asleep. Standalone so a layout can place it clear of
 * its primary CTA. LAW: never adjacent to a primary action.
 */
export function ShishyaMuteControl({ className = "" }: { className?: string }) {
  const muted = useSyncExternalStore(
    voiceController.subscribe,
    () => voiceController.muted,
    () => false,
  );
  // Ruling #9 SECOND AMENDMENT (Isj, 2026-07-24): ONE control — the orb.
  // AWAKE: no pill at all (the orb tap IS the persistent sleep, announced
  // first). ASLEEP: this जगाइए pill + the dimmed orb both wake. ≥52px,
  // Devanagari at rest, column escape classes — all stand.
  if (!muted) return null;
  return (
    <button
      onClick={() => voiceController.setMuted(false)}
      aria-label={t("shishya.a11yWakeControl")}
      className={`min-h-[52px] px-3.5 flex items-center justify-center gap-1.5 whitespace-nowrap w-max mx-auto rounded-full bg-card border border-saffron-200 shadow-card active:scale-95 transition-transform ${className}`}
    >
      <span className="material-symbols-outlined text-[19px] leading-none text-softgrey" aria-hidden="true">
        light_mode
      </span>
      <span className="text-[15px] font-bold font-hindi text-softgrey leading-none">
        {t("shishya.wakeControl")}
      </span>
    </button>
  );
}

export default ShishyaOrb;
