import React from 'react';
import { Theme, themes } from './tokens';
import { Avatar } from './Avatar';
import { StarRating } from './StarRating';
import { Badge } from './Badge';

export interface TravelOptionResult {
    mode: 'self_drive' | 'train' | 'flight' | 'cab';
    durationMins: number;
    totalCost: number;
}

export interface PanditProfileSummary {
    id: string;
    name: string;
    profilePhotoUrl?: string;
    rating: number;
    totalReviews: number;
    experienceYears: number;
    location: string;
    specializations: string[];
    languages: string[];
    verificationStatus: string; // e.g., 'VERIFIED'
    isOnline?: boolean;
}

export interface PanditCardProps {
    pandit: PanditProfileSummary;
    travelOptions?: TravelOptionResult[];
    customerCity?: string;
    onBook: () => void;
    onViewProfile: () => void;
    isFavorited?: boolean;
    onToggleFavorite?: () => void;
    theme?: Theme;
    className?: string;
}

const TravelModeIcon = ({ mode }: { mode: string }) => {
    switch (mode) {
        case 'self_drive': return <span>🚗</span>;
        case 'train': return <span>🚂</span>;
        case 'flight': return <span>✈️</span>;
        case 'cab': return <span>🚕</span>;
        default: return <span>🚗</span>;
    }
};

const TravelModeName = ({ mode }: { mode: string }) => {
    switch (mode) {
        case 'self_drive': return 'Self';
        case 'train': return 'Train';
        case 'flight': return 'Flight';
        case 'cab': return 'Cab';
        default: return 'Travel';
    }
};

export const PanditCard: React.FC<PanditCardProps> = ({
    pandit,
    travelOptions,
    customerCity,
    onBook,
    onViewProfile,
    isFavorited = false,
    onToggleFavorite,
    theme = 'customer',
    className = '',
}) => {
    const currentTheme = themes[theme] || themes.customer;
    const isVerified = pandit.verificationStatus === 'VERIFIED';

    const styleVars = {
        '--card-primary': currentTheme.primary,
        '--card-primary-dark': currentTheme.primaryDark,
        '--card-primary-light': currentTheme.primaryLight,
    } as React.CSSProperties;

    const visibleSpecs = pandit.specializations.slice(0, 3);
    const extraSpecs = pandit.specializations.length - 3;
    const showTravel = travelOptions && customerCity && pandit.location !== customerCity;

    return (
        <div
            className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${className}`}
            style={styleVars}
        >
            <div className="p-5 flex-1 w-full">
                {/* Top Header Section */}
                <div className="flex">
                    {/* Avatar Area */}
                    <div className="mr-4">
                        <Avatar
                            src={pandit.profilePhotoUrl}
                            name={pandit.name}
                            size="lg"
                            verified={isVerified}
                            online={pandit.isOnline}
                            theme={theme}
                        />
                    </div>

                    {/* Info Area */}
                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                    {pandit.name}
                                </h3>
                                <div className="text-sm text-gray-500 mt-1 flex items-center">
                                    <svg className="w-4 h-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    {pandit.location}
                                </div>
                            </div>

                            {onToggleFavorite && (
                                <button
                                    onClick={onToggleFavorite}
                                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                                    aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                                >
                                    <svg
                                        className={`w-6 h-6 transition-colors ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                                        fill={isFavorited ? "currentColor" : "none"}
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={isFavorited ? 0 : 2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {isVerified && (
                            <div className="mt-2 inline-flex items-center text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                                ✓ Verified Vedic
                            </div>
                        )}

                        {/* Rating and Experience */}
                        <div className="flex items-center mt-3 text-sm text-gray-600">
                            <StarRating value={pandit.rating} size="sm" showValue={true} />
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="underline decoration-dotted">{pandit.totalReviews} reviews</span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="font-medium text-gray-800">{pandit.experienceYears} yrs exp</span>
                        </div>
                    </div>
                </div>

                {/* Tags Section */}
                <div className="mt-5 space-y-3">
                    {/* Specializations */}
                    <div className="flex flex-wrap gap-2">
                        {visibleSpecs.map((spec, i) => (
                            <Badge key={i} variant="primary" theme={theme} size="sm">{spec}</Badge>
                        ))}
                        {extraSpecs > 0 && (
                            <Badge variant="neutral" size="sm">+{extraSpecs} more</Badge>
                        )}
                    </div>

                    {/* Languages */}
                    <div className="flex flex-wrap gap-1.5">
                        {pandit.languages.map((lang, i) => (
                            <span key={i} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                {lang}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Travel Options Section */}
                {showTravel && (
                    <div className="mt-5 pt-4 border-t border-dashed border-gray-200 w-full overflow-hidden">
                        <h4 className="text-xs font-semibold text-gray-500 mb-3 ml-1 flex items-center w-full">
                            <svg className="w-4 h-4 mr-1 text-gray-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            Travel from {pandit.location} required
                        </h4>

                        {/* Horizontal scroll for travel options if there are multiple */}
                        <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-3 w-full">
                            {travelOptions.map((opt, i) => (
                                <div key={i} className="flex-none bg-gray-50 rounded-lg p-2.5 border border-gray-100 min-w-[100px] shrink-0">
                                    <div className="flex items-center text-sm font-medium text-gray-700">
                                        <TravelModeIcon mode={opt.mode} />
                                        <span className="ml-1.5"><TravelModeName mode={opt.mode} /></span>
                                    </div>
                                    <div className="mt-1 font-bold text-gray-900 text-sm">
                                        ₹{opt.totalCost.toLocaleString('en-IN')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Actions Footer */}
            <div className="mt-auto px-5 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 w-full shrink-0">
                <button
                    onClick={onViewProfile}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                    View Profile
                </button>
                <button
                    onClick={onBook}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg text-[var(--btn-text)] bg-[var(--card-primary)] hover:bg-[var(--card-primary-dark)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--card-primary)]"
                >
                    Book Now
                </button>
            </div>
        </div>
    );
};
