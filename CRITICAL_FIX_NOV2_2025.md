# CRITICAL FIX - App Loading Loop Issue (Nov 2, 2025)

## Problem
The app was stuck in an infinite loading loop with the following symptoms:
- White screen with loading spinner on home screen
- Unable to click on anything
- Stuck at signin screen
- "Unexpected error" preventing app access

## Root Cause
The navigation guard in `app/index.tsx` had a **React hook dependency loop**:

1. The `useEffect` depended on `segments` (which tracks current route)
2. When navigation occurred, `segments` changed
3. This triggered the effect to run again
4. The effect would check segments and potentially navigate again
5. This created an infinite loop: navigate → segments change → effect runs → navigate → ...

The `hasNavigated` flag tried to prevent this, but it was also in the dependency array, which meant any update to it would re-trigger the effect.

## Solution
**Removed `segments` and `hasNavigated` from the useEffect dependency array** in `app/index.tsx`:

```typescript
// BEFORE (BROKEN):
useEffect(() => {
  // ... navigation logic
}, [loading, user, hasNavigated, segments]); // ❌ segments causes loop!

// AFTER (FIXED):
useEffect(() => {
  if (hasNavigated) {
    return; // Already navigated, don't run again
  }
  
  // Safety timeout for loading
  const timeout = setTimeout(() => {
    if (!hasNavigated && loading) {
      logger.warn('Auth loading timeout - forcing navigation to login');
      setHasNavigated(true);
      router.replace('/(auth)/login');
    }
  }, 8000);
  
  if (loading) {
    return () => clearTimeout(timeout);
  }
  
  clearTimeout(timeout);
  
  // Check current route without depending on segments in deps
  const inAuthFlow = (segments as string[]).includes('auth');
  const inTabsFlow = (segments as string[]).includes('tabs');
  
  // Navigate only once based on auth state
  if (inAuthFlow || inTabsFlow) {
    setHasNavigated(true);
    return () => clearTimeout(timeout);
  }
  
  setHasNavigated(true);
  if (!user) {
    router.replace('/(auth)/login');
  } else {
    router.replace('/(tabs)');
  }
  
  return () => clearTimeout(timeout);
}, [loading, user]); // ✅ Only depends on auth state
```

## Key Changes
1. **Effect now only runs when `loading` or `user` changes** - not on every navigation
2. **`hasNavigated` flag prevents re-entry** even if effect runs again
3. **8-second timeout safety mechanism** prevents infinite loading if auth hangs
4. **Segments are still checked** but not in the dependency array

## Why This Works
- Effect runs when auth initializes (loading → false)
- Effect runs when user logs in/out (user changes)
- Effect does NOT run when navigating between screens
- Once navigation happens, `hasNavigated` prevents any future runs
- Timeout ensures the app never gets stuck loading forever

## Testing
To verify the fix works:
1. **Fresh start**: Close app completely, reopen → should show login screen
2. **Login**: Enter credentials → should navigate to home/tabs
3. **Guest mode**: Click "Continue as Guest" → should navigate to home/tabs
4. **Already logged in**: Open app → should go directly to home/tabs
5. **No infinite loops**: Should never see white screen with loading spinner forever

## Files Modified
- `app/index.tsx` - Fixed navigation guard effect dependencies

## Related Issues
- Previous PR #50 attempted to fix this but added segments to deps (which caused the loop)
- This fix uses the proper React pattern: read values inside effect, don't add them to deps if they cause loops

## Deployment
- Commit: d0d9d4b (or later)
- EAS Update published to production channel
- Users should see fix after app refresh or restart
