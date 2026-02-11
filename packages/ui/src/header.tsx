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
  LinkComponent?: React.ComponentType<{ href: string; children: React.ReactNode; className?: string }>;
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
      "flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors",
      isActive
        ? "bg-primary/10 text-primary font-bold"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
    ].join(" ");

    if (LinkComponent) {
      return (
        <LinkComponent href={link.href} className={className}>
          {link.icon && (
            <span className="material-symbols-outlined text-base">{link.icon}</span>
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
          <span className="material-symbols-outlined text-base">{link.icon}</span>
        )}
        {link.label}
      </button>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`material-symbols-outlined text-2xl ${titleColor}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            temple_hindu
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100 hidden sm:block">
            HmarePanditJi
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1" aria-label="Main navigation">
          {links.map((link) => (
            <NavItem key={link.href} link={link} />
          ))}
        </nav>

        {/* Auth area */}
        <div className="flex items-center gap-2 ml-auto">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                {userName}
              </span>
              <button
                onClick={onLogoutClick}
                className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span className="hidden sm:block">Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={onLoginClick}
              className="h-9 px-4 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 transition-all"
            >
              Login / Register
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 flex flex-col gap-1">
          {links.map((link) => (
            <NavItem key={link.href} link={link} />
          ))}
        </div>
      )}
    </header>
  );
}
