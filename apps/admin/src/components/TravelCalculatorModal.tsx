"use client";
import React, { useState } from "react";

interface TravelCalculatorModalProps {
    booking: any;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function TravelCalculatorModal({ booking, onClose, onSave }: TravelCalculatorModalProps) {
    const [cost, setCost] = useState<number>(0);
    const [returnCost, setReturnCost] = useState<number>(0);
    const [localCab, setLocalCab] = useState<number>(0);
    const [accommodation, setAccommodation] = useState<number>(0);
    const [notes, setNotes] = useState("");

    const totalCost = cost + returnCost + localCab + accommodation;

    const handleSave = () => {
        onSave({
            calculatedTravelCost: totalCost,
            travelNotes: notes,
            travelBreakdown: {
                outbound: cost,
                return: returnCost,
                localCab,
                accommodation
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl my-8 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Calculate Travel Cost</h2>
                        <p className="text-sm text-slate-500 font-medium">Booking {booking.bookingNumber}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">From City</label>
                            <input type="text" value={booking.pandit?.city || "Unknown"} disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">To City</label>
                            <input type="text" value={booking.venueCity} disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 font-medium" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Suggested Mode</label>
                        <input type="text" value={booking.travelMode || "Transport"} disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 font-medium" />
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-4 relative">
                        <div className="absolute -left-px top-5 bottom-5 w-1 bg-blue-500 rounded-r-lg"></div>
                        <h3 className="font-bold text-blue-900">Admin Cost Override</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Outbound Journey Cost (₹)</label>
                                <input
                                    type="number"
                                    value={cost === 0 ? "" : cost}
                                    onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                                    placeholder="e.g. 1500"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Return Journey Cost (₹)</label>
                                <input
                                    type="number"
                                    value={returnCost === 0 ? "" : returnCost}
                                    onChange={(e) => setReturnCost(parseInt(e.target.value) || 0)}
                                    placeholder="e.g. 1500"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Local Cab Cost</label>
                                    <input
                                        type="number"
                                        value={localCab === 0 ? "" : localCab}
                                        onChange={(e) => setLocalCab(parseInt(e.target.value) || 0)}
                                        placeholder="e.g. 500"
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Accommodation Cost</label>
                                    <input
                                        type="number"
                                        value={accommodation === 0 ? "" : accommodation}
                                        onChange={(e) => setAccommodation(parseInt(e.target.value) || 0)}
                                        placeholder="e.g. 2000"
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Internal Notes / PNRs</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="E.g. Shatabdi Express Waitlisted, will confirm tomorrow."
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 h-24 resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl shrink-0 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Calculated Cost</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">₹{totalCost.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95"
                        >
                            Save Calculation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
