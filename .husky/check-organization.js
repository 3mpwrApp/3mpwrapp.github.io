#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const ALLOWED_NEW_ROOT_FILES = new Set([
  'README.md',
  'index.md',
  '404.md',
  '404.html',
  '_config.yml',
  '_headers',
  '_redirects',
  '_routes.json',
  'CNAME',
  'package.json',
  'package-lock.json',
  '.gitignore',
  '.gitattributes',
]);

const ALLOWED_ROOT_SCRIPTS = new Set([
  'scrape-onlrb-comprehensive-2020-2026.js',
]);

const ROOT_TEMP_RE = /(^temp[-._]|\.tmp$|\.bak$|\.backup$|\.log$)/i;

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    if (!output) return [];
    return output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function checkFile(relPath) {
  const issues = [];
  const fileName = path.posix.basename(relPath);
  const isRootFile = !relPath.includes('/');

  if (isRootFile && ROOT_TEMP_RE.test(fileName)) {
    issues.push('Temporary file in root is not allowed');
  }

  if (isRootFile) {
    const isDotFile = fileName.startsWith('.');
    if (!isDotFile && !ALLOWED_NEW_ROOT_FILES.has(fileName)) {
      if (/\.(md|txt|log)$/i.test(fileName)) {
        issues.push('New root docs/logs are not allowed; place docs under docs/ or the feature folder');
      }
    }
  }

  if (relPath.startsWith('scripts/')) {
    const parts = relPath.split('/');
    if (parts.length === 2) {
      if (!ALLOWED_ROOT_SCRIPTS.has(fileName)) {
        issues.push('New scripts must be under scripts/<category>/ instead of scripts/ root');
      }
    }
  }

  return issues;
}

function main() {
  const staged = getStagedFiles();
  if (staged.length === 0) {
    console.log('organization-check: no staged files');
    return;
  }

  const violations = [];
  for (const relPath of staged) {
    const issues = checkFile(relPath);
    for (const issue of issues) {
      violations.push({ relPath, issue });
    }
  }

  if (violations.length) {
    console.error('\n✗ Organization check failed:\n');
    for (const violation of violations) {
      console.error(`- ${violation.relPath}: ${violation.issue}`);
    }
    console.error('\nMove files into organized folders, re-stage, and commit again.');
    process.exit(1);
  }

  console.log('✓ organization-check: passed');
}

main();
