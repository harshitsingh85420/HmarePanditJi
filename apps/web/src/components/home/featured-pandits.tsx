"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PanditCard } from "@hmarepanditji/ui";

interface PanditData {
  id: string;
  displayName: string;
  profilePhotoUrl?: string;
  rating: number;
  totalReviews: number;
  specializations: string[];
  city: string;
  experienceYears: number;
  isVerified: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export function FeaturedPandits() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pandits, setPandits] = useState<PanditData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPandits = async () => {
      try {
        const res = await fetch(
          `${API_URL}/pandits?sort=rating&limit=6&isVerified=true`,
          { signal: controller.signal },
        );
        if (res.ok) {
          const json = await res.json();
          setPandits(json.data ?? json ?? []);
        }
      } catch {
        // API not available
      } finally {
        setLoading(false);
      }
    };
    fetchPandits();
    return () => controller.abort();
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  /* Loading skeletons */
  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-72 h-48 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  /* Empty state */
  if (pandits.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">
          person_search
        </span>
        <p className="text-sm text-slate-400 mt-3">
          Featured pandits will appear here once the API is running.
        </p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Scroll buttons (desktop) */}
      <button
        onClick={() => scroll("left")}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hidden md:flex opacity-0 group-hover:opacity-100"
      >
        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">chevron_left</span>
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hidden md:flex opacity-0 group-hover:opacity-100"
      >
        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">chevron_right</span>
      </button>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
      >
        {pandits.map((p) => (
          <div key={p.id} className="flex-shrink-0 w-72 snap-start">
            <PanditCard
              id={p.id}
              name={p.displayName}
              photoUrl={p.profilePhotoUrl}
              rating={p.rating}
              totalReviews={p.totalReviews}
              specializations={p.specializations}
              location={p.city}
              experienceYears={p.experienceYears}
              isVerified={p.isVerified}
              onViewProfile={(id) => router.push(`/pandit/${id}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
