# PENDING DIFFS — built, suite-proven, NOT MERGED. Isj rules on each.

Each patch was applied to the working tree, the FULL suite ran green with it
(63 guards + tsc), the diff was captured, and the tree was reverted — so what
Isj reviews is exactly what `git apply` will land. No chat-only diffs; these
files are the artifacts.

## 1 · `widened-queue-2026-07-31.patch` — 🔴 IDENTITY, the only lock

`KYC_REVIEW_QUEUE_WHERE` in packages/types: the submitted statuses OR
(PENDING AND a REVIEWABLE_DOCUMENT_COLUMNS url present) — single-sourced,
deep-pinned against both derivations by kycContract, used at ALL THREE call
sites (queue, stats, badge counter — counter=list law).

State that forces it: seven profiles, all PENDING; only Tanya carries
reviewable documents; the old queue selects DOCUMENTS_SUBMITTED /
VIDEO_KYC_DONE — so there is NO PATH to verify anyone and customer search
(defaulting to VERIFIED) is empty.

⚠️ **STANDING WARNING (also in the constant's doc-comment):** the fixture
probe `cmrkbqm4p0002v5r4rxp5kx50` (+919876500050) is fixture-origin, carries
documents and two APPROVED poojas, and WILL appear in this widened queue
looking like a real submission. **It must never be the first honest
VERIFIED.**

## 2 · `clear-direction-guard-2026-07-31.patch` — verifiedSingleWriter extension

The guard watched only write-to-VERIFIED; the clearing of five seeded
VERIFIED rows went through paths it never looked at. The extension adds a
WRITER REGISTRY: every verificationStatus write — any value, data-form or
assignment-form — must match a registered (file, value) pair; a new clearer
fails by name. Proven: unregistered-clearer control fires; assignment-form
matcher proven on the REQUEST_INFO shape with `where.…` as its clean twin;
231 files scanned, writes-classified count observed.

## 3 · `request-info-stale-stamp-2026-07-31.patch` — admin.controller fix

REJECT / REQUEST_INFO wrote the status but left `verifiedById`/`verifiedAt`
untouched — a profile cleared FROM VERIFIED still carried an approver's name
and timestamp: an authored claim outliving the status it authored. The fix
nulls both in the same non-approve write.

## Apply order when ruled

2 and 3 together (the guard's registry already registers the fixed
controller's shapes); 1 independently. Each: `git apply docs/review/<patch>`,
rebuild types (`pnpm build:pkgs`), run `pnpm --filter @hmarepanditji/api test`.

## 4 · `favorites-reader-fix-2026-07-31.patch` — 🔴 THE P0's READER, ahead of the split

The badge on the LIVE favorites card derives from
`panditProfile.verificationStatus === "VERIFIED"` instead of
`User.isVerified`, and is NAMED: `✓ पहचान`. **DERIVE over drop, the choice
and why:** the identity truth is ALREADY in the favorites payload — the
customer.routes favorites include projects the nested profile's
`verificationStatus` (the page's own TypeScript interface even declared the
field; the author typed the truth into the type and badged from the wrong
column) — and dropping the badge would delete honest information at the
exact moment the ops screen exists to mint the first real VERIFIED. The
named glyph also satisfies the naming law the old badge violated.

**Applying this patch makes the guard's GLYPH_PENDING entry STALE** — the
ratchet fails naming it. Empty the set in the same commit:
`const GLYPH_PENDING = new Set<string>([]);`

**The admin booking-detail reader (admin.controller:691) is deliberately
SEPARATE:** the favorites fix is client-only over an existing payload; the
admin fix changes an API projection contract and its ops consumer, and its
right shape (ops reading verificationStatus directly) rides the split
ruling. Bundling would couple the P0's smallest fix to a projection change.

**Order: this reader fix FIRST, the split second.** The split makes the
column honest; only the reader fix makes the badge honest — and the
fresh-pandit walk must not run before this lands.
