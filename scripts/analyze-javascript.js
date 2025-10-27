#!/usr/bin/env node
/**
 * ANALYZE-JAVASCRIPT.JS
 * Analyzes JavaScript files for unused code and opportunities for optimization
 */

const fs = require('fs');
const path = require('path');

/**
 * Analyze JavaScript file for common issues
 */
function analyzeJsFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues = [];
  const stats = {
    totalLines: lines.length,
    codeLines: 0,
    commentLines: 0,
    blankLines: 0,
    functionCount: 0,
    eventListenerCount: 0,
    domQueryCount: 0,
    consoleLogCount: 0,
    totalSize: Buffer.byteLength(content, 'utf-8'),
  };
  
  let inMultilineComment = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Count blank lines
    if (line === '') {
      stats.blankLines++;
      continue;
    }
    
    // Count comment lines
    if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
      stats.commentLines++;
      continue;
    }
    
    if (line.includes('/*')) inMultilineComment = true;
    if (line.includes('*/')) {
      inMultilineComment = false;
      stats.commentLines++;
      continue;
    }
    if (inMultilineComment) {
      stats.commentLines++;
      continue;
    }
    
    stats.codeLines++;
    
    // Count functions
    if (line.includes('function ') || line.match(/=>\s*{/) || line.match(/:\s*function/)) {
      stats.functionCount++;
    }
    
    // Count event listeners
    if (line.includes('addEventListener') || line.includes('.on(')) {
      stats.eventListenerCount++;
    }
    
    // Count DOM queries
    if (line.includes('querySelector') || line.includes('getElementById') || 
        line.includes('getElementsBy') || line.includes('$')) {
      stats.domQueryCount++;
    }
    
    // Count console.log (should be removed in production)
    if (line.includes('console.log') && !line.startsWith('//')) {
      stats.consoleLogCount++;
      issues.push({
        line: i + 1,
        type: 'console.log',
        message: 'Remove console.log for production',
        code: line.substring(0, 80),
      });
    }
    
    // Check for jQuery (if not needed)
    if (line.includes('jQuery') || line.match(/\$\(/)) {
      issues.push({
        line: i + 1,
        type: 'jquery',
        message: 'Consider vanilla JS instead of jQuery',
        code: line.substring(0, 80),
      });
    }
    
    // Check for large libraries that could be replaced
    if (line.includes('moment.js') || line.includes('moment(')) {
      issues.push({
        line: i + 1,
        type: 'heavy-library',
        message: 'Consider lighter alternative (date-fns, dayjs)',
        code: line.substring(0, 80),
      });
    }
    
    // Check for synchronous XHR
    if (line.includes('XMLHttpRequest') && line.includes('false')) {
      issues.push({
        line: i + 1,
        type: 'sync-xhr',
        message: 'Use async XHR or fetch API',
        code: line.substring(0, 80),
      });
    }
  }
  
  return { stats, issues };
}

/**
 * Find all JavaScript files
 */
function findJsFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', '_site', 'public'].includes(entry.name)) {
        findJsFiles(fullPath, files);
      }
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Main function
 */
function main() {
  console.log('\n⚡ JAVASCRIPT ANALYSIS & OPTIMIZATION REPORT\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const assetsDir = path.join(process.cwd(), 'assets');
  const jsFiles = findJsFiles(assetsDir);
  
  console.log(`Found ${jsFiles.length} JavaScript files\n`);
  
  let totalSize = 0;
  let totalLines = 0;
  let totalIssues = 0;
  const fileReports = [];
  
  for (const filePath of jsFiles) {
    const { stats, issues } = analyzeJsFile(filePath);
    totalSize += stats.totalSize;
    totalLines += stats.totalLines;
    totalIssues += issues.length;
    
    fileReports.push({
      path: path.relative(process.cwd(), filePath),
      stats,
      issues,
    });
  }
  
  // Sort by size (largest first)
  fileReports.sort((a, b) => b.stats.totalSize - a.stats.totalSize);
  
  console.log('📊 FILE SIZE BREAKDOWN\n');
  for (const report of fileReports) {
    const sizeKB = (report.stats.totalSize / 1024).toFixed(1);
    console.log(`${report.path}`);
    console.log(`  Size: ${sizeKB} KB | Lines: ${report.stats.totalLines} | Functions: ${report.stats.functionCount}`);
    
    if (report.issues.length > 0) {
      console.log(`  ⚠️  ${report.issues.length} optimization opportunities`);
    }
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📦 Total Size: ${(totalSize / 1024).toFixed(1)} KB`);
  console.log(`📝 Total Lines: ${totalLines}`);
  console.log(`⚠️  Total Issues: ${totalIssues}\n`);
  
  // Show detailed issues
  if (totalIssues > 0) {
    console.log('🔍 OPTIMIZATION OPPORTUNITIES\n');
    
    for (const report of fileReports) {
      if (report.issues.length > 0) {
        console.log(`\n${report.path}:`);
        
        const issuesByType = {};
        for (const issue of report.issues) {
          if (!issuesByType[issue.type]) {
            issuesByType[issue.type] = [];
          }
          issuesByType[issue.type].push(issue);
        }
        
        for (const [type, issues] of Object.entries(issuesByType)) {
          console.log(`  ${type}: ${issues.length} occurrences`);
          console.log(`    ${issues[0].message}`);
        }
      }
    }
  }
  
  console.log('\n💡 RECOMMENDATIONS\n');
  console.log('1. Minify JavaScript files (use terser or uglify-js)');
  console.log('2. Remove console.log statements');
  console.log('3. Consider code splitting for large files');
  console.log('4. Use tree-shaking to remove unused exports');
  console.log('5. Replace heavy libraries with lighter alternatives');
  console.log('6. Defer non-critical JavaScript\n');
}

if (require.main === module) {
  main();
}

module.exports = { analyzeJsFile, findJsFiles };
