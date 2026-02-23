"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, API_BASE } from "../../../src/context/auth-context";
import RazorpayCheckout from "../../../src/components/RazorpayCheckout";
import { SamagriModal } from "../../../src/components/samagri/SamagriModal";
import { useCart } from "../../../src/context/cart-context";
import { RitualVariationSelection } from "../../../src/components/booking/RitualVariationSelection";

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

type FoodArrangement = "CUSTOMER_PROVIDES" | "PLATFORM_ALLOWANCE";
type SamagriOption = "PANDIT_PACKAGE" | "PLATFORM_CUSTOM";
type WizardStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface BookingFormData {
  // Step 0 â€“ Event Details
  ritualId: string;
  ritualName: string;
  eventDate: string;
  eventTime: string;
  attendees: number;
  isMultiDay: boolean;
  endDate: string;
  venueLine1: string;
  venueLine2: string;
  venueCity: string;
  venuePincode: string;
  venueState: string;
  gotra: string;
  familyMembers: string[];
  // Step 1 â€“ Pandit
  panditId: string;
  panditName: string;
  dakshina: number;
  // Step 2 â€“ Travel
  travelMode: string;
  travelCost: number;
  foodArrangement: FoodArrangement;
  foodCost: number;
  accommodationArrangement: "NOT_NEEDED" | "CUSTOMER_ARRANGES" | "PLATFORM_BOOKS";
  accommodationCost: number;
  localTransportNeeded: boolean;
  localTransportCost: number;
  // Step 3 â€“ Ritual Variation
  ritualVariation: string;
  // Step 4 â€“ Preferences
  samagri: SamagriOption;
  specialInstructions: string;
  // Step 4 â€“ Payment
  orderId: string;
  bookingId: string;
  bookingNumber: string;
}

// â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DELHI_CITIES = [
  "Delhi", "Dwarka", "Rohini", "Noida", "Gurgaon", "Faridabad",
  "Ghaziabad", "Greater Noida", "South Delhi", "East Delhi",
  "West Delhi", "North Delhi",
];

const RITUALS_FALLBACK: Ritual[] = [
  { id: "r1", name: "Griha Pravesh", nameHindi: "à¤—à¥ƒà¤¹ à¤ªà¥à¤°à¤µà¥‡à¤¶", durationMinutes: 120, baseDakshina: 11000 },
  { id: "r2", name: "Satyanarayan Katha", nameHindi: "à¤¸à¤¤à¥à¤¯à¤¨à¤¾à¤°à¤¾à¤¯à¤£ à¤•à¤¥à¤¾", durationMinutes: 150, baseDakshina: 7500 },
  { id: "r3", name: "Vivah Sanskar", nameHindi: "à¤µà¤¿à¤µà¤¾à¤¹ à¤¸à¤‚à¤¸à¥à¤•à¤¾à¤°", durationMinutes: 240, baseDakshina: 21000 },
  { id: "r4", name: "Namkaran Sanskar", nameHindi: "à¤¨à¤¾à¤®à¤•à¤°à¤£ à¤¸à¤‚à¤¸à¥à¤•à¤¾à¤°", durationMinutes: 90, baseDakshina: 5100 },
  { id: "r5", name: "Mundan Sanskar", nameHindi: "à¤®à¥à¤‚à¤¡à¤¨ à¤¸à¤‚à¤¸à¥à¤•à¤¾à¤°", durationMinutes: 90, baseDakshina: 5100 },
  { id: "r6", name: "Shanti Path", nameHindi: "à¤¶à¤¾à¤‚à¤¤à¤¿ à¤ªà¤¾à¤ ", durationMinutes: 60, baseDakshina: 5100 },
  { id: "r7", name: "Rudrabhishek", nameHindi: "à¤°à¥à¤¦à¥à¤°à¤¾à¤­à¤¿à¤·à¥‡à¤•", durationMinutes: 120, baseDakshina: 11000 },
  { id: "r8", name: "Sunderkand Path", nameHindi: "à¤¸à¥à¤‚à¤¦à¤°à¤•à¤¾à¤‚à¤¡ à¤ªà¤¾à¤ ", durationMinutes: 120, baseDakshina: 7500 },
  { id: "r9", name: "Ganesh Puja", nameHindi: "à¤—à¤£à¥‡à¤¶ à¤ªà¥‚à¤œà¤¾", durationMinutes: 60, baseDakshina: 5100 },
  { id: "r10", name: "Navgraha Puja", nameHindi: "à¤¨à¤µà¤—à¥à¤°à¤¹ à¤ªà¥‚à¤œà¤¾", durationMinutes: 90, baseDakshina: 7500 },
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
  { label: "Ritual Details", icon: "location_on" },
  { label: "Preferences", icon: "tune" },
  { label: "Review & Pay", icon: "payments" },
  { label: "Confirmed", icon: "check_circle" },
];

const PLATFORM_FEE_PCT = 0.15;
const TRAVEL_SERVICE_FEE_PCT = 0.05;
const SAMAGRI_SERVICE_FEE_PCT = 0.1;
const GST_PCT = 0.18;
const FOOD_PER_DAY = 1000;
const MUHURAT_CONSULTATION_FEE = 499;

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function fmt(n: number) {
  return `â‚¹${Math.round(n).toLocaleString("en-IN")}`;
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

// â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    attendees: 11,
    isMultiDay: false,
    endDate: "",
    venueLine1: "",
    venueLine2: "",
    venueCity: "Delhi",
    venuePincode: "",
    venueState: "Delhi",
    gotra: "",
    familyMembers: [],
    panditId: searchParams.get("panditId") ?? "",
    panditName: "",
    dakshina: 0,
    travelMode: "",
    travelCost: 0,
    foodArrangement: "CUSTOMER_PROVIDES",
    foodCost: 0,
    accommodationArrangement: "NOT_NEEDED",
    accommodationCost: 0,
    localTransportNeeded: false,
    localTransportCost: 0,
    ritualVariation: "",
    samagri: "PANDIT_PACKAGE",
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
  const [familyInput, setFamilyInput] = useState("");
  const [contactImportMessage, setContactImportMessage] = useState("");
  const [muhuratConsultation, setMuhuratConsultation] = useState(false);

  // Add-ons state
  const [addons, setAddons] = useState({
    backup: false,
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

  async function importFromContacts() {
    if (typeof navigator === "undefined") return;
    const nav = navigator as Navigator & {
      contacts?: {
        select?: (props: string[], options?: { multiple?: boolean }) => Promise<Array<{ name?: string[] }>>;
      };
    };

    if (!nav.contacts?.select) {
      setContactImportMessage("Contacts access is not supported on this browser. Please type family names manually.");
      return;
    }

    try {
      const picked = await nav.contacts.select(["name"], { multiple: true });
      const names = picked
        .map((c) => c.name?.[0]?.trim())
        .filter((n): n is string => !!n && n.length > 0);

      if (names.length > 0) {
        set({
          familyMembers: Array.from(new Set([...form.familyMembers, ...names])).slice(0, 10),
        });
        setContactImportMessage(`${names.length} family member${names.length > 1 ? "s" : ""} imported from contacts.`);
      } else {
        setContactImportMessage("No contact names were selected.");
      }
    } catch {
      setContactImportMessage("Contacts permission denied or cancelled. You can continue by entering names manually.");
    }
  }

  // â”€â”€ Travel calculation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
          eventDays:
            form.isMultiDay && form.endDate
              ? Math.max(
                  1,
                  Math.floor(
                    (new Date(form.endDate).getTime() - new Date(form.eventDate || form.endDate).getTime()) /
                      (1000 * 60 * 60 * 24),
                  ) + 1,
                )
              : 1,
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

  // â”€â”€ Pricing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const selectedPandit = pandits.find((p) => p.id === form.panditId);
  const eventDays =
    form.isMultiDay && form.eventDate && form.endDate
      ? Math.max(
          1,
          Math.floor((new Date(form.endDate).getTime() - new Date(form.eventDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
        )
      : 1;
  const isOutstation =
    !!selectedPandit &&
    !!form.venueCity &&
    selectedPandit.city.trim().toLowerCase() !== form.venueCity.trim().toLowerCase();
  const travelDays = isOutstation ? 2 : 0;
  const pujaMealAllowanceDays = form.foodArrangement === "PLATFORM_ALLOWANCE" ? eventDays : 0;
  const foodAllowanceDays = travelDays + pujaMealAllowanceDays;
  const localTransportCost = isOutstation && form.localTransportNeeded ? form.localTransportCost : 0;
  const accommodationCost = isOutstation && form.accommodationArrangement === "PLATFORM_BOOKS" ? form.accommodationCost : 0;
  const effectiveTravelCost = form.travelCost + localTransportCost;

  const platformFee = Math.round(form.dakshina * PLATFORM_FEE_PCT);
  const travelServiceFee = effectiveTravelCost > 0 ? Math.round(effectiveTravelCost * TRAVEL_SERVICE_FEE_PCT) : 0;
  const foodAllowance = FOOD_PER_DAY * foodAllowanceDays;
  const samagriCost = samagriItem ? samagriItem.totalCost : 0;
  const samagriServiceFee = samagriCost > 0 ? Math.round(samagriCost * SAMAGRI_SERVICE_FEE_PCT) : 0;

  const addonCost =
    (addons.backup ? 9999 : 0) +
    (muhuratConsultation ? MUHURAT_CONSULTATION_FEE : 0) +
    (addons.visarjan ? 500 : 0);

  const baseSubtotal = form.dakshina + effectiveTravelCost + foodAllowance + samagriCost + accommodationCost;
  const subtotal = baseSubtotal + addonCost;
  const totalPlatformFees = platformFee + travelServiceFee + samagriServiceFee;
  const gst = Math.round(totalPlatformFees * GST_PCT);
  const grandTotal = subtotal + totalPlatformFees + gst;
  const payableNow = grandTotal > 5000 ? Math.round(grandTotal * 0.5) : grandTotal;
  const payableLater = grandTotal - payableNow;

  useEffect(() => {
    if (!selectedPandit || isOutstation) return;
    setForm((prev) => {
      if (
        prev.travelMode === "LOCAL" &&
        prev.travelCost === 0 &&
        prev.accommodationArrangement === "NOT_NEEDED" &&
        prev.accommodationCost === 0 &&
        prev.localTransportNeeded === false &&
        prev.localTransportCost === 0
      ) {
        return prev;
      }
      return {
        ...prev,
        travelMode: "LOCAL",
        travelCost: 0,
        accommodationArrangement: "NOT_NEEDED",
        accommodationCost: 0,
        localTransportNeeded: false,
        localTransportCost: 0,
      };
    });
  }, [isOutstation, selectedPandit]);

  useEffect(() => {
    if (!isOutstation) return;
    setForm((prev) => {
      if (prev.accommodationArrangement !== "NOT_NEEDED") return prev;
      return { ...prev, accommodationArrangement: "CUSTOMER_ARRANGES" };
    });
  }, [isOutstation]);

  // â”€â”€ Step validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  function canNext(): boolean {
    switch (step) {
      case 0:
        return !!(
          form.ritualId &&
          form.eventDate &&
          (!form.isMultiDay || (form.endDate && form.endDate >= form.eventDate)) &&
          form.venueLine1 &&
          form.venueCity &&
          form.attendees > 0 &&
          form.venuePincode.length === 6
        );
      case 1:
        return !!form.panditId;
      case 2:
        return !isOutstation || !!form.travelMode;
      case 3:
        return !!form.ritualVariation;
      case 4:
        if (!samagriItem) return false;
        if (form.samagri === "PANDIT_PACKAGE" && samagriItem.type !== "package") return false;
        if (form.samagri === "PLATFORM_CUSTOM" && samagriItem.type !== "custom") return false;
        return true;
      case 5:
        return false; // payment handles progression
      default:
        return false;
    }
  }

  // â”€â”€ Create booking & payment order â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
          attendees: form.attendees,
          dakshinaAmount: form.dakshina,

          travelMode: form.travelMode,
          travelCost: effectiveTravelCost,
          foodArrangement: form.foodArrangement,
          foodAllowanceDays,
          accommodationArrangement: form.accommodationArrangement,

          samagriPreference: form.samagri === "PANDIT_PACKAGE" ? "PANDIT_BRINGS" : "CUSTOMER_ARRANGES",
          samagriAmount: samagriCost,
          samagriNotes: samagriItem
            ? `${samagriItem.type === "package" ? "Pandit fixed package" : "Platform custom list"} | Total: ${fmt(samagriItem.totalCost)}`
            : undefined,
          specialInstructions: [
            form.specialInstructions,
            form.gotra ? `Gotra: ${form.gotra}` : "",
            form.familyMembers.length > 0 ? `Family members: ${form.familyMembers.join(", ")}` : "",
            `Samagri path: ${form.samagri === "PANDIT_PACKAGE" ? "Pandit's Fixed Package" : "Platform Custom List"}.`,
            isOutstation ? `Accommodation: ${form.accommodationArrangement}.` : "Local booking (no accommodation required).",
            form.localTransportNeeded ? `Local transport arranged via platform (${fmt(form.localTransportCost)}).` : "",
            muhuratConsultation ? "Muhurat consultation requested (â‚¹499)." : "Muhurat consultation skipped.",
            addons.backup ? "Backup Guarantee added (â‚¹9,999)." : "",
          ].filter(Boolean).join(" | "),
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

  // â”€â”€ Payment success â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  function handlePaymentSuccess() {
    setStep(6);
  }

  // â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  function next() {
    if (step === 1 && !isOutstation) {
      set({
        travelMode: "LOCAL",
        travelCost: 0,
        accommodationArrangement: "NOT_NEEDED",
        accommodationCost: 0,
        localTransportNeeded: false,
        localTransportCost: 0,
        foodArrangement: "CUSTOMER_PROVIDES",
      });
      setStep(3);
      return;
    }
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
    if (step === 3 && !isOutstation) {
      setPaymentReady(false);
      setStep(1);
      return;
    }
    if (step > 0) {
      setPaymentReady(false);
      setStep((step - 1) as WizardStep);
    }
  }

  // â”€â”€ Loading state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f49d25] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // â”€â”€ Confirmation Step â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
            <p>ðŸ“± Confirmation SMS sent to your phone</p>
            <p>ðŸ™ Pandit Ji will be notified and will confirm shortly</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard/bookings")}
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

  // â”€â”€ Wizard Body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

        {/* â”€â”€ Step 0: Event Details â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                    {r.name} {r.nameHindi ? `(${r.nameHindi})` : ""} {r.durationMinutes ? `Â· ${r.durationMinutes} min` : ""}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Attendees <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={form.attendees}
                  onChange={(e) => set({ attendees: Math.max(1, Number(e.target.value || 1)) })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Multi-day Ceremony</label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isMultiDay}
                    onChange={(e) => set({ isMultiDay: e.target.checked, endDate: e.target.checked ? form.endDate : "" })}
                    className="accent-[#f49d25]"
                  />
                  This ceremony spans multiple days
                </label>
                {form.isMultiDay && (
                  <input
                    type="date"
                    min={form.eventDate || new Date().toISOString().split("T")[0]}
                    value={form.endDate}
                    onChange={(e) => set({ endDate: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] text-slate-700"
                  />
                )}
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
                  onChange={(e) => set({ venuePincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Gotra (optional)</label>
                <input
                  value={form.gotra}
                  onChange={(e) => set({ gotra: e.target.value })}
                  placeholder="e.g., Bharadwaj"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Family members</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void importFromContacts()}
                    className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Add from Contacts
                  </button>
                  <input
                    value={familyInput}
                    onChange={(e) => setFamilyInput(e.target.value)}
                    placeholder="Type name and press Add"
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const nextName = familyInput.trim();
                      if (!nextName) return;
                      set({ familyMembers: Array.from(new Set([...form.familyMembers, nextName])).slice(0, 10) });
                      setFamilyInput("");
                    }}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#f49d25] text-white hover:bg-[#e08c14]"
                  >
                    Add
                  </button>
                </div>
                {contactImportMessage && <p className="text-xs mt-2 text-slate-500">{contactImportMessage}</p>}
                {form.familyMembers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {form.familyMembers.map((name) => (
                      <span key={name} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full text-xs text-slate-700">
                        {name}
                        <button
                          type="button"
                          onClick={() => set({ familyMembers: form.familyMembers.filter((member) => member !== name) })}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          Ã—
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* â”€â”€ Step 1: Pandit Selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                            <span>Â·</span>
                            <span>{p.totalReviews} reviews</span>
                            <span>Â·</span>
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

        {/* â”€â”€ Step 2: Travel & Logistics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {step === 2 && (
          !isOutstation ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary">near_me</span>
                Local Booking Detected
              </h2>
              <p className="text-sm text-slate-600">
                Pandit and venue are in the same city, so travel/accommodation step is auto-skipped as per platform policy.
              </p>
              <div className="mt-4 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
                Food allowance remains optional for puja day only. Outstation travel policies do not apply here.
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary">directions_car</span>
                  Travel & Accommodation
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  Choose travel mode preferred by Pandit Ji. Platform will coordinate logistics for non self-drive options.
                </p>

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
                        onClick={() =>
                          set({
                            travelMode: t.mode,
                            travelCost: t.totalCost,
                            localTransportNeeded: t.mode === "SELF_DRIVE" ? false : form.localTransportNeeded,
                            localTransportCost: t.mode === "SELF_DRIVE" ? 0 : form.localTransportCost,
                          })
                        }
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

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">restaurant</span>
                    Food Allowance Policy
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        value: "CUSTOMER_PROVIDES" as FoodArrangement,
                        label: "Yes, I will provide meals on puja days",
                        desc: `Travel days (${travelDays}) still include mandatory food allowance.`,
                      },
                      {
                        value: "PLATFORM_ALLOWANCE" as FoodArrangement,
                        label: "No, please add food allowance",
                        desc: `${fmt(FOOD_PER_DAY)} added per day. Current allowance days: ${foodAllowanceDays}.`,
                      },
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
                            onChange={() =>
                              set({
                                foodArrangement: opt.value,
                                foodCost: FOOD_PER_DAY * (travelDays + (opt.value === "PLATFORM_ALLOWANCE" ? eventDays : 0)),
                              })
                            }
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
                  <p className="text-xs text-slate-500 mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    Platform policy: food allowance is non-negotiable at {fmt(FOOD_PER_DAY)}/day.
                    Outstation travel days are always counted; puja days are counted when meals are not provided.
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">hotel</span>
                    Stay & Local Commute
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { value: "CUSTOMER_ARRANGES", label: "Customer will arrange hotel" },
                      { value: "PLATFORM_BOOKS", label: "Book via platform" },
                    ].map((opt) => {
                      const active = form.accommodationArrangement === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            set({
                              accommodationArrangement: opt.value as BookingFormData["accommodationArrangement"],
                              accommodationCost:
                                opt.value === "PLATFORM_BOOKS"
                                  ? (form.accommodationCost > 0 ? form.accommodationCost : 3000)
                                  : 0,
                            })
                          }
                          className={`text-left p-4 rounded-xl border-2 transition-all ${active
                            ? "border-primary bg-primary/5"
                            : "border-slate-100 hover:border-slate-200"
                            }`}
                        >
                          <p className="text-sm font-semibold text-slate-800">{opt.label}</p>
                        </button>
                      );
                    })}
                  </div>

                  {form.accommodationArrangement === "PLATFORM_BOOKS" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Estimated Hotel Cost</label>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={form.accommodationCost}
                        onChange={(e) => set({ accommodationCost: Math.max(0, Number(e.target.value || 0)) })}
                        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] text-slate-700"
                      />
                    </div>
                  )}

                  {form.travelMode !== "SELF_DRIVE" && (
                    <div className="rounded-xl border border-slate-200 p-4">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                        <input
                          type="checkbox"
                          checked={form.localTransportNeeded}
                          onChange={(e) =>
                            set({
                              localTransportNeeded: e.target.checked,
                              localTransportCost: e.target.checked ? (form.localTransportCost || 800) : 0,
                            })
                          }
                          className="accent-primary"
                        />
                        Add local cab (hotel to/from venue) via platform
                      </label>
                      {form.localTransportNeeded && (
                        <input
                          type="number"
                          min={0}
                          step={100}
                          value={form.localTransportCost}
                          onChange={(e) => set({ localTransportCost: Math.max(0, Number(e.target.value || 0)) })}
                          className="mt-3 w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] text-slate-700"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}

        {/* â”€â”€ Step 3: Ritual Variation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {step === 3 && (
          <RitualVariationSelection
            selectedVariation={form.ritualVariation}
            onSelect={(variation) => set({ ritualVariation: variation })}
          />
        )}

        {/* â”€â”€ Step 4: Preferences â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f49d25]">tune</span>
              Preferences
            </h2>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Puja Samagri Path (Choose One)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {[
                  {
                    value: "PANDIT_PACKAGE" as SamagriOption,
                    label: "Pandit's Fixed Package",
                    icon: "inventory_2",
                    badge: "Fixed Package",
                    badgeClass: "bg-amber-100 text-amber-700",
                    desc: "Pre-defined item list and fixed non-negotiable package cost.",
                  },
                  {
                    value: "PLATFORM_CUSTOM" as SamagriOption,
                    label: "Platform Custom List",
                    icon: "shopping_cart",
                    badge: "Custom List",
                    badgeClass: "bg-blue-100 text-blue-700",
                    desc: "Build your own item list with platform market pricing.",
                  },
                ].map((opt) => {
                  const active = form.samagri === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        set({ samagri: opt.value });
                        if (
                          samagriItem &&
                          ((opt.value === "PANDIT_PACKAGE" && samagriItem.type !== "package") ||
                            (opt.value === "PLATFORM_CUSTOM" && samagriItem.type !== "custom"))
                        ) {
                          setSamagriItem(null);
                        }
                      }}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${active ? "border-[#f49d25] bg-[#f49d25]/5" : "border-slate-100 hover:border-slate-200"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`material-symbols-outlined text-xl ${active ? "text-[#f49d25]" : "text-slate-400"}`}>{opt.icon}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${opt.badgeClass}`}>{opt.badge}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 mt-2">{opt.label}</p>
                      <p className="text-xs text-slate-400 mt-1">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                {samagriItem && (
                  ((form.samagri === "PANDIT_PACKAGE" && samagriItem.type === "package") ||
                    (form.samagri === "PLATFORM_CUSTOM" && samagriItem.type === "custom"))
                ) ? (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800">
                          {samagriItem.type === "package"
                            ? `${samagriItem.packageName || "Fixed"} Package`
                            : "Custom Item List"}
                        </span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">
                          Selected
                        </span>
                      </div>
                      <div className="text-sm text-slate-600">
                        Total: <span className="font-bold">{fmt(samagriItem.totalCost)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSamagriModal(true)}
                      className="text-sm text-[#f49d25] font-semibold hover:underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-slate-500 mb-3">
                      {form.samagri === "PANDIT_PACKAGE"
                        ? "Select a fixed package from Pandit Ji."
                        : "Build your custom samagri list."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowSamagriModal(true)}
                      className="px-4 py-2 bg-[#f49d25] text-white text-sm font-semibold rounded-lg hover:bg-[#e08c14] transition-colors"
                    >
                      {form.samagri === "PANDIT_PACKAGE" ? "Select Fixed Package" : "Build Custom List"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Special Instructions (optional)</label>
              <textarea
                value={form.specialInstructions}
                onChange={(e) => set({ specialInstructions: e.target.value })}
                placeholder="Any special requirements, parking instructions, or notes for Pandit Jiâ€¦"
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] text-slate-700 resize-none placeholder-slate-400"
              />
              <p className="text-xs text-slate-400 mt-1">{form.specialInstructions.length} / 500</p>
            </div>
          </div>
        )}

        {/* â”€â”€ Step 5: Review & Pay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                      {form.eventTime && ` Â· ${form.eventTime}`}
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
                      <span className="font-medium text-slate-900">{fmt(effectiveTravelCost)}</span>
                    </div>
                    {form.localTransportNeeded && localTransportCost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Local cab (hotel to/from venue)</span>
                        <span className="font-medium text-slate-900">{fmt(localTransportCost)}</span>
                      </div>
                    )}
                    {foodAllowance > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Food Allowance ({foodAllowanceDays} day{foodAllowanceDays > 1 ? "s" : ""})</span>
                        <span className="font-medium text-slate-900">{fmt(foodAllowance)}</span>
                      </div>
                    )}
                    {accommodationCost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Accommodation (Platform Booked)</span>
                        <span className="font-medium text-slate-900">{fmt(accommodationCost)}</span>
                      </div>
                    )}
                  </div>

                  {/* Platform fees + GST */}
                  <div className="flex justify-between items-start py-2">
                    <div>
                      <p className="text-slate-900 font-semibold">Platform Service Fee (15% of Dakshina)</p>
                    </div>
                    <span className="font-semibold">{fmt(platformFee)}</span>
                  </div>
                  {travelServiceFee > 0 && (
                    <div className="flex justify-between items-start py-2">
                      <p className="text-slate-900 font-semibold">Travel Service Fee (5% of Travel)</p>
                      <span className="font-semibold">{fmt(travelServiceFee)}</span>
                    </div>
                  )}
                  {samagriServiceFee > 0 && (
                    <div className="flex justify-between items-start py-2">
                      <p className="text-slate-900 font-semibold">Samagri Service Fee (10% of Samagri)</p>
                      <span className="font-semibold">{fmt(samagriServiceFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-start py-2">
                    <div>
                      <p className="text-slate-900 font-semibold">GST (18% on platform fees)</p>
                      <p className="text-slate-500 text-xs">Applied only on platform fees</p>
                    </div>
                    <span className="font-semibold">{fmt(gst)}</span>
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
                        <p className="text-sm font-bold text-slate-900">Backup Guarantee</p>
                        <span className="text-[10px] bg-primary text-white px-1 rounded">SAFE</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Guaranteed qualified replacement within 4 hours</p>
                      <p className="text-xs font-bold text-primary mt-1">+ â‚¹9,999</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={addons.backup}
                      onChange={(e) => setAddons(prev => ({ ...prev, backup: e.target.checked }))}
                      className="w-5 h-5 accent-primary rounded cursor-pointer"
                    />
                  </div>

                  {/* Muhurat confirmation session */}
                  <div className={`p-3 border rounded-lg ${muhuratConsultation ? "border-primary bg-primary/5" : "border-slate-200"}`}>
                    <p className="text-sm font-bold text-slate-900">Muhurat Confirmation Session</p>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Validate selected muhurat with a Jyotishi before payment.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setMuhuratConsultation(false)}
                        className={`text-xs font-semibold rounded-md px-2 py-2 border ${!muhuratConsultation ? "border-primary text-primary bg-primary/5" : "border-slate-200 text-slate-600"}`}
                      >
                        Confirm & Proceed
                      </button>
                      <button
                        type="button"
                        onClick={() => setMuhuratConsultation(true)}
                        className={`text-xs font-semibold rounded-md px-2 py-2 border ${muhuratConsultation ? "border-primary text-primary bg-primary/5" : "border-slate-200 text-slate-600"}`}
                      >
                        Consult Expert Â· â‚¹499
                      </button>
                    </div>
                  </div>

                  {/* Nirmalya Visarjan */}
                  <div className={`p-3 border rounded-lg flex items-center justify-between gap-3 ${addons.visarjan ? "border-primary bg-primary/5" : "border-slate-200"}`}>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">Nirmalya Visarjan</p>
                      <p className="text-[11px] text-slate-500">Eco-friendly waste management</p>
                      <p className="text-xs font-bold text-primary mt-1">+ â‚¹500</p>
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
                    <span>Subtotal (Dakshina + Travel + Samagri + Food + Stay)</span>
                    <span>{fmt(baseSubtotal)}</span>
                  </div>
                  {addonCost > 0 && (
                    <div className="flex justify-between items-center text-slate-500 text-sm">
                      <span>Add-ons & Consultation</span>
                      <span>{fmt(addonCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-slate-500 text-sm">
                    <span>Subtotal After Add-ons</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 text-sm">
                    <span>Platform Fees</span>
                    <span>{fmt(totalPlatformFees)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 text-sm">
                    <span>GST (18% on platform fees)</span>
                    <span>{fmt(gst)}</span>
                  </div>
                  {/* Coupon Placeholder */}
                  {/* <div className="flex justify-between items-center text-primary text-sm font-bold bg-primary/5 p-2 rounded">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">local_offer</span> PANDIT10</span>
                    <span>-â‚¹0</span>
                  </div> */}

                  <div className="h-px bg-slate-100 my-2"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-xl font-black text-slate-900">Grand Total</span>
                    <span className="text-2xl font-black text-primary">{fmt(grandTotal)}</span>
                  </div>
                  <p className="text-[10px] text-center text-slate-500">
                    Advance policy: {grandTotal > 5000 ? `${fmt(payableNow)} now, ${fmt(payableLater)} after puja completion.` : "Full amount payable now."}
                  </p>
                </div>

                {!paymentReady ? (
                  <button
                    onClick={handleCreateOrder}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 flex items-center justify-center gap-2 text-lg transition-all group disabled:opacity-70"
                  >
                    {loading ? "Processing..." : (
                      <>
                        {grandTotal > 5000 ? `Pay 50% Advance (${fmt(payableNow)})` : "Proceed to Payment"}
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="p-4 bg-slate-50">
                    <RazorpayCheckout
                      orderId={form.orderId}
                      amount={payableNow * 100}
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

        {/* â”€â”€ Navigation Buttons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
              set({ samagri: selection.type === "package" ? "PANDIT_PACKAGE" : "PLATFORM_CUSTOM" });
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


