"use client";

import React, { useState } from "react";
import { Badge } from "./badge";
import { Rating } from "./rating";
import { Avatar } from "./avatar";

export type TravelMode = "SELF_DRIVE" | "TRAIN" | "FLIGHT";

export interface TravelModePrice {
  mode: TravelMode;
  label: string;
  price: number;
  description?: string;
}

export interface PanditCardProps {
  id: string;
  name: string;
  photoUrl?: string;
  avatarUrl?: string;
  rating?: number;
  overallRating?: number;
  totalReviews: number;
  specializations?: string[];
  badges?: string[];
  location?: string;
  city?: string;
  distanceKm?: number;
  experienceYears?: number;
  startingPrice?: number;
  isVerified?: boolean;
  travelModes?: (TravelMode | TravelModePrice)[];
  onViewProfile?: (id: string) => void;
  onBook?: (id: string, mode: TravelMode) => void;
  isFavorite?: boolean;
  onFavorite?: (id: string) => void;
  className?: string;
}

const modeIcons: Record<TravelMode, string> = {
  SELF_DRIVE: &quot;directions_car&quot;,
  TRAIN: &quot;train&quot;,
  FLIGHT: &quot;flight&quot;,
};

const modeEmoji: Record<TravelMode, string> = {
  SELF_DRIVE: &quot;🚗&quot;,
  TRAIN: &quot;🚆&quot;,
  FLIGHT: &quot;✈️&quot;,
};

function isTravelModePrice(item: TravelMode | TravelModePrice): item is TravelModePrice {
  return typeof item === &quot;object&quot; && &quot;price&quot; in item;
}

export function PanditCard({
  id,
  name,
  photoUrl,
  avatarUrl,
  rating,
  overallRating,
  totalReviews,
  specializations = [],
  badges,
  location,
  city,
  distanceKm,
  experienceYears,
  startingPrice,
  isVerified = false,
  travelModes = [],
  isFavorite = false,
  onViewProfile,
  onBook,
  onFavorite,
  className = &quot;&quot;,
}: PanditCardProps) {
  const displayRating = overallRating ?? rating ?? 0;
  const displayPhoto = avatarUrl ?? photoUrl;
  const displayLocation = location ?? city;
  const displayBadges = badges ?? specializations.slice(0, 2);

  const travelPrices: TravelModePrice[] = travelModes.filter(
    (t): t is TravelModePrice => isTravelModePrice(t),
  );
  const travelModeStrings: TravelMode[] = travelModes.filter(
    (t): t is TravelMode => typeof t === &quot;string&quot;,
  );
  const hasPrices = travelPrices.length > 0;

  const [activeMode, setActiveMode] = useState<TravelMode>(
    hasPrices ? travelPrices[0].mode : travelModeStrings[0] ?? &quot;SELF_DRIVE&quot;,
  );

  const lowestPrice = hasPrices
    ? Math.min(...travelPrices.map((t) => t.price))
    : startingPrice;

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow relative ${className}`}
    >
      {onFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(id);
          }}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 transition-all"
          title={isFavorite ? &quot;Remove from favorites&quot; : &quot;Add to favorites&quot;}
        >
          <span className={`material-symbols-outlined text-lg ${isFavorite ? "text-red-500 fill-current font-variation-fill-1" : ""}`}>
            favorite
          </span>
        </button>
      )}
      <div className="flex gap-4 p-5">
        <div className="flex-shrink-0 relative group">
          <Avatar
            src={displayPhoto}
            name={name}
            size="lg"
            verifiedBadge={isVerified}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              const text = `Pandit ${name}. ${displayRating} stars, ${totalReviews} reviews. Located in ${displayLocation}. Starts from ${lowestPrice} rupees.`;
              const u = new SpeechSynthesisUtterance(text);
              window.speechSynthesis.speak(u);
            }}
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-slate-500 hover:text-primary hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
            title="Read details"
            aria-label="Read details aloud"
          >
            <span className="material-symbols-outlined text-sm">volume_up</span>
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              {name}
            </h3>
            {isVerified && (
              <Badge variant="success" size="sm">
                Verified
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Rating value={displayRating} size="sm" showValue />
            <span className="text-xs text-slate-400">
              ({totalReviews} reviews)
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
            {displayLocation && (
              <span className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-sm">
                  location_on
                </span>
                {displayLocation}
                {distanceKm !== undefined && distanceKm > 0 && (
                  <span className="text-slate-400 ml-1">• {distanceKm} km</span>
                )}
              </span>
            )}
            {experienceYears !== undefined && (
              <span>{experienceYears}+ yrs exp</span>
            )}
          </div>

          {displayBadges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {displayBadges.slice(0, 3).map((s) => (
                <Badge key={s} variant="neutral" size="sm">
                  {s}
                </Badge>
              ))}
              {displayBadges.length > 3 && (
                <span className="text-[10px] text-slate-400 self-center">
                  +{displayBadges.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Travel mode tabs with prices */}
      {hasPrices && (
        <div className="px-5 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {travelPrices.map((t) => {
              const isActive = activeMode === t.mode;
              return (
                <button
                  key={t.mode}
                  onClick={() => setActiveMode(t.mode)}
                  className={[
                    &quot;flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all whitespace-nowrap&quot;,
                    isActive
                      ? &quot;border-primary bg-primary/10 text-primary&quot;
                      : &quot;border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/50&quot;,
                  ].join(&quot; &quot;)}
                >
                  <span>{modeEmoji[t.mode]}</span>
                  {t.label}: ₹{t.price.toLocaleString(&quot;en-IN&quot;)}
                </button>
              );
            })}
          </div>
          {travelPrices.find((t) => t.mode === activeMode)?.description && (
            <p className="text-[10px] text-slate-400 mt-1.5 pl-1">
              {travelPrices.find((t) => t.mode === activeMode)?.description}
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          {lowestPrice !== undefined && (
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              From ₹{lowestPrice.toLocaleString(&quot;en-IN&quot;)}
            </span>
          )}
          {!hasPrices && travelModeStrings.length > 0 && (
            <div className="flex items-center gap-1">
              {travelModeStrings.map((mode) => (
                <span
                  key={mode}
                  className="material-symbols-outlined text-sm text-slate-400"
                  title={mode.replace("_", " ").toLowerCase()}
                >
                  {modeIcons[mode]}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onBook && (
            <button
              onClick={() => onBook(id, activeMode)}
              className="text-xs font-bold bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
            >
              Book Now
            </button>
          )}
          <button
            onClick={() => onViewProfile?.(id)}
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
