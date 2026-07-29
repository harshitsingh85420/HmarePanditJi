# CUSTOMER IDENTITY EXPOSURE — TRACE, 2026-07-29

**REPORT-ONLY. Nothing here is fixed — identity/auth is Isj's ruling.**

Ordered as "trace fully before proposing" for a supposed *gap*: the pandit cannot
reach the यजमान. The trace inverted the question. **The customer's name and phone
are present in every state, on ten routes, and two of those routes are reachable
without the pandit owning the booking at all.**

Method: 6 parallel traces + 6 adversarial refuters + synthesis (13 agents). Every
finding below was then **re-verified by hand against the file** and, where it
could be, **against production**. Agent line numbers were off by +5 in
`auth.controller.ts` and +6 in the pandit client; the numbers here are the
verified ones.

---

## 1. 🔴 `GET /api/v1/reviews/pandit/:panditId` — PUBLIC, and it ignores `isAnonymous`

**Confirmed live, with no token: HTTP 200.**

```
$ curl https://…/api/v1/reviews/pandit/<id>          # no Authorization header
{"success":true,"data":[],"meta":{"total":0}}   [HTTP 200]
```

- `review.routes.ts:23` — `reviewRoutes` registers **no plugin-level
  `authenticate` hook** (unlike `booking.routes.ts:57`, which does).
- `review.routes.ts:50` — the route is declared `{}`. No preHandler.
- `review.service.ts:117-121` — selects `isAnonymous: true` **and**
  `reviewer: { select: { name: true, customerProfile: true } }`, then returns the
  rows raw. **`isAnonymous` is selected and never applied.**

**The twin route does it correctly.** `pandit.controller.ts:556`:

```ts
reviewerName: r.isAnonymous ? "Anonymous" : r.reviewer?.name ?? "Customer",
```

So one endpoint honours the customer's anonymity flag and the other, which is
public, does not — and ships the entire `customerProfile` object alongside the
real name.

**Why the earlier public-read audit missed it:** that audit enumerated
`PUBLIC_PANDIT_READS` in `app.ts:275-278`, which lists `/pandits/:id/reviews` —
the safe twin. This route lives under a different prefix (`/reviews`, registered
at `app.ts:446`) and was never in the set being audited. **An allow-list audit
proves nothing about routes outside the list's prefix.**

**Dormant, not safe.** Production has **0 reviews**, so there is nothing to leak
today. The moment the first review is written, a customer who ticked "anonymous"
is named to anyone with the URL.

## 2. 🔴 `GET /api/v1/bookings/:id/status-history` — no ownership check

`booking.routes.ts:476`, verified verbatim:

```ts
fastify.get("/:id/status-history", {}, async (request, reply) => {
  const history = await prisma.bookingStatusUpdate.findMany({
    where: { bookingId: req.params.id },        // ← the ONLY predicate
    include: { updatedBy: { select: { name: true, role: true } } },
  });
```

The plugin-level `authenticate` at `booking.routes.ts:57` **does** apply, so a
token is required — but there is **no `roleGuard` and no ownership predicate**.
Any authenticated user of any role can pass any booking id and receive the names
of everyone who touched it.

Customer-authored rows are guaranteed on every paid booking —
`payment.service.ts:341-348` writes `updatedById: booking.customerId` inside the
capture transaction — so the customer's name is reliably in that payload.

**What I proved and what I did not.** Live call returned `200` with `data: []`
(the only production booking is unpaid, so it has no status updates yet). I
passed **my own** booking id. **I did not attempt cross-tenant access** — one
booking exists and creating a second to prove a leak is not something I will do
uninvited. The finding rests on the source, where the absence of the predicate is
unambiguous.

## 3. 🟠 The over-wide projections — correctly gated, far wider than needed

Ownership *is* enforced on these. The issue is scope and state, not access
control.

| route | what it ships | gate |
|---|---|---|
| `/pandits/bookings/:bookingId` (`pandit.routes.ts:781`) | **entire `User` row** + entire `CustomerProfile` | ownership ✅ |
| `/bookings/pandit/my` (`booking.routes.ts:123`) | `customer: true` — **full User per row, in bulk** | `roleGuard("PANDIT")` ✅ |
| `/pandit/bookings/:id` (`auth.controller.ts:868`) | `customer.name` + `customer.phone` | ownership ✅ |

Proven live on the plural route with a pandit token, on an **unpaid `CREATED`**
booking:

```
customer: { name, phone: "+919876500042", email, id, role, isActive,
            profileCompleted, language, customerProfile, createdAt, … }
```

**No pandit-facing handler reads `booking.status` before choosing fields.** Every
gate in the codebase is an ownership gate. There is no state-dependent narrowing
anywhere, so Isj's proposed symmetric rule — each side sees the other's name and
number **once CONFIRMED**, neither before — is not merely unimplemented, it is
currently inverted.

**Nothing narrows any of it after the query.** `utils/response.ts:20-30` is a
verbatim pass-through; there is no `onSend`, `preSerialization`,
`setReplySerializer`, response `schema`, or Prisma `$extends`/`$use`/`omit`
anywhere in `services/api/src`. The one app-level hook (`app.ts:286-293`)
restricts *access* and never touches a body — and it matches only
`/api/v1/pandit*`, so the entire `/api/v1/bookings/*` family is outside it.

## 4. 🟠 The venue address ships pre-accept

`venueAddress` / `venueCity` / `venuePincode` / `venueLatitude` /
`venueLongitude` are plain `Booking` scalars (`schema.prisma:432-436`), so every
raw-row route ships them with no `include` at all — including
`/pandits/pending-requests` (`pandit.routes.ts:729-737`), which is **pre-accept
by definition**. `withPanditView` (`bookingStatus.ts`) is spread-only and strips
nothing.

## 5. The legacy scalars are write-dead — a red herring

`Booking.customerName` / `customerPhone` (`schema.prisma:516-517`) are
`@default("")`. `createBooking` (`booking.service.ts:186-241`) writes
`customerId` and never them; the six seed `booking.create` calls never do;
migration `20260703000000_pandit_domain/migration.sql:48-50` adds them with no
`UPDATE`. `eventAddress:519` is a third. **Every real exposure flows through the
`booking.customer` relation, not these columns** — which is exactly why reading
the empty strings in the walk led me to the wrong conclusion.

---

## CLEARED — recorded so they are not re-flagged

- `pandit.routes.ts:480` includes `customer.name`, but the hand-built response at
  `:524-548` drops it.
- `booking.routes.ts:196 / :237 / :372` load `customer: true` but reply with the
  separate `booking.update` result; the relation feeds SMS only (`:387-388`).
- The itinerary route (`pandit.routes.ts:808-852`) includes `pandit: true` only;
  its `hotel.address` is a literal template, not a customer address.
- `customer.routes.ts` is clean — plugin-wide `authenticate` at `:60` plus
  `roleGuard("CUSTOMER")` on **every** route. The cross-role hole is in the
  **booking** plugin, not the customer plugin.
- `notifyBookingConfirmedToPandit` (`notification.service.ts:192-206`) would leak
  the name, but has **zero call sites** repo-wide.

---

## THE CLASS

**Twin routes with divergent projections.** Third sighting, and now the cause of
two separate wrong findings and one real leak:

| pair | one does | the other does |
|---|---|---|
| `/pandit/bookings/:id` vs `/pandits/bookings/:id` | omits the customer | ships the whole `User` |
| `/pandits/:id/reviews` vs `/reviews/pandit/:id` | honours `isAnonymous` | **ignores it, publicly** |

`pandit.routes.ts` is mounted at `/pandits` (`app.ts:442`) while `app.ts:309-317`
registers `/pandit/*` handlers directly on the app. Near-identical paths,
different handlers, different privacy behaviour, both live.

> **An audit of a route list proves nothing about the route that isn't on it.**
> Both misses here came from auditing a curated set — `PUBLIC_PANDIT_READS`, the
> pandit app's own call list — rather than enumerating what the router actually
> serves.

---

## FOR ISJ'S RULING

1. **Items 1 and 2 are live defects, not design questions.** They need a decision
   only about *when*, not *whether*.
2. **The symmetric rule** (each side sees the other's name and number once
   `CONFIRMED`, neither before) is a **narrowing** of today's behaviour on the
   pandit side, not an addition. The pandit client is already wired for it —
   `bookings/[id]/page.tsx:196-197` reads `booking.customer?.phone` and `.name`
   and falls back to "यजमान" — so the work is to narrow the projection and gate
   it on state, then point the app at the narrowed route.
3. **Open question I could not settle:** whether the venue address should also be
   `CONFIRMED`-gated. A pandit arguably needs the city pre-accept to judge travel,
   but full address + lat/long pre-accept is more than that judgement requires.
