"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth, API_BASE } from "../../../context/auth-context";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Address {
    id: string;
    label: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
}

interface UserProfile {
    fullName: string;
    phone: string;
    email: string;
    avatarUrl?: string;
    addresses: Address[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
    const { user, accessToken, openLoginModal, loading: authLoading, setUser } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile>({
        fullName: "",
        phone: "",
        email: "",
        addresses: [],
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<"info" | "address" | null>(null);
    const [editForm, setEditForm] = useState({ fullName: "", email: "" });
    const [addressForm, setAddressForm] = useState<Partial<Address>>({});
    const [toast, setToast] = useState("");

    useEffect(() => {
        if (!authLoading && !user) openLoginModal();
    }, [authLoading, user, openLoginModal]);

    const fetchProfile = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/customers/profile`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                signal: AbortSignal.timeout(5000),
            });
            if (!res.ok) throw new Error();
            const j = await res.json();
            const data = j.data ?? j;
            setProfile({
                fullName: data.fullName ?? user?.fullName ?? "",
                phone: data.phone ?? user?.phone ?? "",
                email: data.email ?? user?.email ?? "",
                avatarUrl: data.avatarUrl ?? user?.avatarUrl,
                addresses: Array.isArray(data.addresses) ? data.addresses : [],
            });
        } catch {
            // Use auth context user as fallback
            setProfile({
                fullName: user?.fullName ?? "",
                phone: user?.phone ?? "",
                email: user?.email ?? "",
                avatarUrl: user?.avatarUrl ?? undefined,
                addresses: [],
            });
        } finally {
            setLoading(false);
        }
    }, [accessToken, user]);

    useEffect(() => {
        if (user && accessToken) fetchProfile();
    }, [user, accessToken, fetchProfile]);

    // ── Save personal info ────────────────────────────────────────────────────

    async function saveInfo() {
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/customers/profile`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify({ fullName: editForm.fullName, email: editForm.email }),
            });
            if (!res.ok) throw new Error();
            setProfile((p) => ({ ...p, fullName: editForm.fullName, email: editForm.email }));
            // Update auth context too
            if (user) setUser({ ...user, fullName: editForm.fullName, email: editForm.email });
            setEditing(null);
            showToast("Profile updated");
        } catch {
            showToast("Could not save. Try again.");
        } finally {
            setSaving(false);
        }
    }

    // ── Save address ──────────────────────────────────────────────────────────

    async function saveAddress() {
        setSaving(true);
        try {
            const method = addressForm.id ? "PATCH" : "POST";
            const url = addressForm.id
                ? `${API_BASE}/customers/addresses/${addressForm.id}`
                : `${API_BASE}/customers/addresses`;
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify(addressForm),
            });
            if (!res.ok) throw new Error();
            await fetchProfile();
            setEditing(null);
            setAddressForm({});
            showToast(addressForm.id ? "Address updated" : "Address added");
        } catch {
            showToast("Could not save address. Try again.");
        } finally {
            setSaving(false);
        }
    }

    async function deleteAddress(id: string) {
        try {
            await fetch(`${API_BASE}/customers/addresses/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setProfile((p) => ({ ...p, addresses: p.addresses.filter((a) => a.id !== id) }));
            showToast("Address removed");
        } catch {
            showToast("Could not delete address.");
        }
    }

    function showToast(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    }

    // ── Render ────────────────────────────────────────────────────────────────

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#f49d25] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-blue-500">person</span>
                    </div>
                    <h2 className="text-slate-700 font-semibold text-lg mb-2">Sign in to manage your profile</h2>
                    <button onClick={openLoginModal} className="px-6 py-2.5 bg-[#f49d25] hover:bg-[#e08c14] text-white rounded-xl font-semibold text-sm transition-colors">
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f7f5]">
            {/* Header */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-2xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-3 mb-1">
                        <button onClick={() => router.push("/dashboard")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors" aria-label="Back">
                            <span className="material-symbols-outlined text-slate-500">arrow_back</span>
                        </button>
                        <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 animate-pulse space-y-3">
                                <div className="h-4 w-28 bg-slate-200 rounded" />
                                <div className="h-4 w-48 bg-slate-200 rounded" />
                                <div className="h-4 w-36 bg-slate-200 rounded" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Avatar & Name Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base text-[#f49d25]">person</span>
                                    Personal Info
                                </h2>
                                {editing !== "info" && (
                                    <button
                                        onClick={() => { setEditing("info"); setEditForm({ fullName: profile.fullName, email: profile.email }); }}
                                        className="text-xs text-[#f49d25] font-bold hover:underline"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            {editing === "info" ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                                        <input
                                            value={editForm.fullName}
                                            onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
                                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] text-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] text-slate-700"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={saveInfo} disabled={saving} className="px-4 py-2 bg-[#f49d25] hover:bg-[#e08c14] disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
                                            {saving ? "Saving…" : "Save"}
                                        </button>
                                        <button onClick={() => setEditing(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-[#f49d25]/10 border-2 border-[#f49d25]/20 flex items-center justify-center overflow-hidden">
                                            {profile.avatarUrl ? (
                                                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-2xl text-[#f49d25]">person</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{profile.fullName || "—"}</p>
                                            <p className="text-sm text-slate-400">{profile.phone}</p>
                                        </div>
                                    </div>
                                    {profile.email && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <span className="material-symbols-outlined text-base text-slate-400">email</span>
                                            {profile.email}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Addresses */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base text-[#f49d25]">location_on</span>
                                    Saved Addresses
                                </h2>
                                {editing !== "address" && (
                                    <button
                                        onClick={() => { setEditing("address"); setAddressForm({ label: "Home", line1: "", city: "Delhi", state: "Delhi", pincode: "" }); }}
                                        className="text-xs text-[#f49d25] font-bold hover:underline flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        Add
                                    </button>
                                )}
                            </div>

                            {editing === "address" ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Label</label>
                                            <select
                                                value={addressForm.label ?? "Home"}
                                                onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))}
                                                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 text-slate-700"
                                            >
                                                <option>Home</option>
                                                <option>Office</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Pincode</label>
                                            <input
                                                value={addressForm.pincode ?? ""}
                                                onChange={(e) => setAddressForm((p) => ({ ...p, pincode: e.target.value }))}
                                                maxLength={6}
                                                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 text-slate-700"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Address Line 1</label>
                                        <input
                                            value={addressForm.line1 ?? ""}
                                            onChange={(e) => setAddressForm((p) => ({ ...p, line1: e.target.value }))}
                                            placeholder="House / Flat / Street"
                                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 text-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Address Line 2 (optional)</label>
                                        <input
                                            value={addressForm.line2 ?? ""}
                                            onChange={(e) => setAddressForm((p) => ({ ...p, line2: e.target.value }))}
                                            placeholder="Landmark"
                                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 text-slate-700"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
                                            <input
                                                value={addressForm.city ?? ""}
                                                onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                                                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 text-slate-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">State</label>
                                            <input
                                                value={addressForm.state ?? ""}
                                                onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))}
                                                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 text-slate-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={saveAddress} disabled={saving || !addressForm.line1} className="px-4 py-2 bg-[#f49d25] hover:bg-[#e08c14] disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
                                            {saving ? "Saving…" : addressForm.id ? "Update" : "Add Address"}
                                        </button>
                                        <button onClick={() => { setEditing(null); setAddressForm({}); }} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : profile.addresses.length === 0 ? (
                                <p className="text-sm text-slate-400 py-4 text-center">No saved addresses. Add one for faster booking.</p>
                            ) : (
                                <div className="space-y-3">
                                    {profile.addresses.map((addr) => (
                                        <div key={addr.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-2">
                                                    <span className="material-symbols-outlined text-[#f49d25] text-base mt-0.5">
                                                        {addr.label === "Home" ? "home" : addr.label === "Office" ? "business" : "location_on"}
                                                    </span>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-700">{addr.label}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                                                        <p className="text-xs text-slate-400">{addr.city}, {addr.state} – {addr.pincode}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => { setEditing("address"); setAddressForm(addr); }}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                                                        title="Edit"
                                                    >
                                                        <span className="material-symbols-outlined text-sm text-slate-400">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => deleteAddress(addr.id)}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                                                        title="Delete"
                                                    >
                                                        <span className="material-symbols-outlined text-sm text-red-400">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                            {addr.isDefault && (
                                                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f49d25]/10 text-[#c47c0e]">Default</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
                    {toast}
                </div>
            )}
        </div>
    );
}
