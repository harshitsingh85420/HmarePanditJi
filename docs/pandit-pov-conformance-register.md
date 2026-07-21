# HmarePanditJi — Pandit-POV Documentation Conformance Register
**Source of truth:** *HmarePanditJi — Complete Pandit-Facing Platform Documentation* (52 features).
**Scope:** Phase 1 MVP features only, pandit POV only, per the doc's own roadmap table (F1–5, F8–12, F32–36, F43).
**Purpose:** every requirement below must end in exactly one state — `AUTO` (automated test), `MANUAL` (scripted human test), or `DEVIATION` (signed, dated founder decision). Unmapped = build failure.

**Status legend (app today):** ✅ built · 🟡 partial · ❌ missing · 🔍 verify (unknown — first test run answers it)

---

## F1 — Dual-Mode Entry Point
*Doc intent: pandit reaches the pandit flow instantly from the public site, or via a customer-referral invite link.*

| ID | Requirement & test expectation | Type | Status |
|---|---|---|---|
| F01-01 | Public homepage shows two large CTAs: "मुझे पंडित चाहिए" and "मैं पंडित हूँ — जुड़ना चाहता हूँ"; tapping the pandit CTA lands directly in the voice-first pandit flow with **no intermediate screen** | AUTO (route/e2e) | ❌ |
| F01-02 | The two CTAs are strongly visually differentiated at 360px width (edge #7) | MANUAL (phone) | ❌ |
| F01-03 | Mid-registration escape: a "गलत जगह आ गए?" path exists to switch to the customer side without data loss (edge #7) | AUTO | ❌ |
| F01-04 | Referral invite deep link opens the pandit registration flow directly | AUTO | ❌ |
| F01-05 | Invite throttling: max 1 invite per number per 7 days; never resend after 2 ignores; opt-out honored (edge #1,2) | AUTO (api) | ❌ |
| F01-06 | Already-registered number receiving an invite gets a **login** link, not registration (edge #3) | AUTO (api) | ❌ |
| F01-07 | Referral bonus releases only after referred pandit completes **3 verified bookings** (edge #4) | AUTO (api) | ❌ |
| F01-08 | JS-disabled / very old browser gets a static fallback page with an assisted-registration phone number (edge #6) | AUTO (SSR check) + MANUAL | ❌ |

**Deviation candidates:** F01-04…07 require SMS/WhatsApp delivery → blocked on DLT; propose `DEVIATION: post-DLT build, pilot recruits pandits manually`.

---

## F2 — Voice-First Navigation & Universal Error Handling ⚠ CORE PERSONA MACHINERY

| ID | Requirement & test expectation | Type | Status |
|---|---|---|---|
| F02-01 | First-ever open speaks the welcome script: "नमस्ते पंडित जी… यह ऐप पूरी तरह आपकी आवाज़ से चलेगा…" (once, not on every open) | AUTO (component) | ❌ |
| F02-02 | **Failure 1** of any voice input → speaks "माफ़ कीजिये, कृपया फिर से बोलिए।" | AUTO | ✅ built |
| F02-03 | **Failure 2** → "कृपया धीरे और साफ़ बोलिए।" | AUTO | ✅ built |
| F02-04 | **Failure 3** → the fallback line **and** keyboard auto-opens **and** a "सहायता चाहिए" button appears wiring to the support path | AUTO | ✅ built |
| F02-05 | Failure counter resets per field, not per session | AUTO | ✅ built |
| F02-06 | **Confirmation loop after every voice input:** "आपने कहा [X] — सही है?"; "नहीं" → re-input; "हाँ" → advance (edge #4: no silent acceptance, ever) | AUTO | ✅ built incl. menu choices |
| F02-07 | Voice listen timeout ≥ 8s; elderly-flagged profiles get 12s (edge #3) | AUTO | ❌ |
| F02-08 | High ambient noise → proactively suggest keyboard (edge #2) | MANUAL | ❌ |
| F02-09 | "पीछे जाओ" only navigates — **never deletes entered data**; deletion requires explicit "हटा दो" + double confirm (edge #8) | AUTO | 🟡 delete-grammar + double-confirm built; draft-persistence half on hold/conformance-builds |
| F02-10 | Internet drop mid-input: buffer locally, show "सहेज रहे हैं…", retry on reconnect — input never silently lost (edge #7) | AUTO | ❌ |
| F02-11 | Support path off-hours: show expected callback time + async WhatsApp option (edge #9) | AUTO (render) | ❌ |
| F02-12 | Speech-impediment accessibility: keyboard offered prominently from 2nd failure; failures logged for audit (edge #1) | AUTO | 🟡 keyboard auto-opens at failure 3 (doc asks prominent-from-2nd); failures logged to debug only |
| F02-13 | **Splash (founder-specified):** 8-second wait-then-advance — touch cancels the timer and advances now, no touch by 8s auto-advances; the two first-words (नमस्ते पंडित जी! / आगे बढ़ने के लिए स्पर्श कीजिए) are ATTEMPTED on mount (autoplay-safe); audio unlocks globally on first gesture | AUTO | ✅ built (feat splash port) |
---

## F3 — Automatic Language Selection

| ID | Requirement & test expectation | Type | Status |
|---|---|---|---|
| F03-01 | Location detected → default language set from city/state map (Varanasi→Hindi, Madurai→Tamil) | AUTO | 🟡 built (state map) |
| F03-02 | Detection is announced + confirmable: "आपके शहर [X] के हिसाब से हम [भाषा] सेट कर रहे हैं…" — GPS suggestion is a **prompt, never silent auto-set** (edge #1) | AUTO | 🟡 partial |
| F03-03 | Manual override list matches the doc set ∩ TTS-supported registry; unsupported request (e.g. अवधी) → offer closest + English (edge #3) | AUTO | 🟡 |
| F03-04 | Choice persists **server-side** and is never overwritten by re-detection (doc: "kabhi overwrite nahi hoti"; edge #6: survives app update/reinstall) | AUTO (api) | ❌ on-device only |
| F03-05 | Mid-session hot-switch via voice, with confirmation | AUTO | ❌ |
| F03-06 | GPS beats IP when they disagree (edge #2) | AUTO | ❌ |

---

## F4 — Assisted Location Capture (Map + Manual Address)

| ID | Requirement & test expectation | Type | Status |
|---|---|---|---|
| F04-01 | Component-wise address interview: मकान नंबर → गली/मोहल्ला → शहर → ज़िला → राज्य → पिनकोड, each through the F2 error ladder | AUTO | ❌ |
| F04-02 | Full-address summary confirm; "नहीं" → asks **which component** is wrong and re-takes only that one | AUTO | ❌ |
| F04-03 | "क्या आप अभी इसी पते पर हैं?" — हाँ → GPS capture with map blue-dot; नहीं → pin dropped from saved address, draggable | AUTO + MANUAL | 🟡 (city-confirm built) |
| F04-04 | Pin-timeout ladder: 30s nudge → 60s "शहर और इलाका बोलिए, हम डाल देंगे" → 90s ops-team alert | AUTO | ❌ |
| F04-05 | Privacy: full address + lat/long **never** in any customer-facing API response; only city/district/state public | AUTO (api contract) | ❌ |

---

## F5 — Dual-Method Aadhaar Verification

| ID | Requirement & test expectation | Type | Status |
|---|---|---|---|
| F05-01 | Spoken 12-digit Aadhaar number with repeat-back confirmation | AUTO | ❌ |
| F05-02 | Aadhaar photo: auto-capture with manual fallback | MANUAL | 🟡 upload built |
| F05-03 | Aadhaar OTP verify with 3-fail loop → offer resend ("हाँ") or support ("सहायता") | AUTO | ❌ |
| F05-04 | Minor gate: DOB < 18 → auto-reject with clear message (edge #8) | AUTO | ❌ |
| F05-05 | No-Aadhaar fallback: PAN + Voter ID path, marked "manually verified", ops review (edge #1) | MANUAL | ❌ |
| F05-06 | Damaged/unreadable card → re-upload path accepts UIDAI masked PDF / DigiLocker (edge #5) | MANUAL | ❌ |
| F05-07 | Face-match vs Aadhaar photo is a **soft** check — mismatch flags for human review, never auto-rejects (edge #3) | AUTO (admin logic) | ❌ |

**Deviation candidate (founder decision needed):** true UIDAI OTP/e-KYC needs a paid provider. Proposed pilot deviation: *photo + admin manual approval; F05-01/03/04 deferred until provider exists.* Sign and date it — this is currently an **unrecorded** deviation.

---

## F8 — Pooja-Specific Video Verification (core trust differentiator)

| ID | Requirement & test expectation | Type | Status |
|---|---|---|---|
| F08-01 | Voice pooja-selection loop: system names common poojas one-by-one, हाँ/नहीं each, ends with "कोई और पूजा?" | AUTO | ❌ |
| F08-02 | Per selected pooja: 2-minute video required; both paths offered — "नया रिकॉर्ड करें" / "गैलरी से" | AUTO (ui) + MANUAL (camera) | 🟡 |
| F08-03 | Recording instructions delivered (मंत्रोच्चार, आसन, चेहरा साफ़) | AUTO (render) | 🟡 partial |
| F08-04 | Admin review captures the 5 documented parameters (mantra, vidhi, face, माहौल, quality) | AUTO (admin) | ❌ |
| F08-05 | Liveness: blink/hand-gesture challenge in recording; face must match Aadhaar (edge #1 CRITICAL) | DEVIATION candidate | ❌ |
| F08-06 | **Current app uses YouTube-unlisted-link submission with WhatsApp help path** — this is a deviation from the doc's in-app record/gallery flow. Record it, or schedule in-app capture | DEVIATION (record now) | 🟡 |

---

## F9 — Rejection & Re-upload Flow

| ID | Requirement & test expectation | Type | Status |
|---|---|---|---|
| F09-01 | Rejection notification carries the **reason**, spoken + written | AUTO | 🟡 |
| F09-02 | Immediate re-upload path from the rejection ("दुबारा भेजें") | AUTO | ✅ shipped + guarded |
| F09-03 | Re-upload creates version+1 PENDING; REJECTED-only transition (PENDING/APPROVED → 409) | AUTO | ✅ guarded |
| F09-04 | Admin sees rejection history: count, reasons, accepted version | AUTO (admin) | ❌ |

---

## F10 — Team Size (पूजा-वार पंडित संख्या)

| ID | Requirement & test expectation | Type | Status |
|---|---|---|---|
| F10-01 | Voice script: "…आप मुख्य पंडित होंगे" — self included in count | AUTO | ✅ |
| F10-02 | Per-pooja team size stored and shown to customer side | AUTO | ✅ |
| F10-03 | Labels are "N पंडित" (never bare digits — the ₹5000→teamSize=5 grammar-collision regression) | AUTO | ✅ pinned |

---

## F11 — Dakshina Setup

| ID | Requirement & test expectation | Type | Status |
|---|---|---|---|
| F11-01 | Voice script states the total covers **all** pandits' dakshina | AUTO | 🟡 partial |
| F11-02 | Amount confirm loop before save | AUTO | ✅ |
| F11-03 | Market-rate benchmark shown during setup, per city tier (edge F11-1) | AUTO | ❌ → DEVIATION candidate (needs data; post-pilot) |
| F11-04 | Minimum floor price per pooja type enforced (edge F11-2, anti race-to-bottom) | AUTO (api validation) | ❌ |

---

## F12 — Multi-Tier Samagri Packages (with Brand/Company Details)

| ID | Requirement & test expectation | Type | Status |
|---|---|---|---|
| F12-01 | Three tiers per pooja: Basic / Standard / Premium; Standard ⊇ Basic, Premium ⊇ Standard | AUTO (schema) | ✅ tiers exist |
| F12-02 | **Every item carries quantity + company/brand name** | AUTO (schema) | ❌ brand field missing |
| F12-03 | Supply-preference question: "क्या आप ये सारी सामग्री खुद ला सकते हैं?" हाँ/नहीं branches | AUTO | ✅ |
| F12-04 | On "हाँ": the binding instruction is spoken — "जिस कंपनी का नाम बताया है, वही कंपनी का सामान लाना होगा" | AUTO (render/voice) | ❌ |

---

## F32–35 — Consultancy "पंडित से बात" ⚠ LARGEST TRUE GAP (doc's fastest-revenue feature)

| ID | Requirement & test expectation | Type | Status |
|---|---|---|---|
| F32-01 | Opt-in flow: enable seva; per-mode हाँ/नहीं for voice / video / chat | AUTO | ❌ |
| F32-02 | Per-minute charge set by pandit, spoken confirm | AUTO | ❌ |
| F32-03 | Minimum call duration, default 5 min, editable | AUTO | ❌ |
| F32-04 | On app open: "क्या आप आज online होना चाहते हैं…?" → 🟢/🔴 | AUTO | ❌ |
| F32-05 | Auto-offline: connectivity loss → 🔴 immediately | AUTO | ❌ |
| F32-06 | Auto-offline: backgrounded > 10 min → 🔴; < 10 min → unchanged | AUTO | ❌ |
| F33-01 | Pandit-side visibility of own status + charge as customers see it | AUTO | ❌ |
| F34-01 | Incoming request notification; accept/decline; billing timer starts per doc rules (chat: at first pandit reply) | AUTO | ❌ |
| F34-02 | Silence handling: 3 min no audio → prompt; 5 min → auto-end, billing stops (edge F34-1) | AUTO | ❌ |
| F34-03 | Drop protection: connected < 2 min → auto-refund; ≥ 2 min → minimum billing applies (edge F34-2) | AUTO | ❌ |
| F35-01 | Post-call breakdown: type, duration, rate, commission, net | AUTO | ❌ |
| F35-02 | Dashboard separates "processing" vs "settled" balances (edge F35-1) | AUTO | ❌ |
| F35-03 | Separate "पंडित से बात" rating displayed on profile | AUTO | ❌ |

**Founder ruling required:** build for pilot, or sign `DEVIATION: post-pilot`. The doc ranks this as the fastest pandit income; it is also the largest build. No middle option.

---

## F36 — Bank/UPI Verification & Penny Drop (KYC Part 2)

| ID | Requirement & test expectation | Type | Status |
|---|---|---|---|
| F36-01 | Account-type question (UPI vs bank), details via voice with confirm | AUTO | ❌ |
| F36-02 | ₹1 penny-drop; retrieved name matched against Aadhaar name | AUTO (api, mocked provider) | ❌ |
| F36-03 | Mismatch → camera for passbook/cancelled cheque → manual verify ≤ 24h | MANUAL | ❌ |

**Existing founder decision to formalize:** `DEVIATION (pilot): payouts are manual UPI by founder, marked PAYOUT_COMPLETED in admin; F36 deferred until payout automation.` Currently undocumented — sign and date.

---

## F43 — Universal Multilingual Backend Mapping

| ID | Requirement & test expectation | Type | Status |
|---|---|---|---|
| F43-01 | Every pooja + samagri item has a universal ID with per-language display names | AUTO (schema) | ❌ |
| F43-02 | Voice input resolves to universal ID, not display string | AUTO | 🟡 partial |
| F43-03 | Adding a pooja/item without all enabled-language names fails validation | AUTO | ❌ |

---

## Summary counts
- **Total atomic requirements: 79** (F1: 8 · F2: 13 · F3: 6 · F4: 5 · F5: 7 · F8: 6 · F9: 4 · F10: 3 · F11: 4 · F12: 4 · F32–35: 13 · F36: 3 · F43: 3) — corrected from 62; the per-block composition always summed to 78 (now 79 with the founder splash row)
- Today: **✅ 8 · 🟡 14 · ❌ 56 · 🔍 0** — all VERIFY items resolved against code (see docs/spec/VERIFY-RESULTS.md)
- **Deviation candidates needing founder signature: 5 blocks** — F1 referral (DLT-blocked), F5 UIDAI (provider cost), F8 YouTube-link flow (already shipped, unrecorded), F11-03 benchmarks (no data yet), F36 penny-drop (manual-payout pilot decision)
- **One open product ruling: F32–35 consultancy** — build vs sign-defer.

## Enforcement rule (the point of this document)
CI must fail if any ID above lacks exactly one of: a passing automated test, a manual-test script entry, or a signed deviation line. "The documentation is followed" becomes a build status.

---

## Proposed — Pandit Walk NEW-REQ candidates (awaiting Isj's ratification)

These six emerged from the read-only Pandit Walk (docs/walk/WALKTHROUGH.md) —
gaps the document itself missed, surfaced by walking every screen as a
Devanagari-only, can't-type, distrustful 64-year-old. They are **PROPOSED**, not
yet part of the enforced set (the `PW-` prefix keeps them out of the machine
projection until Isj ratifies them into real `F..` requirements). The dominant
theme: the app asks by voice but answers only by touch, and its "fallback" is
typing — which this persona cannot do.

| ID | Proposed requirement | Why the doc missed it |
|---|---|---|
| PW-01 | **Native OS permission popups need a "coaching" layer.** Location/mic/notification popups are the browser's own English "Allow/Block" — the app cannot translate them. A first-class pattern must identify the right button by POSITION and COLOUR (arrow + voice), never by the English word. | The doc assumed app-controlled dialogs; in reality the OS owns them. |
| PW-02 | **Every voice-asked yes/no must accept a voice answer** — not just some sub-states. Audit every confirm/gate for voice-answerability. | F02-06 exists, but gates and confirm sub-states silently omit it (walk पP0 #3). |
| PW-03 | **Typing is not a valid fallback for this persona.** Wherever the safety net is "use the keyboard", it fails him. The real fallback must be voice-to-field on every input PLUS a one-tap call-a-human. | The doc treats the keyboard as the universal fallback; for an English-illiterate pandit it is the trapdoor (walk पP0 #4, #8, #9). |
| PW-04 | **No roman characters in any user-facing string.** "OTP", "SOS", "Mobile Number", "XXXXXXXXXX" placeholders and roman city names all appeared at title size. Lint-able — could be a build guard. | The doc addressed language selection, not a hard ban on roman text in the UI. |
| PW-05 | **All proper nouns render Devanagari** — geocoded place-names come back Latin from the map provider and print as-is. | F43 covers pooja/samagri IDs but not geocoded place-names (walk पP0 #4). |
| PW-06 | **No dead/stub routes reachable in prod** — `resume/page.tsx` is all-English and a dead registration-redirect stub still resolves; a confused user can land on them. | The doc never enumerated the route surface for cruft. |

**Partial fixes already shipped on `fix/pandit-walk-p0s`** (the P0 code batch):
PW-02 for the detected-city confirm (F03-02), PW-05 via `accept-language=hi` on
the geocoder (F03-03/F43), PW-04 for the SOS button. The rows above capture the
*general* requirement each fix only began to close — Isj ratifies whether they
become enforced `F..` IDs.
