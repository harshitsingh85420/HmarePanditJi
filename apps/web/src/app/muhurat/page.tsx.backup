import type { Metadata } from "next";
import { Suspense } from "react";
import MuhuratClient from "./muhurat-client";

export const metadata: Metadata = {
  title: "Muhurat Explorer Calendar | HmarePanditJi",
  description: "Find auspicious timings for your sacred events using our interactive Muhurat Explorer.",
};

export default function MuhuratPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f29e0d] border-t-transparent" />
          <p className="text-slate-500 font-medium animate-pulse">Consulting the Panchang...</p>
        </div>
      </div>
    }>
      <MuhuratClient />
    </Suspense>
  );
}
