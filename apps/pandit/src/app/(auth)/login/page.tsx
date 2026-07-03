"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { hi } from "@/lib/strings";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { SpeakOnMount } from "@/components/VoiceBar";
import { useVoice } from "@/hooks/useVoice";

export default function LoginPage() {
  const router = useRouter();
  const { speak } = useVoice();

  // Navigation states
  const [step, setStep] = useState(1); // 1 = Phone Input, 2 = OTP Input
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(30);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

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

  const handleOtpChange = (value: string, index: number) => {
    const numericValue = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = numericValue.slice(-1);
    setOtp(newOtp);

    // Auto-advance focus
    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 boxes are filled
    const completeOtp = newOtp.join("");
    if (completeOtp.length === 6) {
      handleVerifyOtp(completeOtp);
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setOtp(["", "", "", "", "", ""]);
    await handleSendOtp();
  };

  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col justify-between">
      <Header
        title={hi.welcome.title}
        showBack={step === 2}
        onBack={() => {
          setStep(1);
          setOtp(["", "", "", "", "", ""]);
          setErrorMsg("");
        }}
      />

      {/* Main card viewport container */}
      <main className="flex-grow flex flex-col justify-start px-4 pt-8 max-w-[430px] mx-auto w-full gap-6">
        {step === 1 ? (
          <>
            {/* Screen 1: Phone input */}
            <SpeakOnMount text={hi.auth.phoneVoice} />

            <div className="bg-white rounded-card shadow-card p-5 flex flex-col gap-4">
              <h2 className="t-title font-bold text-temple-600">
                {hi.auth.phoneLabel}
              </h2>

              <div className="flex items-center bg-white border-2 border-saffron-300 rounded-btn px-4 focus-within:ring-4 focus-within:ring-saffron-200 focus-within:border-saffron-500 transition-all">
                <span className="text-[18px] font-bold text-ink pr-3 border-r border-saffron-200 mr-3 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="bg-transparent border-none outline-none flex-grow h-[56px] text-[18px] font-bold text-ink"
                  placeholder="XXXXXXXXXX"
                  style={{ minHeight: "56px", fontSize: "18px" }}
                />
              </div>

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
            {/* Screen 2: OTP verification */}
            <SpeakOnMount text={hi.auth.otpVoice} />

            <div className="bg-white rounded-card shadow-card p-5 flex flex-col gap-4">
              <h2 className="t-title font-bold text-temple-600">
                {hi.auth.otpLabel}
              </h2>

              {/* 6 large OTP boxes */}
              <div className="flex gap-2 justify-center my-4">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    className="w-[48px] h-[56px] text-center border-2 border-saffron-300 rounded-btn text-[24px] font-bold text-ink bg-white focus:outline-none focus:border-saffron-500 focus:ring-4 focus:ring-saffron-200 transition-all"
                    style={{ width: "48px", height: "56px" }}
                  />
                ))}
              </div>

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
