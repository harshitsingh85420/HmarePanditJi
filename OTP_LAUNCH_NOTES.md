# OTP launch notes

> **This file was created fresh.** It did not exist in the repository — no
> branch, no history, no stash. Everything below is derived from code that is
> actually in the repo and verified at the cited path. Nothing here is
> reconstructed from memory. If an earlier version of this file exists on
> another machine, reconcile before trusting this one.

## The OTP SMS

Built by `buildOtpSms` in `services/api/src/config/constants.ts`. It is a
**two-line** message, and the binding line must be **last**:

```
हमारे पंडित जी: आपका OTP {OTP} है। 5 मिनट तक मान्य। इसे किसी से साझा न करें।
@hmarepanditji-pandit.vercel.app #{OTP}
```

The trailing `@<host> #<otp>` line is what makes Chrome offer WebOTP
auto-fill on the login screen. If it is missing, reordered, or not last,
auto-fill silently never appears.

## WebOTP origin

`WEBOTP_BOUND_ORIGIN = "hmarepanditji-pandit.vercel.app"`
(`services/api/src/config/constants.ts`)

Bare host, no scheme, no path. WebOTP matches this line against the **calling
page's** origin, so a second binding line can be added during a domain
migration and both can coexist.

## Language scope — OTP stays Hindi

**The OTP SMS is out of scope for app localisation.** It stays Hindi in every
app language, because it is bound to an approved DLT template. This is not a
styling choice:

- changing the text means a **fresh DLT submission and re-approval**
- until that is approved, messages on the changed template are **rejected by
  the telecom operator** — i.e. no pandit can log in

So: app language switches freely (see `docs/ADDING_A_LANGUAGE.md`); the OTP SMS
does not move with it.

## Accepted debt: moving to a real domain

Today's origin is a `vercel.app` host. Moving to a custom domain later costs
**all four** of these, together:

1. DLT template resubmission (the binding line changes) + re-approval
2. `WEBOTP_BOUND_ORIGIN` updated and the API redeployed
3. WebOTP re-tested on a real Android device — auto-fill fails silently, so
   this cannot be verified by reading code
4. a migration window where the SMS carries **both** binding lines, so
   sessions on the old and new origins both auto-fill

## Still unverified

The OTP SMS path is **not** exercised end-to-end: `sendOtp` currently stores
the OTP in memory and logs `[MOCK OTP]` — it does not send an SMS. `buildOtpSms`
is called from one place in `auth.controller.ts`. Real delivery, and therefore
the WebOTP binding, has never been proven against a live handset.
