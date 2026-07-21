"use client";

// useSearchParams requires runtime rendering
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef } from "react";
import { setToken } from "@/lib/safeStorage";
import { useRouter, useSearchParams } from "next/navigation";
import { t } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { useVoice } from "@/hooks/useVoice";
import { useScreenVoice } from "@/hooks/useScreenVoice";
import { useVoiceCommands } from "@/hooks/useVoiceScreen";
import { BACK } from "@/lib/voiceGrammar";
import { VoiceField } from "@/components/voice/VoiceField";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { DiyaLoader } from "@/components/moments/DiyaLoader";
import { useSafeOnboardingStore } from "@/lib/stores/ssr-safe-stores";
import { voiceController } from "@/lib/voiceController";
import { prefetchDashboardNarrations } from "@/lib/dashboardPrefetch";

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
    setToken(token);
    // the route middleware gates on this cookie — set it at login,
    // cleared on logout (settings)
    document.cookie = `hpj_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;

    // K3: completing the OTP IS the pandit navigating — silence the OTP
    // narration under a user-nav reason BEFORE the route change so the
    // teardown never reads as a mid-utterance cut. Typed digits leave no
    // pointerdown (virtual keyboards don't reach the page) and the
    // verify round-trip can outlive any gesture window — the name-based
    // whitelist is the latency-immune classification.
    voiceController.stopSpeech("user-nav:otp-verified");

    // F1(c) ROUTING LAW: a finished pandit is NEVER re-onboarded.
    //   profile complete   → ?next= destination, else /home
    //                        (PENDING shows the amber banner there)
    //   profile incomplete → FLOW C minimal registration (name + city)
    if (profileComplete) {
      voiceController.stopSpeech("user-flow:otp-verify");
      prefetchDashboardNarrations(); // Q10: warm home/tabs/readiness lines
      router.push(nextParam && nextParam.startsWith("/") ? nextParam : "/home");
    } else {
      // X5: an existing-but-incomplete account gets "प्रोफ़ाइल पूरी करें"
      // on the next screen — no "account exists → registration" whiplash
      try {
        sessionStorage.setItem("hpj_returning_incomplete", isNewUser === false ? "1" : "0");
      } catch {
        /* noop */
      }
      voiceController.stopSpeech("user-flow:otp-verify");
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

  // J2: step 1 — the phone VoiceField is the listen target (field-first);
  // "ट्यूटोरियल" walks back to the tutorial in entry-flow context.
  useVoiceCommands(
    [{ keywords: ["ट्यूटोरियल", "tutorial", "ट्यूटोरिअल"], action: backToTutorial }],
    t("help.login"),
    fromEntryFlow && step === 1,
  );

  // J2: step 2 — the OTP DIGITS stay typed-only (A5), but the screen
  // still answers commands: भेजो resends, पीछे edits the number.
  useVoiceCommands(
    [
      {
        keywords: ["भेजो", "resend", "नहीं आया", "nahi aaya"],
        action: () => void handleResendOtp(),
      },
      {
        keywords: BACK,
        action: () => {
          setStep(1);
          setOtpValue("");
          setErrorMsg("");
        },
      },
    ],
    t("help.otp"),
    step === 2,
  );

  return (
    <div className="h-[100dvh] bg-cream text-ink flex flex-col max-w-[430px] mx-auto w-full">
      {/* B: entry-flow context gets NO top-left arrow — the labeled
          tutorial button below is the way back. The OTP step keeps its
          arrow (edit the number), as does re-auth outside the flow. */}
      <Header
        title={
          step === 2 ? (
            // canon frame 7: "OTP सत्यापन" 19/800 (canon-A rows are 900)
            <span className="font-extrabold">{t("auth.otpTitle")}</span>
          ) : (
            t("auth.unifiedTitle")
          )
        }
        backTone="peach"
        showBack={step === 2}
        onBack={() => {
          setStep(1);
          setOtpValue("");
          setErrorMsg("");
        }}
      />

      {/* D1: server-waking indicator (Render cold start). H2: the slot is
          RESERVED from mount — its appearance never reflows the screen
          (content inserted above the CTA used to shift it mid-tap). */}
      <div className="min-h-[48px] shrink-0 flex items-center justify-center">
        {waking && <DiyaLoader inline message={t("auth.waking")} />}
      </div>

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
            <div className="bg-card rounded-[16px] shadow-card p-5 flex flex-col gap-4">
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
                placeholder="98765 43210"
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
            {/* Screen 2: OTP — typed-only by law (A5); the app speaks why once.
                canon frame 7: content sits DIRECTLY on the cream field. */}
            <div className="flex flex-col gap-[14px] px-[6px]">
              {accountExists !== null && (
                <div className="flex flex-col gap-1 text-center">
                  {/* canon frame 7 heading is 19px/800 #341A13; Ruling #2's
                      18px body floor applies to this vocabulary line, so it
                      renders at 22px/800 — colour/weight stay canon-exact. */}
                  <h2 className="text-[22px] font-extrabold text-temple-700 font-hindi leading-snug">
                    {accountExists ? t("auth.returningTitle") : t("auth.newAccountTitle")}
                  </h2>
                  <p className="text-[18px] font-semibold text-softgrey font-hindi leading-snug">
                    {accountExists ? t("auth.returningShishya") : t("auth.newAccountShishya")}
                  </p>
                </div>
              )}
              <OtpBoxes
                value={otpValue}
                onChange={handleOtpChange}
                sentTo={phone}
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

              {/* Resend link — mockup frame 7: softgrey label · saffron 00:SS */}
              <div className="text-center mt-2">
                {countdown > 0 ? (
                  <span className="text-[18px] font-bold text-softgrey font-hindi">
                    {t("auth.otpResend")}{" "}
                    <span className="text-saffron-500 font-bold">
                      00:{String(countdown).padStart(2, "0")}
                    </span>
                  </span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="text-saffron-500 hover:text-saffron-600 underline font-bold text-[18px]"
                    style={{ minHeight: "56px", fontSize: "18px" }}
                  >
                    {t("auth.otpResend")}
                  </button>
                )}
              </div>

              {/* canon frame 7: the on-screen keypad — 3×4 grid pinned to the
                  bottom of the column (margin-top:auto). Digit keys 58px min
                  (above the 52px floor), 1.5px sand-100 hairline, r16, card
                  fill, 28/800 ink; backspace borderless #F0E6D3. The boxes
                  keep inputMode=none so the system keyboard stays down —
                  WebOTP auto-fill and paste distribution survive; the
                  keyboard-accessory code suggestion (G4a) is traded for the
                  canon keypad (flagged). */}
              <div className="grid grid-cols-3 gap-[10px] mt-auto pt-2" aria-label="अंक">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                  <button
                    key={d}
                    onClick={() => otpValue.length < 6 && handleOtpChange(otpValue + d)}
                    className="min-h-[58px] border-[1.5px] border-sand-100 rounded-[16px] bg-card text-[28px] font-extrabold text-temple-700 active:scale-95 transition-transform"
                  >
                    {d}
                  </button>
                ))}
                <div aria-hidden="true" />
                <button
                  onClick={() => otpValue.length < 6 && handleOtpChange(otpValue + "0")}
                  className="min-h-[58px] border-[1.5px] border-sand-100 rounded-[16px] bg-card text-[28px] font-extrabold text-temple-700 active:scale-95 transition-transform"
                >
                  0
                </button>
                <button
                  onClick={() => handleOtpChange(otpValue.slice(0, -1))}
                  aria-label={t("common.back")}
                  className="min-h-[58px] rounded-[16px] flex items-center justify-center active:scale-95 transition-transform"
                  style={{ background: "#F0E6D3" }}
                >
                  <span className="material-symbols-outlined text-[26px] leading-none text-saffron-700" aria-hidden="true">backspace</span>
                </button>
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

// A5/J2: the OTP DIGITS are typed-only — no VoiceField, no digit
// dictation; the app explains why once (spoken on mount). The screen
// LOOP still listens between narrations, but only for commands
// (भेजो / पीछे / the global grammar) registered by the page above.
function OtpBoxes({
  value,
  onChange,
  narration,
  sentTo,
}: {
  value: string;
  onChange: (v: string) => void;
  narration: string;
  sentTo: string;
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
      {/* CANON frame 11: centred block — "OTP डालिए" 26/900 #341A13,
          sent-to line 600 #8A6F5C, 6px below. */}
      <div className="text-center">
        <h2 className="text-[26px] font-black text-temple-700 font-hindi leading-snug">
          {t("auth.otpLabel")}
        </h2>
        {/* LAW: canon sets this line at 16px; the 18sp floor wins. */}
        <div className="text-[18px] font-semibold text-softgrey font-hindi mt-[6px] leading-snug">
          {t("auth.otpSentTo").replace("{phone}", sentTo.length === 10 ? sentTo.slice(0, 5) + " " + sentTo.slice(5) : sentTo)}
        </div>
      </div>
      <div className="flex gap-2 justify-center my-[6px]">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            type="tel"
            inputMode="none"
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
            // CANON frame 7: box 62×72, radius 16, border 2.5px, digit
            // 36px/900 (frame 7's dominant type). A FILLED box is
            // #FDEEE7 fill + #B23A1A border +
            // #7A250E digit (saffron-50/500/700); an EMPTY box is #FFFDF8
            // on the #E7DCC9 hairline (card / sand-200), and carries the
            // sindoor caret canon draws inside the active box.
            // Six boxes cannot each be 62px on a 360px screen, so they
            // share the row (flex-1) and cap at canon's 62px on wider ones.
            className={`flex-1 min-w-0 max-w-[62px] h-[72px] text-center rounded-[16px] border-[2.5px] text-[36px] font-black caret-saffron-500 transition-all focus:outline-none focus:border-saffron-500 focus:ring-4 focus:ring-saffron-200 ${
              digit
                ? "bg-saffron-50 border-saffron-500 text-saffron-700"
                : "bg-card border-sand-200 text-ink"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
