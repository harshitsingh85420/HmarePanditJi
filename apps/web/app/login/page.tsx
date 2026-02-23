"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// Step types
type Step = "phone" | "otp" | "name";
type Role = "CUSTOMER" | "PANDIT";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

// ---------- OTP Input ----------
function OtpInput({ onComplete }: { onComplete: (otp: string) => void }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d)) onComplete(next.join(""));
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  return (
    <div className="flex gap-2 justify-between my-4">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors bg-white text-gray-900"
        />
      ))}
    </div>
  );
}

// ---------- Main Login Page ----------
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const nextParam = searchParams.get("next");

  const [role, setRole] = useState<Role>("CUSTOMER");
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function validatePhone(p: string) {
    return /^[6-9]\d{9}$/.test(p);
  }

  async function handleSendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    if (!validatePhone(phone)) {
      setPhoneError("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setPhoneError("");
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phone}`, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { message?: string }).message || "Failed to send OTP");
      }
      setStep("otp");
      setCountdown(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(otp: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phone}`, otp, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error((data as { message?: string; error?: { message?: string } }).message || data.error?.message || "Invalid OTP");
      }

      const { token, user } = data.data;
      localStorage.setItem("hpj_token", token);
      localStorage.setItem("hpj_user", JSON.stringify(user));

      if (user.isNewUser) {
        setStep("name");
      } else {
        handleRedirect(user);
      }
    } catch (err: any) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("hpj_token");
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedUser = data.data?.user ?? data.data;
        localStorage.setItem("hpj_user", JSON.stringify(updatedUser));
        handleRedirect(updatedUser);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update profile");
    }
    setLoading(false);
  }

  function handleRedirect(user: { role: string; panditProfile?: { verificationStatus: string } }) {
    if (user.role === "PANDIT") {
      const status = user.panditProfile?.verificationStatus;
      const dest = status === "PENDING" && !nextParam
        ? "http://localhost:3002/onboarding"
        : nextParam || "http://localhost:3002/dashboard";
      window.location.href = dest;
    } else if (user.role === "ADMIN") {
      window.location.href = nextParam || "http://localhost:3003/";
    } else {
      router.push(nextParam || "/");
    }
  }

  const maskedPhone = `+91 ${"X".repeat(5)}-${phone.slice(-5)}`;

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-stretch">
      {/* Left Branding Panel (desktop only) */}
      <div className="hidden lg:flex flex-col justify-center items-start w-[480px] flex-shrink-0 bg-gradient-to-br from-primary to-amber-400 px-12 py-16 text-white">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🙏</span>
            <span className="text-2xl font-extrabold tracking-tight">HmarePanditJi</span>
          </div>
          <p className="text-white/80 text-lg font-medium">Sanskriti ko Digital Disha</p>
        </div>

        <div className="space-y-4 w-full">
          {[
            { icon: "🔒", title: "Verified Pandits", desc: "Aadhaar & Video KYC certified" },
            { icon: "💳", title: "Transparent Pricing", desc: "No hidden costs, ever" },
            { icon: "✈️", title: "Travel Managed", desc: "We handle all logistics" },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-4 bg-white/15 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/20">
              <span className="text-2xl">{b.icon}</span>
              <div>
                <p className="font-bold text-sm">{b.title}</p>
                <p className="text-white/70 text-xs">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-white/60 text-sm">500+ pandits | 4.8★ average | Delhi-NCR</p>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2 mb-6">
              <span className="text-2xl">🙏</span>
              <span className="text-lg font-extrabold text-primary">HmarePanditJi</span>
            </div>

            {/* Role Toggle */}
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-pill">
              <button
                onClick={() => setRole("CUSTOMER")}
                className={`flex-1 py-2 px-4 rounded-pill text-sm font-bold transition-all ${role === "CUSTOMER"
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                🙏 I'm a Customer
              </button>
              <button
                onClick={() => setRole("PANDIT")}
                className={`flex-1 py-2 px-4 rounded-pill text-sm font-bold transition-all ${role === "PANDIT"
                    ? "bg-amber-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                📿 I'm a Pandit
              </button>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
              {role === "PANDIT" ? "Namaste Pandit Ji 🙏" : "Welcome back"}
            </h1>
            {role === "PANDIT" && (
              <p className="text-sm text-amber-700 mb-4">Welcome Pandit Ji! Join 500+ verified priests.</p>
            )}

            {/* ERROR */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* STEP 1: Phone */}
            {step === "phone" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
                  <div className="flex">
                    <span className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-gray-600 font-medium text-sm">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                        setPhoneError("");
                      }}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-r-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
                  </div>
                  {phoneError && <p className="text-xs text-red-600 mt-1">{phoneError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-btn font-bold text-white transition-all ${role === "PANDIT" ? "bg-amber-600 hover:bg-amber-700" : "bg-primary hover:bg-primary/90"
                    } disabled:opacity-60`}
                >
                  {loading ? "Sending..." : "Send OTP →"}
                </button>

                <p className="text-xs text-center text-gray-500">
                  No account needed — we'll create one for you
                </p>
              </form>
            )}

            {/* STEP 2: OTP */}
            {step === "otp" && (
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  OTP sent to <strong>{maskedPhone}</strong>{" "}
                  <button onClick={() => { setStep("phone"); setError(""); }} className="text-primary text-xs underline ml-1">
                    Change
                  </button>
                </p>

                {/* Dev hint */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700 mb-2">
                  🧪 Development mode: use <strong>1-2-3-4-5-6</strong>
                </div>

                <OtpInput onComplete={handleVerifyOtp} />

                {loading && <p className="text-center text-sm text-gray-500">Verifying...</p>}

                <div className="text-center mt-2">
                  {countdown > 0 ? (
                    <p className="text-xs text-gray-500">Resend OTP in 00:{String(countdown).padStart(2, "0")}</p>
                  ) : (
                    <button
                      onClick={() => handleSendOtp()}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Name (new users) */}
            {step === "name" && (
              <form onSubmit={handleSubmitName} className="space-y-4">
                <p className="text-sm text-gray-600">
                  {role === "PANDIT"
                    ? "Welcome! Please enter your name to continue."
                    : "What should we call you?"}
                </p>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  autoFocus
                />
                {role === "PANDIT" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
                    📋 After login, you'll complete your profile to start receiving bookings. Takes about 10 minutes.
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className={`w-full py-3 rounded-btn font-bold text-white transition-all ${role === "PANDIT" ? "bg-amber-600 hover:bg-amber-700" : "bg-primary hover:bg-primary/90"
                    } disabled:opacity-60`}
                >
                  {loading ? "Saving..." : "Get Started →"}
                </button>
              </form>
            )}

            {/* Guest mode link (Customer only) */}
            {role === "CUSTOMER" && step === "phone" && (
              <p className="text-center text-sm text-gray-500 mt-6">
                Just exploring?{" "}
                <Link href="/" className="text-primary font-semibold hover:underline">
                  Continue as Guest →
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginPageContent />
    </React.Suspense>
  );
}
