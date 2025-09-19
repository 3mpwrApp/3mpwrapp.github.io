#!/usr/bin/env node
/**
 * i18n-plural-check.js
 * Ensures every key with .one has a sibling .other (and vice versa) and that both contain {{count}}.
 * Exits non‑zero on any issues; prints summary.
 */
const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'locales');
const issues = [];

function walk(obj, prefix = '') {
  if (typeof obj !== 'object' || obj == null) return;
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v) walk(v, p);
    else if (typeof v === 'string') {
      // strings handled later by grouping
    }
  }
}

function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v) flatten(v, p, out);
    else out[p] = v;
  }
  return out;
}

function checkFile(locale) {
  const file = path.join(LOCALES_DIR, locale, 'common.json');
  if (!fs.existsSync(file)) return;
  let data;
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) {
    issues.push(`[${locale}] JSON parse error: ${e.message}`);
    return;
  }
  const flat = flatten(data);
  const groups = {};
  for (const key of Object.keys(flat)) {
    if (key.endsWith('.one') || key.endsWith('.other')) {
      const base = key.replace(/\.(one|other)$/,'');
      groups[base] = groups[base] || { one: null, other: null };
      if (key.endsWith('.one')) groups[base].one = flat[key];
      else groups[base].other = flat[key];
    }
  }
  for (const [base, forms] of Object.entries(groups)) {
    if (!forms.one) issues.push(`[${locale}] Missing .one for ${base}`);
    if (!forms.other) issues.push(`[${locale}] Missing .other for ${base}`);
    if (forms.one && !forms.one.includes('{{count}}')) issues.push(`[${locale}] .one missing {{count}} for ${base}`);
    if (forms.other && !forms.other.includes('{{count}}')) issues.push(`[${locale}] .other missing {{count}} for ${base}`);
  }
}

['en','es','fr'].forEach(checkFile);

if (issues.length) {
  console.error('Plural check failed:');
  for (const i of issues) console.error(' -', i);
  process.exit(1);
} else {
  console.log('Plural check passed (all plural forms valid).');
}
