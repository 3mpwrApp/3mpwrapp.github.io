# Dyslexia Font Assets

This directory should contain dyslexia-friendly fonts referenced by the app.

## Required Fonts

### 1. OpenDyslexic-Regular.ttf
- **Download from**: https://opendyslexic.org/
- **License**: Creative Commons Attribution 3.0 Unported
- **File Size**: ~80 KB
- **Purpose**: Weighted bottom letters prevent letter rotation/flipping
- **Installation**: Download and place in this directory as `OpenDyslexic-Regular.ttf`

### 2. Lexend-Regular.ttf
- **Download from**: https://fonts.google.com/specimen/Lexend
- **License**: SIL Open Font License 1.1
- **File Size**: ~50 KB
- **Purpose**: Google font optimized for reading speed and comprehension
- **Installation**: Download and place in this directory as `Lexend-Regular.ttf`

## Quick Setup

```bash
# From project root
cd assets/fonts

# Option 1: Download manually from links above

# Option 2: Use curl/wget (Linux/Mac)
curl -L "https://github.com/antijingoist/opendyslexic/raw/master/compiled/OpenDyslexic-Regular.otf" -o OpenDyslexic-Regular.ttf
curl -L "https://github.com/googlefonts/lexend/raw/main/fonts/ttf/Lexend-Regular.ttf" -o Lexend-Regular.ttf
```

## Verification

After adding fonts:
1. Run `npx expo start`
2. Navigate to **Settings → Dyslexia**
3. Select **OpenDyslexic** or **Lexend** from font dropdown
4. Verify font renders differently in Letter Wizard or Policy Simplifier

## Fallback Behavior

If fonts are missing:
- App continues to function normally
- Settings screen displays all options
- Font selection falls back to system default
- No crashes or errors

## Attribution

If you include these fonts in your build, add attribution in your About screen:
- OpenDyslexic by Abelardo Gonzalez (CC BY 3.0)
- Lexend by Bonnie Shaver-Troup & Thomas Jockin (SIL OFL 1.1)

## License Files

Copy font license files to `docs/licenses/` when adding binaries:
- `OpenDyslexic-LICENSE.txt`
- `Lexend-OFL.txt`

---

**Note**: Font files are not included in the repository to keep the codebase lightweight. Each developer/builder must download them separately.
