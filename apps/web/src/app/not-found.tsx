import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found — HmarePanditJi",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* 404 illustration */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
            <span
              className="material-symbols-outlined text-6xl text-amber-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              temple_hindu
            </span>
          </div>
          <div className="absolute top-0 right-1/2 translate-x-20 -translate-y-2 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-xl text-primary">search_off</span>
          </div>
        </div>

        <p className="text-7xl font-black text-primary/20 mb-2 leading-none">404</p>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
          Page not found
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base mb-1">
          यह पेज नहीं मिला — यह शायद हटा दिया गया है या URL गलत है।
        </p>
        <p className="text-slate-400 text-sm mb-8">
          This page doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            href="/"
            className="h-11 px-6 inline-flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-lg text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-base">home</span>
            होम पर जाएं — Go Home
          </Link>
          <Link
            href="/pandits"
            className="h-11 px-6 inline-flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-base">groups</span>
            Find Pandits
          </Link>
        </div>

        {/* Quick links */}
        <div className="text-sm text-slate-400">
          <p className="mb-3 font-semibold text-slate-500 dark:text-slate-400">Popular pages</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {[
              { href: "/search", label: "Search Pandits" },
              { href: "/about", label: "About Us" },
              { href: "/contact", label: "Contact" },
              { href: "/terms", label: "Terms" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-primary hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
