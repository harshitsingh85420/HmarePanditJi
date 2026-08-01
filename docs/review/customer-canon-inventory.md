# TRACK 1 — CUSTOMER CANON INVENTORY

**Source:** Claude Design project `a708fb60-f45c-4bd1-bd3c-1ac5b3ca2cca` —
`# HmarePanditJi: Pandit Booking App`, type `PROJECT_TYPE_PROJECT`, `canEdit:true`.
Key file: `ग्राहक ऐप · Customer.dc.html` (173,808 chars).
Read via the `DesignSync` MCP on 2026-08-01. **Inventory only — nothing built.**

**Auth: NO GATE.** The claude.ai login already carried design scope; `list_projects`
answered without a prompt. **No credential step was needed and none was performed.**
*(The project does not appear in `list_projects` because that method filters to
design-**system** projects; this is a regular project and was reached by
`get_project` on the id from the URL.)*

---

## 0 · THE FILE HAS FOUR GENERATIONS AND ONLY THE NEWEST IS CANON

The document holds four turns, newest first. **Turn 4's own title says it:**

> *"English-first rebuild — the surviving map, the language system, and the pandit
> card at 360 · **supersedes turn 3 where they conflict**"*

| turn | what it is | status |
|---|---|---|
| **4** | English-first rebuild — surviving map, language system, card at 360 | **CANON** |
| 3 | पुनर्रचना — same map, Devanagari-first | superseded by 4 |
| 2 | Guest mode & structural room | folded into 4 |
| 1 | Foundation + three card directions | palette/spacing survive into 4 |

**Everything below is read from turn 4 only** (file offsets 0–58,859). Reading the
file front-to-back without this boundary yields a Devanagari-first inventory that
turn 4 explicitly overrides — the same *supersession* trap the ledger keeps meeting.

**Turn 4's other sections:** `1 · THE SURVIVING MAP (English-first)` ·
`2 · FOUNDATION DELTAS` · `3 · THE PANDIT CARD, ENGLISH-FIRST, 360`.

---

## 1 · THE ARTBOARD ↔ ROUTE TABLE

Canon: **"13 screens, one tree, zero islands · every screen ≤ 2 taps from the nav ·
nothing renders that cannot act · 183 lying controls → 0."**

| # | canon screen | what it depicts | live route in `apps/web/app` | verdict |
|---|---|---|---|---|
| **I · Discover — no account** ||||
| 1 | **Home** | what this is · your city · why it can be trusted · 8 ceremonies | `/` | route exists, re-skin |
| 2 | **Choose a ceremony** | by name (Griha Pravesh…) **and by situation** ("we moved into a new flat") | — folded into `/booking/new` step 0 | **no dedicated route** |
| 3 | **Ceremony guide ★** | how long · how many sit · what to keep ready · who brings supplies · flat/havan notes | — | **UNBUILT** |
| **II · Plan — still no account** ||||
| 4 | **Date & place** | plain calendar · flat, building, society · optional gate/lift note | `/booking/new` (wizard step) | inside wizard |
| 5 | **Pandit results** | the trust surface · card · loading / empty / none-that-date | `/search` | route exists, re-skin |
| 6 | **Pandit profile** | intro · sample videos per ceremony · verification detail · rates · languages | `/pandit/[id]` | route exists, re-skin |
| **III · Book — 2 steps, not 7** ||||
| 7 | **1 · Samagri** | his fixed packages, or "I'll arrange it myself" — **nothing pre-ticked** | `/booking/new` + `SamagriModal` | inside wizard |
| 8 | **2 · Review + pay** | two-zone money · **login gate here**: phone → OTP → your name | `/booking/new` final step | inside wizard |
| 9 | **Payment handoff → gateway** | calm both directions · failed payment returns here **with a way back in** | `/booking/checkout` | exists, **zero inbound links** |
| 10 | **Booking confirmed ★** | the screenshot screen — routed from gateway return, My Bookings, **and detail** | `/booking-confirmed/[bookingId]` | route exists, re-skin |
| **IV · Afterwards** ||||
| 11 | **My Bookings** | upcoming · past · **signed-out ≠ no bookings** (two designed states) | `/dashboard/bookings` | route exists, re-skin |
| 12 | **Booking detail** | what happens · what to keep ready · Pandit ji's name & phone **after confirmation** | `/booking/[id]` + `/dashboard/bookings/[bookingId]` | **two routes, one screen** |
| 13 | **Help** | one tappable phone number + staffed hours · cancellation policy in plain words | — | **UNBUILT** |

**Bottom nav — 3 tabs: Home · My Bookings · Help.** *"Bottom not top — 360-wide
thumbs; three because that is all that truthfully exists."* The live app has
`DashboardNav`, not a 3-tab bottom bar.

---

## 2 · THE GAPS, BOTH WAYS

### 2a · ARTBOARDS WITH NO PAGE — unbuilt, **reported not built**

| canon screen | why it is new |
|---|---|
| **Ceremony guide ★** | starred by the canon. No equivalent exists anywhere — this is the app's answer to *"what actually happens and what do I prepare?"* |
| **Help** | a real phone number + staffed hours + plain-words cancellation. `(legal)/cancellation-policy` exists but is a legal page, not this screen |
| **Choose a ceremony (by situation)** | the *situation* axis ("we moved into a new flat") has no live counterpart |
| **3-tab bottom nav** | a different navigation model from what ships |

### 2b · LIVE PAGES WITH NO ARTBOARD — my-taste territory, **flagged not designed**

**The canon cut these explicitly** ("The cut — and what honestly replaces each"):

| live route | canon's disposition |
|---|---|
| `/muhurat`, `/muhurat-explorer` | *"Muhurat ×2 (fabricated data) → **nothing**. The date picker stays a plain calendar; no invented auspiciousness."* |
| `/dashboard/bookings/[bookingId]/track` | *"Tracking screen (static map, 4 dead controls) → booking detail, day-of… A call is real; the map never was."* |
| `/dashboard/bookings/[bookingId]/review` | *"Reviews · ratings · photo upload → the day-one trust stack: verification, sample video, specificity, admitted absence."* |
| `/dashboard/favorites`, `/dashboard/notifications`, `/dashboard/profile/family` | *"Favourites · notifications · My Family · saved addresses · payment methods · social # · Download App → **nothing**. Orphans and dead routes; **deletion is the feature**."* |

**No artboard, no explicit cut — genuinely undecided (my-taste territory, flagged):**
`/nri` · `/voice-search` · `/stitched` + `/stitched/[slug]` · `/profile` ·
`/dashboard` · `/dashboard/profile` · `/(legal)/about` · `/(legal)/privacy` ·
`/(legal)/terms` · `/(legal)/cancellation-policy` · `/login` ·
`/dashboard/bookings/[bookingId]/cancel`.

Two notes on that list: **`/login` is not an oversight** — the canon deliberately
*moves* the login gate inside Review + pay, so a standalone login screen has no
artboard *by design*. And **`cancel` is a state, not a screen** — canon puts
"cancelled" on the detail screen.

### 🔴 2c · THE CANON AND THE QA CAMPAIGN CONVERGED INDEPENDENTLY

Every cut in 2b names something this ledger already found and filed on its own
evidence — muhurat's fabricated calendar (**F-J4-1**), the dead dashboard links
(**F-J4-15**), the tracking screen's dead controls. The canon reached the same
verdicts from the design side while the walks reached them from the measurement
side.

The sharpest instance: the canon writes **"Zero-inbound-links bug fixed by
routing"** about the confirmed screen — and **F-J7-3** is a zero-inbound-links
finding about `/booking/checkout` from the same family. **They are not the same
defect** (canon's is the confirmed screen; F-J7-3's is the checkout route), and I
am not claiming the canon fixes F-J7-3. But the canon's routing rule — *confirmed
is reachable from gateway return, My Bookings **and** detail* — is the same shape
as the missing resume path, and **the design already assumes the route graph
F-J7-3 says is absent.**

---

## 3 · DESIGN-SYSTEM FACTS — stated from the file

### Language — "the reversal"
> **English-first.** The interface reads in English everywhere a customer must act.
> Ritual vocabulary stays **Sanskrit/Hindi in Roman script** — *Griha Pravesh,
> Dakshina, Samagri, Pandit ji, Yajman* — *"because translating it is demeaning and wrong."*

**Devanagari is a typographic accent only:** ✓ the pandit's name beneath its Roman
form · ✓ the ceremony name on the certificate-like confirmation · ✗ **never
instructions · never buttons · never anything he must act on.**

**Register:** *"A well-mannered person explaining something to a slightly anxious
friend. Never chatty, never corporate, never devotional-purple."*

### Type
- **UI & body** — Hanken Grotesk 400 · 500 · 600 · 700
- **Accent** — Noto Serif Devanagari 500 · 600, *sparingly*
- **Scale** — Display 26 · Title 20 · Section 17 (sans, 600) · **Body 14.5/15.5** ·
  **Label 12.5** · **Micro 11 caps + .08em** · **Money 24, tabular numerals**
- Measured distribution confirms it: 11px ×56, 13px ×23, 12.5px ×20, 13.5px ×17,
  15px ×14 — the mass of the design sits at **11–15px**.

### Palette — exact hexes, by weight in turn 4
| hex | role | uses |
|---|---|---|
| `#241A12` | ink / primary text | 84 |
| `#6B5B48` | secondary text | 99 |
| `#904D00` | brand saffron-brown (links, accents) | 36 |
| `#6E3A00` | link hover / deep brand | 7 |
| `#FBF6EE` | card surface | 34 |
| `#EFE7DA` | page background | 1 |
| `#F6EDE0`, `#F0E7D8`, `#EFE4D4` | cream tiers | 19 / 17 / 3 |
| `#FFF7EC` | warm tint | 10 |
| `#E8DDCB` | **border only** | 45 |
| `#DBC3A4` | **border only** (secondary button) | 9 |
| `#2E6B4E` | green — **identity-verified pill ONLY** | 16 |
| `#E7F0EA` | green tint | 7 |
| `#B0432E` | terracotta — destructive, **outlined never filled** | 9 |
| `#E0B9AE` | destructive border | 1 |
| `#2A2018` | video well | 2 |
| `#B9A88F`, `#C9B79C` | faint tertiary | 6 / 2 |

> **"Green appears nowhere else."** `#2E6B4E` is reserved for *Identity verified*.

### Shape & spacing
- **Radii:** `999px` ×23 (pills) · `9px` ×19 · `12px` ×18 · `14px` ×12 · `11px` ×11
- **Tap targets:** `min-height: 46px` ×11, `50px` ×5 — **no 52px anywhere**
- **Card width:** 360 (the design's own canvas)
- **OTP row:** 316px at 360
- Canon: *"Palette, spacing, radii, chips, OTP row carry over from turns 1–3 unchanged."*

### Iconography
**Material Symbols Outlined** (`opsz,wght,FILL,GRAD@24,400,0,0`), loaded from Google
Fonts. Named in the canon: `verified_user` (identity), `videocam` (video),
`play_arrow` (FILL 1), `arrow_back`, `info`, `check_circle`, `person`.

### Components the canon specifies precisely
1. **Two-zone money** — white = pay-now-online, cream = settle-on-the-day, **dashed
   rule is the seam**. Closing line *"Nothing else will be asked of you"* is
   **the anti-ambush promise, printed.**
2. **The two claims** — `Identity verified` (filled green pill, *"our claim"*) and
   `Hear him perform this puja` (*"the family's judgement"*). **Same shape whether or
   not the video is reviewed** — *"on day one every video is unreviewed, so unreviewed
   is designed as normal, never as a warning. Neither state blocks booking."*
   > **"'Verified' is a word the platform may only say about identity. The word never
   > touches a video."**
3. **Buttons — five states, four kinds.** Primary / Secondary / Tertiary / Cancel.
   > **"A disabled control always prints its reason beneath itself — and the reason
   > names the unlock. 13 silent disables → 0."**

### The reduction, explicitly
**7 steps → 2.** Merged upstream (ceremony, date, address captured while searching —
*"booking never re-asks"*). Moved: **name → into the OTP gate** — *"Who is this
ceremony for?"*, because *"the Sankalp needs the Yajman's name; part of the rite, not
a form field."* Required fields **9 → 5** (date · flat+building · society · phone · OTP).

### The three unresolved card directions — **A DECISION IS OWED**
| | direction |
|---|---|
| **4a** | **The Evidence.** Video-led: hear him before you read about him |
| **4b** | **The Dossier** — designed for the screenshot; brand strip inside the crop, attested rows, share on the card. *"His mother reads it without ever opening the app."* |
| **4c** | **The Introduction.** His own words lead — one quoted line collected at onboarding |

The file's own closing note recommends **4b**, and pairs it with a build order
(§6). **Nothing downstream of the pandit card can be built until Isj picks one.**

---

## 4 · CONFLICTS WITH THE STANDING LAWS — **for Isj to rank, not me**

> Canon is his, but so are the floors. Each conflict below is stated with its
> measurement; **none has been resolved and no pixel has moved.**

### 🔴 C1 · BODY TYPE — canon 14.5px vs floor 18px
The canon's scale puts **Body at 14.5/15.5, Label 12.5, Micro 11**; the measured
mass of the file is 11–15px. The §3 floor is **18px body**. This is not an edge case
— **it is the whole type scale**, and adopting the canon literally lowers every
reading surface in the customer app.

**Worth noting for the ranking, not as an argument:** the 18px floor was written for
the *pandit* app, whose user is an elderly priest working by voice. The customer app's
reader is a different person on a different errand. **That is exactly the judgement
that is Isj's and not mine.**

### 🔴 C2 · TAP TARGETS — canon 46/50px vs floor 52px
**Measured: `min-height:46px` ×11, `min-height:50px` ×5. `52px` appears zero times.**
Every interactive control in the canon is below the floor. Unlike C1 this one has a
cheap resolution — 46 → 52 changes button height without touching the type scale —
but it will alter the canon's vertical rhythm, so it is still Isj's call.

### 🟡 C3 · CONTRAST — the canon's self-claim is TRUE, and one string escapes it
The canon asserts *"Contrast floor 4.5:1 already enforced (#6B5B48 on cream)."*
**Verified rather than accepted** — computed for every text/background pair:

| pair | ratio | |
|---|---|---|
| `#6B5B48` on `#FBF6EE` | **6.07:1** | PASS — the exact claim, confirmed |
| `#241A12` on `#FBF6EE` | 15.85:1 | PASS |
| `#904D00` on `#EFE7DA` | 5.27:1 | PASS |
| `#2E6B4E` on `#FBF6EE` | 5.86:1 | PASS |
| `#B0432E` on `#EFE7DA` | 4.64:1 | PASS (tightest passing pair) |
| white on `#904D00` / `#2E6B4E` / `#B0432E` | 6.47 / 6.31 / 5.69 | PASS |

`#E8DDCB` and `#DBC3A4` fail as text but are **borders only** (45 and 9 uses,
`color:` zero times) — **not a violation.**

**The one real breach:** `#C9B79C` is used as `color:` twice, at `font:500 10px`,
for the string **"Delhi-NCR pilot"** in the brand strip — **1.82:1 at 10px.**
`#B9A88F` (2.15:1) carries the map's `→` arrows (documentation chrome, not app UI)
and a `person` placeholder glyph inside the avatar tile (decorative).

So: **the claim holds for the palette and fails for one label.** Cheap to fix
(`#6B5B48` reads 5.63:1 in the same slot) — flagged, not fixed.

### ✅ C4 · LANGUAGE — canon and ruling AGREE
Turn 4 *is* the English-first reversal: English for everything actable, ritual
vocabulary in Roman script, Devanagari as accent only and **never on a control**.
This matches the customer-app language ruling exactly. **No conflict — and it is why
turn 4 supersedes turn 3**, which was Devanagari-first.

### 🟡 C5 · HONEST STATES — aligned in spirit, one gap in the list
Canon's mandated states: *loading* (results, profile, pay) · *empty / none-that-date*
(results) · *signed-out ≠ no bookings* · *payment failed* · *cancelled* · *offline
(global toast + retry)* · *video not yet reviewed* · *day one: zero reviews*.

This is strongly aligned — *"signed-out ≠ no bookings"* is **ERROR ≠ EMPTY's own
shape**, arrived at independently, and *"nothing renders that cannot act"* is the
fabricated-claim law in design words.

**The gap:** the list has **loading** and **empty** but **no error state for results
or profile** — the only failure state is a *global offline toast*. Under **ERROR ≠
EMPTY**, a failed pandit search must not render as "none that date": one is the
server's silence, the other is a fact about the world. **The canon needs one more
state per fetching surface**, or it will be built with the exact conflation this
campaign spent J4 removing (five applications: muhurat, availability, pandit list,
travel, samagri).

---

## 5 · BATCH ORDER — proposed, **not started**

The order said *wizard first unless the canon's own structure argues otherwise*.
**It argues otherwise, in the file's own words:**

> *"Try next: go with **4b** and build **Home → Ceremony guide → Confirmed**"*

The canon nominates its own first batch, and it is not the wizard. The reason is
structural: **Home, Ceremony guide and Confirmed are the three screens that carry the
product's promise** — what this is, what will happen, and what you keep afterwards —
while the wizard is plumbing between them. Two of those three are also the **unbuilt**
screens, so building them adds surface rather than re-skinning it.

| batch | contents | why here |
|---|---|---|
| **0 · DECISIONS** *(blocking, no code)* | **(a)** pick **4a / 4b / 4c**; **(b)** rank **C1** (18px floor) and **C2** (52px floor) | Every later batch renders type and taps. Deciding after the re-skin means doing it twice. |
| **1 · FOUNDATION** | tokens (palette/type/radii), two-zone money block, the two claim badges, the 4-kind button with **reason-beneath-disabled** | Every screen composes these; the ruled floors land here once. |
| **2 · THE CANON'S OWN PICK** | **Home → Ceremony guide → Booking confirmed** | The file's recommendation; carries the promise; adds the starred unbuilt screen. |
| **3 · THE TRUST SURFACE** | Pandit results + Pandit profile + the chosen card | Unblocked by 0(a). C5's error state lands here first. |
| **4 · THE WIZARD** | Choose a ceremony · Date & place · Samagri · Review + pay (incl. the moved login gate) · payment handoff | The 7→2 reduction — the largest behavioural change, and it wants the foundation settled. |
| **5 · AFTERWARDS + THE CUT** | My Bookings · Booking detail (fold the two live routes into one) · Help · 3-tab bottom nav · **then the deletions from §2b** | Deletion last, so nothing is removed before its replacement exists. |

**Two dependencies worth stating plainly:** batch 3 cannot start before **0(a)**, and
**deletion is a ruling, not a batch step** — §2b lists routes the canon cuts, but
`/muhurat`, `/nri`, `/voice-search` and `/stitched` are Isj's to condemn, not mine.

---

**STOP.** Implementation begins only after Isj sees this inventory and rules on the
conflict list. Tracks 2 and 3 stand unchanged.
