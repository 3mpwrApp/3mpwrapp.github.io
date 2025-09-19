#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
function load(locale){
  const p=path.join(__dirname,'..','locales',locale,'common.json');
  const raw=fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
  return JSON.parse(raw);
}
function flatten(obj,prefix='',out={}){
  for(const [k,v] of Object.entries(obj)){
    const key=prefix?`${prefix}.${k}`:k;
    if(v && typeof v==='object' && !Array.isArray(v)) flatten(v,key,out); else out[key]=v;
  }
  return out;
}
const en=flatten(load('en'));
const locales=['es','fr'];
let rows=['locale,key,en,value,notes'];
locales.forEach(loc=>{
  const flat=flatten(load(loc));
  Object.keys(en).forEach(k=>{
  if(flat[k]===en[k]) rows.push(`${loc},${k},"${en[k].toString().replace(/"/g,'""')}","${flat[k].toString().replace(/"/g,'""')}",""`);
  });
});
const outPath=path.join(__dirname,'..','i18n-untranslated.csv');
fs.writeFileSync(outPath, rows.join('\n'),'utf8');
console.log('Wrote',outPath,'with',rows.length-1,'rows');
const wantsOpen = process.env.I18N_OPEN==='1' || process.argv.includes('--open');
if(wantsOpen){
  const opener = process.platform==='win32' ? 'start' : process.platform==='darwin' ? 'open' : 'xdg-open';
  try{ require('child_process').exec(`${opener} "${outPath}"`); console.log('Opening CSV...'); }catch(e){ console.warn('Could not open file automatically.'); }
}
