"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useVoice } from "../../hooks/useVoice";
import { useVoiceInput } from "../../hooks/useVoiceInput";
import { parseHindiNumber, parsePhoneNumber, matchChoice } from "../../lib/voiceParse";
import { extractOTP } from "../../lib/number-mapper";
import { reduce, type VFState, type VFEvent } from "./voiceFieldMachine";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

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
}: VoiceFieldProps) {
  const { enabled: voiceOutputEnabled, stop: stopVoice } = useVoice();
  const voiceInput = useVoiceInput();

  const [machineState, setMachineState] = useState<VFState>({ phase: "PROMPTING" });
  const [attempts, setAttempts] = useState(0);
  const [isKeyboardFallback, setIsKeyboardFallback] = useState(false);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const isFirstMount = useRef(true);

  // Load configuration from local storage. The header mute toggle (voice_enabled,
  // via useVoice) also disables voice interaction entirely — muting the app must
  // not leave the pandit stuck on a silent listening screen.
  useEffect(() => {
    const stored = localStorage.getItem("voice_input_enabled");
    if (stored !== null) {
      setVoiceInputEnabled(stored === "true" && voiceOutputEnabled);
    } else {
      setVoiceInputEnabled(voiceOutputEnabled);
    }
  }, [voiceOutputEnabled]);

  const parseValue = useCallback((text: string): string | null => {
    if (mode === "text") {
      return text.trim() || null;
    } else if (mode === "number" || mode === "money") {
      const parsedNum = parseHindiNumber(text);
      return parsedNum !== null ? String(parsedNum) : null;
    } else if (mode === "phone") {
      return parsePhoneNumber(text);
    } else if (mode === "otp") {
      const digits = extractOTP(text);
      return digits.length === 6 ? digits : null;
    } else if (mode === "choice") {
      const matched = matchChoice(text, choices || []);
      return matched ? matched.value : text.trim();
    }
    return null;
  }, [mode, choices]);

  const speakAndThen = useCallback((txt: string, callback: () => void) => {
    stopVoice();
    const utterance = new SpeechSynthesisUtterance(txt);
    utterance.lang = "hi-IN";
    utterance.rate = 0.9;
    utterance.onend = () => callback();
    utterance.onerror = () => callback();
    window.speechSynthesis.speak(utterance);
  }, [stopVoice]);

  const handleEffects = useCallback((
    effects: Array<'START_LISTEN'|'SPEAK_CONFIRM'|'SPEAK_FALLBACK'|'SPEAK_RETRY'|'FOCUS_KEYBOARD'|'EMIT_VALUE'>,
    nextState: VFState
  ) => {
    effects.forEach(eff => {
      switch (eff) {
        case 'START_LISTEN':
          if (!effects.includes('SPEAK_RETRY') && !effects.includes('SPEAK_CONFIRM') && !effects.includes('SPEAK_FALLBACK')) {
            voiceInput.start();
          }
          break;
        case 'SPEAK_RETRY':
          speakAndThen("माफ़ कीजिए, समझ नहीं आया। दोबारा बोलें।", () => {
            voiceInput.start();
          });
          break;
        case 'SPEAK_CONFIRM':
          if (nextState.phase === 'CONFIRMING') {
            const displayVal = mode === "choice"
              ? (choices?.find(c => c.value === nextState.parsed)?.label || nextState.parsed)
              : nextState.parsed;
            speakAndThen(`आपने कहा ${displayVal}. सही है? हाँ या नहीं बोलें.`, () => {
              voiceInput.start();
            });
          }
          break;
        case 'SPEAK_FALLBACK':
          speakAndThen("कोई बात नहीं, नीचे लिखकर बताएं।", () => {
            // Let FOCUS_KEYBOARD handle input focus
          });
          break;
        case 'FOCUS_KEYBOARD':
          setIsKeyboardFallback(true);
          setTimeout(() => {
            if (mode === "choice") {
              selectRef.current?.focus();
            } else {
              inputRef.current?.focus();
            }
          }, 150);
          break;
        case 'EMIT_VALUE':
          if (nextState.phase === 'ACCEPTED') {
            onChange(nextState.value);
            setTimeout(() => {
              onComplete?.();
              setMachineState({ phase: "TYPE_FALLBACK" });
            }, 600);
          }
          break;
      }
    });
  }, [mode, choices, voiceInput, speakAndThen, onChange, onComplete]);

  // Prompt vocalization on mounting/activation
  const speakPrompt = useCallback(() => {
    stopVoice();
    if (!voiceInputEnabled || isKeyboardFallback) {
      setMachineState({ phase: "TYPE_FALLBACK" });
      setIsKeyboardFallback(true);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(promptText);
    utterance.lang = "hi-IN";
    utterance.rate = 0.9;
    let advanced = false;
    const advance = () => {
      if (advanced) return;
      advanced = true;
      const res = reduce(machineState, { type: "SPEECH_DONE" }, { attempts, mode, parse: parseValue });
      setMachineState(res.next);
      setAttempts(res.attempts);
      handleEffects(res.effects, res.next);
    };
    utterance.onend = advance;
    utterance.onerror = advance;
    // Safety net: some browsers/WebViews never fire onend — don't leave the
    // pandit stranded on a silent prompt screen.
    setTimeout(advance, Math.max(6000, promptText.length * 180));
    window.speechSynthesis.speak(utterance);
  }, [promptText, voiceInputEnabled, isKeyboardFallback, machineState, attempts, mode, parseValue, handleEffects, stopVoice]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      const timer = setTimeout(() => {
        if (voiceInputEnabled && !isKeyboardFallback) {
          speakPrompt();
        } else {
          setMachineState({ phase: "TYPE_FALLBACK" });
          setIsKeyboardFallback(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [speakPrompt, voiceInputEnabled, isKeyboardFallback]);

  // Listening state synchronization
  useEffect(() => {
    if (machineState.phase === "LISTENING" && voiceInput.state === "processing") {
      setMachineState({ phase: "PROCESSING" });
    }
  }, [voiceInput.state, machineState.phase]);

  // Transcripts & Error handlers matching State Machine Transitions
  useEffect(() => {
    if ((machineState.phase === "LISTENING" || machineState.phase === "PROCESSING") && voiceInput.state === "idle" && voiceInput.transcript) {
      const res = reduce(
        machineState,
        { type: "TRANSCRIPT", text: voiceInput.transcript, confidence: voiceInput.confidence || 1.0 },
        { attempts, mode, parse: parseValue }
      );
      setMachineState(res.next);
      setAttempts(res.attempts);
      handleEffects(res.effects, res.next);
    }

    if (machineState.phase === "CONFIRMING" && voiceInput.state === "idle" && voiceInput.transcript) {
      const cleanText = voiceInput.transcript.toLowerCase().trim();
      const isYes = ["हाँ", "हां", "haan", "han", "yes", "सही", "ठीक", "हा"].some(w => cleanText.includes(w));
      const isNo = ["नहीं", "नही", "nahi", "no", "गलत"].some(w => cleanText.includes(w));

      if (isYes) {
        const res = reduce(machineState, { type: "CONFIRM_YES" }, { attempts, mode, parse: parseValue });
        setMachineState(res.next);
        setAttempts(res.attempts);
        handleEffects(res.effects, res.next);
      } else if (isNo) {
        const res = reduce(machineState, { type: "CONFIRM_NO" }, { attempts, mode, parse: parseValue });
        setMachineState(res.next);
        setAttempts(res.attempts);
        handleEffects(res.effects, res.next);
      } else {
        // Repeated confirmation
        const displayVal = mode === "choice"
          ? (choices?.find(c => c.value === machineState.parsed)?.label || machineState.parsed)
          : machineState.parsed;
        speakAndThen(`आपने कहा ${displayVal}. सही है? हाँ या नहीं बोलें.`, () => {
          voiceInput.start();
        });
      }
    }

    if (
      (machineState.phase === "LISTENING" || machineState.phase === "PROCESSING" || machineState.phase === "CONFIRMING") &&
      voiceInput.state === "error"
    ) {
      const res = reduce(machineState, { type: "STT_FAILED" }, { attempts, mode, parse: parseValue });
      setMachineState(res.next);
      setAttempts(res.attempts);
      handleEffects(res.effects, res.next);
    }
  }, [
    voiceInput.state,
    voiceInput.transcript,
    voiceInput.confidence,
    machineState,
    attempts,
    mode,
    parseValue,
    handleEffects,
    speakAndThen,
    choices
  ]);

  const handleBypassToKeyboard = () => {
    const res = reduce(machineState, { type: "TAP_TYPE" }, { attempts, mode, parse: parseValue });
    setMachineState(res.next);
    setAttempts(res.attempts);
    handleEffects(res.effects, res.next);
  };

  const handleManualMicTrigger = () => {
    setIsKeyboardFallback(false);
    const res = reduce(machineState, { type: "TAP_MIC_RETRY" }, { attempts: 0, mode, parse: parseValue });
    setMachineState(res.next);
    setAttempts(0);
    handleEffects(res.effects, res.next);
  };

  // Direct Button Confirmations
  const handleConfirmYes = () => {
    const res = reduce(machineState, { type: "CONFIRM_YES" }, { attempts, mode, parse: parseValue });
    setMachineState(res.next);
    setAttempts(res.attempts);
    handleEffects(res.effects, res.next);
  };

  const handleConfirmNo = () => {
    const res = reduce(machineState, { type: "CONFIRM_NO" }, { attempts, mode, parse: parseValue });
    setMachineState(res.next);
    setAttempts(res.attempts);
    handleEffects(res.effects, res.next);
  };

  // Permission Explainer
  if (voiceInput.showExplainer) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
        <Card className="max-w-[340px] w-full flex flex-col items-center justify-center text-center p-6 gap-4">
          <div className="text-[64px] leading-none animate-bounce" role="img" aria-label="Microphone">🎤</div>
          <h3 className="t-title font-bold text-ink">माइक की अनुमति आवश्यक है</h3>
          <p className="t-body text-softgrey">
            कृपया माइक की अनुमति दें, ताकि आप बोलकर जवाब दे सकें।
          </p>
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
    );
  }

  // Render Machine States
  return (
    <div className="w-full flex flex-col gap-3">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-mic {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(230, 81, 0, 0.4);
          }
          70% {
            transform: scale(1.08);
            box-shadow: 0 0 0 16px rgba(230, 81, 0, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(230, 81, 0, 0);
          }
        }
        .animate-pulse-mic {
          animation: pulse-mic 1.4s infinite ease-in-out;
        }
      `}} />

      {/* Voice mode active */}
      {voiceInputEnabled && !isKeyboardFallback && machineState.phase !== "TYPE_FALLBACK" && (
        <Card className="flex flex-col items-center justify-center py-8 px-4 text-center gap-6 min-h-[300px]">
          <span className="t-hint text-softgrey font-medium uppercase tracking-wider">{label}</span>

          {machineState.phase === "PROMPTING" && (
            <div className="flex flex-col items-center gap-3">
              <div className="text-[28px] animate-pulse">🔊</div>
              <span className="t-body font-semibold text-temple-600">{promptText}</span>
            </div>
          )}

          {machineState.phase === "LISTENING" && (
            <div className="flex flex-col items-center gap-6 w-full">
              <button
                type="button"
                onClick={stopVoice}
                className="w-[88px] h-[88px] min-h-[88px] min-w-[88px] rounded-full bg-saffron-500 text-white flex items-center justify-center text-[36px] shadow-lg animate-pulse-mic focus:outline-none"
              >
                🎤
              </button>
              <div className="flex flex-col gap-1">
                <span className="t-title font-bold text-saffron-600">बोलिए... सुन रहा हूँ</span>
                <span className="t-hint text-softgrey">बोलना बंद करें या माइक पर दोबारा दबाएं</span>
              </div>
            </div>
          )}

          {machineState.phase === "PROCESSING" && (
            <div className="flex flex-col items-center gap-4">
              <span className="animate-spin text-[36px] inline-block">🪔</span>
              <span className="t-body font-semibold text-temple-600">समझ रहा हूँ...</span>
            </div>
          )}

          {machineState.phase === "CONFIRMING" && (
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="flex flex-col items-center gap-2 w-full">
                <span className="t-hint text-softgrey font-semibold">आपने कहा:</span>
                <div className="bg-saffron-50 border border-saffron-100 rounded-card p-4 text-[24px] font-bold text-saffron-700 w-full max-w-[280px] break-words">
                  {mode === "choice"
                    ? (choices?.find(c => c.value === machineState.parsed)?.label || machineState.parsed)
                    : machineState.parsed}
                </div>
                <span className="t-hint text-softgrey font-semibold mt-2">क्या यह सही है?</span>
              </div>

              <div className="w-full flex gap-3 max-w-[280px]">
                <Button variant="success" size="md" className="flex-1" onClick={handleConfirmYes}>
                  हाँ ✓
                </Button>
                <Button variant="danger-outline" size="md" className="flex-1" onClick={handleConfirmNo}>
                  नहीं ✗
                </Button>
              </div>
            </div>
          )}

          {machineState.phase === "ACCEPTED" && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-leaf-100 text-leaf-700 flex items-center justify-center text-[36px] font-bold">✓</div>
              <span className="t-title font-bold text-leaf-700">स्वीकार कर लिया</span>
            </div>
          )}

          {machineState.phase !== "ACCEPTED" && (
            <button
              type="button"
              onClick={handleBypassToKeyboard}
              className="text-[18px] min-h-[56px] px-6 text-softgrey hover:text-ink font-semibold focus:outline-none"
            >
              ⌨️ लिखें (Keyboard)
            </button>
          )}
        </Card>
      )}

      {/* Keyboard/Fallback standard input mode */}
      {(!voiceInputEnabled || isKeyboardFallback || machineState.phase === "TYPE_FALLBACK") && (
        <div className="w-full flex flex-col gap-2">
          {label && (
            <label className="t-title font-bold text-ink text-left">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}

          <div className="flex items-center gap-3 w-full">
            {mode === "choice" && choices ? (
              <select
                ref={selectRef}
                disabled={disabled}
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  onComplete?.();
                }}
                className="flex-grow min-h-[56px] text-[18px] bg-white border border-saffron-200 rounded-btn px-4 focus:outline-none focus:ring-4 focus:ring-saffron-200 font-medium"
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
                type={mode === "number" || mode === "money" ? "number" : mode === "phone" || mode === "otp" ? "tel" : "text"}
                disabled={disabled}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-grow min-h-[56px] text-[18px] bg-white border border-saffron-200 rounded-btn px-4 focus:outline-none focus:ring-4 focus:ring-saffron-200 font-medium"
              />
            )}

            {voiceInputEnabled && (
              <button
                type="button"
                onClick={handleManualMicTrigger}
                className="w-14 h-14 min-h-[56px] min-w-[56px] rounded-full bg-saffron-50 hover:bg-saffron-100 active:scale-95 text-[22px] flex items-center justify-center shadow-sm border border-saffron-200 focus:outline-none"
                aria-label="Use voice input"
              >
                🎤
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default VoiceField;
