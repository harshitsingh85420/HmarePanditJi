"use client";

import React, { useState } from 'react';
import { Button } from './Button';

export interface VoiceButtonProps {
    textToSpeak: string;
    lang?: string;
    className?: string;
    label?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
    textToSpeak,
    lang = 'hi-IN',
    className = '',
    label = "सुने"
}) => {
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
            className={`flex items-center gap-2 rounded-full border-brand-500 text-brand-600 hover:bg-brand-50 ${className}`}
        >
            {speaking ? (
                <>
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
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
