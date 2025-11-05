# Force EAS Update Download

## The Issue
Your app has the old buggy version cached. The fix is deployed but not yet downloaded.

## Solution: Force Update Download

### Method 1: Restart App Multiple Times (RECOMMENDED)
1. **Force close** the 3mpwr app completely (swipe away from recent apps)
2. **Wait 5 seconds**
3. **Reopen** the app
4. **Wait for splash screen** to fully load
5. **Repeat steps 1-4 TWO more times** (3 total restarts)
6. On the 3rd restart, the update should be downloaded

### Method 2: Clear App Data (If Method 1 doesn't work)

**Android**:
1. Go to Settings → Apps → 3mpwr App
2. Tap "Storage"
3. Tap "Clear Data" (this will log you out)
4. Open app again
5. Log back in

**iOS**:
1. Delete the app completely
2. Reinstall from TestFlight/App Store
3. Log back in

### Method 3: Check Update Manually (Development Build Only)

If you're on a development build, you can force check for updates:

1. Shake device to open Dev Menu
2. Tap "Check for Updates"
3. Wait for download
4. Restart app

## How to Verify Fix is Downloaded

Once you restart, you should see:
✅ Events tab loads without crash
✅ Calendar Subscription card visible
✅ No black screen

## Why This Happens

EAS Updates:
- Check for updates on app start
- Download in background
- Apply on NEXT restart
- May take 2-3 restarts for large updates

## Current Update Info

**Latest Update**: `24cb024a-46c3-4308-be68-6b03d5fddd5a`
**Fix Deployed**: 16 minutes ago
**Runtime**: exposdk:54.0.0
**Branch**: preview

## Still Crashing?

If it still crashes after Method 2:
1. Check you're on the correct runtime version (exposdk:54.0.0)
2. Verify you're connected to internet when launching
3. Try uninstalling and reinstalling the app
4. Contact support with crash logs
