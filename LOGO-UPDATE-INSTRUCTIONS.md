# Logo Update Instructions

## New Logo Design

The new 3mpwrApp logo features:
- **Design**: Power button symbol with supportive hands underneath
- **Symbolism**: Represents empowerment (power on) and support (caring hands)
- **Colors**: Bright cyan/blue for the power symbol, matching brand theme

## Files to Update

### 1. Main Logo
**Location**: `assets/empowrapp-logo.png`
**Action**: Replace with the new logo image (power button with hands design)
**Old backup**: `assets/empowrapp-logo-old.png`

### 2. PWA Icons (Multiple Sizes Needed)

The manifest.json references these icon files that need to be created from the new logo:

**Location**: `assets/icons/`
**Required sizes**:
- `icon-72.png` (72x72px)
- `icon-96.png` (96x96px)
- `icon-128.png` (128x128px)
- `icon-144.png` (144x144px)
- `icon-152.png` (152x152px)
- `icon-192.png` (192x192px)
- `icon-384.png` (384x384px)
- `icon-512.png` (512x512px)

### 3. Shortcut Icons
**Location**: `assets/icons/`
**Files**:
- `shortcut-guide.png` (192x192px)
- `shortcut-features.png` (192x192px)
- `shortcut-contact.png` (192x192px)
- `shortcut-beta.png` (192x192px)

### 4. Screenshots (Optional update)
**Location**: `assets/screenshots/`
**Files**:
- `desktop-home.png` (1920x1080px)
- `mobile-features.png` (390x844px)

## How to Generate Icon Sizes

### Option 1: Using Online Tools
1. Go to https://www.favicon-generator.org/ or https://realfavicongenerator.net/
2. Upload the new logo
3. Download all generated sizes
4. Place in `assets/icons/` folder

### Option 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick first
# Then run these commands from the project root:

cd assets/icons

# Generate all icon sizes from source logo
convert ../empowrapp-logo.png -resize 72x72 icon-72.png
convert ../empowrapp-logo.png -resize 96x96 icon-96.png
convert ../empowrapp-logo.png -resize 128x128 icon-128.png
convert ../empowrapp-logo.png -resize 144x144 icon-144.png
convert ../empowrapp-logo.png -resize 152x152 icon-152.png
convert ../empowrapp-logo.png -resize 192x192 icon-192.png
convert ../empowrapp-logo.png -resize 384x384 icon-384.png
convert ../empowrapp-logo.png -resize 512x512 icon-512.png

# Generate shortcut icons (same as 192x192)
cp icon-192.png shortcut-guide.png
cp icon-192.png shortcut-features.png
cp icon-192.png shortcut-contact.png
cp icon-192.png shortcut-beta.png
```

### Option 3: Using Node.js Script
Create a script `scripts/generate-icons.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceLogo = 'assets/empowrapp-logo.png';

// Create icons directory if it doesn't exist
if (!fs.existsSync('assets/icons')) {
  fs.mkdirSync('assets/icons', { recursive: true });
}

// Generate all icon sizes
sizes.forEach(size => {
  sharp(sourceLogo)
    .resize(size, size)
    .toFile(`assets/icons/icon-${size}.png`, (err, info) => {
      if (err) console.error(`Error generating ${size}x${size}:`, err);
      else console.log(`✅ Generated icon-${size}.png`);
    });
});

// Generate shortcut icons (192x192)
['guide', 'features', 'contact', 'beta'].forEach(name => {
  sharp(sourceLogo)
    .resize(192, 192)
    .toFile(`assets/icons/shortcut-${name}.png`, (err, info) => {
      if (err) console.error(`Error generating shortcut-${name}:`, err);
      else console.log(`✅ Generated shortcut-${name}.png`);
    });
});
```

Run with:
```bash
npm install sharp
node scripts/generate-icons.js
```

## Steps to Complete Logo Update

1. ✅ **Replace main logo**
   - Save new logo image as `assets/empowrapp-logo.png`

2. **Generate all icon sizes**
   - Choose one of the methods above
   - Ensure all sizes are crisp and clear
   - Check that icons are square with the logo centered

3. **Test PWA manifest**
   - Open browser DevTools
   - Go to Application tab → Manifest
   - Verify all icons load correctly

4. **Clear browser cache**
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Clear service worker cache
   - Test on mobile device

5. **Commit changes**
   ```bash
   git add assets/empowrapp-logo.png assets/icons/
   git commit -m "feat: Update logo to new power button with hands design"
   git push origin main
   ```

## Design Guidelines

### Logo Usage
- **Minimum size**: 28x28px (navigation)
- **Preferred sizes**: 192x192px, 512x512px (PWA)
- **Background**: Transparent PNG
- **Padding**: 10-15% around logo for breathing room

### Color Specifications
- **Primary Blue**: #00A5E6 (bright cyan/blue)
- **Secondary Blue**: #0077B6 (darker blue for contrast)
- **Brand Color**: #2A9D8F (teal from theme)
- **Background**: Transparent or white

### Accessibility
- Logo should work on both light and dark backgrounds
- Maintain sufficient contrast (4.5:1 minimum)
- SVG version recommended for scalability (optional)

## Verification Checklist

After updating all logo files:

- [ ] Main logo displays in header (28x28px)
- [ ] PWA manifest shows all icons
- [ ] Install prompt shows correct icon
- [ ] Home screen icon looks good (mobile)
- [ ] Favicon appears in browser tab
- [ ] Social media previews use correct image
- [ ] All icon sizes are sharp (not pixelated)
- [ ] Logo works on light theme
- [ ] Logo works on dark theme
- [ ] Logo works in high contrast mode

## Notes

- The old logo has been backed up to `assets/empowrapp-logo-old.png`
- New logo represents empowerment (power on) and community support (hands)
- Update coordinates with broader brand refresh
- Consider creating SVG version for perfect scalability

## Questions?

Contact: empowrapp08162025@gmail.com
