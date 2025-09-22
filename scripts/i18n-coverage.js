#!/usr/bin/env node
/**
 * i18n-coverage.js
 * Produces a consolidated coverage report:
 *  - Total keys in en
 *  - Missing count per locale
 *  - Percentage coverage per locale
 *  - Referenced keys (runtime) vs defined ratio
 */
const fs = require('fs');
const path = require('path');

const LOCALES = ['en','es','fr'];
const SRC_DIRS = ['app','components','context','hooks','services','store'];

function load(locale){
  const file = path.join(__dirname,'..','locales',locale,'common.json');
  const raw = fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'');
  return JSON.parse(raw);
}
function flatten(obj,prefix='',out={}){
  for(const [k,v] of Object.entries(obj)){
    const key = prefix?`${prefix}.${k}`:k;
    if(v && typeof v === 'object' && !Array.isArray(v)) flatten(v,key,out); else out[key]=v;
  }
  return out;
}

const dicts = Object.fromEntries(LOCALES.map(l=>[l, flatten(load(l))]));
const enKeys = Object.keys(dicts.en);

// Determine missing
const summary = {};
for(const loc of LOCALES.filter(l=>l!=='en')){
  const missing = enKeys.filter(k=>!(k in dicts[loc]));
  summary[loc] = { missingCount: missing.length, coverage: ((enKeys.length - missing.length)/enKeys.length*100).toFixed(2), missing: missing.slice(0,50) };
}

// Scan runtime referenced keys
const referenced = new Set();
function scanFile(file){
  const code = fs.readFileSync(file,'utf8');
  const regex = /\b(t|tCount)\(\s*['"]([a-zA-Z0-9_.]+)['"]/g;
  let m; while((m=regex.exec(code))){ referenced.add(m[2]); }
}
function walk(dir){
  for(const e of fs.readdirSync(dir)){
    const full = path.join(dir,e);
    const st = fs.statSync(full);
    if(st.isDirectory()) walk(full); else if(/\.(tsx?|jsx?)$/.test(e)) scanFile(full);
  }
}
SRC_DIRS.forEach(d=>walk(path.join(__dirname,'..',d)));

// Compute referenced coverage ratio against en definitions
const refArray = Array.from(referenced);
let refMissing = refArray.filter(k=>!enKeys.includes(k) && !enKeys.some(ek=>ek.startsWith(k+'.')));

console.log('i18n Coverage Report');
console.log('====================');
console.log(`Total base (en) keys: ${enKeys.length}`);
for(const loc of Object.keys(summary)){
  const s = summary[loc];
  console.log(`\nLocale ${loc}:`);
  console.log(`  Coverage: ${s.coverage}%`);
  console.log(`  Missing: ${s.missingCount}`);
  if(s.missing.length) console.log('  Sample missing:', s.missing.join(', '));
}
console.log('\nRuntime referenced keys:', refArray.length);
console.log('Referenced keys missing from en:', refMissing.length);
if(refMissing.length) refMissing.slice(0,50).forEach(k=>console.log('  -',k));
if(refMissing.length) process.exitCode = 1;
