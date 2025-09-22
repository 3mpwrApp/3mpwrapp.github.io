#!/usr/bin/env node
/**
 * i18n-report-missing.js
 * Reports runtime-referenced i18n keys (t()/tCount()) that are NOT present in en/common.json.
 * Unlike i18n-orphans (which also lists unused/orphans), this focuses purely on missing coverage.
 * Exits with code 1 if any missing keys are detected.
 */
const fs = require('fs');
const path = require('path');

const SRC_DIRS = ['app','components','context','hooks','services','store'];
const EN_FILE = path.join(__dirname,'..','locales','en','common.json');

function flatten(obj,prefix='',out={}){
  for(const [k,v] of Object.entries(obj)){
    const key = prefix?`${prefix}.${k}`:k;
    if(v && typeof v === 'object' && !Array.isArray(v)) flatten(v,key,out); else out[key]=true;
  }
  return out;
}

const en = JSON.parse(fs.readFileSync(EN_FILE,'utf8'));
const enFlat = flatten(en);

const referenced = new Set();

function scanFile(file){
  const code = fs.readFileSync(file,'utf8');
  // capture t('x.y'), t("x.y"), tCount('x.y') base keys
  const regex = /\b(t|tCount)\(\s*['"]([a-zA-Z0-9_.]+)['"]/g;
  let m; while((m=regex.exec(code))){ referenced.add(m[2]); }
}

function walk(dir){
  for(const entry of fs.readdirSync(dir)){
    const full = path.join(dir,entry);
    const stat = fs.statSync(full);
    if(stat.isDirectory()) walk(full); else if(/\.(tsx?|jsx?)$/.test(entry)) scanFile(full);
  }
}
SRC_DIRS.forEach(d=>walk(path.join(__dirname,'..',d)));

// Determine referenced keys missing from en (allow referencing plural base if .one/.other exist)
const missing = [];
for(const key of referenced){
  if(enFlat[key]) continue; // exact key exists
  // if base referenced but plural forms exist treat as covered
  const hasPlural = enFlat[`${key}.one`] || enFlat[`${key}.other`];
  if(hasPlural) continue;
  // if any child exists under key treat as covered
  const childExists = Object.keys(enFlat).some(k=>k.startsWith(key+'.'));
  if(childExists) continue;
  missing.push(key);
}

missing.sort();
if(missing.length){
  console.log(`Missing i18n keys (not in en/common.json): ${missing.length}`);
  missing.forEach(k=>console.log('  -',k));
  if(!process.env.I18N_REPORT_ALLOW_MISSING){
    process.exitCode = 1;
  } else {
    console.log('Bypass active: not failing due to I18N_REPORT_ALLOW_MISSING');
  }
} else {
  console.log('All referenced i18n keys are present in en/common.json');
}
