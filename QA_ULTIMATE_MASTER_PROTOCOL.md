# 🎯 HmarePanditJi - ULTIMATE QA MASTER PROTOCOL (V3.0)
## "Break This App Before a 65-Year-Old Pandit Does"

**Generated:** March 22, 2026  
**Version:** 3.0 (Master Merge of V1 and V2)  
**Priority:** CRITICAL - Execute Before Any User Touches This App

---

## 🤔 HOW TO USE THIS PROMPT
**You are a QA Engineer testing HmarePanditJi, a mobile web app for Hindu priests (Pandits) age 45-70 with low tech literacy.**

## 🧠 THE PANDIT MINDSET - READ THIS FIRST
You are now testing as **Pandit Ram Nath Tiwari, age 65, from Varanasi.** Every test must be run with this mindset. If Ram Nath Tiwari can't use it perfectly the first time, the app FAILS.

- 👴 **Eyesight:** Poor (cataracts), can't read small/light text
- 🤲 **Hands:** Large thumbs, shaky, often wet from puja rituals
- 🔊 **Environment:** Temple with bells (80dB), chanting, crowds
- 📱 **Tech Level:** NEVER used voice input, first smartphone ever
- ⏰ **Time:** Rushed between morning rituals, very impatient
- 🗣️ **Language:** Speaks Bhojpuri-accented Hindi, not "proper" Hindi
- 😤 **Patience:** ZERO - if it fails twice, you delete the app FOREVER

### Test Execution Rules:
1. Run tests in order (Session 1 → Session 12).
2. Document EVERY failure using the strict Bug Format (at bottom).
3. Take screenshots/videos of every failure.
4. Test on an actual mobile device (Samsung Galaxy A12 equivalent).
5. Use Chrome for primary testing; do not rely purely on Desktop Chrome simulation.

**Pass Criteria:** 0 CRITICAL failures, 0 MAJOR failures  
**Total Testing Time:** 3-4 hours

---

## 📋 TESTING SESSIONS OVERVIEW

| Session | Focus Area | Screens/Flows | Duration | Priority |
|---------|-----------|---------------|----------|----------|
| **1** | Part 0.0 Language Selection Flow | S-0.0.1 → S-0.0.8 | 20 min | 🔴 CRITICAL |
| **2** | Part 0 Tutorial Flow | S-0.1 → S-0.12 | 25 min | 🔴 CRITICAL |
| **3** | Part 0 → Part 1 Transition | Tutorial CTA → /mobile | 15 min | 🔴 CRITICAL |
| **4** | Voice Failure Cascade | All voice overlays | 25 min | 🔴 CRITICAL |
| **5** | Data Loss Scenarios | All forms & Storage | 20 min | 🔴 CRITICAL |
| **6** | Navigation Breakage | Back/forward, deep links | 25 min | 🔴 CRITICAL |
| **7** | Accessibility Nightmares | Contrast, touch, one-hand | 25 min | 🟠 MAJOR |
| **8** | Network From Hell | Offline, 2G, recovery | 25 min | 🔴 CRITICAL |
| **9** | Voice Recognition Torture | Accents, noise, speed | 30 min | 🟠 MAJOR |
| **10** | State Management Chaos | Multi-tab, persistence | 20 min | 🟠 MAJOR |
| **11** | Real-World Pandit Scenarios | Wet hands, Battery | 25 min | 🔴 CRITICAL |
| **12** | Veteran QA Edge Cases | OS throttling, RAM eviction | 30 min | 🟠 MAJOR |

---

## 🔴 SESSION 1: PART 0.0 LANGUAGE SELECTION FLOW
**Goal:** Test the complete Part 0.0 flow (Splash → Language Set)

### Test 1.1: Complete Part 0.0 Happy Path
1. Open browser to `http://localhost:3002/onboarding`.
2. Wait for splash screen (S-0.0.1) - should show 3 seconds.
3. Should auto-advance to Location Permission (S-0.0.2).
4. Click "अनुमति दें" (Allow Location).
5. Grant browser permission.
6. Should show Language Confirmation (S-0.0.3).
7. Click "हाँ, यही सही है".
8. Should show Language Set Celebration (S-0.0.6).
9. Wait for auto-advance to Voice Tutorial (S-0.0.8).
*(Expected: Each screen loads perfectly, no jank, voice plays on each screen).*

### Test 1.2: Location Permission Denied Path
1. S-0.0.2 Location Permission → Click "अनुमति न दें".
2. Deny browser permission.
3. Should auto-advance to Manual City Entry (S-0.0.2B).
4. Select a city chip (e.g., "वाराणसी").
5. Should go to Language Confirmation (S-0.0.3).

### Test 1.3: Language List Selection Path
1. Complete flow to S-0.0.3 (Language Confirm).
2. Click "बदलें" (Change Language).
3. Select "Tamil" from S-0.0.4 grid.
4. Should show Language Choice Confirmation (S-0.0.5). Click "हाँ".
5. Celebration (S-0.0.6) text should now be in Tamil. Language persists.

### Test 1.4: Voice Tutorial (First Time Only)
1. Complete Part 0.0 to S-0.0.8 (Voice Tutorial).
2. Listen to voice instruction, and Say "हाँ" when prompted.
3. STT listens for any voice → success → Advances to S-0.1.

---

## 🔴 SESSION 2: PART 0 TUTORIAL FLOW
**Goal:** Test the complete Part 0 tutorial (S-0.1 → S-0.12)

### Test 2.1: Complete Tutorial Happy Path
1. From S-0.0.8 → Should auto-advance to S-0.1 (Swagat).
2. Click "जानें" / "आगे बढ़ें" on each screen through S-0.12 (Final Decision CTA).
3. On S-0.12, click "Registration शुरू करें".
*(Expected: All 12 screens load, voice plays, progress dots update, smooth animations).*

### Test 2.2: Tutorial Back Navigation Chain
1. Mid-tutorial, click BACK button (top-left).
2. Should show previous screen without blank pages or 404s.
3. Rapidly navigate back to S-0.1 from S-0.12 without failure.

### Test 2.3: Tutorial Skip Functionality
1. On any tutorial screen, click "छोड़ें" (Skip) button.
2. Confirm skip on sheet.
3. Should navigate to `/mobile`. Tutorial marked complete.

### Test 2.4: Language Change During Tutorial
1. Mid-tutorial, click globe icon (top-right).
2. Select different language (e.g., Tamil).
3. All subsequent screens change language instantly. Persists to `/mobile`.

---

## 🔴 SESSION 3: PART 0 → PART 1 TRANSITION
**Goal:** Test the critical transition from tutorial to registration

### Test 3.1: Tutorial CTA → /mobile Navigation
1. Complete tutorial → S-0.12 (Final CTA).
2. Click "Registration शुरू करें →".
3. Check URL: Should be `/mobile`. Shows Mobile Number entry screen perfectly.

### Test 3.2: /mobile → Back → Tutorial CTA
1. Land on `/mobile` from tutorial (don't type anything).
2. Click browser BACK.
3. Should show S-0.12 (Tutorial CTA) with "Registration शुरू करें" and "बाद में". (Does not skip).

### Test 3.3: Registration Flow Back Navigation
1. `/mobile` → Enter 9876543210 → Submit → `/otp`.
2. `/otp` → Enter OTP → Submit → `/profile`.
3. Test BACK navigation at each step (`/profile` → `/otp` → `/mobile`).
*(Expected: Data persists on back, no loops, correct screens).*

---

## 🔴 SESSION 4: VOICE FAILURE CASCADE
**Goal:** Break the STT fallback systems.

### Test 4.1: Dead Silence (70 Seconds)
1. At `/mobile`, click microphone and wait for prompt.
2. Say ABSOLUTELY NOTHING for 70 seconds.
3. Check the Voice Fallback cascade:
   - 0-12s: "सुन रहा हूँ..." indicator pulses.
   - 12s: V-05 overlay ("सुनाई नहीं दिया").
   - 24s: V-06 overlay ("फिर से कोशिश करें").
   - 36s: V-07 overlay ("कीबोर्ड का उपयोग करें") and Keyboard button is visible.

### Test 4.2: Whisper Test (STT Sensitivity)
1. At `/mobile`, click microphone. Whisper so quietly the mic can barely hear.
2. Continue whispering for 40 seconds.
*(Expected: Error cascade triggers instead of hanging forever).*

### Test 4.3: Cough/Sneeze Test (False Positives)
1. Click microphone.
2. Cough 3 times, sneeze, and clear throat.
*(Expected: Not recognized as speech. Does not accept as valid input. Eventually fails gracefully).*

### Test 4.4: Temple Noise (80dB)
1. Play temple bell audio at 80dB from a second phone.
2. Click microphone, try to speak.
*(Expected: Shows "शोर ज़्यादा है" warning instantly. Offers keyboard).*

---

## 🔴 SESSION 5: DATA LOSS SCENARIOS
**Goal:** Try to delete the user's progress.

### Test 5.1: Back Button Data Wipe
1. Complete `/mobile`, submit. On `/otp`, click BACK.
2. Check input field. (Must show 9876543210, not empty).

### Test 5.2: Tab Close/Reopen Recovery
1. Enter number on `/mobile` but DON'T submit.
2. Close tab completely (Ctrl+W) → Open new tab → Go to `/mobile`.
3. Field must still show 9876543210 (localStorage persistence).

### Test 5.3: Browser Refresh Test
1. Press F5 (refresh) on `/mobile` with a partially typed number.
2. Input field must retain the number.

### Test 5.4: App Kill Recovery (Resume Screen)
1. Submit mobile → Land on `/otp`.
2. Type `http://localhost:3002/resume` in address bar.
3. Must show "अगला चरण: OTP Verification".

### Test 5.5: Resume After Delay
1. Land on `/otp`, close browser completely. Return after 1 minute.
2. Go to `/resume`. Should still gracefully resume session.

---

## 🔴 SESSION 6: NAVIGATION BREAKAGE
**Goal:** Break navigation through deep linking.

### Test 6.1: Deep Link Direct Access
1. Close all tabs. Open a fresh tab directly to `http://localhost:3002/mobile` (bypassing onboarding).
2. Should show `/mobile` screen or smoothly redirect to homepage with session restore. No 404s.

---

## 🟠 SESSION 7: ACCESSIBILITY NIGHTMARES
**Goal:** Fail the app for elderly users.

### Test 7.1: Bright Sunlight Contrast
1. Display brightness 100%. Go to `/profile`.
2. Try to read secondary text ("जैसा आपके आधार कार्ड में है"). Must meet WCAG AA (4.5:1).

### Test 7.2: Fat Thumb Test (52px Minimum)
1. Use thumb to tap every button (आगे बढ़ें, हाँ, Globe icon, back buttons).
2. Measure: All buttons MUST compute to ≥52px height in DevTools.

### Test 7.3: Zoom Browser (200%)
1. Zoom to 200%. Complete the entire Part 0 → Part 1 flow.
2. No text cutoff. No horizontal scrolling. No overlapping buttons.

### Test 7.4: One-Handed Usage Test
1. Hold phone in LEFT hand only. Try to complete the entire flow using only left thumb.
2. Top-left back button, top-right globe icon, and all middle buttons must be reachable without dropping the phone.

---

## 🔴 SESSION 8: NETWORK FROM HELL
**Goal:** Break the app with terrible connections.

### Test 8.1: 2G Network Slow Submission
1. Network tab → "Slow 3G". Submit number on `/mobile`.
2. Must show loading state and succeed eventually. No infinite spinners.

### Test 8.2: Network Loss Mid-Submission
1. Click submit on `/mobile`, IMMEDIATELY switch Network to "Offline".
2. Must show "No internet" error and a "Retry" button. Never an infinite spinner.

### Test 8.3: Network Recovery
1. Start offline, try to submit, see error.
2. Go back online, click "Retry". Must submit successfully.

### Test 8.4: Intermittent Connection
1. Rapidly switch between No Throttling and Offline every 2 seconds while submitting.
2. App handles gracefully without crashing or losing data.

---

## 🟠 SESSION 9: VOICE RECOGNITION TORTURE
**Goal:** Confuse the voice engine with speech variations.

### Test 9.1: Bhojpuri Accent Test
1. Click mic on `/mobile`. Say "Nau ath saat chhe paanch..." with a thick Bhojpuri inflection.
2. Should correctly recognize digits despite the lack of formal "Chhah" or "Aath".

### Test 9.2: Mixed Hindi-English Test
1. Click mic. Say: "Nine eight seven six five four three two one zero".
2. Must accept and correctly identify English numbers.

### Test 9.3: Fast Speech Test
1. Speak the entire 10-digit number EXTREMELY fast without pauses.
2. Gets all 10 digits correctly.

### Test 9.4: Slow Speech Test
1. Speak with a 2-second pause between EVERY digit. ("9......8......7......")
2. STT waits patiently without timing out prematurely.

---

## 🟠 SESSION 10: STATE MANAGEMENT CHAOS
**Goal:** Break Zustand/localStorage sync.

### Test 10.1: Multiple Tabs Sync
1. Open `/mobile` in Tab 1 and Tab 2. Type "9876543210" in Tab 1.
2. Tab 2 must auto-sync and show "9876543210".

### Test 10.2: Browser History Spam
1. `/mobile` → `/otp`. Spam BACK and FORWARD 10 times consecutively as fast as possible.
2. App handles gracefully. No crashes, blank pages, or corrupted state.

---

## 🔴 SESSION 11: REAL-WORLD PANDIT SCENARIOS
**Goal:** Extreme physical disruption.

### Test 11.1: Wet Hands Test
1. Wet fingers with water (simulating post-puja). Try to click microphone and tap "आगे बढ़ें".
2. No accidental double-taps. Buttons register correctly.

### Test 11.2: Phone Call Interruption
1. Halfway through typing a number, minimize browser (Home button).
2. Wait 5 minutes. Return to app. Data perfectly intact, session alive.

### Test 11.3: Low Battery Mode
1. Simulate 5% battery using DevTools. Complete flow.
2. Animations might throttle, but app should not crash.

---

## 🟠 SESSION 12: VETERAN QA EDGE CASES (THE REAL WORLD)
**Goal:** Subject app to OS-level throttling and hardware deaths.

### Test 12.1: The "Fatal Block" Permission Test
1. At `/mobile`, firmly click "Block" when Chrome asks for Microphone permission.
2. The app immediately handles the denial gracefully, exposes Keyboard fallback without crashing `navigator.mediaDevices`.

### Test 12.2: Storage Full Test
1. Fill localStorage quota to 100% in DevTools. Try to submit number.
2. Shows "Storage full" warning, offers fallback, DOES NOT crash.

### Test 12.3: The Incognito / Private Browsing Purge
1. Complete `/mobile` in Incognito. Radically close all Incognito windows to nuke localStorage.
2. Open new Incognito window, go to `/mobile`. App restarts gracefully without crashing from `null` states.

### Test 12.4: Low-End Hardware Throttling (Screen Lock)
1. Start Voice Engine recording on `/mobile`. Manually lock the phone screen (Power Button).
2. Wait 30 seconds. Unlock. Web Speech API drop is handled smoothly, prompts to listen again instead of infinite "सुन रहा हूँ...".

### Test 12.5: Conversational Vomit Buffer Overflow
1. Speak endlessly: *"Arre beta, likho mera number... haan... ye mera naya wala jio ka number hai... likho... nau aath saat chhe paanch chaar teen do ek shoonya."*
2. The regex/extraction engine filters all filler and safely isolates the 10 digits.

### Test 12.6: The WhatsApp Context Switch (RAM Eviction)
1. On `/otp`, minimize browser natively to home screen. Open a RAM-heavy game/app.
2. OS kills the browser. Re-open browser 5 mins later. Forced page reload reclaims RAM and reconstructs the `/otp` state perfectly.

---

## 📊 BUG REPORTING FORMAT
*Use this rigorous template for every failure.*

```
BUG-XXX: [Short, brutal descriptive title]
Severity: 🔴 CRITICAL / 🟠 MAJOR / 🟡 MINOR
Session: [e.g., Session 12: Veteran Edge Cases]
Test: [e.g., Test 12.4: Phone Lock]
Date: [System Date]
Tester: [Your Name]

REPRODUCTION STEPS:
1. [Exact step]
2. [Exact step]

EXPECTED RESULT:
[What should happen based on spec]

ACTUAL RESULT:
[What completely broke]

IMPACT:
[How many Pandits does this infuriate?]

ENVIRONMENT & DEVICE:
- Device: [Model, e.g., Samsung Galaxy A12]
- OS/Browser: [e.g., Android 11 / Chrome 122]
- Physical: [Indoor/Outdoor] | [Quiet/Noisy] | [Dry/Wet hands]
- Network: [4G/Slow 3G/Offline]

MEDIA:
- Screenshot/Video Attached: [Yes/No]
- Console Log Attached: [Paste if any]
```

---

## ✅ TEST COMPLETION CHECKLIST & CRITERIA
App PASSES testing ONLY if:
1. ✅ **0 CRITICAL and 0 MAJOR failures across all 12 sessions.**
2. ✅ Tested on genuine mobile hardware (not solely DevTools emulator).
3. ✅ Survived 80dB noise testing without freezing.
4. ✅ Handled wet fingers and one-handed reachability perfectly.
5. ✅ Offline / 2G failure tests recovered gracefully without endless spinners.
6. ✅ Incognito / RAM eviction did not crash the front-end router.

**Final Sign-off:**
```
Date: ______________
Total Bugs: _______ (🔴 ___ | 🟠 ___ | 🟡 ___)
Ready For Pandit Release: YES / NO
```

---
*End of Master QA Protocol. Start Testing.*  
*🕉️ हर हर गंगे! Testing शुरू करें! 🕉️*
