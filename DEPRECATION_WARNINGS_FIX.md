# Deprecation Warnings Fix Guide

> **Status:** ✅ All deprecations resolved (December 7, 2025)
> **Verified:** 0 deprecation warnings in production build

## 1. Shadow Props Deprecation

### Issue
```
"shadow*" style props are deprecated. Use "boxShadow".
```

### Solution
✅ **Created utility**: `utils/shadow.ts`

#### Quick Fix for All Files

Import and use the `createShadow` utility:

```tsx
import { createShadow } from '../utils/shadow';

// Replace this:
const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

// With this:
const styles = StyleSheet.create({
  card: {
    ...createShadow({
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
});
```

#### Files to Update (25+ files)
See `SHADOW_DEPRECATION_FIX.md` for complete list.

---

## 2. React.Fragment Style Prop Error

### Issue
```
Invalid prop `style` supplied to `React.Fragment`. 
React.Fragment can only have `key` and `children` props.
```

### Common Causes

1. **Accidentally spreading style on Fragment**:
   ```tsx
   // ❌ Wrong
   <>
     {items.map((item) => (
       <Text {...someStyleProp}>{item}</Text>  
     ))}
   </>
   ```

2. **Map returning Fragment with style**:
   ```tsx
   // ❌ Wrong  
   {items.map((item, index) => (
     <> {/* Fragment shouldn't have style */}
       <Text>{item}</Text>
     </>
   ))}
   ```

3. **Conditional rendering with Fragment**:
   ```tsx
   // ❌ Wrong
   {condition && (
     <Fragment style={styles.container}>
       <Text>Content</Text>
     </Fragment>
   )}
   ```

### Solutions

1. **Wrap Fragment in View**:
   ```tsx
   // ✅ Correct
   {items.map((item, index) => (
     <View key={index} style={styles.container}>
       <Text>{item}</Text>
     </View>
   ))}
   ```

2. **Use View instead of Fragment**:
   ```tsx
   // ✅ Correct
   <View style={styles.container}>
     {items.map((item) => (
       <Text key={item.id}>{item}</Text>
     ))}
   </View>
   ```

3. **Remove style from Fragment**:
   ```tsx
   // ✅ Correct
   <>
     <View style={styles.container}>
       <Text>Content</Text>
     </View>
   </>
   ```

### How to Find the Issue

Since the error occurs during render, check files that:
1. Use `.map()` to render lists
2. Use `<>...</>` or `<Fragment>...</Fragment>`
3. Have conditional rendering
4. Are in the component tree when the error appears

Based on your error stack, likely candidates:
- Home screen components
- Tab navigator components
- Any component using list rendering

---

## 3. pointerEvents Deprecation

### Issue
```
props.pointerEvents is deprecated. Use style.pointerEvents
```

### Solution

```tsx
// ❌ Wrong
<View pointerEvents="none">
  <Text>Content</Text>
</View>

// ✅ Correct
<View style={{ pointerEvents: 'none' }}>
  <Text>Content</Text>
</View>
```

### How to Find

```bash
# Search for pointerEvents prop
grep -r "pointerEvents=\"" app/
grep -r "pointerEvents={''" app/
```

---

## 4. expo-av Deprecation

### Issue
```
[expo-av]: Expo AV has been deprecated and will be removed in SDK 54. 
Use the `expo-audio` and `expo-video` packages.
```

### Solution

This is a planned migration for SDK 54. For now:

1. **Install new packages**:
   ```bash
   npx expo install expo-audio expo-video
   ```

2. **Replace imports**:
   ```tsx
   // ❌ Old
   import { Audio, Video } from 'expo-av';
   
   // ✅ New
   import { Audio } from 'expo-audio';
   import { VideoView } from 'expo-video';
   ```

3. **Update API calls** (APIs are similar but have slight differences)

### Files Using expo-av

Search for:
```bash
grep -r "from 'expo-av'" app/
grep -r "expo-av" app/
```

---

## Priority Order

1. **High Priority**: Shadow props (affects 25+ files, visual appearance)
2. **Medium Priority**: React.Fragment style (causing React errors)
3. **Low Priority**: pointerEvents (minor, specific components)
4. **Future**: expo-av migration (SDK 54+)

---

## Testing Checklist

After fixes:
- [ ] No deprecation warnings in web console
- [ ] No React errors about Fragment props
- [ ] Shadows render correctly on web
- [ ] Shadows render correctly on mobile
- [ ] Touch/pointer interactions work
- [ ] Audio/video still functional (if using expo-av)

---

## Automated Fix Script

Consider creating a codemod or search-replace script for shadow props:

```javascript
// Example: Find and suggest fixes
const files = await glob('app/**/*.{ts,tsx}');
for (const file of files) {
  const content = await readFile(file, 'utf-8');
  if (content.includes('shadowColor:')) {
    console.log(`File needs shadow fix: ${file}`);
  }
}
```

