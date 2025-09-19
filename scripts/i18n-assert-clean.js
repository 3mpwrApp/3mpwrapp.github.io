#!/usr/bin/env node
const fs=require('fs');
const path=require('path');
const TAG='[T]';
function load(locale){
  const p=path.join(__dirname,'..','locales',locale,'common.json');
  const raw=fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
  return JSON.parse(raw);
}
function flatten(o,prefix='',out={}){for(const [k,v] of Object.entries(o)){const key=prefix?`${prefix}.${k}`:k;if(v&&typeof v==='object'&&!Array.isArray(v))flatten(v,key,out);else out[key]=v;}return out;}
let has=false;['es','fr'].forEach(loc=>{const flat=flatten(load(loc));Object.entries(flat).forEach(([k,v])=>{if(typeof v==='string'&&v.startsWith(TAG)){console.error(`Tagged untranslated key remains: ${loc}:${k}`);has=true;}});});
if(has){process.exitCode=1;console.error('Failing: tagged untranslated strings present.');} else {console.log('All locales clean (no [T] tags).');}
