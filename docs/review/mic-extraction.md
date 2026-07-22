# आवाज़ mic extraction — MicPracticeArtboard (Ruling #8 / approach C)

**What shipped:** the आवाज़ mic-permission + practice machinery, previously inline
in `TutorialV2`, is now ONE shared component — `MicPracticeArtboard` — with TWO
consumers and exactly one copy:

- **consumer 1** — `TutorialV2` (the live 6-slide tutorial) renders it in its
  `isMic` slot;
- **consumer 2** — `ARTBOARDS['A4']` (the 9-slide `DeckPlayer`) resolves to it.

The flag (`TUTORIAL_DECKS_ENABLED`) is still OFF, so production keeps serving
`TutorialV2` — and its mic slide keeps working, because it consumes the extracted
component rather than a copy.

---

## 1. Byte-for-byte proof (Isj: "don't assert it, prove it")

Diffing the code REMOVED from `TutorialV2` against the corresponding block in
`MicPracticeArtboard`:

### `askMic` — the core machinery (60 lines)
`diff` old→new is **only** the two mechanical callback renames:

```
33c33
<         onMicGranted();
---
>         onGranted?.();
54c54
<           onMicDenied();
---
>           onDenied?.();
```

Nothing else in `askMic` changed: the granted short-circuit, the e2e bypass, the
getUserMedia ladder, the settle/denied/dismissed branches, every `localStorage`
write and `voiceController` call — identical.

### Render JSX — `ShishyaOrb` → `check_circle` (the whole visible UI)
`diff` old→new (whitespace-normalised) is **empty** — the शिष्य orb, the five
`SoundWaves`, the listening pill + `CoachSpotlight`, the done tick, the 78px
sindoor mic disc with its glow-ring and mic SVG, the "नमस्ते"→tick field: all
byte-identical. Only the JSX nesting depth (indentation) changed.

### `micPerm` sync-seed, `SoundWaves`, `BAR_COLORS`/`BAR_MIN`
Lifted verbatim (the `micPrompt` guard's sync-seed regex passes against the new
file unchanged).

## 2. Semantic differences — listed and justified (Isj: "ANY semantic difference must be explicit")

Every non-mechanical change is forced by the **mount model** and is
behaviour-preserving. In `TutorialV2` the mic machinery lived at the top level,
mounted for all slides, gated by `if (isMic) return` and keyed on `[idx]`. In
`MicPracticeArtboard` it MOUNTS only while the आवाज़ slide is shown and UNMOUNTS
on leave. So:

| # | Difference | Why it's behaviour-preserving |
|---|-----------|-------------------------------|
| 1 | `if (isMic) / if (!isMic) return` guards dropped | The component is unconditionally the mic; the old guards only let the effects act on the mic slide, which is the only slide the component now exists on. |
| 2 | effect deps `[idx]` → `[]` / `[micState]` | The component mounts fresh on each visit to the आवाज़ slide, so "on idx change" becomes "on mount". |
| 3 | leave-slide reset effect (`if (isMic) return; voiceInput.reset()`) → UNMOUNT cleanup | "Leaving the slide" now IS the unmount. The `setMicState(idle)` part is moot on unmount (fresh mount = idle on return). |
| 4 | done-effect `micState === "done" && isMic` → `micState === "done"` (+ `onDone?.()` added) | `&& isMic` is always-true here; `onDone` is the new advance signal (see §3). |
| 5 | two NEW effects: `onBusy` derived + unmount-release | The parent-signal contract (§3), guarded by `micIsBusy.test.tsx`. |
| 6 | `reduced` via `useReduced()` internally | Matches the original (which read `useReduced()` at the TutorialV2 top level). |
| 7 | `SUBCAPTION` className duplicated as a local const | It is a shared string; it stays in TutorialV2 too. A className constant can't be "shared" across a module boundary without coupling the files for a bare string. |
| 8 | `PopupPointer` / `PetalBurst` render location moved into the component | `PopupPointer` is `fixed inset-0` (DOM parent irrelevant); `PetalBurst` is a decorative `aria-hidden` burst. Both are position-independent. |

## 3. Parent-signal contract

`MicPracticeArtboard` is self-contained except for four optional callbacks:

- `onGranted` / `onDenied` — permission outcome.
- `onBusy(boolean)` — true while asking|listening; **derived from micState (fires
  on every transition) and released on unmount**, so it can never be left stuck
  true. The parent gates its manual/voice Next on it.
- `onDone` — practice complete.

**Two consumers, two wirings (the component is identical; only the wiring differs,
which is correct — a user only ever sees one tutorial):**

- **TutorialV2** passes `onGranted`/`onDenied`/`onBusy`; NOT `onDone`. Its mic-slide
  Next is already enabled, so completion just shows the ✓/burst and the pandit taps
  Next — visibly identical to before.
- **DeckPlayer** passes `onBusy` (gates the voice-Next) and **`onDone → goNext`
  (auto-advance)**. This is the A4-dead-end fix: a granted mic advances the deck
  instead of stranding the pandit on the voice screen. `DeckArtboardProps` carries
  the callbacks so the design port never rediscovers this.

## 4. Guard inventory

**Migrated (assertions UNCHANGED, only the source file moved):**
- `tutorialIdentity.test.ts` — mic wiring (`askMic` / `getUserMedia` / `e2e`) now
  reads `MicPracticeArtboard`; the mute-gate assertion stays on `TutorialV2`; the
  SlideDef-marker / identity / no-index assertions are untouched.
- `micPrompt.test.ts` — sync-seed + granted-short-circuit now read
  `MicPracticeArtboard`; परिचय stays on `ParichayScreen`.

**New:**
- `micSharedConsumers.test.ts` — the two-consumers property. **Proven-to-fail:**
  pointing `ARTBOARDS['A4']` at the placeholder makes consumer-2 fail with
  *"expected PlaceholderArtboard to be MicPracticeArtboard"*.
- `micIsBusy.test.tsx` — the onBusy contract: false at rest, **released to false on
  unmount from the busy (asking) state** (the can't-get-stuck guarantee), and e2e
  idle→done fires `onDone` while never reporting busy. 3/3.
- `deckA9.test.tsx` — **A4 is not a dead end**: mounts A4 in the `DeckPlayer` and
  asserts a granted mic advances the cursor past it. (The rest of the
  flag-forced-on Deck-A suite — back-law at 9, resume clamp, skip — lands with the
  `TUTORIAL_TOTAL 6→9` unit.)

**Not touched (Ruling #8 mute/bell assertion retirement — deferred, see below).**

## 5. Judgement call → ruled (Ruling #8 AMENDED)

Ruling #8 said to retire the **mute-gate + bell** assertions. I did NOT delete them
in this unit: those assertions still *fit* `TutorialV2`, which is still the live
tutorial and still has सो जाओ/जागो + the नई बुकिंग bell. Deleting an assertion that
still describes live code would remove protection for something that still exists.

**Isj ruled the call correct and made it doctrine (2026-07-22):** the retirement is
**CONDITIONAL — it happens at the flag flip, not now**, as a named step in the flip
checklist (`STEP: FLIP THE FLAG` step 3, tutorial-merge-gate.md), so it fires exactly
when `TutorialV2` stops being live. See CONFLICT_RULINGS #8 (Shipped / amended).

## 6. Verification

- `tsc --noEmit` — clean (MicPracticeArtboard assignable to `React.FC<DeckArtboardProps>`; no dangling refs to any removed symbol).
- tutorial/mic/deck suite — 21/21; merge-gate flag guard — 3/3; onboarding + register/noRoman — 21/21.
