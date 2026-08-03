"use client";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────
// सामग्री — CHAPTER 2 (Isj's samagri-tiers order, 2026-08-03).
//
// The pooja is ALREADY LISTED when this page opens — samagri is detail
// work that layers on after, never a gate (the decoupling law, applied to
// its second chapter). Three screens, one question each, voice-first, and
// EVERY screen is skippable: "बाद में" always exits with the pooja intact.
//
//   0. सामग्री के तीन स्तर — items per tier (साधारण/मानक/विशेष, the
//      born-by-ruling vocabulary from packages/types).
//   1. "सामान कौन लाएगा?" — the ला-सकते-हैं question; three honest tiles.
//   2. तीन दाम — ONLY on हाँ (PANDIT_BRINGS): one price per non-empty
//      tier, monotonic साधारण ≤ मानक ≤ विशेष (cumulative items cannot
//      cost less — F12-01's law, priced).
//
// THE saved:0 CLOSURE lives here: this page is the writer d.prices never
// had. And the server's price-null DELETE branch — the accidental
// clear-on-resubmit bug — becomes the INTENTIONAL truthful-state writer:
// answering सिर्फ़-सूची or प्लेटफ़ॉर्म clears the tier rows, because a
// stored priced package under those answers would be a false claim on the
// customer's surface.
//
// THE DEFAULT NEVER OVERWRITES AN ANSWER: the supplyMode write happens
// ONLY here, by re-posting the pooja's own stored config (teamSize +
// dakshina fetched on mount) with the answered mode. Chapter-1 saves post
// no supplyMode at all.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Narrate } from "@/hooks/useScreenVoice";
import { useVoiceOptions } from "@/hooks/useVoiceScreen";
import { api } from "@/lib/api";
import { mutateOnce } from "@/lib/mutate";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VoiceField } from "@/components/voice/VoiceField";
import { SamagriTiers, SAMAGRI_BRAND_ANY, type SamagriTier, type SamagriItem, type TierData } from "@/components/SamagriTiers";
import { normalizeMoneyInput } from "@/lib/voiceParse";
import { isPujaType, pujaLabel, SAMAGRI_TIER_LABELS_HI, SAMAGRI_TIERS } from "@hmarepanditji/types";

type SupplyMode = "PANDIT_BRINGS" | "PLATFORM_SELLS" | "LIST_ONLY";
const ORDER = SAMAGRI_TIERS as readonly SamagriTier[];

const SCREEN_TITLES = ["सामग्री के तीन स्तर", "क्या आप सामान लाएँगे?", "तीन दाम", "सामग्री की स्थिति"] as const;

interface SamagriDraft {
  step: number;
  items: Record<SamagriTier, SamagriItem[]>;
  prices: Record<SamagriTier, string>;
  supplyMode: SupplyMode | null;
}

const EMPTY: SamagriDraft = {
  step: 0,
  items: { BASIC: [], STANDARD: [], PREMIUM: [] },
  prices: { BASIC: "", STANDARD: "", PREMIUM: "" },
  supplyMode: null,
};

export default function SamagriChapterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const rawPooja = params?.get("pooja") ?? "";
  // canonical only — a REQUEST is not listed, so it has nothing to detail
  const pooja = isPujaType(rawPooja) ? rawPooja : null;
  const poojaName = pooja ? pujaLabel(pooja, "hi") : "";

  const [d, setD] = useState<SamagriDraft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  // the pooja's own stored config (teamSize + dakshina) — needed to re-post
  // supplyMode without inventing either number
  const [config, setConfig] = useState<{ teamSize: number; dakshinaAmount: number } | null>(null);
  const [result, setResult] = useState<{ saved: number; cleared: number; mode: SupplyMode; modeRecorded: boolean } | null>(null);
  const [activeTier, setActiveTier] = useState<SamagriTier>("BASIC");
  const set = (patch: Partial<SamagriDraft>) => setD((prev) => ({ ...prev, ...patch }));

  const draftKey = pooja ? `samagri-draft:${pooja}` : null;

  useEffect(() => {
    if (!pooja) {
      router.replace("/my-poojas");
      return;
    }
    try {
      const raw = draftKey ? localStorage.getItem(draftKey) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.v === 1) setD({ ...EMPTY, ...parsed, step: Math.max(0, Math.min(2, Number(parsed?.step) || 0)) });
      }
    } catch { /* ignore */ }
    (async () => {
      try {
        const res = await api("/pandit/pooja-configs");
        if (res.success && Array.isArray(res.data)) {
          const row = (res.data as Array<{ poojaType: string; teamSize?: number; dakshinaAmount?: number }>).find((r) => r.poojaType === pooja);
          if (row && typeof row.dakshinaAmount === "number" && row.dakshinaAmount > 0) {
            setConfig({ teamSize: row.teamSize ?? 1, dakshinaAmount: row.dakshinaAmount });
          }
        }
      } catch { /* honest absence — the supplyMode write will be skipped and SAID */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pooja]);

  useEffect(() => {
    if (!draftKey || result) return;
    try { localStorage.setItem(draftKey, JSON.stringify({ ...d, v: 1 })); } catch { /* ignore */ }
  }, [d, draftKey, result]);

  const tiersData: TierData[] = ORDER.map((tier) => ({
    tier,
    label: SAMAGRI_TIER_LABELS_HI[tier],
    price: d.supplyMode === "PANDIT_BRINGS" && d.prices[tier] ? parseInt(d.prices[tier], 10) || null : null,
    items: d.items[tier],
  }));

  const anyItems = useMemo(() => ORDER.some((t) => d.items[t].length > 0), [d.items]);
  const nonEmptyTiers = ORDER.filter((t) => d.items[t].length > 0);

  // monotonic साधारण ≤ मानक ≤ विशेष over the PRICED tiers, plus every
  // non-empty tier must carry a price — half-priced packages are half-claims
  const priceCheck = (): { ok: true } | { ok: false; msg: string } => {
    let prev: { tier: SamagriTier; val: number } | null = null;
    for (const t of nonEmptyTiers) {
      const val = parseInt(d.prices[t] || "", 10);
      if (!Number.isFinite(val) || val <= 0) {
        return { ok: false, msg: `${SAMAGRI_TIER_LABELS_HI[t]} का दाम बताइए — बिना दाम के स्तर सहेजा नहीं जाता।` };
      }
      if (prev && val < prev.val) {
        return {
          ok: false,
          msg: `${SAMAGRI_TIER_LABELS_HI[t]} का दाम ${SAMAGRI_TIER_LABELS_HI[prev.tier]} से कम नहीं हो सकता — ${SAMAGRI_TIER_LABELS_HI[t]} में ${SAMAGRI_TIER_LABELS_HI[prev.tier]} का सब कुछ है।`,
        };
      }
      prev = { tier: t, val };
    }
    return { ok: true };
  };

  const submit = async (mode: SupplyMode) => {
    if (!pooja) return;
    setBusy(true);
    setErrorMsg("");
    // PANDIT_BRINGS → priced tiers upsert; everything else → every tier
    // price:null, the INTENTIONAL truthful-state DELETE (ruled 2026-08-03)
    const tiers = ORDER.map((t) => ({
      tier: t,
      price: mode === "PANDIT_BRINGS" && d.items[t].length > 0 ? parseInt(d.prices[t] || "", 10) || null : null,
      items: d.items[t],
    }));
    const sam = await mutateOnce(`samagri2:${pooja}:${mode}`, "/pandit/samagri-packages", {
      method: "POST",
      body: JSON.stringify({ pujaType: pooja, tiers }),
    });
    if (!sam.success) {
      setBusy(false);
      setErrorMsg(sam.error?.message || "सामग्री सहेजी नहीं जा सकी — कृपया दोबारा कोशिश कीजिए।");
      return;
    }
    const saved = (sam.data as { saved?: number } | undefined)?.saved ?? 0;
    const cleared = (sam.data as { cleared?: number } | undefined)?.cleared ?? 0;
    // the supplyMode answer — re-post the pooja's OWN numbers, never invented
    let modeRecorded = false;
    if (config) {
      const cfg = await mutateOnce(`samagri2-config:${pooja}:${mode}`, "/pandit/pooja-config", {
        method: "POST",
        body: JSON.stringify({ poojaType: pooja, teamSize: config.teamSize, dakshinaAmount: config.dakshinaAmount, supplyMode: mode }),
      });
      modeRecorded = !!cfg.success;
    }
    setBusy(false);
    try { if (draftKey) localStorage.removeItem(draftKey); } catch { /* ignore */ }
    setResult({ saved, cleared, mode, modeRecorded });
    set({ step: 3 });
  };

  if (!pooja) return null;

  const skip = (
    <button
      type="button"
      onClick={() => router.push("/my-poojas")}
      className="min-h-[52px] w-full rounded-tile border-2 border-sand bg-card text-[17px] font-hindi font-bold text-softgrey"
    >
      बाद में — पूजा दिखती रहेगी
    </button>
  );

  const onNext = async () => {
    if (d.step === 0) {
      set({ step: 1 });
      return;
    }
    if (d.step === 1) {
      if (!d.supplyMode) return;
      if (d.supplyMode === "PANDIT_BRINGS") {
        if (!anyItems) {
          setErrorMsg("पहले सामग्री जोड़िए — पीछे जाकर हर स्तर में सामान डालिए।");
          return;
        }
        setErrorMsg("");
        set({ step: 2 });
        return;
      }
      // सिर्फ़-सूची / प्लेटफ़ॉर्म — no prices to ask; the answer submits now
      await submit(d.supplyMode);
      return;
    }
    if (d.step === 2) {
      const check = priceCheck();
      if (!check.ok) {
        setErrorMsg(check.msg);
        return;
      }
      setErrorMsg("");
      await submit("PANDIT_BRINGS");
    }
  };

  return (
    <Screen
      title={`${poojaName} — ${SCREEN_TITLES[d.step]}`}
      headerVariant={d.step === 3 ? "title" : "row"}
      showBack={d.step !== 3}
      onBack={() => (d.step === 0 ? router.push("/my-poojas") : set({ step: d.step - 1 }))}
      mainClassName="flex flex-col gap-4 px-[18px] pt-2 pb-4 page-enter"
      footer={
        d.step < 3 ? (
          <div className="flex flex-col gap-2 w-full">
            <Button
              className="w-full"
              loading={busy}
              disabled={(d.step === 1 && !d.supplyMode) || busy}
              onClick={() => void onNext()}
            >
              {d.step === 2 || (d.step === 1 && d.supplyMode && d.supplyMode !== "PANDIT_BRINGS") ? "सहेजिए" : "आगे"}
            </Button>
            {skip}
          </div>
        ) : undefined
      }
    >
      {errorMsg && (
        <div role="alert" className="px-4 py-3 bg-[#FBE7E3] rounded-tile border-2 border-[#E7B8AF]">
          <p className="text-danger text-[18px] font-bold text-center leading-[1.4] font-hindi">{errorMsg}</p>
        </div>
      )}

      {d.step === 0 && <ScreenItems d={d} set={set} activeTier={activeTier} setActiveTier={setActiveTier} tiersData={tiersData} />}
      {d.step === 1 && <ScreenWhoBrings d={d} set={set} />}
      {d.step === 2 && <ScreenPrices d={d} set={set} nonEmptyTiers={nonEmptyTiers} />}
      {d.step === 3 && result && <ScreenDone poojaName={poojaName} result={result} onExit={() => router.push("/my-poojas")} />}
    </Screen>
  );
}

// ── Screen 0: items per tier (the old wizard step, re-homed) ─────────────────
function ScreenItems({ d, set, activeTier, setActiveTier, tiersData }: {
  d: SamagriDraft; set: (p: Partial<SamagriDraft>) => void;
  activeTier: SamagriTier; setActiveTier: (t: SamagriTier) => void; tiersData: TierData[];
}) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [brand, setBrand] = useState("");
  const addItem = () => {
    if (!name.trim()) return;
    // F12-02: an unanswered company is "कोई भी" — say it, do not omit it
    set({ items: { ...d.items, [activeTier]: [...d.items[activeTier], { name: name.trim(), qty: qty.trim() || "1", brand: brand.trim() || SAMAGRI_BRAND_ANY }] } });
    setName(""); setQty(""); setBrand("");
  };
  return (
    <>
      <Narrate text="हर स्तर में सामान जोड़िए। मानक में साधारण का सब कुछ है, और थोड़ा और।" />
      <span className="text-[18px] font-bold font-hindi text-softgrey">ऊपर का स्तर नीचे वाला सब अपने आप जोड़ लेता है 👇</span>
      <SamagriTiers tiers={tiersData} active={activeTier} onSelect={setActiveTier} showPrices={false} />
      <Card className="flex flex-col gap-2 bg-card">
        <span className="text-[18px] font-hindi text-softgrey font-bold">{SAMAGRI_TIER_LABELS_HI[activeTier]} में जोड़िए</span>
        <VoiceField label={`${SAMAGRI_TIER_LABELS_HI[activeTier]} में सामान`} promptText="सामान का नाम बोलिए" mode="text" value={name} onChange={setName} placeholder="सामान का नाम" />
        {/* min-w-0 is LOAD-BEARING on BOTH inputs — §3-V PAGE 14's clip */}
        <div className="flex gap-2">
          <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="मात्रा" className="flex-1 min-w-0 h-[56px] px-3.5 rounded-field border-2 border-saffron-200 text-[18px] font-hindi bg-card" />
          <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder={`कंपनी (${SAMAGRI_BRAND_ANY})`} className="flex-1 min-w-0 h-[56px] px-3.5 rounded-field border-2 border-saffron-200 text-[18px] font-hindi bg-card" />
        </div>
        <Button variant="secondary" className="h-[56px] min-h-[56px] text-[19px] rounded-[14px]" onClick={addItem} disabled={!name.trim()}>जोड़िए</Button>
      </Card>
    </>
  );
}

// ── Screen 1: the ला-सकते-हैं question (the old आपूर्ति tiles, re-homed) ─────
function ScreenWhoBrings({ d, set }: { d: SamagriDraft; set: (p: Partial<SamagriDraft>) => void }) {
  // ── ASK ONLY WHAT IS HIS TO ANSWER (Isj's screenshot ruling, 2026-08-03).
  // This screen was a THREE-way choice; the PLATFORM_SELLS tile died from it
  // because whether the PLATFORM sells samagri is a business decision (W2,
  // parked) wearing a pandit question — the 62-year-old cannot own that
  // answer. The question is now HIS alone: क्या आप सामान लाएँगे? हाँ →
  // prices; नहीं → सिर्फ़ सूची (LIST_ONLY).
  //
  // THE ENUM SURVIVES UNCHANGED: SamagriSupplyMode keeps PLATFORM_SELLS as
  // W2's future value. This screen writes ONLY PANDIT_BRINGS / LIST_ONLY —
  // do NOT "restore" a third tile here; the enum value is not a UI orphan,
  // it is a parked business future.
  //
  // voice group mounts WITH this screen and disposes with it — the proven
  // pattern from the add wizard.
  useVoiceOptions([
    { label: "हाँ, मैं लाऊँगा", onSelect: () => set({ supplyMode: "PANDIT_BRINGS" }) },
    { label: "सिर्फ़ सूची", onSelect: () => set({ supplyMode: "LIST_ONLY" }) },
  ]);
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
      <Narrate text="क्या आप सामान लाएँगे? हाँ कहेंगे तो अगली स्क्रीन पर तीनों स्तर के दाम पूछेंगे।" />
      <div className="flex flex-col gap-2.5">
        {/* REGISTER: the sub-lines are STATEMENTS, not commands aimed at
            the pandit. */}
        {opt("PANDIT_BRINGS", "🛍️", "हाँ, मैं लाऊँगा", "तीनों स्तर के दाम आप तय कीजिए")}
        {opt("LIST_ONLY", "📝", "नहीं — सिर्फ़ सूची दूँगा", "यजमान इंतज़ाम करेंगे")}
      </div>
      {d.supplyMode === "PANDIT_BRINGS" && (
        <div className="p-4 rounded-tile border-2 border-saffron-200 bg-[linear-gradient(135deg,#FDEEE7,#FFF3E2)]">
          <span className="text-[18px] font-hindi text-saffron-700 font-semibold leading-[1.4]">⚠ जो कंपनी बताई, वही सामान लाना होगा — यजमान का भरोसा इसी पर है।</span>
        </div>
      )}
      {d.supplyMode === "LIST_ONLY" && (
        <div className="p-4 rounded-tile border-2 border-sand bg-card">
          {/* TRUTHFUL-STATE: under this answer no priced package may stand —
              सहेजिए CLEARS any stored tiers (the intentional DELETE, ruled). */}
          <span className="text-[18px] font-hindi text-softgrey font-semibold leading-[1.4]">
            इस जवाब में दाम वाले पैकेज नहीं रहते — सहेजने पर पुराने पैकेज हट जाएँगे।
          </span>
        </div>
      )}
    </>
  );
}

// ── Screen 2: three prices — the writer d.prices never had ───────────────────
function ScreenPrices({ d, set, nonEmptyTiers }: {
  d: SamagriDraft; set: (p: Partial<SamagriDraft>) => void; nonEmptyTiers: readonly SamagriTier[];
}) {
  return (
    <>
      <Narrate text="हर स्तर का दाम बोलिए। मानक का दाम साधारण से कम नहीं हो सकता।" />
      {ORDER.map((t) =>
        nonEmptyTiers.includes(t) ? (
          <Card key={t} className="bg-card flex flex-col gap-2">
            <span className="text-[18px] font-hindi text-temple-700 font-bold">
              {SAMAGRI_TIER_LABELS_HI[t]} — {d.items[t].length} सामान
            </span>
            <VoiceField
              label={`${SAMAGRI_TIER_LABELS_HI[t]} का दाम`}
              promptText={`${SAMAGRI_TIER_LABELS_HI[t]} स्तर का दाम बोलिए`}
              mode="money"
              value={d.prices[t]}
              onChange={(v) => set({ prices: { ...d.prices, [t]: normalizeMoneyInput(v) } })}
              placeholder="₹ राशि"
            />
          </Card>
        ) : (
          <div key={t} className="px-4 py-3 rounded-tile border-[1.5px] border-sand-200 bg-[#F4EFE6]">
            <span className="text-[16px] font-hindi font-semibold text-softgrey">{SAMAGRI_TIER_LABELS_HI[t]} — इस स्तर में सामान नहीं, यह सहेजा नहीं जाएगा।</span>
          </div>
        ),
      )}
    </>
  );
}

// ── Screen 3: what actually happened, per tier — never a blanket ✓ ───────────
function ScreenDone({ poojaName, result, onExit }: {
  poojaName: string; result: { saved: number; cleared: number; mode: SupplyMode; modeRecorded: boolean }; onExit: () => void;
}) {
  // two lines only — PLATFORM_SELLS is unreachable from this screen (the
  // ask-only-what-is-his-to-answer ruling; the enum value is W2's future)
  const modeLine =
    result.mode === "PANDIT_BRINGS"
      ? `${result.saved} स्तर सहेजे गए${result.cleared ? `, ${result.cleared} खाली स्तर हटे` : ""}।`
      : "दर्ज हुआ: यजमान सामान लाएँगे। दाम वाले पैकेज हटा दिए गए।";
  return (
    <div className="flex flex-col gap-[14px] pt-4">
      <Narrate text={`सामग्री की बात पूरी हुई। ${modeLine}`} />
      <span className="text-[24px] font-hindi font-bold text-temple-700 text-center">{poojaName} — सामग्री</span>
      <div className="rounded-tile border-2 border-leaf-500 bg-card p-4 text-center">
        <p className="text-[20px] font-hindi font-black text-leaf-600">✓ {modeLine}</p>
        {!result.modeRecorded && (
          // honest absence: the packages landed but the WHO-BRINGS answer
          // could not be recorded (no config row) — say it, do not imply it
          <p className="mt-2 text-[15px] font-hindi font-bold text-terracotta" role="alert">
            “कौन लाएगा” का जवाब दर्ज नहीं हो पाया — पूजा की दक्षिणा तय होने के बाद फिर से आइए।
          </p>
        )}
      </div>
      <Button className="mt-2 w-full" onClick={onExit}>मेरी पूजाएँ देखिए</Button>
    </div>
  );
}
