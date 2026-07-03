"use client";

import React, { useEffect, useState } from "react";
import { useVoice } from "../hooks/useVoice";
import { hi } from "../lib/strings";

export function VoiceBar() {
  const { enabled, toggle } = useVoice();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 active:scale-95 transition-transform duration-200"
      style={{ minHeight: "56px", fontSize: "24px" }}
      aria-label={enabled ? "Mute Voice" : "Unmute Voice"}
    >
      {enabled ? "🔊" : "🔇"}
    </button>
  );
}

interface SpeakOnMountProps {
  text: string;
}

export function SpeakOnMount({ text }: SpeakOnMountProps) {
  const { speak } = useVoice();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      speak(text);
    }, 100);
    return () => clearTimeout(timer);
  }, [speak, text]);

  if (!mounted) {
    return (
      <button
        disabled
        className="flex items-center justify-center px-6 rounded-lg bg-orange-100 text-orange-800 font-semibold"
        style={{ minHeight: "56px", fontSize: "18px" }}
      >
        {hi.common.listen}
      </button>
    );
  }

  return (
    <button
      onClick={() => speak(text)}
      className="flex items-center justify-center px-6 rounded-lg bg-orange-100 text-orange-800 font-semibold hover:bg-orange-200 active:scale-95 transition-all duration-200"
      style={{ minHeight: "56px", fontSize: "18px" }}
    >
      {hi.common.listen}
    </button>
  );
}
