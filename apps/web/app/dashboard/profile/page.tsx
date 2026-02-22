"use client";

import { useState, useEffect } from "react";
import { Button, Card, Input, Badge } from "@hmarepanditji/ui";
import { MapPin, User as UserIcon, Bell, Users, Trash2, Edit2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();

    const [profile, setProfile] = useState<any>(null);
    const [user, setUser] = useState<any>(null);

    // Edit mode states
    const [isEditingSectionA, setIsEditingSectionA] = useState(false);
    const [formDataSectionA, setFormDataSectionA] = useState({ name: "", email: "", preferredLanguages: [] as string[] });

    // Addresses
    const [addresses, setAddresses] = useState<any[]>([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState({
        id: "",
        label: "Home",
        fullAddress: "",
        city: "",
        state: "Delhi",
        pincode: "",
        landmark: "",
        isDefault: false
    });

    const [isLoading, setIsLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState("");

    const SUPPORTED_LANGUAGES = ["Hindi", "Sanskrit", "English", "Bhojpuri", "Maithili"];

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/customers/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const profileData = data.data;
                setProfile(profileData);
                setUser(profileData.user);
                setAddresses(profileData.addresses || []);
                setFormDataSectionA({
                    name: profileData.user.name || "",
                    email: profileData.user.email || "",
                    preferredLanguages: profileData.preferredLanguages || []
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSaveSectionA = async () => {
        setSaveLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/customers/me`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(formDataSectionA)
            });
            if (!res.ok) throw new Error("Failed to update profile");
            await fetchProfile();
            setIsEditingSectionA(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaveLoading(false);
        }
    };

    const toggleLanguage = (lang: string) => {
        setFormDataSectionA(prev => {
            const isSelected = prev.preferredLanguages.includes(lang);
            if (isSelected) {
                return { ...prev, preferredLanguages: prev.preferredLanguages.filter(l => l !== lang) };
            }
            return { ...prev, preferredLanguages: [...prev.preferredLanguages, lang] };
        });
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveLoading(true);
        try {
            const token = localStorage.getItem("token");
            const isEdit = !!addressForm.id;
            const url = isEdit
                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/customers/me/addresses/${addressForm.id}`
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/customers/me/addresses`;

            const res = await fetch(url, {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(addressForm)
            });
            if (!res.ok) throw new Error("Failed to save address");
            await fetchProfile();
            setShowAddressForm(false);
            resetAddressForm();
        } catch (err: any) {
            setError("Failed to save address: " + err.message);
        } finally {
            setSaveLoading(false);
        }
    };

    const setPrimaryAddress = async (id: string, currentData: any) => {
        try {
            const token = localStorage.getItem("token");
            const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/customers/me/addresses/${id}`;
            await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ isDefault: true })
            });
            fetchProfile();
        } catch (err) {
            console.error(err);
        }
    }

    const handleDeleteAddress = async (id: string) => {
        if (!confirm("Are you sure you want to delete this address?")) return;
        try {
            const token = localStorage.getItem("token");
            const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/customers/me/addresses/${id}`;
            await fetch(url, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchProfile();
        } catch (err) {
            console.error(err);
        }
    }

    const resetAddressForm = () => {
        setAddressForm({
            id: "",
            label: "Home",
            fullAddress: "",
            city: "",
            state: "Delhi",
            pincode: "",
            landmark: "",
            isDefault: addresses.length === 0
        });
    };

    if (isLoading) return <div className="p-8 text-center text-amber-600">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-[1fr,300px] gap-8">

            <div className="space-y-6">
                {/* SECTION A: Personal Details */}
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-amber-600" /> Personal Details
                        </h2>
                        {!isEditingSectionA ? (
                            <Button variant="outline" size="sm" onClick={() => setIsEditingSectionA(true)}>
                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setIsEditingSectionA(false)}>Cancel</Button>
                                <Button variant="primary" size="sm" onClick={handleSaveSectionA} disabled={saveLoading}>Save</Button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-500">Name</label>
                                {isEditingSectionA ? (
                                    <Input value={formDataSectionA.name} onChange={(e) => setFormDataSectionA({ ...formDataSectionA, name: e.target.value })} className="mt-1" />
                                ) : (
                                    <p className="font-medium mt-1">{user?.name || "Not provided"}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Email (Optional)</label>
                                {isEditingSectionA ? (
                                    <Input value={formDataSectionA.email} onChange={(e) => setFormDataSectionA({ ...formDataSectionA, email: e.target.value })} className="mt-1" />
                                ) : (
                                    <p className="font-medium mt-1">{user?.email || "Not provided"}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-500 flex items-center gap-2">
                                Phone Number
                                <Badge variant="success" className="px-1.5 py-0 items-center justify-center h-4"><span className="text-[10px]">✓ Verified</span></Badge>
                            </label>
                            <p className="font-medium mt-1 text-gray-700 bg-gray-50 py-2 px-3 rounded-lg border border-gray-200 inline-block w-full md:w-auto">
                                {user?.phone}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm text-gray-500 mb-2 block">Preferred Languages</label>
                            <div className="flex gap-2 flex-wrap">
                                {isEditingSectionA ? (
                                    SUPPORTED_LANGUAGES.map(lang => {
                                        const isSel = formDataSectionA.preferredLanguages.includes(lang);
                                        return (
                                            <button
                                                key={lang}
                                                onClick={() => toggleLanguage(lang)}
                                                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${isSel ? 'bg-amber-100 border-amber-500 text-amber-700' : 'bg-white border-gray-300 text-gray-600'}`}
                                            >
                                                {lang}
                                            </button>
                                        );
                                    })
                                ) : (
                                    formDataSectionA.preferredLanguages.length > 0 ? formDataSectionA.preferredLanguages.map((lang: string) => (
                                        <Badge key={lang} variant="neutral" className="border border-amber-200 bg-amber-50 text-amber-700 rounded-full">{lang}</Badge>
                                    )) : <span className="text-sm text-gray-500 italic">None selected</span>
                                )}
                            </div>
                        </div>
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                    </div>
                </Card>

                {/* SECTION B: Addresses */}
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-600" /> Saved Addresses
                        </h2>
                        {!showAddressForm && (
                            <Button variant="outline" size="sm" onClick={() => { resetAddressForm(); setShowAddressForm(true); }}>
                                + Add New
                            </Button>
                        )}
                    </div>

                    {showAddressForm ? (
                        <form onSubmit={handleSaveAddress} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-sm font-medium">Label</label>
                                    <select
                                        value={addressForm.label}
                                        onChange={e => setAddressForm({ ...addressForm, label: e.target.value })}
                                        className="mt-1 block w-full outline-none border-gray-300 rounded-lg p-2 border focus:ring-amber-500 focus:border-amber-500"
                                    >
                                        <option>Home</option>
                                        <option>Office</option>
                                        <option>Temple</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="col-span-2 md:col-span-1 border self-end flex items-center p-2 rounded-lg bg-white border-gray-300 h-[42px]">
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        className="w-4 h-4 text-amber-600 rounded mr-2 focus:ring-amber-500"
                                        checked={addressForm.isDefault}
                                        onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                    />
                                    <label htmlFor="isDefault" className="text-sm">Set as Primary Address</label>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium">Full Address</label>
                                    <textarea
                                        required
                                        value={addressForm.fullAddress}
                                        onChange={e => setAddressForm({ ...addressForm, fullAddress: e.target.value })}
                                        className="mt-1 block w-full outline-none border-gray-300 rounded-lg p-2 border min-h-[80px]"
                                        placeholder="House/Flat No., Building Name, Street"
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-sm font-medium">City</label>
                                    <Input required value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-sm font-medium">PIN Code</label>
                                    <Input required value={addressForm.pincode} onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })} maxLength={6} pattern="\d{6}" placeholder="e.g. 110001" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium">Landmark (Optional)</label>
                                    <Input value={addressForm.landmark} onChange={e => setAddressForm({ ...addressForm, landmark: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <Button variant="outline" type="button" onClick={() => setShowAddressForm(false)}>Cancel</Button>
                                <Button variant="primary" type="submit" disabled={saveLoading}>Save Address</Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {addresses.map(addr => (
                                <div key={addr.id} className={`p-4 rounded-xl border relative transition-all ${addr.isDefault ? 'border-amber-400 bg-amber-50/50' : 'border-gray-200 bg-white'}`}>
                                    {addr.isDefault && (
                                        <span className="absolute top-4 right-4 text-amber-600 text-xs font-bold uppercase flex items-center">
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Primary
                                        </span>
                                    )}
                                    <h3 className="font-bold text-gray-800 mb-1">{addr.label}</h3>
                                    <p className="text-sm text-gray-600 mb-1">{addr.fullAddress}</p>
                                    <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                                    {addr.landmark && <p className="text-xs text-gray-500 mt-1">Landmark: {addr.landmark}</p>}

                                    <div className="flex gap-3 mt-4 pt-3 border-t">
                                        <button
                                            onClick={() => {
                                                setAddressForm(addr);
                                                setShowAddressForm(true);
                                            }}
                                            className="text-xs text-indigo-600 font-medium hover:underline flex items-center"
                                        >
                                            <Edit2 className="w-3 h-3 mr-1" /> Edit
                                        </button>
                                        {!addr.isDefault && (
                                            <button
                                                onClick={() => setPrimaryAddress(addr.id, addr)}
                                                className="text-xs text-amber-600 font-medium hover:underline flex items-center"
                                            >
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> Set as Primary
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteAddress(addr.id)}
                                            className="text-xs text-red-500 font-medium hover:underline flex items-center ml-auto"
                                        >
                                            <Trash2 className="w-3 h-3 mr-1" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {addresses.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    No addresses saved yet. Add one to speed up booking.
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>

            {/* SECTION C: Account Actions */}
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-800">Quick Actions</h3>

                <Link href="/dashboard/profile/family" className="block text-left p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors w-full">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">Family & Gotra</h4>
                            <p className="text-xs text-gray-500 mt-0.5">Manage family details for personalized pooja.</p>
                        </div>
                    </div>
                </Link>

                <Link href="/dashboard/notifications" className="block text-left p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors w-full">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">Notification Preferences</h4>
                            <p className="text-xs text-gray-500 mt-0.5">Manage alerts and messages.</p>
                        </div>
                    </div>
                </Link>

                <button className="text-left mt-8 p-4 rounded-xl border border-red-200 bg-red-50/30 hover:bg-red-50 transition-colors w-full text-red-700 focus:outline-none">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-lg text-red-600">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold">Delete Account</h4>
                            <p className="text-xs text-red-500 mt-0.5">Permanently remove your data.</p>
                        </div>
                    </div>
                </button>
            </div>

        </div>
    );
}
