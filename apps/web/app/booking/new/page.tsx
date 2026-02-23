"use client";

import { Suspense } from "react";
import BookingWizardClient from "./booking-wizard-client";

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">Loading booking flow...</div>}>
      <BookingWizardClient />
    </Suspense>
  );
}
