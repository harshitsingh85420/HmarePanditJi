"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PanditCard,
  type TravelModePrice,
  type TravelMode,
} from "@hmarepanditji/ui";

// ── Types ────────────────────────────────────────────────────────────────────

interface PanditResult {
  id: string;
  name: string;
  avatarUrl?: string;
  isVerified: boolean;
  badges: string[];
  overallRating: number;
  totalReviews: number;
  distanceKm?: number;
  travelModes: TravelModePrice[];
  specializations: string[];
  city: string;
  languages: string[];
  experienceYears: number;
}

interface SearchFilters {
  ritual: string;
  city: string;
  date: string;
  minBudget: number;
  maxBudget: number;
  travel: string;
  minRating: string;
  languages: string[];
  sort: string;
  maxDistanceKm: number;  // 0 = Any
  userLat?: number;
  userLng?: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DELHI_CITIES = [
  "Delhi (All)",
  "Dwarka",
  "Rohini",
  "Noida",
  "Gurgaon",
  "Faridabad",
  "Ghaziabad",
  "Greater Noida",
  "Lajpat Nagar",
  "South Delhi",
  "East Delhi",
  "West Delhi",
  "North Delhi",
];

const RITUALS = [
  "Any Ceremony",
  "Griha Pravesh",
  "Satyanarayan Katha",
  "Vivah Sanskar",
  "Namkaran Sanskar",
  "Mundan Sanskar",
  "Shanti Path",
  "Rudrabhishek",
  "Sunderkand Path",
];

const TRAVEL_OPTIONS = [
  { label: "Self-Drive", icon: "directions_car", value: "SELF_DRIVE" },
  { label: "Flight", icon: "flight", value: "FLIGHT" },
  { label: "Train", icon: "train", value: "TRAIN" },
  { label: "Any", icon: "all_inclusive", value: "" },
];

const LANGUAGES = ["Hindi", "Sanskrit", "English", "Bengali", "Gujarati"];

// ── Mock data (fallback when API is unreachable) ───────────────────────────

const MOCK_PANDITS: PanditResult[] = [
  {
    id: "p1",
    name: "Pt. Ramesh Sharma Shastri",
    isVerified: true,
    badges: ["Self-Drive Available"],
    overallRating: 4.9,
    totalReviews: 312,
    distanceKm: 8,
    city: "Dwarka",
    languages: ["Hindi", "Sanskrit"],
    experienceYears: 22,
    specializations: ["Vivah Sanskar", "Griha Pravesh"],
    travelModes: [
      { mode: "SELF_DRIVE", label: "Self-Drive", price: 15000, description: "Includes fuel & toll up to 50 km" },
      { mode: "TRAIN", label: "Train", price: 16500, description: "Train + auto for outstation" },
      { mode: "FLIGHT", label: "Flight", price: 22000, description: "Airfare + airport transfer" },
    ],
  },
  {
    id: "p2",
    name: "Pt. Suresh Mishra Vedacharya",
    isVerified: true,
    badges: ["Expert Traveler"],
    overallRating: 4.8,
    totalReviews: 187,
    distanceKm: 14,
    city: "Rohini",
    languages: ["Hindi", "Sanskrit", "English"],
    experienceYears: 18,
    specializations: ["Satyanarayan Katha", "Rudrabhishek"],
    travelModes: [
      { mode: "SELF_DRIVE", label: "Self-Drive", price: 11000, description: "Includes fuel & toll up to 50 km" },
      { mode: "TRAIN", label: "Train", price: 13500, description: "Train + auto for outstation" },
      { mode: "FLIGHT", label: "Flight", price: 19000, description: "Airfare + airport transfer" },
    ],
  },
  {
    id: "p3",
    name: "Pt. Dinesh Kumar Joshi",
    isVerified: true,
    badges: ["Self-Drive Available"],
    overallRating: 4.7,
    totalReviews: 243,
    distanceKm: 5,
    city: "Noida",
    languages: ["Hindi", "Sanskrit"],
    experienceYears: 15,
    specializations: ["Namkaran Sanskar", "Mundan Sanskar"],
    travelModes: [
      { mode: "SELF_DRIVE", label: "Self-Drive", price: 8500, description: "Includes fuel & toll up to 30 km" },
      { mode: "TRAIN", label: "Train", price: 10000, description: "Train + auto for outstation" },
      { mode: "FLIGHT", label: "Flight", price: 16000, description: "Airfare + airport transfer" },
    ],
  },
  {
    id: "p4",
    name: "Pt. Avinash Tiwari",
    isVerified: true,
    badges: ["Expert Traveler"],
    overallRating: 4.6,
    totalReviews: 98,
    distanceKm: 22,
    city: "Gurgaon",
    languages: ["Hindi", "Sanskrit", "English"],
    experienceYears: 12,
    specializations: ["Griha Pravesh", "Shanti Path"],
    travelModes: [
      { mode: "SELF_DRIVE", label: "Self-Drive", price: 12000, description: "Includes fuel & toll up to 50 km" },
      { mode: "TRAIN", label: "Train", price: 14500, description: "Train + auto for outstation" },
      { mode: "FLIGHT", label: "Flight", price: 20000, description: "Airfare + airport transfer" },
    ],
  },
  {
    id: "p5",
    name: "Pt. Mahesh Dubey Shastri",
    isVerified: false,
    badges: [],
    overallRating: 4.2,
    totalReviews: 56,
    distanceKm: 31,
    city: "Faridabad",
    languages: ["Hindi"],
    experienceYears: 8,
    specializations: ["Sunderkand Path", "Satyanarayan Katha"],
    travelModes: [
      { mode: "SELF_DRIVE", label: "Self-Drive", price: 7000, description: "Includes fuel up to 30 km" },
      { mode: "TRAIN", label: "Train", price: 8500, description: "Train + auto for outstation" },
    ],
  },
  {
    id: "p6",
    name: "Pt. Rajendra Pathak",
    isVerified: true,
    badges: ["Self-Drive Available"],
    overallRating: 4.5,
    totalReviews: 134,
    distanceKm: 18,
    city: "Ghaziabad",
    languages: ["Hindi", "Sanskrit"],
    experienceYears: 20,
    specializations: ["Vivah Sanskar", "Rudrabhishek"],
    travelModes: [
      { mode: "SELF_DRIVE", label: "Self-Drive", price: 13500, description: "Includes fuel & toll up to 50 km" },
      { mode: "TRAIN", label: "Train", price: 15000, description: "Train + auto for outstation" },
      { mode: "FLIGHT", label: "Flight", price: 21000, description: "Airfare + airport transfer" },
    ],
  },
];

// ── API helpers ───────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

async function fetchPandits(params: URLSearchParams): Promise<{
  pandits: PanditResult[];
  total: number;
}> {
  const maxDistanceKm = Number(params.get("maxDistanceKm") ?? 0);

  try {
    const res = await fetch(`${API_URL}/pandits?${params.toString()}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    // Map API response to PanditResult
    const pandits: PanditResult[] = (data.data ?? data.pandits ?? data ?? []).map(
      (p: Record<string, unknown>) => ({
        id: String(p.id),
        name: String(p.displayName ?? p.name ?? ""),
        avatarUrl: p.profilePhotoUrl as string | undefined,
        isVerified: Boolean(p.isVerified),
        badges: Array.isArray(p.specializations)
          ? (p.specializations as string[]).slice(0, 2)
          : [],
        overallRating: Number(p.averageRating ?? 0),
        totalReviews: Number(p.totalReviews ?? 0),
        distanceKm: p.distanceKm as number | undefined,
        city: String(p.city ?? ""),
        languages: Array.isArray(p.languages) ? (p.languages as string[]) : [],
        experienceYears: Number(p.experienceYears ?? 0),
        specializations: Array.isArray(p.specializations)
          ? (p.specializations as string[])
          : [],
        travelModes: Array.isArray(p.travelModes)
          ? (p.travelModes as TravelModePrice[])
          : buildMockTravelModes(
              Number((p.basePricing as Record<string, number>)?.base ?? 8000),
            ),
      }),
    );
    return { pandits, total: data.total ?? pandits.length };
  } catch {
    // Graceful fallback to mock data — apply distance filter client-side
    let fallback = MOCK_PANDITS;
    if (maxDistanceKm > 0) {
      fallback = fallback.filter((p) => (p.distanceKm ?? 9999) <= maxDistanceKm);
    }
    return { pandits: fallback, total: fallback.length };
  }
}

function buildMockTravelModes(base: number): TravelModePrice[] {
  return [
    { mode: "SELF_DRIVE", label: "Self-Drive", price: base + 800, description: "Fuel & toll included" },
    { mode: "TRAIN", label: "Train", price: base + 1800, description: "Train + auto for outstation" },
    { mode: "FLIGHT", label: "Flight", price: base + 5500, description: "Airfare + airport transfer" },
  ];
}

// ── Sidebar ───────────────────────────────────────────────────────────────

const DISTANCE_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "10 km", value: 10 },
  { label: "25 km", value: 25 },
  { label: "50 km", value: 50 },
  { label: "100 km", value: 100 },
];

function Sidebar({
  filters,
  onChange,
  onReset,
  onDetectLocation,
  locationStatus,
}: {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  onReset: () => void;
  onDetectLocation: () => void;
  locationStatus: "idle" | "detecting" | "detected" | "denied";
}) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Advanced Filters
        </h2>
        <button
          onClick={onReset}
          className="text-primary text-xs font-bold uppercase tracking-wider hover:underline"
        >
          Reset
        </button>
      </div>

      {/* Ritual */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Ceremony / Ritual
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
            auto_stories
          </span>
          <select
            value={filters.ritual}
            onChange={(e) => onChange({ ritual: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-slate-700 dark:text-slate-200"
          >
            {RITUALS.map((r) => (
              <option key={r} value={r === "Any Ceremony" ? "" : r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Location
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
            location_on
          </span>
          <select
            value={filters.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-slate-700 dark:text-slate-200"
          >
            <option value="">All of Delhi-NCR</option>
            {DELHI_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Distance */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Max Distance
          </label>
          <span className="text-xs text-primary font-bold">
            {filters.maxDistanceKm ? `Within ${filters.maxDistanceKm} km` : "Any"}
          </span>
        </div>

        {/* Detect location button */}
        <button
          type="button"
          onClick={onDetectLocation}
          disabled={locationStatus === "detecting"}
          className={[
            "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all mb-3",
            locationStatus === "detected"
              ? "border-green-400 bg-green-50 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400"
              : locationStatus === "denied"
              ? "border-red-300 bg-red-50 text-red-600 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400"
              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary",
          ].join(" ")}
        >
          <span className="material-symbols-outlined text-sm">
            {locationStatus === "detecting"
              ? "sync"
              : locationStatus === "detected"
              ? "my_location"
              : locationStatus === "denied"
              ? "location_off"
              : "near_me"}
          </span>
          {locationStatus === "detecting"
            ? "Detecting…"
            : locationStatus === "detected"
            ? "Location Detected"
            : locationStatus === "denied"
            ? "Location Denied"
            : "Use My Location"}
        </button>

        {/* Quick-pick km buttons */}
        <div className="flex flex-wrap gap-2">
          {DISTANCE_OPTIONS.map((opt) => {
            const active = filters.maxDistanceKm === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ maxDistanceKm: opt.value })}
                className={[
                  "px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary",
                ].join(" ")}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Muhurat Date */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Muhurat Date
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
            calendar_month
          </span>
          <input
            type="date"
            value={filters.date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => onChange({ date: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Budget Range */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Budget (₹)
          </label>
          <span className="text-xs text-primary font-bold">
            ₹{(filters.minBudget / 1000).toFixed(0)}k – ₹
            {(filters.maxBudget / 1000).toFixed(0)}k
          </span>
        </div>
        <div className="space-y-3">
          <input
            type="range"
            min={5000}
            max={50000}
            step={500}
            value={filters.minBudget}
            onChange={(e) =>
              onChange({ minBudget: Math.min(Number(e.target.value), filters.maxBudget - 500) })
            }
            className="w-full accent-primary"
          />
          <input
            type="range"
            min={5000}
            max={50000}
            step={500}
            value={filters.maxBudget}
            onChange={(e) =>
              onChange({ maxBudget: Math.max(Number(e.target.value), filters.minBudget + 500) })
            }
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>₹5k</span>
            <span>₹50k</span>
          </div>
        </div>
      </div>

      {/* Travel Preference */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Travel Preference
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TRAVEL_OPTIONS.map((opt) => {
            const active = filters.travel === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onChange({ travel: opt.value })}
                className={[
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary",
                ].join(" ")}
              >
                <span className="material-symbols-outlined text-sm">
                  {opt.icon}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Minimum Rating
        </label>
        <div className="flex gap-2">
          {[
            { label: "Any", value: "" },
            { label: "4.0+", value: "4.0" },
            { label: "4.5+", value: "4.5" },
          ].map((opt) => {
            const active = filters.minRating === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onChange({ minRating: opt.value })}
                className={[
                  "flex-1 py-2 rounded-xl border text-xs font-bold transition-all",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary",
                ].join(" ")}
              >
                {opt.value && (
                  <span className="material-symbols-outlined text-xs mr-0.5 align-middle">
                    star
                  </span>
                )}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Language
        </label>
        <div className="space-y-2">
          {LANGUAGES.map((lang) => {
            const checked = filters.languages.includes(lang);
            return (
              <label
                key={lang}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? filters.languages.filter((l) => l !== lang)
                      : [...filters.languages, lang];
                    onChange({ languages: next });
                  }}
                  className="w-4 h-4 accent-primary rounded"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                  {lang}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Pandit Skeleton Card ──────────────────────────────────────────────────

function PanditSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
      <div className="flex gap-4">
        <div className="w-24 h-24 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between">
        <div className="h-6 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

// ── Default filters ────────────────────────────────────────────────────────

function defaultFilters(
  params: Record<string, string | undefined>,
): SearchFilters {
  return {
    ritual: params.ritual ?? "",
    city: params.city ?? "",
    date: params.date ?? "",
    minBudget: Number(params.minPrice ?? 5000),
    maxBudget: Number(params.maxPrice ?? 50000),
    travel: params.travel ?? "",
    minRating: params.minRating ?? "",
    languages: params.languages ? params.languages.split(",") : [],
    sort: params.sort ?? "best_match",
    maxDistanceKm: Number(params.maxDistanceKm ?? 0),
    userLat: params.lat ? Number(params.lat) : undefined,
    userLng: params.lng ? Number(params.lng) : undefined,
  };
}

function filtersToParams(f: SearchFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.ritual) p.set("ritual", f.ritual);
  if (f.city) p.set("city", f.city);
  if (f.date) p.set("date", f.date);
  if (f.minBudget !== 5000) p.set("minPrice", String(f.minBudget));
  if (f.maxBudget !== 50000) p.set("maxPrice", String(f.maxBudget));
  if (f.travel) p.set("travel", f.travel);
  if (f.minRating) p.set("minRating", f.minRating);
  if (f.languages.length) p.set("languages", f.languages.join(","));
  if (f.sort && f.sort !== "best_match") p.set("sort", f.sort);
  if (f.maxDistanceKm) p.set("maxDistanceKm", String(f.maxDistanceKm));
  if (f.userLat != null) p.set("lat", String(f.userLat));
  if (f.userLng != null) p.set("lng", String(f.userLng));
  p.set("limit", "10");
  return p;
}

// ── Main Component ────────────────────────────────────────────────────────

export default function SearchClient({
  initialParams,
}: {
  initialParams: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>(() =>
    defaultFilters(initialParams),
  );
  const [pandits, setPandits] = useState<PanditResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"idle" | "detecting" | "detected" | "denied">("idle");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync filters into URL (debounced 300ms)
  const applyFilters = useCallback(
    (f: SearchFilters) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const params = filtersToParams(f);
        router.replace(`/search?${params.toString()}`, { scroll: false });
      }, 300);
    },
    [router],
  );

  const updateFilters = useCallback(
    (patch: Partial<SearchFilters>) => {
      setFilters((prev) => {
        const next = { ...prev, ...patch };
        applyFilters(next);
        return next;
      });
      setPage(1);
    },
    [applyFilters],
  );

  const resetFilters = useCallback(() => {
    const def: SearchFilters = {
      ritual: "",
      city: "",
      date: "",
      minBudget: 5000,
      maxBudget: 50000,
      travel: "",
      minRating: "",
      languages: [],
      sort: "best_match",
      maxDistanceKm: 0,
    };
    setFilters(def);
    applyFilters(def);
    setPage(1);
  }, [applyFilters]);

  const handleDetectLocation = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    setLocationStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationStatus("detected");
        updateFilters({
          userLat: pos.coords.latitude,
          userLng: pos.coords.longitude,
        });
      },
      () => {
        setLocationStatus("denied");
      },
      { timeout: 8000 },
    );
  }, [updateFilters]);

  // Fetch pandits whenever URL searchParams change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = filtersToParams(filters);
    params.set("page", String(page));
    fetchPandits(params).then(({ pandits: data, total: t }) => {
      if (cancelled) return;
      setPandits((prev) => (page === 1 ? data : [...prev, ...data]));
      setTotal(t);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, page]);

  const displayCity =
    filters.city || "Delhi-NCR";
  const displayRitual = filters.ritual || "all ceremonies";

  const handleBook = useCallback(
    (panditId: string, mode: TravelMode) => {
      const params = new URLSearchParams();
      params.set("panditId", panditId);
      params.set("mode", mode);
      if (filters.ritual) params.set("ritual", filters.ritual);
      if (filters.date) params.set("date", filters.date);
      router.push(`/book?${params.toString()}`);
    },
    [router, filters.ritual, filters.date],
  );

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#221a10]">
      {/* Mobile filter button */}
      <div className="lg:hidden sticky top-16 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-sm">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {loading ? "Searching…" : `${total} Pandits found`}
        </span>
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors"
        >
          <span className="material-symbols-outlined text-base">tune</span>
          Filters
        </button>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto p-6">
            <button
              onClick={() => setSidebarOpen(false)}
              className="mb-6 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close filters"
            >
              <span className="material-symbols-outlined text-slate-500">
                close
              </span>
            </button>
            <Sidebar
              filters={filters}
              onChange={updateFilters}
              onReset={resetFilters}
              onDetectLocation={handleDetectLocation}
              locationStatus={locationStatus}
            />
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row">
        {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
        <aside className="hidden lg:block lg:w-[320px] lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] p-6 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 overflow-y-auto">
          <Sidebar
            filters={filters}
            onChange={updateFilters}
            onReset={resetFilters}
          />
        </aside>

        {/* ── Main Content ────────────────────────────────────────────────── */}
        <main className="flex-1 p-6 lg:p-10 min-h-screen">
          {/* Spiritual dot pattern background */}
          <div
            className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #f49d25 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10">
            {/* ── Results Header ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {loading ? (
                    <span className="inline-block w-48 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  ) : (
                    `${total} Pandit${total !== 1 ? "s" : ""} match your search`
                  )}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Found in{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {displayCity}
                  </span>{" "}
                  for{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {displayRitual}
                  </span>
                </p>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">
                  Sort by:
                </span>
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-slate-700 dark:text-slate-200"
                >
                  <option value="best_match">Best Match</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Rating: High to Low</option>
                  <option value="reviews_desc">Most Reviewed</option>
                  <option value="distance_asc">Nearest First</option>
                </select>
              </div>
            </div>

            {/* ── Active Filter Pills ─────────────────────────────────────── */}
            {(filters.ritual ||
              filters.city ||
              filters.date ||
              filters.travel ||
              filters.minRating ||
              filters.languages.length > 0 ||
              filters.maxDistanceKm > 0) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.ritual && (
                  <FilterPill
                    label={filters.ritual}
                    icon="auto_stories"
                    onRemove={() => updateFilters({ ritual: "" })}
                  />
                )}
                {filters.city && (
                  <FilterPill
                    label={filters.city}
                    icon="location_on"
                    onRemove={() => updateFilters({ city: "" })}
                  />
                )}
                {filters.date && (
                  <FilterPill
                    label={new Date(filters.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    icon="calendar_month"
                    onRemove={() => updateFilters({ date: "" })}
                  />
                )}
                {filters.travel && (
                  <FilterPill
                    label={
                      TRAVEL_OPTIONS.find((t) => t.value === filters.travel)
                        ?.label ?? filters.travel
                    }
                    icon="commute"
                    onRemove={() => updateFilters({ travel: "" })}
                  />
                )}
                {filters.minRating && (
                  <FilterPill
                    label={`${filters.minRating}+ stars`}
                    icon="star"
                    onRemove={() => updateFilters({ minRating: "" })}
                  />
                )}
                {filters.languages.map((lang) => (
                  <FilterPill
                    key={lang}
                    label={lang}
                    icon="translate"
                    onRemove={() =>
                      updateFilters({
                        languages: filters.languages.filter((l) => l !== lang),
                      })
                    }
                  />
                ))}
                {filters.maxDistanceKm > 0 && (
                  <FilterPill
                    label={`Within ${filters.maxDistanceKm} km`}
                    icon="near_me"
                    onRemove={() => updateFilters({ maxDistanceKm: 0 })}
                  />
                )}
              </div>
            )}

            {/* ── Results Grid ────────────────────────────────────────────── */}
            {loading && page === 1 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PanditSkeleton key={i} />
                ))}
              </div>
            ) : pandits.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-primary text-4xl">
                    search_off
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  कोई Pandit ji नहीं मिले
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
                  Filters change करके देखें — किसी एक filter को हटाएँ या Reset करें।
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {pandits.map((pandit) => (
                    <PanditCard
                      key={pandit.id}
                      id={pandit.id}
                      name={pandit.name}
                      avatarUrl={pandit.avatarUrl}
                      isVerified={pandit.isVerified}
                      badges={pandit.badges}
                      overallRating={pandit.overallRating}
                      totalReviews={pandit.totalReviews}
                      distanceKm={pandit.distanceKm}
                      travelModes={pandit.travelModes}
                      onBook={handleBook}
                    />
                  ))}

                  {/* Inline skeleton when loading more */}
                  {loading &&
                    page > 1 &&
                    Array.from({ length: 2 }).map((_, i) => (
                      <PanditSkeleton key={`more-${i}`} />
                    ))}
                </div>

                {/* Load More */}
                {!loading && pandits.length < total && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="flex items-center gap-2 px-8 py-3 border-2 border-primary text-primary font-bold rounded-2xl hover:bg-primary hover:text-white transition-all text-sm"
                    >
                      <span>Load More Results</span>
                      <span className="material-symbols-outlined text-base">
                        expand_more
                      </span>
                    </button>
                  </div>
                )}

                {/* End of results */}
                {!loading && pandits.length >= total && pandits.length > 0 && (
                  <p className="text-center text-slate-400 dark:text-slate-600 text-xs mt-10">
                    — {total} pandit{total !== 1 ? "s" : ""} shown —
                  </p>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ── FilterPill ────────────────────────────────────────────────────────────

function FilterPill({
  label,
  icon,
  onRemove,
}: {
  label: string;
  icon: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold">
      <span className="material-symbols-outlined text-xs">{icon}</span>
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 p-0.5 rounded hover:bg-primary/20 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <span className="material-symbols-outlined text-xs">close</span>
      </button>
    </span>
  );
}
