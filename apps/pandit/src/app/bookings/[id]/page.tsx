"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

interface BookingDetail {
  id: string;
  bookingNumber: string;
  status: string;
  eventDate: string;
  eventTime?: string;
  eventType: string;
  muhurat?: string;
  venueAddress: {
    addressLine1?: string;
    addressLine2?: string;
    landmark?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  specialRequirements?: string;
  numberOfAttendees?: number;
  pricing: Record<string, number>;
  travelMode?: string;
  travelCost?: number;
  travelStatus?: string;
  foodArrangement?: string;
  foodAllowance?: number;
  samagriPreference?: string;
  samagriNotes?: string;
  dakshinaAmount?: number;
  platformFee?: number;
  grandTotal?: number;
  panditPayout?: number;
  customer: {
    user: { fullName?: string; phone: string; avatarUrl?: string };
  };
  ritual: { name: string; nameHindi?: string; durationHours?: number };
  createdAt: string;
  panditAcceptedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: { label: "Pending", color: "amber", icon: "schedule" },
  CONFIRMED: { label: "Confirmed", color: "blue", icon: "check_circle" },
  TRAVEL_BOOKED: { label: "Travel Booked", color: "indigo", icon: "directions_car" },
  PANDIT_EN_ROUTE: { label: "En Route", color: "purple", icon: "navigation" },
  PANDIT_ARRIVED: { label: "Arrived", color: "teal", icon: "location_on" },
  PUJA_IN_PROGRESS: { label: "Puja In Progress", color: "orange", icon: "self_improvement" },
  COMPLETED: { label: "Completed", color: "green", icon: "task_alt" },
  CANCELLED: { label: "Cancelled", color: "red", icon: "cancel" },
};

const TRAVEL_ICONS: Record<string, string> = {
  self_drive: "directions_car",
  SELF_DRIVE: "directions_car",
  train: "train",
  TRAIN: "train",
  flight: "flight",
  FLIGHT: "flight",
  cab: "local_taxi",
  CAB: "local_taxi",
  bus: "directions_bus",
  BUS: "directions_bus",
};

function rupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

const MOCK_BOOKING: BookingDetail = {
  id: "mock",
  bookingNumber: "HPJ-2026-00001",
  status: "CONFIRMED",
  eventDate: new Date(Date.now() + 3 * 86400000).toISOString(),
  eventTime: "09:00",
  eventType: "Griha Pravesh",
  muhurat: "09:14 AM — 10:52 AM",
  venueAddress: {
    addressLine1: "B-42, Sector 22",
    city: "Dwarka, New Delhi",
    state: "Delhi",
    postalCode: "110077",
  },
  numberOfAttendees: 35,
  specialRequirements: "Please bring extra diyas. Havan kund arrangement done by us.",
  pricing: { dakshina: 7100, platformFee: 1065 },
  travelMode: "SELF_DRIVE",
  travelCost: 1200,
  travelStatus: "PENDING",
  foodArrangement: "customer_provides",
  samagriPreference: "pandit_brings",
  dakshinaAmount: 7100,
  platformFee: 1065,
  grandTotal: 9587,
  panditPayout: 7100,
  customer: {
    user: { fullName: "Rajesh Kumar", phone: "+919876543210" },
  },
  ritual: { name: "Griha Pravesh", nameHindi: "गृह प्रवेश", durationHours: 2.5 },
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  panditAcceptedAt: new Date(Date.now() - 3600000).toISOString(),
};

export default function PanditBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("hpj_pandit_access_token");
        const res = await fetch(`${API_BASE}/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const json = await res.json();
          setBooking(json.data?.booking ?? json.data);
        } else {
          setBooking(MOCK_BOOKING);
        }
      } catch {
        setBooking(MOCK_BOOKING);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const updateStatus = useCallback(async (newStatus: string) => {
    setStatusLoading(true);
    try {
      const token = localStorage.getItem("hpj_pandit_access_token");
      const res = await fetch(`${API_BASE}/bookings/${id}/status-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const json = await res.json();
        setBooking((prev) => prev ? { ...prev, status: newStatus, ...(json.data?.booking ?? {}) } : prev);
      }
    } catch {
      // Fallback: update locally
      setBooking((prev) => prev ? { ...prev, status: newStatus } : prev);
    } finally {
      setStatusLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-4">
        <span className="material-symbols-outlined text-5xl text-slate-300">search_off</span>
        <p className="text-slate-500">Booking not found</p>
        <Link href="/bookings" className="text-primary font-semibold hover:underline">Back to Bookings</Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.PENDING;
  const eventDate = new Date(booking.eventDate);
  const isToday = eventDate.toDateString() === new Date().toDateString();
  const isPast = eventDate < new Date();
  const customerName = booking.customer.user.fullName ?? "Customer";
  const customerPhone = booking.customer.user.phone;
  const initials = customerName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  // Determine next status action
  const nextActions: { label: string; status: string; icon: string; color: string }[] = [];
  if (booking.status === "CONFIRMED" || booking.status === "TRAVEL_BOOKED") {
    nextActions.push({ label: "I'm On My Way", status: "PANDIT_EN_ROUTE", icon: "navigation", color: "purple" });
  }
  if (booking.status === "PANDIT_EN_ROUTE") {
    nextActions.push({ label: "I've Arrived", status: "PANDIT_ARRIVED", icon: "location_on", color: "teal" });
  }
  if (booking.status === "PANDIT_ARRIVED") {
    nextActions.push({ label: "Puja Started", status: "PUJA_IN_PROGRESS", icon: "self_improvement", color: "orange" });
  }
  if (booking.status === "PUJA_IN_PROGRESS") {
    nextActions.push({ label: "Mark Complete", status: "COMPLETED", icon: "task_alt", color: "green" });
  }

  const fullAddress = [
    booking.venueAddress.addressLine1,
    booking.venueAddress.addressLine2,
    booking.venueAddress.landmark,
    booking.venueAddress.city,
    booking.venueAddress.postalCode,
  ].filter(Boolean).join(", ");

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`;
  const whatsappUrl = `https://wa.me/${customerPhone.replace("+", "")}`;

  return (
    <main className="min-h-screen bg-[#faf8f5] dark:bg-[#1a1510]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Back link */}
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-5"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Bookings
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {booking.ritual.name}
              {booking.ritual.nameHindi && (
                <span className="text-slate-400 font-normal text-base ml-2">({booking.ritual.nameHindi})</span>
              )}
            </h1>
            <p className="text-sm text-slate-500 mt-1">#{booking.bookingNumber}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-${cfg.color}-100 text-${cfg.color}-700 dark:bg-${cfg.color}-900/30 dark:text-${cfg.color}-400`}>
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
            {cfg.label}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Event info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">event</span>
                Event Details
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Date</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {eventDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    {isToday && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">TODAY</span>}
                  </p>
                </div>
                {booking.eventTime && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Time</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{booking.eventTime}</p>
                  </div>
                )}
                {booking.muhurat && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Muhurat</p>
                    <p className="text-sm font-semibold text-primary">{booking.muhurat}</p>
                  </div>
                )}
                {booking.numberOfAttendees && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Attendees</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">~{booking.numberOfAttendees}</p>
                  </div>
                )}
                {booking.ritual.durationHours && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Duration</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">~{booking.ritual.durationHours}h</p>
                  </div>
                )}
              </div>
            </div>

            {/* Venue */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-3">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">location_on</span>
                Venue
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300">{fullAddress}</p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <span className="material-symbols-outlined text-sm">map</span>
                Open in Google Maps
              </a>
            </div>

            {/* Special Requirements */}
            {booking.specialRequirements && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30 p-5">
                <h2 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-base">sticky_note_2</span>
                  Special Requirements
                </h2>
                <p className="text-sm text-amber-800 dark:text-amber-300">{booking.specialRequirements}</p>
              </div>
            )}

            {/* Travel & Logistics */}
            {booking.travelMode && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-3">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">commute</span>
                  Travel & Logistics
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Travel Mode</p>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-slate-500">
                        {TRAVEL_ICONS[booking.travelMode] ?? "commute"}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {booking.travelMode.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                  {booking.travelCost != null && (
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Travel Cost</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{rupees(booking.travelCost)}</p>
                    </div>
                  )}
                  {booking.foodArrangement && (
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Food</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {booking.foodArrangement === "customer_provides" ? "Customer arranges" : "Platform allowance"}
                      </p>
                    </div>
                  )}
                  {booking.samagriPreference && (
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Samagri</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {booking.samagriPreference === "pandit_brings" ? "Pandit brings" : booking.samagriPreference === "customer_arranges" ? "Customer arranges" : "Need help"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Actions */}
            {nextActions.length > 0 && !statusLoading && (
              <div className="flex flex-wrap gap-3">
                {nextActions.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => updateStatus(action.status)}
                    className={`flex-1 min-w-[180px] h-12 bg-${action.color}-500 hover:bg-${action.color}-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2`}
                  >
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {action.icon}
                    </span>
                    {action.label}
                  </button>
                ))}
              </div>
            )}
            {statusLoading && (
              <div className="flex items-center justify-center h-12">
                <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Right column - Customer & Earnings */}
          <div className="space-y-5">
            {/* Customer card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-base">person</span>
                Customer
              </h2>
              <div className="flex items-center gap-3">
                {booking.customer.user.avatarUrl ? (
                  <img src={booking.customer.user.avatarUrl} alt={customerName} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <span className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">{initials}</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{customerName}</p>
                  <p className="text-xs text-slate-400">{customerPhone}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <a
                  href={`tel:${customerPhone}`}
                  className="flex-1 h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center justify-center gap-1.5 hover:border-primary hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">call</span>
                  Call
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-9 rounded-lg border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">chat</span>
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Earnings breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-base">payments</span>
                Your Earnings
              </h2>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Dakshina</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {rupees(booking.dakshinaAmount ?? booking.pricing.dakshina ?? 0)}
                  </p>
                </div>
                {booking.travelCost != null && booking.travelCost > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Travel Reimbursement</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{rupees(booking.travelCost)}</p>
                  </div>
                )}
                {booking.foodAllowance != null && booking.foodAllowance > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Food Allowance</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{rupees(booking.foodAllowance)}</p>
                  </div>
                )}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 flex items-center justify-between">
                  <p className="font-bold text-slate-900 dark:text-slate-100">Your Payout</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {rupees(booking.panditPayout ?? booking.dakshinaAmount ?? booking.pricing.dakshina ?? 0)}
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 mt-3">
                Payout processed within 3-5 business days after ceremony completion.
              </p>
            </div>

            {/* Booked on */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Booked on</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
