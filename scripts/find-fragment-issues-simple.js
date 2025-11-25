#!/usr/bin/env node

/**
 * Find React.Fragment with style prop issues
 * Memory-efficient version - scans files one at a time
 */

const fs = require('fs');
const path = require('path');

// Only match actual Fragment tags with style prop, not <> followed by styled element
const FRAGMENT_STYLE_PATTERN = /<(React\.)?Fragment\s+[^>]*\bstyle\s*=/i;

const dirsToScan = ['app', 'components'];
const excludeDirs = ['node_modules', '.git', '__tests__', 'android', 'ios', 'web', '.expo'];

let filesScanned = 0;
let issuesFound = [];

function shouldScanFile(filePath) {
  const ext = path.extname(filePath);
  return ['.tsx', '.jsx'].includes(ext);
}

function shouldSkipDir(dirName) {
  return excludeDirs.some(exclude => dirName.includes(exclude));
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];

    lines.forEach((line, index) => {
      // Only check lines that actually have Fragment tag with props
      if (FRAGMENT_STYLE_PATTERN.test(line)) {
        issues.push({
          line: index + 1,
          content: line.trim().substring(0, 100),
        });
      }
    });

    if (issues.length > 0) {
      issuesFound.push({
        file: path.relative(process.cwd(), filePath),
        issues,
      });
    }
  } catch (error) {
    // Skip files that can't be read
  }
}

function scanDirectory(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (!shouldSkipDir(entry.name)) {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile() && shouldScanFile(fullPath)) {
        filesScanned++;
        if (filesScanned % 100 === 0) {
          process.stdout.write(`\r🔍 Scanned ${filesScanned} files...`);
        }
        scanFile(fullPath);
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
}

// Main execution
console.log('🔍 Scanning for Fragment style prop issues...\n');

dirsToScan.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    scanDirectory(fullPath);
  }
});

console.log(`\r📊 Scanned ${filesScanned} files\n`);

if (issuesFound.length === 0) {
  console.log('✅ No Fragment style prop issues found!\n');
  console.log('ℹ️  This scans for: <Fragment style=...> or <React.Fragment style=...>');
  console.log('   The short syntax <> cannot have props, so it\'s safe.\n');
  console.log('If you\'re still seeing "Invalid prop `style` supplied to `React.Fragment`",');
  console.log('the issue may be in a dynamic prop spread. Check your browser console for');
  console.log('the exact component causing the error.\n');
} else {
  console.log(`⚠️  Found ${issuesFound.length} file(s) with Fragment style prop:\n`);
  
  issuesFound.forEach(({ file, issues }) => {
    console.log(`\n📄 ${file}`);
    issues.forEach(({ line, content }) => {
      console.log(`   Line ${line}: ${content}`);
    });
  });

  console.log('\n\n💡 Fix required - React.Fragment cannot have a style prop.');
  console.log('\nOptions:');
  console.log('  1. Replace <Fragment> with <View>');
  console.log('  2. Move style to a child element');
  console.log('  3. Wrap children in <View style={...}>...</View>\n');
}
