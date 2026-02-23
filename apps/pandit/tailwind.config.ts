import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#f09942",
        "primary-light": "#fde9c3",
        "primary-dark": "#d97706",
        secondary: "#2d1b00",
        accent: "#dc6803",
        danger: "#EF4444",
        success: "#10B981",
        info: "#3B82F6",
        warning: "#F59E0B",
        "background-light": "#f8f7f6",
        "background-dark": "#221910",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        hindi: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        btn: "8px",
        card: "12px",
        pill: "24px",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
      keyframes: {
        "pulse-amber": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(240, 153, 66, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(240, 153, 66, 0)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-amber": "pulse-amber 2s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.6s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
