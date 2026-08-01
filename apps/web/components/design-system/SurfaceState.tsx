"use client";

// ─────────────────────────────────────────────────────────────
// SURFACE STATES — the C5 extension to the canon (Isj's ruling).
//
// Turn 4 mandates where states live: loading (results, profile, pay) ·
// empty / none-that-date (results) · signed-out ≠ no bookings (My
// Bookings) · payment failed · cancelled · offline (global toast).
// It never names an ERROR state for a fetching surface — its only
// failure mode is a global offline toast.
//
// THE CANON IS SILENT ON ERROR, AND SILENCE IS NOT A DESIGN. This is an
// EXTENSION, not a violation: it adds the missing state in the canon's
// own visual language and changes nothing the canon does specify.
//
// ERROR ≠ EMPTY. That conflation was deleted from production five times
// (muhurat, availability, pandit list, travel, samagri): each rendered a
// failed fetch as "nothing here", which tells the customer a fact about
// the WORLD when all that happened was the server went quiet. A global
// toast rebuilds it — the toast is transient and the surface underneath
// still says "no pandits available".
//
// The law is enforced by the TYPE, not by discipline:
//   · `error` REQUIRES onRetry — a failure the customer cannot retry is
//     a dead end, and every ERROR≠EMPTY finding began as one.
//   · `empty` FORBIDS onRetry — offering "try again" against a truthful
//     nothing is the same lie wearing the other face.
// A wrong call site does not render badly; it does not compile.
// ─────────────────────────────────────────────────────────────

import type { ReactNode } from "react";

type Common = {
  /** What this surface was fetching, for the copy: "pandits", "your bookings". */
  subject: string;
  className?: string;
};

export type SurfaceStateProps =
  | (Common & { kind: "loading"; onRetry?: never; action?: never })
  | (Common & { kind: "error"; onRetry: () => void; action?: never })
  | (Common & { kind: "empty"; onRetry?: never; action?: ReactNode; title?: string; body?: string })
  | (Common & { kind: "signed-out"; onRetry?: never; action: ReactNode });

const WRAP =
  "hpj-root flex flex-col items-center justify-center text-center px-6 py-10 gap-3";

/** The canon's own card: cream surface, hairline rule, 14px radius. */
const CARD =
  "w-full rounded-card border border-hairline bg-cream";

export function SurfaceState(props: SurfaceStateProps) {
  const { subject, className = "" } = props;

  if (props.kind === "loading") {
    return (
      <div className={`${CARD} ${WRAP} ${className}`} role="status" aria-live="polite">
        {/* Three bars, not a spinner: the canon's surfaces are lists and
            cards, so the wait should look like the thing that is coming. */}
        <div className="w-full flex flex-col gap-2.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-14 w-full rounded-panel bg-hairline-soft animate-pulse"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
        <p className="text-label text-muted">Loading {subject}…</p>
      </div>
    );
  }

  if (props.kind === "error") {
    // NEVER says "no <subject>". The server's silence is not a fact about
    // the world, and this copy must never let the two sound alike.
    return (
      <div className={`${CARD} ${WRAP} ${className}`} role="alert">
        <span className="material-symbols-outlined text-[28px] text-terracotta" aria-hidden="true">
          cloud_off
        </span>
        <p className="text-section font-semibold text-ink">
          We couldn&apos;t load {subject}
        </p>
        <p className="text-body text-muted">
          This is our side, not yours — nothing about your booking has changed.
        </p>
        <button
          type="button"
          onClick={props.onRetry}
          className="mt-1 min-h-cta w-full rounded-control bg-saffron px-5 text-body font-semibold text-white active:opacity-90"
        >
          Try again
        </button>
      </div>
    );
  }

  if (props.kind === "signed-out") {
    // "signed-out ≠ no bookings" — the canon names this one explicitly.
    return (
      <div className={`${CARD} ${WRAP} ${className}`}>
        <span className="material-symbols-outlined text-[28px] text-muted" aria-hidden="true">
          lock_open
        </span>
        <p className="text-section font-semibold text-ink">
          Sign in to see {subject}
        </p>
        <p className="text-body text-muted">
          You may already have some — we just can&apos;t tell yet.
        </p>
        <div className="mt-1 w-full">{props.action}</div>
      </div>
    );
  }

  // empty — a truthful nothing. No retry, by type.
  return (
    <div className={`${CARD} ${WRAP} ${className}`}>
      <span className="material-symbols-outlined text-[28px] text-muted" aria-hidden="true">
        search_off
      </span>
      <p className="text-section font-semibold text-ink">
        {props.title ?? `No ${subject} yet`}
      </p>
      {props.body ? <p className="text-body text-muted">{props.body}</p> : null}
      {props.action ? <div className="mt-1 w-full">{props.action}</div> : null}
    </div>
  );
}

export default SurfaceState;
