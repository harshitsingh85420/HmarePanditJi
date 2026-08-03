"use client";

/* F-J4-9 · RULED 2026-08-01 (Isj) — THE HARDCODED COMPARISON IS DELETED.
   ─────────────────────────────────────────────────────────────────────
   What was here, under a header comment that said so out loud
   ("Mock Data matching the UI design perfectly"):

     const panditTotal = 8000;      // "Pandit's Fixed Package · Premium Brands"
     const marketTotal = 5200;
     const COMPARISON_ITEMS = [ …5 items, invented brands, invented
       "premium" prices, invented "market" prices, invented savings
       strings like "18% less", five embedded image URLs… ]

   The ₹8,000 was **attributed to a specific, real, named pandit who has no
   samagri packages at all**, and it did not stay on screen: the walk
   captured it flowing into the real booking payload as
   `samagriAmount: 8000`, and onto the Review screen as "Settled at booking
   — paid directly to Pandit Ji". A customer was being told to hand ₹8,000
   to a living person for a package she never created.
   FABRICATED MONEY ATTRIBUTED TO A LIVING PERSON IS THE ZERO-TOLERANCE
   SHAPE.

   One item's invented claim was false even inside the invented data:
   Whole Coconut, "premium" ₹50 vs "market" ₹80, labelled "20% less" — it
   was 60% MORE.

   ── WHY THE TWO-PRICE COMPARISON IS GONE ENTIRELY, not re-sourced ──
   The real catalogue (services/api/src/data/samagri-catalog.json) carries
   ONE price per item: { id, name, unit, basePrice, description }. There is
   no premium/market pair anywhere in the data model, so a "Premium Brand
   vs Market Rate · X% less" column cannot be rendered from real data at
   all. Per the ruling — real data or deleted — the per-item percentage
   claims are DELETED rather than re-anchored. A fabricated percentage is a
   fabricated claim.

   ── THE THREE HONEST OUTCOMES ──
   · a real SamagriPackage exists  → the pandit column renders, with ITS number
   · a real catalogue loads        → the custom list renders, with real prices
   · neither                       → NEITHER column renders. The customer is
                                     told plainly and offered the one honest
                                     path: arrange samagri himself, ₹0.
   "You Save" appears ONLY when both figures are real and the package is
   dearer. Otherwise there is no saving to claim. */

import { useState, useEffect, useCallback } from "react";
import { API_BASE } from "../../context/auth-context";
import { samagriTierLabel } from "@hmarepanditji/types";

export interface SamagriSelection {
    type: "package" | "custom";
    totalCost: number;
    items?: any[];
}

export interface SamagriModalProps {
    panditId: string;
    pujaType: string;
    onSelect: (selection: SamagriSelection) => void;
    onClose: () => void;
}

type LoadState = "loading" | "ok" | "error";

interface CatalogItem { id: string; name: string; unit?: string; basePrice: number; }
/* THE PHANTOM READ, FIXED (S3, ruled 2026-08-03). This type used to declare
   `packageName` (the legacy column the live writer never fills) and
   `totalCost` — a column that exists NOWHERE in SamagriPackage. The pandit
   card was therefore structurally unrenderable: hasPackage was false for
   every pandit that ever existed. The wire (GET /pandits/:id/samagri-packages)
   sends full rows: { id, tier, price, fixedPrice?, packageName?, items }.
   The cost coalesces fixedPrice ?? price — the same law as ServicesTab R7:
   new rows carry both, legacy rows only fixedPrice. */
interface PanditPackage {
    id: string;
    tier?: "BASIC" | "STANDARD" | "PREMIUM";
    price?: number | null;
    fixedPrice?: number | null;
    packageName?: string | null;
    items?: unknown[];
}
const TIER_ORDER = ["BASIC", "STANDARD", "PREMIUM"] as const;
const pkgCost = (p: PanditPackage): number | null => {
    const n = p.fixedPrice ?? p.price;
    return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null;
};

const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export function SamagriModal({ panditId, pujaType, onSelect, onClose }: SamagriModalProps) {
    const [state, setState] = useState<LoadState>("loading");
    const [packages, setPackages] = useState<PanditPackage[]>([]);
    const [catalog, setCatalog] = useState<CatalogItem[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});

    const load = useCallback(async () => {
        setState("loading");
        // Both are optional sources; the modal is only "error" if BOTH throw.
        // Either one absent is a legitimate outcome, not a failure.
        //
        // THE VOCABULARY SCHISM'S NEXT READER (samagri proof walk, 2026-08-03):
        // the booking wizard passes the Ritual table's display name — "Havan
        // (हवन)" — while SamagriPackage rows key on the canonical
        // SCREAMING_SNAKE value ("HAVAN"). The query matched nothing for every
        // pandit, forever. Canonicalise before asking: strip the Devanagari
        // parenthetical, uppercase, underscore. A canonical caller (ServicesTab
        // passes "HAVAN") round-trips unchanged.
        const canonicalPujaType = pujaType
            ? pujaType.split("(")[0].trim().toUpperCase().replace(/[\s-]+/g, "_")
            : "";
        const q = canonicalPujaType ? `?pujaType=${encodeURIComponent(canonicalPujaType)}` : "";
        const [pkgRes, catRes] = await Promise.allSettled([
            fetch(`${API_BASE}/pandits/${panditId}/samagri-packages${q}`, { signal: AbortSignal.timeout(8000) }).then((r) => r.ok ? r.json() : Promise.reject(new Error(String(r.status)))),
            fetch(`${API_BASE}/samagri/catalog`, { signal: AbortSignal.timeout(8000) }).then((r) => r.ok ? r.json() : Promise.reject(new Error(String(r.status)))),
        ]);

        let pkgs: PanditPackage[] = [];
        if (pkgRes.status === "fulfilled") {
            const d = (pkgRes.value as any)?.data;
            if (Array.isArray(d)) pkgs = d;
        }

        let items: CatalogItem[] = [];
        if (catRes.status === "fulfilled") {
            // Real shape: { categories: [ { name, items: [ {id,name,unit,basePrice} ] } ] }
            const cats = (catRes.value as any)?.categories ?? (catRes.value as any)?.data?.categories;
            if (Array.isArray(cats)) {
                items = cats.flatMap((c: any) => Array.isArray(c?.items) ? c.items : [])
                    .filter((it: any) => it && typeof it.basePrice === "number" && it.name);
            }
        }

        setPackages(pkgs);
        setCatalog(items);
        setCounts(Object.fromEntries(items.map((i) => [i.id, 0])));
        // Only a total failure of BOTH sources is an error worth showing as one.
        setState(pkgRes.status === "rejected" && catRes.status === "rejected" ? "error" : "ok");
    }, [panditId, pujaType]);

    useEffect(() => { void load(); }, [load]);

    const step = (id: string, d: number) =>
        setCounts((p) => ({ ...p, [id]: Math.max(0, (p[id] || 0) + d) }));

    const customTotal = catalog.reduce((t, i) => t + i.basePrice * (counts[i.id] || 0), 0);

    // every priced tier renders as its own card, साधारण→मानक→विशेष order;
    // an unpriced row is an honest absence, never a ₹0
    const pricedPackages = TIER_ORDER
        .map((t) => packages.find((p) => p.tier === t))
        .filter((p): p is PanditPackage => !!p && pkgCost(p) !== null);
    const hasPackage = pricedPackages.length > 0;
    const hasCatalog = catalog.length > 0;
    const anySelected = Object.values(counts).some((c) => c > 0);

    // BOTH figures real, and the CHEAPEST package genuinely dearer — the
    // only saving claim that cannot overstate. Otherwise silent.
    const cheapest = hasPackage ? Math.min(...pricedPackages.map((p) => pkgCost(p)!)) : null;
    const realSaving = cheapest !== null && anySelected && cheapest > customTotal
        ? cheapest - customTotal
        : null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#2a2018] rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

                <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
                    <div className="min-w-0">
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white">पूजा सामग्री</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {pujaType || "Ceremony"}
                        </p>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="overflow-y-auto px-5 py-4 flex-1">
                    {state === "loading" && (
                        <div className="py-12 text-center text-slate-400 animate-pulse">सामग्री की सूची लोड हो रही है…</div>
                    )}

                    {/* ERROR != EMPTY, fifth application. */}
                    {state === "error" && (
                        <div className="py-10 text-center flex flex-col items-center">
                            <div className="text-3xl mb-3">⚠️</div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">सामग्री की सूची अभी लोड नहीं हो पाई</h3>
                            <p className="text-sm text-slate-500 max-w-xs">
                                यह कनेक्शन की समस्या है — इसका मतलब यह नहीं कि सामग्री उपलब्ध नहीं है।
                            </p>
                            <button onClick={() => void load()} className="mt-5 px-6 py-3 min-h-[52px] rounded-lg border border-[#ec7f13] text-[#ec7f13] font-bold text-sm">
                                फिर कोशिश कीजिए
                            </button>
                        </div>
                    )}

                    {state === "ok" && !hasPackage && !hasCatalog && (
                        <div className="py-10 text-center flex flex-col items-center">
                            <div className="text-3xl mb-3 opacity-60">🪔</div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">सामग्री की सूची अभी उपलब्ध नहीं है</h3>
                            <p className="text-sm text-slate-500 max-w-sm">
                                पंडित जी ने इस पूजा के लिए सामग्री पैकेज नहीं बनाया है, और हमारी सूची अभी तैयार नहीं है।
                                आप सामग्री खुद ला सकते हैं — बुकिंग इससे रुकेगी नहीं।
                            </p>
                        </div>
                    )}

                    {state === "ok" && hasPackage && (
                        <div className="mb-5 flex flex-col gap-3">
                            <h2 className="font-bold text-slate-900 dark:text-white">पंडित जी के सामग्री पैकेज</h2>
                            {pricedPackages.map((p) => {
                                const cost = pkgCost(p)!;
                                // customer voice = Roman tier grades (the born-by-ruling
                                // pairing); the legacy packageName wins only if it exists
                                const label = p.packageName || (p.tier ? samagriTierLabel(p.tier, "en") : "Package");
                                const itemCount = Array.isArray(p.items) ? p.items.length : 0;
                                return (
                                    <div key={p.id} className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-slate-900 dark:text-white truncate">{label}</h3>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {itemCount > 0 ? `${itemCount} items · ` : ""}पंडित जी स्वयं लाएँगे
                                                </p>
                                            </div>
                                            <span className="text-xl font-bold text-slate-900 dark:text-white shrink-0">{fmt(cost)}</span>
                                        </div>
                                        <button
                                            onClick={() => onSelect({ type: "package", totalCost: cost, items: p.items ?? [] })}
                                            className="mt-4 w-full min-h-[52px] rounded-lg bg-[#ec7f13] text-white font-bold"
                                        >
                                            यह पैकेज चुनिए · {fmt(cost)}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {state === "ok" && hasCatalog && (
                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-white mb-1">अपनी सूची बनाइए</h2>
                            <p className="text-xs text-slate-500 mb-3">हर वस्तु की कीमत हमारी सूची से है।</p>
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {catalog.map((item) => (
                                    <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.unit ? `${item.unit} · ` : ""}{fmt(item.basePrice)}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button aria-label="कम कीजिए" onClick={() => step(item.id, -1)} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">−</button>
                                            <span className="w-6 text-center font-bold text-slate-900 dark:text-white">{counts[item.id] || 0}</span>
                                            <button aria-label="और जोड़िए" onClick={() => step(item.id, 1)} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 p-4 shrink-0 bg-white dark:bg-[#2a2018]">
                    {state === "ok" && hasCatalog && (
                        <>
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-slate-900 dark:text-white">आपकी सूची</span>
                                <span className="text-xl font-bold text-[#ec7f13]">{fmt(customTotal)}</span>
                            </div>
                            {/* Only when BOTH numbers are real. */}
                            {realSaving !== null && (
                                <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-3">
                                    पैकेज से {fmt(realSaving)} कम
                                </p>
                            )}
                            <button
                                onClick={() => onSelect({
                                    type: "custom",
                                    totalCost: customTotal,
                                    items: catalog.filter((i) => (counts[i.id] || 0) > 0).map((i) => ({ ...i, qty: counts[i.id] })),
                                })}
                                disabled={!anySelected}
                                className="w-full min-h-[52px] rounded-lg bg-[#ec7f13] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                यह सूची चुनिए · {fmt(customTotal)}
                            </button>
                        </>
                    )}

                    {/* The honest path out, always available: samagri is the
                        customer's to bring, and a missing catalogue must never
                        block a booking. Sends ₹0 — no invented number. */}
                    <button
                        onClick={() => onSelect({ type: "custom", totalCost: 0, items: [] })}
                        className={`w-full min-h-[52px] rounded-lg font-bold ${state === "ok" && hasCatalog ? "mt-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200" : "bg-[#ec7f13] text-white"}`}
                    >
                        सामग्री मैं खुद लाऊँगा
                    </button>
                </div>
            </div>
        </div>
    );
}
