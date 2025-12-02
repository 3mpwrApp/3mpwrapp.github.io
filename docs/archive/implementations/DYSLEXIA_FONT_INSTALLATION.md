# Dyslexia Font Installation Guide

This guide walks you through downloading and installing dyslexia-friendly fonts for the 3mpwr App.

## Required Fonts

### 1. OpenDyslexic
- **License:** CC BY 3.0
- **Size:** ~80 KB
- **Website:** https://opendyslexic.org/
- **Download:** https://github.com/antijingoist/opendyslexic/releases

**Why this font?**  
OpenDyslexic features heavy weighted bottoms that help guide the eye along the text. Letter shapes are distinct to prevent confusion (e.g., b/d, p/q).

### 2. Lexend
- **License:** SIL Open Font License 1.1
- **Size:** ~50 KB
- **Website:** https://www.lexend.com/
- **Download:** https://fonts.google.com/specimen/Lexend

**Why this font?**  
Lexend is scientifically designed to reduce visual stress and improve reading fluency for people with dyslexia.

---

## Installation Steps

### Option 1: Manual Download (Recommended)

#### Step 1: Download OpenDyslexic

```bash
# Navigate to project fonts directory
cd assets/fonts

# Download OpenDyslexic (Windows PowerShell)
Invoke-WebRequest -Uri "https://github.com/antijingoist/opendyslexic/releases/download/v2.0.0/opendyslexic-0.91.12-20190516.zip" -OutFile "opendyslexic.zip"

# Extract
Expand-Archive -Path "opendyslexic.zip" -DestinationPath "temp"

# Copy the Regular variant
Copy-Item "temp/OpenDyslexic-Regular.ttf" -Destination "OpenDyslexic-Regular.ttf"

# Cleanup
Remove-Item -Recurse -Force "temp", "opendyslexic.zip"
```

#### Step 2: Download Lexend

```bash
# Still in assets/fonts directory

# Download from Google Fonts (requires manual download)
# Visit: https://fonts.google.com/specimen/Lexend
# Click "Download family"
# Extract and copy Lexend-Regular.ttf to assets/fonts/
```

**OR use curl (if available):**

```bash
curl -o Lexend.zip "https://fonts.google.com/download?family=Lexend"
# Extract and copy Lexend-Regular.ttf
```

#### Step 3: Verify Installation

```bash
# Check files exist
ls assets/fonts/

# Expected output:
# OpenDyslexic-Regular.ttf (~80 KB)
# Lexend-Regular.ttf (~50 KB)
# README.md
```

### Option 2: Use Provided Scripts

If the fonts are available in a secure CDN or repository:

```bash
npm run fonts:download
```

---

## Verification

### File Checksums

After downloading, verify integrity:

**OpenDyslexic-Regular.ttf**
- **MD5:** `a1b2c3d4e5f6...` (example)
- **SHA-256:** `1234567890abcdef...` (example)

**Lexend-Regular.ttf**
- **MD5:** `f6e5d4c3b2a1...` (example)
- **SHA-256:** `fedcba0987654321...` (example)

```bash
# Windows PowerShell
Get-FileHash -Algorithm SHA256 assets/fonts/OpenDyslexic-Regular.ttf
Get-FileHash -Algorithm SHA256 assets/fonts/Lexend-Regular.ttf
```

### Test in App

1. Start the app: `npx expo start`
2. Navigate to **Settings → Dyslexia Support**
3. Select "OpenDyslexic" or "Lexend" from font options
4. Verify text renders with the selected font
5. Check for console warnings (should be none)

---

## Troubleshooting

### Issue: "Font not found" or fallback to system font

**Solution:**
1. Verify files are in `assets/fonts/` directory
2. Check filenames match exactly:
   - `OpenDyslexic-Regular.ttf` (case-sensitive)
   - `Lexend-Regular.ttf` (case-sensitive)
3. Clear Metro bundler cache: `npx expo start --clear`
4. Rebuild the app

### Issue: Font doesn't load on device

**Solution:**
1. Check that fonts are included in `app.json` → `expo.fonts` (if configured)
2. Verify font loading hook in `hooks/useDyslexiaFont.ts`
3. Check for async loading errors in console

### Issue: App crashes after adding fonts

**Solution:**
1. Check for duplicate font registrations
2. Verify font files are not corrupted (re-download)
3. Check `constants/dyslexia.ts` for correct font paths

---

## Attribution Requirements

### OpenDyslexic

When distributing, include this notice in your app's About or Credits section:

```
OpenDyslexic by Abelardo Gonzalez
Licensed under CC BY 3.0
https://opendyslexic.org/
```

### Lexend

```
Lexend by Bonnie Shaver-Troup and Thomas Jockin
Licensed under SIL Open Font License 1.1
https://www.lexend.com/
```

**Note:** Attribution is already included in:
- `app/(tabs)/settings/about.tsx` (if exists)
- `assets/fonts/README.md`

---

## Advanced: Custom Fonts

To add additional dyslexia-friendly fonts:

1. **Update Configuration** (`constants/dyslexia.ts`):

```typescript
export const DYSLEXIA_FONTS = {
  // ... existing fonts
  customFont: {
    name: 'Custom Font Name',
    family: 'CustomFont-Regular',
    description: 'Description of benefits',
  },
};
```

2. **Add Font Source** (`hooks/useDyslexiaFont.ts`):

```typescript
const FONT_SOURCES: Record<string, any> = {
  // ... existing fonts
  'CustomFont-Regular': require('../assets/fonts/CustomFont-Regular.ttf'),
};
```

3. **Place Font File**:
   - Add `CustomFont-Regular.ttf` to `assets/fonts/`

4. **Verify License**: Ensure font license allows app distribution

---

## Production Checklist

Before deploying to production:

- [ ] Fonts downloaded and verified (checksums match)
- [ ] Files placed in `assets/fonts/` directory
- [ ] Font loading tested on iOS and Android
- [ ] Attribution added to About/Credits screen
- [ ] No console warnings or errors
- [ ] Graceful fallback to system font works if files missing
- [ ] Font files committed to repository (if license allows)
- [ ] Updated `CHANGELOG.md` with font additions

---

## Resources

- [OpenDyslexic Official Site](https://opendyslexic.org/)
- [Lexend Official Site](https://www.lexend.com/)
- [Expo Font Loading Docs](https://docs.expo.dev/guides/using-custom-fonts/)
- [React Native Custom Fonts](https://reactnative.dev/docs/custom-fonts)
- [Dyslexia Font Research](https://bdatech.org/what-technology/typefaces-for-dyslexia/)

---

**Last Updated:** October 14, 2025  
**Maintained By:** 3mpwr Development Team
