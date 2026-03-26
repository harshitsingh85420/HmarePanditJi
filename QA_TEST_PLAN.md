# QA Master Test Plan - HmarePanditJi

**Document Version:** 1.0  
**Created:** March 26, 2026  
**QA Lead:** [To Be Assigned]  
**Timeline:** April 10-14, 2026 (5 days)  
**Budget:** ₹25,000

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Testing Scope](#testing-scope)
3. [Test Strategy](#test-strategy)
4. [Test Environment](#test-environment)
5. [Test Schedule](#test-schedule)
6. [Risk Management](#risk-management)
7. [Deliverables](#deliverables)

---

## Executive Summary

### Project Overview
HmarePanditJi is a voice-first mobile application designed for Hindu priests (Pandits) to manage their religious services, bookings, and income. The app features:
- Voice-guided onboarding in 15 Indian languages
- Text-to-Speech (TTS) for all prompts
- Speech-to-Text (STT) for user responses
- Intent detection for natural language understanding
- Tutorial screens explaining app features
- Registration and profile management

### QA Objectives
- Ensure all 30+ screens function correctly
- Validate voice interactions across 5 priority languages
- Verify accessibility compliance (WCAG 2.1 AA)
- Confirm performance metrics on target devices
- Identify and document all critical bugs before production

---

## Testing Scope

### In Scope

#### Functional Testing
| Part | Screens | Screen IDs | Priority |
|------|---------|------------|----------|
| Part 0.0 | 9 screens | S-0.0.1 to S-0.0.8 | P0 (Critical) |
| Part 0 | 12 screens | S-0.1 to S-0.12 | P0 (Critical) |
| Part 1 | 9 screens | Homepage to Profile Complete | P1 (High) |
| **Total** | **30 screens** | | |

#### Voice Flow Testing
- **TTS Playback:** All 21+ screens with voice prompts
- **STT Recognition:** YES, NO, SKIP, numeric inputs
- **Intent Detection:** Confidence scoring and fallback
- **Error Handling:** Low confidence, timeout, network errors
- **Keyboard Fallback:** Manual input when voice fails

#### Language Testing (Spot Check 5)
| Language | Code | Priority | Native Speaker Required |
|----------|------|----------|------------------------|
| Hindi | hi-IN | P0 | Yes |
| Tamil | ta-IN | P1 | Yes |
| Telugu | te-IN | P1 | Yes |
| Bengali | bn-IN | P1 | Yes |
| Marathi | mr-IN | P2 | Recommended |

#### Device Testing
| Device | OS | Screen Size | Priority |
|--------|-----|-------------|----------|
| Samsung Galaxy A12 | Android 11 | 6.5" | P0 (Target) |
| iPhone 12 | iOS 15 | 6.1" | P1 |
| OnePlus 9 | Android 12 | 6.55" | P1 |
| Xiaomi Redmi Note 10 | Android 11 | 6.43" | P1 |
| Google Pixel 6 | Android 12 | 6.4" | P2 |

#### Accessibility Audit
- WCAG 2.1 AA Compliance
- Screen Reader Support (TalkBack, VoiceOver)
- Keyboard Navigation
- Color Contrast
- Touch Target Sizes
- Motion Preferences

#### Performance Testing
- Lighthouse Score >90 (all categories)
- Page Load Time <3s (3G)
- TTS Latency <300ms
- STT Latency <500ms
- Memory Usage <100MB

### Out of Scope
- Backend API load testing (separate performance test plan)
- Security penetration testing (scheduled for Phase 2)
- Cross-browser testing on desktop (mobile-first approach)
- Localization beyond 5 spot-check languages

---

## Test Strategy

### Testing Types

#### 1. Functional Testing
**Approach:** Manual + Automated  
**Tools:** Playwright, Vitest  
**Coverage:** 100% of screens

**Test Cases:**
- Screen renders correctly
- All UI elements present and functional
- Voice plays on screen load
- Navigation works (Next, Back, Skip)
- Form validation (if applicable)
- Error states handled

#### 2. Voice Flow Testing
**Approach:** Manual + Automated Mock Tests  
**Tools:** Custom test scripts, Sarvam AI SDK  
**Coverage:** All voice interactions

**Test Cases:**
- TTS plays automatically on screen load
- TTS completes without interruption
- STT captures user response
- Intent correctly identified (YES, NO, SKIP, etc.)
- Confidence threshold working (>0.75)
- Fallback to keyboard on low confidence
- Error messages displayed for failed recognition

#### 3. Device Testing
**Approach:** Manual on Physical Devices + BrowserStack  
**Tools:** Physical devices, Chrome DevTools Device Mode  
**Coverage:** 5 priority devices

**Test Cases:**
- App loads without errors
- All screens render correctly (no overflow, cut-off text)
- Voice playback works (speaker test)
- Voice recognition works (microphone test)
- Touch targets 72px minimum (ruler test)
- Text readable without glasses (16px minimum)
- Buttons easy to tap with large thumbs

#### 4. Accessibility Testing
**Approach:** Manual + Automated  
**Tools:** axe DevTools, WAVE, Lighthouse, TalkBack, VoiceOver  
**Coverage:** WCAG 2.1 AA

**Test Cases:**
- Color contrast ratio >4.5:1
- Touch targets >48px × 48px (ideally 72px)
- Focus indicators visible
- Keyboard navigation works (Tab, Enter, Escape)
- Screen reader announces all elements
- Alt text on images
- ARIA labels on buttons
- Reduced motion support

#### 5. Performance Testing
**Approach:** Automated  
**Tools:** Lighthouse, Chrome DevTools  
**Coverage:** All key pages

**Test Cases:**
- Lighthouse overall score >90
- Performance score >90
- Accessibility score >90
- Best Practices score >90
- Page load time <3s (3G throttling)
- TTS latency <300ms
- STT latency <500ms
- Time to Interactive <5s
- Memory usage <100MB

---

## Test Environment

### Development Environment
```
URL: http://localhost:3002
Node Version: 18.x
npm Version: 9.x
```

### Staging Environment
```
URL: [To be provided]
Environment: Production-like
Data: Anonymized production data
```

### Production Environment
```
URL: https://hmarepanditji.com
Environment: Production
Monitoring: Sentry, LogRocket
```

### Test Data
- **Test Accounts:** 5 pre-created Pandit accounts
- **Test Cities:** Varanasi, Chennai, Kolkata, Mumbai, Delhi
- **Test Languages:** Hindi, Tamil, Telugu, Bengali, Marathi
- **Voice Profiles:** priya, arjun (Sarvam AI)

### Test Tools Setup
```bash
# Install Playwright
npx playwright install

# Install Lighthouse
npm install -g lighthouse

# Install axe CLI
npm install -g @axe-core/cli

# Install Chrome DevTools for network throttling
# Built into Chrome browser
```

---

## Test Schedule

### Day 1 (April 10): Functional Testing - Part 0.0
| Time | Activity | Deliverable |
|------|----------|-------------|
| 10:00 AM | Setup test environment | Environment ready |
| 11:00 AM | Test S-0.0.1 to S-0.0.4 | Test results logged |
| 1:00 PM | Lunch Break | |
| 2:00 PM | Test S-0.0.5 to S-0.0.8 | Test results logged |
| 4:00 PM | Log all bugs found | Bug list (P0, P1) |
| 5:00 PM | Daily standup | Status update |

### Day 2 (April 11): Functional Testing - Part 0 & 1
| Time | Activity | Deliverable |
|------|----------|-------------|
| 10:00 AM | Test S-0.1 to S-0.6 | Test results logged |
| 1:00 PM | Lunch Break | |
| 2:00 PM | Test S-0.7 to S-0.12 | Test results logged |
| 4:00 PM | Test Part 1 screens | Test results logged |
| 5:00 PM | Daily standup | Status update |

### Day 3 (April 12): Device Testing
| Time | Activity | Deliverable |
|------|----------|-------------|
| 10:00 AM | Test on Samsung Galaxy A12 | Device test report |
| 12:00 PM | Test on iPhone 12 | Device test report |
| 1:00 PM | Lunch Break | |
| 2:00 PM | Test on OnePlus 9 | Device test report |
| 3:30 PM | Test on Xiaomi Redmi Note 10 | Device test report |
| 4:30 PM | Test on Google Pixel 6 | Device test report |
| 5:00 PM | Daily standup | Status update |

### Day 4 (April 13): Accessibility Audit
| Time | Activity | Deliverable |
|------|----------|-------------|
| 10:00 AM | Automated accessibility scan (axe, WAVE) | Scan results |
| 12:00 PM | Manual keyboard navigation test | Keyboard test report |
| 1:00 PM | Lunch Break | |
| 2:00 PM | Screen reader testing (TalkBack) | TalkBack report |
| 3:30 PM | Screen reader testing (VoiceOver) | VoiceOver report |
| 4:30 PM | Color contrast verification | Contrast report |
| 5:00 PM | Daily standup | Status update |

### Day 5 (April 14): Performance Testing & Report
| Time | Activity | Deliverable |
|------|----------|-------------|
| 10:00 AM | Lighthouse audit (all screens) | Lighthouse reports |
| 12:00 PM | Network throttling tests | Performance metrics |
| 1:00 PM | Lunch Break | |
| 2:00 PM | Compile QA report | Draft report |
| 3:30 PM | Review with team | Feedback incorporated |
| 4:30 PM | Final QA report submission | **Final Deliverable** |
| 5:00 PM | Project closure | |

---

## Risk Management

### Identified Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Device unavailability | Medium | High | Use BrowserStack as backup |
| Voice API rate limits | High | Medium | Mock responses for testing |
| Language speaker availability | Medium | Medium | Record test sessions for review |
| Critical bugs blocking testing | Low | High | Escalate immediately, continue with other tests |
| Network issues | Medium | Low | Test offline mode, use local server |

### Escalation Path
1. **Blocker > 4 hours:** Post in Slack `#hmarepanditji-dev`
2. **No response in 2 hours:** DM Senior Dev directly
3. **Critical bug (P0):** Call Senior Dev (phone in Slack)

---

## Deliverables

### Daily Deliverables
- **Day 1:** Functional test results (Part 0.0), Bug list (P0, P1)
- **Day 2:** Functional test results (Part 0 & 1), Updated bug list
- **Day 3:** Device test reports (5 devices)
- **Day 4:** Accessibility audit report, WCAG compliance checklist
- **Day 5:** **Final QA Report** (comprehensive)

### Final QA Report Structure
1. **Executive Summary**
   - Testing overview
   - Key findings
   - Go/No-Go recommendation

2. **Bug List** (sorted by severity)
   - P0 (Critical) - Must fix before launch
   - P1 (High) - Should fix before launch
   - P2 (Medium) - Nice to fix
   - P3 (Low) - Future consideration

3. **Device Test Results**
   - Matrix of devices × features
   - Pass/fail status
   - Device-specific issues

4. **Accessibility Audit**
   - WCAG 2.1 AA compliance checklist
   - Automated scan results
   - Manual test results
   - Screen reader compatibility

5. **Performance Metrics**
   - Lighthouse scores
   - Load times
   - Voice latencies
   - Memory usage

6. **Recommendations**
   - Critical fixes required
   - Performance optimizations
   - Accessibility improvements
   - Future testing needs

---

## Acceptance Criteria

### QA Sign-off Requirements
- [ ] All P0 bugs resolved
- [ ] All P1 bugs resolved or documented with workarounds
- [ ] All 30 screens tested on 5 devices
- [ ] WCAG 2.1 AA compliance verified
- [ ] Lighthouse score >90 in all categories
- [ ] All performance metrics met
- [ ] QA report submitted and reviewed

### Definition of Done
- [ ] All test cases executed
- [ ] All bugs logged in GitHub Issues
- [ ] All test artifacts archived
- [ ] QA report approved by Senior Dev
- [ ] Go/No-Go decision made

---

## Appendix

### A. Screen Reference
[Link to SCREEN_REFERENCE.md]

### B. Voice Script Reference
[Link to VOICE_SCRIPTS.md]

### C. Bug Tracking Template
[Link to BUG_TRACKING_TEMPLATE.md]

### D. Test Case Templates
[Link to TEST_CASES/]

---

**Document Approved By:**
- [ ] Senior Developer
- [ ] Project Manager
- [ ] QA Lead

**Last Updated:** March 26, 2026
