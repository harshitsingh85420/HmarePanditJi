# Signed Deviations — pandit-POV conformance register

A deviation is a **conscious, signed decision** to ship something other than
what *HmarePanditJi — Complete Pandit-Facing Platform Documentation* specifies.

Rules, so this file cannot become a laundry chute for gaps:

- A deviation discharges a requirement **only when signed and dated.** The
  conformance guard treats an unsigned block as *not discharged* and fails
  the build. Drafting one changes nothing on its own.
- Only Isj signs. These five are **drafted for signature, deliberately
  unsigned** — the wording is mine, the decision is his.
- Each block states what is lost, not only what is deferred. A deviation
  that reads as painless is usually mis-worded.
- Reversing a deviation means deleting its block; the guard then fails until
  the requirement is genuinely built.

**Status: 0 of 5 signed.** CI fails until each is either signed or built.

---

## Spec supersessions (founder rulings — not deferrals)

These are **decisions to ship something DIFFERENT from the doc that is fully
built**, not gaps left open. They need no signature block: the founder ruling
itself is the signature (dated, in CONFLICT_RULINGS.md). Listed here so the
doc's superseded figure is never mistaken for the live behaviour.

### S-01 — Money model: 100% of dakshina to the pandit; platform fee is separate & customer-paid

**Signed by ruling:** Isj, 2026-07-21 (CONFLICT_RULINGS **#7**).

**The doc says:** the platform takes a commission out of the pandit's earnings
(the pandit-doc's figure was **15%**; the shipped pilot ran a **90/10** split —
pandit 90%, platform 10% deducted from the payout).

**What we ship instead — and it is built:** the पंडित जी keeps **100% of the
dakshina — कोई कटौती नहीं**. Platform revenue is a **separate fee charged to the
customer, added on top** of the dakshina; it never reduces the payout. Both the
doc's 15% and the shipped 90/10 are **dead**.

**Why:** founder decision — the pandit's earning must be whole and legible ("जो
दक्षिणा तय की, वही पूरी मिलेगी"), and platform revenue must not read to the
pandit as money taken from him.

**What changed in the build:** one fee constant (`PLATFORM_FEE_PERCENT`, still
10) now flows to the *customer* total, not the payout; `panditPayout = dakshina
+ pass-throughs`; conservation `platformFee = grandTotal − panditPayout`; the
web checkout shows the fee as its own line (display = charge); all शिष्य / FAQ /
earnings / tutorial / LLM copy says 100% / कोई कटौती. Guard-pinned and proven to
fail on regression (see Ruling #7).

---

## D-01 — F1 referral invites (F01-04, F01-05, F01-06, F01-07)

**The doc requires:** a customer can invite a pandit by link; invites are
throttled (max 1 per number per 7 days, never after 2 ignores, opt-out
honoured); an already-registered number receives a *login* link rather than a
registration link; referral bonus releases only after the referred pandit
completes 3 verified bookings.

**What we ship instead:** no invite mechanism. Pilot pandits are recruited by
hand and onboarded directly.

**Why:** every path here delivers over SMS or WhatsApp, and template delivery
is blocked pending DLT registration. The throttling and opt-out rules are not
optional politeness — they are the compliance surface of a messaging system we
cannot yet legally operate.

**What this costs us in the pilot:** the doc's cheapest growth loop is absent.
Pandit acquisition stays manual and does not compound, so pilot growth numbers
will understate what the built product could do. Do not read pilot acquisition
rate as a product signal.

**Reverses when:** DLT templates are approved and a delivery provider is live.
F01-04…07 then get built and tested normally.

- **Signed:** ______________________
- **Date:** ______________________

---

## D-02 — F5 UIDAI-backed Aadhaar verification (F05-01, F05-03, F05-04)

**The doc requires:** the pandit speaks his 12-digit Aadhaar number with
repeat-back confirmation; a real Aadhaar OTP verification with a 3-failure loop
offering resend or support; and an automatic minor gate rejecting DOB < 18.

**What we ship instead:** Aadhaar **photo upload plus admin manual approval.**
No UIDAI OTP, no e-KYC, no automated number validation.

**Why:** genuine UIDAI OTP/e-KYC requires a paid, contracted provider. The
pilot has no such contract.

**What this costs us in the pilot:** identity assurance rests on a human
looking at a photograph. A determined bad actor can pass with a borrowed or
altered card, and **the minor gate does not exist** — nothing automatically
stops an under-18 registration; it depends entirely on the reviewer noticing
the DOB. At pilot scale, with every pandit hand-recruited and known, that is a
tolerable risk. **It stops being tolerable the moment onboarding is
self-serve**, and that is the real trigger for reversing this, not cost.

**Reverses when:** a UIDAI provider is contracted — or immediately upon
self-serve onboarding, whichever comes first.

- **Signed:** ______________________
- **Date:** ______________________

---

## D-03 — F8 video verification by unlisted-link submission (F08-06)

**The doc requires:** in-app recording or gallery upload of a 2-minute
pooja-specific verification video.

**What we ship instead — and this one is already live:** the pandit submits an
**unlisted YouTube link**, with a WhatsApp help path for pandits who need
assistance producing one.

**Why:** in-app video capture and storage is a large build (camera handling on
low-end Android, upload resilience on poor connections, storage cost, moderation
pipeline). Unlisted-link submission reuses infrastructure the pandit's family
usually already knows how to drive.

**What this costs us in the pilot:** a real barrier for the exact persona this
product is built around. A 62-year-old who cannot produce an unlisted YouTube
link cannot complete verification without help, so the WhatsApp path is
load-bearing rather than a convenience. It also puts trust content on a
third-party platform we do not control — a pandit can delete or re-list the
video after approval and we would not know.

**Recorded here because it was shipped without ever being recorded as a
deviation.** Signing it does not change the code; it changes the register from
silently wrong to explicitly decided.

**Reverses when:** in-app capture is scheduled and built.

- **Signed:** ______________________
- **Date:** ______________________

---

## D-04 — F11-03 market-rate dakshina benchmarks (F11-03)

**The doc requires:** during dakshina setup, show the pandit a market-rate
benchmark for his city tier, so he can price himself sensibly.

**What we ship instead:** no benchmark. The pandit sets his dakshina with no
comparison shown.

**Why:** we have no rate data. There are no completed bookings to derive it
from, and inventing plausible-looking numbers would be worse than showing
none — a fabricated benchmark would anchor a real person's income downward, and
he would have no way to know it was made up.

**What this costs us in the pilot:** the doc's anti-race-to-bottom protection
is absent, and pandits price blind. Note this interacts with **F11-04**
(minimum floor price), which is a separate un-built item: with neither a floor
nor a benchmark, nothing currently prevents a pandit from underpricing himself.
The floor is the cheaper of the two and does not depend on data.

**Reverses when:** enough completed bookings exist to compute a real per-tier
benchmark from actual transactions.

- **Signed:** ______________________
- **Date:** ______________________

---

## D-05 — F36 bank verification and penny drop (F36-01, F36-02, F36-03)

**The doc requires:** account-type capture by voice with confirmation; a ₹1
penny-drop whose retrieved account-holder name is matched against the Aadhaar
name; and on mismatch, a passbook/cheque photo path with manual verification
within 24 hours.

**What we ship instead:** payouts are **manual UPI, executed by the founder**,
and marked `PAYOUT_COMPLETED` in admin. Bank fields are collected but never
programmatically verified.

**Why:** penny-drop requires a payout provider integration that the pilot does
not have, and at pilot volume the founder settles payouts personally anyway.

**What this costs us in the pilot:** `bankVerified` exists in the schema and
**nothing in the codebase ever sets it** — it is permanently false. Any future
code that trusts that flag as evidence of verification will be wrong. The
name-match step is what normally catches a pandit mistyping his account number
or entering someone else's; without it, a wrong number means money moves to a
stranger and is recovered by apology rather than by process. This is acceptable
only while one person is manually reviewing every payout and knows every
pandit by name.

**Reverses when:** payout automation lands — this must be built *before* the
first payout the founder does not personally execute, not after.

- **Signed:** ______________________
- **Date:** ______________________

---

## Not a deviation — awaiting a product ruling

**F32–35, consultancy "पंडित से बात" (13 requirements).** The doc ranks this
as the fastest route to pandit income; it is also the single largest remaining
build. It is **not drafted as a deviation** because no decision has been made —
deferring it is a legitimate choice, but it has to be made, not defaulted into.

There is a live problem attached to this, independent of the ruling: the
tutorial **already promises this feature to the pandit.**
`apps/pandit/src/lib/voice-scripts.ts:350` (screen S-0.4) speaks
*"पंडित से बात … बीस रुपये से पचास रुपये प्रति मिनट … चालीस हज़ार रुपये अलग से
हर महीने"* — an earnings promise for a feature with no schema, no service and
no UI. Whichever way the ruling goes, that script is currently untrue and
should be corrected on its own merits.

Ruling needed: **build for pilot**, or **sign a deferral** (which would become
D-06 here).
