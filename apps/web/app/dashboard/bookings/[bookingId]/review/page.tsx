"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Input, Card, Badge, Toast } from "@hmarepanditji/ui";
import { Star } from "lucide-react";

interface PanditSummary {
    id: string;
    name: string;
    photoUrl?: string;
}

export default function ReviewSubmissionPage() {
    const router = useRouter();
    const params = useParams();
    const bookingId = params.bookingId as string;

    const [overall, setOverall] = useState(0);
    const [knowledge, setKnowledge] = useState(0);
    const [punctuality, setPunctuality] = useState(0);
    const [communication, setCommunication] = useState(0);
    const [valueForMoney, setValueForMoney] = useState(0);

    const [comment, setComment] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [photoUrls, setPhotoUrls] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [pandit, setPandit] = useState<PanditSummary | null>(null);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/bookings/${bookingId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error("Could not load booking");
                const data = await res.json();
                // Assume data.data.pandit is available
                if (data.data && data.data.pandit) {
                    setPandit({
                        id: data.data.pandit.id,
                        name: data.data.pandit.name || "Pandit Ji",
                        photoUrl: data.data.pandit.panditProfile?.profilePhotoUrl
                    });
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchBookingDetails();
    }, [bookingId]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (overall === 0) {
            setError("Please select an overall rating");
            return;
        }
        if (comment.length > 0 && comment.length < 20) {
            setError("Comment must be at least 20 characters if provided");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const payload = {
                bookingId,
                ratings: {
                    overall,
                    knowledge: knowledge || undefined,
                    punctuality: punctuality || undefined,
                    communication: communication || undefined,
                    valueForMoney: valueForMoney || undefined,
                },
                comment: comment || undefined,
                photoUrls,
                isAnonymous,
            };

            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to submit review");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push(`/dashboard/bookings/${bookingId}`);
            }, 3000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="bg-green-100 text-green-700 p-4 rounded-full mb-4">
                    <Star className="w-12 h-12 fill-current" />
                </div>
                <h1 className="text-3xl font-bold mb-2">🙏 Thank you for your review!</h1>
                <p className="text-gray-600">Redirecting you back to booking details...</p>
            </div>
        );
    }

    const getStarLabel = (rating: number) => {
        switch (rating) {
            case 1: return "Poor";
            case 2: return "Fair";
            case 3: return "Good";
            case 4: return "Very Good";
            case 5: return "Excellent";
            default: return "";
        }
    };

    const InteractiveStars = ({ label, value, onChange, required = false }: any) => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <span className="font-medium text-gray-700 mb-2 sm:mb-0">
                {label} {required && <span className="text-red-500">*</span>}
            </span>
            <div className="flex items-center gap-4">
                <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => onChange(s)}
                            className="p-1 focus:outline-none transition-transform hover:scale-110"
                        >
                            <Star
                                className={`w-8 h-8 ${s <= value ? "fill-amber-400 text-amber-400" : "text-gray-300"
                                    }`}
                            />
                        </button>
                    ))}
                </div>
                <span className="w-20 text-sm md:text-base font-medium text-amber-600">
                    {value > 0 && getStarLabel(value)}
                </span>
            </div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">
                    ⭐ Rate Your Experience
                </h1>
                <p className="text-gray-600 mt-2">
                    Your feedback helps other customers and motivates Pandit Ji
                </p>
            </div>

            <Card className="p-6">
                {pandit && (
                    <div className="flex items-center gap-4 mb-6 p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-orange-200">
                            {pandit.photoUrl ? (
                                <img src={pandit.photoUrl} alt={pandit.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl">🙏</span>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{pandit.name}</h3>
                            <p className="text-sm text-gray-600">Booking {bookingId}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <InteractiveStars label="⭐ Overall Experience" value={overall} onChange={setOverall} required />
                        <InteractiveStars label="⭐ Knowledge & Expertise" value={knowledge} onChange={setKnowledge} />
                        <InteractiveStars label="⭐ Punctuality" value={punctuality} onChange={setPunctuality} />
                        <InteractiveStars label="⭐ Communication" value={communication} onChange={setCommunication} />
                        <InteractiveStars label="⭐ Value for Money" value={valueForMoney} onChange={setValueForMoney} />
                    </div>

                    <div className="space-y-2">
                        <label className="font-semibold block">Share your experience in detail...</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            placeholder="How was the puja? Was Pandit Ji helpful?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value.slice(0, 500))}
                        ></textarea>
                        <div className="flex justify-end text-xs text-gray-500">
                            {comment.length}/500 {comment.length > 0 && comment.length < 20 && <span className="text-red-500 ml-2">(Min 20 chars)</span>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="font-semibold block">Add photos from the puja</label>
                        <p className="text-xs text-gray-500">Only JPG/PNG up to 5MB.</p>
                        <input
                            type="file"
                            multiple
                            accept="image/png, image/jpeg"
                            onChange={(e) => {
                                // In a real app we would upload and get URLs.
                                // Simulating upload here.
                                const files = e.target.files;
                                if (files) {
                                    setPhotoUrls(Array.from(files).map(f => URL.createObjectURL(f)));
                                }
                            }}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                        />
                        {photoUrls.length > 0 && (
                            <div className="flex gap-2 mt-4">
                                {photoUrls.map((url, i) => (
                                    <img key={i} src={url} alt="upload preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mt-4 cursor-pointer" onClick={() => setIsAnonymous(!isAnonymous)}>
                        <input
                            type="checkbox"
                            className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                        />
                        <label className="text-sm font-medium text-gray-700 cursor-pointer">Submit anonymously</label>
                    </div>

                    {error && <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg">{error}</div>}

                    <Button type="submit" disabled={isLoading} variant="primary" className="w-full py-4 text-lg mt-6 shadow-lg shadow-amber-200">
                        {isLoading ? "Submitting..." : "🙏 Submit Review"}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
