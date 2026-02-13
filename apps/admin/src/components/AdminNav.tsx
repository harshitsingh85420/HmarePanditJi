"use client";

import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", icon: "dashboard", label: "Dashboard" },
  { href: "/verification", icon: "verified_user", label: "Verification" },
  { href: "/bookings", icon: "event_note", label: "Bookings" },
  { href: "/pandits", icon: "groups", label: "Pandits" },
  { href: "/customers", icon: "people", label: "Customers" },
  { href: "/operations", icon: "local_shipping", label: "Operations" },
  { href: "/travel-queue", icon: "flight", label: "Travel" },
  { href: "/payouts", icon: "payments", label: "Payouts" },
  { href: "/settings", icon: "settings", label: "Settings" },
] as const;

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex items-center gap-1" aria-label="Admin navigation">
      {navLinks.map((link) => {
        const active = isActive(link.href);
        return (
          <a
            key={link.href}
            href={link.href}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-primary/10 text-primary"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span
              className="material-symbols-outlined text-base leading-none"
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {link.icon}
            </span>
            <span className="hidden lg:inline">{link.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
