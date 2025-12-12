#!/usr/bin/env node
/**
 * Heuristic scan for possible PII or secret fields leaking via analytics or code.
 * Goals:
 *  - Flag analytics event params whose names look sensitive but are not marked sensitive in schema
 *  - Flag string literals / object keys in trackEvent calls suggesting PII
 *  - Flag raw email-like / token-like literals in repo (excluding test + locales + package files)
 *
 * This is intentionally heuristic and low‑false‑negative focused; expect some false positives.
 * Exit codes:
 *   0 = clean
 *   2 = suspicious findings (printed)
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SRC_EXT_RE = /\.(tsx?|jsx?)$/;
const TRACK_EVENT_RE = /trackEvent\(\s*['"]([a-zA-Z0-9_.:-]+)['"]\s*,\s*\{([\s\S]*?)\}\s*\)/g;
const SUSPICIOUS_KEY_RE = /(email|e\-?mail|name|fullName|displayName|address|phone|mobile|dob|birth|ssn|sin|token|secret|password|passcode|auth|session|userId|uid)/i;
const EMAIL_LITERAL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig;
const TOKEN_LITERAL_RE = /(?:Bearer\s+)?[A-Za-z0-9_-]{24,}\.[A-Za-z0-9._-]{10,}/g; // rough JWT / token chunk

function walk(dir, out=[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (['node_modules','.git','.expo','dist','.coverage','docs'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

// Load schema to learn which params are already marked sensitive
let schemaSrc = '';
try { schemaSrc = fs.readFileSync(path.join(ROOT,'services','analyticsEventSchemas.ts'),'utf8'); } catch {}

const EVENT_BLOCK_RE = /ANALYTICS_EVENT_SCHEMAS\s*=\s*\{([\s\S]*?)\n\};/m;
const schemaBlock = EVENT_BLOCK_RE.exec(schemaSrc)?.[1] || '';

// Map event -> { param: { sensitive?: bool } }
const eventParamMeta = {};
const EVENT_ENTRY_RE = /\[E\.[A-Z0-9_]+\]|['"]([a-zA-Z0-9_.:-]+)['"]:\s*\{([\s\S]*?)\n\s*\}/g;
let em;
while ((em = EVENT_ENTRY_RE.exec(schemaBlock))) {
  const rawName = em[0];
  const explicit = em[1];
  const eventName = explicit || null; // E.CONSTANT entries use bracket; we ignore mapping to actual const here
  const body = em[2];
  const PARAM_RE = /(\w+):\s*\{[^}]*?\}/g;
  let pm; const params = {};
  while ((pm = PARAM_RE.exec(body))) {
    const pName = pm[1];
    const slice = pm[0];
    const sensitive = /sensitive:\s*true/.test(slice);
    params[pName] = { sensitive };
  }
  if (eventName) eventParamMeta[eventName] = params;
}

// Normalize relative path to posix for matching
function norm(rel) { return rel.split('\\').join('/'); }

// Whitelist (posix-style) for files allowed to contain illustrative emails / contact literals
const FILE_WHITELIST = [
  'app/(tabs)/about.tsx',
  'app/(tabs)/admin/index.tsx',
  'app/(tabs)/settings.tsx',
  'app/(tabs)/wellness/grief-support.tsx',
  'app/(tabs)/wellness/self-care-library.tsx',
  'components/Header.tsx',
  'data/faqs.ts',
  'data/lawyers.ts',
  'utils/feedback.ts'
].map(p=>p.replace(/\\/g,'/'));

function isWhitelisted(rel) { rel = norm(rel); return FILE_WHITELIST.some(w => rel === w); }

const suspicious = { schema: [], trackEventParams: [], literals: [] };

// Inline suppression support:
//  - // pii-scan-ignore-file  -> skip all per-file heuristics (except schema checks)
//  - // pii-scan-ignore-next-line -> skip findings on the following physical line
function computeSuppressions(text){
  const lines = text.split(/\n/);
  const suppressLine = new Set();
  let fileIgnored = false;
  lines.forEach((l,idx)=>{
    if (/pii-scan-ignore-file/.test(l)) fileIgnored = true;
    if (/pii-scan-ignore-next-line/.test(l)) suppressLine.add(idx+1); // next line index
  });
  return { fileIgnored, suppressLine };
}

// Heuristic 1: schema param names that look sensitive but not marked sensitive
for (const [event, params] of Object.entries(eventParamMeta)) {
  for (const [pName, meta] of Object.entries(params)) {
    if (!meta.sensitive && SUSPICIOUS_KEY_RE.test(pName)) {
      suspicious.schema.push({ event, param: pName, reason: 'Name matches sensitive pattern but not marked sensitive' });
    }
  }
}

// Heuristic 2: scan trackEvent param objects for suspicious keys
for (const file of walk(ROOT)) {
  if (!SRC_EXT_RE.test(file)) continue;
  if (/__tests__/.test(file) || /locales\//.test(file)) continue;
  let text = '';
  try { text = fs.readFileSync(file,'utf8'); } catch { continue; }
  const { fileIgnored, suppressLine } = computeSuppressions(text);
  if (fileIgnored) continue; // skip entire file for heuristics 2+3
  let m; TRACK_EVENT_RE.lastIndex = 0;
  while ((m = TRACK_EVENT_RE.exec(text))) {
    const event = m[1];
    const obj = m[2];
    // Rough parse of keys (not JSON, allow trailing commas)
    const KEY_RE = /(\w+)\s*:/g; let km;
    while ((km = KEY_RE.exec(obj))) {
      const k = km[1];
      if (SUSPICIOUS_KEY_RE.test(k)) {
        const alreadySensitive = eventParamMeta[event]?.[k]?.sensitive;
        if (!alreadySensitive) {
          // Determine line number (rough) for suppression check
          const upto = text.slice(0, m.index + km.index).split(/\n/).length - 1; // 0-based line with key start
          if (!suppressLine.has(upto)) {
            suspicious.trackEventParams.push({ file: path.relative(ROOT,file), event, param: k, reason: 'Suspicious key in trackEvent params literal' });
          }
        }
      }
    }
  }
  // Heuristic 3: literal email / token presence
  const rel = path.relative(ROOT,file);
  if (EMAIL_LITERAL_RE.test(text) && !isWhitelisted(rel)) {
    suspicious.literals.push({ file: rel, kind: 'emailPattern', reason: 'Email-like literal found' });
  }
  if (TOKEN_LITERAL_RE.test(text) && !isWhitelisted(rel)) {
    suspicious.literals.push({ file: rel, kind: 'tokenPattern', reason: 'Token/JWT-like literal found' });
  }
}

function printSection(title, arr, fields) {
  if (!arr.length) return;
  console.log(`\n## ${title}`);
  for (const row of arr) {
    console.log('- ' + fields.map(f=> `${f}=${row[f]}`).join(' '));
  }
}

const totalFindings = suspicious.schema.length + suspicious.trackEventParams.length + suspicious.literals.length;
const soft = process.env.PII_SCAN_SOFT === '1' || process.argv.includes('--soft');
if (totalFindings === 0) {
  console.log('[analytics-pii-scan] No suspicious patterns found.');
  process.exit(0);
} else {
  console.log(`[analytics-pii-scan] Suspicious patterns detected: ${totalFindings}${soft ? ' (soft mode)' : ''}`);
  printSection('Schema Param Flags', suspicious.schema, ['event','param','reason']);
  printSection('trackEvent Param Literal Flags', suspicious.trackEventParams, ['file','event','param','reason']);
  printSection('Literal Pattern Flags', suspicious.literals, ['file','kind','reason']);
  if (!soft) process.exitCode = 2; else process.exitCode = 0;
}
