"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth, saveTokens, API_BASE } from "../../context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleRequestOtp = async () => {
    if (phone.length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phone}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to send OTP");
      if (data.data?.devOtp) setDevOtp(data.data.devOtp);
      setStep("otp");
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpStr = otp.join("");
    if (otpStr.length !== 6) {
      setError("Enter the complete 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phone}`, otp: otpStr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Invalid OTP");

      const { accessToken, refreshToken, user: authUser, isNewUser } = data.data;
      saveTokens(accessToken, refreshToken);

      if (isNewUser) {
        setStep("profile");
      } else {
        setUser(authUser);
        router.replace("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!fullName.trim()) {
      setError("Name is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("hpj_access_token");
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          ...(email.trim() ? { email: email.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to update profile");
      setUser(data.data?.user ?? data.data);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] flex items-center justify-center p-6 md:p-12 transition-colors duration-200">
      <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Side: Trust Section */}
        <div className="hidden lg:flex flex-col gap-8 py-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Begin Your Spiritual Journey
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Join HmarePanditJi to access certified Pandits, personalized rituals, and seamless religious services for your family.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#137fec]/10 text-[#137fec] flex items-center justify-center">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Secure & Private</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your personal data is encrypted and never shared with third parties.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#137fec]/10 text-[#137fec] flex items-center justify-center">
                <span className="material-symbols-outlined">group_add</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Family Profiles</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Easily manage bookings for parents, spouse, and children in one place.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#137fec]/10 text-[#137fec] flex items-center justify-center">
                <span className="material-symbols-outlined">history</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Quick History</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Access your past poojas, receipts, and Pandit feedback anytime.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-yellow-500">lock</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">End-to-End Encryption</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We comply with global data privacy standards. Your phone number is only used for authentication and service updates.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="bg-white dark:bg-[#1c2127] rounded-2xl shadow-xl border border-slate-200 dark:border-[#283039] overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 flex">
            <div
              className="h-full bg-[#137fec] transition-all duration-500"
              style={{ width: step === "phone" ? "33%" : step === "otp" ? "66%" : "100%" }}
            />
          </div>

          <div className="p-8 md:p-10">
            {/* Step 1: Phone */}
            {step === "phone" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Join HmarePanditJi for seamless religious services</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 text-sm font-medium">+91</span>
                      </div>
                      <input
                        className="block w-full pl-12 pr-4 py-4 rounded-lg bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-[#3b4754] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec] focus:border-transparent transition-all outline-none"
                        placeholder="99999 99999"
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        onKeyDown={(e) => e.key === "Enter" && handleRequestOtp()}
                        autoFocus
                      />
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <button
                    onClick={handleRequestOtp}
                    disabled={loading || phone.length !== 10}
                    className="w-full mt-2 py-4 px-6 bg-[#137fec] hover:bg-[#137fec]/90 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? "Sending..." : (
                      <>
                        Get OTP <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: OTP */}
            {step === "otp" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verify Phone</h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Enter OTP sent to +91 {phone}</p>
                </div>
                {devOtp && (
                  <div className="p-2 bg-amber-50 text-amber-700 text-xs rounded border border-amber-200">
                    DEV OTP: <span className="font-bold">{devOtp}</span>
                  </div>
                )}
                <div className="space-y-6">
                  <div className="flex gap-2 justify-between">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        className="w-12 h-14 text-center text-xl font-bold rounded-lg bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-[#3b4754] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec] outline-none transition-all"
                        maxLength={1}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>

                  {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                  <div className="flex justify-between items-center text-sm">
                    <button onClick={() => setStep("phone")} className="text-slate-500 hover:text-[#137fec]">Change Number</button>
                    {countdown > 0 ? (
                      <span className="text-slate-400">Resend in {countdown}s</span>
                    ) : (
                      <button onClick={handleRequestOtp} className="text-[#137fec] font-bold hover:underline">Resend OTP</button>
                    )}
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.join("").length !== 6}
                    className="w-full mt-2 py-4 px-6 bg-[#137fec] hover:bg-[#137fec]/90 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? "Verifying..." : (
                      <>
                        Verify & Continue <span className="material-symbols-outlined text-base">check</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Profile */}
            {step === "profile" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Complete Profile</h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Tell us a bit about yourself</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                      <input
                        className="w-full p-3 rounded-lg bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-[#3b4754] text-slate-900 dark:text-white focus:ring-1 focus:ring-[#137fec] outline-none mt-1"
                        placeholder="e.g. Rajesh Kumar"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email (Optional)</label>
                      <input
                        className="w-full p-3 rounded-lg bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-[#3b4754] text-slate-900 dark:text-white focus:ring-1 focus:ring-[#137fec] outline-none mt-1"
                        placeholder="rajesh@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <button
                    onClick={handleCompleteProfile}
                    disabled={loading || !fullName.trim()}
                    className="w-full py-4 bg-[#137fec] text-white font-bold rounded-lg shadow-lg shadow-[#137fec]/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Finish Setup"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
