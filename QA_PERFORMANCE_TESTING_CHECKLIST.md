# Performance Testing Checklist - HmarePanditJi

**Document Version:** 1.0  
**Created:** March 26, 2026  
**QA Lead:** [To Be Assigned]  
**Test Date:** April 14, 2026 (Day 5)  
**Tools:** Lighthouse, Chrome DevTools, WebPageTest

---

## Performance Requirements

### Target Metrics (All Must Pass)

| Metric | Target | Priority |
|--------|--------|----------|
| **Lighthouse Overall Score** | >90 | P0 |
| **Performance Score** | >90 | P0 |
| **Accessibility Score** | >90 | P0 |
| **Best Practices Score** | >90 | P0 |
| **SEO Score** | >90 | P2 |
| **Page Load Time (3G)** | <3s | P0 |
| **TTS Latency** | <300ms | P0 |
| **STT Latency** | <500ms | P0 |
| **Time to Interactive** | <5s | P1 |
| **Memory Usage** | <100MB | P1 |

---

## Lighthouse Audit Results

### Test Configuration
- **Device Emulation:** Moto G4 (Mobile)
- **Network Throttling:** Simulated 4G
- **CPU Throttling:** 4x slowdown
- **Viewport:** 390x844

### Overall Scores

| Page | Overall | Performance | Accessibility | Best Practices | SEO | Status |
|------|---------|-------------|---------------|----------------|-----|--------|
| Splash Screen | 0 | 0 | 0 | 0 | 0 | ⬜ Pass / ⬜ Fail |
| Location Permission | 0 | 0 | 0 | 0 | 0 | ⬜ Pass / ⬜ Fail |
| Language Selection | 0 | 0 | 0 | 0 | 0 | ⬜ Pass / ⬜ Fail |
| Tutorial Screen 1 | 0 | 0 | 0 | 0 | 0 | ⬜ Pass / ⬜ Fail |
| Tutorial Screen 6 | 0 | 0 | 0 | 0 | 0 | ⬜ Pass / ⬜ Fail |
| Tutorial Screen 12 | 0 | 0 | 0 | 0 | 0 | ⬜ Pass / ⬜ Fail |
| Mobile Registration | 0 | 0 | 0 | 0 | 0 | ⬜ Pass / ⬜ Fail |
| OTP Verification | 0 | 0 | 0 | 0 | 0 | ⬜ Pass / ⬜ Fail |
| Profile Complete | 0 | 0 | 0 | 0 | 0 | ⬜ Pass / ⬜ Fail |
| **Average** | **0** | **0** | **0** | **0** | **0** | |

---

## Core Web Vitals

### Performance Metrics (All Pages)

| Metric | Good | Needs Improvement | Poor | Target | Status |
|--------|------|-------------------|------|--------|--------|
| **LCP** (Largest Contentful Paint) | <2.5s | 2.5-4.0s | >4.0s | <2.5s | ⬜ |
| **FID** (First Input Delay) | <100ms | 100-300ms | >300ms | <100ms | ⬜ |
| **CLS** (Cumulative Layout Shift) | <0.1 | 0.1-0.25 | >0.25 | <0.1 | ⬜ |
| **FCP** (First Contentful Paint) | <1.8s | 1.8-3.0s | >3.0s | <1.8s | ⬜ |
| **TTI** (Time to Interactive) | <3.8s | 3.8-7.3s | >7.3s | <3.8s | ⬜ |
| **TBT** (Total Blocking Time) | <200ms | 200-600ms | >600ms | <200ms | ⬜ |

### Detailed Metrics by Page

#### Splash Screen (/onboarding)
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| First Contentful Paint | ___ ms | <1800ms | ⬜ Pass / ⬜ Fail |
| Largest Contentful Paint | ___ ms | <2500ms | ⬜ Pass / ⬜ Fail |
| Time to Interactive | ___ ms | <3800ms | ⬜ Pass / ⬜ Fail |
| Total Blocking Time | ___ ms | <200ms | ⬜ Pass / ⬜ Fail |
| Cumulative Layout Shift | ___ | <0.1 | ⬜ Pass / ⬜ Fail |
| Speed Index | ___ ms | <3400ms | ⬜ Pass / ⬜ Fail |

#### Location Permission (/onboarding)
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| First Contentful Paint | ___ ms | <1800ms | ⬜ Pass / ⬜ Fail |
| Largest Contentful Paint | ___ ms | <2500ms | ⬜ Pass / ⬜ Fail |
| Time to Interactive | ___ ms | <3800ms | ⬜ Pass / ⬜ Fail |
| Total Blocking Time | ___ ms | <200ms | ⬜ Pass / ⬜ Fail |
| Cumulative Layout Shift | ___ | <0.1 | ⬜ Pass / ⬜ Fail |
| Speed Index | ___ ms | <3400ms | ⬜ Pass / ⬜ Fail |

#### Language Selection (/onboarding)
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| First Contentful Paint | ___ ms | <1800ms | ⬜ Pass / ⬜ Fail |
| Largest Contentful Paint | ___ ms | <2500ms | ⬜ Pass / ⬜ Fail |
| Time to Interactive | ___ ms | <3800ms | ⬜ Pass / ⬜ Fail |
| Total Blocking Time | ___ ms | <200ms | ⬜ Pass / ⬜ Fail |
| Cumulative Layout Shift | ___ | <0.1 | ⬜ Pass / ⬜ Fail |
| Speed Index | ___ ms | <3400ms | ⬜ Pass / ⬜ Fail |

#### Tutorial Screen 1 (/onboarding)
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| First Contentful Paint | ___ ms | <1800ms | ⬜ Pass / ⬜ Fail |
| Largest Contentful Paint | ___ ms | <2500ms | ⬜ Pass / ⬜ Fail |
| Time to Interactive | ___ ms | <3800ms | ⬜ Pass / ⬜ Fail |
| Total Blocking Time | ___ ms | <200ms | ⬜ Pass / ⬜ Fail |
| Cumulative Layout Shift | ___ | <0.1 | ⬜ Pass / ⬜ Fail |
| Speed Index | ___ ms | <3400ms | ⬜ Pass / ⬜ Fail |

#### Tutorial Screen 6 (/onboarding)
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| First Contentful Paint | ___ ms | <1800ms | ⬜ Pass / ⬜ Fail |
| Largest Contentful Paint | ___ ms | <2500ms | ⬜ Pass / ⬜ Fail |
| Time to Interactive | ___ ms | <3800ms | ⬜ Pass / ⬜ Fail |
| Total Blocking Time | ___ ms | <200ms | ⬜ Pass / ⬜ Fail |
| Cumulative Layout Shift | ___ | <0.1 | ⬜ Pass / ⬜ Fail |
| Speed Index | ___ ms | <3400ms | ⬜ Pass / ⬜ Fail |

#### Tutorial Screen 12 (/onboarding)
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| First Contentful Paint | ___ ms | <1800ms | ⬜ Pass / ⬜ Fail |
| Largest Contentful Paint | ___ ms | <2500ms | ⬜ Pass / ⬜ Fail |
| Time to Interactive | ___ ms | <3800ms | ⬜ Pass / ⬜ Fail |
| Total Blocking Time | ___ ms | <200ms | ⬜ Pass / ⬜ Fail |
| Cumulative Layout Shift | ___ | <0.1 | ⬜ Pass / ⬜ Fail |
| Speed Index | ___ ms | <3400ms | ⬜ Pass / ⬜ Fail |

#### Mobile Registration (/registration/mobile)
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| First Contentful Paint | ___ ms | <1800ms | ⬜ Pass / ⬜ Fail |
| Largest Contentful Paint | ___ ms | <2500ms | ⬜ Pass / ⬜ Fail |
| Time to Interactive | ___ ms | <3800ms | ⬜ Pass / ⬜ Fail |
| Total Blocking Time | ___ ms | <200ms | ⬜ Pass / ⬜ Fail |
| Cumulative Layout Shift | ___ | <0.1 | ⬜ Pass / ⬜ Fail |
| Speed Index | ___ ms | <3400ms | ⬜ Pass / ⬜ Fail |

#### OTP Verification (/registration/otp)
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| First Contentful Paint | ___ ms | <1800ms | ⬜ Pass / ⬜ Fail |
| Largest Contentful Paint | ___ ms | <2500ms | ⬜ Pass / ⬜ Fail |
| Time to Interactive | ___ ms | <3800ms | ⬜ Pass / ⬜ Fail |
| Total Blocking Time | ___ ms | <200ms | ⬜ Pass / ⬜ Fail |
| Cumulative Layout Shift | ___ | <0.1 | ⬜ Pass / ⬜ Fail |
| Speed Index | ___ ms | <3400ms | ⬜ Pass / ⬜ Fail |

#### Profile Complete (/registration/complete)
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| First Contentful Paint | ___ ms | <1800ms | ⬜ Pass / ⬜ Fail |
| Largest Contentful Paint | ___ ms | <2500ms | ⬜ Pass / ⬜ Fail |
| Time to Interactive | ___ ms | <3800ms | ⬜ Pass / ⬜ Fail |
| Total Blocking Time | ___ ms | <200ms | ⬜ Pass / ⬜ Fail |
| Cumulative Layout Shift | ___ | <0.1 | ⬜ Pass / ⬜ Fail |
| Speed Index | ___ ms | <3400ms | ⬜ Pass / ⬜ Fail |

---

## Network Throttling Tests

### 3G Network Test (Slow Network)

**Configuration:**
- Download: 1.6 Mbps
- Upload: 750 Kbps
- Latency: 150ms RTT

| Page | Load Time | Target | Status |
|------|-----------|--------|--------|
| Splash Screen | ___ s | <3s | ⬜ Pass / ⬜ Fail |
| Location Permission | ___ s | <3s | ⬜ Pass / ⬜ Fail |
| Language Selection | ___ s | <3s | ⬜ Pass / ⬜ Fail |
| Tutorial Screen 1 | ___ s | <3s | ⬜ Pass / ⬜ Fail |
| Mobile Registration | ___ s | <3s | ⬜ Pass / ⬜ Fail |

### 2G Network Test (Very Slow Network)

**Configuration:**
- Download: 280 Kbps
- Upload: 256 Kbps
- Latency: 400ms RTT

| Page | Load Time | Target | Status |
|------|-----------|--------|--------|
| Splash Screen | ___ s | <10s | ⬜ Pass / ⬜ Fail |
| Location Permission | ___ s | <10s | ⬜ Pass / ⬜ Fail |
| Language Selection | ___ s | <10s | ⬜ Pass / ⬜ Fail |

---

## Voice Performance Tests

### TTS (Text-to-Speech) Latency

| Screen | Request Time | Response Time | Total Latency | Target | Status |
|--------|--------------|---------------|---------------|--------|--------|
| S-0.0.2 Location | ___ ms | ___ ms | ___ ms | <300ms | ⬜ |
| S-0.0.3 Language | ___ ms | ___ ms | ___ ms | <300ms | ⬜ |
| S-0.1 Tutorial 1 | ___ ms | ___ ms | ___ ms | <300ms | ⬜ |
| S-0.6 Tutorial 6 | ___ ms | ___ ms | ___ ms | <300ms | ⬜ |
| S-0.12 Tutorial 12 | ___ ms | ___ ms | ___ ms | <300ms | ⬜ |
| S-1.1 Mobile | ___ ms | ___ ms | ___ ms | <300ms | ⬜ |
| S-1.9 Complete | ___ ms | ___ ms | ___ ms | <300ms | ⬜ |

### STT (Speech-to-Text) Latency

| Screen | Request Time | Response Time | Total Latency | Target | Status |
|--------|--------------|---------------|---------------|--------|--------|
| S-0.0.2 Location | ___ ms | ___ ms | ___ ms | <500ms | ⬜ |
| S-0.0.3 Language | ___ ms | ___ ms | ___ ms | <500ms | ⬜ |
| S-0.1 Tutorial 1 | ___ ms | ___ ms | ___ ms | <500ms | ⬜ |
| S-0.6 Tutorial 6 | ___ ms | ___ ms | ___ ms | <500ms | ⬜ |
| S-0.12 Tutorial 12 | ___ ms | ___ ms | ___ ms | <500ms | ⬜ |
| S-1.1 Mobile | ___ ms | ___ ms | ___ ms | <500ms | ⬜ |
| S-1.9 Complete | ___ ms | ___ ms | ___ ms | <500ms | ⬜ |

---

## Memory Usage Tests

### Memory Consumption (Chrome DevTools)

| Page | DOM Nodes | JS Heap Size | Target | Status |
|------|-----------|--------------|--------|--------|
| Splash Screen | ___ | ___ MB | <100MB | ⬜ |
| Location Permission | ___ | ___ MB | <100MB | ⬜ |
| Language Selection | ___ | ___ MB | <100MB | ⬜ |
| Tutorial Screen 1 | ___ | ___ MB | <100MB | ⬜ |
| Tutorial Screen 6 | ___ | ___ MB | <100MB | ⬜ |
| Tutorial Screen 12 | ___ | ___ MB | <100MB | ⬜ |
| Mobile Registration | ___ | ___ MB | <100MB | ⬜ |
| Profile Complete | ___ | ___ MB | <100MB | ⬜ |

### Memory Leak Test

**Procedure:**
1. Open Chrome DevTools → Memory tab
2. Take heap snapshot
3. Navigate through all screens
4. Return to initial screen
5. Take another heap snapshot
6. Compare snapshots for leaks

| Test | Result | Status |
|------|--------|--------|
| Detached DOM nodes | ___ found | ⬜ Pass / ⬜ Fail |
| Growing JS Heap | ___ MB increase | ⬜ Pass / ⬜ Fail |
| Event listener leaks | ___ found | ⬜ Pass / ⬜ Fail |

---

## Lighthouse Opportunities

### Top Optimization Opportunities

| Opportunity | Estimated Savings | Priority | Status |
|-------------|-------------------|----------|--------|
| Eliminate render-blocking resources | ___ s | P0 / P1 / P2 | ⬜ |
| Reduce unused JavaScript | ___ s | P0 / P1 / P2 | ⬜ |
| Reduce unused CSS | ___ s | P0 / P1 / P2 | ⬜ |
| Properly size images | ___ s | P0 / P1 / P2 | ⬜ |
| Defer offscreen images | ___ s | P0 / P1 / P2 | ⬜ |
| Minify JavaScript | ___ s | P0 / P1 / P2 | ⬜ |
| Minify CSS | ___ s | P0 / P1 / P2 | ⬜ |
| Enable text compression | ___ s | P0 / P1 / P2 | ⬜ |
| Use next-gen image formats | ___ s | P0 / P1 / P2 | ⬜ |
| Preconnect to origins | ___ s | P0 / P1 / P2 | ⬜ |
| Preload key requests | ___ s | P0 / P1 / P2 | ⬜ |

---

## Lighthouse Diagnostics

### Diagnostic Results

| Diagnostic | Value | Target | Status |
|------------|-------|--------|--------|
| Minimize main-thread work | ___ s | <2s | ⬜ |
| Reduce JavaScript execution time | ___ s | <1s | ⬜ |
| Avoid enormous network payloads | ___ KB | <1600KB | ⬜ |
| Serve static assets with efficient cache policy | ___ resources | 0 | ⬜ |
| Avoid an excessive DOM size | ___ elements | <1500 | ⬜ |
| Minimize third-party usage | ___ KB | <500KB | ⬜ |
| Avoid long main-thread tasks | ___ tasks | 0 | ⬜ |
| User Timing marks and measures | ___ marks | N/A | ⬜ |
| Avoid non-composited animations | ___ animations | 0 | ⬜ |
| Avoid `@import` for stylesheets | ___ imports | 0 | ⬜ |

---

## Offline Mode Testing

### Service Worker & PWA Tests

| Test | Expected Result | Actual Result | Status |
|------|-----------------|---------------|--------|
| App loads offline | Cached version loads | | ⬜ Pass / ⬜ Fail |
| Offline banner shows | "You're offline" message | | ⬜ Pass / ⬜ Fail |
| Cached pages accessible | Previously visited pages work | | ⬜ Pass / ⬜ Fail |
| Voice features degrade | Graceful fallback to text | | ⬜ Pass / ⬜ Fail |
| Reconnection detected | "Reconnected" message shows | | ⬜ Pass / ⬜ Fail |

---

## Performance Budget

### Budget Thresholds

| Metric | Budget | Actual | Status |
|--------|--------|--------|--------|
| Script size | <500 KB | ___ KB | ⬜ Pass / ⬜ Fail |
| Document size | <50 KB | ___ KB | ⬜ Pass / ⬜ Fail |
| Stylesheet size | <100 KB | ___ KB | ⬜ Pass / ⬜ Fail |
| Image size | <200 KB | ___ KB | ⬜ Pass / ⬜ Fail |
| Font size | <100 KB | ___ KB | ⬜ Pass / ⬜ Fail |
| Total requests | <50 | ___ | ⬜ Pass / ⬜ Fail |
| DOM size | <1500 nodes | ___ | ⬜ Pass / ⬜ Fail |

---

## Performance Issues Log

| Issue ID | Page | Description | Impact | Recommendation | Priority | Status |
|----------|------|-------------|--------|----------------|----------|--------|
| PERF-01 | | | High/Med/Low | | P0/P1/P2/P3 | ⬜ |
| PERF-02 | | | High/Med/Low | | P0/P1/P2/P3 | ⬜ |
| PERF-03 | | | High/Med/Low | | P0/P1/P2/P3 | ⬜ |

---

## Testing Instructions

### How to Run Lighthouse Audit

1. **Open Chrome DevTools**
   ```
   F12 or Ctrl+Shift+I (Windows)
   Cmd+Opt+I (Mac)
   ```

2. **Navigate to Lighthouse Tab**

3. **Select Categories:**
   - [x] Performance
   - [x] Accessibility
   - [x] Best Practices
   - [x] SEO

4. **Select Device:**
   - [x] Mobile

5. **Click "Analyze page load"**

6. **Save Report:**
   - Download JSON
   - Download HTML
   - Save to `qa-reports/performance/`

### How to Run Automated Performance Tests

```bash
# Install dependencies
npm install --save-dev lighthouse puppeteer

# Run performance tests
npm run test:performance

# Or run directly
node scripts/performance-test.js
```

### How to Test Network Throttling

1. **Open Chrome DevTools → Network tab**

2. **Select throttling preset:**
   - Slow 3G
   - Fast 3G
   - Custom (add custom profile)

3. **Reload page and measure load time**

### How to Test Memory Usage

1. **Open Chrome DevTools → Memory tab**

2. **Take heap snapshot**

3. **Interact with app**

4. **Take another snapshot**

5. **Compare for leaks**

---

## Performance Sign-off

### Summary

| Category | Status |
|----------|--------|
| Lighthouse Scores | ⬜ Pass / ⬜ Fail |
| Core Web Vitals | ⬜ Pass / ⬜ Fail |
| Network Throttling | ⬜ Pass / ⬜ Fail |
| Voice Performance | ⬜ Pass / ⬜ Fail |
| Memory Usage | ⬜ Pass / ⬜ Fail |
| Offline Mode | ⬜ Pass / ⬜ Fail |
| Performance Budget | ⬜ Pass / ⬜ Fail |

### Overall Status

⬜ **All Performance Tests Passed**  
⬜ **Some Tests Failed** (___ failures)

---

### QA Lead Approval

**Name:** ________________________  
**Date:** ________________________  
**Signature:** ________________________

---

**Last Updated:** March 26, 2026
