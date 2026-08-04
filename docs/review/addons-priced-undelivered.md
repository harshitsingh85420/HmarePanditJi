# RULED ORDER #1 — THE THREE PRICED-BUT-UNDELIVERED ADD-ONS

**Design report, zero code.** Report-first because the change alters a
customer's stated money obligation. Isj rules; the build follows in the
next turn.

---

## §1 · WHAT SHIPS TODAY, MEASURED

Both controls live in one block of
`apps/web/app/booking/new/booking-wizard-client.tsx` — the same block the
₹499 muhurat consultation was removed from on 2026-08-01. Its tombstone
comment sits **between them**, so the ruling that killed one sibling is
physically surrounded by the two that survived it.

**Premium Backup — ₹9,999** (lines 1778-1798). A bold title, an orange
`SAFE` badge, the promise *"Guaranteed replacement within 2 hrs if
emergency"*, the price, and a real working toggle bound to
`addons.backup`.

**Nirmalya Visarjan — ₹500** (lines 1814-1826). Title, *"Eco-friendly
floral waste management"*, price, working add button.

**What reaches the server: nothing.**

- No Booking column exists for either (`schema.prisma:448-575`).
- No API field accepts them; no server fee line computes them.
- Backup's only trace is one English sentence appended to
  `specialInstructions` — `"Backup Guarantee added (₹9,999)."` (line 736).
- **Visarjan's trace is nil.** The `specialInstructions` array has a
  `addons.backup` line and no `addons.visarjan` line. A customer can be
  charged ₹500 and *nobody is ever told* — not the pandit, not ops, not
  the database.

Behind the backup control there is no standby pool, no escrow, no
coverage ratio, and no second pandit anywhere in the schema. Behind the
visarjan control there is no waste-collection anything.

---

## §2 · 🔴 THE MONEY-SEMANTICS FINDING — this is safer than my own report said

I stated in the verification that these were *"priced into the totals"*.
That is **half wrong, and the correction matters for how the build is
scoped.** Measured at lines 604-614:

```
payNow          = dakshina + platformFee + effectiveTravelCost + foodAllowance
settledAtBooking = samagriCost + addonCost + accommodationCost
```

**`addonCost` never enters `payNow`.** So:

- The **Razorpay charge does not contain these numbers.** Removing them
  changes nothing about what the platform collects.
- `displayChargeBoundary.test.ts` — which parses both the client's
  `payNow` and the server's `grandTotal` and fails the build on any
  divergence — **is untouched by this change in either direction.**
- What the add-ons actually do is inflate **"Settled at booking"** (the
  row rendered at line 1853), described one screen earlier as *"paid
  directly to Pandit Ji, not charged now"* (line 1720).

**Which makes the defect worse in kind, not smaller.** The customer is
not overcharged by us. She is told she owes up to **₹10,499 in cash, to
the pandit, at her own ceremony**, for two services nobody will perform —
and in the backup's case, the cash is owed **to the very pandit whose
non-arrival the ₹9,999 insures against.** The platform never takes
custody, which is why Q13-13's escrow is not merely unbuilt but
*unreachable* in the current model: you cannot escrow money you never
touch.

**Consequence for the money-semantics rule:** this build does not change
a charge, a fee, a payout or a refund. It removes two fabricated
obligations from a customer's cash total. I flag it report-first because
you ruled money-first, not because the display=charge chain is at risk —
it is not.

---

## §3 · THE GOVERNING LAW ALREADY EXISTS, WRITTEN IN THIS FILE

The ₹499 tombstone (lines 1795-1812) states it in full:

> **PRICED-BUT-UNDELIVERED IS NOT AN ACCEPTABLE THIRD STATE.** Wiring it
> is a funded feature — payload field + server fee math + a pandit-side
> surface, because it creates a real obligation on a real person.

Both survivors fail all three conditions. So **#1 is not a new ruling —
it is the same ruling applied to the two siblings it was written beside.**
This is the F-B3-5 shape once more: a law written generally, executed on
one instance.

Two aggravating facts the ₹499 case did not have:

1. Backup's promise is **stronger** than the consultation's — *"Guaranteed
   replacement within 2 hrs"* with a `SAFE` badge is a safety guarantee
   on a wedding day, the single worst promise to break.
2. Visarjan is **worse than the ₹499 was** — the consultation at least
   put a sentence in front of the pandit. Visarjan puts money on the
   customer's bill and generates no record at all.

---

## §4 · THE THREE OPTIONS, AND WHAT I RECOMMEND

**Option A — DIE ENTIRELY (recommended, both).** Delete both controls,
delete `addonCost`, delete the `addons` state and the backup
`specialInstructions` line. `settledAtBooking` becomes
`samagriCost + accommodationCost`.

**Option B — survive unpriced, as an honest statement.** e.g. *"If your
Pandit ji cannot come, we will try to find a replacement."* **Rejected,
and on your own precedent:** there is no standby pool, so "we will try"
is a second undelivered promise wearing softer words. The REJECTED
video's render law already settled this shape — **honest silence, no
scarlet letter, no consolation badge.** A guarantee we cannot fund says
nothing at all.

**Option C — fund one now.** Out of scope: a standby pool needs a second
verified pandit per city per date, an escrow the current money model
cannot reach, and a coverage ratio. It is a named future with
preconditions, not a build.

**Recommendation: Option A for both, and the backup keeps its tombstone
comment** — the ₹499 precedent proves the comment is what stops the
control returning by habit. (It does not stop it returning by *edit*;
that is §5's job.)

---

## §5 · THE GUARD, ON THE BOUNDARY

Per your standing cure. The old guard's failure was scope: it banned
these exact promise-phrases but read **`apps/web/app/page.tsx` alone**
(`payment-money.test.ts:270, 291-301`), so the landing page was scrubbed
and the checkout — the one surface where a customer can actually pay —
was never walked.

**Guard A · THE COMPOSITION PIN — the real boundary.** The boundary is
not a directory; it is the two expressions that state a customer's
obligation. Parse both from source and pin their addend lists exactly:

- `payNow` = dakshina + platformFee + effectiveTravelCost + foodAllowance (already pinned against the server by `displayChargeBoundary`)
- `settledAtBooking` = samagriCost + accommodationCost ← **new**

Any future add-on, wherever its control lives, must edit one of these two
lines to reach a customer. **A new addend fails the build until it is
declared.** `proveDetects` both polarities: the tainted specimen carries
`+ addonCost` and must fail; the clean specimen must pass.

**Guard B · THE PROMISE-TRUTH SWEEP, widened from one file to the live
tree.** Replace the `[landing, phrase]` pairs with a recursive walk of
`apps/web/app` (excluding `.next`), asserting no banned promise appears
in **any** file. The list gains `Premium Backup`, `Backup Guarantee`,
`Guaranteed replacement`, alongside the existing five. Same lift rule as
₹499: a funded feature lifts its own ban by ruling.

Scoped deliberately: the ban names **promises with no fulfilment path**,
never product words. "Visarjan" is not banned — a real waste-collection
service may exist one day; what is banned is pricing one that does not.
Guard A holds that line.

**Guard C · THE ENV RESIDUE.** `env.ts:97` declares
`BACKUP_FEE_PAISE: default(50000)` — ₹500 — a **third number for the same
product**, validated and shipped, read by nothing, sitting one
autocomplete from the money path while the UI says ₹9,999. It dies with
the control, pinned by a one-line absence assertion.

Guards A and B both live in `services/api/src/lib` (the only place with a
test runner that can reach `apps/web`, which has none) and carry G2
`proveMatchers` / `proveSaw` / `proveDetects`.

---

## §6 · BUILD SCOPE, IF YOU RULE OPTION A

Six files, one commit, no server change and no migration:

1. `booking-wizard-client.tsx` — delete both control blocks; delete `addonCost`, the `addons` state and its setter; drop the backup line from `specialInstructions`; `settledAtBooking` loses its middle term. Keep and extend the tombstone to name all three dead siblings.
2. `services/api/src/config/env.ts` — delete `BACKUP_FEE_PAISE`.
3. `services/api/src/lib/payment-money.test.ts` — widen the phrase loop to the tree walk (Guard B).
4. New `services/api/src/lib/customerObligation.test.ts` — Guard A, both compositions, both polarities.
5. Guard C's absence pin (folded into 4).
6. `docs/review/decide-or-go-census.md` — mark rows :69 and :71 executed with the commit SHA.

**Proof:** a same-turn 360×740 screenshot of the Review & Pay step
showing the add-ons section gone and "Settled at booking" carrying only
real components — walked **up to** Review & Pay, submit never fired, per
the money boundary. Plus the two guards red-then-green.

---

## §7 · WHAT NEEDS YOUR WORD

1. **Option A for both — confirm.** (My recommendation; B rejected on the honest-silence law, C is a funded future.)
2. **Does the backup survive in the doc as a named future with its preconditions listed** (standby pool → escrow reachable only if the fee moves into `payNow` → coverage ratio), or does it leave the product entirely?
3. **The phrase-ban lift rule** — I have written it as "a funded feature lifts its own ban by ruling." Confirm that is the standing form, since it will govern every future ban.

Nothing else in the ruled order is touched by this build. Queue behind it
unchanged: #2 `encrypt()`, #3 the refund stub, #4 booking-create
integrity, then your three open rulings.
