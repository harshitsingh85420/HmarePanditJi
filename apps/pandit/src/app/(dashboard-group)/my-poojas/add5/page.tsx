"use client";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────
// WAVE 2 CANDIDATE — पूजा जोड़ें in 5 steps (canon 18: "5 चरण").
//
// NOT MERGED, NOT THE LIVE PATH. /my-poojas/add (7 steps) is untouched,
// so both shapes can be driven on a real device before Isj rules.
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
import { mutateOnce } from "@/lib/mutate";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VoiceField } from "@/components/voice/VoiceField";
import { ProgressDots } from "@/components/ui/ProgressDots";
import { SamagriTiers, type SamagriTier, type SamagriItem, type TierData } from "@/components/SamagriTiers";
import { STEPS_5, migrateStep, teamOptionLabel, teamOptionKeywords } from "./stepModel";

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

  // identical to the 7-step submit — same endpoints, same idempotency keys
  const submit = async () => {
    setSubmitting(true);
    const tiers = (["BASIC", "STANDARD", "PREMIUM"] as SamagriTier[])
      .filter((t) => d.items[t].length > 0)
      .map((t) => ({ tier: t, price: d.supplyMode === "PANDIT_BRINGS" ? d.prices[t] : null, items: d.items[t] }));
    if (tiers.length) await mutateOnce(`samagri:${d.name}`, "/pandit/samagri-packages", { method: "POST", body: JSON.stringify({ pujaType: d.name, tiers }) });
    await mutateOnce(`config:${d.name}`, "/pandit/pooja-config", { method: "POST", body: JSON.stringify({ poojaType: d.name, teamSize: d.teamSize, dakshinaAmount: d.dakshina ?? 0, supplyMode: d.supplyMode ?? "PANDIT_BRINGS" }) });
    const res = await mutateOnce(`verify:${d.name}`, "/pandit/pooja-verification", { method: "POST", body: JSON.stringify({ poojaType: d.name, poojaName: d.name, poojaDescription: d.desc, videoProvider: "YOUTUBE", videoUrl: d.videoUrl, consent: d.consent }) });
    setSubmitting(false);
    if (res.success) { try { localStorage.removeItem(DRAFT_KEY); } catch {} ; go(4); }
  };

  // the merged step needs all three answered before moving on
  const step2Done = !!d.supplyMode && d.dakshina != null && d.dakshina > 0;

  return (
    <Screen
      title="पूजा जोड़ें"
      showBack
      onBack={() => (d.step === 0 ? router.push("/my-poojas") : go(d.step - 1))}
      banner={<div className="px-4 pt-2 pb-1 bg-cream"><ProgressDots total={STEPS_5.length} current={d.step + 1} /></div>}
      mainClassName="flex flex-col gap-4 page-enter"
      footer={
        d.step < 4 ? (
          d.step === 3 ? (
            <Button className="w-full h-[64px] text-[20px]" loading={submitting} disabled={!d.videoUrl || !d.consent} onClick={submit}>
              पूजा भेजें
            </Button>
          ) : (
            <Button
              className="w-full h-[64px] text-[20px]"
              disabled={(d.step === 0 && !d.name.trim()) || (d.step === 2 && !step2Done)}
              onClick={() => go(d.step + 1)}
            >
              {`आगे — ${STEPS_5[d.step + 1]}`}
            </Button>
          )
        ) : undefined
      }
    >
      {d.step === 0 && <StepName d={d} set={set} />}
      {d.step === 1 && <StepSamagri d={d} set={set} activeTier={activeTier} setActiveTier={setActiveTier} tiersData={tiersData} />}
      {d.step === 2 && <StepDetails d={d} set={set} />}
      {d.step === 3 && <StepVideo d={d} set={set} />}
      {d.step === 4 && <StepDone name={d.name} />}
    </Screen>
  );
}

// ── Step 0: नाम + विवरण (unchanged) ──────────────────────────────────────────
function StepName({ d, set }: { d: Draft; set: (p: Partial<Draft>) => void }) {
  return (
    <>
      <Narrate text="कौन सी पूजा जोड़ें? नाम बोलिए, फिर दो शब्दों में बताइए यह पूजा क्या है।" />
      <Card className="p-5 flex flex-col gap-2 bg-white">
        <VoiceField label="पूजा का नाम" promptText="पूजा का नाम बोलिए" mode="text" value={d.name} onChange={(v) => set({ name: v })} placeholder="जैसे सत्यनारायण कथा" />
      </Card>
      <Card className="p-4 flex flex-col gap-2 bg-saffron-50 border-2 border-saffron-200 rounded-[18px]">
        <VoiceField label="बोलकर बताइए यह पूजा क्या है" promptText="यह पूजा क्या है, दो शब्दों में बताइए" mode="text" value={d.desc} onChange={(v) => set({ desc: v })} placeholder="संक्षेप में बोलिए" />
      </Card>
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
      <Card className="p-4 bg-white">
        <SamagriTiers tiers={tiersData} active={activeTier} onSelect={setActiveTier} showPrices={false} />
      </Card>
      <Card className="p-4 flex flex-col gap-2 bg-white">
        <span className="text-[15px] font-hindi text-softgrey">{TIER_LABEL[activeTier]} में जोड़ें</span>
        <VoiceField label={`${TIER_LABEL[activeTier]} में सामान`} promptText="सामान का नाम बोलिए" mode="text" value={name} onChange={setName} placeholder="सामान का नाम" />
        <div className="flex gap-2">
          <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="मात्रा" className="flex-1 h-[54px] px-3 rounded-btn border-2 border-saffron-200 text-[16px] font-hindi bg-cream" />
          <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="कंपनी" className="flex-1 h-[54px] px-3 rounded-btn border-2 border-saffron-200 text-[16px] font-hindi bg-cream" />
        </div>
        <Button variant="secondary" className="h-[54px]" onClick={addItem} disabled={!name.trim()}>जोड़ें</Button>
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

  const opt = (mode: SupplyMode, icon: string, label: string, sub: string) => (
    <button onClick={() => set({ supplyMode: mode })}
      className={`w-full min-h-[64px] px-4 py-3 rounded-btn border-2 flex items-center gap-3 text-left active:scale-[0.98] transition-transform ${
        d.supplyMode === mode ? "bg-saffron-500 border-saffron-500 text-chandan" : "bg-white border-saffron-200 text-temple-700"}`}>
      <span className="text-[24px]">{icon}</span>
      <span className="flex flex-col"><span className="text-[17px] font-bold font-hindi">{label}</span><span className={`text-[13px] font-hindi ${d.supplyMode === mode ? "text-chandan/80" : "text-softgrey"}`}>{sub}</span></span>
    </button>
  );

  return (
    <>
      {/* ONE narration for the merged step — three separate ones back to
          back would talk over the pandit's first answer. */}
      <Narrate text="अब तीन छोटी बातें — सामान कौन लाएगा, कितने पंडित चाहिए, और कुल दक्षिणा कितनी।" />

      {/* आपूर्ति */}
      <div className="flex flex-col gap-2">
        <span className="text-[15px] font-extrabold text-softgrey font-hindi">सामान कौन लाएगा?</span>
        <div className="flex flex-col gap-3">
          {opt("PANDIT_BRINGS", "🛍️", "हाँ, मैं लाऊँगा", "तीनों स्तर के दाम आप तय करें")}
          {opt("PLATFORM_SELLS", "🚚", "प्लेटफ़ॉर्म बेचे और पहुँचाए", "हम सामान का इंतज़ाम करें")}
          {opt("LIST_ONLY", "📝", "सिर्फ़ सूची दूँ", "यजमान ख़ुद ले आएँ")}
        </div>
        {d.supplyMode === "PANDIT_BRINGS" && (
          <Card className="p-4 bg-saffron-50 border-2 border-saffron-200">
            <span className="text-[14px] font-hindi text-saffron-700 font-semibold">⚠ जो कंपनी बताई, वही सामान लाना होगा — यजमान का भरोसा इसी पर है।</span>
          </Card>
        )}
      </div>

      {/* टीम */}
      <div className="flex flex-col gap-2">
        <span className="text-[15px] font-extrabold text-softgrey font-hindi">कितने पंडित चाहिए?</span>
        <Card className="p-4 bg-white flex flex-col gap-3 items-center">
          <div className="flex gap-2 flex-wrap justify-center">
            {nums.map((n) => (
              <button key={n} onClick={() => set({ teamSize: n })}
                className={`w-[56px] h-[56px] rounded-btn border-2 text-[22px] font-bold active:scale-95 transition-transform ${
                  d.teamSize === n ? "bg-saffron-500 border-saffron-500 text-chandan" : "bg-white border-saffron-200 text-temple-700"}`}>{n}</button>
            ))}
          </div>
          <span className="text-[15px] font-hindi text-softgrey">{d.teamSize} पंडित (आप सहित)</span>
        </Card>
      </div>

      {/* दक्षिणा */}
      <div className="flex flex-col gap-2">
        <span className="text-[15px] font-extrabold text-softgrey font-hindi">कुल दक्षिणा</span>
        <Card className="p-5 bg-white flex flex-col gap-3">
          <span className="text-[16px] font-hindi text-temple-700 font-bold">{d.name || "पूजा"} ({d.teamSize} पंडितों सहित)</span>
          <VoiceField label="कुल दक्षिणा" promptText="इस पूजा की कुल दक्षिणा बोलिए" mode="money" value={d.dakshina != null ? String(d.dakshina) : ""} onChange={(v) => set({ dakshina: v ? parseInt(v.replace(/\D/g, "") || "0", 10) : null })} placeholder="₹ राशि" />
          <span className="text-[13px] font-hindi text-softgrey">इसमें बाकी पंडितों की दक्षिणा भी शामिल है।</span>
        </Card>
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
      <Card className="p-5 bg-white flex flex-col gap-3">
        <span className="text-[15px] font-hindi text-softgrey">यूट्यूब लिंक (टाइप करें — यह बोलकर नहीं भरा जाता)</span>
        <input value={d.videoUrl} onChange={(e) => set({ videoUrl: e.target.value })} inputMode="url" placeholder="https://youtu.be/…"
          className="h-[56px] px-4 rounded-btn border-2 border-saffron-200 text-[17px] font-hindi bg-cream" />
        {id && (
          <div className="rounded-card overflow-hidden border-2 border-saffron-100 aspect-video">
            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${id}`} title="preview" allowFullScreen />
          </div>
        )}
      </Card>
      <Card className="p-4 bg-white flex flex-col gap-2">
        <span className="text-[15px] font-extrabold text-softgrey font-hindi">अच्छे वीडियो के लिए</span>
        {CHECK.map((c) => (<span key={c} className="text-[15px] font-hindi text-temple-700">✅ {c}</span>))}
      </Card>
      <a href={`https://wa.me/918934095599?text=${encodeURIComponent("नमस्ते, मुझे अपनी पूजा का वीडियो भेजना है")}`} target="_blank" rel="noopener"
        className="w-full min-h-[56px] rounded-btn bg-[#E4F3E9] border-2 border-[#BFE3CC] flex items-center justify-center gap-2 text-[16px] font-hindi font-bold text-leaf-700 active:scale-[0.98] transition-transform">
        💬 भेज दीजिए, हम लगा देंगे
      </a>
      <button onClick={() => set({ consent: !d.consent })}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-btn border-2 border-saffron-200 bg-white active:scale-[0.99] transition-transform">
        <span className={`w-7 h-7 rounded-md border-2 flex items-center justify-center text-[18px] ${d.consent ? "bg-leaf-500 border-leaf-500 text-white" : "border-saffron-200"}`}>{d.consent ? "✓" : ""}</span>
        <span className="text-[15px] font-hindi text-temple-700 text-left">यह वीडियो मेरा है, सत्यापन के लिए सहमति देता हूँ</span>
      </button>
    </>
  );
}

// ── Step 4: प्रतीक्षा में (unchanged) ─────────────────────────────────────────
function StepDone({ name }: { name: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center gap-5 pt-16 text-center">
      <Narrate text="बहुत बढ़िया! आपकी पूजा जाँच के लिए भेज दी गई। स्वीकृत होते ही सूचना मिलेगी।" />
      <span className="text-[72px]">🙏</span>
      <span className="text-[24px] font-hindi font-bold text-temple-700">{name} भेज दी गई</span>
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFE9B8] text-[19px] font-hindi font-black text-brassdark">⏳ प्रतीक्षा में</span>
      <Button className="mt-4 h-[56px] px-8" onClick={() => router.push("/my-poojas")}>मेरी पूजाएँ देखें</Button>
    </div>
  );
}
