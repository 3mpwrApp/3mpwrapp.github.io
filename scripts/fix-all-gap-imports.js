#!/usr/bin/env node
/**
 * Fix all GapView import paths based on file location
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.expo', 'scripts', 'docs'];

let filesFixed = 0;

function getCorrectImportPath(filePath) {
  const relativePath = path.relative(projectRoot, filePath);
  const dirPath = path.dirname(relativePath);
  
  // Count how many levels deep we are from project root
  const depth = dirPath.split(path.sep).length;
  
  // For files in components/, use ./GapView
  if (dirPath.includes('components')) {
    return './GapView';
  }
  
  // For files in app/, calculate relative path
  const upLevels = depth - 1; // -1 because we don't count the file itself
  const upPath = '../'.repeat(upLevels);
  
  return `${upPath}components/GapView`;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Check if file has GapView import
  if (!content.includes('import GapView from')) {
    return false;
  }
  
  const correctPath = getCorrectImportPath(filePath);
  
  // Replace any GapView import with the correct one
  content = content.replace(
    /import GapView from ['"][^'"]+['"];/g,
    `import GapView from '${correctPath}';`
  );
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${path.relative(projectRoot, filePath)} -> '${correctPath}'`);
    return true;
  }
  
  return false;
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!ignoreDirs.includes(entry.name)) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      try {
        if (fixFile(fullPath)) {
          filesFixed++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${fullPath}:`, error.message);
      }
    }
  }
}

console.log('🔧 Fixing all GapView import paths...\n');

scanDirectory(path.join(projectRoot, 'app'));
scanDirectory(path.join(projectRoot, 'components'));

console.log(`\n✅ Fixed ${filesFixed} files`);
