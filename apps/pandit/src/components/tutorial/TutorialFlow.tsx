"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import WelcomeScreen from "./screens/WelcomeScreen";
import IncomeGrowthScreen from "./screens/IncomeGrowthScreen";
import FixedDakshinaScreen from "./screens/FixedDakshinaScreen";
import OnlineStreamsScreen from "./screens/OnlineStreamsScreen";
import BackupOpportunityScreen from "./screens/BackupOpportunityScreen";
import InstantPaymentScreen from "./screens/InstantPaymentScreen";
import EaseOfUseScreen from "./screens/EaseOfUseScreen";
import VoiceFirstNavScreen from "./screens/VoiceFirstNavScreen";
import DualModeEntryScreen from "./screens/DualModeEntryScreen";
import TravelItineraryScreen from "./screens/TravelItineraryScreen";
import AutoCalendarScreen from "./screens/AutoCalendarScreen";
import TrustAndIdentityScreen from "./screens/TrustAndIdentityScreen";
import VideoVerificationScreen from "./screens/VideoVerificationScreen";
import PublicProfileScreen from "./screens/PublicProfileScreen";
import SummaryScreen from "./screens/SummaryScreen";
import FinalCTAScreen from "./screens/FinalCTAScreen";
import { useTTS } from "../../hooks/useTTS";
import { useVoiceRecognition } from "../../hooks/useVoiceRecognition";
import { VOICE_PROMPTS, TutorialCommand } from "./voicePrompts";

// Screens where we auto-advance after voice prompt (~5 sec after speaking ends)
const AUTO_ADVANCE_STEPS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);

// Error messages spoken on failure
const ERROR_MSGS = [
  "Maaf kijiye, kripya fir se boliye.",
  "Kripya dhire aur saaf boliye.",
  "Baar-baar samajh nahi aa raha. Kripya type karein ya sahayata ke liye humari team se baat karein.",
];

export function TutorialFlow() {
  const [step, setStep] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [ttsFinished, setTtsFinished] = useState(false);
  const [listeningActive, setListeningActive] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showSahayata, setShowSahayata] = useState(false);
  const [keyboardInput, setKeyboardInput] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [voiceIndicator, setVoiceIndicator] = useState<"idle" | "listening" | "speaking">("idle");
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoAdvance = () => {
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
  };

  const goNext = useCallback(() => {
    clearAutoAdvance();
    setStep((s) => Math.min(s + 1, 15));
    setErrorCount(0);
    setTtsFinished(false);
    setListeningActive(false);
  }, []);

  const goBack = useCallback(() => {
    clearAutoAdvance();
    setStep((s) => Math.max(s - 1, 0));
    setErrorCount(0);
    setTtsFinished(false);
    setListeningActive(false);
  }, []);

  const skip = useCallback(() => {
    clearAutoAdvance();
    setStep(15);
    setErrorCount(0);
    setTtsFinished(false);
    setListeningActive(false);
  }, []);

  const restart = useCallback(() => {
    clearAutoAdvance();
    setStep(0);
    setErrorCount(0);
    setTtsFinished(false);
    setListeningActive(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((m) => {
      if (!m) window.speechSynthesis?.cancel();
      return !m;
    });
  }, []);

  const openKeyboard = useCallback(() => setShowKeyboard(true), []);

  const doRepeat = useCallback(() => {
    clearAutoAdvance();
    setTtsFinished(false);
    setListeningActive(false);
    setVoiceIndicator("speaking");
    window.speechSynthesis?.cancel();
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(VOICE_PROMPTS[step] ?? "");
      u.lang = "hi-IN";
      u.rate = 0.88;
      u.onend = () => {
        setTtsFinished(true);
        setListeningActive(true);
        setVoiceIndicator("listening");
        if (AUTO_ADVANCE_STEPS.has(step)) {
          autoAdvanceRef.current = setTimeout(goNext, 7000);
        }
      };
      if (!isMuted) window.speechSynthesis.speak(u);
    }, 300);
  }, [step, isMuted, goNext]);

  // Speak the current screen's prompt
  const handleTTSEnd = useCallback(() => {
    setTtsFinished(true);
    setVoiceIndicator("listening");
    setListeningActive(true);

    // Auto-advance for informational screens
    if (AUTO_ADVANCE_STEPS.has(step)) {
      autoAdvanceRef.current = setTimeout(() => {
        goNext();
      }, 7000); // 7 sec after speaking ends
    }
  }, [step, goNext]);

  const handleTTSStart = useCallback(() => {
    setVoiceIndicator("speaking");
    clearAutoAdvance();
  }, []);

  useTTS({
    text: VOICE_PROMPTS[step] ?? "",
    lang: "hi-IN",
    rate: 0.88,
    muted: isMuted,
    onStart: handleTTSStart,
    onEnd: handleTTSEnd,
    onError: () => {
      // If TTS fails, still enable listening
      setTtsFinished(true);
      setListeningActive(true);
    },
  });

  // Speak error message
  const speakError = useCallback((count: number) => {
    if (isMuted) return;
    window.speechSynthesis?.cancel();
    const msg = ERROR_MSGS[Math.min(count - 1, 2)];
    const u = new SpeechSynthesisUtterance(msg);
    u.lang = "hi-IN";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }, [isMuted]);

  // Handle voice commands
  const handleCommand = useCallback((cmd: TutorialCommand) => {
    clearAutoAdvance();
    setListeningActive(false);
    setErrorCount(0);
    setVoiceIndicator("idle");

    switch (cmd) {
      case "NEXT": goNext(); break;
      case "BACK": goBack(); break;
      case "SKIP": skip(); break;
      case "YES":  skip(); break; // S15 — Haan → registration
      case "LATER": restart(); break; // S15 — Baad mein → back to S0
      case "MUTE": toggleMute(); break;
      case "KEYBOARD": setShowKeyboard(true); break;
      case "REPEAT": doRepeat(); break;
    }
  }, [goNext, goBack, skip, restart, toggleMute, step]);

  // Handle voice error (unrecognised input)
  const handleVoiceError = useCallback((count: number) => {
    setErrorCount(count);
    speakError(count);

    if (count >= 3) {
      setShowKeyboard(true);
      setShowSahayata(true);
      setListeningActive(false);
      clearAutoAdvance();
    }
  }, [speakError]);

  // Voice recognition
  const { isListening } = useVoiceRecognition({
    stepIndex: step,
    active: listeningActive && !showKeyboard,
    lang: "hi-IN",
    onCommand: handleCommand,
    onError: handleVoiceError,
  });

  // Reset when step changes
  useEffect(() => {
    setTtsFinished(false);
    setListeningActive(false);
    setErrorCount(0);
    setShowSahayata(false);
    setVoiceIndicator("speaking");
    return () => clearAutoAdvance();
  }, [step]);

  // Keyboard submit
  const handleKeyboardSubmit = () => {
    const input = keyboardInput.trim().toLowerCase();
    setKeyboardInput("");

    // Map typed text to command
    const cmd = detectTypedCommand(input, step);
    if (cmd) {
      setShowKeyboard(false);
      handleCommand(cmd);
    } else {
      showToast("अमान्य आदेश। कृपया पुनः प्रयास करें।");
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const commonProps = {
    onNext: goNext,
    onBack: goBack,
    onSkip: skip,
    onKeyboard: openKeyboard,
    onRepeat: doRepeat,
    isMuted,
    toggleMute,
    stepIndex: step,
    totalSteps: 15,
  };

  const screens = [
    <WelcomeScreen key="0" {...commonProps} />,
    <IncomeGrowthScreen key="1" {...commonProps} />,
    <FixedDakshinaScreen key="2" {...commonProps} />,
    <OnlineStreamsScreen key="3" {...commonProps} />,
    <BackupOpportunityScreen key="4" {...commonProps} />,
    <InstantPaymentScreen key="5" {...commonProps} />,
    <EaseOfUseScreen key="6" {...commonProps} />,
    <VoiceFirstNavScreen key="7" {...commonProps} />,
    <DualModeEntryScreen key="8" {...commonProps} />,
    <TravelItineraryScreen key="9" {...commonProps} />,
    <AutoCalendarScreen key="10" {...commonProps} />,
    <TrustAndIdentityScreen key="11" {...commonProps} />,
    <VideoVerificationScreen key="12" {...commonProps} />,
    <PublicProfileScreen key="13" {...commonProps} />,
    <SummaryScreen key="14" {...commonProps} />,
    <FinalCTAScreen key="15" {...commonProps} onRestart={restart} />,
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Current screen */}
      {screens[step]}

      {/* Voice status pill — only visible when speaking/listening, anchored above footer */}
      {voiceIndicator !== "idle" && (
        <div className={`fixed bottom-[76px] left-1/2 -translate-x-1/2 z-30 pointer-events-none
          flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-[11px] font-semibold shadow-md
          ${voiceIndicator === "speaking" ? "bg-[#ec5b13]" : "bg-emerald-600"}`}
        >
          {voiceIndicator === "speaking" ? (
            <>
              <span className="material-symbols-outlined text-[13px]">record_voice_over</span>
              <span>बोल रहा हूँ</span>
              <span className="flex gap-[2px] items-end">
                {[3,5,4,6,3].map((h,i)=>(
                  <span key={i} className="inline-block w-[2px] rounded-full bg-white/80"
                    style={{height:`${h}px`,animation:`pulse 0.9s ease-in-out ${i*150}ms infinite`}}/>
                ))}
              </span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[13px] animate-pulse">mic</span>
              <span>{isListening ? "सुन रहा हूँ" : "तैयार"}</span>
              <span className="flex gap-[2px] items-end">
                {[4,6,5,7,4].map((h,i)=>(
                  <span key={i} className="inline-block w-[2px] rounded-full bg-white/80"
                    style={{height:`${h}px`,animation:`pulse 1s ease-in-out ${i*120}ms infinite`}}/>
                ))}
              </span>
            </>
          )}
        </div>
      )}

      {/* Muted banner */}
      {isMuted && (
        <div className="fixed top-[56px] left-0 right-0 mx-auto max-w-md bg-slate-800/95 text-white text-xs text-center py-2 px-4 z-50 rounded-b-xl shadow-lg">
          🔇 आवाज बंद है। आवाज चालू करने के लिए 🔈 बटन दबाएं।
        </div>
      )}

      {/* Error hint */}
      {errorCount > 0 && errorCount < 3 && (
        <div className="fixed top-[56px] left-0 right-0 mx-auto max-w-md z-50 px-4">
          <div className="bg-orange-50 border border-orange-200 text-orange-800 text-xs rounded-xl px-3 py-2 text-center shadow-sm">
            {errorCount === 1 ? "माफ़ कीजिए, कृपया फिर से बोलिए।" : "कृपया धीरे और साफ़ बोलिए।"}
          </div>
        </div>
      )}

      {/* Keyboard Overlay */}
      {showKeyboard && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-end"
          onClick={(e) => { if (e.target === e.currentTarget) setShowKeyboard(false); }}
        >
          <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-t-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">⌨️ Type a Command</h3>
              <button onClick={() => setShowKeyboard(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Type: <strong>next</strong>, <strong>back</strong>, <strong>skip</strong>, <strong>repeat</strong>, <strong>mute</strong>, <strong>haan</strong>, <strong>baad mein</strong>
            </p>
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={keyboardInput}
                onChange={(e) => setKeyboardInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleKeyboardSubmit()}
                placeholder="Command likhein..."
                className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-[#ec5b13]"
              />
              <button
                onClick={handleKeyboardSubmit}
                className="bg-[#ec5b13] text-white px-5 py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
              >
                Send
              </button>
            </div>
            {/* Sahayata button after 3rd failure */}
            {showSahayata && (
              <button
                onClick={() => {
                  alert("Operations team will call you shortly. अगर तुरंत मदद चाहिए तो 1800-XXX-XXXX पर कॉल करें।");
                }}
                className="mt-4 w-full border-2 border-[#ec5b13] text-[#ec5b13] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#ec5b13]/5 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">support_agent</span>
                सहायता चाहिए? (Sahayata)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-4 py-2 rounded-full z-[200] shadow-lg animate-fade-in">
          {toastMsg}
        </div>
      )}
    </div>
  );
}

// Map typed text to a TutorialCommand
function detectTypedCommand(input: string, step: number): TutorialCommand | null {
  if (input.includes("next") || input.includes("aage") || input.includes("agla")) return "NEXT";
  if (input.includes("back") || input.includes("peechhe") || input.includes("wapas")) return "BACK";
  if (input.includes("skip")) return "SKIP";
  if (input.includes("repeat") || input.includes("dobara") || input.includes("phir")) return "REPEAT";
  if (input.includes("mute") || input.includes("band")) return "MUTE";
  if (input.includes("haan") || input.includes("yes")) return step === 15 ? "YES" : "NEXT";
  if (input.includes("baad") || input.includes("later")) return "LATER";
  if (input.includes("keyboard") || input.includes("type")) return "KEYBOARD";
  return null;
}
