#!/usr/bin/env node
/**
 * Guard script: disallow new direct imports of logEvent from services/analytics outside that file itself.
 * Rationale: all callers must route through analyticsClient.trackEvent for schema validation & registry enforcement.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const ALLOWED_FILE = path.join(ROOT, 'services', 'analytics.ts').replace(/\\/g,'/');
let violations = [];

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules','.git','.expo'].includes(e.name)) continue;
      scan(full);
    } else if (/\.(tsx?|jsx?)$/.test(e.name)) {
      const rel = full.replace(ROOT+path.sep,'').replace(/\\/g,'/');
      const text = fs.readFileSync(full,'utf8');
      if (/from ['"].*services\/?analytics['"];?/.test(text) || /require\(['"].*services\/?analytics['"]\)/.test(text)) {
        if (full.replace(/\\/g,'/') !== ALLOWED_FILE) {
          if (/logEvent\s*\(/.test(text) || /{\s*logEvent\s*}/.test(text)) {
            violations.push(rel);
          }
        }
      }
    }
  }
}

scan(ROOT);

if (violations.length) {
  console.error('\n[analytics-guard] Disallowed direct logEvent usage detected in:');
  for (const v of violations) console.error('  -', v);
  console.error('\nUse trackEvent(...) from services/analyticsClient instead.');
  process.exit(1);
} else {
  console.log('[analytics-guard] OK (no direct logEvent imports)');
}
