#!/usr/bin/env node

/**
 * Copy _routes.json to dist directory for Cloudflare Pages deployment
 * 
 * Cloudflare Pages needs _routes.json in the build output root (dist/)
 * to configure routing and exclude OAuth callback from Functions.
 * 
 * Run this after `expo export:web` to ensure proper deployment.
 */

const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '..', 'public', '_routes.json');
const destFile = path.join(__dirname, '..', 'dist', '_routes.json');

try {
  // Check if source file exists
  if (!fs.existsSync(sourceFile)) {
    console.error('❌ Source file not found:', sourceFile);
    process.exit(1);
  }

  // Ensure dist directory exists
  const distDir = path.dirname(destFile);
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log('✅ Created dist directory:', distDir);
  }

  // Copy the file
  fs.copyFileSync(sourceFile, destFile);
  console.log('✅ Copied _routes.json to dist/');
  console.log(`   From: ${sourceFile}`);
  console.log(`   To:   ${destFile}`);

  // Verify the copy
  const content = fs.readFileSync(destFile, 'utf8');
  const config = JSON.parse(content);
  console.log('✅ Verified _routes.json configuration:');
  console.log('   Excluded routes:', config.exclude);
  console.log('   Included routes:', config.include);
} catch (error) {
  console.error('❌ Error copying _routes.json:', error.message);
  process.exit(1);
}
