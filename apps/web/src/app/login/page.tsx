"use client";

import React, { useEffect, useState } from "react";
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
      const el = document.getElementById(`otp-${index + 1}`);
      el?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const el = document.getElementById(`otp-${index - 1}`);
      el?.focus();
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f7f5] dark:bg-[#221a10] flex items-center justify-center px-4 py-12">
      {/* Background pattern */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #f49d25 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-3xl">🙏</span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Hmare<span className="text-primary">PanditJi</span>
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {step === "phone" && "Enter your phone number to get started"}
            {step === "otp" && `We sent a 6-digit OTP to +91 ${phone}`}
            {step === "profile" && "Almost there! Complete your profile"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Dev OTP indicator */}
          {devOtp && step === "otp" && (
            <div className="mb-4 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 text-xs">
              Dev OTP: <span className="font-mono font-bold text-base">{devOtp}</span>
            </div>
          )}

          {/* Phone Step */}
          {step === "phone" && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Mobile Number
                </label>
                <div className="flex">
                  <span className="flex items-center px-4 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-xl text-sm font-semibold text-slate-600 dark:text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && handleRequestOtp()}
                    placeholder="98765 43210"
                    autoFocus
                    className="flex-1 px-4 py-3 text-lg border border-slate-200 dark:border-slate-700 rounded-r-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                onClick={handleRequestOtp}
                disabled={loading || phone.length !== 10}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
              >
                {loading ? "Sending OTP…" : "Send OTP"}
              </button>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Enter OTP
                </label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      autoFocus={i === 0}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.join("").length !== 6}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
              >
                {loading ? "Verifying…" : "Verify OTP"}
              </button>

              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setStep("phone");
                    setOtp(["", "", "", "", "", ""]);
                    setError("");
                  }}
                  className="text-primary font-semibold hover:underline"
                >
                  Change Number
                </button>
                <button
                  onClick={handleRequestOtp}
                  disabled={countdown > 0}
                  className="text-primary font-semibold hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                </button>
              </div>
            </div>
          )}

          {/* Profile Step */}
          {step === "profile" && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  autoFocus
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                onClick={handleCompleteProfile}
                disabled={loading || !fullName.trim()}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
              >
                {loading ? "Saving…" : "Complete & Continue"}
              </button>
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {["phone", "otp", "profile"].map((s, i) => (
            <div
              key={s}
              className={[
                "w-2 h-2 rounded-full transition-all",
                step === s
                  ? "bg-primary w-6"
                  : i < ["phone", "otp", "profile"].indexOf(step)
                  ? "bg-primary/60"
                  : "bg-slate-300 dark:bg-slate-700",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
