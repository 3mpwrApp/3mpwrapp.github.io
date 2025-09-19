#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function flatten(obj, prefix = '', out = {}) {
  Object.entries(obj).forEach(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out); else out[key] = true;
  });
  return out;
}

function load(locale) {
  const file = path.join(__dirname, '..', 'locales', locale, 'common.json');
  const raw = fs.readFileSync(file, 'utf8');
  const cleaned = raw.replace(/^\uFEFF/, '');
  return JSON.parse(cleaned);
}

const en = flatten(load('en'));
const locales = ['es','fr'];
let missingOverall = 0;

locales.forEach(loc => {
  const data = flatten(load(loc));
  const missing = Object.keys(en).filter(k => !data[k]);
  console.log(`\nLocale ${loc}: missing ${missing.length} keys`);
  missing.slice(0, 50).forEach(k => console.log('  -', k));
  if (missing.length > 50) console.log(`  ... and ${missing.length - 50} more`);
  missingOverall += missing.length;
});

if (missingOverall > 0) {
  console.log(`\nTotal missing across locales: ${missingOverall}`);
  process.exitCode = 1;
} else {
  console.log('\nAll locale keys are in sync.');
}
