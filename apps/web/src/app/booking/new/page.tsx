import { Suspense } from "react";
import BookingWizardClient from "./booking-wizard-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Pandit — HmarePanditJi",
  description:
    "Book a verified pandit for your ceremony. Choose puja type, select pandit, pick travel mode, and pay securely.",
};

export default function NewBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#f49d25] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BookingWizardClient />
    </Suspense>
  );
}
