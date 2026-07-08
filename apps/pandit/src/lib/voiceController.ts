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

type SpeakOpts = { interrupt?: boolean; onEnd?: (completed: boolean) => void };

const MASTER_KEY = "voice_master";

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

class VoiceController {
  private _muted = false;
  private _speaking = false;
  private _listening = false;
  private queued: { text: string; opts?: SpeakOpts } | null = null;
  private replayFn: (() => void) | null = null;
  private listeners = new Set<() => void>();
  private initialized = false;

  private init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;
    this._muted = readInitialMuted();
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
      return;
    }
    // Never speak over an open mic — queue (depth 1, newest wins).
    if (this._listening) {
      if (this.queued) this.queued.opts?.onEnd?.(false);
      this.queued = { text, opts };
      return;
    }
    const interrupt = opts?.interrupt !== false;
    if (interrupt) this.stopSpeech();
    else if (this._speaking) {
      // non-interrupting speak while already speaking → newest-wins queue
      if (this.queued) this.queued.opts?.onEnd?.(false);
      this.queued = { text, opts };
      return;
    }

    this._speaking = true;
    this.emit();

    let settled = false;
    const finish = (completed: boolean) => {
      if (settled) return;
      settled = true;
      this._speaking = false;
      this.emit();
      opts?.onEnd?.(completed);
      // drain anything queued while we spoke
      const q = this.queued;
      this.queued = null;
      if (q && !this._muted && !this._listening) this.speak(q.text, q.opts);
    };

    import("@/lib/sarvam-tts")
      .then(({ speakWithSarvam }) =>
        speakWithSarvam({
          text,
          languageCode: "hi-IN",
          onEnd: () => finish(true),
          onError: () => finish(false),
        }),
      )
      .then(() => finish(true))
      .catch(() => finish(false));
  }

  stopSpeech(): void {
    this.init();
    if (typeof window === "undefined") return;
    this.queued = null;
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
      this.stopSpeech();
      this.abortListening();
    }
    this.emit();
    if (!v) {
      // brief confirmation, then re-narrate the current screen
      this.speak("आवाज़ चालू", {
        onEnd: () => {
          this.replayFn?.();
        },
      });
    }
  }

  // ── listening coordination ─────────────────────────────────
  /** useVoiceInput must call this before opening the mic. */
  guardListenStart(): boolean {
    this.init();
    if (this._muted || this._speaking) return false;
    this._listening = true;
    this.emit();
    return true;
  }

  endListen(): void {
    if (!this._listening) return;
    this._listening = false;
    this.emit();
    const q = this.queued;
    this.queued = null;
    if (q && !this._muted) this.speak(q.text, q.opts);
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
