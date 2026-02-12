import type { Metadata } from "next";
import BookingDetailClient from "./booking-detail-client";

export const metadata: Metadata = {
  title: "Booking Details",
  robots: { index: false, follow: false },
};

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  return <BookingDetailClient bookingId={params.id} />;
}
