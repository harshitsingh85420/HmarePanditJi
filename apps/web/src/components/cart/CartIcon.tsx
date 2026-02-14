"use client";

import { useCart } from "@/context/cart-context";
import { useState } from "react";

/**
 * Cart icon with badge showing samagri selection
 * Displays in header when samagri is selected
 */
export function CartIcon() {
    const { samagriItem, hasSamagri, clearSamagri } = useCart();
    const [showQuickView, setShowQuickView] = useState(false);

    if (!hasSamagri) return null;

    return (
        <div className="relative">
            {/* Cart Icon Button */}
            <button
                onClick={() => setShowQuickView(!showQuickView)}
                className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="View samagri selection"
            >
                <span className="material-symbols-outlined text-slate-700">
                    shopping_cart
                </span>

                {/* Badge */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">1</span>
                </div>
            </button>

            {/* Quick View Dropdown */}
            {showQuickView && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowQuickView(false)}
                    />

                    {/* Dropdown Panel */}
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                        {/* Header */}
                        <div className="bg-primary/5 px-4 py-3 border-b border-primary/10">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-base">
                                        inventory_2
                                    </span>
                                    Samagri Selected
                                </h3>
                                <button
                                    onClick={() => setShowQuickView(false)}
                                    className="p-1 hover:bg-white rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-slate-500 text-base">
                                        close
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            {samagriItem?.type === "package" ? (
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold ${samagriItem.packageName === "Basic"
                                                ? "bg-gradient-to-br from-slate-500 to-slate-600"
                                                : samagriItem.packageName === "Standard"
                                                    ? "bg-gradient-to-br from-amber-500 to-amber-600"
                                                    : "bg-gradient-to-br from-purple-500 to-purple-600"
                                            }`}>
                                            {samagriItem.packageName?.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900">
                                                {samagriItem.packageName} Package
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {samagriItem.pujaType}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-primary">
                                                ₹{samagriItem.totalCost.toLocaleString("en-IN")}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <div className="font-semibold text-slate-900 mb-2">
                                            Custom Samagri List
                                        </div>
                                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                            {samagriItem?.customItems?.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2"
                                                >
                                                    <span className="text-slate-700">{item.name}</span>
                                                    <span className="text-slate-500 font-medium">
                                                        {item.quantity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Estimated Cost</span>
                                        <span className="font-bold text-primary">
                                            ₹{samagriItem?.totalCost.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                                <button
                                    onClick={() => {
                                        clearSamagri();
                                        setShowQuickView(false);
                                    }}
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Remove
                                </button>
                                <button
                                    onClick={() => setShowQuickView(false)}
                                    className="flex-1 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>

                        {/* Footer Note */}
                        <div className="bg-amber-50 px-4 py-2 border-t border-amber-100">
                            <p className="text-xs text-amber-700 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-xs">info</span>
                                Added to your booking. Review in final step.
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
