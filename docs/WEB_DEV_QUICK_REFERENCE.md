# Web Development Quick Reference

Quick guide for ensuring web compatibility when developing new features.

## ✅ Checklist for New Features

### 1. Native Modules
If using native modules (camera, haptics, file system, etc.):

```typescript
// ❌ WRONG - Will crash on web
import * as Haptics from 'expo-haptics';
Haptics.impactAsync(...);

// ✅ CORRECT - Lazy load with Platform check
let Haptics: any = null;
if (Platform.OS !== 'web') {
  try {
    Haptics = require('expo-haptics');
  } catch {}
}

// Usage
if (Haptics && Platform.OS !== 'web') {
  Haptics.impactAsync(...);
}
```

### 2. Web-Only APIs
If using browser APIs (window, document, navigator):

```typescript
// ✅ Always wrap in Platform check
if (Platform.OS === 'web') {
  window.location.reload();
}

// ✅ Or check existence
if (typeof window !== 'undefined') {
  window.addEventListener(...);
}
```

### 3. Dynamic Imports
For large native modules:

```typescript
// ✅ Use dynamic import
const handleCamera = async () => {
  try {
    const Camera = await import('expo-camera');
    // Use Camera
  } catch {
    Alert.alert('Camera not available');
  }
};
```

## 🧪 Testing Commands

```bash
# Validate web compatibility
npm run web:validate

# Start web dev server
npm run web

# TypeScript check
npx tsc --noEmit

# Lint check
npm run lint
```

## 🚫 Common Pitfalls

### 1. Direct Native Module Imports
```typescript
// ❌ Don't
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

// ✅ Do
const Haptics = Platform.OS !== 'web' ? require('expo-haptics') : null;
const ImagePicker = await import('expo-image-picker'); // Or dynamic import
```

### 2. Unguarded Platform APIs
```typescript
// ❌ Don't
window.location.reload();

// ✅ Do
if (Platform.OS === 'web') {
  window.location.reload();
}
```

### 3. Missing Platform Import
```typescript
// ❌ Don't forget Platform import
if (Platform.OS !== 'web') { ... }

// ✅ Add import
import { Platform } from 'react-native';
```

## 📋 Pre-Commit Checklist

Before committing:
- [ ] Run `npm run web:validate`
- [ ] Test feature on web (npm run web)
- [ ] Check TypeScript (npx tsc --noEmit)
- [ ] Run linter (npm run lint)
- [ ] Test on mobile (if applicable)

## 🛠️ Troubleshooting

### "Module not found" on web
→ Check if using direct import of native module  
→ Switch to dynamic import or lazy load with Platform check

### "window is not defined"
→ Add Platform.OS === 'web' check before using window/document

### "Haptics/Camera/etc. failed"
→ Expected on web, ensure proper error handling

## 📚 More Info

- Full audit: `WEB_COMPATIBILITY_AUDIT.md`
- Summary: `WEB_COMPATIBILITY_SUMMARY.md`
- Validation script: `scripts/validate-web-compat.mjs`
