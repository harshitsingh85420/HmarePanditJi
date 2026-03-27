# Production Deployment Checklist - HmarePanditJi Pandit App

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version:** _______________  

---

## ✅ Pre-Deployment (Day Before)

### Code Quality
- [ ] TypeScript check passes: `pnpm --filter @hmarepanditji/pandit tsc --noEmit`
- [ ] ESLint check passes: `pnpm --filter @hmarepanditji/pandit lint`
- [ ] All tests pass: `pnpm --filter @hmarepanditji/pandit test`
- [ ] E2E tests pass: `pnpm --filter @hmarepanditji/pandit test:e2e`
- [ ] Build succeeds: `pnpm --filter @hmarepanditji/pandit build`

### Code Review
- [ ] All PRs merged to main
- [ ] Code review approved by Senior Frontend Lead
- [ ] No console.log statements in production code
- [ ] Debugging code removed (console.warn for errors only)

### Documentation
- [ ] CHANGELOG.md updated
- [ ] README.md updated with new features
- [ ] API documentation updated (if applicable)
- [ ] Environment variables documented

### Database
- [ ] Database migrations ready
- [ ] Backup created before migration
- [ ] Migration tested on staging

### Environment Variables
- [ ] All production env vars set in Vercel
- [ ] Secrets rotated (if scheduled)
- [ ] .env.production created locally (for testing)

---

## ✅ Deployment Day

### Morning (10:00 AM - 12:00 PM)

#### Final Verification
- [ ] Run `node scripts/analyze-ts-errors.js` - Zero errors
- [ ] Run `node scripts/verify-build.js` - All checks pass
- [ ] Check GitHub Actions status - All workflows green
- [ ] Verify main branch is stable

#### Team Standup (10:30 AM)
- [ ] Confirm deployment plan with team
- [ ] Assign roles (who monitors, who tests, etc.)
- [ ] Set up war room channel (Slack)

### Afternoon (2:00 PM - 5:00 PM)

#### Deployment Window (2:00 PM - 3:00 PM IST)

**Step 1: Deploy to Production**
```bash
# Navigate to pandit app
cd apps/pandit

# Deploy to production
vercel --prod

# Or trigger via GitHub (push to main)
git push origin main
```

- [ ] Deployment initiated
- [ ] Monitoring Vercel dashboard
- [ ] Build logs show no errors
- [ ] Deployment completed successfully

**Step 2: Verify Deployment**
- [ ] Production URL loads: https://pandit.hmarepanditji.com
- [ ] No errors in browser console
- [ ] SSL certificate valid
- [ ] Custom domain working

**Step 3: Smoke Tests**
- [ ] Home page loads
- [ ] Identity screen loads
- [ ] Language selection works
- [ ] Registration flow works (test account)
- [ ] Voice input works (test microphone)
- [ ] Help button works
- [ ] Back button navigation works

### Monitoring (3:00 PM - 5:00 PM)

#### Error Tracking
- [ ] Sentry dashboard open
- [ ] No new error spikes
- [ ] Error rate < 1%
- [ ] No P0 errors

#### Performance
- [ ] Vercel Analytics open
- [ ] LCP < 2.5s
- [ ] FCP < 1.5s
- [ ] CLS < 0.1

#### Uptime
- [ ] UptimeRobot monitoring active
- [ ] No downtime alerts
- [ ] Response time < 500ms

---

## ✅ Post-Deployment (Day 1)

### Immediate (First 2 Hours)
- [ ] Monitor error rate every 15 minutes
- [ ] Check user reports/complaints
- [ ] Verify analytics tracking working
- [ ] Confirm no deployment-related bugs

### End of Day
- [ ] Deploy successful, no critical issues
- [ ] Error rate stable (< 1%)
- [ ] Performance metrics acceptable
- [ ] Team can stand down

---

## ✅ Week 1 Post-Deployment

### Daily Checks
- [ ] Review Sentry error trends
- [ ] Check Vercel Analytics performance
- [ ] Monitor UptimeRobot status
- [ ] Review user feedback

### Metrics Review
- [ ] Error rate average: _____%
- [ ] LCP average: _____s
- [ ] FCP average: _____s
- [ ] Uptime: _____%

### Issues Log
| Date | Issue | Severity | Resolution |
|------|-------|----------|------------|
| | | | |

---

## 🚨 Rollback Triggers

Initiate rollback if ANY of these occur:

### Critical (Immediate Rollback)
- [ ] Site completely down (> 5 minutes)
- [ ] Data corruption detected
- [ ] Security breach suspected
- [ ] > 10% error rate

### High (Consider Rollback)
- [ ] Registration flow broken
- [ ] Voice input not working
- [ ] > 5% error rate
- [ ] Major accessibility regression

### Rollback Procedure

```bash
# Option 1: Vercel Dashboard
# 1. Go to vercel.com/hmarepanditji/pandit
# 2. Click Deployments
# 3. Find last working deployment
# 4. Click "..." → "Promote to Production"

# Option 2: Vercel CLI
vercel rollback [deployment-url]

# Option 3: Git Revert
git revert HEAD
git push origin main
```

**Rollback Decision Made By:** _______________  
**Rollback Executed At:** _______________  
**Reason:** _______________  

---

## 📞 Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| **On-Call Engineer** | | | |
| **Senior Frontend Lead** | | | |
| **DevOps Lead** | | | |
| **Project Lead** | | | |

### Support Channels
- **Slack War Room:** #deployment-war-room
- **GitHub Issues:** https://github.com/your-org/hmarepanditji/issues
- **Vercel Dashboard:** https://vercel.com/hmarepanditji/pandit
- **Sentry Dashboard:** https://sentry.io/organizations/hmarepanditji

---

## 📊 Deployment Sign-Off

### QA Sign-Off
- [ ] All smoke tests passed
- [ ] No critical bugs found
- [ ] Performance acceptable
- [ ] Accessibility verified

**QA Engineer:** _______________  
**Date/Time:** _______________  

### DevOps Sign-Off
- [ ] Deployment successful
- [ ] Monitoring active
- [ ] Alerts configured
- [ ] Rollback plan ready

**DevOps Engineer:** _______________  
**Date/Time:** _______________  

### Project Lead Sign-Off
- [ ] Stakeholders notified
- [ ] User communication sent (if needed)
- [ ] Deployment approved for production

**Project Lead:** _______________  
**Date/Time:** _______________  

---

## 📝 Deployment Notes

### What Went Well


### What Could Be Improved


### Action Items for Next Deployment


---

**Document Version:** 1.0  
**Last Updated:** March 27, 2026  
**Next Review:** After next production deployment
