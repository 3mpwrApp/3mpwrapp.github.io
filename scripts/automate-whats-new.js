#!/usr/bin/env node

/**
 * Whats New Automation
 * 
 * Automatically promotes top curated items to the _whats_new/ collection
 * and generates weekly recaps combining What's New with curated highlights.
 * 
 * Runs:
 * - Daily: Promotes best items to _whats_new/
 * - Weekly (Fridays): Generates comprehensive weekly recap
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

function httpsGet(url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout')));
  });
}

function toISODate(d) {
  return d.toISOString().split('T')[0];
}

// Load curation data
function loadCuration() {
  try {
    const file = path.join(process.cwd(), 'public', 'curation-latest.json');
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (e) {
    console.warn('[whats-new] Could not load curation file:', e.message);
  }
  return null;
}

// Load existing whats-new posts
function loadExistingWhatsNew() {
  const dir = path.join(process.cwd(), '_whats_new');
  if (!fs.existsSync(dir)) return [];
  
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => ({
      filename: f,
      date: f.split('-').slice(0, 3).join('-')
    }));
}

// Generate What's New post from curated item
function generateWhatsNewPost(item, idx, totalItems) {
  const now = new Date();
  const dateStr = toISODate(now);
  
  // Create unique title
  const title = `${item.title}`.slice(0, 60);
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40);
  
  const filename = `${dateStr}-${idx}-${slug}.md`;
  const filepath = path.join(process.cwd(), '_whats_new', filename);
  
  // Check if already exists
  if (fs.existsSync(filepath)) {
    return null;
  }
  
  // Build post content
  const frontmatter = [
    '---',
    'layout: post',
    `title: "${title}"`,
    `date: ${dateStr}T09:00:00+00:00`,
    'tags: [whats-new, curated]',
    'categories: [news, updates]',
    `excerpt: "${item.description ? item.description.slice(0, 100).replace(/"/g, '\\"') : 'Featured update'}"`,
    '---',
    '',
  ];
  
  const body = [
    item.description ? `${item.description}\n` : 'See the full story:',
    '',
    `**Source:** ${item.source}`,
    `**Score:** ${item.score}`,
    '',
    item.link ? `[Read full article →](${item.link})` : '',
    '',
  ];
  
  const content = [...frontmatter, ...body].join('\n');
  
  try {
    fs.mkdirSync(path.join(process.cwd(), '_whats_new'), { recursive: true });
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`[whats-new] Created: ${filename}`);
    return { filename, title, score: item.score };
  } catch (e) {
    console.error(`[whats-new] Failed to create ${filename}:`, e.message);
    return null;
  }
}

// Generate weekly recap post
function generateWeeklyRecap() {
  const now = new Date();
  const dateStr = toISODate(now);
  
  // Check if already exists for this week
  const weekFile = path.join(process.cwd(), '_posts', `${dateStr}-weekly-recap.md`);
  if (fs.existsSync(weekFile)) {
    console.log('[weekly-recap] Recap already exists for this week, skipping');
    return null;
  }
  
  const curation = loadCuration();
  if (!curation || !curation.items || curation.items.length === 0) {
    console.log('[weekly-recap] No curated items available for recap');
    return null;
  }
  
  // Load recent what's-new posts
  const whatsNew = loadExistingWhatsNew();
  const thisWeekWhatsNew = whatsNew.filter(w => {
    const d = new Date(w.date + 'T00:00:00Z');
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  });
  
  // Build recap content
  const lines = [
    '---',
    'layout: post',
    `title: "Weekly Recap - ${dateStr}: Disability Rights & Worker Protections"`,
    `date: ${dateStr}T09:00:00+00:00`,
    'tags: [weekly, recap, highlights]',
    'categories: [community, news]',
    `excerpt: "Weekly roundup of disability rights, worker protection, and accessibility updates from across Canada"`,
    '---',
    '',
    `## 📅 Week of ${dateStr}`,
    '',
    'Your weekly recap of the most important disability rights, workers\' compensation, and accessibility news from across Canada.',
    '',
  ];
  
  // What's New section
  if (thisWeekWhatsNew.length > 0) {
    lines.push('## 🎯 What\'s New');
    lines.push(`We published ${thisWeekWhatsNew.length} new updates this week:`);
    lines.push('');
    for (const w of thisWeekWhatsNew.slice(0, 5)) {
      lines.push(`- [${w.filename.slice(11, -3)}](/whats-new/${w.filename.slice(0, -3)})`);
    }
    lines.push('');
  }
  
  // Top curated items
  lines.push('## 📰 Top Curated News');
  lines.push('The highest-scored items from our curated feeds this week:');
  lines.push('');
  
  const topItems = curation.items.slice(0, 10);
  for (const item of topItems) {
    const scoreEmoji = item.score >= 15 ? '🔥' : item.score >= 10 ? '⭐' : '📌';
    lines.push(`### ${scoreEmoji} ${item.title}`);
    lines.push(`**Score:** ${item.score} | **Source:** ${item.source}`);
    if (item.description) {
      lines.push(`${item.description.slice(0, 200)}...`);
    }
    if (item.link) {
      lines.push(`[Read full article →](${item.link})`);
    }
    lines.push('');
  }
  
  // Statistics
  lines.push('## 📊 This Week\'s Statistics');
  lines.push(`- Total items curated: ${curation.items.length}`);
  lines.push(`- Updates published: ${thisWeekWhatsNew.length}`);
  lines.push(`- Top score: ${topItems[0] ? topItems[0].score : 'N/A'}`);
  lines.push(`- Average score: ${(curation.items.reduce((s, i) => s + i.score, 0) / curation.items.length).toFixed(1)}`);
  lines.push('');
  
  // Categories
  const categories = {};
  for (const item of curation.items) {
    const cat = item.contentType || 'OTHER';
    categories[cat] = (categories[cat] || 0) + 1;
  }
  lines.push('## 📂 Categories');
  for (const [cat, count] of Object.entries(categories)) {
    lines.push(`- ${cat}: ${count} items`);
  }
  lines.push('');
  
  // Call to action
  lines.push('---');
  lines.push('');
  lines.push('**Subscribe** to get weekly recaps delivered to your inbox. [Subscribe to our newsletter →](/newsletter)');
  lines.push('');
  lines.push('**Visit** our [What\'s New section →](/whats-new) for all updates.');
  lines.push('');
  
  const content = lines.join('\n');
  
  try {
    fs.mkdirSync(path.join(process.cwd(), '_posts'), { recursive: true });
    fs.writeFileSync(weekFile, content, 'utf8');
    console.log(`[weekly-recap] Created: ${weekFile}`);
    return { filename: `${dateStr}-weekly-recap.md`, items: curation.items.length };
  } catch (e) {
    console.error('[weekly-recap] Failed to create recap:', e.message);
    return null;
  }
}

async function main() {
  console.log('[whats-new-automation] Starting...');
  
  const debug = process.env.DEBUG_WHATS_NEW === '1';
  const forceWeekly = process.env.FORCE_WEEKLY === '1';
  
  const curation = loadCuration();
  if (!curation || !curation.items) {
    console.log('[whats-new-automation] No curation data available, exiting');
    process.exit(0);
  }
  
  // Promote top items to What's New
  console.log('[whats-new-automation] Processing top curated items...');
  const promoted = [];
  for (let i = 0; i < Math.min(3, curation.items.length); i++) {
    const result = generateWhatsNewPost(curation.items[i], i + 1, curation.items.length);
    if (result) promoted.push(result);
  }
  
  if (promoted.length > 0) {
    console.log(`[whats-new-automation] ✓ Promoted ${promoted.length} items to What's New`);
  }
  
  // Check if it's Friday or force weekly generation
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const isFriday = dayOfWeek === 5;
  
  if (isFriday || forceWeekly) {
    console.log('[whats-new-automation] Generating weekly recap...');
    const recap = generateWeeklyRecap();
    if (recap) {
      console.log(`[whats-new-automation] ✓ Generated weekly recap with ${recap.items} items`);
    }
  }
  
  console.log('[whats-new-automation] Complete');
}

main().catch(err => {
  console.error('[whats-new-automation] Error:', err.message);
  process.exit(1);
});
