"use client";
import React, { useEffect, useState } from "react";
import TravelCalculatorModal from "../../components/TravelCalculatorModal";
import { format, differenceInHours } from "date-fns";
import Link from "next/link";

export default function TravelDeskPage() {
    const [activeTab, setActiveTab] = useState("pending");
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [calculatorModal, setCalculatorModal] = useState<{ isOpen: boolean; bookingId: string | null; bookingData?: any }>({ isOpen: false, bookingId: null });
    const [markBookedModal, setMarkBookedModal] = useState<{ isOpen: boolean; bookingId: string | null; bookingData?: any }>({ isOpen: false, bookingId: null });

    const [bookedForm, setBookedForm] = useState({
        pnr: &quot;&quot;, carrier: &quot;&quot;, actualCost: &quot;&quot;, notes: &quot;&quot;
    });

    const fetchQueue = () => {
        setLoading(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL || &apos;http://localhost:3001/api/v1&apos;}/admin/travel-queue?tab=${activeTab}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem(&quot;adminToken&quot;) || &quot;&quot;}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBookings(data.data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchQueue();
    }, [activeTab]);

    const handleCalculateSave = async (data: any) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || &apos;http://localhost:3001/api/v1&apos;}/admin/bookings/${calculatorModal.bookingId}/travel-calculate`, {
                method: &quot;PATCH&quot;,
                headers: {
                    &quot;Content-Type&quot;: &quot;application/json&quot;,
                    Authorization: `Bearer ${localStorage.getItem(&quot;adminToken&quot;) || &quot;&quot;}`
                },
                body: JSON.stringify(data)
            });
            setCalculatorModal({ isOpen: false, bookingId: null });
            fetchQueue();
        } catch (e) {
            console.error(e);
        }
    };

    const handleMarkBooked = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || &apos;http://localhost:3001/api/v1&apos;}/admin/bookings/${markBookedModal.bookingId}/travel-booked`, {
                method: &quot;PATCH&quot;,
                headers: {
                    &quot;Content-Type&quot;: &quot;application/json&quot;,
                    Authorization: `Bearer ${localStorage.getItem(&quot;adminToken&quot;) || &quot;&quot;}`
                },
                body: JSON.stringify({
                    travelBookingDetails: { reference: bookedForm.pnr, carrier: bookedForm.carrier, notes: bookedForm.notes },
                    actualTravelCost: parseInt(bookedForm.actualCost) || (markBookedModal.bookingData?.calculatedTravelCost || 0)
                })
            });
            setMarkBookedModal({ isOpen: false, bookingId: null });
            setBookedForm({ pnr: &quot;&quot;, carrier: &quot;&quot;, actualCost: &quot;&quot;, notes: &quot;&quot; });
            fetchQueue();
        } catch (e) {
            console.error(e);
        }
    };

    const copyDetails = (b: any) => {
        const text = `Booking: ${b.bookingNumber}
Pandit: ${b.pandit?.name} (Ph: ${b.pandit?.phone})
From: ${b.pandit?.panditProfile?.location} → To: ${b.venueCity}
Event Date: ${format(new Date(b.eventDate), &apos;dd MMM yyyy&apos;)}
Mode: ${b.travelMode || &quot;Transport&quot;}`;
        navigator.clipboard.writeText(text);
        alert(&quot;Copied to clipboard!&quot;);
    };

    const tabs = [
        { id: &quot;pending&quot;, label: &quot;Needs Travel&quot;, icon: &quot;🔴&quot;, desc: &quot;Urgent&quot; },
        { id: &quot;calculating&quot;, label: &quot;In Progress&quot;, icon: &quot;🟡&quot;, desc: &quot;Costing&quot; },
        { id: &quot;booked&quot;, label: &quot;Booked&quot;, icon: &quot;✅&quot;, desc: &quot;Done&quot; },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6 flex flex-col h-[calc(100vh-64px)]">

            {/* Header */}
            <div className="flex items-end justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-800 mb-2">Travel Operations</h1>
                    <p className="text-slate-500 font-medium">Manage and book manual travel arrangements for pandit ji.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl inline-flex shrink-0">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === t.id
                            ? &quot;bg-white text-slate-900 shadow-sm&quot;
                            : &quot;text-slate-500 hover:text-slate-700 hover:bg-slate-200/50&quot;
                            }`}
                    >
                        <span>{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Queue Area */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-2 pb-10">
                {loading ? (
                    <div className="text-center py-12 text-slate-500 font-medium">Loading queue...</div>
                ) : bookings.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center shadow-sm">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">check_circle</span>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Queue is empty</h3>
                        <p className="text-slate-500">No bookings currently in this stage.</p>
                    </div>
                ) : (
                    bookings.map(b => {
                        const hrsToEvent = differenceInHours(new Date(b.eventDate), new Date());
                        let urgTheme = &quot;bg-white border-slate-200&quot;;
                        let urgBadge = null;

                        if (activeTab === &quot;pending&quot; && hrsToEvent < 48) {
                            urgTheme = hrsToEvent < 24 ? "border-red-300 bg-red-50/30 ring-1 ring-red-100" : "border-amber-300 bg-amber-50/30";
                            urgBadge = hrsToEvent < 24 ? (
                                <div className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-t-xl text-center w-full absolute top-0 inset-x-0">🚨 Event in {hrsToEvent} hours!</div>
                            ) : (
                                <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-t-xl text-center w-full absolute top-0 inset-x-0">⚠️ Event Tomorrow</div>
                            );
                        }

                        return (
                            <div key={b.id} className={`relative rounded-2xl border shadow-sm p-6 overflow-hidden transition-shadow hover:shadow-md flex flex-col md:flex-row gap-6 ${urgTheme}`}>
                                {urgBadge}
                                <div className={`flex items-start md:items-center justify-between w-full mt-4 md:mt-0`}>

                                    {/* LEFT */}
                                    <div className="flex-1 min-w-0 pr-6">
                                        <Link href={`/bookings/${b.id}`} className="text-blue-600 font-black text-lg hover:underline decoration-2 underline-offset-4 tracking-tight">
                                            {b.bookingNumber}
                                        </Link>
                                        <p className="text-slate-800 font-bold mt-1.5 flex items-center gap-2">
                                            {b.eventType} <span className="text-slate-300">•</span> {format(new Date(b.eventDate), &apos;dd MMM yyyy, p&apos;)}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                                                <p className="text-sm font-bold text-slate-700 truncate">{b.customer?.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{b.venueCity}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pandit</p>
                                                <p className="text-sm font-bold text-slate-700 truncate">{b.pandit?.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{b.pandit?.panditProfile?.location || &quot;Unknown&quot;} <span className="text-blue-500 font-semibold cursor-pointer ml-1">📱 {b.pandit?.phone}</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* MIDDLE */}
                                    <div className="flex-1 min-w-0 px-6 border-l border-r border-slate-100 hidden lg:block h-full">
                                        <div className="text-center mb-6">
                                            <div className="flex items-center justify-center gap-3">
                                                <span className="font-bold text-slate-700">{b.pandit?.panditProfile?.location}</span>
                                                <span className="material-symbols-outlined text-blue-400 text-xl font-light">east</span>
                                                <span className="font-bold text-slate-700">{b.venueCity}</span>
                                            </div>
                                            <p className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mt-2">
                                                ~{Math.round(b.travelDistanceKm || 0)} km
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 font-medium space-y-2 border border-slate-100">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 font-bold">MODE</span>
                                                <span className="font-bold text-slate-800">{b.travelMode || &quot;Transport&quot;}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 font-bold">EST. COST</span>
                                                <span className="font-bold text-slate-800">₹{b.calculatedTravelCost || &quot;---&quot;}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT Actions */}
                                    <div className="w-full md:w-56 flex flex-col gap-3 pl-0 md:pl-6 mt-6 md:mt-0 shrink-0">
                                        {activeTab !== &quot;booked&quot; && (
                                            <button
                                                onClick={() => setCalculatorModal({ isOpen: true, bookingId: b.id, bookingData: b })}
                                                className="w-full bg-white border-2 border-slate-200 hover:border-blue-500 hover:text-blue-700 text-slate-700 font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all focus:ring-4 focus:ring-blue-100 active:scale-95"
                                            >
                                                {b.calculatedTravelCost ? &quot;Edit Calculator&quot; : &quot;🧮 Calculate&quot;}
                                            </button>
                                        )}

                                        <button
                                            onClick={() => copyDetails(b)}
                                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl text-sm transition-colors"
                                        >
                                            📋 Copy Details
                                        </button>

                                        {activeTab !== &quot;booked&quot; && (
                                            <button
                                                onClick={() => {
                                                    setBookedForm({ ...bookedForm, actualCost: String(b.calculatedTravelCost || &quot;&quot;) });
                                                    setMarkBookedModal({ isOpen: true, bookingId: b.id, bookingData: b });
                                                }}
                                                className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-3 px-4 rounded-xl shadow-md shadow-green-500/20 transition-all active:scale-95 mt-2 flex items-center justify-center gap-2 group"
                                            >
                                                ✅ Mark Booked
                                                <span className="material-symbols-outlined text-sm opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
                                            </button>
                                        )}

                                        {activeTab === &quot;booked&quot; && (
                                            <div className="bg-green-50 border border-green-200 p-3 rounded-xl text-center">
                                                <p className="text-xs font-black text-green-600 uppercase tracking-wider mb-1">Actual Cost</p>
                                                <p className="text-2xl tracking-tight font-black text-green-700">₹{b.travelCost}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modals */}
            {calculatorModal.isOpen && (
                <TravelCalculatorModal
                    booking={calculatorModal.bookingData}
                    onClose={() => setCalculatorModal({ isOpen: false, bookingId: null })}
                    onSave={handleCalculateSave}
                />
            )}

            {markBookedModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 relative">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                            Confirm Booking
                        </h2>
                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Booking PNR / Ref</label>
                                <input type="text" value={bookedForm.pnr} onChange={e => setBookedForm({ ...bookedForm, pnr: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Carrier (Train/Flight)</label>
                                <input type="text" value={bookedForm.carrier} onChange={e => setBookedForm({ ...bookedForm, carrier: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-black tracking-tight text-slate-700 mb-1.5">Actual Total Cost Spent (₹)</label>
                                <input type="number" value={bookedForm.actualCost} onChange={e => setBookedForm({ ...bookedForm, actualCost: e.target.value })} className="w-full bg-white border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl px-4 py-3 font-black text-xl text-green-700 transition-all" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setMarkBookedModal({ isOpen: false, bookingId: null })} className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                            <button onClick={handleMarkBooked} className="flex-[2] bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-xl shadow-md flex items-center justify-center gap-2">✅ Confirm</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
