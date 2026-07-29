# THE THREE-ACT WALK — 2026-07-29

Production `9a38c26`. Real booking **HPJ-2026-19028** (created in Act 1).
Boundaries honoured: no real payment, no real SMS, no KYC on a real person.
**A dead hop was found in Act 2. It is documented, not seeded past.**

---

## ACT 2 · I am the pandit

Pt. Ramesh Sharma, `+919876543210`, role PANDIT, KYC VERIFIED.

### How do I learn it exists?

| transport | wired? | fires? |
|---|---|---|
| Push (FCM/web-push) | no registration call in the app | **never** |
| SMS to pandit | MSG91 wired for OTP only | **never for bookings** |
| WhatsApp | no sender configured | **never** |
| Email | no transport | **never** |
| Socket / SSE | no connection opened | **never** |
| Poll / revalidate | 🔴 **WRONG — see correction 3.** home polls every 30s | **while the app is open** |
| **Opening the app** | 5 calls on mount | **the only one** |

Cold open fires exactly five requests, all 200:
`/pandit/bookings` · `/pandit/stats` · `/pandit/earnings/summary` · `/auth/me` · `/pandit/pooja-verifications`.

**He learns of a booking only by opening the app and looking.** Nothing reaches him.
Lag is unbounded — it is however long until he next opens it.

### What do I see?

नई विनती is visible. The booking is in the list, badged `REQUESTED`.

Money on his card — **Ruling B holds from his side**:

```
dakshinaAmount            2100
platformFee                210   (charged to the customer, on top)
platformFeePercent          10   (snapshot, frozen on the row)
grandTotal                2310   (what the customer pays)
platformTransfersToPandit 2100 ✅ ← this is what he is shown
```

The UI reads `panditEarns()`, which prefers `platformTransfersToPandit`.
`grandTotal` has three hits in the whole repo, all in test files — **it is never rendered
to the pandit.** He sees ₹2,100. Correct.

### What do I know about the customer?

**Nothing.** The pandit payload carries no `customer` object.
`customerName: ""` and `customerPhone: ""` — legacy scalar columns, empty.
`customerPhone` appears in **zero** pandit routes and **zero** controllers.
There is no path by which he could get it.

**Can I call him? No.** There is no number to dial.

### 🔴 ACCEPT IS A DEAD HOP

```
POST /pandit/bookings/HPJ-2026-19028/accept
→ 409 invalid_state · "Only a pending booking can be accepted."
```

Cause, traced — not inferred:

- Row's DB status is `CREATED` (`paymentStatus: PENDING`, `acceptedAt: null`) because no payment occurred.
- The accept handler requires `PANDIT_REQUESTED` (`pandit.routes.ts:670,732`).
- `CREATED → PANDIT_REQUESTED` happens **only** in `processPaymentSuccess`.
- But `bookingStatus.ts` maps **both** `CREATED` and `PANDIT_REQUESTED` to the view `REQUESTED`.

So `dbStatusesForView("REQUESTED")` returns both, and **an unpaid, unacceptable booking is
displayed to the pandit as an actionable new request.** Two states collapsed into one bucket,
hiding the difference that decides whether the button works.

> **As the pandit, I found out about this booking by opening the app and looking at a list —
> nothing told me. And I know the date, the place, the ceremony, and that I earn ₹2,100.
> I do not know who booked me, I cannot call him, and when I press स्वीकार करें it fails.**

---

## ACT 3 · I am ops

**I could not log in.** `POST /auth/admin-login` → 401. Admin auth is
`ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH`, held by Isj. Everything below is traced from the
handlers and the real row, and is marked as such — **not observed on screen.**

### Does it appear, where, how fast?

`GET /admin/bookings` is an unfiltered list — the row appears **immediately**, no payment
required. Ops sees it before the pandit can act on it.

🔴 **The list handler has no `include`.** Rows carry Booking scalars only, so the list shows
`customerName: ""` — the same empty legacy column the pandit gets. **The customer's name is
blank in the ops list too.**

The **detail** page is different: `apps/admin/src/app/bookings/[id]/page.tsx:95` fetches
`/bookings/:id` — the *customer* endpoint — and `getBookingById` includes `customer: true`
and grants access when `requesterRole === "ADMIN"`. So **the real name and phone are on the
detail page only.** Ops must click through to get them.

### The arithmetic, on the real row

```
customer pays    2310
pandit receives  2100
platform fee      210
2310 − 2100 = 210 ✅ reconciles
```

`platformFeePercent = 10` **is on the row itself** — a snapshot frozen at creation, not a
live config read. Recomputing from the row (210 ÷ 2100) returns 10%. **It matches.**
The admin detail renders the fee as `grandTotal − platformTransfersToPandit`, which is the
same subtraction — it cannot drift from the row.

`payoutStatus: PENDING` · `paymentStatus: PENDING`.

### What can I NOT do?

**If the customer phones saying the pandit hasn't arrived:**

- **Cancel — works.** The repaired guard's cancellable set is
  `CREATED, PANDIT_REQUESTED, REQUESTED, CONFIRMED, ACCEPTED, TRAVEL_BOOKED, PANDIT_EN_ROUTE, PANDIT_ARRIVED`.
  It **includes `CREATED`**, so this row is cancellable. The repair holds on its first real test.
- **Call the pandit — not from the panel.** No dial affordance; ops reads the number and uses a phone.
- **Reassign to another pandit — cannot.** No such endpoint or control exists.
- **Refund — cannot.** No refund action in the panel. Nothing charged here anyway.
- **Message either party — cannot.** No transport is wired to any booking event.
- **Force the journey forward — `PATCH /admin/bookings/:id/status` exists**, but it moves a
  status field; it sends nothing to anyone.

> **As ops, I can see the booking immediately, read both sides' real details on the detail
> page, reconcile the money exactly, and cancel it. I cannot reassign, refund, message, or
> reach anyone from inside the panel — every human contact is a phone call I make myself.**

---

## WATCH LIST

| item | finding |
|---|---|
| `FeedbackUnanswered` | ✅ **written** — `feedback.routes.ts:33`. *(My first pass said "0 references" — wrong, see corrections.)* |
| `ShishyaExchange` | ✅ **written and read** — `shishyaAgent.routes.ts:214,226`. *(Same error.)* |
| event-day name/phone pair | 🔴 **Exposed, not absent** — see corrections. |
| pandit-side earnings figure | ✅ **₹2,100** — `platformTransfersToPandit`, never `grandTotal`. |
| repaired admin cancel | ✅ accepts `CREATED` — passes its first real test. |

---

## CORRECTIONS TO THIS DOCUMENT (2026-07-29, same day)

Four claims above were wrong. Each is left in place with the correction beside
it, because a walk record that quietly self-heals teaches nothing.

**1. "There is no path by which the pandit could get the customer's phone."**
FALSE, and it is the most important error here. `/pandit/bookings` (singular,
`auth.controller.ts:813`) omits the customer — that is the endpoint the app
calls, and what I observed. But `/pandits/bookings/:id` (**plural**,
`pandit.routes.ts:781`) is a second live, role-gated endpoint that returns
`customer: { include: { customerProfile: true } }` — the **entire User row**.
Proven live against production with a pandit token:

```
GET /pandits/bookings/<id>
→ customer: { name, phone: "+919876500042", email, id, role,
              isActive, profileCompleted, language, customerProfile, … }
```

on an **unpaid `CREATED`** booking. So this is not a missing feature — it is an
**unaudited exposure**, ungated by state and far wider than any screen needs.
The ownership check is sound (`booking.panditId !== profile.id → 404`), so it is
his own bookings only, not a mass leak. Flagged for Isj's ruling, not fixed:
identity is REPORT-only.

**2. "The admin list has no include, so the customer's name is blank."**
FALSE. It uses `select:`, and already selects
`customer: { select: { id, name, phone } }` (`admin.controller.ts`), and the
client already renders `b.customer?.name` and the phone
(`apps/admin/src/app/bookings/page.tsx:247-248`). I grepped for `include:`
against code that says `select:`. **Ops sees the name in the list. No fix was
needed and none was made.**

**3. "No poll."** FALSE. `apps/pandit/.../home/page.tsx:132,169` polls
`/pandit/bookings?status=REQUESTED` **every 30 seconds**. It does not reach a
closed app, so the handoff verdict stands — but the transport table's "poll ·
never" row was wrong. (It also means the split shipped today changes real
behaviour: unpaid bookings no longer announce themselves through that poll.)

**4. "FeedbackUnanswered / ShishyaExchange have 0 references in the API."**
FALSE. Prisma's client accessor is **camelCase** (`prisma.feedbackUnanswered`)
while the model name is PascalCase; I searched for the model name. The earlier
ledger entry — that both were verified executing live, `200` and `201` — was
correct and stands.

**The common cause of 2, 3 and 4 is one thing: a matcher that could not see its
own subject.** `include:` vs `select:`, a cold-open capture vs a 30-second
interval, PascalCase vs camelCase. That is law G2, which this campaign wrote
after seven instances in guard code — and all three of these were in *reporting*
code, where nothing runs a prove-to-fail pass. **G2 binds prose as well as
guards.**

---

## HANDOFF TABLE

| moment | what should carry the news | what actually carries it | lag | verdict |
|---|---|---|---|---|
| booking created → pandit | push / SMS | **nothing** — he must open the app | unbounded | 🔴 dead |
| booking created → ops | dashboard | the list, on refresh, **with name+phone** | until refresh | 🟢 works |
| pandit accepts → customer | push / SMS | **cannot happen — accept 409s** | ∞ | 🔴 dead |
| ops cancels → both parties | SMS | **nothing** | ∞ | 🔴 dead |
| payment → status advance | webhook | wired, untested without live keys | — | ⚪ unproven |

---

## VERDICT

> **A booking today actually reaches a database row and an ops screen, and reaches the pandit
> only if he happens to open his app — where he cannot accept it, cannot see who booked him,
> and cannot call.**

---

## THE PILOT'S MANUAL-OPS RUNBOOK

Every gap below is a step a human must perform because no code performs it.

1. **Watch for new bookings yourself.** Refresh `/admin/bookings`. Nothing alerts you.
2. **Read the customer's name and phone off the list row.** *(Corrected: they are
   already there — step originally said you had to open each row.)*
3. **Phone the pandit and tell him he has a booking.** The app will not — and
   while a 30-second poll exists, it only runs while he has the app open.
4. **Read him the date, place, ceremony, and that he receives ₹2,100** (not ₹2,310 — that is
   what the customer pays).
5. **Do not ask him to press स्वीकार करें on an unpaid booking — it returns an error.**
   Until payment lands, accept is unavailable and the button is a trap.
6. **Confirm the booking verbally on both calls.** Nothing else confirms it.
7. **Give each side the other's number by phone.** Neither app *shows* it — though
   the API already hands the pandit the customer's full record on the plural
   endpoint (correction 1). Until that is ruled on, the phone call is the path.
8. **On the event day, phone both to confirm arrival.** No status advances by itself.
9. **If the pandit has not arrived:** cancel in the panel (this works), then phone both
   parties yourself — the cancellation notifies no one.
10. **Reassignment and refunds do not exist.** Handle them out of band and record them
    somewhere outside this system.

### Fix order suggested by the walk

1. **Split `CREATED` from `PANDIT_REQUESTED` in the pandit view** — stop showing an unpaid
   booking as an actionable request. Cheapest fix, removes the trap.
2. **Give the pandit the customer's name and phone** on an accepted booking.
3. **One transport that actually fires** — SMS to the pandit on booking is enough for a pilot.

*Anything not fixed stays in the runbook above, done by hand.*
