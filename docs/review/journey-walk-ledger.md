# JOURNEY WALK — LEDGER & MAP (campaign opened 2026-08-01)

End-to-end journey verification across apps/web (customer), apps/pandit,
apps/admin, with browser evidence at every step. **Phase 0 only in this
document's first revision: the map, the environment, the data rules, and
the J1 plan. No walking has happened yet.**

The static flow-graph instrument is PARKED in the scratchpad at its last
validated state (form axis proven 7/7, target axis widened with three
controls, orphans 20/41 with 6 UNKNOWN-TARGET sites, endpoint table still
uncontrolled and its numbers unreported).

---

## B · ENVIRONMENT STATEMENT

**Journeys run against PRODUCTION.** Stated plainly because it makes the
data rules in §C absolute rather than advisory.

| app | how served | URL the browser reaches |
|---|---|---|
| customer (apps/web) | Vercel | `https://hmarepanditji-web.vercel.app` |
| pandit (apps/pandit) | Vercel | `https://hmarepanditji-pandit.vercel.app` |
| admin (apps/admin) | Vercel | `https://hmarepanditji-admin.vercel.app` |
| API (services/api) | Render | `https://hmarepanditji-api.onrender.com/api/v1` |

Local dev servers exist in `.claude/launch.json` (pandit :3002, web :3000,
admin :3003) and are the FALLBACK, not the default. **Why production is the
right surface here:** every defect this campaign is hunting — the session
P0, the twin-route 404s, the notification script, the stale-dist class —
has appeared as a difference between what the code says and what the
deployed thing does. A local walk would re-prove the code and prove nothing
about the product. The cost is that every row created is a real row, which
§C governs.

Browser: the in-app Browser pane at **360×740, touch emulation** (the
standing mobile-only QA rule), one Fast-3G pass per journey, profile stated
in each report header.

---

## C · TEST-DATA LEDGER

**Marking convention.** Every entity created by a walk carries the prefix
`क्यूए-` in its name and a phone from the reserved range **+9190000009xx**
(distinct from the seed's `+9190000000x` customers and `+91987654321x`
pandits, so no walk row can be mistaken for seed debris or vice versa).

**🔴 TANYA IS OFF LIMITS — ABSOLUTE.**
`+919465278318` / `cmriymyrp0002et35yb0v6wlt` is a real person and the
platform's first honest VERIFIED. A test booking against her sends a real
notification to her real phone. **No journey may target her.** J9 (booking
end-to-end) requires a VERIFIED pandit because `GET /pandits` filters to
VERIFIED — and today Tanya is the ONLY verified pandit in production.
**J9 therefore BLOCKS at this gate and I stop and report** rather than
route around it. Isj decides whether a marked `क्यूए-` pandit is verified
by his own hand for the purpose; verification stays an ops action with an
author, and that author is never me.

**Rows created — 1 (J1).** Table below is appended to as each row is made.

| # | table | id | name / phone | created (UTC) | journey | cleanup |
|---|---|---|---|---|---|---|
| 1 | User (+ CustomerProfile if auto-created) | **id UNCAPTURED — see note** | `क्यूए-walk यजमान J1` / +919000000901 | 2026-08-01 (J1 walk) | J1 | delete with campaign cleanup |

> **ID UNCAPTURED — recorded as a gap, not glossed.** The signup completed
> and the session is live, but the browser never exposes the User id and I
> have no production DB read. The row is identified by its marked NAME and
> RESERVED PHONE, which is exactly why both conventions exist. Isj can
> resolve the id with one SELECT (§9 below) and it can be filled in then.
> Recording "unknown" beats recording a guess.

### §9 · Resolve the J1 row's id (read-only, for Isj)

```sql
SELECT u.id, u.name, u.phone, u.role, u."createdAt",
       c.id AS customer_profile_id
FROM "User" u
LEFT JOIN "CustomerProfile" c ON c."userId" = u.id
WHERE u.phone LIKE '+9190000009%'
ORDER BY u."createdAt";
```

**Cleanup** is generated FROM this table at campaign end, report-first, and
runs under the same `@generated` + FK-completeness guards as the production
cleanup script. No hand-typed delete list — that class has already cost two
aborted transactions.

---

### 🔴 J9 GATE — RULED (Isj, 2026-08-01)

A `क्यूए-` test pandit WILL be verified by Isj's own hand — but **only
after completing the FULL onboarding through the live app during J5** (the
long-owed fresh-pandit walk), submitting marked uploads, appearing in the
identity queue, and being approved through the same ops screen as Tanya.

**AT CAMPAIGN END THIS PANDIT IS DELETED AND ITS VERIFIED GOES WITH IT.**
Every VERIFIED in production must have a real person behind it — test rows
included, even temporarily. The cleanup must therefore clear the
verification columns, not merely the row, and the FK-completeness guard
applies to that delete like any other.

### RULE ADDITION — A CONTROL THAT TAKES A DECISION NOTHING IMPLEMENTS

From the consultation finding (the ₹499 checkbox with no endpoint behind
it): when the walk meets a control whose decision nothing implements, the
screenshot alone is not the finding. **Capture what actually happens on
selection** — does the value join the request payload, alter the displayed
price, or silently drop? Those are three different severities:
*charged-for-nothing* > *priced-but-undelivered* > *decorative*. Record
which one, with the payload or the price delta as evidence.

## D · CREDENTIAL RULES

- **Dev OTP `123456`** is a documented public backdoor (`OTP_DEV_MODE`
  stays TRUE by standing order). Usable for `क्यूए-` pandit and customer
  logins.
- **Admin credentials are never typed by me.** Admin-authed journeys walk
  to the login gate, screenshot it, and hand Isj the exact steps — the same
  shape as Tanya's verification. J3 and the authed half of J6 are
  Isj-assisted by construction.

---

## A · FLOW INVENTORY — the master journey table

Build status is measured where a measurement was possible this turn and
marked UNMEASURED otherwise. **ABSENT rows are FINDINGS against the docs'
promise, not build failures.**

### Customer journeys

| # | doc origin | flow | status | entry point | apps | evidence |
|---|---|---|---|---|---|---|
| J1 | business-idea | anonymous explore → signup/login | **EXISTS** | `/` → `/login` | web, api | `apps/web/app/login/page.tsx`; OTP via `/auth/*` |
| J4 | business-idea | search / filter / pandit profile | **EXISTS** | `/search`, `/pandit/[id]` | web, api | `GET /api/v1/pandits` measured live: 1 result (Tanya) |
| J8a | business-idea | **muhurat selection** | **PARTIAL — routes alive, DATA EMPTY** | `/muhurat`, `/muhurat-explorer` | web, api | `/api/v1/muhurat/dates` → `{"dates":[]}`; `/upcoming` → `{"dates":[]}` **measured 2026-08-01** |
| J8b | business-idea | **consultation booking (₹499)** | **ABSENT as a flow** | — | web | Only a checkbox line in `booking-wizard-client.tsx:560`; **zero API surface** (0 files in services/api) |
| J9 | both | booking creation | **EXISTS** | `/booking/new` | web, api | `booking-wizard-client.tsx`, `POST /bookings` |
| J9 | both | payment (Razorpay) | **PARTIAL** | `/booking/checkout` | web, api | test-mode only; **webhook unregistered — a stuck payment is a FINDING** |
| J10 | pandit-platform | post-booking status / "where is my pandit" | **EXISTS** | `/dashboard/bookings/[id]/track` | web, api | track page + `PANDIT_ARRIVED` notification (customer-addressed) |
| J10 | both | completion → review | **EXISTS** | `/dashboard/bookings/[id]/review` | web, api | review route + `POST /reviews` |
| — | business-idea | **wallet** | **ABSENT** | — | — | one string label in `stitched/page.tsx:36`; no route, no API |
| — | both | cancellation (customer side) | **EXISTS** | `/dashboard/bookings/[id]/cancel` | web, api | refund-policy module, one source |

### Pandit journeys

| # | doc origin | flow | status | entry point | apps | evidence |
|---|---|---|---|---|---|---|
| J2 | pandit-platform | login (existing account) | **EXISTS** | `/login` | pandit, api | dev OTP path |
| J5 | pandit-platform | onboarding (progressive) | **EXISTS** | `/onboarding` | pandit, api | `onboardingStep5` atomicity fixed this session |
| J5 | pandit-platform | add-pooja wizard | **PARTIAL** | `/my-poojas/add` | pandit, api | **known: output reaches no pandit-facing surface (vocabulary mismatch); सामग्री step saves nothing while showing success** |
| J9 | pandit-platform | receive booking → accept/decline | **EXISTS** | `/home` poll, `/bookings` | pandit, api | `NEW_BOOKING_REQUEST` notification — **roman script, pandit-facing (ROMAN_BASELINE)** |
| J11 | pandit-platform | earnings / payout visibility | **EXISTS** | `/earnings` | pandit, api | `/pandit/earnings/summary`, `/pandit/payouts` |
| J5 | pandit-platform | SOS | **EXISTS** | `/emergency-sos` | pandit | dials +918934095599; **NEVER-FIRE boundary applies** |
| J5 | pandit-platform | help | **EXISTS** | `/help`, `/help/faq` | pandit | — |
| — | pandit-platform | **travel booking** | **CUT from v1** (doc promises it) | — | api has 24 files | travel columns//routes exist; not a v1 journey |

### Admin journeys

| # | doc origin | flow | status | entry point | apps | evidence |
|---|---|---|---|---|---|---|
| J3 | ops | login gate | **EXISTS** | `/login` | admin, api | env-login; **credentials are Isj's** |
| J6 | ops | identity/KYC queue | **EXISTS** | `/verifications` | admin, api | widened queue live; 2 rows expected → 1 after Tanya |
| J6 | ops | pooja verification queue | **EXISTS** | `/verifications` (tab) | admin, api | fetches `?status=PENDING` — renders EMPTY by design today |
| J6 | ops | booking visibility | **EXISTS** | `/bookings` | admin, api | — |
| J11 | ops | payout marking | **EXISTS** | `/payouts` | admin, api | **MONEY BOUNDARY: assert-visible-never-fire** |
| J6 | ops | cancellation approval | **EXISTS** | `/cancellations` | admin, api | `CANCELLATION_REQUESTED` is **logger.info only — never delivered** |

### Doc-promised, build-absent — the finding list

| promise | doc | build reality |
|---|---|---|
| Muhurat-driven booking | business-idea | routes + API alive, **data deleted as fabricated** — the feature renders an empty calendar |
| Paid consultation (₹499) | business-idea | a checkbox in the wizard; **no endpoint, no session, no delivery** |
| Wallet | business-idea | a label string; nothing behind it |
| Travel booking | pandit-platform | infrastructure present, **cut from v1** |
| Static OTP / Hinglish voice / AWS | both | superseded: OTP is dev-mode-gated, voice is Devanagari-first, hosting is Vercel+Render |

---

## J1 PLAN — customer anonymous explore → signup/login

**Surface:** `https://hmarepanditji-web.vercel.app`, 360×740 touch, one
Fast-3G pass.

**Steps, each with before/after screenshots into the gallery:**
1. Land anonymous on `/`. Measure: first meaningful paint, FOUC presence,
   font floors, tap targets ≥52px on every control.
2. Every reachable control from `/` without auth — record where each goes.
3. `/search` anonymous: does it return Tanya (the only VERIFIED pandit)?
   Measure the empty-vs-populated state honestly.
4. `/pandit/[id]` anonymous: what a stranger sees — cross-check against the
   identity-exposure findings (no phone, no bank, no Aadhaar).
5. `/login`: request OTP to a **reserved-range** number, enter `123456`,
   land authenticated. Screenshot the gate and the landing.
6. Session survives reload (the P0 fixed earlier) — reload and screenshot.
7. Log the created User row in §C's table with its id and createdAt.

**Expected blockers to report rather than route around:** if signup creates
a CustomerProfile the ledger must capture it; if any step needs a VERIFIED
pandit beyond viewing, it stops at the Tanya gate.

**Register/UI rigor:** §3 measurements and §9 language checks at every
screen, judged through the 45–70 Galaxy A12 persona.

---

# J1 — CUSTOMER ANONYMOUS EXPLORE → SIGNUP/LOGIN · WALKED 2026-08-01

**Profile:** production `hmarepanditji-web.vercel.app`, Browser pane
360×740, touch emulation. Every step screenshotted.

## The two specific eyes — both PASS

### ✅ `/search` — the identity-exposure cleanup HOLDS in production

Tanya is the **sole result** ("1 पंडित जी उपलब्ध"), matching the API.
Exactly what the anonymous surface exposes, field by field, from the live
payload:

| exposed | withheld |
|---|---|
| `name` "Tanya" · `location` गाज़ियाबाद · `specializations` · `verificationStatus` VERIFIED · `identityVerified` true · `rating` 0 · `totalReviews` 0 · `profilePhotoUrl` **null** (renders an initial, no broken image) · `experienceYears` · `isOnline` · `completedBookings` · `verifiedPoojaTypes` [] | **phone · email · bank · Aadhaar · aadhaarLastFour · documents — NONE present** |

And the laws are visibly holding on a customer surface:
- **पहचान सत्यापित · आधार · मानव जाँच** — the identity claim is NAMED, not a
  bare tick. The naming law, in production.
- **दक्षिणा तय नहीं** — no fabricated price.
- **अभी कोई समीक्षा नहीं — यह मंच नया है / No stars anywhere until real
  reviews exist** — truthful-null, stated as product copy.
- **सामग्री व यात्रा — पंडित जी से सीधे … Never added here, never estimated.**

MINOR, recorded not escalated: the payload exposes internal cuids
(`id`, `user.id`). Not identity data; noted for completeness.

### ✅ `/login` → session survives HARD RELOAD — the session P0 is fixed in production

Reserved-range number `+919000000901`, dev OTP `123456` (banner: "Development
mode: use 1-2-3-4-5-6"), new-user name step, landed authenticated.
`localStorage` holds `hpj_token` (317 chars) + `hpj_user` (515) +
`hpj_language`. Navigated to `/dashboard`, then `window.location.reload()`:
**still authenticated after reload** — avatar, bottom nav, and the
authenticated empty-bookings state all render. The P0 that bounced
customers to login on refresh is confirmed dead on the deployed app.

## §3 measurements — findings

### 🔴 F-J1-1 · Dashboard heading is invisible: contrast **1.03:1**
"My Bookings" renders `rgb(17,24,39)` on `rgb(24,21,17)` at 24px — dark ink
on a dark surface. WCAG AA wants 4.5:1; this is **1.03:1**, i.e. the page's
own title is unreadable. Visible in the screenshot as a faint smudge. A
light-theme token is being painted onto a dark-theme surface.

### 🔴 F-J1-2 · Horizontal overflow on the OTP screen: 442px in a 360px viewport
`scrollWidth 442` vs `clientWidth 360` — an **82px overflow**. The 6th OTP
box and the "I'm a Pandit" tab are clipped off-screen at the exact moment a
user must enter a code. Measured, not eyeballed.

### 🔴 F-J1-3 · 24 of 35 tap targets below the 52px floor on `/`
Including **both primary CTAs**: "Book Now" 160×**48**, "Download App"
190×**48**. Worst offenders are the whole footer nav at **18px** height
(Find a Pandit, Pricing Details, Help Center, Privacy Policy, Terms,
Cancellation Policy), "View All" 51×**20**, "View Full Muhurat Calendar →"
193×**18**, and the header menu/help buttons at 40×40. Passing: the language
modal buttons (74), category tiles (117), Explore Now (68), Get Started /
Contact Sales (56).

### 🟡 F-J1-4 · Font floor breaches on `/`
10px "SEARCH ALL INDIA"; 12px "Aadhaar + Video Verified" — the trust line,
at 12px; 13px on all six category labels (Wedding, Griha Pravesh,
Satyanarayan, Namkaran, Vidhya Arambha, More).

### 🟡 F-J1-5 · The language chooser offers Hindi *in roman*
First-load modal: **"Continue in English" / "Hindi mein jaari rakhein"**.
The customer app's ruling is English-first with roman ritual vocabulary, so
roman copy is not itself a violation — **but the one control whose entire
purpose is to serve a Devanagari reader is written in a script he may not
read.** A user who needs Hindi cannot recognise the button offering it.
Distinct from the no-roman law: this is an affordance unreadable to its own
target audience. Reported, not fixed — customer copy is Isj's.

## Journey verdict

**J1 PASSES functionally end-to-end** — anonymous browse, search, profile
view, OTP signup, authenticated landing, session persistence across reload.
**Five UI/register findings, none blocking.** No money moved, no identity
written, one User row created and ledgered.

---

## §3-V · CONTRAST ASSERTION — added to the walk protocol after J1

F-J1-1 was found **by eye** and should have been found by the instrument.
From J2 onward every journey runs this at every screen, before judging it:

```js
// heading + body contrast against the nearest painted ancestor.
// AA: 4.5:1 body, 3:1 large text (>=24px or >=18.66px bold).
// Anything under its floor is a FINDING, reported with both colours.
```

Measured at each screen, not at the end. The J1 failure mode — a light-theme
token on a hard-coded dark layout — is invisible to a screenshot glance
because the text is *present*, just unreadable; only a computed-style read
catches it.

## F-J1 FINDINGS — disposition

| id | finding | disposition |
|---|---|---|
| F-J1-1 | dashboard heading contrast **1.03:1** | **FIXED in the walk's path** (`text-white`). **Class diagnosed:** `dashboard/layout.tsx:11` hard-codes `bg-[#181511]`; **29** light-ink headings live in its subtree; card-borne text is fine, layout-borne text is not. The other 28 need a **measured** sweep (which sit directly on the dark surface?) — BACKLOG, not 28 guesses. |
| F-J1-2 | OTP screen overflow **442px in 360px** | **FIXED** — `min-w-0` on the `flex-1` column at `login/page.tsx:233`. Proven in the live DOM before editing: scrollWidth 442 → 360. **The OTP row was never the cause** (328px, fits); a guess would have hit the wrong element. |
| F-J1-3 | **24 of 35** tap targets < 52px, incl. both primary CTAs (48) and the 18px footer nav | **BACKLOG** — a design pass, not a walk repair. Measurements recorded in the J1 report above. |
| F-J1-4 | font floors: 10px / 12px trust line / 13px categories | **BACKLOG** — same consolidated pass. |
| F-J1-5 | language chooser offers Hindi **in roman** | **ISJ'S COPY CALL** — logged, not fixed. |

---

# J2 — PANDIT LOGIN · WALKED 2026-08-01

**Profile:** production `hmarepanditji-pandit.vercel.app`, 360×740 touch.

## 0 · 🔴 GATE FAILED — `NEXT_PUBLIC_PANDIT_URL` IS UNSET IN VERCEL

Measured on the deployed customer site: every pandit link resolves to
**`http://localhost:3002`** and every admin link to **`http://localhost:3003`**.
The env vars are not set on the web project, so my code fix (4d149a6) is
correct but **inert — the fallback fires**.

**Consequence, stated plainly:** a pandit who taps "I'm a Pandit" on the live
customer site, receives a real OTP and verifies it, is redirected to an
address that exists only on this laptop. **That door is broken in production
right now.** Fixing it is Isj's Vercel dashboard, not mine:
set `NEXT_PUBLIC_PANDIT_URL=https://hmarepanditji-pandit.vercel.app` and
`NEXT_PUBLIC_ADMIN_URL=https://hmarepanditji-admin.vercel.app` on the **web**
project, then redeploy.

**J2 did NOT walk through that door.** It used the pandit app's own front
door — which is the real-world path for a pandit and a different entrance
entirely. The crossover stays broken and unwalked until the env is set.

## 1 · ✅ F-J1-2 RE-VERIFIED ON THE DEPLOYED APP

`min-w-0` + flexing boxes + `p-5 sm:p-8` are live. Measured at 360×740:
**6 boxes, all visible, 40px each, last right edge 315 ≤ 360**;
`scrollWidth 360 = clientWidth`; **both tabs unclipped** (Customer 176,
Pandit 311). Screenshot in the gallery. The previous fix's failure — page
stopped scrolling while box 6 stayed clipped — is closed.

## 2 · ✅ PANDIT LOGIN — clean, and a different standard from the customer app

`+919000000903`, dev OTP via the on-screen keypad, no typing needed.

| screen | §3-V contrast | taps ≥52px | overflow |
|---|---|---|---|
| लॉगिन / रजिस्ट्रेशन | **0 failures** | **3/3** (56, 62, 66) | none (360=360) |
| OTP सत्यापन | 0 failures | keypad buttons large | none |
| बस दो बातें बताइए | 0 failures | — | none |

All Devanagari, correct register throughout (**डालिए · बढ़िए · बताइए ·
बनाइए**), no तुम/करो. "नंबर डालिए — खाता होगा तो लॉगिन, नहीं तो नया बनेगा।"
explains the branch before it happens. The OTP screen supplies its own large
numeric keypad — the right call for the persona, and it means the walk never
needed a keyboard.

**🟡 F-J2-1 · a duration promise:** "ओटीपी डालिए, फिर **दो मिनट का
रजिस्ट्रेशन**।" Same shape as the "दो मिनट लगेंगे" Isj struck from rejection
copy. Registration here is genuinely two fields, so it is plausibly keepable
— logged for Isj's copy call, not fixed.

## 3 · ✅ FRESH-STATE HONESTY — the eye of this journey. PASSES on every surface.

Account: zero bookings, zero poojas, PENDING. Landing: **`/onboarding`**
("बस दो बातें बताइए" — name + city only, the progressive contract), then
**`खाता बन गया!` → `/home`**. Not a blank screen, not a spinner, not English.

| surface | what it claims | verdict |
|---|---|---|
| **होम** | "नमस्ते, क्यूए-walk जी" · ⚠️ **"आधार अपलोड कीजिए — इससे यजमान आप पर भरोसा कर सकेंगे"** + button · कमाई **₹0** / आना बाकी **₹0** · 🚩 "बुकिंग पाने की तैयारी कीजिए — 5 छोटे कदम / आज़माइए →" · "आज कोई बुकिंग नहीं" | **HONEST + ACTIONABLE.** Names the next action AND its reason (trust), shows true zeros rather than hiding the section |
| **बुकिंग** | "अभी कोई बुकिंग नहीं / **मैं नज़र रखे हूँ — आते ही आपको बता दूँगा 🙏**" + the same 5-step CTA | **HONEST.** शिष्य answers in first person; the empty state reassures instead of accusing |
| **कमाई** | "कमाई यहाँ दिखेगी / **पहली पूजा का इंतज़ार है — दीया जल रहा है 🪔**" | **HONEST.** Zero fabricated figures on the money surface |
| **कैलेंडर / मेरी पूजाएँ** | not reached this turn | **UNMEASURED — J5** |

Every empty state is Devanagari, tells him what to do next, and none invents
a number. This is the standard J5's onboarding builds on.

## 4 · INSTRUMENT CORRECTION — §3-V had a false positive on the SOS control

§3-V flagged **"मदद"** at ratio **1.1** — on the safety control, which would
have been a serious finding. It is **FALSE**: the label is
`rgb(255,255,255)` on a `radial-gradient(circle, rgb(216,64,42) …)`; real
contrast ≈ **4.9:1, passing**. My checker walked `backgroundColor` only and
stepped straight past the gradient to the page background.

**§3-V is amended:** read `backgroundImage` as well as `backgroundColor`, and
where a gradient is found, report **UNKNOWN** rather than a ratio — a naive
number on a gradient is worse than no number. Emoji-only nodes are excluded
too (computed colour does not govern their rendering; the pandit login's 🙏
tripped it the same way).

**This is the campaign's own law biting its newest instrument on its first
outing** — and it caught it before the finding was reported, which is the
whole point of measuring twice.

## Ledger rows

| # | table | id | name / phone | created | journey |
|---|---|---|---|---|---|
| 2 | User + PanditProfile | id UNCAPTURED (§9 SELECT resolves it) | `क्यूए-walk पंडित J2` / +919000000903 | 2026-08-01 | J2 |

Also: `+919000000902` received a **send-otp only** during the F-J1-2
re-verification — no OTP entered, **no row created**. Recorded so the reserved
range's history is complete.

## J2 verdict

**PASSES** through the pandit app's own door, with one blocked gate
(customer→pandit crossover, env unset — Isj's dashboard), one 🟡 copy call,
and one instrument correction. **The pandit app holds a visibly higher bar
than the customer app**: 0 contrast failures vs 1.03:1, 3/3 taps vs 11/35,
Devanagari-first vs a roman language chooser.
