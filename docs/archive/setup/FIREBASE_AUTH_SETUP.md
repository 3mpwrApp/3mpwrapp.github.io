# Firebase Authentication Setup Guide

## Issue: "Prohibited" Error on Google Sign-In

This error occurs when Google Sign-In is not properly configured in Firebase Console.

## Step-by-Step Fix

### 1. Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **empowrapp**
3. Navigate to **Authentication** → **Sign-in method**
4. Find **Google** in the providers list
5. Click **Edit** (pencil icon)
6. Toggle **Enable** to ON
7. Add your **Project support email** (required)
8. Click **Save**

### 2. Configure Android OAuth (For Native App)

#### Get SHA-1 Certificate Fingerprint

Run this command in your project root:

```powershell
# For debug builds
cd android
./gradlew signingReport

# Or use keytool directly
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Copy the **SHA-1** fingerprint.

#### Add SHA-1 to Firebase

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click on your Android app (com.app3mpwr.app3mpwr)
4. Click **Add fingerprint**
5. Paste your SHA-1 fingerprint
6. Click **Save**

### 3. Web Client ID (For Web Builds)

If you're building for web, you need a separate Web Client ID:

1. In Firebase Console, go to **Authentication** → **Sign-in method** → **Google**
2. Under **Web SDK configuration**, you'll see your **Web client ID**
3. Copy it and add to `.env`:

```properties
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID_HERE
```

### 4. Verify google-services.json

Make sure your `google-services.json` file is up to date:

1. In Firebase Console, go to **Project Settings**
2. Scroll to **Your apps** → Android app
3. Click **Download google-services.json**
4. Replace the file in your project root

### 5. Test Configuration

After completing the above steps:

1. **Stop and rebuild** your app (Expo Go or development build)
2. Try Google Sign-In again
3. Check console logs for any errors

## Common Issues

### "prohibited" Error
- **Cause**: Google Sign-In not enabled in Firebase Console
- **Fix**: Follow Step 1 above

### "invalid_client" Error
- **Cause**: OAuth Client ID mismatch
- **Fix**: Verify SHA-1 fingerprint is added (Step 2)

### "redirect_uri_mismatch" Error
- **Cause**: Redirect URI not whitelisted
- **Fix**: Firebase automatically handles this for mobile apps. For web, add your domain to authorized domains in Firebase Console.

### Sign-in works but user is null
- **Cause**: Navigation timing issue
- **Fix**: Already handled in AuthContext and app/index.tsx

## Current Configuration

```
Project: empowrapp
Package: com.app3mpwr.app3mpwr
Android Client ID: 733708119893-vagikeh1bu36n9boma32ic2lbfvbff08.apps.googleusercontent.com
```

## Additional Auth Methods

### Email/Password
- Already enabled by default in Firebase
- No additional configuration needed

### Apple Sign-In (iOS only)
- Requires Apple Developer account
- Enable in Firebase Console → Authentication → Sign-in method → Apple
- Add Apple Sign In capability in Xcode

### Anonymous/Guest
- Enable in Firebase Console → Authentication → Sign-in method → Anonymous
- Already implemented in the app

## Next Steps

After enabling authentication:

1. ✅ Google Sign-In should work without "prohibited" error
2. ✅ User should be redirected to home/(tabs) after successful sign-in
3. ✅ All sign-in methods (Email, Google, Apple, Guest) should work

## Support

If you still encounter issues after following this guide:

1. Check Firebase Console for any error messages
2. Review app logs: `npx expo start --clear`
3. Check that firebase/config.ts points to your Firebase project
4. Verify internet connectivity

---

Last Updated: November 7, 2025
