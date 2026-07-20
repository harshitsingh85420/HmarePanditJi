# locales/

`hi.ts` is **canonical**. Every other locale mirrors its key structure exactly.

- `hi.ts` re-exports the live `lib/strings.ts` object. That is deliberate: the
  Hindi strings stay where ~200 call sites already import them from, so this
  refactor adds an addressing layer without a risky mass move.
- A new locale is a file exporting the **same shape**, key for key.
- `localeCompleteness.test.ts` walks every **enabled** language in the registry
  and fails the build on a missing or empty key. The guard exists *before* any
  translation lands, so an incomplete locale can never ship.

Numbers and money stay **Indian in every locale** — `₹`, lakh/crore grouping,
`toLocaleString("en-IN")`. A pandit's earnings must read identically whatever
language the labels are in.

To add a language: `docs/ADDING_A_LANGUAGE.md`.
