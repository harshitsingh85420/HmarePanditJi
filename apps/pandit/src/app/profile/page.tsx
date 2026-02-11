"use client";

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Badge {
  id: string;
  name: string;
  category: string;
  icon: string;
  earned: boolean;
  description: string;
}

interface PanditProfile {
  displayName: string;
  bio: string;
  level: number;
  levelTitle: string;
  location: string;
  specializations: string[];
  languages: string[];
  verifiedPhone: boolean;
  verifiedAadhaar: boolean;
  verifiedBank: boolean;
  rating: number;
  reviewCount: number;
  milestoneLabel: string;
  milestoneProgress: number; // 0–100
  milestoneNext: string;
  milestoneRemaining: string;
  dakshina: number;
  travelAllowance: number;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_PROFILE: PanditProfile = {
  displayName: "Pandit Ram Sharma Ji",
  bio: "25+ saal ka anubhav. Kashi Vishwanath se certified. Vedic traditions ka gyaata.",
  level: 4,
  levelTitle: "Vedic Expert",
  location: "Varanasi, UP",
  specializations: ["Vivah Puja", "Griha Pravesh", "Satyanarayan Katha", "Maha Mrityunjay Jaap"],
  languages: ["Hindi", "Sanskrit", "Bhojpuri", "English"],
  verifiedPhone: true,
  verifiedAadhaar: true,
  verifiedBank: true,
  rating: 4.9,
  reviewCount: 142,
  milestoneLabel: "Next Milestone Progress",
  milestoneProgress: 72,
  milestoneNext: "Diamond Pandit",
  milestoneRemaining: "Complete 7 more pujas to reach Diamond level",
  dakshina: 29750,
  travelAllowance: 5,
  bankName: "State Bank of India",
  bankAccount: "••••••4821",
  bankIfsc: "SBIN0001234",
};

const BADGES: Badge[] = [
  {
    id: "all_india",
    name: "All India Traveler",
    category: "Travel",
    icon: "explore",
    earned: true,
    description: "Traveled across 10+ states for puja services",
  },
  {
    id: "wedding_specialist",
    name: "Wedding Specialist",
    category: "Expertise",
    icon: "diversity_1",
    earned: true,
    description: "Completed 25+ Vivah Pujas with 5★ ratings",
  },
  {
    id: "host_favorite",
    name: "5.0★ Host Favorite",
    category: "Rating",
    icon: "star",
    earned: true,
    description: "Maintained a perfect 5.0 rating for 6 months",
  },
  {
    id: "tech_savvy",
    name: "Tech Savvy",
    category: "Platform",
    icon: "devices",
    earned: true,
    description: "Actively uses HmarePanditJi app for all bookings",
  },
];

const SPECIALIZATION_OPTIONS = [
  "Vivah Puja",
  "Griha Pravesh",
  "Satyanarayan Katha",
  "Maha Mrityunjay Jaap",
  "Namkaran Puja",
  "Mundan Puja",
  "Shraadh / Pitru Puja",
  "Rudrabhishek",
  "Ganesh Puja",
  "Navgraha Puja",
];

const LANGUAGE_OPTIONS = ["Hindi", "Sanskrit", "English", "Bengali", "Tamil", "Telugu", "Gujarati", "Bhojpuri", "Marathi"];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile] = useState<PanditProfile>(MOCK_PROFILE);
  const [editing, setEditing] = useState<string | null>(null); // which section is open
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  // Draft state for editing
  const [draft, setDraft] = useState<Partial<PanditProfile>>({});

  const startEdit = (section: string) => {
    setDraft({ ...profile });
    setEditing(section);
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft({});
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      // PATCH /profile — non-blocking mock
      await new Promise((r) => setTimeout(r, 800));
      setProfile((prev) => ({ ...prev, ...draft }));
      setSaved(editing);
      setTimeout(() => setSaved(null), 2000);
    } finally {
      setSaving(false);
      setEditing(null);
      setDraft({});
    }
  };

  const toggleSpec = (s: string) => {
    const current = (draft.specializations ?? profile.specializations) as string[];
    setDraft((d) => ({
      ...d,
      specializations: current.includes(s) ? current.filter((x) => x !== s) : [...current, s],
    }));
  };

  const toggleLang = (l: string) => {
    const current = (draft.languages ?? profile.languages) as string[];
    setDraft((d) => ({
      ...d,
      languages: current.includes(l) ? current.filter((x) => x !== l) : [...current, l],
    }));
  };

  return (
    <div className="py-8 space-y-6">

      {/* ── 1. Profile Header Card ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-primary/10 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

          {/* Avatar with level badge */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary/20 bg-primary/10 flex items-center justify-center text-4xl font-black text-primary">
              {profile.displayName.charAt(0)}
            </div>
            {/* Level badge */}
            <div className="absolute bottom-0 right-0 bg-primary text-white text-xs font-black rounded-full px-2.5 py-1 shadow-sm border-2 border-white">
              Lv {profile.level}
            </div>
          </div>

          {/* Name + Tags */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
              {profile.displayName}
            </h1>

            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="bg-primary/10 text-primary font-semibold text-sm rounded-full px-3 py-1">
                {profile.levelTitle}
              </span>
              <span className="flex items-center gap-1 text-sm text-slate-500">
                <span className="material-symbols-outlined text-base leading-none">location_on</span>
                {profile.location}
              </span>
              <span className="flex items-center gap-1 text-sm text-slate-500">
                <span
                  className="material-symbols-outlined text-primary text-base leading-none"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="font-semibold text-slate-700">{profile.rating}</span>
                <span className="text-slate-400">({profile.reviewCount} reviews)</span>
              </span>
            </div>

            {/* Bio */}
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{profile.bio}</p>

            {/* Verification badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { ok: profile.verifiedPhone, label: "Phone", icon: "phone_iphone" },
                { ok: profile.verifiedAadhaar, label: "Aadhaar", icon: "badge" },
                { ok: profile.verifiedBank, label: "Bank", icon: "account_balance" },
              ].map((v) => (
                <span
                  key={v.label}
                  className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    v.ok ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm leading-none">{v.icon}</span>
                  {v.label} {v.ok ? "✓" : "—"}
                </span>
              ))}
            </div>
          </div>

          {/* Edit button */}
          <button
            onClick={() => startEdit("header")}
            className="flex-shrink-0 flex items-center gap-1.5 border border-slate-200 hover:border-primary/40 text-slate-600 hover:text-primary text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
          >
            <span className="material-symbols-outlined text-base leading-none">edit</span>
            Edit Profile
          </button>
        </div>
      </div>

      {/* ── 2. Milestone Progress ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {profile.milestoneLabel}
            </p>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">{profile.milestoneNext}</h2>
          </div>
          <span className="text-xl font-black text-primary">{profile.milestoneProgress}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${profile.milestoneProgress}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-slate-500">{profile.milestoneRemaining}</p>
      </div>

      {/* ── 3. Professional Badges Grid ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Professional Badges</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BADGES.map((badge) => (
            <div
              key={badge.id}
              className={`flex flex-col items-center p-5 rounded-xl border transition-colors ${
                badge.earned
                  ? "bg-white border-primary/20 hover:border-primary"
                  : "bg-slate-50 border-slate-200 opacity-50"
              }`}
            >
              {/* Icon circle */}
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span
                  className="material-symbols-outlined text-primary text-4xl"
                  style={badge.earned ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {badge.icon}
                </span>
              </div>

              {/* Badge name */}
              <p className="text-sm font-bold text-slate-900 text-center leading-tight">
                {badge.name}
              </p>
              <p className="text-xs text-slate-500 text-center mt-0.5">{badge.category}</p>

              {/* Earned indicator */}
              {badge.earned && (
                <span className="mt-2 text-xs text-primary font-semibold flex items-center gap-0.5">
                  <span
                    className="material-symbols-outlined text-sm leading-none"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  Earned
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Specializations ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Specializations</h2>
          <button
            onClick={() => startEdit("specializations")}
            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base leading-none">edit</span>
            Edit
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {profile.specializations.map((s) => (
            <span
              key={s}
              className="bg-primary/10 text-primary text-sm font-medium rounded-full px-3 py-1"
            >
              {s}
            </span>
          ))}
        </div>

        {saved === "specializations" && (
          <p className="mt-3 text-sm text-green-600 flex items-center gap-1">
            <span className="material-symbols-outlined text-base leading-none">check_circle</span>
            Saved successfully
          </p>
        )}
      </div>

      {/* ── 5. Languages ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Languages</h2>
          <button
            onClick={() => startEdit("languages")}
            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base leading-none">edit</span>
            Edit
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {profile.languages.map((l) => (
            <span
              key={l}
              className="bg-slate-100 text-slate-700 text-sm font-medium rounded-full px-3 py-1"
            >
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* ── 6. Pricing ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Pricing</h2>
          <button
            onClick={() => startEdit("pricing")}
            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base leading-none">edit</span>
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Base Dakshina
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              ₹{profile.dakshina.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Travel Allowance
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              ₹{profile.travelAllowance}/km
            </p>
          </div>
        </div>
      </div>

      {/* ── 7. Bank Details ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Bank Details</h2>
          <button
            onClick={() => startEdit("bank")}
            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base leading-none">edit</span>
            Edit
          </button>
        </div>

        <div className="space-y-3">
          {[
            { label: "Bank Name", value: profile.bankName },
            { label: "Account Number", value: profile.bankAccount },
            { label: "IFSC Code", value: profile.bankIfsc },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-500">{row.label}</span>
              <span className="text-sm font-semibold text-slate-900">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Edit Modal ───────────────────────────────────────────────────── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-900">
                {editing === "header" && "Edit Profile"}
                {editing === "specializations" && "Edit Specializations"}
                {editing === "languages" && "Edit Languages"}
                {editing === "pricing" && "Edit Pricing"}
                {editing === "bank" && "Edit Bank Details"}
              </h3>
              <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Header edit */}
              {editing === "header" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={(draft.displayName ?? profile.displayName) as string}
                      onChange={(e) => setDraft((d) => ({ ...d, displayName: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                    <textarea
                      rows={3}
                      value={(draft.bio ?? profile.bio) as string}
                      onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={(draft.location ?? profile.location) as string}
                      onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </>
              )}

              {/* Specializations edit */}
              {editing === "specializations" && (
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATION_OPTIONS.map((s) => {
                    const selected = (
                      (draft.specializations ?? profile.specializations) as string[]
                    ).includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleSpec(s)}
                        className={`text-sm font-medium rounded-full px-4 py-2 border transition-colors ${
                          selected
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-slate-600 border-slate-200 hover:border-primary/40"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Languages edit */}
              {editing === "languages" && (
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((l) => {
                    const selected = (
                      (draft.languages ?? profile.languages) as string[]
                    ).includes(l);
                    return (
                      <button
                        key={l}
                        onClick={() => toggleLang(l)}
                        className={`text-sm font-medium rounded-full px-4 py-2 border transition-colors ${
                          selected
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-slate-600 border-slate-200 hover:border-primary/40"
                        }`}
                      >
                        {l}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Pricing edit */}
              {editing === "pricing" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Base Dakshina (₹)
                    </label>
                    <input
                      type="number"
                      value={(draft.dakshina ?? profile.dakshina) as number}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, dakshina: Number(e.target.value) }))
                      }
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Travel Allowance (₹/km)
                    </label>
                    <input
                      type="number"
                      value={(draft.travelAllowance ?? profile.travelAllowance) as number}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, travelAllowance: Number(e.target.value) }))
                      }
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </>
              )}

              {/* Bank edit */}
              {editing === "bank" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={(draft.bankName ?? profile.bankName) as string}
                      onChange={(e) => setDraft((d) => ({ ...d, bankName: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={(draft.bankAccount ?? profile.bankAccount) as string}
                      onChange={(e) => setDraft((d) => ({ ...d, bankAccount: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={(draft.bankIfsc ?? profile.bankIfsc) as string}
                      onChange={(e) => setDraft((d) => ({ ...d, bankIfsc: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
              <button
                onClick={cancelEdit}
                className="flex-1 border border-slate-200 text-slate-700 font-semibold rounded-xl py-3 hover:border-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-base leading-none">check</span>
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
