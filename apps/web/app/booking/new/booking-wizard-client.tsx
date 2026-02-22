"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, API_BASE } from "../../../context/auth-context";
import RazorpayCheckout from "../../../components/RazorpayCheckout";
import { SamagriModal } from "../../../components/samagri/SamagriModal";
import { useCart, SamagriItem } from "../../../context/cart-context";
import { RitualVariationSelection } from "../../../components/booking/RitualVariationSelection";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Ritual {
  id: string;
  name: string;
  nameHindi?: string;
  durationMinutes?: number;
  baseDakshina?: number;
}

interface PanditOption {
  id: string;
  displayName: string;
  profilePhotoUrl?: string;
  city: string;
  averageRating: number;
  totalReviews: number;
  specializations: string[];
  baseDakshina: number;
}

interface TravelOption {
  mode: string;
  label: string;
  totalCost: number;
  breakdown: { item: string; amount: number }[];
  estimatedDuration?: string;
}

type FoodArrangement = "SELF" | "PLATFORM";
type SamagriOption = "INCLUDED" | "SELF";
type WizardStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface BookingFormData {
  // Step 0 – Event Details
  ritualId: string;
  ritualName: string;
  eventDate: string;
  eventTime: string;
  venueLine1: string;
  venueLine2: string;
  venueCity: string;
  venuePincode: string;
  venueState: string;
  // Step 1 – Pandit
  panditId: string;
  panditName: string;
  dakshina: number;
  // Step 2 – Travel
  travelMode: string;
  travelCost: number;
  foodArrangement: FoodArrangement;
  foodCost: number;
  // Step 3 – Ritual Variation
  ritualVariation: string;
  // Step 4 – Preferences
  samagri: SamagriOption;
  specialInstructions: string;
  // Step 4 – Payment
  orderId: string;
  bookingId: string;
  bookingNumber: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DELHI_CITIES = [
  "Delhi", "Dwarka", "Rohini", "Noida", "Gurgaon", "Faridabad",
  "Ghaziabad", "Greater Noida", "South Delhi", "East Delhi",
  "West Delhi", "North Delhi",
];

const RITUALS_FALLBACK: Ritual[] = [
  { id: "r1", name: "Griha Pravesh", nameHindi: "गृह प्रवेश", durationMinutes: 120, baseDakshina: 11000 },
  { id: "r2", name: "Satyanarayan Katha", nameHindi: "सत्यनारायण कथा", durationMinutes: 150, baseDakshina: 7500 },
  { id: "r3", name: "Vivah Sanskar", nameHindi: "विवाह संस्कार", durationMinutes: 240, baseDakshina: 21000 },
  { id: "r4", name: "Namkaran Sanskar", nameHindi: "नामकरण संस्कार", durationMinutes: 90, baseDakshina: 5100 },
  { id: "r5", name: "Mundan Sanskar", nameHindi: "मुंडन संस्कार", durationMinutes: 90, baseDakshina: 5100 },
  { id: "r6", name: "Shanti Path", nameHindi: "शांति पाठ", durationMinutes: 60, baseDakshina: 5100 },
  { id: "r7", name: "Rudrabhishek", nameHindi: "रुद्राभिषेक", durationMinutes: 120, baseDakshina: 11000 },
  { id: "r8", name: "Sunderkand Path", nameHindi: "सुंदरकांड पाठ", durationMinutes: 120, baseDakshina: 7500 },
  { id: "r9", name: "Ganesh Puja", nameHindi: "गणेश पूजा", durationMinutes: 60, baseDakshina: 5100 },
  { id: "r10", name: "Navgraha Puja", nameHindi: "नवग्रह पूजा", durationMinutes: 90, baseDakshina: 7500 },
];

const PANDITS_FALLBACK: PanditOption[] = [
  { id: "p1", displayName: "Pt. Ramesh Sharma Shastri", city: "Dwarka", averageRating: 4.9, totalReviews: 312, specializations: ["Vivah Sanskar", "Griha Pravesh"], baseDakshina: 15000, profilePhotoUrl: "" },
  { id: "p2", displayName: "Pt. Suresh Mishra Vedacharya", city: "Rohini", averageRating: 4.8, totalReviews: 187, specializations: ["Satyanarayan Katha", "Rudrabhishek"], baseDakshina: 11000, profilePhotoUrl: "" },
  { id: "p3", displayName: "Pt. Dinesh Kumar Joshi", city: "Noida", averageRating: 4.7, totalReviews: 243, specializations: ["Namkaran Sanskar", "Mundan Sanskar"], baseDakshina: 8500, profilePhotoUrl: "" },
  { id: "p4", displayName: "Pt. Avinash Tiwari", city: "Gurgaon", averageRating: 4.6, totalReviews: 98, specializations: ["Griha Pravesh", "Shanti Path"], baseDakshina: 12000, profilePhotoUrl: "" },
];

const TRAVEL_FALLBACK: TravelOption[] = [
  { mode: "SELF_DRIVE", label: "Self-Drive", totalCost: 800, breakdown: [{ item: "Fuel & Toll", amount: 800 }], estimatedDuration: "45 min" },
  { mode: "CAB", label: "Cab", totalCost: 1200, breakdown: [{ item: "Cab fare", amount: 1200 }], estimatedDuration: "50 min" },
  { mode: "TRAIN", label: "Train", totalCost: 1800, breakdown: [{ item: "Ticket", amount: 1200 }, { item: "Auto to venue", amount: 600 }], estimatedDuration: "2h" },
  { mode: "FLIGHT", label: "Flight", totalCost: 5500, breakdown: [{ item: "Airfare", amount: 4500 }, { item: "Airport transfer", amount: 1000 }], estimatedDuration: "3h" },
];

const STEPS = [
  { label: "Event Details", icon: "calendar_month" },
  { label: "Select Pandit", icon: "person" },
  { label: "Travel", icon: "directions_car" },
  { label: "Ritual Style", icon: "location_on" },
  { label: "Preferences", icon: "tune" },
  { label: "Review & Pay", icon: "payments" },
  { label: "Confirmed", icon: "check_circle" },
];

const PLATFORM_FEE_PCT = 0.15;
const TRAVEL_SERVICE_FEE_PCT = 0.05;
const GST_PCT = 0.18;
const FOOD_PER_DAY = 500;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function StepIndicator({ current, steps }: { current: number; steps: typeof STEPS }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 overflow-x-auto px-2">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <div className={`h-0.5 w-6 sm:w-10 flex-shrink-0 transition-colors ${done ? "bg-[#f49d25]" : "bg-slate-200"}`} />
            )}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${done
                  ? "bg-[#f49d25] text-white"
                  : active
                    ? "bg-[#f49d25]/10 text-[#f49d25] ring-2 ring-[#f49d25]"
                    : "bg-slate-100 text-slate-400"
                  }`}
              >
                {done ? (
                  <span className="material-symbols-outlined text-base">check</span>
                ) : (
                  <span className="material-symbols-outlined text-base">{s.icon}</span>
                )}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${active ? "text-[#f49d25]" : done ? "text-slate-600" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function BookingWizardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, accessToken, openLoginModal, loading: authLoading } = useAuth();

  const [step, setStep] = useState<WizardStep>(0);
  const [form, setForm] = useState<BookingFormData>({
    ritualId: "",
    ritualName: "",
    eventDate: "",
    eventTime: "09:00",
    venueLine1: "",
    venueLine2: "",
    venueCity: "Delhi",
    venuePincode: "",
    venueState: "Delhi",
    panditId: searchParams.get("panditId") ?? "",
    panditName: "",
    dakshina: 0,
    travelMode: "",
    travelCost: 0,
    foodArrangement: "SELF",
    foodCost: 0,
    ritualVariation: "",
    samagri: "INCLUDED",
    specialInstructions: "",
    orderId: "",
    bookingId: "",
    bookingNumber: "",
  });

  const [rituals, setRituals] = useState<Ritual[]>(RITUALS_FALLBACK);
  const [pandits, setPandits] = useState<PanditOption[]>(PANDITS_FALLBACK);
  const [travelOptions, setTravelOptions] = useState<TravelOption[]>(TRAVEL_FALLBACK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentReady, setPaymentReady] = useState(false);

  // Samagri integration
  const { samagriItem, hasSamagri, setSamagriItem } = useCart();
  const [showSamagriModal, setShowSamagriModal] = useState(false);

  // Add-ons state
  const [addons, setAddons] = useState({
    backup: false,
    consultation: false,
    visarjan: false,
  });

  // pre-fill ritual from URL
  useEffect(() => {
    const ritual = searchParams.get("ritual");
    if (ritual) {
      const found = rituals.find((r) => r.name === ritual);
      if (found) set({ ritualId: found.id, ritualName: found.name, dakshina: found.baseDakshina ?? 0 });
    }
    const date = searchParams.get("date");
    if (date) set({ eventDate: date });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // fetch rituals
  useEffect(() => {
    fetch(`${API_BASE}/rituals`, { signal: AbortSignal.timeout(5000) })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((j) => {
        const data = j.data ?? j;
        if (Array.isArray(data) && data.length) setRituals(data);
      })
      .catch(() => { });
  }, []);

  // fetch pandits when ritual changes
  useEffect(() => {
    if (!form.ritualName) return;
    const p = new URLSearchParams({ ritual: form.ritualName, limit: "10" });
    fetch(`${API_BASE}/pandits?${p.toString()}`, { signal: AbortSignal.timeout(5000) })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((j) => {
        const data = j.data ?? j.pandits ?? j;
        if (Array.isArray(data) && data.length) {
          setPandits(
            data.map((p: Record<string, unknown>) => ({
              id: String(p.id),
              displayName: String(p.displayName ?? p.name ?? ""),
              profilePhotoUrl: (p.profilePhotoUrl as string) ?? "",
              city: String(p.city ?? ""),
              averageRating: Number(p.averageRating ?? 0),
              totalReviews: Number(p.totalReviews ?? 0),
              specializations: Array.isArray(p.specializations) ? p.specializations as string[] : [],
              baseDakshina: Number(p.baseDakshina ?? (p as Record<string, Record<string, number>>).basePricing?.base ?? 8000),
            }))
          );
        }
      })
      .catch(() => { });
  }, [form.ritualName]);

  function set(patch: Partial<BookingFormData>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  // ── Travel calculation ────────────────────────────────────────────────────

  const fetchTravel = useCallback(async () => {
    if (!form.panditId || !form.venueCity) return;
    const pandit = pandits.find((p) => p.id === form.panditId);
    if (!pandit) return;
    try {
      const res = await fetch(`${API_BASE}/travel/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromCity: pandit.city,
          toCity: form.venueCity,
          eventDays: 1,
          foodArrangement: form.foodArrangement,
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error();
      const j = await res.json();
      const data = j.data ?? j;
      if (Array.isArray(data) && data.length) setTravelOptions(data);
    } catch {
      // keep fallback
    }
  }, [form.panditId, form.venueCity, form.foodArrangement, pandits]);

  useEffect(() => {
    if (step === 2) fetchTravel();
  }, [step, fetchTravel]);

  // ── Pricing ───────────────────────────────────────────────────────────────

  const platformFee = Math.round(form.dakshina * PLATFORM_FEE_PCT);
  const travelServiceFee = form.travelCost > 0 ? Math.round(form.travelCost * TRAVEL_SERVICE_FEE_PCT) : 0;
  const foodAllowance = form.foodArrangement === "PLATFORM" ? FOOD_PER_DAY : 0;
  const samagriCost = (form.samagri === "INCLUDED" && samagriItem) ? samagriItem.totalCost : 0;

  const addonCost = (addons.backup ? 9999 : 0) + (addons.consultation ? 1100 : 0) + (addons.visarjan ? 500 : 0);

  const subtotal = form.dakshina + platformFee + form.travelCost + travelServiceFee + foodAllowance + samagriCost + addonCost;
  const gst = Math.round(platformFee * GST_PCT);
  const grandTotal = subtotal + gst;

  // ── Step validation ───────────────────────────────────────────────────────

  function canNext(): boolean {
    switch (step) {
      case 0:
        return !!(form.ritualId && form.eventDate && form.venueLine1 && form.venueCity);
      case 1:
        return !!form.panditId;
      case 2:
      case 2:
        return !!form.travelMode;
      case 3:
        return !!form.ritualVariation;
      case 4:
        if (form.samagri === "INCLUDED" && !samagriItem) return false;
        return true;
      case 5:
        return false; // payment handles progression
      default:
        return false;
    }
  }

  // ── Create booking & payment order ────────────────────────────────────────

  async function handleCreateOrder() {
    if (!user) {
      openLoginModal();
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Create booking
      const bookingRes = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          eventType: form.ritualName,
          panditId: form.panditId,
          eventDate: new Date(`${form.eventDate}T${form.eventTime || '09:00'}:00`).toISOString(),
          muhuratTime: form.eventTime,
          venueAddress: `${form.venueLine1}${form.venueLine2 ? ", " + form.venueLine2 : ""}${form.venueState ? ", " + form.venueState : ""}`,
          venueCity: form.venueCity,
          venuePincode: form.venuePincode,
          dakshinaAmount: form.dakshina,

          travelMode: form.travelMode,
          travelCost: form.travelCost,
          foodArrangement: form.foodArrangement === "PLATFORM" ? "PLATFORM_ALLOWANCE" : "CUSTOMER_PROVIDES",
          foodAllowanceDays: form.foodArrangement === "PLATFORM" ? 1 : 0,

          samagriPreference: form.samagri === "INCLUDED" ? "PANDIT_BRINGS" : "CUSTOMER_ARRANGES",
          samagriAmount: form.samagri === "INCLUDED" && samagriItem ? samagriItem.totalCost : 0,
          samagriNotes: (form.samagri === "INCLUDED" && samagriItem) ? JSON.stringify(samagriItem) : undefined,
          specialInstructions: form.specialInstructions,
        }),
      });

      if (!bookingRes.ok) {
        const j = await bookingRes.json().catch(() => ({}));
        throw new Error((j as { message?: string }).message ?? "Could not create booking");
      }

      const bookingJson = await bookingRes.json();
      const booking = bookingJson.data ?? bookingJson;
      const bookingId = booking.id ?? booking.bookingId;
      const bookingNumber = booking.bookingNumber ?? `HPJ-${Date.now().toString(36).toUpperCase()}`;

      // Create payment order
      const payRes = await fetch(`${API_BASE}/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!payRes.ok) {
        const j = await payRes.json().catch(() => ({}));
        throw new Error((j as { message?: string }).message ?? "Could not create payment order");
      }

      const payJson = await payRes.json();
      const payData = payJson.data ?? payJson;
      set({
        bookingId,
        bookingNumber,
        orderId: payData.orderId ?? payData.order_id ?? payData.id,
      });
      setPaymentReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      // For demo/mock mode, simulate success
      if (!form.bookingId) {
        const mockId = `bk_mock_${Date.now()}`;
        const mockNumber = `HPJ-${Date.now().toString(36).toUpperCase()}`;
        set({ bookingId: mockId, bookingNumber: mockNumber, orderId: `order_mock_${Date.now()}` });
        setPaymentReady(true);
        setError("");
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Payment success ───────────────────────────────────────────────────────

  function handlePaymentSuccess() {
    setStep(6);
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  function next() {
    if (step === 4) {
      // Step 4 -> 5 requires auth
      if (!user) {
        openLoginModal();
        return;
      }
      setStep(5);
      return;
    }
    if (step < 6) setStep((step + 1) as WizardStep);
  }

  function back() {
    if (step > 0) {
      setPaymentReady(false);
      setStep((step - 1) as WizardStep);
    }
  }

  // ── Loading state ─────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f49d25] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Confirmation Step ─────────────────────────────────────────────────────

  if (step === 6) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-500 mb-2">Your booking has been placed successfully.</p>
          <div className="inline-block bg-[#f49d25]/10 text-[#c47c0e] px-4 py-2 rounded-xl text-sm font-bold mb-6">
            {form.bookingNumber || "HPJ-XXXXXX"}
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="material-symbols-outlined text-base text-[#f49d25]">auto_stories</span>
              <span className="font-medium">{form.ritualName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="material-symbols-outlined text-base text-[#f49d25]">calendar_month</span>
              <span>{new Date(form.eventDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="material-symbols-outlined text-base text-[#f49d25]">person</span>
              <span>{form.panditName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="material-symbols-outlined text-base text-[#f49d25]">payments</span>
              <span className="font-semibold">{fmt(grandTotal)}</span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-500 mb-6">
            <p>📱 Confirmation SMS sent to your phone</p>
            <p>🙏 Pandit Ji will be notified and will confirm shortly</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/bookings")}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm"
            >
              View Bookings
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex-1 py-3 rounded-xl bg-[#f49d25] hover:bg-[#e08c14] text-white font-semibold transition-colors text-sm"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Wizard Body ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => step === 0 ? router.back() : back()} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors" aria-label="Back">
            <span className="material-symbols-outlined text-slate-500">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold text-slate-800">Book a Pandit</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <StepIndicator current={step} steps={STEPS} />

        {/* ── Step 0: Event Details ───────────────────────────────────────── */}
        {step === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f49d25]">calendar_month</span>
              Event Details
            </h2>

            {/* Ritual */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ceremony / Puja <span className="text-red-400">*</span></label>
              <select
                value={form.ritualId}
                onChange={(e) => {
                  const r = rituals.find((r) => r.id === e.target.value);
                  set({ ritualId: e.target.value, ritualName: r?.name ?? "", dakshina: r?.baseDakshina ?? 0 });
                }}
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] text-slate-700"
              >
                <option value="">Select a ceremony</option>
                {rituals.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.nameHindi ? `(${r.nameHindi})` : ""} {r.durationMinutes ? `· ${r.durationMinutes} min` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Date <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  value={form.eventDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => set({ eventDate: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Muhurat Time</label>
                <input
                  type="time"
                  value={form.eventTime}
                  onChange={(e) => set({ eventTime: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] text-slate-700"
                />
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Venue Address <span className="text-red-400">*</span></label>
              <input
                value={form.venueLine1}
                onChange={(e) => set({ venueLine1: e.target.value })}
                placeholder="House / Flat / Street"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] text-slate-700 mb-3"
              />
              <input
                value={form.venueLine2}
                onChange={(e) => set({ venueLine2: e.target.value })}
                placeholder="Landmark (optional)"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] text-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">City <span className="text-red-400">*</span></label>
                <select
                  value={form.venueCity}
                  onChange={(e) => set({ venueCity: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] text-slate-700"
                >
                  {DELHI_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Pincode</label>
                <input
                  value={form.venuePincode}
                  onChange={(e) => set({ venuePincode: e.target.value })}
                  placeholder="110001"
                  maxLength={6}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
                <input value={form.venueState} onChange={(e) => set({ venueState: e.target.value })} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] text-slate-700" />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Pandit Selection ───────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[#f49d25]">person</span>
                Select a Pandit
              </h2>
              <p className="text-sm text-slate-400 mb-5">Choose a verified pandit for your {form.ritualName || "ceremony"}</p>

              <div className="space-y-3">
                {pandits.map((p) => {
                  const selected = form.panditId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => set({ panditId: p.id, panditName: p.displayName, dakshina: p.baseDakshina })}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selected
                        ? "border-[#f49d25] bg-[#f49d25]/5 shadow-md"
                        : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#f49d25]/10 border border-[#f49d25]/20 flex items-center justify-center shrink-0 overflow-hidden">
                          {p.profilePhotoUrl ? (
                            <img src={p.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-[#f49d25]">person</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-800 truncate">{p.displayName}</h3>
                            {selected && (
                              <span className="material-symbols-outlined text-[#f49d25] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                            <span className="flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[#f49d25] text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                              {p.averageRating}
                            </span>
                            <span>·</span>
                            <span>{p.totalReviews} reviews</span>
                            <span>·</span>
                            <span>{p.city}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {p.specializations.slice(0, 3).map((s) => (
                              <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-slate-800">{fmt(p.baseDakshina)}</p>
                          <p className="text-[10px] text-slate-400">Dakshina</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Travel & Logistics ─────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary">directions_car</span>
                Travel & Logistics
              </h2>
              <p className="text-sm text-slate-500 mb-6">Select the most convenient travel option for Pandit Ji.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {travelOptions.map((t) => {
                  const selected = form.travelMode === t.mode;
                  const icons: Record<string, string> = {
                    SELF_DRIVE: "directions_car",
                    CAB: "local_taxi",
                    TRAIN: "train",
                    FLIGHT: "flight",
                    BUS: "directions_bus",
                  };
                  return (
                    <div
                      key={t.mode}
                      onClick={() => set({ travelMode: t.mode, travelCost: t.totalCost })}
                      className={`relative group cursor-pointer border-2 rounded-xl p-5 flex flex-col h-full transition-all hover:shadow-md ${selected
                        ? "border-primary bg-primary/5"
                        : "border-slate-100 bg-white hover:border-primary/50"
                        }`}
                    >
                      {selected && (
                        <div className="absolute top-3 right-3">
                          <span className="material-symbols-outlined text-primary fill-1">check_circle</span>
                        </div>
                      )}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${selected ? "bg-primary/20" : "bg-slate-100 group-hover:bg-primary/10"
                        }`}>
                        <span className={`material-symbols-outlined text-3xl ${selected ? "text-primary" : "text-slate-400 group-hover:text-primary"
                          }`}>
                          {icons[t.mode] ?? "route"}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 mb-1">{t.label}</h3>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        {t.estimatedDuration ? `Est. ${t.estimatedDuration}` : "Standard Travel"}
                      </p>

                      <div className="mt-auto pt-4">
                        <p className="text-lg font-bold text-slate-900 mb-3">{fmt(t.totalCost)}</p>
                        <button className={`w-full py-2 font-bold rounded-lg text-sm transition-colors ${selected
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-slate-900 group-hover:bg-primary/20 group-hover:text-primary"
                          }`}>
                          {selected ? "Selected" : "Select"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Food Arrangement */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">restaurant</span>
                  Food & Accommodation
                </h3>
                <div className="space-y-4">
                  {[
                    { value: "SELF" as FoodArrangement, label: "I will provide meals & stay", desc: "Host takes care of Satvik meals and lodging" },
                    { value: "PLATFORM" as FoodArrangement, label: "Add Food Allowance", desc: `${fmt(FOOD_PER_DAY)}/day will be added to billing` },
                  ].map((opt) => {
                    const active = form.foodArrangement === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group"
                      >
                        <input
                          type="radio"
                          name="food_pref"
                          checked={active}
                          onChange={() => set({ foodArrangement: opt.value, foodCost: opt.value === "PLATFORM" ? FOOD_PER_DAY : 0 })}
                          className="w-5 h-5 text-primary border-slate-300 focus:ring-primary accent-primary"
                        />
                        <div className="ml-4">
                          <p className="font-medium text-slate-900">{opt.label}</p>
                          <p className="text-xs text-slate-500">{opt.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Ritual Variation ───────────────────────────────────── */}
        {step === 3 && (
          <RitualVariationSelection
            selectedVariation={form.ritualVariation}
            onSelect={(variation) => set({ ritualVariation: variation })}
          />
        )}

        {/* ── Step 4: Preferences ─────────────────────────────────────────── */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f49d25]">tune</span>
              Preferences
            </h2>

            {/* Samagri */}
            {/* Samagri */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Puja Samagri (Materials)</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { value: "INCLUDED" as SamagriOption, label: "Pandit Ji brings", icon: "inventory_2", desc: samagriItem ? "Package selected" : "Select a package" },
                  { value: "SELF" as SamagriOption, label: "I'll arrange myself", icon: "shopping_bag", desc: "You buy materials" },
                ].map((opt) => {
                  const active = form.samagri === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => set({ samagri: opt.value })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${active ? "border-[#f49d25] bg-[#f49d25]/5" : "border-slate-100 hover:border-slate-200"
                        }`}
                    >
                      <span className={`material-symbols-outlined text-xl mb-2 ${active ? "text-[#f49d25]" : "text-slate-400"}`}>{opt.icon}</span>
                      <p className="text-sm font-medium text-slate-700">{opt.label}</p>
                      <p className="text-xs text-slate-400">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Package Selection */}
              {form.samagri === "INCLUDED" && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  {samagriItem ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-800">
                            {samagriItem.type === "package" ? `${samagriItem.packageName} Package` : "Custom Selection"}
                          </span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">
                            Selected
                          </span>
                        </div>
                        <div className="text-sm text-slate-600">
                          Total: <span className="font-bold">₹{samagriItem.totalCost.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowSamagriModal(true)}
                        className="text-sm text-[#f49d25] font-semibold hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-slate-500 mb-3">Select a samagri package or build your own list.</p>
                      <button
                        onClick={() => setShowSamagriModal(true)}
                        className="px-4 py-2 bg-[#f49d25] text-white text-sm font-semibold rounded-lg hover:bg-[#e08c14] transition-colors"
                      >
                        Select Samagri
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Special Instructions (optional)</label>
              <textarea
                value={form.specialInstructions}
                onChange={(e) => set({ specialInstructions: e.target.value })}
                placeholder="Any special requirements, parking instructions, or notes for Pandit Ji…"
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] text-slate-700 resize-none placeholder-slate-400"
              />
              <p className="text-xs text-slate-400 mt-1">{form.specialInstructions.length} / 500</p>
            </div>
          </div>
        )}

        {/* ── Step 5: Review & Pay ────────────────────────────────────────── */}
        {step === 5 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Details & Itemization */}
            <div className="lg:col-span-8 space-y-6">
              {/* Event Section */}
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">event_available</span>
                  <h2 className="text-xl font-bold text-slate-900">Event Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div className="flex flex-col border-b border-slate-50 pb-2">
                    <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Event Type</span>
                    <span className="text-slate-900 font-medium">{form.ritualName}</span>
                  </div>
                  <div className="flex flex-col border-b border-slate-50 pb-2">
                    <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Primary Pandit</span>
                    <span className="text-slate-900 font-medium">{form.panditName}</span>
                  </div>
                  <div className="flex flex-col border-b border-slate-50 pb-2">
                    <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Date & Time</span>
                    <span className="text-slate-900 font-medium">
                      {new Date(form.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      {form.eventTime && ` · ${form.eventTime}`}
                    </span>
                  </div>
                  <div className="flex flex-col border-b border-slate-50 pb-2">
                    <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Venue</span>
                    <span className="text-slate-900 font-medium truncate">{form.venueLine1}, {form.venueCity}</span>
                  </div>
                </div>
              </section>

              {/* Cost Breakdown Section */}
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary">receipt_long</span>
                  <h2 className="text-xl font-bold text-slate-900">Cost Itemization</h2>
                </div>
                <div className="space-y-4">
                  {/* Dakshina */}
                  <div className="flex justify-between items-start py-2">
                    <div>
                      <p className="text-slate-900 font-semibold">Pandit Dakshina</p>
                      <p className="text-slate-500 text-xs">Standard professional fees for main ritual</p>
                    </div>
                    <span className="font-semibold">{fmt(form.dakshina)}</span>
                  </div>

                  {/* Samagri */}
                  {samagriCost > 0 && (
                    <div className="flex justify-between items-start py-2">
                      <div>
                        <p className="text-slate-900 font-semibold">Samagri Package ({samagriItem?.type === "package" ? "Standard" : "Custom"})</p>
                        <p className="text-slate-500 text-xs">Including organic materials and essentials</p>
                      </div>
                      <span className="font-semibold">{fmt(samagriCost)}</span>
                    </div>
                  )}

                  {/* Logistics Breakdown */}
                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Logistics & Travel</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Travel ({form.travelMode})</span>
                      <span className="font-medium text-slate-900">{fmt(form.travelCost)}</span>
                    </div>
                    {foodAllowance > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Food Allowance</span>
                        <span className="font-medium text-slate-900">{fmt(foodAllowance)}</span>
                      </div>
                    )}
                    {travelServiceFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Travel Service Fee</span>
                        <span className="font-medium text-slate-900">{fmt(travelServiceFee)}</span>
                      </div>
                    )}
                  </div>

                  {/* Platform Fee */}
                  <div className="flex justify-between items-start py-2">
                    <div>
                      <p className="text-slate-900 font-semibold">Platform Fee & GST</p>
                      <p className="text-slate-500 text-xs">Convenience fee + 18% GST on fee</p>
                    </div>
                    <span className="font-semibold">{fmt(platformFee + gst)}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Add-ons & Checkout */}
            <div className="lg:col-span-4 space-y-6">
              {/* Add-ons Section */}
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">add_circle</span>
                  <h2 className="text-lg font-bold text-slate-900">Recommended Add-ons</h2>
                </div>
                <div className="space-y-4">
                  {/* Backup Guarantee */}
                  <div className={`p-3 border-2 rounded-lg flex items-center justify-between gap-3 ${addons.backup ? "border-primary bg-primary/5" : "border-slate-100"}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-bold text-slate-900">Premium Backup</p>
                        <span className="text-[10px] bg-primary text-white px-1 rounded">SAFE</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Guaranteed replacement within 2 hrs</p>
                      <p className="text-xs font-bold text-primary mt-1">+ ₹9,999</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={addons.backup}
                      onChange={(e) => setAddons(prev => ({ ...prev, backup: e.target.checked }))}
                      className="w-5 h-5 accent-primary rounded cursor-pointer"
                    />
                  </div>

                  {/* Muhurat Consultation */}
                  <div className={`p-3 border rounded-lg flex items-center justify-between gap-3 ${addons.consultation ? "border-primary bg-primary/5" : "border-slate-200"}`}>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">Muhurat Consultation</p>
                      <p className="text-[11px] text-slate-500">15-min call for optimal timing</p>
                      <p className="text-xs font-bold text-primary mt-1">+ ₹1,100</p>
                    </div>
                    <button
                      onClick={() => setAddons(prev => ({ ...prev, consultation: !prev.consultation }))}
                      className={`p-1 rounded transition-colors ${addons.consultation ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary hover:text-white"}`}
                    >
                      <span className="material-symbols-outlined text-sm">{addons.consultation ? "check" : "add"}</span>
                    </button>
                  </div>

                  {/* Nirmalya Visarjan */}
                  <div className={`p-3 border rounded-lg flex items-center justify-between gap-3 ${addons.visarjan ? "border-primary bg-primary/5" : "border-slate-200"}`}>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">Nirmalya Visarjan</p>
                      <p className="text-[11px] text-slate-500">Eco-friendly waste management</p>
                      <p className="text-xs font-bold text-primary mt-1">+ ₹500</p>
                    </div>
                    <button
                      onClick={() => setAddons(prev => ({ ...prev, visarjan: !prev.visarjan }))}
                      className={`p-1 rounded transition-colors ${addons.visarjan ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary hover:text-white"}`}
                    >
                      <span className="material-symbols-outlined text-sm">{addons.visarjan ? "check" : "add"}</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Grand Total Sticky Box */}
              <section className="sticky top-24 bg-white rounded-xl border-t-4 border-primary shadow-xl overflow-hidden">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-slate-500 text-sm">
                    <span>Subtotal</span>
                    <span>{fmt(subtotal - addonCost)}</span>
                  </div>
                  {addonCost > 0 && (
                    <div className="flex justify-between items-center text-slate-500 text-sm">
                      <span>Add-ons</span>
                      <span>{fmt(addonCost)}</span>
                    </div>
                  )}
                  {/* Coupon Placeholder */}
                  {/* <div className="flex justify-between items-center text-primary text-sm font-bold bg-primary/5 p-2 rounded">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">local_offer</span> PANDIT10</span>
                    <span>-₹0</span>
                  </div> */}

                  <div className="h-px bg-slate-100 my-2"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-xl font-black text-slate-900">Grand Total</span>
                    <span className="text-2xl font-black text-primary">{fmt(grandTotal)}</span>
                  </div>
                  <p className="text-[10px] text-center text-slate-500">Inclusive of all taxes and automated travel credits</p>
                </div>

                {!paymentReady ? (
                  <button
                    onClick={handleCreateOrder}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 flex items-center justify-center gap-2 text-lg transition-all group disabled:opacity-70"
                  >
                    {loading ? "Processing..." : (
                      <>
                        Proceed to Payment
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="p-4 bg-slate-50">
                    <RazorpayCheckout
                      orderId={form.orderId}
                      amount={grandTotal * 100}
                      razorpayKey={process.env.NEXT_PUBLIC_RAZORPAY_KEY ?? "rzp_test_mock"}
                      bookingId={form.bookingId}
                      bookingNumber={form.bookingNumber}
                      customerName={user?.fullName ?? "Customer"}
                      customerPhone={user?.phone}
                      accessToken={accessToken ?? ""}
                      onSuccess={handlePaymentSuccess}
                      onFailure={(e) => setError(e)}
                    />
                  </div>
                )}
              </section>

              <div className="flex flex-col gap-4 text-center mt-6">
                <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm text-green-500">verified_user</span>
                  Secure 256-bit encrypted checkout
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation Buttons ──────────────────────────────────────────── */}
        {step < 5 && (
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button
                onClick={back}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm"
              >
                Back
              </button>
            )}
            <button
              onClick={next}
              disabled={!canNext()}
              className="flex-1 py-3 rounded-xl bg-[#f49d25] hover:bg-[#e08c14] disabled:opacity-50 text-white font-bold text-sm transition-all"
            >
              {step === 4 ? (user ? "Review & Pay" : "Login & Continue") : "Continue"}
            </button>
          </div>
        )}
      </div>

      {/* Samagri Modal */}
      {
        showSamagriModal && form.panditId && (
          <SamagriModal
            panditId={form.panditId}
            pujaType={form.ritualName}
            onSelect={(selection) => {
              setSamagriItem({ ...selection, pujaType: form.ritualName });
              setShowSamagriModal(false);
            }}
            onClose={() => setShowSamagriModal(false)}
          />
        )
      }
    </div >
  );
}
