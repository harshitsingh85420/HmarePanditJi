"use client";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────
// पूजा जोड़ें in 4 steps — CHAPTER 1, THE LISTING (canon 18a–18e lineage).
//
// SAMAGRI LEAVES THE LISTING PATH (Isj's samagri-tiers order, 2026-08-03).
// Under the decoupled model nothing stands between the declaration and the
// listing. The सामग्री step — which collected items it structurally could
// not price (the saved:0 gap) — and the आपूर्ति question both moved to
// their own post-listing chapter: my-poojas/samagri (tiers → कौन लाएगा →
// prices, every screen skippable). This wizard now asks only what the
// LISTING needs: नाम → और थोड़ी बातें (टीम + दक्षिणा) → वीडियो → भेजें.
//
// THE MERGE (canon 18c): टीम + दक्षिणा stay folded into "और थोड़ी बातें".
//
// THE RISK, and what was done about it —
// आपूर्ति and टीम each registered their OWN useVoiceOptions group. They
// never co-existed before; merged, both mount at once beside the दक्षिणा
// money field. Verified against the real voiceController (stepModel.test):
//   · registerOptions APPENDS (voiceOptionGroups.push) and its disposer
//     removes only its own group by identity — so groups coexist and
//     unmount cleanly; no clobbering, no orphaned listeners.
//   · matchVisibleOption does `clean.includes(label)`, so the old bare
//     "1".."5" team labels matched ANY transcript containing that digit —
//     including "5000". Since VoiceField hands the transcript to the
//     command registry once the field HOLDS a value, a pandit CORRECTING
//     his dakshina would have set teamSize instead. Labels are now
//     "N पंडित", which cannot collide in either direction.
// Both behaviours are pinned by tests; do not reintroduce digit labels.
//
// Draft shape and every endpoint are unchanged — this is navigation only.
// A draft written by the 7-step wizard is migrated via migrateStep.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Narrate } from "@/hooks/useScreenVoice";
import { useVoiceOptions } from "@/hooks/useVoiceScreen";
import { useVoice } from "@/hooks/useVoice";
import { api } from "@/lib/api";
import { mutateOnce } from "@/lib/mutate";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VoiceField } from "@/components/voice/VoiceField";
import { STEPS_4, migrateStep, migrateStepV5, teamOptionLabel, teamOptionKeywords } from "./stepModel";
import { voiceController } from "@/lib/voiceController";
import { normalizeMoneyInput, moneyHadMinus } from "@/lib/voiceParse";
// TRACK 2A: the ONE vocabulary. No puja string literal may live in this file.
import { PUJA_TYPES, PUJA_LABELS_HI, matchPujaFromSpeech } from "@hmarepanditji/types";

// CANON TITLES — the artboards do NOT repeat "पूजा जोड़ें" on every step;
// each of 18a–18e carries the name of the thing being asked for.
// Walk पP0 #6: a WhatsApp video submission posts UPLOAD with this marker
// so admin knows the video arrives over WhatsApp.
const WHATSAPP_MARKER = "https://wa.me/918934095599";

const STEP_TITLES = ["पूजा जोड़िए", "और थोड़ी बातें", "सत्यापन वीडियो", "पूजा की स्थिति"] as const;

// DIGIT LAW: a minus is refused, never silently turned into a positive.
const MINUS_LINE = "दक्षिणा ऋण में नहीं हो सकती — कृपया सीधी राशि भरिए।";

// CANON PROGRESS (18a) — five 22×6 bars at radius 3, sindoor for the steps
// reached and #E7DCC9 for the rest. Canon draws no numbered circles here.
function StepBars({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-[7px]" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current}
      aria-label={`चरण ${current} / ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`w-[22px] h-[6px] rounded-[3px] ${i <= current - 1 ? "bg-saffron-500" : "bg-sand-200"}`} />
      ))}
    </div>
  );
}

// SAME draft key as the 7-step wizard: a pandit who started there resumes
// here (and vice-versa) instead of silently losing his work.
const DRAFT_KEY = "add-pooja-draft";

interface Draft {
  step: number;
  /**
   * TRACK 2A: the CANONICAL value, or null for the अन्य (request) path.
   * `name` remains the human string — the label for a canonical pick, the
   * pandit's own words for a request. Before this, `name` WAS the type:
   * the submit posted `poojaType: d.name`, so a typed "सत्यनारायण कथा"
   * became a fourth vocabulary the customer side could never match.
   */
  pujaType: string | null;
  name: string;
  desc: string;
  // सामग्री fields (items/prices/supplyMode) left this draft with the
  // chapter split — they live in my-poojas/samagri's own draft now. A v5
  // draft's samagri answers are dropped on migration: they were never
  // storable from here anyway (the saved:0 gap).
  teamSize: number;
  dakshina: number | null;
  videoUrl: string;
  /** Walk पP0 #6: the WhatsApp path marks the draft so submit activates. */
  sentViaWhatsapp: boolean;
  consent: boolean;
}

const EMPTY: Draft = {
  step: 0, pujaType: null, name: "", desc: "",
  teamSize: 1, dakshina: null, videoUrl: "", sentViaWhatsapp: false, consent: false,
};

function ytId(url: string): string | null {
  const m = url.match(/[?&]v=([A-Za-z0-9_-]{11})/) || url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) || url.match(/\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function AddPooja5Page() {
  const router = useRouter();
  const [d, setD] = useState<Draft>(EMPTY);
  // सभी path: how many landed, and which poojas failed by name (a partial
  // bulk is eight honest facts, not one lie)
  const [bulkResult, setBulkResult] = useState<{ saved: number; failed: string[] } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  // CANON 18a shows a "⏳ प्रतीक्षा में" pill on the header — but canon's 18a is
  // an EDIT of an already-submitted puja (सत्यनारायण कथा). TRUTHFUL-STATE: a
  // fresh draft is NOT प्रतीक्षा में, so the pill is gated on this poojaType
  // already holding a PENDING verification row (the resubmit/edit path).
  const [pendingTypes, setPendingTypes] = useState<string[]>([]);
  const { speak } = useVoice();
  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api("/pandit/pooja-verifications");
        if (alive && res.success && res.data?.latest) {
          setPendingTypes(
            (res.data.latest as Array<{ poojaType: string; status: string }>)
              .filter((r) => r.status === "PENDING")
              .map((r) => r.poojaType),
          );
        }
      } catch { /* display-only pill — a failed read just means no pill */ }
    })();
    return () => { alive = false; };
  }, []);

  // resume — PAGE 14 walk fixes (2026-07-25) + the v6 chapter split. The
  // draft carries a FORMAT MARKER: v6 clamps (own format, never remapped);
  // v5 remaps via migrateStepV5 (its सामग्री step is gone — the samagri
  // answers are dropped, they were never storable from here); anything
  // older runs the 7→5 remap first, then 5→4. Every path caps at step 2
  // (वीडियो): step 3 is the post-submit card and a submitted wizard CLEARS
  // its draft — a draft claiming it is corrupt.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const step = parsed?.v === 6
        ? Math.max(0, Math.min(2, Number(parsed?.step) || 0))
        : parsed?.v === 5
          ? migrateStepV5(parsed?.step)
          : migrateStepV5(migrateStep(parsed?.step));
      const { items: _i, prices: _p, supplyMode: _s, ...rest } = parsed ?? {};
      setD({ ...EMPTY, ...rest, step });
    } catch { /* ignore */ }
  }, []);
  // SUBMIT-CLEAR LAW: removeItem alone was DEFEATED — go(4) re-fired
  // this persist effect and re-wrote the full draft, so the next add
  // opened mid-wizard pre-filled with the previous pooja. Once
  // submitted, the persist stops for good.
  const submittedRef = useRef(false);
  useEffect(() => {
    if (submittedRef.current) return;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...d, v: 6 })); } catch { /* ignore */ }
  }, [d]);

  const go = (n: number) => set({ step: Math.max(0, Math.min(STEPS_4.length - 1, n)) });

  // Q6 SPOKEN-ERROR LAW: whatever renders as the error IS what is spoken.
  const sayError = (msg: string) => {
    setErrorMsg(msg);
    speak(msg);
  };

  // the samagri leg is GONE from this submit (chapter split, 2026-08-03):
  // the wizard no longer collects items it cannot price — the saved:0
  // mechanism's client half dies here, its server half becomes chapter 2's
  // intentional writer. Endpoints and idempotency keys otherwise unchanged.
  const submit = async () => {
    setSubmitting(true);
    setErrorMsg("");
    // F11-04: the pooja-config response used to be DISCARDED. When the server
    // rejects the dakshina for being below this pooja's floor, the wizard would
    // still march on to the ✓ screen — telling a 62-year-old his puja was sent
    // at a price that was never saved. TRUTHFUL-STATE: stop here, say the
    // minimum out loud (the server message names the exact figure), let him fix it.
    // NO supplyMode in this body — THE DEFAULT NEVER OVERWRITES AN ANSWER:
    // the supply question lives in chapter 2 now, and a chapter-1 save must
    // never revert what the pandit answered there.
    const cfg = await mutateOnce(`config:${d.name}`, "/pandit/pooja-config", { method: "POST", body: JSON.stringify({ poojaType: d.pujaType ?? d.name, teamSize: d.teamSize, dakshinaAmount: d.dakshina ?? 0 }) });
    if (!cfg.success) {
      setSubmitting(false);
      // NARRATION-QUEUE CLASS: go(1) unmounts this step's Narrate, whose
      // cleanup stopSpeech killed the floor-error line instantly — the
      // F11-04 truth was never HEARD. Await the full line, then swap.
      const floorMsg = cfg.error?.message || "दक्षिणा सहेजी नहीं जा सकी — कृपया दोबारा कोशिश कीजिए।";
      setErrorMsg(floorMsg);
      await voiceController.speakAndWait(floorMsg);
      go(1); // back to the दक्षिणा step so the number is editable
      return;
    }
    // Walk पP0 #6: no link but sent-via-WhatsApp → UPLOAD + marker + note,
    // so the submission goes PENDING instead of the button staying dead.
    const viaWhatsapp = !d.videoUrl && d.sentViaWhatsapp;
    const res = await mutateOnce(`verify:${d.name}`, "/pandit/pooja-verification", { method: "POST", body: JSON.stringify({ poojaType: d.pujaType ?? d.name, poojaName: d.name, poojaDescription: viaWhatsapp ? `${d.desc} [वीडियो व्हाट्सएप पर भेजा गया]`.trim() : d.desc, videoProvider: viaWhatsapp ? "UPLOAD" : "YOUTUBE", videoUrl: viaWhatsapp ? WHATSAPP_MARKER : d.videoUrl, consent: d.consent }) });
    setSubmitting(false);
    if (res.success) {
      submittedRef.current = true; // stop the persist effect FIRST
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      go(3);
    } else sayError(res.error?.message || "पूजा भेजी नहीं जा सकी — कृपया दोबारा कोशिश कीजिए।");
  };

  // the merged step needs both its answers before moving on (supply left
  // for chapter 2 — the listing no longer waits on it)
  const step1Done = d.dakshina != null && d.dakshina > 0;

  const resubmitPending = !!d.name.trim() && pendingTypes.includes(d.name.trim());

  return (
    <Screen
      title={STEP_TITLES[d.step] ?? "पूजा जोड़िए"}
      /* CANON 18e is a TITLE BLOCK ("पूजा की स्थिति") with NO back — a back
         from the done screen would re-enter the already-submitted video step.
         The "मेरी पूजाएँ देखिए" CTA is the escape (no-dead-ends satisfied). */
      headerVariant={d.step === 3 ? "title" : "row"}
      showBack={d.step !== 3}
      onBack={() => (d.step === 0 ? router.push("/my-poojas") : go(d.step - 1))}
      headerRightSlot={
        d.step === 0 && resubmitPending ? (
          // canon 18a pill: 12/800 #B8860B on #FBF0D8, 5px/11px, r999 —
          // type floored to the 15px label floor; ⏳ kept (canon draws it).
          <span className="text-[15px] font-extrabold text-brassdark bg-goldpale px-[11px] py-[5px] rounded-full font-hindi whitespace-nowrap">
            ⏳ प्रतीक्षा में
          </span>
        ) : undefined
      }
      banner={d.step < 3 ? <div className="px-[18px] pt-2 pb-1 bg-cream"><StepBars total={STEPS_4.length} current={d.step + 1} /></div> : undefined}
      // CANON content box (18a–18e): padding 8px 18px 16px; column gap 16px on
      // the ask-steps, 14px on वीडियो/स्थिति.
      mainClassName={`flex flex-col ${d.step >= 2 ? "gap-[14px]" : "gap-4"} px-[18px] pt-2 pb-4 page-enter`}
      footer={
        d.step < 3 ? (
          d.step === 2 ? (
            // canon CTA is min-height 62 / 21px / 800 / radius 18 / sindoor
            // lift — which is Button's default `md`, so the override is gone.
            // Label = canon 18d's "जमा करें", -इए register-converted.
            <Button className="w-full" loading={submitting} disabled={(!d.videoUrl && !d.sentViaWhatsapp) || !d.consent} onClick={submit}>
              जमा कीजिए
            </Button>
          ) : (
            <Button
              className="w-full"
              disabled={(d.step === 0 && !d.name.trim()) || (d.step === 1 && !step1Done)}
              onClick={() => go(d.step + 1)}
            >
              {`आगे — ${STEPS_4[d.step + 1]}`}
            </Button>
          )
        ) : undefined
      }
    >
      {/* F11-04: the server's floor message renders here AND is spoken (sayError).
          Canon 18e's rejection surface is the only red field in this flow —
          #FBE7E3 inside a 2px #E7B8AF rule at radius 18, copy at #C2321E.
          Tailwind's generic red-50/danger-30 was a near-miss for all three. */}
      {errorMsg && (
        <div role="alert" className="px-4 py-3 bg-[#FBE7E3] rounded-tile border-2 border-[#E7B8AF]">
          <p className="text-danger text-[18px] font-bold text-center leading-[1.4] font-hindi">{errorMsg}</p>
        </div>
      )}
      {d.step === 0 && !bulkResult && (
        <StepName d={d} set={set} onBulkDone={(saved, failed) => setBulkResult({ saved, failed })} />
      )}
      {d.step === 0 && bulkResult && (
        <div className="flex flex-col gap-3">
          <Narrate text={`${bulkResult.saved} पूजाएँ जुड़ गईं।`} />
          <div className="px-4 py-5 bg-card rounded-tile border-2 border-leaf-500 text-center">
            <p className="text-[22px] font-hindi font-black text-leaf-600">✓ {bulkResult.saved} पूजाएँ जुड़ गईं</p>
            <p className="mt-2 text-[16px] font-hindi text-softgrey">
              सब यजमानों को दिख रही हैं। दाम बदलने हों या वीडियो जोड़ना हो — मेरी पूजाएँ में जाइए।
            </p>
            {bulkResult.failed.length > 0 && (
              <p className="mt-2 text-[15px] font-hindi font-bold text-terracotta" role="alert">
                ये नहीं जुड़ीं: {bulkResult.failed.join(", ")} — फिर से कोशिश कीजिए।
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => router.push("/my-poojas")}
            className="min-h-[52px] rounded-tile bg-saffron-500 text-[18px] font-hindi font-bold text-white"
          >
            मेरी पूजाएँ देखिए
          </button>
        </div>
      )}
      {d.step === 1 && <StepDetails d={d} set={set} />}
      {d.step === 2 && <StepVideo d={d} set={set} />}
      {d.step === 3 && <StepDone name={d.name} pujaType={d.pujaType} />}
    </Screen>
  );
}

// ── Step 0: नाम + विवरण — canon 18a ─────────────────────────────────────────
// CANON: the नाम field sits BARE on the page (label + field, gap 8), no card
// around it. Only the spoken-description box is a surface, and that surface is
// a two-stop peach gradient (135deg,#FDEEE7,#FFF3E2) inside a 2px #F4B096 rule
// at radius 18 — the app had a flat saffron-50 fill inside the standard Card,
// so it read as one more white slab instead of the lit panel canon draws.
function StepName({ d, set, onBulkDone }: { d: Draft; set: (p: Partial<Draft>) => void; onBulkDone: (saved: number, failed: string[]) => void }) {
  // ── सभी पूजाएँ (Isj's addition, 2026-08-03): "let pandit also decide he
  // can choose all puja listed". One tap declares all 8 canonical poojas —
  // LISTED AND BOOKABLE immediately under the decoupled model, videos added
  // later per pooja. अन्य keeps its own path (a REQUEST is one-at-a-time by
  // nature). The rate: ONE dakshina applied to all ("एक दाम, सबके लिए"),
  // per-pooja override later on मेरी पूजाएँ; the floor hint shows the
  // HIGHEST floor (विवाह ₹2,101) so one number clears every pooja's minimum.
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkRate, setBulkRate] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkError, setBulkError] = useState("");
  const runBulk = async () => {
    const rate = Math.round(Number(bulkRate));
    if (!Number.isFinite(rate) || rate < 2101) {
      setBulkError("कम से कम ₹2,101 रखिए — विवाह की न्यूनतम दक्षिणा। बाद में हर पूजा का दाम अलग कर सकते हैं।");
      return;
    }
    setBulkBusy(true);
    setBulkError("");
    const failed: string[] = [];
    let saved = 0;
    // sequential, one mutateOnce per pooja — the same transaction discipline
    // as one submit, eight times; a failure names its pooja and the rest
    // still land (a partial bulk is eight honest facts, not one lie)
    for (const t of PUJA_TYPES) {
      try {
        const r = await mutateOnce(`bulk-config:${t}`, "/pandit/pooja-config", {
          method: "POST",
          body: JSON.stringify({ poojaType: t, teamSize: 1, dakshinaAmount: rate, supplyMode: "PANDIT_BRINGS" }),
        });
        if (r.success) saved++;
        else failed.push(PUJA_LABELS_HI[t]);
      } catch {
        failed.push(PUJA_LABELS_HI[t]);
      }
    }
    setBulkBusy(false);
    onBulkDone(saved, failed);
  };
  // TRACK 2A — THE PICKER. Every label and value comes from PUJA_TYPES /
  // PUJA_LABELS_HI: ZERO puja string literals live in this file, so the
  // vocabulary cannot drift by someone editing a screen.
  //
  // VOICE-FIRST SURVIVES. The VoiceField stays the input surface — a
  // 62-year-old speaks his pooja and typing is the fallback, not the design.
  // The transcript is matched against the 8 labels; a match selects that
  // option, a miss routes to अन्य WITH THE TRANSCRIPT PRESERVED as the
  // request name. Nothing is ever silently coerced.
  const speak = (v: string) => {
    const hit = matchPujaFromSpeech(v);
    if (hit) {
      set({ pujaType: hit, name: PUJA_LABELS_HI[hit] });
      void voiceController.speak(`${PUJA_LABELS_HI[hit]} चुन ली गई।`);
    } else {
      // अन्य path: his own words become the request's name, unchanged.
      set({ pujaType: null, name: v });
    }
  };
  const isOther = d.pujaType === null && d.name.trim() !== "";
  return (
    <>
      <Narrate text="कौन सी पूजा जोड़िए? नाम बोलिए या नीचे से चुनिए, फिर दो शब्दों में बताइए यह पूजा क्या है।" />
      <div className="flex flex-col gap-2">
        <VoiceField label="पूजा का नाम" promptText="पूजा का नाम बोलिए" mode="text" value={d.name} onChange={speak} placeholder={PUJA_LABELS_HI[PUJA_TYPES[0]]} />
      </div>
      <div className="flex flex-wrap gap-2">
        {PUJA_TYPES.map((t) => {
          const on = d.pujaType === t;
          return (
            <button
              key={t}
              type="button"
              aria-pressed={on}
              onClick={() => set({ pujaType: t, name: PUJA_LABELS_HI[t] })}
              className={`min-h-[52px] px-4 rounded-tile border-2 text-[18px] font-hindi font-bold transition ${on ? "border-saffron-600 bg-saffron-100 text-temple-700" : "border-sand bg-card text-softgrey"}`}
            >
              {PUJA_LABELS_HI[t]}
            </button>
          );
        })}
        {/* अन्य — the 9th option. A REQUEST, not a registration. */}
        <button
          type="button"
          aria-pressed={isOther}
          onClick={() => set({ pujaType: null, name: "" })}
          className={`min-h-[52px] px-4 rounded-tile border-2 text-[18px] font-hindi font-bold transition ${isOther ? "border-saffron-600 bg-saffron-100 text-temple-700" : "border-sand bg-card text-softgrey"}`}
        >
          अन्य
        </button>
        {/* ── सभी — the 10th affordance, full-width ── */}
        {!bulkOpen ? (
          <button
            type="button"
            onClick={() => setBulkOpen(true)}
            className="min-h-[52px] w-full px-4 rounded-tile border-2 border-dashed border-saffron-400 bg-card text-[18px] font-hindi font-bold text-saffron-700"
          >
            ✓ सभी पूजाएँ चुनिए — आठों एक साथ
          </button>
        ) : (
          <div className="w-full rounded-tile border-2 border-saffron-400 bg-card p-4 flex flex-col gap-3">
            <p className="text-[17px] font-hindi font-bold text-temple-700">आठों पूजाएँ जुड़ेंगी — एक दाम, सबके लिए</p>
            {/* "सामग्री बाद में, पूजा-पूजा से" (ruled, 2026-08-03): the bulk
                path declares POOJAS, not item lists — विवाह की सामग्री हवन
                की नहीं होती, so one tier-set cloned eight times would
                fabricate seven lists. Each pooja gains its samagri later,
                from मेरी पूजाएँ, one at a time. */}
            <p className="text-[15px] font-hindi text-softgrey">दक्षिणा बताइए। बाद में मेरी पूजाएँ में हर पूजा का दाम अलग कर सकते हैं। वीडियो और सामग्री बाद में, पूजा-पूजा से जुड़ेंगे।</p>
            <input
              type="number"
              inputMode="numeric"
              value={bulkRate}
              onChange={(e) => setBulkRate(e.target.value)}
              placeholder="₹ 2101"
              className="min-h-[52px] rounded-tile border-2 border-sand bg-white px-4 text-[20px] font-bold text-temple-700"
            />
            {bulkError && (
              <p className="text-[15px] font-hindi font-bold text-terracotta" role="alert">{bulkError}</p>
            )}
            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => void runBulk()}
              className="min-h-[52px] rounded-tile bg-saffron-500 text-[18px] font-hindi font-bold text-white disabled:opacity-50"
            >
              {bulkBusy ? "जोड़ रहे हैं…" : "हाँ, आठों जोड़िए"}
            </button>
            <button
              type="button"
              onClick={() => { setBulkOpen(false); setBulkError(""); }}
              className="min-h-[52px] rounded-tile border-2 border-sand bg-card text-[17px] font-hindi font-bold text-softgrey"
            >
              नहीं, एक-एक करके
            </button>
          </div>
        )}
      </div>
      {/* TRUTHFUL-STATE: a request is not a listing, and the screen says so
          BEFORE he invests four more steps in it — not on the done card. */}
      {isOther && (
        <div className="rounded-tile border-2 border-[#EBCF86] bg-goldpale p-4">
          <p className="text-[18px] font-hindi font-semibold text-brassdark leading-[1.45]">
            यह पूजा हमारी सूची में नहीं है। आपका अनुरोध जाँच के लिए भेजा जाएगा — मंज़ूरी के बाद ही यह यजमानों को दिखेगी।
          </p>
        </div>
      )}
      <div className="flex flex-col gap-2 p-4 rounded-tile border-2 border-saffron-200 bg-[linear-gradient(135deg,#FDEEE7,#FFF3E2)]">
        <VoiceField label="बोलकर बताइए यह पूजा क्या है" promptText="यह पूजा क्या है, दो शब्दों में बताइए" mode="text" value={d.desc} onChange={(v) => set({ desc: v })} placeholder="संक्षेप में बोलिए" />
        {/* CANON 18a: the panel echoes the captured description as a centred
            italic quote (canon 15/600 #47241A → 18px body floor). Canon's
            5-bar g-wave cluster is NOT drawn: VoiceField does not expose its
            live listening state, and animated waves over a silent mic would
            be untruthful — logged as a shared VoiceField todo. */}
        {d.desc.trim() !== "" && (
          <div className="text-[18px] font-semibold italic text-center leading-[1.45] font-hindi text-[#47241A]">
            &ldquo;{d.desc}&rdquo;
          </div>
        )}
      </div>
    </>
  );
}

// ── Step 1: और थोड़ी बातें = टीम + दक्षिणा ───────────────────────────────────
// THE MERGED STEP, minus आपूर्ति: the supply question moved to the samagri
// chapter (my-poojas/samagri) with the tier items and prices. The सामग्री
// step that used to sit before this one lives there too — see stepModel.ts.
function StepDetails({ d, set }: { d: Draft; set: (p: Partial<Draft>) => void }) {
  const nums = [1, 2, 3, 4, 5];
  // a typed/pasted minus is refused OUT LOUD (Q6: shown IS spoken)
  const [minusNote, setMinusNoteRaw] = useState(false);
  const setMinusNote = (on: boolean) => {
    setMinusNoteRaw((was) => {
      if (on && !was) void voiceController.speakAndWait(MINUS_LINE, { interrupt: false });
      return on;
    });
  };

  // group — team. Labels are "N पंडित", NEVER bare digits: a bare "5"
  // matches the "5" inside a spoken "5000" and would hijack the dakshina
  // correction path. Pinned by stepModel.test.ts.
  useVoiceOptions(
    nums.map((n) => ({
      label: teamOptionLabel(n),
      keywords: teamOptionKeywords(n),
      onSelect: () => set({ teamSize: n }),
    })),
  );

  return (
    <>
      {/* ONE narration for the merged step — separate ones back to back
          would talk over the pandit's first answer. */}
      <Narrate text="अब दो छोटी बातें — कितने पंडित चाहिए, और कुल दक्षिणा कितनी।" />

      {/* टीम — canon draws a −/N/+ stepper here. The 1..5 picker is kept
          because F10-01 pins "there is no zero option" against these five
          buttons by role+name; what IS taken from canon is the surround
          (#FFFDF8 inside a 2px #F0DFC4 rule at radius 18, padding 12) and the
          circular 52px keys in canon's own peach/sindoor pair. */}
      <div className="flex flex-col gap-2.5">
        {/* canon 18c heading verbatim (not part of any voice grammar) */}
        <span className="text-[19px] font-black text-saffron-700 font-hindi">कितने पंडित आएँगे?</span>
        <div className="p-3 rounded-tile border-2 border-sand bg-card flex flex-col gap-3 items-center">
          <div className="flex gap-2.5 flex-wrap justify-center">
            {nums.map((n) => (
              <button key={n} onClick={() => set({ teamSize: n })} aria-pressed={d.teamSize === n}
                className={`w-[56px] h-[56px] rounded-full border-2 text-[22px] font-black active:scale-95 transition-transform ${
                  d.teamSize === n ? "bg-saffron-500 border-saffron-500 text-white" : "bg-saffron-50 border-saffron-200 text-saffron-500"}`}>{n}</button>
            ))}
          </div>
          <span className="text-[18px] font-hindi font-semibold text-softgrey">{d.teamSize} पंडित (आप सहित)</span>
        </div>
      </div>

      {/* दक्षिणा */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[19px] font-black text-saffron-700 font-hindi">कुल दक्षिणा</span>
        <Card className="bg-card flex flex-col gap-3">
          <span className="text-[18px] font-hindi text-temple-700 font-bold">{d.name || "पूजा"} ({d.teamSize} पंडितों सहित)</span>
          {/* DIGIT LAW: the shared money normalizer (same source as the phone
              field) — Devanagari digits convert instead of being refused by
              the browser. A typed minus is ANSWERED with the floor line, not
              silently swallowed into a positive number. */}
          <VoiceField
            label="कुल दक्षिणा"
            promptText="इस पूजा की कुल दक्षिणा बोलिए"
            mode="money"
            value={d.dakshina != null ? String(d.dakshina) : ""}
            onChange={(v) => {
              const digits = normalizeMoneyInput(v);
              set({ dakshina: digits ? parseInt(digits, 10) : null });
              setMinusNote(moneyHadMinus(v));
            }}
            placeholder="₹ राशि"
          />
          {minusNote && (
            <p role="alert" className="text-[18px] font-bold text-danger font-hindi leading-snug">
              {MINUS_LINE}
            </p>
          )}
          <span className="text-[18px] font-hindi font-semibold text-softgrey leading-[1.4]">इसमें बाकी पंडितों की दक्षिणा भी शामिल है।</span>
        </Card>
        {/* CANON 18c closes the step on a leaf summary bar — the two-stop
            (135deg,#E4F3E9,#F0F8F1) inside #BFE3CC, amount at 30/900. It
            renders only once a real amount exists: an empty ₹0 bar would be
            a number the pandit never gave. */}
        {d.dakshina != null && d.dakshina > 0 && (
          <div className="rounded-tile border-2 border-leafpale bg-[linear-gradient(135deg,#E4F3E9,#F0F8F1)] p-4 flex items-center justify-between gap-3">
            <span className="flex flex-col">
              <span className="text-[18px] font-hindi font-extrabold text-leaf-700">दक्षिणा</span>
              <span className="text-[18px] font-hindi font-semibold text-softgrey">({d.teamSize} पंडितों सहित)</span>
            </span>
            <span className="text-[30px] font-hindi font-black text-leaf-700">₹{d.dakshina.toLocaleString("en-IN")}</span>
          </div>
        )}
      </div>
    </>
  );
}

// ── Step 3: video (unchanged) ─────────────────────────────────────────────────
function StepVideo({ d, set }: { d: Draft; set: (p: Partial<Draft>) => void }) {
  const id = ytId(d.videoUrl);
  // CANON 18d noun phrases, verbatim (pinned by conformance-f08 F08-03).
  // Canon greys the 4th row (radio_button_unchecked); all four ship as
  // "✅ <item>" spans here — the F08-03 pin freezes that delivery shape,
  // and static all-checked tips are the accepted deviation.
  const CHECK = ["साफ़ मंत्रोच्चार", "अच्छी रोशनी", "चेहरा साफ़ दिखे", "पूजा का माहौल"];
  return (
    <>
      <Narrate text="दो मिनट का वीडियो चाहिए — परिवार यही देखकर आपको चुनेंगे। यूट्यूब लिंक यहाँ टाइप कीजिए।" />

      {/* CANON 18d opens on a 172px night panel — the (150deg,#2A1B3D,#4a2e2a)
          gradient inside a 2px #E7DCC9 rule, with a drawn silhouette: a 48px
          head disc and a 110×60 shoulder dome, both rgba(255,246,233,.25).
          Canon's centred record key is NOT drawn: this build has no in-app
          recorder, so a record button would be an ability that does not exist.
          Once a real link resolves, the panel gives way to the preview. */}
      {id ? (
        <div className="rounded-tile overflow-hidden border-2 border-sand-200 aspect-video">
          <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${id}`} title="preview" allowFullScreen />
        </div>
      ) : (
        <div aria-hidden="true" className="relative w-full h-[172px] rounded-tile bg-night border-2 border-sand-200 overflow-hidden flex items-end justify-center">
          <span className="absolute top-[28px] left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[rgba(255,246,233,.25)]" />
          <span className="w-[110px] h-[60px] rounded-t-[56px] bg-[rgba(255,246,233,.25)]" />
        </div>
      )}

      <Card className="bg-card flex flex-col gap-2.5">
        <span className="text-[18px] font-hindi text-softgrey font-bold">यूट्यूब लिंक (टाइप कीजिए — यह बोलकर नहीं भरा जाता)</span>
              {/* CONSENT IS ONLY CONSENT IF HE KNOWS. He pastes an "unlisted"
                  link and would reasonably assume only ops watch it. Under the
                  2026-07-29 ruling सत्यापन INFORMS rather than gates, so the
                  sample is shown to every visitor of his page — in BOTH states.
                  He is told here, before he submits, not in a policy page. */}
              <span className="text-[15px] font-hindi text-temple-700 leading-[1.45] bg-saffron-50 border border-saffron-200 rounded-[10px] px-3 py-2">
                यह वीडियो आपके पन्ने पर यजमानों को दिखेगा — जाँच पूरी होने से पहले भी।
                <span className="block text-softgrey mt-0.5">इसीलिए यूट्यूब पर इसे “unlisted” रखिए, “private” नहीं।</span>
              </span>
        <input value={d.videoUrl} onChange={(e) => set({ videoUrl: e.target.value })} inputMode="url" placeholder="https://youtu.be/…"
          className="h-[56px] px-4 rounded-field border-2 border-saffron-200 text-[18px] font-hindi bg-card" />
      </Card>

      {/* CANON checklist card: #FFFDF8 inside a 1.5px #F0DFC4 rule at radius
          16, rows at 700 in #341A13 behind a leaf ✓ — not grey 15px runts. */}
      <div className="rounded-field border-[1.5px] border-sand bg-card p-3.5 flex flex-col gap-2.5">
        <span className="text-[18px] font-extrabold text-softgrey font-hindi">अच्छे वीडियो के लिए</span>
        {/* The tick stays the ✅ glyph inline in ONE span: F08-03 pins the
            checklist's delivery shape as "✅ <item>" per span, and splitting
            the mark into its own element (canon draws a filled leaf
            check_circle) empties that query. Weight/colour follow canon. */}
        {CHECK.map((c) => (
          <span key={c} className="text-[18px] font-hindi font-bold text-temple-700 leading-[1.5]">✅ {c}</span>
        ))}
      </div>

      {/* CANON help row: a flat #E4F3E9 strip at radius 14, glyph left,
          forward arrow right — canon puts no rule around it. */}
      {/* Walk पP0 #6: tapping ALSO marks the draft sent-via-WhatsApp so
          जमा कीजिए activates and the pooja submits as PENDING. */}
      <a href={`https://wa.me/918934095599?text=${encodeURIComponent("नमस्ते, मुझे अपनी पूजा का वीडियो भेजना है")}`} target="_blank" rel="noopener"
        onClick={() => set({ sentViaWhatsapp: true })}
        className="w-full min-h-[56px] px-3.5 py-3 rounded-[14px] bg-leaf-100 flex items-center gap-2.5 text-[18px] font-hindi font-bold text-leaf-700 active:scale-[0.98] transition-transform">
        <span className="text-[22px] leading-none">💬</span>
        {/* canon copy ("…भेजें" → -इए register); arrow drawn, not a glyph char */}
        <span className="flex-1 text-left">मदद चाहिए? WhatsApp पर भेजिए</span>
        <span className="material-symbols-outlined text-[20px] text-leaf-500 leading-none" aria-hidden="true">arrow_forward</span>
      </a>
      {d.sentViaWhatsapp && !d.videoUrl && (
        <div className="w-full rounded-[14px] bg-leaf-100 border-2 border-leaf-500/30 px-4 py-3 text-[18px] font-hindi font-bold text-leaf-700 text-center">
          ✓ व्हाट्सएप पर भेजिए — अब नीचे सहमति देकर “जमा कीजिए” दबाइए
        </div>
      )}

      <button onClick={() => set({ consent: !d.consent })} aria-pressed={d.consent}
        className="w-full min-h-[56px] flex items-center gap-3 px-4 py-3 rounded-field border-2 border-saffron-200 bg-card active:scale-[0.99] transition-transform">
        <span className={`w-8 h-8 shrink-0 rounded-[10px] border-2 flex items-center justify-center text-[20px] ${d.consent ? "bg-leaf-500 border-leaf-500 text-white" : "border-saffron-200"}`}>{d.consent ? "✓" : ""}</span>
        <span className="text-[18px] font-hindi font-semibold text-temple-700 text-left leading-[1.4]">यह वीडियो मेरा है — जाँच के लिए और अपने पन्ने पर यजमानों को दिखाने के लिए सहमति देता हूँ</span>
      </button>
    </>
  );
}

// ── Step 3: प्रतीक्षा में + the samagri chapter's front door ─────────────────
function StepDone({ name, pujaType }: { name: string; pujaType: string | null }) {
  const router = useRouter();
  return (
    // CANON 18e renders the outcome as a STATUS CARD, not a pill: the pending
    // state is #FBF0D8 inside a 2px #EBCF86 rule at radius 18, a 32px ⏳, the
    // heading at 19/900 in brass #B8860B and the pooja line at 600 in #8A6F5C.
    // Canon also shows प्रमाणित and अस्वीकृत beside it; neither is true of a
    // pooja submitted one second ago, so only the pending card is drawn.
    <div className="flex flex-col gap-[14px] pt-4">
      <Narrate text="बहुत बढ़िया! आपकी पूजा जाँच के लिए भेज दी गई। स्वीकृत होते ही सूचना मिलेगी।" />
      {/* drawn-not-emoji: canon 18e draws NO 🙏 hero — only status cards
          (the ⏳ inside the pending card is the one emoji canon draws here) */}
      <span className="text-[24px] font-hindi font-bold text-temple-700 text-center">{name} भेज दी गई</span>
      <div className="rounded-tile border-2 border-[#EBCF86] bg-goldpale p-4 flex items-center gap-3.5">
        <span className="text-[32px] leading-none">⏳</span>
        <span className="flex-1 flex flex-col gap-0.5">
          <span className="text-[19px] font-hindi font-black text-brassdark">प्रतीक्षा में</span>
          <span className="text-[18px] font-hindi font-semibold text-softgrey">{name} · जाँच जारी है</span>
        </span>
      </div>
      {/* CHAPTER 2's FRONT DOOR (samagri-tiers order, 2026-08-03): the
          pooja is listed; samagri is detail work that layers on after —
          three small screens, every one skippable. Canonical poojas only:
          a REQUEST is not listed yet, so its samagri would be detail on a
          thing that does not exist. */}
      {pujaType && (
        <button
          type="button"
          onClick={() => router.push(`/my-poojas/samagri?pooja=${encodeURIComponent(pujaType)}`)}
          className="min-h-[56px] w-full rounded-tile border-2 border-dashed border-saffron-400 bg-card text-[18px] font-hindi font-bold text-saffron-700"
        >
          🛍️ सामग्री जोड़िए — तीन स्तर, तीन दाम
        </button>
      )}
      <Button className="mt-2 w-full" onClick={() => router.push("/my-poojas")}>मेरी पूजाएँ देखिए</Button>
    </div>
  );
}
