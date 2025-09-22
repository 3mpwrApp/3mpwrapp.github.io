#!/usr/bin/env node
/**
 * i18n-seed-missing.js
 * Scans referenced i18n keys (t()/tCount()) and ensures they exist in en/common.json.
 * Adds placeholder values in the format "[T] <key>" for any missing keys.
 * Does NOT touch existing values.
 */
const fs = require('fs');
const path = require('path');

const EN_FILE = path.join(__dirname,'..','locales','en','common.json');
const SRC_DIRS = ['app','components','context','hooks','services','store'];

function loadJSON(file){
  const raw = fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'');
  return JSON.parse(raw);
}

function saveJSON(file,obj){
  const text = JSON.stringify(obj,null,2) + '\n';
  fs.writeFileSync(file,text,'utf8');
}

function ensurePath(obj, parts, value){
  let cur = obj;
  for(let i=0;i<parts.length;i++){
    const p = parts[i];
    if(i === parts.length - 1){
      if(cur[p] === undefined){
        cur[p] = value;
      }
    } else {
      if(typeof cur[p] !== 'object' || Array.isArray(cur[p])) cur[p] = {};
      cur = cur[p];
    }
  }
}

function scanFile(file, referenced){
  const code = fs.readFileSync(file,'utf8');
  const regex = /\b(t|tCount)\(\s*['"]([a-zA-Z0-9_.]+)['"]/g;
  let m; while((m = regex.exec(code))){ referenced.add(m[2]); }
}

function walk(dir, referenced){
  for(const entry of fs.readdirSync(dir)){
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if(stat.isDirectory()) walk(full, referenced);
    else if(/\.(tsx?|jsx?)$/.test(entry)) scanFile(full, referenced);
  }
}

const referenced = new Set();
SRC_DIRS.forEach(d => walk(path.join(__dirname,'..',d), referenced));

const en = loadJSON(EN_FILE);

// Flatten existing keys for quick existence check
function flatten(obj,prefix='',out={}){
  for(const [k,v] of Object.entries(obj)){
    const key = prefix?`${prefix}.${k}`:k;
    if(v && typeof v === 'object' && !Array.isArray(v)) flatten(v,key,out); else out[key]=true;
  }
  return out;
}
const existing = flatten(en);

const added = [];
for(const key of referenced){
  if(existing[key]) continue; // already present
  // If a parent object already exists we can safely create nested path
  ensurePath(en, key.split('.'), `[T] ${key}`);
  added.push(key);
}

if(added.length){
  saveJSON(EN_FILE,en);
  console.log(`Added ${added.length} placeholder keys to en/common.json`);
  added.slice(0,30).forEach(k=>console.log('  +',k));
  if(added.length>30) console.log(`  ... and ${added.length-30} more`);
} else {
  console.log('No missing keys to add.');
}
