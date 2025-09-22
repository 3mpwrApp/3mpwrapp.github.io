#!/usr/bin/env node
/**
 * Copies any keys present in en/common.json but missing in es/fr into those locale files.
 * If English value starts with "[T]" we use the same. Otherwise we prefix with "[T]" to mark pending translation.
 */
const fs = require('fs');
const path = require('path');
const LOCALES = ['es','fr'];
const EN_FILE = path.join(__dirname,'..','locales','en','common.json');

function load(file){
  return JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
}
function save(file,obj){
  fs.writeFileSync(file, JSON.stringify(obj,null,2)+'\n','utf8');
}
function flatten(obj,prefix='',out={}){
  for(const [k,v] of Object.entries(obj)){
    const key = prefix?`${prefix}.${k}`:k;
    if(v && typeof v === 'object' && !Array.isArray(v)) flatten(v,key,out); else out[key]=v;
  }
  return out;
}
function ensurePath(obj, parts, value){
  let cur=obj; for(let i=0;i<parts.length;i++){ const p=parts[i]; if(i===parts.length-1){ if(cur[p]===undefined) cur[p]=value; } else { if(typeof cur[p] !== 'object' || Array.isArray(cur[p])) cur[p]={}; cur=cur[p]; } }
}

const en = load(EN_FILE);
const enFlat = flatten(en);

LOCALES.forEach(loc => {
  const file = path.join(__dirname,'..','locales',loc,'common.json');
  const data = load(file);
  const dataFlat = flatten(data);
  const added = [];
  for(const [k,v] of Object.entries(enFlat)){
    if(dataFlat[k] !== undefined) continue; // already present
    if(typeof v !== 'string'){
      // create container path lazily by ensuring each segment when children encountered later
      ensurePath(data, k.split('.'), {}); // will be overwritten by children
      continue;
    }
    const placeholder = v.startsWith('[T]') ? v : `[T] ${v}`;
    ensurePath(data, k.split('.'), placeholder);
    added.push(k);
  }
  if(added.length){
    save(file,data);
    console.log(`${loc}: added ${added.length} placeholder keys`);
  } else {
    console.log(`${loc}: no additions`);
  }
});