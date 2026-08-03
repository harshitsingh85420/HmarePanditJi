# FOOD / TRAVEL / STAY — design report (2026-08-03, REPORT-ONLY)

**Isj's requirement, confirmed intent:** alongside the Aadhaar step, the
pandit is asked his FOOD, TRAVEL, and STAY preferences — the
outstation-booking half a yajman must know BEFORE booking, or every
outstation booking becomes a phone negotiation.

**Status: report only. Isj voice-checks §3; he rules the rest. The
consultation report queues immediately behind.**

---

## 1 · THE FIRST LAW — the F-J5-1 reconciliation, stated up front

**Identity stays ORDER-FREE. That ruling stands untouched.** F-J5-1
(2026-08-01) freed the Aadhaar step from the readiness queue at three
client sites (`tappable = a.step === IDENTITY_STEP || …`), and F-J5-4
freed it server-side (an Aadhaar-only submit lands with zero commercial
fields). This report's design obeys both:

- The Aadhaar MOMENT is the right **PLACE** to ask — same flow, his own
  needs, the purest ask-only-what-is-his-to-answer: nobody but he knows
  how he travels, where he sleeps, what he eats.
- It is never a **GATE**: all three questions skippable, "बाद में" alive
  on every screen, and **identity submits with zero of them answered** —
  the skip copy says so out loud (§3). Nothing about F/T/S may join the
  identity submit's preconditions; the F-J5-4 server law already makes
  that structural.

## 2 · WHAT EXISTS — every column named before any is proposed

**The headline: the ASK already exists pandit-side; the CUSTOMER sees
none of it; and one render is a standing false claim.**

### 2a · The columns (two generations)

| column | shape | writers | readers |
|---|---|---|---|
| `travelPrefs Json?` (current) | `{ownVehicle{enabled,maxKm∈[10,25,50,100,200,500,999]}, train{enabled,classes⊆[SLEEPER,3AC,2AC]}, bus{enabled,ac∈[AC,NON_AC]}, flight{enabled}, exclusions⊆[NO_FLIGHT,NO_NIGHT,NONE], localCabOk}` | readiness R3 PATCH | the pandit's own snapshot ONLY |
| `foodPrefs Json?` (current, FOOD-ONLY post-BB1) | `{dietary∈[ANY,PURE_VEG,JAIN,VEGAN], hotelFoodOk, allergies≤500, dailyAllowance 1..100000}` | readiness R4 | snapshot only |
| `accommodationPrefs Json?` (current) | `{customerHomeOk, hotelTier∈[BUDGET,THREE_STAR,FOUR_STAR_PLUS], sharedRoomOk, dharamshalaOk, advanceNoticeDays 0..30}` | readiness R4 (stay half; BB1 reroutes legacy leakage) | snapshot only |
| `travelPreferences Json @default("{}")` (LEGACY) | `{maxDistanceKm, preferredModes, selfDriveRatePerKm, vehicleType, hotelPreference, advanceNoticeDays}` | **THREE writers, ZERO readers**: onboarding step3, PUT /pandits/me (zod'd), and PUT /pandits/me/travel-preferences — which writes **RAW req.body with no validation** | none, anywhere |
| Booking columns | travelMode/Status/Cost/Breakdown/DocumentUrls…, foodArrangement + allowanceDays/Amount, accommodationArrangement/Cost | wizard + travel API | PriceBreakdown (amounts only) |

No scalar `advanceNotice` exists — it lives inside two blobs. **No new
preference column is proposed**: the current generation covers Isj's three
questions completely. What's missing is the ASK's placement and the READ.

### 2b · The customer's side today — measured absences and one live lie

- `GET /pandits/:id` ships **no preference field of any kind** — the blob
  was expelled from public reads 2026-07-29 ("a JSON blob is not an
  allow-list") and `publicPanditReads.test.ts` guards all five Json
  columns out. Any future exposure must be **explicit scalars/DTO fields,
  deliberately allow-listed** — that ruling stands and this report designs
  inside it.
- **The phantom badge:** the profile hero renders a travelBadge off
  `maxTravelDistance` — a field that is not on the wire and not even a
  schema column, so `undefined > 500` is always false and **every pandit
  on the platform is stamped "📍 Local (Delhi-NCR)"** — a constant false
  specific about people who may travel all-India. Kill-or-real, §4.
- **The unbacked subtitle:** wizard step 2 claims *"Choose travel mode
  preferred by Pandit Ji"* while `/travel/calculate` takes no panditId —
  the mode cards are static fare tables + CityDistance. The preference
  HOOKS exist in `calculateAllOptions` (`panditPreferredModes`,
  `panditMaxDistanceKm`) with **zero callers** — and their default mode
  list **excludes BUS**, so no customer has ever been offered a bus
  though the calculator and the icon both exist.
- The wizard's food allowance is a flat client constant (₹1,000/day,
  "non-negotiable" copy) — `foodPrefs.dailyAllowance` is read by nothing.
- The pandit's own booking DETAIL types travelAmount/foodAllowance and
  renders neither; only the pre-accept request screen shows amounts —
  terms nowhere.

### 2c · Registry hygiene, flagged before rows are minted

**"F13" means three different things in this repo**: the register has NO
F13 block at all (its scope stops at F1-5, F8-12, F32-36, F43 — so
travel/stay/food preferences are UNREGISTERED despite the register's own
unmapped-=-build-failure rule); the walk's findings.json uses F13-01 for
HOME dashboard states; canon-exact.md uses F13/F14/F16 as canon FRAME
numbers (आधार/भोजन/ठहरना). The build that follows this report must mint
its register rows under a fresh id (proposal: **F13T** travel · **F13F**
food · **F13S** stay) with the collision noted, or Isj names the scheme.

Three founder rulings already pending sit exactly on these boards
(canon-exact.md): frame-13 muted-CTA state · frame-14 food
**multi-select** vocabulary (code is single-select) · frame-16 tier
₹ hints (shipped unratified as "साधारण · ₹1000–1500" etc.).

## 3 · THE THREE QUESTIONS — Devanagari verbatim, for Isj's voice-check

One question per screen, आप/कीजिए register, voice-first, every screen
skippable. Order per the standing task title: **यात्रा → ठहराव → भोजन.**
Built on the SHIPPED vocabulary (canon frames 15/16/14) with the walk's
पP2 fixes folded in: the Latin chips die (3AC → एसी-3 शयनयान), stay
splits from food (canon itself keeps 14 and 16 separate), and every
screen speaks. The skip is one line everywhere, stating the first law:

> **"बाद में — पहचान की जाँच पर कोई असर नहीं।"**

### Screen 1 · यात्रा

- **Narrate:** "आप दूर की पूजा के लिए कैसे जाएँगे? नीचे से चुनिए — एक से
  ज़्यादा भी चुन सकते हैं। अगर दूर की पूजा नहीं करते, तो वह भी बताइए।"
- **Board question:** **"दूर की पूजा के लिए आप कैसे जाएँगे?"**
- **The does-he-travel-at-all answer, explicit** (Isj's "some won't" —
  today it is only inferable from all-modes-off, which reads as
  unanswered): its own full-width tile —
  **"🏠 मैं दूर की पूजा नहीं करता — अपने शहर में ही"**
  (selecting it clears and disables the mode grid; an ANSWER, not a skip).
- **Mode tiles (2×2, existing):** 🏍️ खुद जाऊँगा · 🚂 ट्रेन · 🚌 बस ·
  ✈️ फ्लाइट
- **Sub-choices, Latin chips replaced (walk पP2):**
  - खुद जाऊँगा → "कितनी दूर तक?" 10 कि.मी. / 25 कि.मी. / 50 कि.मी. /
    100+ कि.मी.
  - ट्रेन → "कौन-सा दर्जा चलेगा?" **स्लीपर / एसी-3 शयनयान / एसी-2**
  - बस → **"एसी / बिना-एसी"**
- **Exclusions (existing):** हवाई जहाज़ नहीं · रात की यात्रा नहीं ·
  कोई नहीं
- **Local cab (existing):** "शहर के अंदर टैक्सी से जाना ठीक है?" हाँ/नहीं

### Screen 2 · ठहराव

- **Narrate:** "दूर की पूजा में आप कहाँ रुकेंगे? जो ठीक लगे, चुनिए — यजमान
  को पहले से पता रहेगा।"
- **Board question (existing, frame 16):** **"दूर की पूजा में कहाँ
  रुकेंगे?"**
- **Stay rows (existing):** 🏠 घर पर ठीक हूँ · 🏨 होटल चाहिए ·
  🛕 धर्मशाला भी चलेगी
- होटल चाहिए → **"कौन-सा होटल?"** साधारण / अच्छा / बढ़िया (₹ hints ride
  the pending frame-16 ruling — the words ship, the numbers wait) →
  **"साझा कमरा चलेगा?"** हाँ/नहीं
- **Advance notice (existing):** **"पूजा से कितने दिन पहले बताना होगा?"**
  उसी दिन भी / 1 दिन पहले / 2 दिन पहले / 3+ दिन पहले

### Screen 3 · भोजन

- **Narrate:** "अब भोजन की बात — आप क्या भोजन लेते हैं? यजमान को पहले से
  पता रहेगा, कोई असहजता नहीं।"
- **Board question (existing, frame 14):** **"आप क्या भोजन लेते हैं?"**
- **Diet chips (existing):** 🍽️ कुछ भी · 🥗 शुद्ध शाकाहारी · 🍳 प्याज़-लहसुन
  नहीं · 🌱 जैन भोजन — *note for the ruling: Isj's shape names
  प्याज़-लहसुन; the stored enum is [ANY, PURE_VEG, JAIN, VEGAN]. Either
  प्याज़-लहसुन-नहीं becomes a new enum value (NO_ONION_GARLIC) or it maps
  onto JAIN — his word decides, and the frame-14 multi-select ruling
  (pending) decides whether these chips stay single-select.*
- **"होटल का खाना चलेगा?"** हाँ/नहीं (existing)
- **एलर्जी** (optional VoiceField, existing) · **भत्ता** (empty-by-law,
  existing: "यह भत्ता तभी मिलता है जब यजमान भोजन नहीं देते।")

## 4 · THE READER MAP — where the yajman finally learns his needs

| # | reader | today | proposed (honest-absence copy drafted) |
|---|---|---|---|
| R-F1 | profile — new **"दूर की पूजा"** section | nothing; the phantom badge stamps every pandit "Local" | reads NEW explicit wire scalars (travelsOutstation, modes list, advanceNoticeDays, staysAt summary — DTO fields, never the blob, per the 2026-07-29 ruling); absence → **"Pandit ji hasn't shared travel preferences yet — discuss when booking."** |
| R-F2 | profile hero travelBadge | **constant false claim — KILL** | replaced by the real scalar (travels/doesn't/unanswered) or nothing |
| R-F3 | wizard step 2, venue-outside-his-city moment | static matrix + the unbacked "preferred by Pandit Ji" subtitle | the subtitle's claim becomes TRUE or dies: a "Pandit ji की ज़रूरतें" card BEFORE payment — his food terms, stay needs, mode exclusions; two new states: no-preferences-recorded, and pandit-EXCLUDES-a-mode-the-matrix-offers |
| R-F4 | wizard food radios | flat ₹1,000 platform constant | UNCHANGED this build (money math — §5 wait) but the "non-negotiable platform policy" line stays TRUE only while the constant rules |
| R-F5 | pandit's own booking detail | travelAmount/foodAllowance fetched, typed, DROPPED | an outstation section rendering his amounts + arrangements; local booking → honest "इस बुकिंग में यात्रा नहीं है" |
| R-F6 | customer booking detail | amount-only PriceBreakdown rows; alert() stub on "Travel Tickets" | rows stay; the stub and the "Viewing travel docs" promise die (dev-leak class) |
| R-F7 | the wire | zero preference fields (guard-enforced) | explicit scalars added to the detail allow-list deliberately, each named in the guard the way photo/samagri-packages were |

## 5 · STAGING — against the travel-cut history

**The cut, restated so nothing resurrects it by accident:** TRAVEL_FALLBACK
(invented ₹800-5,500) and PANDITS_FALLBACK — deleted; the profile's
fabricated ₹4,300 travel tab — deleted; the travelMode search filter —
CUT, typed `never`; travel quoting as a customer feature — cut from v1;
the English-keyed matrix vs Devanagari cities blocker — still standing.

**Ships free now (no money math, no travel-feature resurrection):**
1. **Post-reg S2** — the three screens of §3 (reusing R3/R4's shipped
   vocabulary and write shapes; tasks #42-44's wiring), skippable,
   identity untouched.
2. **R-F2** the phantom-badge kill (it is a live false claim today).
3. **R-F1/R-F7** the profile section + explicit wire scalars.
4. **R-F5/R-F6** booking-detail sections + the alert() stub kill.
5. **The legacy-column cleanup** (its own small commit): three writers,
   zero readers, one of them unvalidated raw-body — retire the writers
   onto the current generation or delete them; the unvalidated PUT is a
   write-anything hole regardless.
6. Register rows minted under the collision-free ids (§2c).

**Waits, each named:** W-F1 wiring preferences into `/travel/calculate`
(the zero-caller hooks + the BUS default bug live here — it touches the
cut travel feature and the matrix blocker; its own ruling). W-F2
per-pandit `dailyAllowance` entering the charge (money math — replaces
the flat ₹1,000 "non-negotiable" policy only by ruling). W-F3 the three
pending canon rulings (frame-13 muted CTA, frame-14 multi-select,
frame-16 ₹ hints) — each one line from Isj.
