# STRICT VERIFICATION OF THE DOCUMENTATION-REVIEW REGISTER (2026-08-04)

**What was checked:** every row of the pasted register — Part A's 17
conflicts, Part B's 22 test queues, Part C's 14 "missing from both
documents" claims, Part D's 10 recommended rulings — against the code,
the guard suite, the migration lineage, the campaign ledgers, git
history, and (for Part C) the two source .docx files themselves.

**Method:** 15 read-only verification agents, one dossier each, 1,033
tool calls. Strict rules: a SHIPPED claim needed a citation; an ABSENT
claim needed a multi-angle hunt with the patterns recorded; an
UNVERIFIED claim had to be resolved statically or renamed
CANNOT-VERIFY-STATICALLY with the exact missing measurement named.
Zero writes to the repo; no live endpoint called.

## THE TALLY

| verdict | rows |
|---|---|
| CONFIRMED — label correct, evidence in hand | **211** |
| MISLABELED — the label itself is wrong | **67** |
| PARTIALLY-WRONG — label defensible, prose contains a factual error | **57** |
| CANNOT-VERIFY-STATICALLY — needs a live measurement | **1** |
| **total** | **336** |

Plus **95 findings the register missed**, of which 11 are live
customer- or money-facing defects.

**The headline: the register is ~63% accurate, and its errors are not
random.** They cluster in three shapes — (1) the money premise is one
ruling out of date, (2) "ABSENT" is used for things that are built, and
(3) "SHIPPED" is used for kills executed on one reader out of three.
Shape 3 is the campaign's own named failure mode (F-B3-5, *a kill
executed on one reader is a kill reported*), recurring inside the
document written to catch it.

---

# §0 · THE PREMISE THAT INVERTS — READ THIS BEFORE ANY MONEY ROW

**A1, Q8-01, Q8-02, Q8-04, Q19-02 and D-1 all rest on "the ruling in
force is 10% commission, single-sourced." There is no commission.**

Ruling #7 (`docs/spec/CONFLICT_RULINGS.md:202-250`, final, Isj
2026-07-21, shipped to main at `bf1797e`) reversed the direction: the
pandit keeps **100%** of the dakshina — कोई कटौती नहीं — and the 10% is a
**separate charge the customer pays on top**. The code enforces exactly
that: `services/api/src/utils/pricing.ts:96-99` computes
`platformTransfersToPandit = dakshina + travel + food + accommodation`
with the fee never subtracted.

Three consequences for the register:

1. **A1's arithmetic is wrong twice.** Platform take went 15% → 10%, so
   doc revenue is overstated by **~33%, not ~50%**. And the doc's
   *pandit-side* economics are wholly wrong (it assumes he nets 85%; he
   nets 100%) — that changes supply-side assumptions, not just a
   revenue line.
2. **Q8-02 is not an open conflict.** "Corrected or knowingly
   overridden" is satisfied twice over — Ruling #7 with a named decider
   and a reopening clause, plus `docs/spec/DEVIATIONS.md:29-51` S-01.
   Carrying it as CONFLICT double-counts A1 and makes the register look
   like it has an unresolved money dispute when it has a documented
   decision.
3. **D-1 asks for a ruling that exists.** What is still owed is the
   **doc correction** — docA ¶450/470/836/924-925 say 15%, and
   ¶993/¶1009 go further ("Dakshina Commission: Charged to the Pandit
   (e.g. 15-30%)"). Note docB ¶152 already had the *direction* right
   ("paid by customer as separate line item"), only the rate wrong.

**And the rate is no longer a constant.** `constants.ts:88-106` resolves
`PLATFORM_FEE_PERCENT` from the environment. See §5's first finding for
what that does to the "guard fails the build on drift" claim.

---

# §1 · PART A — THE 17 CONFLICTS, VERDICTED

| row | verdict | the correction |
|---|---|---|
| **A1** commission | PARTIALLY-WRONG | §0. Conflict survives on a different axis; ~33% not ~50%; "commission" is the wrong word |
| **A2** Verified-Vedic badge | PARTIALLY-WRONG | Ruling real and recorded — but the row's premise ("no identity badge renders customer-side") is **false today**: `apps/web/app/dashboard/favorites/page.tsx:127` still renders `✓ पहचान` |
| **A3** video as gate + competence | PARTIALLY-WRONG | Two errors. The competence judgment is **not dead** — it moved to the Video-KYC identity checklist (`apps/admin/.../pandits/[panditId]/page.tsx:247` "Mantra pronunciation is clear and correct") where it **hard-gates identity approval**, i.e. the door that gates listing. Worse than the per-pooja gate the ruling killed. Also "listing on declaration" is itself superseded by the items gate |
| **A4** items optional | **CONFIRMED** | predicate, migration and guard all verified |
| **A5** PLATFORM_SELLS asked | PARTIALLY-WRONG | Tile dead + W2 comment confirmed; but the enum is **not in packages/types** — it lives in Prisma plus a hand-written local union in the wizard, coupled by nothing |
| **A6** consultation model | PARTIALLY-WRONG | Wallet: zero code, correct. **Per-minute is not gone** — a ₹20-50/minute earnings promise still sits in `voice-scripts.ts:350` and `tutorial-translations.ts:166-169` (dormant, not deleted) |
| **A7** ₹499 returns | **CONFIRMED** | zero controls in the live tree |
| **A8** Muhurat Explorer | PARTIALLY-WRONG | Cut from **Home** only. `apps/web/app/muhurat/page.tsx` is a **live route in the global nav and the sitemap** — honestly rebuilt (fabrications deleted, ERROR≠EMPTY), but the register's prose implies it is gone |
| **A9** live tracking | PARTIALLY-WRONG | Map + ETA kill confirmed. **"I'm Here" is shipped end-to-end** — pandit tile → `POST /pandit/bookings/:id/journey` → `PANDIT_ARRIVED` → customer sees "🙏 Pandit has arrived!" |
| **A10** device on public profile | **CONFIRMED** | and already decided the F6 way in code — `public-pandit-projection.test.ts:71-73` BANS deviceInfo/deviceOs/deviceModel |
| **A11** food allowance authorship | PARTIALLY-WRONG | The F/T/S design does **not** rule pandit-set wins — §3 is "report only", W-F2 defers it to a ruling. Code sides with the **platform**: `FOOD_PER_DAY = 1000` and live copy "Platform policy: non-negotiable at ₹1,000/day" |
| **A12** penalty formula | **CONFIRMED** | and cleanly: no penalty code exists at all |
| **A13** hidden samagri margin | PARTIALLY-WRONG | No spread exists in code (hunted sourcingPrice/costPrice/margin/spread/markup — nothing). But the counter-claim is false: **the tutorial does not disclose the fee**. Disclosure is reactive (शिष्य FAQ) plus a passive earnings label |
| **A14** "instant payment" | **CONFIRMED** | — and the sweep found live violations, see §5 |
| **A15** ratings-first | PARTIALLY-WRONG | Two errors: the ruling **"A HEADING IS A CLAIM" does not exist in the repo** (0 hits); and star-zero is killed on the card only — it renders live on `/pandit/[id]` and `/dashboard/favorites` |
| **A16** ₹9,999 backup | PARTIALLY-WRONG | Understates by a class. It is **not prose** — it is a live priced checkbox in the booking wizard, purchasable now |
| **A17** team size | MISLABELED | **The team-size field is shipped**, per-pooja, three layers deep, guard-pinned. Only the split and the customer-visible count are absent |

---

# §2 · PART B — THE TEST QUEUES

**211 rows confirmed** and not restated here. Below is every row whose
label or prose was wrong, grouped by what the error would cost.

## 2a · "ABSENT" on things that are BUILT — the expensive direction

A builder acting on these would rebuild shipped code, or build a second
divergent copy of a live money model.

| row | claimed | truth |
|---|---|---|
| **Q9-19** self-drive ₹12/km | ABSENT | **SHIPPED** — `SELF_DRIVE_RATE_PER_KM = 12`, applied in travel.service.ts, paid through to the pandit, and **promised aloud** by शिष्य with a guard. The most dangerous row in the register |
| **Q22-06** GST on pandit's behalf | ABSENT | **SHIPPED, guard-enforced** — `payment-money.test.ts:55` fails the build on any tax line. Marking an enforced prohibition as a gap invites someone to "close" it by breaking the ruling |
| **Q12-06** start/stop prompts | ABSENT | **PARTIAL** — the 3-step voice-wired journey ladder ships; only the timer is missing |
| **Q11-02** split samagri | ABSENT | **PARTIAL** — a pre-booking list ships; what is missing is a *data shape* (per-item ownership), not a screen |
| **Q17-04** travel/food/stay at checkout | ABSENT | **PARTIAL** — the customer's controls are built and priced; what is absent is the **pandit's** preferences reaching her |
| **Q17-05** accommodation multi-day | ABSENT | **PARTIAL** — control exists; the estimate is never multiplied by nights, defaults to ₹3,000, and is charged never |
| **Q17-11** Patrika / documents tab | ABSENT | **PARTIAL** — both are live; two of four cards are `alert()` stubs and the Patrika carries a fabricated VERIFIED rubber stamp |
| **Q20-11** SOS | ABSENT | **PARTIAL** — built, dials a real 24/7 number, and *deliberately* refuses to claim an SOS was sent. Calling it absent invites restoring the false safety promise it was written to avoid |
| **Q18-11** revoke / de-verify | ABSENT | **PARTIAL** — an unconditional REJECT button on a VERIFIED pandit **is** a de-verification. The risk is inverted: unlabelled and one click deep, not absent |
| **Q3-17** de-verify (identity dossier) | doc gap | Same. Expiry/re-verification genuinely absent; **the act exists**. Restate as "a de-verify ACT with no de-verify POLICY" |
| **Q14-12** team auto-split | ABSENT (named future) | **RULED OUT** — शिष्य tells pandits they pay their own sahayaks, guard-pinned. A ruling, not a backlog item |
| **Q14-14** refund flow | ABSENT | **SPECIFIED and partly built** — and the real defect is worse, see §5 |
| **Q15-07** pandit rates customer | ABSENT | **SHIPPED (write-only)** — `CustomerRating` exists in production with punctuality/hospitality/conduct fields. Isolation holds *by accident* — no reader has been written and no guard says one may not be |
| **Q4-01** device capture | ABSENT | **PARTIAL** — schema + authenticated write route exist, dormant; no caller, no admin display |
| **Q20-02** DPDP | ABSENT | **PARTIAL** — the consent record is built and guard-enforced; notice/purpose-limitation/erasure absent |
| **Q22-01** mid-journey second booking | ABSENT | **PARTIAL** — a same-day block exists but omits every travel/in-progress status, i.e. it evaporates exactly when X-1 needs it |
| **Q12-02** double-book | UNVERIFIED | **PARTIAL** — see §5; reachable through `PANDIT_REQUESTED` |
| **Q13-01** pandit cancels | ABSENT | **PARTIAL** — reason + notification exist on both paths; `cancelledBy` is not written on one of them, destroying the attribution the whole penalty design needs |
| **Q8-10** blackout dates | ABSENT | **PARTIAL** — model, routes, calendar UI and search filter all exist; **only booking-creation enforcement is missing**. One query beside the existing conflict check |
| **Q8-09** price lock | ABSENT | Festival clause moot, but **price-lock-at-initiation is one of the best-built properties in the money layer** — `feeSnapshot.ts` + a frozen column + a guard that sets the env to 25% and proves stored rows do not move |

## 2b · "SHIPPED" on kills executed on ONE reader — the recurrence failure

Every one of these is the F-B3-5 shape. The ruling is real; the kill
landed on one file; a second or third reader still ships the defect.

| row | the survivor |
|---|---|
| **Q3-05** Aadhaar badge, "7 surfaces" | An **8th** is live: `dashboard/favorites/page.tsx:127` `✓ पहचान`. Same file also renders raw `specializations` chips, breaking the card-may-only-promise-what-the-filter-can-keep ruling. One file, two ruled kills alive |
| **Q15-01** never ⭐0.0 (0) | Live on `/pandit/[id]:93-97, :238-240` and `/dashboard/favorites:131`. The same page says "No reviews yet" and "0.0 Rating" 200px apart |
| **Q15-04** zero experience renders nothing | Live: "0+ Years Experience", "0+ Ceremonies" on the profile; "0 years experience" on favorites. **Fires on 100% of today's inventory** — both pilot pandits have 0 |
| **Q16-16** terms/about over-claims killed | **Both still render verbatim.** terms:32 "credential verification" (nothing checks credentials anywhere); about:44 "only highly educated and respected Acharyas". This is the **terms of service** — a contractual representation about vetting. Should be C, not H |
| **Q16-12** self-praise killed | The Devanagari line is dead; "Trusted by Thousands of Families" and "Join thousands of families" survive in English directly above the fabricated-stat tiles |
| **Q16-03** Search-All-India | Killed on `/search`; **the dead toggle still renders on the home page** with no onClick and no consumer |
| **Q16-08** error≠empty everywhere | The instrument is excellent and type-enforced — and imported by **three files**. The front door collapses error into "No Pandit jis to feature yet" |
| **Q18-03** expired admin session | Fixed on the **ceremony-video tab only**. The identity tab renders the error banner and "No submitted documents awaiting review." *simultaneously*, over pandits waiting on a decision |
| **Q8-05** money type floor | C1 is genuinely ruled — and **unguarded and violated**: fee at 11px on BookingCard, fee in `hpj-label` (12.5px) on PanditCard. Root cause: `apps/web` has **no test files at all** |
| **Q19-05** ₹0 rendered nowhere | The unset-rate-in-words leg is solid. The universal claim is enforced incident-by-incident; `pandit.routes.ts:468` `|| 0` renders ₹0 payouts for four production rows |
| **Q6-01** no video → no badge, no warning | An amber "पूजा सत्यापन बाकी" chip renders in the unconditional else-branch — a pooja that never had a video is told a review is outstanding |
| **Q6-03** unreviewed video impossible | True today, **ungrarded** — deleting `approved &&` leaves every test green, and the nearest guard still asserts the *superseded opposite* law in its own message |

## 2c · Rows where "Ruled" or "Design ruled" is unsupported

The load-bearing word is the one that fails. These claim a founder
decision the record does not contain.

- **Q12-14** panchang "deferred post-pilot **by ruling**" — no such ruling exists. `CONFLICT_RULINGS.md` carries #1–#11 plus GST; none concerns panchang. The ledger leaves it explicitly open.
- **Q15-10** Delhi-NCR frame "Ruled" — the ledger says *"Isj rules whether the crop argument survives"*. Never ruled.
- **Q16-11** serviceless pandit "Ruled" — filed as a decide-or-go question, undecided; a serviceless pandit **still appears in unfiltered browse**. The row conflates this with the items gate, which governs poojas not pandits.
- **Q9-02 / Q9-08** "Design ruled" — both are §3 content of a report whose header says *"report only. Isj voice-checks §3."* The register gives a third §3 row (Q9-09) the correct label, so one document section carries three different statuses.
- **Q10-11 / Q10-13** — the rulings exist; the *specific* claims ("first-class path", "the pujaType enum") do not. See §5 for why Q10-13 matters.

## 2d · UNVERIFIED rows resolved (no live measurement needed)

**Resolved to SHIPPED:** Q1-07 (language is proposed, never auto-committed — guarded), Q1-17 (two-stage delete confirm, guarded), Q3-15 (Aadhaar AES-256-GCM — though *encrypted*, not hashed: `decryptAadhaar` exists), Q5-11 (price snapshotted, guard-pinned), Q17-10 (contacts contextual + optional + honest degradation), Q5-07, Q5-02 (SHIPPED but **eight sequential per-pooja transactions, deliberately not one**).

**Resolved to ABSENT:** Q1-01 (the two-door screen exists but is **orphaned** — nothing routes to it, and its customer card has no onClick), Q2-01 (the pandit app collects **city only**; `PanditProfile.fullAddress` has no writer).

**Resolved to PARTIAL:** Q1-10, Q1-12 (keyboard opens at failure **3**, not 2 — but never a dead end, so C over-grades it), Q1-14 (8s floor real; the 12s elderly branch is **unreachable — no elderly flag exists**), Q1-15 (field values and menus confirm; **plain screen commands fire immediately** — a background TV saying "ऑफलाइन" toggles a pandit offline with no confirmation), Q2-02, Q2-04, Q2-13, Q20-01, Q20-12, Q22-09, Q22-10, Q6-09, Q12-02, Q14-03.

**Re-graded:** Q2-05 (map-fails-on-low-end-Android, H) → **no failure mode exists**; the "map" is a decorative CSS box with no library, guard-pinned. Re-grade L or fold into Q2-04.

**The one row static analysis cannot settle: Q20-08.** Bucket privacy is a Cloudflare R2 dashboard setting, not repo state. The code is consistent (no ACL on put, presigned reads only). **The measurement that would settle it:** an unauthenticated GET against a raw R2 object URL for a known Aadhaar key — a 403/404 there while the presigned URL returns 200 confirms it.

---

# §3 · PART C — THE SOURCE DOCUMENTS WERE FOUND AND READ

Both live in `C:/Users/Lenovo/Downloads`: doc (a) 1,079 paragraphs, doc
(b) 2,236 including table cells, Features 1-52 and X-1..X-10 all
present. Extracted read-only to scratchpad; the repo was not touched.

**Critical method note: both docs are romanized Hinglish, not
Devanagari.** Any absence-hunt that greps वापसी or बेटा returns a false
ABSENT.

**Confirmed unwritten (7):** C-2 de-verification · C-3 dispute
resolution · C-4 DPDP mechanics · C-8 accessibility · C-11
customer-side cancellation · C-12 rounding/paise · C-13 test-data and
pilot boundaries.

**Wrong or overstated (7):**

- **C-1 refund** — the *booking-level* claim holds, but "no refund arithmetic/timeline/partial rule" is false: docB carries partial-refund arithmetic on five surfaces (¶1768 `Aanshik Bhugtan = (completed/scheduled) × dakshina`, ¶1583 min-billing auto-refund, ¶1940, ¶2018) and docA ¶655 trip-cancellation insurance.
- **C-5 vendor outage** — **all three named examples are written.** docB ¶1383-1386 (payment gateway → "display SLA as 'within 4 business hours' not 'instant'"), ¶573-574 (UIDAI down → queue + offline e-KYC XML), ¶305 (SMS backup if WhatsApp fails). What is genuinely unwritten: any *platform-wide* degradation policy — no status page, no RTO/RPO, no vendor-SLA table, no owner who declares an outage.
- **C-6 support** — three of four sub-claims fail. docA ¶644-648 gives a number, 24/7 hours and a 30-second answer SLA; ¶640 names the staffing. Only "which languages" is absent — plus the observation that `1800-TRAVEL-PANDIT` is a 13-character mnemonic, not a dialable number.
- **C-7 assisted onboarding** — **written, and first-class.** docB ¶2156-2180 is a three-column matrix whose third column is "Parivaar Ke Saath". Re-scope the row to what *is* missing: consent/authority, liability, and any audit trail separating pandit-authored from family-authored acts — which matters because the same family member films the KYC video.
- **C-9 first booking** — in-app hand-holding is written on both sides (docA ¶851, ¶938). The **human** safety net is not. And docB's only first-bookings artefact points the other way: ¶1258 levies a ₹500 deposit *on* the new pandit.
- **C-10 multi-day** — multi-day is a first-class modelled predicate on the money path in docA. The three parenthetical sub-claims survive and should become the row.
- **C-14 "verified"** — the count is an **undercount: at least seven senses**, including "verified bookings" as a volume counter gating referral bonus, deposit and rating weight. That one is the most dangerous: it wears the trust word while meaning nothing about trust.

**The systematic risk in Part C's framing:** "unwritten in both docs" is
being read downstream as "undesigned in the product". For C-1 and C-11
that inference is **false** — `refund-policy.ts` carries a complete
customer-cancellation design under founder rulings 2026-07-23, guard-pinned
and wired into two routes. The docs are behind the code. Part C rows
need an explicit *code status* column.

---

# §4 · PART D — SIX OF TEN PREMISES ARE STALE OR WRONG

| # | premise | verdict |
|---|---|---|
| **D-1** commission 10% stands | **ALREADY RULED** (§0). Only the doc correction is owed, and "commission" is the wrong word |
| **D-2** penalty bound by earning | **CONFIRMED OPEN** — no penalty code, no penalty ruling |
| **D-3** backup off customer surfaces | **CONFIRMED OPEN** — and more urgent than stated: it is purchasable today |
| **D-4** consultation fee | **CONFIRMED OPEN** |
| **D-5** device admin-only | PARTIALLY-WRONG — the doc-vs-doc conflict is real, but **F6 already won in code and is guard-pinned**. What is owed is a doc correction, not a ruling. Residue: `apps/web/app/pandit/[id]/page.tsx:47` still destructures `deviceModel`/`deviceOs` and renders neither — a trap for anyone "fixing" the unused variable |
| **D-6** food allowance pandit-set | **CONFIRMED OPEN** — and the register contradicts itself: Q9-10 asserts "(F13 wins)" while Q9-12 correctly calls the same question OPEN |
| **D-7** samagri margin | **CONFIRMED OPEN** (no spread in code; the doc's line stands) |
| **D-8** video rubric fair-sample | **STALE — already ruled** 2026-08-03, guard-pinned, and shipped in the reviewer UI verbatim. What is stale is the **doc**. Retire D-8; replace with a doc-correction item |
| **D-9** "verified" → one meaning | **ALREADY RULED, THE OPPOSITE WAY.** `Verification.tsx:5-27` — दो सत्यापन, "these two things are NOT the same claim and must never be able to collapse into one tick", canon-sourced and type-enforced. Reducing to one meaning would **violate a shipped law** that exists because a single `verificationStatus === "VERIFIED"` once drew both seals. What remains is two over-claim kills, not a ruling |
| **D-10** refund + dispute + de-verification | PARTIAL — **refund is ruled, designed and shipped.** Re-title "dispute + de-verification". De-verification is the harder of the two: `VerificationStatus` has no state below VERIFIED, so it needs a **migration**, not only a policy |

---

# §5 · WHAT THE REGISTER MISSED — 11 LIVE DEFECTS, RANKED

These are not label disputes. Each is shipped, reachable, and wrong.

### 1 · `encrypt()` only base64-encodes — every bank account number is one `atob()` from plaintext
`services/api/src/controllers/onboarding.controller.ts:18` defines
`function encrypt(text) { return Buffer.from(text).toString('base64') }`
and calls it at :268 for `bankAccountNumber`; `readiness.controller.ts:328`
does the same inline. **Fourteen lines below**, the same write block
calls real AES-256-GCM for Aadhaar. This is more dangerous than
plaintext, because the identifier reads as protection to a reviewer, to
this register, and to whoever answers a due-diligence questionnaire.
Q20-01 and Q22-09 both assume PII-at-rest is one undifferentiated
question.

### 2 · The refund path fabricates its own success
`payment.service.ts:101-112` — `initiateRefund` **never calls Razorpay
in either branch** and returns `{ refundId: "rf_" + Date.now(),
refundAmount: 0 }`. That fabricated id is persisted as `refundReference`
with status PROCESSING, the admin is told "Refund initiated", and the
customer is SMSed "Refund ₹X will be credited in 5-7 days". The id is
shape-identical to a real Razorpay `rf_...`, so an operator reconciling
against the dashboard finds a reference that exists on our side and
nowhere else. **This is MONEY MAY FAIL, BUT NEVER SILENTLY — on the
outbound side.**

### 3 · Two live OTP route families; the legacy one accepts `123456` unconditionally
`auth.routes.ts` registers both `/request-otp|/send-otp|/verify-otp`
(legacy) and `/otp/send|/otp/verify` (Redis). The legacy verifier at
`auth.controller.ts:102` accepts `"123456"` for any phone **with no
environment gate at all** — not a dev-mode backdoor, unconditional.
**The `hold/otp-hardening-v2` merge must also delete or disable the
legacy family, or the hardening is cosmetic.**

### 4 · Booking price is client-supplied and never reconciled
`booking.routes.ts:41` validates `dakshinaAmount: z.number().int().positive()`
and passes it verbatim into the snapshot, the grand total and the
Razorpay order. Nothing compares it to the pandit's
`PujaService.dakshinaAmount`; nothing requires an ACTIVE PujaService for
the eventType. **A customer can POST `dakshinaAmount: 1` for a ₹2,100
pooja, and a pooja the items gate deliberately keeps dark is still
bookable by direct POST.** NO LIST, NO LISTING is a *directory* law, not
a *booking* law — a distinction A4/Q5-04 state as settled.

### 5 · The double-book guard misses every status it most needs
`booking.service.ts:165` filters `["CONFIRMED","CREATED"]`. Payment
capture moves a booking to **PANDIT_REQUESTED** — omitted. `acceptBooking`
has **no date check at all**. So booking B is created while paid booking
A awaits acceptance, and both reach CONFIRMED. The guard also never reads
`BlockedDate`, though the reverse direction *is* guarded. And it omits
TRAVEL_BOOKED / PANDIT_EN_ROUTE / PUJA_IN_PROGRESS — **the protection
evaporates exactly when the pandit is mid-journey**, inverting X-1.

### 6 · Removing a pooja does not unlist it
`auth.controller.ts:1641-1648` writes only `specializations` and
`pendingPoojaVerifications` — never PoojaConfig, never
`PujaService.isActive`. The customer card and `?pujaType=` read
PujaService. **The pandit is told the pooja is gone while customers can
still find and book him for it.** The well-built 409 active-bookings
guard protects a delete that is cosmetic customer-side. Because the
items gate gave `isActive` exactly one flip owner, the fix is a ruling
question, not a one-liner.

### 7 · The pandit alert is welded to payment capture
`notifyNewBookingToPandit` has **one call site** — inside
`processPaymentSuccess`. Online payment is not live. So every booking
that stops short of capture reaches the pandit through **zero automatic
channels**. Q12-01 frames this as delivery quality ("SMS stubs to
console" — itself stale; the stub is the no-credentials fallback).
It is a **reachability** problem: *never silent* is false by
construction, not configuration.

### 8 · Payout-timing Babel — five contradictory promises
Live pandit copy says **तुरंत** (parichay + referral screens), **24 घंटे**
(FAQ, two tutorial slides, a coach tip on /earnings), **48 घंटे** (the
*same two FAQ questions*, answered differently in a different string
block), and **दो से तीन दिन** (the earnings voice intro) — against
hand-made UPI transfers on no schedule. Exactly one surface is honest
(`payoutSoon`), and its comment shows the law was already found and
applied to one screen. **No scheduler exists that could honour any of
them.** This is the A14 sweep's real finding.

### 9 · The ₹9,999 backup is purchasable, and uncollectable by construction
`booking-wizard-client.tsx:1781-1790` — a real checkbox, priced into the
totals. But :614 routes it into `settledAtBooking`: **the customer owes
₹9,999 in cash to the very pandit whose non-arrival it insures against.**
No Booking column records it; the only trace reaching the pandit is prose
in `specialInstructions`. Escrow (Q13-13) is not unbuilt — it is
*unreachable* without moving the add-on into `payNow` first. **A second
one exists that the register has no row for: Nirmalya Visarjan ₹500**,
where nothing reaches the pandit at all. Together up to ₹10,499 per
booking for services with no fulfilment path. The ₹499 ruling was
written as a general law and applied to one of three siblings.

### 10 · A printable fabricated GST invoice ships in the admin panel
`apps/admin/src/app/b2b/invoices/page.tsx` is fully hardcoded — invented
invoice number `#HPJ-2023-894`, invented bank details `HDFC0001234`, and
working Print / Email / Download-PDF controls. With no invoice generation
anywhere in the API (Q14-09), this is a document that can be printed and
handed to a B2B customer as a tax invoice. Separately,
`notification.service.ts:256` SMSes every paying customer *"Invoice
aapke dashboard mein available hai"* for a document that is never created.

### 11 · The public list still ships the raw presence assertion
`pandit.controller.ts:291,407` — `GET /pandits` (anonymous, the
most-fetched public surface) returns `isOnline: p.isOnline` **raw**,
while the detail read at :652 derives it. The presence law was applied to
one read. `presence.test.ts` pins only the detail wire, so nothing
resists this. It is currently unrendered by the live customer tree —
which is why the +103s measurement was honest — but the API is public.

**Also live, one tier down:** fabricated tracking survives in
`apps/admin/.../helpline/page.tsx` (fake map, "Stuck in traffic 15km
away", "ETA: 45 mins") — the exact class the customer track page was
killed for, on the surface an ops person acts on. `/nri` is a wholly
fabricated live route ("Live 4K HDR Streaming Included", "5000+ Global
Families", a $1,069.00 checkout with a PayPal logo and no handler). The
sitemap advertises `/contact`, `/refund` and `/disclaimer` — three
guaranteed 404s, and the last two are exactly what a regulator or a
disputing customer looks for by name. A fabricated ceremony time
(`eventTimeSlot: b.muhuratTime || "10:00 AM"`) prints on the pandit's
calendar. And the bulk-declaration path posts
`supplyMode: "PANDIT_BRINGS"` for all eight poojas, **silently reverting
a LIST_ONLY answer** — the controller comment three files away asserts
the opposite is true.

## The structural finding beneath all of them

**Guard scope, not guard quality, is the defect.** Six separate laws are
enforced by a guard that walks one directory:

- `customerDesignFoundation.test.ts` scopes the entire CUT list (map, tracking, PDF, muhurat, ratings, chat) to `apps/web/components/design-system` — **it would not have caught the very page that was killed**, nor would it stop its resurrection.
- `payment-money.test.ts`'s banned-phrase loop reads the **landing page only** — which is why the ₹9,999 survives in the checkout.
- `commission-consistency.test.ts` reads `services/api` only — which is why four UI surfaces carry an unsynchronised `10%` literal while the rate is ops-configurable by env. **Set `PLATFORM_FEE_PERCENT=12` and customers are charged 12% while every screen says 10%, with a green build** (`feeLabel.test.ts` asserts `/10%/`, so it keeps passing while the label becomes a lie).
- `supportContact.test.ts` scopes to `apps/web` — the pandit app hardcodes the support number in three places.
- `customerDesign.test.ts` asserts the badge kill against **one file read by path** — which is how the 8th badge survives.
- `apps/web` **has no test files at all**, so every customer-facing law is enforced only by guards in `services/api` reaching across with `readFileSync` — and only where someone remembered to write one.

The codebase already diagnosed this exact class and wrote the lesson
down: *"a 15% rate survived in packages/utils because the money guards
watched only services/api… New guards go on BOUNDARIES by default"*
(`displayChargeBoundary.test.ts:21-27`). The lesson was never applied to
the rate, the phrase bans, the badge kills or the tracking kills.

**Dormant-but-live hazards worth one sweep:** `PLATFORM_COMMISSION_PERCENT`
defaults to **20** and is set in `.env.vercel` (zero readers — a
production-set commission constant at double the real rate);
`SAMAGRI_SERVICE_FEE_PERCENT` defaults to 8; `BACKUP_FEE_PAISE` to ₹500
against a ₹9,999 UI; `packages/utils/src/currency.ts` holds a complete
alternate GST-taxable fee engine with no callers; two exported copies of
the **retired** 90/50/20/0 refund policy survive; and
`packages/utils/src/pricing.ts` documents "Calculate 15% platform fee"
above a function that returns 0 and is exported through the barrel.

---

# §6 · THE CORRECTED RULING ORDER

Part D's list, rewritten against what is actually open. Items 1-4 are
live exposure; 5-7 are decisions; 8-10 are doc corrections that need no
ruling.

| # | what | why it moved |
|---|---|---|
| **1** | **The three priced-but-undelivered add-ons** — ₹9,999 backup, ₹500 visarjan, and the guard-scope fix that lets them survive | Purchasable **today**. D-3 named one of three |
| **2** | **`encrypt()` is base64** — bank numbers at rest | Not in the register at all. One `atob()` from plaintext |
| **3** | **The refund stub that fabricates a reference** | Outbound twin of the law already ruled inbound |
| **4** | **Booking-create integrity** — client-supplied price, no ACTIVE-service check, the PANDIT_REQUESTED double-book hole | Four C-severity holes in one handler |
| **5** | **Penalty bound by the pandit's own earning** (D-2) | Unchanged — still open, still contradicts the founding sentence |
| **6** | **Consultation fee: 10% or pass-through** (D-4) | Unchanged — blocks the paid limb |
| **7** | **Food allowance authorship** (D-6) | Genuinely open; the register contradicts itself across two rows |
| **8** | ~~Commission 10% stands~~ → **correct the doc's 15%** | Already ruled (#7). Doc-only |
| **9** | ~~Video rubric fair-sample~~ → **correct docB F8's five-parameter rubric**, and separately kill the mantra-pronunciation checkbox that hard-gates identity approval | Already ruled. The *live* item is the identity-gate survivor |
| **10** | ~~"Verified" to one meaning~~ → **kill two over-claims** (terms "credential verification", about "highly educated Acharyas") | Already ruled the opposite way — reducing to one would break a shipped law |

**Retired outright:** D-1, D-5, D-8, D-9 as *rulings* (all already
decided); D-10's refund third.

**Newly owed and unlisted:** a de-verification **migration** (there is no
state below VERIFIED), a no-reader guard on `CustomerRating`, and the
legacy-OTP-family deletion as a precondition of the hardening merge.
