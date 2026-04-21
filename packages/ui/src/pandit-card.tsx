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
  SELF_DRIVE: "directions_car",
  TRAIN: "train",
  FLIGHT: "flight",
};

const modeEmoji: Record<TravelMode, string> = {
  SELF_DRIVE: "🚗",
  TRAIN: "🚆",
  FLIGHT: "✈️",
};

function isTravelModePrice(
  item: TravelMode | TravelModePrice,
): item is TravelModePrice {
  return typeof item === "object" && "price" in item;
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
  className = "",
}: PanditCardProps) {
  const displayRating = overallRating ?? rating ?? 0;
  const displayPhoto = avatarUrl ?? photoUrl;
  const displayLocation = location ?? city;
  const displayBadges = badges ?? specializations.slice(0, 2);

  const travelPrices: TravelModePrice[] = travelModes.filter(
    (t): t is TravelModePrice => isTravelModePrice(t),
  );
  const travelModeStrings: TravelMode[] = travelModes.filter(
    (t): t is TravelMode => typeof t === "string",
  );
  const hasPrices = travelPrices.length > 0;

  const [activeMode, setActiveMode] = useState<TravelMode>(
    hasPrices ? travelPrices[0].mode : (travelModeStrings[0] ?? "SELF_DRIVE"),
  );

  const lowestPrice = hasPrices
    ? Math.min(...travelPrices.map((t) => t.price))
    : startingPrice;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {onFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(id);
          }}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-400 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:text-red-500"
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <span
            className={`material-symbols-outlined text-lg ${isFavorite ? "font-variation-fill-1 fill-current text-red-500" : ""}`}
          >
            favorite
          </span>
        </button>
      )}
      <div className="flex gap-4 p-5">
        <div className="group relative flex-shrink-0">
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
            className="hover:text-primary absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 opacity-0 shadow-md transition-all hover:scale-110 group-hover:opacity-100"
            title="Read details"
            aria-label="Read details aloud"
          >
            <span className="material-symbols-outlined text-sm">volume_up</span>
          </button>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
              {name}
            </h3>
            {isVerified && (
              <Badge variant="success" size="sm">
                Verified
              </Badge>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2">
            <Rating value={displayRating} size="sm" showValue />
            <span className="text-xs text-slate-400">
              ({totalReviews} reviews)
            </span>
          </div>

          <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
            {displayLocation && (
              <span className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-sm">
                  location_on
                </span>
                {displayLocation}
                {distanceKm !== undefined && distanceKm > 0 && (
                  <span className="ml-1 text-slate-400">• {distanceKm} km</span>
                )}
              </span>
            )}
            {experienceYears !== undefined && (
              <span>{experienceYears}+ yrs exp</span>
            )}
          </div>

          {displayBadges.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {displayBadges.slice(0, 3).map((s) => (
                <Badge key={s} variant="neutral" size="sm">
                  {s}
                </Badge>
              ))}
              {displayBadges.length > 3 && (
                <span className="self-center text-[10px] text-slate-400">
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
          <div className="scrollbar-hide flex gap-2 overflow-x-auto">
            {travelPrices.map((t) => {
              const isActive = activeMode === t.mode;
              return (
                <button
                  key={t.mode}
                  onClick={() => setActiveMode(t.mode)}
                  className={[
                    "flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-semibold transition-all",
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:border-primary/50 border-slate-200 text-slate-500 dark:border-slate-700",
                  ].join(" ")}
                >
                  <span>{modeEmoji[t.mode]}</span>
                  {t.label}: ₹{t.price.toLocaleString("en-IN")}
                </button>
              );
            })}
          </div>
          {travelPrices.find((t) => t.mode === activeMode)?.description && (
            <p className="mt-1.5 pl-1 text-[10px] text-slate-400">
              {travelPrices.find((t) => t.mode === activeMode)?.description}
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          {lowestPrice !== undefined && (
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              From ₹{lowestPrice.toLocaleString("en-IN")}
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
              className="bg-primary hover:bg-primary/90 shadow-primary/20 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors"
            >
              Book Now
            </button>
          )}
          <button
            onClick={() => onViewProfile?.(id)}
            className="text-primary hover:text-primary/80 text-sm font-semibold transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
