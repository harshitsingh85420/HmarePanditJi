# GitHub Secrets Setup Guide

## Required Secrets

Add these secrets in GitHub → Settings → Secrets and variables → Actions

### Vercel Deployment

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `VERCEL_TOKEN` | Vercel API token | vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Vercel Organization ID | Vercel Dashboard → Settings |
| `VERCEL_PANDIT_PROJECT_ID` | Pandit app project ID | Vercel → Project → Settings |

### Sentry (Error Tracking)

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `SENTRY_ORG` | Sentry organization slug | sentry.io/settings |
| `SENTRY_PROJECT` | Sentry project name | Project settings |
| `SENTRY_AUTH_TOKEN` | Sentry auth token | API settings |

### Database

| Secret Name | Description | Notes |
|-------------|-------------|-------|
| `DATABASE_URL` | Production database connection string | Neon/Supabase |
| `DATABASE_URL_TEST` | Test database connection string | For CI tests |

### Application Secrets

| Secret Name | Description | Requirements |
|-------------|-------------|--------------|
| `JWT_SECRET` | JWT signing secret | Min 32 characters |
| `JWT_REFRESH_SECRET` | Refresh token secret | Min 64 characters |
| `ENCRYPTION_KEY` | AES-256 encryption key | 32-byte hex |

---

## How to Add Secrets

### Via GitHub UI

1. Go to repository: `https://github.com/your-org/hmarepanditji`
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Enter Name and Value
6. Click **Add secret**

### Via GitHub CLI

```bash
# Install GitHub CLI
gh auth login

# Add secret
gh secret set VERCEL_TOKEN --body="your_token_here"

# List all secrets
gh secret list
```

---

## Secret Rotation Schedule

| Secret | Rotation Frequency | Last Rotated | Next Due |
|--------|-------------------|--------------|----------|
| `VERCEL_TOKEN` | Quarterly | - | - |
| `SENTRY_AUTH_TOKEN` | Quarterly | - | - |
| `JWT_SECRET` | Annually | - | - |
| `JWT_REFRESH_SECRET` | Annually | - | - |
| `DATABASE_URL` | On credential change | - | - |

---

## Environment-Specific Secrets

### Development
- Use `.env` file (gitignored)
- No GitHub secrets needed

### Preview (Staging)
- Separate database
- Test API keys
- Lower rate limits

### Production
- Production database
- Live API keys
- Full rate limits
- Monitoring enabled

---

## Security Best Practices

### DO:
- ✅ Use strong, random secrets
- ✅ Rotate secrets regularly
- ✅ Use different secrets per environment
- ✅ Audit secret access quarterly
- ✅ Use GitHub Environments for protection

### DON'T:
- ❌ Commit secrets to git
- ❌ Share secrets in Slack/email
- ❌ Use same secret across environments
- ❌ Use weak/predictable secrets
- ❌ Log secret values

---

## Testing Secrets

### Verify Vercel Token

```bash
# Test token validity
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  https://api.vercel.com/v1/user
```

### Verify Sentry Token

```bash
# Test Sentry API
curl -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  https://sentry.io/api/0/organizations/
```

---

## Troubleshooting

### Issue: Deployment Fails with "Unauthorized"

**Solution:**
1. Verify token hasn't expired
2. Check token has correct permissions
3. Regenerate token if needed

### Issue: "Secret Not Found" Error

**Solution:**
1. Check secret name matches exactly (case-sensitive)
2. Verify secret is added to correct repository
3. Check environment scope (if using environments)

### Issue: Database Connection Fails

**Solution:**
1. Verify DATABASE_URL format is correct
2. Check database allows connections from GitHub Actions IP
3. Test connection string locally

---

## GitHub Environments

Configure environments for deployment protection:

### Setup

1. Go to Settings → Environments
2. Create environments:
   - `preview`
   - `production`

### Production Protection Rules

```
Environment: production
Required reviewers: 1
Deployment branches: main only
Wait timer: 0 minutes
```

### Environment-Specific Secrets

```yaml
# .github/workflows/deploy-pandit.yml
jobs:
  deploy-production:
    environment:
      name: production
      url: https://pandit.hmarepanditji.com
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PANDIT_PROJECT_ID }}
```

---

## Quick Reference

### All Required Secrets (Copy-Paste List)

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PANDIT_PROJECT_ID
SENTRY_ORG
SENTRY_PROJECT
SENTRY_AUTH_TOKEN
DATABASE_URL
DATABASE_URL_TEST
JWT_SECRET
JWT_REFRESH_SECRET
ENCRYPTION_KEY
```

---

**Last Updated**: March 27, 2026  
**Maintained By**: DevOps Team  
**Access**: DevOps Lead, Project Lead
