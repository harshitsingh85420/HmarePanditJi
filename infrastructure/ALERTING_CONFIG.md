# Alerting Configuration - HmarePanditJi

## Overview

This document describes the alerting setup for monitoring the Pandit application.

---

## Alert Channels

### 1. Slack Integration

#### Sentry → Slack
1. Go to Sentry Organization Settings
2. Navigate to Integrations → Slack
3. Connect to your Slack workspace
4. Configure alerts for:
   - New error issues
   - Error rate > 1%
   - Performance issues

**Webhook URL**: `https://hooks.slack.com/services/YOUR/WEBHOOK/URL`

#### GitHub → Slack
1. Install GitHub App in Slack
2. Subscribe to repositories: `hmarepanditji`
3. Configure notifications for:
   - Failed workflows
   - Deployment status
   - Security alerts

#### Vercel → Slack
1. Go to Vercel Dashboard → Settings → Notifications
2. Add Slack integration
3. Configure for:
   - Deployment failed
   - Build failed
   - Domain issues

### 2. Email Alerts

#### Vercel Analytics → Email
Configure in Vercel Dashboard:
- LCP > 4s
- FID > 100ms
- CLS > 0.1

#### UptimeRobot → Email
1. Add monitor: https://pandit.hmarepanditji.com
2. Set check interval: 5 minutes
3. Add email recipients

---

## Alert Thresholds

| Metric | Warning | Critical | Check Interval |
|--------|---------|----------|----------------|
| **Error Rate** | > 0.5% | > 1% | 1 min |
| **LCP** | > 3s | > 4s | 5 min |
| **FID** | > 50ms | > 100ms | 5 min |
| **CLS** | > 0.05 | > 0.1 | 5 min |
| **Uptime** | < 99.9% | < 99% | 1 min |
| **Response Time** | > 500ms | > 1000ms | 1 min |
| **Deployment Time** | > 5 min | > 10 min | Per deploy |

---

## UptimeRobot Configuration

### Monitor Setup

```
Monitor Type: HTTPS
URL: https://pandit.hmarepanditji.com
Monitoring Interval: 5 minutes
Timeout: 30 seconds
```

### Alert Contacts

**Primary**:
- Email: devops@hmarepanditji.com
- Slack Webhook: [configured]

**Secondary**:
- Email: team@hmarepanditji.com

---

## Sentry Alert Rules

### Rule 1: New Error Issue
```
When:
  - An issue is first seen
  
Then:
  - Send notification to Slack #errors channel
  - Create GitHub issue
```

### Rule 2: Error Rate Spike
```
When:
  - Error rate > 1% over 5 minutes
  
Then:
  - Send notification to Slack #incidents
  - Send email to on-call engineer
  - Page via PagerDuty (if configured)
```

### Rule 3: Performance Regression
```
When:
  - P95 transaction duration > 2s
  
Then:
  - Send notification to Slack #performance
  - Create performance issue ticket
```

---

## Testing Alerts

### Test Slack Integration
```bash
# Send test message to Slack
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test alert from HmarePanditJi"}' \
  https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Test Sentry Integration
```javascript
// In browser console on production
Sentry.captureMessage('Test alert message')
```

### Test Uptime Monitor
```bash
# Temporarily stop server to trigger downtime alert
# Verify alert received within 5 minutes
# Restart server and confirm recovery notification
```

---

## Escalation Policy

### P0 - Critical (Site Down)
1. **Immediate**: Slack #incidents + PagerDuty
2. **5 min**: Email to entire team
3. **15 min**: Call on-call engineer
4. **30 min**: Escalate to management

### P1 - High (Error Rate > 1%)
1. **Immediate**: Slack #incidents
2. **15 min**: Email to dev lead
3. **1 hour**: Escalate if not resolved

### P2 - Medium (Performance Issues)
1. **Immediate**: Slack #performance
2. **Next business day**: Create ticket if not auto-resolved

---

## Maintenance Windows

To suppress alerts during maintenance:

### Vercel
1. Go to Project Settings → Notifications
2. Enable "Maintenance Mode"
3. Set duration

### Sentry
1. Go to Project Settings → Alert Rules
2. Pause specific rules
3. Set resume time

### UptimeRobot
1. Go to Monitor Settings → Maintenance Windows
2. Add scheduled maintenance
3. Configure recurrence if needed

---

## Monitoring Dashboard URLs

| Service | URL |
|---------|-----|
| Vercel Analytics | https://vercel.com/hmarepanditji/pandit/analytics |
| Sentry Dashboard | https://sentry.io/organizations/hmarepanditji |
| UptimeRobot | https://uptimerobot.com/dashboard |
| Google Analytics | https://analytics.google.com |

---

**Last Updated**: March 27, 2026  
**Maintained By**: DevOps Team
