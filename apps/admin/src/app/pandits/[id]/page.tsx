"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface PanditProfile {
  id: string;
  displayName: string;
  bio: string | null;
  city: string;
  state: string;
  experienceYears: number;
  specializations: string[];
  languages: string[];
  averageRating: number;
  totalReviews: number;
  completedBookings: number;
  isVerified: boolean;
  isActive: boolean;
  isOnline: boolean;
  maxTravelDistance: number;
  profilePhotoUrl: string | null;
  travelPreferences: Record<string, unknown> | null;
  bankDetails: Record<string, string> | null;
  createdAt: string;
  user: { phone: string; email: string | null; fullName: string | null; createdAt: string } | null;
  pujaServices: { pujaType: string; dakshinaAmount: number; durationHours: number; isActive: boolean }[];
  reviews: { overallRating: number; comment: string | null; createdAt: string; reviewer: { name: string | null } | null }[];
}

const MOCK: PanditProfile = {
  id: "p-mock-1", displayName: "Pandit Ramesh Sharma", bio: "Experienced Vedic scholar specializing in Griha Pravesh, Satyanarayan Katha, and wedding ceremonies. Over 25 years of practice in Delhi-NCR.",
  city: "Old Delhi", state: "Delhi", experienceYears: 25, specializations: ["Griha Pravesh", "Wedding Ceremony", "Satyanarayan Katha", "Mundan"],
  languages: ["Hindi", "Sanskrit", "English"], averageRating: 4.8, totalReviews: 124, completedBookings: 312,
  isVerified: true, isActive: true, isOnline: true, maxTravelDistance: 150, profilePhotoUrl: null,
  travelPreferences: { maxDistance: 150, preferredModes: ["car", "train"], selfDriveRate: 12, vehicleType: "Sedan" },
  bankDetails: { bankName: "SBI", accountHolderName: "Ramesh Sharma", accountNumber: "****5678", ifscCode: "SBIN0001234", upiId: "ramesh@sbi" },
  createdAt: "2023-06-15T10:00:00Z",
  user: { phone: "+919876543210", email: "ramesh.sharma@email.com", fullName: "Ramesh Sharma", createdAt: "2023-06-15T10:00:00Z" },
  pujaServices: [
    { pujaType: "Griha Pravesh", dakshinaAmount: 11000, durationHours: 3, isActive: true },
    { pujaType: "Satyanarayan Katha", dakshinaAmount: 5100, durationHours: 2.5, isActive: true },
    { pujaType: "Wedding Ceremony", dakshinaAmount: 21000, durationHours: 5, isActive: true },
    { pujaType: "Mundan Ceremony", dakshinaAmount: 7500, durationHours: 1.5, isActive: true },
  ],
  reviews: [
    { overallRating: 5, comment: "Excellent pandit! Very knowledgeable and punctual.", createdAt: "2025-01-20T12:00:00Z", reviewer: { name: "Vikram M." } },
    { overallRating: 4, comment: "Good ceremony, arrived on time.", createdAt: "2025-01-15T12:00:00Z", reviewer: { name: "Priya A." } },
    { overallRating: 5, comment: "Highly recommended for wedding ceremonies.", createdAt: "2025-01-10T12:00:00Z", reviewer: { name: "Ankit G." } },
  ],
};

export default function AdminPanditDetailPage({ params }: { params: { id: string } }) {
  const [pandit, setPandit] = useState<PanditProfile>(MOCK);
  const [toast, setToast] = useState("");
  const [verifyReason, setVerifyReason] = useState("");

  useEffect(() => {
    fetchPandit();
  }, [params.id]);

  async function fetchPandit() {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API}/pandits/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) setPandit(json.data);
      }
    } catch { /* use mock */ }
  }

  async function toggleVerification(isVerified: boolean) {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API}/admin/pandits/${params.id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isVerified, reason: verifyReason || undefined }),
      });
      if (res.ok) {
        showToast(isVerified ? "Pandit verified" : "Verification rejected");
        fetchPandit();
        setVerifyReason("");
      }
    } catch { showToast("Action failed"); }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const p = pandit;

  return (
    <main className="min-h-screen bg-slate-950 p-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/pandits" className="text-xs text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-sm align-middle mr-1">arrow_back</span>
          Back to Pandits
        </Link>
      </div>

      {/* Profile Header */}
      <div className="mb-6 flex items-start gap-5 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="h-20 w-20 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
          {p.displayName.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{p.displayName}</h1>
            {p.isVerified && (
              <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400 border border-green-500/20">
                <span className="material-symbols-outlined text-sm">verified</span>Verified
              </span>
            )}
            {!p.isVerified && (
              <span className="rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-400 border border-yellow-500/20">
                Pending Verification
              </span>
            )}
            {p.isOnline && (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-500" />Online
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-400">{p.city}, {p.state} &mdash; {p.experienceYears} years experience</p>
          {p.bio && <p className="mt-2 text-sm text-slate-300">{p.bio}</p>}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.specializations.map((s) => (
              <span key={s} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">{s}</span>
            ))}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 text-yellow-400">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-xl font-bold">{p.averageRating.toFixed(1)}</span>
          </div>
          <p className="text-xs text-slate-400">{p.totalReviews} reviews</p>
          <p className="mt-1 text-xs text-slate-400">{p.completedBookings} bookings</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="col-span-2 space-y-5">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
              <p className="text-2xl font-bold text-white">{p.completedBookings}</p>
              <p className="text-xs text-slate-400">Bookings</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{p.averageRating.toFixed(1)}</p>
              <p className="text-xs text-slate-400">Rating</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
              <p className="text-2xl font-bold text-white">{p.totalReviews}</p>
              <p className="text-xs text-slate-400">Reviews</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
              <p className="text-2xl font-bold text-white">{p.maxTravelDistance} km</p>
              <p className="text-xs text-slate-400">Max Travel</p>
            </div>
          </div>

          {/* Puja Services */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 text-sm font-semibold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">self_improvement</span>
              Puja Services
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400">
                  <th className="pb-2 text-left">Ceremony</th>
                  <th className="pb-2 text-right">Dakshina</th>
                  <th className="pb-2 text-right">Duration</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {p.pujaServices.map((s) => (
                  <tr key={s.pujaType} className="border-b border-slate-800/50">
                    <td className="py-2.5 text-white">{s.pujaType}</td>
                    <td className="py-2.5 text-right text-slate-300">{"\u20B9"}{s.dakshinaAmount.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 text-right text-slate-400">{s.durationHours}h</td>
                    <td className="py-2.5 text-right">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${s.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Recent Reviews */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 text-sm font-semibold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">reviews</span>
              Recent Reviews
            </h2>
            <div className="space-y-3">
              {p.reviews.map((r, i) => (
                <div key={i} className="rounded-lg bg-slate-800 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{r.reviewer?.name ?? "Anonymous"}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <span
                            key={j}
                            className={`material-symbols-outlined text-sm ${j < r.overallRating ? "text-yellow-400" : "text-slate-600"}`}
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >star</span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  {r.comment && <p className="text-sm text-slate-300">{r.comment}</p>}
                </div>
              ))}
            </div>
          </section>

          {/* Travel Preferences */}
          {p.travelPreferences && (
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="mb-3 text-sm font-semibold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">directions_car</span>
                Travel Preferences
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Max Distance</p>
                  <p className="text-white">{(p.travelPreferences.maxDistance as number) ?? p.maxTravelDistance} km</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Preferred Modes</p>
                  <p className="text-white capitalize">{((p.travelPreferences.preferredModes as string[]) ?? []).join(", ") || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Self-drive Rate</p>
                  <p className="text-white">{"\u20B9"}{(p.travelPreferences.selfDriveRate as number) ?? 0}/km</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Vehicle</p>
                  <p className="text-white">{(p.travelPreferences.vehicleType as string) ?? "—"}</p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Contact, Bank, Admin Actions */}
        <div className="space-y-5">
          {/* Contact */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Contact</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Phone</span>
                <span className="text-white">{p.user?.phone ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email</span>
                <span className="text-white">{p.user?.email ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Languages</span>
                <span className="text-white">{p.languages.join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Joined</span>
                <span className="text-white">{new Date(p.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <a href={`tel:${p.user?.phone}`} className="flex-1 rounded-lg bg-slate-800 py-2 text-center text-xs text-white hover:bg-slate-700">
                <span className="material-symbols-outlined text-sm align-middle mr-1">call</span>Call
              </a>
              <a href={`https://wa.me/${p.user?.phone?.replace("+", "")}`} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg bg-green-600/20 py-2 text-center text-xs text-green-400 hover:bg-green-600/30">
                WhatsApp
              </a>
            </div>
          </section>

          {/* Bank Details */}
          {p.bankDetails && (
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="mb-3 text-sm font-semibold text-white">Bank Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Holder</span>
                  <span className="text-white">{p.bankDetails.accountHolderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank</span>
                  <span className="text-white">{p.bankDetails.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account</span>
                  <span className="text-white font-mono">{p.bankDetails.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IFSC</span>
                  <span className="text-white font-mono">{p.bankDetails.ifscCode}</span>
                </div>
                {p.bankDetails.upiId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">UPI</span>
                    <span className="text-white">{p.bankDetails.upiId}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Verification Actions */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Admin Actions</h2>

            <div className="mb-3">
              <label className="mb-1 block text-xs text-slate-400">Reason / Note</label>
              <textarea
                value={verifyReason}
                onChange={(e) => setVerifyReason(e.target.value)}
                rows={2}
                placeholder="Optional reason..."
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              {!p.isVerified ? (
                <>
                  <button
                    onClick={() => toggleVerification(true)}
                    className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-500"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => toggleVerification(false)}
                    className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500"
                  >
                    Reject
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => toggleVerification(false)}
                    className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500"
                  >
                    Revoke Verification
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => showToast("SMS sent to pandit")}
              className="mt-2 w-full rounded-lg bg-slate-800 py-2 text-sm text-white hover:bg-slate-700"
            >
              <span className="material-symbols-outlined text-sm align-middle mr-1">sms</span>
              Send SMS
            </button>
          </section>

          {/* Meta */}
          <div className="rounded-lg bg-slate-800/50 p-3 text-xs text-slate-500">
            <p>Pandit ID: {p.id}</p>
            <p>Status: {p.isActive ? "Active" : "Inactive"}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
