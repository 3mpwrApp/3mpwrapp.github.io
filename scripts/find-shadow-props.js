#!/usr/bin/env node

/**
 * Helper script to identify files that need shadow prop migration
 * Lists files with shadow props and suggests fixes
 */

const fs = require('fs');
const path = require('path');

const glob = require('glob');

// Pattern to find shadow props
const SHADOW_PATTERN = /shadowColor\s*:/;

function analyzeShadowProps(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (!SHADOW_PATTERN.test(content)) {
    return null;
  }
  
  // Check if already using createShadow
  const hasCreateShadow = content.includes('createShadow');
  const hasImport = content.includes("from '../utils/shadow'") || 
                    content.includes("from '../../utils/shadow'") ||
                    content.includes("from '../../../utils/shadow'");
  
  // Count instances
  const matches = content.match(/shadowColor\s*:/g) || [];
  const count = matches.length;
  
  // Find line numbers
  const lines = content.split('\n');
  const lineNumbers = [];
  lines.forEach((line, index) => {
    if (SHADOW_PATTERN.test(line)) {
      lineNumbers.push(index + 1);
    }
  });
  
  return {
    file: filePath,
    count,
    lineNumbers,
    hasCreateShadow,
    hasImport,
    status: hasImport && hasCreateShadow ? '✅ Migrated' : '⚠️  Needs migration',
  };
}

function getImportPath(filePath) {
  const depth = filePath.split(path.sep).length - 1;
  return '../'.repeat(depth) + 'utils/shadow';
}

function main() {
  const files = glob.sync('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.expo/**', 'utils/shadow.ts'],
  });
  
  console.log(`🔍 Scanning ${files.length} files for shadow props...\n`);
  
  const results = [];
  
  files.forEach(file => {
    const result = analyzeShadowProps(file);
    if (result) {
      results.push(result);
    }
  });
  
  if (results.length === 0) {
    console.log('✅ No shadow props found or all are migrated!');
    return;
  }
  
  // Separate migrated and pending
  const migrated = results.filter(r => r.status === '✅ Migrated');
  const pending = results.filter(r => r.status === '⚠️  Needs migration');
  
  console.log(`📊 Summary:`);
  console.log(`   Total files with shadows: ${results.length}`);
  console.log(`   ✅ Migrated: ${migrated.length}`);
  console.log(`   ⚠️  Pending: ${pending.length}\n`);
  
  if (pending.length > 0) {
    console.log(`⚠️  Files needing migration:\n`);
    
    pending.forEach((result, index) => {
      console.log(`${index + 1}. ${result.file}`);
      console.log(`   Found ${result.count} shadow prop(s) at line(s): ${result.lineNumbers.join(', ')}`);
      
      if (!result.hasImport) {
        const importPath = getImportPath(result.file);
        console.log(`   📝 Add import: import { createShadow } from '${importPath}';`);
      }
      
      console.log(`   💡 Wrap shadow props with: ...createShadow({ ... })\n`);
    });
    
    console.log(`\n🛠️  Next steps:`);
    console.log(`1. For each file, add the import if missing`);
    console.log(`2. Find the shadow props (shadowColor, shadowOffset, etc.)`);
    console.log(`3. Wrap them in ...createShadow({ })`);
    console.log(`\nExample:`);
    console.log(`  Before:`);
    console.log(`    shadowColor: '#000',`);
    console.log(`    shadowOffset: { width: 0, height: 2 },`);
    console.log(`    shadowOpacity: 0.1,`);
    console.log(`    shadowRadius: 4,`);
    console.log(`    elevation: 2,`);
    console.log(`\n  After:`);
    console.log(`    ...createShadow({`);
    console.log(`      shadowOffset: { width: 0, height: 2 },`);
    console.log(`      shadowOpacity: 0.1,`);
    console.log(`      shadowRadius: 4,`);
    console.log(`      elevation: 2,`);
    console.log(`    }),`);
  }
  
  if (migrated.length > 0) {
    console.log(`\n✅ Already migrated files:`);
    migrated.forEach((result, index) => {
      console.log(`${index + 1}. ${result.file} (${result.count} shadow(s))`);
    });
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeShadowProps };
