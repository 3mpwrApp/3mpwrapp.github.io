#!/usr/bin/env node
const fs=require('fs');
const path=require('path');
const TAG='[T]';
// Support dynamic max via env or incremental baseline file.
const explicitMaxEnv = process.env.I18N_MAX_UNTRANSLATED;
const baselineFile = path.join(__dirname,'..','i18n-baseline.json');
let baseline = { es:0, fr:0 };
try { if (fs.existsSync(baselineFile)) baseline = JSON.parse(fs.readFileSync(baselineFile,'utf8')); } catch{}
// If explicit max provided, use it; otherwise allow counts to stay at or below baseline.
const max = explicitMaxEnv ? parseInt(explicitMaxEnv,10) : (baseline.es + baseline.fr);
const allowTags = process.env.I18N_ALLOW_TAGS === '1';
function load(locale){
  const p=path.join(__dirname,'..','locales',locale,'common.json');
  const raw=fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
  return JSON.parse(raw);
}
function flatten(o,prefix='',out={}){for(const [k,v] of Object.entries(o)){const key=prefix?`${prefix}.${k}`:k;if(v&&typeof v==='object'&&!Array.isArray(v))flatten(v,key,out);else out[key]=v;}return out;}
const en=flatten(load('en'));
const locales=['es','fr'];
let untranslated=0;
const perLocaleCounts = {};
locales.forEach(loc=>{
  const flat=flatten(load(loc));
  const missing=Object.keys(en).filter(k=>flat[k]===en[k]);
  perLocaleCounts[loc]=missing.length;
  untranslated+=missing.length;
  const baselineLoc = baseline[loc] ?? 0;
  const status = missing.length <= baselineLoc ? '≤ baseline' : `+${missing.length-baselineLoc}`;
  console.log(`Locale ${loc}: ${missing.length} untranslated (baseline ${baselineLoc}) ${status}`);
});
console.log('Total untranslated:', untranslated, 'Allowed (max or baseline sum):', max);
const increasing = locales.some(loc => perLocaleCounts[loc] > (baseline[loc] ?? 0));
if(explicitMaxEnv){
  if(untranslated>max){
    console.error('Untranslated count above explicit max.');
    process.exitCode=1;
  } else {
    console.log('Within explicit max constraint.');
  }
} else if(increasing){
  if(allowTags){
    console.warn('Untranslated increased but allowed via I18N_ALLOW_TAGS=1.');
  } else {
    console.error('Untranslated count increased over baseline.');
    process.exitCode=1;
  }
} else {
  console.log('No increase over baseline.');
}

// Allow updating baseline intentionally
if(process.env.I18N_THRESHOLD_UPDATE==='1'){
  const newBaseline = { es: perLocaleCounts.es, fr: perLocaleCounts.fr };
  fs.writeFileSync(baselineFile, JSON.stringify(newBaseline,null,2));
  console.log('Updated i18n baseline:', newBaseline);
}
