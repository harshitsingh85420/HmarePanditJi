import type { Metadata } from "next";
import { Suspense } from "react";
import BookClient from "./book-client";

export const metadata: Metadata = {
  title: "Book a Pandit — HmarePanditJi",
  description: "Complete your pandit booking in a few simple steps.",
  robots: { index: false, follow: false },
};

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Loading booking wizard…</p>
          </div>
        </div>
      }
    >
      <BookClient />
    </Suspense>
  );
}
