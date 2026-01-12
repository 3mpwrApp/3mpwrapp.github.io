# Google Drive OAuth Fix - Cloudflare Pages Deployment

## Issue
When accessing `https://3mpwrapp.pages.dev/gdrive-callback#access_token=...` after Google OAuth, users see:
- ❌ "Authorization code not found in callback"
- ❌ "BYOC is not enabled in this app configuration"

Both errors are incorrect - the OAuth succeeded (token in URL) and BYOC is enabled (hybrid_byoc in config).

## Root Cause
Cloudflare Pages deployment may have:
1. **Stale function cache**: Old `functions/gdrive-callback.ts` that was removed locally
2. **Missing `_routes.json`**: The file that excludes `/gdrive-callback` from Functions might not be in the build output

## Fix Applied

### 1. Created Deployment Script
**File**: `scripts/copy-routes-to-dist.js`

Ensures `public/_routes.json` is copied to `dist/_routes.json` during build (Cloudflare needs it in build root).

### 2. Added Build Command
**File**: `package.json`

Added `"web:build"` script that:
1. Exports web bundle: `expo export:web`
2. Copies routes config: `node scripts/copy-routes-to-dist.js`

### 3. Files in Place
- ✅ `public/_routes.json` - Excludes `/gdrive-callback*` from Cloudflare Functions
- ✅ `functions/gdrive-token-exchange.ts` - Only handles POST requests (token exchange)
- ✅ **No** `functions/gdrive-callback.ts` - Deleted (React handles the route)
- ✅ `app/gdrive-callback.tsx` - React component that parses hash params client-side

## Deployment Steps

### Option 1: Force Cloudflare Redeploy (Recommended)

1. **Push latest code to GitHub**:
   ```powershell
   git add -A
   git commit -m "fix: ensure _routes.json is deployed to exclude gdrive-callback from cloudflare functions"
   git push origin main
   ```

2. **Trigger new deployment in Cloudflare Dashboard**:
   - Go to: https://dash.cloudflare.com → Workers & Pages → 3mpwrapp
   - Click "View build" → "Retry deployment" 
   - OR make a dummy commit to trigger auto-deploy

3. **Clear Cloudflare cache**:
   - Go to Caching → Configuration → Purge Everything
   - Wait 30 seconds for propagation

### Option 2: Manual Build & Deploy

1. **Build web bundle**:
   ```powershell
   npm run web:build
   ```

2. **Verify `_routes.json` copied**:
   ```powershell
   cat dist/_routes.json
   ```
   
   Should show:
   ```json
   {
     "version": 1,
     "exclude": ["/gdrive-callback*"],
     "include": ["/*"]
   }
   ```

3. **Deploy to Cloudflare Pages** (if you have wrangler):
   ```powershell
   npx wrangler pages deploy dist --project-name=3mpwrapp
   ```

### Option 3: Verify Deployment Status

Check if current deployment has the fix:

1. **Check Functions**:
   ```powershell
   curl https://3mpwrapp.pages.dev/_routes.json
   ```
   - If 404: `_routes.json` not deployed → Use Option 1
   - If shows config: Deployment is correct

2. **Check for old function**:
   - Go to Cloudflare Dashboard → Workers & Pages → 3mpwrapp → Functions
   - Should see ONLY `gdrive-token-exchange` (POST)
   - Should NOT see `gdrive-callback` (GET)

## Testing After Deployment

1. **Clear browser cache** (important!)
2. **Open app**: https://3mpwrapp.pages.dev
3. **Go to**: Settings → Bring Your Own Cloud
4. **Click**: "Connect Google Drive"
5. **Authorize** in Google OAuth popup
6. **Expect**: 
   - ✅ Popup closes automatically
   - ✅ Main window shows "Connected to Google Drive"
   - ✅ No error messages

## Verification Checklist

- [ ] `git push` completed successfully
- [ ] Cloudflare deployment shows "Success" (check dashboard)
- [ ] `https://3mpwrapp.pages.dev/_routes.json` returns JSON (not 404)
- [ ] Browser cache cleared
- [ ] Google OAuth completes without errors
- [ ] BYOC settings show "Connected to Google Drive"

## Fallback: Local Development

If Cloudflare deployment still has issues, test locally:

```powershell
npm run web
```

Then open: http://localhost:8081

This will use the React component directly (no Cloudflare Functions involved).

## Technical Notes

### Why This Happens

Cloudflare Pages Functions:
- Intercept routes based on files in `functions/` directory
- Run server-side BEFORE React app loads
- Cannot see URL hash parameters (client-side only)
- Old deployments may have cached functions

### How `_routes.json` Fixes It

Cloudflare Pages `_routes.json`:
- Tells Cloudflare which routes to exclude from Functions
- `/gdrive-callback*` → Skip functions, serve static React app
- React component then handles hash params client-side

### Current Architecture

```
User clicks "Connect" → Google OAuth
  ↓
Google redirects → https://3mpwrapp.pages.dev/gdrive-callback#access_token=...
  ↓
Cloudflare Pages checks _routes.json
  ↓
Route excluded from Functions → Serve static React app (index.html)
  ↓
React app loads → app/gdrive-callback.tsx runs
  ↓
Component parses hash (#access_token=...)
  ↓
Sends postMessage to parent window
  ↓
Popup closes → Main window receives token → Connected ✅
```

## Related Files

- `public/_routes.json` - Cloudflare routing config (source)
- `dist/_routes.json` - Cloudflare routing config (deployed)
- `scripts/copy-routes-to-dist.js` - Build script
- `app/gdrive-callback.tsx` - React OAuth callback handler
- `functions/gdrive-token-exchange.ts` - Server-side token exchange (POST only)
- `services/gdrive.ts` - Google Drive OAuth logic

## Commit History

- `2990f2f1` - Disabled `functions/gdrive-callback.ts` (old commit, not in main)
- `02716efa` - Deleted `.disabled` file, added `_routes.json` (old commit, not in main)
- **THIS COMMIT** - Ensures `_routes.json` is deployed correctly
