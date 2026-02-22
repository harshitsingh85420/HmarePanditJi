"use client";

import { useState, useEffect } from "react";

interface SamagriItem {
    itemName: string;
    quantity: string;
    qualityNotes?: string;
}

interface SamagriPackage {
    id: string;
    packageName: "Basic" | "Standard" | "Premium";
    pujaType: string;
    fixedPrice: number;
    items: SamagriItem[];
    isActive: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export default function SamagriPackagesPage() {
    const [packages, setPackages] = useState<SamagriPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPackage, setEditingPackage] = useState<SamagriPackage | null>(null);

    // Fetch packages
    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("hpj_token");
            const res = await fetch(`${API_BASE}/pandits/me/samagri-packages`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setPackages(data);
            }
        } catch (error) {
            console.error("Failed to fetch packages:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this package?")) return;

        try {
            const token = localStorage.getItem("hpj_token");
            const res = await fetch(`${API_BASE}/pandits/me/samagri-packages/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                fetchPackages(); // Refresh list
            }
        } catch (error) {
            console.error("Failed to delete package:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">
                                Samagri Packages
                            </h1>
                            <p className="text-slate-600 mt-1">
                                Manage your fixed-price samagri offerings for customers
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingPackage(null);
                                setShowForm(true);
                            }}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Create Package
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-5 border border-slate-100">
                        <div className="text-2xl font-black text-slate-900">
                            {packages.filter((p) => p.isActive).length}
                        </div>
                        <div className="text-sm text-slate-500">Active Packages</div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-slate-100">
                        <div className="text-2xl font-black text-green-600">
                            {packages.filter((p) => p.packageName === "Basic").length}
                        </div>
                        <div className="text-sm text-slate-500">Basic Tier</div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-slate-100">
                        <div className="text-2xl font-black text-amber-600">
                            {packages.filter((p) => p.packageName === "Standard").length}
                        </div>
                        <div className="text-sm text-slate-500">Standard Tier</div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-slate-100">
                        <div className="text-2xl font-black text-purple-600">
                            {packages.filter((p) => p.packageName === "Premium").length}
                        </div>
                        <div className="text-sm text-slate-500">Premium Tier</div>
                    </div>
                </div>

                {/* Packages List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : packages.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                        <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">
                            inventory_2
                        </span>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            No packages yet
                        </h3>
                        <p className="text-slate-500 mb-6">
                            Create your first samagri package to offer customers
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                        >
                            Create First Package
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((pkg) => (
                            <PackageCard
                                key={pkg.id}
                                package={pkg}
                                onEdit={() => {
                                    setEditingPackage(pkg);
                                    setShowForm(true);
                                }}
                                onDelete={() => handleDelete(pkg.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Form Modal */}
                {showForm && (
                    <PackageForm
                        package={editingPackage}
                        onClose={() => {
                            setShowForm(false);
                            setEditingPackage(null);
                        }}
                        onSave={() => {
                            setShowForm(false);
                            setEditingPackage(null);
                            fetchPackages();
                        }}
                    />
                )}
            </div>
        </div>
    );
}

function PackageCard({
    package: pkg,
    onEdit,
    onDelete,
}: {
    package: SamagriPackage;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const colors = {
        Basic: "from-slate-500 to-slate-600",
        Standard: "from-amber-500 to-amber-600",
        Premium: "from-purple-500 to-purple-600",
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className={`h-2 bg-gradient-to-r ${colors[pkg.packageName]}`} />
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div
                                className={`inline-block px-2.5 py-1 rounded-full text-white text-xs font-bold bg-gradient-to-r ${colors[pkg.packageName]
                                    }`}
                            >
                                {pkg.packageName}
                            </div>
                            {!pkg.isActive && (
                                <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                    Inactive
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-slate-600">{pkg.pujaType}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-slate-900">
                            ₹{pkg.fixedPrice.toLocaleString("en-IN")}
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5 mb-4 max-h-32 overflow-y-auto">
                    {pkg.items.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                            <span className="material-symbols-outlined text-green-600 text-sm mt-0.5">
                                check_circle
                            </span>
                            <span className="text-slate-700 flex-1">
                                {item.itemName} ({item.quantity})
                            </span>
                        </div>
                    ))}
                    {pkg.items.length > 5 && (
                        <p className="text-xs text-slate-500 pl-6">
                            +{pkg.items.length - 5} more items
                        </p>
                    )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button
                        onClick={onEdit}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">edit</span>
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">delete</span>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

function PackageForm({
    package: initialPackage,
    onClose,
    onSave,
}: {
    package: SamagriPackage | null;
    onClose: () => void;
    onSave: () => void;
}) {
    const [formData, setFormData] = useState({
        packageName: initialPackage?.packageName || ("Basic" as "Basic" | "Standard" | "Premium"),
        pujaType: initialPackage?.pujaType || "",
        fixedPrice: initialPackage?.fixedPrice || 0,
        items: initialPackage?.items || [],
    });

    const [newItem, setNewItem] = useState({ itemName: "", quantity: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("hpj_token");
            const url = initialPackage
                ? `${API_BASE}/pandits/me/samagri-packages/${initialPackage.id}`
                : `${API_BASE}/pandits/me/samagri-packages`;

            const res = await fetch(url, {
                method: initialPackage ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                onSave();
            }
        } catch (error) {
            console.error("Failed to save package:", error);
        }
    };

    const addItem = () => {
        if (newItem.itemName && newItem.quantity) {
            setFormData({
                ...formData,
                items: [...formData.items, newItem],
            });
            setNewItem({ itemName: "", quantity: "" });
        }
    };

    const removeItem = (index: number) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-black text-slate-900">
                        {initialPackage ? "Edit" : "Create"} Package
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Package Tier */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Package Tier *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {(["Basic", "Standard", "Premium"] as const).map((tier) => (
                                <button
                                    key={tier}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, packageName: tier })}
                                    className={`px-4 py-3 border-2 rounded-xl font-semibold transition-all ${formData.packageName === tier
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-slate-200 text-slate-700 hover:border-primary/30"
                                        }`}
                                >
                                    {tier}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Puja Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Puja Type *
                        </label>
                        <input
                            type="text"
                            value={formData.pujaType}
                            onChange={(e) => setFormData({ ...formData, pujaType: e.target.value })}
                            placeholder="e.g., Vivah Puja"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            required
                        />
                    </div>

                    {/* Fixed Price */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Fixed Price (₹) *
                        </label>
                        <input
                            type="number"
                            value={formData.fixedPrice || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, fixedPrice: parseInt(e.target.value) || 0 })
                            }
                            placeholder="5000"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            required
                            min="0"
                        />
                    </div>

                    {/* Items */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Package Items *
                        </label>

                        {/* Existing Items */}
                        {formData.items.length > 0 && (
                            <div className="space-y-2 mb-3">
                                {formData.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2"
                                    >
                                        <span className="flex-1 text-sm font-medium text-slate-700">
                                            {item.itemName} ({item.quantity})
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(idx)}
                                            className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-base">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Item Form */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newItem.itemName}
                                onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                                placeholder="Item name"
                                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            />
                            <input
                                type="text"
                                value={newItem.quantity}
                                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                                placeholder="Quantity"
                                className="w-28 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            />
                            <button
                                type="button"
                                onClick={addItem}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors"
                        >
                            {initialPackage ? "Update" : "Create"} Package
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
