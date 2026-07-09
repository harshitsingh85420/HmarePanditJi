"use client";

// ─────────────────────────────────────────────────────────────
// VoiceField v3 — ALWAYS-LISTENING LOOP (Spec 1).
// The input is ALWAYS visible and enabled; while voice_master is ON the
// field is the loop's priority listen target: narrate → listen →
// confirm/act → listen → … forever. Failures apologize at most ONCE and
// keep listening. Typing aborts the listen and wins with no confirm
// loop; when the field blurs/advances the loop re-arms. There is NO mic
// icon or mic button — the only feedback is the gold ring + the
// "सुन रहा हूँ…" pill. Bank/OTP fields never arm the mic (A5): the loop
// skips them and the screen states why once.
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useVoice } from "../../hooks/useVoice";
import { useVoiceInput } from "../../hooks/useVoiceInput";
import { voiceController } from "../../lib/voiceController";
import { parseHindiNumber, parsePhoneNumber, matchChoice } from "../../lib/voiceParse";
import { matchYesNo } from "../../lib/voiceGrammar";
import { extractOTP } from "../../lib/number-mapper";
import { t } from "../../lib/i18n";
import { Button } from "../ui/Button";

import { reduce, type VFState, type VFEvent } from "./voiceFieldMachine";

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
      const result = reduce(stateRef.current, e, {
        attempts: attemptsRef.current,
        mode,
        parse: parseValue,
      });
      const { next, effects, accepted } = result;
      setAttempts(result.attempts);
      setState(next);
      voiceController.setConfirming(next.phase === "CONFIRMING");

      effects.forEach((eff) => {
        switch (eff) {
          case "START_LISTEN":
            void voiceInput.start();
            break;
          case "STOP_LISTEN":
            voiceInput.reset();
            break;
          case "SPEAK_SORRY_ONCE":
            voiceController.speak(t("voiceLoop.sorryOnce"), {
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
              voiceController.speak(
                t("voiceLoop.confirmAsk").replace("{value}", String(display)),
                {
                  onEnd: (done) => {
                    if (done) void voiceInput.start();
                  },
                },
              );
            }
            break;
          case "EMIT_VALUE":
            if (accepted !== undefined) {
              onChange(accepted);
              // K3: a voice-accepted value is a GESTURE — stamp now and
              // again as the completion action fires (it may navigate)
              voiceController.noteVoiceGesture();
              setTimeout(() => {
                voiceController.noteVoiceGesture();
                onComplete?.();
              }, 400);
            }
            break;
        }
      });
    },
    [mode, parseValue, choices, onChange, onComplete, voiceInput],
  );
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  const valueRef = useRef(value);
  valueRef.current = value;

  // ── Loop registration: this field is the screen's priority target.
  // J2: a FILLED field declines its turn — the next empty field (or the
  // screen's command listen) gets the mic instead, so multi-field
  // screens traverse by voice alone. ──
  useEffect(() => {
    if (!voiceCapable) return;
    const unregister = voiceController.registerAutoListen(1, () => {
      if ((valueRef.current ?? "").trim()) return false;
      const ph = stateRef.current.phase;
      if (ph === "IDLE" || ph === "LISTENING") {
        setState({ phase: "LISTENING" });
        void voiceInput.start({ mode: "field" });
      }
    });
    return unregister;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceCapable]);

  // J1: first-claim hook for INJECTED transcripts (voicedebug driver) —
  // an EMPTY field claims parseable text exactly like the live pipeline;
  // a filled field defers to the command registry (injector's next stop).
  useEffect(() => {
    if (!voiceCapable) return;
    return voiceController.registerFieldClaim((text) => {
      // mirror the live confirm listen: a pending confirmation claims
      // हाँ/नहीं before anything else does
      if (stateRef.current.phase === "CONFIRMING") {
        const yn = matchYesNo(text);
        if (yn === "yes") {
          dispatchRef.current({ type: "CONFIRM_YES" });
          return true;
        }
        if (yn === "no") {
          dispatchRef.current({ type: "CONFIRM_NO" });
          return true;
        }
        return false;
      }
      if ((value ?? "").trim()) return false;
      if (voiceController.isPureCommand(text)) return false;
      if (parseValue(text) === null) return false;
      // the injected transcript arrives OUTSIDE a live listen — enter
      // LISTENING first so the machine's real TRANSCRIPT path runs
      stateRef.current = { phase: "LISTENING" };
      setState({ phase: "LISTENING" });
      dispatchRef.current({ type: "TRANSCRIPT", text, confidence: 1 });
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceCapable, value, parseValue]);

  // ── Arm on mount: speak the prompt, then the loop takes over ──
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (!voiceCapable) return;
    setState({ phase: "PROMPTING" });
    const timer = setTimeout(() => {
      voiceController.speak(promptText, {
        onEnd: (completed) => {
          if (completed && !voiceController.paused) {
            dispatchRef.current({ type: "SPEECH_DONE" });
          } else {
            setState({ phase: "IDLE" });
          }
        },
      });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pause (mute / hidden / micDenied) → plain typed field
  useEffect(() => {
    if (!voiceOn && state.phase !== "IDLE") {
      voiceInput.reset();
      setState({ phase: "IDLE" });
      voiceController.setConfirming(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceOn]);

  // ── STT results → machine events ───────────────────────────
  useEffect(() => {
    if (voiceInput.state === "idle" && voiceInput.transcript) {
      if (state.phase === "CONFIRMING") {
        const spoken = voiceInput.transcript.toLowerCase().trim();
        const isYes = ["हाँ", "हां", "haan", "han", "yes", "सही", "ठीक", "हा"].some((w) => spoken.includes(w));
        const isNo = ["नहीं", "नही", "nahi", "no", "गलत"].some((w) => spoken.includes(w));
        voiceInput.reset();
        if (isYes) dispatch({ type: "CONFIRM_YES" });
        else if (isNo) dispatch({ type: "CONFIRM_NO" });
        else {
          voiceController.speak(t("voiceLoop.confirmRepeat"), {
            onEnd: (done) => {
              if (done) void voiceInput.start();
            },
          });
        }
      } else if (state.phase === "LISTENING" || state.phase === "PROCESSING") {
        const text = voiceInput.transcript;
        const conf = voiceInput.confidence ?? 1;
        voiceInput.reset();
        // J1 FIELD-FIRST LAW with three fallthroughs to the screen/global
        // command registry: (a) the WHOLE utterance is a pure grammar
        // word — an empty text field must not swallow "आगे" as a value;
        // (b) the field already HOLDS a value and the words match a
        // command; (c) the parser REJECTS the transcript.
        const parsed = parseValue(text);
        if (voiceController.isPureCommand(text) && voiceController.handleTranscript(text)) return;
        if (!!value?.trim() && voiceController.handleTranscript(text)) return;
        if (parsed === null && voiceController.handleTranscript(text)) return;
        dispatch({ type: "TRANSCRIPT", text, confidence: conf });
      }
    }
    if (voiceInput.state === "error" && (state.phase === "LISTENING" || state.phase === "PROCESSING" || state.phase === "CONFIRMING")) {
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

  // Typed value wins; when the field blurs, the loop quietly re-arms
  const handleBlur = () => {
    if (voiceCapable) voiceController.loopRearm(600);
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

      {/* THE field — always visible, always enabled */}
      {mode === "choice" && choices ? (
        <select
          disabled={disabled}
          value={value}
          onFocus={() => state.phase !== "IDLE" && dispatch({ type: "TYPED_INPUT" })}
          onBlur={handleBlur}
          onChange={(e) => {
            handleTyped(e.target.value);
            if (e.target.value) onComplete?.();
          }}
          className={`w-full min-h-[56px] text-[18px] bg-white border rounded-btn px-4 font-medium focus:outline-none focus:ring-4 focus:ring-saffron-200 ${
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
          onBlur={handleBlur}
          onChange={(e) => handleTyped(e.target.value)}
          className={`w-full min-h-[56px] text-[18px] bg-white border rounded-btn px-4 font-medium focus:outline-none focus:ring-4 focus:ring-saffron-200 ${
            listening ? "border-gold ring-4 ring-gold/40 animate-pulse" : "border-saffron-200"
          }`}
        />
      )}

      {/* Listening/busy feedback — RESERVED-height slot (H2): these used
          to insert/collapse in flow, shifting the CTA below exactly as a
          tap landed (the two-tap login bug). The slot exists from mount;
          its content changes, its height never does. */}
      <div className="min-h-[36px] flex items-center" aria-live="off">
        {listening ? (
          <span className="self-start bg-gold/15 border border-gold text-temple-600 text-[16px] font-semibold font-hindi rounded-full px-4 py-1.5">
            {t("voiceLoop.listening")}
          </span>
        ) : busy ? (
          <span className="self-start text-softgrey text-[16px] font-hindi px-1" aria-hidden="true">
            …
          </span>
        ) : null}
      </div>

      {/* Spoken-value confirmation loop */}
      {state.phase === "CONFIRMING" && (
        <div className="flex items-center justify-between gap-3 bg-saffron-50 border border-saffron-100 rounded-card px-4 py-3">
          <span className="t-body font-semibold text-ink font-hindi">
            आपने कहा{" "}
            <span className="font-bold text-saffron-700">
              {mode === "choice"
                ? choices?.find((c) => c.value === state.parsed)?.label || state.parsed
                : state.parsed}
            </span>{" "}
            — सही है?
          </span>
          <div className="flex gap-2 shrink-0">
            <Button variant="success" size="md" onClick={() => dispatch({ type: "CONFIRM_YES" })}>
              {t("common.yes")}
            </Button>
            <Button variant="danger-outline" size="md" onClick={() => dispatch({ type: "CONFIRM_NO" })}>
              {t("common.no")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
export default VoiceField;
