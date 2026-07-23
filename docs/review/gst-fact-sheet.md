# GST FACT SHEET — for a CA, not a conclusion

**Purpose (Isj, 2026-07-23):** the artefact Isj takes to a chartered accountant.
This document states facts about the money flow and asks questions. It draws
**no legal conclusions** — that is the professional's job.

## 1. The fee model (CONFLICT_RULINGS #7, live since 2026-07-21)

- The **customer** pays, in one Razorpay charge: `dakshina + platform fee +
  travel allowance + food allowance` (`grandTotal`).
- The **pandit** receives **100% of the dakshina** plus the pass-throughs
  (travel/food). Nothing is deducted from him, ever. Payout is currently
  **manual UPI by the operator** (no payout provider integration).
- The **platform's only revenue** is the **platform fee**: 10% of dakshina
  (`PLATFORM_FEE_PERCENT = 10`), charged to the **customer**, itemised as its
  own line before payment (since the 2026-07-23 fee-disclosure fix), and
  **non-refundable** on cancellation.
- **No GST is currently computed, collected, shown, or remitted by the
  platform on anything.** The pricing module's tax fields are pinned to zero by
  a build-failing guard (`payment-money.test.ts`: "no second charge / tax lines
  on the customer").

## 2. Who collects what from whom

| Flow | From | To | Via | Platform's role |
|---|---|---|---|---|
| dakshina + travel + food | Customer | Pandit (100%) | Razorpay charge → held → manual UPI payout | Collector/conduit, keeps ₹0 of it |
| Platform fee (10% of dakshina) | Customer | Platform | Same Razorpay charge | The platform's own revenue |
| Samagri / add-ons / accommodation | Customer | Pandit | Settled directly at the puja, **never charged through the platform** | None |

## 3. The doc's own constraint (X-6)

The product document is explicit: **the platform must NOT collect or remit GST
on the pandit's behalf.** A pandit crossing the ₹20L services threshold is his
own GST event (X-6); TDS/Form 16A at the relevant threshold is F26-2 with the
PAN-linked name requirement (X-5). None of this is built; PAN capture is being
added (optional) to the identity screen so pandits onboarded now need not be
re-approached later.

## 4. Expected pilot volumes (for materiality)

- 5 pandits, ~20 bookings/month total.
- Typical dakshina ₹3,500–₹11,000 → platform fee ₹350–₹1,100 per booking.
- **Projected platform-fee revenue: roughly ₹10,000–₹20,000/month** at full
  pilot pace — far below the ₹20L services registration threshold on any
  12-month projection of the pilot itself. (Scale plans change this — ask the
  CA where the line is.)

## 5. Questions for the CA (the actual deliverable)

1. Is the **platform fee** (our only revenue) a taxable supply of services by
   the platform, and at what threshold must we register and start charging
   GST **on the fee line** (not on the dakshina)?
2. Does acting as a **conduit** for the dakshina/pass-throughs (collected from
   the customer, paid 100% to the pandit) create any GST or e-commerce-operator
   obligation for the platform — specifically, does **Section 9(5)/52 (TCS,
   e-commerce operator)** apply to our shape (religious services booked through
   a platform)?
3. If GST-on-fee becomes due: shown as a separate line on the customer bill?
   Retroactive exposure for fees already collected without it?
4. The X-6 rule (never remit GST on the pandit's behalf) — is that stance
   compatible with e-commerce-operator rules, or does 9(5) force the platform
   to collect on notified services regardless?
5. TDS: at what point do our manual UPI payouts to pandits trigger 194-series
   withholding, and what records must exist from day one (PAN-linked name — we
   are capturing it now)?
6. Anything about the **non-refundable fee on cancellations** that changes its
   tax character?

## 6. What is deliberately NOT in this sheet

No conclusions, no rate guesses, no registration advice. The platform currently
invents **no tax lines anywhere** (guard-enforced) precisely so that whatever
the CA rules can be implemented cleanly from zero.
