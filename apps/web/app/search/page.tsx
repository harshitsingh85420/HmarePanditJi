import type { Metadata } from "next";
import { Suspense } from "react";
import SearchClient from "./search-client";

export const metadata: Metadata = {
  title: "Find a Pandit — HmarePanditJi",
  description:
    "Search and book verified Pandit jis for your ceremony in Delhi-NCR. Filter by ceremony and city.",
  robots: { index: true, follow: true },
};

interface SearchPageProps {
  searchParams: {
    /** the CANONICAL Track 2A value — the vocabulary /ceremonies deep-links.
     *  The old `ritual` param is KILLED (batch 3, ruled): its Title-Case
     *  values were ones the filter could never match, so every link built on
     *  it was dead. */
    pujaType?: string;
    date?: string;
    city?: string;
    sort?: string;
    page?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
          <span className="text-slate-400 text-lg">Loading…</span>
        </div>
      }
    >
      <SearchClient initialParams={searchParams} />
    </Suspense>
  );
}
