#!/usr/bin/env node
/**
 * CURATOR-IMAGES.JS
 * Social media card/image generator for curated content
 * 
 * Note: This is a placeholder/framework that outputs HTML templates
 * for generating social media cards. Full implementation would require
 * a headless browser (Puppeteer) or canvas library (node-canvas).
 * 
 * For now, it generates:
 * - Open Graph meta tags
 * - Twitter Card meta tags
 * - HTML templates for card generation
 */

const fs = require('fs');
const path = require('path');
const siteConfig = require('./site-config');

class CuratorImages {
  constructor() {
    this.siteUrl = siteConfig.url;
    this.imagesDir = path.join(process.cwd(), 'public', 'images', 'social-cards');
  }

  /**
   * Generate Open Graph and Twitter Card meta tags
   */
  generateMetaTags(item, imageUrl) {
    const title = this.escapeHtml(item.title);
    const description = this.escapeHtml(item.description || 'Curated disability news from 3mpwr App');
    
    const tags = `<!-- Open Graph Tags -->
<meta property="og:type" content="article">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${item.link}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="3mpwr App">
<meta property="article:published_time" content="${item.pubDate || new Date().toISOString()}">
<meta property="article:section" content="Disability News">

<!-- Twitter Card Tags -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@3mpwrApp0816">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${imageUrl}">
<meta name="twitter:image:alt" content="${title}">`;

    return tags;
  }

  /**
   * Generate HTML template for social card
   */
  generateCardTemplate(item, index) {
    const title = this.escapeHtml(item.title);
    const source = this.escapeHtml(item.source || 'News Source');
    const date = new Date(item.pubDate || Date.now()).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    // Choose color based on score
    let gradientColor = '#0066cc';
    if (item.score >= 4.0) gradientColor = '#dc2626'; // red for critical
    else if (item.score >= 3.0) gradientColor = '#0066cc'; // blue for high priority
    else if (item.score >= 2.0) gradientColor = '#059669'; // green for medium

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1200, height=630">
  <title>Social Card - ${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      width: 1200px;
      height: 630px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, ${gradientColor} 0%, #1e3a8a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
    }
    
    .card {
      background: white;
      border-radius: 24px;
      padding: 60px;
      width: 100%;
      height: 100%;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .logo {
      font-size: 48px;
      font-weight: 800;
      color: ${gradientColor};
    }
    
    .badge {
      background: ${gradientColor};
      color: white;
      padding: 8px 20px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .title {
      font-size: 56px;
      font-weight: 700;
      line-height: 1.2;
      color: #111827;
      margin-bottom: 30px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 3px solid #e5e7eb;
      padding-top: 30px;
    }
    
    .source {
      font-size: 24px;
      color: #6b7280;
      font-weight: 500;
    }
    
    .date {
      font-size: 24px;
      color: #9ca3af;
    }
    
    .score-badge {
      position: absolute;
      top: 60px;
      right: 60px;
      background: ${gradientColor};
      color: white;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 700;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }
  </style>
</head>
<body>
  <div class="score-badge">${item.score.toFixed(1)}</div>
  <div class="card">
    <div class="header">
      <div class="logo">3mpwr</div>
      <div class="badge">Curated News</div>
    </div>
    
    <div class="content">
      <h1 class="title">${title}</h1>
    </div>
    
    <div class="footer">
      <div class="source">${source}</div>
      <div class="date">${date}</div>
    </div>
  </div>
</body>
</html>`;

    return html;
  }

  /**
   * Escape HTML special characters
   */
  escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Generate all social cards from latest curation
   */
  generateCards() {
    try {
      const latestPath = path.join(process.cwd(), 'public', 'curation-latest.json');
      
      if (!fs.existsSync(latestPath)) {
        console.error('❌ No curation data found');
        return false;
      }

      const curationData = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
      console.log(`\n🎨 Generating social cards for ${curationData.count} items\n`);

      // Ensure images directory exists
      if (!fs.existsSync(this.imagesDir)) {
        fs.mkdirSync(this.imagesDir, { recursive: true });
      }

      // Generate top 10 cards
      const topItems = curationData.items.slice(0, 10);
      const metaTagsFile = path.join(this.imagesDir, 'meta-tags.html');
      let allMetaTags = '<!-- Social Media Meta Tags for Curated Content -->\n\n';

      topItems.forEach((item, index) => {
        // Generate HTML template
        const html = this.generateCardTemplate(item, index);
        const htmlPath = path.join(this.imagesDir, `card-${index + 1}.html`);
        fs.writeFileSync(htmlPath, html, 'utf8');
        
        // Generate meta tags
        const imageUrl = `${this.siteUrl}/images/social-cards/card-${index + 1}.png`;
        const metaTags = this.generateMetaTags(item, imageUrl);
        allMetaTags += `<!-- Card ${index + 1}: ${item.title.substring(0, 50)}... -->\n${metaTags}\n\n`;
        
        console.log(`✅ Card ${index + 1}: ${htmlPath}`);
      });

      // Save all meta tags
      fs.writeFileSync(metaTagsFile, allMetaTags, 'utf8');
      console.log(`\n✅ Meta tags saved to ${metaTagsFile}\n`);

      // Generate instructions
      this.generateInstructions();

      return true;
    } catch (err) {
      console.error(`❌ Card generation failed: ${err.message}`);
      return false;
    }
  }

  /**
   * Generate instructions for converting HTML to images
   */
  generateInstructions() {
    const instructions = `# Social Media Card Generation Instructions

## Overview
HTML templates have been generated for social media cards.
To convert them to images (PNG), use one of these methods:

## Method 1: Using Puppeteer (Node.js)

\`\`\`bash
npm install puppeteer
\`\`\`

\`\`\`javascript
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generateImages() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1200, height: 630 });
  
  // Generate each card
  for (let i = 1; i <= 10; i++) {
    const htmlPath = path.join(__dirname, \`card-\${i}.html\`);
    if (fs.existsSync(htmlPath)) {
      await page.goto(\`file://\${htmlPath}\`);
      await page.screenshot({
        path: \`card-\${i}.png\`,
        type: 'png'
      });
      console.log(\`Generated card-\${i}.png\`);
    }
  }
  
  await browser.close();
}

generateImages();
\`\`\`

## Method 2: Using Browser DevTools

1. Open each \`card-X.html\` file in Chrome/Edge
2. Press F12 to open DevTools
3. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
4. Type "screenshot" and select "Capture screenshot"
5. Save as \`card-X.png\`

## Method 3: Using Online Tools

1. Visit: https://htmlcsstoimage.com/
2. Paste HTML from each card file
3. Generate and download PNG
4. Repeat for each card

## Method 4: Automated with GitHub Actions

Add to \`.github/workflows/curator.yml\`:

\`\`\`yaml
- name: Generate Social Cards
  run: |
    npm install puppeteer
    node scripts/generate-card-images.js
\`\`\`

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

1. Upload to \`/public/images/social-cards/\`
2. Copy meta tags from \`meta-tags.html\`
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
`;

    const instructionsPath = path.join(this.imagesDir, 'README.md');
    fs.writeFileSync(instructionsPath, instructions, 'utf8');
    console.log(`📄 Instructions saved to ${instructionsPath}\n`);
  }
}

// Run if called directly
if (require.main === module) {
  const imageGen = new CuratorImages();
  console.log('\n🎨 SOCIAL MEDIA CARD GENERATOR\n');
  
  if (imageGen.generateCards()) {
    console.log('✅ Social card templates generated successfully!\n');
    console.log('📁 Location: public/images/social-cards/\n');
    console.log('📖 Next steps: See README.md in the cards directory\n');
  } else {
    console.error('❌ Card generation failed\n');
    process.exit(1);
  }
}

module.exports = CuratorImages;
