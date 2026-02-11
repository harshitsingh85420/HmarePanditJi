"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

type Step = "phone" | "otp";

export default function AuthPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Kripya valid 10-digit mobile number darj karein");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${digits}`, role: "PANDIT" }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("otp");
        setResendTimer(RESEND_SECONDS);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(data.message ?? "OTP send karne mein pareshani hui. Dobara koshish karein.");
      }
    } catch {
      // Dev mode: skip API, go to OTP
      setStep("otp");
      setResendTimer(RESEND_SECONDS);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setOtp(pasted.split(""));
      otpRefs.current[OTP_LENGTH - 1]?.focus();
      e.preventDefault();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Kripya poora OTP darj karein");
      return;
    }
    setLoading(true);
    try {
      const digits = phone.replace(/\D/g, "");
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${digits}`, otp: code, role: "PANDIT" }),
      });
      const data = await res.json();
      if (res.ok) {
        const isNew = data.data?.isNew ?? data.isNew;
        router.push(isNew ? "/onboarding" : "/");
      } else {
        setError(data.message ?? "OTP galat hai. Dobara koshish karein.");
        setOtp(Array(OTP_LENGTH).fill(""));
        otpRefs.current[0]?.focus();
      }
    } catch {
      // Dev mode: treat as new user
      router.push("/onboarding");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setOtp(Array(OTP_LENGTH).fill(""));
    const digits = phone.replace(/\D/g, "");
    try {
      await fetch(`${API_BASE}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${digits}`, role: "PANDIT" }),
      });
    } catch {
      // ignore in dev
    }
    setResendTimer(RESEND_SECONDS);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  return (
    <div className="flex items-start justify-center pt-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-md shadow-primary/20 mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" className="text-white" aria-hidden="true">
              <path
                d="M12 2l2.929 6.472L22 9.549l-5 4.951 1.18 6.999L12 18.272l-6.18 3.227L7 15.5 2 10.549l7.071-1.077L12 2z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">HmarePanditJi</h1>
          <p className="text-sm text-slate-500 mt-1">Pandit Partner Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

          {step === "phone" ? (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Login / Register</h2>
              <p className="text-sm text-slate-500 mb-6">
                Apna mobile number darj karein — hum ek OTP bhejenge
              </p>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Mobile Number
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                    <span className="px-4 py-3 bg-slate-50 text-sm font-semibold text-slate-600 border-r border-slate-200">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className="flex-1 px-4 py-3 text-sm text-slate-900 bg-white focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-base leading-none">error</span>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || phone.replace(/\D/g, "").length !== 10}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold rounded-xl py-3.5 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base leading-none">send</span>
                      OTP Bhejein
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep("phone"); setError(""); setOtp(Array(OTP_LENGTH).fill("")); }}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary mb-4 transition-colors"
              >
                <span className="material-symbols-outlined text-base leading-none">arrow_back</span>
                Back
              </button>

              <h2 className="text-xl font-bold text-slate-900 mb-1">OTP Verify Karein</h2>
              <p className="text-sm text-slate-500 mb-6">
                +91 {phone} par bheja gaya 6-digit code darj karein
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                {/* OTP input boxes */}
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-11 h-14 text-center text-xl font-bold rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                        digit ? "border-primary bg-primary/5 text-primary" : "border-slate-200 text-slate-900"
                      }`}
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-sm text-red-600 text-center flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-base leading-none">error</span>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.join("").length < OTP_LENGTH}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold rounded-xl py-3.5 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base leading-none">
                        verified_user
                      </span>
                      Verify & Login
                    </>
                  )}
                </button>

                {/* Resend */}
                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-slate-500">
                      OTP dobara bhejein{" "}
                      <span className="font-semibold text-slate-700">{resendTimer}s</span> mein
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-sm text-primary font-semibold hover:text-primary/80 transition-colors"
                    >
                      OTP Dobara Bhejein
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">
          Login karke aap hamare{" "}
          <span className="underline cursor-pointer">Terms of Service</span> aur{" "}
          <span className="underline cursor-pointer">Privacy Policy</span> se sahmat hote hain
        </p>
      </div>
    </div>
  );
}
