#!/usr/bin/env node
/**
 * MINIFY-JAVASCRIPT.JS
 * Removes console.log and minifies JavaScript files
 * Requires: terser (npm install terser)
 */

const fs = require('fs');
const path = require('path');

// Check if terser is installed
let terser;
try {
  terser = require('terser');
} catch (e) {
  console.log('⚠️  terser not installed. Installing...');
  console.log('Run: npm install terser');
  process.exit(1);
}

/**
 * Minify JavaScript file
 */
async function minifyJs(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const originalSize = Buffer.byteLength(content, 'utf-8');
  
  try {
    const result = await terser.minify(content, {
      compress: {
        dead_code: true,
        drop_console: true, // Remove console.log
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        toplevel: false, // Don't mangle top-level names (for compatibility)
      },
      format: {
        comments: false, // Remove all comments
      },
      sourceMap: false,
    });
    
    if (result.error) {
      console.error(`❌ Error minifying ${filePath}: ${result.error}`);
      return { error: true };
    }
    
    const minifiedSize = Buffer.byteLength(result.code, 'utf-8');
    const savings = originalSize - minifiedSize;
    const percent = ((savings / originalSize) * 100).toFixed(1);
    
    // Save minified version
    const ext = path.extname(filePath);
    const minPath = filePath.replace(ext, `.min${ext}`);
    fs.writeFileSync(minPath, result.code, 'utf-8');
    
    console.log(`✅ ${path.basename(filePath)}`);
    console.log(`   Original: ${(originalSize / 1024).toFixed(1)} KB`);
    console.log(`   Minified: ${(minifiedSize / 1024).toFixed(1)} KB`);
    console.log(`   Savings: ${(savings / 1024).toFixed(1)} KB (${percent}%)`);
    console.log(`   Output: ${path.basename(minPath)}`);
    
    return { 
      savings, 
      originalSize, 
      minifiedSize,
    };
  } catch (err) {
    console.error(`❌ Error minifying ${filePath}: ${err.message}`);
    return { error: true };
  }
}

/**
 * Find all JavaScript files
 */
function findJsFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', '_site', 'public'].includes(entry.name)) {
        findJsFiles(fullPath, files);
      }
    } else if (entry.isFile()) {
      // Only process non-minified JS files
      if (entry.name.endsWith('.js') && !entry.name.endsWith('.min.js')) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

/**
 * Update HTML files to use minified JS
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
    
    // Replace .js with .min.js in script tags
    content = content.replace(
      /(<script[^>]*src=["'][^"']*?)\.js(["'][^>]*>)/g,
      '$1.min.js$2'
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
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const updateLinks = args.includes('--update-links');
  
  console.log('\n⚡ JAVASCRIPT MINIFICATION TOOL\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE (no files will be modified)\n');
  }
  
  const assetsDir = path.join(process.cwd(), 'assets');
  
  if (!fs.existsSync(assetsDir)) {
    console.log('❌ Assets directory not found');
    return;
  }
  
  console.log('📂 Scanning for JavaScript files...\n');
  const jsFiles = findJsFiles(assetsDir);
  
  console.log(`Found ${jsFiles.length} JavaScript files to minify\n`);
  
  if (dryRun) {
    console.log('Files to be minified:');
    jsFiles.forEach(f => console.log(`  - ${path.relative(process.cwd(), f)}`));
    console.log('');
    return;
  }
  
  let totalSavings = 0;
  let totalOriginal = 0;
  let totalMinified = 0;
  let processedCount = 0;
  
  for (const jsFile of jsFiles) {
    const result = await minifyJs(jsFile);
    if (result.error) continue;
    
    totalSavings += result.savings;
    totalOriginal += result.originalSize;
    totalMinified += result.minifiedSize;
    processedCount++;
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Minified: ${processedCount} files`);
  console.log(`📊 Original: ${(totalOriginal / 1024).toFixed(1)} KB`);
  console.log(`📦 Minified: ${(totalMinified / 1024).toFixed(1)} KB`);
  console.log(`💾 Savings: ${(totalSavings / 1024).toFixed(1)} KB (${((totalSavings / totalOriginal) * 100).toFixed(1)}%)`);
  console.log(`🗑️  Removed all console.log statements`);
  
  if (updateLinks) {
    console.log('\n📝 Updating HTML files to use minified JS...\n');
    const updatedFiles = updateHtmlLinks(false);
    console.log(`\n✅ Updated ${updatedFiles} HTML files`);
  } else {
    console.log('\n💡 Run with --update-links to update HTML files');
  }
  
  console.log('\n💡 Next steps:');
  console.log('   1. Test minified JS on all pages');
  console.log('   2. Update HTML to reference .min.js files');
  console.log('   3. Commit minified files\n');
}

if (require.main === module) {
  main().catch(err => {
    console.error(`\n❌ Fatal error: ${err.message}\n`);
    process.exit(1);
  });
}

module.exports = { minifyJs, findJsFiles };
