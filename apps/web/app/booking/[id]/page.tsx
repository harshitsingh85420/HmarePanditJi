import { redirect } from "next/navigation";

/**
 * Redirect /booking/:id → /bookings/:id
 * The real booking detail page lives at /bookings/[id] with the full
 * 1119-line client component (status timeline, price breakdown, etc.).
 */
export default function BookingDetailRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/bookings/${params.id}`);
}
