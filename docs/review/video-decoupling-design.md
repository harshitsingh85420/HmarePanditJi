# VIDEO DECOUPLES FROM LISTING — design report, scouted half (2026-08-03)

**Status: REPORT-ONLY. Sections 1–2 + the reader table are delivered for
rulings; sections on samagri tiers + staging follow Isj's confirm. No code.**

Isj's model, confirmed intent: *a pooja is LISTED AND BOOKABLE the moment the
pandit submits it — no video required. Video is a per-pooja TRUST BONUS,
customer's choice to weigh. The video itself renders only after admin review.*

---

## 0 · THE MECHANISM TODAY, measured (what the change actually touches)

`PujaService.isActive` gates the ENTIRE pooja (listing + price + video), and
its writer census is:

| # | writer | behaviour today |
|---|---|---|
| W1 | `savePoojaConfig` (wizard submit) | creates `isActive:false` in a `$transaction` — the pooja is INVISIBLE until review |
| W2 | `approvePoojaVerification` | **the only path to `true`** — flips transactionally with the APPROVED write |
| W3 | `rejectPoojaVerification` | flips `false` (un-publishes) |
| W4 | `POST /pandits/me/services` | mounted, **zero live callers**; create `false` |
| W5 | `upsertDakshinaRate` | price-only mirror; create `false`, update never touches the flag |
| 🔴 W6 | `onboardingStep2` | **UNGUARDED PUBLISH HOLE**: mounted, zero app callers, `deleteMany`+`createMany` WITHOUT the flag — the schema's `@default(true)` **publishes ₹0 rows** and the deleteMany **erases admin-approved rows**. Not scanned by the publish guard (it reads only three files). |
| W7 | seed / backfill | seed publishes via the default; backfill creates `false` |

**The schema default is `true`** — any writer that forgets the field publishes
silently. W6 is the standing proof.

Per-pooja VIDEO state lives on `PoojaVerification` (PENDING/APPROVED/REJECTED,
versioned) and is already projected independently through `sampleFor()`:
`poojaVerified` (= status APPROVED) and `sampleViewable`/`sampleVideoId`
(= YOUTUBE + videoId, **regardless of status today** — "listenable in both
states" was the old two-claims design).

---

## 1 · THE SPLIT — schema-shape proposal

### The two independent states, named

| state | meaning under the new model | storage |
|---|---|---|
| **pooja-published** | the pandit has submitted it; listed + bookable immediately; HIS to unlist | `PujaService.isActive` — **semantics change, no new column** |
| **video-approved** | our review watched this pooja's video | `PoojaVerification.status === "APPROVED"` — **already exists, already versioned, already projected** |

### Recommendation: OPTION A — zero migration, semantics + projection

1. **`savePoojaConfig` creates `isActive: TRUE`** — submit publishes. (अन्य
   stays on the REQUEST path and never creates a service row — and the scout
   found the doctrine violated today: the wizard posts free text into
   `poojaType`; the split build fixes that write to match the ruled path.)
2. **W2/W3 stop touching `isActive`.** Approval/rejection is a VIDEO verdict;
   rejecting a video must not unlist a bookable pooja. The "isActive-style
   flip" Isj names lives where it always was — `PoojaVerification.status` —
   and needs no second home.
3. **`sampleFor()` gates the video on APPROVED**: `sampleVideoId` null unless
   status APPROVED. This is the one behavioural inversion — today an
   unreviewed YOUTUBE sample is listenable; under the model it renders only
   after review. The projection gains `videoStatus: "NONE"|"PENDING"|"APPROVED"|"REJECTED"`
   per service so surfaces can say the truthful thing at each state.
4. **Flip the schema default to `false`** (`@default(true)` → `false`) — a
   forgotten field must UNpublish, not publish. One-line migration, no data
   change.
5. **Close W6** in the same change: delete the caller-less `onboardingStep2`
   service-write (or fix it to `isActive:false` + no deleteMany) and widen the
   publish guard's scan to every file that can write the flag.
6. **The publish guard inverts its core law** and is rewritten as the ruled
   EDIT (the storage-keys precedent): clause 1 — submit publishes; clause 2 —
   only the pandit unlists; clause 3 — video verdicts never touch listing.

**Option B (rejected, stated):** a denormalised `videoStatus` column on
`PujaService`. It duplicates `PoojaVerification.status` — two writers of one
fact, the exact class verified-single-writer exists to kill.

### The chip vocabulary (honest, per the ruled summary-card)

| surface | renders |
|---|---|
| card (any) | **count**: "N poojas verified" = poojas with an APPROVED video, ≥1 only. **✓/"verified" now means VIDEO-verified specifically** — the word never inflates to cover the unreviewed claim. |
| card (filtered) | the **filter's echo** chip: plain = listed/bookable; **✓ tick only when video-approved** |
| profile ServicesTab | the full list — plain chip = listed (bookable now); "+ video verified" badge when APPROVED; PENDING says *"video under review"*; no video says nothing |
| booking flow | unchanged — सत्यापन informs, never blocks (already the ruled state) |

### EVERY reader that changes (the table, ready-made)

| # | reader | file | today | under the split |
|---|---|---|---|---|
| R1 | public list select + filter | `services/api/src/controllers/pandit.controller.ts` (`pujaServices: { where: { isActive: true } }`, `some({isActive:true,...})`) | approved-only poojas findable | **submitted poojas findable immediately**; no code change — the flag's meaning changed under it |
| R2 | public detail select | same file, detail `findUnique` | same | same |
| R3 | `GET /pandits/:id/services` | `services/api/src/services/pandit.service.ts` | same | same |
| R4 | `sampleFor()` projection | `pandit.controller.ts` | exposes unreviewed YOUTUBE samples | **gates on APPROVED** + emits `videoStatus` |
| R5 | owner reads (unfiltered) | `auth.controller.ts /auth/me`, `pandit.routes.ts /pandits/me` | carry `isActive` as data | unchanged — but the my-poojas **visibility chip copy** changes: "दिख रही है" fires on submit, and a new line names the video state |
| R6 | my-poojas visibility chip | `apps/pandit/src/app/(dashboard-group)/my-poojas/page.tsx` | chip = admin approved | **chip = listed (immediate)**; add video-state line (PENDING/APPROVED/REJECTED) |
| R7 | customer card (all readers, one component) | `apps/web/components/design/PanditRecordCard.tsx` + `mapPandit.ts` | count = APPROVED verifications | **unchanged meaning** (count = video-approved) — the count survives the model because it always counted videos |
| R8 | card video row | same | renders when sample viewable | renders only when `videoStatus === "APPROVED"` (R4 enforces upstream) |
| R9 | profile ServicesTab | `apps/web/app/pandit/[id]/ServicesTab.tsx` | per-service `poojaVerified` two-state copy | three-state copy (approved / under review / no video), bookable in all three |
| R10 | booking gate | `services/api/src/services/booking.service.ts` | reads per-pooja verification to INFORM | unchanged (informs, never blocks) |
| R11 | verifiedPoojaTypes | list + detail mappers | = APPROVED verifications | **unchanged** — it was always the video fact; its NAME is now honest |
| R12 | admin queue | `apps/admin` PoojaQueue | approve = publish | **approve = video verdict only**; queue copy changes ("approve video", not "publish pooja") |
| R13 | guards | `pujaServicePublish.test.ts`, `verificationNaming.test.ts`, pandit-suite conformance F09/F12 | pin the old law | rewritten as ruled EDITS, never additions |

---

## 2 · THE TRUST QUESTION — drafted for Isj's ruling, his words reflected back

> **RULING TO CONFIRM:** Under this model, an UNREVIEWED pooja claim — its
> name and its price — reaches customers the moment a pandit submits it. That
> is the explicit choice ("the customer's choice to weigh"): **the platform's
> review covers VIDEOS, not pooja claims.** The consequence, named: a pandit
> can list a pooja he has never performed, at any price, and the platform's
> only mark against it is the ABSENCE of a verified video — an absence the
> card renders honestly (no count, no tick) but does not warn about. The
> door (Aadhaar) still gates WHO can list; nothing gates WHAT he lists.
> Verified-count and ✓ then mean video-verified, specifically and only.

**Claim-lines audit against this model** (does anything promise pooja-level
review?): the drafted general lines (a) identity and (c) video **stay TRUE**
— (c) *"every ceremony video is reviewed by us before it appears"* is exactly
the split's video half. Two existing lines OVER-claim and are flagged for the
census kills: `terms/page.tsx` — *"…and credential verification before they
are listed"* (nothing implements a credential check); `about/page.tsx` —
*"only highly educated and respected Acharyas"* (a competence review no
system performs). The ceremonies page claims nothing. The per-pooja surfaces
already name the video correctly.

---

## 3–4 · SAMAGRI TIERS + STAGING — awaiting Isj's confirm

Held per the order. Two scouted facts worth his eye now: the wizard's
PANDIT_BRINGS tile **already promises** *"तीनों स्तर के दाम आप तय कीजिए"* — a
per-tier-pricing promise the wizard never collects (the `saved:0` mechanism:
unpriced tiers take the server's DELETE branch); and the tier vocabulary needs
a naming ruling — stored values are `BASIC/STANDARD/PREMIUM` (labels
बेसिक/स्टैंडर्ड/प्रीमियम); **साधारण/मानक/विशेष would be a fourth tier
vocabulary** found nowhere in code (the canon's साधारण triplet is a HOTEL
grade). The consultation report queues behind; its overlap is already visible
— **no consultation config shape exists anywhere**; `PoojaConfig` /
`PujaService` / `DakshinaRate` are the nearest kin, and "another puja kit"
maps cleanly onto a `CONSULTATION` pujaType riding the same rails **only if**
the vocabulary ruling admits a non-ceremony type.
