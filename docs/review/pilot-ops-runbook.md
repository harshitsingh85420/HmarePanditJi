# PILOT OPS RUNBOOK — procedures Isj runs alone

**Status: SEED (2026-07-23).** Two named procedures exist because live pages now
reference them (founder rulings: the refund promise and the booking-alert
truthful-state both point at a human procedure). The full runbook — onboarding
script, verification steps, payout walk, support-call script, gap playbook —
lands with the docs wave, derived from the audit-fleet evidence.

**STANDING OPERATOR RULE — voice diagnostics (ruled 2026-07-24):** the
`?voicedebug=1` flag deliberately works in production (it is how the
real-device audio pass reads the voice log on a phone). **No support script
and no URL shared with a pandit or customer ever carries `?voicedebug=1`.**
It is for Isj's own devices only; `?voicedebug=0` turns it back off. The
gate is guarded by `apps/pandit/src/components/voiceDebugGate.test.tsx`.

---

## PROCEDURE 1 — MANUAL REFUND (the "100% refund if Pandit doesn't arrive" promise)

The pandit-profile page promises: *"100% Refund if Pandit doesn't arrive on
time — processed by our team, credited within 5-7 working days."* **This is the
team. This is the procedure.**

**WHO DECLARES A NO-SHOW, AND HOW (founder ruling 2026-07-23):** there is NO
automated no-show detection — nothing in the system knows the pandit didn't
arrive. The promise rests entirely on the **customer's complaint reaching Isj**
(call/WhatsApp/support email). **Isj declares the no-show**, after step 1 below.
This is a named, accepted pilot gap — the complaint channel must be on the
booking confirmation the customer holds.

**MONEY REALITY:** at pilot, this refund comes **out of Isj's own pocket** —
the platform fee was the platform's revenue and the dakshina may already be
owed/paid to the pandit's side of the ledger; Razorpay refunds the customer
the full charge either way. Budget for it.

1. Customer complaint arrives → **call BOTH sides**. Confirm with the customer
   what happened; call the pandit for his account. If the pandit did not
   arrive (no credible dispute), **Isj declares the no-show** — the ruling
   default is customer-favourable. Note the booking number (HPJ-…).
2. **Razorpay Dashboard → Transactions → Payments** → search the payment by
   amount/date or the order id from the admin booking detail.
3. Open the captured payment → **Refund** → **full amount** (a no-show refund
   is 100% of the whole charge INCLUDING the platform fee — encoded as
   `REFUND_CASES.PANDIT_NO_SHOW` in refund-policy.ts; the fee's
   non-refundability applies ONLY to customer-initiated cancellations).
4. Razorpay credits the customer in its standard window (**5-7 business
   days** — this is where the promise's number comes from; do not promise
   faster).
5. Mark the booking CANCELLED in admin with reason "pandit no-show — refunded",
   and record the refund id + who-declared + both call summaries in admin notes.
6. Tell the customer the refund id and the 5-7 day window, in writing.

*Verified executable today: manual full/partial refunds are a standard
dashboard action on the live Razorpay account (Payments → Refund). No code
path is involved and none is required for the pilot.*

## PROCEDURE 2 — OPERATOR CALL on every new booking (the guaranteed alert path)

**Reality (2026-07-23 audit + founder Twilio ruling):** with the app closed,
NOTHING reaches the pandit automatically. Twilio booking-SMS is wired in code —
but **Twilio to Indian numbers is DLT-gated the same as MSG91: an unregistered
sender likely delivers NOTHING. Treat this channel as UNPROVEN and expect ZERO
until a booking-SMS is actually observed on a real handset.** (The one prior
Twilio delivery proof was an OTP-shaped message to one handset — it does not
prove template-style booking SMS passes the filters.) When the handset test
runs, record the actual result HERE — if it doesn't deliver, this section must
say so, not leave a channel everyone assumes works. **The phone call is the
real channel until DLT clears.** Per founder ruling the pandit is told exactly
that: **"हम आपको फ़ोन करेंगे"** — never "the app will alert you".

1. A paid booking (status PANDIT_REQUESTED) appears in **admin → bookings**.
   Check after every payment notification, and otherwise **at least every
   2 waking hours** during pilot.
2. **Call the pandit** (numbers in admin → pandit profile). Say: booking
   number, puja, date, city, dakshina. Ask him to open the app and press
   स्वीकार while you are on the line if possible.
3. **Response-time expectation: the customer should see acceptance within
   4 hours** of payment during pilot. If the pandit is unreachable, retry at
   +1h and +3h; at 4h unaccepted, call the customer with an honest status.
4. If he declines or cannot: today there is no backup pandit (F25 not built) —
   call the customer, offer another date or PROCEDURE 1 (full manual refund).
5. Log every call outcome in admin notes on the booking (who, when, result) —
   this is the pilot's audit trail.

*The best-effort SMS may arrive before your call — that is a bonus, never the
plan. Do not skip the call because an SMS was sent.*

## PROCEDURE 3 — CUSTOMER-CANCELLATION REFUND (which number to pay)

**RULE (founder ruling 2026-07-23): the amount you refund is the PERSISTED
number on the request — never arithmetic you do yourself.** When the customer
submits a cancellation, the server computes the refund from `refund-policy.ts`
(≥7 days → 100%, 3-6 days → 50%, <3 days → 0%, of the total minus the
platform fee) and WRITES it to the booking. That same number is what the
customer was shown.

1. **Admin → Cancellations** → the request row. The prefilled **refund amount
   IS the persisted policy number** — read it there, nowhere else.
2. Approve → the server pays that number (it ignores anything else unless you
   explicitly override).
3. **Override only deliberately**: tick override, enter the amount AND a
   reason. The server records "REFUND OVERRIDE ₹X (policy said ₹Y): reason" in
   the admin notes — every deviation from policy is on the record.
4. Legacy rows (requested before 2026-07-23) may show ₹0 persisted — the
   screen then shows the policy fallback, computed with the ruled tiers and
   the booking's real fee. Same numbers, just not pre-written.
5. Then execute the actual money movement per PROCEDURE 1 steps 2-4 (Razorpay
   dashboard) if the automatic refund didn't fire, and confirm `refundStatus`
   progresses.

## PROCEDURE 4 — PAYOUT TIMING (protects Isj's own money)

**What the payout queue actually keys off (verified 2026-07-23):** a booking
appears payable when the PANDIT's journey marks it `COMPLETED` + payout
PENDING + **48 hours have passed** since the last update
(admin.controller.ts: `status: "COMPLETED", payoutStatus: "PENDING",
updatedAt < now−48h`). **Customer confirmation does NOT exist anywhere in the
chain** — the 48-hour silence is the only buffer between a pandit-side claim
and the money leaving.

**THE RULE (founder ruling 2026-07-23): NEVER mark a payout PAID until the
puja is confirmed complete by the CUSTOMER, or the waiting period has passed
with no complaint.** Concretely, before EVERY mark-paid:

1. **Call the customer** — "क्या पूजा ठीक से संपन्न हुई?" A yes = pay now.
2. Unreachable? The queue's 48-hour delay is the floor, not the check: wait
   the full 48h from completion AND confirm no complaint/cancellation exists
   on the booking, then pay.
3. A complaint exists → STOP. Resolve it first (a no-show complaint after
   payout means refunding the customer 100% including the fee OUT OF POCKET
   with the dakshina already gone — this procedure exists to prevent exactly
   that).
4. Log the confirmation (who said what, when) in admin notes with the payout.
