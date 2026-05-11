#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  appendCommits,
  readQueue,
  inferCategory,
  inferImpactTags,
  sanitizeMessage
} = require('./weekly-queue');

const ROOT = process.cwd();
const WHATS_NEW_DIR = path.join(ROOT, '_whats_new');

function isoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

function mondayForIsoWeek(year, week) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);
  const monday = new Date(week1Monday);
  monday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
  return monday;
}

function toDateString(d) {
  return d.toISOString().split('T')[0];
}

function loadPushCommits() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) return [];

  const payload = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const commits = payload.commits || [];
  return commits
    .filter(c => c && c.id && c.message)
    .filter(c => !/(^merge\b|\[skip ci\])/i.test(c.message))
    .map(c => ({
      sha: c.id,
      date: c.timestamp,
      message: sanitizeMessage(c.message),
      files: [...(c.added || []), ...(c.modified || []), ...(c.removed || [])],
      category: inferCategory(c.message),
      impactTags: inferImpactTags(c.message)
    }));
}

function topItems(items, n) {
  return items.slice(0, n).map(i => `- ${i.message}`);
}

function buildWhatsNewContent(queue, week, year, date) {
  const commits = queue.commits || [];
  const feature = commits.filter(c => c.category === 'feature');
  const fixes = commits.filter(c => c.category === 'fix');
  const improvements = commits.filter(c => c.category === 'improvement');
  const docs = commits.filter(c => c.category === 'docs');
  const system = commits.filter(c => c.category === 'system');

  const lines = [];
  lines.push('---');
  lines.push('layout: whats_new');
  lines.push(`title: Week ${week} Updates (${year})`);
  lines.push(`date: ${date}`);
  lines.push('content_type: commit-summary');
  lines.push(`week: ${week}`);
  lines.push('---');
  lines.push('');
  lines.push('## This Week in Brief');
  lines.push('');
  lines.push(`This week includes ${commits.length} tracked system updates. The list below summarizes the most important changes in plain language.`);
  lines.push('');

  if (feature.length) {
    lines.push('## New Features');
    lines.push('');
    lines.push(...topItems(feature, 10));
    lines.push('');
  }

  if (improvements.length) {
    lines.push('## Improvements');
    lines.push('');
    lines.push(...topItems(improvements, 10));
    lines.push('');
  }

  if (fixes.length) {
    lines.push('## Fixes');
    lines.push('');
    lines.push(...topItems(fixes, 12));
    lines.push('');
  }

  if (docs.length) {
    lines.push('## Documentation');
    lines.push('');
    lines.push(...topItems(docs, 8));
    lines.push('');
  }

  if (system.length) {
    lines.push('## System Operations');
    lines.push('');
    lines.push(...topItems(system, 8));
    lines.push('');
  }

  lines.push('## Where To Read The Weekly Narrative');
  lines.push('');
  lines.push('The human-readable development summary is published in the weekly recap section: [/blog/#weekly-recaps](/blog/#weekly-recaps).');
  lines.push('');

  return lines.join('\n') + '\n';
}

function writeWhatsNewFromQueue() {
  const queue = readQueue();
  const now = new Date();
  const wk = isoWeek(now);
  const monday = mondayForIsoWeek(wk.year, wk.week);
  const date = toDateString(monday);

  if (!fs.existsSync(WHATS_NEW_DIR)) fs.mkdirSync(WHATS_NEW_DIR, { recursive: true });

  const fileName = `${date}-week-${wk.week}-updates.md`;
  const filePath = path.join(WHATS_NEW_DIR, fileName);
  const content = buildWhatsNewContent(queue, wk.week, wk.year, date);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${path.relative(ROOT, filePath)}`);
}

function main() {
  const commits = loadPushCommits();
  if (!commits.length) {
    console.log('No eligible commits found in push payload');
    return;
  }

  appendCommits(commits);
  writeWhatsNewFromQueue();
}

main();
