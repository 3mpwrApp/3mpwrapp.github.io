#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, '_posts');
const WHATS_NEW_DIR = path.join(ROOT, '_whats_new');

function listMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(name => name.endsWith('.md'))
    .map(name => path.join(dir, name));
}

function parseFrontMatter(content) {
  if (!content.startsWith('---\n')) return null;
  const end = content.indexOf('\n---\n', 4);
  if (end === -1) return null;
  const raw = content.slice(4, end);
  const lines = raw.split('\n');
  const data = {};
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    data[key] = value;
  }
  return data;
}

function parseArray(value) {
  if (!value) return [];
  const trimmed = value.trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return [];
  return trimmed
    .slice(1, -1)
    .split(',')
    .map(v => v.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, ''))
    .filter(Boolean);
}

function getWeekKey(fileName) {
  const match = fileName.match(/week-(\d+)/i);
  if (!match) return null;
  return match[1].padStart(2, '0');
}

function validatePosts() {
  const violations = [];
  const posts = listMarkdown(POSTS_DIR);
  const weekCounts = new Map();

  for (const file of posts) {
    const content = fs.readFileSync(file, 'utf8');
    const fm = parseFrontMatter(content);
    if (!fm) continue;

    const tags = parseArray(fm.tags);
    const categories = parseArray(fm.categories);
    const lowerFile = path.basename(file).toLowerCase();

    const isCanonicalWeeklyRecap = categories.includes('weekly-recap') || lowerFile.includes('weekly-recap-week-');
    if (isCanonicalWeeklyRecap && !fm.content_type) {
      violations.push(`${path.relative(ROOT, file)}: missing content_type front matter`);
    }

    const isCanonicalDevRecap = (fm.content_type || '').includes('dev-recap');
    const isDevNarrative = lowerFile.includes('dev-update') || lowerFile.includes('dev-diary') || categories.includes('dev-diary-updates');
    if (isCanonicalDevRecap && !tags.includes('weekly')) {
      violations.push(`${path.relative(ROOT, file)}: dev narrative missing weekly tag`);
    }

    if (isCanonicalDevRecap && isDevNarrative && categories.includes('community')) {
      violations.push(`${path.relative(ROOT, file)}: dev narrative routed to community category`);
    }

    const weekKey = getWeekKey(lowerFile);
    if (isCanonicalWeeklyRecap && weekKey) {
      const prev = weekCounts.get(weekKey) || [];
      prev.push(path.relative(ROOT, file));
      weekCounts.set(weekKey, prev);
    }
  }

  for (const [week, files] of weekCounts.entries()) {
    if (files.length > 1) {
      violations.push(`duplicate weekly recap for week ${week}: ${files.join(', ')}`);
    }
  }

  return violations;
}

function validateWhatsNew() {
  const violations = [];
  const files = listMarkdown(WHATS_NEW_DIR);
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const fm = parseFrontMatter(content);
    if (!fm) continue;
    const rel = path.relative(ROOT, file);
    const isStandardWeekFeed = /week-\d+-updates\.md$/i.test(path.basename(file));
    if (isStandardWeekFeed && !fm.content_type) {
      violations.push(`${rel}: missing content_type front matter`);
    }
    if (isStandardWeekFeed && fm.content_type && !fm.content_type.includes('commit-summary')) {
      violations.push(`${rel}: content_type must be commit-summary`);
    }
  }
  return violations;
}

function main() {
  const violations = [
    ...validatePosts(),
    ...validateWhatsNew()
  ];

  if (violations.length > 0) {
    console.error('Validation failed:');
    for (const v of violations) console.error(`- ${v}`);
    process.exit(1);
  }

  console.log('Validation passed: no policy violations found');
}

main();
