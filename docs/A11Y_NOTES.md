# Accessibility Implementation Notes

## Overview

This document contains technical notes and implementation details for accessibility (a11y) features in the 3mpwr App, with special focus on internationalization accessibility (i18n a11y).

## Recent Enhancements (October 2025)

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
