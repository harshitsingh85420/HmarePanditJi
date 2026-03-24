# P0 Fixes - MANUAL TESTING CHECKLIST

**Date:** 2026-03-23  
**Dev Server:** http://localhost:3002  
**Browser:** Chrome (Normal + Incognito)

---

## 🔴 CRITICAL TESTS (Must Pass Before Shipping)

### TEST #1: Mobile Number Persistence
**Priority: CRITICAL** | **File:** `/mobile`

**Steps:**
1. Open: http://localhost:3002/mobile
2. Enter mobile: `9876543210` (use keypad or input field)
3. Click: "आगे बढ़ें →" button
4. If confirmation sheet appears: Click "हाँ, सही है"
5. **CHECK:** Does URL change to `/otp`?
6. Press browser BACK button
7. **CHECK:** Is `9876543210` still in the input field?

**Expected:**
- ✅ Navigates to OTP screen
- ✅ Number persists after back navigation

**Actual:**
- [ ] Navigation works
- [ ] Number persists

**Status:** [ ] PASS [ ] FAIL

---

### TEST #2: TTS Error Handling
**Priority: HIGH** | **Files:** Multiple

**Steps:**
1. Open: http://localhost:3002/mobile
2. Enter mobile: `9876543210`
3. Submit and navigate to OTP
4. **CHECK:** Does app continue working even if TTS fails?

**Expected:**
- ✅ App doesn't freeze
- ✅ Navigation continues

**Status:** [ ] PASS [ ] FAIL

---

### TEST #3: Splash Screen Timing
**Priority: MEDIUM** | **File:** `/onboarding`

**Steps:**
1. Open: http://localhost:3002/onboarding?reset=true
2. Use stopwatch to measure time until next screen

**Expected:**
- ✅ ~2.5 seconds (not 4 seconds)

**Actual:** _____ seconds

**Status:** [ ] PASS [ ] FAIL

---

### TEST #4: Language Globe Button
**Priority: HIGH** | **Files:** All screens

**Steps:**
1. Open: http://localhost:3002/onboarding → Check for 🌐 button (top-right)
2. Open: http://localhost:3002/mobile → Check for 🌐 button
3. Open: http://localhost:3002/otp → Check for 🌐 button

**Expected:**
- ✅ Globe button visible on ALL screens
- ✅ Clickable

**Status:** [ ] PASS [ ] FAIL

---

### TEST #5: OTP Language Mismatch
**Priority: MEDIUM** | **File:** `/otp`

**Steps:**
1. Start onboarding with a NON-HINDI language (e.g., Tamil, Bengali)
2. Complete mobile number entry
3. Navigate to OTP screen
4. **LISTEN:** Does TTS use correct language?

**Expected:**
- ✅ TTS uses selected language (not hardcoded Hindi)

**Status:** [ ] PASS [ ] FAIL

---

### TEST #6: Language Desync
**Priority: MEDIUM** | **Files:** Registration flow

**Steps:**
1. Start onboarding, select language: Tamil
2. Complete onboarding
3. Navigate to registration (`/mobile`)
4. **CHECK:** Is Tamil still selected?

**Expected:**
- ✅ Language persists across onboarding → registration

**Status:** [ ] PASS [ ] FAIL

---

### TEST #7: Location API Error
**Priority: LOW** | **File:** Location permission

**Steps:**
1. Go to location permission screen
2. Simulate API failure (or use in area with no GPS)
3. **CHECK:** Does Hindi error message appear?

**Expected:**
- ✅ Shows: "शहर पहचानने में समस्या हुई। कृपया हाथ से चुनें।"

**Status:** [ ] PASS [ ] FAIL

---

### TEST #8: Ambient Noise Warning
**Priority: LOW** | **File:** Voice hooks

**Steps:**
1. Open mobile screen
2. Make loud noise (>65dB) near microphone
3. **CHECK:** Does app switch to keyboard mode?

**Expected:**
- ✅ Keyboard mode activates after 3 noise errors

**Status:** [ ] PASS [ ] FAIL

---

### TEST #9: Voice Intent When Mic Off
**Priority: LOW** | **File:** `/mobile`

**Steps:**
1. Open mobile screen
2. Toggle mic OFF
3. Type number using keyboard
4. **CHECK:** Does app still process input?

**Expected:**
- ✅ App works with mic off

**Status:** [ ] PASS [ ] FAIL

---

### TEST #10: Double Navigation on Skip
**Priority: MEDIUM** | **File:** Onboarding

**Steps:**
1. Go through tutorial screens
2. Press SKIP button
3. **CHECK:** Does it navigate to `/mobile` once (not twice)?

**Expected:**
- ✅ Single navigation to correct screen

**Status:** [ ] PASS [ ] FAIL

---

### TEST #11: Tailwind Keyframes (Animations)
**Priority: LOW** | **Files:** Multiple

**Steps:**
1. Open: http://localhost:3002/onboarding
2. Check animations:
   - OM symbol glow/pulse
   - Voice bar animation
   - Success checkmark draw
   - Confetti fall (celebration)

**Expected:**
- ✅ All animations smooth, no jank

**Status:** [ ] PASS [ ] FAIL

---

## 📊 SUMMARY

| Test | Priority | Status |
|------|----------|--------|
| #1 Mobile Persistence | CRITICAL | [ ] |
| #2 TTS Errors | HIGH | [ ] |
| #3 Splash Timing | MEDIUM | [ ] |
| #4 Globe Button | HIGH | [ ] |
| #5 OTP Language | MEDIUM | [ ] |
| #6 Language Desync | MEDIUM | [ ] |
| #7 Location Error | LOW | [ ] |
| #8 Ambient Noise | LOW | [ ] |
| #9 Voice Intent | LOW | [ ] |
| #10 Double Nav | MEDIUM | [ ] |
| #11 Animations | LOW | [ ] |

**Total Passing:** ___/11

---

## 🚀 SHIP CRITERIA

**DO NOT SHIP UNTIL:**
- [ ] Test #1 (Mobile Persistence) PASSES
- [ ] Test #2 (TTS Errors) PASSES
- [ ] Test #4 (Globe Button) PASSES

**Nice to Have:**
- [ ] All other tests pass

---

## 📝 NOTES

Add any findings, bugs, or observations here:

---

**Tester Name:** _________________  
**Date:** _________________  
**Browser:** _________________
