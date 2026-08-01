import type { Config } from "tailwindcss";

// ─────────────────────────────────────────────────────────────
// ग्राहक ऐप · Customer — design tokens
// Source: Claude Design project a708fb60 · "ग्राहक ऐप · Customer.dc.html".
//
// 🔴 BATCH 1 — RE-SOURCED FROM TURN 4. This file previously read from the
// file's TURN 1 foundation panels, and turn 4 says of itself: "English-first
// rebuild … SUPERSEDES turn 3 where they conflict." A DESIGN FILE IS ALSO A
// STREAM; FIND ITS SUPERSESSION BOUNDARY BEFORE READING IT. Reading turn 1
// left the app carrying a superseded type scale (display 30 / title 24 /
// section 20 / body 15 / label 13 / micro 11.5 / money 26, tracking .09em)
// while components/design-system/tokens.css carried turn 4's — TWO
// CONFLICTING SCALES, and which one a component got depended on whether it
// reached for a tailwind class or a .hpj-* class.
//
// The scales are now ONE. Type and tap sizes below resolve to the CSS
// custom properties defined in tokens.css, so the C1 (18px body floor) and
// C2 (52px tap floor) rulings are a one-file change when Isj makes them.
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
          // turn 4 uses #F6EDE0 (x19) as the tint; #F2EBDD was a turn-1
          // value that appears nowhere in the canon.
          tint: "#F6EDE0",
          deep: "#EFE4D4",
          warm: "#FFF7EC", // x10 — warm tint panel
        },
        // तुलसी · Verified — THE ONE ACCENT, truth only. Never "success".
        tulsi: {
          DEFAULT: "#2E6B4E",
          tint: "#E7F0EA",
        },
        // Destructive — OUTLINED terracotta, never filled. Cancellation
        // should feel considered, not loud.
        terracotta: {
          DEFAULT: "#B0432E",
          rule: "#E0B9AE",
        },
        // The video surface.
        well: "#2A2018",
        // धूसर · Muted
        muted: "#6B5B48",
        hairline: "#E8DDCB",
        "hairline-soft": "#F0E7D8",
        // Placeholder GLYPHS only (avatar stand-ins) — never text. At
        // 1.85:1 on cream it cannot carry a word.
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
      // ONE SCALE. These resolve to the custom properties in
      // components/design-system/tokens.css — the C1 ruling (canon 14.5px
      // body vs the 18px floor) changes those variables and every tailwind
      // class here follows automatically. Do NOT re-inline px values.
      // Each carries the canon value as a FALLBACK. If tokens.css ever
      // fails to load, text renders at the canon size rather than losing
      // its size entirely — a stylesheet that goes missing is not a build
      // error, which is how the turn-1 scale survived unnoticed.
      fontSize: {
        display: ["var(--hpj-t-display, 26px)", { lineHeight: "1.2" }],
        title: ["var(--hpj-t-title, 20px)", { lineHeight: "1.25" }],
        section: ["var(--hpj-t-section, 17px)", { lineHeight: "1.3" }],
        body: ["var(--hpj-t-body, 14.5px)", { lineHeight: "1.5" }],
        "body-lg": ["var(--hpj-t-body-lg, 15.5px)", { lineHeight: "1.5" }],
        label: ["var(--hpj-t-label, 12.5px)", { lineHeight: "1.35" }],
        micro: ["var(--hpj-t-micro, 11px)", { lineHeight: "1.3" }],
        money: ["var(--hpj-t-money, 24px)", { lineHeight: "1.15" }],
      },
      letterSpacing: {
        // turn 4 sets micro tracking at .08em (turn 1 said .09em)
        micro: ".08em",
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
      // C2 lives in tokens.css too. Canon draws 46/50px; the §3 floor is
      // 52px and 52 appears ZERO times in turn 4 — shipped at the floor
      // until Isj ranks them, because flipping DOWN before the ruling
      // would be a regression applied on my own authority.
      minHeight: {
        tap: "var(--hpj-tap, 52px)",
        cta: "var(--hpj-tap, 52px)",
      },
    },
  },
  plugins: [],
};

export default config;
