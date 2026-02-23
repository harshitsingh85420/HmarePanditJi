"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

const NAV_ITEMS = [
  { href: "/", label: "डैशबोर्ड", icon: "home" },
  { href: "/bookings", label: "बुकिंग", icon: "event_note" },
  { href: "/calendar", label: "कैलेंडर", icon: "date_range" },
  { href: "/earnings", label: "कमाई", icon: "payments" },
  { href: "/profile", label: "प्रोफाइल", icon: "person" },
];

function getToken() {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("hpj_pandit_token") ||
    localStorage.getItem("hpj_pandit_access_token") ||
    localStorage.getItem("token")
  );
}

interface PanditInfo {
  name: string;
  verificationStatus: string;
  isOnline: boolean;
}

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [isOnline, setIsOnline] = useState(true);
  const [panditInfo, setPanditInfo] = useState<PanditInfo>({
    name: "Pandit Ji",
    verificationStatus: "PENDING",
    isOnline: true,
  });
  const [toggling, setToggling] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem("hpj_pandit_info");
    if (cached) {
      try {
        const info = JSON.parse(cached) as PanditInfo;
        setPanditInfo(info);
        setIsOnline(info.isOnline ?? true);
      } catch {
        // ignore
      }
    }

    const token = getToken();
    if (!token) return;

    fetch(`${API_BASE}/pandits/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const pandit = data?.data?.pandit ?? data?.data ?? data;
        const name =
          pandit?.user?.name ??
          pandit?.displayName ??
          pandit?.name ??
          "Pandit Ji";
        const vs = pandit?.verificationStatus ?? "PENDING";
        const online = pandit?.isOnline ?? true;
        const info: PanditInfo = { name, verificationStatus: vs, isOnline: online };
        setPanditInfo(info);
        setIsOnline(online);
        localStorage.setItem("hpj_pandit_info", JSON.stringify(info));
      })
      .catch(() => { });
  }, []);

  const toggleOnline = useCallback(async () => {
    if (toggling) return;
    setToggling(true);
    const newVal = !isOnline;
    setIsOnline(newVal);
    const token = getToken();
    if (token) {
      await fetch(`${API_BASE}/pandits/online-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isOnline: newVal }),
      }).catch(() => { });
    }
    const info: PanditInfo = { ...panditInfo, isOnline: newVal };
    setPanditInfo(info);
    localStorage.setItem("hpj_pandit_info", JSON.stringify(info));
    setToggling(false);
  }, [isOnline, toggling, panditInfo]);

  const handleLogout = () => {
    ["hpj_pandit_token", "hpj_pandit_access_token", "token", "hpj_pandit_info", "hpj_onboarding_state"].forEach((k) =>
      localStorage.removeItem(k)
    );
    window.location.href = "http://localhost:3000/login";
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href) ?? false;
  };

  const initial = panditInfo.name.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── DESKTOP SIDEBAR ──────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 bg-[#2D1B00] text-white">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-full bg-[#f09942] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2l2.929 6.472L22 9.549l-5 4.951 1.18 6.999L12 18.272l-6.18 3.227L7 15.5 2 10.549l7.071-1.077L12 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold leading-none">HmarePanditJi</p>
            <p className="text-xs text-white/40 mt-0.5">Pandit Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${active
                    ? "bg-[#f09942] text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <span
                  className="material-symbols-outlined text-xl leading-none"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-4 py-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#f09942] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{panditInfo.name}</p>
              <span
                className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mt-0.5 ${panditInfo.verificationStatus === "VERIFIED"
                    ? "bg-green-700/40 text-green-300"
                    : "bg-amber-700/40 text-amber-300"
                  }`}
              >
                {panditInfo.verificationStatus === "VERIFIED" ? "✓ Verified" : "Verification Pending"}
              </span>
            </div>
          </div>
          <a
            href="tel:+919999999999"
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">support_agent</span>
            📞 सहायता
          </a>
        </div>
      </aside>

      {/* ── MAIN AREA ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* TOP HEADER */}
        <header className="flex-shrink-0 bg-white border-b border-gray-200 z-30">
          <div className="flex items-center justify-between h-14 px-4 md:px-5">
            {/* Mobile: Logo */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-7 h-7 rounded-full bg-[#f09942] flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2l2.929 6.472L22 9.549l-5 4.951 1.18 6.999L12 18.272l-6.18 3.227L7 15.5 2 10.549l7.071-1.077L12 2z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-900">HmarePanditJi</span>
            </div>

            {/* Desktop: empty spacer */}
            <div className="hidden md:block" />

            {/* Right: GO ONLINE + notification + avatar */}
            <div className="flex items-center gap-2">
              {/* Online/Offline toggle */}
              <button
                onClick={toggleOnline}
                disabled={toggling}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all min-h-[36px] ${isOnline
                    ? "bg-green-50 border-green-500 text-green-700 hover:bg-green-100"
                    : "bg-red-50 border-red-400 text-red-600 hover:bg-red-100"
                  }`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-400"
                    }`}
                />
                <span className="hidden sm:inline">
                  {isOnline ? "GO OFFLINE" : "GO ONLINE"}
                </span>
                <span className="sm:hidden">{isOnline ? "Online" : "Offline"}</span>
              </button>

              {/* Notification bell */}
              <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" title="Notifications">
                <span className="material-symbols-outlined text-xl text-gray-600">notifications</span>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              </button>

              {/* Tutorial replay ? button (Prompt 8 Section 4) */}
              <button
                onClick={() => {
                  const event = new CustomEvent('replay-tutorial');
                  window.dispatchEvent(event);
                }}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-amber-600"
                title="Tutorial / Help"
              >
                <span className="material-symbols-outlined text-xl">help</span>
              </button>

              {/* Avatar with dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="w-9 h-9 rounded-full bg-[#f09942] flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                >
                  {initial}
                </button>
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <span className="material-symbols-outlined text-sm">person</span>
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-5">{children}</div>
        </main>

        {/* MOBILE BOTTOM TAB BAR */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex z-40"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-[#f09942] rounded-b-full" />
                )}
                <span
                  className={`material-symbols-outlined text-xl leading-none ${active ? "text-[#f09942]" : "text-gray-400"
                    }`}
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] font-medium ${active ? "text-[#f09942]" : "text-gray-400"
                    }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
