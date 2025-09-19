#!/usr/bin/env node
const fs=require('fs');
const path=require('path');
const SNAP=path.join(__dirname,'..','i18n-untranslated.snapshot.json');
const locales=['es','fr'];
function load(locale){
  const p=path.join(__dirname,'..','locales',locale,'common.json');
  const raw=fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
  return JSON.parse(raw);
}
function flatten(o,prefix='',out={}){for(const [k,v] of Object.entries(o)){const key=prefix?`${prefix}.${k}`:k;if(v&&typeof v==='object'&&!Array.isArray(v))flatten(v,key,out);else out[key]=v;}return out;}
const enFlat=flatten(load('en'));
const current={};
locales.forEach(loc=>{const flat=flatten(load(loc));current[loc]=Object.keys(enFlat).filter(k=>flat[k]===enFlat[k]);});
let previous={};
if(fs.existsSync(SNAP)) previous=JSON.parse(fs.readFileSync(SNAP,'utf8'));
function stats(list){return {count:list.length, sample:list.slice(0,10)};}
locales.forEach(loc=>{
  const prev=previous[loc]||[];const curr=current[loc];
  const improved=prev.filter(k=>!curr.includes(k));
  const regress=curr.filter(k=>!prev.includes(k));
  console.log(`Locale ${loc}: prev=${prev.length} now=${curr.length} improved=${improved.length} regress=${regress.length}`);
  if(improved.length) console.log('  Improved sample:', improved.slice(0,5));
  if(regress.length) console.log('  Regressed sample:', regress.slice(0,5));
});
fs.writeFileSync(SNAP, JSON.stringify(current,null,2)+'\n','utf8');
console.log('Snapshot updated at', SNAP);
