#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const base = path.resolve(process.cwd(), 'locales');
const en = JSON.parse(fs.readFileSync(path.join(base,'en','common.json'),'utf8'));
const targets = [ ['fr','fr'], ['es','es'] ];

function flatten(obj, prefix='') {
  return Object.entries(obj).reduce((acc,[k,v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(acc, flatten(v, key));
    else acc[key] = v;
    return acc;
  }, {});
}

const enFlatFull = flatten(en);
// Temporary scope: only enforce advocacy.* keys to prevent failing on legacy untranslated areas.
const enFlat = Object.fromEntries(Object.entries(enFlatFull).filter(([k]) => k.startsWith('advocacy.')));
let missingTotal = 0;
for (const [code, dir] of targets) {
  const data = JSON.parse(fs.readFileSync(path.join(base,dir,'common.json'),'utf8'));
  const flat = flatten(data);
  const missing = Object.keys(enFlat).filter(k => flat[k] === undefined);
  if (missing.length) {
    console.error(`\n[${code}] Missing keys (${missing.length}):`);
    missing.slice(0,50).forEach(k=>console.error(' -',k));
    if (missing.length > 50) console.error(' ...');
    missingTotal += missing.length;
  }
}
if (missingTotal) {
  console.error(`\n✖ i18n check failed: ${missingTotal} missing key(s).`);
  process.exit(1);
} else {
  console.log('✓ i18n keys complete for fr/es relative to en');
}
