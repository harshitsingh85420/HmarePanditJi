"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../../context/auth-context";

// ── Types ─────────────────────────────────────────────────────────────────────

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

type PaymentStatus = "PENDING" | "PAID" | "REFUNDED" | "FAILED";

interface BookingDetail {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  eventDate: string;
  eventTime?: string;
  muhurat?: string;
  venueAddress: {
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    state?: string;
    pincode?: string;
  };
  specialRequirements?: string;
  numberOfAttendees?: number;
  travelMode?: string;
  travelNotes?: string;
  pricing: {
    basePrice: number;
    travelCharge?: number;
    samagriCharge?: number;
    platformFee?: number;
    discount?: number;
    total: number;
  };
  paymentId?: string;
  orderId?: string;
  refundId?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  panditAcceptedAt?: string;
  pandit: {
    id: string;
    displayName: string;
    profilePhotoUrl?: string;
    phone?: string;
    averageRating?: number;
    totalBookings?: number;
    experienceYears?: number;
    languages?: string[];
    specializations?: string[];
  };
  ritual: {
    id: string;
    name: string;
    nameHindi?: string;
    description?: string;
    durationMinutes?: number;
    imageUrl?: string;
  };
  review?: {
    id: string;
    ratings: Record<string, number>;
    comment: string;
    anonymous: boolean;
    createdAt: string;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(t?: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row max-w-[1440px] mx-auto w-full gap-6 p-6 min-h-screen">
      <aside className="w-full lg:w-72 flex flex-col gap-6">
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-48 bg-slate-100 rounded-xl animate-pulse" />
      </aside>
      <main className="flex-1 flex flex-col gap-6">
        <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-48 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
      </main>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function BookingDetailClient({ bookingId }: { bookingId: string }) {
  const { user, accessToken, openLoginModal, loading: authLoading } = useAuth();
  const router = useRouter();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBooking = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.status === 404) {
        setError("Booking not found.");
        return;
      }
      if (!res.ok) throw new Error();
      const json = await res.json();
      setBooking(json.data ?? json);
    } catch {
      setError("Could not load booking details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [bookingId, accessToken]);

  useEffect(() => {
    if (!authLoading && !user) openLoginModal();
  }, [authLoading, user, openLoginModal]);

  useEffect(() => {
    if (user && accessToken) fetchBooking();
  }, [user, accessToken, fetchBooking]);

  if (authLoading || loading) return <DashboardSkeleton />;

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">{error || "Booking not found"}</h2>
          <button
            onClick={() => router.push("/bookings")}
            className="text-primary hover:underline font-medium"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  // Derived State
  const isConfirmed = booking.status === "CONFIRMED";
  const isInProgress = booking.status === "IN_PROGRESS";
  const isCompleted = booking.status === "COMPLETED";
  const isCancelled = ["CANCELLED", "REFUNDED"].includes(booking.status);

  // Design-specific mock data for timeline (since backend might not have full GPS tracking yet)
  const timelineEvents = [
    {
      status: "done",
      title: "Booking Confirmed",
      location: "Online",
      time: formatDate(booking.createdAt),
      icon: "check_circle",
    },
    {
      status: isConfirmed || isInProgress || isCompleted ? "done" : "future",
      title: "Pandit Assigned",
      location: `${booking.pandit.displayName} accepted request`,
      time: booking.panditAcceptedAt ? formatTime(booking.panditAcceptedAt.split("T")[1]) : "Pending",
      icon: "person_check",
    },
    {
      status: isInProgress ? "current" : isCompleted ? "done" : "future",
      title: isInProgress ? "En Route / In Progress" : "Ceremony Started",
      location: `Transit to ${booking.venueAddress.city}`,
      time: "Live Status",
      icon: "directions_car",
    },
    {
      status: isCompleted ? "done" : "future",
      title: "Ceremony Completion",
      location: booking.venueAddress.city,
      time: "Scheduled",
      icon: "temple_hindu",
    }
  ];

  return (
    <div className="bg-[#f8f7f6] dark:bg-[#101922] min-h-screen">

      <div className="flex flex-col lg:flex-row max-w-[1440px] mx-auto w-full gap-6 p-6">

        {/* Sidebar: Navigation & Documents */}
        <aside className="w-full lg:w-72 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4">Booking Details</h3>
            <p className="text-primary font-bold text-sm mb-1 uppercase tracking-wider">Booking ID</p>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-mono mb-6">{booking.bookingNumber}</p>

            <nav className="flex flex-col gap-1">
              <button className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-bold text-left w-full">
                <span className="material-symbols-outlined">dashboard</span> Overview
              </button>
              <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-left w-full">
                <span className="material-symbols-outlined">chat</span> Messages
              </button>
              <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-left w-full">
                <span className="material-symbols-outlined">payments</span> Payments
              </button>
              <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-left w-full">
                <span className="material-symbols-outlined">settings</span> Settings
              </button>
            </nav>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4">Documents</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 group cursor-pointer hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Booking Receipt</span>
                    <span className="text-xs text-slate-500">1.2 MB</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">download</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 group cursor-pointer hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Muhurat Patrika</span>
                    <span className="text-xs text-slate-500">2.4 MB</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">download</span>
              </div>
            </div>
          </div>

          {/* Pandit Quick Profile */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4">Your Pandit</h3>
            <div className="flex items-center gap-4">
              <div className="relative size-12 rounded-full overflow-hidden bg-slate-100">
                {booking.pandit.profilePhotoUrl ? (
                  <Image src={booking.pandit.profilePhotoUrl} alt="Pandit" fill className="object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-2xl text-slate-400 w-full h-full flex items-center justify-center">person</span>
                )}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{booking.pandit.displayName}</p>
                <div className="flex items-center text-amber-500 text-xs">
                  <span className="material-symbols-outlined text-sm font-fill">star</span>
                  <span className="ml-1 font-semibold">{booking.pandit.averageRating || "New"}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push(`/pandit/${booking.pandit.id}`)}
              className="mt-4 w-full py-2 border border-slate-200 rounded-lg text-sm text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              View Profile
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col gap-6">
          {/* Main Header & Status */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {isCancelled ? "Booking Cancelled" : "Booking Confirmed"}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                {booking.ritual.name} · {formatDate(booking.eventDate)}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 w-fit ${isCancelled ? "bg-red-100 text-red-700" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              }`}>
              <span className="material-symbols-outlined text-base">
                {isCancelled ? "cancel" : "check_circle"}
              </span>
              {booking.status}
            </div>
          </div>

          {/* Pandit Status Banner */}
          {!isCancelled && (
            <div className="bg-gradient-to-r from-primary to-orange-500 rounded-xl p-6 shadow-lg relative overflow-hidden text-white">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative hidden md:block">
                    <div className="size-16 rounded-full border-4 border-white/30 bg-white/10 flex items-center justify-center overflow-hidden">
                      {booking.pandit.profilePhotoUrl ? (
                        <Image src={booking.pandit.profilePhotoUrl} alt="Pandit" width={64} height={64} className="object-cover w-full h-full" />
                      ) : (
                        <span className="material-symbols-outlined text-3xl">person</span>
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 size-5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {booking.pandit.displayName} is assigned
                    </h2>
                    <p className="text-white/80">
                      {isInProgress ? "Currently en route to your location." : "Scheduled to arrive on time."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/bookings/${bookingId}/track`)}
                  className="bg-white text-primary hover:bg-slate-50 px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-sm"
                >
                  Track Now
                </button>
              </div>
              {/* Abstract Background Pattern */}
              <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 pointer-events-none">
                <svg className="h-full w-full fill-white" viewBox="0 0 100 100">
                  <circle cx="80" cy="50" r="40"></circle>
                  <circle cx="100" cy="20" r="30"></circle>
                </svg>
              </div>
            </div>
          )}

          {/* Central Timeline */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">route</span> Transit Timeline
            </h3>
            <div className="relative flex flex-col gap-0">
              {/* Connecting Line */}
              <div className="absolute left-[27px] top-6 bottom-6 w-1 bg-slate-100 dark:bg-slate-800"></div>

              {timelineEvents.map((step, idx) => {
                let bgColor = "bg-slate-100";
                let textColor = "text-slate-400";
                let ring = "";

                if (step.status === "done") {
                  bgColor = "bg-primary/20";
                  textColor = "text-primary";
                } else if (step.status === "current") {
                  bgColor = "bg-primary";
                  textColor = "text-white";
                  ring = "ring-4 ring-primary/20";
                }

                return (
                  <div key={idx} className={`flex items-start gap-6 pb-10 relative ${idx === timelineEvents.length - 1 ? "pb-0" : ""}`}>
                    <div className={`z-10 size-14 flex items-center justify-center rounded-full border-4 border-white dark:border-slate-900 ${bgColor} ${textColor} ${ring}`}>
                      <span className="material-symbols-outlined" style={step.status !== 'future' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        {step.icon}
                      </span>
                    </div>
                    <div className="flex flex-col pt-1">
                      <p className={`font-bold text-lg leading-none ${step.status === 'future' ? "text-slate-400" : "text-slate-900 dark:text-white"}`}>
                        {step.title}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span> {step.time}
                      </p>
                      <p className="text-slate-400 text-sm mt-1">Location: {step.location}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Action Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Track Pandit */}
            <button
              onClick={() => router.push(`/bookings/${bookingId}/track`)}
              className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group cursor-pointer text-left"
            >
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">my_location</span>
              </div>
              <h4 className="text-slate-900 dark:text-white font-bold mb-1">Track Pandit</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time GPS tracking</p>
            </button>

            {/* Chat */}
            <button className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group cursor-pointer text-left">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">forum</span>
              </div>
              <h4 className="text-slate-900 dark:text-white font-bold mb-1">Chat</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Discuss ritual details</p>
            </button>

            {/* View Samagri */}
            <button className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group cursor-pointer text-left">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <h4 className="text-slate-900 dark:text-white font-bold mb-1">Samagri List</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Required items checklist</p>
            </button>

            {/* Support */}
            <button className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group cursor-pointer text-left">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">support_agent</span>
              </div>
              <h4 className="text-slate-900 dark:text-white font-bold mb-1">Support</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm">24/7 Concierge help</p>
            </button>
          </div>

        </main>
      </div>

    </div>
  );
}
