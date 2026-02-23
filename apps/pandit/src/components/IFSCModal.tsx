"use client";

import { useState } from "react";

/**
 * IFSCModal (Prompt 7, Section 4)
 * Opens when [?] icon is clicked next to IFSC Code field.
 * Explains what IFSC code is with example, in Hindi.
 * Saffron header, close button.
 */
export default function IFSCModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
                {/* Saffron header */}
                <div className="bg-gradient-to-r from-orange-400 to-amber-500 p-5 flex items-center justify-between">
                    <h3 className="text-white text-lg font-bold flex items-center gap-2">
                        <span className="text-2xl">🏦</span>
                        IFSC Code क्या होता है?
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        style={{ minHeight: "44px", minWidth: "44px" }}
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    <p className="text-gray-700 text-base leading-relaxed">
                        IFSC Code (<strong>Indian Financial System Code</strong>) एक 11-अक्षरों का code होता है
                        जो हर bank branch को uniquely identify करता है।
                    </p>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                        <p className="text-sm font-semibold text-amber-800">📝 Example:</p>
                        <div className="text-center">
                            <span className="font-mono text-2xl font-bold text-amber-700 tracking-wider">
                                SBIN0001234
                            </span>
                        </div>
                        <div className="text-xs text-amber-700 space-y-1">
                            <p>• पहले 4 अक्षर: <strong>Bank का नाम</strong> (SBIN = State Bank of India)</p>
                            <p>• 5वां अक्षर: हमेशा <strong>0</strong></p>
                            <p>• बाकी 6 अक्षर: <strong>Branch code</strong></p>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                        <p className="text-sm font-semibold text-blue-800">🔍 IFSC Code कहां मिलेगा?</p>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• आपकी <strong>Passbook</strong> के पहले page पर</li>
                            <li>• <strong>Cheque book</strong> पर (नीचे लिखा होता है)</li>
                            <li>• <strong>Bank website</strong> पर branch search करके</li>
                            <li>• <strong>RBI website</strong>: bankifsccode.com</li>
                        </ul>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full bg-amber-500 text-white py-3 rounded-xl font-semibold hover:bg-amber-600 transition-colors"
                        style={{ minHeight: "44px" }}
                    >
                        समझ गया 👍
                    </button>
                </div>
            </div>
        </div>
    );
}
