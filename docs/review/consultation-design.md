# MUHURAT CONSULTATION — design report against the QUEUE MODEL (2026-08-03, REPORT-ONLY)

**Isj's reshaped model, confirmed intent:** a UNIVERSAL ADD-ON visible on
the pandit profile alongside every pooja ("kinda like a puja available in
every puja") · pricing collapses to FREE or PAID, the pandit decides · NOT
pre-booked slots — **a LIVE QUEUE while he is ONLINE**: "click now to get
the available time", 15-minute windows, one person per window, turn =
queue-position × 15 min. Barber-shop, not appointment-book. "24hrs" =
whenever he's online.

**Foundation, already ruled from both sides:** OWN CONFIG, never a
pujaType. The samagri report argued it from the rails' side; this scout
confirms from this side — the schema has ZERO consultation traces, and the
₹499 removal ruling (2026-08-01) set the return-conditions this report
satisfies: *"payload field + server fee + a pandit-side surface"* — never
a checkbox again.

**Status: report only. §3's Devanagari awaits the next voice-check batch;
Isj rules the rest.**

---

## 1 · THE QUEUE MODEL

**Two tables, no pujaType value anywhere:**

- `ConsultationConfig` — one row per pandit: `enabled Boolean`,
  `mode FREE|PAID`, `price Int?` (required iff PAID, ≥1). His deal,
  editable anytime; edits never touch a live queue's already-joined rows.
- `ConsultationRequest` — one row per join: `customerId`, `panditId`,
  `poojaTypeContext String?` (OPTIONAL context — which pooja she was
  reading; canonical-or-null, display only, never a key),
  `state WAITING → ACTIVE → DONE | LEFT | MISSED`, `queuedAt`,
  `activatedAt?`, `endedAt?`, `paidOrderId?` (PAID mode only).

**Projected turn** = (count of WAITING rows queued before mine) × 15 min,
computed at read — never stored, never stale. The customer sees the queue
length and her projected time BEFORE joining ("click now to get the
available time" — his words, literally implementable as arithmetic).

**When he goes OFFLINE mid-queue (the honest answer, proposed):** the
queue FREEZES and every WAITING customer is told at her next poll —
*"Pandit ji went offline. Your place holds for 15 minutes — stay or
leave."* If he returns within the grace, the queue resumes intact; if
not, remaining WAITING rows flip MISSED with the same honest line and the
queue dissolves. **Nobody waits silently against a dead flag** — that is
§2's whole reason to exist.

**No-shows:** ACTIVE unanswered for 5 min → MISSED, next in line called;
a WAITING customer may LEAVE at any moment (her own button, no friction —
leaving a queue is not a cancellation, there is nothing to cancel);
a pandit online-with-queue who takes nobody is §2's heartbeat problem,
not a state of this machine.

## 2 · 🔴 THE isOnline TRUTH — the hardest section, measured first

### What sets the flag today (all four writers, quoted from the sweep)

1. **The real toggle:** `PATCH /pandit/status` — the home GO-ONLINE button
   (optimistic + rollback + 60s voice-undo). The only path the app calls.
2. **An uncalled duplicate:** `PATCH /pandits/online-status` — a second
   full implementation, zero callers.
3. **A side-door:** `PUT /pandits/me` carries `isOnline` in its zod schema
   and writes `data: req.body` — a profile edit can flip presence.
4. **Admin force-offline** — one-directional (false only).

### What NOTHING does

- **NO AUTO-OFFLINE EXISTS.** No heartbeat, no `lastSeenAt` (the column
  does not exist), no cron, no session hook. **Logout does not go
  offline** (server clears a cookie; client purges storage). A pandit who
  taps GO ONLINE and uninstalls the app is online in the database
  FOREVER, until he returns or an admin notices.
- The only customer render is the detail page's **true-only green dot
  "Online now"** — no offline state exists, and the dot can be weeks
  stale. (Correction to the earlier claim: customer CARDS show nothing
  either way; the everyone-Offline table is the ADMIN's.)
- isOnline is load-bearing NOWHERE today: the list never filters on it,
  the cards and wizard drop it, booking creation ignores it. **The queue
  makes it load-bearing for the first time** — which is why it must
  become true first.

### The honest mechanism, proposed

**EFFECTIVE ONLINE = `isOnline && (now − lastSeenAt) < 90s` — derived at
read time, never stored.** Three parts:

1. **`lastSeenAt DateTime?`** on PanditProfile. The heartbeat is FREE: the
   pandit app already polls home every 30s — the authenticated poll's
   handler touches `lastSeenAt`. No new timer, no new endpoint, no
   battery cost. 90s TTL = three missed polls.
2. **The toggle stays the INTENT; the heartbeat is the EVIDENCE; the
   claim requires both.** A derived read cannot go stale and needs no
   janitor cron — the flag stops being an assertion and becomes a
   computation over facts (the F-B3-6 honesty-ladder principle applied to
   presence).
3. **Writer hygiene rides along:** the uncalled duplicate dies; `isOnline`
   leaves the `/me` schema (one writer + admin force-offline remain);
   logout fires a best-effort offline PATCH. The green dot renders only
   on EFFECTIVE online — stale renders NOTHING.

**The stale-online cost, named as ruled:** a customer joins a queue
against a fabricated claim and donates 15 minutes to a void — the single
worst trust event this product could manufacture, strictly worse than not
having the feature. The queue therefore SHIPS BEHIND the effective-online
mechanism, not beside it.

### How a pandit LEARNS his queue moved (measured, with the holes named)

App open on HOME: the 30s poll pattern (bell + speak + banner) — the
queue screen copies this exact pattern. App backgrounded: **push is a
stub** (getFCMToken always null), **the pandit app has NO notifications
screen** (rows are written; nothing reads them), SMS is Twilio-stubbed
without creds; the pilot's guaranteed channel is the operator call. §5
stages accordingly — the free launch leans on open-app polling + bell,
and says so honestly.

## 3 · PANDIT-SIDE DEVANAGARI — drafted verbatim for the NEXT voice-check batch

**Config (two questions, settings-adjacent, voice-first):**
- Board: **"क्या आप मुहूर्त-परामर्श देंगे?"** — sub-line: "यजमान 15 मिनट
  की बात के लिए क़तार में आएँगे — जब आप ऑनलाइन हों।" Tiles: **हाँ / नहीं**
- On हाँ: **"मुफ़्त या सशुल्क?"** — tiles:
  **"🙏 मुफ़्त — सेवा भाव से"** / **"₹ सशुल्क — दाम आप तय कीजिए"**;
  on सशुल्क a money VoiceField: **"15 मिनट की बात का दाम बोलिए"**
- Skip everywhere: **"बाद में"** (no identity language — this is commerce,
  not identity; the F-J5 line belongs to F/T/S alone).

**The queue screen (his side):**
- Title: **"परामर्श की क़तार"**
- Live row: **"अभी {N} यजमान क़तार में हैं"**
- Next card: **"अगले: {नाम} — {X} मिनट से इंतज़ार में"**
  (+ context line when present: "गृह प्रवेश के बारे में")
- Primary (52px): **"अगले यजमान से बात कीजिए"**
- Empty state: **"अभी क़तार खाली है — ऑनलाइन रहिए, यजमान आते ही घंटी
  बजेगी।"**
- The bell's spoken line: **"नया यजमान क़तार में आया है।"**

**Online-toggle copy additions:**
- Online caption (consultation enabled): existing line + **"परामर्श की
  क़तार भी खुली है ✓"**
- Going offline WITH a waiting queue — confirm (FAT-FINGER shape):
  **"क़तार में {N} यजमान हैं — ऑफ़लाइन होने पर उन्हें बता दिया जाएगा।
  ऑफ़लाइन हों?"** हाँ / नहीं

## 4 · CUSTOMER SHAPE — the universal add-on under the 4b card law

**THE THIRD FACE governs the placement:** identical copy on every profile
is RECURRING-GENERAL — the EXPLANATION ("what a muhurat consultation is,
15 minutes, how the queue works") lives ONCE on the general surface
(how-it-works / the main page's trust block). The profile speaks only what
DIFFERENTIATES: **his** mode, **his** price, **his** live queue.

- **The 4b CARD: nothing changes.** THE CARD IS A SUMMARY — a consultation
  pill on every card is a recurring band, exactly what the chip-list kill
  forbade.
- **The PROFILE: one consultation strip at the top of ServicesTab** (the
  per-pandit detail surface — the same slot logic that holds samagri):
  - PAID+enabled+effective-online: **"🕐 Muhurat consultation · ₹N · 15
    min — 2 in queue, your turn in ~30 min → Ask now"**
  - FREE variant: "Free · 15 min — …"
  - enabled+offline: **"Consultation opens when Pandit ji is online."**
    (honest absence — never a dead button)
  - not enabled: the strip does not render.
  - *Isj's words were "alongside EVERY pooja" — the per-pooja repetition
    variant is NAMED here as the alternative; the single strip is the
    decide-or-go-compliant recommendation (repeating an identical strip
    beside all four of one pandit's poojas is intra-profile recurrence).
    His word picks.*
- **The join flow:** tap → (PAID: pay first, webhook-gated) → WAITING card
  with live position on the 60s poll pattern — **"2 ahead of you — your
  turn in ~30 min"** — and a Leave button, no friction. ACTIVE → the
  interim reveal (§5): a `consultationIdentity` mediator minted on the
  bookingIdentity pattern (hidden → revealed on ACTIVE, durable
  `activatedAt`, fail-closed dispatch) — phone is null-or-full; no
  masked middle state exists today and none is proposed.

## 5 · STAGING against the gates

**FREE + queue + notification — ships now (in this order):**
1. **§2 first, as its own commit**: `lastSeenAt` (migration for Isj's
   hand) + heartbeat-on-poll + EFFECTIVE-online read + green-dot fix +
   writer cleanup (the duplicate dies, `/me` loses the key). The queue
   does not exist until this is true.
2. The two tables (same migration), config ask (§3), queue endpoints
   (join/leave/take-next/state — all reads compute projected turn).
3. Pandit queue screen on the copied 30s-poll pattern (bell + speak +
   banner); customer strip + WAITING card on the 60s pattern.
4. Notification honesty: open-app bell is the ONLY real channel at free
   launch and the copy says so ("ऑनलाइन रहिए…"); the pandit-app
   notifications screen and push are named absences, not silent ones.

**PAID = webhook-gated:** the entity-agnostic layer is reusable as-is
(`createOrder`, `verifySignature`, `verifyWebhookSignature`,
`ensureRazorpayWebhook`); the four booking-locked functions are NOT
(`createRazorpayOrder`/`processPaymentSuccess`/the webhook's
`notes.bookingId` branches/the create-order route) — a consultation order
needs its own `notes.consultationId` branch (today a bookingId-less
capture silently no-ops — that hole gets a named branch), its own
ownership/idempotency/state-flip. **Money model for Isj's ruling when
PAID ships:** does the 10% customer-side fee apply to consultation
payments, or does 100% pass through? (Ruling #7's letter covers dakshina;
consultation is new money.)

**Call/chat = funded-day:** until then, ACTIVE reveals contact (tel:) via
the minted mediator — the same interim the earlier sketch proposed,
re-grounded on the queue's ACTIVE state.
