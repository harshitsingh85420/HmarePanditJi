"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
    id: string;
    name: string;
    unit: string;
    price: number;
    quantity: number;
}

export interface SamagriSelection {
    source: "PANDIT_PACKAGE" | "PLATFORM_CUSTOM";
    panditId: string;
    pujaType: string;
    packageId?: string;
    packageName?: string;
    items?: CartItem[];
    totalPrice: number;
    lockedAt: string;
}

interface SamagriCartContextType {
    selection: SamagriSelection | null;
    setSelection: (selection: SamagriSelection | null) => void;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
    clearCart: () => void;
}

const SamagriCartContext = createContext<SamagriCartContextType | undefined>(undefined);

export function SamagriCartProvider({ children }: { children: React.ReactNode }) {
    const [selection, setSelectionState] = useState<SamagriSelection | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const stored = sessionStorage.getItem("samagriSelection");
        if (stored) {
            try {
                setSelectionState(JSON.parse(stored));
            } catch (err) {
                console.error("Failed to parse samagri selection", err);
            }
        }
        setIsInitialized(true);
    }, []);

    const setSelection = (newSelection: SamagriSelection | null) => {
        setSelectionState(newSelection);
        if (newSelection) {
            sessionStorage.setItem("samagriSelection", JSON.stringify(newSelection));
        } else {
            sessionStorage.removeItem("samagriSelection");
        }
    };

    const clearCart = () => {
        setSelectionState(null);
        sessionStorage.removeItem("samagriSelection");
    };

    if (!isInitialized) return null; // or a tiny loader to avoid hydration mismatch

    return (
        <SamagriCartContext.Provider value={{ selection, setSelection, isCartOpen, setIsCartOpen, clearCart }}>
            {children}
        </SamagriCartContext.Provider>
    );
}

export function useSamagriCart() {
    const context = useContext(SamagriCartContext);
    if (context === undefined) {
        throw new Error("useSamagriCart must be used within a SamagriCartProvider");
    }
    return context;
}
