# PILOT OPS RUNBOOK — procedures Isj runs alone

**Status: SEED (2026-07-23).** Two named procedures exist because live pages now
reference them (founder rulings: the refund promise and the booking-alert
truthful-state both point at a human procedure). The full runbook — onboarding
script, verification steps, payout walk, support-call script, gap playbook —
lands with the docs wave, derived from the audit-fleet evidence.

---

## PROCEDURE 1 — MANUAL REFUND (the "100% refund if Pandit doesn't arrive" promise)

The pandit-profile page promises: *"100% Refund if Pandit doesn't arrive on
time — processed by our team, credited within 5-7 working days."* **This is the
team. This is the procedure.**

1. Confirm the failure with the customer (and the pandit if reachable). Note
   the booking number (HPJ-…).
2. **Razorpay Dashboard → Transactions → Payments** → search the payment by
   amount/date or the order id from the admin booking detail.
3. Open the captured payment → **Refund** → **full amount** (a no-show refund
   is 100% of the whole charge INCLUDING the platform fee — the fee's
   non-refundability applies to *customer cancellations*, not to our failure).
4. Razorpay credits the customer in its standard window (**5-7 business
   days** — this is where the promise's number comes from; do not promise
   faster).
5. Mark the booking CANCELLED in admin with reason "pandit no-show — refunded",
   and record the refund id in the admin notes.
6. Tell the customer the refund id and the 5-7 day window, in writing.

*Verified executable today: manual full/partial refunds are a standard
dashboard action on the live Razorpay account (Payments → Refund). No code
path is involved and none is required for the pilot.*

## PROCEDURE 2 — OPERATOR CALL on every new booking (the guaranteed alert path)

**Reality (2026-07-23 audit):** with the app closed, NOTHING reaches the
pandit automatically. Twilio booking-SMS is now wired as **best-effort**
(DLT-gated, delivery not guaranteed). For a 5-pandit pilot, **the phone call
is the guarantee** — and per founder ruling the pandit is told exactly that:
**"हम आपको फ़ोन करेंगे"** — never "the app will alert you".

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
