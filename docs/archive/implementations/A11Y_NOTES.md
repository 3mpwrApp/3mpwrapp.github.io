# Accessibility Implementation Notes

## Overview

This document contains technical notes and implementation details for accessibility (a11y) features in the 3mpwr App, with special focus on internationalization accessibility (i18n a11y).

## Recent Enhancements (October 2025)

### Cognitive Accessibility Mode (October 13, 2025)

#### Overview
Complete cognitive accessibility infrastructure for users with ADHD, autism, learning disabilities, and memory challenges. Implements WCAG 2.2 Cognitive and Learning Disabilities guidelines.

#### Core Features

##### Three Cognitive Modes
- **Standard Mode** (default): Full feature set, 10 items per screen, 5-minute auto-save
- **Simplified Mode**: 5 items per screen, 30-second auto-save, enhanced progress indicators, breadcrumbs
- **Minimal Mode**: 3 items per screen, 15-second auto-save, one task at a time, maximum guidance

##### Memory Support
- **Navigation Memory**: "Back to where I was" button saves last location in AsyncStorage
- **Scroll Position Restoration**: Remembers scroll position for each screen
- **Form Data Persistence**: Auto-saves and restores partially filled forms (24-hour retention)
- **Incomplete Task Tracking**: Reminds users of tasks they started but didn't finish

##### Attention & Processing Support
- **SimplifiedView Component**: Automatically limits item display based on cognitive mode
- **Progress Indicators**: Visual progress bars with percentage display
- **Step Indicators**: "Step 2 of 5" with visual completion markers
- **Breadcrumb Navigation**: "Home > Settings > Cognitive Accessibility" with clickable path
- **Task Complexity Badges**: ⚡ Quick (5min), 📋 Medium (15min), 🧩 Complex (30min+)

#### Implementation Files

##### Constants (`constants/cognitive.ts`)
```typescript
// 345 lines - Core configuration
- COGNITIVE_MODES: Configuration for standard/simplified/minimal modes
- CognitivePreferences: 22 preference flags (memory, attention, processing, language, visual, interaction)
- DEFAULT_COGNITIVE_PREFERENCES: Sensible defaults
- COMPLEXITY_INDICATORS: Task complexity scoring (simple/moderate/complex/intensive)
- SIMPLIFICATION_RULES: UI simplification patterns
- PROGRESS_STYLES: Consistent progress indicator styling
- BREADCRUMB_CONFIG: Navigation breadcrumb configuration
- TaskReminder interface: Incomplete task tracking structure
```

##### Context (`context/CognitiveAccessibilityContext.tsx`)
```typescript
// 460+ lines - State management with 30+ methods
- Preferences: mode selection, 22 feature toggles
- Navigation: saveLocation(), clearLocation(), lastLocation
- Scroll: saveScrollPosition(), getScrollPosition()
- Forms: saveFormData(), getFormData(), clearFormData()
- Tasks: addIncompleteTask(), completeTask(), getTaskReminders()
- Auto-save: triggerAutoSave(), configurable intervals
- Utilities: isSimplifiedMode(), getMaxItemsPerScreen(), getAutoSaveFrequency()
- Helper methods: reset(), updatePreferences(), getIncompleteTasks(), clearIncompleteTasks()
```

##### Components (`components/CognitiveAccessibility.tsx`)
```typescript
// 510+ lines - Reusable UI components
- ProgressBar: Visual progress with label and percentage
- StepIndicator: Step-by-step navigation (1 → 2 → 3)
- Breadcrumbs: "You are here" navigation with max visible items
- ComplexityBadge: Task difficulty indicators with color coding
- AutoSaveIndicator: "Saving..." or "Saved 2 minutes ago"
- BackToLocationButton: "You were here last: Letter Wizard"
- SimplifiedView: Wrapper that applies simplified mode styling and limits items
```

##### Hooks (`hooks/useAutoSave.ts`)
```typescript
// 280+ lines - Configurable auto-save
- useAutoSave<T>(): Main auto-save hook with debouncing and intervals
- useAutoSaveScrollPosition(): Scroll position tracking
- useAutoSaveLocation(): Breadcrumb navigation tracking
- useRestoreFormData<T>(): Form data restoration on mount
```

##### Settings Screen (`app/(tabs)/settings/cognitive-accessibility.tsx`)
```typescript
// 550+ lines - Complete settings UI
- Mode Selection: Radio buttons with descriptions and feature previews
- Feature Toggles: 5 main toggles (navigation memory, scroll position, breadcrumbs, complexity indicators, step-by-step)
- Actions: View incomplete tasks, clear all data
- Help Text: Explains cognitive accessibility benefits
- Auto-save Indicator: Shows last save time in header
```

#### Accessibility Compliance

##### WCAG 2.2 Guidelines Implemented
- **Guideline 3.2.3 Consistent Navigation**: Breadcrumbs maintain consistent navigation
- **Guideline 3.2.4 Consistent Identification**: Icons and labels used consistently
- **Guideline 3.3.1 Error Identification**: Clear error messages with suggestions
- **Guideline 3.3.2 Labels or Instructions**: All form fields have clear labels
- **Guideline 3.3.3 Error Suggestion**: Auto-save prevents data loss
- **Guideline 3.3.4 Error Prevention**: Confirm before leaving unsaved forms
- **Guideline 3.3.6 Accessible Authentication**: Simplified login options in minimal mode

##### Screen Reader Support
- All components have proper `accessibilityRole` and `accessibilityLabel`
- Live regions for auto-save announcements (`accessibilityLiveRegion="polite"`)
- Progress indicators use `accessibilityRole="progressbar"` with `accessibilityValue`
- Breadcrumbs use `accessibilityRole="menu"` with clear navigation structure

##### Visual Accessibility
- High contrast colors: All components use theme palette with WCAG AAA compliance
- Minimum 44dp touch targets on all interactive elements
- Clear visual hierarchy with icons, colors, and spacing
- Support for `reduceMotion` preference

##### Cognitive Load Reduction
- Maximum 10/5/3 items per screen based on mode
- Hide secondary actions in simplified/minimal modes
- Show progress indicators to reduce anxiety
- Provide time estimates to set expectations
- Auto-save to prevent data loss stress

#### Testing Recommendations

##### Manual Testing
1. **Mode Switching**: Verify all 3 modes apply correct limits and auto-save intervals
2. **Navigation Memory**: Navigate away and back, verify "Back to where I was" appears
3. **Scroll Restoration**: Scroll down, navigate away, return, verify scroll position restored
4. **Form Persistence**: Fill form halfway, navigate away, return, verify data restored
5. **Auto-Save**: Fill form in simplified mode, wait 30 seconds, verify auto-save indicator
6. **Task Reminders**: Start task, leave incomplete, verify task appears in incomplete list
7. **Screen Reader**: Test with VoiceOver/TalkBack, verify all announcements clear
8. **High Contrast**: Enable system high contrast, verify all components remain readable

##### Automated Testing
```bash
# Run cognitive accessibility tests
npm test -- --testPathPattern=cognitive

# Expected coverage:
# - CognitiveAccessibilityContext loading and state management
# - useAutoSave hook debouncing and intervals
# - SimplifiedView component item limiting
# - ProgressBar, StepIndicator, Breadcrumbs rendering
# - Settings screen mode selection and toggles
```

#### Integration Examples

##### Letter Wizard Integration
```tsx
import { SimplifiedView } from '@/components/CognitiveAccessibility';
import { useCognitiveAccessibility } from '@/context/CognitiveAccessibilityContext';

// Wrap letter type list
<SimplifiedView maxItems={letterTypes.length} showAll={showAll} onToggleShowAll={() => setShowAll(!showAll)}>
  {letterTypes.map(type => <LetterTypeCard key={type.id} {...type} />)}
</SimplifiedView>

// Add complexity badge to complex letters
<ComplexityBadge complexity={{ level: 'complex', steps: 8, estimatedMinutes: 25 }} showDetails />

// Track incomplete letters
const cognitive = useCognitiveAccessibility();
useEffect(() => {
  if (formData && !isComplete) {
    cognitive.addIncompleteTask('letter-wizard', `${letterType} letter`);
  }
}, [formData]);
```

##### Auto-Save Integration
```tsx
import { useAutoSave } from '@/hooks/useAutoSave';

const { save, lastSaved, isSaving, error } = useAutoSave({
  key: 'accommodation-letter',
  data: formData,
  onSaveComplete: () => console.log('Letter auto-saved!'),
  enabled: true, // Always enabled, respects cognitive mode interval
});

// Show auto-save indicator
<AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
```

#### Future Enhancements

##### Planned Features (Phase 1.2-1.6)
- **Dyslexia Support**: OpenDyslexic font, enhanced spacing, colored overlays
- **Motor Assistance**: Dwell-click, sticky keys, voice commands
- **Community Safety**: Content warnings, safe word protocol, sentiment analysis
- **Cultural Protection**: Sacred data encryption, ceremony time-locks
- **Performance Monitoring**: Bottleneck detection, render time tracking

See `docs/IMPLEMENTATION_ROADMAP.md` for complete roadmap.

### Internationalization Accessibility (i18n a11y)

#### Core Features Implemented
- **Multi-language screen reader support**: Proper announcements in English, French, and Spanish
- **Localized accessibility labels**: All interactive elements have culturally appropriate labels
- **Language-specific accessibility patterns**: Adapted for different cultural expectations
- **Enhanced accessibility utilities**: Comprehensive i18nA11y utility functions

#### Technical Implementation

##### i18nA11y Utilities (`utils/i18nA11y.ts`)
```typescript
// Key functions implemented:
- getLocalizedAccessibilityLabel(): Context-aware label generation
- announceWithI18n(): Screen reader announcements with proper localization
- validateAccessibilityTranslation(): Translation completeness validation
- getAccessibilityHint(): Culturally appropriate hints
- formatAccessibilityValue(): Locale-specific value formatting
```

##### Enhanced Components
- **A11yPressable**: Enhanced pressable component with i18n support
- **A11yTextInput**: Accessible text input with multi-language validation
- **Screen reader optimizations**: Language switching and proper announcements

#### Language-Specific Considerations

##### English
- Standard accessibility patterns
- Clear, concise labels
- Action-oriented language

##### French
- Proper gender agreement in labels
- Formal vs informal language handling
- French accessibility conventions

##### Spanish
- Regional variations support
- Appropriate formality levels
- Cultural accessibility patterns

### Testing Coverage

#### Automated Tests
- **a11y.pressable.enhanced.test.tsx**: Comprehensive pressable accessibility testing
- **a11y.text-input.comprehensive.test.tsx**: Text input accessibility validation
- **i18n accessibility pattern testing**: Cross-language compatibility

#### Manual Testing
- VoiceOver (iOS) testing in all supported languages
- TalkBack (Android) validation
- NVDA/JAWS (Web) compatibility testing

### WCAG Compliance

#### Standards Met
- **WCAG 2.1 AA**: Full compliance across all languages
- **Color contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Touch targets**: Minimum 44dp with proper spacing
- **Focus management**: Logical tab order and visible indicators

#### Accessibility Audit Integration
- Enhanced `wcag_compliance_audit.ts` script
- Automated i18n accessibility pattern validation
- Color contrast verification
- Missing translation detection

## Loading states

Use `components/ScreenSkeleton.tsx` as the Suspense fallback for heavy screens. It:
- Announces a loading state using i18n strings
- Sets `accessibilityRole="progressbar"` and marks the container busy
- Hides descendants from screen readers until content is ready
- Supports per‑screen contextual labels via `labelKey` (e.g., `loading.community`, `loading.deadlines`, `loading.evidence`).

### Post‑load announcements

List/screens with dynamic counts (e.g., Deadlines list) announce "N items loaded" once on initial load or manual reload (pluralized keys under `templates.<feature>.itemsLoaded`). Avoid announcing after every mutation to reduce noise.

Reusable hook: `hooks/usePostLoadAnnounce.ts` to standardize this behavior across lists (Evidence Locker wired up).

### Undo patterns

Destructive actions (deadlines delete) provide an ephemeral undo region using a live polite container; on restore we announce "Restored". Timeout currently 6s.

### Focus restoration

After inline edits (deadline edit save), focus returns to the screen heading to give a predictable anchor and avoid focus loss.

## Offline indicator

An `OfflineBanner` appears at the root (role=`alert`) when network store signals offline, announcing "Offline: showing cached content". This is injected above the header in `_layout.tsx`.

## Readability scan

`npm run read:level` performs a heuristic English string readability scan (avg word length & sentence length) and reports candidates for simplification without failing CI (unless `--strict`). Helps keep copy plain language.

## RN Web pointerEvents deprecation

Avoid setting `pointerEvents` as a prop on React Native Web elements. Instead use style:

```tsx
<View style={[styles.wrap, { pointerEvents: 'box-none' as any }]}>
  {/* content */}
</View>
```

Patterns updated in the app:
- Global Assistant pill (`components/GlobalAssistant.tsx`)
- Voice Controller (`components/VoiceController.tsx`)
- Toast viewport (`utils/toast.tsx`)
 - Offline banner (root layout)
 - Deadlines undo delete live region
