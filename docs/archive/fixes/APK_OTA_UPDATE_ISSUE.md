# APK OTA Update Issue & Solution

## Problem
Production APK loads immediately but doesn't display or check for OTA updates. User doesn't see latest features after they're published via EAS Update.

## Root Cause Analysis

### Current Configuration
**app.json:**
```json
{
  "updates": {
    "checkAutomatically": "ON_LOAD",
    "fallbackToCacheTimeout": 0,
    "url": "https://u.expo.dev/6dd0264f-d796-4f63-9590-f82284a48354"
  },
  "runtimeVersion": {
    "policy": "sdkVersion"
  }
}
```

### Issues Identified

1. **Runtime Version Policy**: Using `"policy": "sdkVersion"` means updates only work for builds with the exact same Expo SDK version. If the APK was built with SDK 53 and you publish an update while on SDK 54, it won't be delivered.

2. **No Manual Update Check**: The app relies on automatic checking (`ON_LOAD`) but doesn't have any user-facing indication that updates are being checked or available.

3. **No Update UI**: Users have no visibility into:
   - Whether an update is available
   - Update download progress
   - When an update was last checked
   - How to manually trigger an update check

## Solutions

### Option 1: Add Manual Update Check (Recommended)
Add a "Check for Updates" button in Settings with visual feedback.

**Benefits:**
- Users can manually trigger updates
- Shows update status and progress
- Works with current configuration
- No build required

**Implementation:**
```typescript
// In app/(tabs)/settings.tsx or a dedicated UpdateChecker component
import * as Updates from 'expo-updates';

export function UpdateChecker() {
  const [checking, setChecking] = React.useState(false);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  
  const checkForUpdates = async () => {
    try {
      setChecking(true);
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        setUpdateAvailable(true);
        // Download the update
        await Updates.fetchUpdateAsync();
        // Show prompt to reload
        Alert.alert(
          'Update Available',
          'A new version is ready. Restart the app to apply updates.',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Restart Now', onPress: () => Updates.reloadAsync() }
          ]
        );
      } else {
        Alert.alert('No Updates', 'You\'re running the latest version!');
      }
    } catch (error) {
      Alert.alert('Update Check Failed', 'Could not check for updates.');
    } finally {
      setChecking(false);
    }
  };
  
  return (
    <Button 
      onPress={checkForUpdates} 
      disabled={checking}
      title={checking ? 'Checking...' : 'Check for Updates'}
    />
  );
}
```

### Option 2: Change Runtime Version Policy
Switch to fingerprint-based runtime versioning for more flexible updates.

**app.json:**
```json
{
  "runtimeVersion": {
    "policy": "fingerprint"
  }
}
```

**Benefits:**
- Automatically detects native code changes
- More flexible update compatibility
- Updates work across minor SDK updates (if no native changes)

**Drawbacks:**
- Requires new build to apply
- More complex to understand compatibility

### Option 3: Use Custom Runtime Version String
Manually control when updates are compatible.

**app.json:**
```json
{
  "runtimeVersion": "1.0.0"
}
```

**When to increment:**
- Change version when adding/removing native modules
- Keep same version for JS-only changes
- Publish updates to matching version

**Benefits:**
- Full control over compatibility
- Clear versioning strategy

**Drawbacks:**
- Must remember to update manually
- Requires new build when changed

## Recommended Action Plan

### Immediate (No Build Required)
1. ✅ Add manual "Check for Updates" button in Settings
2. ✅ Add update status indicator
3. ✅ Show last update check timestamp
4. ✅ Add progress feedback during download

### Short-Term (Next Build)
1. Consider switching to `"runtimeVersion": "1.0.0"`
2. Add update notification on successful download
3. Test OTA update flow thoroughly

### Long-Term
1. Implement automatic background updates
2. Add staged rollout support (via EAS Update channels)
3. Add update analytics tracking
4. Consider code-signing for updates

## Testing OTA Updates

### Step 1: Verify Current Version
```bash
# Check what's in your APK
# Look at app.json runtimeVersion and Expo SDK version
```

### Step 2: Publish Update
```bash
# Publish to production channel
eas update --branch main --channel production -m "Test OTA update delivery"
```

### Step 3: Test Update Delivery
1. Open app on device
2. Check Settings > About > App Version
3. Trigger manual update check (once implemented)
4. Verify update downloads and applies

### Step 4: Verify Update Applied
1. Restart app after update
2. Check for new features
3. Verify version in Settings updated

## Update Channels Strategy

**Current Setup:**
- Production: `production` channel for live users
- Staging: For internal testing before production

**Best Practice:**
```bash
# Test on staging first
eas update --branch main --channel staging -m "New feature: sensory accommodation letter"

# After validation, promote to production
eas update --branch main --channel production -m "New feature: sensory accommodation letter"
```

## Troubleshooting

### Updates Not Appearing
1. **Check runtime version compatibility**: APK and update must match
2. **Verify channel**: Ensure APK points to correct update channel
3. **Check network**: Updates require internet connection
4. **Clear cache**: Sometimes updates are cached

### Force Update Check
```bash
# In dev: Clear Metro cache
npx expo start -c

# On device: Uninstall and reinstall
# Or: Add "Reset App Data" in Settings
```

## Additional Resources

- [Expo Updates Documentation](https://docs.expo.dev/versions/latest/sdk/updates/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [Runtime Versions Explained](https://docs.expo.dev/eas-update/runtime-versions/)
- [Update Strategies](https://docs.expo.dev/eas-update/deployment-patterns/)
