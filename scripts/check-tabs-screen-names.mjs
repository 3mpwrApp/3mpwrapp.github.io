#!/usr/bin/env node
/**
 * Advisory pre-commit check: Warn if any newly added or modified lines introduce
 * a <Tabs.Screen name=".../..."> pattern (slash in name) which violates our route conventions.
 *
 * Behavior: prints a yellow warning and exit 0 (non-blocking). Devs can still commit.
 * Scope: Looks at staged changes only. Requires git in PATH.
 */

import { spawnSync } from 'node:child_process';

function run(cmd, args) {
  const res = spawnSync(cmd, args, { encoding: 'utf8' });
  if (res.error) throw res.error;
  return { code: res.status ?? 0, stdout: res.stdout || '', stderr: res.stderr || '' };
}

// Get staged diff for TSX/TS files likely to contain Tabs config
const diff = run('git', ['diff', '--cached', '--unified=0', '--', '*.tsx', 'app/(tabs)/**', 'app/**/_layout.tsx']);
if (diff.code !== 0) {
  // Silently ignore if git diff failed (rare), don't block commits
  process.exit(0);
}

const addedLines = diff.stdout
  .split('\n')
  .filter((l) => l.startsWith('+') && !l.startsWith('+++'))
  .map((l) => l.slice(1));

const offenders = [];
const tabsNameSlash = /<\s*Tabs\.Screen\b[^>]*\bname\s*=\s*"[^"]*\/[^"]*"/;
for (const line of addedLines) {
  if (tabsNameSlash.test(line)) {
    offenders.push(line.trim());
  }
}

if (offenders.length) {
  const y = (s) => `\x1b[33m${s}\x1b[0m`; // yellow
  const b = (s) => `\x1b[1m${s}\x1b[0m`; // bold
  console.log(
    y(
      `⚠ Tabs.Screen names should not include a '/' (use group segment names, not 'segment/index').\n` +
        `See README.md → Route Conventions (Expo Router).\n`
    )
  );
  console.log(b('Examples to fix:'));
  for (const ex of offenders.slice(0, 5)) {
    console.log('  ' + ex);
  }
  if (offenders.length > 5) {
    console.log(`  …and ${offenders.length - 5} more`);
  }
}

// Always succeed (advisory only)
process.exit(0);
