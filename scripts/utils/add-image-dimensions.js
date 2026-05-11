#!/usr/bin/env node
/**
 * ADD-IMAGE-DIMENSIONS.JS
 * Adds width and height attributes to images to prevent layout shift
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Common image dimensions (can be expanded)
const IMAGE_DIMENSIONS = {
  'empwrapp-logo.png': { width: 512, height: 512 },
  'favicon.svg': { width: 32, height: 32 },
  // Add more as needed
};

/**
 * Get image dimensions from file or URL
 */
function getImageDimensions(imagePath) {
  // Check if we have predefined dimensions
  const filename = path.basename(imagePath);
  if (IMAGE_DIMENSIONS[filename]) {
    return IMAGE_DIMENSIONS[filename];
  }
  
  // Default fallback
  return { width: 'auto', height: 'auto' };
}

/**
 * Process HTML/Markdown file to add image dimensions
 */
function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Match img tags without width or height
  const imgRegex = /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi;
  
  content = content.replace(imgRegex, (match, before, src, after) => {
    // Check if already has width and height
    const hasWidth = /width=/i.test(before + after);
    const hasHeight = /height=/i.test(before + after);
    
    if (hasWidth && hasHeight) {
      return match; // Already has dimensions
    }
    
    // Get dimensions
    const dimensions = getImageDimensions(src);
    
    // Add missing attributes
    let newAttrs = '';
    if (!hasWidth && dimensions.width) {
      newAttrs += ` width="${dimensions.width}"`;
    }
    if (!hasHeight && dimensions.height) {
      newAttrs += ` height="${dimensions.height}"`;
    }
    
    if (newAttrs) {
      modified = true;
      // Add loading="lazy" if not present and not logo/critical
      const isLazy = !/loading=/i.test(before + after) && 
                     !/logo|favicon|hero|banner/i.test(src);
      if (isLazy) {
        newAttrs += ' loading="lazy"';
      }
      
      return `<img ${before}src="${src}"${newAttrs}${after}>`;
    }
    
    return match;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }
  
  return false;
}

/**
 * Process all layout files
 */
function main() {
  console.log('\n🖼️  Adding Image Dimensions\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const filesToProcess = [
    '_layouts/default.html',
    '_layouts/post.html',
    '_includes/header.html',
    '_includes/footer.html',
    'index.md',
    'about.md',
    'features.md'
  ];
  
  let updatedCount = 0;
  
  for (const file of filesToProcess) {
    const filePath = path.join(process.cwd(), file);
    if (processFile(filePath)) {
      updatedCount++;
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`✅ Updated ${updatedCount} files\n`);
}

if (require.main === module) {
  main();
}

module.exports = { processFile, getImageDimensions };
