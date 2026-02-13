"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface Booking {
  id: string;
  bookingNumber: string;
  eventType: string;
  eventDate: string;
  eventEndDate: string | null;
  muhuratTime: string | null;
  status: string;
  venueAddress: string;
  venueCity: string;
  venuePincode: string;
  venueLatitude: number | null;
  venueLongitude: number | null;
  attendees: number | null;
  specialInstructions: string | null;
  travelRequired: boolean;
  travelMode: string | null;
  travelDistanceKm: number | null;
  travelStatus: string;
  travelBookingRef: string | null;
  travelNotes: string | null;
  foodArrangement: string;
  samagriPreference: string;
  dakshinaAmount: number;
  travelCost: number;
  foodAllowanceAmount: number;
  accommodationCost: number;
  platformFee: number;
  platformFeeGst: number;
  travelServiceFee: number;
  travelServiceFeeGst: number;
  grandTotal: number;
  panditPayout: number;
  payoutStatus: string;
  paymentStatus: string;
  cancelledBy: string | null;
  cancellationReason: string | null;
  refundAmount: number;
  refundStatus: string;
  adminNotes: string | null;
  createdAt: string;
  pandit: { id: string; displayName: string; city: string; profilePhotoUrl: string | null } | null;
  customer: { user: { fullName: string; phone: string; email: string | null } } | null;
  ritual: { name: string; nameHindi: string | null } | null;
}

const STATUS_COLORS: Record<string, string> = {
  CREATED: "bg-slate-500", PENDING: "bg-yellow-500", CONFIRMED: "bg-blue-500",
  TRAVEL_BOOKED: "bg-indigo-500", PANDIT_EN_ROUTE: "bg-purple-500", PANDIT_ARRIVED: "bg-violet-500",
  PUJA_IN_PROGRESS: "bg-orange-500", COMPLETED: "bg-green-500", CANCELLED: "bg-red-500", REFUNDED: "bg-pink-500",
};

const MOCK: Booking = {
  id: "bk-mock-1", bookingNumber: "BK-240201-001", eventType: "Griha Pravesh", eventDate: "2025-03-15T10:00:00Z",
  eventEndDate: null, muhuratTime: "10:30 AM - 12:00 PM", status: "CONFIRMED",
  venueAddress: "A-123, Sector 45, Gurgaon, Haryana", venueCity: "Gurgaon", venuePincode: "122003",
  venueLatitude: 28.4595, venueLongitude: 77.0266, attendees: 50, specialInstructions: "Need extra chairs. Gate code is #4567.",
  travelRequired: true, travelMode: "car", travelDistanceKm: 85, travelStatus: "PENDING",
  travelBookingRef: null, travelNotes: null, foodArrangement: "CUSTOMER_PROVIDES", samagriPreference: "PANDIT_PROVIDES",
  dakshinaAmount: 11000, travelCost: 2500, foodAllowanceAmount: 500, accommodationCost: 0,
  platformFee: 1650, platformFeeGst: 297, travelServiceFee: 125, travelServiceFeeGst: 23,
  grandTotal: 16095, panditPayout: 14000, payoutStatus: "PENDING", paymentStatus: "PAID",
  cancelledBy: null, cancellationReason: null, refundAmount: 0, refundStatus: "NONE",
  adminNotes: null, createdAt: "2025-02-01T12:00:00Z",
  pandit: { id: "p1", displayName: "Pandit Ramesh Sharma", city: "Old Delhi", profilePhotoUrl: null },
  customer: { user: { fullName: "Vikram Malhotra", phone: "+919876543210", email: "vikram@email.com" } },
  ritual: { name: "Griha Pravesh", nameHindi: "गृह प्रवेश" },
};

export default function AdminBookingDetailPage({ params }: { params: { id: string } }) {
  const [booking, setBooking] = useState<Booking>(MOCK);
  const [adminNotes, setAdminNotes] = useState("");
  const [statusOverride, setStatusOverride] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchBooking();
  }, [params.id]);

  async function fetchBooking() {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API}/bookings/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setBooking(json.data);
          setAdminNotes(json.data.adminNotes ?? "");
        }
      }
    } catch { /* use mock */ }
  }

  async function updateBooking() {
    try {
      const token = localStorage.getItem("admin_token");
      const body: Record<string, string> = {};
      if (statusOverride) body.status = statusOverride;
      if (adminNotes !== (booking.adminNotes ?? "")) body.adminNotes = adminNotes;

      if (!Object.keys(body).length) return;

      const res = await fetch(`${API}/admin/bookings/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        showToast("Booking updated");
        fetchBooking();
      }
    } catch { showToast("Update failed"); }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const b = booking;

  return (
    <main className="min-h-screen bg-slate-950 p-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Breadcrumb + Header */}
      <div className="mb-6">
        <Link href="/bookings" className="text-xs text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-sm align-middle mr-1">arrow_back</span>
          Back to Bookings
        </Link>
        <div className="mt-2 flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">{b.bookingNumber}</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${STATUS_COLORS[b.status] ?? "bg-slate-600"}`}>
            {b.status.replace(/_/g, " ")}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${b.paymentStatus === "PAID" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"}`}>
            {b.paymentStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: Event + Venue + Travel */}
        <div className="col-span-2 space-y-5">
          {/* Event Details */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 text-sm font-semibold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">event</span>
              Event Details
            </h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400">Ceremony</p>
                <p className="font-medium text-white">{b.eventType}</p>
                {b.ritual?.nameHindi && <p className="text-xs text-slate-500">{b.ritual.nameHindi}</p>}
              </div>
              <div>
                <p className="text-xs text-slate-400">Date</p>
                <p className="font-medium text-white">{new Date(b.eventDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Muhurat Time</p>
                <p className="font-medium text-white">{b.muhuratTime ?? "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Attendees</p>
                <p className="font-medium text-white">{b.attendees ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Food Arrangement</p>
                <p className="font-medium text-white capitalize">{b.foodArrangement.replace(/_/g, " ").toLowerCase()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Samagri</p>
                <p className="font-medium text-white capitalize">{b.samagriPreference.replace(/_/g, " ").toLowerCase()}</p>
              </div>
            </div>
            {b.specialInstructions && (
              <div className="mt-3 rounded-lg bg-slate-800 p-3">
                <p className="text-xs text-slate-400 mb-1">Special Instructions</p>
                <p className="text-sm text-slate-300">{b.specialInstructions}</p>
              </div>
            )}
          </section>

          {/* Venue */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 text-sm font-semibold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">location_on</span>
              Venue
            </h2>
            <p className="text-sm text-white">{b.venueAddress}</p>
            <p className="text-xs text-slate-400 mt-1">{b.venueCity} &mdash; {b.venuePincode}</p>
            {b.venueLatitude && b.venueLongitude && (
              <a
                href={`https://maps.google.com/?q=${b.venueLatitude},${b.venueLongitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <span className="material-symbols-outlined text-sm">map</span>
                Open in Google Maps
              </a>
            )}
          </section>

          {/* Travel & Logistics */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 text-sm font-semibold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">directions_car</span>
              Travel &amp; Logistics
            </h2>
            {b.travelRequired ? (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Travel Mode</p>
                  <p className="font-medium text-white capitalize">{b.travelMode ?? "TBD"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Distance</p>
                  <p className="font-medium text-white">{b.travelDistanceKm ? `${b.travelDistanceKm} km` : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Travel Status</p>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${STATUS_COLORS[b.travelStatus] ?? "bg-slate-600"}`}>
                    {b.travelStatus.replace(/_/g, " ")}
                  </span>
                </div>
                {b.travelBookingRef && (
                  <div className="col-span-3">
                    <p className="text-xs text-slate-400">Booking Reference</p>
                    <p className="font-medium text-white font-mono">{b.travelBookingRef}</p>
                  </div>
                )}
                {b.travelNotes && (
                  <div className="col-span-3 rounded-lg bg-slate-800 p-2.5">
                    <p className="text-xs text-slate-400 mb-1">Notes</p>
                    <p className="text-sm text-slate-300">{b.travelNotes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No travel required for this booking.</p>
            )}
          </section>

          {/* Financial Breakdown */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 text-sm font-semibold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">receipt_long</span>
              Financial Breakdown
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Dakshina</span>
                <span className="text-white">{"\u20B9"}{b.dakshinaAmount.toLocaleString("en-IN")}</span>
              </div>
              {b.travelCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Travel Cost</span>
                  <span className="text-white">{"\u20B9"}{b.travelCost.toLocaleString("en-IN")}</span>
                </div>
              )}
              {b.foodAllowanceAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Food Allowance</span>
                  <span className="text-white">{"\u20B9"}{b.foodAllowanceAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              {b.accommodationCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Accommodation</span>
                  <span className="text-white">{"\u20B9"}{b.accommodationCost.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="border-t border-slate-800 pt-2 flex justify-between">
                <span className="text-slate-400">Platform Fee (15%)</span>
                <span className="text-slate-300">{"\u20B9"}{b.platformFee.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Platform GST (18%)</span>
                <span className="text-slate-300">{"\u20B9"}{b.platformFeeGst.toLocaleString("en-IN")}</span>
              </div>
              {b.travelServiceFee > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Travel Service Fee (5%)</span>
                    <span className="text-slate-300">{"\u20B9"}{b.travelServiceFee.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Travel Service GST (18%)</span>
                    <span className="text-slate-300">{"\u20B9"}{b.travelServiceFeeGst.toLocaleString("en-IN")}</span>
                  </div>
                </>
              )}
              <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-base">
                <span className="text-white">Grand Total</span>
                <span className="text-green-400">{"\u20B9"}{b.grandTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between">
                <span className="text-slate-400">Pandit Payout</span>
                <span className="text-primary font-semibold">{"\u20B9"}{b.panditPayout.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Platform Revenue</span>
                <span className="text-blue-400 font-semibold">{"\u20B9"}{(b.grandTotal - b.panditPayout).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: People + Actions */}
        <div className="space-y-5">
          {/* Customer */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Customer</h2>
            <p className="text-sm font-medium text-white">{b.customer?.user?.fullName ?? "—"}</p>
            <p className="text-xs text-slate-400 mt-0.5">{b.customer?.user?.phone}</p>
            {b.customer?.user?.email && <p className="text-xs text-slate-400">{b.customer.user.email}</p>}
            <div className="mt-3 flex gap-2">
              <a href={`tel:${b.customer?.user?.phone}`} className="flex-1 rounded-lg bg-slate-800 py-2 text-center text-xs text-white hover:bg-slate-700">
                <span className="material-symbols-outlined text-sm align-middle mr-1">call</span>Call
              </a>
              <a href={`https://wa.me/${b.customer?.user?.phone?.replace("+", "")}`} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg bg-green-600/20 py-2 text-center text-xs text-green-400 hover:bg-green-600/30">
                WhatsApp
              </a>
            </div>
          </section>

          {/* Pandit */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Pandit</h2>
            {b.pandit ? (
              <>
                <p className="text-sm font-medium text-white">{b.pandit.displayName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{b.pandit.city}</p>
                <Link href={`/pandits/${b.pandit.id}`} className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  View Profile <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </>
            ) : (
              <p className="text-sm text-slate-400">No pandit assigned</p>
            )}
          </section>

          {/* Payout Status */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Payout Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${b.payoutStatus === "COMPLETED" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                  {b.payoutStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount</span>
                <span className="text-white font-semibold">{"\u20B9"}{b.panditPayout.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </section>

          {/* Refund Info (if applicable) */}
          {(b.status === "CANCELLED" || b.status === "REFUNDED" || b.refundStatus !== "NONE") && (
            <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <h2 className="mb-3 text-sm font-semibold text-red-400">Cancellation / Refund</h2>
              <div className="space-y-2 text-sm">
                {b.cancelledBy && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cancelled By</span>
                    <span className="text-white capitalize">{b.cancelledBy.toLowerCase()}</span>
                  </div>
                )}
                {b.cancellationReason && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Reason</p>
                    <p className="text-sm text-slate-300">{b.cancellationReason}</p>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Refund Status</span>
                  <span className="text-white">{b.refundStatus}</span>
                </div>
                {b.refundAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Refund Amount</span>
                    <span className="text-red-400 font-semibold">{"\u20B9"}{b.refundAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Admin Actions */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Admin Actions</h2>

            <div className="mb-3">
              <label className="mb-1 block text-xs text-slate-400">Override Status</label>
              <select
                value={statusOverride}
                onChange={(e) => setStatusOverride(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              >
                <option value="">No change</option>
                {["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REFUNDED"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-xs text-slate-400">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                placeholder="Internal notes..."
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
              />
            </div>

            <button
              onClick={updateBooking}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Save Changes
            </button>
          </section>

          {/* Meta */}
          <div className="rounded-lg bg-slate-800/50 p-3 text-xs text-slate-500">
            <p>Created: {new Date(b.createdAt).toLocaleString("en-IN")}</p>
            <p>Booking ID: {b.id}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
