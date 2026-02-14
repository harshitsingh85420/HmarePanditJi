"use client";

import React, {
  useState,
  useEffect,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

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
  travelModes: { mode: string; price: number; label: string; duration: string }[];
  specializations: string[];
  city: string;
  languages: string[];
  experienceYears: number;

  // New fields for enhanced card
  nextSlot?: string;
  willingToTravel?: boolean;
  description?: string;
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

const REGIONS = [
  "Varanasi (Kashi)",
  "Ujjain (Avantika)",
  "Haridwar & Rishikesh",
  "Prayagraj",
  "Mathura",
];

// ── Mock data (updated with Travel Tabs data) ────────────────────────────────

const MOCK_PANDITS: PanditResult[] = [
  {
    id: "p1",
    name: "Acharya Ved Vyas",
    isVerified: true,
    badges: ["Verified Vedic"],
    overallRating: 4.9,
    totalReviews: 128,
    distanceKm: 800,
    city: "Varanasi",
    languages: ["Hindi", "Sanskrit"],
    experienceYears: 22,
    specializations: ["Mahamrityunjay Path", "Griha Pravesh"],
    travelModes: [
      { mode: "SELF_DRIVE", price: 3400, label: "SELF-DRIVE", duration: "12h 30m" },
    ],
    nextSlot: "Tomorrow",
    willingToTravel: true,
    description: "Specializes in Mahamrityunjay Path and Griha Pravesh."
  },
  {
    id: "p2",
    name: "Pandit Rajesh Shastri",
    isVerified: true,
    badges: ["Verified Vedic"],
    overallRating: 4.7,
    totalReviews: 94,
    distanceKm: 750,
    city: "Ujjain",
    languages: ["Hindi", "Sanskrit"],
    experienceYears: 16,
    specializations: ["Kal Sarp Dosh Puja", "Mangal Dosh Nivaran"],
    travelModes: [
      { mode: "SELF_DRIVE", price: 2800, label: "SELF-DRIVE", duration: "10h 15m" },
    ],
    nextSlot: "Oct 12",
    willingToTravel: true,
    description: "Expert in Kal Sarp Dosh Puja and Mangal Dosh Nivaran."
  },
  {
    id: "p3",
    name: "Shastri Anand Maharaj",
    isVerified: true,
    badges: ["Verified Vedic"],
    overallRating: 5.0,
    totalReviews: 215,
    distanceKm: 220,
    city: "Haridwar",
    languages: ["Hindi", "Sanskrit", "English"],
    experienceYears: 30,
    specializations: ["Vedic Astrology", "Satyanarayan Katha"],
    travelModes: [
      { mode: "SELF_DRIVE", price: 2100, label: "SELF-DRIVE", duration: "5h 30m" },
    ],
    nextSlot: "Oct 10",
    willingToTravel: true,
    description: "Master of Vedic Astrology and Satyanarayan Katha."
  },
];

// ── Components ─────────────────────────────────────────────────────────────

function EnhancedPanditCard({ pandit }: { pandit: PanditResult }) {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-[#1a140d]/80 rounded-xl border border-slate-100 dark:border-white/10 p-5 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-all group">
      {/* Image */}
      <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0 relative">
        {pandit.avatarUrl ? (
          <Image
            src={pandit.avatarUrl}
            alt={pandit.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#f2a20d]/10 text-[#f2a20d]">
            <span className="material-symbols-outlined text-4xl">person</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{pandit.name}</h3>
              {pandit.isVerified && (
                <span className="material-symbols-outlined text-blue-500 text-lg" title="Verified">verified</span>
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
              {pandit.specializations[0] ? "Ritual Specialist" : "Scholar"} from <span className="font-bold text-slate-900 dark:text-white">{pandit.city}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end text-[#f2a20d] mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="material-symbols-outlined text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              ))}
              <span className="ml-2 font-bold text-slate-900 dark:text-white">{pandit.overallRating}</span>
            </div>
            <span className="text-xs text-slate-500">({pandit.totalReviews} reviews)</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mt-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="material-symbols-outlined text-lg">school</span>
            <span>{pandit.experienceYears}+ Years Exp</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="material-symbols-outlined text-lg">calendar_month</span>
            <span>Next: {pandit.nextSlot}</span>
          </div>
        </div>

        {/* Travel Tabs */}
        <div className="mt-auto border-t border-slate-100 dark:border-white/10 pt-4">
          <div className="flex gap-4 text-xs font-bold text-slate-400 border-b border-slate-50 dark:border-white/5 mb-4">
            {pandit.travelModes.map((t, idx) => (
              <button
                key={t.mode}
                className={`pb-2 border-b-2 flex flex-col items-center gap-1 min-w-[60px] ${idx === 0 ? 'border-[#f2a20d] text-[#f2a20d]' : 'border-transparent hover:text-slate-600'}`}
              >
                <span>{t.label}</span>
                <span className={`text-sm ${idx === 0 ? 'font-black' : 'font-medium'}`}>₹{(t.price / 1000).toFixed(0)}k</span>
              </button>
            ))}
            {/* Fallback mock tabs if only 1 mode */}
            {pandit.travelModes.length === 1 && (
              <>
                <button className="pb-2 border-b-2 border-transparent hover:text-slate-600 flex flex-col items-center gap-1 min-w-[60px] opacity-50 cursor-not-allowed">
                  <span>TRAIN</span>
                  <span className="text-sm">--</span>
                </button>
                <button className="pb-2 border-b-2 border-transparent hover:text-slate-600 flex flex-col items-center gap-1 min-w-[60px] opacity-50 cursor-not-allowed">
                  <span>FLIGHT</span>
                  <span className="text-sm">--</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="text-xs text-slate-500 leading-tight max-w-[200px]">
              <p>{pandit.travelModes[0]?.label === "SELF-DRIVE" ? "Self-drive includes fuel & tolls." : "Includes tickets & airport transfer."}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/pandits/${pandit.id}`)}
                className="px-3 py-2 text-xs font-bold text-[#f2a20d] border border-[#f2a20d] rounded-lg hover:bg-[#f2a20d]/5 transition-colors"
              >
                Profile
              </button>
              <button
                onClick={() => router.push(`/book?panditId=${pandit.id}`)}
                className="px-5 py-2 text-sm font-bold text-white bg-[#f2a20d] rounded-lg shadow-md hover:bg-[#f2a20d]/90 transition-colors"
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

function Sidebar({ filters, onChange, onReset }: { filters: SearchFilters; onChange: (patch: Partial<SearchFilters>) => void; onReset: () => void; }) {
  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
      <div className="bg-white dark:bg-[#1a140d] rounded-xl p-5 border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Filters</h3>
          <button onClick={onReset} className="text-[#f2a20d] text-xs font-bold uppercase tracking-wider hover:underline">Clear All</button>
        </div>

        <div className="space-y-6">
          {/* Search All India Toggle */}
          <div className={`border rounded-lg p-4 transition-all duration-300 ${filters.searchAllIndia ? "bg-[#f2a20d]/10 border-[#f2a20d]/30 shadow-[0_0_15px_rgba(242,162,13,0.4)]" : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10"}`}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#f2a20d]">Search All India</span>
                <span className="text-xs text-slate-500">Broaden your search</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.searchAllIndia}
                  onChange={(e) => onChange({ searchAllIndia: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#f2a20d]"></div>
              </label>
            </div>
          </div>

          {/* Regions */}
          <div className={!filters.searchAllIndia ? "opacity-50 pointer-events-none grayscale transition-all" : "transition-all"}>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Regions Coverage</h4>
            <div className="space-y-2">
              {REGIONS.map((region) => (
                <label key={region} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.regions.includes(region)}
                    onChange={(e) => {
                      const newRegions = e.target.checked
                        ? [...filters.regions, region]
                        : filters.regions.filter(r => r !== region);
                      onChange({ regions: newRegions });
                    }}
                    className="rounded border-slate-300 text-[#f2a20d] focus:ring-[#f2a20d] h-5 w-5 bg-white dark:bg-white/5"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-[#f2a20d] transition-colors">{region}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/10">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Experience</h4>
            <div className="space-y-2">
              {["15+ Years", "10+ Years", "5+ Years"].map((exp) => (
                <label key={exp} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="exp"
                    checked={filters.experience === exp}
                    onChange={() => onChange({ experience: exp })}
                    className="text-[#f2a20d] focus:ring-[#f2a20d] bg-white dark:bg-white/5"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-[#f2a20d] transition-colors">{exp}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="w-full bg-[#f2a20d] text-white py-3 rounded-lg font-bold text-sm shadow-md hover:bg-[#f2a20d]/90 active:scale-95 transition-all">
            Update Results
          </button>
        </div>
      </div>

      {/* Upcoming Events Banner */}
      <div className="bg-[#111827] text-white rounded-xl p-5 relative overflow-hidden h-48 flex items-end">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10"></div>
          {/* Pattern placeholder */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
        </div>
        <div className="relative z-20">
          <p className="text-xs font-medium text-[#f2a20d] mb-1">Upcoming Events</p>
          <h4 className="font-bold leading-tight text-xl">Ganga Aarti Special<br />Varanasi</h4>
        </div>
      </div>
    </aside>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────

export default function SearchClient({ initialParams }: { initialParams: Record<string, string | undefined> }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL
  const defaultFilters = (params: Record<string, string | undefined>): SearchFilters => ({
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
    regions: params.regions ? params.regions.split(",") : ["Varanasi (Kashi)", "Ujjain (Avantika)"],
    experience: params.experience || "10+ Years",
  });

  const [filters, setFilters] = useState<SearchFilters>(() => defaultFilters(initialParams));
  const [pandits] = useState<PanditResult[]>(MOCK_PANDITS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const updateFilters = (patch: Partial<SearchFilters>) => {
    setFilters(prev => {
      // Serialize to URL logic would go here
      return { ...prev, ...patch };
    });
  };

  const resetFilters = () => {
    // Reset logic
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#221c10]">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden sticky top-16 z-30 bg-white dark:bg-[#1a140d] border-b border-slate-200 p-4">
        <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
          <span className="material-symbols-outlined">filter_list</span> Filters
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/50" onClick={() => setSidebarOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-[#1a140d] overflow-y-auto p-4" onClick={e => e.stopPropagation()}>
            <Sidebar filters={filters} onChange={updateFilters} onReset={resetFilters} />
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-8 p-4 lg:p-8 relative">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar filters={filters} onChange={updateFilters} onReset={resetFilters} />
        </div>

        {/* Main Content */}
        <section className="flex-1">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Top-tier Pandits in India</h1>
                <p className="text-slate-500 text-sm mt-1">Showing verified scholars willing to travel to <span className="text-[#f2a20d] font-bold">Delhi</span></p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Sort by:</span>
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="bg-white dark:bg-[#1a140d] border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium focus:ring-[#f2a20d] focus:border-[#f2a20d] text-slate-900 dark:text-white"
                >
                  <option>Best Match</option>
                  <option>Rating</option>
                  <option>Experience</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.searchAllIndia && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#f2a20d]/10 text-[#f2a20d] text-xs font-bold border border-[#f2a20d]/20">
                  <span className="material-symbols-outlined text-sm mr-1">check_circle</span> Search All India: ON
                </span>
              )}
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-white/10">
                <span className="material-symbols-outlined text-sm mr-1">flight_takeoff</span> Willing to Travel
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-white/10">
                <span className="material-symbols-outlined text-sm mr-1">star</span> Rating 4.8+
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {pandits.map((pandit) => (
                <EnhancedPanditCard key={pandit.id} pandit={pandit} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button className="bg-white dark:bg-[#1a140d] border border-slate-200 dark:border-white/10 px-8 py-3 rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white transition-colors">
                Load More Experts
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
