"use client";

import { useEffect, useState } from "react";
import { Button, Card, Badge, Toast } from "@hmarepanditji/ui";
import { Heart, Star, MapPin, Loader2, HeartOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PanditSummary {
    id: string;
    name: string;
    isVerified: boolean;
    panditProfile: {
        profilePhotoUrl: string | null;
        rating: number;
        totalReviews: number;
        location: string;
        specializations: string[];
        experienceYears: number;
        verificationStatus: string;
    } | null;
}

export default function FavoritesPage() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<{ pandit: PanditSummary }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFavorites = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/customers/me/favorites`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setFavorites(data.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const removeFavorite = async (panditId: string) => {
        if (!confirm("Remove from favorites?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/customers/me/favorites/${panditId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setFavorites(prev => prev.filter(f => f.pandit.id !== panditId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <HeartOff className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">आपने अभी तक कोई पंडित जी सेव नहीं किया है</h2>
                <p className="text-gray-500 mb-6">Explore our verified pandits and save your favorites.</p>
                <Link href="/search">
                    <Button variant="primary">Explore Pandits →</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Heart className="text-red-500 fill-current" /> My Favorites
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map(({ pandit }) => {
                    const profile = pandit.panditProfile;
                    if (!profile) return null;

                    return (
                        <Card key={pandit.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                            <div className="p-5 flex-1">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                                        {profile.profilePhotoUrl ? (
                                            <img src={profile.profilePhotoUrl} alt={pandit.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl">🙏</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold flex items-center gap-1">
                                            {pandit.name}
                                            {pandit.isVerified && <Badge variant="success" className="px-1.5 py-0 items-center justify-center h-4"><span className="text-[10px]">✓</span></Badge>}
                                        </h3>
                                        <div className="flex items-center text-sm text-amber-600 mt-1">
                                            <Star className="w-4 h-4 fill-amber-500 mr-1" />
                                            <span className="font-medium">{profile.rating.toFixed(1)}</span>
                                            <span className="text-gray-500 ml-1">({profile.totalReviews} reviews)</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {profile.location}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {profile.experienceYears} years experience
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {profile.specializations.slice(0, 3).map((spec: string) => (
                                        <span key={spec} className="bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-full">
                                            {spec}
                                        </span>
                                    ))}
                                    {profile.specializations.length > 3 && (
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                            +{profile.specializations.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="border-t p-4 flex gap-3 bg-gray-50">
                                <Button
                                    variant="outline"
                                    className="flex-1 text-sm bg-white"
                                    onClick={() => removeFavorite(pandit.id)}
                                >
                                    <Heart className="w-4 h-4 mr-2" /> Remove
                                </Button>
                                <Button
                                    variant="primary"
                                    className="flex-1 text-sm"
                                    onClick={() => router.push(`/pandit/${pandit.id}`)}
                                >
                                    Book Again →
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
