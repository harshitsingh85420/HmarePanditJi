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
