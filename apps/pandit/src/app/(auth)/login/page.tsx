"use client";

// useSearchParams requires runtime rendering
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { hi } from "@/lib/strings";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { useVoice } from "@/hooks/useVoice";
import { useScreenVoice } from "@/hooks/useScreenVoice";
import { VoiceField } from "@/components/voice/VoiceField";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams?.get("next") || "";
  const { speak } = useVoice();

  // Navigation states
  const [step, setStep] = useState(1); // 1 = Phone Input, 2 = OTP Input
  const [phone, setPhone] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(30);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, countdown]);

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      setErrorMsg(hi.common.error);
      speak(hi.common.error);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const fullPhone = `+91${phone}`;
    const res = await api("/auth/otp/send", {
      method: "POST",
      body: JSON.stringify({ phone: fullPhone }),
    });

    setLoading(false);

    if (!res.success) {
      setErrorMsg(hi.common.error);
      speak(hi.common.error);
      return;
    }

    setStep(2);
    setCountdown(30);
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setLoading(true);
    setErrorMsg("");

    const fullPhone = `+91${phone}`;
    const res = await api("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({
        phone: fullPhone,
        otp: otpCode,
        role: "PANDIT",
      }),
    });

    setLoading(false);

    if (!res.success) {
      setErrorMsg(hi.common.error);
      speak(hi.common.error);
      return;
    }

    const { token, isNewUser, verificationStatus } = res.data;
    localStorage.setItem("pandit_token", token);

    // profile incomplete → continue where the caller wanted (?next=, default
    // /onboarding); complete → straight to /home
    if (isNewUser || verificationStatus === "PENDING") {
      router.push(nextParam && nextParam.startsWith("/") ? nextParam : "/onboarding");
    } else {
      router.push("/home");
    }
  };

  // Auto-verify once 6 digits are in (typed via keyboard fallback)
  useEffect(() => {
    if (step === 2 && otpValue.length === 6 && !loading) {
      handleVerifyOtp(otpValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpValue, step]);

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setOtpValue("");
    await handleSendOtp();
  };

  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col justify-between">
      <Header
        title={hi.welcome.title}
        showBack={step === 2}
        onBack={() => {
          setStep(1);
          setOtpValue("");
          setErrorMsg("");
        }}
      />

      {/* Main card viewport container */}
      <main className="flex-grow flex flex-col justify-start px-4 pt-8 max-w-[430px] mx-auto w-full gap-6">
        {step === 1 ? (
          <>
            <div className="bg-white rounded-card shadow-card p-5 flex flex-col gap-4">
              <VoiceField
                label={hi.auth.phoneLabel}
                promptText={hi.auth.phoneVoice}
                value={phone}
                onChange={setPhone}
                mode="phone"
                onComplete={handleSendOtp}
                placeholder="XXXXXXXXXX"
              />
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleSendOtp}
                loading={loading}
              >
                {hi.common.next}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Screen 2: OTP — typed-only by law (A5); the app speaks why once */}
            <div className="bg-white rounded-card shadow-card p-5 flex flex-col gap-4">
              <OtpBoxes value={otpValue} onChange={setOtpValue} />

              {/* Resend Link countdown timer */}
              <div className="text-center mt-2">
                {countdown > 0 ? (
                  <span className="t-hint text-softgrey font-medium">
                    {hi.auth.otpResend} ({countdown}s)
                  </span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="text-saffron-600 hover:text-saffron-700 underline font-semibold text-[18px]"
                    style={{ minHeight: "56px", fontSize: "18px" }}
                  >
                    {hi.auth.otpResend}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Display validation or generic API errors */}
        {errorMsg && (
          <div className="px-4 py-2 bg-red-50 rounded-card border border-danger/20">
            <p className="text-danger text-[20px] font-semibold text-center leading-normal">
              {errorMsg}
            </p>
          </div>
        )}
      </main>

      {/* शिष्य footer slot (login's CTA lives inline in the card) */}
      <footer className="shrink-0 px-4 py-2 bg-cream/95 backdrop-blur border-t border-saffron-100 flex justify-center">
        <ShishyaOrb />
      </footer>
    </div>
  );
}

// A5: OTP is typed-only — the mic never arms here. The app explains why
// once (spoken on mount), then it behaves as six plain boxes.
function OtpBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  useScreenVoice(hi.auth.otpVoice);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  const setDigit = (d: string, idx: number) => {
    const numeric = d.replace(/\D/g, "");
    const chars = digits.slice();
    chars[idx] = numeric.slice(-1);
    onChange(chars.join(""));
    if (numeric && idx < 5) refs.current[idx + 1]?.focus();
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="t-title font-bold text-temple-600">{hi.auth.otpLabel}</h2>
      <div className="flex gap-2 justify-center my-2">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => setDigit(e.target.value, idx)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digit && idx > 0) {
                const chars = digits.slice();
                chars[idx - 1] = "";
                onChange(chars.join(""));
                refs.current[idx - 1]?.focus();
              }
            }}
            className="w-[48px] h-[56px] min-h-[56px] text-center border-2 border-saffron-300 rounded-btn text-[24px] font-bold text-ink bg-white focus:outline-none focus:border-saffron-500 focus:ring-4 focus:ring-saffron-200 transition-all"
          />
        ))}
      </div>
    </div>
  );
}
