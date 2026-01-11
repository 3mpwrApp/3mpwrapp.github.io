# Google Drive Integration - Setup Guide

Complete setup guide for Google Drive BYOC (Bring Your Own Cloud) integration supporting **Web** and **Android** platforms.

## Table of Contents
1. [Overview](#overview)
2. [Google Cloud Console Setup](#google-cloud-console-setup)
3. [Platform-Specific Configuration](#platform-specific-configuration)
4. [Environment Variables](#environment-variables)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Overview

The app supports Google Drive as a storage backend for user data, giving users complete ownership of their data. The implementation uses:

- **Web**: Implicit OAuth flow (no client secret needed)
- **Android**: Authorization Code flow with PKCE (more secure)
- **iOS**: Authorization Code flow with PKCE (coming soon)

### Features
- ✅ OAuth 2.0 authentication
- ✅ Automatic token refresh
- ✅ File upload/download/delete operations
- ✅ Automatic folder creation (`3mpwr_App_Data`)
- ✅ Offline-first with sync queue
- ✅ PKCE for native platforms (enhanced security)

---

## Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your **Project ID** and **Project Number**

### Step 2: Enable Google Drive API

1. Go to **APIs & Services > Library**
2. Search for "Google Drive API"
3. Click **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Select **External** user type
3. Fill in required fields:
   - **App name**: 3mpwr App
   - **User support email**: your email
   - **Developer contact**: your email
4. **Scopes**: Add the following scope:
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`
5. **Test users**: Add your test email addresses
6. Save and continue

### Step 4: Create OAuth 2.0 Credentials

#### For Web Application:

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Select **Web application**
4. Name: "3mpwr Web Client"
5. **Authorized JavaScript origins**:
   ```
   https://3mpwrapp.pages.dev
   http://localhost:8081
   ```
6. **Authorized redirect URIs**:
   ```
   https://3mpwrapp.pages.dev/gdrive-callback
   http://localhost:8081/gdrive-callback
   ```
7. Click **Create**
8. **Save the Client ID** (you'll need this for env vars)

#### For Android Application:

1. Click **Create Credentials > OAuth client ID**
2. Select **Android**
3. Name: "3mpwr Android Client"
4. **Package name**: `com.app3mpwr.app3mpwr`
5. **SHA-1 certificate fingerprint**:
   
   For **debug builds**, run:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
   
   For **release builds**, run:
   ```bash
   keytool -list -v -keystore /path/to/your/release.keystore -alias your-key-alias
   ```
   
   Copy the **SHA1** fingerprint (looks like: `A1:B2:C3:...`)

6. Click **Create**
7. **Save the Client ID**

---

## Platform-Specific Configuration

### Web Platform

The web app uses **implicit OAuth flow** which:
- Returns access token directly in URL hash
- No client secret needed
- Token expires in 1 hour
- Best for web applications

**How it works:**
1. User clicks "Connect Google Drive"
2. Popup opens to Google OAuth consent screen
3. User grants permissions
4. Google redirects to `/gdrive-callback` with access token in hash
5. Callback page sends token to parent window via `postMessage`
6. Token is stored in AsyncStorage

### Android Platform

Android uses **authorization code flow with PKCE** which:
- Exchanges authorization code for access token
- Uses PKCE (Proof Key for Code Exchange) for security
- Gets refresh token for long-term access
- More secure for native apps

**How it works:**
1. User clicks "Connect Google Drive"
2. App opens Google OAuth in browser
3. User grants permissions
4. Google redirects to custom scheme: `empowrapp://gdrive-callback?code=...`
5. App receives authorization code
6. App exchanges code + PKCE verifier for access token
7. Tokens stored in AsyncStorage

**Required Android configuration:**

In `app.json`:
```json
{
  "android": {
    "intentFilters": [
      {
        "action": "VIEW",
        "autoVerify": true,
        "data": [
          {
            "scheme": "empowrapp",
            "host": "gdrive-callback"
          }
        ],
        "category": ["BROWSABLE", "DEFAULT"]
      }
    ]
  }
}
```

---

## Environment Variables

Create a `.env` file or add to `eas.json`:

```bash
# Web Client ID (required for web)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com

# Android Client ID (required for Android)
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com

# iOS Client ID (optional, for future iOS support)
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
```

### In `eas.json` (for EAS builds):

```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID": "xxx.apps.googleusercontent.com",
        "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID": "yyy.apps.googleusercontent.com"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID": "xxx.apps.googleusercontent.com",
        "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID": "yyy.apps.googleusercontent.com"
      }
    }
  }
}
```

### In `app.config.js` (for local development):

```javascript
export default {
  extra: {
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  },
};
```

---

## Testing

### Test on Web

1. Start dev server:
   ```bash
   npx expo start --web
   ```

2. Open browser to `http://localhost:8081`

3. Navigate to **Settings → BYOC → Google Drive**

4. Click "Connect Google Drive"

5. Expected flow:
   - Popup opens to Google consent screen
   - Grant permissions
   - Popup closes automatically
   - See "✓ Connected to Google Drive"

6. Test upload:
   - Go to any screen that saves data
   - Check Google Drive folder `3mpwr_App_Data/`

### Test on Android

1. Build preview APK:
   ```bash
   eas build --platform android --profile preview
   ```

2. Install APK on device/emulator

3. Navigate to **Settings → BYOC → Google Drive**

4. Click "Connect Google Drive"

5. Expected flow:
   - Browser opens to Google consent screen
   - Grant permissions
   - Redirects back to app
   - See "✓ Connected to Google Drive"

6. Check logs:
   ```bash
   adb logcat | grep GDrive
   ```

---

## Troubleshooting

### Common Issues

#### 1. "Google client ID not configured"

**Cause**: Environment variable not loaded

**Solution**:
- Check `.env` file exists
- Verify variable name: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (must start with `EXPO_PUBLIC_`)
- Restart dev server after changing `.env`
- For EAS builds, check `eas.json` has the env var

#### 2. "redirect_uri_mismatch" error

**Cause**: Redirect URI not added to Google Cloud Console

**Solution**:
- Go to Google Cloud Console → Credentials → Your OAuth Client
- Add redirect URI:
  - Web: `https://3mpwrapp.pages.dev/gdrive-callback`
  - Development: `http://localhost:8081/gdrive-callback`
- Save and wait a few minutes for changes to propagate

#### 3. "access_denied" error

**Cause**: User denied permissions or scope issue

**Solution**:
- Ensure user clicks "Allow" on consent screen
- Verify scopes in Google Cloud Console
- For testing, add yourself as a test user

#### 4. Android: "invalid_grant" error

**Cause**: SHA-1 fingerprint mismatch or PKCE verification failed

**Solution**:
- Verify SHA-1 fingerprint in Google Cloud Console matches your keystore:
  ```bash
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey
  ```
- Ensure PKCE is enabled (check `usePKCE: true` in code)
- Check redirect URI scheme matches: `empowrapp://gdrive-callback`

#### 5. "Token exchange failed: invalid_client"

**Cause**: Wrong client ID for platform

**Solution**:
- Ensure using correct client ID:
  - Web → Web Client ID
  - Android → Android Client ID
- Verify client ID format ends with `.apps.googleusercontent.com`

#### 6. Files not appearing in Google Drive

**Cause**: Folder creation failed or permission issue

**Solution**:
- Check app logs for "Could not get/create app folder"
- Manually create folder `3mpwr_App_Data` in Google Drive root
- Ensure scope includes `https://www.googleapis.com/auth/drive.file`

---

## File Structure

Google Drive integration files:

```
services/
  gdrive.ts               # Main Google Drive service
app/
  gdrive-callback.tsx     # OAuth callback handler (web)
functions/
  gdrive-token-exchange.ts.disabled  # Server-side token exchange (disabled)
docs/
  GOOGLE_DRIVE_SETUP.md   # This file
```

---

## Security Best Practices

1. **Never commit client secrets** to version control
2. **Use PKCE** for native platforms (already implemented)
3. **Request minimal scopes** (only `drive.file` scope)
4. **Validate tokens** before making API calls
5. **Store tokens securely** in AsyncStorage (encrypted on device)
6. **Implement token refresh** (already implemented)
7. **Handle token expiration** gracefully

---

## API Reference

### Main Functions

#### `authenticateGDrive(): Promise<GDriveAuthResult>`
Initiates OAuth flow and returns access token + refresh token.

#### `saveToGDrive(path: string, data: string | Uint8Array): Promise<boolean>`
Saves data to Google Drive at specified path.

#### `loadFromGDrive(path: string): Promise<string | null>`
Loads data from Google Drive by path.

#### `removeFromGDrive(path: string): Promise<boolean>`
Deletes file from Google Drive by path.

#### `isGDriveConfigured(): boolean`
Checks if Google Drive is connected and has valid tokens.

---

## Support

For issues or questions:
1. Check logs: `if (__DEV__) console.warn('[GDrive] ...')`
2. Review this guide
3. Check [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2)
4. File an issue with logs

---

Last updated: January 11, 2026
