# Testing OTA Updates - Troubleshooting Guide

## Issue Identified
Your production builds were NOT linked to any update channel, so they couldn't receive OTA updates.

## ✅ Fixed
Added `"channel": "production"` to the production build profile in `eas.json`.

## Next Steps to Get Updates Working

### Option 1: Quick Fix (Test with Preview Build)
Since your production build doesn't have the channel configured, test with a preview build first:

```bash
# 1. Build a new preview APK with proper channel
eas build --platform android --profile preview

# 2. Install it on your phone

# 3. Test update checking:
#    - Open app
#    - Pull down on home screen
#    - OR go to Settings > App Updates > Check for Updates
```

### Option 2: Rebuild Production APK (Recommended for Distribution)
Rebuild your production APK with the channel configuration:

```bash
# 1. Build new production version
eas build --platform android --profile production

# 2. This will create version code 4 with proper channel config

# 3. Install on your phone

# 4. Updates will now work!
```

## How to Verify It's Working

### On Your Device:
1. **Open the app**
2. **Go to Settings > App Updates**
3. **Press "Check for Updates"**
4. You should see one of:
   - ✅ "Update Available" → Download → Restart prompt
   - ✅ "Up to Date" (if already on latest)
   - ❌ "Updates Not Available" (means channel still not configured)

### Alternative Test (Pull-to-Refresh):
1. Open any screen in the app
2. Pull down from the top
3. It should:
   - Show refresh spinner
   - Check for updates in background
   - Show toast if update available

## Current Update Status

**Latest Update Published:**
- Channel: `production`
- Group ID: `af0d84c4-ad98-4959-939a-e4fd55d6476f`
- Message: "Add manual update checker and pull-to-refresh with OTA update support"
- Published: ~20 minutes ago

**Your Production Build:**
- Build ID: `1d187465-4df1-4832-bdaa-8c3bbe6288df`
- Version: 1.0.0 (code 3)
- Runtime: `exposdk:54.0.0`
- ❌ Problem: No channel configured (built before fix)

## Why This Happened

EAS Updates require builds to be explicitly linked to a channel. The default behavior:
- ✅ Development/Preview builds: Auto-link if channel exists
- ❌ Production builds: NO auto-linking (for safety)
- ✅ Solution: Add `"channel": "production"` to eas.json

## Quick Test Command

After installing new build, run this in the app console (if you have dev tools):

```javascript
import * as Updates from 'expo-updates';

// Check current config
console.log('Updates enabled:', Updates.isEnabled);
console.log('Channel:', Updates.channel);
console.log('Runtime:', Updates.runtimeVersion);

// Manual check
Updates.checkForUpdateAsync().then(result => {
  console.log('Update available:', result.isAvailable);
});
```

## Debugging Info

If updates still don't work after rebuilding:

1. **Check app.json updates config:**
   - ✅ Has `updates.url`
   - ✅ Has `runtimeVersion.policy: "sdkVersion"`
   - ✅ Has `checkAutomatically: "ON_LOAD"`

2. **Check build has correct runtime:**
   ```bash
   eas build:list --platform android --limit 1
   ```
   Should show: `Runtime Version: exposdk:54.0.0`

3. **Check updates match runtime:**
   ```bash
   eas update:list --branch production --limit 1
   ```
   Should show: `Runtime Version: exposdk:54.0.0`

4. **Check channel linkage:**
   ```bash
   eas channel:view production
   ```
   Should show recent updates

## Summary

**Root Cause:** Production build had no channel → couldn't find updates
**Solution:** Added `channel: "production"` to eas.json build config
**Action Required:** Rebuild APK with new configuration

Choose Option 1 (preview) for quick testing, or Option 2 (production) for final deployment.
