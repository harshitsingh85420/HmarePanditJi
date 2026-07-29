# PREPARED — widen `PUBLIC_PANDIT_READS`. **NOT SHIPPED.** Awaiting Isj's auth ruling.

Auth/identity is report-only under the standing boundary. Everything below is
ready to apply; nothing here is applied.

## The problem, restated

`services/api/src/app.ts:246` allow-lists exactly one public pandit read. The
blanket preHandler beneath it then applies `authenticate + roleGuard("PANDIT")`
to every other `/pandits*` route:

| route | its own JSDoc | live today |
|---|---|---|
| `GET /pandits` | *"Public list with search + filter"* | **401** |
| `GET /pandits/:id/reviews` | *"Public list of reviews for a specific pandit."* | **401** |
| `GET /pandits/:id` | public | ✅ allow-listed |
| `GET /pandits/:id/availability` | *"Public: check availability."* | **401** |

`roleGuard("PANDIT")` means **a logged-in customer is refused too** — only a
pandit can browse pandits. The customer front door and the guest-mode principle
("पूरा मंच देखिए · खाता बाद में" — see the whole platform, account later) both
depend on the list.

Introduced by `89d7eab` (2026-07-20, *"security(step 2): scoped public read for
GET /pandits/:id only"*). DRIFT-A masked it for nine days.

## 1. The diff

```diff
-const PUBLIC_PANDIT_READS = new Set<string>([`${API_PREFIX}/pandits/:id`]);
+// Every route here is documented "Public" at its own definition in
+// pandit.routes.ts, and each projection is allow-listed and verified free of
+// bank / IFSC / Aadhaar / PAN / UPI. Adding a route here is a SECURITY
+// DECISION: check its projection first, and publicPanditReads.test.ts will
+// fail the build if a route's doc and this list disagree.
+const PUBLIC_PANDIT_READS = new Set<string>([
+  `${API_PREFIX}/pandits`,                    // list  — getPandits
+  `${API_PREFIX}/pandits/:id`,                // detail — already public
+  `${API_PREFIX}/pandits/:id/reviews`,        // reviews — getPanditReviewsHandler
+  `${API_PREFIX}/pandits/:id/availability`,   // availability — getPanditAvailabilityHandler
+]);
```

`isPublicPanditRead` already matches on `request.routeOptions.url` (the route
TEMPLATE, not the concrete URL), so `/pandits/abc123/reviews` resolves to
`/api/v1/pandits/:id/reviews` and matches exactly. No prefix-matching, no
wildcard — a new `/pandits/:id/bank-details` could not be admitted by accident.

## 2. Projection parity — CHECKED, not assumed

The two projections differ, and **the list is the stricter of the two.**

| field group | LIST (`getPandits`, findMany :147) | DETAIL (`findUnique` :279) |
|---|---|---|
| shape | explicit `select:` allow-list | explicit `select:` allow-list |
| bank / IFSC / Aadhaar / PAN / UPI | ✅ absent | ✅ absent |
| **phone** | ✅ **deliberately omitted**, with a comment: *"a directory of every pandit's personal number is not something a search result should hand out. Contact goes through a booking."* | absent |
| `user` relation | narrowed to `{ id, name }` | narrowed to `{ id, name }` |
| nested relations | `pujaServices` narrowed to `{ pujaType, dakshinaAmount, durationHours }` | narrowed |
| `travelPreferences` | **present** (JSON) | absent |

**One thing to note before ruling:** the list selects `travelPreferences`, a
JSON blob (`maxDistanceKm`, `preferredModes`, `selfDriveRatePerKm`). Those are
operational, not personal — but a JSON column is exactly the *"a new key is
public by default"* hazard the detail allow-list was written to close. If the
ruling is yes, consider narrowing or dropping it in the same change.

Live confirmation (`GET /api/v1/pandits?limit=3`, authenticated shape inspected
via the detail route): none of `bankAccountNumber`, `bankIfsc`, `aadhaarNumber`,
`panNumber`, `upiId`, `bankAccountName` appear.

## 3. Reviews — reviewer identity

`getPanditReviewsHandler` does **not** return the raw row. It maps to an
explicit shape:

```ts
{ id, overallRating, comment, createdAt, reviewerName, pujaType }
```

- the include is narrowed to `reviewer: { select: { name: true } }` — **no
  email, no phone, no user id**;
- `isAnonymous` is honoured: `r.isAnonymous ? "Anonymous" : r.reviewer?.name`;
- `pujaType` comes from `booking.eventType` only.

**Nothing beyond a display name is exposed, and anonymity is respected.** Safe
to make public as written. (The known `reviewerAvatar` gap is unrelated and
stays in the zero-execution class — if it is ever implemented it must be
`isAnonymous ? null : avatarUrl`, or it surfaces the photo of a reviewer who
chose anonymity.)

## 4. The guard

`services/api/src/lib/publicPanditReads.test.ts.prepared` — ships **with** the
fix, not before, because it asserts the post-ruling state and would fail today.

It pins the boundary in both directions:
- every route whose JSDoc in `pandit.routes.ts` says **"Public"** must be in
  `PUBLIC_PANDIT_READS` → *the front door cannot be silently re-closed*;
- every route in `PUBLIC_PANDIT_READS` must be documented Public **and** its
  handler's projection must not name a sensitive field → *the list cannot be
  silently widened*.

That second direction matters as much as the first: this incident was a
scoping change that closed a door nobody noticed, and the opposite mistake —
admitting a route with a leaky projection — is the one that costs more.

## Recommendation

**Widen it.** Their own documentation says public, `/pandits/:id` already is,
both projections are allow-listed and verified clean, and reviews respect
anonymity. Today nobody can browse pandits — not a guest, not a logged-in
customer — which makes the customer app's front door and search inoperable and
contradicts the guest-mode promise.
