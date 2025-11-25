# Fixing Deprecation Warnings - Quick Start

This directory contains tools and documentation to fix deprecation warnings in the 3mpwr app.

## 🚀 Quick Start

### 1. Fix pointerEvents Warnings ✅ DONE

Already fixed in 7 files. Changed from:
```tsx
<View pointerEvents="none">
```
To:
```tsx
<View style={{ pointerEvents: 'none' }}>
```

### 2. Fix Shadow Warnings (In Progress)

**Run the helper script:**
```bash
node scripts/find-shadow-props.js
```

This will show you which files need to be updated and how.

**Manual fix for each file:**

1. Add import:
   ```tsx
   import { createShadow } from '../utils/shadow';
   ```

2. Wrap shadow props:
   ```tsx
   // Before:
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 2 },
   shadowOpacity: 0.1,
   shadowRadius: 4,
   elevation: 2,
   
   // After:
   ...createShadow({
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 2,
   }),
   ```

**Progress:**
- ✅ 2 files done (`app/safe-landing.tsx`, `app/(tabs)/wellness/revolutionary-features.tsx`)
- ⚠️ ~23 files remaining (see `SHADOW_DEPRECATION_FIX.md`)

### 3. Fix Fragment Style Error

**Find the issue:**
```bash
node scripts/find-fragment-issues.js
```

**Common fixes:**
- Replace `<Fragment>` with `<View>`
- Remove style props from Fragments
- Wrap Fragment in a View if needed

### 4. expo-av Migration (Future)

Deferred until SDK 54 upgrade. Informational only.

## 📚 Documentation

| File | Purpose |
|------|---------|
| `DEPRECATION_FIX_SUMMARY.md` | Overall progress and status |
| `DEPRECATION_WARNINGS_FIX.md` | Comprehensive fix guide |
| `SHADOW_DEPRECATION_FIX.md` | Detailed shadow migration guide |
| `utils/shadow.ts` | Shadow utility (NEW) |
| `scripts/find-shadow-props.js` | Find shadow issues |
| `scripts/find-fragment-issues.js` | Find Fragment issues |

## 🎯 Priority

1. **High**: Shadow props (~23 files)
2. **Medium**: Fragment style error (1 unknown location)
3. **Low**: expo-av (future SDK 54)

## ✅ Completed

- [x] Created shadow utility
- [x] Fixed pointerEvents (7 files)
- [x] Fixed shadow props in 2 files
- [x] Created helper scripts
- [x] Created documentation

## 📝 Next Steps

1. Run `node scripts/find-shadow-props.js` to see remaining shadow files
2. Update each file with shadow import and wrapper
3. Run `node scripts/find-fragment-issues.js` to locate Fragment error
4. Test on web and native platforms
5. Verify no deprecation warnings remain

## 🛠️ Need Help?

See the detailed guides:
- Shadow migration: `SHADOW_DEPRECATION_FIX.md`
- All warnings: `DEPRECATION_WARNINGS_FIX.md`
- Current status: `DEPRECATION_FIX_SUMMARY.md`
