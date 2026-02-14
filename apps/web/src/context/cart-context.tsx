"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface SamagriItem {
    type: "package" | "custom";
    samagriPackageId?: string;
    packageName?: string;
    customItems?: Array<{ name: string; quantity: string }>;
    totalCost: number;
    pujaType?: string;
}

interface CartContextType {
    samagriItem: SamagriItem | null;
    setSamagriItem: (item: SamagriItem | null) => void;
    clearSamagri: () => void;
    hasSamagri: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [samagriItem, setSamagriItemState] = useState<SamagriItem | null>(null);

    const setSamagriItem = useCallback((item: SamagriItem | null) => {
        setSamagriItemState(item);
        // Optionally persist to localStorage
        if (item) {
            localStorage.setItem("hpj_samagri", JSON.stringify(item));
        } else {
            localStorage.removeItem("hpj_samagri");
        }
    }, []);

    const clearSamagri = useCallback(() => {
        setSamagriItem(null);
    }, [setSamagriItem]);

    const hasSamagri = samagriItem !== null;

    return (
        <CartContext.Provider value={{ samagriItem, setSamagriItem, clearSamagri, hasSamagri }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
