# OTP HARDENING v2 — LAUNCH NOTES

The document Isj reads at the cutover and at 2am. Steps, not prose.

Rebuilt fresh on `hold/otp-hardening-v2` (the original `hold/otp-auth-hardening`
is unrecoverable — never pushed, never on this machine; forensics confirmed no
reflog/fsck/stash trace). Static `123456` login into prod is DEAD in this branch.

---

## 1. DLT TEMPLATES — paste these BYTE-EXACT into the MSG91 portal (item K)

Two templates, one per app (the WebOTP binding line differs). `{#var#}` marks
the OTP variable in BOTH positions.

**PANDIT template:**
```
हमारे पंडित जी: आपका OTP {#var#} है। 5 मिनट तक मान्य। इसे किसी से साझा न करें।
@hmarepanditji-pandit.vercel.app #{#var#}
```

**WEB template:**
```
हमारे पंडित जी: आपका OTP {#var#} है। 5 मिनट तक मान्य। इसे किसी से साझा न करें।
@hmarepanditji-web.vercel.app #{#var#}
```

Submission checklist:
- Paste **verbatim** — a single changed character (space, danda, word) means a
  NEW DLT approval cycle. `otp-template.test.ts` pins this exact text in code, so
  the SMS the server builds and the template you approve cannot drift.
- **Verify the portal preserved the NEWLINE** between the message and the
  `@origin` line. Whitespace normalisation (portal turning `\n` into a space) is
  a silent delivery/WebOTP failure — check the preview shows two lines.
- Name **both** `{#var#}` slots `otp` (MSG91 sends `recipients:[{ mobiles, otp }]`
  — the server already does this; the slot name must match).
- Header/sender ID: **HMPNDT** (6 chars, DLT-approved). "HMPANDIT" (8) is
  DLT-invalid and every send fails — env.ts fatal-boots on a non-6-char sender.

> **Register exemption (recorded):** the SMS body contains the roman word "OTP".
> An SMS is carrier text, not app UI — the register/no-roman guards scope
> `apps/pandit` sources only, so this is out of scope by construction, not by a
> silent edit. Do NOT "fix" it in the template (it would break the approved DLT
> text). App-facing strings use ओटीपी.

---

## 2. RENDER ENV — set once template IDs come back (item I)

`render.yaml` pins `OTP_DEV_MODE=false` + `MOCK_OTP=false` and declares the rest
`sync: false`. Set these real values in the Render dashboard (API service):

| Key | Value |
|---|---|
| `MSG91_AUTH_KEY` | your MSG91 auth key |
| `MSG91_SENDER_ID` | `HMPNDT` |
| `MSG91_OTP_TEMPLATE_ID_PANDIT` | the pandit template id from the portal |
| `MSG91_OTP_TEMPLATE_ID_WEB` | the web template id from the portal |
| `WEBOTP_ORIGIN_PANDIT` | `hmarepanditji-pandit.vercel.app` |
| `WEBOTP_ORIGIN_WEB` | `hmarepanditji-web.vercel.app` |

**WebOTP origin format — bare host only:**
- ✅ `hmarepanditji-pandit.vercel.app`
- ❌ `https://hmarepanditji-pandit.vercel.app` (scheme)
- ❌ `hmarepanditji-pandit.vercel.app/` (trailing slash)
- ❌ `hmarepanditji-pandit.vercel.app/login` (path)
- ❌ `hmarepanditji-pandit.vercel.app:443` (port)
- ❌ ` hmarepanditji-pandit.vercel.app` (leading/trailing space)
- ❌ `vercel` (single label)

The API **fatal-boots** (won't start) if `OTP_DEV_MODE`/`MOCK_OTP` is `true`, if
any MSG91 key/template is missing, if a WebOTP origin is unset/malformed, or if
the sender ID isn't 6 chars — so a misconfigured cutover never silently ships a
half-hardened auth. A crashed boot is loud and recoverable; a broken auth is not.

---

## 3. FIRE SEQUENCE (the cutover)

1. Submit both DLT templates (§1); wait for approval + template IDs.
2. Set the Render env (§2). Do NOT deploy yet.
3. Deploy the API from `hold/otp-hardening-v2` (after Isj merges it). Watch the
   boot logs — a green boot means every env guard passed.
4. **Same cutover, Vercel** (see §5): set `NEXT_PUBLIC_OTP_DEV_MODE=false` on
   apps/pandit AND redeploy apps/pandit.
5. Run the LIVE PROOF (§4) on a real handset before telling any pandit.

---

## 4. LIVE PROOF (go-live gate — DELIVERED, not 200)

- `123456` returns **400** (`invalid_otp`) on both `/auth/verify-otp` and
  `/auth/otp/verify` — the bypass is dead.
- A real OTP arrives on a real handset, and MSG91's **delivery report shows
  DELIVERED** (the send-time 200 only means ACCEPTED — a DLT template mismatch
  fails silently after a 200). Use the logged request id or the MSG91 dashboard.
  `getOtpDeliveryStatus(requestId)` exists for this.
- WebOTP: Chrome offers to autofill the code from the SMS on the login screen.
- Cooldown trace: send → "N सेकंड बाद दोबारा भेज सकते हैं" counts 60→0 (no error
  styling) → resend button returns.
- Admin login still works (with a REAL `ADMIN_PASSWORD_HASH` set — prod now
  REFUSES the repo-default hash).

---

## 5. ABORT PATH (read this at 2am)

**To revert: redeploy the PREVIOUS API build (Render → Deploys → the prior
successful deploy → Redeploy).**

**DO NOT** set `OTP_DEV_MODE=true` to "roll back" — with hardening v2 the prod
env guard **FATAL-BOOTS** on `OTP_DEV_MODE=true`, so that would take the API DOWN,
not restore the old behaviour. The only safe revert is the previous build.

- Vercel rollback (apps/pandit): Vercel → the project → Deployments → the prior
  production deployment → Promote to Production. `NEXT_PUBLIC_OTP_DEV_MODE` is
  baked at BUILD time (NEXT_PUBLIC_*), so it only changes with a redeploy — and
  it gates only a spoken WebOTP-guidance line, **never auth**. Auth is entirely
  server-side; the Vercel flag cannot re-open the bypass.

**REDIS-OUTAGE NOTE (accepted trade):** the OTP send rate limiter FAILS CLOSED in
production — on a Redis error it BLOCKS sends rather than draining the SMS
balance. This makes an Upstash Redis outage a **login outage by design**. If
logins are failing platform-wide with `otp_rate_limited`/`backend_unavailable`,
check Redis first (Upstash dashboard) — it is load-bearing for OTP.
