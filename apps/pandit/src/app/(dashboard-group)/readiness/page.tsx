"use client";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────
// FLOW E — BOOKING-READINESS (resumable wizard, /readiness).
// Registration made an ACCOUNT; these 5 steps earn booking
// capabilities. readinessStep persists SERVER-side (resume from any
// device). Every step: Screen grammar + शिष्य narration + always-
// listening; back allowed; exit allowed anytime (बाद में पूरा करें).
//   R1 पूजाएँ + दक्षिणा   → /pandit/profile + /pandit/dakshina-rates
//   R2 सामग्री dual model → canBringSamagri + shared package builder
//   R3 यात्रा             → travelPrefs Json (all default-off)
//   R4 भोजन व ठहराव       → foodPrefs Json (allowance NOT prefilled)
//   R5 भुगतान + सत्यापन   → bank/UPI (typed-only) + aadhaar, unchanged
// Finish → isBookingReady=true (server), celebration, /home unlocked
// (GO ONLINE still gated by admin approval as before).
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { mutateOnce, once } from "@/lib/mutate";
import { getToken } from "@/lib/safeStorage";
import { api, API_BASE } from "@/lib/api";
import { Narrate } from "@/hooks/useScreenVoice";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { DiyaLoader } from "@/components/moments/DiyaLoader";
import { CelebrationScreen } from "@/components/moments/CelebrationScreen";
import { VoiceField } from "@/components/voice/VoiceField";
import { useVoiceCommands, useVoiceOptions } from "@/hooks/useVoiceScreen";
import { setAgentUserState } from "@/lib/shishyaAgent";
import { YES, NO, NEXT, BACK, SKIP } from "@/lib/voiceGrammar";
import { SamagriPackageEditor } from "@/components/SamagriPackageEditor";
import { PriceHonestyMeter } from "@/components/PriceHonestyMeter";
import { usePresignedUrl } from "@/hooks/usePresignedUrl";
import { useVoice } from "@/hooks/useVoice";
import { voiceController } from "@/lib/voiceController";

const SPEC_LIST = [
  { id: "SATYANARAYAN", emoji: "📖" },
  { id: "GRIHA_PRAVESH", emoji: "🏡" },
  { id: "VIVAH", emoji: "💑" },
  { id: "MUNDAN", emoji: "👶" },
  { id: "NAAMKARAN", emoji: "🍼" },
  { id: "HAVAN", emoji: "🔥" },
  { id: "RUDRABHISHEK", emoji: "💦" },
  { id: "SHRADH", emoji: "👵" },
] as const;

// Mockup frame 15 presets (founder-ratified): four big chips beat typing a
// number for a 58-year-old. 999 is the "100+ कि.मी." sentinel (any distance).
const KM_PRESETS: ReadonlyArray<{ km: number; label: string }> = [
  { km: 10, label: "10 कि.मी." },
  { km: 25, label: "25 कि.मी." },
  { km: 50, label: "50 कि.मी." },
  { km: 999, label: "100+ कि.मी." },
];

interface TravelPrefs {
  ownVehicle: { enabled: boolean; maxKm: number | null };
  train: { enabled: boolean; classes: string[] };
  bus: { enabled: boolean; ac: "AC" | "NON_AC" | null };
  flight: { enabled: boolean };
  exclusions: string[];
  localCabOk: boolean | null;
}

const DEFAULT_TRAVEL: TravelPrefs = {
  ownVehicle: { enabled: false, maxKm: null },
  train: { enabled: false, classes: [] },
  bus: { enabled: false, ac: null },
  flight: { enabled: false },
  exclusions: [],
  localCabOk: null,
};

interface Snapshot {
  readinessStep: number;
  isBookingReady: boolean;
  canBringSamagri: boolean | null;
  travelPrefs: TravelPrefs | null;
  foodPrefs: {
    dietary: string | null;
    hotelFoodOk: boolean | null;
    allergies: string;
    dailyAllowance: number | null;
    stayAtCustomerHome?: boolean | null; // legacy — kept only for fallback load
    hotelTier?: string | null;           // legacy — kept only for fallback load
  } | null;
  accommodationPrefs: {
    customerHomeOk: boolean | null;
    hotelTier: string | null;
    sharedRoomOk: boolean | null;
    dharamshalaOk?: boolean | null;
    advanceNoticeDays: number | null;
  } | null;
  specializations: string[];
  dakshinaRates: Array<{ pujaType: string; amount: number }>;
  aadhaarUrl: string;
  aadhaarBackUrl: string;
  hasAadhaar: boolean;
  hasConsent: boolean;
  hasPayment: boolean;
  samagriTiersByPuja: Record<string, number>;
}

const specLabel = (id: string): string =>
  t(`onboarding.specializations.${id}`);

export default function ReadinessPage() {
  const router = useRouter();
  const { speak } = useVoice();

  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // R1
  const [specs, setSpecs] = useState<string[]>([]);
  const [dakshina, setDakshina] = useState<Record<string, string>>({});
  // R2
  const [canBring, setCanBring] = useState<boolean | null>(null);
  const [editorPuja, setEditorPuja] = useState<string | null>(null);
  // R3
  const [travel, setTravel] = useState<TravelPrefs>(DEFAULT_TRAVEL);
  // R4
  const [dietary, setDietary] = useState<string | null>(null);
  const [hotelFoodOk, setHotelFoodOk] = useState<boolean | null>(null);
  const [allergies, setAllergies] = useState(""); // optional, EMPTY
  // Starts EMPTY (placeholder "जैसे ₹1,000" is never a value). The ONLY
  // thing that may fill it is the pandit's own SAVED amount on resume
  // (X3's saved-server-value exception) — never a suggested default.
  const [allowance, setAllowance] = useState("");
  const [stayHome, setStayHome] = useState<boolean | null>(null);
  const [hotelTier, setHotelTier] = useState<string | null>(null);
  const [sharedRoomOk, setSharedRoomOk] = useState<boolean | null>(null);
  const [dharamshalaOk, setDharamshalaOk] = useState<boolean | null>(null);
  const [advanceNoticeDays, setAdvanceNoticeDays] = useState<number | null>(null);
  // R5 — bank/UPI typed-only + aadhaar (front+back+number+consent)
  const [aadhaarUrl, setAadhaarUrl] = useState("");
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarConsent, setAadhaarConsent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [paymentType, setPaymentType] = useState<"BANK" | "UPI">("BANK");
  const [bank, setBank] = useState({ accountName: "", accountNumber: "", accountNumberConfirm: "", ifsc: "" });
  const [upi, setUpi] = useState({ id: "" });

  const stepRef = useRef(step);
  stepRef.current = step;
  const editorRef = useRef(editorPuja);
  editorRef.current = editorPuja;
  // S3: the advance-ask narration highlights the footer आगे button
  const nextBtnRef = useRef<HTMLDivElement | null>(null);

  // ── load + resume (server-persisted readinessStep) ─────────
  useEffect(() => {
    const run = async () => {
      const res = await api("/pandit/readiness");
      if (!res.success || !res.data) {
        router.replace("/home");
        return;
      }
      const snap = res.data as Snapshot;
      setSnapshot(snap);

      // edit screens may load SAVED server values (X3)
      const knownIds = new Set<string>(SPEC_LIST.map((s) => s.id));
      setSpecs(snap.specializations.filter((s) => knownIds.has(s)));
      const rates: Record<string, string> = {};
      snap.dakshinaRates.forEach((r) => {
        rates[r.pujaType] = String(r.amount);
      });
      setDakshina(rates);
      setCanBring(snap.canBringSamagri);
      if (snap.travelPrefs) setTravel({ ...DEFAULT_TRAVEL, ...snap.travelPrefs });
      if (snap.foodPrefs) {
        setDietary(snap.foodPrefs.dietary);
        setHotelFoodOk(snap.foodPrefs.hotelFoodOk);
        setAllergies(snap.foodPrefs.allergies || "");
        setAllowance(snap.foodPrefs.dailyAllowance ? String(snap.foodPrefs.dailyAllowance) : "");
      }
      // ठहराव (stay) now lives in accommodationPrefs — fall back to the legacy
      // foodPrefs.stay* fields so an existing pandit's saved choice still loads.
      const acc = snap.accommodationPrefs;
      setStayHome(acc?.customerHomeOk ?? snap.foodPrefs?.stayAtCustomerHome ?? null);
      setHotelTier(acc?.hotelTier ?? snap.foodPrefs?.hotelTier ?? null);
      setSharedRoomOk(acc?.sharedRoomOk ?? null);
      setDharamshalaOk(acc?.dharamshalaOk ?? null);
      setAdvanceNoticeDays(acc?.advanceNoticeDays ?? null);
      setAadhaarUrl(snap.aadhaarUrl || "");
      setAadhaarBackUrl(snap.aadhaarBackUrl || "");
      setAadhaarConsent(!!snap.hasConsent); // resume-safe: already consented → stays ticked
      // aadhaarNumber is never echoed back (security) — re-entered on resume

      // resume at the saved step (+ optional ?step= deep link, e.g. the
      // rejected-KYC resubmit lands on R5) — never past the earned step+1
      const params = new URLSearchParams(window.location.search);
      const urlStep = parseInt(params.get("step") || "", 10);
      const nextStep = Math.min(snap.readinessStep + 1, 5);
      const wanted = Number.isFinite(urlStep) ? Math.min(5, Math.max(1, urlStep)) : nextStep;
      setStep(Math.min(wanted, nextStep));
      setLoading(false);
    };
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── UNIVERSAL BACK LAW: hardware back = header back ────────
  useEffect(() => {
    if (loading) return;
    try {
      window.history.pushState({ hpjReadiness: step }, "", window.location.href);
    } catch {
      /* noop */
    }
  }, [step, loading]);
  useEffect(() => {
    const onPop = () => {
      const repin = () => {
        try {
          window.history.pushState({ hpjReadiness: stepRef.current }, "", window.location.href);
        } catch {
          /* noop */
        }
      };
      voiceController.stopSpeech("user-nav:readiness");
      if (editorRef.current) {
        setEditorPuja(null);
        repin();
        return;
      }
      if (stepRef.current > 1) {
        setErrorMsg("");
        setStep(stepRef.current - 1);
        repin();
        return;
      }
      router.push("/home");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── shared nav helpers (above the loading return — the voice
  // registrations below are HOOKS and must run on every render) ──
  const goBack = () => {
    voiceController.stopSpeech("user-nav:readiness");
    setErrorMsg("");
    if (editorPuja) {
      setEditorPuja(null);
      return;
    }
    if (step > 1) setStep(step - 1);
    else router.push("/home");
  };

  const exitForLater = () => {
    voiceController.stopSpeech("user-nav:readiness");
    router.push("/home");
  };

  // J2: the whole wizard answers by voice. आगे/हाँ save the current step
  // (validation speaks when something is missing), पीछे retreats,
  // छोड़ो/बाद-में exit for later. R2 is the exception: there हाँ/नहीं
  // answer the सामग्री question itself. Order matters — the exit command
  // sits BEFORE नहीं so "बाद में" never reads as a सामग्री answer.
  // saveR1-R5 are consts defined below; the actions only fire after a
  // completed post-loading render, when they are all initialized.
  const advanceStep = () => {
    const handler = [saveR1, saveR2, saveR3, saveR4, saveR5][stepRef.current - 1];
    if (handler) void handler();
  };
  useVoiceCommands(
    [
      { id: "exit-for-later", label: "बाद में करो", keywords: SKIP, action: exitForLater },
      {
        id: "confirm-yes",
        label: "हाँ / आगे बढ़ो",
        // W4b: exact-only — sentences containing हाँ-words flow to the
        // agent; polite composites still advance via the loose NEXT.
        pure: true,
        keywords: YES,
        action: () => {
          if (stepRef.current === 2) {
            setErrorMsg("");
            setCanBring(true);
          } else {
            advanceStep();
          }
        },
      },
      {
        id: "answer-no",
        label: "नहीं",
        pure: true,
        keywords: NO,
        action: () => {
          if (stepRef.current === 2) {
            setErrorMsg("");
            setCanBring(false);
          } else {
            voiceController.speakUnmatchedGently();
          }
        },
      },
      { id: "next-step", label: "आगे बढ़ो", keywords: NEXT, action: advanceStep },
      { id: "go-back", label: "पीछे जाओ", keywords: BACK, action: goBack },
    ],
    t("help.readiness"),
    !loading && !editorPuja && !showCelebration,
    true, // L7: the readiness wizard carries dakshina + Aadhaar/bank KYC —
    // the agent may answer but must never advance/submit it. Critical.
  );

  // Inside the सामग्री editor only पीछे works by voice (its fields and
  // save button are the editor's own); the shell registry is disabled.
  useVoiceCommands(
    [{ keywords: BACK, action: goBack }],
    t("help.samagriEditor"),
    !!editorPuja && !showCelebration,
  );

  // Celebration: हाँ/होम go home (the single CTA).
  useVoiceCommands(
    [{ keywords: [...YES, "होम", "घर", "home"], action: () => router.push("/home") }],
    t("help.celebration"),
    showCelebration,
  );

  // W3: the wizard tells शिष्य which step the pandit is standing on
  useEffect(() => {
    setAgentUserState({
      readinessStep: step,
      isBookingReady: snapshot?.isBookingReady === true,
    });
  }, [step, snapshot]);

  if (loading || !snapshot) return <DiyaLoader />;

  // ── shared step helpers ────────────────────────────────────
  // Q6 SPOKEN-ERROR LAW: whatever renders as the error IS what शिष्य
  // says — never a generic "कुछ गड़बड़" beside a specific on-screen line.
  const sayError = (msg: string) => {
    setErrorMsg(msg);
    speak(msg);
  };

  const refreshSnapshot = async () => {
    const res = await api("/pandit/readiness");
    if (res.success && res.data) setSnapshot(res.data as Snapshot);
  };

  const patchStep = async (n: number, data: Record<string, unknown>): Promise<boolean> => {
    setSaving(true);
    setErrorMsg("");
    const res = await mutateOnce(`readiness-step:${n}`, "/pandit/readiness", {
      method: "PATCH",
      body: JSON.stringify({ step: n, data }),
    });
    setSaving(false);
    if (!res.success) {
      sayError(res.error?.message || t("readiness.saveError"));
      return false;
    }
    setSnapshot(res.data as Snapshot);
    return true;
  };

  // ── R1: pujas + dakshina ───────────────────────────────────
  const saveR1 = async () => {
    if (specs.length === 0) {
      sayError(t("onboarding.specError"));
      return;
    }
    for (const spec of specs) {
      const amount = Number(dakshina[spec] || "");
      if (isNaN(amount) || amount < 501 || amount > 500000) {
        sayError(t("onboarding.dakshinaError"));
        return;
      }
    }
    setSaving(true);
    setErrorMsg("");
    // reuse the existing endpoints (F11): specializations + per-puja rates
    const profRes = await mutateOnce("readiness-r1-profile", "/pandit/profile", {
      method: "PATCH",
      body: JSON.stringify({ specializations: specs }),
    });
    if (!profRes.success) {
      setSaving(false);
      sayError(profRes.error?.message || t("readiness.saveError"));
      return;
    }
    for (const spec of specs) {
      const rateRes = await mutateOnce(`readiness-dakshina:${spec}`, "/pandit/dakshina-rates", {
        method: "POST",
        body: JSON.stringify({ pujaType: spec, amount: Number(dakshina[spec]) }),
      });
      if (!rateRes.success) {
        setSaving(false);
        sayError(rateRes.error?.message || t("readiness.saveError"));
        return;
      }
    }
    setSaving(false);
    if (await patchStep(1, {})) setStep(2);
  };

  // ── R2: samagri dual model ─────────────────────────────────
  const saveR2 = async () => {
    if (canBring === null) {
      setErrorMsg(t("readiness.r2Question"));
      speak(t("readiness.r2Question"));
      return;
    }
    if (canBring) {
      const missing = specs.filter((s) => !(snapshot.samagriTiersByPuja[s] > 0));
      if (missing.length > 0) {
        setErrorMsg(t("readiness.r2Error"));
        speak(t("readiness.r2Error"));
        return;
      }
    }
    if (await patchStep(2, { canBringSamagri: canBring })) setStep(3);
  };

  // ── R3: travel ─────────────────────────────────────────────
  const saveR3 = async () => {
    if (travel.ownVehicle.enabled && !travel.ownVehicle.maxKm) {
      setErrorMsg(t("readiness.ownVehicleKm"));
      speak(t("readiness.ownVehicleKm"));
      return;
    }
    if (travel.train.enabled && travel.train.classes.length === 0) {
      sayError(t("readiness.train"));
      return;
    }
    if (travel.bus.enabled && !travel.bus.ac) {
      sayError(t("readiness.bus"));
      return;
    }
    if (await patchStep(3, { travelPrefs: travel })) setStep(4);
  };

  // ── R4: food & stay ────────────────────────────────────────
  const saveR4 = async () => {
    let allowanceNum: number | null = null;
    if (allowance.trim() !== "") {
      allowanceNum = Number(allowance);
      if (isNaN(allowanceNum) || allowanceNum < 1 || allowanceNum > 100000) {
        sayError(t("readiness.allowancePlaceholder"));
        return;
      }
    }
    const ok = await patchStep(4, {
      // foodPrefs is FOOD-ONLY — stay data has its own column now (BB1).
      foodPrefs: {
        dietary,
        hotelFoodOk,
        allergies: allergies.trim(),
        dailyAllowance: allowanceNum,
      },
      accommodationPrefs: {
        customerHomeOk: stayHome,
        hotelTier,
        sharedRoomOk,
        dharamshalaOk,
        advanceNoticeDays,
      },
    });
    if (ok) setStep(5);
  };

  // ── R5: payment + verification (finish) ────────────────────
  const saveR5 = async () => {
    if (!aadhaarUrl) {
      sayError(t("onboarding.aadhaarError"));
      return;
    }
    if (!aadhaarBackUrl) {
      sayError(t("readiness.aadhaarBackError"));
      return;
    }
    if (!/^\d{12}$/.test(aadhaarNumber.replace(/\s+/g, ""))) {
      sayError(t("readiness.aadhaarNumberError"));
      return;
    }
    if (!aadhaarConsent) {
      sayError(t("readiness.aadhaarConsentError"));
      return;
    }
    if (paymentType === "BANK") {
      if (!bank.accountName.trim() || !/^\d{9,18}$/.test(bank.accountNumber) || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bank.ifsc)) {
        sayError(t("onboarding.paymentError"));
        return;
      }
      if (bank.accountNumber !== bank.accountNumberConfirm) {
        sayError(t("onboarding.accMismatch"));
        return;
      }
    } else if (!/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upi.id)) {
      sayError(t("onboarding.paymentError"));
      return;
    }
    const ok = await patchStep(5, {
      aadhaarUrl,
      aadhaarBackUrl,
      aadhaarNumber: aadhaarNumber.replace(/\s+/g, ""),
      aadhaarConsent,
      payment: {
        type: paymentType,
        bank:
          paymentType === "BANK"
            ? { accountName: bank.accountName, accountNumber: bank.accountNumber, ifsc: bank.ifsc }
            : undefined,
        upi: paymentType === "UPI" ? { id: upi.id } : undefined,
      },
    });
    if (ok) setShowCelebration(true);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "aadhaar-front" | "aadhaar-back" = "aadhaar-front",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const back = kind === "aadhaar-back";
    const setBusy = back ? setUploadingBack : setUploading;
    const setUrl = back ? setAadhaarBackUrl : setAadhaarUrl;
    setBusy(true);
    setErrorMsg("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const token = getToken();
      // G1: multipart can't use api() (it forces JSON) but the BASE must
      // come from the single prefix-normalized source
      const res = await once(`readiness-upload:${kind}:${file.name}`, () => fetch(`${API_BASE}/upload?kind=${kind}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }));
      const json = await res.json();
      setBusy(false);
      if (json.success && (json.data?.key || json.data?.url)) {
        setUrl(json.data.key || json.data.url);
      } else {
        sayError(json.error?.message || t("common.error"));
      }
    } catch {
      setBusy(false);
      sayError(t("common.error"));
    }
  };

  // ── celebration: "अब आप बुकिंग के लिए तैयार हैं!" ─────────
  if (showCelebration) {
    return (
      <>
        <Narrate text={t("readiness.readyCelebrationVoice")} />
        <CelebrationScreen
          emoji="🚩"
          title={t("readiness.readyCelebrationTitle")}
          message={t("home.pendingVerification")}
          ctaLabel={t("onboarding.homeBtn")}
          onCta={() => router.push("/home")}
        />
      </>
    );
  }

  const stepTitles = [
    t("readiness.r1Title"),
    t("readiness.r2Title"),
    t("readiness.r3Title"),
    t("readiness.r4Title"),
    t("readiness.r5Title"),
  ];
  // J2: each step's narration ends by inviting the spoken answer; R2's
  // narration IS a हाँ/नहीं question, so it carries no extra ask.
  const stepVoices = [
    `${t("readiness.r1Voice")} ${t("tutorial.advanceAsk")}`,
    t("readiness.r2Question"),
    `${t("readiness.r3Voice")} ${t("tutorial.advanceAsk")}`,
    `${t("readiness.r4Voice")} ${t("tutorial.advanceAsk")}`,
    `${t("readiness.r5Voice")} ${t("tutorial.advanceAsk")}`,
  ];
  const saveHandlers = [saveR1, saveR2, saveR3, saveR4, saveR5];

  return (
    <div className="h-[100dvh] bg-cream text-ink flex flex-col max-w-[430px] mx-auto w-full">
      <Header title={stepTitles[step - 1]} showBack onBack={goBack} />
      {/* S3: steps whose narration ends on the advance-ask glow the आगे
          button; R2's yes/no question highlights nothing. */}
      <Narrate
        text={stepVoices[step - 1]}
        key={`voice-${step}-${editorPuja || ""}`}
        highlightRef={step !== 2 ? nextBtnRef : undefined}
      />

      <main className="flex-1 min-h-0 overflow-y-auto px-4 pt-3 pb-6 flex flex-col gap-4 page-enter">
        {/* Mockup frame 12 ("दीये जलें"): the wizard's progress IS five diyas —
            lit for completed steps, dim for the rest. Same step source as the
            old dots; static styling only (no new animation — A12). */}
        {/* CANON: the दीये never sit on the page field — they sit on the
            night-warm two-stop surface (radius 22, 8px/20px violet lift), the
            count printed under them in warm brass on the dark. */}
        <div className="bg-night-warm rounded-surface px-3 py-[18px] flex flex-col items-center gap-2.5 shadow-[0_8px_20px_rgba(42,27,61,.28)]">
          <div className="flex items-end justify-center gap-1" role="img" aria-label={`चरण ${step} / 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`text-[40px] leading-none select-none transition-opacity ${
                  n < step ? "opacity-100" : n === step ? "opacity-100 pa-diya-halo rounded-full" : "opacity-30 grayscale"
                }`}
                aria-hidden="true"
              >
                🪔
              </span>
            ))}
          </div>
          <span className="text-[18px] font-extrabold text-[#FFE9C4] font-hindi">
            {step > 1 ? `${step - 1}/5 दीये जल गए` : `चरण ${step} / 5`}
          </span>
        </div>


        {errorMsg && (
          <div className="px-4 py-3 bg-red-50 rounded-card border-2 border-danger/30">
            <p className="text-danger text-[18px] font-bold text-center leading-snug font-hindi">{errorMsg}</p>
          </div>
        )}

        {step === 1 && (
          <StepR1 specs={specs} setSpecs={setSpecs} dakshina={dakshina} setDakshina={setDakshina} />
        )}
        {step === 2 && (
          <StepR2
            specs={specs.length ? specs : snapshot.specializations}
            canBring={canBring}
            setCanBring={(v) => {
              setErrorMsg("");
              setCanBring(v);
            }}
            editorPuja={editorPuja}
            setEditorPuja={setEditorPuja}
            samagriTiersByPuja={snapshot.samagriTiersByPuja}
            onEditorSaved={async () => {
              setEditorPuja(null);
              await refreshSnapshot();
            }}
          />
        )}
        {step === 3 && <StepR3 travel={travel} setTravel={setTravel} />}
        {step === 4 && (
          <StepR4
            dietary={dietary}
            setDietary={setDietary}
            hotelFoodOk={hotelFoodOk}
            setHotelFoodOk={setHotelFoodOk}
            allergies={allergies}
            setAllergies={setAllergies}
            allowance={allowance}
            setAllowance={setAllowance}
            stayHome={stayHome}
            setStayHome={setStayHome}
            hotelTier={hotelTier}
            setHotelTier={setHotelTier}
            sharedRoomOk={sharedRoomOk}
            setSharedRoomOk={setSharedRoomOk}
            dharamshalaOk={dharamshalaOk}
            setDharamshalaOk={setDharamshalaOk}
            advanceNoticeDays={advanceNoticeDays}
            setAdvanceNoticeDays={setAdvanceNoticeDays}
          />
        )}
        {step === 5 && (
          <StepR5
            aadhaarUrl={aadhaarUrl}
            aadhaarBackUrl={aadhaarBackUrl}
            uploading={uploading}
            uploadingBack={uploadingBack}
            onFileUpload={handleFileUpload}
            aadhaarNumber={aadhaarNumber}
            setAadhaarNumber={setAadhaarNumber}
            aadhaarConsent={aadhaarConsent}
            setAadhaarConsent={setAadhaarConsent}
            paymentType={paymentType}
            setPaymentType={setPaymentType}
            bank={bank}
            setBank={setBank}
            upi={upi}
            setUpi={setUpi}
            speak={speak}
          />
        )}
      </main>

      {/* Footer: primary CTA + exit-any-time, beside शिष्य */}
      {!editorPuja && (
        <footer className="shrink-0 bg-white border-t border-saffron-100 flex items-end p-3 gap-3">
          <div className="flex-1 flex flex-col gap-2">
            <div ref={nextBtnRef}>
              <Button variant="primary" size="lg" fullWidth onClick={saveHandlers[step - 1]} loading={saving}>
                {/* CANON frames 14-16 label their CTA "सहेजें व आगे" (an
                    आप-subjunctive — register-safe); R5 keeps its finish
                    label, R1/R2 the generic आगे. */}
                {step === 5 ? t("readiness.finishBtn") : step >= 3 ? "सहेजें व आगे" : t("common.next")}
              </Button>
            </div>
            <Button variant="ghost" size="md" fullWidth onClick={exitForLater}>
              {t("readiness.exitBtn")}
            </Button>
          </div>
          <ShishyaOrb />
        </footer>
      )}
    </div>
  );
}

// ── shared chip ──────────────────────────────────────────────
// CANON (frames 14/15/16): a chip is a PILL — min-height 56, padding 12/18,
// radius 999. Selected = sindoor fill #B23A1A on #FFF6E9 with the 5px/12px
// sindoor lift and a TRAILING check; unselected = #FFFDF8 on a 2px hairline.
// The hairline is peach (#F4B096) on the भोजन board and sand (#E7DCC9) on the
// यात्रा/ठहरना boards — hence `tone`. `shape="tile"` is the होटल-दर्जा row
// (radius 14, equal thirds, centred).
function Chip({
  label,
  selected,
  onClick,
  tone = "sand",
  shape = "pill",
  textCheck = false,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  tone?: "sand" | "warm";
  shape?: "pill" | "tile";
  /** Canon prints the KM chips' ✓ as literal label text (frame 15); every
      other selected chip draws the Material check glyph (frame 14, 20px). */
  textCheck?: boolean;
}) {
  const idle =
    tone === "warm"
      ? "bg-card border-saffron-200 text-saffron-700"
      : "bg-card border-sand-200 text-temple-700";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[56px] border-2 text-[18px] font-extrabold font-hindi leading-snug transition-all active:scale-[0.97] flex items-center justify-center gap-[9px] ${
        shape === "tile" ? "flex-1 rounded-[14px] px-3 py-2.5 text-center" : "rounded-chip px-[18px] py-3"
      } ${
        selected ? "bg-saffron-500 border-saffron-500 text-chandan shadow-chip" : idle
      }`}
    >
      <span>{label}</span>
      {selected &&
        (textCheck ? (
          <span aria-hidden="true">✓</span>
        ) : (
          <span className="material-symbols-outlined text-[20px] leading-none" aria-hidden="true">check</span>
        ))}
    </button>
  );
}

function YesNoRow({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Chip label={t("common.yes")} selected={value === true} onClick={() => onChange(true)} />
      <Chip label={t("common.no")} selected={value === false} onClick={() => onChange(false)} />
    </div>
  );
}

// CANON frame 16 option row: min-height 60, padding 14px/16px, r16, a 28px
// leading emoji and the label filling the row. Selected = #FDEEE7 behind a
// 2.5px #B23A1A rule with the 5px/14px lift, label 18/900 #7A250E and a
// trailing 26px sindoor check bubble (Material check 18px); resting =
// #FFFDF8 on a 2px #E7DCC9 hairline, label 18/800 #341A13.
function StayRow({
  emoji,
  label,
  selected,
  onClick,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full min-h-[60px] rounded-[16px] px-4 py-[14px] flex items-center gap-3 text-left transition-all active:scale-[0.98] ${
        selected
          ? "bg-saffron-50 border-[2.5px] border-saffron-500 shadow-[0_5px_14px_rgba(178,58,26,0.14)]"
          : "bg-card border-2 border-sand-200"
      }`}
    >
      <span className="text-[28px] leading-none shrink-0" aria-hidden="true">{emoji}</span>
      <span
        className={`flex-1 text-[18px] font-hindi leading-snug ${
          selected ? "font-black text-saffron-700" : "font-extrabold text-temple-700"
        }`}
      >
        {label}
      </span>
      {selected && (
        <span
          className="w-[26px] h-[26px] rounded-full bg-saffron-500 text-white flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-[18px] leading-none">check</span>
        </span>
      )}
    </button>
  );
}

// CANON frame 15: the travel modes are a 2×2 tile GRID, not switch rows —
// each tile r18, padding 18px/12px, column-centred, 34px emoji over the
// 17/800 label (→ 18px floor). Chosen = #FDEEE7 behind a 2.5px #B23A1A rule
// with the 5px/14px sindoor-soft lift and a 24px check bubble pinned
// top-right (Material check 17px); resting = #FFFDF8 on a 2px #E7DCC9
// hairline, label #341A13. Tap toggles the mode (the old 72×36 switch and
// its ToggleRow retired with this redraw). Labels arrive as "🚗 अपनी गाड़ी" —
// the leading emoji splits out of the string.
function ModeTile({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  const m = label.match(/^(\p{Extended_Pictographic}️?)\s+(.*)$/u);
  const emoji = m ? m[1] : null;
  const text = m ? m[2] : label;
  return (
    <button
      type="button"
      onClick={() => onToggle(!enabled)}
      aria-pressed={enabled}
      className={`relative min-h-[52px] rounded-tile px-3 py-[18px] flex flex-col items-center justify-center gap-1.5 text-center transition-all active:scale-[0.97] ${
        enabled
          ? "bg-saffron-50 border-[2.5px] border-saffron-500 shadow-sindoor-soft"
          : "bg-card border-2 border-sand-200"
      }`}
    >
      {enabled && (
        <span
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-saffron-500 text-white flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-[17px] leading-none">check</span>
        </span>
      )}
      {emoji && (
        <span className="text-[34px] leading-none" aria-hidden="true">
          {emoji}
        </span>
      )}
      <span
        className={`text-[18px] font-extrabold font-hindi leading-snug ${
          enabled ? "text-saffron-700" : "text-temple-700"
        }`}
      >
        {text}
      </span>
    </button>
  );
}

/** the text half of a "🚗 अपनी गाड़ी"-shaped mode label (for sub-headings) */
const modeText = (label: string): string =>
  label.replace(/^(\p{Extended_Pictographic}️?)\s+/u, "");

// ── canon type + strip vocabulary (frames 13-16) ─────────────
// The board question is 22px/900 in sindoor-dark; the sub-label under it is
// 17px/800 temple-dark (raised to the 18sp floor here — see lawConflicts).
function SectionQ({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[22px] font-black text-saffron-700 font-hindi leading-snug">{children}</span>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[18px] font-extrabold text-temple-700 font-hindi leading-snug">{children}</span>
  );
}

// Canon's advisory strip: a flat tinted bar, radius 14, 12/14 padding, icon
// then text — peach for a tip (frame 14), leaf for a reassurance (frame 13).
function Strip({
  icon,
  tone = "peach",
  children,
}: {
  /** Emoji string where canon draws an emoji (💡), or a node for canon's
      Material glyphs (the F13 lock strip). */
  icon: React.ReactNode;
  tone?: "peach" | "leaf";
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center gap-[9px] rounded-[14px] px-[14px] py-3 text-[18px] font-bold font-hindi leading-snug ${
        tone === "leaf" ? "bg-leaf-100 text-leaf-700" : "bg-peach text-saffron-700"
      }`}
    >
      <span className="text-[20px] shrink-0" aria-hidden="true">
        {icon}
      </span>
      <span>{children}</span>
    </div>
  );
}

// ── R1: पूजाएँ + दक्षिणा ─────────────────────────────────────
function StepR1({
  specs,
  setSpecs,
  dakshina,
  setDakshina,
}: {
  specs: string[];
  setSpecs: (v: string[]) => void;
  dakshina: Record<string, string>;
  setDakshina: (v: Record<string, string>) => void;
}) {
  // Q3: the printed card labels are speakable — "सत्यनारायण कथा" (or
  // just "सत्यनारायण") toggles the card exactly like a tap.
  useVoiceOptions(
    SPEC_LIST.map((spec) => ({
      label: specLabel(spec.id),
      onSelect: () =>
        setSpecs(
          specs.includes(spec.id) ? specs.filter((id) => id !== spec.id) : [...specs, spec.id],
        ),
    })),
  );
  return (
    <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-4">
      <SectionQ>{t("readiness.r1SpecLabel")}</SectionQ>
      {/* CANON frame 15 mode-tile: radius 18, 18/12 padding, 34px glyph over a
          17px/800 label, chosen tiles tinted #FDEEE7 behind a 2.5px sindoor
          edge + the 5px/14px soft lift, with the check drawn as a 24px bubble
          pinned top-right. The old #FF9933 fill is not a canon colour at all. */}
      <div className="grid grid-cols-2 gap-3">
        {SPEC_LIST.map((spec) => {
          const isSelected = specs.includes(spec.id);
          return (
            <div
              key={spec.id}
              onClick={() =>
                setSpecs(isSelected ? specs.filter((id) => id !== spec.id) : [...specs, spec.id])
              }
              className={`relative h-[100px] rounded-tile border-2 cursor-pointer flex flex-col items-center justify-center gap-1.5 select-none transition-all active:scale-[0.98] ${
                isSelected
                  ? "bg-saffron-50 border-[2.5px] border-saffron-500 shadow-sindoor-soft"
                  : "bg-card border-sand-200"
              }`}
              style={{ height: "100px" }}
            >
              {isSelected && (
                <span
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-saffron-500 text-white text-[15px] font-black flex items-center justify-center"
                  aria-hidden="true"
                >
                  ✓
                </span>
              )}
              <span className="text-[34px] leading-none">{spec.emoji}</span>
              <span
                className={`text-[18px] font-extrabold font-hindi text-center leading-tight px-1 ${
                  isSelected ? "text-saffron-700" : "text-temple-700"
                }`}
              >
                {specLabel(spec.id)}
              </span>
            </div>
          );
        })}
      </div>

      {specs.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-saffron-100 pt-4">
          <SubLabel>{t("readiness.r1DakshinaLabel")}</SubLabel>
          {specs.map((spec) => (
            <div key={spec} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <VoiceField
                label={specLabel(spec)}
                promptText={`${specLabel(spec)} के लिए आपकी दक्षिणा राशि क्या है?`}
                value={dakshina[spec] || ""}
                onChange={(val) => setDakshina({ ...dakshina, [spec]: val })}
                mode="money"
                placeholder="501 - 500000"
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── R2: सामग्री (dual model) ─────────────────────────────────
function StepR2({
  specs,
  canBring,
  setCanBring,
  editorPuja,
  setEditorPuja,
  samagriTiersByPuja,
  onEditorSaved,
}: {
  specs: string[];
  canBring: boolean | null;
  setCanBring: (v: boolean) => void;
  editorPuja: string | null;
  setEditorPuja: (v: string | null) => void;
  samagriTiersByPuja: Record<string, number>;
  onEditorSaved: () => void | Promise<void>;
}) {
  if (editorPuja) {
    return <SamagriPackageEditor pujaType={editorPuja} onSaved={() => void onEditorSaved()} />;
  }

  return (
    <>
      {/* J2: हाँ/नहीं for the सामग्री question live in the wizard shell's
          step-aware command registry — no separate listener here. */}
      <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-4">
        <h2 className="text-[22px] font-black text-saffron-700 font-hindi leading-snug">
          {t("readiness.r2Question")}
        </h2>
        <YesNoRow value={canBring} onChange={setCanBring} />
        {canBring === false && <Strip icon="🌿" tone="leaf">{t("readiness.r2NoInfo")}</Strip>}
      </Card>

      {canBring === true && (
        <div className="flex flex-col gap-3">
          <Strip icon="💡">{t("readiness.r2BuilderHint")}</Strip>
          {specs.map((spec) => {
            const done = samagriTiersByPuja[spec] > 0;
            return (
              <Card
                key={spec}
                clickable
                onClick={() => setEditorPuja(spec)}
                className="p-5 border-l-4 border-l-saffron-500 flex justify-between items-center min-h-[80px]"
              >
                <span className="text-[20px] font-extrabold text-temple-700 font-hindi">{specLabel(spec)}</span>
                {/* CANON status chip: pill, tinted field, 800 weight */}
                <span
                  className={`text-[18px] font-extrabold font-hindi px-[11px] py-1 rounded-chip ${
                    done ? "bg-leaf-100 text-leaf-700" : "bg-saffron-50 text-saffron-500"
                  }`}
                >
                  {done ? t("readiness.r2PujaDone") : t("readiness.r2PujaPending")}
                </span>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

// ── R3: यात्रा (card-selects, all optional-with-default-off) ─
function StepR3({ travel, setTravel }: { travel: TravelPrefs; setTravel: (v: TravelPrefs) => void }) {
  const toggleExclusion = (key: string) => {
    let next: string[];
    if (key === "NONE") {
      next = travel.exclusions.includes("NONE") ? [] : ["NONE"];
    } else {
      const without = travel.exclusions.filter((e) => e !== "NONE");
      next = without.includes(key) ? without.filter((e) => e !== key) : [...without, key];
    }
    setTravel({ ...travel, exclusions: next });
  };

  return (
    <>
      {/* CANON frame 15 opens on the board question, not straight on controls. */}
      <SectionQ>कैसे यात्रा करेंगे?</SectionQ>

      {/* CANON frame 15 MODE GRID — 2×2 tiles, gap 12px; tap toggles the
          mode, the top-right check bubble = enabled. The per-mode switch
          rows (ToggleRow) retired with this redraw; the mode sub-options
          follow below the grid. Canon's labels are 🏍️ खुद जाऊँगा · 🚂 ट्रेन ·
          🚌 बस · ✈️ फ्लाइट — the current strings.ts labels render until that
          copy change lands (strings.ts is out of this port's scope). */}
      <div className="grid grid-cols-2 gap-3">
        <ModeTile
          label={t("readiness.ownVehicle")}
          enabled={travel.ownVehicle.enabled}
          onToggle={(v) => setTravel({ ...travel, ownVehicle: { enabled: v, maxKm: v ? travel.ownVehicle.maxKm : null } })}
        />
        <ModeTile
          label={t("readiness.train")}
          enabled={travel.train.enabled}
          onToggle={(v) => setTravel({ ...travel, train: { enabled: v, classes: v ? travel.train.classes : [] } })}
        />
        <ModeTile
          label={t("readiness.bus")}
          enabled={travel.bus.enabled}
          onToggle={(v) => setTravel({ ...travel, bus: { enabled: v, ac: v ? travel.bus.ac : null } })}
        />
        <ModeTile
          label={t("readiness.flight")}
          enabled={travel.flight.enabled}
          onToggle={(v) => setTravel({ ...travel, flight: { enabled: v } })}
        />
      </div>

      {travel.ownVehicle.enabled && (
        <div className="flex flex-col gap-2">
          {/* canon: "कितनी दूर तक?" 17/800 (→ 18px floor) directly on the page */}
          <SubLabel>{t("readiness.ownVehicleKm")}</SubLabel>
          {/* CANON frame 15: the distance chips WRAP as pills; their ✓ is
              literal label text in canon, so textCheck keeps it that way */}
          <div className="flex flex-wrap gap-2.5">
            {KM_PRESETS.map(({ km, label }) => (
              <Chip
                key={km}
                label={label}
                textCheck
                selected={travel.ownVehicle.maxKm === km}
                onClick={() => setTravel({ ...travel, ownVehicle: { enabled: true, maxKm: km } })}
              />
            ))}
            {/* legacy passthrough: a saved value from the old preset set
                (e.g. 200/500) stays visible + selected — never silently lost */}
            {travel.ownVehicle.maxKm != null && !KM_PRESETS.some((p) => p.km === travel.ownVehicle.maxKm) && (
              <Chip
                label={t("readiness.kmUnit").replace("{km}", String(travel.ownVehicle.maxKm))}
                textCheck
                selected
                onClick={() => { /* already the saved value */ }}
              />
            )}
          </div>
          <Strip icon="💡">{t("readiness.ownVehicleRate")}</Strip>
        </div>
      )}

      {travel.train.enabled && (
        <div className="flex flex-col gap-2">
          <SubLabel>{modeText(t("readiness.train"))}</SubLabel>
          <div className="flex flex-wrap gap-2.5">
            {[
              { key: "SLEEPER", label: t("readiness.trainSleeper") },
              { key: "3AC", label: t("readiness.train3ac") },
              { key: "2AC", label: t("readiness.train2ac") },
            ].map((c) => (
              <Chip
                key={c.key}
                label={c.label}
                selected={travel.train.classes.includes(c.key)}
                onClick={() =>
                  setTravel({
                    ...travel,
                    train: {
                      enabled: true,
                      classes: travel.train.classes.includes(c.key)
                        ? travel.train.classes.filter((x) => x !== c.key)
                        : [...travel.train.classes, c.key],
                    },
                  })
                }
              />
            ))}
          </div>
        </div>
      )}

      {travel.bus.enabled && (
        <div className="flex flex-col gap-2">
          <SubLabel>{modeText(t("readiness.bus"))}</SubLabel>
          <div className="flex flex-wrap gap-2.5">
            <Chip
              label={t("readiness.busAc")}
              selected={travel.bus.ac === "AC"}
              onClick={() => setTravel({ ...travel, bus: { enabled: true, ac: "AC" } })}
            />
            <Chip
              label={t("readiness.busNonAc")}
              selected={travel.bus.ac === "NON_AC"}
              onClick={() => setTravel({ ...travel, bus: { enabled: true, ac: "NON_AC" } })}
            />
          </div>
        </div>
      )}

      {/* इकोनॉमी moved out of the tile label (canon keeps tile labels bare) */}
      {travel.flight.enabled && (
        <Strip icon="💡">{`${modeText(t("readiness.flight"))} — ${t("readiness.flightEconomy")}`}</Strip>
      )}

      {/* doc edge-case 8: undisclosed flying fear — परहेज़ multi-chips */}
      <div className="flex flex-col gap-2">
        <SubLabel>{t("readiness.exclusionsLabel")}</SubLabel>
        <div className="flex flex-wrap gap-2.5">
          <Chip
            label={t("readiness.exclNoFlight")}
            selected={travel.exclusions.includes("NO_FLIGHT")}
            onClick={() => toggleExclusion("NO_FLIGHT")}
          />
          <Chip
            label={t("readiness.exclNoNight")}
            selected={travel.exclusions.includes("NO_NIGHT")}
            onClick={() => toggleExclusion("NO_NIGHT")}
          />
          <Chip
            label={t("readiness.exclNone")}
            selected={travel.exclusions.includes("NONE")}
            onClick={() => toggleExclusion("NONE")}
          />
        </div>
      </div>

      <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-3">
        <SectionQ>{t("readiness.localCabQ")}</SectionQ>
        <YesNoRow
          value={travel.localCabOk}
          onChange={(v) => setTravel({ ...travel, localCabOk: v })}
        />
      </Card>

      {/* PRICE-HONESTY METER — mockup chip-toggle look, numbers computed from the
          real costing rules. Seeds its travel toggle from his current choice. */}
      <PriceHonestyMeter dakshina={2100} initialPrefs={{ travel: travel.ownVehicle.enabled }} />
    </>
  );
}

// ── R4: भोजन व ठहराव ─────────────────────────────────────────
function StepR4(props: {
  dietary: string | null;
  setDietary: (v: string | null) => void;
  hotelFoodOk: boolean | null;
  setHotelFoodOk: (v: boolean) => void;
  allergies: string;
  setAllergies: (v: string) => void;
  allowance: string;
  setAllowance: (v: string) => void;
  stayHome: boolean | null;
  setStayHome: (v: boolean) => void;
  hotelTier: string | null;
  setHotelTier: (v: string | null) => void;
  sharedRoomOk: boolean | null;
  setSharedRoomOk: (v: boolean) => void;
  dharamshalaOk: boolean | null;
  setDharamshalaOk: (v: boolean) => void;
  advanceNoticeDays: number | null;
  setAdvanceNoticeDays: (v: number) => void;
}) {
  const diets = [
    { key: "ANY", label: t("readiness.dietAny") },
    { key: "PURE_VEG", label: t("readiness.dietPureVeg") },
    { key: "JAIN", label: t("readiness.dietJain") },
    { key: "VEGAN", label: t("readiness.dietVegan") },
  ];
  const tiers = [
    { key: "BUDGET", label: t("readiness.hotelBudget") },
    { key: "THREE_STAR", label: t("readiness.hotel3Star") },
    { key: "FOUR_STAR_PLUS", label: t("readiness.hotel4Star") },
  ];

  return (
    <>
      {/* CANON frame 14: भोजन chips wrap as peach-edged pills under the board
          question, and the board closes on the यजमान-reassurance tip strip.
          Question is canon's sentence verbatim (the one-word strings.ts
          dietaryLabel "भोजन" stays for the R4 title elsewhere). */}
      <SectionQ>आप क्या भोजन लेते हैं?</SectionQ>
      <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2.5">
          {diets.map((d) => (
            <Chip
              key={d.key}
              tone="warm"
              label={d.label}
              selected={props.dietary === d.key}
              onClick={() => props.setDietary(d.key)}
            />
          ))}
        </div>
        <Strip icon="💡">यजमान को पहले से पता रहेगा — कोई असहजता नहीं</Strip>
      </Card>

      <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-3">
        <SectionQ>{t("readiness.hotelFoodQ")}</SectionQ>
        <YesNoRow value={props.hotelFoodOk} onChange={props.setHotelFoodOk} />
      </Card>

      <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-4">
        <VoiceField
          label={t("readiness.allergiesLabel")}
          promptText={t("readiness.allergiesLabel")}
          value={props.allergies}
          onChange={props.setAllergies}
          mode="text"
          placeholder={t("readiness.allergiesPlaceholder")}
        />
        <div className="flex flex-col gap-1">
          <VoiceField
            label={t("readiness.allowanceLabel")}
            promptText={`${t("readiness.allowanceLabel")} — ${t("readiness.allowanceNote")}`}
            value={props.allowance}
            onChange={props.setAllowance}
            mode="money"
            placeholder={t("readiness.allowancePlaceholder")}
          />
          <Strip icon="💡">{t("readiness.allowanceNote")}</Strip>
        </div>
      </Card>

      <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-3">
        {/* CANON frame 16: the stay board is ONE list of option rows under
            canon's question. The rows map onto the SHIPPED columns — 🏠 =
            stayHome true, 🏨 = stayHome false (the pair is exclusive, same
            boolean), 🛕 = dharamshalaOk as an independent toggle. The old
            stayQ/dharamshalaQ Yes-No pairs retired with this redraw; the
            API payload is unchanged. */}
        <SectionQ>दूर की पूजा में कहाँ रुकेंगे?</SectionQ>
        <div className="flex flex-col gap-[11px]">
          <StayRow
            emoji="🏠"
            label="घर पर ठीक हूँ"
            selected={props.stayHome === true}
            onClick={() => props.setStayHome(true)}
          />
          <StayRow
            emoji="🏨"
            label="होटल चाहिए"
            selected={props.stayHome === false}
            onClick={() => props.setStayHome(false)}
          />
          <StayRow
            emoji="🛕"
            label="धर्मशाला"
            selected={props.dharamshalaOk === true}
            onClick={() => props.setDharamshalaOk(props.dharamshalaOk !== true)}
          />
        </div>
        <div className="flex flex-col gap-2 border-t border-saffron-100 pt-3">
          <SubLabel>{t("readiness.hotelTierLabel")}</SubLabel>
          {/* CANON frame 16: होटल-दर्जा is ONE row of equal thirds, radius 14 */}
          <div className="flex gap-2.5">
            {tiers.map((t) => (
              <Chip
                key={t.key}
                shape="tile"
                label={t.label}
                selected={props.hotelTier === t.key}
                onClick={() => props.setHotelTier(t.key)}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-saffron-100 pt-3">
          <SubLabel>{t("readiness.sharedRoomQ")}</SubLabel>
          <YesNoRow value={props.sharedRoomOk} onChange={props.setSharedRoomOk} />
        </div>
        <div className="flex flex-col gap-2 border-t border-saffron-100 pt-3">
          <SubLabel>{t("readiness.advanceNoticeQ")}</SubLabel>
          <div className="flex flex-wrap gap-2.5">
            {[
              { days: 0, label: "उसी दिन भी" },
              { days: 1, label: "1 दिन पहले" },
              { days: 2, label: "2 दिन पहले" },
              { days: 3, label: "3+ दिन पहले" },
            ].map((o) => (
              <Chip
                key={o.days}
                label={o.label}
                selected={props.advanceNoticeDays === o.days}
                onClick={() => props.setAdvanceNoticeDays(o.days)}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* PRICE-HONESTY METER on the भोजन/ठहराव prefs screen too — seeded from
          his food-allowance + stay choice; numbers stay computed. */}
      <PriceHonestyMeter
        dakshina={2100}
        initialPrefs={{ food: (parseInt(props.allowance || "0", 10) || 0) > 1000, hotel: props.stayHome === false }}
      />
    </>
  );
}

// ── R5: भुगतान + सत्यापन (moved unchanged from the old wizard) ─
function StepR5(props: {
  aadhaarUrl: string;
  aadhaarBackUrl: string;
  uploading: boolean;
  uploadingBack: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, kind?: "aadhaar-front" | "aadhaar-back") => void;
  aadhaarNumber: string;
  setAadhaarNumber: (v: string) => void;
  aadhaarConsent: boolean;
  setAadhaarConsent: (v: boolean) => void;
  paymentType: "BANK" | "UPI";
  setPaymentType: (v: "BANK" | "UPI") => void;
  bank: { accountName: string; accountNumber: string; accountNumberConfirm: string; ifsc: string };
  setBank: (v: { accountName: string; accountNumber: string; accountNumberConfirm: string; ifsc: string }) => void;
  upi: { id: string };
  setUpi: (v: { id: string }) => void;
  speak: (text: string) => void;
}) {
  const { bank, setBank, upi, setUpi, speak } = props;
  return (
    <>
      {/* Aadhaar — why-first: the "परिवार आप पर भरोसा करेगा" reason is carried by
          शिष्य's voice (R5 narration); the screen shows only a trust chip (anti-text). */}
      <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-[15px]">
        <SubLabel>{t("onboarding.step6Title")}</SubLabel>
        {/* CANON frame 13 opens with the WHY banner — a peach two-stop tile on a
            sand hairline, radius 20, carrying the 40px verified glyph. */}
        <div className="flex items-center gap-[14px] bg-tile-peach border-[1.5px] border-sand rounded-card p-4">
          {/* drawn-not-emoji: canon draws Material verified_user 40px FILL1 leaf */}
          <span className="material-symbols-outlined material-symbols-filled text-[40px] leading-none shrink-0 text-leaf-500" aria-hidden="true">verified_user</span>
          <span className="text-[18px] font-extrabold text-temple-700 font-hindi leading-[1.35]">
            आपकी पहचान =<br />यजमान का भरोसा
          </span>
        </div>
        <AadhaarRow title="आधार — आगे" url={props.aadhaarUrl} uploading={props.uploading}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => props.onFileUpload(e, "aadhaar-front")}
            className="hidden"
          />
        </AadhaarRow>
        {props.aadhaarUrl && <AadhaarPreview keyOrUrl={props.aadhaarUrl} />}
        <AadhaarRow title="आधार — पीछे" url={props.aadhaarBackUrl} uploading={props.uploadingBack}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => props.onFileUpload(e, "aadhaar-back")}
            className="hidden"
          />
        </AadhaarRow>
        {props.aadhaarBackUrl && <AadhaarPreview keyOrUrl={props.aadhaarBackUrl} />}
        {/* drawn-not-emoji: canon's lock strip carries the Material lock glyph */}
        <Strip icon={<span className="material-symbols-outlined leading-none" aria-hidden="true">lock</span>} tone="leaf">आपकी जानकारी सुरक्षित है · AES-256</Strip>

        {/* NUMBER (encrypted server-side; only last-4 stored in clear) */}
        <VoiceField
          label={t("readiness.aadhaarNumberLabel")}
          promptText={t("readiness.aadhaarNumberLabel")}
          value={props.aadhaarNumber}
          onChange={props.setAadhaarNumber}
          mode="number"
          placeholder="1234 5678 9012"
        />

        {/* CONSENT (DPDP — recorded, not just gated) */}
        <label className="flex items-start gap-3 cursor-pointer select-none min-h-[52px]">
          <input
            type="checkbox"
            checked={props.aadhaarConsent}
            onChange={(e) => props.setAadhaarConsent(e.target.checked)}
            className="mt-1 w-6 h-6 accent-saffron-500 shrink-0"
          />
          <span className="text-[18px] text-ink font-hindi leading-snug">{t("readiness.aadhaarConsentLabel")}</span>
        </label>
      </Card>

      {/* Bank / UPI — typed-only by law (A5) */}
      <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-4">
        <label className="text-[18px] font-extrabold text-temple-700 font-hindi">
          {t("onboarding.step7Title")}
        </label>
        <div className="flex bg-slate-100 rounded-tile p-1.5 border border-saffron-100">
          <button
            type="button"
            onClick={() => props.setPaymentType("BANK")}
            className={`flex-1 py-3 text-center rounded-[12px] font-bold text-[18px] font-hindi transition-all ${
              props.paymentType === "BANK" ? "bg-white text-saffron-700 shadow-card" : "text-softgrey"
            }`}
            style={{ minHeight: "56px" }}
          >
            {t("onboarding.bankTab")}
          </button>
          <button
            type="button"
            onClick={() => props.setPaymentType("UPI")}
            className={`flex-1 py-3 text-center rounded-[12px] font-bold text-[18px] font-hindi transition-all ${
              props.paymentType === "UPI" ? "bg-white text-saffron-700 shadow-card" : "text-softgrey"
            }`}
            style={{ minHeight: "56px" }}
          >
            {t("onboarding.upiTab")}
          </button>
        </div>

        {props.paymentType === "BANK" ? (
          <div className="flex flex-col gap-4">
            <VoiceField
              label={t("onboarding.accName")}
              promptText="खाताधारक का नाम क्या है?"
              value={bank.accountName}
              onChange={(val) => setBank({ ...bank, accountName: val })}
              mode="text"
              placeholder="नाम लिखिए"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-[18px] font-extrabold text-temple-700 font-hindi">
                {t("onboarding.accNumber")}
              </label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={bank.accountNumber}
                onChange={(e) => setBank({ ...bank, accountNumber: e.target.value.replace(/\D/g, "") })}
                onFocus={() => speak("सुरक्षा के लिए खाता नंबर लिखकर भरिए")}
                className="w-full h-[56px] px-3 border-2 border-saffron-300 rounded-inset text-[18px] text-ink bg-white focus:outline-none focus:border-saffron-500 font-mono"
                style={{ minHeight: "56px", fontSize: "18px" }}
                placeholder="1234567890"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[18px] font-extrabold text-temple-700 font-hindi">
                {t("onboarding.accNumberConfirm")}
              </label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={bank.accountNumberConfirm}
                onChange={(e) => setBank({ ...bank, accountNumberConfirm: e.target.value.replace(/\D/g, "") })}
                onFocus={() => speak("सुरक्षा के लिए खाता नंबर दोबारा लिखकर भरिए")}
                className="w-full h-[56px] px-3 border-2 border-saffron-300 rounded-inset text-[18px] text-ink bg-white focus:outline-none focus:border-saffron-500 font-mono"
                style={{ minHeight: "56px", fontSize: "18px" }}
                placeholder="1234567890"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[18px] font-extrabold text-temple-700 font-hindi">
                {t("onboarding.ifscCode")}
              </label>
              <input
                type="text"
                value={bank.ifsc}
                onChange={(e) => setBank({ ...bank, ifsc: e.target.value.toUpperCase() })}
                onFocus={() => speak("सुरक्षा के लिए IFSC कोड लिखकर भरिए। यह आपकी बैंक पासबुक या चेक पर मिलेगा।")}
                className="w-full h-[56px] px-3 border-2 border-saffron-300 rounded-inset text-[18px] text-ink bg-white focus:outline-none focus:border-saffron-500 font-mono uppercase"
                style={{ minHeight: "56px", fontSize: "18px" }}
                placeholder="SBIN0001234"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-[18px] font-extrabold text-temple-700 font-hindi">
              {t("onboarding.upiIdLabel")}
            </label>
            <input
              type="text"
              value={upi.id}
              onChange={(e) => setUpi({ id: e.target.value })}
              onFocus={() => speak("सुरक्षा के लिए यूपीआई आईडी लिखकर भरिए")}
              className="w-full h-[56px] px-3 border-2 border-saffron-300 rounded-inset text-[18px] text-ink bg-white focus:outline-none focus:border-saffron-500 font-mono"
              style={{ minHeight: "56px", fontSize: "18px" }}
              placeholder="example@upi"
            />
          </div>
        )}
      </Card>
    </>
  );
}

// CANON frame 13: the document row is an 88×60 thumb tile beside a two-line
// title/status stack. Captured = solid #FFFDF8 behind a 2px leaf-pale edge,
// the tile filled with the sage two-stop and stamped with a 22px leaf check
// bubble. Awaiting = the SAME row with a 2px DASHED peach edge and a peach
// tile holding the camera glyph. Radius 20 on the row, 12 on the tile.
// Each face keeps its OWN <input> at the call site (children) — F05-02 pins
// one image picker per face, and a single shared input would read as one.
function AadhaarRow({
  title,
  url,
  uploading,
  children,
}: {
  title: string;
  url: string;
  uploading: boolean;
  children: React.ReactNode;
}) {
  const done = !!url;
  return (
    <label
      className={`w-full rounded-card border-2 flex items-center gap-[14px] p-[14px] cursor-pointer active:scale-[0.99] transition-transform select-none bg-card ${
        done ? "border-leafpale" : "border-dashed border-saffron-200"
      }`}
    >
      {children}
      <span
        className={`relative w-[88px] h-[60px] shrink-0 rounded-[12px] flex items-center justify-center overflow-hidden ${
          done ? "bg-tile-leaf" : "bg-saffron-50"
        }`}
        aria-hidden="true"
      >
        {/* drawn-not-emoji: canon's thumb glyphs are Material badge (done,
            28px sage) / photo_camera (awaiting, 30px sindoor) */}
        {done ? (
          <span className="material-symbols-outlined text-[28px] leading-none text-[#8A9A7A]">badge</span>
        ) : (
          <span className="material-symbols-outlined text-[30px] leading-none text-saffron-500">photo_camera</span>
        )}
        {done && (
          <span className="absolute bottom-1 right-1 w-[22px] h-[22px] rounded-full bg-leaf-500 text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[15px] leading-none font-black">check</span>
          </span>
        )}
      </span>
      <span className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="text-[20px] font-extrabold text-temple-700 font-hindi leading-snug">{title}</span>
        {uploading ? (
          <span className="text-[18px] font-bold text-saffron-600 font-hindi animate-pulse">
            {t("common.loading")}
          </span>
        ) : done ? (
          <span className="text-[18px] font-bold text-leaf-700 font-hindi">✓ हो गया</span>
        ) : (
          <span className="text-[18px] font-bold text-saffron-500 font-hindi">फ़ोटो लीजिए ›</span>
        )}
      </span>
    </label>
  );
}

function AadhaarPreview({ keyOrUrl }: { keyOrUrl: string }) {
  const { url, refresh } = usePresignedUrl(keyOrUrl);
  if (!url) return null;
  return (
    <div className="mt-2 border-2 border-saffron-100 rounded-card overflow-hidden bg-white max-w-[200px] mx-auto shadow-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Aadhaar Thumbnail" className="w-full h-[120px] object-cover" onError={() => refresh()} />
    </div>
  );
}
