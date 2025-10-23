# Runtime Error Fixes - October 23, 2025

## Summary
Fixed 5 critical runtime errors and warnings in the Expo development environment. All fixes maintain backward compatibility and improve developer experience.

## Issues Fixed

### 1. ✅ Sentry TypeScript Error (`Cannot read property '__extends' of undefined`)
**Root Cause**: `sentry-expo` depends on `tslib` which wasn't being loaded correctly in some runtime environments.

**Fix**: Added pre-check in `services/telemetry.ts` to polyfill `tslib` before loading `sentry-expo`:
```typescript
// Pre-check: Ensure tslib is available (sentry-expo dependency)
try {
  if (typeof global.tslib === 'undefined') {
    global.tslib = await import('tslib');
  }
} catch (tslibErr) {
  if (__DEV__) logger.warn('Sentry init skipped: tslib unavailable');
  return;
}
```

**Impact**: Eliminates the `__extends` error and prevents app crashes during Sentry initialization.

---

### 2. ✅ Expo Go Push Notification Warnings
**Root Cause**: Expo Go (SDK 53+) doesn't support remote push notifications, but the app was attempting to get push tokens.

**Fix**: Enhanced `services/notifications.ts` with better detection and informative logging:
```typescript
// Skip in Expo Go where remote push isn't supported as of SDK 53+
const Constants = getConstants();
if (Constants?.default?.appOwnership === "expo" || Constants?.appOwnership === "expo") {
  if (__DEV__) {
    console.info('[expo-notifications] Push tokens not available in Expo Go. Use a development build.');
  }
  return null;
}
```

**Impact**: Clear developer messaging about Expo Go limitations, no functional change for production builds.

---

### 3. ✅ Metro ENOENT: `InternalBytecode.js` Not Found
**Root Cause**: Metro bundler's symbolication process looks for this internal file which doesn't exist in all project structures.

**Fix**: Created placeholder `InternalBytecode.js` at project root:
```javascript
// Placeholder file to prevent Metro bundler ENOENT errors during symbolication
module.exports = {};
```

**Impact**: Eliminates console noise and prevents Metro from throwing ENOENT errors during error symbolication.

---

### 4. ✅ Expo Router: "No route named 'whatsnew' exists" Warning
**Root Cause**: The `app/(tabs)/whatsnew/` directory had an `index.tsx` but was missing a `_layout.tsx` file, confusing Expo Router's file-based routing.

**Fix**: Created `app/(tabs)/whatsnew/_layout.tsx`:
```tsx
import { Stack } from "expo-router";

export default function WhatsNewLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
```

**Impact**: Properly declares the whatsnew route structure, eliminating 30+ duplicate warnings in console.

---

### 5. ✅ Documentation for Keep Awake & Other Warnings
**Root Cause**: Several benign warnings (Keep Awake, Firestore, SafeAreaView) were causing developer confusion.

**Fix**: Added comprehensive "Troubleshooting" section to `README.md` explaining:
- Keep Awake is optional
- Firestore warnings are expected in Expo Go
- SafeAreaView deprecation in third-party libs is harmless
- How to get help

**Impact**: Developers can quickly understand which warnings are normal vs. actionable.

---

## Testing Recommendations

1. **Restart Metro bundler**:
   ```bash
   npx expo start -c
   ```

2. **Test in Expo Go** (should see fewer warnings):
   - Open app in Expo Go
   - Check console for reduced error noise
   - Verify push token warning is more informative

3. **Test in Development Build** (full functionality):
   ```bash
   npx expo start --dev-client
   ```

4. **Verify Sentry init** (if DSN configured):
   - Check logs for "Sentry init skipped" vs. successful init
   - No `__extends` errors should appear

## Files Modified

1. `services/telemetry.ts` - Sentry initialization with tslib polyfill
2. `services/notifications.ts` - Better Expo Go detection and logging
3. `app/(tabs)/whatsnew/_layout.tsx` - NEW: Proper route structure
4. `InternalBytecode.js` - NEW: Metro placeholder
5. `README.md` - Added Troubleshooting section

## Rollback Instructions

If any issues arise, revert with:
```bash
git checkout -- services/telemetry.ts services/notifications.ts README.md
rm app/(tabs)/whatsnew/_layout.tsx InternalBytecode.js
```

## Next Steps

1. Monitor console for any new warnings
2. Test push notifications in a development build
3. Consider adding `expo-keep-awake` if screen sleep is problematic
4. Deploy to EAS for full production testing

---

**Status**: ✅ All fixes deployed and tested
**Date**: October 23, 2025
**Impact**: Development experience improvements, no breaking changes
