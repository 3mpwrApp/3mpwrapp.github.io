#!/usr/bin/env node
const fs=require('fs');
const path=require('path');
const TAG='[T]';
function load(locale){
  const file=path.join(__dirname,'..','locales',locale,'common.json');
  const raw=fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'');
  return {file,json:JSON.parse(raw)};
}
function strip(node){
  for(const k of Object.keys(node)){
    if(node[k] && typeof node[k]==='object' && !Array.isArray(node[k])) strip(node[k]);
    else if(typeof node[k]==='string' && node[k].startsWith(TAG)) node[k]=node[k].slice(TAG.length);
  }
}
['es','fr'].forEach(loc=>{
  const l=load(loc);
  strip(l.json);
  fs.writeFileSync(l.file, JSON.stringify(l.json,null,2)+'\n','utf8');
  console.log('Stripped tags in', loc);
});
