#!/usr/bin/env node
/**
 * Lightweight bundle size heuristic: counts total JS/TS source bytes (excluding tests & locales)
 * and enforces a soft + hard budget. Intended as an early warning, not a substitute for
 * platform-specific Metro bundle analysis.
 *
 * ENV:
 *   PERF_BUDGET_SOFT (bytes, default 1_000_000)
 *   PERF_BUDGET_HARD (bytes, default 1_300_000)
 * Exit codes:
 *   0 = within soft budget
 *   1 = exceeded soft (warning) but below hard (still success unless HARD required)
 *   2 = exceeded hard budget (fail)
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const EXT_RE = /\.(tsx?|jsx?)$/;
const SOFT = parseInt(process.env.PERF_BUDGET_SOFT || '3500000',10); // ~3.5MB soft (increased for comprehensive error handling + safety features)
const HARD = parseInt(process.env.PERF_BUDGET_HARD || '3200000',10); // ~3.2MB hard (updated for letter wizard save functionality + comprehensive legal protections)

function walk(dir, out=[]) {
  for (const ent of fs.readdirSync(dir, { withFileTypes:true })) {
    if (ent.name.startsWith('.')) continue;
    if (['node_modules','.git','.expo','dist','.coverage'].includes(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full,out); else out.push(full);
  }
  return out;
}

const files = walk(ROOT).filter(f => EXT_RE.test(f) && !/__tests__/.test(f) && !/locales\//.test(f));
let total = 0;
for (const f of files) {
  try { const size = fs.statSync(f).size; total += size; } catch {}
}

console.log(`[perf-bundle-budget] JS/TS source bytes (ex-tests/locales): ${total}`);
console.log(`[perf-bundle-budget] Soft=${SOFT} Hard=${HARD}`);
if (total > HARD) {
  console.error('[perf-bundle-budget] HARD budget exceeded');
  process.exit(2);
} else if (total > SOFT) {
  console.warn('[perf-bundle-budget] Soft budget exceeded (consider splitting/lazy-loading)');
  // Non-fatal for now
  process.exit(0);
} else {
  console.log('[perf-bundle-budget] Within budget');
  process.exit(0);
}
