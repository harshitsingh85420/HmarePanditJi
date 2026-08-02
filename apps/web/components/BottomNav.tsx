"use client";

// ─────────────────────────────────────────────────────────────
// BOTTOM NAV — Track 1, batch 2d, the second half.
//
// The canon, verbatim: "Bottom nav, 3 tabs: Home · My Bookings · Help. Bottom
// not top — 360-wide thumbs; three because that is all that truthfully exists."
//
// THE COUNT IS THE ARGUMENT. Three is not a layout preference — it is the
// canon refusing to put a tab on a destination the platform does not have.
// Help was the missing third, which is why Ruling 1 ordered it built FIRST:
// "a navigation tab is a promise the destination keeps."
//
// Every destination here was confirmed to resolve before this file shipped:
//   /                    Home
//   /dashboard/bookings  My Bookings — renders an in-place locked state for a
//                        guest (a /login link, NOT a redirect), so the tab is
//                        honest whether or not he is signed in
//   /help                built in this same batch
//
// DO NOT copy packages/ui/src/header.tsx's link list: its /pandits, /rituals
// and /bookings do not exist. A ghost link is priced-but-undelivered in
// navigation form — the F-J4-15 finding, in a different component.
//
// md:hidden BY DESIGN. This is the 360-wide thumb bar; the desktop viewport
// keeps the header's own nav. The canon's reason for bottom-not-top is reach,
// which stops mattering with a mouse.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/dashboard/bookings", label: "Bookings", icon: "list_alt" },
  { href: "/help", label: "Help", icon: "help" },
] as const;

export default function BottomNav() {
  const pathname = usePathname() ?? "/";

  // Explicit per-tab matching, not a shared `startsWith`. "/" prefixes every
  // route in the app, so a generic rule would light Home permanently.
  // /dashboard is a bare redirect() to /dashboard/bookings, so it belongs to
  // the Bookings tab rather than to a fourth tab pointing at the same place.
  const active = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    if (href === "/dashboard/bookings") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/bookings");
    }
    return pathname === href;
  };

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-hairline bg-cream pb-safe-nav"
    >
      {TABS.map((t) => {
        const on = active(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={on ? "page" : undefined}
            // min-h-cta, never a px literal — it resolves --hpj-tap, so the
            // 46-vs-52 conflict (C2) stays resolvable in ONE place when Isj
            // rules it, instead of being re-litigated in every component.
            className={`flex min-h-cta flex-1 flex-col items-center justify-center gap-1 py-2 ${
              on ? "text-saffron" : "text-muted"
            }`}
          >
            <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
              {t.icon}
            </span>
            <span className="text-micro tracking-micro font-semibold uppercase">
              {t.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
