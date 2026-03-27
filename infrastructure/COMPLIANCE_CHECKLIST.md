# Compliance Checklist - HmarePanditJi

## Overview

This document ensures compliance with:
- GDPR (EU General Data Protection Regulation)
- India DPDP Act 2023 (Digital Personal Data Protection)
- RBI Guidelines (Payment Data)
- MeitY Guidelines (Indian IT Act)

---

## 📋 Data Protection Compliance

### GDPR Compliance

#### ✅ Lawful Basis for Processing
- [ ] Consent obtained for all data collection
- [ ] Privacy policy published and accessible
- [ ] Cookie consent banner implemented
- [ ] Legitimate interest documented

#### ✅ Data Subject Rights
- [ ] Right to access (download my data)
- [ ] Right to rectification (edit profile)
- [ ] Right to erasure (delete account)
- [ ] Right to data portability
- [ ] Right to object to processing

#### ✅ Data Minimization
- [ ] Only necessary data collected
- [ ] No excessive permissions requested
- [ ] Data retention policy defined

#### ✅ Security Measures
- [ ] HTTPS enforced (Vercel auto-SSL)
- [ ] Data encryption at rest
- [ ] Data encryption in transit
- [ ] Access controls implemented
- [ ] Audit logs maintained

### India DPDP Act 2023 Compliance

#### ✅ Key Requirements
- [ ] Consent manager implemented
- [ ] Data principal rights enabled
- [ ] Grievance officer appointed
- [ ] Data breach notification process
- [ ] Children's data protection (<18 years)

#### ✅ Implementation
```
Consent Manager:
- Granular consent options
- Withdraw consent functionality
- Consent records maintained

Grievance Officer:
- Name: [To be appointed]
- Email: grievance@hmarepanditji.com
- Response time: 24 hours
```

---

## 🔒 Security Compliance

### RBI Payment Data Guidelines

#### ✅ Card Data Protection
- [ ] No card data stored on servers
- [ ] PCI-DSS compliant payment gateway (Razorpay)
- [ ] Tokenization for recurring payments
- [ ] Secure payment flow (HTTPS)

#### ✅ Transaction Security
- [ ] Two-factor authentication
- [ ] Transaction alerts (SMS/Email)
- [ ] Fraud detection system
- [ ] Dispute resolution process

### MeitY IT Act Compliance

#### ✅ Reasonable Security Practices
- [ ] Information Security Policy
- [ ] Chief Information Security Officer appointed
- [ ] Regular security audits
- [ ] Incident response plan
- [ ] Employee training conducted

---

## 🍪 Cookie Compliance

### Cookie Categories

| Category | Purpose | Consent Required |
|----------|---------|------------------|
| **Essential** | Authentication, security | No |
| **Analytics** | GA4, Vercel Analytics | Yes |
| **Functional** | Language preference | Yes |
| **Marketing** | Retargeting (future) | Yes |

### Cookie Consent Implementation

```tsx
// components/CookieConsent.tsx
- Banner shown on first visit
- Granular consent options
- Easy withdrawal
- Consent stored in localStorage
- Respects Do Not Track
```

### Cookie Policy Page
- [ ] List of all cookies used
- [ ] Purpose of each cookie
- [ ] Duration (session/persistent)
- [ ] Third-party cookies disclosed

---

## 📄 Required Legal Documents

### Privacy Policy
**Location**: https://hmarepanditji.com/privacy

**Sections**:
1. Information collected
2. How information is used
3. Data sharing practices
4. Data retention period
5. User rights
6. Security measures
7. Contact information
8. Grievance redressal

### Terms of Service
**Location**: https://hmarepanditji.com/terms

**Sections**:
1. Acceptable use
2. User obligations
3. Intellectual property
4. Disclaimers
5. Limitation of liability
6. Dispute resolution
7. Governing law

### Cookie Policy
**Location**: https://hmarepanditji.com/cookies

**Sections**:
1. What are cookies
2. Types of cookies used
3. How to manage cookies
4. Third-party cookies

### Refund & Cancellation Policy
**Location**: https://hmarepanditji.com/refund-policy

**Sections**:
1. Cancellation timeline
2. Refund process
3. Refund timeline
4. Exceptions

---

## 🔐 Data Processing Activities

### Data Categories

| Category | Data Types | Purpose | Retention |
|----------|-----------|---------|-----------|
| **Identity** | Name, Aadhaar (encrypted), Photo | Verification | 7 years |
| **Contact** | Phone, Email, Address | Communication | Account lifetime + 3 years |
| **Financial** | Bank details, UPI ID | Payments | 7 years (RBI) |
| **Location** | GPS coordinates | Service matching | 1 year |
| **Behavioral** | App usage, Preferences | Personalization | 2 years |

### Data Flow Diagram

```
User → Frontend (Encryption) → API → Database (Encrypted)
                              ↓
                        Third Parties (Razorpay, MSG91)
```

### Third-Party Data Sharing

| Provider | Data Shared | Purpose | Compliance |
|----------|-------------|---------|------------|
| **Razorpay** | Payment details | Payment processing | PCI-DSS |
| **MSG91** | Phone number | OTP/SMS | DPDP |
| **Firebase** | Device token | Push notifications | GDPR |
| **Google Analytics** | Usage data | Analytics | GDPR |
| **Sentry** | Error logs | Error tracking | GDPR |

---

## 🚨 Data Breach Response

### Breach Classification

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **Critical** | >10,000 users affected | 6 hours |
| **High** | Sensitive data exposed | 12 hours |
| **Medium** | Limited data exposure | 24 hours |
| **Low** | Minimal risk | 72 hours |

### Breach Notification Process

1. **Detection**: Monitor alerts (Sentry, UptimeRobot)
2. **Assessment**: Determine severity and scope
3. **Containment**: Isolate affected systems
4. **Notification**: 
   - Users affected (Email/SMS)
   - CERT-In (for critical breaches)
   - Data Protection Board (if required)
5. **Remediation**: Fix vulnerability
6. **Documentation**: Incident report

---

## ✅ Compliance Audit Checklist

### Quarterly Audits

- [ ] Access control review
- [ ] Data retention compliance
- [ ] Third-party vendor assessment
- [ ] Security patch status
- [ ] Incident response drill

### Annual Audits

- [ ] External security audit
- [ ] Privacy impact assessment
- [ ] Compliance training
- [ ] Policy review and update
- [ ] Penetration testing

---

## 📞 Compliance Contacts

| Role | Name | Contact |
|------|------|---------|
| **Data Protection Officer** | [To be appointed] | dpo@hmarepanditji.com |
| **Grievance Officer** | [To be appointed] | grievance@hmarepanditji.com |
| **Legal Counsel** | [To be appointed] | legal@hmarepanditji.com |

### Regulatory Bodies

- **CERT-In**: https://www.cert-in.org.in
- **Data Protection Board of India**: [To be established]
- **RBI Ombudsman**: https://cms.rbi.org.in

---

## 📚 Resources

- GDPR Text: https://gdpr-info.eu
- DPDP Act 2023: https://www.meity.gov.in/data-protection-framework
- RBI Guidelines: https://www.rbi.org.in/scripts/BS_PressReleaseDisplay.aspx
- CERT-In Guidelines: https://www.cert-in.org.in

---

**Last Updated**: March 27, 2026  
**Next Review**: June 27, 2026  
**Maintained By**: Legal & Compliance Team
