#!/usr/bin/env node
/**
 * Fails if any *.test.ts file appears to contain JSX.
 * Heuristic: looks for lines with `<[A-Z]` or `</[A-Z]` outside of comments.
 */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
let failed = false;

function scanFile(file) {
  const content = fs.readFileSync(file,'utf8');
  const lines = content.split(/\r?\n/);
  const offenders = [];
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    if (/<\/?[A-Z][A-Za-z0-9_]*/.test(line)) {
      offenders.push({ line: idx+1, text: line });
    }
  });
  if (offenders.length) {
    console.error(`\n[check-jsx-tests] JSX detected in .ts test: ${path.relative(root,file)}`);
    offenders.slice(0,5).forEach(o => console.error(`  Line ${o.line}: ${o.text.trim()}`));
    failed = true;
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full);
    } else if (/\.test\.ts$/.test(entry)) {
      scanFile(full);
    }
  }
}

walk(path.join(root,'__tests__'));

if (failed) {
  console.error('\n[check-jsx-tests] Failing due to JSX in .test.ts file(s). Use .tsx instead.');
  process.exit(1);
} else {
  console.log('[check-jsx-tests] OK: no JSX found in .test.ts files');
}
