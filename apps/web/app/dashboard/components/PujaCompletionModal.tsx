"use client";
import { useEffect, useState } from "react";
import { X, Star, Share2, FileText } from "lucide-react";

export function PujaCompletionModal({ booking, onClose }: { booking: any, onClose: () => void }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Check if we already showed it
        const key = `hpj_completion_seen_${booking.id}`;
        if (localStorage.getItem(key)) {
            onClose(); // auto close if already seen
            return;
        }

        setTimeout(() => setShow(true), 100);
        localStorage.setItem(key, "true");
    }, [booking.id, onClose]);

    const blessings = [
        "शुभ हो! भगवान आपकी सभी मनोकामनाएं पूरी करें।",
        "ॐ सर्वे भवन्तु सुखिनः। सभी सुखी हों।",
        "आपके परिवार पर सदा भगवान की कृपा बनी रहे।"
    ];
    const randomBlessing = blessings[Math.floor(Math.random() * blessings.length)];

    if (!show) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500 opacity-100`}>
            <div className={`bg-white rounded-[2rem] p-8 max-w-sm w-full mx-4 shadow-2xl relative transform transition-all duration-500 delay-100 scale-100 translate-y-0 text-center overflow-hidden`}>
                {/* Background gradients */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-300 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-300 rounded-full blur-3xl opacity-50"></div>

                <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 z-10 bg-white/50 rounded-full p-1.5 backdrop-blur-md transition-colors">
                    <X size={20} />
                </button>

                <div className="text-6xl mb-4 animate-[bounce_2s_infinite] relative z-10 drop-shadow-md">🙏</div>
                <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-2 relative z-10">
                    पूजा संपन्न हुई!
                </h2>
                <p className="text-gray-500 font-bold mb-6 relative z-10">Puja Completed Successfully!</p>

                <div className="bg-gradient-to-br from-orange-50 to-[#fff8f0] border border-orange-200/50 p-5 rounded-2xl mb-8 relative z-10 text-orange-800 font-medium shadow-inner shadow-orange-100/50">
                    &quot;{randomBlessing}&quot;
                </div>

                {booking.pandit && (
                    <div className="flex items-center justify-center gap-4 mb-8 relative z-10 bg-gray-50/80 backdrop-blur-sm p-3 rounded-2xl border border-gray-100 border-b-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full overflow-hidden border-[3px] border-white shadow-sm flex items-center justify-center text-lg font-bold text-gray-500">
                            {booking.pandit.name?.charAt(0) || "P"}
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-[11px] text-gray-400 uppercase tracking-widest leading-tight">Conducted by</div>
                            <div className="font-bold text-gray-900">Pt. {booking.pandit.name || "Unknown"}</div>
                        </div>
                    </div>
                )}

                <div className="space-y-3 relative z-10">
                    <a href={`/dashboard/bookings/${booking.id}/review`} className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:-translate-y-0.5 transition-all text-[15px]">
                        <Star size={18} className="fill-white" /> Rate Your Experience
                    </a>
                    <button onClick={() => onClose()} className="flex items-center justify-center gap-2 w-full bg-white text-orange-600 border border-orange-200 font-bold py-3.5 px-4 rounded-xl hover:bg-orange-50 transition-colors">
                        <FileText size={18} /> View Booking Details
                    </button>
                </div>
            </div>
        </div>
    );
}
