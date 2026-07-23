# CREDENTIAL ROTATION LEDGER

Secrets that were exposed (usually by a dashboard/agent printing a value into a
log or chat) and rotated. Recorded so no future session re-litigates whether a
value is "empty" or "broken" — it was **leaked, then rotated**. All rotations are
**Isj's dashboard actions** (Render/Neon/etc.); the codebase never reads a secret
into a log and never prints one — env values are `sync: false` in render.yaml and
loaded only at boot.

| Secret | Where | Exposure | Rotation | Status |
|---|---|---|---|---|
| **SARVAM_API_KEY** | Render (API) | printed to a log/chat | regenerated (Sarvam dashboard) → new value on Render | rotated |
| **DATABASE_URL** (1) | Neon (Postgres) | exposed | rotated (Neon) → new conn string on Render | rotated |
| **DATABASE_URL** (2) | Neon | exposed | rotated again | rotated |
| **DATABASE_URL** (3) | Neon | exposed | rotated again | rotated |
| **JWT_SECRET** | Render (API) | the Chrome agent **printed the full 64-char secret into chat** — leaked, NOT empty | Isj regenerating via Render's **Generate** button (Render creates + stores the value internally; no human/agent sees it) | rotating (Isj, 2026-07-23) |

## Notes

- **JWT_SECRET is/was set and valid** — the live API signs and verifies JWTs
  (probed 2026-07-23: `verify-otp` issued a valid HS256 token, `/auth/me`
  accepted it). It was never "empty". Regenerating rotates the live signing key,
  which **invalidates every active session** — expected and intended for a leak,
  but do it in one deliberate action, then re-login.
- **DATABASE_URL** was rotated multiple times; scripts that touch prod (e.g.
  `services/api/scripts/audit-payouts.mjs`, `audit-cancel-state.mjs`) read it
  from the environment at runtime, never hard-code it, and redact any
  connection-string pattern from error output.
- **The code side needs no change for any of these** — the secrets live only in
  the host env. This ledger exists purely so the rotation history is durable.

## Discipline going forward

- Never print a secret value into a log, a chat, or a debug panel. If a value
  must be referenced, print its LENGTH or a fixed label, never the value.
- After any exposure: rotate at the source dashboard, update the host env, and
  add a row here.
