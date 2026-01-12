# Modal Accessibility Enhancements & Timing Controls

## Overview
This document describes the new modal timing and accessibility infrastructure implemented to provide better user experience for all users, especially those who need extra time or rely on accessibility features.

## Architecture

### useModalTimer Hook ([hooks/useModalTimer.ts](hooks/useModalTimer.ts))

A comprehensive React hook for managing modal auto-dismiss timing with built-in accessibility support.

**Features:**
- ✅ Configurable timeout duration (default: 5 seconds)
- ✅ Automatic pause when app loses focus (pauseOnBlur)
- ✅ Accessibility announcements 3 seconds before auto-dismiss
- ✅ Pause/resume/cancel timer controls
- ✅ Countdown tracking for UI integration
- ✅ No setTimeout leaks - proper cleanup on unmount

**API:**

```typescript
const { startTimer, pauseTimer, resumeTimer, cancelTimer, remainingMs, remainingSeconds } = useModalTimer({
  duration: 5000,                    // Auto-dismiss after 5s
  onDismiss: () => setShowModal(false),
  onCountdownChange: (remaining) => {
    // Update UI with remaining time
  },
  pauseOnBlur: true,                 // Pause when app backgrounded
  announceBeforeDismiss: true,       // Announce before auto-dismiss
  announceAtSeconds: 3,              // Announce 3s before dismissal
  onAccessibilityDismiss: (action) => {
    // Track whether auto-dismissed or manually dismissed
  }
});
```

**Why This Matters:**

1. **WCAG 2.3.1 Compliance**: Removes auto-dismissing from being a barrier (Conformance Level A)
2. **Pause on Blur**: Essential for users who need time to read or cannot context-switch quickly
3. **Announcements**: Screen reader users know the modal will dismiss and when
4. **Countdown Tracking**: Optional visual indicators for when dismissal will occur

### Integration with CelebrationToast

[CelebrationToast](components/CelebrationToast.tsx) has been fully integrated with `useModalTimer`:

**Changes:**
- Duration increased from 3s → 5s (matching WCAG standard for non-critical modals)
- Celebrates are announced to screen readers after animation completes
- Auto-dismiss respects user's accessibility preferences
- Pauses on app background/pause
- Announcement 3s before dismissal

**Example Usage:**

```tsx
export default function CelebrationToast({ celebration, onDismiss, duration = 5000 }) {
  const { startTimer, cancelTimer } = useModalTimer({
    duration,
    onDismiss,
    announceBeforeDismiss: true,
  });
  
  useEffect(() => {
    if (celebration) {
      if (reduceMotion) {
        announceForAccessibility(`${celebration.title}. ${celebration.message}`);
      } else {
        // Animate in, then start timer
        Animated.parallel([...]).start(() => {
          announceForAccessibility(`${celebration.title}. ${celebration.message}`);
          startTimer();
        });
      }
      return () => cancelTimer();
    }
  }, [celebration]);
}
```

## Implementation Pattern for Other Modals

All auto-dismissing modals should follow this pattern:

### Step 1: Import the hook
```tsx
import { useModalTimer } from '../hooks/useModalTimer';
```

### Step 2: Initialize the hook
```tsx
const { startTimer, cancelTimer } = useModalTimer({
  duration: 5000,  // Adjust as needed
  onDismiss,
  announceBeforeDismiss: true,
  announceAtSeconds: 3,  // Or adjust based on context
});
```

### Step 3: Start timer when modal becomes visible
```tsx
useEffect(() => {
  if (visible) {
    // Perform any animations/setup
    startTimer();
  }
  return () => cancelTimer();
}, [visible, startTimer, cancelTimer]);
```

### Step 4: For manual dismiss buttons, cancel timer
```tsx
const handleDismiss = () => {
  cancelTimer();
  onDismiss();
};
```

## Modals Identified for Enhancement

The following components use Modal and have auto-dismiss behavior:

1. **CelebrationToast** ✅ DONE
   - Status: Fully integrated with useModalTimer
   - Duration: 5000ms
   - Announce: 3 seconds before

2. **FeedbackModal** - Priority: HIGH
   - Current: setTimeout dismiss after 71
   - Recommendation: 5000ms with announcements

3. **NPSSurvey** - Priority: HIGH
   - Current: setTimeout dismiss after 165
   - Recommendation: 8000ms (survey needs longer time)

4. **DeafHoHAccessibility** - Priority: MEDIUM
   - Current: setTimeout for visual alert (170)
   - Status: Already has accessibility consideration
   - Recommendation: Add explicit timing controls

5. **FocusLock** - Priority: LOW
   - Current: Pulse animation (no auto-dismiss by default)
   - Recommendation: Manual control, no auto-dismiss

6. **UpdateSplashScreen** - Priority: MEDIUM
   - Current: setTimeout (96ms hidden timer)
   - Recommendation: Convert to useModalTimer (8-10s for app update)

7. **VoiceController** - Priority: MEDIUM
   - Current: Toast-style auto-dismiss (2000ms)
   - Recommendation: useModalTimer with 3000ms

8. **SuggestionFeedbackButton** - Priority: MEDIUM
   - Current: Toast confirmation (2000ms)
   - Recommendation: useModalTimer with 2500ms

## Accessibility Guidelines

### Duration Recommendations

- **Critical alerts** (errors, warnings): 8-10 seconds minimum
- **Standard toasts** (success, info): 5 seconds default
- **Confirmations**: 5-7 seconds
- **Non-critical info**: 3-5 seconds

### Accessibility Announcements

Always announce BEFORE auto-dismiss when duration < 7 seconds:
- At: `duration - 3000` milliseconds
- Message: "This message will dismiss in 3 seconds"

### Screen Reader Considerations

1. **Live Region**: Modal content should be in live region (`accessibilityLiveRegion="polite"`)
2. **Announcement Timing**: After animations complete, before timer starts
3. **Countdown**: Optional for power users, but include in accessible text
4. **Manual Dismiss**: Always provide accessible way to dismiss (button or dismiss key)

## Testing Modal Accessibility

### Manual Testing Checklist

- [ ] Enable TalkBack (Android) or VoiceOver (iOS)
- [ ] Launch modal/toast
- [ ] Verify content is announced
- [ ] Verify "will dismiss in X seconds" message plays 3s before dismissal
- [ ] Let auto-dismiss occur naturally
- [ ] Verify screen reader announces dismissal
- [ ] Test with reduce motion enabled
- [ ] Test dismissing before auto-timeout (button press)
- [ ] Test backgrounding app during countdown (pause)
- [ ] Test foregrounding app (resume)

### Automated Testing

```tsx
describe('useModalTimer', () => {
  it('should announce before dismissal', async () => {
    const onDismiss = jest.fn();
    const { result } = renderHook(() => useModalTimer({
      duration: 5000,
      onDismiss,
      announceBeforeDismiss: true,
      announceAtSeconds: 3,
    }));
    
    act(() => {
      result.current.startTimer();
    });
    
    await waitFor(() => {
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalled();
    }, { timeout: 3100 });
  });
});
```

## Migration Path

### Phase 1: Core Modals (NOW)
- ✅ CelebrationToast
- Pending: FeedbackModal, NPSSurvey, UpdateSplashScreen

### Phase 2: Secondary Modals (Week 2)
- VoiceController
- SuggestionFeedbackButton
- ContentWarning (if exists)

### Phase 3: Verification & Polish (Week 3)
- WCAG audit to verify 2.3.1 compliance
- Performance testing with large timeout counts
- Document all modal timings in a centralized config

## WCAG Compliance

**Guideline 2.3.1 Three Flashes or Below Threshold**
- Auto-dismissing modals now have pause-on-blur
- Users cannot be trapped by auto-dismissal
- Accessibility announcements give 3+ seconds notice

**Guideline 2.2.1 Timing Adjustable**
- Modals pause when app backgrounded
- Users can manually dismiss before auto-timeout
- Future: Add settings for global modal timeout multiplier

**Guideline 1.3.2 Meaningful Sequence**
- Announcements happen in logical order
- Visual and accessible timings are synchronized

## Configuration & Customization

### Global Modal Timeout Multiplier (Future Feature)

```tsx
// In accessibility settings
const cognitivePrefs = useCognitivePrefs();
const actualDuration = baseDuration * cognitivePrefs.modalTimeoutMultiplier;
// Default multiplier: 1.0x, options: 1.5x, 2.0x, 3.0x
```

### Per-Modal Duration Overrides

Some modals may need custom durations based on content complexity:

```tsx
// Simple success toast
<CelebrationToast duration={3000} />

// Complex multi-step dialog
<UpdateModal duration={10000} />
```

## Future Enhancements

1. **Haptic feedback** before auto-dismiss
2. **Visual countdown** optional display
3. **User settings** for global timeout multiplier
4. **Modal stacking** - queue vs. replace modals
5. **Gesture-based dismiss** with visual feedback
6. **Localized announcements** for timeout messages

## References

- [WCAG 2.2 - Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)
- [ARIA - Live Regions](https://www.w3.org/WAI/ARIA/apg/patterns/regions/examples/feed/)
- [iOS Accessibility - Announcements](https://developer.apple.com/documentation/uikit/uiaccessibility/1615194-post)
- [Android Accessibility - TalkBack](https://support.google.com/accessibility/android/answer/6283677)

## Rollout Timeline

- **Day 1-2**: Implement core hook and CelebrationToast ✅
- **Day 3-4**: Integrate FeedbackModal and NPSSurvey
- **Day 5**: Comprehensive testing and WCAG audit
- **Day 6-7**: Polish, documentation, and user communication

---

**Last Updated**: January 2026
**Status**: In Progress (Core complete, integration ongoing)
**Owner**: Accessibility Team
