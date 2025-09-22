#!/usr/bin/env node
const fs=require('fs');
const path=require('path');
const TAG='[T]';
const allowTags = process.env.I18N_ALLOW_TAGS === '1';

function load(locale){
  const p=path.join(__dirname,'..','locales',locale,'common.json');
  const raw=fs.readFileSync(p,'utf8').replace(/^[\uFEFF]/,'');
  return JSON.parse(raw);
}
function flatten(o,prefix='',out={}){for(const [k,v] of Object.entries(o)){const key=prefix?`${prefix}.${k}`:k;if(v&&typeof v==='object'&&!Array.isArray(v))flatten(v,key,out);else out[key]=v;}return out;}

let tagged = [];
['es','fr'].forEach(loc=>{
  const flat=flatten(load(loc));
  Object.entries(flat).forEach(([k,v])=>{
    if(typeof v==='string'&&v.startsWith(TAG)) tagged.push({loc,key:k});
  });
});

if(tagged.length===0){
  console.log('All locales clean (no [T] tags).');
} else if(allowTags){
  console.warn(`I18N_ALLOW_TAGS=1 -> allowing ${tagged.length} tagged strings (will fail once gating tightens).`);
} else {
  tagged.slice(0,100).forEach(t=>console.error(`Tagged untranslated key remains: ${t.loc}:${t.key}`));
  if(tagged.length>100) console.error(`...and ${tagged.length-100} more`);
  console.error('Failing: tagged untranslated strings present. (Set I18N_ALLOW_TAGS=1 temporarily to bypass)');
  process.exitCode=1;
}
