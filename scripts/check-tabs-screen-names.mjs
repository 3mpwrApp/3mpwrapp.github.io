#!/usr/bin/env node
/**
 * Tabs.Screen name guard
 * - Default (advisory): warn if newly added/modified lines introduce <Tabs.Screen name=".../..."> (slash in name)
 * - Strict (--strict or CHECK_TABS_STRICT=1): scan repo for violations and FAIL if any found
 *
 * Conventions: Tabs names must be group segment names only (no 'segment/index').
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const y = (s) => `\x1b[33m${s}\x1b[0m`; // yellow
const r = (s) => `\x1b[31m${s}\x1b[0m`; // red
const b = (s) => `\x1b[1m${s}\x1b[0m`; // bold

const STRICT = process.argv.includes('--strict') || process.env.CHECK_TABS_STRICT === '1';

function run(cmd, args) {
  const res = spawnSync(cmd, args, { encoding: 'utf8' });
  if (res.error) throw res.error;
  return { code: res.status ?? 0, stdout: res.stdout || '', stderr: res.stderr || '' };
}

const tabsNameSlash = /<\s*Tabs\.Screen\b[^>]*\bname\s*=\s*("[^"]*\/[^"]*"|'[^']*\/[^']*'|`[^`]*\/[^`]*`)/;

if (!STRICT) {
  // Advisory mode: look at staged changes only
  const diff = run('git', ['diff', '--cached', '--unified=0', '--', '*.tsx', 'app/(tabs)/**', 'app/**/_layout.tsx']);
  if (diff.code !== 0) process.exit(0); // don't block commit if diff fails

  const addedLines = diff.stdout
    .split('\n')
    .filter((l) => l.startsWith('+') && !l.startsWith('+++'))
    .map((l) => l.slice(1));

  const offenders = [];
  for (const line of addedLines) {
    if (tabsNameSlash.test(line)) offenders.push(line.trim());
  }

  if (offenders.length) {
    console.log(
      y(
        `⚠ Tabs.Screen names should not include a '/' (use group segment names, not 'segment/index').\n` +
          `See README.md → Route Conventions (Expo Router).\n`
      )
    );
    console.log(b('Examples to fix:'));
    for (const ex of offenders.slice(0, 5)) console.log('  ' + ex);
    if (offenders.length > 5) console.log(`  …and ${offenders.length - 5} more`);
  }
  process.exit(0);
}

// Strict mode: scan the repo files and fail if any violations are found
const ROOT = process.cwd();
const EXT_RE = /\.(tsx?)$/;
const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.expo', 'dist', '.coverage']);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue;
    if (EXCLUDE_DIRS.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(ROOT).filter((f) => EXT_RE.test(f));
const violations = [];
for (const f of files) {
  try {
    const txt = fs.readFileSync(f, 'utf8');
    if (tabsNameSlash.test(txt)) {
      // Try to capture the first offending line for quick reference
      const line = txt.split(/\r?\n/).find((l) => tabsNameSlash.test(l));
      violations.push({ file: path.relative(ROOT, f), line: (line || '').trim() });
    }
  } catch {}
}

if (violations.length) {
  console.error(
    r(
      `✗ Router conventions violation: <Tabs.Screen name> must not include '/'.\n` +
        `Use group segment names only (no 'segment/index'). See docs/ROUTE_MAP.md.\n`
    )
  );
  for (const v of violations.slice(0, 20)) {
    console.error(`  - ${v.file}`);
    if (v.line) console.error(`      ${v.line}`);
  }
  if (violations.length > 20) console.error(`  …and ${violations.length - 20} more`);
  process.exit(2);
}

console.log('✓ Router conventions (Tabs.Screen names) OK');
process.exit(0);
