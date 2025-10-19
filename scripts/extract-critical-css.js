/**
 * Critical CSS Extractor
 * Extracts above-the-fold CSS for faster First Contentful Paint
 * Run this during build process to generate inline critical CSS
 */

const fs = require('fs');
const path = require('path');

// Critical selectors that should always be inline
const CRITICAL_SELECTORS = [
  // Layout
  'html', 'body',
  '.skip-link',
  'header', '.header-bar', '.brand', '.site-brand',
  'nav', '#primary-nav', '.nav-list',
  'main', '#main-content',
  '.container', '.content',
  
  // Typography
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'a', 'strong', 'em',
  
  // Utility classes
  '.btn', '.btn-primary', '.btn-secondary',
  '.sr-only', '.visually-hidden',
  
  // Dark mode essentials
  ':root', '[data-theme="dark"]',
  '.theme-toggle',
  
  // Above-the-fold components
  '.hero', '.hero-content',
  '.page-header', '.page-title',
  
  // Loading states
  '.loading', '.lazy-loading',
  
  // Critical accessibility
  ':focus', ':focus-visible',
  '[aria-current]', '[aria-hidden]'
];

// CSS properties that are critical for initial render
const CRITICAL_PROPERTIES = [
  'display', 'position', 'visibility',
  'width', 'height', 'margin', 'padding',
  'color', 'background', 'background-color',
  'font-family', 'font-size', 'font-weight', 'line-height',
  'border', 'border-radius',
  'flex', 'grid',
  'transform', 'transition'
];

/**
 * Extract critical CSS from full stylesheet
 */
function extractCriticalCSS(cssContent) {
  const criticalCSS = [];
  const rules = cssContent.split('}');
  
  rules.forEach(rule => {
    const trimmedRule = rule.trim();
    if (!trimmedRule) return;
    
    // Check if rule contains any critical selector
    const isCritical = CRITICAL_SELECTORS.some(selector => {
      return trimmedRule.includes(selector);
    });
    
    // Check if rule contains critical properties
    const hasCriticalProps = CRITICAL_PROPERTIES.some(prop => {
      return trimmedRule.includes(`${prop}:`);
    });
    
    if (isCritical || hasCriticalProps) {
      criticalCSS.push(trimmedRule + '}');
    }
  });
  
  return criticalCSS.join('\n');
}

/**
 * Minify CSS
 */
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around punctuation
    .replace(/;}/g, '}') // Remove last semicolon in block
    .replace(/\s*!important/g, '!important') // Clean !important
    .trim();
}

/**
 * Generate critical CSS file
 */
function generateCriticalCSS() {
  const cssPath = path.join(__dirname, '..', 'assets', 'css', 'style.css');
  const outputPath = path.join(__dirname, '..', '_includes', 'critical-css.html');
  
  console.log('🎨 Extracting critical CSS...');
  
  // Read main stylesheet
  if (!fs.existsSync(cssPath)) {
    console.error('❌ Main stylesheet not found:', cssPath);
    return;
  }
  
  const fullCSS = fs.readFileSync(cssPath, 'utf8');
  
  // Extract critical CSS
  const critical = extractCriticalCSS(fullCSS);
  
  // Minify
  const minified = minifyCSS(critical);
  
  // Create HTML include with inline styles
  const output = `<!-- Critical CSS - Auto-generated, do not edit manually -->
<style>
${minified}
</style>
<!-- End Critical CSS -->`;
  
  // Write output
  fs.writeFileSync(outputPath, output, 'utf8');
  
  console.log('✅ Critical CSS generated:');
  console.log(`   Original size: ${(fullCSS.length / 1024).toFixed(2)} KB`);
  console.log(`   Critical size: ${(minified.length / 1024).toFixed(2)} KB`);
  console.log(`   Reduction: ${(((fullCSS.length - minified.length) / fullCSS.length) * 100).toFixed(1)}%`);
  console.log(`   Output: ${outputPath}`);
}

/**
 * Generate usage instructions
 */
function generateUsageInstructions() {
  const instructions = `
# Critical CSS Usage Instructions

## What is Critical CSS?

Critical CSS contains only the styles needed to render above-the-fold content. This significantly improves First Contentful Paint (FCP) and perceived performance.

## How to Use

### 1. Generate Critical CSS

Run this script to extract critical CSS:

\`\`\`bash
node scripts/extract-critical-css.js
\`\`\`

This creates \`_includes/critical-css.html\` with inline styles.

### 2. Include in Layout

Add to \`<head>\` of \`_layouts/default.html\`:

\`\`\`html
<head>
  <!-- Other meta tags -->
  
  {% include critical-css.html %}
  
  <!-- Defer non-critical CSS -->
  <link rel="preload" href="{{ "/assets/css/style.css" | relative_url }}" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="{{ "/assets/css/style.css" | relative_url }}"></noscript>
</head>
\`\`\`

### 3. Regenerate on CSS Changes

Whenever you modify \`assets/css/style.css\`, regenerate critical CSS:

\`\`\`bash
npm run build:critical-css
\`\`\`

## Performance Impact

- **Before**: Full CSS blocks rendering (~50-100KB)
- **After**: Critical CSS inline (~5-10KB), rest loads async
- **Improvement**: 30-50% faster First Contentful Paint

## Customization

Edit \`CRITICAL_SELECTORS\` and \`CRITICAL_PROPERTIES\` in this script to customize what's considered critical for your site.

## Best Practices

1. Keep critical CSS < 14KB (fits in first TCP packet)
2. Only include above-the-fold styles
3. Regenerate after major CSS changes
4. Test with Lighthouse to verify improvements

## Automation

Add to \`package.json\`:

\`\`\`json
{
  "scripts": {
    "build:critical-css": "node scripts/extract-critical-css.js"
  }
}
\`\`\`

## Monitoring

Use Lighthouse to track:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)

Target scores:
- FCP: < 1.8s (green)
- LCP: < 2.5s (green)
- TTI: < 3.8s (green)
`;

  const docPath = path.join(__dirname, '..', 'CRITICAL-CSS-GUIDE.md');
  fs.writeFileSync(docPath, instructions, 'utf8');
  console.log('📚 Usage guide created: CRITICAL-CSS-GUIDE.md');
}

// Run if called directly
if (require.main === module) {
  generateCriticalCSS();
  generateUsageInstructions();
}

module.exports = {
  extractCriticalCSS,
  minifyCSS,
  generateCriticalCSS
};
