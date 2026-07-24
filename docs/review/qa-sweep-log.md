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
