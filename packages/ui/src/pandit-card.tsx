"use client";

import React, { useState } from "react";
import { Badge } from "./badge";
import { Rating } from "./rating";
import { Avatar } from "./avatar";
import { PriceDisplay } from "./price-display";
import { Button } from "./button";

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
  avatarUrl?: string;
  isVerified?: boolean;
  badges?: string[];
  overallRating: number;
  totalReviews: number;
  distanceKm?: number;
  travelModes?: TravelModePrice[];
  specializations?: string[];
  onBook: (panditId: string, mode: TravelMode) => void;
  className?: string;
}

const modeIcons: Record<TravelMode, string> = {
  SELF_DRIVE: "directions_car",
  TRAIN: "train",
  FLIGHT: "flight",
};

export function PanditCard({
  id,
  name,
  avatarUrl,
  isVerified = false,
  badges = [],
  overallRating,
  totalReviews,
  distanceKm,
  travelModes = [],
  onBook,
  className = "",
}: PanditCardProps) {
  const [activeMode, setActiveMode] = useState<TravelMode>(
    travelModes[0]?.mode ?? "SELF_DRIVE",
  );

  const activeModeData = travelModes.find((m) => m.mode === activeMode);

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex gap-5 p-5">
        {/* Avatar */}
        <Avatar
          src={avatarUrl}
          alt={name}
          size="lg"
          shape="rounded"
          verified={isVerified}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Badges row */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {isVerified && (
                <Badge variant="success" icon="verified">
                  Verified Vedic
                </Badge>
              )}
              {badges.map((b) => (
                <Badge key={b} variant="primary">
                  {b}
                </Badge>
              ))}
            </div>
          )}

          {/* Name */}
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
            {name}
          </h3>

          {/* Rating + Distance */}
          <div className="flex items-center gap-3 mt-1">
            <Rating value={overallRating} reviewCount={totalReviews} size="sm" />
            {distanceKm !== undefined && (
              <span className="flex items-center gap-0.5 text-xs text-slate-400">
                <span className="material-symbols-outlined text-sm">
                  location_on
                </span>
                {distanceKm} km away
              </span>
            )}
          </div>

          {/* Travel mode tabs */}
          {travelModes.length > 0 && (
            <div className="mt-3">
              <div className="flex gap-1 border-b border-slate-100 dark:border-slate-800">
                {travelModes.map((m) => (
                  <button
                    key={m.mode}
                    onClick={() => setActiveMode(m.mode)}
                    className={[
                      "flex items-center gap-1 px-2 pb-2 text-[10px] font-bold uppercase tracking-wider transition-all",
                      activeMode === m.mode
                        ? "border-b-2 border-primary text-primary"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
                    ].join(" ")}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {modeIcons[m.mode]}
                    </span>
                    {m.label}
                  </button>
                ))}
              </div>

              {activeModeData && (
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <PriceDisplay
                      amount={activeModeData.price}
                      size="featured"
                    />
                    {activeModeData.description && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activeModeData.description}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onBook(id, activeMode)}
                    icon="calendar_add_on"
                  >
                    Book Now
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
