#!/usr/bin/env node
const fs=require('fs');
const path=require('path');
const TAG='[T]';
const max=parseInt(process.env.I18N_MAX_UNTRANSLATED||'0',10);
function load(locale){
  const p=path.join(__dirname,'..','locales',locale,'common.json');
  const raw=fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
  return JSON.parse(raw);
}
function flatten(o,prefix='',out={}){for(const [k,v] of Object.entries(o)){const key=prefix?`${prefix}.${k}`:k;if(v&&typeof v==='object'&&!Array.isArray(v))flatten(v,key,out);else out[key]=v;}return out;}
const en=flatten(load('en'));
const locales=['es','fr'];
let untranslated=0;
locales.forEach(loc=>{
  const flat=flatten(load(loc));
  const missing=Object.keys(en).filter(k=>flat[k]===en[k]);
  untranslated+=missing.length;
  console.log(`Locale ${loc}: ${missing.length} untranslated (threshold max ${max})`);
});
console.log('Total untranslated:', untranslated, 'Allowed:', max);
if(untranslated>max){
  console.error('Untranslated count above threshold.');
  process.exitCode=1;
}else{
  console.log('Within threshold.');
}
