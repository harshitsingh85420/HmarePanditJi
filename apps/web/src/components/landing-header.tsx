"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { CartIcon } from "./cart/CartIcon";
import { VoiceSearchModal } from "./voice-search-modal";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Search Pandits", href: "/search" },
  { label: "Muhurat Calendar", href: "/muhurat" },
];

const PANDIT_PORTAL_URL = process.env.NEXT_PUBLIC_PANDIT_URL || "http://localhost:3001";

// ── User Menu / Guest Pill ───────────────────────────────────────────────────

function UserMenu() {
  const { user, logout, openLoginModal } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* ── Guest state ── */
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        {/* Guest pill badge — desktop only */}
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full">
          <span className="material-symbols-outlined text-xs">explore</span>
          Exploring as Guest
        </span>
        <button
          onClick={openLoginModal}
          className="h-9 px-4 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-lg shadow-lg shadow-primary/20 transition-all inline-flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">login</span>
          Login
        </button>
      </div>
    );
  }

  /* ── Authenticated state ── */
  const initials = user.fullName
    ? user.fullName
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
    : user.phone.slice(-2);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center gap-2 h-10 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="User menu"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.fullName ?? "User"}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <span className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {initials}
          </span>
        )}
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block max-w-[120px] truncate">
          {user.fullName ?? user.phone}
        </span>
        <span className="material-symbols-outlined text-sm text-slate-400">
          expand_more
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {user.fullName ?? "User"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{user.phone}</p>
          </div>

          <Link
            href="/bookings"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setOpen(false)}
          >
            <span className="material-symbols-outlined text-base">calendar_month</span>
            My Bookings
          </Link>
          <Link
            href="/dashboard/favorites"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setOpen(false)}
          >
            <span className="material-symbols-outlined text-base">favorite</span>
            My Favorites
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setOpen(false)}
          >
            <span className="material-symbols-outlined text-base">person</span>
            My Profile
          </Link>

          <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
            <button
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Header ───────────────────────────────────────────────────────────────────

export default function LandingHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, openLoginModal } = useAuth();
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-[#221a10]/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span
              className="material-symbols-outlined text-3xl text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              temple_hindu
            </span>
            <span className="text-xl font-bold text-primary hidden sm:block">
              HmarePanditJi
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1" aria-label="Main navigation">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "text-sm font-medium px-3 py-2 rounded-lg transition-colors",
                  pathname === l.href
                    ? "text-primary bg-primary/10 font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {/* For Pandits button */}
            <a
              href={PANDIT_PORTAL_URL}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-md shadow-orange-500/30 transition-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="material-symbols-outlined text-base">work</span>
              For Pandits
            </a>

            {/* Mic Button */}
            <button
              onClick={() => setVoiceModalOpen(true)}
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Voice Search"
            >
              <span className="material-symbols-outlined text-xl">mic</span>
            </button>

            {/* Cart Icon */}
            <CartIcon />

            <UserMenu />

            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
                {open ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#221a10] px-4 py-3 flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "text-sm font-medium px-3 py-2 rounded-lg transition-colors",
                  pathname === l.href
                    ? "text-primary bg-primary/10 font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800",
                ].join(" ")}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}

            {/* For Pandits link — mobile */}
            <a
              href={PANDIT_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-2 h-10 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-md text-sm font-semibold transition-all"
              onClick={() => setOpen(false)}
            >
              <span className="material-symbols-outlined text-base">work</span>
              For Pandits →
            </a>

            {!user && (
              <>
                <div className="mt-2 px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full">
                    <span className="material-symbols-outlined text-xs">explore</span>
                    Exploring as Guest
                  </span>
                </div>
                <button
                  className="mt-1 h-10 flex items-center justify-center gap-2 text-sm font-bold bg-primary text-white rounded-lg shadow-lg shadow-primary/20"
                  onClick={() => {
                    setOpen(false);
                    openLoginModal();
                  }}
                >
                  <span className="material-symbols-outlined text-base">login</span>
                  Login / Register
                </button>
              </>
            )}
          </div>
        )}
      </header>
      <VoiceSearchModal isOpen={voiceModalOpen} onClose={() => setVoiceModalOpen(false)} />
    </>
  );
}
