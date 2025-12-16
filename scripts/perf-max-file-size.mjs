#!/usr/bin/env node
/**
 * Enforce a max source file size to prevent accidental bloat.
 * Scans JS/TS/TSX/JSX files (excluding tests and locales) and fails if any file exceeds MAX_BYTES.
 *
 * ENV:
 *   PERF_MAX_FILE_BYTES (default 35000 ~34KB)
 *   PERF_MAX_ALLOW (comma-separated regex fragments to ignore paths, overrides default)
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const EXT_RE = /\.(tsx?|jsx?)$/;
const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.expo', 'dist', '.coverage']);
const MAX_BYTES = parseInt(process.env.PERF_MAX_FILE_BYTES || '35000', 10);

// Default allowlist for known large files that are acceptable
const DEFAULT_ALLOW = [
  'components.*Content\\.tsx',
  'LegalWorkflowEngine\\.tsx',
  'campaign-coordinator\\.tsx',
  'advanced-security\\.tsx',
  'campaign-coordinator\\.impl\\.tsx',
  'advanced-security\\.impl\\.tsx',
  'onboarding\\.tsx',
  'settings.*index\\.tsx',
  'events.*index\\.impl\\.tsx',
  'self-care-library.*\\.tsx',
  'daily-planner.*\\.tsx',
  'master-tracker-hub\\.tsx',
  'energy-hub\\.tsx',
  'circadianRhythmDJ\\.ts',
  'denial-decoder\\.tsx',
  'research-library\\.ts',
  'wellnessFeatureUpgrades.*\\.ts',
  'rights-checker\\.tsx',
  'cognitiveDistortionScanner\\.ts',
  'wellnessAIOrchestrator\\.ts',
  'allyship-playbook\\.tsx',
  'solidarity-toolkit\\.tsx',
  'functionalCapacityEvaluator\\.ts',
  'policy-simulator\\.tsx',
  'claims-navigator\\.tsx',
  'profile-editor\\.tsx',
  'profile.*editor\\.tsx',
  'case-timeline\\.tsx',
  'rtw-planner\\.tsx',
  'emotionalWeatherStation\\.ts',
  'campaigns.*index\\.tsx',
  'spoonEconomist\\.ts',
  'energy-mood-dashboard\\.tsx',
  'circadian-dj\\.tsx',
  'aiGroundingCompanion\\.ts',
  'TermsGate\\.tsx',
  'health-tracker-pro\\.tsx', // Unified Health Hub - consolidates 7 health tracking features
  'financial-safety-net\\.tsx', // Includes comprehensive poverty resources & mutual aid guide
];

const envAllow = process.env.PERF_MAX_ALLOW || '';
const allow = envAllow
  ? envAllow.split(',').map((s) => s.trim()).filter(Boolean)
  : DEFAULT_ALLOW;
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
