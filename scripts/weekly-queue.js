#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const QUEUE_PATH = path.join(DATA_DIR, 'weekly-queue.json');
const ARCHIVE_DIR = path.join(DATA_DIR, 'weekly-queue-archive');

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ARCHIVE_DIR)) fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
}

function currentIsoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-${String(week).padStart(2, '0')}`;
}

function defaultQueue() {
  return {
    week: currentIsoWeek(),
    generated: new Date().toISOString(),
    processed: false,
    commits: []
  };
}

function readQueue() {
  ensureDirs();
  if (!fs.existsSync(QUEUE_PATH)) {
    const seed = defaultQueue();
    fs.writeFileSync(QUEUE_PATH, JSON.stringify(seed, null, 2) + '\n', 'utf8');
    return seed;
  }
  const raw = fs.readFileSync(QUEUE_PATH, 'utf8');
  return JSON.parse(raw);
}

function writeQueue(queue) {
  ensureDirs();
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n', 'utf8');
}

function inferCategory(message) {
  const lower = (message || '').toLowerCase();
  if (lower.startsWith('feat')) return 'feature';
  if (lower.startsWith('fix')) return 'fix';
  if (lower.startsWith('docs')) return 'docs';
  if (lower.startsWith('refactor') || lower.startsWith('perf')) return 'improvement';
  return 'system';
}

function inferImpactTags(message) {
  const lower = (message || '').toLowerCase();
  const tags = [];
  if (/(accessibility|a11y|contrast|screen reader)/.test(lower)) tags.push('accessibility');
  if (/(wsiat|wsib|hrto|onsbt|onwsiat|appeal|tribunal|legal)/.test(lower)) tags.push('legal-workplace');
  if (/(ux|ui|readability|navigation|link|plain language)/.test(lower)) tags.push('ux');
  if (/(fix|stability|error|crash|deploy|workflow|reliability)/.test(lower)) tags.push('stability');
  if (/(advocacy|community|workers|disability|support)/.test(lower)) tags.push('advocacy');
  return tags;
}

function sanitizeMessage(message) {
  return (message || '')
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[\u2600-\u27BF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function appendCommits(commits) {
  const queue = readQueue();
  const week = currentIsoWeek();
  if (queue.week !== week) {
    archiveQueue(queue.week);
    queue.week = week;
    queue.generated = new Date().toISOString();
    queue.processed = false;
    queue.commits = [];
  }

  const existing = new Set(queue.commits.map(c => c.sha));
  for (const commit of commits) {
    if (!commit || !commit.sha || existing.has(commit.sha)) continue;
    const message = sanitizeMessage(commit.message);
    queue.commits.push({
      sha: commit.sha,
      date: commit.date || new Date().toISOString(),
      message,
      files: Array.isArray(commit.files) ? commit.files : [],
      category: commit.category || inferCategory(message),
      impactTags: Array.isArray(commit.impactTags) ? commit.impactTags : inferImpactTags(message)
    });
    existing.add(commit.sha);
  }

  writeQueue(queue);
  return queue;
}

function archiveQueue(week) {
  ensureDirs();
  const queue = fs.existsSync(QUEUE_PATH) ? JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8')) : defaultQueue();
  const targetWeek = week || queue.week || currentIsoWeek();
  const archivePath = path.join(ARCHIVE_DIR, `${targetWeek}.json`);
  fs.writeFileSync(archivePath, JSON.stringify(queue, null, 2) + '\n', 'utf8');
  return archivePath;
}

function clearQueue() {
  const fresh = defaultQueue();
  writeQueue(fresh);
  return fresh;
}

module.exports = {
  QUEUE_PATH,
  ARCHIVE_DIR,
  readQueue,
  writeQueue,
  appendCommits,
  archiveQueue,
  clearQueue,
  currentIsoWeek,
  inferCategory,
  inferImpactTags,
  sanitizeMessage
};
