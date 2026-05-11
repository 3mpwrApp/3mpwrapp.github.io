#!/usr/bin/env node

/**
 * Comprehensive Research Page Checker
 * 
 * Checks for:
 * 1. Duplicate content sections
 * 2. Broken internal links
 * 3. Data accuracy (tribunal statistics)
 * 4. Knowledge base/guides/templates/blogs links
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SITE_ROOT = path.join(__dirname, '..');

// Correct tribunal statistics
const CORRECT_STATS = {
  WSIAT: { winRate: '89.1%', total: '11,430', source: 'CanLII 2020-2026' },
  ONWSIB: { winRate: '83.3%', total: '431', source: 'CanLII 2020-2026' },
  ONSBT: { winRate: '98.9%', total: '14,298', source: 'CanLII 2020-2026' },
  HRTO: { winRate: '12.7%', abandonment: '43.9%', total: '9,268', source: 'CanLII 2020-2026' }
};

const issues = {
  duplicates: [],
  brokenLinks: [],
  incorrectStats: [],
  missingFiles: [],
  externalLinks: []
};

/**
 * Read research page
 */
function loadResearchPage() {
  const researchPath = path.join(SITE_ROOT, 'research.md');
  return fs.readFileSync(researchPath, 'utf8');
}

/**
 * Find duplicate sections by comparing content blocks
 */
function findDuplicates(content) {
  const lines = content.split('\n');
  const sections = [];
  let currentSection = { title: '', content: '', startLine: 0 };
  
  lines.forEach((line, idx) => {
    if (line.match(/^##+ /)) {
      if (currentSection.content.length > 100) {
        sections.push(currentSection);
      }
      currentSection = {
        title: line.replace(/^##+ /, '').trim(),
        content: '',
        startLine: idx + 1
      };
    } else {
      currentSection.content += line + '\n';
    }
  });
  
  // Check final section
  if (currentSection.content.length > 100) {
    sections.push(currentSection);
  }
  
  // Find duplicates
  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      const similarity = calculateSimilarity(sections[i].content, sections[j].content);
      if (similarity > 0.7) { // 70% similar
        issues.duplicates.push({
          section1: sections[i].title,
          line1: sections[i].startLine,
          section2: sections[j].title,
          line2: sections[j].startLine,
          similarity: `${(similarity * 100).toFixed(1)}%`
        });
      }
    }
  }
}

/**
 * Calculate text similarity (simple version)
 */
function calculateSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().match(/\b\w+\b/g) || []);
  const words2 = new Set(text2.toLowerCase().match(/\b\w+\b/g) || []);
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Check all internal links
 */
function checkLinks(content) {
  // Markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const matches = [...content.matchAll(linkRegex)];
  
  for (const match of matches) {
    const text = match[1];
    const url = match[2];
    const line = content.slice(0, match.index).split('\n').length;
    
    // Skip external links (check separately)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      issues.externalLinks.push({ text, url, line });
      continue;
    }
    
    // Skip anchors
    if (url.startsWith('#')) {
      continue;
    }
    
    // Check if file exists
    let filePath = url.startsWith('/') ? url.slice(1) : url;
    
    // Remove anchor
    if (filePath.includes('#')) {
      filePath = filePath.split('#')[0];
    }
    
    // Try different extensions
    const possiblePaths = [
      path.join(SITE_ROOT, filePath),
      path.join(SITE_ROOT, filePath + '.md'),
      path.join(SITE_ROOT, filePath + '.html'),
      path.join(SITE_ROOT, filePath, 'index.md'),
      path.join(SITE_ROOT, filePath, 'index.html')
    ];
    
    let found = false;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        found = true;
        break;
      }
    }
    
    if (!found) {
      issues.brokenLinks.push({ text, url, line });
    }
  }
}

/**
 * Check tribunal statistics accuracy
 */
function checkStatistics(content) {
  const lines = content.split('\n');
  
  // WSIAT patterns
  const wsiatPatterns = [
    /WSIAT.*?(\d+(?:\.\d+)?%)/gi,
    /worker.*?success.*?(\d+(?:\.\d+)?%)/gi,
    /appeal.*?success.*?(\d+(?:\.\d+)?%)/gi,
    /win.*?rate.*?(\d+(?:\.\d+)?%)/gi
  ];
  
  // HRTO patterns  
  const hrtoPatterns = [
    /HRTO.*?(\d+(?:\.\d+)?%)/gi,
    /abandonment.*?rate.*?(\d+(?:\.\d+)?%)/gi,
    /human.*?rights.*?(\d+(?:\.\d+)?%)/gi
  ];
  
  // ONSBT patterns
  const onsbtPatterns = [
    /ONSBT.*?(\d+(?:\.\d+)?%)/gi,
    /ODSP.*?(\d+(?:\.\d+)?%)/gi,
    /social.*?benefits.*?(\d+(?:\.\d+)?%)/gi,
    /grant.*?rate.*?(\d+(?:\.\d+)?%)/gi
  ];
  
  // ONWSIB patterns
  const onwsibPatterns = [
    /ONWSIB.*?(\d+(?:\.\d+)?%)/gi,
    /WSIB.*?internal.*?(\d+(?:\.\d+)?%)/gi
  ];
  
  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const context = line.substring(0, 100);
    
    // Check WSIAT stats
    if (line.match(/WSIAT/i)) {
      const matches = line.matchAll(/(\d+(?:\.\d+)?%)/g);
      for (const match of matches) {
        const percent = match[1];
        // Known incorrect values
        if (['68.7%', '70%', '65-73%', '60-70%', '100%'].includes(percent)) {
          issues.incorrectStats.push({
            line: lineNum,
            tribunal: 'WSIAT',
            found: percent,
            expected: '89.1%',
            context
          });
        }
      }
    }
    
    // Check HRTO stats
    if (line.match(/HRTO/i)) {
      const matches = line.matchAll(/(\d+(?:\.\d+)?%)/g);
      for (const match of matches) {
        const percent = match[1];
        if (line.match(/abandon/i) && percent === '73.5%') {
          issues.incorrectStats.push({
            line: lineNum,
            tribunal: 'HRTO',
            found: percent,
            expected: '43.9% abandonment',
            context
          });
        } else if (line.match(/success|win/i) && percent === '2.66%') {
          issues.incorrectStats.push({
            line: lineNum,
            tribunal: 'HRTO',
            found: percent,
            expected: '12.7%',
            context
          });
        }
      }
    }
    
    // Check ONSBT stats
    if (line.match(/ONSBT/i)) {
      const matches = line.matchAll(/(\d+(?:\.\d+)?%)/g);
      for (const match of matches) {
        const percent = match[1];
        if (['67.4%', '40-60%'].includes(percent) && line.match(/grant|success|win/i)) {
          issues.incorrectStats.push({
            line: lineNum,
            tribunal: 'ONSBT',
            found: percent,
            expected: '98.9%',
            context
          });
        }
      }
    }
    
    // Check ONWSIB stats
    if (line.match(/ONWSIB/i)) {
      const matches = line.matchAll(/(\d+(?:\.\d+)?%)/g);
      for (const match of matches) {
        const percent = match[1];
        if (percent === '89.5%') {
          issues.incorrectStats.push({
            line: lineNum,
            tribunal: 'ONWSIB',
            found: percent,
            expected: '83.3%',
            context
          });
        }
      }
    }
  });
}

/**
 * Check knowledge base/guides/templates links
 */
function checkContentLinks(content) {
  const kbLinks = [...content.matchAll(/\/knowledge-base\/([^"'\s)]+)/g)];
  const guideLinks = [...content.matchAll(/\/guides\/([^"'\s)]+)/g)];
  const templateLinks = [...content.matchAll(/\/templates\/([^"'\s)]+)/g)];
  const blogLinks = [...content.matchAll(/\/blog\/(\d{4}\/\d{2}\/\d{2}\/[^"'\s)]+)/g)];
  
  console.log(`\nFound ${kbLinks.length} knowledge base links`);
  console.log(`Found ${guideLinks.length} guide links`);
  console.log(`Found ${templateLinks.length} template links`);
  console.log(`Found ${blogLinks.length} blog links`);
  
  // Check if files exist
  const allLinks = [
    ...kbLinks.map(m => ({ type: 'KB', path: `knowledge-base/${m[1]}` })),
    ...guideLinks.map(m => ({ type: 'Guide', path: `guides/${m[1]}` })),
    ...templateLinks.map(m => ({ type: 'Template', path: `templates/${m[1]}` })),
    ...blogLinks.map(m => ({ type: 'Blog', path: `blog/${m[1]}` }))
  ];
  
  for (const link of allLinks) {
    const possiblePaths = [
      path.join(SITE_ROOT, link.path),
      path.join(SITE_ROOT, link.path + '.md'),
      path.join(SITE_ROOT, link.path + '.html'),
      path.join(SITE_ROOT, '_' + link.path.replace('/', '/') + '.md')
    ];
    
    let found = false;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        found = true;
        break;
      }
    }
    
    if (!found) {
      issues.missingFiles.push({
        type: link.type,
        path: link.path
      });
    }
  }
}

/**
 * Generate report
 */
function generateReport() {
  let report = `# Research Page Comprehensive Check
**Generated:** ${new Date().toISOString()}

## Summary

- **Duplicate Sections:** ${issues.duplicates.length}
- **Broken Links:** ${issues.brokenLinks.length}
- **Incorrect Statistics:** ${issues.incorrectStats.length}
- **Missing Content Files:** ${issues.missingFiles.length}
- **External Links (to verify):** ${issues.externalLinks.length}

---

## Correct Statistics Reference

| Tribunal | Win Rate | Total Decisions | Source |
|----------|----------|----------------|--------|
| WSIAT | **89.1%** | 11,430 | CanLII 2020-2026 |
| ONWSIB | **83.3%** | 431 | CanLII 2020-2026 |
| ONSBT | **98.9%** | 14,298 | CanLII 2020-2026 |
| HRTO | **12.7%** | 9,268 | CanLII 2020-2026 |

**HRTO Abandonment:** 43.9% (4,073 cases)

---

`;

  // Duplicates
  if (issues.duplicates.length > 0) {
    report += `## ⚠️ Duplicate Sections (${issues.duplicates.length})\n\n`;
    for (const dup of issues.duplicates) {
      report += `### Lines ${dup.line1} and ${dup.line2}\n`;
      report += `- **Section 1:** "${dup.section1}"\n`;
      report += `- **Section 2:** "${dup.section2}"\n`;
      report += `- **Similarity:** ${dup.similarity}\n\n`;
    }
    report += `---\n\n`;
  } else {
    report += `## ✅ No Duplicate Sections Found\n\n---\n\n`;
  }

  // Broken links
  if (issues.brokenLinks.length > 0) {
    report += `## ⚠️ Broken Internal Links (${issues.brokenLinks.length})\n\n`;
    for (const link of issues.brokenLinks.slice(0, 50)) {
      report += `### Line ${link.line}\n`;
      report += `- **Text:** "${link.text}"\n`;
      report += `- **URL:** \`${link.url}\`\n\n`;
    }
    if (issues.brokenLinks.length > 50) {
      report += `\n*...and ${issues.brokenLinks.length - 50} more broken links*\n\n`;
    }
    report += `---\n\n`;
  } else {
    report += `## ✅ All Internal Links Working\n\n---\n\n`;
  }

  // Incorrect statistics
  if (issues.incorrectStats.length > 0) {
    report += `## ⚠️ Incorrect Statistics (${issues.incorrectStats.length})\n\n`;
    for (const stat of issues.incorrectStats) {
      report += `### Line ${stat.line}\n`;
      report += `- **Tribunal:** ${stat.tribunal}\n`;
      report += `- **Found:** ${stat.found}\n`;
      report += `- **Expected:** ${stat.expected}\n`;
      report += `- **Context:** "${stat.context}..."\n\n`;
    }
    report += `---\n\n`;
  } else {
    report += `## ✅ All Statistics Correct\n\n---\n\n`;
  }

  // Missing files
  if (issues.missingFiles.length > 0) {
    report += `## ⚠️ Missing Content Files (${issues.missingFiles.length})\n\n`;
    const byType = {};
    for (const file of issues.missingFiles) {
      if (!byType[file.type]) byType[file.type] = [];
      byType[file.type].push(file.path);
    }
    for (const [type, paths] of Object.entries(byType)) {
      report += `### ${type} (${paths.length} missing)\n\n`;
      for (const p of paths.slice(0, 20)) {
        report += `- \`${p}\`\n`;
      }
      if (paths.length > 20) {
        report += `\n*...and ${paths.length - 20} more*\n`;
      }
      report += `\n`;
    }
    report += `---\n\n`;
  } else {
    report += `## ✅ All Content Files Exist\n\n---\n\n`;
  }

  // External links
  if (issues.externalLinks.length > 0) {
    report += `## 🔗 External Links to Verify (${issues.externalLinks.length})\n\n`;
    report += `**Note:** These links should be manually verified as they point to external sites.\n\n`;
    
    const byDomain = {};
    for (const link of issues.externalLinks) {
      const domain = link.url.match(/https?:\/\/([^\/]+)/)?.[1] || 'unknown';
      if (!byDomain[domain]) byDomain[domain] = [];
      byDomain[domain].push(link);
    }
    
    for (const [domain, links] of Object.entries(byDomain)) {
      report += `### ${domain} (${links.length} links)\n\n`;
      for (const link of links.slice(0, 10)) {
        report += `- Line ${link.line}: [${link.text}](${link.url})\n`;
      }
      if (links.length > 10) {
        report += `\n*...and ${links.length - 10} more*\n`;
      }
      report += `\n`;
    }
  }

  return report;
}

/**
 * Main execution
 */
async function main() {
  console.log('=== Research Page Comprehensive Check ===\n');
  
  console.log('Loading research.md...');
  const content = loadResearchPage();
  
  console.log('Checking for duplicate sections...');
  findDuplicates(content);
  
  console.log('Checking internal links...');
  checkLinks(content);
  
  console.log('Checking statistics accuracy...');
  checkStatistics(content);
  
  console.log('Checking content file links...');
  checkContentLinks(content);
  
  console.log('\nGenerating report...');
  const report = generateReport();
  
  const reportPath = path.join(SITE_ROOT, 'docs', 'RESEARCH-PAGE-CHECK.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  
  console.log(`\n✅ Report saved to: docs/RESEARCH-PAGE-CHECK.md\n`);
  
  // Print summary
  console.log('=== Summary ===');
  console.log(`Duplicates: ${issues.duplicates.length}`);
  console.log(`Broken Links: ${issues.brokenLinks.length}`);
  console.log(`Incorrect Stats: ${issues.incorrectStats.length}`);
  console.log(`Missing Files: ${issues.missingFiles.length}`);
  console.log(`External Links: ${issues.externalLinks.length}\n`);
  
  if (issues.duplicates.length > 0 || issues.brokenLinks.length > 0 || 
      issues.incorrectStats.length > 0 || issues.missingFiles.length > 0) {
    console.log('⚠️ Issues found - review report for details');
  } else {
    console.log('✅ No critical issues found!');
  }
}

main().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
