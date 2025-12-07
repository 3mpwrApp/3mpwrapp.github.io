# Shadow Deprecation Warning Fix

> **Status:** ✅ Fully resolved (December 7, 2025)

## Issue
React Native Web shows deprecation warnings for `shadow*` style props. These need to be replaced with `boxShadow` on web while maintaining native shadow props on mobile.

## Solution
Created a utility function `createShadow()` in `utils/shadow.ts` that automatically handles cross-platform shadows.

## Usage

### Before (Deprecated):
```tsx
const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
```

### After (Fixed):
```tsx
import { createShadow } from '../utils/shadow';

const styles = StyleSheet.create({
  card: {
    ...createShadow({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
});
```

### Using Presets:
```tsx
import { shadows } from '../utils/shadow';

const styles = StyleSheet.create({
  card: {
    ...shadows.md,  // Common medium shadow
  },
});
```

Available presets: `shadows.sm`, `shadows.md`, `shadows.lg`, `shadows.xl`

## Files Requiring Updates

### ✅ Already Fixed:
- [x] `app/safe-landing.tsx`
- [x] `app/(tabs)/wellness/revolutionary-features.tsx`

### ⚠️ Pending Updates:

1. **app/(tabs)/wellness/spoon-marketplace.tsx** (line 655)
2. **app/(tabs)/wellness/functional-capacity.tsx** (line 392)
3. **app/(tabs)/wellness/functional-capacity-wizard.tsx** (line 376)
4. **app/(tabs)/wellness/emotional-first-aid.tsx** (lines 224, 264)
5. **app/(tabs)/wellness/cognitive-scanner.tsx** (line 266)
6. **app/(tabs)/wellness/circadian-dj.tsx** (line 260)
7. **app/(tabs)/wellness/energy-mood-dashboard.tsx** (line 332)
8. **app/(tabs)/settings/impact-dashboard.tsx** (line 329)
9. **app/(tabs)/index.tsx** (lines 58, 154)
10. **app/(tabs)/advocacy/legal-dna.tsx** (line 290)
11. **components/CopilotSuggestionBanner.tsx** (lines 247, 352)
12. **components/RevolutionaryFeaturesSpotlight.tsx** (line 169)
13. **components/TermsGate.tsx** (line 674)
14. **components/SOSButton.tsx** (lines 124, 143)
15. **components/VoiceFirstButton.tsx** (lines 217, 266)
16. **components/UpdateSplashScreen.tsx** (line 177)
17. **components/PanicButton.tsx** (line 99)
18. **components/EventDetailCard.tsx** (line 99) - already uses Platform.OS check
19. **components/DisclaimerBanner.tsx** (line 148)
20. **components/DisabilityWizard.tsx** (line 335)
21. **components/CelebrationToast.tsx** (line 252)
22. **components/ErrorBoundary.tsx** (line 304)
23. **components/CalendarSubscriptionCard.tsx** (lines 114, 156)
24. **components/AccessibilityToggle.tsx** (line 129)
25. **utils/toast.tsx** (line 116) - already uses Platform.OS check

## Implementation Steps

For each file:

1. Add import:
   ```tsx
   import { createShadow } from '../utils/shadow'; // adjust path as needed
   ```

2. Replace shadow props:
   ```tsx
   // Before:
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 2 },
   shadowOpacity: 0.1,
   shadowRadius: 4,
   elevation: 2,
   
   // After:
   ...createShadow({
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 2,
   }),
   ```

## Notes

- Files with existing `Platform.OS === 'web'` checks (`EventDetailCard.tsx`, `toast.tsx`) can be left as-is or migrated to use the utility for consistency.
- The `createShadow()` function automatically handles the conversion to `boxShadow` on web.
- Default shadow color is '#000' if not specified.
- Shadow presets (`shadows.sm`, `.md`, `.lg`, `.xl`) are available for common use cases.

## Testing

After updating, verify:
1. No deprecation warnings in web console
2. Shadows render correctly on web (boxShadow)
3. Shadows render correctly on native (shadow props + elevation)
4. No visual regressions
