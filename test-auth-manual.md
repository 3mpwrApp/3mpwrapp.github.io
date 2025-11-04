# Manual Auth Flow Test

## Test Steps

### 1. Initial App Load (No User)
- **Expected:** App should show login screen
- **Check:** Loading spinner appears briefly, then login screen
- **Status:** ✅ PASS / ❌ FAIL

### 2. Continue as Guest Button
- **Action:** Tap "Continue as Guest" button
- **Expected:** 
  - Button shows "Working..." briefly
  - App navigates to Home tab (/(tabs))
  - User can see all 8 tabs
- **Status:** ✅ PASS / ❌ FAIL

### 3. Navigation After Guest Login
- **Action:** Try tapping on different tabs (Home, Campaigns, Community, etc.)
- **Expected:** Each tab should respond and show content
- **Status:** ✅ PASS / ❌ FAIL

### 4. Settings Menu
- **Action:** Tap Settings tab
- **Expected:** Settings screen appears with options
- **Status:** ✅ PASS / ❌ FAIL

### 5. Logout
- **Action:** Tap Sign Out in settings
- **Expected:** App returns to login screen
- **Status:** ✅ PASS / ❌ FAIL

### 6. Email/Password Login
- **Action:** Enter email and password, tap Login
- **Expected:** 
  - If valid: Navigate to Home tab
  - If invalid: Show error message
- **Status:** ✅ PASS / ❌ FAIL

## Common Issues & Fixes

### Issue: Buttons don't respond
**Cause:** Navigation loop causing rapid re-renders
**Fix:** Applied - using useRef to prevent multiple navigation calls

### Issue: Stuck on loading screen
**Cause:** Firebase auth taking too long or not initializing
**Fix:** Check Firebase config, check internet connection

### Issue: Guest mode doesn't work
**Cause:** Firebase anonymous auth not enabled
**Fix:** Enable Anonymous authentication in Firebase Console

## Debug Logs to Check

When running the app, look for these log messages:

```
[AuthContext] Auth state changed: { user: null/object, loading: false }
[Index] Index navigation check: { user: true/false, inAuthFlow: true/false, inTabsFlow: true/false }
[Index] User logged in - navigating to tabs
[Login] Starting guest mode...
[Login] Guest mode successful! Auth state will trigger navigation.
```

## Testing with Expo Go

1. Start dev server: `npx expo start`
2. Scan QR code with Expo Go app
3. Follow test steps above
4. Check console for debug logs

## Testing with Preview Build

1. Install APK from: https://expo.dev/accounts/3mpwrapp/projects/empowrapp/builds/6b58cac8-faa8-42c9-8ae7-6ae488b71639
2. Follow test steps above
3. Note: Debug logs won't be visible in production build
