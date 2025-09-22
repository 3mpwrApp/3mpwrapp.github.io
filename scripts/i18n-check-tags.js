#!/usr/bin/env node
const fs=require('fs');
const path=require('path');
const TAG='[T]';
const allowTags = process.env.I18N_ALLOW_TAGS === '1';
function load(locale){
  const p=path.join(__dirname,'..','locales',locale,'common.json');
  const raw=fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
  return JSON.parse(raw);
}
function flatten(o,prefix='',out={}){for(const [k,v] of Object.entries(o)){const key=prefix?`${prefix}.${k}`:k;if(v&&typeof v==='object'&&!Array.isArray(v))flatten(v,key,out);else out[key]=v;}return out;}
const locales=['es','fr'];
let taggedTotal=0;
locales.forEach(loc=>{
  const flat=flatten(load(loc));
  const tagged=Object.entries(flat).filter(([,v])=>typeof v==='string'&&v.startsWith(TAG));
  taggedTotal+=tagged.length;
  console.log(`Locale ${loc}: ${tagged.length} tagged`);
  tagged.slice(0,50).forEach(([k])=>console.log('  -',k));
  if(tagged.length>50) console.log(`  ...and ${tagged.length-50} more`);
});
if(taggedTotal>0){
  console.log(`Total tagged: ${taggedTotal}`);
  if(!allowTags){
    process.exitCode=1;
  } else {
    console.warn('Tags present but allowed via I18N_ALLOW_TAGS=1');
  }
} else {
  console.log('No tagged strings found.');
}
