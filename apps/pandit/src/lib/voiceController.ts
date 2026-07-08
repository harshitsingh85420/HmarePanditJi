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

type SpeakOpts = {
  interrupt?: boolean;
  onEnd?: (completed: boolean) => void;
  /** BCP-47 override for lines that must sound in a specific language
   *  (e.g. the language-confirm ceremony). Default: the ACTIVE app language. */
  languageCode?: string;
};

const MASTER_KEY = "voice_master";
// Once-per-session flag for the "voice unavailable" toast (X2b)
const VOICE_UNAVAILABLE_SHOWN = "hpj_voice_unavailable_shown";
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
  private _listening = false;
  private _hidden = false;
  private _confirming = false;
  private queued: { text: string; opts?: SpeakOpts } | null = null;
  private replayFn: (() => void) | null = null;
  private listeners = new Set<() => void>();
  private initialized = false;

  // ── AUDIO UNLOCK (X2a) ─────────────────────────────────────
  // No sound may play before the app's first pointerdown (autoplay policy).
  // Pre-gesture speak()s park here (newest wins) and flush on unlock.
  private _unlocked = false;
  private pendingUnlock: { text: string; languageCode?: string } | null = null;

  // ── TTS CHAIN (X2b) ────────────────────────────────────────
  // Primary: POST /api/tts (Sarvam) played through an <audio> element.
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
  private autoTargets: Array<{ priority: number; arm: () => void }> = [];
  private rearmTimer: ReturnType<typeof setTimeout> | null = null;

  private init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;
    this._muted = readInitialMuted();
    this._hidden = document.visibilityState === "hidden";
    document.addEventListener("visibilitychange", () => {
      this._hidden = document.visibilityState === "hidden";
      if (this._hidden) {
        this.stopSpeech();
        this.abortListening();
      }
      this.emit();
    });
    // X2a: the app's FIRST pointerdown anywhere (a splash tap counts)
    // unlocks audio and flushes the queued narration.
    document.addEventListener("pointerdown", () => this.unlock(), { once: true, capture: true });
  }

  private unlock() {
    if (this._unlocked) return;
    this._unlocked = true;
    try {
      const a = new Audio(SILENT_WAV);
      a.muted = true;
      void a.play().catch(() => {
        /* noop — the gesture itself is what matters */
      });
      window.speechSynthesis?.resume();
    } catch {
      /* noop */
    }
    const parked = this.pendingUnlock;
    this.pendingUnlock = null;
    if (parked && !this._muted) {
      // Defer past this same tap's other capture handlers — the
      // "interactive tap silences narration" rule (VoiceRoot) would
      // otherwise kill the very line this gesture just released.
      setTimeout(() => {
        if (!this._muted) this.speak(parked.text, { languageCode: parked.languageCode });
      }, 0);
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

  /** Register an auto-listen target. Higher priority wins (field=1, commands=0). */
  registerAutoListen(priority: number, arm: () => void): () => void {
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
      if (this.paused || this._speaking || this._listening) return;
      const top = [...this.autoTargets].sort((a, b) => b.priority - a.priority)[0];
      top?.arm();
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
      return;
    }
    // X2a AUDIO-UNLOCK LAW: nothing may sound before the first gesture.
    // Park the line (newest wins), let the caller's flow continue, and
    // narrate on unlock.
    if (!this._unlocked) {
      this.pendingUnlock = { text, languageCode: opts?.languageCode };
      opts?.onEnd?.(false);
      return;
    }
    // Barge-out: speaking during a listen aborts the listen first, then
    // speaks; the loop re-arms after the speech ends.
    if (this._listening) {
      this.abortListening();
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
      if (q && !this._muted && !this._listening) {
        this.speak(q.text, q.opts);
        return;
      }
      // ALWAYS-LISTENING LAW: after any speech ends, re-arm the loop
      this.loopRearm();
    };

    void this.speakNow(text, opts?.languageCode ?? getActiveBcp47(), finish);
  }

  // X2b + D3: primary = /api/tts (Sarvam, ACTIVE language) via <audio>;
  // any non-200/throw falls back to speechSynthesis with the same BCP-47
  // tag (voice-engine picks the closest voice, defaulting to Hindi when
  // none matches). Both unavailable → one toast per session.
  private async speakNow(text: string, languageCode: string, finish: (completed: boolean) => void): Promise<void> {
    const seq = ++this.speechSeq;
    const remote = await this.tryRemoteTTS(text, languageCode, seq);
    if (remote === "played") {
      finish(true);
      return;
    }
    if (remote === "cancelled" || seq !== this.speechSeq) {
      finish(false);
      return;
    }
    if (!window.speechSynthesis) {
      this.announceVoiceUnavailable();
      finish(false);
      return;
    }
    try {
      const { speakWithSarvam } = await import("@/lib/sarvam-tts");
      await speakWithSarvam({
        text,
        languageCode: languageCode as never,
        onEnd: () => finish(true),
        onError: () => finish(false),
      });
      finish(true);
    } catch {
      finish(false);
    }
  }

  private async tryRemoteTTS(
    text: string,
    languageCode: string,
    seq: number,
  ): Promise<"played" | "failed" | "cancelled"> {
    if (this.remoteTtsDown) return "failed";
    let audioBase64: string | undefined;
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // D4: no client-side speaker — the server owns the शिष्य voice
        // (SARVAM_TTS_SPEAKER, male) and its invalid-speaker fallback.
        body: JSON.stringify({ text, languageCode, pace: 0.82 }),
      });
      if (seq !== this.speechSeq) return "cancelled";
      if (!res.ok) {
        // 501 tts_unconfigured (dev without Sarvam key) / 503 — don't keep
        // hitting the endpoint this session
        if (res.status === 501 || res.status === 503) this.remoteTtsDown = true;
        this.logFallbackOnce(`HTTP ${res.status}`);
        return "failed";
      }
      const data = (await res.json()) as { audioBase64?: string };
      audioBase64 = data?.audioBase64;
    } catch (err) {
      if (seq !== this.speechSeq) return "cancelled";
      this.logFallbackOnce(err);
      return "failed";
    }
    if (!audioBase64) {
      this.logFallbackOnce("empty audio");
      return "failed";
    }
    if (seq !== this.speechSeq) return "cancelled";

    return new Promise((resolve) => {
      try {
        const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
        let settled = false;
        const done = (ok: boolean) => {
          if (settled) return;
          settled = true;
          if (this.remoteCancel === cancel) this.remoteCancel = null;
          if (!ok && seq !== this.speechSeq) resolve("cancelled");
          else resolve(ok ? "played" : "failed");
        };
        const cancel = () => {
          try {
            audio.pause();
          } catch {
            /* noop */
          }
          done(false);
        };
        this.remoteCancel = cancel;
        audio.onended = () => done(true);
        audio.onerror = () => done(false);
        audio.play().catch(() => done(false));
      } catch {
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

  stopSpeech(): void {
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
      this.stopSpeech();
      this.abortListening();
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

  // ── listening coordination ─────────────────────────────────
  /** useVoiceInput must call this before opening the mic. */
  guardListenStart(): boolean {
    this.init();
    if (this.paused || this._speaking) return false;
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
