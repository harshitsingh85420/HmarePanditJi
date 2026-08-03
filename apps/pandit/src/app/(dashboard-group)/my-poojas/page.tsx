"use client";

// मेरी पूजाएँ (F29) — manage specializations + dakshina.
// Price edits affect NEW bookings only (server snapshots dakshinaAmount);
// removal is blocked with a 409 while active bookings exist; newly added
// poojas carry सत्यापन-बाकी until video-verify (P12) clears them.

import { Narrate } from "@/hooks/useScreenVoice";
import { DashboardVoiceNav } from "@/components/voice/DashboardVoiceNav";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { hi } from "@/lib/strings";
import { t } from "@/lib/i18n";
import { pujaLabel, isPujaType } from "@hmarepanditji/types";
import { mutateOnce } from "@/lib/mutate";
import { api } from "@/lib/api";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DiyaLoader } from "@/components/moments/DiyaLoader";
import { VoiceActionListener } from "@/components/voice/VoiceActionListener";
import { VoiceField } from "@/components/voice/VoiceField";
import { FirstUseTip } from "@/components/moments/FirstUseTip";
import { Toast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { CelebrationOverlay } from "@/components/moments/CelebrationOverlay";
import { voiceController } from "@/lib/voiceController";

const ALL_POOJAS = Object.values(hi.onboarding.specializations);

// Mockup frame 21: every card opens with an emoji tile. Name-keyed DECORATION
// only (custom pujas fall back to 🪔) — never data, never state.
const POOJA_EMOJI: Array<[RegExp, string]> = [
  [/सत्यनारायण|कथा/, "🕉️"],
  [/गृह प्रवेश|वास्तु/, "🏠"],
  [/विवाह/, "💍"],
  [/मुंडन|नामकरण/, "👶"],
  [/हवन|यज्ञ/, "🔥"],
  [/रुद्राभिषेक|शिव/, "🔱"],
  [/श्राद्ध|पिंडदान/, "🪷"],
  [/नवग्रह|शांति/, "✨"],
];
const poojaEmoji = (name: string) => POOJA_EMOJI.find(([re]) => re.test(name))?.[1] ?? "🪔";

// The shared string already opens with a literal "+ ", and canon draws the plus
// as a 24px ⊕ glyph — rendering both gave "⊕ + नई पूजा जोड़ें". Strip the typed
// plus here; the real fix belongs in lib/strings.ts, which this screen does not
// own. Called at RENDER time, not module scope, so it follows the language store.
const addLabel = () => t("myPoojas.addBtn").replace(/^\+\s*/, "");

interface RateMap {
  [pooja: string]: number;
}

export default function MyPoojasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [poojas, setPoojas] = useState<string[]>([]);
  const [pending, setPending] = useState<string[]>([]);
  const [verifications, setVerifications] = useState<Record<string, { status: string; rejectionReason: string | null }>>({});
  const [rates, setRates] = useState<RateMap>({});
  // pujaType → isActive, from the pandit's own (unfiltered) service rows.
  // undefined = no service row at all (request-path / legacy pooja).
  const [services, setServices] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  // FAT-FINGER LAW (पP1): the ✖ arms THIS, never the delete directly
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  // Canon frame 26 उत्सव — a newly APPROVED puja
  const [celebrateVerified, setCelebrateVerified] = useState(false);
  const addBtnRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    const res = await api("/auth/me");
    if (!res.success) {
      router.push("/login");
      return;
    }
    const prof = res.data.user?.panditProfile;
    setPoojas(prof?.specializations || []);
    setPending(prof?.pendingPoojaVerifications || []);
    const map: RateMap = {};
    (prof?.dakshinaRates || []).forEach((r: { pujaType: string; amount: number }) => {
      map[r.pujaType] = r.amount;
    });
    // ₹0-CROSSED-THE-COUNTER FIX: /auth/me now returns the pandit's OWN
    // services unfiltered (isActive gates customers, never the owner), so a
    // wizard-priced pooja carries its real figure here — गृह प्रवेश read ₹0
    // seconds after he set ₹1,101 because the row was hidden from its own
    // author. isActive rides along as the VISIBILITY state for the chip below.
    const smap: Record<string, boolean> = {};
    (prof?.pujaServices || []).forEach((svc: { pujaType: string; dakshinaAmount: number; isActive?: boolean }) => {
      if (map[svc.pujaType] === undefined) map[svc.pujaType] = svc.dakshinaAmount;
      smap[svc.pujaType] = !!svc.isActive;
    });
    setRates(map);
    setServices(smap);

    // 3-state verification from the per-puja rows (replaces the legacy 2-state
    // pendingPoojaVerifications array): APPROVED ✓ / REJECTED ✗ +reason / PENDING ⏳.
    const vres = await api("/pandit/pooja-verifications");
    if (vres.success && vres.data?.latest) {
      const vmap: Record<string, { status: string; rejectionReason: string | null }> = {};
      for (const r of vres.data.latest as Array<{ poojaType: string; status: string; rejectionReason: string | null }>) {
        vmap[r.poojaType] = { status: r.status, rejectionReason: r.rejectionReason ?? null };
      }
      setVerifications(vmap);

      // Canon frame 26 उत्सव "आप प्रमाणित हैं!". Approval happens on the
      // ADMIN's clock, so there is no in-app action to hang it on — the
      // trigger is the same freshly-seen pattern the payout moment uses:
      // a puja APPROVED that this device has not celebrated yet.
      const approved = Object.entries(vmap)
        .filter(([, v]) => v.status === "APPROVED")
        .map(([poojaType]) => poojaType);
      if (approved.length > 0) {
        let seen: string[] = [];
        try {
          seen = JSON.parse(localStorage.getItem("hpj_seen_approved_poojas") || "[]");
        } catch { /* noop */ }
        const fresh = approved.filter((p) => !seen.includes(p));
        // Never celebrate on a device's FIRST run — existing approvals are
        // history, not news. Only a NEW approval earns the moment.
        if (fresh.length > 0 && seen.length > 0) setCelebrateVerified(true);
        try {
          localStorage.setItem("hpj_seen_approved_poojas", JSON.stringify(approved));
        } catch { /* noop */ }
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveRate = async (pooja: string, amount: number) => {
    const res = await mutateOnce(`dakshina:${pooja}`, "/pandit/dakshina-rates", {
      method: "POST",
      body: JSON.stringify({ pujaType: pooja, amount }),
    });
    if (res.success) {
      setRates((r) => ({ ...r, [pooja]: amount }));
      setEditing(null);
      setEditValue("");
    } else {
      // F11-04 CLASS (PAGE 13 walk): the server's dakshina-floor message
      // names the exact minimum — swallowing it into the generic line
      // left the pandit guessing. TRUTHFUL-STATE: surface it, and per
      // Q6 the shown error IS the spoken error (queued, never kills).
      const msg =
        res.error?.code === "dakshina_below_floor" && res.error?.message
          ? res.error.message
          : t("common.error");
      setToastMsg(msg);
      void voiceController.speakAndWait(msg, { interrupt: false });
    }
  };

  const removePooja = async (pooja: string) => {
    const res = await mutateOnce(`remove-pooja:${pooja}`, `/pandit/specializations/${encodeURIComponent(pooja)}`, {
      method: "DELETE",
    });
    if (res.success) {
      setPoojas((p) => p.filter((x) => x !== pooja));
      setPending((p) => p.filter((x) => x !== pooja));
      setToastMsg(t("myPoojas.removed"));
    } else if (
      (typeof res.error === "string" && res.error === "active_bookings") ||
      res.error?.code === "active_bookings" ||
      res.error?.message === "active_bookings"
    ) {
      setToastMsg(t("myPoojas.removeBlocked"));
    } else {
      setToastMsg(t("common.error"));
    }
  };

  if (loading) return <DiyaLoader />;

  // Canon frame 26 उत्सव — "आप प्रमाणित हैं!"
  if (celebrateVerified) {
    return (
      <CelebrationOverlay
        badge="✓"
        title="आप प्रमाणित हैं!"
        subtitle="अब यजमान आपको ढूँढ सकते हैं 🙏"
        tone="saffron"
        onDone={() => setCelebrateVerified(false)}
      />
    );
  }

  return (
    <Screen
      title={`🛕 ${t("myPoojas.title")}`}
      showBack
      onBack={() => router.push("/settings")}
      footer={
        /* ONE-CONTROL LAW (PAGE 13 finding, fixed 2026-07-25): on the EMPTY
           screen the EmptyState carries the ONE primary add CTA (canon frame
           27c draws exactly one) — the footer's dashed slot renders only for
           a populated list (canon frame 29). Two adds = two meanings for the
           same act, the सुला-दें class. */
        poojas.length > 0 ? (
          <div ref={addBtnRef}>
            <FirstUseTip tipId="myPoojasAdd" targetRef={addBtnRef} />
            {/* Canon frame 29 CTA, verbatim: width:100%; min-height:60px;
                border:2px DASHED #F4B096; border-radius:18px; background:#FDEEE7;
                color:#B23A1A; font-size:19px; font-weight:800; gap:9px, opened by
                a 24px add_circle. The dash is the whole point — it reads as an
                empty slot waiting to be filled, not as a second primary CTA. */}
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              className="h-[60px] min-h-[60px] text-[19px] border-dashed border-saffron-200 text-saffron-500 font-extrabold [&>span]:gap-[9px]"
              onClick={() => router.push("/my-poojas/add")}
            >
              <span className="text-[24px] leading-none" aria-hidden>⊕</span>
              {addLabel()}
            </Button>
          </div>
        ) : undefined
      }
    >
      <Narrate text={t("myPoojas.intro")} />
      <DashboardVoiceNav helpLine={t("help.myPoojas")} />
      <VoiceActionListener
        commands={[{ keywords: ["नई पूजा", "nayi pooja", "जोड़"], action: () => router.push("/my-poojas/add") }]}
        promptText={t("help.myPoojas")}
      />

      <div className="flex flex-col gap-3">
        {poojas.length === 0 && (
          /* canon frame 27c: the empty state carries its own primary CTA */
          <EmptyState
            emoji="🛕"
            title={t("empty.noPoojasTitle")}
            hint={t("empty.noPoojasHint")}
            action={{ label: t("empty.noPoojasCta"), onClick: () => router.push("/my-poojas/add") }}
          />
        )}

        {poojas.map((pooja) => {
          const v = verifications[pooja];
          // fall back to the legacy pending array until a verification row exists
          const status = v?.status ?? (pending.includes(pooja) ? "PENDING" : "APPROVED");
          // Canon frame 29: the card BORDER carries the state tint and the
          // status is a plain colored text line under the name (no pill).
          //   ✓ #BFE3CC border / #155C34 text · ⏳ #EBCF86 / #B8860B
          //   ✗ #E7B8AF / #C2321E
          const borderCls =
            status === "REJECTED" ? "border-[#E7B8AF]"
              : status === "PENDING" ? "border-[#EBCF86]"
                : "border-leafpale";
          const statusCls =
            status === "REJECTED" ? "text-danger"
              : status === "PENDING" ? "text-brassdark"
                : "text-leaf-700";
          // Canon's three labels verbatim. `myPoojas.verified` ALREADY carries
          // its ✓, so prefixing another one rendered "✓ ✓ प्रमाणित".
          const statusLabel =
            status === "REJECTED" ? `✗ ${t("myPoojas.rejected")} · ${t("myPoojas.resubmit")}`
              : status === "PENDING" ? `⏳ ${t("myPoojas.pendingVerify")}`
                : t("myPoojas.verified");
          // Canon prices the verified row in money-green and greys an
          // unverifiable one to #8A6F5C — the dakshina is real either way, but
          // only a प्रमाणित puja can actually earn it.
          const priceCls = status === "APPROVED" ? "text-leaf-700" : "text-softgrey";

          return (
          // Canon card, verbatim: background:#FFFDF8 (FLAT — this row is the one
          // surface canon does not gradient), border:1.5px solid <tint>,
          // border-radius:18px, padding:15px, no shadow. bg-none kills the
          // shared Card's 140deg gradient, which is a background-IMAGE and so
          // would otherwise survive bg-card.
          <Card key={pooja} className={`p-[15px] bg-card bg-none shadow-none rounded-tile border-[1.5px] ${borderCls} flex flex-col gap-2`}>
            <div className="flex items-center gap-[13px]">
              {/* canon draws the emoji bare at 30px — no tile, no fill behind it */}
              <span className="text-[30px] leading-none shrink-0 select-none">
                {poojaEmoji(pooja)}
              </span>
              <div className="flex-1 min-w-0 flex flex-col">
                {/* TRACK 2A: the card printed the RAW STORED VALUE — a pandit
                    saw "SATYANARAYAN" where his own language says सत्यनारायण
                    कथा. pujaLabel() returns the Devanagari label for a
                    canonical value and the raw string for anything else, so a
                    custom REQUEST still shows the words he actually spoke. */}
                <span className="text-[18px] font-black text-temple-700 font-hindi line-clamp-2 leading-snug">{pujaLabel(pooja, "hi")}</span>
                <span className={`text-[18px] font-extrabold font-hindi mt-[2px] leading-snug ${statusCls}`}>{statusLabel}</span>
                {/* THE VISIBILITY CHIP (ruled) — from isActive, the flag the
                    customer reads. The line above is the VERIFICATION story;
                    this one is whether yajmans can see the pooja RIGHT NOW.
                    They diverge exactly where it matters: a legacy row can
                    read प्रमाणित while its service row is still unpublished. */}
                {services[pooja] !== undefined && (
                  <span className={`text-[18px] font-bold font-hindi mt-[2px] leading-snug ${services[pooja] ? "text-leaf-700" : "text-brassdark"}`}>
                    {services[pooja] ? "यजमानों को दिख रही है" : "प्रतीक्षा में — अभी यजमानों को नहीं दिखती"}
                  </span>
                )}
                {/* CHAPTER 2's PER-POOJA DOOR (S4, ruled 2026-08-03) — the
                    samagri chapter (tiers → कौन लाएगा → dाम) is reachable from
                    every listed pooja, not only the add-flow's done card.
                    ENTRY AFFORDANCE ONLY, deliberately state-free: a "३ दाम ✓ /
                    बाकी" label needs a per-pooja read this page doesn't have —
                    claiming state without reading it would fabricate it. */}
                {isPujaType(pooja) && (
                  <button
                    type="button"
                    onClick={() => router.push(`/my-poojas/samagri?pooja=${encodeURIComponent(pooja)}`)}
                    className="mt-1 self-start min-h-[44px] px-3 rounded-full border-[1.5px] border-dashed border-saffron-400 text-[16px] font-hindi font-bold text-saffron-700 active:scale-[0.97] transition-transform"
                  >
                    🛍️ सामग्री →
                  </button>
                )}
              </div>

              {editing !== pooja && (
                <button
                  onClick={() => {
                    setEditing(pooja);
                    setEditValue(String(rates[pooja] ?? ""));
                  }}
                  aria-label={`${pooja} की दक्षिणा बदलिए`}
                  className={`t-money text-[19px] font-black shrink-0 min-h-[52px] px-1 flex items-center active:scale-[0.97] transition-transform ${priceCls}`}
                >
                  {/* ₹0 KILLED HERE TOO (ruled): a price is either his number
                      or honestly absent — never 0. The zero this rendered was
                      the customer-side defect crossing the counter: his own
                      ₹1,101 hidden behind the isActive filter read as ₹0. */}
                  {rates[pooja] !== undefined
                    ? `₹${rates[pooja].toLocaleString("en-IN")}`
                    : "दक्षिणा तय नहीं"}
                </button>
              )}

              {/* Canon has no remove control on this row, so it must not compete
                  with the price for width: the glyph occupies 24px of layout
                  while the ::after pad carries the full 52px tap target. */}
              <button
                onClick={() => {
                  // FAT-FINGER LAW (पP1): arm the ask — the delete fires
                  // ONLY from the confirm button below. The ask is shown
                  // AND spoken (queued, awaited — narration law).
                  setConfirmRemove(pooja);
                  void voiceController.speakAndWait(
                    t("myPoojas.removeAsk").replace("{name}", pooja),
                    { interrupt: false },
                  );
                }}
                aria-label={`${pooja} हटाइए`}
                className="relative w-6 h-6 shrink-0 rounded-full text-softgrey text-[18px] font-bold flex items-center justify-center active:scale-95 transition-transform after:absolute after:content-[''] after:-inset-[14px]"
              >
                ✖
              </button>
            </div>

            {confirmRemove === pooja && (
              <div className="flex flex-col gap-2">
                <p className="text-[18px] font-bold text-temple-700 font-hindi leading-snug">
                  {t("myPoojas.removeAsk").replace("{name}", pooja)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="md"
                    className="flex-1 min-h-[52px] text-danger border-[#E7B8AF]"
                    onClick={() => {
                      setConfirmRemove(null);
                      void removePooja(pooja);
                    }}
                  >
                    {t("myPoojas.removeYes")}
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    className="flex-1 min-h-[52px]"
                    onClick={() => setConfirmRemove(null)}
                  >
                    {t("myPoojas.removeNo")}
                  </Button>
                </div>
              </div>
            )}

            {editing === pooja && (
              <div>
                <VoiceField
                  label=""
                  promptText={t("myPoojas.editPrompt")}
                  value={editValue}
                  onChange={setEditValue}
                  mode="money"
                  onComplete={() => {
                    const n = parseInt(editValue, 10);
                    if (Number.isFinite(n) && n > 0) void saveRate(pooja, n);
                  }}
                  placeholder="₹"
                />
                <Button
                  variant="success"
                  size="md"
                  fullWidth
                  className="mt-2"
                  onClick={() => {
                    const n = parseInt(editValue, 10);
                    if (Number.isFinite(n) && n > 0) void saveRate(pooja, n);
                  }}
                >
                  {t("myPoojas.saveBtn")}
                </Button>
              </div>
            )}

            {v?.status === "REJECTED" && v?.rejectionReason && (
              <p className="text-[18px] text-danger font-hindi leading-snug">
                {t("myPoojas.rejectedReasonPrefix")} {v.rejectionReason}
              </p>
            )}

            {/* Canon frame 29: a REJECTED puja carries its way back. This is
                pilot-critical — without it a rejected pandit is stuck. Routes
                to the existing add flow, where a new video creates version+1
                (the API allows a new version only after a rejection).
                Canon draws this as a bare 22px refresh glyph in the price slot;
                a 22px target is unhittable for the persona, so the affordance
                stays a full 56px row and canon's colour (#C2321E) carries it. */}
            {status === "REJECTED" && (
              <button
                onClick={() => router.push("/my-poojas/add")}
                className="self-start min-h-[56px] px-4 -ml-1 text-[18px] font-extrabold text-danger font-hindi active:scale-[0.97] transition-transform"
              >
                🔄 {t("myPoojas.resubmit")} ›
              </button>
            )}
          </Card>
          );
        })}

      </div>

      {toastMsg && <Toast message={toastMsg} show={!!toastMsg} onClose={() => setToastMsg("")} />}
    </Screen>
  );
}
