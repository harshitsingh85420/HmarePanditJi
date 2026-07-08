"use client";

// ─────────────────────────────────────────────────────────────
// Voice-first entry ORCHESTRATOR.
// Phase machine (persisted in the onboarding store):
//   SPLASH → LANGUAGE_* → LOCATION (grant→coords / deny→city) →
//   MIC (deny→spoken recovery) → TUTORIAL (12 slides, resumable) →
//   AUTH (/login?next=/onboarding) → WIZARD (<ProfileWizard/>).
// Screens are the existing onboarding/screens/* components, wired with
// their exact prop signatures.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSafeOnboardingStore } from "@/lib/stores/ssr-safe-stores";
import { useScreenVoice } from "@/hooks/useScreenVoice";
import { voiceController } from "@/lib/voiceController";
import { api } from "@/lib/api";
import { hi } from "@/lib/strings";
import {
  TUTORIAL_PHASE_ORDER,
  TUTORIAL_PHASE_TO_DOT,
  detectLanguageFromCity,
  type OnboardingPhase,
} from "@/lib/onboarding-store";

import LanguageConfirmScreen from "./screens/LanguageConfirmScreen";
import LanguageListScreen from "./screens/LanguageListScreen";
import LanguageChoiceConfirmScreen from "./screens/LanguageChoiceConfirmScreen";
import LanguageSetScreen from "./screens/LanguageSetScreen";
import LocationPermissionScreen from "./screens/LocationPermissionScreen";
import ManualCityScreen from "./screens/ManualCityScreen";
import MicPermissionScreen from "./screens/MicPermissionScreen";
import MicDeniedRecoveryScreen from "./screens/MicDeniedRecoveryScreen";
import TutorialSwagat from "./screens/tutorial/TutorialSwagat";
import TutorialIncome from "./screens/tutorial/TutorialIncome";
import TutorialDakshina from "./screens/tutorial/TutorialDakshina";
import TutorialOnlineRevenue from "./screens/tutorial/TutorialOnlineRevenue";
import TutorialBackup from "./screens/tutorial/TutorialBackup";
import TutorialPayment from "./screens/tutorial/TutorialPayment";
import TutorialVoiceNav from "./screens/tutorial/TutorialVoiceNav";
import TutorialDualMode from "./screens/tutorial/TutorialDualMode";
import TutorialTravel from "./screens/tutorial/TutorialTravel";
import TutorialVideoVerify from "./screens/tutorial/TutorialVideoVerify";
import TutorialGuarantees from "./screens/tutorial/TutorialGuarantees";
import TutorialCTA from "./screens/tutorial/TutorialCTA";
import ProfileWizard from "./ProfileWizard";

const TUTORIAL_COMPONENTS = [
  TutorialSwagat,
  TutorialIncome,
  TutorialDakshina,
  TutorialOnlineRevenue,
  TutorialBackup,
  TutorialPayment,
  TutorialVoiceNav,
  TutorialDualMode,
  TutorialTravel,
  TutorialVideoVerify,
  TutorialGuarantees,
  TutorialCTA,
] as const;

// ── Splash (minimal inline, per spec) ────────────────────────
function SplashScreen2({ onDone }: { onDone: () => void }) {
  useScreenVoice(hi.welcomeFlow.welcome);
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <main
      onClick={onDone}
      className="min-h-dvh w-full max-w-[430px] mx-auto bg-cream flex flex-col items-center justify-center gap-4 cursor-pointer"
    >
      <span className="text-[96px] leading-none text-saffron-500 select-none" aria-hidden="true">🕉</span>
      <h1 className="t-hero text-center">हमारे पंडित जी</h1>
      <p className="t-body text-softgrey font-hindi text-center px-8">
        ऐप पंडित के लिए है, पंडित ऐप के लिए नहीं
      </p>
    </main>
  );
}

// ── Gentle stay-state after "बाद में" on the CTA ─────────────
function LaterStayScreen({ onRegister }: { onRegister: () => void }) {
  useScreenVoice("कोई बात नहीं पंडित जी। जब मन बने, नीचे बटन दबाकर पंजीकरण करें। हम यहीं हैं।");
  return (
    <main className="min-h-dvh w-full max-w-[430px] mx-auto bg-cream flex flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="text-[72px]" aria-hidden="true">🙏</span>
      <h1 className="t-title font-bold">जब आप तैयार हों</h1>
      <p className="t-body text-softgrey font-hindi">
        आपकी जानकारी सुरक्षित है। पंजीकरण में सिर्फ़ दस मिनट लगते हैं — बिल्कुल मुफ़्त।
      </p>
      <button
        onClick={onRegister}
        className="w-full min-h-[64px] bg-saffron-500 text-[#FFF3EA] rounded-btn text-[20px] font-bold shadow-btn active:scale-[0.97] transition-transform"
      >
        पंजीकरण शुरू करें →
      </button>
    </main>
  );
}

// ── Orchestrator ─────────────────────────────────────────────
export default function OnboardingOrchestratorPage() {
  const router = useRouter();
  const store = useSafeOnboardingStore();
  const [resumeChecked, setResumeChecked] = useState(false);
  const [showLaterState, setShowLaterState] = useState(false);

  const { phase, selectedLanguage, scriptPreference, detectedCity } = store;

  // ── Mount resume rules ─────────────────────────────────────
  useEffect(() => {
    const run = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("pandit_token") : null;
      if (token) {
        // token exists → profile decides: incomplete → WIZARD, complete → /home
        const me = await api("/auth/me");
        const status = me.success ? me.data?.user?.panditProfile?.verificationStatus : null;
        const complete = me.success && status && status !== "PENDING";
        if (complete) {
          router.replace("/home");
          return;
        }
        // fetch failure or incomplete profile → wizard
        store.setPhase("WIZARD");
      } else if (store.tutorialCompleted) {
        // tutorial done but never logged in → straight to auth
        store.setPhase("AUTH");
      }
      // else: stay wherever the persisted phase points (incl. mid-tutorial)
      setResumeChecked(true);
    };
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── AUTH phase: hand over to /login and come back ──────────
  useEffect(() => {
    if (resumeChecked && phase === "AUTH") {
      router.push("/login?next=/onboarding");
    }
  }, [resumeChecked, phase, router]);

  if (!resumeChecked) {
    return (
      <div className="min-h-dvh bg-cream flex items-center justify-center">
        <span className="text-[48px] animate-pulse" aria-hidden="true">🪔</span>
      </div>
    );
  }

  const goto = (p: OnboardingPhase) => {
    voiceController.stopSpeech();
    store.setPhase(p);
  };

  // ── LANGUAGE cluster ───────────────────────────────────────
  if (phase === "SPLASH") {
    return <SplashScreen2 onDone={() => goto("LANGUAGE_CONFIRM")} />;
  }

  if (phase === "LANGUAGE_CONFIRM") {
    return (
      <LanguageConfirmScreen
        language={selectedLanguage}
        detectedCity={detectedCity}
        onConfirm={() => {
          store.setLanguageConfirmed(true);
          goto("LOCATION_PERMISSION");
        }}
        onChange={() => goto("LANGUAGE_LIST")}
        onBack={() => goto("SPLASH")}
      />
    );
  }

  if (phase === "LANGUAGE_LIST") {
    return (
      <LanguageListScreen
        language={selectedLanguage}
        scriptPreference={scriptPreference}
        onSelect={(lang) => {
          store.setPendingLanguage(lang);
          goto("LANGUAGE_CHOICE_CONFIRM");
        }}
        onBack={() => goto("LANGUAGE_CONFIRM")}
        onLanguageChange={() => goto("LANGUAGE_LIST")}
      />
    );
  }

  if (phase === "LANGUAGE_CHOICE_CONFIRM") {
    return (
      <LanguageChoiceConfirmScreen
        language={selectedLanguage}
        scriptPreference={scriptPreference}
        pendingLanguage={store.pendingLanguage || selectedLanguage}
        onConfirm={() => {
          store.setLanguage(store.pendingLanguage || selectedLanguage);
          goto("LANGUAGE_SET");
        }}
        onReject={() => goto("LANGUAGE_LIST")}
        onBack={() => goto("LANGUAGE_LIST")}
        onLanguageChange={() => goto("LANGUAGE_LIST")}
      />
    );
  }

  if (phase === "LANGUAGE_SET") {
    return (
      <LanguageSetScreen
        language={selectedLanguage}
        onComplete={() => goto("LOCATION_PERMISSION")}
      />
    );
  }

  // ── LOCATION ───────────────────────────────────────────────
  if (phase === "LOCATION_PERMISSION") {
    return (
      <LocationPermissionScreen
        language={selectedLanguage}
        onLanguageChange={() => goto("LANGUAGE_LIST")}
        onGranted={(city, state) => {
          store.setDetectedCity(city, state);
          if (!store.languageConfirmed) {
            store.setSelectedLanguage(detectLanguageFromCity(city));
          }
          goto("MIC_PERMISSION");
        }}
        onDenied={() => goto("MANUAL_CITY")}
        onBack={() => goto("LANGUAGE_CONFIRM")}
        showBack
      />
    );
  }

  if (phase === "MANUAL_CITY") {
    return (
      <ManualCityScreen
        onCitySelected={(city) => {
          store.setDetectedCity(city, "");
          goto("MIC_PERMISSION");
        }}
        onBack={() => goto("LOCATION_PERMISSION")}
        onLanguageChange={() => goto("LANGUAGE_LIST")}
      />
    );
  }

  // ── MIC ────────────────────────────────────────────────────
  if (phase === "MIC_PERMISSION") {
    return (
      <MicPermissionScreen
        language={selectedLanguage}
        scriptPreference={scriptPreference}
        onGranted={() => {
          localStorage.setItem("mic_permission_granted", "true");
          store.setMicDenied(false);
          goto("TUTORIAL_SWAGAT");
        }}
        onDenied={() => {
          store.setMicDenied(true);
          goto("MIC_DENIED");
        }}
        onBack={() => goto("LOCATION_PERMISSION")}
      />
    );
  }

  if (phase === "MIC_DENIED") {
    return (
      <MicDeniedRecoveryScreen
        language={selectedLanguage}
        onContinueWithKeyboard={() => goto("TUTORIAL_SWAGAT")}
        onRetryPermission={() => goto("MIC_PERMISSION")}
        onBack={() => goto("MIC_PERMISSION")}
      />
    );
  }

  // ── TUTORIAL (12 slides, resumable via persisted phase) ────
  const tutorialIndex = TUTORIAL_PHASE_ORDER.indexOf(phase);
  if (tutorialIndex >= 0) {
    // TUTORIAL_CTA is handled explicitly below; the generic path only ever
    // renders the non-CTA slides, whose props are exactly `common`.
    const Slide = TUTORIAL_COMPONENTS[tutorialIndex] as React.ComponentType<typeof common>;
    const goSlide = (i: number) => {
      const clamped = Math.min(TUTORIAL_PHASE_ORDER.length - 1, Math.max(0, i));
      store.setCurrentTutorialScreen(clamped + 1);
      goto(TUTORIAL_PHASE_ORDER[clamped]);
    };
    const common = {
      language: selectedLanguage,
      scriptPreference,
      onLanguageChange: () => goto("LANGUAGE_LIST"),
      currentDot: TUTORIAL_PHASE_TO_DOT[phase] ?? tutorialIndex + 1,
      onNext: () => goSlide(tutorialIndex + 1),
      onBack: () => (tutorialIndex === 0 ? goto("MIC_PERMISSION") : goSlide(tutorialIndex - 1)),
      onSkip: () => goSlide(TUTORIAL_PHASE_ORDER.length - 1), // स्किप → CTA slide
    };

    if (phase === "TUTORIAL_CTA") {
      if (showLaterState) {
        return (
          <LaterStayScreen
            onRegister={() => {
              setShowLaterState(false);
              store.setTutorialCompleted(true);
              goto("AUTH");
            }}
          />
        );
      }
      return (
        <TutorialCTA
          {...common}
          onNext={() => {
            store.setTutorialCompleted(true);
            goto("AUTH");
          }}
          onRegisterNow={() => {
            store.setTutorialCompleted(true);
            goto("AUTH");
          }}
          onLater={() => {
            store.setTutorialCompleted(true);
            setShowLaterState(true);
          }}
        />
      );
    }

    return <Slide {...common} />;
  }

  // ── AUTH / WIZARD ──────────────────────────────────────────
  if (phase === "AUTH") {
    return (
      <div className="min-h-dvh bg-cream flex items-center justify-center">
        <span className="text-[48px] animate-pulse" aria-hidden="true">🪔</span>
      </div>
    );
  }

  if (phase === "WIZARD" || phase === "REGISTRATION") {
    const token = typeof window !== "undefined" ? localStorage.getItem("pandit_token") : null;
    if (!token) {
      store.setPhase("AUTH");
      return null;
    }
    return <ProfileWizard onDone={() => router.push("/home")} />;
  }

  // Unknown/legacy phases (HELP, VOICE_TUTORIAL, SCRIPT_CHOICE) → restart cleanly
  return <SplashScreen2 onDone={() => goto("LANGUAGE_CONFIRM")} />;
}
