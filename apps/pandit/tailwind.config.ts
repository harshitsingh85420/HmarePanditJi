import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Existing app colors ──────────────────────────────────────
        primary: "#F09942",
        "primary-dk": "#DC6803",
        "primary-lt": "#FEF3C7",
        "primary-light": "#fde9c3",
        "primary-dark": "#d97706",
        secondary: "#2d1b00",
        accent: "#dc6803",
        danger: "#EF4444",
        success: "#15803D",
        "success-lt": "#DCFCE7",
        error: "#DC2626",
        "error-lt": "#FEE2E2",
        info: "#3B82F6",
        warning: "#F59E0B",
        "background-light": "#f8f7f6",
        "background-dark": "#221910",

        // ── Part 0 Vedic Design System ──────────────────────────────
        "vedic-cream": "#FFFBF5",    // ALL screen backgrounds
        "vedic-brown": "#2D1B00",    // Primary text
        "vedic-brown-2": "#6B4F2A",  // Secondary text
        "vedic-gold": "#9B7B52",     // Muted / tertiary text
        "vedic-border": "#F0E6D3",   // Dividers, inactive borders
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        hindi: ["Inter", "sans-serif"],
        hind: ["Hind", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        btn: "12px",
        card: "16px",
        pill: "9999px",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
      boxShadow: {
        card: "0 2px 16px rgba(0,0,0,0.08)",
        "card-hover": "0 4px 24px rgba(0,0,0,0.12)",
        cta: "0 4px 12px rgba(240,153,66,0.35)",
        "cta-dk": "0 6px 20px rgba(220,104,3,0.45)",
      },
      keyframes: {
        // ── Existing ─────────────────────────────────────────────
        "pulse-amber": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(240, 153, 66, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(240, 153, 66, 0)" },
        },
        // ── Part 0 animations ─────────────────────────────────────
        "voice-bar": {
          "0%, 100%": { height: "8px" },
          "50%": { height: "24px" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "scale-spring": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "60%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.6" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
        "draw-circle": {
          to: { strokeDashoffset: "0" },
        },
        "draw-check": {
          to: { strokeDashoffset: "0" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(-20px) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "100%": { transform: "translateY(200px) rotate(360deg)", opacity: "0" },
        },
        "progress-fill": {
          "0%": { width: "0%" },
          "100%": { width: "70%" },
        },
        "pin-drop": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "gentle-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-amber": "pulse-amber 2s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        // Part 0
        "voice-bar": "voice-bar 1.2s ease-in-out infinite",
        "voice-bar-2": "voice-bar 1.2s ease-in-out 0.2s infinite",
        "voice-bar-3": "voice-bar 1.2s ease-in-out 0.4s infinite",
        "fade-up": "fade-up 0.5s ease-out forwards",
        "slide-up": "slide-up 0.35s cubic-bezier(0,0,0.2,1) forwards",
        "slide-in-right": "slide-in-right 0.25s cubic-bezier(0,0,0.2,1) forwards",
        "scale-spring": "scale-spring 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "draw-circle": "draw-circle 0.8s ease-out forwards",
        "draw-check": "draw-check 0.5s ease-out 0.8s forwards",
        "confetti-fall": "confetti-fall linear infinite",
        "progress-fill": "progress-fill 2.5s ease-out forwards",
        "pin-drop": "pin-drop 0.6s ease-out forwards",
        "gentle-float": "gentle-float 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
