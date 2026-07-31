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

## 🔴 ORDER MATTERS — read before running anything

`GET /pandits` defaults its filter to `VERIFIED` (`pandit.controller.ts:127,132`),
so **clearing that column empties the customer app's search entirely** — no
pandits, no profiles, no booking. The ops screen is how you come back from it.

1. **§1** — look (read-only).
2. **§3** — delete the debris.
3. **§2** — clear VERIFIED and the fake ratings.
4. Verify one pandit **through the ops screen**, and watch him reappear.

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
  AND p."aadhaarFrontUrl"   IS NULL
  AND p."aadhaarBackUrl"    IS NULL
  AND p."aadhaarDocUrl"     IS NULL
  AND p."videoKycUrl"       IS NULL
  AND p."aadhaarLastFour"   IS NULL
  AND p."aadhaarEncrypted"  IS NULL
  AND p."bankAccountNumber" IS NULL
  AND (u.phone IS NULL OR u.phone NOT LIKE '+91987654321%')
ORDER BY name;
```

Every row should be recognisably your own test debris. **A lower count than you
expect is correct behaviour**, not a failure — each spare column can only remove
rows from the delete set.

---

## §3 · DELETE THE DEBRIS

**Spares:** anything with a booking or payout, anything with any trace of
identity data (documents, Aadhaar number, or bank), the five seeded pandits, and
the probe `cmrkbqm4p0002v5r4rxp5kx50` — three July bookings hang off it and
deleting it would orphan the only record of the July money model.

```sql
BEGIN;

CREATE TEMP TABLE debris AS
SELECT p.id AS profile_id, p."userId" AS user_id
FROM "PanditProfile" p
LEFT JOIN "User" u ON u.id = p."userId"
WHERE (SELECT count(*) FROM "Booking" b WHERE b."panditId" = p.id) = 0
  AND (SELECT count(*) FROM "Payout"  o WHERE o."panditId" = p.id) = 0
  AND p."aadhaarFrontUrl"   IS NULL
  AND p."aadhaarBackUrl"    IS NULL
  AND p."aadhaarDocUrl"     IS NULL
  AND p."videoKycUrl"       IS NULL
  AND p."aadhaarLastFour"   IS NULL
  AND p."aadhaarEncrypted"  IS NULL
  AND p."bankAccountNumber" IS NULL
  AND (u.phone IS NULL OR u.phone NOT LIKE '+91987654321%');

SELECT count(*) AS will_delete FROM debris;

-- children first. Column names verified against schema.prisma:
--   PoojaVerification / PujaService  → panditProfileId
--   SamagriPackage / DakshinaRate / BlockedDate → panditId (a PROFILE id)
--   FavoritePandit / Review / Notification      → USER ids
DELETE FROM "PoojaVerification" WHERE "panditProfileId" IN (SELECT profile_id FROM debris);
DELETE FROM "PujaService"       WHERE "panditProfileId" IN (SELECT profile_id FROM debris);
DELETE FROM "SamagriPackage"    WHERE "panditId"        IN (SELECT profile_id FROM debris);
DELETE FROM "DakshinaRate"      WHERE "panditId"        IN (SELECT profile_id FROM debris);
DELETE FROM "BlockedDate"       WHERE "panditId"        IN (SELECT profile_id FROM debris);
DELETE FROM "FavoritePandit"    WHERE "panditId"        IN (SELECT user_id    FROM debris)
                                   OR "customerId"      IN (SELECT user_id    FROM debris);
DELETE FROM "Review"            WHERE "revieweeId"      IN (SELECT user_id    FROM debris)
                                   OR "reviewerId"      IN (SELECT user_id    FROM debris);
DELETE FROM "Notification"      WHERE "userId"          IN (SELECT user_id    FROM debris);
DELETE FROM "PanditProfile"     WHERE id                IN (SELECT profile_id FROM debris);
DELETE FROM "User"              WHERE id                IN (SELECT user_id    FROM debris);

COMMIT;
```

---

## §2 · CLEAR THE FABRICATED CLAIMS

⚠️ **This empties the live customer search.** Expected; the ops screen restores it.

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
  AND p."aadhaarFrontUrl" IS NULL
  AND p."aadhaarBackUrl"  IS NULL
  AND p."aadhaarDocUrl"   IS NULL
  AND p."videoKycUrl"     IS NULL
ORDER BY p."createdAt";
```

**Zero is a useful answer.** No fix, no schema change, no status writes — this is
a count, so we know how large the class is before deciding anything.
