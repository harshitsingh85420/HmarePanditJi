# SEED AS A RISK SURFACE — full audit of `packages/db/prisma/seed.ts`

**Report only. No fix applied — the control is Isj's ruling.**

Fabricated data has reached production three times, all three on a trust
surface, all three from this one 430-line file. This audits every value it
writes.

---

## WHY GUARDS DID NOT CATCH ANY OF THE THREE

> **Guards verify CONSISTENCY. They cannot verify TRUTH.**

Invented travel prices conserve perfectly. `4.8` is a valid `Float`. A muhurat
window is a well-formed string. Every one of the three passed every check
because nothing a type system or a conservation guard can see was wrong with
them. The only signal that distinguishes them from real data is **provenance**,
and provenance is not a property of the value.

That is why the control has to sit at the boundary — *which database may this
file write to* — and not in a check over the values themselves.

---

## 🔴 CATEGORY (c) — VALUES THAT MAKE A CLAIM

A claim is a value that asserts something about the world: that a person is
qualified, that an authority was consulted, that money moved, that a date is
auspicious. These are the dangerous ones, and there are **more of them than the
two that were fenced**.

| # | Value | Line(s) | The claim it makes | Status |
|---|---|---|---|---|
| 1 | `rating: 4.8 / 4.6 / 4.5 / 4.2 / 4.7` | 59, 74, 86, 98, 110 | *This named person scores 4.8 out of 5* | 🔴 **LIVE, UNFENCED** |
| 2 | `totalReviews: 47 / 23 / 12 / 8 / 15` | 59, 74, 86, 98, 110 | *47 people reviewed him* | 🔴 **LIVE, UNFENCED** |
| 3 | `verificationStatus: VERIFIED` ×5 | 58, 73, 85, 97, 109 | **"A human on our team checked his Aadhaar."** | 🔴 **LIVE, UNFENCED** |
| 4 | `isVerified: true` (User) | 262 | Same claim, second column | 🔴 **LIVE, UNFENCED** |
| 5 | `experienceYears: 15/25/8/5/12` | 59, 74, 86, 98, 110 | *Eighteen years of professional practice* | 🔴 **LIVE, UNFENCED** |
| 6 | `readinessStep: 5`, `isBookingReady: true` | 275-276 | *He completed onboarding and is ready to take work* | 🔴 **LIVE, UNFENCED** |
| 7 | `basePriceMin/Max` on 10 rituals | 168-177 | *A Vivah costs ₹15,000–35,000* — market guidance | 🔴 **LIVE, UNFENCED** |
| 8 | `distanceKm` / `estimatedDriveHours` | 5-14 | *Delhi→Varanasi is 820 km and 14 hours* | 🔴 **LIVE, UNFENCED** |
| 9 | `canBringSamagri` | 272 | *This pandit will bring supplies* | 🔴 **LIVE, UNFENCED** |
| 10 | `DEMO_FOOD_PREFS` — `PURE_VEG`, `dailyAllowance: 1000` | 249-256 | *He requires ₹1,000/day and eats only pure veg* | 🔴 **LIVE, UNFENCED** |
| 11 | `DEMO_TRAVEL_PREFS` — `exclusions: ['NO_NIGHT']` | 241-248 | *He refuses night travel* | 🔴 **LIVE, UNFENCED** |
| 12 | Notification: *"HPJ-001 ka payout ₹2,635 aapke account mein aa gaya hai"* | 400 | **Money reached his bank account** | 🔴 **UNFENCED — and names a booking that does not exist** |
| 13 | Notifications ×4 referencing HPJ-002/006 | 397-399, 401 | Events that did not occur | 🔴 **UNFENCED, same leak** |
| 14 | `source: "Hindu Panchang 2026"` | 196 | **An authority was consulted.** None was | ✅ fenced |
| 15 | `significance: "Shukla Paksha Panchami"` ×20 | 17-46 | Specific tithis on specific dates | ✅ fenced |
| 16 | `timeWindow: "10:30 AM - 12:45 PM"` ×20 | 17-46 | *This window is auspicious* | ✅ fenced |
| 17 | Review: `overallRating: 5.0` + Hindi testimonial | 380-386 | A named customer said this | ✅ fenced |
| 18 | `payoutReference: 'UTR123456'` | 308 | A bank transfer with this UTR occurred | ✅ fenced |
| 19 | 15%-era money literals across 6 bookings | 306-375 | A fee model no code implements | ✅ fenced |
| 20 | `gotra: 'Bharadwaj' / 'Kashyap' / 'Shandilya'` | 51-53 | Lineage of a named person | 🟠 unfenced, low harm |
| 21 | `familyMembers` — Sunita Devi, Arjun + DOBs | 229-230 | Real-looking people with birthdates | 🟠 unfenced, low harm |

**13 of the 21 claim-making values are unfenced.** The two fences cover 6 of
them. The fences caught the instances someone had already been burned by.

### The single worst one is not the rating

**#3 — `verificationStatus: VERIFIED` for five people whose Aadhaar nobody
checked.** It is the product's core trust claim, it is unfenced, it is live, and
the design foundation shipped this week renders it as a green pill reading
**"Identity verified — Aadhaar checked"**. The rating is embarrassing; this one
is a statement about a real person's identity documents.

---

## 🔴 THE SEED IS NOT THE WHOLE MECHANISM

The seed *plants* the rating. **Two read paths are written to prefer it exactly
when reality is empty:**

```ts
// pandit.controller.ts:492-493  — falls back to the seeded literal
avgRating:    aggregations._avg.overallRating ?? pandit.rating ?? 0,
totalReviews: aggregations._count > 0 ? aggregations._count : pandit.totalReviews,

// pandit.routes.ts:1254 — same shape
averageRating: reviews.length > 0 ? (avgSum / reviews.length).toFixed(1)
                                  : parseFloat(panditProfile.rating.toFixed(1)),
```

Against a third path that gets it right:

```ts
// auth.controller.ts:974 — honest
rating: reviewCount > 0 ? Math.round(...) : null,
```

**The `??` and the ternary are not neutral.** They are instructions to show the
fabricated value *precisely in the condition where the true value is "none".*
The seed loads; the fallback fires. Deleting the seed row would not fix these —
they would fall back to `0` or to whatever a future import writes.

**And a fourth instance lives in code with no seed involved:**
`pandit.routes.ts:1256` — `avgResponseTimeMinutes: 45`, hardcoded.

---

## CATEGORY (b) — plausible, would read as real

Pandit names and phones (`Pt. Ramesh Sharma`, `+919876543210`), customer names
and phones, street addresses (`A-42, Sector 62, Noida, UP`), samagri package
prices (₹500–₹4,000), booking numbers `HPJ-001`…`HPJ-006`, dakshina amounts
(₹1,500–₹25,000).

None of these *asserts* anything, but every one of them survives a screenshot
and reads as a real customer. They are why a seeded database is indistinguishable
from a live one at a glance — which is how the third instance went unnoticed.

## CATEGORY (a) — structural fixtures a dev genuinely needs

The admin user; the ten `Ritual` rows' `name` / `nameHindi` / `durationHours`
(this is the canonical ceremony vocabulary, and the eight-key enum other code
matches against); `PackageType` / tier enum values; the cleanup block. These
should keep seeding unconditionally.

Note the split inside one object: a Ritual's **name is category (a)** and its
**basePrice range is category (c)**. Any control at row granularity gets this
wrong — which is the argument against fencing by block.

---

## THE STANDING CONTROL — my recommendation

### Is a per-block fence the right shape? No.

It has already failed, in this same file, three ways:

1. **It requires predicting which block is dangerous.** The prediction was made
   twice and was wrong both times: `rating`/`totalReviews` sat in the pandits
   block, which *must* run, and went unfenced.
2. **The granularity is wrong.** The danger is per-FIELD, not per-block.
   `rating` cannot be fenced without fencing the pandits every dev needs.
3. **The fences leak across blocks.** The notification bodies quote `HPJ-001`
   and `₹2,635` and are **outside** `SEED_BOOKINGS` — the file's own comment
   admits they "will name bookings that do not exist". A fence that its author
   documents as leaking is not a control.
4. **`SEED_MUHURAT=true` is one env var away.** An opt-out that a CI job or a
   hurried operator can set is a speed bump, not a boundary.

### Recommended: refuse to run against a non-local database, and keep the fences beneath it

Two layers, because they answer different questions.

**Layer 1 — the boundary (new).** `seed.ts` refuses to start unless
`DATABASE_URL` points at localhost/127.0.0.1, **fail-closed**: an unparseable or
absent URL refuses too. Override only via an explicit, loud, single-run variable
(`I_UNDERSTAND_THIS_SEEDS_PRODUCTION=…`) that names the host it is allowed to
write to, so the override cannot be set once and forgotten in an environment.

This is the only layer that would have stopped all three instances, because it
does not require anyone to have correctly predicted which value was dangerous.

**Layer 2 — the existing per-block fences, kept.** They remain useful for *local*
work: a developer usually does not want fabricated muhurats in his own database
either. Demoted from "the control" to "a convenience".

**Why not a truth-guard over the values?** Because it cannot exist. There is no
test that distinguishes a real 4.8 from an invented one. The only durable
control is provenance, enforced at the boundary.

### Two things the boundary does NOT fix, and which need their own ruling

- **The `??` fallbacks** (`pandit.controller.ts:492`, `pandit.routes.ts:1254`).
  These show a stored rating *because* there are no reviews. They must return
  null/absent instead, as `auth.controller.ts:974` already does. A boundary on
  the seed does not touch them.
- **The five `VERIFIED` statuses and the ratings already in production.** They
  are live now. Whatever control lands, someone still has to decide what happens
  to the rows that are already there.

---

## SUMMARY

- **21** claim-making values; **13 unfenced**; **8 currently reaching customers**.
- The most serious is **not** the rating — it is `verificationStatus: VERIFIED`
  for five people, rendered as *"Identity verified — Aadhaar checked"*.
- The seed is **half** the mechanism; two API read-paths are written to prefer
  the fabricated value exactly when the real one is absent.
- **Per-block fencing is the wrong shape.** Recommend a fail-closed
  non-local-DATABASE_URL refusal as the control, with the existing fences kept
  underneath as local convenience.
