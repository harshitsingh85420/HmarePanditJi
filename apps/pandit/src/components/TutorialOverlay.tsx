"use client";

import { useEffect, useCallback } from "react";

// ── Tutorial screen content (Prompt 8, Section I3) ──────────────────────────
const TUTORIAL_SCREENS = [
    {
        title: "Online / Offline Toggle",
        titleHi: "ऑनलाइन / ऑफलाइन बटन",
        icon: "toggle_on",
        content:
            "जब आप ONLINE होंगे, तभी नई bookings आपको दिखाई देंगी। जब भी उपलब्ध न हों, OFFLINE कर दें — कोई booking नहीं आएगी।",
        voiceText:
            "Yeh toggle aapko online ya offline karta hai. Online rehne par hi naye booking requests aayenge. Jab aap free na hon, offline kar dein.",
        highlightId: "online-toggle",
    },
    {
        title: "New Booking Alert",
        titleHi: "नई बुकिंग अलर्ट",
        icon: "notifications_active",
        content:
            "जब कोई नई booking आती है, तो एक amber card दिखेगा जिसमें 6 घंटे का countdown timer होगा। इस समय में 'Accept' या 'Decline' करना ज़रूरी है।",
        voiceText:
            "Nayi booking aane par amber card dikhega. 6 ghante ke andar accept ya decline karna zaroori hai, warna booking expire ho jayegi.",
        highlightId: "alert-zone",
    },
    {
        title: "Booking Detail & Earnings Breakdown",
        titleHi: "बुकिंग विवरण और कमाई",
        icon: "receipt_long",
        content:
            "हर booking की detail page पर दक्षिणा, सामग्री, यात्रा खर्च, और food allowance का पूरा breakdown दिखेगा। दोनों scenarios — Pandit Package और Platform List — अलग-अलग दिखेंगे।",
        voiceText:
            "Booking detail page par aapki poori kamai ka breakdown dikhega — dakshina, samagri, travel, aur food allowance sab alag alag.",
        highlightId: "earnings-card",
    },
    {
        title: "\"I'm Here\" Status Buttons",
        titleHi: "\"मैं पहुंचा\" बटन",
        icon: "location_on",
        content:
            "Journey shuru karte samay 'यात्रा शुरू करें', venue pahunchne par 'Venue पहुंचा', puja shuru par 'पूजा शुरू' button dabayein। इससे customer को real-time update milti hai।",
        voiceText:
            "Har status update se customer ko SMS jayega. Buttons ko order mein press karein.",
        highlightId: "status-buttons",
    },
    {
        title: "Earnings & Calendar",
        titleHi: "कमाई और कैलेंडर",
        icon: "savings",
        content:
            "Earnings section mein har mahine ki kamai dekhein। Calendar mein chhuttiyaan block karein taaki us din booking na aaye।",
        voiceText:
            "Kamai aur calendar section — aapka financial dashboard. Calendar mein dates block karne se us din booking nahi aayegi.",
        highlightId: "sidebar-earnings",
    },
];

interface TutorialOverlayProps {
    step: number;
    onNext: () => void;
    onPrev: () => void;
    onClose: () => void;
    totalSteps?: number;
}

/**
 * TutorialOverlay (Prompt 8)
 * Full-screen overlay with 5 interactive tutorial screens.
 * Supports spotlight effect, voice narration, and step navigation.
 */
export default function TutorialOverlay({
    step,
    onNext,
    onPrev,
    onClose,
    totalSteps = 5,
}: TutorialOverlayProps) {
    const screen = TUTORIAL_SCREENS[step] || TUTORIAL_SCREENS[0];

    // Auto-play voice narration for current screen
    const speakText = useCallback(() => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(screen.voiceText);
        utterance.lang = "hi-IN";
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }, [screen.voiceText]);

    useEffect(() => {
        const timer = setTimeout(speakText, 300);
        return () => {
            clearTimeout(timer);
            if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, [step, speakText]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight" && step < totalSteps - 1) onNext();
            if (e.key === "ArrowLeft" && step > 0) onPrev();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [step, onNext, onPrev, onClose, totalSteps]);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Dark backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Content card */}
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-[90%] mx-4 overflow-hidden animate-slide-up">
                {/* Skip button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-sm font-medium z-10 flex items-center gap-1"
                    style={{ minHeight: "44px", minWidth: "44px" }}
                >
                    Skip ✕
                </button>

                {/* Header icon */}
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <span className="material-symbols-outlined text-white text-3xl">
                            {screen.icon}
                        </span>
                    </div>
                    <h3 className="text-white text-xl font-bold">{screen.titleHi}</h3>
                    <p className="text-white/70 text-sm mt-1">{screen.title}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-700 text-base leading-relaxed">
                        {screen.content}
                    </p>
                </div>

                {/* Navigation */}
                <div className="px-6 pb-6 flex items-center justify-between">
                    <button
                        onClick={onPrev}
                        disabled={step === 0}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all
              ${step === 0
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                        style={{ minHeight: "44px" }}
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        पिछला
                    </button>

                    {/* Step dots */}
                    <div className="flex gap-2">
                        {Array.from({ length: totalSteps }, (_, i) => (
                            <div
                                key={i}
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-200
                  ${i === step
                                        ? "bg-amber-500 w-6 rounded-full"
                                        : i < step
                                            ? "bg-amber-300"
                                            : "bg-gray-200"
                                    }`}
                            />
                        ))}
                    </div>

                    {step < totalSteps - 1 ? (
                        <button
                            onClick={onNext}
                            className="flex items-center gap-1 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-all"
                            style={{ minHeight: "44px" }}
                        >
                            अगला
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all"
                            style={{ minHeight: "44px" }}
                        >
                            शुरू करें 🙏
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
