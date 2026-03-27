# DevOps Runbook - HmarePanditJi Pandit App

## 📋 Quick Reference

| Item | Value |
|------|-------|
| **Production URL** | https://pandit.hmarepanditji.com |
| **Preview URL** | https://pandit-app-*.vercel.app |
| **Region** | Mumbai (bom1) |
| **Framework** | Next.js 14 |
| **Package Manager** | pnpm@9.1.0 |
| **Node Version** | 20.x |

---

## 🚀 Deployment Process

### Prerequisites
- Access to Vercel organization: `hmarepanditji`
- GitHub repository access
- Environment variables configured in Vercel

### Deploy to Production

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Run tests locally
cd apps/pandit
pnpm install
pnpm test
pnpm lint
pnpm build

# 3. Push to main (triggers auto-deploy)
git push origin main
```

### Deploy Preview (for PRs)
- Create a pull request to `main`
- Vercel automatically creates a preview deployment
- Comment on PR with preview URL

### Manual Deployment (Vercel CLI)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
cd apps/pandit
vercel --env=preview

# Deploy to production
vercel --prod
```

---

## 🔄 Rollback Process

### Via Vercel Dashboard
1. Go to https://vercel.com/hmarepanditji/pandit
2. Click on "Deployments"
3. Find the last working deployment
4. Click "..." → "Promote to Production"

### Via Vercel CLI
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Via Git (Emergency)
```bash
# Revert last commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

---

## 📊 Monitoring Dashboard

### Vercel Analytics
- **URL**: https://vercel.com/hmarepanditji/pandit/analytics
- **Metrics**: Page views, performance, Core Web Vitals
- **Alerts**: LCP > 4s, FID > 100ms, CLS > 0.1

### Sentry Error Tracking
- **URL**: https://sentry.io/organizations/hmarepanditji
- **Metrics**: Error rate, crash-free sessions, performance
- **Alerts**: Error rate > 1%, new error types

### Uptime Monitoring (UptimeRobot)
- **URL**: https://uptimerobot.com/
- **Check Interval**: 5 minutes
- **Alerts**: Site down, SSL expiry

### Google Analytics 4
- **URL**: https://analytics.google.com/
- **Metrics**: User behavior, conversions, retention

---

## 🚨 Alert Response Procedures

### Site Down Alert

**Severity**: P0 (Critical)

**Steps**:
1. **Verify**: Open https://pandit.hmarepanditji.com
2. **Check Vercel Status**: https://vercel.com/status
3. **Check Recent Deployments**: 
   - Go to Vercel dashboard
   - Look for failed deployments
4. **Rollback if needed**: Follow rollback process above
5. **Check Logs**:
   ```bash
   vercel logs pandit.hmarepanditji.com --follow
   ```
6. **Notify Team**: Slack #incidents channel

### High Error Rate Alert (>1%)

**Severity**: P1 (High)

**Steps**:
1. **Open Sentry**: Check error trends
2. **Identify Top Errors**: Group by error type
3. **Check Recent Changes**: Correlate with recent deploys
4. **Create Issue**: Assign to relevant developer
5. **Monitor**: Watch for error rate normalization

### Performance Degradation (LCP > 4s)

**Severity**: P2 (Medium)

**Steps**:
1. **Check Vercel Analytics**: Identify slow pages
2. **Run Lighthouse**: 
   ```bash
   cd apps/pandit
   pnpm lighthouse
   ```
3. **Check Asset Sizes**: Look for large bundles
4. **Review Recent Changes**: Check for performance regressions
5. **Optimize**: Fix identified bottlenecks

### Deployment Failed Alert

**Severity**: P2 (Medium)

**Steps**:
1. **Check GitHub Actions**: View failed workflow
2. **Review Logs**: Identify failure point
3. **Common Fixes**:
   - Missing environment variables
   - Dependency issues (`pnpm install`)
   - Build errors (check TypeScript/ESLint)
4. **Retry**: Re-run failed workflow
5. **Escalate**: If build issues persist

---

## 📞 Contact Information

| Role | Name | Contact |
|------|------|---------|
| **DevOps Lead** | [Name] | [Email/Slack] |
| **Frontend Lead** | [Name] | [Email/Slack] |
| **On-Call Engineer** | [Rotating] | [PagerDuty/Slack] |

### Emergency Contacts
- **Vercel Support**: https://vercel.com/support
- **Sentry Support**: https://sentry.io/support
- **AWS India**: +91-XXX-XXX-XXXX

---

## 🔧 Troubleshooting Guide

### Common Issues

#### Build Fails with "Out of Memory"
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

#### Environment Variables Not Working
1. Check Vercel dashboard → Settings → Environment Variables
2. Verify variable names match exactly
3. Redeploy after adding new variables

#### Slow Performance in India
1. Verify region is set to `bom1` in vercel.json
2. Check CDN cache hit rate in Vercel analytics
3. Review asset optimization (images, fonts)

#### Database Connection Errors
1. Check DATABASE_URL in Vercel env vars
2. Verify database is accessible from Vercel IPs
3. Check connection pool settings

---

## 📈 Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| **Uptime** | 99.9% | - |
| **Deployment Time** | < 5 min | - |
| **Rollback Time** | < 2 min | - |
| **Error Rate** | < 1% | - |
| **LCP** | < 4s | - |
| **Security Incidents** | 0 | - |

---

## 🎓 Team Training Checklist

### For Developers
- [ ] How to deploy to preview
- [ ] How to deploy to production
- [ ] How to check logs
- [ ] How to read Sentry errors
- [ ] How to respond to alerts

### For QA Team
- [ ] How to access preview deployments
- [ ] How to test on staging
- [ ] How to report deployment issues
- [ ] How to verify fixes

### For Operations
- [ ] How to monitor dashboards
- [ ] How to respond to P0 alerts
- [ ] How to perform rollbacks
- [ ] How to escalate issues

---

## 📝 Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-27 | Initial runbook created | DevOps Team |

---

**Last Updated**: March 27, 2026  
**Next Review**: April 27, 2026
