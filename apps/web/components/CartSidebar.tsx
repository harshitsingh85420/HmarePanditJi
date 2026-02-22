"use client";

import React, { useEffect, useState } from "react";
import { useSamagriCart } from "../context/SamagriCartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@hmarepanditji/ui";

export function CartSidebar() {
    const { selection, isCartOpen, setIsCartOpen, clearCart } = useSamagriCart();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isCartOpen) return null;

    const handleProceed = () => {
        if (!selection) return;
        setIsCartOpen(false);
        const { panditId, pujaType, source, packageId } = selection;
        const url = `/booking/new?panditId=${panditId}&pujaType=${encodeURIComponent(
            pujaType
        )}&samagriSource=${source}${packageId ? `&samagriPackageId=${packageId}` : ""
            }`;
        router.push(url);
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
                onClick={() => setIsCartOpen(false)}
            />
            <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-[101] flex flex-col transform transition-transform translate-x-0 overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-orange-50/50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        🛒 Your Samagri Cart
                    </h2>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="text-gray-500 hover:text-gray-900 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 p-4 flex flex-col gap-6">
                    {!selection ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center space-y-4">
                            <div className="text-4xl">🪔</div>
                            <p>Your cart is empty.</p>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="text-orange-600 font-medium hover:underline"
                            >
                                Continue Browsing
                            </button>
                        </div>
                    ) : (
                        <>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Items for:</p>
                                <p className="font-bold">{selection.pujaType}</p>
                            </div>

                            {selection.source === "PANDIT_PACKAGE" ? (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-bold mb-3">
                                        📦 Pandit Ji's Package (Fixed)
                                    </span>
                                    <h3 className="font-bold text-lg">{selection.packageName} Package</h3>
                                    <p className="text-sm text-amber-800 mt-1">
                                        Fixed price non-negotiable package. Includes all items.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold mb-3">
                                        🛍️ Your Custom List
                                    </span>
                                    <div className="space-y-3 mt-2">
                                        {selection.items?.map((item) => (
                                            <div key={item.id} className="flex justify-between items-start text-sm">
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.name}</p>
                                                    <p className="text-gray-500 text-xs">
                                                        {item.quantity} × {item.unit}
                                                    </p>
                                                </div>
                                                <p className="font-semibold">₹{item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto border-t border-gray-100 pt-4 pb-4">
                                <div className="flex justify-between items-end mb-1">
                                    <p className="text-gray-600 font-medium">Total Price:</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ₹{selection.totalPrice}
                                    </p>
                                </div>
                                <p className="text-xs text-right text-gray-500 mb-6">
                                    {selection.source === "PANDIT_PACKAGE"
                                        ? "(Fixed package price)"
                                        : "(Platform sourcing price)"}
                                </p>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={handleProceed}
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-lg"
                                    >
                                        Proceed to Book →
                                    </Button>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="w-full py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition"
                                    >
                                        Continue Browsing
                                    </button>
                                    <button
                                        onClick={clearCart}
                                        className="w-full py-2 text-red-500 hover:bg-red-50 rounded-xl font-medium transition mt-2"
                                    >
                                        Remove from Cart
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
