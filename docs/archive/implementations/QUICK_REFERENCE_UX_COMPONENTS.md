# Quick Reference: Using New UX Components

## 🎯 Quick Start - Apply to Any Screen

### 1. Make Screen Responsive (3 lines)
```tsx
import ResponsiveScreenWrapper from '../../components/ResponsiveScreenWrapper';

export default function MyScreen() {
  return (
    <ResponsiveScreenWrapper>
      {/* Your content - automatically responsive! */}
    </ResponsiveScreenWrapper>
  );
}
```

### 2. Use Better Typography (2 lines)
```tsx
import { createTextStyles } from '../../theme/typography.enhanced';

const textStyles = createTextStyles(palette);

// Then use:
<Text style={textStyles.h1}>Title</Text>
<Text style={textStyles.body}>Body</Text>
<Text style={textStyles.button}>Button</Text>
```

### 3. Optimize Performance (3 patterns)
```tsx
// Pattern 1: Memoize list items
const Item = React.memo(({ data }) => <Text>{data.name}</Text>);

// Pattern 2: Memoize callbacks
const handlePress = React.useCallback(() => {}, []);

// Pattern 3: Memoize expensive calculations
const sorted = React.useMemo(() => data.sort(), [data]);
```

---

## 📱 ResponsiveScreenWrapper Props

```tsx
<ResponsiveScreenWrapper
  scrollable={true}              // Enable ScrollView (default: true)
  keyboardBehavior="padding"      // iOS keyboard: padding|height|position
  padded={true}                  // 16px padding (default: true)
  noSafeArea={false}             // Disable SafeAreaView (default: false)
  contentContainerStyle={{}}     // Custom styles
  testID="my-screen"             // For tests
>
  {children}
</ResponsiveScreenWrapper>
```

---

## 🎨 Typography Styles

```tsx
const textStyles = createTextStyles(palette);

// Headings
textStyles.h1  // 36px, bold
textStyles.h2  // 30px, bold
textStyles.h3  // 24px, semibold
textStyles.h4  // 20px, semibold
textStyles.h5  // 18px, medium
textStyles.h6  // 16px, medium

// Body
textStyles.body       // 16px, normal (default)
textStyles.bodyLarge  // 18px, normal
textStyles.bodySmall  // 14px, normal
textStyles.caption    // 12px, normal

// Interactive
textStyles.button      // 16px, semibold, centered
textStyles.buttonLarge // 18px, semibold, centered
textStyles.link        // 16px, medium, underlined

// Special
textStyles.label       // 14px, medium
textStyles.error       // 14px, medium, error color
textStyles.success     // 14px, medium, primary color
textStyles.muted       // 14px, normal, muted color
textStyles.highContrast // 16px, semibold, extra line height
```

---

## ⚡ Performance Patterns

### When to use React.memo
```tsx
// ✅ List items that render frequently
const ListItem = React.memo(({ item }) => (...));

// ✅ Components with expensive render logic
const ExpensiveChart = React.memo(({ data }) => (...));

// ✅ Components that receive same props often
const StaticHeader = React.memo(() => (...));

// ❌ Don't memo simple components
// ❌ Don't memo if props change frequently
```

### When to use useCallback
```tsx
// ✅ Functions passed to memoized child components
const handlePress = React.useCallback(() => {}, []);

// ✅ Functions used in useEffect dependencies
const fetchData = React.useCallback(async () => {}, [id]);

// ✅ Event handlers in lists
const handleItemPress = React.useCallback((id) => {}, []);

// ❌ Don't use for simple inline functions
```

### When to use useMemo
```tsx
// ✅ Expensive calculations
const sorted = React.useMemo(() => data.sort(), [data]);

// ✅ Filtering large arrays
const filtered = React.useMemo(() => items.filter(...), [items]);

// ✅ Creating complex objects
const config = React.useMemo(() => ({ ...settings }), [settings]);

// ❌ Don't use for simple operations
```

---

## 📋 Navigation Menu Organization

**Menu sections** (as of Oct 23, 2025):
1. **Essentials** - Resources hub
2. **Tools** - Claims, Evidence, Letters
3. **Advocacy** - Hub, Lawyers, Allies, Map, Ratings
4. **Wellness** - Hub, Exercise, Nutrition, AI, Pacing
5. **Community** - Hub, Campaigns, Events, Mutual Aid, Media
6. **Research & Info** - Research, Wait Times, History, Podcasts, News
7. **Profile** - Profile, Saved, Settings
8. **Admin** - Admin tools

**Bottom tabs** (visible, NOT in menu):
- What's New
- Wellness
- Resources
- Research
- Podcasts
- Events
- Community
- Campaigns
- Advocacy

---

## 🧪 Quick Testing Commands

```bash
# Start fresh
npx expo start -c

# Run tests
npm test

# Check accessibility
npm run a11y:scan

# Check performance
npm run perf:budget

# Run linting
npm run lint
```

---

## 🐛 Common Issues & Fixes

### Issue: Content overflows screen
```tsx
// ✅ Wrap in ResponsiveScreenWrapper
<ResponsiveScreenWrapper scrollable={true}>
  {content}
</ResponsiveScreenWrapper>
```

### Issue: Keyboard covers input
```tsx
// ✅ ResponsiveScreenWrapper handles this automatically
// Or adjust behavior:
<ResponsiveScreenWrapper keyboardBehavior="height">
```

### Issue: Text too small/large
```tsx
// ✅ Users adjust in Settings > Accessibility
// Or use responsive scale:
const { factor } = useTextScale();
fontSize: Math.round(16 * factor)
```

### Issue: Screen loads slowly
```tsx
// ✅ Add memoization
const MyScreen = React.memo(() => {
  const items = React.useMemo(() => data.filter(...), [data]);
  const handlePress = React.useCallback(() => {}, []);
  return (...);
});
```

---

## 🎯 Migration Checklist

For each screen:
- [ ] Import ResponsiveScreenWrapper
- [ ] Wrap content in ResponsiveScreenWrapper
- [ ] Import createTextStyles
- [ ] Replace inline text styles with textStyles
- [ ] Add React.memo to component (if appropriate)
- [ ] Add useCallback to event handlers
- [ ] Add useMemo to expensive calculations
- [ ] Test on small device (iPhone SE)
- [ ] Test with large font size
- [ ] Test keyboard interactions

---

## 📞 Need Help?

- **Full guide**: `docs/UX_PERFORMANCE_OPTIMIZATION_COMPLETE.md`
- **Migration guide**: `docs/APP_WIDE_UX_IMPROVEMENTS_SUMMARY.md`
- **Example screen**: `app/(tabs)/index.tsx`
- **Components**: `components/ResponsiveScreenWrapper.tsx`
- **Typography**: `theme/typography.enhanced.ts`

---

**Last Updated**: October 23, 2025  
**Status**: ✅ Ready to use
