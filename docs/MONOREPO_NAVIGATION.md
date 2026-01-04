# App & Website Navigation Guide

This is a **monorepo** structure where the app and website are linked via git submodule.

## Structure

```
empowrapp-main/                      # Main app repo (you are here)
├── app/                             # React Native Expo app code
├── components/                      # Shared React Native components
├── services/                        # App services (Firebase, Google Drive, etc.)
├── website/                         # 🔗 Git submodule → 3mpwrapp.github.io repo
│   ├── functions/                   # Cloudflare Pages Functions
│   │   ├── gdrive-callback.ts       # Google Drive OAuth callback handler
│   │   ├── api/                     # API endpoints
│   │   └── admin/                   # Admin functions
│   ├── public/                      # Static assets
│   └── wrangler.toml                # Cloudflare Pages config
└── ...

3mpwrapp.github.io/                  # Separate repo (linked as submodule)
├── functions/                       # Cloudflare Pages Functions
├── public/                          # Static website
└── ...
```

## Key Points

- **Main App Repo:** `https://github.com/3mpwrApp/empowrapp-main`
- **Website Repo:** `https://github.com/3mpwrApp/3mpwrapp.github.io` (linked as submodule)
- **Website Domain:** `https://3mpwrapp.pages.dev`

## Cloning Both Repos

```bash
# Clone app with website submodule
git clone https://github.com/3mpwrApp/empowrapp-main
cd empowrapp-main
git submodule update --init --recursive
```

## Working with the Website

```bash
# Navigate to website
cd website

# Make changes (you're in the website submodule repo)
git add .
git commit -m "fix: Google Drive callback"
git push origin main

# Back in main app
cd ..
git add website
git commit -m "chore: Update website submodule to latest"
git push origin main
```

## Deploying

### App Changes
```bash
# In root directory
npm install
npm run lint
eas build --platform android --profile preview
```

### Website Changes
```bash
# In website directory
cd website
wrangler pages deploy
# Or push to main, Cloudflare Pages will auto-deploy
```

## Current Focus: Google Drive OAuth Fix

**Status:** ✅ Deployed

**Files Changed:**
1. `website/functions/gdrive-callback.ts` - OAuth callback handler
2. `website/public/gdrive-callback.html` - Fallback HTML page
3. `website/_redirects` - SPA routing config

**Testing:**
1. Open app preview
2. Go to Settings → BYOC
3. Click "Connect Google Drive"
4. Should redirect to `https://3mpwrapp.pages.dev/gdrive-callback`
5. No 404 error (should show authorization page)

---

**Next Steps:** Continue with Phase 1 PowerTools development while monitoring OAuth flow.
