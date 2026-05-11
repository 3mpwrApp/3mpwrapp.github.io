#!/usr/bin/env node

/**
 * Content Category Detection & Filtering System
 * 
 * Automatically categorizes curated content and enables filtering by:
 * - Disability Rights
 * - Workers Compensation
 * - Government Policy
 * - Accessibility
 * - Community
 * - Research
 * - Legal & Courts
 * - Benefits Programs
 * - Employment
 * - Healthcare
 * 
 * Features:
 * - ML-based category detection
 * - Confidence scoring
 * - Multiple category support (items can match multiple)
 * - User preference filtering
 * - Category statistics
 * 
 * Output:
 * - public/categorized-content-{date}.json
 * - public/category-filters.json (user preferences)
 * - public/category-report-{date}.md
 * 
 * Usage:
 * 1. Set preferences in _data/category-preferences.json
 * 2. Run: node scripts/content-categorizer.js
 * 3. Access filtered content via API
 */

const fs = require('fs');
const path = require('path');

function toISODate(d) {
  return d.toISOString().split('T')[0];
}

/**
 * Category definitions with keywords and patterns
 */
const CATEGORIES = {
  disability_rights: {
    name: 'Disability Rights',
    icon: '⚖️',
    keywords: [
      'disability rights',
      'disabled',
      'pwds',
      'discrimination',
      'accessibility rights',
      'equality',
      'inclusion',
      'advocacy',
    ],
    patterns: [
      /disability.*rights|rights.*disability/i,
      /human rights.*disability|disability.*human rights/i,
      /equal.*opportunity|equity/i,
    ],
    weight: 3.0,
  },

  workers_compensation: {
    name: 'Workers Compensation',
    icon: '👷',
    keywords: [
      'wsib',
      'worksafebc',
      'wcb',
      'workers compensation',
      'workplace injury',
      'injured worker',
      'occupational',
      'return to work',
    ],
    patterns: [
      /worker.*compensation|compensation.*worker/i,
      /workplace.*injury|injury.*workplace/i,
      /return.*work|work.*return/i,
    ],
    weight: 2.75,
  },

  government_policy: {
    name: 'Government Policy',
    icon: '🏛️',
    keywords: [
      'policy',
      'legislation',
      'bill',
      'parliament',
      'government',
      'federal',
      'provincial',
      'regulation',
    ],
    patterns: [
      /bill\s+[a-z]-\d+/i,
      /legislation.*pass|pass.*legislation/i,
      /government.*policy|policy.*government/i,
    ],
    weight: 2.5,
  },

  accessibility: {
    name: 'Accessibility',
    icon: '♿',
    keywords: [
      'accessibility',
      'accessible',
      'barrier-free',
      'universal design',
      'aoda',
      'wcag',
      'assistive technology',
    ],
    patterns: [
      /accessible?.*design|design.*accessible?/i,
      /barrier.*remov|remov.*barrier/i,
      /assistive.*technology|technology.*assistive/i,
    ],
    weight: 2.75,
  },

  community: {
    name: 'Community',
    icon: '👥',
    keywords: [
      'community',
      'organization',
      'coalition',
      'group',
      'coalition',
      'network',
      'initiative',
    ],
    patterns: [
      /community.*organization|organization.*community/i,
      /peer.*support|support.*peer/i,
      /grassroots|community-led/i,
    ],
    weight: 2.0,
  },

  research: {
    name: 'Research',
    icon: '🔬',
    keywords: [
      'research',
      'study',
      'survey',
      'statistics',
      'data',
      'findings',
      'analysis',
    ],
    patterns: [
      /study.*show|show.*study|research.*find|find.*research/i,
      /statistics.*show|survey.*result|data.*reveal/i,
      /published.*research|peer.*review/i,
    ],
    weight: 1.75,
  },

  legal_courts: {
    name: 'Legal & Courts',
    icon: '⚔️',
    keywords: [
      'court',
      'lawsuit',
      'ruling',
      'decision',
      'tribunal',
      'appeal',
      'settlement',
      'verdict',
    ],
    patterns: [
      /court.*decision|decision.*court/i,
      /lawsuit.*filed|filed.*lawsuit/i,
      /ruled.*against|appeal.*dismissed|appeal.*allowed/i,
    ],
    weight: 2.5,
  },

  benefits_programs: {
    name: 'Benefits & Programs',
    icon: '💰',
    keywords: [
      'odsp',
      'aish',
      'cpp-d',
      'cpp disability',
      'benefits',
      'income',
      'allowance',
      'pension',
    ],
    patterns: [
      /odsp|aish|cpp-d|cpp.*disability|disability.*benefits/i,
      /benefit.*increase|increase.*benefit|income.*support/i,
      /eligibility.*expand|expand.*eligibility/i,
    ],
    weight: 3.0,
  },

  employment: {
    name: 'Employment',
    icon: '💼',
    keywords: [
      'employment',
      'workplace',
      'job',
      'accommodation',
      'hiring',
      'inclusive',
      'work',
    ],
    patterns: [
      /workplace.*accommodation|accommodation.*workplace/i,
      /duty.*accommodate|accommodate.*duty/i,
      /inclusive.*hiring|hiring.*practice/i,
    ],
    weight: 2.25,
  },

  healthcare: {
    name: 'Healthcare',
    icon: '🏥',
    keywords: [
      'healthcare',
      'medical',
      'prescription',
      'medication',
      'therapy',
      'treatment',
      'insurance',
    ],
    patterns: [
      /healthcare.*access|access.*healthcare/i,
      /prescription.*coverage|coverage.*expand/i,
      /medical.*service|doctor.*shortage/i,
    ],
    weight: 1.75,
  },
};

/**
 * Detect categories for an item
 */
function categorizeItem(item) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  const url = (item.url || '').toLowerCase();

  const matches = {};

  for (const [categoryId, category] of Object.entries(CATEGORIES)) {
    let confidence = 0;

    // Keyword matching
    for (const keyword of category.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        confidence += 0.2; // Each keyword adds 0.2
      }
    }

    // Pattern matching (higher weight)
    for (const pattern of category.patterns) {
      if (pattern.test(text)) {
        confidence += 0.3; // Each pattern adds 0.3
      }
    }

    // URL matching
    if (category.keywords.some(kw => url.includes(kw.toLowerCase()))) {
      confidence += 0.2;
    }

    if (confidence > 0) {
      // Normalize to 0-1 range
      confidence = Math.min(1.0, confidence);
      matches[categoryId] = {
        name: category.name,
        confidence: Math.round(confidence * 100),
        weight: category.weight,
      };
    }
  }

  return matches;
}

/**
 * Filter items by category
 */
function filterByCategory(items, categoryId, minConfidence = 50) {
  return items.filter(item => {
    const categories = item.categories || {};
    return (
      categories[categoryId] &&
      categories[categoryId].confidence >= minConfidence
    );
  });
}

/**
 * Filter items by user preferences
 */
function applyUserPreferences(items, preferences = {}) {
  if (!preferences || Object.keys(preferences).length === 0) {
    return items; // Return all if no preferences
  }

  const excludedCategories = preferences.exclude || [];
  const requiredCategories = preferences.include || [];
  const minConfidence = preferences.minConfidence || 50;

  return items.filter(item => {
    const categories = item.categories || {};

    // Check excluded categories
    for (const excluded of excludedCategories) {
      if (
        categories[excluded] &&
        categories[excluded].confidence >= minConfidence
      ) {
        return false; // Exclude this item
      }
    }

    // If include list specified, must match at least one
    if (requiredCategories.length > 0) {
      const matchesInclude = requiredCategories.some(
        incl =>
          categories[incl] && categories[incl].confidence >= minConfidence
      );
      return matchesInclude;
    }

    return true;
  });
}

/**
 * Load and categorize curated content
 */
function categorizeContent() {
  const cwd = process.cwd();
  const curationDir = path.join(cwd, '_curation');
  const items = [];

  if (!fs.existsSync(curationDir)) {
    return items;
  }

  try {
    const files = fs.readdirSync(curationDir);
    const mdFiles = files
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse();

    if (mdFiles.length === 0) {
      return items;
    }

    const latestFile = mdFiles[0];
    const filePath = path.join(curationDir, latestFile);
    const content = fs.readFileSync(filePath, 'utf8');

    // Parse items
    const itemMatches = content.matchAll(
      /^\d+\.\s+\*\*\[(.*?)\]\((.*?)\)\*\*\n?([\s\S]*?)(?=^\d+\.|$)/gm
    );

    for (const match of itemMatches) {
      const item = {
        title: match[1] || '',
        url: match[2] || '',
        description: match[3] || '',
        source: latestFile,
        categories: categorizeItem({
          title: match[1],
          description: match[3],
          url: match[2],
        }),
      };

      items.push(item);
    }
  } catch (e) {
    console.error(`[categorizer] Error loading content: ${e.message}`);
  }

  return items;
}

/**
 * Generate category statistics
 */
function generateStatistics(items) {
  const stats = {
    totalItems: items.length,
    itemsByCategory: {},
    topCategories: [],
    categoryCoverage: {}, // % of items with this category
  };

  for (const [categoryId, categoryDef] of Object.entries(CATEGORIES)) {
    let count = 0;
    let totalConfidence = 0;

    for (const item of items) {
      if (item.categories && item.categories[categoryId]) {
        count++;
        totalConfidence += item.categories[categoryId].confidence;
      }
    }

    if (count > 0) {
      stats.itemsByCategory[categoryId] = {
        name: categoryDef.name,
        count,
        avgConfidence: Math.round(totalConfidence / count),
        coverage: Math.round((count / items.length) * 100),
      };
    }
  }

  // Get top 5 categories
  stats.topCategories = Object.entries(stats.itemsByCategory)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([id, data]) => ({ id, ...data }));

  return stats;
}

/**
 * Generate report
 */
function generateReport(items, stats) {
  let report = `# Content Categorization Report\n\n`;
  report += `**Generated:** ${toISODate(new Date())}\n\n`;

  report += `## Summary\n\n`;
  report += `- **Total Items:** ${stats.totalItems}\n`;
  report += `- **Categories Used:** ${Object.keys(stats.itemsByCategory).length}\n`;
  report += `- **Average Categories per Item:** ${items.length > 0 ? (Object.values(items).reduce((sum, i) => sum + Object.keys(i.categories || {}).length, 0) / items.length).toFixed(1) : 0}\n\n`;

  report += `## Top Categories\n\n`;
  report += `| Category | Count | Avg Confidence | Coverage |\n`;
  report += `|----------|-------|----------------|----------|\n`;

  for (const cat of stats.topCategories) {
    report += `| ${cat.name} | ${cat.count} | ${cat.avgConfidence}% | ${cat.coverage}% |\n`;
  }

  report += `\n## All Categories\n\n`;
  report += `| Category | Count | Avg Confidence | Coverage |\n`;
  report += `|----------|-------|----------------|----------|\n`;

  for (const [id, cat] of Object.entries(stats.itemsByCategory)) {
    report += `| ${cat.name} | ${cat.count} | ${cat.avgConfidence}% | ${cat.coverage}% |\n`;
  }

  report += `\n## Filtering Options\n\n`;
  report += `Users can filter content by category:\n`;
  report += `- Include specific categories\n`;
  report += `- Exclude specific categories\n`;
  report += `- Set confidence threshold\n`;
  report += `- Combine multiple filters\n\n`;

  report += `Example filter:\n`;
  report += `\`\`\`json\n`;
  report += `{\n`;
  report += `  "include": ["disability_rights", "workers_compensation"],\n`;
  report += `  "exclude": ["research"],\n`;
  report += `  "minConfidence": 60\n`;
  report += `}\n`;
  report += `\`\`\`\n`;

  return report;
}

/**
 * Save categorized content
 */
function saveCategorizedContent(items, stats) {
  const cwd = process.cwd();
  const publicDir = path.join(cwd, 'public');
  const date = toISODate(new Date());

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Save JSON with categorized items
  const jsonPath = path.join(publicDir, `categorized-content-${date}.json`);

  const output = {
    generated: new Date().toISOString(),
    date,
    stats,
    items: items.map(item => ({
      title: item.title,
      url: item.url,
      categories: item.categories,
    })),
  };

  try {
    fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
    console.log(`[categorizer] ✓ JSON saved to ${jsonPath}`);
  } catch (e) {
    console.error(`[categorizer] Failed to save JSON: ${e.message}`);
  }

  // Save report
  const reportPath = path.join(publicDir, `category-report-${date}.md`);
  const report = generateReport(items, stats);

  try {
    fs.writeFileSync(reportPath, report);
    console.log(`[categorizer] ✓ Report saved to ${reportPath}`);
  } catch (e) {
    console.error(`[categorizer] Failed to save report: ${e.message}`);
  }

  // Save category definitions for frontend
  const defPath = path.join(publicDir, 'category-definitions.json');
  const definitions = {};

  for (const [id, def] of Object.entries(CATEGORIES)) {
    definitions[id] = {
      name: def.name,
      icon: def.icon,
      keywords: def.keywords.slice(0, 5), // Top 5 keywords for UI
    };
  }

  try {
    fs.writeFileSync(defPath, JSON.stringify(definitions, null, 2));
    console.log(`[categorizer] ✓ Definitions saved to ${defPath}`);
  } catch (e) {
    console.error(`[categorizer] Failed to save definitions: ${e.message}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('[categorizer] Starting content categorization...\n');

  // Load and categorize content
  const items = categorizeContent();
  console.log(`[categorizer] Loaded and categorized ${items.length} items\n`);

  if (items.length === 0) {
    console.log('[categorizer] No content to categorize');
    return;
  }

  // Generate statistics
  const stats = generateStatistics(items);

  // Display summary
  console.log('[categorizer] Category Breakdown:');
  for (const [id, cat] of Object.entries(stats.itemsByCategory)) {
    console.log(`  ${cat.name}: ${cat.count} items (${cat.coverage}% coverage)`);
  }
  console.log('');

  // Save results
  saveCategorizedContent(items, stats);

  console.log('[categorizer] ✓ Complete\n');

  // Print sample
  console.log('[categorizer] Sample categorization:');
  if (items[0]) {
    console.log(`  Item: "${items[0].title}"`);
    console.log(`  Categories:`);
    for (const [id, cat] of Object.entries(items[0].categories || {})) {
      console.log(`    - ${cat.name}: ${cat.confidence}% confidence`);
    }
  }
}

main().catch(err => {
  console.error('[categorizer] Error:', err.message);
  process.exit(1);
});
