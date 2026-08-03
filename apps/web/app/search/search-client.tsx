"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../src/context/auth-context";
import { LoginModal } from "../../src/components/LoginModal";
import { PanditRecordCard } from "../../components/design/PanditRecordCard";
import { mapPanditToResult, PanditResult } from "../../components/design/mapPandit";
import { GuestStrip } from "../../components/design/GuestMode";
import { SurfaceState } from "../../components/design-system/SurfaceState";
// RealPricesNote ("सभी दाम असली हैं") and MoneyNote's Devanagari lead are
// RULED KILLS (decide-or-go, kill a): a platform announcing its own honesty
// manufactures doubt. The money FACT MoneyNote carried survives as one
// English line at the list's foot — a fact about the price, not a claim
// about our virtue.
import { resolveApiBase } from "@hmarepanditji/utils";
import { PUJA_TYPES, PUJA_LABELS_EN, PUJA_LABELS_HI, isPujaType, SERVED_CITIES, cityKey } from "@hmarepanditji/types";

// ── Types ────────────────────────────────────────────────────────────────────

interface SearchFilters {
  /** the CANONICAL pujaType value (Track 2A vocabulary), or "" */
  ritual: string;
  city: string;
  date: string;
  minBudget: number;
  maxBudget: number;
  sort: string;
  maxDistanceKm: number;
  // CUT (batch 3): travel (a blackout filter — its data source died in July),
  // minRating + languages (both would exclude every real row: production holds
  // rating 0 and languages [], so a control offering them is a knob whose
  // every answer is empty), searchAllIndia / regions / experience (controls
  // the request builder never read — F-J4-2's client half).
}

// ── Constants ────────────────────────────────────────────────────────────────

// THE THIRD VARIANT of the api-base bug, found on the live search screen
// 2026-07-29. This trusted the env var AS-IS and never appended the prefix.
// On Vercel the value is a bare ORIGIN, so every call went to
//   https://<api-host>/pandits   ->  404
// The 308 shim in app.ts covers `/pandits/*` (a trailing segment) but NOT
// bare `/pandits`, so nothing rescued it. The other two variants were
// DRIFT-A (append when the env already has it -> doubled) and DRIFT-B
// (hardcode /api/customers). resolveApiBase resolves all three shapes.
//
// This file lives under apps/web/src, which is NOT ROUTED — but it IS
// IMPORTED by apps/web/app/search/page.tsx and therefore shipped. "src is
// the dead tree" is true of ROUTES only; a file there is live the moment
// something in app/ imports it.
const API_URL = resolveApiBase(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NODE_ENV === "development",
).base;

// REGIONS deleted (batch 3): five pilgrimage regions the platform does not
// serve, offered by a control the request builder never read. Every option
// excluded the only real pandits — the zero-result state was the DEFAULT
// experience of using it (F-J4-2's measured shape).

// ── API helpers ───────────────────────────────────────────────────────────────

function mapSortToApi(sort: string): string {
  const map: Record<string, string> = {
    "Best Match": "rating",
    Rating: "rating",
    "Price (Low → High)": "price_asc",
    "Price (High → Low)": "price_desc",
    Distance: "distance",
    Experience: "rating",
  };
  return map[sort] ?? "rating";
}

/**
 * @param searchedPooja the ritual the customer is searching for. The per-pooja
 *   video claim is a property of ONE pooja, so it can only be resolved with
 *   the pooja in hand — it is threaded in, never read off the pandit record.
 */


interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function fetchPandits(
  filters: SearchFilters,
  page = 1,
): Promise<{ pandits: PanditResult[]; pagination: PaginationInfo }> {
  const params = new URLSearchParams();
  // EVERY param sent here has a control, and every control's value is sent —
  // the two-sided break of F-J4-2 (controls never sent; params never
  // controlled) closes in both directions at once.
  if (filters.ritual) params.set("pujaType", filters.ritual);
  if (filters.city) params.set("city", filters.city);
  if (filters.date) params.set("date", filters.date);
  if (filters.minBudget > 0)
    params.set("minDakshina", String(filters.minBudget));
  if (filters.maxBudget < 50000)
    params.set("maxDakshina", String(filters.maxBudget));
  // travelMode CUT (ruled): a blackout filter is worse than a dead one.
  // minRating / language CUT: production data would make every answer empty.
  params.set("sort", mapSortToApi(filters.sort));
  params.set("page", String(page));
  params.set("limit", "10");

  const res = await fetch(`${API_URL}/pandits?${params.toString()}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("Failed to fetch pandits");
  const body = await res.json();
  const rawPandits: Record<string, unknown>[] = body.data?.pandits ?? [];
  return {
    pandits: rawPandits.map((p) => mapPanditToResult(p, filters.ritual)),
    pagination: body.data?.pagination ?? {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
  };
}

// ── Components ─────────────────────────────────────────────────────────────

// EnhancedPanditCard DELETED (batch 3). 144 lines, ZERO call sites anywhere
// in the repo including this file — and it carried the only surviving Rs-0
// expression on the search surface (a hard-coded price:0 rendered as ₹0k).
// The /search migration deliberately did not delete it so the move stayed a
// provable move; the batch that rebuilt the results surface is where it dies.


function Sidebar({
  filters,
  onChange,
  onReset,
  onApply,
}: {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  onReset: () => void;
  onApply?: () => void;
}) {
  // ── THE FILTERS, ALIVE (F-J4-2 / F-J4-4, ruled fix-not-remove) ──
  // The old Sidebar rendered three controls (searchAllIndia, regions,
  // experience) that the request builder never read — dead on the CLIENT —
  // while the two filters the platform can actually answer (city, pooja) had
  // no controls at all. Both vocabularies now exist, so the controls bind to
  // them: city to SERVED_CITIES (F-J4-8 L2), pooja to PUJA_TYPES (Track 2A).
  // What is offered is what the server can keep; nothing else is offered.
  // The fabricated "Ganga Aarti Special" events banner died with the rebuild.
  return (
    <aside className="w-full flex-shrink-0 space-y-4 lg:w-72">
      <div className="rounded-panel border border-hairline bg-white p-4">
        <h3 className="text-section font-semibold text-ink">Filters</h3>

        {/* ── Ceremony — the 8 canonical poojas, Roman + accent ── */}
        <p className="mt-4 text-label font-semibold text-ink">Ceremony</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PUJA_TYPES.map((t) => {
            const on = filters.ritual === t;
            return (
              <button
                key={t}
                onClick={() => onChange({ ritual: on ? "" : t })}
                aria-pressed={on}
                className={`rounded-pill px-3 py-2 text-[12.5px] font-semibold ${
                  on ? "bg-saffron text-white" : "border border-hairline bg-cream text-ink"
                }`}
              >
                {PUJA_LABELS_EN[t]}
                <span className="ml-1 font-devanagari font-normal opacity-70">{PUJA_LABELS_HI[t]}</span>
              </button>
            );
          })}
        </div>

        {/* ── City — the list the platform actually serves ── */}
        <p className="mt-4 text-label font-semibold text-ink">City</p>
        <select
          value={filters.city}
          onChange={(e) => onChange({ city: e.target.value })}
          className="mt-2 w-full rounded-control border-hairline bg-white text-body text-ink focus:border-saffron focus:ring-saffron"
        >
          <option value="">All cities</option>
          {SERVED_CITIES.map((c) => (
            <option key={c.key} value={c.en}>
              {c.en}
            </option>
          ))}
        </select>

        <button
          onClick={onApply}
          className="mt-5 min-h-cta w-full rounded-control bg-saffron text-body font-semibold text-white"
        >
          Show Pandit jis
        </button>
        <button
          onClick={onReset}
          className="mt-2 min-h-cta w-full rounded-control border border-hairline bg-cream text-body font-semibold text-ink"
        >
          Clear filters
        </button>
      </div>
    </aside>
  );
}


// ── Main Page Component ──────────────────────────────────────────────────────

export default function SearchClient({
  initialParams,
}: {
  initialParams: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");

  const handleBook = (id: string) => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setRedirectUrl(`/booking/new?panditId=${id}`);
      setLoginModalOpen(true);
    } else {
      router.push(`/booking/new?panditId=${id}`);
    }
  };

  const defaultFilters = (
    params: Record<string, string | undefined>,
  ): SearchFilters => ({
    // THE URL VOCABULARY IS pujaType, canonical (Track 2A). The old `ritual`
    // URL param is KILLED (ruled): its Title-Case values were ones the filter
    // could never match, so every deep-link built on it was dead — including
    // /ceremonies' own tiles until 2a recut them. A non-canonical value is
    // dropped rather than sent: a filter fed vocabulary the database does not
    // hold is F-J4-4 again.
    ritual: params.pujaType && isPujaType(params.pujaType) ? params.pujaType : "",
    city: params.city || "",
    date: params.date || "",
    minBudget: Number(params.minBudget) || 0,
    maxBudget: Number(params.maxBudget) || 50000,
    sort: params.sort || "Best Match",
    maxDistanceKm: Number(params.maxDistanceKm) || 50,
  });

  const [filters, setFilters] = useState<SearchFilters>(() =>
    defaultFilters(initialParams),
  );
  const [pandits, setPandits] = useState<PanditResult[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const search = useCallback(async (searchFilters: SearchFilters, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPandits(searchFilters, page);
      setPandits(result.pandits);
      setPagination(result.pagination);
    } catch (err) {
      setError("Failed to load pandits. Please try again.");
      setPandits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    search(filters, 1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilters = (patch: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const resetFilters = () => {
    const fresh = defaultFilters({});
    setFilters(fresh);
    search(fresh, 1);
  };

  const applyFilters = () => search(filters, 1);

  const loadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchPandits(filters, pagination.page + 1).then((result) => {
        setPandits((prev) => [...prev, ...result.pandits]);
        setPagination(result.pagination);
      }).catch((err) => console.error('Failed to load more pandits:', err));
    }
  };

  const location = filters.city || "Delhi";

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#221c10]">
      {/* Mobile Filter Toggle */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white p-4 lg:hidden dark:bg-[#1a140d]">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"
        >
          <span className="material-symbols-outlined">filter_list</span> Filters
        </button>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 top-0 w-80 overflow-y-auto bg-white p-4 dark:bg-[#1a140d]"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              filters={filters}
              onChange={updateFilters}
              onReset={resetFilters}
              onApply={() => {
                setSidebarOpen(false);
                applyFilters();
              }}
            />
          </div>
        </div>
      )}

      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-8 p-4 lg:flex-row lg:p-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            filters={filters}
            onChange={updateFilters}
            onReset={resetFilters}
            onApply={applyFilters}
          />
        </div>

        {/* Main Content */}
        <section className="flex-1">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              {/* 4b header: the ceremony 600/16.5, the context beneath as an
                  uppercase micro label. English-first (canon turn 4); the
                  Devanagari heading fallback was a language-law breach. */}
              <div>
                <h1 className="text-[16.5px] font-semibold leading-[1.2] text-ink">
                  {filters.ritual && isPujaType(filters.ritual)
                    ? PUJA_LABELS_EN[filters.ritual]
                    : "Find a Pandit ji"}
                  {loading && (
                    <span className="ml-3 text-[13px] font-normal text-muted">
                      Loading…
                    </span>
                  )}
                </h1>
                {/* TRUTH FIX (kept from 1c): the count of results is not a
                    count of verifications; only a per-card claim may say who
                    was verified, and for what. */}
                <p className="micro-label mt-1">
                  {!loading && `${pagination.total} Pandit ji available`}
                  {filters.city && <> · {filters.city}</>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg text-slate-500">Sort by:</span>
                <select
                  value={filters.sort}
                  onChange={(e) => {
                    updateFilters({ sort: e.target.value });
                  }}
                  className="rounded-lg border-slate-200 bg-white text-lg font-medium text-slate-900 focus:border-[#f2a20d] focus:ring-[#f2a20d] dark:border-white/10 dark:bg-[#1a140d] dark:text-white"
                >
                  <option>Best Match</option>
                  <option>Rating</option>
                  <option>Price (Low → High)</option>
                  <option>Price (High → Low)</option>
                  {filters.city && <option>Distance</option>}
                </select>
              </div>
            </div>

            {(filters.ritual || filters.date) && (
              <div className="flex flex-wrap gap-2">
                {filters.ritual && isPujaType(filters.ritual) && (
                  <span className="inline-flex items-center gap-1 rounded-pill border border-hairline bg-cream px-3 py-1.5 text-[12.5px] font-semibold text-ink">
                    {PUJA_LABELS_EN[filters.ritual]}
                    <span className="font-devanagari font-normal text-muted">
                      {PUJA_LABELS_HI[filters.ritual]}
                    </span>
                  </span>
                )}
                {filters.date && (
                  <span className="inline-flex items-center rounded-pill border border-hairline bg-cream px-3 py-1.5 text-[12.5px] font-semibold text-ink">
                    {filters.date}
                  </span>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-lg text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
                <button
                  onClick={applyFilters}
                  className="ml-4 font-bold underline"
                >
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-48 animate-pulse rounded-xl border border-slate-100 bg-white p-5 dark:border-white/10 dark:bg-[#1a140d]/80"
                  />
                ))}
              </div>
            ) : pandits.length === 0 ? (
              /* THE ZERO-RESULT STATE — the DEFAULT experience in a two-pandit
                 world, and until this batch it had no honest copy: it told the
                 customer to "search all India", a toggle that was never
                 transmitted. It now says WHAT was searched and what to do
                 about it, and ERROR ≠ EMPTY holds by construction — a failed
                 fetch renders the error branch above, never this one. */
              <SurfaceState
                kind="empty"
                subject="Pandit jis"
                title={
                  filters.ritual && isPujaType(filters.ritual)
                    ? `No Pandit ji offers ${PUJA_LABELS_EN[filters.ritual]}${filters.city ? ` in ${filters.city}` : ""} yet`
                    : `No Pandit ji found${filters.city ? ` in ${filters.city}` : ""} yet`
                }
                body="We are a new platform with a small, growing circle of Pandit jis. Try another ceremony or city — or see everyone we have."
                action={
                  <button
                    onClick={resetFilters}
                    className="inline-flex min-h-cta items-center rounded-control bg-saffron px-5 text-body font-semibold text-white"
                  >
                    See all Pandit jis
                  </button>
                }
              />
            ) : (
              // 1c · अभिलेख — the record. 12px between cards (the doc's rhythm),
              // not the old 24px grid gap.
              <div className="flex flex-col gap-3">
                {/* अतिथि · guest mode, 2a — a mode you are in, sitting with the
                    search context. Says what he CAN do; the paywall is at
                    commitment, not at the door. Shown only to a guest: telling
                    a signed-in customer he may browse freely is noise. */}
                {!isAuthenticated && !authLoading && <GuestStrip placement="header" />}
                {/* the all-prices-are-real self-assurance line was KILLED here
                    (ruled kill a) — a platform announcing its own honesty
                    manufactures doubt. Named, not quoted: the kill-regression
                    guard hunts the literal, and a quotation would trip it. */}
                {pandits.map((pandit) => (
                  <PanditRecordCard
                    key={pandit.id}
                    pandit={{
                      id: pandit.id,
                      name: pandit.name,
                      photoUrl: pandit.avatarUrl,
                      services: pandit.services,
                      poojaVideo: pandit.poojaVideo,
                      experienceYears: pandit.experienceYears,
                      city: pandit.city,
                      // REAL same-city computation: the customer NAMED a city
                      // (the filter), so cityKey equality — both scripts, both
                      // nukta encodings — is an honest comparison, not a guess
                      sameCity: !!filters.city && !!pandit.city && cityKey(filters.city) === cityKey(pandit.city),
                      dakshina: pandit.dakshina,
                      languages: pandit.languages,
                    }}
                    onOpenProfile={() => router.push(`/pandit/${pandit.id}`)}
                    onWatchVideo={() => router.push(`/pandit/${pandit.id}#video`)}
                  />
                ))}
                {/* The two money FACTS that survive the self-praise kill —
                    statements about the price's composition, not about our
                    virtue. English-first. */}
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  Samagri &amp; travel are settled directly with the Pandit ji —
                  never added here, never estimated. No reviews yet — we&rsquo;re new.
                </p>
              </div>
            )}

            {!loading && pagination.page < pagination.totalPages && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={loadMore}
                  className="rounded-lg border border-slate-200 bg-white px-8 py-3 text-lg font-bold text-slate-900 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-[#1a140d] dark:text-white dark:hover:bg-white/5"
                >
                  Load More ({pagination.total - pandits.length} more)
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        redirectAfterLogin={redirectUrl}
      />
    </div>
  );
}
