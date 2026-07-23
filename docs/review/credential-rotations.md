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
- **Pre-push gate applies to EVERY pusher, agent included** (`.husky/pre-push`).
  The agent's shell has no pnpm and no node on PATH, so the hook resolves the
  toolchain (pnpm on PATH → corepack → local `.bin` → **direct-node fallback**
  via an absolute node path) and runs tsc-all + changed-app builds without a
  package manager. Verified: the hook runs and blocks in the agent's environment
  (not an exemption — it actually works there). `git push --no-verify` is a
  deliberate, rare override, never routine.

## DEPLOY VERIFICATION RULE (2026-07-23)

Same failure class as leaking a secret: **claiming an outcome instead of
confirming it.** A push proves nothing — Vercel silently keeps serving the last
good build, so a failed deploy leaves stale code live (this bit us twice:
payout-phone, and the money-model that needed a live check).

**Rule for every push described as "deployed":** poll the deployed **commit SHA**
until it matches the pushed SHA, then report the actual state + SHA.
- **Never say "deployed" on the strength of a push.** If it can't be confirmed,
  say **"pushed, deploy unverified"** — never "deployed".

**How to poll (the markers added 2026-07-23 make this mechanical):**
- **API (Render):** `GET https://hmarepanditji-api.onrender.com/health` →
  `commit` (from `RENDER_GIT_COMMIT`). Match against the pushed SHA.
- **Apps (Vercel):** `GET https://<app>.vercel.app/version` → `{commit, ref}`
  (from `VERCEL_GIT_COMMIT_SHA`). `hmarepanditji-{pandit,admin,web}`.
- Ready = the served `commit` equals the pushed SHA. Error/stale = it stays the
  OLD SHA past a reasonable window (~3-5 min) → the deploy failed and the old
  build is still live → report "deploy did NOT update, still serving <oldSHA>".
- These env vars are set by the host at build/run — locally they read `unknown`,
  which is expected (there is no deploy to verify locally).
