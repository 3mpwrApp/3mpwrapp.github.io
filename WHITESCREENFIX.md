# White Screen Fix Guide

## Immediate Actions

Run these commands in order to recover from the white screen:

### 1. Clear All Caches (Complete Reset)
```bash
# Windows PowerShell:
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:USERPROFILE\AppData\Local\Expo -ErrorAction SilentlyContinue

# Or use the npm script:
npm run clean:win
```

### 2. Reinstall Dependencies
```bash
npm install
```

### 3. Clear Metro Cache  
```bash
# Option A - Via npm script (starts server with clean cache)
npm run metro:clear

# Option B - Manual cache clear
set EXPO_NO_METRO_CACHE=1&& npx expo start -c

# Option C - Nuclear option (delete entire Metro cache)
rmdir /s /q %USERPROFILE%\AppData\Local\Expo 2>nul || true
```

### 4. Verify Metro Config
- ✅ metro.config.js should NOT have `blacklistRE` property (deprecated)
- ✅ metro.config.js should have `resolveRequest` for Firebase modules
- ✅ No circular imports in resolver config

### 5. Check app/_layout.tsx
- ✅ All providers are properly imported
- ✅ ErrorBoundary wraps the root
- ✅ SafeProviderWrapper catches provider errors
- ✅ All custom components (CognitiveComfortTracker, OfflineBanner, etc) are defined in file

### 6. Verify Firebase Config
- ✅ firebase/config.ts initializes without errors
- ✅ AuthContext.tsx exports AuthProvider correctly
- ✅ No missing Firebase credentials

## If Problem Persists

### Check Browser Console (F12)
1. Open browser dev tools
2. Check **Console** tab for red errors
3. Check **Network** tab for failed requests
4. Note the exact error message

### Minimal App Test
If the above doesn't work, create a minimal test:

1. Create `app/_test.tsx`:
```tsx
import { Text, View } from 'react-native';

export default function TestScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>✅ App can render</Text>
    </View>
  );
}
```

2. Start app with:
```bash
npx expo start --clear
```

3. Navigate to `/test` in browser to see if minimal rendering works

### Provider Isolation
If providers are the issue:

1. Comment out all providers in app/_layout.tsx except ErrorBoundary
2. Gradually re-add providers one by one
3. Note which provider causes white screen

## Root Causes (Recent Issues)

### 1. Metro Config Blacklist Deprecation ✅ FIXED
- **Issue**: `blacklistRE` property is deprecated in Metro v0.80+
- **Fix**: Removed from metro.config.js
- **Status**: COMPLETE

### 2. import.meta Module Issue ✅ FIXED
- **Issue**: Server-side scripts using `import.meta` were being bundled
- **Fix**: Reverted metro.config.js to original (safe) state
- **Status**: COMPLETE

### 3. Provider Initialization Errors
- **Symptoms**: White screen with no error message
- **Fix**: SafeProviderWrapper should catch these
- **Debug**: Check browser console for errors

### 4. Missing Firebase Initialization
- **Symptoms**: App renders loading state indefinitely
- **Fix**: Verify firebase/config.ts loads successfully
- **Debug**: Add console.log in Firebase config

## Verification Checklist

- [ ] Metro cache cleared
- [ ] Dependencies installed
- [ ] No TS compilation errors
- [ ] Browser console has no red errors
- [ ] firebase/config.ts initializes
- [ ] AuthProvider can initialize without auth
- [ ] app/index.tsx can redirect properly
- [ ] All imports in app/_layout.tsx resolve

## Still Stuck?

1. Check commit history:
   ```bash
   git log --oneline --all | head -20
   ```

2. Compare metro.config.js with safe version:
   ```bash
   git show HEAD~5:metro.config.js
   ```

3. Try checking out a known-good commit:
   ```bash
   git checkout [commit-hash]
   npm install
   npm run metro:clear
   ```

## Prevention for Future

- Always test after changing metro.config.js
- Use error boundaries on all provider trees
- Add SafeProviderWrapper to any new providers
- Clear cache before investigating white screens
- Check browser console first, always
