// ── Design Tokens for HmarePanditJi UI ──────────────────────────────────────

export const colors = {
  customer: {
    primary: "#f49d25",
    primaryLight: "#fef3e2",
    primaryDark: "#d4850f",
  },
  pandit: {
    primary: "#f09942",
    primaryLight: "#fef0e2",
    primaryDark: "#c77a2a",
  },
  admin: {
    primary: "#137fec",
    primaryLight: "#e8f2ff",
    primaryDark: "#0d5cb8",
  },
  neutral: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
} as const;

export const typography = {
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  sizes: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "30px",
    "4xl": "36px",
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const borderRadius = {
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  pill: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
} as const;

export type AppTheme = "customer" | "pandit" | "admin";
