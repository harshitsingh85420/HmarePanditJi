# PRODUCTION CLEANUP — SQL for Isj (Neon web console). Nothing here has been run.

> 🔴 **CANONICAL. Run from this file, never from a chat message.**
>
> Two versions of this destructive script were in circulation and they were not
> the same. The chat paste had been corrected mid-conversation; **this file was
> not**, and it carried EIGHT broken references that the chat copy had already
> fixed:
>
> | # | was | truth |
> |---|---|---|
> | 1-3 | `p."aadhaarNumber"` ×3 | **no such column.** Every block would have failed with `column p.aadhaarNumber does not exist` |
> | 4-5 | `PoojaVerification."panditId"`, `PujaService."panditId"` | the column is **`panditProfileId`** on both |
> | 6 | `Review r WHERE r."revieweeId" = p.id` | `revieweeId` is a **User** id (real FK) → `p."userId"` |
> | 7 | `id NOT IN (SELECT "revieweeId" FROM "Review")` | same — compared a profile id against a user id |
> | 8 | `DELETE FROM "Review" WHERE "revieweeId" IN (profile ids)` | same |
>
> A non-runnable production-delete script sitting in `docs/` is a trap for the
> next reader. The spare list is now GENERATED from `DELETION_SPARE_COLUMNS` in
> `packages/types/src/verification.ts` rather than hand-typed, so it cannot drift
> from the queue's definition again.
>
> **There is no "must show 18" gate.** That number was never measured — the query
> that would have produced it could not run. The real gate is: *every row listed
> is one you recognise as your own test debris, and Tanya is not among them.*

---

## 🔴 ORDER MATTERS — rewritten 2026-07-31 after §1 MEASURED production

**§1 ran: 24 rows, ZERO VERIFIED, zero ratings.** `GET /pandits` defaults its
filter to `VERIFIED` (`pandit.controller.ts:127,132`), so the customer search
is **ALREADY EMPTY in production, today** — not something §2 would cause.
Nothing here "empties" anything; the emptiness is the current, measured state.
The ops screen — and the widened queue, when Isj ships it — is not a recovery
mechanism any more. **It is the ONLY path to a first honest VERIFIED**, and to
a customer search that shows anyone at all.

1. **§1** — look (read-only). ✅ RAN 2026-07-31 — 24 rows.
2. **§1b / §1c / §5 / §6** — the read-only sitting, any order.
3. **§3** — delete the debris.
4. **§2** — see its banner: measured no-op on the VERIFIED/ratings columns.
5. Verify one pandit **through the ops screen** — the FIRST honest VERIFIED.
   ⚠️ It must not be the fixture probe — see the warning at §3.

---

## §1 · LOOK FIRST — read-only

```sql
SELECT p.id,
       COALESCE(u.name, '(name NULL)') AS name,
       u.phone,
       p."verificationStatus",
       p."verifiedById",
       p."verifiedAt",
       p.rating,
       p."totalReviews",
       p."createdAt"::date AS created,
       -- Review.revieweeId is a USER id (real FK to "User"), so this joins on userId.
       (SELECT count(*) FROM "Review"            r  WHERE r."revieweeId"      = p."userId") AS real_reviews,
       (SELECT count(*) FROM "Booking"           b  WHERE b."panditId"        = p.id)       AS bookings,
       (SELECT count(*) FROM "Payout"            o  WHERE o."panditId"        = p.id)       AS payouts,
       (SELECT count(*) FROM "PoojaVerification" pv WHERE pv."panditProfileId" = p.id)      AS poojas,
       (SELECT count(*) FROM "PujaService"       s  WHERE s."panditProfileId"  = p.id)      AS services,
       (p."aadhaarFrontUrl" IS NOT NULL
         OR p."aadhaarBackUrl" IS NOT NULL
         OR p."aadhaarDocUrl"  IS NOT NULL
         OR p."videoKycUrl"    IS NOT NULL)  AS has_documents,
       (p."aadhaarEncrypted" IS NOT NULL)    AS has_aadhaar_number,
       (p."bankAccountNumber" IS NOT NULL)   AS has_bank
FROM "PanditProfile" p
LEFT JOIN "User" u ON u.id = p."userId"
ORDER BY bookings DESC, has_documents DESC, name;
```

**Tanya must show `has_documents = true`.** If she does not, stop and send me the row.

## §1b · Exactly what §3 will delete

```sql
SELECT COALESCE(u.name, '(name NULL)') AS name, u.phone, p."verificationStatus",
       p."createdAt"::date AS created
FROM "PanditProfile" p
LEFT JOIN "User" u ON u.id = p."userId"
WHERE (SELECT count(*) FROM "Booking" b WHERE b."panditId" = p.id) = 0
  AND (SELECT count(*) FROM "Payout"  o WHERE o."panditId" = p.id) = 0
  AND (SELECT count(*) FROM "Booking" b2 WHERE b2."customerId" = p."userId") = 0
  AND (SELECT count(*) FROM "BookingStatusUpdate" bs WHERE bs."updatedById" = p."userId") = 0
  -- @generated DELETION_SPARE_COLUMNS
  AND p."aadhaarFrontUrl"   IS NULL
  AND p."aadhaarBackUrl"    IS NULL
  AND p."aadhaarDocUrl"     IS NULL
  AND p."videoKycUrl"       IS NULL
  AND p."aadhaarLastFour"   IS NULL
  AND p."aadhaarEncrypted"  IS NULL
  AND p."bankAccountNumber" IS NULL
  -- @end
  AND (u.phone IS NULL OR u.phone NOT LIKE '+91987654321%')
ORDER BY name;
```

Every row should be recognisably your own test debris. **A lower count than you
expect is correct behaviour**, not a failure — each spare column can only remove
rows from the delete set.

## §1c · EVERY PoojaVerification ROW — read-only, decides what §3 takes

A `PoojaVerification` does **not** protect its parent profile: the spare list
guards identity data on `PanditProfile`, and §3 deletes a debris profile's
verifications as children (its very first DELETE). If the pooja queue's only
row hangs off a debris profile, §3 takes it. This listing shows every row with
`parent_in_debris` — **true means §3 will delete it with its parent.** Was
quoted in chat only until 2026-07-31; chat-only is exactly how the last
divergence started, so it lives here now.

```sql
SELECT pv.id,
       pv."poojaType",
       pv."poojaName",
       pv.status,
       pv.version,
       pv."createdAt"::date AS created,
       p.id AS profile_id,
       COALESCE(u.name, '(name NULL)') AS pandit_name,
       u.phone,
       p."verificationStatus" AS parent_identity_status,
       ((SELECT count(*) FROM "Booking" b WHERE b."panditId" = p.id) = 0
        AND (SELECT count(*) FROM "Payout" o WHERE o."panditId" = p.id) = 0
        AND (SELECT count(*) FROM "Booking" b2 WHERE b2."customerId" = p."userId") = 0
        AND (SELECT count(*) FROM "BookingStatusUpdate" bs WHERE bs."updatedById" = p."userId") = 0
        -- @generated DELETION_SPARE_COLUMNS
        AND p."aadhaarFrontUrl"   IS NULL
        AND p."aadhaarBackUrl"    IS NULL
        AND p."aadhaarDocUrl"     IS NULL
        AND p."videoKycUrl"       IS NULL
        AND p."aadhaarLastFour"   IS NULL
        AND p."aadhaarEncrypted"  IS NULL
        AND p."bankAccountNumber" IS NULL
        -- @end
        AND (u.phone IS NULL OR u.phone NOT LIKE '+91987654321%')) AS parent_in_debris
FROM "PoojaVerification" pv
JOIN "PanditProfile" p ON p.id = pv."panditProfileId"
LEFT JOIN "User" u ON u.id = p."userId"
ORDER BY pv."createdAt";
```

> The debris predicate here is the SAME `@generated` block as §1b/§3 — it
> regenerates from `DELETION_SPARE_COLUMNS` and the guard diffs it, so this
> preview cannot drift from the delete it previews.

> 🔴 **RAN 2026-07-31 — the real finding INVERTED the expectation.** This
> section was written to check whether the probe's rows were queue-eligible
> survivors. The measure: three rows exist; the probe's two are **APPROVED**
> (07-17, 07-20) — not queue-eligible at all — and the ONLY PENDING row (the
> only thing a review queue would show) belongs to **टेस्ट पंडित,
> `parent_in_debris = true`**. §3 deletes it and the pooja queue opens EMPTY.
>
> **HELD — Isj is ruling between:** spare टेस्ट पंडित · delete and accept an
> empty queue · delete and refill via a real fresh-pandit walk from the
> pandit app. Nothing moves until his word.

**§1c-2 · PoojaConfig on the debris (read-only)** — the table §3's first
version omitted (the 23001 abort). Born 2026-07-15 (`156c1eb`, the सत्यापन
spine): per-puja teamSize/dakshina/supplyMode written by the पूजा जोड़ें
wizard's config step. At least one debris profile HAS rows — proven by the
RESTRICT failure itself. This counts them:

```sql
SELECT COALESCE(u.name, '(name NULL)') AS name, count(pc.id) AS pooja_configs
FROM "PanditProfile" p
LEFT JOIN "User" u ON u.id = p."userId"
JOIN "PoojaConfig" pc ON pc."panditProfileId" = p.id
GROUP BY u.name
ORDER BY pooja_configs DESC;
```

---

## §3 · DELETE THE DEBRIS

**Spares:** anything with a booking or payout, anything with any trace of
identity data (documents, Aadhaar number, or bank), and the five seeded pandits
(phone pattern `+91987654321%` — §1 confirmed all five: …210/211/212/213/214).

> 🔴 **THE PROBE'S SPARE RATIONALE WAS FALSE — corrected 2026-07-31.**
> This doc spared `cmrkbqm4p0002v5r4rxp5kx50` (+919876500050) because "three
> July bookings hang off it." **§1 measures bookings=0** — and the reason is in
> this folder: `prod-bookings-2026-07-28.json`'s own preservation note records
> that the production Booking table was **emptied on 2026-07-28**, that file
> being the only surviving copy of the nine rows. The rationale was a stale
> measurement carried into a 07-30 doc two days after the same console emptied
> the table. Whether the three July rows (n7–n9; n7–n8 produced by
> `stage-pilot-fixtures.mjs`) ever pointed at THIS profile is **UNKNOWN — the
> export carries no panditId column**.
>
> **The true spare, today:** the probe survives §3 only on `has_documents=true`
> (the identity-data spare). There is no id-list spare and its phone does not
> match the seed pattern.
>
> ⚠️ **WIDENED-QUEUE WARNING.** This profile is **FIXTURE-ORIGIN** (July-14
> script), carries identity documents and **2 PoojaVerification rows**, and
> will appear in the widened queue **looking exactly like a real submission**.
> **It must never be the first honest VERIFIED.** The first VERIFIED sets the
> precedent for what the ops screen vouches for — vouching first for a fixture
> would re-found the platform's trust claim on fabricated identity, the exact
> class this whole cleanup exists to end.

```sql
BEGIN;

CREATE TEMP TABLE debris AS
SELECT p.id AS profile_id, p."userId" AS user_id
FROM "PanditProfile" p
LEFT JOIN "User" u ON u.id = p."userId"
WHERE (SELECT count(*) FROM "Booking" b WHERE b."panditId" = p.id) = 0
  AND (SELECT count(*) FROM "Payout"  o WHERE o."panditId" = p.id) = 0
  AND (SELECT count(*) FROM "Booking" b2 WHERE b2."customerId" = p."userId") = 0
  AND (SELECT count(*) FROM "BookingStatusUpdate" bs WHERE bs."updatedById" = p."userId") = 0
  -- @generated DELETION_SPARE_COLUMNS
  AND p."aadhaarFrontUrl"   IS NULL
  AND p."aadhaarBackUrl"    IS NULL
  AND p."aadhaarDocUrl"     IS NULL
  AND p."videoKycUrl"       IS NULL
  AND p."aadhaarLastFour"   IS NULL
  AND p."aadhaarEncrypted"  IS NULL
  AND p."bankAccountNumber" IS NULL
  -- @end
  AND (u.phone IS NULL OR u.phone NOT LIKE '+91987654321%');

SELECT count(*) AS will_delete FROM debris;

-- ═══ CHILD DELETES — REGENERATED FROM THE SCHEMA'S FK MAP, 2026-07-31 ═══
-- The first version hand-listed nine children with the comment "column names
-- verified against schema.prisma" — which verified that what was WRITTEN
-- exists, never that what EXISTS was written. §3 RAN and failed on
-- PoojaConfig_panditProfileId_fkey (RESTRICT, 23001): PoojaConfig was not on
-- the list. FAIL-BY-OMISSION. This block is now derived from every @relation
-- targeting PanditProfile or User, and sqlFkCompleteness.test.ts diffs it
-- against the schema on every build. Every FK on both targets is
-- Restrict(default) — no Cascade, so any future omission SCREAMS like this
-- one did instead of deleting silently.
-- @generated FK_CHILD_DELETES PanditProfile User
DELETE FROM "PoojaConfig"       WHERE "panditProfileId" IN (SELECT profile_id FROM debris);
DELETE FROM "PoojaVerification" WHERE "panditProfileId" IN (SELECT profile_id FROM debris);
DELETE FROM "PujaService"       WHERE "panditProfileId" IN (SELECT profile_id FROM debris);
DELETE FROM "SamagriPackage"    WHERE "panditId"        IN (SELECT profile_id FROM debris);
DELETE FROM "DakshinaRate"      WHERE "panditId"        IN (SELECT profile_id FROM debris);
DELETE FROM "BlockedDate"       WHERE "panditId"        IN (SELECT profile_id FROM debris);
DELETE FROM "CustomerRating"    WHERE "panditId"        IN (SELECT profile_id FROM debris)
                                   OR "customerId"      IN (SELECT user_id    FROM debris);
DELETE FROM "FavoritePandit"    WHERE "panditId"        IN (SELECT user_id    FROM debris)
                                   OR "customerId"      IN (SELECT user_id    FROM debris);
DELETE FROM "Review"            WHERE "revieweeId"      IN (SELECT user_id    FROM debris)
                                   OR "reviewerId"      IN (SELECT user_id    FROM debris);
DELETE FROM "Notification"      WHERE "userId"          IN (SELECT user_id    FROM debris);
DELETE FROM "FamilyMember"      WHERE "userId"          IN (SELECT user_id    FROM debris);
DELETE FROM "CustomerProfile"   WHERE "userId"          IN (SELECT user_id    FROM debris);
DELETE FROM "PanditProfile"     WHERE id                IN (SELECT profile_id FROM debris);
DELETE FROM "User"              WHERE id                IN (SELECT user_id    FROM debris);
-- RESTRICT SENTINELS — dependents INTENTIONALLY not deleted. If rows exist,
-- the transaction must ABORT (as it did for PoojaConfig) and Isj decides:
-- fk-sentinel: Booking.panditId — the debris predicate requires bookings=0; a row here means the predicate lied
-- fk-sentinel: Payout.panditId — the debris predicate requires payouts=0; same
-- fk-sentinel: Booking.customerId — MONEY, never deleted here; predicate now guarantees zero (customer-side count)
-- fk-sentinel: BookingStatusUpdate.updatedById — audit rows, never deleted here; predicate now guarantees zero
-- @end
COMMIT;
```

---

## §2 · CLEAR THE FABRICATED CLAIMS

> 🔴 **MEASURED NO-OP against CURRENT data (2026-07-31), premise RESOLVED
> from git (same day).** §1 returned 24 rows with `verificationStatus=PENDING,
> verifiedById=null, verifiedAt=null, rating=0, totalReviews=0` on EVERY row.
> The seed **as it stood on 2026-07-08** (`git show e973099:…seed.ts`) DID
> write `VerificationStatus.VERIFIED` for all five pandits, ratings 4.2–4.8,
> totalReviews 8–47, `isVerified: true` — and §6 proves that seed executed
> (favourites dated 07-08). So the fabricated-VERIFIED premise was a correct
> reading of the file that ran; what it missed is that **something cleared
> those columns after 07-08, and that event is unrecorded** — stated plainly,
> not reconstructed. Writes are events; state is now; neither source nor a
> past write can vouch for the present.
>
> The first two UPDATEs match zero rows against current data. The third
> (`User.isVerified`) targets a column §1 did NOT select — **unmeasured**, so
> §2 stays runnable: harmless where it is a no-op, correct where it is not
> (the 07-08 seed set `isVerified: true` for the five pandit users; whether
> THAT survived is equally unmeasured). It no longer empties anything; the
> search is already empty.

```sql
BEGIN;

UPDATE "PanditProfile"
   SET "verificationStatus" = 'PENDING',
       "verifiedById" = NULL,
       "verifiedAt"   = NULL
 WHERE "verificationStatus" = 'VERIFIED';

-- Review.revieweeId is a USER id (real FK), hence the join on p."userId".
UPDATE "PanditProfile" p
   SET rating = 0, "totalReviews" = 0
 WHERE (p.rating > 0 OR p."totalReviews" > 0)
   AND NOT EXISTS (SELECT 1 FROM "Review" r WHERE r."revieweeId" = p."userId");

UPDATE "User"
   SET "isVerified" = false
 WHERE role = 'PANDIT' AND "isVerified" = true;

COMMIT;
```

## §2b · PROPOSED — fabricated APPROVED pooja verifications. 🔴 NOT RULED, DO NOT RUN

> §1 proved zero fabricated VERIFIED — but two fabricated-class **APPROVED**
> PoojaVerification rows exist on the fixture probe while its identity is
> PENDING, and §2's scope is `PanditProfile` + `User.isVerified` only.
> `PoojaVerification.status` is outside every block above. Same
> single-writer reasoning as verifiedSingleWriter: **an APPROVED without an
> author is fabricated by definition.** The one current-code writer
> (`PATCH /admin/pooja-verifications/:id/approve`, admin-gated, born
> 2026-07-15 — before both rows' dates) always stamps `reviewedById` +
> `reviewedAt`, so the precheck decides which world we are in.

**Precheck (read-only) — what the two APPROVED rows actually hold:**

```sql
SELECT pv.id, pv."poojaType", pv.status, pv."reviewedById", pv."reviewedAt",
       pv."consentAt", pv.version, pv."createdAt"
FROM "PoojaVerification" pv
WHERE pv.status = 'APPROVED'
ORDER BY pv."createdAt";
```

- `reviewedById` NULL → written outside the single writer: fabricated,
  §2b below matches them.
- `reviewedById` set → authored (plausibly the campaign's own live-proof
  approvals of 07-17/07-20) — §2b matches zero rows and the question merges
  into the §1c ruling (the probe's disposal).

**The proposed clear — RE-PROPOSED 2026-07-31 as DELETE (waits on Isj):**

> The first proposal here reset APPROVED → PENDING. Isj rejected it, rightly:
> PENDING **is the pooja review queue** — resetting fixture rows would present
> two fabricated submissions as real ones, carrying documents, looking more
> credible than anything genuine. The exact opposite of the goal.
>
> **DELETE over REJECTED, and here is why:** a REJECTED written from the SQL
> console is *itself an unauthored review claim* — same sin as the fabricated
> APPROVED, opposite polarity. Nobody reviewed these videos and found them
> wanting; writing REJECTED would say someone did. DELETE removes the
> fabricated claim without manufacturing a new one, and the rows' parent is
> fixture-origin debris whose whole disposal is already under the §1c ruling.

```sql
BEGIN;
DELETE FROM "PoojaVerification"
 WHERE status = 'APPROVED' AND "reviewedById" IS NULL;
COMMIT;
```

> Scope note: authorless only. If the precheck shows the two rows CARRY an
> author, they are real review acts on a fixture profile — §2b matches zero
> rows and their fate merges entirely into the §1c/टेस्ट पंडित ruling. Lands
> together with that ruling or not at all. 🔴 NOT RULED, DO NOT RUN.

## §4 · VERIFY IT TOOK

```sql
SELECT
  (SELECT count(*) FROM "PanditProfile" WHERE "verificationStatus" = 'VERIFIED')      AS still_verified,
  (SELECT count(*) FROM "PanditProfile" WHERE rating > 0 OR "totalReviews" > 0)       AS fake_ratings_left,
  (SELECT count(*) FROM "User" WHERE role = 'PANDIT' AND "isVerified" = true)         AS user_flags_left,
  (SELECT count(*) FROM "PanditProfile")                                              AS profiles_remaining,
  (SELECT count(*) FROM "Review")                                                     AS reviews;
```

Expect `0, 0, 0, <7 or fewer>, 0` — the five seeded, the probe, and Tanya, all
`PENDING` and waiting in the identity queue.

---

## §5 · THE THIRD INVISIBLE CLASS — read-only count

`submitAadhaar` (voice registration, `kyc.service.ts`) writes `aadhaarLastFour`
and `aadhaarEncrypted` **and nothing else** — no URLs, no status advance. A
pandit who gave his Aadhaar by voice and stopped is permanently `PENDING`,
correctly spared from deletion, and **invisible to the queue forever**. Tanya's
disease through a different door, and by design rather than by accident.

```sql
SELECT p.id, COALESCE(u.name, '(name NULL)') AS name, u.phone, p."createdAt"::date AS created
FROM "PanditProfile" p
LEFT JOIN "User" u ON u.id = p."userId"
WHERE p."verificationStatus" = 'PENDING'
  AND p."aadhaarLastFour" IS NOT NULL
  -- @generated REVIEWABLE_DOCUMENT_COLUMNS
  AND p."aadhaarFrontUrl" IS NULL
  AND p."aadhaarBackUrl"  IS NULL
  AND p."aadhaarDocUrl"   IS NULL
  AND p."videoKycUrl"     IS NULL
  -- @end
ORDER BY p."createdAt";
```

> **This query uses `REVIEWABLE_DOCUMENT_COLUMNS` (4), not `DELETION_SPARE_COLUMNS`
> (7)** — and that difference is the whole point of the class. These rows have
> identity data (`aadhaarLastFour`), so the spare list protects them from §3;
> they have nothing that *renders*, so the queue never shows them. Spared and
> invisible at the same time.

**Zero is a useful answer.** No fix, no schema change, no status writes — this is
a count, so we know how large the class is before deciding anything.

> **PREDICTION, registered before the run (2026-07-31):** §1 showed
> `has_aadhaar_number` (= `aadhaarEncrypted IS NOT NULL`) **false on all 24
> rows**, and `submitAadhaar` writes `aadhaarLastFour` and `aadhaarEncrypted`
> **together**. §5 should therefore return **ZERO**. If it returns rows, §1 and
> §5 contradict each other — lastFour set while encrypted is null, a shape no
> current writer produces — and that contradiction is a FINDING to report, not
> absorb.
>
> ✅ **RAN 2026-07-31 — ZERO. Prediction held.** The third invisible class is
> **known-shape / zero-instances**: real in code, empty in production — do not
> re-derive it. Tanya remains the only queue-invisible profile, and her shape
> is the INVERSE of this class: URLs present, number absent.

---

## §6 · SEEDED FAVOURITES — read-only listing (2026-07-31)

`seed.ts` writes **3 `FavoritePandit` rows directly** (customer1→pandit1,
customer1→pandit2, customer2→pandit1 — correct User-space ids on both sides).
If those rows reached production, a customer sees favourites he never added —
the same fabricated-data class as the seeded VERIFIED statuses and the fake
ratings. **§3 only deletes favourites attached to debris users; rows attached
to surviving users outlive it.** No add-favorite path exists in CURRENT code
(the button was never built — FAV-ADD-BUTTON in the customer backlog); the
origin of any existing row is not recoverable from source. Rows found are
therefore PRESUMED fabricated — presumed, not proven: source cannot vouch
for history.

The `seed_phone` column flags the seed's own number ranges (customers
`+91900000000x`, pandits `+91987654321x`). **If the table is empty, empty is
the answer.** No deletion, no predicate change — Isj looks first.

```sql
SELECT f.id,
       f."createdAt"::date AS created,
       f."customerId",
       COALESCE(c.name, '(name NULL)') AS customer_name,
       c.phone                          AS customer_phone,
       f."panditId",
       COALESCE(p.name, '(name NULL)') AS pandit_name,
       p.phone                          AS pandit_phone,
       (c.phone LIKE '+9190000000%' OR p.phone LIKE '+919876543%') AS seed_phone
FROM "FavoritePandit" f
LEFT JOIN "User" c ON c.id = f."customerId"
LEFT JOIN "User" p ON p.id = f."panditId"
ORDER BY f."createdAt", customer_name;
```

> Column note: the Prisma field is now `panditUserId` (Option A rename), but
> SQL speaks the COLUMN name, which remains `"panditId"` via `@map` — and it
> holds a **User** id here, unlike the five profile-space `panditId` columns.
> The id-space guard checks this fence like every other.
