#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function load(locale){
  const file = path.join(__dirname,'..','locales',locale,'common.json');
  const raw = fs.readFileSync(file,'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}
function flatten(obj,prefix='',out={}){
  Object.entries(obj).forEach(([k,v])=>{
    const key = prefix?`${prefix}.${k}`:k;
    if(v && typeof v==='object' && !Array.isArray(v)) flatten(v,key,out); else out[key]=v;
  });
  return out;
}
const en = flatten(load('en'));
['es','fr'].forEach(loc => {
  const flat = flatten(load(loc));
  const identical = Object.keys(en).filter(k => flat[k] === en[k]);
  console.log(`\nLocale ${loc}: ${identical.length} untranslated keys (exact matches)`);
  identical.slice(0,100).forEach(k=>console.log('  -',k));
  if(identical.length>100) console.log(`  ...and ${identical.length-100} more`);
});
