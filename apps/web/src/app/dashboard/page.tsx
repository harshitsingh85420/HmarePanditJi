"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/auth-context";

const NAV_CARDS = [
  {
    href: "/bookings",
    icon: "event",
    label: "My Bookings",
    desc: "View upcoming & past ceremonies",
    color: "bg-[#f49d25]/10 text-[#f49d25]",
  },
  {
    href: "/dashboard/favorites",
    icon: "favorite",
    label: "My Favorites",
    desc: "Saved pandits for quick booking",
    color: "bg-rose-100 text-rose-500",
  },
  {
    href: "/dashboard/profile",
    icon: "person",
    label: "My Profile",
    desc: "Update personal info & addresses",
    color: "bg-blue-100 text-blue-500",
  },
];

const QUICK_LINKS = [
  { href: "/search", icon: "search", label: "Find a Pandit" },
  { href: "/muhurat", icon: "calendar_month", label: "Muhurat Explorer" },
  { href: "/booking/new", icon: "add_circle", label: "New Booking" },
];

export default function DashboardPage() {
  const { user, loading, openLoginModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) openLoginModal();
  }, [loading, user, openLoginModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f49d25] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f49d25]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-[#f49d25]">lock</span>
          </div>
          <h2 className="text-slate-700 font-semibold text-lg mb-2">Sign in to view your dashboard</h2>
          <p className="text-slate-400 text-sm mb-6">Manage bookings, favorites, and your profile.</p>
          <button
            onClick={openLoginModal}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#f49d25] hover:bg-[#e08c14] text-white rounded-xl font-semibold text-sm transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#f49d25]/10 border-2 border-[#f49d25]/20 flex items-center justify-center">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-2xl text-[#f49d25]">person</span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Namaste, {user.fullName?.split(" ")[0] || "Ji"} 🙏
              </h1>
              <p className="text-sm text-slate-400">Manage your bookings & profile</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Navigation Cards */}
        <div className="space-y-3">
          {NAV_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {card.icon}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 group-hover:text-[#f49d25] transition-colors">
                  {card.label}
                </p>
                <p className="text-xs text-slate-400">{card.desc}</p>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-[#f49d25] transition-colors">
                chevron_right
              </span>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 hover:border-[#f49d25]/30 hover:shadow-sm transition-all text-center group"
              >
                <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-[#f49d25] transition-colors">
                  {link.icon}
                </span>
                <span className="text-xs font-medium text-slate-600 group-hover:text-[#f49d25] transition-colors">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Banner */}
        <div className="bg-gradient-to-r from-[#f49d25]/10 to-[#f49d25]/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#f49d25]">support_agent</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700">Need help?</p>
            <p className="text-xs text-slate-500">Contact us on WhatsApp for quick support</p>
          </div>
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#25D366] text-white text-xs font-bold rounded-xl hover:bg-[#128C4C] transition-colors"
          >
            Chat
          </a>
        </div>
      </div>
    </div>
  );
}
