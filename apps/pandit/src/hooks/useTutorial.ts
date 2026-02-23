"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "hpj_tutorial_seen";

/**
 * useTutorial hook
 * Manages whether the interactive tutorial has been shown.
 * Stores flag in localStorage. Auto-triggers on first dashboard visit.
 */
export function useTutorial() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Check on mount if tutorial has been seen
    useEffect(() => {
        if (typeof window === "undefined") return;
        const seen = localStorage.getItem(STORAGE_KEY);
        if (!seen) {
            // Auto-show after short delay on first visit
            const timer = setTimeout(() => {
                setIsVisible(true);
                setCurrentStep(0);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const show = useCallback(() => {
        setIsVisible(true);
        setCurrentStep(0);
    }, []);

    const hide = useCallback(() => {
        setIsVisible(false);
        setCurrentStep(0);
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, "true");
        }
    }, []);

    const next = useCallback(() => {
        setCurrentStep((prev) => prev + 1);
    }, []);

    const prev = useCallback(() => {
        setCurrentStep((prev) => Math.max(0, prev - 1));
    }, []);

    const skip = useCallback(() => {
        hide();
    }, [hide]);

    const replay = useCallback(() => {
        setCurrentStep(0);
        setIsVisible(true);
        // Do NOT reset the seen flag
    }, []);

    return {
        isVisible,
        currentStep,
        show,
        hide,
        next,
        prev,
        skip,
        replay,
        totalSteps: 5,
    };
}
