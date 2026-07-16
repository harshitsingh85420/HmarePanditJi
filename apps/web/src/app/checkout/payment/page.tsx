import { redirect } from "next/navigation";

// This route used to be a STATIC PAYMENT MOCKUP — a hardcoded ₹79,868 summary,
// a fake saved card, a raw card-number/CVV form (PCI-scope hazard we must never
// own), and a "Pay" button that simply navigated to a success URL: a SIMULATED
// payment. The real, verified path is /book → POST /bookings → RazorpayCheckout
// (Razorpay's own modal) → server-verified signature + webhook. Anyone landing
// on this legacy URL is sent to the real flow.
export default function LegacyCheckoutRedirect() {
  redirect("/book");
}
