# Bug Tracking Template - HmarePanditJi

**Document Version:** 1.0  
**Created:** March 26, 2026  
**Bug Tracker:** GitHub Issues  
**Label Format:** `bug`, `priority:P0`, `priority:P1`, `priority:P2`, `priority:P3`

---

## How to Log Bugs

### Option 1: GitHub Issues (Recommended)
```bash
# Navigate to GitHub repository
# Click "Issues" tab
# Click "New Issue"
# Select "Bug Report" template
# Fill in details below
```

### Option 2: Spreadsheet (Offline)
Use the bug log spreadsheet at: `QA_BUG_LOG.xlsx`

### Option 3: Slack (Urgent P0 Only)
```
Post in #hmarepanditji-dev:
🐛 P0 BUG: [Brief description]
Screen: [Screen ID]
Impact: [What's broken]
Device: [Device/Browser]
```

---

## Bug Report Template

### GitHub Issue Template

```markdown
## 🐛 Bug Report

**Bug ID:** BUG-001  
**Title:** [Brief, descriptive title]

### Severity
- [ ] P0 - Critical (Blocks testing/usage, app crash)
- [ ] P1 - High (Major feature broken, workaround exists)
- [ ] P2 - Medium (Minor feature broken, workaround exists)
- [ ] P3 - Low (Cosmetic, typo, nice-to-fix)

### Location
**Screen:** S-0.2 Income Hook  
**Screen ID:** `S-0.2`  
**Component:** `IncomeHookPage.tsx`  
**URL:** `/onboarding/income-hook`

### Description
[Clear, concise description of the issue]

### Steps to Reproduce
1. Open app
2. Navigate to [screen/feature]
3. Wait for voice to play
4. [Continue with specific steps]
5. Observe error

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
**Device:** Samsung Galaxy A12  
**OS:** Android 11  
**Browser:** Chrome 120  
**App Version:** 0.1.0  
**Screen Size:** 390x844  
**Network:** WiFi (50 Mbps)

### Frequency
- [ ] Always (100%)
- [ ] Often (75%)
- [ ] Sometimes (50%)
- [ ] Rarely (25%)
- [ ] Once (cannot reproduce)

### Attachments
- [ ] Screenshot
- [ ] Screen recording
- [ ] Console logs
- [ ] Network logs

### Console Errors
```
[Paste any console errors here]
```

### Network Errors
```
[Paste any network request failures here]
```

### Additional Context
[Any other relevant information]

### Suggested Fix (Optional)
[If you have an idea of what might fix it]

---

## QA Checklist
- [ ] Bug reproduced on 2+ devices
- [ ] Screenshots attached
- [ ] Console logs attached
- [ ] Steps to reproduce verified
- [ ] Severity correctly assigned
```

---

## Bug Severity Definitions

### P0 - Critical 🔴
**Definition:** App is unusable, testing is blocked, data loss, security issue

**Examples:**
- App crashes on launch
- Voice does not play on any screen
- Navigation completely broken
- Login/registration fails
- Data corruption
- Security vulnerability

**SLA:** Fix within 4 hours  
**Testing:** Blocked until fixed

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

---

## Bug Log Spreadsheet

### Bug Log (Sorted by Severity)

| Bug ID | Title | Screen | Severity | Status | Assignee | Date Found | Date Fixed |
|--------|-------|--------|----------|--------|----------|------------|------------|
| BUG-001 | TTS does not play on screen load | S-0.2 | P0 | Open | @rajesh-kumar-dev | 2026-04-10 | - |
| BUG-002 | Skip button not clickable on iPhone | S-0.3 | P1 | Open | @arjun-mehta-dev | 2026-04-10 | - |
| BUG-003 | Tamil text overflow on small screens | S-0.4 | P2 | Open | @vikram-singh-dev | 2026-04-11 | - |
| BUG-004 | Progress dot color incorrect | S-0.5 | P3 | Open | @arjun-mehta-dev | 2026-04-11 | - |

### Bug Summary by Severity

| Severity | Count | Open | In Progress | Resolved | Closed |
|----------|-------|------|-------------|----------|--------|
| P0 | 0 | 0 | 0 | 0 | 0 |
| P1 | 0 | 0 | 0 | 0 | 0 |
| P2 | 0 | 0 | 0 | 0 | 0 |
| P3 | 0 | 0 | 0 | 0 | 0 |
| **Total** | **0** | **0** | **0** | **0** | **0** |

### Bug Summary by Screen

| Screen | P0 | P1 | P2 | P3 | Total |
|--------|----|----|----|----|-------|
| S-0.0.1 | 0 | 0 | 0 | 0 | 0 |
| S-0.0.2 | 0 | 0 | 0 | 0 | 0 |
| S-0.0.3 | 0 | 0 | 0 | 0 | 0 |
| S-0.0.4 | 0 | 0 | 0 | 0 | 0 |
| S-0.0.5 | 0 | 0 | 0 | 0 | 0 |
| S-0.0.6 | 0 | 0 | 0 | 0 | 0 |
| S-0.0.7 | 0 | 0 | 0 | 0 | 0 |
| S-0.0.8 | 0 | 0 | 0 | 0 | 0 |
| S-0.1 | 0 | 0 | 0 | 0 | 0 |
| S-0.2 | 0 | 0 | 0 | 0 | 0 |
| S-0.3 | 0 | 0 | 0 | 0 | 0 |
| S-0.4 | 0 | 0 | 0 | 0 | 0 |
| S-0.5 | 0 | 0 | 0 | 0 | 0 |
| S-0.6 | 0 | 0 | 0 | 0 | 0 |
| S-0.7 | 0 | 0 | 0 | 0 | 0 |
| S-0.8 | 0 | 0 | 0 | 0 | 0 |
| S-0.9 | 0 | 0 | 0 | 0 | 0 |
| S-0.10 | 0 | 0 | 0 | 0 | 0 |
| S-0.11 | 0 | 0 | 0 | 0 | 0 |
| S-0.12 | 0 | 0 | 0 | 0 | 0 |
| Part 1 | 0 | 0 | 0 | 0 | 0 |
| **Total** | **0** | **0** | **0** | **0** | **0** |

---

## Bug Triage Process

### Daily Bug Triage (5 PM IST)
**Attendees:** QA Lead, Senior Dev, Project Manager

**Agenda:**
1. Review new bugs (last 24 hours)
2. Assign severity and priority
3. Assign to developers
4. Review bug fix progress
5. Escalate blockers

### Bug Fix Workflow
```
1. QA logs bug → GitHub Issue created
2. Bug triage → Severity assigned, developer assigned
3. Developer fixes → PR created with "Fixes #BUG-XXX"
4. Code review → Senior Dev reviews
5. Merge → PR merged to main
6. QA verifies → Bug verified on staging
7. Close → Bug closed in GitHub
```

---

## Example Bug Reports

### Example 1: P0 Critical Bug

```markdown
## 🐛 Bug Report

**Bug ID:** BUG-001  
**Title:** TTS does not play automatically on screen load

### Severity
- [x] P0 - Critical (Blocks testing/usage, app crash)

### Location
**Screen:** S-0.2 Income Hook  
**Screen ID:** `S-0.2`  
**Component:** `IncomeHookPage.tsx`  
**URL:** `/onboarding/income-hook`

### Description
Text-to-Speech voice prompt does not play automatically when screen loads. User hears silence instead of expected voice guidance.

### Steps to Reproduce
1. Open app on Samsung Galaxy A12
2. Navigate to S-0.2 Income Hook screen
3. Wait for voice to play (expected within 500ms)
4. Observe: No voice plays

### Expected Behavior
Voice should play automatically within 500ms of screen load, saying "नमस्ते। मैं आपकी आय का स्रोत जानना चाहता हूँ।"

### Actual Behavior
No voice plays. Screen remains silent. Voice indicator does not appear.

### Environment
**Device:** Samsung Galaxy A12  
**OS:** Android 11  
**Browser:** Chrome 120  
**App Version:** 0.1.0  
**Screen Size:** 390x844  
**Network:** WiFi (50 Mbps)

### Frequency
- [x] Always (100%)

### Attachments
- [x] Screenshot: `bug-001-screenshot.png`
- [x] Screen recording: `bug-001-recording.mp4`
- [x] Console logs: `bug-001-console.txt`

### Console Errors
```
TypeError: Cannot read properties of undefined (reading 'play')
    at VoiceOverlay.tsx:45
    at useEffect (IncomeHookPage.tsx:78)
```

### Additional Context
This affects all 21 screens. Voice is critical for our target users (Pandits) who rely on voice guidance.

### Suggested Fix (Optional)
Check if `audioRef.current` is initialized before calling `.play()`. Add null check at line 45 in VoiceOverlay.tsx.

---

## QA Checklist
- [x] Bug reproduced on 2+ devices
- [x] Screenshots attached
- [x] Console logs attached
- [x] Steps to reproduce verified
- [x] Severity correctly assigned
```

### Example 2: P1 High Bug

```markdown
## 🐛 Bug Report

**Bug ID:** BUG-002  
**Title:** Skip button not clickable on iPhone 12

### Severity
- [x] P1 - High (Major feature broken, workaround exists)

### Location
**Screen:** S-0.3 Fixed Dakshina  
**Screen ID:** `S-0.3`  
**Component:** `FixedDakshinaPage.tsx`  
**URL:** `/onboarding/fixed-dakshina`

### Description
Skip button in top-right corner is not clickable/tappable on iPhone 12. Button appears visually but does not respond to touch.

### Steps to Reproduce
1. Open app on iPhone 12 (iOS 15)
2. Navigate to S-0.3 Fixed Dakshina screen
3. Tap Skip button (top-right corner)
4. Observe: No response

### Expected Behavior
Skip button should be clickable and navigate user to next screen when tapped.

### Actual Behavior
Button does not respond to touch. No visual feedback, no navigation.

### Environment
**Device:** iPhone 12  
**OS:** iOS 15  
**Browser:** Safari 15  
**App Version:** 0.1.0  
**Screen Size:** 390x844  
**Network:** WiFi (50 Mbps)

### Frequency
- [x] Always (100%)

### Attachments
- [x] Screenshot: `bug-002-screenshot.png`
- [x] Screen recording: `bug-002-recording.mp4`

### Console Errors
```
(No errors in console)
```

### Additional Context
Works fine on Android devices. Only affects iPhone 12. Tested on iPhone 12 Mini - works fine. May be related to touch target size or z-index.

### Suggested Fix (Optional)
Check z-index of Skip button. Ensure touch target is 72px minimum. Verify `pointer-events` CSS property.

---

## QA Checklist
- [x] Bug reproduced on 2+ devices
- [x] Screenshots attached
- [x] Console logs attached
- [x] Steps to reproduce verified
- [x] Severity correctly assigned
```

---

## Bug Metrics Dashboard

### Daily Bug Velocity
| Date | New Bugs | Bugs Fixed | Net Change | Total Open |
|------|----------|------------|------------|------------|
| Apr 10 | 0 | 0 | 0 | 0 |
| Apr 11 | 0 | 0 | 0 | 0 |
| Apr 12 | 0 | 0 | 0 | 0 |
| Apr 13 | 0 | 0 | 0 | 0 |
| Apr 14 | 0 | 0 | 0 | 0 |

### Bug Burn-down Chart
[To be updated daily - track total open bugs over time]

---

## Contact

**QA Lead:** [To Be Assigned]  
**Slack:** `#hmarepanditji-qa`  
**Email:** qa@hmarepanditji.com

---

**Last Updated:** March 26, 2026
