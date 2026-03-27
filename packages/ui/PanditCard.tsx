import React, { useState } from 'react';
import { Theme, themes } from './tokens';
import { Avatar } from './Avatar';
import { StarRating } from './StarRating';
import { Badge } from './Badge';

export interface TravelOptionResult {
    mode: 'self_drive' | 'train' | 'flight' | 'cab' | string;
    durationMins?: number;
    totalCost?: number;
    price?: number; // fallback
    label?: string; // fallback
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
    pandit?: PanditProfileSummary; // Make it optional to support legacy props fallback
    // Legacy support for flat props:
    id?: string;
    name?: string;
    photoUrl?: string;
    rating?: number;
    totalReviews?: number;
    experienceYears?: number;
    location?: string;
    specializations?: string[];
    isVerified?: boolean;
    travelModes?: TravelOptionResult[];

    travelOptions?: TravelOptionResult[];
    customerCity?: string;
    onBook: (id: string, mode: string) => void;
    onViewProfile: (id: string) => void;
    isFavorited?: boolean;
    onToggleFavorite?: () => void;
    theme?: Theme;
    className?: string;
}

const getTravelModeIcon = (mode: string) => {
    const m = mode.toLowerCase();
    if (m.includes(&apos;flight&apos;)) return &apos;flight&apos;;
    if (m.includes(&apos;train&apos;)) return &apos;train&apos;;
    if (m.includes(&apos;cab&apos;)) return &apos;local_taxi&apos;;
    return &apos;directions_car&apos;;
};

const getTravelModeName = (mode: string) => {
    const m = mode.toLowerCase();
    if (m.includes(&apos;flight&apos;)) return &apos;FLIGHT&apos;;
    if (m.includes(&apos;train&apos;)) return &apos;TRAIN&apos;;
    if (m.includes(&apos;cab&apos;)) return &apos;CAB&apos;;
    return &apos;SELF-DRIVE&apos;;
};

export const PanditCard: React.FC<PanditCardProps> = (props) => {
    // Legacy / New Prop Harmonization
    const id = props.pandit?.id || props.id || '';
    const name = props.pandit?.name || props.name || '';
    const profilePhotoUrl = props.pandit?.profilePhotoUrl || props.photoUrl;
    const rating = props.pandit?.rating ?? props.rating ?? 5.0;
    const totalReviews = props.pandit?.totalReviews ?? props.totalReviews ?? 0;
    const location = props.pandit?.location || props.location || '';
    const specializations = props.pandit?.specializations || props.specializations || [];
    const isVerified = props.pandit?.verificationStatus === &apos;VERIFIED&apos; || props.isVerified || false;
    const travelOptions = props.travelOptions || props.travelModes || [];

    const [selectedTravel, setSelectedTravel] = useState(0);

    return (
        <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col ${props.className || ''}`}>
            <div className="p-5 flex gap-5">
                <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 rounded-2xl bg-slate-200 overflow-hidden">
                        {profilePhotoUrl ? (
                            <img alt={name} className="w-full h-full object-cover" src={profilePhotoUrl} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-500 text-2xl font-bold">
                                {name.charAt(0)}
                            </div>
                        )}
                    </div>
                    {isVerified && (
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1 border-4 border-white dark:border-slate-900">
                            <span className="material-symbols-outlined text-xs block">verified</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-wrap gap-2">
                            {isVerified && (
                                <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-orange-500/20">
                                    Verified Vedic
                                </span>
                            )}
                            {travelOptions.length > 0 && (
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 border border-slate-200">
                                    <span className="material-symbols-outlined text-[12px]">
                                        {getTravelModeIcon(travelOptions[0].mode)}
                                    </span>
                                    {getTravelModeName(travelOptions[0].mode)} Available
                                </span>
                            )}
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate" title={name}>{name}</h3>

                    <div className="flex items-center gap-4 mt-1 text-sm">
                        <div className="flex items-center gap-1 text-orange-500 font-bold">
                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                            {rating.toFixed(1)} <span className="text-slate-400 font-normal ml-0.5">({totalReviews})</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 truncate" title={location}>
                            <span className="material-symbols-outlined text-sm shrink-0">map</span>
                            <span className="truncate">{location}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                        {specializations.slice(0, 3).map((spec, i) => (
                            <span key={i} className="text-[10px] bg-slate-50 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded-sm truncate max-w-[100px]" title={spec}>
                                {spec}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Travel Tabs Section or simple actions */}
            {travelOptions && travelOptions.length > 0 ? (
                <div className="mt-auto border-t border-slate-100 dark:border-slate-800">
                    <div className="flex px-5 pt-4 gap-4 text-xs font-bold text-slate-400 border-b border-slate-50 dark:border-slate-800 overflow-x-auto scrollbar-hide">
                        {travelOptions.map((opt, i) => {
                            const isSelected = i === selectedTravel;
                            const price = opt.totalCost ?? opt.price ?? 0;
                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedTravel(i)}
                                    className={`pb-3 border-b-2 flex flex-col items-center gap-1 whitespace-nowrap transition-colors ${isSelected
                                            ? &apos;border-orange-500 text-orange-500&apos;
                                            : &apos;border-transparent hover:text-slate-600&apos;
                                        }`}
                                >
                                    <span>{getTravelModeName(opt.mode)}</span>
                                    <span className={`text-sm ${isSelected ? 'font-black' : ''}`}>
                                        ₹{price >= 1000 ? `${(price / 1000).toFixed(1).replace(&apos;.0&apos;, '')}k` : price}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="p-5 flex items-center justify-between gap-4 bg-white">
                        <div className="text-xs text-slate-500 leading-tight flex-1">
                            <p>Select travel mode. Travel estimated cost added below.</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => props.onViewProfile(id)}
                                className="border border-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl hover:bg-slate-50 transition-all text-xs"
                            >
                                Profile
                            </button>
                            <button
                                onClick={() => props.onBook(id, travelOptions[selectedTravel]?.mode || &apos;SELF_DRIVE&apos;)}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-orange-500/20 text-sm whitespace-nowrap"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mt-auto border-t border-slate-100 dark:border-slate-800 p-5 flex items-center gap-3">
                    <button
                        onClick={() => props.onViewProfile(id)}
                        className="flex-1 bg-white border-2 border-slate-200 text-slate-600 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 transition-all text-sm"
                    >
                        View Profile
                    </button>
                    <button
                        onClick={() => props.onBook(id, &apos;SELF_DRIVE&apos;)}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-orange-500/20 text-sm"
                    >
                        Book Now
                    </button>
                </div>
            )}
        </div>
    );
};
