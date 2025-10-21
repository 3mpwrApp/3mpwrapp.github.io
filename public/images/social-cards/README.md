# Social Media Card Generation Instructions

## Overview
HTML templates have been generated for social media cards.
To convert them to images (PNG), use one of these methods:

## Method 1: Using Puppeteer (Node.js)

```bash
npm install puppeteer
```

```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generateImages() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1200, height: 630 });
  
  // Generate each card
  for (let i = 1; i <= 10; i++) {
    const htmlPath = path.join(__dirname, `card-${i}.html`);
    if (fs.existsSync(htmlPath)) {
      await page.goto(`file://${htmlPath}`);
      await page.screenshot({
        path: `card-${i}.png`,
        type: 'png'
      });
      console.log(`Generated card-${i}.png`);
    }
  }
  
  await browser.close();
}

generateImages();
```

## Method 2: Using Browser DevTools

1. Open each `card-X.html` file in Chrome/Edge
2. Press F12 to open DevTools
3. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
4. Type "screenshot" and select "Capture screenshot"
5. Save as `card-X.png`

## Method 3: Using Online Tools

1. Visit: https://htmlcsstoimage.com/
2. Paste HTML from each card file
3. Generate and download PNG
4. Repeat for each card

## Method 4: Automated with GitHub Actions

Add to `.github/workflows/curator.yml`:

```yaml
- name: Generate Social Cards
  run: |
    npm install puppeteer
    node scripts/generate-card-images.js
```

## Recommended Dimensions

- **Open Graph:** 1200 x 630 px
- **Twitter Card:** 1200 x 675 px (or 1200 x 630 px)
- **LinkedIn:** 1200 x 627 px

Current templates use: **1200 x 630 px** (compatible with all platforms)

## File Sizes

- Target: < 1 MB per image (preferably < 300 KB)
- Format: PNG (better for text) or JPG (smaller file size)
- Optimization: Use ImageOptim, TinyPNG, or similar

## Usage

Once PNG images are generated:

1. Upload to `/public/images/social-cards/`
2. Copy meta tags from `meta-tags.html`
3. Add to individual blog post pages
4. Test with:
   - Facebook Sharing Debugger
   - Twitter Card Validator
   - LinkedIn Post Inspector

## Automation Tip

Set up automated card generation in the curator workflow:
1. Curate content (3x daily)
2. Generate HTML templates
3. Convert to PNG images
4. Upload to CDN
5. Update meta tags in blog posts

This ensures every curated item has a beautiful social card!
