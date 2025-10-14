# Dyslexia Font Assets Guide

## Overview
The dyslexia support system references two specialized fonts designed to improve readability for users with dyslexia:
- **OpenDyslexic** - Weighted bottom letters to prevent flipping
- **Lexend** - Google font optimized for readability

Currently, the font references in `hooks/useDyslexiaFont.ts` are **placeholders**. The actual font files have not been added to the repository.

## Current Status
✅ Font loading hook implemented (`hooks/useDyslexiaFont.ts`)  
✅ Font constants defined (`constants/dyslexia.ts`)  
✅ Settings UI ready with font selection  
⏳ Actual font files **NOT YET ADDED**  

The app will gracefully fall back to system fonts if font files are missing.

## Adding Font Assets

### Step 1: Download Fonts
1. **OpenDyslexic**:
   - Download from: https://opendyslexic.org/
   - File needed: `OpenDyslexic-Regular.ttf`
   - License: Creative Commons (verify current license)

2. **Lexend**:
   - Download from: https://fonts.google.com/specimen/Lexend
   - File needed: `Lexend-Regular.ttf`
   - License: SIL Open Font License

### Step 2: Add to Project
```
assets/
  fonts/
    OpenDyslexic-Regular.ttf    ← Add this file
    Lexend-Regular.ttf           ← Add this file
```

### Step 3: Verify References
The hook already references these paths:
```typescript
const FONT_SOURCES: Record<string, any> = {
  OpenDyslexic: require('../assets/fonts/OpenDyslexic-Regular.ttf'),
  Lexend: require('../assets/fonts/Lexend-Regular.ttf'),
};
```

### Step 4: Test Loading
1. Run the app: `npx expo start`
2. Navigate to Settings → Dyslexia
3. Select OpenDyslexic or Lexend font
4. Verify font renders in preview and Letter Wizard

## Fallback Behavior
If fonts are missing:
- Hook returns `ready: true` after gracefully skipping load
- Settings screen shows all fonts but missing ones won't render differently
- No crashes or blocking errors
- Users can still configure spacing, overlays, and other features

## Font Size & Licensing
- **OpenDyslexic-Regular.ttf**: ~80 KB
- **Lexend-Regular.ttf**: ~50 KB
- Total: ~130 KB added to app bundle

### License Compliance
- OpenDyslexic: CC BY 3.0 (include attribution in About screen)
- Lexend: SIL OFL 1.1 (include license file in repository)

## Alternative: Use Web Fonts (Future)
For lighter bundle size, consider loading fonts from CDN on web platform:
```typescript
if (Platform.OS === 'web') {
  // Load from Google Fonts or OpenDyslexic CDN
} else {
  // Use bundled fonts
}
```

## Testing Without Fonts
Current setup allows full testing without font binaries:
- Settings UI functions normally
- DyslexiaText component applies spacing/overlays
- Visual layer renders overlays and ruler
- Persistence and presets work correctly

## Next Steps After Adding Fonts
1. Add font files to `assets/fonts/`
2. Test font loading on iOS, Android, and Web
3. Add attribution to About screen
4. Update `CHANGELOG.md` to mark fonts as available
5. Capture screenshots for documentation
6. Consider adding more font weights (Bold, Italic) for richer text

---

**Last Updated**: 2025-10-14  
**Phase**: 1.2 Dyslexia Support (85% → 90% with font assets)
