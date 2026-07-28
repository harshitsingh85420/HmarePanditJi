"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../src/context/auth-context";

type NavLink = {
  href: string;
  label: string;
  external?: boolean;
};

// ─────────────────────────────────────────────────────────────
// अतिथि · GUEST MODE — the banner is RETIRED (design doc turn 2).
//
// It read "👋 Exploring as Guest - Login to book pandits and save favorites":
// a dismissible-and-nagging banner, in the old orange, stating what a guest
// CANNOT do. Turn 2's law is the opposite on every count —
//   "The paywall is at commitment, not at the door. So guest mode must never
//    read as a restriction — it reads as an invitation with nothing withheld.
//    Persistent, quiet, saffron-tinted — never a banner, never
//    dismissible-and-nagging. Says what he CAN do, not what he can't."
//
// Its replacement is <GuestStrip> in components/design/GuestMode.tsx, which
// sits with the search context and says "पूरा मंच देखिए · खाता बाद में".
// Leaving both shipped a screen that contradicted itself top to bottom.
//
// The `onSignIn` route is untouched — the ONE gate still lives at बुक करें.
// ─────────────────────────────────────────────────────────────
function GuestBanner({ onSignIn: _onSignIn }: { onSignIn: () => void }) {
  return null;
}

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, openLoginModal } = useAuth();

  const isGuest = !loading && !user;
  const userInitial = (user?.name || "U").charAt(0).toUpperCase();
  const panditAppUrl = process.env.NEXT_PUBLIC_PANDIT_URL || "http://localhost:3002";

  const navLinks: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Find Pandits" },
    { href: "/muhurat", label: "Muhurat Explorer" },
    { href: panditAppUrl, label: "For Pandits", external: true },
  ];

  const replayTutorial = () => {
    if (pathname !== "/") {
      window.location.href = "/?tutorial=1";
      return;
    }
    window.dispatchEvent(new Event("hpj-open-tutorial"));
  };

  return (
    <>
      {isGuest && <GuestBanner onSignIn={openLoginModal} />}
      <header className="sticky top-0 z-40 w-full border-b border-amber-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-extrabold text-gray-900 tracking-tight hover:text-primary transition-colors">
              HmarePanditJi
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold transition-colors hover:text-primary text-gray-700"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-gray-700"
                    }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={replayTutorial}
              className="hidden sm:inline-flex w-9 h-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
              title="Replay tutorial"
              aria-label="Replay tutorial"
            >
              ?
            </button>

            {isGuest ? (
              <>
                <span className="hidden md:inline-flex items-center gap-1 px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold">
                  <span className="material-symbols-outlined text-xs">explore</span>
                  Exploring as Guest
                </span>
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="hidden sm:inline-flex items-center px-4 py-2 border-2 border-primary text-primary text-sm font-bold rounded-btn hover:bg-primary hover:text-white transition-all"
                >
                  Sign In
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/bookings"
                  className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors hidden sm:block"
                >
                  My Bookings
                </Link>
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {userInitial}
                </div>
              </div>
            )}

            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="block text-base font-semibold py-2 transition-colors hover:text-primary text-gray-800"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-base font-semibold py-2 transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-gray-800"
                    }`}
                >
                  {link.label}
                </Link>
              )
            )}
            {isGuest && (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openLoginModal();
                }}
                className="block w-full text-center mt-4 bg-primary text-white py-2 rounded-btn font-bold"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </header>
    </>
  );
}