"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth, saveTokens, API_BASE, type AuthUser } from "../context/auth-context";


// ── Types ─────────────────────────────────────────────────────────────────────

type Step = "phone" | "otp" | "profile";

// ── OTP Input: 6 individual boxes ─────────────────────────────────────────────

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, &quot;&quot;).split(&quot;&quot;).slice(0, 6);

  const handleChange = (index: number, char: string) => {
    const cleaned = char.replace(/\D/g, &quot;&quot;).slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    const joined = next.join(&quot;&quot;).replace(/\s/g, &quot;&quot;);
    onChange(joined);
    if (cleaned && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === &quot;Backspace&quot; && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData(&quot;text&quot;).replace(/\D/g, &quot;&quot;).slice(0, 6);
    onChange(pasted);
    const nextIndex = Math.min(pasted.length, 5);
    inputs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digits[i] ?? &quot;&quot;}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          className={[
            &quot;w-11 h-13 text-center text-xl font-bold rounded-xl border-2 transition-all&quot;,
            &quot;focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20&quot;,
            &quot;bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100&quot;,
            digits[i]
              ? &quot;border-primary bg-primary/5&quot;
              : &quot;border-slate-200 dark:border-slate-700&quot;,
            disabled ? &quot;opacity-50 cursor-not-allowed&quot; : &quot;&quot;,
          ].join(&quot; &quot;)}
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

export default function AuthModal() {
  const { loginModalOpen, closeLoginModal, login } = useAuth();

  const [step, setStep] = useState<Step>(&quot;phone&quot;);
  const [phone, setPhone] = useState(&quot;&quot;);
  const [otp, setOtp] = useState(&quot;&quot;);
  const [fullName, setFullName] = useState(&quot;&quot;);
  const [email, setEmail] = useState(&quot;&quot;);
  const [error, setError] = useState(&quot;&quot;);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [accessTokenTemp, setAccessTokenTemp] = useState(&quot;&quot;);
  const [isNewUser, setIsNewUser] = useState(false);
  const [devOtp, setDevOtp] = useState(&quot;&quot;);

  const phoneRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset on open
  useEffect(() => {
    if (loginModalOpen) {
      setStep(&quot;phone&quot;);
      setPhone(&quot;&quot;);
      setOtp(&quot;&quot;);
      setFullName(&quot;&quot;);
      setEmail(&quot;&quot;);
      setError(&quot;&quot;);
      setLoading(false);
      setCountdown(0);
      setDevOtp(&quot;&quot;);
      setTimeout(() => phoneRef.current?.focus(), 50);
    }
  }, [loginModalOpen]);

  // Countdown timer
  const startCountdown = useCallback((seconds = 60) => {
    setCountdown(seconds);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!loginModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === &quot;Escape&quot;) closeLoginModal();
    };
    window.addEventListener(&quot;keydown&quot;, handler);
    return () => window.removeEventListener(&quot;keydown&quot;, handler);
  }, [loginModalOpen, closeLoginModal]);

  // ── Step 1: Send OTP ───────────────────────────────────────────────────────

  const handleSendOtp = async () => {
    setError(&quot;&quot;);
    const cleaned = phone.replace(/\s/g, &quot;&quot;);
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setError(&quot;Please enter a valid 10-digit Indian mobile number&quot;);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/request-otp`, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        body: JSON.stringify({ phone: `+91${cleaned}`, role: &quot;CUSTOMER&quot; }),
        signal: AbortSignal.timeout(10000),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? &quot;Failed to send OTP. Please try again.&quot;);
        return;
      }
      if (json.data?.devOtp) setDevOtp(json.data.devOtp);
      setStep(&quot;otp&quot;);
      startCountdown(60);
    } catch (err) {
      const message = err instanceof Error ? err.message : &quot;Network error&quot;;
      setError(message.includes(&quot;timeout&quot;) ? &quot;Request timed out. Check your connection.&quot; : &quot;Failed to send OTP. Please try again.&quot;);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────

  const handleVerifyOtp = async () => {
    setError(&quot;&quot;);
    if (otp.length !== 6) {
      setError(&quot;Please enter the complete 6-digit OTP&quot;);
      return;
    }
    setLoading(true);
    try {
      const cleaned = phone.replace(/\s/g, &quot;&quot;);
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        body: JSON.stringify({ phone: `+91${cleaned}`, otp }),
        signal: AbortSignal.timeout(10000),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? &quot;Invalid OTP. Please try again.&quot;);
        return;
      }

      // API returns `token` (not accessToken/refreshToken in phase 1)
      const token: string = json.data.token ?? json.data.accessToken;
      const isNew: boolean = json.data.isNewUser ?? json.data.user?.isNewUser ?? false;
      const userData = json.data.user;

      saveTokens(token);
      setAccessTokenTemp(token);
      setIsNewUser(isNew);

      if (isNew && !userData?.name) {
        setStep(&quot;profile&quot;);
        setTimeout(() => nameRef.current?.focus(), 50);
      } else {
        login(token, userData as AuthUser);
        closeLoginModal();
      }
    } catch {
      setError(&quot;Failed to verify OTP. Please try again.&quot;);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Profile completion ────────────────────────────────────────────

  const handleProfileSubmit = async () => {
    setError(&quot;&quot;);
    if (fullName.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters)");
      return;
    }
    setLoading(true);
    try {
      const body: Record<string, string> = { name: fullName.trim() };
      if (email.trim()) body.email = email.trim();

      const res = await fetch(`${API_BASE}/auth/me`, {
        method: &quot;PATCH&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
          Authorization: `Bearer ${accessTokenTemp}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? &quot;Failed to save profile. Please try again.&quot;);
        return;
      }
      login(accessTokenTemp, json.data?.user as AuthUser);
      closeLoginModal();
    } catch {
      setError(&quot;Failed to save profile. Please try again.&quot;);
    } finally {
      setLoading(false);
    }
  };

  // ── Skip profile step ─────────────────────────────────────────────────────

  const handleSkipProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${accessTokenTemp}` },
      });
      const json = await res.json();
      if (res.ok) login(accessTokenTemp, json.data?.user as AuthUser);
    } catch {
      // proceed even if fetch fails
    }
    closeLoginModal();
  };

  // ── Auto-submit OTP when all 6 digits are entered ─────────────────────────

  useEffect(() => {
    if (otp.length === 6 && step === &quot;otp&quot; && !loading) {
      handleVerifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  if (!loginModalOpen) return null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Login"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeLoginModal}
      />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600"
          onClick={closeLoginModal}
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <span
            className="material-symbols-outlined text-3xl text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            temple_hindu
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            HmarePanditJi
          </span>
        </div>

        {/* ── STEP 1: Phone ─────────────────────────────────────────────── */}
        {step === &quot;phone&quot; && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              Welcome back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-6">
              Enter your mobile number to continue
            </p>

            <label className="block text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Mobile Number
            </label>
            <div className="flex gap-2 mb-5">
              {/* +91 prefix */}
              <div className="flex items-center gap-1.5 px-5 h-12 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-medium text-lg flex-shrink-0">
                <span className="material-symbols-outlined text-base text-primary">phone</span>
                +91
              </div>
              <input
                ref={phoneRef}
                type="tel"
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  setError(&quot;&quot;);
                  setPhone(e.target.value.replace(/\D/g, &quot;&quot;).slice(0, 10));
                }}
                onKeyDown={(e) => {
                  if (e.key === &quot;Enter&quot;) handleSendOtp();
                }}
                placeholder="98765 43210"
                className="flex-1 h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-base font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                aria-label="Phone number"
              />
            </div>

            {error && (
              <p className="text-red-500 text-base mb-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </p>
            )}

            <button
              onClick={handleSendOtp}
              disabled={loading || phone.length !== 10}
              className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending OTP…
                </>
              ) : (
                <>
                  Send OTP
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </>
              )}
            </button>

            <p className="text-center text-base text-slate-400 mt-4">
              By continuing, you agree to our Terms of Service
            </p>
          </div>
        )}

        {/* ── STEP 2: OTP ───────────────────────────────────────────────── */}
        {step === &quot;otp&quot; && (
          <div>
            <button
              className="flex items-center gap-1 text-lg text-slate-500 hover:text-primary mb-4 transition-colors"
              onClick={() => { setStep(&quot;phone&quot;); setOtp(&quot;&quot;); setError(&quot;&quot;); }}
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Change number
            </button>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              Verify OTP
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-6">
              Enter the 6-digit code sent to{&quot; &quot;}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                +91 {phone.slice(0, 5)} {phone.slice(5)}
              </span>
            </p>

            <div className="mb-5">
              <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(&quot;&quot;); }} disabled={loading} />
            </div>

            {error && (
              <p className="text-red-500 text-base mb-4 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </p>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  Verify OTP
                  <span className="material-symbols-outlined text-base">check_circle</span>
                </>
              )}
            </button>

            <div className="text-center mt-4">
              {countdown > 0 ? (
                <p className="text-base text-slate-400">
                  Resend OTP in{&quot; &quot;}
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {countdown}s
                  </span>
                </p>
              ) : (
                <button
                  onClick={() => {
                    setOtp(&quot;&quot;);
                    setError(&quot;&quot;);
                    handleSendOtp();
                  }}
                  className="text-base text-primary font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Dev OTP display */}
            {process.env.NODE_ENV === &quot;development&quot; && devOtp && (
              <div className="mt-4 text-center bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3">
                <p className="text-base font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  DEV MODE — Your OTP
                </p>
                <button
                  type="button"
                  onClick={() => { setOtp(devOtp); }}
                  className="text-2xl font-black tracking-[0.3em] text-amber-800 dark:text-amber-300 hover:text-primary transition-colors"
                  title="Click to auto-fill"
                >
                  {devOtp}
                </button>
                <p className="text-[10px] text-amber-500 mt-1">Click the code to auto-fill</p>
              </div>
            )}
            {process.env.NODE_ENV === &quot;development&quot; && !devOtp && (
              <p className="mt-4 text-center text-base text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-5 py-2">
                Dev mode: OTP will appear here after sending
              </p>
            )}
          </div>
        )}

        {/* ── STEP 3: Profile Completion ────────────────────────────────── */}
        {step === &quot;profile&quot; && (
          <div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <span
                className="material-symbols-outlined text-2xl text-green-600 dark:text-green-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              Welcome!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-6">
              {isNewUser
                ? &quot;Complete your profile to get personalized recommendations&quot;
                : &quot;Your phone has been verified&quot;}
            </p>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-base text-slate-400">
                    person
                  </span>
                  <input
                    ref={nameRef}
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setError(&quot;&quot;); }}
                    onKeyDown={(e) => { if (e.key === &quot;Enter&quot;) handleProfileSubmit(); }}
                    placeholder="Ramesh Kumar"
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email{&quot; &quot;}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-base text-slate-400">
                    mail
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(&quot;&quot;); }}
                    onKeyDown={(e) => { if (e.key === &quot;Enter&quot;) handleProfileSubmit(); }}
                    placeholder="ramesh@example.com"
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-base mb-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </p>
            )}

            <button
              onClick={handleProfileSubmit}
              disabled={loading || fullName.trim().length < 2}
              className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  Complete Profile
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </>
              )}
            </button>

            <button
              onClick={handleSkipProfile}
              className="w-full mt-3 text-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-2"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
