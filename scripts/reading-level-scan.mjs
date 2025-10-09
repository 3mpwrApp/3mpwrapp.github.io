#!/usr/bin/env node
/**
 * reading-level-scan.mjs
 * Quick heuristic readability scan of locale English strings.
 * Reports any sentence with average word length > 6.2 or > 26 words.
 * Not a strict blocker (exit 0) unless --strict passed.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd(), 'locales', 'en', 'common.json');
let strict = process.argv.includes('--strict');

function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') flatten(v, p, out);
    else out[p] = v;
  }
  return out;
}

if (!fs.existsSync(ROOT)) {
  console.error('Missing locales/en/common.json');
  process.exit(strict ? 1 : 0);
}

const data = JSON.parse(fs.readFileSync(ROOT, 'utf8'));
const flat = flatten(data);
const issues = [];
for (const [key, val] of Object.entries(flat)) {
  if (typeof val !== 'string') continue;
  const text = val.replace(/{{[^}]+}}/g, '').replace(/https?:\S+/g, '').trim();
  if (!text) continue;
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) continue;
  const avgLen = words.reduce((a, w) => a + w.length, 0) / words.length;
  if (avgLen > 6.2 || words.length > 26) {
    issues.push({ key, avgLen: avgLen.toFixed(2), words: words.length, sample: text.slice(0, 80) });
  }
}

if (issues.length) {
  console.log('Readability (heuristic) potential improvements:');
  for (const i of issues.slice(0, 200)) {
    console.log(` - ${i.key} words=${i.words} avgLen=${i.avgLen} :: ${i.sample}`);
  }
  console.log(`Total flagged: ${issues.length}`);
  if (strict) process.exit(1);
} else {
  console.log('All strings within heuristic readability thresholds.');
}
