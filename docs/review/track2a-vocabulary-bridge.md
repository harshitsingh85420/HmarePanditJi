# TRACK 2A — THE VOCABULARY BRIDGE (F-J9-1 / F-J9-2)

**Design report. Nothing built, no pixel touched.** Mapped 2026-08-01 across
`apps/pandit`, `apps/web/app`, `services/api`, `packages/db`.

---

## 0 · TWO CORRECTIONS TO MY OWN PREMISE, FIRST

**1 · The schism is TWO tables wide, not three.** I had filed `PoojaVerification`
as pandit-only. It is **customer-readable** — `pandit.controller.ts:290` derives
`verifiedPoojaTypes` on both list and detail. The genuinely orphaned writes are
**`PoojaConfig`** and **`DakshinaRate`**.

**2 · "R1 writes the overlap" is a client-side sequence, not a server path.**
`patchReadiness` step 1 only **reads** and validates (`readiness.controller.ts:123`);
the writes are two separate client calls from `readiness/page.tsx` — `PATCH
/pandit/profile` (:406) and `POST /pandit/dakshina-rates` (:416). **Two
round-trips, no transaction.**

**And the headline answer:** no single server-side code path writes both a
pandit-side table and a customer-readable one. **All eleven writers touch exactly
one side.**

---

## 1 · 🔴 IT IS WORSE THAN A SCHISM: THE READER'S TABLE HAS NO WRITER

`PujaService` — the table that carries **price** and drives the **pujaType /
price filter** — has three write paths, and **none is reachable from any running
client**:

| writer | status |
|---|---|
| `onboarding.controller.ts:155` (`POST /pandits/onboarding/step2`) | **dead** — no caller in any app. *And it hardcodes `dakshinaAmount: 0`* |
| `pandit.routes.ts:247` (`POST /pandits/me/services`) | **dead** — repo-wide grep for `me/services` hits only its own route file |
| `packages/db/prisma/seed.ts:352` | the seed |

> **The seed is the only thing that has ever populated `PujaService`. That is why
> demo pandits have prices and real pandits do not** — the demo data masks the
> defect it was meant to demonstrate.

### THE CONSEQUENCE, VERIFIED BY HAND IN THE LIVE TREE

For every real pandit `pujaServices` is `[]`. I read these three files myself
rather than trusting the sweep:

```
apps/web/app/pandit/[id]/page.tsx:67   const lowestPrice = pujaServices?.length > 0
                                         ? Math.min(...) : 0;
apps/web/app/pandit/[id]/BookingCTA.tsx:47   "Starting from"  ₹{lowestPrice}
apps/web/app/pandit/[id]/ServicesTab.tsx:151 "No services listed yet."
```

**A real pandit's public profile says "Starting from ₹0" and, on the same page,
"No services listed yet."** The page simultaneously claims he offers nothing and
that booking him is free.

> 🔴 **FABRICATED-NOT-EMPTY, at the sharpest possible spot: the price.** The
> `: 0` fallback invents a number where the honest answer is *"we don't have his
> rate yet."* Zero is not the absence of a price — **it is a price**, and it is
> the one number a pandit can never be paid.

**He is not invisible — he is visible, unfilterable and priceless.** The only
unconditional list gate is `verificationStatus` (identity KYC); he vanishes only
when a customer filters by `pujaType` or price (`pandit.controller.ts:170`),
because that filter runs against the empty relation.

---

## 2 · THE WRITER / READER TABLE

| table | written by | read by a customer? |
|---|---|---|
| **PoojaConfig** | add-pooja wizard (`my-poojas/add/page.tsx:216`) | **NEVER** |
| **DakshinaRate** | readiness R1 + rate-edit | **NEVER** |
| **PoojaVerification** | wizard + admin approve/reject | yes — `verifiedPoojaTypes`… **which no `apps/web` surface renders** |
| **PanditProfile.specializations** | readiness R1 *only* | yes — the card's chips |
| **PujaService** | **nothing live** | **yes — price + the pujaType filter** |

**The add-pooja wizard's complete write set is three calls** — samagri-packages,
pooja-config, pooja-verification. Finishing it leaves `specializations` and
`PujaService` untouched, which is the mechanism in one line.

### 🔴 AND ADMIN APPROVAL PROMISES WHAT THE READ PATHS CANNOT HONOUR
`approvePoojaVerification` (`poojaVerification.controller.ts:155`) updates
**only** the verification row — no `PujaService`, no `specializations`. Its
notification says **"अब यह बुकिंग के लिए उपलब्ध है."**

> **A DEADLINE-ON-NONEXISTENT-ACTION sibling: a promise of availability that no
> reader can deliver.** The admin does the work, the pandit gets told he is
> bookable, and nothing about his customer-facing rows changed.

Also: `SamagriPackage` is the **one** wizard-written table a customer can read
(`pandit.service.ts:38`). **Samagri prices cross the schism; dakshina does not.**

---

## 3 · THE BRIDGE OPTIONS, COSTED

| | option | migration | breaks | verdict |
|---|---|---|---|---|
| **A** | **Pandit wizard ALSO writes `PujaService` + `specializations`** | one — add `@@unique([panditProfileId, pujaType])` to `PujaService` (absent today) + dedupe existing rows | nothing; all three customer reads already filter `isActive:true`, so the admin gate is **free** | **RECOMMENDED** |
| B | Customer readers read the pandit-side tables | none | the wire shape — `PoojaConfig` has no `durationHours`/description, and `PujaService.durationHours` is non-nullable | rejected: aliasing a contract to avoid a write |
| C | Derivation / sync job | same unique as A | adds a second source of truth and a lag window | rejected: a sync job is a schism with a scheduler |
| D | Collapse the duplicate tables | large; `poojaType` vs `pujaType` column-name mismatch | most invasive | the *right* end state, not the next step |

**Why A, in one line:** it makes the writer write what the reader reads, needs one
unique constraint, and **`isActive:true` already exists on every customer read
path**, so the admin's approval becomes the flag that flips it — the publish
action the approval handler is missing today.

**Sequencing note:** `Booking` stores `eventType` as a bare string and
**snapshots** `dakshinaAmount` — there is no FK to `PujaService`
(`schema.prisma:433`), so any of these can land without cascading into booking
history.

---

## 4 · REPORT-ONLY — NOT MINE TO TOUCH

1. **🔴 The booked price is not server-authoritative.** `createBooking` writes
   `input.dakshinaAmount` straight from the request body
   (`booking.service.ts:202`), and the zod schema accepts any positive integer
   (`booking.routes.ts:41`). The server never consults *any* of the three price
   tables. **Money — reported, untouched.**
2. **The public list's `verificationStatus` is caller-controllable**
   (`pandit.controller.ts:127`): `?verificationStatus=PENDING` on a public,
   unauthenticated route enumerates un-KYC'd pandits. *Stated narrowly, because I
   withdrew F-J4-13 for over-claiming once: this is a **parameter** observation,
   not a claim that the route lacks a guard — the route is deliberately public.*
3. **The booking wizard's pandit list is not filtered by ceremony at all.** It
   sends `ritual=<name>` (`booking-wizard-client.tsx:467`); `getPandits` reads
   `pujaType`. Every VERIFIED pandit appears for every ceremony — kin to the dead
   filters F-J4-2/F-J4-4.
4. **`verifiedPoojaTypes` ships and renders nowhere.** The poojas a pandit
   actually got approved for never reach a customer's eye.
5. **`PoojaConfig` and `PoojaVerification` have no migration** — grep over
   `packages/db/prisma/migrations` finds neither. They reached production via
   `db push`, not `migrate deploy`.

---

## 5 · WHAT THE BRIDGE DOES **NOT** FIX — stated so it is not assumed

- **Readiness R5 writes `DOCUMENTS_SUBMITTED`, never `VERIFIED`**
  (`readiness.controller.ts:350`). A fully bridged pandit **still stays invisible
  until an admin flips KYC.** The bridge alone does not make a real pandit appear.
- The per-pooja **booking** gate was deliberately removed on 2026-07-29
  (`booking.service.ts:137`) — सत्यापन informs, it does not gate. **No option here
  restores it;** A's `isActive` governs discovery and price only.
- The pandit's own मेरी पूजाएँ screen already merges `dakshinaRates` over
  `pujaServices` client-side (`my-poojas/page.tsx:84`) — **evidence the two price
  tables were already known to disagree**, papered over at the last surface
  before the eye.

---

**STOPPED — this is a report.** The ruling on A/B/C/D is Isj's, and the ₹0
fallback in §1 is the one item I would ask him to rank first: it is customer-
facing, it is live, and it quotes a free puja.
