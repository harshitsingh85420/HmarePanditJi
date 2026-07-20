# Adding a language

The goal is every regional language we can honestly support. "Honestly" is the
whole difficulty, so this is a checklist, not a suggestion.

## The ceiling: voice

This app is voice-first — a pandit who cannot read is expected to be able to
use it. **A language without a real Sarvam TTS voice cannot be enabled.**

Verified support (from the `SarvamLanguageCode` union in
`apps/pandit/src/lib/sarvam-tts.ts`) — 11 languages:

```
hi-IN  bn-IN  ta-IN  te-IN  kn-IN  ml-IN  mr-IN  gu-IN  pa-IN  or-IN  en-IN
```

Anything outside that list has **no voice**. Note that `LANGUAGE_TO_SARVAM_CODE`
currently maps Bhojpuri, Maithili, Sanskrit and Assamese onto `hi-IN` — that is
a Hindi voice reading a non-Hindi UI. It is a fallback, not support, and those
languages stay `enabled: false` until Sarvam ships real voices.

Re-check the union before promising a language to anyone; Sarvam adds voices.

## Steps

1. **Registry row** — `apps/pandit/src/lib/languages.ts`. Add `code`,
   `nativeName` (in its own script, never a transliteration), `englishName`,
   `ttsCode`, and `enabled: false` for now.

2. **Translate** — create `apps/pandit/src/lib/locales/<code>.ts` mirroring
   `hi.ts` key for key. Rules:
   - translate **meaning**, not words; these strings are spoken aloud
   - keep शिष्य's voice: warm, respectful, आप never तू
   - keep the ≤10-words-per-screen discipline
   - money and numbers stay Indian in every locale — `₹`, lakh/crore
     grouping, `toLocaleString("en-IN")`
   - never invent a fact; the FAQ must still match the API's `shishyaFacts`

3. **Native-speaker review** — a fluent speaker reads it *aloud* and confirms
   it sounds like a person, not a manual. This step is not optional and not
   something a model can sign off on.

4. **Enable + guard** — flip `enabled: true` **in the same commit** as the
   locale file. `localeCompleteness.test.ts` fails the build if an enabled
   language is missing any key or has an empty one, so the two must land
   together.

5. **State mapping** — if this language is a state's default, add it to
   `STATE_TO_LANGUAGE`. Detection downgrades to Hindi for anything not
   enabled, so mapping before enabling is harmless.

6. **Voice check** — play several real lines through Sarvam in that language.
   Listen for wrong stress, mangled proper nouns, and English loan-words. If
   it is bad, ship the language **written** with Hindi voice and say so in the
   UI — do not ship bad voice silently.

7. **Layout pass** — the 9 canon screens at 375px with the longest strings.
   Watch for button truncation, two-line labels that were one, and wrapped
   money rows.

## Out of scope: the OTP SMS

The OTP SMS stays **Hindi in every app language** — it is bound to an approved
DLT template. Changing it means a fresh DLT submission and re-approval. See
`OTP_LAUNCH_NOTES.md`.
