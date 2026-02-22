"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format, differenceInMinutes, differenceInHours } from "date-fns";
import { hi } from "date-fns/locale";

type LiveBookingData = any;

export default function LiveTrackingPage() {
    const params = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<LiveBookingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [eta, setEta] = useState("");
    const [showingCompletion, setShowingCompletion] = useState(false);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        if (params.bookingId) loadBooking(params.bookingId as string);
    }, [params.bookingId]);

    // Timer for puja in progress
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (booking?.status === 'PUJA_IN_PROGRESS') {
            interval = setInterval(() => setTimer(t => t + 1), 60000); // update every minute
        }
        return () => clearInterval(interval);
    }, [booking?.status]);

    const loadBooking = async (id: string) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

            const res = await fetch(`/api/pandit/bookings/${id}`, { headers });
            if (res.ok) {
                const json = await res.json();
                setBooking(json.data);
            } else {
                router.push(`/bookings/${id}`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: string) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/pandit/bookings/${booking?.id}/${action}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(action === "start-journey" ? { eta } : {})
            });
            if (res.ok) {
                if (action === "complete") {
                    setShowingCompletion(true);
                } else {
                    loadBooking(booking!.id);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#1a1a2e]">
                <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!booking) return <div className="p-4 text-center text-white bg-[#1a1a2e] h-screen">बुकिंग नहीं मिली</div>;

    const customerName = booking.customer?.name?.split(" ")[0] || "Customer";

    return (
        <div className="bg-[#1a1a2e] min-h-screen text-amber-500 font-sans flex flex-col relative">

            {/* Header Strip */}
            <div className="bg-[#11111f] p-4 flex flex-col items-center justify-center border-b border-amber-900/30">
                <div className="text-gray-300 text-lg mb-1">{booking.eventType} — {customerName} जी के यहाँ</div>
                <div className="text-amber-400 font-bold text-xl">{format(new Date(booking.eventDate), "d MMM, h:mm a")}</div>
                <Link href={`/bookings/${booking.id}`} className="absolute top-4 left-4 text-gray-400 text-2xl px-2">✕</Link>
            </div>

            {/* Central Content area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-lg mx-auto">
                <div className="w-full h-full flex flex-col justify-center items-center text-center space-y-8 mt-[-10vh]">

                    {/* TRAVEL_BOOKED */}
                    {booking.status === "TRAVEL_BOOKED" && (
                        <>
                            <div className="text-6xl mb-4">🗺️</div>
                            <h2 className="text-3xl text-amber-50 font-bold">यात्रा के लिए तैयार हों</h2>
                            <p className="text-xl text-gray-400 mb-8">अपने गंतव्य के लिए निकलें।</p>
                            <button
                                onClick={() => handleAction("start-journey")} className="w-full bg-amber-500 hover:bg-amber-400 text-[#1a1a2e] font-bold text-2xl h-20 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform active:scale-95"
                            >
                                🚀 यात्रा शुरू कर दी
                            </button>
                        </>
                    )}

                    {/* PANDIT_EN_ROUTE */}
                    {booking.status === "PANDIT_EN_ROUTE" && (
                        <>
                            <div className="text-7xl mb-4 animate-pulse">🚂</div>
                            <h2 className="text-3xl text-amber-50 font-bold mb-2">रास्ते में हैं...</h2>
                            <p className="text-lg text-amber-200/70 mb-8">ग्राहक को आपकी लाइव लोकेशन मिल रही है</p>

                            <div className="w-full space-y-2 mb-10 text-left">
                                <label className="text-amber-200 ml-2">अनुमानित पहुँचने का समय (ETA)</label>
                                <div className="flex gap-2">
                                    <input type="time" value={eta} onChange={(e) => setEta(e.target.value)} className="flex-1 bg-[#11111f] border border-amber-900/50 rounded-xl px-4 text-xl text-white outline-none focus:border-amber-500 h-16" />
                                </div>
                            </div>

                            <button onClick={() => handleAction("arrived")} className="w-full bg-amber-500 hover:bg-amber-400 text-[#1a1a2e] font-bold text-2xl h-20 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform active:scale-95">
                                📍 मैं पहुँच गया
                            </button>
                        </>
                    )}

                    {/* PANDIT_ARRIVED */}
                    {booking.status === "PANDIT_ARRIVED" && (
                        <>
                            <div className="text-7xl mb-4">🙏</div>
                            <h2 className="text-3xl text-amber-50 font-bold">पहुँच गए</h2>
                            <p className="text-xl text-amber-200/70 mb-2">पूजा शुरू करें</p>
                            <p className="text-lg text-gray-400 mb-10">आप {format(new Date(), "h:mm a")} पर पहुँचे</p>

                            <button onClick={() => handleAction("start-puja")} className="w-full bg-amber-500 hover:bg-amber-400 text-[#1a1a2e] font-bold text-3xl h-24 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform active:scale-95">
                                🕉️ पूजा शुरू करें
                            </button>
                        </>
                    )}

                    {/* PUJA_IN_PROGRESS */}
                    {booking.status === "PUJA_IN_PROGRESS" && (
                        <>
                            <div className="text-7xl mb-4 relative">
                                🔥<span className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full mix-blend-screen animate-pulse"></span>
                            </div>
                            <h2 className="text-4xl text-amber-50 font-bold">पूजा जारी है</h2>
                            <p className="text-2xl text-amber-200/70 font-mono tracking-widest">{Math.floor(timer / 60)}h {timer % 60}m</p>
                            <p className="text-lg text-gray-400 mt-10 mb-4">जब पूजा खत्म हो जाए तो नीचे दबाएं:</p>

                            <button onClick={() => handleAction("complete")} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-3xl h-24 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all transform active:scale-95">
                                ✅ पूजा पूरी हुई
                            </button>
                        </>
                    )}

                    {booking.status === "COMPLETED" && (
                        <>
                            <div className="text-7xl mb-4">✅</div>
                            <h2 className="text-3xl text-amber-50 font-bold">पूजा पूरी हुई!</h2>
                            <button onClick={() => router.push(`/bookings/${booking.id}`)} className="w-full mt-10 bg-gray-800 hover:bg-gray-700 text-white font-bold text-2xl h-20 rounded-2xl transition-all transform active:scale-95 border border-gray-600">
                                वापस जाएँ
                            </button>
                        </>
                    )}

                </div>
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-amber-900/30 flex justify-between bg-[#11111f] pb-6">
                <a href="tel:+911800123456" className="text-amber-500 text-lg flex items-center gap-2 px-4 py-2 hover:bg-amber-900/20 rounded-lg">
                    <span>📞</span> मदद चाहिए?
                </a>
                <button className="text-red-400 text-lg flex items-center gap-2 px-4 py-2 hover:bg-red-900/20 rounded-lg">
                    <span>⚠️</span> समस्या रिपोर्ट
                </button>
            </div>

            {/* Completion Modal */}
            {showingCompletion && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
                    <div className="bg-[#1a1a2e] border-2 border-amber-500 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                        <div className="text-6xl mb-4">🙏</div>
                        <h2 className="text-3xl text-white font-bold mb-4">बधाई हो!</h2>
                        <p className="text-amber-200 text-lg mb-2">पूजा सफलतापूर्वक पूरी हुई।</p>
                        <p className="text-gray-400 mb-6">ग्राहक को रेटिंग के लिए SMS भेज दिया गया है। आपका भुगतान ₹{booking.panditPayout} 24 घंटे में होगा।</p>

                        <button onClick={() => router.push(`/bookings/${booking.id}`)} className="w-full bg-amber-500 text-[#1a1a2e] font-bold text-xl py-4 rounded-xl">
                            बंद करें
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
