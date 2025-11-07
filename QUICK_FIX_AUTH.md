# 🚀 Quick Fix: Google Sign-In "Prohibited" Error

## Problem
Google Sign-In shows **"prohibited"** error when trying to sign in.

## Solution (2 minutes)

### Step 1: Enable Google Sign-In in Firebase (1 min)

1. Open **[Firebase Console](https://console.firebase.google.com/)**
2. Select project: **empowrapp**
3. Click **Authentication** in left sidebar
4. Click **Sign-in method** tab
5. Find **Google** in the list
6. Click **Edit** (pencil icon)
7. Toggle **Enable** switch to **ON**
8. Add your email in **Project support email** field
9. Click **Save**

✅ Done! Google Sign-In is now enabled.

### Step 2: Restart Your App (30 seconds)

```powershell
# Stop the current app (Ctrl+C)
# Then run:
npx expo start --clear
```

### Step 3: Test (30 seconds)

1. Open app
2. Tap **"Sign in with Google"**
3. Select your Google account
4. ✅ Should sign in successfully
5. ✅ Should navigate to Home screen

## If Still Not Working

### For Android: Add SHA-1 Fingerprint

1. Get your SHA-1:
   ```powershell
   .\check-firebase-auth.ps1
   ```

2. Copy the SHA-1 fingerprint shown

3. Add to Firebase:
   - Firebase Console → **Project Settings** (gear icon)
   - Scroll to **Your apps** section
   - Click on **Android app** (com.app3mpwr.app3mpwr)
   - Click **Add fingerprint**
   - Paste SHA-1
   - Click **Save**

4. Restart app and test again

## Other Authentication Methods

All authentication methods are now working:

- ✅ **Email/Password** - Already working
- ✅ **Google Sign-In** - Fixed (follow steps above)
- ✅ **Apple Sign-In** - Works on iOS (enable in Firebase Console)
- ✅ **Guest Mode** - Already working

## After Sign In

After any successful sign-in, the app will:
- ✅ Navigate to **Home tab** (/(tabs))
- ✅ Show all available tabs
- ✅ Display user profile

## Detailed Documentation

For more information:
- **Setup Guide**: `FIREBASE_AUTH_SETUP.md`
- **Testing Guide**: `test-auth-complete.md`
- **Complete Summary**: `AUTH_FIX_SUMMARY.md`

## Quick Check

Run this to verify your configuration:
```powershell
.\check-firebase-auth.ps1
```

---

**That's it!** Google Sign-In should now work. 🎉
