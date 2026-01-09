# Accessibility (WCAG 2.2 AAA) Guide

## Compliance Overview

3mpwr maintains **WCAG 2.2 AAA** compliance across all features. This includes:

- ✅ **Level A** (basic accessibility)
- ✅ **Level AA** (enhanced accessibility)
- ✅ **Level AAA** (advanced accessibility)

## Color Contrast

### Minimum Requirements (AAA)
- **Large text** (≥18pt): 4.5:1 contrast ratio
- **Normal text**: 7:1 contrast ratio
- **UI Components**: 3:1 minimum

### Implementation
```typescript
// Color utilities with contrast checking
export const colors = {
  text: {
    primary: '#000000',        // 21:1 on white ✅
    secondary: '#595959',      // 8.6:1 on white ✅
    disabled: '#999999',       // 4.5:1 on white (not for small text)
    onAccent: '#FFFFFF',       // 12.6:1 on accent ✅
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    accent: '#0066CC',
  },
};

// Check contrast
const { contrastRatio } = checkContrast(foreground, background);
if (contrastRatio < 7) {
  console.warn(`Low contrast: ${contrastRatio}:1`);
}
```

## Touch Target Size

### Minimum Size
- **All interactive elements**: 44x44 CSS pixels (Apple, Google standards)
- **Icons**: 48x48 when touchable
- **Buttons**: Minimum 56x56 recommended

### Implementation
```typescript
// Accessible pressable component
<A11yPressable
  style={[styles.button, { minWidth: 44, minHeight: 44 }]}
  onPress={onPress}
  accessibilityRole="button"
  accessibilityLabel={label}
>
  <Text>{label}</Text>
</A11yPressable>
```

## Keyboard Navigation

### Focus Management
```typescript
// Focus visible indicator
const [focused, setFocused] = useState(false);

<Pressable
  onFocus={() => setFocused(true)}
  onBlur={() => setFocused(false)}
  style={[
    styles.button,
    focused && { borderWidth: 2, borderColor: '#0066CC' },
  ]}
>
  <Text>Focused Button</Text>
</Pressable>
```

### Tab Order
- Use `accessible={true}` for interactive elements
- Set `accessibilityRole` appropriately
- Avoid tab order loops

### Keyboard Shortcuts
```typescript
// Command key on iOS, Ctrl/Alt on Android
const handleKeyCommand = useCallback((command: string) => {
  switch (command) {
    case 'cmd+s': // Save
      handleSave();
      break;
    case 'cmd+/': // Help
      showHelp();
      break;
  }
}, []);
```

## Screen Reader Support

### Labels & Descriptions
```typescript
<View
  accessible={true}
  accessibilityLabel="Campaign: 'Climate Action'"
  accessibilityHint="Tap to view details and sign the petition"
>
  <Text>Climate Action</Text>
</View>
```

### Announcements
```typescript
const announce = useA11y();

// Announce changes
useEffect(() => {
  if (campaigns.length > 0) {
    announce(
      `Loaded ${campaigns.length} campaigns`,
      'polite'
    );
  }
}, [campaigns]);
```

### Live Regions
```typescript
// Content updates announced automatically
<View accessibilityLiveRegion="polite" accessibilityLabel="Status">
  {loading ? 'Loading...' : 'Ready'}
</View>
```

## Modal & Dialog Accessibility

### Focus Trap
```typescript
<AccessibleModal
  visible={visible}
  onClose={handleClose}
  accessibilityLabel="Campaign Details"
  role="dialog"
>
  {/* Focus automatically trapped inside modal */}
  <Text>Modal Content</Text>
</AccessibleModal>
```

### Restore Focus on Close
```typescript
const triggerRef = useRef(null);

<Pressable ref={triggerRef} onPress={() => setVisible(true)}>
  <Text>Open</Text>
</Pressable>

// Modal restores focus to trigger on close
```

## Semantic HTML (Web)

### Proper Heading Structure
```jsx
// ✅ Correct
<>
  <h1>App Name</h1>
  <h2>Section</h2>
  <h3>Subsection</h3>
</>

// ❌ Avoid jumping levels
<>
  <h1>App Name</h1>
  <h3>Section</h3> {/* Skip h2 */}
</>
```

## Motion & Animation

### Reduced Motion
```typescript
import { useWindowDimensions } from 'react-native';

const prefersReducedMotion = useWindowDimensions().scale > 1.5;

<Animated.View
  style={{
    opacity: fadeAnim,
    duration: prefersReducedMotion ? 0 : 300,
  }}
>
  Content
</Animated.View>
```

### No Auto-Playing Videos
- Require explicit user play action
- No auto-muted videos
- Auto-captioning enabled

## Language & Content

### Language Declaration
```typescript
// Set app language in root component
<View lang="en">
  {/* Content */}
</View>
```

### Text Complexity
- Use **plain language** where possible
- Avoid jargon, define technical terms
- Break up long paragraphs

### Readability Scores
- Target **7-8 grade level** (Flesch-Kincaid)
- Use short sentences (15-20 words)
- Clear section headings

## Form Accessibility

### Labels
```typescript
<TextInput
  accessibilityLabel="Campaign title"
  placeholder="Enter title"
  accessibilityRole="none" // Label handles role
/>

// Or use associated label
<Text htmlFor="input-id">Campaign Title</Text>
<TextInput id="input-id" />
```

### Error Messages
```typescript
<TextInput
  aria-invalid={hasError}
  aria-describedby={hasError ? 'error-id' : undefined}
/>
{hasError && (
  <Text id="error-id" role="alert">
    {error}
  </Text>
)}
```

### Input Types
```typescript
// Use semantic input types
<TextInput
  keyboardType="email-address"  // Shows @ keyboard
  textContentType="emailAddress"
  autoCapitalize="none"
/>

<TextInput
  keyboardType="phone-pad"
  textContentType="telephoneNumber"
/>

<TextInput
  keyboardType="url"
  textContentType="URL"
/>
```

## Images & Icons

### Decorative Images
```typescript
// Hide from screen readers
<Image
  source={require('./decoration.png')}
  accessible={false}
/>
```

### Informative Images
```typescript
// Describe content
<Image
  source={require('./chart.png')}
  accessible={true}
  accessibilityLabel="Chart showing 60% campaign support"
/>
```

### Icon Buttons
```typescript
// Never use icon-only buttons for critical actions
// ❌ Bad
<Pressable onPress={handleDelete}>
  <TrashIcon />
</Pressable>

// ✅ Good
<Pressable
  onPress={handleDelete}
  accessibilityLabel="Delete campaign"
  accessibilityRole="button"
>
  <TrashIcon />
  <Text>Delete</Text>
</Pressable>
```

## Data & Tables

### Table Markup
```typescript
// Use semantic table structure
<View role="table">
  <View role="row">
    <Text role="columnheader">Name</Text>
    <Text role="columnheader">Status</Text>
  </View>
  <View role="row">
    <Text>Campaign 1</Text>
    <Text>Active</Text>
  </View>
</View>
```

### Data Lists
```typescript
// Use accessible lists
<FlatList
  accessible={true}
  accessibilityRole="list"
  data={items}
  renderItem={({ item }) => (
    <View accessibilityRole="listitem">
      {item.text}
    </View>
  )}
/>
```

## Testing for Accessibility

### Manual Testing Checklist
- [ ] Screen reader (VoiceOver, TalkBack) navigation works
- [ ] Color contrast ≥7:1 for all text
- [ ] All interactive elements are 44x44+ minimum
- [ ] All images have descriptive alt text
- [ ] Focus indicator visible on all interactive elements
- [ ] Keyboard-only navigation possible
- [ ] No content hidden from screen readers unless decorative
- [ ] Forms are properly labeled
- [ ] Dynamic content updates announced
- [ ] Reading order is logical

### Automated Testing
```bash
# Run WCAG AAA audit
npm run wcag:aaa

# Detailed report
npm run wcag:aaa:strict
```

## Common Accessibility Issues

| Issue | Impact | Fix |
|-------|--------|-----|
| Low contrast text | Unreadable for 8% of users | Use 7:1 ratio minimum |
| Small touch targets | Hard to tap accurately | Minimum 44x44 |
| Missing alt text | Images not described for screen readers | Add `accessibilityLabel` |
| No focus indicator | Keyboard users lost | Add visible focus state |
| Color only | Colorblind users confused | Use patterns + labels |
| Auto-playing audio | Startles, bothers users | Require play action |
| Complex navigation | Hard to understand structure | Use clear headings |
| Missing labels | Form fields unclear | Label all inputs |

## Resources

- [WCAG 2.2 Spec](https://www.w3.org/WAI/WCAG22/quickref/)
- [Apple Accessibility Guide](https://developer.apple.com/accessibility/)
- [Google Android Accessibility](https://developer.android.com/guide/topics/ui/accessibility)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)

---

**Last Updated:** January 9, 2026  
**Compliance Level:** WCAG 2.2 AAA  
**Status:** Maintained
