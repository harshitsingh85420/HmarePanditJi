"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VoiceButton } from "../components/VoiceButton";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

// ── Steps ─────────────────────────────────────────────────────────────────────

type StepId = "name" | "photo" | "specializations" | "pricing" | "bank" | "done";

const STEPS: { id: StepId; label: string; icon: string }[] = [
  { id: "name", label: "Your Name", icon: "person" },
  { id: "photo", label: "Photo", icon: "add_a_photo" },
  { id: "specializations", label: "Specializations", icon: "auto_stories" },
  { id: "pricing", label: "Pricing", icon: "payments" },
  { id: "bank", label: "Bank Details", icon: "account_balance" },
  { id: "done", label: "Done", icon: "celebration" },
];

const SPECIALIZATION_OPTIONS = [
  "Vivah Puja",
  "Griha Pravesh",
  "Satyanarayan Katha",
  "Maha Mrityunjay Jaap",
  "Namkaran Puja",
  "Mundan Puja",
  "Shraadh / Pitru Puja",
  "Rudrabhishek",
  "Ganesh Puja",
  "Navgraha Puja",
];

// ── Form state ────────────────────────────────────────────────────────────────

interface OnboardingData {
  displayName: string;
  bio: string;
  photoUrl: string;
  specializations: string[];
  dakshina: string;
  travelAllowance: string;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
}

const INITIAL: OnboardingData = {
  displayName: "",
  bio: "",
  photoUrl: "",
  specializations: [],
  dakshina: "",
  travelAllowance: "5",
  bankName: "",
  bankAccount: "",
  bankIfsc: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-500"
        style={{ width: `${(current / total) * 100}%` }}
      />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<OnboardingData>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const set = (field: keyof OnboardingData, value: string | string[]) => {
    setData((d) => ({ ...d, [field]: value }));
    setError("");
  };

  const toggleSpec = (s: string) => {
    set(
      "specializations",
      data.specializations.includes(s)
        ? data.specializations.filter((x) => x !== s)
        : [...data.specializations, s]
    );
  };

  const canNext = () => {
    if (currentStep.id === "name") return data.displayName.trim().length >= 2;
    if (currentStep.id === "specializations") return data.specializations.length >= 1;
    if (currentStep.id === "pricing") return Number(data.dakshina) >= 500;
    if (currentStep.id === "bank")
      return data.bankName.trim() && data.bankAccount.trim() && data.bankIfsc.trim();
    return true; // photo and done are optional / auto
  };

  const handleNext = async () => {
    if (!canNext()) {
      if (currentStep.id === "name") setError("Kripya apna naam darj karein");
      if (currentStep.id === "specializations") setError("Kam se kam ek specialization choose karein");
      if (currentStep.id === "pricing") setError("Base dakshina ₹500 se zyada honi chahiye");
      if (currentStep.id === "bank") setError("Saari bank details bharna zaroori hai");
      return;
    }

    // On "bank" step → save profile then advance to "done"
    if (currentStep.id === "bank") {
      setSaving(true);
      try {
        const token = localStorage.getItem("hpj_pandit_access_token");
        await fetch(`${API_BASE}/profile/onboard`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            displayName: data.displayName,
            bio: data.bio,
            specializations: data.specializations,
            dakshina: Number(data.dakshina),
            travelAllowance: Number(data.travelAllowance),
            bankName: data.bankName,
            bankAccount: data.bankAccount,
            bankIfsc: data.bankIfsc,
          }),
        });
      } catch {
        // continue regardless — mock mode
      } finally {
        setSaving(false);
      }
    }

    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
    setError("");
  };

  const handleGoToDashboard = () => router.push("/");

  return (
    <div className="flex items-start justify-center py-6">
      <div className="w-full max-w-md">

        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md shadow-primary/20 mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" className="text-white" aria-hidden="true">
              <path
                d="M12 2l2.929 6.472L22 9.549l-5 4.951 1.18 6.999L12 18.272l-6.18 3.227L7 15.5 2 10.549l7.071-1.077L12 2z"
                fill="currentColor"
              />
            </svg>
          </div>
          {currentStep.id !== "done" && (
            <>
              <h1 className="text-xl font-bold text-slate-900">Welcome! Apna Profile Setup Karein</h1>
              <p className="text-sm text-slate-500 mt-1">
                Step {stepIndex + 1} of {STEPS.length - 1}
              </p>
            </>
          )}
        </div>

        {/* Progress bar */}
        {currentStep.id !== "done" && (
          <div className="mb-6">
            <ProgressBar current={stepIndex + 1} total={STEPS.length - 1} />
            {/* Step indicators */}
            <div className="flex justify-between mt-2">
              {STEPS.filter((s) => s.id !== "done").map((s, i) => (
                <div
                  key={s.id}
                  className={`flex flex-col items-center gap-1 ${i <= stepIndex ? "opacity-100" : "opacity-30"}`}
                >
                  <span className="material-symbols-outlined text-primary text-sm leading-none">
                    {i < stepIndex ? "check_circle" : s.icon}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

          {/* ── Step: Name ───────────────────────────────────────────── */}
          {currentStep.id === "name" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">person</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Apna Naam Batayein</h2>
                  <p className="text-sm text-slate-500">Yah naam customers ko dikhega</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Display Name <span className="text-red-500">*</span>
                  <span className="text-xs text-primary ml-2">🎤 Voice enabled</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Pandit Ram Sharma Ji"
                    value={data.displayName}
                    onChange={(e) => set("displayName", e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    autoFocus
                  />
                  <VoiceButton
                    lang="hi-IN"
                    prompt="Apna naam boliye"
                    onTranscript={(text: string) => set("displayName", text)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>
                    Bio <span className="text-slate-400">(optional)</span>
                  </span>
                  <VoiceButton
                    lang="hi-IN"
                    prompt="Apne experience ke baare mein boliye"
                    onTranscript={(text: string) => set("bio", data.bio + (data.bio ? " " : "") + text)}
                  />
                </label>
                <textarea
                  rows={3}
                  placeholder="Apne anubhav ke baare mein likhein..."
                  value={data.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>
            </div>
          )}

          {/* ── Step: Photo ──────────────────────────────────────────── */}
          {currentStep.id === "photo" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">add_a_photo</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Profile Photo</h2>
                  <p className="text-sm text-slate-500">Customers zyada trust karte hain photo se</p>
                </div>
              </div>

              {/* Upload area */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-28 h-28 rounded-full border-4 border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden">
                  {data.photoUrl ? (
                    <img src={data.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-primary text-5xl">
                      person
                    </span>
                  )}
                </div>

                <label className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm rounded-xl px-5 py-2.5 cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-base leading-none">
                    upload
                  </span>
                  Photo Upload Karein
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        set("photoUrl", url);
                      }
                    }}
                  />
                </label>

                <p className="text-xs text-slate-400">JPG, PNG, WebP • Max 5MB</p>
              </div>

              <p className="text-center text-sm text-slate-400">
                (Aap baad mein bhi add kar sakte hain)
              </p>
            </div>
          )}

          {/* ── Step: Specializations ────────────────────────────────── */}
          {currentStep.id === "specializations" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">auto_stories</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Aap kya karte hain?</h2>
                  <p className="text-sm text-slate-500">Koi bhi select karein (multiple allowed)</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {SPECIALIZATION_OPTIONS.map((s) => {
                  const selected = data.specializations.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSpec(s)}
                      className={`text-sm font-medium rounded-full px-4 py-2 border transition-all ${selected
                        ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                        : "bg-white text-slate-600 border-slate-200 hover:border-primary/40"
                        }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              {data.specializations.length > 0 && (
                <p className="text-xs text-primary font-medium">
                  ✓ {data.specializations.length} selected
                </p>
              )}
            </div>
          )}

          {/* ── Step: Pricing ────────────────────────────────────────── */}
          {currentStep.id === "pricing" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">payments</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Apni Fees Set Karein</h2>
                  <p className="text-sm text-slate-500">Baad mein badal sakte hain</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Base Dakshina (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₹</span>
                  <input
                    type="number"
                    min={500}
                    placeholder="5000"
                    value={data.dakshina}
                    onChange={(e) => set("dakshina", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Minimum ₹500</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Travel Allowance (₹ per km)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₹</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="5"
                    value={data.travelAllowance}
                    onChange={(e) => set("travelAllowance", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step: Bank ───────────────────────────────────────────── */}
          {currentStep.id === "bank" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">account_balance</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Bank Details</h2>
                  <p className="text-sm text-slate-500">Payment seedha aapke account mein</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="State Bank of India"
                    value={data.bankName}
                    onChange={(e) => set("bankName", e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <VoiceButton
                    lang="hi-IN"
                    prompt="Bank ka naam boliye"
                    onTranscript={(text: string) => set("bankName", text)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="123456789012"
                    value={data.bankAccount}
                    onChange={(e) => set("bankAccount", e.target.value.replace(/\D/g, ""))}
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <VoiceButton
                    lang="hi-IN"
                    prompt="Account number boliye"
                    onTranscript={(text: string) => {
                      // Extract digits from spoken text
                      const digits = text.replace(/\D/g, "");
                      set("bankAccount", digits);
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="SBIN0001234"
                    value={data.bankIfsc}
                    onChange={(e) => set("bankIfsc", e.target.value.toUpperCase())}
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono"
                  />
                  <VoiceButton
                    lang="en-IN"
                    prompt="IFSC code boliye"
                    onTranscript={(text: string) => {
                      // Convert to uppercase and remove spaces
                      const ifsc = text.replace(/\s/g, "").toUpperCase();
                      set("bankIfsc", ifsc);
                    }}
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
                <span className="material-symbols-outlined text-green-600 text-base mt-0.5 leading-none flex-shrink-0">
                  shield
                </span>
                <p className="text-xs text-green-700">
                  Aapki bank details 256-bit encryption se secure hain. Hum sirf payout ke
                  liye use karte hain.
                </p>
              </div>
            </div>
          )}

          {/* ── Step: Done ───────────────────────────────────────────── */}
          {currentStep.id === "done" && (
            <div className="flex flex-col items-center text-center py-4 space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <span
                  className="material-symbols-outlined text-green-600 text-[48px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  celebration
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Profile Ready!</h2>
              <p className="text-slate-500">
                Badhaai ho, <strong>{data.displayName || "Pandit Ji"}</strong>! Aapka
                HmarePanditJi account taiyaar hai. Ab aap bookings accept kar sakte hain. 🙏
              </p>

              {/* Summary chips */}
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {data.specializations.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="bg-primary/10 text-primary text-xs font-medium rounded-full px-3 py-1"
                  >
                    {s}
                  </span>
                ))}
                {data.specializations.length > 3 && (
                  <span className="bg-primary/10 text-primary text-xs font-medium rounded-full px-3 py-1">
                    +{data.specializations.length - 3} more
                  </span>
                )}
              </div>

              <button
                onClick={handleGoToDashboard}
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl py-4 transition-colors flex items-center justify-center gap-2 text-base"
              >
                <span className="material-symbols-outlined text-base leading-none">home</span>
                Dashboard Par Jaayein
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-4 text-sm text-red-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-base leading-none">error</span>
              {error}
            </p>
          )}

          {/* Navigation buttons */}
          {currentStep.id !== "done" && (
            <div className="flex gap-3 mt-6">
              {stepIndex > 0 && (
                <button
                  onClick={handleBack}
                  className="flex-1 sm:flex-none border border-slate-200 text-slate-700 font-semibold rounded-xl py-3 px-5 hover:border-slate-300 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={saving}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {currentStep.id === "photo" ? "Skip / Next" : "Next"}
                    <span className="material-symbols-outlined text-base leading-none">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
