# CUSTOMER APP — INVENTORY

**What this is.** A complete list of every screen, every control and every
component in the customer-facing web app (`apps/web`), as it exists in the
code today. It records what is there and what each thing actually does. It
proposes nothing and fixes nothing — the redesign decides what survives.

**Read it cold.** You need no prior knowledge of this repo. Three tables:
navigation (how you get between screens), controls (every button/link and
whether it works), components (the reusable pieces).

---

## HOW THE SCOPE WAS DECIDED

The app has **two source trees** — `apps/web/app/` and `apps/web/src/app/` —
and only the first is wired to URLs. But files under `src/` are still
*imported* by live screens, so they ship. Scoping by folder gets this wrong in
both directions.

Scope here is the **import graph**, computed with `scripts/bundle-scope.mjs`:

```
73 files shipped, reachable from 39 route entries
31 distinct customer-facing URLs
12 of the shipped files live under src/ — not routed, but imported and therefore live
```

The 12 that a folder-scoped audit would miss include `RazorpayCheckout`,
`LoginModal`, `auth-context` and `cart-context` — the payment widget, the
sign-in dialog and both state stores.

**Separately: 93 of the 158 `.tsx` files in `apps/web` are reached by no route
at all.** `apps/web/src/app/` contains an entire second customer app plus
unrouted `pandit/` and `admin/` sections. None of it is served. It is listed at
the end so nobody mistakes it for live code.

### 🔴 RELIABILITY — two groups are UNREFUTED

Every group was traced once and then re-checked by a second, adversarial pass
whose job was to break the first one's findings. **Two of those second passes
died mid-run** (`refute:booking-and-pay` — connection reset;
`refute:dashboard-leaves` — server error mid-response).

So the rows below for these screens carry **single-pass confidence only**:

- `/booking/new`, `/booking/[id]`, `/booking/checkout`,
  `/booking-confirmed/[bookingId]`, `RazorpayCheckout`, `RitualVariationSelection`
- `/dashboard/bookings/[bookingId]/cancel`, `/review`, `/track`,
  `/dashboard/favorites`, `/dashboard/notifications`, `/dashboard/profile`,
  `/dashboard/profile/family`, `/profile`, and the four `dashboard/components/*`

The adversarial pass on the other four groups changed real verdicts, so it is not
ceremonial. **Treat verdicts in the two groups above as provisional** until
re-run. Everything I verified by hand — listed below — is unaffected.

### Hand-verified, independent of the agents

These I opened and confirmed myself, and two I checked against the live site:

- Dashboard sidebar → `/dashboard/family`, `/dashboard/addresses`,
  `/dashboard/payments`: none exist (`DashboardNav.tsx:11-13`).
- "Booking Notifications" / "Travel Updates": bare `<button>`s, no handler, one
  rendered in the ON position (`DashboardNav.tsx:44-53`).
- "Download PDF" → `onAction={() => alert("Downloading receipt...")}`
  (`dashboard/bookings/[bookingId]/page.tsx:282`).
- "Download App" on `/`: `<button>` with no `onClick`/`href` (`page.tsx:605`).
  Positive control: the same pattern finds 9 handlers in that file.
- **Live:** the footer's "For Pandits" and "Admin Portal" serve
  `http://localhost:3002` / `:3003` to real visitors — 12 `localhost`
  occurrences in the deployed HTML.
- **Live:** the WhatsApp share says *"Track booking: https://hmarepanditji.com"*
  — NXDOMAIN, while `hmarepanditji-web.vercel.app` resolves on the same network.

### Method, and its limits

- Scans use `scripts/cgrep.mjs`, which strips comments so commented-out code
  never counts as real.
- Every claim that something is **absent** is paired with a *positive control*:
  a search proving the same method finds the thing elsewhere. Absence claims
  without one were discarded.
- Anything that could not be traced to a handler is marked **UNKNOWN** rather
  than guessed.
- Two tooling hazards were hit and corrected while producing this: Git Bash
  rewrites a leading `/` in an argument (so `"/search"` silently searched a
  filesystem path and returned nothing), and the first navigation extractor
  ignored template-literal links (`` href={`/pandit/${id}`} ``), which made six
  live screens look unreachable. Both are fixed; the counts below are post-fix.

---

## TABLE 1 · NAVIGATION

Every screen, every way out, every way in.

`[DEAD]` on a destination means that route does not exist in the app.

| # | Screen (URL) | Ways OUT — control → destination | Linked in from | Back | Guard / redirect |
|---|---|---|---|---|---|
| 1 | `/` | /search?${params.toString()} (apps/web/app/page.tsx:71)<br>/muhurat?date=${dateStr} (apps/web/app/page.tsx:219)<br>/muhurat (apps/web/app/page.tsx:231)<br>/muhurat (apps/web/app/page.tsx:231)<br>/search (apps/web/app/page.tsx:295)<br>/search (apps/web/app/page.tsx:312)<br>/search (apps/web/app/page.tsx:312)<br>/pandit/${p.id} (apps/web/app/page.tsx:351)<br>_…and 9 more_ | 22 place(s) | browser-back only. No back control on the screen. cgrep "Arr | NONE (no auth guard). But a first-run BLOCKING overlay: showLanguageModal renders fixed in |
| 2 | `/about` | _none found_ | **nothing links here** | Explicit "← Back to Home" -> / in the (legal) group layout ( | NONE. Separately: apps/web/app/sitemap.ts advertises three URLs with NO route in apps/web/ |
| 3 | `/booking-confirmed/[bookingId]` | /dashboard/bookings/${booking.id} (apps/web/app/booking-confirmed/[bookingId]/page.tsx:178) | **nothing links here** | NO explicit back control on the page body. The packages/ui H | No redirect guard, but a silent infinite-loading trap: fetchBooking early-returns at page. |
| 4 | `/booking/[id]` | _none found_ | **nothing links here** | UNKNOWN — the module renders no UI (bare redirect). The visi | redirect(`/bookings/${params.id}`) runs unconditionally (page.tsx:13). No auth guard. The  |
| 5 | `/booking/checkout` | /booking/new (apps/web/app/booking/checkout/page.tsx:9) | **nothing links here** | UNKNOWN — the module renders no UI (bare redirect()). The vi | redirect("/booking/new") runs unconditionally on every render, signed-in or not (page.tsx: |
| 6 | `/booking/new` | _none found_ | 5 place(s) | Two back affordances exist and both have gaps. (1) The wizar | NONE on entry — fully reachable signed-out. Auth is a MODAL at two points only: next() ste |
| 7 | `/cancellation-policy` | _none found_ | 2 place(s) | Explicit "← Back to Home" -> / (apps/web/app/(legal)/layout. | NONE. The refund table is data-driven from apps/web/src/lib/refund-policy, imported at app |
| 8 | `/dashboard` | /dashboard/bookings (apps/web/app/dashboard/page.tsx:4) | 4 place(s) | None — the screen never paints. redirect() runs unconditiona | Unconditional server-side redirect to /dashboard/bookings (apps/web/app/dashboard/page.tsx |
| 9 | `/dashboard/bookings` | /login (apps/web/app/dashboard/bookings/page.tsx:87)<br>/login (apps/web/app/dashboard/bookings/page.tsx:87)<br>/search (apps/web/app/dashboard/bookings/page.tsx:98)<br>/search (apps/web/app/dashboard/bookings/page.tsx:98) | 6 place(s) | No explicit back control on the page. Escape is only via the | NONE — no redirect. When accessToken is falsy the page renders an in-place 🔒 login CTA rat |
| 10 | `/dashboard/bookings/[bookingId]` | /login (apps/web/app/dashboard/bookings/[bookingId]/page.tsx:62)<br>/dashboard/bookings (apps/web/app/dashboard/bookings/[bookingId]/page.tsx:128)<br>/dashboard/bookings (apps/web/app/dashboard/bookings/[bookingId]/page.tsx:128)<br>/pandit/${booking.pandit.id} (apps/web/app/dashboard/bookings/[bookingId]/page.tsx:201)<br>/dashboard/bookings/${booking.id}/track (apps/web/app/dashboard/bookings/[bookingId]/page.tsx:250)<br>/dashboard/bookings/${booking.id}/review (apps/web/app/dashboard/bookings/[bookingId]/page.tsx:255)<br>/dashboard/bookings/${booking.id}/cancel (apps/web/app/dashboard/bookings/[bookingId]/page.tsx:260) | **nothing links here** | Explicit back control: "Back to My Bookings" -> /dashboard/b | Client-side auth guard: once authLoading is false and accessToken is falsy, router.push("/ |
| 11 | `/dashboard/bookings/[bookingId]/cancel` | /dashboard/bookings/${bookingId} (apps/web/app/dashboard/bookings/[bookingId]/cancel/page.tsx:135)<br>/dashboard/bookings/${bookingId} (apps/web/app/dashboard/bookings/[bookingId]/cancel/page.tsx:162) | **nothing links here** | explicit back control: "Go Back" Link with ArrowLeft icon (a | NONE — confirmed and sharpened. No auth guard, no redirect. useAuth() accessToken; when ab |
| 12 | `/dashboard/bookings/[bookingId]/review` | /dashboard/bookings/${bookingId} (apps/web/app/dashboard/bookings/[bookingId]/review/page.tsx:126) | **nothing links here** | CONFIRMED: no explicit back control and no browser-back help | NONE. No auth guard, no redirect. Reads the token straight from localStorage via CUSTOMER_ |
| 13 | `/dashboard/bookings/[bookingId]/track` | /dashboard/bookings/${booking.id} (apps/web/app/dashboard/bookings/[bookingId]/track/page.tsx:144) | **nothing links here** | At the repo's mandated 360×740 mobile profile there is NO in | NONE. No auth guard, no redirect, AND NO STATUS GUARD. If accessToken is missing the fetch |
| 14 | `/dashboard/favorites` | /search (apps/web/app/dashboard/favorites/page.tsx:95)<br>/search (apps/web/app/dashboard/favorites/page.tsx:95)<br>/pandit/${pandit.id} (apps/web/app/dashboard/favorites/page.tsx:169) | **nothing links here** | no in-page back control; the persistent DashboardNav (layout | NONE. No auth guard, no redirect. Token read straight from localStorage (favorites/page.ts |
| 15 | `/dashboard/notifications` | _none found_ | **nothing links here** | no back control. Link is imported (notifications/page.tsx:6) | NONE. No auth guard, no redirect. Token read from localStorage (notifications/page.tsx:40) |
| 16 | `/dashboard/profile` | _none found_ | 6 place(s) | no in-page back control; persistent DashboardNav + browser-b | NONE. No auth guard, no redirect. Token read from localStorage (profile/page.tsx:48); a 40 |
| 17 | `/dashboard/profile/family` | /dashboard/profile (apps/web/app/dashboard/profile/family/page.tsx:169)<br>/dashboard/profile (apps/web/app/dashboard/profile/family/page.tsx:169)<br>/dashboard/profile (apps/web/app/dashboard/profile/family/page.tsx:345)<br>/dashboard/profile (apps/web/app/dashboard/profile/family/page.tsx:345) | **nothing links here** | explicit back control: "Back to Profile" Link with ArrowLeft | NONE. No auth guard, no redirect. Token read from localStorage (family/page.tsx:63); a 401 |
| 18 | `/login` | / (apps/web/app/login/page.tsx:390)<br>/ (apps/web/app/login/page.tsx:390) | 7 place(s) | No explicit back control on the screen. Browser-back only. T | No auth guard — /login is open to everyone. Step pre-seeds to "name" when ?step=name AND l |
| 19 | `/muhurat` | / (apps/web/app/muhurat/page.tsx:49)<br>/ (apps/web/app/muhurat/page.tsx:49)<br>/muhurat (apps/web/app/muhurat/page.tsx:54)<br>/search (apps/web/app/muhurat/page.tsx:55)<br>/search (apps/web/app/muhurat/page.tsx:56)<br>/dashboard (apps/web/app/muhurat/page.tsx:69)<br>/dashboard (apps/web/app/muhurat/page.tsx:69)<br>/muhurat (apps/web/app/muhurat/page.tsx:83)<br>_…and 4 more_ | 10 place(s) | browser-back only. The two ChevronLeft/ChevronRight buttons  | NONE |
| 20 | `/muhurat-explorer` | _none found_ | **nothing links here** | n/a — nothing paints; the redirect throws before render (app | UNCONDITIONAL redirect('/muhurat') on every request (app/muhurat-explorer/page.tsx:4) |
| 21 | `/nri` | / (apps/web/app/nri/page.tsx:22)<br>/ (apps/web/app/nri/page.tsx:22)<br>/search (apps/web/app/nri/page.tsx:27)<br>/search (apps/web/app/nri/page.tsx:27)<br>/muhurat (apps/web/app/nri/page.tsx:28)<br>/muhurat (apps/web/app/nri/page.tsx:28)<br>/nri (apps/web/app/nri/page.tsx:29)<br>/nri (apps/web/app/nri/page.tsx:29)<br>_…and 2 more_ | 2 place(s) | browser-back only; logo returns to / (app/nri/page.tsx:22).  | NONE — the whole $1,069.00 checkout renders for an unauthenticated visitor with no guard.  |
| 22 | `/pandit/[id]` | _none found_ | **nothing links here** | Browser-back only. No back control exists anywhere in the sc | 404 guard, no auth guard. apps/web/app/pandit/[id]/page.tsx:34-36 — `if (!pandit \|\| pand |
| 23 | `/privacy` | _none found_ | 1 place(s) | Explicit "← Back to Home" -> / (apps/web/app/(legal)/layout. | NONE. The page ZERO controls of its own: privacy@hmarepanditji.com is bare prose (apps/web |
| 24 | `/profile` | /dashboard/profile (apps/web/app/profile/page.tsx:4) | **nothing links here** | N/A — the screen has no UI; it is a 5-line server component  | UNCONDITIONAL REDIRECT to /dashboard/profile (apps/web/app/profile/page.tsx:1-5). No auth  |
| 25 | `/search` | _none found_ | 27 place(s) | browser-back only. cgrep "router.back\|arrow_back\|ChevronLe | NONE — guest browsing allowed; GuestStrip renders for guests (search-client.tsx:803). The  |
| 26 | `/stitched` | /screens/${screen}.html  [DEAD] (apps/web/app/stitched/page.tsx:93) | 1 place(s) | No explicit back control. Browser-back only — and the cards  | NONE. An internal design-artefact browser (admin and pandit prototypes included) exposed o |
| 27 | `/stitched/[slug]` | /stitched (apps/web/app/stitched/[slug]/page.tsx:25)<br>/stitched/${screen.slug}/raw (apps/web/app/stitched/[slug]/page.tsx:31) | **nothing links here** | Explicit "All Screens" -> /stitched (apps/web/app/stitched/[ | BROKEN, NOT MERELY UNREACHABLE — and I found a SECOND, INDEPENDENT breakage the prior repo |
| 28 | `/stitched/[slug]/raw` | _none found_ | **nothing links here** | UNKNOWN — a raw HTML document with no chrome; browser-back o | NONE, and it never returns its intended 404: getStitchedScreenHtml (route.ts:11) -> getSti |
| 29 | `/terms` | /cancellation-policy (apps/web/app/(legal)/terms/page.tsx:53) | 1 place(s) | Explicit "← Back to Home" -> / (apps/web/app/(legal)/layout. | NONE. The screen self-declares it is not real: "[LEGAL REVIEW NEEDED] This is a placeholde |
| 30 | `/version` | _none found_ | **nothing links here** | UNKNOWN | UNKNOWN |
| 31 | `/voice-search` | / (apps/web/app/voice-search/page.tsx:17)<br>/ (apps/web/app/voice-search/page.tsx:17)<br>/ (apps/web/app/voice-search/page.tsx:27)<br>/ (apps/web/app/voice-search/page.tsx:27)<br>/search (apps/web/app/voice-search/page.tsx:28)<br>/search (apps/web/app/voice-search/page.tsx:28)<br>/search (apps/web/app/voice-search/page.tsx:29)<br>/search (apps/web/app/voice-search/page.tsx:29)<br>_…and 4 more_ | **nothing links here** | X close icon -> / (app/voice-search/page.tsx:39-41); otherwi | NONE |

### Dead links — a control pointing at a URL the app does not serve

| Destination | Where the link is |
|---|---|
| `/screens/${screen}.html` | `apps/web/app/stitched/page.tsx:93` |
| `/pricing` | `apps/web/components/Footer.tsx:26` |
| `/help` | `apps/web/components/Footer.tsx:34` |

### Screens nothing links to

These exist and would render if you typed the URL, but no control in the app
navigates to them.

- `/about`
- `/booking-confirmed/[bookingId]`
- `/booking/checkout`
- `/dashboard/favorites`
- `/dashboard/notifications`
- `/dashboard/profile/family`
- `/muhurat-explorer`
- `/profile`
- `/stitched/[slug]`
- `/version`
- `/voice-search`

The consequential one is **`/booking-confirmed/[bookingId]`** — the screen a
customer is supposed to land on after paying. Searching the whole app for the
string `booking-confirmed` returns **0 hits**. *Positive control, same tool and
same form:* `search` → 66 hits, `login` → 52, `dashboard/bookings` → 20. The
zero is real.

**Shape of the whole thing: a set of islands.** There is a marketing home, a
search→profile→booking chain, and a dashboard cluster — but the booking chain
does not connect to its own confirmation screen, the dashboard's sidebar points
at three URLs that do not exist, and eleven screens have no inbound link at
all. It is not a tree and it is not a linear flow.

---

## TABLE 2 · EVERY INTERACTIVE CONTROL

Verdicts:

- **works** — has a handler or link, and the target exists
- **dead** — renders, has no handler at all
- **dead-but-looks-live** — looks actionable, cannot work: no handler, a link to
  a nonexistent route, a download of something nothing generates, a share with
  no content, `tel:` with no number
- **unreachable** — the control is fine, but no navigation path reaches its screen
- **UNKNOWN** — could not be traced; stated rather than guessed

| verdict | count |
|---|---|
| works | 378 |
| dead-but-looks-live | 183 |
| unreachable | 47 |
| dead | 9 |
| UNKNOWN | 5 |
| **total** | **622** |

### The rows that matter — dead-but-looks-live

| Screen | Label (verbatim) | Type | Claims | Actually does | Evidence |
|---|---|---|---|---|---|
| /about | 📘 | link | Facebook social link — hover:text-blue-600, one of three siblings. | href="#" — scrolls to top. Source comments it "Placeholders for social links" (:62). | `apps/web/app/(legal)/about/page.tsx:63` |
| /about | 📸 | link | Instagram social link — hover:text-pink-600. | href="#" — no destination. | `apps/web/app/(legal)/about/page.tsx:64` |
| /about | 🐦 | link | Twitter social link — hover:text-blue-400. | href="#" — no destination. | `apps/web/app/(legal)/about/page.tsx:65` |
| /booking-confirmed/[bookingId] | Share on WhatsApp | share | share this confirmed booking to WhatsApp | CLASSIFICATION RULE, stated because the prior pass applied one silently and inconsistently on this screen: on an unreachable screen, controls that are | `apps/web/app/booking-confirmed/[bookingId]/page.tsx:171-173,60-64; fal` |
| /booking-confirmed/[bookingId] | Copy Details | button | copies the booking details to the clipboard | onClick copyDetails (:51-58): navigator?.clipboard?.writeText(txt) with a .catch that only console.warns, then (globalThis).alert?.("Copied to clipboa | `apps/web/app/booking-confirmed/[bookingId]/page.tsx:174-176,51-58` |
| /booking-confirmed/[bookingId] | Find Pandits | link | primary header nav item with a search icon | NOTHING. page.tsx:74 mounts <Header appType="web" /> with no props, so the component falls to its no-LinkComponent branch and renders <button onClick= | `apps/web/app/booking-confirmed/[bookingId]/page.tsx:74; packages/ui/sr` |
| /booking-confirmed/[bookingId] | लॉगिन करें | button | prominent orange login button in the packages/ui header | NOTHING — onClick={onLoginClick} and this page passes no onLoginClick. Worse, isAuthenticated defaults to false (header.tsx:41,136,151), so it is show | `apps/web/app/booking-confirmed/[bookingId]/page.tsx:74; packages/ui/sr` |
| /booking-confirmed/[bookingId] | Rituals | link | header nav item with an auto_awesome icon | NOTHING — identical no-op path; href '/rituals' is also not a route in the known list. | `apps/web/app/booking-confirmed/[bookingId]/page.tsx:74; packages/ui/sr` |
| /booking-confirmed/[bookingId] | My Bookings | link | header navigation to the customer's bookings — the single most likely  | NOTHING — no-op onNavClick. Its href '/bookings' is also not a live route: apps/web/app/bookings does not exist and next.config.js declares no rewrite | `apps/web/app/booking-confirmed/[bookingId]/page.tsx:74; packages/ui/sr` |
| /booking-confirmed/[bookingId] | My Bookings | link | header nav to the customer's bookings — the single most likely tap rig | NOTHING — no-op onNavClick. Its href '/bookings' is also not a live route (apps/web/app has no bookings/ directory; no rewrites in next.config.js or v | `apps/web/app/booking-confirmed/[bookingId]/page.tsx:74; packages/ui/sr` |
| /booking/[id] | (no interactive elements) | other | n/a — the module is a bare server redirect and renders no markup | redirect(`/bookings/${params.id}`) — the destination is not a route in the live app/ tree, and there is no rewrite in next.config.js, no middleware.ts | `apps/web/app/booking/[id]/page.tsx:13; apps/web/app has no bookings/ d` |
| /booking/[id] | (no interactive elements) | other | n/a — the module is a bare server redirect and renders no markup | redirect(`/bookings/${params.id}`) — the destination is not a route in the live app/ tree, so any visitor is redirected into a 404 | `apps/web/app/booking/[id]/page.tsx:13; apps/web/app has no bookings/ d` |
| /booking/new (step 5) | Nirmalya Visarjan | button | 'Eco-friendly floral waste management', '+ ₹500' — presented identical | onClick={() => setAddons(prev => ({ ...prev, visarjan: !prev.visarjan }))} at :1537 flips the icon and adds ₹500 to addonCost (:423), hence to the 'Se | `apps/web/app/booking/new/booking-wizard-client.tsx:1529-1542,423,440; ` |
| /booking/new | Nirmalya Visarjan | button | 'Eco-friendly floral waste management', + ₹500 — presented identically | onClick setAddons({...prev, visarjan: !prev.visarjan}) at :1537 flips the icon and adds ₹500 to addonCost (:423) and therefore to the 'Settled at book | `apps/web/app/booking/new/booking-wizard-client.tsx:1536-1541,423,440; ` |
| /dashboard/bookings/[bookingId] (O | View Profile → | link | Opens the assigned pandit's public profile. | REFUTES THE PRIOR VERDICT OF "works". <Link href={`/pandit/${booking.pandit.id}`}>. The route /pandit/[id] exists, but the ID KIND IS WRONG, so it alw | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:201` |
| /dashboard/bookings/[bookingId] (D | Download PDF | download | Downloads the "Booking Confirmation Receipt", described on the card as | onAction = () => alert("Downloading receipt..."). DocumentCard wires actionText/onAction to a plain <button onClick={onAction}> (DocumentCard.tsx:11-1 | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:277-283 (label :2` |
| /dashboard/bookings/[bookingId] (D | Download PDF | download | Downloads the "Booking Confirmation Receipt", described on the card as | onAction = () => alert("Downloading receipt..."). DocumentCard wires actionText/onAction to a plain <button onClick={onAction}> (DocumentCard.tsx:11-1 | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:277-283 (title :2` |
| /dashboard/bookings/[bookingId] (D | View & Share | share | View AND SHARE the "Puja Completion Certificate". | onAction = () => setShowCompletionModal(true), mounting <PujaCompletionModal>. TWO independent failures, both confirmed. (1) SHARE DOES NOT EXIST: Puj | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:295-302 (label :2` |
| /dashboard/bookings/[bookingId] (D | View & Share | share | View AND SHARE the "Puja Completion Certificate". | onAction = () => setShowCompletionModal(true), which mounts <PujaCompletionModal>. TWO independent failures. (1) SHARE DOES NOT EXIST: the modal impor | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:295-302 (label :2` |
| /dashboard/bookings/[bookingId] (D | View & Share | share | View AND SHARE the "Puja Completion Certificate". | onAction = () => setShowCompletionModal(true), which mounts <PujaCompletionModal>. THREE independent failures, two of them confirmed and one added by  | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:295-302 (title :2` |
| /dashboard/bookings/[bookingId] (D | View Documents | download | Opens the "Travel Tickets & Voucher", described as "Tickets arranged b | onAction = () => alert("Viewing travel docs..."). Same DocumentCard button; no fetch, no navigation, no document. Nor is there any ticket to show: cgr | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:304-312 (label :3` |
| /dashboard/bookings/[bookingId] (D | View Documents | download | Opens the "Travel Tickets & Voucher", described as "Tickets arranged b | onAction = () => alert("Viewing travel docs..."). Same DocumentCard <button>; no fetch, no navigation, no document exists. Rendered only when booking. | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:304-312 (title :3` |
| /dashboard/bookings/[bookingId]/re | Add photos from the puja | input | "Only JPG/PNG up to 5MB." — attach photos from the puja to the review; | NO UPLOAD HAPPENS. onChange calls URL.createObjectURL(f) for each file and stores the resulting blob: URLs in photoUrls (review/page.tsx:249), which a | `apps/web/app/dashboard/bookings/[bookingId]/review/page.tsx:240-253` |
| /dashboard/bookings/[bookingId]/tr | Call Pandit | link | phone the pandit on the day of the ceremony — full-width primary blue  | <a href={telHref(booking.pandit) ?? undefined}>. When telHref returns null (lib/panditIdentity.ts:83-86) React omits the attribute entirely: a solid b | `apps/web/app/dashboard/bookings/[bookingId]/track/page.tsx:122-124` |
| /dashboard/bookings/[bookingId]/tr | Message | link | WhatsApp the pandit | <a href={whatsappHref(booking.pandit) ?? undefined}> — identical absent-href failure (whatsappHref returns null at lib/panditIdentity.ts:89-92), reach | `apps/web/app/dashboard/bookings/[bookingId]/track/page.tsx:125-127` |
| /dashboard/bookings/[bookingId]/tr | Contact Backup Support | button | escalate to human support while the pandit is en route — the emergency | NOTHING. No onClick, no href, no tel:, no mailto:. cgrep 'onClick' over track/page.tsx returns 0 matches in 1 file; the same regex over the sibling re | `apps/web/app/dashboard/bookings/[bookingId]/track/page.tsx:129-131` |
| /dashboard/bookings/[bookingId]/tr | Search route... | input | search/filter the route on the map | NOTHING. Uncontrolled <input> with no value, no onChange, no onKeyDown, no enclosing form. Typing has no effect anywhere. CORRECTION TO PRIOR VERDICT: | `apps/web/app/dashboard/bookings/[bookingId]/track/page.tsx:63` |
| /dashboard/bookings/[bookingId]/tr | search | button | the material-symbol magnifier attached to the route-search box — submi | NOTHING. No onClick, no type=submit, no enclosing form. | `apps/web/app/dashboard/bookings/[bookingId]/track/page.tsx:64` |
| /dashboard/bookings/[bookingId]/tr | add | button | map zoom-in control (white pill, drop shadow, hover colour change to # | NOTHING. No onClick. There is no map SDK on this screen at all — the "map" is a single static background image URL (track/page.tsx:55-58) and the rout | `apps/web/app/dashboard/bookings/[bookingId]/track/page.tsx:69-71` |
| /dashboard/bookings/[bookingId]/tr | remove | button | map zoom-out control | NOTHING. No onClick. | `apps/web/app/dashboard/bookings/[bookingId]/track/page.tsx:72-74` |
| /dashboard/bookings/[bookingId]/tr | my_location | button | recentre the map on me — rendered in the primary blue, the most promin | NOTHING. No onClick. | `apps/web/app/dashboard/bookings/[bookingId]/track/page.tsx:75-77` |
| all /dashboard/* (layout-supplied, | My Family | link | Opens a saved-family-members screen. | <Link href="/dashboard/family">. NO SUCH ROUTE — `ls -R apps/web/app/dashboard` lists exactly bookings/, components/, favorites/, notifications/, prof | `apps/web/app/dashboard/components/DashboardNav.tsx:11 (rendered at :29` |
| EVERY /dashboard/* screen (persist | Saved Addresses | link | sidebar entry with a `location_on` icon — manage saved addresses | next/link href="/dashboard/addresses". ROUTE DOES NOT EXIST (same enumeration). Next.js 404. The API side does exist (services/api/src/routes/customer | `apps/web/app/dashboard/components/DashboardNav.tsx:12` |
| all /dashboard/* (layout-supplied, | Saved Addresses | link | Opens a saved-addresses management screen. | <Link href="/dashboard/addresses">. NO SUCH ROUTE — same recursive directory listing; not in the known route list. 404 on click. | `apps/web/app/dashboard/components/DashboardNav.tsx:12 (rendered at :29` |
| EVERY /dashboard/* screen (persist | Payment Methods | link | sidebar entry with a `payments` icon — manage payment methods | next/link href="/dashboard/payments". ROUTE DOES NOT EXIST. Next.js 404. The prior report saw this line and wrote it off as "outside this scope" — it  | `apps/web/app/dashboard/components/DashboardNav.tsx:13` |
| all /dashboard/* (layout-supplied, | Payment Methods | link | Opens a stored-payment-methods screen. | <Link href="/dashboard/payments">. NO SUCH ROUTE — same listing; not in the known route list. 404 on click. | `apps/web/app/dashboard/components/DashboardNav.tsx:13 (rendered at :29` |
| all /dashboard/* (dashboard layout | Booking Notifications | toggle | A preference switch drawn in the ON position (track bg-[#f29e0d], knob | NOTHING. The <button> carries only className. cgrep 'onClick' over apps/web/app/dashboard returns 29 hits and none is in DashboardNav.tsx, while cgrep | `apps/web/app/dashboard/components/DashboardNav.tsx:43-48 (label :44, b` |
| all /dashboard/* (layout-supplied, | Booking Notifications | toggle | A preference switch rendered in the ON position (track bg-[#f29e0d], k | NOTHING. The <button> carries className only — no onClick, no state, no form, no aria-pressed, no name/value. The ON appearance is hardcoded Tailwind  | `apps/web/app/dashboard/components/DashboardNav.tsx:44-47` |
| EVERY /dashboard/* screen (persist | Booking Notifications | toggle | a preference switch under the "Preferences" heading, rendered in the O | NOTHING. A bare <button> with no onClick, no form, no state. cgrep 'onClick' over DashboardNav.tsx returns 0 matches in 1 file; the same regex over th | `apps/web/app/dashboard/components/DashboardNav.tsx:45-47` |
| all /dashboard/* (dashboard layout | Travel Updates | toggle | A preference switch drawn in the OFF position (track bg-[#393328], kno | NOTHING. Identical shape to the row above: bare <button>, no onClick, no state, no aria-checked, no role="switch". OFF appearance hardcoded. | `apps/web/app/dashboard/components/DashboardNav.tsx:49-54 (label :50, b` |
| all /dashboard/* (layout-supplied, | Travel Updates | toggle | A preference switch rendered in the OFF position (track bg-[#393328],  | NOTHING. Same shape as the row above — a bare <button> with no handler and no state. The OFF appearance is hardcoded. | `apps/web/app/dashboard/components/DashboardNav.tsx:50-53` |
| EVERY /dashboard/* screen (persist | Travel Updates | toggle | companion preference switch, rendered in the OFF state — grey track (b | NOTHING. Bare <button>, no onClick (same 0-match cgrep). Hardcoded OFF. MISSED by the prior report. | `apps/web/app/dashboard/components/DashboardNav.tsx:51-53` |
| /dashboard/bookings/[bookingId] (r | Download PDF | download | Booking Confirmation Receipt — "Auto-generated formal receipt for your | onAction = `alert("Downloading receipt...")`. No file is fetched, generated or saved. There is no `download=` attribute, no window.open/globalThis.ope | `apps/web/app/dashboard/components/DocumentCard.tsx:11 (button) + apps/` |
| /dashboard/bookings/[bookingId] (r | Download PDF | download | Booking Confirmation Receipt — "Auto-generated formal receipt for your | onAction = alert("Downloading receipt..."). No file is fetched, generated or saved. Sweep of tel:\|wa\.me\|mailto:\|download=\|navigator\.share\|windo | `apps/web/app/dashboard/components/DocumentCard.tsx:11 (button) + apps/` |
| /dashboard/bookings/[bookingId] (r | View Documents | download | Travel Tickets & Voucher — "Tickets arranged by platform" | onAction = `alert("Viewing travel docs...")`. No navigation, no fetch, no file. | `apps/web/app/dashboard/components/DocumentCard.tsx:11 (button) + apps/` |
| /dashboard/bookings/[bookingId] (r | View Documents | download | Travel Tickets & Voucher — "Tickets arranged by platform" | onAction = alert("Viewing travel docs..."). No navigation, no fetch, no file. | `apps/web/app/dashboard/components/DocumentCard.tsx:11 (button) + apps/` |
| /dashboard/bookings/[bookingId] (r | View & Share | share | Puja Completion Certificate — view it AND share it | onAction = setShowCompletionModal(true) -> mounts PujaCompletionModal. Two failures. (1) NO SHARE: the modal contains no share affordance — `Share2` i | `apps/web/app/dashboard/components/DocumentCard.tsx:11 + apps/web/app/d` |
| /dashboard/bookings/[bookingId] (r | View & Share | share | Puja Completion Certificate — view it AND share it | onAction = setShowCompletionModal(true) -> mounts PujaCompletionModal. CONFIRMED by reading all 74 lines, two failures. (1) NO SHARE: Share2 is import | `apps/web/app/dashboard/components/DocumentCard.tsx:11 + apps/web/app/d` |
| /dashboard/profile | Manage members | button | opens family-member management | router.push('/dashboard/family') — route does not exist (29-file enumeration of apps/web/app; no not-found.tsx; no catch-all; no rewrites in next.conf | `apps/web/app/dashboard/profile/page.tsx:189-194` |
| /dashboard/profile | edit | button | material-symbol pencil on the "You (name)" family row — edit my own go | router.push('/dashboard/family') — same non-existent route. Next.js 404. | `apps/web/app/dashboard/profile/page.tsx:206-208` |
| /dashboard/profile | Manage All | button | manage all saved addresses | router.push('/dashboard/addresses') — route does not exist. Next.js 404. API side exists (services/api/src/routes/customer.routes.ts:144/167/202/237). | `apps/web/app/dashboard/profile/page.tsx:229` |
| /dashboard/profile | Manage | button | manage payment methods — amber link-button with hover:underline, the o | NOTHING. No onClick (not in the 8-match list for this file). CORRECTION TO PRIOR VERDICT: the prior report graded this "dead" while grading the visual | `apps/web/app/dashboard/profile/page.tsx:257` |
| /dashboard/profile | check_circle | toggle | the material-symbol tick on the "Standard UPI" row is explicitly given | NOTHING. Bare <span> with cursor-pointer and no onClick. | `apps/web/app/dashboard/profile/page.tsx:268` |
| /dashboard/profile | Delete Account | button | Permanently remove your data. — a destructive, irreversible account ac | NOTHING. The <button> carries className, focus:outline-none and the red treatment but no onClick, no form, no href. cgrep 'onClick' over this file ret | `apps/web/app/dashboard/profile/page.tsx:301-311` |
| /muhurat | (ChevronLeft button) | button | Previous month, beside the "December 2024" title | <button className="p-2 hover:bg-slate-100 …"> with no onClick. currentDate is `useState(new Date("2024-12-01"))` with no setter (:11) and the grid is  | `apps/web/app/muhurat/page.tsx:11,117-119` |
| /muhurat | (ChevronLeft button, no text) | button | Previous month — sits immediately beside the 'December 2024' title | <button className="p-2 hover:bg-slate-100 … rounded-full"> with no onClick. currentDate is `useState(new Date("2024-12-01"))` destructured WITHOUT a s | `apps/web/app/muhurat/page.tsx:11,14-31,115,117-119` |
| /muhurat | (ChevronRight button) | button | Next month | No onClick; same as above | `apps/web/app/muhurat/page.tsx:120-122` |
| /muhurat | (ChevronRight button, no text) | button | Next month | No onClick; same as above | `apps/web/app/muhurat/page.tsx:120-122` |
| /muhurat | Week | tab | Switch to week view | <button> with className only; no onClick. There is no week-rendering branch anywhere in the file. | `apps/web/app/muhurat/page.tsx:127` |
| /muhurat | {day number} | card | MISSED BY THE PRIOR INVENTORY. Every ordinary (no-puja) day cell — 25  | <div key={idx} className="… cursor-pointer hover:bg-slate-50 …">{cell.day}</div> — a bare number in a div with no onClick and no Link | `apps/web/app/muhurat/page.tsx:175-179` |
| /muhurat | Search Pandits | link | Find pandits for this specific puja — one per row in 'Puja List for De | Link href=`/search?pujaType=${encodeURIComponent(item.title)}` for all four rows. /search never reads pujaType — apps/web/app/search/page.tsx:12-25 do | `apps/web/app/muhurat/page.tsx:193-199,215-217; apps/web/app/search/pag` |
| /muhurat | View 4 more pujas | button | Expands the list by four more pujas, with an 'expand_more' chevron | <button className="w-full py-4 … hover:bg-slate-200"> with no onClick. The source array at :194-199 has exactly four items and there is no hidden rema | `apps/web/app/muhurat/page.tsx:193-199,222-225` |
| /muhurat | Search Pandits | link | Find pandits for this specific puja (Wedding / Griha Pravesh / Namkara | Link href=`/search?pujaType=${item.title}` (4 instances from the array at :194-199). The search screen reads params.ritual only — cgrep "params\.pujaT | `apps/web/app/muhurat/page.tsx:194-199,215-217; apps/web/src/app/search` |
| /muhurat | View 4 more pujas | button | Expands the puja list (with an expand_more chevron) | <button> with className only; no onClick. The list array has exactly 4 items and no hidden remainder exists. | `apps/web/app/muhurat/page.tsx:194-199,222-225` |
| /muhurat | Detailed View | button | Opens detailed Panchang insights, with a trailing ArrowRight | <button className="… hover:underline"> with no onClick. The Panchang line above it ("Today's Tithi: Shukla Paksha Dashami. Nakshatra: Revati.") is a h | `apps/web/app/muhurat/page.tsx:230-234` |
| /muhurat | Detailed View | button | Opens detailed Panchang insights (with an ArrowRight) | <button> with className only; no onClick. The Panchang text at :231 is a hard-coded string. | `apps/web/app/muhurat/page.tsx:231-234` |
| /muhurat | {n} Pujas | card | A selectable date carrying pujas — the cell is `cursor-pointer` with a | Plain <div> with `cursor-pointer hover:bg-slate-50` and no onClick and no Link wrapper. The right pane is permanently titled 'Puja List for Dec 16' fr | `apps/web/app/muhurat/page.tsx:34-41,160-172,189,193-199` |
| /muhurat | {n} Pujas / {n} Pujas Today (calendar day ce | card | Styled cursor-pointer with a hover state — reads as a selectable date | Plain <div> with className="… cursor-pointer hover:bg-slate-50 …" and no onClick and no Link wrapper. The right pane is permanently titled "Puja List  | `apps/web/app/muhurat/page.tsx:34-41,160-179,189` |
| /muhurat | Astrology | link | An Astrology section of the product, sitting in the primary nav beside | Link href="#" — scrolls to the top of the same page. No astrology route exists in the app. | `apps/web/app/muhurat/page.tsx:57` |
| /muhurat | Search for Pujas or Pandits | input | Header search box with magnifier icon and focus:ring styling | Uncontrolled <input>: no value, no onChange, no name, no form. The whole file has zero onClick and zero onChange. (Also wrapped in a `hidden lg:flex`  | `apps/web/app/muhurat/page.tsx:61-67` |
| /muhurat | (bell icon button, no text) | button | Notifications | <button className="p-2 …"><Bell size={24} /></button> — no onClick. A real /dashboard/notifications route exists (apps/web/app/dashboard/notifications | `apps/web/app/muhurat/page.tsx:68` |
| /muhurat | Spiritual Guide | link | A Spiritual Guide feature, styled identically to the four working side | Link href="#" — no such route exists | `apps/web/app/muhurat/page.tsx:95-98` |
| /nri | Business Class Req. | toggle | Configures 'International Flight Booking' for the pandit; wrapped in a | onChange -> setIncludeFlight(e.target.checked). includeFlight has exactly one reader: its own `checked` prop at :140. It feeds no price, no payload, n | `apps/web/app/nri/page.tsx:12,13,132-144,224-225,237` |
| /nri | Business Class Req. | toggle | Configures "International Flight Booking" for the pandit | onChange -> setIncludeFlight(e.target.checked). includeFlight is read at exactly one place — its own `checked` prop (:140). It feeds no price, no payl | `apps/web/app/nri/page.tsx:13,138-143,225` |
| /nri | Add Travel Package | button | Adds the travel package to the booking | <button className="w-full py-3 bg-[#1a2b4b] … shadow-lg"> with no onClick | `apps/web/app/nri/page.tsx:155-157` |
| /nri | Full Name in India | input | The 'Local Point of Contact' name field of 'Family Coordination in Ind | Uncontrolled <input type="text">: no value, no onChange, no name, no form. Nothing reads it and nothing submits it. | `apps/web/app/nri/page.tsx:176-183` |
| /nri | +91 00000 00000 | input | The 'Contact Number' field for the India-side contact | Uncontrolled <input type="tel">: no value, no onChange, no name, no form. Note this is a tel INPUT, not a tel: link — there is no tel: href on this sc | `apps/web/app/nri/page.tsx:186-193` |
| /nri | Brother | input | The 'Relationship' select (options Brother / Father / Local Organizer) | <select> with no value, no defaultValue, no onChange, no name, no form | `apps/web/app/nri/page.tsx:194-201` |
| /nri | Brother | input | "Relationship" select (Brother / Father / Local Organizer) | <select> with no value, no onChange, no name, no form | `apps/web/app/nri/page.tsx:196-200` |
| /nri | Add Another Contact | button | Adds a second India-side contact row — dashed-border '+' affordance wi | <button className="… border-dashed … hover:border-[#f29e0d]/50"> with no onClick and no array state to push into | `apps/web/app/nri/page.tsx:204-206` |
| /nri | Confirm & Secure Payment | button | Pays the "Total Booking Amount $1,069.00" shown directly above it, bes | <button className="w-full h-14 bg-[#f29e0d] …"> with NO onClick, no form, no fetch. cgrep "onClick" on app/nri/page.tsx returns 0 matches and cgrep "f | `apps/web/app/nri/page.tsx:237,239-243,248-250,259` |
| /nri | Confirm & Secure Payment | button | Pays the 'Total Booking Amount' '$1,069.00' printed immediately above  | <button className="w-full h-14 bg-[#f29e0d] …"> with no onClick, no type, no enclosing <form>, no fetch. I read the whole 295-line file: it contains e | `apps/web/app/nri/page.tsx:248-250 (button); :236-237 ($1,069.00); :239` |
| /nri | Privacy Policy | link | The privacy policy | Link href="#" — jumps to top of page. A real /privacy route exists (app/(legal)/privacy/page.tsx) and is NOT linked here. | `apps/web/app/nri/page.tsx:285` |
| /nri | Privacy Policy | link | The privacy policy | Link href="#" — scrolls to top. A real /privacy route exists at apps/web/app/(legal)/privacy and is not linked here. Worse: the global Footer renders  | `apps/web/app/nri/page.tsx:285; apps/web/components/Footer.tsx:35; apps` |
| /nri | NRI Support Center | link | An NRI support centre — the only support affordance on a $1,069.00 che | Link href="#" — no such route exists anywhere in the app | `apps/web/app/nri/page.tsx:286` |
| /nri | Refund Policy | link | The refund policy | Link href="#". No /refund route exists in the routed app/ tree (the only refund-adjacent route is app/(legal)/cancellation-policy). apps/web/app/sitem | `apps/web/app/nri/page.tsx:287; apps/web/app/sitemap.ts:65,89,95` |
| /nri | Refund Policy | link | The refund policy | Link href="#". No /refund route exists in the app/ tree (only app/(legal)/cancellation-policy). The sitemap advertises ${baseUrl}/refund at app/sitema | `apps/web/app/nri/page.tsx:287; apps/web/app/sitemap.ts:89` |
| /nri | Global Logistics | link | A 'Global Logistics' section, the third entry in a three-entry nav | Link href="/nri" — a self-link to the page you are already on. It is also the ONLY /nri reference in the entire customer app, so it is simultaneously  | `apps/web/app/nri/page.tsx:29` |
| /nri | GBP | tab | Switch pricing to pounds | <button className="… hover:text-[#1a2b4b] …"> with no onClick. Prices are the literals $849.00, $220.00 and $1,069.00 and cannot change. | `apps/web/app/nri/page.tsx:36,221,225,237` |
| /nri | INR | tab | Switch pricing to rupees | <button> with className only; no onClick. Prices are hard-coded USD literals. | `apps/web/app/nri/page.tsx:37,221,225,237` |
| /nri | International Booking | button | Start an international booking — the header's primary saffron CTA with | <button className="hidden sm:flex … bg-[#f29e0d] … shadow-md"> with no onClick anywhere in the file. (Also `hidden sm:flex`, so at 360px it does not r | `apps/web/app/nri/page.tsx:39-42` |
| /nri | Change Date | button | Change the ceremony date (with a calendar_month icon) | <button> with className only; no onClick. The IST/GMT times (10:00 AM / 04:30 AM) are hard-coded strings. | `apps/web/app/nri/page.tsx:94-96,102,110` |
| /nri | Change Date | button | Change the ceremony date, with a 'calendar_month' icon, inside the 'Sm | <button className="… hover:underline"> with no onClick. The two times it appears to control — '10:00 AM' IST and '04:30 AM' GMT, with 'New Delhi, Indi | `apps/web/app/nri/page.tsx:94-96,102-103,110-111` |
| / | 🔶 {count} | link | The section says 'Click any highlighted date to see available pujas' ( | Link href=`/muhurat?date=${dateStr}` wrapping the cell div. /muhurat exists but never reads searchParams and never fetches — it renders a hard-coded D | `apps/web/app/page.tsx:119-122,128,217-222; apps/web/app/muhurat/page.t` |
| / | 🔶 {count} (highlighted calendar day cell) | link | "Click any highlighted date to see available pujas" (page.tsx:167) | Link href=`/muhurat?date=${dateStr}`. /muhurat exists, but app/muhurat/page.tsx never reads searchParams (cgrep "useSearchParams\|fetch(" on that file | `apps/web/app/page.tsx:219; apps/web/app/muhurat/page.tsx:11,34-41` |
| / | Book Now | link | Starts a booking with this specific pandit — it sits inside that pandi | Link href={`/login`} — a template literal with no interpolation, identical on every card, for guests AND signed-in users alike. The pandit id is not c | `apps/web/app/page.tsx:356-361` |
| / | Allow Location | button | The prompt above it reads 'Allow location access to find nearby Pandit | onClick=requestLocation -> navigator.geolocation.getCurrentPosition. The success callback is `() => {…}` — it takes NO position argument (page.tsx:458 | `apps/web/app/page.tsx:534-535 (claim), 547-552 (button), 450-467 (hand` |
| / | Allow Location | button | "Allow location access to find nearby Pandits and improve muhurat accu | onClick=requestLocation -> navigator.geolocation.getCurrentPosition; on success sets a toast string and marks prompted. The coordinates are DISCARDED  | `apps/web/app/page.tsx:547-552, 450-467` |
| / | Download App | button | Downloads the mobile app — rendered as the hero's secondary CTA with a | <button className="… cursor-pointer …"> with no onClick, no href, no form, no store link. There is no HTML download attribute anywhere in apps/web and | `apps/web/app/page.tsx:604-606` |
| / | Explore Now | button | Runs the search the user just typed in the field beside it | onClick=handleSearch (:66-72) reads pujaType/city/date and pushes `/search?${params}`. Those three states are declared at :62-64 and cgrep "setPujaTyp | `apps/web/app/page.tsx:62-64, 66-72, 94-99` |
| / | Wedding | card | A 'Popular Services' tile that filters the pandit list to Wedding | Link href=`/search?pujaType=Wedding`. The search route never reads pujaType: apps/web/app/search/page.tsx:12-25 types searchParams as { ritual, date,  | `apps/web/app/page.tsx:639,646-648; apps/web/app/search/page.tsx:12-25,` |
| / | Wedding | card | Filters the pandit list to Wedding | Link href=`/search?pujaType=Wedding`. The search screen reads only params.ritual (search-client.tsx:568); cgrep "params\.pujaType\|initialParams\.puja | `apps/web/app/page.tsx:639,646-648; apps/web/src/app/search/search-clie` |
| / | Griha Pravesh | card | Filters the pandit list to Griha Pravesh | Link href=`/search?pujaType=Griha%20Pravesh` — pujaType is never read by the search screen (see above). Opens unfiltered. | `apps/web/app/page.tsx:640,646-648` |
| / | Griha Pravesh | card | Filters the pandit list to Griha Pravesh | Link href=`/search?pujaType=Griha%20Pravesh` — pujaType is not in the route's searchParams contract. Opens unfiltered. | `apps/web/app/page.tsx:640,646-648; apps/web/app/search/page.tsx:12-25` |
| / | Satyanarayan | card | Filters the pandit list to Satyanarayan | Link href=`/search?pujaType=Satyanarayan` — param ignored. Opens unfiltered. | `apps/web/app/page.tsx:641,646-648` |
| / | Satyanarayan | card | Filters the pandit list to Satyanarayan | Link href=`/search?pujaType=Satyanarayan` — param ignored. Opens unfiltered. (Note the home page's own SUPPORTED_PUJA_TYPES/PUJA_CATEGORIES constants  | `apps/web/app/page.tsx:641,646-648, 11-30` |
| / | Namkaran | card | Filters the pandit list to Namkaran | Link href=`/search?pujaType=Namkaran` — param ignored. Opens unfiltered. | `apps/web/app/page.tsx:642,646-648` |
| / | Vidhya Arambha | card | Filters the pandit list to Vidhya Arambha | Link href=`/search?pujaType=Vidhya%20Arambha` — param ignored. Opens unfiltered. | `apps/web/app/page.tsx:643,646-648` |
| / | Contact Sales | button | Contact the sales team — the secondary CTA of the closing 'Ready to bo | <button className="… cursor-pointer …"> with no onClick, no href, no mailto:, no tel:, no wa.me. I read the file end to end; there is no handler. Noth | `apps/web/app/page.tsx:741-743` |
| / | Search for Pandits, Pujas, or Muhurats... | input | Free-text search over pandits, pujas and muhurats; carries a magnifier | Uncontrolled <input type="text">: no value, no onChange, no name, no ref, no enclosing form. Nothing in the file reads it, and the sibling 'Explore No | `apps/web/app/page.tsx:78-82` |
| / | Search All India | toggle | A pill switch that broadens the search to all of India | <button className="w-10 h-6 rounded-full … cursor-pointer …"> containing a knob <div className="… absolute left-1 top-1">. No onClick, no state, no ar | `apps/web/app/page.tsx:86-93` |
| / | Search All India | toggle | A switch that broadens the search to all of India | A <button> styled as a pill switch with a knob div; it has className only — no onClick, no state. The knob is absolutely positioned at left-1 and can  | `apps/web/app/page.tsx:87-93` |
| /pandit/[id] | Available | card | A green, cursor-pointer, hover-ringed day cell you tap to start a book | Cannot occur. The cell has a real handler — onClick pushes /booking/new?panditId=..&date=.. when status==="available" (:119-123) — but it is rendered  | `apps/web/app/pandit/[id]/AvailabilityCalendar.tsx:116-127 (fetch :20, ` |
| /pandit/[id] | Watch Intro | button | Plays the pandit's intro video — carries the play_circle material symb | Nothing. No onClick, no href, no modal state; page.tsx is an async server component (page.tsx:31) and contains zero handlers. Also `hidden sm:flex`, s | `apps/web/app/pandit/[id]/page.tsx:200-203` |
| /pandit/[id] | ❤️ | button | Favourite/save this pandit — hover:text-red-500 implies a toggle, and  | Nothing. No onClick, no form action, no fetch anywhere in page.tsx. The whole strip is `hidden md:block` (page.tsx:235), so it never renders on mobile | `apps/web/app/pandit/[id]/page.tsx:238-240` |
| /pandit/[id] | Share Profile | share | Shares this pandit's profile — carries the standard three-node share g | Nothing. A bare <button> with only className (page.tsx:241). CONFIRMED and widened: cgrep 'onClick=\|href=\|role="button"\|onSubmit=\|onChange=' over  | `apps/web/app/pandit/[id]/page.tsx:241-244` |
| /pandit/[id] | Load More Reviews | button | Fetches page 2 of reviews — renders precisely when reviews.length ===  | Nothing. It sits inside `async function ReviewList` (page.tsx:329), a server component, so an onClick could not be attached without a 'use client' bou | `apps/web/app/pandit/[id]/page.tsx:365-369` |
| /voice-search | (large microphone button, no text) | button | The record control. Above it the page states 'Listening...' in saffron | <button className="… hover:scale-105 …"> wrapping lucide <Mic size={54} fill="currentColor" /> with no onClick. The file has exactly one event handler | `apps/web/app/voice-search/page.tsx:48,51-57,61-69,72-76` |
| /voice-search | (microphone button, no text label) | button | The page states "Listening..." above it and shows a live-looking trans | <button className="..."> with a lucide <Mic/> and no onClick. cgrep "onClick" on this file returns exactly 1 match (the language label at :100). No ge | `apps/web/app/voice-search/page.tsx:48,54-56,61-68,73-75` |
| /voice-search | "Kal subah Satyanarayan puja ke liye" | button | A 'Try saying' suggestion chip — tap to run this query | <button className="… hover:bg-[#4a4336] …"> with no onClick | `apps/web/app/voice-search/page.tsx:84-86` |
| /voice-search | "Grah Pravesh muhurat in November" | button | 'Try saying' suggestion chip | <button> with className only; no onClick | `apps/web/app/voice-search/page.tsx:87-89` |
| /voice-search | "Top rated Pandits in South Delhi" | button | 'Try saying' suggestion chip | <button> with className only; no onClick | `apps/web/app/voice-search/page.tsx:90-92` |
| /voice-search | Hindi | toggle | Under the heading 'Voice Settings:' — the speech-recognition language | A <label> with onClick={() => setActiveLang("Hindi")}. The only consumer of activeLang is the dot colour and text colour at :100-101. There is no reco | `apps/web/app/voice-search/page.tsx:96-104` |
| /voice-search | Hindi | toggle | Voice Settings: recognition language | onClick -> setActiveLang("Hindi"); only effect is the dot/text colour at :101. No recognition engine exists to receive it. | `apps/web/app/voice-search/page.tsx:99-103` |
| /voice-search | English | toggle | Voice Settings: recognition language | setActiveLang("English"); colour-only effect | `apps/web/app/voice-search/page.tsx:99-103` |
| /voice-search | Maithili | toggle | Voice Settings: recognition language | setActiveLang("Maithili"); colour-only effect | `apps/web/app/voice-search/page.tsx:99-103` |
| every screen (CartSidebar, mounted | Proceed to Book → | button | The cart's primary orange CTA: take the chosen samagri into the bookin | REFUTES the prior report's "works". handleProceed calls setIsCartOpen(false) FIRST (CartSidebar.tsx:27), then — for a visitor with no token — setRedir | `apps/web/components/CartSidebar.tsx:138-143 (control), :25-40 (handler` |
| every screen (global Footer, mount | Pricing Details | link | Under the "Quick Links" heading, styled identically to "Find a Pandit" | <Link href="/pricing"> to a route that DOES NOT EXIST. There is no apps/web/app/pricing directory and no (legal)/pricing; /pricing is absent from the  | `apps/web/components/Footer.tsx:26` |
| (all screens — global footer) | Pricing Details | link | A pricing page — on a product whose home page headline promises 'Fixed | Link href="/pricing". No such route exists — see absenceClaims. A 404 from the footer of every page of the site. | `apps/web/components/Footer.tsx:26; apps/web/app/page.tsx:588-589` |
| /booking/new and /booking-confirme | Pricing Details | link | a Quick Links footer entry promising the platform's pricing page | <Link href="/pricing"> to a route that DOES NOT EXIST — no pricing directory under apps/web/app or apps/web/src/app, and /pricing is not in the known  | `apps/web/components/Footer.tsx:26; mounted apps/web/app/layout.tsx:6,1` |
| (all screens — global footer) | Help Center | link | A help centre — the only support entry point in the footer, and with t | Link href="/help". No such route exists — see absenceClaims. A 404 from every page. | `apps/web/components/Footer.tsx:34` |
| /booking/new and /booking-confirme | Help Center | link | the first Support footer entry — where a customer with a payment probl | <Link href="/help"> to a route that DOES NOT EXIST (no help directory under apps/web/app or apps/web/src/app; not in the known route list). Hard 404.  | `apps/web/components/Footer.tsx:34; mounted apps/web/app/layout.tsx:6,1` |
| /booking/new and /booking-confirme | Email address | input | newsletter signup field under the heading 'Newsletter' / 'Stay updated | NOTHING. <input type="email" placeholder="Email address"> with NO value, NO onChange, NO name and NO form wrapper (cgrep "onSubmit\|<form" over the wh | `apps/web/components/Footer.tsx:42-47` |
| (all screens — global footer) | Email address | input | Newsletter signup under 'Stay updated with spiritual events and offers | Uncontrolled <input type="email">: no value, no onChange, no name, and no enclosing <form> — the wrapper at :44 is a plain <div className="flex gap-2" | `apps/web/components/Footer.tsx:43-45` |
| (all screens — global footer) | send | button | Submits the newsletter subscription — a filled saffron Material 'send' | <button className="bg-primary text-white p-2 rounded-lg material-symbols-outlined …">send</button> with no onClick, no type="submit", and no surroundi | `apps/web/components/Footer.tsx:44,46` |
| every screen (global Footer) | Email address (placeholder; no visible label | input | Newsletter sign-up field, type="email". | Uncontrolled: no value, no onChange, no name, no ref. Whatever the user types is never read by anything. Pairs with the handler-less send button above | `apps/web/components/Footer.tsx:45` |
| all /dashboard/* (root-layout glob | Newsletter / "Stay updated with spiritual ev | input | A working newsletter sign-up: type your e-mail, press send, get subscr | NOTHING, and it harvests an e-mail address into the void. cgrep 'onClick\|onSubmit\|onChange\|<form' over apps/web/components/Footer.tsx returns 0 mat | `apps/web/components/Footer.tsx:45-46 (heading :42, promise copy :43)` |
| /booking/new and /booking-confirme | send | button | the primary-coloured paper-plane submit button beside the newsletter f | NOTHING — <button className="bg-primary text-white p-2 rounded-lg material-symbols-outlined ...">send</button> with NO onClick and no enclosing <form> | `apps/web/components/Footer.tsx:46` |
| every screen (global Footer) | send (Material Symbol; no text label — the n | button | Sits beside an "Email address" field under the heading "Newsletter" wi | NOTHING. It has no onClick, no type, no form wrapper — the container is a plain <div className="flex gap-2"> at :44. A cgrep for onClick=\|onSubmit=\| | `apps/web/components/Footer.tsx:46 (button), :44 (bare div, no <form>),` |
| /booking/new and /booking-confirme | (three icon-only anchors: public, forum, mai | link | social / contact links in the footer bottom bar | All three are <a href="#"> — they jump to the top of the current page and nothing else. The `mail` glyph in particular reads as a contact link; there  | `apps/web/components/Footer.tsx:58-62` |
| (all screens — global footer) | public (Material icon, no text) | link | A social/website icon in the footer social row | <a href="#"> — jumps to top of page | `apps/web/components/Footer.tsx:59` |
| all /dashboard/* (root-layout glob | (no text — Material Symbols ligature `public | link | Looks like a social/website link. | <a href="#"> — empty fragment href, no onClick. | `apps/web/components/Footer.tsx:59` |
| every screen (global Footer) | public (Material Symbol globe icon, no text) | link | Social/website link in the footer's bottom bar, with hover:text-primar | href="#" — scrolls to top of the current page. MISSED ENTIRELY (the prior report caught the three identical href="#" icons on /about but not the three | `apps/web/components/Footer.tsx:59` |
| (all screens — global footer) | public | link | A website/social icon in the footer's social row (Material 'public' gl | <a className="… hover:text-primary" href="#"> — scrolls to top | `apps/web/components/Footer.tsx:59` |
| (all screens — global footer) | forum (Material icon, no text) | link | A community/forum icon | <a href="#"> — jumps to top of page | `apps/web/components/Footer.tsx:60` |
| all /dashboard/* (root-layout glob | (no text — Material Symbols ligature `forum` | link | Looks like a chat/community/WhatsApp affordance. | <a href="#"> — empty fragment href, no onClick. Not a wa.me link, not a chat launcher. | `apps/web/components/Footer.tsx:60` |
| every screen (global Footer) | forum (Material Symbol chat icon, no text) | link | Social/community link, hover:text-primary. | href="#" — no destination. MISSED ENTIRELY. | `apps/web/components/Footer.tsx:60` |
| (all screens — global footer) | forum | link | A community/forum icon | <a href="#"> — scrolls to top | `apps/web/components/Footer.tsx:60` |
| (all screens — global footer) | mail (Material icon, no text) | link | An email-us icon — the only contact affordance in the footer | <a href="#"> — jumps to top of page. It is NOT a mailto:; cgrep "mailto:" apps/web finds 5 hits, none in Footer.tsx. | `apps/web/components/Footer.tsx:61` |
| all /dashboard/* (root-layout glob | (no text — Material Symbols ligature `mail`, | link | Looks like the e-mail contact affordance — an envelope icon in a foote | <a className="..." href="#">. Empty fragment href: it is NOT a mailto:, has no onClick, and clicking only jumps to the top of the page. This is the ON | `apps/web/components/Footer.tsx:61` |
| every screen (global Footer) | mail (Material Symbol envelope icon, no text | link | An envelope icon reads as "email us". | href="#". It is NOT a mailto: — the app's only mail-shaped global affordance composes nothing. The whole scope contains zero mailto:, and this is the  | `apps/web/components/Footer.tsx:61` |
| (all screens — global footer) | mail | link | An email-us icon — the only contact affordance in the footer | <a href="#"> — scrolls to top. It is NOT a mailto:; the customer app has five mailto: hrefs and none is in Footer.tsx (see absenceClaims). | `apps/web/components/Footer.tsx:61` |
| (all screens — global header) | {first initial of user name} | other | A circular avatar in the top-right of a signed-in header — the univers | A plain <div className="w-9 h-9 rounded-full bg-primary …"> with no onClick, no Link, no role, no aria. There is no account menu anywhere in Header.ts | `apps/web/components/Header.tsx:128-130` |
| (all screens — global header) | {first initial of the user's name} | other | A circular saffron avatar in the top-right of a signed-in header — the | A plain <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm"> with no onClick, no Link, no r | `apps/web/components/Header.tsx:128-130,124,191-202` |
| /search (in-scope component Pandit | देखें | button | Watch this pandit's verification video for the searched pooja, in the  | Two independent reasons it cannot work. (1) It renders only when poojaVideo === "verified" (PanditRecordCard.tsx:183), and the sole live call site har | `apps/web/components/design/PanditRecordCard.tsx:188-196; apps/web/src/` |
| /search (in-scope component Pandit | देखें | button | Watch this pandit's verification video for the searched pooja, in the  | Two independent reasons it cannot work. (1) It renders only when poojaVideo === "verified" (PanditRecordCard.tsx:183), and the sole live call site har | `apps/web/components/design/PanditRecordCard.tsx:188-196; apps/web/src/` |
| /search | Search All India | toggle | Sub-label 'Broaden your search' — search the whole country | onChange -> onChange({searchAllIndia}). It has two purely local effects: it lights the chip 'Search All India: ON' (:732-739) and it un-greys the Regi | `apps/web/src/app/search/search-client.tsx:429-447, 214-231` |
| /search | Search All India | toggle | "Broaden your search" — search the whole country | onChange -> onChange({searchAllIndia}) updates local state and lights the chip "Search All India: ON" (:732-739). fetchPandits (:214-231) never sends  | `apps/web/src/app/search/search-client.tsx:436-446, 214-231` |
| /search | 15+ Years | toggle | Experience filter (radio, name="exp") | onChange -> onChange({experience}). experience is absent from fetchPandits (:214-231). No effect on results. | `apps/web/src/app/search/search-client.tsx:491-507, 214-231` |
| /search | 10+ Years | toggle | Experience filter (radio, default-selected) | Same as above — never sent to the API. | `apps/web/src/app/search/search-client.tsx:491-507, 214-231` |
| /search | 5+ Years | toggle | Experience filter (radio) | Same — never sent to the API. | `apps/web/src/app/search/search-client.tsx:491-507, 214-231` |
| /search | 10+ Years | toggle | Experience filter (radio) — ships pre-selected via defaultFilters (:58 | Same — never sent to the API. The screen therefore opens with an experience filter visibly applied that constrains nothing. | `apps/web/src/app/search/search-client.tsx:491-507,582, 214-231` |
| /search | Update Results | button | Applies the filters chosen in the sidebar | onClick=onApply -> applyFilters -> search(filters,1), a real refetch. But the only three controls in the sidebar (Search All India, Regions, Experienc | `apps/web/src/app/search/search-client.tsx:511-516, 628, 214-231` |
| /search | Update Results | button | Applies the filters chosen in the panel above it | onClick=onApply. In the mobile drawer onApply closes the drawer then calls applyFilters (:666-669); on desktop it is applyFilters directly (:682). app | `apps/web/src/app/search/search-client.tsx:511-516, 628, 666-669, 682, ` |
| /search | Sort by: | input | Re-orders results — Best Match / Rating / Price (Low → High) / Price ( | onChange -> updateFilters({sort}) sets state only. Sorting is server-side (mapSortToApi -> params.set("sort") at :228), and no search() is called on c | `apps/web/src/app/search/search-client.tsx:713-728, 618-620, 228, 726` |
| /search | Sort by: | input | Re-orders the results (Best Match / Rating / Price (Low → High) / Pric | onChange -> updateFilters({sort}) sets state only. Sorting is server-side (mapSortToApi -> params.set("sort") inside fetchPandits) and no search() is  | `apps/web/src/app/search/search-client.tsx:715-727, 618-620, 228` |
| /search | Varanasi (Kashi) | toggle | Region filter under the heading 'Regions Coverage' | onChange updates filters.regions and nothing else — regions is absent from fetchPandits (:214-231). Two corrections to the prior inventory: (a) the wh | `apps/web/src/app/search/search-client.tsx:92,451-457,462-477,578,581, ` |
| /search | Varanasi (Kashi) | toggle | Region filter under "Regions Coverage" | onChange updates filters.regions. fetchPandits never sends regions to the API (:214-231). Checking or unchecking changes nothing in the results. | `apps/web/src/app/search/search-client.tsx:92,462-477, 214-231` |
| /search | Ujjain (Avantika) | toggle | Region filter | Same as Varanasi (Kashi) — also pre-checked at :581, also pointer-events-none by default, also never sent to the API. | `apps/web/src/app/search/search-client.tsx:93,451-457,462-477,581, 214-` |
| /search | Ujjain (Avantika) | toggle | Region filter | Same as above — filters.regions is never sent to the API. | `apps/web/src/app/search/search-client.tsx:93,462-477, 214-231` |
| /search | Haridwar & Rishikesh | toggle | Region filter | onChange updates filters.regions; never sent to the API; pointer-events-none until Search All India is on. | `apps/web/src/app/search/search-client.tsx:94,451-457,462-477, 214-231` |
| /search | Haridwar & Rishikesh | toggle | Region filter | Same as above — never sent to the API. | `apps/web/src/app/search/search-client.tsx:94,462-477, 214-231` |
| /search | Prayagraj | toggle | Region filter | Same — never sent to the API. | `apps/web/src/app/search/search-client.tsx:95,451-457,462-477, 214-231` |
| /search | Prayagraj | toggle | Region filter | Same as above — never sent to the API. | `apps/web/src/app/search/search-client.tsx:95,462-477, 214-231` |
| /search | Mathura | toggle | Region filter | Same — never sent to the API. | `apps/web/src/app/search/search-client.tsx:96,451-457,462-477, 214-231` |
| /search | Mathura | toggle | Region filter | Same as above — never sent to the API. | `apps/web/src/app/search/search-client.tsx:96,462-477, 214-231` |
| /booking/new (step 3) | Don't see your community? Select "Standard V | other | tells a user with no listed community to choose an option named 'Stand | CORRECTION to the prior pass, which claimed the string does not exist at all: 'Standard Vedic' DOES appear in the file — as the DESCRIPTION of the Nor | `apps/web/src/components/booking/RitualVariationSelection.tsx:111 vs th` |
| /booking/new | Don't see your community? Select "Standard V | other | instructs the user to pick an option called 'Standard Vedic' | Nothing — there is no such option. The 14 card labels are exhaustively Delhi Vedic, Punjabi, Bihari / Maithil, UP Brahmin, Tamil Iyer, Telugu Smarta,  | `apps/web/src/components/booking/RitualVariationSelection.tsx:111 vs th` |
| /booking/new (step 3) | Delhi Vedic / Punjabi / Bihari / Maithil / U | card | 14 selectable community-style cards; the step header promises 'Select  | onClick={() => onSelect(v.id)} -> booking-wizard-client.tsx:1253 set({ ritualVariation }). canNext() case 3 requires it (:498), so the wizard cannot a | `apps/web/src/components/booking/RitualVariationSelection.tsx:17-40,51-` |
| /booking/new | Delhi Vedic / Punjabi / Bihari / Maithil / U | card | 14 selectable community-style cards (one row per card, grouped here —  | onClick={() => onSelect(v.id)} -> booking-wizard-client.tsx:1253 set({ ritualVariation }). canNext() case 3 requires it (:498). Sent to the server? NO | `apps/web/src/components/booking/RitualVariationSelection.tsx:76-105; c` |
| /booking/new (SamagriModal, step 4 | Include Fresh Flowers & Fruits | toggle | a styled switch with the subtitle 'Sourced via Blinkit/Zepto integrati | NOTHING BEYOND MOVING ITS OWN KNOB. onChange={() => setIncludeFlowers(!includeFlowers)} at :272. Repo-wide cgrep "includeFlowers" over apps/web return | `apps/web/src/components/samagri/SamagriModal.tsx:257-276 (markup), :11` |
| /booking/new (apps/web/src/compone | Include Fresh Flowers & Fruits | toggle | Sub-label promises "Sourced via Blinkit/Zepto integration" — a third-p | onChange={() => setIncludeFlowers(!includeFlowers)} flips a local boolean and nothing else. `includeFlowers` appears exactly 3 times in the file: decl | `apps/web/src/components/samagri/SamagriModal.tsx:267-275 (control), :1` |
| /booking/new (SamagriModal, step 4 | Select Fixed Package | button | footer CTA under the heading 'Pandit's Choice', sub-line 'Pay ₹8,000'  | onClick={() => onSelect({ type: "package", totalCost: panditTotal, items: [] })} where panditTotal is the module constant 8000 hardcoded at :105. The  | `apps/web/src/components/samagri/SamagriModal.tsx:280-287,105,13,103,19` |

### Everything else

| Screen | Label (verbatim) | Type | Actually does | Verdict | Evidence |
|---|---|---|---|---|---|
| all /dashboard/* (root-layout glob | For Pandits | link | <a href={panditAppUrl} target="_blank" rel="noopener noreferrer"> where panditAppUrl = process.env.NEXT_PUBLIC | UNKNOWN | `apps/web/components/Footer.tsx:4,27 — to resolve I would need the depl` |
| (all screens — global footer) | For Pandits | link | <a href={panditAppUrl} target="_blank" rel="noopener noreferrer">, panditAppUrl = process.env.NEXT_PUBLIC_PAND | UNKNOWN | `apps/web/components/Footer.tsx:4,27; apps/web/.env.local:7; .env.verce` |
| all /dashboard/* (root-layout glob | Admin Portal | link | <a href={adminAppUrl} target="_blank" rel="noopener noreferrer"> where adminAppUrl = process.env.NEXT_PUBLIC_A | UNKNOWN | `apps/web/components/Footer.tsx:5,55 — to resolve I would need the depl` |
| (all screens — global footer) | Admin Portal | link | <a href={adminAppUrl} target="_blank">, adminAppUrl = process.env.NEXT_PUBLIC_ADMIN_URL \|\| "http://localhost | UNKNOWN | `apps/web/components/Footer.tsx:5,55-57; apps/web/.env.local:8; .env.ve` |
| (all screens — global header) | For Pandits | link | <a href={panditAppUrl} target="_blank" rel="noopener noreferrer">, panditAppUrl = process.env.NEXT_PUBLIC_PAND | UNKNOWN | `apps/web/components/Header.tsx:42,48,72-81; apps/web/.env.local:7; .en` |
| /muhurat | Month | tab | <button className="… bg-white … shadow-sm"> with className only; no onClick | dead | `apps/web/app/muhurat/page.tsx:125-126` |
| /muhurat | Month | tab | <button> with className only; no onClick | dead | `apps/web/app/muhurat/page.tsx:126` |
| /muhurat | {n} Pujas Today | card | A <div> with no cursor-pointer, no hover state, no onClick and no Link. Unlike its neighbours it does not adve | dead | `apps/web/app/muhurat/page.tsx:145-157,189` |
| /nri | USD | tab | <button className="… bg-white … shadow-sm"> with className only. The file contains no onClick at all. Every pr | dead | `apps/web/app/nri/page.tsx:34-35,221,225,237` |
| /nri | USD | tab | <button> with className only; cgrep "onClick" on app/nri/page.tsx returns 0 matches. All prices on the page ar | dead | `apps/web/app/nri/page.tsx:35,221,225,237` |
| /booking/new and /booking-confirme | (avatar circle showing the user's initial) | other | NOTHING — a plain <div> with the initial, no onClick, no Link, no menu (Header.tsx:128-130). There is conseque | dead | `apps/web/components/Header.tsx:128-130,122-127,191-202` |
| every screen (AuthModal, mounted a | By continuing, you agree to our Terms of Ser | other | Plain <p> text. No <a>, no <Link>, no onClick. /terms exists in this very app (apps/web/app/(legal)/terms/page | dead | `apps/web/src/components/auth-modal.tsx:394-396` |
| /booking/new (apps/web/src/compone | (modal backdrop, no label) | other | NOTHING. The overlay div at :130 carries no onClick, and the component installs no Escape keydown listener any | dead | `apps/web/src/components/samagri/SamagriModal.tsx:130 (backdrop, no han` |
| /booking-confirmed/[bookingId] | HmarePanditJi | other | NOTHING — it is a plain <div> of two <span>s with no onClick, no href, no Link wrapper and no cursor styling ( | dead | `packages/ui/src/header.tsx:112-122; contrast apps/web/components/Heade` |
| /booking-confirmed/[bookingId] | Share on WhatsApp | share | onClick shareWhatsApp (:60-64) -> (globalThis).open?.(`https://wa.me/?text=${txt}`, "_blank"). No phone number | unreachable | `apps/web/app/booking-confirmed/[bookingId]/page.tsx:171-173,60-64; fal` |
| /booking-confirmed/[bookingId] | View Dashboard | link | <Link href={`/dashboard/bookings/${booking.id}`}> — target route EXISTS (apps/web/app/dashboard/bookings/[book | unreachable | `apps/web/app/booking-confirmed/[bookingId]/page.tsx:178-180` |
| /dashboard/notifications | (TRAVEL-category notification Card — label i | card | router.push(`/dashboard/bookings/${d.bookingId}?tab=itinerary`). THE TARGET NEVER READS tab: the booking-detai | unreachable | `apps/web/app/dashboard/notifications/page.tsx:121 + apps/web/app/dashb` |
| /dashboard/notifications | Mark all as read | button | WOULD work: optimistic setNotifications + PATCH {API_BASE}/notifications/read-all (notifications/page.tsx:87); | unreachable | `apps/web/app/dashboard/notifications/page.tsx:170-178` |
| /dashboard/notifications | (the notification Card itself — label is the | card | WOULD work for BOOKING/STATUS/PAYMENT/REVIEW: handleNotificationClick -> markAsRead + router.push to /dashboar | unreachable | `apps/web/app/dashboard/notifications/page.tsx:197-204 (onClick at :203` |
| /dashboard/notifications | Mark as read | button | WOULD work: onClick -> markAsRead(n.id, e) with preventDefault/stopPropagation, optimistic update + PATCH {API | unreachable | `apps/web/app/dashboard/notifications/page.tsx:225-230` |
| /dashboard/profile/family | Back to Profile | link | WOULD work: next/link to /dashboard/profile, which exists. But nothing in the shipped tree navigates INTO this | unreachable | `apps/web/app/dashboard/profile/family/page.tsx:169-172` |
| /dashboard/profile/family | गोत्र (Gotra): | input | WOULD work: onChange -> setGotraType; "Other" reveals the custom input at :211-217; persisted by PUT /customer | unreachable | `apps/web/app/dashboard/profile/family/page.tsx:202-209` |
| /dashboard/profile/family | Enter your gotra | input | WOULD work: onChange -> setCustomGotra; used as finalGotra at :104. Screen unreachable. | unreachable | `apps/web/app/dashboard/profile/family/page.tsx:212-216` |
| /dashboard/profile/family | कुल देवता (Kul Devata — Family Deity): | input | onChange -> setKulDevata, and it IS sent on save (:115). But it is NEVER read back: fetchFamilyInfo only reads | unreachable | `apps/web/app/dashboard/profile/family/page.tsx:223-228 (control) + :61` |
| /dashboard/profile/family | कुल देवता (Kul Devata — Family Deity): | input | THE VALUE IS DISCARDED BY THE SERVER — stronger than the prior report, which stopped at the client. onChange - | unreachable | `apps/web/app/dashboard/profile/family/page.tsx:223-228 (control) + ser` |
| /dashboard/profile/family | Add Member | button | WOULD work: onClick -> setShowMemberForm(true). Screen unreachable. | unreachable | `apps/web/app/dashboard/profile/family/page.tsx:239-241` |
| /dashboard/profile/family | Name * | input | WOULD work: onChange -> setMemberForm({...,name}); enforced by alert("Name is required") at :136-139. Screen u | unreachable | `apps/web/app/dashboard/profile/family/page.tsx:251` |
| /dashboard/profile/family | Relation * | input | WOULD work: onChange -> setMemberForm({...,relation}). Screen unreachable. | unreachable | `apps/web/app/dashboard/profile/family/page.tsx:255-261` |
| /dashboard/profile/family | Date of Birth (Optional) | input | WOULD work: type=date, onChange -> setMemberForm({...,dob}); serialised to ISO on save (:118) and stored (cust | unreachable | `apps/web/app/dashboard/profile/family/page.tsx:265` |
| /dashboard/profile/family | Nakshatra (Optional) | input | WOULD work: onChange -> setMemberForm({...,nakshatra}); stored at customer.routes.ts:402. Screen unreachable. | unreachable | `apps/web/app/dashboard/profile/family/page.tsx:269-276` |
| /dashboard/profile/family | Rashi / Zodiac (Optional) | input | WOULD work: onChange -> setMemberForm({...,rashi}); stored at customer.routes.ts:403. Screen unreachable. | unreachable | `apps/web/app/dashboard/profile/family/page.tsx:280-287` |
| /dashboard/profile/family | Cancel | button | WOULD work: onClick closes the form, clears editingIndex and resets memberForm. Screen unreachable. | unreachable | `apps/web/app/dashboard/profile/family/page.tsx:292-296` |
| /dashboard/profile/family | Add Member / Update Member | button | WOULD work, but LOCAL ONLY: handleSaveMember mutates the familyMembers array in React state; nothing is persis | unreachable | `apps/web/app/dashboard/profile/family/page.tsx:297-299 + :135-152` |
| /dashboard/profile/family | Edit | button | WOULD work: onClick -> editMember(idx) loads the row into memberForm and opens the form. Screen unreachable. | unreachable | `apps/web/app/dashboard/profile/family/page.tsx:320-322` |
| /dashboard/profile/family | Delete | button | WOULD work, but LOCAL ONLY: confirm("Remove this family member?") then a local array filter (:160-163). No DEL | unreachable | `apps/web/app/dashboard/profile/family/page.tsx:323-325` |
| /dashboard/profile/family | + Add Family Member | button | WOULD work: onClick -> setShowMemberForm(true). Screen unreachable. | unreachable | `apps/web/app/dashboard/profile/family/page.tsx:333-335` |
| /dashboard/profile/family | Cancel & Go Back | link | WOULD work: next/link to /dashboard/profile. Screen unreachable. | unreachable | `apps/web/app/dashboard/profile/family/page.tsx:345-347` |
| /dashboard/profile/family | Save Preferences | button | WOULD PARTIALLY work: handleSaveAll -> PUT {API_BASE}/customers/me/family with {gotra, kulDevata, familyMember | unreachable | `apps/web/app/dashboard/profile/family/page.tsx:348-350` |
| all /dashboard/* (root layout, con | (none rendered — <CartSidebar /> and <AuthMo | other | apps/web/app/layout.tsx:99-100 mount CartSidebar and AuthModal on every route including /dashboard/*. CartSide | unreachable | `apps/web/app/layout.tsx:99-100; apps/web/components/CartSidebar.tsx:23` |
| /stitched/[slug] | All Screens | link | <Link href="/stitched"> — target route exists, but this control never paints: the page awaits getStitchedScree | unreachable | `apps/web/app/stitched/[slug]/page.tsx:24-29; throw at apps/web/app/sti` |
| /stitched/[slug] | All Screens | link | <Link href="/stitched"> — target route exists, but this control never paints: the page awaits getStitchedScree | unreachable | `apps/web/app/stitched/[slug]/page.tsx:24-29; throw at apps/web/app/sti` |
| /stitched/[slug] | Open Raw | link | <Link href={`/stitched/${screen.slug}/raw`} target="_blank"> — never paints (parent page throws), and its targ | unreachable | `apps/web/app/stitched/[slug]/page.tsx:30-37; apps/web/app/stitched/[sl` |
| /stitched/[slug] | (preview iframe, no label; title={screen.dis | other | src={`/stitched/${screen.slug}/raw`}. Never paints (parent throws) AND would be blocked even if it did: apps/w | unreachable | `apps/web/app/stitched/[slug]/page.tsx:42-46; apps/web/next.config.js:3` |
| every screen (CartSidebar) — the l | (LoginModal instance opened by "Proceed to B | other | Never mounts — see the row above. `redirectAfterLogin` is set but the whole subtree is gone by the time React  | unreachable | `apps/web/components/CartSidebar.tsx:162-168, killed by :23` |
| /search | देखें | button | onClick=onWatchVideo -> router.push(`/pandit/${id}#video`) (search-client.tsx:824). The row renders only when  | unreachable | `apps/web/components/design/PanditRecordCard.tsx:183-197; apps/web/src/` |
| UNKNOWN — component has no call si | देखें | button | Never rendered anywhere. PoojaVideoBadge has no importers; the quote-agnostic importer regex over apps/web fin | unreachable | `apps/web/components/design/Verification.tsx:91-95` |
| /search | देखें | button | onWatchVideo -> router.push(`/pandit/${id}#video`). The button renders only when poojaVideo === "verified" (Pa | unreachable | `apps/web/src/app/search/search-client.tsx:159,824; apps/web/components` |
| /search | Profile | button | onClick -> router.push(`/pandit/${pandit.id}`). EnhancedPanditCard is declared at :251 and cgrep "EnhancedPand | unreachable | `apps/web/src/app/search/search-client.tsx:251, 376-381` |
| /search | SELF-DRIVE | tab | <button> with className only — no onClick. Parent component is never rendered. And mapPanditToResult hard-code | unreachable | `apps/web/src/app/search/search-client.tsx:339-351, 121-126, 197` |
| /search | SELF-DRIVE | tab | <button> with className only — no onClick. Also never rendered (parent component unused). Prices are hard-code | unreachable | `apps/web/src/app/search/search-client.tsx:340-351, 121-126` |
| /search | TRAIN | tab | <button className="… cursor-not-allowed … opacity-50"> with no onClick; parent component never rendered | unreachable | `apps/web/src/app/search/search-client.tsx:355-358` |
| /search | FLIGHT | tab | <button className="… cursor-not-allowed … opacity-50"> with no onClick; parent component never rendered | unreachable | `apps/web/src/app/search/search-client.tsx:359-362` |
| /search — REFUTES the prior agent' | Profile | button | Nothing — it is never mounted. The button lives inside `function EnhancedPanditCard` (defined apps/web/src/app | unreachable | `apps/web/src/app/search/search-client.tsx:375-381 (component defined a` |
| /search | Book Now | button | onClick=onBook(pandit.id) -> handleBook -> LoginModal for guests, else /booking/new?panditId=. Never rendered  | unreachable | `apps/web/src/app/search/search-client.tsx:382-387, 555-563, 849-853` |
| /pandit/[id] and /search (LoginFor | अतिथि के रूप में जारी रखें → | link | <Link href="/"> — route exists, but the block is gated on `!hideGuestLink`, and LoginForm's ONLY consumer hard | unreachable | `apps/web/src/components/LoginForm.tsx:322-329 (gate + link); apps/web/` |
| /login (LoginForm, rendered only i | अतिथि के रूप में जारी रखें → | link | <Link href="/"> — the route exists, but the block is gated on `!hideGuestLink`, and LoginForm's ONLY consumer  | unreachable | `apps/web/src/components/LoginForm.tsx:322-329 (gate + link); apps/web/` |
| /pandit/[id] · LoginModal→LoginFor | अतिथि के रूप में जारी रखें → | link | Never rendered from this screen. Gated on `!hideGuestLink` (:322) and LoginModal hard-codes hideGuestLink={tru | unreachable | `apps/web/src/components/LoginForm.tsx:322-329, apps/web/src/components` |
| /pandit/[id] · LoginModal→LoginFor | पहले से पंजीकृत? लॉगिन करें | link | Never rendered anywhere in the app. Gated on `role === 'PANDIT' && step === 1` (:332), and role can never beco | unreachable | `apps/web/src/components/LoginForm.tsx:332-338` |
| /pandit/[id] and /search (LoginFor | पहले से पंजीकृत? लॉगिन करें | link | <Link href="/login"> — route exists, but the block requires role === 'PANDIT'. Two independent gates confirm i | unreachable | `apps/web/src/components/LoginForm.tsx:332-338 (gate + link); :181-191 ` |
| /login (LoginForm, rendered only i | पहले से पंजीकृत? लॉगिन करें | link | <Link href="/login"> — route exists, but the block requires role === 'PANDIT'. setRole('PANDIT') is never call | unreachable | `apps/web/src/components/LoginForm.tsx:332-338 (gate + link); apps/web/` |
| /booking-confirmed/[bookingId] | Toggle menu | button | onClick setMobileOpen(o => !o) — correctly wired; reveals the mobile panel whose three items are the dead butt | unreachable | `packages/ui/src/header.tsx:161-170,175-181` |
| /about, /privacy, /terms, /cancell | ← Back to Home | link | <Link href="/"> — route exists. The only back control on any of the four legal screens. | works | `apps/web/app/(legal)/layout.tsx:15-17` |
| /about, /privacy, /terms, /cancell | 🕉️ HmarePanditJi | link | <Link href="/"> — route exists. Listed as a ways-out by the prior report but never inventoried as a control. | works | `apps/web/app/(legal)/layout.tsx:9-14` |
| /terms | Cancellation Policy | link | <a href="/cancellation-policy"> — a plain anchor, not next/link, so it triggers a full page reload rather than | works | `apps/web/app/(legal)/terms/page.tsx:53` |
| /booking/checkout | (no interactive elements) | other | redirect("/booking/new") on every render; target exists | works | `apps/web/app/booking/checkout/page.tsx:8-10` |
| /booking/new (step 2, outstation o | Self-Drive / Cab / Train / Flight | card | a <div onClick> (:1068-1077) that sets travelMode, travelCost and zeroes local transport for SELF_DRIVE. Optio | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1058-1112,116-121` |
| /booking/new | Self-Drive / Cab / Train / Flight | card | The CARD is a <div onClick={...}> that sets travelMode, travelCost and zeroes local transport for SELF_DRIVE.  | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1068-1077` |
| /booking/new | Select | button | This <button> has NO onClick of its own — grep the element at :1103-1108, there is only className and children | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1103-1108 (handler ` |
| /booking/new (step 2, outstation o | Select | button | This <button> has NO onClick, no type and no form — re-verified at :1103-1108, the element carries only classN | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1103-1108 (handler ` |
| /booking/new (step 2, outstation o | Yes, I will provide meals on puja days | toggle | onChange set({ foodArrangement: "CUSTOMER_PROVIDES", foodCost: FOOD_PER_DAY * (travelDays + 0) }). foodArrange | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1121-1126,1139-1150` |
| /booking/new | Yes, I will provide meals on puja days | toggle | onChange set({ foodArrangement: "CUSTOMER_PROVIDES", foodCost: FOOD_PER_DAY * travelDays }). Sent as foodArran | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1123-1126,1139-1150` |
| /booking/new | No, please add food allowance | toggle | onChange set({ foodArrangement: "PLATFORM_ALLOWANCE", foodCost: ... }); foodAllowance feeds payNow at :417,432 | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1127-1131,1139-1150` |
| /booking/new (step 2, outstation o | No, please add food allowance | toggle | onChange set({ foodArrangement: "PLATFORM_ALLOWANCE", foodCost: ... }); foodAllowance feeds payNow at :417,432 | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1127-1131,1139-1150` |
| /booking/new | Customer will arrange hotel | button | onClick set({ accommodationArrangement: "CUSTOMER_ARRANGES", accommodationCost: 0 }); sent at :546 | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1173,1178-1196` |
| /booking/new (step 2, outstation o | Customer will arrange hotel | button | onClick set({ accommodationArrangement: "CUSTOMER_ARRANGES", accommodationCost: 0 }); the enum is sent at :546 | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1173,1178-1198,546` |
| /booking/new | Book via platform | button | onClick set({ accommodationArrangement: "PLATFORM_BOOKS", accommodationCost: existing \|\| 3000 }) and reveals | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1174,1178-1196,440,` |
| /booking/new (step 2, outstation o | Book via platform | button | onClick set({ accommodationArrangement: "PLATFORM_BOOKS", accommodationCost: existing \|\| 3000 }) and reveals | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1174,1178-1198,440,` |
| /booking/new (step 2, outstation o | Estimated Hotel Cost | input | onChange set({ accommodationCost: Math.max(0, Number(...)) }); affects only the 'Settled at booking' display l | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1201-1213,440,546` |
| /booking/new | Estimated Hotel Cost | input | onChange set({ accommodationCost: Math.max(0, Number(...)) }); only affects the 'Settled at booking' display l | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1204-1211` |
| /booking/new (step 2, outstation o | Add local cab (hotel to/from venue) via plat | toggle | onChange set({ localTransportNeeded, localTransportCost: checked ? (existing \|\| 800) : 0 }); folded into eff | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1215-1230,415,559` |
| /booking/new | Add local cab (hotel to/from venue) via plat | toggle | onChange set({ localTransportNeeded, localTransportCost: checked ? (existing \|\| 800) : 0 }); folded into eff | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1218-1228` |
| /booking/new (step 2, outstation o | (local cab cost, no label) | input | onChange set({ localTransportCost: Math.max(0, Number(...)) }); enters effectiveTravelCost and therefore the o | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1231-1240,413-415` |
| /booking/new | (local cab cost, no label) | input | onChange set({ localTransportCost: Math.max(0, Number(...)) }) | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1232-1239` |
| /booking/new (step 4) | Platform Custom List | button | onClick set({ samagri: "PLATFORM_CUSTOM" }) + clears an incompatible cart item. Mapped to samagriPreference: " | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1268-1312,548` |
| /booking/new (step 4) | Pandit's Fixed Package | button | onClick set({ samagri: "PANDIT_PACKAGE" }) and clears an incompatible cart item via setSamagriItem(null). Mapp | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1268-1312,548,557` |
| /booking/new | Pandit's Fixed Package | button | onClick set({ samagri: "PANDIT_PACKAGE" }) and clears an incompatible cart item via setSamagriItem(null). Mapp | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1288-1300,548` |
| /booking/new | Platform Custom List | button | onClick set({ samagri: "PLATFORM_CUSTOM" }) + clears incompatible cart item. Mapped to samagriPreference: "CUS | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1288-1300,548` |
| /booking/new (step 4) | Change | button | onClick setShowSamagriModal(true) | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1336-1342` |
| /booking/new (step 4) | Build Custom List | button | identical handler: setShowSamagriModal(true) | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1351-1357` |
| /booking/new | Select Fixed Package | button | onClick setShowSamagriModal(true) -> renders <SamagriModal> at :1661, but ONLY when form.panditId is truthy (: | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1351-1357,1659-1671` |
| /booking/new (step 4) | Select Fixed Package | button | onClick setShowSamagriModal(true) -> <SamagriModal> at :1659-1672, gated on form.panditId being truthy (:1660) | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1351-1357,1659-1672` |
| /booking/new | Build Custom List | button | identical handler: setShowSamagriModal(true) | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1356` |
| /booking/new (step 4) | Special Instructions (optional) | input | onChange set({ specialInstructions }); becomes the FIRST element of the composite specialInstructions string a | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1364-1375,553-562` |
| /booking/new | Special Instructions (optional) | input | onChange set({ specialInstructions }); becomes the FIRST element of the composite specialInstructions string a | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1366-1373` |
| /booking/new (step 5) | Premium Backup | toggle | onChange setAddons({...prev, backup}) -> addonCost (:421) -> the 'Settled at booking' line (:440,1566-1574), i | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1491-1510,421,440,5` |
| /booking/new | Premium Backup | toggle | onChange setAddons({...prev, backup}) -> addonCost (:421) -> settledAtBooking display line (:440,1566-1574). N | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1502-1508,421,561` |
| /booking/new (step 5) | Muhurat Consultation | button | onClick setMuhuratConsultation(!muhuratConsultation) -> addonCost via MUHURAT_CONSULTATION_FEE (:422) -> 'Sett | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1512-1527,422,560` |
| /booking/new | Muhurat Consultation | button | onClick setMuhuratConsultation(!muhuratConsultation) -> addonCost via MUHURAT_CONSULTATION_FEE (:422) -> settl | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1520-1525,422,560` |
| /booking/new (step 5) | Proceed to Payment | button | onClick handleCreateOrder (:513-641): POST /bookings -> POST /payments/create-order -> store server orderId/am | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1587-1599; silent-f` |
| /booking/new | Proceed to Payment | button | onClick handleCreateOrder (:513-641): POST /bookings -> POST /payments/create-order -> set order id/amount/key | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1588-1599; silent-f` |
| /booking/new | Back | button | onClick back() (:677-687). Rendered only when step > 0 AND step < 5 (:1629,1638), so absent on 'Review & Pay'  | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1638-1645,1629` |
| /booking/new | Back | button | onClick back() (:677-687). Rendered only when step > 0 AND step < 5 (:1629,1638), so it is absent on 'Review & | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1639-1644` |
| /booking/new | Continue | button | onClick next() (:651-675) with disabled={!canNext()}. next() skips step 2 entirely for a same-city (local) boo | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1646-1652,651-675` |
| /booking/new | Continue | button | onClick next() (:651-675) with disabled={!canNext()}. next() skips step 2 entirely for a same-city booking, ju | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1646-1652,651-675,4` |
| /booking/new | Review & Pay | button | onClick next() -> setStep(5) (:665-672) | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1651,665-672` |
| /booking/new | Login & Continue | button | onClick next() -> the !user branch calls openLoginModal() (:667-670) from the shared auth context; the step do | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1651,665-672` |
| /booking/new | Login & Continue | button | onClick next() -> !user branch calls openLoginModal() (:667-670), which flips loginModalOpen in the shared aut | works | `apps/web/app/booking/new/booking-wizard-client.tsx:1651,667-670; apps/` |
| /booking/new (step 6) | View Bookings | button | onClick router.push("/dashboard/bookings") — target exists (apps/web/app/dashboard/bookings/page.tsx) | works | `apps/web/app/booking/new/booking-wizard-client.tsx:738-743` |
| /booking/new (step 6) | Go Home | button | onClick router.push("/") — target exists (apps/web/app/page.tsx) | works | `apps/web/app/booking/new/booking-wizard-client.tsx:744-749` |
| /booking/new | Back | button | onClick={() => step === 0 ? router.back() : back()}. back() at :677-687 rewinds one step and also clears payme | works | `apps/web/app/booking/new/booking-wizard-client.tsx:763` |
| /booking/new | Back | button | onClick={() => step === 0 ? router.back() : back()}. back() (:677-687) rewinds one step and clears paymentRead | works | `apps/web/app/booking/new/booking-wizard-client.tsx:763,677-687` |
| /booking/new (step 0) | Ceremony / Puja * | input | onChange looks the ritual up in `rituals` and set({ ritualId, ritualName, dakshina: ritual?.baseDakshina ?? 0  | works | `apps/web/app/booking/new/booking-wizard-client.tsx:783-799,265-291` |
| /booking/new | Select a ceremony | input | onChange looks the ritual up in `rituals` and set({ ritualId, ritualName, dakshina: ritual?.baseDakshina ?? 0  | works | `apps/web/app/booking/new/booking-wizard-client.tsx:784-799` |
| /booking/new (step 0) | Event Date * | input | onChange set({ eventDate }); min={new Date().toISOString().split("T")[0]}. CAVEAT the prior pass missed: the U | works | `apps/web/app/booking/new/booking-wizard-client.tsx:805-812; clobber pa` |
| /booking/new | Event Date | input | onChange set({ eventDate }); min={new Date().toISOString().split("T")[0]} | works | `apps/web/app/booking/new/booking-wizard-client.tsx:806-812` |
| /booking/new (step 0) | Muhurat Time | input | onChange set({ eventTime }); sent as muhuratTime and folded into the eventDate ISO string at :531-532 | works | `apps/web/app/booking/new/booking-wizard-client.tsx:815-821,531-532` |
| /booking/new | Muhurat Time | input | onChange set({ eventTime }); sent as muhuratTime and folded into eventDate ISO at :531-532 | works | `apps/web/app/booking/new/booking-wizard-client.tsx:816-821` |
| /booking/new (step 0) | Attendees * | input | onChange set({ attendees: Math.max(1, Number(...)) }) — the clamp is LOW-END ONLY, so a typed 9999 survives an | works | `apps/web/app/booking/new/booking-wizard-client.tsx:827-835,536` |
| /booking/new | Attendees | input | onChange set({ attendees: Math.max(1, Number(...)) }). NOTE the max={500} is an HTML hint only — the onChange  | works | `apps/web/app/booking/new/booking-wizard-client.tsx:828-835` |
| /booking/new (step 0) | This ceremony spans multiple days | toggle | onChange set({ isMultiDay, endDate: checked ? form.endDate : "" }); drives eventDays (:399-405) and the food-a | works | `apps/web/app/booking/new/booking-wizard-client.tsx:838-847` |
| /booking/new | This ceremony spans multiple days | toggle | onChange set({ isMultiDay, endDate: checked ? form.endDate : "" }); drives eventDays at :399-405 and the food- | works | `apps/web/app/booking/new/booking-wizard-client.tsx:840-845` |
| /booking/new (step 0) | (end-date picker, no label) | input | onChange set({ endDate }); min = eventDate or today; canNext() case 0 additionally requires endDate >= eventDa | works | `apps/web/app/booking/new/booking-wizard-client.tsx:848-856,487` |
| /booking/new | (end-date picker, no label) | input | onChange set({ endDate }); min = eventDate or today | works | `apps/web/app/booking/new/booking-wizard-client.tsx:849-855` |
| /booking/new (step 0) | Venue Address * | input | onChange set({ venueLine1 }); required by canNext() case 0 (:488); concatenated into venueAddress at :533 | works | `apps/web/app/booking/new/booking-wizard-client.tsx:862-868,488,533` |
| /booking/new | House / Flat / Street | input | onChange set({ venueLine1 }); required by canNext() case 0 (:488); concatenated into venueAddress at :533 | works | `apps/web/app/booking/new/booking-wizard-client.tsx:863-868` |
| /booking/new | Landmark (optional) | input | onChange set({ venueLine2 }); concatenated into venueAddress at :533 | works | `apps/web/app/booking/new/booking-wizard-client.tsx:869-874` |
| /booking/new (step 0) | Landmark (optional) | input | onChange set({ venueLine2 }); concatenated into venueAddress at :533 | works | `apps/web/app/booking/new/booking-wizard-client.tsx:869-874,533` |
| /booking/new (step 0) | City * | input | onChange set({ venueCity }); options are the hardcoded DELHI_CITIES array (:90-94) — no API. Drives isOutstati | works | `apps/web/app/booking/new/booking-wizard-client.tsx:879-886,90-94,406-4` |
| /booking/new | City | input | onChange set({ venueCity }); options are the hardcoded DELHI_CITIES array (:90-94); drives isOutstation (:406- | works | `apps/web/app/booking/new/booking-wizard-client.tsx:880-886` |
| /booking/new (step 0) | Pincode * | input | onChange strips non-digits and slices to 6; canNext() case 0 requires length === 6 (:491) | works | `apps/web/app/booking/new/booking-wizard-client.tsx:889-896,491` |
| /booking/new | Pincode | input | onChange strips non-digits and slices to 6; canNext() case 0 requires length === 6 | works | `apps/web/app/booking/new/booking-wizard-client.tsx:890-896` |
| /booking/new (step 0) | State | input | onChange set({ venueState }); appended to venueAddress at :533; not validated and not required | works | `apps/web/app/booking/new/booking-wizard-client.tsx:898-901,208,533` |
| /booking/new | State | input | onChange set({ venueState }); appended to venueAddress at :533 | works | `apps/web/app/booking/new/booking-wizard-client.tsx:900` |
| /booking/new (step 0) | Gotra (optional) | input | onChange set({ gotra }); has NO dedicated API field — it is stringified into the composite specialInstructions | works | `apps/web/app/booking/new/booking-wizard-client.tsx:906-912,555` |
| /booking/new | Gotra (optional) | input | onChange set({ gotra }); has NO dedicated API field — it is stringified into specialInstructions as `Gotra: <v | works | `apps/web/app/booking/new/booking-wizard-client.tsx:907-912` |
| /booking/new (step 0) | Add from Contacts | button | onClick={() => void importFromContacts()} (:325-354). Feature-detects navigator.contacts.select; when absent i | works | `apps/web/app/booking/new/booking-wizard-client.tsx:917-923,325-354,943` |
| /booking/new (step 0) | Type name and press Add | input | onChange setFamilyInput; consumed by the adjacent 'Add' button. Enter does NOT add — there is no onKeyDown on  | works | `apps/web/app/booking/new/booking-wizard-client.tsx:924-929` |
| /booking/new | Add | button | onClick trims, ignores empty, dedupes via Set, slices to 10, clears the input. Names are stringified into spec | works | `apps/web/app/booking/new/booking-wizard-client.tsx:930-941` |
| /booking/new (step 0) | Add | button | onClick trims, ignores empty, dedupes via Set, slices to 10, clears the input. Names are stringified into spec | works | `apps/web/app/booking/new/booking-wizard-client.tsx:930-941,556` |
| /booking/new (step 0) | × | button | onClick set({ familyMembers: form.familyMembers.filter(m => m !== name) }) | works | `apps/web/app/booking/new/booking-wizard-client.tsx:949-955` |
| /booking/new (step 1) | Pt. Ramesh Sharma Shastri / Pt. Suresh Mishr | card | onClick set({ panditId, panditName, dakshina: p.baseDakshina }). The list is GET /pandits?ritual=...&limit=10  | works | `apps/web/app/booking/new/booking-wizard-client.tsx:976-1025,109-114,23` |
| /booking/new | Pt. Ramesh Sharma Shastri (and each pandit c | card | onClick set({ panditId, panditName, dakshina: p.baseDakshina }). List is GET /pandits?ritual=...&limit=10 (:29 | works | `apps/web/app/booking/new/booking-wizard-client.tsx:979-1023` |
| /dashboard/bookings/[bookingId]/ca | Go Back | link | next/link to /dashboard/bookings/{bookingId} — target exists | works | `apps/web/app/dashboard/bookings/[bookingId]/cancel/page.tsx:162-165` |
| /dashboard/bookings/[bookingId]/ca | Date/time change needed · Found a different  | input | onChange -> setReason(e.target.value); selecting "Other" reveals the free-text textarea. The chosen value is s | works | `apps/web/app/dashboard/bookings/[bookingId]/cancel/page.tsx:241-253` |
| /dashboard/bookings/[bookingId]/ca | Please specify... | input | onChange -> setOtherReason; validated non-empty at cancel/page.tsx:110-113 before submit | works | `apps/web/app/dashboard/bookings/[bookingId]/cancel/page.tsx:258-263` |
| /dashboard/bookings/[bookingId]/ca | Confirm Cancellation | button | form onSubmit -> handleSubmit -> POST {API_URL}/bookings/{bookingId}/cancel-request with {reason} (cancel/page | works | `apps/web/app/dashboard/bookings/[bookingId]/cancel/page.tsx:269-272` |
| /dashboard/bookings/[bookingId] | Back to My Bookings | link | <Link href="/dashboard/bookings"> — route exists. NOT rendered during the loading early-return (:73) or the "B | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:128-130` |
| /dashboard/bookings/[bookingId] (O | Open in Maps | link | <a href={`https://maps.google.com/?q=${booking.venueAddress}, ${booking.venueCity}`} target="_blank"> — a real | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:170-172` |
| /dashboard/bookings/[bookingId] (O | Call | link | <a href={telHref(booking.pandit)!}> where telHref returns `tel:${pandit.user.phone}` or null (apps/web/lib/pan | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:209-213; href app` |
| /dashboard/bookings/[bookingId] (O | Call | link | <a href={telHref(booking.pandit)!}> where telHref returns `tel:${pandit.user.phone}` or null (apps/web/lib/pan | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:209-213; href at ` |
| /dashboard/bookings/[bookingId] | Call | link | <a href={telHref(booking.pandit)!}> where telHref returns `tel:${pandit.user.phone}` or null. The control is E | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:209-213; href bui` |
| /dashboard/bookings/[bookingId] (O | WhatsApp | link | <a href={whatsappHref(booking.pandit)!}> = `https://wa.me/${phone.replace(/[^\d]/g,"")}` — never the bare doma | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:214-216; href app` |
| /dashboard/bookings/[bookingId] (O | WhatsApp | link | <a href={whatsappHref(booking.pandit)!}> = `https://wa.me/${phone.replace(/[^\d]/g,"")}` — never the bare doma | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:214-216; href at ` |
| /dashboard/bookings/[bookingId] | WhatsApp | link | <a href={whatsappHref(booking.pandit)!}> = `https://wa.me/${phone.replace(/[^\d]/g,"")}` — never the bare doma | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:214-216; href bui` |
| /dashboard/bookings/[bookingId] (O | GST on Platform Fees (18%) | toggle | Rendered by <PriceBreakdown breakdown={booking} /> (page.tsx:245). The row is a real <button type="button" onC | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:245 -> packages/u` |
| /dashboard/bookings/[bookingId] (O | GST on Platform Fees (18%) | toggle | Rendered by <PriceBreakdown breakdown={booking} /> at page.tsx:245. The row is a real <button type="button" on | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:245 -> packages/u` |
| /dashboard/bookings/[bookingId] (O | GST on Platform Fees (18%) | toggle | Rendered by <PriceBreakdown breakdown={booking} /> at page.tsx:245. The row is a real <button type="button" on | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:245 -> packages/u` |
| /dashboard/bookings/[bookingId] (O | Live Track Pandit | link | <Link href={`/dashboard/bookings/${booking.id}/track`}> — route exists (apps/web/app/dashboard/bookings/[booki | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:250-252` |
| /dashboard/bookings/[bookingId] (O | ⭐ Write Review | button | packages/ui Button spreads {...props} onto a real <button> (packages/ui/src/button.tsx:68-71), so onClick -> r | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:255-257` |
| /dashboard/bookings/[bookingId] (O | Cancel Booking | button | onClick -> router.push(`/dashboard/bookings/${booking.id}/cancel`) — route exists (…/[bookingId]/cancel/page.t | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:260-262` |
| /dashboard/bookings/[bookingId] (D | View Certificate | button | onAction = () => setActiveTab("Muhurat"). "Muhurat" is NOT one of the three keys in the tabs array (:76-80), s | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:286-292 (label :2` |
| /dashboard/bookings/[bookingId] (D | View Certificate | button | onAction = () => setActiveTab("Muhurat"). "Muhurat" is not one of the three keys in the tabs array (:76-80), s | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:286-292 (label :2` |
| /dashboard/bookings/[bookingId] (D | View Certificate | button | onAction = () => setActiveTab("Muhurat"). "Muhurat" is NOT one of the three keys in the tabs array (:76-80), s | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:286-292 (title :2` |
| /dashboard/bookings/[bookingId] (M | Back to Documents | button | onClick -> setActiveTab("Documents") — restores the Documents block at :275. | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:318-320` |
| /dashboard/bookings/[bookingId] | Overview | tab | Tabs onChange -> setActiveTab("Overview"); block at :149 renders on that key. Handler at packages/ui/src/tabs. | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:77,146,149` |
| /dashboard/bookings/[bookingId] | Itinerary | tab | setActiveTab("Itinerary") -> renders <ItineraryTimeline booking={booking} /> (apps/web/app/dashboard/component | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:78,270-272` |
| /dashboard/bookings/[bookingId] | Itinerary | tab | setActiveTab("Itinerary") -> renders <ItineraryTimeline booking={booking} />. Read end to end: that component  | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:78,270-272; compo` |
| /dashboard/bookings/[bookingId] | Documents | tab | setActiveTab("Documents") -> renders the DocumentCard stack at :276-313. Three of the four cards in that stack | works | `apps/web/app/dashboard/bookings/[bookingId]/page.tsx:79,275` |
| /dashboard/bookings/[bookingId]/re | ⭐ Overall Experience | input | five type="button" stars, onClick -> onChange(s) -> setOverall. Gate at review/page.tsx:82-85 blocks submit wh | works | `apps/web/app/dashboard/bookings/[bookingId]/review/page.tsx:167-178 (I` |
| /dashboard/bookings/[bookingId]/re | ⭐ Knowledge & Expertise | input | onClick -> setKnowledge; sent as ratings.knowledge or undefined (review/page.tsx:99) | works | `apps/web/app/dashboard/bookings/[bookingId]/review/page.tsx:170 + :218` |
| /dashboard/bookings/[bookingId]/re | ⭐ Punctuality | input | onClick -> setPunctuality; sent as ratings.punctuality or undefined (review/page.tsx:100) | works | `apps/web/app/dashboard/bookings/[bookingId]/review/page.tsx:170 + :219` |
| /dashboard/bookings/[bookingId]/re | ⭐ Communication | input | onClick -> setCommunication; sent as ratings.communication or undefined (review/page.tsx:101) | works | `apps/web/app/dashboard/bookings/[bookingId]/review/page.tsx:170 + :220` |
| /dashboard/bookings/[bookingId]/re | ⭐ Value for Money | input | onClick -> setValueForMoney; sent as ratings.valueForMoney or undefined (review/page.tsx:102) | works | `apps/web/app/dashboard/bookings/[bookingId]/review/page.tsx:170 + :221` |
| /dashboard/bookings/[bookingId]/re | Share your experience in detail... | input | onChange -> setComment(value.slice(0,500)); the 20-char minimum is enforced at review/page.tsx:86-89 (only whe | works | `apps/web/app/dashboard/bookings/[bookingId]/review/page.tsx:226-234` |
| /dashboard/bookings/[bookingId]/re | Submit anonymously | toggle | checkbox onChange -> setIsAnonymous(e.target.checked), plus a wrapper div onClick -> setIsAnonymous(!isAnonymo | works | `apps/web/app/dashboard/bookings/[bookingId]/review/page.tsx:263-271` |
| /dashboard/bookings/[bookingId]/re | 🙏 Submit Review | button | form onSubmit -> handleSubmit -> POST {API_BASE}/reviews (review/page.tsx:110). Endpoint exists: services/api/ | works | `apps/web/app/dashboard/bookings/[bookingId]/review/page.tsx:275-277` |
| /dashboard/bookings/[bookingId]/tr | close | link | next/link to /dashboard/bookings/{booking.id} — target exists. But it sits inside <aside className="hidden lg: | works | `apps/web/app/dashboard/bookings/[bookingId]/track/page.tsx:144-146` |
| /dashboard/bookings | All | tab | Tabs onChange -> setActiveTab("All") (packages/ui/src/tabs.tsx:28) -> useEffect (page.tsx:48-56) -> fetchBooki | works | `apps/web/app/dashboard/bookings/page.tsx:59 + :29-32 + :69; handler pa` |
| /dashboard/bookings | All | tab | Tabs onChange -> setActiveTab("All") -> useEffect -> fetchBookings("All"), which omits &status= entirely (page | works | `apps/web/app/dashboard/bookings/page.tsx:59 + :69 + :25-32` |
| /dashboard/bookings | All | tab | Tabs onChange -> setActiveTab("All") -> useEffect -> fetchBookings("All"), which omits the &status= param enti | works | `apps/web/app/dashboard/bookings/page.tsx:59 + :69 + :29-32` |
| /dashboard/bookings | Upcoming | tab | Appends &status=UPCOMING (page.tsx:31). VERIFIED at the API: the string is special-cased and expanded to CREAT | works | `apps/web/app/dashboard/bookings/page.tsx:60,31 -> services/api/src/ser` |
| /dashboard/bookings | Upcoming | tab | Appends &status=UPCOMING (page.tsx:31, .toUpperCase() of the tab key). The API special-cases that exact string | works | `apps/web/app/dashboard/bookings/page.tsx:60,31 -> services/api/src/ser` |
| /dashboard/bookings | Completed | tab | Appends &status=COMPLETED; API maps it to status:"COMPLETED". | works | `apps/web/app/dashboard/bookings/page.tsx:61,31 -> services/api/src/ser` |
| /dashboard/bookings | Completed | tab | Appends &status=COMPLETED; API maps it to status:"COMPLETED". | works | `apps/web/app/dashboard/bookings/page.tsx:61,31 -> services/api/src/ser` |
| /dashboard/bookings | Cancelled | tab | Appends &status=CANCELLED; API expands to CANCELLATION_REQUESTED / CANCELLED / REFUNDED. | works | `apps/web/app/dashboard/bookings/page.tsx:62,31 -> services/api/src/ser` |
| /dashboard/bookings | Cancelled | tab | Appends &status=CANCELLED; API expands to CANCELLATION_REQUESTED / CANCELLED / REFUNDED. | works | `apps/web/app/dashboard/bookings/page.tsx:62,31 -> services/api/src/ser` |
| /dashboard/bookings | लॉगिन कीजिए → | link | <Link href="/login"> — route exists (apps/web/app/login/page.tsx). Rendered only in the !accessToken branch, u | works | `apps/web/app/dashboard/bookings/page.tsx:87-89` |
| /dashboard/bookings (signed-out st | लॉगिन कीजिए → | link | <Link href="/login"> — route exists (apps/web/app/login/page.tsx). Rendered only in the !accessToken branch (p | works | `apps/web/app/dashboard/bookings/page.tsx:87-89 (headings :83,:85)` |
| /dashboard/bookings | Explore Pandits → | link | <Link href="/search"> — route exists (apps/web/app/search/page.tsx). Rendered only when authenticated AND book | works | `apps/web/app/dashboard/bookings/page.tsx:98-100` |
| /dashboard/bookings (empty state) | Explore Pandits → | link | <Link href="/search"> — route exists. Rendered only when authenticated AND bookings.length === 0 (page.tsx:91- | works | `apps/web/app/dashboard/bookings/page.tsx:98-100 (heading :96)` |
| /dashboard/bookings | (whole booking card — no button label; visib | card | The entire card body is wrapped in <Link href={`/dashboard/bookings/${booking.id}`}> — route exists. No onClic | works | `apps/web/app/dashboard/components/BookingCard.tsx:44` |
| /dashboard/bookings | (whole booking card — no button label; visib | card | The entire card body is wrapped in <Link href={`/dashboard/bookings/${booking.id}`}> — route exists. No onClic | works | `apps/web/app/dashboard/components/BookingCard.tsx:44 (fee line :63)` |
| all /dashboard/* (layout-supplied, | My Profile | link | <Link href="/dashboard/profile"> — route exists (apps/web/app/dashboard/profile/page.tsx). | works | `apps/web/app/dashboard/components/DashboardNav.tsx:10 (rendered at :29` |
| EVERY /dashboard/* screen (persist | My Profile · My Pandits · My Bookings | link | next/link to /dashboard/profile, /dashboard/favorites, /dashboard/bookings — all three exist as page.tsx. Rend | works | `apps/web/app/dashboard/components/DashboardNav.tsx:10, :14, :15` |
| all /dashboard/* (layout-supplied, | My Pandits | link | <Link href="/dashboard/favorites"> — route exists (apps/web/app/dashboard/favorites/page.tsx). | works | `apps/web/app/dashboard/components/DashboardNav.tsx:14 (rendered at :29` |
| all /dashboard/* (layout-supplied, | My Bookings | link | <Link href="/dashboard/bookings"> — route exists (apps/web/app/dashboard/bookings/page.tsx). | works | `apps/web/app/dashboard/components/DashboardNav.tsx:15 (rendered at :29` |
| all /dashboard/* (dashboard layout | Home | link | <Link href="/dashboard">. The route exists but is a pure server redirect back to /dashboard/bookings (apps/web | works | `apps/web/app/dashboard/components/DashboardNav.tsx:62 (rendered :69-76` |
| all /dashboard/* (layout-supplied, | Home | link | <Link href="/dashboard">. The route exists but is a pure server redirect straight back to /dashboard/bookings  | works | `apps/web/app/dashboard/components/DashboardNav.tsx:62 (rendered at :69` |
| all /dashboard/* (layout-supplied, | Home | link | <Link href="/dashboard">. The route exists but is a pure server redirect back to /dashboard/bookings (apps/web | works | `apps/web/app/dashboard/components/DashboardNav.tsx:62 (rendered at :69` |
| EVERY /dashboard/* screen (mobile  | Home · Bookings · Pandits · Profile | link | next/link to /dashboard, /dashboard/bookings, /dashboard/favorites, /dashboard/profile — all four exist. This  | works | `apps/web/app/dashboard/components/DashboardNav.tsx:62-65 (rendered :69` |
| all /dashboard/* (dashboard layout | Bookings | link | <Link href="/dashboard/bookings"> — route exists. | works | `apps/web/app/dashboard/components/DashboardNav.tsx:63 (rendered :69-76` |
| all /dashboard/* (layout-supplied, | Bookings | link | <Link href="/dashboard/bookings"> — route exists. | works | `apps/web/app/dashboard/components/DashboardNav.tsx:63 (rendered at :69` |
| all /dashboard/* (dashboard layout | Pandits | link | <Link href="/dashboard/favorites"> — route exists. | works | `apps/web/app/dashboard/components/DashboardNav.tsx:64 (rendered :69-76` |
| all /dashboard/* (layout-supplied, | Pandits | link | <Link href="/dashboard/favorites"> — route exists. | works | `apps/web/app/dashboard/components/DashboardNav.tsx:64 (rendered at :69` |
| all /dashboard/* (dashboard layout | Profile | link | <Link href="/dashboard/profile"> — route exists. | works | `apps/web/app/dashboard/components/DashboardNav.tsx:65 (rendered :69-76` |
| all /dashboard/* (layout-supplied, | Profile | link | <Link href="/dashboard/profile"> — route exists. | works | `apps/web/app/dashboard/components/DashboardNav.tsx:65 (rendered at :69` |
| /dashboard/bookings/[bookingId] (r | View Certificate | button | onAction = setActiveTab("Muhurat") -> the block at bookings/[bookingId]/page.tsx:316-323 renders <MuhuratPatri | works | `apps/web/app/dashboard/components/DocumentCard.tsx:11 + apps/web/app/d` |
| /dashboard/bookings/[bookingId] (c | (no text — lucide <X size={20} /> close glyp | button | onClick={onClose} -> setShowCompletionModal(false) (page.tsx:124). Note the 60s poll at page.tsx:66-69 re-runs | works | `apps/web/app/dashboard/components/PujaCompletionModal.tsx:37-39` |
| /dashboard/bookings/[bookingId] (r | (no text label — lucide <X size={20} /> icon | button | onClose() — the parent sets showCompletionModal(false) (bookings/[bookingId]/page.tsx:124) | works | `apps/web/app/dashboard/components/PujaCompletionModal.tsx:37-39` |
| /dashboard/bookings/[bookingId] (r | Rate Your Experience | link | plain <a href={`/dashboard/bookings/${booking.id}/review`}> — target route exists. It is a raw <a>, not next/l | works | `apps/web/app/dashboard/components/PujaCompletionModal.tsx:64-66` |
| /dashboard/bookings/[bookingId] (c | Rate Your Experience | link | <a href={`/dashboard/bookings/${booking.id}/review`}> — route exists. Modal is mounted from page.tsx:124. Reac | works | `apps/web/app/dashboard/components/PujaCompletionModal.tsx:64-66 (mount` |
| /dashboard/bookings/[bookingId] (r | View Booking Details | button | onClose() — it does not navigate. It dismisses the modal, revealing the booking-detail screen it is already ov | works | `apps/web/app/dashboard/components/PujaCompletionModal.tsx:67-69` |
| /dashboard/bookings/[bookingId] (c | View Booking Details | button | onClick -> onClose(), which is `() => setShowCompletionModal(false)` passed at page.tsx:124. It does not navig | works | `apps/web/app/dashboard/components/PujaCompletionModal.tsx:67-69; onClo` |
| /dashboard/favorites | Remove | button | onClick -> removeFavorite(pandit.id): native confirm("Remove from favorites?"), then DELETE {API_BASE}/custome | works | `apps/web/app/dashboard/favorites/page.tsx:159-165` |
| /dashboard/favorites | Book Again → | button | onClick -> router.push(`/pandit/${pandit.id}`). ID SEMANTICS CHECKED (the prior report asserted this without c | works | `apps/web/app/dashboard/favorites/page.tsx:166-172` |
| /dashboard/favorites | Explore Pandits → | button | Button wrapped in next/link href="/search" — route exists. The Button spreads ...props onto a real <button> (p | works | `apps/web/app/dashboard/favorites/page.tsx:95-97` |
| /dashboard/* (layout) | (none — layout renders only <DashboardNav /> | other | apps/web/app/dashboard/layout.tsx has no control of its own; it mounts DashboardNav at :12 and the page at :14 | works | `apps/web/app/dashboard/layout.tsx:4-18` |
| /dashboard/* (layout) | (none — layout renders only <DashboardNav /> | other | apps/web/app/dashboard/layout.tsx contains no control of its own; it mounts DashboardNav at :12 and the page a | works | `apps/web/app/dashboard/layout.tsx:9-18` |
| /dashboard | (none — the screen renders no markup at all) | other | apps/web/app/dashboard/page.tsx is five lines: an import of redirect and a component whose whole body is redir | works | `apps/web/app/dashboard/page.tsx:1-5` |
| /dashboard | (none — the screen renders no markup at all) | other | apps/web/app/dashboard/page.tsx has a single statement, redirect("/dashboard/bookings"), and returns nothing.  | works | `apps/web/app/dashboard/page.tsx:3-5` |
| /dashboard/profile | Edit Details | button | setIsEditingSectionA(true) — swaps the read-only divs for inputs | works | `apps/web/app/dashboard/profile/page.tsx:106-110` |
| /dashboard/profile | Cancel | button | setIsEditingSectionA(false). CONFIRMED it does NOT reset formDataSectionA (only fetchProfile at :58 and the fi | works | `apps/web/app/dashboard/profile/page.tsx:113-117` |
| /dashboard/profile | Save | button | handleSaveSectionA -> PUT {API_BASE}/customers/me (profile/page.tsx:79). Endpoint exists: services/api/src/rou | works | `apps/web/app/dashboard/profile/page.tsx:118-123` |
| /dashboard/profile | Full Name | input | onChange -> setFormDataSectionA({...,name}) (edit mode only) | works | `apps/web/app/dashboard/profile/page.tsx:132-136` |
| /dashboard/profile | Preferred Languages | input | onChange -> reads selectedOptions into formDataSectionA.preferredLanguages (edit mode only) | works | `apps/web/app/dashboard/profile/page.tsx:160-172` |
| /dashboard/profile | Find New Pandit | button | router.push('/search') — route exists. hidden md:block, so it does not render at the repo's 360px mobile profi | works | `apps/web/app/dashboard/profile/page.tsx:281-283` |
| /dashboard/profile | Favorite Pandits | card | router.push('/dashboard/favorites') — route exists (apps/web/app/dashboard/favorites/page.tsx) | works | `apps/web/app/dashboard/profile/page.tsx:287-296` |
| /login | (six OTP boxes, no text labels) | input | handleChange accepts /^\d?$/, auto-focuses the next box, and fires onComplete(next.join("")) -> handleVerifyOt | works | `apps/web/app/login/page.tsx:22-58 (OtpInput), :335 (wiring), :126-157 ` |
| /login | (six OTP boxes, no text labels) | input | handleChange accepts /^\d?$/, focuses the next box, and fires onComplete(next.join("")) -> handleVerifyOtp ->  | works | `apps/web/app/login/page.tsx:22-58 (OtpInput), :335 (wiring), :126-157 ` |
| /login | 🙏 I'm a Customer | tab | onClick={() => setRole("CUSTOMER")} — has a handler, but role is initialised to "CUSTOMER" (:67) and that is t | works | `apps/web/app/login/page.tsx:244-252; :67` |
| /login | 🙏 I'm a Customer | tab | onClick={() => setRole("CUSTOMER")} — has a handler, but role is initialised to "CUSTOMER" (line 67) and is th | works | `apps/web/app/login/page.tsx:244-252; :67 (initial value); cgrep "setRo` |
| /login | 📿 I'm a Pandit | tab | Does NOT toggle. onClick sets window.location.href = NEXT_PUBLIC_PANDIT_URL \|\| 'http://localhost:3002' — a h | works | `apps/web/app/login/page.tsx:253-264 (handler); :258-261, :269, :272, :` |
| /login | 📿 I'm a Pandit | tab | Does NOT toggle. onClick sets window.location.href = NEXT_PUBLIC_PANDIT_URL \|\| 'http://localhost:3002' — a h | works | `apps/web/app/login/page.tsx:253-264; unreachable branches at :258-261,` |
| /login | 9876543210 (placeholder; label "Mobile Numbe | input | type="tel", onChange strips non-digits and slices to 10, clears phoneError. No maxLength and no inputMode="num | works | `apps/web/app/login/page.tsx:291-300` |
| /login | Send OTP → | button | form onSubmit -> handleSendOtp: validates /^[6-9]\d{9}$/, POSTs {phone:`+91${phone}`, role} to `${API_BASE}/au | works | `apps/web/app/login/page.tsx:305-312 (control), :98-124 (handler)` |
| /login | Change | button | onClick={() => { setStep("phone"); setError(""); }} — returns to step 1 with the typed number preserved in sta | works | `apps/web/app/login/page.tsx:325-327` |
| /login | Resend OTP | button | onClick={() => handleSendOtp()} — re-POSTs /auth/send-otp and restarts the countdown. Rendered only when count | works | `apps/web/app/login/page.tsx:343-348` |
| /login | Resend OTP | button | onClick={() => handleSendOtp()} — re-POSTs /auth/send-otp and restarts the countdown. Rendered only when count | works | `apps/web/app/login/page.tsx:343-348, gate at :340` |
| /login | Your full name (placeholder) | input | onChange={(e) => setName(e.target.value)}, autoFocus. Feeds handleSubmitName. | works | `apps/web/app/login/page.tsx:362-369` |
| /login | Get Started → | button | form onSubmit -> handleSubmitName: PATCH `${API_BASE}/auth/me` with Bearer localStorage 'hpj_token' (the same  | works | `apps/web/app/login/page.tsx:375-382 (control), :159-183 (handler; miss` |
| /login | Get Started → | button | form onSubmit -> handleSubmitName: PATCH `${API_BASE}/auth/me` with Bearer localStorage 'hpj_token' (matches C | works | `apps/web/app/login/page.tsx:375-382 (control), :159-183 (handler; no !` |
| /login | Continue as Guest → | link | <Link href="/"> — / exists. Rendered when role==="CUSTOMER" && step==="phone", the default state, so it does r | works | `apps/web/app/login/page.tsx:390-392, gate at :387` |
| /muhurat | HmarePanditJi | link | Link href="/" | works | `apps/web/app/muhurat/page.tsx:49-52` |
| /muhurat | Muhurat | link | Link href="/muhurat" (self-link) | works | `apps/web/app/muhurat/page.tsx:54` |
| /muhurat | Pujas | link | Link href="/search" | works | `apps/web/app/muhurat/page.tsx:55` |
| /muhurat | Pandits | link | Link href="/search" — same target as 'Pujas' beside it | works | `apps/web/app/muhurat/page.tsx:56` |
| /muhurat | Profile | link | Link href="/dashboard"; route exists at apps/web/app/dashboard/page.tsx | works | `apps/web/app/muhurat/page.tsx:69-71` |
| /muhurat | Calendar | link | Link href="/muhurat" (self-link) | works | `apps/web/app/muhurat/page.tsx:83-86` |
| /muhurat | My Bookings | link | Link href="/dashboard/bookings"; route exists | works | `apps/web/app/muhurat/page.tsx:87-90` |
| /muhurat | Pandit Search | link | Link href="/search" | works | `apps/web/app/muhurat/page.tsx:91-94` |
| /muhurat | Settings | link | Link href="/dashboard/profile"; route exists | works | `apps/web/app/muhurat/page.tsx:99-102` |
| /nri | HmarePanditJi | link | Link href="/" | works | `apps/web/app/nri/page.tsx:22-25` |
| /nri | Ceremonies | link | Link href="/search" | works | `apps/web/app/nri/page.tsx:27` |
| /nri | Muhurat Finders | link | Link href="/muhurat" | works | `apps/web/app/nri/page.tsx:28` |
| /nri | (user avatar icon button) | link | Link href="/dashboard"; route exists | works | `apps/web/app/nri/page.tsx:43-45` |
| /nri | (user avatar icon button, no text) | link | Link href="/dashboard" wrapping lucide <User size={20} />; route exists | works | `apps/web/app/nri/page.tsx:43-45` |
| / | View Full Muhurat Calendar → | link | Link href="/muhurat"; route exists at apps/web/app/muhurat/page.tsx | works | `apps/web/app/page.tsx:230-233` |
| / | View Full Muhurat Calendar → | link | Link href="/muhurat"; route exists at apps/web/app/muhurat/page.tsx | works | `apps/web/app/page.tsx:231` |
| / | View All Pandits → | link | Link href="/search"; route exists at apps/web/app/search/page.tsx | works | `apps/web/app/page.tsx:294-299` |
| / | Browse All Pandits → | link | Link href="/search"; route exists | works | `apps/web/app/page.tsx:312-314` |
| / | View Profile | link | Link href=`/pandit/${p.id}`; route exists at apps/web/app/pandit/[id]/page.tsx | works | `apps/web/app/page.tsx:350-355` |
| / | View All Pandits → | link | Link href="/search" | works | `apps/web/app/page.tsx:369-372` |
| / | View All Pandits → | link | Link href="/search" | works | `apps/web/app/page.tsx:370-372` |
| / | Continue in English | button | onClick=handleLanguageSelect("en") -> localStorage.setItem("hpj_language","en"), setShowLanguageModal(false),  | works | `apps/web/app/page.tsx:478-483, 422-428` |
| / | Hindi mein jaari rakhein | button | onClick=handleLanguageSelect("hi") -> localStorage hpj_language="hi". Note the app has no i18n switch downstre | works | `apps/web/app/page.tsx:484-489, 401, 422-428` |
| / | Hindi mein jaari rakhein | button | onClick=handleLanguageSelect("hi") -> localStorage hpj_language="hi". The modal closes and the tutorial opens, | works | `apps/web/app/page.tsx:484-489, 422-428, 392, 401, 532` |
| / | Skip Tutorial | button | onClick=closeTutorial(true) -> localStorage hpj_tutorial_seen="1", setShowTutorial(false) | works | `apps/web/app/page.tsx:503-505, 430-435` |
| / | Skip | button | onClick=closeTutorial(true) | works | `apps/web/app/page.tsx:514-519` |
| / | Start Exploring | button | Same onClick=nextTutorialSlide; at tutorialIndex === TUTORIAL_SLIDES.length-1 it calls closeTutorial(true) | works | `apps/web/app/page.tsx:520-525, 437-441` |
| / | Next | button | onClick=nextTutorialSlide -> setTutorialIndex(prev+1) while below the last index | works | `apps/web/app/page.tsx:520-525, 437-443` |
| / | Start Exploring | button | onClick=nextTutorialSlide -> closeTutorial(true) on the last index | works | `apps/web/app/page.tsx:520-525, 438-441` |
| / | Not Now | button | onClick=skipLocationPrompt -> localStorage hpj_location_prompted="1", setShowLocationPrompt(false) | works | `apps/web/app/page.tsx:541-546, 445-448` |
| / | ? | button | onClick sets showTutorial=true and tutorialIndex=0. Fixed at top-24 right-6, z-[104] — unlike the Header's twi | works | `apps/web/app/page.tsx:564-574` |
| / | Book Now | link | Link href="/search" | works | `apps/web/app/page.tsx:601-603` |
| / | View All | link | Link href="/search" | works | `apps/web/app/page.tsx:634` |
| / | More | card | Link href='/search' — the ternary at :648 routes the label 'More' to the bare path. It genuinely lands where i | works | `apps/web/app/page.tsx:644,646-648` |
| / | Get Started Now | link | Link href="/search" | works | `apps/web/app/page.tsx:738-740` |
| /pandit/[id] | ← | button | Works. onClick=handlePrevMonth (AvailabilityCalendar.tsx:36-43) decrements with year rollover; disabled when i | works | `apps/web/app/pandit/[id]/AvailabilityCalendar.tsx:63-69` |
| /pandit/[id] | → | button | Works. onClick=handleNextMonth (:45-52) increments with year rollover. No upper bound — you can page forward i | works | `apps/web/app/pandit/[id]/AvailabilityCalendar.tsx:71-76` |
| /pandit/[id] | Book Now | button | Works. onClick -> handleBookClick (BookingCTA.tsx:20-26): token -> router.push(`/booking/new?panditId=..`), el | works | `apps/web/app/pandit/[id]/BookingCTA.tsx:36-41` |
| /pandit/[id] | Check Availability & Book | button | Works, but does not do what the label says about availability: the identical handleBookClick pushes /booking/n | works | `apps/web/app/pandit/[id]/BookingCTA.tsx:49-54` |
| /pandit/[id] | ▶ सत्यापित वीडियो सुनिए | link | Works. <a href={`https://www.youtube.com/watch?v=${service.sampleVideoId}`} target="_blank" rel="noopener nore | works | `apps/web/app/pandit/[id]/ServicesTab.tsx:111-120` |
| /pandit/[id] | ▶ पंडित जी का वीडियो ख़ुद सुनिए | link | Works. Same <a> element; the ternary on service.poojaVerified only swaps the label text (ServicesTab.tsx:117-1 | works | `apps/web/app/pandit/[id]/ServicesTab.tsx:111-120` |
| /pandit/[id] | Book This Puja → | button | Works. onClick reads localStorage CUSTOMER_TOKEN_KEY (ServicesTab.tsx:22); with a token, router.push(`/booking | works | `apps/web/app/pandit/[id]/ServicesTab.tsx:132-146` |
| /pandit/[id] | [View & Choose →] | button | Works. onClick -> handleOpenSamagri(service.pujaType) (ServicesTab.tsx:26-29) sets selectedPujaService + isSam | works | `apps/web/app/pandit/[id]/ServicesTab.tsx:86-91` |
| /pandit/[id] | Book Directly → | link | Works. next/link href={`/booking/new?panditId=${panditId}`}; /booking/new exists. No auth gate here, unlike th | works | `apps/web/app/pandit/[id]/TravelOptionsTab.tsx:100-105` |
| /pandit/[id] | Select This Option | link | Navigates correctly — href={`/booking/new?panditId=..&travelMode=..&fromCity=..&toCity=..`}, target route exis | works | `apps/web/app/pandit/[id]/TravelOptionsTab.tsx:139-144 (fallback at :45` |
| /pandit/[id] | ▾ View Fare Breakdown | toggle | Opens and closes correctly (native element, no JS needed). The itemisation it reveals is the hard-coded fallba | works | `apps/web/app/pandit/[id]/TravelOptionsTab.tsx:148-164` |
| /pandit/[id] | Your Event City: | input | Works. onChange sets customerCity and mirrors it to the URL via router.replace(`?city=..`, {scroll:false}) (Tr | works | `apps/web/app/pandit/[id]/TravelOptionsTab.tsx:76-89` |
| /pandit/[id] | ABOUT | tab | Works. profile-tabs.tsx:22 defines key 'about'; packages/ui/src/tabs.tsx:25-28 renders a real <button type="bu | works | `apps/web/app/pandit/[id]/profile-tabs.tsx:22, packages/ui/src/tabs.tsx` |
| /pandit/[id] | ABOUT | tab | Works. profile-tabs.tsx:22 defines key 'about'; packages/ui/src/tabs.tsx:28 fires onClick={() => onChange(tab. | works | `apps/web/app/pandit/[id]/profile-tabs.tsx:22, packages/ui/src/tabs.tsx` |
| /pandit/[id] | SERVICES & PRICING | tab | Works. key 'services' -> onChange -> setActiveTab -> renders <ServicesTab/> (page.tsx:150-156, profile-tabs.ts | works | `apps/web/app/pandit/[id]/profile-tabs.tsx:23, packages/ui/src/tabs.tsx` |
| /pandit/[id] | TRAVEL OPTIONS | tab | Works. key 'travel' -> renders <TravelOptionsTab/> (page.tsx:158-164, profile-tabs.tsx:36). Checked for the ob | works | `apps/web/app/pandit/[id]/profile-tabs.tsx:24, packages/ui/src/tabs.tsx` |
| /pandit/[id] | REVIEWS | tab | Works. key 'reviews' -> renders <ReviewSummary/> (page.tsx:166-168, profile-tabs.tsx:37). | works | `apps/web/app/pandit/[id]/profile-tabs.tsx:25, packages/ui/src/tabs.tsx` |
| /pandit/[id] | AVAILABILITY | tab | Works mechanically. key 'availability' -> renders <AvailabilityCalendar/> (page.tsx:170-172, profile-tabs.tsx: | works | `apps/web/app/pandit/[id]/profile-tabs.tsx:26, packages/ui/src/tabs.tsx` |
| /profile | (none — the file renders no elements) | other | The entire component body is redirect("/dashboard/profile"). There are no interactive elements to inventory on | works | `apps/web/app/profile/page.tsx:3-5` |
| /stitched | {formatName(screen)} — e.g. "24 7 Support &  | card | <a href={`/screens/${screen}.html`} target="_blank" rel="noopener noreferrer"> — a static file under apps/web/ | works | `apps/web/app/stitched/page.tsx:91-121 (control), :9-67 (slug list); ap` |
| /stitched | {formatName(screen)} — e.g. "24 7 Support &  | card | <a href={`/screens/${screen}.html`} target="_blank" rel="noopener noreferrer"> — a static file under apps/web/ | works | `apps/web/app/stitched/page.tsx:91-121 (control), :9-67 (slug list); as` |
| /voice-search | HmarePanditJi | link | Link href="/" | works | `apps/web/app/voice-search/page.tsx:17-24` |
| /voice-search | Home | link | Link href="/" | works | `apps/web/app/voice-search/page.tsx:27` |
| /voice-search | Pandits | link | Link href="/search" | works | `apps/web/app/voice-search/page.tsx:28` |
| /voice-search | Pooja | link | Link href="/search" — the same destination as 'Pandits'. /search has no pooja-first mode; its heading falls ba | works | `apps/web/app/voice-search/page.tsx:28,29; apps/web/src/app/search/sear` |
| /voice-search | Pooja | link | Link href="/search" — same destination as "Pandits", no pooja-specific view | works | `apps/web/app/voice-search/page.tsx:29` |
| /voice-search | Muhurat | link | Link href="/muhurat" | works | `apps/web/app/voice-search/page.tsx:30` |
| /voice-search | (X close icon) | link | Link href="/" wrapping lucide <X size={24} /> | works | `apps/web/app/voice-search/page.tsx:39-41` |
| /voice-search | (X close icon, no text) | link | Link href="/" wrapping lucide <X size={24} /> | works | `apps/web/app/voice-search/page.tsx:39-41` |
| every screen (CartSidebar, filled  | Proceed to Book → | button | handleProceed builds `/booking/new?panditId=…&pujaType=…&samagriSource=…[&samagriPackageId=…]` (a route that e | works | `apps/web/components/CartSidebar.tsx:138-143 (control), :25-40 (handler` |
| every screen (CartSidebar, filled  | Continue Browsing | button | onClick={() => setIsCartOpen(false)} — closes the drawer, preserving the selection. | works | `apps/web/components/CartSidebar.tsx:144-149` |
| every screen (CartSidebar, filled  | Remove from Cart | button | onClick={clearCart} from useSamagriCart (apps/web/context/SamagriCartContext.tsx). Destructive and IMMEDIATE — | works | `apps/web/components/CartSidebar.tsx:150-155; asymmetric confirm at app` |
| every screen (CartSidebar, filled  | Remove from Cart | button | onClick={clearCart} from useSamagriCart (apps/web/context/SamagriCartContext.tsx). Destructive and IMMEDIATE — | works | `apps/web/components/CartSidebar.tsx:150-155; asymmetric confirm at app` |
| every screen (CartSidebar) | (drawer backdrop, no label) | other | onClick={() => setIsCartOpen(false)}. | works | `apps/web/components/CartSidebar.tsx:44-47` |
| every screen (CartSidebar) | ✕ | button | onClick={() => setIsCartOpen(false)} from useSamagriCart. The whole drawer is gated on `mounted && isCartOpen` | works | `apps/web/components/CartSidebar.tsx:53-58` |
| every screen (CartSidebar, mounted | ✕ | button | onClick={() => setIsCartOpen(false)} from useSamagriCart. The whole drawer is gated on `mounted && isCartOpen` | works | `apps/web/components/CartSidebar.tsx:53-58; mounted at apps/web/app/lay` |
| every screen (CartSidebar, empty s | Continue Browsing | button | onClick={() => setIsCartOpen(false)} — closes the drawer, no navigation. Rendered only when `selection` is nul | works | `apps/web/components/CartSidebar.tsx:66-71` |
| every screen (CartSidebar, empty s | Continue Browsing | button | onClick={() => setIsCartOpen(false)} — closes the drawer, no navigation. Rendered only when `selection` is nul | works | `apps/web/components/CartSidebar.tsx:66-71, gate at :62` |
| every screen (global Footer) | Find a Pandit | link | <Link href="/search"> — route exists (apps/web/app/search/page.tsx). MISSED by the prior report. | works | `apps/web/components/Footer.tsx:24` |
| (all screens — global footer) | Find a Pandit | link | Link href="/search"; Footer renders on every route via app/layout.tsx:98 | works | `apps/web/components/Footer.tsx:24; apps/web/app/layout.tsx:98` |
| (all screens — global footer) | Upcoming Puja | link | Link href="/muhurat" | works | `apps/web/components/Footer.tsx:25` |
| every screen (global Footer) | For Pandits | link | <a href={panditAppUrl} target="_blank"> where panditAppUrl = process.env.NEXT_PUBLIC_PANDIT_URL \|\| "http://l | works | `apps/web/components/Footer.tsx:27, :4` |
| (all screens — global footer) | Privacy Policy | link | Link href="/privacy"; route exists at apps/web/app/(legal)/privacy | works | `apps/web/components/Footer.tsx:35` |
| (all screens — global footer) | Terms of Service | link | Link href="/terms"; route exists at apps/web/app/(legal)/terms | works | `apps/web/components/Footer.tsx:36` |
| (all screens — global footer) | Cancellation Policy | link | Link href="/cancellation-policy"; route exists at apps/web/app/(legal)/cancellation-policy | works | `apps/web/components/Footer.tsx:37` |
| (all screens — global footer) | For Pandits | link | <a href={panditAppUrl} target="_blank">; NEXT_PUBLIC_PANDIT_URL set at .env.vercel:12 | works | `apps/web/components/Footer.tsx:4,27; .env.vercel:12` |
| /booking/new and /booking-confirme | Admin Portal | link | <a href={adminAppUrl} target="_blank" rel="noopener noreferrer"> where adminAppUrl = process.env.NEXT_PUBLIC_A | works | `apps/web/components/Footer.tsx:5,54-57; env .env.vercel:13` |
| (all screens — global footer) | Admin Portal | link | <a href={adminAppUrl} target="_blank">, NEXT_PUBLIC_ADMIN_URL set at .env.vercel:13 (https://admin.hmarepandit | works | `apps/web/components/Footer.tsx:5,55-57; .env.vercel:13` |
| every screen (global Footer) | Admin Portal | link | <a href={adminAppUrl} target="_blank"> where adminAppUrl = process.env.NEXT_PUBLIC_ADMIN_URL \|\| "http://loca | works | `apps/web/components/Footer.tsx:55, :5` |
| /booking/new and /booking-confirme | Sign In | button | onClick={openLoginModal} from the shared auth context — the same modal the wizard opens at step 4 (booking-wiz | works | `apps/web/components/Header.tsx:112-118,191-202,38` |
| (all screens — global header) | Sign In | button | onClick=openLoginModal -> auth-context.tsx:211 setLoginModalOpen(true) -> AuthModal (rendered in app/layout.ts | works | `apps/web/components/Header.tsx:112-118; apps/web/src/context/auth-cont` |
| (all screens — global header) | Sign In | button | onClick=openLoginModal -> auth-context.tsx:211 setLoginModalOpen(true) -> AuthModal, mounted globally at app/l | works | `apps/web/components/Header.tsx:112-118; apps/web/src/context/auth-cont` |
| /booking/new and /booking-confirme | My Bookings | link | <Link href="/dashboard/bookings"> — target exists (apps/web/app/dashboard/bookings/page.tsx). `hidden sm:block | works | `apps/web/components/Header.tsx:122-127` |
| (all screens — global header) | My Bookings | link | Link href="/dashboard/bookings"; route exists. Caveat that changes the picture at 360px: className is `hidden  | works | `apps/web/components/Header.tsx:122-127,191-202` |
| all /dashboard/* (root-layout glob | (no text — aria-label "Toggle menu", 3-bar h | button | onClick -> setMobileOpen(!mobileOpen) (Header.tsx:136), which renders the drawer at :165-204. `md:hidden`, so  | works | `apps/web/components/Header.tsx:134-137, drawer at :165` |
| (all screens — global header) | (hamburger / X svg, aria-label "Toggle menu" | button | onClick -> setMobileOpen(!mobileOpen); the drawer renders at :165-204 and the icon path swaps at :145-159 | works | `apps/web/components/Header.tsx:134-161,165` |
| (all screens — global header) | Home / Find Pandits / Muhurat Explorer / For | link | Same hrefs as desktop plus onClick setMobileOpen(false); external entry uses target="_blank" | works | `apps/web/components/Header.tsx:167-190` |
| (all screens — global header) | Home / Find Pandits / Muhurat Explorer / For | link | Same hrefs as the desktop nav, plus onClick setMobileOpen(false); the external entry keeps target="_blank". Th | works | `apps/web/components/Header.tsx:167-190` |
| (all screens — global header) | Sign In | button | onClick -> setMobileOpen(false) then openLoginModal(); rendered only when isGuest (:191) | works | `apps/web/components/Header.tsx:191-202` |
| (all screens — global header) | Sign In | button | onClick -> setMobileOpen(false) then openLoginModal() | works | `apps/web/components/Header.tsx:192-201` |
| (all screens — global header) | For Pandits | link | <a href={panditAppUrl} target="_blank" rel="noopener noreferrer">, panditAppUrl = process.env.NEXT_PUBLIC_PAND | works | `apps/web/components/Header.tsx:42,48,72-81; .env.vercel:12` |
| all /dashboard/* (root-layout glob | Home · Find Pandits · Muhurat Explorer · For | link | navLinks (Header.tsx:44-49) -> "/", "/search", "/muhurat", and panditAppUrl (external, target="_blank"). All t | works | `apps/web/components/Header.tsx:44-49, 167-190` |
| /booking/new and /booking-confirme | Home / Find Pandits / Muhurat Explorer / For | link | Next <Link href> to / , /search and /muhurat — all three in the known route list; 'For Pandits' is an <a targe | works | `apps/web/components/Header.tsx:44-49,70-93,165-190; env .env.vercel:12` |
| (all screens — global header) | Home | link | Link href="/" from navLinks; the desktop nav is `hidden md:flex` (:70) so at 360px this renders only inside th | works | `apps/web/components/Header.tsx:45,70,83-90,180-188` |
| (all screens — global header) | Home | link | Link href="/" from navLinks | works | `apps/web/components/Header.tsx:45,83-90` |
| (all screens — global header) | Find Pandits | link | Link href="/search" | works | `apps/web/components/Header.tsx:46` |
| (all screens — global header) | Find Pandits | link | Link href="/search"; route exists | works | `apps/web/components/Header.tsx:46,83-90` |
| (all screens — global header) | Muhurat Explorer | link | Link href="/muhurat" — note NOT /muhurat-explorer. That route exists and unconditionally redirects here, and n | works | `apps/web/components/Header.tsx:47; apps/web/app/muhurat-explorer/page.` |
| (all screens — global header) | ? | button | onClick=replayTutorial: on "/" dispatches window Event("hpj-open-tutorial"), which app/page.tsx:418 listens fo | works | `apps/web/components/Header.tsx:51-57,96-104; apps/web/app/page.tsx:403` |
| (all screens — global header) | ? | button | onClick=replayTutorial: on pathname "/" it dispatches window Event("hpj-open-tutorial"), which app/page.tsx:41 | works | `apps/web/components/Header.tsx:51-57,96-104; apps/web/app/page.tsx:403` |
| all /dashboard/* (root-layout glob | HmarePanditJi | link | <Link href="/"> — route exists (apps/web/app/page.tsx). This is the only always-visible-at-360px escape from t | works | `apps/web/components/Header.tsx:64 (mounted at apps/web/app/layout.tsx:` |
| /booking/new and /booking-confirme | HmarePanditJi | link | <Link href="/"> — works. Recorded because the OTHER header rendered on /booking-confirmed shows the same wordm | works | `apps/web/components/Header.tsx:64-68` |
| (all screens — global header) | HmarePanditJi | link | Link href="/"; Header is rendered on every route by app/layout.tsx:96 (no route group in scope overrides it —  | works | `apps/web/components/Header.tsx:64-68; apps/web/app/layout.tsx:96` |
| all /dashboard/* (root-layout glob | ? | button | onClick -> replayTutorial (Header.tsx:51-57): on any non-"/" pathname it sets window.location.href = "/?tutori | works | `apps/web/components/Header.tsx:96-103 -> :51-57 -> apps/web/app/page.t` |
| /booking/new and /booking-confirme | ? | button | onClick replayTutorial (:51-57): off the home page it sets window.location.href = "/?tutorial=1" — a FULL page | works | `apps/web/components/Header.tsx:96-104,51-57; listener apps/web/app/pag` |
| /pandit/[id] · SamagriModal (MISSE | Pandit Ji's Package | tab | Works. onClick={() => setActiveTab("PANDIT")}; the PANDIT panel renders at SamagriModal.tsx:232-300. | works | `apps/web/components/SamagriModal.tsx:212-220` |
| /pandit/[id] (apps/web/components/ | Build Your Own List | tab | onClick={() => setActiveTab("CUSTOM")}, tripping the effect at :81-104 which GETs `${apiBase}/samagri/catalog? | works | `apps/web/components/SamagriModal.tsx:221-229 (control), :81-104 (fetch` |
| /pandit/[id] (components/SamagriMo | Build Your Own List | tab | onClick={() => setActiveTab("CUSTOM")}, which trips the effect at :81-104 that GETs `${apiBase}/samagri/catalo | works | `apps/web/components/SamagriModal.tsx:221-229 (control), :81-104 (fetch` |
| /pandit/[id] · SamagriModal (MISSE | Build Your Own List | tab | Works, and — unlike the two root-relative fetches elsewhere on this screen — its data source really resolves.  | works | `apps/web/components/SamagriModal.tsx:221-229, :81-104` |
| /pandit/[id] · SamagriModal (MISSE | Basic / Standard / Premium | card | Works. The whole card div carries onClick={() => setSelectedPackageId(pkg.id)} and the radio dot at :253-256 t | works | `apps/web/components/SamagriModal.tsx:243-249` |
| /pandit/[id] (apps/web/components/ | {tierLabel(pkg.tier)} — "Basic" / "Standard" | card | onClick={() => setSelectedPackageId(pkg.id)} on the card div, cursor-pointer. The radio dot is presentational  | works | `apps/web/components/SamagriModal.tsx:243-249 (control), :31-36 (tierLa` |
| /pandit/[id] · SamagriModal (MISSE | View Items ▾ / Hide Items ▴ | toggle | Works. onClick with e.stopPropagation() (so it does not also re-select the card) toggles expandedPackageId; th | works | `apps/web/components/SamagriModal.tsx:263-268` |
| /pandit/[id] (apps/web/components/ | View Items ▾ / Hide Items ▴ | button | onClick with e.stopPropagation() so it does not also select the card, toggling expandedPackageId; renders pkg. | works | `apps/web/components/SamagriModal.tsx:263-268, list at :270-276` |
| /pandit/[id] · SamagriModal (MISSE | Add to Cart — ₹<price> | button | Works end to end. onClick=handleAddToCart (:106-166) -> window.confirm if a cart already exists (:108) -> setS | works | `apps/web/components/SamagriModal.tsx:291-296` |
| /pandit/[id] (apps/web/components/ | Add to Cart — ₹{selectedPkg.price} | button | onClick={handleAddToCart}: window.confirm("You already have Samagri in your cart. Replace your existing select | works | `apps/web/components/SamagriModal.tsx:291-296 (control), :106-166 (hand` |
| /pandit/[id] (apps/web/components/ | ▼ {cat.name} ({n} items) / ▶ {cat.name} ({n} | button | onClick toggles expandedCategories[cat.name]; all categories initialise expanded on fetch (:95-99). | works | `apps/web/components/SamagriModal.tsx:311-316` |
| /pandit/[id] · SamagriModal (MISSE | (item checkbox, unlabelled — adjacent text i | input | Works. Controlled checkbox, onChange={() => toggleItemSelect(item.id)} (:331) -> :180-189 sets quantity 1 or d | works | `apps/web/components/SamagriModal.tsx:328-333` |
| /pandit/[id] (apps/web/components/ | (item checkbox, no text label; row shows "{i | input | onChange={() => toggleItemSelect(item.id)} — sets quantity 1 or deletes the key (:180-189). Drives customTotal | works | `apps/web/components/SamagriModal.tsx:328-333, :180-189` |
| /pandit/[id] (apps/web/components/ | − | button | onClick={() => handleItemQuantity(item.id, -1)} — deletes the key entirely at 0 (:171-175), which also uncheck | works | `apps/web/components/SamagriModal.tsx:346, :168-178` |
| /pandit/[id] · SamagriModal (MISSE | − / + | button | Works. onClick={() => handleItemQuantity(item.id, -1)} and (+1) -> :168-178; hitting 0 removes the item entire | works | `apps/web/components/SamagriModal.tsx:346, :348` |
| /pandit/[id] (apps/web/components/ | + | button | onClick={() => handleItemQuantity(item.id, 1)}. | works | `apps/web/components/SamagriModal.tsx:348, :168-178` |
| /pandit/[id] · SamagriModal (MISSE | Add Custom List to Cart — ₹<total> | button | Works. Same handler, PLATFORM_CUSTOM branch (:129-161). Correctly disabled while nothing is ticked (`disabled= | works | `apps/web/components/SamagriModal.tsx:375-381` |
| /pandit/[id] (apps/web/components/ | Add Custom List to Cart — ₹{customTotal} | button | onClick={handleAddToCart} on the CUSTOM branch: builds itemsList from the fetched catalogue, alert("Please sel | works | `apps/web/components/SamagriModal.tsx:375-381 (control), :129-161 (hand` |
| /search | प्रोफ़ाइल देखें | button | PanditRecordCard's full-width footer button; onClick=onOpenProfile, wired at search-client.tsx:823 to router.p | works | `apps/web/components/design/PanditRecordCard.tsx:241-246; apps/web/src/` |
| /search | Clear All | button | onClick=onReset -> resetFilters -> defaultFilters({}) + search(fresh,1). Note defaultFilters re-seeds regions  | works | `apps/web/src/app/search/search-client.tsx:414-419, 622-626` |
| /search | Clear All | button | onClick=onReset -> resetFilters -> defaultFilters({}) then search(fresh,1) — a real refetch. It does not empty | works | `apps/web/src/app/search/search-client.tsx:414-419, 622-626, 579-582` |
| /search | Filters | button | onClick -> setSidebarOpen(true); the drawer renders at :653-673 | works | `apps/web/src/app/search/search-client.tsx:644-651` |
| /search | Filters | button | onClick -> setSidebarOpen(true), renders the drawer at :653-673 | works | `apps/web/src/app/search/search-client.tsx:645-650` |
| /search | (mobile drawer backdrop) | other | onClick -> setSidebarOpen(false); inner panel stops propagation at :660 | works | `apps/web/src/app/search/search-client.tsx:653-660` |
| /search | (mobile drawer backdrop, no label) | other | onClick -> setSidebarOpen(false); the inner panel stops propagation at :660 | works | `apps/web/src/app/search/search-client.tsx:653-661` |
| /search | Retry | button | onClick=applyFilters -> search(filters,1) | works | `apps/web/src/app/search/search-client.tsx:758-767` |
| /search | Retry | button | onClick=applyFilters -> search(filters,1) | works | `apps/web/src/app/search/search-client.tsx:761-766` |
| /search | Clear All Filters | button | onClick=resetFilters -> defaultFilters({}) + search(fresh,1) | works | `apps/web/src/app/search/search-client.tsx:788-793` |
| /search | प्रोफ़ाइल देखें | button | PanditRecordCard onOpenProfile -> router.push(`/pandit/${pandit.id}`); the button is wired at components/desig | works | `apps/web/src/app/search/search-client.tsx:823; apps/web/components/des` |
| /search | Load More ({n} more) | button | onClick=loadMore -> fetchPandits(filters, pagination.page+1) then appends; the button renders only while page  | works | `apps/web/src/app/search/search-client.tsx:835-844, 630-637` |
| /search | Load More ({n} more) | button | onClick=loadMore -> fetchPandits(filters, page+1) and appends; rendered only when page < totalPages | works | `apps/web/src/app/search/search-client.tsx:837-842, 630-637` |
| /pandit/[id] · LoginModal→LoginFor | 🙏 मैं ग्राहक हूँ | button | Works, but is a no-op in practice from here: onClick={() => { setRole('CUSTOMER'); setStep(1); setError(''); } | works | `apps/web/src/components/LoginForm.tsx:173-180` |
| /pandit/[id] · LoginModal→LoginFor | 📿 मैं पंडित हूँ | button | Navigates away instead of toggling: window.location.href = process.env.NEXT_PUBLIC_PANDIT_URL \|\| 'http://loc | works | `apps/web/src/components/LoginForm.tsx:181-191` |
| /pandit/[id] and /search (LoginFor | 98765 43210 (placeholder; label मोबाइल नंबर) | input | type="tel", onChange strips non-digits and slices to 10; autoFocus; disabled while loading. Gates the submit ( | works | `apps/web/src/components/LoginForm.tsx:213-221` |
| /pandit/[id] · LoginModal→LoginFor | मोबाइल नंबर | input | Works. Controlled input, onChange strips non-digits and caps at 10 (:216). | works | `apps/web/src/components/LoginForm.tsx:213-221` |
| /pandit/[id] · LoginModal→LoginFor | OTP भेजें → | button | Works. type="submit" inside <form onSubmit={handleSendOtp}> (:208, :226-236) -> POST `${API_BASE}/auth/request | works | `apps/web/src/components/LoginForm.tsx:226-236` |
| /pandit/[id] and /search (LoginFor | OTP भेजें → | button | onSubmit -> handleSendOtp: POST `${API_BASE}/auth/request-otp` — a DIFFERENT endpoint from /login's /auth/send | works | `apps/web/src/components/LoginForm.tsx:226-236 (control), :38-65 (handl` |
| /pandit/[id] · LoginModal→LoginFor | [बदलें] | button | Works. onClick={() => setStep(1)} (:248). | works | `apps/web/src/components/LoginForm.tsx:248-250` |
| /pandit/[id] · LoginModal→LoginFor | डेवलपमेंट मोड: 1-2-3-4-5-6 का उपयोग करें | input | Works, and — checked precisely because that banner would be a lie if the bypass had been removed — the bypass  | works | `apps/web/src/components/LoginForm.tsx:253-257, packages/ui/src/otp-inp` |
| /pandit/[id] and /search (LoginFor | (six OTP boxes from @hmarepanditji/ui, no te | input | <OtpInput length={6} onComplete={verifyOtpSubmit} disabled={loading} />; packages/ui/src/otp-input.tsx:29-31 f | works | `apps/web/src/components/LoginForm.tsx:257 (wiring), :67-102 (handler);` |
| every screen (LoginForm inside Log | (six OTP boxes from @hmarepanditji/ui, no te | input | <OtpInput length={6} onComplete={verifyOtpSubmit} disabled={loading} /> — packages/ui/src/otp-input.tsx:30 fir | works | `apps/web/src/components/LoginForm.tsx:257 (wiring), :67-102 (handler);` |
| /pandit/[id] · LoginModal→LoginFor | OTP फिर से भेजें | button | Works. onClick=handleSendOtp (:269) re-posts and resets countdown to 30 (:58). | works | `apps/web/src/components/LoginForm.tsx:267-274` |
| every screen (LoginForm inside Log | OTP फिर से भेजें | button | onClick={handleSendOtp} — note this passes the React click event as the `e` argument, which is correct here be | works | `apps/web/src/components/LoginForm.tsx:267-274, gate at :262` |
| /pandit/[id] and /search (LoginFor | आपका पूरा नाम (placeholder) | input | onChange={(e) => setName(e.target.value)}, autoFocus, disabled while loading. | works | `apps/web/src/components/LoginForm.tsx:296-304` |
| /pandit/[id] · LoginModal→LoginFor | शुरू करें → | button | Works. type="submit" in <form onSubmit={handleNameSubmit}> (:282, :307-317) -> PATCH `${API_BASE}/auth/me` (:1 | works | `apps/web/src/components/LoginForm.tsx:307-317` |
| every screen (LoginForm inside Log | शुरू करें → | button | onSubmit -> handleNameSubmit: PATCH `${API_BASE}/auth/me` with Bearer localStorage 'hpj_token', requires data. | works | `apps/web/src/components/LoginForm.tsx:307-317 (control), :104-133 (han` |
| /pandit/[id] and /search (LoginFor | शुरू करें → | button | onSubmit -> handleNameSubmit: PATCH `${API_BASE}/auth/me` with Bearer localStorage 'hpj_token', requires data. | works | `apps/web/src/components/LoginForm.tsx:307-317 (control), :104-133 (han` |
| every screen (LoginModal wrapper) | (modal backdrop, no label) | other | packages/ui/src/modal.tsx:55-58 renders a backdrop with onClick={onClose}; Escape also closes via the keydown  | works | `apps/web/src/components/LoginModal.tsx:28-32; packages/ui/src/modal.ts` |
| /pandit/[id] and /search (LoginMod | (modal backdrop, no label) | other | packages/ui/src/modal.tsx:55-59 renders a backdrop with onClick={onClose}; Escape closes via the keydown liste | works | `apps/web/src/components/LoginModal.tsx:28-32; packages/ui/src/modal.ts` |
| /booking/new | Retry Payment | button | onClick={() => void openModal()} — reloads checkout.js if needed and re-opens the Razorpay modal with the same | works | `apps/web/src/components/RazorpayCheckout.tsx:234-240,126-192` |
| /booking/new (step 5) | Retry Payment | button | onClick={() => void openModal()} — reloads checkout.js if needed and re-opens the Razorpay modal with the same | works | `apps/web/src/components/RazorpayCheckout.tsx:234-240,126-192,203-212` |
| /booking/new | Complete Payment · ₹<amount> | button | onClick={() => void openModal()} re-opens the same order. Amount text comes from rupees(amount) (:38-40) where | works | `apps/web/src/components/RazorpayCheckout.tsx:257-263,38-40` |
| /booking/new (step 5) | Complete Payment · ₹<amount> | button | onClick={() => void openModal()} re-opens the same order. The amount text is rupees(amount) (:38-40) over form | works | `apps/web/src/components/RazorpayCheckout.tsx:257-263,38-40; booking-wi` |
| every screen (AuthModal) | (six OTP boxes; aria-label "OTP digit 1"…"OT | input | Per-box onChange auto-advances; Backspace on empty goes back; a container onPaste (:42-48, :51) strips non-dig | works | `apps/web/src/components/auth-modal.tsx:13-78, :422, :283-287` |
| every screen (AuthModal) | (modal backdrop, no label) | other | onClick={closeLoginModal}; Escape wired at :139-146. | works | `apps/web/src/components/auth-modal.tsx:301-304, :139-146` |
| every screen (AuthModal, mounted a | close (Material icon; aria-label "Close") | button | onClick={closeLoginModal} from useAuth (apps/web/src/context/auth-context.tsx:212). Genuinely reachable: openL | works | `apps/web/src/components/auth-modal.tsx:309-315; mounted at apps/web/ap` |
| every screen (AuthModal) | 98765 43210 (placeholder; label "Mobile Numb | input | type=tel, inputMode=numeric, pattern=[6-9][0-9]{9}, maxLength=10; onChange strips non-digits and clears the er | works | `apps/web/src/components/auth-modal.tsx:349-366` |
| every screen (AuthModal) | Send OTP | button | onClick={handleSendOtp}: validates /^[6-9]\d{9}$/, POSTs `${API_BASE}/auth/request-otp` with role:"CUSTOMER" h | works | `apps/web/src/components/auth-modal.tsx:376-392 (control), :150-179 (ha` |
| every screen (AuthModal) | Change number | button | onClick={() => { setStep("phone"); setOtp(""); setError(""); }}. | works | `apps/web/src/components/auth-modal.tsx:403-409` |
| every screen (AuthModal) | Verify OTP | button | onClick={handleVerifyOtp}: POSTs `${API_BASE}/auth/verify-otp` with {phone, otp} — sends NO role field, unlike | works | `apps/web/src/components/auth-modal.tsx:432-448 (control), :183-225 (ha` |
| every screen (AuthModal) | Resend OTP | button | onClick clears otp and error then calls handleSendOtp(). Rendered only when countdown === 0 (gate at :451). | works | `apps/web/src/components/auth-modal.tsx:459-468` |
| every screen (AuthModal) | Resend OTP | button | onClick clears otp and error then calls handleSendOtp(). Rendered only when countdown === 0. | works | `apps/web/src/components/auth-modal.tsx:459-468, gate at :451` |
| every screen (AuthModal) — develop | {devOtp} (the six-digit code itself; title=" | button | onClick={() => setOtp(devOtp)}, which trips the auto-submit effect at :283-287. Correctly gated on process.env | works | `apps/web/src/components/auth-modal.tsx:478-485, gate at :473` |
| every screen (AuthModal) | Ramesh Kumar (placeholder; label "Full Name  | input | onChange sets fullName and clears the error; Enter fires handleProfileSubmit; nameRef auto-focused 50 ms after | works | `apps/web/src/components/auth-modal.tsx:527-535` |
| every screen (AuthModal) | ramesh@example.com (placeholder; label "Emai | input | onChange sets email; Enter fires handleProfileSubmit; only included in the PATCH body when non-empty (:238). | works | `apps/web/src/components/auth-modal.tsx:548-555` |
| every screen (AuthModal) | Complete Profile | button | onClick={handleProfileSubmit}: requires fullName.trim().length >= 2, PATCHes `${API_BASE}/auth/me` with Bearer | works | `apps/web/src/components/auth-modal.tsx:567-583 (control), :229-261 (ha` |
| every screen (AuthModal) | Skip for now | button | onClick={handleSkipProfile}: GETs `${API_BASE}/auth/me` with Bearer accessTokenTemp, calls login() if ok, and  | works | `apps/web/src/components/auth-modal.tsx:585-590 (control), :265-276 (ha` |
| /booking/new (step 3) | North Indian / South Indian / East Indian /  | tab | onClick setActiveTab(region.id) -> renders VARIATIONS[activeTab] (4/4/3/3 cards). Purely local, which is corre | works | `apps/web/src/components/booking/RitualVariationSelection.tsx:56-69,10-` |
| /booking/new | South Indian | tab | onClick setActiveTab("south") -> renders VARIATIONS.south (4 cards) | works | `apps/web/src/components/booking/RitualVariationSelection.tsx:58-68` |
| /booking/new | East Indian | tab | onClick setActiveTab("east") -> renders VARIATIONS.east (3 cards) | works | `apps/web/src/components/booking/RitualVariationSelection.tsx:58-68` |
| /booking/new | West Indian | tab | onClick setActiveTab("west") -> renders VARIATIONS.west (3 cards) | works | `apps/web/src/components/booking/RitualVariationSelection.tsx:58-68` |
| /booking/new | North Indian | tab | onClick setActiveTab("north") -> renders VARIATIONS.north (4 cards) | works | `apps/web/src/components/booking/RitualVariationSelection.tsx:58-68 (mo` |
| /booking/new (src/components/samag | close (Material icon, no text label) | button | onClick={onClose} -> setShowSamagriModal(false) in the wizard (apps/web/app/booking/new/booking-wizard-client. | works | `apps/web/src/components/samagri/SamagriModal.tsx:140-145` |
| /booking/new (SamagriModal, step 4 | (no label — material icon close) | button | onClick={onClose} -> setShowSamagriModal(false) (booking-wizard-client.tsx:1669). It is the ONLY exit: the bac | works | `apps/web/src/components/samagri/SamagriModal.tsx:140-145,130; wizard h` |
| /booking/new (apps/web/src/compone | close (Material icon, no text label) | button | onClick={onClose} -> setShowSamagriModal(false) in the wizard. The ONLY dismiss affordance — no backdrop tap,  | works | `apps/web/src/components/samagri/SamagriModal.tsx:140-145; apps/web/app` |
| /booking/new (SamagriModal, step 4 | (no label — material icon remove_circle_outl | button | onClick={() => handleDecrement(item.id)} -> setCustomCounts clamped at 0 (:120-122). Handler is real and feeds | works | `apps/web/src/components/samagri/SamagriModal.tsx:242-244,120-122,241` |
| /booking/new (src/components/samag | remove_circle_outline (Material icon, no tex | button | onClick={() => handleDecrement(item.id)} — clamps at 0 via Math.max. Same hover-only visibility trap as the in | works | `apps/web/src/components/samagri/SamagriModal.tsx:242-244; :241` |
| /booking/new (apps/web/src/compone | remove_circle_outline (Material icon, no tex | button | onClick={() => handleDecrement(item.id)} — clamps at 0 via Math.max (:121). Same hover-only visibility trap. | works | `apps/web/src/components/samagri/SamagriModal.tsx:242-244; :241; :120-1` |
| /booking/new (src/components/samag | add_circle_outline (Material icon, no text l | button | onClick={() => handleIncrement(item.id)} — correctly bumps customCounts and the total re-computes. MOBILE TRAP | works | `apps/web/src/components/samagri/SamagriModal.tsx:246-248 (control); :2` |
| /booking/new (SamagriModal, step 4 | (no label — material icon add_circle_outline | button | onClick={() => handleIncrement(item.id)} -> setCustomCounts +1 (:116-118); feeds currentCustomTotal (:125-127) | works | `apps/web/src/components/samagri/SamagriModal.tsx:246-248,116-118,241` |
| /booking/new (apps/web/src/compone | add_circle_outline (Material icon, no text l | button | onClick={() => handleIncrement(item.id)} — bumps customCounts, total recomputes. MOBILE TRAP CONFIRMED: the st | works | `apps/web/src/components/samagri/SamagriModal.tsx:246-248; :241; :132, ` |
| /booking/new (src/components/samag | Select Fixed Package | button | onSelect({ type: "package", totalCost: panditTotal, items: [] }) where panditTotal is the literal `const pandi | works | `apps/web/src/components/samagri/SamagriModal.tsx:280-287 (control), :1` |
| /booking/new (apps/web/src/compone | Select Fixed Package | button | onSelect({ type: "package", totalCost: panditTotal, items: [] }) where panditTotal is the literal `const pandi | works | `apps/web/src/components/samagri/SamagriModal.tsx:280-287 (control), :1` |
| /booking/new (src/components/samag | Use Custom List | button | onSelect({ type: "custom", totalCost: currentCustomTotal, items: customCounts as any }). currentCustomTotal is | works | `apps/web/src/components/samagri/SamagriModal.tsx:288-298 (control), :1` |
| /booking/new (apps/web/src/compone | Use Custom List | button | onSelect({ type: "custom", totalCost: currentCustomTotal, items: customCounts as any }). currentCustomTotal su | works | `apps/web/src/components/samagri/SamagriModal.tsx:288-298 (control), :1` |
| /booking/new (SamagriModal, step 4 | Use Custom List | button | onClick={() => onSelect({ type: "custom", totalCost: currentCustomTotal, items: customCounts })} at :289 — the | works | `apps/web/src/components/samagri/SamagriModal.tsx:288-298,125-127,20-10` |
| /pandit/[id] · SamagriModal + Logi | (no label — the dimmed backdrop) | other | Works, but is the only pointer dismissal. packages/ui/src/modal.tsx renders its "Close modal" X button only in | works | `packages/ui/src/modal.tsx:55-59 (absent X: :68-83 vs apps/web/componen` |

---

## TABLE 3 · COMPONENTS

Every reusable piece in the shipped bundle.

| Component | File | Used by | Props | States implemented |
|---|---|---|---|---|
| `BookingWizardClient` | `apps/web/app/booking/new/booking-wizard-client.tsx` | page.tsx | current, steps | loading, disabled, error, empty |
| `getEventIcon` | `apps/web/app/dashboard/components/BookingCard.tsx` | page.tsx | booking | error |
| `DashboardNav` | `apps/web/app/dashboard/components/DashboardNav.tsx` | layout.tsx | (none) | **default only** |
| `DocumentCard` | `apps/web/app/dashboard/components/DocumentCard.tsx` | page.tsx | title, icon, actionText, onAction, description | **default only** |
| `ItineraryTimeline` | `apps/web/app/dashboard/components/ItineraryTimeline.tsx` | page.tsx | booking | **default only** |
| `MuhuratPatrika` | `apps/web/app/dashboard/components/MuhuratPatrika.tsx` | page.tsx | booking | error |
| `PujaCompletionModal` | `apps/web/app/dashboard/components/PujaCompletionModal.tsx` | page.tsx | booking, onClose | **default only** |
| `AvailabilityCalendar` | `apps/web/app/pandit/[id]/AvailabilityCalendar.tsx` | page.tsx | panditId | loading, disabled, error, empty, pressed |
| `BookingCTA` | `apps/web/app/pandit/[id]/BookingCTA.tsx` | page.tsx | panditId: string; lowestPrice: number; isMobile?: boolean; | **default only** |
| `ServicesTab` | `apps/web/app/pandit/[id]/ServicesTab.tsx` | page.tsx | panditId, pujaServices, samagriPackages, | empty |
| `TravelOptionsTab` | `apps/web/app/pandit/[id]/TravelOptionsTab.tsx` | page.tsx | panditId, panditLocation, travelPreferences | loading, error, empty |
| `ProfileTabs` | `apps/web/app/pandit/[id]/profile-tabs.tsx` | page.tsx | aboutContent, servicesContent, travelContent, reviewsContent, availabilityContent | **default only** |
| `getStitchedScreens` | `apps/web/app/stitched/_lib/stitched-screens.ts` | page.tsx, route.ts | (none) | error |
| `CartSidebar` | `apps/web/components/CartSidebar.tsx` | layout.tsx | (none) | error, empty |
| `Footer` | `apps/web/components/Footer.tsx` | layout.tsx | (none) | **default only** |
| `Header` | `apps/web/components/Header.tsx` | page.tsx, layout.tsx | onSignIn: _onSignIn | loading |
| `tierLabel` | `apps/web/components/SamagriModal.tsx` | booking-wizard-client.tsx, ServicesTab.tsx | panditId: string; pujaType: string; packages: SamagriPackage[]; isOpen: boolean; onClose:  | disabled, error, empty |
| `GuestStrip` | `apps/web/components/design/GuestMode.tsx` | search-client.tsx | placement = "header" | **default only** |
| `PanditRecordCard` | `apps/web/components/design/PanditRecordCard.tsx` | search-client.tsx | name | empty |
| `IdentityVerifiedPill` | `apps/web/components/design/Verification.tsx` | GuestMode.tsx, PanditRecordCard.tsx, search-client.tsx | name, size = 17, filled = false, className = "" | empty |
| `SamagriCartProvider` | `apps/web/context/SamagriCartContext.tsx` | layout.tsx, CartSidebar.tsx, SamagriModal.tsx | children | error |
| `panditName` | `apps/web/lib/panditIdentity.ts` | page.tsx, page.tsx, page.tsx, page.tsx, page.tsx +4 | UNKNOWN | **default only** |
| `SearchClient` | `apps/web/src/app/search/search-client.tsx` | page.tsx | pandit, onBook, | loading, error, empty, pressed |
| `LoginForm` | `apps/web/src/components/LoginForm.tsx` | LoginModal.tsx | onSuccess?: () => void; defaultRole?: 'CUSTOMER' \| 'PANDIT'; hideGuestLink?: boolean; | loading, disabled, error, empty |
| `LoginModal` | `apps/web/src/components/LoginModal.tsx` | BookingCTA.tsx, ServicesTab.tsx, CartSidebar.tsx, search-client.tsx | isOpen: boolean; onClose: () => void; redirectAfterLogin?: string; role?: 'CUSTOMER' \| 'P | **default only** |
| `RazorpayCheckout` | `apps/web/src/components/RazorpayCheckout.tsx` | booking-wizard-client.tsx | orderId, amount, currency = "INR", razorpayKey, bookingId, bookingNumber, customerName, cu | loading, error |
| `AuthModal` | `apps/web/src/components/auth-modal.tsx` | layout.tsx | value, onChange, disabled, | loading, disabled, error |
| `RitualVariationSelection` | `apps/web/src/components/booking/RitualVariationSelection.tsx` | booking-wizard-client.tsx | onSelect: (variation: string) => void; selectedVariation?: string; | **default only** |
| `SamagriModal` | `apps/web/src/components/samagri/SamagriModal.tsx` | booking-wizard-client.tsx, ServicesTab.tsx | panditId: string; pujaType: string; onSelect: (selection: SamagriSelection) => void; onClo | loading |
| `AuthProvider` | `apps/web/src/context/auth-context.tsx` | page.tsx, booking-wizard-client.tsx, page.tsx, page.tsx, page.tsx +8 | children | loading, error |
| `CartProvider` | `apps/web/src/context/cart-context.tsx` | booking-wizard-client.tsx, layout.tsx | children | error |
| `API_BASE` | `apps/web/src/lib/api-base.ts` | booking-wizard-client.tsx, page.tsx, LoginForm.tsx, RazorpayCheckout.t | UNKNOWN | **default only** |
| `refundPercent` | `apps/web/src/lib/refund-policy.ts` | page.tsx, page.tsx | UNKNOWN | **default only** |
| `logger` | `apps/web/src/utils/logger.ts` | auth-context.tsx | UNKNOWN | error |

### Disabled with no reason given

A control the user cannot press, with nothing on screen saying why or what
would unlock it.

- `apps/web/app/booking/new/booking-wizard-client.tsx:1648  disabled={!canNext()}`
- `apps/web/app/dashboard/bookings/[bookingId]/review/page.tsx:275  <Button type="submit" disabled={isLoading} variant="primary" className="w-full py-4 text-lg mt-6 shadow-lg sha`
- `apps/web/app/dashboard/notifications/page.tsx:174  disabled={isMarkingAll}`
- `apps/web/app/dashboard/profile/page.tsx:120  disabled={saveLoading}`
- `apps/web/app/login/page.tsx:307  disabled={loading}`
- `apps/web/app/login/page.tsx:377  disabled={loading \|\| !name.trim()}`
- `apps/web/components/SamagriModal.tsx:378  disabled={Object.keys(customItems).length === 0}`
- `apps/web/src/components/LoginForm.tsx:176  disabled={loading \|\| step === 3}`
- `apps/web/src/components/LoginForm.tsx:187  disabled={loading \|\| step === 3}`
- `apps/web/src/components/LoginForm.tsx:219  disabled={loading}`
- `apps/web/src/components/LoginForm.tsx:268  disabled={loading}`
- `apps/web/src/components/LoginForm.tsx:302  disabled={loading}`
- `apps/web/src/components/auth-modal.tsx:71  disabled ? "opacity-50 cursor-not-allowed" : "",`

The first line is the booking wizard's step gate: the **Next** button is
disabled by `!canNext()` and the screen prints no reason.

### Defined but never bundled

No component *inside* the shipped set is unimported — that is a tautology, since
the set was derived from the import graph. The real answer is the 93 files that
no route reaches at all:

```
158  .tsx files in apps/web
 65  reached by a route (shipped)
 93  NOT reached by any route
```

`apps/web/src/app/` holds a complete second customer app (`bookings/`,
`checkout/`, `dashboard/`, `pandit/[id]/`, `search/`), plus unrouted `admin/`
(8 screens), `b2b/` (3), and `pandit/` (18) sections. None of it is served to
anyone. It is the largest single source of confusion in this codebase: a
filename search finds two of almost everything, and only one is real.

