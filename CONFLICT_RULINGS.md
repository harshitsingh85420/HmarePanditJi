# Conflict Rulings

Durable record of design/architecture conflicts and how they were settled, so a
ruling that flips is not silently re-litigated. Newest first.

---

## Ruling #9 — ORB GESTURE SPLIT: tap = फिर से सुनिए (repeat); mute = an explicit visible control

**Status: final** (Isj, 2026-07-22). Fixes the walk's #1 failure shape surfaced
while settling Ruling #8.

**AMENDED (Isj, 2026-07-24 — live-UI review): the control is a TOGGLE.** The
one-directional pill ("सुला दें" that vanished while asleep) was asymmetric —
the orb toggles but the pill covered only one direction. Now ONE element owns
the ONE concept: awake → "सुला दें" (speak-then-mute, unchanged); asleep → the
SAME pill reads **"जगाइए"** and wakes him (mirrors the orb's tap-asleep path —
the orb tap keeps both its meanings as a harmless second path, taught by the
wake-hint). Everything else stands: speak-then-mute ordering, ≥52px, Devanagari
at rest, S5 mic release on mute, never adjacent to a primary CTA, column escape
classes. Both states pinned in `shishyaOrbGesture.test.ts` (AMENDED block) +
registered in `orbColumnContract.test.ts`.

### The conflict

The शिष्य orb is framed as the disciple you touch. But its tap was a
state-dependent **mute toggle** (`setMuted`), so a natural tap on the (awake)
orb **silenced it + released the mic** — and muting was **silent** (only a
toast; waking spoke, muting didn't). To a 64-year-old that reads as "app broke",
not "I muted it". Gate evidence confirmed the capabilities live outside the
tutorial (ShishyaOrb tap / home `playBell`), so the fix is a gesture redesign.

### The ruling

- **TAP (awake) = REPEAT** — `voiceController.repeatCurrent()`: barge-in the
  current line, re-narrate the screen, listen ring returns. The single most
  useful action for a confused elder ("मैं भूल गया" → touch → he tells you
  again). **A tap NEVER silences.** Rapid taps debounced (~600ms).
- **TAP (asleep) = WAKE** — unchanged (already speaks a greeting).
- **MUTE = an explicit VISIBLE, labelled control** ("सुला दें", ≥52px, Devanagari
  at rest) adjacent to the orb — **not** a long-press (long-press already failed
  the SOS persona test) and **not** icon-only. It **speaks the farewell to
  completion, THEN** mutes: `muteWithFarewell()` → `speak("अब मैं चुप रहूँगा — दोबारा
  सुनने के लिए मुझे जगाइए।")` → `onEnd` → `setMuted(true)`.
- **PRIVACY (S5) survives:** every mute still routes through `setMuted(true)`,
  which does the full mic release (`releaseMicStream`) — pinned by test.
- **समझा tooltip** teaches: tap = "फिर से सुनिए", the सुला दें control =
  deliberate rest. Never "tap to control".

### Retirement discipline (per #8)

Inventory found **no test ever pinned "tap mutes"** — nothing obsolete to
retire. The mic-release property was previously **unpinned**; it is now pinned
(`shishyaOrbGesture.test.ts`). Sequencing note: speak-then-mute is clean, not
awkward — the ~2s farewell is the going-quiet cue, then silence.

### Flag resolutions (Isj, 2026-07-22)

1. **Voice "सो जाओ" also speaks-then-mutes** — both mute entry points (the सुला
   दें control AND the voice command) now route through `muteWithFarewell`. A
   spoken command answered by silence read as "it didn't hear me". Resolved.
2. **The सुला दें control is relocatable** — `muteControl="below" | "relocated"`
   + standalone `<ShishyaMuteControl/>`; a build-failing guard enforces
   MOVE-never-REMOVE. In `TutorialShell` it sits in the dots row, never beside
   the CTA (thick-finger mis-tap). Hero screens await Isj's device pass.
3. **Tap-repeat discoverability = option A only** (the failed-voice-attempt
   hooks: F02 rung 2 + rung 3 + `voiceLoop.unmatched` all teach "या शिष्य को
   स्पर्श कर फिर सुनिए"). The gesture-idle option **B was DROPPED** — the
   frequency check showed it would fire on nearly every reading/idle screen
   (narrate → pause > 12s is the universal pattern), which is the clutter it was
   meant to avoid.

### ACCEPTED GAP (2026-07-22, Isj)

Option A only reaches a pandit who **SPEAKS**. One who is stuck **silently** —
no tap, no voice — gets no tap-repeat hint. This is a **deliberate trade**: B
was the fix for that moment, but its cost (persistent clutter on most screens)
was too high. **Revisit only if Isj's device pass shows that silent-stuck moment
is real.** Pinned by `tapRepeatTeaching.test.ts`.

### Reopening

Only Isj.

---

## Ruling #8 — TUTORIAL RETIREMENT: सो जाओ mute-gate + नई बुकिंग bell slides retired from the tutorial

**Status: final** (Isj, 2026-07-22). The 13/14-artboard "ट्यूटोरियल · Animated"
design deliberately drops two interactive slides the old 6-slide tutorial had.

### The conflict

The new Deck A (A0–A8) has only ONE interactive slide — A4 आवाज़ (mic) — plus
the A8 cta. It has **no सो जाओ mute-gate slide and no नई बुकिंग temple-bell
slide**. But `tutorialIdentity.test.ts` asserted both as law (`interactive ===
"mute"` + `nextDisabled = isMute && !gateOpen`; `role === "bell"`). Faithfully
building the design retires those interactions, so those assertions no longer fit
— in the unified-player path (C) OR the extend-in-place path (B).

### The ruling

The mute-gate and bell **slides** are retired from the tutorial because the design
dropped them — the assertions are **obsolete, not inconvenient**, so they are
retired for that reason. Retirement discipline (all verified before removal):

- **RETIRE ≠ DELETE — the capabilities survive outside the tutorial** (verified
  with evidence 2026-07-22): (a) sleep/mute the shishya = tapping the app-wide
  `ShishyaOrb` (`voiceController.setMuted`, ShishyaOrb.tsx:85–89), present on every
  screen; (b) the new-booking bell = `home/page.tsx:183–186` `playBell()` on a
  `newlyDiscovered` request. Neither was reachable only through the retired slide.
- **The teaching moves, it isn't lost:** the mute lesson ("how do I make it stop
  talking") relocates to the **समझा** contextual first-use tooltip on the orb
  (coachTips). The bell needs no teaching — it teaches itself when it rings.
- **Guard migration:** every mic assertion + `role === "cta"` + the no-index-keying
  law move **unchanged** to the new mic component (MicPracticeArtboard) / DeckPlayer;
  the mute + bell assertions are the only ones deleted, and only because their
  slides are gone.

### Reopening

Only Isj. This exists so no future session reads the mute/bell absence as
accidental loss — it was a signed design decision.

---

## Ruling #7 — MONEY MODEL: पंडित जी को दक्षिणा का 100%, प्लेटफ़ॉर्म शुल्क अलग से यजमान देता है

**Status: final** (Isj, 2026-07-21). **Supersedes the 90/10 model entirely** —
and the pandit-doc's earlier 15% figure. Both are dead.

### The conflict

Every prior money surface deducted the platform's cut FROM the pandit: the
shipped model paid the pandit 90% and kept 10% ("दक्षिणा का 90% आपका"), the doc
once said 15%. Isj's ruling reverses the direction of the fee: the पंडित जी
keeps the **whole dakshina — कोई कटौती नहीं**. Platform revenue is a **separate
fee charged to the CUSTOMER, added ON TOP** of the dakshina; it never touches
the payout.

### The ruling — the money laws

- **Payout = 100% of dakshina + pass-throughs.** The platform fee is NEVER
  subtracted from what the pandit receives. This is the property that matters;
  it is guard-pinned structurally (the payout expression may not subtract the
  fee) AND at runtime.
- **Platform fee = a SEPARATE, customer-paid charge, on top.** Rate stays the
  single-source `PLATFORM_FEE_PERCENT` (currently 10) in
  `services/api/src/config/constants.ts` — never a second literal.
- **Conservation (new meaning):** `grandTotal (customer pays) = dakshina +
  platformFee + pass-throughs`; `panditPayout = dakshina + pass-throughs`;
  `platformFee = grandTotal − panditPayout`. The fee is the platform's whole
  take and it moves from the customer, not out of the pandit.
- **Customer-side display:** because the customer now pays MORE than the bare
  dakshina, the fee is shown as its **own line** at checkout (web booking
  wizard) — display = charge, mirroring `calculateGrandTotal`. Prior surfaces
  that said "no platform fee added — you pay exactly the items above" were
  corrected.
- **Spoken + written copy:** शिष्य, FAQ, earnings, tutorial and the LLM
  fact-sheet all say **पूरा 100% आपका — कोई कटौती नहीं; प्लेटफ़ॉर्म का शुल्क अलग
  से यजमान देता है**. No surface may quote a pandit-side deduction (90/85/80%).

### Guards (build-failing, proven to fail)

`commission-consistency.test.ts` (single source + payout-never-reduced +
runtime conservation), `payment-money.test.ts` (fee-on-top grandTotal + 100%
payout + wizard display=charge), `earnings.test.ts`, `shishyaFacts.test.ts`,
and pandit `faqTruth`/`priceEstimate`/`feeLabel`. Reintroducing `− platformFee`
into the payout fails commission-consistency (REGRESSION pin) and payment-money
(conservation break) — verified 2026-07-21.

### Reopening

Only Isj. Changing the fee direction or rate = changing the business model.

---

## Ruling #6 — TUTORIAL ANIMATION LAW: the tutorial demonstrates, it doesn't describe

**Status: final** (Isj, 2026-07-21). Supersedes the static-caption reading of
Ruling #2's tutorial amendment (the caption stays; the TEACHING moves to
animation + speech).

### The conflict

Canon's tutorial artboards (frames 5a–5f) are STATIC mocks. The register/floor
work rendered them as a still + a caption + a spoken line. Isj's ruling: a
62-year-old must learn each concept WITHOUT READING — so each slide must be a
looping DEMONSTRATION, with शिष्य narrating over it.

### The ruling

The tutorial **intentionally goes beyond canon** (canon is static; this
animates). Canon's *visual world* still governs: every animation is built from
canon's own components and motion vocabulary (Diya, CountUp, ShishyaOrb, Toran,
brass coins, g-float / g-glowring / g-shimmer / g-bounce / celebration petals)
so nothing looks foreign. Per-slide choreography grammar: **object enters →
action demonstrates → happy result → loop** (~6–8s).

Bindings: transform/opacity-only CSS keyframes (A12), NO JS animation loops;
every loop pauses under `prefers-reduced-motion` at a static end-state that
still conveys the concept; speech and animation are **loosely coupled** (the
loop runs autonomously, शिष्य's line plays over it — no TTS-duration sync); text
law unchanged (headline + controls + in-mock labels only). Acceptance (Isj's
phone): sound-off, the animation alone conveys the concept; reading required =
reject. The interactive gates (slide 3 mute, slide 4 mic-permission) survive —
the demonstration is layered on the real interaction, never replaces it.

### Reopening

Only Isj. Canon's static tutorial mock is not counter-evidence — this ruling
exists precisely to animate past it.

---

## Ruling #5 — FOUNDER REGISTER LAW: शुद्ध, सम्मानजनक हिंदी everywhere

**Status: final** (Isj, 2026-07-21). Supersedes canon copy.

Language hierarchy: **Isj's language directives > canon copy > legacy strings**
(truthful-state still trumps all). Everything the app writes or speaks: आप-forms
only, imperatives in -इए (कीजिए/बोलिए/दबाइए/चुनिए/भेजिए), छूकर/छुओ/टच →
स्पर्श कीजिए, तुम/तू nowhere, पंडित जी always with जी. Bar: how a devoted शिष्य
addresses his guru — simple, warm, आदरपूर्ण; never over-Sanskritized into
unfamiliarity. Exemptions (PW-08): quoted native-browser button names and taught
user-command vocabulary. AUTO-guarded by `registerLaw.test.ts`; register rows
PW-07/PW-08. Reopening: only Isj.

---

## Ruling #4 — Canon-omitted back buttons: no-dead-ends law outranks pixel purity

**Status: final — ratified by Isj** (2026-07-21).

Canon omits the back control on several frames. The ruling: **a screen with no
other on-screen escape keeps the back, restyled as canon's own back-circle**
(52px-floored #FFFDF8 shadowed circle, arrow_back #7A250E); a screen with
another escape (BottomNav tab screens: settings, calendar, earnings) drops the
back exactly as canon draws it. Applied uniformly in the Header rework
(variant="row"/"title"/"garland"). Reopening: only Isj.

---

## Ruling #3 — The splash IS canon frame 1, ported verbatim

**Status: final** (Isj, 2026-07-21). Supersedes the earlier splash decision that
was judged against the dead `/prompts` Stitch mockup.

### The conflict

An earlier ruling shaped the splash around the `/prompts` mockup (a plain sunrise
with an ॐ hero mark and a timed auto-advance). Under the master PORT directive,
`design/canon/` IS the UI — so the splash is canon frame 1, not a convergence
target.

### The ruling

Canon frame 1 wins, ported verbatim: the 4-stop night→sindoor→genda sky
`linear-gradient(180deg,#2A1B3D,#5E1C0A 38%,#B23A1A 68%,#F2A02C 100%)`, Toran
count=11, five mixed 🌼/🌸 petals at canon offsets, the **drawn brass Diya** at
size 104 (no ॐ, no 🪔 glyph), the wordmark 40/900 `#FFF6E9`, the gold-shimmer
tagline, Shishya `state=speaking say="नमस्ते पंडित जी! 🙏"`, and the "छूकर शुरू
करें" touch pill. The only overrides are the standing floors (the 16px tagline is
held at the 18px body floor; the 42px pill meets the 52px tap floor).

**Behaviour** is Isj's founder spec, layered onto the canon view: the app SPEAKS
its first words on mount ("नमस्ते पंडित जी!" → "आगे बढ़ने के लिए स्पर्श कीजिए",
autoplay-safe), the first gesture unlocks audio for the whole session, and the
**8-second rule** governs advance (touch cancels + advances; 8s auto-advances).
Recorded as register row F02-13, guarded by `splashBehavior.test.tsx`.

### Reopening

Only Isj. The `/prompts` splash is not evidence — it is the dead mockup this
ruling exists to bury.

---

## Ruling #2 — Readable-text floors outrank canon pixel values

**Status: final** (Isj, 2026-07-21). Extends the precedent already set on ThaliNav.

### The conflict

Canon leans on 12–13px labels and captions across many artboards. The pandit
persona is a 62-year-old, and DESIGN.md's own law sets an 18sp body floor. So
"match canon exactly" and "respect the readable-text floor" collide on roughly
25 screen deltas — every small-label tier in the canon set.

### The ruling

The floors win, and they are concrete so the deltas resolve **mechanically**,
not per-screen-by-judgment:

| Text role | Floor | Canon drift it overrides |
| --- | --- | --- |
| Body text | **≥ 18px** (18sp) | canon's 13–15px body |
| Labels / captions | **≥ 15px** (the ThaliNav standard) | canon's 12–13px labels |
| Tap targets | **≥ 52px** | canon's 42–44px icon buttons |

Canon's 12–13px labels are treated as **drift from DESIGN.md's own law**, not as
fidelity — so they are bumped to the floor. Everything *else* about the element
(colour, shadow, gradient, ornament, layout, spacing, radius) is matched to
canon exactly. Only the type size is floored.

### How to apply

1. Any text below its floor → raise to the floor (label→15px, body→18px).
2. Keep exact-UI on all non-type properties.
3. **If a specific screen looks wrong once text is floored** (overflow, a broken
   two-line wrap, a collision) → list that screen for Isj, **do not** shrink the
   text back below the floor to make it fit. Re-flow the layout instead, or
   escalate.

### Why this isn't "give up on exact"

"Indistinguishable" is the goal for how a screen *looks* — depth, colour,
ornament, rhythm. Text a pandit cannot read is not a fidelity win; it is the one
place where matching canon would defeat the product's whole reason for existing.
The floors are the single deliberate, recorded exception, so no future screen
agent re-guesses them.

### Reopening

Only Isj reopens. A canon artboard showing 12px text is not new evidence — it is
the very drift this ruling exists to correct.

---

## Ruling #1 — Primary palette: SINDOOR `#B23A1A`

**Status: evidence-final** (flipped twice before landing here).

### History

| Stage | Ruling | Basis |
| --- | --- | --- |
| 1. Original | App built in sindoor `#B23A1A` | Aarti design direction |
| 2. Audit reversal | "App drifted; re-token to saffron `#904D00`" | Audit baselined against the `/prompts` Stitch set + its `saffron_glow/DESIGN.md` |
| 3. **Evidence-final** | **Sindoor `#B23A1A` is canon; the app was faithful all along** | Measured against the real canon bundle once it was ingested |

### The evidence

Hex frequency counted directly from each source:

| Colour | canon `design/canon/` | legacy `/prompts` Stitch |
| --- | --- | --- |
| `#B23A1A` sindoor | **99 — most-used** | 0 |
| `#904D00` saffron | **0** | 223 |

Plus: 21 of 21 of the canon's most-used colours are present in
`apps/pandit/tailwind.config.ts`, and `#904D00` appears nowhere in app source
on any branch (`git grep` across `git rev-list --all`).

### Why stage 2 was wrong

The canon bundle was not in the repo — it existed only on Isj's machine. The
audit therefore baselined against the only design set it could see,
`/prompts`, which is a genuinely different and superseded design language. The
app's sindoor was read as drift when it was fidelity.

### Consequences

- No re-token to `#904D00` was ever executed in app source, so **nothing had to
  be reverted** — verified across all branches.
- The `saffron` Tailwind key keeps its legacy **name** (renaming would touch
  every class for no visual gain); its **value** stays sindoor `#B23A1A`. The
  comment at `apps/pandit/tailwind.config.ts` carries this distinction.
- `DESIGN.md` (repo root) now documents the canon palette and is authoritative.
- `prompts/.../saffron_glow/DESIGN.md` is legacy. It is **not** rewritten —
  editing a historical vendor export to state the opposite of what that design
  actually was would falsify the archive.
- Any audit finding whose baseline was the Stitch palette or layout is
  invalidated at the root, not merely downgraded.

### Reopening

Only new evidence from `design/canon/` reopens this. A document under
`prompts/` is not evidence.
