import { useState } from "react";
import { Theme, themes } from "./tokens";
import { Avatar } from "./Avatar";
import { StarRating } from "./StarRating";
import { Badge } from "./Badge";

export interface TravelOptionResult {
  mode: "self_drive" | "train" | "flight" | "cab" | string;
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
  if (m.includes("flight")) return "flight";
  if (m.includes("train")) return "train";
  if (m.includes("cab")) return "local_taxi";
  return "directions_car";
};

const getTravelModeName = (mode: string) => {
  const m = mode.toLowerCase();
  if (m.includes("flight")) return "FLIGHT";
  if (m.includes("train")) return "TRAIN";
  if (m.includes("cab")) return "CAB";
  return "SELF-DRIVE";
};

export const PanditCard = (props: PanditCardProps) => {
  // Legacy / New Prop Harmonization
  const id = props.pandit?.id || props.id || "";
  const name = props.pandit?.name || props.name || "";
  const profilePhotoUrl = props.pandit?.profilePhotoUrl || props.photoUrl;
  const rating = props.pandit?.rating ?? props.rating ?? 5.0;
  const totalReviews = props.pandit?.totalReviews ?? props.totalReviews ?? 0;
  const location = props.pandit?.location || props.location || "";
  const specializations =
    props.pandit?.specializations || props.specializations || [];
  const isVerified =
    props.pandit?.verificationStatus === "VERIFIED" ||
    props.isVerified ||
    false;
  const travelOptions = props.travelOptions || props.travelModes || [];

  const [selectedTravel, setSelectedTravel] = useState(0);

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${props.className || ""}`}
    >
      <div className="flex gap-5 p-5">
        <div className="relative flex-shrink-0">
          <div className="h-24 w-24 overflow-hidden rounded-2xl bg-slate-200">
            {profilePhotoUrl ? (
              <img
                alt={name}
                className="h-full w-full object-cover"
                src={profilePhotoUrl}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-orange-100 text-2xl font-bold text-orange-500">
                {name.charAt(0)}
              </div>
            )}
          </div>
          {isVerified && (
            <div className="absolute -bottom-2 -right-2 rounded-full border-4 border-white bg-green-500 p-1 text-white dark:border-slate-900">
              <span className="material-symbols-outlined block text-xs">
                verified
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between">
            <div className="flex flex-wrap gap-2">
              {isVerified && (
                <span className="rounded border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-500">
                  Verified Vedic
                </span>
              )}
              {travelOptions.length > 0 && (
                <span className="flex items-center gap-1 rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  <span className="material-symbols-outlined text-[12px]">
                    {getTravelModeIcon(travelOptions[0].mode)}
                  </span>
                  {getTravelModeName(travelOptions[0].mode)} Available
                </span>
              )}
            </div>
          </div>

          <h3
            className="truncate text-lg font-bold text-slate-900 dark:text-white"
            title={name}
          >
            {name}
          </h3>

          <div className="mt-1 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 font-bold text-orange-500">
              <span className="material-symbols-outlined fill-1 text-sm">
                star
              </span>
              {rating.toFixed(1)}{" "}
              <span className="ml-0.5 font-normal text-slate-400">
                ({totalReviews})
              </span>
            </div>
            <div
              className="flex items-center gap-1 truncate text-slate-500"
              title={location}
            >
              <span className="material-symbols-outlined shrink-0 text-sm">
                map
              </span>
              <span className="truncate">{location}</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {specializations.slice(0, 3).map((spec, i) => (
              <span
                key={i}
                className="max-w-[100px] truncate rounded-sm border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500"
                title={spec}
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Travel Tabs Section or simple actions */}
      {travelOptions && travelOptions.length > 0 ? (
        <div className="mt-auto border-t border-slate-100 dark:border-slate-800">
          <div className="scrollbar-hide flex gap-4 overflow-x-auto border-b border-slate-50 px-5 pt-4 text-xs font-bold text-slate-400 dark:border-slate-800">
            {travelOptions.map((opt, i) => {
              const isSelected = i === selectedTravel;
              const price = opt.totalCost ?? opt.price ?? 0;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedTravel(i)}
                  className={`flex flex-col items-center gap-1 whitespace-nowrap border-b-2 pb-3 transition-colors ${isSelected
                    ? "border-orange-500 text-orange-500"
                    : "border-transparent hover:text-slate-600"
                    }`}
                >
                  <span>{getTravelModeName(opt.mode)}</span>
                  <span className={`text-sm ${isSelected ? "font-black" : ""}`}>
                    ₹
                    {price >= 1000
                      ? `${(price / 1000).toFixed(1).replace(".0", "")}k`
                      : price}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-4 bg-white p-5">
            <div className="flex-1 text-xs leading-tight text-slate-500">
              <p>Select travel mode. Travel estimated cost added below.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => props.onViewProfile(id)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50"
              >
                Profile
              </button>
              <button
                onClick={() =>
                  props.onBook(
                    id,
                    travelOptions[selectedTravel]?.mode || "SELF_DRIVE",
                  )
                }
                className="whitespace-nowrap rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-orange-600"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-auto flex items-center gap-3 border-t border-slate-100 p-5 dark:border-slate-800">
          <button
            onClick={() => props.onViewProfile(id)}
            className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
          >
            View Profile
          </button>
          <button
            onClick={() => props.onBook(id, "SELF_DRIVE")}
            className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-orange-600"
          >
            Book Now
          </button>
        </div>
      )}
    </div>
  );
};
