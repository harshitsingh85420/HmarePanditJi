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

// ── OTP TTL — THE SINGLE SOURCE (hardening v2, 2026-07-23) ──────────────────
// One number, one place. The SMS promises `${OTP_TTL_MIN} मिनट`; the Redis TTL
// is OTP_TTL_SECONDS = OTP_TTL_MIN × 60; every send site passes the derived
// constant. (The old bug: one flow stored 600s while the SMS promised the TTL,
// and a dead Twilio notifyOtp promised DOUBLE it — otp-ttl.test.ts anywhere-
// scans services/api/src so a divergent OTP-minute value can never return,
// comments included.)
export const OTP_TTL_MIN = 5;
export const OTP_TTL_SECONDS = OTP_TTL_MIN * 60;

export const OTP = {
  LENGTH: 6,
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

// ── OTP SMS (WebOTP contract, hardening v2) ──────────────────────────────────
// ONE binding line per app: Chrome parses only the LAST '@origin #code' line,
// so two binding lines are useless — each app gets its OWN template bound to
// its OWN origin (env WEBOTP_ORIGIN_PANDIT / WEBOTP_ORIGIN_WEB, bare host,
// prod-validated at boot). Human-readable text goes ABOVE the binding line.
//
// ⚠ DLT-APPROVED TEXT — byte-exact. This exact string (with {#var#} in both
// OTP slots) is what Isj pastes into the MSG91/DLT portal. otp-template.test.ts
// pins buildOtpSms("{#var#}", "<ORIGIN>") to it — ANY copy change fails the
// build, because changing approved DLT text silently kills delivery until a
// fresh approval cycle. The TTL is interpolated from OTP_TTL_MIN (no bare
// digit), so the promise in the SMS and the Redis expiry can never diverge.
//
// REGISTER NOTE: the roman word "OTP" is deliberate here — an SMS template is
// carrier text, not app UI; the register/no-roman guards scope apps/pandit
// sources only (recorded exemption, see OTP_LAUNCH_NOTES.md).
export const buildOtpSms = (otp: string, boundOrigin: string): string =>
  `हमारे पंडित जी: आपका OTP ${otp} है। ${OTP_TTL_MIN} मिनट तक मान्य। इसे किसी से साझा न करें।\n` +
  `@${boundOrigin} #${otp}`;

// ── Pricing constants ──────────────────────────────────────────────────────────
// THE SINGLE SOURCE for the platform fee rate. Founder decision 2026-07-21
// (CONFLICT_RULINGS #7): this fee is charged to the CUSTOMER on top of the
// dakshina; the pandit keeps 100% of the dakshina. calculateGrandTotal (the
// fee math) AND shishyaFacts.platformFeePercent (what शिष्य tells the pandit)
// both read THIS — never a second literal. The guard
// (commission-consistency.test) fails the build if either hardcodes a number,
// OR if the pandit payout is ever reduced by this fee.
export const PLATFORM_FEE_PERCENT = 10;
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
