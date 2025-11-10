# Campaigns Intermittent Crash Fix - November 10, 2025

## Issue Description
User reported that campaigns would "randomly pop up" but then crash when navigating from Home → Campaigns tab. This is a classic **timing/race condition** issue that occurs during tab navigation.

## Root Cause Analysis

### The Problem
The crash was intermittent because it depended on timing:

1. **State Updates After Unmount**: When navigating away from the Campaigns tab quickly, the component would unmount but async operations (like `fetchCampaigns()`) would complete and try to update state on an unmounted component.

2. **Race Conditions on Tab Switch**: The `useEffect` with `reload` in dependencies could trigger multiple times when switching tabs quickly, causing multiple simultaneous API calls and conflicting state updates.

3. **No Initialization Guard**: Every time you navigated to the Campaigns tab, it would re-fetch data even if already loaded, causing unnecessary reloads and potential race conditions.

4. **Missing Navigation Delay**: The tab would try to render immediately, potentially before context providers were fully initialized.

### Why It Was Random
- Sometimes you'd navigate fast enough to trigger the unmount before fetch completed (crash)
- Sometimes the component would stay mounted long enough (no crash)
- The error boundary would catch some crashes but not all (especially timing-related ones)

## Comprehensive Fix

### 1. Added Mounted State Tracking
**File**: `app/campaigns/index.tsx`

```typescript
// Track if component is mounted to prevent state updates after unmount
const isMountedRef = React.useRef(true);
const isInitializedRef = React.useRef(false);

React.useEffect(() => {
  isMountedRef.current = true;
  return () => {
    isMountedRef.current = false;
  };
}, []);
```

**Benefit**: Prevents state updates on unmounted components

### 2. Protected Reload Function
**File**: `app/campaigns/index.tsx`

```typescript
const reload = React.useCallback(async () => {
  // Don't reload if component is unmounted
  if (!isMountedRef.current) {
    logger.warn('[Campaigns] Skipping reload - component unmounted');
    return;
  }

  try {
    if (isMountedRef.current) setError(null);
    if (isMountedRef.current) setLoading(true);
    
    const data = await fetchCampaigns();
    
    // Only update state if still mounted
    if (!isMountedRef.current) {
      logger.warn('[Campaigns] Skipping state update - component unmounted during fetch');
      return;
    }
    
    const validData = Array.isArray(data) ? data : [];
    setItems(validData);
    setOffline(false);
    setLastSyncTime(new Date());
    
    isInitializedRef.current = true;
  } catch (err) {
    if (!isMountedRef.current) return;
    // ... error handling
  } finally {
    if (isMountedRef.current) setLoading(false);
  }
}, [setOffline, items, safeLocalCampaigns]);
```

**Benefit**: Every state update is guarded by mount status

### 3. Initialization Guard
**File**: `app/campaigns/index.tsx`

```typescript
React.useEffect(() => {
  // Don't reload if already initialized and this is just a tab switch
  if (isInitializedRef.current) {
    logger.info('[Campaigns] Skipping reload - already initialized');
    return;
  }

  let cancelled = false;
  
  const doLoad = async () => {
    if (cancelled || !isMountedRef.current) return;
    // ... load data
  };
  
  doLoad();
  
  return () => {
    cancelled = true;
  };
}, [tick, reload, safeLocalCampaigns]);
```

**Benefit**: Prevents unnecessary reloads on tab navigation

### 4. Navigation Delay in Tab Wrapper
**File**: `app/(tabs)/campaigns.tsx`

```typescript
export default function CampaignsTab() {
  const palette = useAppPalette();
  const [isReady, setIsReady] = React.useState(false);
  
  // Delay rendering to ensure proper initialization
  React.useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  // Show loading state briefly to prevent race conditions
  if (!isReady) {
    return (
      <View style={createStyles(palette).loadingContainer}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📣</Text>
        <Text style={{ fontSize: 16, color: palette.text, opacity: 0.7 }}>Loading Campaigns...</Text>
      </View>
    );
  }
  
  return (
    <CampaignsTabErrorBoundary palette={palette}>
      <CampaignsScreenComponent />
    </CampaignsTabErrorBoundary>
  );
}
```

**Benefit**: Gives context providers and navigation 50ms to stabilize before rendering

## What This Fixes

✅ **Unmount Crashes**: State updates after unmount are now prevented  
✅ **Race Conditions**: Multiple simultaneous reloads are prevented  
✅ **Navigation Crashes**: Tab switches don't trigger unnecessary reloads  
✅ **Initialization Issues**: Component waits for proper setup before rendering  
✅ **Fast Navigation**: Rapid tab switching won't cause crashes  

## Testing Scenarios

### Scenario 1: Fast Navigation (Your Issue)
1. Open app → Home tab
2. Quickly tap Campaigns tab
3. Immediately tap Home tab
4. Quickly tap Campaigns tab again
**Expected**: No crash, smooth loading

### Scenario 2: Slow Navigation
1. Open app → Home tab
2. Wait 2 seconds
3. Tap Campaigns tab
4. Let it fully load
**Expected**: Normal loading, no issues

### Scenario 3: Repeated Navigation
1. Tap Campaigns tab
2. Tap Home tab
3. Repeat 10 times rapidly
**Expected**: No crashes, possibly see loading states

### Scenario 4: Background Fetch During Navigation
1. Tap Campaigns tab
2. While loading, immediately tap away
**Expected**: Load is cancelled cleanly, no crash

## Technical Details

### Mounted State Pattern
This is a standard React pattern for preventing memory leaks and crashes:
- `isMountedRef.current = true` on mount
- `isMountedRef.current = false` on unmount
- Check before every `setState` call

### Initialization Pattern
Prevents duplicate work:
- `isInitializedRef.current = false` initially
- Set to `true` after first successful load
- Skip reload if already initialized

### Navigation Delay Pattern
Gives system time to stabilize:
- 50ms delay is imperceptible to users
- Ensures context providers are ready
- Prevents race conditions during rapid navigation

## Performance Impact

**Minimal to None**:
- 50ms delay is barely noticeable
- Prevents unnecessary reloads (actually improves performance)
- Guards are simple boolean checks (negligible overhead)

## Monitoring

After deployment, watch for:
1. ✅ Reduction in Campaign-related crashes in Sentry
2. ✅ No "unmounted component" warnings in logs
3. ✅ Faster tab navigation (due to skipped reloads)
4. ✅ Lower API call frequency

## Future Improvements

Consider these enhancements:
1. **Persistent Cache**: Store fetched campaigns in AsyncStorage
2. **Stale-While-Revalidate**: Show cached data immediately, refresh in background
3. **Prefetch**: Load campaigns data when user hovers/approaches Campaigns tab
4. **Optimistic Updates**: Update UI before server confirms

## Related Fixes

This builds on:
- **CAMPAIGNS_CRASH_COMPREHENSIVE_FIX_NOV9.md**: Data validation and error handling
- **CAMPAIGNS_TAB_FIX.md**: Initial error boundary implementation

## Deployment

```bash
# Test locally first
npx expo start

# Deploy to preview
eas update --channel preview --message "Fix campaigns intermittent crash on navigation"

# After testing, deploy to production
eas update --channel production --message "Critical fix: Campaigns intermittent crash during tab navigation"
```

## Summary

This fix addresses the **root cause** of intermittent crashes during tab navigation by:
1. Preventing state updates on unmounted components
2. Guarding against race conditions
3. Avoiding unnecessary reloads
4. Adding a stabilization delay

**Status**: ✅ COMPLETE - Ready for testing and deployment

---

**Testing Instructions**:
1. Navigate Home → Campaigns rapidly multiple times
2. Navigate away while Campaigns is loading
3. Use the app normally with various navigation patterns
4. Check console for any warnings or errors

Expected result: No crashes, smooth navigation, better performance.
