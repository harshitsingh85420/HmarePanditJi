// ─────────────────────────────────────────────────────────────
// STEP 0 — MOTION PRIMITIVES (the design campaign's one motion source).
// framer-motion variants every screen inherits, so motion is consistent and
// A12-safe by construction:
//   • transform/opacity ONLY — never width/height/top/left (no layout thrash).
//   • prefers-reduced-motion → instant static fallbacks everywhere (use the
//     `useReduced()` helper + `still()` to collapse any variant to a no-op).
//   • durations/easings are tokens (DURATION/EASE) — screens reference these,
//     not ad-hoc numbers.
// Guard motion.test.ts fails the build if a primitive animates a layout prop.
// ─────────────────────────────────────────────────────────────
import type { Variants, Transition } from "framer-motion";
import { useReducedMotion } from "framer-motion";

/** Motion tokens (ms). Kept short for a budget Galaxy A12. */
export const DURATION = { fast: 0.18, base: 0.32, slow: 0.5, celebrate: 1.5 } as const;

export const EASE = {
  out: [0.16, 1, 0.3, 1] as const, // gentle decel
  spring: { type: "spring", stiffness: 420, damping: 30 } as Transition,
} as const;

/** True when the pandit's OS asks for reduced motion — collapse to static. */
export function useReduced(): boolean {
  return useReducedMotion() ?? false;
}

/** Collapse any variants to an instant no-op (for reduced-motion branches). */
export function still(v: Variants): Variants {
  const flat: Variants = {};
  for (const k of Object.keys(v)) flat[k] = { opacity: 1, transition: { duration: 0 } };
  return flat;
}

// ── Entrances (transform/opacity only) ────────────────────────────────────────
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE.out } },
};

export const cardSlideIn: Variants = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: EASE.spring },
};

/** A ✓ stamp landing — scale overshoot + fade, for approvals/completions. */
export const stampIn: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { ...EASE.spring, stiffness: 500, damping: 22 } },
};

// ── Loops (idle/ambient; pause under reduced-motion by swapping to `still`) ────
export const pulse: Variants = {
  show: { scale: [1, 1.06, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
};

/** Orb breathing when idle. */
export const breathe: Variants = {
  show: { scale: [1, 1.04, 1], opacity: [0.9, 1, 0.9], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
};

/** Diya flame flicker — subtle opacity+scale, never position. */
export const diyaFlicker: Variants = {
  show: { opacity: [0.85, 1, 0.9, 1], scale: [1, 1.03, 0.99, 1], transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" } },
};

/** Shimmer sweep (background-position only — cheap on A12). */
export const shimmer: Variants = {
  show: { backgroundPositionX: ["-150%", "150%"], transition: { duration: 2, repeat: Infinity, ease: "linear" } },
};

/** 1.5s celebration flourish for a completed step. */
export const celebration: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: [0.8, 1.08, 1], transition: { duration: 0.6, ease: EASE.out } },
};

/** Stagger children (lists of cards/chips). */
export const stagger = (gap = 0.06): Variants => ({
  show: { transition: { staggerChildren: gap } },
});
