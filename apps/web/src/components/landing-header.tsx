"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "How it Works", href: "/#how-it-works" },
  { label: "For Families", href: "/#families" },
  { label: "For Pandits", href: "/pandits/join" },
];

export default function LandingHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#f8f7f5]/80 dark:bg-[#221a10]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span
            className="material-symbols-outlined text-3xl text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            temple_hindu
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100 hidden sm:block">
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

        {/* Right: Login + hamburger */}
        <div className="flex items-center gap-2 ml-auto">
          <Link
            href="/login"
            className="h-10 px-5 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-lg shadow-lg shadow-primary/20 transition-all inline-flex items-center"
          >
            Login
          </Link>

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
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="mt-2 h-10 flex items-center justify-center text-sm font-bold bg-primary text-white rounded-lg shadow-lg shadow-primary/20"
            onClick={() => setOpen(false)}
          >
            Login / Register
          </Link>
        </div>
      )}
    </header>
  );
}
