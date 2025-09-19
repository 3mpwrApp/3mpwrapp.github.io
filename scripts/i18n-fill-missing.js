#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function load(locale){
  const file = path.join(__dirname,'..','locales',locale,'common.json');
  const raw = fs.readFileSync(file,'utf8').replace(/^\uFEFF/, '');
  return {file, data: JSON.parse(raw)};
}
function write(file,data){
  fs.writeFileSync(file, JSON.stringify(data, null, 2)+"\n","utf8");
}
function merge(target, source){
  for(const k of Object.keys(source)){
    if(source[k] && typeof source[k]==='object' && !Array.isArray(source[k])){
      if(!target[k] || typeof target[k] !== 'object') target[k] = {};
      merge(target[k], source[k]);
    } else {
      if(!(k in target)) target[k] = source[k];
    }
  }
  return target;
}

const en = load('en');
['es','fr'].forEach(loc => {
  const locale = load(loc);
  merge(locale.data, en.data);
  write(locale.file, locale.data);
  console.log(`Filled missing keys for ${loc}`);
});
console.log('Done.');