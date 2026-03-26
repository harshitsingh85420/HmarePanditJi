# Security Test Checklist

**Application:** HmarePanditJi  
**Version:** 0.1.0  
**Test Date:** ___________  
**Tester:** ___________

---

## Authentication & Authorization

| # | Test Case | Expected Result | Pass | Fail | Notes |
|---|-----------|-----------------|------|------|-------|
| 1.1 | API keys not exposed in client | No keys in source code | ☐ | ☐ | |
| 1.2 | .env.local not committed | In .gitignore | ☐ | ☐ | |
| 1.3 | Session tokens expire | Tokens invalidate after timeout | ☐ | ☐ | |
| 1.4 | Rate limiting on API | Requests limited per IP | ☐ | ☐ | |
| 1.5 | CORS configured correctly | Only allowed origins | ☐ | ☐ | |

---

## Input Validation

| # | Test Case | Expected Result | Pass | Fail | Notes |
|---|-----------|-----------------|------|------|-------|
| 2.1 | XSS protection (no innerHTML) | Using textContent/safe methods | ☐ | ☐ | |
| 2.2 | Input sanitization | No script injection possible | ☐ | ☐ | |
| 2.3 | SQL injection prevention | Parameterized queries used | ☐ | ☐ | |
| 2.4 | Mobile number validation | Only digits accepted | ☐ | ☐ | |
| 2.5 | OTP validation | Only 6 digits accepted | ☐ | ☐ | |
| 2.6 | Name validation | No special characters | ☐ | ☐ | |

---

## Network Security

| # | Test Case | Expected Result | Pass | Fail | Notes |
|---|-----------|-----------------|------|------|-------|
| 3.1 | HTTPS enforced in production | No HTTP allowed | ☐ | ☐ | |
| 3.2 | HSTS header present | Strict-Transport-Security set | ☐ | ☐ | |
| 3.3 | Secure cookies | HttpOnly, Secure flags | ☐ | ☐ | |
| 3.4 | CSRF protection on forms | CSRF tokens present | ☐ | ☐ | |
| 3.5 | No sensitive data in URL | URLs clean | ☐ | ☐ | |

---

## Data Protection

| # | Test Case | Expected Result | Pass | Fail | Notes |
|---|-----------|-----------------|------|------|-------|
| 4.1 | Phone numbers encrypted at rest | Database encryption | ☐ | ☐ | |
| 4.2 | No PII in logs | Logs sanitized | ☐ | ☐ | |
| 4.3 | Session data encrypted | Secure session storage | ☐ | ☐ | |
| 4.4 | LocalStorage cleared on logout | No残留 data | ☐ | ☐ | |
| 4.5 | No sensitive data in errors | Generic error messages | ☐ | ☐ | |

---

## Voice System Security

| # | Test Case | Expected Result | Pass | Fail | Notes |
|---|-----------|-----------------|------|------|-------|
| 5.1 | Microphone permission handled | User can deny | ☐ | ☐ | |
| 5.2 | Audio not stored permanently | Temporary only | ☐ | ☐ | |
| 5.3 | STT API keys secured | Server-side only | ☐ | ☐ | |
| 5.4 | Voice data not logged | No transcripts in logs | ☐ | ☐ | |
| 5.5 | Audio stream encrypted | HTTPS/WSS used | ☐ | ☐ | |

---

## Dependency Security

| # | Test Case | Expected Result | Pass | Fail | Notes |
|---|-----------|-----------------|------|------|-------|
| 6.1 | No known vulnerable packages | npm audit clean | ☐ | ☐ | |
| 6.2 | Dependencies up to date | No major outdated | ☐ | ☐ | |
| 6.3 | No deprecated packages | All packages current | ☐ | ☐ | |
| 6.4 | Lock file committed | pnpm-lock.yaml present | ☐ | ☐ | |

---

## Security Headers

| # | Header | Expected Value | Actual | Pass | Fail |
|---|--------|----------------|--------|------|------|
| 7.1 | Content-Security-Policy | default-src 'self' | ___ | ☐ | ☐ |
| 7.2 | X-Content-Type-Options | nosniff | ___ | ☐ | ☐ |
| 7.3 | X-Frame-Options | DENY | ___ | ☐ | ☐ |
| 7.4 | X-XSS-Protection | 1; mode=block | ___ | ☐ | ☐ |
| 7.5 | Referrer-Policy | strict-origin-when-cross-origin | ___ | ☐ | ☐ |
| 7.6 | Permissions-Policy | microphone=() | ___ | ☐ | ☐ |

---

## Penetration Testing

| # | Test Case | Expected Result | Pass | Fail | Notes |
|---|-----------|-----------------|------|------|-------|
| 8.1 | Directory traversal blocked | ../ blocked | ☐ | ☐ | |
| 8.2 | Command injection blocked | Shell chars blocked | ☐ | ☐ | |
| 8.3 | Path manipulation blocked | Absolute paths blocked | ☐ | ☐ | |
| 8.4 | File upload restrictions | Only allowed types | ☐ | ☐ | |
| 8.5 | API enumeration blocked | No info leakage | ☐ | ☐ | |

---

## Summary

| Category | Pass | Fail | Total | Percentage |
|----------|------|------|-------|------------|
| Authentication & Authorization | ___ | ___ | 5 | ___% |
| Input Validation | ___ | ___ | 6 | ___% |
| Network Security | ___ | ___ | 5 | ___% |
| Data Protection | ___ | ___ | 5 | ___% |
| Voice System Security | ___ | ___ | 5 | ___% |
| Dependency Security | ___ | ___ | 4 | ___% |
| Security Headers | ___ | ___ | 6 | ___% |
| Penetration Testing | ___ | ___ | 5 | ___% |
| **TOTAL** | **___** | **___** | **41** | **___%** |

**Pass Rate Target:** 100% (Security is critical)  
**Actual Pass Rate:** ___%  
**Status:** ☐ Pass ☐ Fail

---

## Security Issues Found

| ID | Severity | Description | Category | Remediation |
|----|----------|-------------|----------|-------------|
| | Critical/High/Medium/Low | | | |
| | | | | |

---

## Sign-off

**Security Tester:** ___________  
**Date:** ___________  
**Security Lead:** ___________  
**Date:** ___________
