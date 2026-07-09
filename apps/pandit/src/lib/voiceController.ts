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
const INTENTIONAL_STOPS = new Set(["tab-hidden", "barge-in:tap", "mute", "speak-interrupt"]);
function isIntentionalStop(reason: string): boolean {
  return (
    INTENTIONAL_STOPS.has(reason) ||
    reason.endsWith(":grant-settle") ||
    reason.startsWith("hardware-back:")
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
  private _listening = false;
  private _hidden = false;
  private _confirming = false;
  private queued: { text: string; opts?: SpeakOpts } | null = null;
  private replayFn: (() => void) | null = null;
  private listeners = new Set<() => void>();
  private initialized = false;

  // ── AUDIO UNLOCK (X2a/A3) ──────────────────────────────────
  // No sound may play before the app's first pointerdown (autoplay policy).
  // Pre-gesture speak()s park here (newest wins) and flush on unlock.
  private _unlocked = false;
  private pendingUnlock: { text: string; languageCode?: string } | null = null;
  // A3: ONE persistent element carries every Sarvam playback — the silent
  // unlock play binds the autoplay permission to this exact element.
  private audioEl: HTMLAudioElement | null = null;
  private currentObjectUrl: string | null = null;

  // ── ON-DEVICE DEBUG (A1, ?voicedebug=1) ────────────────────
  // Immutable ring buffer so useSyncExternalStore sees fresh snapshots.
  private debugBuf: readonly string[] = [];
  private debugListeners = new Set<() => void>();

  debug(msg: string): void {
    if (typeof window === "undefined") return;
    const ts = new Date().toISOString().slice(11, 23);
    this.debugBuf = [...this.debugBuf.slice(-199), `${ts} ${msg}`];
    this.debugListeners.forEach((cb) => cb());
  }

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
        this.stopSpeech("tab-hidden");
        this.abortListening();
      }
      this.emit();
    });
    // X2a: the app's FIRST pointerdown anywhere (a splash tap counts)
    // unlocks audio and flushes the queued narration.
    document.addEventListener("pointerdown", () => this.unlock(), { once: true, capture: true });
    // F2: a CSP-blocked fetch surfaces as a bare TypeError with zero
    // network entries — indistinguishable from other blocks unless the
    // violation event itself is logged. This line IS the verdict channel.
    document.addEventListener("securitypolicyviolation", (e) => {
      this.debug(`CSP BLOCK: ${e.blockedURI} (${e.violatedDirective})`);
    });
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
      // otherwise kill the very line this gesture just released.
      setTimeout(() => {
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
            setTimeout(() => {
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
    this.emit();

    let settled = false;
    const finish = (completed: boolean, status?: SpeakOutcome) => {
      if (settled) return;
      settled = true;
      this._speaking = false;
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
      // ALWAYS-LISTENING LAW: after any speech ends, re-arm the loop
      this.loopRearm();
    };

    void this.speakNow(text, opts?.languageCode ?? getActiveBcp47(), finish);
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
    if (!window.speechSynthesis) {
      this.debug("fallback: speechSynthesis unavailable → text-only");
      this.announceVoiceUnavailable();
      finish(false, "failed");
      return;
    }
    this.debug("fallback: sarvam→speechSynthesis");
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
      this.debug(`speechSynthesis voice: ${voice.name} (${voice.lang})`);
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

  // ── D3b CLIENT AUDIO CACHE (CacheStorage 'shishya-tts-v1') ─────────
  // Keyed sha1(voice|pace|lang|text). Cache-first playback makes every
  // static entry-flow line instant from its 2nd hearing forever; misses
  // fetch then cache.put. LRU-ish cap ~300 via x-cached-at timestamps.
  private static TTS_CACHE = "shishya-tts-v1";
  private static TTS_CACHE_MAX = 300;

  private async ttsCacheKey(text: string, languageCode: string, pace: number): Promise<string | null> {
    try {
      const raw = `server|${pace}|${languageCode}|${text}`;
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
            body: JSON.stringify({ text, languageCode, pace }),
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
        const tFetch = performance.now();
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // D4: no client-side speaker — the server owns the शिष्य voice
          // (SARVAM_TTS_SPEAKER, male) and its invalid-speaker fallback.
          body: JSON.stringify({ text, languageCode, pace }),
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
        const done = (ok: boolean, verdict?: "parked") => {
          if (settled) return;
          settled = true;
          if (this.remoteCancel === cancel) this.remoteCancel = null;
          el.onended = null;
          el.onerror = null;
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
        el.muted = false;
        el.src = url;
        el
          .play()
          .then(() => {
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
    // D3/F4 instrumentation: name every interrupter. Deliberate stops the
    // pandit caused or expects (tap barge-in, mute, backgrounding the
    // tab) are info lines; only an UNEXPECTED interrupter cutting a line
    // mid-air (phase-transition, unmount:*, unknown) is the "speech gets
    // cut off" bug signature.
    if (this._speaking) {
      if (isIntentionalStop(reason)) this.debug(`stopSpeech(${reason}) — intentional`);
      else this.debug(`stopSpeech(${reason}) — MID-UTTERANCE ⚠`);
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
