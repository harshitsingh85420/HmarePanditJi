"use client";

// ─────────────────────────────────────────────────────────────
// VoiceField v2 — DUAL INPUT, ZERO MODES (Interaction Model A2/A4/A5).
// The input is ALWAYS visible and enabled. Voice arms alongside it:
// prompt speaks → mic auto-opens → spoken value lands in the SAME field
// with a "आपने कहा X — सही है?" loop. Typing at any moment aborts voice
// and is accepted without confirmation. After 2 failed voice rounds the
// field goes quiet ("कोई बात नहीं, नीचे लिख दीजिए") and a small 🎤 in the
// field's right slot re-arms it. Bank/OTP modes never arm the mic (A5).
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useVoice } from "../../hooks/useVoice";
import { useVoiceInput } from "../../hooks/useVoiceInput";
import { voiceController } from "../../lib/voiceController";
import { parseHindiNumber, parsePhoneNumber, matchChoice } from "../../lib/voiceParse";
import { extractOTP } from "../../lib/number-mapper";
import { hi } from "../../lib/strings";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export interface VoiceFieldProps {
  label: string;
  promptText: string;
  value: string;
  onChange: (v: string) => void;
  mode: "text" | "number" | "money" | "phone" | "otp" | "choice";
  choices?: Array<{ label: string; value: string; keywords: string[] }>;
  required?: boolean;
  onComplete?: () => void;
  placeholder?: string;
  disabled?: boolean;
  /** A5: never arm the mic (bank/IFSC/UPI). OTP mode implies this. */
  noVoice?: boolean;
}

import { reduce, type VFState, type VFEvent } from "./voiceFieldMachine";

function micGranted(): boolean {
  try {
    return localStorage.getItem("mic_permission_granted") === "true";
  } catch {
    return false;
  }
}

export function VoiceField({
  label,
  promptText,
  value,
  onChange,
  mode,
  choices,
  required,
  onComplete,
  placeholder,
  disabled,
  noVoice,
}: VoiceFieldProps) {
  const { enabled: voiceOn } = useVoice();
  const voiceInput = useVoiceInput();

  // A5: mic never arms for OTP (typed-only law) or explicitly silent fields
  const voiceCapable = voiceOn && !noVoice && mode !== "otp";

  const [state, setState] = useState<VFState>({ phase: "IDLE" });
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const startedRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const attemptsRef = useRef(attempts);
  attemptsRef.current = attempts;

  const parseValue = useCallback(
    (text: string): string | null => {
      if (mode === "text") return text.trim() || null;
      if (mode === "number" || mode === "money") {
        const n = parseHindiNumber(text);
        return n !== null ? String(n) : null;
      }
      if (mode === "phone") return parsePhoneNumber(text);
      if (mode === "otp") {
        const d = extractOTP(text);
        return d.length === 6 ? d : null;
      }
      if (mode === "choice") {
        const matched = matchChoice(text, choices || []);
        return matched ? matched.value : text.trim() || null;
      }
      return null;
    },
    [mode, choices],
  );

  const dispatch = useCallback(
    (e: VFEvent) => {
      {
        const result = reduce(stateRef.current, e, {
          attempts: attemptsRef.current,
          mode,
          parse: parseValue,
        });
        const { next, effects, accepted } = result;
        setAttempts(result.attempts);
        setState(next);

        effects.forEach((eff) => {
          switch (eff) {
            case "START_LISTEN":
              void voiceInput.start();
              break;
            case "STOP_LISTEN":
              voiceInput.reset();
              break;
            case "SPEAK_RETRY":
              voiceController.speak("माफ़ कीजिए, समझ नहीं आया। दोबारा बोलें।", {
                onEnd: (done) => {
                  if (done) void voiceInput.start();
                },
              });
              break;
            case "SPEAK_CONFIRM":
              if (next.phase === "CONFIRMING") {
                const display =
                  mode === "choice"
                    ? choices?.find((c) => c.value === next.parsed)?.label || next.parsed
                    : next.parsed;
                onChange(next.parsed); // spoken value lands in the SAME field
                voiceController.speak(`आपने कहा ${display}। सही है? हाँ या नहीं बोलें।`, {
                  onEnd: (done) => {
                    if (done) void voiceInput.start();
                  },
                });
              }
              break;
            case "SPEAK_FALLBACK":
              voiceController.speak("कोई बात नहीं, नीचे लिख दीजिए।");
              setTimeout(() => inputRef.current?.focus(), 150);
              break;
            case "EMIT_VALUE":
              if (accepted !== undefined) {
                onChange(accepted);
                setTimeout(() => onComplete?.(), 400);
              }
              break;
          }
        });
      }
    },
    [mode, parseValue, choices, onChange, onComplete, voiceInput],
  );

  // ── Arm voice on mount: speak the prompt, then auto-listen ──
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (!voiceCapable) return;
    setState({ phase: "PROMPTING" });
    const t = setTimeout(() => {
      voiceController.speak(promptText, {
        onEnd: (completed) => {
          // Only auto-open the mic when permission already exists — the
          // permission ask itself belongs to tutorial slide 5, never to a
          // surprise popup mid-form.
          if (completed && micGranted() && !voiceController.muted) {
            dispatch({ type: "SPEECH_DONE" });
          } else {
            setState({ phase: "IDLE" });
          }
        },
      });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mute while active → everything stops, field stays as a plain input
  useEffect(() => {
    if (!voiceOn && state.phase !== "IDLE") {
      voiceInput.reset();
      setState({ phase: "IDLE" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceOn]);

  // ── STT results → machine events ───────────────────────────
  useEffect(() => {
    if (voiceInput.state === "idle" && voiceInput.transcript) {
      if (state.phase === "CONFIRMING") {
        const t = voiceInput.transcript.toLowerCase().trim();
        const isYes = ["हाँ", "हां", "haan", "han", "yes", "सही", "ठीक", "हा"].some((w) => t.includes(w));
        const isNo = ["नहीं", "नही", "nahi", "no", "गलत"].some((w) => t.includes(w));
        voiceInput.reset();
        if (isYes) dispatch({ type: "CONFIRM_YES" });
        else if (isNo) dispatch({ type: "CONFIRM_NO" });
        else {
          voiceController.speak(`सही है? हाँ या नहीं बोलें।`, {
            onEnd: (done) => {
              if (done) void voiceInput.start();
            },
          });
        }
      } else if (state.phase === "LISTENING" || state.phase === "PROCESSING") {
        const text = voiceInput.transcript;
        const conf = voiceInput.confidence ?? 1;
        voiceInput.reset();
        dispatch({ type: "TRANSCRIPT", text, confidence: conf });
      }
    }
    if (voiceInput.state === "error" && state.phase !== "IDLE" && state.phase !== "PROMPTING") {
      voiceInput.reset();
      dispatch({ type: "STT_FAILED" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceInput.state, voiceInput.transcript]);

  const listening = state.phase === "LISTENING" && voiceInput.state === "listening";
  const busy = state.phase === "PROCESSING" || voiceInput.state === "processing";

  const handleTyped = (v: string) => {
    if (state.phase !== "IDLE") dispatch({ type: "TYPED_INPUT" });
    onChange(v);
  };

  const inputType =
    mode === "number" || mode === "money" ? "number" : mode === "phone" || mode === "otp" ? "tel" : "text";

  return (
    <div className="w-full flex flex-col gap-2">
      {label && (
        <label className="t-title font-bold text-ink text-left">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      {/* THE field — always visible, always enabled (A2) */}
      <div className="relative w-full">
        {mode === "choice" && choices ? (
          <select
            disabled={disabled}
            value={value}
            onFocus={() => state.phase !== "IDLE" && dispatch({ type: "TYPED_INPUT" })}
            onChange={(e) => {
              handleTyped(e.target.value);
              if (e.target.value) onComplete?.();
            }}
            className={`w-full min-h-[56px] text-[18px] bg-white border rounded-btn px-4 pr-14 font-medium focus:outline-none focus:ring-4 focus:ring-saffron-200 ${
              listening ? "border-gold ring-4 ring-gold/40 animate-pulse" : "border-saffron-200"
            }`}
          >
            <option value="">{placeholder || "-- चुनें --"}</option>
            {choices.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            ref={inputRef}
            type={inputType}
            disabled={disabled}
            placeholder={placeholder}
            value={value}
            onFocus={() => state.phase !== "IDLE" && dispatch({ type: "TYPED_INPUT" })}
            onChange={(e) => handleTyped(e.target.value)}
            className={`w-full min-h-[56px] text-[18px] bg-white border rounded-btn px-4 pr-14 font-medium focus:outline-none focus:ring-4 focus:ring-saffron-200 ${
              listening ? "border-gold ring-4 ring-gold/40 animate-pulse" : "border-saffron-200"
            }`}
          />
        )}

        {/* Right slot inside the field: live mic / re-arm 🎤 (A2/A4) */}
        {voiceCapable && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            {listening ? (
              <span className="text-[22px] animate-pulse" role="img" aria-hidden="true">🎤</span>
            ) : busy ? (
              <span className="text-[20px] animate-spin inline-block" role="img" aria-hidden="true">🪔</span>
            ) : (
              <button
                type="button"
                onClick={() => dispatch({ type: "TAP_MIC_RETRY" })}
                aria-label="बोलकर बताएं"
                className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-saffron-50 hover:bg-saffron-100 active:scale-95 text-[20px] flex items-center justify-center border border-saffron-200 focus:outline-none"
              >
                🎤
              </button>
            )}
          </span>
        )}
      </div>

      {/* Listening pill (A4) — never a full-screen takeover */}
      {listening && (
        <span className="self-start bg-gold/15 border border-gold text-temple-600 text-[16px] font-semibold font-hindi rounded-full px-4 py-1.5">
          सुन रहा हूँ…
        </span>
      )}

      {/* Spoken-value confirmation loop */}
      {state.phase === "CONFIRMING" && (
        <div className="flex items-center justify-between gap-3 bg-saffron-50 border border-saffron-100 rounded-card px-4 py-3">
          <span className="t-body font-semibold text-ink font-hindi">
            आपने कहा <span className="font-bold text-saffron-700">{
              mode === "choice"
                ? choices?.find((c) => c.value === state.parsed)?.label || state.parsed
                : state.parsed
            }</span> — सही है?
          </span>
          <div className="flex gap-2 shrink-0">
            <Button variant="success" size="md" onClick={() => dispatch({ type: "CONFIRM_YES" })}>
              {hi.common.yes}
            </Button>
            <Button variant="danger-outline" size="md" onClick={() => dispatch({ type: "CONFIRM_NO" })}>
              {hi.common.no}
            </Button>
          </div>
        </div>
      )}

      {/* Mic permission explainer (only reachable from the explicit 🎤 tap) */}
      {voiceInput.showExplainer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <Card className="max-w-[340px] w-full flex flex-col items-center justify-center text-center p-6 gap-4">
            <div className="text-[64px] leading-none" role="img" aria-label="Microphone">🎤</div>
            <h3 className="t-title font-bold text-ink">माइक की अनुमति आवश्यक है</h3>
            <p className="t-body text-softgrey">कृपया माइक की अनुमति दें, ताकि आप बोलकर जवाब दे सकें।</p>
            <div className="w-full flex flex-col gap-2 mt-2">
              <Button variant="primary" size="md" fullWidth onClick={voiceInput.proceedWithPermission}>
                अनुमति दें / Allow
              </Button>
              <Button variant="ghost" size="md" fullWidth onClick={voiceInput.cancelExplainer}>
                रद्द करें
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
export default VoiceField;
