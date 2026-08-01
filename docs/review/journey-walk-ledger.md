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

---

# CROSS-APP DELTA — the first measured comparison (J1 vs J2)

The persona filter's twenty turns on the pandit app are visible **in numbers**,
not in impressions:

| | customer app (J1) | pandit app (J2) |
|---|---|---|
| §3-V contrast failures | **1.03:1** page heading (invisible) | **0** |
| tap targets ≥52px | **11 of 35** | **3 of 3** |
| horizontal overflow at 360 | **82px** (clipped the OTP box) | **none** |
| first-run language | roman chooser ("Hindi mein jaari rakhein") | Devanagari throughout |

# DURATION PROMISES IN PRODUCT COPY — one class, one ruling later

Isj's F-J2-1 ruling: "फिर दो मिनट का रजिस्ट्रेशन" **stays for now** (two
fields make it keepable), logged **beside the six payout-timing strings** as
the same class. **One consolidated ruling, not piecemeal.** Members:
- pandit OTP screen: "दो मिनट का रजिस्ट्रेशन"
- the six payout-timing strings (24-48 घंटे etc.) already inventoried
- (struck already: "दो मिनट लगेंगे" in identity-rejection copy)

# J2b — PARKED

**Not walked.** Re-measured on the deployed customer site this turn: pandit
links still `http://localhost:3002`, admin still `:3003`. The env vars have
not landed yet. J2b runs the moment they do.

---

# J3 — ADMIN LOGIN GATE · WALKED 2026-08-01 (to the gate only)

**Profile:** production `hmarepanditji-admin.vercel.app/login`, 360×740.

## What the gate reveals to an anonymous visitor — CLEAN

"HmarePanditJi Admin · Centralized Operations & Vetting · Sign in to Admin
Panel · Email · Password · **Authorized personnel only. Access is logged and
monitored.**" No version string, no build id, no internal hostnames, no hints
about who may log in. Nothing an attacker gains by looking.

## Failed-login leak check — PASSES, and proven three ways

Deliberately invalid credentials (never Isj's):
1. **UI error text: "Invalid admin credentials"** — does NOT distinguish
   unknown-email from wrong-password. **No user enumeration.**
2. **Direct API call from a cleared browser:** `POST /auth/admin-login` →
   **401**, body carries no token, storage stays empty.
3. **Source:** `if (!res.ok) throw new Error(...)` sits **before**
   `localStorage.setItem(ADMIN_TOKEN_KEY, ...)` — a rejected login
   structurally cannot write a token.

**🟡 F-J3-1 · wrong error code on a 401.** The body reads
`{"success":false,"message":"Invalid admin credentials","error":{"code":"INTERNAL_ERROR"}}`.
An auth rejection is not an internal error; a client branching on `code`
would mis-handle it. Cosmetic today, wrong vocabulary — logged.

## 🔴 F-J3-2 · AN ADMIN JWT WAS PRESENT IN THE BROWSER PANE — and I nearly misreported it

After the first failed login I found `hpj_admin_token`, a **247-character
JWT**, in localStorage. The obvious reading — "a rejected login writes a
token" — would have been a serious security finding **and it is wrong**. The
three proofs above show the failure path cannot write one; the token
**pre-existed** in the pane's storage.

Two things follow, both Isj's:
- **The pane carried a live admin session I was told I could not inherit.**
  I did not use it: no authed admin surface was opened, no ops action taken.
  Reported because the boundary matters more than the convenience.
- **I cleared localStorage during the clean-room test, which destroyed that
  token.** If Isj was logged into the admin panel in this browser, he is
  logged out and must sign in again. Said plainly rather than left to be
  discovered.

**The near-miss is the lesson:** the finding was one screenshot away from
being reported as "failed login issues a token". What killed it was refusing
to report until the mechanism was traced — clean-room storage, a direct API
call, and the source. A false P0 on an auth surface spends the credibility of
every real finding.

## §3 measurements at 360 — the gate is desktop-shaped

| | measurement |
|---|---|
| contrast failures | **3** — "Sign In" **3.98** (floor 4.5), "Clear Session" **3.75**, "Authorized personnel only…" **3.75** |
| tap targets ≥52px | **0 of 4** — email **42**, password **42**, Sign In **40**, Clear Session **16** |
| horizontal overflow | none (360 = 360) |
| gradient-UNKNOWN nodes | 0 (the amended §3-V ran clean here) |

**Context, stated rather than scored blindly:** admin is an ops tool Isj uses
on a desktop, so the 52px phone floor is not the same obligation it is in the
pandit app. The numbers are recorded; whether they are *defects* is a
scoping call, and it is Isj's. The three contrast misses are real at any
width.

## J3 verdict

**Gate is sound.** No information leak, no user enumeration, no token on
failure. Stopped at credentials as always — **the authed pass is Isj's**,
and it is now genuinely required since the pane's session was cleared.

### Steps for Isj (the authed half of J3/J6)
1. `https://hmarepanditji-admin.vercel.app/login` → sign in.
2. `/verifications` → **badge should read 1** (the fixture probe alone;
   Tanya left the queue when she was verified).
3. **Ceremony videos tab** → expected **EMPTY** (it fetches `?status=PENDING`
   and zero PENDING rows exist — the right sight, not a bug).
4. Screenshot both; that closes J6's authed half.

---

# J4 — CUSTOMER SEARCH + CONTROLS · WALKED 2026-08-01 (partial; stopped honestly)

**Profile:** production, 360×740, authenticated as the J1 account
(+919000000901 — session survived across turns, a **third** confirmation of
the session-P0 fix).

## 🔴 F-J4-1 · FABRICATED MUHURAT DATA ON A LIVE CUSTOMER SURFACE — new category

Phase 0 measured the muhurat API returning `{"dates":[]}` and I filed it
**EMPTY-NOT-BROKEN**. **That was wrong, and the browser corrected it.**

`/muhurat` in production renders a **fully populated** calendar:

- **"December 2024"** — on a page titled "Muhurat Calendar 2026", walked on
  **1 August 2026**. ~20 months stale.
- **"Puja List for Dec 16 · AUSPICIOUS"** with timed slots:
  Wedding **7:00 AM–12:00 PM** · Griha Pravesh **9:00–11:00 AM** ·
  Namkaran Sanskar **10:30 AM–1:00 PM** · Vahan Puja **3:00–5:00 PM**,
  each with a **"Search Pandits"** CTA.
- **"Panchang Insights — Today's Tithi: Shukla Paksha Dashami. Nakshatra:
  Revati."** presented as *today's*.
- **"PRO TIP: Golden dates are highly auspicious (Sarvartha Siddhi Yoga)."**

**It makes ZERO calls to the muhurat API.** Instrumented `fetch` during the
render: the only requests are Next RSC prefetches of `/search` links. The
values are **hardcoded in the client** — `apps/web/app/muhurat/page.tsx:231`
carries the Tithi/Nakshatra string verbatim, and the December dates live in
the same file. (The dead `src/app` tree has its twin at
`muhurat-client.tsx:219`.)

**THE CATEGORY IS NOT EMPTY-NOT-BROKEN. IT IS FABRICATED-NOT-EMPTY** — and it
is the same class as the seeded VERIFIED rows and the fake 4.8 ratings, except
on a **religious-claims surface a customer can act on**. A family reading
"Dec 16 — AUSPICIOUS — Wedding 7:00 AM" could plan around a date this platform
invented. Muhurat data was measured fabricated and **deleted from production**
for exactly this reason; the customer app never noticed, because it never
asked.

**Severity: P0 product-truth.** Not fixed at report time — this is a
product/religious claim and it is Isj's. The three shapes available: render the
real (empty) API and say so honestly; remove the surface until data exists; or
source real panchang data. **Reported, not chosen.**

### RULED 2026-08-01 (Isj) — PART ONE ONLY, and it has shipped

> "the hardcoded muhurat data is fabricated-claim cleanup, same class as the
> seeded VERIFIED and fake ratings, and its removal is approved NOW as a defect
> fix — not deferred as a product call. **The page stays; the lies go.**"

Part two — real panchang source vs removing the surface — **remains Isj's,
funded-day.** What shipped in `apps/web/app/muhurat/page.tsx`:

| was | now |
| --- | --- |
| `useState(new Date("2024-12-01"))` | the real current month; ChevronLeft/Right, previously decorative, move it |
| `const pujas = {3:{count:4}, 16:{count:8,isToday:true}, …}` | day counts from `GET /muhurat/dates?month&year` |
| inline `[{title:"Wedding", time:"7:00 AM - 12:00 PM"}, ×4]` | rows from `GET /muhurat/pujas-for-date?date=`, `timeWindow` omitted when the column is null |
| `"Today's Tithi: Shukla Paksha Dashami. Nakshatra: Revati."` | the claim is gone; the card keeps its frame and says the panchang is not available yet |
| "Search Pandits" ×4 hanging off invented dates | rendered only from an API row's own `pujaType` |
| "View 4 more pujas", "Detailed View" | removed — dead controls hanging off invented content |

The grid was also wrong independently of the fabrication: a dead `if (i < 0)`
branch and an unused `startingDayOfWeek = 0` meant December 2024 was drawn on
the wrong weekday. It is computed from the month now.

**Two laws are load-bearing in the new file and must survive edits:**
- **ERROR ≠ EMPTY.** A failed fetch must never render as "no auspicious dates"
  — that is a religious claim manufactured out of a network timeout. Same
  shape as NO SESSION ≠ NO DATA (`dashboard/bookings/page.tsx`). The empty,
  error, and loading states are three distinct renders.
- **No CTA hangs off data this app invented.**

The `src/app` twin (`muhurat-client.tsx:219`) still carries the fabrication.
It is in the dead tree and **was not touched** — deleting behaviour ships only
behind a report-first gate. It is a landmine if that tree is ever promoted.

## 🔴 F-J4-2 · THE SEARCH FILTERS ARE A DEAD CONTROL

Selected **Varanasi (Kashi)** → tapped **Update Results** → Tanya
(गाज़ियाबाद) still listed, "1 पंडित जी उपलब्ध", URL unchanged. Repeated with
**Ujjain** while instrumenting `fetch`. The request actually sent:

```
/api/v1/pandits?sort=rating&page=1&limit=10
```

**No city parameter. No experience parameter.** The selection never reaches
the API; `sort` does, so the button genuinely re-fetches — it just drops the
filter. Per the walk rule on controls that decide nothing, the severity is
**silently dropped**, and the user-facing consequence is worse than a no-op:
the app appears to assert *"this गाज़ियाबाद pandit is in Varanasi."*

Compounding it in a one-pandit world: **every filter option offered is
guaranteed to exclude the only pandit** — regions are Varanasi, Ujjain,
Haridwar & Rishikesh, Prayagraj, Mathura (she is in गाज़ियाबाद); experience
tiers are 15+/10+/5+ years (she has `experienceYears: 0`). So even once
filtering works, **the zero-result state is the DEFAULT experience** and it
has no copy at all — untested because the filter never fires.

## §3 measurements — /search

| | measurement |
|---|---|
| §3-V contrast failures | **16** — worst: "Search All India" **2.11**, "Clear All" **2.11**, "Update Results" **2.11** (the whole filter panel), then the 14-item footer at **3.92** |
| tap targets ≥52px | **0 of 19** — primary CTA "प्रोफ़ाइल देखें" **46**, Filters **24**, sort select **25**, region checkboxes **20**, experience radios **13**, footer links **18** |
| horizontal overflow | none (360 = 360) |
| gradient-UNKNOWN | 0 (the amended §3-V ran clean) |

Register on the results card stays good — पंडित जी · दक्षिणा तय नहीं ·
पहचान सत्यापित · आधार · मानव जाँच — but the **filter panel is entirely
English** ("Search All India", "Broaden your search", "REGIONS COVERAGE",
"EXPERIENCE", "Update Results", "CLEAR ALL") on a card whose results are
Devanagari. Mixed-script surface, logged for the copy pass.

## NOT REACHED THIS TURN — stated, not implied

**The ₹499 consultation checkbox (eye 3) and the booking wizard were not
walked.** Budget went to tracing F-J4-1 and F-J4-2 to their mechanisms rather
than reporting them as impressions. The wizard is the first item of J4b, with
the three-severity capture (payload / price / dropped) intact.

Also unwalked: `/pandit/[id]` authed, `/dashboard/*` sub-screens, `/nri`,
`/voice-search`, `/stitched`, the legal pages. **J4 is PARTIAL and says so.**

## J2b — still parked

Re-measured at the start of this turn: pandit links `http://localhost:3002`,
admin `:3003`. Vars not yet live.

---

# THE DEFECT CATEGORIES, ordered by severity

Recorded 2026-08-01 on Isj's ruling. **FABRICATED-NOT-EMPTY sits ABOVE
EMPTY-NOT-BROKEN** — they look alike from the server and are opposites from
the reader's seat.

### 1 · FABRICATED-NOT-EMPTY — the surface INVENTS what the server does not have

The app renders hardcoded domain data as if it were live, while a real API for
that data sits unasked or is asked and then overruled. The reader cannot tell
invented data from measured data; nothing on screen is marked.

- **Member one: F-J4-1 · muhurat.** Fixed part-one, above.
- **Member two: F-J4-3 · the booking wizard's three fallbacks.** Below.

### 2 · EMPTY-NOT-BROKEN — the surface HAS no data and the absence is honest

A route renders, the API answers, the answer is empty, and the empty state
says so. Not a defect. This is what muhurat was *filed* as and was not.

### WHY PHASE 0 MISFILED IT — the law, and it outlives muhurat

Phase 0 measured `/api/v1/muhurat/dates` and `/upcoming`, got `{"dates":[]}`
from both, and wrote **EMPTY-NOT-BROKEN**. The measurement was correct. The
**inference** was not.

> **AN INVENTORY THAT READS THE SERVER CAN MISS WHAT THE CLIENT INVENTS.**
> An empty API is evidence about the API. It is evidence about the SCREEN only
> if the screen asks. The one thing Phase 0 never measured was whether the page
> made the call at all — and it did not.

This is a **fail-by-omission** at the level of the instrument's SUBJECT, not
its matcher: every endpoint on the list was measured correctly, and the list
was of the wrong noun. The corrective is cheap and now standing: **for any
"this surface is empty" claim, the evidence is a rendered-surface reading, not
an endpoint reading.**

---

# 🔴 F-J4-3 · THE BOOKING WIZARD SHIPS FOUR PANDITS WHO DO NOT EXIST

Found by the FABRICATED-NOT-EMPTY sweep Isj ordered — the class's second
member, and it is on the **money path**.
`apps/web/app/booking/new/booking-wizard-client.tsx`.

```
const [rituals,       setRituals]       = useState<Ritual[]>(RITUALS_FALLBACK);       // :232
const [pandits,       setPandits]       = useState<PanditOption[]>(PANDITS_FALLBACK); // :233
const [travelOptions, setTravelOptions] = useState<TravelOption[]>(TRAVEL_FALLBACK);  // :234
```

`PANDITS_FALLBACK` (:109) is **four named individuals who do not exist**, with
invented ratings, invented review counts, and invented prices:

| name | city | rating | reviews | dakshina |
| --- | --- | --- | --- | --- |
| Pt. Ramesh Sharma Shastri | Dwarka | 4.9 | 312 | ₹15,000 |
| Pt. Suresh Mishra Vedacharya | Rohini | 4.8 | 187 | ₹11,000 |
| Pt. Dinesh Kumar Joshi | Noida | 4.7 | 243 | ₹8,500 |
| Pt. Avinash Tiwari | Gurgaon | 4.6 | 98 | ₹12,000 |

Production holds **one** real pandit. `RITUALS_FALLBACK` invents ten ceremonies
with prices to ₹21,000; `TRAVEL_FALLBACK` invents travel costs (₹800–₹5,500)
that **feed the total the customer is charged**.

**These are not error fallbacks. They are the INITIAL STATE**, and four
independent conditions leave them standing:

1. **First paint.** `useState(PANDITS_FALLBACK)` — they render before any
   fetch is issued.
2. **No ritual chosen.** The pandit fetch is gated `if (!form.ritualName) return;`
   (:295). Until step 1 completes, no request exists to correct them.
3. **A truthful EMPTY answer is discarded.** `if (Array.isArray(data) && data.length)`
   (:301, :386) — **an API that correctly answers "no pandits match" leaves the
   four fakes on screen.** This is the FABRICATED-NOT-EMPTY mechanism exactly:
   the honest empty is overwritten by the invention.
4. **Failure is swallowed.** `.catch(err => console.warn(...))` (:316) and a
   bare `// keep fallback` (:387). 5s `AbortSignal.timeout` — a slow network
   is enough.

**Severity: this is money and identity, so it is REPORT-ONLY and not fixed.**
A customer can select a pandit who does not exist, priced by a number nobody
set, with travel costs nobody quoted, and carry that into `Review & Pay`.
Whether it reaches a real charge is J4b's measurement, not this sweep's claim.

**Corroborating tell — nobody has ever looked at this render.** The Devanagari
inside `RITUALS_FALLBACK` is **mojibake** — UTF-8 bytes read as Latin-1.
Eleven occurrences, and the sweep found them in **exactly one file in the whole
live tree**: this one. Garbled Hindi on a booking screen is not something a
person sees and leaves. Either the fallback never rendered in front of anyone,
or nobody walked here. **Defects live on unwalked paths.**

### 🔴 ESCALATION — MEASURED, not inferred: condition 5 holds UNCONDITIONALLY

The four conditions above were a source reading. Then the live API was
measured this turn, and it produced a **fifth condition that always holds**:

```
GET https://hmarepanditji-api.onrender.com/api/v1/pandits?ritual=Griha%20Pravesh&limit=10
  top keys            : [ success, data ]
  typeof j.data       : object            <-- NOT an array
  j.data keys         : [ pandits, pagination ]
  j.data.pandits      : array, length 1   (Tanya, rating 0, totalReviews 0)
```

The wizard parses `const data = j.data ?? j.pandits ?? j` (:300). `j.data`
exists, so the `??` chain stops there — and `j.data` is the **envelope
object**, not the array inside it. `Array.isArray(data)` is therefore
**false**, and `setPandits` is **never called — on a fully successful response
containing a real pandit.**

> **THE FOUR FABRICATED PANDITS ARE NOT A FALLBACK. IN PRODUCTION THEY ARE THE
> ONLY THING THE CUSTOMER CAN SEE.** Not on error, not on timeout, not on
> empty — on success. The real pandit is fetched, parsed past, and discarded.

The customer's pandit list is four people who do not exist, rated 4.9/4.8/4.7/
4.6 with 312/187/243/98 reviews, priced ₹8,500–₹15,000. The one real pandit —
rating 0, reviews 0 — is invisible.

### The rituals fallback behaves OPPOSITELY, and the difference is the envelope

`GET /rituals` returns `data` as a **plain array**, with correct Devanagari
(`{"name":"Annaprashan","nameHindi":"अन्नप्राशन","basePriceMin":2500,…}`).
`Array.isArray(j.data)` is true, so `setRituals` DOES fire and the invented
ten-ceremony list IS replaced in production.

**This corrects a claim I made mid-walk.** I saw the mojibake render in the
ceremony dropdown at `localhost:3000/booking/new` —
`Griha Pravesh (à¤—à¥ƒà¤¹ à¤ªà¥à¤°à¤µà¥‡à¤¶) Â· 120 min` — and it rendered
because MY LOCAL STUB returned a non-array. Production returns an array.
**The mojibake is latent, not live:** it surfaces only when `/rituals` fails
or times out, which is the same 5s `AbortSignal` path. Real, lower severity,
and not what a customer sees today.

So the two fallbacks differ by exactly one thing — whether the endpoint's
`data` is the array or the envelope around it. **`/pandits` is the outlier
among its own siblings**, which is why nobody caught it by reading.

**Still unmeasured:** `TRAVEL_FALLBACK`'s POST envelope (:386, same
`Array.isArray` shape). Its invented ₹800–₹5,500 feed the customer's total.
Named as owed, not guessed at.

---

# 🔴 F-J4-2 · SEARCH FILTERS SILENTLY DROP — HIGH, its own ticket

Backlogged as its own ticket on Isj's ruling, **not folded into the design
pass**, because it is not a styling defect:

- **It is a false-claim shape.** Selecting "Varanasi (Kashi)" leaves a
  गाज़ियाबाद pandit listed under it. The app appears to ASSERT she is in
  Varanasi. Contrast with a no-op, which would at least be honest.
- **The zero-result state is the DEFAULT experience and has no copy.** Every
  region offered (Varanasi/Ujjain/Haridwar/Prayagraj/Mathura) and every
  experience tier (15+/10+/5+) excludes the only real pandit. The state every
  filtering user should land in has never been rendered — because the filter
  never fires.

Mechanism, instrumented: `/api/v1/pandits?sort=rating&page=1&limit=10`. `sort`
reaches the API; `city` and `experience` are never sent.

---

# THE SWEEP — "is muhurat the only one?"

Ordered by Isj, one turn, report-only. Instrument:
`scratchpad/fabricated-sweep.mjs`. **65 `.tsx` render units** in the live tree
(`apps/web/app` plus every local file its pages import, which reaches
`apps/web/src/components`).

**Controls, and one of them failed first and mattered.** The positive control
is the **pre-fix muhurat page pulled from git** — the real production shape,
not a specimen written to match my own matcher. First run: it passed. It
passed **for the wrong reason** — it matched the named `const pujas = {…}` and
was **blind to the inline `{[{title:"Wedding", time:"7:00 AM…"}, x4].map()}`**,
which was the sharpest fabrication on the very page I was using as the control.
**A control that passes for the wrong reason is a fail-open.** Form 2 (anonymous
array literal rendered straight into JSX) is now matched, with its own control
naming the subject and asserting all four ceremonies are seen. Scope was also
widened from page/layout files only to every render unit, after noting that a
fabricated CHILD of a fetching page would have been invisible.

**What the instrument does NOT do:** distinguish UI chrome from a domain claim.
It prints every literal's keys; the classification below is mine, by reading.

**Bucket A — literals, and the whole import subtree never asks the server: 3.**
All three are navigation/UI config, no domain claim: `DashboardNav.tsx`
(`href,icon,label`), `profile-tabs.tsx` (`key,label`), and
`RitualVariationSelection.tsx` (`REGIONS`, `VARIATIONS` — 14 ritual variations
as `id,label,desc,icon`). **The third is a genuine question, not a clean pass**:
14 ritual variations are a domain vocabulary hardcoded in the client. It makes
no false factual claim about a person or a price, so it is not this class — but
it is the vocabulary-boundary class already on Isj's desk (FIRST-CLASS vs
REQUEST `poojaType`), and it belongs to that ruling.

**Bucket B — subtree does ask, but the file also carries literals: 8.** Seven
are chrome (`tabs`, `navLinks`, `metadata`, `PUJA_CATEGORIES` as home-page
category tiles, login's icon list, Razorpay display `options`). **The eighth is
F-J4-3 above**, and it is the whole yield of the sweep.

**The honest answer to the question asked:** the class has **two** members —
muhurat and the booking wizard. It did not have one. The second is worse than
the first: muhurat invents dates, the wizard invents **people and prices**.

---

# F-J4-3 · RULED AND FIXED 2026-08-01 (Isj)

> "DELETE PANDITS_FALLBACK entirely. Four invented people with invented
> ratings and prices is never a correct fallback shape."

## What shipped

| was | now |
| --- | --- |
| `useState(PANDITS_FALLBACK)` — four invented people | `useState([])` + a `panditsState` machine |
| `useState(TRAVEL_FALLBACK)` — invented ₹800–₹5,500 | `useState([])` + a `travelState` machine |
| `const data = j.data ?? j.pandits ?? j` | `const list = j?.data?.pandits` — the documented path, and only it |
| `const data = j.data ?? j` (travel) | `const list = j?.data?.options` |
| `if (Array.isArray(data) && data.length)` — empty silently discarded | non-array **throws**; empty is a legitimate result and renders as one |
| `.catch(console.warn)` / `// keep fallback` | `setState("error")`, and error renders differently from empty |

**The `??` chain is gone on purpose, not shortened.** A chain that "tries a
few shapes" is precisely what let a wrong shape pass for a right one: it
found `j.data`, stopped, and never announced that what it found was the
envelope. Reading exactly one documented path and throwing otherwise turns a
silent wrong answer into a loud one.

## The envelope was not the only thing wrong — four field names were too

Measured against the live response for the one real pandit:

| code read | real field | what the customer would have got |
| --- | --- | --- |
| `p.displayName` | `p.name` | (already had a `??` fallback) |
| `p.city` | `p.location` | `""` — blank city |
| `p.averageRating` | `p.rating` | `0` — every pandit unrated |
| `p.baseDakshina` / `p.basePricing` | `pujaServices[].dakshinaAmount` | **₹8,000 INVENTED** — the old expression ended `?? 8000` |

The last one is the sharp one and it survived the envelope fix: price is
**per-service**, so a pandit with no priced service has **no price** — and the
code answered that absence with a number nobody set. `baseDakshina` is now
`number | null`; absence maps to null, renders as "दक्षिणा तय नहीं", and
**blocks selection**, because a ceremony whose price nobody set cannot be
booked at a price. The product gap is now visible instead of papered over.
*(This is a behaviour change — blocking — and it is flagged for Isj. The
alternative was to keep quoting ₹8,000, which is the defect.)*

## 🔴 MONEY QUESTION LEFT OPEN — NOT DECIDED HERE

`POST /travel/calculate` returns **both** `totalTravelCost` (fare + food
allowance) and `grandTravelTotal` (= that + `travelServiceFee` + GST). The map
takes the **pre-fee** figure, because `travelCost` is posted to the server
(:603) and the server owns fee math — the one-math-source rule. **If the
server does not add the travel service fee, this undercharges by ~5% + GST.**
Which figure is charged is a money ruling and it is Isj's.

## Browser proof — 360×740, three states, three screenshots

Run against a **live proxy to the production API** (every body is production's
actual response), so this is not a walk against invented data.

| state | what renders |
| --- | --- |
| **success** | **Tanya** — the real and only pandit — `rating 0 · 0 reviews · गाज़ियाबाद · SATYANARAYAN`, "दक्षिणा तय नहीं / बुकिंग अभी नहीं", card disabled, Continue disabled |
| **empty** | "इस पूजा के लिए अभी कोई पंडित जी नहीं मिले" — names the ritual |
| **error** | "पंडित जी की सूची अभी नहीं आ पाई" + "यह कनेक्शन की समस्या है — इसका मतलब यह नहीं कि कोई पंडित जी उपलब्ध नहीं हैं।" + retry |

**Honest note on the empty shot.** Production **cannot** currently produce an
empty pandit list: one pandit exists and every filter is dead (F-J4-2, and
F-J4-4 below). The empty render was therefore produced by taking production's
real envelope and emptying `data.pandits`. Stated rather than dressed up as a
production measurement.

---

# 🔴 F-J4-4 · THE `ritual` FILTER IS DEAD TOO — and it makes a false claim about a real person

F-J4-2's class, second site, and this one is worse because it names an
individual. Measured against production:

```
/pandits?ritual=Griha%20Pravesh      -> 1: Tanya [SATYANARAYAN]
/pandits?ritual=Vivah%20Sanskar      -> 1: Tanya [SATYANARAYAN]
/pandits?ritual=ZZZ-NO-SUCH-RITUAL   -> 1: Tanya [SATYANARAYAN]
```

A ritual that does not exist returns a pandit. The wizard's own heading reads
**"Choose a verified pandit for your Vivah"** above a pandit whose only
declared specialization is SATYANARAYAN — so **the app tells a family that
Tanya performs their wedding.** She has not said that.

`city`, `experience` (F-J4-2) and now `ritual` all drop. **The pattern is that
`sort` is the only query parameter that survives** — worth checking whether
any filter on this endpoint works at all before treating them as individual
bugs. HIGH, its own ticket, not fixed mid-walk.

---

# THE TWIN-ENVELOPE CLASS — joins the twin-route family

Recorded on Isj's ruling. Three sibling endpoints on the same API, consumed by
the same file, disagreeing about their own envelope shape:

| endpoint | where the array lives | client was right? |
| --- | --- | --- |
| `GET /rituals` | `j.data` — data **IS** the array | ✅ yes |
| `GET /pandits` | `j.data.pandits` — data is an envelope | ❌ no |
| `POST /travel/calculate` | `j.data.options` — data is an envelope | ❌ no |

> **SIBLINGS THAT DISAGREE ABOUT THEIR OWN ENVELOPE SHAPE ARE WHY READING
> NEVER CATCHES THIS.** Every one of the three parses looks correct beside its
> own `fetch`. They are only wrong beside the endpoint, and nobody reads a
> client file and a controller file in the same sitting. The defect lives in
> the space between two files that are each individually fine — the same
> reason the twin-route 404s survived.

The general corrective is not "read more carefully": it is that **the envelope
is a contract and nothing enforces it.** A class-level audit of every
consumption site against its endpoint's real envelope is the instrument that
finds these; a reading is not.

**The sweep instrument's control-passed-for-the-wrong-reason note stands
verbatim** (see THE SWEEP, above): the positive control first passed by
matching the named `const pujas` while blind to the inline JSX array that was
the sharpest fabrication on the same page. That is the same failure mode as
this class — an instrument that agrees with itself and never meets its subject.

---

# ALSO FIXED IN PASSING — the mojibake that actually rendered

The earlier count (11) was of the deleted fallback. After deletion, **three
sites remained that a user actually saw**, and I saw them in the browser
(`Tanya ★ 0 Â· 0 reviews Â· गाज़ियाबाद`):

- `:897` the ritual dropdown's duration separator
- `:1157`, `:1159` the pandit card's meta separators

All three were `Â·` (UTF-8 `·` read as Latin-1) and are now `·`. The remaining
~1,080 mojibake sequences in this file are inside comment box-drawing rules
and en-dashes — **they render nothing** and were left alone rather than
touched in a diff nobody can review.

---

# STILL OPEN AFTER THIS TURN

- **J4b proper**: wizard to the last pre-payment step, the ₹499 checkbox with
  its three-severity capture, `/pandit/[id]` authed, the dashboard tree.
  The wizard now runs on real data, which is the only walk worth having — but
  note the walk currently **stops at step 1**, because the one real pandit has
  no priced service and cannot be selected. That is the truth, and it is a
  product finding in itself: **today, no customer can complete a booking.**
- **J2b**: re-measured this turn — `localhost:3002` is still baked into three
  deployed chunks. Vars not set.
- **`apps/web/src` condemned-tree ruling**: the muhurat twin
  (`src/app/muhurat/muhurat-client.tsx:219`) still carries the fabricated
  calendar. Added to the queue for one ruling covering the whole tree.

---

# 🔴 CORRECTION TO MY OWN F-J4-3 FIX — the block was wrong, and I caught it before reporting

The first cut of the fix **blocked selection** of any pandit whose
`pujaServices` carried no price, and I was about to report "today, no customer
can complete a booking" as a product finding.

**That was wrong, and re-reading the file refuted it.** `dakshina` is *already*
set at ritual selection (`:890`, `:350`) from the ritual row's
`baseDakshina ?? basePriceMin` — a **real API value**. There are two honest
price sources, not one:

1. the pandit's own rate — `pujaServices[].dakshinaAmount`
2. the **ceremony's** base — the ritual row's `basePriceMin`

Falling back from (1) to (2) is not invention. It is quoting the ceremony base
**and saying so**. What was never a source is the hardcoded `?? 8000`. Only
when **both** are absent is there genuinely no price, and only then is
selection blocked.

Shipped: `quoted = p.baseDakshina ?? ritualBase`, and the label names the
source — `पूजा की आधार दक्षिणा` when the ceremony base is being quoted,
`Dakshina` when it is the pandit's own rate. **A ceremony-base quote must not
be readable as this pandit's rate.**

> **THE LESSON IS THE ONE THIS CAMPAIGN KEEPS RE-LEARNING.** Deleting an
> invented number told me a price was missing. It was not missing — it was in
> a different, honest place I had not looked. **An absence found by removing a
> lie is not automatically a real absence.** The over-conservative reading was
> about to become a false P0 in Isj's inbox, which is exactly the credibility
> cost of the admin-JWT near-miss.

**Re-verified in the browser, 360×740, against the live production proxy:**
Tanya renders at **₹2,100** labelled **पूजा की आधार दक्षिणा** (Satyanarayan
Puja's real `basePriceMin`), the card selects, and **Continue enables.** The
booking flow proceeds on real data.

## Also fixed: the money formatter was mojibake

`fmt()` at `:239` — the formatter for **every price in the wizard** — emitted
`â‚¹` instead of `₹`. Seen in the browser as `â‚¹2,100` on the pandit card.
Two more at `:661`/`:662` (the ₹499 muhurat consultation and ₹9,999 backup
strings). Three sites, one file, all fixed. Nothing else in the live tree
carried it.

**Note for J4b's ₹499 capture, found in passing at `:661`:** the consultation
flag is composed into a **specialInstructions sentence**
(`"Muhurat consultation requested (₹499)."`), not into a priced payload field.
That is evidence toward the *decorative* / *priced-but-undelivered* end of the
three-severity scale, but the capture is not done — the payload still has to
be watched at submit. Recorded as a lead, not a verdict.

---

# THE ENVELOPE-MISMATCH AUDIT — the class, swept

Ordered by Isj as item 5's class ("siblings that disagree about their own
envelope shape"). Run as a 20-agent workflow: map every endpoint's real
envelope, map every consumption site's unwrap expression, cross-check, then
**two independent adversarial verifiers per candidate** — one told to refute
the parse claim, one told to refute *reachability*. A candidate survives only
if **neither** verifier can kill it.

**187 endpoints mapped · 187 consumption sites · 8 candidates · 3 CONFIRMED ·
5 REFUTED.**

**The refutations are the point.** All five died on reachability, not on the
parse: `apps/web/src/components/home/featured-pandits.tsx` (zero importers),
`apps/web/src/components/muhurat/muhurat-page-client.tsx` (zero importers),
`apps/web/src/app/pandit/[id]/page.tsx` (dead tree, never built),
`apps/pandit/src/lib/deepgramSTT.ts` and `sarvam-tts.ts` (orphaned paths —
and the verifier explicitly noted the `src/app`-is-dead rule is specific to
**apps/web** and does **not** transfer to apps/pandit, whose live tree IS
`src/app`). **Five real text-level mismatches that would each have been a
false finding.** Without the reachability verifier this audit would have
reported 8 defects and been wrong about 5 of them.

## 🔴 F-J4-5 · P0 · THE PUBLIC PANDIT PROFILE SHOWS AN INVENTED ₹4,300 TRAVEL QUOTE

`apps/web/app/pandit/[id]/TravelOptionsTab.tsx:33` — **the third
FABRICATED-NOT-EMPTY member, and it is live on every pandit profile now.**

Two independent defects stacked:

1. **The URL is same-origin and nothing serves it.** It calls
   `fetch("/api/travel/calculate")` — relative, no `API_BASE`. `apps/web` has
   no `app/api/**` handler and `next.config.js` declares no rewrites, so it
   **404s on 100% of traffic**. A Next 404 *returns* a response rather than
   throwing, so `res.ok` is false and the **`else` branch** fires — not the
   `catch`.
2. **That else branch substitutes a hardcoded quote**: TRAIN, **₹4,300**,
   845 km, 11 h, breakdown ₹2,500 base + ₹1,600 local cab + ₹1,000 food. The
   in-code comment says "fallback / mock if route not fully ready."

Live: imported at `apps/web/app/pandit/[id]/page.tsx:5`, rendered at `:159`,
behind a visible "TRAVEL OPTIONS" tab — one tap from any public profile.

**And fixing the URL alone would not fix it.** `setOptions(data.data || [])`
reads one level too shallow; the array is at `data.data.options`. On a fully
successful response it would store the envelope object and render "no options."
**Both halves must land together** — the identical pair already fixed in the
booking wizard this turn, never propagated here.

**This is money on a public surface. REPORT-ONLY — not fixed.** The fix is
mechanical and mirrors the wizard exactly; it awaits Isj's word.

**Context that sharpens it:** the un-prefixed `/travel/...` 308 forgiveness
shim was **deleted 2026-07-29** on the stated premise that "all 26 client call
sites now resolve through resolveApiBase." **This site violated that premise
and nothing caught it.** The shim's removal is what turned a working call into
a permanent 404 — a deletion whose safety rested on a claim nobody tested.

## 🔴 F-J4-6 · HIGH · THE AVAILABILITY CALENDAR NEVER ASKS

`apps/web/app/pandit/[id]/AvailabilityCalendar.tsx:20` — same relative-URL
class (`/api/pandits/:id/availability`). Permanent 404 → `setDates([])` on
every load, with an empty-bodied catch that logs nothing. Every public profile
shows no availability, forever, and **a customer cannot tell "this pandit
published no availability" from "the app never asked."** That is
EMPTY-NOT-BROKEN worn as a costume by a broken call — the exact confusion the
category ordering exists to prevent.

## 🔴 F-J4-7 · HIGH · THE PANDIT APP INVENTS A PUJA THE PANDIT NEVER REGISTERED

`apps/pandit/src/app/(dashboard-group)/samagri/page.tsx:49` — **fires on a
fully successful 200.** When `/auth/me` truthfully reports a pandit with **no**
registered specializations, the empty array is discarded and the literal
`["SATYANARAYAN"]` is substituted. The pandit is then shown a सामग्री package
editor **for a puja he never registered**, and anything he saves is written
against a `pujaType` he did not choose.

This is the same "empty is not a value worth keeping" mistake as
`PANDITS_FALLBACK` — but pointed at the **pandit**, and it writes. Same file
`:36` dereferences `res.data.user` with no optional chain. **Report-only:
identity-adjacent and it writes.**

---

# THE INSTRUMENT NOTE THAT MATTERS MORE THAN THE FINDINGS

Three of eight candidates survived. **The five that died were not sloppy
matches — every one was a genuine text-level envelope mismatch.** They were
killed by asking a question the parse-checker structurally cannot ask: *can a
user reach this line?*

> **A MISMATCH IS NOT A DEFECT UNTIL SOMEONE CAN REACH IT.** The parse
> verifier and the reachability verifier are not redundant reviewers of one
> claim — they adjudicate two different claims that both have to be true. A
> single-verifier pass would have shipped a 62%-wrong report with full
> confidence, and each false finding would have spent the credibility of the
> three real ones.

This is the same shape as the sweep instrument's control that passed for the
wrong reason: an instrument agreeing with itself is not evidence.

---

# TWO LAWS, RECORDED VERBATIM ON ISJ'S INSTRUCTION (2026-08-01)

> **AN ABSENCE FOUND BY REMOVING A LIE IS NOT AUTOMATICALLY A REAL ABSENCE.**

> **A single-verifier pass would have shipped a 62%-wrong report with full
> confidence, and each false finding would have spent the credibility of the
> three real ones.**

---

# DELETION-ON-PREMISE — a new class, recorded on Isj's ruling

**Definition.** A deletion is justified by a stated premise about the rest of
the system; the deletion ships; **the premise is never verified**; the premise
is false; the deletion silently breaks whatever the premise excluded.

**Member one, and it is why F-J4-5 and F-J4-6 existed.** On **2026-07-29** the
un-prefixed 308 forgiveness shim was removed from `services/api/src/app.ts`.
The stated reason, in the code that replaced it: *"all 26 client call sites now
resolve through resolveApiBase."* At least **two did not** —
`TravelOptionsTab.tsx` and `AvailabilityCalendar.tsx`, both on the public
pandit profile — and both have 404'd on **100% of traffic** ever since. One
answered the 404 with an invented ₹4,300; the other answered it with a
permanently blank calendar.

> **A DELETION'S PREMISE NEEDS THE SAME VERIFICATION AS A GUARD'S SCOPE.**
> "All N call sites do X" is exactly the shape of claim this campaign has
> already learned not to accept from prose — it is a countable assertion about
> a set, and the set was never enumerated. The instrument's SCOPE is a claim;
> so is a deletion's PREMISE. Neither is true because it is written in a
> comment.

The corrective is cheap and now standing: **any deletion whose safety rests on
"everything now does X" ships with the enumeration that proves it**, or it
ships behind the report-first gate with the enumeration named as owed.

---

# THE THREE RULED FIXES

## F-J4-5 — the TRAVEL OPTIONS tab is removed, not repointed

Per ruling, the URL was **deliberately not** pointed at the real API: travel is
cut from v1, and wiring a live call to serve a cut feature is fixing the wrong
thing. The tab, its wiring, and the component file are gone.

**Dependency check ran before acting, as instructed.** Only `page.tsx`
imported it. Its "Select This Option" CTA passed `travelMode`/`fromCity`/
`toCity` — and the booking wizard reads only `panditId`, `ritual`, `date`. **So
that CTA was already a dead control dropping its own parameters**, which is a
second finding the removal makes moot. Nothing else depended on it; no layout
broke; four tabs remain (ABOUT · SERVICES & PRICING · REVIEWS · AVAILABILITY),
verified in the browser at 360×740.

## F-J4-6 — the availability calendar, fourth application of ERROR ≠ EMPTY

URL now resolves through `API_BASE`. The empty-bodied catch became the honest
pair: **"उपलब्धता अभी लोड नहीं हो पाई / यह कनेक्शन की समस्या है — इसका मतलब यह
नहीं कि पंडित जी उपलब्ध नहीं हैं"** with a working retry, distinct from
**"इस महीने की उपलब्धता दर्ज नहीं है"**.

**The parse was already correct** — measured, this endpoint returns
`{success, data: [ {date,status} ], message}` and `data` **is** the array.
Only the URL was wrong. Which produces the sharpest fact of the fix:

> **The one verified pandit is available every day of August and September
> 2026. That data has been in the database the whole time. No visitor has ever
> seen it.** Verified in the browser: the calendar now renders a full month of
> green availability where it had rendered nothing since the shim's deletion.

## F-J4-7 — the substitution is gone from the pandit's सामग्री screen

`: ["SATYANARAYAN"]` deleted. A truthful empty now renders as
**"अभी आपने कोई पूजा नहीं जोड़ी है"** with the path out — a **पूजा जोड़िए**
button to `/my-poojas/add`. An empty list is a fact worth showing, not a value
worth replacing.

### 🔴 The save leg — MEASURED, REPORTED, NOT TOUCHED (as ruled)

**The server ACCEPTS it.** `POST /pandits/me/samagri-packages` →
`manageSamagriPackage("create", …)` (`services/api/src/services/pandit.service.ts:47`)
validates **items only** (F12-02: every item needs quantity + brand) and takes
`pujaType` straight from the body. **Nothing checks `pujaType` against the
pandit's registered `specializations`.** So a package for an unregistered पूजा
is written and persisted.

That is the **writer/reader finding one level down** Isj anticipated: the
client substitution made it *easy* to hit, but the client was never the only
way to hit it — any caller can. Report-only; it is a writer rule and writer
rules have been this campaign's most expensive class.

---

# 🔴 TWO DEAD CONTROLS CAUGHT IN MY OWN NEW CODE, BEFORE SHIPPING

Both were written by me, this turn, **while fixing dead controls.**

1. **The retry button that could not retry.** First draft:
   `onClick={() => setYear((y) => y)}`. Same value → React bails out → the
   effect never re-runs → the button does nothing. Fixed with a monotonic
   `reloadKey` in the dependency array.
2. **The CTA to a route that does not exist.** First draft pushed
   `/poojas/add`. The real route is **`/my-poojas/add`** — it lives at
   `(dashboard-group)/my-poojas/add` and **a route group does not appear in the
   URL.** Verified against the filesystem before shipping.

> **THE AUTHOR OF A FIX IS NOT EXEMPT FROM THE DEFECT CLASS HE IS FIXING.**
> Both would have shipped as new dead controls inside commits whose subject
> line is about dead controls. Neither was caught by typecheck — a button that
> does nothing and a `router.push` to a non-route are both perfectly typed.

---

# THE PREMISE AUDIT — the enumeration the shim deletion never got

Ordered by Isj. Same two-verifier discipline: one agent tries to refute
**"nothing serves this path"** (route handlers, rewrites, middleware,
vercel.json, the shim's own surviving list), a second tries to refute
**reachability**. A site survives only if neither can.

**36 same-origin/relative fetch sites across all three apps · 12 unserved
candidates · all 12 verified (none dropped) · 2 distinct sites CONFIRMED ·
8 REFUTED.**

**Both confirmed sites are the two already fixed above** —
`TravelOptionsTab.tsx:33` and `AvailabilityCalendar.tsx:20`. Three of the
"confirmed" rows are the same TravelOptionsTab site reported independently by
all three per-app sweepers; deduplicated it is two.

> **THE CLASS HAS EXACTLY TWO LIVE MEMBERS AND BOTH ARE NOW CLOSED.** That is
> the honest size, and it is smaller than I expected when I ordered the sweep.
> Reporting it as small is the point of having run it.

**The eight refutations, each on reachability or served-ness:**

| site | why it is not a defect |
| --- | --- |
| `apps/web/src/lib/puter-ai.ts:43`, `:63` (`/api/chat`) | dead tree — sole mount point is `apps/web/src/app`, which Next never builds |
| `apps/web/src/hooks/useRazorpay.ts:54` (`/api/payments/verify`) | **zero importers** |
| `apps/web/src/lib/hooks/useDeepSeek.ts:76`, `:151` (`/api/v1/ai/chat`) | zero importers (`useDeepSeekSimple` doubly so) |
| `apps/pandit/scripts/kyc-roundtrip.mjs:232` | **the routing sub-fact is true but the conclusion is false** — the line runs inside a Playwright `page.evaluate`, where the fixture's own origin serves it |
| `apps/pandit/src/lib/firebase.ts:109` | the fetch is **commented out**, and zero importers |
| `apps/pandit/src/lib/webotp.ts:82` | commented out, and zero importers |

The `kyc-roundtrip.mjs` verdict is the most instructive: the verifier confirmed
the path is unserved by the app **and still refuted the finding**, because the
line only ever executes in a context that does serve it. A checker that reasons
only about URLs would have called that a defect.

**One incidental worth its own line:** `useRazorpay.ts` — a **payment
verification** hook — has zero importers. Dead payment code is not a defect
today, but it is the kind of thing that gets resurrected by someone who assumes
it works. Filed, not acted on.

**Instrument honesty note.** The audit read the working tree **while I was
editing it**, and its report contains a residual claim that `page.tsx` still
carries an unused `TravelOptionsTab` import. Re-checked after the fact: no
source reference to `TravelOptionsTab` remains anywhere in `apps/web`, and the
component file is deleted. **A snapshot of a moving tree is a claim about a
moment, not about the repository** — worth remembering before trusting any
agent's file reading taken concurrently with edits.

---

# THE PARKED TRAVEL-MONEY QUESTION — ANSWERED, one line as asked

**The server ADDS the travel fee on top of the submitted figure, so it expects
the PRE-FEE number** — `travelServiceFee = travelCost × TRAVEL_SERVICE_FEE_PERCENT / 100`,
then `grandTotal = dakshina + samagri + travelCost + food + accommodation +
platformFee + platformFeeGst + travelServiceFee + travelServiceFeeGst`
(`packages/utils/src/index.ts:90-94`, mirrored in `pricing.ts:193-198` and
`services/api/src/utils/pricing.ts`).

**Therefore mapping `totalTravelCost` was correct and `grandTravelTotal` would
have DOUBLE-CHARGED the customer the travel fee and its GST.** The parked
question is closed by measurement rather than by Isj having to rule on it.

---

# THE DEAD-CONTROL CLASS IS STRUCTURALLY INVISIBLE TO TYPECHECK

Recorded on Isj's instruction, with this turn's two self-caught specimens as
the proof:

| specimen | why it did nothing | what a compiler sees |
| --- | --- | --- |
| `onClick={() => setYear((y) => y)}` | same value → React bails out → the effect never re-runs → the retry button cannot retry | a valid state setter with a correct signature |
| `router.push("/poojas/add")` | the route is `/my-poojas/add`; route groups do not appear in the URL | a string passed to a function that takes a string |

> **BOTH WERE TYPE-PERFECT AND BOTH DID NOTHING.** No compiler, linter, or type
> system can distinguish a button that works from a button that does not,
> because the defect is never in the types — it is in the relationship between
> a value and the world. That is why the dead-control law needs a WALK, and why
> the walk cannot be replaced by a build.

They were also written **by the author of the dead-control fixes, inside the
commits that fix dead controls.** The class does not respect who is looking
for it.

# FABRICATED-NOT-EMPTY'S MIRROR — recorded verbatim on Isj's instruction

> **The one verified pandit is available every day of August and September
> 2026. That data has been in the database the whole time. No visitor has ever
> seen it.**

**THE TRUTH EXISTED AND WAS INVISIBLE while the fabrication rendered.** The two
faults are one fault seen from two sides: on the same public profile, in the
same page load, an invented ₹4,300 travel quote was displayed to every visitor
while real availability data sat unrequested one component away. A surface that
will invent is also a surface that will not ask.

---

# 🔴 F-J4-8 · NO CUSTOMER CAN BOOK THE ONLY VERIFIED PANDIT — P0, TWO SCRIPT BUGS STACKED

Found by walking, not by reading. The wizard reaches **step 2 of 6 and stops.**

**The API's own words**, captured through the walk proxy:

```
POST /api/v1/travel/calculate
  -> 404 {"success":false,"message":"Distance not found between गाज़ियाबाद and Delhi"}
```

Two independent defects, either of which alone would block:

**1 · SERVER — the distance matrix is keyed in English; the pandit's city is
stored in Devanagari.** `GET /travel/cities` returns
`["Delhi","Faridabad","Ghaziabad","Greater Noida","Gurgaon","Haridwar","Jaipur","Noida","Varanasi"]`.
`PanditProfile.location` for the only verified pandit is `गाज़ियाबाद`. The
lookup can never hit, **for any venue city**, including Ghaziabad itself.

**2 · CLIENT — `isOutstation` compares across the same script boundary**
(`booking-wizard-client.tsx:507`):

```ts
const isOutstation = selectedPandit.city.trim().toLowerCase() !== form.venueCity.trim().toLowerCase();
```

`selectedPandit.city` is `गाज़ियाबाद`; `form.venueCity` comes from
`DELHI_CITIES`, which is **English-only**. A Devanagari string can never equal
an English one, so **`isOutstation` is permanently true** — the booking is
treated as outstation even when the venue is the pandit's own city.

**The gate closes at `case 2: return !isOutstation || !!form.travelMode`.**
Outstation is always true, `travelMode` can never be set because there are no
options, so **Continue is permanently disabled.** Verified in the browser at
360×740: the button renders greyed and does not advance.

> **A SCRIPT BOUNDARY THAT NOBODY DECLARED.** This is the same family as the
> `\b`-cannot-match-Devanagari lesson, one layer up: there the matcher assumed
> ASCII word boundaries; here the *data model* assumes one script for storage
> and another for lookup, and no type, guard, or test spans the two. `string`
> is the same type in both scripts — **TYPES VERIFY SHAPE, NOT MEANING**, and a
> script is meaning.

**This is money and it is data-model. REPORTED, NOT FIXED.** The fix is a
ruling, not an edit: either the city vocabulary becomes one canonical set with
a display layer, or the matrix is keyed by an id rather than a name. Both are
Isj's.

**One thing worth saying plainly about the fix that preceded it:** before
F-J4-3, this failure was invisible — the wizard would have shown four
fabricated travel options (₹800–₹5,500), the customer would have picked one,
and the booking would have proceeded on invented money. **Deleting the
fabrication is what made the real blocker visible.** The honest error state is
now doing exactly the job it was built for: it says "यात्रा का खर्च अभी नहीं आ
पाया" instead of quietly inventing a price.

---

# J4b — WALKED, AND IT IS PARTIAL BECAUSE A P0 BLOCKS IT

Environment: local `apps/web` against a **live proxy to the production API**
(every response is production's), 360×740, authenticated as the J1 customer.

**Payment-path interception, stated for the record.** The proxy was extended to
capture-and-kill every non-GET to `/bookings`, `/payments/`, `/notifications`.
Those requests are logged in full and **never forwarded**. TANYA IS OFF LIMITS
is absolute, and a booking against her would be a real row and a real message
to a real phone. The payload is the evidence; the booking is not mine to make.
In the event the interception never fired — the walk never got that far.

| item | status |
| --- | --- |
| 1 · wizard to last pre-payment step | **BLOCKED at step 2 of 6 by F-J4-8.** Not caution — the Continue button is disabled by the app's own gate. |
| 2 · ₹499 payload at submit | **NOT CAPTURED — unreachable.** The checkbox lives at step 4; the walk cannot pass step 2. The `:661` reading (composes into a `specialInstructions` sentence) therefore **remains a source lead and is NOT promoted to a verdict.** Three severities still stand undecided. |
| 3 · `/pandit/[id]` | **WALKED.** Four tabs (ABOUT · SERVICES & PRICING · REVIEWS · AVAILABILITY) — TRAVEL OPTIONS confirmed gone. Availability calendar populated with real data. |
| 4 · dashboard tree | **ROOT ONLY.** `/dashboard` renders the *truthful* empty — "अभी तक कोई बुकिंग नहीं है" — under a live session, confirming NO SESSION ≠ NO DATA still holds. Nav: HOME · BOOKINGS · PANDITS · PROFILE. The per-screen §2 sweep was NOT done. |
| 5 · §3-V and §9 per screen | **NOT RUN this turn.** |

**J4b is PARTIAL and says so.** Item 2 is not deferred by choice — it is
unreachable until F-J4-8 is ruled, and it will stay unreachable for J9 too.
**F-J4-8 gates J9 exactly as it gates this.**

## LEDGER ROW — the J1 User id, finally captured

The §C table has carried **"id UNCAPTURED"** since the J1 walk. The login this
turn passed through the walk proxy, and `GET /auth/me` returned it:

| # | table | id | name / phone |
| --- | --- | --- | --- |
| 1 | User | **`cms9yhwfd0000hk3nb7d66g2z`** | `क्यूए-walk यजमान J1` / +919000000901 |

No new rows were created this turn. **Recorded here rather than by editing the
original row in place, so the gap and its closing both stay visible** — the
§9 SELECT Isj was owed is now unnecessary.

**Hygiene note:** the proxy log captured a live customer JWT in transit. It
lives only in the session temp directory and **was never written to the repo**;
no token value appears in this ledger or any commit.
