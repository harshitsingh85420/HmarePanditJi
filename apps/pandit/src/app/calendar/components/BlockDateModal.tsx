"use client";

import { useState } from "react";
import { X, Calendar as CalendarIcon, AlertTriangle } from "lucide-react";
import { Button } from "@hmarepanditji/ui";
import { format, differenceInDays } from "date-fns";

interface BlockDateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    prefillDate?: string;
}

export default function BlockDateModal({ isOpen, onClose, onSuccess, prefillDate }: BlockDateModalProps) {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const [type, setType] = useState<"SINGLE" | "RANGE">("SINGLE");
    const [startDate, setStartDate] = useState(prefillDate || format(new Date(), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(prefillDate || format(new Date(), "yyyy-MM-dd"));
    const [reason, setReason] = useState("व्यक्तिगत कारण");

    const [error, setError] = useState("");
    const [conflicts, setConflicts] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setError("");
        setConflicts([]);
        setIsSubmitting(true);

        try {
            const res = await fetch(`${API_URL}/api/v1/pandits/blackout-dates`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    startDate,
                    endDate: type === "SINGLE" ? startDate : endDate,
                    reason,
                    type
                })
            });
            const data = await res.json();

            if (data.success) {
                onSuccess();
                onClose();
            } else {
                if (data.error === "BOOKING_CONFLICT") {
                    setConflicts(data.conflictingDates);
                    setError("आपकी पहले से बुकिंग है");
                } else {
                    setError(data.message || "Failed to block dates");
                }
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const daysBlocked = type === "RANGE" && startDate && endDate ? differenceInDays(new Date(endDate), new Date(startDate)) + 1 : 1;

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
                <div className="flex justify-between items-center p-5 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">छुट्टी जोड़ें</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">छुट्टी का प्रकार</label>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setType("SINGLE")}
                                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${type === "SINGLE" ? "bg-white text-amber-700 shadow-sm" : "text-slate-600 hover:bg-slate-200"}`}
                            >
                                एक दिन
                            </button>
                            <button
                                type="button"
                                onClick={() => setType("RANGE")}
                                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${type === "RANGE" ? "bg-white text-amber-700 shadow-sm" : "text-slate-600 hover:bg-slate-200"}`}
                            >
                                कई दिन
                            </button>
                            <div
                                className="flex-1 py-2 px-3 text-sm font-medium rounded-md text-slate-400 cursor-not-allowed opacity-50 relative group text-center"
                            >
                                साप्ताहिक
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    Coming soon
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className={type === "SINGLE" ? "col-span-2" : "col-span-1"}>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {type === "SINGLE" ? "तारीख" : "प्रारंभ तिथि"}
                            </label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {type === "RANGE" && (
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">अंतिम तिथि</label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="date"
                                        required
                                        min={startDate}
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {type === "RANGE" && daysBlocked > 0 && (
                        <div className="text-sm text-indigo-700 bg-indigo-50 p-3 rounded-lg flex items-start">
                            <span className="text-xl mr-2 leading-none">ℹ️</span>
                            {daysBlocked} दिन ब्लॉक होंगे।
                            {daysBlocked > 30 && (
                                <span className="block mt-1 text-red-600 font-medium">
                                    क्या आप इतने लंबे समय के लिए छुट्टी लेना चाहते हैं? आप इस दौरान कोई बुकिंग नहीं ले पाएंगे।
                                </span>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">कारण</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                        >
                            <option value="शादी / पारिवारिक कार्यक्रम">शादी / पारिवारिक कार्यक्रम</option>
                            <option value="बीमारी">बीमारी</option>
                            <option value="तीर्थ यात्रा">तीर्थ यात्रा</option>
                            <option value="व्यक्तिगत कारण">व्यक्तिगत कारण</option>
                            <option value="अन्य">अन्य</option>
                        </select>
                    </div>

                    {conflicts.length > 0 && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-start">
                            <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                            <div>
                                <strong>⚠️ {conflicts[0]}</strong> पर आपकी पहले से बुकिंग है — इसे ब्लॉक नहीं किया जा सकता।
                            </div>
                        </div>
                    )}

                    {error && conflicts.length === 0 && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-white hover:bg-slate-50 border-slate-200 text-slate-700">
                            रद्द करें
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                            disabled={isSubmitting || conflicts.length > 0}
                        >
                            {isSubmitting ? "कृपया प्रतीक्षा करें..." : "छुट्टी जोड़ें ✓"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
