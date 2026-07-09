"use client";

// useSearchParams requires runtime rendering
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { t } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { useVoice } from "@/hooks/useVoice";
import { useScreenVoice } from "@/hooks/useScreenVoice";
import { VoiceField } from "@/components/voice/VoiceField";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { DiyaLoader } from "@/components/moments/DiyaLoader";
import { useSafeOnboardingStore } from "@/lib/stores/ssr-safe-stores";
import { voiceController } from "@/lib/voiceController";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams?.get("next") || "";
  const { speak, stop } = useVoice();
  const store = useSafeOnboardingStore();

  // B: reached from the tutorial CTA (entry-flow context) — the labeled
  // "ट्यूटोरियल फिर देखें" button (and hardware back) returns to the
  // TUTORIAL phase at slide 1: he wants to re-learn, not resume the CTA.
  const fromEntryFlow = nextParam.startsWith("/onboarding");
  const backToTutorial = () => {
    stop();
    // D2 REVIEW INTENT: outranks the orchestrator's resume rules (which
    // would otherwise see tutorialCompleted → AUTH and bounce right back
    // here — a visible no-op). Back from the review returns HERE.
    try {
      sessionStorage.setItem("hpj_review_return", window.location.pathname + window.location.search);
    } catch { /* noop */ }
    store.setCurrentTutorialScreen(1);
    store.setPhase("TUTORIAL");
    router.push("/onboarding?review=tutorial");
  };

  // Navigation states
  const [step, setStep] = useState(1); // 1 = Phone Input, 2 = OTP Input
  const [phone, setPhone] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [accountExists, setAccountExists] = useState<boolean | null>(null);
  // D1: Render cold start can take ~65s — after 4s of pending, शिष्य says
  // the server is waking and a diya burns inline so silence never reads
  // as "broken".
  const [waking, setWaking] = useState(false);

  // F4: a re-auth on the way to a booking gets a reassuring शिष्य line
  const reauthForBooking = nextParam.startsWith("/bookings");
  useEffect(() => {
    if (reauthForBooking && step === 1) speak(t("auth.reauthForBooking"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // B: hardware/gesture back in entry-flow context goes to the tutorial
  // (slide 1) — same destination as the labeled button. Outside the
  // entry flow, untouched.
  useEffect(() => {
    if (!fromEntryFlow) return;
    try {
      window.history.pushState({ hpjLogin: true }, "", window.location.href);
    } catch { /* noop */ }
    const onPop = () => {
      backToTutorial();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromEntryFlow]);

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
      setErrorMsg(t("common.error"));
      speak(t("common.error"));
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const fullPhone = `+91${phone}`;
    const wakeTimer = setTimeout(() => {
      setWaking(true);
      voiceController.speak(t("auth.waking"));
    }, 4000);
    const res = await api("/auth/otp/send", {
      method: "POST",
      body: JSON.stringify({ phone: fullPhone }),
      timeoutMs: 75000,
    });
    clearTimeout(wakeTimer);
    setWaking(false);
    voiceController.debug(`auth send → ${res.success ? "ok" : `err:${res.error?.code || res.error?.message}`}`);

    setLoading(false);

    if (!res.success) {
      const rateLimited = res.error?.code === "rate_limit_exceeded";
      const msg = rateLimited ? t("auth.rateLimited") : t("common.error");
      setErrorMsg(msg);
      speak(msg);
      return;
    }

    // F1(b): the OTP screen greets returning pandits differently.
    // G3b: no pre-navigation speak here — the OTP step's mount narration
    // (branded greeting + OTP instruction) carries the voice; a line
    // spoken now would be interrupted within ~1s by that mount narration
    // (the live-QA 'speak-interrupt at auth send ok' cluster).
    const exists = res.data?.accountExists === true;
    setAccountExists(exists);
    setStep(2);
    setCountdown(30);
  };

  // G4b: WebOTP — the browser offers to read the OTP SMS and hand the
  // code over. Feature-detected; silent no-op everywhere unsupported.
  // Aborts on unmount, on manual entry, and after 60s.
  const webotpAbortRef = useRef<AbortController | null>(null);
  const webotpFilledRef = useRef(false);
  const webotpSupported = typeof window !== "undefined" && "OTPCredential" in window;
  useEffect(() => {
    if (step !== 2) return;
    if (!webotpSupported) {
      voiceController.debug("webotp: unsupported");
      return;
    }
    const ac = new AbortController();
    webotpAbortRef.current = ac;
    const timer = setTimeout(() => ac.abort(), 60000);
    voiceController.debug("webotp: listening");
    void (
      navigator.credentials.get as (o?: unknown) => Promise<{ code?: string } | null>
    )({ otp: { transport: ["sms"] }, signal: ac.signal })
      .then((cred) => {
        const code = String(cred?.code || "").replace(/\D/g, "").slice(0, 6);
        if (code.length !== 6) return;
        voiceController.debug("webotp: filled");
        webotpFilledRef.current = true;
        setOtpValue(code);
      })
      .catch(() => {
        voiceController.debug("webotp: aborted");
      });
    return () => {
      clearTimeout(timer);
      ac.abort();
      webotpAbortRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Manual typing takes over: stop listening for the SMS immediately.
  const handleOtpChange = (v: string) => {
    if (!webotpFilledRef.current && v !== otpValue) webotpAbortRef.current?.abort();
    setOtpValue(v);
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setLoading(true);
    setErrorMsg("");

    const fullPhone = `+91${phone}`;
    const wakeTimer = setTimeout(() => {
      setWaking(true);
      voiceController.speak(t("auth.waking"));
    }, 4000);
    const res = await api("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({
        phone: fullPhone,
        otp: otpCode,
        role: "PANDIT",
      }),
      timeoutMs: 75000,
    });
    clearTimeout(wakeTimer);
    setWaking(false);
    voiceController.debug(`auth verify → ${res.success ? "ok" : `err:${res.error?.code || res.error?.message}`}`);

    setLoading(false);

    if (!res.success) {
      setErrorMsg(t("common.error"));
      speak(t("common.error"));
      return;
    }

    const { token, profileComplete, isNewUser } = res.data;
    localStorage.setItem("pandit_token", token);
    // the route middleware gates on this cookie — set it at login,
    // cleared on logout (settings)
    document.cookie = `hpj_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;

    // F1(c) ROUTING LAW: a finished pandit is NEVER re-onboarded.
    //   profile complete   → ?next= destination, else /home
    //                        (PENDING shows the amber banner there)
    //   profile incomplete → FLOW C minimal registration (name + city)
    if (profileComplete) {
      router.push(nextParam && nextParam.startsWith("/") ? nextParam : "/home");
    } else {
      // X5: an existing-but-incomplete account gets "प्रोफ़ाइल पूरी करें"
      // on the next screen — no "account exists → registration" whiplash
      try {
        sessionStorage.setItem("hpj_returning_incomplete", isNewUser === false ? "1" : "0");
      } catch {
        /* noop */
      }
      router.push("/onboarding");
    }
  };

  // Auto-verify once 6 digits are in. G4b: a WebOTP fill stays VISIBLE
  // for 400ms before submitting (the pandit sees the boxes fill);
  // manual entry submits immediately as before.
  useEffect(() => {
    if (!(step === 2 && otpValue.length === 6 && !loading)) return;
    const delay = webotpFilledRef.current ? 400 : 0;
    const timerId = setTimeout(() => handleVerifyOtp(otpValue), delay);
    return () => clearTimeout(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpValue, step]);

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setOtpValue("");
    await handleSendOtp();
  };

  return (
    <div className="h-[100dvh] bg-cream text-ink flex flex-col max-w-[430px] mx-auto w-full">
      {/* B: entry-flow context gets NO top-left arrow — the labeled
          tutorial button below is the way back. The OTP step keeps its
          arrow (edit the number), as does re-auth outside the flow. */}
      <Header
        title={t("auth.unifiedTitle")}
        festive
        showBack={step === 2}
        onBack={() => {
          setStep(1);
          setOtpValue("");
          setErrorMsg("");
        }}
      />

      {/* D1: server-waking indicator (Render cold start) */}
      {waking && <DiyaLoader inline message={t("auth.waking")} />}

      {/* Main card viewport container */}
      <main className="flex-1 min-h-0 overflow-y-auto flex flex-col justify-start px-4 pt-8 w-full gap-6">
        {step === 1 ? (
          <>
            {reauthForBooking && (
              <div className="px-4 py-3 bg-gold/15 border border-gold rounded-card">
                <p className="text-[18px] text-temple-600 font-hindi leading-snug">
                  🙏 {t("auth.reauthForBooking")}
                </p>
              </div>
            )}
            {/* D5: unified screen — one number field, the account decides */}
            <p className="t-body text-temple-600 font-hindi text-center leading-snug">
              {t("auth.unifiedSub")}
            </p>
            <div className="bg-white rounded-card shadow-card p-5 flex flex-col gap-4">
              <VoiceField
                label={t("auth.phoneLabel")}
                promptText={
                  fromEntryFlow
                    ? `${t("auth.unifiedSub")} ${t("auth.reviewTutorialVoice")}`
                    : t("auth.unifiedSub")
                }
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
                {t("common.next")}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Screen 2: OTP — typed-only by law (A5); the app speaks why once */}
            <div className="bg-white rounded-card shadow-card p-5 flex flex-col gap-4">
              {accountExists !== null && (
                <div className="flex flex-col gap-1">
                  <h2 className="text-[22px] font-bold text-temple-600 font-hindi leading-snug">
                    {accountExists ? t("auth.returningTitle") : t("auth.newAccountTitle")}
                  </h2>
                  <p className="t-hint text-softgrey font-hindi">
                    {accountExists ? t("auth.returningShishya") : t("auth.newAccountShishya")}
                  </p>
                </div>
              )}
              <OtpBoxes
                value={otpValue}
                onChange={handleOtpChange}
                // G3b: the destination carries the voice — branded greeting
                // + instruction + (when the browser can auto-fill) the
                // WebOTP guidance, all in ONE mount narration. The guidance
                // line is skipped in OTP dev mode (no real SMS arrives).
                narration={[
                  accountExists ? t("auth.returningShishya") : t("auth.newAccountShishya"),
                  t("auth.otpVoice"),
                  webotpSupported && process.env.NEXT_PUBLIC_OTP_DEV_MODE !== "true"
                    ? t("auth.webotpVoice")
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />

              {/* Resend Link countdown timer */}
              <div className="text-center mt-2">
                {countdown > 0 ? (
                  <span className="t-hint text-softgrey font-medium">
                    {t("auth.otpResend")} ({countdown}s)
                  </span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="text-saffron-600 hover:text-saffron-700 underline font-semibold text-[18px]"
                    style={{ minHeight: "56px", fontSize: "18px" }}
                  >
                    {t("auth.otpResend")}
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

      {/* शिष्य footer slot (login's CTA lives inline in the card).
          B: entry-flow context docks the labeled tutorial-return button
          here — the arrow-less way back for a first-time pandit. */}
      <footer className="shrink-0 px-4 py-2 bg-cream/95 backdrop-blur border-t border-saffron-100 flex items-end gap-3">
        {fromEntryFlow && step === 1 ? (
          <>
            <div className="flex-1">
              <Button variant="secondary" size="md" fullWidth onClick={backToTutorial}>
                {t("auth.reviewTutorial")}
              </Button>
            </div>
            <ShishyaOrb />
          </>
        ) : (
          <div className="flex-1 flex justify-center">
            <ShishyaOrb />
          </div>
        )}
      </footer>
    </div>
  );
}

// A5: OTP is typed-only — the mic never arms here. The app explains why
// once (spoken on mount), then it behaves as six plain boxes.
function OtpBoxes({
  value,
  onChange,
  narration,
}: {
  value: string;
  onChange: (v: string) => void;
  narration: string;
}) {
  useScreenVoice(narration);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  const setDigit = (d: string, idx: number) => {
    const numeric = d.replace(/\D/g, "");
    // G4a: keychain/keyboard suggestions and paste deliver the WHOLE code
    // into one box — distribute from that box onward.
    if (numeric.length > 1) {
      const chars = digits.slice();
      for (let j = 0; j < numeric.length && idx + j < 6; j++) chars[idx + j] = numeric[j];
      onChange(chars.join(""));
      refs.current[Math.min(5, idx + numeric.length)]?.focus();
      return;
    }
    const chars = digits.slice();
    chars[idx] = numeric.slice(-1);
    onChange(chars.join(""));
    if (numeric && idx < 5) refs.current[idx + 1]?.focus();
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="t-title font-bold text-temple-600">{t("auth.otpLabel")}</h2>
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
            // G4a: the FOCUSED box carries one-time-code so Chrome's SMS
            // suggestion and the iOS keychain offer the fill; maxLength
            // stays off box 1 so a whole-code fill arrives intact for the
            // distribution logic above.
            autoComplete={idx === 0 ? "one-time-code" : "off"}
            name={idx === 0 ? "otp" : undefined}
            maxLength={idx === 0 ? 6 : 1}
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
