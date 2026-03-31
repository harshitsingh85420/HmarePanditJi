"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------
const SUPPORTED_PUJA_TYPES = [
  "Vivah", "Griha Pravesh", "Satyanarayan Puja", "Mundan",
  "Namkaran", "Annaprashan", "Upanayana", "Shradh", "Havan",
  "Navratri Puja", "Ganesh Puja", "Durga Puja",
];

const SUPPORTED_CITIES = [
  "Delhi", "Noida", "Gurgaon", "Faridabad", "Ghaziabad",
  "Greater Noida", "Mathura", "Agra", "Jaipur", "Haridwar",
  "Varanasi", "Lucknow", "Mumbai", "Pune", "Bangalore",
];

const PUJA_CATEGORIES = [
  { emoji: "💍", label: "Vivah", sub: "Wedding" },
  { emoji: "🏠", label: "Griha Pravesh", sub: "Housewarming" },
  { emoji: "🕉", label: "Satyanarayan Puja", sub: "Puja" },
  { emoji: "👶", label: "Mundan", sub: "Ceremony" },
  { emoji: "🔥", label: "Havan", sub: "Sacred Fire" },
  { emoji: "📿", label: "", sub: "View All" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const TUTORIAL_SLIDES = [
  "Explore all pujas without registration.",
  "Check muhurat dates instantly on Muhurat Explorer.",
  "Book with verified Pandits from Delhi-NCR and nationwide.",
  "Manage travel, food, samagri — all in one place.",
  "Guest Mode — no need to register until you book.",
];
const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1`;

// ---------------------------------------------------------------------------
// QUICK SEARCH BAR
function QuickSearchBar() {
  const router = useRouter();
  const [pujaType, setPujaType] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
    if (pujaType) params.set("pujaType", pujaType);
    if (city) params.set("city", city);
    if (date) params.set("date", date);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-2 flex flex-col md:flex-row gap-4 items-center max-w-2xl mx-auto mt-8 border border-amber-100 dark:border-zinc-800">
      <div className="flex-1 flex items-center relative border-b md:border-b-0 md:border-r border-gray-100 dark:border-zinc-800 w-full pl-4">
        <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-[#8a7960] dark:text-gray-400 z-10 text-xl font-bold">search</span>
        <input
          type="text"
          placeholder="Search for Pandits, Pujas, or Muhurats..."
          className="w-full border-none focus:ring-0 bg-transparent text-sm py-4 text-gray-800 dark:text-gray-200 pl-14 pr-4 font-medium placeholder:font-normal placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center gap-3 px-4 w-full md:w-auto shrink-0 pb-2 md:pb-0 justify-between md:justify-end">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Search All India</span>
          <button
            className="w-10 h-6 rounded-full bg-primary/20 relative cursor-pointer border-transparent ring-2 ring-primary/20 hover:bg-primary/30 transition-colors"
          >
            <div className="w-4 h-4 rounded-full bg-primary absolute left-1 top-1 shadow-sm"></div>
          </button>
        </div>
        <button
          onClick={handleSearch}
          className="bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-8 rounded-lg text-sm transition-all shadow-md active:scale-95"
        >
          Explore Now
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MUHURAT CALENDAR WIDGET
// ---------------------------------------------------------------------------
interface MuhuratDate {
  date: string;
  count: number;
  pujaTypes: string[];
}

function MuhuratWidget() {
  const [muhuratDates, setMuhuratDates] = useState<MuhuratDate[]>([]);
  const [upcomingDates, setUpcomingDates] = useState<{ date: string; pujaType: string; timeWindow: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const todayStr = `${year}-${String(month).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    async function fetchData() {
      try {
        const [datesRes, upcomingRes] = await Promise.all([
          fetch(`${API_BASE}/muhurat/dates?month=${month}&year=${year}`),
          fetch(`${API_BASE}/muhurat/upcoming?limit=3`),
        ]);
        if (datesRes.ok) {
          const d = await datesRes.json();
          setMuhuratDates(d.data?.dates || []);
        }
        if (upcomingRes.ok) {
          const u = await upcomingRes.json();
          setUpcomingDates(u.data?.dates || []);
        }
      } catch { }
      setLoading(false);
    }
    fetchData();
  }, [month, year]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const calendarCells: (string | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(`${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }

  const muhuratMap = muhuratDates.reduce<Record<string, MuhuratDate>>((acc, m) => {
    acc[m.date] = m;
    return acc;
  }, {});

  return (
    <section className="py-16 bg-amber-50/40">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">📅 Muhurat Explorer</h2>
          <p className="text-gray-600">Find Auspicious Dates — Click any highlighted date to see available pujas</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-amber-100 overflow-hidden">
          <div className="bg-amber-500 text-white px-6 py-4 text-center font-bold text-lg">
            {MONTHS[month - 1]} {year}
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
            {DAYS.map((d, i) => (
              <div key={i} className="py-2 text-center text-xs font-bold text-gray-500 uppercase">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-400">
              Loading calendar...
            </div>
          ) : (
            <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
              {calendarCells.map((dateStr, i) => {
                if (!dateStr) return <div key={`e-${i}`} className="min-h-[52px] bg-gray-50/50" />;

                const m = muhuratMap[dateStr];
                const hasMuhurat = m && m.count > 0;
                const isToday = dateStr === todayStr;
                const isPast = dateStr < todayStr;
                const day = parseInt(dateStr.split("-")[2], 10);

                const cell = (
                  <div className={`min-h-[52px] p-1.5 relative transition-colors ${isPast ? "opacity-50 cursor-default" :
                    hasMuhurat ? "hover:bg-amber-50 cursor-pointer" : "cursor-default"
                    }`}>
                    <span className={`text-xs font-medium flex items-center justify-center w-6 h-6 rounded-full ${isToday ? "ring-2 ring-blue-500 text-blue-700 font-bold" :
                      isPast ? "text-gray-400" : "text-gray-700"
                      }`}>
                      {day}
                    </span>
                    {hasMuhurat && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 inline-flex items-center px-1 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
                        🔶 {m.count}
                      </span>
                    )}
                  </div>
                );

                if (hasMuhurat && !isPast) {
                  return (
                    <Link key={dateStr} href={`/muhurat?date=${dateStr}`}>
                      {cell}
                    </Link>
                  );
                }
                return <div key={dateStr}>{cell}</div>;
              })}
            </div>
          )}
        </div>

        <div className="mt-4 text-right">
          <Link href="/muhurat" className="text-sm font-semibold text-primary hover:underline">
            View Full Muhurat Calendar →
          </Link>
        </div>

        {/* Upcoming dates */}
        {upcomingDates.length > 0 && (
          <div className="mt-6 space-y-2">
            {upcomingDates.map((u, i) => (
              <div key={i} className="bg-white rounded-lg px-4 py-3 border border-amber-100 flex items-center gap-3 text-sm">
                <span className="text-amber-500 font-bold">📅</span>
                <span className="text-gray-800 font-medium">
                  {new Date(u.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-700">{u.pujaType}</span>
                <span className="text-gray-500">·</span>
                <span className="text-amber-700 font-medium">{u.timeWindow}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// FEATURED PANDITS
// ---------------------------------------------------------------------------
interface Pandit {
  id: string;
  name: string;
  profilePhotoUrl?: string;
  rating: number;
  totalReviews: number;
  location: string;
  specializations: string[];
  experienceYears: number;
}

function FeaturedPanditsSection() {
  const [pandits, setPandits] = useState<Pandit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/pandits?sort=rating&limit=6&verificationStatus=VERIFIED`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.data?.pandits) setPandits(d.data.pandits);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">⭐ Highly Rated Pandits</h2>
            <p className="text-gray-600 mt-1">Verified experts ready to travel anywhere</p>
          </div>
          <Link
            href="/search"
            className="hidden sm:inline-flex items-center text-primary font-semibold text-sm hover:underline"
          >
            View All Pandits →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : pandits.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg mb-2">No verified pandits yet</p>
            <p className="text-gray-400 text-sm">Run database seed to populate pandit data</p>
            <Link href="/search" className="mt-4 inline-block text-primary font-semibold hover:underline">
              Browse All Pandits →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pandits.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">
                    {p.profilePhotoUrl ? (
                      <img src={p.profilePhotoUrl} alt={p.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      p.name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 truncate">Pt. {p.name}</h3>
                      <span className="text-green-600 text-xs">✅</span>
                    </div>
                    <p className="text-xs text-gray-500">{p.location} · {p.experienceYears}yr exp</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500 text-sm">⭐</span>
                      <span className="text-sm font-bold text-gray-800">{p.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({p.totalReviews})</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-1 mb-4">
                    {p.specializations.slice(0, 3).map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/pandit/${p.id}`}
                      className="flex-1 text-center py-2 border border-primary text-primary text-sm font-bold rounded-btn hover:bg-primary hover:text-white transition-all"
                    >
                      View Profile
                    </Link>
                    <Link
                      href={`/login`}
                      className="flex-1 text-center py-2 bg-primary text-white text-sm font-bold rounded-btn hover:bg-primary/90 transition-all"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link href="/search" className="inline-flex items-center text-primary font-semibold hover:underline">
            View All Pandits →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------------------------
export default function HomePage() {
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<"en" | "hi" | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialIndex, setTutorialIndex] = useState(0);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("hpj_language");
    const tutorialSeen = localStorage.getItem("hpj_tutorial_seen") === "1";
    const locationPrompted = localStorage.getItem("hpj_location_prompted") === "1";

    if (!savedLanguage) {
      setShowLanguageModal(true);
      return;
    }

    setLanguage(savedLanguage === "hi" ? "hi" : "en");

    if (!tutorialSeen || searchParams?.get("tutorial") === "1") {
      setShowTutorial(true);
      setTutorialIndex(0);
    }

    if (!locationPrompted) {
      setShowLocationPrompt(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const openTutorial = () => {
      setShowTutorial(true);
      setTutorialIndex(0);
    };
    window.addEventListener("hpj-open-tutorial", openTutorial);
    return () => window.removeEventListener("hpj-open-tutorial", openTutorial);
  }, []);

  function handleLanguageSelect(nextLanguage: "en" | "hi") {
    localStorage.setItem("hpj_language", nextLanguage);
    setLanguage(nextLanguage);
    setShowLanguageModal(false);
    setShowTutorial(true);
    setTutorialIndex(0);
  }

  function closeTutorial(markSeen: boolean) {
    if (markSeen) {
      localStorage.setItem("hpj_tutorial_seen", "1");
    }
    setShowTutorial(false);
  }

  function nextTutorialSlide() {
    if (tutorialIndex >= TUTORIAL_SLIDES.length - 1) {
      closeTutorial(true);
      return;
    }
    setTutorialIndex((prev) => prev + 1);
  }

  function skipLocationPrompt() {
    localStorage.setItem("hpj_location_prompted", "1");
    setShowLocationPrompt(false);
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Location is not supported on this device. You can set city manually.");
      skipLocationPrompt();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationMessage("Location enabled. Nearby pandits and muhurat accuracy are now improved.");
        skipLocationPrompt();
      },
      () => {
        setLocationMessage("Location was skipped. You can continue in guest mode and set city manually.");
        skipLocationPrompt();
      },
    );
  }

  return (
    <>
      {/* First-open language selection */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-amber-100 shadow-2xl text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Choose App Language</h2>
            <p className="text-sm text-gray-500 mb-5">Continue in your preferred language.</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleLanguageSelect("en")}
                className="rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Continue in English
              </button>
              <button
                onClick={() => handleLanguageSelect("hi")}
                className="rounded-xl border border-amber-300 px-4 py-3 font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100"
              >
                Hindi mein jaari rakhein
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skippable tutorial */}
      {showTutorial && (
        <div className="fixed inset-0 z-[115] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Tutorial {tutorialIndex + 1}/{TUTORIAL_SLIDES.length}
              </p>
              <button onClick={() => closeTutorial(true)} className="text-xs font-semibold text-slate-500 hover:text-slate-700">
                Skip Tutorial
              </button>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{TUTORIAL_SLIDES[tutorialIndex]}</h3>
            <div className="flex items-center gap-1 mb-6">
              {TUTORIAL_SLIDES.map((_, index) => (
                <span key={index} className={`h-1.5 flex-1 rounded-full ${index <= tutorialIndex ? "bg-[#f49d25]" : "bg-slate-200"}`} />
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => closeTutorial(true)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Skip
              </button>
              <button
                onClick={nextTutorialSlide}
                className="px-4 py-2 rounded-lg bg-[#f49d25] text-sm font-semibold text-white hover:bg-[#e08c14]"
              >
                {tutorialIndex === TUTORIAL_SLIDES.length - 1 ? "Start Exploring" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progressive location permission */}
      {language && showLocationPrompt && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[105] w-[calc(100%-2rem)] max-w-2xl bg-white border border-amber-200 rounded-2xl shadow-xl p-4">
          <p className="text-sm font-semibold text-slate-900 mb-1">
            Allow location access to find nearby Pandits and improve muhurat accuracy?
          </p>
          <p className="text-xs text-slate-500 mb-3">
            This is optional. You can continue without sharing location.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={skipLocationPrompt}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Not Now
            </button>
            <button
              onClick={requestLocation}
              className="px-3 py-2 rounded-lg bg-[#f49d25] text-sm font-semibold text-white hover:bg-[#e08c14]"
            >
              Allow Location
            </button>
          </div>
        </div>
      )}

      {locationMessage && (
        <div className="fixed bottom-6 right-6 z-[106] bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
          {locationMessage}
        </div>
      )}

      {/* Tutorial replay */}
      <button
        onClick={() => {
          setShowTutorial(true);
          setTutorialIndex(0);
        }}
        className="fixed top-24 right-6 z-[104] w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-slate-50"
        aria-label="Replay tutorial"
        title="Replay tutorial"
      >
        ?
      </button>

      {/* Hero Section from Stitched Design */}
      <section className="mx-auto max-w-[1280px] px-6 lg:px-20 py-12 md:py-24">
        <div className="flex flex-col gap-10 lg:flex-row items-center">
          <div className="flex flex-col gap-8 lg:w-1/2">
            <div className="flex flex-col gap-4">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                <span className="material-symbols-outlined text-base">verified</span> Authentic & Trusted
              </span>
              <h1 className="text-4xl font-black leading-tight tracking-[-0.03em] md:text-6xl text-[#181511]">
                Book Verified Pandits with <span className="text-primary">Guaranteed Travel</span> & Backup
              </h1>
              <p className="text-lg leading-relaxed text-[#5e5241] max-w-[540px]">
                Experience seamless spiritual ceremonies with Aadhaar-verified experts and automated door-to-door logistics. We ensure your Mahurat is never missed.
              </p>
            </div>

            <div className="w-full">
              <QuickSearchBar />
            </div>

            <div className="flex flex-wrap gap-4 mt-2">
              <Link href="/search" className="flex h-12 min-w-[160px] cursor-pointer items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all">
                <span>Book Now</span>
              </Link>
              <button className="flex h-12 min-w-[160px] cursor-pointer items-center justify-center rounded-lg border-2 border-[#e6e1db] px-6 text-base font-bold hover:bg-white transition-all">
                <span className="material-symbols-outlined mr-2">download</span> Download App
              </button>
            </div>
          </div>
          <div className="relative w-full lg:w-1/2">
            <div
              className="aspect-square w-full rounded-2xl bg-cover bg-center shadow-2xl overflow-hidden"
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD9eBptz8ZTcYEfLp7QaWTwx71FtJLHedZaiC6Q9u8h8X2XVRO3K0xoSc36Ees7qgjcj7LqHegKBh0dvxURu9dzAXxLBn4F7XSIE_Y-YyPEyIVNDICukJ-LUQZFTUdC4fjZE0UubuvKQwVBDg3RVKY_rvSsQlyuglILEVi3L32RXKK4u3vhtYEhFAuHMkmCPRYCLOh1QxjK9x8BSzxez8ER1f4hdG-JLJ1J9hZBOVOicfdcUzxQEfmPSwaZFzI94_aecKdBvTItMxM")' }}
            >
            </div>
            <div className="absolute -bottom-6 -left-6 hidden md:block rounded-xl bg-white p-6 shadow-xl border border-[#e6e1db]">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#181511]">Aadhaar Verified</p>
                  <p className="text-xs text-[#8a7960]">100% Background Check</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR SERVICES GRID */}
      <section className="mb-16 mx-4 md:mx-10 lg:mx-40 mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold dark:text-white text-gray-900">Popular Services</h2>
          <Link href="/search" className="text-primary font-semibold text-sm hover:text-primary/80 transition-colors">View All</Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { label: "Wedding", icon: "favorite", bg: "bg-amber-50" },
            { label: "Griha Pravesh", icon: "home", bg: "bg-amber-50" },
            { label: "Satyanarayan", icon: "festival", bg: "bg-amber-50" },
            { label: "Namkaran", icon: "child_care", bg: "bg-amber-50" },
            { label: "Vidhya Arambha", icon: "auto_stories", bg: "bg-amber-50" },
            { label: "More", icon: "more_horiz", bg: "bg-amber-50" },
          ].map((c) => (
            <Link
              key={c.label}
              href={c.label !== "More" ? `/search?pujaType=${encodeURIComponent(c.label)}` : '/search'}
              className="group cursor-pointer block"
            >
              <div className={`aspect-[4/3] rounded-3xl ${c.bg} dark:bg-zinc-800 flex flex-col items-center justify-center gap-4 transition-all hover:bg-amber-100 hover:-translate-y-1 hover:shadow-sm`}>
                <span className="material-symbols-outlined text-[32px] text-primary">{c.icon}</span>
                <span className="font-bold text-[13px] text-gray-800 dark:text-gray-200">{c.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="bg-[#f0ece6] py-20 px-6 lg:px-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-16 flex flex-col items-center text-center gap-4">
            <h2 className="text-3xl font-black text-[#181511] md:text-4xl">Our Value Proposition</h2>
            <p className="text-base text-[#8a7960] max-w-[600px]">Ensuring a seamless religious experience through technology, punctuality, and trust.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm border border-[#e6e1db] hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
              </div>
              <h3 className="text-xl font-bold text-[#181511]">Aadhaar Verified Trust</h3>
              <p className="text-[#8a7960] leading-relaxed">Every Pandit undergoes rigorous Aadhaar verification and professional background checks for your absolute safety.</p>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm border border-[#e6e1db] hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">commute</span>
              </div>
              <h3 className="text-xl font-bold text-[#181511]">Door-to-Door Logistics</h3>
              <p className="text-[#8a7960] leading-relaxed">We handle all travel arrangements through our automated logistics platform, ensuring punctuality and stress-free arrival.</p>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm border border-[#e6e1db] hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">sync_saved_locally</span>
              </div>
              <h3 className="text-xl font-bold text-[#181511]">100% Uptime Backup</h3>
              <p className="text-[#8a7960] leading-relaxed">Never miss a mahurat. We maintain a standby Pandit network ready to fill in for every booking in case of emergencies.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <MuhuratWidget />
      <FeaturedPanditsSection />

      {/* Social Proof Section */}
      <section className="mx-auto max-w-[1280px] px-6 lg:px-20 py-24">
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-3xl bg-primary p-10 md:p-16">
          <div className="flex flex-col gap-4 max-w-[400px]">
            <h2 className="text-3xl font-black text-white md:text-4xl">Trusted by Thousands of Families</h2>
            <p className="text-white/80 font-medium">Spreading spiritual harmony across the nation through reliable service.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1">
            <div className="text-center md:text-left">
              <p className="text-4xl font-black text-white">50,000+</p>
              <p className="text-white/80 text-sm font-bold uppercase tracking-wide">Successful Ceremonies</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-4xl font-black text-white">2,500+</p>
              <p className="text-white/80 text-sm font-bold uppercase tracking-wide">Verified Pandits</p>
            </div>
            <div className="text-center md:text-left col-span-2 md:col-span-1">
              <p className="text-4xl font-black text-white">40+</p>
              <p className="text-white/80 text-sm font-bold uppercase tracking-wide">Cities Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mx-auto max-w-[1280px] px-6 lg:px-20 py-20 text-center">
        <div className="flex flex-col items-center gap-8 rounded-3xl bg-white border border-primary/20 p-12 md:py-24 shadow-2xl">
          <div className="flex flex-col gap-4 items-center">
            <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined text-4xl">celebration</span>
            </div>
            <h2 className="text-3xl font-black text-[#181511] md:text-5xl">Ready to book your ceremony?</h2>
            <p className="text-lg text-[#8a7960] max-w-[600px]">Join thousands of families who trust HmarePanditJi for their sacred rituals and auspicious beginnings.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/search" className="flex h-14 min-w-[200px] cursor-pointer items-center justify-center rounded-xl bg-primary px-8 text-lg font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
              <span>Get Started Now</span>
            </Link>
            <button className="flex h-14 min-w-[200px] cursor-pointer items-center justify-center rounded-xl border-2 border-primary/30 px-8 text-lg font-bold text-primary hover:bg-primary/5 transition-all">
              <span>Contact Sales</span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
