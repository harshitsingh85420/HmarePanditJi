"use client";

import React, { useEffect, useState } from "react";
import { useScreenVoice } from "../hooks/useScreenVoice";
import { hi } from "../lib/strings";

interface SpeakOnMountProps {
  text: string;
}

// Narrates the screen on mount via useScreenVoice (which also registers the
// शिष्य replay target) and renders the inline replay button.
export function SpeakOnMount({ text }: SpeakOnMountProps) {
  const { replay } = useScreenVoice(text);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      disabled={!mounted}
      onClick={replay}
      className="flex items-center justify-center px-6 rounded-lg bg-saffron-100 text-saffron-700 font-semibold hover:bg-saffron-200 active:scale-95 transition-all duration-200"
      style={{ minHeight: "56px", fontSize: "18px" }}
    >
      {hi.common.listen}
    </button>
  );
}
