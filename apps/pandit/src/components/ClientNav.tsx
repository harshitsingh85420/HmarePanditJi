"use client";

import { usePathname } from "next/navigation";

const desktopLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/bookings", label: "Bookings" },
  { href: "/requests", label: "Requests" },
  { href: "/earnings", label: "Earnings" },
  { href: "/travel", label: "Travel" },
  { href: "/profile", label: "Profile" },
] as const;

const mobileLinks = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/bookings", icon: "event_note", label: "Bookings" },
  { href: "/travel", icon: "route", label: "Travel" },
  { href: "/earnings", icon: "wallet", label: "Earnings" },
  { href: "/profile", icon: "person", label: "Profile" },
] as const;

export default function ClientNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ── Desktop Center Nav ───────────────────────────────────────── */}
      <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
        {desktopLinks.map((link) =>
          isActive(link.href) ? (
            <a
              key={link.href}
              href={link.href}
              className="flex flex-col items-center text-sm font-semibold text-primary border-b-2 border-primary pb-0.5 leading-tight"
            >
              {link.label}
            </a>
          ) : (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          )
        )}
      </nav>

      {/* ── Mobile Bottom Nav ────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200"
        aria-label="Bottom navigation"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex">
          {mobileLinks.map((tab) => {
            const active = isActive(tab.href);
            return (
              <a
                key={tab.href}
                href={tab.href}
                className={`flex-1 flex flex-col items-center justify-center min-h-[56px] gap-0.5 text-xs transition-colors ${
                  active ? "text-primary font-bold" : "text-slate-500"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px] leading-none"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {tab.icon}
                </span>
                <span className="text-[10px] leading-none">{tab.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
