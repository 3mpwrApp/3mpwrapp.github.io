#!/usr/bin/env node
/**
 * Enforce a max source file size to prevent accidental bloat.
 * Scans JS/TS/TSX/JSX files (excluding tests and locales) and fails if any file exceeds MAX_BYTES.
 *
 * ENV:
 *   PERF_MAX_FILE_BYTES (default 35000 ~34KB)
 *   PERF_MAX_ALLOW (comma-separated regex fragments to ignore paths)
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const EXT_RE = /\.(tsx?|jsx?)$/;
const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.expo', 'dist', '.coverage']);
const MAX_BYTES = parseInt(process.env.PERF_MAX_FILE_BYTES || '35000', 10);
const allow = (process.env.PERF_MAX_ALLOW || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowRe = allow.length ? new RegExp(allow.join('|')) : null;

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

const files = walk(ROOT).filter(
  (f) => EXT_RE.test(f) && !/__tests__/.test(f) && !/locales\//.test(f)
);

const offenders = [];
for (const f of files) {
  if (allowRe && allowRe.test(f)) continue;
  try {
    const size = fs.statSync(f).size;
    if (size > MAX_BYTES) offenders.push({ file: path.relative(ROOT, f), size });
  } catch {}
}

if (offenders.length) {
  console.error(
    `✗ perf-max-file-size: ${offenders.length} file(s) exceed ${MAX_BYTES} bytes. ` +
      `Consider splitting components, code-splitting, or moving data out of source.`
  );
  offenders.sort((a, b) => b.size - a.size);
  for (const o of offenders.slice(0, 25)) {
    console.error(`  - ${o.size} bytes  ${o.file.replace(/\\/g, '/')}`);
  }
  if (offenders.length > 25) console.error(`  …and ${offenders.length - 25} more`);
  process.exit(2);
}

console.log(`✓ perf-max-file-size: all files ≤ ${MAX_BYTES} bytes`);
process.exit(0);
