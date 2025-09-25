#!/usr/bin/env node
/**
 * Human-friendly analytics scan report.
 * Scans source for trackEvent("<literal>") usages and compares to registry.
 * Outputs:
 *  - Summary counts
 *  - Missing in registry
 *  - Unused registry entries
 *  - Per-event occurrence counts
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SRC_EXT_RE = /\.(tsx?|jsx?)$/;
const EVENT_REGEX = /trackEvent\(\s*['"]([a-zA-Z0-9_.:-]+)['"]/g;

function walk(dir, out=[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (['node_modules','.git','.expo','dist','.coverage'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (SRC_EXT_RE.test(entry.name) && !/__tests__/.test(full)) out.push(full);
  }
  return out;
}

// Load registry
const registryPath = path.join(ROOT,'services','analyticsEvents.ts');
const registrySrc = fs.readFileSync(registryPath,'utf8');
const regMatches = [...registrySrc.matchAll(/"([a-zA-Z0-9_.:-]+)"/g)].map(m=>m[1]);
// crude filter to only those with at least one underscore or dot consistent with event naming
const registry = regMatches.filter(e=>/[_\.]/.test(e));

const eventCounts = new Map();
for (const file of walk(ROOT)) {
  const text = fs.readFileSync(file,'utf8');
  let m; EVENT_REGEX.lastIndex = 0;
  while ((m = EVENT_REGEX.exec(text))) {
    const name = m[1];
    eventCounts.set(name, (eventCounts.get(name)||0)+1);
  }
}

const usedEvents = [...eventCounts.keys()];
const missing = usedEvents.filter(e => !registry.includes(e));
const unused = registry.filter(e => !eventCounts.has(e));

// Sort counts desc
const ranked = [...eventCounts.entries()].sort((a,b)=> b[1]-a[1]);

function pct(part,total){return total? (part/total*100).toFixed(1):'0.0';}

const totalEmissions = [...eventCounts.values()].reduce((a,b)=>a+b,0);

console.log('\nAnalytics Scan Report');
console.log('====================');
console.log(`Files scanned: ${walk(ROOT).length}`);
console.log(`Unique events referenced: ${usedEvents.length}`);
console.log(`Total literal emissions (static analysis): ${totalEmissions}`);
console.log(`Registry events: ${registry.length}`);
console.log(`Coverage: ${(100 - (missing.length/ (usedEvents.length||1))*100).toFixed(1)}% (usage present in registry)`);

if (missing.length) {
  console.log('\nMissing (used but not in registry):');
  for (const e of missing) console.log('  -', e);
}
if (unused.length) {
  console.log('\nUnused (in registry, not found in code):');
  for (const e of unused) console.log('  -', e);
}

console.log('\nEvent Usage (descending count):');
for (const [name,count] of ranked) {
  const status = missing.includes(name)? 'MISSING' : unused.includes(name)? 'UNUSED' : 'OK';
  console.log(`  ${name.padEnd(32)} ${String(count).padStart(3)}  ${status}`);
}

if (missing.length) process.exitCode = 2; // non-fatal but signal for CI optional gating
