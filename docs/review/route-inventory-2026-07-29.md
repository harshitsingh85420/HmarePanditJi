# ROUTE INVENTORY — the audit surface, 2026-07-29

**Replaces `PUBLIC_PANDIT_READS` as the thing audits are run against.**
Regenerate with:

```bash
node scripts/route-inventory.mjs --twins
```

`183 routes · 30 public · 153 guarded · 0 undecoded · 10 twin groups`

---

## WHY THE CONSTANT WAS NOT ENOUGH

The public-read audit checked routes against `PUBLIC_PANDIT_READS` in `app.ts`
and cleared `GET /pandits/:id/reviews`. It passed. `GET /reviews/pandit/:panditId`
— the same resource, a different prefix, therefore outside the constant — was
public, ignored `isAnonymous`, and shipped real names plus entire
customerProfiles.

> **An audit of a route list proves nothing about the route that isn't on it.**

The enumerator reads the registration table instead: `app.register(…, { prefix })`
for plugins, plus the routes registered **directly on the app** (`app.ts:296-318`)
which no plugin-shaped audit sees at all — and which is exactly where the
`/pandit/*` twins of the `/pandits/*` routes live.

## THE TEN TWIN GROUPS

One resource, more than one path. **None has divergent auth** — and that is
precisely why auth divergence is not a sufficient test: the reviews pair below
is public on *both* sides and still had one honouring the customer's anonymity
flag while the other did not.

| # | resource | the pair | status |
|---|---|---|---|
| 1 | pandit reviews | `GET /pandits/:id/reviews` · `GET /reviews/pandit/:panditId` | 🔴 **was leaking — fixed this turn**, both now share `PUBLIC_REVIEW_SELECT` |
| 2 | pandit booking detail | `GET /pandit/bookings/:id` · `GET /pandits/bookings/:bookingId` | 🔴 **was leaking the whole `User` — fixed this turn**, both narrowed + gated |
| 3 | pandit booking list | `GET /pandit/bookings` · `GET /pandits/bookings` | 🟠 different projections, both now redacted |
| 4 | accept | `POST /pandit/bookings/:id/accept` · `POST /pandits/bookings/:bookingId/accept` | 🟠 **two independent accept implementations** |
| 5 | decline | `POST /pandit/…/decline` · `POST /pandits/…/decline` | 🟠 same |
| 6 | complete | `POST /pandit/…/complete` · `POST /pandits/…/complete` | 🟠 same |
| 7 | earnings summary | `GET /pandit/earnings/summary` · `GET /pandits/earnings/summary` | 🟠 two money projections |
| 8 | onboarding | `POST /pandit/onboarding` · `POST /pandits/onboarding` | 🟢 same handler, deliberate alias |
| 9 | samagri packages (GET) | `/pandit/samagri-packages` · `/pandits/samagri-packages` | 🟢 same handler |
| 10 | samagri packages (POST) | as above | 🟢 same handler |

**Groups 4-7 are the ones still worth a decision.** Each is two separate
implementations of a state transition or a money read. Group 4 matters most:
the accept path the app calls (`app.ts:311` → `auth.controller.ts`) is the one
that got the `ACCEPTABLE_DB_STATUSES` fix this turn; the twin at
`pandit.routes.ts:877` still carries its own copy of the pending-status logic.
**A booking accepted through the twin does not go through the same guard.**

## THE 30 PUBLIC ROUTES

Legitimate and expected: `/health`, `/ai/health`, the six OTP endpoints
(rate-limited), `/muhurat/*` (4), `/rituals` (2), `/travel/*` (4 — verified
**local maths**, no external paid call), `/payments/webhook` (signature-verified),
the four allow-listed `/pandits` reads, `/voice/prompt/:step`.

**Worth a decision:**

| route | concern |
|---|---|
| `POST /api/v1/voice/tts` | 🔴 public, **schema-validated only — no rate limit**, calls the **paid Sarvam TTS API**. Confirmed live: `200` with no token. Anyone can bill this key. |
| `POST /api/v1/voice/stt` | 🔴 same shape, paid Sarvam STT. |
| `POST /api/stt` · `POST /api/v1/stt` | 🔴 public with **no preHandler at all** (`app.ts:433-434`). |
| `POST /api/v1/feedback/unanswered` | 🟠 public unbounded write — this is the `FeedbackUnanswered` writer. Low severity, no rate limit. |
| `POST /api/v1/auth/admin-login` | 🟢 must be public. Worth confirming it shares `otpLimiter`-style throttling — it does **not** currently. |

None of these is an identity leak; all four red rows are **cost/abuse** exposure
on a paid third-party key. Reported, not fixed — not in this turn's rulings.

---

## THE TOOL'S OWN BUG HISTORY — three false-positive classes it produced about itself

Recorded because it is the strongest evidence for the law, and because a reader
should know exactly how far to trust the output.

| version | claimed | truth | cause |
|---|---|---|---|
| 1 | 69 public, incl. **every admin route** | admin is fully gated | matched only `addHook("preHandler", authenticate)`; `admin.routes.ts:56` uses an **inline arrow** |
| 2 | ~30 `/pandits/*` routes public | gated by the **app-level hook** at `app.ts:286` | a per-route source read cannot see an app-level hook |
| 3 | `POST /upload` public | returns **401** live | `preHandler: preHandlers` — the guard is behind an **identifier** |

Each was caught by checking the tool's own claims against the source and, where
possible, against production. **Two of the three would have put a fabricated
security hole into a report.** The tool now fails safe: a preHandler it cannot
decode is reported `UNKNOWN`, never `PUBLIC`.

> A tool written to stop a class of error is not exempt from that class.
