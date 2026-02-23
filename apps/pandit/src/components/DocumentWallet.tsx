"use client";

/**
 * DocumentWallet (Prompt 11, Section 5)
 * Title "📁 दस्तावेज़ और टिकट"
 * Shows list of downloadable documents (tickets, hotel, cab, food receipt, booking summary).
 */

interface TravelDocument {
    id: string;
    name: string;
    type: "TICKET" | "HOTEL" | "CAB" | "FOOD_RECEIPT" | "BOOKING_SUMMARY";
    url: string;
    uploadedAt?: string;
}

const DOC_META: Record<string, { icon: string; color: string }> = {
    TICKET: { icon: "confirmation_number", color: "text-blue-600 bg-blue-50" },
    HOTEL: { icon: "hotel", color: "text-purple-600 bg-purple-50" },
    CAB: { icon: "local_taxi", color: "text-yellow-600 bg-yellow-50" },
    FOOD_RECEIPT: { icon: "receipt", color: "text-green-600 bg-green-50" },
    BOOKING_SUMMARY: { icon: "description", color: "text-amber-600 bg-amber-50" },
};

export default function DocumentWallet({
    documents,
}: {
    documents: TravelDocument[];
}) {
    if (!documents || documents.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <span className="material-symbols-outlined text-3xl text-gray-300">
                    folder_off
                </span>
                <p className="mt-2 text-sm text-gray-400">कोई दस्तावेज़ अभी उपलब्ध नहीं है।</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="text-xl">📁</span>
                दस्तावेज़ और टिकट
            </h3>

            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {documents.map((doc) => {
                    const meta = DOC_META[doc.type] || DOC_META.BOOKING_SUMMARY;
                    return (
                        <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${meta.color}`}>
                                    <span className="material-symbols-outlined text-lg">
                                        {meta.icon}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 text-sm">{doc.name}</p>
                                    {doc.uploadedAt && (
                                        <p className="text-xs text-gray-400">
                                            {new Date(doc.uploadedAt).toLocaleDateString("hi-IN")}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                    style={{ minHeight: "44px", minWidth: "44px" }}
                                >
                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                    देखें
                                </a>
                                <a
                                    href={doc.url}
                                    download
                                    className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
                                    style={{ minHeight: "44px", minWidth: "44px" }}
                                >
                                    <span className="material-symbols-outlined text-sm">download</span>
                                    डाउनलोड
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
