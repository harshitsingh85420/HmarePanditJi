"use client";

import { useRef, useState, useCallback } from "react";

interface VoiceInputOptions {
    lang?: "hi-IN" | "en-IN" | "en-US";
}

/**
 * FormFieldWithVoice – Wrapper for inputs with mic button  
 * Combines a form field with voice-to-text input.
 * On mic click, triggers speech recognition and fills the field.
 */
export default function FormFieldWithVoice({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
    maxLength,
    minLength,
    pattern,
    hint,
    error,
    lang = "hi-IN",
    multiline = false,
    suffix,
    disabled = false,
    inputMode,
    className = "",
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    hint?: string;
    error?: string;
    lang?: "hi-IN" | "en-IN" | "en-US";
    multiline?: boolean;
    suffix?: string;
    disabled?: boolean;
    inputMode?: "text" | "numeric" | "tel" | "email" | "decimal";
    className?: string;
}) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const charCount = value?.length || 0;

    const startListening = useCallback(() => {
        if (typeof window === "undefined") return;
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("आपका browser voice input support नहीं करता।");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
            const results = Array.from(event.results);
            const text = results
                .map((r: any) => r[0].transcript)
                .join("");
            onChange(text);
        };
        recognition.onerror = (e: any) => {
            console.error("Speech recognition error:", e.error);
            setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
    }, [lang, onChange]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, []);

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const InputComponent = multiline ? "textarea" : "input";

    return (
        <div className={`space-y-1 ${className}`}>
            {/* Label */}
            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>

            {/* Input + Mic button */}
            <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                    <InputComponent
                        type={type}
                        value={value}
                        onChange={(e: any) => onChange(e.target.value)}
                        placeholder={placeholder}
                        required={required}
                        maxLength={maxLength}
                        minLength={minLength}
                        pattern={pattern}
                        disabled={disabled}
                        inputMode={inputMode}
                        className={`w-full px-4 py-3 rounded-lg border text-base transition-all duration-200 focus:outline-none focus:ring-2
              ${error
                                ? "border-red-400 focus:ring-red-300 bg-red-50"
                                : "border-gray-300 focus:ring-amber-300 focus:border-amber-400 bg-white"
                            }
              ${disabled ? "opacity-60 cursor-not-allowed" : ""}
              ${multiline ? "min-h-[80px] resize-y" : "min-h-[44px]"}
            `}
                        style={{ minHeight: "44px", minWidth: "44px" }}
                        rows={multiline ? 3 : undefined}
                    />
                    {suffix && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                            {suffix}
                        </span>
                    )}
                </div>

                {/* Mic button */}
                <button
                    type="button"
                    onClick={handleMicClick}
                    disabled={disabled}
                    className={`flex items-center justify-center w-11 h-11 rounded-lg transition-all duration-200 flex-shrink-0
            ${isListening
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse"
                            : "bg-amber-100 hover:bg-amber-200 text-amber-700"
                        }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
                    style={{ minHeight: "44px", minWidth: "44px" }}
                    aria-label={isListening ? "रिकॉर्डिंग बंद करें" : "बोलकर भरें"}
                    title={isListening ? "Recording... Click to stop" : "🎙️ बोलकर भरें"}
                >
                    {isListening ? "⏹️" : "🎙️"}
                </button>
            </div>

            {/* Hint, error, and character count */}
            <div className="flex items-center justify-between text-xs">
                <div>
                    {error && <p className="text-red-500 font-medium">{error}</p>}
                    {hint && !error && <p className="text-gray-400">{hint}</p>}
                </div>
                {maxLength && (
                    <span className={`${charCount > maxLength ? "text-red-500" : "text-gray-400"}`}>
                        {charCount}/{maxLength}
                    </span>
                )}
            </div>
        </div>
    );
}
