import type { Config } from "tailwindcss";

// ─────────────────────────────────────────────────────────────
// ग्राहक ऐप · Customer — design tokens
// Source: Claude Design project a708fb60 · "ग्राहक ऐप · Customer.dc.html",
// turn 1 foundation panels (रंग · अक्षर · दो सत्यापन · पैसा · घटक · लय).
//
// The old palette (#f49d25 orange, #e8540a accent, #22c55e success) is gone.
// It used green as a generic "success" colour — exactly what the new system
// forbids: green appears ONLY where something is genuinely verified, so a
// tick always means the same thing.
// ─────────────────────────────────────────────────────────────

const config: Config = {
  // `relative: true` pins these globs to THIS file's directory instead of the
  // build's working directory. Without it a build launched from the monorepo
  // root matches no files and ships the app with almost no utility CSS —
  // silently, because missing CSS is not a build error. (Same cure as
  // apps/pandit and apps/admin; see postcss.config.js.)
  content: {
    relative: true,
    files: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
      "./context/**/*.{js,ts,jsx,tsx,mdx}",
      "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
      "../../packages/ui/index.ts",
    ],
  },
  theme: {
    extend: {
      colors: {
        // केसर · Saffron-brown — brand, actions, links
        saffron: {
          DEFAULT: "#904D00",
          deep: "#6E3A00",
          tint: "#F6EDE0",
          hair: "#DBC3A4",
        },
        // मसि · Ink — headings, primary text
        ink: "#241A12",
        // चंदन · Cream — app canvas / card white
        cream: {
          DEFAULT: "#FBF6EE",
          canvas: "#EFE7DA",
          tint: "#F2EBDD",
          deep: "#EFE4D4",
        },
        // तुलसी · Verified — THE ONE ACCENT, truth only. Never "success".
        tulsi: {
          DEFAULT: "#2E6B4E",
          tint: "#E7F0EA",
        },
        // धूसर · Muted
        muted: "#6B5B48",
        hairline: "#E8DDCB",
        "hairline-soft": "#F0E7D8",
        placeholder: "#B9A88F",

        // Legacy aliases so un-migrated routes still compile while the re-skin
        // rolls out; they now resolve to the new system, not the old orange.
        // Remove once every route is migrated.
        primary: "#904D00",
        secondary: "#241A12",
        accent: "#904D00",
        "background-light": "#FBF6EE",
        "background-dark": "#241A12",
      },
      fontFamily: {
        // Sacred nouns get the serif; the interface speaks in the sans.
        devanagari: ["'Noto Serif Devanagari'", "serif"],
        sans: ["'Hanken Grotesk'", "system-ui", "sans-serif"],
        display: ["'Hanken Grotesk'", "system-ui", "sans-serif"],
        serif: ["'Noto Serif Devanagari'", "serif"],
      },
      fontSize: {
        display: ["30px", { lineHeight: "1.18" }],
        title: ["24px", { lineHeight: "1.2" }],
        section: ["20px", { lineHeight: "1.25" }],
        body: ["15px", { lineHeight: "1.55" }],
        "body-lg": ["17px", { lineHeight: "1.55" }],
        label: ["13px", { lineHeight: "1.4" }],
        micro: ["11.5px", { lineHeight: "1.35" }],
        money: ["26px", { lineHeight: "1" }],
      },
      letterSpacing: {
        micro: ".09em",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        btn: "8px",
        chip: "8px",
        card: "12px",
        panel: "14px",
        pill: "999px",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        gutter: "16px",
        thumb: "220px",
      },
      minHeight: {
        tap: "48px",
        cta: "52px",
      },
    },
  },
  plugins: [],
};

export default config;
