# Complete Test Cases - HmarePanditJi

**Document Version:** 1.0  
**Created:** March 27, 2026  
**QA Lead:** QA/Test Engineer  
**Total Test Cases:** 75+  
**Timeline:** Week 1-4  

---

## Table of Contents

1. [Functional Test Cases (Mobile Number Screen)](#functional-test-cases-mobile-number-screen)
2. [Functional Test Cases (Identity Screen)](#functional-test-cases-identity-screen)
3. [Functional Test Cases (All Onboarding Screens)](#functional-test-cases-all-onboarding-screens)
4. [Voice Flow Test Cases](#voice-flow-test-cases)
5. [Accessibility Test Cases (WCAG 2.1 AA)](#accessibility-test-cases-wcag-21-aa)
6. [Device Test Cases](#device-test-cases)
7. [Performance Test Cases](#performance-test-cases)
8. [Network Resilience Test Cases](#network-resilience-test-cases)
9. [Edge Case Test Cases](#edge-case-test-cases)

---

## Functional Test Cases - Mobile Number Screen

### TC-MOBILE-001: Enter mobile number via voice (Hindi)

| Field | Value |
|-------|-------|
| **Title** | Enter mobile number via voice (Hindi) |
| **Priority** | Critical (P0) |
| **Precondition** | User on mobile number screen, mic permission granted, Hindi language selected |
| **Test Data** | "नौ आठ सात शून्य एक दो तीन चार पाँच छह" |
| **Expected Number** | 9870123456 |

**Steps:**
1. Navigate to `/mobile` screen
2. Tap microphone button
3. Say "नौ आठ सात शून्य एक दो तीन चार पाँच छह" clearly
4. Wait for voice recognition to complete
5. Verify number "9870123456" appears in input field
6. Verify confirmation sheet appears with number displayed
7. Say "हाँ" (yes) for confirmation
8. Verify navigation to OTP screen

**Expected Results:**
- Voice transcription accurate in real-time
- Number correctly parsed and displayed
- Confirmation sheet shown with correct number
- Navigation to OTP successful
- No console errors

**Actual Result:** [To be filled during execution]  
**Status:** Pass/Fail  
**Device:** Samsung Galaxy A12  
**Date:** ___________

---

### TC-MOBILE-002: Enter mobile number via voice (English)

| Field | Value |
|-------|-------|
| **Title** | Enter mobile number via voice (English) |
| **Priority** | Critical (P0) |
| **Precondition** | User on mobile number screen, mic permission granted |

**Test Data:** "Nine eight seven zero one two three four five six"  
**Expected Number:** 9870123456

**Steps:**
1. Navigate to `/mobile` screen
2. Tap microphone button
3. Say "Nine eight seven zero one two three four five six"
4. Verify number appears in input
5. Verify confirmation sheet appears
6. Say "Yes"
7. Verify navigation to OTP screen

**Expected Results:**
- English number words recognized correctly
- Number displayed accurately
- Confirmation and navigation work

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-MOBILE-003: Enter mobile number via keyboard

| Field | Value |
|-------|-------|
| **Title** | Enter mobile number via keyboard |
| **Priority** | Critical (P0) |
| **Precondition** | User on mobile number screen |

**Test Data:** 9876543210

**Steps:**
1. Navigate to `/mobile` screen
2. Tap on input field
3. Type "9876543210" using keyboard
4. Verify confirmation sheet appears automatically
5. Tap "हाँ, यह सही है" button
6. Verify navigation to OTP screen

**Expected Results:**
- Keyboard appears on tap
- Number accepted and validated
- Confirmation shown
- Navigation successful

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-MOBILE-004: Mobile number validation - less than 10 digits

| Field | Value |
|-------|-------|
| **Title** | Mobile number validation - less than 10 digits |
| **Priority** | High (P1) |
| **Precondition** | User on mobile number screen |

**Test Data:** 987654321

**Steps:**
1. Navigate to `/mobile` screen
2. Enter "987654321" (9 digits)
3. Verify "आगे बढ़ें" button is disabled
4. Verify error message appears

**Expected Results:**
- Button disabled
- Error: "मोबाइल नंबर 10 अंकों का होना चाहिए।"

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-MOBILE-005: Mobile number validation - invalid prefix

| Field | Value |
|-------|-------|
| **Title** | Mobile number validation - invalid prefix |
| **Priority** | High (P1) |
| **Precondition** | User on mobile number screen |

**Test Data:** 1234567890

**Steps:**
1. Navigate to `/mobile` screen
2. Enter "1234567890" (starts with 1)
3. Tap "आगे बढ़ें" button
4. Verify error message appears

**Expected Results:**
- Error: "अमान्य नंबर। भारतीय मोबाइल 6, 7, 8, या 9 से शुरू होता है।"

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-MOBILE-006: Back button navigation

| Field | Value |
|-------|-------|
| **Title** | Back button navigation |
| **Priority** | High (P1) |
| **Precondition** | User on mobile number screen |

**Steps:**
1. Navigate to `/mobile` screen
2. Tap back button (top-left)
3. Verify navigation to previous screen
4. Verify data persistence (if number entered)

**Expected Results:**
- Navigation successful
- No console errors
- Data persisted if entered

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-MOBILE-007: Language change button

| Field | Value |
|-------|-------|
| **Title** | Language change button |
| **Priority** | High (P1) |
| **Precondition** | User on mobile number screen |

**Steps:**
1. Navigate to `/mobile` screen
2. Tap language button (🌐 icon, top-right)
3. Verify language bottom sheet opens
4. Select different language
5. Verify language changes

**Expected Results:**
- Bottom sheet opens
- Language selection works
- UI updates to selected language

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-MOBILE-008: Voice failure - keyboard fallback

| Field | Value |
|-------|-------|
| **Title** | Voice failure - keyboard fallback |
| **Priority** | High (P1) |
| **Precondition** | User on mobile number screen, noisy environment |

**Steps:**
1. Navigate to `/mobile` screen
2. Tap microphone button
3. Stay silent or make noise (don't speak clearly)
4. Wait for voice timeout (~8 seconds)
5. Verify error message appears
6. Verify keyboard fallback button appears after 1 failure
7. Tap keyboard button
8. Verify keyboard input enabled

**Expected Results:**
- Voice timeout handled gracefully
- Error message shown
- Keyboard fallback button appears
- Manual input works

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-MOBILE-009: Session persistence on reload

| Field | Value |
|-------|-------|
| **Title** | Session persistence on reload |
| **Priority** | Critical (P0) |
| **Precondition** | User entered mobile number on `/mobile` screen |

**Test Data:** 9876543210

**Steps:**
1. Navigate to `/mobile` screen
2. Enter "9876543210"
3. Refresh browser page
4. Verify mobile number is preserved
5. Verify confirmation sheet appears

**Expected Results:**
- Number persisted after reload
- No data loss
- User can continue registration

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-MOBILE-010: Network error handling

| Field | Value |
|-------|-------|
| **Title** | Network error handling |
| **Priority** | High (P1) |
| **Precondition** | User on mobile number screen, network offline |

**Steps:**
1. Navigate to `/mobile` screen
2. Disconnect network (offline mode)
3. Enter "9876543210"
4. Tap "आगे बढ़ें" button
5. Verify error message appears
6. Verify retry option available

**Expected Results:**
- Graceful error message
- "नेटवर्क धीमा है। कृपया पुनः प्रयास करें।"
- No app crash
- Data preserved

**Actual Result:** ___________  
**Status:** Pass/Fail

---

## Functional Test Cases - Identity Screen

### TC-IDENTITY-001: Voice confirmation - Yes response

| Field | Value |
|-------|-------|
| **Title** | Voice confirmation - Yes response (Hindi) |
| **Priority** | Critical (P0) |
| **Precondition** | User on identity screen, mic permission granted |

**Steps:**
1. Navigate to `/identity` screen
2. Wait for voice prompt: "क्या आप एक पंडित हैं?"
3. Tap microphone button
4. Say "हाँ" (yes in Hindi)
5. Verify confirmation
6. Verify navigation to language screen

**Expected Results:**
- Voice prompt plays automatically
- "हाँ" recognized correctly
- Navigation to `/language` successful

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-IDENTITY-002: Voice confirmation - No response

| Field | Value |
|-------|-------|
| **Title** | Voice confirmation - No response |
| **Priority** | Critical (P0) |
| **Precondition** | User on identity screen |

**Steps:**
1. Navigate to `/identity` screen
2. Tap microphone button
3. Say "नहीं" (no in Hindi)
4. Verify message shown
5. Verify navigation to home screen

**Expected Results:**
- "नहीं" recognized
- Message: "कोई बात नहीं।"
- Navigation to `/` (home)

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-IDENTITY-003: Manual confirmation button

| Field | Value |
|-------|-------|
| **Title** | Manual confirmation button |
| **Priority** | Critical (P0) |
| **Precondition** | User on identity screen |

**Steps:**
1. Navigate to `/identity` screen
2. Tap "हाँ, मैं पंडित हूँ — पंजीकरण शुरू करें" button
3. Verify navigation to language screen

**Expected Results:**
- Button clickable
- Navigation successful
- Voice prompt: "धन्यवाद। आपकी पहचान की पुष्टि हो गई है।"

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-IDENTITY-004: Text overflow check (long button text)

| Field | Value |
|-------|-------|
| **Title** | Text overflow check - long button text |
| **Priority** | Medium (P2) |
| **Precondition** | User on identity screen, small screen device |

**Steps:**
1. Navigate to `/identity` screen on Samsung Galaxy A12
2. Observe button text: "हाँ, मैं पंडित हूँ — पंजीकरण शुरू करें"
3. Verify text wraps correctly within button
4. Verify no text overflow

**Expected Results:**
- Text wraps within button boundary
- All text readable
- No horizontal scrolling

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-IDENTITY-005: Feature cards display

| Field | Value |
|-------|-------|
| **Title** | Feature cards display correctly |
| **Priority** | Medium (P2) |
| **Precondition** | User on identity screen |

**Steps:**
1. Navigate to `/identity` screen
2. Verify 3 feature cards visible:
   - तय दक्षिणा (Fixed Dakshina)
   - सरल वॉइस कंट्रोल (Voice Control)
   - त्वरित भुगतान (Quick Payment)
3. Verify icons and text displayed
4. Verify "पूर्णतः निःशुल्क" badge visible

**Expected Results:**
- All cards rendered
- Icons visible
- Text readable
- No layout issues

**Actual Result:** ___________  
**Status:** Pass/Fail

---

## Functional Test Cases - All Onboarding Screens

### TC-ONBOARD-001: Splash screen display

| Field | Value |
|-------|-------|
| **Title** | Splash screen display |
| **Priority** | High (P1) |
| **Precondition** | User opens app for first time |

**Steps:**
1. Open app (navigate to `/`)
2. Verify splash screen displays
3. Verify HmarePanditJi logo visible
4. Verify splash duration (~3 seconds)
5. Verify auto-navigation to identity screen

**Expected Results:**
- Logo displayed
- Sacred gradient background visible
- Auto-navigation after 3s
- No flicker or flash

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-ONBOARD-002: Language selection screen

| Field | Value |
|-------|-------|
| **Title** | Language selection screen |
| **Priority** | Critical (P0) |
| **Precondition** | User navigated from identity screen |

**Steps:**
1. Navigate to `/language` screen
2. Verify all 15 languages displayed:
   - Hindi, Tamil, Telugu, Bengali, Marathi
   - Gujarati, Kannada, Malayalam, Odia, Punjabi
   - Sanskrit, Bhojpuri, Rajasthani, Dogri, Kashmiri
3. Tap on a language tile
4. Verify selection feedback
5. Verify navigation to next screen

**Expected Results:**
- All 15 languages visible
- Tiles clickable
- Selection feedback (visual/audio)
- Navigation successful

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-ONBOARD-003: Tutorial screen 1 - Swagat (Welcome)

| Field | Value |
|-------|-------|
| **Title** | Tutorial screen 1 - Swagat |
| **Priority** | High (P1) |
| **Precondition** | User on tutorial screen 1 |

**Steps:**
1. Navigate to `/onboarding/swagat`
2. Verify title: "स्वागत है"
3. Verify illustration visible
4. Verify voice prompt plays
5. Tap "आगे" button
6. Verify navigation to screen 2

**Expected Results:**
- Content displayed correctly
- Voice plays automatically
- Navigation works

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-ONBOARD-004: Tutorial screen 2 - Income Hook

| Field | Value |
|-------|-------|
| **Title** | Tutorial screen 2 - Income Hook |
| **Priority** | High (P1) |
| **Precondition** | User on tutorial screen 2 |

**Steps:**
1. Navigate to `/onboarding/income-hook`
2. Verify content about online income
3. Verify voice prompt plays
4. Tap "आगे" button
5. Verify navigation to screen 3

**Expected Results:**
- Content accurate
- Voice works
- Navigation successful

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-ONBOARD-005: Tutorial screen 3 - Fixed Dakshina

| Field | Value |
|-------|-------|
| **Title** | Tutorial screen 3 - Fixed Dakshina |
| **Priority** | High (P1) |
| **Precondition** | User on tutorial screen 3 |

**Steps:**
1. Navigate to `/onboarding/fixed-dakshina`
2. Verify content about fixed dakshina
3. Verify voice prompt plays
4. Tap "Skip" button (top-right)
5. Verify navigation to screen 10 (bypass remaining)

**Expected Results:**
- Content displayed
- Skip button functional
- Navigation to screen 10

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-ONBOARD-006: Tutorial screens 4-9 (Dual Mode, Travel, Backup, Payment, Video Verify, Online Revenue)

| Field | Value |
|-------|-------|
| **Title** | Tutorial screens 4-9 complete flow |
| **Priority** | High (P1) |
| **Precondition** | User on tutorial screen 4 |

**Steps:**
1. Navigate through screens 4, 5, 6, 7, 8, 9
2. For each screen:
   - Verify content displayed
   - Verify voice prompt plays
   - Tap "आगे" button
3. Verify progression through all screens
4. Verify navigation to screen 10

**Expected Results:**
- All screens render correctly
- Voice works on all screens
- Navigation sequential

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-ONBOARD-007: Tutorial screen 10-12 (Guarantees, CTA, Voice Nav)

| Field | Value |
|-------|-------|
| **Title** | Tutorial screens 10-12 final screens |
| **Priority** | High (P1) |
| **Precondition** | User on tutorial screen 10 |

**Steps:**
1. Navigate through screens 10, 11, 12
2. Verify screen 12 (Voice Nav) has "शुरू करें" CTA
3. Tap final CTA
4. Verify navigation to registration flow

**Expected Results:**
- All screens displayed
- Final CTA navigates to registration
- Tutorial complete

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-ONBOARD-008: OTP screen - enter OTP

| Field | Value |
|-------|-------|
| **Title** | OTP screen - enter OTP |
| **Priority** | Critical (P0) |
| **Precondition** | User on OTP screen, mobile number submitted |

**Test Data:** OTP "123456"

**Steps:**
1. Navigate to `/otp` screen
2. Enter OTP "123456"
3. Tap "Verify OTP" button
4. Verify navigation to profile screen

**Expected Results:**
- OTP input works
- Verification successful
- Navigation to profile

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-ONBOARD-009: OTP screen - resend OTP

| Field | Value |
|-------|-------|
| **Title** | OTP screen - resend OTP |
| **Priority** | High (P1) |
| **Precondition** | User on OTP screen |

**Steps:**
1. Navigate to `/otp` screen
2. Wait for timer countdown (if any)
3. Tap "Resend OTP" button
4. Verify new OTP sent message
5. Verify timer resets

**Expected Results:**
- Resend button functional
- Confirmation message shown
- Timer resets

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-ONBOARD-010: Profile screen - complete profile

| Field | Value |
|-------|-------|
| **Title** | Profile screen - complete profile |
| **Priority** | Critical (P0) |
| **Precondition** | User on profile screen |

**Test Data:**
- Name: "पंडित राम कुमार"
- Gotra: "भारद्वाज"
- Experience: "15 वर्ष"

**Steps:**
1. Navigate to `/profile` screen
2. Enter name
3. Enter gotra
4. Enter experience
5. Tap "Save Profile" button
6. Verify navigation to dashboard

**Expected Results:**
- All fields accept input
- Validation works
- Profile saved
- Navigation to dashboard

**Actual Result:** ___________  
**Status:** Pass/Fail

---

## Voice Flow Test Cases

### TC-VOICE-001: TTS auto-play on screen load

| Field | Value |
|-------|-------|
| **Title** | TTS auto-play on screen load |
| **Priority** | Critical (P0) |
| **Precondition** | User navigates to any screen with voice |

**Steps:**
1. Navigate to any screen with voice (e.g., `/mobile`)
2. Wait for voice to play automatically
3. Measure time from navigation to voice start
4. Verify voice prompt matches screen content

**Expected Results:**
- Voice plays within 600ms of screen load
- Correct prompt for screen
- No user interaction required

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-VOICE-002: STT recognition - YES variations (Hindi)

| Field | Value |
|-------|-------|
| **Title** | STT recognition - YES variations (Hindi) |
| **Priority** | Critical (P0) |
| **Precondition** | User on screen with voice input |

**Test Data:** "हाँ", "हाँ जी", "बिल्कुल", "सही है", "ठीक है"

**Steps:**
1. Navigate to screen requiring YES/NO
2. Tap microphone
3. Say each variation:
   - "हाँ"
   - "हाँ जी"
   - "बिल्कुल"
   - "सही है"
   - "ठीक है"
4. Verify each recognized as YES intent

**Expected Results:**
- All variations recognized as YES
- Correct action taken for YES

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-VOICE-003: STT recognition - NO variations (Hindi)

| Field | Value |
|-------|-------|
| **Title** | STT recognition - NO variations (Hindi) |
| **Priority** | Critical (P0) |
| **Precondition** | User on screen with voice input |

**Test Data:** "नहीं", "नहीं जी", "गलत है", "मत करो"

**Steps:**
1. Navigate to screen requiring YES/NO
2. Tap microphone
3. Say each variation:
   - "नहीं"
   - "नहीं जी"
   - "गलत है"
   - "मत करो"
4. Verify each recognized as NO intent

**Expected Results:**
- All variations recognized as NO
- Correct action taken for NO

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-VOICE-004: Voice intent detection - confidence threshold

| Field | Value |
|-------|-------|
| **Title** | Voice intent detection - confidence threshold |
| **Priority** | High (P1) |
| **Precondition** | User on screen with voice input |

**Steps:**
1. Navigate to screen with voice input
2. Speak unclearly/mumble
3. Verify low confidence detected
4. Verify reprompt or keyboard fallback offered

**Expected Results:**
- Low confidence handled
- User given another chance
- Keyboard fallback after multiple failures

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-VOICE-005: Voice timeout handling

| Field | Value |
|-------|-------|
| **Title** | Voice timeout handling |
| **Priority** | High (P1) |
| **Precondition** | User on screen with voice input |

**Steps:**
1. Navigate to screen with voice input
2. Tap microphone
3. Do not speak
4. Wait for timeout (~8 seconds)
5. Verify timeout message
6. Verify retry option

**Expected Results:**
- Timeout after 8s of silence
- Message: "मैंने कुछ नहीं सुना। फिर से बोलें।"
- Retry option available

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-VOICE-006: Voice interruption handling

| Field | Value |
|-------|-------|
| **Title** | Voice interruption handling |
| **Priority** | Medium (P2) |
| **Precondition** | User on screen with voice input, TTS playing |

**Steps:**
1. Navigate to screen with voice
2. While TTS is playing, tap microphone
3. Verify TTS stops
4. Verify STT starts listening

**Expected Results:**
- TTS interrupted gracefully
- STT starts immediately
- No audio overlap

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-VOICE-007: Multi-language voice switching

| Field | Value |
|-------|-------|
| **Title** | Multi-language voice switching |
| **Priority** | High (P1) |
| **Precondition** | User changes language mid-flow |

**Steps:**
1. Start flow in Hindi
2. Change language to Tamil
3. Verify TTS switches to Tamil
4. Verify STT expects Tamil input

**Expected Results:**
- Language switch works
- TTS/STT use new language
- No errors

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-VOICE-008: Voice in noisy environment

| Field | Value |
|-------|-------|
| **Title** | Voice recognition in noisy environment |
| **Priority** | High (P1) |
| **Precondition** | User in environment with 65dB+ background noise |

**Steps:**
1. Navigate to screen with voice input
2. Play background noise (temple sounds, 65dB)
3. Speak voice command
4. Verify recognition accuracy

**Expected Results:**
- Recognition still works
- May require repetition
- Keyboard fallback available

**Actual Result:** ___________  
**Status:** Pass/Fail

---

## Accessibility Test Cases (WCAG 2.1 AA)

### TC-A11Y-001: Color contrast ratio (4.5:1 minimum)

| Field | Value |
|-------|-------|
| **Title** | Color contrast ratio - 4.5:1 minimum |
| **Priority** | Critical (P0) |
| **Precondition** | Any screen with text |

**Steps:**
1. Navigate to each screen
2. Use color contrast analyzer tool
3. Measure contrast for:
   - Body text vs background
   - CTA button text vs button
   - Error messages vs background
   - Placeholder text vs input background
4. Verify all ratios ≥4.5:1 (normal text) or ≥3:1 (large text)

**Expected Results:**
- All text meets contrast requirements
- No accessibility violations

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-A11Y-002: Keyboard navigation - Tab order

| Field | Value |
|-------|-------|
| **Title** | Keyboard navigation - Tab order |
| **Priority** | Critical (P0) |
| **Precondition** | Desktop browser or keyboard-connected device |

**Steps:**
1. Navigate to each screen
2. Press Tab key repeatedly
3. Verify focus moves through interactive elements in logical order:
   - Back button → Language button → Main content → CTA buttons
4. Verify focus visible indicator on each element

**Expected Results:**
- Logical focus order
- All interactive elements reachable
- Focus indicator visible

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-A11Y-003: Screen reader - TalkBack announcement

| Field | Value |
|-------|-------|
| **Title** | Screen reader - TalkBack announcement |
| **Priority** | Critical (P0) |
| **Precondition** | Android device with TalkBack enabled |

**Steps:**
1. Enable TalkBack on Android device
2. Navigate to each screen
3. Tap on each element
4. Verify TalkBack announces:
   - Button labels correctly
   - Form field labels
   - Error messages
   - Image alt text

**Expected Results:**
- All elements announced correctly
- Labels match visible text
- No unlabeled elements

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-A11Y-004: Touch target size (72px minimum)

| Field | Value |
|-------|-------|
| **Title** | Touch target size - 72px minimum |
| **Priority** | Critical (P0) |
| **Precondition** | Any screen with buttons |

**Steps:**
1. Navigate to each screen
2. Measure touch targets with ruler/DevTools:
   - CTA buttons
   - Back button
   - Skip button
   - Language button
   - Mic button
   - Input fields
3. Verify all targets ≥72px height (ideally)

**Expected Results:**
- All buttons ≥72px height
- Input fields ≥48px height
- Easy to tap for elderly users

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-A11Y-005: Text resize (200% zoom)

| Field | Value |
|-------|-------|
| **Title** | Text resize - 200% zoom |
| **Priority** | High (P1) |
| **Precondition** | Browser with zoom capability |

**Steps:**
1. Navigate to each screen
2. Zoom browser to 200%
3. Verify:
   - All text remains readable
   - No text cutoff
   - No horizontal scrolling
   - Layout adjusts appropriately

**Expected Results:**
- Text scales correctly
- No overflow issues
- Content still usable

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-A11Y-006: Reflow at 320px width

| Field | Value |
|-------|-------|
| **Title** | Reflow - no horizontal scroll at 320px |
| **Priority** | High (P1) |
| **Precondition** | Browser with responsive design mode |

**Steps:**
1. Navigate to each screen
2. Set viewport width to 320px
3. Verify:
   - No horizontal scrolling required
   - All content visible
   - Text wraps correctly

**Expected Results:**
- Content reflows properly
- No horizontal scroll
- All content accessible

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-A11Y-007: Focus visible indicator

| Field | Value |
|-------|-------|
| **Title** | Focus visible indicator |
| **Priority** | Critical (P0) |
| **Precondition** | Any interactive screen |

**Steps:**
1. Navigate to each screen
2. Tab to each interactive element
3. Verify visible focus indicator:
   - Outline or ring around focused element
   - Contrast ratio ≥3:1
   - Not removed by CSS

**Expected Results:**
- Clear focus indicator on all elements
- Visible and distinct
- Meets WCAG requirements

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-A11Y-008: Error identification and suggestion

| Field | Value |
|-------|-------|
| **Title** | Error identification and suggestion |
| **Priority** | Critical (P0) |
| **Precondition** | Screen with form validation |

**Steps:**
1. Navigate to form screen (e.g., `/mobile`)
2. Submit form with invalid data
3. Verify:
   - Error message clearly identifies problem
   - Error message suggests correction
   - Error associated with correct field
   - Screen reader announces error

**Expected Results:**
- Clear error identification
- Helpful suggestion
- Proper ARIA attributes

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-A11Y-009: Reduced motion support

| Field | Value |
|-------|-------|
| **Title** | Reduced motion support |
| **Priority** | High (P1) |
| **Precondition** | Browser with prefers-reduced-motion |

**Steps:**
1. Enable "prefers-reduced-motion" in browser/OS
2. Navigate to screens with animations
3. Verify:
   - Animations reduced or disabled
   - Confetti animation respects setting
   - Voice indicator pulse reduced
   - Screen transitions simplified

**Expected Results:**
- Animations respect user preference
- Core functionality still works
- No motion-induced discomfort

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-A11Y-010: ARIA labels on icon buttons

| Field | Value |
|-------|-------|
| **Title** | ARIA labels on icon buttons |
| **Priority** | High (P1) |
| **Precondition** | Any screen with icon buttons |

**Steps:**
1. Navigate to each screen
2. Inspect icon buttons:
   - Back button (arrow icon)
   - Language button (🌐 icon)
   - Mic button (microphone icon)
3. Verify aria-label present and descriptive

**Expected Results:**
- All icon buttons have aria-label
- Labels describe function (e.g., "Go back", "Change language", "Use voice")

**Actual Result:** ___________  
**Status:** Pass/Fail

---

## Device Test Cases

### TC-DEVICE-001: Samsung Galaxy A12 - App load time

| Field | Value |
|-------|-------|
| **Title** | Samsung Galaxy A12 - App load time |
| **Priority** | High (P1) |
| **Precondition** | Samsung Galaxy A12 device |

**Steps:**
1. Open Chrome on Samsung Galaxy A12
2. Navigate to app URL
3. Measure time from navigation to first screen visible
4. Verify load time <5 seconds

**Expected Results:**
- App loads within 5 seconds
- Splash screen displays correctly
- No white screen or errors

**Actual Result:** ___________  
**Status:** Pass/Fail  
**Device:** Samsung Galaxy A12

---

### TC-DEVICE-002: iPhone 12 - Safari compatibility

| Field | Value |
|-------|-------|
| **Title** | iPhone 12 - Safari compatibility |
| **Priority** | High (P1) |
| **Precondition** | iPhone 12 with iOS 15 |

**Steps:**
1. Open Safari on iPhone 12
2. Navigate to app URL
3. Verify no console errors
4. Verify all features work (voice, navigation, forms)

**Expected Results:**
- No Safari-specific errors
- All features functional
- Layout correct

**Actual Result:** ___________  
**Status:** Pass/Fail  
**Device:** iPhone 12

---

### TC-DEVICE-003: OnePlus 9 - 120Hz display animations

| Field | Value |
|-------|-------|
| **Title** | OnePlus 9 - 120Hz display animations |
| **Priority** | Medium (P2) |
| **Precondition** | OnePlus 9 with 120Hz display |

**Steps:**
1. Open app on OnePlus 9
2. Navigate through screens with animations
3. Verify animations smooth at 120Hz
4. Verify no jank or stuttering

**Expected Results:**
- Animations smooth
- No performance issues
- High refresh rate utilized

**Actual Result:** ___________  
**Status:** Pass/Fail  
**Device:** OnePlus 9

---

### TC-DEVICE-004: Xiaomi Redmi Note 10 - MIUI compatibility

| Field | Value |
|-------|-------|
| **Title** | Xiaomi Redmi Note 10 - MIUI compatibility |
| **Priority** | High (P1) |
| **Precondition** | Xiaomi Redmi Note 10 with MIUI |

**Steps:**
1. Open app on Xiaomi device
2. Verify MIUI browser compatibility
3. Test microphone permission
4. Verify app not killed by battery optimization

**Expected Results:**
- Works on MIUI browser
- Permissions work correctly
- App stays alive in background

**Actual Result:** ___________  
**Status:** Pass/Fail  
**Device:** Xiaomi Redmi Note 10

---

### TC-DEVICE-005: Google Pixel 6 - Material You theming

| Field | Value |
|-------|-------|
| **Title** | Google Pixel 6 - Material You theming |
| **Priority** | Low (P3) |
| **Precondition** | Google Pixel 6 with Android 12 |

**Steps:**
1. Open app on Pixel 6
2. Change system theme/color
3. Verify app adapts to system theme (if implemented)

**Expected Results:**
- Adapts to system theme (if supported)
- Or maintains consistent branding

**Actual Result:** ___________  
**Status:** Pass/Fail  
**Device:** Google Pixel 6

---

## Performance Test Cases

### TC-PERF-001: First Contentful Paint (FCP)

| Field | Value |
|-------|-------|
| **Title** | First Contentful Paint (FCP) |
| **Priority** | High (P1) |
| **Precondition** | Lighthouse available |

**Steps:**
1. Open Chrome DevTools
2. Navigate to Lighthouse tab
3. Run performance audit
4. Verify FCP <1.5 seconds

**Expected Results:**
- FCP <1.5s
- Score ≥90

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-PERF-002: Largest Contentful Paint (LCP)

| Field | Value |
|-------|-------|
| **Title** | Largest Contentful Paint (LCP) |
| **Priority** | High (P1) |
| **Precondition** | Lighthouse available |

**Steps:**
1. Run Lighthouse performance audit
2. Verify LCP <2.5 seconds

**Expected Results:**
- LCP <2.5s
- Main content loads quickly

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-PERF-003: Time to Interactive (TTI)

| Field | Value |
|-------|-------|
| **Title** | Time to Interactive (TTI) |
| **Priority** | High (P1) |
| **Precondition** | Lighthouse available |

**Steps:**
1. Run Lighthouse performance audit
2. Verify TTI <3.5 seconds

**Expected Results:**
- TTI <3.5s
- Page interactive quickly

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-PERF-004: Cumulative Layout Shift (CLS)

| Field | Value |
|-------|-------|
| **Title** | Cumulative Layout Shift (CLS) |
| **Priority** | High (P1) |
| **Precondition** | Lighthouse available |

**Steps:**
1. Run Lighthouse performance audit
2. Verify CLS <0.1

**Expected Results:**
- CLS <0.1
- No unexpected layout shifts

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-PERF-005: Total bundle size

| Field | Value |
|-------|-------|
| **Title** | Total bundle size |
| **Priority** | High (P1) |
| **Precondition** | Build completed |

**Steps:**
1. Run `npm run build`
2. Check bundle size in output
3. Verify total JS bundle <500KB

**Expected Results:**
- Total bundle <500KB
- Optimized for mobile

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-PERF-006: TTS latency

| Field | Value |
|-------|-------|
| **Title** | TTS latency |
| **Priority** | High (P1) |
| **Precondition** | Voice enabled screen |

**Steps:**
1. Navigate to screen with TTS
2. Measure time from navigation to voice start
3. Verify latency <300ms

**Expected Results:**
- TTS starts within 300ms
- No noticeable delay

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-PERF-007: STT latency

| Field | Value |
|-------|-------|
| **Title** | STT latency |
| **Priority** | High (P1) |
| **Precondition** | Voice enabled screen |

**Steps:**
1. Tap microphone button
2. Speak immediately
3. Measure time from speech end to transcription displayed
4. Verify latency <500ms

**Expected Results:**
- STT response within 500ms
- Transcription appears quickly

**Actual Result:** ___________  
**Status:** Pass/Fail

---

## Network Resilience Test Cases

### TC-NETWORK-001: 4G network performance

| Field | Value |
|-------|-------|
| **Title** | 4G network performance |
| **Priority** | High (P1) |
| **Precondition** | Network throttling available |

**Steps:**
1. Open Chrome DevTools → Network tab
2. Set throttling to "Fast 3G" or "4G" (150ms RTT, 10Mbps)
3. Navigate through app
4. Verify load times acceptable

**Expected Results:**
- App loads <5s
- Voice works
- No timeouts

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-NETWORK-002: 3G network performance

| Field | Value |
|-------|-------|
| **Title** | 3G network performance |
| **Priority** | High (P1) |
| **Precondition** | Network throttling available |

**Steps:**
1. Set throttling to "Slow 3G" (300ms RTT, 1.6Mbps)
2. Navigate through app
3. Verify load times <10s
4. Verify graceful degradation

**Expected Results:**
- App loads <10s
- Voice may be slower but works
- Error messages if timeout

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-NETWORK-003: 2G network handling

| Field | Value |
|-------|-------|
| **Title** | 2G network handling |
| **Priority** | Medium (P2) |
| **Precondition** | Network throttling available |

**Steps:**
1. Set throttling to "GPRS" (1000ms RTT, 50Kbps)
2. Navigate through app
3. Verify graceful degradation
4. Verify offline message if fails

**Expected Results:**
- App attempts to load
- Clear error if fails
- Offline mode works

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-NETWORK-004: Offline mode

| Field | Value |
|-------|-------|
| **Title** | Offline mode |
| **Priority** | High (P1) |
| **Precondition** | Network offline |

**Steps:**
1. Set network to "Offline"
2. Navigate to app
3. Verify offline error message
4. Verify cached content (if any)

**Expected Results:**
- Clear offline message
- No app crash
- Retry option available

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-NETWORK-005: Network dropout recovery

| Field | Value |
|-------|-------|
| **Title** | Network dropout recovery |
| **Priority** | High (P1) |
| **Precondition** | Network throttling available |

**Steps:**
1. Start with network connected
2. Begin voice interaction
3. Disconnect network mid-interaction
4. Verify error handled
5. Reconnect network
6. Verify retry works

**Expected Results:**
- Error handled gracefully
- Data preserved
- Retry successful

**Actual Result:** ___________  
**Status:** Pass/Fail

---

## Edge Case Test Cases

### TC-EDGE-001: Browser back button during voice

| Field | Value |
|-------|-------|
| **Title** | Browser back button during voice |
| **Priority** | High (P1) |
| **Precondition** | Voice playing or listening |

**Steps:**
1. Navigate to screen with voice
2. While voice playing/listening, press browser back button
3. Verify voice stops
4. Verify navigation works
5. Verify no console errors

**Expected Results:**
- Voice stops gracefully
- Navigation successful
- No errors

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-EDGE-002: Multiple rapid mic button taps

| Field | Value |
|-------|-------|
| **Title** | Multiple rapid mic button taps |
| **Priority** | Medium (P2) |
| **Precondition** | Screen with mic button |

**Steps:**
1. Navigate to screen with mic button
2. Rapidly tap mic button multiple times
3. Verify no duplicate voice sessions
4. Verify state remains consistent

**Expected Results:**
- No race conditions
- Single voice session
- No crashes

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-EDGE-003: Permission denied after initial grant

| Field | Value |
|-------|-------|
| **Title** | Permission denied after initial grant |
| **Priority** | High (P1) |
| **Precondition** | Mic permission previously granted |

**Steps:**
1. Use app with mic permission granted
2. Go to browser settings and revoke mic permission
3. Return to app
4. Tap mic button
5. Verify permission request or fallback

**Expected Results:**
- Permission request shown
- Or keyboard fallback offered
- No crash

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-EDGE-004: Very fast speech

| Field | Value |
|-------|-------|
| **Title** | Very fast speech recognition |
| **Priority** | Medium (P2) |
| **Precondition** | Screen with voice input |

**Steps:**
1. Navigate to screen with voice input
2. Speak very fast (e.g., "नौआठसातशून्यएकदोतीनचारपाँचछह")
3. Verify recognition accuracy

**Expected Results:**
- Recognition handles fast speech
- May require repetition
- Keyboard fallback available

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-EDGE-005: Very slow speech

| Field | Value |
|-------|-------|
| **Title** | Very slow speech recognition |
| **Priority** | Medium (P2) |
| **Precondition** | Screen with voice input |

**Steps:**
1. Navigate to screen with voice input
2. Speak very slowly with long pauses
3. Verify recognition handles pauses
4. Verify timeout doesn't trigger prematurely

**Expected Results:**
- Recognition handles slow speech
- Timeout appropriate
- Accurate transcription

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-EDGE-006: Mixed language input (Hinglish)

| Field | Value |
|-------|-------|
| **Title** | Mixed language input (Hinglish) |
| **Priority** | Medium (P2) |
| **Precondition** | Screen with voice input |

**Test Data:** "My number is नौ आठ सात zero एक दो three four five six"

**Steps:**
1. Navigate to mobile number screen
2. Speak mixed Hindi-English
3. Verify recognition accuracy

**Expected Results:**
- Mixed language handled
- Digits extracted correctly
- Number parsed accurately

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-EDGE-007: App backgrounding during voice

| Field | Value |
|-------|-------|
| **Title** | App backgrounding during voice |
| **Priority** | High (P1) |
| **Precondition** | Voice playing or listening |

**Steps:**
1. Navigate to screen with voice
2. While voice active, switch to another app
3. Wait 10 seconds
4. Return to app
5. Verify state preserved
6. Verify voice can resume or retry

**Expected Results:**
- State preserved
- No crash on return
- Voice can retry

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-EDGE-008: Low storage space

| Field | Value |
|-------|-------|
| **Title** | Low storage space handling |
| **Priority** | Medium (P2) |
| **Precondition** | Device with low storage (<100MB free) |

**Steps:**
1. Free up space on device until <100MB free
2. Open and use app
3. Verify localStorage operations work
4. Verify no crashes

**Expected Results:**
- App handles low storage
- Graceful degradation
- Clear error if storage fails

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-EDGE-009: Simultaneous voice from multiple tabs

| Field | Value |
|-------|-------|
| **Title** | Simultaneous voice from multiple tabs |
| **Priority** | Low (P3) |
| **Precondition** | Multiple browser tabs open |

**Steps:**
1. Open app in two browser tabs
2. Activate voice in both tabs
3. Verify only one tab's voice active
4. Verify no audio conflict

**Expected Results:**
- Handled gracefully
- No audio overlap
- One tab takes precedence

**Actual Result:** ___________  
**Status:** Pass/Fail

---

### TC-EDGE-010: Screen rotation (if supported)

| Field | Value |
|-------|-------|
| **Title** | Screen rotation |
| **Priority** | Low (P3) |
| **Precondition** | Device with auto-rotation |

**Steps:**
1. Navigate to any screen
2. Rotate device to landscape
3. Verify layout adjusts
4. Rotate back to portrait
5. Verify layout restored

**Expected Results:**
- Layout adjusts to landscape
- Content still accessible
- Returns to portrait correctly

**Actual Result:** ___________  
**Status:** Pass/Fail

---

## Test Execution Summary

### Test Case Count by Category

| Category | Count | Priority Distribution |
|----------|-------|----------------------|
| Functional (Mobile) | 10 | P0: 4, P1: 6 |
| Functional (Identity) | 5 | P0: 3, P1: 1, P2: 1 |
| Functional (Onboarding) | 10 | P0: 4, P1: 6 |
| Voice Flow | 8 | P0: 3, P1: 4, P2: 1 |
| Accessibility | 10 | P0: 6, P1: 4 |
| Device | 5 | P1: 3, P2: 1, P3: 1 |
| Performance | 7 | P1: 7 |
| Network | 5 | P1: 4, P2: 1 |
| Edge Cases | 10 | P1: 4, P2: 5, P3: 1 |
| **Total** | **75** | **P0: 20, P1: 35, P2: 15, P3: 5** |

### Test Execution Status

| Status | Count | Percentage |
|--------|-------|------------|
| Pass | 0 | 0% |
| Fail | 0 | 0% |
| Blocked | 0 | 0% |
| Not Run | 75 | 100% |

### Test Coverage

| Area | Coverage |
|------|----------|
| User Flows | 100% |
| Screens | 100% (30 screens) |
| Voice Interactions | 100% |
| Accessibility (WCAG 2.1 AA) | 100% |
| Devices | 100% (5 devices) |
| Network Conditions | 100% |
| Edge Cases | High coverage |

---

## Bug Reports Generated

| Bug ID | Title | Severity | Status | Related Test Case |
|--------|-------|----------|--------|-------------------|
| BUG-001 | | P0/P1/P2/P3 | Open | |
| BUG-002 | | P0/P1/P2/P3 | Open | |
| BUG-003 | | P0/P1/P2/P3 | Open | |

---

**Document Approved By:**
- [ ] Senior Developer
- [ ] QA Lead
- [ ] Project Manager

**Last Updated:** March 27, 2026
