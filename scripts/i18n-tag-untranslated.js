#!/usr/bin/env node
const fs=require('fs');
const path=require('path');
const TAG='[T]';
function load(locale){
  const file=path.join(__dirname,'..','locales',locale,'common.json');
  const raw=fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'');
  return {file,json:JSON.parse(raw)};
}
function walk(en,node){
  for(const k of Object.keys(en)){
    if(en[k] && typeof en[k]==='object' && !Array.isArray(en[k])){
      if(!node[k]||typeof node[k]!=='object') node[k]={};
      walk(en[k], node[k]);
    } else {
      if(node[k]===en[k] && !node[k].startsWith(TAG)) node[k]=TAG+node[k];
    }
  }
}
const en=load('en');
['es','fr'].forEach(loc=>{
  const l=load(loc);
  walk(en.json, l.json);
  fs.writeFileSync(l.file, JSON.stringify(l.json,null,2)+'\n','utf8');
  console.log('Tagged untranslated in', loc);
});
