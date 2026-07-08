"use client";

// ─────────────────────────────────────────────────────────────
// Voice-first entry ORCHESTRATOR (Interaction Model v2).
// SPLASH → LOCATION (grant→coords / deny→city) → LANGUAGE (detected,
// confirmed in its own tongue) → TUTORIAL (14 slides; mic is asked on
// slide 5 — there is no separate mic phase) → AUTH (/login round-trip)
// → WIZARD (<ProfileWizard/>) → /home. Phase + slide persist in the
// onboarding store; mount resume rules at the bottom of this header:
//   token && profile.fullName → /home
//   token && incomplete       → WIZARD (wizard resumes its saved step)
//   !token && tutorialCompleted → AUTH
//   else                       → saved phase/slide (default SPLASH)
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSafeOnboardingStore } from "@/lib/stores/ssr-safe-stores";
import { useScreenVoice } from "@/hooks/useScreenVoice";
import { voiceController } from "@/lib/voiceController";
import { api } from "@/lib/api";
import { hi } from "@/lib/strings";
import { detectLanguage, LANG_TO_BCP47, LANG_NATIVE_NAME, type LangCode } from "@/lib/languageDetect";
import { LANG_CONFIRM } from "@/lib/strings-langconfirm";
import { type OnboardingPhase, type SupportedLanguage } from "@/lib/onboarding-store";
import { speakWithSarvam } from "@/lib/sarvam-tts";

import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import LocationPermissionScreen from "./screens/LocationPermissionScreen";
import ManualCityScreen from "./screens/ManualCityScreen";
import LanguageListScreen from "./screens/LanguageListScreen";
import TutorialV2, { TUTORIAL_TOTAL } from "./TutorialV2";
import ProfileWizard from "./ProfileWizard";

// Entry phases (splash → language) render inside this dock so शिष्य keeps
// his footer seat before the tutorial/wizard footers take over.
function OrbDock({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100dvh] max-w-[430px] mx-auto flex flex-col bg-cream">
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      <footer className="shrink-0 px-4 py-2 bg-cream/95 backdrop-blur border-t border-saffron-100 flex justify-center">
        <ShishyaOrb />
      </footer>
    </div>
  );
}

const SUPPORTED_TO_CODE: Record<string, LangCode> = {
  Hindi: "hi", Marathi: "mr", Bengali: "bn", Tamil: "ta", Telugu: "te",
  Kannada: "kn", Gujarati: "gu", Punjabi: "pa", Malayalam: "ml",
  Odia: "or", English: "en",
};

// ── Splash ───────────────────────────────────────────────────
function SplashScreen2({ onDone }: { onDone: () => void }) {
  useScreenVoice(hi.welcomeFlow.welcome);
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <main
      onClick={onDone}
      className="min-h-full w-full max-w-[430px] mx-auto bg-cream flex flex-col items-center justify-center gap-4 cursor-pointer"
    >
      <span className="text-[96px] leading-none text-saffron-500 select-none" aria-hidden="true">🕉</span>
      <h1 className="t-hero text-center">हमारे पंडित जी</h1>
      <p className="t-body text-softgrey font-hindi text-center px-8">
        ऐप पंडित के लिए है, पंडित ऐप के लिए नहीं
      </p>
    </main>
  );
}

// ── Language confirm — speaks IN the detected language ──────
function LangConfirmScreen2({
  code,
  onYes,
  onOther,
}: {
  code: LangCode;
  onYes: () => void;
  onOther: () => void;
}) {
  const t = LANG_CONFIRM[code];
  useEffect(() => {
    const timer = setTimeout(() => {
      void speakWithSarvam({ text: t.confirmQuestion, languageCode: LANG_TO_BCP47[code] as never });
    }, 300);
    const unregister = voiceController.registerReplay(() => {
      void speakWithSarvam({ text: t.confirmQuestion, languageCode: LANG_TO_BCP47[code] as never });
    });
    return () => {
      clearTimeout(timer);
      unregister();
    };
  }, [code, t.confirmQuestion]);

  return (
    <main className="min-h-full w-full max-w-[430px] mx-auto bg-cream flex flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="text-[64px]" aria-hidden="true">🗣️</span>
      <h1 className="text-[26px] font-bold text-temple-600 font-hindi leading-snug">{t.confirmQuestion}</h1>
      <div className="w-full flex flex-col gap-3">
        <button
          onClick={onYes}
          className="w-full min-h-[64px] bg-saffron-500 text-[#FFF3EA] rounded-btn text-[20px] font-bold shadow-btn active:scale-[0.97] transition-transform"
        >
          {t.yesLabel}
        </button>
        <button
          onClick={onOther}
          className="w-full min-h-[56px] border-2 border-saffron-500 text-saffron-600 bg-white rounded-btn text-[18px] font-bold active:scale-[0.97] transition-transform"
        >
          {t.otherLabel}
        </button>
      </div>
    </main>
  );
}

// ── Orchestrator ─────────────────────────────────────────────
export default function OnboardingOrchestratorPage() {
  const router = useRouter();
  const store = useSafeOnboardingStore();
  const [resumeChecked, setResumeChecked] = useState(false);

  const { phase, detectedCity, detectedState, currentTutorialScreen } = store;

  // ── Mount resume rules ─────────────────────────────────────
  useEffect(() => {
    const run = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("pandit_token") : null;
      if (token) {
        const me = await api("/auth/me");
        const prof = me.success ? me.data?.user?.panditProfile : null;
        const hasFullName = prof?.fullName && String(prof.fullName).trim().length > 0;
        const isVerified = prof?.verificationStatus === "VERIFIED" || prof?.verificationStatus === "APPROVED";
        if (me.success && (hasFullName || isVerified)) {
          router.replace("/home");
          return;
        }
        // fetch failure or incomplete profile → wizard (it resumes its own step)
        store.setPhase("WIZARD");
      } else if (store.tutorialCompleted) {
        store.setPhase("AUTH");
      }
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

  const detectedCode = detectLanguage(detectedCity, detectedState);

  // ── SPLASH ─────────────────────────────────────────────────
  if (phase === "SPLASH") {
    return (
      <OrbDock>
        <SplashScreen2 onDone={() => goto("LOCATION_PERMISSION")} />
      </OrbDock>
    );
  }

  // ── LOCATION ───────────────────────────────────────────────
  if (phase === "LOCATION_PERMISSION") {
    return (
      <OrbDock>
      <LocationPermissionScreen
        language={store.selectedLanguage}
        onLanguageChange={() => goto("LANGUAGE_LIST")}
        onGranted={(city, state) => {
          store.setDetectedCity(city, state);
          goto("LANGUAGE_CONFIRM");
        }}
        onDenied={() => goto("MANUAL_CITY")}
        onBack={() => goto("SPLASH")}
        showBack
      />
      </OrbDock>
    );
  }

  if (phase === "MANUAL_CITY") {
    return (
      <OrbDock>
      <ManualCityScreen
        onCitySelected={(city) => {
          store.setDetectedCity(city, "");
          goto("LANGUAGE_CONFIRM");
        }}
        onBack={() => goto("LOCATION_PERMISSION")}
        onLanguageChange={() => goto("LANGUAGE_LIST")}
      />
      </OrbDock>
    );
  }

  // ── LANGUAGE ───────────────────────────────────────────────
  if (phase === "LANGUAGE_CONFIRM") {
    return (
      <OrbDock>
      <LangConfirmScreen2
        code={detectedCode}
        onYes={() => {
          store.setLanguageConfirmed(true);
          if (detectedCode !== "hi") {
            store.setPreferredLanguage(detectedCode);
            void speakWithSarvam({
              text: LANG_CONFIRM[detectedCode].comingSoonLine,
              languageCode: LANG_TO_BCP47[detectedCode] as never,
            });
          }
          goto("TUTORIAL");
        }}
        onOther={() => goto("LANGUAGE_LIST")}
      />
      </OrbDock>
    );
  }

  if (phase === "LANGUAGE_LIST") {
    return (
      <OrbDock>
      <LanguageListScreen
        language={store.selectedLanguage}
        scriptPreference={store.scriptPreference}
        onSelect={(lang: SupportedLanguage) => {
          const code = SUPPORTED_TO_CODE[lang] || "hi";
          store.setLanguageConfirmed(true);
          if (code === "hi") {
            store.setLanguage("Hindi");
            store.setPreferredLanguage(null);
          } else {
            // v1: preference stored, spoken coming-soon in ITS language,
            // app continues in Hindi
            store.setLanguage("Hindi");
            store.setPreferredLanguage(code);
            void speakWithSarvam({
              text: LANG_CONFIRM[code].comingSoonLine,
              languageCode: LANG_TO_BCP47[code] as never,
            });
          }
          goto("TUTORIAL");
        }}
        onBack={() => goto("LANGUAGE_CONFIRM")}
        onLanguageChange={() => goto("LANGUAGE_LIST")}
      />
      </OrbDock>
    );
  }

  // ── TUTORIAL (14 slides; mic asked on slide 5) ─────────────
  if (phase === "TUTORIAL") {
    return (
      <TutorialV2
        slide={Math.min(TUTORIAL_TOTAL, Math.max(1, currentTutorialScreen))}
        onSlideChange={(n) => {
          voiceController.stopSpeech();
          store.setCurrentTutorialScreen(n);
        }}
        onRegister={() => {
          store.setTutorialCompleted(true);
          goto("AUTH");
        }}
        onLater={() => {
          store.setTutorialCompleted(true);
        }}
        onMicGranted={() => store.setMicDenied(false)}
        onMicDenied={() => store.setMicDenied(true)}
      />
    );
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

  // Legacy/unknown persisted phases (incl. the old TUTORIAL_* names and
  // MIC phases) → map into the new machine at the nearest sensible point.
  if (String(phase).startsWith("TUTORIAL_") || phase === "MIC_PERMISSION" || phase === "MIC_DENIED") {
    store.setPhase("TUTORIAL");
    return null;
  }
  return (
    <OrbDock>
      <SplashScreen2 onDone={() => goto("LOCATION_PERMISSION")} />
    </OrbDock>
  );
}
