"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

// ---------------------------------------------------------------------------
// QUICK SEARCH BAR
// ---------------------------------------------------------------------------
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 md:p-4 mt-8">
      <div className="flex flex-col md:flex-row gap-3 md:gap-2 items-stretch md:items-center">
        <select
          value={pujaType}
          onChange={(e) => setPujaType(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-gray-50"
        >
          <option value="">Puja Type ▾</option>
          {SUPPORTED_PUJA_TYPES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          list="city-list"
          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-gray-50"
        />
        <datalist id="city-list">
          {SUPPORTED_CITIES.map((c) => <option key={c} value={c} />)}
        </datalist>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-gray-50"
        />

        <button
          onClick={handleSearch}
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          🔍 Search
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-3 text-center">
        No registration needed to explore →
      </p>
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
          fetch(`http://localhost:3001/api/v1/muhurat/dates?month=${month}&year=${year}`),
          fetch(`http://localhost:3001/api/v1/muhurat/upcoming?limit=3`),
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
    fetch("http://localhost:3001/api/v1/pandits?sort=rating&limit=6&verificationStatus=VERIFIED")
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
  return (
    <>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-white">
        {/* Mandala pattern overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f49d25' fill-opacity='1'%3E%3Ccircle cx='40' cy='40' r='20'/%3E%3Ccircle cx='40' cy='40' r='30' stroke='%23f49d25' stroke-width='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24 text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-amber-200 rounded-full px-4 py-1.5 text-xs font-bold text-amber-700 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            500+ Verified Pandits Available Now
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4 max-w-4xl mx-auto">
            Book Verified Pandits for{" "}
            <span className="text-primary">Every Sacred Occasion</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-600 mb-2 max-w-2xl mx-auto">
            Transparent pricing · Travel managed · Backup guaranteed
          </p>

          {/* Quick Search */}
          <div className="max-w-3xl mx-auto">
            <QuickSearchBar />
          </div>

          {/* Trust stats */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm font-semibold text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-primary text-lg">🕉</span>
              <span>500+ Verified Pandits</span>
            </div>
            <div className="w-px h-4 bg-gray-300 hidden md:block" />
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 text-lg">⭐</span>
              <span>4.8 Avg Rating</span>
            </div>
            <div className="w-px h-4 bg-gray-300 hidden md:block" />
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg">✅</span>
              <span>₹0 Hidden Costs</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Book in 3 Simple Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔍",
                step: "1",
                title: "Discover",
                desc: "Search from 500+ verified Pandits across India. Filter by specialization, language, and travel preference.",
              },
              {
                icon: "📅",
                step: "2",
                title: "Book with Muhurat",
                desc: "Pick an auspicious date from our Muhurat Explorer. Complete pricing shown upfront — no surprises.",
              },
              {
                icon: "🙏",
                step: "3",
                title: "Celebrate",
                desc: "We manage all travel and logistics. Backup guarantee available for important events.",
              },
            ].map((s) => (
              <div key={s.step} className="relative bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-2xl p-8 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{s.icon}</div>
                <div className="absolute top-4 right-4 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-extrabold">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MUHURAT WIDGET */}
      <MuhuratWidget />

      {/* FEATURED PANDITS */}
      <FeaturedPanditsSection />

      {/* PUJA CATEGORIES */}
      <section className="py-16 bg-amber-50/30">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-10">Browse by Occasion</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {PUJA_CATEGORIES.map((c) =>
              c.label ? (
                <Link
                  key={c.label}
                  href={`/search?pujaType=${encodeURIComponent(c.label)}`}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center text-center hover:border-primary hover:shadow-md transition-all group"
                >
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{c.emoji}</span>
                  <span className="text-xs font-bold text-gray-800">{c.label}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">{c.sub}</span>
                </Link>
              ) : (
                <Link
                  key="view-all"
                  href="/search"
                  className="bg-primary rounded-xl border border-primary p-4 flex flex-col items-center text-center hover:bg-primary/90 transition-all group"
                >
                  <span className="text-3xl mb-2">📿</span>
                  <span className="text-xs font-bold text-white">View All →</span>
                  <span className="text-[10px] text-white/70 mt-0.5">{c.sub}</span>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* TRUST & SAFETY */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Why Trust HmarePanditJi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🛡️",
                title: "Multi-Layer Verification",
                desc: "Every Pandit undergoes Aadhaar verification, certificate validation, and live Video KYC before joining.",
              },
              {
                icon: "💰",
                title: "100% Transparent Pricing",
                desc: "Dakshina + Travel + Samagri + GST — all shown upfront before you pay. Zero hidden charges.",
              },
              {
                icon: "✈️",
                title: "Travel Fully Managed",
                desc: "We coordinate train tickets, flights, cabs, and hotel for outstation Pandits. You just attend the ceremony.",
              },
            ].map((t) => (
              <div key={t.title} className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-8 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{t.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 bg-gradient-to-r from-primary to-amber-400">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to Book Your Sacred Ceremony?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Join thousands of families who trust HmarePanditJi for their sacred rituals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/search"
              className="bg-white text-primary px-8 py-3 rounded-btn font-bold text-lg hover:bg-gray-50 transition-all shadow-lg"
            >
              Find a Pandit Now
            </Link>
            <Link
              href="/muhurat"
              className="bg-white/20 text-white border-2 border-white/40 px-8 py-3 rounded-btn font-bold text-lg hover:bg-white/30 transition-all"
            >
              View Muhurat Calendar
            </Link>
          </div>
          <p className="text-white/60 text-sm mt-4">Just exploring? <Link href="/" className="text-white underline">Continue as Guest →</Link></p>
        </div>
      </section>
    </>
  );
}
