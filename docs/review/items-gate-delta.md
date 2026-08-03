# ITEMS GATE LISTING — design-delta report (2026-08-03, REPORT-ONLY)

**Isj's refinement #2, confirmed intent:** three axes, cleanly split —
**ITEMS LIST = the pooja's DEFINITION** ("these items are required to fulfil
the puja" — the yajman's preparation info; a listing without it is
incomplete INFORMATION), **PRICES = the pandit's own deal** (his, whenever),
**VIDEO = trust** (optional, badge). His words: *"puja won't be visible
until all the items are given… history can be saved for pandit ji."*

This re-gates `isActive` — the flag the decoupling freed — so every change
below is written to be precise, not reflexive. **Untouched by this delta:**
the reject-kills-only-video law, the badge semantics, dakshina's existing
role (floor-checked at declaration — items JOIN dakshina as listing
preconditions; video stays trust-only).

**Two words from Isj turn this into build orders: (1) basic-vs-all-three,
(2) grandfather-vs-unlist.**

---

## 0 · THE COLLISION THE PREDICATE MUST CROSS, stated first

Under the shipped samagri model, **an unpriced item list cannot persist**:
`saveSamagriPackages` deletes any tier whose price ≤ 0 (the intentional
truthful-state DELETE, ruled 2026-08-03). But the items-gate needs items
storable WITHOUT prices — the definition is information, the price is a
deal, and Isj's model separates them explicitly. So the gate needs a home
for priceless items that the DELETE law does not eat.

**Proposed home: `PoojaConfig.itemsList Json`** — ONE list per (pandit,
pooja), the pooja's own definition, beside teamSize/dakshina/supplyMode
where the pooja's other declaration facts already live. The tier packages
(items + prices) remain the PANDIT_BRINGS commercial layer ON TOP of the
definition. Two bonuses fall out free:

- **LIST_ONLY's promised list becomes real.** The ruled profile copy —
  *"Yajman arranges the samagri — Pandit ji shares the list"* — currently
  promises a list that exists NOWHERE (LIST_ONLY deletes all tier rows).
  With the definition on PoojaConfig, that copy can render the actual list.
- **The truthful-state DELETE stays exactly as ruled** — it governs priced
  COMMERCE rows; the definition is not commerce and never collides with it.

## 1 · THE GATE'S EXACT PREDICATE — both variants, a paragraph each

**Common core (either variant):** `PujaService.isActive` becomes
**true ⟺ the declaration exists AND the items predicate holds**. Video
and prices stay non-gates. A declaration without items → `isActive:false`
+ the pandit's DRAFT SAVED (§3). No verdict writer returns — the inverted
publish guard's verdict sections stand; only its create sections re-pin.

### Variant A — BASIC suffices (with the PoojaConfig home: THE ONE LIST suffices)

*Predicate:* the definition list (`PoojaConfig.itemsList`) carries ≥ 1
item. Under the cumulative law the base list IS the pooja's floor
definition; upper tiers only ADD. (If Isj prefers the tier rows as the
store instead of the PoojaConfig home, "BASIC suffices" reads: the BASIC
tier has ≥ 1 item — but then unpriced persistence must be carved out of
the DELETE law; §0 names why the PoojaConfig home avoids that carve-out.)

*Writer-side, savePoojaConfig:* create becomes
`isActive: hasItems(itemsList)` — the wizard's chapter-1 submit (which
collects no items) therefore creates **false**; the API accepts an optional
`itemsList` on the same POST so chapter 2 (and the future add-flow) can
publish in one write. `update` gains one transition: when a config save
makes the predicate become true and the service row is false-because-empty,
flip true — **the publish moment**.

*Chapter-2's publish moment:* screen 0's items now persist AS THE
DEFINITION when the pandit leaves the screen (आगे or सहेजिए) — not only
inside the end-of-chapter samagri POST. The moment the definition lands
non-empty, the pooja LISTS. Prices (screen 2) and the supply answer
(screen 1) keep their existing writes untouched.

### Variant B — all three tiers

*Predicate:* all three tier item lists non-empty (BASIC, STANDARD, PREMIUM
each ≥ 1 own-or-inherited item). *Writer-side:* same savePoojaConfig shape,
but the predicate reads the three tier lists; chapter-2's publish moment
moves to the END of screen 0 only when all three tabs have content, and the
DELETE-law carve-out from §0 becomes REQUIRED (unpriced tier rows must
persist as definition-bearers). *Named cost:* a 62-year-old must fill three
lists before his pooja exists anywhere — triple the entry toll on the
listing, where variant A tolls him one list. The cumulative law already
says upper tiers contain the base, so demanding all three adds ceremony,
not information.

**Recommendation on record: Variant A with the PoojaConfig home.** Isj
ranks; this is not self-applied.

## 2 · THE SIX NAMED SUBJECTS (all of production, measured 2026-08-03)

| # | row | dakshina | items today | GRANDFATHER means | UNLIST means |
|---|---|---|---|---|---|
| 1 | क्यूए-walk J2 · **HAVAN** | ₹1,101 | **YES** — definition derivable from its BASIC tier (रोली; STANDARD adds देसी घी) | already compliant either way | stays listed either way |
| 2 | क्यूए-walk J2 · MUNDAN | ₹501 | none (LIST_ONLY — and its "shares the list" copy currently points at nothing) | stays listed; मेरी पूजाएँ chip nudges "सामग्री की सूची दीजिए" | **1 → 0**: Mundan disappears from the directory |
| 3 | क्यूए-walk J2 · SATYANARAYAN | ₹2,100 | none | stays listed + nudge | drops (see #4 for the pair) |
| 4 | Tanya · SATYANARAYAN | ₹502 | none | stays listed + nudge (**Tanya untouchable by journeys — the nudge is a passive chip she sees on her own; nothing is sent to her**) | **2 → 0**: the ONLY pooja with two listings empties entirely |
| 5 | क्यूए-walk J2 · GRIHA_PRAVESH | ₹1,101 | none | stays listed + nudge | **1 → 0 — the video-APPROVED flagship unlists**: the only badge-bearing pooja on the platform vanishes from customers |
| 6 | *(that is all of production: 2 pandits, 6 service rows)* | | | | |

**The directory consequence of UNLIST, plainly: 6 listings → 1.** Every
search except `?pujaType=HAVAN` returns zero; the badge-bearing
GRIHA_PRAVESH dies with the rest. Grandfather keeps all six and converts
the five empty rows into pandit-side nudges. (A middle path exists —
grandfather with a dated sunset — named for completeness, not proposed.)

## 3 · THE DRAFT-SAVED HALF (his history, invisible customer-side)

- **Storage:** the half-filled state IS the server state — a PoojaConfig
  (+ false PujaService) with whatever the pandit gave so far: dakshina
  without items, items without prices, any order. Nothing client-only;
  an F5 loses nothing. ("history can be saved for pandit ji" — his words.)
- **Where he sees it — the pipeline view on मेरी पूजाएँ:** the existing
  visibility chip gains the REASON and the ACTION. Draft-state chip copy:
  **"सामग्री की सूची दीजिए → पूजा दिखेगी"** (replaces the bare
  "प्रतीक्षा में — अभी यजमानों को नहीं दिखती" for rows whose only blocker
  is items); the 🛍️ सामग्री → door beneath it is already the way in. The
  bulk done card becomes the pipeline in miniature: "८ पूजाएँ तैयार —
  हर एक की सामग्री की सूची देते ही वह दिखने लगेगी।"
- **The "बाद में" correction (the old promise is FALSE under this ruling):**
  chapter 2's skip currently says *"बाद में — पूजा दिखती रहेगी"* — true
  only for an already-listed pooja. It becomes STATE-BRANCHED, drafted for
  the voice-check:
  - pooja already listed (items exist / grandfathered):
    **"बाद में — पूजा दिखती रहेगी"** (unchanged, now conditionally true);
  - pooja not yet listed: **"बाद में — सामग्री देने पर पूजा दिखेगी"**.
  The add-wizard's done card likewise: the ⏳ card's sub-line becomes
  **"सामग्री की सूची देते ही यह यजमानों को दिखने लगेगी।"** and the
  🛍️ सामग्री जोड़िए button stops being optional detail and becomes the
  completion step (same button, truthful weight).

## 4 · READERS

**Customer-side: ZERO changes, confirmed.** Every customer read already
filters `isActive: true` — the list wire (`where isActive:true`), the
detail wire's pujaServices select, the search card, the booking wizard's
pandit list. The gate moves writer-side only; no customer surface learns
anything new. (The owner-side unfiltered read — the ₹0-crossed-the-counter
fix — is exactly what lets the draft render for HIM; the guard already
pins it.)

**Pandit-side readers that change (5):** ① मेरी पूजाएँ chip (reason+action
copy, §3); ② add-wizard done card (completion copy + button weight);
③ chapter-2 skip button (state-branched copy); ④ bulk done card (pipeline
copy); ⑤ **the publish guard** — its create sections re-pin from
"creates `isActive: true`" to "creates the PREDICATE" (a ruled edit with
both polarities: a writer that hardcodes true without items trips it, as
does one that forgets the flip-on-items transition). The verdict sections
(zero pujaService writes) and W6 tripwire stand unchanged.

## 5 · STAGING — one build or two

**Two, split exactly at Isj's second word:**

- **Build 1 — THE GATE** (his word #1 picks §1's paragraph): schema add
  (`PoojaConfig.itemsList Json?` — migration file written for Isj's hand,
  Track 2A precedent), savePoojaConfig predicate + publish transition,
  chapter-2 publish moment, the four copy corrections, guard re-pin,
  LIST_ONLY's profile copy starts rendering the real list. Ships alone;
  new declarations gate immediately; existing rows untouched until —
- **Build 2 — THE STOCK DECISION** (his word #2): *grandfather* → the
  nudge chips only (pure UI, no data change; Tanya sees a passive chip,
  nothing sent); *unlist* → one UPDATE flipping the five empty rows false
  — **a migration for Isj's hand on Neon**, with the 6→1 directory
  consequence re-stated at the moment of the act.

No payment math anywhere in either build. The bulk picker's promise
("आठों जुड़ेंगी") stays true — they join as DRAFTS; the pipeline says so.
