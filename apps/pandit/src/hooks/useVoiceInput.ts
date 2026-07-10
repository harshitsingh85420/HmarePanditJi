"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { voiceController } from "@/lib/voiceController";
import { API_BASE } from "@/lib/api";
import { getActiveLang } from "@/lib/i18n";

export interface UseVoiceInputReturn {
  state: "idle" | "listening" | "processing" | "error";
  /** opts.stream: a pre-acquired MediaStream (from a user-gesture
   *  getUserMedia) — consumed directly so the mic is never requested twice.
   *  opts.mode: 'command' = J3 adaptive endpointing for 1-3 word answers
   *  (700ms silence stop, 8s cap, no smart_format) — 'field' (default)
   *  keeps 1500ms/15s for dictation. */
  start: (opts?: { stream?: MediaStream; mode?: "field" | "command" }) => Promise<void>;
  stop: () => void;
  transcript: string | null;
  confidence: number | null;
  /** True once the silence detector heard actual speech this listen —
   *  practice drills count this as "heard" even if STT upload fails. */
  heardSpeech: boolean;
  reset: () => void;
  showExplainer: boolean;
  proceedWithPermission: () => Promise<void>;
  cancelExplainer: () => void;
}

/** Best-effort browser mic-permission state ('unknown' where unsupported). */
async function queryMicPermission(): Promise<"granted" | "denied" | "prompt" | "unknown"> {
  try {
    if (!navigator.permissions?.query) return "unknown";
    const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
    return status.state;
  } catch {
    return "unknown";
  }
}

export function useVoiceInput(): UseVoiceInputReturn {
  const [state, setState] = useState<"idle" | "listening" | "processing" | "error">("idle");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [heardSpeech, setHeardSpeech] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);

  // Refs for tracking active resources
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const skipUploadRef = useRef<boolean>(false);

  // Cleanup helper
  const cleanup = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // ignore
      }
      audioContextRef.current = null;
    }
    mediaRecorderRef.current = null;

    // Tell the controller the mic is closed — it drains any queued speech
    voiceController.endListen();
  }, []);

  // Cleanup on unmount + abort instantly when the pandit mutes the app
  useEffect(() => {
    const unregister = voiceController.registerListenAborter(() => {
      cleanup();
      setState("idle");
    });
    return () => {
      unregister();
      cleanup();
    };
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setState("idle");
    setTranscript(null);
    setConfidence(null);
    setHeardSpeech(false);
  }, [cleanup]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startRecording = useCallback(async (preStream?: MediaStream, mode: "field" | "command" = "field") => {
    cleanup();

    // A5: Never-hear-itself rule — the controller refuses to open the mic
    // while speaking or muted, and marks us as listening otherwise.
    voiceController.stopSpeech("listen-start");
    if (!voiceController.guardListenStart()) {
      // release a gesture-acquired stream we will never consume
      preStream?.getTracks().forEach((track) => track.stop());
      setState("idle");
      return;
    }

    setState("listening");
    setTranscript(null);
    setConfidence(null);
    setHeardSpeech(false);
    skipUploadRef.current = false;

    try {
      const stream =
        preStream ??
        (await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        }));

      // The flag records REALITY: set only after a stream is in hand.
      localStorage.setItem("mic_permission_granted", "true");

      streamRef.current = stream;

      // A3: Silence detection logic using exact numbers
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;

      const src = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      src.connect(analyser);

      const buf = new Uint8Array(analyser.fftSize);
      let silentMs = 0;
      let spokeOnce = false;
      const TICK = 100;
      const SILENCE_RMS = 0.015;
      // J3b adaptive endpointing: 1-3 word command answers stop 800ms
      // sooner than field dictation — the biggest single latency win.
      const SILENCE_LIMIT = mode === "command" ? 700 : 1500;
      const HARD_CAP = mode === "command" ? 8000 : 15000;
      let elapsed = 0;
      // J3a: per-utterance timing — speech-end → upload → response
      let tSpeechEnd = 0;

      // A4: MediaRecorder mime fallback - exact
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "";
      
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      mediaRecorderRef.current = rec;
      const chunks: Blob[] = [];

      rec.ondataavailable = (e) => { 
        if (e.data.size > 0) chunks.push(e.data); 
      };

      const stopRecording = () => {
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
        // J3d INSTANT-FEEL: speech has ended — 'समझ रहा हूँ' within the
        // same tick (≤100ms law), long before STT returns.
        tSpeechEnd = performance.now();
        voiceController.setProcessing(true);
        if (rec.state !== "inactive") {
          rec.stop();
        }
        try {
          audioCtx.close();
        } catch (e) {
          // ignore
        }
        stream.getTracks().forEach(t => t.stop());
      };

      rec.onstop = async () => {
        setState("processing");

        // Exited via hard cap with no speech
        if (skipUploadRef.current) {
          voiceController.setProcessing(false);
          setState("error");
          return;
        }

        const blob = new Blob(chunks, { type: mime || "audio/webm" });
        if (blob.size < 1000) {
          voiceController.setProcessing(false);
          setState("error");
          return;
        } // too short = nothing said

        const fd = new FormData(); 
        fd.append("file", blob, mime.includes("mp4") ? "speech.mp4" : "speech.webm");

        // POST /api/stt with Bearer token, 8s AbortController timeout → TRANSCRIPT or STT_FAILED
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
          const token = localStorage.getItem("pandit_token");

          // G1: multipart can't use api() (it forces JSON) but the BASE
          // must come from the single prefix-normalized source.
          // J3c: command mode disables smart_format server-side.
          const tUpload = performance.now();
          // L4/P2: Deepgram transcribes in the ACTIVE language — every
          // non-hi code is sent; the SERVER owns the nova-2 support map
          // and falls back to the hi model where Deepgram lacks the
          // language. The hi default stays implicit.
          const sttParams = new URLSearchParams();
          if (mode === "command") sttParams.set("mode", "command");
          const activeLang = getActiveLang();
          if (activeLang !== "hi") sttParams.set("language", activeLang);
          const sttQs = sttParams.toString();
          const response = await fetch(`${API_BASE}/stt${sttQs ? `?${sttQs}` : ""}`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: fd,
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            voiceController.debug(`stt upload HTTP ${response.status}`);
            voiceController.setProcessing(false);
            setState("error");
            return;
          }

          const resJson = await response.json();
          const tDone = performance.now();
          if (resJson.success && resJson.data) {
            // J3a: the number that matters — user stopped speaking → app
            // has the words (action follows in the same tick)
            voiceController.debug(
              `stt e2e(${mode}): speechEnd→transcript ${Math.round(tDone - tSpeechEnd)}ms ` +
              `(encode ${Math.round(tUpload - tSpeechEnd)}ms, server ${Math.round(tDone - tUpload)}ms) ` +
              `"${String(resJson.data.transcript || "").slice(0, 30)}"`,
            );
            voiceController.setProcessing(false);
            setTranscript(resJson.data.transcript);
            setConfidence(resJson.data.confidence);
            setState("idle");
          } else {
            voiceController.debug("stt: upload ok but no transcript");
            voiceController.setProcessing(false);
            setState("error");
          }
        } catch (err) {
          clearTimeout(timeoutId);
          console.error("[useVoiceInput] STT upload error:", err);
          voiceController.setProcessing(false);
          setState("error");
        }
      };

      rec.start();

      const timer = setInterval(() => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0; 
        for (let i = 0; i < buf.length; i++) { 
          const v = (buf[i] - 128) / 128; 
          sum += v * v; 
        }
        const rms = Math.sqrt(sum / buf.length);
        elapsed += TICK;

        if (rms > SILENCE_RMS) {
          if (!spokeOnce) {
            voiceController.debug("stt: speech detected (rms)");
            setHeardSpeech(true);
          }
          spokeOnce = true;
          silentMs = 0;
        } else {
          silentMs += TICK;
        }

        // If HARD_CAP reached with spokeOnce===false → dispatch STT_FAILED without calling the API
        if (elapsed >= HARD_CAP && !spokeOnce) {
          skipUploadRef.current = true;
          stopRecording();
          setState("error");
          return;
        }

        // stop only after user has spoken at least once, then goes silent 1.5s — OR hard cap
        if ((spokeOnce && silentMs >= SILENCE_LIMIT) || elapsed >= HARD_CAP) { 
          stopRecording(); 
        }
      }, TICK);

      intervalIdRef.current = timer;

    } catch (err) {
      console.error("[useVoiceInput] getUserMedia error:", err);
      // A denied/failed request must not leave a stale 'granted' flag —
      // it would make the auto-listen loop re-request without a gesture.
      if (!preStream) localStorage.setItem("mic_permission_granted", "false");
      setState("error");
      cleanup();
    }
  }, [cleanup]);

  const start = useCallback(async (opts?: { stream?: MediaStream; mode?: "field" | "command" }) => {
    // E2E traversal (?e2e=1): never open the mic — settle the listen
    // immediately as a no-speech miss so listen-gated screens move on.
    if (voiceController.e2e) {
      voiceController.debug("e2e: listen bypassed");
      opts?.stream?.getTracks().forEach((track) => track.stop());
      setState("error");
      return;
    }
    // Gesture path: a pre-acquired stream is consumed directly.
    if (opts?.stream) {
      await startRecording(opts.stream, opts?.mode ?? "field");
      return;
    }
    const isGranted = localStorage.getItem("mic_permission_granted") === "true";
    if (!isGranted) {
      setShowExplainer(true);
      return;
    }
    // Auto-listen path (no gesture): the FIRST-ever mic use in a session
    // must be tap-tied, so only proceed when the browser itself says
    // 'granted' — 'prompt' re-routes through the tap-gated explainer and
    // 'denied' goes quietly idle (typing always works).
    const browserState = await queryMicPermission();
    if (browserState === "prompt") {
      localStorage.setItem("mic_permission_granted", "false");
      setShowExplainer(true);
      return;
    }
    if (browserState === "denied") {
      localStorage.setItem("mic_permission_granted", "false");
      setState("error");
      return;
    }
    await startRecording(undefined, opts?.mode ?? "field");
  }, [startRecording]);

  const proceedWithPermission = useCallback(async () => {
    setShowExplainer(false);
    // The confirm tap IS the gesture — getUserMedia fires inside it, and
    // the granted flag is written only after the stream is acquired.
    await startRecording();
  }, [startRecording]);

  const cancelExplainer = useCallback(() => {
    setShowExplainer(false);
    setState("error");
  }, []);

  return {
    state,
    start,
    stop,
    transcript,
    confidence,
    heardSpeech,
    reset,
    showExplainer,
    proceedWithPermission,
    cancelExplainer,
  };
}
export default useVoiceInput;
