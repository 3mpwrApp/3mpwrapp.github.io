#!/usr/bin/env node
/**
 * i18n-lint-keys.js
 * Enforces naming conventions:
 *  - lowercase letters, numbers, dots as hierarchy separators
 *  - segments use [a-z0-9-]+ (kebab within segment allowed)
 *  - no consecutive dots, no leading/trailing dots
 *  - discourage very long keys (>80 chars)
 * Fails (exit 1) on violations; prints summary.
 */
const fs = require('fs');
const path = require('path');

const EN_FILE = path.join(__dirname,'..','locales','en','common.json');

function flatten(o,prefix='',out={}){for(const [k,v] of Object.entries(o)){const key=prefix?`${prefix}.${k}`:k;if(v&&typeof v==='object'&&!Array.isArray(v))flatten(v,key,out);else out[key]=v;}return out;}

const data = JSON.parse(fs.readFileSync(EN_FILE,'utf8'));
const keys = Object.keys(flatten(data));

const BAD = [];
const SEGMENT_RE = /^[a-z0-9-]+$/;

for(const k of keys){
  if(k.length>80) BAD.push({key:k, reason:'too-long'});
  if(k.startsWith('.')||k.endsWith('.')||k.includes('..')) BAD.push({key:k, reason:'dot-structure'});
  const segments = k.split('.');
  if(segments.some(s=>!SEGMENT_RE.test(s))) BAD.push({key:k, reason:'segment-format'});
  if(/^[A-Z]/.test(k)) BAD.push({key:k, reason:'capital-letter'});
  if(/\s/.test(k)) BAD.push({key:k, reason:'whitespace'});
}

if(BAD.length){
  console.error(`✖ i18n key lint failed (${BAD.length} issue(s))`);
  BAD.slice(0,100).forEach(b=> console.error(` - ${b.key} [${b.reason}]`));
  if(BAD.length>100) console.error(` ... +${BAD.length-100} more`);
  process.exit(1);
} else {
  console.log('✓ i18n key naming clean');
}
