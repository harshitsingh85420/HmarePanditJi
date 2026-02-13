import { redirect } from "next/navigation";

/**
 * Redirect /dashboard/bookings → /bookings
 * The real bookings page lives at /bookings with the full 876‑line client component.
 */
export default function DashboardBookingsPage() {
  redirect("/bookings");
}
