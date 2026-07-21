# fix/canon-exact — review packet for Isj

**Branch:** `fix/canon-exact` · **range:** `d89eebf..cb8f046` (**91 commits**)
**Gate wall at tip:** pandit `tsc` 0 errors · **53 test files / 714 tests green**
(incl. ₹5000/teamSize suite, F02 ladder, splash 8s, register guard, no-roman
guard, tutorial identity + mic-ladder, backSafety, 8 new canon-frame guards) ·
api **33/33 guards** (incl. dakshinaFloor F11-04, samagriItem F12-02).

**Merge command awaiting your word:**
```
git checkout main && git merge --no-ff fix/canon-exact && git push origin main
```

## What this branch is

Every screen of the pandit app ported to the canon artboards
(`design/canon/हमारे पंडित जी.dc.html`, 36 numbered frames) under the standing
laws: **Founder Register Law** (आप-forms, -इए imperatives, स्पर्श not छूकर —
Ruling #5, guarded), **floors** (body ≥18 / labels ≥15 / taps ≥52 — Ruling #2),
**drawn-not-emoji** except canon's own, **shared Toran garland** (the
banner+bead-row died — it was in zero artboards), **Shishya say-ribbon**
(written + spoken travel together), **truthful-state over everything**.

Also on this branch: F02 three-rung voice ladder + menu-confirm + हटा-दो
double-confirm · the reconciled hold builds (listenTimeout 8s, backSafety,
dakshinaFloor, samagri brand) · dead-code purge (12 zero-importer components,
bead-strip, /resume stub) · the **Material glyph-size clamp fix** (every icon
size silently rendered 24px until today) · coverage.yaml regen (32 auto
discharged; tally in the register) · docs/web-tree-decision.md (investigation
#25, awaiting your call).

## Screens — where to see each + acceptance (दिखे / बोले / चले)

**LAN (same Wi-Fi):** `http://10.216.102.12:3002` — pilot login.
**Vercel preview:** only you can fetch it — dashboard → hmarepanditji-pandit →
Deployments → the `fix/canon-exact` build → Visit.

| Frame | Screen | Route | दिखे | बोले | चले |
|---|---|---|---|---|---|
| 1 | स्प्लैश | `/` (fresh) | garland·diya·wordmark·ribbon·स्पर्श कीजिए pill | नमस्ते पंडित जी! → आगे बढ़ने के लिए स्पर्श कीजिए | touch या 8s → आगे |
| 2 | स्थान | after splash | map·city card·यही सही है | आप कहाँ पूजा कराते हैं? (ribbon+TTS) | अनुमति दीजिए / शहर खुद चुनिए, voice यही-सही |
| 3 | भाषा | after स्थान | 2-col tiles·check badge | कौन सी भाषा पसंद है? | tap-tap या नाम बोलिए |
| 4 | परिचय | phase route | orb 118·mic card | मैं शिष्य हूँ — आपका सहायक 🙏 | mic auto-ask ladder |
| 5a-f | ट्यूटोरियल ×6 | after भाषा | canon captions only·6 dots·छोड़िए › | narration voice-only + आगे बढ़िए? हाँ | आगे/हाँ/पीछे/छोड़ो; mute-gate; mic slide |
| 6 | पंजीकरण | after OTP (new) | bare-value field cards·example placeholders | बाकी सब मैं देख लूँगा 🙏 | बोलकर या लिखकर, हाँ→submit |
| 7 | OTP | login | 36px digits·**canon keypad**·peach back | destination narration | keypad/paste/WebOTP; भेजो resend |
| 8 | होम | `/home` | plain greeting row·₹ hero·GoOnline | welcome + आज summary | voice nav, toggle+undo |
| 9 | विनती | new booking | sindoor 🔔 banner·CTAs in column | एक नई बुकिंग आई है! 🔔 | स्वीकार (check_circle)→उत्सव |
| 10/11 | विवरण/सूची | `/bookings` | plain rows·status rails·journey | counts narration | voice sections, journey steps |
| 13-16 | सत्यापन 4-step | `/readiness` | canon rows·ModeTile grid·stay board | step narrations | wizard + voice |
| 17 | दाम मीटर | in readiness | two-line heading·meter | — | levers pop |
| 18a-e | पूजा जोड़ें | `/my-poojas/add` | प्रतीक्षा pill·canon checklist·जमा कीजिए | F02 ladder rungs → confirm | **₹5000/teamSize suite green** |
| 19 | कमाई | `/earnings` | 46px hero = largest·conservation from API | intro | coins fall; empty→27b whole-screen दीया |
| 20-25 | कैलेंडर→SOS | tabs/settings | title blocks·Material glyphs | per-screen | SOS दबाकर रखें verified: early release doesn't fire |
| 26/27/28 | उत्सव/खाली/प्रतीक्षा | states | Material stamp·ornament slots·दीया loader | — | auto+tap dismiss·reduced-motion |

## Functional smoke (2026-07-21, this tree, fresh storage)

splash (8s auto-advance fired live) → स्थान → शहर खुद चुनिए → दिल्ली →
भाषा-confirm हाँ → tutorial 1→6 (canon captions verified per slide; mute-gate
honest 10s; mic slide advances) → शुरू कीजिए → login phone-entry — **all
PASS**. OTP send = real SMS = the boundary; your phone completes login → होम →
booking accept → कमाई. Console: one **pre-existing** dev warning
(setState-in-render, onboarding orchestrator — fix chipped as its own task);
no errors, no failed requests.

## Known residuals (honest list — Q5)

**Your rulings pending:** परिचय greeting copy (app vs canon) · परिचय mic-card
CTA (auto-prompt vs canon button) · frame-17 heading placement · F13 muted-CTA
state · F14 food multi-select vocabulary · F16 tier ₹ hints · profile
pill-size arbitration (18 vs 15) · milestone/greeting emoji sets (app
inventions canon lacks) · legacy no-artboard pages (homepage/referral/identity
— English/Hinglish, named-exempt in the no-roman guard) · web tree decision
(docs/web-tree-decision.md — recommend delete-src/app; 2 live web bugs listed
there) · DEVIATIONS.md still needs your 5 signatures + the F32-35 ruling.

**Deliberate keeps over canon (recorded):** back-circles where no other escape
(Ruling #4, ratified) · truthful mic-state overlays on tutorial 5d · आज/हफ़्ते
earnings tiles · celebration stamp holds instead of canon's blink-loop ·
no-mic-icon on fields (your Spec-1) · G4a keyboard-suggestion traded for the
canon OTP keypad (flagged).

**Deferred small items:** VoiceField 18a chrome + listening-state wave cluster
(sharedTodo) · dashboard floated listening-ribbon clip check (needs phone) ·
canon-extract per-frame numeric diff rerun post-ports (CountUp-attribute blind
spot noted; the per-screen skipped-delta lists above are the current honest 残).

**NO MERGE has happened. The command at the top runs on your word.**
