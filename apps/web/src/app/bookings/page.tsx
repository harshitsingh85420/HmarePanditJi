import type { Metadata } from "next";
import BookingsClient from "./bookings-client";

export const metadata: Metadata = {
  title: "My Bookings",
  description: "View and manage your puja bookings — upcoming ceremonies, past bookings, and cancellations.",
  robots: { index: false, follow: false },
};

export default function BookingsPage() {
  return <BookingsClient />;
}
