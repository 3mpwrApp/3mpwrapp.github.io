# Google Drive OAuth Investigation - January 6, 2026

## Issue Summary
Google Drive was not working on app preview and browser, showing "connection failed" after successful OAuth authorization.

## Root Cause Identified

**PRIMARY ISSUE**: CORS restriction on Google's OAuth token endpoint
- The browser was trying to make a direct POST request to `https://oauth2.googleapis.com/token` to exchange the authorization code for an access token
- Google's API doesn't allow CORS POST requests from browsers for security reasons
- This caused the token exchange to fail silently, even though the OAuth authorization succeeded

**SECONDARY ISSUE** (Already Fixed Jan 4):
- The Cloudflare callback function was sending wrong message type
- Changed from `GDRIVE_AUTH_CODE` to `expo-auth-session` (fixed earlier)

## Solutions Implemented

### Solution 1: Backend Token Exchange Endpoint ✅ IMPLEMENTED

Created new file: [functions/gdrive-token-exchange.ts](functions/gdrive-token-exchange.ts)

**How it works:**
1. Browser receives authorization code from Google OAuth
2. Browser calls backend endpoint: `https://3mpwrapp.pages.dev/gdrive-token-exchange`
3. Backend (server-side) safely exchanges code for token with Google
4. Backend returns access token to browser
5. Browser stores token securely

**Why this works:**
- Server-to-server requests don't have CORS restrictions
- Only server knows client secret (if needed in future)
- More secure than exposing OAuth flow entirely to browser

### Solution 2: Updated OAuth Flow in gdrive Service ✅ IMPLEMENTED

Modified: [services/gdrive.ts](services/gdrive.ts#L320)

**Changes:**
- **Web**: Uses new backend endpoint for token exchange (CORS-safe)
- **Native**: Uses direct Google endpoint (Expo handles CORS properly)

```typescript
if (Platform.OS === 'web') {
  // Web: Use backend token exchange endpoint (avoids CORS issues)
  const response = await fetch('https://3mpwrapp.pages.dev/gdrive-token-exchange', {
    method: 'POST',
    body: JSON.stringify({ code, redirectUri }),
  });
} else {
  // Native: Use direct Google token endpoint (Expo is safe)
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: URLSearchParams.stringify({ code, client_id, ... }),
  });
}
```

## What Was Fixed

### Files Changed:
1. [functions/gdrive-token-exchange.ts](functions/gdrive-token-exchange.ts) - NEW
   - Server-side token exchange endpoint
   - Handles OAuth code → access token conversion
   - Returns tokens securely to browser

2. [services/gdrive.ts](services/gdrive.ts) - MODIFIED
   - Platform-specific token exchange logic
   - Web uses backend endpoint
   - Native uses direct Google endpoint
   - Proper error handling for both flows

3. [functions/gdrive-callback.ts](functions/gdrive-callback.ts) - PREVIOUSLY FIXED
   - Message type corrected (expo-auth-session)
   - Sends full callback URL to parent window

## Testing After Fix

### For Web Browser:
```bash
npx expo start --web
# Navigate to Settings → Bring Your Own Cloud
# Select "Google Drive"
# Click "Connect"
# Should complete successfully now ✅
```

### For Preview Build:
```bash
# Build and test preview
eas build --platform web --profile preview
# Or test directly via preview URL
```

### Expected Behavior:
1. ✅ Click "Connect Google Drive"
2. ✅ Popup opens with Google OAuth consent screen
3. ✅ User authorizes app
4. ✅ Popup shows "Authorization Successful"
5. ✅ User returns to app
6. ✅ Status shows "Connected to Google Drive" (no error)

## Technical Details

### Why the Original Approach Failed:
```typescript
// ❌ WRONG - Fails in browser due to CORS
const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  body: URLSearchParams.stringify({ code, client_id, ... }),
});
// Browser error: CORS policy blocks POST to OAuth endpoint
```

### Why the New Approach Works:
```typescript
// ✅ CORRECT - Backend handles sensitive request
const tokenResponse = await fetch('https://3mpwrapp.pages.dev/gdrive-token-exchange', {
  method: 'POST',
  body: JSON.stringify({ code, redirectUri }),
});
// Server safely exchanges with Google, returns token
```

## Files Involved

- 📁 [services/gdrive.ts](services/gdrive.ts) - OAuth service (UPDATED)
- 📁 [functions/gdrive-token-exchange.ts](functions/gdrive-token-exchange.ts) - Token exchange endpoint (NEW)
- 📁 [functions/gdrive-callback.ts](functions/gdrive-callback.ts) - Callback handler (FIXED)
- 📁 [app/gdrive-callback.tsx](app/gdrive-callback.tsx) - React callback page

## Status

✅ **Code**: Complete  
✅ **Git**: Committed and pushed  
✅ **Ready to Deploy**: Yes

**Next Steps:**
1. Deploy changes to Cloudflare Pages
2. Test on web preview (should work immediately after deploy)
3. Test on EAS preview build
4. Monitor logs for any errors

---

**Last Updated**: January 6, 2026  
**Commit**: `fix: use backend token exchange for web to avoid CORS issues with Google OAuth`
