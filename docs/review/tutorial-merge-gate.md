# ⛔ MERGE GATE — feat/tutorial-system

**Do NOT merge `feat/tutorial-system` to `main` while any Deck A / Deck B slide
still renders `PlaceholderArtboard`.** (Isj, 2026-07-22.)

## Why

Deck A is 9 slides; until the Claude-Design "ट्यूटोरियल · Animated" bundle is
ingested, several artboards are `PlaceholderArtboard` (see
`apps/pandit/src/components/tutorial/tutorial-artboards.tsx` — `ARTBOARDS` is
empty; every id falls back to the placeholder). The tutorial is the **first
thing a pilot pandit ever sees**. Shipping placeholder slides there is a
first-impression failure.

## The gate

- `TUTORIAL_TOTAL 6 → 9` and the 9-slide Deck A live on **this branch only**.
- The branch merges to `main` **only after** the real artboards are ported into
  `ARTBOARDS` (placeholder no longer reachable for the live decks).

## ⚠️ A4 (आवाज़) is SPECIAL — merge the design INTO it, never OVER it

`ARTBOARDS['A4']` is `MicPracticeArtboard` — a **functional** component (the real
mic-permission + practice machinery, shared with the live `TutorialV2`), not a
static illustration. The incoming Design bundle also contains an A4 artboard
(आवाज़ visuals). **Do NOT overwrite `ARTBOARDS['A4']` with the static design
artboard** — that silently drops the mic machinery from the deck (and breaks the
live tutorial, since `TutorialV2` consumes the same component).

**Resolution:** the A4 design artboard is merged **INTO** `MicPracticeArtboard`
as its **visual shell** (the आवाज़ frame around the mic disc / waves / field),
never as a replacement. `ARTBOARDS['A4']` stays `MicPracticeArtboard`.
`micSharedConsumers.test.ts` turns the build red if this is violated — but the
intended answer is written here so the porter doesn't have to guess.

### A4 must ADVANCE the deck — it is not a dead end (Isj, 2026-07-22)

A4 is interactive: without wiring, a pandit could grant the mic and then sit on
the आवाज़ screen with nothing advancing. **Decision: the `DeckPlayer` passes its
own callbacks THROUGH the artboard registry** (`DeckArtboardProps` carries the
optional `onGranted`/`onDenied`/`onBusy`/`onDone` — defined NOW so the design port
never rediscovers them). For the mic slide the player wires **`onDone → goNext`
(auto-advance)** and `onBusy → gate the voice-Next while asking|listening`. The
component itself is identical for both consumers — it just fires `onDone`; only
the wiring differs (`TutorialV2` opens its already-enabled Next; the deck
advances). `deckA9.test.tsx` mounts A4 in the deck and asserts a granted mic moves
the cursor forward — so "A4 is not a dead end" is a build-red property, not a hope.

## Fallback (only if the branch must merge earlier — flag it to Isj first)

Keep the **live** tutorial at the current **6-slide `TutorialV2`** and gate the
9-slide `DeckPlayer` behind a flag (default OFF) until the artboards exist. Never
ship placeholders to a pilot; surface the choice to Isj rather than deciding it.

## Lifting the gate — the flip is a NAMED STEP, and a DECISION

The default-OFF flag prevents shipping placeholders, but it creates the **mirror
risk**: the new tutorial could **silently never ship** — once artboards are
ported, a "no placeholder" guard would stay vacuously green while the app keeps
serving the old 6-slide `TutorialV2`, with nothing turning red.

So the flip is an explicit, named step — **STEP: FLIP THE FLAG**:

1. Ingest the Design bundle → populate every `ARTBOARDS` entry
   (`apps/pandit/src/components/tutorial/tutorial-artboards.tsx`) so no deck slide
   resolves to `PlaceholderArtboard`.
2. **Flip `TUTORIAL_DECKS_ENABLED` → `true`** in `apps/pandit/src/lib/tutorial-decks.ts`.
   The flag-property guard then becomes the LIVE protection (flag ON ⇒ any
   placeholder fails the build).
3. Merge.

This is **Isj's decision, surfaced — not an internal detail.** `tutorial-artboards-ready.test.ts`
enforces BOTH directions mechanically:

- flag **ON** + any placeholder → **red** (don't ship placeholders);
- **all artboards real** + flag **OFF** → **red** with a "flip the flag (Isj's
  call)" message (don't silently never ship).

So when the port completes, the build turns red at exactly the flip moment and
puts the decision in front of a human — it can't be a line nobody reads.
