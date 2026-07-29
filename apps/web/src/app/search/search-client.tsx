"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../context/auth-context";
import { LoginModal } from "../../components/LoginModal";
import { PanditRecordCard } from "../../../components/design/PanditRecordCard";
import { MoneyNote, NoReviewsNotice } from "../../../components/design/Verification";
import { GuestStrip, RealPricesNote } from "../../../components/design/GuestMode";
import type { PoojaVideoState } from "../../../components/design/Verification";
import { resolveApiBase } from "@hmarepanditji/utils";

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
  travelModes: {
    mode: string;
    price: number;
    label: string;
    duration: string;
  }[];
  specializations: string[];
  city: string;
  languages: string[];
  experienceYears: number;

  // New fields for enhanced card
  nextSlot?: string;
  willingToTravel?: boolean;
  description?: string;

  // ── 1c · अभिलेख (the record card) ──
  /** Roman transliteration as stored — never machine-generated here. */
  romanName?: string;
  /** THIS ONE POOJA's verification video, for the pooja being searched. */
  poojaVideo: PoojaVideoState;
  /** His rate. null → "दक्षिणा तय नहीं"; we never print a fabricated ₹0. */
  dakshina: number | null;
}

interface SearchFilters {
  // Existing
  ritual: string;
  city: string;
  date: string;
  minBudget: number;
  maxBudget: number;
  travel: string;
  minRating: string;
  languages: string[];
  sort: string;
  maxDistanceKm: number;
  userLat?: number;
  userLng?: number;

  // New
  searchAllIndia: boolean;
  regions: string[];
  experience: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

// THE THIRD VARIANT of the api-base bug, found on the live search screen
// 2026-07-29. This trusted the env var AS-IS and never appended the prefix.
// On Vercel the value is a bare ORIGIN, so every call went to
//   https://<api-host>/pandits   ->  404
// The 308 shim in app.ts covers `/pandits/*` (a trailing segment) but NOT
// bare `/pandits`, so nothing rescued it. The other two variants were
// DRIFT-A (append when the env already has it -> doubled) and DRIFT-B
// (hardcode /api/customers). resolveApiBase resolves all three shapes.
//
// This file lives under apps/web/src, which is NOT ROUTED — but it IS
// IMPORTED by apps/web/app/search/page.tsx and therefore shipped. "src is
// the dead tree" is true of ROUTES only; a file there is live the moment
// something in app/ imports it.
const API_URL = resolveApiBase(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NODE_ENV === "development",
).base;

const REGIONS = [
  "Varanasi (Kashi)",
  "Ujjain (Avantika)",
  "Haridwar & Rishikesh",
  "Prayagraj",
  "Mathura",
];

// ── API helpers ───────────────────────────────────────────────────────────────

function mapSortToApi(sort: string): string {
  const map: Record<string, string> = {
    "Best Match": "rating",
    Rating: "rating",
    "Price (Low → High)": "price_asc",
    "Price (High → Low)": "price_desc",
    Distance: "distance",
    Experience: "rating",
  };
  return map[sort] ?? "rating";
}

/**
 * @param searchedPooja the ritual the customer is searching for. The per-pooja
 *   video claim is a property of ONE pooja, so it can only be resolved with
 *   the pooja in hand — it is threaded in, never read off the pandit record.
 */
function mapPanditToResult(p: Record<string, unknown>, searchedPooja = ""): PanditResult {
  const prefs = (p.travelPreferences ?? {}) as Record<string, unknown>;
  const modes = (prefs.preferredModes ?? []) as string[];
  const travelModes = modes.map((mode) => ({
    mode,
    price: 0,
    label: mode.replace("_", "-"),
    duration: "",
  }));

  // ── दो सत्यापन, mapped from what the API actually knows ──
  // THE PERSON: identity is verified only at VERIFIED. (APPROVED is a legacy
  // spelling that still exists in the Prisma enum and is read, never written.)
  const identityVerified =
    p.verificationStatus === "VERIFIED" || p.verificationStatus === "APPROVED";

  // THIS ONE POOJA: a separate fact with a separate source. The profile carries
  // `pendingPoojaVerifications` — poojas added after signup that are awaiting
  // their own video review. A pooja in that list is PENDING. Otherwise we only
  // claim "verified" when the pandit himself is verified AND the pooja is one
  // he actually offers; anything else asserts nothing at all.
  // CORRECTED against the handler's actual allow-list (pandit.controller.ts:149).
  // This mapper previously read `pendingPoojaVerifications`, `baseDakshina`,
  // `dakshinaRates`, `romanName`, `distanceKm` and a top-level `name` — SIX
  // fields the search endpoint does not send. Every card therefore rendered
  // "Pandit Ji" with "दक्षिणा तय नहीं", for pandits who had set a real rate.
  // My own truthful-null card faithfully reported nothing, because the reads
  // were wrong. Same disease as the interfaces it was meant to improve on.
  //
  // What GET /pandits actually sends per row:
  //   user: { id, name }                     ← the name lives here
  //   pujaServices: [{ pujaType, dakshinaAmount, durationHours }]  ← the rate
  //   location, rating, totalReviews, experienceYears, specializations,
  //   languages, profilePhotoUrl, isOnline, verificationStatus,
  //   travelPreferences, completedBookings
  // It does NOT send per-pooja verification state or a distance.
  const services = (p.pujaServices as { pujaType?: string; dakshinaAmount?: number }[]) ?? [];

  // Per-pooja video state is NOT on this response, so the card asserts nothing
  // about it here. (It is available on the pandit's own profile endpoint; the
  // honest thing on a search row is silence, not a guess.)
  const poojaVideo: PoojaVideoState = "none";

  // His rate for the searched pooja, else his lowest listed rate. Never a zero.
  const forThisPooja = searchedPooja
    ? services.find((s) => s.pujaType === searchedPooja)?.dakshinaAmount
    : undefined;
  const anyRate = services
    .map((s) => s.dakshinaAmount)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n) && n > 0);
  const rawDakshina = forThisPooja ?? (anyRate.length ? Math.min(...anyRate) : undefined);
  const dakshina =
    typeof rawDakshina === "number" && Number.isFinite(rawDakshina) && rawDakshina > 0
      ? rawDakshina
      : null;

  const apiUser = (p.user as { name?: string } | undefined) ?? undefined;

  return {
    id: String(p.id),
    name: String(apiUser?.name ?? p.displayName ?? p.fullName ?? "Pandit Ji"),
    // the search response carries no transliteration and no distance; the card
    // omits both rows rather than inventing them
    romanName: undefined,
    poojaVideo,
    dakshina,
    distanceKm: undefined,
    avatarUrl: p.profilePhotoUrl as string | undefined,
    isVerified: identityVerified,
    badges: p.verificationStatus === "VERIFIED" ? ["Verified Vedic"] : [],
    overallRating: Number(p.rating) || 0,
    totalReviews: Number(p.totalReviews) || 0,
    city: String(p.location ?? ""),
    languages: (p.languages as string[]) ?? [],
    experienceYears: Number(p.experienceYears) || 0,
    specializations: (p.specializations as string[]) ?? [],
    travelModes:
      travelModes.length > 0
        ? travelModes
        : [{ mode: "SELF_DRIVE", price: 0, label: "SELF-DRIVE", duration: "" }],
    willingToTravel: Number(prefs.maxDistanceKm ?? 0) > 0,
    description: ((p.specializations as string[]) ?? []).join(", "),
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function fetchPandits(
  filters: SearchFilters,
  page = 1,
): Promise<{ pandits: PanditResult[]; pagination: PaginationInfo }> {
  const params = new URLSearchParams();
  if (filters.ritual) params.set("pujaType", filters.ritual);
  if (filters.city) params.set("city", filters.city);
  if (filters.date) params.set("date", filters.date);
  if (filters.minBudget > 0)
    params.set("minDakshina", String(filters.minBudget));
  if (filters.maxBudget < 50000)
    params.set("maxDakshina", String(filters.maxBudget));
  if (filters.travel) params.set("travelMode", filters.travel);
  if (filters.minRating) params.set("minRating", filters.minRating);
  if (filters.languages.length > 0)
    params.set("language", filters.languages[0]);
  if (filters.maxDistanceKm > 0 && filters.city)
    params.set("maxDistance", String(filters.maxDistanceKm));
  params.set("sort", mapSortToApi(filters.sort));
  params.set("page", String(page));
  params.set("limit", "10");

  const res = await fetch(`${API_URL}/pandits?${params.toString()}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("Failed to fetch pandits");
  const body = await res.json();
  const rawPandits: Record<string, unknown>[] = body.data?.pandits ?? [];
  return {
    pandits: rawPandits.map((p) => mapPanditToResult(p, filters.ritual)),
    pagination: body.data?.pagination ?? {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
  };
}

// ── Components ─────────────────────────────────────────────────────────────

function EnhancedPanditCard({
  pandit,
  onBook,
}: {
  pandit: PanditResult;
  onBook: (id: string) => void;
}) {
  const router = useRouter();

  return (
    <div className="group flex flex-col gap-6 rounded-xl border border-slate-100 bg-white p-5 transition-all hover:shadow-lg md:flex-row dark:border-white/10 dark:bg-[#1a140d]/80">
      {/* Image */}
      <div className="relative h-48 w-full flex-shrink-0 overflow-hidden rounded-lg bg-slate-200 md:w-48">
        {pandit.avatarUrl ? (
          <Image
            src={pandit.avatarUrl}
            alt={pandit.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#f2a20d]/10 text-[#f2a20d]">
            <span className="material-symbols-outlined text-4xl">person</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {pandit.name}
              </h3>
              {pandit.isVerified && (
                <span
                  className="material-symbols-outlined text-lg text-blue-500"
                  title="Verified"
                >
                  verified
                </span>
              )}
            </div>
            <p className="mb-3 text-lg text-slate-600 dark:text-slate-400">
              {pandit.specializations[0] ? "Ritual Specialist" : "Scholar"} from{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {pandit.city}
              </span>
            </p>
          </div>
          <div className="text-right">
            <div className="mb-1 flex items-center justify-end text-[#f2a20d]">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="material-symbols-outlined text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              ))}
              <span className="ml-2 font-bold text-slate-900 dark:text-white">
                {pandit.overallRating}
              </span>
            </div>
            <span className="text-base text-slate-500">
              ({pandit.totalReviews} reviews)
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mb-4 mt-2 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-lg text-slate-600 dark:text-slate-400">
            <span className="material-symbols-outlined text-lg">school</span>
            <span>{pandit.experienceYears}+ Years Exp</span>
          </div>
          <div className="flex items-center gap-2 text-lg text-slate-600 dark:text-slate-400">
            <span className="material-symbols-outlined text-lg">
              calendar_month
            </span>
            <span>Next: {pandit.nextSlot}</span>
          </div>
        </div>

        {/* Travel Tabs */}
        <div className="mt-auto border-t border-slate-100 pt-4 dark:border-white/10">
          <div className="mb-4 flex gap-4 border-b border-slate-50 text-base font-bold text-slate-400 dark:border-white/5">
            {pandit.travelModes.map((t, idx) => (
              <button
                key={t.mode}
                className={`flex min-w-[60px] flex-col items-center gap-1 border-b-2 pb-2 ${idx === 0 ? "border-[#f2a20d] text-[#f2a20d]" : "border-transparent hover:text-slate-600"}`}
              >
                <span>{t.label}</span>
                <span
                  className={`text-lg ${idx === 0 ? "font-black" : "font-medium"}`}
                >
                  ₹{(t.price / 1000).toFixed(0)}k
                </span>
              </button>
            ))}
            {/* Fallback mock tabs if only 1 mode */}
            {pandit.travelModes.length === 1 && (
              <>
                <button className="flex min-w-[60px] cursor-not-allowed flex-col items-center gap-1 border-b-2 border-transparent pb-2 opacity-50 hover:text-slate-600">
                  <span>TRAIN</span>
                  <span className="text-lg">--</span>
                </button>
                <button className="flex min-w-[60px] cursor-not-allowed flex-col items-center gap-1 border-b-2 border-transparent pb-2 opacity-50 hover:text-slate-600">
                  <span>FLIGHT</span>
                  <span className="text-lg">--</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="max-w-[200px] text-base leading-tight text-slate-500">
              <p>
                {pandit.travelModes[0]?.label === "SELF-DRIVE"
                  ? "Self-drive includes fuel & tolls."
                  : "Includes tickets & airport transfer."}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/pandit/${pandit.id}`)}
                className="rounded-lg border border-[#f2a20d] px-5 py-2 text-base font-bold text-[#f2a20d] transition-colors hover:bg-[#f2a20d]/5"
              >
                Profile
              </button>
              <button
                onClick={() => onBook(pandit.id)}
                className="rounded-lg bg-[#f2a20d] px-5 py-2 text-lg font-bold text-white shadow-md transition-colors hover:bg-[#f2a20d]/90"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  filters,
  onChange,
  onReset,
  onApply,
}: {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  onReset: () => void;
  onApply?: () => void;
}) {
  return (
    <aside className="w-full flex-shrink-0 space-y-6 lg:w-72">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a140d]">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Filters
          </h3>
          <button
            onClick={onReset}
            className="text-base font-bold uppercase tracking-wider text-[#f2a20d] hover:underline"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-6">
          {/* Search All India Toggle */}
          <div
            className={`rounded-lg border p-4 transition-all duration-300 ${filters.searchAllIndia ? "border-[#f2a20d]/30 bg-[#f2a20d]/10 shadow-[0_0_15px_rgba(242,162,13,0.4)]" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-[#f2a20d]">
                  Search All India
                </span>
                <span className="text-base text-slate-500">
                  Broaden your search
                </span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={filters.searchAllIndia}
                  onChange={(e) =>
                    onChange({ searchAllIndia: e.target.checked })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#f2a20d] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-gray-600 dark:bg-slate-700"></div>
              </label>
            </div>
          </div>

          {/* Regions */}
          <div
            className={
              !filters.searchAllIndia
                ? "pointer-events-none opacity-50 grayscale transition-all"
                : "transition-all"
            }
          >
            <h4 className="mb-3 text-base font-bold uppercase tracking-widest text-slate-400">
              Regions Coverage
            </h4>
            <div className="space-y-2">
              {REGIONS.map((region) => (
                <label
                  key={region}
                  className="group flex cursor-pointer items-center gap-3"
                >
                  <input
                    type="checkbox"
                    checked={filters.regions.includes(region)}
                    onChange={(e) => {
                      const newRegions = e.target.checked
                        ? [...filters.regions, region]
                        : filters.regions.filter((r) => r !== region);
                      onChange({ regions: newRegions });
                    }}
                    className="h-5 w-5 rounded border-slate-300 bg-white text-[#f2a20d] focus:ring-[#f2a20d] dark:bg-white/5"
                  />
                  <span className="text-lg text-slate-700 transition-colors group-hover:text-[#f2a20d] dark:text-slate-300">
                    {region}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 dark:border-white/10">
            <h4 className="mb-3 text-base font-bold uppercase tracking-widest text-slate-400">
              Experience
            </h4>
            <div className="space-y-2">
              {["15+ Years", "10+ Years", "5+ Years"].map((exp) => (
                <label
                  key={exp}
                  className="group flex cursor-pointer items-center gap-3"
                >
                  <input
                    type="radio"
                    name="exp"
                    checked={filters.experience === exp}
                    onChange={() => onChange({ experience: exp })}
                    className="bg-white text-[#f2a20d] focus:ring-[#f2a20d] dark:bg-white/5"
                  />
                  <span className="text-lg text-slate-700 transition-colors group-hover:text-[#f2a20d] dark:text-slate-300">
                    {exp}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={onApply}
            className="w-full rounded-lg bg-[#f2a20d] py-3 text-lg font-bold text-white shadow-md transition-all hover:bg-[#f2a20d]/90 active:scale-95"
          >
            Update Results
          </button>
        </div>
      </div>

      {/* Upcoming Events Banner */}
      <div className="relative flex h-48 items-end overflow-hidden rounded-xl bg-[#111827] p-5 text-white">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-gray-900 to-transparent"></div>
          {/* Pattern placeholder */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
        </div>
        <div className="relative z-20">
          <p className="mb-1 text-base font-medium text-[#f2a20d]">
            Upcoming Events
          </p>
          <h4 className="text-xl font-bold leading-tight">
            Ganga Aarti Special
            <br />
            Varanasi
          </h4>
        </div>
      </div>
    </aside>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────

export default function SearchClient({
  initialParams,
}: {
  initialParams: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");

  const handleBook = (id: string) => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setRedirectUrl(`/booking/new?panditId=${id}`);
      setLoginModalOpen(true);
    } else {
      router.push(`/booking/new?panditId=${id}`);
    }
  };

  const defaultFilters = (
    params: Record<string, string | undefined>,
  ): SearchFilters => ({
    ritual: params.ritual || "",
    city: params.city || "",
    date: params.date || "",
    minBudget: Number(params.minBudget) || 0,
    maxBudget: Number(params.maxBudget) || 50000,
    travel: params.travel || "",
    minRating: params.minRating || "",
    languages: params.languages ? params.languages.split(",") : [],
    sort: params.sort || "Best Match",
    maxDistanceKm: Number(params.maxDistanceKm) || 50,
    searchAllIndia: params.searchAllIndia === "true",
    regions: params.regions
      ? params.regions.split(",")
      : ["Varanasi (Kashi)", "Ujjain (Avantika)"],
    experience: params.experience || "10+ Years",
  });

  const [filters, setFilters] = useState<SearchFilters>(() =>
    defaultFilters(initialParams),
  );
  const [pandits, setPandits] = useState<PanditResult[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const search = useCallback(async (searchFilters: SearchFilters, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPandits(searchFilters, page);
      setPandits(result.pandits);
      setPagination(result.pagination);
    } catch (err) {
      setError("Failed to load pandits. Please try again.");
      setPandits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    search(filters, 1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilters = (patch: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const resetFilters = () => {
    const fresh = defaultFilters({});
    setFilters(fresh);
    search(fresh, 1);
  };

  const applyFilters = () => search(filters, 1);

  const loadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchPandits(filters, pagination.page + 1).then((result) => {
        setPandits((prev) => [...prev, ...result.pandits]);
        setPagination(result.pagination);
      }).catch((err) => console.error('Failed to load more pandits:', err));
    }
  };

  const location = filters.city || "Delhi";

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#221c10]">
      {/* Mobile Filter Toggle */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white p-4 lg:hidden dark:bg-[#1a140d]">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"
        >
          <span className="material-symbols-outlined">filter_list</span> Filters
        </button>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 top-0 w-80 overflow-y-auto bg-white p-4 dark:bg-[#1a140d]"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              filters={filters}
              onChange={updateFilters}
              onReset={resetFilters}
              onApply={() => {
                setSidebarOpen(false);
                applyFilters();
              }}
            />
          </div>
        </div>
      )}

      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-8 p-4 lg:flex-row lg:p-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            filters={filters}
            onChange={updateFilters}
            onReset={resetFilters}
            onApply={applyFilters}
          />
        </div>

        {/* Main Content */}
        <section className="flex-1">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              {/* Screen header, per the design: the pooja in the serif, the
                  occasion beneath it as a micro label. */}
              <div>
                <h1 className="font-devanagari text-[18px] font-semibold leading-[1.2] text-ink">
                  {filters.ritual || "पंडित जी"}
                  {loading && (
                    <span className="ml-3 text-[13px] font-normal text-muted">
                      Loading…
                    </span>
                  )}
                </h1>
                {/* TRUTH FIX: this used to read "{total} verified pandits" —
                    it called EVERY result verified regardless of its
                    verificationStatus, so an unverified pandit in the list was
                    counted as vetted in the headline above his own "पहचान जाँच
                    बाकी" row. The count of results is not a count of
                    verifications; only the per-card identity row may make that
                    claim. */}
                <p className="micro-label mt-1">
                  {!loading && `${pagination.total} पंडित जी`}
                  {filters.city && <> · {location}</>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg text-slate-500">Sort by:</span>
                <select
                  value={filters.sort}
                  onChange={(e) => {
                    updateFilters({ sort: e.target.value });
                  }}
                  className="rounded-lg border-slate-200 bg-white text-lg font-medium text-slate-900 focus:border-[#f2a20d] focus:ring-[#f2a20d] dark:border-white/10 dark:bg-[#1a140d] dark:text-white"
                >
                  <option>Best Match</option>
                  <option>Rating</option>
                  <option>Price (Low → High)</option>
                  <option>Price (High → Low)</option>
                  {filters.city && <option>Distance</option>}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.searchAllIndia && (
                <span className="inline-flex items-center rounded-full border border-[#f2a20d]/20 bg-[#f2a20d]/10 px-5 py-3 text-base font-bold text-[#f2a20d]">
                  <span className="material-symbols-outlined mr-1 text-lg">
                    check_circle
                  </span>{" "}
                  Search All India: ON
                </span>
              )}
              {filters.ritual && (
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-5 py-3 text-base font-bold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  <span className="material-symbols-outlined mr-1 text-lg">
                    auto_stories
                  </span>{" "}
                  {filters.ritual}
                </span>
              )}
              {filters.date && (
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-5 py-3 text-base font-bold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  <span className="material-symbols-outlined mr-1 text-lg">
                    calendar_month
                  </span>{" "}
                  {filters.date}
                </span>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-lg text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
                <button
                  onClick={applyFilters}
                  className="ml-4 font-bold underline"
                >
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-48 animate-pulse rounded-xl border border-slate-100 bg-white p-5 dark:border-white/10 dark:bg-[#1a140d]/80"
                  />
                ))}
              </div>
            ) : pandits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined mb-3 text-5xl text-slate-300">
                  search_off
                </span>
                <p className="font-semibold text-slate-500">No pandits found</p>
                <p className="mt-1 text-lg text-slate-400">
                  Try adjusting your filters or search all India
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 text-lg font-bold text-[#f2a20d] hover:underline"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              // 1c · अभिलेख — the record. 12px between cards (the doc's rhythm),
              // not the old 24px grid gap.
              <div className="flex flex-col gap-3">
                {/* अतिथि · guest mode, 2a — a mode you are in, sitting with the
                    search context. Says what he CAN do; the paywall is at
                    commitment, not at the door. Shown only to a guest: telling
                    a signed-in customer he may browse freely is noise. */}
                {!isAuthenticated && !authLoading && <GuestStrip placement="header" />}
                <div className="flex items-center justify-between gap-3">
                  <div className="micro-label">{pandits.length} पंडित जी उपलब्ध</div>
                  <RealPricesNote />
                </div>
                {pandits.map((pandit) => (
                  <PanditRecordCard
                    key={pandit.id}
                    pandit={{
                      id: pandit.id,
                      name: pandit.name,
                      romanName: pandit.romanName,
                      photoUrl: pandit.avatarUrl,
                      identityVerified: pandit.isVerified,
                      poojaVideo: pandit.poojaVideo,
                      experienceYears: pandit.experienceYears,
                      city: pandit.city,
                      distanceKm: pandit.distanceKm,
                      dakshina: pandit.dakshina,
                    }}
                    onOpenProfile={() => router.push(`/pandit/${pandit.id}`)}
                    onWatchVideo={() => router.push(`/pandit/${pandit.id}#video`)}
                  />
                ))}
                {/* Trust with zero reviews, substitute 4: admitting what is
                    missing. The honest absence proves the ticks above are not
                    decorative. */}
                <NoReviewsNotice />
                <MoneyNote />
              </div>
            )}

            {!loading && pagination.page < pagination.totalPages && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={loadMore}
                  className="rounded-lg border border-slate-200 bg-white px-8 py-3 text-lg font-bold text-slate-900 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-[#1a140d] dark:text-white dark:hover:bg-white/5"
                >
                  Load More ({pagination.total - pandits.length} more)
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        redirectAfterLogin={redirectUrl}
      />
    </div>
  );
}
