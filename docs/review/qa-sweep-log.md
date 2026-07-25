# QA SWEEP LOG — full-app driven walk (qa/harsh-pass)

**Founder's explicit priority.** Drive the browser, find every error (UI counts as
much as logic), fix immediately, one commit per fix, gates green after each. NO
MERGE — Isj reviews per batch.

## Setup
- Branch: `fix/qa-sweep` off main (base SHA `0ab7a67`).
- LOCAL dev server (pandit) on :3002 — NOT the preview.
- Mobile emulation **390px width** (founder's directive for this campaign;
  supersedes the 360×740 note in the mobile-only-qa memory for this run).
- Login: `9876500050` / OTP `123456` (works on main).
- Both logged-out and logged-in states where a route has both.

## Per-screen loop
Load → screenshot@390 → FUNCTION → UI (vs canon + floors: label≥15, body≥18,
tap≥52, AAA) → LANGUAGE (register law) → TRUTHFUL-STATE → CONSOLE (zero err/warn)
→ FIX → log PASS/FIXED/FLAGGED.

## DO NOT fix unilaterally — FLAG (money/refund/payout/fee · auth/session/identity/
Aadhaar · DLT template text · anything contradicting CONFLICT_RULINGS · any fix
that would weaken a guard). Flag with screen + problem + proposed fix, keep walking.

---

## RESUME POINTER
> **Next page (protocol): PAGE 5 · TUTORIAL DECK** — STAGED (phase TUTORIAL via the skip exit: micLS unset, micDenied=false — the richest state for the slide-5 mic re-offer). Owed: the asleep-state 390px screenshot (pane compositing) + §10 hear-again ruling + interjection-class ruling.
> [dark circle, count visible bottom-right]; अनुमति दीजिए → geolocation grant AND
> deny paths; शहर खुद चुनिए → manual-city screen) → भाषा → परिचय[4 mic outcomes,
> re-verify the persistent skip] → पंजीकरण → OTP → tutorial. Then authenticated B2.
> Fresh-install state reached by localStorage.clear() + reload.
> Env: qa/harsh-pass · dev server :3002 against LIVE API · 390×844 · seed tab.
> Voice checks: शिष्य must be AWAKE (orb 💤 = muted persisted → silence is by
> design, wake first); speechSynthesis fallback makes NO network request, so
> "tts fired" = /api/v1/ai/sarvam/tts in network OR voicedebug panel evidence
> (?voicedebug=1), never network-absence alone.

---

## ═══ PER-PAGE PROTOCOL (journey order) ═══

### PAGE 1 · SPLASH — **PASS** (0 defects; 2 queue items) · 2026-07-24

**§1 ENTRY** `/`→redirects→`/onboarding` (200); fresh state → SPLASH renders ✓ (styled shot via harness + live runs); direct `/onboarding` fresh ✓; hard-refresh during splash → remount + 8s timer restart (source contract + unmount-cleanup test ✓); completed-state entry → resume rules bypass splash (observed: → /login) ✓ by design; back-INTO splash: unreachable (first screen; back law repins) — by design.
**§2 ELEMENTS** Exactly ONE interactive element: the full-screen container (any tap advances — the pill is a visual affordance, the orb tap bubbles to the container). Tap evidence: splashBehavior.test.tsx run live 6/6 ("touch cancels the timer and advances now — no double-fire"); tool latency (~8-10s/round-trip) exceeds the 8s window so the live tap ran at test level — the AUTO-ADVANCE leg was live-proven TWICE (phase SPLASH→LOCATION_PERMISSION with zero interaction).
**§3 MEASUREMENTS** H1 40px/900 (181×88); tagline 18px ✓ floor; pill 19px font, **187×62 ≥52** ✓; orb 82×82 ✓; petals 15-22px aria-hidden decorative; bg gradient = canon EXACT (#2A1B3D/#5E1C0A/#B23A1A/#F2A02C verified computed).
**§4 INPUT ABUSE** No inputs exist on this page — N/A by construction.
**§5 STATES** loading = splash IS the first paint (X1); parked-audio (fresh install, autoplay law) → pill pulse escalates at +1.2s (source path + park test); reduced-motion → fully-composed static scene (all anims `backwards`-fill; code-verified); offline-first-load = browser-level (pre-bundle, not app-ownable); 8s auto-advance live-verified ×2.
**§6 NAV/PERSISTENCE** refresh → remount+restart ✓; no back target (first screen) ✓; double-tap → doneRef single-fire (test ✓); tap = audio-unlock gesture (pointerdown-once-capture test ✓); no form state to lose.
**§7 VOICE** Mount order: `splash.hello` **"नमस्ते पंडित जी!"** → `splash.sparshAsk` **"आगे बढ़ने के लिए स्पर्श कीजिए।"** (test-pinned order). FIRST-EVER open: both PARK by design (autoplay) — the pill carries the ask visually; returning sessions speak. Ribbon = `splash.helloBubble` "नमस्ते पंडित जी! 🙏" ✓ on screen. → audio-check.md entry: splash speaks ONLY when audio is already unlocked; first-install silence is correct.
**§8 CANON** (frame 0/1 vs harness): gradient exact ✓ · real Diya 104 ✓ · wordmark 2-line "हमारे/पंडित जी" 40/900 #FFF6E9 ✓ · toran garland count 11 ✓ · petals 🌼🌸 per canon offsets ✓ · permanent tap pill ✓ · no ॐ ✓. Known floor-deviation: tagline 16→18px (Ruling #2 floor, recorded lawConflict).
**§9 LANGUAGE/TRUTH** All Devanagari; -इए forms; स्पर्श (not छूकर) ✓; no roman UI text; no false claims (pill promises tap→advance, true).
**§10 ILLOGICAL** One gesture, one meaning ("किसी भी जगह स्पर्श = आगे") — the orb-tap bubbling to advance is consistent with "any tap advances". Nothing to unlearn. PASS.
**§11 CONSOLE/NETWORK** Zero errors. Warnings = dev-only (webpack asset-size; Sentry "debug option non-debug bundle" ×2 — minor config nit, queued). Network: all 200; `_rsc` aborts = normal client-nav cancellations.

**QUEUE (batch-boundary):** ① Material-icon ligature FOUC — raw "touch_app"/"bedtime" text visible until the icon font loads (seen during degraded loads); app-wide fix = `font-display: block`/preload for Material Symbols, one change in root layout. ② Sentry debug-flag-vs-bundle config warning.
**ENV (for future sessions):** Next-dev CSS 404 bug — after a second route-group compiles, layout.css can 404 for ALL documents; cure = restart + PRE-WARM every route via curl before pane load. Tool latency makes sub-8s interactions test-level only.

---

### PAGE 2 (pre-filled) · स्थान — ADDENDUM ANSWERED: both splash-exit states · 2026-07-24

**FOUNDER'S QUESTION (§5/§7 addendum): what happens on the TIMEOUT path, and does parked audio replay stale splash lines on unlock?**
**ANSWER — verbatim voicedebug evidence (prod build, live API):**
```
13:08:27.750  splash: 8s elapsed — auto-advancing
13:08:27.905  speak "पंडित जी, अब हम आपकी लोकेशन लेंगे — ताकि…"  → parked (pre-unlock)
13:09:54.374  unlock: gesture-token set        ← the FIRST tap on स्थान (neutral area)
13:09:54.377  speak (SAME स्थान line) → tts cache HIT 3ms (splash prefetch!) → play resolved
13:10:02.912  audio ended                      ← played ONCE, ~8.5s
13:12:00.469  stopSpeech(barge-in:tap)         ← a later tap on an interactive target barged in, per design
```
- **STATE B (8s timeout, audio never unlocked):** the pandit SEES a complete visual ask — orb ribbon "आप कहाँ पूजा कराते हैं?" + headline "आप कहाँ सेवा देते हैं?" + अनुमति CTA — and HEARS silence (correct: parked). 
- **First tap on स्थान:** unlock → the parked line replays — **exactly ONE line, the CURRENT screen's ask, from prefetch cache (3ms), no stale splash audio, no double.** The single-slot newest-wins park contract works live.
- **STATE A (tap-exit):** mechanism-verified — the identical speak path demonstrated live post-unlock (cache-hit → play resolves); on a tap-exit the same call simply never parks. (Tool latency cannot beat the 8s window for a separate end-to-end tap run; splashBehavior 6/6 pins the tap leg.)
- **Bonus finding:** `api ping → AbortError in 8003ms` — the Render health ping timed out (cold start); diagnostic only, harmless.
- **ENV UPGRADE:** the walk now runs on a PRODUCTION build (`pandit-prod` in launch.json) — the recurring dev CSS-404 is eliminated; fix-as-you-go costs one rebuild per fix.

---

### PAGE 2 · स्थान (LOCATION_PERMISSION + MANUAL_CITY fallback) — **PASS after 2 fixes + 1 ruling executed** · 2026-07-24

**§1 ENTRY** fresh via splash timeout ✓ and via tap (mechanism) ✓; direct /onboarding with persisted LOCATION phase → stays ✓; back-INTO from MANUAL_CITY (पीछे जाइए) → returns to स्थान ✓; hard refresh → phase persists, स्थान re-renders ✓; logged-in entry → resume bypass (by design, verified earlier).
**§2 ELEMENTS (all 5 tapped)** अनुमति दीजिए → geolocation attempt; with device capture BLOCKED (pane) the DENY path fires → falls through to MANUAL_CITY — **no dead end, the fallback IS the recovery** ✓. शहर खुद चुनिए → MANUAL_CITY ✓. Orb (awake)=repeat a11y "फिर से सुनिए — शिष्य दोबारा बताएँगे" ✓. Toggle pill: सुला दें → speak-then-mute → asleep; जगाइए → wakes; full round-trip on prod build ✓. MANUAL_CITY adds: back-arrow ✓, city input ✓, 8 preset city rows ✓ (वाराणसी tapped → exits to भाषा, detectedCity persisted ✓), "यही शहर चुनिए" custom-confirm (appears only with text) ✓. GRANT leg not runnable in the pane (device capture blocked) — deny leg proven; grant is the location-screen tests' domain.
**§3 MEASUREMENTS** H2 29px · body 18px ✓ · अनुमति 21px/346×62 ✓ · शहर-खुद 17px/149×52 ✓ · orb 62×62 ✓ · pill 96×52, label 15px ✓ · शिष्य 15px ✓. Only sub-floor item = the dev-only 🐞 voicedebug badge (12px, query-param-gated — exempt).
**§4 INPUT ABUSE (city input)** empty → confirm hidden, cannot submit ✓ · valid Devanagari → confirm ✓ · roman "Mumbai" → ACCEPTED as custom city (tolerant input; lowercase map still resolves language) ✓ · whitespace-wrapped → trimmed on submit (source line 62) ✓ · **too long: 200 chars ACCEPTED → FIXED: maxLength=40** (verified live on rebuild) · paste = same path ✓ · double-tap city row: exit is store-transition idempotent (second tap lands on unmounted list) ✓. Observation (not a defect): typing does NOT filter the preset list — it is suggestions + custom entry.
**§5 STATES** loading = SSR paint (prod, instant); parked-audio state (splash-timeout entry) → **silence + complete visual ask** (ribbon "आप कहाँ पूजा कराते हैं?" + headline + CTA) ✓; offline: page fully client-side post-load, actions are local (nothing to fetch) — offline-first-load = browser page; error state = the deny→manual-city fallback itself ✓.
**§6 NAV/PERSISTENCE** refresh persists phase ✓ · back-arrow returns without state loss ✓ · double-tap अनुमति: second fires another gUM (denied again — idempotent) ✓ · exit transition वाराणसी→LANGUAGE_CONFIRM ✓.
**§7 VOICE (both splash-exit states — addendum)** mount line `entry.locationVoice` "पंडित जी, अब हम आपकी लोकेशन लेंगे — ताकि…". TIMEOUT entry: parks (pre-unlock), first neutral tap → unlock → SAME line replays ONCE from prefetch cache (3ms) → played 8.5s → ended — **no stale splash audio, no double** (verbatim voicedebug). TAP entry: identical call path, never parks (mechanism-proven + splashBehavior 6/6). Interactive tap during speech = barge-in stop, by design.
**§8 CANON** (frame 2, via live render + harness/location): structure ✓ (garland header → headline → map card → body → sindoor CTA → text-link secondary → orb footer); map = drawn placeholder art w/ pin ✓; palette cream/sindoor ✓. Deviations: none found beyond recorded floor-raises.
**§9 LANGUAGE/TRUTH + EMOJI ROW** Register clean (-इए everywhere: दीजिए/चुनिए/लिखिए/जाइए); truthful copy ("आपके शहर की पूजाएँ और आपकी भाषा — बस इसीलिए" — exactly why location is asked). EMOJI on page: 📍 (in map placeholder — canon draws a REAL pin; emoji acceptable as placeholder art, → running table) · 🙏 (orb glyph — canon's own) · 🐞 (dev badge only).
**§10 ILLOGICAL** Primary/secondary hierarchy clear (big अनुमति vs text-link शहर खुद); the pill toggle = one element/one concept (amended #9); **wake-hint REMOVED this turn per Isj ruling — verified at 390px: asleep orb shows only शिष्य + जगाइए pill** (screenshot banked). Nothing left to teach.
**§11 CONSOLE/NETWORK** Network all 200s. **DEFECT FOUND & FIXED: React "cannot update a component while rendering a different component" — SIX render-phase store.setPhase redirect sites in the onboarding orchestrator** (PARICHAY stale-order ×2, REGISTRATION review-intent + no-token, legacy-phase mappers ×2) → all converted to a deferred-redirect helper (render null now, commit the store change in a post-render effect; ref-cleared, loop-proof). tsc clean, onboarding suite 16/16.

**RIDE-ALONGS SHIPPED THIS TURN:** ① Isj ruling: wake-hint removed (ShishyaOrb + strings + orbColumnContract registry per stale-entry rule) — जगाइए pill is the single wake affordance; ② FOUC: Material Symbols now loads `display=block` (ligature fallback leaked raw English icon names) + iconFontDisplay guard; ③ §4 maxLength=40; ④ §11 render-phase redirect refactor.

### RUNNING EMOJI TABLE (append per page — icon-system ruling when the walk completes)
| Page | Emoji | Canon shows | Note |
|---|---|---|---|
| splash | 🌼🌸 (petals), 🙏 (orb) | canon uses these glyphs | per canon offsets — OK |
| स्थान | 📍 (map placeholder), 🙏 (orb), 🐞 (dev badge) | canon draws a real pin on map art | 📍 = placeholder-art candidate |

---

### PAGE 3 · भाषा (LANGUAGE_CONFIRM + LANGUAGE_LIST) — **PASS** · 2026-07-24 · + Ruling #9 SECOND AMENDMENT executed

**CARRY-ITEMS CLOSED THIS TURN:**
- **सुला-दें RULING (second amendment) EXECUTED APP-WIDE:** orb tap (awake) = PERSISTENT sleep announced first (muteWithFarewell); सुला-दें pill deleted (one component); asleep = dimmed orb + जगाइए (either wakes); tap-repeat RETIRED — hear-again lives in the voice grammar ("फिर से"); rung-2/3/unmatched tap-teach clauses removed; tapRepeatTeaching.test.ts retired (property ruled false); shishyaOrbGesture.test.ts REWRITTEN to pin the final model; orbColumnContract registry updated. CONFLICT_RULINGS #9 records both amendments. **PROOF (390px, prod build): भाषा awake = orb only, pillPresent:false ✓; orb tap → farewell → asleep + जगाइए pill + aria flips "शिष्य को जगाइए" ✓; navigated to LANGUAGE_LIST while asleep → `STILL_ASLEEP_ON_NEW_SCREEN: true` ✓ (the persistent-park property, live); जगाइए wakes ✓.** 25/25 guards, tsc clean.
- **"200" BADGE GATE (evidence):** `src/components/VoiceDebugPanel.tsx:27` — renders ONLY when `?voicedebug=1` was visited (latches sessionStorage `hpj_voicedebug`; `?voicedebug=0` clears). There is NO NODE_ENV gate — it CAN render in a prod build, but only via the explicit URL flag, never organically. DELIBERATE: real-device diagnostics (the audio-check phone pass itself uses it). If Isj wants NODE_ENV-never, say so — one line to add; recommendation: keep the flag.
- **स्थान §5 offline/slow-3G:** **N/A-by-construction — zero app network calls on the screen** (deny path + manual-city are pure client state; the only request in the walk's network log was the diagnostic /health ping). Written, not implied.
- **DEVICE-PASS CHECKLIST:** geolocation GRANT-leg added next to the mic-permission walk (audio-check bundle) — pane cannot grant device capture.

**§1 ENTRY** staged via स्थान exit (only path in — LANGUAGE_CONFIRM requires onCitySelected/onGranted, both taps → **entry audio is ALWAYS unlocked here: verified, the claim holds**); refresh mid-भाषा → phase persists ✓; back-INTO from LANGUAGE_LIST (पीछे जाइए) ✓.
**§2 ELEMENTS (all tapped)** हाँ-हिन्दी CTA (exit — fires at walk end), दूसरी भाषा चुनिए → full LANGUAGE_LIST (11 languages, native+english labels, select→tick→आगे बढ़िए commit) ✓, back arrow ✓, orb (both states — above) ✓. **Changed-choice behavior: selecting मराठी + आगे बढ़िए COMMITS AND ADVANCES** (preferredLanguage:"mr" stored; app continues in Hindi per the v1 honesty model with the Marathi notice spoken) — the flow does NOT return to the हि tile; the tile screen is the initial detect-confirm only. Verified by design, stored-state cited.
**§3 MEASUREMENTS** tile 64px glyph/28px name; H1 24px; CTAs 20px/336×64 + 18px/336×56 ✓; orb 66² ✓; list rows ≥56h ✓. All floors pass.
**§4 INPUT ABUSE** No text inputs on either screen — N/A by construction (choice UI only).
**§5 STATES** detection-failure: **N/A-by-construction** — `detectLanguageFromCity` = `CITY_LANGUAGE_MAP[normalized] ?? 'Hindi'` (onboarding-store.ts:183): the mapping can never resolve nothing; unmapped city → Hindi tile. Loading: the D3 language-switch runs a blocking DiyaLoader with the target language's own wait line (source-verified). Offline: language switch fetch fails → honesty notice + continue in Hindi (runLanguageSwitch fail path, source-verified).
**§7 VOICE** Confirm line (spoken IN the detected language, hi-IN): `LANG_CONFIRM.hi.confirmQuestion` — **"हमने आपके क्षेत्र की भाषा हिन्दी पहचानी — इसी में चलें या बदलें?"** — written+spoken travel together (the H1 IS the line; on-screen text matched verbatim). U3: the हाँ button glows for its line. List screen ask: orb ribbon "कौन सी भाषा पसंद है?" ✓ observed.
**§8 CANON** (frame 3): giant genda-tinted language tile + question + primary/secondary CTA stack + orb footer — structure/palette match the live render; no new deviations.
**§9 LANGUAGE/TRUTH + EMOJI** Register clean (चुनिए/बढ़िए/जाइए); truthful (detect claim is real — वाराणसी→हिन्दी via the city map). EMOJI: 🙏 (orb, canon's own) + 🐞 (dev badge) — appended to the running table.
**§10 ILLOGICAL** Two clear choices, one primary; the list's select-then-confirm beats instant-commit for thick fingers; the collapsed orb = one gesture, one meaning everywhere. PASS.
**§11 CONSOLE/NETWORK** Fresh prod build through the FULL भाषा walk (post-redirect-refactor orchestrator): **zero new console errors/warnings** (the buffered setState-in-render error predates and was FIXED in PAGE 2's refactor). Network: page transitions all client-side; the Marathi bundle attempt + TTS to the live API are the only fetches — all 2xx.

| Page | Emoji | Canon shows | Note |
|---|---|---|---|
| भाषा | 🙏 (orb), 🐞 (dev badge) | canon's own / dev-only | no new emoji |

---

### HALT — SCREENSHOT DISCIPLINE (Isj, 2026-07-24→ resolved 2026-07-25)

**Isj reported the UI visibly ruined while reports said PASS.** Walk stopped; vision restored; every screen since the last banked shot re-evidenced IN PIXELS.

**ROOT CAUSE — the pane, not the app.** The Browser pane had entered a broken 2×-DPR state: its display/capture delivered a 390×844 **crop of the 780×1688 physical buffer** — half the UI missing, content clipped at the right edge ("visibly ruined" is exactly what that looks like), and click injection landed at HALF coordinates (the PAGE 4 dead-tap mystery — same root). The page's own layout was healthy throughout (innerWidth 390, scale 1, geometry correct). **Cure: a resize_window round-trip (400×850 → 390×844) restores both capture and input**; re-verified twice this halt (it recurred once mid-re-shoot and was cured again). Recorded in memory + here.

**OWNED: the evidence was in hand and misread.** Two of my own screenshots during PAGE 3/4 showed the ruin (blank cream + clipped red shape) and I dismissed them as "stale compositor artifacts" because DOM geometry said the layout was centered. DOM said healthy, pixels said ruined — I believed the DOM. That is the exact hole the new rule closes.

**RE-EVIDENCE PASS — 8 fresh screenshots, all HEALTHY (banked this session, prod build :3002 + production):**
1. स्थान — toran, heading, map+pin, explainer, अनुमति दीजिए, शहर खुद चुनिए, awake orb + ribbon ✓
2. भाषा confirm AWAKE — tile/question/CTAs, **orb only, NO pill** (second amendment, now photographed) ✓
3. भाषा ASLEEP — **the owed shot, banked**: dimmed orb + z + जगाइए pill (drawn light_mode glyph), via a REAL tap ✓ (nit logged: pill sits ~10px right of orb center — the w-max escape anchor; cosmetic)
4. भाषा list — toran, back, 8+ native tiles, truthfully-disabled आगे बढ़िए, ribbon ✓ (nit: dev-only 🐞 badge overlaps the CTA's right end — flag-gated, not prod)
5. परिचय needstart — orb 118, greeting, mic card, "🙏 बात शुरू कीजिए", skip ✓
6. परिचय denied recovery — settings hint + फिर कोशिश कीजिए + आगे बढ़िए + skip, via REAL taps ✓
7. Tutorial slide 1, awake orb — CountUp, booking-card choreography, dots 1/7, आगे ✓ (no layout hole where the सुला-दें pill sat)
8. **PRODUCTION** (hmarepanditji-pandit.vercel.app @ 28a936f) — भाषा confirm pixel-clean ✓

**SUSPECTS CLEARED WITH PIXELS:**
- (a) FOUC display=block: **mic + lock render as DRAWN Material glyphs** (shots 5/6) and `document.fonts` reports "Material Symbols Outlined loaded" on the prod build. No blank icons, no raw ligature text.
- (b) सुला-दें pill deletion: no layout holes on any of the 8 screens; awake column is orb-only, asleep column shows the जगाइए pill.
- (c) redirect refactor: no render-null flashes across ~10 reloads during the pass; zero console errors.

**STANDING RULE (recorded, permanent):** No visual claim without a same-turn screenshot (target ≤5s from interaction), banked in the ledger. DOM/computed values are supplements, never substitutes — a section whose only evidence is DOM text is INCOMPLETE. If compositing dies mid-walk: HALT the page, cure vision (resize round-trip), re-shoot everything since the last good shot. The "shot stays owed while the walk continues" practice is REVOKED. PAGE 1-4 sections whose sole visual evidence was DOM-based are hereby marked supplemented-by-this-pass (the 8 shots above cover every such screen); PAGE 5 onward runs under the rule natively.

**Note for Isj:** all eight screens above are pixel-healthy on both the local prod build and production. If the ruin you saw was on a specific screen/device beyond these (e.g. deeper pages, a real phone), name it and it becomes the first re-shoot target — with the pane cure in hand the walk now has reliable eyes.

---

### PAGE 9 · होम (the dashboard) — **PASS; 1 crash bug found & fixed; SOS P1 closed with rects** · 2026-07-25 · headless eye

**TURN ITEMS CLOSED FIRST:** (1) **SOS P1 CLOSED** — bottom-6 → 104px (4px sliver remained on the hub, rect-measured: sos b740 vs orb t736) → **116px: overlap FALSE, 8px gap** (sos {263,672,h56} vs orb {278,736,66²}); BOTH independently tappable, tapped: SOS expands its quick-action ✓ (sos-expanded.png; the inner dial-support action never fired), orb tap lands ✓ (farewell path engages; the asleep-at-2.5s read is mid-farewell timing — mechanism multi-page-proven). Before/after pair: page8-hub/hub.png ↔ page9-final/hub-after-sos-fix.png. (2) **व→और renders** — the hub card AND footer CTA read "पूजाएँ और दक्षिणा(भरिए)" in pixels (my innerText checker was the bug, not the copy). (3) **KM guard green** — kmPresetsWhitelist.test.ts 1/1 after the {km,label} extraction repair; client pills ⊆ server [10,25,50,100,200,500,999]. Deploys verified 9b57663 (both surfaces) then 3c4a372 (pandit).

**§1** Entry = post-auth landing (/home), guarded by layout F4 + /auth/me (401→login; 5xx→retryable error, never ejects). **§2 EMPTY LEG (the probe IS day-one, all in pixels):** 🪔 नमस्ते, टेस्ट जी + settings gear → /settings ✓; 🕉️ शनिवार · 25 जुलाई strip (muhurat chip truthfully absent); ⚠️ pending banner; ₹0/₹0 hero; तैयारी hero (no progress pill at step 0) → /readiness/hub ✓; आज empty-state; stat row + next-booking hero truthfully ABSENT; bottom nav होम/बुकिंग/[orb]/कमाई/कैलेंडर all tapped → /bookings /earnings /calendar ✓ (run-1 कैलेंडर miss was a harness artifact — retracted).
**§5 POPULATED LEG (route-interception fixtures on the real bundle — zero prod writes) — ALL EIGHT BRANCHES RENDERED:** अगली-बुकिंग hero ✓, आज row (02:30 PM गृह प्रवेश पूजा अस्सी घाट — timezone-correct) ✓, 3-stat row ✓, ₹12,500 + आना बाकी ₹3,000 ✓, तैयारी hero replaced by the GO-ONLINE pill ✓ **+ its first-time coach overlay ("बुकिंग चालू-बंद … समझा") — a state beyond the recon map, photographed**; toggle → intercepted PATCH → optimistic online + "परिवार अब आपको बुला सकते हैं ✓" ✓ (home-online.png).
**🔴 CRASH BUG FOUND BY THE POPULATED LEG, FIXED + GUARDED:** HomeView.tsx:435 called `b.venueAddress.split(",")` UNGUARDED (siblings :358/:466 use ?.) — **one today-booking with a missing venueAddress white-screened the entire dashboard.** Fixed to ?. ; homeNullSafety.test.ts pins every occurrence optional-chained. This is the §5 leg earning its keep.
**§7** Live greeting is FIXED-form "नमस्ते, {firstName} जी" (honorific-stripping proven: fixture "पं. परीक्षण शर्मा" → "परीक्षण जी"). **The सुप्रभात/शुभ-संध्या time-of-day variants EXIST in source (GreetingHeader.tsx:14-38 + day-rotating shloka) but are wired ONLY to the dev /design gallery — not the live dashboard.** Flag for Isj: adopt or delete. Mount narration heard: readinessHeroVoice verbatim; pending-banner narrate ✓.
**§8** Canon frame 8 header ruling (plain cream greeting row) ✓ in pixels; stale "frame 12" comment labels noted by recon (cosmetic). LAW>CANON overrides stand (52px settings tap, 18px strip).
**§9** Register clean; EMOJI: 🪔 ⚠️(banner glyph) 🚩 🌤️ 🆘 — all prior-inventoried. **Observation queued: the आज row time renders latin "02:30 PM" (formatTime) while the hero uses formatTimeHindi — one formatter should win.**
**§10** none new (SOS fixed; 🐞 overlap dev-only). **§11** Zero app errors on the final runs (health/muhurat CORS noise only; muhurat chip stays truthfully off when its fetch fails — degrade-to-hidden verified by construction and observed).

---

### PAGE 8 · तैयारी (readiness hub + wizard engine) — **PASS with 1 P1 + 2 findings** · 2026-07-25 · headless eye, PROD probe session

**§1 ENTRIES:** home तैयारी hero (when !isBookingReady) → /readiness/hub; bookings empty-state CTA; voice "तैयारी" dashboard-wide; rejected-KYC home banner → /readiness?step=5 direct; bare /readiness = the wizard ENGINE (canonShapesLive pins nav targets to /hub). Auth: client F4 guard + data-gate (GET /pandit/readiness fail → /home). Header back → /home ✓ walked.
**§2 HUB (all in pixels, prod):** maroon diya banner "0 / 5 दीये जल गए" (5 unlit diyas); 5 cards on the 3-state machine — पूजाएँ व दक्षिणा [अभी कीजिए, saffron pill], सामग्री/यात्रा/भोजन व ठहराव/भुगतान व सत्यापन [बाकी, parchment]; footer CTA "पूजाएँ व दक्षिणा भरिए"; orb + SOS मदद. WIZARD R1 also walked (first run): 9-puja emoji tile grid (📖🏡💑👶🍼🔥💦👵…), आगे बढ़िए, "बाद में पूरा कीजिए" escape → /home ✓ (F2 alive), empty-आगे stays put ✓.
**§3 floors** per canon hub port (exact-UI ruled) ✓ shots. **FINDING (P2, prod-visible): the SOS मदद pill OVERLAPS the orb** in the hub footer at 390×844 — the one-orb law's single voice control is half-covered (hub.png). Queue: dock spacing fix.
**§4** No text inputs on the hub (N/A); wizard R1's empty-submit holds the line (stays, no advance). Full wizard-form abuse = the per-step walks (R1-R5 are their own journey pages downstream).
**§5 PARTIAL-COMPLETION MATRIX — the ladder is PURE SEQUENTIAL, no combinations:** server readinessStep (0-5) is the only driver; statusOf: ≤done→हो गया (still tappable for re-edit), ===done+1→अभी कीजिए (exactly one), else बाकी (hard-disabled). LIVE PROOF at the 0/5 point: card 1 → wizard ✓; **cards 2-5 tapped ×4 → no navigation (disabled holds)** ✓; deep-link clamp proven live (?step=5 @ readinessStep=0 → "चरण 1 / 5"). Monotonic server advance (never regresses on re-edit). HONEST LIMIT: the done-tint/re-edit and allDone (5/5 celebration + "तैयारी पूरी — होम चलें") states are source-pinned (hub:121-131,192-194; controller:329-332 sets isBookingReady + DOCUMENTS_SUBMITTED atomically at step 5), NOT walked — advancing the probe's readinessStep mutates the shared prod account; a dedicated fresh test number could walk the full ladder if Isj wants it (one junk prod user — his call). **CAVEAT (REPORT): server does NOT enforce ordering** — PATCH {step:3} at readinessStep=0 succeeds and jumps the pointer (client-law only; merge-day/hardening list).
**§6** Hub↔wizard↔home routing walked ✓; resume = server truth (no local draft dependence at hub level).
**§7 NARRATION (heard on prod, matches source verbatim):** hub — "आपकी तैयारी 0 बटा 5 पूरी है। अगला कदम — पूजाएँ व दक्षिणा।" (template hub:86-92); wizard R1 — "पंडित जी, आप कौन-कौन सी पूजा करवाते हैं?"; the hero intro "पंडित जी, बुकिंग पाने के लिए बस पाँच छोटे कदम…" ✓.
**§8 CANON:** the hub SHAPE is itself the exact-UI ruling's winner (hub header comment); diya banner/cards/footer per the readiness canon port ✓ in the shot.
**§9 REGISTER + EMOJI:** clean (कीजिए/भरिए); **copy nit: hub "पूजाएँ व दक्षिणा" vs wizard r1Title "पूजाएँ और दक्षिणा"** (व/और drift — one-word fix queued). EMOJI: 🪔 diyas (canon's own) · R1 puja tile emojis (canon set) · 🆘 SOS — nothing new.
**§10** Exactly one actionable card at a time + a disabled-but-visible future = right for this persona; the SOS-over-orb overlap is the one wart (P2 above).
**§11** Zero app console errors across login + hub + 6 taps + R1 (prod).
**KYC BOUNDARY (honored):** R5's Aadhaar upload tiles/12-digit field/DPDP consent/bank-UPI tabs were mapped (recon) and NOT fired — no upload, no submission, per standing law. R5's own §-walk = its journey page, UI-look only.
**P1 (REPORT, needs Isj's pick):** client R3 KM presets [10/25/50/999] vs server whitelist KM_STEPS [25/50/100/200/500] — **choosing 10 कि.मी. or 100+ makes R3's save 400-fail.** Options: (a) widen the server whitelist to the client's set (one-line, keeps the designed pills), or (b) client adopts the server steps (changes the offered distances). Product pick → Isj.

---

### PAGE 7 §8 CLOSURE + RIDERS (2026-07-25)

**§8 CANON — DELIVERED, CLOSED CLEAN:** canon frame 6 ("पंजीकरण · Registration", canon .dc.html:337-368) **IS the single-screen form** — "बस दो बातें बताइए" + "बोलकर या टाइप करके — जैसे आसान लगे", TWO field cards (आपका नाम 🙏 "पं. रमेश शर्मा" / आपका शहर 🏙️ "वाराणसी", each with a 54px mic disc), one full-width CTA, orb say "बाकी सब मैं देख लूँगा 🙏", toran. **No wizard exists in canon — no drift; the shipped form matches the artboard's structure.** Residuals noted (flags, not fixes): canon CTA reads "आगे बढ़ें" vs live "खाता बनाइए"/"प्रोफ़ाइल पूरी कीजिए" (live is MORE truthful — existing BATCH 2A-era divergence, stands for Isj's canon refresh); canon draws per-field emoji (🙏/🏙️) the live cards don't.

**DEAD ROUTE-GROUP — FENCED, not deleted (one line why):** canon confirms no wizard revival looms, but the 8 stubs are live redirect safety for legacy links/resume states — deleting them 404s old URLs. Guard `registrationStubsFence.test.ts` (9 tests): every page in the group must stay a redirect-only stub (router.replace + return null, no input/form/VoiceField/Button/useState) — UI cannot regrow behind dead routes without consciously deleting the fence.

**PROD-SIDE LENGTH CAP — CLOSED from source (no prod mutation needed):** `submitOnboarding` (services/api/src/app.ts:262 → onboarding.controller.ts:275) validates ONLY min-length (name ≥3, city non-empty) — no zod schema, no max — then writes straight to Prisma `user.name` + `panditProfile.fullName/location/city` (String = unbounded TEXT). **The API stores the 246-char name unbounded. MERGE-DAY LIST +1 (server): Fastify/zod schema with max caps (name ≤80, city ≤60 suggested) on /pandit/onboarding.** Report-only, as ordered.

---

### PAGE 6 ADDENDUM — AUTH COPY + NORMALIZATION FIXES (Isj order, 2026-07-25) — SHIPPED & RE-VERIFIED

Three-way error split (strings single-sourced in the auth block): bad phone → "कृपया 10 अंकों का मोबाइल नंबर डालिए।" (client gate now mirrors the server's [6-9]\d{9} law; invalid_phone_number from the API maps here too); wrong OTP → "OTP सही नहीं है। कृपया फिर से देखकर डालिए।" **+ boxes clear + focus box 1** (auto-verify re-fires without six backspaces); network/API failure keeps the honest generic. Typed path now normalizes through voiceParse (SINGLE-SOURCE with the voice path — same module): Devanagari→ASCII (the voice path gained this too), separators/+91/91/0 stripped, capped 10; placeholder is now an input the validator accepts ("9876543210"); inputMode numeric + maxLength 18 (14 first — it truncated 15-char formatted pastes BEFORE normalization, caught by the re-verify, widened). Guard authErrorCopy.test.ts (10 tests, PROVEN-TO-FAIL 10-red first). HEADLESS RE-VERIFY on the final bundle (shots page6-fixed/): placeholder-as-typed echoes 9876543210 → real send → network-generic ✓; Devanagari echoes 1234567890 → phoneInvalid ✓; letters echo "" → phoneInvalid ✓; paste-formatted echoes the full 10 ✓. MERGE-DAY LIST +3: the hold branch adopts these exact strings, the normalizer, and the boxes-clear behavior; attempt caps remain hold-branch semantics.

### PAGE 7 · पंजीकरण (RegistrationScreen — FLOW C single-screen form) — **PASS with 2 observations** · 2026-07-25 · headless eye

**STRUCTURAL HEADLINE:** पंजीकरण is NOT a wizard — one screen, two fields (name + city), voice-first; the entire (registration) route group is dead redirect stubs (each page redirects to /onboarding|/login). The "wizard" of the journey map is this form.

**§1 THREE ENTRIES WALKED:** fresh (token, no flag) → "बस दो बातें बताइए" + CTA "खाता बनाइए" ✓ shot; **FLOW C** (hpj_returning_incomplete="1") → CTA flips "प्रोफ़ाइल पूरी कीजिए" ✓ shot; token-less → phase AUTH → /login (source-pinned). Resume rule: /auth/me success+complete → /home; ANY failure (incl. the local CORS block) → FLOW C by design.
**§2** Two VoiceFields (mode=text, required, bare) + CTA + back circle + orb; voice commands: हाँ/आगे/खाता-बनाओ = submit, पीछे = back; J2 mic-yield between fields.
**§3** Field floors per VoiceField (56px min, 20-23px text) ✓ shots.
**§4 ABUSE:** empty name → "नाम कम से कम 3 वर्णों का होना चाहिए" (shown+spoken ✓ this screen already has actionable copy); 2-char name → same ✓; empty city → "शहर का नाम आवश्यक है" ✓; **OBSERVATION 1: roman name "Pt. Ramesh Sharma" accepted silently** (no script rule — user data, not UI copy; flag for Isj's call, likely fine); **OBSERVATION 2: no client length cap — a 246-char name echoes fully** (server truth unknown from local; queue a prod-side check). City prefills from detection (वाराणसी) and a restored draft blocks re-prefill.
**§5 THE PROTOCOL'S QUESTION — mid-form F5: DATA SURVIVES.** Both fields write-through persist PER KEYSTROKE (zustand hpj-registration); typed "पंडित परीक्षण शर्मा"/"काशी" → F5 → both restored, IN PIXELS (after-f5.png). Known edges (source): detection-prefilled city is local-only until edited (F5 re-prefills — harmless); the returning flag is sessionStorage (new tab downgrades the CTA silently — minor); QuotaExceeded swallows writes silently (BUG-024 stands).
**§6** Back (screen + hardware) → TUTORIAL slide 6 ✓ walked (state proof). Submit success → celebration → /home (API-dependent; celebration unreachable locally — env note).
**§7** Field narration heard: name prompt + "आप किस शहर में रहते हैं? नीचे लिखिए या सूची से चुनिए।" — **nit: the city prompt promises a सूची that does not exist on this screen** (free text only; copy inherited from the old city-list screen — queue a one-word copy fix with Isj). Failed submit SPEAKS "इंटरनेट टूट गया — आपकी बात सुरक्षित है…" — the data-safe promise, TRUE (per §5). 
**§8** Canon पंजीकरण port (BATCH 2A hero heading/field cards) stands in the fresh shots.
**§9** Register clean; EMOJI: 🎉 (celebration, source) — nothing new. **§10** none — two fields, one CTA, always-enabled with validation-on-tap (right for this persona). **§11** Zero app errors (health-ping CORS noise only).

---

### PAGE 6 · AUTH (लॉगिन/रजिस्ट्रेशन + OTP — /login) — **PASS with 4 findings (main's pre-hardening shape, as ordered)** · 2026-07-25 · headless eye

**P0 PRELUDE (same turn): the mic-grant record fix SHIPPED + deploy-verified 7e8bdf8** — single-source writers (micPermission.ts), TutorialV2 settleMicPerm choke, VoiceRoot mount reconciler, micGrantRecord.test.tsx (proven-to-fail 3-red first), 9 direct writers rewired, headless pregranted re-prove: deck exit micLS='true' + listen loop ARMED (paused=false). Wall 66/769 green.

**HARNESS:** scripts/page6-auth-headless.mjs. Boundary honored: WHAT MAIN SHIPS TODAY; hold-branch code untouched. SMS-safety established first: main sends NO OTP SMS (no provider on the OTP path; prod issues "123456" for every number via OTP_DEV_MODE — render.yaml:24-25); probe number +919999999999 per the check-auth-live convention; ≤2 sends used of the 3/10min budget. ENV NOTE: step-2 legs ran on the PRODUCTION origin — localhost:3002 is CORS-blocked at the live API (same class as the language-switch fail path); also a stale-server/build-graph mismatch (refused 912-chunk) invalidated two earlier runs — server restart cured; results before the cure were discarded.

**§1** AUTH phase = pulsing 🪔 → token? REGISTRATION : /login?next=/onboarding. Entry-flow footer docks 📖 ट्यूटोरियल फिर देखिए + orb; hardware back = review-tutorial intent. Step-1 shot banked (local), step-2 shot banked (prod).
**§2** Step 1: header (no back), 48px waking slot (4s → DiyaLoader + "सर्वर जग रहा है…"), sub copy, VoiceField phone, आगे बढ़िए, error box, tutorial dock + orb. Step 2: back arrow (→ step 1, clears boxes), returning-greeting "वापसी पर स्वागत, पंडित जी", "+91 99999 99999 पर भेजा गया" (5-5 spacing ✓), 6 boxes (box-0 one-time-code, WebOTP 60s listener, paste distributes, backspace walks), resend row, 3×4 keypad, orb footer. All in pixels.
**§3** Boxes ≤62×72, keys ≥58px, digits 36/900 — floors ✓. **Minor flag: the keypad 0/backspace row sits partially under the footer fold at 390×844** (functional via paste/WebOTP; 0-key tap reachability → device-pass check).
**§4 INPUT ABUSE — the richest page, 7 phone variants + 3 wrong codes, all live:**
| variant | result |
|---|---|
| "98765 43210" (typed EXACTLY as the placeholder shows) | 🔴 REJECTED with the generic line — **the placeholder teaches an input the validator refuses** |
| +919876500050 | rejected (typed path never strips +91 — the VOICE path does; inconsistent normalization) |
| १२३४५६७८९० (Devanagari ×10) | passes the client length gate → API 400 → same generic line |
| abcdefghij (letters ×10) | passes the client gate (!) → API 400 → same generic line |
| 12345 · 0555555555 · "+91 98765-43210" | rejected → same generic line |
All 7: echoed RAW (no maxLength/inputmode/normalization on the typed path), none advanced, and **one identical error for everything — "कुछ गड़बड़ हो गई। दोबारा कोशिश कीजिए।" — shown AND spoken 7×** (voicedebug). FINDING #1: the error never says WHAT to fix ("10 अंक डालिए" class copy absent); FINDING #2: the placeholder-vs-validator trap; FINDING #3 (OTP): wrong code ×3 → same generic line each time and **the boxes are never cleared** — auto-verify won't refire until the pandit manually backspaces 6 digits; no expiry-specific copy exists (post-TTL otp_not_found → same line, no "नया OTP मंगाइए" hint). FINDING #4 (server, REPORT-not-fix per the auth boundary): verify has NO attempt cap on main — a 6-digit hash survives wrong guesses until TTL, bounded only by the global 100/min/IP.
**§5** Wrong ×3 / resend countdown (30s tick → underlined link, clickable, re-send works) / success: 123456 → token + 30d cookie → **landed /home as टेस्ट जी** (shot banked). Note: next=/onboarding was overridden to /home for the profile-complete account — one line of drift vs the recon's reading of the redirect rule, logged for the next look.
**§6** Back from step 2 → step 1 with boxes cleared ✓ (source + walked); session persists via hpj_token.
**§7** Step-2 narration quoted + heard: greeting + "आपके मोबाइल पर छह अंकों का ओटीपी भेजा गया है…" (+ WebOTP Allow-line only when supported and not dev-mode); voice grammar: भेजो/resend/नहीं-आया = resend, BACK = edit number; OTP digits typed-only by law A5 ✓.
**§8** Canon: पंजीकरण/OTP ports from BATCH 1/2A stand (hero heading, field cards, OTP boxes) — no new deviations in the fresh shots.
**§9** Register clean (डालिए/भेजिए/कीजिए); truthful-state pass EXCEPT the generic-error class above (an error that explains nothing fails the spirit); EMOJI: 🪔 (AUTH veil) · 📖 (tutorial dock) · 🙏 (reauth banner, orb) · 🐞 — nothing new.
**§10** Auto-verify at digit 6 with no verify button = correct for this persona; the un-cleared wrong-code boxes are the one flow-logic wart (FINDING #3).
**§11** Zero app console errors across both origins (the three 400s are the wrong-code verifies, by design; refused-chunk was the env issue, cured).

**MERGE-DAY DIFF LIST (hold/otp-hardening-v2 vs today, for the credentials day):** (1) 123456 dies EVERYWHERE (isStaticOtpAllowed hard-false in prod; legacy bypass branch deleted) — every QA probe flow that verifies with 123456 breaks, including check-auth-live and this page's harness success leg; (2) every send becomes a REAL MSG91 DLT SMS — the zero-SMS QA convention above DIES with it (walks must switch to designated test numbers with real phones); (3) OTP storage in-memory→Redis (cold-start survival), TTL semantics change; (4) fail-closed rate limiting + client cooldown UX beyond today's 30s timer; (5) env fatal-boots (missing MSG91 creds kill the boot rather than silently no-op'ing); (6) verify attempt caps close FINDING #4. The generic-error copy (FINDINGS #1-3) is NOT in the hold branch's scope — it survives the merge unless separately fixed; queued as this page's fix-candidate list awaiting the walk-vs-fix call (error copy touches auth flow = REPORT first per the standing boundary).

---

### PAGE 5 · TUTORIAL DECK (TUTORIAL — 6 slides, TutorialV2) — **PASS with 1 candidate defect (§5) + 1 comment fix** · 2026-07-25 · headless eye

**PRE-PAGE ITEMS:** (1) क/ख/ग/घ machine-translation ruling — UNTOUCHED as ordered (product decision; the ख gate design is on file, not implemented). (2) **or-IN re-probe: STILL 502** (one live /api/tts call) — **Odia joins the ruling's scope note**: a "speakable" language that cannot speak today.

**HARNESS:** `apps/pandit/scripts/page5-tutorial-headless.mjs` — three modes on the page3a eye: `declined` (advance-past, headless default-deny), `granted` (chromium fake media device + granted permission — the REAL mid-tutorial accept, impossible in the pane), `declinedtap` (tap the disc, take the browser's denial). Entry = the skip-exit staging (micLS unset, micDenied=false). Shots + results-*.json under `docs/review/shots/page5/`.

**§1 ENTRY** Skip-exit staging renders slide 1 (कमाई) ✓; slide index persisted (`currentTutorialScreen`, clamped 1..6, resume-safe); छोड़िए skip-to-CTA present; hardware back on the deck maps to PARICHAY (page.tsx:290).
**§2 EVERY SLIDE, EVERY ELEMENT (source-mapped by the recon + pixel-verified):** S1 कमाई — MoneyCount CountUp→52400, booking-card drop → स्वीकार ripple → thumb → tick → 3 arcing coins → purse bounce → amount glow (7s loop; reduced-motion rests on RESULT; no Back on slide 1 by law). S2 नई बुकिंग — bell swing + sound ring + rising request card + नई badge + REAL one-shot bell SFX keyed by role identity. S3 सो जाओ/जागो — demo orb sleep→wake→bow + CoachSpotlight on the REAL footer orb + **MUTE GATE** (आगे disabled `⏳ आज़माइए` until one mute→unmute cycle or 10s timeout; voice हाँ refused with coach.tryIt — the declined run's "double-advance" was this gate working, not a bug). S4 आवाज़ — real ShishyaOrb(82, listening) + 78px sindoor mic disc (SVG-only button, label outside) + rising arcs + नमस्ते chip/tick demo + PopupPointer while asking. S5 ✓ प्रमाणित (सत्यापन choreography). S6 अब आपकी बारी 🎉 → **शुरू कीजिए → AUTH** (exit proven in all three runs).
**§3** Deck chrome measured on the shots: caption/cap sizes per canon ports (already floor-guarded by the tutorial-animation gates); nothing sub-floor observed.
**§4** N/A — no text inputs on the deck.
**§5 STATE MATRIX — the crown findings:**
- **DECLINED (advance-past):** deck completes voiceless → AUTH; micLS untouched, micDenied=false; zero errors. The re-offer never nags.
- **DECLINED (tap → browser denies):** `perm: settled(dismissed) (tutorial mic)` — headless deny classifies as dismissed (query≠denied), button stays for retry, deck completes → AUTH ✓ no dead end.
- **GRANTED (fake device + permission): the accepted leg IN PIXELS** — "सुन रहा हूँ… बोलिए — नमस्ते" listening chip + voice bars + CoachSpotlight "माइक की आज्ञा + अभ्यास" (granted-slide4-after-mic.png): practice listening runs mid-tutorial. **CANDIDATE DEFECT (P2, REPORT):** on this browser-pre-granted path `mic_permission_granted` is NEVER written (the write lives only in the tap→gUM-resolve branch, TutorialV2.tsx:586; the pre-granted seed short-circuits past it) — and `voiceController.micGranted()` gates the listen loop on exactly that localStorage key → a pre-granted pandit can exit onboarding with voice input dead. Needs one source pass on all micLS writers before fixing; queued with repro.
- **ASLEEP VARIANT:** slide-3 orb mute persisted into slide 4 IN PIXELS (grey orb + z + जगाइए pill in the dots row on the granted-slide4 shot) — persistent-sleep law holds inside the deck, and the deck stays fully operable muted.
**§6** Slide persistence + clamp per store; deck exit AUTH in 3/3 runs; ⏪ retract: the "7 dots" suspicion — 6 dots + the जगाइए pill misread; 6 dots = 6 slides ✓.
**§7 NARRATION (quoted from source; slide-1 sampled to full playback in-run):** S1 slide2 (रमेश-जी income story, अठारह→त्रेसठ हज़ार, "आपकी दक्षिणा आप खुद तय करेंगे, कोई मोलभाव नहीं।") + advanceAsk "आगे बढ़िए? 'हाँ' बोलिए।"; S2 slide6 (TRUTHFUL F19 phone-first: "…हम आपको फ़ोन करेंगे…घंटी बजेगी…"); S3 slide3 ("नीचे यह मैं हूँ — शिष्य…आज़माइए!" — deliberately NO advanceAsk until the gate opens); S4 slide5 + state lines (granted slide5Practice "वाह! आपने बोलकर जवाब दिया।" / denied slide5Denied / blocked slide5Blocked); S5 slide12*; S6 CTA. **INCOME-FIRST LAW: HOLDS** — कमाई is slide 1. Comment-vs-code divergence found: the store's pinned order comment had आवाज़ before सो-जाओ (the shipped deck is the reverse) — **stale comment FIXED** to match the shipped order (onboarding-store.ts:91).
**§8 CANON** Frames 5a-5f per slide (recon-cited); the deck IS the canon-ported tutorial-animation build (gates from that campaign stand).
**§9 REGISTER + EMOJI** Register scan: **zero violations** in live deck strings. Quarantine: **qualified clean** — the live deck reads ONLY the hand-reviewed Hindi row of tutorial-translations.ts (3 chrome strings; language prop never passed — guard stands). EMOJI row: 🔔 (bell, canon's own) · 🙏×2 (ribbon/demo-orb) · 💤 (sleep) · 🌼🌸 (welcome petals) · ⏳ (gate label) · 🎤 (capMic) · ✓ dingbats — all canon-deliberate, nothing new.
**§10** The mute gate is the one intentional friction — correctly voiced, timeout-escaped, and it TEACHES the one-gesture orb. No illogical controls.
**§11** Zero app console errors across all three full-deck runs (the recurring pair is the known boot health-ping noise).

---

### PAGE 3-A · भाषा LANGUAGE MATRIX — **CLOSED (2026-07-25)** · 11/11 rows · headless eye (VISION UPGRADE)

**HARNESS:** `apps/pandit/scripts/page3a-headless.mjs` — Playwright chromium, headless, 390×844 @ dpr 1, autoplay allowed; per-row: seed → confirm shot → floors/byte-truth evaluate → trusted unlock click → live TTS → fetch-delay → yes → LOADER SHOT (the step that killed the pane 4×: trivial headless) → notice → buffer/state/console. CALIBRATED: the headless ta-confirm matches the pane's banked shot exactly. Shots committed under `docs/review/shots/page3a/`. SCOPE: headless certifies layout/floors/truth; its fallback fonts ≠ an A12's — the device-pass render list (all nine non-Devanagari scripts, since ONLY Devanagari webfonts ship) stands regardless.

**THE MATRIX (evidence: shots + results-*.json + voicedebug):**

| # | lang | detect | render + font | floors (H1/yes/other) | truth | TTS (live bulbul) | notice→Hindi-continues | console |
|---|---|---|---|---|---|---|---|---|
| 1 | hi (control) | varanasi ✓shot | ✓ Tiro Devanagari webfont | 24px/66 · 20/64 · 18/56, no clip | 3/3 | hi-IN len88 spoken | N/A — direct advance, pref reset to null ✓ | 0 |
| 2 | mr | mumbai ✓shot | ✓ Devanagari webfont | same, no clip | 3/3 FIXED strings render | mr-IN len33 200/MISS played | ✓ len48 आपण register + LOADER SHOT (थांबावे…) | 0 |
| 3 | bn | kolkata ✓shot | ✓ clean; system fallback → device-pass | same | 3/3 | bn-IN len29 played | ✓ len50 PLAYED TO END (queue-law proof) + LOADER SHOT | 0 |
| 4 | ta | chennai ✓shot | ✓ clean; system fallback → device-pass | same | 3/3 | ta-IN len38 played to end | ✓ len58 played to end (law ×2) + LOADER SHOT (ஒரு கணம்…) | 0 |
| 5 | te | hyderabad ✓shot | ✓ clean; system fallback → device-pass | same | 3/3 | te-IN len55 played | ✓ loaderText + PARICHAY/Hindi/pref=te | 0 |
| 6 | kn | bengaluru ✓shot | ✓ clean; system fallback → device-pass | same | 3/3 | kn-IN len47 played | ✓ loaderText + PARICHAY/Hindi/pref=kn | 0 |
| 7 | gu | ahmedabad ✓shot — FIXED આપ renders | ✓ clean; system fallback → device-pass | same | 3/3 | gu-IN played | ✓ loaderText + pref=gu | 0 |
| 8 | pa | amritsar ✓shot — BOTH fixed ਜੀ strings render | ✓ clean Gurmukhi; system fallback → device-pass | same | 3/3 | pa-IN played | ✓ loaderText (ਇੱਕ ਪਲ ਜੀ…) + pref=pa | 0 |
| 9 | ml | kochi ✓shot — FIXED താങ്കൾ renders | ✓ clean stacks; system fallback → device-pass | 24px/99 (3-line q) · 20/64 · 18/62 (2-line), NO clip | 3/3 | ml-IN played | ✓ loaderText + pref=ml | 0 |
| 10 | or | bhubaneswar ✓shot (ଡ଼ correct) | ✓ clean; system fallback → device-pass | same as core | 3/3 | **🔴 502 ×2 RUNS — or-IN synthesis FAILING at Sarvam while all others pass** → REPORT | ✓ notice ATTEMPTED or-IN len57 (params sent; unspoken due to 502) + loaderText | 502 pair only |
| 11 | en | **LIST-ONLY** (no city/state detects en — canonical finding) ✓ list shot | ✓ | list tiles ✓ | tile ✓; NOTE: en confirm-strings are unreachable UI (list commits directly) | en-IN notice path | ✓ LOADER SHOT "One moment, please…" (FIXED) + pref=en | 0 |

**PROD SUCCESS-LEG (bn, production URL, headless): THE SUCCESS PATH IS REAL.** With the 75s cold-start law honored: /voice/translate SUCCEEDED → confirmedLine "চমৎকার! এখন আমরা বাংলায় কথা বলব।" spoken bn-IN → **store switched: selectedLanguage=Bengali, preferred=bn → परिचय ran ENTIRELY IN BENGALI** (shot banked: bn-post.png — ribbon/heading/mic-card/CTAs all Bengali). So v1 truly is: success = full app switch to the Mayura-translated bundle; the honesty notice is the FAIL path only (every localhost walk hit it via CORS). **NEW FLAG from the prod shot: the runtime-translated bundle is UNAUDITED MACHINE OUTPUT live on prod** — visible quality issues in one glance ("অশব্দ চলন" for the skip is not natural Bengali; "পারমিশন" transliteration) — same class as the quarantined corpus but user-reachable; the register deny-list guard covers only the static LANG_CONFIRM strings.

**FOR ISJ — the honesty-model ruling now has its complete evidence:** (a) success = real full-app switch into machine-Bengali of visible quality (prod-proven); (b) failure = honesty notice, now guaranteed audible to its end (queue law, proven ×2); (c) or-IN TTS currently 502s (a "speakable" language that cannot speak today); (d) en is list-only with unreachable confirm strings; (e) Assamese detection is dead by construction. Options on the table remain keep / mark-unavailable / detect-confirm-only — now with the true v1 behavior documented on both paths.

**DEVICE-PASS ADDS:** one spoken line per language (11 ears, next to the audio checklist); the nine non-Devanagari confirm screens (render on real A12 fonts); or-IN re-probe once Sarvam recovers.

---

### PAGE 3-A · भाषा LANGUAGE MATRIX — **IN PROGRESS, HALTED ON VISION (2026-07-25)** · 1/11 rows complete

**SETUP FINDINGS (source-verified before the walk):** (1) **English is LIST-ONLY** — no city and no state maps to `en` in CITY_TO_LANG/STATE_TO_LANG: it can never be detected, only chosen. (2) guwahati maps to 'Assamese' in the STORE's CITY_LANGUAGE_MAP but is absent from the CONFIRM screen's own CITY_TO_LANG → falls to the Hindi default — no crash, but TWO detect maps exist (onboarding-store.ts:144 vs languageDetect.ts:32) = single-source smell, queued. (3) The switch's bundle fetch is POST /voice/translate on the live API — cross-origin from localhost it fails (CORS), so the local walk exercises the FAIL/honesty path for every language; the SUCCESS path (real translation) is prod-only behavior. (4) **Font stack ships ONLY Devanagari webfonts** (Tiro Devanagari Hindi + Noto Sans Devanagari) + Material Symbols — every non-Devanagari script renders on SYSTEM fallback (pane = Windows Nirmala UI; an A12 differs) → ALL nine non-Devanagari languages go on the device-pass render list regardless of pane results.

**ROW 1/11 — MARATHI (mumbai):** detect ✓ SHOT (confirm screen fully Marathi; the FIXED strings आपल्याला + निवडावी are what renders — post-fix build proven in pixels); floors ✓ H1 24px 336×66 no-clip, yes 20px/64, other 18px/56; byte-truth 3/3 ✓; TTS ✓ `speak "आपल्याला मराठीत बोलायला आवडेल का?" lang=mr-IN` → params len=33 → live Sarvam 200 cache=MISS → played (bulbul serves Marathi, proven); notice ✓ spoken mr-IN len=48 with the fixed आपण register, state continues-in-Hindi (selected=Hindi, preferred=mr, phase advanced); console 0 errors. OWED: the DiyaLoader wait-line frame — compositing died the moment the loader appeared; queued for the resume. **BONUS: the notice-interruption defect reproduced a SECOND time, tighter: notice spoke at :16.969, परिचय intro killed it at :16.978 — 9ms.** The honesty notice is dead audio on every switch; evidence now ×2 for the honesty-model ruling.

**RESUME-PACKAGE FIXES — ALL THREE LANDED (2026-07-25, commits aa15219/b3723e3/897118f, merged, deploy-verified 897118f):**
1. **Narration-queue law** — runLanguageSwitch now AWAITS speakAndWait for the honesty notice (fail path) AND the confirmedLine (success path); guard `languageSwitchNotice.test.ts` (awaited-not-bare + both callers chain .then). **LIVE-PROVEN on the Bengali row:** notice bn-IN len50 played :31.980 → `audio ended` :36.456 — heard to its END; the next screen's first audible line at :36.458. Nuance, named: the परिचय SCREEN still mounts ~40ms into the notice (visual under-the-notice sequencing) — the audio law as ruled holds; the visual half rides the honesty-model ruling (a rendered notice would moot it).
2. **ONE detect map** — CITY_TO_LANG (LangCode-typed, speakable by construction) absorbed the store map's 20+ extra cities and became THE source; CITY_LANGUAGE_MAP is derived; guwahati→Assamese DEAD (detects nothing until Assamese is speakable). Guard `detectMapSingleSource.test.ts` (values speakable, exports agree, voiceless banned, re-literalization banned).
3. **Corpus quarantine** — onboarding-translations.ts DELETED (orphan, machine output, git-recoverable); tutorial-translations.ts FENCED (QUARANTINE header + `tutorialCorpusQuarantine.test.ts`: no TutorialShell caller may pass the language prop). Wall 65 files / 764 tests green, tsc clean.

**ROW 2/11 — BENGALI (kolkata):** detect ✓ SHOT ×2 (the pane returned mid-turn; 390px shot banked); render ✓ pixels clean BUT **no Bengali webfont ships — system fallback serves the script** (Windows Nirmala UI here; A12 differs) → device-pass render list, as predicted for all nine non-Devanagari scripts; floors ✓ (H1 24px/66 no-clip, 20/64, 18/56); byte-truth 3/3 ✓; TTS ✓ bn-IN len29 live bulbul played; notice ✓ (the fix-proof row above); continues-in-Hindi ✓; console 0. OWED: loader frame (the pane dropped compositing at the loader moment — the SECOND time at exactly that step; pattern noted).

**ROW 3/11 — TAMIL (chennai, walked in the third pane window):** detect ✓ SHOT (crop-mode hit first — one resize cure, then clean); render ✓ Tamil end-to-end, no tofu, SYSTEM fallback (no Tamil webfont) → device-pass; floors ✓ (24/66 no-clip, 20/64, 18/56); byte-truth 3/3 ✓; TTS ✓ ta-IN len38 live bulbul played to end; notice ✓ ta-IN len58 **played to its END** (:59.604→:04.648 ended, next line :04.650) — the narration-queue law holding on a second language; continues-in-Hindi ✓ (pref=ta); console 0. Loader frame owed-on-pattern (one attempt + one cure, both dark — per the founder's workaround the row completes on log/state supplements, the loader visual being covered by the recipe).

**MATRIX HALT #3 — the TE confirm-screen shot itself failed after cure** (the founder's named halt condition). Pane viability this window: ~10 minutes, three rows banked. STANDING: rows te kn gu pa ml or en hi + three loader frames (mr bn ta) + prod bn success-leg. TE is already staged (hyderabad, LANGUAGE_CONFIRM) — the resume starts at its screenshot.

**VISION HALT (superseded log of halt #2):** mid-row-2 (Bengali staged) the pane stopped compositing and ALL cures failed — resize round-trip ×2, tab front, fresh pane tab: every capture says "the Browser pane is not displayed." That is the pane WINDOW not being visible on the machine — nothing tool-side can force it onto the screen. Per the standing rule: the walk STOPS here rather than continuing on DOM evidence. RESUME (when the pane is displayed again): rows ta te kn gu pa ml or en(list-only leg) hi(control) + the mr AND bn loader frames + the prod bn success-leg (resume item 5); the per-language recipe is proven on row 1 (seed city → shot → measure+byte-truth → unlock tap → TTS buffer → yes-tap → loader shot → notice buffer → row).

---

### PAGE 4 CLOSURE — re-delivered under the screenshot rule (2026-07-25)

**Every walkable state re-shot fresh this turn with REAL taps (pane vision + input verified working):** needstart ✓ · asleep-on-परिचय ✓ · dismissed ("🎤 फिर से पूछिए") ✓ · denied recovery ✓ (banked prior turn, same rule) · granted exit→TUTORIAL ✓ · no-hardware exit→TUTORIAL ✓ (no distinct sub-UI by design — stated, with `settled(denied - no mic hardware)` chain + micDenied=true/micLS='false') · skip exit→TUTORIAL ✓ with SKIP ≠ DENY state proof (micDenied=false, micLS untouched). HONEST LIMITS, named: (1) the ASKING sub-state (PopupPointer) is a <50ms transient here — the pane settles gUM instantly; on-device it persists while the popup is open → device-pass glance. (2) The PRACTICE-HINT frame is a ≤3s transient here (pane STT settles immediately); evidence stands on parichayGrantedPath.test.tsx (behavioral), the 15s-watchdog voicedebug chain, and two live exit runs — granted = test-level per the ruling → device-pass glance.

**NIT FIXED — जगाइए pill centered on the orb axis.** Root cause: `mx-auto` on the w-max pill inside the column's flex context — cross-axis auto margins beat items-center and zero out on overflow → flush-left (~10px right of axis). Fix: `self-center` (align-self centers an overflowing flex item symmetrically). Pixel proof: before = the भाषा asleep shot (offset), after = the परिचय asleep shot on the rebuilt bundle (pill dead-center). Guards 12/12, tsc clean.

**§5 addendum (forced-env finding, REPORT):** with a granted stream in hand but the browser permission state reading 'denied'/'prompt', the practice listen's defensive re-check writes mic_permission_granted='false' post-grant (useVoiceInput prompt/denied guard). In the pane that is the environment; on standard Chrome/Android post-grant the query reads 'granted' — no downgrade. The exposed edge (WebViews with grant-once semantics reporting 'prompt' after a grant) goes to the DEVICE MATRIX list.

**RIDERS — all three delivered:**
- **(a) §10 tap-repeat hole** — CONFIRMED DEFECT for the no-voice persona, report-only, ruling awaited: "फिर से" needs STT→mic twice over; repeatCurrent() has zero call sites; sleep-wake replay is an accidental 2-tap ceremony. Minimal fix proposed (voice-input-off-only "फिर से सुनिए" pill in the existing slot, `!muted && !micInputAvailable`, onClick=repeatCurrent, guard pins it never renders while voice works) + 2 alternatives. NOT shipped.
- **(b) Multi-language register audit — FULL LIVE TABLE (68 rows, 14 were defects → fixed in place):**

| Lang | String | Loc | Gloss | Register found | Verdict |
|---|---|---|---|---|---|
| Bengali | আপনি কি বাংলায় কথা বলতে চান? | strings-langconfirm.ts:42 | Do you wish to speak in Bengali? | আপনি (honorific pronoun) + চান (honorific -en present of চাওয়া; tumi would be চাও) | ✅ PASS |
| Bengali | হ্যাঁ, বাংলা ঠিক আছে | strings-langconfirm.ts:43 | Yes, Bengali is fine | User-voice button; no 2nd-person address forms — register-neutral | ✅ PASS |
| Bengali | অন্য ভাষা বেছে নিন | strings-langconfirm.ts:44 | Pick another language | বেছে নিন — নিন is the honorific -un imperative of নেওয়া (tumi: নাও, tui: নে) | ✅ PASS |
| Bengali | এক মুহূর্ত… | strings-langconfirm.ts:45 | One moment… | No pronoun or verb toward the user — register-neutral | ✅ PASS |
| Bengali | চমৎকার! এখন আমরা বাংলায় কথা বলব। | strings-langconfirm.ts:46 | Wonderful! Now we will speak in Bengali. | 1st-plural inclusive আমরা + বলব; no 2nd-person forms | ✅ PASS |
| Bengali | অনুবাদ এখন উপলব্ধ নেই — আমরা হিন্দিতে চালিয়ে যাব। | strings-langconfirm.ts:47 | Translation is not available now — we will continue in Hindi. | 1st-plural আমরা + চালিয়ে যাব; no 2nd-person forms | ✅ PASS |
| Bengali | বাংলা | languageDetect.ts:63 | Bengali | Bare language name — no address forms | ✅ PASS |
| English | Would you like to continue in English? | strings-langconfirm.ts:106 | identical — source is English: an offer-question whether to proceed in English | Modal-interrogative offer "Would you like…" — English's highest natural deference frame fo | ✅ PASS |
| English | Yes, English is fine | strings-langconfirm.ts:107 | identical — affirmative reply: yes, English suffices | User-voice button (the guru speaking, not the app addressing the guru): plain declarative  | ✅ PASS |
| English | Choose another language | strings-langconfirm.ts:108 | identical — directive to select a different language | Bare unmarked imperative "Choose" in app voice directed at the user — English's करो-equiva | 🔴 FIXED → Please choose another language |
| English | One moment… | strings-langconfirm.ts:109 | identical — a request for brief patience while loading | Verbless nominal fragment, no pronoun, no deference marker — mere neutral politeness. Engl | 🔴 FIXED → One moment, please… |
| English | Great! We will continue in English. | strings-langconfirm.ts:110 | identical — enthusiastic acknowledgment; announcement that the app proceeds in E | Casual peer interjection "Great!" (equivalent of बढ़िया! between equals) + plain declarati | 🔴 FIXED → Certainly! We will continue in English. |
| English | Translation is not available right now — we will continue in | strings-langconfirm.ts:111 | identical — statement that translation is currently unavailable and the app proc | Plain declarative, first-person plural "we", no 2nd-person address, no imperative — regist | ✅ PASS |
| Gujarati | શું તમે ગુજરાતીમાં વાત કરવા માંગો છો? | strings-langconfirm.ts:74 | Do you want to talk in Gujarati? | તમે (neutral-polite V pronoun, the तुम-tier when addressing a guru) + માંગો છો (2pl presen | 🔴 FIXED → શું આપ ગુજરાતીમાં વાત કરવા માંગો છો? |
| Gujarati | હા, ગુજરાતી બરાબર છે | strings-langconfirm.ts:75 | Yes, Gujarati is fine | Pronoun-free declarative spoken in the pandit's own voice; no address forms present. | ✅ PASS |
| Gujarati | બીજી ભાષા પસંદ કરો | strings-langconfirm.ts:76 | Choose another language | પસંદ કરો — the -ઓ plural imperative, which is the imperative Gujarati uses WITH આપ (the ca | ✅ PASS |
| Gujarati | એક ક્ષણ… | strings-langconfirm.ts:77 | One moment… | No pronoun, no verb directed at the user. | ✅ PASS |
| Gujarati | સરસ! હવે આપણે ગુજરાતીમાં વાત કરીશું. | strings-langconfirm.ts:78 | Great! Now we will talk in Gujarati. | આપણે (inclusive 'we', not the honorific આપ despite the shared substring) + કરીશું (1pl fut | ✅ PASS |
| Gujarati | અનુવાદ હમણાં ઉપલબ્ધ નથી — આપણે હિન્દીમાં આગળ વધીશું. | strings-langconfirm.ts:79 | Translation is not available right now — we will proceed in Hindi. | આપણે (inclusive we) + વધીશું (1pl future). No second-person forms; nothing casual. | ✅ PASS |
| Gujarati | ગુજરાતી | languageDetect.ts:64 | Gujarati (language name) | Proper noun; register-neutral by nature. | ✅ PASS |
| Kannada | ಹೌದು, ಕನ್ನಡ ಸರಿ | strings-langconfirm.ts:67 | Yes, Kannada is fine | User's own voice (button = disciple's answer); no 2nd-person address forms at all | ✅ PASS |
| Kannada | ಬೇರೆ ಭಾಷೆ ಆರಿಸಿ | strings-langconfirm.ts:68 | Choose another language | ಆರಿಸಿ — honorific/plural imperative in -ಇ (casual singular would be ಆರಿಸು) | ✅ PASS |
| Kannada | ಒಂದು ಕ್ಷಣ… | strings-langconfirm.ts:69 | One moment… | No pronoun or verb; register-neutral noun phrase | ✅ PASS |
| Kannada | ಚೆನ್ನಾಗಿದೆ! ಇನ್ನು ನಾವು ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡೋಣ. | strings-langconfirm.ts:70 | Wonderful! From now on let us speak in Kannada. | ನಾವು (inclusive we) + ಮಾತನಾಡೋಣ (hortative -ೋಣ, 'let us') — the warm inclusive form, no 2nd | ✅ PASS |
| Kannada | ಅನುವಾದ ಸದ್ಯ ಲಭ್ಯವಿಲ್ಲ — ಹಿಂದಿಯಲ್ಲಿ ಮುಂದುವರಿಯೋಣ. | strings-langconfirm.ts:71 | Translation is not available at present — let us continue in Hindi. | Impersonal declarative + ಮುಂದುವರಿಯೋಣ (inclusive hortative -ೋಣ); no casual 2nd-person forms | ✅ PASS |
| Kannada | ಕನ್ನಡ | languageDetect.ts:64 | Kannada (native language name) | Proper noun; no address forms | ✅ PASS |
| Malayalam | നിങ്ങൾ മലയാളത്തിൽ സംസാരിക്കാൻ ആഗ്രഹിക്കുന്നുവോ? | strings-langconfirm.ts:90 | Do you wish to speak in Malayalam? | നിങ്ങൾ — neutral-polite 2nd-person plural pronoun; verb ആഗ്രഹിക്കുന്നുവോ carries no person | 🔴 FIXED → താങ്കൾ മലയാളത്തിൽ സംസാരിക്കാൻ ആഗ്രഹിക്കുന്നുവോ? |
| Malayalam | അതെ, മലയാളം മതി | strings-langconfirm.ts:91 | Yes, Malayalam will do | User-voiced button (the guru's own words) — no 2nd-person form; declarative മതി (suffices) | ✅ PASS |
| Malayalam | മറ്റൊരു ഭാഷ തിരഞ്ഞെടുക്കുക | strings-langconfirm.ts:92 | Select another language | -ുക impersonal-formal imperative (തിരഞ്ഞെടുക്കുക) — the standard respectful written-UI imp | ✅ PASS |
| Malayalam | ഒരു നിമിഷം… | strings-langconfirm.ts:93 | One moment… | Verbless noun phrase — no register exposure | ✅ PASS |
| Malayalam | കൊള്ളാം! ഇനി നമുക്ക് മലയാളത്തിൽ സംസാരിക്കാം. | strings-langconfirm.ts:94 | Nice! / Not bad! From now on let us speak in Malayalam. | കൊള്ളാം — colloquial approving interjection (lit. 'it will do'), the app appraising the gu | 🔴 FIXED → വളരെ സന്തോഷം! ഇനി നമുക്ക് മലയാളത്തിൽ സംസാരിക്കാം. |
| Malayalam | വിവർത്തനം ഇപ്പോൾ ലഭ്യമല്ല — നമുക്ക് ഹിന്ദിയിൽ തുടരാം. | strings-langconfirm.ts:95 | Translation is not available right now — let us continue in Hindi. | Impersonal declarative ലഭ്യമല്ല + inclusive hortative നമുക്ക് തുടരാം; no 2nd-person form e | ✅ PASS |
| Malayalam | മലയാളം | languageDetect.ts:64 | Malayalam (language name) | Bare noun — no register exposure | ✅ PASS |
| Marathi | तुम्हाला मराठीत बोलायला आवडेल का? | strings-langconfirm.ts:34 | Would you like to speak in Marathi? | तुम्हाला — dative of neutral-polite तुम्ही; not the reverential आपण/आपल्याला | 🔴 FIXED → आपल्याला मराठीत बोलायला आवडेल का? |
| Marathi | हो, मराठी चालेल | strings-langconfirm.ts:35 | Yes, Marathi will do | User-voice assent; चालेल is 3sg future about the language — no second-person form present | ✅ PASS |
| Marathi | दुसरी भाषा निवडा | strings-langconfirm.ts:36 | Choose another language | निवडा — bare तुम्ही-imperative (neutral politeness), not the reverential -आवी optative | 🔴 FIXED → दुसरी भाषा निवडावी |
| Marathi | एक क्षण थांबा… | strings-langconfirm.ts:37 | Wait a moment… | थांबा — तुम्ही-imperative (neutral politeness) | 🔴 FIXED → एक क्षण थांबावे… |
| Marathi | छान! आता आपण मराठीत बोलू. | strings-langconfirm.ts:38 | Great! Now we will speak in Marathi. | आपण here is INCLUSIVE-WE (आपण…बोलू, 1pl future) — no second-person address; register clean | ✅ PASS |
| Marathi | भाषांतर सध्या उपलब्ध नाही — आपण हिंदीत पुढे जाऊ. | strings-langconfirm.ts:39 | Translation is not available right now — we will proceed in Hindi. | आपण inclusive-we + जाऊ 1pl future; no second-person form; deferential-neutral, acceptable | ✅ PASS |
| Marathi | मराठी | languageDetect.ts:63 | Marathi (language name) | Bare noun; no register | ✅ PASS |
| Odia | ଆପଣ ଓଡ଼ିଆରେ କଥା ହେବାକୁ ଚାହାଁନ୍ତି କି? | strings-langconfirm.ts:98 | Do you (revered) wish to speak in Odia? | ଆପଣ (āpaṇa, honorific 'you') + ଚାହାଁନ୍ତି (cāhā̃nti, honorific -ନ୍ତି verb agreement that ଆପ | ✅ PASS |
| Odia | ହଁ, ଓଡ଼ିଆ ଠିକ୍ ଅଛି | strings-langconfirm.ts:99 | Yes, Odia is fine. | No second-person forms — this is the user's own utterance (yes-button voiced as the pandit | ✅ PASS |
| Odia | ଅନ୍ୟ ଭାଷା ବାଛନ୍ତୁ | strings-langconfirm.ts:100 | Please choose another language. | ବାଛନ୍ତୁ (bāchantu) — the -ନ୍ତୁ honorific imperative, the imperative form that agrees with  | ✅ PASS |
| Odia | ଗୋଟିଏ ମୁହୂର୍ତ୍ତ… | strings-langconfirm.ts:101 | One moment… | Bare noun phrase; no pronoun or verb, so no address register. ମୁହୂର୍ତ୍ତ (muhūrtta) is the  | ✅ PASS |
| Odia | ବହୁତ ଭଲ! ଏବେ ଆମେ ଓଡ଼ିଆରେ କଥା ହେବା। | strings-langconfirm.ts:102 | Very good! Now we will speak in Odia. | No second-person forms. ଆମେ ... କଥା ହେବା is inclusive first-person-plural future ('we will | ✅ PASS |
| Odia | ଅନୁବାଦ ବର୍ତ୍ତମାନ ଉପଲବ୍ଧ ନାହିଁ — ଆମେ ହିନ୍ଦୀରେ ଆଗକୁ ବଢ଼ିବା। | strings-langconfirm.ts:103 | Translation is not available at present — we will proceed in Hindi. | No second-person forms; ଆମେ ... ବଢ଼ିବା is inclusive first-plural future. Vocabulary (ଅନୁବା | ✅ PASS |
| Odia | ଓଡ଼ିଆ | languageDetect.ts:64 | Odia (native language name). | Proper noun only; no address register applies. Spelling with ଡ଼ (ṛa) is the correct native | ✅ PASS |
| Punjabi | ਕੀ ਤੁਸੀਂ ਪੰਜਾਬੀ ਵਿੱਚ ਗੱਲ ਕਰਨਾ ਚਾਹੋਗੇ? | strings-langconfirm.ts:82 | Would you like to talk in Punjabi? | ਤੁਸੀਂ (respectful 2pl pronoun) + ਚਾਹੋਗੇ (2pl future in -ੋਗੇ). Correct pronoun tier, but NO | 🔴 FIXED → ਕੀ ਤੁਸੀਂ ਪੰਜਾਬੀ ਵਿੱਚ ਗੱਲ ਕਰਨਾ ਚਾਹੋਗੇ ਜੀ? |
| Punjabi | ਹਾਂ, ਪੰਜਾਬੀ ਠੀਕ ਹੈ | strings-langconfirm.ts:83 | Yes, Punjabi is fine. | The pandit's OWN utterance (yes-button = user voice, not app voice). No second-person addr | ✅ PASS |
| Punjabi | ਹੋਰ ਭਾਸ਼ਾ ਚੁਣੋ | strings-langconfirm.ts:84 | Choose another language. | Bare 2pl imperative ਚੁਣੋ (the -ੋ ਤੁਸੀਂ-imperative) — the direct Punjabi parallel of Hindi  | 🔴 FIXED → ਹੋਰ ਭਾਸ਼ਾ ਚੁਣੋ ਜੀ |
| Punjabi | ਇੱਕ ਪਲ… | strings-langconfirm.ts:85 | One moment… | No pronoun or verb — unmarked neutral filler, honorific ਜੀ absent. App-voice line spoken/s | 🔴 FIXED → ਇੱਕ ਪਲ ਜੀ… |
| Punjabi | ਵਧੀਆ! ਹੁਣ ਅਸੀਂ ਪੰਜਾਬੀ ਵਿੱਚ ਗੱਲ ਕਰਾਂਗੇ। | strings-langconfirm.ts:86 | Great! Now we will talk in Punjabi. | Bare exclamation ਵਧੀਆ! (peer-toned approval) + 1pl ਅਸੀਂ ਕਰਾਂਗੇ (plain 'we will'). No secon | 🔴 FIXED → ਵਧੀਆ ਜੀ! ਹੁਣ ਅਸੀਂ ਪੰਜਾਬੀ ਵਿੱਚ ਗੱਲ ਕਰਾਂਗੇ। |
| Punjabi | ਅਨੁਵਾਦ ਹੁਣੇ ਉਪਲਬਧ ਨਹੀਂ — ਅਸੀਂ ਹਿੰਦੀ ਵਿੱਚ ਜਾਰੀ ਰੱਖਾਂਗੇ। | strings-langconfirm.ts:87 | Translation is not available right now — we will continue in Hindi. | 1pl ਅਸੀਂ + ਰੱਖਾਂਗੇ; no second-person forms, no ਜੀ. An apology-adjacent notice spoken to th | 🔴 FIXED → ਅਨੁਵਾਦ ਹੁਣੇ ਉਪਲਬਧ ਨਹੀਂ ਜੀ — ਅਸੀਂ ਹਿੰਦੀ ਵਿੱਚ ਜਾਰੀ ਰੱਖਾਂਗੇ। |
| Punjabi | ਪੰਜਾਬੀ | languageDetect.ts:64 | Punjabi (native language name). | Proper noun only — no pronoun, no verb, no register to carry. Tile label / spoken name. | ✅ PASS |
| Tamil | நீங்கள் தமிழில் பேச விரும்புகிறீர்களா? | strings-langconfirm.ts:50 | Do you wish to speak in Tamil? | Honorific: pronoun நீங்கள் + honorific 2pl verb விரும்புகிறீர்களா (-கிறீர்கள் + interrogat | ✅ PASS |
| Tamil | ஆம், தமிழ் சரி | strings-langconfirm.ts:51 | Yes, Tamil is fine | Addressee-neutral: no pronoun, no verb inflected for the listener. Nothing casual present. | ✅ PASS |
| Tamil | வேறு மொழி தேர்வு | strings-langconfirm.ts:52 | Different language selection | Impersonal noun phrase (தேர்வு = 'selection'); no addressee marking, so no register violat | ✅ PASS |
| Tamil | ஒரு கணம்… | strings-langconfirm.ts:53 | One moment… | Impersonal; no pronoun or verb. Register-neutral wait line. | ✅ PASS |
| Tamil | அருமை! இனி நாம் தமிழில் பேசுவோம். | strings-langconfirm.ts:54 | Wonderful! From now on we shall speak in Tamil. | Inclusive 1pl: நாம் + -வோம் (பேசுவோம்) — warm, respectful 'we'; no 2nd-person casual forms | ✅ PASS |
| Tamil | மொழிபெயர்ப்பு இப்போது கிடைக்கவில்லை — இந்தியில் தொடர்வோம். | strings-langconfirm.ts:55 | Translation is not available right now — we will continue in Hindi. | Inclusive 1pl future தொடர்வோம் ('we will continue'); impersonal negative கிடைக்கவில்லை. No | ✅ PASS |
| Tamil | தமிழ் | languageDetect.ts:63 | Tamil (language name) | Bare noun; no register. | ✅ PASS |
| Telugu | మీరు తెలుగులో మాట్లాడాలనుకుంటున్నారా? | strings-langconfirm.ts:58 | Would you like to speak in Telugu? | Honorific మీరు + 2nd-person honorific question ending -న్నారా (మాట్లాడాలనుకుంటున్నారా) — t | ✅ PASS |
| Telugu | అవును, తెలుగు సరే | strings-langconfirm.ts:59 | Yes, Telugu is fine | User-voiced button (the pandit speaking); no 2nd-person forms at all — register-neutral af | ✅ PASS |
| Telugu | వేరే భాష ఎంచుకోండి | strings-langconfirm.ts:60 | Choose another language | Honorific imperative -ండి (ఎంచుకోండి); casual would be bare ఎంచుకో | ✅ PASS |
| Telugu | ఒక్క క్షణం… | strings-langconfirm.ts:61 | Just one moment… | No pronoun or verb — register-neutral courteous fragment | ✅ PASS |
| Telugu | చాలా బాగుంది! ఇప్పుడు మనం తెలుగులో మాట్లాడుకుందాం. | strings-langconfirm.ts:62 | Very good! Now let us speak in Telugu together. | Inclusive మనం + hortative -ుదాం (మాట్లాడుకుందాం); no 2nd-person casual forms — warm and re | ✅ PASS |
| Telugu | అనువాదం ప్రస్తుతం అందుబాటులో లేదు — హిందీలో కొనసాగుదాం. | strings-langconfirm.ts:63 | Translation is not available at present — let us continue in Hindi. | Impersonal statement + inclusive hortative కొనసాగుదాం (matches Hindi source 'चलते हैं'); n | ✅ PASS |
| Telugu | తెలుగు | languageDetect.ts:63 | Telugu (native language name) | Proper noun; no register | ✅ PASS |

Guard: registerLawMultilang.test.ts (runtime deny-lists, JS-safe Indic boundaries, proven-to-fail, new-language tripwire). TTS: one voice `aditya` bulbul:v3 × 11 languages, all in the documented set — 11/11 SUPPORTED, per-language line in the ride-along entry above. Honesty notices 11/11 exact-v1, no overpromise (see per-language honesty verdicts in the audit; the Marathi notice INTERRUPTION defect + interjection-class inconsistency + latent-corpus quality remain the three Isj flags).
- **(c) Voicedebug** — voiceDebugGate.test.tsx (renders-null-without-latch, behavioral + not-NODE_ENV pin) + the pilot-ops-runbook operator rule ("no support script or shared URL ever carries ?voicedebug=1"). Both shipped 28a936f/5bafdbf.

**PAGE 4 · परिचय: CLOSED.** End state staged: TUTORIAL via skip-exit (canonical for PAGE 5). Queued: 🐞-badge overlap (flag-gated), device-matrix edge above, asking/practice device-pass glances.

---

### PAGE 4 · परिचय (PARICHAY — mic ceremony, 7 sub-states) — **PASS with 1 ruling-needed defect (§10)** · 2026-07-24

**CARRY-ITEMS:** (1) voicedebug RULING EXECUTED — flag stays; NEW guard `voiceDebugGate.test.tsx` (behavioral: latch absent → hook false, panel unmountable; latch present → on; + pins the gate is the latch NOT NODE_ENV); operator rule written into pilot-ops-runbook ("no support script or shared URL ever carries ?voicedebug=1"). (2) OWED SHOT: still owed — the pane composited briefly (banked the परिचय needstart frame), then stopped again; stays on the books. NEW ENV FACT while chasing it: **the pane's physical click injection lands at HALF the requested coordinates** (asked (195,713), page received (98,357) — dpr=2 division bug). Every "dead tap" of the walk was this; the app was exonerated by instrumentation (document-level listener). Physical-tap legs use doubled coords when in-bounds; JS dispatch otherwise, with unlock taken from a real (mis-aimed but genuine) pointerdown.

**§1 ENTRY** Only via भाषा exit ✓. Refresh at PARICHAY → phase persists; fresh document = audio locked → intro parks under the autoplay law → `⚠ UNLOCK MISSING AT PARICHAY` + **stage needstart with "🙏 बात शुरू कीजिए"** (the parked-entry design, seen live). Never-re-asks gate LIVE-PROVEN: forced phase back to PARICHAY with parichayDone=true → orchestrator redirected to TUTORIAL ✓. Hardware back: stays put (never back out of a mid-air permission ceremony, page.tsx:298).

**§2 ELEMENTS (all)** orb 118² (awake tap → farewell → persistent sleep ✓ live; asleep = dimmed 🙏💤 + जगाइए pill min-h-52 ✓ live; wake re-narrates current line ✓ live — amendment holds on this page); start CTA 336×62; फिर कोशिश कीजिए 336×62; आगे बढ़िए (ghost) 336×62; 🎤 फिर से पूछिए (glow-highlighted via askAgainRef); persistent skip 192×52; 🐞 badge 63² (flag-gated). Note: asleep orb and जगाइए pill share the identical aria "शिष्य को जगाइए" — same action, harmless duplication, noted not defected.

**§3 MEASUREMENTS** Title 24px/900; body + mic-card line + safety line 18px; skip 16px on a ≥52px tap; all CTAs 62px ≥52 ✓ (canon asks 64 — known 62-vs-64 flag stands). All floors pass.

**§4 INPUT ABUSE** N/A by construction — zero inputs on any sub-state (DOM count: 0).

**§5 STATE MATRIX — all four outcomes walked LIVE** (+2 more from source):
- **denied**: start CTA → intro spoke to completion (cache HIT) → `getUserMedia invoked` + "ऊपर 'अनुमति दें' दबा दीजिए।" SAME TICK (D2 ceremony law, timestamps .886/.886) → `settled(denied)` → recovery card ("ब्राउज़र की सेटिंग में माइक चालू कीजिए" + retry + ghost-next + skip) ✓
- **dismissed** (forced: gUM→NotAllowedError + query→'prompt'): `settled(dismissed)` → dismissed line spoken (len-62 live Sarvam MISS, played 4.9s) → "🎤 फिर से पूछिए" ✓
- **granted** (forced: synthetic AudioContext stream): `settled(granted)` → "धन्यवाद पंडित जी! अब मैं आपकी हर बात सुन सकता हूँ।" → tryIt → practice (`mic: stream adopted`) → silence → **watchdog at exactly +15s** → advance → TUTORIAL; exit micLS='true', micDenied=false ✓. **GAP CLOSED: the granted leg had NO behavioral test anywhere** (every prior guard is a source-grep) — NEW `parichayGrantedPath.test.tsx` pins gUM-resolves→granted-state→same-stream practice→watchdog advance + the pre-granted silent shortcut (2 tests).
- **no-hardware** (forced: NotFoundError): `settled(denied - no mic hardware)` → `no-mic → continue` → denied reassurance line → auto-advance; micDenied=true + micLS='false' ✓
- **skip**: instant advance; **micDenied untouched, micLS untouched — SKIP ≠ DENY law holds live** ✓.
- **§5 finding (REPORT, minor):** the confirmed-DENIED classification writes NO state (micDenied set only by finishDeny) — confirm-deny + skip exits with micDenied=false and micLS unset; the header comment at ParichayScreen.tsx:25 claims otherwise. No dead-end (paused() covers it); semantics gap only.

**§6 NAV/PERSISTENCE** Refresh mid-sub-state re-derives from permissions.query (transient Stage deliberately unpersisted) ✓; parichayDone gate ✓ (above); orb sleep persists across screens (proven PAGE 3, re-proven here on entry).

**§7 VOICE (quoted from source, heard live)** intro `parichay.introOnly` "नमस्ते पंडित जी! मैं आपका शिष्य हूँ, और मैं आपसे बात करना चाहता हूँ।"; ask `parichay.pressAllow` "ऊपर 'अनुमति दें' दबा दीजिए।" (+ PopupPointer chip "यहाँ ऊपर 'अनुमति दें' / 'Allow' दबाइए — 'अनुमति दें'/'Allow' are register-law-protected quoted popup vocabulary); granted "धन्यवाद पंडित जी!…"; tryIt "कुछ भी बोलकर देखिए — जैसे, नमस्ते।"; dismissed "कोई बात नहीं — एक बार फिर बटन दबाइए और ऊपर 'अनुमति दें' दबाइए।"; denied/no-mic "कोई बात नहीं — आप स्पर्श से और लिखकर भी सब कर सकते हैं। कभी भी सेटिंग से माइक चालू कर सकते हैं।"; heard/moveOn per source. Env note: on the JS-driven no-gesture legs the exit line parks and the phase transition supersedes it (newest-wins) — on-device the tap that triggered the leg has already unlocked audio, so the line plays; device pass confirms by ear.

**§8 CANON (frame 4)** Live matches: radial field, orb 118 + ribbon verbatim, mic-ask card (66² Material mic disc, two-line ask, lock trust line), no toran/header ✓. Standing flagged residuals (await ruling): greeting copy ("मैं शिष्य हूँ" vs canon "आपसे मिलकर खुशी हुई"); canon's drawn "अनुमति दें / Allow" CTA vs the app's auto-prompt; 62 vs 64px. NEW: canon Shishya.dc.html:42 still shows "छूकर जगाएँ" — predates BOTH the register law (छूकर) and Ruling #9 — canon itself needs the amendment.

**§9 LANGUAGE/TRUTH + EMOJI** Register clean everywhere (कीजिए/बढ़िए/दबाइए); the two Hindi string defects found were FIXED: `sleepToast` grammar "शिष्य…कर रहा हूँ"→"मैं विश्राम कर रहा हूँ…", and `aboutLine2` still TAUGHT the retired tap-repeat + deleted सुला-दें pill — rewritten to the second-amendment model. Truthful: "आपकी आवाज़ सुरक्षित है" backed by S5 mic-release; skip promise real. EMOJI: 🙏 (ribbon/title/CTA, canon's own) · 🎤 (dismissed-CTA prefix — app-only, canon uses the Material glyph; added to the emoji queue) · 💤 (asleep orb glyph) · 🐞 (dev badge).

**§10 ILLOGICAL — the tap-repeat hole: CONFIRMED DEFECT for the no-voice persona (REPORT-ONLY, Isj rules).** On mic-denied/skip, "फिर से" is unreachable twice over: REPEAT acts only in handleTranscript (voiceController.ts:923-927) fed solely by STT (getUserMedia→MediaRecorder→/stt), AND the listen loop never arms (`paused` includes !micGranted, :1482-1485). repeatCurrent() has ZERO call sites (kept alive only by the guard). The only workaround is accidental: sleep-then-wake replays via the wake path (:2180-2187) — two taps, a farewell, a greeting, two persisted-state flips; undiscoverable and semantically wrong. TTS still works no-voice, so the loss is real: a line once missed cannot be re-heard. **MINIMAL FIX (proposal only): a "फिर से सुनिए" pill in the EXISTING pill slot, rendered ONLY when `!muted && !micInputAvailable`** — the column shows at most one pill ever (asleep→जगाइए unchanged; awake+voice→nothing, today's shape); onClick = the already-existing repeatCurrent(); one public getter + two strings + registry entry; new guard pins it NEVER renders while voice input works (the ruling's "फिर से by voice" channel stays the only path where it exists — a carve-out for where that channel is physically impossible, not a reversal). Alternatives: (a) teach the sleep-wake round-trip (zero chrome, but 2 taps + ceremony as the replay); (b) ephemeral tappable ribbon-chip for ~10s post-line (appears exactly on miss, but overloads the canon display-only ribbon). Awaiting ruling.

**§11 CONSOLE/NETWORK** Zero errors across the full walk (all seven sub-states + 5 forced legs + ~6 reloads). Warnings: Sentry debug-config (queued) + webpack size lines retained in the tab buffer from the earlier DEV session (prod serves hashed chunks; bundle-size perf flag already queued). Network all 2xx; note: the app's boot diagnostic ping to the live API /health TypeErrors from localhost (CORS covers *.vercel.app previews, not localhost — diagnostic-only; TTS rides same-origin /api/tts).

| Page | Emoji | Canon shows | Note |
|---|---|---|---|
| परिचय | 🙏 · 🎤 · 💤 · 🐞 | 🙏 yes / 🎤 NO (Material glyph) / — / dev | 🎤 in dismissed-CTA → emoji queue |

#### RIDE-ALONG — MULTI-LANGUAGE REGISTER AUDIT (11 languages, founder directive 2026-07-24)

**INVENTORY.** The LIVE per-language surface is exactly `strings-langconfirm.ts` (6 strings × 11 languages: confirm question, yes/other buttons, wait line, switch confirmation, honesty notice) + the native names (languageDetect.ts:63). Everything else non-Hindi is **LATENT/DEAD**: `tutorial-translations.ts` (15-language deck — TutorialShell's language prop is never passed, always Hindi) and `onboarding-translations.ts` (imported by NOTHING). One voice speaks all of it: **`aditya` (bulbul:v3) for all 11 languages** — only `target_language_code` varies (route.ts:150-169; client speaker rejected). All 11 codes are inside Sarvam bulbul's documented set → **TTS leg: 11/11 SUPPORTED**, no wrong-language voice. Fallback for voiceless languages (Bhojpuri/Maithili/Sanskrit/Assamese) → hi-IN silently (sarvam-tts.ts:48-64).

**AUDIT (shishya bar): 14 LIVE strings FIXED in place** (per the specialist audits): mr → आपण-register (आपल्याला / निवडावी / थांबावे); pa → the ਜੀ particle on all five; ml → താങ്കൾ + കൊള്ളാം→വളരെ സന്തോഷം; gu → આપ; en → Please choose / One moment, please / Certainly. bn·kn·te·or·hi: clean as shipped (আপনি/ನೀವು/మీరు/ଆପଣ throughout). Honesty notices: **11/11 promise exactly the v1 behavior** — no overpromise in any translation (one noted omission: none states "your choice is saved", which the store does do — optional add).

**GUARD:** `registerLawMultilang.test.ts` — per-language deny-lists (the तुम/करो equivalents: तुम्ही/तू, তুমি/তুই, நீ/உன், నువ్వు, ನೀನು-family, તમે/તું, ਤੂੰ + bare-ਚੁਣੋ-without-ਜੀ, നിങ്ങൾ/എടാ, ତୁମ/ତୁ, hey/gonna/thou/Great!) run against the RUNTIME LANG_CONFIRM values. JS `\b` is ASCII-only — Indic boundaries are explicit, so the patterns actually bite. Proven-to-fail (निवडा restored → red). Coverage tripwire: a new language in LANG_CONFIRM without a deny-list fails the build.

**FOR ISJ (3 flags):**
1. **Interjection class needs ONE ruling:** every confirmedLine opens with an appraising interjection (छान!/চমৎকার!/அருமை!/చాలా బాగుంది!/ಚೆನ್ನಾಗಿದೆ!/સરસ!/ବହୁତ ଭଲ!) — the en/pa/ml audits called it casual-peer and fixed theirs (Certainly! / ਵਧੀਆ ਜੀ! / വളരെ സന്തോഷം!); the other seven passed it. One ruling ("is the appraising exclamation acceptable at the shishya bar?") settles all 11 consistently.
2. **The latent corpora are machine-translation grade** — Tamil tutorial strings contain the TURKISH word "için" twice and one non-word ("கட்டாயக்கம்"); Marathi carries 15 more तुम्ही-register rows. Unreachable today. Recommend: delete or quarantine until a real translation pass; do NOT wire the language prop without one.
3. **The honesty notice is never actually heard (live-proven):** on मराठी switch the notice spoke at t+0ms and परिचय's intro interrupted it at t+25ms — killed before one word landed, and it exists nowhere on screen. Evidence for the queued pilot-ruling on the language-list honesty model: whatever model is ruled, the notice must either speakAndWait-before-advance or persist visibly.

---

## B1 — PANDIT ONBOARDING (splash · प्रतीक्षा · भाषा · स्थान[both] · परिचय · पंजीकरण · OTP · tutorial)
> परिचय: test all FOUR mic outcomes explicitly (granted/denied/dismissed/unavailable).
> Note: परिचय dead-end for dismissed already FIXED on main (a88b34d, persistent
> "बिना आवाज़ के आगे बढ़िए") — re-verify it holds here.

| Screen | State | Result | What | SHA |
|---|---|---|---|---|
| स्थान (location perm) | fresh-install | **FIXED(1) — walk in progress** | सुला दें pill wrapped mid-phrase ("सुला/दें" stacked under the icon, squeezed to 84px by the orb column) → whitespace-nowrap + w-max on ShishyaMuteControl; verified on-screen 96×52 one-line. Ruling-#9 orb VERIFIED LIVE in dev (awake orb + सुला दें present). CTAs measured: अनुमति दीजिए 21px/62h ✓, शहर-खुद 17px/52h ✓. Voice/canon/function checks continue next session. | (qa branch) |
| /login (phone entry) | logged-out, resumed-state | **PASS (floors/function/register)** + 1 FLAG | Floors measured & PASS: labels 15px (orb-label, field-label), body/cta 20-21px, taps 56-66px (input 56, CTAs 62, orb 66). Register clean ("ट्यूटोरियल फिर देखिए" — the suspected typo was a screenshot font artifact; DOM verified). Truthful copy ("खाता होगा तो लॉगिन, नहीं तो नया बनेगा"). Console: dev-only webpack asset-size warnings (not app defects; bundle sizes ARE a perf flag — main-app 10.7MiB dev). Orb wake-tap works (💤 → awake). | — |

### Console errors (B1)
- None (app-level). Dev-only: webpack asset-size warnings (main-app 10.7 MiB dev bundle — perf note, not a defect gate for dev mode).

### Flagged for Isj (B1)
0. ~~RESOLVED (founder GO)~~ — Ruling #9 cherry-picked to main (9db3326) +
   68b5fcb/404005a picked (35a393a), all deploy-VERIFIED via /version; tutorial
   branch rebased onto main (drift closed, 11 tutorial-only commits remain,
   gate wall green: tsc×4, 38 api guards, 772/772 pandit). **audio-check.md
   BUNDLING (founder):** when delivered, it must include a named
   "mic-permission walk" section (granted/denied/dismissed/no-hardware) so Isj
   clears the MicPracticeArtboard real-device gate AND the audio pass in one
   sitting.
1. **~~RULING #9 IS STRANDED ON THE UNMERGED TUTORIAL BRANCH~~** (resolved above). Main's
   `ShishyaOrb.tsx` has NO `muteControl` / `ShishyaMuteControl` — the awake orb
   on /login shows no "सुला दें", and a second tap will SILENT-MUTE (the exact
   elder-hostile behavior Ruling #9 killed). The approved implementation +
   guards exist only on `feat/tutorial-system`, which is merge-gated on the
   artboard port. **Decision needed: cherry-pick the orb-gesture commits
   (4199421, a3ed720, + guards) onto main now, or accept old orb behavior until
   the tutorial branch merges.** Recommendation: cherry-pick — the ruling was
   approved independently of the artboards, and every live screen carries the
   orb. (Not fixed unilaterally: voice/gesture behavior + guarded component.)
2. **Voice-fired verification needs the debug panel**, not the network tab
   alone: the controller falls back to browser speechSynthesis (zero network).
   Wake-tap produced no observable TTS network call AND no speechSynthesis
   activity seconds later — INCONCLUSIVE; next session re-checks with
   ?voicedebug=1 before reporting a silence defect on /login.

---

## B2–B7
_(not started — see the campaign brief for the batch list)_
