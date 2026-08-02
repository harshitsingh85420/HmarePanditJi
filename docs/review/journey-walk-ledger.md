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

---

# RECORDED VERBATIM ON ISJ'S INSTRUCTION

> **DELETING THE FABRICATION IS WHAT MADE THIS VISIBLE** — the four invented
> travel options were standing in front of this wall. **A lie doesn't just
> misinform; it hides the broken truth behind it.**

---

# F-J4-8 · LEVEL 1 — SHIPPED AND WALKED THROUGH

`cityKey()` in `booking-wizard-client.tsx`: a normalisation map over the
cities this platform actually serves (`/travel/cities` + the `DELHI_CITIES`
dropdown), applied **at the comparison site only**. No transliteration
library; the server matrix untouched.

**Nukta is normalised, not enumerated.** NFD decomposes `ज़/फ़/ड़` into base +
U+093C, which is stripped — so `गाज़ियाबाद` and `गाजियाबाद` collapse to one
key and each city needs one alias, not two.

**The control (`docs/review/citykey-control.mjs`) plants on the REAL production
string, not a specimen I invented.** It prints the codepoints —
`U+917 U+93E U+91C U+93C U+93F …` — showing the nukta actually present, and
then asserts the collapse. Five positive cases, five negatives proving it still
tells cities apart (`Noida ≠ Greater Noida`, unknown ≠ unknown, unknown ==
itself so nothing silently merges).

**Browser proof, 360×740, live production proxy, authenticated:** venue
**Ghaziabad** + pandit **गाज़ियाबाद** → Travel marks ✓ and is skipped →
**step 3 · Ritual Details** → step 4 · Preferences → **step 5 · Review & Pay.**
The gate opens. That is J9's path.

**Stated plainly, because Level 1 is not the whole fix:** OUTSTATION bookings
still fail. The server matrix is still English-keyed and this fix deliberately
does not touch the travel CALL, so a Delhi customer booking the गाज़ियाबाद
pandit still gets the honest "यात्रा का खर्च अभी नहीं आ पाया".

## LEVEL 2 — the two shapes, with costs. NOT BUILT. Isj's ruling.

**Shape A · one canonical city vocabulary.** Introduce a single served-cities
list (id + English name + Devanagari name) in `packages/types`, make
`PanditProfile.location` and every venue dropdown write the **id**, and render
the display name per locale. Cost: a data migration over every existing
`PanditProfile.location` and `Booking.venueCity` (small today — one pandit —
and it only gets more expensive), plus a writer rule so onboarding can never
store a free-text city again. Benefit: the boundary disappears rather than
being papered over, and the same list becomes the search filter's vocabulary,
which is where F-J4-2's dead city filter also lives. This is the fix that
retires a whole class.

**Shape B · id-keyed distance matrix only.** Leave `location` as free text;
re-key `travel.service`'s matrix by city id and have the client resolve
name → id through the alias map before calling. Cost: much smaller — no
migration, one server change plus reusing `cityKey` at the call site. Benefit:
outstation travel starts working this week. Weakness: the alias map remains the
single point of truth for a mapping nobody owns, and every new city needs a
code change in two places. **It fixes the symptom on the money path; Shape A
fixes the model.**

---

# 🔴 THE ₹499 VERDICT — DECIDED BY THE PAYLOAD, AS RULED

Walked to Review & Pay, ticked **Muhurat Consultation**, and submitted through
the capture-and-kill proxy. **The booking POST was captured in full and never
forwarded — 0 booking requests reached production, Tanya untouched.**

**Price movement, measured on screen:**

| line | before tick | after tick |
| --- | --- | --- |
| **Pay Now** (the online charge) | ₹2,310 | **₹2,310 — unchanged** |
| **Settled at booking** | ₹8,000 | **₹8,499 — +499** |

**The captured body**, verbatim (`POST /api/v1/bookings`):

```json
{ "eventType":"Satyanarayan Puja", "panditId":"cmriymyqo0000et35bg7uhir6",
  "eventDate":"2026-09-15T03:30:00.000Z", "muhuratTime":"09:00",
  "venueAddress":"क्यूए-walk venue, Block A, Delhi", "venueCity":"Ghaziabad",
  "venuePincode":"201001", "attendees":11, "dakshinaAmount":2100,
  "travelCost":0, "foodArrangement":"CUSTOMER_PROVIDES", "foodAllowanceDays":0,
  "accommodationArrangement":"NOT_NEEDED", "samagriPreference":"PANDIT_BRINGS",
  "samagriAmount":8000, "samagriNotes":"Pandit fixed package | Total: ₹8,000",
  "specialInstructions":"Samagri path: Pandit's Fixed Package. | Local booking (no accommodation required). | Muhurat consultation requested (₹499)." }
```

**VERDICT: `priced-but-undelivered` — the middle severity.**

- **Not *charged-for-nothing*.** Pay Now did not move; the online charge
  excludes it. The display=charge rule holds.
- **Not *decorative*.** It is not inert: it moved a money figure the customer
  is told they owe, and it travels to the server.
- **It is priced and unbuilt.** The customer is quoted ₹499 and told to hand it
  to the pandit at the puja. The system's entire record of that promise is an
  **English prose sentence inside a free-text notes blob**. Nothing schedules a
  15-minute call, nothing assigns it, nothing bills it — and J8b already
  established the consultation flow has **zero API surface**.

**The decisive detail is what sits beside it.** `samagriAmount: 8000` is a
first-class priced field in the same payload. The wizard *can* send add-on
money. The consultation simply was never wired — so this is a wiring gap, not
a design decision, and it is invisible to anyone reading only the screen.

---

# 🔴 F-J4-9 · THE SAMAGRI COMPARISON IS ENTIRELY FABRICATED — fourth member

`apps/web/src/components/samagri/SamagriModal.tsx`. **`const panditTotal = 8000;`**
(`:105`) — the screen labels it **"Pandit's Fixed Package · Premium Brands ·
₹8,000"**, i.e. it attributes a price to **a specific, real, named pandit who
has no samagri packages at all** (her `pujaServices` is `[]`). `COMPARISON_ITEMS`
(`:20`) hardcodes the whole catalogue: brands, premium prices, "market" prices,
per-item `savings: "18% less"` claims, and five embedded image URLs.

**Consequence measured in the walk:** the fabricated ₹8,000 flows into
`samagriAmount: 8000` **in the real booking payload** and onto the Review
screen as *"Settled at booking — paid directly to Pandit Ji"*. **The customer
is instructed to hand ₹8,000 to Tanya at the puja for a package she never
created.** Money + a claim about a real person. **REPORT-ONLY.**

**One item's savings claim is false even inside the invented data:** Whole
Coconut — premium **₹50**, "market" **₹80**, labelled **"20% less"**. It is 60%
*more*.

## The near-miss I refuted myself, recorded because it matters

From the rendered text order I read "You Save ₹7,115" as sitting on the ₹8,000
card — an inverted-savings P0. **The source refuted it.** The badge (`:175`) is
`absolute`-positioned inside the **Build Custom List** column (`:173`), so it
appears earlier in text flow than it does on screen. It is on the cheaper
option and it is correct. **Rendered text order is not layout**, and one more
false P0 was one paragraph away.

---

# 🔴 MY OWN SWEEP HAD A SILENT CAP, AND IT HID THIS

The FABRICATED-NOT-EMPTY sweep bounded its literal-matching regex at
`{0,2600}`. `COMPARISON_ITEMS` is **3,387 chars** — inflated past the cap by
five ~380-char `googleusercontent` image URLs — so the lazy quantifier ran out
and **the regex did not match a file the sweep had opened and scored as clean.**
The sweep then reported "the class has exactly two members."

> **I WROTE "NO SILENT CAPS — LOG WHAT WAS DROPPED" AS A RULE FOR
> ORCHESTRATION AND THEN SHIPPED ONE INSIDE A REGEX.** A bound that is not
> reported is indistinguishable from an absence. This is the same failure as
> the control that passed for the wrong reason, and the same failure as the
> deletion-on-premise: **an instrument's limits are part of its claim, and an
> unstated limit is a false claim.**

Fixed: cap raised to 40,000 and any literal that still reaches it is
**REPORTED, not dropped**. Re-run surfaces `COMPARISON_ITEMS ×10` in Bucket A.
**Residual limit, stated rather than hidden:** `panditTotal = 8000` is a
*scalar*, and an object-literal matcher cannot see scalar prices at all. The
sweep's true coverage is "fabricated **collections**", never "fabricated
**values**".

---

# TWO MORE, FOUND ONLY BY WALKING

**🔴 F-J4-10 · PRIMARY PANDIT renders BLANK on a deep link.** Arriving via
`/booking/new?panditId=…` pre-selects the pandit, but `panditName` is only set
by the card's `onClick`. A customer who never taps the card reaches **Review &
Pay with an empty PRIMARY PANDIT field** — the final confirmation screen does
not name who is coming. Same class as the ops list's blank name.

**🔴 F-J4-11 · the booking address contradicts its own city.** Captured
payload: `"venueAddress": "…, Block A, Delhi"` while `"venueCity": "Ghaziabad"`.
`venueState` is a separate field defaulting to **"Delhi"**, never synced when
the city changes, and it is concatenated into `venueAddress`. **The address the
pandit navigates to names the wrong place.**

**Mojibake census correction.** I reported "three sites that a user actually
saw". It was **four** — `:1630`, the Special Instructions placeholder ellipsis
(`Pandit Jiâ€¦`), which I missed because my grep covered `Â·` and `à¤` and not
`â€¦`. **The census's scope was too narrow — the same error as the cap, one
turn later.** Fixed and verified in the browser.

---

# useRazorpay — LANDMINE, NOT GAP (recorded on Isj's instruction)

**There is no verification gap.** The live path verifies correctly:
`booking-wizard-client.tsx:6` imports `RazorpayCheckout`, mounts it at `:1799`
with `razorpayKey={form.orderKeyId}` and `amount={form.orderAmount}` (both
server-issued), and it POSTs `${API_BASE}/payments/verify`, which exists behind
`authenticate` + `roleGuard("CUSTOMER")`.

`apps/web/src/hooks/useRazorpay.ts` is a **superseded twin with zero
importers**. Four divergences, one of which re-introduces a shipped ruling's
defect:

| dead twin | live path |
| --- | --- |
| `fetch('/api/payments/verify')` — relative, unserved → 404 | `${API_BASE}/payments/verify` |
| `amount * 100` — expects **rupees** | `orderAmount` is already **paise** → **100× charge** |
| key from `NEXT_PUBLIC_RAZORPAY_KEY_ID` (web env) | `orderKeyId` — **server-issued**, exactly the P-PAY fix |
| `localStorage.getItem('hpj_token')` raw | `accessToken` from auth context |

**Filed for deletion in the CONDEMNED QUEUE — third member.** One ruling, Isj's:
1. `apps/web/src` (the dead tree),
2. the muhurat twin `src/app/muhurat/muhurat-client.tsx` (still fabricated),
3. `apps/web/src/hooks/useRazorpay.ts`.

---

# J4b — SCORECARD

| item | status |
| --- | --- |
| 1 · wizard to last pre-payment step | ✅ **DONE** — reached Review & Pay through the reopened gate |
| 2 · ₹499 payload at submit | ✅ **CAPTURED AND DECIDED** — `priced-but-undelivered`; nothing forwarded |
| 3 · `/pandit/[id]` authed | ✅ four tabs, TRAVEL gone, calendar populated |
| 4 · dashboard tree below root | ❌ **NOT DONE** — root only (truthful empty, nav confirmed) |
| 5 · §3-V and §9 per wizard step | ❌ **NOT RUN** — no contrast or tap-target measurements taken this turn |

**Ledger rows created: NONE.** The booking was captured and killed; no User,
Booking, or Payment row was written by this walk.

---

# RECORDED VERBATIM ON ISJ'S INSTRUCTION

> **The sweep's self-caught cap:** I wrote "no silent caps — log what was
> dropped" as a rule for orchestration and then shipped one inside a regex.
> A bound that is not reported is indistinguishable from an absence.

> **The second refuted near-miss:** RENDERED ORDER IS NOT LAYOUT. The "You
> Save" badge is `absolute`-positioned inside the cheaper column, so the
> page's text flow put it under the dearer card. Reading the source refuted
> an inverted-savings P0 that did not exist.

---

# THE THREE RULED FIXES — SHIPPED AND PROVEN IN THE PAYLOAD

All three verified at 360×740 against the live production proxy, ending in a
booking submission that was **captured and killed — 0 requests forwarded.**

## F-J4-9 · the hardcoded samagri comparison is DELETED

Gone: `panditTotal = 8000`, `marketTotal = 5200`, and `COMPARISON_ITEMS` (five
invented items, invented brands, invented "market" prices, invented
`savings: "18% less"` strings, five embedded image URLs).

**Why the two-price comparison was deleted rather than re-sourced.** The real
catalogue carries **one price per item** —
`{ id, name, unit, basePrice, description }`. There is no premium/market pair
anywhere in the data model, so "Premium Brand vs Market Rate · X% less" cannot
be rendered from real data **at all**. Per the ruling — real data or deleted —
the percentages are deleted. A fabricated percentage is a fabricated claim.

The rebuilt modal has three honest outcomes: a real `SamagriPackage` renders
the pandit column with **its** number; a real catalogue renders the custom list
with real prices; **neither renders neither**, and the customer is told so and
offered the one honest path — bring samagri himself, ₹0. **"You Save" appears
only when both figures are real and the package is genuinely dearer.**

**Measured in the browser:** both sources fail in production today, so the
honest ERROR state renders — *"सामग्री की सूची अभी लोड नहीं हो पाई / यह
कनेक्शन की समस्या है — इसका मतलब यह नहीं कि सामग्री उपलब्ध नहीं है"* — with
retry and **"सामग्री मैं खुद लाऊँगा"** always available. The captured payload
now reads `samagriAmount: 0`, `samagriPreference: "CUSTOMER_ARRANGES"`.
**The ₹8,000 attributed to a living person no longer reaches a booking.**

### Two API defects this exposed — REPORT-ONLY

**F-J4-12 · `GET /samagri/catalog` 500s in production, permanently.** The
controller does `fs.readFileSync(path.join(__dirname, "../data/samagri-catalog.json"))`.
The file exists in `services/api/src/data/` — and **`tsc` does not copy `.json`
to `outDir`**, so `dist/data/` does not exist and the read throws on every
call. Same family as the stale-dist class: **the build output is not the
source tree, and code that reads files at runtime must be told so.**

**F-J4-13 · `GET /pandits/:id/samagri-packages` is declared public and answers 401.**
The route (`pandit.routes.ts:1182`) has **no** `preHandler`, yet production
returns `UNAUTHORIZED`. Code says public; deployed says 401. Not traced to a
cause — reported as a divergence rather than guessed at.

## F-J4-10 · the pay screen names the pandit

`panditName`/`dakshina` were set only by the card's `onClick`, which the
`?panditId=` deep link skips. A `useEffect` now resolves any pre-selected id
from the fetched list, with the same ceremony-base price fallback as the card
(never an invented number). **Verified: `PRIMARY PANDIT · Tanya`** where the
field had been blank.

## F-J4-11 · the address cannot name the wrong city

`CITY_STATE` map; `venueState` follows `venueCity`. **Verified live:** picking
Ghaziabad flipped the state field `Delhi → Uttar Pradesh`, and the captured
payload reads `"venueAddress": "…, Block A, Uttar Pradesh"` beside
`"venueCity": "Ghaziabad"` — consistent for the first time.

---

# ₹499 — THE TWO SHAPES. Isj's product call.

**Stated plainly, as ruled: `priced-but-undelivered` is not an acceptable
third state.** The customer is quoted a price for a service with no
implementation, and the platform's only record of the promise is a sentence in
a free-text notes blob.

**Shape 1 · wire it priced.** Add `muhuratConsultation: boolean` to the booking
payload and a `consultationFee` line to the server's fee math; the pandit's app
gets a consultation item on the booking; the ₹499 joins either the online
charge or the settled-at-booking bucket by Isj's choice. **Cost:** one payload
field, one server fee line + its guard, one pandit-side surface to show the
obligation, and a decision on which bucket. Small in code; it creates a real
obligation on a real person, so it needs the pandit's side built before the
customer's side ships.

**Shape 2 · remove the checkbox until built.** Delete the add-on card. **Cost:**
one component deletion, no server change, no migration. Loses nothing that
today works — because nothing today works. Reversible the moment Shape 1 lands.

**Note the asymmetry:** Shape 2 costs almost nothing and removes a false
promise; Shape 1 costs real work and keeps one. Both are honest; only the
status quo is not.

---

# §3-V and §9 — THE NUMBERS, TAKEN

**And the instrument lied first.** The initial run reported **39** contrast
failures including `"Proceed to Payment"` at **1.00** — white text measured
against white. The bug was mine: `bgOf(el.parentElement)` **skipped the
element's own background**, so every white-on-orange button read as
white-on-white. Corrected to start at the element itself:

> **39 → 25. Fourteen of the original thirty-nine were the instrument's own
> false positives.** Had I reported the first number, more than a third of the
> finding would have been fiction — on a screen where I had just spent the turn
> deleting fiction.

### Step 5 · Review & Pay (measured, corrected instrument)

| metric | value |
| --- | --- |
| contrast failures | **25** |
| worst | `Review & Pay` step label **2.02** · `Logistics & Travel` **2.02** |
| **add-on prices** | `+ ₹9,999`, `+ ₹499`, `+ ₹500` all at **2.17** |
| gradient UNKNOWN | 0 |
| tap targets | 4 — **3 under 52px** |
| smallest | add-on `+` buttons **28px** ×2 · `Back` **32px** |
| horizontal overflow | none (scrollWidth 360) |

**The sharpest one: the money figures the customer is asked to accept —
including the ₹499 — sit at 2.17:1, below the 4.5 floor.** A price a reader
cannot comfortably read is a consent problem, not a styling problem.

### 🔴 NOT MEASURED — steps 0, 1, 3, 4

The back-walk probe found no Back button: after the blocked submit the wizard
sits in a post-error state where the footer is not rendered, and re-walking
four steps was beyond this turn's budget. **These four screens have NO numbers,
and I am not estimating them from step 5.** They are owed.

---

# J5 PREP — the runway for the fresh-pandit walk

**Nothing in the pandit app changed this week except the सामग्री screen
(F-J4-7).** The onboarding path itself is untouched since it was last seen, and
it has **never been walked end-to-end** — that is precisely what J5 is for.

**The path to walk:** `/login` → `/otp` → `/onboarding` (+ `/onboarding/screens`)
→ `/permissions/location`, `/permissions/mic`, `/permissions/notifications`
(and the `/permissions/mic-denied` branch) → `/complete` → `/home`.

**The upload surfaces:** `/identity` and `/readiness` (+ `/readiness/hub`).
`readiness/page.tsx` is the only page in the pandit app carrying upload code.

**The queue expectation, from the source of truth**
(`packages/types/src/verification.ts`): a profile enters the review queue when
`verificationStatus ∈ { DOCUMENTS_SUBMITTED, VIDEO_KYC_DONE }` **or** when it
is `PENDING` **and** `HAS_REVIEWABLE_DOCUMENTS` — the widened clause added this
campaign. **So the `क्यूए-` pandit should appear the moment real documents are
attached, even before any status transition.**

**Badge expectation after J5: 2** — the probe row plus the new `क्यूए-` test
pandit. If it reads 1, the widened clause did not fire and that is the finding;
if it reads 3, something unaccounted is in the queue.

**Two known blockers J5 will hit, so they do not read as new:**
- the सामग्री screen will show its honest error until **F-J4-12** (catalog not
  in the build) and **F-J4-13** (packages 401) are fixed;
- the J9 gate still stands — the `क्यूए-` pandit is verified **by Isj's own
  hand** only after full onboarding, and that VERIFIED is deleted with the row
  at campaign end.

**What Isj's verify-finger needs ready:** the admin session (cleared earlier
this campaign), `/verifications` open, and the expectation that the badge reads
**2** with the new pandit's marked name visible in the list.

---

# RECORDED ON ISJ'S INSTRUCTION

**The delete-not-re-source reasoning, and the header beside it.** The samagri
comparison could never have been real: the catalogue carries **one price per
item** (`{id,name,unit,basePrice,description}`), so a "Premium vs Market ·
X% less" column had no possible data source. Every percentage was necessarily
invented. And the file said so itself — its own header read
**"// Mock Data matching the UI design perfectly"**.

> **A KNOWN PLACEHOLDER THAT FLOWED TO PRODUCTION IS STILL A FABRICATED
> CLAIM.** The comment records that someone knew. It does not make the ₹8,000
> attributed to a living person any less false to the customer reading it, and
> it is not a defence — it is an aggravating record.

**`bgOf()` joins the instrument-lies-first list — FOURTH MEMBER, and the
fourth caught by a control rather than by a green run:**

| # | instrument | how it lied | caught by |
| --- | --- | --- | --- |
| 1 | `/\bतुम\b/` | ASCII word-boundary can never match Devanagari | its own planted control, first run |
| 2 | `WRITER_REGISTRY` | 120-char lookback swallowed every `update()` | re-measure after the first fix |
| 3 | fabricated-sweep `{0,2600}` | silent cap vs a 3,387-char literal | walking the surface it had scored clean |
| 4 | **`bgOf(el.parentElement)`** | **skipped the element's own background — every white-on-orange button read as white-on-white** | **a 1.00 ratio on a button I could see was orange** |

---

# ₹499 — REMOVED. RULED AND DONE.

Deleted: the add-on card, the `muhuratConsultation` state, the
`MUHURAT_CONSULTATION_FEE` constant, its term in `addonCost`, and the
`specialInstructions` sentence.

**Verified on the rendered step-5 screen** (authenticated, live production
proxy, 360×740):

| assertion | result |
| --- | --- |
| on step 5 (`Cost Itemization` present) | ✅ |
| page mentions "499" | **false** |
| page mentions "Muhurat Consultation" | **false** |
| add-ons block still present | true — correctly, Backup and Visarjan remain |
| remaining add-on prices | `+ ₹9,999`, `+ ₹500` only |
| `PRIMARY PANDIT` | **Tanya** (F-J4-10 still holding) |

**And in the captured booking payload** — the whole point, since the sentence
was the only trace that ever reached the server:

```
"specialInstructions": "Samagri path: Platform Custom List. | Local booking (no accommodation required)."
```

**Zero occurrences of "499" or "consultation" anywhere in the proxy log.
0 bookings forwarded to production.** Priced-but-undelivered ended today.

## 🔴 A GREEN RESULT I THREW AWAY — the mislabelled probe

The first removal check returned `mentions499: false`,
`mentionsMuhuratConsultation: false`, `addOnsStillPresent: false` — three
greens. **They proved nothing.** The `Review & Pay` click had silently failed
(`reachedReviewPay: false`), so the probe measured **step 4**, where the add-ons
block never renders at all, and cheerfully labelled itself "step 5".

> **AN ASSERTION THAT PASSES ON THE WRONG SCREEN IS NOT A WEAKER PROOF, IT IS
> NO PROOF.** The only thing that caught it was carrying the navigation's own
> success flag in the same return value as the assertions. **A probe must
> report where it stood, not only what it saw** — otherwise its greens are
> indistinguishable from a green taken in an empty room.

The re-run was done authenticated, confirmed on-step-5 first, and only then
asserted.

---

# F-J4-12 · FIXED — the catalog is imported, not read

`fs.readFileSync(path.join(__dirname,"../data/samagri-catalog.json"))` →
`import samagriCatalog from "../data/samagri-catalog.json"`.

**Why this mechanism:** `resolveJsonModule` was **already enabled** and the
build is a bare `tsc`, so a static import makes the JSON a module that tsc
emits into `dist` as part of compilation. No copy step, no cross-platform
shell, no change to the build command — and the runtime file read, with its
entire failure mode, is gone. The `try/catch` went with it: there is nothing
left that can throw, and a 500 there had been a lie about the catalogue's
existence.

**Proof, from a clean `rm -rf dist && tsc`:**

```
dist/data/samagri-catalog.json        4408 bytes   ← did not exist before
dist JSON resolves                    true · 5 categories · 16 items
built controller requires the module  true
built CODE still reads from disk      false
```

**That last line needed two attempts, and the first was a false alarm of my
own making.** The naive grep reported the built file *still* contained
`catalogPath` — because **tsc keeps comments by default**, and my own removal
note quotes the deleted code verbatim. Stripping comments before asserting on
CODE gave the true answer. *A grep over compiled output cannot tell code from
commentary.*

**PRODUCTION 200 IS NOT YET PROVEN AND I WILL NOT CLAIM IT.** The endpoint runs
on Render; I cannot deploy. What is proven is that the artifact now contains
the file and the built code resolves it. The production check is one curl after
Isj's next API deploy:
`curl https://hmarepanditji-api.onrender.com/api/v1/samagri/catalog` — expect
200 with 5 categories / 16 items, not `{"error":"Failed to fetch samagri catalog"}`.

**BUILD OUTPUT IS NOT THE SOURCE TREE — third member**, after the stale dist
and the 308 shim's unverified premise. *Code that reaches for a file at runtime
is making a claim about the DEPLOYED layout, and no type checks it.*

---

# 🔴 F-J4-13 · WITHDRAWN — the defect was my misreading

I reported "the route is declared public and answers 401 — code says one thing,
deployment says another." **Measured, that is wrong, and the error is mine.**

`app.ts:286` installs a **global** `preHandler` that authenticates every URL
under `/api/v1/pandit*` unless the resolved route template appears in
`PUBLIC_PANDIT_READS` — a deliberate four-entry **security allow-list**
(`/pandits`, `/pandits/:id`, `/pandits/:id/reviews`,
`/pandits/:id/availability`). `/pandits/:id/samagri-packages` is not on it, so
the 401 is **correct and intended**. The route's docblock never says "Public";
**I inferred "public" from the absence of a route-level `preHandler`** — and in
an app with a global hook, that inference is simply invalid. There is even a
guard, `publicPanditReads.test.ts`, that couples the allow-list to the word
"Public" in the docs **in both directions**, and it is passing precisely
because the route is not documented public.

> **ABSENCE OF A LOCAL GUARD IS NOT PRESENCE OF PUBLIC ACCESS.** I read one
> file and drew a conclusion about a request's whole middleware chain.

**The real item, and it is not a bug:** the customer app cannot read a pandit's
samagri packages at all, because that route is pandit-only by design. Making it
customer-readable is a **security decision** — the allow-list's own comment
requires checking the projection for bank / IFSC / Aadhaar / PAN / UPI / phone
first. **Isj's, and only after that check.** Until then the customer-side
samagri surface can only ever show the catalogue half.

---

# §3-V AND §9 — EVERY WIZARD STEP REACHED. The owed numbers.

360×740, authenticated, live production proxy. Instrument = the corrected
`bgOf` (element-first), icons excluded, gradients reported UNKNOWN rather than
guessed (0 encountered).

| step | contrast fails | worst | taps | under 52px | smallest | overflow |
| --- | --- | --- | --- | --- | --- | --- |
| **0 · Event Details** | 10 | `Event Details` **2.02** | 16 | **13** | **13px** (an `INPUT`) | **🔴 scrollWidth 364 vs 360** |
| **1 · Select Pandit** | 9 | `Select Pandit` **2.02** | 4 | **4** | 32px `Back` | none |
| **3 · Ritual Details** | 6 | `Ritual Details` **2.02** | 11 | **7** | 32px `Back` | none |
| **4 · Preferences** | 8 | `Pre-defined item list…` **1.18** | 7 | **4** | 32px `Back` | none |
| **5 · Review & Pay** | 23 | `Review & Pay` **2.02** | 3 | **2** | 28px `add` | none |
| **TOTAL** | **56** | — | **41** | **30 of 41** | — | 1 step overflows |

*(Step 2 · Travel is skipped for a same-city booking — the F-J4-8 fix — so it
has no numbers by construction, not by omission.)*

**Three things the table says out loud:**

1. **`1.18` on step 4** — "Pre-defined item list and fixed non-negotiable
   package cost" is very nearly invisible, and it is the sentence explaining a
   cost the customer cannot renegotiate.
2. **30 of 41 tap targets are under 52px**, including a **13px** input on the
   busiest form in the app. That is not a design nit on a voice-first product
   aimed at people who are not fluent with phones.
3. **Step 0 overflows horizontally by 4px** (364 vs 360) — the one step that
   does, and the one with the most fields.

**Step 5 fell 25 → 23 after the ₹499 card was removed.** Deleting a false
promise also removed two unreadable price labels.

---

# STILL OWED

- **Dashboard tree below root — NOT walked.** `/dashboard` root only.
- **J5 — NOT started.** The runway stands as recorded: `/login → /otp →
  /onboarding → /permissions/* → /complete → /home`; uploads at `/identity`
  and `/readiness`; **badge expectation 2** (probe + the new `क्यूए-` pandit),
  **1 = the widened clause failed, 3 = something unaccounted.**
- **F-J4-12's production 200**, after Isj's next API deploy.

---

# PROBE DISCIPLINE — STANDING FROM HERE, NOT JUST FOR THAT ONE WALK

> **A PROBE MUST REPORT WHERE IT STOOD, NOT ONLY WHAT IT SAW.**

Every walk probe from now on returns, beside its findings:
`WHERE_I_STOOD { path, title, content fingerprint }` and
`ON_EXPECTED_SCREEN: <boolean>`; and any probe that follows a navigation
carries **that navigation's own success flag in the same return value**.
A green is unreadable without the identity of the screen it was taken on.

**It earned its keep on its FIRST use.** The dashboard walk asked for
`/dashboard` and the probe answered `ON_EXPECTED_SCREEN: false`, path
`/dashboard/bookings`. Under the old probe those numbers would have been filed
under "/dashboard" and been wrong about which screen the app even shows.

---

# THE DASHBOARD TREE — the last J4 debt, walked

360×740, authenticated, live production proxy, corrected element-first `bgOf`.

| screen | stood where expected | contrast fails | worst | taps | under 52px | overflow |
| --- | --- | --- | --- | --- | --- | --- |
| `/dashboard` | **NO — landed on `/dashboard/bookings`** | 4 | `Explore Pandits →` 3.56 | 9 | 5 | none |
| `/dashboard/bookings` | yes | 4 | `Explore Pandits →` 3.56 | 9 | 5 | none |
| `/dashboard/favorites` | yes | 2 | **`आपने अभी तक कोई पंडित जी…` 1.03** | 6 | 0 | none |
| `/dashboard/notifications` | yes | 1 | **`Notifications` 1.03** | 4 | 0 | none |
| `/dashboard/profile` | yes | 3 | **`Manage members` 1.00** | 10 | 3 | none |
| `/dashboard/profile/family` | yes | 3 | `Back to Profile` 2.41 | 11 | 3 | none |
| **TOTAL** (distinct screens) | — | **13** | — | **40** | **11** | none |

## 🔴 F-J4-15 · THREE PHANTOM NAV LINKS — the customer's own sidebar 404s

`DashboardNav.tsx` offers six sidebar destinations. **Three of them do not
exist**, confirmed by HTTP status, not inference:

| link | offered as | status |
| --- | --- | --- |
| `/dashboard/family` | "My Family" | **404** |
| `/dashboard/addresses` | "Saved Addresses" | **404** |
| `/dashboard/payments` | "Payment Methods" | **404** |

They render in the sidebar **and again inside `/dashboard/profile`** — measured
in the live DOM, not read from source. Half the account menu is dead. Note
`/dashboard/profile/family` **does** exist: "My Family" points at the wrong
path, so this is a broken link to a built screen, not only a missing feature.

**The dead-control law with a new face: a link is a control, and a 404 is the
loudest way to do nothing.**

## 🔴 F-J4-16 · "Home" goes to Bookings

`/dashboard` returns **200 server-side** and has its own `page.tsx`, yet the
browser lands on `/dashboard/bookings` — a **client-side redirect**. The bottom
nav's first item is labelled **"Home"** and its `href` is `/dashboard`. So the
customer taps *Home* and arrives at *Bookings*, with the Bookings tab
highlighted. Either the redirect is wrong or the label is; **the two disagree,
and only a walk can tell you which the user experiences.**

## The 1.00–1.03 class, now confirmed on three live screens

`Notifications` (1.03), `Manage members` (1.00), and favorites' empty-state
heading (1.03) are **invisible** — light ink on `dashboard/layout.tsx`'s
`bg-[#181511]`. This is the same class J1 found on "My Bookings" and logged as
28 remaining usages. **It is no longer a backlog abstraction: three of the six
account screens have text a customer cannot read at all**, and one of them is
the empty state whose entire job is to explain the emptiness.

**Also below floor and worth its own line:** `Delete Account` at **2.66** with
its warning text at 3.62 — a destructive, irreversible control whose label and
consequence are both under-contrast.

---

# 🔚 J4 — CLOSED. FINAL TALLY.

**16 findings raised, 1 withdrawn by me, 11 fixed and browser-proven,
4 open on Isj's desk.**

| # | finding | severity | state |
| --- | --- | --- | --- |
| F-J4-1 | muhurat renders a fabricated calendar + fake Tithi | P0 | **FIXED** (part 1; part 2 = real panchang, Isj) |
| F-J4-2 | search `city`/`experience` filters silently drop | HIGH | **OPEN** — own ticket |
| F-J4-3 | four invented pandits are all a customer can see | P0 | **FIXED** |
| F-J4-4 | `ritual` filter drops → app asserts Tanya does Vivah | HIGH | **OPEN** — own ticket |
| F-J4-5 | public profile shows an invented ₹4,300 travel quote | P0 | **FIXED** (tab removed) |
| F-J4-6 | availability calendar never asks; empty forever | HIGH | **FIXED** |
| F-J4-7 | pandit app invents a पूजा he never registered | HIGH | **FIXED** (save-leg reported) |
| F-J4-8 | **no customer could book the only verified pandit** | P0 | **L1 FIXED**; L2 data model = Isj |
| F-J4-9 | samagri comparison fabricated, ₹8,000 on a real person | P0 | **FIXED** |
| F-J4-10 | pay screen's PRIMARY PANDIT blank on deep link | HIGH | **FIXED** |
| F-J4-11 | booking address names the wrong city | HIGH | **FIXED** |
| F-J4-12 | `/samagri/catalog` 500s forever (JSON not in dist) | HIGH | **FIXED** — prod curl owed |
| F-J4-13 | ~~samagri-packages 401~~ | — | **WITHDRAWN — my misreading** |
| F-J4-b | ₹499 priced-but-undelivered | HIGH | **REMOVED** |
| F-J4-15 | three phantom nav links 404 | HIGH | **OPEN** |
| F-J4-16 | "Home" navigates to Bookings | MEDIUM | **OPEN** |

**§3-V / §9 totals across everything J4 measured** — booking wizard steps 0-5
plus the six dashboard screens: **69 contrast failures**, **81 tap targets of
which 41 are under 52px**, and **one horizontally overflowing screen**
(wizard step 0, 364 vs 360). Six separate items measure **below 1.2 — text a
customer literally cannot see.**

## What J4 was actually about

It began as "search + every button". It ended having established that **the
customer app's most common failure was not breakage but invention**: five
separate surfaces rendered numbers, people, dates and prices that no system
had ever produced — and every one of them looked healthier than the truth
behind it. The single most useful sentence the journey produced is the one
Isj ruled into the ledger:

> **A lie doesn't just misinform; it hides the broken truth behind it.**

Deleting the invented travel options is what exposed F-J4-8, the wall that
made booking impossible. **No amount of reading found that wall in months; one
deletion and one walk found it in an hour.**

---

# J5 — NOT STARTED

The dashboard tree was the last J4 debt and it is now paid. **J5 has not
begun**, and starting a fresh-pandit onboarding walk at the end of this turn
would produce exactly the thin, half-measured journey this campaign keeps
rejecting.

**The runway is unchanged and now carries this week's additions:**
- **probe discipline** — every assertion carries its screen's identity
  (`WHERE_I_STOOD` + `ON_EXPECTED_SCREEN`), and navigation success travels
  beside the findings;
- **the सामग्री screen now hits the FIXED catalog import** — if it still fails
  locally that is a **finding, not expected noise**;
- **uploads at `/identity` and `/readiness` are the heart** — marked files,
  every step screenshotted, and the **readiness step-5 atomic write** gets its
  production check here: **status and documents land together or not at all**;
- **end state: the `क्यूए-` pandit sits in the queue and the badge reads 2** —
  and that number is the journey's final line. **1 = the widened clause
  failed. 3 = something unaccounted.**

---

# RECORDED VERBATIM ON ISJ'S INSTRUCTION — J4's closing sentence

> **Months of reading didn't find that wall; one deletion and one walk found
> it in an hour.**

---

# F-J4-15 · FIXED — what isn't built isn't linked

| entry | was | now |
| --- | --- | --- |
| "My Family" | `/dashboard/family` → **404** | `/dashboard/profile/family` → **200** — the screen existed; the LINK was wrong, not the feature |
| "Saved Addresses" | `/dashboard/addresses` → **404** | **DELETED** from the sidebar |
| "Payment Methods" | `/dashboard/payments` → **404** | **DELETED** from the sidebar |
| profile's "Manage members" ×2 | `/dashboard/family` | repointed |
| profile's "Manage All" | `/dashboard/addresses` | **control removed** — the section stays, it lists real saved addresses |

> **A GHOST LINK IS PRICED-BUT-UNDELIVERED IN NAVIGATION FORM.** It promises a
> place, the customer spends a tap, and the platform answers 404. The two
> unbuilt entries are deleted rather than repointed, because repointing a
> promise nobody built is the same defect wearing a different href.

**Verified live on `/dashboard/profile`, `ON_EXPECTED_SCREEN: true`:** every
`/dashboard` destination the page now offers was fetched and returns **200** —
`/dashboard`, `/dashboard/profile`, `/dashboard/profile/family`,
`/dashboard/favorites`, `/dashboard/bookings`. **`anyGhostsLeft: []`**,
`manageAllStillPresent: false`. Screenshot in the gallery shows the marked test
customer (`क्यूए-walk यजमान J1`, +919000000901, PHONE VERIFIED).

**F-J4-16 (Home → Bookings) recorded and UNTOUCHED** — a design decision for
the consolidated pass, not a one-word patch.

---

# J5 — NOT STARTED. Second turn running, and stated rather than faked.

J4's last debt is paid and F-J4-15 is closed. **J5 has not begun**, and I am
not going to open a fresh-pandit onboarding walk in the tail of a turn that
has already shipped four fixes and a journey close. J5 creates a **real
production pandit row**, walks eight-plus screens, submits **real marked
uploads**, and ends on a queue-badge reading that Isj acts on with his own
finger. Begun thin, its most likely product is a half-measured journey and a
badge number nobody can trust — which is the exact failure mode this campaign
exists to prevent.

**The first three actions of J5, so this is a scheduled start and not a vague
deferral:**
1. `क्यूए-` pandit created at the pandit app's front door with a reserved
   `+9190000009xx` phone — **the row is logged in §C the moment it exists**,
   before any further step.
2. `/onboarding` walked screen by screen with the standing probe discipline —
   every assertion naming its screen — through `/permissions/*` to `/complete`.
3. `/identity` and `/readiness` uploads with marked files, and the
   **readiness step-5 atomic write checked in production: status and documents
   land together or not at all.**

**The journey's final line will be the badge number: 2 = correct, 1 = the
widened clause failed, 3 = something unaccounted.** When it reads 2 I stop and
hand Isj the verify runway — his finger, not mine.

---

# J5 · THE FRESH-PANDIT WALK

## §C ROW LOG — TWO ROWS, AND ONE OF THEM WAS ALREADY OVERDUE

**Read back from production `/auth/me` at the start of J5, not from memory:**

| # | table | id | name / phone | created (UTC) | journey | cleanup |
|---|---|---|---|---|---|---|
| 1 | User (+CustomerProfile) | `cms9yhwfd0000hk3nb7d66g2z` | `क्यूए-walk यजमान J1` / +919000000901 | 2026-08-01 | J1 | delete at campaign end |
| 2 | **User + PanditProfile** | User `cms9zruni0000fh3olj7zbfhx`<br>Profile `cms9zrupd0002fh3o8nse06f5` | **`क्यूए-walk पंडित J2` / +919000000903** | **2026-08-01T06:29:57Z** | **J2 — LOGGED LATE, see below** | delete at campaign end **AND clear its verification columns** (J9 gate ruling) |

> **🔴 ROW 2 WAS CREATED BY J2 AND NEVER WRITTEN DOWN.** J5 opened the pandit
> app expecting an empty front door and found a live session belonging to a
> production pandit this campaign had made hours earlier. §C listed one row;
> production held two. **The convention that every walk row is logged "the
> moment it exists" was stated in Phase 0 and then not followed by the very
> next journey that created one.**
>
> **A LEDGER IS ONLY A LEDGER IF THE WRITING HAPPENS AT THE MOMENT OF THE ACT.**
> Written afterwards it is a reconstruction, and a reconstruction cannot be
> trusted to be complete — the only reason this one was caught is that J5
> happened to walk the same door.

## WHY J5 DOES NOT CREATE A THIRD ROW

Row 2 is already in the exact pre-onboarding state J5 requires, verified from
production: `verificationStatus: PENDING`, `specializations: []`, and **all
four identity-document columns null** (`aadhaarFrontUrl`, `aadhaarBackUrl`,
`selfieUrl`, `certificateUrl`).

**And the arithmetic forbids it.** The badge expectation is **2 = probe + one
test pandit**. Creating a second `क्यूए-` pandit and onboarding it would make
the queue read **3** — the very "unaccounted" outcome the final line is meant
to detect. **I would have manufactured the failure signal myself.** J5 therefore
onboards row 2 and creates nothing new.

**This also confirms the badge arithmetic from the pandit side, before the
walk:** row 2 is `PENDING` with zero documents, so `HAS_REVIEWABLE_DOCUMENTS`
is false and it is **not** in the queue today. The queue should read **1** now
and **2** once documents land — which is precisely what the widened clause
exists to do.

## J5 — WALKED TO A MEASURED WALL. PARTIAL, AND THE WALL IS THE FINDING.

Environment: **production** (`hmarepanditji-pandit.vercel.app`), 360×740,
authenticated as row 2, probe discipline on every assertion.

### 🔴 F-J5-1 · "आधार अपलोड कीजिए" DOES NOT LEAD TO AADHAAR UPLOAD

The home screen's trust banner reads **"आधार अपलोड कीजिए — इससे यजमान आप पर
भरोसा कर सकेंगे"** ("upload your Aadhaar — then यजमान can trust you") with a
button of the same name. Tapping it lands on **`/readiness/hub` · "आपकी तैयारी"
· 0/5 दीये जल गए** — a five-step checklist in which identity is step **5**
(`भुगतान व सत्यापन`).

**§2 discipline — the lock is measured, not read off a grey pixel.** Every
control on the hub was enumerated with its real state:

| step | control | `disabled` |
|---|---|---|
| 1 · पूजाएँ और दक्षिणा | enabled, "अभी कीजिए" | `false` |
| 2 · सामग्री | बाकी | **`true`** |
| 3 · यात्रा | बाकी | **`true`** |
| 4 · भोजन व ठहराव | बाकी | **`true`** |
| **5 · भुगतान व सत्यापन** | बाकी | **`true`** |

**A pandit who wants to earn trust by proving who he is cannot do it.** He must
first price his poojas, list his samagri, declare travel, and settle food and
lodging — four commercial forms — before the app will let him show his Aadhaar.
The button's label and its destination disagree, and unlike F-J4-16 (Home →
Bookings) this one sits on the **trust** path, which is the one thing the
banner says it is for.

All tap targets on the hub measured **≥52px** — the screen is well built; it is
the *route* that is wrong.

### F-J5-2 · `/identity` is not an identity screen

`/identity` resolves (`ON_EXPECTED_SCREEN: true`) and renders the **परिचय
registration intro** — "नमस्ते, पंडित जी! 🙏 … हाँ, मैं पंडित हूँ — पंजीकरण
शुरू कीजिए". The route named for identity is the front door for registration.
**Named for its subject, not its reader** — the same law the campaign recorded
for `panditId`. Low severity alone; it matters because the J5 runway named
`/identity` as an upload surface and it is not one.

### F-J5-3 · the API's CORS allow-list excludes the pandit dev origin

Measured per-origin against production:

| Origin | `access-control-allow-origin` |
|---|---|
| `http://localhost:3002` (pandit dev) | **absent — blocked** |
| `http://localhost:3000` (customer dev) | present |
| `https://hmarepanditji-pandit.vercel.app` | present |

The local pandit app therefore cannot reach the API at all: the front door
answered **"कुछ गड़बड़ हो गई। दोबारा कोशिश कीजिए।"** on the very first tap.
**Not a production defect** — the deployed origin is allow-listed — but it
makes local pandit development impossible, and it is why J5's first attempt
died on its first screen. *(It also corrected me: I began locally when the
campaign's own environment statement says journeys run against production.)*

### A near-miss worth recording

Seeing the app call `/auth/otp/send` while I remembered `/auth/send-otp`, I was
one sentence from filing "the pandit front door calls a nonexistent endpoint —
P0". **Both exist**: `auth.routes.ts:86` registers `/otp/send`, and production
answers it **200** with `accountExists:false`. The failure was CORS, one layer
down. **A remembered API surface is not a measured one.**

### WHY THE WALK STOPS HERE — and it is not budget

Reaching the uploads requires completing four production forms
(poojas+dakshina → samagri → travel → food/stay). **Abandoning that chain
part-way leaves real partial data on a real production row** — a half-priced
pandit with declared travel and no verification, which is worse than an
untouched one and would poison the very queue reading J5 exists to take.

**The atomic-write production check and the badge reading are NOT done**, and I
am not estimating either. What J5 established instead is that **the path to
them is gated behind a four-form commercial chain that the trust banner does
not mention** — which is a finding the badge reading would not have produced.

### THE BADGE — stated as expectation, NOT as a reading

Row 2 is `PENDING` with **all four document columns null**, so
`HAS_REVIEWABLE_DOCUMENTS` is false and it is **not** queue-eligible today.

- **The queue should read 1 right now** (the probe alone).
- It becomes **2** only once documents land — which is exactly what the widened
  clause is for, and exactly what the unfinished readiness chain blocks.

**I did not read the badge. Reading it needs the admin session, and admin
credentials are never typed by me.** The verify runway is unchanged and now has
one addition: **before Isj opens `/verifications`, the expected number today is
1, not 2** — because J5 never reached the uploads.

## J5 RESUMED — F-J5-1 VERIFIED, UPLOADS PROVEN, ATOMIC WRITE PASSES

### F-J5-1 · FIXED AND WALKED

Both halves, because either alone would have let the walk "pass" on a screen it
never reached:

| file | was | now |
|---|---|---|
| `readiness/hub/page.tsx` | `tappable = a.step <= nextStep` | `a.step === IDENTITY_STEP \|\| a.step <= nextStep` |
| `readiness/page.tsx` | `setStep(Math.min(wanted, nextStep))` — silently dropped `?step=5` | exempts `IDENTITY_STEP` |
| `home/HomeView.tsx` | CTA → `/readiness/hub` | CTA → `/readiness?step=5` |

**Verified**, 360×740, signed in as the `क्यूए-` test pandit: tapping
**"आधार अपलोड कीजिए"** on `/home` lands on `/readiness?step=5`,
`ON_EXPECTED_SCREEN: true`, showing **"आपकी पहचान = यजमान का भरोसा"** and both
Aadhaar slots. **The banner's promise and the route agree for the first time.**
*(Run locally against the PRODUCTION API through the walk proxy, which also
routes around F-J5-3. Production confirmation awaits the next pandit deploy and
is not claimed.)*

**F-J5-2** — `/identity` renamed **`/parichay`**, matching the screen's own
header. Two inbound references updated; the misleading path no longer exists.

### 🔴 THE UPLOAD FAILURE THAT WAS MINE — instrument-lies-first, member 5

The first upload attempt produced the app's honest red banner,
**"कुछ गड़बड़ हो गई"**, and I was one step from filing an upload defect. The
proxy log named the real cause:

```
POST /api/v1/upload?kind=aadhaar-front → 400
  "No number after minus sign in JSON at position 1"
```

That `-` is the **multipart boundary**. My walk proxy read every body as a
**string** and forced `Content-Type: application/json` on every forward, so a
binary upload arrived mangled with the wrong content-type.

> **AN INSTRUMENT THAT REWRITES ITS SUBJECT IS NOT OBSERVING IT.** The screen's
> error was real, the app's behaviour was correct, and the defect was in the
> thing I had built to watch it. Buffer-safe and content-type-preserving now.

**With the proxy fixed the uploads succeed:** "आधार — आगे ✓ हो गया",
"आधार — पीछे ✓ हो गया", no error banner, zero remaining photo prompts, and the
reassurance copy renders (`🔒 आपकी जानकारी सुरक्षित है · AES-256`).

### 🔴 F-J5-4 · THE GATE MOVED FROM STEP ORDER INTO STEP VALIDATION

Step 5 is **"भुगतान और सत्यापन"** — it bundles **bank details** (name, account
×2, IFSC) with Aadhaar behind a single **पूरा कीजिए**.

- The submit button is **measured enabled** with all four bank fields empty.
- Pressing it is **refused**: *"बैंक खाता या UPI की सही जानकारी दर्ज कीजिए"*.

**So identity submission is still conditional on bank details** — the ruling
removed the ordering gate and the same condition reappeared inside the step's
own validation. A pandit who wants only to prove who he is must still hand over
a bank account.

It is also a **dead-control shape**: a button that presents itself as pressable
and then declines. Enabled-then-refused is the same defect class as a link that
404s — the control's appearance is a claim about what will happen.

**Bank fields were left empty deliberately** — bank/UPI saves are
ASSERT-VISIBLE-NEVER-FIRE, and no bank data was entered.

### ✅ THE STEP-5 ATOMIC WRITE — PRODUCTION CHECK, AND IT PASSES

Read back from the API immediately after the **rejected** submit:

| field | value |
|---|---|
| `aadhaarFrontUrl` | **null** |
| `aadhaarBackUrl` | **null** |
| `aadhaarNumber` | **null** |
| `verificationStatus` | **PENDING** (unchanged) |
| `readinessStep` | **0** (unchanged) |

**Status and documents did not land separately — nothing landed.** The files
exist in storage (the UI confirmed both), but **the profile was not touched**,
so there is no orphan "documents present, status unmoved" row. That is exactly
the guarantee the step-5 atomic-write fix was made for, and it holds in
production.

### 🔚 THE BADGE — AND WHY ITS DECODE TABLE DOES NOT APPLY TODAY

**Row 2 still has all four document columns null**, so it is **not**
queue-eligible. **The queue should read 1.**

**But 1 does NOT mean "the widened clause failed."** The decode table
(2 correct · 1 clause-failed · 3 unaccounted) assumes the uploads landed on the
profile. **They did not** — F-J5-4 blocked the submission, and the atomic write
correctly wrote nothing.

> **A NUMBER ONLY DECODES UNDER THE CONDITIONS ITS TABLE ASSUMES.** Reporting
> "1 = the widened clause failed" today would have been a P0 raised against a
> mechanism that was never given anything to react to.

**The widened clause is untested by J5 and remains untested.** It becomes
testable the moment a pandit can submit identity without bank details — i.e.
after F-J5-4 is ruled.

**I did not read the badge**; that needs the admin session and admin
credentials are never typed by me. **The runway for Isj's finger:** expect
**1** at `/verifications` today. If it reads 2, something else entered the
queue and that is worth knowing.

## F-J5-4 · FIXED IN BOTH LAYERS — because both layers gated

**Isj's instruction to check the server first was the whole finding.** The
refusal was NOT client-only:

`services/api/src/controllers/readiness.controller.ts`, step 5:

```ts
if (!payment || typeof payment !== "object") {
  return badRequest(reply, "Payment details are required.");
}
```

**The same condition lived in two layers.** Fixing the client alone would have
moved the enabled-then-refused shape one layer down — the button would have
submitted and the server would have refused, which is a worse defect than the
one it replaced, because the pandit would then be told his upload failed.

| layer | was | now |
|---|---|---|
| **server** `readiness.controller.ts` | `payment` **required** at step 5 | `payment` **optional**; when present it is validated exactly as before, when malformed it is still refused. **Absence is allowed; a malformed presence is not.** |
| **server** — `isBookingReady` | set unconditionally on step-5 submit | `if (hasPayment)` only — **booking-ready follows payout, not identity.** Claiming a pandit can be booked and paid on the strength of an Aadhaar alone is the false-claim class. |
| **server** — `readinessStep` | advanced to 5 on any step-5 submit | advances only when the step is genuinely complete — an identity-only submit must not light the fifth diya, because `N/5 दीये` is a claim about the pandit's own readiness. |
| **client** `readiness/page.tsx` | returned early unless bank/UPI validated | sends `payment` **only when the pandit actually touched it**; a part-filled or invalid block is still refused, because a half-typed account number is a mistake worth catching, not an abstention. |

**Atomicity is untouched and inherited.** Every identity field and the status
are still written by the **single** `prisma.panditProfile.update` — the
identity-only path uses the same one write J5 already proved atomic on the
failure path.

### 🔴 WHY J5 STILL CANNOT TAKE ITS LAST READING — and the line I did not cross

The Aadhaar-only submit needs the **server** fix running. The deployed API does
not have it, and I cannot deploy.

**I could have booted the API locally against the production Neon database.
I did not, and the reason is not caution for its own sake:**

- the local env's `JWT_SECRET` and `OTP_DEV_MODE` may diverge from the deployed
  one, so the session and the OTP backdoor would behave differently — a walk on
  a configuration no user has;
- more seriously, a locally-booted API carries **local transport config**.
  Notification, SMS and payment credentials would be whatever this machine
  holds. A pandit identity submit can notify admin. **Booting an unknown
  transport configuration against production data is exactly the shape the SOS
  and no-real-SMS boundaries exist to forbid**, and no ruling covers it.

> **A VERIFICATION THAT REQUIRES AN UNRULED PRODUCTION ACTION IS NOT A
> VERIFICATION I GET TO CHOOSE.** The fix is made, typechecked in both layers,
> and reasoned; the last reading waits for the deploy that makes it honest.

### THE POST-DEPLOY SEQUENCE — three steps, then the badge

Once the **API** is deployed (the pandit app fix can ride the same or a later
deploy; the server change is the blocking one):

1. **`curl https://hmarepanditji-api.onrender.com/api/v1/samagri/catalog`** —
   expect **200**, 5 categories / 16 items. Closes **F-J4-12** as measured.
2. **Aadhaar-only submit** as `क्यूए-walk पंडित J2` (+919000000903): tap
   "आधार अपलोड कीजिए" on `/home` → `/readiness?step=5` → attach the two marked
   files → 12-digit number → consent → **पूरा कीजिए with the bank fields left
   empty**. It must now **land**.
3. **Atomic check on the SUCCESS path** — read back `/auth/me`:
   `aadhaarFrontUrl`, `aadhaarBackUrl` and `aadhaarLastFour` **PRESENT** *and*
   `verificationStatus: DOCUMENTS_SUBMITTED` **together**; with
   `isBookingReady: false` and `readinessStep` **not** 5, because payout is
   still unset. Documents and status land together, or the finding is named.

### THE BADGE — the expectation, now with its decode conditions stated

**After step 3 lands, and only then, the decode table is valid:**

| badge | meaning |
|---|---|
| **2** | **correct** — probe + the `क्यूए-` pandit. The widened clause works in production. |
| **1** | **THE WIDENED CLAUSE FAILED — a true P0.** Documents are on the profile and the queue did not see them. |
| **3** | unaccounted — name what the third row is before touching anything. |

**Until step 2 lands, the badge reads 1 and that means nothing** — no documents,
nothing for the clause to react to. **A number only decodes under the
conditions its table assumes.**

**Isj's finger, in order:** read the badge → if **2**, verify the `क्यूए-`
pandit and **leave the probe untouched, third time**.

---

# RECORDED VERBATIM ON ISJ'S INSTRUCTION

> **A VERIFICATION THAT REQUIRES AN UNRULED PRODUCTION ACTION IS NOT A
> VERIFICATION I GET TO CHOOSE.**

*(Its resolution, recorded beside it: the answer was not to cross the line but
to take the normal path — push, let Render deploy, verify against the deployed
fix. The line stayed uncrossed and the verification still happened.)*

---

# 🔚 J5 — COMPLETE. WALKED END TO END ON PRODUCTION.

## The deploy

`git push origin main` → `2fd7049..4c0bd7f` (18 commits). The repo's own
pre-push gate ran and passed.

**🔴 THE GATE CAUGHT A DEFECT `tsc --noEmit` PASSED.** `export const
IDENTITY_STEP` from `readiness/hub/page.tsx` type-checks cleanly and **fails
`next build`** — a Next page module may export only a fixed set of names:

```
Property 'IDENTITY_STEP' is incompatible with index signature.
  Type '5' is not assignable to type 'never'.
```

> **TYPECHECK VERIFIES SHAPE; THE BUILD VERIFIES THE FRAMEWORK CONTRACT.**
> The constant now lives in `lib/readinessSteps.ts`. Four typechecks had
> passed over this code; only the build knew.

**Deploy watch, full-length comparator:** `/health` commit
`4c0bd7f76b3ef5731f76f3118e0b0f188a7fdfa3` — **40-vs-40**, field-anchored via
`JSON.parse`, never a column offset (the `a2d8c07`/`8a2d8c0` lesson). The
watcher's control fired honestly: the deploy landed *between* inspection and
poll, so `live === OLD` came back false and **the script refused to report on
an unproven comparator** rather than declare success. Re-confirmed by hand with
both outcomes observed on real values: `live === TARGET` **true**,
`live === OLD` **false**.

## The walk, against the deployed fix

Signed in as **`क्यूए-walk पंडित J2`** (+919000000903), production pandit app.

1. Home banner **"आधार अपलोड कीजिए"** → **`/readiness?step=5` direct**
   (`routeTaken: "direct (client fix live)"`) — both halves of F-J5-1 live.
2. Two marked files through the app's own inputs — **both slots "✓ हो गया"**,
   no error.
3. `999999999999`, consent ticked.
4. **All four bank fields verified empty**, then **पूरा कीजिए**.
5. **IT LANDED.** No `बैंक खाता या UPI` refusal. No error.

## ✅ THE ATOMIC WRITE — SUCCESS-PATH PROOF

Read back from `/auth/me` and `/pandit/readiness` on server `4c0bd7f`:

| field | value |
|---|---|
| `aadhaarFrontUrl` | **PRESENT** |
| `aadhaarBackUrl` | **PRESENT** |
| `aadhaarLastFour` | **9999** |
| `aadhaarConsentAt` | **2026-08-01T12:34:39.647Z** |
| `verificationStatus` | **DOCUMENTS_SUBMITTED** |

**Documents and status landed TOGETHER**, in one write, exactly as the failure
path proved they would not land separately. **The atomic write is now proven on
both paths — nothing landed on failure, everything landed together on success.**

And both false claims stayed dead:

| field | value | why it matters |
|---|---|---|
| `isBookingReady` | **false** | booking-ready follows payout, not identity |
| `readinessStep` | **0** | the fifth diya stays unlit — no 5/5 claim |
| `hasPayment` | **false** | payout genuinely unset |

## 🔴 F-J5-5 · THE CELEBRATION CLAIMS BOOKING-READY WHEN THE SERVER SAYS FALSE

The success screen reads **"अब आप बुकिंग के लिए तैयार हैं!"** — *you are now
ready for bookings* — while `isBookingReady` is **false** and payout is unset.
The celebration is client-side and unconditional; it fires on any successful
step-5 submit.

**The fix exposed it.** Before F-J5-4, every step-5 submit did set
`isBookingReady`, so the copy was true by accident. Making identity submit
alone created the case the copy never anticipated, and the copy now asserts
something the server explicitly declined to record.

**This is the false-claim class, in the celebration.** REPORT-ONLY — the right
wording is a product call: the honest version says the identity is submitted
and names payout as the remaining step. It is also the sibling of the banner it
still displays underneath — *"आधार अपलोड कीजिए"* — advice that is now stale on
the very screen confirming the upload.

## §C — ROW 2 STATE AT J5 CLOSE

| # | id | state after J5 | cleanup obligation |
|---|---|---|---|
| 2 | User `cms9zruni0000fh3olj7zbfhx` · Profile `cms9zrupd0002fh3o8nse06f5` | **DOCUMENTS_SUBMITTED**, aadhaar front/back/lastFour/consentAt set, `isBookingReady false`, `readinessStep 0` | delete at campaign end **AND clear the verification columns** — now non-empty, so the J9-gate obligation is live, not theoretical |

## 🔚 THE FINAL LINE — THE BADGE, NOW DECODABLE

The uploads landed on the profile, so the decode conditions its table assumes
are **satisfied for the first time**:

| badge at `/verifications` | meaning |
|---|---|
| **2** | **CORRECT** — probe + `क्यूए-walk पंडित J2`. The widened clause works in production. |
| **1** | **THE WIDENED CLAUSE FAILED — a true P0.** `DOCUMENTS_SUBMITTED` is one of `KYC_REVIEW_QUEUE_STATUSES`; a profile carrying it and not appearing means the queue query is broken. |
| **3** | unaccounted — name the third row before touching anything. |

**I did not read it.** The badge lives behind the admin session and **admin
credentials are never typed by me.**

**Isj's part, and only his:**
1. `curl https://hmarepanditji-api.onrender.com/api/v1/samagri/catalog` — expect
   **200**, 5 categories / 16 items. Closes **F-J4-12** as measured.
2. Read the badge at `/verifications`.
3. **If it says 2** — verify `क्यूए-walk पंडित J2`. **The probe stays
   untouched, third time.**

---

# TRUE-BY-ACCIDENT — a new class, beside FABRICATED-CLAIM

Recorded on Isj's ruling.

> **A claim that was true only while a condition happened to hold.** Nobody
> wrote a lie. The sentence was accurate on every path that existed when it
> was written, and became false the moment a new path existed — without a
> single character of it changing.

**Member one: the readiness celebration.** *"अब आप बुकिंग के लिए तैयार हैं!"*
was true while **every** step-5 submit also carried bank details. **It became a
lie the instant identity could be submitted alone** — born by F-J5-4, the fix
that made the app more honest everywhere else.

**Why it is not the same as a fabricated claim.** A fabrication is false when
written; this was true when written and *un-owned* thereafter — nothing tied
the sentence to the condition that made it true. **The defence is not care at
writing time; it is binding the claim to its condition** so the copy cannot
outlive it. That is exactly what the fix does: the sentence now renders from
`isBookingReady`, the same field the server decides.

**Where else to look for this class:** any copy asserting a state that some
*other* code path guarantees. The celebration, the home banners, the readiness
counter, and any "you are now …" sentence are the natural hunting ground.

---

# F-J5-5 · FIXED AND VERIFIED

| was | now |
|---|---|
| title **"अब आप बुकिंग के लिए तैयार हैं!"** on any step-5 submit | renders **only when the server says `isBookingReady`** |
| message = `home.pendingVerification` — *"आधार अपलोड कीजिए …"* | **"जाँच के बाद आपको बताएँगे।"** |
| — | title on the identity-only path: **"आपकी पहचान जमा हो गई"** |
| voice claimed booking-readiness | matching identity-submitted narration |

**The CTA under its own completion announcement is gone.** A control telling
the pandit to do the thing the screen exists to confirm he just did is
label-vs-behaviour at its sharpest.

**Register honoured:** आप / कीजिए family, and **no duration promise** —
*"जाँच के बाद"*, never *"24 घंटे में"*, because nothing schedules the review.
This keeps it out of the six payout-timing strings already on Isj's desk.

**Verified in the browser**, signed in as the test pandit, bank fields empty:

| assertion | result |
|---|---|
| says "आपकी पहचान जमा हो गई" | **true** |
| says "जाँच के बाद आपको बताएँगे" | **true** |
| says "बुकिंग के लिए तैयार" | **false** ✅ |
| still shows "आधार अपलोड कीजिए" | **false** ✅ |
| any duration promise (`\d+ घंटे\|दिन\|मिनट`) | **false** ✅ |

**An unlooked-for confirmation:** returning to `/home` after the production
submit, the banner had already changed itself to **"आपका आधार मिल गया — जाँच
चल रही है।"** The home surface was *already* state-aware and honest; only the
celebration had been left behind. **The bug was not that the app lies — it is
that one sentence was never wired to the truth the rest of the screen already
read.**

---

# §C · CLEANUP OBLIGATION — RECORDED VERBATIM

> **Row 2 now carries real verification columns — campaign-end cleanup must
> UN-VERIFY, not just delete. Same law as the J9 test-pandit ruling.**

| # | row | columns now non-empty | obligation |
|---|---|---|---|
| 2 | User `cms9zruni0000fh3olj7zbfhx` · PanditProfile `cms9zrupd0002fh3o8nse06f5` | `aadhaarFrontUrl`, `aadhaarBackUrl`, `aadhaarDocUrl`, `aadhaarLastFour`, `aadhaarEncrypted`, `aadhaarConsentAt`, `verificationStatus = DOCUMENTS_SUBMITTED` | **clear every one of them, then delete the row.** If Isj verifies it, `verifiedAt`/`verifiedById` join that list. |

**This is no longer theoretical.** Until this walk the obligation described a
row that did not exist; it now describes columns that do. **Every VERIFIED in
production must have a real person behind it — test rows included, even
temporarily.** The cleanup script is generated from §C and runs under the same
`@generated` + FK-completeness guards as the production cleanup.

---

# 🔚 J5 CLOSED — AND THE RUNWAY IS ISJ'S

Nothing further is mine to do. **Isj's finger, in order:**

1. `curl https://hmarepanditji-api.onrender.com/api/v1/samagri/catalog` —
   expect **200**, 5 categories / 16 items. Closes **F-J4-12** as measured.
2. Read the badge at `/verifications`.
   **2** = correct · **1** = the widened clause failed, a true P0 ·
   **3** = unaccounted, name the third row first.
3. **At 2** — verify `क्यूए-walk पंडित J2`: **the platform's second honest
   VERIFIED**, and the probe stays untouched, **third time**.

**J9's runway opens on his word**, because J9's gate was always "a `क्यूए-`
pandit verified by Isj's own hand after completing onboarding through the live
app" — and that pandit is now standing in the queue.

---

# 🔴 THE SECOND HONEST VERIFIED — measured AFTER, 2026-08-01

Isj verified **क्यूए-walk पंडित J2** by his own hand. Probe untouched, third
time. `GET /api/v1/pandits`, verbatim:

**count: 2 · pagination `{"total":2,"page":1,"limit":10,"totalPages":1}`**

| field | Tanya | क्यूए-walk पंडित J2 |
|---|---|---|
| id | `cmriymyqo0000et35bg7uhir6` | `cms9zruni0000fh3olj7zbfhx` |
| verificationStatus | **VERIFIED** | **VERIFIED** |
| identityVerified | **true** | **true** |
| location | गाज़ियाबाद | गाज़ियाबाद |
| rating / reviews | 0 / 0 | 0 / 0 |
| experienceYears | 0 | 0 |
| specializations | `["SATYANARAYAN"]` | **`[]`** |
| verifiedPoojaTypes | `[]` | `[]` |
| pujaServices | 0 | 0 |
| completedBookings | 0 | 0 |

**Every claim on the क्यूए- row is defensible** — rating 0, zero reviews, zero
poojas, zero bookings. The same standard as Tanya's first reading: the
directory asserts nothing that did not happen.

**Badge expectation now: 1** — the probe alone. `VERIFIED` is not in
`KYC_REVIEW_QUEUE_STATUSES` and the profile is no longer `PENDING`, so the
क्यूए- pandit has left the queue by both clauses. Stated from code; Isj's own
screen is the reading.

## §C · THE VERIFY EVENT — the un-verify obligation is LIVE

| # | row | event |
|---|---|---|
| 2 | Profile `cms9zrupd0002fh3o8nse06f5` | **VERIFIED by Isj, 2026-08-01.** Per the verificationWriter contract, `verifiedAt` and `verifiedById` are now real columns on this row (values unread — no DB access; derived from the writer plus the measured VERIFIED). |

> **Campaign-end cleanup for row 2 now includes `verifiedAt`, `verifiedById`,
> and `verificationStatus` itself. UN-VERIFY, then delete.** Every VERIFIED in
> production must have a real person behind it — this one does *today* (the
> walk's uploads are real marked files), and it must not outlive the row.

## 🔴 F-J5-6 · A VERIFIED PANDIT WITH ZERO POOJAS IS BOOKABLE-ON-A-DEFECT — report-only

What the customer surface does with `specializations: []` + `pujaServices: 0`,
from the code as fixed this campaign:

- **`/search` and the wizard list him** — the directory filters only
  `verificationStatus = VERIFIED` (`pandit.controller.ts:127`), not poojas,
  and not `isBookingReady`.
- **The wizard's ritual filter would exclude him for EVERY ritual — but that
  filter is DEAD (F-J4-4).** He appears for every ceremony *because* the
  filter silently drops.
- **His card renders no specialization chips**, and with no priced service the
  F-J4-3 fix quotes the **ceremony base** ("पूजा की आधार दक्षिणा" — ₹2,100 for
  Satyanarayan) — so he is **selectable and bookable in principle.**

**The state, named precisely: his findability RESTS ON a defect.** The day
F-J4-4 is fixed, a zero-specialization pandit matches zero rituals and becomes
invisible everywhere — VERIFIED and unfindable. Today he is findable everywhere
for the same reason. Neither state is designed; both are side-effects of the
dead filter. **J9 can book him today through the ceremony-base quote, but the
honest sequence is one पूजा first** — which is precisely the steps-1-4 walk J5
deliberately did not fill. That choice is Isj's, in the J9 order.

**Also true and worth one line: `isBookingReady` is false and no public
surface reads it.** The flag the server maintains as "can be booked and paid"
gates nothing a customer sees. Vocabulary-boundary family; report-only.

---

# J9 · THE RUNWAY — stated before walking, per order. NOT WALKED.

**Target:** `क्यूए-walk पंडित J2` (`cms9zruni0000fh3olj7zbfhx`) — **NEVER
Tanya.** Customer: the J1 account (+919000000901). Every created row logged in
§C at the moment of the act.

## What reaches production, and what is captured-and-killed

J9 exists to create a real booking against the test pandit, so the J4-era
kill-everything rule is replaced by a stated split:

| leg | disposition |
|---|---|
| `POST /bookings` (target = क्यूए- pandit ONLY) | **ALLOWED to production.** Real Booking row; §C-logged immediately. The proxy asserts the `panditId` in the body equals the क्यूए- id and **kills anything else** — a wrong-target booking must die at the proxy, not at my intention. |
| `POST /payments/create-order` | **ALLOWED** — Razorpay **test keys** are seated server-side; test order, no real charge. |
| client `POST /payments/verify` | **ALLOWED** — the only confirmation leg that exists (webhook unregistered). |
| any request whose body carries Tanya's id or phone | **KILLED unconditionally.** |
| direct `POST /notifications*` | **KILLED** — nothing sends these client-side today; the real risk is server-side, below. |

## 🔴 THE ONE OPEN GATE — the booking's own SMS leg, and it is not mine to wave

`POST /bookings` fires `NotificationService.notify()` **server-side** to both
customer and pandit (`booking.service.ts:244-264`), templates carrying
`smsMessage`. The transport is **Twilio, not the OTP path**: `OTP_DEV_MODE`
governs OTPs only and **does nothing for booking notifications**. `sendSms`
stubs to a console log **only if Twilio creds are absent**
(`notification.service.ts:46-57`).

- **Whether Twilio creds are seated in Render production is UNKNOWN to me.**
- **Whether +919000000903 is routable is also not guaranteed** — the reserved
  range was chosen to be distinct from seed data, not proven unassigned. If
  Twilio is live, the SMS goes to whoever holds that number.

> **A REAL SMS TO AN UNKNOWN HOLDER OF A RESERVED-LOOKING NUMBER IS THE
> NO-REAL-SMS BOUNDARY, SERVER-SIDE, WHERE NO PROXY CAN INTERCEPT IT.** The
> walk cannot capture-and-kill a send the API makes from Render.

**J9 therefore blocks at this gate until Isj states one of:**
(a) Twilio production creds are absent → sends are console stubs, walk freely;
(b) creds are present and he accepts the send to +919000000903;
(c) he mutes the transport for the walk.

## Where the flow stalls by construction

The **webhook is UNREGISTERED**, so the server-push confirmation leg never
fires. The only confirmation is the client `POST /payments/verify` after the
Razorpay test modal. Two expected outcomes, both findings rather than failures:

- the test modal completes in the pane → verify leg runs → booking CONFIRMED
  **with the webhook leg never exercised** (named, not hidden);
- the modal cannot complete in the pane → the booking stays pre-payment —
  **the "stuck payment" state is the EXPECTED terminal**, and its honesty on
  both dashboards (customer and pandit) becomes the measurement.

## Sequencing question for the J9 order (from F-J5-6)

Book **through the ceremony-base quote as-is** (exercises today's real path,
which rests on the dead filter), or **have the क्यूए- pandit carry one पूजा
first** (the deferred steps-1-4 walk — honest vocabulary, longer journey)?
**Isj's call in the J9 order.**

---

# FINDABLE-BY-DEFECT — recorded as a class beside TRUE-BY-ACCIDENT

> **Two defects covering for each other, the behaviour between them
> coincidence.** The dead ritual filter (F-J4-4) makes a zero-pooja pandit
> visible for every ceremony; the ceremony-base fallback makes him priceable.
> Neither was designed to produce "findable"; fix either and the behaviour
> flips. Member one: the क्यूए- pandit's whole customer-side existence.

The proxy rule is recorded verbatim beside it:

> **A wrong target dies at the proxy, not at my intention.**

---

# THE TWILIO ANSWER — measured as far as outside allows

**Not visible from outside.** Every externally reachable surface was checked:

- `/health` exposes `ok / commit / uptime / timestamp` only (`app.ts:166`);
  `/api/health` even less. **No config projection endpoint exists.**
- **The OTP path sends nothing, ever** — `auth.controller.ts:453` is
  `TODO(MSG91)`: production OTPs are generated and **printed to the server
  console**, never transmitted. So the earlier OTP "sends" to both reserved
  numbers transmitted nothing, and prove nothing about Twilio.
- Which means: **`NotificationService.sendSms` (Twilio) is the ONLY real-SMS
  code path in the API — and its only trigger on this walk's route is exactly
  the `POST /bookings` J9 would fire.** There is no cheaper probe of the same
  transport.

**→ Isj reads the Render dashboard:** `TWILIO_ACCOUNT_SID`,
`TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (and `TWILIO_WHATSAPP_NUMBER`).
Absent → sends are console stubs (option a, proven by
`notification.service.ts:48`). Present → **Isj removes them for the walk**
(option c, his hand). Option b is rejected by ruling. **J9 stays blocked until
the answer is on the table.**

---

# J9 · ACT ONE — THE ADD-POOJA WALK PLAN (nothing walked)

## What the code already predicts — the gap, measured to its write sites

**The wizard's पूजा-नाम is FREE TEXT.** `/my-poojas/add` step 1 is a
`VoiceField` with placeholder *"जैसे सत्यनारायण कथा"* (`add/page.tsx:322`) —
there is **no enum picker**. Whatever the pandit types or speaks becomes
`d.name`, and the wizard writes it to **three** places (`add/page.tsx:206-231`):

| write | field | table |
|---|---|---|
| `POST /pandit/samagri-packages` | `pujaType: d.name` | SamagriPackage |
| `POST /pandit/pooja-config` | `poojaType: d.name` | PoojaConfig |
| `POST /pandit/pooja-verification` | `poojaType: d.name` | PoojaVerification (pending review) |

**None of the three touches `PanditProfile.specializations`** — the field the
directory serves and the (dead) ritual filter would read. Specializations are
written **only by readiness R1** (`readiness.controller.ts:123-129`), the
steps-1-4 walk. And `verifiedPoojaTypes` in `/pandits` is projected from
**approved** PoojaVerifications (`pandit.controller.ts:290`) — an ops action.

**So the platform speaks THREE pooja vocabularies with no bridge:**

1. free text — `"सत्यनारायण कथा"` — what this wizard writes;
2. enum — `"SATYANARAYAN"` — what `specializations` carries and the directory shows;
3. `Ritual.name` English — `"Satyanarayan Puja"` — what the booking wizard's `?ritual=` sends.

**Prediction, stated before the walk so the walk can refute it:** the added
pooja will appear on pandit-facing surfaces that read the free-text tables, and
will **NOT** move `specializations` (stays `[]`), will **NOT** move
`verifiedPoojaTypes` (pending until admin approval — and even after approval
carries the free-text value, not the enum), and the सामग्री screen — which
reads `specializations` (F-J4-7) — will **STILL show the honest empty**. If
that happens, findable-by-design is NOT achievable through this wizard alone,
and that is the finding the vocabulary ruling on Isj's desk has been waiting
for: measured, not argued.

## The walk, step by step

1. **Entry:** production pandit app, signed in as `क्यूए-walk पंडित J2` →
   `/my-poojas` → **पूजा जोड़ें** (`/my-poojas/add`). Probe discipline on every
   screen.
2. **The pooja: `सत्यनारायण कथा`** — deliberately the BEST-ALIGNED name in the
   system: it is the display form of enum `SATYANARAYAN` (Tanya's known-good
   directory value) and of Ritual `"Satyanarayan Puja"`. **A known-good
   control:** if even the best-aligned name fails to reach the enum surfaces,
   the gap is proven at its narrowest point — no "wrong spelling" escape.
3. Dakshina ₹2,100 (matches the ceremony base already quoted in J4b, one
   number fewer to explain), टीम 1, supplyMode PANDIT_BRINGS, minimal
   3-item samagri tier, description marked `क्यूए-walk`; the verification video
   leg uses the WhatsApp marker path (no real upload service dependency).
4. **§C at the moment of each act:** the SamagriPackage, PoojaConfig and
   PoojaVerification rows are logged as they are created — three rows, one
   table row each, cleanup joins row 2's list.
5. **AFTER readings, in order:**
   - pandit's **मेरी पूजाएँ** — must list the new pooja (free-text surface);
   - **`GET /pandits`** — `specializations` and `verifiedPoojaTypes` for the
     क्यूए- id, verbatim (prediction: both unchanged);
   - the **सामग्री screen** — prediction: still the honest empty;
   - **admin pooja-verification queue expectation for Isj's screen: +1
     pending row** (the प्रतीक्षा-में state), named so his screen has a number
     to confirm.
6. **STOP.** Whether the pooja reaching only the free-text surfaces counts as
   "landed" for J9's booking — or whether readiness-R1 (the enum writer) must
   run instead — is **Isj's ruling on the measured result**, not mine on a
   prediction.

---

# J9 · ACT ONE — WALKED. THE PREDICTION, SCORED LINE BY LINE.

Environment: **production** pandit app, signed in as `क्यूए-walk पंडित J2`.
Send-safety confirmed from call sites before walking: all three wizard writes
are notify-free; the only `notify` calls in the controller are
`approvePoojaVerification` (:159) and `rejectPoojaVerification` (:214) — both
admin acts. **Flagged accordingly: Isj's own approve click fires the SMS leg,
so the Twilio dashboard reading matters before HIS click too, not only before
act two.**

**One boundary kept mid-walk:** the wizard's WhatsApp control is an
`<a href="https://wa.me/918934095599">` — following it opens a real chat to
the real help number. The navigation was **cancelled** while the app's own
`onClick` (which sets the sent-via-WhatsApp draft marker) ran. The marker
banner confirmed; no external surface was opened.

## §C · ROWS CREATED — at the moment of the act, verbatim ids

| # | table | id | key fields | created (UTC) |
|---|---|---|---|---|
| 3 | PoojaConfig | `cmsaftb280001ei3nqp0ei5xp` | `poojaType: "सत्यनारायण कथा"` · dakshina 2100 · PANDIT_BRINGS · team 1 | 2026-08-01T13:58:58.880Z |
| 4 | PoojaVerification | `cmsaftb9p0003ei3n2cpf021d` | `poojaType: "सत्यनारायण कथा"` · **status PENDING** · desc marked `क्यूए-walk` · videoProvider UPLOAD · videoUrl = the wa.me marker | 2026-08-01T13:58:59.149Z |

**A third row was NOT created, and the app said so itself:** the samagri POST
fired with the one typed item and the server answered `saved: 0` — the wizard
collects no tier prices, so the server stores nothing (the known
truthful-state gap, honestly surfaced as *"सामग्री की सूची अभी सहेजी नहीं
गई"*). The pandit's typed item was discarded WITH a warning, not silently.
Cleanup list: rows 3 and 4 join row 2's obligations.

## THE PREDICTION, SCORED

| # | surface | predicted | measured | verdict |
|---|---|---|---|---|
| 1 | pandit's **मेरी पूजाएँ** | **renders it** (free-text surface) | **"अभी कोई पूजा नहीं जोड़ी"** — empty | **REFUTED — HARSHER than predicted** |
| 2 | `/auth/me` `specializations` | stays `[]` | `[]` | **HELD** |
| 3 | `GET /pandits` — `specializations` / `verifiedPoojaTypes` | both unchanged | `[]` / `[]` | **HELD** |
| 4 | admin pooja queue | **+1 PENDING** — stated, Isj's screen confirms | row exists: `cmsaftb9p0003ei3n2cpf021d`, `status: "PENDING"` | **stated** |
| 5 | सामग्री screen | honest empty | *"अभी आपने कोई पूजा नहीं जोड़ी है"* + पूजा जोड़िए CTA | **HELD** — and proves the F-J4-7 fix is live in production |

## 🔴 F-J9-1 · THE WIZARD WRITES WHAT NO READER READS — the vanish is complete

Line 1's refutation is the sharpest fact of the walk. **मेरी पूजाएँ — the add
wizard's own sibling screen — reads `specializations`**
(`my-poojas/page.tsx:77`: `setPoojas(prof?.specializations || [])`); its
pooja-verifications call only decorates poojas already in that list with
pending/rejected pills. So:

- the wizard writes **free text** into PoojaConfig / PoojaVerification;
- **every reader in the system** — मेरी पूजाएँ, the सामग्री screen, the public
  directory, the (dead) search filter — reads the **enum field
  `specializations`**, which only readiness-R1 writes;
- the only surface that ever shows the new pooja is **the wizard's own step-4
  done screen**, in the seconds after submit.

**And approval cannot bridge it:** `approvePoojaVerification` updates only the
PoojaVerification row — it does **not** write `specializations`. After Isj
approves, `verifiedPoojaTypes` will carry the free text, `specializations`
stays `[]`, and **मेरी पूजाएँ will still say "अभी कोई पूजा नहीं जोड़ी"** to the
pandit whose pooja was just प्रमाणित.

> **A pandit can walk the app's own five-step wizard to completion, be told
> "भेज दी गई", have an admin approve it — and never see his pooja anywhere
> again.** The three-vocabulary gap is not an edge case; it is the wizard's
> entire output vanishing between two sibling screens that share a nav bar.

**FINDABLE-BY-DESIGN IS NOT ACHIEVABLE THROUGH THIS WIZARD — measured, not
argued.** The only writer of the field every reader reads is readiness-R1
(steps 1-4). That is the decisive input for Isj's ruling on how J9's booking
may proceed.

## Recorded per order — the OTP funded-day pairing

> **Production OTP transport is `TODO(MSG91)`, console-only**
> (`auth.controller.ts:453`). **The `123456` backdoor and the missing
> transport are two halves of the same funded-day item**: the backdoor exists
> because no transport exists; neither can be closed without the other. Filed
> where the funded-day plan lives, beside the OTP-hardening-v2 branch note.

## STOPPED — at the scored prediction, as ordered

The measured result on the table for Isj's ruling:

- **(a)** run readiness-R1 (steps 1-4) so `specializations` carries the enum
  and the क्यूए- pandit becomes findable **by design** — the longer, honest
  path J5 deferred; or
- **(b)** book through today's real path (FINDABLE-BY-DEFECT + ceremony-base
  quote), accepting that the booking exercises two defects; or
- **(c)** treat F-J9-1 as the blocking finding and rule on the vocabulary
  bridge first (the FIRST-CLASS vs REQUEST poojaType decision already on the
  desk — now with its cost measured).

**Also still open: the Twilio dashboard reading** — needed before Isj's
approve click on the pending pooja, and before any act-two booking.

---

# J9 · READINESS-R1 RUN — ruling (a) executed. FINDABLE BY DESIGN, measured.

**Send-safety asserted on handler BODIES before walking, not on files:**
`patchPanditProfile` (auth.controller.ts:1470-1502) and `upsertDakshinaRate`
(:1502-1535) contain no notify call — the file imports the notifier, but for
the booking-transition handlers elsewhere in it. The readiness verify
(`readiness.controller.ts`) has no notifier import at all. **All three R1 legs
are notify-free; the walk fired no send.**

## The walk

Production app, `/readiness?step=1`, as the क्यूए- pandit: selected
**सत्यनारायण कथा** (display card of enum `SATYANARAYAN`), dakshina **₹2,100**
(consistent with the PoojaConfig already in §C), **आगे बढ़िए** → saved, hub
counter **1/5 दीये जल गए**, wizard advanced to step 2 — **and the walk stopped
there.** Steps 2-4 are not in the order.

## §C · the writes

| # | table | identification | note |
|---|---|---|---|
| 5 | PanditProfile.specializations | profile `cms9zrupd0002fh3o8nse06f5` | now `["SATYANARAYAN"]` — the enum field every reader reads |
| 6 | DakshinaRate | profile + `pujaType: SATYANARAYAN`, amount 2100 | id unread (no echo endpoint); identified by its unique pair |

Cleanup: both join row 2's un-verify-then-delete list — specializations must
be emptied, the rate row deleted.

## AFTER, verbatim

| reading | value |
|---|---|
| `/auth/me` `specializations` | **`["SATYANARAYAN"]`** |
| `GET /pandits` (public) — the क्यूए- row | `specializations: ["SATYANARAYAN"]` · `identityVerified: true` · `verifiedPoojaTypes: []` |
| `/pandit/readiness` | `readinessStep: 1` · `isBookingReady: false` |
| `GET /pandits` — `pujaServices` | **`[]` — still empty** |

## What FINDABLE BY DESIGN measurably means today — three claims, one miss

1. **The row carries the enum** — measured in the public directory. His card
   now renders a SATYANARAYAN chip a customer can read. ✅
2. **The customer search shows him** — it always did (the filter is dead,
   F-J4-4); what changed is that when that filter is fixed, **he remains
   findable for Satyanarayan** instead of vanishing. Findability no longer
   rests on the defect. ✅
3. **"The fallback quote is no longer the only path" — NOT ACHIEVED, and the
   miss is its own finding.** The wizard's card prices from
   `pujaServices[].dakshinaAmount` (the F-J4-3 mapping); **R1 wrote
   `DakshinaRate` — a different table — and the public directory projects
   `pujaServices` only, still `[]`.** The ₹2,100 the pandit just set is
   invisible to every customer surface; the ceremony-base fallback remains
   the only quote path.

### 🔴 F-J9-2 · THE DAKSHINA THE PANDIT SETS IS NOT THE DAKSHINA THE CUSTOMER SEES — report-only

The same writer/reader schism as F-J9-1, one table over: **R1 writes
`DakshinaRate`; the customer price path reads `PujaService`.** Nothing bridges
them. A pandit who sets his rate through the app's own readiness wizard has
set a number no customer surface will ever quote. With F-J9-1 this makes the
pattern **systematic, not accidental**: the pandit-side wizards write
`PoojaConfig` / `PoojaVerification` / `DakshinaRate`, and the customer-side
readers read `specializations` / `PujaService` — **two writer vocabularies,
two reader vocabularies, one overlap (`specializations`), and R1 is the only
wizard that writes it.** The vocabulary-bridge ruling now has both specimens
priced, in production ids.

---

# J9 · ACT TWO — THE RUNWAY, FINAL FORM. NOTHING WALKED PAST THIS LINE.

**Target:** `क्यूए-walk पंडित J2` (`cms9zruni0000fh3olj7zbfhx`) — **never
Tanya**. **Customer:** the J1 account (+919000000901). **Every created row
§C-logged at the moment of the act.**

| leg | disposition |
|---|---|
| `POST /bookings` | ALLOWED — **the proxy's self-asserting target check is live**: it parses every booking body and forwards only if `panditId === cms9zruni0000fh3olj7zbfhx`; anything else dies at the proxy, not at my intention. |
| anything carrying Tanya's id or phone | KILLED unconditionally. |
| `POST /payments/create-order` | ALLOWED — Razorpay **test keys**, server-side; no real charge. |
| client `POST /payments/verify` | ALLOWED — the only confirmation leg that exists. |

**Where the flow stalls by construction:** the **webhook is UNREGISTERED**, so
server-push confirmation never fires. Either the test modal completes in the
pane → client verify → CONFIRMED with the webhook leg never exercised (named),
or the modal cannot complete → **the stuck-payment state is the EXPECTED
terminal**, and its rendering on BOTH dashboards — customer and pandit — is
the measurement, not a failure.

**Price expectation, from F-J9-2:** the wizard will quote the **ceremony
base** (`पूजा की आधार दक्षिणा`), NOT the pandit's ₹2,100 — his rate lives in a
table no customer surface reads. The booking's dakshina will be the ritual's
`basePriceMin`. Stated now so the Review screen's number is read as the
known defect, not a new one.

## 🔴 BOTH OF THESE WAIT ON ISJ'S TWILIO WORD — restated as ordered

1. **Act two's `POST /bookings`** fires `NotificationService.notify()` to
   customer AND pandit, server-side, where no proxy reaches.
2. **Isj's own approve click** on the pending pooja
   (`cmsaftb9p0003ei3n2cpf021d`) fires the same SMS leg
   (`approvePoojaVerification`, :159).

**The dashboard reading:** `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` /
`TWILIO_PHONE_NUMBER` (+ `TWILIO_WHATSAPP_NUMBER`) on Render. **Absent** →
stubs (`notification.service.ts:48`), both acts free. **Present** → Isj
removes them for the walk (option c, his hand); option b remains rejected.

---

# J9 · ACT TWO — THE FIRST BOOKING. WALKED TO THE STUCK-PAYMENT TERMINAL.

## §C first

**Twilio reading (Isj's dashboard measurement, 2026-08-01): ABSENT.** No
`TWILIO_*` on Render → `sendSms` stubs to console
(`notification.service.ts:48`). Both gates were open; no real SMS is possible
from this walk.

| # | table | id | key fields |
|---|---|---|---|
| 7 | **Booking** | `cmsagu1900001f73ozoz4j10h` | **HPJ-2026-64970** · Satyanarayan Puja · 2026-09-15 · Ghaziabad · dakshina 2100 · grandTotal **2310** · customer = J1 · pandit = क्यूए-walk पंडित J2 |
| 8 | Razorpay order (test) | `order_TKXQtkNFNqzH1j` | amount **231000 paise = ₹2,310** — display=charge holds to the paisa |
| — | Notification rows ×2 | unread (no reader endpoint surfaced) | written server-side by `notify()`; content below from the template source |

## The target check — FIRED AND PASSED

The proxy parsed the booking body and forwarded **only** on
`panditId === cms9zruni0000fh3olj7zbfhx`:

```
── TARGET-CHECK PASSED: panditId === QA pandit — forwarding booking ──
LIVE POST /api/v1/bookings -> 201
```

**A wrong target dies at the proxy, not at my intention** — and this time the
proxy proved it can also let the right one through.

## The walk

J1 customer, wizard front to back on the fixed paths: Satyanarayan →
**both pandits listed, क्यूए- selected with his SATYANARAYAN chip (by
design)** → Ghaziabad venue (same-city, travel skipped — F-J4-8's fix) →
`venueState` auto-flipped to Uttar Pradesh (F-J4-11 holding) → ritual details →
₹0 self-bring samagri → **Review & Pay: PRIMARY PANDIT · क्यूए-walk पंडित J2,
Pay Now ₹2,310** → Proceed → 201.

**The F-J9-2 specimen, photographed:** both pandit cards quote
**"पूजा की आधार दक्षिणा ₹2,100"** — the ceremony-base LABEL. Honesty note:
the क्यूए- pandit's invisible personal rate is *also* 2100 (chosen for
consistency), so **the label is the specimen, not the number.**

## Where it rests — the EXPECTED terminal, reached by construction

The Razorpay test modal opened (**Test Mode**, ₹2,310, all four payment
options). **The pane's synthetic clicks do not reach the cross-origin
iframe** — both DPR mappings and the documented resize cure were tried. That
is the runway's named second branch, not a failure:

> **THE BOOKING RESTS AT: `status CREATED / AWAITING_PAYMENT` ·
> `paymentStatus PENDING` · order created · webhook unregistered · client
> verify never ran.** The canonical stuck payment.

## THE THREE READINGS

### a · The pandit's side

API: the booking is **visible** as **`AWAITING_PAYMENT`** — and **correctly
NOT in his REQUESTED list**: an unpaid booking demands no accept/decline.
Honest state. One flag: **`customerName: ""`** — the J1 customer's name does
not reach the pandit's projection; the blank-name class again (report-only).

### b · The customer's side

`/dashboard/bookings` renders the card: **Satyanarayan Puja · मंगलवार, 15
सितंबर 2026 · Pt. क्यूए-walk पंडित J2 · Ghaziabad · PENDING · ₹2,310 · "इसमें
₹210 प्लेटफ़ॉर्म शुल्क शामिल"** — status, pandit, and the fee disclosure all
honest. *(One transient: the first load after abandoning the modal rendered
blank with `Failed to fetch` at mount; it did not reproduce on reload.
Recorded as UNRESOLVED-TRANSIENT — dev-server context, not filed as a
production finding.)*

### c · Admin — stated, Isj's eyes confirm

Expected: one booking **HPJ-2026-64970**, payment PENDING / awaiting payment,
customer `क्यूए-walk यजमान J1`, pandit `क्यूए-walk पंडित J2`. Nothing
requiring action.

## 🔴 THE NOTIFICATION CONTENT — the roman-template evidence against a real booking

Twilio absent → these went to Render's console verbatim (templates ×
this booking's real values):

**To the customer:**
> `🙏 Booking HPJ-CMSAGU19 created! Satyanarayan Puja on 2026-09-15. Pandit ji will confirm within 6 hours. -HmarePanditJi`

**To the pandit:**
> `🔔 Nayi booking aayi hai! Satyanarayan Puja, 2026-09-15, Ghaziabad. Kamai: ₹2100. 6 ghante mein jawab dein. App kholein: [link] -HmarePanditJi`

Beyond the already-censused roman script, **three NEW defects render only
against a real booking:**

- **F-J9-3 · TWO BOOKING-NUMBER VOCABULARIES.** The customer's SMS says
  **`HPJ-CMSAGU19`** (`id.substring(0,8)` uppercased); every screen says
  **`HPJ-2026-64970`** (`bookingNumber`). A customer quoting their SMS to
  support is quoting a number no system surface knows.
- **F-J9-4 · A DEADLINE FOR AN ACTION THAT DOES NOT EXIST YET.** The pandit
  is told *"6 ghante mein jawab dein"* — for a booking that is
  `AWAITING_PAYMENT` and **correctly absent from his REQUESTED list**. He is
  given a deadline for an action his app will not offer him until payment
  lands. The customer's "confirm within 6 hours" is the same promise from the
  other side — with nothing scheduling either.
- **F-J9-5 · `App kholein: [link]`** — a literal placeholder in a production
  template; the link was never wired.

## STOPPED — as ordered

**Accept/decline is the pandit's act and waits on these readings and Isj's
word.** Also parked at the terminal: whether to complete the test payment by
another means (the pane cannot drive the Razorpay iframe) or leave
HPJ-2026-64970 as the standing stuck-payment specimen — its honesty on both
dashboards is already measured and good.

---

# 🔚 J9 — CLOSED. HPJ-2026-64970 IS THE STANDING STUCK-PAYMENT SPECIMEN.

**Ruled:** the payment is NOT completed. The booking's honesty is measured on
both dashboards, and **on the funded day it becomes the webhook registration's
first before/after** — the same row, re-read once the webhook exists, is the
proof that registration changed something.

**The accept-leg's absence is a measured PASS, not a gap:** an
`AWAITING_PAYMENT` booking is **correctly absent from the pandit's REQUESTED
list** — an unpaid booking demands no answer. That design is right, and the
accept/decline walk becomes **J10's opening on the funded day**.

## The notification defects, filed beside the seven roman templates

The Twilio stub rendered the copy-pass census against a real booking for free.
Beside the **seven pandit-facing roman templates** already on Isj's desk, three
defects only a real booking could expose:

| # | finding | class |
|---|---|---|
| F-J9-3 | SMS says `HPJ-CMSAGU19`; every screen says `HPJ-2026-64970` | two booking-number vocabularies — writer/reader, in the customer's pocket |
| F-J9-4 | *"6 ghante mein jawab dein"* to a pandit whose app correctly offers no answer yet | **DEADLINE-ON-NONEXISTENT-ACTION** — a promise wearing a clock, aimed at a control that does not exist. Sibling of priced-but-undelivered: there the price precedes the service; here the deadline precedes the action. |
| F-J9-5 | `App kholein: [link]` — a literal placeholder in production copy | fabricated-claim, smallest possible member |

## §C · FINAL STATE — nine rows, one specimen, one obligation

| # | row | id / identification | cleanup |
|---|---|---|---|
| 1 | User (J1 customer) | `cms9yhwfd0000hk3nb7d66g2z` · +919000000901 | delete |
| 2 | User + PanditProfile (क्यूए- pandit) | `cms9zruni0000fh3olj7zbfhx` / `cms9zrupd0002fh3o8nse06f5` · +919000000903 | **UN-VERIFY then delete** — verify + aadhaar columns live |
| 3 | PoojaConfig | `cmsaftb280001ei3nqp0ei5xp` | delete |
| 4 | PoojaVerification | `cmsaftb9p0003ei3n2cpf021d` · PENDING | delete |
| 5 | PanditProfile.specializations | `["SATYANARAYAN"]` on row 2 | clear |
| 6 | DakshinaRate | row-2 profile + SATYANARAYAN @2100 | delete |
| 7 | **Booking — THE STANDING SPECIMEN** | `cmsagu1900001f73ozoz4j10h` · **HPJ-2026-64970** · AWAITING_PAYMENT | **KEEP until the webhook before/after; then cleanup** |
| 8 | Razorpay test order | `order_TKXQtkNFNqzH1j` · ₹2,310 | test-mode; expires by itself |
| 9 | Notification ×2 | unread (no reader endpoint); content preserved in this ledger | delete with owner rows |

**Twilio: ABSENT** (Isj's dashboard measurement) — recorded; the stub is the
transport until the funded day.

---

# 🔚 THE CAMPAIGN'S J9 CLOSE

## Journeys walked

| journey | state | terminal |
|---|---|---|
| J1 customer signup/login | ✅ closed | session P0 fixed ×3-confirmed |
| J2 pandit login + row | ✅ closed | row logged (late — and the law that came from it) |
| J3 admin gate | ✅ closed (to the gate) | credentials never typed |
| J4 search + booking surfaces (+J4b) | ✅ closed | 16 raised · 1 withdrawn · 11 fixed · 4 open |
| J5 fresh-pandit onboarding | ✅ closed | atomic write proven on BOTH paths; second honest VERIFIED |
| J9 act one (pooja) | ✅ closed | the wizard writes what no reader reads — measured |
| J9 act two (booking) | ✅ closed | **HPJ-2026-64970, the standing specimen** |

## Findings across the campaign (per journey, raised / fixed / open)

- **J1:** 4 raised · 2 fixed · 2 backlog (design pass)
- **J2:** 1 raised · ruled-keep
- **J3:** 1 raised · backlog (vocabulary-boundary)
- **J4+J4b:** 16 raised · 1 withdrawn (F-J4-13, mine) · 11 fixed+proven · 4 open (F-J4-2/4 dead filters, F-J4-15 fixed later, F-J4-16 design) — *F-J4-14 was never assigned; the gap is numbering, not a hidden finding*
- **J5:** 6 raised · 4 fixed+proven (F-J5-1/2/4/5) · 1 backlog (F-J5-3 CORS) · 1 report (F-J5-6)
- **J9:** 5 raised (F-J9-1..5) · all report-only, on Isj's desk — the vocabulary-bridge pair (1,2) and the notification trio (3,4,5)

## Classes born in this campaign

1. **FABRICATED-NOT-EMPTY** (above EMPTY-NOT-BROKEN) — and its mirror: *the truth existed and was invisible.*
2. **TRUE-BY-ACCIDENT** — a claim true only while a condition happened to hold; defence = bind the claim to its condition.
3. **FINDABLE-BY-DEFECT** — two defects covering for each other; the behaviour between them coincidence.
4. **DEADLINE-ON-NONEXISTENT-ACTION** — the deadline precedes the action.
5. **DELETION-ON-PREMISE** — a deletion's premise needs the same verification as a guard's scope.
6. **PRICED-BUT-UNDELIVERED** — ended by removal (₹499).
7. **The instrument-lies-first five:** `\b`/Devanagari · WRITER_REGISTRY lookback · the sweep's silent cap · `bgOf(parent)` · the proxy that rewrote multipart. All five caught by control, none by a green run.

## Unwalked, each with its gate

| journey | gate |
|---|---|
| **J6 · authed admin pass** | admin credentials are never typed by me — Isj-assisted session, his word to schedule |
| **J7 · abandonment / re-entry** | no hard gate — needs only Isj's order |
| **J8 · muhurat + consultation gap-doc** | F-J4-1 part two (real panchang) is funded-day; ₹499 removed — J8 is documentation of honest absence, walkable on order |
| **J10 · accept → journey → complete → review** | needs a PAID booking: **webhook registration (funded day)** — its before/after is the standing specimen; then the accept-leg opens J10 |
| **J11 · payout** | funded day — live Razorpay keys + payout rails; model already ruled (100% to pandit, CONFLICT_RULINGS #7) |

**STOPPED.** Isj rules on what walks next versus what waits for the funded day.

---

# 🔚 J7 — ABANDONMENT. WALKED. §C UNCHANGED: NOTHING MINTED.

**The expectation held: J7 created no rows.** Nine remains nine. A resume
minted nothing — which was itself the thing being tested.

## PANDIT SIDE

### 1 · Registration draft — a PRE-WALK finding, before any kill

Before J7 touched anything, `hpj-registration` already held **J2's completed
registration**: `name: "क्यूए-walk पंडित J2"`, `sessionId
session_1785161889597…`, `startedAt` 26 Jul. **A registration that SUCCEEDED
weeks ago left its draft behind.**

`purgeUserData.ts:38` lists `hpj-registration` for purge — so the key is known
and handled **on logout**, but **not on completion**. The draft outlives the
act it was drafting.

> **🔴 F-J7-1 · A COMPLETED DRAFT IS NOT A DRAFT.** Nothing clears it at
> success; only logout does. A returning pandit carries a stale identity blob
> naming him and his old session indefinitely. Report-only (it is a client
> store; no server claim rests on it) — but it is the same *unowned-state*
> shape as TRUE-BY-ACCIDENT: a value nobody is responsible for retiring.

### 2 · Mid-readiness kill (R1 half-filled) — **PASS**

Selected a **second** pooja (गृह प्रवेश) + typed **₹3,100**, never saved,
killed by navigation, returned to `?step=1`:

| after return | value |
|---|---|
| selected checkmarks | **1** (सत्यनारायण only) |
| dakshina fields | **`["2100"]`** — the saved value alone |
| गृह प्रवेश / 3100 | **gone** |

**The client resumes from the SERVER snapshot and invents nothing.** No local
draft, so no half-truth survives — the screen shows exactly what the server
holds. **The honest loss.**

### 3 · Step-5 kill with a replacement file attached — **the sharp one**

Resumed step 5 showed **both slots "✓ हो गया"** (server truth). Attached ONE
replacement front file, **never pressed पूरा कीजिए**, killed, re-read the
profile.

**DB verdict: unchanged.** `aadhaarFrontUrl` is still
`uploads/cms9zruni0000fh3olj7zbfhx/aadhaar-front`, status still VERIFIED. The
atomic law holds on the client leg too.

> **🔴 F-J7-2 · BUT THE BYTES CHANGED.** `buildUploadKey` is deterministic —
> `uploads/{userId}/{kind}` — and the upload controller's **DEDUP LAW**
> deliberately overwrites the same object in place. So the abandoned upload
> **silently replaced the verified Aadhaar image in storage** while the DB
> column stayed byte-identical.
>
> **A VERIFIED PANDIT'S APPROVED DOCUMENT CAN BE REPLACED BY AN ABANDONED
> FORM.** The admin verified an image; the object behind that URL is now a
> different one, and no column changed to say so. The dedup law is correct for
> *drafts* and dangerous *after approval* — the two cases were never separated.
> **Report-only: identity.** For J7's own test row the replaced object is my
> 1×1 marker, which is why this was safe to discover here rather than on a
> real pandit.

### 🔴 A FALSE POSITIVE I RAISED AND KILLED — instrument-lies-first, member 6

My first check asked `/J7|replacement/i.test(frontUrl)` and returned **true** —
I nearly reported "the abandoned file overwrote the DB column." It matched
because the **user id itself contains `j7`**: `cms9zruni0000fh3ol` **j7** `zbfhx`.
Printing the value verbatim settled it.

> **A SUBSTRING TEST OVER AN OPAQUE ID IS NOT A TEST.** Ids are haystacks;
> every short token is somewhere inside one. The correct instrument was the
> value itself, and it took four extra characters to get.

## CUSTOMER SIDE

### 4 · Mid-wizard kill at step 1 — **total loss, and it is honest**

Filled Satyanarayan + 15 Sep + Ghaziabad venue + pincode, advanced to step 1,
killed, returned:

| field | after return |
|---|---|
| ceremony | **"Select a ceremony"** |
| date | **empty** |
| venue street / pin | **empty** |
| venue city | **"Delhi"** (default) |

**There is NO draft mechanism at all** — grep for `localStorage|draft` in
`booking-wizard-client.tsx` returns nothing; the only `hpj_*` keys are session,
language, tutorial, samagri-cart, location-prompt. Steps 3 and 5 were not
separately killed because **step 1 already proves the mechanism is absent** —
a later kill can lose no less. *(Stated rather than performed: the two extra
kills would have measured the same nothing.)*

**Not filed as a defect on its own** — losing a wizard on tab-death is
ordinary. It becomes one only in combination, below.

### 5 · THE SIBLING QUESTION — measured from code, **no second booking minted**

| mechanism | verdict |
|---|---|
| `POST /bookings` idempotency | **NONE** — no dedup; a completed re-walk *would* mint a sibling |
| `createRazorpayOrder` | **IDEMPOTENT — PASS.** Reuses `booking.razorpayOrderId`; guarded by `orderIdempotency.test.ts`, which asserts the reuse branch sits *before* the network call, plus a `CAPTURED` guard |
| resume-payment path from a booking | **NONE** — the booking card and detail page carry no pay/retry control; `/booking/checkout` exists with **zero inbound links** |

**The specimen did not gain a sibling, and I stopped before POST as ordered.**

> **🔴 F-J7-3 · THE ONLY ROUTE BACK TO PAYING IS ONE THAT DUPLICATES.**
> HPJ-2026-64970 sits PENDING and **the customer's own screens offer no way to
> resume its payment**. The single path back to paying is re-walking the
> wizard — which has no draft, and whose POST has no idempotency, so it
> creates a **second booking against the same pandit and date** rather than
> paying the first.
>
> The order-level guard is real and passing; the gap is one level up. **An
> abandoned payment is not recoverable — it is repeatable.** Filed as the
> J10/funded-day companion to webhook registration: the same work that makes a
> payment confirmable should make it resumable.

---

# 🔚 J8 — DOC-PROMISED / BUILD-ABSENT. Documentation, not a walk.

| promise | measured evidence | today | funded-day disposition |
|---|---|---|---|
| **Muhurat calendar** (business-idea) | `/api/v1/muhurat/dates` → `{"dates":[]}`, `/upcoming` → `{"dates":[]}` (measured twice); page now asks and renders "मुहूर्त तिथियाँ अभी उपलब्ध नहीं हैं" | **honest empty** — the fabricated calendar is deleted (F-J4-1 part one) | **part two is Isj's:** source real panchang, or remove the surface |
| **₹499 consultation** (business-idea J8b) | zero API surface; captured payload proved the only trace was one `specialInstructions` sentence | **REMOVED by ruling** — card, state, constant, cost term, sentence; verified absent on screen and in payload | returns only as the docs' consultation feature, with payload field + server fee + a pandit-side surface |
| **Wallet** (business-idea) | one string label in `stitched/page.tsx:36`; no route, no API, no model | **ABSENT — and nothing claims otherwise** | unscheduled; no promise is currently rendered, so nothing is owed to a user today |
| **Travel quoting** (pandit-platform) | `/travel/calculate` is real and works (`j.data.options`), but every pandit city is Devanagari and the matrix is English-keyed (F-J4-8) | **CUT from v1** — the public profile's invented ₹4,300 tab is deleted; the wizard's invented options are deleted; same-city bookings need no travel | Level-2 city vocabulary (Shape A/B, costed in this ledger) |
| **Samagri catalogue** | `/samagri/catalog` 500'd forever (JSON absent from `dist`) — fixed by import; **the production 200 curl is still Isj's one line** | **fixed, unverified in production** | closes F-J4-12 the moment the curl runs |

**J8's shape, stated:** every promise above is now either **honestly absent**
or **honestly empty**. **No surface in the customer or pandit app currently
renders a doc promise the build cannot keep** — that is the whole yield of the
FABRICATED-NOT-EMPTY campaign, and J8 is its receipt rather than a walk.

---

**J7 CLOSED · J8 CLOSED.** §C unchanged at nine rows. The campaign now holds
for **J6 (Isj's admin session)** and **J10/J11 (funded day)**.

---

# 📕 THREE ENTRIES, ONE FIX — the J7 rulings, recorded

## 1 · CLASS: **POINTER-INTEGRITY IS NOT CONTENT-INTEGRITY**

> **A clean database can hide a storage defect.** Every column can be
> byte-identical, every atomic-write law can hold, and the bytes the pointer
> names can still be different bytes. Verifying the *reference* is not
> verifying the *referent*.

**Member one — F-J7-2.** `aadhaarFrontUrl` stayed exactly
`uploads/cms9zruni0000fh3olj7zbfhx/aadhaar-front` across an abandoned upload;
`verificationStatus` stayed VERIFIED; the atomic write held on both legs. And
the object behind that URL was replaced, because `buildUploadKey` is
deterministic — `uploads/{userId}/{kind}` — and the upload controller's DEDUP
LAW overwrites in place by design.

**The two cases were never separated.** Dedup-in-place is *correct* for a
draft: a pandit re-shooting a blurry Aadhaar should not accumulate five orphan
objects. It is *dangerous* after approval: an admin verified a specific image,
and the URL that records that decision now names a different one. One key
policy is serving two lifecycles with opposite requirements.

### Fix shapes — Isj's desk, identity ruling. **NOT BUILT.**

| shape | what it changes | one-line cost |
|---|---|---|
| **A · content-addressed keys** | key becomes `uploads/{userId}/{kind}/{sha256}`; every upload is a new object, the column names the exact bytes | biggest change — column writes on every re-upload, plus a lifecycle rule to reap unreferenced objects, or storage grows forever |
| **B · versioned-after-approval** | dedup stays for drafts; once `verificationStatus` leaves PENDING the key gains a suffix so a new upload cannot land on the approved object | smallest change that actually closes it — one branch in `buildUploadKey` plus the status read; the approved object is then immutable by construction |
| **C · upload freeze after `DOCUMENTS_SUBMITTED`** | the server refuses identity uploads once documents are submitted | cheapest to write, and it removes a real capability — a pandit who genuinely needs to replace a bad scan now needs an admin |

**Recommendation stated, not enacted: B.** It is the only one that closes the
hole without either unbounded storage or taking away a pandit's ability to fix
his own document. **A/B/C is Isj's call — this is identity.**

## 2 · INSTRUMENT-LIES-FIRST, MEMBER SIX: **IDS ARE HAYSTACKS**

> **A substring test over an opaque id is not a test.** Ids are dense random
> strings; every short token you might search for is already inside one
> somewhere. The match tells you nothing about the thing you meant.

`/J7|replacement/i.test(frontUrl)` returned **true**, and I nearly filed "the
abandoned file overwrote the DB column." It matched the user id itself:
`cms9zruni0000fh3ol` **j7** `zbfhx`.

**THE FOUR-CHARACTER CURE: print the value.** Not a boolean about the value —
the value. Every member of this class dies the moment the instrument reports
what it actually saw instead of its verdict about it. *(Same family as "a probe
must report where it stood, not only what it saw.")*

The six, all caught by control, **none by a green run**: `\b` vs Devanagari ·
WRITER_REGISTRY lookback · the sweep's silent cap · `bgOf(parent)` · the proxy
that rewrote multipart · **ids are haystacks**.

## 3 · F-J7-3 FILES WITH WEBHOOK REGISTRATION — funded day

> **The same work that makes a payment confirmable should make it resumable.
> An abandoned payment isn't recoverable — it's repeatable.**

Filed verbatim beside webhook registration, against the standing specimen
**HPJ-2026-64970**. The order layer is already clean and guard-tested
(`orderIdempotency.test.ts` pins the reuse branch ahead of the network call);
what is missing sits one level up — no idempotency on `POST /bookings`, no
pay/retry control on any booking surface, no inbound link to
`/booking/checkout`.

---

# ✅ F-J7-1 — FIXED, AND PROVEN TWICE ON THE SHIPPED LINE

**The fix.** `clearRegistrationDraft()` (`purgeUserData.ts`) + one call in
`RegistrationScreen.handleSubmit`, **after `res.success`, never before**.

**Why it is two steps and not one.** `purgeUserData`'s own comment already
carried the rule and this fix is the second thing to need it: the persist
middleware re-writes `hpj-registration` on **every** `set()`. So `removeItem`
alone is undone by the next write, and `reset()` alone leaves a default-valued
key — *which is still a key*. Reset **then** remove, in that order.

## The browser proof — 360×740, production API through the walk proxy

| | BEFORE (form filled) | AFTER (`POST /pandit/onboarding` → 200) |
|---|---|---|
| key present | **true** | **false** |
| name in draft | `क्यूए-J7 ड्राफ्ट पंडित` | — |
| city in draft | `गाज़ियाबाद` | — |
| sessionId | `session_1785598046212_z2vls2khw` | — |
| screen | registration form | `/home`, **"नमस्ते, क्यूए-J7 जी"** |

**The name survives where it should and dies where it shouldn't** — home greets
him from the *server*, while the draft that described a not-yet-account is gone.

**Resurrection probed, not assumed:** key still absent after the home render,
after a dispatched `visibilitychange`, and after a **full page reload**.

### I PROVED THE WRONG BUILD ONCE, AND RE-RAN

The first pass proved a bare `clearRegistrationDraft();`. Reviewing my own fix
I found the return value **discarded** — a dead control, the exact class this
campaign keeps catching, written by me *while* fixing a state-hygiene defect.
So the shipped line now reads the verdict and reports a storage-refused clear.

That made my green stale. **A proof of a line I then edited is not a proof of
the shipped line** — so the whole walk was re-run against the final code, and
the table above is the second run. *(The author of a fix is not exempt from the
defect class he is fixing — third application.)*

### AND THE HARNESS BIT ME AGAIN: I MOVED THE TARGET MID-PROOF

The re-run failed twice with the honest offline banner and **no request in the
proxy log at all**. Cause: I had already restored `apps/pandit/.env.local` to
the production base, so the rebuilt bundle was aiming at production, which
CORS-blocks `localhost:3002` (F-J5-3, re-measured this turn: preflight → **500,
no allow-origin**). Settled by probing both candidates from the page — proxy
`404`, production `THREW: Failed to fetch` — rather than by reasoning.

> **A WRONG TARGET DIES AT THE PROXY, NOT AT MY INTENTION — SECOND
> APPLICATION,** and this time I moved the target myself, during the
> measurement, by cleaning up early. **Teardown is part of the experiment.**

## THE FAILURE BRANCH, PROVEN BY ACCIDENT

Those two failed submits were not waste — they are the other half of the claim.
The comment says a failed submit keeps the pandit's typing; the run showed the
draft **still present** afterwards, name and city intact, and the form
**resuming from it** on the next load. The branch I asserted got measured
without my planning it.

## WHAT THE FIX DOES NOT CLOSE — stated, not glossed

1. **Stale drafts already stranded** on devices where registration finished
   *before* this fix are untouched; only logout clears those. **The J2 draft
   that opened F-J7-1 will outlive the fix on that device.** Sweeping them would
   mean also clearing on the `profileComplete === true` login branch — one more
   line, deliberately not taken, because the order was *clear on success*.
2. **Two resurrection windows survive** (both pre-existing, both shared with the
   logout path, both verified in source this turn):
   - the cross-tab `storage` listener guards on `event.newValue`, and a
     `removeItem` fires with `newValue === null` — so a second tab never learns
     of the clear and re-writes the key on its next `set()`;
   - `(auth)/referral/[code]` is a **live** route that calls `setReferralCode`,
     and the fenced `(registration)` layout calls `setLanguage` on mount — each
     a `set()`, each therefore a write.
3. **The clear discards `referralCode`.** Harmless *today* only because the
   onboarding POST body carries `{name, city}` and nothing reads that field —
   **so the premise of my deletion is "referral is unused", exactly the kind of
   premise DELETION-ON-PREMISE says must be verified rather than assumed.** I
   verified it; if referral attribution is ever wired, **the clear must move
   after the code is consumed.**
4. **The fix ships with no test.** Per the order (*no new guard work*) I did not
   add one; the coverage gap is real and named here rather than left implied.
   One assertion in `backSafety.test.tsx` would pin it whenever guards reopen.

## MEASURED IN PASSING — a registered pandit can be shown the registration form

Reaching the form for an already-registered account was not a trick; it is a
**live path**. `onboarding/page.tsx:222` falls through to
`setPhase("REGISTRATION")` on **a `/auth/me` fetch failure** as well as a
genuinely incomplete profile — its own comment says so. Screenshotted at
360×740: valid token, `fullName` on the server, **blank form**.

Not filed as a new defect and not fixed: it is the F1(c) routing law's
degraded-network edge, and it now behaves *more* honestly than before — the X3
law says a name is never prefilled, and after this fix nothing prefills it.
**Recorded because the fix changed its texture, not because it changed its
verdict.**

---

## §C — ROW 10 · logged AT THE MOMENT OF THE ACT

| # | row | id / identification | cleanup |
|---|---|---|---|
| 10 | **User + PanditProfile** (fresh-registration probe) | `cmsaiqi9y0000fm3nxkzg38r7` / `cmsaiqiby0002fm3n8ontu105` · **+919000000907** · `क्यूए-J7 ड्राफ्ट पंडित` · गाज़ियाबाद · PENDING · no aadhaar, no bank, `readinessStep 0` | delete (plain — nothing to un-verify) |

**Minted because the claim required it:** the only way to observe a
*successful* registration retiring its own draft is to complete one. Created at
`POST /auth/otp/verify` (dev OTP), completed at `POST /pandit/onboarding`
(200 ×2 — the same row, re-submitted for the re-proof; **no second row**).
§C now stands at **ten**.

---

**THE CAMPAIGN HOLDS.** No new walks, no new guard work. **J6** waits on Isj's
admin session; **J10/J11** wait on the funded day. The resume pointer stands.

---

# ⚖️ F-J7-2 IS RULED — **SHAPE B, VERSIONED-AFTER-APPROVAL**

**Ruled, not built.** It enters the **PRE-FUNDED-DAY QUIET-FIXES BATCH** as its
first member. Nothing in this section is code; it is the spec the batch
implements.

**The shape:** one branch in `buildUploadKey` (`services/api/src/lib/storage-keys.ts:65`).
Draft dedup keeps its own lifecycle — a pandit re-shooting a blurry Aadhaar
still overwrites in place, no orphans. Once the profile leaves PENDING the key
versions, so **the approved object becomes immutable by construction**: there
is no longer a key an abandoned form could land on.

## THE POSITIVE CONTROL — specified with the ruling, per the campaign's rule

> **Replay F-J7-2 exactly: attach after approval, never submit, assert the
> approved object's hash is UNCHANGED.**

| leg | act |
|---|---|
| baseline | hash the bytes at the approved key |
| replay | on a VERIFIED pandit, attach a *different* file to the identity step and **never** press पूरा कीजिए — the same abandonment J7 walked |
| assert | re-hash the approved key → **identical**; and the DB pointer → identical |
| paired negative | **already on record.** The J7 walk IS the before-arm: same replay, pointer identical, bytes replaced. A control needs both arms and this one has them — the failing arm was measured before the fix existed. |

**The control is EXECUTABLE — checked, not assumed.** `getPresignedGetUrl`
(`storage.ts:112`) issues a 900s signed GET, and `getObjectBuffer`
(`storage.ts:138`) reads bytes server-side; `canPresign` already lets a pandit
presign their own keys and an admin any. So "hash the object" is a real
operation today. *(A control that cannot be run is not a control — this is the
same discipline that killed the sweep's silent cap.)*

## TWO CONSTRAINTS THE BATCH MUST CARRY

**1 · §C ROW 2 IS THE CONTROL'S ONLY SPECIMEN — DO NOT CLEAN IT UP FIRST.**
The replay needs a **VERIFIED** pandit. Row 2 (`cms9zruni0000fh3olj7zbfhx`) is
the only test-marked one, and **🔴 TANYA IS ABSOLUTELY OFF LIMITS.**
Verification is an *admin* act, so deleting row 2 before the control runs means
minting and verifying a replacement **by Isj's own hand** to get back to the
starting line. The §C obligation therefore gains an ORDER, not just a step:

> **run the F-J7-2 control → THEN un-verify → THEN delete row 2.**

Note what the specimen is today: the object at that key is **my 1×1 J7 marker**,
not the image the admin originally approved — the original is already gone,
which is the finding. So the baseline hash is captured **fresh at replay time**;
it cannot be recovered.

**2 · SHAPE B FALSIFIES AN EXISTING GUARD — it is an EDIT, not an addition.**
`services/api/src/lib/storage-keys.test.ts:14` asserts the dedup law
**unconditionally**: *"re-upload of the same kind must produce the SAME key
(dedup)"*, alongside a controller grep pinning the 2-arg
`buildUploadKey(userId, kind)` call shape (`:36`). Under Shape B that
assertion becomes **false for the post-approval case**, and the call gains an
argument.

An implementer who only *adds* a versioning test will be met by a red guard
asserting the opposite and may "fix" it by weakening the wrong side. The batch
must **re-state the law in two clauses** — dedup while PENDING, versioned after
approval — and, per the **G2 standing rule**, any guard touched leaves the file
with `proveMatchers` + `proveSaw`. **Never added to baseline.**

> **A law that grows a second case has to say so in the same test that stated
> the first.** The dedup guard is not wrong today; it is *incomplete tomorrow*,
> and the difference is invisible until something depends on it.

---

**THE CAMPAIGN HOLDS.** Between here and the funded day the only work is the
**quiet-fixes batch** — F-J7-2/B and whatever Isj adds to it. **J6** waits on
Isj's admin session; **J10/J11** wait on the funded day. §C stands at ten, row
2 now carrying an ordered obligation.

---

# 📌 TWO ONE-LINERS — the last entries before the campaign rests

## 1 · §C ROW 2's CLEANUP ORDER IS **LAW**, NOT PREFERENCE

> **Row 2 cleanup order — LAW: run the F-J7-2 control → un-verify → delete. A
> deletion that skips the control destroys the only executable specimen of a
> ruled fix.**

Not a sequencing note that a tidy-up may reorder. The specimen is
irreplaceable without an admin act (verification is Isj's hand, and
**🔴 TANYA IS ABSOLUTELY OFF LIMITS**), so deleting early does not cost a row —
it costs the ruling its proof.

## 2 · BESIDE **DELETION-ON-PREMISE**, VERBATIM

> **THE DEDUP GUARD ISN'T WRONG TODAY; IT'S INCOMPLETE TOMORROW.**

DELETION-ON-PREMISE catches a premise *after* something has been removed on it.
This is the same law pointed **forward**: **a ruling that names its own
guard-conflict in advance is the propagation law running ahead of the change
instead of catching up to it.** Shape B was ruled together with the guard it
falsifies (`storage-keys.test.ts:14`), so the two-clause restatement is part of
the spec rather than a red test someone meets later and weakens from the wrong
side.

---

# 🛑 THE CAMPAIGN RESTS

**The only work between here and the funded day is the QUIET-FIXES BATCH:**
Shape B · its two-clause law restatement · F-J7-1's named residuals *if Isj
adds them*. **No walks. No guard work. No new tranches.**

**J6** waits on Isj's session. **J10/J11** wait on funding. §C stands at **ten**,
row 2 under the ordered law above, `HPJ-2026-64970` kept as the standing
stuck-payment specimen for the webhook before/after.

**Standing rules and the resume pointer govern the next session.**

---

# 📕 TRACK 1 — THE LAW, THE CORRECTION, AND BATCH 1

## 1 · LAW RECORDED

> **A DESIGN FILE IS ALSO A STREAM; FIND ITS SUPERSESSION BOUNDARY BEFORE
> READING IT.**

`ग्राहक ऐप · Customer.dc.html` holds four generations newest-first, and turn 4
says of itself: *"English-first rebuild … supersedes turn 3 where they conflict."*
A file is not a snapshot merely because it is a file. **Read front-to-back it
yields a Devanagari-first inventory that its own newest turn overrides** — the
reader would not be wrong about what the file *says*, only about what it *means*.

**The law was not theoretical for one hour.** `tailwind.config.ts` carried a
header naming *"turn 1 foundation panels"* as its source, and had been shipping
turn 1's type scale ever since — see §3.

## 2 · THE CONVERGENCE — canon and campaign, arrived at separately

Every route the canon cuts is one this campaign already condemned on its own
measured evidence: muhurat's fabricated calendar (**F-J4-1**), the dead
dashboard links (**F-J4-15**), the tracking screen's dead controls. The canon
reached those verdicts from the design side while the walks reached them from
the measurement side, and **neither consulted the other.**

Stated with its limit: the canon's *"zero-inbound-links bug fixed by routing"*
concerns the **confirmed screen**, not **F-J7-3**'s checkout route. Same class,
different defect. **The canon does not fix F-J7-3** — but its routing rule
assumes the very route graph F-J7-3 reports missing.

## 3 · 🔴 THE CONTRAST CLAIM — VERIFIED, THEN MY OWN FINDING WITHDRAWN

The canon asserts *"Contrast floor 4.5:1 already enforced (#6B5B48 on cream)."*
I verified rather than accepted it. **The claim holds** — `#6B5B48` on `#FBF6EE`
computes to **6.07:1**, exactly as stated, and every text pair passes.

**And the one breach I reported does not exist.** I reported *"Delhi-NCR pilot"*
at `#C9B79C` as **1.82:1**. That number came from pairing the colour with a
**cream** background. Its direct parent is
`<div style="… background:#241A12;">` — the dark brand strip. **The true ratio is
8.72:1.** The remaining two candidates fall the same way: `#B9A88F` carries the
map diagram's `→` connectors (documentation chrome, not app UI) and a `person`
glyph inside a 42px avatar tile — a **placeholder graphic**, not text.

> **A COLOUR PAIR MEANS NOTHING WITHOUT THE BACKGROUND IT ACTUALLY SITS ON.**

**This is instrument-lies-first member four, repeated by its own author.** Member
four was `bgOf(el.parentElement)` reading white-on-orange as white-on-white — a
background-attribution error. I committed the same error in a new form: a
palette cross-product that assumed a background instead of reading one.
Catalogued mistakes are not immunity.

**Consequence for the ruling: C3's fix is NOT APPLIED.** Isj ruled *"'Delhi-NCR
pilot' gets a darker shade in the same family."* The premise is false, so
applying it would darken a passing label on my bad arithmetic. **Reported, not
performed** — the ruling is returned with its evidence rather than executed.

*(A second-order caution recorded with it: my corrected sweep — nearest-preceding
`background:` as the enclosing surface — is itself crude, and produced obvious
nonsense like `#241A12 on #241A12`. I did **not** publish a new failure list from
it. The three verdicts above rest on **direct parent reads**, not the heuristic.)*

## 4 · C5 RULED IN AND BUILT — the canon is silent on error

Isj: *per-surface error states are ADDED — loading/empty/error on every fetching
surface, in the canon's visual language. **This is extension, not violation — the
canon is silent on error, and silence is not a design.***

`components/design-system/SurfaceState.tsx`. **ERROR ≠ EMPTY is enforced by the
TYPE, not by discipline:**

- `kind="error"` **requires** `onRetry` — a failure the customer cannot retry is
  a dead end, and every one of the five ERROR≠EMPTY findings began as one.
- `kind="empty"` **forbids** `onRetry` — offering "try again" against a truthful
  nothing is the same lie wearing the other face.

**A wrong call site does not render badly; it does not compile.** The error copy
never says "no ‹subject›" — it says *"We couldn't load ‹subject› — this is our
side, not yours."* `signed-out` is its own kind, because the canon names
*"signed-out ≠ no bookings"* explicitly.

## 5 · BATCH 1 — WHAT THE FOUNDATION ACTUALLY FOUND

### 🔴 THE TOKEN LAYER WAS DEAD CODE
`components/design-system/tokens.css` had carried turn-4 values since the canon
port — and **nothing imported it.** The only reader was an offline render
script. Every `--hpj-*` variable and `.hpj-*` class was inert in the running
app, which rendered entirely off tailwind's turn-1 scale. Now imported in
`app/layout.tsx`, ahead of `globals.css`.

> A stylesheet that is never imported fails the way a missing stylesheet fails —
> **silently, and never as a build error.** Same shape as the postcss config
> comment two files away, which exists because that exact failure already
> happened once.

### THREE TYPE SCALES, NOW ONE
| source | was | now |
|---|---|---|
| `tailwind.config.ts` | turn 1 — display 30 / title 24 / section 20 / body 15 / label 13 / micro 11.5 / money 26, tracking .09em | reads `var(--hpj-t-*)` |
| `tokens.css` | turn 4 — but **never loaded** | **the single source** |
| `globals.css` `.micro-label` | a **third** copy: 11.5px / .09em | reads the same vars |

Which size a component got depended on whether it reached for a tailwind class
or a `.hpj-*` class. **The C1 ruling is now one edit in one file.**

### DRIFTED HEXES CORRECTED
`tokens.css` named turn 4 as its source while carrying **`#1e7a46`, `#b23a1a`,
`#e4f3e9`, `#f5eee2` — none of which occur anywhere in turn 4.** Corrected to
the canon's `#2E6B4E`, `#B0432E`, `#E7F0EA`. Added, with their canon use counts:
`#FFF7EC` warm tint (×10), `#2A2018` video well (×2), `#DBC3A4` control rule
(×9), `#E0B9AE` destructive rule, `#F6EDE0` tint (×19 — replacing turn-1's
`#F2EBDD`, which the canon never uses).

### THE TWO GATED TOKENS — shipped honestly, not silently
**C1** ships at the canon's values (what `tokens.css` already held). **C2** ships
at the **floor**, 52px — flipping *down* to the canon's 46px before the ruling
would be a regression applied on my own authority. Both carry the canon
alternative beside them so the ruling is a one-line diff. Every tailwind entry
also carries the canon value as a **CSS fallback**, so a token-load failure
degrades to the right size instead of to none.

### PROVEN IN THE RUNNING APP — not asserted
`--hpj-t-body: 14.5px` · `--hpj-tap: 52px` · `--hpj-verified: #2e6b4e` ·
`--hpj-destructive: #b0432e` all resolve; `text-body` → **14.5px**, `text-money`
→ **24px**, `text-terracotta` → **rgb(176,67,46)**, `min-h-cta` → **52px**.
Compiled CSS carries `#FFF7EC`, `#2A2018`, `#F6EDE0`; turn-1's `#F2EBDD` is
**gone**; the only surviving `.09em` in 248 KB of CSS is **inside my own comment
describing the old value**.

**Two instrument errors caught during that verification, both mine.** Injecting
classes with JS to test a **JIT** framework measures nothing — unscanned classes
are never generated, so `bg-cream-warm` read as "broken" when it was merely
never compiled *for my probe*. And a `\.micro-label\{` regex found nothing
because **dev CSS is unminified**. Both were settled by reading the generated
stylesheet directly. *(And the surviving `.09em` being my own comment is the
compiled-output lesson again: **grep over built output cannot tell code from
commentary.**)*

---

## 6 · THE THREE GATES — Track 1 batches 2+ wait here

| gate | assistant's recommendation, on record |
|---|---|
| **C1 · body type** | Canon's scale wins for body — the customer is not the elderly-pandit persona the 18px floor was written for — **EXCEPT money and commitments never render below 14.5px**: Micro 11 and Label 12.5 may carry no price, fee, or promise. |
| **C2 · tap targets** | **52px wins.** It is a finger question, not a reader question, and the two floors are independent. |
| **Card direction** | **Isj's taste, entirely.** One-liners below; all three rendered from the canon at 360 and committed to `docs/review/canon-cards/`. |

**The three directions, one line each:**
- **4a · The Evidence** — video first, full-bleed player above the name: *hear him
  before you read about him.*
- **4b · The Dossier** — a screenshot-shaped record with the brand strip inside
  the crop and attested rows: *his mother reads it without ever opening the app.*
  *(The canon's own note recommends this one.)*
- **4c · The Introduction** — his quoted sentence leads, video and facts follow:
  the quietest card, and the only one whose first voice is **his**.

**Nothing downstream of the card can be built until one is chosen** — results,
profile and the whole trust surface compose it.

---

**BATCH 1 DONE. BATCHES 2+ HELD** on the three gates above. Track 2A (vocabulary
bridge) runs in parallel and touches no pixels.

---

# 📕 THREE ENTRIES — Batch 1's yield, recorded

## 1 · THE STREAM BOUNDARY REACHED INTO THE REPO

The law was written for a design file. **It landed on the codebase within the
hour.** `tailwind.config.ts` carried a header naming *"turn 1 foundation panels"*
as its source — a repo file citing a **superseded generation** of the canon, and
shipping its type scale ever since.

**Three type scales existed at once:**

| source | held | reached the screen? |
|---|---|---|
| `tailwind.config.ts` | **turn 1** — display 30 / body 15 / micro 11.5, tracking .09em | yes — this is what rendered |
| `tokens.css` | **turn 4** — the canon | **no. Nothing imported it.** |
| `globals.css .micro-label` | a **third** copy, 11.5px/.09em | yes |

Which size a component got depended on whether it reached for a tailwind class
or a `.hpj-*` class. **The canon port had been written and never wired**: the
only reader of `tokens.css` was an offline render script.

> **A STYLESHEET THAT IS NEVER IMPORTED FAILS EXACTLY AS A MISSING ONE DOES —
> silently, and never as a build error.** The postcss config two files away
> carries a comment explaining that same failure mode, because it had already
> happened once with the tailwind content globs. **The repo warned itself, in
> writing, and the warning did not generalise.**

Now one source: `tokens.css` imported in `app/layout.tsx`, with tailwind and
`globals.css` both reading its variables — so **C1 and C2 are each a one-line
switch in one file.** Drifted hexes corrected: the file *claimed* turn 4 while
carrying `#1e7a46`, `#b23a1a`, `#e4f3e9`, `#f5eee2` — **none of which occur
anywhere in turn 4.** A citation is not a provenance.

## 2 · C3 WITHDRAWN — bgOf's class in a new coat

I reported *"Delhi-NCR pilot"* at `#C9B79C` as **1.82:1**. Its direct parent is
`background:#241A12`. **The true ratio is 8.72:1.** The number came from pairing
every text colour with a *cream* background instead of reading the one each
actually sits on.

> **A COLOUR PAIR MEANS NOTHING WITHOUT THE BACKGROUND IT ACTUALLY SITS ON.**

**This is instrument-lies-first member four wearing a new coat.** Member four was
`bgOf(el.parentElement)` reading white-on-orange as white-on-white — a
background-attribution error that cost 14 false positives. I committed the same
error again, in a different instrument, **having catalogued it myself.** A named
mistake is not an inoculation against it.

**And the ruled fix was returned, not applied.** Isj ruled the label into a
darker shade; the premise is false, so executing it would have darkened a
passing label on my own bad arithmetic — **the fix inventing the defect it
claims to repair.** Reported with the evidence instead.

*(Recorded with its own limit: my corrected sweep — nearest preceding
`background:` — is crude and emitted nonsense like `#241A12 on #241A12`. **I
published no new failure list from it.** All three verdicts rest on direct
parent reads.)*

## 3 · SURFACE STATE — the structural end of a five-times-deleted conflation

**ERROR ≠ EMPTY was deleted from production five times** — muhurat, availability,
pandit list, travel, samagri. Each time by hand, each time on a different
surface, each time after it had already shipped.

`SurfaceState.tsx` ends it **by construction rather than by vigilance**:

- `kind="error"` **requires** `onRetry` — a failure with no way back is a dead
  end, and every one of the five began as one.
- `kind="empty"` **forbids** `onRetry` — offering "try again" against a truthful
  nothing is the same lie with the other face.

> **A LAW ENFORCED BY THE TYPE IS NOT ENFORCED BY WHOEVER REMEMBERS IT.** A wrong
> call site does not render badly — **it does not compile.** The five deletions
> were all caught by a reader; the sixth cannot be written.

The error copy never says *"no ‹subject›"*; it says *"We couldn't load ‹subject›
— this is our side, not yours."* `signed-out` is its own kind, because the canon
names *"signed-out ≠ no bookings"* explicitly.

---

# 🔨 TRACK 2A / OPTION A — BUILT

## 🔴 THERE WERE THREE VOCABULARIES, NOT TWO

Writing the canonical list surfaced a **third** convention nobody had named.
`packages/types/src/index.ts:85` already exported a `PujaType` union — in
**lowercase_snake** (`satyanarayan`, `griha_pravesh`, `namkaran`), carrying
values the pandit app has never had (`annaprashan`, `katha`, `ganesh_puja`) and
one spelled differently from the stored value (`namkaran` vs `NAAMKARAN`).

| convention | where | reality |
|---|---|---|
| `SCREAMING_SNAKE` | `specializations`, `DakshinaRate`, `strings.ts` | **what is actually stored** |
| Title-Case | `PujaService.pujaType`'s own schema comment | what the reader claimed to expect |
| `lowercase_snake` | `packages/types` `PujaType` | **what the type layer declared** |

It types interfaces, nothing writes through it, so the database never saw those
strings.

> **THE TYPE LAYER WAS NOT MERELY ABSENT — IT DISAGREED WITH THE DATA IT
> DESCRIBED.** A union that no writer passes through is not a constraint; it is
> a second opinion with a compiler's authority.

**The new list is named `CanonicalPujaType`, NOT `PujaType`.** Silently
redefining a name other modules already import would have been the same mistake
in a new place — and the legacy union stays until its consumers are migrated
deliberately, because **reader and writer never change together.**
*(TS caught the collision only after the stale `dist/` was rebuilt: the first
typecheck failed with "no exported member `isPujaType`" — a build artifact
hiding a source truth, the same shape as `tokens.css` never being imported.)*

## WHAT SHIPPED

| piece | file |
|---|---|
| Canonical vocabulary — 8 keys, Devanagari **and** Roman labels, `CUSTOM_PUJA_REQUEST`, `isPujaType` | `packages/types/src/pujaType.ts` |
| **M1** compound unique + **M2** nullable duration, dedupe **before** the constraint | `packages/db/prisma/migrations/20260802000000_track2a_pujaservice_bridge/` |
| Wizard writes both sides in **ONE transaction** — `PujaService` (`isActive:false`) + `specializations` | `poojaVerification.controller.ts` `savePoojaConfig` |
| **Approval is the publish action** — flips `isActive:true`, transactional | `approvePoojaVerification` |
| Rejection **un-publishes** — symmetry, and un-publishing was impossible before | `rejectPoojaVerification` |
| DakshinaRate **mirror**, price-only, never touches the flag | `auth.controller.ts` `upsertDakshinaRate` |
| Idempotent backfill, dry-run by default, **skips non-canonical values rather than coercing them** | `packages/db/scripts/backfill-pujaservice.mjs` |
| ₹0 kill-list ×4 | `pandit/[id]/page.tsx`, `BookingCTA.tsx` ×2, `ServicesTab.tsx` |

**The publish invariant, and why it is a source guard:**
`pujaServicePublish.test.ts` proves **exactly one** code path may set
`isActive:true`, and that it is admin approval. That property is about *all*
paths — a behavioural test can prove approve() publishes, but never that the
wizard doesn't. **65 guards green, 26 with G2 controls** (was 25); every matcher
proven able to fire on a planted violation and stay quiet on a clean specimen.

**The guard-of-guards refused my first attempt** — I wrote it in vitest style
with hand-rolled controls, and the ratchet rejected it for not using
`proveMatchers`/`proveSaw`/`proveDetects`. **The rule enforced itself on the
person adding to it**, which is what a ratchet is for.

## ₹0 — WHAT THE PAGE SAYS NOW

`lowestPrice` is `number | null`, and **the type carries the distinction** so no
caller can quietly pass `0` again. When null the "Starting from" block is not
rendered at all — it becomes *"Dakshina · Not listed yet"*. Samagri's identical
zero (`ServicesTab.tsx`) reads *"Not priced yet"*.

> **A PRICE IS EITHER KNOWN OR ABSENT; ZERO IS NEITHER.** Zero is a number a
> customer can act on and a pandit can never be paid.

## CONDEMNED QUEUE — MEMBER FOUR, recorded not touched

`apps/web/app/search/page.tsx:3` imports `SearchClient` from
`../../src/app/search/search-client`. **A live customer route stands on the
condemned tree.** So the condemned-tree ruling is not about dead code: deleting
that tree today breaks `/search`. Member four, its own ruling, **not touched in
this build.**

## WHAT IS NOT DONE, AND WHY — three production acts remain

The build is complete, typechecked, built and guarded. **Three acts against the
live database and the live admin are deliberately not mine:**

1. **The migration** — M1/M2 alter the production schema where the real pandits
   and Tanya's row live. Additive and low-risk, but it is a schema change to a
   live database, and the standing discipline is to confirm before an
   irreversible outward act rather than after.
2. **The backfill `--apply`** — it mints `PujaService` rows, one of them against
   **§C row 2**. It logs each creation as it makes it (`§C CREATED …`), and row
   2's ordered law is untouched: **F-J7-2 control → un-verify → delete.**
3. **Admin approval** — step 4 of the five-step chain. **Admin credentials are
   never typed by me**, so this leg was always Isj's.

**Therefore the five-step browser proof cannot complete in one pass, and saying
otherwise would be the claim without the measurement.** Steps 1–3 are walkable
the moment the migration lands; steps 4–5 need his hand on the admin app. The
runway is stated rather than the result assumed.

---

# ⚙️ OPERATIONAL FACTS — the production migration, and what it taught

**`20260802000000_track2a_pujaservice_bridge` IS LIVE ON PRODUCTION (Neon).**
Applied by hand by Isj, cleanly. M1's dedupe-before-constraint ordering held.

## 🔴 STANDING FACT: PUSH-CREATED COLUMNS ARE INVISIBLE TO `migrate deploy`

On the way in, `20260731120000_rejection_author` failed with **P3018 — "column
already exists."** The column was already there because **Render's deploy path
uses `db push`, which creates columns without writing migration history.** So
the schema had the column and `_prisma_migrations` had no record of it; the
next `migrate deploy` tried to add it again and stopped.

Isj resolved it with `migrate resolve --applied`.

> **THE DATABASE AND ITS HISTORY ARE TWO DIFFERENT RECORDS, AND ONLY ONE OF THEM
> IS WRITTEN BY `db push`.** A schema that is *correct* can still be
> *unmigratable*: the wall is not the column, it is the missing row that says
> the column arrived.

**Standing consequence — every future hand-run `migrate deploy` against this
database may hit P3018 for ANY column that shipped via Render.** The cure is per
migration name:

```
.\node_modules\.bin\prisma.cmd migrate resolve --applied <migration_name> --schema packages\db\prisma\schema.prisma
```

This is not a one-off repair; it is the standing shape of the two deploy paths
disagreeing, and it will recur until Render's path writes history too.
*(Which is the same finding the Track 2A sweep reported from the other side:
`PoojaConfig` and `PoojaVerification` have **no migration at all** — they
reached production via `db push`.)*

## FOUNDER-SHELL FACTS — runbook commands use this form from now on

Measured in Isj's own PowerShell window:

| invocation | result |
|---|---|
| `pnpm …` | **failed** |
| `npx.ps1 …` | **failed** |
| `npx.cmd …` | **failed** |
| **`.\node_modules\.bin\prisma.cmd …`** | **works** |

> A runbook command that assumes the assistant's shell is a runbook command the
> founder cannot run. **The working invocation is the direct `.bin` path**, and
> every command handed over from here is written in that form.

## THE BACKFILL COULD NOT BE RUN AT ALL — and it was an import, not a bug

`backfill-pujaservice.mjs` died on **`ERR_MODULE_NOT_FOUND @hmarepanditji/types`**
under plain `node`: pnpm's workspace protocol needs the package manager's
resolver, and the script is run by node directly. **It failed before executing a
single line** — the runbook command was unusable for a reason that had nothing
to do with what it does.

**Fixed by inlining the 8 canonical keys** with a loud source-of-truth header —
and, because **a duplicated constant is only safe while something couples it
back**, `pujaServicePublish.test.ts` now reads the backfill script, parses its
inlined array as text, and fails if it drifts from `PUJA_TYPES` by one entry.
G2 control included: the comparison is proven to fire on a planted dropped key
and stay quiet on an exact match. **65 guards green, 51 G2 demonstrations.**

**RESOLUTION PROVEN, NOT ASSUMED.** Run with `DATABASE_URL` unset, it now
reaches `main()` (line 65) and fails with *"Can't reach database server"* — a
**CONNECTION** failure, not an import one. That is the whole test: the module
loaded and executed.

**One diagnostic learned in the same run:** with the variable unset it fell back
to `localhost:5432`, so a `.env` under `packages/db` supplies a local default.
`dotenv` does not override an already-set variable, so a session-set Neon URL
wins — which gives a clean tell: **if the error names `localhost:5432`, the
session variable is not set in that window.**

---

# 🚶 TRACK 2A — STEPS 1–3 WALKED. ONE STOP, TWO PASSES, ONE ERROR OF MINE.

**Production API verified before the first click:** `/health` →
`commit: 235067a`, uptime 117s — HEAD exactly. **The walk measured the new
code, not a stale deploy.** *(A walk against an undeployed build proves the old
behaviour and reports it as the new one.)*

## §C — TWO ROWS FROM ISJ'S BACKFILL, logged verbatim

| # | row | id / identification | cleanup |
|---|---|---|---|
| 11 | **PujaService** (backfill) | `cmsbgrvpa0001v5ywrihnyhkh` · SATYANARAYAN @ **₹502** · **Tanya** — her own old R1 rate, **NOT walk debris** · `isActive:false` | **DO NOT DELETE — a real pandit's real rate.** Hers to keep |
| 12 | **PujaService** (backfill) | `cmsbgrvyi0003v5ywxc7zjj0k` · SATYANARAYAN @ ₹2,100 · क्यूए-walk पंडित J2 · `isActive:false` | delete with row 2 |

**The SKIPPED table held 13 values, across A FOURTH VOCABULARY.** The probe's
`सत्यनारायण कथा` is **Devanagari** — joining SCREAMING_SNAKE, Title-Case and
lowercase_snake. All 13 stayed silent **by design** (11 seed + 2 probe): the
backfill reports non-canonical values and refuses to coerce them.

> **FOUR CONVENTIONS FOR ONE CONCEPT — AND THE FOURTH IS THE ONE REAL PANDITS
> ACTUALLY TYPE.** Every earlier count felt complete at the moment it was made.

## 🔴 STEP 1 — STOPPED BEFORE SUBMITTING. THE ENUM PICKER DOES NOT EXIST.

My own plan said: *"It already exists and already uses these 8 values … Option A
changes what the submit writes, not what the pandit sees. No new screen, no new
question."*

**That was wrong, and the error was mine.** I read `readiness/page.tsx` — which
*does* carry the 8-key picker — and generalised to the add-pooja wizard without
opening it.

**Measured at the screen and in the source:**

- Wizard step 1 is a **free-text `VoiceField`**, `placeholder="जैसे सत्यनारायण कथा"`
  (`my-poojas/add/page.tsx:322`) — screenshotted at 360×740.
- The submit posts **`poojaType: d.name`** (`:216`, `:231`) — **the typed text
  itself is the type.**
- The wizard contains **zero** references to `specializations`, `SATYANARAYAN`
  or `PUJA_TYPES`.

**Consequence for Option A as built:** `isPujaType("सत्यनारायण कथा")` is `false`,
so the transaction's canonical branch never runs — **no `PujaService`, no
`specializations`.** The bridge fires only from readiness R1's dakshina-rates
path, which already used canonical values. **The wizard — the very screen the
finding was about — still cannot produce a bookable pooja.**

> **THIS IS WHERE THE FOURTH VOCABULARY IS BORN.** The free-text field is its
> source, and the canonical gate is what made it visible: **the gate did not
> fail, it REFUSED — and the refusal is the finding.**

**I did not complete the submit.** It would have minted a `PoojaConfig` and a
`PoojaVerification` carrying a Devanagari `poojaType` **to demonstrate a gate
already proven from source** — ledger debt bought for a known-negative result.
§C gains nothing from step 1.

**The fix changes what the pandit SEES, so it is a ruling and not a patch I
take myself.** Three shapes, costed, none chosen:

| | shape | cost |
|---|---|---|
| **i** | Replace the free-text field with the 8-key picker **+ अन्य** (free text → REQUEST) | the ruled model rendered honestly; one screen changes, and अन्य already has its server home on `PoojaVerification` |
| ii | Keep free text, map on the server (Devanagari → canonical, fuzzy) | **rejected on sight** — silent value-guessing is precisely what this batch exists to stop |
| iii | Keep free text; every wizard pooja is a REQUEST | coherent with the ruling, but the wizard could then **never** produce a bookable pooja — which cannot be the intent |

**Recommendation: (i).** It is what the अन्य→REQUEST ruling already assumes.

## ✅ STEP 2 — HE SEES IT

मेरी पूजाएँ renders **SATYANARAY… · ✓ प्रमाणित · ₹2,100** — screenshotted.

Two observations, neither a blocker: the card prints the **raw stored value**
(truncated `SATYANARAY…`) rather than the Devanagari label the vocabulary now
carries — one `pujaLabel()` call away; and the price reaches the screen through
the client-side `dakshinaRates`-over-`pujaServices` merge, which is the
papering-over the Track 2A report already named.

## ✅ STEP 3 — THE CUSTOMER DOES NOT SEE IT. **NO LEAK. NO P0.**

**THE INVISIBILITY IS THE MEASUREMENT**, and it holds on every surface:

| surface | result |
|---|---|
| public profile `GET /pandits/:id` | **`pujaServices: []`** — the `isActive:false` row is filtered out |
| filtered list `?pujaType=SATYANARAYAN` | **count 0** — excluded entirely |
| unfiltered list | present, **`svcs: []`** — no price leaks |
| `verifiedPoojaTypes` | `[]` |

**Every customer read honours `isActive`.** A row exists in the database, is
priced, and belongs to a VERIFIED pandit — **and no customer surface will show
it until an admin approves.** That is Option A's whole safety property,
**measured rather than asserted.**

### AND THE ₹0 KILL, PROVEN IN THE BROWSER AT 360×740

Same pandit, same production data, customer profile:
`showsZeroPrice: **false**` · `showsStartingFrom: **false**` ·
`showsNotListed: **true**`. The sticky CTA reads **"Dakshina · Not listed yet"**
where it read **"Starting from ₹0"** this morning. Screenshotted.

---

**STOPPED AT STEP 3 as ordered — and step 1 short of its act, which was not the
plan.** Steps 4–5 remain Isj's finger, **but step 1 must be ruled before they
can mean anything**: approving a pooja that has no `PujaService` row flips
nothing, so the five-step chain cannot close through the wizard until the picker
exists.

---

# ✅ TRACK 2A — THE SUBMIT WALK. ONE CLEAN PASS, AND ONE NEW ₹0.

Walked front-to-back through the app's own screens on **production**
(`commit 235067a`), as क्यूए-walk पंडित J2. **Taps were delivered as DOM clicks
— the pane's DPR mapping is unreliable — and that is flagged, not glossed: the
on-screen state is the proof, not the click mechanics.**

## ⚠️ ₹1,100 WOULD HAVE BEEN REFUSED — checked BEFORE walking

`GRIHA_PRAVESH` sits on `DAKSHINA_FLOOR_HALF_DAY = 1101`, so the ordered
₹1,100 is **one rupee under its floor** and `savePoojaConfig` would have
answered `dakshina_below_floor`. Walked at **₹1,101** — the floor exactly.
*(Reading the floor table cost one grep; discovering it at the submit would
have cost the pass.)*

## THE THREE WRITES

| write | evidence |
|---|---|
| **PoojaConfig** | `POST /pandit/pooja-config → 200 {"poojaType":"GRIHA_PRAVESH","teamSize":1,"dakshinaAmount":1101}` — **the canonical value on the wire**, where the free-text field used to put `सत्यनारायण कथा` |
| **specializations** | `["SATYANARAYAN"]` → **`["SATYANARAYAN","GRIHA_PRAVESH"]`** — read back from production |
| **PujaService** | **inferred, not observed — and the reason is the safety property itself** |
| PoojaVerification | `cmsbi2vq30005gm3nbws80fif` · GRIHA_PRAVESH · PENDING |

**On the inference, stated honestly:** `pujaService.upsert` and the
`specializations` push sit inside the **same `if (canonical)` block of the same
`$transaction`**. `specializations` demonstrably changed, so the upsert ran.
I could not *observe* the row because **every read path filters
`isActive:true`** — `/auth/me` included. **Its direct observation is Isj's
approval:** the flip is what makes it appear, which is exactly what steps 4–5
are for.

**And the old row sits beside the new one as the perfect control:**
verifications now read `GRIHA_PRAVESH` (today, through the picker) and
`सत्यनारायण कथा` (the J9 walk, through the free-text field). **The fourth
vocabulary and its cure, in one response.**

## 🔴 NEW FINDING — मेरी पूजाएँ SHOWS ₹0 FOR THE POOJA HE JUST PRICED

Both poojas render, both in Devanagari — **सत्यनारायण कथा ₹2,100 ✓ प्रमाणित**
and **गृह प्रवेश ⏳ सत्यापन बाकी** — so the `pujaLabel()` fix is visible (that
first card read `SATYANARAY…` this morning).

**But गृह प्रवेश prints ₹0, seconds after he set ₹1,101.**

Mechanism: the price now lives in `PujaService`, `/auth/me` filters
`isActive:true`, and the wizard writes no `DakshinaRate`. So the screen finds
no price and renders zero.

> **THE ₹0 CLASS CROSSED THE COUNTER.** We killed it on the customer side this
> morning and Option A re-created it on the PANDIT side the same day — same
> defect, new surface, introduced by the very fix that removed it. **A price is
> either known or absent; zero is neither** — and here the price is *known*,
> merely hidden from its own owner.

**The mechanism is a category error, not a bug in the flow:** `isActive` is a
**customer-visibility** flag, and `/auth/me` is applying it to **the owner's own
data**. A pandit should always see what he priced.

Fix shapes for Isj — **NOT built**:
| | shape | note |
|---|---|---|
| **i** | `/auth/me` returns the pandit's own `pujaServices` **unfiltered** | **recommended** — isActive gates customers, never the owner; one projection changes |
| ii | the wizard also writes `DakshinaRate` | restores the mirror, but keeps two price tables in play — against the collapse direction |
| iii | render "सत्यापन के बाद" instead of a number | honest, but hides a figure he typed |

## ✅ THE CUSTOMER STAYS BLIND — measured on production

| surface | result |
|---|---|
| public profile `pujaServices` | **`[]`** — no price, no bookable service |
| list `?pujaType=GRIHA_PRAVESH` | **count 0** — excluded |
| `verifiedPoojaTypes` | `[]` |
| Satyanarayan | **unchanged** — still no service row, still the ceremony-base path |

**One nuance worth naming: `specializations` now shows `GRIHA_PRAVESH` to the
customer.** The chip crossed; the service did not. `specializations` has no
`isActive` concept, so the profile says he *does* Griha Pravesh while nothing
about it can be filtered, priced or booked. Under the canon's **"nothing
renders that cannot act"**, that chip is a claim ahead of its capability —
**it resolves the moment Isj approves**, but before approval it is a
"coming soon" the canon does not sanction. Flagged, not fixed.

## §C — ROWS 13–16, logged at the moment of the act

| # | row | identification | cleanup |
|---|---|---|---|
| 13 | **PoojaVerification** | `cmsbi2vq30005gm3nbws80fif` · GRIHA_PRAVESH · **PENDING** | delete with row 2 |
| 14 | **PoojaConfig** | GRIHA_PRAVESH · ₹1,101 · team 1 · PANDIT_BRINGS (id not surfaced by the read endpoint) | delete with row 2 |
| 15 | **PujaService** | GRIHA_PRAVESH · ₹1,101 · **`isActive:false`** (id invisible until approval — see above) | delete with row 2 |
| 16 | **PanditProfile.specializations** | row 2 gained `GRIHA_PRAVESH` | clear with row 2 |

**SamagriPackage: nothing stored** — `saved:0, cleared:1`, and the done card
said so out loud (*"सामग्री की सूची अभी सहेजी नहीं गई"*). The truthful-state
line held: the ✓ card did not imply what never landed.

## THE QUEUE EXPECTATION — for Isj's approve

**Ceremony videos / pooja-verification queue should show TWO PENDING rows for
क्यूए-walk पंडित J2:**

1. **`cmsbi2vq30005gm3nbws80fif` · `GRIHA_PRAVESH`** — today's, through the
   picker. **This is the one to approve.**
2. `cmsaftb9p0003ei3n2cpf021d` · `सत्यनारायण कथा` — the J9 free-text row,
   **left alone deliberately**: it is the fourth-vocabulary specimen and
   approving it flips nothing, because no `PujaService` carries that value.

**What approving #1 will do, precisely:**
- `PoojaVerification` → `APPROVED` (reviewer + timestamp)
- **`PujaService(GRIHA_PRAVESH)` → `isActive: true`** — the publish action
- customer profile gains `pujaServices: [{ GRIHA_PRAVESH, 1101 }]`
- `?pujaType=GRIHA_PRAVESH` starts returning him — **count 0 → 1**
- his public profile stops saying "Not listed yet" and quotes **₹1,101**
- and `verifiedPoojaTypes` gains `GRIHA_PRAVESH`

**That single click is steps 4–5 AND the platform's first honest pooja-queue
approval.** Approving #2 is the control that should visibly do nothing.

---

# ✅ THE ₹0 THAT CROSSED THE COUNTER — FIXED, DEPLOYED, PROVEN. AND A SECOND PUBLISH DOOR FOUND SHUT.

## THE CLASS, RECORDED

> **HIDING THE OWNER'S OWN TRUTH IS THE MIRROR OF FABRICATING IT.**
> Fabrication shows a number nobody set; this showed nobody a number that WAS
> set. Both put the screen at odds with the database — from opposite sides.

`isActive` is a **customer-visibility** flag. Both owner reads — `/auth/me`
(`auth.controller.ts`) and `/pandits/me` (`pandit.routes.ts`) — were filtering
the pandit's own `pujaServices` through it, so a pandit who priced गृह प्रवेश at
₹1,101 read **₹0 on his own screen seconds later.** Both now return the owner's
rows unfiltered, with `isActive` carried as a field.

**मेरी पूजाएँ renders his truth plus its visibility state:** the price he set,
and a chip from `isActive` — **यजमानों को दिख रही है / प्रतीक्षा में — अभी
यजमानों को नहीं दिखती.** The chip line and the verification line diverge exactly
where it matters: the सत्यनारायण कथा card reads ✓ प्रमाणित (the legacy fallback)
**and** प्रतीक्षा में — the verification story and the visibility truth,
side by side, disagreeing honestly. **The ₹0 render path is dead:**
`rates[pooja] ?? 0` is now his number or **दक्षिणा तय नहीं** — never zero.

## 🔴 FOUND WHILE FIXING — THE SECOND PUBLISH DOOR

`POST /pandits/me/services` — **dead from every app but MOUNTED** — let any
authenticated pandit self-publish by curl: its `update` wrote `isActive:true`
outright, and its `create` omitted the field, **which the Prisma
`@default(true)` published silently.** The ruled invariant — *the flip is the
ONLY path to true* — was breachable from a terminal the whole time.

Closed under that standing ruling: the update no longer touches the flag; the
create sets `isActive:false` explicitly. **Residual for the quiet-fixes batch:**
the column default itself is `true`, so any *future* writer that forgets the
field publishes by default — the guard now pins every known writer, but a
default that disagrees with the law is a trap left armed.

## GUARD EXTENDED — and it caught its own instrument again

`pujaServicePublish.test.ts` now scans **all three** writer files (publishing
count = exactly 1, the approval), pins the mounted-dead endpoint's clauses, and
carries the owner-read law as its own matcher — `pujaServices:{where:}` may not
appear in either owner-read file — G2-proven against the original defect line.
**One catch inside the guard itself:** a 420-char `update` block swallowed the
START of the next `create` call, so `includes(".create(")` tagged one block as
both and judged the update's tail by the create's rule. Blocks are now
classified by their own opening call. **65 guards green, 53 G2 demonstrations.**

## DEPLOYED AND PROVEN — production, browser, 360×740

Sequencing stated, not glossed: the order said verify-then-deploy, but the fix
is **server-side** and the only API holding the walk's rows is production — so
the deploy necessarily came first (`eb2c7d8` confirmed at `/health`, attempt 9).

**The PujaService row that was "inferred, not observed" is now DIRECTLY
OBSERVED:** `/auth/me` returns `GRIHA_PRAVESH @ ₹1,101, isActive:false` — the
inference confirmed to the rupee, by the fix itself.

**The screen, screenshotted:**

| card | shows |
|---|---|
| सत्यनारायण कथा | ✓ प्रमाणित · **प्रतीक्षा में — अभी यजमानों को नहीं दिखती** · **₹2,100** |
| गृह प्रवेश | ⏳ सत्यापन बाकी · **प्रतीक्षा में — अभी यजमानों को नहीं दिखती** · **₹1,101** |

**No ₹0 anywhere on the page.** *(Two harness notes: the page first hung on the
route loader with its own API calls returning 200 — stale `.next` webpack
runtime again, cured by the ledger's own recipe, clean + restart. And the
specializations-chip nuance stands flagged-not-fixed: the chip crossing while
nothing prices it is a claim ahead of capability; it self-resolves on approval,
and the vocabulary-bridge batch owns its permanent shape.)*

**§C unchanged** — this turn minted nothing.

---

# 🎯 THE APPROVE RUNWAY — Isj's finger, steps 4–5

**In the admin app's pooja-verification queue, two PENDING rows for
क्यूए-walk पंडित J2 (+919000000903):**

## 1 · APPROVE: `cmsbi2vq30005gm3nbws80fif` · **GRIHA_PRAVESH**
One click. It flips, atomically:
- `PoojaVerification` → APPROVED (your id + timestamp)
- **`PujaService(GRIHA_PRAVESH, ₹1,101)` → `isActive: true`** — the publish
- his मेरी पूजाएँ chip: प्रतीक्षा में → **यजमानों को दिख रही है**
- customer profile gains `pujaServices: [{GRIHA_PRAVESH, 1101}]` — "Not listed
  yet" becomes **₹1,101**
- `?pujaType=GRIHA_PRAVESH` goes **0 → 1**
- `verifiedPoojaTypes` gains GRIHA_PRAVESH

**This is steps 4–5 and the platform's first honest pooja-queue approval in one
click.**

## 2 · LEAVE ALONE: `cmsaftb9p0003ei3n2cpf021d` · `सत्यनारायण कथा`
The fourth-vocabulary specimen (J9, free-text era). **Approving it should
visibly do nothing** — no `PujaService` carries that Devanagari value, so the
flip has nothing to flip. It is the control; touch it only if you want to watch
the null result.

**After your click, say the word and I measure the AFTER on every surface.**

---

# 🔴 P0 ON THE OPS SURFACE — DIAGNOSED, FIXED, PROVEN. THE DATA WAS NEVER MISSING.

Isj opened Ceremony videos to perform the ruled approve; the tab said
**"No videos waiting"** with a literal **`[object Object]`** above it, while two
PENDING rows sat in production.

## THE MECHANISM — three layers, each measured

**1 · The trigger: the admin JWT lives 12 hours.** `adminLogin` signs with
`expiresIn: "12h"` (`auth.controller.ts:406`). Isj's session from yesterday's
identity approvals had expired, so `GET /admin/pooja-verifications?status=PENDING`
answered **401**. Probed unauthenticated, verbatim:

```
{"success":false,"message":"Missing or invalid Authorization header","error":{"code":"UNAUTHORIZED"}}
```

**2 · The `[object Object]`: the component was written against an envelope this
API never sends.** `PoojaQueue.load()` threw
`new Error(json?.error?.message || json?.error || …)` — but the envelope puts the
human message at the **top level** and `error` is an **object without
`.message`**. So `json.error.message` is undefined, the fallback lands on the
object, and `new Error(object)` stringifies to `[object Object]`. **Every
possible API failure rendered that way — the tab has never displayed a real
error.** The identity queue one tab over reads `error?.message || message`
correctly (`verifications/page.tsx:133`); the pooja tab alone had the wrong shape.

**3 · The empty state: error and empty co-rendered.** On failure the component
set `rows=[]` and drew the error banner **above** the "No videos waiting" card —
so a dead queue and an empty queue looked identical below the fold.
**ERROR-SWALLOWED-AS-EMPTY, on the approval path** — ERROR ≠ EMPTY's sixth
production sighting, and the first on an OPS surface, where the omission
silently parks a ruled action.

**Q3 answered: today's commits did NOT touch this read path.** `git log/diff`
on `listPoojaVerifications`: last touched at `17532bf` (the queue's birth);
today's commits (`eb2c7d8`, `01363fd`) changed approve/reject write
transactions and owner reads only. **The list endpoint, its WHERE, and its
status vocabulary are exactly as shipped.** The rows are fine — the pandit-side
read returned both PENDING rows this morning.

## THE FIX — UI-only, report-first honoured

1. **Envelope parsed correctly**, in the priority the API actually uses:
   `error?.message || message || string-error || HTTP status`. A 401
   specifically renders **"Your session has expired — log in again to see the
   queue."** — the actionable truth instead of the stringified object.
2. **AN ERRORED QUEUE MUST NEVER LOOK EMPTY.** Error is now its own render
   branch — banner + **Try again** — and "No videos waiting" can render only
   when the server actually said so.

**No server file changed. No money or identity semantics touched.**

## PROVEN IN THE BROWSER — against production's own 401

Local admin (:3003) with a deliberately **invalid** token planted (a probe
string, not a credential — it exercises exactly the expired-token path), walk
proxy passing through to production:

| check | result |
|---|---|
| `[object Object]` | **gone** |
| "No videos waiting" during error | **gone** |
| banner text | **"Your session has expired — log in again to see the queue."** |
| Try again | present, and re-fires the load |

Screenshotted. *(A first probe without the proxy showed "Failed to fetch" — the
fetch-throw path — which proved the exclusive-error render independently; the
proxy pass proved the 401 envelope branch. Both branches of the catch are
measured.)* Planted token removed after the proof.

## FLAGGED, NOT FIXED — the 12-hour rhythm

The trigger will recur: **every admin session dies at 12h with no refresh and
no redirect-to-login**, and every admin page ad-hocs its own 401 handling. The
sibling tabs (identity queue's "Failed to load verifications", dashboards)
still render their own generic strings on the same expiry. A shared
401→re-login interceptor is the permanent shape — **ops-surface batch work, not
a P0 line-fix; flagged for Isj's queue.**

**§C unchanged — nothing minted.**

---

## THE APPROVE, RE-PARKED ON A CLEAN RUNWAY

After Vercel deploys the admin fix: **log in again** (the 12h expiry is the
whole story), open Ceremony videos, and the two rows will render honestly:

1. **APPROVE `cmsbi2vq30005gm3nbws80fif` · GRIHA_PRAVESH** — flips the
   verification APPROVED + `PujaService(₹1,101)` → `isActive:true`; his chip
   turns **यजमानों को दिख रही है**; customer profile quotes ₹1,101; filtered
   search 0 → 1. *(One known seam on this row, stated before the click: it was
   submitted via the WhatsApp path, so the card shows "no playable video" and
   the publish button is disabled with its printed reason — the video arrives
   on WhatsApp per the marker. Judge it there; the approve is still one click
   once you choose to.)*
2. **LEAVE `cmsaftb9p0003ei3n2cpf021d` · सत्यनारायण कथा** — the
   fourth-vocabulary control; approving it visibly does nothing.

**The climax happens over an honest surface or not at all — the surface is now
honest.**

---

# 🔎 "STILL EMPTY" RE-DIAGNOSED — every layer measured healthy; the remaining variable is the tab itself

**1 · THE FIX IS DEPLOYED.** The live Vercel chunk
(`app/verifications/page-35d8349ab8c491e5.js`, fetched from production) contains
"session has expired", "Try again", and the new HTTP-status fallback. The fixed
bundle is what a FRESH page load serves.

**2 · THE API IS UNCHANGED AND HEALTHY.** Invalid-token probe, now:
`{"success":false,"message":"Invalid token","error":{"code":"UNAUTHORIZED"}}` ·
HTTP 401. Same envelope as this morning, no 5xx.

**3 · BOTH ROWS STILL EXIST — measured seconds ago** via the pandit-side read:
`cmsbi2vq30005gm3nbws80fif · GRIHA_PRAVESH · PENDING` and
`cmsaftb9p0003ei3n2cpf021d · सत्यनारायण कथा · PENDING`. No vanished-rows P0.

**4 · NO STORAGE-KEY MISMATCH — checked in code, not guessed.**
`login/page.tsx:35` writes and `PoojaQueue.tsx:54` reads the SAME constant,
`ADMIN_TOKEN_KEY = 'hpj_admin_token'` (`packages/utils/src/token-constants.ts:20`).
A fresh login is readable by the queue.

**MECHANISM OF "STILL EMPTY":** with server, data, bundle and key all measured
healthy, what remains is the CLIENT'S OWN STATE — an SPA tab opened before the
deploy keeps running the old chunks until a hard reload, and the old chunk is
exactly the [object Object]-over-empty renderer. The screen tells the two states
apart unambiguously:

| what Isj sees | meaning | cure |
|---|---|---|
| `[object Object]` above "No videos waiting" | **old bundle still running in the tab** | hard refresh (Ctrl+Shift+R) |
| red banner "Your session has expired — log in again…" + Try again, NO empty card | new bundle, expired token | log in again |
| two cards (गृह प्रवेश as a WhatsApp row — no inline player, by design) | the honest queue | approve per the runway |
| "No videos waiting" with NO banner, after fresh login + hard refresh | would be a TRUE empty-over-data — nothing measured supports it | capture the list call's network response; that body decides |

**§C unchanged. No code changed this turn — there was nothing left to fix.**

---

# ⏳ THE HANGING DASHBOARD — a THIRD mechanism, not the third sighting

**The dashboard does NOT share the ceremony tab's defect.** Read at
`apps/admin/src/app/page.tsx:27-49`: on a 401 it takes
`data.error?.message || "Failed to load dashboard statistics"` — the fallback is
a STRING, so no `[object Object]` — and `finally { setLoading(false) }` always
terminates the spinner into a red banner. **A 401 cannot hang this screen.**

**"Loading dashboard stats..." persisting therefore means the fetch has not
RETURNED — a request still in flight, not an error swallowed.** That is the
Render cold-start shape (the pandit login even carries a waking-UX for it).
Probed during the hang: `/admin/dashboard-stats` answered the invalid-token 401
in under 2s — **the API is awake NOW**, so a refresh resolves it.

**The hang is COSMETIC for the approve.** The stats feed only the dashboard
cards; Verifications → Ceremony videos is a different page and endpoint.

Flag, not fix: the dashboard's 401 copy is the generic string, not "log in
again" — same *family* as the ceremony tab (unactionable copy), but it
terminates honestly. Joins the shared-401-interceptor ops-batch item.

---

# 🔴 THE WHATSAPP DEAD END — diagnosed to layer 3, fixed at the card

## THE THREE CANDIDATES, ANSWERED FROM PRODUCTION DATA

**1 · WAS THE MARKER WRITTEN? YES — the writer is innocent.** Both rows read
from production seconds ago carry it verbatim:

```
cmsbi2vq30005gm3nbws80fif GRIHA_PRAVESH  videoProvider:"UPLOAD"
  videoUrl:"https://wa.me/918934095599"  videoId:null
  desc: "…[वीडियो व्हाट्सएप पर भेजा गया]"
cmsaftb9p0003ei3n2cpf021d सत्यनारायण कथा  — IDENTICAL SHAPE
```

**2 · IS IT READ? The projection carries it; THE CARD HAD NO BRANCH FOR IT.**
`listPoojaVerifications` returns whole rows, so `videoUrl` reached the client
intact. The card computed `canPlay = provider === "YOUTUBE" && videoId` and had
exactly **two** branches — player, or the generic dead-end — with publish gated
on `!canPlay`. **A ruled, mandatory submission route had no representation on
the screen that judges it**, so the marker fell straight through to
"no playable video (UPLOAD)" with publish disabled.

> **THE "(UPLOAD)" LITERAL WAS THE TELL, EXACTLY AS SUSPECTED: a default
> rendered as truth.** The row's real identity — *this video is on WhatsApp* —
> was present in the payload and unrepresented in the UI. A missing branch is
> not a missing value.

**3 · THE RULED SHAPE, BUILT.** `isWhatsApp` keys off the **structural**
`wa.me/` prefix on `videoUrl` (not the copy, not the provider default). The
card now renders an emerald panel — *"यह वीडियो WhatsApp पर भेजा गया है — वहाँ
देखकर यहीं फ़ैसला कीजिए।"* with a **WhatsApp खोलिए** link to the marker — and
`canPublish = canPlay || isWhatsApp`, so **PUBLISH IS ENABLED**. "Ask for a new
video" stays alongside. **The fix lights BOTH rows** — they are the same shape.

**Layer named: the CARD.** No writer change, no projection change, no server
change. Money and identity semantics untouched.

## PROOF BOUNDARY — stated, not dressed up

Admin typecheck passes. **The local visual proof did not complete**: the admin
dev app would not hydrate against the harness (tab clicks produced no state
change, the identity queue hung at "Loading queue…"), and I stopped rather than
keep spending on plumbing. **The card fix is verified by typecheck and by the
production row shapes it branches on — NOT by a local screenshot.** Isj's
deployed screen is the proof, and its tell is unambiguous:

| gate | what it looks like |
|---|---|
| **fixed** | green panel *"यह वीडियो WhatsApp पर भेजा गया है…"* + **WhatsApp खोलिए**, and **"Watched — publish it" is BLACK/clickable** |
| still stale bundle | grey box *"no playable video (UPLOAD)"*, publish greyed out → hard refresh |

*(A credential note: I cannot hold an admin token, so no local run could ever
have used the real authenticated path — the mock served the REAL production
rows without auth. That boundary is why his screen is the last word here.)*

**§C unchanged.**

---

# 🏁 THE CHAIN CLOSED — the first honest pooja-queue approval, measured on every surface

**Isj clicked publish on `cmsbi2vq30005gm3nbws80fif` · GRIHA_PRAVESH.**
Third finger-testimony of the day. Every promise the runway made, scored.

## 1 · THE VERIFICATION ROW — held

```
cmsbi2vq30005gm3nbws80fif GRIHA_PRAVESH  status:"APPROVED"
  reviewedById:"admin"  reviewedAt:"2026-08-02T09:27:20.222Z"  version:1
```

## 2 · THE FLIP — held. **The row's whole biography, in one day:**

```
cmsbi2vko0003gm3nbk5n05tj  GRIHA_PRAVESH  ₹1,101  isActive:TRUE
```

**INFERRED** at the submit walk (invisible behind every read's `isActive` filter,
argued only from transaction atomicity) → **OBSERVED** at the owner-truth fix
(`isActive:false`, the inference confirmed to the rupee) → **PUBLISHED** now.
A claim, then a sighting, then a fact — and the campaign never once let the
middle stand in for the last.

## 3 · THE PANDIT'S OWN SCREEN — held at the API

`/auth/me` (unfiltered owner read, shipped hours ago) returns
`GRIHA_PRAVESH ₹1,101 isActive:true` beside `SATYANARAYAN ₹2,100 isActive:false`
— so मेरी पूजाएँ now renders **यजमानों को दिख रही है** on the first and
**प्रतीक्षा में** on the second, from one field. *No fresh screenshot: the local
pandit harness was torn down and the ₹0-fix screenshot already proved this
component reads `isActive` per row. The API state is quoted instead of a picture
claimed.*

## 4 · THE CUSTOMER SURFACES — **0 → 1, all three held**

| promise | before | after |
|---|---|---|
| `?pujaType=GRIHA_PRAVESH` | **count 0** | **count 1**, `क्यूए-walk पंडित J2`, `GRIHA_PRAVESH@1101` |
| public profile | `pujaServices: []` → "Not listed yet" | **`[{GRIHA_PRAVESH, 1101}]`** |
| `verifiedPoojaTypes` | `[]` | **`["GRIHA_PRAVESH"]`** |

**Screenshotted on the DEPLOYED customer app at 360×740** (better evidence than
local: this is what a real customer's phone serves): the sticky CTA reads
**"Starting from ₹1,101"** where it read **₹0** this morning and **"Not listed
yet"** this afternoon. **His price, on a stranger's screen, because an admin
watched his video.**

## 5 · THE QUEUE — expectation for Isj's eyes

Ceremony videos should now show **ONE** pending card: `सत्यनारायण कथा`.
गृह प्रवेश has left the queue by leaving PENDING.

## 6 · THE CONTROL STANDS — untouched, verified

```
cmsaftb9p0003ei3n2cpf021d  सत्यनारायण कथा  status:"PENDING"
  reviewedById:null  reviewedAt:null
```

Its `PujaService` sibling (`cmsbgrvyi…`, SATYANARAYAN ₹2,100) remains
`isActive:false`. **The fourth-vocabulary specimen is preserved intact** for its
future null-result demonstration — approving it will flip nothing, because no
`PujaService` carries a Devanagari value.

## 7 · §C — THE APPROVAL EVENT

| # | event | detail |
|---|---|---|
| 13a | **APPROVAL** on row 13 (`cmsbi2vq30005gm3nbws80fif`) | by `admin` at **2026-08-02T09:27:20.222Z**; flipped PoojaVerification → APPROVED **and** PujaService `cmsbi2vko0003gm3nbk5n05tj` → `isActive:true` |

> **THE UN-VERIFY OBLIGATION NOW COVERS THIS APPROVAL.** Row 2's cleanup order
> was *run the F-J7-2 control → un-verify → delete*; it gains a step:
> **un-approve `cmsbi2vq30005gm3nbws80fif` (which un-publishes the service via
> the symmetric reject path) before deleting.** A published test pooja is
> visible to real customers in a filtered search — cleanup is no longer only
> about rows, it is about **withdrawing a public claim.**

## 8 · THE NOTIFICATION — template quoted, delivery NOT observed

**I cannot read Render's console from here**, so the stub's runtime line is
unmeasured. What I can give verbatim is the template that fired
(`poojaVerification.controller.ts`):

```
title:   "पूजा प्रमाणित ✓"
message: आपकी "गृह प्रवेश" पूजा प्रमाणित हो गई है — अब यह बुकिंग के लिए उपलब्ध है।
sms:     HmarePanditJi: आपकी GRIHA_PRAVESH पूजा प्रमाणित हो गई है।
```

**🔴 A NEW MEMBER FOR THE F-J9-3/4/5 PILE, visible in the template itself:**
the in-app `message` interpolates `poojaName` → **"गृह प्रवेश"** (Devanagari,
human), while the `smsMessage` interpolates `poojaType` → **"GRIHA_PRAVESH"**
(the raw enum). **The same pandit gets his pooja named two different ways in two
channels of the same event** — one readable, one a database token. It is
F-J9-3's exact shape (two booking-number vocabularies) reproduced on the puja
vocabulary, and the cure now exists: `pujaLabel()`. **Report-only.**

*(Second, quieter: `message` claims "अब यह बुकिंग के लिए उपलब्ध है" — and today,
for the first time, THAT SENTENCE IS TRUE. It was a fabricated claim until the
publish action shipped this morning.)*

---

## THE FIVE-STEP CHAIN, SCORED

| step | promise | verdict |
|---|---|---|
| 1 · pandit adds pooja | wizard writes the canonical value | ✅ **held** — after the picker was built; the free-text field would have refused |
| 2 · he sees it | मेरी पूजाएँ, both poojas, Devanagari | ✅ **held** — after `pujaLabel()`; and it **surprised** us with ₹0 |
| 3 · customer blind | `isActive:false` = invisible | ✅ **held on every surface, no leak, no P0** |
| 4 · admin approves | one click flips it | ✅ **held** — after three ops defects were cleared out of its way |
| 5 · customer sees HIS price | ₹1,101 on a stranger's phone | ✅ **held — screenshotted on production** |

**WHAT BROKE ALONG THE WAY (all fixed, all today):** the enum picker that my
plan said existed and did not · the ₹0 that crossed the counter to the pandit's
own screen · the ops queue that said "empty" over live data · the WhatsApp card
with no branch and a dead publish button · a mounted-dead endpoint that could
self-publish by curl.

**WHAT SURPRISED:** that **four** vocabularies existed, not two — and that the
fourth is the one real pandits type. That the guard-of-guards would refuse my
own guard. That a grep would match my own comment. That the fix for a fabricated
₹0 would recreate it, mirrored, one surface over.

> **NOT ONE OF THOSE WAS FOUND BY A GREEN RUN. Every one was found by walking
> the thing a pandit walks, and then by a founder's finger stopping on a grey
> button and saying so.**

**THE CAMPAIGN CLOSES FOR TODAY.**
