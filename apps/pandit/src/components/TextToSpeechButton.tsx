"use client";

import React, { useState } from "react";
import { useTextToSpeech } from "../hooks/useVoiceInput";
import { Volume2, Square } from "lucide-react";

interface TextToSpeechButtonProps {
    text: string;
    lang?: string;
}

export default function TextToSpeechButton({ text, lang = "hi-IN" }: TextToSpeechButtonProps) {
    const { speak, stop, isSpeaking } = useTextToSpeech(lang);

    const handleClick = () => {
        if (isSpeaking) {
            stop();
        } else {
            speak(text);
        }
    };

    return (
        <button
            onClick={handleClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200"
            aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
        >
            {isSpeaking ? (
                <>
                    <Square className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">रोकें</span>
                </>
            ) : (
                <>
                    <Volume2 className="w-4 h-4" />
                    <span className="text-sm font-medium">सुनें</span>
                </>
            )}
        </button>
    );
}
