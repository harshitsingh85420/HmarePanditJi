"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
const STORAGE_KEY = "hpj_onboarding_state";

// ── Helpers ────────────────────────────────────────────────────────────────
function getToken() {
  return (
    localStorage.getItem("hpj_pandit_token") ||
    localStorage.getItem("hpj_pandit_access_token") ||
    localStorage.getItem("token")
  );
}

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "hi-IN";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

// ── Types ──────────────────────────────────────────────────────────────────
interface DakshinaEntry {
  pujaType: string;
  amount: string;
  durationHours: string;
  description: string;
}

interface TravelMode {
  mode: string;
  enabled: boolean;
  maxDistanceKm: number;
}

interface SamagriItem {
  name: string;
  quantity: string;
}

interface SamagriPackage {
  pujaType: string;
  tier: "BASIC" | "STANDARD" | "PREMIUM";
  name: string;
  price: string;
  description: string;
  items: SamagriItem[];
  enabled: boolean;
}

interface OnboardingState {
  // Step 1
  fullName: string;
  dateOfBirth: string;
  gender: string;
  homeCity: string;
  homeState: string;
  experienceYears: string;
  bio: string;
  aadhaarNumber: string;
  panNumber: string;
  profilePhotoUrl: string;
  audioBioUrl: string;
  // Step 2
  pujaTypes: string[];
  languages: string[];
  vedicDegree: string;
  gotra: string;
  certifications: string[];
  dakshinas: DakshinaEntry[];
  // Step 3
  willingToTravel: boolean;
  travelModes: TravelMode[];
  vehicleType: string;
  ratePerKm: string;
  hotelPreference: string;
  advanceNoticeDays: number;
  // Step 4
  samagriPackages: SamagriPackage[];
  // Step 5
  aadhaarFrontUrl: string;
  aadhaarBackUrl: string;
  aadhaarSelfieUrl: string;
  kycVideoUrl: string;
  // Step 6
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  accountType: string;
  upiId: string;
}

const INITIAL_STATE: OnboardingState = {
  fullName: "", dateOfBirth: "", gender: "", homeCity: "", homeState: "",
  experienceYears: "", bio: "", aadhaarNumber: "", panNumber: "",
  profilePhotoUrl: "", audioBioUrl: "",
  pujaTypes: [], languages: ["हिंदी"], vedicDegree: "", gotra: "",
  certifications: [], dakshinas: [],
  willingToTravel: true,
  travelModes: [
    { mode: "SELF_DRIVE", enabled: false, maxDistanceKm: 100 },
    { mode: "CAB", enabled: true, maxDistanceKm: 200 },
    { mode: "BUS", enabled: false, maxDistanceKm: 400 },
    { mode: "TRAIN", enabled: true, maxDistanceKm: 1000 },
    { mode: "FLIGHT", enabled: false, maxDistanceKm: 9999 },
  ],
  vehicleType: "Car", ratePerKm: "12", hotelPreference: "Any", advanceNoticeDays: 2,
  samagriPackages: [],
  aadhaarFrontUrl: "", aadhaarBackUrl: "", aadhaarSelfieUrl: "", kycVideoUrl: "",
  accountHolderName: "", bankName: "", accountNumber: "", confirmAccountNumber: "",
  ifscCode: "", accountType: "Savings", upiId: "",
};

const PUJA_TYPES = [
  "विवाह पूजा", "गृह प्रवेश", "सत्यनारायण पूजा", "मुंडन",
  "अन्नप्राशन", "जनेउ / यज्ञोपवीत", "नामकरण", "श्राद्ध / पितृ पूजा",
  "नवग्रह पूजा", "वास्तु शांति", "कथा / भागवत", "हवन / यज्ञ",
  "दुर्गा पूजा / नवरात्रि", "जन्मदिन पूजा", "व्यापार खोलने पूजा", "अन्य",
];

const LANGUAGES = [
  "हिंदी", "संस्कृत", "अंग्रेज़ी", "भोजपुरी", "मराठी",
  "गुजराती", "बंगाली", "तमिल", "तेलुगु", "कन्नड़", "मलयालम", "ओड़िया",
];

const VEDIC_DEGREES = [
  "कोई नहीं", "पंडित", "शास्त्री", "आचार्य",
  "महामहोपाध्याय", "वेदपारायणी", "ज्योतिषाचार्य",
];

const BANK_OPTIONS = [
  "SBI", "HDFC", "ICICI", "PNB", "Axis", "Kotak", "BOB", "Canara",
  "Union", "IDBI", "Yes Bank", "IndusInd", "Federal", "Other",
];

const STEP_LABELS = ["जानकारी", "पूजा", "यात्रा", "सामग्री", "KYC", "बैंक"];
const STEP_NARRATIONS = [
  "Namaste Pandit Ji! Aapka swagat hai. Pehli step mein apni basic jankari bharein. Apna poora naam, janam tithi, aur city ka naam darj karein.",
  "Dusri step mein apni puja visheshataen batayein. Aap kaun si pujaen karte hain — woh choose karein. Dakshina bhi set karein.",
  "Teesri step mein apni yatra preferences bharein. Aap kitni door tak jaane ke liye taiyaar hain — woh batayein.",
  "Chauthi step mein samagri packages set karein. Basic, Standard, aur Premium — teeno mein items aur prices set karein.",
  "Paanchvi step mein apne documents upload karein. Aadhaar card front, back, selfie, aur ek chhoti video record karein.",
  "Chhathi aur aakhri step mein apni bank details bharein. Payment seedha aapke account mein aayegi.",
];

// ── Voice Input Button ─────────────────────────────────────────────────────
function VoiceMic({ onText, lang = "hi-IN" }: { onText: (t: string) => void; lang?: string }) {
  const [active, setActive] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const start = () => {
    const SR = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = lang;
    r.interimResults = false;
    r.onresult = (e: SpeechRecognitionEvent) => {
      const t = e.results[0]?.[0]?.transcript ?? "";
      onText(t);
      setActive(false);
    };
    r.onerror = () => setActive(false);
    r.onend = () => setActive(false);
    recognitionRef.current = r;
    r.start();
    setActive(true);
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setActive(false);
  };

  return (
    <button
      type="button"
      onClick={active ? stop : start}
      className={`flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all flex-shrink-0 ${active
          ? "bg-red-500 border-red-600 text-white animate-pulse"
          : "bg-white border-gray-200 text-gray-500 hover:border-[#f09942] hover:text-[#f09942]"
        }`}
      title={active ? "Band karein" : "Voice input"}
    >
      <span className="material-symbols-outlined text-base">{active ? "mic_off" : "mic"}</span>
    </button>
  );
}

// ── Step Progress ──────────────────────────────────────────────────────────
function StepProgress({ current, completed }: { current: number; completed: number[] }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const isDone = completed.includes(stepNum);
        const isCurrent = stepNum === current;
        const isFuture = stepNum > current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${isDone
                    ? "bg-green-500 border-green-500 text-white"
                    : isCurrent
                      ? "bg-[#f09942] border-[#f09942] text-white"
                      : "bg-white border-gray-200 text-gray-400"
                  }`}
                style={isCurrent ? { boxShadow: "0 0 0 4px rgba(240,153,66,0.2)" } : {}}
              >
                {isDone ? (
                  <span className="material-symbols-outlined text-sm">check</span>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium hidden sm:block ${isCurrent ? "text-[#f09942]" : isFuture ? "text-gray-300" : "text-green-600"
                  }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`h-0.5 w-6 sm:w-8 mx-1 transition-colors ${completed.includes(i + 2) || current > i + 1 ? "bg-green-400" : "bg-gray-200"
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── File Upload Zone ───────────────────────────────────────────────────────
function UploadZone({
  label,
  hint,
  uploadedUrl,
  onUpload,
  accept = "image/*,.pdf",
  endpoint,
}: {
  label: string;
  hint?: string;
  uploadedUrl: string;
  onUpload: (url: string) => void;
  accept?: string;
  endpoint: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const token = getToken();
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await res.json();
      const url = data?.url ?? data?.data?.url ?? URL.createObjectURL(file);
      onUpload(url);
    } catch {
      onUpload(URL.createObjectURL(file));
    } finally {
      setLoading(false);
    }
  };

  return (
    <label className={`relative flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all ${uploadedUrl ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50 hover:border-[#f09942] hover:bg-[#f09942]/5"
      }`}>
      {loading ? (
        <span className="w-6 h-6 border-2 border-[#f09942] border-t-transparent rounded-full animate-spin" />
      ) : uploadedUrl ? (
        <>
          <span className="material-symbols-outlined text-green-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span className="text-xs text-green-700 font-medium mt-1">Uploaded ✓</span>
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-gray-400 text-3xl">add_a_photo</span>
          <span className="text-xs text-gray-500 font-medium mt-1 text-center px-2">{label}</span>
          {hint && <span className="text-[10px] text-gray-400 text-center px-2 mt-0.5">{hint}</span>}
        </>
      )}
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
      />
    </label>
  );
}

// ── Audio Bio Recorder ─────────────────────────────────────────────────────
function AudioBioRecorder({ onUpload }: { onUpload: (url: string) => void }) {
  const [state, setState] = useState<"idle" | "recording" | "review">("idle");
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        setState("review");
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start(100);
      mediaRef.current = mr;
      setState("recording");
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s >= 120) { mr.stop(); return s; }
          return s + 1;
        });
      }, 1000);
    } catch {
      alert("Microphone access denied. Kripya browser settings mein mic allow karein.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRef.current?.stop();
  };

  const uploadAudio = async () => {
    if (!audioUrl) return;
    setUploading(true);
    try {
      const token = getToken();
      const resp = await fetch(audioUrl);
      const blob = await resp.blob();
      const form = new FormData();
      form.append("file", blob, "audio-bio.webm");
      const res = await fetch(`${API_BASE}/upload/audio-bio`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await res.json();
      onUpload(data?.url ?? data?.data?.url ?? audioUrl);
    } catch {
      onUpload(audioUrl); // use local blob as fallback
    } finally {
      setUploading(false);
    }
  };

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[#f09942] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>record_voice_over</span>
        <p className="text-sm font-bold text-amber-900">Apna Audio Parichay Record Karein</p>
      </div>

      {state === "idle" && (
        <>
          <div className="bg-white rounded-lg p-3 mb-3 text-xs text-gray-600 space-y-1">
            <p className="font-medium text-gray-700">Yeh bolein (1–2 minute):</p>
            <p>• "Namaste, mera naam [Apna Naam] hai."</p>
            <p>• "Main [X] saalon se puja karta/karti hun."</p>
            <p>• "Main [puja visheshataen] mein mahir hun."</p>
            <p>• "Aapki seva mein hamesha taiyaar hun."</p>
          </div>
          <button
            type="button"
            onClick={startRecording}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">radio_button_checked</span>
            Recording Shuru Karein
          </button>
        </>
      )}

      {state === "recording" && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 border-4 border-red-500 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="material-symbols-outlined text-red-500 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
          </div>
          <p className="text-red-600 font-bold text-lg font-mono mb-1">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")} / 02:00
          </p>
          <p className="text-xs text-gray-500 mb-3">Recording chal rahi hai...</p>
          <button type="button" onClick={stopRecording} className="bg-gray-800 text-white font-bold py-2.5 px-6 rounded-xl text-sm">
            Rokein
          </button>
        </div>
      )}

      {state === "review" && (
        <div className="space-y-3">
          <audio src={audioUrl} controls className="w-full h-10" />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setAudioUrl(""); setState("idle"); }}
              className="flex-1 border-2 border-[#f09942] text-[#f09942] font-semibold py-2.5 rounded-xl text-sm"
            >
              Dobara Record Karein
            </button>
            <button
              type="button"
              onClick={uploadAudio}
              disabled={uploading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-60 flex items-center justify-center gap-1"
            >
              {uploading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">upload</span>
                  Upload Karein
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Video KYC Recorder ─────────────────────────────────────────────────────
function VideoKYCRecorder({ onUpload }: { onUpload: (url: string) => void }) {
  const [state, setState] = useState<"idle" | "recording" | "review">("idle");
  const [seconds, setSeconds] = useState(30);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => { });
      }
      const mr = new MediaRecorder(stream, { mimeType: "video/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setVideoUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        setState("review");
      };
      mr.start(100);
      mediaRef.current = mr;
      setState("recording");
      setSeconds(30);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) { mr.stop(); if (timerRef.current) clearInterval(timerRef.current); return 0; }
          return s - 1;
        });
      }, 1000);
    } catch {
      alert("Camera access denied. Kripya browser settings mein camera allow karein.");
    }
  };

  const stopEarly = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  const uploadVideo = async () => {
    if (!videoUrl) return;
    setUploading(true);
    try {
      const token = getToken();
      const resp = await fetch(videoUrl);
      const blob = await resp.blob();
      const form = new FormData();
      form.append("file", blob, "kyc-video.webm");
      const res = await fetch(`${API_BASE}/upload/kyc-video`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await res.json();
      onUpload(data?.url ?? data?.data?.url ?? videoUrl);
    } catch {
      onUpload(videoUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-blue-600 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>videocam</span>
        <p className="text-sm font-bold text-blue-900">KYC Video Record Karein</p>
      </div>

      {state === "idle" && (
        <>
          <div className="bg-white rounded-lg p-3 mb-3 text-xs text-gray-600 space-y-1">
            <p className="font-medium text-gray-700">Video mein yeh bolein (30 seconds mein):</p>
            <p>• "Mera naam [Apna Naam] hai"</p>
            <p>• "Main pichhle [X] saalon se puja karta/karti hun"</p>
            <p>• "Main [shehar] mein rehta/rehti hun"</p>
            <p>• "Yeh mera Aadhaar card hai" — (Aadhaar camera ke saamne rakhein)</p>
          </div>
          <button type="button" onClick={startRecording} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">videocam</span>
            Video Record Karein
          </button>
        </>
      )}

      {state === "recording" && (
        <div>
          <video ref={videoRef} muted playsInline className="w-full rounded-xl aspect-video bg-black mb-3 object-cover" />
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-red-600 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              Recording...
            </span>
            <span className={`font-mono font-bold text-lg ${seconds <= 10 ? "text-red-600" : "text-gray-700"}`}>
              00:{String(seconds).padStart(2, "0")}
            </span>
          </div>
          <button type="button" onClick={stopEarly} className="w-full bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm">
            Recording Rokein
          </button>
        </div>
      )}

      {state === "review" && (
        <div className="space-y-3">
          <video src={videoUrl} controls className="w-full rounded-xl aspect-video" />
          <div className="flex gap-2">
            <button type="button" onClick={() => { setVideoUrl(""); setState("idle"); }} className="flex-1 border-2 border-blue-400 text-blue-700 font-semibold py-2.5 rounded-xl text-sm">
              Dobara Record Karein
            </button>
            <button type="button" onClick={uploadVideo} disabled={uploading} className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-60 flex items-center justify-center gap-1">
              {uploading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                <><span className="material-symbols-outlined text-sm">upload</span>Upload Karein</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── IFSC Modal ─────────────────────────────────────────────────────────────
function IFSCModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full">
        <div className="bg-[#f09942] px-5 py-4 rounded-t-2xl">
          <h3 className="text-white font-bold">IFSC Code kya hota hai?</h3>
        </div>
        <div className="p-5 space-y-3 text-sm text-gray-700">
          <p>Yeh <strong>11 characters ka code</strong> hota hai jo aapki bank branch ko identify karta hai.</p>
          <p>Yeh aapki <strong>bank passbook ya cheque book</strong> par likha milega.</p>
          <div className="bg-gray-50 rounded-lg p-3 font-mono text-center text-base tracking-wider">
            SBIN<span className="text-red-500">0</span>001234
          </div>
          <p className="text-xs text-gray-500">Pehle 4 letters = bank ka naam (SBIN = SBI)<br />Phir 0 = hamesha zero<br />Phir 6 characters = branch code</p>
        </div>
        <div className="px-5 pb-5">
          <button onClick={onClose} className="w-full bg-[#f09942] text-white font-bold py-2.5 rounded-xl">Band Karein</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Onboarding Wizard ─────────────────────────────────────────────────
function OnboardingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showIFSC, setShowIFSC] = useState(false);
  const [certInput, setCertInput] = useState("");
  const [samagriItemInput, setSamagriItemInput] = useState<Record<string, string>>({});

  // Hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as OnboardingState;
        setState(parsed);
      } catch {
        // ignore
      }
    }
    const stepParam = searchParams?.get("step");
    if (stepParam) setStep(parseInt(stepParam, 10) || 1);
  }, [searchParams]);

  // Auto-save to localStorage on state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const set = useCallback(<K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
    setError("");
  }, []);

  const advanceStep = () => {
    setCompletedSteps((prev) => [...new Set([...prev, step])]);
    setStep((s) => s + 1);
    setError("");
    window.scrollTo(0, 0);
    speak(STEP_NARRATIONS[step] || "");
  };

  // ── API Calls ──────────────────────────────────────────────────────────
  const saveStep = async (stepNum: number, body: Record<string, unknown>): Promise<boolean> => {
    const token = getToken();
    if (!token) return true; // dev mode — continue
    try {
      const endpoint =
        stepNum === 6
          ? `${API_BASE}/pandit/onboarding/complete`
          : `${API_BASE}/pandit/onboarding/step${stepNum}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.message || "Kuch galat ho gaya — dobara koshish karein.");
        return false;
      }
      return true;
    } catch {
      // Network error — allow offline continuation
      return true;
    }
  };

  // ── Step Validation & Submit ───────────────────────────────────────────
  const handleNext = async () => {
    setError("");

    if (step === 1) {
      if (!state.fullName.trim() || state.fullName.trim().length < 3) {
        setError("Kripya apna poora naam darj karein (minimum 3 characters)");
        return;
      }
      if (!state.gender) { setError("Kripya apna gender choose karein"); return; }
      if (!state.homeCity.trim()) { setError("Kripya apna shehar darj karein"); return; }
      setSaving(true);
      const ok = await saveStep(1, {
        fullName: state.fullName, dateOfBirth: state.dateOfBirth, gender: state.gender,
        homeCity: state.homeCity, homeState: state.homeState,
        experienceYears: parseInt(state.experienceYears) || 0,
        bio: state.bio, aadhaarNumber: state.aadhaarNumber, panNumber: state.panNumber,
        profilePhotoUrl: state.profilePhotoUrl, audioBioUrl: state.audioBioUrl,
      });
      setSaving(false);
      if (!ok) return;
      advanceStep();
    } else if (step === 2) {
      if (state.pujaTypes.length === 0) { setError("Kam se kam ek puja type choose karein"); return; }
      if (state.languages.length === 0) { setError("Kam se kam ek bhasha choose karein"); return; }
      setSaving(true);
      const ok = await saveStep(2, {
        pujaTypes: state.pujaTypes, languages: state.languages,
        vedicDegree: state.vedicDegree, gotra: state.gotra,
        certifications: state.certifications, dakshinas: state.dakshinas,
      });
      setSaving(false);
      if (!ok) return;
      // Auto-generate samagri packages for selected puja types if not already
      if (state.samagriPackages.length === 0) {
        const newPkgs: SamagriPackage[] = [];
        state.pujaTypes.forEach((puja) => {
          (["BASIC", "STANDARD", "PREMIUM"] as const).forEach((tier) => {
            newPkgs.push({ pujaType: puja, tier, name: `${tier} Package`, price: "", description: "", items: [], enabled: tier === "STANDARD" });
          });
        });
        set("samagriPackages", newPkgs);
      }
      advanceStep();
    } else if (step === 3) {
      setSaving(true);
      const ok = await saveStep(3, {
        willingToTravel: state.willingToTravel,
        travelModes: state.travelModes,
        vehicleType: state.vehicleType,
        ratePerKm: parseFloat(state.ratePerKm) || 12,
        hotelPreference: state.hotelPreference,
        advanceNoticeDays: state.advanceNoticeDays,
      });
      setSaving(false);
      if (!ok) return;
      advanceStep();
    } else if (step === 4) {
      const enabledPkgs = state.samagriPackages.filter((p) => p.enabled);
      if (enabledPkgs.length === 0) { setError("Kam se kam ek package enable karein"); return; }
      const invalidPkg = enabledPkgs.find((p) => !p.price || parseInt(p.price) < 100);
      if (invalidPkg) { setError(`${invalidPkg.pujaType} ke ${invalidPkg.tier} package ki price set karein (minimum ₹100)`); return; }
      setSaving(true);
      const ok = await saveStep(4, {
        canBringSamagri: true,
        packages: state.samagriPackages.map((p) => ({
          ...p, price: parseInt(p.price) || 0,
          items: p.items.map((item) => ({ name: item.name, quantity: item.quantity })),
        })),
      });
      setSaving(false);
      if (!ok) return;
      advanceStep();
    } else if (step === 5) {
      if (!state.aadhaarFrontUrl) { setError("Aadhaar card ka front photo upload karein"); return; }
      if (!state.aadhaarBackUrl) { setError("Aadhaar card ka back photo upload karein"); return; }
      if (!state.aadhaarSelfieUrl) { setError("Aadhaar ke saath selfie upload karein"); return; }
      if (!state.kycVideoUrl) { setError("KYC video record aur upload karein"); return; }
      setSaving(true);
      const ok = await saveStep(5, {
        aadhaarFrontUrl: state.aadhaarFrontUrl,
        aadhaarBackUrl: state.aadhaarBackUrl,
        aadhaarSelfieUrl: state.aadhaarSelfieUrl,
        kycVideoUrl: state.kycVideoUrl,
      });
      setSaving(false);
      if (!ok) return;
      advanceStep();
    } else if (step === 6) {
      if (!state.accountHolderName.trim()) { setError("Khatadharak ka naam darj karein"); return; }
      if (!state.bankName) { setError("Bank ka naam choose karein"); return; }
      if (!state.accountNumber || state.accountNumber.length < 9) { setError("Sahi account number darj karein (9-18 digits)"); return; }
      if (state.accountNumber !== state.confirmAccountNumber) { setError("Account number match nahin kar raha — dobara check karein"); return; }
      if (!state.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(state.ifscCode)) {
        setError("Sahi IFSC code darj karein (jaise SBIN0001234)");
        return;
      }
      setSaving(true);
      const ok = await saveStep(6, {
        accountHolderName: state.accountHolderName, bankName: state.bankName,
        accountNumber: state.accountNumber, confirmAccountNumber: state.confirmAccountNumber,
        ifscCode: state.ifscCode, accountType: state.accountType, upiId: state.upiId,
      });
      setSaving(false);
      if (!ok) return;
      // Mark onboarding complete
      localStorage.setItem("hpj_onboarding_complete", "true");
      localStorage.removeItem(STORAGE_KEY);
      router.push("/onboarding/complete");
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    setError("");
    window.scrollTo(0, 0);
  };

  // Narrate on step change
  useEffect(() => {
    speak(STEP_NARRATIONS[step - 1] || "");
  }, [step]);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f7f6]">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#f09942] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2l2.929 6.472L22 9.549l-5 4.951 1.18 6.999L12 18.272l-6.18 3.227L7 15.5 2 10.549l7.071-1.077L12 2z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">HmarePanditJi</span>
          </div>
          <button
            onClick={() => speak(STEP_NARRATIONS[step - 1] || "")}
            className="flex items-center gap-1.5 bg-[#f09942]/10 text-[#f09942] text-xs font-bold px-3 py-1.5 rounded-full"
          >
            <span className="material-symbols-outlined text-sm">volume_up</span>
            Suniye
          </button>
        </div>

        {/* Progress */}
        <StepProgress current={step} completed={completedSteps} />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          {/* Step title */}
          <div className="mb-5">
            <p className="text-xs font-bold text-[#f09942] uppercase tracking-wider">Step {step} of 6</p>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">
              {["Apni Jankari Bharein", "Puja Visheshataen", "Yatra Preferences", "Samagri Packages", "Documents & KYC", "Bank Details"][step - 1]}
            </h1>
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Profile photo */}
              <div className="flex flex-col items-center gap-2">
                <label className="relative cursor-pointer">
                  <div className="w-24 h-24 rounded-full border-4 border-[#f09942]/30 bg-[#f09942]/5 flex items-center justify-center overflow-hidden">
                    {state.profilePhotoUrl ? (
                      <img src={state.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-[#f09942] text-4xl">person</span>
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-8 h-8 bg-[#f09942] rounded-full flex items-center justify-center border-2 border-white">
                    <span className="material-symbols-outlined text-white text-sm">add_a_photo</span>
                  </span>
                  <input type="file" accept="image/jpg,image/jpeg,image/png" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0]; if (f) set("profilePhotoUrl", URL.createObjectURL(f));
                  }} />
                </label>
                <p className="text-xs text-gray-400">Apni Photo Lagaein (optional)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  पूरा नाम <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Pt. Ramesh Sharma Ji" value={state.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f09942]/30 focus:border-[#f09942]" />
                  <VoiceMic onText={(t) => set("fullName", t)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">जन्म तिथि</label>
                <input type="date" value={state.dateOfBirth}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                  onChange={(e) => set("dateOfBirth", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f09942]/30 focus:border-[#f09942]" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">लिंग <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  {["पुरुष", "महिला", "अन्य"].map((g) => (
                    <button key={g} type="button" onClick={() => set("gender", g)}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${state.gender === g ? "bg-[#f09942] border-[#f09942] text-white" : "border-gray-200 text-gray-600 hover:border-[#f09942]/40"
                        }`}>{g}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">घर का शहर <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Delhi" value={state.homeCity}
                      onChange={(e) => set("homeCity", e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f09942]/30 focus:border-[#f09942]" />
                    <VoiceMic onText={(t) => set("homeCity", t)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">राज्य</label>
                  <input type="text" placeholder="Delhi" value={state.homeState}
                    onChange={(e) => set("homeState", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f09942]/30 focus:border-[#f09942]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">अनुभव (साल में)</label>
                <div className="flex items-center gap-2">
                  <input type="number" min={0} max={60} placeholder="10" value={state.experienceYears}
                    onChange={(e) => set("experienceYears", e.target.value)}
                    className="w-24 border border-gray-200 rounded-xl px-4 py-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#f09942]/30 focus:border-[#f09942]" />
                  <span className="text-sm text-gray-500 font-medium">साल</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>परिचय (Bio)</span>
                  <VoiceMic onText={(t) => set("bio", state.bio + (state.bio ? " " : "") + t)} />
                </label>
                <textarea rows={3} placeholder="Apne anubhav ke baare mein likhein... (customers ko dikhega)" value={state.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f09942]/30 focus:border-[#f09942] resize-none" />
                <p className="text-xs text-gray-400 mt-1">{state.bio.length}/300 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">आधार संख्या</label>
                <input type="text" inputMode="numeric" placeholder="XXXX XXXX XXXX" maxLength={12}
                  value={state.aadhaarNumber.replace(/(\d{4})(?=\d)/g, "$1 ")}
                  onChange={(e) => set("aadhaarNumber", e.target.value.replace(/\s/g, "").slice(0, 12))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#f09942]/30 focus:border-[#f09942]" />
                <p className="text-xs text-gray-400 mt-1">Encrypted aur secure stored hoga</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">PAN Card Number</label>
                <input type="text" placeholder="ABCDE1234F" maxLength={10}
                  value={state.panNumber.toUpperCase()}
                  onChange={(e) => set("panNumber", e.target.value.toUpperCase().slice(0, 10))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#f09942]/30 focus:border-[#f09942]" />
              </div>

              {/* Audio Bio */}
              <AudioBioRecorder onUpload={(url) => set("audioBioUrl", url)} />
              {state.audioBioUrl && (
                <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
                  <span className="material-symbols-outlined text-green-600">check_circle</span>
                  Audio bio upload ho gaya ✓
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Puja Types <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-400 font-normal ml-2">({state.pujaTypes.length} selected)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {PUJA_TYPES.map((puja) => {
                    const selected = state.pujaTypes.includes(puja);
                    return (
                      <button key={puja} type="button" onClick={() => {
                        set("pujaTypes", selected ? state.pujaTypes.filter((p) => p !== puja) : [...state.pujaTypes, puja]);
                      }} className={`text-sm font-medium rounded-full px-4 py-2 border-2 transition-all ${selected ? "bg-[#f09942] text-white border-[#f09942]" : "bg-white text-gray-600 border-gray-200 hover:border-[#f09942]/50"
                        }`}>{puja}</button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Puja ki Bhasha <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => {
                    const selected = state.languages.includes(lang);
                    return (
                      <button key={lang} type="button" onClick={() => {
                        if (lang === "हिंदी" && selected && state.languages.length === 1) return;
                        set("languages", selected ? state.languages.filter((l) => l !== lang) : [...state.languages, lang]);
                      }} className={`text-sm font-medium rounded-full px-4 py-2 border-2 transition-all ${selected ? "bg-[#f09942]/10 text-[#f09942] border-[#f09942]" : "bg-white text-gray-600 border-gray-200 hover:border-[#f09942]/50"
                        }`}>{lang}</button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">वेदिक योग्यता</label>
                  <select value={state.vedicDegree} onChange={(e) => set("vedicDegree", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f09942]/30">
                    {VEDIC_DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">गोत्र</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Bharadwaj" value={state.gotra}
                      onChange={(e) => set("gotra", e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f09942]/30" />
                    <VoiceMic onText={(t) => set("gotra", t)} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Certifications (optional)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {state.certifications.map((c, i) => (
                    <span key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-200">
                      {c}
                      <button type="button" onClick={() => set("certifications", state.certifications.filter((_, j) => j !== i))}
                        className="text-blue-400 hover:text-blue-600 ml-1">×</button>
                    </span>
                  ))}
                </div>
                {state.certifications.length < 5 && (
                  <div className="flex gap-2">
                    <input type="text" placeholder="e.g., Kashi Vidyapeeth Certified" value={certInput}
                      onChange={(e) => setCertInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && certInput.trim()) {
                          set("certifications", [...state.certifications, certInput.trim()]);
                          setCertInput("");
                        }
                      }}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f09942]/30" />
                    <button type="button" onClick={() => {
                      if (certInput.trim()) { set("certifications", [...state.certifications, certInput.trim()]); setCertInput(""); }
                    }} className="px-4 py-2.5 bg-[#f09942]/10 text-[#f09942] font-semibold rounded-xl text-sm">+ Add</button>
                  </div>
                )}
              </div>

              {/* Per-puja dakshina */}
              {state.pujaTypes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Per-Puja Dakshina & Duration</label>
                  <div className="space-y-3">
                    {state.pujaTypes.map((puja) => {
                      const entry = state.dakshinas.find((d) => d.pujaType === puja) ?? { pujaType: puja, amount: "", durationHours: "", description: "" };
                      const updateEntry = (field: keyof DakshinaEntry, val: string) => {
                        const updated = state.dakshinas.filter((d) => d.pujaType !== puja);
                        set("dakshinas", [...updated, { ...entry, [field]: val }]);
                      };
                      return (
                        <div key={puja} className="bg-[#f09942]/5 rounded-xl p-3 border border-[#f09942]/20">
                          <p className="text-sm font-bold text-[#f09942] mb-2">{puja}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-500 font-medium">दक्षिणा (₹) *</label>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-gray-500 text-sm">₹</span>
                                <input type="number" min={500} placeholder="5000" value={entry.amount}
                                  onChange={(e) => updateEntry("amount", e.target.value)}
                                  className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#f09942]" />
                                <VoiceMic onText={(t) => updateEntry("amount", t.replace(/\D/g, ""))} />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 font-medium">अवधि (घंटे)</label>
                              <div className="flex items-center gap-1 mt-1">
                                <input type="number" min={0.5} max={12} step={0.5} placeholder="2.5" value={entry.durationHours}
                                  onChange={(e) => updateEntry("durationHours", e.target.value)}
                                  className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#f09942]" />
                                <span className="text-xs text-gray-400">hr</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Will you travel */}
              <div className="flex items-center justify-between bg-[#f09942]/5 rounded-xl p-4 border border-[#f09942]/20">
                <div>
                  <p className="text-sm font-bold text-gray-900">Kya aap sheher ke bahar jaenge?</p>
                  <p className="text-xs text-gray-500 mt-0.5">Bahar ki bookings aane ke liye YES rakhen</p>
                </div>
                <button type="button" onClick={() => set("willingToTravel", !state.willingToTravel)}
                  className={`relative flex h-8 w-14 rounded-full border-none p-0.5 transition-colors ${state.willingToTravel ? "bg-green-500 justify-end" : "bg-gray-300 justify-start"}`}>
                  <div className="h-full w-6 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {state.willingToTravel && (
                <>
                  {/* Travel modes */}
                  <div className="space-y-3">
                    {[
                      { mode: "SELF_DRIVE", label: "अपनी गाड़ी", icon: "directions_car", max: 200 },
                      { mode: "CAB", label: "टैक्सी / ऑटो", icon: "local_taxi", max: 500 },
                      { mode: "BUS", label: "बस", icon: "directions_bus", max: 800 },
                      { mode: "TRAIN", label: "ट्रेन", icon: "train", max: 2000 },
                      { mode: "FLIGHT", label: "हवाई जहाज़", icon: "flight", max: 9999 },
                    ].map(({ mode, label, icon, max }) => {
                      const tm = state.travelModes.find((t) => t.mode === mode) ?? { mode, enabled: false, maxDistanceKm: max / 2 };
                      const updateMode = (field: keyof TravelMode, val: boolean | number) => {
                        const updated = state.travelModes.filter((t) => t.mode !== mode);
                        set("travelModes", [...updated, { ...tm, [field]: val }]);
                      };
                      return (
                        <div key={mode} className={`rounded-xl border-2 p-3 transition-all ${tm.enabled ? "border-[#f09942]/40 bg-[#f09942]/5" : "border-gray-100 bg-white"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[#f09942] text-xl">{icon}</span>
                              <span className="text-sm font-semibold text-gray-900">{label}</span>
                            </div>
                            <button type="button" onClick={() => updateMode("enabled", !tm.enabled)}
                              className={`relative flex h-7 w-12 rounded-full p-0.5 transition-colors ${tm.enabled ? "bg-[#f09942] justify-end" : "bg-gray-200 justify-start"}`}>
                              <div className="h-full w-5 rounded-full bg-white shadow-sm" />
                            </button>
                          </div>
                          {tm.enabled && mode !== "FLIGHT" && (
                            <div>
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Max: <strong className="text-gray-900">{tm.maxDistanceKm} km</strong></span>
                                <span>Max: {max} km</span>
                              </div>
                              <input type="range" min={10} max={max} step={10} value={tm.maxDistanceKm}
                                onChange={(e) => updateMode("maxDistanceKm", parseInt(e.target.value))}
                                className="w-full accent-[#f09942]" />
                              <div className="flex gap-2 mt-2">
                                {[Math.round(max * 0.25), Math.round(max * 0.5), Math.round(max * 0.75)].map((km) => (
                                  <button key={km} type="button" onClick={() => updateMode("maxDistanceKm", km)}
                                    className={`text-xs px-2 py-1 rounded-full border transition-all ${tm.maxDistanceKm === km ? "bg-[#f09942] text-white border-[#f09942]" : "border-gray-200 text-gray-600"}`}>
                                    {km} km
                                  </button>
                                ))}
                              </div>
                              {mode === "SELF_DRIVE" && (
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Rate:</span>
                                  <input type="number" min={8} max={25} value={state.ratePerKm}
                                    onChange={(e) => set("ratePerKm", e.target.value)}
                                    className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center" />
                                  <span className="text-xs text-gray-500">₹/km</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Hotel preference */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">होटल की पसंद</label>
                    <div className="flex flex-wrap gap-2">
                      {["Budget", "3-Star", "4-Star", "Any"].map((h) => (
                        <button key={h} type="button" onClick={() => set("hotelPreference", h)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${state.hotelPreference === h ? "bg-[#f09942] text-white border-[#f09942]" : "border-gray-200 text-gray-600"}`}>
                          {h === "Budget" ? "सस्ता होटल" : h === "Any" ? "किसी में चलेगा" : h}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Advance notice */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum advance notice (kitne din pehle)</label>
                    <div className="flex flex-wrap gap-2">
                      {[{ val: 0, label: "Same day" }, { val: 1, label: "1 दिन" }, { val: 2, label: "2 दिन" }, { val: 3, label: "3 दिन" }, { val: 7, label: "7 दिन" }].map(({ val, label }) => (
                        <button key={val} type="button" onClick={() => set("advanceNoticeDays", val)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${state.advanceNoticeDays === val ? "bg-[#f09942] text-white border-[#f09942]" : "border-gray-200 text-gray-600"}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Food allowance info (read-only) */}
              <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-green-600 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                  <p className="text-sm font-bold text-green-800">Bhojan Bhatta — Platform Policy</p>
                </div>
                <p className="text-xs text-green-700">Multi-day bookings ke liye platform automatically ₹1,000/din food allowance dega:</p>
                <ul className="text-xs text-green-700 mt-2 space-y-1">
                  <li>• यात्रा के हर दिन: <strong>₹1,000/दिन</strong></li>
                  <li>• पूजा के दिन (अगर customer भोजन नहीं देता): <strong>₹1,000/दिन</strong></li>
                </ul>
                <p className="text-xs text-green-600 mt-2 font-medium">Yeh raqam alag se transfer ki jayegi — kisi cheez se nahin kategi.</p>
              </div>
            </div>
          )}

          {/* ── STEP 4 ── */}
          {step === 4 && (
            <div className="space-y-5">
              <p className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-xl p-3">
                Packages FIXED price hote hain — customers negotiate nahin kar sakte. Aap puja-wise alag packages set kar sakte hain.
              </p>

              {state.pujaTypes.slice(0, 3).map((puja) => {
                const pkgs = state.samagriPackages.filter((p) => p.pujaType === puja);
                return (
                  <div key={puja} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-[#f09942]/10 px-4 py-2.5">
                      <p className="text-sm font-bold text-[#f09942]">{puja}</p>
                    </div>
                    <div className="p-3 space-y-3">
                      {(["BASIC", "STANDARD", "PREMIUM"] as const).map((tier) => {
                        const pkg = pkgs.find((p) => p.tier === tier) ?? {
                          pujaType: puja, tier, name: `${tier} Package`,
                          price: "", description: "", items: [], enabled: tier === "STANDARD",
                        };
                        const updatePkg = (field: keyof SamagriPackage, val: unknown) => {
                          const others = state.samagriPackages.filter((p) => !(p.pujaType === puja && p.tier === tier));
                          set("samagriPackages", [...others, { ...pkg, [field]: val }]);
                        };
                        const itemInputKey = `${puja}-${tier}`;
                        const colors = { BASIC: "bg-gray-50 border-gray-200", STANDARD: "bg-[#f09942]/5 border-[#f09942]/30", PREMIUM: "bg-purple-50 border-purple-200" };
                        return (
                          <div key={tier} className={`rounded-xl border-2 p-3 ${colors[tier]}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tier === "BASIC" ? "bg-gray-200 text-gray-700" :
                                  tier === "STANDARD" ? "bg-[#f09942] text-white" :
                                    "bg-purple-500 text-white"
                                }`}>{tier}</span>
                              <button type="button" onClick={() => updatePkg("enabled", !pkg.enabled)}
                                className={`relative flex h-6 w-10 rounded-full p-0.5 transition-colors ${pkg.enabled ? "bg-green-500 justify-end" : "bg-gray-200 justify-start"}`}>
                                <div className="h-full w-4 rounded-full bg-white shadow-sm" />
                              </button>
                            </div>
                            {pkg.enabled && (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <input type="text" placeholder="Package naam" value={pkg.name}
                                      onChange={(e) => updatePkg("name", e.target.value)}
                                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#f09942]" />
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500">₹</span>
                                    <input type="number" min={100} placeholder="Price" value={pkg.price}
                                      onChange={(e) => updatePkg("price", e.target.value)}
                                      className="w-24 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#f09942]" />
                                  </div>
                                </div>
                                {/* Items */}
                                <div>
                                  <div className="flex flex-wrap gap-1 mb-1">
                                    {pkg.items.map((item, idx) => (
                                      <span key={idx} className="flex items-center gap-1 bg-white text-xs text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">
                                        {item.name}
                                        <button type="button" onClick={() => updatePkg("items", pkg.items.filter((_, j) => j !== idx))} className="text-gray-400 hover:text-red-500">×</button>
                                      </span>
                                    ))}
                                  </div>
                                  <div className="flex gap-1">
                                    <input type="text" placeholder="Item add karein (Enter)" value={samagriItemInput[itemInputKey] ?? ""}
                                      onChange={(e) => setSamagriItemInput((prev) => ({ ...prev, [itemInputKey]: e.target.value }))}
                                      onKeyDown={(e) => {
                                        const val = samagriItemInput[itemInputKey]?.trim();
                                        if (e.key === "Enter" && val) {
                                          updatePkg("items", [...pkg.items, { name: val, quantity: "" }]);
                                          setSamagriItemInput((prev) => ({ ...prev, [itemInputKey]: "" }));
                                        }
                                      }}
                                      className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#f09942]" />
                                    <VoiceMic onText={(t) => {
                                      const items = t.split(/,|और|ya/).map((s) => s.trim()).filter(Boolean);
                                      updatePkg("items", [...pkg.items, ...items.map((name) => ({ name, quantity: "" }))]);
                                    }} />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── STEP 5 ── */}
          {step === 5 && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-xl p-3">
                Saare documents upload karna zaroori hai. Team 24–48 ghanton mein verify karegi.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <UploadZone label="Aadhaar Front" hint="Aadhaar ka agla hissa" uploadedUrl={state.aadhaarFrontUrl}
                  onUpload={(url) => set("aadhaarFrontUrl", url)}
                  endpoint="upload/kyc-document?type=AADHAAR_FRONT" />
                <UploadZone label="Aadhaar Back" hint="Aadhaar ka peecha" uploadedUrl={state.aadhaarBackUrl}
                  onUpload={(url) => set("aadhaarBackUrl", url)}
                  endpoint="upload/kyc-document?type=AADHAAR_BACK" />
                <UploadZone label="Selfie with Aadhaar" hint="Haath mein Aadhaar lekar selfie" uploadedUrl={state.aadhaarSelfieUrl}
                  onUpload={(url) => set("aadhaarSelfieUrl", url)}
                  accept="image/*" endpoint="upload/kyc-document?type=AADHAAR_SELFIE" />
              </div>

              <VideoKYCRecorder onUpload={(url) => set("kycVideoUrl", url)} />

              {state.kycVideoUrl && (
                <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
                  <span className="material-symbols-outlined text-green-600">check_circle</span>
                  Video upload ho gaya ✓
                </div>
              )}

              {state.aadhaarFrontUrl && state.aadhaarBackUrl && state.aadhaarSelfieUrl && state.kycVideoUrl && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
                  <span className="material-symbols-outlined text-green-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                  <p className="text-green-800 font-bold mt-1">Saare documents poore ho gaye!</p>
                  <p className="text-xs text-green-600 mt-1">Team 24–48 ghanton mein verify karegi. Verification ke baad SMS aayega.</p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 6 ── */}
          {step === 6 && (
            <div className="space-y-4">
              {showIFSC && <IFSCModal onClose={() => setShowIFSC(false)} />}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                <p className="font-bold mb-1">Dhyan Rakhen:</p>
                <p>• Apne khud ke bank account ki jankari bharein</p>
                <p>• Galat account number dene par payment fail ho sakti hai</p>
                <p>• Bank passbook dekh ke bharein</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">खाताधारक का नाम <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Exactly as on bank passbook" value={state.accountHolderName}
                    onChange={(e) => set("accountHolderName", e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f09942]/30 focus:border-[#f09942]" />
                  <VoiceMic onText={(t) => set("accountHolderName", t)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">बैंक का नाम <span className="text-red-500">*</span></label>
                <select value={state.bankName} onChange={(e) => set("bankName", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f09942]/30 focus:border-[#f09942]">
                  <option value="">-- Bank choose karein --</option>
                  {BANK_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">खाता संख्या <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input type="password" inputMode="numeric" placeholder="Account number" value={state.accountNumber}
                    onChange={(e) => set("accountNumber", e.target.value.replace(/\D/g, "").slice(0, 18))}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f09942]/30 focus:border-[#f09942]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">खाता संख्या दोबारा <span className="text-red-500">*</span></label>
                <input type="text" inputMode="numeric" placeholder="Account number dobara darj karein" value={state.confirmAccountNumber}
                  onChange={(e) => set("confirmAccountNumber", e.target.value.replace(/\D/g, "").slice(0, 18))}
                  className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f09942]/30 ${state.confirmAccountNumber && state.accountNumber !== state.confirmAccountNumber
                      ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-[#f09942]"
                    }`} />
                {state.confirmAccountNumber && state.accountNumber !== state.confirmAccountNumber && (
                  <p className="text-xs text-red-600 mt-1">Account numbers match nahin kar rahe</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                  IFSC Code <span className="text-red-500">*</span>
                  <button type="button" onClick={() => setShowIFSC(true)}
                    className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center">?</button>
                </label>
                <input type="text" placeholder="SBIN0001234" maxLength={11} value={state.ifscCode}
                  onChange={(e) => set("ifscCode", e.target.value.toUpperCase().slice(0, 11))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#f09942]/30 focus:border-[#f09942]" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">खाता प्रकार</label>
                <div className="flex gap-3">
                  {["Savings", "Current"].map((t) => (
                    <button key={t} type="button" onClick={() => set("accountType", t)}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${state.accountType === t ? "bg-[#f09942] text-white border-[#f09942]" : "border-gray-200 text-gray-600"}`}>
                      {t === "Savings" ? "बचत खाता" : "चालू खाता"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">UPI ID (optional)</label>
                <input type="text" placeholder="name@upi" value={state.upiId}
                  onChange={(e) => set("upiId", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f09942]/30 focus:border-[#f09942]" />
              </div>

              <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
                <span className="material-symbols-outlined text-green-600 text-base mt-0.5 flex-shrink-0">shield</span>
                <p className="text-xs text-green-700">
                  Aapki bank details AES-256 encryption se secure hain. Sirf payout ke liye use ki jaati hain.
                </p>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <span className="material-symbols-outlined text-red-500 text-base mt-0.5 flex-shrink-0">error</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* ── Footer Nav ── */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            {step > 1 && (
              <button type="button" onClick={handleBack}
                className="flex-shrink-0 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl py-3 px-5 hover:border-gray-300 transition-colors">
                ← Wapas
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={saving}
              className="flex-1 bg-[#f09942] hover:bg-[#dc6803] disabled:opacity-60 text-white font-bold rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : step === 6 ? (
                <><span className="material-symbols-outlined text-base">check_circle</span> Profile Submit Karein</>
              ) : (
                <>Save & Aage → <span className="material-symbols-outlined text-base">arrow_forward</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <OnboardingPageInner />
    </Suspense>
  );
}
