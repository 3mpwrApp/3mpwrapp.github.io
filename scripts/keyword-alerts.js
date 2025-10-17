#!/usr/bin/env node

/**
 * Keyword Alerts System
 * 
 * Monitors curated content for user-selected keywords and generates alerts.
 * Users can subscribe to alerts for specific topics.
 * 
 * Features:
 * - Customizable keyword lists
 * - Multiple alert sources
 * - Alert history tracking
 * - Email-ready alert summaries
 * - JSON API for integrations
 * 
 * Output:
 * - public/keyword-alerts-{date}.json (current alerts)
 * - public/keyword-alerts-history.json (all alerts)
 * - public/keyword-alerts-summary-{date}.md (human-readable)
 * 
 * Usage:
 * 1. Update userAlerts in _data/keyword-alerts.json
 * 2. Run: node scripts/keyword-alerts.js
 * 3. Check public/keyword-alerts-*.json for results
 * 
 * Subscribe to alerts:
 * Visit /alerts or /contact to set up custom keyword subscriptions
 */

const fs = require('fs');
const path = require('path');

function toISODate(d) {
  return d.toISOString().split('T')[0];
}

/**
 * Default keyword alert categories
 */
const DEFAULT_ALERTS = {
  odsp: {
    name: 'ODSP Updates',
    keywords: [
      'odsp',
      'ontario disability support program',
      'disability support',
    ],
    priority: 'HIGH',
    description:
      'News and updates about Ontario Disability Support Program (ODSP)',
  },

  wsib: {
    name: 'Workers Compensation',
    keywords: [
      'wsib',
      'worksafebc',
      'wcb',
      'workers compensation',
      'workplace injury',
      'injured worker',
    ],
    priority: 'HIGH',
    description: 'News about workers compensation boards (WSIB, WCB, etc.)',
  },

  cpp_d: {
    name: 'CPP-D Updates',
    keywords: [
      'cpp-d',
      'cpp disability',
      'canada pension plan disability',
      'disability benefit',
    ],
    priority: 'HIGH',
    description:
      'News about Canada Pension Plan - Disability (CPP-D) benefits',
  },

  accessibility: {
    name: 'Accessibility News',
    keywords: [
      'accessibility',
      'accessible',
      'barrier-free',
      'universal design',
      'aoda',
      'accessible canada act',
    ],
    priority: 'MEDIUM',
    description: 'General accessibility news and policy updates',
  },

  legal: {
    name: 'Legal & Rights',
    keywords: [
      'human rights',
      'discrimination',
      'court decision',
      'legal challenge',
      'ruling',
      'tribunal',
    ],
    priority: 'HIGH',
    description: 'Legal decisions and human rights updates',
  },

  mental_health: {
    name: 'Mental Health',
    keywords: [
      'mental health',
      'mental illness',
      'ptsd',
      'depression',
      'anxiety',
      'psychiatric',
    ],
    priority: 'MEDIUM',
    description: 'Mental health and mental illness news',
  },

  employment: {
    name: 'Employment & Accommodation',
    keywords: [
      'workplace accommodation',
      'employment',
      'job',
      'accessible workplace',
      'inclusive hiring',
      'duty to accommodate',
    ],
    priority: 'MEDIUM',
    description: 'Workplace accessibility and employment news',
  },

  assistive_tech: {
    name: 'Assistive Technology',
    keywords: [
      'assistive technology',
      'screen reader',
      'speech recognition',
      'switch control',
      'screen magnifier',
      'accessibility features',
    ],
    priority: 'LOW',
    description: 'Assistive technology news and updates',
  },

  housing: {
    name: 'Housing & Accessibility',
    keywords: [
      'accessible housing',
      'housing accommodation',
      'wheelchair accessible',
      'housing policy',
      'rent assistance',
    ],
    priority: 'MEDIUM',
    description: 'Accessible housing and accommodation news',
  },

  research: {
    name: 'Research & Statistics',
    keywords: [
      'study shows',
      'research finds',
      'disability statistics',
      'survey results',
      'data analysis',
      'report shows',
    ],
    priority: 'LOW',
    description: 'Disability research and statistics',
  },
};

/**
 * Load curated content from files
 */
function loadCuratedContent() {
  const cwd = process.cwd();
  const curationDir = path.join(cwd, '_curation');
  const items = [];

  if (!fs.existsSync(curationDir)) {
    return items;
  }

  try {
    const files = fs.readdirSync(curationDir);

    // Load most recent file
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

    // Parse markdown items
    const itemMatches = content.matchAll(
      /^\d+\.\s+\*\*\[(.*?)\]\((.*?)\)\*\*\n?([\s\S]*?)(?=^\d+\.|$)/gm
    );

    for (const match of itemMatches) {
      items.push({
        title: match[1] || '',
        url: match[2] || '',
        description: match[3] || '',
        source: latestFile,
      });
    }
  } catch (e) {
    console.error(`[alerts] Error loading curated content: ${e.message}`);
  }

  return items;
}

/**
 * Match content against keyword list
 */
function matchKeywords(item, keywords) {
  const searchText = `${item.title} ${item.description}`.toLowerCase();

  for (const keyword of keywords) {
    if (searchText.includes(keyword.toLowerCase())) {
      return true;
    }
  }

  return false;
}

/**
 * Generate alerts for today's content
 */
function generateAlerts(items, alertDefinitions = DEFAULT_ALERTS) {
  const alerts = {};
  const matchedItems = new Map(); // Track which items matched which alerts

  // Initialize alert objects
  for (const [id, definition] of Object.entries(alertDefinitions)) {
    alerts[id] = {
      id,
      name: definition.name,
      priority: definition.priority,
      description: definition.description,
      matchCount: 0,
      items: [],
    };
    matchedItems.set(id, []);
  }

  // Match items against keywords
  for (const item of items) {
    for (const [alertId, definition] of Object.entries(alertDefinitions)) {
      if (matchKeywords(item, definition.keywords)) {
        alerts[alertId].matchCount++;
        alerts[alertId].items.push(item);

        if (!matchedItems.has(alertId)) {
          matchedItems.set(alertId, []);
        }
        matchedItems.get(alertId).push(item);
      }
    }
  }

  // Remove empty alerts
  for (const [id, alert] of Object.entries(alerts)) {
    if (alert.matchCount === 0) {
      delete alerts[id];
    }
  }

  return alerts;
}

/**
 * Generate alert summary for email
 */
function generateAlertSummary(alerts) {
  let summary = `# Keyword Alerts - ${toISODate(new Date())}\n\n`;

  summary += `## Alert Summary\n\n`;
  summary += `Total alerts: **${Object.keys(alerts).length}**\n`;
  summary += `Total matched items: **${Object.values(alerts).reduce((sum, a) => sum + a.matchCount, 0)}**\n\n`;

  // Sort by priority
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const sortedAlerts = Object.values(alerts).sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  for (const alert of sortedAlerts) {
    summary += `---\n\n`;
    summary += `## ${alert.name} (${alert.priority})\n\n`;
    summary += `${alert.description}\n\n`;
    summary += `**Matched items: ${alert.matchCount}**\n\n`;

    for (const item of alert.items) {
      summary += `### [${item.title}](${item.url})\n`;
      if (item.description) {
        summary += `${item.description}\n`;
      }
      summary += `\n`;
    }
  }

  summary += `---\n\n`;
  summary += `## How to Manage Alerts\n\n`;
  summary += `- **Edit keywords:** Visit [/alerts/settings](/alerts/settings)\n`;
  summary += `- **Subscribe to categories:** Visit [/alerts/subscribe](/alerts/subscribe)\n`;
  summary += `- **View alert history:** Visit [/alerts/history](/alerts/history)\n`;
  summary += `- **Unsubscribe:** Visit [/settings](/settings#notifications)\n`;

  return summary;
}

/**
 * Generate JSON API response
 */
function generateJsonApi(alerts, items) {
  return {
    generated: new Date().toISOString(),
    date: toISODate(new Date()),
    version: '1.0',
    metadata: {
      totalAlerts: Object.keys(alerts).length,
      totalMatchedItems: Object.values(alerts).reduce((sum, a) => sum + a.matchCount, 0),
      totalProcessedItems: items.length,
    },
    alerts: alerts,
    alertDefinitions: DEFAULT_ALERTS,
  };
}

/**
 * Save alerts to files
 */
function saveAlerts(alerts, items) {
  const cwd = process.cwd();
  const publicDir = path.join(cwd, 'public');
  const date = toISODate(new Date());

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Save JSON API
  const jsonPath = path.join(publicDir, `keyword-alerts-${date}.json`);
  const jsonApi = generateJsonApi(alerts, items);

  try {
    fs.writeFileSync(jsonPath, JSON.stringify(jsonApi, null, 2));
    console.log(`[alerts] ✓ JSON API saved to ${jsonPath}`);
  } catch (e) {
    console.error(`[alerts] Failed to save JSON: ${e.message}`);
  }

  // Save markdown summary
  const summaryPath = path.join(publicDir, `keyword-alerts-summary-${date}.md`);
  const summary = generateAlertSummary(alerts);

  try {
    fs.writeFileSync(summaryPath, summary);
    console.log(`[alerts] ✓ Summary saved to ${summaryPath}`);
  } catch (e) {
    console.error(`[alerts] Failed to save summary: ${e.message}`);
  }

  // Update alert history
  const historyPath = path.join(publicDir, 'keyword-alerts-history.json');

  try {
    let history = { entries: [] };

    if (fs.existsSync(historyPath)) {
      try {
        history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      } catch (_) {
        // Initialize if corrupted
        history = { entries: [] };
      }
    }

    // Add entry
    history.entries.push({
      date,
      alertCount: Object.keys(alerts).length,
      matchedItems: Object.values(alerts).reduce((sum, a) => sum + a.matchCount, 0),
    });

    // Keep last 30 days
    history.entries = history.entries.slice(-30);

    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
    console.log(`[alerts] ✓ History updated`);
  } catch (e) {
    console.error(`[alerts] Failed to update history: ${e.message}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('[alerts] Starting keyword alerts generation...\n');

  // Load content
  const items = loadCuratedContent();
  console.log(`[alerts] Loaded ${items.length} curated items`);

  if (items.length === 0) {
    console.log('[alerts] No curated content found');
    return;
  }

  // Generate alerts
  const alerts = generateAlerts(items, DEFAULT_ALERTS);

  if (Object.keys(alerts).length === 0) {
    console.log('[alerts] No alerts triggered today');
    return;
  }

  console.log(`[alerts] Generated ${Object.keys(alerts).length} alerts\n`);

  // Display alert summary
  console.log('[alerts] Alert Breakdown:');
  for (const [id, alert] of Object.entries(alerts)) {
    console.log(`  ${alert.name} (${alert.priority}): ${alert.matchCount} items`);
  }
  console.log('');

  // Save results
  saveAlerts(alerts, items);

  console.log('[alerts] ✓ Complete\n');

  // Print sample alert
  const firstAlert = Object.values(alerts)[0];
  if (firstAlert) {
    console.log('[alerts] Sample alert:');
    console.log(`  Category: ${firstAlert.name}`);
    console.log(`  Priority: ${firstAlert.priority}`);
    console.log(`  Matches: ${firstAlert.matchCount}`);
    if (firstAlert.items[0]) {
      console.log(`  Example: "${firstAlert.items[0].title}"`);
    }
  }
}

main().catch(err => {
  console.error('[alerts] Error:', err.message);
  process.exit(1);
});
