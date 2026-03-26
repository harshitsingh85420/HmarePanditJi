# Performance Test Checklist

**Application:** HmarePanditJi  
**Version:** 0.1.0  
**Test Date:** ___________  
**Tester:** ___________

---

## Core Web Vitals

Measure using Chrome DevTools → Lighthouse

| # | Metric | Target | Actual | Pass | Fail | Notes |
|---|--------|--------|--------|------|------|-------|
| 1.1 | First Contentful Paint (FCP) | <1.5s | ___s | ☐ | ☐ | |
| 1.2 | Time to Interactive (TTI) | <3s | ___s | ☐ | ☐ | |
| 1.3 | Total Blocking Time (TBT) | <200ms | ___ms | ☐ | ☐ | |
| 1.4 | Cumulative Layout Shift (CLS) | <0.1 | ___ | ☐ | ☐ | |
| 1.5 | Largest Contentful Paint (LCP) | <2.5s | ___s | ☐ | ☐ | |
| 1.6 | Speed Index | <3.4s | ___s | ☐ | ☐ | |

---

## Voice System Performance

Measure using Chrome DevTools → Performance tab

| # | Metric | Target | Actual | Pass | Fail | Notes |
|---|--------|--------|--------|------|------|-------|
| 2.1 | TTS latency (cached) | <50ms | ___ms | ☐ | ☐ | |
| 2.2 | TTS latency (uncached) | <300ms | ___ms | ☐ | ☐ | |
| 2.3 | STT interim result | <300ms | ___ms | ☐ | ☐ | |
| 2.4 | STT final result | <1s | ___ms | ☐ | ☐ | |
| 2.5 | Voice intent detection | <100ms | ___ms | ☐ | ☐ | |
| 2.6 | Number word mapping | <50ms | ___ms | ☐ | ☐ | |

---

## UI Performance

| # | Metric | Target | Actual | Pass | Fail | Notes |
|---|--------|--------|--------|------|------|-------|
| 3.1 | Screen transitions | <300ms | ___ms | ☐ | ☐ | |
| 3.2 | Button click response | <100ms | ___ms | ☐ | ☐ | |
| 3.3 | Input field response | <50ms | ___ms | ☐ | ☐ | |
| 3.4 | Image load time | <500ms | ___ms | ☐ | ☐ | |
| 3.5 | Animation frame rate | 60fps | ___fps | ☐ | ☐ | |
| 3.6 | Scroll performance | 60fps | ___fps | ☐ | ☐ | |

---

## Network Performance

Test on various network conditions using Chrome DevTools → Network throttling

### 4G Network

| # | Metric | Target | Actual | Pass | Fail | Notes |
|---|--------|--------|--------|------|------|-------|
| 4.1 | Initial page load | <3s | ___s | ☐ | ☐ | |
| 4.2 | API response time | <500ms | ___ms | ☐ | ☐ | |
| 4.3 | Asset download | <2s | ___s | ☐ | ☐ | |

### 3G Network

| # | Metric | Target | Actual | Pass | Fail | Notes |
|---|--------|--------|--------|------|------|-------|
| 4.4 | Initial page load | <5s | ___s | ☐ | ☐ | |
| 4.5 | API response time | <1s | ___ms | ☐ | ☐ | |
| 4.6 | Asset download | <5s | ___s | ☐ | ☐ | |

### 2G Network

| # | Metric | Target | Actual | Pass | Fail | Notes |
|---|--------|--------|--------|------|------|-------|
| 4.7 | Initial page load | <10s | ___s | ☐ | ☐ | |
| 4.8 | API response time | <2s | ___ms | ☐ | ☐ | |
| 4.9 | Asset download | <10s | ___s | ☐ | ☐ | |

---

## Memory Usage

Measure using Chrome DevTools → Memory tab

| # | Metric | Target | Actual | Pass | Fail | Notes |
|---|--------|--------|--------|------|------|-------|
| 5.1 | Initial memory usage | <50MB | ___MB | ☐ | ☐ | |
| 5.2 | After onboarding | <100MB | ___MB | ☐ | ☐ | |
| 5.3 | After registration | <150MB | ___MB | ☐ | ☐ | |
| 5.4 | Memory leak test | No increase | ___ | ☐ | ☐ | |

---

## Bundle Size

| # | Metric | Target | Actual | Pass | Fail | Notes |
|---|--------|--------|--------|------|------|-------|
| 6.1 | JavaScript bundle | <500KB | ___KB | ☐ | ☐ | |
| 6.2 | CSS bundle | <100KB | ___KB | ☐ | ☐ | |
| 6.3 | Total initial load | <1MB | ___KB | ☐ | ☐ | |
| 6.4 | Image assets | <500KB | ___KB | ☐ | ☐ | |

---

## Summary

| Category | Pass | Fail | Total | Percentage |
|----------|------|------|-------|------------|
| Core Web Vitals | ___ | ___ | 6 | ___% |
| Voice System | ___ | ___ | 6 | ___% |
| UI Performance | ___ | ___ | 6 | ___% |
| Network Performance | ___ | ___ | 9 | ___% |
| Memory Usage | ___ | ___ | 4 | ___% |
| Bundle Size | ___ | ___ | 4 | ___% |
| **TOTAL** | **___** | **___** | **35** | **___%** |

**Pass Rate Target:** 90%  
**Actual Pass Rate:** ___%  
**Status:** ☐ Pass ☐ Fail

---

## Performance Issues Found

| ID | Severity | Description | Category | Recommendation |
|----|----------|-------------|----------|----------------|
| | | | | |
| | | | | |

---

## Sign-off

**Tester:** ___________  
**Date:** ___________  
**QA Lead:** ___________
