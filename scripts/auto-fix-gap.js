#!/usr/bin/env node
/**
 * Automated Gap to GapView Migration Script
 * 
 * This script automatically replaces View components that use gap properties
 * with GapView components and adds the necessary imports.
 * 
 * Usage: node scripts/auto-fix-gap.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const projectRoot = path.join(__dirname, '..');
const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.expo', 'scripts', 'docs'];

let filesModified = 0;
let filesWithErrors = 0;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Skip if file doesn't contain gap usage
  if (!/<View[^>]*style=\{[^}]*gap\s*:/m.test(content) && 
      !/<View[^>]*style=\{\[[^\]]*gap\s*:/m.test(content)) {
    return false;
  }
  
  // Skip if already imports GapView
  if (/import\s+.*GapView.*from/.test(content)) {
    console.log(`⏭️  Skipping ${path.relative(projectRoot, filePath)} (already uses GapView)`);
    return false;
  }
  
  console.log(`\n🔧 Processing: ${path.relative(projectRoot, filePath)}`);
  
  // Step 1: Add GapView import after other local component imports
  const importMatch = content.match(/(import\s+.*?from\s+['"][.\/]+components\/.*?['"];?\n)/);
  if (importMatch) {
    const lastComponentImport = importMatch[0];
    const insertIndex = content.indexOf(lastComponentImport) + lastComponentImport.length;
    content = content.slice(0, insertIndex) + 
              `import GapView from ${filePath.includes('components/') ? '.' : '../components'}/GapView';\n` + 
              content.slice(insertIndex);
    console.log('   ✓ Added GapView import');
  } else {
    // Try to add after View import from react-native
    const reactNativeImport = content.match(/import\s*\{[^}]*View[^}]*\}\s*from\s*['"]react-native['"]/);
    if (reactNativeImport) {
      const rnImportEnd = content.indexOf(reactNativeImport[0]) + reactNativeImport[0].length;
      // Find the end of that line
      const nextNewline = content.indexOf('\n', rnImportEnd);
      content = content.slice(0, nextNewline + 1) + 
                `\nimport GapView from ${filePath.includes('/components/') ? '.' : '../components'}/GapView';\n` + 
                content.slice(nextNewline + 1);
      console.log('   ✓ Added GapView import after react-native');
    } else {
      console.log('   ⚠️  Could not find suitable location for import');
      return false;
    }
  }
  
  // Step 2: Replace <View style={{ ...gap... }}> with <GapView style={{ ...gap... }}>
  // Handle single-line Views
  let replacements = 0;
  content = content.replace(
    /<View(\s+[^>]*)?style=\{(\{[^}]*gap\s*:[^}]*\}|\[[^\]]*\{[^}]*gap\s*:[^}]*\}[^\]]*\])([^>]*)>/g,
    (match, before, style, after) => {
      replacements++;
      return `<GapView${before || ''}style={${style}${after}>`;
    }
  );
  
  // Step 3: Replace corresponding </View> - this is trickier, need to match pairs
  // For now, we'll do a simple count-based replacement in reverse
  const lines = content.split('\n');
  let viewStack = [];
  let replacedClosing = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track GapView opens
    const gapViewOpens = (line.match(/<GapView(?:\s|>)/g) || []).length;
    const gapViewCloses = (line.match(/<\/GapView>/g) || []).length;
    const viewOpens = (line.match(/<View(?:\s|>)/g) || []).length - gapViewOpens;
    const viewCloses = (line.match(/<\/View>/g) || []).length - gapViewCloses;
    
    for (let j = 0; j < gapViewOpens; j++) {
      viewStack.push('GapView');
    }
    
    for (let j = 0; j < viewOpens; j++) {
      viewStack.push('View');
    }
    
    // Process closes
    if (viewCloses > 0 && viewStack.length > 0) {
      let newLine = line;
      for (let j = 0; j < viewCloses; j++) {
        const last = viewStack[viewStack.length - 1];
        if (last === 'GapView') {
          // Replace this View close with GapView close
          newLine = newLine.replace('</View>', '</GapView>');
          replacedClosing++;
          viewStack.pop();
        } else if (last === 'View') {
          viewStack.pop();
        }
      }
      lines[i] = newLine;
    }
    
    // Handle GapView closes
    for (let j = 0; j < gapViewCloses; j++) {
      if (viewStack[viewStack.length - 1] === 'GapView') {
        viewStack.pop();
      }
    }
  }
  
  content = lines.join('\n');
  
  console.log(`   ✓ Replaced ${replacements} <View> with <GapView>`);
  console.log(`   ✓ Replaced ${replacedClosing} </View> with </GapView>`);
  
  if (content !== originalContent) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`   ✅ File updated`);
    } else {
      console.log(`   🔍 [DRY RUN] Would update file`);
    }
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
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      // Skip type definition files
      if (entry.name.endsWith('.d.ts')) continue;
      
      try {
        if (processFile(fullPath)) {
          filesModified++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${fullPath}:`, error.message);
        filesWithErrors++;
      }
    }
  }
}

console.log('🚀 Starting Gap to GapView migration...\n');
if (DRY_RUN) {
  console.log('🔍 DRY RUN MODE - No files will be modified\n');
}

// Scan app directory
console.log('📁 Scanning app/ directory...');
scanDirectory(path.join(projectRoot, 'app'));

// Scan components directory
console.log('\n📁 Scanning components/ directory...');
scanDirectory(path.join(projectRoot, 'components'));

console.log('\n' + '='.repeat(60));
console.log(`✅ Migration complete!`);
console.log(`📊 Files modified: ${filesModified}`);
if (filesWithErrors > 0) {
  console.log(`⚠️  Files with errors: ${filesWithErrors}`);
}
console.log('='.repeat(60));

if (DRY_RUN) {
  console.log('\n💡 Run without --dry-run to apply changes');
} else {
  console.log('\n💡 Run "npm run lint" to check for any issues');
  console.log('💡 Test the app to ensure everything works correctly');
}
