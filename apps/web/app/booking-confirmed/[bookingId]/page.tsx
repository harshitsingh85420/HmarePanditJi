"use client";

// ─────────────────────────────────────────────────────────────
// BOOKING CONFIRMED ★ — Track 1, batch 2c.
//
// The canon: "the screenshot screen — routed from gateway return, My Bookings,
// and detail. Zero-inbound-links bug fixed by routing."
//
// THE DEFECT THE CANON PREDICTED WAS REAL: before this batch the string
// "booking-confirmed" appeared in NO source file anywhere in the repo — a
// 191-line screen nothing could reach. The routing edge is now cut at the
// gateway return; this file owns the render.
//
// FOUR FABRICATED CLAIMS REMOVED (ruled):
//   · "Payment Received — successfully processed" rendered UNCONDITIONALLY,
//     never reading paymentStatus. On an AWAITING_PAYMENT booking it asserted
//     a payment that never happened. It now READS the status, and the PENDING
//     branch carries the way back in — F-J7-3's resumable payment, cut into
//     the wall as a door rather than left as a finding.
//   · "SMS confirmation has been sent to your mobile number" — DELETED.
//     Twilio is ABSENT; sends stub to console. The sentence was false.
//   · "Track Journey — real-time location" — DELETED. The canon CUT the
//     tracking screen ("static map, 4 dead controls").
//   · "confirm within 6 hours" — DELETED. F-J9-4,
//     DEADLINE-ON-NONEXISTENT-ACTION, on its second surface.
//
// 2026-08-02 — THE LANGUAGE REVERSAL, ruled by Isj against my own copy.
// 2c shipped this screen with a Devanagari H1 and a Devanagari status line
// ("बुकिंग दर्ज हो गई", "भुगतान बाक़ी है"), plus a Devanagari fee disclosure
// and hi-IN dates. The customer canon's turn-4 law permits Devanagari in
// exactly two places — a pandit's name beneath its Roman form, and the
// CEREMONY NAME on this very screen — and nowhere else: "never instructions ·
// never buttons · never anything he must act on." A status line is the most
// actionable sentence on the page.
//
// The breach was mine and was cited BY ME two batches later while enforcing
// the same law on /help. A LAW YOU QUOTE AT A NEW SURFACE IS A LAW YOU HAVE
// JUST AUDITED YOURSELF AGAINST — that is the whole reason it surfaced.
// The one accent this screen is entitled to (the ceremony name) is NOT added
// here; that is a design addition, not a breach repair.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../../src/context/auth-context";
import { Copy, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Header } from "@hmarepanditji/ui";
import { panditTitleName, panditInitial } from "../../../lib/panditIdentity";
import { SurfaceState } from "../../../components/design-system/SurfaceState";
import { resolveApiBase } from "@hmarepanditji/utils";

const API_URL = resolveApiBase(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NODE_ENV === "development",
).base;

export default function BookingConfirmedPage() {
  const params = useParams();
  const { accessToken } = useAuth();
  const bookingId = params?.bookingId as string | undefined;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const fetchBooking = useCallback(async () => {
    if (!accessToken || !bookingId) return;
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data: any = await res.json();
      if (!res.ok || !data.success) throw new Error("load failed");
      setBooking(data.data.booking);
    } catch {
      // ERROR ≠ EMPTY: a failed load must never render as "booking not found".
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [bookingId, accessToken]);

  useEffect(() => {
    if (accessToken) fetchBooking();
  }, [fetchBooking, accessToken]);

  const copyDetails = () => {
    if (!booking) return;
    const txt = `🙏 Puja booked via HmarePanditJi!\nBooking ID: ${booking.bookingNumber}\nEvent: ${booking.eventType}\nDate: ${new Date(booking.eventDate).toLocaleDateString("en-IN")}\nPandit: ${panditTitleName(booking.pandit) ?? "TBA"}`;
    navigator?.clipboard?.writeText(txt).catch(() => {});
    (globalThis as any).alert?.("Copied to clipboard!");
  };

  const shell = (inner: React.ReactNode) => (
    <div className="hpj-root min-h-screen bg-cream-canvas">
      <Header appType="web" />
      <main className="mx-auto w-full max-w-[720px] px-4 py-10 pt-24">{inner}</main>
    </div>
  );

  if (loading) return shell(<SurfaceState kind="loading" subject="your booking" />);
  if (failed) return shell(<SurfaceState kind="error" subject="your booking" onRetry={fetchBooking} />);
  if (!booking)
    return shell(
      <SurfaceState
        kind="empty"
        subject="booking"
        title="We couldn't find that booking"
        body="It may belong to a different account."
        action={
          <Link
            href="/dashboard/bookings"
            className="inline-flex min-h-cta items-center rounded-control bg-saffron px-5 text-body font-semibold text-white"
          >
            See My Bookings
          </Link>
        }
      />,
    );

  // THE PAYMENT TRUTH, read rather than asserted.
  const paid = booking.paymentStatus === "CAPTURED";
  const eventDate = new Date(booking.eventDate).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return shell(
    <div className="overflow-hidden rounded-card border border-hairline bg-cream">
      {/* Green is the platform's ONE accent and may appear only where something
          is genuinely true — so the banner is green ONLY when payment landed. */}
      <div className={`p-6 text-center ${paid ? "bg-tulsi-tint" : "bg-cream-warm"}`}>
        <h1 className={`text-display font-bold ${paid ? "text-tulsi" : "text-ink"}`}>
          {paid ? "🙏 Booking confirmed" : "🙏 Booking received"}
        </h1>
        <p className="mt-1 text-body text-muted">
          {paid ? "Booking confirmed" : "Booking created — payment pending"}
        </p>
      </div>

      <div className="p-5">
        <div className="rounded-panel border border-hairline bg-cream-warm p-4">
          <div className="flex items-start justify-between gap-4 border-b border-hairline pb-3">
            <div>
              <p className="text-micro tracking-micro text-muted">Booking ID</p>
              <p className="text-section font-bold text-ink">{booking.bookingNumber}</p>
            </div>
            <div className="text-right">
              {/* MONEY FLOOR: a price never renders below 14.5px. */}
              <p className="text-micro tracking-micro text-muted">
                {paid ? "Amount paid" : "Amount due"}
              </p>
              <p className="text-money font-bold text-ink tabular">
                ₹{booking.grandTotal?.toLocaleString("en-IN")}
              </p>
              {booking.platformFee > 0 && (
                <p className="mt-1 text-body text-muted">
                  Includes a ₹{booking.platformFee.toLocaleString("en-IN")} platform fee
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-label text-muted">Ceremony</p>
              <p className="text-body font-semibold text-ink">{booking.eventType}</p>
            </div>
            <div>
              <p className="text-label text-muted">Date</p>
              <p className="text-body font-semibold text-ink">{eventDate}</p>
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-cream text-body font-bold text-saffron">
                {panditInitial(booking.pandit) || "P"}
              </span>
              <div>
                <p className="text-label text-muted">Pandit ji</p>
                <p className="text-body font-semibold text-ink">
                  {panditTitleName(booking.pandit) ?? "Not assigned yet"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── WHAT HAPPENS NEXT — only what is true ─────────────────── */}
        <h2 className="mt-6 text-section font-semibold text-ink">What happens next</h2>
        <div className="mt-3 flex flex-col gap-3">
          {paid ? (
            <Row done title="Payment received" body="Your payment has been processed." />
          ) : (
            <Row
              title="Payment pending"
              body="This booking is held, but it is not confirmed until the payment is made."
            />
          )}
          <Row title="Pandit ji confirms" body="Pandit ji will review the request and confirm." />
          <Row
            title="What to keep ready"
            body="Once confirmed, you will see Pandit ji's name and phone number on the booking."
          />
        </div>

        {!paid && (
          // F-J7-3, CUT INTO THE WALL AS A DOOR. The finding was that an
          // abandoned payment is not recoverable, only repeatable — the only
          // route back was re-walking the wizard, which mints a sibling
          // booking. This is where the resume belongs. The control is present
          // and DISABLED WITH ITS REASON PRINTED, because the gateway return
          // leg lands with the funded day's webhook; a button that pretended
          // to work would be the fabrication we just deleted, wearing a
          // helpful face.
          <div className="mt-5 rounded-panel border border-hairline bg-cream-warm p-4">
            <button
              type="button"
              disabled
              className="min-h-cta w-full rounded-control bg-saffron px-5 text-body font-semibold text-white disabled:opacity-40"
            >
              Complete payment
            </button>
            <p className="mt-2 text-label text-muted">
              Online payment opens once our payment confirmation is live — until then,
              call us and we will take it from there.
            </p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={copyDetails}
            className="flex min-h-cta items-center justify-center gap-2 rounded-control border border-hairline bg-cream text-body font-semibold text-ink"
          >
            <Copy size={18} /> Copy details
          </button>
          <Link
            href={`/dashboard/bookings/${booking.id}`}
            className="flex min-h-cta items-center justify-center gap-2 rounded-control bg-saffron text-body font-semibold text-white"
          >
            View details <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>,
  );
}

function Row({ title, body, done }: { title: string; body: string; done?: boolean }) {
  return (
    <div className="flex gap-3">
      <span className={`mt-0.5 text-body ${done ? "text-tulsi" : "text-muted"}`} aria-hidden="true">
        {done ? "✓" : "•"}
      </span>
      <div>
        <p className="text-body font-semibold text-ink">{title}</p>
        <p className="text-body text-muted">{body}</p>
      </div>
    </div>
  );
}
