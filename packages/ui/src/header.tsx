"use client";

import React, { useState } from "react";

export type AppType = "web" | "pandit" | "admin";

export interface NavLink {
  label: string;
  href: string;
  icon?: string;
}

const navLinks: Record<AppType, NavLink[]> = {
  web: [
    { label: "Find Pandits", href: "/pandits", icon: "search" },
    { label: "Rituals", href: "/rituals", icon: "auto_awesome" },
    { label: "My Bookings", href: "/bookings", icon: "calendar_month" },
  ],
  pandit: [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "Bookings", href: "/bookings", icon: "calendar_month" },
    { label: "Earnings", href: "/earnings", icon: "payments" },
    { label: "Profile", href: "/profile", icon: "person" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
    { label: "Pandits", href: "/admin/pandits", icon: "manage_accounts" },
    { label: "Bookings", href: "/admin/bookings", icon: "calendar_month" },
    { label: "Payments", href: "/admin/payments", icon: "payments" },
  ],
};

const primaryColors: Record<AppType, string> = {
  web: "text-amber-600",
  pandit: "text-orange-600",
  admin: "text-purple-600",
};

export interface HeaderProps {
  appType?: AppType;
  isAuthenticated?: boolean;
  userName?: string;
  avatarUrl?: string;
  currentPath?: string;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onNavClick?: (href: string) => void;
  /** Render link — for Next.js / React Router compatibility */
  LinkComponent?: React.ComponentType<{
    href: string;
    children: React.ReactNode;
    className?: string;
  }>;
}

export function Header({
  appType = "web",
  isAuthenticated = false,
  userName,
  currentPath = "",
  onLoginClick,
  onLogoutClick,
  onNavClick,
  LinkComponent,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = navLinks[appType];
  const titleColor = primaryColors[appType];

  function NavItem({ link }: { link: NavLink }) {
    const isActive = currentPath === link.href;
    const className = [
      "flex items-center gap-1.5 text-[22px] font-medium px-5 py-4 rounded-lg transition-colors",
      isActive
        ? "bg-primary/10 text-primary font-bold"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
    ].join(" ");

    if (LinkComponent) {
      return (
        <LinkComponent href={link.href} className={className}>
          {link.icon && (
            <span className="material-symbols-outlined text-[24px]">
              {link.icon}
            </span>
          )}
          {link.label}
        </LinkComponent>
      );
    }

    return (
      <button
        onClick={() => onNavClick?.(link.href)}
        className={className}
        aria-current={isActive ? "page" : undefined}
      >
        {link.icon && (
          <span className="material-symbols-outlined text-[24px]">
            {link.icon}
          </span>
        )}
        {link.label}
      </button>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        {/* Logo */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <span
            className={`material-symbols-outlined text-[32px] ${titleColor}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            temple_hindu
          </span>
          <span className="hidden text-[26px] font-bold text-slate-900 sm:block dark:text-slate-100">
            HmarePanditJi
          </span>
        </div>

        {/* Desktop nav */}
        <nav
          className="hidden flex-1 items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <NavItem key={link.href} link={link} />
          ))}
        </nav>

        {/* Auth area */}
        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden max-w-[120px] truncate text-[22px] font-medium text-slate-700 sm:block dark:text-slate-300">
                {userName}
              </span>
              <button
                onClick={onLogoutClick}
                className="flex min-h-[56px] items-center gap-1 rounded-lg px-3 py-2 text-[22px] font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
              >
                <span className="material-symbols-outlined text-[24px]">
                  logout
                </span>
                <span className="hidden sm:block">Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={onLoginClick}
              className="bg-primary hover:bg-primary/90 shadow-primary/20 min-h-[72px] rounded-2xl px-6 text-[26px] font-bold text-white shadow-lg transition-all"
            >
              लॉगिन करें
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            className="rounded-lg p-2 transition-colors hover:bg-slate-100 md:hidden dark:hover:bg-slate-800"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="flex flex-col gap-1 border-t border-slate-100 bg-white px-4 py-3 md:hidden dark:border-slate-800 dark:bg-slate-950">
          {links.map((link) => (
            <NavItem key={link.href} link={link} />
          ))}
        </div>
      )}
    </header>
  );
}
