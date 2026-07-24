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
> **Next page (protocol): भाषा (LANGUAGE_CONFIRM)** — the app is ALREADY STAGED there (detectedCity वाराणसी, हिन्दी detected). Then परिचय (4 mic outcomes; pane blocks device capture → granted leg is test-level). OLD pointer: CONTINUE the स्थान walk (voice-fired check via the voicedebug badge
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
