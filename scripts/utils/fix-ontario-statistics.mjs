#!/usr/bin/env node

/**
 * Fix Ontario Tribunal Statistics Across All Content
 * 
 * Updates outdated statistics to match classified data:
 * - WSIAT: 89.1% (was 69%, 70%, 100%)
 * - ONSBT: 98.9% (was 40-60%)
 * - ONWSIB: 83.3% (was 100%)
 * - HRTO: 12.7% with 43.9% abandonment (was 2.66%)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SITE_ROOT = path.join(__dirname, '..');

// Correct statistics
const CORRECT_STATS = {
  WSIAT: {
    winRate: '89.1%',
    total: '98,992',
    source: 'CanLII subset 2020-2026',
    context: 'workplace injury appeals'
  },
  ONWSIB: {
    winRate: '83.3%',
    total: '431',
    source: 'CanLII 2020-2026',
    context: 'WSIB internal appeals'
  },
  ONSBT: {
    winRate: '98.9%',
    total: '14,298',
    source: 'CanLII 2020-2026',
    context: 'social benefits appeals (ODSP/OW)'
  },
  HRTO: {
    winRate: '12.7%',
    abandonment: '43.9%',
    total: '9,268',
    source: 'CanLII 2020-2026',
    context: 'human rights claims'
  }
};

// Patterns to fix (old → new)
const STAT_REPLACEMENTS = [
  // WSIAT corrections
  { pattern: /WSIAT.*?(\d{2,3})%.*?success/gi, replacement: (match) => {
    const num = match.match(/(\d{2,3})%/)?.[1];
    if (num && parseInt(num) < 89) {
      return match.replace(/\d{2,3}%/, '89.1%');
    }
    return match;
  }},
  { pattern: /WSIAT.*?69%/gi, replacement: (match) => match.replace('69%', '89.1%') },
  { pattern: /WSIAT.*?70%/gi, replacement: (match) => match.replace('70%', '89.1%') },
  { pattern: /WSIAT.*?65-73%/gi, replacement: (match) => match.replace('65-73%', '~89%') },
  { pattern: /WSIAT.*?60-70%/gi, replacement: (match) => match.replace('60-70%', '~89%') },
  
  // ONSBT corrections
  { pattern: /ONSBT.*?40-60%/gi, replacement: (match) => match.replace('40-60%', '98.9%') },
  { pattern: /ONSBT success rate.*?Unknown/gi, replacement: (match) => match.replace('Unknown', '98.9%') },
  
  // HRTO corrections
  { pattern: /HRTO.*?2\.66%/gi, replacement: (match) => match.replace('2.66%', '12.7%') },
  { pattern: /HRTO.*?73\.5%.*?abandonment/gi, replacement: (match) => match.replace('73.5%', '43.9%') },
  
  // Cross-tribunal comparisons
  { pattern: /WSIAT has.*?26x.*?higher.*?HRTO/gi, replacement: 'WSIAT has 7x higher success rate than HRTO (89.1% vs 12.7%)' },
  { pattern: /HRTO.*?88x.*?worse.*?WSIAT/gi, replacement: 'HRTO success rate is 87% lower than WSIAT (12.7% vs 89.1%)' }
];

const fixes = [];

/**
 * Fix statistics in a file
 */
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let changeCount = 0;
  
  // Apply replacements
  for (const { pattern, replacement } of STAT_REPLACEMENTS) {
    const matches = [...content.matchAll(pattern)];
    
    for (const match of matches) {
      const oldText = match[0];
      const newText = typeof replacement === 'function' ? replacement(oldText) : replacement;
      
      if (oldText !== newText) {
        content = content.replace(oldText, newText);
        changeCount++;
        
        fixes.push({
          file: path.relative(SITE_ROOT, filePath),
          line: originalContent.slice(0, match.index).split('\n').length,
          old: oldText,
          new: newText
        });
      }
    }
  }
  
  // Write back if changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return changeCount;
  }
  
  return 0;
}

/**
 * Recursively scan and fix files
 */
function scanAndFix(dir) {
  const files = fs.readdirSync(dir);
  let totalChanges = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
        totalChanges += scanAndFix(filePath);
      }
    } else if (file.endsWith('.md')) {
      const changes = fixFile(filePath);
      totalChanges += changes;
    }
  }
  
  return totalChanges;
}

/**
 * Generate fix report
 */
function generateReport() {
  let report = `# Ontario Statistics Fix Report
**Generated:** ${new Date().toISOString()}
**Total Changes:** ${fixes.length}

## Correct Statistics (Reference)

| Tribunal | Win Rate | Total Decisions | Source |
|----------|----------|----------------|--------|
| WSIAT | 89.1% | 98,992 | CanLII subset 2020-2026 |
| ONWSIB | 83.3% | 431 | CanLII 2020-2026 |
| ONSBT | 98.9% | 14,298 | CanLII 2020-2026 |
| HRTO | 12.7% | 9,268 | CanLII 2020-2026 |

## Changes Made

`;

  // Group by file
  const fileGroups = {};
  for (const fix of fixes) {
    if (!fileGroups[fix.file]) {
      fileGroups[fix.file] = [];
    }
    fileGroups[fix.file].push(fix);
  }
  
  for (const [file, fileFixes] of Object.entries(fileGroups)) {
    report += `\n### [\`${file}\`](${file})\n\n`;
    
    for (const fix of fileFixes) {
      report += `**Line ${fix.line}:**\n`;
      report += `- ❌ Old: \`${fix.old}\`\n`;
      report += `- ✅ New: \`${fix.new}\`\n\n`;
    }
  }
  
  return report;
}

/**
 * Main execution
 */
async function main() {
  console.log('=== Ontario Statistics Fix ===\n');
  console.log('Scanning and fixing statistics...\n');
  
  const totalChanges = scanAndFix(SITE_ROOT);
  
  console.log(`\n✅ Fixed ${totalChanges} statistics across ${Object.keys(fixes.reduce((acc, f) => ({ ...acc, [f.file]: true }), {})).length} files\n`);
  
  if (fixes.length > 0) {
    const report = generateReport();
    const reportPath = path.join(SITE_ROOT, 'docs', 'ONTARIO-STATISTICS-FIXES.md');
    fs.writeFileSync(reportPath, report, 'utf8');
    
    console.log(`Report saved to: docs/ONTARIO-STATISTICS-FIXES.md\n`);
    
    // Print summary
    console.log('=== Fixed Statistics ===');
    const fileCount = Object.keys(fixes.reduce((acc, f) => ({ ...acc, [f.file]: true }), {})).length;
    console.log(`Files updated: ${fileCount}`);
    console.log(`Total replacements: ${fixes.length}\n`);
    
    // Show first few fixes
    console.log('Sample fixes:');
    for (const fix of fixes.slice(0, 5)) {
      console.log(`\n${fix.file} (line ${fix.line}):`);
      console.log(`  ❌ ${fix.old.substring(0, 60)}${fix.old.length > 60 ? '...' : ''}`);
      console.log(`  ✅ ${fix.new.substring(0, 60)}${fix.new.length > 60 ? '...' : ''}`);
    }
    
    if (fixes.length > 5) {
      console.log(`\n...and ${fixes.length - 5} more fixes (see report)`);
    }
  } else {
    console.log('✅ All statistics are already correct!');
  }
}

main().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
