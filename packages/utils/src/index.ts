// ============================================
// HmarePanditJi — Shared Utilities
// ============================================

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "\u2026";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) return /^[6-9]\d{9}$/.test(cleaned);
  if (cleaned.length === 12) return /^91[6-9]\d{9}$/.test(cleaned);
  return false;
}

export function isValidPincode(pincode: string): boolean {
  return /^[1-9]\d{5}$/.test(pincode);
}

export function titleCase(text: string): string {
  return text.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getApiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  return `${baseUrl}${path}`;
}

/** Alias for formatPrice — matches the spec naming convention */
export const formatCurrency = formatPrice;

/**
 * Calculate travel cost based on distance and travel mode.
 * Rates are approximate Delhi-NCR market rates.
 */
export function calculateTravelCost(
  distanceKm: number,
  mode: "auto" | "train" | "bus" | "cab" = "cab",
): number {
  const rates: Record<string, number> = {
    auto: 12,
    bus: 2,
    train: 1.5,
    cab: 15,
  };
  const ratePerKm = rates[mode] ?? rates.cab;
  return Math.round(distanceKm * ratePerKm);
}
