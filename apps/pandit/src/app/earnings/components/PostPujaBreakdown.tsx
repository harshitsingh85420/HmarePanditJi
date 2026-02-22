"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { hi } from "date-fns/locale";
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, History, Info } from "lucide-react";
import TextToSpeechButton from "@/components/TextToSpeechButton";

interface PostPujaBreakdownProps {
    data: any;
}

export default function PostPujaBreakdown({ data }: PostPujaBreakdownProps) {
    const [feeExplainerOpen, setFeeExplainerOpen] = useState(false);

    const { booking, breakdown, payout } = data;

    const voiceText = `इस पूजा में आपने ₹${breakdown.totalPayout} कमाए। ${payout.status === 'COMPLETED' ? 'ये पैसे आपके खाते में भेजे जा चुके हैं।' : 'पूजा पूरी होने के 24 घंटे में ये पैसे आपके खाते में भेजे जाएंगे।'
        }`;

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 font-hindi">कमाई विवरण</h1>
                <TextToSpeechButton text={voiceText} />
            </div>

            {/* Booking Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="text-sm font-mono text-gray-500 mb-1">{booking.bookingNumber}</div>
                        <h2 className="text-xl font-bold text-gray-900">{booking.eventType}</h2>
                        <p className="text-gray-600 font-medium">{format(new Date(booking.eventDate), "do MMM yyyy", { locale: hi })}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-bold tracking-wide">COMPLETED</span>
                    </div>
                </div>
            </div>

            {/* Payout Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-amber-50 px-5 py-4 border-b border-amber-100 flex items-center gap-2">
                    <History className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-bold text-amber-900 font-hindi">आपकी कमाई (Pandit receives)</h3>
                </div>

                <div className="p-5 space-y-4 font-medium text-gray-700">
                    <div className="flex justify-between items-center">
                        <span>दक्षिणा</span>
                        <span>₹{breakdown.dakshina.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center text-red-600">
                        <span>(-) प्लेटफॉर्म शुल्क (15%)</span>
                        <span>- ₹{breakdown.platformFee.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t font-bold text-amber-700">
                        <span>आपकी शुद्ध दक्षिणा:</span>
                        <span>₹{breakdown.netDakshina.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="border-t my-4 border-dashed" />

                    {breakdown.samagriAmount > 0 && (
                        <div className="flex justify-between items-center">
                            <span>सामग्री पैकेज</span>
                            <span>₹{breakdown.samagriAmount.toLocaleString('en-IN')}</span>
                        </div>
                    )}

                    {breakdown.travelCostOutbound > 0 && (
                        <div className="flex justify-between items-center">
                            <span>यात्रा खर्च (जाने का)</span>
                            <span>₹{breakdown.travelCostOutbound.toLocaleString('en-IN')}</span>
                        </div>
                    )}

                    {breakdown.travelCostReturn > 0 && (
                        <div className="flex justify-between items-center">
                            <span>वापसी यात्रा</span>
                            <span>₹{breakdown.travelCostReturn.toLocaleString('en-IN')}</span>
                        </div>
                    )}

                    {breakdown.foodAllowanceAmount > 0 && (
                        <div className="flex justify-between items-center">
                            <span>खाना भत्ता</span>
                            <span>₹{breakdown.foodAllowanceAmount.toLocaleString('en-IN')}</span>
                        </div>
                    )}
                </div>

                <div className="bg-amber-50 px-5 py-4 border-t border-amber-200 flex justify-between items-center">
                    <span className="text-lg font-bold text-amber-900 font-hindi">कुल भुगतान:</span>
                    <span className="text-2xl font-bold text-amber-700">₹{breakdown.totalPayout.toLocaleString('en-IN')}</span>
                </div>
            </div>

            {/* Platform Fee Explainer */}
            <div className="bg-blue-50/50 rounded-lg border border-blue-100 overflow-hidden text-sm">
                <button
                    onClick={() => setFeeExplainerOpen(!feeExplainerOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between text-blue-800 font-medium hover:bg-blue-50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        <span>[?] प्लेटफॉर्म शुल्क क्या है?</span>
                    </div>
                    {feeExplainerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {feeExplainerOpen && (
                    <div className="px-4 pb-4 pt-1 text-blue-700 leading-relaxed font-hindi">
                        HmarePanditJi आपको नए ग्राहक ढूँढ़ता है, यात्रा की व्यवस्था करता है और भुगतान की गारंटी देता है। इसके बदले हम आपकी दक्षिणा का 15% सेवा शुल्क लेते हैं। भोजन और सामग्री पर कोई शुल्क नहीं लिया जाता।
                    </div>
                )}
            </div>

            {/* Payout Info Card */}
            <div className={`p-5 rounded-xl border shadow-sm ${payout.status === 'COMPLETED' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                <h3 className={`text-lg font-bold mb-3 font-hindi ${payout.status === 'COMPLETED' ? 'text-green-900' : 'text-orange-900'}`}>
                    भुगतान कब?
                </h3>

                <div className="flex flex-col gap-2">
                    {payout.status === 'COMPLETED' ? (
                        <>
                            <p className="text-green-800 font-medium flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                <span>₹{breakdown.totalPayout.toLocaleString('en-IN')} — {format(new Date(payout.completedDate), "do MMM", { locale: hi })} को {payout.bankAccountMasked} में भेजे गए</span>
                            </p>
                            {payout.transactionRef && (
                                <p className="text-xs text-green-700 ml-7">Ref: {payout.transactionRef}</p>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="text-orange-800 font-medium flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                <span>₹{breakdown.totalPayout.toLocaleString('en-IN')} — पूजा पूरी होने के 24 घंटे में भेजे जाएंगे</span>
                            </p>
                            <p className="text-xs text-orange-700 font-medium ml-7">
                                STATUS: {payout.status} (तय समय: {format(new Date(payout.expectedDate), "do MMM h:mm a", { locale: hi })})
                            </p>
                            <p className="text-sm text-orange-700 mt-2 ml-7 bg-orange-100 p-2 rounded inline-block font-hindi">
                                खाता: {payout.bankAccountMasked}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
