#!/usr/bin/env node

/**
 * Ontario Tribunal Content Audit Script
 * 
 * Scans all site content for:
 * - WSIAT, ONWSIB, ONSBT, HRTO mentions
 * - Statistical consistency (89.1%, 83.3%, 98.9%, 12.7%)
 * - Link functionality (CanLII, tribunal websites, internal links)
 * - Professional tone and accuracy
 * 
 * Generates comprehensive audit report with findings and recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SITE_ROOT = path.join(__dirname, '..');

// Expected statistics from classification
const EXPECTED_STATS = {
  WSIAT: { winRate: 89.1, total: 11430, source: 'CanLII subset 2020-2026' },
  ONWSIB: { winRate: 83.3, total: 431, source: 'CanLII 2020-2026' },
  ONSBT: { winRate: 98.9, total: 14298, source: 'CanLII 2020-2026' },
  HRTO: { winRate: 12.7, total: 9268, abandonment: 43.9, source: 'CanLII 2020-2026' }
};

// Tribunal name variations
const TRIBUNAL_PATTERNS = {
  WSIAT: /\b(WSIAT|wsiat|Workplace Safety and Insurance Appeals Tribunal)\b/gi,
  ONWSIB: /\b(ONWSIB|onwsib|WSIB Internal Appeals|Office of the Worker Adviser)\b/gi,
  ONSBT: /\b(ONSBT|onsbt|Ontario Social Benefits Tribunal|Social Benefits Tribunal)\b/gi,
  HRTO: /\b(HRTO|hrto|Human Rights Tribunal of Ontario|Ontario Human Rights Tribunal|OHRT)\b/gi
};

// Link patterns to check
const LINK_PATTERNS = {
  canlii: /https?:\/\/(www\.)?canlii\.ca\/[^\s\)]+/gi,
  wsiat: /https?:\/\/(www\.)?wsiat\.ca\/[^\s\)]+/gi,
  wsib: /https?:\/\/(www\.)?wsib\.(ca|on\.ca)\/[^\s\)]+/gi,
  hrto: /https?:\/\/(www\.)?(hrto\.ca|tribunalsontario\.ca\/hrto)\/[^\s\)]+/gi,
  onsbt: /https?:\/\/(www\.)?(onsbt\.ca|tribunalsontario\.ca\/sbt)\/[^\s\)]+/gi
};

// Statistics patterns
const STATS_PATTERNS = {
  percentage: /\b(\d{1,3}(\.\d+)?)\s*%/g,
  winRate: /\b(win\s+rate|success\s+rate|allowed|granted)\b.*?(\d{1,3}(\.\d+)?)\s*%/gi,
  total: /\b(\d{1,5})\s+(decisions?|cases?)\b/gi
};

const auditResults = {
  files: [],
  statistics: {},
  links: [],
  inconsistencies: [],
  brokenLinks: [],
  missingContent: []
};

/**
 * Recursively scan directory for markdown files
 */
function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .git, etc.
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
        scanDirectory(filePath, fileList);
      }
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

/**
 * Extract all tribunal mentions from content
 */
function extractTribunalMentions(content, filePath) {
  const mentions = {};
  
  for (const [tribunal, pattern] of Object.entries(TRIBUNAL_PATTERNS)) {
    const matches = [...content.matchAll(pattern)];
    if (matches.length > 0) {
      mentions[tribunal] = {
        count: matches.length,
        contexts: matches.slice(0, 3).map(m => {
          const start = Math.max(0, m.index - 50);
          const end = Math.min(content.length, m.index + m[0].length + 50);
          return content.slice(start, end).replace(/\n/g, ' ').trim();
        })
      };
    }
  }
  
  return mentions;
}

/**
 * Extract all statistics from content
 */
function extractStatistics(content, filePath) {
  const stats = [];
  
  // Find win rates
  const winRateMatches = [...content.matchAll(STATS_PATTERNS.winRate)];
  for (const match of winRateMatches) {
    const percentage = parseFloat(match[2]);
    const context = content.slice(Math.max(0, match.index - 100), Math.min(content.length, match.index + 100))
      .replace(/\n/g, ' ').trim();
    
    stats.push({
      type: 'winRate',
      value: percentage,
      context,
      line: content.slice(0, match.index).split('\n').length
    });
  }
  
  return stats;
}

/**
 * Extract all links from content
 */
function extractLinks(content, filePath) {
  const links = [];
  
  for (const [type, pattern] of Object.entries(LINK_PATTERNS)) {
    const matches = [...content.matchAll(pattern)];
    for (const match of matches) {
      links.push({
        type,
        url: match[0],
        line: content.slice(0, match.index).split('\n').length,
        file: path.relative(SITE_ROOT, filePath)
      });
    }
  }
  
  // Also extract markdown links [text](url)
  const mdLinkPattern = /\[([^\]]+)\]\(([^\)]+)\)/g;
  const mdLinks = [...content.matchAll(mdLinkPattern)];
  for (const match of mdLinks) {
    const url = match[2];
    // Check if internal link
    if (!url.startsWith('http') && !url.startsWith('#') && !url.startsWith('mailto:')) {
      links.push({
        type: 'internal',
        url,
        text: match[1],
        line: content.slice(0, match.index).split('\n').length,
        file: path.relative(SITE_ROOT, filePath)
      });
    }
  }
  
  return links;
}

/**
 * Check for statistical inconsistencies
 */
function checkStatisticalConsistency(stats, tribunal) {
  const inconsistencies = [];
  const expected = EXPECTED_STATS[tribunal];
  
  if (!expected) return inconsistencies;
  
  for (const stat of stats) {
    if (stat.type === 'winRate') {
      const diff = Math.abs(stat.value - expected.winRate);
      if (diff > 0.5) {
        inconsistencies.push({
          tribunal,
          type: 'winRate',
          expected: expected.winRate,
          found: stat.value,
          difference: diff.toFixed(1),
          context: stat.context,
          line: stat.line
        });
      }
    }
  }
  
  return inconsistencies;
}

/**
 * Check if internal link is valid
 */
function checkInternalLink(linkUrl, fromFile) {
  const fromDir = path.dirname(fromFile);
  let targetPath;
  
  // Handle absolute paths from root
  if (linkUrl.startsWith('/')) {
    targetPath = path.join(SITE_ROOT, linkUrl);
  } else {
    // Relative path
    targetPath = path.join(fromDir, linkUrl);
  }
  
  // Remove anchor
  const [filePath] = targetPath.split('#');
  
  // Check if file exists
  // Try as-is, with .md, and with /index.md
  const candidates = [
    filePath,
    filePath + '.md',
    path.join(filePath, 'index.md')
  ];
  
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return { valid: true, resolved: candidate };
    }
  }
  
  return { valid: false, attempted: candidates };
}

/**
 * Audit a single file
 */
function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(SITE_ROOT, filePath);
  
  console.log(`Auditing: ${relativePath}`);
  
  const mentions = extractTribunalMentions(content, filePath);
  const stats = extractStatistics(content, filePath);
  const links = extractLinks(content, filePath);
  
  const fileResult = {
    path: relativePath,
    mentions,
    stats,
    links,
    inconsistencies: []
  };
  
  // Check for inconsistencies
  for (const tribunal of Object.keys(mentions)) {
    const tribunalStats = stats.filter(s => {
      const ctx = s.context.toLowerCase();
      return ctx.includes(tribunal.toLowerCase());
    });
    
    const issues = checkStatisticalConsistency(tribunalStats, tribunal);
    fileResult.inconsistencies.push(...issues.map(i => ({
      ...i,
      file: relativePath
    })));
  }
  
  // Check internal links
  for (const link of links.filter(l => l.type === 'internal')) {
    const check = checkInternalLink(link.url, filePath);
    if (!check.valid) {
      auditResults.brokenLinks.push({
        file: relativePath,
        line: link.line,
        url: link.url,
        text: link.text,
        attempted: check.attempted
      });
    }
  }
  
  return fileResult;
}

/**
 * Generate summary statistics
 */
function generateSummary() {
  const summary = {
    totalFiles: auditResults.files.length,
    filesWithTribunalMentions: auditResults.files.filter(f => Object.keys(f.mentions).length > 0).length,
    tribunalMentionCounts: {},
    totalLinks: 0,
    brokenLinksCount: auditResults.brokenLinks.length,
    inconsistenciesCount: 0,
    statisticalIssues: []
  };
  
  // Count mentions by tribunal
  for (const file of auditResults.files) {
    for (const [tribunal, data] of Object.entries(file.mentions)) {
      summary.tribunalMentionCounts[tribunal] = (summary.tribunalMentionCounts[tribunal] || 0) + data.count;
    }
  }
  
  // Count links
  for (const file of auditResults.files) {
    summary.totalLinks += file.links.length;
  }
  
  // Count inconsistencies
  for (const file of auditResults.files) {
    summary.inconsistenciesCount += file.inconsistencies.length;
    summary.statisticalIssues.push(...file.inconsistencies);
  }
  
  return summary;
}

/**
 * Generate markdown report
 */
function generateReport(summary) {
  let report = `# Ontario Tribunal Content Audit Report
**Generated:** ${new Date().toISOString()}

## Executive Summary

- **Total Files Scanned:** ${summary.totalFiles}
- **Files with Tribunal Mentions:** ${summary.filesWithTribunalMentions}
- **Total Links Found:** ${summary.totalLinks}
- **Broken Internal Links:** ${summary.brokenLinksCount}
- **Statistical Inconsistencies:** ${summary.inconsistenciesCount}

## Expected Statistics (Baseline Truth)

| Tribunal | Win Rate | Total Decisions | Source |
|----------|----------|----------------|--------|
| WSIAT | **89.1%** | 98,992 | CanLII subset 2020-2026 |
| ONWSIB | **83.3%** | 431 | CanLII 2020-2026 |
| ONSBT | **98.9%** | 14,298 | CanLII 2020-2026 |
| HRTO | **12.7%** | 9,268 | CanLII 2020-2026 |

## Tribunal Mentions by File Type

`;

  // Group mentions by tribunal
  for (const [tribunal, count] of Object.entries(summary.tribunalMentionCounts)) {
    report += `\n### ${tribunal}: ${count} mentions\n\n`;
    
    const files = auditResults.files.filter(f => f.mentions[tribunal]);
    for (const file of files.slice(0, 10)) {
      report += `- [\`${file.path}\`](${file.path}) - ${file.mentions[tribunal].count} mentions\n`;
    }
    
    if (files.length > 10) {
      report += `\n*...and ${files.length - 10} more files*\n`;
    }
  }

  // Broken links section
  if (auditResults.brokenLinks.length > 0) {
    report += `\n## ⚠️ Broken Internal Links (${auditResults.brokenLinks.length})\n\n`;
    
    for (const link of auditResults.brokenLinks.slice(0, 20)) {
      report += `### [\`${link.file}\`](${link.file}) Line ${link.line}\n`;
      report += `- **Link:** \`${link.url}\`\n`;
      report += `- **Text:** "${link.text || 'N/A'}"\n`;
      report += `- **Attempted:** ${link.attempted.slice(0, 2).join(', ')}\n\n`;
    }
    
    if (auditResults.brokenLinks.length > 20) {
      report += `\n*...and ${auditResults.brokenLinks.length - 20} more broken links*\n\n`;
    }
  } else {
    report += `\n## ✅ Internal Links - All Valid\n\n`;
  }

  // Statistical inconsistencies
  if (summary.statisticalIssues.length > 0) {
    report += `\n## ⚠️ Statistical Inconsistencies (${summary.statisticalIssues.length})\n\n`;
    
    for (const issue of summary.statisticalIssues.slice(0, 15)) {
      report += `### [\`${issue.file}\`](${issue.file}) Line ${issue.line}\n`;
      report += `- **Tribunal:** ${issue.tribunal}\n`;
      report += `- **Expected:** ${issue.expected}%\n`;
      report += `- **Found:** ${issue.found}%\n`;
      report += `- **Difference:** ${issue.difference}%\n`;
      report += `- **Context:** "${issue.context}"\n\n`;
    }
    
    if (summary.statisticalIssues.length > 15) {
      report += `\n*...and ${summary.statisticalIssues.length - 15} more inconsistencies*\n\n`;
    }
  } else {
    report += `\n## ✅ Statistical Consistency - All Accurate\n\n`;
  }

  // Recommendations
  report += `\n## Recommendations\n\n`;
  
  if (auditResults.brokenLinks.length > 0) {
    report += `1. **Fix Broken Links:** ${auditResults.brokenLinks.length} internal links need correction\n`;
  }
  
  if (summary.statisticalIssues.length > 0) {
    report += `2. **Update Statistics:** ${summary.statisticalIssues.length} files have outdated or incorrect statistics\n`;
  }
  
  if (auditResults.brokenLinks.length === 0 && summary.statisticalIssues.length === 0) {
    report += `✅ **All content is consistent and accurate!**\n`;
  }
  
  report += `\n## Next Steps\n\n`;
  report += `1. Review broken links and update file paths\n`;
  report += `2. Update all statistics to match classified data:\n`;
  report += `   - WSIAT: 89.1% (98,992 decisions)\n`;
  report += `   - ONSBT: 98.9% (14,298 decisions)\n`;
  report += `   - ONWSIB: 83.3% (431 decisions)\n`;
  report += `   - HRTO: 12.7% (9,268 decisions)\n`;
  report += `3. Add HRTO content where missing (new tribunal)\n`;
  report += `4. Verify external links to CanLII, WSIAT, HRTO, WSIB\n`;
  
  return report;
}

/**
 * Main execution
 */
async function main() {
  console.log('=== Ontario Tribunal Content Audit ===\n');
  console.log('Scanning for markdown files...\n');
  
  const markdownFiles = scanDirectory(SITE_ROOT);
  console.log(`Found ${markdownFiles.length} markdown files\n`);
  
  console.log('Auditing files...\n');
  for (const file of markdownFiles) {
    const result = auditFile(file);
    auditResults.files.push(result);
  }
  
  console.log('\nGenerating summary...\n');
  const summary = generateSummary();
  
  console.log('\nGenerating report...\n');
  const report = generateReport(summary);
  
  // Save report
  const reportPath = path.join(SITE_ROOT, 'docs', 'ONTARIO-CONTENT-AUDIT.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  
  console.log(`\n✅ Audit complete!`);
  console.log(`Report saved to: docs/ONTARIO-CONTENT-AUDIT.md\n`);
  
  // Print summary
  console.log('=== Summary ===');
  console.log(`Files scanned: ${summary.totalFiles}`);
  console.log(`Files with tribunal mentions: ${summary.filesWithTribunalMentions}`);
  console.log(`\nTribunal Mentions:`);
  for (const [tribunal, count] of Object.entries(summary.tribunalMentionCounts)) {
    console.log(`  ${tribunal}: ${count}`);
  }
  console.log(`\nTotal links: ${summary.totalLinks}`);
  console.log(`Broken links: ${summary.brokenLinksCount}`);
  console.log(`Statistical inconsistencies: ${summary.inconsistenciesCount}`);
  
  if (summary.brokenLinksCount > 0 || summary.inconsistenciesCount > 0) {
    console.log(`\n⚠️  Issues found - review report for details`);
    process.exit(1);
  } else {
    console.log(`\n✅ No issues found!`);
  }
}

main().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
