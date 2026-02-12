export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;

export const PORTS = {
  API: 4000,
  WEB: 3000,
  PANDIT: 3001,
  ADMIN: 3002,
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

export const ALLOWED_ORIGINS = [
  `http://localhost:${PORTS.WEB}`,
  `http://localhost:${PORTS.PANDIT}`,
  `http://localhost:${PORTS.ADMIN}`,
];

// ── Pricing constants ──────────────────────────────────────────────────────────
export const PLATFORM_FEE_PERCENT = 15;
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
