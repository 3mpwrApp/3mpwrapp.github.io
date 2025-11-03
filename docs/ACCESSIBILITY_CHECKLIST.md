# WCAG 2.2 Accessibility Development Checklist

This checklist ensures all new features and components meet WCAG 2.2 Level AA standards (with AAA where applicable).

## Before Starting Development

- [ ] Review accessibility requirements in `docs/A11Y_NOTES.md`
- [ ] Review WCAG 2.2 compliance report in `docs/WCAG_2.2_COMPLIANCE_REPORT.md`
- [ ] Understand target accessibility level (AA minimum, AAA preferred)
- [ ] Identify user groups that will benefit from the feature
- [ ] Plan for screen reader, keyboard, and voice control support

## Component Development

### Visual Design

- [ ] **Color Contrast**: All text meets minimum contrast ratios
  - Normal text: 4.5:1 minimum (AA), 7:1 preferred (AAA)
  - Large text (18pt+): 3:1 minimum (AA), 4.5:1 preferred (AAA)
  - UI components: 3:1 minimum
  - Use `npm run wcag:audit` to verify
  
- [ ] **Focus Indicators** (WCAG 2.4.13):
  - Minimum 3px thickness (exceeds 2px requirement)
  - 8:1 contrast ratio (exceeds 3:1 requirement)
  - Visible for keyboard users
  - Use `FOCUS_INDICATOR` constants from `constants/FocusManagement.ts`
  
- [ ] **Touch Targets** (WCAG 2.5.8):
  - Minimum 44×44 dp for all interactive elements
  - Use `touchTarget.min` from `constants/A11Y.ts`
  - Enhanced: 48×48 dp for primary actions
  
- [ ] **Visual Information**:
  - Don't rely on color alone to convey information
  - Provide text labels or patterns as alternatives
  - Use icons with text labels

### Keyboard Accessibility

- [ ] All functionality accessible via keyboard
- [ ] Logical tab order (use `tabIndex` on web)
- [ ] No keyboard traps (except modals with proper focus management)
- [ ] Skip links provided for repetitive content
- [ ] Keyboard shortcuts don't conflict with screen readers
- [ ] Focus visible when using keyboard (WCAG 2.4.7)
- [ ] Focus not obscured by other content (WCAG 2.4.11, 2.4.12)

### Screen Reader Support

- [ ] **Semantic Roles**:
  - `accessibilityRole="button"` for pressable elements
  - `accessibilityRole="header"` for headings
  - `accessibilityRole="link"` for navigation links
  - Use constants from `constants/A11Y.ts`
  
- [ ] **Labels and Hints**:
  - All interactive elements have `accessibilityLabel`
  - Complex actions have `accessibilityHint`
  - Use i18n strings for multi-language support
  - Keep labels concise and descriptive
  
- [ ] **State Information**:
  - Use `accessibilityState` for selected, disabled, checked
  - Update state announcements when values change
  - Use `accessibilityValue` for progress bars and sliders
  
- [ ] **Live Regions**:
  - Dynamic content changes announced with `accessibilityLiveRegion`
  - Use "polite" for most updates, "assertive" for critical alerts
  - Avoid announcement spam (debounce rapid changes)
  
- [ ] **Hidden Content**:
  - Decorative elements have `accessibilityElementsHidden={true}`
  - Hidden content not in accessibility tree
  - Use `importantForAccessibility="no"` when needed

### Forms and Input

- [ ] All form fields have labels (associated with input)
- [ ] Required fields clearly marked
- [ ] Error messages announced to screen readers
- [ ] Error identification with suggestions (WCAG 3.3.1, 3.3.3)
- [ ] Auto-save to prevent data loss (WCAG 3.3.7)
- [ ] Form data restoration after navigation
- [ ] No cognitive function tests for authentication (WCAG 3.3.8)
- [ ] Password managers supported (no paste blocking)

### Navigation

- [ ] **Consistent Navigation** (WCAG 3.2.6):
  - Help mechanism in consistent location
  - Global Assistant available on all screens
  - Settings accessible from same location
  
- [ ] **Breadcrumbs** (if applicable):
  - Clear navigation path
  - Clickable ancestor links
  - Current page clearly identified
  
- [ ] **Skip Links**:
  - Skip to main content
  - Skip repetitive navigation
  - Use `useSkipLink` hook

### Motion and Animation

- [ ] Respect `prefers-reduced-motion` setting
- [ ] Use `useReducedMotion()` hook to check preference
- [ ] No flashing content (3 flashes per second maximum)
- [ ] Animations can be paused or disabled
- [ ] Essential motion preserved even with reduced motion

### Interactive Features

- [ ] **No Drag-Only Operations** (WCAG 2.5.7):
  - Provide alternative tap/click methods
  - Single-pointer operations preferred
  - Path-based gestures have alternatives
  
- [ ] **Timeouts and Auto-Actions**:
  - User can extend time limits
  - Auto-save prevents data loss
  - Notifications respect Do Not Disturb
  
- [ ] **Error Prevention**:
  - Confirmations for destructive actions
  - Undo functionality where possible (6 second window)
  - Clear warnings before data loss

## Component-Specific Checklists

### Buttons

- [ ] Use `A11yPressable` component
- [ ] `accessibilityRole="button"` set
- [ ] `accessibilityLabel` describes action
- [ ] Minimum 44×44 dp touch target
- [ ] `hitSlop` applied for small buttons
- [ ] Focus indicator visible for keyboard users
- [ ] Disabled state announced to screen readers

### Links

- [ ] `accessibilityRole="link"` set
- [ ] Label describes destination
- [ ] Opens in new tab announced (if applicable)
- [ ] Distinguishable from buttons
- [ ] Underlined or otherwise visually distinct

### Modals/Dialogs

- [ ] Focus trapped within modal (`useFocusTrap`)
- [ ] Focus returned to trigger on close
- [ ] `accessibilityViewIsModal={true}` on iOS
- [ ] Close button clearly labeled
- [ ] Keyboard accessible (Escape to close)
- [ ] Background content hidden from screen readers

### Lists

- [ ] Use FlatList/SectionList for performance
- [ ] Item count announced ("3 items loaded")
- [ ] `accessibilityRole="list"` on container
- [ ] `accessibilityRole="listitem"` on items (if needed)
- [ ] Pagination announced if applicable

### Images

- [ ] Meaningful images have `accessibilityLabel`
- [ ] Decorative images have `accessibilityElementsHidden={true}`
- [ ] Complex images have detailed descriptions
- [ ] Image loading states announced

### Videos/Audio

- [ ] Captions available for videos
- [ ] Audio descriptions available (if applicable)
- [ ] Controls accessible via keyboard
- [ ] Play/pause announced to screen readers
- [ ] Volume control accessible

## Testing

### Automated Testing

- [ ] Run `npm run a11y:scan` - no issues
- [ ] Run `npm run wcag:audit` - all colors pass
- [ ] Run `npm test` - all a11y tests pass
- [ ] Add component-specific accessibility tests
- [ ] Test with multiple font scales (1.0x - 2.0x)

### Manual Testing

#### Screen Readers
- [ ] Test with VoiceOver (iOS) - all languages
- [ ] Test with TalkBack (Android) - all languages
- [ ] Test with NVDA/JAWS (Web)
- [ ] All interactive elements announced correctly
- [ ] Navigation order is logical
- [ ] State changes announced
- [ ] No duplicate or missing announcements

#### Keyboard Navigation
- [ ] All features accessible without mouse
- [ ] Tab order is logical
- [ ] Focus indicators always visible
- [ ] Focus never lost or trapped (except modals)
- [ ] Shortcuts work as expected
- [ ] No conflicts with screen reader shortcuts

#### Visual Testing
- [ ] Test with system dark mode
- [ ] Test with high contrast mode
- [ ] Test with large text (200%)
- [ ] Test with zoom (up to 400%)
- [ ] Check focus indicators in all themes
- [ ] Verify color contrast with tools

#### Interaction Testing
- [ ] Test with reduced motion enabled
- [ ] Test with touch (finger)
- [ ] Test with stylus
- [ ] Test with keyboard
- [ ] Test with voice control
- [ ] Test with switch control (iOS) or switch access (Android)

### Real User Testing
- [ ] Test with users who use screen readers
- [ ] Test with users who use keyboard only
- [ ] Test with users with motor impairments
- [ ] Test with users with cognitive disabilities
- [ ] Collect and address feedback

## Documentation

- [ ] Update component documentation with accessibility features
- [ ] Document keyboard shortcuts
- [ ] Document screen reader announcements
- [ ] Add accessibility examples to Storybook (if applicable)
- [ ] Update `A11Y_NOTES.md` if adding new patterns

## Code Review Checklist

- [ ] Accessibility requirements met
- [ ] Tests include accessibility checks
- [ ] No regressions in existing accessibility features
- [ ] Code follows accessibility patterns in the app
- [ ] Documentation updated
- [ ] All CI checks pass

## Common Pitfalls to Avoid

### ❌ Don't

- Use `Touchable*` components (use `Pressable` or `A11yPressable`)
- Disable paste in password fields
- Use color alone to convey information
- Create keyboard traps outside modals
- Use small touch targets (<44dp)
- Forget `accessibilityRole` on interactive elements
- Block zoom or text scaling
- Create drag-only interactions
- Use timeouts without extensions
- Implement CAPTCHAs or cognitive tests

### ✅ Do

- Use semantic roles consistently
- Provide text alternatives for images
- Support keyboard navigation everywhere
- Respect user preferences (motion, contrast, text size)
- Test with screen readers regularly
- Provide clear error messages with solutions
- Auto-save form data
- Use focus indicators
- Keep interfaces simple and predictable
- Follow established patterns in the app

## Resources

### Internal
- `docs/A11Y_NOTES.md` - Implementation details
- `docs/WCAG_2.2_COMPLIANCE_REPORT.md` - Compliance status
- `constants/A11Y.ts` - Accessibility constants
- `constants/FocusManagement.ts` - Focus management constants
- `hooks/useA11y.ts` - Accessibility hooks
- `hooks/useFocusManagement.ts` - Focus management hooks
- `components/A11yPressable.tsx` - Accessible button component

### External
- [WCAG 2.2 Guidelines](https://www.w3.org/TR/WCAG22/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [iOS Accessibility](https://developer.apple.com/accessibility/)
- [Android Accessibility](https://developer.android.com/guide/topics/ui/accessibility)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Questions?

If you're unsure about accessibility requirements:
1. Check existing components for patterns
2. Review documentation in `docs/`
3. Run automated tests
4. Ask team members
5. Test with screen readers

**Remember**: Accessibility is not optional. It's a fundamental requirement for all features.
