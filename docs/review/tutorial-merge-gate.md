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

## Fallback (only if the branch must merge earlier — flag it to Isj first)

Keep the **live** tutorial at the current **6-slide `TutorialV2`** and gate the
9-slide `DeckPlayer` behind a flag (default OFF) until the artboards exist. Never
ship placeholders to a pilot; surface the choice to Isj rather than deciding it.

## Lifting the gate

When every Deck A/B artboard is real: populate `ARTBOARDS`, remove/relax this
gate, and merge. A guard (`tutorial-artboards-ready.test.ts`, added when Deck A
is wired) will enforce "no placeholder in a live-wired deck" mechanically.
