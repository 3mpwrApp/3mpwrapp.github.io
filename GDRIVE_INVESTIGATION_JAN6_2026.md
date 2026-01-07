# Google Drive OAuth Investigation - January 6, 2026

## Issue Summary
Google Drive is not set up properly on app preview and browser.

## Investigation Findings

### ✅ What's Working

1. **Environment Variables** - All properly configured:
   - ✅ `.env` file has `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - ✅ `app.json` extra field has `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - ✅ `eas.json` preview and production builds have the client ID configured

2. **Code Implementation** - All properly implemented:
   - ✅ `services/gdrive.ts` checks both `process.env` and `Constants.expoConfig.extra` for client ID
   - ✅ OAuth flow is implemented for both web and native
   - ✅ Callback page properly configured at `/app/gdrive-callback.tsx`
   - ✅ Cloudflare Pages function at `/functions/gdrive-callback.ts` (server-side handler)

3. **Recent Fix Applied** (Jan 6, 2026):
   - ✅ Fixed message type mismatch in `functions/gdrive-callback.ts`
   - Changed from `type: 'GDRIVE_AUTH_CODE'` to `type: 'expo-auth-session'`
   - This matches what the gdrive service expects to receive

### 🚨 Critical Issue Identified

**ROOT CAUSE**: The redirect URI is likely NOT registered in Google Cloud Console

#### Redirect URI Configuration:
- **Hardcoded Redirect URI**: `https://3mpwrapp.pages.dev/gdrive-callback`
- **Location in code**: [services/gdrive.ts](services/gdrive.ts#L230)
- **Expected to be registered**: Google Cloud Console > OAuth 2.0 Client ID > Authorized redirect URIs

#### Without this configuration:
- Users will see OAuth error when trying to connect to Google Drive
- Browser may show "redirect_uri_mismatch" error
- Preview builds will fail to complete the OAuth flow

## Required Actions

### ACTION 1: Register Redirect URI in Google Cloud Console

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: `empowrapp`
3. Navigate to **APIs & Services** → **Credentials**
4. Find OAuth 2.0 Client ID: `733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs.apps.googleusercontent.com`
5. Click to edit
6. Scroll to **Authorized redirect URIs**
7. Click **+ ADD URI**
8. Add EXACTLY: `https://3mpwrapp.pages.dev/gdrive-callback`
9. Click **SAVE**

### ACTION 2: Optional - Add Local Development URIs

For local testing, you may also want to add:
- `http://localhost:19006/gdrive-callback` (local web dev)
- `http://localhost:8081/gdrive-callback` (alternative local port)

### ACTION 3: Verify after Configuration

After adding the redirect URI to Google Cloud Console:

1. **Wait 1-2 minutes** for Google to propagate changes
2. **Test on web preview**:
   - Run: `npx expo start --web`
   - Go to Settings → Bring Your Own Cloud
   - Select "Google Drive"
   - Click "Connect"
   - Should see Google OAuth consent screen (not an error)

3. **Test on production preview**:
   - Deploy the app and test through the preview build
   - Same steps as above

## Code Changes Made

### File: [functions/gdrive-callback.ts](functions/gdrive-callback.ts)

**Changed:**
```typescript
// BEFORE
window.opener.postMessage({
  type: 'GDRIVE_AUTH_CODE',
  code: '${code}',
  state: '${state || ''}'
}, '*');

// AFTER
window.opener.postMessage({
  type: 'expo-auth-session',
  url: window.location.href
}, '*');
```

**Reason:** The gdrive service in [services/gdrive.ts](services/gdrive.ts#L159) listens for `type: 'expo-auth-session'` and expects the full URL to be sent, not just the code.

## Additional Notes

- The app is already using Cloudflare Pages for deployment (`https://3mpwrapp.pages.dev`)
- The callback page is properly set up to work on both web and native platforms
- Google Drive scopes are correctly configured: `drive.file`, `openid`, `profile`, `email`

## Files Involved

- 📁 [services/gdrive.ts](services/gdrive.ts) - Main Google Drive service
- 📁 [app/gdrive-callback.tsx](app/gdrive-callback.tsx) - React callback page
- 📁 [functions/gdrive-callback.ts](functions/gdrive-callback.ts) - Cloudflare Pages function (FIXED)
- 📁 [app.json](app.json) - Configuration (verified ✅)
- 📁 [.env](.env) - Environment variables (verified ✅)
- 📁 [eas.json](eas.json) - EAS build configuration (verified ✅)

---

**Status**: Code ✅ Fixed | Configuration ⏳ Awaiting Google Cloud Console update

**Next Step**: Have an admin with access to Google Cloud Console complete ACTION 1 above
