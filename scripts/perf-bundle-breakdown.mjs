#!/usr/bin/env node
/**
 * Provides a ranked breakdown of the largest JS/TS source files (excluding tests & locales).
 * Useful for targeting bundle size optimizations before enforcing tighter budgets.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const EXT_RE = /\.(tsx?|jsx?)$/;
const EXCLUDE_DIRS = new Set(['node_modules','.git','.expo','dist','.coverage']);

function walk(dir, out=[]) {
  for (const ent of fs.readdirSync(dir,{withFileTypes:true})) {
    if (ent.name.startsWith('.')) continue;
    if (EXCLUDE_DIRS.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full,out); else out.push(full);
  }
  return out;
}

const files = walk(ROOT).filter(f => EXT_RE.test(f) && !/__tests__/.test(f) && !/locales\//.test(f));
const stats = [];
let total = 0;
for (const f of files) {
  try { const size = fs.statSync(f).size; stats.push({ file: path.relative(ROOT,f), size }); total += size; } catch {}
}
stats.sort((a,b)=> b.size - a.size);

const topN = parseInt(process.env.PERF_BREAKDOWN_TOP || '25',10);
console.log(`[perf-bundle-breakdown] Total source bytes considered: ${total}`);
console.log(`[perf-bundle-breakdown] Top ${topN} largest files:`);
console.log('| Rank | Size (bytes) | % of Total | File |');
console.log('|------|-------------:|-----------:|------|');
stats.slice(0, topN).forEach((s,i)=>{
  const pct = total ? ((s.size/total)*100).toFixed(2) : '0.00';
  console.log(`| ${i+1} | ${s.size} | ${pct}% | ${s.file.replace(/\\/g,'/')} |`);
});

// Optional JSON output for tooling
if (process.env.PERF_BREAKDOWN_JSON) {
  const out = { total, top: stats.slice(0, topN) };
  fs.writeFileSync(process.env.PERF_BREAKDOWN_JSON, JSON.stringify(out,null,2));
  console.log(`[perf-bundle-breakdown] Wrote JSON -> ${process.env.PERF_BREAKDOWN_JSON}`);
}
