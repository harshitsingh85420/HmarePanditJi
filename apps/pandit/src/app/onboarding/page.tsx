"use client";

// ─────────────────────────────────────────────────────────────
// Voice-first entry ORCHESTRATOR (Interaction Model v2 + progressive
// onboarding). SPLASH → LOCATION (grant→coords / deny→city) → LANGUAGE
// (detected, confirmed in its own tongue) → TUTORIAL (16 slides; mic is
// asked on slide 5 — there is no separate mic phase) → AUTH (/login
// round-trip) → REGISTRATION (FLOW C: name + detected city, ACCOUNT
// only) → /home. Booking capabilities are earned later via /readiness.
// Phase + slide persist in the onboarding store; mount resume rules:
//   token && profile.fullName → /home
//   token && incomplete       → REGISTRATION (FLOW C)
//   !token && tutorialCompleted → AUTH
//   else                       → saved phase/slide (default SPLASH)
// X1: the splash is painted from frame one — the resume rule resolves
// BEHIND it, then a 200ms crossfade reveals the decided destination.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSafeOnboardingStore } from "@/lib/stores/ssr-safe-stores";
import { voiceController } from "@/lib/voiceController";
import { api } from "@/lib/api";
import { detectLanguage, LANG_TO_BCP47, LANG_NATIVE_NAME, type LangCode } from "@/lib/languageDetect";
import { LANG_CONFIRM } from "@/lib/strings-langconfirm";
import { type OnboardingPhase, type SupportedLanguage } from "@/lib/onboarding-store";
import { speakWithSarvam } from "@/lib/sarvam-tts";

import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { SunriseSplash } from "@/components/moments/SunriseSplash";
import LocationPermissionScreen from "./screens/LocationPermissionScreen";
import ManualCityScreen from "./screens/ManualCityScreen";
import LanguageListScreen from "./screens/LanguageListScreen";
import TutorialV2, { TUTORIAL_TOTAL } from "./TutorialV2";
import RegistrationScreen from "./RegistrationScreen";

// Entry phases (splash → language) render inside this dock so शिष्य keeps
// his footer seat before the tutorial/registration footers take over.
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
      {/* D3: giant language tile — genda tint canvas, DETECTED language */}
      <div className="w-full rounded-canvas bg-genda/10 border-2 border-genda/40 py-8 px-6 flex flex-col items-center gap-2">
        <span className="text-[64px] leading-none font-bold font-hindi" style={{ color: "#8F5E08" }} aria-hidden="true">
          {LANG_NATIVE_NAME[code].slice(0, 2)}
        </span>
        <span className="text-[28px] font-bold text-temple-600 font-hindi">{LANG_NATIVE_NAME[code]}</span>
      </div>
      <h1 className="text-[24px] font-bold text-temple-600 font-hindi leading-snug">{t.confirmQuestion}</h1>
      <div className="w-full flex flex-col gap-3">
        <button
          onClick={onYes}
          className="w-full min-h-[64px] bg-saffron-500 text-[#FFF3EA] rounded-btn text-[20px] font-bold shadow-btn active:scale-[0.97] transition-transform font-hindi"
        >
          {t.yesLabel}
        </button>
        <button
          onClick={onOther}
          className="w-full min-h-[56px] border-2 border-saffron-500 text-saffron-600 bg-white rounded-btn text-[18px] font-bold active:scale-[0.97] transition-transform font-hindi"
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
  // X1: splash veil — painted on frame one, crossfaded out (200ms) once
  // the resume rule has decided the destination.
  const [veilGone, setVeilGone] = useState(false);

  const { phase, detectedCity, detectedState, currentTutorialScreen } = store;

  // ── Mount resume rules ─────────────────────────────────────
  useEffect(() => {
    const run = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("pandit_token") : null;
      // Settings → भाषा visits carry a return flag: show the bare list,
      // do NOT bounce a completed pandit to /home first.
      const langVisit = typeof window !== "undefined" && sessionStorage.getItem("hpj_lang_return");
      if (token && !langVisit) {
        const me = await api("/auth/me");
        const prof = me.success ? me.data?.user?.panditProfile : null;
        const hasFullName = prof?.fullName && String(prof.fullName).trim().length > 0;
        const isVerified = prof?.verificationStatus === "VERIFIED" || prof?.verificationStatus === "APPROVED";
        if (me.success && (hasFullName || isVerified)) {
          router.replace("/home");
          return;
        }
        // fetch failure or incomplete profile → FLOW C minimal registration
        store.setPhase("REGISTRATION");
      } else if (store.tutorialCompleted) {
        store.setPhase("AUTH");
      }
      setResumeChecked(true);
    };
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!resumeChecked) return;
    const t = setTimeout(() => setVeilGone(true), 200);
    return () => clearTimeout(t);
  }, [resumeChecked]);

  // ── UNIVERSAL BACK LAW: Android hardware/gesture back moves through
  // phases (and tutorial slides) instead of leaving the app. Each phase
  // change pushes a history entry; popstate maps to the sensible previous
  // step and re-pins the location.
  useEffect(() => {
    if (!resumeChecked) return;
    try {
      window.history.pushState({ hpj: phase }, "", window.location.href);
    } catch { /* noop */ }
  }, [phase, resumeChecked]);
  useEffect(() => {
    const onPop = () => {
      const cur = store.phase;
      const slide = store.currentTutorialScreen;
      const repin = () => {
        try { window.history.pushState({ hpj: cur }, "", window.location.href); } catch { /* noop */ }
      };
      if (cur === "TUTORIAL" && slide > 1) {
        voiceController.stopSpeech();
        store.setCurrentTutorialScreen(slide - 1);
        repin();
        return;
      }
      // FLOW C back law: registration returns to the Tutorial CTA slide
      if (cur === "REGISTRATION" || cur === "WIZARD") {
        voiceController.stopSpeech();
        store.setCurrentTutorialScreen(TUTORIAL_TOTAL);
        store.setPhase("TUTORIAL");
        repin();
        return;
      }
      const prevMap: Record<string, OnboardingPhase | null> = {
        MANUAL_CITY: "LOCATION_PERMISSION",
        LANGUAGE_CONFIRM: "LOCATION_PERMISSION",
        LANGUAGE_LIST: "LANGUAGE_CONFIRM",
        TUTORIAL: "LANGUAGE_CONFIRM",
      };
      const prev = prevMap[String(cur)] ?? null;
      if (prev) {
        voiceController.stopSpeech();
        store.setPhase(prev);
        repin();
      }
      // SPLASH / LOCATION / AUTH: stay (do not exit mid-ceremony)
      else repin();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.phase, store.currentTutorialScreen, resumeChecked]);

  // ── AUTH phase: hand over to /login and come back. A token-holder
  // never re-OTPs — they go straight to FLOW C. ───────────────
  useEffect(() => {
    if (!resumeChecked || phase !== "AUTH") return;
    const token = localStorage.getItem("pandit_token");
    if (token) {
      store.setPhase("REGISTRATION");
      return;
    }
    router.push("/login?next=/onboarding");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeChecked, phase, router]);

  const goto = (p: OnboardingPhase) => {
    voiceController.stopSpeech();
    store.setPhase(p);
  };

  const detectedCode = detectLanguage(detectedCity, detectedState);
  const langReturn = typeof window !== "undefined" ? sessionStorage.getItem("hpj_lang_return") : null;

  const renderPhase = (): React.ReactNode => {
    // ── SPLASH ─────────────────────────────────────────────────
    if (phase === "SPLASH") {
      return <SunriseSplash onDone={() => goto("LOCATION_PERMISSION")} />;
    }

    // ── LOCATION ───────────────────────────────────────────────
    if (phase === "LOCATION_PERMISSION") {
      return (
        <LocationPermissionScreen
          language={store.selectedLanguage}
          onLanguageChange={() => goto("LANGUAGE_LIST")}
          onGranted={(city, state) => {
            store.setDetectedCity(city, state);
            goto("LANGUAGE_CONFIRM");
          }}
          onDenied={() => goto("MANUAL_CITY")}
          showBack={false}
        />
      );
    }

    if (phase === "MANUAL_CITY") {
      return (
        <ManualCityScreen
          onCitySelected={(city) => {
            store.setDetectedCity(city, "");
            goto("LANGUAGE_CONFIRM");
          }}
          onBack={() => goto("LOCATION_PERMISSION")}
          onLanguageChange={() => goto("LANGUAGE_LIST")}
        />
      );
    }

    // ── LANGUAGE — asked EXACTLY ONCE per install ──────────────
    if (phase === "LANGUAGE_CONFIRM" && store.languageConfirmed) {
      // already confirmed → never re-run the ceremony
      store.setPhase("TUTORIAL");
      return null;
    }

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
      // Confirmed + not a settings visit → nothing to ask; skip ahead.
      if (store.languageConfirmed && !langReturn) {
        store.setPhase("TUTORIAL");
        return null;
      }
      return (
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
            if (langReturn) {
              // Settings → भाषा: pick and go straight back — no ceremony,
              // no tutorial. The flag stays until settings mounts (clearing
              // it here re-triggers the skip rule mid-flight and the phase
              // history push cancels the route transition).
              router.push(langReturn);
              return;
            }
            goto("TUTORIAL");
          }}
          onBack={() => {
            if (langReturn) {
              router.push(langReturn);
              return;
            }
            goto("LANGUAGE_CONFIRM");
          }}
          onLanguageChange={() => goto("LANGUAGE_LIST")}
        />
      );
    }

    // ── TUTORIAL (16 slides; mic asked on slide 5) ─────────────
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

    // ── AUTH / REGISTRATION (FLOW C) ───────────────────────────
    if (phase === "AUTH") {
      return (
        <div className="min-h-dvh bg-cream flex items-center justify-center">
          <span className="text-[48px] animate-pulse" aria-hidden="true">🪔</span>
        </div>
      );
    }

    if (phase === "REGISTRATION" || phase === "WIZARD") {
      const token = typeof window !== "undefined" ? localStorage.getItem("pandit_token") : null;
      if (!token) {
        store.setPhase("AUTH");
        return null;
      }
      return (
        <RegistrationScreen
          onBack={() => {
            // FLOW C back law: return to the Tutorial CTA slide
            voiceController.stopSpeech();
            store.setCurrentTutorialScreen(TUTORIAL_TOTAL);
            store.setPhase("TUTORIAL");
          }}
        />
      );
    }

    // Legacy/unknown persisted phases (incl. the old TUTORIAL_* names and
    // MIC phases) → map into the new machine at the nearest sensible point.
    if (String(phase).startsWith("TUTORIAL_") || phase === "MIC_PERMISSION" || phase === "MIC_DENIED") {
      store.setPhase("TUTORIAL");
      return null;
    }
    if (["LANGUAGE_CHOICE_CONFIRM", "LANGUAGE_SET", "SCRIPT_CHOICE", "HELP"].includes(String(phase))) {
      store.setPhase(store.languageConfirmed ? "TUTORIAL" : "LANGUAGE_CONFIRM");
      return null;
    }
    return <SunriseSplash onDone={() => goto("LOCATION_PERMISSION")} />;
  };

  return (
    <>
      {resumeChecked ? renderPhase() : null}
      {/* X1: frame-one splash veil; 200ms crossfade to the destination */}
      {!veilGone && (
        <div
          aria-hidden={resumeChecked}
          className={`fixed inset-0 z-[60] transition-opacity duration-200 ${
            resumeChecked ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <SunriseSplash onDone={() => { /* the resume rule decides */ }} />
        </div>
      )}
    </>
  );
}
