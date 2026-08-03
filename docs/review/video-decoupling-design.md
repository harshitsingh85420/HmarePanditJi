# VIDEO DECOUPLES FROM LISTING — design report, scouted half (2026-08-03)

**Status: sections 0–2 RULED and BUILT (`55f6c5f`, proof walk ledgered).
Sections 3–4 (samagri tiers + staging) delivered 2026-08-03, REPORT-ONLY —
no code until Isj's rulings on: the customer-side tier label, the LIST_ONLY
copy, the R-S6 kill candidates, and the chapter-2 shape.**

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

## 3 · SAMAGRI TIERS — the design (2026-08-03, report-only, GO'd by Isj)

### 3.0 · Two premise corrections, up front

1. **The "ledgered साधारण/मानक/विशेष pairing" does not exist.** A repo-wide
   sweep (docs/, CONFLICT_RULINGS, memory ledgers, all code) finds विशेष as a
   samagri tier exactly once — in THIS document, where it was named as
   hypothetical. The only साधारण triplet anywhere is the HOTEL grade
   साधारण/अच्छा/बढ़िया (artboard 16, ठहरना). Code today shows
   बेसिक/स्टैंडर्ड/प्रीमीयम in the wizard and English Basic/Standard/Premium
   in the standalone editor. **Isj's order is therefore the pairing's birth
   certificate, not its citation** — section 3.1 records it as the ruling.
2. **`YAJMAN_BRINGS` does not exist** — zero matches repo-wide. The enum is
   `PANDIT_BRINGS / PLATFORM_SELLS / LIST_ONLY`; **LIST_ONLY** ("सिर्फ़ सूची
   दूँ" / "यजमान ख़ुद ले आएँगे") is the yajman-brings analogue and survives
   under that name.

### 3.1 · SCHEMA — the tier table already exists; the vocabulary doesn't

**Proposal: NO new table, NO tier rows on PujaService.** `SamagriPackage` IS
the (pandit, pooja, tier) table, live today:
`@@unique([panditId, pujaType, tier])`, `tier PackageTier`
(BASIC/STANDARD/PREMIUM), `price Int`, `items Json` (canonical `SamagriItem
{itemName, quantity, brand, qualityNotes?}` — F12-02's brand law enforced by
every write path via `lib/samagriItem.ts`). The cumulative law is registered
(F12-01 ✅: Standard ⊇ Basic, Premium ⊇ Standard). Keying tiers on
PujaService id would break the standing pattern — every pooja satellite
(`PoojaConfig`, `PoojaVerification`, `SamagriPackage`) keys on
(panditProfile, pujaType), and the listing table stays single-purpose:
**samagri never joins PujaService for the same reason video verdicts no
longer do.**

**The vocabulary** lands beside `PUJA_LABELS_HI/_EN` in
`packages/types/src` (the cityVocab precedent — dist-built, plain-node
loadable; NOT packages/utils, whose main is a .ts file):

| stored | pandit app (HI) | customer app (EN-first) |
|---|---|---|
| `BASIC` | साधारण | Basic |
| `STANDARD` | मानक | Standard |
| `PREMIUM` | विशेष | Vishesh? Premium? — **one ruling needed** |

`SAMAGRI_TIER_LABELS_HI` = साधारण/मानक/विशेष per the order.
**Open ruling (small):** the customer-side label. 'Samagri' itself stays
Roman by the canon ruling (ritual vocabulary, never translated) — but tier
names are grades, not ritual words, so Basic/Standard/Premium is proposed
for the customer app. Isj rules the third column.

**The "can you bring" flag: `PoojaConfig.supplyMode` is the flag, per-pooja
— it survives; tiers do not subsume it.** They answer different questions:
supplyMode = WHO brings (the ला-सकते-हैं answer, one per pooja); tiers =
WHAT he brings at which price (three rows, only meaningful under
PANDIT_BRINGS — the enum's own comment says "per-tier prices apply").
`PanditProfile.canBringSamagri` (global, readiness-R2, dead on the customer
wire — carried on GET /pandits/:id, read by nobody) becomes a **named
future**: derive it from the per-pooja modes or retire it; not this build.

**Schema diffs actually required: none for tiers.** Flagged adjacents, not
this build: (a) legacy columns `packageName/packageType/fixedPrice` on
SamagriPackage — never written by the live writer, still read by one
customer surface (`fixedPrice ?? price`); retirement is a migration for
Isj's hand, queued behind the build; (b) the pre-existing drift —
`PoojaConfig`, `PoojaVerification`, and their enums have **no migration
anywhere** (push-created; the सत्यापन-campaign flag, unchanged here).

### 3.2 · WIZARD CHAPTER 2 — samagri AFTER the listing, never gating it

Isj's order — poojas → video → tiers → "ला सकते हैं?" → if yes, three
prices — read against the decoupling law gives the structural answer:
**samagri leaves the pre-submit path entirely.** Today the item step sits at
step 1, BEFORE the listing submit, collecting items it structurally cannot
price (saved:0). Proposed shape:

- **Chapter 1 (the listing): नाम → और थोड़ी बातें → वीडियो → भेजें.** Four
  steps, submit LISTS (the shipped decoupling). Samagri's old step 1 dies
  here.
- **Chapter 2 (samagri), entered from the done card and from मेरी पूजाएँ
  per-pooja — three screens, one question each, voice-first:**
  1. **सामग्री के तीन स्तर** — the existing tier stack under its new
     साधारण/मानक/विशेष labels, voice add-item, cumulative hint ("मानक में
     साधारण का सब कुछ है, और थोड़ा और").
  2. **"सामान कौन लाएगा?"** — the three existing tiles, already voice-wired
     (हाँ मैं लाऊँगा / प्लेटफ़ॉर्म बेचे / सिर्फ़ सूची दूँ). This IS the
     ला-सकते-हैं question; the tiles are its three honest answers.
  3. **तीन दाम** — only if हाँ (PANDIT_BRINGS): three money fields, voice
     money-mode, validated monotonic (साधारण ≤ मानक ≤ विशेष — cumulative
     items cannot cost less) and > 0 per non-empty tier. **This screen is
     the writer `d.prices` never had.**
- Chapter 2 is **skippable at every screen** ("बाद में — पूजा दिखती रहेगी"):
  the pooja is already listed; samagri is detail, not gate.

**The bulk path (सभी चुनिए): samagri is SKIPPED, named "सामग्री बाद में,
पूजा-पूजा से."** The dakshina question had a one-number answer because a
price is a choice; an item list is a FACT about a specific pooja — विवाह
samagri is not हवन samagri, and one tier-set cloned eight times fabricates
seven lists. Cloning is rejected on honesty grounds, sequential-eight on
persona grounds (the man tapped सभी to escape eight passes). The eight
poojas land listed with honest samagri absence; each gains its tiers later
from मेरी पूजाएँ — **samagri is video-shaped (per-pooja, added later), not
dakshina-shaped (one number now)**. This ratifies what the bulk path
already does (it posts pooja-config only).

### 3.3 · READERS — and the saved:0 gap's closure

**The closure, precisely:** screen 3 writes `d.prices` → the samagri POST
finally carries real prices → `saveSamagriPackages` upserts (saved:N). And
the truthful-state DELETE branch **gets its writer on purpose**: answering
"सामान कौन लाएगा?" with PLATFORM_SELLS or LIST_ONLY (or zeroing a tier)
sends the priceless tiers the server already deletes — the accidental
clear-on-resubmit bug becomes the intentional clear-on-answer. The
`SAMAGRI_NOT_STORED_LINE` warning survives only for genuine partial
failures.

| # | reader | today | after the build |
|---|---|---|---|
| R-S1 | customer profile `ServicesTab` | "Samagri: Not priced yet" (min over `fixedPrice ?? price`, honest null) | priced tiers → "Samagri: ₹N+ [View & Choose]" — no code change, the data arrives |
| R-S2 | profile modal `components/SamagriModal` | tier/price cards, render fine | gains tier display labels from the new vocab |
| R-S3 | **booking wizard step 4 `src/components/samagri/SamagriModal`** | **DEFECT: reads `pkg.totalCost` (column does not exist) and `packageName` (never written) — the pandit-package card can NEVER render, for any pandit** | fixed to read `tier`/`price`; the booking flow can finally show what R-S1 promises |
| R-S4 | search card / list wire | zero samagri | **stays zero** — decide-or-go: tier prices don't pick a pandit at card level; the list-foot line already states settlement; THE CARD IS A SUMMARY |
| R-S5 | pandit मेरी पूजाएँ | no samagri state | per-pooja chip = chapter 2's entry point ("सामग्री: ३ दाम ✓" / "सामग्री बाकी") |
| R-S6 | standalone `/samagri` editor (`SamagriPackageEditor`, English labels) + the never-called API family (POST/PUT/DELETE `/pandits/me/samagri-packages`, `samagri.controller` create/update/delete) | second implementation + dead write paths | **kill-table candidates** (single-implementation law) — reported here, killed only by ruling |
| R-S7 | booking payment summary | "Settled at booking — paid directly to Pandit Ji" | unchanged; the settlement ruling stands |
| R-S8 | wire GET /pandits/:id | `supplyMode` reaches NO customer surface (PoojaConfig never projected) | detail wire gains per-pooja `supplyMode` so R-S1/R-S3 can render the LIST_ONLY state |

**What renders, per supply mode (profile + booking):** PANDIT_BRINGS with
priced tiers → "₹N+ / View & Choose"; **LIST_ONLY → "Yajman arranges the
samagri — Pandit ji shares the list"** (new copy, English-first, for Isj's
eye); PLATFORM_SELLS → the catalogue path; nothing yet → honest absence, as
today. No fabricated zeros anywhere (TRACK 2A 4/4 law holds).

**Money edge, REPORT-only (the boundary):** once R-S3 is fixed, bookings
will start carrying nonzero `samagriAmount` — and the pandit earnings
breakdown displays it beside a `totalPayout` that excludes it, so the
breakdown stops summing. Pre-existing display defect, adjacent to money —
named for the desk, untouched.

### 3.4 · The consultation overlap, answered from samagri's side

Samagri's rails argue **AGAINST** consultation riding PujaService with a
non-ceremony type: `pujaType` is a bare String column on every satellite
(PoojaConfig, PoojaVerification, SamagriPackage), so a `CONSULTATION` value
would be mechanically ACCEPTED by all three — samagri tiers for a
consultation, a सत्यापन video queue entry for it, a dakshina floor falling
through to BASE ₹501 — and every ceremony-shaped surface would need to
opt it out one by one, with no structural guard doing it for them. From
this side of the fence: **consultation wants its own config**; the pooja
rails carry too much ceremony-shaped baggage. The consultation report
answers from its own side next.

---

## 4 · STAGING

**Ships now, free of payment math (build order):**
1. **S1 — the vocabulary**: `SAMAGRI_TIER_LABELS_HI/_EN` beside
   PUJA_LABELS in packages/types, dist-built (blocks nothing, unblocks all).
2. **S2 — wizard chapter 2** (three screens + skip + bulk-skip named) —
   closes saved:0, gives the DELETE branch its writer, moves samagri off
   the listing path.
3. **S3 — the R-S3 defect fix** (booking modal reads `tier`/`price`).
   Touches NO money: `payNow` excludes samagri by construction and stays
   untouched — but it FLIPS `samagriAmount` from always-0 to real, which
   makes the earnings-breakdown non-summing display visible. The desk gets
   the flag before this ships.
4. **S4 — render states + wire**: LIST_ONLY copy, मेरी पूजाएँ chip,
   `supplyMode` on the detail wire.

**Waits, each named:** W1 the two-cart handoff (profile selection is
silently dropped by the booking wizard — sessionStorage cart vs localStorage
cart never meet; its own campaign, the parked commerce-framing question).
W2 PLATFORM_SELLS as actual commerce (charging samagri online = payment
math = ruling first). W3 legacy-column retirement migration (Isj's hand).
W4 `canBringSamagri` derive-or-retire. W5 the push-created-tables migration
drift (pre-existing, सत्यापन flag). **W1 and W2 are the only two that touch
payment math — everything in S1-S4 leaves every rupee formula untouched.**
