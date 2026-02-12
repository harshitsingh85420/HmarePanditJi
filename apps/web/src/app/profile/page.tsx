"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, API_BASE } from "../../context/auth-context";

export default function ProfilePage() {
  const { user, setUser, accessToken, loading, openLoginModal } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Redirect to home if not logged in
  useEffect(() => {
    if (!loading && !user) {
      openLoginModal();
      router.replace("/");
    }
  }, [loading, user, openLoginModal, router]);

  // Pre-fill form from current user
  useEffect(() => {
    if (user) {
      setFullName(user.fullName ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!accessToken) return;
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          fullName: fullName.trim() || undefined,
          email: email.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "Failed to save. Please try again.");
        return;
      }
      setUser(json.data?.user ?? null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = user.fullName
    ? user.fullName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : user.phone.slice(-2);

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">My Profile</h1>
          <p className="text-sm text-slate-500">{user.phone}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-5">

        {/* Phone (read-only) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Mobile Number
          </label>
          <div className="flex items-center gap-2 h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 text-sm">
            <span className="material-symbols-outlined text-base text-slate-400">phone</span>
            {user.phone}
            <span className="ml-auto flex items-center gap-1 text-green-600 text-xs font-semibold">
              <span className="material-symbols-outlined text-sm">verified</span>
              Verified
            </span>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-base text-slate-400">
              person
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setSaved(false); }}
              placeholder="Ramesh Kumar"
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Email <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-base text-slate-400">
              mail
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSaved(false); }}
              placeholder="ramesh@example.com"
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : saved ? (
            <>
              <span className="material-symbols-outlined text-base">check_circle</span>
              Saved!
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">save</span>
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <a
          href="/bookings"
          className="flex items-center gap-2.5 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span className="material-symbols-outlined text-primary">calendar_month</span>
          My Bookings
        </a>
        <a
          href="/search"
          className="flex items-center gap-2.5 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span className="material-symbols-outlined text-primary">manage_search</span>
          Find a Pandit
        </a>
      </div>
    </div>
  );
}
