# TRACK 2A — OPTION A MIGRATION PLAN

**Ruled: OPTION A** — the pandit wizard also writes what the customer reads.
**This is the pre-build report. Nothing here is built.** Build begins on Isj's word.

---

## 0 · 🔴 THE FINDING THAT CHANGES THE SHAPE OF OPTION A: THERE IS NO ENUM

The order says *"the enum picker."* **No enum exists.** Both columns are bare
`String`:

```
PujaService.pujaType   String   // "Vivah", "Griha Pravesh" etc.     ← schema's own comment
DakshinaRate.pujaType  String   // e.g. "SATYANARAYAN"               ← schema's own comment
PoojaConfig.poojaType  String
PoojaVerification.poojaType String
```

**The two sides do not merely use different tables — they use different VALUE
CONVENTIONS, and the schema documents both without reconciling them:**
`SCREAMING_SNAKE` on the pandit side, Title-Case display strings on the customer
side. Even the *column name* differs: `poojaType` vs `pujaType`.

> **BRIDGING THE TABLES WITHOUT BRIDGING THE VALUES PRODUCES ROWS THAT STILL DO
> NOT MATCH.** A wizard that writes `PujaService.pujaType = "SATYANARAYAN"` while
> the filter and the seed say `"Satyanarayan Katha"` has moved the schism one
> table to the right, not closed it. **The canonical vocabulary is the first
> deliverable of Option A, not a detail inside it.**

**The de-facto vocabulary already exists** — 8 keys, with Devanagari labels, at
`apps/pandit/src/lib/strings.ts:354-362`. It is a UI label map, not a type. *(It
is also exactly the "8 ceremonies" the canon's Home screen promises.)*

| enum value | Devanagari label |
|---|---|
| `SATYANARAYAN` | सत्यनारायण कथा |
| `GRIHA_PRAVESH` | गृह प्रवेश |
| `VIVAH` | विवाह |
| `MUNDAN` | मुंडन |
| `NAAMKARAN` | नामकरण |
| `HAVAN` | हवन |
| `RUDRABHISHEK` | रुद्राभिषेक |
| `SHRADH` | श्राद्ध / पिंडदान |

**Proposed:** promote this to `packages/types` as the single canonical list —
`PUJA_TYPES` (values) + `PUJA_LABELS_HI` (Devanagari) + `PUJA_LABELS_EN` (Roman,
for the English-first customer app: *Griha Pravesh*, *Satyanarayan Katha* — ritual
vocabulary in Roman script, per the canon's language ruling). **Both apps and the
API import it; nobody re-types a string.** Kept a TS union + `String` column
rather than a Prisma enum, so adding a puja stays a code change, not a migration.

---

## 1 · WHAT THE MIGRATION TOUCHES

### M1 — `PujaService` gains a compound unique **(required)**
```prisma
@@unique([panditProfileId, pujaType])   // absent today
```
Without it the wizard's write must be `findFirst`-then-branch, which races. Today
`PujaService` has only `@@index([panditProfileId])` and `@@index([pujaType])`.

**Pre-flight:** the constraint fails if duplicates exist. **Dedupe first, keep the
newest per pair.** Expected count today: **near zero, because only the seed ever
wrote this table** — but the check runs before the constraint, not after, and its
result gets reported rather than assumed.

### M2 — `PujaService.durationHours` needs a source
It is `Float`, **non-nullable, no default**, and **`PoojaConfig` has no duration
field at all.** So a wizard-written row has nothing to put there. Three ways, one
recommended:

| | approach | verdict |
|---|---|---|
| **a** | make it nullable, render "duration not stated" | **recommended** — honest absence; the customer app already handles nulls elsewhere |
| b | ask for duration in the wizard | new question on a screen the pandit already finished; a product change, not a migration |
| c | default it to a constant | **rejected — fabricated-not-empty.** A made-up "2 hours" on a public profile is exactly the class this campaign spent J4 deleting |

### Rows written per wizard submit (Option A)
| table | today | after |
|---|---|---|
| `PoojaConfig` | ✅ written | unchanged |
| `PoojaVerification` | ✅ written | unchanged |
| `SamagriPackage` | ✅ written | unchanged |
| **`PujaService`** | ✗ | **upsert — `pujaType`, `dakshinaAmount`, `isActive:false`** |
| **`PanditProfile.specializations`** | ✗ | **add the value if absent** |

**`isActive: false` on create is the whole trick.** All three customer read paths
already filter `isActive:true`, so a newly added pooja is **invisible until
approved** — and the admin approve handler gains the one line it is missing:

```
approvePoojaVerification → also set PujaService.isActive = true for (pandit, poojaType)
```

> That single line turns the notification *"अब यह बुकिंग के लिए उपलब्ध है"* from a
> claim into a fact. **Today the admin does the work, the pandit is told he is
> bookable, and nothing on the customer side changed.**

`rejectPoojaVerification` sets it back to `false` — symmetric, and it makes
un-publishing possible, which today it is not.

---

## 2 · `DakshinaRate` — what happens to the existing rows

`DakshinaRate` already has `@@unique([panditId, pujaType])`. It is a **third**
price column for the same (pandit, puja) pair, written by readiness R1 and the
rate-edit screen, and **read by no customer surface.**

**Recommendation: DO NOT migrate or drop it in this batch. Leave it, and make it
a mirror rather than a rival.**

- The wizard/R1 write path writes `PujaService.dakshinaAmount` **and**
  `DakshinaRate.amount` from the same input in the same request.
- `PujaService` becomes the **single customer-facing source of truth**;
  `DakshinaRate` stays as the pandit-side record until D (collapse) is ruled.
- **Backfill:** copy `DakshinaRate.amount → PujaService.dakshinaAmount` for every
  existing rate whose pandit has no matching `PujaService` row. That is the step
  that makes today's real pandits priced rather than free.

**Why not drop it now:** `my-poojas/page.tsx:84` already merges `dakshinaRates`
over `pujaServices` client-side — **the pandit's own screen is compensating for
the disagreement.** Dropping the column and rewriting that screen in the same
batch would change the reader and the writer at once, and a regression could not
be attributed to either.

### 🔴 §C OBLIGATIONS — the backfill mints rows on test data

The backfill is not neutral for the ledger. §C row 6 is a **live `DakshinaRate`**:
row-2 profile + `SATYANARAYAN` @ ₹2,100. A backfill **creates a new
`PujaService` row against §C row 2** — a row minted by a migration rather than by
a walk.

**Therefore, stated before the build:**
1. Any backfill run against production **logs its created rows in §C at the
   moment of the act**, exactly as a walk does. A migration is an act.
2. **§C row 2 is still under the ordered law** — *run the F-J7-2 control →
   un-verify → delete*. The backfill adds a row to that pandit; it does **not**
   change the order, and the new `PujaService` row joins the same cleanup.
3. The backfill must be **idempotent and re-runnable** (upsert on the M1 unique),
   so a partial run is recoverable without hand-deleting rows.

---

## 3 · THE WIZARD PICKER

**It already exists and already uses these 8 values** — `readiness/page.tsx` and
the add-pooja wizard render the Devanagari labels from `strings.ts`. Option A
changes **what the submit writes**, not what the pandit sees. **No new screen, no
new question** (given M2a).

### अन्य → REQUEST — PENDING ISJ'S CONFIRM, NOT ASSUMED

The pandit side **already supports a custom puja**: `PoojaVerification` carries
`poojaName` and `poojaDescription`, with the schema comment *"custom pujas: the
pandit's own name + description (admin-approved too)."*

The unresolved half is the customer side: **a custom puja has no canonical value,
so it cannot join `PUJA_TYPES`, cannot be filtered, and cannot be searched.**
Three shapes, none chosen:

| | shape | consequence |
|---|---|---|
| **i** | `poojaType = "OTHER"`, display name from `poojaName` | it appears on his profile, never in a filtered search — **honest but unfindable** |
| **ii** | admin promotes a custom puja into `PUJA_TYPES` on approval | findable, but every approval becomes a schema-vocabulary decision |
| **iii** | अन्य is a **request**, not a puja: it files an admin ticket and adds nothing until (ii) happens | slowest for the pandit, cleanest vocabulary |

**Recommendation: (iii), and it is what "अन्य→REQUEST" already implies** — but the
customer-side consequence above is **Isj's to confirm before I build any of it**,
because it decides whether a pandit's custom puja can ever be booked.

---

## 4 · THE KILL-LIST FOR "STARTING FROM ₹0"

Four sites, all in the **live** tree, plus one caveat:

| # | file:line | what it does | replacement |
|---|---|---|---|
| 1 | `apps/web/app/pandit/[id]/page.tsx:67-69` | `lowestPrice = pujaServices?.length > 0 ? Math.min(...) : 0` | **`: null`** — absence, not zero |
| 2 | `apps/web/app/pandit/[id]/BookingCTA.tsx:34` | `₹{lowestPrice}` under "Starting from" (mobile) | render the price **only** when non-null; otherwise no "Starting from" block at all |
| 3 | `apps/web/app/pandit/[id]/BookingCTA.tsx:47` | same, desktop | same |
| 4 | `apps/web/app/pandit/[id]/ServicesTab.tsx:43` | `samagriStartPrice … : 0` | **same defect, second commodity** — a zero samagri price is as invented as a zero dakshina |

**The rule the replacement encodes:** *a price is either known or absent; **zero is
neither**.* Zero is a number a customer can act on and a pandit can never be paid.

**Caveat, measured:** `apps/web/app/search/page.tsx:3` imports `SearchClient` from
`../../src/app/search/search-client` — **the live `/search` route reaches into the
condemned `apps/web/src` tree.** So the condemned-tree ruling on Isj's desk is not
merely about dead code: a live customer route depends on it, and any price fix
there lands in a tree marked for deletion. **Flagged, not touched.**

---

## 5 · BUILD ORDER, ON ISJ'S WORD

1. `PUJA_TYPES` + labels into `packages/types`; both apps and the API import it.
2. **M1** dedupe-check → compound unique. **M2a** `durationHours` nullable.
3. Wizard + R1 submit also upsert `PujaService` (`isActive:false`) and add to
   `specializations`; same request, same input as `DakshinaRate`.
4. Admin approve/reject flips `isActive` — the missing publish action.
5. Backfill `DakshinaRate → PujaService`, idempotent, **§C logged at the moment of
   the act**.
6. Kill-list §4: `: 0` → `null` on all four sites, absence rendered honestly.
7. Guards: the vocabulary is single-sourced; `isActive:false` on create;
   approve flips it; **and no surface renders a zero price** — per the G2 rule,
   each new guard leaves the file with `proveMatchers` + `proveSaw`.

**Two items still Isj's before step 1:** the **अन्य→REQUEST** customer-side shape
(§3), and confirmation that **`DakshinaRate` stays** rather than being collapsed
now (§2).

---

**STOPPED — this is the plan.** Build begins on Isj's word.
