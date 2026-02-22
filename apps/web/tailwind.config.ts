import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/index.ts",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#f49d25",
        secondary: "#1a1a2e",
        accent: "#e8540a",
        success: "#22c55e",
        "background-light": "#f8f7f5",
        "background-dark": "#221a10",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        serif: ["Noto Serif", "serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        btn: "8px",
        card: "12px",
        pill: "24px",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
