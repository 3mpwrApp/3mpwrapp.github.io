# Google Sign-In Setup for Expo Projects

## Important: Expo-Specific Setup

This app uses **Expo**, which handles authentication differently than standard React Native apps.

## Quick Setup (Development)

### Option 1: Using Expo Go (Recommended for Testing)

Expo Go handles OAuth differently using a proxy service.

**Steps:**

1. **Enable Google Sign-In in Firebase Console** (Required)
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select project: **empowrapp**
   - **Authentication** → **Sign-in method** → **Google**
   - Toggle **Enable** to ON
   - Add your **Project support email**
   - Click **Save**

2. **No SHA-1 Required for Expo Go!**
   - Expo Go uses its own signing certificates
   - Works immediately after enabling in Firebase

3. **Start App:**
   ```powershell
   npx expo start --clear
   ```

4. **Test:**
   - Scan QR code with Expo Go app
   - Tap "Sign in with Google"
   - ✅ Should work without SHA-1 configuration!

### Option 2: Development Build (For Production-Like Testing)

If you need a standalone development build:

1. **Build with EAS:**
   ```powershell
   eas build --profile development --platform android
   ```

2. **Get SHA-1 from EAS:**
   - During build, EAS will output the SHA-1
   - Or check: `eas credentials` → Select project → Android → Keystore

3. **Add SHA-1 to Firebase:**
   - Firebase Console → Project Settings → Android app
   - Add fingerprint → Paste SHA-1 → Save

4. **Install and test** the development build

## Production Setup

### For Google Play Release

When building for production:

1. **Generate Upload Keystore with EAS:**
   ```powershell
   eas credentials
   ```

2. **Get SHA-1:**
   - EAS will show the SHA-1 fingerprint
   - Or download keystore and extract:
   ```powershell
   keytool -list -v -keystore path/to/keystore.jks -alias upload
   ```

3. **Add to Firebase:**
   - Firebase Console → Project Settings → Android app
   - Add both **SHA-1** and **SHA-256** fingerprints

4. **Build:**
   ```powershell
   eas build --profile production --platform android
   ```

## Current Status

Based on your configuration:

✅ **Files Present:**
- `google-services.json` - Project: empowrapp
- `.env` - Client ID configured
- `firebase/config.ts` - Configured correctly

❌ **Not Required for Expo Go:**
- SHA-1 fingerprint (only needed for standalone builds)

⚠️ **Action Required:**
- Enable Google Sign-In in Firebase Console (see Step 1 above)

## Testing Guide

### Test in Expo Go (Easiest)

1. Enable Google Sign-In in Firebase Console
2. Start app: `npx expo start`
3. Scan QR with Expo Go
4. Tap "Sign in with Google"
5. Should work immediately!

### Test in Development Build

1. Build: `eas build --profile development --platform android`
2. Get SHA-1 from build output
3. Add SHA-1 to Firebase
4. Install APK on device
5. Test Google Sign-In

## Common Issues

### "prohibited" Error in Expo Go
**Cause:** Google Sign-In not enabled in Firebase Console  
**Fix:** Enable Google provider in Firebase (Step 1 above)

### "redirect_uri_mismatch" Error
**Cause:** Expo's proxy redirect URI not whitelisted  
**Fix:** This should be automatic. If persists, check Firebase Console → Authentication → Settings → Authorized domains

### Works in Expo Go but not in Build
**Cause:** SHA-1 not added for standalone build  
**Fix:** Get SHA-1 from EAS and add to Firebase

## Alternative: Google Services Configuration

For Expo SDK 49+, you can also use `@react-native-google-signin/google-signin`:

```bash
npx expo install @react-native-google-signin/google-signin
```

But the current implementation using `expo-auth-session` is recommended for Expo projects.

## Firebase Console Quick Links

- [Firebase Console](https://console.firebase.google.com/)
- [Authentication Settings](https://console.firebase.google.com/project/empowrapp/authentication/providers)
- [Project Settings](https://console.firebase.google.com/project/empowrapp/settings/general)

## Next Steps

1. ✅ **Enable Google Sign-In** in Firebase Console (5 minutes)
2. ✅ **Test in Expo Go** (works immediately, no SHA-1 needed)
3. ⏭️ **For production**: Build with EAS and add SHA-1

## Summary

For **immediate testing**:
- ✅ Just enable Google Sign-In in Firebase Console
- ✅ Use Expo Go - no SHA-1 needed!
- ✅ Should work right away

For **production**:
- 🔜 Build with EAS
- 🔜 Add SHA-1 from EAS to Firebase
- 🔜 Deploy to Google Play

---

Last Updated: November 7, 2025
