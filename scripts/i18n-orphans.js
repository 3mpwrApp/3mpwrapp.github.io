#!/usr/bin/env node
/**
 * i18n-orphans.js
 * Scans code for t('...') and tCount('...') usages and reports:
 *  - Missing keys (referenced but not in en/common.json)
 *  - Orphan keys (exist in en/common.json but never referenced)
 */
const fs = require('fs');
const path = require('path');

const SRC_DIRS = ['app','components','context','hooks','services','store'];
const EN_FILE = path.join(__dirname,'..','locales','en','common.json');

function flatten(o,prefix='',out={}){for(const [k,v] of Object.entries(o)){const key=prefix?`${prefix}.${k}`:k;if(v&&typeof v==='object'&&!Array.isArray(v))flatten(v,key,out);else out[key]=v;}return out;}
const en = JSON.parse(fs.readFileSync(EN_FILE,'utf8'));
const enFlat = Object.keys(flatten(en));

const used = new Set();
const missing = new Set();

function scanFile(file){
  const code = fs.readFileSync(file,'utf8');
  // match t('a.b.c') or t("a.b.c") and tCount('a.b.c',
  const regex = /\b(t|tCount)\(\s*['\"]([a-zA-Z0-9_.]+)['\"]/g;
  let m; while((m=regex.exec(code))){
    const key = m[2];
    // For plural base we store base, keys in dict include .one/.other so just mark base
    if(key.includes('.one')||key.includes('.other')) used.add(key); else used.add(key);
    if(!enFlat.some(k=>k===key || k.startsWith(key+'.'))) missing.add(key);
  }
}

function walk(dir){
  for(const entry of fs.readdirSync(dir)){
    const p = path.join(dir,entry);
    const stat = fs.statSync(p);
    if(stat.isDirectory()) walk(p);
    else if(/\.(tsx?|jsx?)$/.test(entry)) scanFile(p);
  }
}
SRC_DIRS.forEach(d=>walk(path.join(__dirname,'..',d)));

// Orphans: keys in en that have no usage (ignoring containers that have nested usage)
const orphans = enFlat.filter(k=>{
  // skip plural children if base used
  if(k.endsWith('.one')||k.endsWith('.other')){
    const base = k.replace(/\.(one|other)$/,'');
    if(used.has(base)) return false;
  }
  // If any usage is a parent of this key, consider used
  for(const u of used){ if(k===u || k.startsWith(u+'.')) return false; }
  return true;
});

if(missing.size){
  console.log('Missing referenced keys:');
  missing.forEach(k=>console.log('  -',k));
}
if(orphans.length){
  console.log('Potential orphan keys (never referenced):');
  orphans.slice(0,100).forEach(k=>console.log('  -',k));
  if(orphans.length>100) console.log(`  ... +${orphans.length-100} more`);
}
if(!missing.size && !orphans.length){
  console.log('No missing or orphan keys detected.');
}

if(missing.size) process.exitCode = 1; // warn as non-zero exit
