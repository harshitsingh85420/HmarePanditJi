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
> **Next page (protocol): भाषा** — but NOTE the journey inserts स्थान before it in this build (LOCATION_PERMISSION follows splash; भाषा follows स्थान). Walk स्थान next, then भाषा. Previous loose-walk pointer superseded by the per-page protocol. OLD pointer: CONTINUE the स्थान walk (voice-fired check via the voicedebug badge
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
