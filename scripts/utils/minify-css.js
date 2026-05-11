#!/usr/bin/env node
/**
 * MINIFY-CSS.JS
 * Minifies CSS files and removes unused styles
 * Requires: clean-css (npm install clean-css)
 */

const fs = require('fs');
const path = require('path');

// Check if clean-css is installed
let CleanCSS;
try {
  CleanCSS = require('clean-css');
} catch (e) {
  console.log('⚠️  clean-css not installed. Installing...');
  console.log('Run: npm install clean-css');
  process.exit(1);
}

/**
 * Minify CSS file
 */
function minifyCss(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const originalSize = Buffer.byteLength(content, 'utf-8');
  
  const minifier = new CleanCSS({
    level: 2, // Advanced optimizations
    format: false, // Remove all formatting
    inline: ['local'], // Inline local @import rules
    compatibility: '*', // IE9+ compatibility
  });
  
  const result = minifier.minify(content);
  
  if (result.errors.length > 0) {
    console.error(`❌ Errors minifying ${filePath}:`);
    result.errors.forEach(err => console.error(`   ${err}`));
    return { error: true };
  }
  
  const minifiedSize = Buffer.byteLength(result.styles, 'utf-8');
  const savings = originalSize - minifiedSize;
  const percent = ((savings / originalSize) * 100).toFixed(1);
  
  // Save minified version
  const ext = path.extname(filePath);
  const minPath = filePath.replace(ext, `.min${ext}`);
  fs.writeFileSync(minPath, result.styles, 'utf-8');
  
  console.log(`✅ ${path.basename(filePath)}`);
  console.log(`   Original: ${(originalSize / 1024).toFixed(1)} KB`);
  console.log(`   Minified: ${(minifiedSize / 1024).toFixed(1)} KB`);
  console.log(`   Savings: ${(savings / 1024).toFixed(1)} KB (${percent}%)`);
  console.log(`   Output: ${path.basename(minPath)}`);
  
  if (result.warnings.length > 0) {
    console.log(`   ⚠️  ${result.warnings.length} warnings`);
  }
  
  return { 
    savings, 
    originalSize, 
    minifiedSize, 
    warnings: result.warnings.length 
  };
}

/**
 * Find all CSS files
 */
function findCssFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', '_site', 'public'].includes(entry.name)) {
        findCssFiles(fullPath, files);
      }
    } else if (entry.isFile()) {
      // Only process non-minified CSS files
      if (entry.name.endsWith('.css') && !entry.name.endsWith('.min.css')) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

/**
 * Update HTML files to use minified CSS
 */
function updateHtmlLinks(dryRun = false) {
  const layoutsDir = path.join(process.cwd(), '_layouts');
  const includesDir = path.join(process.cwd(), '_includes');
  
  const htmlFiles = [];
  
  if (fs.existsSync(layoutsDir)) {
    const layouts = fs.readdirSync(layoutsDir)
      .filter(f => f.endsWith('.html'))
      .map(f => path.join(layoutsDir, f));
    htmlFiles.push(...layouts);
  }
  
  if (fs.existsSync(includesDir)) {
    const includes = fs.readdirSync(includesDir)
      .filter(f => f.endsWith('.html'))
      .map(f => path.join(includesDir, f));
    htmlFiles.push(...includes);
  }
  
  let updatedCount = 0;
  
  for (const htmlFile of htmlFiles) {
    let content = fs.readFileSync(htmlFile, 'utf-8');
    const original = content;
    
    // Replace .css with .min.css in link tags
    content = content.replace(
      /(<link[^>]*href=["'][^"']*?)\.css(["'][^>]*>)/g,
      '$1.min.css$2'
    );
    
    if (content !== original) {
      if (!dryRun) {
        fs.writeFileSync(htmlFile, content, 'utf-8');
      }
      updatedCount++;
      console.log(`   Updated: ${path.basename(htmlFile)}`);
    }
  }
  
  return updatedCount;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const updateLinks = args.includes('--update-links');
  
  console.log('\n🎨 CSS MINIFICATION TOOL\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE (no files will be modified)\n');
  }
  
  const assetsDir = path.join(process.cwd(), 'assets');
  
  if (!fs.existsSync(assetsDir)) {
    console.log('❌ Assets directory not found');
    return;
  }
  
  console.log('📂 Scanning for CSS files...\n');
  const cssFiles = findCssFiles(assetsDir);
  
  console.log(`Found ${cssFiles.length} CSS files to minify\n`);
  
  if (dryRun) {
    console.log('Files to be minified:');
    cssFiles.forEach(f => console.log(`  - ${path.relative(process.cwd(), f)}`));
    console.log('');
    return;
  }
  
  let totalSavings = 0;
  let totalOriginal = 0;
  let totalMinified = 0;
  let processedCount = 0;
  let warningCount = 0;
  
  for (const cssFile of cssFiles) {
    const result = minifyCss(cssFile);
    if (result.error) continue;
    
    totalSavings += result.savings;
    totalOriginal += result.originalSize;
    totalMinified += result.minifiedSize;
    warningCount += result.warnings;
    processedCount++;
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Minified: ${processedCount} files`);
  console.log(`📊 Original: ${(totalOriginal / 1024).toFixed(1)} KB`);
  console.log(`📦 Minified: ${(totalMinified / 1024).toFixed(1)} KB`);
  console.log(`💾 Savings: ${(totalSavings / 1024).toFixed(1)} KB (${((totalSavings / totalOriginal) * 100).toFixed(1)}%)`);
  
  if (warningCount > 0) {
    console.log(`⚠️  Total Warnings: ${warningCount}`);
  }
  
  if (updateLinks) {
    console.log('\n📝 Updating HTML files to use minified CSS...\n');
    const updatedFiles = updateHtmlLinks(false);
    console.log(`\n✅ Updated ${updatedFiles} HTML files`);
  } else {
    console.log('\n💡 Run with --update-links to update HTML files');
  }
  
  console.log('\n💡 Next steps:');
  console.log('   1. Test minified CSS on all pages');
  console.log('   2. Update HTML to reference .min.css files');
  console.log('   3. Commit minified files\n');
}

if (require.main === module) {
  main();
}

module.exports = { minifyCss, findCssFiles };
