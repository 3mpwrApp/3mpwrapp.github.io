#!/usr/bin/env node

/**
 * Find potential React.Fragment style issues
 * 
 * Searches for patterns that might cause:
 * "Invalid prop `style` supplied to `React.Fragment`"
 */

const fs = require('fs');
const path = require('path');

const glob = require('glob');

// Patterns that might cause issues
const SUSPICIOUS_PATTERNS = [
  // Fragment with style prop
  /<Fragment[^>]*style=/,
  /<React\.Fragment[^>]*style=/,
  
  // Short syntax with potential issues
  /<>\s*<[^>]*style=/,
  
  // Map returning fragment (might have style)
  /\.map\([^)]*\)\s*\(\s*<>/,
  /\.map\([^)]*\)\s*\(\s*<Fragment/,
  
  // Spread on fragment
  /<Fragment[^>]*{\.\.\..*}/,
  /<>[^<]*{\.\.\..*}/,
];

function searchFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  
  SUSPICIOUS_PATTERNS.forEach((pattern, index) => {
    const matches = content.match(new RegExp(pattern, 'g'));
    if (matches) {
      const lines = content.split('\n');
      matches.forEach(match => {
        const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
        issues.push({
          file: filePath,
          line: lineNumber,
          pattern: pattern.toString(),
          match: match.substring(0, 80), // First 80 chars
        });
      });
    }
  });
  
  return issues;
}

function main() {
  const files = glob.sync('**/*.{tsx,jsx}', {
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.expo/**'],
  });
  
  console.log(`🔍 Scanning ${files.length} files for Fragment style issues...\n`);
  
  let totalIssues = 0;
  const allIssues = [];
  
  files.forEach(file => {
    const issues = searchFile(file);
    if (issues.length > 0) {
      allIssues.push(...issues);
      totalIssues += issues.length;
    }
  });
  
  if (totalIssues === 0) {
    console.log('✅ No suspicious patterns found!');
    return;
  }
  
  console.log(`⚠️  Found ${totalIssues} potential issues:\n`);
  
  // Group by file
  const byFile = {};
  allIssues.forEach(issue => {
    if (!byFile[issue.file]) {
      byFile[issue.file] = [];
    }
    byFile[issue.file].push(issue);
  });
  
  Object.entries(byFile).forEach(([file, issues]) => {
    console.log(`\n📄 ${file}`);
    issues.forEach(issue => {
      console.log(`   Line ${issue.line}: ${issue.match}`);
    });
  });
  
  console.log('\n💡 These are potential issues. Manual review required.');
  console.log('\nCommon fixes:');
  console.log('  1. Replace Fragment with View');
  console.log('  2. Move style to child component');
  console.log('  3. Remove Fragment if unnecessary');
}

main();
