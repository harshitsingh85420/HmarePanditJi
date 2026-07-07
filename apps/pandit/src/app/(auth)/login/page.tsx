"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { hi } from "@/lib/strings";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { useVoice } from "@/hooks/useVoice";
import { VoiceField } from "@/components/voice/VoiceField";

export default function LoginPage() {
  const router = useRouter();
  const { speak } = useVoice();

  // Navigation states
  const [step, setStep] = useState(1); // 1 = Phone Input, 2 = OTP Input
  const [phone, setPhone] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(30);

  const otpValueRef = useRef("");
  useEffect(() => {
    otpValueRef.current = otpValue;
  }, [otpValue]);

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

    // if isNewUser or profile incomplete (verificationStatus is PENDING) -> redirect /onboarding, else -> /home
    if (isNewUser || verificationStatus === "PENDING") {
      router.push("/onboarding");
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
            {/* Screen 2: OTP verification — voice-first, keyboard only on demand */}
            <div className="bg-white rounded-card shadow-card p-5 flex flex-col gap-4">
              <VoiceField
                label={hi.auth.otpLabel}
                promptText={hi.auth.otpVoice}
                value={otpValue}
                onChange={(v) => setOtpValue(v.replace(/\D/g, "").slice(0, 6))}
                mode="otp"
                onComplete={() => {
                  if (otpValueRef.current.length === 6) {
                    handleVerifyOtp(otpValueRef.current);
                  }
                }}
                placeholder="XXXXXX"
              />

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
    </div>
  );
}
