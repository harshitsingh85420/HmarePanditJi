# 🧪 QA Test Engineer Execution Playbook
## HmarePanditJi - Voice-First App for Hindu Priests

**Document Version:** 2.0  
**Created:** March 27, 2026  
**Role:** QA/Test Engineer (Role 5)  
**Timeline:** 4 Weeks (Week 1-4)  
**Budget:** ₹25,000  
**Location:** Remote (IST Timezone)  

---

## 📋 Quick Reference

| Item | Details |
|------|---------|
| **Project URL** | http://localhost:3002 (dev) |
| **Staging URL** | [TBD] |
| **Production URL** | https://hmarepanditji.com |
| **GitHub** | github.com/ss7706/HmarePanditJi |
| **Slack** | `#hmarepanditji-qa` |
| **Working Hours** | 10 AM - 7 PM IST |
| **Daily Standup** | 10:30 AM IST |
| **Report To** | Senior Frontend Lead |

---

## 🎯 Your Mission

You are ensuring quality for a **mobile-first web app for Hindu priests (Pandits)** in India.

### Your Users
- **Age:** 45-70 years old (elderly)
- **Tech Literacy:** Low
- **Devices:** Budget Android phones (₹10,000-15,000 range)
- **Network:** 3G/4G with occasional dropouts
- **Environment:** Temples, homes, outdoor ceremonies

### Success Metrics
| Metric | Target | Current |
|--------|--------|---------|
| Test Coverage | ≥95% | 0% |
| Accessibility Score | ≥95 | - |
| P0 Bugs in Production | 0 | 0 |
| P1 Bugs in Production | <5 | 0 |
| Voice Accuracy | ≥90% | - |
| App Load Time (3G) | <3s | - |

---

## 📅 4-Week Schedule

### Week 1: Test Planning
**Goal:** Create comprehensive test plan and 50+ test cases

**Deliverables:**
- [ ] Test plan document created
- [ ] 75+ test cases written (✅ Complete - see `QA_TEST_CASES_COMPLETE.md`)
- [ ] Test environment set up
- [ ] Bug tracking system configured

**Daily Schedule:**
```
Day 1: Review project, set up test environment
Day 2: Create test cases for functional testing
Day 3: Create test cases for voice/accessibility/device
Day 4: Create test cases for performance/edge cases
Day 5: Finalize test plan, get approval from lead
```

### Week 2: Functional Testing
**Goal:** Execute all functional tests, find 20+ bugs

**Deliverables:**
- [ ] All functional tests executed (75+ test cases)
- [ ] Accessibility audit complete
- [ ] 20+ bugs reported (expected)
- [ ] Screen reader testing complete

**Daily Schedule:**
```
Day 1: Test Part 0.0 screens (S-0.0.1 to S-0.0.8)
Day 2: Test Part 0 screens (S-0.1 to S-0.12)
Day 3: Test Part 1 registration screens (S-1.1 to S-1.9)
Day 4: Test all voice flows, accessibility audit
Day 5: Bug triage, verify fixes, daily report
```

### Week 3: Device & Performance Testing
**Goal:** Test on 5 devices, measure performance benchmarks

**Deliverables:**
- [ ] Device testing complete (5 devices)
- [ ] Browser testing complete (4 browsers)
- [ ] Performance benchmarks measured
- [ ] Voice testing started

**Daily Schedule:**
```
Day 1: Test on Samsung Galaxy A12 (target device)
Day 2: Test on iPhone 12, OnePlus 9
Day 3: Test on Xiaomi Redmi Note 10, Pixel 6
Day 4: Browser testing (Chrome, Firefox, Samsung Internet, UC Browser)
Day 5: Performance testing (Lighthouse, network throttling)
```

### Week 4: Voice Testing & Sign-off
**Goal:** Complete voice testing, verify all bugs fixed, QA sign-off

**Deliverables:**
- [ ] Voice testing complete (12 languages, accents, noise)
- [ ] All P0/P1 bugs verified fixed
- [ ] Regression testing complete
- [ ] QA sign-off report

**Daily Schedule:**
```
Day 1: Voice testing - Hindi, Tamil, Telugu
Day 2: Voice testing - Bengali, Marathi, other languages
Day 3: Voice testing - accents, speeds, volumes, environments
Day 4: Regression testing, verify all bug fixes
Day 5: Final QA report, sign-off, Go/No-Go recommendation
```

---

## 📁 Key Documents

### Test Planning
| Document | Location | Purpose |
|----------|----------|---------|
| Test Plan | `QA_TEST_PLAN.md` | Master test strategy |
| Test Cases (75+) | `QA_TEST_CASES_COMPLETE.md` | Detailed test cases |
| Bug Tracking Template | `QA_BUG_TRACKING_TEMPLATE.md` | How to log bugs |
| Daily Bug Report | `QA_DAILY_BUG_REPORT_TEMPLATE.md` | Daily progress report |

### Testing Guides
| Document | Location | Purpose |
|----------|----------|---------|
| Device Testing Matrix | `QA_DEVICE_TESTING_MATRIX.md` | 5-device checklist |
| Accessibility Checklist | `QA_ACCESSIBILITY_AUDIT_CHECKLIST.md` | WCAG 2.1 AA compliance |
| Performance Checklist | `QA_PERFORMANCE_TESTING_CHECKLIST.md` | Lighthouse, metrics |
| Quick Start Guide | `QA_QUICK_START_GUIDE.md` | Onboarding guide |

### Final Reports
| Document | Location | Purpose |
|----------|----------|---------|
| Final Report Template | `QA_FINAL_REPORT_TEMPLATE.md` | End-of-testing report |
| Bug Reports | `qa-reports/BUG_REPORT_*.md` | Daily bug summaries |
| Test Results | `qa-reports/` | Test execution results |

---

## 🧪 Test Execution Workflow

### Step 1: Setup Test Environment

```bash
# Clone repository
git clone https://github.com/ss7706/HmarePanditJi.git
cd HmarePanditJi

# Install dependencies
pnpm install

# Start development server
pnpm dev
# App runs at http://localhost:3002
```

### Step 2: Open Testing Tools

**Required Tools:**
1. **Chrome DevTools** (built into Chrome)
   - Console (for errors)
   - Network tab (for API calls)
   - Lighthouse (for performance)
   - Device Mode (for mobile emulation)

2. **axe DevTools** (Chrome Extension)
   - Install from Chrome Web Store
   - Use for accessibility scanning

3. **Screen Ruler** (for touch target measurement)
   - Physical ruler or digital tool
   - Measure buttons ≥72px

4. **Color Contrast Analyzer**
   - WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
   - Verify text contrast ≥4.5:1

### Step 3: Execute Test Cases

**For Each Test Case:**

1. **Read test case** from `QA_TEST_CASES_COMPLETE.md`
2. **Set up preconditions** (navigate to screen, etc.)
3. **Follow steps** exactly as written
4. **Observe results** carefully
5. **Record outcome:**
   - ✅ Pass - if actual matches expected
   - ❌ Fail - if actual differs from expected
   - ⏸️ Blocked - if cannot execute (note blocker)

**Example:**
```
Test Case: TC-MOBILE-001
Status: ❌ Fail
Actual Result: Number "987012345" displayed (only 9 digits instead of 10)
Bug ID: BUG-001
```

### Step 4: Log Bugs

**When Test Fails:**

1. **Create GitHub Issue:**
   - Go to GitHub repository → Issues → New Issue
   - Use bug report template
   - Add labels: `bug`, `priority:P0/P1/P2/P3`

2. **Fill Bug Report:**
   ```markdown
   ## 🐛 Bug Report
   
   **Bug ID:** BUG-001
   **Title:** Voice recognition fails for Hindi numbers
   
   ### Severity
   - [x] P0 - Critical
   
   ### Location
   **Screen:** /mobile
   **Component:** MobileNumberScreen.tsx
   
   ### Steps to Reproduce
   1. Navigate to /mobile
   2. Tap mic button
   3. Say "नौ आठ सात शून्य एक दो तीन चार पाँच छह"
   
   ### Expected
   Number "9870123456" should appear
   
   ### Actual
   Only "987012345" appears (9 digits)
   
   ### Environment
   **Device:** Samsung Galaxy A12
   **OS:** Android 11
   **Browser:** Chrome 120
   ```

3. **Attach Evidence:**
   - Screenshot (use `Win+Shift+S` or device screenshot)
   - Screen recording (use Loom or device recorder)
   - Console logs (copy from DevTools)

### Step 5: Daily Reporting

**Every Day at 6 PM IST:**

1. **Fill Daily Bug Report:**
   - Copy `QA_DAILY_BUG_REPORT_TEMPLATE.md`
   - Save as `qa-reports/BUG_REPORT_DAY{N}.md`
   - Fill all sections

2. **Post in Slack:**
   ```
   #hmarepanditji-qa
   
   📊 Daily QA Report - Day X
   
   ✅ Tests Executed: X
   ❌ Bugs Found: X (P0: X, P1: X, P2: X, P3: X)
   🐛 Bugs Fixed: X
   ⏸️ Blockers: X
   
   Full report: [link to report]
   ```

3. **Update Bug Tracker:**
   - Update `QA_BUG_TRACKING_TEMPLATE.md` bug log
   - Keep severity summary current

---

## 🐛 Bug Severity Guide

### P0 - Critical 🔴

**Definition:** App is unusable, testing blocked, data loss, security issue

**Examples:**
- App crashes on launch
- Voice does not play on any screen
- Navigation completely broken
- Login/registration fails
- Data corruption
- Security vulnerability

**SLA:** Fix within 4 hours  
**Testing:** Blocked until fixed

**Action:** Call Senior Dev immediately

---

### P1 - High 🟠

**Definition:** Major feature broken, but workaround exists

**Examples:**
- Voice does not play on specific screen
- STT not recognizing responses
- Button not clickable
- Screen not rendering correctly
- Language switcher broken

**SLA:** Fix within 24 hours  
**Testing:** Can continue with workaround

**Action:** Post in Slack `#hmarepanditji-qa`

---

### P2 - Medium 🟡

**Definition:** Minor feature broken, does not block core functionality

**Examples:**
- Animation glitch
- Text overflow on small screens
- Incorrect icon displayed
- Minor UI misalignment
- Non-critical error message unclear

**SLA:** Fix within 3 days  
**Testing:** Can continue normally

**Action:** Log bug, discuss in standup

---

### P3 - Low 🟢

**Definition:** Cosmetic issue, typo, nice-to-have

**Examples:**
- Typo in non-critical text
- Color slightly off
- Animation not smooth
- Missing alt text on decorative image
- Inconsistent padding

**SLA:** Fix before launch (best effort)  
**Testing:** No impact

**Action:** Log bug for future fix

---

## 📊 Test Coverage Dashboard

### Test Case Distribution

| Category | Count | P0 | P1 | P2 | P3 |
|----------|-------|----|----|----|----|
| Functional (Mobile) | 10 | 4 | 6 | 0 | 0 |
| Functional (Identity) | 5 | 3 | 1 | 1 | 0 |
| Functional (Onboarding) | 10 | 4 | 6 | 0 | 0 |
| Voice Flow | 8 | 3 | 4 | 1 | 0 |
| Accessibility | 10 | 6 | 4 | 0 | 0 |
| Device | 5 | 0 | 3 | 1 | 1 |
| Performance | 7 | 0 | 7 | 0 | 0 |
| Network | 5 | 0 | 4 | 1 | 0 |
| Edge Cases | 10 | 0 | 4 | 5 | 1 |
| **Total** | **75** | **20** | **35** | **15** | **5** |

### Coverage by Screen

| Screen Group | Screens | Test Cases | Coverage |
|--------------|---------|------------|----------|
| Part 0.0 (Identity Flow) | 8 | 15 | 100% |
| Part 0 (Tutorial) | 12 | 20 | 100% |
| Part 1 (Registration) | 9 | 15 | 100% |
| Voice Features | All | 8 | 100% |
| Accessibility | All | 10 | 100% |
| Device Compatibility | 5 devices | 5 | 100% |
| Performance | All | 7 | 100% |
| Network Conditions | 4 types | 5 | 100% |
| Edge Cases | Various | 10 | 100% |

---

## 🎤 Voice Testing Protocol

### Voice Recognition Test

**Setup:**
1. Find 10 speakers with different characteristics:
   - Age: 45-70 years (target demographic)
   - Gender: Male, Female
   - Accent: Hindi, Tamil, Telugu, Bengali, Bhojpuri
   - Speech speed: Slow, Normal, Fast

2. Prepare test environments:
   - Quiet room (30-40 dB)
   - Moderate noise (50-60 dB) - TV/radio in background
   - Loud environment (65-75 dB) - temple sounds, crowd noise

**Test Script:**
```
For each speaker:
1. Say "हाँ" (yes) - 3 times
2. Say "नहीं" (no) - 3 times
3. Say mobile number "9870123456" - 3 times
4. Say variations: "हाँ जी", "बिल्कुल", "सही है"
5. Say in noisy environment

Record for each attempt:
- Transcript: [what STT heard]
- Confidence: [0.0-1.0]
- Intent: [YES/NO/NUMBER/CORRECT/INCORRECT]
- Accuracy: [Pass/Fail]
```

**Track Results:**
```
| Speaker | Language | Speed | Volume | Environment | Accuracy |
|---------|----------|-------|--------|-------------|----------|
| M, 55   | Hindi    | Normal| Normal | Quiet       | 95%      |
| M, 61   | Bhojpuri | Slow  | Loud   | Temple      | 87%      |
| F, 48   | Tamil    | Normal| Normal | Home        | 92%      |
```

**Target:** ≥90% accuracy across all speakers

---

## ♿ Accessibility Testing Protocol

### WCAG 2.1 AA Quick Test

**1. Keyboard Navigation (5 minutes per screen)**
```
For each screen:
1. Press Tab - focus moves forward
2. Press Shift+Tab - focus moves backward
3. Press Enter - activates focused button
4. Press Space - activates focused checkbox/button
5. Press Escape - closes modal/overlay

Check:
✓ All interactive elements reachable
✓ Focus order is logical
✓ Focus indicator visible (outline/ring)
✓ No keyboard traps (focus stuck)
```

**2. Screen Reader Test (TalkBack on Android)**
```
Setup:
1. Enable TalkBack: Settings → Accessibility → TalkBack
2. Open app

Test:
1. Swipe right - moves focus to next element
2. Swipe left - moves focus to previous element
3. Double-tap - activates focused element
4. Listen to announcements

Check:
✓ All buttons announced with labels
✓ All form fields have labels
✓ Error messages announced
✓ Images have alt text
✓ Language changes announced
```

**3. Color Contrast (10 minutes per screen)**
```
Tools: WebAIM Contrast Checker

Test each text element:
1. Body text vs background: ≥4.5:1
2. CTA button text vs button: ≥4.5:1
3. Error messages vs background: ≥4.5:1
4. Large text (18px+): ≥3:1

Common failures:
✗ Placeholder text too light
✗ Progress dots low contrast
✗ Voice indicator blends in
```

**4. Touch Target Size (5 minutes per screen)**
```
Tools: Physical ruler or Chrome DevTools

Measure each button:
✓ CTA buttons: ≥72px height
✓ Back/Skip buttons: ≥72px height
✓ Mic button: ≥72px height
✓ Input fields: ≥48px height
✓ Language tiles: ≥72px height

Common failures:
✗ Skip button too small (48px)
✗ Back button hard to tap (44px)
✗ Input field too short (40px)
```

---

## 📱 Device Testing Protocol

### Target Devices

| Priority | Device | OS | Screen | Why |
|----------|--------|-----|--------|-----|
| P0 | Samsung Galaxy A12 | Android 11 | 6.5" | Primary target (₹10,000) |
| P1 | iPhone 12 | iOS 15 | 6.1" | iOS users (secondary) |
| P1 | OnePlus 9 | Android 12 | 6.55" | Mid-range Android |
| P1 | Xiaomi Redmi Note 10 | Android 11 | 6.43" | Budget Android |
| P2 | Google Pixel 6 | Android 12 | 6.4" | Stock Android |

### Test Each Device (30 minutes per device)

**1. App Loading (2 minutes)**
```
✓ App loads in <5 seconds
✓ Splash screen displays correctly
✓ No white screen or errors
```

**2. Screen Rendering (5 minutes)**
```
✓ All screens render without overflow
✓ Text readable without glasses
✓ No horizontal scrolling
✓ Images/illustrations visible
```

**3. Voice Features (10 minutes)**
```
✓ TTS plays automatically
✓ Voice clear and audible
✓ STT recognizes speech
✓ Mic button responsive
```

**4. Touch Targets (5 minutes)**
```
Measure with ruler:
✓ All buttons ≥72px height
✓ Input fields ≥48px height
✓ Easy to tap with large thumbs
```

**5. Navigation (3 minutes)**
```
✓ Back button works
✓ Next/Forward button works
✓ Skip button works
✓ Language button works
```

**6. Network Resilience (5 minutes)**
```
Test on 3G:
✓ App loads in <10 seconds
✓ Voice works (may be slower)
✓ Forms submit successfully

Test offline:
✓ Graceful error message
✓ No app crash
✓ Retry option available
```

---

## ⚡ Performance Testing Protocol

### Lighthouse Audit (15 minutes per screen)

**Setup:**
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select "Mobile" device
4. Check all categories
5. Click "Analyze page load"

**Target Scores:**
```
✓ Performance: ≥90
✓ Accessibility: ≥95
✓ Best Practices: ≥90
✓ SEO: ≥90
✓ PWA: ≥50 (optional)
```

**Key Metrics:**
```
✓ First Contentful Paint (FCP): <1.5s
✓ Largest Contentful Paint (LCP): <2.5s
✓ Time to Interactive (TTI): <3.5s
✓ Cumulative Layout Shift (CLS): <0.1
✓ Total Blocking Time (TBT): <300ms
```

### Network Throttling (10 minutes per scenario)

**Setup:**
1. Chrome DevTools → Network tab
2. Click dropdown (usually "No throttling")
3. Select throttling level

**Test Scenarios:**
```
1. Fast 3G (150ms RTT, 1.6Mbps)
   ✓ App loads <5s
   ✓ Voice works
   ✓ Forms submit

2. Slow 3G (300ms RTT, 400Kbps)
   ✓ App loads <10s
   ✓ Voice may be slower
   ✓ Graceful timeout if fails

3. 2G (1000ms RTT, 50Kbps)
   ✓ App attempts to load
   ✓ Clear error if fails
   ✓ Offline message shown

4. Offline
   ✓ Offline error message
   ✓ No app crash
   ✓ Retry option
```

### Bundle Size Check (5 minutes)

```bash
# Build production bundle
pnpm build

# Check bundle size
ls -lh .next/static/chunks/

# Target: Total JS <500KB
```

**Common Issues:**
```
✗ Bundle >1MB - needs code splitting
✗ Large images - compress/optimize
✗ Unused dependencies - remove
✗ Duplicate libraries - dedupe
```

---

## 📝 Daily Workflow

### Morning (10:00 AM - 1:00 PM IST)

```
10:00 AM - Arrive, check emails, Slack
10:30 AM - Daily standup (video call)
           - Share yesterday's progress
           - Share today's plan
           - Mention any blockers
11:00 AM - Begin test execution
           - Follow test cases from document
           - Log bugs as found
1:00 PM - Lunch break
```

### Afternoon (2:00 PM - 7:00 PM IST)

```
2:00 PM - Continue test execution
4:00 PM - Bug triage (with Senior Dev)
         - Review new bugs
         - Assign priorities
         - Assign to developers
5:00 PM - Verify bug fixes
         - Test fixed bugs
         - Close verified fixes
6:00 PM - Fill daily report
         - Copy QA_DAILY_BUG_REPORT_TEMPLATE.md
         - Fill all sections
6:30 PM - Post report in Slack
7:00 PM - End of day
```

---

## 🚨 Escalation Path

### When Things Go Wrong

**Level 1: Minor Issue (Handle Yourself)**
```
Example: Test case unclear, need clarification
Action: Post in #hmarepanditji-qa
Wait: 2 hours for response
```

**Level 2: Blocker (Need Help)**
```
Example: Can't test feature, feature broken
Action: 
1. Post in #hmarepanditji-dev
2. Tag Senior Dev (@rajesh-kumar-dev)
3. Wait 2 hours
```

**Level 3: Critical (Urgent)**
```
Example: P0 bug found, app crashes, data loss
Action:
1. Post in #hmarepanditji-dev with 🚨 emoji
2. Call Senior Dev (phone number in Slack)
3. DM Project Manager
```

**Level 4: No Response (Escalate)**
```
If no response after 4 hours:
1. Email: rajesh@hmarepanditji.com
2. Email: pm@hmarepanditji.com
3. Subject: URGENT: QA Blocker - [Description]
```

---

## ✅ Acceptance Criteria

### Week 1 Sign-off
- [ ] Test plan reviewed and approved
- [ ] 75+ test cases written and approved
- [ ] Test environment working
- [ ] Bug tracking configured

### Week 2 Sign-off
- [ ] All functional tests executed
- [ ] Accessibility audit complete (WCAG 2.1 AA)
- [ ] 20+ bugs reported
- [ ] Screen reader testing complete

### Week 3 Sign-off
- [ ] Device testing complete (5 devices)
- [ ] Browser testing complete (4 browsers)
- [ ] Performance benchmarks measured
- [ ] Voice testing started

### Week 4 Sign-off
- [ ] Voice testing complete (≥90% accuracy)
- [ ] All P0/P1 bugs verified fixed
- [ ] Regression testing complete
- [ ] Final QA report submitted
- [ ] Go/No-Go recommendation made

### Final Deliverables
- [ ] Test plan document
- [ ] 75+ test cases with results
- [ ] Bug list (sorted by severity)
- [ ] Device test reports
- [ ] Accessibility audit report
- [ ] Performance metrics report
- [ ] Voice testing report
- [ ] **Final QA Report** (comprehensive)

---

## 📞 Support

### Team Contacts

| Role | Name | Slack | Email | Phone |
|------|------|-------|-------|-------|
| Senior Frontend Lead | Rajesh Kumar | @rajesh-kumar-dev | rajesh@hmarepanditji.com | [In Slack] |
| Project Manager | [TBD] | @project-manager | pm@hmarepanditji.com | [In Slack] |
| Voice Engineer | [TBD] | @voice-engineer | voice@hmarepanditji.com | [In Slack] |
| QA/Test Engineer | You | @you | qa@hmarepanditji.com | [Your phone] |

### Slack Channels

| Channel | Purpose |
|---------|---------|
| `#hmarepanditji-qa` | QA discussions, daily reports |
| `#hmarepanditji-dev` | Development discussions, bug reports |
| `#hmarepanditji-voice` | Voice-specific discussions |
| `#hmarepanditji-general` | General project discussions |

### Working Hours

**Your Hours:** 10:00 AM - 7:00 PM IST (Monday-Friday)  
**Standup:** 10:30 AM IST (daily video call)  
**Response Time:** Within 2 hours during working hours  
**Time Off:** Inform PM in advance (Slack/email)

---

## 💰 Payment Schedule

| Milestone | Deliverable | Amount | Due |
|-----------|-------------|--------|-----|
| Week 1 Complete | Test plan + 75+ test cases | ₹6,250 | Friday Week 1 |
| Week 2 Complete | Functional tests + 20+ bugs | ₹6,250 | Friday Week 2 |
| Week 3 Complete | Device + Performance tests | ₹6,250 | Friday Week 3 |
| Week 4 Complete | Final QA report + sign-off | ₹6,250 | Friday Week 4 |
| **Total** | | **₹25,000** | |

**Payment Method:** UPI / Bank Transfer  
**Invoice:** Submit to accounts@hmarepanditji.com  
**Payment Terms:** Within 3 business days of invoice

---

## 🎓 Resources

### Learning Materials

**Accessibility:**
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- axe DevTools: https://www.deque.com/axe/devtools/

**Performance:**
- Lighthouse Documentation: https://developer.chrome.com/docs/lighthouse/
- WebPageTest: https://www.webpagetest.org/
- Core Web Vitals: https://web.dev/vitals/

**Voice Testing:**
- Sarvam AI Documentation: [Internal docs]
- Speech Recognition Best Practices: [Internal docs]

**Device Testing:**
- BrowserStack: https://www.browserstack.com/ (if physical devices unavailable)
- Chrome DevTools Device Emulation: https://developer.chrome.com/docs/devtools/device-mode/

### Internal Documentation

| Document | Location |
|----------|----------|
| Project Overview | `PROJECT_SUMMARY_AND_ACTION_PLAN.md` |
| Component Specs | `COMPONENTS.md` |
| Voice Engine | `VOICE_INTEGRATION_COMPLETE.md` |
| Screen Reference | `TUTORIAL_SCREENS_VERIFICATION_COMPLETE.md` |
| API Routes | `API_ROUTES_VERIFICATION_COMPLETE.md` |

---

## 📋 Checklist Summary

### Before Starting (Day 1)
- [ ] Read this playbook
- [ ] Read `QA_TEST_CASES_COMPLETE.md`
- [ ] Set up test environment
- [ ] Join Slack channels
- [ ] Meet team on standup

### Daily Checklist
- [ ] Attend 10:30 AM standup
- [ ] Execute planned test cases
- [ ] Log bugs found
- [ ] Verify bug fixes
- [ ] Fill daily report by 6:30 PM
- [ ] Post daily report in Slack

### Weekly Checklist
- [ ] Complete week's deliverables
- [ ] Update test coverage dashboard
- [ ] Review bug metrics
- [ ] Attend weekly review
- [ ] Submit invoice for payment

### Final Checklist (Week 4)
- [ ] All 75+ test cases executed
- [ ] All P0/P1 bugs fixed and verified
- [ ] Accessibility score ≥95
- [ ] Performance metrics met
- [ ] Voice accuracy ≥90%
- [ ] Final QA report submitted
- [ ] Go/No-Go recommendation made

---

**Welcome to the HmarePanditJi team! 🙏**

**Let's build something amazing for India's Hindu priests!**

---

**Last Updated:** March 27, 2026  
**Document Owner:** QA/Test Engineer  
**Next Review:** After Week 1 completion
