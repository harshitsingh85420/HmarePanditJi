# Conflict Rulings

Durable record of design/architecture conflicts and how they were settled, so a
ruling that flips is not silently re-litigated. Newest first.

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
