#!/usr/bin/env node
/**
 * Generates a markdown report summarizing analytics event usage.
 * Intended for CI artifact publication & PR diffing.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const OUT_PATH = path.join(ROOT, 'docs', 'analytics-report.md');
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

let registry = [];
try {
  const jsonPath = path.join(ROOT,'data','analytics-events.json');
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const obj = JSON.parse(raw);
  registry = Object.values(obj);
} catch {
  // Fallback: extract from TS file if JSON not present
  try {
    const registryPath = path.join(ROOT,'services','analyticsEvents.ts');
    const registrySrc = fs.readFileSync(registryPath,'utf8');
    const regMatches = [...registrySrc.matchAll(/"([a-zA-Z0-9_.:-]+)"/g)].map(m=>m[1]);
    registry = regMatches.filter(e=>/[_\.]/.test(e));
  } catch {}
}

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
const ranked = [...eventCounts.entries()].sort((a,b)=> b[1]-a[1]);
const totalEmissions = [...eventCounts.values()].reduce((a,b)=>a+b,0);

// Derive category counts (prefix before first dot or full event if none)
function categorize(name){ const idx = name.indexOf('.'); return idx>0 ? name.slice(0,idx) : name; }
const categoryCounts = {};
for (const ev of new Set([...registry, ...usedEvents])) {
  const cat = categorize(ev);
  categoryCounts[cat] = (categoryCounts[cat]||0)+1;
}

const lines = [];
lines.push('# Analytics Event Report');
lines.push('');
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push('');
lines.push('## Summary');
lines.push('');
lines.push(`- Registry events: ${registry.length}`);
lines.push(`- Unique events referenced in code: ${usedEvents.length}`);
lines.push(`- Total literal emissions (static scan): ${totalEmissions}`);
lines.push(`- Missing (used not registered): ${missing.length}`);
lines.push(`- Unused (registered not used): ${unused.length}`);
// Sensitive fields quick heuristic (reuse simple parse logic)
let sensitiveCount = 0;
try {
  const schemaSrc = fs.readFileSync(path.join(ROOT,'services','analyticsEventSchemas.ts'),'utf8');
  sensitiveCount = (schemaSrc.match(/sensitive:\s*true/g)||[]).length;
} catch {}
lines.push(`- Sensitive field occurrences (schema): ${sensitiveCount}`);
// Classification breakdown (pii/secret/token/other)
try {
  const schemaSrc2 = fs.readFileSync(path.join(ROOT,'services','analyticsEventSchemas.ts'),'utf8');
  const classMatches = [...schemaSrc2.matchAll(/classification:\s*'([a-zA-Z]+)'/g)].map(m=>m[1]);
  const classCounts = classMatches.reduce((acc,c)=>{acc[c]=(acc[c]||0)+1;return acc;},{});
  if (Object.keys(classCounts).length) {
    lines.push(`- Classification counts: ${Object.entries(classCounts).map(([k,v])=>`${k}=${v}`).join(', ')}`);
  }
} catch {}
lines.push('');
if (missing.length) {
  lines.push('### Missing');
  lines.push('');
  for (const e of missing) lines.push(`- ${e}`);
  lines.push('');
}
if (unused.length) {
  lines.push('### Unused');
  lines.push('');
  for (const e of unused) lines.push(`- ${e}`);
  lines.push('');
}
lines.push('## Categories');
lines.push('');
lines.push('| Category | Events |');
lines.push('|----------|-------:|');
for (const [cat,count] of Object.entries(categoryCounts).sort((a,b)=> a[0].localeCompare(b[0]))) {
  lines.push(`| ${cat} | ${count} |`);
}
lines.push('');
lines.push('## Event Usage');
lines.push('');
lines.push('| Event | Count | Status |');
lines.push('|-------|------:|--------|');
for (const [name,count] of ranked) {
  const status = missing.includes(name)? 'MISSING' : unused.includes(name)? 'UNUSED' : 'OK';
  lines.push(`| ${name} | ${count} | ${status} |`);
}
if (!ranked.length) lines.push('| (none) | 0 | - |');
// Append simple sensitive listing (event -> fields)
try {
  const { getSensitiveFields, getSensitiveFieldMeta } = await import('../services/analyticsEventSchemas.ts');
  const sens = getSensitiveFields();
  const entries = Object.entries(sens);
  if (entries.length) {
    lines.push('');
    lines.push('## Sensitive Fields');
    lines.push('');
    lines.push('| Event | Fields |');
    lines.push('|-------|--------|');
    for (const [ev, fields] of entries) lines.push(`| ${ev} | ${fields.join(', ')} |`);
    // Detailed classification table
    const meta = getSensitiveFieldMeta();
    const metaEntries = Object.entries(meta);
    if (metaEntries.length) {
      lines.push('');
      lines.push('### Sensitive Field Classification');
      lines.push('');
      lines.push('| Event | Field | Classification |');
      lines.push('|-------|-------|----------------|');
      for (const [ev, rows] of metaEntries) {
        for (const r of rows) {
          lines.push(`| ${ev} | ${r.field} | ${r.classification||''} |`);
        }
      }
    }
  }
} catch {}

// Ensure docs dir
fs.mkdirSync(path.join(ROOT,'docs'), { recursive: true });
fs.writeFileSync(OUT_PATH, lines.join('\n') + '\n');

console.log(`[analytics-report] Wrote ${OUT_PATH}`);
if (missing.length) {
  console.warn('[analytics-report] Missing events detected (report generated, exit code 2)');
  process.exitCode = 2;
}