# Complete Authentication Testing Guide

## Prerequisites

1. **Enable Google Sign-In in Firebase Console**:
   - Follow instructions in `FIREBASE_AUTH_SETUP.md`
   - Ensure Google provider is enabled with your support email
   - Add SHA-1 fingerprint for Android

2. **Start the app**:
   ```powershell
   npx expo start --clear
   ```

## Test Cases

### ✅ Test 1: Email/Password Sign-In

**Steps**:
1. Open app → Should see Login screen
2. Enter test credentials:
   - Email: `empowrapp08162025@gmail.com`
   - Password: `[your password]`
3. Tap "Login" button

**Expected Result**:
- ✅ No error messages
- ✅ Console logs: `[AuthContext] Auth state changed { hasUser: true }`
- ✅ Console logs: `[Index] ✅ User logged in - navigating to home/(tabs)`
- ✅ App navigates to Home tab (first tab)
- ✅ User is signed in and can see all tabs

**If it fails**:
- Check Firebase Console → Authentication → Users (user should exist)
- Check console for error messages
- Verify firebase/config.ts points to correct project

---

### ✅ Test 2: Google Sign-In

**Steps**:
1. Sign out if signed in
2. On Login screen, tap "Sign in with Google"
3. Select Google account
4. Authorize app

**Expected Result**:
- ✅ Google sign-in modal opens
- ✅ No "prohibited" error
- ✅ Console logs: `Google Sign-In successful!`
- ✅ Console logs: `[AuthContext] Auth state changed { hasUser: true, provider: 'google.com' }`
- ✅ Console logs: `[Index] ✅ User logged in - navigating to home/(tabs)`
- ✅ App navigates to Home tab
- ✅ User profile shows Google email

**If it fails with "prohibited"**:
- Google Sign-In is NOT enabled in Firebase Console
- Follow `FIREBASE_AUTH_SETUP.md` Step 1
- Restart app after enabling

**If it fails with "invalid_client"**:
- SHA-1 fingerprint not added to Firebase
- Follow `FIREBASE_AUTH_SETUP.md` Step 2
- Rebuild app after adding SHA-1

---

### ✅ Test 3: Apple Sign-In (iOS only)

**Steps**:
1. Sign out if signed in
2. On Login screen, tap "Sign in with Apple"
3. Authenticate with Face ID/Touch ID
4. Choose to share or hide email

**Expected Result**:
- ✅ Apple sign-in modal opens
- ✅ No "not available" error
- ✅ Console logs: `[AuthContext] Auth state changed { hasUser: true, provider: 'apple.com' }`
- ✅ App navigates to Home tab

**If not available**:
- Apple Sign-In only works on iOS devices
- Requires Apple Developer account
- Enable in Firebase Console → Authentication → Apple

---

### ✅ Test 4: Guest Mode

**Steps**:
1. Sign out if signed in
2. On Login screen, tap "Continue as Guest"

**Expected Result**:
- ✅ No errors
- ✅ Console logs: `[Login] Starting guest mode...`
- ✅ Console logs: `[AuthContext] Auth state changed { hasUser: true, isAnonymous: true }`
- ✅ Console logs: `[Index] ✅ User logged in - navigating to home/(tabs)`
- ✅ App navigates to Home tab
- ✅ User can access all features

**If it fails**:
- Check Firebase Console → Authentication → Sign-in method → Anonymous
- Enable Anonymous authentication
- Restart app

---

### ✅ Test 5: Sign Out and Navigation

**Steps**:
1. Sign in with any method
2. Navigate to Settings tab
3. Scroll to bottom
4. Tap "Sign Out"

**Expected Result**:
- ✅ Console logs: `[AuthContext] No user - signed out`
- ✅ Console logs: `[Index] ❌ No user in tabs - navigating to login`
- ✅ App navigates back to Login screen
- ✅ Can sign in again with any method

---

## Console Log Checklist

When testing, watch for these key log messages:

### Successful Sign-In Flow:
```
[Login] Starting login process... (or guest mode, or oauth)
[AuthContext] Auth state changed { hasUser: true }
[Index] ✅ User logged in - navigating to home/(tabs)
```

### Sign Out Flow:
```
[AuthContext] No user - signed out
[Index] ❌ No user in tabs - navigating to login
```

### Google Sign-In Specific:
```
Google Sign-In config: { platform: 'android', clientId: '...' }
Google Sign-In result: { type: 'success' }
Google Sign-In successful!
```

---

## Troubleshooting

### Issue: Google Sign-In shows "prohibited"

**Cause**: Google Sign-In not enabled in Firebase Console

**Fix**:
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select project: **empowrapp**
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google**
5. Toggle **Enable** to ON
6. Add support email
7. Click **Save**
8. Restart app: `npx expo start --clear`

---

### Issue: User signs in but stays on login screen

**Cause**: Navigation logic not triggered

**Fix**:
1. Check console logs for navigation messages
2. Verify AuthContext is properly set up in _layout.tsx
3. Clear app cache: `npx expo start --clear`
4. Reload app

---

### Issue: "invalid_client" error on Android

**Cause**: SHA-1 fingerprint not added to Firebase

**Fix**:
1. Get SHA-1: `cd android; ./gradlew signingReport`
2. Copy SHA-1 fingerprint
3. Firebase Console → Project Settings → Your Android app
4. Add fingerprint
5. Rebuild app

---

## Success Criteria

All authentication methods should:
- ✅ Complete without errors
- ✅ Navigate to Home/(tabs) after success
- ✅ Show console logs confirming auth state change
- ✅ Allow user to access all tabs
- ✅ Allow sign out and return to login

---

## Quick Test Commands

```powershell
# Clear cache and restart
npx expo start --clear

# Build for Android (if testing native features)
eas build --profile development --platform android

# Check Firebase auth state
# (Run in app after sign in)
# User should be visible in Firebase Console → Authentication → Users
```

---

Last Updated: November 7, 2025
