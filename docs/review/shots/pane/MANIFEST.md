# PANE-DRIVEN STATES — the founder-facing live surface

**Why this is a manifest and not PNGs:** the agent's browser tool returns
through-pane screenshots into the chat transcript (where Isj watches them
live); it cannot write those bytes to disk. Each state below was driven in
the pane and shot through the pane in the turn named. The formal PNG
evidence for the same screens lives in the sibling `page*/` folders,
banked by the Playwright eye.

## 2026-07-27 · THE LOGIN P0 — unseeded front door, PROD

Target: https://hmarepanditji-pandit.vercel.app · profile cleared first
(`localStorage.clear()`, `sessionStorage.clear()`, all cookies expired —
verified `ls:0`, `cookie:""` before the walk).

| # | State | Driven to | What the pane showed |
|---|---|---|---|
| 1 | front door, cold | `/login` | "लॉगिन / रजिस्ट्रेशन", the honest sub-line, the number field with the validator-accepted placeholder, आगे बढ़िए, the orb |
| 2 | number typed | `/login` | `9999999999` accepted in the field, no error state |
| 3 | OTP requested | `/login` → OTP step | **No cold-start wait was needed** — the API answered immediately. "वापसी पर स्वागत, पंडित जी / ओटीपी डालिए, आपका खाता तैयार है।", 6 boxes, "+91 99999 99999 पर भेजा गया", resend timer 00:25, keypad |
| 4 | OTP entered | `/home` | `123456` → **landed on होम**: "नमस्ते, टेस्ट जी", ⚠️ verification-pending banner, ₹0 hero, तैयारी hero, bottom nav, SOS pill |
| 5 | refresh at होम | `/home` | Token survived a full document load: `pandit_token` in localStorage **and** `hpj_token` cookie present, path stayed `/home`, **no redirect loop** |
| 6 | dashboard arc | `/bookings` | "मेरी बुकिंग" empty state + the तीन खाने coach card, nav intact — the arc survives after a real login |

**VERDICT: the unseeded front door OPENED on prod, end to end, on the
probe number.** The login P0 did **not** reproduce here. It is therefore
NOT "login is broken for everyone" — it is conditional, and the condition
is still unidentified. Untested variants that could still hold it: a
BRAND-NEW never-registered number (that path goes to REGISTRATION, not
this login branch), a different device/browser, a real cold start (this
run hit a warm API — `/health` reported 593s uptime), or Isj's own
session/network.

## Host status at the time of the walk

| Host | Status |
|---|---|
| hmarepanditji-pandit.vercel.app (pandit app) | **200** — serving `458e3e5` |
| hmarepanditji-api.onrender.com (API) | root `404` **by design** (no `/` route); `/health` **ok:true**, same commit `458e3e5`, uptime 593s |
| hmarepanditji.vercel.app (customer web) | **404** — root not served; needs its own check, not part of the pandit door |

## 2026-08-02 · TRACK 1 BATCH 2c — CONFIRMED, BOTH STATE-RENDERS, PROD

Target: `https://hmarepanditji-web.vercel.app/booking-confirmed/cmsagu1900001f73ozoz4j10h`
— **the standing specimen HPJ-2026-64970**, an `AWAITING_PAYMENT` booking
kept as the webhook's before/after control. Pane at **360×740**, touch
emulation. Deploy verified **by PRESENCE** in the served chunk
`app/booking-confirmed/%5BbookingId%5D/page-2988dda8a3824104.js`
(`भुगतान बाक़ी है` ×1, `Complete payment` ×1) before either shot.

| # | State | Driven to | What the pane showed |
|---|---|---|---|
| 1 | unpaid, above the fold | specimen URL | **cream banner, not green** — "🙏 बुकिंग दर्ज हो गई" / "Booking created — payment pending"; Booking ID **HPJ-2026-64970**; **"Amount due ₹2,310"**; "इसमें ₹210 प्लेटफ़ॉर्म शुल्क शामिल है"; Ceremony "Satyanarayan Puja"; Date "मंगलवार, 15 सितंबर 2026"; Pandit ji "Pt. क्यूए-walk पंडित J2" |
| 2 | unpaid, scrolled | same | "What happens next" → **भुगतान बाक़ी है** ("This booking is held, but it is not confirmed until the payment is made"), "Pandit ji confirms", "What to keep ready"; the **disabled "Complete payment"** control with its reason printed beneath; "Copy details"; "View details" |

**THE CONTROL VALUE OF STATE 1:** this exact URL rendered "Payment
Received — Your payment has been successfully processed" earlier the same
day, over this exact unpaid booking. The specimen banked for the webhook
proof doubled as the control that exposed the payment line as a
fabrication.

**STATE 3 — CONFIRMED — WAS NOT SHOT, AND CANNOT BE.** `paymentStatus`
only reaches `CAPTURED` through the gateway webhook, which is
unregistered (F-J7-3). No honest confirmed row exists to point the pane
at. The `paid` branch is proven **by construction** — one boolean
selecting banner colour, money label and the "Payment received" row — and
that is the whole of the claim. It gets its pane shot on the funded day,
in the same J10 pass that proves the webhook.
