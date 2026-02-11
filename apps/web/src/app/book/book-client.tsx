"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, StepIndicator, Badge } from "@hmarepanditji/ui";
import { useAuth, API_BASE } from "../../context/auth-context";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PanditInfo {
  id: string;
  displayName: string;
  profilePhotoUrl?: string | null;
  averageRating: number;
  totalReviews: number;
  city: string;
  experienceYears: number;
  specializations: string[];
  basePricing: Record<string, number>;
}

interface RitualInfo {
  id: string;
  name: string;
  nameHindi: string;
  durationHours: number;
  basePriceMin: number;
  basePriceMax: number;
}

interface VenueAddress {
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
}

interface BookingResult {
  id: string;
  bookingNumber: string;
  eventDate: string;
  eventTime?: string;
  pandit: { displayName: string };
  ritual: { name: string };
  pricing: Record<string, number>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Details", icon: "person" },
  { label: "Event", icon: "event" },
  { label: "Pricing", icon: "payments" },
  { label: "Payment", icon: "credit_card" },
  { label: "Confirmed", icon: "check_circle" },
];

const MOCK_PANDITS: Record<string, PanditInfo> = {
  default: {
    id: "mock",
    displayName: "Pt. Ramesh Sharma",
    profilePhotoUrl: null,
    averageRating: 4.8,
    totalReviews: 124,
    city: "Delhi",
    experienceYears: 15,
    specializations: ["Griha Pravesh", "Vivah"],
    basePricing: { dakshina: 5100 },
  },
};

const MOCK_RITUALS: Record<string, RitualInfo> = {
  default: {
    id: "mock",
    name: "Griha Pravesh",
    nameHindi: "गृह प्रवेश",
    durationHours: 2,
    basePriceMin: 4100,
    basePriceMax: 8100,
  },
};

const TIME_SLOTS = [
  "05:30", "06:00", "06:30", "07:00", "07:30", "08:00",
  "08:30", "09:00", "09:30", "10:00", "10:30", "11:00",
  "11:30", "12:00", "14:00", "15:00", "16:00", "17:00",
];

// ── Helper: format ₹ ─────────────────────────────────────────────────────────

function rupees(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ── Helper: today min date ────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

// ── Step 1: Confirm Details ───────────────────────────────────────────────────

function StepConfirmDetails({
  pandit,
  ritual,
  date,
  onNext,
}: {
  pandit: PanditInfo;
  ritual: RitualInfo;
  date: string;
  onNext: () => void;
}) {
  const initials = pandit.displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
        Confirm Your Selection
      </h2>

      {/* Pandit mini card */}
      <Card variant="default" padding="md">
        <div className="flex items-center gap-4">
          {pandit.profilePhotoUrl ? (
            <img
              src={pandit.profilePhotoUrl}
              alt={pandit.displayName}
              className="w-14 h-14 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <span className="w-14 h-14 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center flex-shrink-0">
              {initials}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 dark:text-slate-100">{pandit.displayName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-amber-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{pandit.averageRating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({pandit.totalReviews} reviews)</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {pandit.experienceYears} yrs exp · {pandit.city}
            </p>
          </div>
          <Badge variant="success">Verified</Badge>
        </div>
      </Card>

      {/* Ceremony + date */}
      <Card variant="default" padding="md">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-base">temple_hindu</span>
            </span>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Ceremony</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {ritual.name}
                <span className="ml-2 text-slate-400 font-normal text-sm">({ritual.nameHindi})</span>
              </p>
              <p className="text-xs text-slate-500">Duration ~{ritual.durationHours}h</p>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-base">calendar_month</span>
            </span>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Preferred Date</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {date
                  ? new Date(date).toLocaleDateString("en-IN", {
                      weekday: "long", day: "numeric", month: "long", year: "numeric",
                    })
                  : "Not selected"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <p className="text-xs text-slate-400 text-center">
        You can adjust the date and time in the next step.
      </p>

      <button
        className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
        onClick={onNext}
      >
        Continue
        <span className="material-symbols-outlined text-base">arrow_forward</span>
      </button>
    </div>
  );
}

// ── Step 2: Event Details ─────────────────────────────────────────────────────

function StepEventDetails({
  date,
  time,
  muhuratEnabled,
  muhuratText,
  venue,
  numberOfAttendees,
  specialRequirements,
  onChange,
  onNext,
  onBack,
}: {
  date: string;
  time: string;
  muhuratEnabled: boolean;
  muhuratText: string;
  venue: VenueAddress;
  numberOfAttendees: string;
  specialRequirements: string;
  onChange: (key: string, value: string | boolean) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!date) e.date = "Please select a date";
    if (!time) e.time = "Please select a time";
    if (!venue.addressLine1.trim()) e.addressLine1 = "Address is required";
    if (!venue.city.trim()) e.city = "City is required";
    if (!/^\d{6}$/.test(venue.postalCode)) e.postalCode = "Enter a valid 6-digit PIN code";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
        Event Details
      </h2>

      {/* Date & Time */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base">schedule</span>
          Date & Time
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Date *</label>
            <input
              type="date"
              min={todayISO()}
              value={date}
              onChange={(e) => onChange("date", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Time *</label>
            <select
              value={time}
              onChange={(e) => onChange("time", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select time</option>
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {new Date(`2000-01-01T${t}`).toLocaleTimeString("en-IN", {
                    hour: "2-digit", minute: "2-digit", hour12: true,
                  })}
                </option>
              ))}
            </select>
            {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
          </div>
        </div>

        {/* Muhurat toggle */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange("muhuratEnabled", !muhuratEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
              muhuratEnabled ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              muhuratEnabled ? "translate-x-5" : "translate-x-0.5"
            }`} />
          </button>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer" onClick={() => onChange("muhuratEnabled", !muhuratEnabled)}>
            Specify Muhurat
          </label>
        </div>
        {muhuratEnabled && (
          <input
            type="text"
            placeholder="e.g. 07:14 AM — 08:52 AM (as per Panchangam)"
            value={muhuratText}
            onChange={(e) => onChange("muhuratText", e.target.value)}
            className="mt-2 w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        )}
      </Card>

      {/* Venue */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base">location_on</span>
          Venue Address
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Address Line 1 *</label>
            <input
              type="text"
              placeholder="House/Flat No., Street Name"
              value={venue.addressLine1}
              onChange={(e) => onChange("venue.addressLine1", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {errors.addressLine1 && <p className="text-xs text-red-500 mt-1">{errors.addressLine1}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Address Line 2</label>
            <input
              type="text"
              placeholder="Colony, Area (optional)"
              value={venue.addressLine2}
              onChange={(e) => onChange("venue.addressLine2", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Landmark</label>
            <input
              type="text"
              placeholder="Near metro, temple, etc. (optional)"
              value={venue.landmark}
              onChange={(e) => onChange("venue.landmark", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">City *</label>
              <input
                type="text"
                placeholder="City"
                value={venue.city}
                onChange={(e) => onChange("venue.city", e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">PIN *</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="110001"
                value={venue.postalCode}
                onChange={(e) => onChange("venue.postalCode", e.target.value.replace(/\D/g, ""))}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>}
            </div>
          </div>
        </div>
      </Card>

      {/* Attendees + requirements */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base">groups</span>
          Additional Info
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Expected Attendees</label>
            <input
              type="number"
              min="1"
              max="500"
              placeholder="e.g. 25"
              value={numberOfAttendees}
              onChange={(e) => onChange("numberOfAttendees", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Special Requirements</label>
            <textarea
              rows={3}
              placeholder="Any specific rituals, language preference, or special arrangements needed…"
              value={specialRequirements}
              onChange={(e) => onChange("specialRequirements", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="h-12 px-6 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Back
        </button>
        <button
          className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
          onClick={() => { if (validate()) onNext(); }}
        >
          View Pricing
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Pricing Breakdown ─────────────────────────────────────────────────

function StepPricing({
  pandit,
  ritual,
  pricing,
  onNext,
  onBack,
}: {
  pandit: PanditInfo;
  ritual: RitualInfo;
  pricing: { dakshina: number; platformFee: number; total: number };
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
        Pricing Breakdown
      </h2>

      <Card variant="default" padding="md">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Dakshina</p>
              <p className="text-xs text-slate-400">{ritual.name} · {pandit.displayName}</p>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{rupees(pricing.dakshina)}</p>
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Platform Fee</p>
              <p className="text-xs text-slate-400">10% of dakshina (GST included)</p>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{rupees(pricing.platformFee)}</p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
            <p className="font-bold text-slate-900 dark:text-slate-100">Total</p>
            <p className="text-lg font-bold text-primary">{rupees(pricing.total)}</p>
          </div>
        </div>
      </Card>

      {/* Notes */}
      <div className="space-y-2">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
          <span className="material-symbols-outlined text-blue-500 text-lg flex-shrink-0 mt-0.5">directions_car</span>
          <div>
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Travel Arrangements</p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5">
              Travel arrangements will be coordinated by our team after booking. There are no additional travel charges.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
          <span className="material-symbols-outlined text-amber-500 text-lg flex-shrink-0 mt-0.5">herbs</span>
          <div>
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Puja Samagri</p>
            <p className="text-xs text-amber-600 dark:text-amber-300 mt-0.5">
              Samagri list will be shared after confirmation. You can arrange it yourself or opt for our samagri service (quoted separately).
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="h-12 px-6 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Back
        </button>
        <button
          className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
          onClick={onNext}
        >
          Proceed to Payment
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

// ── Step 4: Payment ────────────────────────────────────────────────────────────

function StepPayment({
  pricing,
  loading,
  error,
  onPay,
  onBack,
}: {
  pricing: { dakshina: number; platformFee: number; total: number };
  loading: boolean;
  error: string;
  onPay: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
        Payment
      </h2>

      <Card variant="elevated" padding="md">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
          </span>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">Secure Payment</p>
            <p className="text-xs text-slate-400">256-bit SSL encrypted · Powered by Razorpay</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">Amount to pay</p>
            <p className="text-2xl font-bold text-primary">{rupees(pricing.total)}</p>
          </div>
        </div>

        {/* Dev mode notice */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 mb-4">
          <span className="material-symbols-outlined text-yellow-500 text-base flex-shrink-0">info</span>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            <strong>Test mode:</strong> No real payment is charged. Click "Pay Now" to simulate a successful payment.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 mb-4">
            <span className="material-symbols-outlined text-red-500 text-base flex-shrink-0">error</span>
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onBack}
            disabled={loading}
            className="h-12 px-6 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={onPay}
            disabled={loading}
            className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                Pay {rupees(pricing.total)}
              </>
            )}
          </button>
        </div>
      </Card>
    </div>
  );
}

// ── Step 5: Confirmation ──────────────────────────────────────────────────────

function StepConfirmation({ booking }: { booking: BookingResult }) {
  const message = encodeURIComponent(
    `I just booked ${booking.pandit.displayName} for ${booking.ritual.name} on ${new Date(booking.eventDate).toLocaleDateString("en-IN")}. Booking #${booking.bookingNumber} — HmarePanditJi`,
  );
  const whatsappUrl = `https://wa.me/?text=${message}`;

  return (
    <div className="space-y-5">
      {/* Success header */}
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
          <span
            className="material-symbols-outlined text-4xl text-green-500"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Booking Confirmed!</h2>
        <p className="text-sm text-slate-500 mt-1">
          Payment received · Awaiting pandit acceptance
        </p>
      </div>

      <Card variant="elevated" padding="md">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Booking Number</p>
            <p className="font-bold text-primary text-sm">{booking.bookingNumber}</p>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Ceremony</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{booking.ritual.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Pandit</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{booking.pandit.displayName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Date</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {new Date(booking.eventDate).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </p>
            </div>
            {booking.eventTime && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Time</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{booking.eventTime}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
        <span className="material-symbols-outlined text-blue-500 text-lg flex-shrink-0 mt-0.5">notifications</span>
        <p className="text-xs text-blue-600 dark:text-blue-300">
          The pandit has been notified. You'll receive an SMS once the booking is confirmed (typically within 2 hours).
        </p>
      </div>

      <div className="flex gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>share</span>
          Share on WhatsApp
        </a>
        <Link
          href="/bookings"
          className="h-12 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          My Bookings
        </Link>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function BookClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading, accessToken, openLoginModal } = useAuth();

  const panditId = searchParams.get("panditId") ?? "";
  const ritualId = searchParams.get("ritualId") ?? "";
  const dateParam = searchParams.get("date") ?? "";

  const [step, setStep] = useState(0);
  const [pandit, setPandit] = useState<PanditInfo | null>(null);
  const [ritual, setRitual] = useState<RitualInfo | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Event form state
  const [date, setDate] = useState(dateParam || todayISO());
  const [time, setTime] = useState("08:00");
  const [muhuratEnabled, setMuhuratEnabled] = useState(false);
  const [muhuratText, setMuhuratText] = useState("");
  const [venue, setVenue] = useState<VenueAddress>({
    addressLine1: "", addressLine2: "", landmark: "",
    city: "Delhi", state: "Delhi", postalCode: "",
  });
  const [numberOfAttendees, setNumberOfAttendees] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");

  // Payment state
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<BookingResult | null>(null);

  // ── Fetch pandit + ritual ────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      setFetchLoading(true);
      try {
        // Fetch pandit
        if (panditId) {
          const res = await fetch(`${API_BASE}/pandits/${panditId}`, {
            signal: AbortSignal.timeout(5000),
          });
          if (res.ok) {
            const json = await res.json();
            const p = json.data?.pandit ?? json.data;
            if (p) {
              setPandit({
                id: p.id,
                displayName: p.displayName,
                profilePhotoUrl: p.profilePhotoUrl ?? null,
                averageRating: p.averageRating ?? 4.5,
                totalReviews: p.totalReviews ?? 0,
                city: p.city ?? "Delhi",
                experienceYears: p.experienceYears ?? 0,
                specializations: p.specializations ?? [],
                basePricing: p.basePricing ?? {},
              });
            }
          }
        }
      } catch {
        // fall through to mock
      }

      try {
        // Fetch ritual
        if (ritualId) {
          const res = await fetch(`${API_BASE}/rituals/${ritualId}`, {
            signal: AbortSignal.timeout(5000),
          });
          if (res.ok) {
            const json = await res.json();
            const r = json.data?.ritual ?? json.data;
            if (r) {
              setRitual({
                id: r.id,
                name: r.name,
                nameHindi: r.nameHindi ?? "",
                durationHours: r.durationHours ?? 2,
                basePriceMin: r.basePriceMin ?? 4100,
                basePriceMax: r.basePriceMax ?? 8100,
              });
            }
          }
        }
      } catch {
        // fall through to mock
      }

      setFetchLoading(false);
    }
    load();
  }, [panditId, ritualId]);

  // Apply mocks if fetch failed
  const resolvedPandit = pandit ?? { ...MOCK_PANDITS.default, id: panditId || "mock" };
  const resolvedRitual = ritual ?? { ...MOCK_RITUALS.default, id: ritualId || "mock" };

  // ── Pricing calculation ──────────────────────────────────────────────────────

  const dakshina = resolvedPandit.basePricing?.dakshina ?? resolvedRitual.basePriceMin ?? 5100;
  const platformFee = Math.round(dakshina * 0.1);
  const total = dakshina + platformFee;
  const pricing = { dakshina, platformFee, total };

  // ── Form field change handler ────────────────────────────────────────────────

  const handleChange = useCallback((key: string, value: string | boolean) => {
    if (key === "date") setDate(value as string);
    else if (key === "time") setTime(value as string);
    else if (key === "muhuratEnabled") setMuhuratEnabled(value as boolean);
    else if (key === "muhuratText") setMuhuratText(value as string);
    else if (key === "numberOfAttendees") setNumberOfAttendees(value as string);
    else if (key === "specialRequirements") setSpecialRequirements(value as string);
    else if (key.startsWith("venue.")) {
      const field = key.slice(6) as keyof VenueAddress;
      setVenue((v) => ({ ...v, [field]: value as string }));
    }
  }, []);

  // ── Pay handler: POST /bookings → POST /payments/verify ──────────────────────

  const handlePay = useCallback(async () => {
    if (!user || !accessToken) {
      openLoginModal();
      return;
    }

    setPayLoading(true);
    setPayError("");

    try {
      // 1. Create booking
      const bookingRes = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          panditId: resolvedPandit.id,
          ritualId: resolvedRitual.id,
          eventDate: new Date(`${date}T${time}:00`).toISOString(),
          eventTime: time,
          muhurat: muhuratEnabled && muhuratText ? muhuratText : undefined,
          venueAddress: {
            addressLine1: venue.addressLine1,
            addressLine2: venue.addressLine2 || undefined,
            landmark: venue.landmark || undefined,
            city: venue.city,
            state: venue.state,
            postalCode: venue.postalCode,
          },
          specialRequirements: specialRequirements || undefined,
          numberOfAttendees: numberOfAttendees ? parseInt(numberOfAttendees) : undefined,
          pricing,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!bookingRes.ok) {
        const errJson = await bookingRes.json().catch(() => ({}));
        throw new Error(errJson.message ?? "Failed to create booking");
      }

      const bookingJson = await bookingRes.json();
      const { booking, order } = bookingJson.data;

      // 2. Simulate Razorpay payment → verify
      const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          razorpay_order_id: order.orderId,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: "mock_signature_dev",
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!verifyRes.ok) {
        const errJson = await verifyRes.json().catch(() => ({}));
        throw new Error(errJson.message ?? "Payment verification failed");
      }

      const verifyJson = await verifyRes.json();
      const confirmedBk = verifyJson.data?.booking ?? booking;

      setConfirmedBooking({
        id: confirmedBk.id,
        bookingNumber: confirmedBk.bookingNumber,
        eventDate: confirmedBk.eventDate,
        eventTime: confirmedBk.eventTime,
        pandit: { displayName: resolvedPandit.displayName },
        ritual: { name: resolvedRitual.name },
        pricing,
      });
      setStep(4);
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPayLoading(false);
    }
  }, [
    user, accessToken, resolvedPandit, resolvedRitual,
    date, time, muhuratEnabled, muhuratText,
    venue, specialRequirements, numberOfAttendees, pricing,
    openLoginModal,
  ]);

  // ── Auth guard ───────────────────────────────────────────────────────────────

  if (authLoading || fetchLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (!panditId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <span className="material-symbols-outlined text-5xl text-slate-300">search_off</span>
        <p className="text-slate-600 dark:text-slate-400 text-center">
          No pandit selected. Please search for a pandit first.
        </p>
        <Link
          href="/search"
          className="h-10 px-6 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          Find a Pandit
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <span
          className="material-symbols-outlined text-5xl text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          lock
        </span>
        <div className="text-center">
          <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">Login Required</p>
          <p className="text-sm text-slate-500 mt-1">Please login to book a pandit.</p>
        </div>
        <button
          onClick={openLoginModal}
          className="h-10 px-6 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">login</span>
          Login / Register
        </button>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#221a10]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/pandit/${panditId}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-4"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Profile
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Book a Pandit</h1>
          <p className="text-sm text-slate-500 mt-1">Complete the form below to confirm your booking.</p>
        </div>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="mb-8 px-2">
            <StepIndicator steps={STEPS.slice(0, 4)} currentStep={step} />
          </div>
        )}

        {/* Step content */}
        {step === 0 && (
          <StepConfirmDetails
            pandit={resolvedPandit}
            ritual={resolvedRitual}
            date={date}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <StepEventDetails
            date={date}
            time={time}
            muhuratEnabled={muhuratEnabled}
            muhuratText={muhuratText}
            venue={venue}
            numberOfAttendees={numberOfAttendees}
            specialRequirements={specialRequirements}
            onChange={handleChange}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepPricing
            pandit={resolvedPandit}
            ritual={resolvedRitual}
            pricing={pricing}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepPayment
            pricing={pricing}
            loading={payLoading}
            error={payError}
            onPay={handlePay}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && confirmedBooking && (
          <StepConfirmation booking={confirmedBooking} />
        )}
      </div>
    </div>
  );
}
