# 🔴 P0 — THE CUSTOMER'S SESSION NEVER SURVIVES A PAGE LOAD

**REPORT-ONLY. Not fixed — auth/session is Isj's ruling.**
Found while walking step 2.1 of the payment leg. **The walk stops here.**

---

## THE SYMPTOM

A logged-in customer opens **My Bookings** and sees:

> 🪔 **अभी तक कोई बुकिंग नहीं है** — *You haven't made any bookings yet.*

He has a booking. It is `HPJ-2026-19028`, it is his, and the API returns it.

## THE PROOF, RUN INSIDE THE PAGE

```js
// the token the login flow stored, against the same endpoint the page calls
fetch(API + "/bookings/customer/my", { headers: { Authorization: "Bearer " + localStorage.hpj_token }})
→ { status: 200, success: true, count: 1, firstBooking: "HPJ-2026-19028" }
```

…while the page itself made **zero API calls** (network log, after a full reload
with the token present at mount).

## THE CAUSE — three failures stacked, each individually fatal

`apps/web/src/context/auth-context.tsx:86-118` bootstraps the session like this:

```js
const [accessToken, setAccessToken] = useState<string | null>(null);
// "Browser automatically sends hpj_token HttpOnly cookie"
const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
if (res.ok) { setUserState(me); }   // ← sets the USER, never the TOKEN
```

1. **`accessToken` is never restored.** The boot path sets `user` and nothing
   else. `setAccessToken` is called **only** inside `login()` — i.e. only in the
   same page-session as the OTP submit. Any reload, any fresh navigation, any
   deep link: `accessToken` is `null` forever.
2. **There is no cookie to send.** `document.cookie` on the web origin is
   **empty**. The API lives on `onrender.com` and the app on `vercel.app`, so an
   API-set cookie is third-party and blocked by default.
3. **The API would not accept one anyway.** Verified live:

   | call | result |
   |---|---|
   | `/auth/me` with `credentials:"include"` (what boot does) | **401** — `"Missing or invalid Authorization header"` |
   | `/auth/me` with `Authorization: Bearer <localStorage token>` | **200** |

   `authenticate` reads the **header**, not a cookie. The comment in the auth
   context describes a mechanism the server does not implement.

## WHY IT LOOKS LIKE NOTHING IS WRONG

Every customer screen gates on `accessToken`:

```js
const fetchBookings = useCallback(async () => {
  if (!accessToken) return;      // ← silent
  ...
}, [accessToken]);
```

A falsy token doesn't error, doesn't retry, doesn't warn — it returns, `loading`
goes false, and the page renders its **empty state**. The customer is told he has
no bookings, in warm Hindi, with a cheerful diya.

> **This is the empty-state law, in its most expensive form: an empty state that
> explains one cause convincingly hides every other cause.** "You haven't made
> any bookings yet" is indistinguishable from "your session did not load", and
> only one of those is true.

## THE TWO-CONTEXT SPLIT UNDERNEATH IT

There are **two** auth contexts in this repo:

| file | mechanism | writes |
|---|---|---|
| `packages/utils/src/auth-context.tsx` | localStorage, key `hpj_token` | `localStorage.setItem("hpj_token", …)` + a JS cookie |
| `apps/web/src/context/auth-context.tsx` | HttpOnly cookie + `/auth/me` | nothing persistent |

The login flow populates `hpj_token` and `hpj_user` in localStorage — that is
what my probe read, and it works. The dashboard imports the **other** context,
which never looks there. **Writer and reader are different modules.**

The existing `storage-key (writer==reader)` guard passes, because it checks that
the admin and customer *key strings* agree. It has no concept of two contexts
disagreeing about the *mechanism*. That is the guard gap.

## WHAT THIS BLOCKS

Everything after login on the customer side. Specifically, the payment leg
Isj ordered: the customer cannot reach a booking, so he cannot reach checkout,
so **no test payment can be made through the UI** — regardless of the Razorpay
key being valid, which it is.

It also reframes the original question. HPJ-2026-19028's null `razorpayOrderId`
was never the whole story: even with a perfect order, **the customer had no
screen from which to pay it.**

## FOR ISJ'S RULING

Three candidate fixes, narrowest first. I have shipped none — this is session
handling.

1. **Restore the token on boot** (smallest): in `auth-context.tsx`, read
   `localStorage.hpj_token` on mount and `setAccessToken(it)`, keeping `/auth/me`
   as validation with the header attached. One context, one mechanism, matches
   what the server actually implements.
2. **Delete the second context** and have `apps/web` use
   `packages/utils/src/auth-context.tsx`, which already does the right thing.
3. **Make the cookie real** — same-site domains for API and app, `SameSite=None;
   Secure`, and teach `authenticate` to read a cookie. The most work, and the
   only one that changes the server's auth contract.

**I recommend (1) now and (2) as the follow-up.** (3) is a hosting decision.

**Guard to add with whichever ships:** a session must SURVIVE A RELOAD — assert
that after boot with a stored token, `accessToken` is non-null. That is
behavioural and cannot be faked by a key-string comparison.
