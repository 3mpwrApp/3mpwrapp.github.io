/**
 * PWA Icon Generator
 * Generates all required icon sizes from the main logo
 * Run with: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const sourceLogo = path.join(__dirname, '..', 'assets', 'empwrapp-logo.png');
const iconsDir = path.join(__dirname, '..', 'assets', 'icons');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const shortcuts = ['guide', 'features', 'contact', 'beta'];

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║   PWA Icon Generator - 3mpwrApp        ║${colors.reset}`);
console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);

// Check if source logo exists
if (!fs.existsSync(sourceLogo)) {
  console.error(`${colors.red}❌ Error: Source logo not found at ${sourceLogo}${colors.reset}`);
  console.log(`${colors.yellow}Please ensure assets/empwrapp-logo.png exists${colors.reset}`);
  process.exit(1);
}

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  console.log(`${colors.blue}📁 Creating icons directory...${colors.reset}`);
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log(`${colors.green}✅ Directory created: ${iconsDir}${colors.reset}\n`);
}

// Track progress
let successCount = 0;
let errorCount = 0;
const totalIcons = sizes.length + shortcuts.length;

console.log(`${colors.blue}🎨 Generating ${sizes.length} icon sizes...${colors.reset}\n`);

// Generate all icon sizes
const iconPromises = sizes.map(size => {
  return sharp(sourceLogo)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(path.join(iconsDir, `icon-${size}.png`))
    .then(info => {
      successCount++;
      console.log(`${colors.green}✅ Generated icon-${size}.png (${info.width}x${info.height}, ${(info.size / 1024).toFixed(1)}KB)${colors.reset}`);
    })
    .catch(err => {
      errorCount++;
      console.error(`${colors.red}❌ Error generating icon-${size}.png: ${err.message}${colors.reset}`);
    });
});

console.log(`\n${colors.blue}🔗 Generating ${shortcuts.length} shortcut icons (192x192)...${colors.reset}\n`);

// Generate shortcut icons (all 192x192)
const shortcutPromises = shortcuts.map(name => {
  return sharp(sourceLogo)
    .resize(192, 192, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(path.join(iconsDir, `shortcut-${name}.png`))
    .then(info => {
      successCount++;
      console.log(`${colors.green}✅ Generated shortcut-${name}.png (${info.width}x${info.height}, ${(info.size / 1024).toFixed(1)}KB)${colors.reset}`);
    })
    .catch(err => {
      errorCount++;
      console.error(`${colors.red}❌ Error generating shortcut-${name}.png: ${err.message}${colors.reset}`);
    });
});

// Wait for all icons to be generated
Promise.all([...iconPromises, ...shortcutPromises])
  .then(() => {
    console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║            Generation Complete         ║${colors.reset}`);
    console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);
    
    console.log(`${colors.green}✅ Success: ${successCount}/${totalIcons} icons generated${colors.reset}`);
    if (errorCount > 0) {
      console.log(`${colors.red}❌ Errors: ${errorCount}${colors.reset}`);
    }
    
    console.log(`\n${colors.blue}📦 Icons saved to: ${iconsDir}${colors.reset}`);
    console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
    console.log(`  1. Verify icons in assets/icons/ folder`);
    console.log(`  2. Test PWA manifest in DevTools (Application → Manifest)`);
    console.log(`  3. Commit changes: git add assets/icons/ && git commit -m "feat: Generate PWA icons from new logo"`);
    console.log(`  4. Clear browser cache and test installation\n`);
  })
  .catch(err => {
    console.error(`\n${colors.red}❌ Fatal error: ${err.message}${colors.reset}`);
    process.exit(1);
  });
