import { useState, useEffect, useMemo, useCallback } from "react";

export interface VoiceInputOptions {
    lang?: "hi-IN" | "en-IN" | "en-US";
    continuous?: boolean;
    interimResults?: boolean;
}

export interface VoiceInputReturn {
    isListening: boolean;
    transcript: string;
    error: string | null;
    isSupported: boolean;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

/**
 * Custom hook for voice input using Web Speech API
 * 
 * @example
 * ```tsx
 * const { isListening, transcript, startListening, stopListening } = useVoiceInput({
 *   lang: "hi-IN",
 *   continuous: false
 * });
 * 
 * useEffect(() => {
 *   if (transcript) {
 *     setFieldValue(transcript);
 *   }
 * }, [transcript]);
 * ```
 */
export function useVoiceInput(options: VoiceInputOptions = {}): VoiceInputReturn {
    const {
        lang = "hi-IN",
        continuous = false,
        interimResults = true,
    } = options;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Check if browser supports Speech Recognition
    const isSupported = useMemo(() => {
        if (typeof window === "undefined") return false;
        return !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
    }, []);

    // Create recognition instance
    const recognition = useMemo(() => {
        if (!isSupported) return null;

        const SpeechRecognition =
            window.SpeechRecognition || (window as any).webkitSpeechRecognition;

        const rec = new SpeechRecognition();
        rec.lang = lang;
        rec.continuous = continuous;
        rec.interimResults = interimResults;
        rec.maxAlternatives = 1;

        return rec;
    }, [isSupported, lang, continuous, interimResults]);

    // Set up event listeners
    useEffect(() => {
        if (!recognition) return;

        const handleResult = (event: any) => {
            const results = Array.from(event.results);
            const transcriptText = results
                .map((result: any) => result[0].transcript)
                .join("");

            setTranscript(transcriptText);
            setError(null);
        };

        const handleError = (event: any) => {
            console.error("Speech recognition error:", event.error);

            let errorMessage = "Voice recognition error";
            switch (event.error) {
                case "no-speech":
                    errorMessage = "Koi awaaz nahi aayi. Phir se koshish karein.";
                    break;
                case "audio-capture":
                    errorMessage = "Microphone access denied hai.";
                    break;
                case "not-allowed":
                    errorMessage = "Microphone permission nahi mili.";
                    break;
                case "network":
                    errorMessage = "Network error. Internet check karein.";
                    break;
                default:
                    errorMessage = `Error: ${event.error}`;
            }

            setError(errorMessage);
            setIsListening(false);
        };

        const handleEnd = () => {
            setIsListening(false);
        };

        const handleStart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.addEventListener("result", handleResult);
        recognition.addEventListener("error", handleError);
        recognition.addEventListener("end", handleEnd);
        recognition.addEventListener("start", handleStart);

        return () => {
            recognition.removeEventListener("result", handleResult);
            recognition.removeEventListener("error", handleError);
            recognition.removeEventListener("end", handleEnd);
            recognition.removeEventListener("start", handleStart);
        };
    }, [recognition]);

    const startListening = useCallback(() => {
        if (!recognition) {
            setError("Voice recognition not supported in this browser");
            return;
        }

        if (isListening) return;

        try {
            setTranscript("");
            setError(null);
            recognition.start();
        } catch (err) {
            console.error("Failed to start recognition:", err);
            setError("Failed to start voice recognition");
        }
    }, [recognition, isListening]);

    const stopListening = useCallback(() => {
        if (!recognition || !isListening) return;

        try {
            recognition.stop();
        } catch (err) {
            console.error("Failed to stop recognition:", err);
        }
    }, [recognition, isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript("");
        setError(null);
    }, []);

    return {
        isListening,
        transcript,
        error,
        isSupported,
        startListening,
        stopListening,
        resetTranscript,
    };
}

/**
 * Hook for text-to-speech functionality
 */
export function useTextToSpeech(lang: string = "hi-IN") {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const isSupported = useMemo(() => {
        return typeof window !== "undefined" && "speechSynthesis" in window;
    }, []);

    const speak = useCallback((text: string) => {
        if (!isSupported || !text) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [isSupported, lang]);

    const stop = useCallback(() => {
        if (!isSupported) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, [isSupported]);

    return {
        speak,
        stop,
        isSpeaking,
        isSupported,
    };
}
