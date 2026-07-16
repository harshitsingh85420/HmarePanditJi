import { redirect } from "next/navigation";

// This route was a STATIC CHECKOUT MOCKUP — a hardcoded wedding booking
// (₹21,000 dakshina, fixed pandit/venue/date) with no data and no payment.
// The real flow is the /booking/new wizard → POST /bookings →
// /payments/create-order → RazorpayCheckout (server-verified). Legacy URL
// visitors are sent to the real flow.
export default function LegacyBookingCheckoutRedirect() {
  redirect("/booking/new");
}
