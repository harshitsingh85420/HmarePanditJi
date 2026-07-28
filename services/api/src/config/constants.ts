export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;

export const PORTS = {
  API: 3001,
  WEB: 3000,
  PANDIT: 3002,
  ADMIN: 3003,
} as const;

export const JWT = {
  EXPIRY: "7d",
  REFRESH_EXPIRY: "30d",
  ALGORITHM: "HS256",
} as const;

export const OTP = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
  RESEND_COOLDOWN_SECONDS: 60,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const RATE_LIMIT = {
  GENERAL_WINDOW_MS: 60 * 1000,
  GENERAL_MAX: 100,
  OTP_WINDOW_MS: 60 * 1000,
  OTP_MAX: 5,
  AUTH_WINDOW_MS: 15 * 60 * 1000,
  AUTH_MAX: 20,
} as const;

export const BOOKING = {
  NUMBER_PREFIX: "HPJ",
  PANDIT_ACCEPT_WINDOW_HOURS: 2,
  CANCELLATION_WINDOW_HOURS: 24,
} as const;

// Read from ALLOWED_ORIGINS env var (comma-separated) for production,
// fallback to localhost for development
export const ALLOWED_ORIGINS: string[] = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
  : [
    `http://localhost:${PORTS.WEB}`,
    `http://localhost:${PORTS.PANDIT}`,
    `http://localhost:${PORTS.ADMIN}`,
  ];

// ── OTP SMS (WebOTP contract, G4d) ─────────────────────────────────────────────
// The LAST line of the OTP SMS MUST be exactly '@<origin-host> #<OTP>'
// or the browser will never offer WebOTP auto-fill on the login screen.
// When the pandit app moves to a custom domain, ADD a second binding
// line for it (e.g. '@pandit.hmarepanditji.com #<OTP>') — WebOTP matches
// the line against the CALLING page's origin, so both can coexist during
// a migration. Human-readable text goes ABOVE the binding line(s).
export const WEBOTP_BOUND_ORIGIN = "hmarepanditji-pandit.vercel.app";
export const buildOtpSms = (otp: string): string =>
  `हमारे पंडित जी: आपका OTP ${otp} है। 5 मिनट तक मान्य। इसे किसी से साझा न करें।\n` +
  `@${WEBOTP_BOUND_ORIGIN} #${otp}`;

// ── Pricing constants ──────────────────────────────────────────────────────────
// THE SINGLE SOURCE for the platform fee rate. Founder decision 2026-07-21
// (CONFLICT_RULINGS #7): this fee is charged to the CUSTOMER on top of the
// dakshina; the pandit keeps 100% of the dakshina. calculateGrandTotal (the
// fee math) AND shishyaFacts.platformFeePercent (what शिष्य tells the pandit)
// both read THIS — never a second literal. The guard
// (commission-consistency.test) fails the build if either hardcodes a number,
// OR if the pandit payout is ever reduced by this fee.
//
// RULING B, OPS-CONFIGURABLE (Isj, 2026-07-28):
//   The pandit receives 100% of his dakshina. No deduction, ever.
//   The platform fee is charged to the CUSTOMER, on top of the dakshina.
//   Default rate 10%. Operations sets the rate.
//
// WHERE OPS SETS IT: the PLATFORM_FEE_PERCENT environment variable. Chosen
// over a settings table because a table needs a migration, an admin surface,
// a cache-invalidation story and a write-audit trail to be trustworthy with
// money — four things to build and get right for a pilot with one operator.
// An env var changes on the host and takes effect on restart, with NO code
// deploy, which is the requirement. If ops ever needs per-pandit rates this
// becomes a table; the snapshot below means that change is additive.
const DEFAULT_PLATFORM_FEE_PERCENT = 10;

function resolvePlatformFeePercent(): number {
  const raw = (process.env.PLATFORM_FEE_PERCENT ?? "").trim();
  if (raw === "") return DEFAULT_PLATFORM_FEE_PERCENT;
  const n = Number(raw);
  // A malformed rate must never silently become 0% (platform earns nothing) or
  // an absurd number (customer overcharged). Refuse it and keep the default.
  if (!Number.isFinite(n) || n < 0 || n > 100) {
    // eslint-disable-next-line no-console
    console.error(
      `[config] PLATFORM_FEE_PERCENT="${raw}" is not a percentage between 0 and 100 — using the ${DEFAULT_PLATFORM_FEE_PERCENT}% default.`,
    );
    return DEFAULT_PLATFORM_FEE_PERCENT;
  }
  return n;
}

export const PLATFORM_FEE_PERCENT = resolvePlatformFeePercent();
export const TRAVEL_SERVICE_FEE_PERCENT = 5;
export const GST_PERCENT = 18;
export const FOOD_ALLOWANCE_PER_DAY = 1000; // ₹1,000 per day
export const SELF_DRIVE_RATE_PER_KM = 12;   // ₹12 per km

// ── Domain constants ───────────────────────────────────────────────────────────
export const SUPPORTED_PUJA_TYPES = [
  "Vivah",
  "Griha Pravesh",
  "Satyanarayan Katha",
  "Mundan",
  "Annaprashan",
  "Naamkaran",
  "Havan",
  "Ganesh Puja",
  "Lakshmi Puja",
  "Vastu Shanti",
  "Shradh",
  "Pitra Puja",
  "Rudrabhishek",
  "Sunderkand Path",
] as const;

export const SUPPORTED_LANGUAGES = [
  "Hindi",
  "English",
  "Sanskrit",
  "Bhojpuri",
  "Maithili",
  "Awadhi",
] as const;
