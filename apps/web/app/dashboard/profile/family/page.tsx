"use client";

import { useState, useEffect } from "react";
import { Button, Card, Input, Badge } from "@hmarepanditji/ui";
import { Users, Info, Plus, Trash2, Edit2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FamilyMember {
    id?: string;
    name: string;
    relation: string;
    dob?: string | null;
    nakshatra?: string | null;
    rashi?: string | null;
}

const COMMON_GOTRAS = [
    "Bharadwaj", "Kashyap", "Vashisht", "Atri", "Gautam", "Jamadagni",
    "Vishwamitra", "Agastya", "Angiras", "Bhrigu", "Parashara", "Sandilya",
    "Kaushik", "Shandilya", "Garg", "Mudgal", "Other"
];

const RELATIONS = ["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Grandfather", "Grandmother", "Other"];

const NAKSHATRAS = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];

const RASHIS = ["Aries (Mesha)", "Taurus (Vrishabha)", "Gemini (Mithuna)", "Cancer (Karka)", "Leo (Simha)", "Virgo (Kanya)", "Libra (Tula)", "Scorpio (Vrishchika)", "Sagittarius (Dhanu)", "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)"];

export default function FamilySetupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [gotraType, setGotraType] = useState("");
    const [customGotra, setCustomGotra] = useState("");
    const [kulDevata, setKulDevata] = useState("");

    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

    // Member form
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [memberForm, setMemberForm] = useState<FamilyMember>({
        name: "", relation: "Spouse", dob: "", nakshatra: "", rashi: ""
    });

    const fetchFamilyInfo = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/customers/me/family`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();

                // Handle Gotra
                if (data.data.gotra) {
                    if (COMMON_GOTRAS.includes(data.data.gotra)) {
                        setGotraType(data.data.gotra);
                    } else {
                        setGotraType("Other");
                        setCustomGotra(data.data.gotra);
                    }
                }

                if (data.data.familyMembers) {
                    setFamilyMembers(data.data.familyMembers.map((m: any) => ({
                        ...m,
                        dob: m.dob ? new Date(m.dob).toISOString().split('T')[0] : ""
                    })));
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFamilyInfo();
    }, []);

    const handleSaveAll = async () => {
        setSaveLoading(true);
        setError("");
        setSuccess("");

        try {
            const finalGotra = gotraType === "Other" ? customGotra : gotraType;

            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/customers/me/family`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    gotra: finalGotra || undefined,
                    kulDevata: kulDevata || undefined,
                    familyMembers: familyMembers.map(m => ({
                        ...m,
                        dob: m.dob ? new Date(m.dob).toISOString() : null
                    }))
                })
            });

            if (!res.ok) throw new Error("Failed to save family details");

            setSuccess("Family details saved successfully!");
            setTimeout(() => setSuccess(""), 3000);
            await fetchFamilyInfo();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleSaveMember = () => {
        if (!memberForm.name.trim()) {
            alert("Name is required");
            return;
        }

        if (editingIndex !== null) {
            const updated = [...familyMembers];
            updated[editingIndex] = memberForm;
            setFamilyMembers(updated);
        } else {
            setFamilyMembers([...familyMembers, memberForm]);
        }

        setShowMemberForm(false);
        setMemberForm({ name: "", relation: "Spouse", dob: "", nakshatra: "", rashi: "" });
        setEditingIndex(null);
    };

    const editMember = (index: number) => {
        setMemberForm(familyMembers[index]);
        setEditingIndex(index);
        setShowMemberForm(true);
    };

    const removeMember = (index: number) => {
        if (!confirm("Remove this family member?")) return;
        setFamilyMembers(familyMembers.filter((_, i) => i !== index));
    };

    if (isLoading) return <div className="p-8 text-center text-amber-600">Loading family details...</div>;

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <Link href="/dashboard/profile" className="inline-flex items-center text-gray-600 hover:text-black mb-6 transition-colors font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
            </Link>

            <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">
                        Family & Gotra Setup
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Bhaag 12 requires gotra and family details for personalized pujas
                    </p>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex gap-3 text-sm mb-8 shadow-sm">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p>यह जानकारी पंडित जी को पूजा में सही मंत्रों के चयन में मदद करती है। आपके परिवार के सदस्यों का नाम और गोत्र संकल्प के समय काम आता है।</p>
            </div>

            <Card className="p-6 mb-8 shadow-sm border-gray-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-3 text-gray-800">
                    SECTION A — Gotra Information
                </h2>

                <div className="space-y-5">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-1">गोत्र (Gotra):</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <select
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                value={gotraType}
                                onChange={(e) => setGotraType(e.target.value)}
                            >
                                <option value="">Select Gotra</option>
                                {COMMON_GOTRAS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>

                            {gotraType === "Other" && (
                                <Input
                                    placeholder="Enter your gotra"
                                    value={customGotra}
                                    onChange={(e) => setCustomGotra(e.target.value)}
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-1">कुल देवता (Kul Devata — Family Deity): <span className="text-xs font-normal text-gray-500">(Optional)</span></label>
                        <Input
                            placeholder="e.g., Shri Ganesh, Durga Mata"
                            value={kulDevata}
                            onChange={(e) => setKulDevata(e.target.value)}
                            className="max-w-md"
                        />
                    </div>
                </div>
            </Card>

            <Card className="p-6 mb-8 shadow-sm border-gray-200">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                        SECTION B — Family Members
                    </h2>
                    {!showMemberForm && (
                        <Button variant="outline" size="sm" onClick={() => setShowMemberForm(true)} className="flex items-center">
                            <Plus className="w-4 h-4 mr-1" /> Add Member
                        </Button>
                    )}
                </div>

                {showMemberForm && (
                    <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-200 mb-6 flex flex-col gap-4">
                        <h3 className="font-bold text-amber-800 mb-2">{editingIndex !== null ? 'Edit Family Member' : 'Add New Family Member'}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase mapping tracking-wider">Name *</label>
                                <Input value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} className="mt-1 bg-white" placeholder="Full name" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Relation *</label>
                                <select
                                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white font-medium"
                                    value={memberForm.relation}
                                    onChange={e => setMemberForm({ ...memberForm, relation: e.target.value })}
                                >
                                    {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Date of Birth (Optional)</label>
                                <Input type="date" value={memberForm.dob || ""} onChange={e => setMemberForm({ ...memberForm, dob: e.target.value })} className="mt-1 bg-white" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Nakshatra (Optional)</label>
                                <select
                                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white font-medium text-gray-700"
                                    value={memberForm.nakshatra || ""}
                                    onChange={e => setMemberForm({ ...memberForm, nakshatra: e.target.value })}
                                >
                                    <option value="">Select Nakshatra</option>
                                    {NAKSHATRAS.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Rashi / Zodiac (Optional)</label>
                                <select
                                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white font-medium text-gray-700"
                                    value={memberForm.rashi || ""}
                                    onChange={e => setMemberForm({ ...memberForm, rashi: e.target.value })}
                                >
                                    <option value="">Select Rashi</option>
                                    {RASHIS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-amber-200/50">
                            <Button type="button" variant="outline" onClick={() => {
                                setShowMemberForm(false);
                                setEditingIndex(null);
                                setMemberForm({ name: "", relation: "Spouse", dob: "", nakshatra: "", rashi: "" });
                            }}>Cancel</Button>
                            <Button type="button" variant="primary" onClick={handleSaveMember}>
                                {editingIndex !== null ? 'Update Member' : 'Add Member'}
                            </Button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {familyMembers.map((m, idx) => (
                        <div key={idx} className="border border-gray-200 p-4 rounded-xl flex flex-col justify-between hover:border-amber-300 transition-colors bg-white shadow-sm hover:shadow-md">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-gray-800">{m.name}</h3>
                                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 pointer-events-none">{m.relation}</Badge>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    {m.dob && <p><span className="font-medium">DOB:</span> {new Date(m.dob).toLocaleDateString()}</p>}
                                    {m.nakshatra && <p><span className="font-medium">Nakshatra:</span> {m.nakshatra}</p>}
                                    {m.rashi && <p><span className="font-medium">Rashi:</span> {m.rashi}</p>}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-4 pt-3 border-t">
                                <button onClick={() => editMember(idx)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center transition-colors">
                                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                                </button>
                                <button onClick={() => removeMember(idx)} className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center transition-colors">
                                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}

                    {familyMembers.length === 0 && !showMemberForm && (
                        <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                            <p className="text-gray-500 font-medium mb-3">No family members added yet.</p>
                            <Button variant="outline" size="sm" onClick={() => setShowMemberForm(true)} className="bg-white">
                                + Add Family Member
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            {error && <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg mb-4 text-center">{error}</div>}
            {success && <div className="text-green-600 text-sm font-medium p-3 bg-green-50 rounded-lg mb-4 flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> {success}</div>}

            <div className="flex justify-between items-center border-t border-gray-200 pt-6 mt-4">
                <Link href="/dashboard/profile" className="text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors">
                    Cancel & Go Back
                </Link>
                <Button onClick={handleSaveAll} disabled={saveLoading} size="lg" className="min-w-[200px] shadow-lg shadow-amber-200/50 hover:shadow-amber-300 transition-shadow">
                    {saveLoading ? "Saving all..." : "Save Preferences"}
                </Button>
            </div>
        </div>
    );
}
