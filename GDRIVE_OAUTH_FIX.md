# Google Drive OAuth Fix - Web Platform

## Problem
When connecting Google Drive on the web preview app:
1. User clicks "Connect Google Drive"
2. Popup shows "Authorization successful"
3. Popup closes and returns to app
4. **Issue**: Google Drive shows as NOT connected despite success message

## Root Cause
The web preview app was using `expo-auth-session`'s `promptAsync()` method, which:
- Is designed for **native apps** with proper deep-linking
- Does NOT work correctly for **web apps** that need popup-based OAuth flows
- The callback page was sending `postMessage` but the app wasn't listening for it properly

## Solution

### 1. Updated `services/gdrive.ts`
Created a new **web-specific OAuth flow function** called `webOAuthFlow()`:
- Opens a popup window to the Google OAuth endpoint
- Properly sets `access_type=offline` to get refresh tokens
- **Listens for postMessage** from the callback page
- Extracts the authorization code from the message
- Exchanges code for access token via token endpoint
- Saves config to AsyncStorage for persistence

**Key changes:**
```typescript
// Web-specific flow
if (Platform.OS === 'web') {
  const webResult = await webOAuthFlow(clientId, redirectUri);
  code = webResult.code;
  authError = webResult.error;
}

// Native platforms still use expo-auth-session
else {
  // Use traditional promptAsync() approach
}
```

### 2. Enhanced Callback Page
Updated `app/gdrive-callback.tsx`:
- Sends postMessage **multiple times** (3 retries) to ensure it gets through
- Better console logging for debugging

### 3. Token Persistence
The config is now properly persisted:
- `setGDriveConfig()` saves to AsyncStorage with key `@gdrive_config`
- `loadGDriveConfig()` restores on app startup
- `isGDriveConfigured()` checks if tokens are valid

## Testing the Fix

### Test Steps:
1. **Load the preview app**: `npx expo start --web`
2. **Navigate to Settings → BYOC**
3. **Click "Connect Google Drive"**
4. **Authorize** in the popup window
5. **See success message** and popup closes
6. **Check console** in browser DevTools - look for:
   ```
   [GDrive] Web OAuth: Received expo-auth-session message
   [GDrive] Access token received
   [GDrive] Config saved
   ```
7. **Return to Settings → BYOC**
8. **Verify** Google Drive shows as CONNECTED ✓

### If It Still Doesn't Work:

**Check 1: Browser Console**
Open DevTools (F12) → Console tab and search for:
- `[GDrive Callback]` - Should show callback received
- `[GDrive] Web OAuth:` - Should show postMessage received
- `[GDrive] Access token received` - Should show successful exchange

**Check 2: postMessage Delivery**
If you see "Received expo-auth-session message" but no access token:
- postMessage might be received but URL parsing is broken
- Check the URL includes `?code=...`
- Check the code is being extracted correctly

**Check 3: AsyncStorage Persistence**
Check if config is actually saved:
```javascript
// Run in browser console:
AsyncStorage.getItem('@gdrive_config').then(console.log)
```

**Check 4: Google Cloud Console**
Verify the redirect URI is whitelisted:
1. Go to https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Find your OAuth 2.0 Client ID
4. Check "Authorized redirect URIs" includes:
   - `https://3mpwrapp.pages.dev/gdrive-callback`
   - `https://localhost:*` (for local testing, if applicable)

## Files Modified
- `services/gdrive.ts` - New `webOAuthFlow()` function, updated `authenticateGDrive()`
- `app/gdrive-callback.tsx` - Enhanced logging, multiple postMessage sends

## Architecture

```
User Action (Click "Connect Google Drive")
    ↓
authenticateGDrive() called
    ↓
if (web) → webOAuthFlow()
    ├─ Opens popup to Google OAuth endpoint
    ├─ User grants permissions
    ├─ Google redirects to callback page
    ├─ Callback page receives code & sends postMessage
    ├─ webOAuthFlow() receives postMessage
    └─ Extracts code from URL
else (native) → promptAsync()
    ├─ Uses native auth flow
    ├─ Gets code from native deep-link
    └─ Returns code
    
Code Exchange (Both platforms)
    ↓
POST to oauth2.googleapis.com/token with code
    ↓
Receive access_token, refresh_token, expires_in
    ↓
Save config to AsyncStorage
    ↓
Return success to BYOC settings screen
    ↓
Show "✓ Connected to Google Drive"
```

## Expected Behavior After Fix

1. **Initial Connection**
   - Click "Connect Google Drive"
   - OAuth popup appears
   - Grant permissions
   - Success message shown
   - Config automatically saved

2. **Persistence**
   - Close and reopen the app
   - Google Drive should still show as connected
   - Can immediately upload/download files

3. **Token Refresh**
   - When token expires (3600 seconds)
   - Automatic refresh using refresh_token
   - No user action needed

## Debugging Output Format

When testing, watch for these log patterns:

**Success Flow:**
```
[GDrive] === Starting authentication flow ===
[GDrive] Platform: web
[GDrive] Client ID found, proceeding with OAuth
[GDrive] Using web OAuth flow (popup + postMessage)
[GDrive Callback] ===== OAUTH CALLBACK RECEIVED =====
[GDrive Callback] Code: <first 20 chars>...
[GDrive Callback] Sending authorization code to parent window
[GDrive] Web OAuth: Received expo-auth-session message
[GDrive] Authorization code received
[GDrive] Exchanging code for access token...
[GDrive] Access token received
[GDrive] Config saved
[GDrive] Authentication successful
```

**Error Cases:**
```
// Browser blocked popup
[GDrive] Could not open popup - blocked by browser

// postMessage not received
[GDrive] Web OAuth: Timeout waiting for callback

// Token exchange failed
[GDrive] Token exchange failed: invalid_grant
(Code was already used or expired)
```
