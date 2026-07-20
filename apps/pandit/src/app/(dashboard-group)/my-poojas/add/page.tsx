"use client";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────
// पूजा जोड़ें in 5 steps — THE LIVE PATH (canon 18a–18e: "5 चरण").
//
// Canon titles these frames 1/5…5/5, and Isj's exact-UI ruling resolved
// the Wave 2 side-by-side in canon's favour. This shape replaced the old
// 7-step wizard outright — keeping both live would have left two routes
// to the same task, which is exactly the confusion the ruling ended.
//
// THE MERGE: आपूर्ति + टीम + दक्षिणा fold into one "और थोड़ी बातें".
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

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Narrate } from "@/hooks/useScreenVoice";
import { useVoiceOptions } from "@/hooks/useVoiceScreen";
import { useVoice } from "@/hooks/useVoice";
import { mutateOnce } from "@/lib/mutate";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VoiceField } from "@/components/voice/VoiceField";
import { SamagriTiers, type SamagriTier, type SamagriItem, type TierData } from "@/components/SamagriTiers";
import { STEPS_5, migrateStep, teamOptionLabel, teamOptionKeywords } from "./stepModel";

// CANON TITLES — the artboards do NOT repeat "पूजा जोड़ें" on every step;
// each of 18a–18e carries the name of the thing being asked for.
const STEP_TITLES = ["पूजा जोड़ें", "सामग्री के तीन स्तर", "और थोड़ी बातें", "सत्यापन वीडियो", "पूजा की स्थिति"] as const;

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

type SupplyMode = "PANDIT_BRINGS" | "PLATFORM_SELLS" | "LIST_ONLY";
const TIER_LABEL: Record<SamagriTier, string> = { BASIC: "बेसिक", STANDARD: "स्टैंडर्ड", PREMIUM: "प्रीमियम" };

interface Draft {
  step: number;
  name: string;
  desc: string;
  items: Record<SamagriTier, SamagriItem[]>;
  prices: Record<SamagriTier, number | null>;
  supplyMode: SupplyMode | null;
  teamSize: number;
  dakshina: number | null;
  videoUrl: string;
  consent: boolean;
}

const EMPTY: Draft = {
  step: 0, name: "", desc: "",
  items: { BASIC: [], STANDARD: [], PREMIUM: [] },
  prices: { BASIC: null, STANDARD: null, PREMIUM: null },
  supplyMode: null, teamSize: 1, dakshina: null, videoUrl: "", consent: false,
};

function ytId(url: string): string | null {
  const m = url.match(/[?&]v=([A-Za-z0-9_-]{11})/) || url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) || url.match(/\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function AddPooja5Page() {
  const router = useRouter();
  const [d, setD] = useState<Draft>(EMPTY);
  const [activeTier, setActiveTier] = useState<SamagriTier>("BASIC");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { speak } = useVoice();
  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));

  // resume — a 7-step draft's step index is remapped onto the 5-step model
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setD({ ...EMPTY, ...parsed, step: migrateStep(parsed?.step) });
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch { /* ignore */ }
  }, [d]);

  const go = (n: number) => set({ step: Math.max(0, Math.min(STEPS_5.length - 1, n)) });

  const tiersData: TierData[] = (["BASIC", "STANDARD", "PREMIUM"] as SamagriTier[]).map((tier) => ({
    tier, label: TIER_LABEL[tier], price: d.supplyMode === "PANDIT_BRINGS" ? d.prices[tier] : null, items: d.items[tier],
  }));

  // Q6 SPOKEN-ERROR LAW: whatever renders as the error IS what is spoken.
  const sayError = (msg: string) => {
    setErrorMsg(msg);
    speak(msg);
  };

  // identical to the 7-step submit — same endpoints, same idempotency keys
  const submit = async () => {
    setSubmitting(true);
    setErrorMsg("");
    const tiers = (["BASIC", "STANDARD", "PREMIUM"] as SamagriTier[])
      .filter((t) => d.items[t].length > 0)
      .map((t) => ({ tier: t, price: d.supplyMode === "PANDIT_BRINGS" ? d.prices[t] : null, items: d.items[t] }));
    if (tiers.length) await mutateOnce(`samagri:${d.name}`, "/pandit/samagri-packages", { method: "POST", body: JSON.stringify({ pujaType: d.name, tiers }) });
    // F11-04: the pooja-config response used to be DISCARDED. When the server
    // rejects the dakshina for being below this pooja's floor, the wizard would
    // still march on to the ✓ screen — telling a 62-year-old his puja was sent
    // at a price that was never saved. TRUTHFUL-STATE: stop here, say the
    // minimum out loud (the server message names the exact figure), let him fix it.
    const cfg = await mutateOnce(`config:${d.name}`, "/pandit/pooja-config", { method: "POST", body: JSON.stringify({ poojaType: d.name, teamSize: d.teamSize, dakshinaAmount: d.dakshina ?? 0, supplyMode: d.supplyMode ?? "PANDIT_BRINGS" }) });
    if (!cfg.success) {
      setSubmitting(false);
      sayError(cfg.error?.message || "दक्षिणा सहेजी नहीं जा सकी — कृपया दोबारा कोशिश कीजिए।");
      go(2); // back to the दक्षिणा step so the number is editable
      return;
    }
    const res = await mutateOnce(`verify:${d.name}`, "/pandit/pooja-verification", { method: "POST", body: JSON.stringify({ poojaType: d.name, poojaName: d.name, poojaDescription: d.desc, videoProvider: "YOUTUBE", videoUrl: d.videoUrl, consent: d.consent }) });
    setSubmitting(false);
    if (res.success) { try { localStorage.removeItem(DRAFT_KEY); } catch {} ; go(4); }
    else sayError(res.error?.message || "पूजा भेजी नहीं जा सकी — कृपया दोबारा कोशिश कीजिए।");
  };

  // the merged step needs all three answered before moving on
  const step2Done = !!d.supplyMode && d.dakshina != null && d.dakshina > 0;

  return (
    <Screen
      title={STEP_TITLES[d.step] ?? "पूजा जोड़ें"}
      showBack
      onBack={() => (d.step === 0 ? router.push("/my-poojas") : go(d.step - 1))}
      banner={d.step < 4 ? <div className="px-[18px] pt-2 pb-1 bg-cream"><StepBars total={STEPS_5.length} current={d.step + 1} /></div> : undefined}
      // CANON content box (18a–18e): padding 8px 18px 16px; column gap 16px on
      // the ask-steps, 12px on सामग्री, 14px on वीडियो/स्थिति.
      mainClassName={`flex flex-col ${d.step >= 3 ? "gap-[14px]" : d.step === 1 ? "gap-3" : "gap-4"} px-[18px] pt-2 pb-4 page-enter`}
      footer={
        d.step < 4 ? (
          d.step === 3 ? (
            // canon CTA is min-height 62 / 21px / 800 / radius 18 / sindoor
            // lift — which is Button's default `md`, so the override is gone.
            <Button className="w-full" loading={submitting} disabled={!d.videoUrl || !d.consent} onClick={submit}>
              पूजा भेजें
            </Button>
          ) : (
            <Button
              className="w-full"
              disabled={(d.step === 0 && !d.name.trim()) || (d.step === 2 && !step2Done)}
              onClick={() => go(d.step + 1)}
            >
              {`आगे — ${STEPS_5[d.step + 1]}`}
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
      {d.step === 0 && <StepName d={d} set={set} />}
      {d.step === 1 && <StepSamagri d={d} set={set} activeTier={activeTier} setActiveTier={setActiveTier} tiersData={tiersData} />}
      {d.step === 2 && <StepDetails d={d} set={set} />}
      {d.step === 3 && <StepVideo d={d} set={set} />}
      {d.step === 4 && <StepDone name={d.name} />}
    </Screen>
  );
}

// ── Step 0: नाम + विवरण — canon 18a ─────────────────────────────────────────
// CANON: the नाम field sits BARE on the page (label + field, gap 8), no card
// around it. Only the spoken-description box is a surface, and that surface is
// a two-stop peach gradient (135deg,#FDEEE7,#FFF3E2) inside a 2px #F4B096 rule
// at radius 18 — the app had a flat saffron-50 fill inside the standard Card,
// so it read as one more white slab instead of the lit panel canon draws.
function StepName({ d, set }: { d: Draft; set: (p: Partial<Draft>) => void }) {
  return (
    <>
      <Narrate text="कौन सी पूजा जोड़ें? नाम बोलिए, फिर दो शब्दों में बताइए यह पूजा क्या है।" />
      <div className="flex flex-col gap-2">
        <VoiceField label="पूजा का नाम" promptText="पूजा का नाम बोलिए" mode="text" value={d.name} onChange={(v) => set({ name: v })} placeholder="जैसे सत्यनारायण कथा" />
      </div>
      <div className="flex flex-col gap-2 p-4 rounded-tile border-2 border-saffron-200 bg-[linear-gradient(135deg,#FDEEE7,#FFF3E2)]">
        <VoiceField label="बोलकर बताइए यह पूजा क्या है" promptText="यह पूजा क्या है, दो शब्दों में बताइए" mode="text" value={d.desc} onChange={(v) => set({ desc: v })} placeholder="संक्षेप में बोलिए" />
      </div>
    </>
  );
}

// ── Step 1: सामग्री (unchanged) ───────────────────────────────────────────────
function StepSamagri({ d, set, activeTier, setActiveTier, tiersData }: {
  d: Draft; set: (p: Partial<Draft>) => void; activeTier: SamagriTier; setActiveTier: (t: SamagriTier) => void; tiersData: TierData[];
}) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [brand, setBrand] = useState("");
  const addItem = () => {
    if (!name.trim()) return;
    set({ items: { ...d.items, [activeTier]: [...d.items[activeTier], { name: name.trim(), qty: qty.trim() || "1", brand: brand.trim() || undefined }] } });
    setName(""); setQty(""); setBrand("");
  };
  return (
    <>
      <Narrate text="हर स्तर में सामान जोड़िए। स्टैंडर्ड में बेसिक का सामान अपने आप जुड़ जाता है।" />
      {/* CANON 18b: the written hint above the tiers, and the tier stack sits
          DIRECTLY on the page — no card behind it. The card wrapper was
          drawing a second surface around cards, flattening the whole step. */}
      <span className="text-[18px] font-bold font-hindi text-softgrey">ऊपर का स्तर नीचे वाला सब अपने आप जोड़ लेता है 👇</span>
      <SamagriTiers tiers={tiersData} active={activeTier} onSelect={setActiveTier} showPrices={false} />
      <Card className="flex flex-col gap-2 bg-card">
        <span className="text-[18px] font-hindi text-softgrey font-bold">{TIER_LABEL[activeTier]} में जोड़ें</span>
        <VoiceField label={`${TIER_LABEL[activeTier]} में सामान`} promptText="सामान का नाम बोलिए" mode="text" value={name} onChange={setName} placeholder="सामान का नाम" />
        <div className="flex gap-2">
          <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="मात्रा" className="flex-1 h-[56px] px-3.5 rounded-field border-2 border-saffron-200 text-[18px] font-hindi bg-card" />
          <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="कंपनी" className="flex-1 h-[56px] px-3.5 rounded-field border-2 border-saffron-200 text-[18px] font-hindi bg-card" />
        </div>
        <Button variant="secondary" className="h-[56px] min-h-[56px] text-[19px] rounded-[14px]" onClick={addItem} disabled={!name.trim()}>जोड़ें</Button>
      </Card>
    </>
  );
}

// ── Step 2: और थोड़ी बातें = आपूर्ति + टीम + दक्षिणा ──────────────────────────
// THE MERGED STEP. Both option groups mount here together; see the header
// comment and stepModel.test.ts for why that is safe and what makes it so.
function StepDetails({ d, set }: { d: Draft; set: (p: Partial<Draft>) => void }) {
  const nums = [1, 2, 3, 4, 5];

  // group A — supply (unchanged labels)
  useVoiceOptions([
    { label: "हाँ, मैं लाऊँगा", onSelect: () => set({ supplyMode: "PANDIT_BRINGS" }) },
    { label: "प्लेटफ़ॉर्म बेचे", onSelect: () => set({ supplyMode: "PLATFORM_SELLS" }) },
    { label: "सिर्फ़ सूची", onSelect: () => set({ supplyMode: "LIST_ONLY" }) },
  ]);

  // group B — team. Labels are "N पंडित", NEVER bare digits: a bare "5"
  // matches the "5" inside a spoken "5000" and would hijack the dakshina
  // correction path. Pinned by stepModel.test.ts.
  useVoiceOptions(
    nums.map((n) => ({
      label: teamOptionLabel(n),
      keywords: teamOptionKeywords(n),
      onSelect: () => set({ teamSize: n }),
    })),
  );

  // CANON 18c tile: min-height 70, radius 16, resting #FFFDF8 on a 2px #E7DCC9
  // rule with a 26px glyph; CHOSEN is the leaf pair — #E4F3E9 behind a 2.5px
  // #1E7A46 rule, label #155C34 at 900. The app was inverting a sindoor slab
  // instead, which is canon's CHIP language, not its tile language.
  const opt = (mode: SupplyMode, icon: string, label: string, sub: string) => {
    const on = d.supplyMode === mode;
    return (
      <button onClick={() => set({ supplyMode: mode })} aria-pressed={on}
        className={`w-full min-h-[70px] px-4 py-3 rounded-field flex items-center gap-3 text-left active:scale-[0.98] transition-transform ${
          on ? "bg-leaf-100 border-[2.5px] border-leaf-500" : "bg-card border-2 border-sand-200"}`}>
        <span className="text-[26px] leading-none">{icon}</span>
        <span className="flex flex-col gap-0.5">
          <span className={`text-[19px] font-hindi ${on ? "font-black text-leaf-700" : "font-extrabold text-saffron-700"}`}>{label}</span>
          <span className={`text-[18px] font-hindi font-semibold ${on ? "text-leaf-700/85" : "text-softgrey"}`}>{sub}</span>
        </span>
      </button>
    );
  };

  return (
    <>
      {/* ONE narration for the merged step — three separate ones back to
          back would talk over the pandit's first answer. */}
      <Narrate text="अब तीन छोटी बातें — सामान कौन लाएगा, कितने पंडित चाहिए, और कुल दक्षिणा कितनी।" />

      {/* आपूर्ति — canon section heading is 19/900 in saffron-700, not a
          15/800 grey caption. Grey captions belong to FIELD labels; the
          questions on this step are headings. */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[19px] font-black text-saffron-700 font-hindi">सामान कौन लाएगा?</span>
        <div className="flex flex-col gap-2.5">
          {opt("PANDIT_BRINGS", "🛍️", "हाँ, मैं लाऊँगा", "तीनों स्तर के दाम आप तय करें")}
          {opt("PLATFORM_SELLS", "🚚", "प्लेटफ़ॉर्म बेचे और पहुँचाए", "हम सामान का इंतज़ाम करें")}
          {opt("LIST_ONLY", "📝", "सिर्फ़ सूची दूँ", "यजमान ख़ुद ले आएँ")}
        </div>
        {d.supplyMode === "PANDIT_BRINGS" && (
          <div className="p-4 rounded-tile border-2 border-saffron-200 bg-[linear-gradient(135deg,#FDEEE7,#FFF3E2)]">
            <span className="text-[18px] font-hindi text-saffron-700 font-semibold leading-[1.4]">⚠ जो कंपनी बताई, वही सामान लाना होगा — यजमान का भरोसा इसी पर है।</span>
          </div>
        )}
      </div>

      {/* टीम — canon draws a −/N/+ stepper here. The 1..5 picker is kept
          because F10-01 pins "there is no zero option" against these five
          buttons by role+name; what IS taken from canon is the surround
          (#FFFDF8 inside a 2px #F0DFC4 rule at radius 18, padding 12) and the
          circular 52px keys in canon's own peach/sindoor pair. */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[19px] font-black text-saffron-700 font-hindi">कितने पंडित चाहिए?</span>
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
          <VoiceField label="कुल दक्षिणा" promptText="इस पूजा की कुल दक्षिणा बोलिए" mode="money" value={d.dakshina != null ? String(d.dakshina) : ""} onChange={(v) => set({ dakshina: v ? parseInt(v.replace(/\D/g, "") || "0", 10) : null })} placeholder="₹ राशि" />
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
  const CHECK = ["मंत्र साफ़ सुनाई दें", "अच्छी रोशनी हो", "आपका चेहरा दिखे", "पूजा का माहौल दिखे"];
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
        <span className="text-[18px] font-hindi text-softgrey font-bold">यूट्यूब लिंक (टाइप करें — यह बोलकर नहीं भरा जाता)</span>
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
      <a href={`https://wa.me/918934095599?text=${encodeURIComponent("नमस्ते, मुझे अपनी पूजा का वीडियो भेजना है")}`} target="_blank" rel="noopener"
        className="w-full min-h-[56px] px-3.5 py-3 rounded-[14px] bg-leaf-100 flex items-center gap-2.5 text-[18px] font-hindi font-bold text-leaf-700 active:scale-[0.98] transition-transform">
        <span className="text-[22px] leading-none">💬</span>
        <span className="flex-1 text-left">भेज दीजिए, हम लगा देंगे</span>
        <span className="text-[20px] text-leaf-500 leading-none">→</span>
      </a>

      <button onClick={() => set({ consent: !d.consent })} aria-pressed={d.consent}
        className="w-full min-h-[56px] flex items-center gap-3 px-4 py-3 rounded-field border-2 border-saffron-200 bg-card active:scale-[0.99] transition-transform">
        <span className={`w-8 h-8 shrink-0 rounded-[10px] border-2 flex items-center justify-center text-[20px] ${d.consent ? "bg-leaf-500 border-leaf-500 text-white" : "border-saffron-200"}`}>{d.consent ? "✓" : ""}</span>
        <span className="text-[18px] font-hindi font-semibold text-temple-700 text-left leading-[1.4]">यह वीडियो मेरा है, सत्यापन के लिए सहमति देता हूँ</span>
      </button>
    </>
  );
}

// ── Step 4: प्रतीक्षा में (unchanged) ─────────────────────────────────────────
function StepDone({ name }: { name: string }) {
  const router = useRouter();
  return (
    // CANON 18e renders the outcome as a STATUS CARD, not a pill: the pending
    // state is #FBF0D8 inside a 2px #EBCF86 rule at radius 18, a 32px ⏳, the
    // heading at 19/900 in brass #B8860B and the pooja line at 600 in #8A6F5C.
    // Canon also shows प्रमाणित and अस्वीकृत beside it; neither is true of a
    // pooja submitted one second ago, so only the pending card is drawn.
    <div className="flex flex-col gap-[14px] pt-4">
      <Narrate text="बहुत बढ़िया! आपकी पूजा जाँच के लिए भेज दी गई। स्वीकृत होते ही सूचना मिलेगी।" />
      <span className="text-[72px] text-center">🙏</span>
      <span className="text-[24px] font-hindi font-bold text-temple-700 text-center">{name} भेज दी गई</span>
      <div className="rounded-tile border-2 border-[#EBCF86] bg-goldpale p-4 flex items-center gap-3.5">
        <span className="text-[32px] leading-none">⏳</span>
        <span className="flex-1 flex flex-col gap-0.5">
          <span className="text-[19px] font-hindi font-black text-brassdark">प्रतीक्षा में</span>
          <span className="text-[18px] font-hindi font-semibold text-softgrey">{name} · जाँच जारी है</span>
        </span>
      </div>
      <Button className="mt-2 w-full" onClick={() => router.push("/my-poojas")}>मेरी पूजाएँ देखें</Button>
    </div>
  );
}
