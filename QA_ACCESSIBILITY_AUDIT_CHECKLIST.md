# Accessibility Audit Checklist (WCAG 2.1 AA) - HmarePanditJi

**Document Version:** 1.0  
**Created:** March 26, 2026  
**QA Lead:** [To Be Assigned]  
**Audit Date:** April 13, 2026 (Day 4)  
**Standard:** WCAG 2.1 Level AA

---

## WCAG 2.1 AA Overview

### Four Principles (POUR)
1. **Perceivable** - Information must be presentable to users in ways they can perceive
2. **Operable** - UI components must be operable by all users
3. **Understandable** - Information and operation must be clear
4. **Robust** - Content must be robust enough for various assistive technologies

### Conformance Levels
- **Level A** - Minimum accessibility (25 criteria)
- **Level AA** - Mid-range accessibility (13 criteria) ← **Target**
- **Level AAA** - Highest accessibility (23 criteria)

---

## Automated Accessibility Scans

### Tools Used
- [ ] axe DevTools (Chrome Extension)
- [ ] WAVE (Web Accessibility Evaluation Tool)
- [ ] Lighthouse Accessibility Score
- [ ] Pa11y CLI
- [ ] Accessibility Insights for Web

### Scan Results Summary

| Tool | Date | Score | Issues Found | Critical | Serious | Moderate | Minor |
|------|------|-------|--------------|----------|---------|------------|-------|
| axe DevTools | | N/A | 0 | 0 | 0 | 0 | 0 |
| WAVE | | N/A | 0 | 0 | 0 | 0 | 0 |
| Lighthouse | | 0 | 0 | 0 | 0 | 0 | 0 |
| Pa11y CLI | | N/A | 0 | 0 | 0 | 0 | 0 |

---

## WCAG 2.1 AA Success Criteria Checklist

### Principle 1: Perceivable

#### 1.1 Text Alternatives (Level A)
| Criterion | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| 1.1.1 Non-text Content | All images have alt text | ⬜ Pass / ⬜ Fail | |

**Test Method:**
- [ ] All `<img>` tags have `alt` attribute
- [ ] Decorative images have `alt=""`
- [ ] Informative images have descriptive alt text
- [ ] Icons have `aria-label` or `aria-hidden`

**Screens Tested:**
| Screen | All Images Have Alt | Status |
|--------|---------------------|--------|
| S-0.0.1 Splash | ⬜ Yes / ⬜ No | |
| S-0.0.2 Location | ⬜ Yes / ⬜ No | |
| S-0.0.3 Language | ⬜ Yes / ⬜ No | |
| S-0.1 to S-0.12 Tutorial | ⬜ Yes / ⬜ No | |
| S-1.1 to S-1.9 Registration | ⬜ Yes / ⬜ No | |

---

#### 1.2 Time-based Media (Level A)
| Criterion | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| 1.2.1 Audio-only/Video-only | Alternatives provided | ⬜ Pass / ⬜ Fail / ⬜ N/A | Voice is primary |
| 1.2.2 Captions | Video content has captions | ⬜ Pass / ⬜ Fail / ⬜ N/A | No video content |
| 1.2.3 Audio Description | Video has audio description | ⬜ Pass / ⬜ Fail / ⬜ N/A | No video content |

**Notes:** App is voice-first, so time-based media criteria may not apply directly.

---

#### 1.3 Adaptable (Level A)
| Criterion | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| 1.3.1 Info and Relationships | Structure conveyed programmatically | ⬜ Pass / ⬜ Fail | |
| 1.3.2 Meaningful Sequence | Reading sequence is correct | ⬜ Pass / ⬜ Fail | |
| 1.3.3 Sensory Characteristics | Not relying solely on shape/size/color | ⬜ Pass / ⬜ Fail | |

**Test Method:**
- [ ] Headings use proper hierarchy (`<h1>` to `<h6>`)
- [ ] Lists use `<ul>`, `<ol>`, `<li>`
- [ ] Tables use `<th>` for headers
- [ ] Forms have associated labels
- [ ] Screen reader reads content in logical order

**Screens Tested:**
| Screen | 1.3.1 | 1.3.2 | 1.3.3 | Status |
|--------|-------|-------|-------|--------|
| S-0.0.1 Splash | ⬜ | ⬜ | ⬜ | |
| S-0.0.2 Location | ⬜ | ⬜ | ⬜ | |
| S-0.0.3 Language | ⬜ | ⬜ | ⬜ | |
| S-0.1 to S-0.12 Tutorial | ⬜ | ⬜ | ⬜ | |
| S-1.1 to S-1.9 Registration | ⬜ | ⬜ | ⬜ | |

---

#### 1.4 Distinguishable (Level AA)
| Criterion | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| 1.4.1 Use of Color | Color not only means of conveying info | ⬜ Pass / ⬜ Fail | |
| 1.4.2 Audio Control | Audio can be paused/controlled | ⬜ Pass / ⬜ Fail | |
| 1.4.3 Contrast (Minimum) | Text contrast ratio ≥4.5:1 | ⬜ Pass / ⬜ Fail | **Critical** |
| 1.4.4 Resize Text | Text resizable up to 200% | ⬜ Pass / ⬜ Fail | |
| 1.4.5 Images of Text | Text used instead of images | ⬜ Pass / ⬜ Fail | |
| 1.4.10 Reflow | No horizontal scrolling at 320px | ⬜ Pass / ⬜ Fail | |
| 1.4.11 Non-text Contrast | UI components contrast ≥3:1 | ⬜ Pass / ⬜ Fail | |
| 1.4.12 Text Spacing | Text spacing adjustable | ⬜ Pass / ⬜ Fail | |
| 1.4.13 Content on Hover/Focus | Hover/focus content dismissible | ⬜ Pass / ⬜ Fail | |

**Color Contrast Testing:**

| Element | Foreground | Background | Required Ratio | Actual Ratio | Status |
|---------|------------|------------|----------------|--------------|--------|
| Body Text | #000000 | #FFFFFF | 4.5:1 | | ⬜ Pass / ⬜ Fail |
| CTA Button Text | #FFFFFF | #FF9933 | 4.5:1 | | ⬜ Pass / ⬜ Fail |
| Skip Button Text | #000000 | #FFFFFF | 4.5:1 | | ⬜ Pass / ⬜ Fail |
| Link Text | #FF9933 | #FFFFFF | 4.5:1 | | ⬜ Pass / ⬜ Fail |
| Error Message | #FF0000 | #FFFFFF | 4.5:1 | | ⬜ Pass / ⬜ Fail |
| Success Message | #00AA00 | #FFFFFF | 4.5:1 | | ⬜ Pass / ⬜ Fail |
| Placeholder Text | #999999 | #FFFFFF | 4.5:1 | | ⬜ Pass / ⬜ Fail |
| Progress Dots (active) | #FF9933 | #FFFFFF | 3:1 | | ⬜ Pass / ⬜ Fail |
| Progress Dots (inactive) | #CCCCCC | #FFFFFF | 3:1 | | ⬜ Pass / ⬜ Fail |
| Voice Indicator | #FF9933 | #FFFFFF | 3:1 | | ⬜ Pass / ⬜ Fail |

**Tools for Contrast Testing:**
- [ ] WebAIM Contrast Checker (https://webaim.org/resources/contrastchecker/)
- [ ] Colour Contrast Analyser (CCA)
- [ ] axe DevTools

---

### Principle 2: Operable

#### 2.1 Keyboard Accessible (Level A)
| Criterion | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| 2.1.1 Keyboard | All functionality via keyboard | ⬜ Pass / ⬜ Fail | **Critical** |
| 2.1.2 No Keyboard Trap | Focus can be moved away | ⬜ Pass / ⬜ Fail | |

**Test Method:**
- [ ] Tab key moves focus forward
- [ ] Shift+Tab moves focus backward
- [ ] Enter activates buttons/links
- [ ] Space activates checkboxes/buttons
- [ ] Escape closes modals/overlays
- [ ] Arrow keys navigate within components
- [ ] No keyboard traps (focus stuck)

**Keyboard Navigation Test:**

| Screen | Tab Order Correct | All Interactive | Enter Works | Escape Works | Status |
|--------|-------------------|-----------------|-------------|--------------|--------|
| S-0.0.1 Splash | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-0.0.2 Location | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-0.0.3 Language | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-0.1 Tutorial | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-0.2 Tutorial | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-0.3 Tutorial | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-0.4 Tutorial | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-0.5 Tutorial | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-0.6 Tutorial | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-0.7 Tutorial | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-0.8 Tutorial | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-0.9 Tutorial | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-0.10 Tutorial | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-0.11 Tutorial | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-0.12 Tutorial | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-1.1 Mobile | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-1.2 OTP | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-1.3 Name | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-1.4 Gotra | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-1.5 Specialization | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-1.6 Experience | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-1.7 Photo | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-1.8 Bank | ⬜ | ⬜ | ⬜ | ⬜ | |
| S-1.9 Complete | ⬜ | ⬜ | ⬜ | ⬜ | |

---

#### 2.2 Enough Time (Level A)
| Criterion | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| 2.2.1 Timing Adjustable | Users can extend time limits | ⬜ Pass / ⬜ Fail / ⬜ N/A | |
| 2.2.2 Pause, Stop, Hide | Moving content can be paused | ⬜ Pass / ⬜ Fail | |

**Test Method:**
- [ ] Auto-advancing carousels can be paused
- [ ] Animations can be reduced (prefers-reduced-motion)
- [ ] No time limits on form completion
- [ ] Session expiry warnings with extension option

**Note:** Voice confirmation has 15s countdown - ensure user can extend.

---

#### 2.3 Seizures and Physical Reactions (Level A)
| Criterion | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| 2.3.1 Three Flashes | No content flashes >3 times/sec | ⬜ Pass / ⬜ Fail | |
| 2.3.2 Animation from Interactions | Motion can be disabled | ⬜ Pass / ⬜ Fail | |

**Test Method:**
- [ ] No animations flash more than 3 times per second
- [ ] Confetti animation respects prefers-reduced-motion
- [ ] Pulsing animations can be disabled

**prefers-reduced-motion Test:**
```css
/* Test in Chrome DevTools */
/* Rendering → Emulate CSS preferences → prefers-reduced-motion: reduce */
```

| Animation | Respects Reduced Motion | Status |
|-----------|------------------------|--------|
| Splash screen fade | ⬜ Yes / ⬜ No | |
| Confetti | ⬜ Yes / ⬜ No | |
| Voice indicator pulse | ⬜ Yes / ⬜ No | |
| Progress dot animation | ⬜ Yes / ⬜ No | |
| Button hover effects | ⬜ Yes / ⬜ No | |
| Screen transitions | ⬜ Yes / ⬜ No | |

---

#### 2.4 Navigable (Level AA)
| Criterion | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| 2.4.1 Bypass Blocks | Skip to main content link | ⬜ Pass / ⬜ Fail | |
| 2.4.2 Page Titled | Pages have descriptive titles | ⬜ Pass / ⬜ Fail | |
| 2.4.3 Focus Order | Focus order is logical | ⬜ Pass / ⬜ Fail | |
| 2.4.4 Link Purpose | Link purpose clear from text | ⬜ Pass / ⬜ Fail | |
| 2.4.5 Multiple Ways | Multiple ways to find pages | ⬜ Pass / ⬜ Fail / ⬜ N/A | |
| 2.4.6 Headings and Labels | Headings/labels descriptive | ⬜ Pass / ⬜ Fail | |
| 2.4.7 Focus Visible | Focus indicator visible | ⬜ Pass / ⬜ Fail | **Critical** |

**Focus Indicator Test:**

| Element | Focus Visible | Focus Style | Status |
|---------|---------------|-------------|--------|
| CTA Button | ⬜ Yes | outline: ___ | |
| Skip Button | ⬜ Yes | outline: ___ | |
| Back Button | ⬜ Yes | outline: ___ | |
| Language Tiles | ⬜ Yes | outline: ___ | |
| Input Fields | ⬜ Yes | outline: ___ | |
| Mic Button | ⬜ Yes | outline: ___ | |
| Checkboxes | ⬜ Yes | outline: ___ | |
| Radio Buttons | ⬜ Yes | outline: ___ | |

---

#### 2.5 Input Modalities (Level AA)
| Criterion | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| 2.5.1 Pointer Gestures | No complex gestures required | ⬜ Pass / ⬜ Fail | |
| 2.5.2 Pointer Cancellation | Actions can be cancelled | ⬜ Pass / ⬜ Fail | |
| 2.5.3 Label in Name | Accessible name starts with visible label | ⬜ Pass / ⬜ Fail | |
| 2.5.4 Motion Actuation | Motion not required for input | ⬜ Pass / ⬜ Fail | |
| 2.5.5 Target Size | Touch targets ≥44×44px (ideally 72px) | ⬜ Pass / ⬜ Fail | **Critical** |

**Touch Target Measurements:**

| Element | Minimum Required | Actual Size | Status |
|---------|-----------------|-------------|--------|
| CTA Button | 72px × 48px | ___ × ___ px | ⬜ Pass / ⬜ Fail |
| Skip Button | 72px × 72px | ___ × ___ px | ⬜ Pass / ⬜ Fail |
| Back Button | 48px × 48px | ___ × ___ px | ⬜ Pass / ⬜ Fail |
| Language Tiles | 72px × 48px | ___ × ___ px | ⬜ Pass / ⬜ Fail |
| Mic Button | 72px × 72px | ___ × ___ px | ⬜ Pass / ⬜ Fail |
| Input Fields | 48px height | ___ px | ⬜ Pass / ⬜ Fail |
| Checkboxes | 48px × 48px | ___ × ___ px | ⬜ Pass / ⬜ Fail |
| Radio Buttons | 48px × 48px | ___ × ___ px | ⬜ Pass / ⬜ Fail |
| Next/Back (Tutorial) | 72px × 48px | ___ × ___ px | ⬜ Pass / ⬜ Fail |

---

### Principle 3: Understandable

#### 3.1 Readable (Level A)
| Criterion | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| 3.1.1 Language of Page | Page language declared | ⬜ Pass / ⬜ Fail | |
| 3.1.2 Language of Parts | Language changes marked | ⬜ Pass / ⬜ Fail | |

**Test Method:**
- [ ] `<html lang="hi">` or appropriate language
- [ ] Language changes marked with `lang` attribute
- [ ] Roman transliterations marked appropriately

---

#### 3.2 Predictable (Level AA)
| Criterion | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| 3.2.1 On Focus | No context change on focus | ⬜ Pass / ⬜ Fail | |
| 3.2.2 On Input | No context change on input | ⬜ Pass / ⬜ Fail | |
| 3.2.3 Consistent Navigation | Navigation consistent | ⬜ Pass / ⬜ Fail | |
| 3.2.4 Consistent Identification | Same function = same ID | ⬜ Pass / ⬜ Fail | |

---

#### 3.3 Input Assistance (Level AA)
| Criterion | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| 3.3.1 Error Identification | Errors clearly identified | ⬜ Pass / ⬜ Fail | |
| 3.3.2 Labels or Instructions | Labels provided for input | ⬜ Pass / ⬜ Fail | |
| 3.3.3 Error Suggestion | Error suggestions provided | ⬜ Pass / ⬜ Fail | |
| 3.3.4 Error Prevention (Legal/Financial) | Submission reversible | ⬜ Pass / ⬜ Fail / ⬜ N/A | |

**Form Error Testing:**

| Form | Error Identified | Label Present | Suggestion Provided | Status |
|------|-----------------|---------------|---------------------|--------|
| Mobile Number | ⬜ | ⬜ | ⬜ | |
| OTP | ⬜ | ⬜ | ⬜ | |
| Name | ⬜ | ⬜ | ⬜ | |
| Gotra | ⬜ | ⬜ | ⬜ | |
| Bank Details | ⬜ | ⬜ | ⬜ | |

---

### Principle 4: Robust

#### 4.1 Compatible (Level AA)
| Criterion | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| 4.1.1 Parsing | Valid HTML, no duplicate IDs | ⬜ Pass / ⬜ Fail | |
| 4.1.2 Name, Role, Value | ARIA used correctly | ⬜ Pass / ⬜ Fail | **Critical** |
| 4.1.3 Status Messages | Status messages announced | ⬜ Pass / ⬜ Fail | |

**ARIA Testing:**

| Component | aria-label | aria-live | role | Status |
|-----------|------------|-----------|------|--------|
| Voice Indicator | ⬜ | ⬜ | status | |
| Mic Button | ⬜ | N/A | button | |
| Progress Dots | ⬜ | N/A | tablist | |
| Error Overlay | ⬜ | ⬜ | alert | |
| Confirmation Sheet | ⬜ | ⬜ | dialog | |
| Network Banner | ⬜ | ⬜ | status | |
| Celebration Overlay | ⬜ | ⬜ | status | |

---

## Screen Reader Testing

### TalkBack (Android)

| Test ID | Test | Expected Result | Status |
|---------|------|-----------------|--------|
| TB-01 | Enable TalkBack | TalkBack announces elements | ⬜ Pass / ⬜ Fail |
| TB-02 | Navigate by touch | Elements announced on touch | ⬜ Pass / ⬜ Fail |
| TB-03 | Navigate by swipe | Swipe moves focus logically | ⬜ Pass / ⬜ Fail |
| TB-04 | Activate buttons | Double-tap activates | ⬜ Pass / ⬜ Fail |
| TB-05 | Form labels | Labels announced with fields | ⬜ Pass / ⬜ Fail |
| TB-06 | Error messages | Errors announced immediately | ⬜ Pass / ⬜ Fail |
| TB-07 | Voice indicator | Status announced | ⬜ Pass / ⬜ Fail |
| TB-08 | Images | Alt text read | ⬜ Pass / ⬜ Fail |
| TB-09 | Language changes | Language announced | ⬜ Pass / ⬜ Fail |
| TB-10 | Keyboard | Keyboard shortcuts work | ⬜ Pass / ⬜ Fail |

### VoiceOver (iOS)

| Test ID | Test | Expected Result | Status |
|---------|------|-----------------|--------|
| VO-01 | Enable VoiceOver | VoiceOver announces elements | ⬜ Pass / ⬜ Fail |
| VO-02 | Navigate by touch | Elements announced on touch | ⬜ Pass / ⬜ Fail |
| VO-03 | Navigate by swipe | Swipe moves focus logically | ⬜ Pass / ⬜ Fail |
| VO-04 | Activate buttons | Double-tap activates | ⬜ Pass / ⬜ Fail |
| VO-05 | Form labels | Labels announced with fields | ⬜ Pass / ⬜ Fail |
| VO-06 | Error messages | Errors announced immediately | ⬜ Pass / ⬜ Fail |
| VO-07 | Voice indicator | Status announced | ⬜ Pass / ⬜ Fail |
| VO-08 | Images | Alt text read | ⬜ Pass / ⬜ Fail |
| VO-09 | Language changes | Language announced | ⬜ Pass / ⬜ Fail |
| VO-10 | Rotor | Rotor navigation works | ⬜ Pass / ⬜ Fail |

---

## Accessibility Issues Log

| Issue ID | Criterion | Screen | Description | Severity | Status |
|----------|-----------|--------|-------------|----------|--------|
| A11Y-01 | | | | P0 / P1 / P2 / P3 | ⬜ Open |
| A11Y-02 | | | | P0 / P1 / P2 / P3 | ⬜ Open |
| A11Y-03 | | | | P0 / P1 / P2 / P3 | ⬜ Open |

---

## Accessibility Sign-off

### Compliance Summary

| Principle | Criteria Tested | Passed | Failed | N/A | Compliance |
|-----------|-----------------|--------|--------|-----|------------|
| 1. Perceivable | 0 | 0 | 0 | 0 | 0% |
| 2. Operable | 0 | 0 | 0 | 0 | 0% |
| 3. Understandable | 0 | 0 | 0 | 0 | 0% |
| 4. Robust | 0 | 0 | 0 | 0 | 0% |
| **Total** | **0** | **0** | **0** | **0** | **0%** |

### WCAG 2.1 AA Compliance

- [ ] All Level A criteria met
- [ ] All Level AA criteria met
- [ ] No critical accessibility blockers
- [ ] Screen reader testing passed
- [ ] Keyboard navigation passed
- [ ] Color contrast passed

### Overall Status

⬜ **WCAG 2.1 AA Compliant**  
⬜ **Not Compliant** (___ criteria failed)

---

### QA Lead Approval

**Name:** ________________________  
**Date:** ________________________  
**Signature:** ________________________

---

**Last Updated:** March 26, 2026
