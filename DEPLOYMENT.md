# 🚀 Deployment Guide

This guide will help you set up automatic deployments for your portfolio using GitHub Actions.

## 📋 Prerequisites

- GitHub account
- Render account (for backend)
- Netlify account (for frontend)
- Repository pushed to GitHub

---

## 🔧 Setup Instructions

### 1. Backend Deployment (Render)

#### A. Get Render API Key

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your profile → Account Settings
3. Scroll to "API Keys" section
4. Click "Generate New API Key"
5. Copy the API key (you won't see it again!)

#### B. Get Render Service ID

1. Go to your backend service on Render
2. Look at the URL: `https://dashboard.render.com/web/srv-XXXXX`
3. Copy the `srv-XXXXX` part (this is your Service ID)

#### C. Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

```
Name: RENDER_API_KEY
Value: [Your Render API Key]

Name: RENDER_SERVICE_ID
Value: [Your Service ID, e.g., srv-xxxxx]
```

---

### 2. Frontend Deployment (Netlify)

#### A. Get Netlify Auth Token

1. Go to [Netlify](https://app.netlify.com/)
2. Click on your profile → User settings
3. Go to **Applications** → **Personal access tokens**
4. Click **New access token**
5. Give it a name (e.g., "GitHub Actions")
6. Copy the token

#### B. Get Netlify Site ID

1. Go to your site on Netlify
2. Click **Site settings**
3. Under "Site information", copy the **Site ID**

#### C. Add GitHub Secrets

Add these secrets to your GitHub repository:

```
Name: NETLIFY_AUTH_TOKEN
Value: [Your Netlify Auth Token]

Name: NETLIFY_SITE_ID
Value: [Your Site ID]
```

---

## 🎯 How It Works

### Automatic Deployments

The CI/CD pipeline automatically deploys when you push changes:

1. **Backend Changes** (`backend/**`)
   - Triggers: `.github/workflows/deploy-backend.yml`
   - Installs dependencies
   - Runs tests (if configured)
   - Deploys to Render

2. **Frontend Changes** (`frontend/**`)
   - Triggers: `.github/workflows/deploy-frontend.yml`
   - Deploys to Netlify

3. **All Changes**
   - Triggers: `.github/workflows/ci.yml`
   - Runs linting and tests
   - Checks for security vulnerabilities
   - Validates JSON files

### Manual Deployment

You can also trigger deployments manually:

1. Go to **Actions** tab in your GitHub repository
2. Select the workflow (Deploy Backend or Deploy Frontend)
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

---

## 📊 Monitoring Deployments

### View Deployment Status

1. Go to **Actions** tab in your repository
2. Click on any workflow run to see details
3. Green checkmark ✅ = Success
4. Red X ❌ = Failed

### Deployment Logs

- **Backend**: Check Render dashboard → Your service → Logs
- **Frontend**: Check Netlify dashboard → Your site → Deploys

---

## 🔍 Troubleshooting

### Backend Deployment Fails

**Problem**: "Unauthorized" error
- **Solution**: Check if `RENDER_API_KEY` is correct

**Problem**: "Service not found"
- **Solution**: Verify `RENDER_SERVICE_ID` is correct

**Problem**: Build fails
- **Solution**: Check Render logs for specific error

### Frontend Deployment Fails

**Problem**: "Unauthorized" error
- **Solution**: Check if `NETLIFY_AUTH_TOKEN` is correct

**Problem**: "Site not found"
- **Solution**: Verify `NETLIFY_SITE_ID` is correct

### CI Tests Fail

**Problem**: npm audit shows vulnerabilities
- **Solution**: Run `npm audit fix` locally and commit

**Problem**: JSON validation fails
- **Solution**: Check `content.json` and `contacts.json` for syntax errors

---

## 🔐 Security Best Practices

1. **Never commit secrets** to the repository
2. **Rotate API keys** regularly (every 3-6 months)
3. **Use environment-specific secrets** for staging/production
4. **Enable branch protection** on main branch
5. **Require PR reviews** before merging

---

## 📈 Advanced Configuration

### Add Staging Environment

1. Create a `develop` branch
2. Set up separate Render/Netlify services for staging
3. Add staging secrets with `_STAGING` suffix
4. Modify workflows to deploy to staging on `develop` branch

### Add Slack Notifications

Add this step to your workflows:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Add Email Notifications

GitHub automatically sends email notifications for failed workflows to repository admins.

---

## 🎉 Success!

Once set up, your portfolio will automatically deploy whenever you:
- Push changes to the `main` branch
- Merge a pull request
- Manually trigger a deployment

**Deployment times:**
- Backend: ~2-3 minutes
- Frontend: ~1-2 minutes

---

## 📞 Need Help?

- Check [GitHub Actions Documentation](https://docs.github.com/en/actions)
- Check [Render Documentation](https://render.com/docs)
- Check [Netlify Documentation](https://docs.netlify.com)
- Open an issue in the repository

---

## ✅ Checklist

Before going live, make sure:

- [ ] All GitHub secrets are added
- [ ] Backend deploys successfully
- [ ] Frontend deploys successfully
- [ ] CI tests pass
- [ ] Environment variables are set on Render
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is active
- [ ] Admin token is secure and changed from default

---

Made with ❤️ for seamless deployments!
