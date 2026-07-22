"use client";

// ─────────────────────────────────────────────────────────────
// VoiceController — the single owner of the app's voice state.
// Wraps Sarvam TTS (shared <audio> in sarvam-tts.ts) + Web Speech
// fallback, and arbitrates between speaking and listening:
//   • one master mute ('voice_master') for ALL voice interaction
//   • queue depth 1 (newest wins) while the mic is open
//   • guardListenStart(): the mic may never open while speaking
// useVoice / useVoiceInput delegate here; screens keep their APIs.
// ─────────────────────────────────────────────────────────────

import { t, getActiveBcp47 } from "@/lib/i18n";
import { clientPace } from "@/lib/sarvam-tts";
import { VOICE_PROFILE, VOICE_PROFILE_VERSION } from "@/lib/voiceProfile";
import { YES, NO, NEXT, BACK, SKIP, REPEAT, HELP, STOP, SLEEP, UNDO_PHRASES, matchAny, matchWord, matchYesNo, normalizeForMatch } from "@/lib/voiceGrammar";
import { isQuestionShaped, recordUnansweredQuestion, askShishyaServer } from "@/lib/shishyaBrain";
import {
  SHISHYA_MODE,
  askShishyaAgent,
  resetAgentHistory,
  setAgentDebugSink,
  type AgentAction,
} from "@/lib/shishyaAgent";
import { isForbiddenCategory, type ActionCategory } from "@/lib/shishyaPuppet";

// ── J1: SCREEN VOICE CONTEXT ─────────────────────────────────
// Every screen registers its commands here (useVoiceScreen /
// useVoiceCommands). ANY armed listener (a VoiceField falling through,
// or the screen's own command listen) resolves transcripts against the
// ACTIVE (topmost) entry, then the global grammar (REPEAT / मदद /
// सो जाओ). Unmatched speech re-arms silently — at most one gentle line
// per 30s per screen.
export interface VoiceCommand {
  keywords: readonly string[];
  action: () => void;
  /** Optional spoken ack (static lines ride the TTS cache → ~10ms). */
  confirmSpeech?: string;
  /** W3: stable tool id the AGENT may return as `act` (e.g.
   *  "toggle-offline"). Omitted → a positional id is derived. */
  id?: string;
  /** W4b: match ONLY when the whole normalized utterance equals a
   *  keyword. For one-word answers (हाँ/नहीं) whose words also appear
   *  inside real sentences — "ये स्क्रीन समझ नहीं आई" must reach the
   *  agent, not the NO command. */
  pure?: boolean;
  /** W3: human label the agent reads in its tool list (defaults to
   *  keywords[0]). */
  label?: string;
  /** Guide Mode (A5): the action taxonomy. Drives the ONE money/identity
   *  boundary — a `money`/`identity` command is a terminal press the puppet
   *  and the agent may LOCATE but never COMPLETE (shishyaPuppet forbidden set).
   *  `field` (fill an input with the pandit's OWN value) stays completable. */
  category?: ActionCategory;
  /** Guide Mode (A2 locate): getter for the on-screen element this action
   *  drives, so Shishya can scroll it into view + ring it + point the cursor. */
  ref?: () => HTMLElement | null;
}

interface VoiceScreenEntry {
  id: number;
  commands: readonly VoiceCommand[];
  helpText?: string;
  lastUnmatchedAt: number;
  /** L7 FLOW SANCTITY: on a critical money/KYC flow (booking accept-confirm,
   *  bank/UPI/Aadhaar) the agent may ANSWER but never ACT or navigate — it
   *  contributes ZERO tools and any returned act is dropped. */
  critical?: boolean;
}

// Q3: EVERY VISIBLE CHOICE IS SPEAKABLE. Choice UIs (puja cards, samagri
// tiers, city cards, celebration buttons) register their printed labels;
// speaking a label (or a contained part of it — "सत्यनारायण" hits
// "सत्यनारायण कथा") taps the card.
export interface VoiceOption {
  label: string;
  keywords?: readonly string[];
  onSelect: () => void;
}

/** How an utterance actually concluded. 'parked' = queued awaiting the
 *  first-gesture unlock — A HUMAN HAS NOT TOUCHED THE APP YET; callers
 *  must not proceed on timers in that case. */
export type SpeakOutcome = "ended" | "interrupted" | "parked" | "muted" | "failed";

type SpeakOpts = {
  interrupt?: boolean;
  onEnd?: (completed: boolean) => void;
  /** Fine-grained conclusion (in addition to the boolean onEnd). */
  onOutcome?: (status: SpeakOutcome) => void;
  /** BCP-47 override for lines that must sound in a specific language
   *  (e.g. the language-confirm ceremony). Default: the ACTIVE app language. */
  languageCode?: string;
  /** S3: the line instructs pressing THIS control — it glows (gold pulse
   *  ring, no dim) from utterance start until any gesture or the 10s
   *  failsafe. A new utterance replaces/clears the highlight. */
  highlightRef?: { current: HTMLElement | null };
};

const MASTER_KEY = "voice_master";
// Once-per-session flag for the "voice unavailable" toast (X2b)
const VOICE_UNAVAILABLE_SHOWN = "hpj_voice_unavailable_shown";
// Once-per-session flag for the "tap to hear" toast (A3)
const TAP_TO_HEAR_SHOWN = "hpj_tap_to_hear_shown";
// F4: user-caused/expected speech stops — logged as info, never flagged.
// Everything else stopping a line mid-air stays a ⚠ tell. Beyond the
// exact reasons, two designed families are user-caused without an
// in-page pointer event (so barge-in:tap can never pre-clear them):
// *:grant-settle (the Meet-style cut when the user taps Allow on native
// browser chrome) and hardware-back:* (Android back = popstate).
// G3a: 'speak-interrupt' IS the newest-wins queue law working as
// designed (a newer line replacing an older one) — intentional, not a
// mid-utterance bug signature. ⚠ remains for phase-transition /
// unmount:* / unknown.
// Q5 'voice-stop' (spoken रुको) and Q7 'user-flow:*' (a user-initiated
// async flow — geolocation settle, OTP verify, form submit — carrying
// its intent to the navigation it causes) are the pandit's own doing.
const INTENTIONAL_STOPS = new Set(["tab-hidden", "barge-in:tap", "mute", "speak-interrupt", "voice-stop"]);
function isIntentionalStop(reason: string): boolean {
  return (
    INTENTIONAL_STOPS.has(reason) ||
    reason.endsWith(":grant-settle") ||
    reason.startsWith("hardware-back:") ||
    reason.startsWith("user-flow:")
  );
}

// 4 samples of silence — played MUTED on the first pointerdown to satisfy
// the browser's autoplay gesture requirement (X2a audio unlock)
const SILENT_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAA";

// Legacy flags migrated on first load: either being explicitly "false"
// means the pandit had turned voice off.
function readInitialMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const master = localStorage.getItem(MASTER_KEY);
    if (master !== null) return master === "muted";
    const legacyOut = localStorage.getItem("voice_enabled");
    const legacyIn = localStorage.getItem("voice_input_enabled");
    const muted = legacyOut === "false" || legacyIn === "false";
    localStorage.setItem(MASTER_KEY, muted ? "muted" : "on");
    return muted;
  } catch {
    return false;
  }
}

export type LoopState = "NARRATING" | "LISTENING" | "CONFIRMING" | "PAUSED" | "IDLE";

class VoiceController {
  private _muted = false;
  private _speaking = false;
  private speakingSince = 0; // L-A: when the current utterance began (watchdog stuck-narration net)
  private hiddenSince = 0; // L-D: when the tab went hidden (audible resume-cue debounce)
  // L-C: a command/nav/mute is an ACTION and must clear the SAME confidence
  // floor the field-value path uses (voiceFieldMachine 0.55). Sub-floor noise
  // that Deepgram renders as a grammar word must never silently execute.
  private readonly COMMAND_CONFIDENCE_FLOOR = 0.55;
  // H6 UNDO: the last REVERSIBLE (toggle/value) commit, revertable by voice
  // within 60s. Money/identity actions NEVER register here (registerUndo
  // refuses them via the puppet/agent deny-list). `consumed` makes a double
  // "वापस करो" idempotent.
  private lastUndoable: { actionId: string; revertFn: () => void; label: string; at: number; epoch: number; consumed: boolean } | null = null;
  private lastForbiddenLabel = ""; // last money/identity action (for the "can't undo" explanation)
  private lastForbiddenAt = 0;
  private _listening = false;
  private _hidden = false;
  private _confirming = false;
  // F02-06: a spoken menu choice is CONFIRMED before it commits, exactly like
  // a spoken field value. While an option is pending, the next हाँ commits it,
  // नहीं cancels it, and any other utterance re-matches (a correction). Cleared
  // on any screen change so a stale choice can never fire on the next screen.
  private _pendingOption: VoiceOption | null = null;
  // F02-09: deletion is DOUBLE-confirmed. "हटा दो" targets the most recent
  // registered deletable (a filled VoiceField); stage 1 asks, stage 2 asks
  // "क्या आप निश्चित हैं?", only then does the clear run. पीछे NEVER deletes —
  // navigation and deletion are different words by law.
  private _pendingDelete: { label: string; run: () => void; stage: 1 | 2 } | null = null;
  private deletables: Array<{ label: string; run: () => void }> = [];
  private queued: { text: string; opts?: SpeakOpts } | null = null;
  private replayFn: (() => void) | null = null;
  private listeners = new Set<() => void>();
  private initialized = false;

  // ── AUDIO UNLOCK (X2a/A3) ──────────────────────────────────
  // No sound may play before the app's first pointerdown (autoplay policy).
  // Pre-gesture speak()s park here (newest wins) and flush on unlock.
  private _unlocked = false;
  private pendingUnlock: { text: string; languageCode?: string } | null = null;
  // H1: the deferred flush timer — a barge-in tap (interactive target)
  // cancels it: the pandit is NAVIGATING, so re-speaking the screen he
  // is leaving would only get beheaded by its unmount. A splash tap has
  // no interactive target → no barge-in → the flush plays as designed.
  private pendingFlushTimer: ReturnType<typeof setTimeout> | null = null;
  // H1: every tap's timestamp — an unmount:* stop right after a tap is
  // user-caused navigation, not the mid-utterance bug signature.
  private lastPointerdownAt = 0;
  // K3: voice commands ARE gestures — a nav-teardown stop right after a
  // registry command executed (or a voice-accepted field value) is the
  // pandit navigating by voice, same as a tap.
  private lastVoiceCommandAt = 0;

  // T3: recorder heartbeat — useVoiceInput stamps this on every RMS
  // tick and STT lifecycle step; the zombie detector reads it.
  private lastListenActivityAt = 0;
  noteListenActivity(): void {
    this.lastListenActivityAt = performance.now();
  }

  /** Stamp the voice-gesture clock (registry command ran / field value
   *  accepted by voice). Consulted by the stopSpeech classifier. */
  noteVoiceGesture(): void {
    this.lastVoiceCommandAt = performance.now();
    // S3: a gesture (spoken or tapped) dismisses the narration highlight
    this.clearHighlight();
  }

  // ── S3: narration-synced control highlight ─────────────────
  private _highlight: { el: () => HTMLElement | null; seq: number } | null = null;
  private highlightSeq = 0;
  get highlight(): { el: () => HTMLElement | null; seq: number } | null {
    return this._highlight;
  }
  private setHighlight(ref: { current: HTMLElement | null } | undefined): void {
    if (!ref) {
      this.clearHighlight();
      return;
    }
    this._highlight = { el: () => ref.current, seq: ++this.highlightSeq };
    this.debug("highlight: mounted (narration)");
    this.emit();
  }
  clearHighlight(): void {
    if (!this._highlight) return;
    this._highlight = null;
    this.emit();
  }

  // ── S5: mic custody — ONE persistent stream across listen cycles ──
  // During NARRATION its audio tracks are DISABLED (Android ducks media
  // volume while a capture session is live); LISTEN re-enables them.
  // Sleep / tab-hidden hard-release the stream (privacy: सो जाओ means
  // the mic is truly off). Strategy constant: MIC_RELEASE_STRATEGY
  // (module export below the class).
  private micStream: MediaStream | null = null;

  adoptMicStream(stream: MediaStream): void {
    this.probeMicStrategyOnce(); // U4: pick the safe strategy for this device
    // V2a: a live mic session is exactly when the screen must not dim
    this.acquireWakeLock();
    if (this.micStream === stream) return;
    this.releaseMicStream("replaced");
    this.micStream = stream;
    this.debug("mic: stream adopted (persists across listens)");
    // V2b: the track testifies its own health — log + clock every event
    stream.getAudioTracks().forEach((tr) => {
      tr.onmute = () => {
        this.micTrackMutedSince = performance.now();
        this.debug("mic-track: muted");
      };
      tr.onunmute = () => {
        this.micTrackMutedSince = 0;
        this.debug("mic-track: unmuted");
      };
      tr.onended = () => this.debug("mic-track: ended");
    });
  }
  getMicStream(): MediaStream | null {
    if (
      this.micStream &&
      this.micStream.getAudioTracks().some((tr) => tr.readyState === "live")
    ) {
      return this.micStream;
    }
    this.micStream = null;
    return null;
  }
  setMicTracksEnabled(v: boolean, why: string): void {
    const s = this.getMicStream();
    if (!s) return;
    let changed = false;
    s.getAudioTracks().forEach((tr) => {
      if (tr.enabled !== v) {
        tr.enabled = v;
        changed = true;
      }
    });
    if (changed) this.debug(`mic: tracks ${v ? "ENABLED" : "disabled"} (${why})`);
  }
  // ── V2a SCREEN WAKE LOCK ───────────────────────────────────
  // Android dims → suspends capture → the founder's 2-minute deafness.
  // While शिष्य is awake + mic granted + page visible, hold the screen
  // awake; retake it whenever the OS lets go; release on sleep/hidden.
  private wakeLock: { release?: () => Promise<void>; addEventListener?: (t: string, cb: () => void) => void } | null = null;
  private wakeLockUnsupportedLogged = false;
  private wakeLockRetaking = false;

  acquireWakeLock(tag: "acquired" | "reacquired" = "acquired"): void {
    if (this.wakeLock || this.paused || !this.micGranted()) return;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: string) => Promise<never> } };
    if (!nav.wakeLock?.request) {
      if (!this.wakeLockUnsupportedLogged) {
        this.wakeLockUnsupportedLogged = true;
        this.debug("wakelock: unsupported");
      }
      return;
    }
    void nav.wakeLock
      .request("screen")
      .then((lock: { release?: () => Promise<void>; addEventListener?: (t: string, cb: () => void) => void }) => {
        this.wakeLock = lock;
        this.debug(`wakelock: ${tag}`);
        lock.addEventListener?.("release", () => {
          const wasCurrent = this.wakeLock === lock;
          if (wasCurrent) this.wakeLock = null;
          this.debug("wakelock: released");
          // the OS took it (dim attempt / tab switch) — take it back
          // when still eligible, shortly after
          if (wasCurrent && !this.wakeLockRetaking) {
            this.wakeLockRetaking = true;
            setTimeout(() => {
              this.wakeLockRetaking = false;
              this.acquireWakeLock("reacquired");
            }, 400);
          }
        });
      })
      .catch((err: unknown) => {
        this.debug(`wakelock: failed(${(err as Error)?.name || err})`);
      });
  }

  releaseWakeLock(why: string): void {
    const l = this.wakeLock;
    this.wakeLock = null;
    if (l) {
      try { void l.release?.(); } catch { /* noop */ }
      this.debug(`wakelock: released (${why})`);
    }
  }

  // V2b: track-health clocks — set by the mic track's own mute/ended
  // events; the watchdog resurrects on ended or muted>3s.
  private micTrackMutedSince = 0;
  private micResurrecting = false;

  private resurrectMic(reason: string): void {
    if (this.micResurrecting) return;
    this.micResurrecting = true;
    this.debug(`mic: resurrecting (${reason})…`);
    this.releaseMicStream(`resurrect (${reason})`);
    this.micTrackMutedSince = 0;
    navigator.mediaDevices
      .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
      .then((stream) => {
        this.micResurrecting = false;
        this.adoptMicStream(stream);
        this.debug(`mic: resurrected (${reason})`);
        this.abortListening();
        this.loopRearm(0);
      })
      .catch((err: unknown) => {
        this.micResurrecting = false;
        this.debug(`mic: resurrection failed (${(err as Error)?.name || err})`);
        try { window.dispatchEvent(new CustomEvent("hpj-mic-stuck")); } catch { /* noop */ }
        // one sanctioned next-gesture retry: a real tap re-opens the mic
        try {
          document.addEventListener(
            "pointerdown",
            () => { if (!this.getMicStream() && this.micGranted()) this.resurrectMic("next-gesture"); },
            { once: true, capture: true },
          );
        } catch { /* noop */ }
      });
  }

  // ── U4 PERMISSION LOGIC LAW ────────────────────────────────
  // The mic prompt may appear at exactly ONE designed moment (Parichay,
  // plus its explicit retry button) — NOWHERE else, EVER. T2's 'stop'
  // strategy re-acquires between narrations; on Chromes where a fully
  // closed stream re-prompts, that would violate the law. So the
  // strategy SELF-SELECTS per device: 'mute' (keep stream, disable
  // tracks — zero re-prompt risk) until permissions.query PROVES
  // 'granted'; then 'stop' (full release, the T2 tone fix). Devices
  // without the permissions API stay 'mute' forever. Persisted.
  private micStrategy: "stop" | "mute" = "mute";
  private micStrategyProbed = false;

  effectiveMicStrategy(): "stop" | "mute" {
    return this.micStrategy;
  }

  private probeMicStrategyOnce(): void {
    if (this.micStrategyProbed) return;
    this.micStrategyProbed = true;
    try {
      const stored = localStorage.getItem("hpj_mic_strategy");
      if (stored === "stop" || stored === "mute") {
        this.micStrategy = stored;
        this.debug(`mic: strategy=${stored} (stored)`);
        return;
      }
    } catch { /* noop */ }
    if (MIC_RELEASE_STRATEGY !== "stop") return; // desired default is mute
    try {
      if (!navigator.permissions?.query) {
        this.micStrategy = "mute";
        try { localStorage.setItem("hpj_mic_strategy", "mute"); } catch { /* noop */ }
        this.debug("mic: strategy=mute (no permissions API — re-prompt risk)");
        return;
      }
      void navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((st) => {
          if (st.state === "granted") {
            this.micStrategy = "stop";
            try { localStorage.setItem("hpj_mic_strategy", "stop"); } catch { /* noop */ }
            this.debug("mic: strategy=stop (permission granted — silent reacquire proven safe)");
          } else {
            this.micStrategy = "mute";
            try { localStorage.setItem("hpj_mic_strategy", "mute"); } catch { /* noop */ }
            this.debug(`mic: strategy=mute (re-prompt risk, state=${st.state})`);
          }
        })
        .catch(() => {
          this.micStrategy = "mute";
          this.debug("mic: strategy=mute (permissions query failed)");
        });
    } catch {
      this.micStrategy = "mute";
    }
  }

  releaseMicStream(why: string): void {
    if (!this.micStream) return;
    this.micStream.getTracks().forEach((tr) => tr.stop());
    this.micStream = null;
    this.debug(`mic: released (${why})`);
  }
  // H1: barge-in timestamp — listener order on document is not ours to
  // control (VoiceRoot's barge-in can run BEFORE the unlock listener in
  // the same pointerdown), so the flush consults this instead of relying
  // on the timer already existing when the barge-in lands.
  private lastBargeInAt = 0;
  // A3: ONE persistent element carries every Sarvam playback — the silent
  // unlock play binds the autoplay permission to this exact element.
  private audioEl: HTMLAudioElement | null = null;
  private currentObjectUrl: string | null = null;

  // ── ON-DEVICE DEBUG (A1, ?voicedebug=1) ────────────────────
  // Immutable ring buffer so useSyncExternalStore sees fresh snapshots.
  private debugBuf: readonly string[] = [];
  private debugListeners = new Set<() => void>();

  private debugPersistTimer: ReturnType<typeof setTimeout> | null = null;
  private debugRestored = false;

  debug(msg: string): void {
    if (typeof window === "undefined") return;
    // Q9c: reloads must not wipe evidence — restore once, then write
    // through (throttled) to sessionStorage; cap unchanged (200).
    if (!this.debugRestored) {
      this.debugRestored = true;
      try {
        const saved = sessionStorage.getItem("hpj_voicedebug_buf");
        if (saved) this.debugBuf = [...(JSON.parse(saved) as string[]), ...this.debugBuf].slice(-200);
      } catch { /* noop */ }
    }
    const ts = new Date().toISOString().slice(11, 23);
    this.debugBuf = [...this.debugBuf.slice(-199), `${ts} ${msg}`];
    this.debugListeners.forEach((cb) => cb());
    if (!this.debugPersistTimer) {
      this.debugPersistTimer = setTimeout(() => {
        this.debugPersistTimer = null;
        try {
          sessionStorage.setItem("hpj_voicedebug_buf", JSON.stringify(this.debugBuf));
        } catch { /* noop */ }
      }, 400);
    }
    // the lines logged right BEFORE a reload are the evidence this
    // feature exists for — flush synchronously on pagehide
    if (!this.debugFlushBound) {
      this.debugFlushBound = true;
      try {
        window.addEventListener("pagehide", () => {
          try {
            sessionStorage.setItem("hpj_voicedebug_buf", JSON.stringify(this.debugBuf));
          } catch { /* noop */ }
        });
      } catch { /* noop */ }
    }
  }
  private debugFlushBound = false;

  subscribeDebug = (cb: () => void): (() => void) => {
    this.debugListeners.add(cb);
    return () => {
      this.debugListeners.delete(cb);
    };
  };

  getDebugLines = (): readonly string[] => this.debugBuf;

  // ── G2: PLAYBACK-START CHANNEL ─────────────────────────────
  // Fires the moment an utterance ACTUALLY begins sounding (audio
  // play() resolved, or the speechSynthesis fallback engaged). The
  // splash's post-tap flush failsafe subscribes here: once playback has
  // started, only the utterance's natural end may advance — no timer.
  private playbackStartListeners = new Set<() => void>();

  onPlaybackStart = (cb: () => void): (() => void) => {
    this.playbackStartListeners.add(cb);
    return () => {
      this.playbackStartListeners.delete(cb);
    };
  };

  private notifyPlaybackStart(): void {
    this.playbackStartListeners.forEach((cb) => {
      try {
        cb();
      } catch {
        /* noop */
      }
    });
  }

  // DEV-ONLY permission simulator (?voicedebug companion): lets a tester
  // force the mic-permission outcome without touching browser settings.
  // sessionStorage hpj_perm_sim = grant | dismiss | denied | nomic.
  // Stripped from production builds by the NODE_ENV guard.
  private installPermSim(): void {
    if (process.env.NODE_ENV === "production") return;
    let sim: string | null = null;
    try {
      sim = sessionStorage.getItem("hpj_perm_sim");
    } catch { /* noop */ }
    if (!sim) return;
    this.debug(`⚠ PERM SIM ACTIVE: ${sim} (dev only)`);
    const mkErr = (name: string) => Object.assign(new Error(`sim:${name}`), { name });
    const delayReject = (name: string, ms: number) =>
      new Promise<MediaStream>((_, rej) => setTimeout(() => rej(mkErr(name)), ms));
    // stateful, like a real browser: flips to granted/denied when the
    // simulated prompt settles
    let queryState: PermissionState =
      sim === "grant" ? "prompt" : sim === "denied" ? "denied" : sim === "pregranted" ? "granted" : "prompt";
    try {
      navigator.permissions.query = () =>
        Promise.resolve({ state: queryState, onchange: null } as unknown as PermissionStatus);
    } catch { /* noop */ }
    try {
      navigator.mediaDevices.getUserMedia = () => {
        if (sim === "grant" || sim === "pregranted") {
          return new Promise<MediaStream>((res) =>
            setTimeout(() => {
              queryState = "granted";
              const ctx = new AudioContext();
              res(ctx.createMediaStreamDestination().stream);
            }, sim === "grant" ? 900 : 100),
          );
        }
        if (sim === "nomic") return delayReject("NotFoundError", 300);
        if (sim === "denied") return delayReject("NotAllowedError", 300);
        return delayReject("NotAllowedError", 1200); // dismiss
      };
    } catch { /* noop */ }
  }

  /**
   * D3 NO-SELF-INTERRUPTION LAW: app-initiated transitions must wait for
   * शिष्य. Resolves with HOW the line concluded. DEFAULT RULE for
   * callers: status 'parked' means a human has not touched the app yet —
   * do NOT proceed on timers; wait for the first gesture instead.
   */
  speakAndWait(
    text: string,
    opts?: Omit<SpeakOpts, "onEnd" | "onOutcome">,
  ): Promise<{ status: SpeakOutcome }> {
    return new Promise((resolve) => {
      this.speak(text, { ...opts, onOutcome: (status) => resolve({ status }) });
    });
  }

  private _e2e = false;
  /** E2E traversal mode — native permission prompts are never invoked. */
  get e2e(): boolean {
    this.init();
    return this._e2e;
  }

  /** Playback-unlock state + element snapshot (Parichay instrumentation). */
  get unlocked(): boolean {
    return this._unlocked;
  }
  audioElState(): string {
    if (!this.audioEl) return "audioEl=none";
    return `audioEl paused=${this.audioEl.paused} src=${this.audioEl.currentSrc ? "set" : "empty"}`;
  }

  private getAudioEl(): HTMLAudioElement {
    if (!this.audioEl) {
      this.audioEl = new Audio();
      this.audioEl.preload = "auto";
    }
    return this.audioEl;
  }

  // ── TTS CHAIN (X2b) ────────────────────────────────────────
  // Primary: POST /api/tts (Sarvam) played through an <audio> element.
  // U1b FALLBACK POLICY: once Sarvam succeeds this session, its
  // failures retry x2 then go SILENT (+toast) — the robot voice never
  // intrudes mid-session; webspeech only in never-succeeded outages.
  private sarvamEverSucceeded = false;
  // U0d: ground truth from /api/tts's x-voice header (speaker@pace)
  private lastVoiceGroundTruth: string | null = null;

  // Fallback: speechSynthesis hi-IN via voice-engine (logged once).
  // 501 tts_unconfigured / 503 → stop asking the endpoint this session.
  private remoteTtsDown = false;
  private fallbackLogged = false;
  private speechSeq = 0;
  private remoteCancel: (() => void) | null = null;

  // ── ALWAYS-LISTENING LOOP ──────────────────────────────────
  // Screens register auto-listen targets: the active VoiceField (priority
  // 1) or the screen's command registry (priority 0). After ANY speech
  // ends and after ANY listen resolves, the loop quietly re-arms the top
  // target — forever, until PAUSED (muted / tab hidden / micDenied).
  private autoTargets: Array<{ priority: number; arm: () => void | boolean }> = [];
  private rearmTimer: ReturnType<typeof setTimeout> | null = null;

  // ── J1: screen command registry (stack — last mounted = active) ──
  private voiceScreens: VoiceScreenEntry[] = [];
  private voiceScreenSeq = 0;
  // L5 TRANSCRIPT PROVENANCE: bumps whenever the active screen set changes
  // (a navigation mounts/unmounts a voice screen). A listen captures this
  // at arm; a transcript that resolves after the epoch moved is DROPPED —
  // so a "हाँ" spoken on screen A can never fire screen B's action.
  private screenEpoch = 0;
  currentScreenEpoch(): number {
    return this.screenEpoch;
  }
  // J3d: 'समझ रहा हूँ' — speech ended, STT in flight
  private _processing = false;

  registerVoiceScreen(
    commands: readonly VoiceCommand[],
    helpText?: string,
    opts?: { critical?: boolean },
  ): () => void {
    const entry: VoiceScreenEntry = {
      id: ++this.voiceScreenSeq,
      commands,
      helpText,
      lastUnmatchedAt: 0,
      critical: opts?.critical,
    };
    this.voiceScreens.push(entry);
    this.screenEpoch++; // L5: the active screen changed (navigation/mount)
    this._pendingOption = null; // F02-06: never carry a pending choice across screens
    return () => {
      this.voiceScreens = this.voiceScreens.filter((e) => e !== entry);
      this.screenEpoch++; // L5: and again on unmount
      this._pendingOption = null;
    };
  }

  /** L7: true when the topmost registered screen is a critical money/KYC
   *  flow. Public so the guard test can assert agent suppression. */
  isActiveScreenCritical(): boolean {
    return !!this.activeVoiceScreen()?.critical;
  }

  /** L7: test seam — the exact tool list the agent would receive for the
   *  active screen (empty on a critical flow). */
  agentActionsForActiveScreen(): AgentAction[] {
    return this.buildAgentActions();
  }

  // ── Q3: on-screen option registry (stack — newest group first) ──
  private voiceOptionGroups: Array<{ options: readonly VoiceOption[] }> = [];

  registerOptions(options: readonly VoiceOption[]): () => void {
    const group = { options };
    this.voiceOptionGroups.push(group);
    return () => {
      this.voiceOptionGroups = this.voiceOptionGroups.filter((g) => g !== group);
      // if the pending choice belonged to this group, drop it
      if (this._pendingOption && group.options.includes(this._pendingOption)) {
        this._pendingOption = null;
      }
    };
  }

  /** F02-06 test seam: the label of the choice currently awaiting हाँ/नहीं,
   *  or null. Lets the confirmation flow be asserted without a live loop. */
  pendingOptionLabel(): string | null {
    return this._pendingOption?.label ?? null;
  }

  // ── F02-09: deletable registry (a filled VoiceField registers itself) ──
  registerDeletable(label: string, run: () => void): () => void {
    const entry = { label, run };
    this.deletables.push(entry);
    return () => {
      this.deletables = this.deletables.filter((d) => d !== entry);
      if (this._pendingDelete && this._pendingDelete.run === entry.run) {
        this._pendingDelete = null;
      }
    };
  }

  /** F02-09 test seam: the delete confirmation stage (1, 2) or null. */
  pendingDeleteStage(): 1 | 2 | null {
    return this._pendingDelete?.stage ?? null;
  }

  private matchVisibleOption(raw: string): VoiceOption | null {
    const clean = normalizeForMatch(raw);
    if (!clean) return null;
    for (let g = this.voiceOptionGroups.length - 1; g >= 0; g--) {
      for (const opt of this.voiceOptionGroups[g].options) {
        const label = normalizeForMatch(opt.label);
        if (!label) continue;
        // spoke the whole printed label (possibly inside a sentence)
        if (clean.includes(label)) return opt;
        // partial contains-match: "सत्यनारायण" alone hits "सत्यनारायण कथा"
        // (≥3 chars so a stray syllable can't grab a card)
        if (clean.length >= 3 && label.includes(clean)) return opt;
        if (opt.keywords && matchWord(clean, opt.keywords)) return opt;
      }
    }
    return null;
  }

  /** Q4: TRUE when the transcript loosely contains a SCREEN-SPECIFIC
   *  keyword (a city name, a card label — length ≥4 and not ANY base
   *  grammar word). An empty VoiceField consults this before swallowing
   *  a sentence like "मैं गाज़ियाबाद से हूँ" as its value — the screen's
   *  own vocabulary outranks a raw capture, while grammar words keep the
   *  strict isPureCommand rule ("प्याज़ लहसुन छोड़ो" stays a value).
   *  opts.includeOptions=false: an actively-dictating VoiceField must
   *  not lose its value to a visible label ("हवन के लिए ग्यारह सौ" fills
   *  the हवन field; labels still resolve via the parser-reject
   *  fallthrough when the value isn't parseable). */
  matchesScreenSpecificLoose(text: string, opts?: { includeOptions?: boolean }): boolean {
    const grammar = new Set(
      [...YES, ...NO, ...NEXT, ...BACK, ...SKIP, ...REPEAT, ...HELP, ...STOP, ...SLEEP].map((w) =>
        w.toLowerCase(),
      ),
    );
    const specific = (kw: string) => kw.length >= 4 && !grammar.has(kw.toLowerCase());
    const entry = this.activeVoiceScreen();
    if (entry) {
      for (const cmd of entry.commands) {
        const kws = [...cmd.keywords].filter(specific);
        if (kws.length && matchWord(text, kws)) return true;
      }
    }
    if (opts?.includeOptions === false) return false;
    return this.matchVisibleOption(text) !== null;
  }

  private activeVoiceScreen(): VoiceScreenEntry | null {
    return this.voiceScreens[this.voiceScreens.length - 1] ?? null;
  }

  /**
   * J1/J2 — resolve a transcript against the active screen's commands,
   * then the GLOBAL grammar. Returns true when something acted. Callers
   * (the screen command listen, a VoiceField whose parser rejected or
   * whose value is already filled) re-arm the loop themselves on false.
   */
  handleTranscript(text: string, confidence = 1, spokenEpoch?: number): boolean {
    const clean = text.trim();
    if (!clean) return false;
    // L5 PROVENANCE: a transcript stamped with the screen it was spoken on
    // must NOT act if the active screen has since changed (STT round-trip can
    // be up to ~8s; a late "हाँ" from screen A must never fire screen B's
    // YES/accept). Undefined stamp = legacy caller, no provenance check.
    if (spokenEpoch !== undefined && spokenEpoch !== this.screenEpoch) {
      this.debug(`transcript dropped: spoken on a previous screen (epoch ${spokenEpoch}≠${this.screenEpoch})`);
      return false;
    }
    // L-C TRUST GATE: a low-confidence transcript may NOT drive a command,
    // option-select, navigation, or SLEEP/mute. Below the floor it is treated
    // as no-command (returns false) so the caller falls through to the gentle
    // agent path instead of silently firing an action on misheard noise.
    if (confidence < this.COMMAND_CONFIDENCE_FLOOR) {
      this.debug(`voice cmd sub-floor (conf ${confidence.toFixed(2)}) ignored: "${clean.slice(0, 24)}"`);
      return false;
    }
    // F02-09: a pending DELETE confirmation answers first — it is the most
    // specific state. Stage 1 हाँ → ask "क्या आप निश्चित हैं?"; stage 2 हाँ →
    // run the clear. नहीं (or anything else) at either stage cancels — an
    // unclear answer must never destroy data.
    if (this._pendingDelete) {
      const yn = matchYesNo(clean);
      if (yn === "yes" && this._pendingDelete.stage === 1) {
        this._pendingDelete.stage = 2;
        this.speak(t("voiceLoop.confirmSure"));
        this.loopRearm();
        return true;
      }
      if (yn === "yes" && this._pendingDelete.stage === 2) {
        const d = this._pendingDelete;
        this._pendingDelete = null;
        this.noteVoiceGesture();
        this.debug(`delete CONFIRMED (double) → ${d.label}`);
        try { d.run(); } catch { /* best-effort */ }
        this.speak(`ठीक है — ${d.label} हटा दिया।`);
        return true;
      }
      // नहीं, or anything unclear → cancel. Deleting on ambiguity is the bug.
      this._pendingDelete = null;
      this.speak("ठीक है, कुछ नहीं हटाया।");
      this.loopRearm();
      return true;
    }
    // F02-06: a spoken menu choice awaits confirmation before it commits, the
    // same law as a spoken field value. If one is pending, THIS transcript
    // answers it: हाँ commits, नहीं cancels, anything else is a correction
    // (drop the pending choice and let this utterance be matched fresh below).
    if (this._pendingOption) {
      const yn = matchYesNo(clean);
      if (yn === "yes") {
        const opt = this._pendingOption;
        this._pendingOption = null;
        this.setConfirming(false);
        this.noteVoiceGesture();
        this.debug(`voice option CONFIRMED → [${opt.label}]`);
        try { opt.onSelect(); } catch { /* onSelect is best-effort */ }
        return true;
      }
      if (yn === "no") {
        this._pendingOption = null;
        this.setConfirming(false);
        this.speak(t("voiceLoop.confirmRepeat"));
        this.loopRearm();
        return true;
      }
      // neither हाँ nor नहीं → a correction: forget the pending choice and let
      // this same transcript be matched fresh (a different option can win).
      this._pendingOption = null;
      this.setConfirming(false);
    }
    // H6 UNDO — matched BEFORE the screen commands so "वापस करो / गलत हो गया /
    // रद्द करो" reverts the LAST committed toggle/value instead of a screen's
    // BACK nav. LAW (a): money/identity actions never registered an undo, so
    // for those it explains + offers the real path. LAW (b): the `consumed`
    // latch makes a double "वापस करो" idempotent (never a double-revert).
    if (matchAny(clean, UNDO_PHRASES)) {
      this.noteVoiceGesture();
      const u = this.lastUndoable;
      const now = performance.now();
      if (u && !u.consumed && now - u.at < 60000) {
        u.consumed = true;
        this.lastUndoable = null;
        try { u.revertFn(); } catch { /* revert is best-effort */ }
        this.debug(`undo: reverted ${u.actionId} (${u.label})`);
        this.speak(`ठीक है — ${u.label} वापस कर दिया।`);
        return true;
      }
      if (this.lastForbiddenLabel && now - this.lastForbiddenAt < 60000) {
        this.speak(`${this.lastForbiddenLabel} — इसे बदलने के लिए सहायता से बात कीजिए।`);
        return true;
      }
      this.speak("अभी वापस करने को कुछ नहीं है, पंडित जी।");
      return true;
    }
    // F02-09: EXPLICIT deletion — "हटा दो" and friends, never पीछे. Targets
    // the most recent filled field; nothing registered → an honest no-op.
    // The actual clear only happens after the DOUBLE confirm above.
    if (matchAny(clean, ["हटा दो", "हटाओ", "हटा दीजिए", "मिटा दो", "मिटाओ", "डिलीट"])) {
      this.noteVoiceGesture();
      const target = this.deletables[this.deletables.length - 1];
      if (!target) {
        this.speak("अभी हटाने को कुछ नहीं है, पंडित जी।");
        return true;
      }
      this._pendingDelete = { label: target.label, run: target.run, stage: 1 };
      this.speak(`क्या आप ${target.label} हटाना चाहते हैं? हाँ या नहीं बोलें।`);
      this.loopRearm();
      return true;
    }
    const entry = this.activeVoiceScreen();
    if (entry) {
      const exact = clean.toLowerCase().replace(/[।.,!?]/g, " ").replace(/\s+/g, " ").trim();
      for (const cmd of entry.commands) {
        // K3c: log the keyword that actually hit, not keywords[0]
        const hit = cmd.pure
          ? (cmd.keywords.find((k) => k.toLowerCase() === exact) ?? null)
          : matchWord(clean, cmd.keywords);
        if (hit) {
          this.debug(`voice cmd: "${clean.slice(0, 24)}" → matched [${hit}]`);
          this.runCommand(cmd);
          return true;
        }
      }
    }
    // Q3: visible on-screen options — after the screen's own commands,
    // before the global grammar (a printed label is more specific than
    // फिर-से, less authoritative than the screen's registered verbs)
    const opt = this.matchVisibleOption(clean.toLowerCase().trim());
    if (opt) {
      // F02-06: DON'T commit yet — a spoken menu choice is confirmed first,
      // "आपने कहा [X] — सही है?", exactly like a spoken field value. The
      // matching logic above is UNCHANGED, so the ₹5000→teamSize collision
      // guard still holds; only the commit is now two-step.
      this.debug(`voice option: "${clean.slice(0, 24)}" → [${opt.label}] (awaiting confirm)`);
      this.noteVoiceGesture();
      this._pendingOption = opt;
      this.setConfirming(true);
      this.speak(t("voiceLoop.confirmAsk").replace("{value}", opt.label));
      this.loopRearm();
      return true;
    }
    // GLOBAL grammar — everywhere, always. REPEAT/HELP resolve BEFORE
    // STOP: a polite "बस एक बार फिर से सुनाओ" or "रुको, मदद करो" carries
    // a real request — bare "रुको"/"बस" still lands on STOP below.
    if (matchAny(clean, REPEAT)) {
      this.debug(`voice cmd: "${clean.slice(0, 24)}" → REPEAT`);
      this.noteVoiceGesture();
      this.replayFn?.();
      return true;
    }
    if (matchAny(clean, HELP)) {
      this.debug(`voice cmd: "${clean.slice(0, 24)}" → HELP`);
      this.noteVoiceGesture();
      if (entry?.helpText) this.speak(entry.helpText);
      else this.replayFn?.();
      return true;
    }
    // Q5 STOP — "रुको" mid-narration: immediate silence IS the ack (no
    // spoken reply), and the loop keeps listening. After REPEAT/HELP
    // (polite composites carry those intents), before SLEEP.
    if (matchAny(clean, STOP)) {
      this.debug(`voice cmd: "${clean.slice(0, 24)}" → STOP`);
      this.noteVoiceGesture();
      this.stopSpeech("voice-stop");
      this.loopRearm();
      return true;
    }
    if (matchAny(clean, SLEEP)) {
      this.debug(`voice cmd: "${clean.slice(0, 24)}" → SLEEP`);
      this.noteVoiceGesture();
      // Ruling #9: he SPOKE a command — silence-back reads as "it didn't hear
      // me". Speak the farewell, THEN mute (same path as the सुला दें control);
      // the sleep side-effects fire once the mute has landed.
      this.muteWithFarewell(() => {
        resetAgentHistory("sleep"); // W3: sleep forgets the conversation
        try {
          window.dispatchEvent(new CustomEvent("hpj-shishya-sleep"));
        } catch { /* noop */ }
      });
      return true;
    }
    // W1 (शिष्य v3): NO local curated matcher, NO screen-context gate.
    // The reflexes above stay the only <5ms paths; everything they
    // didn't claim — questions, statements, complaints, half-commands —
    // flows to the AGENT via speakUnmatchedGently(text).
    return false;
  }

  /** W3: THE single execution path for a registered command — a spoken
   *  keyword match and an agent `act` both land here, so confirmSpeech
   *  gates can never be bypassed. */
  /** H6 UNDO — arm a reversible (toggle/value) commit so "वापस करो" can revert
   *  it within 60s. LAW: a MONEY/IDENTITY terminal action may NEVER register an
   *  undo — enforced here by the SAME deny-list the puppet + agent use
   *  (shishyaPuppet.isForbiddenCategory, one source, never two). A forbidden
   *  category is refused; "वापस करो" then explains + offers the real path. */
  registerUndo(actionId: string, revertFn: () => void, label: string, category?: ActionCategory): void {
    if (isForbiddenCategory(category)) {
      this.debug(`registerUndo REFUSED — '${category}' is a money/identity terminal action (${actionId})`);
      return;
    }
    this.lastUndoable = { actionId, revertFn, label, at: performance.now(), epoch: this.currentScreenEpoch(), consumed: false };
    this.debug(`undo armed: ${actionId} (${label})`);
  }

  private runCommand(cmd: VoiceCommand): void {
    this.noteVoiceGesture();
    // H6: a money/identity command the pandit just fired can't be undone —
    // remember it so "वापस करो" explains + points at the real path.
    if (isForbiddenCategory(cmd.category)) {
      this.lastForbiddenLabel = cmd.label || String(cmd.keywords[0] ?? "यह काम");
      this.lastForbiddenAt = performance.now();
    }
    if (cmd.confirmSpeech) {
      this.speak(cmd.confirmSpeech, {
        onEnd: () => {
          // re-stamp at ACTION time — the ack may outlive the window
          this.noteVoiceGesture();
          cmd.action();
        },
      });
    } else {
      cmd.action();
    }
  }

  /**
   * J2: TRUE when the WHOLE utterance is a registered command word or
   * global grammar word — lets an EMPTY text field yield "आगे"/"मदद" to
   * the registry instead of swallowing them as its value. Exact match
   * after normalization, not inclusion: "आगे नगर" stays a field value.
   */
  isPureCommand(text: string): boolean {
    const clean = text.trim().toLowerCase().replace(/[।.,!?]/g, "").trim();
    if (!clean) return false;
    const entry = this.activeVoiceScreen();
    // YES/NO are universal answers — a bare "हाँ" is never a name, a
    // city, or an allergy, even when no screen command claims it.
    const words: string[] = [
      ...(entry?.commands.flatMap((c) => [...c.keywords]) ?? []),
      ...YES,
      ...NO,
      ...REPEAT,
      ...HELP,
      ...STOP,
      ...SLEEP,
    ];
    return words.some((w) => w.toLowerCase() === clean);
  }

  /**
   * Unclaimed speech. W1 (शिष्य v3): in agent mode EVERY transcript that
   * lands here — question, complaint, chatter, half-command — goes to
   * the conversational agent. The reflex-only kill switch
   * (NEXT_PUBLIC_SHISHYA_MODE) restores the T4 behavior: question-shaped
   * → server /ask; noise → one gentle line per 30s per screen.
   */
  speakUnmatchedGently(text?: string): void {
    const entry = this.activeVoiceScreen();
    if (text && SHISHYA_MODE === "agent") {
      void this.askAgent(text);
      return;
    }
    if (text && isQuestionShaped(text)) {
      // reflex-only fallback: the v2 server brain (curated + LLM /ask)
      void this.askServerBrain(text);
      return;
    }
    const now = performance.now();
    const last = entry ? entry.lastUnmatchedAt : this.lastGlobalUnmatchedAt;
    if (now - last < 30000) {
      this.loopRearm();
      return;
    }
    if (entry) entry.lastUnmatchedAt = now;
    else this.lastGlobalUnmatchedAt = now;
    this.speak(t("voiceLoop.unmatched"));
  }
  private lastGlobalUnmatchedAt = 0;

  // X3: rotate the "thinking" filler so consecutive waits vary. All
  // three variants are prefetched (VoiceRoot) so each answers instantly.
  private fillerIdx = 0;
  private nextFiller(): string {
    const keys = ["shishya.thinking", "shishya.thinking2", "shishya.thinking3"];
    const key = keys[this.fillerIdx % keys.length];
    this.fillerIdx++;
    return t(key);
  }

  /**
   * T4/X3: server-brain ask. >600ms in flight → ONE spoken filler
   * (rotated variant, prefetched); the answer (or the honest miss on any
   * failure) replaces it — newest-wins keeps this clean. Answers NEVER
   * navigate; the loop re-arms when the line ends.
   */
  private askServerBrain(text: string): Promise<void> {
    const t0 = performance.now();
    const filler = setTimeout(() => {
      this.speak(this.nextFiller());
    }, 600);
    return askShishyaServer(text)
      .then((res) => {
        clearTimeout(filler);
        const ms = Math.round(performance.now() - t0);
        this.debug(`brain: q="${text.slice(0, 40)}" source=${res.source} ms=${ms}`);
        if (res.answer) {
          this.speak(res.answer);
        } else {
          recordUnansweredQuestion(text);
          this.speak(t("shishya.honestMiss"));
        }
      })
      .catch(() => {
        clearTimeout(filler);
        this.debug(`brain: q="${text.slice(0, 40)}" source=error`);
        recordUnansweredQuestion(text);
        this.speak(t("shishya.honestMiss"));
      });
  }

  // ── W3: शिष्य v3 AGENT INTEGRATION ──────────────────────────
  // seq guard: a newer utterance supersedes an in-flight ask — the
  // stale reply is dropped silently (never spoken, never acted).
  private agentSeq = 0;
  private agentActRunners = new Map<string, () => void>();

  /** Derive the agent's tool list from what THIS screen already
   *  registered: the active entry's commands (id ?? positional), then
   *  every visible option. Each id keeps the exact closure it was
   *  minted for — execution goes through runCommand/onSelect, the SAME
   *  paths a spoken match takes. */
  private buildAgentActions(): AgentAction[] {
    this.agentActRunners.clear();
    const out: AgentAction[] = [];
    const entry = this.activeVoiceScreen();
    // L7 FLOW SANCTITY: a critical money/KYC screen contributes NO tools —
    // the agent can still answer, but the LLM is handed an empty action
    // list so it can never accept a booking, submit KYC, or navigate away.
    if (entry?.critical) return out;
    entry?.commands.forEach((cmd, i) => {
      // L7 ∪ A3 — ONE money/identity boundary (shishyaPuppet.isForbiddenCategory,
      // the SAME set the puppet denies): a money/identity command is a terminal
      // press the agent may never COMPLETE, so it is omitted from the actable
      // tool list entirely. It stays locatable via its ref (A1/A2), never
      // actable. No second deny-list — the puppet and the agent share this one.
      if (isForbiddenCategory(cmd.category)) return;
      const id = cmd.id || `cmd${i}`;
      if (this.agentActRunners.has(id)) return;
      this.agentActRunners.set(id, () => this.runCommand(cmd));
      out.push({
        id,
        label: cmd.label || String(cmd.keywords[0] ?? id),
        hint: cmd.confirmSpeech ? cmd.confirmSpeech.slice(0, 100) : undefined,
        category: cmd.category,
      });
    });
    this.voiceOptionGroups.forEach((g, gi) => {
      g.options.forEach((opt, oi) => {
        const id = `opt${gi}_${oi}`;
        if (this.agentActRunners.has(id)) return;
        this.agentActRunners.set(id, () => {
          this.noteVoiceGesture();
          opt.onSelect();
        });
        out.push({ id, label: opt.label });
      });
    });
    return out.slice(0, 24);
  }

  /**
   * W3/X3: one agent exchange. >600ms in flight → a spoken thinking
   * filler (rotated variant, prefetched). The reply speaks `say`; when
   * `act` names a tool from the list WE sent, it executes AFTER the ack
   * finishes — and only if the pandit let it finish (an interrupt drops
   * the act, never fires it behind his back).
   */
  private async askAgent(text: string): Promise<void> {
    const seq = ++this.agentSeq;
    const entry = this.activeVoiceScreen();
    const screenId = typeof window !== "undefined" ? window.location.pathname : "";
    const actions = this.buildAgentActions();
    this.debug(`agent: → "${text.slice(0, 40)}"`);
    const t0 = performance.now();
    const filler = setTimeout(() => {
      if (seq === this.agentSeq) this.speak(this.nextFiller());
    }, 600);
    try {
      const res = await askShishyaAgent(text, {
        screenId,
        screenHelp: entry?.helpText,
        availableActions: actions,
      });
      clearTimeout(filler);
      if (seq !== this.agentSeq) {
        this.debug("agent: ← stale (superseded), dropped");
        return;
      }
      const ms = Math.round(performance.now() - t0);
      // timeout/miss/error say-lines from the server are Hindi-only —
      // speak the LOCALIZED honest miss instead (mr session stays mr)
      if (!res.say || (res.source !== "agent" && res.source !== "agent-cached")) {
        this.debug(`agent: ← miss source=${res.source} in ${ms}ms`);
        recordUnansweredQuestion(text);
        this.speak(t("shishya.honestMiss"));
        return;
      }
      this.debug(`agent: ← "${res.say.slice(0, 40)}" act=${res.act ?? "null"} in ${ms}ms`);
      // L7 belt-and-suspenders: even if the server echoed an act, NEVER
      // execute it on a critical flow (the screen may have become critical,
      // or a cached act slipped through).
      const actId = entry?.critical ? null : res.act;
      if (res.act && entry?.critical) this.debug(`agent: act [${res.act}] SUPPRESSED (critical flow)`);
      this.speak(res.say, {
        onEnd: (completed) => {
          if (!actId) return;
          if (!completed) {
            this.debug(`agent: act [${actId}] dropped (say interrupted)`);
            return;
          }
          const run = this.agentActRunners.get(actId);
          if (run) run();
          else this.debug(`agent: act [${actId}] no longer on screen — skipped`);
        },
      });
    } catch {
      clearTimeout(filler);
      if (seq !== this.agentSeq) return;
      this.debug("agent: ← error");
      recordUnansweredQuestion(text);
      this.speak(t("shishya.honestMiss"));
    }
  }

  get processing(): boolean {
    return this._processing;
  }
  setProcessing(v: boolean): void {
    if (this._processing === v) return;
    this._processing = v;
    if (v) this.noteListenActivity(); // T3: STT-in-flight heartbeat
    this.emit();
  }

  /** DEV/voicedebug transcript injector — drives the FULL grammar/loop
   *  pipeline exactly as a Deepgram result would (audio hop excluded).
   *  Production-inert without the voicedebug session flag. */
  injectTranscript(text: string): string {
    try {
      if (
        process.env.NODE_ENV === "production" &&
        sessionStorage.getItem("hpj_voicedebug") !== "1"
      ) {
        return "disabled";
      }
    } catch {
      return "disabled";
    }
    this.debug(`inject: "${text}"`);
    for (const claim of [...this.fieldClaims]) {
      if (claim(text)) return "field";
    }
    if (this.handleTranscript(text)) return "command";
    this.speakUnmatchedGently(text);
    return "unmatched";
  }

  // J1: VoiceField first-claim hooks (for injected transcripts; real STT
  // flows through each field's own pipeline). A LIST because multi-field
  // screens mount several fields — empty fields claim, filled ones pass.
  private fieldClaims: Array<(text: string) => boolean> = [];
  registerFieldClaim(fn: (text: string) => boolean): () => void {
    this.fieldClaims.push(fn);
    return () => {
      this.fieldClaims = this.fieldClaims.filter((f) => f !== fn);
    };
  }

  private init() {
    if (this.initialized || typeof window === "undefined") return;
    // W3: agent-lib events (history resets) surface in the panel
    setAgentDebugSink((line) => this.debug(line));
    this.initialized = true;
    // E2E traversal mode (?e2e=1, session-sticky): automated QA can
    // traverse permission-gated screens — native prompts never invoked.
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.get("e2e") === "1") sessionStorage.setItem("hpj_e2e", "1");
      if (q.get("e2e") === "0") sessionStorage.removeItem("hpj_e2e");
      this._e2e = sessionStorage.getItem("hpj_e2e") === "1";
      if (this._e2e) this.debug("⚙ E2E MODE ACTIVE — permission prompts bypassed");
    } catch { /* noop */ }
    this.installPermSim();
    this._muted = readInitialMuted();
    this._hidden = document.visibilityState === "hidden";
    document.addEventListener("visibilitychange", () => {
      this._hidden = document.visibilityState === "hidden";
      if (this._hidden) {
        this.hiddenSince = performance.now();
        this.stopSpeech("tab-hidden");
        this.abortListening();
        // S5: backgrounded = capture session must not linger
        this.releaseMicStream("hidden");
        this.releaseWakeLock("hidden");
      } else {
        // V2a: back in view — retake the screen lock with the loop
        this.acquireWakeLock("reacquired");
        // Q1: returning to the tab resumes THE LAW — awake + granted ⇒
        // armed. Without this kick the loop stayed dead until the next
        // narration happened to end.
        this.loopRearm();
        // L-D: a resume that followed a real mic release must AUDIBLY signal
        // the loop is alive again — an elderly voice-first user returning to a
        // silent screen has no way to know शिष्य is listening. Mirror unmute's
        // re-cue (replay the screen prompt), debounced so a quick tab flicker
        // or a notification pull-down does not re-narrate.
        if (
          !this._muted &&
          this.micGranted() &&
          this.hiddenSince > 0 &&
          performance.now() - this.hiddenSince > 2000
        ) {
          this.replayFn?.();
        }
        this.hiddenSince = 0;
      }
      this.emit();
    });
    // X2a: the app's FIRST pointerdown anywhere (a splash tap counts)
    // unlocks audio and flushes the queued narration.
    document.addEventListener("pointerdown", () => this.unlock(), { once: true, capture: true });
    // H1: persistent tap clock for nav-stop classification.
    // S3: any tap also dismisses the narration highlight (interaction).
    document.addEventListener(
      "pointerdown",
      () => {
        this.lastPointerdownAt = performance.now();
        this.clearHighlight();
      },
      { capture: true },
    );
    // S4: THE LISTENING WATCHDOG — the loop must never silently die.
    // Awake + granted + visible + idle + a screen holds a registry, yet
    // nobody is armed → re-arm. One net under every stall class (guard-
    // refusal races, visibility flickers, wedged recorder teardown).
    // Skips: e2e (listens resolve instantly by design), pre-unlock (an
    // unprompted getUserMedia before the first gesture is a hostile
    // popup), pending re-arm timers (no double-arming, no log spam).
    // T3 ZOMBIE DETECTOR: listening=true fooled the S4 watchdog into
    // backing off even when the recorder underneath was DEAD (tab-hide
    // killed onstop; a wedged teardown). The recorder heartbeats every
    // RMS tick — listening or STT-processing with a silent heartbeat
    // for 12s is a zombie: force teardown + re-arm.
    setInterval(() => {
      if (this._e2e || !this._unlocked) return;
      const now = performance.now();
      // V2b TRACK-HEALTH RESURRECTION: a dead or long-muted track under
      // a supposedly-armed loop = the Android suspension signature.
      // Silent reacquire (permission granted) — the ONE sanctioned
      // reacquire even under strategy=mute.
      if (!this.paused && this.micGranted() && !this.micResurrecting) {
        const stream = this.micStream;
        const trackDead = !!stream && stream.getAudioTracks().some((tr) => tr.readyState === "ended");
        const mutedTooLong = this.micTrackMutedSince > 0 && now - this.micTrackMutedSince > 3000;
        if ((trackDead || mutedTooLong) && (this._listening || this.autoTargets.length > 0)) {
          this.resurrectMic(trackDead ? "track-ended" : "muted>3s");
          return;
        }
      }
      if (
        (this._listening || this._processing) &&
        now - this.lastListenActivityAt > 12000
      ) {
        this.debug("loop: zombie recovered");
        this._processing = false;
        this.abortListening();
        this.loopRearm(0);
        return;
      }
      // L-A: a _speaking that outlives the longest possible utterance is a
      // wedged narration the per-utterance failsafe somehow missed — force
      // release + re-cue rather than sit deaf in NARRATING. 48s > the 45s
      // playback hard cap, so this only fires as the last-resort net.
      if (this._speaking && this.speakingSince > 0 && now - this.speakingSince > 48000) {
        this.debug("loop: watchdog recovered stuck narration");
        this.stopSpeech("watchdog:stuck-speaking");
        this.loopRearm(0);
        return;
      }
      if (this.paused || this._speaking || this._listening) return;
      if (this._processing || this._confirming) return;
      if (this.rearmTimer) return;
      if (!this.voiceScreens.length || !this.autoTargets.length) return;
      this.debug("loop: watchdog re-arm");
      this.loopRearm(0);
    }, 1500);
    // F2: a CSP-blocked fetch surfaces as a bare TypeError with zero
    // network entries — indistinguishable from other blocks unless the
    // violation event itself is logged. This line IS the verdict channel.
    document.addEventListener("securitypolicyviolation", (e) => {
      this.debug(`CSP BLOCK: ${e.blockedURI} (${e.violatedDirective})`);
    });
    // Y4: drop any pre-law audio (ratan/priya/meera) once per boot.
    void this.purgeLegacyCache();
  }

  private unlock() {
    if (this._unlocked) return;
    // F1: THE GESTURE ITSELF IS THE UNLOCK TOKEN — set synchronously and
    // never reverted. The silent play below is confirmation only: when it
    // shared the persistent element, the flushed welcome's src swap
    // aborted the still-pending probe play() (AbortError) and the first
    // line stayed parked until a second tap (live-QA 80s stall). If the
    // real playback later rejects NotAllowedError, parkForGesture's
    // retry-on-next-gesture path is the truth — not the probe.
    this._unlocked = true;
    this.debug("unlock: gesture-token set");
    try {
      // Probe on a THROWAWAY element so the persistent one stays free
      // for the welcome that flushes right behind this gesture.
      const probe = new Audio(SILENT_WAV);
      probe.muted = true;
      void probe
        .play()
        .then(() => this.debug("unlock: probe ok"))
        .catch((err: unknown) => {
          this.debug(`unlock: probe rejected(${(err as Error)?.name || err}) (non-fatal)`);
        });
      // Create the persistent element inside the gesture (no play) and
      // resume the synthesis engine in the same gesture. (No app-owned
      // AudioContext exists to resume; useVoiceInput creates per-listen
      // contexts from live mic streams, which need no gesture.)
      this.getAudioEl();
      window.speechSynthesis?.resume();
    } catch {
      /* noop */
    }
    const parked = this.pendingUnlock;
    this.pendingUnlock = null;
    if (parked && !this._muted) {
      // Defer past this same tap's other capture handlers — the
      // "interactive tap silences narration" rule (VoiceRoot) would
      // otherwise kill the very line this gesture just released. H1: a
      // barge-in (interactive-target tap) CANCELS this timer instead —
      // the tap navigates, and the flushed line would only be beheaded
      // by the departing screen's unmount.
      this.pendingFlushTimer = setTimeout(() => {
        this.pendingFlushTimer = null;
        // barge-in landed during this same gesture (either listener order)
        if (performance.now() - this.lastBargeInAt < 150) {
          this.debug("flush cancelled (barge-in nav tap)");
          return;
        }
        if (!this._muted) this.speak(parked.text, { languageCode: parked.languageCode });
      }, 0);
    }
  }

  // A3: playback refused outside a gesture (NotAllowedError) — park the
  // utterance, retry on the NEXT gesture, tell the pandit once to tap.
  private parkForGesture(text: string, languageCode: string): void {
    this.pendingUnlock = { text, languageCode };
    this.debug("parked utterance — one-shot retry armed on next gesture");
    try {
      document.addEventListener(
        "pointerdown",
        () => {
          const parked = this.pendingUnlock;
          this.pendingUnlock = null;
          if (parked && !this._muted) {
            this.pendingFlushTimer = setTimeout(() => {
              this.pendingFlushTimer = null;
              if (performance.now() - this.lastBargeInAt < 150) {
                this.debug("flush cancelled (barge-in nav tap)");
                return;
              }
              if (!this._muted) this.speak(parked.text, { languageCode: parked.languageCode });
            }, 0);
          }
        },
        { once: true, capture: true },
      );
    } catch {
      /* noop */
    }
    try {
      if (sessionStorage.getItem(TAP_TO_HEAR_SHOWN) === "1") return;
      sessionStorage.setItem(TAP_TO_HEAR_SHOWN, "1");
      window.dispatchEvent(new CustomEvent("hpj-voice-tap-to-hear"));
    } catch {
      /* noop */
    }
  }

  private micGranted(): boolean {
    try {
      return localStorage.getItem("mic_permission_granted") === "true";
    } catch {
      return false;
    }
  }

  get paused(): boolean {
    this.init();
    return this._muted || this._hidden || !this.micGranted();
  }

  get loopState(): LoopState {
    if (this.paused) return "PAUSED";
    if (this._speaking) return "NARRATING";
    if (this._confirming) return "CONFIRMING";
    if (this._listening) return "LISTENING";
    return "IDLE";
  }

  setConfirming(v: boolean): void {
    this._confirming = v;
    this.emit();
  }

  /**
   * Register an auto-listen target. Higher priority wins (field=1,
   * commands=0). J2: arm() may return false to DECLINE its turn (a
   * filled VoiceField yields so the next field — or the screen's
   * command listen — gets the mic); the loop then tries the next target.
   */
  registerAutoListen(priority: number, arm: () => void | boolean): () => void {
    const entry = { priority, arm };
    this.autoTargets.push(entry);
    return () => {
      this.autoTargets = this.autoTargets.filter((t) => t !== entry);
    };
  }

  /** Re-arm the loop shortly (after narration end / listen resolution). */
  loopRearm(delayMs = 350): void {
    if (this.rearmTimer) clearTimeout(this.rearmTimer);
    this.rearmTimer = setTimeout(() => {
      // S4: null the handle FIRST — a stale handle after firing read as
      // "re-arm pending" and gagged the watchdog permanently.
      this.rearmTimer = null;
      if (this.paused || this._speaking || this._listening) return;
      const targets = [...this.autoTargets].sort((a, b) => b.priority - a.priority);
      for (const target of targets) {
        if (target.arm() !== false) return;
      }
    }, delayMs);
  }

  // ── reactive plumbing ──────────────────────────────────────
  subscribe = (cb: () => void): (() => void) => {
    this.init();
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };

  private emit() {
    this.listeners.forEach((cb) => cb());
  }

  get muted(): boolean {
    this.init();
    return this._muted;
  }
  get speaking(): boolean {
    return this._speaking;
  }
  get listening(): boolean {
    return this._listening;
  }

  // ── speaking ───────────────────────────────────────────────
  speak(text: string, opts?: SpeakOpts): void {
    this.init();
    if (typeof window === "undefined") return;
    if (this._muted) {
      opts?.onEnd?.(false);
      opts?.onOutcome?.("muted");
      return;
    }
    this.debug(`speak "${text.slice(0, 40)}" lang=${opts?.languageCode ?? getActiveBcp47()}`);
    // X2a AUDIO-UNLOCK LAW: nothing may sound before the first gesture.
    // Park the line (newest wins), let the caller's flow continue, and
    // narrate on unlock.
    if (!this._unlocked) {
      this.pendingUnlock = { text, languageCode: opts?.languageCode };
      this.debug("→ parked (pre-unlock)");
      opts?.onEnd?.(false);
      opts?.onOutcome?.("parked");
      // Q1 THE LAW: awake + mic-granted ⇒ loop armed on EVERY screen.
      // Only PLAYBACK needs the unlock gesture — the mic does not. A
      // fresh dashboard load (token restore, no tap yet) parks its
      // narration here; without this rearm the narration-end→listen
      // chain never starts and dashboard voice is dead until a tap.
      this.loopRearm();
      return;
    }
    // Barge-out: speaking during a listen aborts the listen first, then
    // speaks; the loop re-arms after the speech ends.
    if (this._listening) {
      this.abortListening();
    }
    const interrupt = opts?.interrupt !== false;
    if (interrupt) this.stopSpeech("speak-interrupt");
    else if (this._speaking) {
      // non-interrupting speak while already speaking → newest-wins queue
      if (this.queued) {
        this.queued.opts?.onEnd?.(false);
        this.queued.opts?.onOutcome?.("interrupted");
      }
      this.queued = { text, opts };
      return;
    }

    this._speaking = true;
    this.speakingSince = performance.now(); // L-A stuck-narration watchdog anchor
    // S3: this utterance's highlight (or none) replaces any prior one
    this.setHighlight(opts?.highlightRef);
    // S5/T2: capture goes fully quiet while शिष्य talks. 'stop' KILLS
    // the tracks (the only thing that exits Android's call-audio mode);
    // 'mute' is the legacy enabled-toggle fallback.
    if (this.effectiveMicStrategy() === "stop") this.releaseMicStream("narrating");
    else this.setMicTracksEnabled(false, "narrating");
    this.emit();

    let settled = false;
    const finish = (completed: boolean, status?: SpeakOutcome) => {
      if (settled) return;
      settled = true;
      this._speaking = false;
      this.speakingSince = 0;
      this.emit();
      opts?.onEnd?.(completed);
      opts?.onOutcome?.(status ?? (completed ? "ended" : "interrupted"));
      // drain anything queued while we spoke
      const q = this.queued;
      this.queued = null;
      if (q && !this._muted && !this._listening) {
        this.speak(q.text, q.opts);
        return;
      }
      // ALWAYS-LISTENING LAW: after any speech ends, re-arm the loop.
      // T2: pre-warm the mic NOW — the 350ms re-arm delay absorbs the
      // getUserMedia latency so the listen finds a ready stream.
      this.prewarmMic();
      this.loopRearm();
    };

    void this.speakNow(text, opts?.languageCode ?? getActiveBcp47(), finish);
  }

  // T2: re-acquiring at listen time costs 50-300ms — acquire at
  // narration END instead. If permission was revoked mid-session the
  // NotAllowedError flips micGranted false → paused → full touch app
  // (the graceful micDenied fall).
  private prewarming = false;
  prewarmMic(): void {
    if (this.effectiveMicStrategy() !== "stop") return;
    if (this.prewarming || this.paused || !this.micGranted() || this.getMicStream()) return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
    this.prewarming = true;
    const t0 = performance.now();
    navigator.mediaDevices
      .getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      .then((stream) => {
        this.prewarming = false;
        this.adoptMicStream(stream);
        this.debug(`mic: prewarmed in ${Math.round(performance.now() - t0)}ms`);
        // a new narration started while we acquired — release again
        if (this._speaking) this.releaseMicStream("narrating (post-prewarm)");
      })
      .catch((err: unknown) => {
        this.prewarming = false;
        const name = (err as Error)?.name || String(err);
        this.debug(`mic: prewarm failed (${name})`);
        if (name === "NotAllowedError") {
          // revoked mid-session → graceful micDenied UX
          try {
            localStorage.setItem("mic_permission_granted", "false");
          } catch { /* noop */ }
          this.emit();
        }
      });
  }

  // X2b + D3: primary = same-origin /api/tts (Sarvam, ACTIVE language)
  // via the persistent element; any non-200/throw falls back to
  // speechSynthesis with the same BCP-47 tag. A4: the fallback first
  // PROVES a matching voice exists (voices load async on Android) —
  // otherwise it says so and stays text-visible. NotAllowedError parks
  // the utterance for a next-gesture retry instead of falling back.
  private async speakNow(text: string, languageCode: string, finish: (completed: boolean, status?: SpeakOutcome) => void): Promise<void> {
    const seq = ++this.speechSeq;
    const remote = await this.tryRemoteTTS(text, languageCode, seq);
    if (remote === "played") {
      this.sarvamEverSucceeded = true;
      finish(true);
      return;
    }
    if (remote === "parked") {
      // playback refused mid-flight (NotAllowedError) — utterance parked
      // for the next gesture; callers must not proceed on timers.
      finish(false, "parked");
      return;
    }
    if (remote === "cancelled" || seq !== this.speechSeq) {
      finish(false, "interrupted");
      return;
    }
    // U1b FALLBACK POLICY: Sarvam has worked this session → its failure
    // is a HICCUP, not an outage. Retry x2 (500ms/1500ms); still failing
    // → SILENT + one toast + panel line. The robot voice never intrudes.
    if (this.sarvamEverSucceeded && remote === "failed") {
      for (const delay of [500, 1500]) {
        await new Promise((r) => setTimeout(r, delay));
        if (seq !== this.speechSeq) {
          finish(false, "interrupted");
          return;
        }
        this.remoteTtsDown = false; // a retry gets a fresh chance
        const again = await this.tryRemoteTTS(text, languageCode, seq);
        if (again === "played") {
          this.debug("voice: sarvam recovered on retry");
          finish(true);
          return;
        }
        if (again === "parked" || again === "cancelled") {
          finish(false, again === "parked" ? "parked" : "interrupted");
          return;
        }
      }
      this.debug("voice: silent(sarvam-fail x3) — text carries the line");
      try {
        window.dispatchEvent(new CustomEvent("hpj-voice-hiccup"));
      } catch { /* noop */ }
      finish(false, "failed");
      return;
    }
    if (!window.speechSynthesis) {
      this.debug("voice: silent(no-engine)");
      this.announceVoiceUnavailable();
      finish(false, "failed");
      return;
    }
    this.debug("fallback: sarvam→speechSynthesis (sarvam never up this session)");
    try {
      const { pickVoiceForLang, speakWithSarvam } = await import("@/lib/voice-engine").then(
        async (engine) => ({
          pickVoiceForLang: engine.pickVoiceForLang,
          speakWithSarvam: (await import("@/lib/sarvam-tts")).speakWithSarvam,
        }),
      );
      // A4 reality check: wait for the async voice list (≤1.5s), then
      // decide honestly instead of speaking into the void.
      await this.waitVoicesLoaded();
      if (seq !== this.speechSeq) {
        finish(false, "interrupted");
        return;
      }
      const voice = pickVoiceForLang(languageCode);
      if (!voice) {
        this.debug(`NO MATCHING VOICE for ${languageCode} → text-only`);
        this.announceVoiceUnavailable();
        finish(false, "failed");
        return;
      }
      this.debug(`voice: webspeech:${voice.name} (${voice.lang}) route=speechSynthesis`);
      // G2: fallback playback engaging counts as started for failsafes
      this.notifyPlaybackStart();
      await speakWithSarvam({
        text,
        languageCode: languageCode as never,
        onEnd: () => finish(true),
        onError: () => finish(false, "failed"),
      });
      finish(true);
    } catch {
      finish(false, "failed");
    }
  }

  // Android often reports an empty voice list until 'voiceschanged'.
  private waitVoicesLoaded(): Promise<void> {
    return new Promise((resolve) => {
      try {
        if (window.speechSynthesis.getVoices().length > 0) {
          resolve();
          return;
        }
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          window.speechSynthesis.removeEventListener("voiceschanged", done);
          resolve();
        };
        const timer = setTimeout(done, 1500);
        window.speechSynthesis.addEventListener("voiceschanged", done);
      } catch {
        resolve();
      }
    });
  }

  // ── D3b CLIENT AUDIO CACHE (CacheStorage 'shishya-tts-v2') ─────────
  // Keyed sha1(speaker|pace|profileVersion|lang|text). Cache-first
  // playback makes every static entry-flow line instant from its 2nd
  // hearing forever; misses fetch then cache.put. LRU-ish cap ~300 via
  // x-cached-at timestamps.
  // Y4: the store name is v2 and the key now includes the resolved
  // speaker + VOICE_PROFILE_VERSION — a pre-law entry (ratan/priya/meera
  // audio) can neither be found nor replayed, and the legacy v1 store is
  // purged on boot (purgeLegacyCache).
  private static TTS_CACHE = "shishya-tts-v2";
  private static TTS_CACHE_MAX = 300;
  private legacyCachePurged = false;

  private async purgeLegacyCache(): Promise<void> {
    if (this.legacyCachePurged || typeof caches === "undefined") return;
    this.legacyCachePurged = true;
    try {
      const deleted = await caches.delete("shishya-tts-v1");
      if (deleted) this.debug("tts-cache: purged legacy store");
    } catch {
      /* no CacheStorage — nothing to purge */
    }
  }

  private async ttsCacheKey(text: string, languageCode: string, pace: number): Promise<string | null> {
    try {
      const raw = `${VOICE_PROFILE.speaker}|${pace}|v${VOICE_PROFILE_VERSION}|${languageCode}|${text}`;
      const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(raw));
      const hex = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
      return `https://tts.cache/${hex}`;
    } catch {
      return null; // insecure context / no subtle — cache disabled
    }
  }

  private async ttsCacheGet(key: string | null): Promise<string | null> {
    if (!key || typeof caches === "undefined") return null;
    try {
      const cache = await caches.open(VoiceController.TTS_CACHE);
      const hit = await cache.match(key);
      if (!hit) return null;
      const data = (await hit.json()) as { audioBase64?: string };
      return data?.audioBase64 ?? null;
    } catch {
      return null;
    }
  }

  private async ttsCachePut(key: string | null, audioBase64: string): Promise<void> {
    if (!key || typeof caches === "undefined") return;
    try {
      const cache = await caches.open(VoiceController.TTS_CACHE);
      await cache.put(
        key,
        new Response(JSON.stringify({ audioBase64 }), {
          headers: { "Content-Type": "application/json", "x-cached-at": String(Date.now()) },
        }),
      );
      // LRU-ish cap: evict oldest by x-cached-at when over budget
      const keys = await cache.keys();
      if (keys.length > VoiceController.TTS_CACHE_MAX) {
        const stamped = await Promise.all(
          keys.map(async (req) => {
            const r = await cache.match(req);
            return { req, at: Number(r?.headers.get("x-cached-at") ?? 0) };
          }),
        );
        stamped.sort((a, b) => a.at - b.at);
        const evict = stamped.slice(0, keys.length - VoiceController.TTS_CACHE_MAX);
        await Promise.all(evict.map((e) => cache.delete(e.req)));
        this.debug(`tts-cache: evicted ${evict.length} oldest`);
      }
    } catch {
      /* cache full/unavailable — playback already succeeded */
    }
  }

  /** D3c PREFETCH PIPELINE: warm the cache for the NEXT phase's known
   *  narration lines. Fire-and-forget; respects the cache (no re-fetch
   *  on hits); never plays anything. */
  prefetch(texts: string[]): void {
    if (typeof window === "undefined") return;
    void (async () => {
      const pace = clientPace();
      const languageCode = getActiveBcp47();
      for (const text of texts) {
        if (!text) continue;
        const key = await this.ttsCacheKey(text, languageCode, pace);
        if (await this.ttsCacheGet(key)) continue;
        try {
          const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Y1: never send speaker/pace — the server owns the voice.
            // (pace stays in the LOCAL cache key only, as the profile pace.)
            body: JSON.stringify({ text, languageCode }),
          });
          if (!res.ok) return; // endpoint unhappy — stop the pipeline quietly
          const data = (await res.json()) as { audioBase64?: string };
          if (data?.audioBase64) {
            await this.ttsCachePut(key, data.audioBase64);
            this.debug(`prefetch cached: "${text.slice(0, 24)}…"`);
          }
        } catch {
          return; // offline — quietly stop
        }
      }
    })();
  }

  private async tryRemoteTTS(
    text: string,
    languageCode: string,
    seq: number,
  ): Promise<"played" | "failed" | "cancelled" | "parked"> {
    if (this.remoteTtsDown) {
      this.debug("tts skipped (endpoint down this session)");
      return "failed";
    }
    let audioBase64: string | undefined;
    const tQueue = performance.now();
    const pace = clientPace();
    const cacheKey = await this.ttsCacheKey(text, languageCode, pace);
    const cached = await this.ttsCacheGet(cacheKey);
    let cacheVerdict = "MISS";
    if (cached) {
      // D3b cache-first: instant playback, no network
      cacheVerdict = "HIT";
      audioBase64 = cached;
      this.debug(`tts timing: cache HIT in ${Math.round(performance.now() - tQueue)}ms`);
    } else {
      try {
        this.debug("tts→ POST /api/tts (same-origin)");
        // S5a: FULL client-side params, one line — compare this exact
        // line for the same text BEFORE vs AFTER mic grant. Identical
        // params ⇒ any audible difference is device audio ducking/
        // routing from the live capture session, not our synthesis.
        this.debug(
          `tts params: route=/api/tts speaker=server(SARVAM_TTS_SPEAKER) lang=${languageCode} pace=${pace} micLive=${!!this.getMicStream()} len=${text.length}`,
        );
        const tFetch = performance.now();
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Y1: no client-side speaker OR pace — the server owns the
          // शिष्य voice (SARVAM_TTS_SPEAKER/PACE) and its invalid-speaker
          // fallback. Sending pace would trip the override-reject log.
          body: JSON.stringify({ text, languageCode }),
        });
        const tFirstByte = performance.now();
        if (seq !== this.speechSeq) return "cancelled";
        this.debug(`tts status ${res.status}${res.ok ? "" : " → fallback"}`);
        if (!res.ok) {
          // 501 tts_unconfigured (dev without Sarvam key) / 503 — don't keep
          // hitting the endpoint this session
          if (res.status === 501 || res.status === 503) this.remoteTtsDown = true;
          this.logFallbackOnce(`HTTP ${res.status}`);
          return "failed";
        }
        this.lastVoiceGroundTruth = res.headers.get("x-voice");
        // Y5 TRIPWIRE: x-voice is the server's ground truth (speaker@pace).
        // If the speaker is anything but the profile's, shout — a stray
        // voice can never sound silently again.
        if (this.lastVoiceGroundTruth) {
          const resolvedSpeaker = this.lastVoiceGroundTruth.split("@")[0];
          if (resolvedSpeaker && resolvedSpeaker !== VOICE_PROFILE.speaker) {
            this.debug(`VOICE VIOLATION: ${this.lastVoiceGroundTruth} (expected ${VOICE_PROFILE.speaker})`);
            console.error(`[voice] VOICE VIOLATION: ${this.lastVoiceGroundTruth} — expected speaker ${VOICE_PROFILE.speaker}`);
          }
        }
        const data = (await res.json()) as { audioBase64?: string };
        audioBase64 = data?.audioBase64;
        this.debug(
          `tts timing: queue→fetch ${Math.round(tFetch - tQueue)}ms, fetch→audio ${Math.round(tFirstByte - tFetch)}ms (MISS)`,
        );
        if (audioBase64) void this.ttsCachePut(cacheKey, audioBase64);
      } catch (err) {
        if (seq !== this.speechSeq) return "cancelled";
        this.debug(`tts fetch threw: ${(err as Error)?.name || err}`);
        this.logFallbackOnce(err);
        return "failed";
      }
    }
    void cacheVerdict;
    if (!audioBase64) {
      this.debug("tts empty audio → fallback");
      this.logFallbackOnce("empty audio");
      return "failed";
    }
    if (seq !== this.speechSeq) return "cancelled";

    // U0d THE TESTIMONY LINE: what voice is about to sound, exactly.
    // On the founder's phone this single line ends the voice mystery.
    this.debug(
      `voice: sarvam:${(this.lastVoiceGroundTruth || `${VOICE_PROFILE.speaker}@${pace}`).replace("@", " pace=")} route=/api/tts cache=${cacheVerdict}`,
    );

    // A3: decode → Blob (audio/wav, matching Sarvam's output) → object URL
    // on THE persistent, gesture-bound element.
    return new Promise((resolve) => {
      try {
        const bytes = Uint8Array.from(atob(audioBase64!), (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        if (this.currentObjectUrl) URL.revokeObjectURL(this.currentObjectUrl);
        this.currentObjectUrl = url;

        const el = this.getAudioEl();
        let settled = false;
        let playing = false;
        // L-A NARRATION FAILSAFE: the playback promise must ALWAYS settle,
        // even when no media terminal event fires. A browser-initiated pause
        // (OS audio-focus steal on an incoming call, BT/headphone disconnect)
        // emits neither 'ended' nor 'error'; without a net the promise hangs,
        // finish() never runs, _speaking sticks true forever, and the whole
        // always-listening loop wedges deaf in NARRATING. onpause recovers it
        // instantly; the hard-cap timeout is the ultimate backstop.
        let failsafe: ReturnType<typeof setTimeout> | null = null;
        const done = (ok: boolean, verdict?: "parked") => {
          if (settled) return;
          settled = true;
          if (failsafe) { clearTimeout(failsafe); failsafe = null; }
          if (this.remoteCancel === cancel) this.remoteCancel = null;
          el.onended = null;
          el.onerror = null;
          el.onpause = null;
          if (verdict) resolve(verdict);
          else if (!ok && seq !== this.speechSeq) resolve("cancelled");
          else resolve(ok ? "played" : "failed");
        };
        const cancel = () => {
          try {
            el.pause();
          } catch {
            /* noop */
          }
          done(false);
        };
        this.remoteCancel = cancel;
        el.onended = () => {
          this.debug("audio ended");
          done(true);
        };
        el.onerror = () => {
          this.debug("audio element error");
          done(false);
        };
        // L-A: a pause we did not initiate, once playback has begun, is a
        // device/OS interruption (incoming call, unplugged earbud) — settle so
        // the loop recovers instead of hanging silently in NARRATING.
        el.onpause = () => {
          if (settled || !playing || el.ended) return;
          this.debug("audio paused mid-line (device/OS interrupt) — releasing narration");
          done(false);
        };
        el.muted = false;
        el.src = url;
        // L-A: hard cap independent of media events. No legitimate two-sentence
        // TTS line runs this long, so an unsettled utterance past the cap is a
        // wedge — release it. onpause handles the common case far sooner.
        const capMs = Math.min(45000, Math.max(8000, text.length * 150 + 5000));
        failsafe = setTimeout(() => {
          if (settled) return;
          this.debug(`audio failsafe timeout after ${capMs}ms — releasing narration`);
          done(false);
        }, capMs);
        el
          .play()
          .then(() => {
            playing = true;
            this.debug("audio.play() resolved");
            // G2: real playback began — failsafe timers must stand down
            this.notifyPlaybackStart();
          })
          .catch((err: unknown) => {
            const name = (err as Error)?.name || String(err);
            this.debug(`audio.play() rejected: ${name}`);
            if (name === "NotAllowedError" && seq === this.speechSeq) {
              // Autoplay refused this utterance — retry on the next
              // gesture rather than falling back to a voice that the
              // same policy would block too.
              this.parkForGesture(text, languageCode);
              done(false, "parked");
              return;
            }
            done(false);
          });
      } catch (err) {
        this.debug(`audio setup threw: ${(err as Error)?.name || err}`);
        resolve("failed");
      }
    });
  }

  private logFallbackOnce(detail: unknown): void {
    if (this.fallbackLogged) return;
    this.fallbackLogged = true;
    console.warn("[voice] /api/tts unavailable — falling back to speechSynthesis:", detail);
  }

  private announceVoiceUnavailable(): void {
    try {
      if (sessionStorage.getItem(VOICE_UNAVAILABLE_SHOWN) === "1") return;
      sessionStorage.setItem(VOICE_UNAVAILABLE_SHOWN, "1");
      window.dispatchEvent(new CustomEvent("hpj-voice-unavailable"));
    } catch {
      /* noop */
    }
  }

  stopSpeech(reason: string = "untagged"): void {
    // H1: a barge-in tap on an interactive element is a NAVIGATION —
    // cancel any deferred unlock/park flush; re-speaking the screen the
    // pandit is leaving would only be beheaded by its unmount.
    if (reason === "barge-in:tap") {
      this.lastBargeInAt = performance.now();
      if (this.pendingFlushTimer) {
        clearTimeout(this.pendingFlushTimer);
        this.pendingFlushTimer = null;
        this.debug("flush cancelled (barge-in nav tap)");
      }
    }
    // D3/F4 instrumentation: name every interrupter. Deliberate stops the
    // pandit caused or expects (tap barge-in, mute, backgrounding the
    // tab) are info lines; only an UNEXPECTED interrupter cutting a line
    // mid-air is the "speech gets cut off" bug signature. H1: nav
    // teardown (unmount:*, phase-transition) within 600ms of a tap is
    // user-caused navigation. K3: a voice command is the SAME gesture —
    // बोलना ही छूना है — so the window consults both clocks; and
    // 'user-nav:*' reasons are user navigation by name, always.
    const now = performance.now();
    const gestureNav =
      (reason.startsWith("unmount:") || reason === "phase-transition") &&
      (now - this.lastPointerdownAt < 600 || now - this.lastVoiceCommandAt < 600);
    if (this._speaking) {
      if (reason.startsWith("user-nav:")) {
        this.debug(`stopSpeech(${reason}) — intentional (nav/voice)`);
      } else if (isIntentionalStop(reason)) {
        this.debug(`stopSpeech(${reason}) — intentional`);
      } else if (gestureNav) {
        this.debug(`stopSpeech(${reason}) — intentional (nav/voice)`);
      } else {
        this.debug(`stopSpeech(${reason}) — MID-UTTERANCE ⚠`);
      }
    } else if (reason !== "speak-interrupt") this.debug(`stopSpeech(${reason})`);
    this.init();
    if (typeof window === "undefined") return;
    this.queued = null;
    // Pre-unlock there is nothing audible to silence — the parked line
    // must survive incidental stops (tap-silence rule, phase teardown) or
    // the app's very first narration dies before it can ever sound.
    // Post-unlock, screens re-park their own narration on mount, so a
    // stale line lives ≤150ms before the new screen interrupts it.
    if (this._unlocked) this.pendingUnlock = null;
    this.speechSeq++;
    this.remoteCancel?.();
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* noop */
    }
    import("@/lib/sarvam-tts")
      .then(({ stopCurrentSpeech }) => stopCurrentSpeech())
      .catch(() => {
        /* noop */
      });
    if (this._speaking) {
      this._speaking = false;
      this.emit();
    }
  }

  // ── mute (master switch for ALL voice interaction) ─────────
  setMuted(v: boolean): void {
    this.init();
    if (v === this._muted) return;
    this._muted = v;
    try {
      localStorage.setItem(MASTER_KEY, v ? "muted" : "on");
      // keep legacy readers coherent until they are all migrated
      localStorage.setItem("voice_enabled", String(!v));
      localStorage.setItem("voice_input_enabled", String(!v));
    } catch {
      /* noop */
    }
    if (v) {
      this.stopSpeech("mute");
      this.abortListening();
      // S5 privacy law: सो जाओ = the mic is TRULY off, not just idle
      this.releaseMicStream("sleep");
      this.releaseWakeLock("sleep");
    }
    this.emit();
    if (!v) {
      // शिष्य wakes: greeting, then re-narrate the current screen
      this.speak(t("shishya.wake"), {
        onEnd: () => {
          this.replayFn?.();
        },
      });
    }
  }

  /** Ruling #9 — an orb TAP repeats: re-narrate the current screen (the listen
   *  loop re-arms after). NEVER silences. Mirrors the REPEAT ("फिर से") grammar;
   *  replayFn's speak barges in the current line (newest-wins), so rapid taps
   *  restart rather than overlap. No-op while asleep (nothing to repeat). */
  repeatCurrent(): void {
    this.init();
    if (this._muted) return;
    this.noteVoiceGesture();
    this.replayFn?.();
  }

  /** Ruling #9 — THE one deliberate-mute entry point (the visible 'सुला दें'
   *  control AND the voice "सो जाओ" command both route here). SPEAK the farewell
   *  TO COMPLETION, THEN mute: setMuted(true) does the full release (stopSpeech +
   *  abortListening + releaseMicStream — S5 privacy) and runs only in onEnd, so
   *  the farewell is never cut. An interrupted/parked line (autoplay lock) still
   *  mutes in onEnd — the pandit asked for quiet. `afterMuted` runs once the mute
   *  has landed (used by the voice path for history-reset + the sleep event, so
   *  they don't fire while the farewell is still speaking). */
  muteWithFarewell(afterMuted?: () => void): void {
    this.init();
    if (this._muted) { afterMuted?.(); return; }
    this.speak(t("shishya.muteFarewell"), {
      onEnd: () => {
        this.setMuted(true);
        afterMuted?.();
      },
    });
  }

  // ── listening coordination ─────────────────────────────────
  /** useVoiceInput must call this before opening the mic. */
  guardListenStart(): boolean {
    this.init();
    if (this.paused || this._speaking) return false;
    this._listening = true;
    // T3: a fresh listen starts its heartbeat NOW (stale stamps must
    // not zombie-flag a listen that just began)
    this.noteListenActivity();
    // S5: the persistent stream wakes for the listen
    this.setMicTracksEnabled(true, "listen");
    this.emit();
    return true;
  }

  endListen(): void {
    if (!this._listening) return;
    this._listening = false;
    this.emit();
    const q = this.queued;
    this.queued = null;
    if (q && !this._muted) {
      this.speak(q.text, q.opts);
      return;
    }
    // Loop law: a resolved/expired listen quietly re-arms (no nagging)
    this.loopRearm();
  }

  private listenAborters = new Set<() => void>();
  registerListenAborter(fn: () => void): () => void {
    this.listenAborters.add(fn);
    return () => this.listenAborters.delete(fn);
  }
  private abortListening() {
    this.listenAborters.forEach((fn) => {
      try {
        fn();
      } catch {
        /* noop */
      }
    });
    this.endListen();
  }

  // ── per-screen narration replay ────────────────────────────
  registerReplay(fn: () => void): () => void {
    this.replayFn = fn;
    return () => {
      if (this.replayFn === fn) this.replayFn = null;
    };
  }
}

export const voiceController = new VoiceController();
export type { SpeakOpts };

// T2 (founder's phone verdict): enabled=false did NOT exit call-audio
// mode — the "bad boy" tone stayed while any live mic track existed.
// STRATEGY 'stop': during narration ALL mic tracks are stopped and the
// stream closed; the listen re-acquires via getUserMedia (permission
// already granted → no popup; latency measured + logged, pre-warmed at
// narration end so the listen finds a ready stream). 'mute' keeps the
// old S5 enabled-toggle as the fallback.
export const MIC_RELEASE_STRATEGY: "stop" | "mute" = "stop";
