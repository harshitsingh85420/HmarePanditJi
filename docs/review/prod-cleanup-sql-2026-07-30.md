# PRODUCTION CLEANUP — SQL for Isj. Report only; nothing here has been run.

## 🔴 DO NOT RUN THE VERIFIED UPDATE YET

**Six VERIFIED rows are exactly the six pandits the public list renders**, and
that is not a coincidence of counts — it is the code:

```ts
// services/api/src/controllers/pandit.controller.ts:127,132
const verificationStatus = query.verificationStatus ? String(query.verificationStatus) : "VERIFIED";
conditions.push({ verificationStatus });
```

`GET /pandits` defaults its filter to `VERIFIED` and pushes it into the `AND`.
So clearing the column **empties the customer app's search entirely**: no
pandits listed, no profile reachable, no booking possible. And with no ops
screen, **there is nothing to re-verify anyone from.** That is an unrecoverable
state reached by one statement.

**Correct order:**

1. Build the ops screen (identity queue + per-pooja queue).
2. *Then* run the clearing SQL below.
3. Verify one pandit properly through the screen, and watch him reappear in the
   customer list.

---

## 1 · SEE WHAT YOU ARE CHANGING — run this first

```sql
SELECT p.id,
       u.name,
       p."verificationStatus",
       p."verifiedById",
       p."verifiedAt",
       p.rating,
       p."totalReviews",
       (SELECT count(*) FROM "Review" r WHERE r."revieweeId" = p.id) AS real_reviews,
       (SELECT count(*) FROM "Booking" b WHERE b."panditId" = p.id)  AS bookings,
       p."createdAt"
FROM "PanditProfile" p
JOIN "User" u ON u.id = p."userId"
ORDER BY p."verificationStatus", u.name;
```

**Note on `real_reviews` — corrected.** My earlier version joined
`Review.revieweeId = PanditProfile.userId`. That is the READER's convention, and
it sits on the wrong side of a writer/reader break this campaign has already
documented: reviews are **written** with `booking.panditId`, which is a
**PanditProfile id**. The table is empty so either spelling returns 0 today, but
the profile id is the correct one and is used above.

## 2 · CLEAR THE FABRICATED CLAIMS — only after the ops screen exists

```sql
BEGIN;

-- identity: nobody marked these, so by Isj's own statement they are false
UPDATE "PanditProfile"
   SET "verificationStatus" = 'PENDING',
       "verifiedById" = NULL,
       "verifiedAt"  = NULL
 WHERE "verificationStatus" = 'VERIFIED';

-- ratings: seeded literals against an empty Review table
UPDATE "PanditProfile"
   SET rating = 0, "totalReviews" = 0
 WHERE ("totalReviews" > 0 OR rating > 0)
   AND id NOT IN (SELECT DISTINCT "revieweeId" FROM "Review");

UPDATE "User"
   SET "isVerified" = false
 WHERE role = 'PANDIT' AND "isVerified" = true;

COMMIT;
```

---

## 3 · QA DEBRIS — 24 profiles, of which 18 are artifacts

### See what each one is

```sql
SELECT p.id,
       COALESCE(u.name, '(name NULL)') AS name,
       u.phone,
       p."verificationStatus",
       p.location,
       p."createdAt",
       (SELECT count(*) FROM "Booking" b            WHERE b."panditId" = p.id) AS bookings,
       (SELECT count(*) FROM "PoojaVerification" pv WHERE pv."panditId" = p.id) AS poojas,
       (SELECT count(*) FROM "PujaService" s        WHERE s."panditId" = p.id) AS services,
       (SELECT count(*) FROM "Payout" po            WHERE po."panditId" = p.id) AS payouts,
       (p."aadhaarNumber" IS NOT NULL)              AS has_aadhaar,
       (p."bankAccountNumber" IS NOT NULL)          AS has_bank
FROM "PanditProfile" p
LEFT JOIN "User" u ON u.id = p."userId"
ORDER BY bookings DESC, p."createdAt";
```

Read it as three groups: **real data** (any bookings, payouts, aadhaar or bank),
**seeded** (the five with `+91987654321x` phones), **debris** (everything else).

### 🔴 What a यजमान would see

Once anyone is VERIFIED again, the customer list renders `user.name` with no
sanity filter. Among the 18 artifacts are **"Wwww"**, **"Lappu Sa sachin"**,
**"arav"**, **"Harshit" ×4**, and **four rows with `name` NULL**. A family
choosing who will conduct their son's Mundan, shown "Wwww" beside a green
*Identity verified* pill, is the entire trust proposition collapsing in one
screenshot. **These matter more than the ratings did.**

Note also: `/pandits` has **no filter on name being non-null or plausible** —
so the NULL-named rows would render as blanks or as "—", depending on the card.

### Cleanup, in FK-dependency order

Delete children before parents, and identify the targets first — **do not run
this against a set you have not eyeballed in the SELECT above.**

```sql
BEGIN;

CREATE TEMP TABLE debris AS
SELECT p.id AS profile_id, p."userId"
FROM "PanditProfile" p
LEFT JOIN "User" u ON u.id = p."userId"
WHERE (SELECT count(*) FROM "Booking" b WHERE b."panditId" = p.id) = 0
  AND (SELECT count(*) FROM "Payout"  o WHERE o."panditId" = p.id) = 0
  AND p."aadhaarNumber" IS NULL
  AND p."bankAccountNumber" IS NULL
  AND (u.phone IS NULL OR u.phone NOT LIKE '+91987654321%');   -- keep the seeded five

SELECT count(*) AS will_delete FROM debris;   -- CHECK THIS NUMBER BEFORE CONTINUING

DELETE FROM "PoojaVerification" WHERE "panditId"   IN (SELECT profile_id FROM debris);
DELETE FROM "PujaService"       WHERE "panditId"   IN (SELECT profile_id FROM debris);
DELETE FROM "SamagriPackage"    WHERE "panditId"   IN (SELECT profile_id FROM debris);
DELETE FROM "DakshinaRate"      WHERE "panditId"   IN (SELECT profile_id FROM debris);
DELETE FROM "BlockedDate"       WHERE "panditId"   IN (SELECT profile_id FROM debris);
DELETE FROM "FavoritePandit"    WHERE "panditId"   IN (SELECT "userId" FROM debris);
DELETE FROM "Review"            WHERE "revieweeId" IN (SELECT profile_id FROM debris);
DELETE FROM "Notification"      WHERE "userId"     IN (SELECT "userId" FROM debris);
DELETE FROM "PanditProfile"     WHERE id           IN (SELECT profile_id FROM debris);
DELETE FROM "User"              WHERE id           IN (SELECT "userId" FROM debris);

COMMIT;
```

**The probe row `cmrkbqm4p0002v5r4rxp5kx50` is deliberately NOT deleted** by that
predicate — it has three bookings attached. Deleting it would orphan
`order_pilot_manual`, `order_notifyproof` and `order_TFefNl2TrhDM3E`, which are
the only evidence of how the July money model behaved. Clear its
`verificationStatus` with the statement in §2 and leave the row.

---

## Summary of what is safe when

| action | safe now? |
|---|---|
| Run the §1 and §3 SELECTs | ✅ yes — read-only |
| Clear ratings (§2, second statement) | ✅ yes — nothing renders a rating any more |
| Clear VERIFIED (§2, first statement) | 🔴 **no — empties the customer app** until the ops screen exists |
| Delete QA debris (§3) | 🟠 after eyeballing `will_delete`, and it is more urgent than the ratings once anyone is verified again |
