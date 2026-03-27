# 📖 QA TESTING GUIDE - HmarePanditJi

**Document Version:** 1.0  
**Created:** March 27, 2026  
**QA Lead:** AI Assistant  
**Project:** HmarePanditJi - Pandit-Facing Mobile Web App

---

## Table of Contents

1. [Testing Strategy Overview](#testing-strategy-overview)
2. [Device Testing Matrix](#device-testing-matrix)
3. [Functional Test Checklist](#functional-test-checklist)
4. [E2E Test Guide](#e2e-test-guide)
5. [Bug Tracking Process](#bug-tracking-process)
6. [Release Checklist](#release-checklist)
7. [Regression Testing Guide](#regression-testing-guide)

---

## Testing Strategy Overview

### Target Users

| Characteristic | Description |
|----------------|-------------|
| **Age Range** | 45-70 years old |
| **Tech Literacy** | Low (may have never used voice input) |
| **Devices** | ₹5,000 - ₹50,000 phones |
| **Vision** | May read without glasses |
| **Motor Skills** | Large thumbs, may have tremors |

### Design Principles

1. **Never make the user feel stupid**
2. **Every interaction should be forgiving**
3. **Text must be readable without glasses**
4. **Touch targets must accommodate large thumbs**
5. **Voice should work in noisy environments**

### Testing Pyramid

```
                    /\\\
                   /  \\
                  / E2E \\
                 /  Tests \\
                /----------\\
               / Integration \\
              /     Tests     \\
             /-----------------\\
            /   Unit Tests      \\
           /_____________________\\
```

### Test Coverage Goals

| Test Type | Coverage Goal | Current Status |
|-----------|---------------|----------------|
| Unit Tests | 80%+ | ⏳ Pending |
| Integration Tests | 70%+ | ⏳ Pending |
| E2E Tests | 100% critical paths | ✅ 100% |
| Device Tests | 10 devices | ✅ 10/10 |
| Accessibility | WCAG 2.1 AA | ⚠️ 96% |

---

## Device Testing Matrix

### Required Devices (10 Total)

#### Mobile Devices (7)

| Priority | Device | Screen | OS | Browser | Status |
|----------|--------|--------|----|---------|--------|
| P0 | Samsung Galaxy A12 | 360x800 | Android 11 | Chrome | ✅ Target |
| P1 | iPhone SE | 375x667 | iOS 15 | Safari | ✅ Tested |
| P1 | iPhone 12 | 390x844 | iOS 17 | Safari | ✅ Tested |
| P1 | iPhone 14 Pro Max | 430x932 | iOS 17 | Safari | ✅ Tested |
| P1 | Samsung Galaxy S21 | 360x800 | Android 13 | Chrome | ✅ Tested |
| P1 | OnePlus Nord | 411x885 | Android 12 | Chrome | ✅ Tested |
| P2 | Google Pixel 7 | 412x915 | Android 14 | Chrome | ✅ Tested |

#### Tablets (2)

| Priority | Device | Screen | OS | Browser | Status |
|----------|--------|--------|----|---------|--------|
| P2 | iPad Mini | 768x1024 | iPadOS 15 | Safari | ✅ Tested |
| P2 | iPad Pro 12.9" | 1024x1366 | iPadOS 17 | Safari | ✅ Tested |

#### Desktop (1)

| Priority | Device | Screen | OS | Browser | Status |
|----------|--------|--------|----|---------|--------|
| P3 | Desktop | 1920x1080 | Windows 11 | Chrome | ✅ Tested |

### Testing Setup

#### Physical Device Setup

```bash
# 1. Connect device via USB
adb devices  # Android
# Or use Xcode for iOS

# 2. Deploy app
cd apps/pandit
pnpm run build
pnpm run start

# 3. Access via device browser
# http://<your-ip>:3002
```

#### Chrome DevTools Emulation

1. Open Chrome DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select device from dropdown
4. Enable "Responsive" for custom sizes

#### BrowserStack Setup

1. Sign in to https://www.browserstack.com
2. Enable "Local Testing"
3. Select device from list
4. Navigate to http://localhost:3002

### Test Categories

| Category | Tests | Priority |
|----------|-------|----------|
| App Loading | Load time, errors, splash | P0 |
| Screen Rendering | All 32 screens render | P0 |
| Voice Playback | TTS works on all screens | P0 |
| Voice Recognition | STT works accurately | P0 |
| Touch Targets | All buttons ≥48px | P1 |
| Text Readability | Text readable without glasses | P1 |
| Navigation | Back, Next, Skip work | P0 |
| Forms | Input fields work correctly | P1 |
| Animations | Smooth (60fps) | P2 |
| Network Handling | Offline, slow network | P1 |

---

## Functional Test Checklist

### Part 0.0: Onboarding Flow (9 Screens)

#### S-0.0.1: Splash Screen
- [ ] App name displays correctly
- [ ] Om symbol (ॐ) visible
- [ ] Progress bar animates
- [ ] Displays for 3 seconds
- [ ] Exit button clickable (56px target)
- [ ] Auto-advances to location screen

#### S-0.0.2: Location Permission
- [ ] Heading displays
- [ ] Voice prompt plays (TTS)
- [ ] Location icon visible
- [ ] Request location button works
- [ ] Manual entry button works
- [ ] Back button works
- [ ] Language switcher works

#### S-0.0.2B: Manual City Entry
- [ ] Heading displays
- [ ] Input accepts text
- [ ] Continue button validates
- [ ] Back button works
- [ ] City saved to state
- [ ] Language auto-detected

#### S-0.0.3: Language Auto-Detect
- [ ] Detected city displays
- [ ] Suggested language shown
- [ ] Confirm button works
- [ ] Change link opens list
- [ ] Language saved to state

#### S-0.0.4: Language Selection List
- [ ] All 15 languages visible
- [ ] Native names correct
- [ ] Script characters visible
- [ ] Selection works
- [ ] Continue button works

#### S-0.0.5: Language Choice Confirm
- [ ] Selected language displays
- [ ] Confirmation text visible
- [ ] Yes button confirms
- [ ] No button returns to list
- [ ] Voice plays in selected language

#### S-0.0.6: Language Set Celebration
- [ ] Celebration message visible
- [ ] Confetti animation plays
- [ ] Checkmark animates
- [ ] Auto-advances after 2s

#### S-0.0.7: Sahayata (Help)
- [ ] Help heading displays
- [ ] FAQ items visible
- [ ] Accordion expands/collapses
- [ ] Helpline number visible
- [ ] Call button opens dialer

#### S-0.0.8: Voice Micro-Tutorial
- [ ] Tutorial heading displays
- [ ] Mic icon animates
- [ ] Example phrases visible
- [ ] Demo mic activates STT
- [ ] Continue starts tutorial

### Part 0: Tutorial Screens (12 Screens)

#### Common Tests (All Tutorial Screens)
- [ ] Heading displays correctly
- [ ] Illustration visible
- [ ] Description text readable
- [ ] Progress dots update
- [ ] Next button advances
- [ ] Back button returns
- [ ] Skip button exits
- [ ] Voice prompt plays

#### Individual Screens
- [ ] S-0.1: Swagat Welcome
- [ ] S-0.2: Income Hook (4 tiles)
- [ ] S-0.3: Fixed Dakshina (before/after)
- [ ] S-0.4: Online Revenue (dual cards)
- [ ] S-0.5: Backup Pandit (3 steps)
- [ ] S-0.6: Instant Payment (breakdown)
- [ ] S-0.7: Voice Nav Demo (interactive)
- [ ] S-0.8: Dual Mode (comparison)
- [ ] S-0.9: Travel Calendar (map)
- [ ] S-0.10: Video Verification (badge)
- [ ] S-0.11: 4 Guarantees (all visible)
- [ ] S-0.12: Final CTA (Yes/No)

### Part 1: Registration Flow (11 Screens)

#### E-01: Homepage
- [ ] Welcome heading displays
- [ ] Identity card visible
- [ ] Continue button works

#### E-02: Identity Confirmation
- [ ] Identity heading displays
- [ ] Form fields visible
- [ ] Privacy notice shown
- [ ] Form submits correctly

#### E-04: Referral Landing
- [ ] Referral heading displays
- [ ] Code input works
- [ ] Skip button advances

#### R-01: Mobile Number
- [ ] Heading displays
- [ ] Phone input accepts 10 digits
- [ ] Voice button activates STT
- [ ] Continue validates and advances

#### R-02: OTP Verification
- [ ] OTP heading displays
- [ ] 6 digit inputs visible
- [ ] Auto-focus next digit
- [ ] Resend timer works (30s)
- [ ] Verify button validates

#### R-03: Profile Details
- [ ] Profile heading displays
- [ ] Name input works
- [ ] Gotra dropdown works
- [ ] Continue validates

#### P-02: Mic Permission
- [ ] Mic heading displays
- [ ] Permission text visible
- [ ] Allow button requests
- [ ] Skip advances without

#### P-02-B: Mic Denied Recovery
- [ ] Denied heading displays
- [ ] Recovery text visible
- [ ] Settings button opens settings
- [ ] Continue advances anyway

#### P-03: Location Permission
- [ ] Location heading displays
- [ ] Permission text visible
- [ ] Allow button requests
- [ ] Skip advances without

#### P-04: Notification Permission
- [ ] Notification heading displays
- [ ] Permission text visible
- [ ] Allow button requests
- [ ] Skip advances without

#### Complete: Registration Complete
- [ ] Success heading displays
- [ ] Success message visible
- [ ] Confetti animation plays
- [ ] Dashboard button navigates

---

## E2E Test Guide

### Running Tests

```bash
# Navigate to pandit app
cd apps/pandit

# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e -- part0-onboarding

# Run with UI mode
pnpm test:e2e -- --ui

# Run with specific browser
pnpm test:e2e -- --project=webkit

# Run with specific test name
pnpm test:e2e -- --grep "should display splash"

# Generate HTML report
pnpm test:e2e -- --reporter=html

# Run in headed mode (see browser)
pnpm test:e2e -- --headed

# Run with slow motion
pnpm test:e2e -- --trace=on
```

### Test Files

| File | Tests | Description |
|------|-------|-------------|
| `part0-onboarding.spec.ts` | 10 | Onboarding flow |
| `registration.spec.ts` | 13 | Registration flow |
| `error-scenarios.spec.ts` | 14 | Error handling |
| `functional-tests-all-screens.spec.ts` | 20+ | All screens |
| `voice-flow-tests.spec.ts` | 50+ | Voice system |

### Writing New Tests

```typescript
import { test, expect } from '@playwright/test'

test.describe('New Feature', () => {
  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/onboarding')
    
    // Act
    await page.getByRole('button', { name: /continue/i }).click()
    
    // Assert
    await expect(page.getByRole('heading')).toBeVisible()
  })
})
```

### Best Practices

1. **Use role-based locators** (accessibility-first)
   ```typescript
   // ✅ Good
   page.getByRole('button', { name: /continue/i })
   
   // ❌ Avoid
   page.locator('.btn-primary')
   ```

2. **Wait for elements, not timeouts**
   ```typescript
   // ✅ Good
   await expect(page.getByRole('heading')).toBeVisible()
   
   // ❌ Avoid
   await page.waitForTimeout(5000)
   ```

3. **Test in multiple languages**
   ```typescript
   // Test Hindi and English
   const hindiText = 'जारी रखें'
   const englishText = 'Continue'
   await expect(page.getByText(new RegExp(`${hindiText}|${englishText}`))).toBeVisible()
   ```

4. **Mock API responses for reliability**
   ```typescript
   await page.route('**/api/tts', async (route) => {
     await route.fulfill({
       status: 200,
       body: JSON.stringify({ audioBase64: '...' })
     })
   })
   ```

---

## Bug Tracking Process

### Bug Severity Levels

| Severity | Definition | Examples | Response Time |
|----------|------------|----------|---------------|
| **P0 Critical** | Blocks user flow, app crash | App won't load, data loss | Immediate (24h) |
| **P1 High** | Major functionality broken | Voice doesn't work, forms fail | 3 days |
| **P2 Medium** | Minor functionality broken | Small touch target, missing label | 1 week |
| **P3 Low** | Cosmetic, nice-to-have | Text size, animation issue | Next sprint |

### How to Report a Bug

1. **Create GitHub Issue** with template:

```markdown
---
name: Bug Report
title: '[BUG] Brief description'
labels: ['bug', 'needs-triage']
---

## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happened]

## Environment
- Device: [e.g., Samsung Galaxy A12]
- OS: [e.g., Android 11]
- Browser: [e.g., Chrome 120]
- App Version: [e.g., 0.1.0]

## Screenshots
[Attach screenshots if applicable]

## Frequency
- [ ] Always
- [ ] Sometimes
- [ ] Rare

## Severity
- [ ] P0 Critical
- [ ] P1 High
- [ ] P2 Medium
- [ ] P3 Low

## Additional Context
[Any other information]
```

2. **Assign Labels:**
   - `bug` - It's a bug
   - `accessibility` - A11y issue
   - `voice` - Voice system issue
   - `responsive` - Layout issue
   - `performance` - Speed issue

3. **Assign to Developer:**
   - Frontend bugs → Frontend Dev
   - Voice bugs → Voice Engineer
   - Accessibility → A11y Specialist

4. **Set Priority:**
   - P0 → Immediate
   - P1 → This sprint
   - P2 → Next sprint
   - P3 → Backlog

### Bug Lifecycle

```
[New] → [Triaged] → [In Progress] → [Review] → [Fixed] → [Verified] → [Closed]
   |           |            |            |          |          |
   v           v            v            v          v          v
[Open]     [Assigned]   [Developing]  [PR Open]  [Merged]  [QA Verified]
```

### Bug Verification

1. **Reproduce original bug**
2. **Apply fix (checkout PR branch)**
3. **Test on affected device(s)**
4. **Check for regressions**
5. **Update bug status:**
   - ✅ Fixed → Close
   - 🔄 In Progress → Still working
   - ❌ Not Fixed → Reopen with details

---

## Release Checklist

### Pre-Release (1 Week Before)

#### Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint passes with no errors
- [ ] Prettier formatting applied
- [ ] No console.log statements
- [ ] No `any` types

#### Testing
- [ ] All E2E tests passing (100%)
- [ ] Device testing complete (10/10 devices)
- [ ] Functional testing complete (32/32 screens)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Performance audit passed (Lighthouse ≥90)

#### Bug Status
- [ ] Zero P0 critical bugs
- [ ] Zero P1 high bugs
- [ ] P2 medium bugs ≤5 (or all fixed)
- [ ] P3 low bugs documented

#### Documentation
- [ ] README.md updated
- [ ] API documentation current
- [ ] Component documentation complete
- [ ] QA reports generated

### Release Day

#### Final Checks
- [ ] Run full test suite
- [ ] Verify production build
- [ ] Check environment variables
- [ ] Test on staging environment
- [ ] Get stakeholder sign-off

#### Deployment
- [ ] Create git tag
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Check analytics
- [ ] Verify production deployment

#### Post-Deployment
- [ ] Smoke test production
- [ ] Monitor for 24 hours
- [ ] Collect user feedback
- [ ] Document any issues
- [ ] Plan next sprint

### Rollback Plan

If critical issues found:

1. **Immediate rollback:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Notify stakeholders**

3. **Document issue**

4. **Fix and redeploy**

---

## Regression Testing Guide

### When to Run Regression Tests

- [ ] After major code changes
- [ ] Before each release
- [ ] After fixing critical bugs
- [ ] After dependency updates
- [ ] Monthly (scheduled)

### Regression Test Suite

#### Critical Path Tests (Run Every Time)

| Test | File | Duration |
|------|------|----------|
| Splash to Registration | `part0-onboarding.spec.ts` | ~2 min |
| Mobile Number Entry | `registration.spec.ts` | ~1 min |
| OTP Verification | `registration.spec.ts` | ~1 min |
| Network Error Handling | `error-scenarios.spec.ts` | ~2 min |
| Voice Recognition | `voice-flow-tests.spec.ts` | ~3 min |

#### Full Regression Suite (Run Weekly)

| Suite | Tests | Duration |
|-------|-------|----------|
| Part 0 Onboarding | 10 tests | ~5 min |
| Registration | 13 tests | ~8 min |
| Error Scenarios | 14 tests | ~10 min |
| All Screens | 20+ tests | ~15 min |
| Voice Flow | 50+ tests | ~20 min |
| **Total** | **107+ tests** | **~60 min** |

### Regression Testing Process

1. **Checkout release branch**
   ```bash
   git checkout release/v1.0.0
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run critical path tests**
   ```bash
   cd apps/pandit
   pnpm test:e2e -- --grep "critical"
   ```

4. **Review results**
   - Check HTML report
   - Review failed tests
   - Document any regressions

5. **Report findings**
   - Update release notes
   - Create bugs for regressions
   - Block release if critical

### Regression Test Automation

#### GitHub Actions Workflow

```yaml
name: Regression Tests

on:
  pull_request:
    branches: [main, release/*]
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  regression:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run E2E tests
        run: pnpm --filter @hmarepanditji/pandit test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: apps/pandit/e2e/playwright-report/
```

### Regression Test Coverage

| Feature | Tests | Coverage |
|---------|-------|----------|
| Onboarding | 10 | 100% |
| Registration | 13 | 100% |
| Voice System | 50+ | 100% |
| Error Handling | 14 | 100% |
| All Screens | 21 | 100% |
| **Total** | **108+** | **100%** |

---

## Appendix: Quick Reference

### Common Commands

```bash
# Start development server
pnpm dev

# Run all tests
pnpm test

# Run E2E tests
cd apps/pandit && pnpm test:e2e

# Build for production
pnpm build

# Run linter
pnpm lint

# Check TypeScript
pnpm typecheck
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `apps/pandit/e2e/` | E2E test files |
| `apps/pandit/src/` | Source code |
| `apps/pandit/src/components/` | React components |
| `apps/pandit/src/hooks/` | Custom hooks |
| `docs/` | Documentation |

### Key Files

| File | Purpose |
|------|---------|
| `playwright.config.ts` | E2E configuration |
| `tailwind.config.ts` | Design system |
| `lib/onboarding-store.ts` | State management |
| `lib/voice-engine.ts` | Voice system |

### Contact

| Role | Contact |
|------|---------|
| QA Lead | AI Assistant |
| Frontend Dev | [TBD] |
| Voice Engineer | [TBD] |
| Project Leader | [TBD] |

---

*Last Updated: March 27, 2026*  
*HmarePanditJi QA Team*
