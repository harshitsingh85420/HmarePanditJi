"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();

    const [profile, setProfile] = useState<any>(null);
    const [user, setUser] = useState<any>(null);

    // Editing states
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
            console.error(err);
        } finally {
            setSaveLoading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-[#f29e0d]">Loading profile...</div>;

    return (
        <div className="flex-1 flex flex-col gap-8 pb-12 w-full max-w-5xl">
            {/* Section: My Profile */}
            <section className="bg-[#27231b] rounded-xl p-8 border border-[#393328] shadow-xl">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">My Profile</h2>
                        <p className="text-[#baaf9c] text-sm">Personal details and preferences</p>
                    </div>
                    {!isEditingSectionA ? (
                        <button
                            onClick={() => setIsEditingSectionA(true)}
                            className="text-[#f29e0d] border border-[#f29e0d]/30 hover:bg-[#f29e0d]/10 px-4 py-2 rounded-lg text-sm font-semibold transition-all">
                            Edit Details
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditingSectionA(false)}
                                className="text-white border border-[#393328] hover:bg-[#393328] px-4 py-2 rounded-lg text-sm font-semibold transition-all">
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveSectionA}
                                disabled={saveLoading}
                                className="bg-[#f29e0d] text-black px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[#f29e0d]/90">
                                Save
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#baaf9c]">Full Name</label>
                        {isEditingSectionA ? (
                            <input
                                value={formDataSectionA.name}
                                onChange={(e) => setFormDataSectionA({ ...formDataSectionA, name: e.target.value })}
                                className="bg-[#181511] p-3 rounded-lg border border-[#393328] text-white focus:ring-1 focus:ring-[#f29e0d] outline-none"
                            />
                        ) : (
                            <div className="bg-[#393328]/50 p-3 rounded-lg border border-[#393328] text-white overflow-hidden text-ellipsis whitespace-nowrap">
                                {user?.name || "Not provided"}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#baaf9c]">Phone Number</label>
                        <div className="bg-[#393328]/50 p-3 rounded-lg border border-[#393328] text-white flex justify-between items-center">
                            {user?.phone}
                            <span className="text-[10px] bg-green-900 text-green-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Verified</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#baaf9c]">Preferred Languages</label>
                        {isEditingSectionA ? (
                            <select
                                multiple
                                value={formDataSectionA.preferredLanguages}
                                onChange={(e) => {
                                    const opts = Array.from(e.target.selectedOptions, option => option.value);
                                    setFormDataSectionA({ ...formDataSectionA, preferredLanguages: opts });
                                }}
                                className="bg-[#181511] p-3 rounded-lg border border-[#393328] text-white focus:ring-1 focus:ring-[#f29e0d] outline-none h-24"
                            >
                                {SUPPORTED_LANGUAGES.map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="bg-[#393328]/50 p-3 rounded-lg border border-[#393328] text-white overflow-hidden text-ellipsis whitespace-nowrap">
                                {profile?.preferredLanguages?.join(", ") || "English & Hindi"}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Section: My Family */}
            <section className="bg-[#27231b] rounded-xl p-8 border border-[#393328] shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">My Family & Gotra</h2>
                        <p className="text-[#baaf9c] text-sm">Add family members for personalized rituals</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/family')}
                        className="flex items-center gap-2 bg-[#f29e0d]/20 text-[#f29e0d] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#f29e0d]/30 transition-all">
                        <span className="material-symbols-outlined text-base">add</span>
                        Manage members
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Placeholder for Family Members - We link to /family to manage */}
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-[#393328] bg-[#181511]/30">
                        <div className="size-12 rounded-full bg-[#f29e0d]/10 flex items-center justify-center text-[#f29e0d]">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-white font-semibold">You ({user?.name || "User"})</h4>
                            <p className="text-[#baaf9c] text-xs">Gotra: {(profile as any)?.gotra || "Not specified"}</p>
                        </div>
                        <button onClick={() => router.push('/dashboard/family')} className="text-[#baaf9c] hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                    </div>
                    {(profile as any)?.familyMembers?.slice(0, 1).map((member: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-[#393328] bg-[#181511]/30">
                            <div className="size-12 rounded-full bg-[#f29e0d]/10 flex items-center justify-center text-[#f29e0d]">
                                <span className="material-symbols-outlined">{member.relation === 'Wife' ? 'woman' : 'person'}</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-semibold">{member.name}</h4>
                                <p className="text-[#baaf9c] text-xs">{member.relation} • Gotra: {member.gotra}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Section: Saved Addresses */}
                <section className="bg-[#27231b] rounded-xl p-8 border border-[#393328] shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Saved Addresses</h2>
                        <button onClick={() => router.push('/dashboard/addresses')} className="text-[#f29e0d] text-sm font-semibold hover:underline">Manage All</button>
                    </div>
                    <div className="space-y-4">
                        {addresses.length > 0 ? addresses.map((addr) => (
                            <div key={addr.id} className="flex gap-3 items-start p-4 rounded-lg bg-[#181511]/30 border border-[#393328]">
                                <span className="material-symbols-outlined text-[#f29e0d] mt-1">home</span>
                                <div>
                                    <h4 className="text-white font-medium flex items-center gap-2">
                                        {addr.label}
                                        {addr.isDefault && <span className="text-[10px] px-1 py-0.5 bg-[#f29e0d]/20 text-[#f29e0d] rounded uppercase font-bold">Primary</span>}
                                    </h4>
                                    <p className="text-[#baaf9c] text-xs leading-relaxed mt-1">
                                        {addr.fullAddress}, {addr.city}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-sm text-[#baaf9c] py-4 text-center border border-dashed border-[#393328] rounded-lg">
                                No addresses saved.
                            </div>
                        )}
                    </div>
                </section>

                {/* Section: Payment Methods */}
                <section className="bg-[#27231b] rounded-xl p-8 border border-[#393328] shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Payment Methods</h2>
                        <button className="text-[#f29e0d] text-sm font-semibold hover:underline">Manage</button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-[#181511]/30 border border-[#393328]">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#f29e0d]">payments</span>
                                <div>
                                    <h4 className="text-white font-medium">Standard UPI</h4>
                                    <p className="text-[#baaf9c] text-xs mt-1">For all quick payments</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-[#baaf9c] text-base cursor-pointer">check_circle</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* Section: My Pandits (Kul Purohits) */}
            <section className="bg-[#27231b] rounded-xl p-8 border border-[#393328] shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">My Pandits</h2>
                        <p className="text-[#baaf9c] text-sm">Trusted family Pandits and Kul Purohits</p>
                    </div>
                    <button onClick={() => router.push('/search')} className="text-[#f29e0d] text-sm font-semibold border border-[#f29e0d]/20 px-4 py-2 rounded-lg hover:bg-[#f29e0d]/5 transition-all hidden md:block">
                        Find New Pandit
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div onClick={() => router.push('/dashboard/favorites')} className="flex items-center gap-5 p-5 rounded-xl bg-[#181511]/30 border border-[#393328] group hover:border-[#f29e0d]/40 transition-all cursor-pointer">
                        <div className="size-16 rounded-lg bg-[#393328] flex items-center justify-center text-[#baaf9c] shadow-lg border border-[#393328]">
                            <span className="material-symbols-outlined text-3xl">self_improvement</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-white font-bold text-lg">Favorite Pandits</h4>
                            <p className="text-[#baaf9c] text-sm mt-0.5">View your saved pandits</p>
                        </div>
                        <span className="material-symbols-outlined text-[#baaf9c] group-hover:text-[#f29e0d] transition-colors">chevron_right</span>
                    </div>
                </div>
            </section>

            <div className="pt-8 mb-8 border-t border-[#393328]">
                <button className="text-left p-4 rounded-xl border border-red-900/50 bg-red-900/10 hover:bg-red-900/20 transition-colors w-full text-red-500 focus:outline-none max-w-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-900/30 p-2 rounded-lg text-red-500">
                            <span className="material-symbols-outlined">delete</span>
                        </div>
                        <div>
                            <h4 className="font-bold">Delete Account</h4>
                            <p className="text-xs text-red-400/80 mt-0.5">Permanently remove your data.</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}
