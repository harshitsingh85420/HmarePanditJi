export function useVoiceNarration() {
    const speak = (text: string, lang: 'hi-IN' | 'en-IN' = 'hi-IN') => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        window.speechSynthesis.cancel(); // Stop any ongoing narration
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;  // Slightly slower for clarity
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
    };

    const stop = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    };

    return { speak, stop };
}
