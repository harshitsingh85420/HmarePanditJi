"use client";

import { useEffect } from "react";
import { useVoiceInput, useTextToSpeech } from "../hooks/useVoiceInput";

export interface VoiceButtonProps {
    onTranscript: (text: string) => void;
    lang?: "hi-IN" | "en-IN" | "en-US";
    prompt?: string;
    className?: string;
    disabled?: boolean;
}

/**
 * Voice input button component with microphone animation
 * 
 * @example
 * ```tsx
 * <VoiceButton
 *   lang="hi-IN"
 *   prompt="Apna naam boliye"
 *   onTranscript={(text) => setFieldValue(text)}
 * />
 * ```
 */
export function VoiceButton({
    onTranscript,
    lang = "hi-IN",
    prompt,
    className = "",
    disabled = false,
}: VoiceButtonProps) {
    const { isListening, transcript, error, isSupported, startListening, stopListening } =
        useVoiceInput({ lang, continuous: false });

    const { speak, isSpeaking } = useTextToSpeech(lang);

    // Send transcript to parent
    useEffect(() => {
        if (transcript && !isListening) {
            onTranscript(transcript);
        }
    }, [transcript, isListening, onTranscript]);

    // Speak prompt when listening starts (optional)
    useEffect(() => {
        if (isListening && prompt && !isSpeaking) {
            speak(prompt);
        }
    }, [isListening, prompt, speak, isSpeaking]);

    const handleClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // Don't render if not supported
    if (!isSupported) {
        return null;
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={handleClick}
                disabled={disabled}
                className={`
          flex items-center justify-center
          w-10 h-10 rounded-lg
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary/30
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isListening
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800"
                    }
          ${className}
        `}
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
                title={isListening ? "Recording... Click to stop" : "Click to speak"}
            >
                <span
                    className={`
            material-symbols-outlined text-xl leading-none
            ${isListening ? "animate-pulse" : ""}
          `}
                >
                    {isListening ? "mic" : "mic_none"}
                </span>
            </button>

            {/* Error tooltip */}
            {error && !isListening && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700 shadow-lg z-10">
                    <div className="flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5">
                            error
                        </span>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Listening indicator */}
            {isListening && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
        </div>
    );
}

/**
 * Compact inline voice button (for use inside input fields)
 */
export function VoiceButtonInline({
    onTranscript,
    lang = "hi-IN",
    prompt,
    disabled = false,
}: VoiceButtonProps) {
    return (
        <VoiceButton
            onTranscript={onTranscript}
            lang={lang}
            prompt={prompt}
            disabled={disabled}
            className="w-8 h-8"
        />
    );
}
