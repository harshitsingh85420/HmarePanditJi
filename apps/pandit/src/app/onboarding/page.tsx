"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hi } from "@/lib/strings";
import { api } from "@/lib/api";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SpeakOnMount } from "@/components/VoiceBar";
import { useVoice } from "@/hooks/useVoice";
import { VoiceField } from "@/components/voice/VoiceField";
import { usePresignedUrl } from "@/hooks/usePresignedUrl";

interface DraftState {
  step: number;
  name: string;
  city: string;
  specializations: string[];
  experience: number;
  teamSize: number;
  dakshina: Record<string, string>;
  aadhaarUrl: string;
  paymentType: "BANK" | "UPI";
  bank: {
    accountName: string;
    accountNumber: string;
    accountNumberConfirm: string;
    ifsc: string;
  };
  upi: {
    id: string;
  };
}

const DEFAULT_DRAFT: DraftState = {
  step: 1,
  name: "",
  city: "",
  specializations: [],
  experience: 0,
  teamSize: 1,
  dakshina: {},
  aadhaarUrl: "",
  paymentType: "BANK",
  bank: {
    accountName: "",
    accountNumber: "",
    accountNumberConfirm: "",
    ifsc: "",
  },
  upi: {
    id: "",
  },
};

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

export default function OnboardingPage() {
  const router = useRouter();
  const { speak } = useVoice();

  const [draft, setDraft] = useState<DraftState>(DEFAULT_DRAFT);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDoneScreen, setShowDoneScreen] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlStep = searchParams.get("step");

    const saved = localStorage.getItem("onboarding_draft");
    let currentDraft = DEFAULT_DRAFT;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        currentDraft = { ...DEFAULT_DRAFT, ...parsed };
      } catch (e) {
        console.warn("Failed to parse onboarding draft", e);
      }
    }

    if (urlStep) {
      currentDraft.step = parseInt(urlStep, 10);
    }

    setDraft(currentDraft);
    localStorage.setItem("onboarding_draft", JSON.stringify(currentDraft));
    setIsLoaded(true);
  }, []);

  // Save draft to localStorage on change
  const updateDraft = (updates: Partial<DraftState>) => {
    setDraft((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem("onboarding_draft", JSON.stringify(next));
      return next;
    });
  };

  const updateBank = (updates: Partial<DraftState["bank"]>) => {
    setDraft((prev) => {
      const nextBank = { ...prev.bank, ...updates };
      const next = { ...prev, bank: nextBank };
      localStorage.setItem("onboarding_draft", JSON.stringify(next));
      return next;
    });
  };

  const updateUpi = (updates: Partial<DraftState["upi"]>) => {
    setDraft((prev) => {
      const nextUpi = { ...prev.upi, ...updates };
      const next = { ...prev, upi: nextUpi };
      localStorage.setItem("onboarding_draft", JSON.stringify(next));
      return next;
    });
  };

  const validateStep = (stepNum: number): boolean => {
    setErrorMsg("");

    if (stepNum === 1) {
      if (!draft.name || draft.name.trim().length < 3) {
        setErrorMsg(hi.onboarding.nameError);
        speak(hi.common.error);
        return false;
      }
    }

    if (stepNum === 2) {
      if (!draft.city || draft.city.trim().length === 0) {
        setErrorMsg(hi.onboarding.cityError);
        speak(hi.common.error);
        return false;
      }
    }

    if (stepNum === 3) {
      if (draft.specializations.length === 0) {
        setErrorMsg(hi.onboarding.specError);
        speak(hi.common.error);
        return false;
      }
    }

    if (stepNum === 4) {
      // Experience is default 0-60, team is 1-10 (bound validations are in UI steppers)
      return true;
    }

    if (stepNum === 5) {
      for (const spec of draft.specializations) {
        const amount = Number(draft.dakshina[spec] || "");
        if (isNaN(amount) || amount < 501 || amount > 500000) {
          setErrorMsg(hi.onboarding.dakshinaError);
          speak(hi.common.error);
          return false;
        }
      }
    }

    if (stepNum === 6) {
      if (!draft.aadhaarUrl) {
        setErrorMsg(hi.onboarding.aadhaarError);
        speak(hi.common.error);
        return false;
      }
    }

    if (stepNum === 7) {
      if (draft.paymentType === "BANK") {
        if (!draft.bank.accountName.trim()) {
          setErrorMsg(hi.onboarding.paymentError);
          speak(hi.common.error);
          return false;
        }
        if (!/^\d{9,18}$/.test(draft.bank.accountNumber)) {
          setErrorMsg(hi.onboarding.paymentError);
          speak(hi.common.error);
          return false;
        }
        if (draft.bank.accountNumber !== draft.bank.accountNumberConfirm) {
          setErrorMsg(hi.onboarding.accMismatch);
          speak(hi.common.error);
          return false;
        }
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(draft.bank.ifsc)) {
          setErrorMsg(hi.onboarding.paymentError);
          speak(hi.common.error);
          return false;
        }
      } else {
        if (!/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(draft.upi.id)) {
          setErrorMsg(hi.onboarding.paymentError);
          speak(hi.common.error);
          return false;
        }
      }
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateStep(draft.step)) return;

    if (draft.step < 7) {
      updateDraft({ step: draft.step + 1 });
    } else {
      // Step 7 next => Submit full onboarding
      await handleSubmit();
    }
  };

  const handleBack = () => {
    setErrorMsg("");
    if (draft.step > 1) {
      updateDraft({ step: draft.step - 1 });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("pandit_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"}/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const json = await res.json();
      setUploading(false);

      if (json.success && (json.data?.key || json.data?.url)) {
        updateDraft({ aadhaarUrl: json.data.key || json.data.url });
      } else {
        setErrorMsg(json.error?.message || hi.common.error);
        speak(hi.common.error);
      }
    } catch (err) {
      setUploading(false);
      setErrorMsg(hi.common.error);
      speak(hi.common.error);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg("");

    const payload = {
      name: draft.name,
      city: draft.city,
      specializations: draft.specializations,
      experience: draft.experience,
      teamSize: draft.teamSize,
      dakshina: draft.dakshina,
      aadhaarUrl: draft.aadhaarUrl,
      payment: {
        type: draft.paymentType,
        bank: draft.paymentType === "BANK" ? {
          accountName: draft.bank.accountName,
          accountNumber: draft.bank.accountNumber,
          ifsc: draft.bank.ifsc,
        } : undefined,
        upi: draft.paymentType === "UPI" ? {
          id: draft.upi.id,
        } : undefined,
      },
    };

    const res = await api("/pandit/onboarding", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error?.message || hi.common.error);
      speak(hi.common.error);
      return;
    }

    // Success: Clear localStorage draft and show Done Screen
    localStorage.removeItem("onboarding_draft");
    setShowDoneScreen(true);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <span className="text-[20px] font-hindi font-bold">{hi.common.loading}</span>
      </div>
    );
  }

  if (showDoneScreen) {
    return (
      <div className="fixed inset-0 bg-cream text-ink flex flex-col justify-between p-6 z-50">
        <SpeakOnMount text={hi.onboarding.doneVoice} />
        
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 max-w-[430px] mx-auto">
          <span className="text-[100px] select-none leading-none">🎉</span>
          <h1 className="text-[36px] font-bold text-temple-700 font-hindi">
            {hi.onboarding.doneTitle}
          </h1>
          <p className="text-[20px] font-medium text-slate-700 font-hindi leading-relaxed">
            {hi.onboarding.doneVoice}
          </p>
        </div>

        <div className="max-w-[430px] mx-auto w-full pb-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => router.push("/home")}
            style={{ minHeight: "64px", fontSize: "20px" }}
          >
            {hi.onboarding.homeBtn}
          </Button>
        </div>
      </div>
    );
  }

  // Get vocal instruction text
  const stepVoices = [
    hi.onboarding.step1Voice,
    hi.onboarding.step2Voice,
    hi.onboarding.step3Voice,
    hi.onboarding.step4Voice,
    hi.onboarding.step5Voice,
    hi.onboarding.step6Voice,
    hi.onboarding.step7Voice,
  ];
  const stepTitles = [
    hi.onboarding.step1Title,
    hi.onboarding.step2Title,
    hi.onboarding.step3Title,
    hi.onboarding.step4Title,
    hi.onboarding.step5Title,
    hi.onboarding.step6Title,
    hi.onboarding.step7Title,
  ];

  return (
    <div className="min-h-screen bg-cream text-ink pb-28">
      {/* Dynamic Header */}
      <Header title={stepTitles[draft.step - 1]} showBack={draft.step > 1} onBack={handleBack} />

      {/* Voice Assistant component */}
      <SpeakOnMount text={stepVoices[draft.step - 1]} key={draft.step} />

      <main className="max-w-[430px] mx-auto px-4 pt-4 flex flex-col gap-5">
        
        {/* HUGE PROGRESS DOTS */}
        <div className="flex flex-col items-center gap-2 my-2">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  s === draft.step
                    ? "bg-saffron w-8"
                    : s < draft.step
                    ? "bg-saffron-300"
                    : "bg-slate-300"
                }`}
              />
            ))}
          </div>
          <span className="text-[16px] font-bold text-softgrey font-mono mt-1">
            Step {draft.step} of 7
          </span>
        </div>

        {/* ERROR BOX */}
        {errorMsg && (
          <div className="px-4 py-3 bg-red-50 rounded-card border-2 border-danger/30">
            <p className="text-danger text-[18px] font-bold text-center leading-snug font-hindi">
              {errorMsg}
            </p>
          </div>
        )}

        {/* STEP-BY-STEP CONTENTS */}
        <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-4">
          
          {/* STEP 1: Name */}
          {draft.step === 1 && (
            <VoiceField
              label={hi.onboarding.step1Title}
              promptText={hi.onboarding.step1Voice}
              value={draft.name}
              onChange={(val) => updateDraft({ name: val })}
              mode="text"
              required
              onComplete={handleNext}
              placeholder="पंडित जी का नाम लिखें"
            />
          )}

          {/* STEP 2: City */}
          {draft.step === 2 && (
            <VoiceField
              label={hi.onboarding.step2Title}
              promptText={hi.onboarding.step2Voice}
              value={draft.city}
              onChange={(val) => updateDraft({ city: val })}
              mode="choice"
              choices={[
                { label: "दिल्ली", value: "Delhi", keywords: ["दिल्ली", "delhi", "dilli", "देहली"] },
                { label: "नोएडा", value: "Noida", keywords: ["नोएडा", "noida", "नोयडा"] },
                { label: "गुरुग्राम", value: "Gurugram", keywords: ["गुरुग्राम", "gurugram", "gurgaon", "गुड़गांव", "गुड़गाँव"] },
                { label: "गाज़ियाबाद", value: "Ghaziabad", keywords: ["गाज़ियाबाद", "ghaziabad", "गाजियाबाद"] },
                { label: "फरीदाबाद", value: "Faridabad", keywords: ["फरीदाबाद", "faridabad"] }
              ]}
              required
              onComplete={handleNext}
              placeholder="शहर चुनें या लिखें"
            />
          )}

          {/* STEP 3: Specializations */}
          {draft.step === 3 && (
            <div className="flex flex-col gap-3">
              <label className="text-[18px] font-bold text-temple-700 font-hindi">
                {hi.onboarding.step3Title}
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {SPEC_LIST.map((spec) => {
                  const isSelected = draft.specializations.includes(spec.id);
                  const labelText = (hi.onboarding.specializations as any)[spec.id] || spec.id;
                  
                  return (
                    <div
                      key={spec.id}
                      onClick={() => {
                        const nextSpecs = isSelected
                          ? draft.specializations.filter((id) => id !== spec.id)
                          : [...draft.specializations, spec.id];
                        updateDraft({ specializations: nextSpecs });
                      }}
                      className={`h-[100px] rounded-card border-2 cursor-pointer flex flex-col items-center justify-center gap-1 select-none transition-all ${
                        isSelected
                          ? "bg-[#FF9933] border-[#FF9933] text-white shadow-md"
                          : "bg-white border-saffron-200 text-ink"
                      }`}
                      style={{ height: "100px" }}
                    >
                      <span className="text-[28px]">{spec.emoji}</span>
                      <span className="text-[16px] font-bold font-hindi text-center leading-tight">
                        {isSelected && "✓ "}
                        {labelText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Experience & Team */}
          {draft.step === 4 && (
            <div className="flex flex-col gap-6">
              <VoiceField
                label={hi.onboarding.experienceLabel}
                promptText="आपकी पूजा-पाठ का अनुभव कितने साल का है?"
                value={draft.experience ? String(draft.experience) : ""}
                onChange={(val) => updateDraft({ experience: Number(val) || 0 })}
                mode="number"
                placeholder="अनुभव वर्ष लिखें"
              />
              <VoiceField
                label={hi.onboarding.teamLabel}
                promptText="आपके दल में कुल कितने पंडित हैं?"
                value={draft.teamSize ? String(draft.teamSize) : ""}
                onChange={(val) => updateDraft({ teamSize: Number(val) || 1 })}
                mode="number"
                placeholder="दल के सदस्यों की संख्या"
              />
            </div>
          )}

          {/* STEP 5: Dakshina */}
          {draft.step === 5 && (
            <div className="flex flex-col gap-4">
              <label className="text-[18px] font-bold text-temple-700 font-hindi border-b border-saffron-100 pb-2">
                {hi.onboarding.step5Title}
              </label>

              <div className="flex flex-col gap-4">
                {draft.specializations.map((spec) => {
                  const labelText = (hi.onboarding.specializations as any)[spec] || spec;
                  const currentRate = draft.dakshina[spec] || "";

                  return (
                    <div key={spec} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <VoiceField
                        label={labelText}
                        promptText={`${labelText} के लिए आपकी दक्षिणा राशि क्या है?`}
                        value={currentRate}
                        onChange={(val) => updateDraft({
                          dakshina: { ...draft.dakshina, [spec]: val },
                        })}
                        mode="money"
                        placeholder="501 - 500000"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Aadhaar Upload */}
          {draft.step === 6 && (
            <div className="flex flex-col gap-3">
              <label className="text-[18px] font-bold text-temple-700 font-hindi">
                {hi.onboarding.step6Title}
              </label>

              <label className="w-full min-h-[140px] border-2 border-dashed border-saffron-300 rounded-card flex flex-col items-center justify-center p-4 bg-saffron-50/10 cursor-pointer active:bg-saffron-50/30 transition-all select-none">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {uploading ? (
                  <span className="text-[18px] font-bold text-saffron-600 font-hindi animate-pulse">
                    {hi.common.loading}
                  </span>
                ) : (
                  <span className="text-[18px] font-bold text-saffron-600 font-hindi text-center">
                    {hi.onboarding.aadhaarLabel}
                  </span>
                )}
              </label>

              {draft.aadhaarUrl && <AadhaarPreview keyOrUrl={draft.aadhaarUrl} />}
            </div>
          )}

          {/* STEP 7: Bank/UPI */}
          {draft.step === 7 && (
            <div className="flex flex-col gap-4">
              {/* TABS HEADER */}
              <div className="flex bg-slate-100 rounded-btn p-1.5 border border-saffron-100">
                <button
                  type="button"
                  onClick={() => updateDraft({ paymentType: "BANK" })}
                  className={`flex-1 py-3 text-center rounded-btn font-bold text-[18px] font-hindi transition-all ${
                    draft.paymentType === "BANK"
                      ? "bg-white text-saffron-700 shadow-sm"
                      : "text-softgrey"
                  }`}
                  style={{ minHeight: "56px" }}
                >
                  {hi.onboarding.bankTab}
                </button>
                <button
                  type="button"
                  onClick={() => updateDraft({ paymentType: "UPI" })}
                  className={`flex-1 py-3 text-center rounded-btn font-bold text-[18px] font-hindi transition-all ${
                    draft.paymentType === "UPI"
                      ? "bg-white text-saffron-700 shadow-sm"
                      : "text-softgrey"
                  }`}
                  style={{ minHeight: "56px" }}
                >
                  {hi.onboarding.upiTab}
                </button>
              </div>

              {/* BANK PAY DETAILS */}
              {draft.paymentType === "BANK" ? (
                <div className="flex flex-col gap-4">
                  {/* Account Name */}
                  <VoiceField
                    label={hi.onboarding.accName}
                    promptText="खाताधारक का नाम क्या है?"
                    value={draft.bank.accountName}
                    onChange={(val) => updateBank({ accountName: val })}
                    mode="text"
                    placeholder="नाम लिखें"
                  />

                  {/* Account Number */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[18px] font-bold text-temple-700 font-hindi">
                      {hi.onboarding.accNumber}
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={draft.bank.accountNumber}
                      onChange={(e) => updateBank({ accountNumber: e.target.value.replace(/\D/g, "") })}
                      onFocus={() => speak("सुरक्षा के लिए खाता नंबर लिखकर भरें")}
                      className="w-full h-[56px] px-3 border-2 border-saffron-300 rounded-btn text-[18px] text-ink bg-white focus:outline-none focus:border-saffron-500 font-mono"
                      style={{ minHeight: "56px", fontSize: "18px" }}
                      placeholder="1234567890"
                    />
                  </div>

                  {/* Confirm Account Number */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[18px] font-bold text-temple-700 font-hindi">
                      {hi.onboarding.accNumberConfirm}
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={draft.bank.accountNumberConfirm}
                      onChange={(e) => updateBank({ accountNumberConfirm: e.target.value.replace(/\D/g, "") })}
                      onFocus={() => speak("सुरक्षा के लिए खाता नंबर लिखकर भरें")}
                      className="w-full h-[56px] px-3 border-2 border-saffron-300 rounded-btn text-[18px] text-ink bg-white focus:outline-none focus:border-saffron-500 font-mono"
                      style={{ minHeight: "56px", fontSize: "18px" }}
                      placeholder="1234567890"
                    />
                  </div>

                  {/* IFSC Code */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[18px] font-bold text-temple-700 font-hindi">
                      {hi.onboarding.ifscCode}
                    </label>
                    <input
                      type="text"
                      value={draft.bank.ifsc}
                      onChange={(e) => updateBank({ ifsc: e.target.value.toUpperCase() })}
                      onFocus={() => speak("सुरक्षा के लिए खाता नंबर लिखकर भरें")}
                      className="w-full h-[56px] px-3 border-2 border-saffron-300 rounded-btn text-[18px] text-ink bg-white focus:outline-none focus:border-saffron-500 font-mono uppercase"
                      style={{ minHeight: "56px", fontSize: "18px" }}
                      placeholder="SBIN0001234"
                    />
                  </div>
                </div>
              ) : (
                /* UPI PAY DETAILS */
                <div className="flex flex-col gap-1.5">
                  <label className="text-[18px] font-bold text-temple-700 font-hindi">
                    {hi.onboarding.upiIdLabel}
                  </label>
                  <input
                    type="text"
                    value={draft.upi.id}
                    onChange={(e) => updateUpi({ id: e.target.value })}
                    onFocus={() => speak("सुरक्षा के लिए यूपीआई आईडी लिखकर भरें")}
                    className="w-full h-[56px] px-3 border-2 border-saffron-300 rounded-btn text-[18px] text-ink bg-white focus:outline-none focus:border-saffron-500 font-mono"
                    style={{ minHeight: "56px", fontSize: "18px" }}
                    placeholder="example@upi"
                  />
                </div>
              )}
            </div>
          )}

        </Card>
      </main>

      {/* FIXED FOOTER WITH SPLIT NAVIGATION BUTTONS */}
      <footer className="fixed bottom-0 left-0 right-0 h-24 bg-white border-t border-saffron-100 flex p-3 gap-3 z-30">
        <button
          type="button"
          onClick={handleBack}
          disabled={draft.step === 1 || submitting}
          className={`flex-1 h-16 rounded-btn flex items-center justify-center font-bold text-[20px] border-2 transition-all font-hindi active:scale-95 ${
            draft.step === 1
              ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-white border-saffron-300 text-saffron-700 hover:bg-saffron-50"
          }`}
          style={{ minHeight: "64px", fontSize: "20px" }}
        >
          {hi.common.back}
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={submitting}
          className="flex-1 h-16 rounded-btn flex items-center justify-center font-bold text-[20px] bg-saffron hover:bg-saffron-600 text-white transition-all font-hindi active:scale-95 shadow-md"
          style={{ minHeight: "64px", fontSize: "20px" }}
        >
          {submitting ? hi.common.loading : hi.common.next}
        </button>
      </footer>
    </div>
  );
}

function AadhaarPreview({ keyOrUrl }: { keyOrUrl: string }) {
  const { url, refresh } = usePresignedUrl(keyOrUrl);
  if (!url) return null;
  return (
    <div className="mt-2 border-2 border-saffron-100 rounded-card overflow-hidden bg-white max-w-[200px] mx-auto shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Aadhaar Thumbnail"
        className="w-full h-[120px] object-cover"
        onError={() => refresh()}
      />
    </div>
  );
}
