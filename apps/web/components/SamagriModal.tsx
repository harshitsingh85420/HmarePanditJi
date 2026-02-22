"use client";

import React, { useState, useEffect } from "react";
import { Modal, Button } from "@hmarepanditji/ui";
import { useSamagriCart, SamagriSelection } from "../context/SamagriCartContext";

export interface SamagriPackage {
    id: string;
    packageName: string;
    pujaType: string;
    fixedPrice: number;
    items: Array<{ itemName: string; quantity: string }>;
}

export interface CatalogCategory {
    name: string;
    items: Array<{
        id: string;
        name: string;
        unit: string;
        basePrice: number;
        description: string;
    }>;
}

interface SamagriModalProps {
    panditId: string;
    pujaType: string;
    packages: SamagriPackage[];
    isOpen: boolean;
    onClose: () => void;
}

export function SamagriModal({
    panditId,
    pujaType,
    packages,
    isOpen,
    onClose,
}: SamagriModalProps) {
    const { setSelection, setIsCartOpen, selection: currentCart } = useSamagriCart();
    const [activeTab, setActiveTab] = useState<"PANDIT" | "CUSTOM">("PANDIT");
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
        packages.length > 0 ? packages[0].id : null
    );
    const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null);

    const [catalog, setCatalog] = useState<CatalogCategory[]>([]);
    const [customItems, setCustomItems] = useState<Record<string, number>>({});
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (packages.length > 0 && !selectedPackageId) {
            setSelectedPackageId(packages[0].id);
        }
    }, [packages, selectedPackageId]);

    useEffect(() => {
        if (activeTab === "CUSTOM" && catalog.length === 0) {
            fetch(`/api/samagri/catalog?pujaType=${encodeURIComponent(pujaType)}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data && data.categories) {
                        setCatalog(data.categories);
                        const initialExpanded: Record<string, boolean> = {};
                        data.categories.forEach((cat: any) => {
                            initialExpanded[cat.name] = true;
                        });
                        setExpandedCategories(initialExpanded);
                    }
                })
                .catch(console.error);
        }
    }, [activeTab, pujaType, catalog.length]);

    const handleAddToCart = () => {
        if (currentCart) {
            const confirmReplace = window.confirm(
                "You already have Samagri in your cart. Replace your existing selection?"
            );
            if (!confirmReplace) return;
        }

        let newSelection: SamagriSelection;

        if (activeTab === "PANDIT") {
            const pkg = packages.find((p) => p.id === selectedPackageId);
            if (!pkg) return;

            newSelection = {
                source: "PANDIT_PACKAGE",
                panditId,
                pujaType,
                packageId: pkg.id,
                packageName: pkg.packageName,
                totalPrice: pkg.fixedPrice,
                lockedAt: new Date().toISOString(),
            };
        } else {
            const itemsList: any[] = [];
            let total = 0;
            catalog.forEach((cat) => {
                cat.items.forEach((item) => {
                    if (customItems[item.id]) {
                        const qty = customItems[item.id];
                        itemsList.push({
                            id: item.id,
                            name: item.name,
                            unit: item.unit,
                            price: item.basePrice,
                            quantity: qty,
                        });
                        total += item.basePrice * qty;
                    }
                });
            });

            if (itemsList.length === 0) {
                alert("Please select at least one item.");
                return;
            }

            newSelection = {
                source: "PLATFORM_CUSTOM",
                panditId,
                pujaType,
                items: itemsList,
                totalPrice: total,
                lockedAt: new Date().toISOString(),
            };
        }

        setSelection(newSelection);
        onClose();
        setIsCartOpen(true);
    };

    const handleItemQuantity = (itemId: string, diff: number) => {
        setCustomItems((prev) => {
            const val = (prev[itemId] || 0) + diff;
            if (val <= 0) {
                const copy = { ...prev };
                delete copy[itemId];
                return copy;
            }
            return { ...prev, [itemId]: val };
        });
    };

    const toggleItemSelect = (itemId: string) => {
        setCustomItems((prev) => {
            if (prev[itemId]) {
                const copy = { ...prev };
                delete copy[itemId];
                return copy;
            }
            return { ...prev, [itemId]: 1 };
        });
    };

    if (!isOpen) return null;

    const selectedPkg = packages.find((p) => p.id === selectedPackageId);

    // Calculate custom cart total
    let customTotal = 0;
    catalog.forEach((cat) => {
        cat.items.forEach((item: any) => {
            if (customItems[item.id]) {
                customTotal += item.basePrice * customItems[item.id];
            }
        });
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <div className="p-6 max-h-[90vh] overflow-y-auto w-full">
                <h2 className="text-2xl font-bold mb-1">🌸 Samagri for {pujaType}</h2>
                <p className="text-gray-500 mb-6">Choose how you'd like to arrange the ritual materials</p>

                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        className={`flex-1 py-3 text-center font-bold font-medium border-b-2 transition-colors ${activeTab === "PANDIT"
                            ? "border-orange-500 text-orange-600"
                            : "border-transparent text-gray-500 hover:bg-gray-50"
                            }`}
                        onClick={() => setActiveTab("PANDIT")}
                    >
                        Pandit Ji's Package
                    </button>
                    <button
                        className={`flex-1 py-3 text-center font-medium font-bold border-b-2 transition-colors ${activeTab === "CUSTOM"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:bg-gray-50"
                            }`}
                        onClick={() => setActiveTab("CUSTOM")}
                    >
                        Build Your Own List
                    </button>
                </div>

                {activeTab === "PANDIT" && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            📦 Pandit Ji's Recommended Samagri Packages
                        </h3>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
                            ⚠️ These packages are fixed and non-negotiable. The price and included items are set by Pandit Ji.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            {packages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${selectedPackageId === pkg.id
                                        ? "border-orange-500 bg-orange-50/30"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    onClick={() => setSelectedPackageId(pkg.id)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 font-bold">
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPackageId === pkg.id ? "border-orange-500" : "border-gray-300"
                                                }`}>
                                                {selectedPackageId === pkg.id && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                                            </div>
                                            {pkg.packageName}
                                        </div>
                                        <span className="font-bold text-gray-900">₹{pkg.fixedPrice}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3">{pkg.items?.length || 0} items included</p>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); setExpandedPackageId(expandedPackageId === pkg.id ? null : pkg.id); }}
                                        className="text-xs font-bold text-orange-600 flex items-center gap-1"
                                    >
                                        {expandedPackageId === pkg.id ? "Hide Items ▴" : "View Items ▾"}
                                    </button>

                                    {expandedPackageId === pkg.id && (
                                        <ul className="mt-3 text-xs text-gray-600 space-y-1 bg-white p-2 rounded border shadow-sm max-h-40 overflow-y-auto">
                                            {pkg.items?.map((item: any, i: number) => (
                                                <li key={i}>• {item.itemName} ({item.quantity})</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                            {packages.length === 0 && (
                                <p className="col-span-3 text-center text-gray-500 py-4">This Pandit has not defined any samagri packages yet.</p>
                            )}
                        </div>

                        {selectedPkg && (
                            <div className="mt-6">
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                                    <div className="font-medium">Selected: {selectedPkg.packageName} Package</div>
                                    <div className="text-gray-600">Fixed price: ₹{selectedPkg.fixedPrice}</div>
                                    <div className="text-xs text-gray-500 mt-1">Non-negotiable, includes all items</div>
                                </div>
                                <Button
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow cursor-pointer"
                                    onClick={handleAddToCart}
                                >
                                    Add to Cart — ₹{selectedPkg.fixedPrice}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "CUSTOM" && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-800 text-sm mb-4">
                            ℹ️ You'll source these items locally or we'll connect you with our vendors.
                        </div>

                        <div className="space-y-3">
                            {catalog.map((cat) => (
                                <div key={cat.name} className="border border-gray-200 rounded-xl overflow-hidden">
                                    <button
                                        className="w-full flex justify-between items-center p-3 bg-gray-50 font-bold hover:bg-gray-100 transition"
                                        onClick={() => setExpandedCategories(prev => ({ ...prev, [cat.name]: !prev[cat.name] }))}
                                    >
                                        <span>{expandedCategories[cat.name] ? "▼" : "▶"} {cat.name} ({cat.items.length} items)</span>
                                    </button>
                                    {expandedCategories[cat.name] && (
                                        <div className="divide-y divide-gray-100">
                                            {cat.items.map((item: any) => {
                                                const isSelected = !!customItems[item.id];
                                                // Check if it's in standard package
                                                const standardPkg = packages.find(p => p.packageName === "Standard");
                                                const isInStandard = standardPkg?.items?.some(i => i.itemName.toLowerCase().includes(item.name.toLowerCase()));

                                                return (
                                                    <div key={item.id} className={`p-3 flex items-center flex-wrap gap-4 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}>
                                                        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleItemSelect(item.id)}
                                                                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                                                            />
                                                            <div>
                                                                <div className="font-medium text-gray-900">{item.name} <span className="text-xs text-gray-500">({item.unit})</span></div>
                                                                {isInStandard && (
                                                                    <div className="text-[10px] text-amber-600 font-medium">✨ In Pandit's {standardPkg?.packageName}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="w-16 text-right font-medium text-gray-700">₹{item.basePrice}</div>

                                                        <div className="w-24 flex justify-end">
                                                            {isSelected ? (
                                                                <div className="flex items-center gap-2 border rounded-lg overflow-hidden bg-white shadow-sm">
                                                                    <button onClick={() => handleItemQuantity(item.id, -1)} className="px-2 py-1 bg-gray-50 hover:bg-gray-100 border-r">−</button>
                                                                    <span className="w-6 text-center text-sm font-bold">{customItems[item.id]}</span>
                                                                    <button onClick={() => handleItemQuantity(item.id, 1)} className="px-2 py-1 bg-gray-50 hover:bg-gray-100 border-l">+</button>
                                                                </div>
                                                            ) : (
                                                                <div className="w-24"></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 bg-white border-t border-gray-100 pt-4 pb-2 sticky bottom-0">
                            <div className="mb-4">
                                <div className="text-gray-900 font-bold text-lg">Your Custom List: ₹{customTotal}</div>
                                {packages.length > 0 && (
                                    <div className="text-sm text-gray-500 font-medium mt-1">
                                        vs. Pandit's {packages[packages.length - 1].packageName} Package: ₹{packages[packages.length - 1].fixedPrice}
                                        {packages[packages.length - 1].fixedPrice > customTotal && (
                                            <span className="text-green-600 ml-1">— You save ₹{packages[packages.length - 1].fixedPrice - customTotal}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow cursor-pointer disabled:opacity-50"
                                onClick={handleAddToCart}
                                disabled={Object.keys(customItems).length === 0}
                            >
                                Add Custom List to Cart — ₹{customTotal}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
