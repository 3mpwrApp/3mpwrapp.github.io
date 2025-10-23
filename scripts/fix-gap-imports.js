#!/usr/bin/env node
/**
 * Fix incorrect GapView imports
 * Corrects the import paths that were generated incorrectly
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.expo', 'scripts', 'docs'];

let filesFixed = 0;

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Fix incorrect import: import GapView from ../components/GapView';
  // Should be: import GapView from '../../components/GapView';
  content = content.replace(
    /import GapView from \.\.\/components\/GapView';/g,
    "import GapView from '../../components/GapView';"
  );
  
  // Also fix the variation without starting quote
  content = content.replace(
    /import GapView from \.\.components\/GapView';/g,
    "import GapView from '../../components/GapView';"
  );
  
  // For components directory, should be ./GapView
  if (filePath.includes(path.sep + 'components' + path.sep)) {
    content = content.replace(
      /import GapView from ['"]\.\.\/components\/GapView['"];/g,
      "import GapView from './GapView';"
    );
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${path.relative(projectRoot, filePath)}`);
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

console.log('🔧 Fixing incorrect GapView imports...\n');

scanDirectory(path.join(projectRoot, 'app'));
scanDirectory(path.join(projectRoot, 'components'));

console.log(`\n✅ Fixed ${filesFixed} files`);
