# QA Tester Quick Start Guide - HmarePanditJi

**Task Card:** Task 4 - QA Tester  
**Budget:** ₹25,000  
**Timeline:** April 10-14, 2026 (5 days)  
**Deliverable:** Complete QA report + bug list

---

## 🚀 Getting Started

### Day 1 Morning (April 10, 10 AM)

#### 1. Setup Your Testing Environment

```bash
# Clone the repository
git clone [repository-url]
cd hmarepanditji

# Install dependencies
pnpm install  # or npm install

# Start the development server
pnpm dev  # or npm run dev
```

**Access the app:** http://localhost:3002

#### 2. Join Communication Channels

- **Slack:** Join `#hmarepanditji-qa`
- **GitHub:** Request access to repository
- **Email:** qa@hmarepanditji.com

#### 3. Review Documentation

Read these files first:
1. `QA_TEST_PLAN.md` - Overall testing strategy
2. `QA_BUG_TRACKING_TEMPLATE.md` - How to log bugs
3. `QA_DEVICE_TESTING_MATRIX.md` - Device testing guide
4. `QA_ACCESSIBILITY_AUDIT_CHECKLIST.md` - Accessibility requirements
5. `QA_PERFORMANCE_TESTING_CHECKLIST.md` - Performance metrics

---

## 📅 Daily Schedule

### Day 1-2: Functional Testing (April 10-11)

**Goal:** Test all 30 screens for functionality

#### Morning (10 AM - 1 PM)

1. **Test Part 0.0 Screens (9 screens)**
   - S-0.0.1: Splash Screen
   - S-0.0.2: Location Permission
   - S-0.0.3: Language Selection
   - S-0.0.4: App Purpose
   - S-0.0.5: Mool Mantra
   - S-0.0.6: Registration CTA
   - S-0.0.7: Voice Nav Demo
   - S-0.0.8: Dual Mode

2. **For Each Screen:**
   - [ ] Screen renders correctly
   - [ ] Voice (TTS) plays on load
   - [ ] All buttons are clickable
   - [ ] Navigation works (Next/Back/Skip)
   - [ ] Text is readable
   - [ ] No console errors

#### Afternoon (2 PM - 6 PM)

1. **Test Part 0 Screens (12 screens)**
   - S-0.1 to S-0.12: Tutorial screens

2. **Test Voice Flows:**
   - [ ] TTS playback on all screens
   - [ ] STT recognition (YES, NO, SKIP)
   - [ ] Intent detection accuracy
   - [ ] Error handling (low confidence, timeout)
   - [ ] Keyboard fallback when voice fails

3. **Test Languages (Spot Check):**
   - [ ] Hindi (primary)
   - [ ] Tamil
   - [ ] Telugu
   - [ ] Bengali
   - [ ] Marathi

#### End of Day Deliverables

- [ ] All bugs logged in GitHub Issues
- [ ] Bug list spreadsheet updated
- [ ] Daily standup at 5 PM

---

### Day 3: Device Testing (April 12)

**Goal:** Test app on 5 different devices

#### Setup

1. **Get Devices:**
   - Samsung Galaxy A12 (Android 11) - **Target Device**
   - iPhone 12 (iOS 15)
   - OnePlus 9 (Android 12)
   - Xiaomi Redmi Note 10 (Android 11)
   - Google Pixel 6 (Android 12)

2. **Alternative:** Use BrowserStack if physical devices unavailable
   - URL: https://www.browserstack.com
   - Login credentials will be provided

#### Testing (10 AM - 6 PM)

**For Each Device:**

1. **Load App**
   - [ ] App loads without errors
   - [ ] Load time <5 seconds

2. **Test All Screens**
   - [ ] All 30 screens render correctly
   - [ ] No overflow or cut-off text
   - [ ] Voice playback works
   - [ ] Voice recognition works

3. **Measure Touch Targets**
   - Use physical ruler or digital caliper
   - [ ] CTA buttons ≥72px height
   - [ ] Skip button ≥72px height
   - [ ] All buttons ≥48px height

4. **Test Text Readability**
   - Hold device at normal reading distance (~30cm)
   - [ ] Text readable without glasses
   - [ ] Minimum font size 16px

5. **Test Navigation**
   - [ ] Back button works
   - [ ] Next button works
   - [ ] Skip button works
   - [ ] All touch targets easy to tap

#### End of Day Deliverables

- [ ] Device testing checklist completed
- [ ] All device-specific bugs logged
- [ ] Touch target measurements recorded
- [ ] Daily standup at 5 PM

---

### Day 4: Accessibility Audit (April 13)

**Goal:** Verify WCAG 2.1 AA compliance

#### Morning: Automated Scans (10 AM - 1 PM)

1. **Install Browser Extensions:**
   - axe DevTools (Chrome Extension)
   - WAVE (Web Accessibility Evaluation Tool)

2. **Run Automated Scans:**
   ```bash
   # Run accessibility scan script
   node scripts/qa-accessibility-scan.js
   ```

3. **Review Results:**
   - Check for color contrast issues
   - Verify all images have alt text
   - Check all buttons have aria-labels
   - Verify form inputs have labels

#### Afternoon: Manual Testing (2 PM - 6 PM)

1. **Keyboard Navigation:**
   - [ ] Tab key moves focus forward
   - [ ] Shift+Tab moves focus backward
   - [ ] Enter activates buttons
   - [ ] Space activates checkboxes
   - [ ] Escape closes modals
   - [ ] No keyboard traps

2. **Screen Reader Testing:**
   - **Android (TalkBack):**
     - [ ] Enable TalkBack in Settings
     - [ ] Navigate through all screens
     - [ ] Verify all elements announced
     - [ ] Check form labels read aloud
   
   - **iOS (VoiceOver):**
     - [ ] Enable VoiceOver in Settings
     - [ ] Navigate through all screens
     - [ ] Verify all elements announced
     - [ ] Check form labels read aloud

3. **Color Contrast:**
   - Use WebAIM Contrast Checker
   - [ ] All text has 4.5:1 contrast ratio
   - [ ] All UI components have 3:1 contrast

4. **Motion Preferences:**
   - [ ] Test with prefers-reduced-motion enabled
   - [ ] Animations should be reduced/disabled

#### End of Day Deliverables

- [ ] Accessibility audit checklist completed
- [ ] All accessibility bugs logged
- [ ] Screen reader test results documented
- [ ] Daily standup at 5 PM

---

### Day 5: Performance Testing & Report (April 14)

**Goal:** Run performance tests and compile final report

#### Morning: Lighthouse Audits (10 AM - 1 PM)

1. **Run Lighthouse on Each Screen:**
   - Open Chrome DevTools (F12)
   - Navigate to Lighthouse tab
   - Select "Mobile" device
   - Check all categories
   - Click "Analyze page load"

2. **Record Results:**
   - Overall score (target: >90)
   - Performance score (target: >90)
   - Accessibility score (target: >90)
   - Best Practices score (target: >90)

3. **Test Network Throttling:**
   - Open Network tab in DevTools
   - Select "Slow 3G" preset
   - Measure page load time (target: <3s)

#### Afternoon: Compile Report (2 PM - 5 PM)

1. **Gather All Data:**
   - Bug list from Days 1-2
   - Device test results from Day 3
   - Accessibility audit from Day 4
   - Performance metrics from Day 5

2. **Fill Out Final Report:**
   ```bash
   # Open the template
   QA_FINAL_REPORT_TEMPLATE.md
   ```

3. **Generate Summary:**
   - Total bugs by severity
   - Device pass/fail summary
   - Accessibility compliance status
   - Performance metrics summary

4. **Make Go/No-Go Recommendation:**
   - Based on critical bugs
   - Based on acceptance criteria
   - Based on performance metrics

#### End of Day Deliverables

- [ ] **Final QA Report submitted**
- [ ] All test artifacts archived
- [ ] Go/No-Go recommendation provided
- [ ] Project closure meeting at 5 PM

---

## 🐛 How to Log Bugs

### Using GitHub Issues (Recommended)

1. **Navigate to GitHub repository**
2. **Click "Issues" tab**
3. **Click "New Issue"**
4. **Select "Bug Report" template**
5. **Fill in details:**

```markdown
## 🐛 Bug Report

**Bug ID:** BUG-001
**Title:** [Brief, descriptive title]

### Severity
- [ ] P0 - Critical (Blocks testing/usage)
- [ ] P1 - High (Major feature broken)
- [ ] P2 - Medium (Minor feature broken)
- [ ] P3 - Low (Cosmetic issue)

### Location
**Screen:** S-0.2 Income Hook
**Component:** IncomeHookPage.tsx

### Description
[Clear description of the issue]

### Steps to Reproduce
1. Open app
2. Navigate to [screen]
3. [Continue with steps]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
**Device:** Samsung Galaxy A12
**OS:** Android 11
**Browser:** Chrome 120

### Attachments
- [ ] Screenshot
- [ ] Screen recording
- [ ] Console logs
```

### Bug Severity Guide

**P0 - Critical 🔴:**
- App crashes
- Voice does not play on any screen
- Navigation completely broken
- **SLA:** Fix within 4 hours

**P1 - High 🟠:**
- Voice broken on specific screen
- Button not clickable
- Screen not rendering
- **SLA:** Fix within 24 hours

**P2 - Medium 🟡:**
- Animation glitch
- Text overflow
- Minor UI misalignment
- **SLA:** Fix within 3 days

**P3 - Low 🟢:**
- Typo
- Color slightly off
- Missing alt text on decorative image
- **SLA:** Fix before launch (best effort)

---

## 📊 Acceptance Criteria

You must verify these before signing off:

### Functional Testing
- [ ] All 30 screens tested
- [ ] All voice flows tested (TTS + STT)
- [ ] All 5 languages tested
- [ ] All bugs logged (P0, P1, P2, P3)

### Device Testing
- [ ] All 5 devices tested
- [ ] Touch targets measured (72px minimum)
- [ ] Text readability verified
- [ ] Device test reports saved

### Accessibility
- [ ] WCAG 2.1 AA compliance verified
- [ ] Keyboard navigation works
- [ ] Screen reader testing completed
- [ ] Color contrast verified (4.5:1)

### Performance
- [ ] Lighthouse overall score >90
- [ ] Performance score >90
- [ ] Accessibility score >90
- [ ] Page load time <3s (3G)
- [ ] TTS latency <300ms
- [ ] STT latency <500ms

### Final Deliverables
- [ ] Bug list (sorted by severity)
- [ ] Device test results
- [ ] Accessibility audit
- [ ] Performance metrics
- [ ] **Final QA Report submitted**

---

## 💰 Payment Schedule

| Milestone | Deliverable | Amount | Due |
|-----------|-------------|--------|-----|
| Upfront (30%) | Contract signing | ₹7,500 | Day 1 |
| Final (70%) | QA report submitted | ₹17,500 | Day 5 |
| **Total** | | **₹25,000** | |

**Payment Method:** UPI / Bank Transfer  
**Invoice:** Submit invoice to accounts@hmarepanditji.com

---

## 📞 Contact & Support

### Team Contacts

**Senior Developer:** Rajesh Kumar  
- Slack: `@rajesh-kumar-dev`
- Email: rajesh@hmarepanditji.com
- For: Technical questions, bug clarification

**Project Manager:** [To Be Assigned]  
- Slack: `@project-manager`
- Email: pm@hmarepanditji.com
- For: Timeline, deliverables, payments

**QA Lead:** [You]  
- Slack: `#hmarepanditji-qa`
- Email: qa@hmarepanditji.com

### Escalation Path

1. **Blocker > 4 hours:** Post in Slack `#hmarepanditji-dev`
2. **No response in 2 hours:** DM Senior Dev directly
3. **Critical bug (P0):** Call Senior Dev (phone in Slack)

---

## 📁 File Structure

```
hmarepanditji/
├── QA_TEST_PLAN.md                      # Overall testing strategy
├── QA_BUG_TRACKING_TEMPLATE.md          # Bug report template
├── QA_DEVICE_TESTING_MATRIX.md          # Device testing guide
├── QA_ACCESSIBILITY_AUDIT_CHECKLIST.md  # Accessibility checklist
├── QA_PERFORMANCE_TESTING_CHECKLIST.md  # Performance metrics
├── QA_FINAL_REPORT_TEMPLATE.md          # Final report template
├── QA_TESTING_SCRIPTS.md                # Automated test scripts
├── scripts/
│   ├── qa-lighthouse-batch.js           # Lighthouse checklist generator
│   └── qa-device-checklist.js           # Device checklist generator
└── qa-reports/                          # Generated reports (create this)
    ├── lighthouse/
    ├── accessibility/
    ├── performance/
    └── device/
```

---

## ✅ Checklist Summary

### Day 1-2
- [ ] Part 0.0 screens tested (9 screens)
- [ ] Part 0 screens tested (12 screens)
- [ ] Part 1 screens tested (9 screens)
- [ ] TTS tested on all screens
- [ ] STT tested (YES, NO, SKIP)
- [ ] 5 languages tested
- [ ] All bugs logged

### Day 3
- [ ] Samsung Galaxy A12 tested
- [ ] iPhone 12 tested
- [ ] OnePlus 9 tested
- [ ] Xiaomi Redmi Note 10 tested
- [ ] Google Pixel 6 tested
- [ ] Touch targets measured
- [ ] Device report saved

### Day 4
- [ ] axe DevTools scan completed
- [ ] Keyboard navigation tested
- [ ] TalkBack tested
- [ ] VoiceOver tested
- [ ] Color contrast verified
- [ ] Accessibility report saved

### Day 5
- [ ] Lighthouse audits completed
- [ ] Network throttling tested
- [ ] Performance metrics recorded
- [ ] **Final QA Report compiled**
- [ ] Go/No-Go recommendation made
- [ ] Report submitted

---

## 🎯 Success Criteria

Your QA testing is successful if:

1. **All bugs are logged** - No hidden issues
2. **Critical bugs are identified** - P0/P1 bugs clearly marked
3. **Reports are comprehensive** - Anyone can understand the quality status
4. **Go/No-Go is clear** - Stakeholders can make informed decision
5. **Deliverables are on time** - Report submitted by April 14, 6 PM IST

---

**Good luck with your testing! 🚀**

**Last Updated:** March 26, 2026
