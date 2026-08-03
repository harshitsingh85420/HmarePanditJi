"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PanditRecordCard } from "../components/design/PanditRecordCard";
import { mapPanditToResult, PanditResult } from "../components/design/mapPandit";
import { useNearestCity } from "../lib/useNearestCity";
import { resolveApiBase } from "@hmarepanditji/utils";
import { PUJA_TYPES, PUJA_LABELS_EN, PUJA_LABELS_HI } from "@hmarepanditji/types";

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------
// TRACK 1 BATCH 2a — THE CANON'S "8 ceremonies", from the ONE vocabulary.
// This was a 12-entry hand-typed list in a THIRD casing ("Satyanarayan Puja",
// "Namkaran") that matched neither the stored values nor packages/types. The
// canon's Home promises exactly 8, and PUJA_TYPES is what the database holds.
const SUPPORTED_PUJA_TYPES = PUJA_TYPES.map((t) => PUJA_LABELS_EN[t]);

const SUPPORTED_CITIES = [
  "Delhi", "Noida", "Gurgaon", "Faridabad", "Ghaziabad",
  "Greater Noida", "Mathura", "Agra", "Jaipur", "Haridwar",
  "Varanasi", "Lucknow", "Mumbai", "Pune", "Bangalore",
];

// 🔴 THE LANGUAGE RULING, ENFORCED. These carried ENGLISH TRANSLATIONS as the
// sub-line — "Vivah / Wedding", "Griha Pravesh / Housewarming" — and the canon
// forbids exactly that: ritual vocabulary stays Sanskrit/Hindi in Roman script
// "because translating it is demeaning and wrong". The sub-line now carries the
// DEVANAGARI form instead, which is the canon's sanctioned accent: the name
// beneath its Roman form, never instead of it.
const PUJA_EMOJI: Record<string, string> = {
  SATYANARAYAN: "🕉", GRIHA_PRAVESH: "🏠", VIVAH: "💍", MUNDAN: "👶",
  NAAMKARAN: "🍼", HAVAN: "🔥", RUDRABHISHEK: "🔱", SHRADH: "🪷",
};
const PUJA_CATEGORIES = PUJA_TYPES.map((t) => ({
  type: t,
  emoji: PUJA_EMOJI[t],
  label: PUJA_LABELS_EN[t],
  sub: PUJA_LABELS_HI[t],
}));

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const TUTORIAL_SLIDES = [
  "Explore all pujas without registration.",
  "Book with verified Pandits from Delhi-NCR and nationwide.",
  "Manage travel, food, samagri — all in one place.",
  "Guest Mode — no need to register until you book.",
];
// NEXT_PUBLIC_API_URL is an ORIGIN; the client owns the /api/v1 prefix.
// This line used to APPEND /api/v1 unconditionally. Six of the seven values
// committed for that variable already end in /api/v1 (apps/web/.env.local:9,
// .env.local.example:8, three CI lines, .husky/pre-push, .env.vercel), so the
// customer front door requested /api/v1/api/v1/... and 404'd — silently, because
// all three fetches below are `r.ok ? … : null`. The visible symptom was an
// empty featured-pandits grid and an empty muhurat strip under the message
// "Run database seed to populate pandit data", against a seeded database.
// resolveApiBase accepts BOTH env shapes and resolves them identically.
const API_BASE = resolveApiBase(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NODE_ENV === "development",
).base;

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
          placeholder="Search for Pandits or ceremonies…"
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

// ── MUHURAT: CUT BY THE CANON (Track 1 batch 2a) ─────────────────────────
// The customer canon deletes it outright: "Muhurat x2 (fabricated data) ->
// nothing. The date picker stays a plain calendar; no invented
// auspiciousness." F-J4-1 had already measured the endpoint returning
// {"dates":[]} — so this section rendered an empty calendar under a
// promise on the customer front door. DELETION IS THE FEATURE.

// ---------------------------------------------------------------------------
// ─────────────────────────────────────────────────────────────
// F-B3-5 · THE THIRD CARD IMPLEMENTATION IS DEAD. This strip carried its own
// inline card — hardcoded "Pt." on every name (Tanya is not "Pt."), the green
// identity tick, "0yr exp", "⭐0.0 (0)", raw specializations chips, and a
// header claiming "Verified experts ready to travel anywhere": TWO dead
// claims in one line (door-as-badge + a feature CUT from v1). It survived the
// 4b rebuild because the rebuild ran on /search's reader only.
//
// A KILL DIES BY THE READER TABLE, AND A READER TABLE STAYS DEAD ONLY WHEN
// THERE IS ONE IMPLEMENTATION TO READ. Every card render now converges on
// PanditRecordCard (the 4b Dossier) through the one shared mapper — the
// single-implementation law, applied to UI components.
// ─────────────────────────────────────────────────────────────

function FeaturedPanditsSection() {
  const router = useRouter();
  // home READS the remembered geo city only — the one soft-ask lives on
  // /search. No stored city -> the true city renders (ladder rung 4).
  const { geoCity } = useNearestCity();
  const [pandits, setPandits] = useState<PanditResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // (the verificationStatus param is DEAD on this route since F-B3-1 —
    // the server hard-filters VERIFIED; kept out of the URL entirely)
    const from = geoCity ? `&from=${encodeURIComponent(geoCity)}` : "";
    fetch(`${API_BASE}/pandits?sort=rating&limit=6${from}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.data?.pandits) setPandits(d.data.pandits.map((p: Record<string, unknown>) => mapPanditToResult(p)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [geoCity]);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            {/* the old header died with the card: "Highly Rated" was a lie at
                rating 0, and "ready to travel anywhere" claimed a CUT feature */}
            <h2 className="text-3xl font-extrabold text-gray-900">Our Pandit jis</h2>
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pandits.map((p) => (
              <PanditRecordCard
                key={p.id}
                pandit={{
                  id: p.id,
                  name: p.name,
                  photoUrl: p.avatarUrl,
                  services: p.services,
                  poojaVideo: p.poojaVideo,
                  experienceYears: p.experienceYears,
                  // the ladder's facts from the wire; no vantage -> true city
                  city: p.city,
                  sameCity: p.sameCity,
                  distanceKm: p.distanceKm,
                  dakshina: p.dakshina,
                  languages: p.languages,
                }}
                onOpenProfile={() => router.push(`/pandit/${p.id}`)}
              />
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
        setLocationMessage("Location enabled — we can show pandits near you.");
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
        // batch 2d: cleared above the app-wide bottom nav on mobile. At z-105
        // it would otherwise sit ON the nav, covering the tabs with a prompt
        // the customer may not want to answer yet.
        <div className="fixed bottom-[calc(64px+1.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 left-1/2 -translate-x-1/2 z-[105] w-[calc(100%-2rem)] max-w-2xl bg-white border border-amber-200 rounded-2xl shadow-xl p-4">
          <p className="text-sm font-semibold text-slate-900 mb-1">
            Allow location access to find pandits near you?
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
        <div className="fixed bottom-[calc(64px+1.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-6 z-[106] bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
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
              {/* TRUTHFUL-STATE (founder ruling 2026-07-23): the old hero promised
                  F25 backup pandits (not built) and an automated travel engine
                  (deferred, D-06) — those exact phrases are now build-banned in
                  payment-money.test.ts. The hero claims only what ships. */}
              <h1 className="text-4xl font-black leading-tight tracking-[-0.03em] md:text-6xl text-[#181511]">
                Book Verified Pandits with <span className="text-primary">Fixed Dakshina</span> & Transparent Pricing
              </h1>
              <p className="text-lg leading-relaxed text-[#5e5241] max-w-[540px]">
                Experience seamless spiritual ceremonies with Aadhaar-verified experts. Every cost — dakshina, travel, platform fee — is itemised before you pay.
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
                  <p className="text-xs text-[#8a7960]">Aadhaar + Video Verified</p>
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
          {/* GAP-FILL, NAMED: the canon places the Ceremony guide in Discover
              after Choose-a-ceremony, but names no entry point for it. The
              tiles keep pointing at filtered search (the canon does not make
              the guide their destination); this header link is the guide's
              way in, and its placement is my choice, not the canon's. */}
          <Link href="/ceremonies" className="text-primary font-semibold text-sm hover:text-primary/80 transition-colors">What each ceremony involves →</Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {/* 🔴 THE CANON'S "8 ceremonies" — this tile row was a FOURTH hand-typed
              list, inline in the JSX. It TRANSLATED Vivah into "Wedding" (the
              language ruling forbids it), carried "Vidhya Arambha" which is not
              a canonical type at all, and linked with
              `?pujaType=Wedding` — a value the search filter can NEVER match,
              so every tile was a dead filter dressed as a shortcut. The tiles
              now come from PUJA_TYPES and link with the CANONICAL VALUE, so the
              tap lands on a filter that can actually answer. */}
          {PUJA_CATEGORIES.map((c) => (
            <Link
              key={c.type}
              href={`/search?pujaType=${encodeURIComponent(c.type)}`}
              className="group cursor-pointer block"
            >
              <div className="aspect-[4/3] rounded-3xl bg-cream-tint dark:bg-zinc-800 flex flex-col items-center justify-center gap-2 transition-all hover:bg-cream-deep hover:-translate-y-1 hover:shadow-sm min-h-cta">
                <span className="text-[30px] leading-none" aria-hidden="true">{c.emoji}</span>
                {/* Roman leads; Devanagari sits BENEATH it — the canon's
                    sanctioned accent, never instead of the Roman form. */}
                <span className="font-bold text-label text-ink dark:text-gray-200">{c.label}</span>
                <span className="font-devanagari text-micro text-muted">{c.sub}</span>
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
              <p className="text-[#8a7960] leading-relaxed">Every Pandit undergoes rigorous Aadhaar verification and video KYC before appearing on the platform.</p>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm border border-[#e6e1db] hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">commute</span>
              </div>
              {/* TRUTHFUL-STATE (2026-07-23): no travel engine exists (D-06);
                  travel is an itemised allowance — the card says exactly that. */}
              <h3 className="text-xl font-bold text-[#181511]">Travel Costs Upfront</h3>
              <p className="text-[#8a7960] leading-relaxed">The Pandit&apos;s travel allowance is itemised in your booking total before you pay — no hidden logistics charges, no surprises on the day.</p>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm border border-[#e6e1db] hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">currency_rupee</span>
              </div>
              {/* Replaced the F25 standby-pandit claim (NOT BUILT — a straight
                  falsehood; founder ruling 2026-07-23: remove; the exact phrase
                  is build-banned in payment-money.test.ts). This replacement
                  claim is true and build-guarded (CONFLICT_RULINGS #7). */}
              <h3 className="text-xl font-bold text-[#181511]">Fee Shown Before You Pay</h3>
              <p className="text-[#8a7960] leading-relaxed">The platform fee appears as its own line before payment — and your Pandit receives 100% of the dakshina, always.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}

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
