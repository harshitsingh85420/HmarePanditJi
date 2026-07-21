# Investigation #25 — apps/web: `app/` vs `src/app/` (decision doc)

**Status: REPORT-ONLY. Nothing was changed. The canonical-tree call is Isj's.**
Investigated 2026-07-21 on `fix/canon-exact` (report applies equally to `main`).

## The facts

**`app/` is what Next.js serves — hard-proven.** Next only honors `src/app`
when no root `app/` exists; `apps/web/app/` exists with its own layout, and the
`.next/server/app` build output contains exactly the `app/` routes and none of
`src/app`'s. Nothing in next.config/vercel.json/tsconfig changes this.

**The ~98-tsc-error premise is STALE.** A clean full run of `tsc 5.9.3
--noEmit` over apps/web (1,615 files) exits **0 — zero errors in both trees**.
The 98 figure comes from dead log files (`errors.txt`, `tsc.log`) last written
2026-02-23 that cite files which no longer exist. Type-safety does not
differentiate the options.

**The trees are coupled in exactly one place:** `app/search/page.tsx` imports
`src/app/search/search-client.tsx` (742 lines). Separately,
`src/{components,context,hooks,lib,stores,utils}` are **live dependencies** of
the served tree (layout, auth/cart context, Razorpay checkout) — only
`src/app` is dead.

**Inventory (short form).** `app/` = 29 served pages: home, login, THE
booking wizard + booking-confirmed (the entire shipped P-PAY path with every
July money fix), dashboard bookings/cancel/review/track/notifications/profile,
pandit profile, muhurat, NRI, search, voice-search, legal, stitched harness.
`src/app` = 66 dead pages: a deeper API-connected cluster (`/bookings`
list/detail/track/certificate/completion/itinerary, an 1,104-line alternate
booking wizard, a 1,292-line pandit profile-client, richer legal pages,
`api/chat` Guruji backend) **plus ~50 fetch-less static mockups** (admin ×7,
pandit-provider ×20, b2b ×3, the checkout mockups the P-PAY campaign killed) —
the admin/pandit-provider mockups are superseded by apps/admin and apps/pandit.

**Two LIVE production bugs found during this investigation (not fixed —
report-only):**
1. `app/booking/[id]` redirects to `/bookings/:id` — a route that only exists
   in the dead tree → **404s in prod today**. Correct target:
   `/dashboard/bookings/:id`.
2. `app/dashboard/favorites` calls `/api/customers/...` (real prefix is
   `/api/v1`) → **favorites is broken in prod**. The 2026-07-13 fix landed
   only in the DEAD copy — the exact class of split-brain bug the dual tree
   causes.

## Options

| | Option | Breaks | Effort |
|---|---|---|---|
| **(a)** | **DELETE `src/app` only** (keep `src/{components,context,…}` — live deps) | One import (move `search-client.tsx` into `app/search/` first); loses reference implementations (all preserved in git history) | **Small** — ~half a session incl. the 3-item pre-flight |
| (b) | PROMOTE `src/app` → `app/` | **Catastrophic**: deletes home, login, the shipped Razorpay payment path and every July fix, in exchange for ~50 static mockups incl. the checkouts P-PAY explicitly killed | Weeks, strictly regressive — non-starter |
| (c) | SELECTIVE GRAFT of unique `src/app` routes | Nothing per graft, but each needs import rewrites + re-verification against the July API/money contracts (the cluster predates them — blind wiring can resurrect fixed bugs) | Medium, ~0.5–1 session per route; only sane on-demand |

## Recommendation

**(a) with a 3-item pre-flight, (c) as an on-demand menu afterwards:**
1. Move `src/app/search/search-client.tsx` → `app/search/` and fix the import.
2. Port the favorites API-prefix fix into the SERVED copy (also fixes live bug #2).
3. Retarget the `app/booking/[id]` redirect to `/dashboard/bookings/:id` (fixes live bug #1).
4. Then `rm -r src/app` (optionally `git tag pre-src-app-delete`).
Never touch `src/{components,context,hooks,lib,stores,utils}` — served code
imports them directly.

Why act at all when tsc is clean: the dual tree is already costing real money —
two July fixes split across the trees, every session risks editing the wrong
copy. One tree ends that bug class.

**Graft menu for later (value order):** `/bookings` cluster (also gives bug
#1's redirect a richer target), the 1,292-line pandit profile-client (vs the
live 371-line page), 408-line cancellation-policy + contact/refund/disclaimer.
**Never graft:** admin/*, pandit-provider/*, b2b/* (owned by apps/admin +
apps/pandit), checkout/* (P-PAY ruling).
