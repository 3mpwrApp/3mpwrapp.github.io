# Demo Page & PWA Configuration Guide

## Current Status ✅

### Demo Page (3mpwrapp.ca/demo)
- ✅ **Redesigned**: Clean layout matching site design (1517 → 242 lines, 84% reduction)
- ✅ **Pushed to GitHub**: Commit `50dbb065`
- ✅ **Jekyll Built**: `_site/demo/index.html` exists
- ✅ **Auto-Deploy**: GitHub Pages will deploy to https://3mpwrapp.ca/demo/ automatically

**Embedded App URL**: `https://3mpwrapp-beta.pages.dev/`

---

## Configuration Steps

### Step 1: Verify Demo Page is Live (5 minutes)

1. **Wait for GitHub Pages Deployment** (2-3 minutes after push)
   - Go to: https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io/actions
   - Check latest workflow run for "pages build and deployment"
   - Wait for green checkmark

2. **Test Demo Page**
   ```
   URL: https://3mpwrapp.ca/demo/
   ```
   
   **Expected Result**: 
   - Clean page with hero section
   - Badges: Secure, AAA Accessible, Mobile Friendly, Always Free
   - Large iframe showing embedded app

3. **If Page Loads But iframe is Blank**
   - This is expected initially
   - Continue to Step 2 to configure the PWA app

---

### Step 2: Configure PWA App on Cloudflare Pages (10 minutes)

#### 2.1 Access Cloudflare Pages Dashboard

1. Go to: https://dash.cloudflare.com/
2. Navigate to: **Pages** → **3mpwrapp-beta** project
   - If project doesn't exist, click "Create a project"

#### 2.2 Connect to Git Repository (if new project)

**Skip this if project already exists**

1. Click "Connect to Git"
2. Select "GitHub"
3. Choose repository: `empowrapp-new` (or the PWA repo)
4. Branch: `main`

#### 2.3 Configure Build Settings

Go to: **Settings → Builds & deployments**

```yaml
Framework preset: None
Build command: npx expo export --platform web --output-dir dist-web
Build output directory: dist-web
Root directory: (leave blank or /)
Node.js version: 18
```

⚠️ **CRITICAL**: Output directory MUST be `dist-web` (not `dist`)

#### 2.4 Add Environment Variables

Go to: **Settings → Environment variables → Production**

Click "Add variable" for each:

```bash
# Required
NODE_VERSION=18
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<your-client-id>.apps.googleusercontent.com

# API Endpoints (optional, but recommended)
EXPO_PUBLIC_API_BASE=https://3mpwrapp.ca/api
EXPO_PUBLIC_EVENTS_API_BASE=https://3mpwrapp.ca/api
EXPO_PUBLIC_CAMPAIGNS_API_BASE=https://3mpwrapp.ca/api

# Monitoring (optional)
EXPO_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
```

**Get Google OAuth Client ID**:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your project (or create one)
3. Create OAuth 2.0 Client ID (Web application type)
4. Copy the Client ID (ends in `.apps.googleusercontent.com`)

#### 2.5 Trigger Manual Deployment

1. Go to: **Deployments** tab
2. Click "Retry deployment" or "Create deployment"
3. Wait for build to complete (3-5 minutes)
4. Check deployment URL: `https://3mpwrapp-beta.pages.dev/`

---

### Step 3: Configure OAuth Redirect URIs (5 minutes)

#### 3.1 Add Redirect URIs to Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   https://3mpwrapp-beta.pages.dev/gdrive-callback
   https://3mpwrapp.ca/gdrive-callback
   ```
4. Click "Save"

#### 3.2 Verify OAuth Configuration

The PWA app has these files configured:
- `dist-web/_redirects` - SPA routing: `/* /index.html 200`
- `dist-web/_routes.json` - Excludes `/gdrive-callback` from Functions

---

### Step 4: Test Both URLs (3 minutes)

#### 4.1 Test Direct PWA App

1. **Open**: https://3mpwrapp-beta.pages.dev/
2. **Check**:
   - ✅ App loads (not blank page)
   - ✅ Navigation tabs appear
   - ✅ Can navigate to different sections
   - ✅ Try signing in with Google OAuth

#### 4.2 Test Demo Page with Embedded App

1. **Open**: https://3mpwrapp.ca/demo/
2. **Check**:
   - ✅ Demo page matches site design
   - ✅ iframe loads with app inside
   - ✅ Can interact with app in iframe
   - ✅ Mobile responsive

---

## Troubleshooting

### Issue 1: Demo Page Shows Old Design

**Cause**: GitHub Pages hasn't deployed yet or browser cache

**Fix**:
```bash
# Force refresh in browser
Windows: Ctrl + F5
Mac: Cmd + Shift + R

# Or wait 2-3 minutes for GitHub Pages deployment
```

### Issue 2: iframe Shows "Connection Refused" or Blank

**Cause**: PWA app not deployed or has errors

**Fix**:
1. Check Cloudflare Pages deployment logs
2. Verify build output directory is `dist-web`
3. Check browser console (F12) for errors

### Issue 3: PWA App Loads But Features Don't Work

**Cause**: Missing environment variables

**Fix**:
1. Add all required env vars in Cloudflare Pages
2. Redeploy after adding variables
3. Clear browser cache and retry

### Issue 4: OAuth Sign-in Fails

**Cause**: Redirect URIs not whitelisted

**Fix**:
1. Add both URLs to Google Cloud Console OAuth credentials
2. Wait 5 minutes for changes to propagate
3. Try signing in again

### Issue 5: iframe Won't Load (CORS or X-Frame-Options)

**Cause**: PWA app blocking iframe embedding

**Fix**: Add headers in Cloudflare Pages

Create `dist-web/_headers`:
```
/*
  X-Frame-Options: SAMEORIGIN
  Content-Security-Policy: frame-ancestors 'self' https://3mpwrapp.ca
```

---

## Quick Deployment Commands

### Redeploy PWA App from Local

```powershell
# Navigate to PWA project
cd d:\1-EmpowrApp\empowrapp-new\empowrapp-new

# Clean and rebuild
Remove-Item -Recurse -Force dist-web -ErrorAction SilentlyContinue
npx expo export --platform web --output-dir dist-web

# Copy routing files
Copy-Item public\_redirects dist-web\_redirects -Force
Copy-Item public\_routes.json dist-web\_routes.json -Force

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist-web --project-name=3mpwrapp-beta --branch=main --commit-dirty=true
```

### Force Redeploy Marketing Site

```powershell
# Navigate to marketing site
cd d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main

# Make empty commit to trigger deployment
git commit --allow-empty -m "chore: trigger deployment"
git push origin main
```

---

## Configuration Checklist

### Demo Page (3mpwrapp.ca/demo)
- [x] Code redesigned and committed
- [x] Pushed to GitHub
- [x] Jekyll built successfully
- [ ] Verify live at https://3mpwrapp.ca/demo/
- [ ] Test responsive design on mobile

### PWA App (3mpwrapp-beta.pages.dev)
- [ ] Cloudflare Pages project created
- [ ] Build settings configured (output: dist-web)
- [ ] Environment variables added
- [ ] Google OAuth Client ID configured
- [ ] Redirect URIs whitelisted
- [ ] App deploys successfully
- [ ] App loads without blank page
- [ ] OAuth sign-in works

### Integration Testing
- [ ] Demo page iframe loads PWA app
- [ ] Can interact with app in iframe
- [ ] Mobile responsive works
- [ ] Dark mode/accessibility features work

---

## Next Steps After Configuration

1. **Test on Multiple Devices**
   - Desktop (Chrome, Firefox, Safari)
   - Mobile (iOS Safari, Android Chrome)
   - Tablet (iPad, Android tablet)

2. **Monitor Performance**
   - Check Cloudflare Analytics for traffic
   - Monitor error rates in browser console
   - Review user feedback

3. **Iterate and Improve**
   - Gather beta tester feedback
   - Fix issues as they arise
   - Update documentation

---

## Support Resources

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **Expo Web Docs**: https://docs.expo.dev/workflow/web/
- **Google OAuth Setup**: https://developers.google.com/identity/protocols/oauth2
- **Jekyll GitHub Pages**: https://docs.github.com/pages

---

## Quick Reference

| Resource | URL |
|----------|-----|
| Demo Page | https://3mpwrapp.ca/demo/ |
| PWA App (Direct) | https://3mpwrapp-beta.pages.dev/ |
| Cloudflare Dashboard | https://dash.cloudflare.com/ |
| Google Cloud Console | https://console.cloud.google.com/ |
| GitHub Repo (Marketing) | https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io |
| GitHub Actions | https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io/actions |

---

**Last Updated**: May 28, 2026
**Status**: Demo page deployed, PWA app configuration in progress
