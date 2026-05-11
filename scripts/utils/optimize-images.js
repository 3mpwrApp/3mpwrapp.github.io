#!/usr/bin/env node
/**
 * OPTIMIZE-IMAGES.JS
 * Compresses images and converts to WebP format
 * Requires: sharp (npm install sharp)
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Check if sharp is installed
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  Sharp not installed. Installing...');
  console.log('Run: npm install sharp');
  process.exit(1);
}

/**
 * Optimize and convert image to WebP
 */
async function optimizeImage(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const dir = path.dirname(imagePath);
  const name = path.basename(imagePath, ext);
  const webpPath = path.join(dir, `${name}.webp`);
  
  try {
    // Skip if WebP already exists and is newer
    if (fs.existsSync(webpPath)) {
      const originalStat = fs.statSync(imagePath);
      const webpStat = fs.statSync(webpPath);
      if (webpStat.mtime > originalStat.mtime) {
        console.log(`⏭️  Skipping ${imagePath} (WebP already exists)`);
        return { skipped: true };
      }
    }

    // Get original size
    const originalSize = fs.statSync(imagePath).size;
    
    // Convert to WebP
    await sharp(imagePath)
      .webp({ quality: 80, effort: 6 })
      .toFile(webpPath);
    
    const webpSize = fs.statSync(webpPath).size;
    const savings = originalSize - webpSize;
    const percent = ((savings / originalSize) * 100).toFixed(1);
    
    console.log(`✅ ${imagePath}`);
    console.log(`   Original: ${(originalSize / 1024).toFixed(1)} KB`);
    console.log(`   WebP: ${(webpSize / 1024).toFixed(1)} KB`);
    console.log(`   Savings: ${(savings / 1024).toFixed(1)} KB (${percent}%)`);
    
    // Also optimize the original if it's PNG or JPG
    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      const optimizedPath = path.join(dir, `${name}-optimized${ext}`);
      
      if (ext === '.png') {
        await sharp(imagePath)
          .png({ quality: 80, compressionLevel: 9 })
          .toFile(optimizedPath);
      } else {
        await sharp(imagePath)
          .jpeg({ quality: 80, progressive: true })
          .toFile(optimizedPath);
      }
      
      // Replace original with optimized
      fs.renameSync(optimizedPath, imagePath);
      console.log(`   ✓ Optimized original ${ext.toUpperCase()}`);
    }
    
    return { savings, originalSize, webpSize };
  } catch (err) {
    console.error(`❌ Error optimizing ${imagePath}: ${err.message}`);
    return { error: true };
  }
}

/**
 * Find all images in assets directory
 */
function findImages(dir) {
  const images = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and other large directories
      if (!['node_modules', '.git', '_site', 'public'].includes(entry.name)) {
        images.push(...findImages(fullPath));
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        images.push(fullPath);
      }
    }
  }
  
  return images;
}

/**
 * Main function
 */
async function main() {
  console.log('\n🖼️  IMAGE OPTIMIZATION & WebP CONVERSION\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const assetsDir = path.join(process.cwd(), 'assets');
  
  if (!fs.existsSync(assetsDir)) {
    console.log('❌ Assets directory not found');
    return;
  }
  
  console.log('📂 Scanning for images...\n');
  const images = findImages(assetsDir);
  
  console.log(`Found ${images.length} images to optimize\n`);
  
  let totalSavings = 0;
  let processedCount = 0;
  let skippedCount = 0;
  
  for (const imagePath of images) {
    const result = await optimizeImage(imagePath);
    if (result.skipped) {
      skippedCount++;
    } else if (result.savings) {
      totalSavings += result.savings;
      processedCount++;
    }
    console.log(''); // Blank line between images
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Processed: ${processedCount} images`);
  console.log(`⏭️  Skipped: ${skippedCount} images`);
  console.log(`💾 Total Savings: ${(totalSavings / 1024).toFixed(1)} KB`);
  console.log('\n💡 Next steps:');
  console.log('   1. Update HTML to use <picture> tags with WebP fallback');
  console.log('   2. Test images on all browsers');
  console.log('   3. Commit optimized images\n');
}

if (require.main === module) {
  main().catch(err => {
    console.error(`\n❌ Fatal error: ${err.message}\n`);
    process.exit(1);
  });
}

module.exports = { optimizeImage, findImages };
