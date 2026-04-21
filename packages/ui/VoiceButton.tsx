"use client";

import { useState } from "react";
import { Button } from "./Button";

export interface VoiceButtonProps {
  textToSpeak: string;
  lang?: string;
  className?: string;
  label?: string;
}

export const VoiceButton = ({
  textToSpeak,
  lang = "hi-IN",
  className = "",
  label = "सुने",
}: VoiceButtonProps) => {
  const [speaking, setSpeaking] = useState(false);

  const speak = () => {
    if (!window.speechSynthesis) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <Button
      variant="outline"
      onClick={speak}
      className={`border-brand-500 text-brand-600 hover:bg-brand-50 flex items-center gap-2 rounded-full ${className}`}
    >
      {speaking ? (
        <>
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
          रोकें
        </>
      ) : (
        <>
          <span>🔊</span>
          {label}
        </>
      )}
    </Button>
  );
};
