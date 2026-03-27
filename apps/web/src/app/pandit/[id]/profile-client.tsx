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
import { useAuth } from "../../../context/auth-context";
import { LoginModal } from "../../../components/LoginModal";

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
    description:
      "Navgraha shanti puja and pitra tarpan for peace & prosperity.",
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
  specializations: [
    "Vivah Sanskar",
    "Griha Pravesh",
    "Satyanarayan Katha",
    "Rudrabhishek",
  ],
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
  availableDays: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
  aadhaarVerified: true,
  certificatesVerified: true,
  services: MOCK_SERVICES,
  reviews: MOCK_REVIEWS,
};

// ── API fetch ─────────────────────────────────────────────────────────────────

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

async function fetchProfile(id: string): Promise<PanditProfile> {
  try {
    const [panditRes, reviewsRes] = await Promise.all([
      fetch(`${API_URL}/pandits/${id}`, { signal: AbortSignal.timeout(5000) }),
      fetch(`${API_URL}/pandits/${id}/reviews`, {
        signal: AbortSignal.timeout(5000),
      }),
    ]);
    if (!panditRes.ok) throw new Error(&quot;not found&quot;);
    const { data: pandit } = await panditRes.json();
    const reviewsBody = reviewsRes.ok ? await reviewsRes.json() : { data: [] };
    const rawReviews: Record<string, unknown>[] = Array.isArray(
      reviewsBody.data,
    )
      ? reviewsBody.data
      : [];

    const services: PanditService[] = (pandit.pujaServices ?? []).map(
      (s: Record<string, unknown>) => ({
        name: String(s.pujaType),
        nameHindi: String(s.pujaType),
        durationHours: Number(s.durationHours) || 2,
        basePrice: Number(s.dakshinaAmount) || 0,
        description: String(s.description ?? &quot;&quot;),
      }),
    );

    const rs = (pandit.reviewSummary ?? {}) as Record<string, unknown>;

    return {
      id: pandit.id,
      displayName:
        ((pandit.user as Record<string, unknown>)?.name as string) ??
        pandit.name ??
        &quot;Pandit Ji&quot;,
      bio: pandit.bio ?? &quot;&quot;,
      experienceYears: pandit.experienceYears ?? 0,
      specializations: pandit.specializations ?? [],
      languages: pandit.languages ?? [],
      sect: undefined,
      gotra: undefined,
      city: pandit.location ?? &quot;Delhi&quot;,
      state: &quot;&quot;,
      isVerified: pandit.verificationStatus === &quot;VERIFIED&quot;,
      profilePhotoUrl: pandit.profilePhotoUrl,
      galleryImages: [],
      averageRating: (rs.avgRating as number) ?? pandit.rating ?? 0,
      totalReviews: (rs.totalReviews as number) ?? pandit.totalReviews ?? 0,
      totalBookings: pandit.completedBookings ?? 0,
      availableDays: [],
      aadhaarVerified: pandit.aadhaarVerified ?? false,
      certificatesVerified: false,
      services: services.length > 0 ? services : MOCK_SERVICES,
      reviews: rawReviews.map((r) => ({
        id: String(r.id),
        customerName: String(r.reviewerName ?? &quot;Customer&quot;),
        isAnonymous: r.reviewerName === &quot;Anonymous&quot;,
        overallRating: Number(r.overallRating),
        ritualKnowledge: undefined,
        punctuality: undefined,
        communication: undefined,
        comment: r.comment as string | undefined,
        ceremony: String(r.pujaType ?? &quot;Puja Service&quot;),
        date: String(r.createdAt ?? new Date().toISOString()).split(&quot;T&quot;)[0],
      })),
    };
  } catch {
    return { ...MOCK_PANDIT, id };
  }
}

// ── Availability Calendar ─────────────────────────────────────────────────────

type DayStatus = &quot;available&quot; | &quot;booked&quot; | &quot;blocked&quot; | &quot;past&quot;;
interface DayInfo {
  date: string;
  status: DayStatus;
  reason?: string;
}

function AvailabilityCalendar({ panditId }: { panditId: string }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1); // 1-12
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [dayData, setDayData] = useState<Map<string, DayInfo>>(new Map());
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    setFetching(true);
    fetch(
      `${API_URL}/pandits/${panditId}/availability?month=${viewMonth}&year=${viewYear}`,
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (body?.data) {
          const map = new Map<string, DayInfo>();
          for (const d of body.data as DayInfo[]) map.set(d.date, d);
          setDayData(map);
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [panditId, viewMonth, viewYear]);

  const DAY_NAMES = [&quot;Su&quot;, &quot;Mo&quot;, &quot;Tu&quot;, &quot;We&quot;, &quot;Th&quot;, &quot;Fr&quot;, &quot;Sa&quot;];
  const MONTH_NAMES = [
    &quot;January&quot;,
    &quot;February&quot;,
    &quot;March&quot;,
    &quot;April&quot;,
    &quot;May&quot;,
    &quot;June&quot;,
    &quot;July&quot;,
    &quot;August&quot;,
    &quot;September&quot;,
    &quot;October&quot;,
    &quot;November&quot;,
    &quot;December&quot;,
  ];

  const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

  function goNext() {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  }
  function goPrev() {
    const mn = viewMonth === 1 ? 12 : viewMonth - 1;
    const yn = viewMonth === 1 ? viewYear - 1 : viewYear;
    if (
      new Date(yn, mn - 1, 1) <
      new Date(today.getFullYear(), today.getMonth(), 1)
    )
      return;
    setViewMonth(mn);
    setViewYear(yn);
  }

  const canGoNext =
    new Date(viewYear, viewMonth, 1) <
    new Date(today.getFullYear(), today.getMonth() + 3, 1);
  const canGoPrev =
    new Date(viewYear, viewMonth - 1, 1) >
    new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div>
      {/* Nav */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={!canGoPrev}
          className="rounded-lg p-1.5 transition-colors hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-lg text-slate-500">
            chevron_left
          </span>
        </button>
        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
          {MONTH_NAMES[viewMonth - 1]} {viewYear}
          {fetching && (
            <span className="ml-2 text-base font-normal text-slate-400">
              loading…
            </span>
          )}
        </span>
        <button
          onClick={goNext}
          disabled={!canGoNext}
          className="rounded-lg p-1.5 transition-colors hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-lg text-slate-500">
            chevron_right
          </span>
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7">
        {DAY_NAMES.map((d) => (
          <span
            key={d}
            className="py-3 text-center text-[10px] font-bold uppercase text-slate-400"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <span key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${viewYear}-${String(viewMonth).padStart(2, &quot;0&quot;)}-${String(day).padStart(2, &quot;0&quot;)}`;
          const info = dayData.get(dateStr);
          const status = info?.status ?? (fetching ? &quot;past&quot; : &quot;available&quot;);
          const isToday =
            day === today.getDate() &&
            viewMonth === today.getMonth() + 1 &&
            viewYear === today.getFullYear();

          const cls = isToday
            ? &quot;ring-2 ring-primary font-bold text-primary&quot;
            : status === &quot;past&quot;
              ? &quot;text-slate-300 dark:text-slate-700&quot;
              : status === &quot;available&quot;
                ? &quot;bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-pointer hover:bg-green-200&quot;
                : status === &quot;booked&quot;
                  ? &quot;bg-orange-100 dark:bg-orange-900/30 text-orange-500 cursor-not-allowed&quot;
                  : &quot;bg-red-50 dark:bg-red-900/20 text-red-400 cursor-not-allowed&quot;;

          return (
            <div
              key={day}
              title={info?.reason}
              className={`flex h-12 w-full items-center justify-center rounded-lg text-base font-medium transition-colors ${cls}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3 dark:border-slate-800">
        <span className="flex items-center gap-1.5 text-base text-slate-500">
          <span className="h-3 w-3 rounded border border-green-300 bg-green-100 dark:bg-green-900/30" />
          Available
        </span>
        <span className="flex items-center gap-1.5 text-base text-slate-500">
          <span className="h-3 w-3 rounded border border-orange-300 bg-orange-100 dark:bg-orange-900/30" />
          Booked
        </span>
        <span className="flex items-center gap-1.5 text-base text-slate-500">
          <span className="h-3 w-3 rounded border border-red-200 bg-red-50 dark:bg-red-900/20" />
          Blocked
        </span>
        <span className="flex items-center gap-1.5 text-base text-slate-500">
          <span className="ring-primary h-3 w-3 rounded ring-2" />
          Today
        </span>
      </div>
    </div>
  );
}

// ── Rating Breakdown ──────────────────────────────────────────────────────────

function RatingBreakdown({
  reviews,
  avg,
}: {
  reviews: ReviewItem[];
  avg: number;
}) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.overallRating === star).length,
  }));
  const max = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
      {/* Big number */}
      <div className="flex-shrink-0 text-center">
        <div className="text-5xl font-black text-slate-900 dark:text-slate-100">
          {avg.toFixed(1)}
        </div>
        <div className="mt-1 flex items-center justify-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              className="material-symbols-outlined text-base text-orange-500"
              style={{
                fontVariationSettings:
                  s <= Math.round(avg) ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              star
            </span>
          ))}
        </div>
        <div className="mt-1 text-base text-slate-400">
          {reviews.length} reviews
        </div>
      </div>

      {/* Bars */}
      <div className="w-full flex-1 space-y-1.5">
        {counts.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-3">
            <span className="w-4 text-base text-slate-500">{star}</span>
            <span
              className="material-symbols-outlined text-base text-orange-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-orange-400 transition-all duration-500"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="w-4 text-base text-slate-400">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Review Card ───────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: ReviewItem }) {
  const subRatings = [
    { label: &quot;Knowledge&quot;, value: review.ritualKnowledge },
    { label: &quot;Punctuality&quot;, value: review.punctuality },
    { label: &quot;Communication&quot;, value: review.communication },
  ].filter((r) => r.value !== undefined);

  return (
    <div className="border-b border-slate-100 p-5 last:border-0 dark:border-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full">
            <span className="material-symbols-outlined text-primary text-base">
              person
            </span>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {review.isAnonymous ? &quot;Anonymous&quot; : review.customerName}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <Rating
                value={review.overallRating}
                showValue={false}
                size="sm"
              />
              <Badge variant="info">{review.ceremony}</Badge>
            </div>
          </div>
        </div>
        <span className="flex-shrink-0 text-base text-slate-400">
          {new Date(review.date).toLocaleDateString(&quot;en-IN&quot;, {
            day: &quot;numeric&quot;,
            month: &quot;short&quot;,
            year: &quot;numeric&quot;,
          })}
        </span>
      </div>

      {subRatings.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {subRatings.map((r) => (
            <span
              key={r.label}
              className="flex items-center gap-1 text-[10px] text-slate-500"
            >
              <span
                className="material-symbols-outlined text-base text-orange-400"
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
        <p className="mt-3 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
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
        <span className="material-symbols-outlined mb-3 text-5xl text-slate-300">
          photo_library
        </span>
        <p className="text-lg text-slate-400">Gallery photos coming soon</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.slice(0, 6).map((src, i) => (
          <button
            key={i}
            onClick={() => setLightbox(src)}
            className="relative aspect-video overflow-hidden rounded-xl bg-slate-100 transition-opacity hover:opacity-90 dark:bg-slate-800"
          >
            <img
              src={src}
              alt={`Gallery photo ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <img
            src={lightbox}
            alt="Gallery"
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
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
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, &quot;_blank&quot;);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-5 py-3.5 text-base font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        title="Copy link"
      >
        <span className="material-symbols-outlined text-lg">
          {copied ? &quot;check&quot; : &quot;link&quot;}
        </span>
        {copied ? &quot;Copied!&quot; : &quot;Share&quot;}
      </button>
      <button
        onClick={shareWhatsApp}
        className="flex items-center gap-1.5 rounded-lg border border-green-200 px-5 py-3.5 text-base font-semibold text-green-600 transition-colors hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
        title="Share on WhatsApp"
      >
        <span className="material-symbols-outlined text-lg">whatsapp</span>
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
  const [selectedService, setSelectedService] = useState(
    services[0]?.name ?? &quot;&quot;,
  );
  const [date, setDate] = useState(&quot;&quot;);

  const price =
    services.find((s) => s.name === selectedService)?.basePrice ?? 0;

  function handleBook() {
    const params = new URLSearchParams();
    params.set(&quot;panditId&quot;, panditId);
    if (selectedService) params.set(&quot;ritual&quot;, selectedService);
    if (date) params.set(&quot;date&quot;, date);
    router.push(`/book?${params.toString()}`);
  }

  function handleWhatsApp() {
    const text = `Namaste! Main ${selectedService || &quot;puja&quot;} ke liye booking karna chahta hoon.${date ? ` Date: ${date}` : &quot;&quot;}`;
    window.open(
      `https://wa.me/919999999999?text=${encodeURIComponent(text)}`,
      &quot;_blank&quot;,
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white px-4 py-3 shadow-2xl shadow-black/20 lg:hidden dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        {/* Service select */}
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="focus:ring-primary min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-base text-slate-700 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {services.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Date */}
        <input
          type="date"
          value={date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setDate(e.target.value)}
          className="focus:ring-primary w-32 rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-base text-slate-700 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        />

        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="flex-shrink-0 rounded-xl bg-green-500 p-2.5 text-white transition-colors hover:bg-green-600"
          title="WhatsApp"
        >
          <span className="material-symbols-outlined text-base">whatsapp</span>
        </button>

        {/* Book */}
        <button
          onClick={handleBook}
          className="bg-primary hover:bg-primary/90 shadow-primary/20 flex-shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-base font-black text-white shadow-lg transition-colors"
        >
          {price > 0 ? `₹${(price / 1000).toFixed(0)}k बुक करें` : &quot;Book Now&quot;}
        </button>
      </div>
    </div>
  );
}

// ── Section Nav ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: &quot;about&quot;, label: &quot;परिचय&quot; },
  { id: &quot;services&quot;, label: &quot;Services&quot; },
  { id: &quot;gallery&quot;, label: &quot;Gallery&quot; },
  { id: &quot;reviews&quot;, label: &quot;Reviews&quot; },
  { id: &quot;availability&quot;, label: &quot;Availability&quot; },
];

function scrollTo(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: &quot;smooth&quot;, block: &quot;start&quot; });
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
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(&quot;&quot;);

  useEffect(() => {
    if (initialData) {
      const d = initialData as Record<string, unknown>;
      const rs = (d.reviewSummary as Record<string, unknown> | undefined) ?? {};
      const rawServices = Array.isArray(d.pujaServices)
        ? (d.pujaServices as Record<string, unknown>[])
        : [];
      const services: PanditService[] = rawServices.map((s) => ({
        name: String(s.pujaType),
        nameHindi: String(s.pujaType),
        durationHours: Number(s.durationHours) || 2,
        basePrice: Number(s.dakshinaAmount) || 0,
        description: String(s.description ?? &quot;&quot;),
      }));
      setProfile({
        id: panditId,
        displayName:
          ((d.user as Record<string, unknown>)?.name as string) ??
          (d.name as string) ??
          &quot;Pandit Ji&quot;,
        bio: (d.bio as string) ?? &quot;&quot;,
        experienceYears: (d.experienceYears as number) ?? 0,
        specializations: (d.specializations as string[]) ?? [],
        languages: (d.languages as string[]) ?? [],
        sect: undefined,
        gotra: undefined,
        city: (d.location as string) ?? &quot;Delhi&quot;,
        state: &quot;&quot;,
        isVerified: d.verificationStatus === &quot;VERIFIED&quot;,
        profilePhotoUrl: d.profilePhotoUrl as string | undefined,
        galleryImages: [],
        averageRating: (rs.avgRating as number) ?? (d.rating as number) ?? 0,
        totalReviews:
          (rs.totalReviews as number) ?? (d.totalReviews as number) ?? 0,
        totalBookings: (d.completedBookings as number) ?? 0,
        availableDays: [],
        aadhaarVerified: (d.aadhaarVerified as boolean) ?? false,
        certificatesVerified: false,
        services: services.length > 0 ? services : MOCK_SERVICES,
        reviews: MOCK_REVIEWS,
      });
      setLoading(false);
    } else {
      fetchProfile(panditId).then((p) => {
        setProfile(p);
        setLoading(false);
      });
    }
  }, [panditId, initialData]);

  const handleBook = useCallback(
    (service?: string) => {
      if (authLoading) return;
      const params = new URLSearchParams({ panditId });
      if (service) params.set(&quot;ritual&quot;, service);

      if (!isAuthenticated) {
        setRedirectUrl(`/booking/new?${params.toString()}`);
        setLoginModalOpen(true);
      } else {
        router.push(`/book?${params.toString()}`);
      }
    },
    [router, panditId, isAuthenticated, authLoading],
  );

  if (loading || !profile) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
        {[180, 120, 200, 160].map((h, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
            style={{ height: h }}
          />
        ))}
      </div>
    );
  }

  const visibleReviews = profile.reviews.slice(0, reviewsShown);

  return (
    <div className="min-h-screen bg-[#f8f7f5] pb-24 lg:pb-10 dark:bg-[#221a10]">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {/* ── Section Nav (sticky) ─────────────────────────────────────── */}
        <div className="sticky top-16 z-20 -mx-4 border-b border-slate-200/60 bg-[#f8f7f5]/90 px-4 py-2 backdrop-blur-md dark:border-slate-800/60 dark:bg-[#221a10]/90">
          <div className="scrollbar-hide flex gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="hover:text-primary hover:bg-primary/10 flex-shrink-0 rounded-full px-4 py-3.5 text-base font-semibold text-slate-600 transition-colors dark:text-slate-400"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 1. PROFILE HERO ─────────────────────────────────────────────── */}
        <Card padding="lg" variant="default">
          <div className="flex flex-col gap-6 sm:flex-row">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar
                src={profile.profilePhotoUrl}
                alt={profile.displayName}
                size="xl"
                verifiedBadge={profile.isVerified}
              />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              {/* Badges */}
              <div className="mb-2 flex flex-wrap gap-1.5">
                {profile.isVerified && (
                  <Badge variant="success" icon="verified">
                    Verified Vedic
                  </Badge>
                )}
                {profile.aadhaarVerified && (
                  <Badge variant="success" icon="badge">
                    Aadhaar Verified
                  </Badge>
                )}
                {profile.certificatesVerified && (
                  <Badge
                    variant="info"
                    icon={
                      <span className="material-symbols-outlined text-[10px]">
                        school
                      </span>
                    }
                  >
                    Certified Shastri
                  </Badge>
                )}
                {profile.availableDays.length >= 6 && (
                  <Badge variant="neutral" icon="directions_car">
                    Self-Drive Available
                  </Badge>
                )}
              </div>

              {/* Name */}
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {profile.displayName}
              </h1>

              {/* Rating — clickable → reviews */}
              <button
                onClick={() =>
                  reviewsRef.current?.scrollIntoView({ behavior: &quot;smooth&quot; })
                }
                className="mt-1 inline-flex items-center gap-1 hover:underline"
              >
                <Rating value={profile.averageRating} size="md" />
                <span className="text-lg text-slate-500">
                  ({profile.totalReviews} reviews)
                </span>
              </button>

              {/* Meta row */}
              <div className="mt-2 flex flex-wrap items-center gap-4 text-lg text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-slate-400">
                    location_on
                  </span>
                  {profile.city}
                  {profile.state ? `, ${profile.state}` : &quot;&quot;}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-slate-400">
                    workspace_premium
                  </span>
                  {profile.experienceYears}+ years of Vedic expertise
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-slate-400">
                    calendar_check
                  </span>
                  {profile.totalBookings} ceremonies performed
                </span>
              </div>

              {/* Languages */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {profile.languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-4.5 py-3 text-base text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  >
                    <span className="material-symbols-outlined text-base">
                      translate
                    </span>
                    {lang}
                  </span>
                ))}
                {profile.sect && (
                  <span className="bg-primary/10 text-primary rounded-full px-4.5 py-3 text-base">
                    {profile.sect}
                  </span>
                )}
              </div>

              {/* Share + Desktop Book */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <ShareButton name={profile.displayName} />
                <div className="hidden items-center gap-2 lg:flex">
                  <Button
                    size="lg"
                    onClick={() => handleBook()}
                    leftIcon={
                      <span className="material-symbols-outlined text-base">
                        calendar_add_on
                      </span>
                    }
                  >
                    Book Now
                  </Button>
                  <a
                    href={`https://wa.me/919999999999?text=${encodeURIComponent(`Hi! I want to book ${profile.displayName} for a ceremony.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 items-center gap-2 rounded-xl border-2 border-green-200 px-5 text-lg font-bold text-green-600 transition-colors hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                  >
                    <span className="material-symbols-outlined text-base">
                      whatsapp
                    </span>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ── 2. BIO ──────────────────────────────────────────────────────── */}
        <Card id="about" padding="lg">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
            <span className="material-symbols-outlined text-primary text-xl">
              person_book
            </span>
            परिचय (About)
          </h2>

          <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            {profile.bio || &quot;Profile description coming soon.&quot;}
          </p>

          {profile.gotra && (
            <p className="mt-2 text-base text-slate-400">
              Gotra:{&quot; &quot;}
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {profile.gotra}
              </span>
            </p>
          )}

          {profile.specializations.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-base font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Specializations
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.specializations.map((s) => (
                  <span
                    key={s}
                    className="bg-primary/10 text-primary rounded-full px-5 py-3 text-base font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Verification badges */}
          <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <VerificationBadge
              label="Aadhaar Verified"
              done={profile.aadhaarVerified}
            />
            <VerificationBadge
              label="Certificates Verified"
              done={profile.certificatesVerified}
            />
            <VerificationBadge label="Bank Account Added" done={true} />
          </div>
        </Card>

        {/* ── 3. SERVICES & PRICING ───────────────────────────────────────── */}
        <Card id="services" padding="none">
          <div className="border-b border-slate-100 p-6 dark:border-slate-800">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <span className="material-symbols-outlined text-primary text-xl">
                auto_stories
              </span>
              सेवाएं और दक्षिणा (Services &amp; Pricing)
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {profile.services.map((service) => (
              <div
                key={service.name}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 sm:p-5 dark:hover:bg-slate-800/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {service.name}
                    </span>
                    <span className="text-base text-slate-400">
                      {service.nameHindi}
                    </span>
                    <span className="flex items-center gap-0.5 text-base text-slate-400">
                      <span className="material-symbols-outlined text-base">
                        schedule
                      </span>
                      {service.durationHours}h
                    </span>
                  </div>
                  <p className="mt-0.5 text-base text-slate-400">
                    {service.description}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <PriceDisplay amount={service.basePrice} size="featured" />
                  <Button
                    size="sm"
                    onClick={() => handleBook(service.name)}
                    leftIcon={
                      <span className="material-symbols-outlined text-lg">
                        calendar_add_on
                      </span>
                    }
                  >
                    Book
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-amber-100 bg-amber-50 px-5 py-3 dark:border-amber-800/30 dark:bg-amber-900/10">
            <p className="flex items-start gap-1.5 text-base text-amber-700 dark:text-amber-400">
              <span className="material-symbols-outlined flex-shrink-0 text-lg">
                info
              </span>
              * यह दक्षिणा की राशि है। Travel और Samagri का खर्च अलग से जोड़ा
              जाएगा।
            </p>
          </div>
        </Card>

        {/* ── 4. GALLERY ──────────────────────────────────────────────────── */}
        <Card id="gallery" padding="lg">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
            <span className="material-symbols-outlined text-primary text-xl">
              photo_library
            </span>
            Gallery
          </h2>
          <Gallery images={profile.galleryImages} />
        </Card>

        {/* ── 5. REVIEWS ──────────────────────────────────────────────────── */}
        <div id="reviews" ref={reviewsRef}>
          <Card padding="none">
            <div className="border-b border-slate-100 p-6 dark:border-slate-800">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                <span className="material-symbols-outlined text-primary text-xl">
                  reviews
                </span>
                Reviews &amp; Ratings
              </h2>
            </div>

            <div className="border-b border-slate-100 p-6 dark:border-slate-800">
              <RatingBreakdown
                reviews={profile.reviews}
                avg={profile.averageRating}
              />
            </div>

            <div>
              {visibleReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {reviewsShown < profile.reviews.length && (
              <div className="flex justify-center p-5">
                <button
                  onClick={() => setReviewsShown((n) => n + 5)}
                  className="text-primary flex items-center gap-2 text-lg font-bold hover:underline"
                >
                  Load More Reviews
                  <span className="material-symbols-outlined text-base">
                    expand_more
                  </span>
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* ── 6. AVAILABILITY ─────────────────────────────────────────────── */}
        <Card id="availability" padding="lg">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
            <span className="material-symbols-outlined text-primary text-xl">
              calendar_month
            </span>
            Availability
          </h2>
          <AvailabilityCalendar panditId={panditId} />
        </Card>
      </div>

      {/* ── Sticky Mobile Bottom CTA ─────────────────────────────────────── */}
      {profile && (
        <StickyBookingBar panditId={panditId} services={profile.services} />
      )}

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        redirectAfterLogin={redirectUrl}
      />
    </div>
  );
}

// ── Verification Badge ────────────────────────────────────────────────────────

function VerificationBadge({ label, done }: { label: string; done: boolean }) {
  return (
    <span
      className={`flex items-center gap-1.5 text-base font-semibold ${done ? "text-green-600 dark:text-green-400" : "text-slate-400"}`}
    >
      <span
        className="material-symbols-outlined text-base"
        style={done ? { fontVariationSettings: "'FILL' 1" } : {}}
      >
        {done ? &quot;check_circle&quot; : &quot;radio_button_unchecked&quot;}
      </span>
      {label}
    </span>
  );
}
