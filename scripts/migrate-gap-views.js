/**
 * Migration Script: Replace View with GapView where gap is used
 * 
 * This script identifies all View components that use gap/rowGap/columnGap
 * and shows where they need to be replaced with GapView.
 * 
 * Run: node scripts/migrate-gap-views.js
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.expo'];

// Regex to find View components with gap in inline styles
const gapPatterns = [
  /style=\{\{[^}]*gap\s*:/g,
  /style=\{\{[^}]*rowGap\s*:/g,
  /style=\{\{[^}]*columnGap\s*:/g,
  /style=\{\[[^\]]*\{[^}]*gap\s*:/g,
];

const results = [];

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!ignoreDirs.includes(entry.name)) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let hasGap = false;
  const matchedLines = [];
  
  lines.forEach((line, index) => {
    for (const pattern of gapPatterns) {
      if (pattern.test(line)) {
        hasGap = true;
        matchedLines.push({
          line: index + 1,
          content: line.trim(),
        });
      }
    }
  });
  
  if (hasGap) {
    const relativePath = path.relative(projectRoot, filePath);
    results.push({
      file: relativePath,
      matches: matchedLines,
    });
  }
}

console.log('🔍 Scanning for View components with gap properties...\n');

scanDirectory(path.join(projectRoot, 'app'));
scanDirectory(path.join(projectRoot, 'components'));

console.log(`📊 Found ${results.length} files with gap usage:\n`);

results.forEach(result => {
  console.log(`📄 ${result.file}`);
  console.log(`   ${result.matches.length} occurrence(s):`);
  result.matches.forEach(match => {
    console.log(`   Line ${match.line}: ${match.content.substring(0, 80)}${match.content.length > 80 ? '...' : ''}`);
  });
  console.log('');
});

console.log('\n📝 Migration Steps:');
console.log('1. Import GapView: import GapView from "@/components/GapView" (or relative path)');
console.log('2. Replace <View style={{ gap: X }}> with <GapView style={{ gap: X }}>');
console.log('3. Keep all other props the same');
console.log('4. No need to change the gap property - GapView handles it automatically\n');

console.log('💡 Tip: GapView is a drop-in replacement for View when using gap properties.');
console.log('   It automatically converts gap to margins for React Native Web compatibility.\n');
