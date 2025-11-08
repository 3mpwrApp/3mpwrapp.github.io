# Fix: Google OAuth "Error 404: Access Blocked" - Authorization Error

## Error Message
```
Error 404: access blocked authorization error
invalid_request, flowName=GeneralOAuthFlow
```

## Root Cause
The **redirect URI** that Expo uses is not authorized in Google Cloud Console. Expo uses a proxy service (`https://auth.expo.io/@owner/slug`) for OAuth redirects, and this must be whitelisted.

## Solution: Add Expo's Redirect URI to Google Cloud Console

### Step 1: Get Your Redirect URIs

Your app uses these redirect URIs:
```
https://auth.expo.io/@3mpwrapp/empowrapp
```

For Expo Go development, the proxy format is:
```
https://auth.expo.io/@<owner>/<slug>
```

Where:
- **owner**: `3mpwrapp` (from app.json)
- **slug**: `empowrapp` (from app.json)

### Step 2: Add SHA-1 Fingerprint (Required for Android)

⚠️ **IMPORTANT:** Firebase requires the SHA-1 release fingerprint for Android apps to enable Google Sign-In.

#### Get SHA-1 Fingerprint from EAS:

```powershell
# Get the SHA-1 fingerprint for your Android keystore
eas credentials -p android

# Or generate it manually from your keystore file
keytool -list -v -keystore @3mpwrapp__empowrapp.jks -alias <your_alias>
```

#### Add to Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **empowrapp**
3. Click **Project Settings** (gear icon)
4. Scroll to **Your apps** section
5. Find your Android app
6. Click **Add fingerprint**
7. Paste your SHA-1 fingerprint
8. Click **Save**

**Note:** You need to add SHA-1 fingerprints for:
- ✅ **Development build** (debug keystore)
- ✅ **Release build** (production keystore)
- ✅ **Google Play upload key** (if using Play App Signing)

### Step 3: Add Redirect URI to Google Cloud Console

1. **Go to Google Cloud Console**:
   - https://console.cloud.google.com/

2. **Select Your Project**:
   - Project ID: `empowrapp` (or your Firebase project ID)

3. **Navigate to OAuth Consent Screen**:
   - Left menu → **APIs & Services** → **Credentials**

4. **Find Your Web Client ID**:
   - Look for: `733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs.apps.googleusercontent.com`
   - Click on it to edit

5. **Add Authorized Redirect URIs**:
   - Scroll to **Authorized redirect URIs**
   - Click **+ ADD URI**
   - Add: `https://auth.expo.io/@3mpwrapp/empowrapp`
   - Click **Save**

### Step 4: Also Add to Firebase Console (If Different)

1. **Go to Firebase Console**:
   - https://console.firebase.google.com/

2. **Select Project**: `empowrapp`

3. **Authentication** → **Sign-in method** → **Google**

4. **Scroll to "Authorized domains"** (at bottom)

5. **Add Domain**:
   - Add: `auth.expo.io`
   - Click **Add**

### Step 5: Test the Fix

After adding the SHA-1 fingerprint and redirect URI:

```powershell
# Clear cache and restart
npx expo start --clear
```

Then:
1. Scan QR code with Expo Go
2. Tap "Sign in with Google"
3. Should work without the 404 error! ✅

## Expected Redirect URI Format

The app will log the redirect URI being used. Look for:
```
[OAuth] Redirect URI: https://auth.expo.io/@3mpwrapp/empowrapp
```

Make sure this **EXACT** URI is added to Google Cloud Console.

## Common Issues

### Issue: Still getting 404 after adding URI
**Solution:** 
- Double-check the redirect URI matches EXACTLY (case-sensitive)
- Wait a few minutes for Google to propagate changes
- Make sure you added it to the **Web Client ID** (not Android Client ID)

### Issue: Different redirect URI in logs
**Solution:**
- Check the `owner` and `slug` in your `app.json`
- The format is: `https://auth.expo.io/@<owner>/<slug>`
- Update the redirect URI in Google Cloud Console to match

### Issue: Works in Expo Go but not standalone build
**Solution:**
- Standalone builds use native scheme: `empowrapp://`
- Add this as well: `empowrapp://`
- Or use custom redirect URI in standalone builds

## Alternative: Use Native Redirect URI

If you're building standalone apps (not Expo Go), you can use native scheme:

In `services/auth/oauth.ts`:
```typescript
const redirectUri = AuthSession.makeRedirectUri({ 
  useProxy: false, // Use native scheme
  scheme: 'empowrapp'
});
// Results in: empowrapp://
```

Then add `empowrapp://` to Google Cloud Console authorized redirect URIs.

## Summary

**For Expo Go (Development):**
- ✅ Add: `https://auth.expo.io/@3mpwrapp/empowrapp`
- ✅ Add domain: `auth.expo.io` to Firebase authorized domains

**For Standalone Builds (Production):**
- ✅ Add: `empowrapp://` 
- ✅ Or your custom scheme

**Both redirect URIs can coexist** - add both if you need to support Expo Go and standalone builds!

---

## Quick Fix Checklist

- [ ] **Get SHA-1 fingerprint** from your Android keystore (`eas credentials -p android`)
- [ ] **Add SHA-1 to Firebase Console** → Project Settings → Your apps → Add fingerprint
- [ ] Go to Google Cloud Console → APIs & Services → Credentials
- [ ] Find your Web Client ID OAuth 2.0 Client
- [ ] Add redirect URI: `https://auth.expo.io/@3mpwrapp/empowrapp`
- [ ] Save changes
- [ ] Go to Firebase Console → Authentication → Sign-in method → Google
- [ ] Add authorized domain: `auth.expo.io`
- [ ] Test: `npx expo start --clear`

After completing these steps, Google Sign-In should work! 🎉

---

Last Updated: November 7, 2025
Status: ✅ **Ready to Fix**
