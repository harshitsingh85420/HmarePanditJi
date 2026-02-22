import type { Metadata } from "next";
import { Suspense } from "react";
import SearchClient from "./search-client";

export const metadata: Metadata = {
  title: "Find a Pandit — HmarePanditJi",
  description:
    "Search and book Aadhaar-verified pandits for your ceremony in Delhi-NCR. Filter by city, ritual, date, budget and travel mode.",
  robots: { index: true, follow: true },
};

interface SearchPageProps {
  searchParams: {
    ritual?: string;
    date?: string;
    city?: string;
    minRating?: string;
    minPrice?: string;
    maxPrice?: string;
    languages?: string;
    sort?: string;
    page?: string;
    travel?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
          <span className="text-slate-400 text-sm">Loading…</span>
        </div>
      }
    >
      <SearchClient initialParams={searchParams} />
    </Suspense>
  );
}
