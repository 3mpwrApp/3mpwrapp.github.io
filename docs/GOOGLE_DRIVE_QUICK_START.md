# Google Drive Quick Start - Developer Guide

Get Google Drive working in **5 minutes** for local development.

## Prerequisites
- Google account
- Project cloned and dependencies installed

## Step 1: Get Google Client IDs (2 minutes)

### Web Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create project or use existing
3. Enable **Google Drive API**
4. Create **OAuth 2.0 Client ID** → **Web application**
5. Add redirect URI: `http://localhost:8081/gdrive-callback`
6. Copy the **Client ID**

### Android Client ID (Optional - for Android testing)
1. Same project, create **OAuth 2.0 Client ID** → **Android**
2. Package name: `com.app3mpwr.app3mpwr`
3. Get SHA-1:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
   ```
4. Paste SHA-1 fingerprint
5. Copy the **Client ID**

## Step 2: Environment Variables (1 minute)

Create `.env` in project root:

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
```

## Step 3: Start Dev Server (1 minute)

```bash
npx expo start --web
```

Open: http://localhost:8081

## Step 4: Test Connection (1 minute)

1. Navigate to **Settings → BYOC**
2. Find **Google Drive** section
3. Click **"Connect to Google Drive"**
4. Popup opens → Sign in → Allow permissions
5. Popup closes → See "✓ Connected"

## Verification

Check if it worked:

```javascript
// In browser console:
localStorage.getItem('@gdrive_config')
// Should see: {"kind":"gdrive","accessToken":"ya29..."}
```

Or check Google Drive:
- Go to [Google Drive](https://drive.google.com/)
- Look for folder: `3mpwr_App_Data`
- Files will appear here when you save data

## Troubleshooting

### "Google client ID not configured"
- Check `.env` file exists
- Restart dev server: `npx expo start --clear`

### "redirect_uri_mismatch"
- Add `http://localhost:8081/gdrive-callback` to authorized redirect URIs in Google Cloud Console
- Wait 2-3 minutes for changes to propagate

### Popup blocked
- Allow popups for localhost:8081
- Try again

## Android Testing

Build and install:

```bash
# Build preview
eas build --platform android --profile preview

# Or local build
npm run android
```

Same flow as web, but opens in Chrome browser and redirects back to app.

## Next Steps

- [Full Setup Guide](./GOOGLE_DRIVE_SETUP.md) - Complete documentation
- [Troubleshooting](./GOOGLE_DRIVE_SETUP.md#troubleshooting) - Common issues
- [API Reference](./GOOGLE_DRIVE_SETUP.md#api-reference) - Code examples

---

**Total time: ~5 minutes** ✅
