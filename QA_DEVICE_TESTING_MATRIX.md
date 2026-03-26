# Device Testing Matrix - HmarePanditJi

**Document Version:** 1.0  
**Created:** March 26, 2026  
**QA Lead:** [To Be Assigned]  
**Testing Date:** April 12, 2026 (Day 3)

---

## Device Testing Overview

### Target Devices (5 Devices)

| Priority | Device | OS | Screen Size | Resolution | PPI | Status |
|----------|--------|-----|-------------|------------|-----|--------|
| P0 | Samsung Galaxy A12 | Android 11 | 6.5" | 720 x 1600 | 270 | **Target Device** |
| P1 | iPhone 12 | iOS 15 | 6.1" | 1170 x 2532 | 460 | Available |
| P1 | OnePlus 9 | Android 12 | 6.55" | 1080 x 2400 | 402 | Available |
| P1 | Xiaomi Redmi Note 10 | Android 11 | 6.43" | 1080 x 2400 | 409 | Available |
| P2 | Google Pixel 6 | Android 12 | 6.4" | 1080 x 2400 | 411 | Available |

### Alternative Testing (If Physical Device Unavailable)

| Device | BrowserStack Equivalent | Chrome DevTools Preset |
|--------|------------------------|------------------------|
| Samsung Galaxy A12 | Samsung Galaxy A12 | Samsung Galaxy A12 (390x844) |
| iPhone 12 | iPhone 12 | iPhone 12 Pro (390x844) |
| OnePlus 9 | OnePlus 9 | OnePlus 9 Pro (412x919) |
| Xiaomi Redmi Note 10 | Xiaomi Redmi Note 10 | Custom (393x851) |
| Google Pixel 6 | Google Pixel 6 | Pixel 5 (393x851) |

---

## Device Test Matrix

### Test Categories

| Category | Tests | Priority |
|----------|-------|----------|
| App Loading | Load time, errors, splash screen | P0 |
| Screen Rendering | All 30 screens render correctly | P0 |
| Voice Playback | TTS works on all screens | P0 |
| Voice Recognition | STT works accurately | P0 |
| Touch Targets | All buttons 72px minimum | P1 |
| Text Readability | Text readable without glasses | P1 |
| Navigation | Back, Next, Skip buttons work | P0 |
| Forms | Input fields work correctly | P1 |
| Animations | Animations smooth (60fps) | P2 |
| Network Handling | Offline, slow network handling | P1 |

---

## Device 1: Samsung Galaxy A12 (Android 11) - TARGET DEVICE

### Device Specifications
```
Model: Samsung Galaxy A12
OS: Android 11
Screen: 6.5" PLS IPS LCD
Resolution: 720 x 1600 pixels
PPI: 270
RAM: 3GB / 4GB
Storage: 32GB / 64GB
Browser: Chrome 120
Touch: Multi-touch (up to 5 fingers)
```

### Test Results

| Test ID | Test Name | Expected Result | Actual Result | Status | Notes |
|---------|-----------|-----------------|---------------|--------|-------|
| D1-T01 | App loads successfully | App loads in <5s | | ⬜ Pass / ⬜ Fail | |
| D1-T02 | Splash screen displays | Shows for 3s, no errors | | ⬜ Pass / ⬜ Fail | |
| D1-T03 | S-0.0.2 Location Permission | Screen renders, voice plays | | ⬜ Pass / ⬜ Fail | |
| D1-T04 | S-0.0.3 Language Selection | All 15 languages visible | | ⬜ Pass / ⬜ Fail | |
| D1-T05 | S-0.1 to S-0.12 Tutorial | All screens render | | ⬜ Pass / ⬜ Fail | |
| D1-T06 | S-1.1 to S-1.9 Registration | All screens render | | ⬜ Pass / ⬜ Fail | |
| D1-T07 | TTS playback (all screens) | Voice plays within 500ms | | ⬜ Pass / ⬜ Fail | |
| D1-T08 | STT recognition | Recognizes Hindi YES/NO | | ⬜ Pass / ⬜ Fail | |
| D1-T09 | Touch target size (buttons) | All buttons ≥72px | | ⬜ Pass / ⬜ Fail | Measured with ruler |
| D1-T10 | Text readability | 16px minimum, clear | | ⬜ Pass / ⬜ Fail | Without glasses test |
| D1-T11 | Navigation (Back/Next/Skip) | All buttons responsive | | ⬜ Pass / ⬜ Fail | |
| D1-T12 | Form inputs | Text fields work | | ⬜ Pass / ⬜ Fail | |
| D1-T13 | Animations | Smooth, no jank | | ⬜ Pass / ⬜ Fail | |
| D1-T14 | Offline mode | Graceful degradation | | ⬜ Pass / ⬜ Fail | |
| D1-T15 | 3G network | Load time <10s | | ⬜ Pass / ⬜ Fail | Throttled |

### Touch Target Measurements (Samsung Galaxy A12)

| Element | Expected | Measured | Status |
|---------|----------|----------|--------|
| CTA Button (आगे) | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Skip Button | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Back Button | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Language Tiles | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Income Tiles | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Mic Button | 72px min height | ___ px | ⬜ Pass / ⬜ Fail |
| Input Fields | 48px min height | ___ px | ⬜ Pass / ⬜ Fail |

### Issues Found (Samsung Galaxy A12)

| Issue ID | Screen | Description | Severity | Screenshot |
|----------|--------|-------------|----------|------------|
| D1-I01 | | | P0 / P1 / P2 / P3 | ⬜ Yes |
| D1-I02 | | | P0 / P1 / P2 / P3 | ⬜ Yes |
| D1-I03 | | | P0 / P1 / P2 / P3 | ⬜ Yes |

---

## Device 2: iPhone 12 (iOS 15)

### Device Specifications
```
Model: iPhone 12
OS: iOS 15.7
Screen: 6.1" Super Retina XDR OLED
Resolution: 1170 x 2532 pixels
PPI: 460
RAM: 4GB
Storage: 64GB / 128GB / 256GB
Browser: Safari 15
Touch: 3D Touch
```

### Test Results

| Test ID | Test Name | Expected Result | Actual Result | Status | Notes |
|---------|-----------|-----------------|---------------|--------|-------|
| D2-T01 | App loads successfully | App loads in <5s | | ⬜ Pass / ⬜ Fail | |
| D2-T02 | Splash screen displays | Shows for 3s, no errors | | ⬜ Pass / ⬜ Fail | |
| D2-T03 | S-0.0.2 Location Permission | Screen renders, voice plays | | ⬜ Pass / ⬜ Fail | |
| D2-T04 | S-0.0.3 Language Selection | All 15 languages visible | | ⬜ Pass / ⬜ Fail | |
| D2-T05 | S-0.1 to S-0.12 Tutorial | All screens render | | ⬜ Pass / ⬜ Fail | |
| D2-T06 | S-1.1 to S-1.9 Registration | All screens render | | ⬜ Pass / ⬜ Fail | |
| D2-T07 | TTS playback (all screens) | Voice plays within 500ms | | ⬜ Pass / ⬜ Fail | iOS specific |
| D2-T08 | STT recognition | Recognizes Hindi YES/NO | | ⬜ Pass / ⬜ Fail | iOS specific |
| D2-T09 | Touch target size (buttons) | All buttons ≥72px | | ⬜ Pass / ⬜ Fail | |
| D2-T10 | Text readability | 16px minimum, clear | | ⬜ Pass / ⬜ Fail | |
| D2-T11 | Navigation (Back/Next/Skip) | All buttons responsive | | ⬜ Pass / ⬜ Fail | iOS Safari |
| D2-T12 | Form inputs | Text fields work | | ⬜ Pass / ⬜ Fail | iOS keyboard |
| D2-T13 | Animations | Smooth, no jank | | ⬜ Pass / ⬜ Fail | |
| D2-T14 | Offline mode | Graceful degradation | | ⬜ Pass / ⬜ Fail | |
| D2-T15 | 3G network | Load time <10s | | ⬜ Pass / ⬜ Fail | Throttled |

### iOS-Specific Tests

| Test ID | Test Name | Expected Result | Actual Result | Status |
|---------|-----------|-----------------|---------------|--------|
| D2-iOS-T01 | Safari compatibility | No console errors | | ⬜ Pass / ⬜ Fail |
| D2-iOS-T02 | iOS microphone permission | Permission prompt shows | | ⬜ Pass / ⬜ Fail |
| D2-iOS-T03 | iOS audio playback | Auto-play works | | ⬜ Pass / ⬜ Fail |
| D2-iOS-T04 | Safe area insets | Content not cut off | | ⬜ Pass / ⬜ Fail |
| D2-iOS-T05 | Notch handling | TopBar visible | | ⬜ Pass / ⬜ Fail |

### Issues Found (iPhone 12)

| Issue ID | Screen | Description | Severity | Screenshot |
|----------|--------|-------------|----------|------------|
| D2-I01 | | | P0 / P1 / P2 / P3 | ⬜ Yes |
| D2-I02 | | | P0 / P1 / P2 / P3 | ⬜ Yes |
| D2-I03 | | | P0 / P1 / P2 / P3 | ⬜ Yes |

---

## Device 3: OnePlus 9 (Android 12)

### Device Specifications
```
Model: OnePlus 9
OS: Android 12 (OxygenOS 12)
Screen: 6.55" Fluid AMOLED
Resolution: 1080 x 2400 pixels
PPI: 402
RAM: 8GB
Storage: 128GB / 256GB
Browser: Chrome 120
Touch: Multi-touch
```

### Test Results

| Test ID | Test Name | Expected Result | Actual Result | Status | Notes |
|---------|-----------|-----------------|---------------|--------|-------|
| D3-T01 | App loads successfully | App loads in <5s | | ⬜ Pass / ⬜ Fail | |
| D3-T02 | Splash screen displays | Shows for 3s, no errors | | ⬜ Pass / ⬜ Fail | |
| D3-T03 | S-0.0.2 Location Permission | Screen renders, voice plays | | ⬜ Pass / ⬜ Fail | |
| D3-T04 | S-0.0.3 Language Selection | All 15 languages visible | | ⬜ Pass / ⬜ Fail | |
| D3-T05 | S-0.1 to S-0.12 Tutorial | All screens render | | ⬜ Pass / ⬜ Fail | |
| D3-T06 | S-1.1 to S-1.9 Registration | All screens render | | ⬜ Pass / ⬜ Fail | |
| D3-T07 | TTS playback (all screens) | Voice plays within 500ms | | ⬜ Pass / ⬜ Fail | |
| D3-T08 | STT recognition | Recognizes Hindi YES/NO | | ⬜ Pass / ⬜ Fail | |
| D3-T09 | Touch target size (buttons) | All buttons ≥72px | | ⬜ Pass / ⬜ Fail | |
| D3-T10 | Text readability | 16px minimum, clear | | ⬜ Pass / ⬜ Fail | |
| D3-T11 | Navigation (Back/Next/Skip) | All buttons responsive | | ⬜ Pass / ⬜ Fail | |
| D3-T12 | Form inputs | Text fields work | | ⬜ Pass / ⬜ Fail | |
| D3-T13 | Animations | Smooth, no jank | | ⬜ Pass / ⬜ Fail | 120Hz display |
| D3-T14 | Offline mode | Graceful degradation | | ⬜ Pass / ⬜ Fail | |
| D3-T15 | 3G network | Load time <10s | | ⬜ Pass / ⬜ Fail | Throttled |

### Issues Found (OnePlus 9)

| Issue ID | Screen | Description | Severity | Screenshot |
|----------|--------|-------------|----------|------------|
| D3-I01 | | | P0 / P1 / P2 / P3 | ⬜ Yes |
| D3-I02 | | | P0 / P1 / P2 / P3 | ⬜ Yes |
| D3-I03 | | | P0 / P1 / P2 / P3 | ⬜ Yes |

---

## Device 4: Xiaomi Redmi Note 10 (Android 11)

### Device Specifications
```
Model: Xiaomi Redmi Note 10
OS: Android 11 (MIUI 12.5)
Screen: 6.43" Super AMOLED
Resolution: 1080 x 2400 pixels
PPI: 409
RAM: 4GB / 6GB
Storage: 64GB / 128GB
Browser: Chrome 120 (MIUI Browser fallback)
Touch: Multi-touch
```

### Test Results

| Test ID | Test Name | Expected Result | Actual Result | Status | Notes |
|---------|-----------|-----------------|---------------|--------|-------|
| D4-T01 | App loads successfully | App loads in <5s | | ⬜ Pass / ⬜ Fail | |
| D4-T02 | Splash screen displays | Shows for 3s, no errors | | ⬜ Pass / ⬜ Fail | |
| D4-T03 | S-0.0.2 Location Permission | Screen renders, voice plays | | ⬜ Pass / ⬜ Fail | |
| D4-T04 | S-0.0.3 Language Selection | All 15 languages visible | | ⬜ Pass / ⬜ Fail | |
| D4-T05 | S-0.1 to S-0.12 Tutorial | All screens render | | ⬜ Pass / ⬜ Fail | |
| D4-T06 | S-1.1 to S-1.9 Registration | All screens render | | ⬜ Pass / ⬜ Fail | |
| D4-T07 | TTS playback (all screens) | Voice plays within 500ms | | ⬜ Pass / ⬜ Fail | |
| D4-T08 | STT recognition | Recognizes Hindi YES/NO | | ⬜ Pass / ⬜ Fail | |
| D4-T09 | Touch target size (buttons) | All buttons ≥72px | | ⬜ Pass / ⬜ Fail | |
| D4-T10 | Text readability | 16px minimum, clear | | ⬜ Pass / ⬜ Fail | |
| D4-T11 | Navigation (Back/Next/Skip) | All buttons responsive | | ⬜ Pass / ⬜ Fail | |
| D4-T12 | Form inputs | Text fields work | | ⬜ Pass / ⬜ Fail | |
| D4-T13 | Animations | Smooth, no jank | | ⬜ Pass / ⬜ Fail | |
| D4-T14 | Offline mode | Graceful degradation | | ⬜ Pass / ⬜ Fail | |
| D4-T15 | 3G network | Load time <10s | | ⬜ Pass / ⬜ Fail | Throttled |

### MIUI-Specific Tests

| Test ID | Test Name | Expected Result | Actual Result | Status |
|---------|-----------|-----------------|---------------|--------|
| D4-MIUI-T01 | MIUI browser compatibility | No console errors | | ⬜ Pass / ⬜ Fail |
| D4-MIUI-T02 | MIUI permissions | Permission prompt shows | | ⬜ Pass / ⬜ Fail |
| D4-MIUI-T03 | MIUI battery optimization | App not killed | | ⬜ Pass / ⬜ Fail |

### Issues Found (Xiaomi Redmi Note 10)

| Issue ID | Screen | Description | Severity | Screenshot |
|----------|--------|-------------|----------|------------|
| D4-I01 | | | P0 / P1 / P2 / P3 | ⬜ Yes |
| D4-I02 | | | P0 / P1 / P2 / P3 | ⬜ Yes |
| D4-I03 | | | P0 / P1 / P2 / P3 | ⬜ Yes |

---

## Device 5: Google Pixel 6 (Android 12)

### Device Specifications
```
Model: Google Pixel 6
OS: Android 12
Screen: 6.4" AMOLED
Resolution: 1080 x 2400 pixels
PPI: 411
RAM: 8GB
Storage: 128GB / 256GB
Browser: Chrome 120
Touch: Multi-touch
```

### Test Results

| Test ID | Test Name | Expected Result | Actual Result | Status | Notes |
|---------|-----------|-----------------|---------------|--------|-------|
| D5-T01 | App loads successfully | App loads in <5s | | ⬜ Pass / ⬜ Fail | |
| D5-T02 | Splash screen displays | Shows for 3s, no errors | | ⬜ Pass / ⬜ Fail | |
| D5-T03 | S-0.0.2 Location Permission | Screen renders, voice plays | | ⬜ Pass / ⬜ Fail | |
| D5-T04 | S-0.0.3 Language Selection | All 15 languages visible | | ⬜ Pass / ⬜ Fail | |
| D5-T05 | S-0.1 to S-0.12 Tutorial | All screens render | | ⬜ Pass / ⬜ Fail | |
| D5-T06 | S-1.1 to S-1.9 Registration | All screens render | | ⬜ Pass / ⬜ Fail | |
| D5-T07 | TTS playback (all screens) | Voice plays within 500ms | | ⬜ Pass / ⬜ Fail | |
| D5-T08 | STT recognition | Recognizes Hindi YES/NO | | ⬜ Pass / ⬜ Fail | |
| D5-T09 | Touch target size (buttons) | All buttons ≥72px | | ⬜ Pass / ⬜ Fail | |
| D5-T10 | Text readability | 16px minimum, clear | | ⬜ Pass / ⬜ Fail | |
| D5-T11 | Navigation (Back/Next/Skip) | All buttons responsive | | ⬜ Pass / ⬜ Fail | |
| D5-T12 | Form inputs | Text fields work | | ⬜ Pass / ⬜ Fail | |
| D5-T13 | Animations | Smooth, no jank | | ⬜ Pass / ⬜ Fail | |
| D5-T14 | Offline mode | Graceful degradation | | ⬜ Pass / ⬜ Fail | |
| D5-T15 | 3G network | Load time <10s | | ⬜ Pass / ⬜ Fail | Throttled |

### Pixel-Specific Tests

| Test ID | Test Name | Expected Result | Actual Result | Status |
|---------|-----------|-----------------|---------------|--------|
| D5-Pixel-T01 | Stock Android compatibility | No console errors | | ⬜ Pass / ⬜ Fail |
| D5-Pixel-T02 | Google Assistant integration | No conflicts | | ⬜ Pass / ⬜ Fail |
| D5-Pixel-T03 | Material You theming | Adapts to system theme | | ⬜ Pass / ⬜ Fail |

### Issues Found (Google Pixel 6)

| Issue ID | Screen | Description | Severity | Screenshot |
|----------|--------|-------------|----------|------------|
| D5-I01 | | | P0 / P1 / P2 / P3 | ⬜ Yes |
| D5-I02 | | | P0 / P1 / P2 / P3 | ⬜ Yes |
| D5-I03 | | | P0 / P1 / P2 / P3 | ⬜ Yes |

---

## Device Comparison Summary

### Overall Pass/Fail Summary

| Test | Samsung A12 | iPhone 12 | OnePlus 9 | Xiaomi Note 10 | Pixel 6 |
|------|-------------|-----------|-----------|----------------|---------|
| T01 App Load | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| T02 Splash | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| T03 S-0.0.2 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| T04 S-0.0.3 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| T05 Tutorial | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| T06 Registration | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| T07 TTS | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| T08 STT | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| T09 Touch | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| T10 Text | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| T11 Navigation | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| T12 Forms | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| T13 Animations | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| T14 Offline | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| T15 3G | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **Total Pass** | **0/15** | **0/15** | **0/15** | **0/15** | **0/15** |

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

## Testing Instructions

### Physical Device Setup

1. **Install App on Device**
   ```bash
   # Connect device via USB
   adb devices  # Android
   # Or use Xcode for iOS
   
   # Deploy app
   npm run build
   npm run start
   # Access via device browser: http://<your-ip>:3002
   ```

2. **Enable Remote Debugging**
   - **Android:** Chrome DevTools → Remote Devices
   - **iOS:** Safari → Develop → [Device Name]

3. **Measure Touch Targets**
   - Use physical ruler or digital caliper
   - Measure actual screen size (not CSS pixels)
   - Minimum: 72px height for all buttons

4. **Test Text Readability**
   - Hold device at normal reading distance (~30cm)
   - Text should be readable without glasses
   - Minimum font size: 16px

5. **Test Voice Features**
   - Test in quiet environment first
   - Test in noisy environment (65dB+)
   - Verify speaker volume is adequate

### BrowserStack Setup (Alternative)

1. **Sign in to BrowserStack**
   - URL: https://www.browserstack.com
   - Use company credentials

2. **Select Device**
   - Choose from device list
   - Enable "Local Testing" for localhost

3. **Run Tests**
   - Navigate to http://localhost:3002
   - Follow same test matrix as physical devices

---

## Screenshot Guidelines

### Required Screenshots

For each issue found, capture:
1. **Full screen** showing the issue
2. **Close-up** of affected element
3. **Console logs** (if applicable)
4. **Network tab** (if applicable)

### Screenshot Naming Convention
```
{DeviceID}-{ScreenID}-{IssueID}-{Description}.png
Example: D1-S0.2-I01-button-not-clickable.png
```

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

**Last Updated:** March 26, 2026
