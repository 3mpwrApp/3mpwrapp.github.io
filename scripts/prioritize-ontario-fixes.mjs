#!/usr/bin/env node

/**
 * Prioritize Ontario Content Fixes
 * 
 * Analyzes audit results and creates prioritized action items:
 * 1. Critical pages (blog posts, guides, knowledge base)
 * 2. Outdated statistics
 * 3. Broken links
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SITE_ROOT = path.join(__dirname, '..');

// Read audit report
const auditPath = path.join(SITE_ROOT, 'docs', 'ONTARIO-CONTENT-AUDIT.md');
const auditReport = fs.readFileSync(auditPath, 'utf8');

// Priority levels for different content types
const CONTENT_PRIORITIES = {
  'blog/': { priority: 1, label: 'Blog Post (Public)' },
  'guides/': { priority: 1, label: 'User Guide (Public)' },
  'knowledge-base/': { priority: 1, label: 'Knowledge Base (Public)' },
  'data/knowledge-base/': { priority: 1, label: 'KB Data (Public)' },
  'data/appeal-templates/': { priority: 2, label: 'Appeal Template' },
  'research/': { priority: 2, label: 'Research Page' },
  '_posts/': { priority: 1, label: 'Blog Post (Public)' },
  '_knowledge_base/': { priority: 1, label: 'Knowledge Base (Public)' },
  'docs/': { priority: 3, label: 'Internal Documentation' },
  'content-queue/': { priority: 4, label: 'Draft Content' }
};

/**
 * Determine content priority
 */
function getPriority(filePath) {
  for (const [pattern, info] of Object.entries(CONTENT_PRIORITIES)) {
    if (filePath.includes(pattern)) {
      return info;
    }
  }
  return { priority: 5, label: 'Other' };
}

/**
 * Extract statistical inconsistencies from audit
 */
function extractInconsistencies() {
  const inconsistencies = [];
  const lines = auditReport.split('\n');
  
  let currentFile = null;
  let currentLine = null;
  let currentTribunal = null;
  let expected = null;
  let found = null;
  
  for (const line of lines) {
    if (line.startsWith('### [`')) {
      const match = line.match(/\[`([^`]+)`\].*Line (\d+)/);
      if (match) {
        currentFile = match[1];
        currentLine = match[2];
      }
    } else if (line.startsWith('- **Tribunal:**')) {
      currentTribunal = line.split('**Tribunal:**')[1].trim();
    } else if (line.startsWith('- **Expected:**')) {
      expected = line.split('**Expected:**')[1].trim();
    } else if (line.startsWith('- **Found:**')) {
      found = line.split('**Found:**')[1].trim();
      
      // We have a complete inconsistency
      if (currentFile && currentTribunal && expected && found) {
        const priority = getPriority(currentFile);
        inconsistencies.push({
          file: currentFile,
          line: currentLine,
          tribunal: currentTribunal,
          expected,
          found,
          priority: priority.priority,
          type: priority.label
        });
        
        // Reset
        currentTribunal = null;
        expected = null;
        found = null;
      }
    }
  }
  
  return inconsistencies;
}

/**
 * Extract broken links from audit
 */
function extractBrokenLinks() {
  const brokenLinks = [];
  const lines = auditReport.split('\n');
  
  let currentFile = null;
  let currentLine = null;
  let linkUrl = null;
  let linkText = null;
  
  for (const line of lines) {
    if (line.startsWith('### [`') && line.includes('Line')) {
      const match = line.match(/\[`([^`]+)`\].*Line (\d+)/);
      if (match) {
        currentFile = match[1];
        currentLine = match[2];
      }
    } else if (line.startsWith('- **Link:**')) {
      linkUrl = line.split('**Link:**')[1].trim().replace(/`/g, '');
    } else if (line.startsWith('- **Text:**')) {
      linkText = line.split('**Text:**')[1].trim().replace(/"/g, '');
      
      // Complete broken link
      if (currentFile && linkUrl) {
        const priority = getPriority(currentFile);
        brokenLinks.push({
          file: currentFile,
          line: currentLine,
          url: linkUrl,
          text: linkText,
          priority: priority.priority,
          type: priority.label
        });
        
        // Reset
        linkUrl = null;
        linkText = null;
      }
    }
  }
  
  return brokenLinks;
}

/**
 * Generate prioritized action plan
 */
function generateActionPlan(inconsistencies, brokenLinks) {
  // Sort by priority
  inconsistencies.sort((a, b) => a.priority - b.priority);
  brokenLinks.sort((a, b) => a.priority - b.priority);
  
  let plan = `# Ontario Content Fix Action Plan
**Generated:** ${new Date().toISOString()}

## Priority Levels

1. **Critical** - Public-facing content (blogs, guides, knowledge base)
2. **High** - Templates and research pages
3. **Medium** - Internal documentation
4. **Low** - Draft content

## Summary

- **Statistical Inconsistencies:** ${inconsistencies.length} total
  - Priority 1 (Critical): ${inconsistencies.filter(i => i.priority === 1).length}
  - Priority 2 (High): ${inconsistencies.filter(i => i.priority === 2).length}
  - Priority 3 (Medium): ${inconsistencies.filter(i => i.priority === 3).length}
  - Priority 4+ (Low): ${inconsistencies.filter(i => i.priority >= 4).length}

- **Broken Links:** ${brokenLinks.length} total
  - Priority 1 (Critical): ${brokenLinks.filter(l => l.priority === 1).length}
  - Priority 2 (High): ${brokenLinks.filter(l => l.priority === 2).length}
  - Priority 3 (Medium): ${brokenLinks.filter(l => l.priority === 3).length}
  - Priority 4+ (Low): ${brokenLinks.filter(l => l.priority >= 4).length}

---

## Phase 1: Critical Statistics Fixes (Priority 1)

`;

  // Priority 1 statistics
  const p1Stats = inconsistencies.filter(i => i.priority === 1);
  for (const item of p1Stats.slice(0, 30)) {
    plan += `### ${item.file}\n`;
    plan += `- **Line:** ${item.line}\n`;
    plan += `- **Tribunal:** ${item.tribunal}\n`;
    plan += `- **Current:** ${item.found}\n`;
    plan += `- **Correct:** ${item.expected}\n`;
    plan += `- **Type:** ${item.type}\n\n`;
  }
  
  if (p1Stats.length > 30) {
    plan += `\n*...and ${p1Stats.length - 30} more Priority 1 statistics to fix*\n\n`;
  }

  plan += `\n---\n\n## Phase 2: Critical Broken Links (Priority 1)\n\n`;
  
  // Priority 1 broken links - group by link pattern
  const p1Links = brokenLinks.filter(l => l.priority === 1);
  const linkGroups = {};
  
  for (const link of p1Links) {
    const pattern = link.url.split('/')[1] || link.url;
    if (!linkGroups[pattern]) {
      linkGroups[pattern] = [];
    }
    linkGroups[pattern].push(link);
  }
  
  for (const [pattern, links] of Object.entries(linkGroups).slice(0, 20)) {
    plan += `### Pattern: \`${pattern}\` (${links.length} occurrences)\n\n`;
    for (const link of links.slice(0, 5)) {
      plan += `- [\`${link.file}\`](${link.file}) Line ${link.line}: \`${link.url}\`\n`;
    }
    if (links.length > 5) {
      plan += `- *...and ${links.length - 5} more files*\n`;
    }
    plan += `\n`;
  }

  plan += `\n---\n\n## Phase 3: High Priority Statistics (Priority 2)\n\n`;
  
  const p2Stats = inconsistencies.filter(i => i.priority === 2);
  plan += `**Total:** ${p2Stats.length} files\n\n`;
  
  for (const item of p2Stats.slice(0, 10)) {
    plan += `- [\`${item.file}\`](${item.file}) Line ${item.line}: ${item.tribunal} ${item.found} → ${item.expected}\n`;
  }
  
  if (p2Stats.length > 10) {
    plan += `\n*...and ${p2Stats.length - 10} more*\n`;
  }

  plan += `\n---\n\n## Phase 4: High Priority Links (Priority 2)\n\n`;
  
  const p2Links = brokenLinks.filter(l => l.priority === 2);
  plan += `**Total:** ${p2Links.length} files\n\n`;
  
  for (const link of p2Links.slice(0, 10)) {
    plan += `- [\`${link.file}\`](${link.file}) Line ${link.line}: \`${link.url}\`\n`;
  }
  
  if (p2Links.length > 10) {
    plan += `\n*...and ${p2Links.length - 10} more*\n`;
  }

  plan += `\n---\n\n## Quick Wins (Automated Fixes)\n\n`;
  plan += `These can be fixed automatically with search/replace:\n\n`;
  plan += `1. **WSIAT 69% → 89.1%** (${inconsistencies.filter(i => i.found.includes('69%')).length} occurrences)\n`;
  plan += `2. **WSIAT 70% → 89.1%** (${inconsistencies.filter(i => i.found.includes('70%')).length} occurrences)\n`;
  plan += `3. **ONSBT 40-60% → 98.9%** (${inconsistencies.filter(i => i.found.includes('40') || i.found.includes('60')).length} occurrences)\n`;
  plan += `4. **HRTO 2.66% → 12.7%** (${inconsistencies.filter(i => i.found.includes('2.66')).length} occurrences)\n\n`;
  
  plan += `## Recommended Workflow\n\n`;
  plan += `1. **Phase 1:** Fix critical statistics in public-facing content (30 files)\n`;
  plan += `2. **Phase 2:** Fix critical broken links in public-facing content\n`;
  plan += `3. **Phase 3:** Review and fix high-priority content\n`;
  plan += `4. **Phase 4:** Automated cleanup of remaining issues\n\n`;
  
  plan += `## Tools\n\n`;
  plan += `- **Manual editing:** For nuanced corrections in blog posts/guides\n`;
  plan += `- **Search/replace:** For consistent statistics (69% → 89.1%)\n`;
  plan += `- **Link checker:** Verify CanLII, WSIAT, HRTO external links\n`;
  
  return plan;
}

/**
 * Main execution
 */
async function main() {
  console.log('=== Ontario Content Fix Prioritization ===\n');
  
  console.log('Analyzing audit report...\n');
  const inconsistencies = extractInconsistencies();
  const brokenLinks = extractBrokenLinks();
  
  console.log(`Found ${inconsistencies.length} statistical inconsistencies`);
  console.log(`Found ${brokenLinks.length} broken links\n`);
  
  console.log('Generating action plan...\n');
  const plan = generateActionPlan(inconsistencies, brokenLinks);
  
  const planPath = path.join(SITE_ROOT, 'docs', 'ONTARIO-FIX-ACTION-PLAN.md');
  fs.writeFileSync(planPath, plan, 'utf8');
  
  console.log(`✅ Action plan saved to: docs/ONTARIO-FIX-ACTION-PLAN.md\n`);
  
  // Print summary
  console.log('=== Priority Summary ===\n');
  console.log('Statistical Inconsistencies:');
  console.log(`  Priority 1 (Critical): ${inconsistencies.filter(i => i.priority === 1).length}`);
  console.log(`  Priority 2 (High): ${inconsistencies.filter(i => i.priority === 2).length}`);
  console.log(`  Priority 3+ (Lower): ${inconsistencies.filter(i => i.priority >= 3).length}\n`);
  
  console.log('Broken Links:');
  console.log(`  Priority 1 (Critical): ${brokenLinks.filter(l => l.priority === 1).length}`);
  console.log(`  Priority 2 (High): ${brokenLinks.filter(l => l.priority === 2).length}`);
  console.log(`  Priority 3+ (Lower): ${brokenLinks.filter(l => l.priority >= 3).length}\n`);
  
  console.log('Recommended next steps:');
  console.log('1. Review docs/ONTARIO-FIX-ACTION-PLAN.md');
  console.log('2. Start with Phase 1 (critical statistics)');
  console.log('3. Address Phase 2 (critical broken links)');
  console.log('4. Use automated fixes for quick wins');
}

main().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
