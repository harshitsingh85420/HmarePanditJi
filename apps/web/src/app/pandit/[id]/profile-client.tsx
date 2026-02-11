"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Rating,
  PriceDisplay,
} from "@hmarepanditji/ui";

// ── Types ────────────────────────────────────────────────────────────────────

interface PanditService {
  name: string;
  nameHindi: string;
  durationHours: number;
  basePrice: number;
  description: string;
}

interface ReviewItem {
  id: string;
  customerName: string;
  isAnonymous: boolean;
  overallRating: number;
  ritualKnowledge?: number;
  punctuality?: number;
  communication?: number;
  comment?: string;
  ceremony: string;
  date: string;
}

interface PanditProfile {
  id: string;
  displayName: string;
  bio: string;
  experienceYears: number;
  specializations: string[];
  languages: string[];
  sect?: string;
  gotra?: string;
  city: string;
  state: string;
  isVerified: boolean;
  profilePhotoUrl?: string;
  galleryImages: string[];
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  availableDays: string[];
  aadhaarVerified: boolean;
  certificatesVerified: boolean;
  services: PanditService[];
  reviews: ReviewItem[];
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_SERVICES: PanditService[] = [
  {
    name: "Griha Pravesh",
    nameHindi: "गृह प्रवेश",
    durationHours: 3,
    basePrice: 11000,
    description: "Full Vastu Shanti puja with havan for new home entry.",
  },
  {
    name: "Vivah Sanskar",
    nameHindi: "विवाह संस्कार",
    durationHours: 6,
    basePrice: 25000,
    description: "Complete wedding ceremony with all 7 pheras and rituals.",
  },
  {
    name: "Satyanarayan Katha",
    nameHindi: "सत्यनारायण कथा",
    durationHours: 3,
    basePrice: 8000,
    description: "Full Satyanarayan puja with katha path and prasad.",
  },
  {
    name: "Mundan Sanskar",
    nameHindi: "मुंडन संस्कार",
    durationHours: 2,
    basePrice: 6000,
    description: "First hair-cutting ceremony (Chudakarana) with proper vidhi.",
  },
  {
    name: "Namkaran Sanskar",
    nameHindi: "नामकरण संस्कार",
    durationHours: 2,
    basePrice: 5500,
    description: "Baby naming ceremony with nakshatra-based name selection.",
  },
  {
    name: "Rudrabhishek",
    nameHindi: "रुद्राभिषेक",
    durationHours: 3,
    basePrice: 9500,
    description: "Shiv puja with panchamrit abhishek and Rudrashtadhyayi.",
  },
  {
    name: "Shanti Path",
    nameHindi: "शांति पाठ",
    durationHours: 2,
    basePrice: 7000,
    description: "Navgraha shanti puja and pitra tarpan for peace & prosperity.",
  },
  {
    name: "Sunderkand Path",
    nameHindi: "सुंदरकांड पाठ",
    durationHours: 4,
    basePrice: 7500,
    description: "Complete Sunderkand recitation from Ramcharitmanas.",
  },
];

const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: "r1",
    customerName: "Priya Sharma",
    isAnonymous: false,
    overallRating: 5,
    ritualKnowledge: 5,
    punctuality: 5,
    communication: 5,
    comment:
      "Bahut achha puja karaya. Pandit ji ne puri vidhi-vidhan se kiya. Havan mein itni positive energy thi. Will definitely book again for next ceremony!",
    ceremony: "Griha Pravesh",
    date: "2026-01-15",
  },
  {
    id: "r2",
    customerName: "Rahul Gupta",
    isAnonymous: false,
    overallRating: 5,
    ritualKnowledge: 5,
    punctuality: 4,
    communication: 5,
    comment:
      "Hamari beti ka Namkaran bahut sundar tarike se hua. Pandit ji ne har cheez explain ki jo hamne kabhi samjhi nahi thi. Sanskrit shlokas ka arth bhi bataya.",
    ceremony: "Namkaran Sanskar",
    date: "2026-01-08",
  },
  {
    id: "r3",
    customerName: "Anonymous",
    isAnonymous: true,
    overallRating: 4,
    ritualKnowledge: 5,
    punctuality: 3,
    communication: 4,
    comment:
      "Puja achhi thi. Thoda late aa gaye, but puri ceremony perfect thi. Samgri sab sahi tha. Reasonably priced.",
    ceremony: "Satyanarayan Katha",
    date: "2025-12-28",
  },
  {
    id: "r4",
    customerName: "Sunita Agarwal",
    isAnonymous: false,
    overallRating: 5,
    ritualKnowledge: 5,
    punctuality: 5,
    communication: 5,
    comment:
      "Mere bete ki shaadi mein Pandit ji ne jo puja karayi, woh anubhav hum kabhi nahi bhulenge. Sab guests bhi bahut impressed the. Pure 6 ghante bina kisi galti ke puja karai.",
    ceremony: "Vivah Sanskar",
    date: "2025-12-10",
  },
  {
    id: "r5",
    customerName: "Amit Verma",
    isAnonymous: false,
    overallRating: 5,
    ritualKnowledge: 5,
    punctuality: 5,
    communication: 4,
    comment:
      "Rudrabhishek karaya. Excellent knowledge of mantras. Very calming presence. Bilkul sahi tarike se kiya. Highly recommend!",
    ceremony: "Rudrabhishek",
    date: "2025-11-22",
  },
];

const MOCK_PANDIT: PanditProfile = {
  id: "mock-1",
  displayName: "Pt. Ramesh Sharma Shastri",
  bio: "Namaste! Main 22 saalon se Vedic rituals kar raha hoon. Maine Varanasi se Sanskrit Shastri ki degree li hai aur tab se Delhi-NCR mein hazaaron parivaron ko service de raha hoon. Mera vishwaas hai ki har puja ek pavitra anubhav honi chahiye — sirf ek formality nahi. Main puri vidhi-vidhan ke saath puja karata hoon aur har step ka arth bhi samjhata hoon. Mujhe apne kaam pe garv hai!",
  experienceYears: 22,
  specializations: ["Vivah Sanskar", "Griha Pravesh", "Satyanarayan Katha", "Rudrabhishek"],
  languages: ["Hindi", "Sanskrit", "English"],
  sect: "Shaivite",
  gotra: "Kashyap",
  city: "Dwarka",
  state: "Delhi",
  isVerified: true,
  profilePhotoUrl: undefined,
  galleryImages: [],
  averageRating: 4.9,
  totalReviews: 312,
  totalBookings: 487,
  availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  aadhaarVerified: true,
  certificatesVerified: true,
  services: MOCK_SERVICES,
  reviews: MOCK_REVIEWS,
};

// ── API fetch ─────────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function fetchProfile(id: string): Promise<PanditProfile> {
  try {
    const [panditRes, reviewsRes] = await Promise.all([
      fetch(`${API_URL}/pandits/${id}`, { signal: AbortSignal.timeout(5000) }),
      fetch(`${API_URL}/pandits/${id}/reviews`, { signal: AbortSignal.timeout(5000) }),
    ]);
    if (!panditRes.ok) throw new Error("not found");
    const pandit = await panditRes.json();
    const reviews = reviewsRes.ok ? await reviewsRes.json() : [];

    return {
      id: pandit.id,
      displayName: pandit.displayName ?? pandit.name ?? "",
      bio: pandit.bio ?? "",
      experienceYears: pandit.experienceYears ?? 0,
      specializations: pandit.specializations ?? [],
      languages: pandit.languages ?? [],
      sect: pandit.sect,
      gotra: pandit.gotra,
      city: pandit.city ?? "Delhi",
      state: pandit.state ?? "Delhi",
      isVerified: pandit.isVerified ?? false,
      profilePhotoUrl: pandit.profilePhotoUrl,
      galleryImages: pandit.galleryImages ?? [],
      averageRating: pandit.averageRating ?? 0,
      totalReviews: pandit.totalReviews ?? 0,
      totalBookings: pandit.totalBookings ?? 0,
      availableDays: pandit.availableDays ?? [],
      aadhaarVerified: pandit.aadhaarVerified ?? false,
      certificatesVerified: pandit.certificatesVerified ?? false,
      services: MOCK_SERVICES,
      reviews: Array.isArray(reviews)
        ? reviews.map((r: Record<string, unknown>) => ({
            id: String(r.id),
            customerName: r.isAnonymous
              ? "Anonymous"
              : String(((r.customer as Record<string, unknown>)?.user as Record<string, unknown>)?.fullName ?? "Customer"),
            isAnonymous: Boolean(r.isAnonymous),
            overallRating: Number(r.overallRating),
            ritualKnowledge: r.ritualKnowledge as number | undefined,
            punctuality: r.punctuality as number | undefined,
            communication: r.communication as number | undefined,
            comment: r.comment as string | undefined,
            ceremony: String(((r.booking as Record<string, unknown>)?.ritual as Record<string, unknown>)?.name ?? "Ceremony"),
            date: String(r.createdAt ?? new Date().toISOString()).split("T")[0],
          }))
        : MOCK_REVIEWS,
    };
  } catch {
    return { ...MOCK_PANDIT, id };
  }
}

// ── Availability Calendar ─────────────────────────────────────────────────────

function AvailabilityCalendar({ availableDays }: { availableDays: string[] }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function goNext() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }
  function goPrev() {
    const mn = viewMonth === 0 ? 11 : viewMonth - 1;
    const yn = viewMonth === 0 ? viewYear - 1 : viewYear;
    if (new Date(yn, mn, 1) < new Date(today.getFullYear(), today.getMonth(), 1)) return;
    setViewMonth(mn);
    setViewYear(yn);
  }

  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1);
  const canGoNext = new Date(viewYear, viewMonth + 1, 1) < maxMonth;
  const canGoPrev = new Date(viewYear, viewMonth, 1) > new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div>
      {/* Nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goPrev}
          disabled={!canGoPrev}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
        >
          <span className="material-symbols-outlined text-slate-500 text-lg">chevron_left</span>
        </button>
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={goNext}
          disabled={!canGoNext}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
        >
          <span className="material-symbols-outlined text-slate-500 text-lg">chevron_right</span>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => (
          <span key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">{d}</span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <span key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(viewYear, viewMonth, day);
          const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
          const dayName = WEEK_DAYS[date.getDay()];
          const isAvailable = availableDays.includes(dayName);

          return (
            <div
              key={day}
              className={[
                "h-8 w-full flex items-center justify-center rounded-lg text-xs font-medium",
                isPast
                  ? "text-slate-300 dark:text-slate-700"
                  : isToday
                  ? "ring-2 ring-primary font-bold text-primary"
                  : isAvailable
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer transition-colors"
                  : "bg-red-50 dark:bg-red-900/20 text-red-400",
              ].join(" ")}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30 border border-green-300" />
          Available
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-3 h-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-200" />
          Unavailable
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-3 h-3 rounded ring-2 ring-primary" />
          Today
        </span>
      </div>
    </div>
  );
}

// ── Rating Breakdown ──────────────────────────────────────────────────────────

function RatingBreakdown({ reviews, avg }: { reviews: ReviewItem[]; avg: number }) {
  const counts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.overallRating === star).length,
  }));
  const max = Math.max(...counts.map(c => c.count), 1);

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
      {/* Big number */}
      <div className="text-center flex-shrink-0">
        <div className="text-5xl font-black text-slate-900 dark:text-slate-100">{avg.toFixed(1)}</div>
        <div className="flex items-center justify-center gap-0.5 mt-1">
          {[1, 2, 3, 4, 5].map(s => (
            <span
              key={s}
              className="material-symbols-outlined text-orange-500 text-base"
              style={{ fontVariationSettings: s <= Math.round(avg) ? "'FILL' 1" : "'FILL' 0" }}
            >
              star
            </span>
          ))}
        </div>
        <div className="text-xs text-slate-400 mt-1">{reviews.length} reviews</div>
      </div>

      {/* Bars */}
      <div className="flex-1 w-full space-y-1.5">
        {counts.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-4">{star}</span>
            <span
              className="material-symbols-outlined text-orange-500 text-xs"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 w-4">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Review Card ───────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: ReviewItem }) {
  const subRatings = [
    { label: "Knowledge", value: review.ritualKnowledge },
    { label: "Punctuality", value: review.punctuality },
    { label: "Communication", value: review.communication },
  ].filter(r => r.value !== undefined);

  return (
    <div className="p-5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-base">person</span>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {review.isAnonymous ? "Anonymous" : review.customerName}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Rating value={review.overallRating} showCount={false} size="sm" />
              <Badge variant="primary">{review.ceremony}</Badge>
            </div>
          </div>
        </div>
        <span className="text-xs text-slate-400 flex-shrink-0">
          {new Date(review.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {subRatings.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3">
          {subRatings.map(r => (
            <span key={r.label} className="text-[10px] text-slate-500 flex items-center gap-1">
              <span
                className="material-symbols-outlined text-orange-400 text-xs"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              {r.label}: {r.value}/5
            </span>
          ))}
        </div>
      )}

      {review.comment && (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {review.comment}
        </p>
      )}
    </div>
  );
}

// ── Gallery Lightbox ──────────────────────────────────────────────────────────

function Gallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="material-symbols-outlined text-slate-300 text-5xl mb-3">photo_library</span>
        <p className="text-sm text-slate-400">Gallery photos coming soon</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.slice(0, 6).map((src, i) => (
          <button
            key={i}
            onClick={() => setLightbox(src)}
            className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 hover:opacity-90 transition-opacity"
          >
            <img src={src} alt={`Gallery photo ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <img
            src={lightbox}
            alt="Gallery"
            className="max-w-full max-h-[90vh] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

// ── Share Button ──────────────────────────────────────────────────────────────

function ShareButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareWhatsApp() {
    const text = `Check out ${name} on HmarePanditJi: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        title="Copy link"
      >
        <span className="material-symbols-outlined text-sm">
          {copied ? "check" : "link"}
        </span>
        {copied ? "Copied!" : "Share"}
      </button>
      <button
        onClick={shareWhatsApp}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-600 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
        title="Share on WhatsApp"
      >
        <span className="material-symbols-outlined text-sm">whatsapp</span>
        WhatsApp
      </button>
    </div>
  );
}

// ── Sticky Bottom CTA (mobile) ────────────────────────────────────────────────

function StickyBookingBar({
  panditId,
  services,
}: {
  panditId: string;
  services: PanditService[];
}) {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState(services[0]?.name ?? "");
  const [date, setDate] = useState("");

  const price = services.find(s => s.name === selectedService)?.basePrice ?? 0;

  function handleBook() {
    const params = new URLSearchParams();
    params.set("panditId", panditId);
    if (selectedService) params.set("ritual", selectedService);
    if (date) params.set("date", date);
    router.push(`/book?${params.toString()}`);
  }

  function handleWhatsApp() {
    const text = `Namaste! Main ${selectedService || "puja"} ke liye booking karna chahta hoon.${date ? ` Date: ${date}` : ""}`;
    window.open(`https://wa.me/919999999999?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 shadow-2xl shadow-black/20">
      <div className="flex items-center gap-3">
        {/* Service select */}
        <select
          value={selectedService}
          onChange={e => setSelectedService(e.target.value)}
          className="flex-1 min-w-0 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-slate-700 dark:text-slate-200"
        >
          {services.map(s => (
            <option key={s.name} value={s.name}>{s.name}</option>
          ))}
        </select>

        {/* Date */}
        <input
          type="date"
          value={date}
          min={new Date().toISOString().split("T")[0]}
          onChange={e => setDate(e.target.value)}
          className="w-32 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-slate-700 dark:text-slate-200"
        />

        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="flex-shrink-0 p-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
          title="WhatsApp"
        >
          <span className="material-symbols-outlined text-base">whatsapp</span>
        </button>

        {/* Book */}
        <button
          onClick={handleBook}
          className="flex-shrink-0 bg-primary text-white text-xs font-black px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 whitespace-nowrap"
        >
          {price > 0 ? `₹${(price / 1000).toFixed(0)}k बुक करें` : "Book Now"}
        </button>
      </div>
    </div>
  );
}

// ── Section Nav ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "about", label: "परिचय" },
  { id: "services", label: "Services" },
  { id: "gallery", label: "Gallery" },
  { id: "reviews", label: "Reviews" },
  { id: "availability", label: "Availability" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProfileClient({
  panditId,
  initialData,
}: {
  panditId: string;
  initialData: Record<string, unknown> | null;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<PanditProfile | null>(null);
  const [loading, setLoading] = useState(!initialData);
  const [reviewsShown, setReviewsShown] = useState(3);
  const reviewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setProfile({ ...MOCK_PANDIT, ...initialData as Partial<PanditProfile>, id: panditId });
      setLoading(false);
    } else {
      fetchProfile(panditId).then(p => {
        setProfile(p);
        setLoading(false);
      });
    }
  }, [panditId, initialData]);

  const handleBook = useCallback(
    (service?: string) => {
      const params = new URLSearchParams({ panditId });
      if (service) params.set("ritual", service);
      router.push(`/book?${params.toString()}`);
    },
    [router, panditId],
  );

  if (loading || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {[180, 120, 200, 160].map((h, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse"
            style={{ height: h }}
          />
        ))}
      </div>
    );
  }

  const visibleReviews = profile.reviews.slice(0, reviewsShown);

  return (
    <div className="bg-[#f8f7f5] dark:bg-[#221a10] min-h-screen pb-24 lg:pb-10">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* ── Section Nav (sticky) ─────────────────────────────────────── */}
        <div className="sticky top-16 z-20 -mx-4 px-4 bg-[#f8f7f5]/90 dark:bg-[#221a10]/90 backdrop-blur-md py-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="flex-shrink-0 px-4 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 1. PROFILE HERO ─────────────────────────────────────────────── */}
        <Card padding="lg" variant="default">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar
                src={profile.profilePhotoUrl}
                alt={profile.displayName}
                size="xl"
                shape="rounded"
                verified={profile.isVerified}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {profile.isVerified && (
                  <Badge variant="success" icon="verified">Verified Vedic</Badge>
                )}
                {profile.aadhaarVerified && (
                  <Badge variant="success" icon="badge">Aadhaar Verified</Badge>
                )}
                {profile.certificatesVerified && (
                  <Badge variant="primary" icon="school">Certified Shastri</Badge>
                )}
                {profile.availableDays.length >= 6 && (
                  <Badge variant="neutral" icon="directions_car">Self-Drive Available</Badge>
                )}
              </div>

              {/* Name */}
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {profile.displayName}
              </h1>

              {/* Rating — clickable → reviews */}
              <button
                onClick={() => reviewsRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="mt-1 inline-flex items-center gap-1 hover:underline"
              >
                <Rating
                  value={profile.averageRating}
                  reviewCount={profile.totalReviews}
                  size="md"
                />
              </button>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-slate-400">location_on</span>
                  {profile.city}, {profile.state}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-slate-400">workspace_premium</span>
                  {profile.experienceYears}+ years of Vedic expertise
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-slate-400">calendar_check</span>
                  {profile.totalBookings} ceremonies performed
                </span>
              </div>

              {/* Languages */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.languages.map(lang => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full"
                  >
                    <span className="material-symbols-outlined text-xs">translate</span>
                    {lang}
                  </span>
                ))}
                {profile.sect && (
                  <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full">
                    {profile.sect}
                  </span>
                )}
              </div>

              {/* Share + Desktop Book */}
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <ShareButton name={profile.displayName} />
                <div className="hidden lg:flex items-center gap-2">
                  <Button
                    size="lg"
                    onClick={() => handleBook()}
                    icon="calendar_add_on"
                  >
                    Book Now
                  </Button>
                  <a
                    href={`https://wa.me/919999999999?text=${encodeURIComponent(`Hi! I want to book ${profile.displayName} for a ceremony.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 h-12 px-5 text-sm font-bold text-green-600 border-2 border-green-200 dark:border-green-800 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">whatsapp</span>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ── 2. BIO ──────────────────────────────────────────────────────── */}
        <Card id="about" padding="lg">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">person_book</span>
            परिचय (About)
          </h2>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
            {profile.bio || "Profile description coming soon."}
          </p>

          {profile.gotra && (
            <p className="mt-2 text-xs text-slate-400">
              Gotra: <span className="font-semibold text-slate-600 dark:text-slate-300">{profile.gotra}</span>
            </p>
          )}

          {profile.specializations.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Specializations
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.specializations.map(s => (
                  <span
                    key={s}
                    className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Verification badges */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4">
            <VerificationBadge
              label="Aadhaar Verified"
              done={profile.aadhaarVerified}
            />
            <VerificationBadge
              label="Certificates Verified"
              done={profile.certificatesVerified}
            />
            <VerificationBadge
              label="Bank Account Added"
              done={true}
            />
          </div>
        </Card>

        {/* ── 3. SERVICES & PRICING ───────────────────────────────────────── */}
        <Card id="services" padding="none">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">auto_stories</span>
              सेवाएं और दक्षिणा (Services &amp; Pricing)
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {profile.services.map(service => (
              <div
                key={service.name}
                className="flex items-center gap-4 p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {service.name}
                    </span>
                    <span className="text-xs text-slate-400">{service.nameHindi}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      {service.durationHours}h
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{service.description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <PriceDisplay amount={service.basePrice} size="featured" />
                  <Button
                    size="sm"
                    onClick={() => handleBook(service.name)}
                    icon="calendar_add_on"
                  >
                    Book
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-800/30">
            <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
              <span className="material-symbols-outlined text-sm flex-shrink-0">info</span>
              * यह दक्षिणा की राशि है। Travel और Samagri का खर्च अलग से जोड़ा जाएगा।
            </p>
          </div>
        </Card>

        {/* ── 4. GALLERY ──────────────────────────────────────────────────── */}
        <Card id="gallery" padding="lg">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">photo_library</span>
            Gallery
          </h2>
          <Gallery images={profile.galleryImages} />
        </Card>

        {/* ── 5. REVIEWS ──────────────────────────────────────────────────── */}
        <div id="reviews" ref={reviewsRef}>
        <Card padding="none">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">reviews</span>
              Reviews &amp; Ratings
            </h2>
          </div>

          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <RatingBreakdown reviews={profile.reviews} avg={profile.averageRating} />
          </div>

          <div>
            {visibleReviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {reviewsShown < profile.reviews.length && (
            <div className="p-5 flex justify-center">
              <button
                onClick={() => setReviewsShown(n => n + 5)}
                className="flex items-center gap-2 text-sm text-primary font-bold hover:underline"
              >
                Load More Reviews
                <span className="material-symbols-outlined text-base">expand_more</span>
              </button>
            </div>
          )}
        </Card>
        </div>

        {/* ── 6. AVAILABILITY ─────────────────────────────────────────────── */}
        <Card id="availability" padding="lg">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">calendar_month</span>
            Availability
          </h2>
          {profile.availableDays.length > 0 ? (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Available on:{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {profile.availableDays.join(", ")}
                </span>
              </p>
              <AvailabilityCalendar availableDays={profile.availableDays} />
            </>
          ) : (
            <p className="text-sm text-slate-400">Availability calendar loading…</p>
          )}
        </Card>

      </div>

      {/* ── Sticky Mobile Bottom CTA ─────────────────────────────────────── */}
      <StickyBookingBar panditId={panditId} services={profile.services} />
    </div>
  );
}

// ── Verification Badge ────────────────────────────────────────────────────────

function VerificationBadge({ label, done }: { label: string; done: boolean }) {
  return (
    <span className={`flex items-center gap-1.5 text-xs font-semibold ${done ? "text-green-600 dark:text-green-400" : "text-slate-400"}`}>
      <span
        className="material-symbols-outlined text-base"
        style={done ? { fontVariationSettings: "'FILL' 1" } : {}}
      >
        {done ? "check_circle" : "radio_button_unchecked"}
      </span>
      {label}
    </span>
  );
}
