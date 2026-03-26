/**
 * HmarePanditJi - Device Testing Checklist Generator
 * 
 * Generates comprehensive device testing checklists for QA tester
 * 
 * Usage: node scripts/qa-device-checklist.js
 * Output: qa-reports/device/device-checklist.md
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  outputDir: path.join(process.cwd(), 'qa-reports', 'device'),
  devices: [
    {
      id: 'D1',
      name: 'Samsung Galaxy A12',
      os: 'Android 11',
      screen: '6.5"',
      resolution: '720 x 1600',
      ppi: '270',
      browser: 'Chrome 120',
      priority: 'P0 (Target Device)',
    },
    {
      id: 'D2',
      name: 'iPhone 12',
      os: 'iOS 15',
      screen: '6.1"',
      resolution: '1170 x 2532',
      ppi: '460',
      browser: 'Safari 15',
      priority: 'P1',
    },
    {
      id: 'D3',
      name: 'OnePlus 9',
      os: 'Android 12',
      screen: '6.55"',
      resolution: '1080 x 2400',
      ppi: '402',
      browser: 'Chrome 120',
      priority: 'P1',
    },
    {
      id: 'D4',
      name: 'Xiaomi Redmi Note 10',
      os: 'Android 11',
      screen: '6.43"',
      resolution: '1080 x 2400',
      ppi: '409',
      browser: 'Chrome 120',
      priority: 'P1',
    },
    {
      id: 'D5',
      name: 'Google Pixel 6',
      os: 'Android 12',
      screen: '6.4"',
      resolution: '1080 x 2400',
      ppi: '411',
      browser: 'Chrome 120',
      priority: 'P2',
    },
  ],
  screens: [
    { id: 'S-0.0.1', name: 'Splash Screen' },
    { id: 'S-0.0.2', name: 'Location Permission' },
    { id: 'S-0.0.3', name: 'Language Selection' },
    { id: 'S-0.1', name: 'Tutorial 1' },
    { id: 'S-0.2', name: 'Tutorial 2' },
    { id: 'S-0.3', name: 'Tutorial 3' },
    { id: 'S-0.4', name: 'Tutorial 4' },
    { id: 'S-0.5', name: 'Tutorial 5' },
    { id: 'S-0.6', name: 'Tutorial 6' },
    { id: 'S-0.7', name: 'Tutorial 7' },
    { id: 'S-0.8', name: 'Tutorial 8' },
    { id: 'S-0.9', name: 'Tutorial 9' },
    { id: 'S-0.10', name: 'Tutorial 10' },
    { id: 'S-0.11', name: 'Tutorial 11' },
    { id: 'S-0.12', name: 'Tutorial 12' },
    { id: 'S-1.1', name: 'Mobile Number' },
    { id: 'S-1.2', name: 'OTP Verification' },
    { id: 'S-1.9', name: 'Profile Complete' },
  ],
  tests: [
    { id: 'T01', name: 'App loads successfully', expected: 'App loads in <5s', priority: 'P0' },
    { id: 'T02', name: 'Splash screen displays', expected: 'Shows for 3s, no errors', priority: 'P0' },
    { id: 'T03', name: 'All screens render correctly', expected: 'No overflow or cut-off', priority: 'P0' },
    { id: 'T04', name: 'TTS playback works', expected: 'Voice plays within 500ms', priority: 'P0' },
    { id: 'T05', name: 'STT recognition works', expected: 'Recognizes YES/NO/SKIP', priority: 'P0' },
    { id: 'T06', name: 'Touch targets 72px minimum', expected: 'All buttons ≥72px', priority: 'P1' },
    { id: 'T07', name: 'Text readability', expected: '16px minimum, clear', priority: 'P1' },
    { id: 'T08', name: 'Navigation works', expected: 'Back/Next/Skip responsive', priority: 'P0' },
    { id: 'T09', name: 'Form inputs work', expected: 'Text fields functional', priority: 'P1' },
    { id: 'T10', name: 'Animations smooth', expected: 'No jank, 60fps', priority: 'P2' },
    { id: 'T11', name: 'Offline mode', expected: 'Graceful degradation', priority: 'P1' },
    { id: 'T12', name: '3G network performance', expected: 'Load time <10s', priority: 'P1' },
  ],
};

function generateChecklist() {
  console.log('📱 Generating Device Testing Checklist...\n');
  
  const checklist = `# Device Testing Checklist - HmarePanditJi

**Generated:** ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
**Testing Date:** April 12, 2026 (Day 3)
**QA Tester:** [To Be Assigned]

---

## Testing Instructions

### Setup

1. **Install App on Device**
   - Connect device via USB
   - Deploy app or access via browser
   - URL: http://localhost:3002 (or staging URL)

2. **Enable Remote Debugging**
   - **Android:** Chrome DevTools → Remote Devices
   - **iOS:** Safari → Develop → [Device Name]

3. **Prepare Testing Tools**
   - Physical ruler or digital caliper (for touch target measurement)
   - Screen recording app
   - Screenshot tool
   - Sound level meter app (for ambient noise testing)

### Testing Process

1. Test each device sequentially
2. Complete all 12 tests for each device
3. Log all issues found with screenshots
4. Measure touch targets with ruler
5. Test voice features in quiet and noisy environments

---

## Device Specifications

| Device | OS | Screen | Resolution | PPI | Browser | Priority |
|--------|-----|--------|------------|-----|---------|----------|
${CONFIG.devices.map(d => `| ${d.name} | ${d.os} | ${d.screen} | ${d.resolution} | ${d.ppi} | ${d.browser} | ${d.priority} |`).join('\n')}

---

${CONFIG.devices.map(device => generateDeviceChecklist(device)).join('\n\n')}

---

## Device Comparison Summary

### Overall Pass/Fail Summary

| Test | Samsung A12 | iPhone 12 | OnePlus 9 | Xiaomi Note 10 | Pixel 6 |
|------|-------------|-----------|-----------|----------------|---------|
${CONFIG.tests.map(t => `| ${t.name} | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |`).join('\n')}

### Issues by Device

| Device | P0 | P1 | P2 | P3 | Total |
|--------|----|----|----|----|-------|
| Samsung A12 | 0 | 0 | 0 | 0 | 0 |
| iPhone 12 | 0 | 0 | 0 | 0 | 0 |
| OnePlus 9 | 0 | 0 | 0 | 0 | 0 |
| Xiaomi Note 10 | 0 | 0 | 0 | 0 | 0 |
| Pixel 6 | 0 | 0 | 0 | 0 | 0 |
| **Total** | **0** | **0** | **0** | **0** | **0** |

---

## Touch Target Measurements

### Samsung Galaxy A12

| Element | Expected | Measured | Status |
|---------|----------|----------|--------|
| CTA Button (आगे) | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Skip Button | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Back Button | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Language Tiles | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Income Tiles | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Mic Button | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Input Fields | 48px min height | ___ px | ⬜ Pass / ⬜ Fail |

### iPhone 12

| Element | Expected | Measured | Status |
|---------|----------|----------|--------|
| CTA Button (आगे) | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Skip Button | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Back Button | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Language Tiles | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Mic Button | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |

### OnePlus 9

| Element | Expected | Measured | Status |
|---------|----------|----------|--------|
| CTA Button (आगे) | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Skip Button | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Back Button | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Language Tiles | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Mic Button | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |

### Xiaomi Redmi Note 10

| Element | Expected | Measured | Status |
|---------|----------|----------|--------|
| CTA Button (आगे) | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Skip Button | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Back Button | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Language Tiles | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Mic Button | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |

### Google Pixel 6

| Element | Expected | Measured | Status |
|---------|----------|----------|--------|
| CTA Button (आगे) | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Skip Button | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Back Button | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Language Tiles | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Mic Button | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |

---

## Issues Log

### Device-Specific Issues

| Issue ID | Device | Screen | Description | Severity | Screenshot |
|----------|--------|--------|-------------|----------|------------|
| DEV-001 | [Device] | [Screen] | [Description] | P0/P1/P2/P3 | ⬜ Yes |
| DEV-002 | [Device] | [Screen] | [Description] | P0/P1/P2/P3 | ⬜ Yes |

---

## Sign-off

### Device Testing Completed

| Device | Tester Name | Date | Sign-off |
|--------|-------------|------|----------|
| Samsung Galaxy A12 | | April 12, 2026 | ⬜ Approved |
| iPhone 12 | | April 12, 2026 | ⬜ Approved |
| OnePlus 9 | | April 12, 2026 | ⬜ Approved |
| Xiaomi Redmi Note 10 | | April 12, 2026 | ⬜ Approved |
| Google Pixel 6 | | April 12, 2026 | ⬜ Approved |

### QA Lead Approval

**Name:** ________________________  
**Date:** ________________________  
**Signature:** ________________________

---

**Last Updated:** ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
  `.trim();
  
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  const checklistPath = path.join(CONFIG.outputDir, 'device-checklist.md');
  fs.writeFileSync(checklistPath, checklist);
  
  console.log(`✅ Device checklist generated: ${checklistPath}`);
  console.log(`\n📱 Total devices to test: ${CONFIG.devices.length}`);
  console.log(`📋 Total tests per device: ${CONFIG.tests.length}`);
  console.log(`📊 Total test cases: ${CONFIG.devices.length * CONFIG.tests.length}`);
}

function generateDeviceChecklist(device) {
  return `
## ${device.name} (${device.os})

### Device Specifications

- **Model:** ${device.name}
- **OS:** ${device.os}
- **Screen:** ${device.screen}
- **Resolution:** ${device.resolution}
- **PPI:** ${device.ppi}
- **Browser:** ${device.browser}
- **Priority:** ${device.priority}

### Test Results

| Test ID | Test Name | Expected | Actual | Status | Notes |
|---------|-----------|----------|--------|--------|-------|
${CONFIG.tests.map(t => `| ${t.id} | ${t.name} | ${t.expected} | | ⬜ Pass / ⬜ Fail | |`).join('\n')}

### Issues Found

| Issue ID | Screen | Description | Severity | Screenshot |
|----------|--------|-------------|----------|------------|
| ${device.id}-I01 | | | P0/P1/P2/P3 | ⬜ Yes |
| ${device.id}-I02 | | | P0/P1/P2/P3 | ⬜ Yes |
| ${device.id}-I03 | | | P0/P1/P2/P3 | ⬜ Yes |

### Notes

- Test environment: [Quiet/Noisy]
- Network condition: [WiFi/4G/3G]
- Battery level: [___]%
- Any observations: ________________________

---

**Tester:** ________________________  
**Date:** ________________________
  `.trim();
}

// Run
generateChecklist();
