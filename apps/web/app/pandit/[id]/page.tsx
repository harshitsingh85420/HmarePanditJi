import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { TravelOptionsTab } from "./TravelOptionsTab";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { ProfileTabs } from "./profile-tabs";
import { ServicesTab } from "./ServicesTab";
import { BookingCTA } from "./BookingCTA";

export const revalidate = 60; // Revalidate every 60 seconds

async function getPanditById(id: string) {
    const res = await fetch(`http://localhost:3001/api/v1/pandits/${id}`, { next: { tags: [`pandit-${id}`] } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const pandit = await getPanditById(params.id);
    if (!pandit) return { title: "Pandit Not Found | HmarePanditJi" };
    const shortBio = pandit.bio?.substring(0, 150) || `Book ${pandit.user.name} for your next puja on HmarePanditJi.`;
    return {
        title: `${pandit.user.name} — Verified Pandit | HmarePanditJi`,
        description: shortBio,
    };
}

export default async function PanditProfilePage({ params }: { params: { id: string } }) {
    const pandit = await getPanditById(params.id);

    if (!pandit || pandit.verificationStatus !== "VERIFIED") {
        notFound();
    }

    const {
        user,
        location,
        experienceYears,
        languages,
        specializations,
        rating,
        totalReviews,
        completedBookings,
        reviewSummary,
        deviceModel,
        deviceOs,
        isOnline,
        pujaServices,
        samagriPackages,
        bio,
        certificateUrls,
        travelPreferences,
        maxTravelDistance,
    } = pandit;

    // Render hero banner
    const travelBadge = maxTravelDistance > 500
        ? "✈️ Available All-India"
        : maxTravelDistance > 100
            ? "🚗 Regional Travel"
            : "📍 Local (Delhi-NCR)";

    const formattedRating = Number(reviewSummary?.avgRating || rating || 0).toFixed(1);
    const totalRev = reviewSummary?.totalReviews || totalReviews || 0;
    const lowestPrice = pujaServices?.length > 0
        ? Math.min(...pujaServices.map((s: any) => s.dakshinaAmount))
        : 0;

    const aboutContent = (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">About Pandit Ji</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {bio || "Hi, I am an experienced Pandit Ji available for all types of Pujas and Anushthans. My rituals follow authentic Vedic traditions."}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-orange-50 p-4 rounded-xl text-center">
                    <div className="text-3xl mb-2">🕉️</div>
                    <div className="font-bold text-gray-900">{experienceYears}+ Years</div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Experience</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl text-center">
                    <div className="text-3xl mb-2">🚩</div>
                    <div className="font-bold text-gray-900">{completedBookings}</div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Ceremonies Performed</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl text-center">
                    <div className="text-3xl mb-2">⭐</div>
                    <div className="font-bold text-gray-900">{formattedRating} Rating</div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">{totalRev} Reviews</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl text-center">
                    <div className="text-3xl mb-2">🎓</div>
                    <div className="font-bold text-gray-900">Vedic</div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Verified Priest</div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Languages Spoken</h3>
                    <div className="flex flex-wrap gap-2">
                        {languages?.map((lang: string) => (
                            <span key={lang} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-700 font-medium shadow-sm">
                                {lang}
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Specializations</h3>
                    <div className="flex flex-wrap gap-2">
                        {specializations?.map((spec: string) => (
                            <span key={spec} className="px-4 py-2 bg-orange-50 text-orange-800 border border-orange-100 rounded-lg font-medium shadow-sm">
                                {spec}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {certificateUrls && certificateUrls.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Certifications</h3>
                    <div className="flex flex-col gap-3">
                        {certificateUrls.map((cert: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                    📜
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Vedic Shiksha Praman Patra {idx + 1}</p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        Verified by Platform <span className="text-green-500">✅</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const servicesContent = (
        <ServicesTab
            panditId={pandit.id}
            pujaServices={pujaServices}
            samagriPackages={samagriPackages}
        />
    );

    const travelContent = (
        <TravelOptionsTab
            panditId={pandit.id}
            panditLocation={location}
            travelPreferences={travelPreferences}
        />
    );

    const reviewsContent = (
        <ReviewSummary reviewSummary={reviewSummary} panditId={pandit.id} />
    );

    const availabilityContent = (
        <AvailabilityCalendar panditId={pandit.id} />
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">
            {/* Hero Section */}
            <section className="max-w-[1280px] mx-auto px-6 mt-8 mb-6 relative">
                <div className="bg-white dark:bg-[#221a10] rounded-xl p-6 shadow-sm border border-[#f49d25]/10">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="relative aspect-square min-h-[160px] w-[160px] md:min-w-[160px] md:h-[160px] rounded-xl border-4 border-[#f49d25]/20 shadow-lg overflow-hidden shrink-0">
                            <Image
                                src={pandit.profilePhotoUrl || "/default-avatar.png"}
                                alt={user.name}
                                fill
                                className="object-cover"
                            />
                            {isOnline && (
                                <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" title="Online now" />
                            )}
                        </div>
                        <div className="flex flex-col flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-[#181511] dark:text-white text-3xl font-bold leading-tight flex items-center gap-2">
                                        {user.name}
                                        <span className="material-symbols-outlined text-green-600 text-2xl" title="Verified Vedic Priest">verified</span>
                                    </h1>
                                    <p className="text-[#f49d25] font-semibold text-lg mt-1">{specializations?.[0] || 'Vedic Priest & Ritual Expert'}</p>
                                </div>
                                <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f49d25]/10 text-[#f49d25] border border-[#f49d25]/20 hover:bg-[#f49d25]/20 transition-all">
                                    <span className="material-symbols-outlined">play_circle</span>
                                    <span className="font-bold text-sm">Watch Intro</span>
                                </button>
                            </div>
                            <p className="text-[#8a7960] dark:text-[#b0a08a] mt-3 flex flex-wrap items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                {location} <span className="mx-1">|</span> {experienceYears}+ Years Experience <span className="mx-1">|</span> {completedBookings}+ Ceremonies
                            </p>

                            <div className="flex flex-wrap items-center gap-4 mt-5">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1 text-[#f49d25]">
                                        <span className="material-symbols-outlined text-lg fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="text-xl font-bold">{formattedRating}</span>
                                    </div>
                                    <span className="text-[#8a7960] text-xs">{totalRev} Reviews</span>
                                </div>
                                <div className="h-8 w-px bg-[#f49d25]/20"></div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-[#181511] dark:text-white">{completedBookings}+</span>
                                    <span className="text-[#8a7960] text-xs">Ceremonies</span>
                                </div>
                                <div className="h-8 w-px bg-[#f49d25]/20"></div>
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-sm font-bold text-[#181511] dark:text-white mt-1">{travelBadge.split(' ')[0]}</span>
                                    <span className="text-[#8a7960] text-xs">{travelBadge.split(' ').slice(1).join(' ')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Floating Action Strip */}
            <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-10 hidden md:block">
                <div className="bg-white rounded-xl shadow-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition border">
                            ❤️
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700 font-medium transition cursor-pointer">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            Share Profile
                        </button>
                    </div>
                    <BookingCTA panditId={pandit.id} lowestPrice={lowestPrice} />
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 mt-6 md:mt-12">
                <ProfileTabs
                    aboutContent={aboutContent}
                    servicesContent={servicesContent}
                    travelContent={travelContent}
                    reviewsContent={reviewsContent}
                    availabilityContent={availabilityContent}
                />
            </div>

            {/* Mobile Sticky CTA */}
            <BookingCTA panditId={pandit.id} lowestPrice={lowestPrice} isMobile />
        </div>
    );
}

function ReviewSummary({ reviewSummary, panditId }: { reviewSummary: any, panditId: string }) {
    if (!reviewSummary || reviewSummary.totalReviews === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-4xl mb-3 opacity-50">✍️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No reviews yet</h3>
                <p className="text-gray-500">Be the first to review Pandit Ji after your puja.</p>
            </div>
        );
    }

    const { avgRating, totalReviews, distribution, subRatings } = reviewSummary;
    const ratingNum = Number(avgRating).toFixed(1);

    return (
        <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">Reviews & Ratings</h3>

            <div className="grid md:grid-cols-12 gap-8 mb-10 bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
                <div className="md:col-span-4 text-center border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6 flex flex-col justify-center">
                    <div className="text-6xl font-black text-gray-900 mb-2">{ratingNum}</div>
                    <div className="flex items-center justify-center gap-1 text-orange-400 text-xl mb-2">
                        {'★★★★★'.split('').map((star, i) => (
                            <span key={i} className={i < Math.round(avgRating) ? "text-orange-500" : "text-gray-200"}>{star}</span>
                        ))}
                    </div>
                    <div className="text-sm font-medium text-gray-500">{totalReviews} verified ratings</div>
                </div>

                <div className="md:col-span-8 flex flex-col justify-center space-y-3 pl-0 md:pl-2">
                    {distribution.map((d: any) => (
                        <div key={d.star} className="flex items-center gap-4 text-sm">
                            <div className="w-12 font-medium text-gray-600">{d.star} Stars</div>
                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-400 rounded-full" style={{ width: `${d.percentage}%` }} />
                            </div>
                            <div className="w-10 text-right text-gray-500 font-medium">{Math.round(d.percentage)}%</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                    <div className="text-xl font-bold text-gray-900 mb-1">{Number(subRatings.Knowledge).toFixed(1)}</div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Vedic Knowledge</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                    <div className="text-xl font-bold text-gray-900 mb-1">{Number(subRatings.Punctuality).toFixed(1)}</div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Punctuality</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                    <div className="text-xl font-bold text-gray-900 mb-1">{Number(subRatings.Communication).toFixed(1)}</div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Communication</div>
                </div>
            </div>

            <ReviewList panditId={panditId} />
        </div>
    );
}

// Client component wrapper for reviews pagination (simulated here with server fetch for initial, but usually should be client component if interactive. Let's make it a simple list for now)
async function ReviewList({ panditId }: { panditId: string }) {
    const res = await fetch(`http://localhost:3001/api/v1/pandits/${panditId}/reviews?page=1&limit=5`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    const reviews = json.data;

    return (
        <div className="space-y-6">
            <h4 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-2">Recent Reviews</h4>
            {reviews.map((review: any) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                                {review.reviewerAvatar ? (
                                    <Image src={review.reviewerAvatar} alt="" width={40} height={40} className="rounded-full" />
                                ) : (
                                    review.reviewerName.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">{review.reviewerName}</div>
                                <div className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="text-orange-400 text-sm">
                            {'★'.repeat(Math.round(review.overallRating))}
                            <span className="text-gray-300">{'★'.repeat(5 - Math.round(review.overallRating))}</span>
                        </div>
                    </div>
                    <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium mb-3">
                        Puja: {review.pujaType}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                </div>
            ))}
            {reviews.length === 5 && (
                <button className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-700 font-semibold transition text-sm">
                    Load More Reviews
                </button>
            )}
        </div>
    );
}
