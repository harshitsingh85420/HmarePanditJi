# Manual Test Checklist

**Application:** HmarePanditJi  
**Version:** 0.1.0  
**Test Date:** ___________  
**Tester:** ___________

---

## Section 1: Part 0 Onboarding

| # | Test Case | Expected Result | Pass | Fail | Notes |
|---|-----------|-----------------|------|------|-------|
| 1.1 | Splash screen displays for 3 seconds | Splash visible for exactly 3s | ☐ | ☐ | |
| 1.2 | Location permission voice plays | Audio plays automatically | ☐ | ☐ | |
| 1.3 | Manual city entry works | Can type and submit city | ☐ | ☐ | |
| 1.4 | Language auto-detect correct | Hindi pre-selected for India | ☐ | ☐ | |
| 1.5 | Language list scrollable | All languages accessible | ☐ | ☐ | |
| 1.6 | All 12 tutorial screens load | No missing screens | ☐ | ☐ | |
| 1.7 | Voice prompts play on each screen | Audio plays on load | ☐ | ☐ | |
| 1.8 | Progress dots update correctly | Dots fill as user progresses | ☐ | ☐ | |
| 1.9 | Skip button works on all screens | Can skip from any tutorial screen | ☐ | ☐ | |
| 1.10 | Back button works on all screens | Can navigate back | ☐ | ☐ | |
| 1.11 | Language change widget works | Can switch language mid-flow | ☐ | ☐ | |
| 1.12 | Completion redirects to registration | Lands on /mobile page | ☐ | ☐ | |

**Section 1 Score:** ___ / 12

---

## Section 2: Registration Flow

| # | Test Case | Expected Result | Pass | Fail | Notes |
|---|-----------|-----------------|------|------|-------|
| 2.1 | Identity confirmation shows | Clear header and instructions | ☐ | ☐ | |
| 2.2 | Mobile number voice input works | Speaks number, fills input | ☐ | ☐ | |
| 2.3 | Manual number input works | Can type number | ☐ | ☐ | |
| 2.4 | Number validation works (10 digits) | Error for <10 or >10 digits | ☐ | ☐ | |
| 2.5 | OTP request works | OTP sent successfully | ☐ | ☐ | |
| 2.6 | OTP auto-read works (Android) | OTP fills automatically at 6s | ☐ | ☐ | |
| 2.7 | OTP manual input works | Can type OTP | ☐ | ☐ | |
| 2.8 | OTP validation works (6 digits) | Error for !=6 digits | ☐ | ☐ | |
| 2.9 | Profile name voice input works | Speaks name, fills input | ☐ | ☐ | |
| 2.10 | Profile name validation works | Error for empty name | ☐ | ☐ | |
| 2.11 | Completion screen shows | Success message displayed | ☐ | ☐ | |
| 2.12 | Celebration animation plays | Animation visible | ☐ | ☐ | |

**Section 2 Score:** ___ / 12

---

## Section 3: Voice System

| # | Test Case | Expected Result | Pass | Fail | Notes |
|---|-----------|-----------------|------|------|-------|
| 3.1 | Voice prompts clear audio | Clear, understandable TTS | ☐ | ☐ | |
| 3.2 | Voice recognition accurate | STT transcribes correctly | ☐ | ☐ | |
| 3.3 | Ambient noise detection works | Detects loud environments | ☐ | ☐ | |
| 3.4 | Keyboard fallback after 3 errors | Shows keyboard option | ☐ | ☐ | |
| 3.5 | Voice timeouts correct (8s/12s) | Numbers: 8s, Names: 12s | ☐ | ☐ | |
| 3.6 | Intent detection accurate | Yes/No recognized correctly | ☐ | ☐ | |
| 3.7 | Number word mapping works | Hindi/Bhojpuri/Maithili → digits | ☐ | ☐ | |
| 3.8 | Name capitalization works | "ramesh" → "Ramesh" | ☐ | ☐ | |

**Section 3 Score:** ___ / 8

---

## Section 4: Error Handling

| # | Test Case | Expected Result | Pass | Fail | Notes |
|---|-----------|-----------------|------|------|-------|
| 4.1 | Network loss shows amber banner | Banner appears on disconnect | ☐ | ☐ | |
| 4.2 | Network restore shows green banner | Banner appears on reconnect | ☐ | ☐ | |
| 4.3 | Session timeout shows sheet | Sheet appears after 30 min | ☐ | ☐ | |
| 4.4 | Session resume works | Can continue from timeout | ☐ | ☐ | |
| 4.5 | Browser back/forward works | Navigation preserved | ☐ | ☐ | |
| 4.6 | Tab close/reopen preserves state | Data restored from session | ☐ | ☐ | |
| 4.7 | Invalid inputs show errors | Clear error messages | ☐ | ☐ | |
| 4.8 | Error messages in Hindi | Hindi text for errors | ☐ | ☐ | |

**Section 4 Score:** ___ / 8

---

## Section 5: Accessibility

| # | Test Case | Expected Result | Pass | Fail | Notes |
|---|-----------|-----------------|------|------|-------|
| 5.1 | All touch targets ≥52px | Meets minimum size | ☐ | ☐ | |
| 5.2 | All inputs have labels | Labels visible or aria-label | ☐ | ☐ | |
| 5.3 | All buttons have aria-labels | Screen reader friendly | ☐ | ☐ | |
| 5.4 | Keyboard navigation works | Tab through all elements | ☐ | ☐ | |
| 5.5 | Screen reader friendly | Proper ARIA attributes | ☐ | ☐ | |
| 5.6 | Color contrast meets WCAG AA | Contrast ratio ≥4.5:1 | ☐ | ☐ | |
| 5.7 | Focus indicators visible | Clear focus rings | ☐ | ☐ | |
| 5.8 | Text resizable to 200% | No overflow or clipping | ☐ | ☐ | |

**Section 5 Score:** ___ / 8

---

## Summary

| Section | Score | Total | Percentage |
|---------|-------|-------|------------|
| Part 0 Onboarding | ___ | 12 | ___% |
| Registration Flow | ___ | 12 | ___% |
| Voice System | ___ | 8 | ___% |
| Error Handling | ___ | 8 | ___% |
| Accessibility | ___ | 8 | ___% |
| **TOTAL** | **___** | **48** | **___%** |

**Pass Rate Target:** 95%  
**Actual Pass Rate:** ___%  
**Status:** ☐ Pass ☐ Fail

---

## Bugs Found

| ID | Severity | Description | Section |
|----|----------|-------------|---------|
| | | | |
| | | | |
| | | | |

---

## Sign-off

**Tester Signature:** ___________  
**Date:** ___________  
**QA Lead Approval:** ___________  
**Date:** ___________
